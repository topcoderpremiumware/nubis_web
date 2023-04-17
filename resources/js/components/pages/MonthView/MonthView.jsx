import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css";
import i18next from 'i18next'
import './MonthView.scss'
import AreasSelect from '../DayView/toppanel/select/AreasSelect';
import eventBus from '../../../eventBus';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {useTranslation} from "react-i18next";

const MonthView = () => {
  const {t} = useTranslation();

  const [events, setEvents] = useState([])
  const [reservationDate, setReservationDate] = useState(new Date())
  const [localizer, setLocalizer] = useState(momentLocalizer(moment))

  useEffect(() => {
    getEvents()
    eventBus.on("areaChanged", (data) => {
      getEvents()
    })
    eventBus.on("placeChanged", (data) => {
      getEvents()
    })
    eventBus.on("langChanged", (data) => {
      getEvents()
    })
  }, [])

  useEffect(() => {
    getEvents()
  }, [reservationDate])

  const getEvents = async () => {
    moment.locale(i18next.language);
    setLocalizer(momentLocalizer(moment))
    axios.get(process.env.MIX_API_URL + '/api/orders', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      params: {
        place_id: localStorage.getItem('place_id'),
        area_id: localStorage.getItem('area_id'),
        reservation_from: moment({
          year: moment.utc(reservationDate).year(),
          month: moment.utc(reservationDate).month(),
          day: 1
        }).utc().format('YYYY-MM-DD HH:mm:ss'),
        reservation_to: moment({
          year: moment.utc(reservationDate).year(),
          month: moment.utc(reservationDate).month() + 1,
          day: 1
        }).utc().format('YYYY-MM-DD HH:mm:ss')
      }
    }).then(response => {
      let totals = {}

      response.data.forEach(i => {
        const date = moment.utc(i.reservation_time).local().format('YYYY-MM-DD')
        totals[date] = totals?.[date]?.length
          ? [
            ...totals[date],
            { id: i.id, seats: i.seats }
          ]
          : [{ id: i.id, seats: i.seats }]
      })

      const events = Object.entries(totals).map((value) => ({
        start: value[0],
        end: value[0],
        title: <>
          {t('Total booking')}: {value[1].length} <br />
          {t('Total pax')}: {value[1].reduce((prev, curr) => prev + curr.seats, 0)}
        </>
      }))

      setEvents(events)
    }).catch(error => {
      console.log('Error', error)
    })
  }

  return (
    <div className='pages__container'>
      <div className='wrapper'>
        <AreasSelect />

        <DatePicker
          selected={reservationDate}
          onChange={(date) => setReservationDate(date)}
          dateFormat="MM/yyyy"
          showMonthYearPicker
        />
      </div>

      <Calendar
        localizer={localizer}
        views={''}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600, margin: '10px' }}
        onNavigate={(value) => setReservationDate(value)}
      />
    </div>
  )
}

export default MonthView

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css";
import ShowMoreModal from './ShowMoreModal/ShowMoreModal'
import i18next from 'i18next'

const MonthView = () => {
  moment.locale(i18next.language);
  const localizer = momentLocalizer(moment)

  const [orders, setOrders] = useState([])
  const [reservationDate, setReservationDate] = useState(new Date())
  const [moreData, setMoreData] = useState([])
  const [active, setActive] = useState(false)

  const getOrders = async () => {
    axios.get(process.env.MIX_API_URL + '/api/orders', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      },
      params: {
        place_id: localStorage.getItem('place_id'),
        area_id: localStorage.getItem('area_id'),
        reservation_from: moment({
          year: moment(reservationDate).year(),
          month: moment(reservationDate).month(),
          day: 1
        }).format('YYYY-MM-DD HH:mm:ss'),
        reservation_to: moment({
          year: moment(reservationDate).year(),
          month: moment(reservationDate).month() + 1,
          day: 1
        }).format('YYYY-MM-DD HH:mm:ss')
      }
    }).then(response => {
      setOrders(response.data)
    }).catch(error => {
      console.log('Error', error)
    })
  }

  useEffect(() => {
    getOrders()
  }, [reservationDate])

  return (
    <div>
      <Calendar
        localizer={localizer}
        views={''}
        events={orders.map(i => ({
          title: moment.utc(i.reservation_time).format('HH:mm')+' '+i.id,
          start: moment.utc(i.reservation_time),
          end: moment.utc(i.reservation_time).add(i.length,'minutes')
        }))}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600, margin: '30px' }}
        onNavigate={(value) => setReservationDate(value)}
        onShowMore={(value) => {
          setMoreData(value)
          setActive(true)
        }}
      />

      {moreData.length > 0 &&
        <ShowMoreModal
          data={moreData}
          active={active}
          setActive={setActive}
        />
      }
    </div>
  )
}

export default MonthView

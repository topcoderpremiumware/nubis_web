import React, {useEffect, useState} from 'react'
import eventBus from "../../../../eventBus";
import {useTranslation} from "react-i18next";
import {Button} from "@mui/material";


export default function StopBookingButton() {
  const { t } = useTranslation();
  const [isBookingStopped, setIsBookingStopped] = useState(false)

  useEffect( () => {
    getIsBookingStopped()
    function placeChanged(){
      getIsBookingStopped()
    }
    function areaChanged(){
      getIsBookingStopped()
    }
    function dateChanged(){
      getIsBookingStopped()
    }
    function timeChanged(){
      getIsBookingStopped()
    }
    eventBus.on("placeChanged",  placeChanged);
    eventBus.on("areaChanged",  areaChanged);
    eventBus.on("dateChanged",  dateChanged);
    eventBus.on("timeChanged",  timeChanged);

    return () => {
      eventBus.remove("placeChanged",  placeChanged);
      eventBus.remove("areaChanged",  areaChanged);
      eventBus.remove("dateChanged",  dateChanged);
      eventBus.remove("timeChanged",  timeChanged);
    }
  }, [])

  const isAllData = () => {
    return (localStorage.getItem('area_id') && localStorage.getItem('area_id') != 'all') &&
      localStorage.getItem('place_id') && localStorage.getItem('date') && localStorage.getItem('time') &&
      JSON.parse(localStorage.getItem('time'))
  }

  const getIsBookingStopped = async () => {
    if(isAllData()){
      let time = JSON.parse(localStorage.getItem('time'))
      await axios.get(`${process.env.MIX_API_URL}/api/is_booking_stopped`, {
        params: {
          area_id: localStorage.getItem('area_id'),
          place_id: localStorage.getItem('place_id'),
          date: localStorage.getItem('date'),
          start_time: time['from'] || '00:00:00',
          end_time: time['to'] || '00:00:00'
        },
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        setIsBookingStopped(response.data.result)
      }).catch(error => {
      })
    }
  }

  const stopBooking = () => {
    if(window.role === 'admin' && isAllData()){
      let time = JSON.parse(localStorage.getItem('time'))
      axios.post(`${process.env.MIX_API_URL}/api/stop_booking`,{
        area_id: localStorage.getItem('area_id'),
        place_id: localStorage.getItem('place_id'),
        date: localStorage.getItem('date'),
        start_time: time['from'] || '00:00:00',
        end_time: time['to'] || '00:00:00'
      },{
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        setIsBookingStopped(true)
        eventBus.dispatch("notification", {type: 'success', message: 'Online booking stopped for current date and area'});
      }).catch(error => {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error)
      })
    }
  }
  const unblockBooking = () => {
    if(window.role === 'admin' && isAllData()) {
      let time = JSON.parse(localStorage.getItem('time'))
      axios.post(`${process.env.MIX_API_URL}/api/unblock_booking`, {
        area_id: localStorage.getItem('area_id'),
        place_id: localStorage.getItem('place_id'),
        date: localStorage.getItem('date'),
        start_time: time['from'] || '00:00:00',
        end_time: time['to'] || '00:00:00'
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        setIsBookingStopped(false)
        eventBus.dispatch("notification", {type: 'success', message: 'Online booking unblocked for current date and area'
        });
      }).catch(error => {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error)
      })
    }
  }

  return (
    <>{isAllData() ?
      <>{isBookingStopped ?
        <Button variant="contained" type="button" color="success"
                onClick={unblockBooking}>{t('Unblock booking today')}</Button>
        :
        <Button variant="contained" type="button" color="error" onClick={stopBooking}>{t('Stop booking today')}</Button>
      }</> : null
    }</>
  )
}

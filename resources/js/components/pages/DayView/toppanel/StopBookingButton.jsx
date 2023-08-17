import React, {useEffect, useState} from 'react'
import eventBus from "../../../../eventBus";
import {useTranslation} from "react-i18next";
import {Button} from "@mui/material";


export default function StopBookingButton() {
  const { t } = useTranslation();
  const [isBookingStopped, setIsBookingStopped] = useState(false)

  useEffect(async () => {
    await getIsBookingStopped()

    eventBus.on("placeChanged", async () => {
      await getIsBookingStopped()
    });
    eventBus.on("areaChanged", async () => {
      await getIsBookingStopped()
    });
    eventBus.on("dateChanged", async () => {
      await getIsBookingStopped()
    });
  }, [])

  const isAllData = () => {
    return (localStorage.getItem('area_id') && localStorage.getItem('area_id') != 'all') && localStorage.getItem('place_id') && localStorage.getItem('date')
  }

  const getIsBookingStopped = async () => {
    if(isAllData()){
      await axios.get(`${process.env.MIX_API_URL}/api/is_booking_stopped`, {
        params: {
          area_id: localStorage.getItem('area_id'),
          place_id: localStorage.getItem('place_id'),
          date: localStorage.getItem('date')
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
      axios.post(`${process.env.MIX_API_URL}/api/stop_booking`,{
        area_id: localStorage.getItem('area_id'),
        place_id: localStorage.getItem('place_id'),
        date: localStorage.getItem('date')
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
      axios.post(`${process.env.MIX_API_URL}/api/unblock_booking`, {
        area_id: localStorage.getItem('area_id'),
        place_id: localStorage.getItem('place_id'),
        date: localStorage.getItem('date')
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
    <>{isAllData() &&
      <>{isBookingStopped ?
        <Button variant="contained" type="button" color="success"
                onClick={unblockBooking}>{t('Unblock booking today')}</Button>
        :
        <Button variant="contained" type="button" color="error" onClick={stopBooking}>{t('Stop booking today')}</Button>
      }</>
    }</>
  )
}

import React, {useState} from 'react';
import AreasSelect from './select/AreasSelect';
import TimeSelect from './select/time-select';
import DatePicker from './datepicker/DatePicker';
import  './DayViewTop.scss';
import eventBus from "../../../../eventBus";
import {Button} from "@mui/material";
import {useTranslation} from "react-i18next";


export default function DayViewTop() {
  const { t } = useTranslation();
  const [tableSidebar, setTableSidebar] = useState('');

  const openTableSidebar = (type) => {
    if(!localStorage.getItem('place_id')){
      eventBus.dispatch("notification", {type: 'error', message: 'Place is not selected'});
      return;
    }
    if(!localStorage.getItem('area_id')){
      eventBus.dispatch("notification", {type: 'error', message: 'Area is not selected'});
      return;
    }
    if(!localStorage.getItem('time')){
      eventBus.dispatch("notification", {type: 'error', message: 'Time is not selected'});
      return;
    }
    if(tableSidebar === type) type = ''
    setTableSidebar(type)
    eventBus.dispatch("openTableSidebar", {type: type});
  }

  const stopBooking = () => {
    axios.post(`${process.env.MIX_API_URL}/api/stop_booking`,{
      area_id: localStorage.getItem('area_id'),
      place_id: localStorage.getItem('place_id'),
      date: localStorage.getItem('date')
    },{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Online booking stopped for current date and area'});
    }).catch(error => {
      eventBus.dispatch("notification", {type: 'error', message: error.message});
      console.log('Error', error)
    })
  }

  return (
    <div className='DayViewTop__container'>
      <AreasSelect/>
      <TimeSelect/>
      <Button variant="contained" type="button" color="error" onClick={stopBooking}>{t('Stop booking today')}</Button>
      <DatePicker/>
      <div className='TimeTablePopper__container'>
        <div className='TimePlan-logo'>
          <img src='/images/timeplan-icon.svg' alt=""
               onClick={(e) => {openTableSidebar('timePlan')}}
          />
        </div>
        <div className='TablePlan-logo'>
          <img src='/images/tableplan-icon.svg' alt=""
               onClick={(e) => {openTableSidebar('tablePlan')}}
          />
        </div>
      </div>
    </div>
  )
}

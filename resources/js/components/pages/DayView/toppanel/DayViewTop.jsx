import React, {useState} from 'react';
import AreasSelect from './select/AreasSelect';
import TimeSelect from './select/time-select';
import DatePicker from './datepicker/DatePicker';
import  './DayViewTop.scss';
import eventBus from "../../../../eventBus";


export default function DayViewTop() {
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

  return (
    <div className='DayViewTop__container'>
      <AreasSelect/>
      <TimeSelect/>
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

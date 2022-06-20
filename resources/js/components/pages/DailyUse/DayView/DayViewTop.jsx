import React from 'react';
import PointSelect from './select/point-select';
import TimeSelect from './select/time-select';
import  './DayViewTop.scss';


export default function DayViewTop() {

  return (
    <div className='DayViewTop__container'>
      <PointSelect/>
      <TimeSelect/>
    </div>
  )
}

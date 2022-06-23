import React from 'react'
import NewBookingPopUp from './newbooking/NewBookingPopUp'

import './BottomPanel.scss';

export default function BottomPanel() {
  return (
    <div className='DayViewBottomPanel__container'>
      <div className='DayViewBottomPanel'>
        <NewBookingPopUp/>
      </div>
    </div>
  )
}

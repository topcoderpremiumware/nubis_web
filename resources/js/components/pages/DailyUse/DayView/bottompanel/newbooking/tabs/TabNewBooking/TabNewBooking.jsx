import React from 'react'
import './TabNewBooking.scss'

import SelectDate from './SelectDate';
import SelectArea from './SelectArea';
import SelectPax from './SelectPax';
import SelectDuration from './SelectDuration';
import SelectCountry from './SelectCountry';
import SelectPhone from './SelectPhone';
import SelectFirstName from './SelectFirstName';
import SelectLastName from './SelectLastName';
import SelectCompany from './SelectCompany';





export default function TabNewBooking() {

  const [point, setPoint] = React.useState('');

  const handleChange = (event) => {
    setPoint(event.target.value);
  };

  return (
    <div className='TabNewBooking__container'>
      <div className='TabNewBooking__left'>
        <div className='NewBookingDate__container container'>
          <span className='NewBooking__ItemName'>Date:</span>
          <SelectDate/>
        </div>
      <div className='NewBookingArea__container container'>
        <span className='NewBooking__ItemName'>Area:</span>
        <SelectArea/>
      </div>
      <div className='TabNewBookingDuraion__container container'>
        <span className='NewBooking__ItemName'>PaxDuration</span>
        <div className='NewBooking__InputItem'>
          <SelectPax />
        </div>
        
        <SelectDuration/>
        <div className='time-spent'></div>
      </div>

      </div>
      <div className='TabNewBooking__right'>
        <div className='GuesInfo'>
          <div className='GuesInfo-phone container'> 
            <span className='NewBooking__ItemName'>Phone:</span>
            <SelectCountry/>
            <SelectPhone/>
          </div>
          <div className='GuesInfo-first-name container'>
            <span className='NewBooking__ItemName'>FirstName:</span>
            <SelectFirstName/>
          </div>
          <div className='GuesInfo-last-name container'>
            <span className='NewBooking__ItemName'>LastName:</span>
            <SelectLastName/>
          </div>
          <div className='GuesInfo-company container'>
            <span className='NewBooking__ItemName'>Company:</span>
            <SelectCompany/>
          </div>

        </div>
      
      </div>
    </div>
  )
}

import React from 'react'
import './TabNewBooking.scss'

import SelectDate from './SelectDate';
import SelectArea from './SelectArea';
import SelectPax from './SelectPax';
import SelectStartTime from './SelectStartTime';
import SelectTableNote from './SelectTableNote';
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
          <span className='NewBooking__ItemName'>Pax / Duration :</span>
          <div className='NewBooking__InputPax'>
            <SelectPax />
          </div>
          <div className='NewBooking__InputStartTime'>
            <SelectStartTime/>
          </div>
          <div className='time-spent'></div>
        </div>
        <div className='TabNewBookingTableNote__container container'>
        <span className='NewBooking__ItemName'>Table note:</span>
          <SelectTableNote/>
        </div>
      </div>
      <div className='TabNewBooking__right'>
        <div className='GuestInfo'>
          <div className='GuestInfo-phone container'> 
            <span className='NewBooking__ItemName'>Phone:</span>
            <SelectCountry/>
            <SelectPhone/>
          </div>
          <div className='GuestInfo-first-name container'>
            <span className='NewBooking__ItemName'>FirstName:</span>
            <SelectFirstName/>
          </div>
          <div className='GuestInfo-last-name container'>
            <span className='NewBooking__ItemName'>LastName:</span>
            <SelectLastName/>
          </div>
          <div className='GuestInfo-company container'>
            <span className='NewBooking__ItemName'>Company:</span>
            <SelectCompany/>
          </div>

        </div>
      
      </div>
    </div>
  )
}

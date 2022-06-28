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
import SelectEmail from './SelectEmail';
import SelectAddress from './SelectAddress';
import SelectCity from './SelectCity';

import ButtonWalkIn from './ButtonWalkIn';
import ButtonReset from './ButtonReset';
import ButtonAddWaitingList from './ButtonAddWaitingList';
import ButtonCancel from './ButtonCancel';
import ButtonSave from './ButtonSave';

import CkeckBoxSms from './CkeckBoxSms';
import CkeckBoxEmail from './CkeckBoxEmail';





export default function TabNewBooking() {

const [point, setPoint] = React.useState('');

const handleChange = (event) => {
setPoint(event.target.value);
};

return (
<div className='TabNewBooking__container'>
  <div className='TabNewBooking__TopContainer'>
    <div className='TabNewBooking__left'>
      <div className='NewBookingDate__container container TabNewBookingItemcontainer'>
        <span className='NewBooking__ItemName'>Date:</span>
        <SelectDate />
      </div>
      <div className='NewBookingArea__container container TabNewBookingItemcontainer'>
        <span className='NewBooking__ItemName'>Area:</span>
        <SelectArea />
      </div>
      <div className='TabNewBookingDuraion__container container TabNewBookingItemcontainer'>
        <span className='NewBooking__ItemName'>Pax / Duration :</span>
        <div className='NewBooking__InputPax'>
          <SelectPax />
        </div>
        <div className='NewBooking__InputStartTime'>
          <SelectStartTime />
        </div>
        <div className='time-spent'></div>
      </div>
      <div className='TabNewBookingTableNote__container container TabNewBookingItemcontainer'>
        <span className='NewBooking__ItemName'>Table note:</span>
        <SelectTableNote />
      </div>
    </div>
    <div className='TabNewBooking__right'>
      <div className='GuestInfoTop__container'>
        <div className='GuestInfo'>
          <div className='GuestInfo-phone container TabNewBookingItemcontainer'>
            <span className='NewBooking__ItemName'>Phone:</span>
            <div className='TabNewBooking__Phone-container'>
              <SelectCountry />
              <SelectPhone />
            </div>
          </div>
          <div className='GuestInfo-first-name container TabNewBookingItemcontainer'>
            <span className='NewBooking__ItemName'>FirstName:</span>
            <SelectFirstName />
          </div>
          <div className='GuestInfo-last-name container TabNewBookingItemcontainer'>
            <span className='NewBooking__ItemName'>LastName:</span>
            <SelectLastName />
          </div>
          <div className='GuestInfo-company container TabNewBookingItemcontainer'>
            <span className='NewBooking__ItemName'>Company:</span>
            <SelectCompany />
          </div>
          <div className='GuestInfo-company container TabNewBookingItemcontainer'>
            <span className='NewBooking__ItemName'>Email:</span>
            <SelectEmail />
          </div>
          <div className='GuestInfo-company container TabNewBookingItemcontainer'>
            <span className='NewBooking__ItemName'>Address:</span>
            <SelectAddress />
          </div>
          <div className='GuestInfo-company container TabNewBookingItemcontainer'>
            <span className='NewBooking__ItemName'>Zip code/city:</span>
            <SelectCity />
          </div>
        </div>
        <div className='GuestInfoActive '>
          <div className='GuestInfoActive__ButtonContainer'>
            <ButtonWalkIn />
            <ButtonReset />
          </div>
          <div className='GuestInfoActive__checkBox__container'>
            <div className='GuestInfoActive__Sms_Service_Subscription'>
              <CkeckBoxSms/>
            </div>
            <div className='GuestInfoActive__Email_Service_Subscription'>
              <CkeckBoxEmail/>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
  <div className='NewBooking__BottomContainer'>
    <div className='NewBooking__Bottom-button'>
      <ButtonAddWaitingList />
    </div>
    <div className='NewBooking__Bottom-button'>
      <ButtonCancel />
    </div>
    <div className='NewBooking__Bottom-button'>
      <ButtonSave />
    </div>
  </div>

</div>
)
}
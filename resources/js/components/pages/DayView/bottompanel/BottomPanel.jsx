import React from 'react'
import NewBookingPopUp from './newbooking/NewBookingPopUp'

import './BottomPanel.scss';
import Button from "@mui/material/Button";
import {useTranslation} from "react-i18next";
import eventBus from "../../../../eventBus";

export default function BottomPanel({ selectedOrder, setSelectedOrder }) {
  const {t} = useTranslation();

  const openNewBooking = () => {
    eventBus.dispatch("newBookingOpen");
  }

  return (
    <div className='DayViewBottomPanel__container'>
      <div className='DayViewBottomPanel'>
        <Button variant="contained" onClick={openNewBooking}>{t('New Booking')}</Button>
        <NewBookingPopUp selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} />
      </div>
    </div>
  )
}

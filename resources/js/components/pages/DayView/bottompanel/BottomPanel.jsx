import React, {useEffect, useState} from 'react'
import NewBookingPopUp from './newbooking/NewBookingPopUp'

import './BottomPanel.scss';
import Button from "@mui/material/Button";
import {useTranslation} from "react-i18next";
import eventBus from "../../../../eventBus";
import {PDFDownloadLink} from "@react-pdf/renderer";
import DayViewPdf from "../DayViewPdf/DayViewPdf";
import {Stack} from "@mui/material";
import FindBookingPopUp from "./FindBookingPopUp";

export default function BottomPanel({ selectedOrder, setSelectedOrder }) {
  const [orders, setOrders] = useState([])
  const [columns, setColumns] = useState([])
  const [pdfTitle, setPdfTitle] = useState('')

  const {t} = useTranslation();

  const openNewBooking = () => {
    eventBus.dispatch("newBookingOpen");
  }

  const openFindBooking = () => {
    eventBus.dispatch("findBookingOpen");
  }

  useEffect(async () => {
    eventBus.on("dayViewOrdersLoaded", (data) => {
      setOrders(data.orders)
      setColumns(data.columns)
      setPdfTitle(data.pdfTitle)
    });
  }, [])

  const exportPdf = () => {
    console.log('exportPdf clicked')
    if(window.ReactNativeWebView){
      window.ReactNativeWebView.postMessage(JSON.stringify({action: 'button_aiailable'}));
    }
  }

  return (
    <Stack mt={2} spacing={1} direction="row">
      <Button variant="contained" onClick={openNewBooking}>{t('New Booking')}</Button>
      <NewBookingPopUp selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} />
      {orders.length > 0 && (
        <PDFDownloadLink
          document={
            <DayViewPdf
              title={pdfTitle}
              columns={columns}
              data={orders}
            />
          }
          fileName={pdfTitle.replace(/ /g,"_") + new Date().getTime() + ".pdf"}
        >
          <Button variant="contained" onClick={() => exportPdf()}>{t('Export to PDF')}</Button>
        </PDFDownloadLink>
      )}
      <Button variant="contained" onClick={openFindBooking}>{t('Find Booking')}</Button>
      <FindBookingPopUp setSelectedOrder={setSelectedOrder} />
    </Stack>
  )
}

import React, {useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';

import {
  CircularProgress,
} from "@mui/material";
import Moment from "moment";
import {DataGrid} from "@mui/x-data-grid";
import eventBus from "../../../../eventBus";
import Button from "@mui/material/Button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import DayViewPdf from "../DayViewPdf/DayViewPdf";

export default function DayViewTableWaiting() {
  const {t} = useTranslation();

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(async () => {
    getOrders()
    eventBus.on("placeChanged", () => {
      getOrders()
    });
    eventBus.on("areaChanged",  () => {
      getOrders()
    });
    eventBus.on("timeChanged",  () => {
      getOrders()
    });
    eventBus.on("dateChanged",  () => {
      getOrders()
    });
  }, [])

  const columns = [
    { field: 'id', headerName: t('Booking id'), width: 100 },
    { field: 'from', headerName: t('From'), width: 70 },
    { field: 'to', headerName: t('To'), width: 70 },
    { field: 'first_name', headerName: t('First name'), width: 130 },
    { field: 'last_name', headerName: t('Last name'), width: 130 },
    { field: 'seats', headerName: t('Seats'), width: 10 },
    { field: 'phone', headerName: t('Phone'), width: 140 },
    { field: 'email', headerName: t('Email'), width: 150 },
    { field: 'deleted_at', headerName: t('Deleted date'), width: 140 },
    { field: 'status', headerName: t('Status'), width: 100 },
    { field: 'area', headerName: t('Area'), width: 160 },
  ];


  const getOrders = async () => {
    setLoading(true)
    if(localStorage.getItem('place_id') &&
      localStorage.getItem('area_id') &&
      localStorage.getItem('time')){
      let areas = []
      await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/areas?all=1`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        areas = response.data
      })
      let date = localStorage.getItem('date') || Moment.utc().format('YYYY-MM-DD')
      let time = JSON.parse(localStorage.getItem('time'))
      await axios.get(`${process.env.MIX_API_URL}/api/orders?deleted=1`, {
        params: {
          place_id: localStorage.getItem('place_id'),
          area_id: localStorage.getItem('area_id'),
          reservation_from: date+' '+(time.from || '00:00:00'),
          reservation_to: date+' '+(time.to || '23:59:59')
        },
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        let orders = response.data.map(item => {
          item.from = Moment.utc(item.reservation_time).local().format('HH:mm')
          item.to = Moment.utc(item.reservation_time).add(item.length, 'minutes').local().format('HH:mm')
          item.first_name = item.customer.first_name
          item.last_name = item.customer.last_name
          item.phone = item.customer.phone
          item.email = item.customer.email
          item.deleted_at = Moment.utc(item.deleted_at).local().format('YYYY-MM-DD HH:mm')
          item.area = areas.find(i => i.id === item.area_id).name
          return item
        })

        setOrders(orders)
        setLoading(false)
      }).catch(error => {
      })
    }else{
      setOrders([])
      setLoading(false)
    }
  }

  return (<>{loading ? <div><CircularProgress/></div> :
    <div style={{ height: 'calc(100% - 55px)', width: '100%' }}>
      <DataGrid
        rows={orders}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        // checkboxSelection
      />
      {orders.length > 0 && (
        <PDFDownloadLink
          document={
            <DayViewPdf
              title={t('Deleted bookings')}
              columns={columns.map(i => i.headerName)}
              data={orders}
            />
          }
          fileName={t('Deleted_bookings') + new Date().getTime() + ".pdf"}
        >
          <Button variant="contained" style={{ marginTop: '10px' }}>{t('Export to PDF')}</Button>
        </PDFDownloadLink>
      )}
    </div>
  }</>);
};

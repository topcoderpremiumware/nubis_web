import React, {useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';

import {
  CircularProgress,
} from "@mui/material";
import Moment from "moment";
import {DataGrid} from "@mui/x-data-grid";
import eventBus from "../../../../eventBus";

export default function DayViewTableWaiting() {
  const {t} = useTranslation();

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  let channelName

  useEffect( () => {
    getOrders()
    eventBus.on("placeChanged", () => {
      getOrders()
      Echo.leave(channelName)
      channelName = `place-${localStorage.getItem('place_id')}`
      Echo.channel(channelName)
        .listen('.order-deleted', function(data) {
          console.log('echo order-deleted',data)
          getOrders()
        })
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
    channelName = `place-${localStorage.getItem('place_id')}`
    Echo.channel(channelName)
      .listen('.order-deleted', function(data) {
        console.log('echo order-deleted',data)
        getOrders()
      })
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
    { field: 'area_name', headerName: t('Area'), width: 160 },
  ];


  const getOrders = () => {
    setLoading(true)
    if(localStorage.getItem('place_id') &&
      localStorage.getItem('area_id') /*&&
      localStorage.getItem('time')*/){
      let date = localStorage.getItem('date') || Moment.utc().format('YYYY-MM-DD')
      let time = JSON.parse(localStorage.getItem('time')) || {from: '00:00:00',to: '23:59:59'}
      axios.get(`${process.env.MIX_API_URL}/api/orders?deleted=1`, {
        params: {
          place_id: localStorage.getItem('place_id'),
          area_id: localStorage.getItem('area_id'),
          reservation_from: date+' '+time.from,
          reservation_to: date+' '+time.to
        },
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        let orders = response.data.map(item => {
          item.from = Moment.utc(item.reservation_time).local().format('HH:mm')
          item.to = Moment.utc(item.reservation_time).add(item.length, 'minutes').local().format('HH:mm')
          item.first_name = !item?.customer_id ? 'Walk in' : item.customer.first_name
          item.last_name = item.customer?.last_name || ''
          item.phone = item.customer?.phone || ''
          item.email = item.customer?.email || ''
          item.deleted_at = Moment.utc(item.deleted_at).local().format('YYYY-MM-DD HH:mm')
          item.area_name = item.area.name
          return item
        })

        setOrders(orders)
        eventBus.dispatch("dayViewOrdersLoaded",{orders: orders, columns: columns, pdfTitle: t('Deleted bookings')});
        setLoading(false)
      }).catch(error => {
      })
    }else{
      setOrders([])
      eventBus.dispatch("dayViewOrdersLoaded",{orders: [], columns: columns, pdfTitle: t('Deleted bookings')});
      setLoading(false)
    }
  }

  return (<>{loading ? <div><CircularProgress/></div> :
    <div style={{ height: '100%', width: '100%' }}>
      <DataGrid
        rows={orders}
        columns={columns}
        pageSize={50}
        rowsPerPageOptions={[50]}
        // checkboxSelection
      />
    </div>
  }</>);
};

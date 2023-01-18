import React, {useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';

import {
  CircularProgress,
} from "@mui/material";
import Moment from "moment";
import {DataGrid} from "@mui/x-data-grid";
import eventBus from "../../../../eventBus";

export default function DayViewTableBookings({ setSelectedOrder }) {
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
    { field: 'take_away', headerName: t('Take away'), width: 100 },
    { field: 'tables', headerName: t('Tables'), width: 70 },
    { field: 'length', headerName: t('Booking Length'), width: 100 },
    { field: 'source', headerName: t('Source'), width: 70 },
    { field: 'comment', headerName: t('Note'), width: 200},
    { field: 'menu', headerName: t('Menu'), width: 100},
    { field: 'order_date', headerName: t('Order date'), width: 140 },
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

      let date = localStorage.getItem('date') || Moment().format('YYYY-MM-DD')
      let time = JSON.parse(localStorage.getItem('time'))
      await axios.get(`${process.env.MIX_API_URL}/api/orders`, {
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
          console.log('item', item)
          if(item.status === 'waiting') return false
          item.from = Moment.utc(item.reservation_time).format('HH:mm')
          item.to = Moment.utc(item.reservation_time).add(item.length, 'minutes').format('HH:mm')
          item.first_name = item.customer.first_name
          item.last_name = item.customer.last_name
          item.tables = item.is_take_away ? '' : item.table_ids.join(', ')
          item.order_date = Moment(item.created_at).format('YYYY-MM-DD HH:mm')
          item.take_away = item.is_take_away ? t('yes') : t('no')
          item.area = areas.find(i => i.id === item.area_id).name
          item.menu = item.custom_booking_length_id ? item.custom_booking_length.name : ''
          return item
        }).filter(x => x)

        setOrders(orders)
        setLoading(false)
      }).catch(error => {
      })
    }else{
      setOrders([])
      setLoading(false)
    }
  }

  const doubleClickHandler = (params, event, details) => {
    setSelectedOrder(params.row)
  }

  return (<>{loading ? <div><CircularProgress/></div> :
    <div style={{ height: '100%', width: '100%' }}>
      <DataGrid
        rows={orders}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        onRowDoubleClick={doubleClickHandler}
        // checkboxSelection
      />
    </div>
  }</>);
};

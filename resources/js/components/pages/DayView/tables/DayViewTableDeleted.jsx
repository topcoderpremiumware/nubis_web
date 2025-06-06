import React, {useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';

import {
  CircularProgress, IconButton,
} from "@mui/material";
import Moment from "moment";
import {DataGrid} from "@mui/x-data-grid";
import eventBus from "../../../../eventBus";
import RestoreIcon from "@mui/icons-material/Restore";
import axios from "axios";

export default function DayViewTableWaiting() {
  const {t} = useTranslation();

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  let channelName

  useEffect( () => {
    getOrders()
    function placeChanged(){
      getOrders()
      Echo.leave(channelName)
      channelName = `place-${localStorage.getItem('place_id')}`
      Echo.channel(channelName)
        .listen('.order-deleted', function(data) {
          console.log('echo order-deleted',data)
          getOrders()
        })
    }
    function areaChanged(){
      getOrders()
    }
    function timeChanged(){
      getOrders()
    }
    function dateChanged(){
      getOrders()
    }
    eventBus.on("placeChanged", placeChanged);
    eventBus.on("areaChanged",  areaChanged);
    eventBus.on("timeChanged",  timeChanged);
    eventBus.on("dateChanged",  dateChanged);
    channelName = `place-${localStorage.getItem('place_id')}`
    Echo.channel(channelName)
      .listen('.order-deleted', function(data) {
        console.log('echo order-deleted',data)
        getOrders()
      })
    return () => {
      Echo.leave(channelName)
      eventBus.remove("placeChanged", placeChanged);
      eventBus.remove("areaChanged",  areaChanged);
      eventBus.remove("timeChanged",  timeChanged);
      eventBus.remove("dateChanged",  dateChanged);
    }
  }, [])

  const columns = [
    { field: 'self', headerName: t('Actions'), flex: 1, renderCell: (params) =>
        <IconButton onClick={e => {restoreOrder(params.id)}} size="small"><RestoreIcon fontSize="small"/></IconButton>, },
    { field: 'id', headerName: t('Booking id'), width: 100 },
    { field: 'status', headerName: t('Status'), width: 100 },
    { field: 'from', headerName: t('From'), width: 70 },
    { field: 'to', headerName: t('To'), width: 70 },
    { field: 'table_first_name', headerName: t('First name'), width: 130 },
    { field: 'table_last_name', headerName: t('Last name'), width: 130 },
    { field: 'seats', headerName: t('Seats'), width: 10 },
    { field: 'table_phone', headerName: t('Phone'), width: 140 },
    { field: 'table_email', headerName: t('Email'), width: 150 },
    { field: 'deleted_at', headerName: t('Deleted date'), width: 140 },
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
          item.from = Moment.utc(item.reservation_time).format('HH:mm') // removed local
          item.to = Moment.utc(item.reservation_time).add(item.length, 'minutes').format('HH:mm') // removed local
          item.table_first_name = item?.customer_id ? item.customer.first_name : item?.first_name || 'Walk in'
          item.table_last_name = item?.customer_id ? item.customer.last_name : item?.last_name || ''
          item.table_phone = item?.customer_id ? item.customer.phone : item?.phone || ''
          item.table_email = item?.customer_id ? item.customer.email : item?.email || ''
          item.deleted_at = Moment.utc(item.deleted_at).local().format('YYYY-MM-DD HH:mm') // removed local
          item.area_name = item.area.name
          item.self = item
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

  const restoreOrder = (id) => {
      setLoading(true);
      axios.post(`${process.env.MIX_API_URL}/api/orders/${id}/restore`, {}, {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        }
      ).then(response => {
        setLoading(false);
        getOrders()
        eventBus.dispatch("notification", {type: 'success', message: response.data.message});
      }).catch(error => {
        setLoading(false);
        getOrders()
        if (error.response && error.response.data && error.response.data.errors) {
          for (const [key, value] of Object.entries(error.response.data.errors)) {
            eventBus.dispatch("notification", {type: 'error', message: value});
          }
        } else {
          eventBus.dispatch("notification", {type: 'error', message: error.response.data.message});
        }
      })
  }

  return (<>{loading ? <div><CircularProgress/></div> :
    <div style={{ height: '100%', width: '100%' }}>
      <DataGrid
        rows={orders}
        columns={columns}
        pageSize={50}
        rowsPerPageOptions={[50]}
        getRowClassName={(params) => `dayview_table_row_${params.row.status}`}
        // checkboxSelection
      />
    </div>
  }</>);
};

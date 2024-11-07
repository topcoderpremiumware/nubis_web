import React, {useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';

import {
  CircularProgress,
} from "@mui/material";
import Moment from "moment";
import {DataGrid} from "@mui/x-data-grid";
import eventBus from "../../../../eventBus";

export default function DayViewTableWaiting({ setSelectedOrder }) {
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
      .listen('.order-created', function(data) {
        console.log('echo order-created',data)
        getOrders()
      })
      .listen('.order-updated', function(data) {
        console.log('echo order-updated',data)
        getOrders()
      })
      .listen('.order-deleted', function(data) {
        console.log('echo order-deleted',data)
        getOrders()
      })
  }, [])

  const columns = [
    { field: 'id', headerName: t('Booking id'), width: 100 },
    { field: 'status', headerName: t('Status'), width: 100 },
    { field: 'from', headerName: t('From'), width: 70 },
    { field: 'to', headerName: t('To'), width: 70 },
    { field: 'table_first_name', headerName: t('First name'), width: 130 },
    { field: 'table_last_name', headerName: t('Last name'), width: 130 },
    { field: 'seats', headerName: t('Seats'), width: 10 },
    { field: 'comment', headerName: t('Note'), width: 200},
    { field: 'order_date', headerName: t('Order date'), width: 140 },
    { field: 'area_name', headerName: t('Area'), width: 160 },
  ];


  const getOrders = () => {
    setLoading(true)
    if(localStorage.getItem('place_id') &&
      localStorage.getItem('area_id') /*&&
      localStorage.getItem('time')*/){
      let date = localStorage.getItem('date') || Moment.utc().format('YYYY-MM-DD')
      let time = JSON.parse(localStorage.getItem('time')) || {from: '00:00:00',to: '23:59:59'}
      axios.get(`${process.env.MIX_API_URL}/api/orders`, {
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
          if(item.status !== 'waiting') return false
          item.from = Moment.utc(item.reservation_time).format('HH:mm') // removed local
          item.to = Moment.utc(item.reservation_time).add(item.length, 'minutes').format('HH:mm') // removed local
          item.table_first_name = item?.customer_id ? item.customer.first_name : item?.first_name || 'Walk in'
          item.table_last_name = item?.customer_id ? item.customer.last_name : item?.last_name || ''
          item.order_date = Moment.utc(item.created_at).local().format('YYYY-MM-DD HH:mm') // removed local
          item.area_name = item.area.name
          return item
        }).filter(x => x)

        setOrders(orders)
        eventBus.dispatch("dayViewOrdersLoaded",{orders: orders, columns: columns, pdfTitle: t('Waiting List')});
        setLoading(false)
      }).catch(error => {
      })
    }else{
      setOrders([])
      eventBus.dispatch("dayViewOrdersLoaded",{orders: [], columns: columns, pdfTitle: t('Waiting List')});
      setLoading(false)
    }
  }

  const doubleClickHandler = (params, event, details) => {
    setSelectedOrder(params.row)
    eventBus.dispatch('openNewBookingPopUp')
  }

  return (<>{loading ? <div><CircularProgress/></div> :
    <div style={{ height: '100%', width: '100%' }}>
      <DataGrid
        rows={orders}
        columns={columns}
        pageSize={50}
        rowsPerPageOptions={[50]}
        getRowClassName={(params) => `dayview_table_row_${params.row.status}`}
        onRowDoubleClick={doubleClickHandler}
        // checkboxSelection
      />
    </div>
  }</>);
};

import React, {useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';

import {
  CircularProgress,
} from "@mui/material";
import Moment from "moment";
import {DataGrid} from "@mui/x-data-grid";
import eventBus from "../../../../eventBus";
import axios from "axios";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import moment from "moment/moment";

export default function DayViewTableBookings({ setSelectedOrder }) {
  const {t} = useTranslation();

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [grabbedRow, setGrabbedRow] = useState(null)

  let channelName

  useEffect(() => {
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
    eventBus.on("orderEdited",  () => {
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
    { field: 'first_name', headerName: t('First name'), width: 130 },
    { field: 'last_name', headerName: t('Last name'), width: 130 },
    { field: 'seats', headerName: t('Seats'), width: 10 },
    // { field: 'take_away', headerName: t('Take away'), width: 100 },
    { field: 'drag', headerName: t('Drag'), width: 20, renderCell: (params) => <DragIndicatorIcon style={{cursor: "pointer"}}/>},
    { field: 'tables', headerName: t('Tables'), width: 70, editable: true },
    { field: 'length', headerName: t('Booking Length'), width: 100 },
    { field: 'source', headerName: t('Source'), width: 70 },
    { field: 'comment', headerName: t('Note'), width: 200},
    { field: 'amount', headerName: t('Amount'), width: 100},
    { field: 'code', headerName: t('Code'), width: 100},
    { field: 'menu', headerName: t('Menu'), width: 100},
    { field: 'order_date', headerName: t('Order date'), width: 140 },
    { field: 'area_name', headerName: t('Area'), width: 160 },
    { field: 'author_name', headerName: t('Admin'), width: 160 },
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
          console.log('item', item)
          if(item.status === 'waiting') return false
          item.from = Moment.utc(item.reservation_time).format('HH:mm') // removed local
          item.to = Moment.utc(item.reservation_time).add(item.length, 'minutes').format('HH:mm') // removed local
          item.first_name = !item?.customer_id ? 'Walk in' : item.customer.first_name
          item.last_name = item.customer?.last_name || ''
          item.tables = item.is_take_away ? '' : item.table_ids.join(', ')
          item.order_date = Moment.utc(item.created_at).local().format('YYYY-MM-DD HH:mm') // removed local
          item.take_away = item.is_take_away ? t('yes') : t('no')
          item.area_name = item.area.name
          item.menu = item.custom_booking_length_id ? item.custom_booking_length.name : ''
          item.amount = item.marks.hasOwnProperty('amount') ? item.marks['amount'] : ''
          item.code = item.marks.hasOwnProperty('giftcard_code') ? item.marks['giftcard_code'] : ''
          item.author_name = item.user_id ? item.author.name : ''
          return item
        }).filter(x => x)

        setOrders(orders)
        eventBus.dispatch('loadedOrders',orders)
        eventBus.dispatch("dayViewOrdersLoaded",{orders: orders, columns: columns, pdfTitle: t('Bookings')});
        setLoading(false)
      }).catch(error => {
      })
    }else{
      setOrders([])
      eventBus.dispatch("dayViewOrdersLoaded",{orders: [], columns: columns, pdfTitle: t('Bookings')});
      setLoading(false)
    }
  }

  const switchOrder = (data) => {
    setLoading(true);
    axios.post(`${process.env.MIX_API_URL}/api/orders_switch_tables`, data, {
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

  const updateOrder = (order) => {
    setLoading(true)
    axios.post(`${process.env.MIX_API_URL}/api/orders/${order.id}`, {
      ...order,
      reservation_time: moment.utc(order.reservation_time).utc().format('YYYY-MM-DD HH:mm:ss'),
    },{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setLoading(false);
      getOrders()
      eventBus.dispatch("notification", {type: 'success', message: 'Order saved successfully'});
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

  const doubleClickHandler = (params, event, details) => {
    setSelectedOrder(params.row)
  }

  const handleMouseDown = (event) => {
    event.preventDefault();
    let id = Number(event.currentTarget.getAttribute('data-id'))
    setGrabbedRow(id)
  };

  const handleMouseUp = (event) => {
    event.preventDefault();
    let id = Number(event.currentTarget.getAttribute('data-id'))
    if(grabbedRow && id !== grabbedRow){
      switchOrder({first_order_id: grabbedRow, second_id: id, type: 'order'})
    }
    setGrabbedRow(null)
    document.body.style.cursor = 'auto'
  };

  const handleMouseMove = (event) => {
    event.preventDefault();
    if(grabbedRow){
      document.body.style.cursor = 'move'
    }else{
      document.body.style.cursor = 'auto'
    }
  };

  const handleCellEditStop = (params, event) => {
    let order = orders[params.tabIndex]
    if(params.field === 'tables'){
      let table_ids = params.getValue(params.id,params.field).split(',').map(item => {
        return Number(item.trim())
      }).filter(item => !isNaN(item))
      if(table_ids.length > 0 && table_ids.join(',') !== order.table_ids.join(',')){
        order.table_ids = table_ids
        updateOrder(order)
      }else{
        getOrders()
      }
    }
  }

  return (<>{loading ? <div><CircularProgress/></div> :
    <div style={{ height: '100%', width: '100%' }}>
      <DataGrid
        rows={orders}
        columns={columns}
        pageSize={50}
        rowsPerPageOptions={[50]}
        onRowDoubleClick={doubleClickHandler}
        rowReordering
        onCellEditStop={handleCellEditStop}
        componentsProps={{
          row: {
            onMouseDown: handleMouseDown,
            onMouseUp: handleMouseUp,
            onMouseMove: handleMouseMove,
            // style: { cursor: 'move' },
          },
        }}
        getRowClassName={(params) => `dayview_table_row_${params.row.status}`}
        // checkboxSelection
      />
    </div>
  }</>);
};

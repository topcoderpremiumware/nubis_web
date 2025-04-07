import './Pos.scss'
import {useTranslation} from "react-i18next";
import {
  FormControl,
  InputLabel, MenuItem, Select,
} from "@mui/material";
import React, {useEffect, useState} from "react";
import eventBus from "../../../../eventBus";
import axios from "axios";
import Moment from "moment/moment";
import {isBills} from "../../../../helper";

export default function ChangeOrder(props){
  const {t} = useTranslation();
  const [orders, setOrders] = useState([])
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    getOrders()
    function pos_create_order(){
      getOrders()
    }
    eventBus.on("pos_create_order",pos_create_order)
    return () => {
      eventBus.remove("pos_create_order",pos_create_order)
    }
  },[])

  useEffect(() => {
    setOrderId(props.orderId)
  },[props])

  const getOrders = async (category_id = false) => {
    if(isBills(['pos','pos_terminal'])){
      localStorage.setItem('date',null)
      localStorage.setItem('time',null)
      localStorage.setItem('area_id',null)
    }
    let date = localStorage.getItem('date') || Moment.utc().format('YYYY-MM-DD')
    let time = JSON.parse(localStorage.getItem('time')) || {from: '00:00:00',to: '23:59:59'}
    axios.get(`${process.env.MIX_API_URL}/api/orders`, {
      params: {
        place_id: localStorage.getItem('place_id'),
        area_id: localStorage.getItem('area_id') || 'all',
        reservation_from: date+' '+time.from,
        reservation_to: date+' '+time.to
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setOrders(response.data)
    }).catch(error => {
    })
  }

  const onChangeOrder = (id) => {
    let order = orders.find((order) => order.id === id)
    eventBus.dispatch("changedSelectedOrder",order)
  }

  return (
    <>{orders.length > 0 &&
        <FormControl size="small" style={{minWidth:"115px"}}>
          <InputLabel id="label_order">{t('Order (tables)')}</InputLabel>
          <Select label={t('Order (tables)')} value={orderId}
                  labelId="label_order" id="order" name="order"
                  onChange={(e) => onChangeOrder(e.target.value)}>
            {orders.map((el, key) => {
              return <MenuItem key={key} value={el.id}>#{el.id} {el.table_ids.length > 0 ? `(${el.table_ids.join(', ')})` : null}</MenuItem>
            })}
          </Select>
        </FormControl>
    }</>
  );
}

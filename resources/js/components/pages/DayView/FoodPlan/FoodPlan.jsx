import React, {useEffect, useState} from "react";
import {useTranslation} from 'react-i18next';
import 'react-calendar-timeline/lib/Timeline.css'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Moment from "moment";
import {BsFullscreen, BsFullscreenExit} from "react-icons/bs";
import eventBus from "../../../../eventBus";
import {StyledTableRow} from "../../../components/StyledTableRow";

export default function FoodPlan(props) {
  const { t } = useTranslation();
  const [products, setProducts] = useState([])

  let channelName

  useEffect(() => {
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
    function timeChanged(){
      getOrders()
    }
    function areaChanged(){
      getOrders()
    }
    function dateChanged(){
      getOrders()
    }
    function orderEdited(){
      getOrders()
    }
    eventBus.on("placeChanged", placeChanged);
    eventBus.on("timeChanged",  timeChanged);
    eventBus.on("areaChanged",  areaChanged);
    eventBus.on("dateChanged",  dateChanged);
    eventBus.on("orderEdited",  orderEdited);
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
    return () => {
      Echo.leave(channelName)
      eventBus.remove("placeChanged", placeChanged);
      eventBus.remove("timeChanged",  timeChanged);
      eventBus.remove("areaChanged",  areaChanged);
      eventBus.remove("dateChanged",  dateChanged);
      eventBus.remove("orderEdited",  orderEdited);
    }
  },[])

  const getOrders = () => {
    let date = localStorage.getItem('date') || Moment().utc().format('YYYY-MM-DD')
    let time = JSON.parse(localStorage.getItem('time'))
    axios.get(`${process.env.MIX_API_URL}/api/orders/products`, {
      params: {
        place_id: localStorage.getItem('place_id'),
        area_id: localStorage.getItem('area_id'),
        reservation_from: date+' '+(time?.from || '00:00:00'),
        reservation_to: date+' '+(time?.to || '23:59:59')
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setProducts(response.data)
    }).catch(error => {
    })
  }

  return (<>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell size="small">{t('Name')}</TableCell>
            <TableCell size="small" align="right">{t('Quantity')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product, index) => <StyledTableRow key={index}>
            <TableCell size="small">{product.name}</TableCell>
            <TableCell size="small" align="right">{product.quantity}</TableCell>
          </StyledTableRow>)}
        </TableBody>
      </Table>
    </TableContainer>
    <Button
      variant="contained"
      onClick={() => props.setFullWidth(prev => !prev)}
      className="canvas-toggle-btn"
    >
      {props.isFullWidth ? <BsFullscreenExit /> : <BsFullscreen />}
    </Button>
  </>);
}

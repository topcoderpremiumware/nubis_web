import React, {useEffect, useState} from "react";
import {useTranslation} from 'react-i18next';
import {fabric} from 'fabric';
import {circTable, landscape, rectTable} from "../../TablePlanSetup/tableTypes";
import {Box, Button, CircularProgress, Menu, MenuItem, Slider} from "@mui/material";
import Moment from "moment";
import _ from "lodash";
import { useCallback } from "react";
import axios from "axios";
import eventBus from "../../../../eventBus";
import moment from "moment";
import { BsFullscreen, BsFullscreenExit } from "react-icons/bs";
// import TablePropertiesPopup from "./TablePropertiesPopup";

export default function PlanCanvas({ setSelectedOrder, isFullWidth, setFullWidth }) {
  const { t } = useTranslation();
  const [canvas, setCanvas] = useState(null)
  const [plan, setPlan] = useState({})
  const [timeMarks, setTimeMarks] = useState([])
  const [selectedTime, setSelectedTime] = useState('')
  const [debouncedSelectedTime, setDebouncedSelectedTime] = useState('')
  const [orders, setOrders] = useState([])
  const [selectedTable, setSelectedTable] = useState({})
  const [loading, setLoading] = useState(true)
  const [menuAnchorEl, setMenuAnchorEl] = useState({
    mouseX: null,
    mouseY: null
  })

  const width = 840*2
  const height = 840*2
  const grid = 20
  const backgroundColor = '#ffffff'
  const lineStroke = '#ebebeb'
  var upperCanvas

  useEffect(() => {
    getPlan()
    getOrders()
    getTimesList()
    eventBus.on("orderEdited",  () => {
      getOrders()
    });
    Echo.channel(`place-${localStorage.getItem('place_id')}`)
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
  },[])

  useEffect(() => {
    if(!loading){
      setCanvas(new fabric.Canvas('plan-canvas'))
    }
  },[loading])

  useEffect(() => {
    initCanvas()
  },[canvas,plan])

  useEffect(() => {
    markOrderedTables()
  },[orders])

  useEffect(() => {
    markOrderedTables()
  },[debouncedSelectedTime])

  const getTimesList = () => {
    let timesArray = []
    let time = JSON.parse(localStorage.getItem('time'))
    let from = Moment.utc('1970-01-01 '+(time['from'] || '00:00:00'))
    let to = Moment.utc('1970-01-01 '+(time['to'] || '23:59:59'))
    while(from <= to) {
      timesArray.push(from.clone().format('HH:mm'))
      from.add(15, 'minutes')
    }
    console.log('timesArray',timesArray)
    setTimeMarks(timesArray)

    let lessTime = 0
    const now = Moment.utc('1970-01-01 ' + Moment.utc().format('HH:mm'))
    timesArray.forEach(i => {
      const fullLessTime = Moment.utc('1970-01-01 ' + lessTime).valueOf()
      const time = Moment.utc('1970-01-01 ' + i)
      const diff = now.diff(time)
      if (lessTime === 0 || (fullLessTime > diff && diff > 0)) {
        lessTime = i
      }
    })
    setSelectedTime(lessTime)
    setDebouncedSelectedTime(lessTime)
  }

  const getPlan = () => {
    let time = JSON.parse(localStorage.getItem('time'))
    axios.get(`${process.env.MIX_API_URL}/api/tableplans/${time['tableplan_id']}`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setPlan(response.data)
      setLoading(false)
    }).catch(error => {
    })
  }

  const getOrders = () => {
    let date = localStorage.getItem('date') || Moment().utc().format('YYYY-MM-DD')
    let time = JSON.parse(localStorage.getItem('time'))
    axios.get(`${process.env.MIX_API_URL}/api/orders`, {
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
        if(item.status === 'waiting' || item.is_take_away) return false
        item.from = Moment.utc(item.reservation_time)
        item.to = Moment.utc(item.reservation_time).add(item.length, 'minutes')
        return item
      }).filter(x => x).sort((a, b) => a.from.valueOf() - b.from.valueOf())
      setOrders(orders)
    }).catch(error => {
    })
  }

  const initCanvas = () => {
    if (canvas) {
      upperCanvas = document.querySelector('.upper-canvas')
      if (upperCanvas.getAttribute('listener') !== 'true'){
        document.querySelector('.upper-canvas').addEventListener('contextmenu', onObjectMenu,true)
        upperCanvas.setAttribute('listener', 'true')
      }
      canvas.clear()

      canvas.backgroundColor = backgroundColor

      for (let i = 0; i < (canvas.height / grid); i++) {
        const lineX = new fabric.Line([ 0, i * grid, canvas.height, i * grid], {
          stroke: lineStroke,
          selectable: false,
          hoverCursor: "default",
          type: 'line'
        })
        const lineY = new fabric.Line([ i * grid, 0, i * grid, canvas.height], {
          stroke: lineStroke,
          selectable: false,
          hoverCursor: "default",
          type: 'line'
        })
        sendLinesToBack()
        canvas.add(lineX)
        canvas.add(lineY)
      }
      if(plan.hasOwnProperty('data')) showTables()
    }
  }

  const showTables = async () => {
    let table
    let key = 0
    for (const item of plan.data) {
      if (item.type.includes('rect')) table = rectTable(key, item)
      if (item.type.includes('circ')) table = circTable(key, item)
      if (item.type.includes('land')) table = await landscape(key, item)
      if((item.type.includes('rect') || item.type.includes('circ')) && item.hasOwnProperty('booking_id')){
        table.on('mouseup', onMoveObject)
      }else{
        table.lockMovementX = true
        table.lockMovementY = true
      }
      canvas.add(table)
      key++
    }
  }

  const onMoveObject = (e) => {
    let table = e.target
    console.log('moved',table.data.booking_id)
    let isHit = false
    canvas.forEachObject(function(otherObj) {
      if (otherObj !== table && table.intersectsWithObject(otherObj)) {
        if(otherObj.hasOwnProperty('data') && (otherObj.data.type.includes('rect') || otherObj.data.type.includes('circ'))){
          if(otherObj.data.hasOwnProperty('booking_id') && otherObj.data.booking_id){
            switchOrder({first_order_id: table.data.booking_id, second_id: otherObj.data.booking_id, type: 'order'})
          }else{
            switchOrder({first_order_id: table.data.booking_id, second_id: otherObj.data.number, type: 'table'})
          }
          isHit = true
        }
      }
    })
    if(!isHit) {
      getPlan()
      getOrders()
    }
  }

  const switchOrder = (data) => {
    axios.post(`${process.env.MIX_API_URL}/api/orders_switch_tables`, data, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }
    ).then(response => {
      getPlan()
      eventBus.dispatch('orderEdited')
      eventBus.dispatch("notification", {type: 'success', message: response.data.message});
    }).catch(error => {
      getPlan()
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

  const markOrderedTables = () => {
    let tempPlan = plan
    if(tempPlan.hasOwnProperty('data')){
      tempPlan.data.map((item) => {item.markColor = ''; item.order = ''; return item})
      tempPlan.data.map((item) => {
        if(item.type.includes('rect') || item.type.includes('circ')){
          orders.forEach((order) => {
            if(order.table_ids.includes(item.number)){
              let date = localStorage.getItem('date') || Moment().utc().format('YYYY-MM-DD')
              let now = Moment.utc(date+' '+debouncedSelectedTime)
              if(item.order === ''){
                if(now.isBetween(order.from,order.to) || now.isSame(order.from)){
                  let duration = Moment.duration(order.to.diff(now));
                  let hours = parseInt(duration.asHours())
                  let minutes = parseInt(duration.asMinutes()) % 60
                  item.order = (0+''+hours).slice(-2)+':'+(0+''+minutes).slice(-2)
                  item.markColor = '#f59827'
                  item.booking_id = order?.id
                }else if(now.isBefore(order.from)){
                  item.order = order.from.local().format('HH:mm')
                  item.markColor = '#ffd744'
                  item.booking_id = order?.id
                }else{
                  item.order = ''
                  item.markColor = ''
                  delete item.booking_id
                }
              }
            }
          })
        }
        return item
      })
      setPlan(prev => ({...tempPlan}))
    }
  }

  const onObjectMenu = (e) => {
    e.preventDefault()
    var pointer = canvas.getPointer(e);
    var objects = canvas.getObjects();
    for (var i = objects.length-1; i >= 0; i--) {
      var object = objects[i];
      if (object.containsPoint(pointer) && object.selectable) {
        setSelectedTable(object)
        setMenuAnchorEl({
          mouseX: e.clientX,
          mouseY: e.clientY
        })
      }
    }
    return false
  }

  const sendLinesToBack = () => {
    canvas.getObjects().map(o => {
      if (o.type === 'line') {
        canvas.sendToBack(o)
      }
    })
  }

  const menuClose = () => {
    setMenuAnchorEl({
      mouseX: null,
      mouseY: null
    })
  }

  const debouncedOnChange = useCallback(_.debounce((value) => setDebouncedSelectedTime(value), 1000), [])

  const onChange = (e,val) => {
    setSelectedTime(timeMarks[val])
    debouncedOnChange(timeMarks[val])
  }

  const onEdit = () => {
    setSelectedOrder(orders.find(i => i.id === selectedTable.data.booking_id))
    menuClose()
  }

  const onDelete = () => {
    if(confirm('Do you really want to delete this order?')) {
      menuClose()
      axios.delete(`${process.env.MIX_API_URL}/api/orders/${selectedTable.data.booking_id}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(() => {
        eventBus.dispatch('orderEdited')
      })
    }
  }

  const setStatus = (status) => {
    menuClose()
    const order = orders.find(i => i.id === selectedTable.data.booking_id)
    axios.post(`${process.env.MIX_API_URL}/api/orders/${selectedTable.data.booking_id}`, {
        ...order,
        reservation_time: moment(order.reservation_time).format('YYYY-MM-DD HH:mm:ss'),
        status
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }
    ).then(() => {
      eventBus.dispatch('orderEdited')
    })
  }

  const handleNewBookingClick = () => {
    setSelectedOrder({
      area_id: localStorage.getItem('area_id'),
      comment: "",
      customer: {},
      customer_id: null,
      is_take_away: 0,
      length: 120,
      marks: "",
      place_id: localStorage.getItem('place_id'),
      reservation_time: Moment().utc().format('YYYY-MM-DD HH:mm'),
      seats: 1,
      source: "internal",
      status: "confirmed",
      table_ids: [selectedTable.id],
      tableplan_id: 0,
    })
  }

  return (<>
    <Box sx={{ p: 3, pb:0 }}>
      <Slider
        size="small"
        value={timeMarks.findIndex(i => i === selectedTime)}
        step={1}
        min={0}
        valueLabelFormat={value => {
            return <div>{Moment.utc(timeMarks[value],'HH:mm').local().format('HH:mm')}</div>
        }}
        name="selectedTime"
        onChange={onChange}
        max={timeMarks.length - 1}
        valueLabelDisplay="on"
      />
    </Box>
    {loading ? <div><CircularProgress/></div> : <>
      <canvas id="plan-canvas" width={width} height={height}/>
      <Menu
        keepMounted
        id="plan-canvas-menu"
        open={menuAnchorEl.mouseY !== null}
        onClose={menuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          menuAnchorEl.mouseY !== null && menuAnchorEl.mouseX !== null
          ? {top: menuAnchorEl.mouseY, left: menuAnchorEl.mouseX}
          : undefined
        }
      >
        {selectedTable?.data?.order ?
          <div>
            <MenuItem onClick={onEdit}>{t('Edit booking')}</MenuItem>
            <MenuItem onClick={onDelete}>{t('Delete booking')}</MenuItem>
            <MenuItem onClick={() => setStatus('arrived')}>{t('Set arrived')}</MenuItem>
            <MenuItem onClick={() => setStatus('completed')}>{t('Set left table')}</MenuItem>
            <MenuItem onClick={() => setStatus('confirmed')}>{t('Set confirmed')}</MenuItem>
          </div>
        :
          <div>
            <MenuItem onClick={handleNewBookingClick}>{t('New booking')}</MenuItem>
          </div>
        }
      </Menu>
      <Button
        variant="contained"
        onClick={() => setFullWidth(prev => !prev)}
        className="canvas-toggle-btn"
      >
        {isFullWidth ? <BsFullscreenExit /> : <BsFullscreen />}
      </Button>
    </>}
  </>);
};

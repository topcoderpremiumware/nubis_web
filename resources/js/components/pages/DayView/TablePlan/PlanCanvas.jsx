import React, {useEffect, useState} from "react";
import {useTranslation} from 'react-i18next';
import {fabric} from 'fabric';
import {circTable, landscape, rectTable} from "../../TablePlanSetup/tableTypes";
import {Box, CircularProgress, Menu, MenuItem, Slider} from "@mui/material";
import Moment from "moment";
import _ from "lodash";
import { useCallback } from "react";
// import TablePropertiesPopup from "./TablePropertiesPopup";

export default function PlanCanvas(props) {
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
  const [propertiesOpen, setPropertiesOpen] = useState(false)
  const width = 840
  const height = 840
  const grid = 20
  const backgroundColor = '#ffffff'
  const lineStroke = '#ebebeb'
  var upperCanvas
  var mouseEvent = 'up'

  useEffect(() => {
    getPlan()
    getOrders()
    getTimesList()
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
    console.log('log')
    markOrderedTables()
  },[debouncedSelectedTime])

  const getTimesList = () => {
    let timesArray = []
    let time = JSON.parse(localStorage.getItem('time'))
    let from = Moment(new Date('1970-01-01 '+time['from']))
    let to = Moment(new Date('1970-01-01 '+time['to']))
    while(from <= to) {
      timesArray.push(from.clone().format('HH:mm'))
      from.add(15, 'minutes')
    }
    setTimeMarks(timesArray)
    
    let lessTime = 0
    const now = Moment(new Date('1970-01-01 ' + Moment().format('HH:mm')))
    timesArray.forEach(i => {
      const fullLessTime = Moment(new Date('1970-01-01 ' + lessTime))
      const time = Moment(new Date('1970-01-01 ' + i))
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
    let date = localStorage.getItem('date') || Moment().format('YYYY-MM-DD')
    let time = JSON.parse(localStorage.getItem('time'))
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
        if(item.status === 'waiting' || item.is_take_away) return false
        item.from = Moment(item.reservation_time)
        item.to = Moment(item.reservation_time).add(item.length, 'minutes')
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
      // table.on('mouseup', onMoveObject)
      table.lockMovementX = true
      table.lockMovementY = true
      canvas.add(table)
      key++
    }
  }

  const markOrderedTables = () => {
    let tempPlan = plan
    if(tempPlan.hasOwnProperty('data')){
      tempPlan.data.map((item) => {item.markColor = ''; item.order = ''; return item})
      tempPlan.data.map((item) => {
        if(item.type.includes('rect') || item.type.includes('circ')){
          orders.forEach((order) => {
            if(order.table_ids.includes(item.number)){
              let date = localStorage.getItem('date') || Moment().format('YYYY-MM-DD')
              let now = Moment(date+' '+debouncedSelectedTime)
              if(item.order === ''){
                if(now.isBetween(order.from,order.to) || now.isSame(order.from)){
                  let duration = Moment.duration(order.to.diff(now));
                  let hours = parseInt(duration.asHours())
                  let minutes = parseInt(duration.asMinutes()) % 60
                  item.order = (0+''+hours).slice(-2)+':'+(0+''+minutes).slice(-2)
                  item.markColor = '#f59827'
                }else if(now.isBefore(order.from)){
                  item.order = order.from.format('HH:mm')
                  item.markColor = '#ffd744'
                }else{
                  item.order = ''
                  item.markColor = ''
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

  return (<>
    <Box sx={{ p: 3, pb:0 }}>
      <Slider
        size="small"
        value={timeMarks.findIndex(i => i === selectedTime)}
        step={1}
        min={0}
        valueLabelFormat={value => {
          if(timeMarks.hasOwnProperty(value)){
            return <div>{timeMarks[value]}</div>
          }else{
            return <div>{value}</div>
          }
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
        {/*<MenuItem onClick={openProperties}>{t('Properties')}</MenuItem>*/}
        {/*<MenuItem onClick={deleteTable}>{t('Delete')}</MenuItem>*/}
      </Menu>
    </>}
  </>);
};

import React, {useEffect, useState} from "react";
import {useTranslation} from 'react-i18next';
import Timeline from 'react-calendar-timeline'
import 'react-calendar-timeline/lib/Timeline.css'
import {Button, Tooltip} from "@mui/material";
import TimelineHeaders from "react-calendar-timeline/lib/lib/headers/TimelineHeaders";
import DateHeader from "react-calendar-timeline/lib/lib/headers/DateHeader";
import Moment from "moment";
import {BsFullscreen, BsFullscreenExit} from "react-icons/bs";
import eventBus from "../../../../eventBus";
// https://www.npmjs.com/package/react-calendar-timeline

export default function FoodPlan(props) {
  const { t } = useTranslation();

  const selectedDate = localStorage.getItem('date') || Moment.utc().format('YYYY-MM-DD')
  const selectedTime = JSON.parse(localStorage.getItem('time'))

  const [groups, setGroups] = useState([])
  const [items, setItems] = useState([])
  const [lineFrom, setLineFrom] = useState(Moment(selectedDate+' '+(selectedTime.from || '00:00:00'),'YYYY-MM-DD HH:mm:ss'))
  const [lineTo, setLineTo] = useState(Moment(selectedDate+' '+(selectedTime.to || '22:59:59'),'YYYY-MM-DD HH:mm:ss').add(1,'hour'))

  let channelName

  const itemRenderer = ({item, itemContext, getItemProps, getResizeProps}) => {
    const { left: leftResizeProps, right: rightResizeProps } = getResizeProps()
    return (
      <Tooltip title={item.tip} arrow>
        <div {...getItemProps(item.itemProps)}>
          {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : ''}
            <div
              className="rct-item-content"
              style={{ maxHeight: `${itemContext.dimensions.height}` }}
            >{item.title_name}</div>
          {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : ''}
        </div>
      </Tooltip>
    )
  }

  useEffect(() => {
    getPlan()
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
      redrawComponent()
    }
    function areaChanged(){
      redrawComponent()
    }
    function dateChanged(){
      redrawComponent()
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

  const redrawComponent = () => {
    getPlan()
    getOrders()
  }

  const getPlan = () => {
    axios.get(`${process.env.MIX_API_URL}/api/tableplans/${selectedTime['tableplan_id']}`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      let g = []
      response.data.data.forEach(item => {
        if(!item.type.includes('land')){
          g.push({id: item.number, title: '#'+item.number+' - '+item.seats})
        }
      })
      setGroups(g)
    }).catch(error => {
    })
  }

  const getOrders = () => {
    axios.get(`${process.env.MIX_API_URL}/api/orders`, {
      params: {
        place_id: localStorage.getItem('place_id'),
        area_id: localStorage.getItem('area_id'),
        reservation_from: selectedDate+' '+(selectedTime.from || '00:00:00'),
        reservation_to: selectedDate+' '+(selectedTime.to || '23:59:59')
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      let tempLineFrom = lineFrom;
      let tempLineTo = lineTo;
      let orders = response.data.map(item => {
        if(item.status === 'waiting' || item.is_take_away) return false
        item.from = Moment(Moment.utc(item.reservation_time).format('YYYY-MM-DD HH:mm:ss'))
        item.to = Moment(Moment.utc(item.reservation_time).format('YYYY-MM-DD HH:mm:ss')).add(item.length, 'minutes')
        if(tempLineFrom.isAfter(item.from)) tempLineFrom = item.from.clone()
        if(tempLineTo.isBefore(item.to)) tempLineTo = item.to.clone().add(1,'hours')
        return item
      }).filter(x => x).sort((a, b) => a.from.valueOf() - b.from.valueOf())
      setLineFrom(tempLineFrom)
      setLineTo(tempLineTo)
      let it = []
      orders.forEach(item => {
        item.table_ids.forEach(t => {
          it.push({
            id: item.id+'_'+t,
            group: t,
            title_name:  '#'+item.id+', ('+item.seats + ') ' +(item.customer_id ? item.customer.first_name+' '+item.customer.last_name :
              (item?.first_name ? item.first_name+' '+item.last_name : 'Walk in')),
            tip: tableTip(item),
            canMove: false,
            canResize: false,
            start_time: item.from.valueOf(),
            end_time: item.to.valueOf()
          })
        })
      })
      setItems(it)
    }).catch(error => {
    })
  }

  const tableTip = (order) => {
    return (<div>
      {order.customer_id ? (order.customer.first_name+' '+order.customer.last_name) : 'Walk in'}
      <br/>
      {order.from.format('HH:mm')+' - '+order.to.format('HH:mm')}
      <br/>
      {order.seats+' '+t('seats')}
      <br/>
      {order.table_ids.join(', ')+' '+t('table')}
    </div>)
  }

  return (<div style={{width:2000}}>
    {(groups && items) && <Timeline
      groups={groups}
      items={items}
      itemRenderer={itemRenderer}
      buffer={1}
      minZoom={6 * 60 * 60 * 1000}
      maxZoom={6 * 60 * 60 * 1000}
      // defaultTimeStart={lineFrom}
      // defaultTimeEnd={lineTo}
      visibleTimeStart={lineFrom.valueOf()}
      visibleTimeEnd={lineTo.valueOf()}
    >
      <TimelineHeaders>
        <DateHeader unit="primaryHeader" labelFormat="YYYY-MM-DD" />
        <DateHeader labelFormat="HH:mm" />
      </TimelineHeaders>
    </Timeline>}
    <Button
      variant="contained"
      onClick={() => props.setFullWidth(prev => !prev)}
      className="canvas-toggle-btn"
    >
      {props.isFullWidth ? <BsFullscreenExit /> : <BsFullscreen />}
    </Button>
  </div>);
}

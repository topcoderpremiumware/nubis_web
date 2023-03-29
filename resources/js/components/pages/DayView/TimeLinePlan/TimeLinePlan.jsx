import React, {useEffect, useState} from "react";
import {useTranslation} from 'react-i18next';
import Timeline from 'react-calendar-timeline'
import 'react-calendar-timeline/lib/Timeline.css'
import moment from 'moment'
import {Button, Tooltip} from "@mui/material";
import TimelineHeaders from "react-calendar-timeline/lib/lib/headers/TimelineHeaders";
import DateHeader from "react-calendar-timeline/lib/lib/headers/DateHeader";
import Moment from "moment";
import {BsFullscreen, BsFullscreenExit} from "react-icons/bs";
// https://www.npmjs.com/package/react-calendar-timeline

export default function TimeLinePlan(props) {
  const { t } = useTranslation();

  const [groups, setGroups] = useState([])
  const [items, setItems] = useState([])

  const selectedDate = localStorage.getItem('date') || moment.utc().format('YYYY-MM-DD')
  const selectedTime = JSON.parse(localStorage.getItem('time'))

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
  },[])

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
      let orders = response.data.map(item => {
        if(item.status === 'waiting' || item.is_take_away) return false
        item.from = Moment.utc(item.reservation_time)
        item.to = Moment.utc(item.reservation_time).add(item.length, 'minutes')
        return item
      }).filter(x => x).sort((a, b) => a.from.valueOf() - b.from.valueOf())
      let it = []
      orders.forEach(item => {
        item.table_ids.forEach(t => {
          it.push({
            id: item.id+'_'+t,
            group: t,
            title_name:  '#'+item.id+', ('+item.seats + ') ' +(item.customer_id ? item.customer.first_name+' '+item.customer.last_name : 'Walk in'),
            tip: tableTip(item),
            canMove: false,
            canResize: false,
            start_time: moment.utc(selectedDate+' '+item.from.utc().format('HH:mm'),'YYYY-MM-DD HH:mm'),
            end_time: moment.utc(selectedDate+' '+item.to.utc().format('HH:mm'),'YYYY-MM-DD HH:mm')
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
      {order.from.local().format('HH:mm')+' - '+order.to.local().format('HH:mm')}
      <br/>
      {order.seats+' '+t('seats')}
      <br/>
      {order.table_ids.join(', ')+' '+t('table')}
    </div>)
  }

  return (<div style={{width:1000}}>
    {(groups && items) && <Timeline
      groups={groups}
      items={items}
      itemRenderer={itemRenderer}
      buffer={1}
      minZoom={6 * 60 * 60 * 1000}
      maxZoom={6 * 60 * 60 * 1000}
      // defaultTimeStart={moment.utc(selectedDate+' '+selectedTime.from,'YYYY-MM-DD HH:mm:ss')}
      // defaultTimeEnd={moment.utc(selectedDate+' '+selectedTime.to,'YYYY-MM-DD HH:mm:ss')}
      visibleTimeStart={moment.utc(selectedDate+' '+(selectedTime.from || '00:00:00'),'YYYY-MM-DD HH:mm:ss').valueOf()}
      visibleTimeEnd={moment.utc(selectedDate+' '+(selectedTime.to || '22:59:59'),'YYYY-MM-DD HH:mm:ss').add(1,'hour').valueOf()}
    >
      <TimelineHeaders>
        <DateHeader labelFormat="HH:mm"/>
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

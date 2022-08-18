import React, {useEffect, useState} from "react";
import {useTranslation} from 'react-i18next';
import Timeline from 'react-calendar-timeline'
import 'react-calendar-timeline/lib/Timeline.css'
import moment from 'moment'
import {Tooltip} from "@mui/material";
import TimelineHeaders from "react-calendar-timeline/lib/lib/headers/TimelineHeaders";
import DateHeader from "react-calendar-timeline/lib/lib/headers/DateHeader";
import Moment from "moment";
// https://www.npmjs.com/package/react-calendar-timeline

export default function TimeLinePlan(props) {
  const { t } = useTranslation();

  const [groups, setGroups] = useState([])
  const [items, setItems] = useState([])

  const selectedDate = localStorage.getItem('date') || moment().format('YYYY-MM-DD')
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
    axios.get(`${process.env.APP_URL}/api/tableplans/${selectedTime['tableplan_id']}`, {
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
    axios.get(`${process.env.APP_URL}/api/orders`, {
      params: {
        place_id: localStorage.getItem('place_id'),
        area_id: localStorage.getItem('area_id'),
        reservation_from: selectedDate+' '+selectedTime.from,
        reservation_to: selectedDate+' '+selectedTime.to
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
      let it = []
      orders.forEach(item => {
        item.table_ids.forEach(t => {
          it.push({
            id: item.id,
            group: t,
            title_name: item.seats+' '+item.customer.first_name+' '+item.customer.last_name,
            tip: tableTip(item),
            canMove: false,
            canResize: false,
            start_time: moment(selectedDate+' '+item.from.format('HH:mm'),'YYYY-MM-DD HH:mm'),
            end_time: moment(selectedDate+' '+item.to.format('HH:mm'),'YYYY-MM-DD HH:mm')
          })
        })
      })
      setItems(it)
    }).catch(error => {
    })
  }

  const tableTip = (order) => {
    return (<div>
      {order.customer.first_name+' '+order.customer.last_name}
      <br/>
      {order.from.format('HH:mm')+' - '+order.to.format('HH:mm')}
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
      // defaultTimeStart={moment(selectedDate+' '+selectedTime.from,'YYYY-MM-DD HH:mm:ss')}
      // defaultTimeEnd={moment(selectedDate+' '+selectedTime.to,'YYYY-MM-DD HH:mm:ss')}
      visibleTimeStart={moment(selectedDate+' '+selectedTime.from,'YYYY-MM-DD HH:mm:ss').valueOf()}
      visibleTimeEnd={moment(selectedDate+' '+selectedTime.to,'YYYY-MM-DD HH:mm:ss').add(1,'hour').valueOf()}
    >
      <TimelineHeaders>
        <DateHeader labelFormat="HH:mm"/>
      </TimelineHeaders>
    </Timeline>}
  </div>);
}

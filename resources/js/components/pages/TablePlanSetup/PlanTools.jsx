import React, {useEffect, useState} from "react";
import  './TablePlanSetup.scss';
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import { fabric } from 'fabric';
import {rectTable, tableTypes} from "./tableTypes";
import {Button, Grid} from "@mui/material";

export default function PlanTools(props) {
  const { t } = useTranslation();
  const [canvas, setCanvas] = useState(null)
  const [plan, setPlan] = useState({})
  const [toolsTab, setToolsTab] = useState('rect')
  const width = 300
  const height = 600
  const backgroundColor = '#ffffff'
  const tableStroke = '#c0c0c0'
  const tabs = {
    rect: t('Rectangular'),
    circ: t('Circular'),
    spec: t('Special'),
    custom: t('Custom Pax'),
  }

  useEffect(() => {
    setCanvas(new fabric.Canvas('plan-tools'))
  },[])

  useEffect(() => {
    console.log('TOOLS props',props.data)
    setPlan(props.data)
  },[props])

  useEffect(() => {
    console.log('TOOLS plan',plan)
    if(plan.hasOwnProperty('data')){
      initCanvas()
    }
  },[canvas,toolsTab,plan])

  const initCanvas = () => {
    if (canvas) {
      canvas.clear()
      canvas.backgroundColor = backgroundColor
      showTables()
    }
  }

  const showTables = () => {
    let yCoord = 5
    let index = 0
    for (const name in tableTypes) {
      if(toolsTab === 'rect' && name.includes('rect')){
        let data = {
          "seats": tableTypes[name].seats.length,
          "color": "#f0f0f0",
          "angle": 0,
          "top": yCoord,
          "left": 5,
          "type": name,
          "qr_code": "",
          "time": []
        }
        const table = rectTable(index,data)
        table.selectable = false
        table.originX = 'left'
        table.originY = 'top'
        table.hoverCursor = 'pointer'
        table.on('mousedown',(e) => {
          console.log('TOOLS edit plan',plan)
          data['number'] = plan.data.length > 0 ? plan.data[plan.data.length-1].number+1 : 1
          data['top'] = 50
          data['left'] = 40
          data['time'] = []
          for (let i=0;i<24*4;i++){
            data['time'].push({
              "is_internal":true,
              "is_online":true,
              "priority":0,
              "min_seats":0,
              "group":null,
              "group_priority":null,
              "booking_length":null
            })
          }
          addTableToTableplan(data)
        })
        canvas.add(table)
        yCoord = yCoord+table.height+10
        index++
      }
    }
  }

  const addTableToTableplan = (data) => {
    let tempPlan = plan
    tempPlan.data.push(data)
    setPlan(prev => ({...prev, data: tempPlan.data}))
    props.onChange(tempPlan)
  }

  return (<>
    <Grid container spacing={1}>
      {Object.keys(tabs).map(key => {
        return <Grid item key={key}>
          <Button variant={key === toolsTab ? 'contained' : 'outlined'} type="button"
                  onClick={e => {setToolsTab(key)}}>{tabs[key]}</Button>
        </Grid>
      })}
    </Grid>
    <canvas id="plan-tools" width={width} height={height}/>
    </>);
};

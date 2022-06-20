import React, {useEffect, useState} from "react";
import  './TablePlanSetup.scss';
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import { fabric } from 'fabric';
import {rectTable, circTable, tableTypes, landscape} from "./tableTypes";
import {Box, Button, Grid} from "@mui/material";

export default function PlanTools(props) {
  const { t } = useTranslation();
  const [canvas, setCanvas] = useState(null)
  const [plan, setPlan] = useState({})
  const [toolsTab, setToolsTab] = useState('rect')
  const width = 350
  const height = 1100
  const backgroundColor = '#ffffff'
  const tableStroke = '#c0c0c0'
  const tabs = {
    rect: t('Rectangular'),
    circ: t('Circular'),
    land: t('Landscape'),
    spec: t('Special'),
    // custom: t('Custom Pax'),
  }

  useEffect(() => {
    setCanvas(new fabric.Canvas('plan-tools'))
  },[])

  useEffect(() => {
    setPlan(props.data)
  },[props])

  useEffect(() => {
    initCanvas()
  },[canvas,toolsTab,plan])

  const initCanvas = () => {
    if (canvas) {
      canvas.clear()
      canvas.backgroundColor = backgroundColor
      if(plan.hasOwnProperty('data')) showTables()
    }
  }

  const showTables = async () => {
    let yCoord = 5
    let index = 0
    for (const name in tableTypes) {
      if(name.startsWith('land')){
        var data = {
          "angle": 0,
          "top": yCoord,
          "left": 5,
          "type": name,
        }
      }else{
        var data = {
          "seats": tableTypes[name].seats.length,
          "color": "#f0f0f0",
          "angle": 0,
          "top": yCoord,
          "left": 5,
          "type": name,
          "qr_code": "",
          "time": []
        }
      }
      if (('rect' === toolsTab && name.startsWith('rect')) ||
        ('spec' === toolsTab && name.startsWith('spec_rect'))) {
        const table = rectTable(index, data)
        addTableToCanvas(table, data)
        yCoord = yCoord + table.height + 10
        index++
      }
      if (('circ' === toolsTab && name.startsWith('circ')) ||
        ('spec' === toolsTab && name.startsWith('spec_circ'))) {
        const table = circTable(index, data)
        addTableToCanvas(table, data)
        yCoord = yCoord + table.height + 10
        index++
      }
      if ('land' === toolsTab && name.startsWith('land')) {
        const land = await landscape(index, data)
        addLandToCanvas(land, data)
        yCoord = yCoord + land.height + 10
        index++
      }
    }
  }

  const addLandToCanvas = (table,data) => {
    table.selectable = false
    table.originX = 'left'
    table.originY = 'top'
    table.hoverCursor = 'pointer'
    table.on('mousedown',(e) => {
      data['top'] = 50
      data['left'] = 40
      addTableToTableplan(data)
    })
    canvas.add(table)
  }

  const addTableToCanvas = (table,data) => {
    table.selectable = false
    table.originX = 'left'
    table.originY = 'top'
    table.hoverCursor = 'pointer'
    table.on('mousedown',(e) => {
      let tempTables = plan.data.filter(el => el.hasOwnProperty('number'))
      data['number'] = tempTables.length > 0 ? tempTables[tempTables.length-1].number+1 : 1
      data['top'] = 50
      data['left'] = 40
      data['time'] = []
      for (let i=0;i<24*4;i++){
        data['time'].push({
          "is_internal":true,
          "is_online":true,
          "priority":0,
          "min_seats":0,
          "group":0,
          "group_priority":0,
          "booking_length":0
        })
      }
      addTableToTableplan(data)
    })
    canvas.add(table)
  }

  const addTableToTableplan = (data) => {
    let tempPlan = plan
    tempPlan.data.push(data)
    setPlan(prev => ({...prev, data: tempPlan.data}))
    props.onChange(tempPlan)
  }

  return (<Box sx={{display: "flex", flexDirection: "column", height: 840}}>
    <Grid container spacing={1} sx={{mb:2}}>
      {Object.keys(tabs).map(key => {
        return <Grid item key={key}>
          <Button variant={key === toolsTab ? 'contained' : 'outlined'} type="button"
                  onClick={e => {setToolsTab(key)}}>{tabs[key]}</Button>
        </Grid>
      })}
    </Grid>
    <Box sx={{flex: 1, overflow: "auto"}}>
      <canvas id="plan-tools" width={width} height={height}/>
    </Box>
  </Box>);
};

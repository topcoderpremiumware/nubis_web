import React, {useEffect, useState} from "react";
import './TablePlanSetup.scss';
import {useTranslation} from 'react-i18next';
import {fabric} from 'fabric';
import {circTable, landscape, rectTable} from "./tableTypes";
import {Menu, MenuItem} from "@mui/material";
import TablePropertiesPopup from "./TablePropertiesPopup";
import {isMobile} from "../../../helper";

export default function PlanCanvas(props) {
  const { t } = useTranslation();
  const [canvas, setCanvas] = useState(null)
  const [plan, setPlan] = useState({})
  const [selectedTable, setSelectedTable] = useState({})
  const [menuAnchorEl, setMenuAnchorEl] = useState({
    mouseX: null,
    mouseY: null
  })
  const [propertiesOpen, setPropertiesOpen] = useState(false)
  const width = isMobile ? 460 : 840*2
  const height = isMobile ? 460 : 840*2
  const grid = 20
  const backgroundColor = '#ffffff'
  const lineStroke = '#ebebeb'
  var upperCanvas

  useEffect(() => {
    setCanvas(new fabric.Canvas('plan-canvas'))
  },[])

  useEffect(() => {
    setPlan(props.data)
  },[props])

  useEffect(() => {
    initCanvas()
  },[canvas,plan])

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

      canvas.on('object:moving', function(e) {
        snapToGrid(e.target)
      })
      canvas.on('object:moving', function (e) {
        checkBoudningBox(e)
      })
      canvas.on('object:rotating', function (e) {
        checkBoudningBox(e)
      })
      if(plan.hasOwnProperty('data')) showTables()
    }
  }

  const updateTableToTableplan = (key,data) => {
    let tempPlan = plan
    tempPlan.data[key] = data
    setPlan(prev => ({...prev, data: tempPlan.data}))
    setPropertiesOpen(false)
    props.onChange(tempPlan)
  }

  const showTables = async () => {
    let table
    let key = 0
    for (const item of plan.data) {
      if (item.type.includes('rect')) table = rectTable(key, item)
      if (item.type.includes('circ')) table = circTable(key, item)
      if (item.type.includes('land')) table = await landscape(key, item)
      table.on('mouseup', onMoveObject)
      canvas.add(table)
      key++
    }
  }

  const onMoveObject = (e) => {
    let table = e.target.data
    table.top = e.target.top
    table.left = e.target.left
    updateTableToTableplan(e.target.id,table)
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

  const snapToGrid = (target) => {
    target.set({
      left: Math.round(target.left / (grid / 2)) * grid / 2,
      top: Math.round(target.top / (grid / 2)) * grid / 2
    })
  }

  const checkBoudningBox = (e) => {
    const obj = e.target
    if(!obj) return
    obj.setCoords()

    const objBoundingBox = obj.getBoundingRect()
    if (objBoundingBox.top < 0) {
      obj.set('top', objBoundingBox.height/2)
      obj.setCoords()
    }
    if (objBoundingBox.left > canvas.width - objBoundingBox.width) {
      obj.set('left', canvas.width - objBoundingBox.width/2)
      obj.setCoords()
    }
    if (objBoundingBox.top > canvas.height - objBoundingBox.height) {
      obj.set('top', canvas.height - objBoundingBox.height/2)
      obj.setCoords()
    }
    if (objBoundingBox.left < 0) {
      obj.set('left', objBoundingBox.width/2)
      obj.setCoords()
    }
  }

  const menuClose = () => {
    setMenuAnchorEl({
      mouseX: null,
      mouseY: null
    })
  }

  const openProperties = () => {
    setPropertiesOpen(true)
    menuClose()
  }

  const deleteTable = () => {
    let tempPlan = plan
    if(tempPlan.data.hasOwnProperty(selectedTable.id)){
      tempPlan.data.splice(selectedTable.id, 1)
    }
    setPlan(prev => ({...prev, data: tempPlan.data}))
    props.onChange(tempPlan)
    menuClose()
  }

  const reservedNumbers = () => {
    if(plan.hasOwnProperty('data')){
      return plan.data.map(el => el.number)
        .filter(el => {
          if (!el) return false
          if (selectedTable.hasOwnProperty('data') &&
            selectedTable.data.hasOwnProperty('number')) {
            return el !== selectedTable.data.number
          } else {
            return true
          }
        })
    }else{
      return []
    }
  }

  return (<>
    <canvas id="plan-canvas" width={width} height={height}/>
    <Menu
      keepMounted
      id="plan-canvas-menu"
      open={menuAnchorEl.mouseY !== null}
      onClose={menuClose}
      anchorReference="anchorPosition"
      anchorPosition={
        menuAnchorEl.mouseY !== null && menuAnchorEl.mouseX !== null
          ? { top: menuAnchorEl.mouseY, left: menuAnchorEl.mouseX }
          : undefined
      }
    >
      <MenuItem onClick={openProperties}>{t('Properties')}</MenuItem>
      <MenuItem onClick={deleteTable}>{t('Delete')}</MenuItem>
    </Menu>
    <TablePropertiesPopup
      open={propertiesOpen}
      numbers={reservedNumbers()}
      table={selectedTable}
      onChange={updateTableToTableplan}
      onClose={e => {setPropertiesOpen(false)}}
    />
  </>);
};

import React, {useEffect, useState} from "react";
import  './TablePlanSetup.scss';
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import { fabric } from 'fabric';
import tableTypes from "./tableTypes";

export default function PlanCanvas(props) {
  const { t } = useTranslation();
  const [canvas, setCanvas] = useState(null)
  const width = 840
  const height = 840
  const grid = 20
  const backgroundColor = '#ffffff'
  const lineStroke = '#ebebeb'
  const tableStroke = '#c0c0c0'
  var upperCanvas

  useEffect(() => {
    console.log('fisrt_load',props.data)
    setCanvas(new fabric.Canvas('plan-canvas'))
  },[])

  useEffect(() => {
    console.log('canvas_updated',props.data)
    initCanvas()
  },[canvas])

  useEffect(() => {
    console.log('update_load',props.data)
    initCanvas()
  },[props.data.data])

  const initCanvas = () => {
    console.log('canvas',canvas)
    if (canvas) {
      upperCanvas = document.querySelector('.upper-canvas')
      if (upperCanvas.getAttribute('listener') !== 'true'){
        document.querySelector('.upper-canvas').addEventListener('contextmenu', onObjectMenu,true)
        upperCanvas.setAttribute('listener', 'true')
      }
      canvas.clear()
      // canvas.dispose()

      canvas.backgroundColor = '#ffffff'

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
      showTables()
    }
  }

  const showTables = () => {
    rectTable(0,{
      "seats":2,
      "number":1,
      "color":"#f0f0f0",
      "angle":0,
      "top":50,
      "left":40,
      "type":'rect_1_2_1',
      "qr_code":"",
      "time":[
        {
          "is_internal":true,
          "is_online":true,
          "priority":1,
          "min_seats":1,
          "group":1,
          "group_priority":1,
          "booking_length":0
        }
      ]
    })
  }

  const rectTable = (key,data) => {
    const type = tableTypes[data['type']]
    let seats = []
    type.seats.forEach(seat => {
      const s = new fabric.Rect({
        left: seat.dx,
        top: seat.dy,
        width: seat.width,
        height: seat.height,
        fill: tableStroke,
        strokeWidth: 0,
        originX: 'center',
        originY: 'center',
        selectable: false
      })
      seats.push(s)
    })
    const table = new fabric.Rect({
      width: type.width,
      height: type.height,
      fill: data['color'],
      stroke: tableStroke,
      strokeWidth: 3,
      originX: 'center',
      originY: 'center',
      centeredRotation: true,
      selectable: false,
      rx: 4,
      ry: 4
    })
    const tableG = new fabric.Group([table, ...seats], {
      centeredRotation: true,
      snapAngle: 45,
      originX: 'center',
      originY: 'center',
      angle: data['angle'],
    })

    const text = tableText(data)

    const og = new fabric.Group([tableG, text], {
      left: data['left'],
      top: data['top'],
      centeredRotation: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      snapAngle: 45,
      selectable: true,
      hasControls: false,
      originX: 'center',
      originY: 'center',
      id: key,
      data: data
    })

    canvas.add(og)
    return og
  }

  const tableText = (data) => {
    const textNumber = new fabric.IText('t: '+data['number'].toString(), {
      // fontFamily: 'Calibri',
      top: -8,
      fontSize: 10,
      fill: contrastColor(data['color']),
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    })

    const textSeats = new fabric.IText('s: '+data['seats'].toString(), {
      fontSize: 10,
      fill: contrastColor(data['color']),
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    })

    const textGroup = new fabric.IText('g: '+data['time'][0]['group'].toString(), {
      top: 8,
      fontSize: 10,
      fill: contrastColor(data['color']),
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    })

    const g = new fabric.Group([textNumber, textSeats, textGroup], {
      centeredRotation: true,
      snapAngle: 45,
      originX: 'center',
      originY: 'center',
      angle: data['angle'],
    })

    return g
  }

  const onObjectMenu = (e) => {
    e.preventDefault()
    var pointer = canvas.getPointer(e);
    var objects = canvas.getObjects();
    console.log('objects',objects.length)
    for (var i = objects.length-1; i >= 0; i--) {
      var object = objects[i];
      if (object.containsPoint(pointer) && object.selectable) {
        console.log('selected object',object)
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

  const contrastColor = (hex) => {
    var r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

    return (r * 0.299 + g * 0.587 + b * 0.114) > 186
      ? '#000000'
      : '#FFFFFF';
  }

  const generateId = () => {
    return Math.random().toString(36).substr(2, 8)
  }

  return (
    <canvas id="plan-canvas" width={width} height={height}/>
  );
};

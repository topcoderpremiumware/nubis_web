import React, {useEffect, useState} from "react";
import  './TablePlanSetup.scss';
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'
import { fabric } from 'fabric';

export default function PlanCanvas(props) {
  const { t } = useTranslation();
  const { editor, onReady } = useFabricJSEditor()
  const width = 840
  const height = 840
  const grid = 20
  const backgroundColor = '#ffffff'
  const lineStroke = '#ebebeb'

  useEffect(() => {
    console.log(props.data)
    // editor?.canvas

  },[props])

  const initCanvas = () => {
    let canvas = editor?.canvas
    if (canvas) {
      canvas.clear()
      canvas.dispose()
    }
    canvas.backgroundColor = backgroundColor

    for (let i = 0; i < (canvas.height / grid); i++) {
      const lineX = new fabric.Line([ 0, i * grid, canvas.height, i * grid], {
        stroke: lineStroke,
        selectable: false,
        type: 'line'
      })
      const lineY = new fabric.Line([ i * grid, 0, i * grid, editor?.canvas.height], {
        stroke: lineStroke,
        selectable: false,
        type: 'line'
      })
      sendLinesToBack()
      canvas.add(lineX)
      canvas.add(lineY)
    }

    // canvas.on('object:moving', function(e) {
    //   snapToGrid(e.target)
    // })
    //
    // canvas.on('object:scaling', function(e) {
    //   if (e.target.scaleX > 5) {
    //     e.target.scaleX = 5
    //   }
    //   if (e.target.scaleY > 5) {
    //     e.target.scaleY = 5
    //   }
    //   if (!e.target.strokeWidthUnscaled && e.target.strokeWidth) {
    //     e.target.strokeWidthUnscaled = e.target.strokeWidth
    //   }
    //   if (e.target.strokeWidthUnscaled) {
    //     e.target.strokeWidth = e.target.strokeWidthUnscaled / e.target.scaleX
    //     if (e.target.strokeWidth === e.target.strokeWidthUnscaled) {
    //       e.target.strokeWidth = e.target.strokeWidthUnscaled / e.target.scaleY
    //     }
    //   }
    // })
    //
    // canvas.on('object:modified', function(e) {
    //   e.target.scaleX = e.target.scaleX >= 0.25 ? (Math.round(e.target.scaleX * 2) / 2) : 0.5
    //   e.target.scaleY = e.target.scaleY >= 0.25 ? (Math.round(e.target.scaleY * 2) / 2) : 0.5
    //   snapToGrid(e.target)
    //   if (e.target.type === 'table') {
    //     canvas.bringToFront(e.target)
    //   }
    //   else {
    //     canvas.sendToBack(e.target)
    //   }
    //   sendLinesToBack()
    // })
    //
    // canvas.observe('object:moving', function (e) {
    //   checkBoudningBox(e)
    // })
    // canvas.observe('object:rotating', function (e) {
    //   checkBoudningBox(e)
    // })
    // canvas.observe('object:scaling', function (e) {
    //   checkBoudningBox(e)
    // })
  }

  const sendLinesToBack = () => {
    editor?.canvas.getObjects().map(o => {
      if (o.type === 'line') {
        editor?.canvas.sendToBack(o)
      }
    })
  }

  return (<FabricJSCanvas className="sample-canvas" onReady={onReady} />);
};

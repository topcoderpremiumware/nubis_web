import React, { useEffect, useState } from 'react'
import './TogglePill.css'

export default function TogglePill(props) {
  return (
    <label className="switch" style={{"--switch-width": props.width, "--switch-height": props.height, "--switch-color": props.color}}>
      <input type="checkbox" onChange={props.onChange} checked={!!props.value}/>
      <span className="slider">
        <span className="text off">{props.labelOff}</span>
        <span className="text on">{props.labelOn}</span>
      </span>
    </label>
  )
}

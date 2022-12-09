import React from 'react'
import "../../../book/components/FirstBlock/Counter/Counter.css";
import "./Counter.css";

const GiftCounter = ({
  value,
  max,
  setValue
}) => {
  
  const onChange = ev => {
    if (Number(ev.target.value) && Number(ev.target.value) < max) {
      setValue(Number(ev.target.value)) 
    }
  }

  return (
    <div className="wrapper">
      <div className="counter">
        <button 
          className="decrement"
          onClick={() => setValue(prev => prev > 1 ? prev - 1 : prev)} 
        >
          -
        </button>
        <input
          className="title-counter"
          value={value}
          type="number"
          min="1"
          max={max}
          onChange={onChange}
        />
        <button 
          className="increment"
          onClick={() => setValue(prev => prev < max ? prev + 1 : prev)} 
        >
          +
        </button>
      </div>
      <div className="counter-max" onClick={() => setValue(max)}>Max {max}</div>
    </div>
  )
}

export default GiftCounter
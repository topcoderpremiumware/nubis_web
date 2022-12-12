import React from 'react'
import './AmountInput.css'

const AmountInput = ({
  value,
  min,
  max,
  setValue,
  isError
}) => {

  const onChange = ev => {
    if (Number(ev.target.value)) {
      setValue(Number(ev.target.value))
    }
  }

  return (
    <div className="amount">
      <input
        className={`amount-input ${isError && 'amount-input-error'}`}
        value={value}
        type="number"
        min={min}
        max={max}
        onChange={onChange}
      />
      <div className="amount-currency">DKK</div>
      <div className='amount-wrapper'>
        <div className="amount-set" onClick={() => setValue(min)}>Min {min} DKK</div>
        <div className="amount-set" onClick={() => setValue(max)}>Max {max} DKK</div>
      </div>
    </div>
  )
}

export default AmountInput
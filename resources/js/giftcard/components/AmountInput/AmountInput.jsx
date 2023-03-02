import axios from 'axios'
import React, { useEffect, useState } from 'react'
import './AmountInput.css'

const AmountInput = ({
  value,
  min,
  max,
  setValue,
  isError
}) => {
  const [paymentMethod, setPaymentMethod] = useState({})

  const onChange = ev => {
    if (Number(ev.target.value)) {
      setValue(Number(ev.target.value))
    }
  }

  const getPaymentMethod = async () => {
    const res = await axios.get(`${process.env.MIX_API_URL}/api/places/${window.location.pathname.split('/').slice(-1)[0]}/payment_method`)
    setPaymentMethod(res.data)
  }

  useEffect(() => {
    getPaymentMethod()
  }, [])

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
      <div className="amount-currency">{paymentMethod['online-payment-currency']}</div>
      <div className='amount-wrapper'>
        <div className="amount-set" onClick={() => setValue(min)}>Min {min} {paymentMethod['online-payment-currency']}</div>
        <div className="amount-set" onClick={() => setValue(max)}>Max {max} {paymentMethod['online-payment-currency']}</div>
      </div>
    </div>
  )
}

export default AmountInput
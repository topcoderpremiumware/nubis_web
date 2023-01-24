import { FormControl, MenuItem, OutlinedInput, Select, TextField } from '@mui/material'
import React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCreditCardNumber, formatCVC, formatExpirationDate } from '../../../../helper'
import './PrepaymentModal.scss'

const PrepaymentModal = (props) => {
  const { t } = useTranslation();

  const {
    active,
    setActive,
    restaurantInfo,
    selectedDay,
    selectedTime,
    guestValue
  } = props

  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(1)
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')

  const handleInputChange = ({ target }) => {
    if (target.name === "number") {
      setNumber(formatCreditCardNumber(target.value))
    } else if (target.name === "expiry") {
      setExpiry(formatExpirationDate(target.value))
    } else if (target.name === "cvc") {
      setCvc(formatCVC(target.value))
    }
  };

  const handleSubmit = async () => {

  }

  return (
    <div
      className={active ? "prepayment-modal active" : "prepayment-modal"}
      onClick={() => setActive(false)}
    >
      <div className="prepayment-modal__content" onClick={(e) => e.stopPropagation()}>
        <div
          className="close-icon"
          onClick={() => setActive(false)}
        >✕</div>
        <div className="title prepayment-modal-title">Prepayment</div>
        <p>In order to complete from reservation at <b>{restaurantInfo.name}</b> the <b>{`${selectedDay.day}-${selectedDay.month}-${selectedDay.year}`} {selectedTime}</b> the following must be paid:</p>
        <div className="prepayment-form">
          Please choose from the following options for {guestValue} pers.:
          <div className="prepayment-flex">
            <FormControl sx={{width: 60}}>
              <Select
                displayEmpty
                size="small"
                value={adults}
                onChange={(ev) => setAdults(ev.target.value)}
                input={<OutlinedInput />}
              >
                {[...Array(guestValue).keys()].map((i) => (
                  <MenuItem
                    key={i}
                    value={i + 1}
                  >
                    {i + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <span>Adult 20.00 EUR</span>
          </div>
          <div className="prepayment-flex">
            <FormControl sx={{width: 60}}>
              <Select
                displayEmpty
                size="small"
                value={children}
                onChange={(ev) => setChildren(ev.target.value)}
                input={<OutlinedInput />}
              >
                {[...Array(guestValue).keys()].map((i) => (
                  <MenuItem
                    key={i}
                    value={i + 1}
                  >
                    {i + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <span>Child (under 12) 12.00 EUR</span>
          </div>
          <div className='prepayment-total'>64 EUR</div>

          <FormControl sx={{ width: "100%" }}>
            <TextField 
              label="Card number" 
              variant="outlined"
              size="small"
              pattern="[\d| ]{16}"
              required
              name="number"
              value={number}
              onChange={handleInputChange}
            />
          </FormControl>
          <div className="prepayment-flex">
            <FormControl sx={{ width: "100%" }}>
              <TextField 
                label="Valid Thru" 
                variant="outlined"
                size="small"
                pattern="\d\d/\d\d"
                required
                name="expiry"
                value={expiry}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl sx={{ width: "100%" }}>
              <TextField 
                label="CVC" 
                variant="outlined"
                size="small"
                pattern="\d{3}"
                required
                name="cvc"
                value={cvc}
                onChange={handleInputChange}
              />
            </FormControl>
          </div>
          <button
            type="button"
            className="button-main prepayment-button"
            // disabled={!selectedRest}
            onClick={handleSubmit}
          >
            {t('Pay now')}
          </button>
        </div>

        <h5 className='prepayment-list-title'>Terms</h5>
        <ul className='prepayment-list'>
          <li>The full amount is refunded for cancellation up to 24 hours before reservation starts.</li>
          <li>No refund or deduction for absent guests.</li>
          <li>Only persons aged 18 or over may place orders.</li>
          <li>Your credit card information will not be stored.</li>
          <li>All questions related to reservation and payment should be directed to My Restaurant on 12345678.</li>
          <li>Business information: Company Name, Main road 1, 2300 Copenhagen, VAT ID 12345678</li>
        </ul>
      </div>
    </div>
  )
}

export default PrepaymentModal
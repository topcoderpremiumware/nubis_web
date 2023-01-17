import { Button, FormControlLabel, FormGroup, MenuItem, Select, Switch, TextField } from '@mui/material'
import React, {useEffect} from 'react'
import { useState } from 'react'
import eventBus from "../../../../eventBus";
import {useTranslation} from "react-i18next";
import './PaymentSettings.scss'

const PaymentSettings = () => {
  const { t } = useTranslation();

  const [method, setMethod] = useState('Deduct')
  const [prepayment, setPrepayment] = useState(false)
  const [amount, setAmount] = useState(0)
  const [currency, setCurrency] = useState('DDK')

  // useEffect(() => {
  //   getPrepayment()
  //   getAmount()
  //   getCurrency()
  //   eventBus.on("placeChanged", () => {
  //     getPrepayment()
  //     getAmount()
  //     getCurrency()
  //   })
  // },[])

  // const getPrepayment = () => {
  //   axios.get(`${process.env.MIX_API_URL}/api/settings`,{
  //     params: {
  //       place_id: localStorage.getItem('place_id'),
  //       name: 'is-online-payment'
  //     },
  //     headers: {
  //       Authorization: 'Bearer ' + localStorage.getItem('token')
  //     }
  //   }).then(response => {
  //     setPrepayment(response.data.value)
  //   }).catch(error => {
  //     setPrepayment(false)
  //   })
  // }

  // const getAmount = () => {
  //   axios.get(`${process.env.MIX_API_URL}/api/settings`,{
  //     params: {
  //       place_id: localStorage.getItem('place_id'),
  //       name: 'online-payment-amount'
  //     },
  //     headers: {
  //       Authorization: 'Bearer ' + localStorage.getItem('token')
  //     }
  //   }).then(response => {
  //     setAmount(response.data.value)
  //   }).catch(error => {
  //     setAmount(0)
  //   })
  // }

  // const getCurrency = () => {
  //   axios.get(`${process.env.MIX_API_URL}/api/settings`,{
  //     params: {
  //       place_id: localStorage.getItem('place_id'),
  //       name: 'online-payment-currency'
  //     },
  //     headers: {
  //       Authorization: 'Bearer ' + localStorage.getItem('token')
  //     }
  //   }).then(response => {
  //     setCurrency(response.data.value)
  //   }).catch(error => {
  //     setCurrency('')
  //   })
  // }

  const onSave = async (e) => {
    e.preventDefault()
    // axios.post(`${process.env.MIX_API_URL}/api/settings`, {
    //   place_id: localStorage.getItem('place_id'),
    //   name: 'is-online-payment',
    //   value: prepayment
    // }).then(response => {
    //   eventBus.dispatch("notification", {type: 'success', message: 'Online payment saved'});
    // }).catch(error => {})

    // axios.post(`${process.env.MIX_API_URL}/api/settings`, {
    //   place_id: localStorage.getItem('place_id'),
    //   name: 'online-payment-amount',
    //   value: amount
    // }).then(response => {
    //   eventBus.dispatch("notification", {type: 'success', message: 'Online payment amount saved'});
    // }).catch(error => {})

    // axios.post(`${process.env.MIX_API_URL}/api/settings`, {
    //   place_id: localStorage.getItem('place_id'),
    //   name: 'online-payment-currency',
    //   value: currency
    // }).then(response => {
    //   eventBus.dispatch("notification", {type: 'success', message: 'Online payment currency saved'});
    // }).catch(error => {})
  }

  return (
    <div className='pages__container'>
      <h2>{t('Payment Settings')}</h2>
      <p className='mb-3'>{t('If you want to accept advance payment or deposits from your guests, you can create one or more payment setups below.')}</p>
      
      <form onSubmit={onSave}>
        <div className="d-flex gap-5 mb-4">
          <b>{t('Method')}</b>
          <div className="d-flex gap-1">
            <div 
              className={method === "Deduct" ? "payment-card payment-card-selected" : "payment-card"}
              onClick={() => setMethod('Deduct')}
            >
              <h4>{t('Deduct')}</h4>
              <p>{t('The amount is withdrawn immediately')}</p>
            </div>
            <div 
              className={method === "Reserve" ? "payment-card payment-card-selected" : "payment-card"}
              onClick={() => setMethod('Reserve')}
            >
              <h4>{t('Reserve')}</h4>
              <p>{t('The amount is reserved and waithdrawn 6 hours before arrival or in case of late cancellation')}</p>
            </div>
            <div 
              className={method === "No-show" ? "payment-card payment-card-selected" : "payment-card"}
              onClick={() => setMethod('No-show')}
            >
              <h4>{t('No-show')}</h4>
              <p>{t('Stores credit card information and charges a no-show or late cancellation fee')}</p>
            </div>
          </div>
        </div>
        <div className="d-flex gap-5 mb-4">
          <b>{t('Price')}</b>
          <div className="d-flex gap-1">
            <TextField label={t('Amount')} size="small" fullWidth
              type="text" value={amount}
              onChange={ev => setAmount(ev.target.value)} 
            />
            <Select value={currency}
              size="small"
              onChange={ev => setCurrency(ev.target.value)}
            >
              <MenuItem value="DDK">DDK</MenuItem>
            </Select>
            <Select value={'Per guest'}
              size="small"
              onChange={ev => {}}
            >
              <MenuItem value="Per guest">Per guest</MenuItem>
            </Select>
          </div>
        </div>
        <div className="d-flex gap-5 mb-4">
          <b>{t('Cancellation deadline')}</b>
          <div className="d-flex gap-1">
            <Select value={'24h'}
              size="small"
              onChange={ev => {}}
            >
              <MenuItem value="24h">24 hours</MenuItem>
            </Select>
          </div>
        </div>
        <Button variant="contained" type="submit">{t('Save')}</Button>
        {/* <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={prepayment == 1}
                onChange={(ev, checked) => setPrepayment(checked)}
              />
            }
            label={t('Online payment')}
          />
        </FormGroup>
        <div className="mt-3 mb-3">
          <TextField label={t('Amount')} size="small" fullWidth
            type="text" id="amount" name="amount" value={amount}
            onChange={ev => setAmount(ev.target.value)} />
        </div>
        <div className="mt-3 mb-3">
          <TextField label={t('Currency')} size="small" fullWidth placeholder="USD"
                     type="text" id="currency" name="currency" value={currency}
                     onChange={ev => setCurrency(ev.target.value)} />
        </div>
        <Button variant="contained" type="submit">{t('Save')}</Button> */}
      </form>
    </div>
  )
}

export default PaymentSettings

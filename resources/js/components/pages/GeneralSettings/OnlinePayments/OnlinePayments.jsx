import { Button, FormControlLabel, FormGroup, Switch, TextField } from '@mui/material'
import React, {useEffect} from 'react'
import { useState } from 'react'
import eventBus from "../../../../eventBus";
import {useTranslation} from "react-i18next";

const OnlinePayments = () => {
  const { t } = useTranslation();

  const [prepayment, setPrepayment] = useState(false)
  const [amount, setAmount] = useState(0)
  const [currency, setCurrency] = useState('')

  useEffect(() => {
    getPrepayment()
    getAmount()
    getCurrency()
    eventBus.on("placeChanged", () => {
      getPrepayment()
      getAmount()
      getCurrency()
    })
  },[])

  const getPrepayment = () => {
    axios.get(`${process.env.MIX_APP_URL}/api/settings`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        name: 'is-online-payment'
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setPrepayment(response.data.value)
    }).catch(error => {
      setPrepayment(false)
    })
  }

  const getAmount = () => {
    axios.get(`${process.env.MIX_APP_URL}/api/settings`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        name: 'online-payment-amount'
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setAmount(response.data.value)
    }).catch(error => {
      setAmount(0)
    })
  }

  const getCurrency = () => {
    axios.get(`${process.env.MIX_APP_URL}/api/settings`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        name: 'online-payment-currency'
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setCurrency(response.data.value)
    }).catch(error => {
      setCurrency('')
    })
  }

  const onSave = async (e) => {
    e.preventDefault()
    axios.post(`${process.env.MIX_APP_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'is-online-payment',
      value: prepayment
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Online payment saved'});
    }).catch(error => {})

    axios.post(`${process.env.MIX_APP_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'online-payment-amount',
      value: amount
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Online payment amount saved'});
    }).catch(error => {})

    axios.post(`${process.env.MIX_APP_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'online-payment-currency',
      value: currency
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Online payment currency saved'});
    }).catch(error => {})
  }

  return (
    <div className='pages__container'>
      <h2>{t('Online Payments')}</h2>
      <form onSubmit={onSave}>
        <FormGroup>
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
        <Button variant="contained" type="submit">{t('Save')}</Button>
      </form>
    </div>
  )
}

export default OnlinePayments

import { Alert, Button, Collapse, FormControlLabel, FormGroup, IconButton, MenuItem, Select, Switch, Stack, TextField } from '@mui/material'
import React, {useEffect} from 'react'
import { useState } from 'react'
import eventBus from "../../../../eventBus";
import {useTranslation} from "react-i18next";
import './PaymentSettings.scss'
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';

const PaymentSettings = () => {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState('deduct')
  const [prepayment, setPrepayment] = useState(false)
  const [amount, setAmount] = useState(0)
  const [currency, setCurrency] = useState('DDK')
  const [cancelDeadline, setCancelDeadline] = useState(30)
  const [stripeKey, setStripeKey] = useState('')
  const [stripeSecret, setStripeSecret] = useState('')
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('')

  useEffect(() => {
    getPrepayment()
    getAmount()
    getCurrency()
    getMethod()
    getCancelDeadline()
    getStripeKey()
    getStripeSecret()
    getStripeWebhookSecret()

    function placeChanged(){
      getPrepayment()
      getAmount()
      getCurrency()
      getMethod()
      getCancelDeadline()
    }
    eventBus.on("placeChanged", placeChanged)

    return () => {
      eventBus.remove("placeChanged", placeChanged)
    }
  },[])

  const currencies = ['AUD','CAD','CHF','DKK','EUR','GBP','HKD','HUF','ISK','JPY','NOK','RON','SEK','SGD','USD']
  const cancelTimes = [
    {title: `30 ${t('minutes')}`, value: 30},
    {title: `45 ${t('minutes')}`, value: 45},
    {title: `1 ${t('hour')}`, value: 60},
    {title: `1.5 ${t('hours')}`, value: 60*1.5},
    {title: `2 ${t('hours')}`, value: 60*2},
    {title: `2.5 ${t('hours')}`, value: 60*2.5},
    {title: `3 ${t('hours')}`, value: 60*3},
    {title: `4 ${t('hours')}`, value: 60*4},
    {title: `5 ${t('hours')}`, value: 60*5},
    {title: `6 ${t('hours')}`, value: 60*6},
    {title: `8 ${t('hours')}`, value: 60*8},
    {title: `12 ${t('hours')}`, value: 60*12},
    {title: `24 ${t('hours')}`, value: 60*24},
    {title: `36 ${t('hours')}`, value: 60*36},
    {title: `48 ${t('hours')}`, value: 60*48},
    {title: `3 ${t('days')}`, value: 60*24*3},
    {title: `4 ${t('days')}`, value: 60*24*4},
    {title: `5 ${t('days')}`, value: 60*24*5},
    {title: `6 ${t('days')}`, value: 60*24*6},
    {title: `7 ${t('days')}`, value: 60*24*7},
    {title: `14 ${t('days')}`, value: 60*24*14},
    {title: `21 ${t('days')}`, value: 60*24*21},
    {title: t('Not allowed'), value: 60*24*1000},
  ]

  const getPrepayment = () => {
    axios.get(`${process.env.MIX_API_URL}/api/settings`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        name: 'is-online-payment'
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setPrepayment(Number(response.data.value))
    }).catch(error => {
      setPrepayment(false)
    })
  }

  const getAmount = () => {
    axios.get(`${process.env.MIX_API_URL}/api/settings`,{
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
    axios.get(`${process.env.MIX_API_URL}/api/settings`,{
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

  const getMethod = () => {
    axios.get(`${process.env.MIX_API_URL}/api/settings`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        name: 'online-payment-method'
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setMethod(response.data.value)
    }).catch(error => {
      setMethod('deduct')
    })
  }

  const getStripeKey = () => {
    axios.get(`${process.env.MIX_API_URL}/api/settings`, {
      params: {
        place_id: localStorage.getItem('place_id'),
        name: 'stripe-key'
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setStripeKey(response.data.value)
    }).catch(error => {
      setStripeKey('')
    })
  }

  const getStripeSecret = () => {
    axios.get(`${process.env.MIX_API_URL}/api/settings`, {
      params: {
        place_id: localStorage.getItem('place_id'),
        name: 'stripe-secret'
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setStripeSecret(response.data.value)
    }).catch(error => {
      setStripeSecret('')
    })
  }

  const getStripeWebhookSecret = () => {
    axios.get(`${process.env.MIX_API_URL}/api/settings`, {
      params: {
        place_id: localStorage.getItem('place_id'),
        name: 'stripe-webhook-secret'
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setStripeWebhookSecret(response.data.value)
    }).catch(error => {
      setStripeWebhookSecret('')
    })
  }

  const getCancelDeadline = () => {
    axios.get(`${process.env.MIX_API_URL}/api/settings`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        name: 'online-payment-cancel-deadline'
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setCancelDeadline(response.data.value)
    }).catch(error => {
      setCancelDeadline(0)
    })
  }

  const onSave = async (e) => {
    e.preventDefault()
    axios.post(`${process.env.MIX_API_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'is-online-payment',
      value: prepayment
    }, {
      headers:{
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Online payment saved'});
    }).catch(error => {})

    axios.post(`${process.env.MIX_API_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'online-payment-amount',
      value: amount
    }, {
      headers:{
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Online payment amount saved'});
    }).catch(error => {})

    axios.post(`${process.env.MIX_API_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'online-payment-currency',
      value: currency
    }, {
      headers:{
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Online payment currency saved'});
    }).catch(error => {})

    axios.post(`${process.env.MIX_API_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'online-payment-method',
      value: method
    }, {
      headers:{
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Online payment method saved'});
    }).catch(error => {})

    axios.post(`${process.env.MIX_API_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'online-payment-cancel-deadline',
      value: cancelDeadline
    }, {
      headers:{
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Online payment cancellation deadline saved'});
    }).catch(error => {})
  }

  const toogleSwitch = (ev, checked) => {
    if (checked && !stripeKey && !stripeSecret && !stripeWebhookSecret) {
      setOpen(true)
      return
    }
    setPrepayment(checked)
  }

  return (
    <div className='pages__container'>
      <Collapse in={open}>
        <Alert
          variant="outlined" severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setOpen(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {t('Please, enter stripe settings in Payment gateway')}
        </Alert>
      </Collapse>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Payment Settings')}</h2>
      </Stack>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={prepayment == 1}
              onChange={toogleSwitch}
            />
          }
          label={t('Online payment')}
        />
      </FormGroup>
      <p className='mb-3'>
        {t('If you want to accept advance payment or deposits from your guests, you can create payment setups below.')}
      </p>

      <form onSubmit={onSave}>
        <div className="d-flex gap-5 mb-4">
          <b>{t('Method')}</b>
          <div className="d-flex gap-1">
            <div
              className={`payment-card ${method === "deduct" && " payment-card-selected"} ${!prepayment && " payment-card-disabled"}`}
              onClick={() => prepayment && setMethod('deduct')}
            >
              <h4>{t('Deduct')}</h4>
              <p>{t('The amount is withdrawn immediately')}</p>
            </div>
            <div
              className={`payment-card ${method === "reserve" && " payment-card-selected"} ${!prepayment && " payment-card-disabled"}`}
              onClick={() => prepayment && setMethod('reserve')}
            >
              <h4>{t('Reserve')}</h4>
              <p>{t('The amount is reserved and waithdrawn 6 hours before arrival or in case of late cancellation')}</p>
            </div>
            <div
              className={`payment-card ${method === "no_show" && " payment-card-selected"} ${!prepayment && " payment-card-disabled"}`}
              onClick={() => prepayment && setMethod('no_show')}
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
              type="number" value={amount}
               onWheel={(e) => e.target.blur()}
              onChange={ev => setAmount(ev.target.value)}
              disabled={!prepayment}
            />
            <Select value={currency}
              size="small"
              onChange={ev => setCurrency(ev.target.value)}
              disabled={!prepayment}
            >
              {currencies.map((c,key) => {
                return <MenuItem key={key} value={c}>{c}</MenuItem>
              })}
            </Select>
            <Select value={'Per guest'}
              size="small"
              onChange={ev => {}}
              disabled={!prepayment}
            >
              <MenuItem value="Per guest">Per guest</MenuItem>
            </Select>
          </div>
        </div>
        <div className="d-flex gap-5 mb-4">
          <b>{t('Cancellation deadline')}</b>
          <div className="d-flex gap-1">
            <Select value={cancelDeadline}
              size="small"
              onChange={ev => setCancelDeadline(ev.target.value)}
              disabled={!prepayment}
            >
              {cancelTimes.map((c,key) => {
                return <MenuItem key={key} value={c.value}>{c.title}</MenuItem>
              })}
            </Select>
          </div>
        </div>
        <Button variant="contained" type="submit">{t('Save')}</Button>
      </form>
    </div>
  )
}

export default PaymentSettings

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuItem, Select, Stack, TextField } from '@mui/material';
import eventBus from "../../../../eventBus";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PaymentGateway = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [type, setType] = useState('Stripe')
  const [stripeKey, setStripeKey] = useState('')
  const [stripeSecret, setStripeSecret] = useState('')
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('')

  const onSubmit = (e) => {
    e.preventDefault();
    axios.post(`${process.env.MIX_API_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'stripe-key',
      value: stripeKey
    },{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Stripe Key saved'});
    }).catch(error => {})

    axios.post(`${process.env.MIX_API_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'stripe-secret',
      value: stripeSecret
    },{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Stripe Secret saved'});
    }).catch(error => {})

    axios.post(`${process.env.MIX_API_URL}/api/settings`, {
      place_id: localStorage.getItem('place_id'),
      name: 'stripe-webhook-secret',
      value: stripeWebhookSecret
    },{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Stripe Webhook Secret saved'});
    }).catch(error => {})
  }

  const getWebhookUrl = () => {
    // return `${process.env.MIX_APP_URL}/api/places/${localStorage.getItem('place_id')}/webhook`
    return `https://tablebookingpos.com/api/places/${localStorage.getItem('place_id')}/webhook`
  }

  useEffect(() => {
    getStripeKey()
    getStripeSecret()
    getStripeWebhookSecret()
    function placeChanged(){
      getStripeKey()
      getStripeSecret()
      getStripeWebhookSecret()
    }
    eventBus.on("placeChanged", placeChanged)

    return () => {
      eventBus.remove("placeChanged", placeChanged)
    }
  }, [])

  const getStripeKey = () => {
    axios.get(`${process.env.MIX_API_URL}/api/settings`,{
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
    axios.get(`${process.env.MIX_API_URL}/api/settings`,{
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
    axios.get(`${process.env.MIX_API_URL}/api/settings`,{
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

  return (
    <div className='pages__container'>
      <Stack spacing={10} mb={2} direction="row" alignItems="center">
        <h2>{t('Payment Gateway')}</h2>
        <Button
          variant="contained"
          size="sm"
          type="button"
          onClick={() => navigate('/VideoGuides')}
        >{t('See Table Booking POS Academy')}</Button>
      </Stack>
      <div className="container-fluid">
        <div className="row">
          <div className="mt-3">
            <form onSubmit={onSubmit}>
              <div className="d-flex align-items-center mb-3 gap-2">
                <h5>{t('Payment Gateway')}:</h5>
                <Select value={type}
                  id="type" name="type" size="small"
                  onChange={setType}
                >
                  <MenuItem value="Stripe">Stripe</MenuItem>
                </Select>
              </div>
              <div className="row">
                <div className="col-lg-6">
                  <p>{t('In order to receive credit card payments and deposits from your guests, Table Booking POS must be connected to a Stripe account.')}</p>
                  <p>
                    {t('With Stripe, you can quickly start receiving payments via credit card - without costs for creation or subscription. You can read more at ')}
                    <a href="https://stripe.com">https://stripe.com</a>
                  </p>
                  <p>
                    {t('Below, you must insert the "Publishable key", "Secret key" found under Company -> Developers -> Api Keys when you are logged into Stripe.')}
                  </p>
                  <p>
                    {t('То add the Webhook Secret you need to go Developers -> Webhooks -> Add endpoint. Then add this link to the requested field ')}
                    <strong>{getWebhookUrl()}</strong>
                  </p>
                  <p>{t('Don\'t forget to add events to the Webhook by pressing "Select events" and add Payment Intent/payment_intent.succeeded event')}</p>
                  <p>
                    {t('Then under Signing secret please press Reveal button to get your Webhook Secret')}
                  </p>
                </div>
              </div>
              <div className="mb-3">
                <TextField label={t('Stripe Key')} size="small" fullWidth
                  type="text" id="stripeKey" name="stripeKey" required
                  value={stripeKey} onChange={e => setStripeKey(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <TextField label={t('Stripe Secret')} size="small" fullWidth
                  type="text" id="secretKey" name="secretKey" required
                  value={stripeSecret} onChange={e => setStripeSecret(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <TextField label={t('Stripe Webhook Secret')} size="small" fullWidth
                 type="text" id="stripeWebhookSecret" name="stripeWebhookSecret" required
                 value={stripeWebhookSecret} onChange={e => setStripeWebhookSecret(e.target.value)}
                />
              </div>
              <Button variant="contained" type="submit">{t('Save')}</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentGateway

import { Button } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './ThankYou.scss'
import eventBus from "../../../eventBus";

const ThankYou = () => {
  const { t } = useTranslation();

  const getHelpPaymentLink = (price_id) => {
    axios.get(`${process.env.MIX_API_URL}/api/billing/get_help_payment_link`, {
      params: {
        place_id: localStorage.getItem('place_id'),
        price_id: price_id
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      window.open(response.data.url, '_blank').focus();
    }).catch(error => {
      if (error.response && error.response.data && error.response.data.errors) {
        for (const [key, value] of Object.entries(error.response.data.errors)) {
          value.forEach(v => {
            eventBus.dispatch("notification", {type: 'error', message: v});
          })
        }
      }else if(error.response && error.response.data && error.response.data.message){
        eventBus.dispatch("notification", {type: 'error', message: error.response.data.message});
      } else {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error.message)
      }
    })
  }

  return (
    <div className='thank-wrapper'>
      <h2 className='thank-title'>{t('Payment completed successfully')}</h2>
      <p className="thank-text">{t('Thank you for your order')}</p>
      <Button variant="contained"
              onClick={() => getHelpPaymentLink('price_1Mvg3pCVi0riU70PmnHz6b2b')}
      >{t('Pay for help')}</Button>
      <p className="thank-text">{t('or')}</p>
      <Button variant="contained">
        <Link to="/VideoGuides" className='thank-link'>
          {t('Start Now')}
        </Link>
      </Button>
    </div>
  )
}

export default ThankYou

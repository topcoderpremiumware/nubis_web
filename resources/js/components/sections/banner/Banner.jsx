import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import './Banner.scss'

const Banner = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const [status, setStatus] = useState('')
  const [smsStatus, setSmsStatus] = useState('')

  useEffect(() => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/bill_paid_status`)
      .then(response => {
        console.log('bill_paid_status',response.data?.status)
        setStatus(response.data?.status)
      })
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/message_limit`)
      .then(response => {
        if(response.data.count < 100){
          setSmsStatus('sms_limit')
        }
      })
  }, [])

  return (<>{(['admin','manager'].includes(window.role) && !['/pricing','/smsPricing'].includes(location.pathname)) &&
    <>
      {status !== 'paid' &&
        <div className={status === 'expired' ? 'page-banner page-banner-active' : 'page-banner'}>
          <div className="page-banner-wrapper">
            <div>
              <h2 className="page-banner-title">{t('One booking system. One fixed price.')}</h2>
              <p className="page-banner-text">{t('Easy to install. Use Table Booking POS academy videos to install Table Booking POSs for your restaurant.')}</p>
            </div>
            <a href="/admin/pricing-new" className="page-banner-link">
              {status === 'expired' ? t('Subscribe now ') : t('Try one month free')}
            </a>
          </div>
        </div>}
      {(status === 'paid' && smsStatus === 'sms_limit') &&
        <div className="page-banner">
          <div className="page-banner-wrapper">
            <div>
              <h2 className="page-banner-title">{t('Your sms sending limit will finish soon!')}</h2>
              {/*<p className="page-banner-text">{t('Buy more SMS')}</p>*/}
            </div>
            <a href="/admin/smsPricing" className="page-banner-link">
              {t('Buy SMS limit')}
            </a>
          </div>
        </div>
      }
    </>
  }</>)
}

export default Banner

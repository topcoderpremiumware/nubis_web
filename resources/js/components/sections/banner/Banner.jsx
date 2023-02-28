import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import './Banner.scss'

const Banner = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const [status, setStatus] = useState('')

  useEffect(() => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/bill_paid_status`)
      .then(response => {
        setStatus(response.data?.status)
      })
  }, [])

  if (location.pathname === '/pricing' || status === 'paid') {
    return null
  }

  return (
    <div className={status === 'expired' ? 'page-banner page-banner-active' : 'page-banner'}>
      <div className="page-banner-wrapper">
        <div>
          <h2 className="page-banner-title">{t('One booking system. One fixed price.')}</h2>
          <p className="page-banner-text">{t('Easy to install. Use Nubis academy videos to install Nubis reservations for your restaurant.')}</p>
        </div>
        <a href="#" className="page-banner-link">
          {status === 'expired' ? t('Subscribe now ') : t('Try one month free')}
        </a>
      </div>
    </div>
  )
}

export default Banner
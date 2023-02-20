import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import './Banner.scss'

const Banner = () => {
  const { t } = useTranslation()
  const location = useLocation()

  if (location.pathname === '/pricing') {
    return null
  }

  return (
    <div className='page-banner'>
      <div className="page-banner-wrapper">
        <div>
          <h2 className="page-banner-title">{t('One booking system. One fixed price.')}</h2>
          <p className="page-banner-text">{t('Easy to install. Use Nubis academy videos to install Nubis reservations for your restaurant.')}</p>
        </div>
        <a href="#" className="page-banner-link">
          {t('Try one month free')}
          {/* Subscribe now */}
        </a>
      </div>
    </div>
  )
}

export default Banner
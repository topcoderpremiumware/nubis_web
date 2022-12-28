import { Button } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './ThankYou.scss'

const ThankYou = () => {
  const { t } = useTranslation();

  return (
    <div className='thank-wrapper'>
      <h2 className='thank-title'>{t('Payment completed successfully')}</h2>
      <p className="thank-text">{t('Thank you for your order')}</p>
      <Button variant="contained">
        <Link to="/DayView" className='thank-link'>
          {t('Return back')}
        </Link>
      </Button>
    </div>
  )
}

export default ThankYou
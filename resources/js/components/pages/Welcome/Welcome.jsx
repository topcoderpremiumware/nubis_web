import { Button } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './Welcome.scss'

const Welcome = () => {
  const { t } = useTranslation();

  return (
    <div className='welcome-wrapper'>
      <h2 className='welcome-title'>{t('Welcome')}</h2>
      <p className="welcome-text">{t('If you are the waiter or manager please wait until the restaurant owner will give you the permission')}</p>
      <p className="welcome-text">{t('or')}</p>
      <Button variant="contained">
        <Link to="/RestaurantNew" className='thank-link'>
          {t('Create your restaurant')}
        </Link>
      </Button>
    </div>
  )
}

export default Welcome

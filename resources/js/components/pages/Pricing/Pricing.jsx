import React from 'react'
import './Pricing.scss'
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';

const Pricing = () => {
  const { t } = useTranslation();

  return (
    <div className='pages__container'>
      <h2>{t('Pricing')}</h2>
      <div className="container-fluid">
        <div className="row">
          <div className="mt-5 d-flex justify-content-center gap-4">
            <div className="pricing-card">
              <h3 className="pricing-title mb-5">Trial</h3>
              <p className="pricing-item">Price: <span>$ 0</span></p>
              <p className="pricing-item mb-auto">Duration: <span>1 month</span></p>
              <Button className="pricing-btn" variant="contained">BUY</Button>
            </div>
            <div className="pricing-card">
              <h3 className="pricing-title mb-5">Premium</h3>
              <p className="pricing-item">Price: <span>$ 15</span></p>
              <p className="pricing-item mb-auto">Duration: <span>1 month</span></p>
              <Button className="pricing-btn" variant="contained">BUY</Button>
            </div>
            <div className="pricing-card">
              <h3 className="pricing-title mb-5">Pro</h3>
              <p className="pricing-item">Price: <span>$ 150</span></p>
              <p className="pricing-item mb-auto">Duration: <span>1 year</span></p>
              <Button className="pricing-btn" variant="contained">BUY</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing
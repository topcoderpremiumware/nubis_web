import React, {useEffect, useState} from 'react'
import './Pricing.scss'
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import eventBus from "../../../eventBus";

const Pricing = () => {
  const { t } = useTranslation();
  const [trialDisabled, setTrialDisabled] = useState(false)

  useEffect(() => {
    getIsTrialPaid()
    eventBus.on("placeChanged",  () => {
      getIsTrialPaid()
    })
  },[])

  const getIsTrialPaid = () => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/is_trial_paid`,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setTrialDisabled(response.data)
    }).catch(error => {})
  }

  const payTrial = () => {
    axios.post(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/pay_trial`,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      console.log('pay trial',response.data)
      setTrialDisabled(true)
    }).catch(error => {})
  }

  const getPaymentLink = (price_id) => {
    axios.get(`${process.env.MIX_API_URL}/api/billing/get_payment_link`,{
      params: {
        place_id: localStorage.getItem('place_id'),
        price_id: price_id
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      window.open(response.data.url, '_blank').focus();
    }).catch(error => {})
  }

  return (
    <div className='pages__container'>
      <h2>{t('Pricing')}</h2>
      <div className="container-fluid">
        <div className="row">
          <div className="mt-5 d-flex justify-content-center gap-4">
            <div className={`pricing-card ${trialDisabled ? 'disabled' : ''}`}>
              <h3 className="pricing-title mb-5">Trial</h3>
              <p className="pricing-item">{t('Price')}: <span>0 DKK</span></p>
              <p className="pricing-item mb-auto">{t('Duration')}: <span>1 {t('month')}</span></p>
              <Button className="pricing-btn" variant="contained" onClick={e => {payTrial()}}>{t('BUY')}</Button>
            </div>
            <div className="pricing-card">
              <h3 className="pricing-title mb-5">Premium</h3>
              <p className="pricing-item">{t('Price')}: <span>15 DKK</span></p>
              <p className="pricing-item mb-auto">{t('Duration')}: <span>1 {t('month')}</span></p>
              <Button className="pricing-btn" variant="contained" onClick={e => {getPaymentLink('price_1MExCVCVi0riU70PbXhcxZb3')}}>{t('BUY')}</Button>
            </div>
            <div className="pricing-card">
              <h3 className="pricing-title mb-5">Pro</h3>
              <p className="pricing-item">{t('Price')}: <span>150 DKK</span></p>
              <p className="pricing-item mb-auto">{t('Duration')}: <span>1 {t('year')}</span></p>
              <Button className="pricing-btn" variant="contained" onClick={e => {getPaymentLink('price_1MExDFCVi0riU70PLaROu9kT')}}>{t('BUY')}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing

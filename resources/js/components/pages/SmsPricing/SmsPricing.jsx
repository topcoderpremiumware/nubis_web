import React from 'react'
import { useTranslation } from 'react-i18next';
import './SmsPricing.scss'

const SmsPricing = () => {
  const { t } = useTranslation();

  const getPaymentLink = (price_id) => {
    axios.get(`${process.env.MIX_API_URL}/api/paid_messages/get_payment_link`, {
      params: {
        place_id: localStorage.getItem('place_id'),
        price_id: price_id
      },
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      window.open(response.data.url, '_blank').focus();
    }).catch(error => { })
  }

  return (
    <div className='smsPricing'>
      <h2 className="smsPricing-title">{t('The Right Pricing For You')}</h2>
      <div className="smsPricing-container">
        <div className="smsPricing-item">
          <h3 className='smsPricing-item-title'><span>{t('Standard')}</span></h3>
          <div className="smsPricing-price-1">500 SMS/250 DKK</div>
          <div className="smsPricing-price-2">0.5 DKK/ per sms</div>
          <div className="smsPricing-hr" />
          <ul className="smsPricing-list">
            <li className="smsPricing-list-item">{t('It is a good option for those who do not send many SMS messages per month.')}</li>
            <li className="smsPricing-list-item">{t('The cost per SMS is reasonable at')} 0.5 DKK/SMS.</li>
            <li className="smsPricing-list-item">{t('The total cost of the plan is relatively low at')} 250 DKK.</li>
          </ul>
          <div className="smsPricing-hr" />
          <button className='smsPricing-btn'
                  onClick={() => getPaymentLink('price_1N0kdaCVi0riU70PkLUOfFfm')}
          >{t('Buy now')}</button>
        </div>
        <div className="smsPricing-item">
          <h3 className='smsPricing-item-title'><span>{t('Most Popular')}</span></h3>
          <div className="smsPricing-price-1">1000 SMS/450 DKK</div>
          <div className="smsPricing-price-2">0.45 DKK/ per sms</div>
          <div className="smsPricing-hr" />
          <ul className="smsPricing-list">
            <li className="smsPricing-list-item">{t('This plan is suitable for those who send a moderate number of SMS messages per month.')}</li>
            <li className="smsPricing-list-item">{t('The cost per SMS is lower than the 1st plan at')} 0.45 DKK/SMS.</li>
            <li className="smsPricing-list-item">{t('The total cost of the plan is reasonable at')} 450 DKK.</li>
          </ul>
          <div className="smsPricing-hr" />
          <button className='smsPricing-btn'
                  onClick={() => getPaymentLink('price_1MyEacCVi0riU70PUza10X55')}
          >{t('Buy now')}</button>
        </div>
        <div className="smsPricing-item">
          <h3 className='smsPricing-item-title'><span>{t('Best Value')}</span></h3>
          <div className="smsPricing-price-1">5000 SMS/2000 DKK</div>
          <div className="smsPricing-price-2">0.4 DKK/ per sms</div>
          <div className="smsPricing-hr" />
          <ul className="smsPricing-list">
            <li className="smsPricing-list-item">{t('This plan is ideal for heavy SMS users who send a large number of messages per month.')}</li>
            <li className="smsPricing-list-item">{t('The cost per SMS is the lowest among the three plans at ')} 0.4 DKK/SMS.</li>
            <li className="smsPricing-list-item">{t('This plan costs more than the other two options, but provides better value for heavy SMS users.')}</li>
          </ul>
          <div className="smsPricing-hr" />
          <button className='smsPricing-btn'
                  onClick={() => getPaymentLink('price_1N0kcECVi0riU70PljC75ezq')}
          >{t('Buy now')}</button>
        </div>
      </div>
    </div>
  )
}

export default SmsPricing

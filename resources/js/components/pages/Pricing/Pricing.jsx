import React, { useEffect, useState } from 'react'
import './Pricing.scss'
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";

const Pricing = () => {
  const { t } = useTranslation();
  const [trialDisabled, setTrialDisabled] = useState(false)

  useEffect(() => {
    getIsTrialPaid()
    eventBus.on("placeChanged", () => {
      getIsTrialPaid()
    })
  }, [])

  const getIsTrialPaid = () => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/is_trial_paid`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setTrialDisabled(response.data)
    }).catch(error => { })
  }

  const payTrial = () => {
    axios.post(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/pay_trial`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      console.log('pay trial', response.data)
      setTrialDisabled(true)
    }).catch(error => { })
  }

  const getPaymentLink = (price_id) => {
    axios.get(`${process.env.MIX_API_URL}/api/billing/get_payment_link`, {
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
    <div className='price'>
      <h2 className="price-title price-top-title">{t('The right pricing plans for you')}</h2>
      <div className="price-wrapper">
        <div className="price-card">
          <div className="price-card-top">
            <span>€30</span>/{t('month')}
          </div>
          <p className="price-card-title">{t('Monthly')}</p>
          <button
            type="button"
            className="price-card-btn"
            onClick={() => getPaymentLink('price_1Maz5vCVi0riU70Pp3gtayD7')} //test price_1MZzEwCVi0riU70Po6j0nClk //live price_1MZylgCVi0riU70PLpxaYmTW
          >{t('Choose plan')}</button>
          {!trialDisabled &&
            <div
              className="price-card-trial"
              onClick={payTrial}
            >{t('Try one month free')}</div>
          }
        </div>

        <div className="price-card">
          <div className="price-card-badge">{t('Save')} 15%</div>
          <div className="price-card-top">
            <span>€175</span>/{t('semiannual')}
          </div>
          <div className="price-card-per-month"><span>€25</span>/{t('month')}</div>
          <p className="price-card-title">{t('semiannual')}</p>
          <button
            type="button"
            className="price-card-btn"
            onClick={() => getPaymentLink('price_1MZzG0CVi0riU70PGE1jT8I7')} //live price_1MZynBCVi0riU70PAo5AnE8A
          >{t('Choose plan')}</button>
          {!trialDisabled &&
            <div
              className="price-card-trial"
              onClick={payTrial}
            >{t('Try one month free')}</div>
          }
        </div>

        <div className="price-card">
          <div className="price-card-badge">{t('Save')} 30%</div>
          <div className="price-card-top">
            <span>€240</span>/{t('yearly')}
          </div>
          <div className="price-card-per-month"><span>€20</span>/{t('month')}</div>
          <p className="price-card-title">{t('yearly')}</p>
          <button
            type="button"
            className="price-card-btn"
            onClick={() => getPaymentLink('price_1MZzI0CVi0riU70PTTyLxgik')} //live price_1MZyovCVi0riU70PlUHycyvz
          >{t('Choose plan')}</button>
          {!trialDisabled &&
            <div
              className="price-card-trial"
              onClick={payTrial}
            >{t('Try one month free')}</div>
          }
        </div>
      </div>
      <p className="price-text">{t('Tied into another solution? If you have a notice period on your current booking system, you will receive Nubis reservation for free throughout that period, so you won’t have to pay for two subscriptions. You can set up the system fro free using our Nubis Academy videos ore let us set it up for you for')} € 149</p>
      <div className="price-benefits">
        <h3 className="price-title">{t('Benefits')}</h3>
        <ul className="price-list">
          <li className="price-list-item">{t('Fully integrated booking system')}</li>
          <li className="price-list-item">{t('Takeaway module with its own payment')}</li>
          <li className="price-list-item">{t('Giftcard module with direct payment to own account via stripe')}</li>
          <li className="price-list-item">{t('Waiting list')}</li>
          <li className="price-list-item">{t('Online payment via stripe for takeawey')}</li>
          <li className="price-list-item">{t('Deposit for no-shows')}</li>
          <li className="price-list-item">{t('Advance payment via own account via stripe')}</li>
          <li className="price-list-item">{t('Pre-ordering a menu')}</li>
          <li className="price-list-item">{t('Division of areas')}</li>
          <li className="price-list-item">{t('Guest exclusivity')}</li>
          <li className="price-list-item">{t('Reserve with Google partner')}</li>
          <li className="price-list-item">{t('SMS reminder')}</li>
          <li className="price-list-item">{t('Possibility of different setting times')}</li>
          <li className="price-list-item">{t('Questionnaire after visit')}</li>
          <li className="price-list-item">{t('Newsletter')}</li>
          <li className="price-list-item">{t('Run on all platforms')}</li>
          <li className="price-list-item">{t('Booking diagram')}</li>
          <li className="price-list-item">{t('Print of today’s booking')}</li>
          <li className="price-list-item">{t('Guest history')}</li>
          <li className="price-list-item">{t('Possibility of combined tables when booking online')}</li>
          <li className="price-list-item">{t('Concurrent users on the system')}</li>
          <li className="price-list-item"><a href="https://gatewayapi.com/pricing/#pricing" className="price-link" target="_blank">{t('Price per SMS')}</a></li>
        </ul>
      </div>
      <p className="price-text">
        {t('Notice: License comes with a Free 30 day full version trial. Refer to our Terms Of Service here.')} <br />
        {t('Support plan is available on paid licenses only and can be purchased separately or extended at a later time.')}
      </p>
    </div>
  )
}

export default Pricing

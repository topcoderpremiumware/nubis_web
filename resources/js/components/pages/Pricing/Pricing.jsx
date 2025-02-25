import React, { useEffect, useState } from 'react'
import './Pricing.scss'
import { useTranslation } from 'react-i18next';
import eventBus from "../../../eventBus";

const Pricing = () => {
  const { t } = useTranslation();
  const [billDisabled, setBillDisabled] = useState(true)
  const [place, setPlace] = useState({})
  const [trialBill, setTrialBill] = useState({})

  useEffect(() => {
    getIsBillPaid()
    getPlace()
    getTrialBill()
    eventBus.on("placeChanged", () => {
      getIsBillPaid()
      getPlace()
      getTrialBill()
    })
  }, [])

  const getPlace = () => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}`).then(response => {
      setPlace(response.data)
    }).catch(error => {
    })
  }

  const getIsBillPaid = () => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/is_bill_paid`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setBillDisabled(response.data)
    }).catch(error => { })
  }

  const getTrialBill = () => {
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/get_last_active_trial`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setTrialBill(response.data)
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

  const payTrial = () => {
    axios.post(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/pay_trial`,{},{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      getIsBillPaid()
      getTrialBill()
      eventBus.dispatch("notification", {type: 'success', message: 'Paid Trial successfully'});
    }).catch(error => {
      if (error.response && error.response.data && error.response.data.errors) {
        for (const [key, value] of Object.entries(error.response.data.errors)) {
          value.forEach(v => {
            eventBus.dispatch("notification", {type: 'error', message: v});
          })
        }
      } else {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error.message)
      }
    })
  }

  const deleteTrial = () => {
    if (window.confirm(t('Are you sure you want to delete this trial?'))) {
      axios.delete(`${process.env.MIX_API_URL}/api/billings/${trialBill.id}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        getIsBillPaid()
        getTrialBill()
        eventBus.dispatch("notification", {type: 'success', message: 'Trial deleted successfully'});
      }).catch(error => {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error)
      })
    }
  }

  return (
    <div className='price'>
      <h2 className="price-title price-top-title">{t('The right pricing plans for you')}</h2>
      {place.country_id === 57 ?
        <div className="price-wrapper">
          <div className={`price-card ${billDisabled ? 'disabled' : ''}`}>
            <div className="price-card-top">
              <span>412 DKK</span>/{t('month')}
            </div>
            <p className="price-card-title">{t('Monthly')}</p>
            <button
              type="button"
              className="price-card-btn"
              onClick={() => getPaymentLink('price_1OhXHMCVi0riU70PfraO6sX5')}
            >{t('Choose plan')}</button>
          </div>

          <div className={`price-card ${billDisabled ? 'disabled' : ''}`}>
            <div className="price-card-badge">{t('Save')} 15%</div>
            <div className="price-card-top">
              <span>2 205 DKK</span>/{t('semiannual')}
            </div>
            <div className="price-card-per-month"><span>367.50 DKK</span>/{t('month')}</div>
            <p className="price-card-title">{t('semiannual')}</p>
            <button
              type="button"
              className="price-card-btn"
              onClick={() => getPaymentLink('price_1OhXQ8CVi0riU70PNiFV9ke5')}
            >{t('Choose plan')}</button>
          </div>

          <div className={`price-card ${billDisabled ? 'disabled' : ''}`}>
            <div className="price-card-badge">{t('Save')} 30%</div>
            <div className="price-card-top">
              <span>3 510 DKK</span>/{t('yearly')}
            </div>
            <div className="price-card-per-month"><span>292.50 DKK</span>/{t('month')}</div>
            <p className="price-card-title">{t('yearly')}</p>
            <button
              type="button"
              className="price-card-btn"
              onClick={() => getPaymentLink('price_1OhXSHCVi0riU70PqoAlAtdI')}
            >{t('Choose plan')}</button>
          </div>
        </div>
        :
      <div className="price-wrapper">
        <div className={`price-card ${billDisabled ? 'disabled' : ''}`}>
          <div className="price-card-top">
            <span>€55</span>/{t('month')}
          </div>
          <p className="price-card-title">{t('Monthly')}</p>
          <button
            type="button"
            className="price-card-btn"
            onClick={() => getPaymentLink('price_1O9QVcCVi0riU70P36CBHovc')}
          >{t('Choose plan')}</button>
        </div>

        <div className={`price-card ${billDisabled ? 'disabled' : ''}`}>
          <div className="price-card-badge">{t('Save')} 15%</div>
          <div className="price-card-top">
            <span>€294</span>/{t('semiannual')}
          </div>
          <div className="price-card-per-month"><span>€49</span>/{t('month')}</div>
          <p className="price-card-title">{t('semiannual')}</p>
          <button
            type="button"
            className="price-card-btn"
            onClick={() => getPaymentLink('price_1O9QT9CVi0riU70PGcLhPeGU')}
          >{t('Choose plan')}</button>
        </div>

        <div className={`price-card ${billDisabled ? 'disabled' : ''}`}>
          <div className="price-card-badge">{t('Save')} 30%</div>
          <div className="price-card-top">
            <span>€468</span>/{t('yearly')}
          </div>
          <div className="price-card-per-month"><span>€39</span>/{t('month')}</div>
          <p className="price-card-title">{t('yearly')}</p>
          <button
            type="button"
            className="price-card-btn"
            onClick={() => getPaymentLink('price_1O9QRACVi0riU70PvZCNBcq6')}
          >{t('Choose plan')}</button>
        </div>
      </div>}
      {window.is_superadmin === 1 && <div style={{marginBottom: '15px', display: 'flex', justifyContent: 'center'}}>
        {trialBill.hasOwnProperty('id') ? <button
            type="button"
            className="price-card-btn"
            onClick={() => deleteTrial()}
          >{t('Delete trial #{{id}} (for superadmin only)',{id: trialBill.id})}</button>
          :
          <button
            type="button"
            className="price-card-btn"
            onClick={() => payTrial()}
          >{t('Pay trial (for superadmin only)')}</button>}
          </div>}
        <p
          className="price-text">{t('Tied into another solution? If you have a notice period on your current booking system, you will receive Table Booking POS for free throughout that period, so you won’t have to pay for two subscriptions. You can set up the system for free using our Nubis Academy videos or let us set it up for you for')} € 149</p>
      <div style={{marginTop: '15px', display: 'flex', justifyContent: 'center'}}>
        <button
          type="button"
          className="price-card-btn"
          onClick={() => getHelpPaymentLink('price_1Mvg3pCVi0riU70PmnHz6b2b')}
        >{t('Pay for help')}</button>
      </div>
      <div className="price-benefits">
        <h3 className="price-title">{t('Benefits')}</h3>
        <ul className="price-list">
          <li className="price-list-item">{t('Fully integrated booking system')}</li>
          {/*<li className="price-list-item">{t('Takeaway module with its own payment')}</li>*/}
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
          <li className="price-list-item">{t('Price per SMS')}</li>
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

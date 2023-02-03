import React from 'react'
import { useTranslation } from 'react-i18next'
import './PrepaymentModal.scss'
import { Elements } from '@stripe/react-stripe-js';
import PrepaymentForm from '../PrepaymentForm/PrepaymentForm'

const PrepaymentModal = (props) => {
  const { t } = useTranslation();

  const {
    active,
    setActive,
    restaurantInfo,
    selectedDay,
    selectedTime,
    guestValue,
    stripeKey,
    stripeSecret,
    paymentInfo,
    makeOrder
  } = props

  const options = {
    clientSecret: stripeSecret,
  };

  return (
    <div
      className={active ? "prepayment-modal active" : "prepayment-modal"}
      onClick={() => setActive(false)}
    >
      <div className="prepayment-modal__content" onClick={(e) => e.stopPropagation()}>
        <div
          className="close-icon"
          onClick={() => setActive(false)}
        >✕</div>

        <div className="title prepayment-modal-title">{t('Prepayment')}</div>

        <p>{t('In order to complete from reservation at')} <b>{restaurantInfo.name}</b> {t('the')} <b>{`${selectedDay.day}-${selectedDay.month}-${selectedDay.year}`} {selectedTime}</b> {t('the following must be paid:')}</p>
        
        <div className="prepayment-form">
          {t('Amount for')} {guestValue} pers.:
          <div className='prepayment-total'>{guestValue * paymentInfo['online-payment-amount']} {paymentInfo['online-payment-currency']}</div>

          {stripeKey && stripeSecret &&
            <Elements stripe={stripeKey} options={options}>
              <PrepaymentForm makeOrder={makeOrder} />
            </Elements>
          }
        </div>

        <h5 className='prepayment-list-title'>Terms</h5>
        <ul className='prepayment-list'>
          <li>The full amount is refunded for cancellation up to 24 hours before reservation starts.</li>
          <li>No refund or deduction for absent guests.</li>
          <li>Only persons aged 18 or over may place orders.</li>
          <li>Your credit card information will not be stored.</li>
          <li>All questions related to reservation and payment should be directed to My Restaurant on 12345678.</li>
          <li>Business information: Company Name, Main road 1, 2300 Copenhagen, VAT ID 12345678</li>
        </ul>
      </div>
    </div>
  )
}

export default PrepaymentModal
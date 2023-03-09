import React from 'react'
import { useTranslation } from 'react-i18next'
import './PrepaymentModal.scss'
import { Elements } from '@stripe/react-stripe-js';
import PrepaymentForm from '../PrepaymentForm/PrepaymentForm'
import moment from "moment/moment";

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
    makeOrder,
    discount,
    setDefaultModal
  } = props

  const cancelTimes = [
    { title: `30 ${t('minutes')}`, value: 30 },
    { title: `45 ${t('minutes')}`, value: 45 },
    { title: `1 ${t('hour')}`, value: 60 },
    { title: `1.5 ${t('hours')}`, value: 60 * 1.5 },
    { title: `2 ${t('hours')}`, value: 60 * 2 },
    { title: `2.5 ${t('hours')}`, value: 60 * 2.5 },
    { title: `3 ${t('hours')}`, value: 60 * 3 },
    { title: `4 ${t('hours')}`, value: 60 * 4 },
    { title: `5 ${t('hours')}`, value: 60 * 5 },
    { title: `6 ${t('hours')}`, value: 60 * 6 },
    { title: `8 ${t('hours')}`, value: 60 * 8 },
    { title: `12 ${t('hours')}`, value: 60 * 12 },
    { title: `24 ${t('hours')}`, value: 60 * 24 },
    { title: `36 ${t('hours')}`, value: 60 * 36 },
    { title: `48 ${t('hours')}`, value: 60 * 48 },
    { title: `3 ${t('days')}`, value: 60 * 24 * 3 },
    { title: `4 ${t('days')}`, value: 60 * 24 * 4 },
    { title: `5 ${t('days')}`, value: 60 * 24 * 5 },
    { title: `6 ${t('days')}`, value: 60 * 24 * 6 },
    { title: `7 ${t('days')}`, value: 60 * 24 * 7 },
    { title: `14 ${t('days')}`, value: 60 * 24 * 14 },
    { title: `21 ${t('days')}`, value: 60 * 24 * 21 },
    { title: t('Not allowed'), value: 60 * 24 * 1000 },
  ]

  const options = {
    clientSecret: stripeSecret
  };

  const method = paymentInfo?.['online-payment-method']
  const total = method === 'no_show' ? 0 : guestValue * paymentInfo['online-payment-amount']

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

        <p>{t('In order to complete from reservation at')} <b>{restaurantInfo.name}</b> {t('the')} <b>{moment.utc(`${selectedDay.year}-${selectedDay.month}-${selectedDay.day} ${selectedTime}`)
          .local().format('DD-MM-YYYY HH:mm')}</b> {t('the following must be paid:')}</p>

        <div className="prepayment-form">
          {t('Amount for')} {guestValue} pers.
          {discount > 0 && <p>{t('Your discount is')} <b>{discount} DKK</b></p>}
          <div className='prepayment-total'>Total: {total > discount ? total - discount : 0} {paymentInfo['online-payment-currency']}</div>

          <Elements stripe={stripeKey} options={options}>
            <PrepaymentForm
              paymentInfo={paymentInfo}
              makeOrder={makeOrder}
              setDefaultModal={setDefaultModal}
              setOrderResponse={props.setOrderResponse}
              setUserData={props.setUserData}
            />
          </Elements>
        </div>

        <h5 className='prepayment-list-title'>Terms</h5>
        <ul className='prepayment-list'>
          <li>The full amount is refunded for cancellation up to {cancelTimes.find(i => i.value === +paymentInfo['online-payment-cancel-deadline'])?.title} before reservation starts.</li>
          <li>No refund or deduction for absent guests.</li>
          <li>Only persons aged 18 or over may place orders.</li>
          <li>Your credit card information will not be stored.</li>
          <li>All questions related to reservation and payment should be directed to {restaurantInfo.name}</li>
          <li>Business information: {restaurantInfo.name}, {restaurantInfo.address}</li>
        </ul>
      </div>
    </div>
  )
}

export default PrepaymentModal

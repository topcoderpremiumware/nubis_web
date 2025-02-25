import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import React, { useState } from 'react'
import {Trans, useTranslation} from 'react-i18next';
import '../PrepaymentModal/PrepaymentModal.scss'

const PrepaymentForm = ({ paymentInfo, makeOrder, setDefaultModal, setOrderResponse, setUserData }) => {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [termsChecked, setTermsChecked] = useState(false)

  const stripe = useStripe()
  const elements = useElements()

  const method = paymentInfo?.['online-payment-method']

  const handleSubmit = async (ev) => {
    ev.preventDefault()

    if (!stripe || !elements) return

    setIsLoading(true)

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required'
      // confirmParams: {
      //   return_url: ''
      // }
    })
    if (error) {
      setError(error.message)
    } else if (setupIntent && setupIntent.status === 'succeeded') {
      await stripe
        .retrieveSetupIntent(setupIntent.client_secret)
        .then((intent) => {
          switch (intent.setupIntent.status) {
            case 'succeeded':
              // if (method === 'reserve') {
              //   spendGift()
              // }
              makeOrder(intent.setupIntent.id)
                .then(res => {
                  setOrderResponse(res.data)
                  setUserData((prev) => ({ ...prev, bookingid: res.data.id }))
                  setDefaultModal('done')
                  setIsLoading(false)
                })
                .catch(err => {
                  if (err?.response?.data?.message === 'authentication_required') {
                    stripe.confirmCardPayment(err?.response?.data?.payment_intent?.client_secret, {
                      payment_method: err?.response?.data?.payment_intent?.last_payment_error?.payment_method?.id
                    }).then((result) => {
                      if (result.error) {
                        setError(result.error.message);
                      } else {
                        if (['succeeded', 'requires_capture'].includes(result.paymentIntent.status)) {
                          setOrderResponse(err?.response?.data?.order)
                          setUserData((prev) => ({ ...prev, bookingid: err?.response?.data?.order?.id }))
                          setDefaultModal('done')
                        }
                      }
                    });
                  } else {
                    setError(err?.response?.data?.message)
                  }

                  setIsLoading(false)
                })
              break;
            case 'requires_payment_method':
              setError('Failed to process payment details. Please try another payment method.');
              setIsLoading(false)
              break;
          }
        });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement/>

      {method === 'no_show' &&
        <p className="prepayment-text"><Trans>Saves credit card information and charges a fee
          of <b>{{amount: paymentInfo?.['online-payment-amount']}}</b> per person in case of no-show or late
          cancellation. The fee will only be deducted from the guest, if the booking is marked as a "No show/Not
          arrived"</Trans></p>
      }
      {error && <p className="prepayment-error">{error}</p>}
      <label>
        <input
          type="checkbox"
          checked={termsChecked}
          onChange={(e) => {
            setTermsChecked(e.target.checked)
          }}
        />
        &nbsp;
        <Trans>By checking the box below, you acknowledge that you have read and agree to the terms and conditions of Table Booking POS.</Trans>
      </label>
      <button
        className="button-main prepayment-button"
        disabled={isLoading && !termsChecked}
      >
        {isLoading
          ? t('Processing...')
          : method === 'no_show'
            ? t('Save')
            : t('Pay now')
        }
      </button>
    </form>
  )
}

export default PrepaymentForm

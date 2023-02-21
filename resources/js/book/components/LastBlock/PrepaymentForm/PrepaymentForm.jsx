import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import '../PrepaymentModal/PrepaymentModal.scss'

const PrepaymentForm = ({ paymentInfo, makeOrder, setDefaultModal, spendGift }) => {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
              if (method === 'reserve') {
                spendGift()
              }
              makeOrder(intent.setupIntent.id)
                .then(res => {
                  setDefaultModal('done')
                })
                .catch(err => {
                  setError(err.message)
                })
              setIsLoading(false)
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
      <PaymentElement />

      {method === 'no_show' &&
        <p className="prepayment-text">{t('Saves credit card information and charges a fee in case of no-show or late cancellation. The fee will only be deducted from the guest, if the booking is marked as a “No show/Not arrived”')}</p>
      }
      {error && <p className="prepayment-error">{error}</p>}
      <button
        className="button-main prepayment-button"
        disabled={isLoading}
      >
        {isLoading 
          ? t('Processing...') 
          : method === 'no_show' 
            ? t('Save' )
            : t('Pay now')
        }
      </button>
    </form>
  )
}

export default PrepaymentForm
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import '../PrepaymentModal/PrepaymentModal.scss'

const PrepaymentForm = ({ paymentInfo, makeOrder }) => {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const stripe = useStripe()
  const elements = useElements()

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
          console.log('intent.setupIntent', intent.setupIntent)
          switch (intent.setupIntent.status) {
            case 'succeeded':
              if (paymentInfo?.['online-payment-method'] === 'reserve') {
                // spend gift
              }
              // makeOrder()
              // .then(res => {

              // })
              // .catch(err => {
              //   setError(err.message)
              // })
              // setIsLoading(false)
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
      {error && <p className="prepayment-error">{error}</p>}
      <button
        className="button-main prepayment-button"
        disabled={isLoading}
      >
        {/* TODO: no-show =  */}
        {isLoading ? t('Processing...') : t('Pay now')}
      </button>
    </form>
  )
}

export default PrepaymentForm
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import '../PrepaymentModal/PrepaymentModal.scss'

const PrepaymentForm = () => {
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
      console.log('setupIntent', setupIntent)
    }

    setIsLoading(false)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p className="prepayment-error">{error}</p>}
      <button
        className="button-main prepayment-button"
        disabled={isLoading}
      >
        {isLoading ? t('Processing...') : t('Pay now')}
      </button>
    </form>
  )
}

export default PrepaymentForm
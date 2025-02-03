'use client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Plan } from '@prisma/client'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import React, { useState } from 'react'

type Props = {
  selectedPriceId: string | Plan
}

const SubscriptionForm = ({ selectedPriceId }: Props) => {
  const { toast } = useToast()
  const elements = useElements()
  const stripeHook = useStripe()
  const [isProcessing, setIsProcessing] = useState(false)
  const [priceError, setPriceError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedPriceId) {
      setPriceError('You need to select a plan to subscribe.')
      return
    }

    if (!stripeHook || !elements) {
      toast({
        variant: 'destructive',
        title: 'Payment system not ready',
        description: 'Please try again in a moment.',
      })
      return
    }

    setIsProcessing(true)
    setPriceError('')

    try {
      const { error } = await stripeHook.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_URL}/agency`,
        },
      })

      if (error) {
        throw error
      }

      toast({
        title: 'Payment successful',
        description: 'Your payment has been successfully processed.',
      })
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        variant: 'destructive',
        title: 'Payment failed',
        description: error instanceof Error ? error.message : "We couldn't process your payment. Please try a different card",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {priceError && (
        <div className="text-red-500 mb-4">{priceError}</div>
      )}
      <PaymentElement />
      <Button
        type="submit"
        disabled={isProcessing}
        className="mt-4 w-full"
      >
        {isProcessing ? 'Processing...' : 'Submit'}
      </Button>
    </form>
  )
}

export default SubscriptionForm
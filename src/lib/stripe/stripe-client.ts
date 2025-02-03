import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = (connectedAccountId?: string) => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      throw new Error('Stripe publishable key is not set')
    }
    
    stripePromise = loadStripe(key, {
      stripeAccount: connectedAccountId
    })
  }
  return stripePromise
}
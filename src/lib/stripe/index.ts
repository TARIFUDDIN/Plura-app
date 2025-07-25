// lib/stripe/index.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-06-30.basil', // Use the version your types expect
  appInfo: {
    name: 'Plura App',
    version: '0.1.0',
  },
})
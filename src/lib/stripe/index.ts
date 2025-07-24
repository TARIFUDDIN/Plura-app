// lib/stripe/index.ts - Fix the API version
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-06-30.basil', // Use the API version your Stripe package expects
  appInfo: {
    name: 'Plura App',
    version: '0.1.0',
  },
})
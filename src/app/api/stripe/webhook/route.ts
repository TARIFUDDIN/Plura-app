import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { subscriptionCreate } from '@/lib/stripe/stripe-action'

const stripeWebhookEvents = new Set([
  'product.created',
  'product.updated',
  'price.created',
  'price.updated',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const sig = (await headers()).get('Stripe-Signature')
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET

    if (!sig || !webhookSecret) {
      console.log('🔴 Error: Stripe webhook secret or signature missing')
      return NextResponse.json(
        { error: 'Webhook signature or secret missing' },
        { status: 400 }
      )
    }

    const stripeEvent = stripe.webhooks.constructEvent(body, sig, webhookSecret)

    if (stripeWebhookEvents.has(stripeEvent.type)) {
      const subscription = stripeEvent.data.object as Stripe.Subscription
      
      if (
        !subscription.metadata?.connectAccountPayments &&
        !subscription.metadata?.connectAccountSubscriptions
      ) {
        switch (stripeEvent.type) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated': {
            if (subscription.status === 'active') {
              await subscriptionCreate(
                subscription,
                subscription.customer as string
              )
              console.log('CREATED FROM WEBHOOK 💳', subscription.id)
            } else {
              console.log(
                'SKIPPED: subscription status is not active',
                subscription.status
              )
            }
            break
          }
          default:
            console.log('👉🏻 Unhandled relevant event!', stripeEvent.type)
        }
      } else {
        console.log('SKIPPED: subscription from connected account')
      }
    }

    return NextResponse.json(
      { webhookActionReceived: true },
      { status: 200 }
    )

  } catch (error) {
    console.error('🔴 Webhook Error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}
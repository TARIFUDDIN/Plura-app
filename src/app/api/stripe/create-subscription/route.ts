import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const headers = {
    'Content-Type': 'application/json',
    // Add any necessary CORS headers if needed
  }
  try {
    const { customerId, priceId } = await req.json()
    
    if (!customerId || !priceId) {
      return new NextResponse(
        JSON.stringify({ error: 'Customer Id or price id is missing' }), 
        { status: 400, headers }
      )
    }

    const subscriptionExists = await db.agency.findFirst({
      where: { customerId },
      include: { Subscription: true },
    })

    if (
      subscriptionExists?.Subscription?.subscriptionId &&
      subscriptionExists.Subscription.active
    ) {
      if (!subscriptionExists.Subscription.subscriptionId) {
        throw new Error(
          'Could not find the subscription Id to update the subscription.'
        )
      }

      console.log('Updating the subscription')
      const currentSubscriptionDetails = await stripe.subscriptions.retrieve(
        subscriptionExists.Subscription.subscriptionId
      )

      const subscription = await stripe.subscriptions.update(
        subscriptionExists.Subscription.subscriptionId,
        {
          items: [
            {
              id: currentSubscriptionDetails.items.data[0].id,
              deleted: true,
            },
            { price: priceId },
          ],
          expand: ['latest_invoice.payment_intent'],
        }
      )

      return NextResponse.json({
        subscriptionId: subscription.id,
        // @ts-expect-error - Stripe types don't include expanded payment_intent on latest_invoice
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      })
    } else {
      console.log('Creating a new subscription')
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      })

      return new NextResponse(
        JSON.stringify({
          subscriptionId: subscription.id,
          // @ts-expect-error - Stripe types don't include expanded payment_intent on latest_invoice
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        }),
        { status: 200, headers }
      )
    }
    } catch (error) {
      console.error('Subscription error:', error)
      return new NextResponse(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Internal Server Error' 
        }),
        { status: 500, headers }
      )
    }
}
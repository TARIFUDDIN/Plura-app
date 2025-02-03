// app/api/stripe/create-customer/route.ts
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export const runtime = 'edge' // add this if you're using Next.js 13+

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    console.log('API received body:', body);

    const customer = await stripe.customers.create({
      email: body.email,
      name: body.name,
      address: body.address,
      shipping: body.shipping,
    });

    console.log('Stripe customer created:', customer.id);

    // Explicitly set the content type
    return new NextResponse(
      JSON.stringify({ customerId: customer.id }), 
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
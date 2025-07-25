// app/api/stripe/create-checkout-session/route.ts - Fixed route handler
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      subAccountConnectedId,
      prices,
      subAccountId,
    }: {
      subAccountConnectedId: string;
      subAccountId: string;
      prices: { recurring: boolean; productId: string }[];
    } = await req.json();

    const origin = req.headers.get("origin");

    // Validation
    if (!subAccountConnectedId || !subAccountId || !prices.length) {
      return NextResponse.json(
        {
          error: "Stripe Account Id or Price Id is missing",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !process.env.NEXT_PUBLIC_PLATFORM_SUBSCRIPTION_PERCENT ||
      !process.env.NEXT_PUBLIC_PLATFORM_ONETIME_FEE ||
      !process.env.NEXT_PUBLIC_PLATFORM_AGENCY_PERCENT
    ) {
      return NextResponse.json(
        {
          error: "Environment variables are missing",
        },
        {
          status: 400,
        }
      );
    }

    const subAccountWithAgency = await db.subAccount.findUnique({
      where: {
        id: subAccountId,
      },
      include: {
        Agency: true,
      },
    });

    if (!subAccountWithAgency?.Agency.connectAccountId) {
      console.log('Agency is not connected')
      return NextResponse.json(
        {
          error: "Stripe Account Id is missing for the selected sub account"
        },
        {
          status: 400,
        }
      );
    }

    const subscriptionPriceExists = prices.find((price) => price.recurring);

    // Create checkout session
    const session = await stripe.checkout.sessions.create(
      {
        line_items: prices.map((price) => ({
          price: price.productId,
          quantity: 1,
        })),

        ...(subscriptionPriceExists && {
          subscription_data: {
            metadata: { connectAccountSubscriptions: "true" },
            application_fee_percent:
              +process.env.NEXT_PUBLIC_PLATFORM_SUBSCRIPTION_PERCENT,
          },
        }),

        ...(!subscriptionPriceExists && {
          payment_intent_data: {
            metadata: { connectAccountPayments: "true" },
            application_fee_amount:
              +process.env.NEXT_PUBLIC_PLATFORM_ONETIME_FEE * 100,
          },
        }),

        mode: subscriptionPriceExists ? "subscription" : "payment",
        ui_mode: "embedded",
        redirect_on_completion: "never",
      },
      { stripeAccount: subAccountConnectedId }
    );

    return NextResponse.json(
      {
        clientSecret: session.client_secret,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": origin || "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error) {
    console.log("Stripe checkout session error:", error);
    return NextResponse.json({
      message: error instanceof Error ? error.message : "An unknown error occurred"
    }, { status: 500 });
  }
}

export async function OPTIONS(request: Request) {
  const allowedOrigin = request.headers.get("origin");

  const response = new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin || "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
      "Access-Control-Max-Age": "86400",
    },
  });

  return response;
}
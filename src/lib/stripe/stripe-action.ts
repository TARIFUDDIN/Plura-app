import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { Plan, Prisma } from "@prisma/client";
import Stripe from "stripe";
interface StripeSubscriptionExtended extends Stripe.Subscription {
  current_period_end: number;
}
export const subscriptionCreate = async (
  subscription: Stripe.Subscription,
  customerId: string,
) => {
  try {
    const agency = await db.agency.findFirst({
      where: {
        customerId,
      },
      include: {
        SubAccount: true,
      },
    });

    if (!agency) {
      throw new Error("Could not find an agency to upsert the subscription");
    }

    const data: Prisma.SubscriptionUncheckedCreateInput = {
      active: subscription.status === "active",
      agencyId: agency.id,
      customerId,
      currentPeriodEndDate: new Date((subscription as StripeSubscriptionExtended).current_period_end * 1000),
      priceId: subscription.items.data[0].price.id,
      subscriptionId: subscription.id,
      plan: subscription.items.data[0].price.id as Plan,
    };

    const response = await db.subscription.upsert({
      where: {
        agencyId: agency.id,
      },
      create: data,
      update: data,
    });

    console.log(`🟢 Created Subscription for ${subscription.id}`);
    return response;
  } catch (error) {
    console.error('🔴 Error from Create action', error);
    throw error;
  }
}

export const getConnectAccountProducts = async (stripeAccount: string) => {
  const products = await stripe.products.list(
    {
      limit: 50,
      expand: ['data.default_price'],
    },
    {
      stripeAccount,
    }
  )
  return products.data
}
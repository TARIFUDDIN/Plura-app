'use client'
import SubscriptionFormWrapper from '@/components/forms/subscription-form/subscription-form-wrapper'
import CustomModal from '@/components/global/custom-modal'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PricesList } from '@/lib/types'
import { useModal } from '@/components/providers/ModalProvider'
import { useSearchParams } from 'next/navigation'
import React from 'react'

// Import the Plan enum from your Prisma client
import { Plan } from '@prisma/client'

type Props = {
  features: string[]
  buttonCta: string
  title: string
  description: string
  amt: string
  duration: string
  highlightTitle: string
  highlightDescription: string
  customerId: string
  prices: PricesList['data']
  planExists: boolean
}

const PricingCard = ({
  amt,
  buttonCta,
  customerId,
  description,
  duration,
  features,
  highlightDescription,
  highlightTitle,
  planExists,
  prices,
  title,
}: Props) => {
  const { setOpen } = useModal()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')

  const handleManagePlan = async () => {
    // Convert the string plan to the Plan enum type
    const getValidPlan = (planString: string | null): Plan => {
      // Check if the plan string matches one of the enum values
      if (planString === 'price_1RHr7JR8CMCKQcT941eHzkBh') {
        return Plan.price_1RHr7JR8CMCKQcT941eHzkBh
      }
      if (planString === 'price_1RHr7JR8CMCKQcT9DSJh8PTr') {
        return Plan.price_1RHr7JR8CMCKQcT9DSJh8PTr
      }
      // Default to the first plan if no match or null
      return Plan.price_1RHr7JR8CMCKQcT941eHzkBh
    }

    // Alternative approach: find the plan from prices array
    const getValidPlanFromPrices = (): Plan => {
      if (plan && prices.length > 0) {
        // Find the price that matches the plan ID
        const matchingPrice = prices.find(price => price.id === plan)
        if (matchingPrice) {
          // Check if the price ID is one of our valid enum values
          if (matchingPrice.id === 'price_1RHr7JR8CMCKQcT941eHzkBh') {
            return Plan.price_1RHr7JR8CMCKQcT941eHzkBh
          }
          if (matchingPrice.id === 'price_1RHr7JR8CMCKQcT9DSJh8PTr') {
            return Plan.price_1RHr7JR8CMCKQcT9DSJh8PTr
          }
        }
      }
      // Default fallback
      return Plan.price_1RHr7JR8CMCKQcT941eHzkBh
    }

    setOpen(
      <CustomModal
        title={'Manage Your Plan'}
        subheading="You can change your plan at any time from the billings settings"
      >
        <SubscriptionFormWrapper
          customerId={customerId}
          planExists={planExists}
        />
      </CustomModal>,
      async () => ({
        plans: {
          defaultPriceId: getValidPlanFromPrices(), // Now returns Plan enum type
          plans: prices,
        },
      })
    )
  }

  return (
    <Card className="flex flex-col justify-between lg:w-1/2">
      <div>
        <CardHeader className="flex flex-col md:!flex-row justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <p className="text-6xl font-bold">
            {amt}
            <small className="text-xs font-light text-muted-foreground">
              {duration}
            </small>
          </p>
        </CardHeader>
        <CardContent>
          <ul>
            {features.map((feature) => (
              <li
                key={feature}
                className="list-disc ml-4 text-muted-foreground"
              >
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </div>
      <CardFooter>
        <Card className="w-full">
          <div className="flex flex-col md:!flex-row items-center justify-between rounded-lg border gap-4 p-4">
            <div>
              <p>{highlightTitle}</p>
              <p className="text-sm text-muted-foreground">
                {highlightDescription}
              </p>
            </div>

            <Button
              className="md:w-fit w-full"
              onClick={handleManagePlan}
            >
              {buttonCta}
            </Button>
          </div>
        </Card>
      </CardFooter>
    </Card>
  )
}

export default PricingCard
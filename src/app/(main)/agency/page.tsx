import Unauthorized from '@/components/common/Unauthorized'
import AgencyDetails from '@/components/forms/AgencyDetails'
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries'
import { currentUser } from '@clerk/nextjs/server'
import { Plan } from '@prisma/client'
import { redirect } from 'next/navigation'
import React from 'react'

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ plan: Plan; state: string; code: string }>
}) => {
  // Await searchParams before using its properties
  const resolvedSearchParams = await searchParams
  
  const agencyId = await verifyAndAcceptInvitation()
  console.log(agencyId)
  
  const user = await getAuthUserDetails()
  if (agencyId) {
    if (user?.role === 'SUBACCOUNT_GUEST' || user?.role === 'SUBACCOUNT_USER') {
      return redirect('/subaccount')
    } else if (user?.role === 'AGENCY_OWNER' || user?.role === 'AGENCY_ADMIN') {
      if (resolvedSearchParams.plan) {
        return redirect(`/agency/${agencyId}/billing?plan=${resolvedSearchParams.plan}`)
      }
      if (resolvedSearchParams.state) {
        const statePath = resolvedSearchParams.state.split('___')[0]
        const stateAgencyId = resolvedSearchParams.state.split('___')[1]
        if (!stateAgencyId) return <div>Not authorized</div>
        return redirect(
          `/agency/${stateAgencyId}/${statePath}?code=${resolvedSearchParams.code}`
        )
      } else return redirect(`/agency/${agencyId}`)
    } else {
      return <Unauthorized/>
    }
  }
  const authUser = await currentUser()
  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
        <h1 className="text-4xl"> Create An Agency</h1>
        <AgencyDetails
          data={{ companyEmail: authUser?.emailAddresses[0].emailAddress }}
        />
      </div>
    </div>
  )
}

export default Page
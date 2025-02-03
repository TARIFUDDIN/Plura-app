import BlurPage from '@/components/common/BlurPage'

import { redirect } from "next/navigation";

import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'
import { getAgencyDetails, getSubAccountDetails } from '@/lib/queries';
import SubAccountDetails from '@/components/forms/SubAccountDetails';
import UserDetails from '@/components/forms/UserDetails';

type Props = {
  params: { subaccountId: string }
}

const SubaccountSettingPage = async ({ params }: Props) => {
    const { subaccountId } = params;
    const authUser = await currentUser();
  
    if (!subaccountId) redirect("/subaccount/unauthorized");
    if (!authUser) redirect("/agency/sign-in");
  
    const userDetails = await db.user.findUnique({
        where: {
          email: authUser.emailAddresses[0].emailAddress,
        },
      })
    
  
    if (!userDetails) redirect("/subaccount/unauthorized");
  
    const subAccount = await getSubAccountDetails(subaccountId);
  
    if (!subAccount) redirect("/subaccount/unauthorized");
    const agencyDetails = await db.agency.findUnique({
        where: { id: subAccount.agencyId },
        include: { SubAccount: true },
      })
    
      if (!agencyDetails) return
      const subAccounts = agencyDetails.SubAccount
  return (
    <BlurPage>
      <div className="flex lg:!flex-row flex-col gap-4">
        <SubAccountDetails
          agencyDetails={agencyDetails}
          details={subAccount}
          userId={userDetails.id}
          userName={userDetails.name}
        />
        <UserDetails
          type="subaccount"
          id={params.subaccountId}
          subAccounts={subAccounts}
          userData={userDetails}
        />
      </div>
    </BlurPage>
  )
}

export default SubaccountSettingPage
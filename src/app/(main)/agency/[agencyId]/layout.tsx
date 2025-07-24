import BlurPage from '@/components/common/BlurPage'
import InfoBar from '@/components/common/infoBar'
import Unauthorized from '@/components/common/Unauthorized'
import Sidebar from '@/components/navigation/Sidebar'
import {
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from '@/lib/queries'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

// Import the existing type that InfoBar expects
type NotificationsWithUser = Awaited<ReturnType<typeof getNotificationAndUser>>

type Props = {
  children: React.ReactNode
  params: Promise<{ agencyId: string }>
}

const layout = async ({ children, params }: Props) => {
  // Await params before using its properties
  const { agencyId: paramsAgencyId } = await params
  
  const agencyId = await verifyAndAcceptInvitation()
  const user = await currentUser()

  if (!user) {
    return redirect('/')
  }

  if (!agencyId) {
    return redirect('/agency')
  }

  if (
    user.privateMetadata.role !== 'AGENCY_OWNER' &&
    user.privateMetadata.role !== 'AGENCY_ADMIN'
  )
    return <Unauthorized />

  let allNoti: NotificationsWithUser = []
  const notifications = await getNotificationAndUser(agencyId)
  if (notifications) allNoti = notifications

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar
        id={paramsAgencyId}
        type="agency"
      />
      <div className="md:pl-[300px]">
        <InfoBar
          notifications={allNoti}
          role={allNoti[0]?.User?.role}
        />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  )
}

export default layout
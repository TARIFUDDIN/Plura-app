import InfoBar from '@/components/common/infoBar'
import Sidebar from '@/components/navigation/Sidebar'
import {
  getAuthUserDetails,
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from '@/lib/queries'
import type { NotificationsWithUser } from '@/lib/types'
import { currentUser } from '@clerk/nextjs/server'
import { Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import React from 'react'

interface SubAccountIdLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    subaccountId: string | undefined;
  }>;
}

const SubAccountIdLayout: React.FC<SubAccountIdLayoutProps> = async ({
  children,
  params,
}) => {
  // Await params before using its properties
  const { subaccountId } = await params;
  
  const agencyId = await verifyAndAcceptInvitation();

  if (!subaccountId) redirect(`/subaccount/unauthorized`);
  if (!agencyId) redirect(`/subaccount/unauthorized`);

  const user = await currentUser();

  if (!user) redirect(`/agency/sign-in`);

  let notifications: NotificationsWithUser = [];

  if (!user.privateMetadata.role) {
    redirect(`/subaccount/unauthorized`);
  }

  const authUser = await getAuthUserDetails();
  const hasPermission = authUser?.Permissions.find(
    (permission) =>
      permission.access && permission.subAccountId === subaccountId
  );
  if (!hasPermission) redirect(`/subaccount/unauthorized`);

  const allNotifications = await getNotificationAndUser(agencyId);

  if (
    user.privateMetadata.role === Role.AGENCY_ADMIN ||
    user.privateMetadata.role === Role.AGENCY_OWNER
  ) {
    notifications = allNotifications;
  } else {
    const filteredNotifications = allNotifications?.filter(
      (notification) => notification.subAccountId === subaccountId
    );
    if (filteredNotifications) notifications = filteredNotifications;
  }

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={subaccountId} type="subaccount" />

      <div className="md:pl-[300px]">
        <InfoBar
          notifications={notifications}
          role={user.privateMetadata.role as Role}
          subAccountId={subaccountId as string}
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
};

export default SubAccountIdLayout;
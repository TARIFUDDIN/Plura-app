import { db } from '@/lib/db'
import React from 'react'
import { redirect } from "next/navigation";
import DataTable from './data-table'
import { Plus } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import { columns } from './columns'
import SendInvitation from '@/components/forms/send-invitation'
import { getAgencyDetails, getAuthUserGroup } from '@/lib/queries';

interface Props {
  params: Promise<{
    agencyId: string
  }>
}

const TeamPage = async ({ params }: Props) => {
  // Await params before destructuring
  const { agencyId } = await params;
  
  const authUser = await currentUser();

  if (!authUser) redirect("/agency/sign-in");
  if (!agencyId) redirect("/agency/unauthorized");

  const teamMembers = await getAuthUserGroup(agencyId);
  if (!teamMembers) redirect("/agency/sign-in");

  const agencyDetails = await getAgencyDetails(agencyId);
  if (!agencyDetails) redirect("/agency/unauthorized");

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Add
        </>
      }
      modalChildren={<SendInvitation agencyId={agencyDetails.id} />}
      filterValue="name"
      columns={columns}
      data={teamMembers}
    />
  )
}

export default TeamPage
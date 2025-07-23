import { db } from '@/lib/db'
import { createPipeline, getUserPipelines } from '@/lib/queries'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  params: Promise<{ subaccountId: string }>
}

const Pipelines = async ({ params }: Props) => {
  // Await params before using its properties
  const { subaccountId } = await params;

  if (!subaccountId) redirect("/subaccount/unauthorized");

  const pipelineExists = await getUserPipelines(subaccountId);

  if (!!pipelineExists.length) {
    redirect(`/subaccount/${subaccountId}/pipelines/${pipelineExists[0].id}`);
  }

  const response = await createPipeline(subaccountId);

  if (response) {
    redirect(`/subaccount/${subaccountId}/pipelines/${response.id}`);
  }

  redirect("/error");
};
export default Pipelines
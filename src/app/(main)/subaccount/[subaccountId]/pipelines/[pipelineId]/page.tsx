import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { db } from '@/lib/db'
import {
  getLanesWithTicketAndTags,
  getPipelineDetails,
  updateLanesOrder,
  updateTicketsOrder,
} from '@/lib/queries'
import { LaneDetail } from '@/lib/types'
import { redirect } from 'next/navigation'
import React from 'react'
import PipelineInfoBar from '../_components/pipeline-infobar'
import PipelineSettings from '../_components/pipeline-settings'
import PipelineView from '../_components/pipeline-view'

type Props = {
  params: {
    subaccountId: string
    pipelineId: string
  }
}

const PipelinePage = async ({ params }: Props) => {
  // First await the params
  const { subaccountId, pipelineId } = params
  if (!subaccountId) redirect(`/subaccount/unauthorized`);
  if (!pipelineId) redirect(`/subaccount/${subaccountId}/pipelines`);

  

  // Get pipeline details
  const pipelineDetails = await getPipelineDetails(pipelineId)
  if (!pipelineDetails) {
    return redirect(`/subaccount/${subaccountId}/pipelines`)
  }

  // Get all pipelines for the subaccount
  const pipelines = await db.pipeline.findMany({
    where: { subAccountId: subaccountId },
  })

  // Get lanes with tickets and tags
  const lanes = (await getLanesWithTicketAndTags(
    pipelineId
  )) as LaneDetail[]
  return (
    <Tabs
      defaultValue="view"
      className="w-full"
    >
      <TabsList className="bg-transparent border-b-2 h-16 w-full justify-between mb-4">
        <PipelineInfoBar
          pipelineId={pipelineId}
          subAccountId={subaccountId}
          pipelines={pipelines}
        />
        <div>
          <TabsTrigger value="view">Pipeline View</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </div>
      </TabsList>

      <TabsContent value="view" className="h-full w-full">
      <PipelineView
          lanes={lanes}
          pipelineDetails={pipelineDetails}
          pipelineId={pipelineId}
          subaccountId={subaccountId}
          updateLanesOrder={updateLanesOrder}
          updateTicketsOrder={updateTicketsOrder}
        />
      </TabsContent>
      <TabsContent value="settings">
        <PipelineSettings
        pipelineId={pipelineId}
        pipelines={pipelines}
        subaccountId={subaccountId}
        />
      </TabsContent>
    </Tabs>
  )
}

export default PipelinePage
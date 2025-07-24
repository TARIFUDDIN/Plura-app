import { db } from '@/lib/db'
import EditorProvider from '@/components/providers/editor/editor-provider'
import { redirect } from 'next/navigation'
import React from 'react'
import FunnelEditorNavigation from './_components/funnel-editor-navigation'
import FunnelEditorSidebar from './_components/funnel-editor-sidebar'
import FunnelEditor from './_components/funnel-editor'
import { constructMetadata } from '@/lib/utils'

type Props = {
  params: Promise<{
    subaccountId: string
    funnelId: string
    funnelPageId: string
  }>
}

const Page = async ({ params }: Props) => {
  // Await params before destructuring
  const { subaccountId, funnelId, funnelPageId } = await params;
   
  const funnelPageDetails = await db.funnelPage.findFirst({
    where: {
      id: funnelPageId,
    },
  })

  if (!funnelPageDetails) {
    return redirect(
      `/subaccount/${subaccountId}/funnels/${funnelId}`
    )
  }

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-[20] bg-background overflow-hidden">
      <EditorProvider
        subaccountId={subaccountId}
        funnelId={funnelId}
        pageDetails={funnelPageDetails}
      >
        <FunnelEditorNavigation
          funnelId={funnelId}
          funnelPageDetails={funnelPageDetails}
          subaccountId={subaccountId}
        />
        <div className="h-full flex justify-center">
          <FunnelEditor funnelPageId={funnelPageId} />
        </div>
        {/* Removed subaccountId prop since FunnelEditorSidebar doesn't accept it */}
        <FunnelEditorSidebar />
      </EditorProvider>
    </div>
  )
}

export default Page

export const metadata = constructMetadata({
  title: "Editor - Plura",
});
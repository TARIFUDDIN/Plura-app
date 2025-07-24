'use client'

import React, { useState, useEffect } from 'react'
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult,
  DroppableProvided
} from 'react-beautiful-dnd'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { upsertFunnelPage } from '@/lib/queries'
import { FunnelsForSubAccount } from '@/lib/types'
import { useModal } from '@/components/providers/ModalProvider'
import { FunnelPage } from '@prisma/client'
import { Check, ExternalLink, LucideEdit } from 'lucide-react'
import { toast } from "sonner"
import Link from 'next/link'
import FunnelPagePlaceholder from '@/components/icons/funnel-page-placeholder'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import CustomModal from '@/components/global/custom-modal'
import CreateFunnelPage from '@/components/forms/funnel-page'
import { Mail, ArrowDown } from 'lucide-react'

type Props = {
  funnel: FunnelsForSubAccount
  subaccountId: string
  pages: FunnelPage[]
  funnelId: string
}

interface StrictModeDroppableProps {
  children: (provided: DroppableProvided) => React.ReactElement
  droppableId: string
  direction: 'vertical' | 'horizontal'
}

// StrictModeDroppable Component
const StrictModeDroppable = ({ children, droppableId, direction }: StrictModeDroppableProps) => {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true))
    return () => {
      cancelAnimationFrame(animation)
      setEnabled(false)
    }
  }, [])

  if (!enabled) return null

  return (
    <Droppable droppableId={droppableId} direction={direction} isDropDisabled={false}>
      {children}
    </Droppable>
  )
}

export default function FunnelSteps({ 
  funnelId, 
  funnel, 
  pages, 
  subaccountId 
}: Props) {
  const [clickedPage, setClickedPage] = useState<FunnelPage | undefined>(pages[0])
  const { setOpen } = useModal()
  const [pagesState, setPagesState] = useState(pages)

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result

    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)
    ) {
      return
    }

    const newPageOrder = Array.from(pagesState)
    const [reorderedPage] = newPageOrder.splice(source.index, 1)
    newPageOrder.splice(destination.index, 0, reorderedPage)

    const updatedPages = newPageOrder.map((page, index) => ({
      ...page,
      order: index
    }))

    setPagesState(updatedPages)
    setClickedPage(updatedPages.find(p => p.id === clickedPage?.id))

    Promise.all(
      updatedPages.map((page) => 
        upsertFunnelPage(
          subaccountId,
          {
            id: page.id,
            order: page.order,
            name: page.name,
          },
          funnelId
        )
      )
    )
    .then(() => {
      toast.success("Success", {
        description: "Saved page order",
      })
    })
    .catch((error) => {
      console.error(error)
      toast.error("Failed", {
        description: "Could not save page order",
      })
      setPagesState(pages)
    })
  }

  const renderFunnelStepCard = (page: FunnelPage, index: number) => (
    <Draggable 
      key={page.id} 
      draggableId={`page-${page.id}`} 
      index={index}
      isDragDisabled={false}
    >
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-0 relative cursor-grab my-2 ${
            snapshot.isDragging ? 'shadow-lg' : ''
          }`}
          onClick={() => setClickedPage(page)}
        >
          <div className="p-2 flex items-center gap-4 flex-row">
            <div className="h-14 w-14 bg-muted flex items-center justify-center relative">
              <Mail />
              <ArrowDown
                size={18}
                className="absolute -bottom-2 text-primary"
              />
            </div>
            <span>{page.name}</span>
          </div>
          {page.id === clickedPage?.id && (
            <div className="w-2 top-2 right-2 h-2 absolute bg-emerald-500 rounded-full" />
          )}
        </Card>
      )}
    </Draggable>
  )

  return (
    <AlertDialog>
      <div className="flex border lg:flex-row flex-col">
        <aside className="flex-[0.3] bg-background p-6 flex flex-col justify-between">
          <ScrollArea className="h-full">
            <div className="flex gap-4 items-center mb-4">
              <Check />
              <span>Funnel Steps</span>
            </div>
            {pagesState.length ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <StrictModeDroppable 
                  droppableId="funnel-pages" 
                  direction="vertical"
                >
                  {(provided: DroppableProvided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {pagesState.map(renderFunnelStepCard)}
                      {provided.placeholder}
                    </div>
                  )}
                </StrictModeDroppable>
              </DragDropContext>
            ) : (
              <div className="text-center text-muted-foreground py-6">
                No Pages
              </div>
            )}
          </ScrollArea>
          <Button
            className="mt-4 w-full"
            onClick={() => {
              setOpen(
                <CustomModal
                  title="Create or Update a Funnel Page"
                  subheading="Funnel Pages allow you to create step by step processes for customers to follow"
                >
                  <CreateFunnelPage
                    subaccountId={subaccountId}
                    funnelId={funnelId}
                    order={pagesState.length}
                  />
                </CustomModal>
              )
            }}
          >
            Create New Steps
          </Button>
        </aside>

        <aside className="flex-[0.7] bg-muted p-4">
          {!!pages.length ? (
            <Card className="h-full flex justify-between flex-col">
              <CardHeader>
                <div className="text-sm text-muted-foreground">Page name</div>
                <CardTitle>{clickedPage?.name}</CardTitle>
                <CardDescription className="flex flex-col gap-4">
                  <div className="border-2 rounded-lg sm:w-80 w-full overflow-clip">
                    <Link
                      href={`/subaccount/${subaccountId}/funnels/${funnelId}/editor/${clickedPage?.id}`}
                      className="relative group"
                    >
                      <div className="cursor-pointer group-hover:opacity-30 w-full">
                        <FunnelPagePlaceholder />
                      </div>
                      <LucideEdit
                        size={50}
                        className="!text-muted-foreground absolute top-1/2 left-1/2 opacity-0 transform -translate-x-1/2 -translate-y-1/2 group-hover:opacity-100 transition-all duration-100"
                      />
                    </Link>

                    <Link
                      target="_blank"
                      href={`${process.env.NEXT_PUBLIC_SCHEME}${funnel.subDomainName}.${process.env.NEXT_PUBLIC_DOMAIN}/${clickedPage?.pathName}`}
                      className="group flex items-center justify-start p-2 gap-2 hover:text-primary transition-colors duration-200"
                    >
                      <ExternalLink size={15} />
                      <div className="w-64 overflow-hidden overflow-ellipsis">
                        {process.env.NEXT_PUBLIC_SCHEME}
                        {funnel.subDomainName}.{process.env.NEXT_PUBLIC_DOMAIN}/
                        {clickedPage?.pathName}
                      </div>
                    </Link>
                  </div>

                  <CreateFunnelPage
                    subaccountId={subaccountId}
                    defaultData={clickedPage}
                    funnelId={funnelId}
                    order={clickedPage?.order || 0}
                  />
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="h-[600px] flex items-center justify-center text-muted-foreground">
              Create a page to view page settings.
            </div>
          )}
        </aside>
      </div>
    </AlertDialog>
  )
}
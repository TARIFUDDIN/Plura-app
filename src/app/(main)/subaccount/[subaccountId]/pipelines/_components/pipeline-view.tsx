'use client'

import LaneForm from '@/components/forms/lane-form'
import CustomModal from '@/components/global/custom-modal'
import { Button } from '@/components/ui/button'
import {
  LaneDetail,
  PipelineDetailsWithLanesCardsTagsTickets,
  TicketAndTags,
} from '@/lib/types'

import { Lane } from '@prisma/client'
import { Flag, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { DragDropContext, Droppable, DropResult, DroppableProvided } from 'react-beautiful-dnd'
import PipelineLane from './pipeline-lane'
import { useModal } from '@/components/providers/ModalProvider'

type Props = {
  lanes: LaneDetail[]
  pipelineId: string
  subaccountId: string
  pipelineDetails: PipelineDetailsWithLanesCardsTagsTickets
  updateLanesOrder: (lanes: Lane[]) => Promise<void>
  updateTicketsOrder: (tickets: TicketAndTags[]) => Promise<void>
}

// StrictModeDroppable Component with proper typing
type StrictModeDroppableProps = {
  children: (provided: DroppableProvided) => React.ReactElement
  droppableId: string
  type: string
  direction: 'horizontal' | 'vertical'
}

const StrictModeDroppable = ({ children, droppableId, type, direction }: StrictModeDroppableProps) => {
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
    <Droppable droppableId={droppableId} type={type} direction={direction} isDropDisabled={false}>
      {children}
    </Droppable>
  )
}

const PipelineView = ({
  lanes,
  pipelineDetails,
  pipelineId,
  subaccountId,
  updateLanesOrder,
  updateTicketsOrder,
}: Props) => {
  const { setOpen } = useModal()
  const router = useRouter()
  const [allLanes, setAllLanes] = useState<LaneDetail[]>([])
  const [allTickets, setAllTickets] = useState<TicketAndTags[]>([])

  useEffect(() => {
    setAllLanes(lanes)
    // ✅ FIXED: Transform tickets to include Lane information
    const tickets: TicketAndTags[] = lanes.flatMap(lane => 
      lane.Tickets.map(ticket => ({
        ...ticket,
        Lane: {
          id: lane.id,
          name: lane.name,
          createdAt: lane.createdAt,
          updatedAt: lane.updatedAt,
          order: lane.order,
          pipelineId: lane.pipelineId
        }
      }))
    )
    setAllTickets(tickets)
  }, [lanes])

  const handleAddLane = () => {
    setOpen(
      <CustomModal
        title="Create A Lane"
        subheading="Lanes allow you to group tickets"
      >
        <LaneForm pipelineId={pipelineId} />
      </CustomModal>
    )
  }

  const onDragEnd = (dropResult: DropResult) => {
    console.log(dropResult)
    const { destination, source, type } = dropResult
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return
    }

    switch (type) {
      case 'lane': {
        const newLanes = [...allLanes]
          .toSpliced(source.index, 1)
          .toSpliced(destination.index, 0, allLanes[source.index])
          .map((lane, idx) => {
            return { ...lane, order: idx }
          })

        setAllLanes(newLanes)
        updateLanesOrder(newLanes)
        break
      }

      case 'ticket': {
        const newLanes = [...allLanes]
        const originLane = newLanes.find(
          (lane) => lane.id === source.droppableId
        )
        const destinationLane = newLanes.find(
          (lane) => lane.id === destination.droppableId
        )

        if (!originLane || !destinationLane) {
          return
        }

        if (source.droppableId === destination.droppableId) {
          const newOrderedTickets = [...originLane.Tickets]
            .toSpliced(source.index, 1)
            .toSpliced(destination.index, 0, originLane.Tickets[source.index])
            .map((item, idx) => {
              return { ...item, order: idx }
            })
          originLane.Tickets = newOrderedTickets
          setAllLanes(newLanes)
          
          // ✅ FIXED: Transform tickets to include Lane information when updating
          const ticketsWithLane = newOrderedTickets.map(ticket => ({
            ...ticket,
            Lane: {
              id: originLane.id,
              name: originLane.name,
              createdAt: originLane.createdAt,
              updatedAt: originLane.updatedAt,
              order: originLane.order,
              pipelineId: originLane.pipelineId
            }
          }))
          updateTicketsOrder(ticketsWithLane)
          router.refresh()
        } else {
          const [currentTicket] = originLane.Tickets.splice(source.index, 1)

          originLane.Tickets.forEach((ticket, idx) => {
            ticket.order = idx
          })

          destinationLane.Tickets.splice(destination.index, 0, {
            ...currentTicket,
            laneId: destination.droppableId,
          })

          destinationLane.Tickets.forEach((ticket, idx) => {
            ticket.order = idx
          })
          setAllLanes(newLanes)
          
          // ✅ FIXED: Transform tickets to include Lane information
          const allUpdatedTickets = [
            ...destinationLane.Tickets.map(ticket => ({
              ...ticket,
              Lane: {
                id: destinationLane.id,
                name: destinationLane.name,
                createdAt: destinationLane.createdAt,
                updatedAt: destinationLane.updatedAt,
                order: destinationLane.order,
                pipelineId: destinationLane.pipelineId
              }
            })),
            ...originLane.Tickets.map(ticket => ({
              ...ticket,
              Lane: {
                id: originLane.id,
                name: originLane.name,
                createdAt: originLane.createdAt,
                updatedAt: originLane.updatedAt,
                order: originLane.order,
                pipelineId: originLane.pipelineId
              }
            }))
          ]
          
          updateTicketsOrder(allUpdatedTickets)
          router.refresh()
        }
        break
      }
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="bg-white/60 dark:bg-background/60 rounded-xl p-4 use-automation-zoom-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">{pipelineDetails?.name}</h1>
          <Button
            className="flex items-center gap-4"
            onClick={handleAddLane}
          >
            <Plus size={15} />
            Create Lane
          </Button>
        </div>
        <StrictModeDroppable
          droppableId="lanes"
          type="lane"
          direction="horizontal"
        >
          {(provided: DroppableProvided) => (
            <div
              className="flex items-center gap-x-2 overflow-scroll"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <div className="flex mt-4">
                {allLanes.map((lane, index) => (
                  <PipelineLane
                    key={lane.id}
                    allTickets={allTickets}
                    setAllTickets={setAllTickets}
                    subaccountId={subaccountId}
                    pipelineId={pipelineId}
                    tickets={lane.Tickets.map(ticket => ({
                      ...ticket,
                      Lane: {
                        id: lane.id,
                        name: lane.name,
                        createdAt: lane.createdAt,
                        updatedAt: lane.updatedAt,
                        order: lane.order,
                        pipelineId: lane.pipelineId
                      }
                    }))}
                    laneDetails={lane}
                    index={index}
                  />
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </StrictModeDroppable>
        {allLanes.length === 0 && (
          <div className="flex items-center justify-center w-full flex-col">
            <div className="opacity-100">
              <Flag
                width="100%"
                height="100%"
                className="text-muted-foreground"
              />
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  )
}

export default PipelineView
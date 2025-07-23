'use client'

import React from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { MoreVertical, Edit, PlusCircleIcon, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { LaneDetail, TicketWithTags } from '@/lib/types'
import { cn } from '@/lib/utils'
import { deleteLane, saveActivityLogsNotification } from '@/lib/queries'
import PipelineTicket from './pipeline-ticket'
import CustomModal from '@/components/global/custom-modal'
import CreateLaneForm from '@/components/forms/lane-form'
import TicketForm from '@/components/forms/ticket-form'
import { useModal } from '@/components/providers/ModalProvider'
import { StrictModeDroppable } from './StrictModeDroppable'

interface PipelineLaneProps {
  laneDetails: LaneDetail
  tickets: TicketWithTags
  pipelineId: string
  subaccountId: string
  index: number
  allTickets: TicketWithTags
  setAllTickets: React.Dispatch<React.SetStateAction<TicketWithTags>>
}

const PipelineLane: React.FC<PipelineLaneProps> = ({
  laneDetails,
  tickets,
  pipelineId,
  subaccountId,
  index,
  allTickets,
  setAllTickets,
}) => {
  const { setOpen } = useModal()
  const router = useRouter()

  const amt = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  })

  const laneAmt = React.useMemo(() => {
    return tickets.reduce(
      (sum, ticket) => sum + (Number(ticket?.value) || 0),
      0
    )
  }, [tickets])

  const randomColor = `#${Math.random().toString(16).slice(2, 8)}`

  const addNewTicket = (ticket: TicketWithTags[0]) => {
    setAllTickets([...allTickets, ticket])
  }

  const handleCreateTicket = () => {
    setOpen(
      <CustomModal
        title="Create A Ticket"
        subheading="Tickets are a great way to keep track of tasks"
      >
        <TicketForm
          getNewTicket={addNewTicket}
          laneId={laneDetails.id}
          subaccountId={subaccountId}
        />
      </CustomModal>
    )
  }

  const handleEditLane = () => {
    setOpen(
      <CustomModal
        title="Edit Lane Details"
        subheading=""
      >
        <CreateLaneForm
          pipelineId={pipelineId}
          defaultData={laneDetails}
        />
      </CustomModal>
    )
  }

  const handleDeleteLane = async () => {
    try {
      const response = await deleteLane(laneDetails.id)
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Deleted a lane | ${response?.name}`,
        subaccountId,
      })
      router.refresh()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Draggable
      draggableId={laneDetails?.id.toString() || 'default-id'}
      index={index}
      key={laneDetails?.id}
      isDragDisabled={false}
    >
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="h-full rounded-md"
        >
          <AlertDialog>
            <DropdownMenu>
              <div className="bg-slate-200/30 dark:bg-background/20 h-[700px] w-[300px] px-4 relative rounded-md overflow-visible flex-shrink-0">
                <div
                  {...provided.dragHandleProps}
                  className="h-14 backdrop-blur-lg dark:bg-background/40 bg-slate-200/60 rounded-md absolute top-0 left-0 right-0 z-10"
                >
                  <div className="h-full flex items-center p-4 pr-2 justify-between cursor-grab border-b-[1px]">
                    <div className="flex items-center w-full gap-2">
                      <div
                        className={cn('w-4 h-4 rounded-full')}
                        style={{ background: randomColor }}
                      />
                      <span className="font-bold text-sm">
                        {laneDetails.name}
                      </span>
                    </div>
                    <div className="flex items-center flex-row gap-1">
                      <Badge className="bg-white text-black">
                        {amt.format(laneAmt)}
                      </Badge>
                      <DropdownMenuTrigger>
                        <MoreVertical className="text-muted-foreground cursor-pointer w-5 h-5" />
                      </DropdownMenuTrigger>
                    </div>
                  </div>
                </div>

                <StrictModeDroppable
                  droppableId={laneDetails?.id || 'default-id'}
                  key={laneDetails?.id}
                  type="ticket"
                  isDropDisabled={false}
                >
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="max-h-[700px] h-full w-full pt-12 overflow-auto scrollbar scrollbar-thumb-muted-foreground/20 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-medium z-[99999]"
                    >
                      {tickets.map((ticket, index) => (
                        <PipelineTicket
                          allTickets={allTickets}
                          setAllTickets={setAllTickets}
                          subaccountId={subaccountId}
                          ticket={ticket}
                          key={ticket.id}
                          index={index}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </StrictModeDroppable>

                <DropdownMenuContent>
                  <DropdownMenuLabel>Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleEditLane}
                    className="flex items-center gap-2 w-full cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleCreateTicket}
                    className="flex items-center gap-2 w-full cursor-pointer"
                  >
                    <PlusCircleIcon className="w-4 h-4" />
                    Create Ticket
                  </DropdownMenuItem>
                  <AlertDialogTrigger className="w-full">
                    <DropdownMenuItem className="flex items-center gap-2 w-full cursor-pointer text-destructive">
                      <Trash className="w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </div>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    this lane and all tickets within it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteLane}
                    className="bg-destructive"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </DropdownMenu>
          </AlertDialog>
        </div>
      )}
    </Draggable>
  )
}

export default PipelineLane
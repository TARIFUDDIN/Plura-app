import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FunnelPage } from '@prisma/client'
import { ArrowDown, Mail } from 'lucide-react'
import { Draggable } from 'react-beautiful-dnd'

type Props = {
  funnelPage: FunnelPage
  index: number
  activePage: boolean
}

const FunnelStepCard = ({ 
  activePage, 
  funnelPage, 
  index 
}: Props) => {
  return (
    <Draggable 
      key={funnelPage.id}
      draggableId={`page-${funnelPage.id}`}
      index={index}
    >
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-0 relative cursor-grab my-2 ${
            snapshot.isDragging ? 'shadow-lg' : ''
          }`}
        >
          <CardContent className="p-0 flex items-center gap-4 flex-row p-2">
            <div className="h-14 w-14 bg-muted flex items-center justify-center relative">
              <Mail />
              <ArrowDown
                size={18}
                className="absolute -bottom-2 text-primary"
              />
            </div>
            {funnelPage.name}
          </CardContent>
          {activePage && (
            <div className="w-2 top-2 right-2 h-2 absolute bg-emerald-500 rounded-full" />
          )}
        </Card>
      )}
    </Draggable>
  )
}

export default FunnelStepCard
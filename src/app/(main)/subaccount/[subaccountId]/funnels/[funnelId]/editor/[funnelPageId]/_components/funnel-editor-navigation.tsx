'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { saveActivityLogsNotification, upsertFunnelPage } from '@/lib/queries'
import { DeviceTypes, useEditor } from '@/components/providers/editor/editor-provider'
import { FunnelPage } from '@prisma/client'
import clsx from 'clsx'
import {
  ArrowLeftCircle,
  Eye,
  EyeIcon,
  Laptop,
  Redo2,
  Smartphone,
  Tablet,
  Undo2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { FocusEventHandler, useEffect } from 'react'
import { toast } from 'sonner'
import { ModeToggle } from '@/components/common/ModeToggle'

type Props = {
  funnelId: string
  funnelPageDetails: FunnelPage
  subaccountId: string
}

const FunnelEditorNavigation = ({
  funnelId,
  funnelPageDetails,
  subaccountId,
}: Props) => {
  const router = useRouter()
  const { state, dispatch } = useEditor()

  useEffect(() => {
    dispatch({
      type: 'SET_FUNNELPAGE_ID',
      payload: { funnelPageId: funnelPageDetails.id },
    })
  }, [funnelPageDetails])

  const handleOnBlurTitleChange: FocusEventHandler<HTMLInputElement> = async (
    event
  ) => {
    if (event.target.value === funnelPageDetails.name) return
    if (event.target.value) {
      await upsertFunnelPage(
        subaccountId,
        {
          id: funnelPageDetails.id,
          name: event.target.value,
          order: funnelPageDetails.order,
        },
        funnelId
      )

      toast('Success', {
        description: 'Saved Funnel Page title',
      })
      router.refresh()
    } else {
      toast('Oppse!', {
        description: 'You need to have a title!',
      })
      event.target.value = funnelPageDetails.name
    }
  }

  const handlePreviewClick = () => {
    dispatch({ type: 'TOGGLE_PREVIEW_MODE' })
    dispatch({ type: 'TOGGLE_LIVE_MODE' })
  }

  const handleUndo = () => {
    dispatch({ type: 'UNDO' })
  }

  const handleRedo = () => {
    dispatch({ type: 'REDO' })
  }

  const handleOnSave = async () => {
    const content = JSON.stringify(state.editor.elements)
    try {
      const response = await upsertFunnelPage(
        subaccountId,
        {
          ...funnelPageDetails,
          content,
        },
        funnelId
      )
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a funnel page | ${response?.name}`,
        subaccountId: subaccountId,
      })
      toast('Success', {
        description: 'Saved Editor',
      })
    } catch (error) {
      toast('Oppse!', {
        description: 'Could not save editor',
      })
    }
  }

  return (
    <TooltipProvider>
      <nav
        className={clsx(
          'border-b-[1px] flex items-center justify-between p-6 gap-2 transition-all',
          { '!h-0 !p-0 !overflow-hidden': state.editor.previewMode }
        )}
      >
        <aside className="flex items-center gap-4 max-w-[260px] w-[300px]">
          <Link href={`/subaccount/${subaccountId}/funnels/${funnelId}`}>
            <ArrowLeftCircle />
          </Link>
          <div className="flex flex-col w-full ">
            <Input
              defaultValue={funnelPageDetails.name}
              className="border-none h-5 m-0 p-0 text-lg"
              onBlur={handleOnBlurTitleChange}
            />
            <span className="text-sm text-muted-foreground">
              Path: /{funnelPageDetails.pathName}
            </span>
          </div>
        </aside>
        <aside>
          <Tabs
            defaultValue="Desktop"
            className="w-fit "
            value={state.editor.device}
            onValueChange={(value) => {
              dispatch({
                type: 'CHANGE_DEVICE',
                payload: { device: value as DeviceTypes },
              })
            }}
          >
            <TabsList className="grid w-full grid-cols-3 bg-transparent h-fit">
              <Tooltip>
                <TooltipTrigger>
                  <TabsTrigger
                    value="Desktop"
                    className="data-[state=active]:bg-muted w-10 h-10 p-0"
                  >
                    <Laptop />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Desktop</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <TabsTrigger
                    value="Tablet"
                    className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                  >
                    <Tablet />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tablet</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <TabsTrigger
                    value="Mobile"
                    className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                  >
                    <Smartphone />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mobile</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </Tabs>
        </aside>
        <aside className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger>
              <ModeToggle className="h-10 w-10 rounded-md" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Color Mode</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviewClick}
              >
                <Eye className="w-5 h-5" aria-label="Preview" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="inline-flex items-center gap-2">
                Preview{" "}
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <div className="text-xs">⌘</div>P
                </kbd>
              </p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
            <Button
            disabled={!(state.history.currentIndex > 0)}
            onClick={handleUndo}
            variant={'ghost'}
            size={'icon'}
            className="hover:bg-slate-800"
          >
                <Undo2 className="w-5 h-5" aria-label="Undo" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="inline-flex items-center gap-2">
                Undo{" "}
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <div className="text-xs">⌘</div>Z
                </kbd>
              </p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
            <Button
            disabled={
              !(state.history.currentIndex < state.history.history.length - 1)
            }
            onClick={handleRedo}
            variant={'ghost'}
            size={'icon'}
            className="hover:bg-slate-800 mr-4"
          >
            
                <Redo2 className="w-5 h-5" aria-label="Redo" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="inline-flex items-center gap-2">
                Redo{" "}
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <div className="text-xs">⌘</div>Y
                </kbd>
              </p>
            </TooltipContent>
          </Tooltip>
          <div className="flex flex-col item-center mr-4">
            <div className="flex flex-row items-center gap-4">
              Draft
              <Switch
                disabled
                defaultChecked={true}
              />
              Publish
            </div>
            <span className="text-muted-foreground text-sm">
              Last updated {funnelPageDetails.updatedAt.toLocaleDateString()}
            </span>
          </div>
          <Button onClick={handleOnSave}>Save</Button>
        </aside>
      </nav>
    </TooltipProvider>
  )
}

export default FunnelEditorNavigation
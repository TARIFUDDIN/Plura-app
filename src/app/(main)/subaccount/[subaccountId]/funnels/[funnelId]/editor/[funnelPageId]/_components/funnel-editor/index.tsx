"use client";

import React from "react";
import { EyeOff } from "lucide-react";
import { type FunnelPage } from "@prisma/client";

import EditorRecursive from "./funnel-editor-components/recursive";


import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEditor } from "@/components/providers/editor/editor-provider";
import { getFunnelPageDetails } from '@/lib/queries'
interface FunnelEditorProps {
  funnelPageId: string;
  liveMode?: boolean;
  
}

const FunnelEditor: React.FC<FunnelEditorProps> = ({
  funnelPageId,
  liveMode,
  
}) => {
  const { state, dispatch } = useEditor();

  React.useEffect(() => {
    if (liveMode) {
      dispatch({
        type: "TOGGLE_LIVE_MODE",
        payload: { value: true },
      });
    }
  }, [liveMode]);

  React. useEffect(() => {
    const fetchData = async () => {
      const response = await getFunnelPageDetails(funnelPageId)
      if (!response) return

      dispatch({
        type: 'LOAD_DATA',
        payload: {
          elements: response.content ? JSON.parse(response?.content) : '',
          withLive: !!liveMode,
        },
      })
    }
    fetchData()
  }, [funnelPageId, dispatch, liveMode])


  const handleClickElement = () => {
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {},
    });
  };

  const handlePreview = () => {
    dispatch({ type: "TOGGLE_LIVE_MODE" });
    dispatch({ type: "TOGGLE_PREVIEW_MODE" });
  };

  return (
    <div
      className={cn(
        "h-screen overflow-y-hidden overflow-x-hidden mr-[385px] z-[999999] bg-background scrollbar scrollbar-thumb-muted-foreground/20 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-medium",
        {
          "p-0 mr-0": state.editor.previewMode || state.editor.liveMode,
          "!w-[850px] mx-auto": state.editor.device === "Tablet",
          "!w-[420px] mx-auto": state.editor.device === "Mobile",
          "pb-[100px] use-automation-zoom-in transition-all": !state.editor.previewMode && !state.editor.liveMode, // for scroll
        }
      )}
      onClick={handleClickElement}
    >
      {state.editor.previewMode && state.editor.liveMode && (
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 left-4 z-[100]"
          onClick={handlePreview}
          title="Back to editor"
        >
          <EyeOff aria-label="Back to editor" className="w-4 h-4" />
        </Button>
      )}

      {Array.isArray(state.editor.elements) &&
        state.editor.elements.map((element) => (
          <EditorRecursive key={element.id} element={element} />
        ))}
    </div>
  );
};

export default FunnelEditor;
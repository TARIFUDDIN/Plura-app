
// components/ui/custom-scroll-area.tsx
import React from "react";
import { ScrollArea } from "./scroll-area";
import { cn } from "@/lib/utils";

interface CustomScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  scrollShadow?: boolean;
}

export const CustomScrollArea: React.FC<CustomScrollAreaProps> = ({
  children,
  className,
  scrollShadow = false,
}) => {
  return (
    <div className={cn("relative", scrollShadow && "scroll-shadow-container")}>
      <ScrollArea className={className}>
        {children}
      </ScrollArea>
      {scrollShadow && (
        <>
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-background to-transparent z-10" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-background to-transparent z-10" />
        </>
      )}
    </div>
  );
};
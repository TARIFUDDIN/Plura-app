"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { TESTIMONIALS_CARD } from "@/config/testimonials";
import { Card, CardContent } from "@/components/ui/card";

interface InfiniteMovingCardsProps {
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}

export const InfiniteMovingCards: React.FC<InfiniteMovingCardsProps> = ({
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [start, setStart] = React.useState(false);

  React.useEffect(() => {
    addAnimation();
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      // First, clear any existing duplicates
      const originalChildren = Array.from(
        scrollerRef.current.children
      ).slice(0, TESTIMONIALS_CARD.length);
      
      scrollerRef.current.innerHTML = "";
      
      // Add original elements back
      originalChildren.forEach(child => {
        scrollerRef.current?.appendChild(child);
      });
      
      // Then duplicate them
      originalChildren.forEach(item => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });
      
      setStart(true);
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <style jsx>{`
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        
        .scrolling-wrapper {
          display: flex;
          min-width: 100%;
          width: max-content;
          flex-wrap: nowrap;
          gap: 1rem;
          padding: 1rem 0;
        }
        
        .scrolling-wrapper.animate {
          animation: scroll ${speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s"} 
                    linear ${direction === "left" ? "normal" : "reverse"} infinite;
        }
        
        .scrolling-wrapper.animate:hover {
          animation-play-state: ${pauseOnHover ? "paused" : "running"};
        }
      `}</style>
      
      <div
        ref={scrollerRef}
        className={`scrolling-wrapper ${start ? "animate" : ""}`}
      >
        {TESTIMONIALS_CARD.map((item, idx) => (
          <Card
            className="w-[350px] max-w-full pt-6 relative rounded-2xl border border-b-0 flex-shrink-0 md:w-[450px]"
            key={`${item.name}-${idx}`}
          >
            <CardContent>
              <div
                aria-hidden="true"
                className="user-select-none -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
              ></div>
              <span className="relative z-20 text-sm font-medium leading-[1.6]">
                {item.quote}
              </span>
              <div className="relative z-20 mt-6 flex flex-row items-center">
                <span className="flex flex-col gap-1">
                  <span className="text-sm leading-[1.6] font-normal text-muted-foreground">
                    {item.name}
                  </span>
                  <span className="text-sm leading-[1.6] font-normal text-muted-foreground">
                    {item.title}
                  </span>
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
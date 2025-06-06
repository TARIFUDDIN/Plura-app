"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TypewriterEffectProps {
  className?: string;
  cursorClassName?: string;
}

export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  className,
  cursorClassName,
}) => {
  const words = [
    { text: "Run" },
    { text: "your" },
    { text: "agency" },
    { text: "in" },
    { text: "just" },
    { text: "one" },
    { text: "place.", className: "text-blue-500 dark:text-blue-500" },
  ];

  // Split each word into characters
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));

  const renderWords = () => (
    <div>
      {wordsArray.map((word, wordIdx) => (
        <span key={`word-${wordIdx}`} className="inline-block">
          {word.text.map((char, charIdx) => (
            <span key={`char-${charIdx}`} className={cn("z-[99999]", word.className)}>
              {char}
            </span>
          ))}
          &nbsp;
        </span>
      ))}
    </div>
  );

  return (
    <div className={cn("flex justify-center w-full space-x-1", className)}>
      <motion.div
        className="overflow-hidden pb-2"
        initial={{ width: "0%" }}
        whileInView={{ width: "fit-content" }}
        transition={{
          duration: 2,
          ease: "linear",
          delay: 1,
        }}
      >
        <div
          className="text-base text-center font-medium"
          style={{ whiteSpace: "nowrap" }}
        >
          {renderWords()}
        </div>
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "block rounded-sm w-[2.5px] h-6 bg-primary",
          cursorClassName
        )}
      ></motion.span>
    </div>
  );
};
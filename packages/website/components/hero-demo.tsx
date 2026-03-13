"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { useWebHaptics } from "web-haptics/react";
import {
  DEMO_CYCLE_INTERVAL_MS,
  SELECTION_PADDING_PX,
  SELECTION_TRANSITION_DURATION_S,
} from "@/constants";

interface DemoElement {
  componentName: string;
  filePath: string;
  lineNumber: number;
  columnNumber: number;
}

const DEMO_ELEMENTS: DemoElement[] = [
  { componentName: "BrandLogo", filePath: "src/BrandLogo.tsx", lineNumber: 5, columnNumber: 3 },
  { componentName: "Hero", filePath: "src/Hero.tsx", lineNumber: 12, columnNumber: 5 },
  { componentName: "CallToAction", filePath: "src/CallToAction.tsx", lineNumber: 8, columnNumber: 3 },
];

const selectionTransition: { type: "tween"; duration: number; ease: "easeOut" } = {
  type: "tween",
  duration: SELECTION_TRANSITION_DURATION_S,
  ease: "easeOut",
};

interface SelectionOverlayProps {
  element: DemoElement;
}

const SelectionOverlay = ({ element }: SelectionOverlayProps) => (
  <>
    <motion.div
      layoutId="selection-box"
      className="pointer-events-none absolute"
      style={{
        inset: -SELECTION_PADDING_PX,
        border: "2px solid rgba(139, 196, 248, 0.2)",
        backgroundColor: "rgba(139, 196, 248, 0.08)",
      }}
      transition={selectionTransition}
    />
    <div
      className="pointer-events-none absolute left-0 whitespace-nowrap px-1.5 py-0.5 text-[11px]"
      style={{
        bottom: `calc(100% + ${SELECTION_PADDING_PX}px)`,
        left: -SELECTION_PADDING_PX,
        backgroundColor: "rgba(37, 53, 69, 0.95)",
        color: "#8BC4F8",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <span className="font-medium">{element.componentName}</span>
      <span className="font-normal">
        {" "}· {element.filePath}:{element.lineNumber}:{element.columnNumber}
      </span>
    </div>
  </>
);

export const HeroDemo = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { trigger } = useWebHaptics();

  const selectElement = useCallback(
    (index: number) => {
      setActiveIndex(index);
      trigger("selection");
    },
    [trigger],
  );

  const advance = useCallback(() => {
    setActiveIndex((previous) => (previous + 1) % DEMO_ELEMENTS.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(advance, DEMO_CYCLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [paused, advance]);

  return (
    <div
      className="w-full overflow-hidden rounded-lg border border-border/50"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center gap-2 border-b border-border/30 px-3 py-1.5">
        <div className="flex gap-1">
          <div className="size-1.5 rounded-full bg-foreground/10" />
          <div className="size-1.5 rounded-full bg-foreground/10" />
          <div className="size-1.5 rounded-full bg-foreground/10" />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground/40">
          localhost:3000
        </span>
      </div>

      <div
        className="relative px-5 pt-7 pb-6 sm:px-6 sm:pb-8"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        <div
          className="relative mb-5 inline-block cursor-pointer text-lg font-medium italic text-foreground/90"
          style={{ fontFeatureSettings: '"cswh"' }}
          onMouseEnter={() => selectElement(0)}
          onClick={() => selectElement(0)}
        >
          My App
          {activeIndex === 0 && (
            <SelectionOverlay element={DEMO_ELEMENTS[0]} />
          )}
        </div>

        <div
          className="relative mb-5 max-w-[36ch] cursor-pointer text-[15px] leading-[1.4] text-muted-foreground"
          onMouseEnter={() => selectElement(1)}
          onClick={() => selectElement(1)}
        >
          Click any element to jump straight to its source. Works with any
          framework, bundler, or runtime.
          {activeIndex === 1 && (
            <SelectionOverlay element={DEMO_ELEMENTS[1]} />
          )}
        </div>

        <div className="relative inline-block">
          <button
            onMouseEnter={() => selectElement(2)}
            onClick={() => selectElement(2)}
            type="button"
            className="cursor-pointer bg-foreground/6 px-3 py-1.5 text-sm text-muted-foreground"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Get started
          </button>
          {activeIndex === 2 && (
            <SelectionOverlay element={DEMO_ELEMENTS[2]} />
          )}
        </div>
      </div>
    </div>
  );
};

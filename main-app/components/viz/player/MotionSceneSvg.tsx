"use client";

import { AnimatePresence, motion } from "motion/react";
import type { VizItem, VizScene } from "@/lib/viz/geometry";
import { MAX_SCALE } from "@/lib/viz/geometry";
import { Item } from "../primitives";
import "../viz.css";

export interface MotionSceneSvgProps {
  scene: VizScene;
  /** The panel's fixed box (union over every step): the aspect ratio never changes. */
  box: { width: number; height: number };
  /** Accessible name (<title>) and description (<desc>). */
  title: string;
  desc?: string | undefined;
}

/**
 * Free-standing text paints above every shape so lines and sweeps never cross labels.
 */
function paintOrder(items: VizItem[]): VizItem[] {
  return [...items.filter((i) => i.t !== "text"), ...items.filter((i) => i.t === "text")];
}

/**
 * Interactive SVG drawing powered by Motion for enter/exit animations (plan §4.2, §4.11.3).
 * Loaded lazily only when a player comes near the viewport.
 */
export function MotionSceneSvg({ scene, box, title, desc }: MotionSceneSvgProps) {
  return (
    <svg
      className="vz-svg"
      viewBox={`0 0 ${box.width} ${box.height}`}
      role="img"
      style={{
        maxWidth: `${Math.round(box.width * MAX_SCALE)}px`,
        ["--vz-nat" as string]: box.width,
      }}
    >
      <title>{title}</title>
      {desc ? <desc>{desc}</desc> : null}
      <AnimatePresence initial={false}>
        {paintOrder(scene.items).map((it) => (
          <motion.g
            key={it.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: [0.2, 0, 0, 1] } }}
            transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
          >
            <Item item={it} />
          </motion.g>
        ))}
      </AnimatePresence>
    </svg>
  );
}

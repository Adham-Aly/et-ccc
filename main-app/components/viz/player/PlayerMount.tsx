"use client";

import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { PlayerData } from "./types";

export interface PlayerProps {
  data: PlayerData;
  /** data-ctl of the control that had focus in the server-rendered frame (focus is restored). */
  focusCtl: string | null;
  /** data-ctl of a control clicked before the player loaded (the action is replayed). */
  pendingCtl: string | null;
}

let playerModule: Promise<ComponentType<PlayerProps>> | null = null;
function loadPlayer(): Promise<ComponentType<PlayerProps>> {
  // One shared lazy chunk for every player on the page (plan §4.8): the player, the layouts and
  // the renderers load only when a visual comes near the viewport.
  playerModule ??= import("./Player").then((m) => m.Player);
  return playerModule;
}

/**
 * Renders the server-rendered first frame (children) until the visual is near the viewport or
 * the reader interacts with it, then swaps in the interactive player from the lazy chunk.
 */
export function PlayerMount({ data, children }: { data: PlayerData; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [Player, setPlayer] = useState<ComponentType<PlayerProps> | null>(null);
  const focusCtl = useRef<string | null>(null);
  const pendingCtl = useRef<string | null>(null);
  const started = useRef(false);

  const activate = useCallback(() => {
    if (started.current || data.demo?.frozen) return;
    started.current = true;
    loadPlayer().then((P) => setPlayer(() => P));
  }, [data.demo?.frozen]);

  useEffect(() => {
    const el = ref.current;
    if (data.demo?.frozen) return;
    if (!el || typeof IntersectionObserver === "undefined") {
      activate();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          activate();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [activate, data.demo?.frozen]);

  if (Player) {
    return (
      <div ref={ref} className="vz-mount">
        <Player data={data} focusCtl={focusCtl.current} pendingCtl={pendingCtl.current} />
      </div>
    );
  }
  const ctlOf = (t: EventTarget | null) =>
    t instanceof Element ? (t.closest("[data-ctl]")?.getAttribute("data-ctl") ?? null) : null;
  return (
    <div
      ref={ref}
      className="vz-mount"
      data-frozen={data.demo?.frozen ? "" : undefined}
      onFocusCapture={(e) => {
        focusCtl.current = ctlOf(e.target) ?? "frame";
        activate();
      }}
      onPointerEnter={activate}
      onClickCapture={(e) => {
        pendingCtl.current = ctlOf(e.target);
        activate();
      }}
    >
      {children}
    </div>
  );
}

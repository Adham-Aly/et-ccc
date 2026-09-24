"use client";

import { useEffect, useRef, useState } from "react";
import { useReadState } from "@/lib/read-state";
import { buttonClass } from "./button-styles";
import { ReadCell } from "./ReadCell";

export interface MarkAsReadProps {
  lessonId: string;
  labels: { markRead: string; read: string; markedOn: string; undo: string };
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { day: "numeric", month: "short" }).format(
      new Date(iso),
    );
  } catch {
    return iso.slice(0, 10);
  }
}

/**
 * Mark-as-read control (DESIGN.md → Read cell and mark-as-read). Renders the unread state on the
 * server; marking plays the ink-in wipe once.
 */
export function MarkAsRead({ lessonId, labels }: MarkAsReadProps) {
  const rs = useReadState();
  const [justMarked, setJustMarked] = useState(false);
  const [moved, setMoved] = useState<"marked" | "undone" | null>(null);
  const undoRef = useRef<HTMLButtonElement>(null);
  const markRef = useRef<HTMLButtonElement>(null);
  const at = rs.ready ? rs.readAt(lessonId) : null;

  // Keep keyboard focus on the control that replaced the one just pressed.
  useEffect(() => {
    if (moved === "marked") undoRef.current?.focus();
    if (moved === "undone") markRef.current?.focus();
  }, [moved]);

  if (at) {
    return (
      <div className="flex min-h-10 flex-wrap items-center gap-x-4 gap-y-2">
        <span className={buttonClass("secondary", "md", "pointer-events-none")} aria-hidden="true">
          <ReadCell read inkIn={justMarked} size="md" />
          {labels.read}
        </span>
        <span className="text-ink-2 text-small" role="status">
          <span className="sr-only">{labels.read}. </span>
          {labels.markedOn.replace("{date}", formatDate(at))}
        </span>
        <button
          ref={undoRef}
          type="button"
          className={buttonClass("ghost", "sm")}
          onClick={() => {
            setJustMarked(false);
            setMoved("undone");
            rs.markUnread(lessonId);
          }}
        >
          {labels.undo}
        </button>
      </div>
    );
  }
  return (
    <div className="flex min-h-10 items-center">
      <button
        ref={markRef}
        type="button"
        className={buttonClass("primary", "md")}
        onClick={() => {
          setJustMarked(true);
          setMoved("marked");
          rs.markRead(lessonId);
        }}
      >
        <ReadCell read={false} size="md" className="border-paper bg-transparent" />
        {labels.markRead}
      </button>
    </div>
  );
}

"use client";

import { useReadState } from "@/lib/read-state";
import { ReadCell } from "./ReadCell";

/** A read cell bound to read state (sidebar, course map, module lists). Server render: unread. */
export function LiveReadCell({ lessonId, readLabel }: { lessonId: string; readLabel: string }) {
  const rs = useReadState();
  const read = rs.ready && rs.isRead(lessonId);
  return (
    <>
      <ReadCell read={read} />
      {read ? <span className="sr-only">{readLabel}</span> : null}
    </>
  );
}

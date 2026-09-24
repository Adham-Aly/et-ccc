import { ArrowLeft, ArrowRight } from "lucide-react";
import type { LessonPageProps } from "@/components/layout/props";
import { cn } from "@/components/ui/cn";
import { MarkAsRead } from "@/components/ui/MarkAsRead";
import { RichTitle } from "@/components/ui/RichTitle";
import { ui } from "@/components/ui/ui-strings";

/** The ruled block that ends every lesson: mark as read, then Previous and Next. */
export function ClosingTitleBlock({
  lessonId,
  nav,
}: {
  lessonId: string;
  nav: LessonPageProps["nav"];
}) {
  const s = ui().lesson;
  const next = nav.next ?? { href: "/learn", title: s.backToMap, moduleTitle: undefined };
  return (
    <section
      aria-label={s.markRead}
      className="mt-14 max-w-(--measure) border-rule border-t border-b"
    >
      <div className="py-4">
        <MarkAsRead
          lessonId={lessonId}
          labels={{ markRead: s.markRead, read: s.read, markedOn: s.markedOn, undo: s.undo }}
        />
      </div>
      <nav
        aria-label={`${s.previous} / ${s.next}`}
        className="grid grid-cols-1 border-rule border-t sm:grid-cols-2"
      >
        {nav.prev ? (
          <a
            href={nav.prev.href}
            rel="prev"
            className="group flex flex-col gap-0.5 py-4 pr-4 hover:bg-board sm:border-rule sm:border-r"
          >
            <span className="flex items-center gap-1 text-ink-3 text-label font-normal">
              <ArrowLeft aria-hidden="true" size={14} strokeWidth={2} />
              {s.previous}
            </span>
            <span className="font-semibold text-ink text-ui group-hover:underline group-hover:underline-offset-[0.2em]">
              <RichTitle text={nav.prev.title} />
            </span>
          </a>
        ) : (
          <span aria-hidden="true" className="hidden sm:block sm:border-rule sm:border-r" />
        )}
        <a
          href={next.href}
          rel={nav.next ? "next" : undefined}
          className={cn(
            "group flex flex-col items-end gap-0.5 py-4 text-right hover:bg-board sm:pl-4",
            nav.prev && "max-sm:border-rule max-sm:border-t",
          )}
        >
          <span className="flex items-center gap-1 text-ink-3 text-label font-normal">
            {s.next}
            <ArrowRight aria-hidden="true" size={14} strokeWidth={2} />
          </span>
          <span className="font-semibold text-ink text-ui group-hover:underline group-hover:underline-offset-[0.2em]">
            <RichTitle text={next.title} />
          </span>
          {next.moduleTitle ? (
            <span className="text-ink-3 text-small">{next.moduleTitle}</span>
          ) : null}
        </a>
      </nav>
    </section>
  );
}

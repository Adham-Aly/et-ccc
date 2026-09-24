import { LayoutList } from "lucide-react";
import type { CourseNav } from "@/components/layout/props";
import { ComingSoon } from "@/components/ui/Badge";
import { cn } from "@/components/ui/cn";
import { LiveReadCell } from "@/components/ui/LiveReadCell";
import { RichTitle } from "@/components/ui/RichTitle";
import { fmt, ui } from "@/components/ui/ui-strings";

/**
 * Course navigation (DESIGN.md → Sidebar): the current stage's modules, the current module
 * expanded to its lessons (a planned module shows "Soon" in a trailing column), the current lesson as a white sheet tab, other stages collapsed.
 */
export function CourseSidebar({ nav, idPrefix = "side" }: { nav: CourseNav; idPrefix?: string }) {
  const s = ui();
  const stage = nav.stages.find((st) => st.id === nav.currentStageId);
  const others = nav.stages.filter((st) => st.id !== nav.currentStageId);
  const headingId = `${idPrefix}-stage`;
  return (
    <nav aria-labelledby={headingId} className="px-4 py-5 text-ui">
      <a
        href="/learn"
        className="flex h-9 items-center gap-2 rounded-control px-2 font-medium text-ink-2 hover:bg-board-deep hover:text-ink pointer-coarse:h-11"
      >
        <LayoutList aria-hidden="true" size={16} strokeWidth={1.75} />
        {s.nav.courseMap}
      </a>
      {stage ? (
        <>
          <h2 id={headingId} className="mt-5 px-2">
            <span className="block text-ink-3 text-label tnum">
              {fmt(s.nav.stage, { n: stage.number })}
            </span>
            <span className="block font-bold text-ink text-ui">{stage.title}</span>
          </h2>
          <ul className="mt-2">
            {stage.modules.map((m) => {
              const current = m.id === nav.currentModuleId;
              return (
                <li key={m.id}>
                  {m.href ? (
                    <a
                      href={m.href}
                      aria-current={current && !nav.currentLessonId ? "page" : undefined}
                      className={cn(
                        "grid grid-cols-[3.25rem_minmax(0,1fr)] items-baseline rounded-control px-2 py-2 hover:bg-board-deep",
                        current ? "font-semibold text-ink" : "text-ink-2",
                        current &&
                          !nav.currentLessonId &&
                          "border border-rule bg-paper hover:bg-paper",
                      )}
                    >
                      <span className="text-ink-3 text-small tnum">{m.id}</span>
                      <span>
                        <RichTitle text={m.title} />
                      </span>
                    </a>
                  ) : (
                    <div className="grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-baseline gap-x-2 px-2 py-2 text-ink-3">
                      <span className="text-small tnum">{m.id}</span>
                      <span>
                        <RichTitle text={m.title} />
                      </span>
                      <ComingSoon label={s.status.soon} />
                    </div>
                  )}
                  {current && m.lessons.length > 0 ? (
                    <ul className="mt-0.5 mb-2 ml-[3.25rem]">
                      {m.lessons.map((l) => {
                        const on = l.id === nav.currentLessonId;
                        return (
                          <li key={l.id}>
                            <a
                              href={l.href}
                              aria-current={on ? "page" : undefined}
                              className={cn(
                                "flex items-start gap-2 rounded-control border px-2 py-1.5 text-small",
                                on
                                  ? "border-rule bg-paper font-semibold text-ink"
                                  : "border-transparent text-ink-2 hover:bg-board-deep hover:text-ink",
                              )}
                            >
                              <span className="flex h-[1.5em] items-center">
                                <LiveReadCell lessonId={l.id} readLabel={s.lesson.readState} />
                              </span>
                              <span>
                                <RichTitle text={l.title} />
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
      {others.length > 0 ? (
        <ul className="mt-6 border-rule border-t pt-4">
          {others.map((st) => (
            <li key={st.id}>
              <a
                href={st.href}
                className="grid grid-cols-[3.25rem_minmax(0,1fr)] items-baseline rounded-control px-2 py-1.5 text-ink-2 text-small hover:bg-board-deep hover:text-ink"
              >
                <span className="text-ink-3 tnum">{st.number}</span>
                <span>
                  <RichTitle text={st.title} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
  );
}

import type { CourseMapPageProps } from "@/components/layout/props";
import { ComingSoon, DraftBadge } from "@/components/ui/Badge";
import { RichTitle } from "@/components/ui/RichTitle";
import { fmt, ui } from "@/components/ui/ui-strings";
import { IndexRow } from "./IndexRow";
import { isDraft } from "./LessonPage";
import { LessonMarks } from "./ModulePage";
import { SiteFrame } from "./SiteFrame";
import { h1Class, h2Class } from "./type-styles";

/** Course map (DESIGN.md → Course map): one section per stage, one index row per module. */
export function CourseMapPage({ stages }: CourseMapPageProps) {
  const s = ui();
  return (
    <SiteFrame current="learn" wide>
      <header className="max-w-(--measure)">
        <h1 className={h1Class}>{s.courseMap.title}</h1>
        <p className="mt-3 text-body text-ink-2 leading-(--text-body--line-height)">
          {s.courseMap.intro}
        </p>
      </header>
      {stages.map((st) => (
        <section
          key={st.id}
          id={`stage-${st.id}`}
          aria-labelledby={`stage-${st.id}-h`}
          className="mt-14 scroll-mt-[calc(var(--header-h)+1.5rem)]"
        >
          <h2 id={`stage-${st.id}-h`} className={h2Class}>
            <span className="tnum">{fmt(s.nav.stage, { n: st.number })}</span>
            <span className="text-ink-3" aria-hidden="true">
              {" · "}
            </span>
            <span className="sr-only">: </span>
            <RichTitle text={st.title} />
          </h2>
          {st.goal ? (
            <p className="mt-1.5 max-w-(--measure) text-ink-2 text-small">{st.goal}</p>
          ) : null}
          <div className="mt-4 border-rule border-t">
            {st.modules.map((m) => {
              const readable = Boolean(m.href);
              return (
                <IndexRow
                  key={m.id}
                  id={m.id}
                  title={<RichTitle text={m.title} />}
                  description={m.description}
                  href={m.href}
                  muted={!readable}
                  after={
                    !readable ? (
                      <ComingSoon label={s.status.comingSoon} />
                    ) : isDraft(m.status) ? (
                      <DraftBadge label={s.status.draft} />
                    ) : undefined
                  }
                  meta={
                    readable
                      ? fmt(
                          m.lessons.length === 1 ? s.module.lessonCountOne : s.module.lessonCount,
                          {
                            n: m.lessons.length,
                          },
                        )
                      : undefined
                  }
                  marks={readable ? <LessonMarks module={m} /> : undefined}
                />
              );
            })}
          </div>
        </section>
      ))}
    </SiteFrame>
  );
}

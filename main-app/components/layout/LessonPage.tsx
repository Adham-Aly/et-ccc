import "katex/dist/katex.min.css";
import { Practice } from "@/components/content/Practice";
import type { LessonPageProps } from "@/components/layout/props";
import { DraftBadge } from "@/components/ui/Badge";
import { RichTitle } from "@/components/ui/RichTitle";
import { fmt, ui } from "@/components/ui/ui-strings";
import { Breadcrumb } from "./Breadcrumb";
import { ClosingTitleBlock } from "./ClosingTitleBlock";
import { OnThisPage } from "./OnThisPage";
import { SiteFrame } from "./SiteFrame";
import { TitleBlockStrip } from "./TitleBlock";
import { h1Class, minorClass } from "./type-styles";

export function isDraft(status: string): boolean {
  return status === "gated" || status === "reviewed";
}

/** The lesson reader (DESIGN.md → Layout → Reading page order). */
export function LessonPage({ lesson, module, stage, practice, nav, courseNav }: LessonPageProps) {
  const s = ui();
  return (
    <SiteFrame current="learn" courseNav={courseNav}>
      <div className="flex gap-12">
        <article className="min-w-0 flex-1">
          <Breadcrumb
            items={[
              { label: s.nav.courseMap, href: "/learn" },
              {
                label: `${fmt(s.nav.stage, { n: stage.number })}: ${stage.title}`,
                href: stage.href,
              },
              { label: module.title, href: module.href },
            ]}
          />
          <header className="mt-4 max-w-(--measure)">
            <h1 className={h1Class}>
              <RichTitle text={lesson.title} />
            </h1>
            <TitleBlockStrip
              cells={[
                { label: s.lesson.module, value: module.id },
                {
                  label: s.lesson.lesson,
                  value: fmt(s.lesson.lessonOf, { i: lesson.index, n: lesson.count }),
                },
                {
                  label: s.lesson.readingTime,
                  value: fmt(s.lesson.minutes, { n: lesson.readingMinutes }),
                },
              ]}
              extra={isDraft(module.status) ? <DraftBadge label={s.status.draft} /> : undefined}
            />
          </header>
          {lesson.objectives.length > 0 ? (
            <section aria-labelledby="objectives" className="mt-8 max-w-(--measure)">
              <h2 id="objectives" className={minorClass}>
                {s.lesson.objectives}
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-body leading-(--text-body--line-height) marker:text-ink-3">
                {lesson.objectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </section>
          ) : null}
          <div className="prose-sheet mt-10">{lesson.body}</div>
          {practice && practice.length > 0 ? (
            <div className="mt-12 max-w-(--measure)">
              <Practice items={practice} />
            </div>
          ) : null}
          <ClosingTitleBlock lessonId={lesson.id} nav={nav} />
        </article>
        <OnThisPage items={lesson.toc} />
      </div>
    </SiteFrame>
  );
}

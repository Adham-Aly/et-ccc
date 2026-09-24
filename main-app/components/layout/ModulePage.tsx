import { Practice } from "@/components/content/Practice";
import type { ModuleLink, ModulePageProps } from "@/components/layout/props";
import { ComingSoon, DraftBadge } from "@/components/ui/Badge";
import { LiveReadCell } from "@/components/ui/LiveReadCell";
import { RichTitle } from "@/components/ui/RichTitle";
import { fmt, ui } from "@/components/ui/ui-strings";
import { Breadcrumb } from "./Breadcrumb";
import { IndexRow } from "./IndexRow";
import { isDraft } from "./LessonPage";
import { SiteFrame } from "./SiteFrame";
import { TitleBlockStrip } from "./TitleBlock";
import { h1Class, h2Class } from "./type-styles";

export function LessonMarks({ module }: { module: ModuleLink }) {
  const s = ui();
  return (
    <>
      {module.lessons.map((l) => (
        <LiveReadCell key={l.id} lessonId={l.id} readLabel={`${l.title}: ${s.lesson.readState}`} />
      ))}
    </>
  );
}

/** Module overview (DESIGN.md → Module page). */
export function ModulePage({ module, stage, prerequisites, practice, courseNav }: ModulePageProps) {
  const s = ui();
  return (
    <SiteFrame current="learn" courseNav={courseNav}>
      <div className="max-w-(--measure-wide)">
        <Breadcrumb
          items={[
            { label: s.nav.courseMap, href: "/learn" },
            { label: `${fmt(s.nav.stage, { n: stage.number })}: ${stage.title}`, href: stage.href },
          ]}
        />
        <header className="mt-4 max-w-(--measure)">
          <h1 className={h1Class}>
            <RichTitle text={module.title} />
          </h1>
          <TitleBlockStrip
            cells={[
              { label: s.module.stage, value: stage.number },
              { label: s.lesson.module, value: module.id },
              { label: s.module.lessons, value: module.lessons.length },
            ]}
            extra={isDraft(module.status) ? <DraftBadge label={s.status.draft} /> : undefined}
          />
        </header>
        {module.description ? (
          <p className="mt-6 max-w-(--measure) text-body leading-(--text-body--line-height)">
            {module.description}
          </p>
        ) : null}
        {module.objectives.length > 0 ? (
          <section aria-labelledby="mod-objectives" className="mt-10 max-w-(--measure)">
            <h2 id="mod-objectives" className={h2Class}>
              {s.module.objectives}
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-body leading-(--text-body--line-height) marker:text-ink-3">
              {module.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </section>
        ) : null}
        {prerequisites.length > 0 ? (
          <section aria-labelledby="mod-before" className="mt-10">
            <h2 id="mod-before" className={h2Class}>
              {s.module.before}
            </h2>
            <div className="mt-3 border-rule border-t">
              {prerequisites.map((m) => (
                <IndexRow
                  key={m.id}
                  id={m.id}
                  title={<RichTitle text={m.title} />}
                  href={m.href}
                  muted={!m.href}
                  after={!m.href ? <ComingSoon label={s.status.comingSoon} /> : undefined}
                  marks={m.href ? <LessonMarks module={m} /> : undefined}
                />
              ))}
            </div>
          </section>
        ) : null}
        <section aria-labelledby="mod-lessons" className="mt-10">
          <h2 id="mod-lessons" className={h2Class}>
            {s.module.lessonsHeading}
          </h2>
          <ol className="mt-3 border-rule border-t">
            {module.lessons.map((l, i) => (
              <li key={l.id}>
                <IndexRow
                  id={i + 1}
                  title={<RichTitle text={l.title} />}
                  href={l.href}
                  marks={<LiveReadCell lessonId={l.id} readLabel={s.lesson.readState} />}
                />
              </li>
            ))}
          </ol>
        </section>
        {practice.length > 0 ? (
          <div className="mt-12 max-w-(--measure)">
            <Practice items={practice} />
          </div>
        ) : null}
      </div>
    </SiteFrame>
  );
}

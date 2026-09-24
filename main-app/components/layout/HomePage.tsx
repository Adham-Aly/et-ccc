import type { HomePageProps } from "@/components/layout/props";
import { ContinueBlock } from "@/components/ui/ContinueBlock";
import { RichTitle } from "@/components/ui/RichTitle";
import { fmt, ui } from "@/components/ui/ui-strings";
import { IndexRow } from "./IndexRow";
import { SiteFrame } from "./SiteFrame";
import { displayClass, h2Class } from "./type-styles";

/**
 * Home (DESIGN.md → Other surfaces → Home): title, lede, continue block, the sheet index of
 * stages, how the course works. The lede and "how it works" copy come from strings (P5).
 */
export function HomePage({ stages, lessonOrder }: HomePageProps) {
  const s = ui();
  const h = s.home;
  return (
    <SiteFrame current="home" wide>
      <header className="max-w-(--measure)">
        <h1 className={displayClass}>{s.siteName}</h1>
        <div className="mt-5 space-y-4 text-body leading-(--text-body--line-height)">
          {h.lede.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </header>
      {lessonOrder.length > 0 ? (
        <div className="mt-8 max-w-(--measure)">
          <ContinueBlock
            lessons={lessonOrder.map((l) => ({
              id: l.id,
              title: l.title,
              href: l.href,
              moduleId: l.moduleId,
            }))}
            labels={{ continueLabel: h.continueLabel, startLabel: h.startLabel }}
          />
        </div>
      ) : null}
      <section aria-labelledby="sheet-index" className="mt-14">
        <h2 id="sheet-index" className={h2Class}>
          {h.sheetIndex}
        </h2>
        <div className="mt-4 border-rule border-t">
          {stages.map((st) => (
            <IndexRow
              key={st.id}
              id={fmt(s.nav.stage, { n: st.number })}
              title={<RichTitle text={st.title} />}
              description={st.goal}
              href={st.href}
              meta={fmt(h.modules, { n: st.modules.length })}
            />
          ))}
        </div>
      </section>
      {h.how.length > 0 ? (
        <section aria-labelledby="how" className="mt-14">
          <h2 id="how" className={h2Class}>
            {h.howHeading}
          </h2>
          <dl className="mt-4 border-rule border-t">
            {h.how.map((item) => (
              <div
                key={item.term}
                className="grid gap-x-8 gap-y-1 border-rule border-b py-4 sm:grid-cols-[14rem_1fr]"
              >
                <dt className="font-bold text-ink text-ui">{item.term}</dt>
                <dd className="text-ink-2 text-ui">{item.text}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </SiteFrame>
  );
}

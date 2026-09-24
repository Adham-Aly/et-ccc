import type { GlossaryPageProps } from "@/components/layout/props";
import { cn } from "@/components/ui/cn";
import { ui } from "@/components/ui/ui-strings";
import { SiteFrame } from "./SiteFrame";
import { h1Class, h2Class } from "./type-styles";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function letterOf(term: string): string {
  const c = term.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : "#";
}

/** Glossary (DESIGN.md → Glossary): letter strip, then terms by letter. */
export function GlossaryPage({ terms }: GlossaryPageProps) {
  const s = ui();
  const g = s.glossary;
  const sorted = [...terms].sort((a, b) => a.term.localeCompare(b.term, "en"));
  const groups = new Map<string, typeof sorted>();
  for (const t of sorted) {
    const k = letterOf(t.term);
    groups.set(k, [...(groups.get(k) ?? []), t]);
  }
  const keys = [...groups.keys()];
  return (
    <SiteFrame current="glossary">
      <header className="max-w-(--measure)">
        <h1 className={h1Class}>{g.title}</h1>
        <p className="mt-3 text-body text-ink-2 leading-(--text-body--line-height)">{g.intro}</p>
      </header>
      <nav aria-label={g.letters} className="mt-8">
        <ul className="grid w-fit grid-cols-[repeat(7,2.75rem)] border-rule border-t border-l sm:grid-cols-[repeat(13,2.5rem)]">
          {LETTERS.map((L) => {
            const has = groups.has(L);
            return (
              <li key={L} className="border-rule border-r border-b">
                {has ? (
                  <a
                    href={`#letter-${L}`}
                    className="flex h-10 items-center justify-center pointer-coarse:h-11 font-semibold text-blueline text-label hover:bg-board"
                  >
                    {L}
                  </a>
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-10 items-center justify-center pointer-coarse:h-11 text-ink-3 text-label"
                  >
                    {L}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      {keys.map((L) => (
        <section
          key={L}
          id={`letter-${L}`}
          aria-labelledby={`letter-${L}-h`}
          className="mt-10 scroll-mt-[calc(var(--header-h)+1.5rem)]"
        >
          <h2 id={`letter-${L}-h`} className={h2Class}>
            {L}
          </h2>
          <dl className="mt-3 border-rule border-t">
            {(groups.get(L) ?? []).map((t) => (
              <div
                key={t.id}
                id={t.id}
                className={cn(
                  "grid gap-x-8 gap-y-1 border-rule border-b px-2 py-4 sm:grid-cols-[12rem_1fr]",
                  "scroll-mt-[calc(var(--header-h)+1.5rem)] target:animate-[target-flash_2s_var(--ease-draft)_both] motion-reduce:target:animate-none motion-reduce:target:bg-check-soft",
                )}
              >
                <dt className="font-bold text-ink text-ui">{t.term}</dt>
                <dd className="text-ink text-ui">
                  <div>{t.definition}</div>
                  {t.introducedIn ? (
                    <p className="mt-1.5 text-ink-3 text-small">
                      {g.introducedIn}{" "}
                      {t.introducedIn.href ? (
                        <a
                          href={t.introducedIn.href}
                          className="text-blueline underline decoration-1 underline-offset-[0.2em] hover:text-blueline-deep"
                        >
                          <span className="tnum">{t.introducedIn.moduleId}</span>{" "}
                          {t.introducedIn.title}
                        </a>
                      ) : (
                        <span>
                          <span className="tnum">{t.introducedIn.moduleId}</span>{" "}
                          {t.introducedIn.title}
                        </span>
                      )}
                    </p>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </SiteFrame>
  );
}

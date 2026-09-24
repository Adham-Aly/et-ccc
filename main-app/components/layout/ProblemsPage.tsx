import { ArrowUpRight } from "lucide-react";
import { judgeName } from "@/components/content/problem-label";
import type { ProblemsPageProps } from "@/components/layout/props";
import { JudgeBadge } from "@/components/ui/Badge";
import { cn } from "@/components/ui/cn";
import { fmt, ui } from "@/components/ui/ui-strings";
import { SiteFrame } from "./SiteFrame";
import { h1Class, h2Class } from "./type-styles";

/** Every registry problem by year (DESIGN.md → Problems page). No filters, no status. */
export function ProblemsPage({ years }: ProblemsPageProps) {
  const s = ui();
  const p = s.problems;
  return (
    <SiteFrame current="problems" wide>
      <header className="max-w-(--measure)">
        <h1 className={h1Class}>{p.title}</h1>
        <p className="mt-3 text-body text-ink-2 leading-(--text-body--line-height)">{p.intro}</p>
      </header>
      {years.map(({ year, problems }) => (
        <section key={year} aria-labelledby={`y${year}`} className="mt-12 max-w-(--measure-table)">
          <h2 id={`y${year}`} className={`${h2Class} tnum`}>
            {year}
          </h2>
          <table className="mt-3 w-full border-collapse text-ui">
            <thead className="max-sm:sr-only">
              <tr className="border-rule border-y bg-paper-sunk text-left">
                <th scope="col" className="w-24 px-3 py-2 font-semibold text-ink-3 text-label">
                  {p.problem}
                </th>
                <th scope="col" className="px-3 py-2 font-semibold text-ink-3 text-label">
                  {p.titleCol}
                </th>
                <th scope="col" className="w-[38%] px-3 py-2 font-semibold text-ink-3 text-label">
                  {p.taughtIn}
                </th>
              </tr>
            </thead>
            <tbody>
              {problems.map((pr) => (
                <tr
                  key={`${pr.id}-${pr.level}${pr.number}`}
                  className="border-rule border-b align-top max-sm:grid max-sm:grid-cols-[3.5rem_1fr] max-sm:py-2"
                >
                  <th
                    scope="row"
                    className="px-3 py-3 text-left font-semibold text-ink tnum max-sm:px-2 max-sm:py-1"
                  >
                    {pr.level}
                    {pr.number}
                  </th>
                  <td className="px-3 py-3 max-sm:px-2 max-sm:py-1">
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blueline underline decoration-1 underline-offset-[0.2em] hover:text-blueline-deep hover:decoration-2"
                    >
                      {pr.title}
                      <span className="sr-only">
                        {" "}
                        {fmt(s.practice.opensOn, { judge: judgeName(pr.judge) })}
                      </span>
                    </a>{" "}
                    <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
                      <JudgeBadge judge={pr.judge} />
                      <ArrowUpRight
                        aria-hidden="true"
                        size={14}
                        strokeWidth={2}
                        className="text-ink-3"
                      />
                    </span>
                    {pr.sameAs ? (
                      <span className="block text-ink-2 text-small">
                        {fmt(s.practice.sameAs, {
                          label: `${pr.sameAs.year} ${pr.sameAs.level}${pr.sameAs.number}`,
                        })}
                      </span>
                    ) : null}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-3 text-small max-sm:col-start-2 max-sm:px-2 max-sm:py-1",
                      !pr.taughtIn?.length && "max-sm:hidden",
                    )}
                  >
                    {pr.taughtIn && pr.taughtIn.length > 0 ? (
                      <span className="flex flex-wrap gap-x-3 gap-y-1">
                        <span className="text-ink-3 sm:sr-only">{p.taughtIn}:</span>
                        {pr.taughtIn.map((m) =>
                          m.href ? (
                            <a
                              key={m.id}
                              href={m.href}
                              title={m.title}
                              className="text-blueline tnum underline decoration-1 underline-offset-[0.2em] hover:text-blueline-deep"
                            >
                              {m.id}
                            </a>
                          ) : (
                            <span key={m.id} title={m.title} className="text-ink-3 tnum">
                              {m.id}
                            </span>
                          ),
                        )}
                      </span>
                    ) : (
                      <span className="text-ink-3">
                        <span aria-hidden="true">–</span>
                        <span className="sr-only">{p.notYet}</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </SiteFrame>
  );
}

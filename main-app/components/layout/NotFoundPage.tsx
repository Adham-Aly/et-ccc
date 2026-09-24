import { buttonClass } from "@/components/ui/button-styles";
import { ui } from "@/components/ui/ui-strings";
import { SiteFrame } from "./SiteFrame";
import { h1Class } from "./type-styles";

/** The missing sheet: a pencilled outline with dimension lines and a one-cell title block. */
function MissingSheet({ label, cell }: { label: string; cell: string }) {
  const pencil = {
    stroke: "var(--color-rule-strong)",
    strokeWidth: 1.5,
    strokeDasharray: "4 3",
    fill: "none",
  };
  const dim = { stroke: "var(--color-ink-3)", strokeWidth: 1, fill: "none" };
  return (
    <svg
      role="img"
      aria-labelledby="missing-title"
      viewBox="0 0 240 180"
      className="h-auto w-full max-w-[15rem]"
    >
      <title id="missing-title">{label}</title>
      <rect x="40" y="16" width="160" height="124" {...pencil} />
      <rect x="140" y="112" width="60" height="28" {...pencil} />
      <text
        x="170"
        y="130"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="var(--color-ink-3)"
        fontFamily="var(--font-sans)"
      >
        {cell}
      </text>
      {/* horizontal dimension */}
      <path d="M40 146v18M200 146v18" {...dim} />
      <path d="M44 158h152" {...dim} />
      <path d="M44 158l6-3v6zM196 158l-6-3v6z" fill="var(--color-ink-3)" stroke="none" />
      <text
        x="120"
        y="154"
        textAnchor="middle"
        fontSize="11"
        fill="var(--color-ink-3)"
        fontFamily="var(--font-mono)"
      >
        ?
      </text>
      {/* vertical dimension */}
      <path d="M34 16h-18M34 140h-18" {...dim} />
      <path d="M24 20v116" {...dim} />
      <path d="M24 20l-3 6h6zM24 136l-3-6h6z" fill="var(--color-ink-3)" stroke="none" />
    </svg>
  );
}

export function NotFoundPage() {
  const s = ui();
  const n = s.notFound;
  return (
    <SiteFrame current="none">
      <div className="flex max-w-(--measure) flex-col gap-8 sm:flex-row-reverse sm:items-center sm:justify-end">
        <MissingSheet label={n.drawingLabel} cell={n.cell} />
        <div className="flex-1">
          <h1 className={h1Class}>{n.title}</h1>
          <p className="mt-3 text-body text-ink-2 leading-(--text-body--line-height)">{n.body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/learn" className={buttonClass("secondary")}>
              {n.courseMap}
            </a>
            <a href="/search" className={buttonClass("secondary")}>
              {n.search}
            </a>
            <a href="/" className={buttonClass("secondary")}>
              {n.home}
            </a>
          </div>
        </div>
      </div>
    </SiteFrame>
  );
}

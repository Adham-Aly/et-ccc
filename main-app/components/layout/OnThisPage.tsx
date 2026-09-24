import type { TocItem } from "@/components/layout/props";
import { ui } from "@/components/ui/ui-strings";

/** Static "On this page" (DESIGN.md: ≥1280 px, 3+ H2s, no scroll-spy). */
export function OnThisPage({ items }: { items: TocItem[] }) {
  if (items.length < 3) return null;
  const s = ui().lesson;
  return (
    <nav
      aria-labelledby="toc-heading"
      className="sticky top-[calc(var(--header-h)+1.5rem)] hidden w-(--toc-w) shrink-0 self-start xl:block"
    >
      <h2 id="toc-heading" className="font-bold text-ink text-minor">
        {s.onThisPage}
      </h2>
      <ol className="mt-3 border-rule border-l">
        {items.map((t) => (
          <li key={t.id}>
            <a
              href={`#${t.id}`}
              className="-ml-px block border-transparent border-l py-1.5 pl-3 text-ink-2 text-small hover:border-ink hover:text-ink"
            >
              {t.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

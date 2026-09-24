import { RichTitle } from "@/components/ui/RichTitle";
import { ui } from "@/components/ui/ui-strings";

export function Breadcrumb({ items }: { items: { label: string; href: string | null }[] }) {
  return (
    <nav aria-label={ui().lesson.breadcrumb} className="text-ink-3 text-small">
      <ol className="flex flex-wrap items-center gap-x-1.5">
        {items.map((it, i) => (
          <li key={it.label + (it.href || "")} className="flex items-center gap-x-1.5">
            {i > 0 ? <span aria-hidden="true">/</span> : null}
            {it.href ? (
              <a
                href={it.href}
                className="inline-flex min-h-6 items-center text-ink-2 hover:text-blueline hover:underline hover:underline-offset-[0.2em]"
              >
                <RichTitle text={it.label} />
              </a>
            ) : (
              <span>
                <RichTitle text={it.label} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

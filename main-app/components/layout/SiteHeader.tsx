import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { MobileNav } from "@/components/ui/MobileNav";
import { SearchDialog } from "@/components/ui/SearchDialog";
import { ui } from "@/components/ui/ui-strings";

export type Section =
  | "home"
  | "learn"
  | "problems"
  | "glossary"
  | "start"
  | "about"
  | "search"
  | "none";

export function primaryNav() {
  const s = ui().nav;
  return [
    { key: "learn", href: "/learn", label: s.learn },
    { key: "problems", href: "/problems", label: s.problems },
    { key: "glossary", href: "/glossary", label: s.glossary },
    { key: "start", href: "/start", label: s.start },
    { key: "about", href: "/about", label: s.about },
  ] as const;
}

/** Header (DESIGN.md → Header and navigation). Server-rendered; the current section is a prop. */
export function SiteHeader({ current, mobileNav }: { current: Section; mobileNav?: ReactNode }) {
  const s = ui();
  return (
    <header className="sticky top-0 z-30 border-rule border-b bg-paper">
      <div className="flex h-(--header-h) items-center gap-2 px-4 sm:px-5 lg:gap-6 lg:px-6">
        <MobileNav labels={{ menu: s.nav.menu, closeMenu: s.nav.closeMenu }} title={s.siteName}>
          <nav
            aria-label={s.nav.label}
            className={cn("shrink-0 bg-paper px-3 py-3", mobileNav && "border-rule border-b")}
          >
            <ul>
              {primaryNav().map((item) => (
                <li key={item.key}>
                  <a
                    href={item.href}
                    aria-current={current === item.key ? "page" : undefined}
                    className={cn(
                      "relative flex h-11 items-center rounded-control px-2 text-ui hover:bg-board",
                      current === item.key
                        ? "font-semibold text-ink before:absolute before:inset-y-2.5 before:left-0 before:w-0.5 before:bg-ink"
                        : "text-ink-2",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {mobileNav ? <div className="flex-1 bg-board">{mobileNav}</div> : null}
        </MobileNav>
        <a
          href="/"
          className="mr-auto shrink-0 rounded-cell font-bold text-[1.0625rem] text-ink lg:mr-0 lg:w-[calc(var(--sidebar-w)-3rem)]"
        >
          {s.siteName}
        </a>
        <nav aria-label={s.nav.label} className="mr-auto hidden h-full lg:block">
          <ul className="flex h-full">
            {primaryNav().map((item) => {
              const on = current === item.key;
              return (
                <li key={item.key} className="h-full">
                  <a
                    href={item.href}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "relative flex h-full items-center px-3 text-ui hover:text-ink hover:underline hover:decoration-1 hover:underline-offset-[0.35em] focus-inset",
                      on
                        ? "font-semibold text-ink after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-ink"
                        : "font-medium text-ink-2",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <SearchDialog labels={s.search} />
      </div>
    </header>
  );
}

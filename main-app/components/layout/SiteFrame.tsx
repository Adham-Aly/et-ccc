import type { ReactNode } from "react";
import type { CourseNav } from "@/components/layout/props";
import { cn } from "@/components/ui/cn";
import { CourseSidebar } from "./CourseSidebar";
import { type Section, SiteHeader } from "./SiteHeader";

/**
 * The board and the sheet (DESIGN.md → Layout → Page frame). With `courseNav` the board carries
 * the course sidebar (1024 px and up) and the mobile drawer carries the same navigation.
 */
export function SiteFrame({
  current,
  courseNav,
  wide = false,
  children,
}: {
  current: Section;
  courseNav?: CourseNav;
  /** Sheet without a sidebar may grow to 64rem (home, map, tables). */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader
        current={current}
        mobileNav={courseNav ? <CourseSidebar nav={courseNav} idPrefix="drawer" /> : undefined}
      />
      <div className="flex">
        {courseNav ? (
          <aside className="sticky top-(--header-h) hidden h-[calc(100dvh-var(--header-h))] w-(--sidebar-w) shrink-0 overflow-y-auto overscroll-contain lg:block">
            <CourseSidebar nav={courseNav} />
          </aside>
        ) : null}
        <main
          id="content"
          tabIndex={-1}
          className={cn(
            "min-w-0 flex-1 bg-paper outline-none",
            "sm:m-4 sm:border sm:border-rule lg:m-6",
            courseNav
              ? "lg:ml-0 lg:max-w-(--sheet-max)"
              : wide
                ? "lg:mx-auto lg:max-w-[64rem]"
                : "lg:mx-auto lg:max-w-[56rem]",
          )}
        >
          <div className="px-5 pt-6 pb-10 sm:px-8 sm:pt-8 sm:pb-12 lg:px-14 lg:pt-12 lg:pb-16">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

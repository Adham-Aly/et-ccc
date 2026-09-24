"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Menu, X } from "lucide-react";
import type { ReactNode } from "react";
import { buttonClass } from "./button-styles";
import { cn } from "./cn";

/**
 * Mobile navigation (plan §4.8): a drawer from the left below 1024 px. The navigation inside is
 * server-rendered and passed as children; this component only opens and closes it.
 */
export function MobileNav({
  labels,
  title,
  children,
}: {
  labels: { menu: string; closeMenu: string };
  title: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        aria-label={labels.menu}
        className={cn(buttonClass("ghost", "icon"), "-ml-2 lg:hidden")}
      >
        <Menu aria-hidden="true" size={20} strokeWidth={1.75} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-(--backdrop) transition-opacity duration-(--dur-overlay) ease-draft data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-3rem))] flex-col bg-paper shadow-overlay outline-none",
            "transition-transform duration-(--dur-overlay) ease-draft data-ending-style:-translate-x-full data-starting-style:-translate-x-full",
            "motion-reduce:transition-opacity motion-reduce:data-ending-style:translate-x-0 motion-reduce:data-ending-style:opacity-0 motion-reduce:data-starting-style:translate-x-0 motion-reduce:data-starting-style:opacity-0",
          )}
        >
          <div className="flex h-(--header-h) shrink-0 items-center justify-between border-rule border-b bg-paper pr-2 pl-5">
            <Dialog.Title className="font-bold text-[1.0625rem] text-ink">{title}</Dialog.Title>
            <Dialog.Close aria-label={labels.closeMenu} className={buttonClass("ghost", "icon")}>
              <X aria-hidden="true" size={20} strokeWidth={1.75} />
            </Dialog.Close>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
            {children}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

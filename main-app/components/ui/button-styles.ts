import { cn } from "./cn";

// Button look (DESIGN.md → Components → Buttons). A plain function so server components, client
// components and links (`<a className={buttonClass(...)}>`) share one definition.
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "sm" | "icon" | "icon-sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-semibold whitespace-nowrap select-none " +
  "transition-colors duration-(--dur-feedback) ease-draft " +
  "disabled:cursor-not-allowed aria-disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-paper hover:bg-ink-2 active:bg-ink active:ring-1 active:ring-inset active:ring-rule-strong " +
    "disabled:bg-done disabled:text-ink-3 aria-disabled:bg-done aria-disabled:text-ink-3",
  secondary:
    "bg-paper text-ink border border-rule-strong hover:bg-board active:bg-board-deep " +
    "disabled:text-ink-3 disabled:hover:bg-paper",
  ghost:
    "bg-transparent text-ink-2 hover:bg-board hover:text-ink active:bg-board-deep " +
    "disabled:opacity-50 disabled:hover:bg-transparent aria-disabled:opacity-50 aria-disabled:hover:bg-transparent",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-10 px-4 text-ui pointer-coarse:h-11",
  sm: "h-8 px-3 text-small pointer-coarse:h-11",
  icon: "size-10 p-0 pointer-coarse:size-11",
  "icon-sm": "size-8 p-0 pointer-coarse:size-11",
};

export function buttonClass(
  variant: ButtonVariant = "secondary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className);
}

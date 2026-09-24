import { cn } from "./cn";

export interface ReadCellProps {
  read: boolean;
  /** Plays the ink-in wipe (only right after the learner marks the lesson read). */
  inkIn?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/**
 * The read cell (DESIGN.md → Read cell): a hollow pencilled square when unread, an inked square
 * with a check when read. Decorative: callers state the read state in text.
 */
export function ReadCell({ read, inkIn = false, size = "sm", className }: ReadCellProps) {
  const px = size === "sm" ? 14 : 16;
  return (
    <span
      aria-hidden="true"
      data-read={read ? "" : undefined}
      className={cn(
        "relative inline-block shrink-0 rounded-cell border-[1.5px] border-rule-strong bg-paper",
        read && "border-ink",
        className,
      )}
      style={{ width: px, height: px }}
    >
      {read ? (
        <span
          className={cn(
            "absolute -inset-[1.5px] flex items-center justify-center rounded-cell bg-ink text-paper",
            inkIn && "animate-[ink-in_var(--dur-state)_var(--ease-draft)_both]",
          )}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            width={px - 4}
            height={px - 4}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              inkIn &&
                "animate-[fade-in_var(--dur-feedback)_var(--ease-draft)_both] [animation-delay:var(--dur-state)]",
            )}
          >
            <path d="M2.5 6.3 5 8.6l4.5-5" />
          </svg>
        </span>
      ) : null}
    </span>
  );
}

import type { ReactNode } from "react";

/**
 * Titles from course.yaml may name Python code in backticks ("Values, types, variables and
 * `print`"). Render those spans as inline code instead of showing the backticks.
 */
export function RichTitle({ text }: { text: string }): ReactNode {
  if (!text.includes("`")) return text;
  const parts = text.split(/(`[^`]+`)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("`") && p.endsWith("`") ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: static split of one string
          <code key={i} className="font-mono text-[0.92em] font-normal">
            {p.slice(1, -1)}
          </code>
        ) : (
          p
        ),
      )}
    </>
  );
}

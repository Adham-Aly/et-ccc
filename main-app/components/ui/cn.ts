import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge must know the design tokens: without this, a custom size such as `text-label`
// is read as a colour and silently drops the real colour class (`text-ink-3 text-label`).
const twMerge = extendTailwindMerge({
  override: {
    theme: {
      text: [
        "display",
        "title",
        "headline",
        "subhead",
        "minor",
        "body",
        "ui",
        "small",
        "label",
        "micro",
        "code",
      ],
      radius: ["cell", "control", "box"],
      shadow: ["overlay"],
      ease: ["draft"],
    },
  },
});

/** Merge class names; later Tailwind utilities win over earlier conflicting ones. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

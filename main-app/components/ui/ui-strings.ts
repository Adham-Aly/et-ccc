// UI copy access for the design lead's server components (W2).
//
// All learner-facing UI copy lives in content/ui/strings.yaml (plan §4.6.2), validated by W1's
// lib/content/strings.ts. Server components call `ui()`; client components never import this
// file and receive their copy as props from a server parent.
import { getUiStrings } from "@/lib/content/strings";

export type { UiStrings } from "@/lib/content/strings";
export { fmt } from "@/lib/content/strings";

/** Current UI copy from content/ui/strings.yaml. */
export function ui() {
  return getUiStrings();
}

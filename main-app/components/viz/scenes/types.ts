import type { PanelSpec } from "../../../lib/viz/schema";

/** What a scene builds from its props: the same shape a `.frames.json` has. */
export interface SceneBuild {
  layout: "single" | "row";
  panels: PanelSpec[];
  presets: {
    id: string;
    label: string;
    steps: { caption: string; panels: Record<string, unknown> }[];
  }[];
  alt: string;
}

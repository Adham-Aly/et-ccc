// lib/content/slug.ts — filesystem naming helpers for content/ and tests/fixtures/content/
// (plan §4.6.2 layout: stages/<sN-name>/<ModuleId-slug>/).

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** `s0`, "Orientation and tooling" -> `s0-orientation-and-tooling` */
export function stageDirName(stageId: string, title: string): string {
  return `${stageId}-${slugify(title)}`;
}

/** `M1.1`, "Values, types..." -> `M1.1-values-types-and-print` */
export function moduleDirPrefix(moduleId: string): string {
  return moduleId;
}

export function moduleDirName(moduleId: string, title: string): string {
  return `${moduleId}-${slugify(title)}`;
}

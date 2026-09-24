// Captions may mark code with backticks: `total_of`, `values = [3, 1, 4, 1, 5]`. That is the
// whole markup: no nesting, no escapes, no other syntax. An unpaired backtick stays literal.

export type CaptionPart = { code: boolean; text: string };

export function captionParts(caption: string): CaptionPart[] {
  const parts: CaptionPart[] = [];
  const re = /`([^`\n]+)`/g;
  let last = 0;
  for (const m of caption.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) parts.push({ code: false, text: caption.slice(last, i) });
    parts.push({ code: true, text: m[1] ?? "" });
    last = i + m[0].length;
  }
  if (last < caption.length) parts.push({ code: false, text: caption.slice(last) });
  return parts;
}

/** The caption as plain text (for checks, labels and search): backtick pairs removed. */
export function plainCaption(caption: string): string {
  return captionParts(caption)
    .map((p) => p.text)
    .join("");
}

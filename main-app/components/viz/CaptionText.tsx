import { captionParts } from "@/lib/viz/caption";

/** A step caption with its `code` spans in Mono. React escapes the text; nothing else is parsed. */
export function CaptionText({ text }: { text: string }) {
  return (
    <>
      {captionParts(text).map((p, i) =>
        p.code ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: parts of one fixed string
          <code key={i} className="vz-cap-code">
            {p.text}
          </code>
        ) : (
          p.text
        ),
      )}
    </>
  );
}

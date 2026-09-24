import type { ReactNode } from "react";
import { Details } from "@/components/content/Details";
import type { FigureInfo } from "./figure-context";

export interface StepsText {
  label: string;
  captions: string[];
}

/**
 * <figure> around one visual: the visual (frame), then a figcaption holding "Figure N" + the
 * caption and the text alternative in a native <details> (plan §4.11.4). No JS.
 */
export function FigureShell({
  kind,
  figure,
  alt,
  steps,
  children,
}: {
  kind: string;
  figure: FigureInfo | undefined;
  alt: string;
  steps?: StepsText[] | undefined;
  children: ReactNode;
}) {
  const many = (steps?.length ?? 0) > 1;
  return (
    <figure className="vz-figure" data-exhibit="" data-viz={kind}>
      {children}
      <figcaption>
        {figure ? (
          <p className="vz-figcaption">
            {figure.number !== undefined ? <b>Figure {figure.number}</b> : null}
            {figure.caption}
          </p>
        ) : null}
        <div className="vz-text-alt">
          <Details summary={steps ? "Read the steps as text" : "Read the figure as text"}>
            <p>{alt}</p>
            {steps?.map((s) => (
              <div key={s.label}>
                {many ? <p className="vz-alt-preset">{s.label}</p> : null}
                <ol>
                  {s.captions.map((c, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: captions are an ordered, static list
                    <li key={i}>{c}</li>
                  ))}
                </ol>
              </div>
            ))}
          </Details>
        </div>
      </figcaption>
    </figure>
  );
}

export function figureLabel(figure: FigureInfo | undefined, fallback: string): string {
  if (!figure) return fallback;
  return figure.number !== undefined
    ? `Figure ${figure.number}: ${figure.caption}`
    : figure.caption;
}

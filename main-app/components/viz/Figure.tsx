import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import type { FigureInfo } from "./figure-context";

export interface FigureProps {
  /** The figure caption (teaching voice). */
  caption: string;
  /** Text alternative summary; defaults to the visual's own `alt` from its `.viz.yaml` / `.trace.yaml`. */
  alt?: string;
  /** Figure number within the lesson; injected by remarkFigureNumbers (lib/viz). */
  number?: number | string;
  children: ReactNode;
}

/**
 * Figure: number, caption and text alternative around exactly one library visual. The visual
 * renders the frame itself (so the player, the caption and the "Read the steps as text" list
 * sit in the DESIGN.md order); Figure passes its facts down as the `figure` prop.
 */
export function Figure({ caption, alt, number, children }: FigureProps) {
  const visuals = Children.toArray(children).filter(isValidElement);
  if (visuals.length !== 1) {
    throw new Error(`<Figure caption="${caption}"> must contain exactly one visual component`);
  }
  const figure: FigureInfo = {
    caption,
    alt,
    number: number === undefined ? undefined : Number(number),
  };
  return cloneElement(visuals[0] as ReactElement<{ figure?: FigureInfo }>, { figure });
}

import type { ReactElement } from "react";
import { CodeTrace, type CodeTraceProps } from "./CodeTrace";
import { Diagram, type DiagramProps } from "./Diagram";
import { Figure } from "./Figure";
import { Scene, type SceneProps } from "./Scene";
import { StepThrough, type StepThroughProps } from "./StepThrough";

export interface VizComponents {
  Figure: typeof Figure;
  Diagram: (props: Omit<DiagramProps, "baseDir">) => ReactElement | Promise<ReactElement>;
  StepThrough: (props: Omit<StepThroughProps, "baseDir">) => ReactElement | Promise<ReactElement>;
  CodeTrace: (props: Omit<CodeTraceProps, "baseDir">) => ReactElement | Promise<ReactElement>;
  Scene: (props: SceneProps) => ReactElement | Promise<ReactElement>;
}

/**
 * The five MDX visual components bound to one module directory: file props (`frames`, `trace`)
 * are resolved against `baseDir` (the absolute path of the lesson's module folder).
 */
export function createVizComponents(baseDir: string): VizComponents {
  return {
    Figure,
    Diagram: (props) => <Diagram {...props} baseDir={baseDir} />,
    StepThrough: (props) => <StepThrough {...props} baseDir={baseDir} />,
    CodeTrace: (props) => <CodeTrace {...props} baseDir={baseDir} />,
    Scene: (props) => <Scene {...props} />,
  };
}

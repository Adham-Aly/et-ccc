// Public API of the visualization library (plan §4.11, brief §4 component contracts).
// W1 wires these into the MDX component map (lib/content/mdx-components.tsx):
//   const viz = createVizComponents(moduleDir);   // binds file props to the lesson's module dir
//   components = { ..., ...viz };                  // Figure, Diagram, StepThrough, CodeTrace, Scene
// and adds `remarkFigureNumbers` (lib/viz/remark-figure-numbers.ts) to the MDX remark plugins.
export { CodeTrace, type CodeTraceProps } from "./CodeTrace";
export { Diagram, type DiagramProps } from "./Diagram";
export { Figure, type FigureProps } from "./Figure";
export { createVizComponents, type VizComponents } from "./mdx";
export { Scene, type SceneProps } from "./Scene";
export { StepThrough, type StepThroughProps } from "./StepThrough";

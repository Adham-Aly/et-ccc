// Public API of the design lead's MDX content components (W1's lib/content/mdx-components.tsx
// maps MDX names onto these; props in work/04-app/requests.md "Batch 2").
export { ComingSoon, DraftBadge, JudgeBadge } from "@/components/ui/Badge";
export { Callout, type CalloutKind, type CalloutProps } from "./Callout";
export { CodeBlock, type CodeBlockProps, ErrorPanel, IoPanel, OutputPanel } from "./CodeBlock";
export { Details } from "./Details";
export { JudgeLink, type JudgeLinkProps } from "./JudgeLink";
export { Practice } from "./Practice";
export { ProblemLink } from "./ProblemLink";
export { Term, type TermProps } from "./Term";

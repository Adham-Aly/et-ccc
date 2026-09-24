// lib/content/mdx.ts — compiles one lesson's MDX to a React element (plan §4.6.1, A7). Runs
// `@mdx-js/mdx` `evaluate()` in RSC with the fixed component map; unknown components fail the
// build (see lib/content/mdx-components.tsx).
import fs from "node:fs";
import path from "node:path";
import { evaluate } from "@mdx-js/mdx";
import type { ReactElement } from "react";
import * as runtime from "react/jsx-runtime";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { parse as parseYaml } from "yaml";
import { remarkFigureNumbers } from "../viz/remark-figure-numbers";
import { createMdxComponents } from "./mdx-components";
import { remarkFencedCode } from "./remark-fenced-code";
import { type LessonFrontmatter, lessonFrontmatterSchema } from "./schemas";
import type { PracticeItemView } from "./types";

export interface CompiledLesson {
  frontmatter: LessonFrontmatter;
  body: ReactElement;
  raw: string;
}

function splitFrontmatter(source: string): { frontmatter: LessonFrontmatter; body: string } {
  const m = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m?.[1]) {
    throw new Error("lesson MDX is missing YAML frontmatter (--- ... ---)");
  }
  const data = parseYaml(m[1]);
  const frontmatter = lessonFrontmatterSchema.parse(data);
  return { frontmatter, body: source.slice(m[0].length) };
}

/** Compiles `moduleDir/lessons/<slug>.mdx` to a rendered React element. */
export async function compileLesson(
  moduleDir: string,
  slug: string,
  practiceItems: PracticeItemView[] = [],
): Promise<CompiledLesson> {
  const file = path.join(moduleDir, "lessons", `${slug}.mdx`);
  const raw = fs.readFileSync(file, "utf8");
  const { frontmatter, body: mdxBody } = splitFrontmatter(raw);

  const { default: Content } = await evaluate(mdxBody, {
    ...runtime,
    remarkPlugins: [remarkGfm, remarkMath, remarkFencedCode, remarkFigureNumbers],
    rehypePlugins: [rehypeSlug, rehypeKatex],
  });

  const components = createMdxComponents({ moduleDir, practiceItems });
  const body = Content({ components }) as ReactElement;

  return { frontmatter, body, raw };
}

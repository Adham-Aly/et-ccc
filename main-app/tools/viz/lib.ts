// Shared by gen-viz.ts, check-viz.ts and viz-shots.ts: find the visual sources under the
// content roots, run the PyPy 3.8 recorders, and format the generated files deterministically.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import {
  type FramesFile,
  framesFileSchema,
  type TraceFile,
  type TraceYaml,
  traceFileSchema,
  traceYamlSchema,
  type VizYaml,
  vizYamlSchema,
} from "../../lib/viz/schema";

export const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const PYPY = path.resolve(APP_ROOT, "..", ".tooling", "bin", "pypy38");
export const TOOLS_DIR = path.join(APP_ROOT, "tools", "viz");
export const DEFAULT_ROOTS = [
  path.join(APP_ROOT, "content"),
  path.join(APP_ROOT, "tests", "fixtures", "content"),
  path.join(APP_ROOT, "app", "dev", "viz"),
];
export const DEFAULT_BYTES = 150_000;
export const DEFAULT_STEPS = 200;

export interface VisualSource {
  kind: "frames" | "trace";
  /** The authored config: `<name>.viz.yaml` or `<name>.trace.yaml`. */
  config: string;
  /** The generated file: `<name>.frames.json` or `<name>.trace.json`. */
  output: string;
  /** `<name>.viz.py` (frames) or the shown example (trace). */
  program: string;
  id: string;
}

function walk(dir: string, out: string[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      walk(full, out);
    } else {
      out.push(full);
    }
  }
}

export function listFiles(roots: string[]): string[] {
  const out: string[] = [];
  for (const r of roots) walk(r, out);
  return out;
}

/** Does a file path belong to the scope (module id, module folder, stage folder or visual id)? */
export function inScope(file: string, scope: string | undefined): boolean {
  if (!scope) return true;
  const segments = file.split(path.sep);
  const stem = path
    .basename(file)
    .replace(/\.(viz\.yaml|trace\.yaml|frames\.json|trace\.json|viz\.py|py|mdx)$/, "");
  if (stem === scope) return true;
  return segments.some((s) => s === scope || s.startsWith(`${scope}-`));
}

export function findVisuals(roots: string[], scope?: string): VisualSource[] {
  const files = listFiles(roots);
  const out: VisualSource[] = [];
  for (const f of files) {
    if (!inScope(f, scope)) continue;
    if (f.endsWith(".viz.yaml")) {
      const id = path.basename(f, ".viz.yaml");
      out.push({
        kind: "frames",
        config: f,
        output: path.join(path.dirname(f), `${id}.frames.json`),
        program: path.join(path.dirname(f), `${id}.viz.py`),
        id,
      });
    } else if (f.endsWith(".trace.yaml")) {
      const id = path.basename(f, ".trace.yaml");
      out.push({
        kind: "trace",
        config: f,
        output: path.join(path.dirname(f), `${id}.trace.json`),
        program: "",
        id,
      });
    }
  }
  return out;
}

export class VizError extends Error {
  readonly rule: string;
  constructor(rule: string, message: string) {
    super(message);
    this.rule = rule;
  }
}

export function readYaml<T>(
  file: string,
  schema: {
    safeParse(v: unknown): {
      success: boolean;
      data?: T;
      error?: { issues: { path: PropertyKey[]; message: string }[] };
    };
  },
): T {
  let raw: unknown;
  try {
    raw = parseYaml(fs.readFileSync(file, "utf8"));
  } catch (err) {
    throw new VizError("schema", `${rel(file)}: cannot read YAML: ${(err as Error).message}`);
  }
  const res = schema.safeParse(raw);
  if (!res.success) {
    const issues = res.error?.issues ?? [];
    throw new VizError(
      "schema",
      `${rel(file)}: ${issues.map((i) => `${i.path.map(String).join(".") || "(root)"}: ${i.message}`).join("; ")}`,
    );
  }
  return res.data as T;
}

export function rel(file: string): string {
  return path.relative(APP_ROOT, file);
}

interface PresetInput {
  id: string;
  label: string;
  stdin?: string | undefined;
  stdinFile?: string | undefined;
}

export function presetStdin(configFile: string, p: PresetInput): string {
  if (p.stdinFile !== undefined) {
    const file = path.resolve(path.dirname(configFile), p.stdinFile);
    if (!fs.existsSync(file))
      throw new VizError("schema", `${rel(configFile)}: stdinFile ${p.stdinFile} not found`);
    return fs.readFileSync(file, "utf8");
  }
  return p.stdin ?? "";
}

export function runPypy(
  args: string[],
  input: string,
  cwd: string,
): { stdout: string; stderr: string; status: number } {
  const res = spawnSync(PYPY, args, {
    cwd,
    input,
    encoding: "utf8",
    env: { ...process.env, PYTHONPATH: TOOLS_DIR, PYTHONIOENCODING: "utf-8", PYTHONHASHSEED: "0" },
    maxBuffer: 64 * 1024 * 1024,
    timeout: 120_000,
  });
  if (res.error)
    throw new VizError("python", `cannot run PyPy 3.8 (${PYPY}): ${res.error.message}`);
  return { stdout: res.stdout, stderr: res.stderr, status: res.status ?? 1 };
}

// ---------------------------------------------------------------------------------------------
// Deterministic formatting: header fields first, one step per line (readable diffs, small files)
// ---------------------------------------------------------------------------------------------

export function formatVisualFile(file: FramesFile | TraceFile): string {
  const { presets, ...header } = file;
  const head = Object.entries(header)
    .map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`)
    .join(",\n");
  const body = presets
    .map((p) => {
      const { steps, ...meta } = p;
      const metaText = Object.entries(meta)
        .map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`)
        .join(",");
      return `{${metaText},"steps":[\n${steps.map((s) => JSON.stringify(s)).join(",\n")}\n]}`;
    })
    .join(",\n");
  return `{${head},\n"presets":[\n${body}\n]}\n`;
}

// ---------------------------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------------------------

export interface Generated {
  text: string;
  /** Per preset id: the text vizrec recorded with rec.output() (frames only). */
  outputs: Record<string, string | undefined>;
  /** Per preset id: the stdin used. */
  stdins: Record<string, string>;
  config: VizYaml | TraceYaml;
}

export function generateFrames(src: VisualSource): Generated {
  const config = readYaml<VizYaml>(src.config, vizYamlSchema);
  if (!fs.existsSync(src.program)) {
    throw new VizError("orphan", `${rel(src.config)}: ${path.basename(src.program)} is missing`);
  }
  const outputs: Record<string, string | undefined> = {};
  const stdins: Record<string, string> = {};
  const presets = config.presets.map((p) => {
    const stdin = presetStdin(src.config, p);
    stdins[p.id] = stdin;
    const res = runPypy([path.basename(src.program)], stdin, path.dirname(src.program));
    if (res.status !== 0) {
      throw new VizError(
        "python",
        `${rel(src.program)} (preset ${p.id}) failed:\n${res.stderr.trim()}`,
      );
    }
    let rec: { steps: unknown[]; output?: string };
    try {
      rec = JSON.parse(res.stdout);
    } catch {
      throw new VizError(
        "python",
        `${rel(src.program)} (preset ${p.id}): output is not a vizrec recording (a .viz.py must not print)`,
      );
    }
    outputs[p.id] = rec.output;
    return { id: p.id, label: p.label, steps: rec.steps };
  });
  const file = {
    schema: 1,
    kind: "frames",
    id: src.id,
    layout: config.layout,
    panels: config.panels,
    alt: config.alt,
    presets,
  };
  const parsed = framesFileSchema.safeParse(file);
  if (!parsed.success) {
    const first = parsed.error.issues.slice(0, 6).map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new VizError(
      "schema",
      `${rel(src.program)} recorded invalid frames: ${first.join("; ")}`,
    );
  }
  return { text: formatVisualFile(parsed.data), outputs, stdins, config };
}

export function generateTrace(src: VisualSource): Generated {
  const config = readYaml<TraceYaml>(src.config, traceYamlSchema);
  const example = path.resolve(path.dirname(src.config), config.example);
  if (!fs.existsSync(example)) {
    throw new VizError("orphan", `${rel(src.config)}: example ${config.example} is missing`);
  }
  const defaultIn = example.replace(/\.py$/, ".in");
  const presetInputs = config.presets ?? [
    fs.existsSync(defaultIn)
      ? { id: "default", label: "Sample input", stdinFile: path.basename(defaultIn) }
      : { id: "default", label: "Run", stdin: "" },
  ];
  const stdins: Record<string, string> = {};
  const presets = presetInputs.map((p) => {
    const stdin = presetStdin(src.config, p);
    stdins[p.id] = stdin;
    return { id: p.id, label: p.label, stdin };
  });
  const job = {
    example,
    presets,
    maxSteps: Math.min(config.maxSteps ?? DEFAULT_STEPS, config.budget?.steps ?? DEFAULT_STEPS),
    skip: config.skip ?? [],
    notes: config.notes ?? {},
  };
  const res = runPypy(
    [path.join(TOOLS_DIR, "trace.py")],
    JSON.stringify(job),
    path.dirname(example),
  );
  if (res.status !== 0) {
    throw new VizError("steps", `${rel(src.config)}: ${res.stderr.trim()}`);
  }
  const rec = JSON.parse(res.stdout) as { code: string; presets: TraceFile["presets"] };
  const file = {
    schema: 1,
    kind: "trace",
    id: src.id,
    source: path.basename(example),
    code: rec.code,
    alt: config.alt,
    presets: rec.presets,
  };
  const parsed = traceFileSchema.safeParse(file);
  if (!parsed.success) {
    const first = parsed.error.issues.slice(0, 6).map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new VizError("schema", `${rel(src.config)}: trace is invalid: ${first.join("; ")}`);
  }
  return { text: formatVisualFile(parsed.data), outputs: {}, stdins, config };
}

export function generate(src: VisualSource): Generated {
  return src.kind === "frames" ? generateFrames(src) : generateTrace(src);
}

export interface Args {
  scope?: string;
  /** `--root=<dir>` (repeatable, relative to main-app/): replaces DEFAULT_ROOTS (gate fixtures). */
  roots: string[];
  flags: Set<string>;
  rest: string[];
}

export function parseArgs(argv: string[]): Args {
  const flags = new Set<string>();
  const rest: string[] = [];
  const extraRoots: string[] = [];
  let scope: string | undefined;
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i] as string;
    if (a === "--scope") {
      scope = argv[i + 1];
      i += 1;
    } else if (a.startsWith("--scope=")) {
      scope = a.slice("--scope=".length);
    } else if (a.startsWith("--root=")) {
      extraRoots.push(path.resolve(APP_ROOT, a.slice("--root=".length)));
    } else if (a.startsWith("--")) {
      flags.add(a.slice(2));
    } else {
      rest.push(a);
    }
  }
  const roots = extraRoots.length > 0 ? extraRoots : DEFAULT_ROOTS;
  return scope === undefined ? { roots, flags, rest } : { scope, roots, flags, rest };
}

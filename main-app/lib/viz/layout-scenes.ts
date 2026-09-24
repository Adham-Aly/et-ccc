// Layouts for the scene panels (components/viz/scenes): stdin flow and how judging works.
import { PAD, textAdvance, textWidth, type VizItem, type VizScene } from "./geometry";
import type { JudgeSceneFrame, StdinSceneFrame } from "./schema";

const ROW = 30;

export function layoutStdinScene(frames: StdinSceneFrame[]): VizScene[] {
  let inW = 88;
  let codeW = 150;
  let rowsIn = 0;
  let rowsCode = 0;
  let rowsVars = 0;
  let nameW = 20;
  let valW = 40;
  for (const f of frames) {
    for (const l of f.lines)
      inW = Math.max(inW, textWidth(l, "value") + textWidth("\\n", "label", true) + 30);
    for (const c of f.code) codeW = Math.max(codeW, textWidth(c, "value") + 24);
    rowsIn = Math.max(rowsIn, f.lines.length);
    rowsCode = Math.max(rowsCode, f.code.length);
    rowsVars = Math.max(rowsVars, f.vars.length);
    for (const [n, v] of f.vars) {
      nameW = Math.max(nameW, textWidth(n, "value"));
      valW = Math.max(valW, textWidth(v, "value") + 14);
    }
  }
  const x = PAD;
  const right = Math.max(inW, codeW);
  const yInTitle = PAD + 8;
  const yIn = PAD + 20;
  const inH = rowsIn * ROW + 8;
  const yCodeTitle = yIn + inH + 18;
  const yCode = yCodeTitle + 12;
  const codeH = rowsCode * ROW + 8;
  const yVarsTitle = yCode + codeH + 18;
  const yVars = yVarsTitle + 14;
  const width = x + Math.max(right + 34, nameW + 34 + valW) + PAD;
  const height = yVars + rowsVars * (ROW + 6) + PAD;
  return frames.map((f) => {
    const items: VizItem[] = [
      {
        key: "tin",
        t: "text",
        x,
        y: yInTitle,
        text: "Input (stdin)",
        role: "title",
        weight: 600,
        anchor: "start",
      },
      {
        key: "tcode",
        t: "text",
        x,
        y: yCodeTitle,
        text: "Program",
        role: "title",
        weight: 600,
        anchor: "start",
      },
      { key: "sin", t: "slot", x, y: yIn, w: inW, h: inH, open: "none" },
      { key: "scode", t: "slot", x, y: yCode, w: codeW, h: codeH, open: "none" },
    ];
    f.lines.forEach((line, i) => {
      const state = i < f.used ? "done" : i === f.used && f.at >= 0 ? "frontier" : "unvisited";
      const y = yIn + 4 + i * ROW;
      items.push({
        key: `in${i}`,
        t: "cell",
        x: x + 4,
        y,
        w: inW - 8,
        h: ROW - 4,
        state,
        text: line,
        align: "start",
      });
      items.push({
        key: `nl${i}`,
        t: "text",
        x: x + inW - 12,
        y: y + (ROW - 4) / 2,
        text: "\\n",
        role: "label",
        anchor: "end",
        mono: true,
        muted: true,
        halo: false,
      });
    });
    if (f.at >= 0) {
      items.push({
        key: "hl",
        t: "cell",
        x: x + 4,
        y: yCode + 4 + f.at * ROW,
        w: codeW - 8,
        h: ROW - 4,
        state: "current",
        noCaret: true,
      });
    }
    f.code.forEach((c, i) => {
      items.push({
        key: `code${i}`,
        t: "text",
        x: x + 14,
        y: yCode + 4 + i * ROW + (ROW - 4) / 2,
        text: c,
        role: "value",
        anchor: "start",
        mono: true,
        halo: false,
      });
    });
    if (f.at >= 0 && f.used < f.lines.length && (f.code[f.at] ?? "").includes("input()")) {
      // input() takes the next waiting line: an arrow from that line to the running code line.
      const y1 = yIn + 4 + f.used * ROW + (ROW - 4) / 2;
      const y2 = yCode + 4 + f.at * ROW + (ROW - 4) / 2;
      const xr = x + right + 26;
      items.push({
        key: "flow",
        t: "arrow",
        d: `M ${x + inW + 3} ${y1} C ${xr} ${y1}, ${xr} ${y2}, ${x + codeW + 4} ${y2}`,
        state: "frontier",
      });
    }
    items.push({
      key: "tvars",
      t: "text",
      x,
      y: yVarsTitle,
      text: "Variables",
      role: "title",
      weight: 600,
      anchor: "start",
    });
    f.vars.forEach(([name, value], i) => {
      const y = yVars + i * (ROW + 6);
      items.push({
        key: `vn${name}`,
        t: "text",
        x: x + nameW,
        y: y + ROW / 2,
        text: name,
        role: "value",
        anchor: "end",
        mono: true,
      });
      items.push({
        key: `va${name}`,
        t: "arrow",
        d: `M ${x + nameW + 6} ${y + ROW / 2} L ${x + nameW + 28} ${y + ROW / 2}`,
        state: "none",
      });
      items.push({
        key: `vv${name}`,
        t: "cell",
        x: x + nameW + 34,
        y,
        // Sized to its own value, like every value cell (value width + 14, at least 40).
        w: Math.max(40, textWidth(value, "value") + 14),
        h: ROW,
        // The program line about to run holds the one current edge; the value it just got is
        // "just changed", as in a code trace.
        state: name === f.fresh ? "changed" : "none",
        text: value,
        noCaret: true,
      });
    });
    return { width, height, items };
  });
}

const VERDICT_WORD: Record<string, string> = {
  AC: "Accepted",
  WA: "Wrong answer",
  TLE: "Time limit exceeded",
  RTE: "Runtime error",
  MLE: "Memory limit exceeded",
};

export function verdictWord(v: string): string {
  return VERDICT_WORD[v] ?? v;
}

export function layoutJudgeScene(frames: JudgeSceneFrame[]): VizScene[] {
  const n = Math.max(...frames.map((f) => f.tests.length));
  const tw = 48;
  const tgap = 8;
  const PIPE = ["Test input", "Your program", "Its output"];
  // Each box fits its step name with at least 6 units clear on each side (G-VIZ collision).
  const boxWs = PIPE.map((t) => Math.max(84, Math.ceil(textAdvance(t, "label")) + 20));
  const boxW = (i: number) => boxWs[i] as number;
  const boxH = 36;
  const arrowGap = 20;
  const width =
    PAD * 2 + Math.max(n * (tw + tgap) - tgap, boxW(0) + boxW(1) + boxW(2) + 2 * arrowGap);
  const yTestsTitle = PAD + 8;
  const yTests = PAD + 22;
  const yVerdicts = yTests + 36 + 12;
  const yPipe = yVerdicts + 30;
  const yCheck = yPipe + boxH + 30;
  const yVerdict = yCheck + boxH + 24;
  const height = yVerdict + boxH + PAD;
  const bx = (i: number) => PAD + boxWs.slice(0, i).reduce((a, b) => a + b, 0) + i * arrowGap;
  return frames.map((f) => {
    const items: VizItem[] = [
      {
        key: "tt",
        t: "text",
        x: PAD,
        y: yTestsTitle,
        text: "Test cases",
        role: "title",
        weight: 600,
        anchor: "start",
      },
    ];
    f.tests.forEach((t, i) => {
      const x = PAD + i * (tw + tgap);
      items.push({
        key: `t${i}`,
        t: "cell",
        x,
        y: yTests,
        w: tw,
        h: 36,
        state:
          t.s === "c" ? "current" : t.s === "q" ? "frontier" : t.s === "d" ? "done" : "unvisited",
        text: t.name,
      });
      if (t.verdict) {
        items.push({
          key: `tv${i}`,
          t: "text",
          x: x + tw / 2,
          y: yVerdicts,
          text: t.verdict,
          role: "label",
          anchor: "middle",
          weight: 700,
        });
      }
    });
    const active = f.phase;
    const box = (i: number, key: string, label: string, on: boolean): VizItem => ({
      key,
      t: "cell",
      x: bx(i),
      y: yPipe,
      w: boxW(i),
      h: boxH,
      state: on ? "current" : "none",
      text: label,
      textRole: "label",
    });
    items.push(box(0, "bin", PIPE[0] as string, active === "input"));
    items.push(box(1, "bprog", PIPE[1] as string, active === "run"));
    items.push(box(2, "bout", PIPE[2] as string, active === "compare"));
    for (let i = 0; i < 2; i += 1) {
      items.push({
        key: `pa${i}`,
        t: "arrow",
        d: `M ${bx(i) + boxW(i) + 3} ${yPipe + boxH / 2} L ${bx(i + 1) - 4} ${yPipe + boxH / 2}`,
        state: "none",
      });
    }
    const checkW = boxW(0) + boxW(1) + arrowGap;
    items.push({
      key: "bcheck",
      t: "cell",
      x: bx(0),
      y: yCheck,
      w: checkW,
      h: boxH,
      state: active === "compare" ? "compare" : "none",
      text: "Compare with expected",
      textRole: "label",
    });
    const xo = bx(2) + boxW(2) / 2;
    const xc = bx(1) + boxW(1) / 2;
    const ymid = yPipe + boxH + 15;
    items.push({
      key: "pdown",
      t: "arrow",
      d: `M ${xo} ${yPipe + boxH + 3} L ${xo} ${ymid} L ${xc} ${ymid} L ${xc} ${yCheck - 4}`,
      state: "none",
    });
    // The verdict in words on its own full-width row (DESIGN.md → Scenes); the short code is only
    // the secondary label under each test case.
    items.push({
      key: "pverdict",
      t: "arrow",
      d: `M ${bx(0) + checkW / 2} ${yCheck + boxH + 3} L ${bx(0) + checkW / 2} ${yVerdict - 4}`,
      state: "none",
    });
    const t = f.tests[f.active];
    const verdict = active === "done" && t?.verdict ? t.verdict : null;
    items.push({
      key: "bverdict",
      t: "cell",
      x: bx(0),
      y: yVerdict,
      w: bx(2) + boxW(2) - bx(0),
      h: boxH,
      // Accepted is the answer path; a rejection stays plain ink, because the invalid strike
      // would cross the words.
      state: verdict === null ? "unvisited" : verdict === "AC" ? "path" : "none",
      text: verdict === null ? "Verdict" : `Verdict: ${verdictWord(verdict)} (${verdict})`,
      textRole: "label",
    });
    return { width, height, items };
  });
}

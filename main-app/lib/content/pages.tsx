// lib/content/pages.tsx — /start and /about prose (plan §4.10). Not part of the stage/module/
// lesson content pipeline (there is no course id for these), so it is small hand-authored JSX
// here rather than MDX. P4 placeholder copy, rule-checked by hand (brief §1.6): no local
// system/environment setup content (C21), no score targets or CCO/medal wording (R14), no
// walkthroughs or per-problem hints (C20). P5 may replace this with the final voice.
import type { ProsePageProps } from "./types";

export function getStartPageContent(): ProsePageProps {
  const body = (
    <>
      <h2>What the CCC is</h2>
      <p>
        The Canadian Computing Competition (CCC) is a programming contest run by the University of
        Waterloo. This course teaches the ideas and techniques you need, in Python, from your first
        line of code onward.
      </p>
      <h2>How practice works</h2>
      <p>
        Each module ends with a short list of real CCC problems. You solve them outside this app, on
        WMOJ or DMOJ — online judges that run your program against the official test data and tell
        you whether it passed. Every practice link in this course opens the problem directly on its
        judge.
      </p>
      <h2>What this course assumes</h2>
      <p>
        This course assumes you already have a way to write and run Python programs. It teaches
        Python itself and the techniques used to solve contest problems — it does not cover
        installing software or setting up a computer.
      </p>
    </>
  );

  return {
    title: "Start here",
    lede: "How this course works, and how practice on WMOJ and DMOJ works.",
    body,
  };
}

export function getAboutPageContent(): ProsePageProps {
  const body = (
    <>
      <h2>About this course</h2>
      <p>
        This course is free, non-commercial, and has no accounts, ads or tracking beyond what stays
        on your own device.
      </p>
      <h2>Credits</h2>
      <p>
        CCC problems and contest materials are produced by the Centre for Education in Mathematics
        and Computing (CEMC) at the University of Waterloo, and are used here under CC BY-NC 4.0.
        This course is not affiliated with or endorsed by CEMC.
      </p>
      <h2>Judges</h2>
      <p>
        Practice problems link to WMOJ and DMOJ, two independent online judges that host CCC
        problems for practice. This course is not affiliated with either judge.
      </p>
    </>
  );

  return {
    title: "About",
    lede: "Credits, attribution, and how this course is put together.",
    body,
  };
}

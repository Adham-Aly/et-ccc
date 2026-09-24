// tools/style/readability.mjs — Flesch-Kincaid grade level and long-sentence detection for
// G-STYLE (plan §6.3: "Readability for Stages 0-2: Flesch-Kincaid grade <= 9 by default (tuned
// in P5); warn on sentences over 30 words"). A standard vowel-group syllable-count heuristic —
// not a dictionary lookup, so it is approximate, same as every FK-grade implementation without
// one; good enough to catch genuinely dense prose, which is all this gate needs to do.

function countSyllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;
  const stripped = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  const groups = stripped.match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
}

function splitSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z"'(])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitWords(text) {
  return (text.match(/[A-Za-z']+/g) ?? []).filter(Boolean);
}

/** @returns {{ grade: number, words: number, sentences: number, longSentences: {text:string, words:number}[] }} */
export function analyzeReadability(text, warnSentenceWordCount = 30) {
  const sentences = splitSentences(text);
  const words = splitWords(text);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const grade =
    sentences.length === 0 || words.length === 0
      ? 0
      : 0.39 * (words.length / sentences.length) + 11.8 * (syllables / words.length) - 15.59;

  const longSentences = sentences
    .map((s) => ({ text: s, words: splitWords(s).length }))
    .filter((s) => s.words > warnSentenceWordCount);

  return {
    grade: Math.round(grade * 10) / 10,
    words: words.length,
    sentences: sentences.length,
    longSentences,
  };
}

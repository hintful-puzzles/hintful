/**
 * `node scripts/word-list.ts`: build `src/engine/word-list/data.ts`, the
 * word games' answers and accepted guesses, from pinned releases of SCOWL,
 * 12dicts and LDNOOBW. The output is committed; run this only to change the
 * lists, and commit what it writes with it.
 *
 * Each source is fetched from the URL below and refused unless its SHA-256
 * matches, so a rerun builds the same lists or stops.
 *
 * SCOWLv2 ships its data and a Python build that combines it into a SQLite
 * database. This reads the data instead, by the text format its README
 * documents: `data/scowl-pre.txt` and the files its build merges in
 * (`MERGED`). Its adjustment files (spelling variants, compounds, fixes, the
 * size-raising `exclude`) are not applied: they reclassify a few hundred
 * entries, and both lists here are cut far from where they act (the answers
 * also pass 12dicts, the guesses accept every spelling). Reading the data
 * keeps the build in TypeScript, with nothing run from a download.
 *
 * - Guesses: every lowercase, letters-only word of SCOWL size 80 or less, in
 *   any spelling, at variant level 6 ("acceptable") or below. Size 80 is the
 *   largest list SCOWL licenses without the UKACD notice (its `Copyright`).
 * - Answers: words of SCOWL size 40 or less that are also 12dicts' 2of12
 *   headwords (American), less the offensive filter, and less any word
 *   SCOWL lists as another's inflection or under an informal usage note:
 *   2of12 keeps plurals with senses of their own ("books"), and an answer
 *   that is a plural or a past tense reads as a trick.
 * - The offensive filter, answers only (the owner, 2026-11-18): SCOWL's own
 *   `offensive-*` and `vulgar-*` usage notes, LDNOOBW's English list, and
 *   `word-list-exclude.txt` beside this script, for what both miss.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SCOWL = {
  url: "https://github.com/en-wl/wordlist/archive/refs/tags/rel-2026.02.25.tar.gz",
  sha256: "74e7cc3e9e03e609c1c74bb7e8862fcd988cdd64768dcbee4611581b7e633852",
  root: "wordlist-rel-2026.02.25",
};
const TWELVE_DICTS = {
  url: "https://downloads.sourceforge.net/wordlist/12dicts-6.0.2.zip",
  sha256: "64ac1d35acb66b550c7ebc56e080b62e0bad8f5984d72059dc2e05ac48780e52",
  file: "American/2of12.txt",
};
const LDNOOBW = {
  url: "https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/5faf2ba42d7b1c0977169ec3611df25a3c08eb13/en",
  sha256: "af851ecef1d5f212caba17339b12ac39cc2fef7d78c74876f67237644fcee8bd",
};

/** SCOWL's own build merges these into `scowl-pre.txt` (its `combine.py`). */
const MERGED = ["extra", "signature", "coca", "coca_llm"];

const MIN_LENGTH = 3;
const MAX_LENGTH = 8;
const GUESS_SIZE = 80;
const ANSWER_SIZE = 40;
/** SCOWL's variant levels, in order from 0. */
const VARIANT_LEVELS = " .=?v~V-@x";
/** A guess may be up to `V`, "acceptable"; an answer up to `.`, "include". */
const GUESS_VARIANT_LEVEL = 6;
const ANSWER_VARIANT_LEVEL = 1;

const root = new URL("..", import.meta.url).pathname;
const work = mkdtempSync(join(tmpdir(), "word-list-"));

async function fetchPinned(source: { url: string; sha256: string }): Promise<string> {
  const response = await fetch(source.url);
  if (!response.ok) throw new Error(`${source.url}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex");
  if (hash !== source.sha256) {
    throw new Error(`${source.url}: SHA-256 ${hash}, pinned ${source.sha256}`);
  }
  const path = join(work, createHash("sha256").update(source.url).digest("hex"));
  writeFileSync(path, bytes);
  return path;
}

function lines(text: string): string[] {
  return text.split(/\r?\n/);
}

interface ScowlWord {
  size: number;
  variantLevel: number;
  /** Under an offensive or vulgar usage note on some line. */
  offensive: boolean;
  /** Under an informal, colloquial or nonstandard usage note on some line. */
  informal: boolean;
  /** Listed as another word's inflection on some line. */
  inflection: boolean;
}

/** The lowest variant level among a `VARIANT-INFO` field's spellings. */
function variantLevel(info: string): number {
  let level = VARIANT_LEVELS.length;
  for (const spelling of info
    .replace(/\{\d+\}/, "")
    .trim()
    .split(" ")) {
    const mark = spelling.slice(1);
    level = Math.min(level, mark === "" ? 0 : VARIANT_LEVELS.indexOf(mark));
  }
  return level;
}

const VARIANT_INFO =
  /^\+$|^([ABZCD_][.=?v~V\-@x]?)( [ABZCD_][.=?v~V\-@x]?)*( \{\d+\})?$/;
const DERIVED_INFO = /^([ABZCD_]?[.=?v~V\-@x]?)( [ABZCD_]?[.=?v~V\-@x]?)*$/;

/** A word with SCOWL's annotations taken off, or null for a missing form. */
function bareWord(word: string): string | null {
  const bare = word
    .trim()
    .replace(/^[-@!]/, "")
    .replace(/[*\-@~!†]+$/, "");
  return bare === "" ? null : bare;
}

/**
 * Every word a SCOWL data file lists, by the format in its README § "File
 * Format": a line is `SIZES: [VARIANT-INFO: ]LEMMA [<POS>] [(USAGE)]
 * [: DERIVED, ...]`, and its size is the first, lowest, of its sizes.
 */
function readScowl(text: string, into: Map<string, ScowlWord>): void {
  for (const raw of lines(text)) {
    const line = raw.replace(/\s*#.*$/, "");
    if (!/^\d/.test(line)) continue;
    const fields = line.split(": ");
    const size = Number.parseInt(fields[0], 10);
    let at = 1;
    let level = 0;
    if (fields.length > 2 && VARIANT_INFO.test(fields[1])) {
      level = fields[1] === "+" ? 0 : variantLevel(fields[1]);
      at = 2;
    }
    const lemmaInfo = fields[at];
    const offensive = /\((offensive|vulgar)-\d\)/.test(lemmaInfo);
    const informal = /\((informal|colloquial|nonstandard)\)/.test(lemmaInfo);
    const lemma = lemmaInfo.replace(/\s*[<({].*$/, "");
    const words: [string, number, boolean][] = [[lemma, level, false]];
    for (const entry of fields
      .slice(at + 1)
      .join(": ")
      .split(/,\s*(?![^()]*\))/)) {
      const inner = entry.trim().replace(/^\(|\)$/g, "");
      for (const form of inner.split("|")) {
        const colon = form.indexOf(": ");
        const info = colon >= 0 ? form.slice(0, colon).trim() : "";
        const word = colon >= 0 ? form.slice(colon + 2) : form;
        const formLevel =
          info !== "" && DERIVED_INFO.test(info)
            ? Math.max(level, variantLevel(info.replace(/^([.=?v~V\-@x])/, "_$1")))
            : level;
        words.push([word, formLevel, true]);
      }
    }
    for (const [word, wordLevel, inflection] of words) {
      const bare = bareWord(word);
      if (bare === null || !/^[a-z]+$/.test(bare)) continue;
      const known = into.get(bare);
      into.set(bare, {
        size: Math.min(size, known?.size ?? size),
        variantLevel: Math.min(wordLevel, known?.variantLevel ?? wordLevel),
        offensive: offensive || (known?.offensive ?? false),
        informal: informal || (known?.informal ?? false),
        inflection: inflection || (known?.inflection ?? false),
      });
    }
  }
}

function fitsLength(word: string): boolean {
  return word.length >= MIN_LENGTH && word.length <= MAX_LENGTH;
}

/** Sorted words of each length, concatenated: one string a length. */
function byLength(words: Iterable<string>): Map<number, string> {
  const sorted = [...words].filter(fitsLength).sort();
  const out = new Map<number, string>();
  for (let length = MIN_LENGTH; length <= MAX_LENGTH; length++) {
    out.set(length, sorted.filter((w) => w.length === length).join(""));
  }
  return out;
}

function literal(lists: Map<number, string>): string {
  const rows = [...lists].map(
    ([length, words]) => `  ${length}: ${JSON.stringify(words)},`,
  );
  return `{\n${rows.join("\n")}\n}`;
}

async function main(): Promise<void> {
  const scowlArchive = await fetchPinned(SCOWL);
  const dictsArchive = await fetchPinned(TWELVE_DICTS);
  const ldnoobwPath = await fetchPinned(LDNOOBW);

  const scowlFiles = ["scowl-pre.txt", ...MERGED].map((f) => `${SCOWL.root}/data/${f}`);
  execFileSync("tar", ["xzf", scowlArchive, "-C", work, ...scowlFiles]);
  const scowl = new Map<string, ScowlWord>();
  for (const file of scowlFiles)
    readScowl(readFileSync(join(work, file), "utf8"), scowl);

  const twoOfTwelve = new Set(
    lines(
      execFileSync("unzip", ["-p", dictsArchive, TWELVE_DICTS.file], {
        encoding: "utf8",
      }),
    )
      .map((w) => w.trim())
      .filter((w) => /^[a-z]+$/.test(w)),
  );
  const ldnoobw = new Set(
    lines(readFileSync(ldnoobwPath, "utf8")).map((w) => w.trim()),
  );
  const ours = new Set(
    lines(readFileSync(join(root, "scripts/word-list-exclude.txt"), "utf8"))
      .map((w) => w.replace(/#.*$/, "").trim())
      .filter((w) => w !== ""),
  );

  const guesses = new Set<string>();
  const answers = new Set<string>();
  for (const [word, entry] of scowl) {
    if (entry.size <= GUESS_SIZE && entry.variantLevel <= GUESS_VARIANT_LEVEL) {
      guesses.add(word);
    }
    if (
      entry.size <= ANSWER_SIZE &&
      entry.variantLevel <= ANSWER_VARIANT_LEVEL &&
      twoOfTwelve.has(word) &&
      !entry.offensive &&
      !entry.informal &&
      !entry.inflection &&
      !ldnoobw.has(word) &&
      !ours.has(word)
    ) {
      answers.add(word);
    }
  }
  for (const word of answers) guesses.add(word);

  const answerLists = byLength(answers);
  const guessLists = byLength(guesses);
  const out = `// Generated by \`node scripts/word-list.ts\`, which says what the lists are and
// where they come from. Do not edit; rerun the script.
//
// Each length's words are sorted and concatenated, all of that length, so a
// word is found by binary search with nothing parsed at load.

export const ANSWERS: Readonly<Record<number, string>> = ${literal(answerLists)};

export const GUESSES: Readonly<Record<number, string>> = ${literal(guessLists)};
`;
  writeFileSync(join(root, "src/engine/word-list/data.ts"), out);
  for (let length = MIN_LENGTH; length <= MAX_LENGTH; length++) {
    const a = (answerLists.get(length) ?? "").length / length;
    const g = (guessLists.get(length) ?? "").length / length;
    console.log(`${length} letters: ${a} answers, ${g} guesses`);
  }
}

try {
  await main();
} finally {
  rmSync(work, { recursive: true, force: true });
}

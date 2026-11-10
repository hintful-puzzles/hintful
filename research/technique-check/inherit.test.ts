/**
 * The inheritance report (`inherit.ts`): `CANDIDATE=<game>` reports which
 * techniques of the sources a candidate inherits, by default every library
 * its family places and every other game of its family, or those `FROM`
 * names, comma-separated. Writes `results-inherit-<game>.txt`. The two
 * guards beside it run whenever the file does.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { globSync } from "tinyglobby";
import { expect, it } from "vitest";
import {
  type DescriptionFile,
  type DescriptionJson,
  isFormal,
  isLibrary,
  loadDescription,
  parseTechnique,
} from "../../src/describe/description.ts";
import { loadDescriptionFile } from "../../src/describe/load.ts";
import {
  checkInherited,
  familySources,
  type Inherited,
  inCandidateWords,
  readsOf,
  ruleParts,
  type Source,
  sourceOf,
} from "./inherit.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

const files: DescriptionFile[] = globSync("src/**/*.description.yaml", { cwd: ROOT })
  .sort()
  .map((s) => loadDescriptionFile(readFileSync(`${ROOT}${s}`, "utf8"), s));
const libraries = files.filter(isLibrary);
const game = (name: string): DescriptionJson => {
  const f = files.find((x) => isFormal(x) && x.game === name);
  if (f === undefined || !isFormal(f)) throw new Error(`no description of ${name}`);
  return f;
};
const latin = (): Source => {
  const lib = libraries.find((l) => l.library === "latin");
  if (lib === undefined) throw new Error("no Latin library");
  const s = sourceOf(lib);
  if (s === null) throw new Error("the Latin library states nothing");
  return s;
};
const quiet = (): void => {};

it("a technique sound in its own game and not in the candidate's comes out unsound, with its board", async () => {
  // The library's hidden single not counting a value's placed copies among
  // its places: the same on a Latin square, where a placed value is never
  // asked about, and unsound where Salad's empty square repeats.
  const lib = latin();
  const once = lib.techniques.find(([id]) => id === "hiddenSingle")?.[1];
  if (once === undefined) throw new Error("no hidden single");
  const stated = {
    ...once,
    for: once.for.replace(
      "where d in cand(c))",
      "where d in cand(c) and not known(c))",
    ),
  };
  expect(stated.for).not.toBe(once.for);
  const own = inCandidateWords(game("towers"), lib, "once", stated, libraries);
  if (typeof own === "string") throw new Error(own);
  expect((await checkInherited(own, libraries, quiet)).kind).toBe("sound");
  const json = inCandidateWords(game("salad"), lib, "once", stated, libraries);
  if (typeof json === "string") throw new Error(json);
  const v = await checkInherited(json, libraries, quiet);
  expect(v.kind).toBe("unsound");
  if (v.kind === "unsound") expect(v.model?.length ?? 0).toBeGreaterThan(0);
  // And as stated, it is sound there.
  const real = inCandidateWords(game("salad"), lib, "hiddenSingle", once, libraries);
  if (typeof real === "string") throw new Error(real);
  expect((await checkInherited(real, libraries, quiet)).kind).toBe("sound");
});

it("a technique reading a clue the candidate does not deal is not in its words", () => {
  const towers = sourceOf(game("towers"));
  if (towers === null) throw new Error("Towers states nothing");
  const [id, stated] = towers.techniques[0];
  const why = inCandidateWords(game("solo"), towers, id, stated, libraries);
  expect(typeof why).toBe("string");
  expect(
    inCandidateWords(game("towers"), towers, id, stated, libraries),
  ).not.toBeTypeOf("string");
});

const word = (v: Inherited): string => {
  switch (v.kind) {
    case "unstated":
      return `not in its words: ${v.why}`;
    case "sound":
      return `${v.held ? "held" : "sound"} on ${v.boards.join(", ")}`;
    case "unsound":
      return `UNSOUND in ${v.where}${v.at === null ? "" : ` at ${v.at}`}`;
    case "undecided":
      return `undecided in ${v.where}: ${v.why}`;
    case "unchecked":
      return `unchecked: ${v.why}`;
  }
};

it.skipIf(process.env["CANDIDATE"] === undefined)(
  "the inheritance report",
  async () => {
    const candidate = game(process.env["CANDIDATE"] ?? "");
    const from = process.env["FROM"]?.split(",") ?? null;
    const sources =
      from === null
        ? familySources(candidate, files)
        : from.map((name) => {
            const f = files.find((x) => (isLibrary(x) ? x.library : x.game) === name);
            const s = f === undefined ? null : sourceOf(f);
            if (s === null) throw new Error(`${name} states no techniques`);
            return s;
          });
    const lines: string[] = [];
    const say = (s: string): void => {
      console.log(s);
      lines.push(s);
    };
    const table: string[] = [];
    const read = new Set<string>();
    for (const source of sources)
      for (const [id, stated] of source.techniques) {
        say(`=== ${source.name}.${id}`);
        const json = inCandidateWords(candidate, source, id, stated, libraries);
        const v: Inherited =
          typeof json === "string"
            ? { kind: "unstated", why: json }
            : await checkInherited(json, libraries, say);
        if (v.kind === "unsound" && v.model !== null)
          for (const m of v.model) say(`    ${m}`);
        if (v.kind === "sound" && typeof json !== "string") {
          const d = loadDescription(json, libraries);
          const t = parseTechnique(source.name, id, stated);
          for (const n of readsOf(t, d.defs)) read.add(n);
        }
        table.push(`| ${source.name} | ${id} | ${word(v)} |`);
        say(`    ${word(v)}`);
      }
    const parts = ruleParts(candidate).map(
      ({ part, reads }) =>
        `| ${part} | ${reads.some((n) => read.has(n)) ? "read" : "**no technique inherited reads it**"} |`,
    );
    const report = [
      `# What ${candidate.game} inherits`,
      "",
      "| Source | Technique | In the candidate |",
      "| --- | --- | --- |",
      ...table,
      "",
      "| The candidate's rules | By what it inherits |",
      "| --- | --- |",
      ...parts,
      "",
      "## The run",
      "",
      "```",
      ...lines,
      "```",
      "",
    ];
    writeFileSync(
      fileURLToPath(new URL(`results-inherit-${candidate.game}.txt`, import.meta.url)),
      report.join("\n"),
    );
  },
);

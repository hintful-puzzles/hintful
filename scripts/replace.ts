/**
 * A literal replace across files, checked as Edit checks one:
 *
 *     npm run replace -- [--all] <old> <new> <file…>
 *     npm run replace -- <spec.yaml>
 *
 * A spec is a list of edits, each `{ old, new, files: [..] }` (or `file:`),
 * with `all: true` where every occurrence is meant; YAML's `|-` block keeps a
 * multi-line literal exactly, so it holds what a shell argument cannot. Write
 * it in the session's scratchpad. Edits apply in order, a later one seeing
 * what an earlier one left.
 *
 * It refuses, and writes nothing at all, where any edit's `old` is absent
 * from a file it names, or occurs there more than once without `all`, or
 * equals its `new`, or where a file is outside this repository. A match that
 * is not unique is the edit a person did not mean: the shell's `sed -i`
 * rewrites none or forty sites as happily as one.
 *
 * It prints the diff's shape: each file's sites by line, with the lines each
 * takes out and puts in, and the totals, so a bulk edit is checked by its
 * shape (`docs/method.md` § "Verify a bulk edit by the shape of its diff").
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";

interface Edit {
  readonly old: string;
  readonly new: string;
  readonly files: readonly string[];
  readonly all: boolean;
}

const ROOT = path.resolve(import.meta.dirname, "..");
/** Where a relative path is from: `npm run` starts a script at the root,
 * and says where it was called in `INIT_CWD`. */
const CALLED_FROM = process.env["INIT_CWD"] ?? process.cwd();
const USAGE = [
  "usage: npm run replace -- [--all] <old> <new> <file…>",
  "       npm run replace -- <spec.yaml>   (a list of { old, new, files, all? })",
].join("\n");

function refuse(why: string): never {
  console.error(`replace: ${why}`);
  process.exit(2);
}

function fromSpec(file: string): Edit[] {
  const data: unknown = parse(readFileSync(path.resolve(CALLED_FROM, file), "utf8"));
  if (!Array.isArray(data)) refuse(`${file} is not a list of edits\n${USAGE}`);
  return data.map((entry: unknown, i): Edit => {
    const e = (entry ?? {}) as Record<string, unknown>;
    const files = e["files"] ?? (e["file"] === undefined ? undefined : [e["file"]]);
    if (typeof e["old"] !== "string" || typeof e["new"] !== "string")
      refuse(`${file}, edit ${i + 1}: old and new are strings`);
    if (!Array.isArray(files) || files.some((f) => typeof f !== "string"))
      refuse(`${file}, edit ${i + 1}: files is a list of paths`);
    return { old: e["old"], new: e["new"], files, all: e["all"] === true };
  });
}

function fromArgs(argv: readonly string[]): Edit[] {
  const all = argv[0] === "--all";
  const rest = all ? argv.slice(1) : argv;
  if (rest.length === 1 && /\.ya?ml$/.test(rest[0]) && !all) return fromSpec(rest[0]);
  if (rest.length < 3) refuse(USAGE);
  const [old, replacement, ...files] = rest;
  return [{ old, new: replacement, files, all }];
}

const occurrences = (text: string, old: string): number[] => {
  const at: number[] = [];
  for (let i = text.indexOf(old); i !== -1; i = text.indexOf(old, i + old.length))
    at.push(i);
  return at;
};
const lineOf = (text: string, index: number): number =>
  text.slice(0, index).split("\n").length;
const linesIn = (s: string): number =>
  s === "" ? 0 : s.split("\n").length - (s.endsWith("\n") ? 1 : 0);

function main(): void {
  const edits = fromArgs(process.argv.slice(2));
  const texts = new Map<string, string>();
  const report = new Map<string, string[]>();
  let sites = 0;
  let out = 0;
  let put = 0;
  edits.forEach((edit, i) => {
    const which = edits.length > 1 ? `edit ${i + 1}: ` : "";
    if (edit.old === "") refuse(`${which}old is empty`);
    if (edit.old === edit.new) refuse(`${which}old and new are the same`);
    for (const file of edit.files) {
      const full = path.resolve(CALLED_FROM, file);
      const rel = path.relative(ROOT, full);
      if (rel.startsWith("..") || path.isAbsolute(rel))
        refuse(`${which}${file} is outside this repository`);
      const text = texts.get(full) ?? readFileSync(full, "utf8");
      const at = occurrences(text, edit.old);
      if (at.length === 0) refuse(`${which}${rel}: old is not there`);
      if (at.length > 1 && !edit.all)
        refuse(
          `${which}${rel}: old occurs ${at.length} times (lines ${at.map((k) => lineOf(text, k)).join(", ")}); give more context, or --all / all: true if every one is meant`,
        );
      const lines = report.get(rel) ?? [];
      for (const k of at)
        lines.push(
          `  line ${lineOf(text, k)}: -${linesIn(edit.old)} +${linesIn(edit.new)}`,
        );
      report.set(rel, lines);
      sites += at.length;
      out += at.length * linesIn(edit.old);
      put += at.length * linesIn(edit.new);
      texts.set(full, text.split(edit.old).join(edit.new));
    }
  });
  for (const [full, text] of texts) writeFileSync(full, text);
  for (const [rel, lines] of report) console.log(`${rel}\n${lines.join("\n")}`);
  console.log(
    `${sites} site${sites === 1 ? "" : "s"} in ${texts.size} file${texts.size === 1 ? "" : "s"}: -${out} +${put} lines`,
  );
}

main();

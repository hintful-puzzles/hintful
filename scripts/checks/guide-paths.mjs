#!/usr/bin/env node
/**
 * The guide-path guard: a file a guide cites as an exemplar still exists.
 *
 * A guide names files as it teaches, "Exemplar: `starbattle/render.ts`", and a
 * game born from its description deletes every one of its TypeScript files at
 * once. Nothing else reads these names, and twenty-odd stood dead in the
 * guides after the fill games' flips, each sending the next reader to a file
 * that was gone.
 *
 * **The key is a shape.** A backticked path, or a markdown link's target, of
 * a directory and a file with a code or text extension. A cited path is
 * written in three forms in the tree: from the root (`src/engine/fill/game.ts`),
 * from somewhere under it (`fill/render.ts`, `starbattle/render.ts`), and as a
 * link relative to the guide. A backticked one resolves where a tracked file's
 * path ends with it, at a directory boundary; a link resolves at its target.
 * A path that is an example or a pattern, and names no file of the tree, is in
 * `NOT_FILES` with its reason, asserted exactly equal to what does not resolve.
 *
 * In the gate's fast prefix with `change-citations.mjs`, for its reasons: it
 * reads `docs/`, and no vitest file may.
 *
 * Usage: `node scripts/checks/guide-paths.mjs`. Exit 1 on any report.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { listedFiles } from "./listed-files.mjs";

/** Cited paths that name no file of the tree, each with why. */
const NOT_FILES = new Map([
  [
    "src/d/x.description.yaml",
    "the pattern a description's path takes, `d` its directory",
  ],
  ["src/generated/d/x.compiled.ts", "the pattern the compiled module's path takes"],
]);

/** Below these, the reading is broken rather than the guides clean. */
const FLOORS = { guides: 15, cited: 300 };

const fail = (msg) => {
  console.error(`guide-paths: ${msg}`);
  process.exit(1);
};

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const files = new Set(tracked.filter((f) => existsSync(f)));
for (const f of listedFiles(["."])) files.add(f);

const guides = listedFiles(["docs/*.md", "README.md", "AGENTS.md"]);
if (guides.length < FLOORS.guides)
  fail(`read ${guides.length} guides, under the floor of ${FLOORS.guides}`);

const EXT = "(?:ts|mts|mjs|js|json|yaml|md|css|sh|html)";
const SEGMENT = "[A-Za-z0-9_.-]+";
const PATH = `${SEGMENT}(?:/${SEGMENT})*/${SEGMENT}\\.${EXT}`;
// A backticked path, alone in its backticks, and not a link's text, whose
// target is read instead.
const TICKED = new RegExp(`\`(${PATH})\`(?!\\])`, "g");
// A markdown link's target, its anchor dropped.
const LINKED = new RegExp(`\\]\\((${PATH})(?:#[^)]*)?\\)`, "g");

/** Whether a backticked path is a tracked file's, or the end of one's. */
const resolvesTicked = (p) =>
  files.has(p) || [...files].some((f) => f.endsWith(`/${p}`));

let cited = 0;
const dead = new Map();
for (const guide of guides) {
  const text = readFileSync(guide, "utf8");
  const at = (index) => text.slice(0, index).split("\n").length;
  const report = (path, index) => {
    const where = `${guide}:${at(index)}`;
    dead.set(path, [...(dead.get(path) ?? []), where]);
  };
  for (const m of text.matchAll(LINKED)) {
    cited++;
    const target = normalize(join(dirname(guide), m[1]));
    if (!files.has(target)) report(m[1], m.index);
  }
  for (const m of text.matchAll(TICKED)) {
    cited++;
    if (!resolvesTicked(m[1])) report(m[1], m.index);
  }
}
if (cited < FLOORS.cited)
  fail(`read ${cited} cited paths, under the floor of ${FLOORS.cited}`);

const problems = [];
for (const [path, where] of dead)
  if (!NOT_FILES.has(path))
    problems.push(`${path} names no file, cited at ${where.join(", ")}`);
for (const path of NOT_FILES.keys())
  if (!dead.has(path))
    problems.push(
      `${path} is listed as no file, but resolves or is not cited: remove it`,
    );
if (problems.length > 0) fail(`\n  ${problems.join("\n  ")}`);

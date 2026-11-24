/**
 * `npm run spec-delta -- <change> <capability> "<requirement title>"`: copy a
 * requirement, every scenario of it included, from the main spec into the
 * change's delta for that capability, under `## MODIFIED Requirements`, and
 * report how long each requirement of the delta is against the validator's
 * bound.
 *
 * A MODIFIED block replaces the whole requirement when the change is
 * archived, so a scenario it leaves out is deleted, and the validator refuses
 * the loss only once the delta is written by hand and checked. Starting from
 * the spec's own text makes the edit a change to that text. The bound is
 * `scripts/checks/spec-form.mjs`'s, which the gate checks again at the
 * commit.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { LONGEST, parseSpec, specPath } from "./checks/spec-parse.mjs";

const MODIFIED = "## MODIFIED Requirements";

/** @param {string} message */
function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

const [change, capability, title] = process.argv.slice(2);
if (change === undefined || capability === undefined || title === undefined)
  fail('usage: npm run spec-delta -- <change> <capability> "<requirement title>"');

const changeDir = path.join("openspec", "changes", change);
if (!existsSync(changeDir)) fail(`${changeDir} is not an open change`);
const source = specPath(capability);
if (!existsSync(source)) fail(`${source} does not exist: no capability ${capability}`);

const wanted = title.replace(/^Requirement:\s*/, "").trim();
const requirements = parseSpec(readFileSync(source, "utf8")).requirements;
const found = requirements.find((r) => r.title === wanted);
if (found === undefined) {
  const words = wanted
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);
  const near = requirements
    .filter((r) => words.some((w) => r.title.toLowerCase().includes(w)))
    .map((r) => `  ${r.title}`);
  fail(
    `${source} has no requirement titled "${wanted}".` +
      (near.length > 0 ? ` Titles sharing a word:\n${near.join("\n")}` : ""),
  );
}

const target = path.join(changeDir, "specs", capability, "spec.md");
const before = existsSync(target) ? readFileSync(target, "utf8") : "";
if (parseSpec(before).requirements.some((r) => r.title === wanted))
  fail(`${target} already holds "${wanted}"`);

const block = `${found.text}\n`;
let after;
if (before.trim() === "") {
  after = `${MODIFIED}\n\n${block}`;
} else {
  const lines = before.replace(/\n*$/, "\n").split("\n");
  const start = lines.indexOf(MODIFIED);
  if (start === -1) {
    after = `${before.replace(/\n*$/, "")}\n\n${MODIFIED}\n\n${block}`;
  } else {
    // At the end of the MODIFIED section: before the next `## ` heading.
    const next = lines.findIndex((l, i) => i > start && /^## /.test(l));
    const end = next === -1 ? lines.length : next;
    const head = lines.slice(0, end).join("\n").replace(/\n*$/, "");
    const tail = lines.slice(end).join("\n").replace(/\n*$/, "");
    after = `${head}\n\n${block}${tail === "" ? "" : `\n${tail}\n`}`;
  }
}
mkdirSync(path.dirname(target), { recursive: true });
writeFileSync(target, after);
console.log(
  `✎ ${target}: "${wanted}", with its ${found.scenarios.length} scenario(s). ` +
    "Edit it there, and keep every scenario you do not mean to delete.",
);

let over = 0;
for (const r of parseSpec(after).requirements) {
  const ok = r.chars <= LONGEST;
  if (!ok) over++;
  console.log(
    `${ok ? "✓" : "✗"} ${String(r.chars).padStart(4)} of ${LONGEST} characters  ${r.title}`,
  );
}
if (over > 0) process.exit(1);

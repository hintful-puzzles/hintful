#!/usr/bin/env node
/**
 * A requirement cited by its capability and its title resolves (`repo-layout`,
 * "A requirement cited by its title resolves"). A comment that points a
 * reader at a rule is worth the rule's being there, and a requirement's title
 * changes whenever a change restates it.
 *
 * The key is a shape, and the superset is accepted: a backticked capability
 * name followed by a quoted string, with "spec", "requirement", a comma or a
 * section sign between them, and the name may be a markdown link's text. What that catches and is not a citation is
 * listed in `NOT_A_TITLE`, which is held exactly equal to the unresolved set,
 * so an entry that starts resolving has to be removed.
 *
 * A citation may stop short of a long title, so the quoted words resolve when
 * a title of that capability begins with them. `openspec/` is not read: an
 * archived change cites the titles of its day.
 *
 *   node scripts/checks/spec-citations.mjs           the gate's check
 *   node scripts/checks/spec-citations.mjs --list    every citation found
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { capabilityNames, parseSpec, readSpec } from "./spec-parse.mjs";

/** `<file>: <capability>: <quoted words>` for each match that is not a
 * citation of a requirement, with what it is. */
const NOT_A_TITLE = new Map([]);

const fold = (text) =>
  text.replace(/\s*\n\s*(?:\*|\/\/|#|>)?\s*/g, " ").replace(/\s+/g, " ");
const CITATION =
  /`([a-z0-9]+(?:-[a-z0-9]+)*)`(?: spec)?(?:\]\([^)\s]*\))?(?: (?:spec|capability|requirement))?(?:,| §|:)? ?\(?["“]([^"”]{8,}?)["”]/g;

const titles = new Map(
  capabilityNames().map((name) => [
    name,
    readSpec(name).requirements.map((r) => fold(r.title)),
  ]),
);
// A requirement an open change adds is cited by the code that change writes,
// before archiving puts it in the capability's spec.
for (const change of readdirSync("openspec/changes")) {
  for (const [capability, known] of titles) {
    const delta = `openspec/changes/${change}/specs/${capability}/spec.md`;
    if (change === "archive" || !existsSync(delta)) continue;
    for (const section of readFileSync(delta, "utf8").split(/^## /m)) {
      known.push(...parseSpec(section).requirements.map((r) => fold(r.title)));
    }
  }
}
const files = execFileSync(
  "git",
  ["ls-files", "src", "docs", "scripts", "AGENTS.md", "README.md"],
  {
    encoding: "utf8",
    maxBuffer: 1 << 26,
  },
)
  .split("\n")
  .filter((file) => /\.(ts|mjs|js|md|sh|css)$/.test(file));

const found = [];
for (const file of files) {
  for (const [, capability, quoted] of fold(readFileSync(file, "utf8")).matchAll(
    CITATION,
  )) {
    if (!titles.has(capability)) continue;
    const words = quoted.replace(/[.,;:]$/, "");
    const resolves = titles.get(capability).some((title) => title.startsWith(words));
    found.push({ key: `${file}: ${capability}: ${words}`, resolves });
  }
}

if (process.argv.includes("--list")) {
  for (const { key, resolves } of found) console.log(`${resolves ? "✓" : "✗"} ${key}`);
}

const failures = [];
const unresolved = new Set(found.filter((c) => !c.resolves).map((c) => c.key));
for (const key of unresolved) {
  if (!NOT_A_TITLE.has(key))
    failures.push(`no requirement of that capability has the title: ${key}`);
}
for (const key of NOT_A_TITLE.keys()) {
  if (!unresolved.has(key))
    failures.push(`listed in NOT_A_TITLE and no longer unresolved: ${key}`);
}
// A file listing or a pattern that stopped matching would pass over nothing.
if (files.length < 500 || found.length < 20) {
  failures.push(
    `read ${files.length} files and found ${found.length} citations, too few to trust`,
  );
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`✗ spec-citations: ${failure}`);
  console.error(
    "  Cite the requirement's title as it stands in openspec/specs/<capability>/spec.md.",
  );
  process.exit(1);
}
console.log(
  `✓ spec-citations: ${found.length} citations of a requirement by title, ${found.length - unresolved.size} resolving, ${unresolved.size} listed as something else.`,
);

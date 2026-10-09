#!/usr/bin/env node
/**
 * Checks the ledger that carries a capability's rewrite: every requirement the
 * spec had before has a section, every row says where its rule went, and every
 * place a row names is there to be found. It cannot tell whether a rule kept
 * its meaning, which is what the two reviews are for.
 *
 *   node scripts/checks/spec-ledger.mjs <ledger.md>...
 *
 * A ledger is markdown:
 *
 *   # Ledger: <capability>
 *   Base: <commit>            the spec is read from git as it was there
 *   Spec: <path>              optional: the rewritten spec, when it is not yet
 *                             the capability's own `spec.md`
 *
 *   ## <a requirement's title at the base commit>
 *   | Rule | Where it went |
 *   | --- | --- |
 *   | <the rule, briefly> | <destination> |
 *
 * A destination is one of:
 *
 *   spec: <Title>                       a requirement of the rewritten spec
 *   spec <capability>: <Title>          a requirement of another capability
 *   guide: <path> § "<Heading>"         a heading of a file under `docs/`
 *   held: <path> "<text>"               a guard, a type or a declaration that
 *                                       holds the rule, and text found in it
 *   history | figure | reason           what a requirement does not hold
 *   untrue: <why>                       the rule is false of the code today
 *
 * Several destinations are separated by `;`.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { parseSpec, readSpec, shallCount, specPath } from "./spec-parse.mjs";

const DROPPED = new Set(["history", "figure", "reason"]);

function headings(path) {
  return new Set(
    readFileSync(path, "utf8")
      .split("\n")
      .map((row) => /^#{1,6}\s+(.+?)\s*$/.exec(row)?.[1])
      .filter((title) => title != null),
  );
}

/** @returns {string | null} why the destination does not resolve */
function unresolved(destination, titles) {
  if (DROPPED.has(destination)) return null;
  if (/^untrue: \S/.test(destination)) return null;

  const own = /^spec: (.+)$/.exec(destination);
  if (own)
    return titles.has(own[1])
      ? null
      : `no requirement "${own[1]}" in the rewritten spec`;

  const other = /^spec ([a-z0-9-]+): (.+)$/.exec(destination);
  if (other) {
    if (!existsSync(specPath(other[1]))) return `no capability ${other[1]}`;
    return readSpec(other[1]).requirements.some((r) => r.title === other[2])
      ? null
      : `no requirement "${other[2]}" in ${other[1]}`;
  }

  const guide = /^guide: (\S+) § "(.+)"$/.exec(destination);
  if (guide) {
    if (!guide[1].startsWith("docs/") || !existsSync(guide[1]))
      return `no guide ${guide[1]}`;
    return headings(guide[1]).has(guide[2])
      ? null
      : `no heading "${guide[2]}" in ${guide[1]}`;
  }

  const held = /^held: (\S+) "(.+)"$/.exec(destination);
  if (held) {
    if (!existsSync(held[1])) return `no file ${held[1]}`;
    return readFileSync(held[1], "utf8").includes(held[2])
      ? null
      : `"${held[2]}" is not in ${held[1]}`;
  }
  return "not a destination this checker knows";
}

function check(ledgerPath) {
  const failures = [];
  const text = readFileSync(ledgerPath, "utf8");
  const capability = /^# Ledger: ([a-z0-9-]+)\s*$/m.exec(text)?.[1];
  const base = /^Base: ([0-9a-f]{7,40})\s*$/m.exec(text)?.[1];
  if (!capability || !base)
    return { failures: ["it needs `# Ledger: <capability>` and `Base: <commit>`"] };
  const rewrittenPath = /^Spec: (\S+)\s*$/m.exec(text)?.[1] ?? specPath(capability);

  const before = parseSpec(
    execFileSync("git", ["show", `${base}:${specPath(capability)}`], {
      encoding: "utf8",
    }),
  );
  const after = parseSpec(readFileSync(rewrittenPath, "utf8"));
  const titles = new Set(after.requirements.map((r) => r.title));

  // The ledger's sections, each with its rows.
  const sections = new Map();
  let current = null;
  for (const row of text.split("\n")) {
    const section = /^## (.+?)\s*$/.exec(row);
    if (section) {
      current = [];
      sections.set(section[1], current);
      continue;
    }
    const cells = /^\|(.+)\|\s*$/
      .exec(row)?.[1]
      .split("|")
      .map((cell) => cell.trim());
    if (!current || !cells || cells.length !== 2) continue;
    if (cells[0] === "Rule" || /^-+$/.test(cells[0])) continue;
    current.push({
      rule: cells[0],
      destinations: cells[1].split(";").map((d) => d.trim()),
    });
  }

  for (const requirement of before.requirements) {
    const rows = sections.get(requirement.title);
    if (!rows) failures.push(`no section for the requirement "${requirement.title}"`);
    else if (rows.length === 0)
      failures.push(`the section "${requirement.title}" has no rows`);
  }
  const known = new Set(before.requirements.map((r) => r.title));
  const reached = new Set();
  const kinds = new Map();
  for (const [title, rows] of sections) {
    if (!known.has(title)) {
      failures.push(`"${title}" was not a requirement of ${capability} at ${base}`);
    }
    for (const row of rows) {
      for (const destination of row.destinations) {
        const why = unresolved(destination, titles);
        if (why) failures.push(`"${title}": ${row.rule}: ${why}`);
        const own = /^spec: (.+)$/.exec(destination);
        if (own) reached.add(own[1]);
        const kind = destination.split(/[: ]/)[0];
        kinds.set(kind, (kinds.get(kind) ?? 0) + 1);
      }
    }
  }
  // A requirement of the rewritten spec that no row leads to is a rule the old
  // spec did not have, and a rewrite adds none.
  for (const title of titles) {
    if (!reached.has(title))
      failures.push(`no row leads to the new requirement "${title}"`);
  }

  const shalls = (spec) =>
    spec.requirements.reduce((n, r) => n + shallCount(r.text), 0);
  const summary =
    `${capability}: ${before.requirements.length} requirements, ${before.lines} lines and ` +
    `${shalls(before)} SHALL before; ${after.requirements.length}, ${after.lines} and ` +
    `${shalls(after)} after. Rows: ${[...kinds].map(([kind, n]) => `${n} ${kind}`).join(", ")}.`;
  return { failures, summary };
}

const ledgers = process.argv.slice(2);
if (ledgers.length === 0) {
  console.error("usage: node scripts/checks/spec-ledger.mjs <ledger.md>...");
  process.exit(2);
}
let failed = false;
for (const ledger of ledgers) {
  const { failures, summary } = check(ledger);
  for (const failure of failures) console.error(`✗ spec-ledger: ${ledger}: ${failure}`);
  if (failures.length > 0) failed = true;
  else console.log(`✓ spec-ledger: ${summary}`);
}
process.exit(failed ? 1 : 0);

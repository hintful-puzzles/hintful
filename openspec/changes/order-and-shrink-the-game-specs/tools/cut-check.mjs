#!/usr/bin/env node
/**
 * Holds a game's ledger to the diff of its spec: every requirement the cut
 * removed or changed has a row, by the title it had at the base commit, and
 * every title the cut introduced is named in the ledger. It reads the shape
 * of the edit and cannot tell that a row's "where it is stated instead" is
 * true, which is the reviewer's to read.
 *
 *   node openspec/changes/order-and-shrink-the-game-specs/tools/cut-check.mjs [game...]
 *
 * With no game it takes every game that has a ledger, and names the games
 * that have none.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { parseSpec, specPath } from "../../../../scripts/checks/spec-parse.mjs";

/** The specs as the reorder left them, before any cut. */
const BASE = "c86372f4";
const LEDGERS = "openspec/changes/order-and-shrink-the-game-specs/ledger";
const LIMIT = 500;

const allGames = readdirSync("src/games", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
const asked = process.argv.slice(2);
const ledgerOf = (game) => `${LEDGERS}/${game}.md`;
const games =
  asked.length > 0 ? asked : allGames.filter((g) => existsSync(ledgerOf(g)));

const cells = (row) =>
  row
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim());

const total = { before: [0, 0, 0], after: [0, 0, 0] };
const measure = (markdown, spec) => [
  Buffer.byteLength(markdown),
  spec.requirements.length,
  spec.requirements.reduce((sum, r) => sum + r.scenarios.length, 0),
];
let failed = 0;

for (const game of games) {
  const failures = [];
  const beforeText = execFileSync("git", ["show", `${BASE}:${specPath(game)}`], {
    encoding: "utf8",
    maxBuffer: 1 << 26,
  });
  const afterText = readFileSync(specPath(game), "utf8");
  const before = parseSpec(beforeText);
  const after = parseSpec(afterText);
  const ledger = existsSync(ledgerOf(game))
    ? readFileSync(ledgerOf(game), "utf8")
    : null;
  if (ledger === null) failures.push("no ledger");
  const rowTitles = new Set(
    (ledger ?? "")
      .split("\n")
      .filter((row) => row.trim().startsWith("|"))
      .map((row) => cells(row)[0]),
  );
  const flat = (ledger ?? "").replace(/\s+/g, " ");

  const afterByTitle = new Map(after.requirements.map((r) => [r.title, r]));
  const beforeTitles = new Set(before.requirements.map((r) => r.title));
  // A scenario moved to another requirement is not dropped.
  const afterScenarios = new Set(
    after.requirements.flatMap((r) => r.scenarios.map((s) => s.name)),
  );
  let untouched = 0;
  let droppedScenarios = 0;
  for (const was of before.requirements) {
    const now = afterByTitle.get(was.title);
    if (now && now.text === was.text) {
      untouched++;
      if (rowTitles.has(was.title))
        failures.push(`a row for an unchanged requirement: ${was.title}`);
      continue;
    }
    droppedScenarios += was.scenarios.filter((s) => !afterScenarios.has(s.name)).length;
    if (!rowTitles.has(was.title))
      failures.push(
        `no row for a requirement ${now ? "changed" : "gone"}: ${was.title}`,
      );
  }
  for (const now of after.requirements) {
    if (!beforeTitles.has(now.title) && !flat.includes(now.title))
      failures.push(`a new title the ledger does not name: ${now.title}`);
    if (now.chars > LIMIT)
      failures.push(`${now.chars} characters before the first scenario: ${now.title}`);
    if (now.scenarios.length === 0) failures.push(`no scenario: ${now.title}`);
  }
  for (const title of rowTitles) {
    if (/^-+$|^Requirement\b/.test(title) || title === "") continue;
    if (!beforeTitles.has(title) && !afterByTitle.has(title))
      failures.push(`a row whose title is in neither spec: ${title}`);
  }

  const b = measure(beforeText, before);
  const a = measure(afterText, after);
  for (let i = 0; i < 3; i++) {
    total.before[i] += b[i];
    total.after[i] += a[i];
  }
  const pct = Math.round((100 * (a[0] - b[0])) / b[0]);
  console.log(
    `${failures.length ? "✗" : "✓"} ${game}: ${b[0]} → ${a[0]} bytes (${pct}%), ${b[1]} → ${a[1]} requirements, ${b[2]} → ${a[2]} scenarios; ${untouched} untouched, ${droppedScenarios} scenarios dropped`,
  );
  for (const failure of failures) console.log(`    ${failure}`);
  failed += failures.length;
}

const pct = Math.round(
  (100 * (total.after[0] - total.before[0])) / Math.max(1, total.before[0]),
);
console.log(
  `\n${games.length} games: ${total.before[0]} → ${total.after[0]} bytes (${pct}%), ${total.before[1]} → ${total.after[1]} requirements, ${total.before[2]} → ${total.after[2]} scenarios`,
);
if (asked.length === 0) {
  const missing = allGames.filter((g) => !existsSync(ledgerOf(g)));
  console.log(`no ledger yet (${missing.length}): ${missing.join(" ")}`);
}
process.exit(failed > 0 ? 1 : 0);

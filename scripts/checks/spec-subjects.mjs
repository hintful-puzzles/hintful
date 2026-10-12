#!/usr/bin/env node
/**
 * A game's spec is read a subject at a time, so every game spec has the same
 * subjects in the same order (`repo-layout`, "A game's spec is ordered by
 * subject"): a requirement's title leads with its subject and a colon, the
 * subjects stand in the order of `SUBJECTS`, and a spec holds the subjects its
 * game owes. The guide is `docs/new-game.md` § "What a game's spec holds".
 *
 * The subject is a key from a closed list and never a word found in prose, so
 * a title that does not carry one is refused. What this cannot see is a
 * requirement filed under the wrong subject: the list says where a requirement
 * stands, and only a reader says whether it belongs there.
 *
 * What a game owes is read from the game: `capability-surface.test.ts` records
 * the optional members of each registered `Game` object in its snapshot and
 * fails when the record and the object differ, and this reads that record.
 * `openspec/` is read by no test (`docs/testing.md` § "Right-sizing the
 * gate"), which is why this is a script of the fast prefix and reads the
 * record, where a test would have read the object.
 *
 * Archiving a change appends the requirements it adds to the end of the spec,
 * so a delta that adds one leaves the spec out of order:
 *
 *   node scripts/checks/spec-subjects.mjs           the gate's check
 *   node scripts/checks/spec-subjects.mjs --fix     put each spec in order
 *
 * `--fix` moves whole requirements and changes no word of one.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { parseSpec, specPath } from "./spec-parse.mjs";

/** The subjects of a game's spec, in the order they stand in it. */
const SUBJECTS = [
  "Rules",
  "Params",
  "Description",
  "Generation",
  "Solver",
  "Controls",
  "Preferences",
  "Hint",
  "Status bar",
  "Look",
];

/** The subjects every game's spec holds. */
const OWED_BY_ALL = ["Rules", "Params", "Description", "Controls"];

/** The subjects a game's spec holds when its `Game` object has the member. */
const OWED_BY_MEMBER = [
  ["hint", "Hint"],
  ["statusbarText", "Status bar"],
  ["difficulty", "Generation"],
];

const GAMES_DIR = "src/games";
const SURFACE = "src/__snapshots__/capability-surface.test.ts.snap";

/** The subject a title leads with, or null. */
function subjectOf(title) {
  const colon = title.indexOf(": ");
  const subject = colon === -1 ? null : title.slice(0, colon);
  return SUBJECTS.includes(subject) ? subject : null;
}

/** Each game's optional `Game` members, by id, as the snapshot records them. */
function recordedMembers() {
  const members = new Map();
  let id = null;
  let list = null;
  for (const row of readFileSync(SURFACE, "utf8").split("\n")) {
    const named = /^\s*"id": "([^"]+)",$/.exec(row);
    if (named) id = named[1];
    else if (/^\s*"members": \[$/.test(row)) list = [];
    else if (list !== null && /^\s*\],$/.test(row)) {
      members.set(id, list);
      list = null;
    } else if (list !== null) list.push(/"([^"]+)"/.exec(row)[1]);
  }
  return members;
}

/** A spec's text as its heading and its requirements, which is all of it. */
function readParts(path) {
  const markdown = readFileSync(path, "utf8");
  const { requirements } = parseSpec(markdown);
  const head = markdown
    .split("\n")
    .slice(0, requirements[0].line - 1)
    .join("\n");
  const join = (blocks) => `${head}\n${blocks.map((r) => r.text).join("\n\n")}\n`;
  return { markdown, requirements, join };
}

const fix = process.argv.includes("--fix");
const games = readdirSync(GAMES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const recorded = recordedMembers();

const failures = [];
let requirementCount = 0;
let moved = 0;
for (const game of games) {
  const path = specPath(game);
  if (!existsSync(path)) {
    failures.push(`${path}: the game has no spec`);
    continue;
  }
  const { markdown, requirements, join } = readParts(path);
  requirementCount += requirements.length;
  // `--fix` must be able to write the file back from its parts, so a spec
  // holding anything else between its requirements is refused first.
  if (join(requirements) !== markdown) {
    failures.push(
      `${path}: holds text that is not its heading or a requirement, or its blank lines are not one between requirements`,
    );
    continue;
  }

  const untitled = requirements.filter((r) => subjectOf(r.title) === null);
  for (const r of untitled) {
    failures.push(`${path}:${r.line}: the title leads with no subject: ${r.title}`);
  }
  if (untitled.length > 0) continue;

  const rank = (r) => SUBJECTS.indexOf(subjectOf(r.title));
  const outOfOrder = requirements.filter(
    (r, index) => index > 0 && rank(r) < rank(requirements[index - 1]),
  );
  if (outOfOrder.length > 0 && fix) {
    // A stable sort, so requirements of one subject keep their order.
    const sorted = [...requirements].sort((a, b) => rank(a) - rank(b));
    writeFileSync(path, join(sorted));
    moved += 1;
  } else {
    for (const r of outOfOrder) {
      failures.push(
        `${path}:${r.line}: ${subjectOf(r.title)} stands after a later subject: ${r.title}`,
      );
    }
  }

  const held = new Set(requirements.map((r) => subjectOf(r.title)));
  const members = recorded.get(game);
  if (!members) {
    failures.push(
      `${path}: ${SURFACE} has no record of ${game}; write it with \`npx vitest run src/capability-surface.test.ts -u\``,
    );
    continue;
  }
  const owed = [
    ...OWED_BY_ALL.map((subject) => [subject, "every game"]),
    ...OWED_BY_MEMBER.filter(([member]) => members.includes(member)).map(
      ([member, subject]) => [subject, `a game with \`${member}\``],
    ),
  ];
  for (const [subject, why] of owed) {
    if (!held.has(subject))
      failures.push(`${path}: no ${subject} requirement, which ${why} owes`);
  }
}

// A directory listing or a snapshot read that came back short would pass
// every spec it did not see.
if (games.length < 57 || recorded.size < games.length || requirementCount < 500) {
  failures.push(
    `read ${games.length} games, ${recorded.size} recorded surfaces and ${requirementCount} requirements, too few to trust`,
  );
}
for (const [member] of OWED_BY_MEMBER) {
  if (![...recorded.values()].some((members) => members.includes(member)))
    failures.push(`no game is recorded with \`${member}\`, so it asks nothing`);
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`✗ spec-subjects: ${failure}`);
  console.error(
    `  A game spec's titles lead with one of: ${SUBJECTS.join(", ")}; in that order.\n` +
      "  `node scripts/checks/spec-subjects.mjs --fix` sorts a spec whose titles all\n" +
      `  carry one. See docs/new-game.md § "What a game's spec holds".`,
  );
  process.exit(1);
}
console.log(
  fix
    ? `✓ spec-subjects: ${moved} specs put in order.`
    : `✓ spec-subjects: ${requirementCount} requirements in ${games.length} game specs, each under its subject, in order, with what its game owes.`,
);

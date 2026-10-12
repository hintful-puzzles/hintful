#!/usr/bin/env node
/**
 * A guide is looked up, so its opening names every section it has, and a
 * citation of a section lands on one (`repo-layout`, "A guide opens with its
 * how-to and a table of its sections" and "A guide section is cited by its
 * heading").
 *
 * A session reads a guide's opening and then one section. That works only
 * while the opening is complete and small: a section missing from the table
 * is one nobody is sent to, and an opening that grows is one nobody reads.
 * And a citation is by heading text, which nothing else resolves: twenty were
 * dead when this was written, each a heading reworded after it was cited.
 *
 * What is held, for a guide with a `## Sections` table:
 *   1. every `##` and `###` heading after the table has a row, and every row
 *      names a heading;
 *   2. the opening, everything above the first section after the table, is
 *      within OPENING_BYTES;
 *   3. no two headings share their text, and none holds a double quote,
 *      since a citation is the text between two of them.
 * And for every tracked file outside the record:
 *   4. `<guide>.md § "Heading"` names a heading of that guide, and inside a
 *      guide a bare `§ "Heading"` names one of its own.
 *
 * A guide without the table is listed in READ_WHOLE with its reason, so a new
 * guide is held by default.
 *
 * `--list <guide>` prints the rows a guide's table should have, for writing
 * one.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

/** The opening of a guide, in bytes: its paragraph, its how-to and its table. */
const OPENING_BYTES = 12_000;

/** The guides read whole, and why each needs no table of its sections. */
const READ_WHOLE = new Map([
  ["doctrine.md", "short, and read through once for a framework decision"],
  ["method.md", "short, and read through once before trusting a check"],
  ["help-pages.md", "short, and every part of it binds every help page"],
  ["work-management.md", "short, and a session's whole procedure"],
  ["test-strength.md", "its sections are numbered and cited by number"],
]);

const SECTIONS = "Sections";
const HOW_TO = "What every game does";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const tracked = execFileSync("git", ["ls-files", "-z"], {
  cwd: repoRoot,
  maxBuffer: 1 << 28,
})
  .toString()
  .split("\0")
  .filter(Boolean);

const failures = [];

/** A guide's headings, with the byte offset each starts at. */
function headingsOf(text) {
  const found = [];
  let offset = 0;
  let fenced = false;
  for (const line of text.split("\n")) {
    if (line.startsWith("```")) fenced = !fenced;
    const match = fenced ? null : /^(#{2,4}) (.+?)\s*$/.exec(line);
    if (match) found.push({ level: match[1].length, text: match[2], offset });
    offset += Buffer.byteLength(line) + 1;
  }
  return found;
}

/** The first cell of each row of the table under `## Sections`. */
function rowsOf(text, from, to) {
  const rows = [];
  for (const line of text.slice(from, to).split("\n")) {
    const cell = /^\|\s*(.+?)\s*\|/.exec(line)?.[1];
    if (!cell || cell === "Section" || /^[-: ]+$/.test(cell)) continue;
    rows.push(cell.replace(/^– /, "").replace(/\\\|/g, "|"));
  }
  return rows;
}

const guides = new Map();
for (const file of tracked) {
  if (!/^docs\/[^/]+\.md$/.test(file)) continue;
  const name = basename(file);
  const text = readFileSync(join(repoRoot, file), "utf8");
  const headings = headingsOf(text);
  guides.set(name, {
    file,
    text,
    headings,
    titles: new Set(headings.map((h) => h.text)),
  });
}

let tabled = 0;
let largest = { bytes: 0, file: "" };
for (const [name, guide] of guides) {
  const { text, headings } = guide;
  const seen = new Set();
  for (const heading of headings) {
    if (seen.has(heading.text)) {
      failures.push(`${guide.file}: two headings read "${heading.text}"`);
    }
    seen.add(heading.text);
    if (heading.text.includes('"')) {
      failures.push(`${guide.file}: the heading ${heading.text} holds a double quote`);
    }
  }

  const at = headings.findIndex((h) => h.level === 2 && h.text === SECTIONS);
  if (at === -1) {
    if (!READ_WHOLE.has(name)) {
      failures.push(
        `${guide.file} has no "## ${SECTIONS}" table and is not listed as read whole`,
      );
    }
    continue;
  }
  if (READ_WHOLE.has(name)) {
    failures.push(
      `${guide.file} has a "## ${SECTIONS}" table and is listed as read whole`,
    );
  }
  tabled++;
  if (headings[at - 1]?.text !== HOW_TO || at !== 1) {
    failures.push(
      `${guide.file}: "## ${HOW_TO}" is not its first section, before the table`,
    );
  }
  const after = headings.slice(at + 1);
  const openingEnd = after[0]?.offset ?? Buffer.byteLength(text);
  if (openingEnd > largest.bytes) largest = { bytes: openingEnd, file: guide.file };
  if (openingEnd > OPENING_BYTES) {
    failures.push(
      `${guide.file}: its opening is ${openingEnd} bytes, ${openingEnd - OPENING_BYTES} over ${OPENING_BYTES}`,
    );
  }
  const bytes = Buffer.from(text);
  const rows = rowsOf(
    bytes.subarray(headings[at].offset, openingEnd).toString("utf8"),
    0,
    undefined,
  );
  const owed = after.filter((h) => h.level <= 3).map((h) => h.text);
  if (process.argv[2] === "--list" && process.argv[3] === name) {
    for (const h of after.filter((x) => x.level <= 3)) {
      console.log(`| ${h.level === 3 ? "– " : ""}${h.text.replace(/\|/g, "\\|")} |  |`);
    }
    process.exit(0);
  }
  const rowSet = new Set(rows);
  for (const heading of owed) {
    if (!rowSet.has(heading)) {
      failures.push(`${guide.file}: the section "${heading}" has no row in its table`);
    }
  }
  const owedSet = new Set(owed);
  for (const row of rows) {
    if (!owedSet.has(row)) {
      failures.push(
        `${guide.file}: its table names "${row}", which is no section of it`,
      );
    }
  }
}
if (tabled === 0)
  failures.push("no guide under docs/ has a section table: nothing was held");

// --- 4. Citations. ---

/** The record: what was true when it was written, and is not repointed. */
const RECORD = /^openspec\/(changes\/archive|postmortems)\//;
const TEXT = /\.(md|ts|mts|mjs|js|sh|json|yaml|yml|css|html)$/;

/**
 * A citation runs across a comment's line break, so a break is folded with
 * the comment leader or quote marker that follows it.
 */
function fold(text) {
  return text.replace(/[ \t]*\n[ \t]*(?:\*(?!\/)|\/\/[/!]?|#|>)?[ \t]*/g, " ");
}

const NAMED = /([a-z][a-z0-9-]*\.md)(?:`|\]|\)|\([^)\s]*\))*,?\s+§\s*"([^"]+)"/g;
const BARE = /§\s*"([^"]+)"/g;

let citations = 0;
let cited = 0;
for (const file of tracked) {
  if (RECORD.test(file) || !TEXT.test(file)) continue;
  let text;
  try {
    text = fold(readFileSync(join(repoRoot, file), "utf8"));
  } catch {
    continue;
  }
  if (!text.includes("§")) continue;
  cited++;
  const named = new Set();
  for (const match of text.matchAll(NAMED)) {
    const guide = guides.get(match[1]);
    if (!guide) continue;
    named.add(match.index + match[0].lastIndexOf("§"));
    citations++;
    if (!guide.titles.has(match[2])) {
      failures.push(
        `${file}: ${match[1]} § "${match[2]}" names no section of ${guide.file}`,
      );
    }
  }
  const own = /^docs\/[^/]+\.md$/.test(file) ? guides.get(basename(file)) : null;
  if (!own) continue;
  for (const match of text.matchAll(BARE)) {
    if (named.has(match.index)) continue;
    // Another document's section or a spec's requirement, the document named
    // in code or as a link just before the mark.
    if (/[`\])],?\s*$/.test(text.slice(0, match.index))) continue;
    citations++;
    if (!own.titles.has(match[1])) {
      failures.push(`${file}: § "${match[1]}" names no section of this guide`);
    }
  }
}
if (citations === 0)
  failures.push("no citation of a guide section was found: nothing was held");

if (failures.length > 0) {
  for (const failure of failures) console.error(`✗ guide-sections: ${failure}`);
  console.error(
    "  A heading that is renamed repoints its citations in the same change, and a",
  );
  console.error(
    "  section added gets its row: `node scripts/checks/guide-sections.mjs --list <guide>.md`.",
  );
  process.exit(1);
}
console.log(
  `✓ guide-sections: ${tabled} guides open with every section they have (the largest opening ${largest.bytes} of ${OPENING_BYTES} bytes, ${largest.file}), and ${citations} citations in ${cited} files resolve.`,
);

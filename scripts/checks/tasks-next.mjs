#!/usr/bin/env node
/**
 * A change's `tasks.md` opens with what is next, and stays short enough to
 * read first (`docs/work-management.md` § "A change's tasks open with what is
 * next").
 *
 * A session taking a change reads its tasks before anything else, and the
 * migration's sessions lost their context to it: one change's tasks.md
 * reached 41 KB, most of it finished steps. So, for every change in progress
 * (a directory under `openspec/changes/` holding a `tasks.md`; the archive
 * and drafts aside):
 *
 * 1. the file begins with a `## Next` section: the next task and the open
 *    questions, within `NEXT_LINES` lines and `NEXT_BYTES` bytes;
 * 2. a finished task (`- [x]`), its continuation lines with it, takes at
 *    most `DONE_LINES` lines: its reasoning is in its commit.
 *
 * It fails on a count of changes read under one while any change is in
 * progress, so a moved directory cannot report health over nothing.
 *
 * Usage: `node scripts/checks/tasks-next.mjs`. Exit 1 on any report.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const NEXT_LINES = 20;
const NEXT_BYTES = 1_600;
const DONE_LINES = 3;

const root = fileURLToPath(new URL("../..", import.meta.url));
const changes = join(root, "openspec", "changes");
const failures = [];
let read = 0;

for (const id of readdirSync(changes)) {
  if (id === "archive") continue;
  const file = join(changes, id, "tasks.md");
  if (!existsSync(file)) continue;
  read++;
  const where = `openspec/changes/${id}/tasks.md`;
  const lines = readFileSync(file, "utf8").split("\n");
  if (lines[0] !== "## Next") {
    failures.push(`${where} does not begin with "## Next"`);
  } else {
    const end = lines.findIndex((l, i) => i > 0 && l.startsWith("## "));
    const next = lines.slice(0, end === -1 ? lines.length : end);
    while (next.at(-1) === "") next.pop();
    const bytes = Buffer.byteLength(next.join("\n"));
    if (next.length > NEXT_LINES || bytes > NEXT_BYTES)
      failures.push(
        `${where}: "## Next" is ${next.length} lines and ${bytes} bytes, over ${NEXT_LINES} and ${NEXT_BYTES}`,
      );
  }
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*- \[x\]/.test(lines[i])) continue;
    const indent = lines[i].search(/\S/);
    let n = 1;
    while (
      i + n < lines.length &&
      lines[i + n].trim() !== "" &&
      lines[i + n].search(/\S/) > indent &&
      !/^\s*- \[/.test(lines[i + n])
    )
      n++;
    if (n > DONE_LINES)
      failures.push(
        `${where}:${i + 1}: a finished task of ${n} lines, over ${DONE_LINES}: condense it, its reasoning to its commit`,
      );
  }
}

const inProgress = readdirSync(changes).filter(
  (id) => id !== "archive" && existsSync(join(changes, id, "tasks.md")),
);
if (inProgress.length > 0 && read === 0) failures.push("read no change's tasks.md");

if (failures.length > 0) {
  for (const failure of failures) console.error(`✗ tasks-next: ${failure}`);
  process.exit(1);
}
console.log(
  `✓ tasks-next: ${read} changes' tasks open with "## Next", within ${NEXT_LINES} lines and ${NEXT_BYTES} bytes, each finished task within ${DONE_LINES} lines.`,
);

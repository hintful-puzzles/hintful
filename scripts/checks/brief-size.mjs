#!/usr/bin/env node
/**
 * The files an agent loads without being asked stay inside a bound
 * (`repo-layout`, "The root brief is bounded, and the project's rules live in
 * the README and the guides").
 *
 * Both bounds are needed. The line bound is the one the tool's documentation
 * gives for a file read into every session; the byte bound is there because a
 * line count is met by a file that never wraps.
 *
 * `CLAUDE.md` must resolve to `AGENTS.md`, or the file being measured is not
 * the file being loaded. A file under `.claude/rules/` is held to the same
 * bound, so a path-scoped pointer cannot grow into a second brief.
 */
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_LINES = 200;
const MAX_BYTES = 20_000;

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const failures = [];

const brief = join(repoRoot, "AGENTS.md");
const link = join(repoRoot, "CLAUDE.md");
if (!existsSync(brief)) {
  failures.push("AGENTS.md is missing");
} else if (!existsSync(link) || realpathSync(link) !== realpathSync(brief)) {
  failures.push("CLAUDE.md does not resolve to AGENTS.md");
}

const rulesDir = join(repoRoot, ".claude", "rules");
const measured = existsSync(brief) ? ["AGENTS.md"] : [];
if (existsSync(rulesDir)) {
  for (const entry of readdirSync(rulesDir, { recursive: true })) {
    if (String(entry).endsWith(".md")) {
      measured.push(join(".claude", "rules", String(entry)));
    }
  }
}

for (const file of measured) {
  const bytes = readFileSync(join(repoRoot, file));
  const lines = bytes.toString("utf8").split("\n").length - 1;
  if (lines > MAX_LINES) {
    failures.push(`${file} is ${lines} lines, ${lines - MAX_LINES} over ${MAX_LINES}`);
  }
  if (bytes.length > MAX_BYTES) {
    failures.push(
      `${file} is ${bytes.length} bytes, ${bytes.length - MAX_BYTES} over ${MAX_BYTES}`,
    );
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`✗ brief-size: ${failure}`);
  console.error(
    "  Move the rule to the guide under docs/ for the part of the tree it binds.",
  );
  process.exit(1);
}
console.log(
  `✓ brief-size: ${measured.join(", ")} within ${MAX_LINES} lines and ${MAX_BYTES} bytes.`,
);

#!/usr/bin/env node
/**
 * A spec states rules, and a date or a change id in one is the sign of a
 * history being written into it (`repo-layout`, "A requirement states a rule,
 * and nothing else"). Archiving a change merges its delta's words into the
 * main spec as written, so this is what refuses the words of the change.
 *
 * The length of a requirement is the validator's to bound, and
 * `openspec validate --strict` beside this in the gate does; but it names a
 * long one by its index (`requirements[3]`), and an archive merges many at
 * once. So this names each one over the limit by its file, line and title, in
 * the main specs and in every open change's deltas, as the validator counts
 * (`ruleChars` in `spec-parse.mjs`).
 *
 * A change id is taken by reference: a backticked token that names a
 * directory under `openspec/changes/` or its archive. A capability's own name
 * is not one, though a change may share it.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { capabilityNames, LONGEST, parseSpec, specPath } from "./spec-parse.mjs";

const ARCHIVE = "openspec/changes/archive";
const DATED = /^\d{4}-\d{2}-\d{2}-(.+)$/;
const DATE = /\b20\d\d-\d\d-\d\d\b/;

const capabilities = capabilityNames();
const changeIds = new Set([
  ...readdirSync(ARCHIVE).flatMap((name) => DATED.exec(name)?.[1] ?? []),
  ...readdirSync("openspec/changes").filter((name) => name !== "archive"),
]);
for (const capability of capabilities) changeIds.delete(capability);

const failures = [];
let requirements = 0;
for (const capability of capabilities) {
  const path = specPath(capability);
  const markdown = readFileSync(path, "utf8");
  requirements += parseSpec(markdown).requirements.length;
  markdown.split("\n").forEach((row, index) => {
    if (DATE.test(row))
      failures.push(`${path}:${index + 1}: a date (${DATE.exec(row)[0]})`);
    for (const [, token] of row.matchAll(/`([a-z0-9]+(?:-[a-z0-9]+)+)`/g)) {
      if (changeIds.has(token))
        failures.push(`${path}:${index + 1}: the change id \`${token}\``);
    }
  });
}

const deltas = readdirSync("openspec/changes")
  .filter((name) => name !== "archive")
  .flatMap((change) => {
    const dir = `openspec/changes/${change}/specs`;
    return existsSync(dir) ? readdirSync(dir).map((c) => `${dir}/${c}/spec.md`) : [];
  })
  .filter((path) => existsSync(path));
for (const path of [...capabilities.map(specPath), ...deltas]) {
  for (const r of parseSpec(readFileSync(path, "utf8")).requirements) {
    if (r.chars > LONGEST)
      failures.push(
        `${path}:${r.line}: ${r.chars} characters, over the validator's ${LONGEST}: ${r.title}`,
      );
  }
}

// An archive read that came back empty would pass every spec.
if (capabilities.length === 0 || requirements === 0 || changeIds.size < 100) {
  console.error(
    `✗ spec-form: read ${capabilities.length} capabilities, ${requirements} requirements and ${changeIds.size} change ids, which is too few to have checked anything.`,
  );
  process.exit(1);
}
if (failures.length > 0) {
  for (const failure of failures) console.error(`✗ spec-form: ${failure}`);
  console.error(
    "  A requirement states what must hold, in the present tense, with at most one\n" +
      "  sentence of reason. When it was decided, by which change and what it replaced\n" +
      "  are the archive's; a reason a session needs is in the guide under docs/.\n" +
      "  A long requirement moves its examples into scenarios, or is split in two.",
  );
  process.exit(1);
}
console.log(
  `✓ spec-form: ${requirements} requirements in ${capabilities.length} capabilities, with no date and no change id.`,
);

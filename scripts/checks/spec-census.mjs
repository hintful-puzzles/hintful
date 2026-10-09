#!/usr/bin/env node
/**
 * A census of `openspec/specs/`: how large each group of capabilities is, what
 * a requirement's body holds besides its rule, and how the specs are used.
 * It is a diagnostic and gates nothing; `spec-size.mjs` is what holds a bound.
 *
 *   node scripts/checks/spec-census.mjs              the three tables
 *   node scripts/checks/spec-census.mjs --each       one row a capability as well
 *
 * The shape counts are heuristics over prose and are read as proportions, not
 * as a list of offenders: a past-tense verb also occurs in a rule about undo.
 * A change id is the exception, since it is resolved against the archive.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { capabilityNames, parseSpec, readSpec, shallCount } from "./spec-parse.mjs";

const ARCHIVE = "openspec/changes/archive";
const CHANGES = "openspec/changes";
const DATED = /^(\d{4}-\d{2})-\d{2}-(.+)$/;

const GROUPS = ["The engine", "The games", "The rest"];
function groupOf(capability) {
  if (capability === "ts-engine" || capability.startsWith("engine-")) return GROUPS[0];
  if (existsSync(`src/games/${capability}`)) return GROUPS[1];
  return GROUPS[2];
}

const archived = readdirSync(ARCHIVE).filter((name) => DATED.test(name));
const changeIds = new Set([
  ...archived.map((name) => DATED.exec(name)[2]),
  ...readdirSync(CHANGES).filter((name) => name !== "archive"),
]);

const SHAPES = {
  "past tense": (body) =>
    /\b(was|were|had been|used to|previously|formerly|no longer|replaced|retired|withdrawn|declined|refused|rejected|measured)\b/.test(
      body,
    ),
  "source file": (body) => /[\w/-]+\.(ts|mjs|js|sh|css)\b/.test(body),
  "change id or date": (body) =>
    /\b20\d\d-\d\d-\d\d\b/.test(body) ||
    [...body.matchAll(/`([a-z0-9]+(?:-[a-z0-9]+){2,})`/g)].some((m) =>
      changeIds.has(m[1]),
    ),
};

const specs = capabilityNames().map((capability) => ({
  capability,
  group: groupOf(capability),
  ...readSpec(capability),
}));

function measure(rows) {
  const requirements = rows.flatMap((row) => row.requirements);
  const sum = (pick) => requirements.reduce((total, r) => total + pick(r), 0);
  const share = (test) =>
    requirements.length === 0
      ? "-"
      : `${Math.round((100 * requirements.filter(test).length) / requirements.length)}%`;
  return {
    Capabilities: rows.length,
    Lines: rows.reduce((total, row) => total + row.lines, 0),
    Requirements: requirements.length,
    "Body lines": sum((r) => r.bodyLines),
    "Scenario lines": sum((r) => r.scenarioLines),
    Scenarios: sum((r) => r.scenarios.length),
    "Body > 500": requirements.filter((r) => r.chars > 500).length,
    "Body > 2000": requirements.filter((r) => r.chars > 2000).length,
    "Longest (lines)": Math.max(
      0,
      ...requirements.map((r) => r.text.split("\n").length),
    ),
    "SHALL each": requirements.length
      ? (sum((r) => shallCount(r.text)) / requirements.length).toFixed(1)
      : "-",
    ...Object.fromEntries(
      Object.entries(SHAPES).map(([name, test]) => [name, share((r) => test(r.body))]),
    ),
  };
}

function table(rows) {
  const columns = Object.keys(rows[0]);
  const line = (cells) => `| ${cells.join(" | ")} |`;
  return [
    line(columns),
    line(columns.map(() => "---")),
    ...rows.map((row) => line(columns.map((column) => String(row[column])))),
  ].join("\n");
}

// `--file <path>...` measures spec files wherever they are, such as a rewrite
// that is not yet a capability's own `spec.md`, and prints nothing else.
const fileFlag = process.argv.indexOf("--file");
if (fileFlag !== -1) {
  const files = process.argv.slice(fileFlag + 1);
  console.log(
    table(
      files.map((file) => {
        const spec = parseSpec(readFileSync(file, "utf8"));
        const longest = Math.max(0, ...spec.requirements.map((r) => r.chars));
        for (const r of spec.requirements) {
          if (r.chars > 500)
            console.error(`${file}: ${r.chars} characters: ${r.title}`);
          if (r.scenarios.length === 0)
            console.error(`${file}: no scenario: ${r.title}`);
        }
        return { "": file, ...measure([spec]), "Longest body (chars)": longest };
      }),
    ),
  );
  process.exit(0);
}

console.log("## Size, and what a requirement's body holds\n");
console.log(
  table([
    ...GROUPS.map((group) => ({
      "": group,
      ...measure(specs.filter((spec) => spec.group === group)),
    })),
    { "": "All", ...measure(specs) },
  ]),
);

if (process.argv.includes("--each")) {
  console.log("\n## Each capability\n");
  console.log(
    table(specs.map((spec) => ({ "": spec.capability, ...measure([spec]) }))),
  );
}

// --- Use: what the archive's deltas did, by month. ---
const VERB = /^## (ADDED|MODIFIED|REMOVED|RENAMED) Requirements\s*$/;
const byMonth = new Map();
let deltaFiles = 0;
for (const name of archived) {
  const month = DATED.exec(name)[1];
  const dir = `${ARCHIVE}/${name}/specs`;
  if (!existsSync(dir)) continue;
  for (const capability of readdirSync(dir)) {
    const file = `${dir}/${capability}/spec.md`;
    if (!existsSync(file)) continue;
    deltaFiles += 1;
    const markdown = readFileSync(file, "utf8");
    // A delta's verb is a `##` section, which the parser closes a requirement
    // on, so each section is parsed by itself under a heading it keeps.
    let verb = null;
    let rows = [];
    const flush = () => {
      if (verb === null) return;
      const counts = byMonth.get(month) ?? {
        ADDED: 0,
        MODIFIED: 0,
        REMOVED: 0,
        RENAMED: 0,
      };
      counts[verb] += parseSpec(rows.join("\n")).requirements.length;
      byMonth.set(month, counts);
    };
    for (const row of markdown.split("\n")) {
      const section = VERB.exec(row);
      if (section) {
        flush();
        verb = section[1];
        rows = [];
      } else {
        rows.push(row);
      }
    }
    flush();
  }
}
const months = [...byMonth.keys()].sort();
const total = { ADDED: 0, MODIFIED: 0, REMOVED: 0, RENAMED: 0 };
for (const counts of byMonth.values()) {
  for (const verb of Object.keys(total)) total[verb] += counts[verb];
}
console.log(
  `\n## The archive's deltas (${archived.length} changes, ${deltaFiles} delta files)\n`,
);
console.log(
  table([
    ...months.map((month) => ({ Month: month, ...byMonth.get(month) })),
    { Month: "All", ...total },
  ]),
);

// --- Use: a requirement cited by its title outside `openspec/`. ---
// A citation wraps, inside a comment as often as not, so the text is folded:
// a line break with its comment leader reads as one space. The key is the
// first 40 characters of the title, which a paraphrase does not carry.
const fold = (text) =>
  text.replace(/\s*\n\s*(?:\*|\/\/|#|>)?\s*/g, " ").replace(/\s+/g, " ");
const tracked = execFileSync(
  "git",
  ["ls-files", "src", "docs", "scripts", "AGENTS.md"],
  {
    encoding: "utf8",
    maxBuffer: 1 << 26,
  },
)
  .split("\n")
  .filter((file) => /\.(ts|mjs|js|md|sh|css|json|yaml)$/.test(file));
const haystacks = tracked.map((file) => ({
  file,
  text: fold(readFileSync(file, "utf8")),
}));
const cited = specs.map((spec) => ({
  group: spec.group,
  total: spec.requirements.length,
  cited: spec.requirements.filter((r) => {
    const key = fold(r.title).slice(0, 40);
    return haystacks.some((h) => h.text.includes(key));
  }).length,
}));
console.log(`\n## Requirements cited by title (${tracked.length} files read)\n`);
console.log(
  table(
    GROUPS.map((group) => {
      const rows = cited.filter((row) => row.group === group);
      return {
        "": group,
        Requirements: rows.reduce((n, row) => n + row.total, 0),
        "Cited outside openspec/": rows.reduce((n, row) => n + row.cited, 0),
      };
    }),
  ),
);

if (specs.length === 0 || archived.length === 0 || tracked.length === 0) {
  console.error(
    "✗ spec-census: an input was empty, so a table above measured nothing.",
  );
  process.exit(1);
}

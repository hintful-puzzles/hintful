/**
 * Reads a `spec.md` into its requirements, for the scripts that measure the
 * specs and hold them to a size. A heading inside a fenced code block is text,
 * which is the one case a line-by-line read of the headings gets wrong.
 */
import { readdirSync, readFileSync } from "node:fs";

export const SPECS_DIR = "openspec/specs";

const REQUIREMENT = /^### Requirement:\s*(.+?)\s*$/;
const SCENARIO = /^#### Scenario:\s*(.+?)\s*$/;
const SECTION = /^##? /;
const FENCE = /^\s*(```|~~~)/;

/**
 * @typedef {object} Requirement
 * @property {string} title
 * @property {number} line        1-based line of the heading
 * @property {string} body        the text between the heading and the first scenario, trimmed
 * @property {number} bodyLines   lines of that text, blank ones included
 * @property {number} chars       the length openspec's validator bounds: see `ruleChars`
 * @property {{name: string, text: string}[]} scenarios
 * @property {number} scenarioLines
 * @property {string} text        heading to the line before the next requirement
 */

/**
 * @param {string} markdown
 * @returns {{lines: number, requirements: Requirement[]}}
 */
export function parseSpec(markdown) {
  const lines = markdown.split("\n");
  /** @type {Requirement[]} */
  const requirements = [];
  let current = null;
  let scenario = null;
  let fenced = false;

  const close = () => {
    if (!current) return;
    const trimTail = (rows) => {
      const kept = [...rows];
      while (kept.length > 0 && kept[kept.length - 1].trim() === "") kept.pop();
      return kept;
    };
    const body = trimTail(current.bodyRows);
    while (body.length > 0 && body[0].trim() === "") body.shift();
    requirements.push({
      title: current.title,
      line: current.line,
      body: body.join("\n"),
      bodyLines: body.length,
      chars: ruleChars(body),
      scenarios: current.scenarios.map((s) => ({
        name: s.name,
        text: trimTail(s.rows).join("\n"),
      })),
      scenarioLines: current.scenarios.reduce(
        (sum, s) => sum + 1 + trimTail(s.rows).length,
        0,
      ),
      text: trimTail(current.rows).join("\n"),
    });
    current = null;
    scenario = null;
  };

  lines.forEach((row, index) => {
    if (FENCE.test(row)) fenced = !fenced;
    const heading = !fenced;
    const requirement = heading ? REQUIREMENT.exec(row) : null;
    if (requirement) {
      close();
      current = {
        title: requirement[1],
        line: index + 1,
        rows: [row],
        bodyRows: [],
        scenarios: [],
      };
      return;
    }
    if (heading && SECTION.test(row)) {
      close();
      return;
    }
    if (!current) return;
    current.rows.push(row);
    const named = heading ? SCENARIO.exec(row) : null;
    if (named) {
      scenario = { name: named[1], rows: [] };
      current.scenarios.push(scenario);
    } else if (scenario) {
      scenario.rows.push(row);
    } else {
      current.bodyRows.push(row);
    }
  });
  close();

  // A file ends with a newline, which `split` reports as one more row.
  const count = markdown.endsWith("\n") ? lines.length - 1 : lines.length;
  return { lines: count, requirements };
}

/**
 * A requirement's length as openspec's validator takes it, from 1.14.1: the
 * lines before the first scenario, outside a code fence, trimmed, with the
 * blank ones dropped and the rest joined by a newline
 * (`extractRequirementBody` in the tool's `parsers/requirement-text.js`).
 */
function ruleChars(rows) {
  let fenced = false;
  const kept = [];
  for (const row of rows) {
    if (FENCE.test(row)) {
      fenced = !fenced;
      continue;
    }
    if (!fenced && row.trim() !== "") kept.push(row.trim());
  }
  return kept.join("\n").length;
}

/** Every capability under `openspec/specs/`, by name. */
export function capabilityNames() {
  return readdirSync(SPECS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function specPath(capability) {
  return `${SPECS_DIR}/${capability}/spec.md`;
}

export function readSpec(capability) {
  return parseSpec(readFileSync(specPath(capability), "utf8"));
}

/** How many times a requirement obliges: `SHALL` and `SHALL NOT` alike. */
export function shallCount(text) {
  return (text.match(/\bSHALL\b/g) ?? []).length;
}

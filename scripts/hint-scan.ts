/**
 * Scan a hint test's positions again and write its pins:
 * `npm run hint-scan -- <test file> [--all]`.
 *
 * A test file pins the positions its hint tests read through
 * `describeHintPins` (`src/engine/testing/hint-positions.ts`). This runs the
 * file's scan, which walks hint-guided play and reports a position for each
 * kind, and writes the report into the file's `pins: { … }`, each pin under
 * how many of the positions walked it held on.
 *
 * - **A pin that still fires is left alone**, since tests and snapshots are
 *   written against its board; `--all` replaces every pin the scan found.
 * - **A pin the scan found no position for is left alone too**, and named: it
 *   is one kept by hand, for a kind this scan's line of play does not reach.
 * - **A kind with no pin and no position found is named**, and the exit code
 *   is 1: pin it by hand, or list the rung in `unreached` with why.
 * - **A file that declares no scan fails**, so an empty result is not read as
 *   health; so does one that failed to collect, with vitest's own error.
 *
 * It writes only the test file it was given.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import ts from "typescript";
import {
  type HintScanReport,
  SCAN_REPORT_MARK,
} from "../src/engine/testing/hint-scan-report.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const DECLARERS = new Set(["describeHintPins", "describeHintKindPins"]);

function fail(message: string): never {
  console.error(`hint-scan: ${message}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const all = args.includes("--all");
const files = args.filter((a) => !a.startsWith("--"));
if (files.length !== 1) fail("usage: npm run hint-scan -- <test file> [--all]");
const file = path.relative(ROOT, path.resolve(files[0]));
if (file.startsWith("..") || !file.endsWith(".test.ts"))
  fail(`${files[0]} is not a test file of this repo`);

interface VitestJson {
  testResults: {
    message?: string;
    assertionResults: { title: string; failureMessages: string[] }[];
  }[];
}

/** Run the file's scans, and return their reports in the order declared. */
function scan(): HintScanReport[] {
  const out = mkdtempSync(path.join(tmpdir(), "hint-scan-"));
  const json = path.join(out, "report.json");
  try {
    const run = spawnSync(
      "npx",
      ["vitest", "run", file, "--reporter=json", `--outputFile=${json}`],
      {
        cwd: ROOT,
        env: { ...process.env, HINT_SCAN: "1" },
        stdio: ["ignore", "ignore", "pipe"],
        encoding: "utf8",
      },
    );
    let result: VitestJson;
    try {
      result = JSON.parse(readFileSync(json, "utf8")) as VitestJson;
    } catch {
      fail(`vitest wrote no report for ${file}:\n${run.stderr}`);
    }
    const reports: HintScanReport[] = [];
    for (const t of result.testResults)
      for (const a of t.assertionResults) {
        if (!a.title.startsWith("scan (HINT_SCAN)")) continue;
        const line = a.failureMessages
          .join("\n")
          .split("\n")
          .find((l) => l.includes(SCAN_REPORT_MARK));
        if (!line) fail(`a scan of ${file} failed:\n${a.failureMessages.join("\n")}`);
        reports.push(
          JSON.parse(
            line.slice(line.indexOf(SCAN_REPORT_MARK) + SCAN_REPORT_MARK.length),
          ),
        );
      }
    if (reports.length === 0) {
      const errors = result.testResults.map((t) => t.message ?? "").join("\n");
      fail(
        errors.trim()
          ? `${file} failed before any scan ran:\n${errors}`
          : `${file} declares no scan: it has no describeHintPins call`,
      );
    }
    return reports;
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

/** The object literal `pins` is: written in the call, or a `const` of this
 * file that the call names, which a test file uses when it reads the pins by
 * name elsewhere. Null for anything else (an import, a computed value). */
function literalOf(
  source: ts.SourceFile,
  value: ts.Expression,
): ts.ObjectLiteralExpression | null {
  let at: ts.Expression = value;
  if (ts.isIdentifier(at)) {
    const name = at.text;
    const declared = source.statements
      .filter(ts.isVariableStatement)
      .flatMap((s) => [...s.declarationList.declarations])
      .find((d) => ts.isIdentifier(d.name) && d.name.text === name);
    if (!declared?.initializer) return null;
    at = declared.initializer;
  }
  while (ts.isAsExpression(at) || ts.isSatisfiesExpression(at)) at = at.expression;
  return ts.isObjectLiteralExpression(at) ? at : null;
}

/** The `pins` object literal of each declaring call, in source order; null
 * where a call's pins are not a literal this file holds. */
function pinBlocks(source: ts.SourceFile): (ts.ObjectLiteralExpression | null)[] {
  const blocks: (ts.ObjectLiteralExpression | null)[] = [];
  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      DECLARERS.has(node.expression.text)
    ) {
      const spec = node.arguments[0];
      const pins =
        spec && ts.isObjectLiteralExpression(spec)
          ? spec.properties.find(
              (p): p is ts.PropertyAssignment =>
                ts.isPropertyAssignment(p) && p.name.getText(source) === "pins",
            )
          : undefined;
      blocks.push(pins ? literalOf(source, pins.initializer) : null);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return blocks;
}

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const HELD = /Held on \d+ of \d+ positions walked\./;

/** One block's new text, and what was done for each kind. */
function rewrite(
  source: ts.SourceFile,
  block: ts.ObjectLiteralExpression,
  report: HintScanReport,
): { text: string; log: string[]; missing: number } {
  const text = source.getFullText();
  /** Each property as written, with the comments above it. */
  const written = new Map<string, string>();
  const others: string[] = [];
  for (const p of block.properties) {
    const own = text.slice(p.getFullStart(), p.getEnd()).trim();
    const name =
      ts.isPropertyAssignment(p) &&
      (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))
        ? p.name.text
        : null;
    if (name === null) others.push(own);
    else written.set(name, own);
  }
  const log: string[] = [];
  const entries: string[] = [...others];
  let missing = 0;
  const held = (n: number): string =>
    `Held on ${n} of ${report.walked} positions walked.`;
  for (const [name, kind] of Object.entries(report.kinds)) {
    const was = written.get(name);
    written.delete(name);
    const key = IDENTIFIER.test(name) ? name : JSON.stringify(name);
    const fresh =
      kind.pin === null ? null : `/** ${held(kind.held)} */\n${key}: ${kind.pin}`;
    const count = `${String(kind.held).padStart(6)}  ${name}`;
    if (was !== undefined && kind.kept && !all) {
      // The pin stands; only its count is brought up to date.
      entries.push(kind.held > 0 ? was.replace(HELD, held(kind.held)) : was);
      log.push(
        `${count}: kept${kind.held === 0 ? " (by hand: the scan reaches none)" : ""}`,
      );
    } else if (fresh !== null) {
      entries.push(fresh);
      log.push(`${count}: ${was === undefined ? "pinned" : "pinned again"}`);
    } else if (was !== undefined) {
      entries.push(was);
      if (kind.kept) log.push(`${count}: kept (by hand: the scan reaches none)`);
      else {
        missing++;
        log.push(`${count}: STALE, and the scan found no position`);
      }
    } else {
      missing++;
      log.push(`${count}: NOT FOUND (pin one by hand, or list it in unreached)`);
    }
  }
  for (const name of written.keys())
    log.push(`        ${name}: dropped (no such kind)`);
  for (const [name, kind] of Object.entries(report.unreached))
    log.push(
      kind.held === 0
        ? `${String(0).padStart(6)}  ${name}: unreached, as listed`
        : `${String(kind.held).padStart(6)}  ${name}: listed unreached, but fires. Pin it: ${kind.pin}`,
    );
  return { text: `{\n${entries.map((e) => `${e},`).join("\n")}\n}`, log, missing };
}

const reports = scan();
const sourcePath = path.join(ROOT, file);
const original = readFileSync(sourcePath, "utf8");
const source = ts.createSourceFile(file, original, ts.ScriptTarget.Latest, true);
const blocks = pinBlocks(source);
if (blocks.length !== reports.length)
  fail(
    `${file} has ${blocks.length} describeHintPins calls and ran ${reports.length} scans; ` +
      "a call in a loop or behind a condition is not one this can write",
  );

let next = original;
let missing = 0;
const logs: string[] = [];
// Last block first, so an earlier block's offsets still hold.
for (let i = blocks.length - 1; i >= 0; i--) {
  const block = blocks[i];
  const report = reports[i];
  const head = `${report.game}: ${report.walked} positions walked on ${report.boards} boards`;
  if (block === null) {
    // Pins kept in another module: printed, to be pasted there by hand.
    const found = Object.entries(report.kinds).map(
      ([name, kind]) =>
        `${String(kind.held).padStart(6)}  ${name}: ${kind.kept ? "kept" : (kind.pin ?? "NOT FOUND")}`,
    );
    logs.unshift(
      `${head}\n  its pins are not a literal in the call: nothing written\n${found.join("\n")}`,
    );
    continue;
  }
  const done = rewrite(source, block, report);
  missing += done.missing;
  logs.unshift(`${head}\n${done.log.join("\n")}`);
  next = next.slice(0, block.getStart(source)) + done.text + next.slice(block.getEnd());
}
if (next !== original) {
  writeFileSync(sourcePath, next);
  spawnSync("npx", ["biome", "format", "--write", file], {
    cwd: ROOT,
    stdio: "ignore",
  });
}
console.log(logs.join("\n\n"));
console.log(
  next === original ? `\n${file}: every pin stands` : `\n${file}: pins written`,
);
process.exit(missing > 0 ? 1 : 0);

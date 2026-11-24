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
 * - **A pin that does not load cannot stop the scan.** The file runs with
 *   `HINT_SCAN` set, under which a `pinned()` call whose pin does not load
 *   returns a stand-in and does not throw, so one in a `describe` body still
 *   lets the file be collected and its scan run.
 *
 * A born game's pins are its `<game>.cases.yaml`'s `hint.pins`: given that
 * file, this runs the guard that reads it for that game alone, and writes
 * the pins there, keeping the file's comments.
 *
 * It ends by running `hint-quality` for the scanned games, so a wording its
 * rules refuse is named here, beside the pins, and the exit code is 1.
 *
 * It prints a line as the scan finishes each board, so a scan of several
 * minutes is seen to move and how far it has to go; `hint.seeds` (12 when
 * omitted) is how many boards each params deals.
 *
 * It writes only the file it was given.
 */
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createInterface } from "node:readline";
import ts from "typescript";
import {
  type Document,
  isMap,
  isScalar,
  isSeq,
  Pair,
  parseDocument,
  type Scalar,
  YAMLMap,
} from "yaml";
import {
  type HintScanReport,
  type KindScanReport,
  SCAN_PROGRESS_MARK,
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
/** A born game's cases file is scanned through the guard that reads it, with
 * only that game's cases declared. */
const CASES = /\.cases\.yaml$/;
const casesGame = CASES.test(file) ? path.basename(file).replace(CASES, "") : null;
const testFile = casesGame === null ? file : "src/guards/born-game-cases.test.ts";
if (file.startsWith("..") || !(file.endsWith(".test.ts") || casesGame !== null))
  fail(`${files[0]} is not a test file or a cases file of this repo`);

interface VitestJson {
  testResults: {
    message?: string;
    assertionResults: { title: string; failureMessages: string[] }[];
  }[];
}

/** Run the file's scans, and return their reports in the order declared. */
/** Run vitest on the file's scans, passing each board's progress line on as
 * it comes, and resolve with everything else it wrote to stderr. */
function runScan(json: string): Promise<string> {
  const child = spawn(
    "npx",
    ["vitest", "run", testFile, "--reporter=json", `--outputFile=${json}`],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        HINT_SCAN: "1",
        ...(casesGame === null ? {} : { GAME_CASES: casesGame }),
      },
      stdio: ["ignore", "ignore", "pipe"],
    },
  );
  let stderr = "";
  const lines = createInterface({ input: child.stderr });
  lines.on("line", (line) => {
    const at = line.indexOf(SCAN_PROGRESS_MARK);
    if (at >= 0) console.log(line.slice(at + SCAN_PROGRESS_MARK.length));
    else stderr += `${line}\n`;
  });
  const read = new Promise<void>((resolve) => lines.on("close", resolve));
  const exited = new Promise<void>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", () => resolve());
  });
  return Promise.all([read, exited]).then(() => stderr);
}

async function scan(): Promise<HintScanReport[]> {
  const out = mkdtempSync(path.join(tmpdir(), "hint-scan-"));
  const json = path.join(out, "report.json");
  try {
    const stderr = await runScan(json);
    let result: VitestJson;
    try {
      result = JSON.parse(readFileSync(json, "utf8")) as VitestJson;
    } catch {
      fail(`vitest wrote no report for ${file}:\n${stderr}`);
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
          : `${file} declares no scan: it has no ${casesGame === null ? "describeHintPins call" : "hint section"}`,
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

/** A position as a cases file writes it: the ID quoted, each move a map on
 * its own line. */
function positionNode(
  doc: Document,
  position: NonNullable<KindScanReport["position"]>,
) {
  const quoted = (id: string) => {
    const s = doc.createNode(id) as Scalar;
    s.type = "QUOTE_DOUBLE";
    return s;
  };
  if (typeof position === "string") return quoted(position);
  const node = doc.createNode({ id: position.id, moves: position.moves }) as YAMLMap;
  node.set("id", quoted(position.id));
  const moves = node.get("moves", true);
  if (isSeq(moves))
    for (const m of moves.items) if (isMap(m) || isSeq(m)) m.flow = true;
  return node;
}

/** Write the one report into the cases file's `hint.pins`, as {@link rewrite}
 * does a test file's, keeping the file's comments. */
function writeCases(reports: readonly HintScanReport[]): never {
  if (reports.length !== 1) fail(`${file} ran ${reports.length} scans, not one`);
  const report = reports[0];
  const sourcePath = path.join(ROOT, file);
  const original = readFileSync(sourcePath, "utf8");
  const doc = parseDocument(original, { version: "1.2", schema: "core" });
  const hint = doc.get("hint", true);
  if (!isMap(hint)) fail(`${file} has no hint section`);
  const pins = hint.get("pins", true);
  const written = new Map<string, Pair>();
  if (isMap(pins))
    for (const pair of pins.items)
      if (isScalar(pair.key)) written.set(String(pair.key.value), pair as Pair);
  const held = (n: number): string =>
    ` Held on ${n} of ${report.walked} positions walked.`;
  const next = new YAMLMap();
  const log: string[] = [];
  let missing = 0;
  for (const [name, kind] of Object.entries(report.kinds)) {
    const was = written.get(name);
    written.delete(name);
    const count = `${String(kind.held).padStart(6)}  ${name}`;
    if (was !== undefined && kind.kept && !all) {
      if (kind.held > 0 && isScalar(was.key)) was.key.commentBefore = held(kind.held);
      next.items.push(was);
      log.push(
        `${count}: kept${kind.held === 0 ? " (by hand: the scan reaches none)" : ""}`,
      );
    } else if (kind.position !== null) {
      const key = doc.createNode(name) as Scalar;
      key.commentBefore = held(kind.held);
      next.items.push(new Pair(key, positionNode(doc, kind.position)));
      log.push(`${count}: ${was === undefined ? "pinned" : "pinned again"}`);
    } else if (was !== undefined) {
      next.items.push(was);
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
  hint.set("pins", next);
  const text = doc.toString({ lineWidth: 0, flowCollectionPadding: false });
  if (text !== original) writeFileSync(sourcePath, text);
  console.log(
    `${report.game}: ${report.walked} positions walked on ${report.boards} boards\n${log.join("\n")}`,
  );
  console.log(
    text === original ? `\n${file}: every pin stands` : `\n${file}: pins written`,
  );
  finish(missing, [report.game]);
}

/**
 * Hold the scanned games' hint wording to `hint-quality`'s rules (a
 * deduction's necessity voice, the length a glance takes) and exit: 1 where a
 * kind went unpinned or a rule refused. The guard runs scoped to the games as
 * a commit staging them runs it, so its ledgers are the one copy, and a
 * wording is refused while the porter is still writing it, not first in
 * `test:hint-sweeps`.
 */
function finish(missing: number, games: readonly string[]): never {
  const out = mkdtempSync(path.join(tmpdir(), "hint-scan-quality-"));
  const json = path.join(out, "report.json");
  let refused: string[];
  try {
    spawnSync(
      "npx",
      [
        "vitest",
        "run",
        "src/guards/hint-quality.test.ts",
        "--reporter=json",
        `--outputFile=${json}`,
      ],
      {
        cwd: ROOT,
        env: { ...process.env, GATE_PRECOMMIT: "1", GATE_GAME_SCOPE: games.join(",") },
        stdio: "ignore",
      },
    );
    let result: VitestJson;
    try {
      result = JSON.parse(readFileSync(json, "utf8")) as VitestJson;
    } catch {
      fail("hint-quality wrote no report");
    }
    refused = result.testResults.flatMap((t) =>
      t.assertionResults
        .filter((a) => a.failureMessages.length > 0)
        .map((a) => `${a.title}\n  ${a.failureMessages[0].split("\n")[0]}`),
    );
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
  console.log(
    refused.length === 0
      ? `hint-quality: ${games.join(", ")}'s wording holds`
      : `\nhint-quality refuses ${refused.length}:\n${refused.join("\n")}`,
  );
  process.exit(missing > 0 || refused.length > 0 ? 1 : 0);
}

const reports = await scan();
if (casesGame !== null) writeCases(reports);
const sourcePath = path.join(ROOT, file);
const original = readFileSync(sourcePath, "utf8");
const source = ts.createSourceFile(file, original, ts.ScriptTarget.Latest, true);
const blocks = pinBlocks(source);
/** A report's pins as found, to be pasted by hand into a module the file
 * reads them from. */
const printed = (report: HintScanReport): string =>
  `${report.game}: ${report.walked} positions walked on ${report.boards} boards\n` +
  "  its pins are not a literal in the call: nothing written\n" +
  Object.entries(report.kinds)
    .map(
      ([name, kind]) =>
        `${String(kind.held).padStart(6)}  ${name}: ${kind.kept ? "kept" : (kind.pin ?? "NOT FOUND")}`,
    )
    .join("\n");
// A call in a loop runs a scan a pass, and its pins come from outside the call,
// so nothing can be written there: each report is printed, to be pasted by hand.
if (blocks.length === 1 && reports.length > 1) {
  console.log(reports.map(printed).join("\n\n"));
  process.exit(0);
}
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
    logs.unshift(printed(report));
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
finish(
  missing,
  reports.map((r) => r.game),
);

#!/usr/bin/env node
/**
 * One spelling of "nothing here" (`ts-engine`, "Absence has one spelling") — a
 * gate step, and `npm run absence` to run it alone.
 *
 * **The rule it holds.** A value that may be absent is typed `T | null`. The
 * word `undefined` is left to what the language means by it, *not supplied*: an
 * optional parameter or member is written `?`, and a value the language produced
 * that way (`?.`, `Map.get`, an index read) is converted with `?? null` where it
 * enters a declared type. `docs/games/mechanics.md` § "Absence is `null`" has the
 * reasons; the ones that decide a guard's shape are two:
 *
 * - **It is checkable by syntax alone, with no ledger.** `undefined` written as a
 *   member of a union is the whole finding. The rule the other way round would
 *   have to exempt every `null` in a move or a save, and no declaration says which
 *   types those are.
 * - **The respelling it asks for is the one the compiler will not check.**
 *   `x === null` compiles against `number | undefined` and is simply false, so a
 *   helper moved from one word to the other can leave a dead comparison behind
 *   it with the suite green. The second half of this file finds those.
 *
 * **What is not a finding.**
 * - A **cast** (`as T | undefined`). It declares nothing; it describes a value
 *   the language already produced, usually `step?.highlights` on an optional
 *   member, and writing `null` there would be a false claim about that value.
 * - A **strict comparison against an index read** (`arr[i] === undefined`).
 *   `noUncheckedIndexedAccess` is off (`tsconfig.json` says why), so an
 *   out-of-bounds read is typed as the element while being `undefined`, and that
 *   comparison is the bounds check rather than a dead one.
 * - A **generic or `any`/`unknown` operand**, whose absent words the checker
 *   cannot know here.
 *
 * **Blind spots.** It reads what the tree *writes*. An unannotated function whose
 * inferred return carries `undefined` is not a finding, and neither is a loose
 * `== null`, which matches both words and so cannot go dead.
 *
 * It proves both halves on every run against fixtures parsed in memory, and
 * floors what it examined, because a guard that stops matching reports a clean
 * tree.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const FLOORS = { files: 700, unions: 1000, comparisons: 300 };

const fail = (msg) => {
  console.error(`absence-spelling: ${msg}`);
  process.exit(1);
};

const lineOf = (sf, node) =>
  sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

/** Is `node` inside a cast, where a union describes rather than declares? The
 * walk climbs through the members and parameters of an inline type, so a union
 * nested in `as { env?: Record<string, string | undefined> }` is still a cast. */
function inCast(node) {
  for (let n = node.parent; n; n = n.parent) {
    if (
      ts.isAsExpression(n) ||
      ts.isTypeAssertionExpression(n) ||
      ts.isSatisfiesExpression(n)
    )
      return true;
    const typePart =
      ts.isTypeNode(n) ||
      ts.isTypeElement(n) ||
      (ts.isParameter(n) && ts.isFunctionTypeNode(n.parent));
    if (!typePart) return false;
  }
  return false;
}

/** Every union that writes `undefined` as a member, outside a cast. */
export function spelledUndefined(sf) {
  const found = [];
  let unions = 0;
  const visit = (node) => {
    if (ts.isUnionTypeNode(node)) {
      unions++;
      if (
        node.types.some((m) => m.kind === ts.SyntaxKind.UndefinedKeyword) &&
        !inCast(node)
      )
        found.push({ line: lineOf(sf, node), text: node.getText(sf) });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return { found, unions };
}

const STRICT = new Set([
  ts.SyntaxKind.EqualsEqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsEqualsToken,
]);
const isNullWord = (e) => e.kind === ts.SyntaxKind.NullKeyword;
const isUndefinedWord = (e) => ts.isIdentifier(e) && e.text === "undefined";
const OPAQUE =
  ts.TypeFlags.Any |
  ts.TypeFlags.Unknown |
  ts.TypeFlags.TypeParameter |
  ts.TypeFlags.Index |
  ts.TypeFlags.IndexedAccess |
  ts.TypeFlags.Conditional |
  ts.TypeFlags.Substitution;

/** Strict comparisons against the absent word the operand's type cannot hold,
 * when it can hold the other one. */
export function deadComparisons(sf, checker) {
  const found = [];
  let comparisons = 0;
  const visit = (node) => {
    if (ts.isBinaryExpression(node) && STRICT.has(node.operatorToken.kind)) {
      const sides = [node.left, node.right];
      const word = sides.find((s) => isNullWord(s) || isUndefinedWord(s));
      if (word) {
        comparisons++;
        const operand = sides.find((s) => s !== word);
        let inner = operand;
        while (ts.isParenthesizedExpression(inner)) inner = inner.expression;
        if (!ts.isElementAccessExpression(inner)) {
          const type = checker.getTypeAtLocation(operand);
          const parts = type.isUnion() ? type.types : [type];
          if (!parts.some((p) => p.flags & OPAQUE)) {
            const holdsNull = parts.some((p) => p.flags & ts.TypeFlags.Null);
            const holdsUndefined = parts.some(
              (p) => p.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void),
            );
            const dead = isNullWord(word)
              ? holdsUndefined && !holdsNull
              : holdsNull && !holdsUndefined;
            if (dead)
              found.push({
                line: lineOf(sf, node),
                text: `${node.getText(sf)}  (operand is ${checker.typeToString(type)})`,
              });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return { found, comparisons };
}

// --- The guard proves itself before it is trusted. ---

const FIXTURE = `
export function a(): number | undefined { return 1; }
export function b(x: string | undefined): void { void x; }
export function c(): number | null { return null; }
export function d(x?: string): string | null { return x ?? null; }
export const e = (v: unknown) => v as number | undefined;
export function f(x: number | undefined): boolean { return x === null; }
export function g(x: number | null): boolean { return x !== undefined; }
export function h(x: number | null): boolean { return x === null; }
export function i(xs: (number | null)[], k: number): boolean { return xs[k] === undefined; }
export function j<T>(x: T): boolean { return x === null; }
export const k = (v: unknown) => v as { env?: Record<string, string | undefined> };
interface L { a: string | undefined }
`;
{
  const name = "/absence-fixture.ts";
  const sf = ts.createSourceFile(name, FIXTURE, ts.ScriptTarget.Latest, true);
  const spelled = spelledUndefined(sf).found.map((f) => f.line);
  const host = ts.createCompilerHost({ strict: true, noEmit: true });
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (f, ...rest) => (f === name ? sf : getSourceFile(f, ...rest));
  const program = ts.createProgram({
    rootNames: [name],
    options: { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022 },
    host,
  });
  const dead = deadComparisons(sf, program.getTypeChecker()).found.map((f) => f.line);
  // a, b and f spell it (f's parameter, not its comparison), and so does L's
  // member; the casts in e and k do not, however deep the union sits.
  if (JSON.stringify(spelled) !== JSON.stringify([2, 3, 7, 13]))
    fail(`self-check: expected the unions on lines 2, 3, 7 and 13, got ${spelled}`);
  // f and g are dead; h is live, i is an index read, j is generic.
  if (JSON.stringify(dead) !== JSON.stringify([7, 8]))
    fail(`self-check: expected dead comparisons on lines 7 and 8, got ${dead}`);
}

// --- The scan. ---

const root = process.cwd();
const files = execFileSync("git", ["ls-files", "-z", "*.ts"], { encoding: "utf8" })
  .split("\0")
  .filter((f) => f && !f.endsWith(".d.ts"));
if (files.length < FLOORS.files)
  fail(
    `listed only ${files.length} files (floor ${FLOORS.files}) — the listing is broken`,
  );

const findings = [];
let unions = 0;
for (const file of files) {
  const sf = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const r = spelledUndefined(sf);
  unions += r.unions;
  for (const f of r.found) findings.push(`${file}:${f.line}  ${f.text}`);
}
if (unions < FLOORS.unions)
  fail(
    `parsed only ${unions} union types (floor ${FLOORS.unions}) — the parse stopped matching`,
  );

// One program over both projects' files. The build-side project imports most of
// `src/`, so a program per project checks that half of the tree twice; its
// options are the app's plus Node's types, a superset every file checks under.
const parse = (project) =>
  ts.parseJsonConfigFileContent(
    ts.readConfigFile(path.join(root, project), ts.sys.readFile).config,
    ts.sys,
    root,
  );
const app = parse("tsconfig.json");
const build = parse("tsconfig.node.json");
const program = ts.createProgram(
  [...new Set([...app.fileNames, ...build.fileNames])],
  build.options,
);
const checker = program.getTypeChecker();
const dead = [];
let comparisons = 0;
for (const sf of program.getSourceFiles()) {
  const rel = path.relative(root, sf.fileName);
  if (rel.startsWith("..") || rel.includes("node_modules") || sf.isDeclarationFile)
    continue;
  const r = deadComparisons(sf, checker);
  comparisons += r.comparisons;
  for (const f of r.found) dead.push(`${rel}:${f.line}  ${f.text}`);
}
if (comparisons < FLOORS.comparisons)
  fail(
    `examined only ${comparisons} strict comparisons (floor ${FLOORS.comparisons}) — the program did not load`,
  );

if (findings.length || dead.length) {
  if (findings.length) {
    console.error(
      `absence-spelling: ${findings.length} union(s) spell absence \`undefined\`:`,
    );
    for (const f of findings) console.error(`  ${f}`);
    console.error(
      "  Write `| null`, or `?` for a parameter or member that may be left out.",
    );
  }
  if (dead.length) {
    console.error(
      `absence-spelling: ${dead.length} strict comparison(s) test for a word the value cannot hold:`,
    );
    for (const f of dead) console.error(`  ${f}`);
    console.error(
      "  Compare against the word the type carries. A comparison left behind by a respelling is always false.",
    );
  }
  process.exit(1);
}

console.log(
  `✓ absence-spelling: ${unions} unions across ${files.length} files spell absence \`null\`; ` +
    `${comparisons} strict comparisons, none dead.`,
);

/*
 * A params refusal is a sentence.
 *
 * `paramsError` hands its refusal to the Custom dialog and the Enter Game ID
 * dialog, and both show it as it comes, so every string a game's
 * `validateParams` can return must be a sentence with its full stop. The
 * generated bounds messages are `paramsError`'s own and `params.test.ts` quotes
 * them; this reads the games' half.
 *
 * ON THE INSTRUMENT: keyed on shape, not on a list of games. It finds every
 * function named `validateParams` (a declaration, a method, or a property
 * holding a function) and follows what a `return` hands back: both branches of
 * a conditional, the text of a template with each substitution read as a word,
 * a constant by its declaration (`AREA_TOO_LARGE`), and a call by the returns
 * of the function it names (Loopy's `gridValidateParams`), each name bound in
 * its own file or through its import. An expression it
 * cannot follow fails, since the sentence could not be read. Whether a sentence
 * is a fragment ("Too many mines for grid size") is a matter of reading; what
 * this holds is the form a reader can check at a glance.
 */
import ts from "typescript";
import { describe, expect, it } from "vitest";
import {
  declarationOf,
  nodesOf,
  parsed,
  resolveSpecifier,
  where,
} from "../engine/testing/syntax.ts";

const sources = {
  ...import.meta.glob<string>("../games/**/*.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  ...import.meta.glob<string>("../engine/**/*.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
};

type FunctionNode = ts.FunctionLikeDeclaration;

interface Refusal {
  /** The text, a substitution read as `X`; `null` when it could not be read. */
  text: string | null;
  where: string;
}

/** Every `validateParams` across `trees`: a declaration, a method, or a
 * property or constant holding a function. Keyed on the name because it is
 * the `Game` contract's member, which no import binds. */
function validatorsIn(trees: readonly ts.SourceFile[]): FunctionNode[] {
  const out: FunctionNode[] = [];
  for (const sf of trees)
    for (const n of nodesOf(sf)) {
      const named = (name: ts.Node | null): boolean =>
        name !== null && ts.isIdentifier(name) && name.text === "validateParams";
      if (
        (ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n)) &&
        named(n.name ?? null)
      )
        out.push(n);
      else if (
        (ts.isPropertyAssignment(n) || ts.isVariableDeclaration(n)) &&
        named(n.name) &&
        n.initializer !== undefined &&
        (ts.isArrowFunction(n.initializer) || ts.isFunctionExpression(n.initializer))
      )
        out.push(n.initializer);
    }
  return out;
}

/** What `validateParams` can return, followed through the constants and the
 * calls each name is bound to: a declaration in the same file, or the one its
 * import leads to (`syntax.ts`'s `declarationOf`). */
function refusals(files: Record<string, string>): {
  refusals: Refusal[];
  validators: number;
} {
  const trees = new Map(
    Object.entries(files).map(([path, text]) => [path, parsed(path, text)]),
  );
  const treeAt = (path: string) => trees.get(path) ?? null;
  const out: Refusal[] = [];

  const read = (e: ts.Expression, seen: ReadonlySet<ts.Node>): void => {
    const sf = e.getSourceFile();
    if (ts.isParenthesizedExpression(e)) {
      read(e.expression, seen);
      return;
    }
    if (e.kind === ts.SyntaxKind.NullKeyword) return;
    if (ts.isConditionalExpression(e)) {
      read(e.whenTrue, seen);
      read(e.whenFalse, seen);
      return;
    }
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) {
      out.push({ text: e.text, where: where(e) });
      return;
    }
    if (ts.isTemplateExpression(e)) {
      const text =
        e.head.text + e.templateSpans.map((s) => `X${s.literal.text}`).join("");
      out.push({ text, where: where(e) });
      return;
    }
    if (ts.isIdentifier(e)) {
      const bound = declarationOf(sf, e.text, treeAt);
      if (bound?.kind === "const" && !seen.has(bound.init)) {
        read(bound.init, new Set([...seen, bound.init]));
        return;
      }
    }
    if (ts.isCallExpression(e) && ts.isIdentifier(e.expression)) {
      const bound = declarationOf(sf, e.expression.text, treeAt);
      if (bound?.kind === "function" && !seen.has(bound.fn)) {
        returns(bound.fn, new Set([...seen, bound.fn]));
        return;
      }
    }
    out.push({ text: null, where: where(e) });
  };

  const returns = (fn: FunctionNode, seen: ReadonlySet<ts.Node>): void => {
    if (!fn.body) return;
    if (!ts.isBlock(fn.body)) {
      read(fn.body, seen);
      return;
    }
    const visit = (n: ts.Node): void => {
      if (ts.isFunctionLike(n)) return;
      if (ts.isReturnStatement(n) && n.expression) read(n.expression, seen);
      ts.forEachChild(n, visit);
    };
    ts.forEachChild(fn.body, visit);
  };

  const validators = validatorsIn([...trees.values()]);
  for (const fn of validators) returns(fn, new Set());
  return { refusals: out, validators: validators.length };
}

/** One sentence: it opens as a sentence does and ends with its full stop. */
function isSentence(text: string): boolean {
  return (
    /^[A-Z0-9%]/.test(text) && /[^.!?][.!?]$/.test(text) && !/\s{2}|\s$/.test(text)
  );
}

const tree = Object.fromEntries(
  Object.entries(sources)
    .filter(([key]) => !key.endsWith(".test.ts"))
    .map(([key, text]) => [resolveSpecifier("src/guards/x.ts", key), text]),
);
const found = refusals(tree);

describe("a params refusal", () => {
  it("is not vacuous — the tree was read and refusals were found", () => {
    // An unmatched glob yields `{}`, and every assertion below would then pass
    // over nothing.
    expect(Object.keys(tree).length).toBeGreaterThan(300);
    expect(found.validators).toBeGreaterThan(40);
    expect(found.refusals.length).toBeGreaterThan(100);
  });

  it("is something the scan can read", () => {
    const unread = found.refusals.filter((r) => r.text === null).map((r) => r.where);
    expect(unread, "return a literal, a template, a constant or a call").toEqual([]);
  });

  it("is a sentence with its full stop", () => {
    // A shared constant is reached from every game that returns it, and is
    // named once, where it is written.
    const off = new Set(
      found.refusals.flatMap(({ text, where }) =>
        text !== null && !isSentence(text) ? [`${where}: ${JSON.stringify(text)}`] : [],
      ),
    );
    expect([...off]).toEqual([]);
  });

  it("is read through constants and calls, and a fragment is caught", () => {
    // The instrument on a known positive: each route the tree uses, with one
    // fragment planted on each.
    // A name is followed to what it is bound to: `helper` in `a.ts` is its
    // own, not `c.ts`'s, and `b.ts` reaches `c.ts`'s through a renamed import.
    const planted = refusals({
      "src/plant/a.ts": `
        const TOO_BIG = "Grid is too big";
        function helper(n: number): string | null {
          return n > 2 ? "Helper refusal." : "helper fragment";
        }
        export function validateParams(p: { w: number }): string | null {
          if (p.w < 0) return TOO_BIG;
          if (p.w > 9) return \`Width must be at most \${9}\`;
          return p.w === 3 ? helper(p.w) : null;
        }`,
      "src/plant/b.ts": `import { helper as shared } from "./c.ts";
        export const game = {
          validateParams: (p: { w: number }) => (p.w ? shared() : "Fine."),
        };`,
      "src/plant/c.ts": `export function helper(): string {
          return "c's own fragment";
        }`,
    });
    expect(planted.validators).toBe(2);
    expect(
      planted.refusals.map((r) => [r.text, r.text !== null && isSentence(r.text)]),
    ).toEqual([
      ["Grid is too big", false],
      ["Width must be at most X", false],
      ["Helper refusal.", true],
      ["helper fragment", false],
      ["c's own fragment", false],
      ["Fine.", true],
    ]);
  });
});

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
 * of the function it names (Loopy's `gridValidateParams`). An expression it
 * cannot follow fails, since the sentence could not be read. Whether a sentence
 * is a fragment ("Too many mines for grid size") is a matter of reading; what
 * this holds is the form a reader can check at a glance.
 */
import ts from "typescript";
import { describe, expect, it } from "vitest";

const sources = {
  ...import.meta.glob<string>("../games/**/*.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  ...import.meta.glob<string>("./**/*.ts", {
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

/** Every `validateParams`, and every top-level function and constant by name,
 * across the files given. */
function index(files: Record<string, string>) {
  const validators: { fn: FunctionNode; sf: ts.SourceFile; path: string }[] = [];
  const functions = new Map<
    string,
    { fn: FunctionNode; sf: ts.SourceFile; path: string }
  >();
  const constants = new Map<
    string,
    { init: ts.Expression; sf: ts.SourceFile; path: string }
  >();
  for (const [path, text] of Object.entries(files)) {
    const sf = ts.createSourceFile(path, text, ts.ScriptTarget.ESNext, true);
    const visit = (n: ts.Node): void => {
      if (ts.isFunctionDeclaration(n) && n.name) {
        functions.set(n.name.text, { fn: n, sf, path });
        if (n.name.text === "validateParams") validators.push({ fn: n, sf, path });
      } else if (ts.isMethodDeclaration(n) && n.name.getText(sf) === "validateParams") {
        validators.push({ fn: n, sf, path });
      } else if (
        (ts.isPropertyAssignment(n) || ts.isVariableDeclaration(n)) &&
        n.initializer
      ) {
        const name = n.name.getText(sf);
        const init = n.initializer;
        if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) {
          if (name === "validateParams") validators.push({ fn: init, sf, path });
        } else if (ts.isVariableDeclaration(n) && n.parent.parent.parent === sf) {
          // Top level only: a local `const err` in another file is not one.
          constants.set(name, { init, sf, path });
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
  }
  return { validators, functions, constants };
}

/** What `validateParams` can return, followed through constants and calls. */
function refusals(files: Record<string, string>): {
  refusals: Refusal[];
  validators: number;
} {
  const { validators, functions, constants } = index(files);
  const out: Refusal[] = [];
  const where = (n: ts.Node, sf: ts.SourceFile, path: string) =>
    `${path}:${sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1}`;

  const read = (
    e: ts.Expression,
    sf: ts.SourceFile,
    path: string,
    seen: Set<string>,
  ): void => {
    if (ts.isParenthesizedExpression(e)) {
      read(e.expression, sf, path, seen);
      return;
    }
    if (e.kind === ts.SyntaxKind.NullKeyword) return;
    if (ts.isConditionalExpression(e)) {
      read(e.whenTrue, sf, path, seen);
      read(e.whenFalse, sf, path, seen);
      return;
    }
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) {
      out.push({ text: e.text, where: where(e, sf, path) });
      return;
    }
    if (ts.isTemplateExpression(e)) {
      const text =
        e.head.text + e.templateSpans.map((s) => `X${s.literal.text}`).join("");
      out.push({ text, where: where(e, sf, path) });
      return;
    }
    if (ts.isIdentifier(e) && !seen.has(e.text)) {
      const found = constants.get(e.text);
      if (found) {
        read(found.init, found.sf, found.path, new Set([...seen, e.text]));
        return;
      }
    }
    if (
      ts.isCallExpression(e) &&
      ts.isIdentifier(e.expression) &&
      !seen.has(e.expression.text)
    ) {
      const found = functions.get(e.expression.text);
      if (found) {
        returns(found.fn, found.sf, found.path, new Set([...seen, e.expression.text]));
        return;
      }
    }
    out.push({ text: null, where: where(e, sf, path) });
  };

  const returns = (
    fn: FunctionNode,
    sf: ts.SourceFile,
    path: string,
    seen: Set<string>,
  ): void => {
    if (!fn.body) return;
    if (!ts.isBlock(fn.body)) {
      read(fn.body, sf, path, seen);
      return;
    }
    const visit = (n: ts.Node): void => {
      if (ts.isFunctionLike(n)) return;
      if (ts.isReturnStatement(n) && n.expression) read(n.expression, sf, path, seen);
      ts.forEachChild(n, visit);
    };
    ts.forEachChild(fn.body, visit);
  };

  for (const { fn, sf, path } of validators) returns(fn, sf, path, new Set());
  return { refusals: out, validators: validators.length };
}

/** One sentence: it opens as a sentence does and ends with its full stop. */
function isSentence(text: string): boolean {
  return (
    /^[A-Z0-9%]/.test(text) && /[^.!?][.!?]$/.test(text) && !/\s{2}|\s$/.test(text)
  );
}

const tree = Object.fromEntries(
  Object.entries(sources).filter(([path]) => !path.endsWith(".test.ts")),
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
    const planted = refusals({
      "a.ts": `
        const TOO_BIG = "Grid is too big";
        function helper(n: number): string | null {
          return n > 2 ? "Helper refusal." : "helper fragment";
        }
        export function validateParams(p: { w: number }): string | null {
          if (p.w < 0) return TOO_BIG;
          if (p.w > 9) return \`Width must be at most \${9}\`;
          return p.w === 3 ? helper(p.w) : null;
        }`,
      "b.ts": `export const game = {
          validateParams: (p: { w: number }) => (p.w ? null : "Fine."),
        };`,
    });
    expect(planted.validators).toBe(2);
    expect(
      planted.refusals.map((r) => [r.text, r.text !== null && isSentence(r.text)]),
    ).toEqual([
      ["Grid is too big", false],
      ["Width must be at most X", false],
      ["Helper refusal.", true],
      ["helper fragment", false],
      ["Fine.", true],
    ]);
  });
});

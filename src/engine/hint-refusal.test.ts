/*
 * A game's own hint refusal is about that game.
 *
 * `HintRefusal`'s type already keeps a game from returning a sentence it
 * typed: the only ways to make one are `hint-refusal.ts`'s kinds and
 * `puzzleHintRefusal`. What the type cannot see is a sentence passed through
 * the escape that another game also passes, or that spells out a kind, so this
 * reads every `puzzleHintRefusal(<sentence>)` in the tree and holds each one to
 * what the escape is for:
 *
 *  - **used by one game only.** Two games refusing for the same reason is a
 *    situation the collection has, which is what a kind is. No roster says
 *    which reasons are genuine; the sharing does.
 *  - **not a kind's words.**
 *
 * ON THE INSTRUMENT: keyed on the call's shape wherever it appears, including
 * the engine's hint builders. A template's words are read with each
 * substitution as a hole, and a call whose argument is neither a literal nor a
 * template fails, since its sentence could not be read.
 */
import ts from "typescript";
import { describe, expect, it } from "vitest";
import {
  ALREADY_SOLVED,
  CONTRADICTION_UNLOCALIZED,
  DEDUCTION_EXHAUSTED,
  FIX_MISTAKES_FIRST,
  GAME_OVER,
  NO_MOVE_WORTH_MAKING,
  PUZZLE_NOT_REASONABLE,
  SEARCH_OUT_OF_REACH,
} from "./hint-refusal.ts";
import { NO_SOLUTION_FROM_HERE, SOLUTION_UNKNOWN } from "./solve-failure.ts";

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

const KINDS = new Set<string>([
  ALREADY_SOLVED,
  CONTRADICTION_UNLOCALIZED,
  DEDUCTION_EXHAUSTED,
  FIX_MISTAKES_FIRST,
  GAME_OVER,
  NO_MOVE_WORTH_MAKING,
  PUZZLE_NOT_REASONABLE,
  SEARCH_OUT_OF_REACH,
  NO_SOLUTION_FROM_HERE,
  SOLUTION_UNKNOWN,
]);

/** A template's words, with each substitution written `${…}`. Built from its
 * parts so it reads as the text it is, not as a template missing its backticks. */
const HOLE = `$${"{…}"}`;

interface Call {
  /** The sentence, or `null` when the argument cannot be read. */
  sentence: string | null;
  owner: string;
  where: string;
}

/** `src/games/<id>/…` belongs to `<id>`; anything else to the engine. */
function ownerOf(path: string): string {
  return /\.\.\/games\/([^/]+)\//.exec(path)?.[1] ?? "engine";
}

function sentenceOf(arg?: ts.Expression): string | null {
  if (!arg) return null;
  if (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg))
    return arg.text;
  if (ts.isTemplateExpression(arg)) {
    return arg.head.text + arg.templateSpans.map((s) => HOLE + s.literal.text).join("");
  }
  return null;
}

const calls: Call[] = [];
let filesScanned = 0;
for (const [path, text] of Object.entries(sources)) {
  if (path.endsWith(".test.ts") || path.endsWith("/hint-refusal.ts")) continue;
  filesScanned++;
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.ESNext, true);
  const visit = (n: ts.Node): void => {
    if (
      ts.isCallExpression(n) &&
      ts.isIdentifier(n.expression) &&
      n.expression.text === "puzzleHintRefusal"
    ) {
      const line = sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
      calls.push({
        sentence: sentenceOf(n.arguments[0]),
        owner: ownerOf(path),
        where: `${path}:${line}`,
      });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}

describe("a game's own hint refusal", () => {
  it("is not vacuous — the tree was read and the escape's calls were found", () => {
    // An unmatched glob yields `{}`, and every assertion below would then pass
    // over nothing. Inertia's two sentences, one a template, are the known
    // positives.
    expect(filesScanned).toBeGreaterThan(300);
    expect(calls.filter((c) => c.owner === "inertia").length).toBeGreaterThanOrEqual(2);
    expect(calls.some((c) => c.sentence?.includes(HOLE))).toBe(true);
  });

  it("is a sentence the scan can read", () => {
    const unread = calls.filter((c) => c.sentence === null).map((c) => c.where);
    expect(unread, "pass puzzleHintRefusal a string literal or template").toEqual([]);
  });

  it("belongs to one game: a reason two games give is a kind", () => {
    const owners = new Map<string, Set<string>>();
    for (const c of calls) {
      if (c.sentence === null) continue;
      const set = owners.get(c.sentence) ?? new Set<string>();
      set.add(c.owner);
      owners.set(c.sentence, set);
    }
    const shared = [...owners]
      .filter(([, games]) => games.size > 1)
      .map(([s, games]) => `${JSON.stringify(s)}: ${[...games].sort().join(", ")}`);
    expect(shared, "add a kind to hint-refusal.ts for these").toEqual([]);
  });

  it("is not a kind spelled out", () => {
    const copies = calls.flatMap(({ sentence, where }) =>
      sentence !== null && KINDS.has(sentence) ? [where] : [],
    );
    expect(copies, "use the kind itself").toEqual([]);
  });
});

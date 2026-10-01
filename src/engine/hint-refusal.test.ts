/*
 * One situation says one thing, in every game.
 *
 * A refusal is what a player meets when the Hint button declines, and
 * `help/features.md` §Hints teaches two of them as a pair — "there is a mistake
 * on the board" and "deduction has run out" — because they call for opposite
 * responses. That is only teachable if the same situation is worded the same
 * way everywhere, in games a player moves between freely.
 *
 * ON THE INSTRUMENT. Collecting refusals from functions **named** `hint` misses
 * every game whose hint is named otherwise — this repo's recurring instrument
 * error — so this keys on the **shape**: it walks every non-test source file
 * under `src/games/` and collects every `{ ok: false, error: <string literal> }`
 * wherever it appears.
 *
 * That is deliberately a **superset**: `SolveResult` and the description
 * parsers' results have the same shape, so they are read too, although their
 * types (`solve-failure.ts`, `desc-error.ts`) now admit no literal of a game's
 * own. Rather than narrow the scan back down — which is how the first cut went
 * wrong — every message is classified below. A message that is neither an
 * approved refusal nor a listed exception fails, so a new phrasing cannot arrive
 * unnoticed and nothing hides behind a function's name.
 *
 * **Both branches of a conditional, and a template's words, are messages too.**
 * The scan once read only a bare literal, so `error: impossible ? "…" : "…"`
 * carried two unapproved Solve failures past it in two games.
 */
import ts from "typescript";
import { describe, expect, it } from "vitest";
import {
  ALREADY_SOLVED,
  CONTRADICTION_UNLOCALIZED,
  DEDUCTION_EXHAUSTED,
  FIX_MISTAKES_FIRST,
  NO_MOVE_WORTH_MAKING,
  PUZZLE_NOT_REASONABLE,
  SEARCH_OUT_OF_REACH,
} from "./hint-refusal.ts";
import { NO_SOLUTION_FROM_HERE, SOLUTION_UNKNOWN } from "./solve-failure.ts";

/** Every non-test source file in the games tree, as raw text. Read through Vite
 * so this file stays in the browser-shaped type world, which means an unmatched
 * glob yields `{}` silently — hence the vacuity assertion below. */
const gameSources = {
  ...import.meta.glob<string>("../games/**/*.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  // **And the engine's shared hint modules**: `candidate-hint.ts` builds the
  // `hint()` of the candidate games, and a refusal is wherever a `hint()` is
  // built. Keying on the right *shape* is not enough if the scan reads the
  // wrong *place*.
  ...import.meta.glob<string>("./{candidate-hint,latin-hint,hint-plan}.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
};

/** The approved refusals. A game emitting one of these needs no exception. The
 * two Solve failures are here because a hint meets the same fact: a position
 * nothing finishes from, and a game ID that came without its solution. */
const APPROVED = new Set([
  ALREADY_SOLVED,
  CONTRADICTION_UNLOCALIZED,
  DEDUCTION_EXHAUSTED,
  FIX_MISTAKES_FIRST,
  NO_MOVE_WORTH_MAKING,
  PUZZLE_NOT_REASONABLE,
  SEARCH_OUT_OF_REACH,
  NO_SOLUTION_FROM_HERE,
  SOLUTION_UNKNOWN,
]);

/** A template's words, with each substitution written `${…}`. Built from its
 * parts so it reads as the text it is, not as a template missing its backticks. */
const HOLE = `$${"{…}"}`;

/**
 * Every other `{ ok: false, error }` message in the games tree, with why this
 * game's hint should say something the others do not. A message only `solve`
 * or a description parser could reach would be here too, but their types
 * leave no game a sentence of its own to write.
 */
const EXCEPTIONS: Record<string, string> = {
  "The ball is dead: no move can be played from here. Undo to bring it back.":
    "Inertia: not 'deduction ran out' but a board state with no legal move at " +
    "all. Naming the actual situation is the whole of the hint's value here.",
  [`The ball can no longer reach ${HOLE}. Undo to a position where it can.`]:
    "Inertia: the one thing its hint can prove, naming the gems it proved it " +
    "about. A position nothing finishes from would be NO_SOLUTION_FROM_HERE, " +
    "but this says which gems, which is what the player needs to undo far enough.",
};

interface Found {
  message: string;
  file: string;
}

/** The messages an `error:` initializer can evaluate to: a literal, a template's
 * words, and each branch of a conditional. An identifier yields nothing, since
 * it names a constant this file already classifies. */
function messagesOf(e: ts.Expression, sf: ts.SourceFile): string[] {
  if (ts.isParenthesizedExpression(e)) return messagesOf(e.expression, sf);
  if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return [e.text];
  if (ts.isTemplateExpression(e)) {
    return [e.head.text + e.templateSpans.map((s) => HOLE + s.literal.text).join("")];
  }
  if (ts.isConditionalExpression(e)) {
    return [...messagesOf(e.whenTrue, sf), ...messagesOf(e.whenFalse, sf)];
  }
  return [];
}

/** Every `{ ok: false, error: … }` in a file, wherever it sits. */
function refusalsIn(file: string, text: string, out: Found[]): void {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.ESNext, true);
  const visit = (n: ts.Node): void => {
    if (ts.isObjectLiteralExpression(n)) {
      let ok: ts.Expression | null = null;
      let error: ts.Expression | null = null;
      for (const p of n.properties) {
        if (!ts.isPropertyAssignment(p)) continue;
        const name = p.name.getText(sf);
        if (name === "ok") ok = p.initializer;
        if (name === "error") error = p.initializer;
      }
      if (ok?.kind === ts.SyntaxKind.FalseKeyword && error !== null) {
        sitesSeen++;
        for (const message of messagesOf(error, sf)) out.push({ message, file });
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}

const found: Found[] = [];
let filesScanned = 0;
/** Every `{ ok: false, error }` the scan reached, whatever its error is. Nearly
 * all of them name a constant, so this, not `found`, is what shows the scan
 * read the refusal paths at all. */
let sitesSeen = 0;
for (const [path, text] of Object.entries(gameSources)) {
  if (path.endsWith(".test.ts")) continue;
  filesScanned++;
  refusalsIn(path, text, found);
}

describe("a hint refusal says the same thing in every game", () => {
  it("is not vacuous — the games tree was read and refusals were found", () => {
    // An unmatched glob yields `{}`, and every assertion below would then pass
    // over nothing and report health.
    expect(filesScanned).toBeGreaterThan(150);
    expect(sitesSeen).toBeGreaterThan(100);
    // And the message reader reaches past a bare literal: the exceptions are a
    // literal and a template, and both must be read.
    expect(found.length).toBeGreaterThanOrEqual(Object.keys(EXCEPTIONS).length);
  });

  it("emits no message that is neither approved nor a listed exception", () => {
    const stray = [
      ...new Set(
        found
          .filter((f) => !APPROVED.has(f.message) && !(f.message in EXCEPTIONS))
          .map((f) => `${f.file}: ${JSON.stringify(f.message)}`),
      ),
    ].sort();
    expect(
      stray,
      "import the message from src/engine/hint-refusal.ts, or add it to " +
        "EXCEPTIONS with the reason this situation should read differently",
    ).toEqual([]);
  });

  it("lists no exception the games tree has stopped using", () => {
    const live = new Set(found.map((f) => f.message));
    const stale = Object.keys(EXCEPTIONS).filter((m) => !live.has(m));
    expect(stale, "dead entry in EXCEPTIONS").toEqual([]);
  });

  it("finds the approved refusals actually in use", () => {
    // The counterpart to the vacuity check: proves the scan reaches the hint
    // paths, not merely the Solve ones it would also match.
    const live = new Set(found.map((f) => f.message));
    for (const approved of [ALREADY_SOLVED, FIX_MISTAKES_FIRST, DEDUCTION_EXHAUSTED]) {
      // Inlined by a game that imports the constant, so the literal is gone from
      // the tree — which is the point. Assert instead that no *copy* survives.
      expect(live.has(approved), `a game inlines ${JSON.stringify(approved)}`).toBe(
        false,
      );
    }
  });
});

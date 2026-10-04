/*
 * A game's own description error is about that game.
 *
 * `DescError`'s type already keeps a game from returning a sentence it typed:
 * the only ways to make one are `desc-error.ts`'s kinds and
 * `puzzleDescError`. What the type cannot see is a kind written out as a
 * game's own sentence, and that is the defect this change found about 150
 * times. So this reads every `puzzleDescError(<sentence>)` in the tree and
 * holds each sentence to what the escape is for:
 *
 *  - **used by one game only.** Two games giving the same reason is a situation
 *    the collection has, which is what a kind is. No roster says which reasons
 *    are genuine; the sharing does.
 *  - **not a kind's words**, and in the kinds' voice: one sentence about "this
 *    game ID", ending in a full stop.
 *  - **not the exactly-one situation**, which `descNeedsOne` words, since two
 *    games wording it differently is still one situation.
 *
 * ON THE INSTRUMENT: keyed on the call's shape wherever it appears, including
 * the engine (the grid tilings reach a player through Loopy), and a call whose
 * argument is not a plain literal fails, since the sentence could not be read.
 */
import ts from "typescript";
import { describe, expect, it } from "vitest";
import {
  DESC_CONTRADICTORY,
  DESC_MALFORMED,
  DESC_NO_SINGLE_ANSWER,
  DESC_NOT_DEDUCIBLE,
  DESC_OUT_OF_RANGE,
  DESC_REPEATED,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descValue,
  descVerdict,
  loadDesc,
  validateDesc,
} from "./desc-error.ts";
import { difficultyItem, tierNames } from "./difficulty.ts";

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
  DESC_CONTRADICTORY,
  DESC_MALFORMED,
  DESC_OUT_OF_RANGE,
  DESC_REPEATED,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
]);

interface Call {
  /** The sentence, or `null` when the argument is not a literal. */
  sentence: string | null;
  owner: string;
  where: string;
}

/** `src/games/<id>/…` belongs to `<id>`; anything else to the engine. */
function ownerOf(path: string): string {
  return /\.\.\/games\/([^/]+)\//.exec(path)?.[1] ?? "engine";
}

const calls: Call[] = [];
let filesScanned = 0;
for (const [path, text] of Object.entries(sources)) {
  if (path.endsWith(".test.ts") || path.endsWith("/desc-error.ts")) continue;
  filesScanned++;
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.ESNext, true);
  const visit = (n: ts.Node): void => {
    if (
      ts.isCallExpression(n) &&
      ts.isIdentifier(n.expression) &&
      n.expression.text === "puzzleDescError"
    ) {
      const arg = n.arguments[0];
      const line = sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
      calls.push({
        sentence:
          arg && (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg))
            ? arg.text
            : null,
        owner: ownerOf(path),
        where: `${path}:${line}`,
      });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}

describe("a game's own description error", () => {
  it("is not vacuous — the tree was read and sentences were found", () => {
    // An unmatched glob yields `{}`, and every assertion below would then pass
    // over nothing.
    expect(filesScanned).toBeGreaterThan(300);
    expect(calls.length).toBeGreaterThan(10);
  });

  it("is a literal sentence the scan can read", () => {
    const unread = calls.filter((c) => c.sentence === null).map((c) => c.where);
    expect(unread, "pass puzzleDescError a string literal").toEqual([]);
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
    expect(shared, "add a kind to desc-error.ts for these").toEqual([]);
  });

  it("is not a kind spelled out, and speaks in the kinds' voice", () => {
    const off = calls.flatMap(({ sentence, where }) =>
      sentence !== null &&
      (KINDS.has(sentence) ||
        !/^(This|The) .*game ID/.test(sentence) ||
        !sentence.endsWith("."))
        ? [`${where}: ${JSON.stringify(sentence)}`]
        : [],
    );
    expect(off).toEqual([]);
  });

  it("does not word the exactly-one situation itself", () => {
    // Exact matching is blind to this one: Inertia, Sokoban and Slide each
    // wrote "has no X" / "has more than one X" with a different noun, so no two
    // sentences were equal and the check above passed all three.
    const own = calls.flatMap(({ sentence, where }) =>
      // "has more than one", not "more than one": Rome's goal in "a region of
      // more than one square" is a size, and the looser key convicted it.
      sentence !== null && /has more than one /.test(sentence) ? [where] : [],
    );
    expect(own, "use descNeedsOne(noun, found)").toEqual([]);
  });
});

describe("the engine's verdict on a desc", () => {
  // A game whose parse accepts only "ok", and whose build has a bug on "bug".
  const game = {
    newState(_p: null, desc: string): string {
      const value = descValue<string>(
        desc === "ok" || desc === "bug"
          ? { ok: true, value: desc }
          : { ok: false, error: DESC_MALFORMED },
      );
      if (value === "bug") throw new TypeError("a bug in the build");
      return value;
    },
  };

  it("is the board newState builds, or the reason its parse refused", () => {
    expect(loadDesc(game, null, "ok")).toEqual({ ok: true, value: "ok" });
    expect(loadDesc(game, null, "nope")).toEqual({ ok: false, error: DESC_MALFORMED });
    expect(validateDesc(game, null, "ok")).toBeNull();
    expect(validateDesc(game, null, "nope")).toBe(DESC_MALFORMED);
  });

  it("lets anything but a refusal propagate, since it is a bug", () => {
    expect(() => loadDesc(game, null, "bug")).toThrow(TypeError);
  });
});

describe("a board the game's solver cannot solve", () => {
  interface P {
    tier: number;
  }
  // A desc names the lowest cap that solves its board, or "never".
  const tiered = (tiers: readonly string[]) => ({
    newState: (_p: P, desc: string) => desc,
    paramConfig: [difficultyItem<P>(tiers, "tier")],
    difficulty: {
      solveAtCap: (_p: P, desc: string, cap: number) =>
        desc !== "never" && cap >= Number(desc)
          ? ("solved" as const)
          : ("unsolved" as const),
    },
  });
  const verdict = (game: ReturnType<typeof tiered>, tier: number, desc: string) =>
    descVerdict(loadDesc(game, { tier }, desc));

  it("does not load where no cap of a tiered game solves it", () => {
    const game = tiered(tierNames(3));
    expect(verdict(game, 0, "0")).toBeNull();
    expect(verdict(game, 0, "never")).toBe(DESC_NOT_DEDUCIBLE);
    expect(verdict(game, 2, "never")).toBe(DESC_NOT_DEDUCIBLE);
  });

  it("loads where a cap above the stated tier solves it", () => {
    // A shared ID does not state its tier, so the board is asked, not the ID.
    expect(verdict(tiered(tierNames(3)), 0, "2")).toBeNull();
  });

  it("loads a board that needs trial and error where a tier allows it", () => {
    // Cap 2 is Unreasonable: the board is solved there, so it loads under any
    // tier's params.
    const game = tiered(tierNames(3, { search: true }));
    expect(verdict(game, 2, "2")).toBeNull();
    expect(verdict(game, 0, "2")).toBeNull();
  });

  it("does not load a board even that tier cannot solve, and words it apart", () => {
    // Trial and error is allowed there, so it is not what is wrong.
    const game = tiered(tierNames(3, { search: true }));
    expect(verdict(game, 2, "never")).toBe(DESC_NO_SINGLE_ANSWER);
    expect(verdict(game, 0, "never")).toBe(DESC_NO_SINGLE_ANSWER);
  });

  it("is asked of an untiered game through finishesByDeduction", () => {
    const untiered = (finishesByDeduction?: (s: string) => boolean) => ({
      newState: (_p: null, desc: string) => desc,
      ...(finishesByDeduction ? { finishesByDeduction } : {}),
    });
    const finishes = (s: string) => s === "fine";
    expect(descVerdict(loadDesc(untiered(finishes), null, "fine"))).toBeNull();
    expect(descVerdict(loadDesc(untiered(finishes), null, "stuck"))).toBe(
      DESC_NOT_DEDUCIBLE,
    );
    // A game that makes no such promise (a sliding puzzle) loads any board.
    expect(descVerdict(loadDesc(untiered(), null, "stuck"))).toBeNull();
  });
});

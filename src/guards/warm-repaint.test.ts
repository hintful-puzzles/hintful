/**
 * The cross-game guard on every render cache: **a frame drawn on a warm draw
 * state looks like the same frame drawn on a fresh one.**
 *
 * `testing/repaint-differential.ts` says what is compared and why the
 * comparison is sound. What it catches is any way a tile can fail to repaint —
 * flags sharing a bit, a value overflowing its field, a painter input missing
 * from the key — which is why this replaced the per-module flag lists: a
 * module listing its own flags cannot see the flag it forgot, and none of the
 * collisions that census found was two named flags sharing a bit.
 *
 * Population: every registered game, from the registry.
 *
 * **A pass is only as strong as what the run showed the game**, so each game
 * also answers for its reach. An animation the midend armed must have been
 * painted part-way at least once, which is what failed while the run ticked
 * its clock in whole seconds. A game with a hint must have painted every mark
 * its renderer can paint: each `role|kind` the renderer asks the displayed
 * marks for (`StepMarks.of`), in a role the game's legend lists. A mark the run
 * never shows passes the comparison whatever its tile key gets wrong, which is
 * how Pegs' stripes and arrows went unchecked. Where the seeded deal does not
 * reach a mark, a bounded search over the boards every sweep deals finds one
 * that does ({@link searchBoards}). A board pinned by hand had to be found
 * again whenever a change to shared data, a word list or a dealer, moved
 * which board the seed dealt. The
 * requirement reads hint marks only: a mark the rules draw (Bricks' gravity
 * diamond) is held by a board pinned in its game's own tests. A game that finds
 * mistakes must have painted a mistake overlay on a warm frame, and taken it
 * off again: on a cold frame every tile misses the cache, so the overlay paints
 * whether or not its key carries it. Where the seeded run never checks a wrong
 * board, a second run plays input on the deal until the check finds a mistake
 * ({@link SEEK_EVENTS}): moves pinned by hand to make one had to be found again
 * whenever the deal moved.
 */
import { describe, expect, it } from "vitest";
import { hasHint } from "../engine/contract/game.ts";
import type { MarkRole } from "../engine/contract/hint-words.ts";
import { dealt } from "../engine/testing/dealt.ts";
import {
  REGISTERED_GAME_COUNT,
  REGISTERED_GAMES,
  REGISTERED_IDS,
} from "../engine/testing/enrollment.ts";
import type { AnyGame } from "../engine/testing/input-probe.ts";
import { expectLedger } from "../engine/testing/ledger.ts";
import { dealtBoards } from "../engine/testing/presets.ts";
import {
  type RepaintRun,
  repaintDifferential,
} from "../engine/testing/repaint-differential.ts";
import { FIRST_SHARE, ofThisShare } from "../engine/testing/sweep-share.ts";

const EVENTS = 60;
/** Input events on a wrong board, before the walk of its hint's plan. */
const WRONG_EVENTS = 20;
/** Input events at most on the deal before its check finds a mistake, for a
 * game whose seeded run never checks a wrong board. The furthest any game
 * needed was Group's 517th, and the next 145 (2026-11-21); the search stops at
 * the first mistake, so the bound costs only a failing run. */
const SEEK_EVENTS = 1000;

/** Boards the search tries at most, for a game whose deal leaves a mark
 * unpainted. The furthest any game needed was the ninth (2026-11-20); a mark
 * past the bound fails the game, so the bound costs only a failing run. */
const SEARCH_BOUND = 24;

/**
 * The boards searched, in order, for a mark no earlier run painted: every mode
 * and tier on the smallest board offering it, then a second board of each,
 * and so on up to {@link SEARCH_BOUND}. They are the boards every cross-game
 * sweep deals, so the search deals nothing of its own until it asks for a
 * second round.
 */
function* searchBoards(game: AnyGame): Generator<string> {
  const presets = dealtBoards(game, { scalarEnds: false });
  for (let k = 0; k < SEARCH_BOUND; k++) {
    const { params } = presets[k % presets.length];
    const n = Math.floor(k / presets.length);
    yield `${game.encodeParams(params, true)}:${dealt(game, params, n).desc}`;
  }
}

/**
 * Marks a renderer can paint that its game's hint never draws, with the
 * reason. A pair whose role the legend does not list needs no entry: no step
 * may name it (`testing/hint-binding.ts`).
 */
const UNREACHED: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  wordtrail: {
    "outline|edge":
      "Every technique reasons from a letter, so its hint outlines letters; " +
      "the engine's edge hint reads outlined edges for every game.",
  },
};

describe("a warm frame matches a fresh one", () => {
  // Checks that walk nothing, so the first share holds them for every share.
  if (FIRST_SHARE) {
    it("is not vacuous — the registry offered every game", () => {
      expect(REGISTERED_GAME_COUNT).toBeGreaterThan(50);
    });

    it("excuses only games it knows", () => {
      expect(
        Object.keys(UNREACHED).filter((id) => !REGISTERED_IDS.includes(id)),
      ).toEqual([]);
    });
  }

  it.each(
    ofThisShare(REGISTERED_GAMES),
  )("%s: repaints every tile it must", (id, game) => {
    const run = repaintDifferential(game, id, EVENTS);
    expect(run.mismatch, JSON.stringify(run.mismatch)).toBeNull();
    expect(run.frames).toBeGreaterThan(EVENTS);
    if (run.reached.armed > 0) {
      expect(
        run.reached.animated,
        "armed an animation, painted none of it",
      ).toBeGreaterThan(0);
    }

    if (typeof game.findMistakes === "function" && run.reached.mistaken === 0) {
      const r = repaintDifferential(game, id, WRONG_EVENTS, undefined, SEEK_EVENTS);
      expect(r.mismatch, `seeking a mistake: ${JSON.stringify(r.mismatch)}`).toBeNull();
      expect(
        r.reached.mistaken,
        `finds mistakes, and ${SEEK_EVENTS} input events on its deal made none: ` +
          "raise SEEK_EVENTS (src/guards/warm-repaint.test.ts) if the game's " +
          "input reaches a mistake, or say why it cannot",
      ).toBeGreaterThan(0);
    }

    const legend = game.hint.marks.roles;
    if (!hasHint(game)) {
      expect(Object.keys(legend)).toEqual([]);
      return;
    }
    const runs: RepaintRun[] = [run];
    const roleOf = (pair: string) => pair.slice(0, pair.indexOf("|")) as MarkRole;
    const excused = UNREACHED[id] ?? {};
    /** The marks the renderer asked for that no run has painted yet. */
    const unpainted = (): string[] => {
      const painted = new Set(runs.flatMap((r) => [...r.reached.marks]));
      const asked = new Set(runs.flatMap((r) => [...r.reached.asked]));
      return [...asked]
        .filter((p) => roleOf(p) in legend && !painted.has(p) && !(p in excused))
        .sort();
    };
    const covered: string[] = [];
    let tried = 0;
    for (const board of searchBoards(game)) {
      const before = unpainted();
      if (before.length === 0) break;
      tried++;
      // No input events: the hint's opening steps and the walk of its plan
      // are what paint its marks, and the seeded run's events already reached
      // the input paths.
      const r = repaintDifferential(game, id, 0, board);
      expect(r.mismatch, `${board}: ${JSON.stringify(r.mismatch)}`).toBeNull();
      runs.push(r);
      const now = before.filter((p) => r.reached.marks.has(p));
      if (now.length > 0) covered.push(`${now.join(", ")} on ${board} (#${tried})`);
    }
    // Which board painted what, so a game whose search runs long is seen.
    if (covered.length > 0)
      console.log(`${id}: the search painted ${covered.join("; ")}`);

    const painted = new Set(runs.flatMap((r) => [...r.reached.marks]));
    const asked = new Set(runs.flatMap((r) => [...r.reached.asked]));
    // Vacuity: a hinted game painted a hint frame and its renderer read marks.
    expect(run.reached.hinted, "has a hint, painted no hint frame").toBeGreaterThan(0);
    expect(asked.size, "the renderer never read the hint's marks").toBeGreaterThan(0);

    // Every role the help's list of marks describes is one the renderer paints.
    const unread = (Object.keys(legend) as MarkRole[]).filter(
      (role) => ![...asked].some((p) => roleOf(p) === role),
    );
    expect(unread, "the legend lists roles the renderer never reads").toEqual([]);

    const missing = [...asked]
      .filter((p) => roleOf(p) in legend && !painted.has(p))
      .sort();
    expectLedger(missing, excused, {
      table: `UNREACHED.${id}`,
      file: "src/guards/warm-repaint.test.ts",
      found: `marks the renderer can paint that no run painted, the seeded one and ${tried} searched boards`,
      add:
        "make a hint on a dealt board paint it, raise SEARCH_BOUND if the " +
        "search stopped there, or add the mark with why the hint never draws it",
    });
  });
});

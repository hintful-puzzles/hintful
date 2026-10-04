/**
 * Spokes hint tests — the deduction narrated by each rung, the multi-leg
 * journey a saturated hub becomes, the contradiction look-ahead, the refusal
 * paths, and a tier-2.5 render frame (including a diagonal hint, the
 * corner-invalidation case).
 *
 * Cross-game guarantees (necessity voice, overlay-reaches-cache, solve-from-any
 * position, recompute-stability, no-op-free plans) come free from Spokes'
 * enrollment in `engine/testing/hint-games.ts`; what lives here is everything
 * game-specific — that each rung fires the move the unique solution agrees with,
 * and that its narration states the premise the move actually rests on.
 */

import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import {
  DEFAULT_BACKGROUND,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { seedBudget } from "../../engine/testing/slow.ts";
import { newSpokesDesc } from "./generator.ts";
import { type SpokesHint, spokesGame } from "./index.ts";
import { COL_HINT, COL_HINT_CELL } from "./render.ts";
import {
  deduceSpokesPlan,
  type SpokesFiring,
  type SpokesFiringKind,
  spokesSolve,
} from "./solver.ts";
import {
  clearBoard,
  cloneBoard,
  DIFF_EASY,
  DIFF_HARD,
  DIFF_TRICKY,
  DIFFCOUNT,
  getSpoke,
  newState,
  SPOKE_DIRS,
  SPOKE_LINE,
  SPOKE_MARKED,
  type SpokesBoard,
  type SpokesParams,
  type SpokesState,
  spokesCount,
  spokesPlace,
  syncDiagonalBlock,
} from "./state.ts";

/** Lines drawn out of a hub — for the goal-oriented "no useless mark" test. */
function linesDrawn(b: SpokesBoard, i: number): number {
  return spokesCount(b.spokes[i], SPOKE_LINE);
}

/** Apply a firing's forced spokes to a board exactly as the game does — with
 * the crossing auto-block — so a test walk matches production progression. */
function applyForced(
  b: SpokesBoard,
  forced: readonly { index: number; dir: number; state: number }[],
): void {
  for (const { index, dir, state } of forced) {
    const old = getSpoke(b.spokes[index], dir);
    spokesPlace(b, index, dir, state);
    syncDiagonalBlock(b, index, dir, old, state);
  }
}

const EASY: SpokesParams = { w: 4, h: 4, diff: "easy" };
const TRICKY: SpokesParams = { w: 4, h: 4, diff: "tricky" };
/** The top tier, `Unreasonable` in the menu and `"hard"` in the params. Used
 * below as a *board* selector, never as
 * a rung selector: its own rung is unreachable from the hint by design, which
 * the last test in this file proves rather than assumes. */
const UNREASONABLE: SpokesParams = { w: 4, h: 4, diff: "hard" };

/** The unique solution as a board (the same one `hint`/`findMistakes` use). */
function solutionOf(state: SpokesState) {
  const b = cloneBoard(state);
  clearBoard(b);
  expect(spokesSolve(b, null, DIFFCOUNT)).toBe("valid");
  return b;
}

/** The firing the deductive plan opens with on `state`: the one a hint there
 * narrates. */
function firingAt(state: SpokesState): SpokesFiring {
  const [firing] = deduceSpokesPlan(cloneBoard(state));
  if (!firing) throw new Error("deduction has nothing to offer here");
  return firing;
}

const opensWith =
  (kind: SpokesFiringKind) =>
  (_step: unknown, state: SpokesState): boolean =>
    deduceSpokesPlan(cloneBoard(state))[0]?.kind === kind;

const lit = (step: { highlights?: unknown }): SpokesHint | null =>
  (step.highlights as SpokesHint | undefined) ?? null;

/** A forced line on a diagonal (dir 1 = BOTRIGHT, 3 = BOTLEFT). */
const isDiagLine = (h: SpokesHint | null): boolean =>
  h?.spokes?.some((s) => s.state === SPOKE_LINE && (s.dir === 1 || s.dir === 3)) ??
  false;
const isRuleOut = (h: SpokesHint | null): boolean =>
  h?.spokes?.some((s) => s.state === SPOKE_MARKED) ?? false;

/** A position for each rung, found as the firing the plan opens with there,
 * and for each shape of step whose frame is asserted below. */
const pinned = describeHintPins({
  game: spokesGame,
  params: [EASY, TRICKY, UNREASONABLE],
  kinds: {
    twoOnes: opensWith("twoOnes"),
    saturation: opensWith("saturation"),
    exhaustion: opensWith("exhaustion"),
    contradiction: opensWith("contradiction"),
    // A saturation firing forcing more than one spoke.
    saturationOfSeveral: (_step, state) => {
      const [f] = deduceSpokesPlan(cloneBoard(state));
      return f?.kind === "saturation" && f.forced.length > 1;
    },
    // The corner-invalidation case.
    diagonalLine: (step) => isDiagLine(lit(step)),
    ruleOut: (step) => isRuleOut(lit(step)),
  },
  pins: {
    /** Held on 117 of 1046 positions walked. */
    twoOnes: "4x4dt:1442456446431112",
    /** Held on 453 of 1046 positions walked. */
    saturation: "4x4de:1511455143121112",
    /** Held on 267 of 1046 positions walked. */
    exhaustion: {
      id: "4x4de:3341313212131431",
      moves:
        '[{"kind":"set","index":0,"dir":0,"state":2},{"kind":"set","index":0,"dir":1,"state":2},{"kind":"set","index":0,"dir":2,"state":2},{"kind":"set","index":8,"dir":2,"state":3},{"kind":"set","index":10,"dir":1,"state":3}]',
    },
    /** Held on 209 of 1046 positions walked. */
    contradiction: {
      id: "4x4dh:1321231446531321",
      moves: [{ kind: "set", index: 3, dir: 3, state: 3 }],
    },
    /** Held on 249 of 1046 positions walked. */
    saturationOfSeveral: "4x4de:1511455143121112",
    /** Held on 198 of 1046 positions walked. */
    diagonalLine: "4x4de:1511455143121112",
    /** Held on 476 of 1046 positions walked. */
    ruleOut: "4x4dt:1442456446431112",
  },
});

// --- each rung's forced move agrees with the unique solution ----------------

describe("each rung forces the move the solution agrees with", () => {
  for (const kind of [
    "twoOnes",
    "saturation",
    "exhaustion",
    "contradiction",
  ] as const) {
    it(`${kind}: every forced spoke matches the solution`, () => {
      const { state } = pinned(kind);
      const solution = solutionOf(state);
      for (const sp of firingAt(state).forced) {
        const inSolution = getSpoke(solution.spokes[sp.index], sp.dir);
        // A forced LINE must be a line in the solution; a forced MARK must not.
        if (sp.state === SPOKE_LINE) {
          expect(inSolution).toBe(SPOKE_LINE);
        } else {
          expect(inSolution).not.toBe(SPOKE_LINE);
        }
      }
    });
  }
});

// --- narration: the premise the move rests on -------------------------------

describe("narration states the premise, in the necessity voice", () => {
  it("two-ones names the isolation it prevents, tersely", () => {
    const text = pinned("twoOnes").step.explanation;
    expect(text).toMatch(/outlined 1-hubs/);
    expect(text).toMatch(/strand/);
    expect(text).toMatch(/rule out this spoke/);
    expect(text.length).toBeLessThan(120);
  });

  it("saturation cites the count that forces the free spokes to lines", () => {
    const text = pinned("saturation").step.explanation;
    expect(text).toMatch(/free spoke/);
    expect(text).toMatch(/must (?:be a line|all be lines)/);
    expect(text.length).toBeLessThan(120);
  });

  it("exhaustion says the hub is done and rules out the rest", () => {
    const text = pinned("exhaustion").step.explanation;
    expect(text).toMatch(/already has all its lines/);
    expect(text).toMatch(/: rule out (?:this spoke|these spokes)\.$/);
    expect(text.length).toBeLessThan(120);
  });

  it("contradiction states the hypothesis and the break it reaches", () => {
    const { state, step } = pinned("contradiction");
    expect(step.explanation).toMatch(/^(?:Drawing this line|Ruling this spoke out)/);
    expect(step.explanation).toMatch(/(?:over-fill|force the diagonals|strand)/);
    expect(step.explanation).toMatch(/(?:rule it out|must be a line)/);
    // The break it names is outlined as evidence (words and picture agree).
    expect(firingAt(state).breakKind).toBeDefined();
    expect((step.highlights as SpokesHint).evidence.length).toBeGreaterThan(0);
    expect(step.explanation.length).toBeLessThan(120);
  });
});

// --- goal-oriented: no useless rule-outs ------------------------------------

describe("hints only rule out a spoke when it helps a hub still needing lines", () => {
  it("never marks a spoke whose both hubs are already satisfied", () => {
    // Across many boards, walk the whole plan and assert every rule-out touches
    // at least one hub that still needs lines.
    //
    // The seed count is a confidence dial, not a threshold: a rule that emitted
    // useless rule-outs would do so on nearly every board, so the gate's 8 seeds
    // (× 3 difficulties = 24 full plan walks) catch a systematic violation just
    // as surely as 60 did — at 238 s, this one test was **20% of the entire
    // suite**. `npm run test:slow` still scans all 60 for the rare case.
    let ruleOuts = 0;
    for (let seed = 0; seed < seedBudget(8, 60); seed++) {
      for (const preset of [EASY, TRICKY, UNREASONABLE]) {
        const { desc } = newSpokesDesc(
          preset,
          randomNew(`useful-${preset.diff}-${seed}`),
        );
        const base = newState(preset, desc);
        const board = cloneBoard(base);
        for (let guard = 0; guard < 600; guard++) {
          const plan = deduceSpokesPlan(board);
          if (plan.length === 0) break;
          const f = plan[0];
          for (const sp of f.forced) {
            if (sp.state === SPOKE_LINE) continue; // a connection always helps
            const nx = (sp.index % board.w) + SPOKE_DIRS[sp.dir].dx;
            const ny = ((sp.index / board.w) | 0) + SPOKE_DIRS[sp.dir].dy;
            const j = ny * board.w + nx;
            const aNeeds = linesDrawn(board, sp.index) < board.numbers[sp.index];
            const bNeeds =
              nx >= 0 &&
              nx < board.w &&
              ny >= 0 &&
              ny < board.h &&
              board.numbers[j] > 0 &&
              linesDrawn(board, j) < board.numbers[j];
            expect(
              aNeeds || bNeeds,
              `${preset.diff}/${seed}: ${f.kind} rules out a spoke between two satisfied hubs`,
            ).toBe(true);
            ruleOuts++;
          }
          applyForced(board, f.forced);
        }
      }
    }
    // A deduction engine that emitted only connections would walk every board
    // and assert nothing; this test is about rule-outs.
    expect(ruleOuts, "no plan ruled out a single spoke").toBeGreaterThan(0);
  });
});

// --- one firing is one journey ----------------------------------------------

describe("a saturated hub is one multi-leg journey, one color", () => {
  it("emits every forced spoke as continuation legs sharing one highlight", () => {
    const { state, steps } = pinned("saturationOfSeveral");
    const k = firingAt(state).forced.length;
    const legs = steps.slice(0, k);

    // Leg 0 opens the journey; the rest continue it.
    expect(legs[0].continuesPrevious).toBeFalsy();
    for (let i = 1; i < k; i++) expect(legs[i].continuesPrevious).toBe(true);

    // Every leg renders the spokes still to settle (shared fate, shared
    // color): leg 0 all of them, each later leg one fewer, and its words name
    // just those.
    const first = legs[0].highlights as SpokesHint;
    expect(first.spokes.length).toBe(k);
    legs.forEach((leg, i) => {
      const hl = leg.highlights as SpokesHint;
      expect(hl.spokes).toEqual(first.spokes.slice(i));
      expect(hl.evidence).toEqual(first.evidence);
    });
    expect(legs[k - 1].explanation).toBe(
      "…and this one must be a line too, for the outlined hub.",
    );

    // Each leg draws a distinct spoke.
    const drawn = new Set(
      legs.map(
        (l) =>
          `${(l.move as { index: number }).index}:${(l.move as { dir: number }).dir}`,
      ),
    );
    expect(drawn.size).toBe(k);
  });
});

// --- boards the midend refuses a hint on ------------------------------------

describe("boards the midend refuses a hint on", () => {
  it("counts a solved board as finished", () => {
    const { desc } = newSpokesDesc(EASY, randomNew("refuse-solved"));
    const base = newState(EASY, desc);
    const solved = spokesGame.solve?.(base, base);
    if (!solved?.ok) throw new Error("solve refused");
    expect(spokesGame.status(spokesGame.executeMove(base, solved.move))).toBe("solved");
  });

  it("flags a solution-forbidden line as a mistake", () => {
    const { desc } = newSpokesDesc(EASY, randomNew("refuse-wrong"));
    const base = newState(EASY, desc);
    const solution = solutionOf(base);
    // Find a spoke the solution marks (not a line) and draw a line there.
    let placed = false;
    for (let i = 0; i < base.w * base.h && !placed; i++) {
      for (let d = 0; d < 4; d++) {
        if (
          getSpoke(base.spokes[i], d) === 1 /* EMPTY */ &&
          getSpoke(solution.spokes[i], d) !== SPOKE_LINE
        ) {
          spokesPlace(base, i, d, SPOKE_LINE);
          placed = true;
          break;
        }
      }
    }
    expect(placed).toBe(true);
    expect(spokesGame.findMistakes?.(base)?.length ?? 0).toBeGreaterThan(0);
  });
});

// --- tier-2.5 render frame --------------------------------------------------

describe("the hint frame paints the overlay", () => {
  /** The frame a pinned position's hint draws, through a real `Midend`. */
  function hintFrame(kind: Parameters<typeof pinned>[0]) {
    const { id, moves, step } = pinned(kind);
    const result = renderScenario({
      game: spokesGame,
      id,
      moves,
      showHint: true,
      defaultBackground: DEFAULT_BACKGROUND,
    });
    expect(result.hint?.explanation).toBe(step.explanation);
    return result;
  }

  it("draws a COL_HINT spoke and a COL_HINT_CELL evidence ring, incl. a diagonal", () => {
    const ops = hintFrame("diagonalLine").recording.ops;
    // The forced diagonal line at hint color — completed across the grid
    // corner, so both a plus-shape half and a corner-box half
    // come out COL_HINT.
    expect(ops.some((o) => o.op === "line" && o.color === COL_HINT)).toBe(true);
    // The evidence ring behind a hub.
    expect(ops.some((o) => o.op === "circle" && o.fill === COL_HINT_CELL)).toBe(true);

    expect(ops).toMatchSnapshot();
  });

  it("rings a spoke to rule out rather than drawing it already marked", () => {
    // A filled COL_HINT dot is exactly how a marked spoke looks, so the step
    // read as already done.
    const circles = hintFrame("ruleOut").recording.ops.filter((o) => o.op === "circle");
    expect(circles.some((o) => o.outline === COL_HINT && o.fill === -1)).toBe(true);
    expect(circles.filter((o) => o.fill === COL_HINT)).toEqual([]);
  });
});

// --- the Unreasonable rung is unreachable from the hint ---------------------

describe("the top tier's look-ahead never reaches a hint", () => {
  /**
   * `spokesSolve` runs the contradiction look-ahead twice: at `DIFF_TRICKY` with
   * a `DIFF_LIMITED` sub-solve (capped at `ACTION_LIMIT`, a bounded chain — a
   * *Tactic*), and again at the top tier with a `DIFF_EASY` sub-solve that has
   * no bound at all and was measured settling **35 of 36 hubs** on a 6x6 board.
   * Only the second is a search, and no hint narrates a search on any tier.
   *
   * The two rungs are the *same function* and their narration is word-for-word
   * identical, so `hint-quality.test.ts`'s vocabulary check cannot tell them
   * apart — the guarantee has to be structural. This is it, stated as the
   * consequence a player would feel: **asking for the top tier's reasoning buys
   * the plan nothing.** The control below is what stops it passing vacuously.
   */
  it("planning at the top tier gives the same plan as planning at Normal", () => {
    let sawTricky = false;
    for (let seed = 0; seed < 12; seed++) {
      const { desc } = newSpokesDesc(UNREASONABLE, randomNew(`no-search-rung-${seed}`));
      const base = newState(UNREASONABLE, desc);
      const kinds = (diff: number) =>
        deduceSpokesPlan(cloneBoard(base), diff).map((f) => f.kind);

      expect(kinds(DIFF_HARD), `seed ${seed}`).toEqual(kinds(DIFF_TRICKY));
      if (kinds(DIFF_TRICKY).length > kinds(DIFF_EASY).length) sawTricky = true;
    }
    // The control: the Normal rung really does add firings an Easy plan lacks,
    // so the equality above is a live fact about the top tier rather than an
    // artifact of every tier producing the same plan.
    expect(sawTricky, "no board where the Normal rung adds a firing").toBe(true);
  });
});

/**
 * Netslide's explained hint: the home assignment, the plan, the narration, the
 * guarantee that a recomputed plan converges, and the rendering.
 */

import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { ALREADY_SOLVED } from "../../engine/hint-refusal.ts";
import { Midend } from "../../engine/midend.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { opsOfKind, RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { seedBudget } from "../../engine/testing/slow.ts";
import { type NetslideHint, parseAux } from "./hint.ts";
import { netslideGame } from "./index.ts";
import { ANIM_TIME, COL_HINT, colors, newDrawState, redraw } from "./render.ts";
import {
  D,
  isComplete,
  L,
  type NetslideMove,
  type NetslideParams,
  type NetslideState,
  newUi,
  R,
  U,
  wireCount,
} from "./state.ts";

const EASY_3X3: NetslideParams = {
  w: 3,
  h: 3,
  wrapping: false,
  barrierProbability: 1,
  movetarget: 0,
};
/** An even-sized board: the source sits at ⌊4/2⌋ = 2, i.e. row 3, column 3 — the
 * board on which "the center tile" is a claim the player can see is false. */
const EVEN_4X4: NetslideParams = {
  w: 4,
  h: 4,
  wrapping: false,
  barrierProbability: 1,
  movetarget: 0,
};
const HARD_5X5: NetslideParams = {
  w: 5,
  h: 5,
  wrapping: true,
  barrierProbability: 0,
  movetarget: 0,
};

function board(params: NetslideParams, seed: string) {
  const { desc, aux } = netslideGame.newDesc(params, randomNew(seed));
  return { desc, aux, state: netslideGame.newState(params, desc) };
}

const marksOf = (step: { highlights?: unknown }): NetslideHint =>
  step.highlights as NetslideHint;

/** Whether `cell` lies on the line a slide moves. */
const onSlidLine = (
  state: NetslideState,
  slide: NetslideMove & { type: "slide" },
  cell: number,
): boolean =>
  slide.axis === "row"
    ? Math.floor(cell / state.w) === slide.index
    : cell % state.w === slide.index;

/** The steps the narration and animation tests read, each pinned on a position
 * whose hint opens with one. A plan here is a search, so the scan follows only
 * the first few hints of each board. */
const pinned = describeHintPins({
  game: netslideGame,
  params: [EVEN_4X4, HARD_5X5],
  seeds: 8,
  maxSteps: 8,
  kinds: {
    // A tile sitting in the source's row can only be shifted by its column,
    // and the other way about.
    offFrozenRow: (step, state) =>
      step.rung === "frozenLine" &&
      step.move.type === "slide" &&
      step.move.axis === "col" &&
      Math.floor(marksOf(step).tile / state.w) === state.cy,
    offFrozenColumn: (step, state) =>
      step.rung === "frozenLine" &&
      step.move.type === "slide" &&
      step.move.axis === "row" &&
      marksOf(step).tile % state.w === state.cx,
    // A tile that needs more than one slide to get home: the opening step's
    // plan has a continuation leg straight after it.
    journey: (_step, _state, steps) => steps[1]?.continuesPrevious === true,
    // A step that moves a tile and aims at a cell on the line being slid, the
    // only case where a cell mark riding the shift would be visible.
    aimsAlongItsSlide: (step, state) =>
      step.move.type === "slide" &&
      onSlidLine(state, step.move, marksOf(step).destination) &&
      marksOf(step).landing !== marksOf(step).tile,
  },
  pins: {
    /** Held on 15 of 128 positions walked. */
    offFrozenRow: "5x5w:767822c589d47adb629595514",
    /** Held on 15 of 128 positions walked. */
    offFrozenColumn: "4x4b1:chb4h2h8v9v43h1ah7h457dv5",
    /** Held on 20 of 128 positions walked. */
    journey: "4x4b1:6v97h4hd5hbvh382d4h8vbv24",
    /** Held on 81 of 128 positions walked. */
    aimsAlongItsSlide: "4x4b1:1h1v7hdch6h26h9d7h1cv2v1c",
    /** Held on 103 of 128 positions walked. */
    frozenLine: "4x4b1:chb4h2h8v9v43h1ah7h457dv5",
    /** Held on 96 of 128 positions walked. */
    besideSource: "4x4b1:1h8v9eh4v7h4v83hcvb1h3c67",
    /** Held on 128 of 128 positions walked. */
    working: "4x4b1:1h1v7hdch6h26h9d7h1cv2v1c",
  },
});

function hintOf(state: NetslideState, aux?: string) {
  const res = netslideGame.hint?.(state, aux);
  if (!res) throw new Error("netslide has no hint()");
  return res;
}

/**
 * A shared corpus of boards and their hint plans across all three sizes,
 * computed **once** for the tests that check a *structural narration invariant*
 * (does any step say "center", is any sentence too long, does every step state a
 * purpose). The planner is the suite's most expensive operation (~0.3 s per 4×4
 * board, ~0.6 s per 5×5), and these checks verify deterministic templates, so a
 * diverse handful of boards covers what dozens would. Tests hunting a *specific*
 * rare shape (a frozen-line move, a beside-source placement, a multi-leg
 * journey) keep their own loops below.
 *
 * What the corpus alone catches is a wording these three rules forbid on any
 * sentence form: the cross-game narration guards hold Netslide to none of them
 * but length. A 5×5 board is most of the cost and no likelier to show one:
 * planted 2026-10-07, "center" in the frozen-row sentence and a second
 * "belongs" in the beside-source one, the first showed on 14 of the 18 boards
 * dealt at six a size and the second on 7, at every size. So the 5×5 takes two
 * boards and the cheap sizes six.
 *
 * Lazy module state, read-only and deterministic, so it is safe under
 * `isolate: false`.
 */
type OkHint = Extract<ReturnType<typeof hintOf>, { ok: true }>;
interface CorpusEntry {
  params: NetslideParams;
  state: NetslideState;
  aux?: string;
  steps: OkHint["steps"];
}
let narrationCorpusCache: CorpusEntry[] | null = null;
function narrationCorpus(): CorpusEntry[] {
  if (narrationCorpusCache) return narrationCorpusCache;
  const out: CorpusEntry[] = [];
  for (const params of [EASY_3X3, EVEN_4X4, HARD_5X5]) {
    for (let i = 0; i < (params === HARD_5X5 ? 2 : 6); i++) {
      const { state, aux } = board(params, `corpus-${params.w}-${i}`);
      const res = hintOf(state, aux);
      if (res.ok) out.push({ params, state, aux, steps: res.steps });
    }
  }
  if (out.length === 0) throw new Error("narration corpus produced no hints");
  narrationCorpusCache = out;
  return out;
}

/** Every slide the player may legally make. */
function legalMoves(s: NetslideState): NetslideMove[] {
  const moves: NetslideMove[] = [];
  for (let y = 0; y < s.h; y++) {
    if (y === s.cy) continue;
    moves.push({ type: "slide", axis: "row", index: y, dir: 1 });
    moves.push({ type: "slide", axis: "row", index: y, dir: -1 });
  }
  for (let x = 0; x < s.w; x++) {
    if (x === s.cx) continue;
    moves.push({ type: "slide", axis: "col", index: x, dir: 1 });
    moves.push({ type: "slide", axis: "col", index: x, dir: -1 });
  }
  return moves;
}

/** The shape name a tile's wires earn, worked out independently of the hint. */
function shapeOf(mask: number): string {
  switch (wireCount(mask)) {
    case 1:
      return "loose end";
    case 3:
      return "T-piece";
    case 4:
      return "cross";
    default:
      return mask === (L | R) || mask === (U | D) ? "straight" : "corner";
  }
}

describe("the hint's idea of where a tile belongs", () => {
  // There is no single answer to "where does this tile go?" in Netslide — its
  // tiles are wire masks and many are identical, so a tile belongs anywhere the
  // finished board wants those wires. The hint therefore does not decide it in
  // advance; it reads it off the plan it just computed. This is not a refinement:
  // deciding first (nearest cell that wants the wires, say) produces an answer the
  // plan then contradicts, and the hint narrates the very slide that finishes the
  // board as "(setting up)".
  it("only claims a tile belongs somewhere the finished board wants its wires", () => {
    let claims = 0;
    for (const seed of ["belong-a", "belong-b", "belong-c", "belong-d"]) {
      const { state, aux } = board(HARD_5X5, seed);
      const target = parseAux(aux ?? null, state.w * state.h) as Uint8Array;
      const res = hintOf(state, aux);
      if (!res.ok) continue;

      // Each step is narrated against the board *it* applies to, so the check has
      // to walk the plan rather than read every mark off the opening position.
      let at = state;
      for (const step of res.steps) {
        const marks = step.highlights as NetslideHint;
        if (marks.belongs) {
          expect(target[marks.destination]).toBe(at.tiles[marks.tile]);
          claims++;
        }
        at = netslideGame.executeMove(at, step.move);
      }
    }
    // A plan that stopped setting `belongs` would leave nothing to check.
    expect(claims, "no step claimed a tile belongs anywhere").toBeGreaterThan(0);
  });

  it("says a slide that finishes the board puts a tile where it belongs", () => {
    // A destination decided in advance narrates this finishing slide "(setting
    // up)", because the tile the slide delivers need not be the one it picked.
    const { state, aux } = board(EASY_3X3, "final-move-1");
    const solve = netslideGame.solve?.(state, state, aux);
    if (!solve?.ok) throw new Error("solve refused");
    const finished = netslideGame.executeMove(state, solve.move);

    // Knock the finished board one slide out of true. Not every slide does that —
    // a line of identical tiles slides to itself — so take the first that bites.
    const nudge = legalMoves(finished).find((m) => {
      const after = netslideGame.executeMove(finished, m);
      return !isComplete(after);
    });
    if (!nudge) throw new Error("no slide disturbs this board");

    const nudged = netslideGame.executeMove(finished, nudge);
    const fresh: NetslideState = {
      ...nudged,
      lastMoveRow: -1,
      lastMoveCol: -1,
      lastMoveDir: 0,
    };

    const res = hintOf(fresh, aux);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.steps).toHaveLength(1);
    expect(isComplete(netslideGame.executeMove(fresh, res.steps[0].move))).toBe(true);
    expect(res.steps[0].explanation).toContain("where it belongs");
    expect(res.steps[0].explanation).not.toMatch(/setting up|sets it up/);
  });
});

describe("netslide hint", () => {
  it("is refused on a finished board, by the engine", () => {
    const me = new Midend(netslideGame);
    me.newGame();
    expect(me.solve()).toBeNull();
    expect(me.hint()).toBe(ALREADY_SOLVED);
  });

  it("works on a board with no `aux` at all, like Solve does", () => {
    // A `params:desc` id — a shared link or a bookmark — carries no `aux`, and
    // Netslide has no solver, so both Hint and Solve recover the finished grid
    // from the board itself (`reconstruct.ts`).
    const { state } = board(EASY_3X3, "no-aux-1");

    const hint = hintOf(state, undefined);
    const solve = netslideGame.solve?.(state, state, undefined);

    expect(hint.ok).toBe(true);
    expect(solve?.ok).toBe(true);
    if (hint.ok) expect(hint.steps[0].explanation.length).toBeGreaterThan(0);
    if (solve?.ok) {
      expect(isComplete(netslideGame.executeMove(state, solve.move))).toBe(true);
    }
  });

  it("plays a whole plan out to a finished board", () => {
    const { desc, aux, state } = board(EASY_3X3, "plan-1");
    const res = hintOf(state, aux);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    const midend = new Midend(netslideGame);
    expect(midend.newGameFromId(`3x3b1:${desc}`)).toBeFalsy();

    let at = state;
    for (const step of res.steps) at = netslideGame.executeMove(at, step.move);
    expect(isComplete(at)).toBe(true);
  });

  it("never opens by undoing the slide the player has just made", () => {
    // Being told to undo the slide just made is useless advice, and it is the
    // shape a hint ping-pong takes, so the heuristic search is forbidden from
    // opening on the inverse of the player's last slide.
    //
    // The rule is what decides the opening only where the exact search is out of
    // reach and the heuristic would rather go back, so each board here is one
    // where it does. Measured 2026-10-07 with the rule lifted: the hint opened
    // by undoing 3 of 96 slides a player made of their own on a fresh 5x5,
    // these two among them, and none of 108 slides it had asked for itself.
    //
    // Note the *exact* endgame search is deliberately not bound by that rule. If
    // the player has just made a move that took them further away, the shortest
    // way home really does start by undoing it, and saying so is honest advice —
    // it also cannot loop, because a shortest plan strictly shortens the way home.
    const made: {
      params: NetslideParams;
      desc: string;
      own: NetslideMove & { type: "slide" };
    }[] = [
      {
        params: { ...HARD_5X5, wrapping: false },
        desc: "9d6c21d5556e578551d1213e4",
        own: { type: "slide", axis: "row", index: 0, dir: 1 },
      },
      {
        params: { ...HARD_5X5, wrapping: false, barrierProbability: 1 },
        desc: "9hdh6ch2h1hdh5h556eh5h7v8h5vh5h1dv1213ve4",
        own: { type: "slide", axis: "row", index: 0, dir: 1 },
      },
    ];
    const undone: boolean[] = [];
    for (const { params, desc, own } of made) {
      const after = netslideGame.executeMove(netslideGame.newState(params, desc), own);
      const next = hintOf(after);
      if (!next.ok) throw new Error(`${desc}: ${next.error}`);
      const proposed = next.steps[0].move;
      undone.push(
        proposed.type === "slide" &&
          proposed.axis === own.axis &&
          proposed.index === own.index &&
          proposed.dir === -own.dir,
      );
    }
    expect(undone).toEqual([false, false]);
  });
});

describe("netslide hint narration", () => {
  it("says what every slide is *for*, never only what it is", () => {
    for (const { steps } of narrationCorpus()) {
      for (const step of steps) {
        expect(step.explanation.length).toBeGreaterThan(0);
        // Movement game, so the imperative — never a modal of necessity, which
        // would claim the move is *forced*, and it is not.
        expect(step.explanation).not.toMatch(/\bmust\b|\bcan only be\b/);
        // A continuation leg carries no why: leg one of its journey already did,
        // and it is still on screen.
        if (step.continuesPrevious) continue;
        // Every other step states the consequence the move actually has — it puts a
        // tile where it belongs, or it is setting one up to get there. "Belongs" in
        // any of its phrasings is the arrival marker ("where it belongs", "it
        // belongs beside the source"); "(setting up)" and "that sets it up" are
        // the not-yet markers.
        // The vocabulary test below holds it to *one* "belongs" per sentence, so
        // this cannot be satisfied by a stutter.
        expect(step.explanation).toMatch(/\bbelongs\b|\(setting up\)|that sets it up/);
      }
    }
  });

  it("names the tile by the shape the player can see", () => {
    const { state, aux } = board(EASY_3X3, "shape-1");
    const res = hintOf(state, aux);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    // Each step is narrated against the board it applies to, so walk the plan.
    let at = state;
    for (const step of res.steps) {
      const mask = at.tiles[(step.highlights as NetslideHint).tile];
      at = netslideGame.executeMove(at, step.move);
      if (step.continuesPrevious) continue;
      // The name has to match the tile it is pointing at — a "corner" that is
      // really a T-piece is a lie the player can see through at a glance.
      expect(step.explanation).toContain(shapeOf(mask));
    }
  });

  it("teaches the frozen line, striped, when that is what the move turns on", () => {
    // The one thing Netslide can prove *about a move*: a tile sitting in the
    // source's row can only be shifted by its column (and the other way about).
    // The line is "this row", striped, never a number (the board draws none) and
    // never "the center row", false on an even-sized board, where the source
    // sits at ⌊w/2⌋ and the player can see it.
    const row = pinned("offFrozenRow");
    expect(row.step.explanation).toContain("This row never slides");
    expect(row.step.explanation).toContain("only a column move shifts");
    expect(marksOf(row.step).line).toEqual(
      Array.from({ length: row.state.w }, (_, x) => row.state.cy * row.state.w + x),
    );
    const col = pinned("offFrozenColumn");
    expect(col.step.explanation).toContain("This column never slides");
    expect(col.step.explanation).toContain("only a row move shifts");
    expect(marksOf(col.step).line).toEqual(
      Array.from({ length: col.state.h }, (_, y) => y * col.state.w + col.state.cx),
    );
  });

  it("never calls the source the center, and never says a tile belongs twice", () => {
    // "Center" is a claim the hint has not checked: the source sits at ⌊w/2⌋,
    // ⌊h/2⌋, so on the 4×4 it is row 3, column 3 — visibly not the center. And a
    // sentence that says a tile "belongs beside the source" and then ", where it
    // belongs" reads as a stutter.
    for (const { steps } of narrationCorpus()) {
      for (const step of steps) {
        expect(step.explanation).not.toMatch(/center|middle/i);
        expect(step.explanation.match(/belongs/g)?.length ?? 0).toBeLessThan(2);
      }
    }
  });

  it("keeps every sentence short enough to read at a glance", () => {
    // A preamble about the source never moving (a rule of the game, not a
    // deduction about the move) made the commonest sentence 146 characters, 1.8×
    // every other step, so it wrapped to two lines on a 4×4.
    let longest = 0;
    for (const { steps } of narrationCorpus()) {
      for (const step of steps) longest = Math.max(longest, step.explanation.length);
    }
    expect(longest).toBeLessThanOrEqual(120);
  });

  it("states plainly that a tile belongs beside the source, without a preamble", () => {
    const { state, step } = pinned("besideSource");
    // No preamble: the sentence opens on the tile or on the imperative,
    // never on a lecture about what the source can and cannot do.
    expect(step.explanation).toMatch(/^(This|Take this) /);
    // …and the claim it makes is true of the step it is attached to.
    const marks = marksOf(step);
    const dx = Math.abs((marks.destination % state.w) - state.cx);
    const dy = Math.abs(Math.floor(marks.destination / state.w) - state.cy);
    expect(marks.belongs).toBe(true);
    expect(dx + dy).toBe(1);
  });

  it("groups a tile's several slides into one journey", () => {
    // A tile that needs more than one slide to get home is one hint, not several:
    // the continuation legs are flagged, so the midend keeps them on screen and
    // auto-play runs them back to back.
    const legs = pinned("journey").steps.filter((s) => s.continuesPrevious);
    expect(legs.length).toBeGreaterThan(0);
    // A continuation leg works the same tile the leg before it did, and it
    // does not re-explain itself.
    for (const leg of legs)
      expect(leg.explanation).toMatch(/^Working on this [-a-zA-Z ]+: take it on to/);
  });
});

describe("netslide hintKeepTrack", () => {
  const { state, aux } = board(EASY_3X3, "track-1");
  const res = hintOf(state, aux);
  if (!res.ok) throw new Error("hint refused");
  const step = res.steps[0];

  it("counts the slide it asked for as completed", () => {
    expect(netslideGame.hintKeepTrack?.(step.move, step, state)).toBe("completed");
  });

  it("drops the plan on any other slide", () => {
    let others = 0;
    for (const other of legalMoves(state)) {
      if (
        other.type === "slide" &&
        step.move.type === "slide" &&
        other.axis === step.move.axis &&
        other.index === step.move.index &&
        other.dir === step.move.dir
      ) {
        continue;
      }
      expect(netslideGame.hintKeepTrack?.(other, step, state)).toBe("off");
      others++;
    }
    // A board offering only the hinted slide would assert nothing.
    expect(others, "no slide other than the hinted one").toBeGreaterThan(0);
  });
});

describe("netslide hint convergence", () => {
  // The guarantee that actually matters: from *any* position a player can
  // reach, following the hint must finish the board — never give up, never walk
  // in circles.
  //
  // This walks it the way the midend does. A followed hint keeps its plan
  // (`hintKeepTrack` says "completed" and the plan advances), so a hint is
  // recomputed only when its plan runs out — which is also what makes the
  // expensive endgame search affordable: it is paid once and its whole plan plays
  // out. How a plan can wander or loop, and what prevents each, is written at
  // `travelToFinish` and at the planner call in `hint.ts`.
  const SEEDS = ["conv-a", "conv-b", "conv-c", "conv-d"];

  /** The 3x3 boards are cheap, so they keep all four seeds. The 5x5 wrapping
   * ones are where the exact endgame search runs, and they were **32 s** of the
   * suite between them; the gate takes two of the four and `npm run test:slow`
   * takes all four. Two independent boards still exercise the guarantee — a plan
   * that wandered or looped would do so on essentially any board, which is how
   * both of Netslide's original failures presented. */
  const seedsFor = (params: NetslideParams): readonly string[] =>
    params === HARD_5X5 ? SEEDS.slice(0, seedBudget(2, SEEDS.length)) : SEEDS;

  // These walk a board that came with the generator's answer. The same walk with
  // no answer to work from is `netslide-reconstruct.test.ts`'s, on every preset.
  for (const params of [EASY_3X3, HARD_5X5]) {
    const label = `${params.w}x${params.h}${params.wrapping ? " wrapping" : ""}`;

    it(`${label}: following the hint finishes the board, with the generator's answer`, () => {
      for (const seed of seedsFor(params)) {
        const { desc, aux } = netslideGame.newDesc(
          params,
          randomNew(`${label}-true-${seed}`),
        );
        let at = netslideGame.newState(params, desc);

        for (let ask = 0; ask < 40 && !isComplete(at); ask++) {
          const res = hintOf(at, aux);
          expect(res.ok, `${seed}: hint gave up`).toBe(true);
          if (!res.ok) break;

          for (const step of res.steps) {
            at = netslideGame.executeMove(at, step.move);
            if (isComplete(at)) break;
          }
        }
        expect(isComplete(at), `${seed}: never finished`).toBe(true);
      }
    });
  }

  it("3x3: recomputing from scratch after *every* move still finishes, and never loops", () => {
    // The strictest form — throw the plan away after every single move, which is
    // what `hint-resume.test.ts` does for every game in the collection. Asserted
    // here with the board history kept, so a loop is caught the moment it closes
    // rather than by a move cap.
    for (const seed of ["strict-a", "strict-b", "strict-c", "strict-d"]) {
      const { desc, aux } = netslideGame.newDesc(EASY_3X3, randomNew(seed));
      let at = netslideGame.newState(EASY_3X3, desc);
      const seen = new Set<string>([at.tiles.join(",")]);

      for (let move = 0; move < 200 && !isComplete(at); move++) {
        const res = hintOf(at, aux);
        expect(res.ok, `${seed}: hint gave up after ${move} moves`).toBe(true);
        if (!res.ok) break;

        at = netslideGame.executeMove(at, res.steps[0].move);
        const key = at.tiles.join(",");
        expect(
          seen.has(key),
          `${seed}: the walk revisited a board — it is looping`,
        ).toBe(false);
        seen.add(key);
      }
      expect(isComplete(at), `${seed}: never finished`).toBe(true);
    }
  });
});

describe("netslide hint rendering", () => {
  it("paints the hint on a board that did not otherwise change", () => {
    // The bug this guards is a real one and has shipped in this codebase before:
    // leave the hint overlay out of the render cache's diff key and it silently
    // never appears, because a hint changes no tile. Paint, ask for a hint, paint
    // the *same* draw state again — the highlight must turn up on the second paint.
    const { aux, state } = board(EASY_3X3, "repaint-1");
    const ui = newUi(state);
    const ds = newDrawState(state, 32);
    const palette = colors([1, 1, 1]);

    const first = new RecordingDrawing(palette);
    redraw(first, ds, null, state, 0, ui, 0, 0);
    expect(first.ops.some((op) => "color" in op && op.color === COL_HINT)).toBe(false);

    const res = hintOf(state, aux);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    const second = new RecordingDrawing(palette);
    redraw(
      second,
      ds,
      null,
      state,
      0,
      ui,
      0,
      0,
      res.steps[0] as HintStep<NetslideMove, NetslideHint>,
    );

    expect(
      second.ops.some(
        (op) =>
          ("color" in op && op.color === COL_HINT) ||
          ("fill" in op && op.fill === COL_HINT),
      ),
      "the hint did not repaint on an otherwise-unchanged board",
    ).toBe(true);
  });

  it("marks the tile, its destination and the arrow to press", () => {
    // A `params:desc` id carries no `aux`, so the hint plans against the
    // solution it reconstructs from the board.
    const result = renderScenario({
      game: netslideGame,
      id: "3x3b1:2h2he2d19vcv5",
      showHint: true,
    });

    // The tile being placed is double-ringed in the hint color, and its
    // destination outlined in it.
    const rects = result.recording.ops.filter(
      (op) => op.op === "rect" && op.color === COL_HINT,
    );
    expect(rects.length).toBeGreaterThan(0);

    // The arrow the player should press is drawn in it too — exactly one.
    const arrows = result.recording.ops.filter(
      (op) => op.op === "polygon" && op.fill === COL_HINT,
    );
    expect(arrows).toHaveLength(1);

    // This step says a line never slides, so that line is hatched: one hatch
    // per cell of it, and nothing more.
    expect(result.hint?.explanation).toMatch(/never slides/);
    const line = (result.hint?.highlights as NetslideHint).line;
    expect(line).toHaveLength(3);
    expect(opsOfKind(result.recording.ops, "hatch")).toHaveLength(line.length);

    expect(result.recording.ops).toMatchSnapshot();
  });
});

describe("the hint marks while the hinted slide animates", () => {
  // Mid-slide, the two marks behave differently:
  //
  //  - The *tile* mark is on a **tile**, and the tile is moving. The step's cell
  //    index is the cell the tile came *from* (the midend advances the plan only
  //    when the animation ends), so painting there would mark whatever slid into
  //    that cell. It must ride with the tile, painted on the cell it lands in.
  //  - The *destination* mark is on a **cell**, and cells do not move. It must
  //    stay put while the line slides under it.
  const TS = 32;
  const TILE_BORDER = 1;
  const border = (ts: number) => Math.floor((3 * ts) / 4) + 1;

  /** The top side of the hinted **tile's** double ring, by its distinctive size:
   * it spans the tile's face, where the destination's outline is inset past it. */
  function hintFill(ops: RecordingDrawing["ops"]) {
    return ops.find(
      (op) =>
        op.op === "rect" &&
        op.color === COL_HINT &&
        op.w === TS - TILE_BORDER &&
        op.h === Math.max(2, Math.round(TS / 16)),
    );
  }

  /** The top edge of the destination outline, by its distinctive size. */
  function hintOutlineTop(ops: RecordingDrawing["ops"]) {
    const inset = TILE_BORDER + 1;
    const side = TS - 2 * inset;
    const thickness = Math.max(2, Math.round(TS / 16));
    return ops.find(
      (op) =>
        op.op === "rect" &&
        op.color === COL_HINT &&
        op.w === side &&
        op.h === thickness,
    );
  }

  /** A mid-slide frame of a hinted move that both moves a tile and aims at a
   * cell on the line being slid. */
  function animatingFrame() {
    const pin = pinned("aimsAlongItsSlide");
    const { state } = pin;
    const step = pin.step as HintStep<NetslideMove, NetslideHint>;
    const marks = marksOf(step);
    if (step.move.type !== "slide") throw new Error("unreachable");
    const slide = step.move;

    const after = netslideGame.executeMove(state, step.move);
    const ds = newDrawState(after, TS);
    const palette = colors([1, 1, 1]);

    // Paint the pre-move frame first, so the draw state's cache is warm exactly as
    // it is in the app when the slide begins.
    redraw(new RecordingDrawing(palette), ds, null, state, 0, newUi(state), 0, 0, step);

    // Halfway through the slide: the line is drawn half a tile back along its
    // direction of travel.
    const rec = new RecordingDrawing(palette);
    redraw(rec, ds, state, after, 0, newUi(after), ANIM_TIME / 2, 0, step);
    return { state, after, slide, marks, rec };
  }

  it("carries the tile mark along with the tile it is marking", () => {
    const { after, slide, marks, rec } = animatingFrame();

    // Half a slide in, the tile is drawn half a tile back from the cell it lands in.
    const shift = 0.5 * slide.dir;
    const lx = marks.landing % after.w;
    const ly = Math.floor(marks.landing / after.w);
    const bx =
      border(TS) + TS * lx + Math.trunc((slide.axis === "row" ? shift : 0) * TS);
    const by =
      border(TS) + TS * ly + Math.trunc((slide.axis === "col" ? shift : 0) * TS);

    const fill = hintFill(rec.ops);
    expect(fill, "the hinted tile carries no mark at all").toBeDefined();
    expect(fill).toMatchObject({ x: bx + TILE_BORDER, y: by + TILE_BORDER });
  });

  it("repaints the lines beside a sliding line, whose shared border it paints over", () => {
    const { after, slide, rec } = animatingFrame();
    const across = slide.axis === "row" ? after.h : after.w;
    const along = slide.axis === "row" ? after.w : after.h;
    const beside = [slide.index - 1, slide.index + 1].filter(
      (k) => k >= 0 && k < across,
    );
    expect(beside.length).toBeGreaterThan(0);

    // A tile's repaint starts by blanking its whole frame, borders included.
    const blanks = opsOfKind(rec.ops, "rect").filter(
      (o) => o.w === TS + TILE_BORDER && o.h === TS + TILE_BORDER,
    );
    for (const k of beside) {
      for (let j = 0; j < along; j++) {
        const [x, y] = slide.axis === "row" ? [j, k] : [k, j];
        const at = { x: border(TS) + TS * x, y: border(TS) + TS * y };
        expect(
          blanks.some((o) => o.x === at.x && o.y === at.y),
          `tile ${x},${y} beside the slide was not repainted`,
        ).toBe(true);
      }
    }
  });

  it("leaves the destination mark where the destination is", () => {
    const { after, marks, rec } = animatingFrame();

    // The destination is a *cell*. The line slides under it; it does not move.
    const dx = marks.destination % after.w;
    const dy = Math.floor(marks.destination / after.w);
    const inset = TILE_BORDER + 1;

    const outline = hintOutlineTop(rec.ops);
    expect(outline, "the destination is not outlined at all").toBeDefined();
    expect(outline).toMatchObject({
      x: border(TS) + TS * dx + inset,
      y: border(TS) + TS * dy + inset,
    });
  });
});

/**
 * Tracks' explained hint: the claims its narration makes, and the two things
 * only this game can check.
 *
 * The cross-game guards already cover narration *form* (necessity voice, the
 * length limit, no em-dash), plan purity, no-op-free plans and the overlay
 * reaching the render cache — Tracks joined all six by declaring `hint()`
 * (`engine/testing/hint-games.ts`). What is left here is per-game:
 *
 *  - **every move a step asks for is one the player is allowed to make.**
 *    Tracks' `executeMove` *throws* on an op `uiCanFlipSquare` /
 *    `uiCanFlipEdge` refuses, and it refuses several things the solver may
 *    freely deduce — most sharply, laying track on a side of a **clue** square.
 *    No cross-game guard can see this: they replay a plan through
 *    `executeMove`, which would throw rather than fail an assertion, and only
 *    on the seed that reached it.
 *  - **what the plan hides is exactly what the player's board already says.**
 *    The production predicate reads board facts; these guards hold it to the
 *    game's own move legality, judged on the board *before* each firing landed,
 *    so the two derivations are independent. It is also what would catch
 *    `check-single` if it ever started firing: its conclusions are real, and a
 *    reason-less firing that is not evident fails here.
 */

import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { type Narration, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { evident, narrate, type TracksPicture, type TracksRung } from "./hint.ts";
import { PIECE } from "./hint-text.ts";
import { tracksGame } from "./index.ts";
import { uiCanFlipEdge, uiCanFlipSquare } from "./moves.ts";
import {
  type TracksFiring,
  type TracksReason,
  tracksRecordingPass,
  tracksSolve,
} from "./solver.ts";
import {
  type Board,
  D,
  DIFF_EASY,
  DIFF_HARD,
  DIFF_TRICKY,
  DX,
  DY,
  E_TRACK,
  FLIP,
  inGrid,
  R,
  S_TRACK,
  sEDirs,
  sEFlags,
  stateToBoard,
  type TracksMove,
  type TracksOp,
  type TracksParams,
  type TracksState,
  U,
} from "./state.ts";

const SHAPES: TracksParams[] = [
  { w: 8, h: 8, diff: DIFF_EASY, singleOnes: true },
  { w: 8, h: 8, diff: DIFF_TRICKY, singleOnes: true },
  { w: 10, h: 10, diff: DIFF_HARD, singleOnes: true },
];
const SEEDS = ["hint-a", "hint-b", "hint-c"];

/** What a step's words outline: squares, sides and clues. */
function outlinedBy(step: { words?: Narration }) {
  const outlined = stepMarks(step).of("outline", PIECE);
  const board = outlined.flatMap((p) => ("clue" in p ? [] : [p]));
  return {
    area: board.flatMap((p) => (p.dir === undefined ? [p] : [])),
    areaEdges: board.flatMap((p) => (p.dir === undefined ? [] : [p])),
    clues: outlined.flatMap((p) => ("clue" in p ? [p.clue] : [])),
  };
}

/** Walk a board to solved by following the plan's first step, collecting every
 * step it ever showed. One walk covers far more firings than one plan does. */
function walk(params: TracksParams, seed: string) {
  const { desc } = tracksGame.newDesc(params, randomNew(seed));
  let state = tracksGame.newState(params, desc);
  const steps: { step: (typeof out)[number]; before: TracksState }[] = [];
  const out: HintStep<TracksMove, unknown, TracksRung>[] = [];
  for (let i = 0; i < 900; i++) {
    if (tracksGame.status(state) === "solved") break;
    const res = tracksGame.hint?.(state);
    if (!res?.ok) throw new Error(`${seed}: refused after ${i}: ${res?.error}`);
    const step = res.steps[0];
    out.push(step);
    steps.push({ step, before: state });
    state = tracksGame.executeMove(state, step.move);
  }
  return { steps, solved: tracksGame.status(state) === "solved" };
}

describe("every move a Tracks hint asks for is one the player may make", () => {
  // The interesting refusal is on a *clue* square: `uiCanFlipEdge` will not lay
  // track on any side of one, while the solver's rungs set edge flags there
  // without a thought. The port survives it because a clue square arrives from
  // the desc with both its track sides already laid, so no deduction ever adds
  // a third — but that is an argument, and this is the check.
  for (const params of SHAPES) {
    for (const seed of SEEDS) {
      it(`${params.w}x${params.h} tier ${params.diff} / ${seed}`, () => {
        const { steps, solved } = walk(
          params,
          `legal-${params.w}-${params.diff}-${seed}`,
        );
        expect(steps.length, "no steps to check").toBeGreaterThan(10);
        expect(solved, "following the plan did not finish the board").toBe(true);
        for (const { step, before } of steps) {
          const b = stateToBoard(before);
          for (const op of step.move.ops) {
            const legal =
              op.kind === "square"
                ? uiCanFlipSquare(b, op.x, op.y, !op.track)
                : uiCanFlipEdge(b, op.x, op.y, op.dir ?? 0, !op.track);
            expect(
              legal,
              `${JSON.stringify(op)} is a move the player is not allowed to make`,
            ).toBe(true);
          }
        }
      });
    }
  }
});

/**
 * Would the game refuse the player the *opposite* of this op, on the board
 * before it landed? The derivation the production `evident` is held to: it
 * asks `uiCanFlipSquare` / `uiCanFlipEdge` directly rather than reading board
 * facts, so the two are independent. Judged *before*, because after the op
 * lands its own flag is what makes the contrary illegal, and every block would
 * read as evident.
 */
function contraryRefused(before: Board, op: TracksOp): boolean {
  return op.kind === "square"
    ? !uiCanFlipSquare(before, op.x, op.y, op.track)
    : !uiCanFlipEdge(before, op.x, op.y, op.dir ?? 0, op.track);
}

/** Every firing the recording pass makes on a fresh board, each with the board
 * as it stood before the firing and as it stands straight after. */
function* recordedFirings(
  params: TracksParams,
  seed: string,
): Generator<{ f: TracksFiring; before: Board; after: Board }> {
  const { desc } = tracksGame.newDesc(params, randomNew(seed));
  const board = stateToBoard(tracksGame.newState(params, desc));
  const next = tracksRecordingPass(board, params.diff, stepBudget("probe"));
  for (;;) {
    const before: Board = { ...board, sflags: Int32Array.from(board.sflags) };
    const f = next();
    if (!f) return;
    // Consumed before the next `next()` call, so `after` is this firing's board.
    yield { f, before, after: board };
  }
}

describe("what the plan hides is exactly what the board already says", () => {
  it("every firing with no premise is one the player's board already decides", () => {
    // The declaration, held to the derivation. The reason-less rules are a
    // list somebody wrote; this is what makes it impossible for the list to
    // hide a real deduction — including `check-single`, whose conclusions are
    // real, should it ever start firing.
    let reasonless = 0;
    for (const params of SHAPES) {
      for (const seed of SEEDS) {
        for (const { f, before } of recordedFirings(
          params,
          `hide-${params.w}-${params.diff}-${seed}`,
        )) {
          if (f.reason !== null) continue;
          reasonless++;
          for (const op of f.ops) {
            expect(
              contraryRefused(before, op),
              `${JSON.stringify(op)} was hidden but the player could have chosen otherwise`,
            ).toBe(true);
          }
        }
      }
    }
    expect(
      reasonless,
      "no reason-less firing; the guard proves nothing",
    ).toBeGreaterThan(100);
  });

  it("the production predicate and the legality test agree on every firing", () => {
    let firings = 0;
    let evidentSeen = 0;
    for (const params of SHAPES) {
      for (const seed of SEEDS) {
        for (const { f, before, after } of recordedFirings(
          params,
          `agree-${params.w}-${params.diff}-${seed}`,
        )) {
          firings++;
          const byFacts = f.ops.every((op) => evident(after, op));
          const byLegality = f.ops.every((op) => contraryRefused(before, op));
          if (byLegality) evidentSeen++;
          expect(byFacts, `${JSON.stringify(f.ops)}`).toBe(byLegality);
        }
      }
    }
    // Both classes, or agreement is vacuous on one side.
    expect(evidentSeen).toBeGreaterThan(50);
    expect(firings - evidentSeen).toBeGreaterThan(50);
  });

  it("no step a player is shown is one their board already decides", () => {
    // A guard over what reaches the screen: no step asks for sides the player
    // has already closed off. Every op, not just the step as a whole, so a step
    // cannot smuggle a redundant op in beside a real one.
    let shown = 0;
    for (const params of SHAPES) {
      for (const seed of SEEDS) {
        const { steps } = walk(params, `shown-${params.w}-${params.diff}-${seed}`);
        for (const { step, before } of steps) {
          shown++;
          const b = stateToBoard(before);
          for (const op of step.move.ops) {
            expect(
              contraryRefused(b, op),
              `"${step.explanation}" asks for ${JSON.stringify(op)}, which the board already decides`,
            ).toBe(false);
          }
        }
      }
    }
    expect(shown).toBeGreaterThan(200);
  });

  it("the reported board: a finished piece beside squares marked empty gets no step about its sides", () => {
    // The entrance's piece is given, and the player marks the squares beyond
    // its two free sides empty; no step may then ask them to block those sides.
    let checked = 0;
    for (let s = 0; s < 40 && checked < 3; s++) {
      const params = SHAPES[1];
      const { desc } = tracksGame.newDesc(params, randomNew(`reported-${s}`));
      const fresh = tracksGame.newState(params, desc);
      const solution = stateToBoard(fresh);
      if (tracksSolve(solution, DIFF_HARD).ret !== 1) continue;
      const b = stateToBoard(fresh);
      const ax = 0;
      const ay = b.rowS;
      const beyond: TracksOp[] = [];
      for (const d of [U, D, R]) {
        if (sEFlags(b, ax, ay, d) & E_TRACK) continue; // the piece's own side
        const nx = ax + DX(d);
        const ny = ay + DY(d);
        if (!inGrid(b, nx, ny) || solution.sflags[ny * b.w + nx] & S_TRACK) continue;
        beyond.push({ kind: "square", x: nx, y: ny, track: false, set: true });
      }
      if (beyond.length < 2) continue;
      const res = tracksGame.hint?.(tracksGame.executeMove(fresh, { ops: beyond }));
      if (!res?.ok) continue;
      checked++;
      for (const step of res.steps) {
        for (const op of step.move.ops) {
          if (op.kind !== "edge" || op.track) continue;
          const d = op.dir ?? 0;
          const touches =
            (op.x === ax && op.y === ay) ||
            (op.x + DX(d) === ax && op.y + DY(d) === ay);
          expect(touches, `"${step.explanation}" blocks a side of the entrance`).toBe(
            false,
          );
        }
      }
    }
    expect(checked, "no seed reproduced the reported shape").toBeGreaterThan(0);
  });
});

describe("the picture holds exactly the number the sentence states", () => {
  it("a clue-is-met step outlines that clue's own track squares", () => {
    let checked = 0;
    for (const params of SHAPES) {
      for (const seed of SEEDS) {
        const { steps } = walk(params, `count-${params.w}-${params.diff}-${seed}`);
        for (const { step, before } of steps) {
          if (step.rung !== "clueFull") continue;
          const hl = outlinedBy(step);
          if (hl.clues.length !== 1) continue;
          // "already has all N of the track squares its clue allows" — so the
          // outline must hold N cells, and each must actually carry track.
          const m = step.explanation.match(/already has all (\d+) of the track/);
          if (!m) continue;
          checked++;
          expect(hl.area.length, step.explanation).toBe(Number(m[1]));
          const b = stateToBoard(before);
          for (const c of hl.area) {
            const carries =
              (b.sflags[c.y * b.w + c.x] & 1) !== 0 ||
              sEDirs(b, c.x, c.y, E_TRACK) !== 0;
            expect(carries, `outlined (${c.x},${c.y}) carries no track`).toBe(true);
          }
        }
      }
    }
    expect(checked, "no clue-is-met step in the corpus").toBeGreaterThan(5);
  });

  it("a parity step's outlined crossings are the number it counts", () => {
    let checked = 0;
    for (const seed of SEEDS) {
      const params = SHAPES[2];
      const { steps } = walk(params, `parity-${seed}`);
      for (const { step } of steps) {
        if (step.rung !== "crossingParity") continue;
        checked++;
        const said = /no crossing is marked yet/.test(step.explanation)
          ? 0
          : Number(
              step.explanation.match(/and (\d+) crossings? (?:is|are) marked/)?.[1],
            );
        const hl = outlinedBy(step);
        expect(hl.areaEdges.length, step.explanation).toBe(said);
        // The block is hatched, not outlined: the sentence is about it.
        expect(stepMarks(step).of("stripes", PIECE).length).toBeGreaterThan(0);
        expect(hl.area).toEqual([]);
      }
    }
    expect(checked, "no parity step in the corpus").toBeGreaterThan(0);
  });
});

/** A fresh board whose plan blocks a join of A's run to B's that would strand
 * no track and leave a clue short. It takes a board with no given piece
 * between the two runs, which the shapes above are too large to deal: none
 * in 10,356 firings on 119 of them, and this one among 450 boards of 4x4 to
 * 7x7 (2026-10-07). */
const FINISHES_EARLY = "5x4dt:j5d9d,S2,3,3,3,3,3,3,S4,4";

/** A position for every rung a step can be. */
describeHintPins({
  game: tracksGame,
  params: SHAPES,
  pins: {
    /** Kept by hand: see `FINISHES_EARLY`. */
    wouldFinishEarly: FINISHES_EARLY,
    /** Held on 1324 of 1718 positions walked. */
    onlyOneSideLeft: "8x8de:k3l6c5e6v9f,4,S7,6,6,6,5,6,2,8,6,7,S6,6,5,2,2",
    /** Held on 1718 of 1718 positions walked. */
    bothSidesLeft: "8x8de:h6eCzvA,2,4,2,2,1,4,7,S6,2,S6,5,4,2,3,3,3",
    /** Held on 1371 of 1718 positions walked. */
    clueFull: "8x8de:c5zbCm3n9b,2,4,3,5,1,S2,8,2,6,4,2,2,S5,4,2,2",
    /** Held on 1427 of 1718 positions walked. */
    clueExact: "8x8dt:p6zo9e,3,1,S2,4,6,4,2,6,8,4,S2,3,3,4,2,2",
    /** Held on 848 of 1718 positions walked. */
    wouldCloseLoop: {
      id: "10x10dh:zdCo956zaAp3cCb,3,2,1,4,6,4,10,S8,6,6,4,3,3,S5,6,6,9,7,3,4",
      moves:
        '[{"ops":[{"kind":"square","x":6,"y":0,"track":true,"set":true},{"kind":"square","x":6,"y":1,"track":true,"set":true},{"kind":"square","x":6,"y":2,"track":true,"set":true},{"kind":"square","x":6,"y":3,"track":true,"set":true}]},{"ops":[{"kind":"square","x":0,"y":9,"track":false,"set":true},{"kind":"square","x":1,"y":9,"track":false,"set":true},{"kind":"square","x":2,"y":9,"track":false,"set":true},{"kind":"square","x":5,"y":9,"track":false,"set":true},{"kind":"square","x":8,"y":9,"track":false,"set":true},{"kind":"square","x":9,"y":9,"track":false,"set":true}]},{"ops":[{"kind":"edge","x":4,"y":9,"dir":2,"track":true,"set":true}]},{"ops":[{"kind":"edge","x":6,"y":9,"dir":2,"track":true,"set":true}]},{"ops":[{"kind":"square","x":0,"y":8,"track":false,"set":true},{"kind":"square","x":1,"y":8,"track":false,"set":true},{"kind":"square","x":2,"y":8,"track":false,"set":true},{"kind":"square","x":5,"y":8,"track":false,"set":true},{"kind":"square","x":7,"y":8,"track":false,"set":true},{"kind":"square","x":8,"y":8,"track":false,"set":true},{"kind":"square","x":9,"y":8,"track":false,"set":true}]}]',
    },
    /** Held on 248 of 1718 positions walked. */
    wouldStrandTrack: {
      id: "8x8de:k3l6c5e6v9f,4,S7,6,6,6,5,6,2,8,6,7,S6,6,5,2,2",
      moves:
        '[{"ops":[{"kind":"square","x":0,"y":7,"track":false,"set":true}]},{"ops":[{"kind":"square","x":0,"y":0,"track":true,"set":true},{"kind":"square","x":1,"y":0,"track":true,"set":true},{"kind":"square","x":2,"y":0,"track":true,"set":true},{"kind":"square","x":4,"y":0,"track":true,"set":true},{"kind":"square","x":5,"y":0,"track":true,"set":true},{"kind":"square","x":6,"y":0,"track":true,"set":true},{"kind":"square","x":7,"y":0,"track":true,"set":true}]},{"ops":[{"kind":"edge","x":0,"y":0,"dir":1,"track":true,"set":true},{"kind":"edge","x":0,"y":0,"dir":8,"track":true,"set":true}]},{"ops":[{"kind":"edge","x":7,"y":0,"dir":4,"track":true,"set":true},{"kind":"edge","x":7,"y":0,"dir":8,"track":true,"set":true}]},{"ops":[{"kind":"square","x":0,"y":4,"track":false,"set":true},{"kind":"square","x":0,"y":5,"track":false,"set":true},{"kind":"square","x":0,"y":6,"track":false,"set":true}]},{"ops":[{"kind":"square","x":7,"y":2,"track":false,"set":true},{"kind":"square","x":7,"y":3,"track":false,"set":true},{"kind":"square","x":7,"y":4,"track":false,"set":true},{"kind":"square","x":7,"y":5,"track":false,"set":true},{"kind":"square","x":7,"y":6,"track":false,"set":true},{"kind":"square","x":7,"y":7,"track":false,"set":true}]},{"ops":[{"kind":"edge","x":7,"y":1,"dir":4,"track":true,"set":true}]},{"ops":[{"kind":"square","x":1,"y":2,"track":true,"set":true},{"kind":"square","x":2,"y":2,"track":true,"set":true},{"kind":"square","x":3,"y":2,"track":true,"set":true},{"kind":"square","x":4,"y":2,"track":true,"set":true},{"kind":"square","x":5,"y":2,"track":true,"set":true},{"kind":"square","x":6,"y":2,"track":true,"set":true}]},{"ops":[{"kind":"square","x":3,"y":4,"track":true,"set":true},{"kind":"square","x":4,"y":4,"track":true,"set":true},{"kind":"square","x":5,"y":4,"track":true,"set":true},{"kind":"square","x":6,"y":4,"track":true,"set":true}]},{"ops":[{"kind":"square","x":3,"y":7,"track":false,"set":true},{"kind":"square","x":4,"y":7,"track":false,"set":true},{"kind":"square","x":5,"y":7,"track":false,"set":true},{"kind":"square","x":6,"y":7,"track":false,"set":true}]},{"ops":[{"kind":"edge","x":2,"y":7,"dir":2,"track":true,"set":true}]},{"ops":[{"kind":"square","x":2,"y":1,"track":false,"set":true},{"kind":"square","x":2,"y":5,"track":false,"set":true}]},{"ops":[{"kind":"edge","x":2,"y":0,"dir":1,"track":true,"set":true},{"kind":"edge","x":2,"y":0,"dir":4,"track":true,"set":true}]},{"ops":[{"kind":"edge","x":4,"y":0,"dir":1,"track":true,"set":true},{"kind":"edge","x":4,"y":0,"dir":8,"track":true,"set":true}]},{"ops":[{"kind":"edge","x":4,"y":2,"dir":1,"track":true,"set":true},{"kind":"edge","x":4,"y":2,"dir":4,"track":true,"set":true}]},{"ops":[{"kind":"square","x":1,"y":5,"track":true,"set":true},{"kind":"square","x":3,"y":5,"track":true,"set":true},{"kind":"square","x":4,"y":5,"track":true,"set":true},{"kind":"square","x":5,"y":5,"track":true,"set":true},{"kind":"square","x":6,"y":5,"track":true,"set":true}]},{"ops":[{"kind":"edge","x":1,"y":5,"dir":2,"track":true,"set":true},{"kind":"edge","x":1,"y":5,"dir":8,"track":true,"set":true}]},{"ops":[{"kind":"edge","x":1,"y":6,"dir":1,"track":true,"set":true}]},{"ops":[{"kind":"square","x":3,"y":6,"track":false,"set":true}]},{"ops":[{"kind":"edge","x":3,"y":5,"dir":1,"track":true,"set":true},{"kind":"edge","x":3,"y":5,"dir":2,"track":true,"set":true}]},{"ops":[{"kind":"square","x":4,"y":6,"track":false,"set":true}]},{"ops":[{"kind":"square","x":5,"y":1,"track":false,"set":true},{"kind":"square","x":5,"y":6,"track":false,"set":true}]},{"ops":[{"kind":"edge","x":5,"y":0,"dir":1,"track":true,"set":true}]},{"ops":[{"kind":"edge","x":6,"y":1,"dir":8,"track":true,"set":true}]},{"ops":[{"kind":"square","x":6,"y":6,"track":false,"set":true}]},{"ops":[{"kind":"edge","x":6,"y":5,"dir":2,"track":true,"set":true},{"kind":"edge","x":6,"y":5,"dir":4,"track":true,"set":true}]},{"ops":[{"kind":"square","x":6,"y":3,"track":true,"set":true}]},{"ops":[{"kind":"square","x":1,"y":1,"track":true,"set":true}]},{"ops":[{"kind":"edge","x":1,"y":1,"dir":4,"track":true,"set":true},{"kind":"edge","x":1,"y":1,"dir":8,"track":true,"set":true}]},{"ops":[{"kind":"edge","x":0,"y":2,"dir":1,"track":true,"set":true}]},{"ops":[{"kind":"square","x":1,"y":3,"track":false,"set":true}]},{"ops":[{"kind":"edge","x":2,"y":2,"dir":1,"track":true,"set":true},{"kind":"edge","x":2,"y":2,"dir":8,"track":true,"set":true}]},{"ops":[{"kind":"edge","x":3,"y":3,"dir":8,"track":true,"set":true}]},{"ops":[{"kind":"edge","x":4,"y":4,"dir":1,"track":true,"set":true},{"kind":"edge","x":4,"y":4,"dir":8,"track":true,"set":true}]},{"ops":[{"kind":"edge","x":5,"y":5,"dir":2,"track":true,"set":true}]},{"ops":[{"kind":"edge","x":6,"y":4,"dir":2,"track":true,"set":true}]}]',
    },
    /** Held on 162 of 1718 positions walked. */
    looseEndSpans: {
      id: "8x8dt:h6q6r5e5kA,4,7,5,5,5,4,6,S4,3,S3,6,5,6,7,7,3",
      moves: [{ ops: [{ kind: "edge", x: 0, y: 0, dir: 1, track: true, set: true }] }],
    },
    /** Held on 636 of 1718 positions walked. */
    sharedFate: {
      id: "10x10dh:zb3k6zzc9c,5,3,2,1,2,3,S2,5,4,5,6,8,6,2,S2,1,2,2,1,2",
      moves:
        '[{"ops":[{"kind":"square","x":0,"y":9,"track":false,"set":true},{"kind":"square","x":1,"y":9,"track":false,"set":true},{"kind":"square","x":2,"y":9,"track":false,"set":true},{"kind":"square","x":3,"y":9,"track":false,"set":true},{"kind":"square","x":4,"y":9,"track":false,"set":true},{"kind":"square","x":5,"y":9,"track":false,"set":true},{"kind":"square","x":8,"y":9,"track":false,"set":true},{"kind":"square","x":9,"y":9,"track":false,"set":true}]},{"ops":[{"kind":"edge","x":7,"y":9,"dir":2,"track":true,"set":true}]},{"ops":[{"kind":"square","x":0,"y":8,"track":false,"set":true},{"kind":"square","x":1,"y":8,"track":false,"set":true},{"kind":"square","x":2,"y":8,"track":false,"set":true},{"kind":"square","x":3,"y":8,"track":false,"set":true},{"kind":"square","x":4,"y":8,"track":false,"set":true},{"kind":"square","x":5,"y":8,"track":false,"set":true},{"kind":"square","x":6,"y":8,"track":false,"set":true},{"kind":"square","x":8,"y":8,"track":false,"set":true},{"kind":"square","x":9,"y":8,"track":false,"set":true}]},{"ops":[{"kind":"edge","x":7,"y":8,"dir":2,"track":true,"set":true}]}]',
    },
    /** Held on 232 of 1718 positions walked. */
    crossingParity: {
      id: "10x10dh:zd6lAeCf96o9i3dCiAa,2,3,4,5,4,4,5,4,S4,4,2,2,3,S3,4,6,4,6,6,3",
      moves:
        '[{"ops":[{"kind":"square","x":9,"y":9,"track":false,"set":true}]},{"ops":[{"kind":"square","x":9,"y":8,"track":false,"set":true}]},{"ops":[{"kind":"square","x":0,"y":0,"track":false,"set":true},{"kind":"square","x":0,"y":1,"track":false,"set":true},{"kind":"square","x":0,"y":4,"track":false,"set":true},{"kind":"square","x":0,"y":5,"track":false,"set":true},{"kind":"square","x":0,"y":6,"track":false,"set":true},{"kind":"square","x":0,"y":7,"track":false,"set":true},{"kind":"square","x":0,"y":8,"track":false,"set":true},{"kind":"square","x":0,"y":9,"track":false,"set":true}]},{"ops":[{"kind":"edge","x":0,"y":2,"dir":1,"track":true,"set":true}]},{"ops":[{"kind":"square","x":3,"y":0,"track":false,"set":true},{"kind":"square","x":3,"y":1,"track":false,"set":true},{"kind":"square","x":3,"y":2,"track":false,"set":true},{"kind":"square","x":3,"y":6,"track":false,"set":true},{"kind":"square","x":3,"y":9,"track":false,"set":true}]},{"ops":[{"kind":"square","x":1,"y":4,"track":false,"set":true},{"kind":"square","x":2,"y":4,"track":false,"set":true},{"kind":"square","x":4,"y":4,"track":false,"set":true},{"kind":"square","x":5,"y":4,"track":false,"set":true},{"kind":"square","x":6,"y":4,"track":false,"set":true}]},{"ops":[{"kind":"edge","x":4,"y":7,"dir":8,"track":false,"set":true}]},{"ops":[{"kind":"square","x":1,"y":3,"track":false,"set":true}]},{"ops":[{"kind":"square","x":9,"y":3,"track":false,"set":true}]},{"ops":[{"kind":"square","x":9,"y":2,"track":false,"set":true}]}]',
    },
  },
});

describe("every narratable premise is reached", () => {
  // Adding a variant to `TracksReason` breaks this object until it is listed,
  // which is what stops the census silently shrinking.
  const ALL_KINDS: Record<TracksReason["kind"], true> = {
    onlyOneSideLeft: true,
    bothSidesLeft: true,
    clueFull: true,
    clueExact: true,
    wouldCloseLoop: true,
    wouldStrandTrack: true,
    wouldFinishEarly: true,
    looseEndSpans: true,
    sharedFate: true,
    crossingParity: true,
  };

  it("reaches every premise", () => {
    const seen = new Set<string>();
    let firings = 0;
    const [small, smallDesc] = FINISHES_EARLY.split(":");
    const boards = [
      ...SHAPES.flatMap((params) =>
        SEEDS.map((seed) => ({
          params,
          desc: tracksGame.newDesc(
            params,
            randomNew(`cover-${params.w}-${params.diff}-${seed}`),
          ).desc,
        })),
      ),
      { params: tracksGame.decodeParams(small), desc: smallDesc },
    ];
    for (const { params, desc } of boards) {
      const board = stateToBoard(tracksGame.newState(params, desc));
      const next = tracksRecordingPass(board, params.diff, stepBudget("cover"));
      for (;;) {
        const f = next();
        if (!f) break;
        firings++;
        if (f.reason) seen.add(f.reason.kind);
      }
    }
    expect(firings, "the census walked no firings").toBeGreaterThan(200);
    expect([...seen].sort()).toEqual(Object.keys(ALL_KINDS).sort());
  });

  it("each premise says something a player could tell apart", () => {
    const sentences = new Set<string>();
    for (const params of SHAPES) {
      for (const seed of SEEDS) {
        const { steps } = walk(params, `cover-${params.w}-${params.diff}-${seed}`);
        for (const { step } of steps) {
          // Collapse interpolated numbers so one shape counts once.
          sentences.add(step.explanation.replace(/\d+/g, "#"));
        }
      }
    }
    expect(sentences.size).toBeGreaterThanOrEqual(12);
    const all = [...sentences].join("\n");
    for (const marker of [
      "has two sides blocked, so it must run through the other two", // bothSidesLeft
      "of this square but one is blocked", // onlyOneSideLeft
      "the track squares its clue allows", // clueFull
      "can leave only", // clueExact
      "would close a loop", // wouldCloseLoop
      "stranding the outlined track", // wouldStrandTrack
      "the loose end must run straight on", // looseEndSpans
      "Track here would carry on", // sharedFate, fill arm
      "No track here means none", // sharedFate, empty arm
      "entry to the striped block needs an exit", // crossingParity
    ]) {
      expect(all, `no step ever said "${marker}"`).toContain(marker);
    }
  });
});

describe("narration reads correctly at the degenerate extremes", () => {
  // Every arm whose wording branches on a count, read at the value that breaks
  // the typical phrasing (docs/games/hints.md § "Sanity-read at the degenerate
  // extremes"). Reasons are built by hand: the corpus does not reliably reach a
  // clue of 0 or a full-width row.
  const board = stateToBoard(
    tracksGame.newState(SHAPES[0], tracksGame.newDesc(SHAPES[0], randomNew("x")).desc),
  );
  const ev = { cells: [], edges: [], clues: [] };
  // No marks: the words are read apart from any picture.
  const hl: TracksPicture = {
    targets: [],
    targetEdges: [],
    area: [],
    areaEdges: [],
    clues: [],
    line: null,
    hatch: [],
  };
  const narrateText = (b: typeof board, r: TracksReason): string =>
    narrate(b, r, hl).text;
  const say = (r: TracksReason) => narrateText(board, r);

  it("a square with no side left open does not claim it has one", () => {
    expect(say({ kind: "onlyOneSideLeft", x: 0, y: 0, open: 0, ev })).toContain(
      "Every side of this square is blocked",
    );
    expect(say({ kind: "onlyOneSideLeft", x: 0, y: 0, open: 1, ev })).toMatch(
      /but one is blocked/i,
    );
  });

  it("a clue of one is singular, and a clue of zero says so", () => {
    const b0 = { ...board, numbers: Int32Array.from(board.numbers) };
    b0.numbers[0] = 0;
    expect(narrateText(b0, { kind: "clueFull", line: 0, ev })).toContain(
      "clue is 0, so no track can run along it",
    );
    b0.numbers[0] = 1;
    expect(narrateText(b0, { kind: "clueFull", line: 0, ev })).toContain(
      "the one track square its clue allows",
    );
    // "all 2 of" is grammatical and reads wrong.
    b0.numbers[0] = 2;
    expect(narrateText(b0, { kind: "clueFull", line: 0, ev })).toContain(
      "both of the track squares its clue allows",
    );
  });

  it("a line with no room to be empty is not asked to leave 0 squares empty", () => {
    const bFull = { ...board, numbers: Int32Array.from(board.numbers) };
    bFull.numbers[0] = board.h;
    const s = narrateText(bFull, { kind: "clueExact", line: 0, ev });
    expect(s).toContain("squares long, so every square in it must carry track");
    expect(s).not.toContain("only 0");
  });

  it("a parity step with nothing marked yet does not say it crosses 0 times", () => {
    const s = say({ kind: "crossingParity", x: 0, y: 0, dir: 8, crossings: 0, ev });
    expect(s).toContain("and no crossing is marked yet");
    expect(s).not.toMatch(/\b0 crossings?\b/);
    expect(s).toContain("must be blocked");
    expect(
      say({ kind: "crossingParity", x: 0, y: 0, dir: 8, crossings: 1, ev }),
    ).toContain("and 1 crossing is marked");
  });

  // Two arms few boards reach: one firing among 450 small boards, and the
  // both-ways form of `sharedFate`.
  it("the rarest arms are still English, and still in the necessity voice", () => {
    const NECESSITY = /\bmust\b|\bcan(?:no|')t\b|\bcannot\b|\bno other\b|\bonly\b/;
    for (const reason of [
      { kind: "wouldFinishEarly", x: 1, y: 1, dir: 8, unmet: 0, ev } as const,
      {
        kind: "sharedFate",
        line: 0,
        x: 1,
        y: 1,
        dir: 8,
        fills: true,
        empties: true,
        ev,
      } as const,
    ]) {
      const s = say(reason);
      expect(s.length, `${reason.kind} narrates nothing`).toBeGreaterThan(60);
      expect(
        s.length,
        `${reason.kind} is over the 300-char ceiling`,
      ).toBeLessThanOrEqual(300);
      expect(NECESSITY.test(s), `${reason.kind}: "${s}"`).toBe(true);
      expect(s).not.toContain("—");
      expect(s, `${reason.kind} left a template hole`).not.toContain("undefined");
    }
    // The both-arm forces two squares in opposite directions, so it is the one
    // sentence that has to name both conclusions; a single-arm phrasing here
    // would describe half the move it is attached to.
    const both = say({
      kind: "sharedFate",
      line: 0,
      x: 1,
      y: 1,
      dir: 8,
      fills: true,
      empties: true,
      ev,
    });
    expect(both).toContain("this must be empty, the next track");
    expect(both).toContain("the next track");
  });
});

describe("following one step at a time", () => {
  it("a partial follow holds the step and shrinks it; the last op completes it", () => {
    // A `clueFull` firing empties several squares at once, which is what a
    // player does one click at a time.
    const params = SHAPES[0];
    const { steps } = walk(params, "keeptrack-a");
    const multi = steps.find(({ step }) => step.move.ops.length >= 3);
    expect(multi, "no multi-op step in the corpus").toBeDefined();
    if (!multi) return;

    const { step, before } = multi;
    const wanted = [...step.move.ops];
    let state = before;
    for (let i = 0; i < wanted.length; i++) {
      const one: TracksMove = { ops: [wanted[i]] };
      const verdict = tracksGame.hintKeepTrack?.(one, step, state);
      expect(verdict).toBe(i === wanted.length - 1 ? "completed" : "onTrack");
      state = tracksGame.executeMove(state, one);
      if (i < wanted.length - 1) {
        // Shrunk in place, so a later `executeHint` cannot re-apply what is done.
        expect(step.move.ops.length).toBe(wanted.length - i - 1);
        expect(step.move.ops).not.toContainEqual(wanted[i]);
      }
    }
  });

  it("an edge named from the square on its other side is the same edge", () => {
    // An edge flag lives on both squares it separates, and a drag may name it
    // from either one.
    const params = SHAPES[0];
    const { steps } = walk(params, "keeptrack-a");
    const found = steps.flatMap(({ step, before }) =>
      step.move.ops
        .filter((op) => op.kind === "edge")
        .map((op) => ({ step, before, op })),
    );
    const other = found.find(({ op, before }) =>
      inGrid(before, op.x + DX(op.dir ?? 0), op.y + DY(op.dir ?? 0)),
    );
    expect(other, "no interior edge op in the corpus").toBeDefined();
    if (!other) return;
    const { step, before, op } = other;
    const dir = op.dir ?? 0;
    const flipped: TracksOp = {
      ...op,
      x: op.x + DX(dir),
      y: op.y + DY(dir),
      dir: FLIP(dir),
    };
    expect(tracksGame.hintKeepTrack?.({ ops: [flipped] }, step, before)).not.toBe(
      "off",
    );
  });

  it("a move the step never asked for is off-plan", () => {
    const params = SHAPES[0];
    const { steps } = walk(params, "keeptrack-b");
    const { step, before } = steps[0];
    // The contrary of an op the step asks for: same place, the other fate.
    const asked = step.move.ops[0];
    const foreign: TracksMove = { ops: [{ ...asked, track: !asked.track }] };
    expect(step.move.ops).not.toContainEqual(foreign.ops[0]);
    expect(tracksGame.hintKeepTrack?.(foreign, step, before)).toBe("off");
  });
});

describe("the boards the midend refuses a hint on", () => {
  const params = SHAPES[0];

  it("counts a solved board as finished", () => {
    const { desc } = tracksGame.newDesc(params, randomNew("refuse-solved"));
    const fresh = tracksGame.newState(params, desc);
    const solved = tracksGame.solve?.(fresh, fresh);
    expect(solved?.ok).toBe(true);
    if (!solved?.ok) return;
    const done = tracksGame.executeMove(fresh, solved.move);
    expect(tracksGame.status(done)).toBe("solved");
  });

  it("flags a mark that contradicts the solution", () => {
    const { desc } = tracksGame.newDesc(params, randomNew("refuse-wrong"));
    const fresh = tracksGame.newState(params, desc);
    // Find a square the unique solution leaves empty and claim it carries track.
    const sol = stateToBoard(fresh);
    expect(tracksSolve(sol, 3).ret).toBe(1);
    let wrong: TracksMove | null = null;
    for (let i = 0; i < params.w * params.h && !wrong; i++) {
      if (sol.sflags[i] & 1) continue;
      const x = i % params.w;
      const y = Math.floor(i / params.w);
      if (uiCanFlipSquare(stateToBoard(fresh), x, y, false)) {
        wrong = { ops: [{ kind: "square", x, y, track: true, set: true }] };
      }
    }
    expect(wrong).not.toBeNull();
    if (!wrong) return;
    const bad = tracksGame.executeMove(fresh, wrong);
    expect(tracksGame.findMistakes?.(bad).length ?? 0).toBeGreaterThan(0);
  });
});

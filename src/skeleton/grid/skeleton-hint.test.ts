/**
 * Skeleton's hint: a pinned position and its sentence for every rung, and
 * the properties a plan has on any board.
 *
 * `npm run hint-scan -- <this file>` writes the pins
 * (docs/games/testing.md § "Pinning a hint's positions").
 */
import { describe, expect, it } from "vitest";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import { skeletonGame } from "./index.ts";
import { COL_HINT, COL_HINT_EVIDENCE } from "./render.ts";
import { answerOf } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  executeMove,
  newState,
  type SkeletonParams,
  type SkeletonState,
} from "./state.ts";

const pinned = describeHintPins({
  game: skeletonGame,
  params: [{ w: 5, h: 5, diff: DIFF_NORMAL }],
  pins: {
    /** Held on 112 of 112 positions walked. */
    count: "5x5dn:_1___1_1121__1_1__2101___",
    /** Held on 90 of 112 positions walked. */
    shared: {
      id: "5x5dn:____0111___2_1_1_____12_1",
      moves:
        '[{"kind":"mark","cells":[{"index":3,"mark":2},{"index":9,"mark":2}]},{"kind":"mark","cells":[{"index":1,"mark":1}]},{"kind":"mark","cells":[{"index":17,"mark":1},{"index":23,"mark":1}]},{"kind":"mark","cells":[{"index":19,"mark":2}]}]',
    },
  },
});

const BOARDS: SkeletonParams[] = [
  { w: 5, h: 5, diff: DIFF_EASY },
  { w: 5, h: 5, diff: DIFF_NORMAL },
  { w: 7, h: 4, diff: DIFF_NORMAL },
];

function deal(p: SkeletonParams, seed: string): SkeletonState {
  return newState(p, skeletonGame.newDesc(p, randomNew(seed)).desc);
}

describe("skeleton hint plans", () => {
  it.each(BOARDS)("lead a $w x $h board at tier $diff to its answer", (p) => {
    for (const seed of ["plan a", "plan b", "plan c"]) {
      let state = deal(p, seed);
      const answer = answerOf(state.w, state.h, state.clues);
      // The plan is capped, so it is asked again until the board is done.
      for (let asked = 0; skeletonGame.status(state) !== "solved"; asked++) {
        expect(asked).toBeLessThan(state.grid.length);
        const result = skeletonGame.hint?.(state);
        if (!result?.ok) throw new Error(`refused on ${seed}`);
        for (const step of result.steps) {
          if (step.move.kind !== "mark") throw new Error("a step marks squares");
          // The line `hint-quality.test.ts` draws for every game's sentences.
          expect(step.explanation.length, step.explanation).toBeLessThanOrEqual(120);
          for (const { index, mark } of step.move.cells)
            expect(mark).toBe(answer?.[index]);
          state = executeMove(state, step.move);
        }
      }
    }
  });

  it("a step rings exactly the squares its move marks", () => {
    const state = deal(BOARDS[1], "rings");
    const result = skeletonGame.hint?.(state);
    if (!result?.ok) throw new Error("refused");
    for (const step of result.steps) {
      if (step.move.kind !== "mark") throw new Error("a step marks squares");
      const ringed = stepMarks(step)
        .of("ring", CELL)
        .map((c) => c.y * state.w + c.x);
      expect(ringed.sort()).toEqual(step.move.cells.map((c) => c.index).sort());
    }
  });

  it("a move that makes part of a step keeps it, shrunk to the rest", () => {
    const { state, step } = pinned("shared");
    if (step.move.kind !== "mark") throw new Error("a step marks squares");
    const [first, ...rest] = step.move.cells;
    const copy = { ...step, move: structuredClone(step.move) };
    const verdict = skeletonGame.hintKeepTrack?.(
      { kind: "mark", cells: [first] },
      copy,
      state,
    );
    expect(verdict).toBe(rest.length === 0 ? "completed" : "onTrack");
    if (rest.length > 0) expect(copy.move).toEqual({ kind: "mark", cells: rest });
  });

  it("a move the step does not ask for drops it", () => {
    const { state, step } = pinned("count");
    if (step.move.kind !== "mark") throw new Error("a step marks squares");
    const { index, mark } = step.move.cells[0];
    const other = mark === 1 ? 2 : 1;
    expect(
      skeletonGame.hintKeepTrack?.(
        { kind: "mark", cells: [{ index, mark: other }] },
        step,
        state,
      ),
    ).toBe("off");
  });
});

describe("skeleton hint frame", () => {
  it("rings the squares and outlines both numbers of a shared step", () => {
    const { recording, step } = renderPinnedHint(skeletonGame, pinned("shared"));
    expect(stepMarks(step).of("outline", CELL)).toHaveLength(2);
    for (const color of [COL_HINT, COL_HINT_EVIDENCE])
      expect(recording.ops.some((op) => paintsWith(op, color))).toBe(true);
  });
});

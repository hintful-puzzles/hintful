/**
 * Skeleton's hint: a pinned position and its sentence for every rung, and the
 * properties a plan has on any board.
 *
 * `npm run hint-scan -- <this file>` writes the pins
 * (docs/testing.md § "Pinning a hint's positions").
 */
import { describe, expect, it } from "vitest";
import { EDGE } from "../../engine/edge-hint.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { CROSS, LINE } from "../../engine/line-drawing.ts";
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
  params: [{ w: 6, h: 6, diff: DIFF_NORMAL }],
  pins: {
    /** Held on 324 of 324 positions walked. */
    forced: "6x6dn:if1jdkcj",
    /** Held on 192 of 324 positions walked. */
    lookahead: {
      id: "6x6dn:f2chbyi",
      moves:
        '[{"kind":"edges","changes":[{"edge":0,"mark":1},{"edge":30,"mark":1}]},{"kind":"edges","changes":[{"edge":4,"mark":1},{"edge":35,"mark":1}]},{"kind":"edges","changes":[{"edge":32,"mark":1},{"edge":38,"mark":1}]},{"kind":"edges","changes":[{"edge":33,"mark":1},{"edge":39,"mark":1}]},{"kind":"edges","changes":[{"edge":22,"mark":1},{"edge":56,"mark":1}]},{"kind":"edges","changes":[{"edge":53,"mark":1},{"edge":59,"mark":1}]},{"kind":"edges","changes":[{"edge":25,"mark":1},{"edge":54,"mark":1}]},{"kind":"edges","changes":[{"edge":29,"mark":1}]}]',
    },
  },
});

const BOARDS: SkeletonParams[] = [
  { w: 6, h: 6, diff: DIFF_EASY },
  { w: 6, h: 6, diff: DIFF_NORMAL },
  { w: 8, h: 6, diff: DIFF_NORMAL },
];

function deal(p: SkeletonParams, seed: string): SkeletonState {
  return newState(p, skeletonGame.newDesc(p, randomNew(seed)).desc);
}

describe("skeleton hint plans", () => {
  it.each(BOARDS)("lead a $w x $h board at tier $diff to its answer", (p) => {
    for (const seed of ["plan a", "plan b", "plan c"]) {
      let state = deal(p, seed);
      const answer = answerOf(state.w, state.h, state.walls);
      // The plan is capped, so it is asked again until the board is done.
      for (let asked = 0; skeletonGame.status(state) !== "solved"; asked++) {
        expect(asked).toBeLessThan(state.edges.length);
        const result = skeletonGame.hint?.(state);
        if (!result?.ok) throw new Error(`refused on ${seed}`);
        for (const step of result.steps) {
          if (step.move.kind !== "edges") throw new Error("a step marks edges");
          // The line `hint-quality.test.ts` draws for every game's sentences.
          expect(step.explanation.length, step.explanation).toBeLessThanOrEqual(120);
          for (const { edge, mark } of step.move.changes)
            expect(mark === LINE, step.explanation).toBe(answer?.[edge] === LINE);
          state = executeMove(state, step.move);
        }
      }
    }
  });

  it("a step rings exactly the edges its move marks", () => {
    const state = deal(BOARDS[1], "rings");
    const result = skeletonGame.hint?.(state);
    if (!result?.ok) throw new Error("refused");
    for (const step of result.steps) {
      if (step.move.kind !== "edges") throw new Error("a step marks edges");
      const ringed = [...stepMarks(step).of("ring", EDGE)].sort((a, b) => a - b);
      expect(ringed).toEqual(
        step.move.changes.map((c) => c.edge).sort((a, b) => a - b),
      );
    }
  });

  it("a move that makes part of a step keeps it, shrunk to the rest", () => {
    const { state, step } = pinned("forced");
    if (step.move.kind !== "edges") throw new Error("a step marks edges");
    const [first, ...rest] = step.move.changes;
    const copy = { ...step, move: structuredClone(step.move) };
    const verdict = skeletonGame.hintKeepTrack?.(
      { kind: "edges", changes: [first] },
      copy,
      state,
    );
    expect(verdict).toBe(rest.length === 0 ? "completed" : "onTrack");
    if (rest.length > 0) expect(copy.move).toEqual({ kind: "edges", changes: rest });
  });

  it("a move the step does not ask for drops it", () => {
    const { state, step } = pinned("forced");
    if (step.move.kind !== "edges") throw new Error("a step marks edges");
    const { edge } = step.move.changes[0];
    expect(
      skeletonGame.hintKeepTrack?.(
        { kind: "edges", changes: [{ edge, mark: CROSS }] },
        step,
        state,
      ),
    ).toBe("off");
  });
});

describe("skeleton hint frame", () => {
  it("rings the edge a supposition settles and outlines where it breaks", () => {
    const { recording, step } = renderPinnedHint(skeletonGame, pinned("lookahead"));
    expect(stepMarks(step).of("ring", EDGE).length).toBeGreaterThan(0);
    for (const color of [COL_HINT, COL_HINT_EVIDENCE])
      expect(recording.ops.some((op) => paintsWith(op, color))).toBe(true);
  });

  it("outlines the square a degree step reads", () => {
    const { step } = renderPinnedHint(skeletonGame, pinned("forced"));
    expect(stepMarks(step).of("outline", CELL)).toHaveLength(1);
  });
});

/**
 * Path's hint: a pinned position and its sentence for every rung, and the
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
import { edgeBetween, squareEdges } from "../../engine/square-edges.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import { pathGame } from "./index.ts";
import { COL_HINT, COL_HINT_EVIDENCE } from "./render.ts";
import { answerOf } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  DIFF_TRICKY,
  executeMove,
  newState,
  type PathParams,
  type PathState,
} from "./state.ts";

const pinned = describeHintPins({
  game: pathGame,
  params: [
    { w: 5, h: 5, diff: DIFF_NORMAL },
    { w: 7, h: 7, diff: DIFF_TRICKY },
  ],
  pins: {
    /** Held on 843 of 843 positions walked. */
    forced: "5x5dn:1b2b3e4_1c2b3c4",
    /** Held on 502 of 843 positions walked. */
    lookahead: {
      id: "5x5dn:1b2b3e4_1c2b3c4",
      moves:
        '[{"kind":"edges","changes":[{"edge":3,"mark":1},{"edge":24,"mark":1}]},{"kind":"edges","changes":[{"edge":1,"mark":1},{"edge":22,"mark":1}]},{"kind":"edges","changes":[{"edge":10,"mark":2}]},{"kind":"edges","changes":[{"edge":32,"mark":2}]}]',
    },
    /** Held on 178 of 843 positions walked. */
    "long-lookahead": {
      id: "7x7dt:e1d2a3_1b4_5d2d3h6a5a6d4c",
      moves:
        '[{"kind":"edges","changes":[{"edge":0,"mark":1},{"edge":42,"mark":1}]},{"kind":"edges","changes":[{"edge":5,"mark":1},{"edge":48,"mark":1}]},{"kind":"edges","changes":[{"edge":3,"mark":1},{"edge":46,"mark":1}]},{"kind":"edges","changes":[{"edge":17,"mark":1},{"edge":62,"mark":1}]},{"kind":"edges","changes":[{"edge":29,"mark":1},{"edge":76,"mark":1}]},{"kind":"edges","changes":[{"edge":36,"mark":1},{"edge":77,"mark":1}]},{"kind":"edges","changes":[{"edge":83,"mark":1},{"edge":41,"mark":1}]}]',
    },
  },
});

const BOARDS: PathParams[] = [
  { w: 5, h: 5, diff: DIFF_EASY },
  { w: 5, h: 5, diff: DIFF_NORMAL },
  { w: 7, h: 5, diff: DIFF_NORMAL },
  { w: 7, h: 7, diff: DIFF_TRICKY },
];

function deal(p: PathParams, seed: string): PathState {
  return newState(p, pathGame.newDesc(p, randomNew(seed)).desc);
}

describe("path hint plans", () => {
  it.each(BOARDS)("lead a $w x $h board at tier $diff to its answer", (p) => {
    for (const seed of ["plan a", "plan b", "plan c"]) {
      let state = deal(p, seed);
      const answer = answerOf(state.w, state.h, state.ends);
      // The plan is capped, so it is asked again until the board is done.
      for (let asked = 0; pathGame.status(state) !== "solved"; asked++) {
        expect(asked).toBeLessThan(state.edges.length);
        const result = pathGame.hint?.(state);
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
    const result = pathGame.hint?.(state);
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
    const verdict = pathGame.hintKeepTrack?.(
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
      pathGame.hintKeepTrack?.(
        { kind: "edges", changes: [{ edge, mark: CROSS }] },
        step,
        state,
      ),
    ).toBe("off");
  });
});

describe("path hint order", () => {
  it("finishes the line it is working on before it starts another", () => {
    // The owner's board (2026-10-21): the plan used to draw the 2's and the
    // 3's first edges and then go to the 4.
    const state = newState({ w: 5, h: 5, diff: DIFF_EASY }, "1c2b3a3b2_1_4e4d");
    const g = squareEdges(5, 5);
    const sq = (x: number, y: number): number => y * 5 + x;
    const edge = (p: [number, number], q: [number, number]): number =>
      edgeBetween(g, sq(...p), sq(...q));
    const result = pathGame.hint?.(state);
    if (!result?.ok) throw new Error("refused");
    const first = result.steps
      .slice(0, 3)
      .map((step) => (step.move.kind === "edges" ? step.move.changes : []));
    expect(first).toEqual([
      [{ edge: edge([3, 0], [4, 0]), mark: LINE }],
      [{ edge: edge([3, 1], [4, 1]), mark: LINE }],
      // The 3's line can go only to the other 3: up meets the 2's line and
      // down the 1, which no step needs to say.
      [{ edge: edge([2, 1], [3, 1]), mark: LINE }],
    ]);
  });
});

describe("path hint frame", () => {
  it("rings the edge a supposition settles and outlines where it breaks", () => {
    // A chain's numbers are drawn at the chain pin, which hint-ordinal.test.ts
    // reads; this pin's supposition breaks the board in one look.
    const { recording, step } = renderPinnedHint(pathGame, pinned("lookahead"));
    expect(stepMarks(step).of("ring", EDGE).length).toBeGreaterThan(0);
    for (const color of [COL_HINT, COL_HINT_EVIDENCE])
      expect(recording.ops.some((op) => paintsWith(op, color))).toBe(true);
  });

  it("outlines the square a degree step reads", () => {
    const { step } = renderPinnedHint(pathGame, pinned("forced"));
    expect(stepMarks(step).of("outline", CELL)).toHaveLength(1);
  });
});

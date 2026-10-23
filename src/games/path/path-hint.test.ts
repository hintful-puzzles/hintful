/**
 * Path's hint: a pinned position and its sentence for every rung, and the
 * properties a plan has on any board.
 *
 * `npm run hint-scan -- <this file>` writes the pins
 * (docs/testing.md § "Pinning a hint's positions").
 */
import { describe, expect, it } from "vitest";
import { EDGE } from "../../engine/edge-hint.ts";
import type { HintStep } from "../../engine/game.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { CROSS, LINE } from "../../engine/line-drawing.ts";
import { randomNew } from "../../engine/random/index.ts";
import { edgeBetween, squareEdges } from "../../engine/square-edges.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import type { PathHighlights } from "./hint.ts";
import { pathGame } from "./index.ts";
import { COL_HINT, COL_HINT_EVIDENCE } from "./render.ts";
import { answerOf, type PathRung } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  DIFF_TRICKY,
  executeMove,
  MODE_PAIRS,
  MODE_PATH,
  NO_END,
  newState,
  type PathMove,
  type PathParams,
  type PathState,
} from "./state.ts";

type PathStep = HintStep<PathMove, PathHighlights, PathRung>;

/** A step, on a board of the Path ruleset, of `rung`. */
const onOnePath =
  (rung: PathRung) =>
  (step: PathStep, state: PathState): boolean =>
    state.mode === MODE_PATH && step.rung === rung;

/** The numbered squares a step outlines, and how many it outlines. */
const outlinedNumbers = (step: PathStep, state: PathState) => {
  const cells = stepMarks(step).of("outline", CELL);
  const numbered = cells.filter((c) => state.ends[c.y * state.w + c.x] !== NO_END);
  return { numbered, all: cells.length };
};

const pinned = describeHintPins({
  game: pathGame,
  params: [
    { w: 5, h: 5, diff: DIFF_NORMAL, mode: MODE_PAIRS },
    { w: 7, h: 7, diff: DIFF_TRICKY, mode: MODE_PAIRS },
    { w: 6, h: 6, diff: DIFF_NORMAL, mode: MODE_PATH },
    { w: 8, h: 8, diff: DIFF_TRICKY, mode: MODE_PATH },
  ],
  kinds: {
    onePathForced: onOnePath("forced"),
    onePathLookahead: { leg: onOnePath("lookahead") },
    onePathLongLookahead: { leg: onOnePath("long-lookahead") },
    /** A number that is neither the 1 nor the last takes two lines. */
    onePathMiddleNumber: (step, state) => {
      const { numbered, all } = outlinedNumbers(step, state);
      const [c] = numbered;
      return (
        onOnePath("forced")(step, state) &&
        all === 1 &&
        c &&
        state.takes[c.y * state.w + c.x] === 2
      );
    },
    /** A supposition that breaks where two numbers out of order would meet:
     * the only break that outlines two numbered squares and nothing else. */
    onePathOutOfOrder: {
      leg: (step, state) => {
        const { numbered, all } = outlinedNumbers(step, state);
        return (
          (onOnePath("lookahead")(step, state) ||
            onOnePath("long-lookahead")(step, state)) &&
          all === 2 &&
          numbered.length === 2
        );
      },
    },
  },
  pins: {
    /** Held on 829 of 1977 positions walked. */
    onePathForced: "6x6zdn:p4_6b5_3b2c1g,zjog",
    /** Held on 833 of 1977 positions walked. */
    onePathLookahead: {
      id: "6x6zdn:i6f5a8a4d7b3c2_1b",
      moves:
        '[{"kind":"edges","changes":[{"edge":0,"mark":1},{"edge":30,"mark":1}]},{"kind":"edges","changes":[{"edge":4,"mark":1},{"edge":35,"mark":1}]},{"kind":"edges","changes":[{"edge":25,"mark":1},{"edge":54,"mark":1}]},{"kind":"edges","changes":[{"edge":59,"mark":1},{"edge":29,"mark":1}]}]',
    },
    /** Held on 288 of 1977 positions walked. */
    onePathLongLookahead: {
      id: "8x8zdt:n3c4a11_1c5g6b9_10a2a8f7c12k,akpzbzoj",
      moves:
        '[{"kind":"edges","changes":[{"edge":0,"mark":1},{"edge":56,"mark":1}]},{"kind":"edges","changes":[{"edge":57,"mark":1}]},{"kind":"edges","changes":[{"edge":2,"mark":1},{"edge":58,"mark":1}]},{"kind":"edges","changes":[{"edge":3,"mark":1}]},{"kind":"edges","changes":[{"edge":6,"mark":1},{"edge":63,"mark":1}]},{"kind":"edges","changes":[{"edge":64,"mark":1}]},{"kind":"edges","changes":[{"edge":71,"mark":1}]},{"kind":"edges","changes":[{"edge":49,"mark":1},{"edge":104,"mark":1}]},{"kind":"edges","changes":[{"edge":111,"mark":1},{"edge":55,"mark":1}]}]',
    },
    /** Held on 111 of 1977 positions walked. */
    onePathMiddleNumber: {
      id: "8x8zdt:a12_10e11_13i9e2e8a4c6b1a3c5f7j,r1kzzol",
      moves: [
        {
          kind: "edges",
          changes: [
            { edge: 0, mark: 1 },
            { edge: 56, mark: 1 },
          ],
        },
      ],
    },
    /** Held on 475 of 1977 positions walked. */
    onePathOutOfOrder: {
      id: "8x8zdt:b9h4_3_6i5j2b1_10j8c7j,zezrvl",
      moves:
        '[{"kind":"edges","changes":[{"edge":0,"mark":1},{"edge":56,"mark":1}]},{"kind":"edges","changes":[{"edge":6,"mark":1},{"edge":63,"mark":1}]},{"kind":"edges","changes":[{"edge":49,"mark":1},{"edge":104,"mark":1}]},{"kind":"edges","changes":[{"edge":111,"mark":1},{"edge":55,"mark":1}]}]',
    },
    /** Held on 1977 of 1977 positions walked. */
    forced: "5x5dn:1b2b3e4_1c2b3c4",
    /** Held on 1358 of 1977 positions walked. */
    lookahead: {
      id: "5x5dn:1b2b3e4_1c2b3c4",
      moves:
        '[{"kind":"edges","changes":[{"edge":3,"mark":1},{"edge":24,"mark":1}]},{"kind":"edges","changes":[{"edge":1,"mark":1},{"edge":22,"mark":1}]},{"kind":"edges","changes":[{"edge":10,"mark":2}]},{"kind":"edges","changes":[{"edge":32,"mark":2}]}]',
    },
    /** Held on 543 of 1977 positions walked. */
    "long-lookahead": {
      id: "7x7dt:e1d2a3_1b4_5d2d3h6a5a6d4c",
      moves:
        '[{"kind":"edges","changes":[{"edge":0,"mark":1},{"edge":42,"mark":1}]},{"kind":"edges","changes":[{"edge":5,"mark":1},{"edge":48,"mark":1}]},{"kind":"edges","changes":[{"edge":3,"mark":1},{"edge":46,"mark":1}]},{"kind":"edges","changes":[{"edge":17,"mark":1},{"edge":62,"mark":1}]},{"kind":"edges","changes":[{"edge":29,"mark":1},{"edge":76,"mark":1}]},{"kind":"edges","changes":[{"edge":36,"mark":1},{"edge":77,"mark":1}]},{"kind":"edges","changes":[{"edge":83,"mark":1},{"edge":41,"mark":1}]}]',
    },
  },
});

const BOARDS: PathParams[] = [
  { w: 5, h: 5, diff: DIFF_EASY, mode: MODE_PAIRS },
  { w: 5, h: 5, diff: DIFF_NORMAL, mode: MODE_PAIRS },
  { w: 7, h: 5, diff: DIFF_NORMAL, mode: MODE_PAIRS },
  { w: 7, h: 7, diff: DIFF_TRICKY, mode: MODE_PAIRS },
  { w: 6, h: 6, diff: DIFF_NORMAL, mode: MODE_PATH },
  { w: 8, h: 8, diff: DIFF_TRICKY, mode: MODE_PATH },
];

function deal(p: PathParams, seed: string): PathState {
  return newState(p, pathGame.newDesc(p, randomNew(seed)).desc);
}

describe("path hint plans", () => {
  it.each(BOARDS)("lead a $w x $h board at tier $diff to its answer", (p) => {
    for (const seed of ["plan a", "plan b", "plan c"]) {
      let state = deal(p, seed);
      const answer = answerOf(state);
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
    const state = newState(BOARDS[0], "1c2b3a3b2_1_4e4d");
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

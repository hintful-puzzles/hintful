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
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import type { PathHighlights } from "./hint.ts";
import { pathGame } from "./index.ts";
import { COL_HINT_EVIDENCE } from "./render.ts";
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
    onePathBreaks: { leg: onOnePath("breaks") },
    onePathWeighed: { leg: onOnePath("weighed") },
    /** Normal's square: lines on two of its three edges would break the
     * board, which outlines the two. */
    pairBreaks: {
      leg: (step) =>
        step.rung === "breaks" && stepMarks(step).of("outline", EDGE).length === 2,
    },
    /** Tricky's square with one pair of edges left takes both. */
    weighedPair: {
      leg: (step) =>
        step.rung === "weighed" &&
        step.move.kind === "edges" &&
        step.move.changes.length === 2,
    },
    /** Tricky's square crosses an edge out, which outlines no edge. */
    weighedCross: {
      leg: (step) =>
        step.rung === "weighed" &&
        step.move.kind === "edges" &&
        step.move.changes.every((c) => c.mark === CROSS),
    },
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
    /** A line that breaks the board where two numbers out of order would
     * meet: the only break that outlines two numbered squares and nothing
     * else. */
    onePathOutOfOrder: {
      leg: (step, state) => {
        const { numbered, all } = outlinedNumbers(step, state);
        return onOnePath("breaks")(step, state) && all === 2 && numbered.length === 2;
      },
    },
  },
  pins: {
    /** Held on 810 of 1739 positions walked. */
    onePathForced: "6x6zdn:p4_6b5_3b2c1g,zjog",
    /** Held on 642 of 1739 positions walked. */
    onePathBreaks: {
      id: "6x6zdn:i6f5a8a4d7b3c2_1b",
      moves:
        '[{"kind":"edges","changes":[{"edge":0,"mark":1},{"edge":30,"mark":1}]},{"kind":"edges","changes":[{"edge":4,"mark":1},{"edge":35,"mark":1}]},{"kind":"edges","changes":[{"edge":25,"mark":1},{"edge":54,"mark":1}]},{"kind":"edges","changes":[{"edge":59,"mark":1},{"edge":29,"mark":1}]}]',
    },
    /** Held on 251 of 1739 positions walked. */
    onePathWeighed: {
      id: "8x8zdt:a12_10e11_13i9e2e8d7_5b1a3c4f6j,r1zzahpl",
      moves:
        '[{"kind":"edges","changes":[{"edge":0,"mark":1},{"edge":56,"mark":1}]},{"kind":"edges","changes":[{"edge":57,"mark":1}]},{"kind":"edges","changes":[{"edge":2,"mark":1},{"edge":58,"mark":1}]},{"kind":"edges","changes":[{"edge":6,"mark":1},{"edge":63,"mark":1}]},{"kind":"edges","changes":[{"edge":64,"mark":1}]},{"kind":"edges","changes":[{"edge":15,"mark":1},{"edge":14,"mark":1}]},{"kind":"edges","changes":[{"edge":69,"mark":1},{"edge":77,"mark":1}]},{"kind":"edges","changes":[{"edge":21,"mark":1},{"edge":80,"mark":1}]},{"kind":"edges","changes":[{"edge":49,"mark":1},{"edge":104,"mark":1}]},{"kind":"edges","changes":[{"edge":111,"mark":1},{"edge":55,"mark":1}]},{"kind":"edges","changes":[{"edge":23,"mark":1}]},{"kind":"edges","changes":[{"edge":75,"mark":2}]},{"kind":"edges","changes":[{"edge":17,"mark":1},{"edge":67,"mark":1}]}]',
    },
    /** Held on 806 of 1739 positions walked. */
    pairBreaks: {
      id: "5x5dn:d1a2_3e4b4_2b1c3",
      moves: [
        {
          kind: "edges",
          changes: [
            { edge: 0, mark: 1 },
            { edge: 20, mark: 1 },
          ],
        },
      ],
    },
    /** Held on 126 of 1739 positions walked. */
    weighedPair: {
      id: "7x7dt:d1a2b3b2_4_5d4f6e7b3a6a1_7a5f",
      moves:
        '[{"kind":"edges","changes":[{"edge":0,"mark":1},{"edge":42,"mark":1}]},{"kind":"edges","changes":[{"edge":5,"mark":1}]},{"kind":"edges","changes":[{"edge":47,"mark":1}]},{"kind":"edges","changes":[{"edge":55,"mark":1}]},{"kind":"edges","changes":[{"edge":36,"mark":1}]},{"kind":"edges","changes":[{"edge":83,"mark":1},{"edge":41,"mark":1}]},{"kind":"edges","changes":[{"edge":69,"mark":1}]},{"kind":"edges","changes":[{"edge":38,"mark":1}]},{"kind":"edges","changes":[{"edge":40,"mark":1}]}]',
    },
    /** Held on 36 of 1739 positions walked. */
    weighedCross: {
      id: "8x8zdt:k11b3b4a10a13h12g2c6_8e5a7j9_1,wz1fbflze",
      moves:
        '[{"kind":"edges","changes":[{"edge":0,"mark":1},{"edge":56,"mark":1}]},{"kind":"edges","changes":[{"edge":1,"mark":1}]},{"kind":"edges","changes":[{"edge":4,"mark":1},{"edge":3,"mark":1}]},{"kind":"edges","changes":[{"edge":6,"mark":1},{"edge":63,"mark":1}]},{"kind":"edges","changes":[{"edge":21,"mark":1},{"edge":72,"mark":1}]},{"kind":"edges","changes":[{"edge":28,"mark":1},{"edge":88,"mark":1}]},{"kind":"edges","changes":[{"edge":49,"mark":1},{"edge":104,"mark":1}]},{"kind":"edges","changes":[{"edge":105,"mark":1}]},{"kind":"edges","changes":[{"edge":96,"mark":1}]},{"kind":"edges","changes":[{"edge":51,"mark":1},{"edge":106,"mark":1}]},{"kind":"edges","changes":[{"edge":110,"mark":1},{"edge":54,"mark":1}]},{"kind":"edges","changes":[{"edge":111,"mark":1}]},{"kind":"edges","changes":[{"edge":103,"mark":1}]},{"kind":"edges","changes":[{"edge":79,"mark":1}]},{"kind":"edges","changes":[{"edge":36,"mark":1}]},{"kind":"edges","changes":[{"edge":108,"mark":1}]}]',
    },
    /** Held on 120 of 1739 positions walked. */
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
    /** Held on 464 of 1739 positions walked. */
    onePathOutOfOrder: {
      id: "8x8zdt:b9h4_3_6i5j2b1_10j8c7j,zezrvl",
      moves:
        '[{"kind":"edges","changes":[{"edge":0,"mark":1},{"edge":56,"mark":1}]},{"kind":"edges","changes":[{"edge":6,"mark":1},{"edge":63,"mark":1}]},{"kind":"edges","changes":[{"edge":49,"mark":1},{"edge":104,"mark":1}]},{"kind":"edges","changes":[{"edge":111,"mark":1},{"edge":55,"mark":1}]}]',
    },
    /** Held on 1739 of 1739 positions walked. */
    forced: "5x5dn:1b2b3e4_1c2b3c4",
    /** Held on 1050 of 1739 positions walked. */
    breaks: {
      id: "5x5dn:d1a2_3e4b4_2b1c3",
      moves: [
        {
          kind: "edges",
          changes: [
            { edge: 0, mark: 1 },
            { edge: 20, mark: 1 },
          ],
        },
      ],
    },
    /** Held on 459 of 1739 positions walked. */
    weighed: {
      id: "7x7dt:e1_2a3a4_1_2b4g5_6a6b7_8a3d7c8f5",
      moves:
        '[{"kind":"edges","changes":[{"edge":0,"mark":1},{"edge":42,"mark":1}]},{"kind":"edges","changes":[{"edge":4,"mark":1}]},{"kind":"edges","changes":[{"edge":48,"mark":1}]},{"kind":"edges","changes":[{"edge":26,"mark":1}]},{"kind":"edges","changes":[{"edge":73,"mark":1}]},{"kind":"edges","changes":[{"edge":36,"mark":1},{"edge":77,"mark":1}]},{"kind":"edges","changes":[{"edge":41,"mark":1}]},{"kind":"edges","changes":[{"edge":2,"mark":1}]}]',
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
      const found = answerOf(state);
      const answer = found.kind === "one" ? found.solution : null;
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
  it("rings the edge a tried line settles and outlines where it breaks", () => {
    const { recording, step } = renderPinnedHint(pathGame, pinned("pairBreaks"));
    const ringed = stepMarks(step).of("ring", EDGE).length;
    expect(ringed).toBeGreaterThan(0);
    // Both squares of an edge draw its pill.
    expectRing(recording.ops, { rings: 2 * ringed });
    expect(recording.ops.some((op) => paintsWith(op, COL_HINT_EVIDENCE))).toBe(true);
  });

  it("draws the edges a step tries lines on thin, as lines", () => {
    for (const kind of ["pairBreaks", "onePathWeighed"] as const) {
      const { step } = pinned(kind);
      const outlined = stepMarks(step).of("outline", EDGE);
      expect(outlined.length, kind).toBeGreaterThan(1);
      const tried = new Map(step.highlights?.tried.map((t) => [t.edge, t.mark]));
      for (const edge of outlined) expect(tried.get(edge), kind).toBe(LINE);
    }
  });

  it("outlines the square a degree step reads", () => {
    const { step } = renderPinnedHint(pathGame, pinned("forced"));
    expect(stepMarks(step).of("outline", CELL)).toHaveLength(1);
  });
});

/**
 * Wordtrail's hint: a pinned position and its sentence for every rung, and the
 * properties a plan has on any board.
 *
 * `npm run hint-scan -- <this file>` writes the pins
 * (docs/testing.md § "Pinning a hint's positions").
 */
import { describe, expect, it } from "vitest";
import { COL_HINT_OUTLINE } from "../../engine/color/roles.ts";
import { EDGE } from "../../engine/edge-hint.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { CROSS, LINE, OPEN } from "../../engine/line-drawing.ts";
import { randomNew } from "../../engine/random/index.ts";
import { squareEdges } from "../../engine/square-edges.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import { wordtrailGame } from "./index.ts";
import { answerOf } from "./solver.ts";
import {
  codeOf,
  DIFF_EASY,
  DIFF_NORMAL,
  executeMove,
  newState,
  type WordtrailParams,
  type WordtrailState,
} from "./state.ts";

const pinned = describeHintPins({
  game: wordtrailGame,
  params: [{ w: 5, h: 5, words: 4, diff: DIFF_NORMAL }],
  pins: {
    /** Held on 73 of 83 positions walked. */
    onlyWord: "5x5n4dn:3358,1awr2ypewialtan1cit1cot1",
    /** Held on 80 of 83 positions walked. */
    onlyLength: {
      id: "5x5n4dn:3445,eak1tw2ge1per2ow2dlig1",
      moves:
        '[{"kind":"edges","changes":[{"edge":0,"mark":1,"from":0},{"edge":1,"mark":1,"from":1},{"edge":20,"mark":1,"from":5}]},{"kind":"edges","changes":[{"edge":7,"mark":1,"from":8},{"edge":28,"mark":2},{"edge":24,"mark":1,"from":9}]},{"kind":"edges","changes":[{"edge":16,"mark":1,"from":21}]}]',
    },
  },
});

const BOARDS: WordtrailParams[] = [
  { w: 5, h: 5, words: 4, diff: DIFF_EASY },
  { w: 5, h: 5, words: 4, diff: DIFF_NORMAL },
  { w: 7, h: 6, words: 6, diff: DIFF_NORMAL },
];

function deal(p: WordtrailParams, seed: string): WordtrailState {
  return newState(p, wordtrailGame.newDesc(p, randomNew(seed)).desc);
}

describe("wordtrail hint plans", () => {
  it.each(BOARDS)("lead a $w x $h board at tier $diff to its answer", (p) => {
    for (const seed of ["plan a", "plan b", "plan c"]) {
      let state = deal(p, seed);
      const answer = answerOf(state);
      // The plan is capped, so it is asked again until the board is done.
      for (let asked = 0; wordtrailGame.status(state) !== "solved"; asked++) {
        expect(asked).toBeLessThan(state.edges.length);
        const result = wordtrailGame.hint?.(state);
        if (!result?.ok) throw new Error(`refused on ${seed}`);
        for (const step of result.steps) {
          if (step.move.kind !== "edges") throw new Error("a step marks edges");
          // The line `hint-quality.test.ts` draws for every game's sentences.
          expect(step.explanation.length, step.explanation).toBeLessThanOrEqual(120);
          // Each line the way the answer's runs, and a cross where it has none.
          for (const change of step.move.changes)
            expect(
              change.mark === LINE ? codeOf(state, change) : OPEN,
              step.explanation,
            ).toBe(answer?.[change.edge]);
          state = executeMove(state, step.move);
        }
      }
    }
  });

  it("a step rings exactly the edges its move marks", () => {
    const state = deal(BOARDS[1], "rings");
    const result = wordtrailGame.hint?.(state);
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
    const { state, step } = pinned("onlyWord");
    if (step.move.kind !== "edges") throw new Error("a step marks edges");
    const [first, ...rest] = step.move.changes;
    const copy = { ...step, move: structuredClone(step.move) };
    const verdict = wordtrailGame.hintKeepTrack?.(
      { kind: "edges", changes: [first] },
      copy,
      state,
    );
    expect(verdict).toBe(rest.length === 0 ? "completed" : "onTrack");
    if (rest.length > 0) expect(copy.move).toEqual({ kind: "edges", changes: rest });
  });

  it("a move the step does not ask for drops it", () => {
    const { state, step } = pinned("onlyWord");
    if (step.move.kind !== "edges") throw new Error("a step marks edges");
    const { edge } = step.move.changes[0];
    expect(
      wordtrailGame.hintKeepTrack?.(
        { kind: "edges", changes: [{ edge, mark: CROSS }] },
        step,
        state,
      ),
    ).toBe("off");
  });
});

describe("wordtrail hint tracking by direction", () => {
  it("keeps a step whose line is laid the way it asks, and drops it laid the other way", () => {
    const { state, step } = pinned("onlyWord");
    if (step.move.kind !== "edges") throw new Error("a step marks edges");
    const line = step.move.changes.find((c) => c.mark === LINE);
    if (line?.from === undefined) throw new Error("the pinned step lays a line");
    const g = squareEdges(state.w, state.h);
    const other = g.a[line.edge] === line.from ? g.b[line.edge] : g.a[line.edge];
    const judge = (from: number) =>
      wordtrailGame.hintKeepTrack?.(
        { kind: "edges", changes: [{ ...line, from }] },
        { ...step, move: structuredClone(step.move) },
        state,
      );
    expect(judge(line.from)).not.toBe("off");
    expect(judge(other)).toBe("off");
  });
});

describe("wordtrail hint frame", () => {
  it("rings the edges a step decides and outlines the letter it reads", () => {
    const { recording, step } = renderPinnedHint(wordtrailGame, pinned("onlyWord"));
    expect(stepMarks(step).of("ring", EDGE).length).toBeGreaterThan(0);
    // Each of an edge's two squares draws its half of the edge's one ring.
    expectRing(recording.ops, { rings: 2 * stepMarks(step).of("ring", EDGE).length });
    expect(recording.ops.some((op) => paintsWith(op, COL_HINT_OUTLINE))).toBe(true);
    expect(stepMarks(step).of("outline", CELL)).toHaveLength(1);
  });

  it("stripes the letters of the only words of a length", () => {
    const { recording, step } = renderPinnedHint(wordtrailGame, pinned("onlyLength"));
    expect(stepMarks(step).of("stripes", CELL).length).toBeGreaterThanOrEqual(3);
    expect(recording.ops.some((op) => op.op === "hatch")).toBe(true);
  });
});

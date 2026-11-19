/**
 * Wordtrail's hint: a pinned position and its sentence for every rung, and the
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
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import { wordtrailGame } from "./index.ts";
import { COL_HINT_EVIDENCE } from "./render.ts";
import { answerOf } from "./solver.ts";
import {
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
    /** Held on 99 of 149 positions walked. */
    oneWay: "5x5n4dn:3448,1hoboah1wog1byr1fusk1fur1",
    /** Held on 135 of 149 positions walked. */
    onlyWord: "5x5n4dn:3467,1il2gelchai1tylrkibwork1",
    /** Held on 144 of 149 positions walked. */
    onlyLength: {
      id: "5x5n4dn:3467,thag1rfnirid1fa1gef1yane1",
      moves:
        '[{"kind":"edges","changes":[{"edge":16,"mark":1}]},{"kind":"edges","changes":[{"edge":1,"mark":1},{"edge":21,"mark":2}]},{"kind":"edges","changes":[{"edge":25,"mark":1}]},{"kind":"edges","changes":[{"edge":26,"mark":2}]},{"kind":"edges","changes":[{"edge":8,"mark":1}]},{"kind":"edges","changes":[{"edge":29,"mark":1},{"edge":28,"mark":2},{"edge":11,"mark":1}]}]',
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
          for (const { edge, mark } of step.move.changes)
            expect(mark === LINE, step.explanation).toBe(answer?.[edge] === LINE);
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
    const { state, step } = pinned("oneWay");
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

describe("wordtrail hint frame", () => {
  it("rings the edges a step decides and outlines the letter it reads", () => {
    const { recording, step } = renderPinnedHint(wordtrailGame, pinned("onlyWord"));
    expect(stepMarks(step).of("ring", EDGE).length).toBeGreaterThan(0);
    // Each of an edge's two squares draws its half of the edge's one ring.
    expectRing(recording.ops, { rings: 2 * stepMarks(step).of("ring", EDGE).length });
    expect(recording.ops.some((op) => paintsWith(op, COL_HINT_EVIDENCE))).toBe(true);
    expect(stepMarks(step).of("outline", CELL)).toHaveLength(1);
  });

  it("outlines the letter with one way on", () => {
    const { step } = renderPinnedHint(wordtrailGame, pinned("oneWay"));
    expect(stepMarks(step).of("outline", CELL)).toHaveLength(1);
  });

  it("stripes the letters of the only words of a length", () => {
    const { recording, step } = renderPinnedHint(wordtrailGame, pinned("onlyLength"));
    expect(stepMarks(step).of("stripes", CELL).length).toBeGreaterThanOrEqual(3);
    expect(recording.ops.some((op) => op.op === "hatch")).toBe(true);
  });
});

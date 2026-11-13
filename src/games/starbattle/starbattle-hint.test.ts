/**
 * Star Battle's hint: a pinned position and its sentence for every rung, and
 * the properties a plan has on any board.
 *
 * `npm run hint-scan -- <this file>` writes the pins
 * (docs/testing.md § "Pinning a hint's positions").
 */
import { describe, expect, it } from "vitest";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing, ringsOf } from "../../engine/testing/mark-shape.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import { starbattleGame } from "./index.ts";
import { COL_HINT_EVIDENCE } from "./render.ts";
import { answerOf } from "./solver.ts";
import {
  BLANK,
  CROSSED,
  DIFF_EASY,
  DIFF_NORMAL,
  DIFF_TRICKY,
  executeMove,
  newState,
  STAR,
  type StarbattleParams,
  type StarbattleState,
} from "./state.ts";

const pinned = describeHintPins({
  game: starbattleGame,
  params: [
    { size: 6, stars: 1, diff: DIFF_TRICKY },
    { size: 8, stars: 2, diff: DIFF_EASY },
    { size: 9, stars: 2, diff: DIFF_NORMAL },
  ],
  pins: {
    /** Held on 1349 of 1441 positions walked. */
    around: {
      id: "8s2de:eeca1caab3c3e1ebeb3h3caj2ah1a",
      moves: [{ kind: "mark", cells: [{ index: 44, mark: 1 }] }],
    },
    /** Held on 1105 of 1441 positions walked. */
    fullLine: {
      id: "6s1dt:1baa3aacabae1adc1aac1d1",
      moves:
        '[{"kind":"mark","cells":[{"index":24,"mark":2},{"index":25,"mark":2},{"index":26,"mark":2},{"index":27,"mark":2}]},{"kind":"mark","cells":[{"index":30,"mark":1}]},{"kind":"mark","cells":[{"index":31,"mark":2}]}]',
    },
    /** Held on 199 of 1441 positions walked. */
    fullRegion: {
      id: "6s1dt:2b2a1ae4a1aac1bccababd",
      moves:
        '[{"kind":"mark","cells":[{"index":12,"mark":2},{"index":18,"mark":2},{"index":24,"mark":2},{"index":30,"mark":2}]},{"kind":"mark","cells":[{"index":1,"mark":2},{"index":7,"mark":2},{"index":13,"mark":2},{"index":19,"mark":2}]},{"kind":"mark","cells":[{"index":5,"mark":2},{"index":8,"mark":2},{"index":9,"mark":2},{"index":11,"mark":2},{"index":21,"mark":2},{"index":23,"mark":2},{"index":29,"mark":2}]},{"kind":"mark","cells":[{"index":15,"mark":2}]},{"kind":"mark","cells":[{"index":26,"mark":2}]},{"kind":"mark","cells":[{"index":27,"mark":2}]},{"kind":"mark","cells":[{"index":32,"mark":2}]},{"kind":"mark","cells":[{"index":22,"mark":2}]},{"kind":"mark","cells":[{"index":20,"mark":1}]},{"kind":"mark","cells":[{"index":14,"mark":2},{"index":25,"mark":2}]},{"kind":"mark","cells":[{"index":2,"mark":2}]}]',
    },
    /** Held on 1356 of 1441 positions walked. */
    exactLine: {
      id: "6s1dt:aab1bababbaaacbaj2e1a",
      moves:
        '[{"kind":"mark","cells":[{"index":30,"mark":2},{"index":31,"mark":2},{"index":32,"mark":2},{"index":35,"mark":2}]},{"kind":"mark","cells":[{"index":24,"mark":2},{"index":28,"mark":2},{"index":29,"mark":2}]},{"kind":"mark","cells":[{"index":0,"mark":2},{"index":6,"mark":2}]},{"kind":"mark","cells":[{"index":4,"mark":2},{"index":9,"mark":2},{"index":10,"mark":2},{"index":15,"mark":2},{"index":16,"mark":2},{"index":21,"mark":2},{"index":22,"mark":2}]}]',
    },
    /** Held on 480 of 1441 positions walked. */
    exactRegion: {
      id: "6s1dt:1baa3aacabae1adc1aac1d1",
      moves:
        '[{"kind":"mark","cells":[{"index":24,"mark":2},{"index":25,"mark":2},{"index":26,"mark":2},{"index":27,"mark":2}]}]',
    },
    /** Held on 621 of 1441 positions walked. */
    "confined.lines": "6s1dt:1baa3aacabae1adc1aac1d1",
    /** Held on 391 of 1441 positions walked. */
    "confined.regions": {
      id: "6s1dt:2b2a1ae4a1aac1bccababd",
      moves:
        '[{"kind":"mark","cells":[{"index":12,"mark":2},{"index":18,"mark":2},{"index":24,"mark":2},{"index":30,"mark":2}]},{"kind":"mark","cells":[{"index":1,"mark":2},{"index":7,"mark":2},{"index":13,"mark":2},{"index":19,"mark":2}]}]',
    },
    /** Held on 526 of 1441 positions walked. */
    neededLine: {
      id: "8s2de:eeca1caab3c3e1ebeb3h3caj2ah1a",
      moves:
        '[{"kind":"mark","cells":[{"index":44,"mark":1}]},{"kind":"mark","cells":[{"index":36,"mark":2},{"index":37,"mark":2},{"index":45,"mark":2},{"index":53,"mark":2},{"index":52,"mark":2},{"index":51,"mark":2},{"index":43,"mark":2},{"index":35,"mark":2}]},{"kind":"mark","cells":[{"index":56,"mark":2},{"index":57,"mark":2},{"index":58,"mark":2},{"index":59,"mark":2},{"index":63,"mark":2}]},{"kind":"mark","cells":[{"index":54,"mark":2},{"index":55,"mark":2}]}]',
    },
    /** Held on 584 of 1441 positions walked. */
    neededRegion: "8s2de:eeca1caab3c3e1ebeb3h3caj2ah1a",
    /** Held on 843 of 1441 positions walked. */
    crowdedLine: {
      id: "6s1dt:bd1ca1caabbd1c1a2dba1ba",
      moves:
        '[{"kind":"mark","cells":[{"index":32,"mark":2},{"index":33,"mark":2},{"index":34,"mark":2},{"index":35,"mark":2}]}]',
    },
    /** Held on 607 of 1441 positions walked. */
    crowdedRegion: "6s1dt:dca2cab1ab1eba3a1e1caa",
    /** Held on 186 of 1441 positions walked. */
    "banded.lines": {
      id: "9s2dn:f2bc1dabbcba1ac1ad1a1a1bcdc2c4d1c1c2a1fbaga1a1aab3a",
      moves:
        '[{"kind":"mark","cells":[{"index":64,"mark":2}]},{"kind":"mark","cells":[{"index":68,"mark":2}]},{"kind":"mark","cells":[{"index":70,"mark":2}]}]',
    },
    /** Held on 122 of 1441 positions walked. */
    "banded.regions": {
      id: "6s1dt:dca2cab1ab1eba3a1e1caa",
      moves:
        '[{"kind":"mark","cells":[{"index":4,"mark":2}]},{"kind":"mark","cells":[{"index":27,"mark":2}]},{"kind":"mark","cells":[{"index":34,"mark":2}]}]',
    },
    /** Held on 46 of 1441 positions walked. */
    starvedLine: {
      id: "6s1dt:2b2a1ae4a1aac1bccababd",
      moves:
        '[{"kind":"mark","cells":[{"index":12,"mark":2},{"index":18,"mark":2},{"index":24,"mark":2},{"index":30,"mark":2}]},{"kind":"mark","cells":[{"index":1,"mark":2},{"index":7,"mark":2},{"index":13,"mark":2},{"index":19,"mark":2}]},{"kind":"mark","cells":[{"index":5,"mark":2},{"index":8,"mark":2},{"index":9,"mark":2},{"index":11,"mark":2},{"index":21,"mark":2},{"index":23,"mark":2},{"index":29,"mark":2}]},{"kind":"mark","cells":[{"index":15,"mark":2}]},{"kind":"mark","cells":[{"index":26,"mark":2}]},{"kind":"mark","cells":[{"index":27,"mark":2}]},{"kind":"mark","cells":[{"index":32,"mark":2}]}]',
    },
    /** Held on 114 of 1441 positions walked. */
    starvedRegion: {
      id: "6s1dt:dca2cab1ab1eba3a1e1caa",
      moves:
        '[{"kind":"mark","cells":[{"index":4,"mark":2}]},{"kind":"mark","cells":[{"index":27,"mark":2}]},{"kind":"mark","cells":[{"index":34,"mark":2}]},{"kind":"mark","cells":[{"index":12,"mark":2},{"index":14,"mark":2}]},{"kind":"mark","cells":[{"index":2,"mark":2},{"index":3,"mark":2},{"index":8,"mark":2},{"index":9,"mark":2},{"index":32,"mark":2}]},{"kind":"mark","cells":[{"index":21,"mark":2}]},{"kind":"mark","cells":[{"index":19,"mark":2}]},{"kind":"mark","cells":[{"index":25,"mark":2}]},{"kind":"mark","cells":[{"index":35,"mark":2}]}]',
    },
  },
});

const BOARDS: StarbattleParams[] = [
  { size: 5, stars: 1, diff: DIFF_EASY },
  { size: 6, stars: 1, diff: DIFF_TRICKY },
  { size: 8, stars: 2, diff: DIFF_NORMAL },
];

function deal(p: StarbattleParams, seed: string): StarbattleState {
  return newState(p, starbattleGame.newDesc(p, randomNew(seed)).desc);
}

describe("starbattle hint plans", () => {
  it.each(
    BOARDS,
  )("lead a $size x $size board of $stars at tier $diff to its answer", (p) => {
    for (const seed of ["plan a", "plan b", "plan c"]) {
      let state = deal(p, seed);
      const answer = answerOf(state.size, state.stars, state.regions);
      // The plan is capped, so it is asked again until the board is done.
      for (let asked = 0; starbattleGame.status(state) !== "solved"; asked++) {
        expect(asked).toBeLessThan(state.grid.length);
        const result = starbattleGame.hint?.(state);
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
    const state = deal(BOARDS[2], "rings");
    const result = starbattleGame.hint?.(state);
    if (!result?.ok) throw new Error("refused");
    for (const step of result.steps) {
      if (step.move.kind !== "mark") throw new Error("a step marks squares");
      const ringed = stepMarks(step)
        .of("ring", CELL)
        .map((c) => c.y * state.size + c.x);
      expect(ringed.sort()).toEqual(step.move.cells.map((c) => c.index).sort());
    }
  });

  it("a move that makes part of a step keeps it, shrunk to the rest", () => {
    const { state, step } = pinned("around");
    if (step.move.kind !== "mark") throw new Error("a step marks squares");
    const [first, ...rest] = step.move.cells;
    expect(rest.length).toBeGreaterThan(0);
    const copy = { ...step, move: structuredClone(step.move) };
    const verdict = starbattleGame.hintKeepTrack?.(
      { kind: "mark", cells: [first] },
      copy,
      state,
    );
    expect(verdict).toBe("onTrack");
    expect(copy.move).toEqual({ kind: "mark", cells: rest });
    expect(stepMarks(copy).of("ring", CELL)).toHaveLength(rest.length);
  });

  it("the first of two clicks toward a step's mark keeps it whole", () => {
    const { state, step } = pinned("exactLine");
    if (step.move.kind !== "mark") throw new Error("a step marks squares");
    const { index } = step.move.cells[0];
    expect(state.grid[index]).toBe(BLANK);
    // The right button reaches a star through a cross.
    const copy = { ...step, move: structuredClone(step.move) };
    expect(
      starbattleGame.hintKeepTrack?.(
        { kind: "mark", cells: [{ index, mark: CROSSED }] },
        copy,
        state,
      ),
    ).toBe("onTrack");
    expect(copy.move).toEqual(step.move);
    const crossed = executeMove(state, {
      kind: "mark",
      cells: [{ index, mark: CROSSED }],
    });
    expect(
      starbattleGame.hintKeepTrack?.(
        { kind: "mark", cells: [{ index, mark: STAR }] },
        copy,
        crossed,
      ),
    ).toBe(step.move.cells.length === 1 ? "completed" : "onTrack");
  });

  it("a move the step does not ask for drops it", () => {
    const { state, step } = pinned("around");
    if (step.move.kind !== "mark") throw new Error("a step marks squares");
    const asked = new Set(step.move.cells.map((c) => c.index));
    const other = Array.from(state.grid.keys()).find(
      (i) => state.grid[i] === BLANK && !asked.has(i),
    );
    if (other === undefined) throw new Error("no other blank square");
    expect(
      starbattleGame.hintKeepTrack?.(
        { kind: "mark", cells: [{ index: other, mark: CROSSED }] },
        step,
        state,
      ),
    ).toBe("off");
  });
});

describe("starbattle hint frame", () => {
  it("rings the square and outlines what a trial star rules out", () => {
    const { recording, step } = renderPinnedHint(starbattleGame, pinned("starvedLine"));
    expect(stepMarks(step).of("ring", CELL)).toHaveLength(1);
    expect(stepMarks(step).of("stripes", CELL).length).toBeGreaterThan(0);
    expectRing(recording.ops);
  });

  it("outlines the regions a band of rows or columns is counted against", () => {
    const { state } = pinned("banded.lines");
    const { recording, step } = renderPinnedHint(
      starbattleGame,
      pinned("banded.lines"),
    );
    const stripes = stepMarks(step).of("stripes", CELL);
    // Whole lines, and more than one of them.
    expect(stripes.length % state.size).toBe(0);
    expect(stripes.length / state.size).toBeGreaterThan(1);
    expect(stepMarks(step).of("outline", CELL).length).toBeGreaterThan(0);
    expect(ringsOf(recording.ops).length).toBeGreaterThan(0);
    expect(recording.ops.some((op) => paintsWith(op, COL_HINT_EVIDENCE))).toBe(true);
  });
});

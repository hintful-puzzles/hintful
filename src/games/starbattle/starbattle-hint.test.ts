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
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import { starbattleGame } from "./index.ts";
import { COL_HINT, COL_HINT_EVIDENCE } from "./render.ts";
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
    /** Held on 1365 of 1464 positions walked. */
    around: {
      id: "8s2de:eeca1caab3c3e1ebeb3h3caj2ah1a",
      moves: [{ kind: "mark", cells: [{ index: 44, mark: 1 }] }],
    },
    /** Held on 1211 of 1464 positions walked. */
    full: {
      id: "6s1dt:b1a1dd2bb1ac1a2h2baba1a",
      moves:
        '[{"kind":"mark","cells":[{"index":0,"mark":2},{"index":1,"mark":2},{"index":2,"mark":2},{"index":3,"mark":2}]},{"kind":"mark","cells":[{"index":6,"mark":1}]},{"kind":"mark","cells":[{"index":7,"mark":2},{"index":12,"mark":2},{"index":13,"mark":2}]}]',
    },
    /** Held on 1427 of 1464 positions walked. */
    exact: {
      id: "6s1dt:b1a1dd2bb1ac1a2h2baba1a",
      moves:
        '[{"kind":"mark","cells":[{"index":0,"mark":2},{"index":1,"mark":2},{"index":2,"mark":2},{"index":3,"mark":2}]}]',
    },
    /** Held on 483 of 1464 positions walked. */
    confined: "6s1dt:ebaab1a1abcb4cca1aa1b1b1",
    /** Held on 726 of 1464 positions walked. */
    needed: "8s2de:eeca1caab3c3e1ebeb3h3caj2ah1a",
    /** Held on 717 of 1464 positions walked. */
    crowded: "6s1dt:b1baa2b2dab1cca1e2acda",
    /** Held on 137 of 1464 positions walked. */
    starved: {
      id: "6s1dt:ebaab1a1abcb4cca1aa1b1b1",
      moves:
        '[{"kind":"mark","cells":[{"index":6,"mark":2},{"index":12,"mark":2},{"index":18,"mark":2}]},{"kind":"mark","cells":[{"index":30,"mark":2},{"index":31,"mark":2},{"index":32,"mark":2},{"index":33,"mark":2}]},{"kind":"mark","cells":[{"index":21,"mark":2}]},{"kind":"mark","cells":[{"index":28,"mark":2}]},{"kind":"mark","cells":[{"index":29,"mark":2}]},{"kind":"mark","cells":[{"index":20,"mark":2},{"index":23,"mark":2}]}]',
    },
    /** Held on 339 of 1464 positions walked. */
    banded: {
      id: "6s1dt:b1baa2b2dab1cca1e2acda",
      moves:
        '[{"kind":"mark","cells":[{"index":2,"mark":2}]},{"kind":"mark","cells":[{"index":28,"mark":2}]}]',
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
    const { state, step } = pinned("exact");
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

  it("with crosses brought by a star, the plan ends at its first star and the star completes its step", () => {
    const state = deal(BOARDS[1], "auto");
    const ui = { ...starbattleGame.newUi(state), autoCross: true };
    let board = state;
    for (let asked = 0; starbattleGame.status(board) !== "solved"; asked++) {
      expect(asked).toBeLessThan(state.grid.length);
      const result = starbattleGame.hint?.(board, undefined, ui);
      if (!result?.ok) throw new Error("refused");
      const stars = result.steps.filter(
        (s) => s.move.kind === "mark" && s.move.cells[0].mark === STAR,
      );
      expect(stars.length).toBeLessThanOrEqual(1);
      if (stars.length === 1) expect(result.steps.at(-1)).toBe(stars[0]);
      for (const step of result.steps) {
        if (step.move.kind !== "mark") throw new Error("a step marks squares");
        // Each square is clicked as the player would click it.
        for (const { index, mark } of step.move.cells) {
          if (board.grid[index] === mark) continue;
          const at = { x: index % state.size, y: (index / state.size) | 0 };
          const verb =
            starbattleGame.targetVerbs?.[mark === STAR ? "primary" : "secondary"];
          const move = verb?.apply(board, at, ui);
          if (!move || typeof move !== "object") throw new Error("no move");
          const copy = { ...step, move: structuredClone(step.move) };
          expect(starbattleGame.hintKeepTrack?.(move, copy, board)).not.toBe("off");
          board = executeMove(board, move);
        }
      }
    }
    expect(starbattleGame.findMistakes?.(board)).toEqual([]);
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
    const { recording, step } = renderPinnedHint(starbattleGame, pinned("starved"));
    expect(stepMarks(step).of("ring", CELL)).toHaveLength(1);
    expect(stepMarks(step).of("stripes", CELL).length).toBeGreaterThan(0);
    expect(recording.ops.some((op) => paintsWith(op, COL_HINT))).toBe(true);
  });

  it("outlines the regions a band of rows or columns is counted against", () => {
    const { state } = pinned("banded");
    const { recording, step } = renderPinnedHint(starbattleGame, pinned("banded"));
    const stripes = stepMarks(step).of("stripes", CELL);
    // Whole lines, and more than one of them.
    expect(stripes.length % state.size).toBe(0);
    expect(stripes.length / state.size).toBeGreaterThan(1);
    expect(stepMarks(step).of("outline", CELL).length).toBeGreaterThan(0);
    for (const color of [COL_HINT, COL_HINT_EVIDENCE])
      expect(recording.ops.some((op) => paintsWith(op, color))).toBe(true);
  });
});

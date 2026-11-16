/**
 * Norinori's hint: a pinned position and its sentence for every rung, and
 * the properties a plan has on any board.
 *
 * `npm run hint-scan -- <this file>` writes the pins
 * (docs/testing.md § "Pinning a hint's positions").
 */
import { describe, expect, it } from "vitest";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import { itDeep } from "../../engine/testing/slow.ts";
import { norinoriGame } from "./index.ts";
import { COL_HINT_EVIDENCE } from "./render.ts";
import { answerOf } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  DIFF_TRICKY,
  decodeParams,
  executeMove,
  type NorinoriParams,
  type NorinoriState,
  newState,
} from "./state.ts";

const pinned = describeHintPins({
  game: norinoriGame,
  params: [
    { w: 6, h: 6, diff: DIFF_NORMAL },
    { w: 6, h: 6, diff: DIFF_TRICKY },
  ],
  // `blocked` held on 180 of 1746 positions at this many (2026-11-16).
  seeds: 48,
  pins: {
    /** Held on 1619 of 1746 positions walked. */
    domino: {
      id: "6x6dn:1c2aabeb2b2b2aa1c3daf",
      moves: [
        {
          kind: "mark",
          cells: [
            { index: 0, mark: 1 },
            { index: 6, mark: 1 },
          ],
        },
      ],
    },
    /** Held on 1383 of 1746 positions walked. */
    partner: {
      id: "6x6dn:eaacb1bbabb1b5a5aah",
      moves:
        '[{"kind":"mark","cells":[{"index":7,"mark":1},{"index":8,"mark":1}]},{"kind":"mark","cells":[{"index":1,"mark":2},{"index":13,"mark":2},{"index":6,"mark":2},{"index":2,"mark":2},{"index":9,"mark":2},{"index":14,"mark":2}]},{"kind":"mark","cells":[{"index":0,"mark":2}]},{"kind":"mark","cells":[{"index":12,"mark":1},{"index":15,"mark":1}]}]',
    },
    /** Held on 351 of 1746 positions walked. */
    between: {
      id: "6x6dn:ebab1babaa1c2fa3ac1a1c",
      moves:
        '[{"kind":"mark","cells":[{"index":23,"mark":1},{"index":29,"mark":1}]},{"kind":"mark","cells":[{"index":17,"mark":2},{"index":22,"mark":2},{"index":35,"mark":2},{"index":28,"mark":2}]},{"kind":"mark","cells":[{"index":16,"mark":1},{"index":21,"mark":1}]}]',
    },
    /** Held on 1197 of 1746 positions walked. */
    alone: {
      id: "6x6dn:eaacb1bbabb1b5a5aah",
      moves:
        '[{"kind":"mark","cells":[{"index":7,"mark":1},{"index":8,"mark":1}]},{"kind":"mark","cells":[{"index":1,"mark":2},{"index":13,"mark":2},{"index":6,"mark":2},{"index":2,"mark":2},{"index":9,"mark":2},{"index":14,"mark":2}]}]',
    },
    /** Held on 267 of 1746 positions walked. */
    claimed: {
      id: "6x6dn:1abb2a2adeacaa1d3c3b2a",
      moves:
        '[{"kind":"mark","cells":[{"index":13,"mark":1},{"index":14,"mark":1}]},{"kind":"mark","cells":[{"index":7,"mark":2},{"index":19,"mark":2},{"index":12,"mark":2},{"index":8,"mark":2},{"index":15,"mark":2},{"index":20,"mark":2}]},{"kind":"mark","cells":[{"index":33,"mark":1},{"index":34,"mark":1}]},{"kind":"mark","cells":[{"index":27,"mark":2},{"index":32,"mark":2},{"index":28,"mark":2},{"index":35,"mark":2}]},{"kind":"mark","cells":[{"index":26,"mark":1},{"index":29,"mark":1}]},{"kind":"mark","cells":[{"index":25,"mark":1}]},{"kind":"mark","cells":[{"index":31,"mark":2},{"index":24,"mark":2}]},{"kind":"mark","cells":[{"index":23,"mark":1}]},{"kind":"mark","cells":[{"index":17,"mark":2},{"index":22,"mark":2}]},{"kind":"mark","cells":[{"index":18,"mark":2}]},{"kind":"mark","cells":[{"index":21,"mark":2}]},{"kind":"mark","cells":[{"index":30,"mark":2}]},{"kind":"mark","cells":[{"index":11,"mark":1}]},{"kind":"mark","cells":[{"index":3,"mark":1}]}]',
    },
    /** Held on 786 of 1746 positions walked. */
    fullRegion: {
      id: "6x6dt:bca4b2a2fa2abaa1db2bb1",
      moves:
        '[{"kind":"mark","cells":[{"index":34,"mark":1},{"index":35,"mark":1}]},{"kind":"mark","cells":[{"index":28,"mark":2},{"index":33,"mark":2},{"index":29,"mark":2}]},{"kind":"mark","cells":[{"index":13,"mark":2}]},{"kind":"mark","cells":[{"index":19,"mark":1},{"index":25,"mark":1}]},{"kind":"mark","cells":[{"index":20,"mark":2},{"index":18,"mark":2},{"index":26,"mark":2},{"index":31,"mark":2},{"index":24,"mark":2}]},{"kind":"mark","cells":[{"index":30,"mark":2}]},{"kind":"mark","cells":[{"index":32,"mark":2}]},{"kind":"mark","cells":[{"index":23,"mark":1},{"index":27,"mark":1}]},{"kind":"mark","cells":[{"index":21,"mark":1}]},{"kind":"mark","cells":[{"index":15,"mark":2},{"index":22,"mark":2}]},{"kind":"mark","cells":[{"index":17,"mark":1}]},{"kind":"mark","cells":[{"index":11,"mark":2},{"index":16,"mark":2}]}]',
    },
    /** Held on 1529 of 1746 positions walked. */
    exactRegion: "6x6dn:1c2aabeb2b2b2aa1c3daf",
    /** Held on 657 of 1746 positions walked. */
    neededRegion: {
      id: "6x6dn:a1c4b1a1aaa1ib1b3adb1b1",
      moves:
        '[{"kind":"mark","cells":[{"index":2,"mark":1},{"index":8,"mark":1}]},{"kind":"mark","cells":[{"index":3,"mark":2},{"index":1,"mark":2},{"index":9,"mark":2},{"index":14,"mark":2},{"index":7,"mark":2}]},{"kind":"mark","cells":[{"index":10,"mark":1},{"index":16,"mark":1}]},{"kind":"mark","cells":[{"index":4,"mark":2},{"index":11,"mark":2},{"index":17,"mark":2},{"index":22,"mark":2},{"index":15,"mark":2}]},{"kind":"mark","cells":[{"index":5,"mark":2}]},{"kind":"mark","cells":[{"index":23,"mark":1},{"index":29,"mark":1}]},{"kind":"mark","cells":[{"index":35,"mark":2},{"index":28,"mark":2}]},{"kind":"mark","cells":[{"index":13,"mark":1},{"index":21,"mark":1}]}]',
    },
    /** Held on 180 of 1746 positions walked. */
    blocked: {
      id: "6x6dn:2cada2aa1a2fcb1b1ac1aaba",
      moves:
        '[{"kind":"mark","cells":[{"index":0,"mark":1},{"index":6,"mark":1}]},{"kind":"mark","cells":[{"index":1,"mark":2},{"index":7,"mark":2},{"index":12,"mark":2}]},{"kind":"mark","cells":[{"index":19,"mark":1},{"index":25,"mark":1}]},{"kind":"mark","cells":[{"index":13,"mark":2},{"index":20,"mark":2},{"index":18,"mark":2},{"index":26,"mark":2},{"index":31,"mark":2},{"index":24,"mark":2}]},{"kind":"mark","cells":[{"index":30,"mark":2}]},{"kind":"mark","cells":[{"index":8,"mark":1},{"index":14,"mark":1}]},{"kind":"mark","cells":[{"index":2,"mark":2},{"index":9,"mark":2},{"index":15,"mark":2}]},{"kind":"mark","cells":[{"index":16,"mark":1},{"index":21,"mark":1}]},{"kind":"mark","cells":[{"index":22,"mark":2}]},{"kind":"mark","cells":[{"index":27,"mark":1}]},{"kind":"mark","cells":[{"index":28,"mark":2},{"index":33,"mark":2}]},{"kind":"mark","cells":[{"index":32,"mark":2}]}]',
    },
    /** Held on 439 of 1746 positions walked. */
    crowded: "6x6dt:f2aa3a4a2ada1aaadb1e1a",
  },
});

const BOARDS: NorinoriParams[] = [
  { w: 6, h: 6, diff: DIFF_EASY },
  { w: 6, h: 6, diff: DIFF_TRICKY },
  { w: 7, h: 5, diff: DIFF_NORMAL },
];

function deal(p: NorinoriParams, seed: string): NorinoriState {
  return newState(p, norinoriGame.newDesc(p, randomNew(seed)).desc);
}

/** A board written down as its game ID. */
function board(id: string): NorinoriState {
  const colon = id.indexOf(":");
  return newState(decodeParams(id.slice(0, colon)), id.slice(colon + 1));
}

/** Boards the pins name, at Normal and Tricky: what CI walks, where dealing
 * would cost seconds a board. */
const WRITTEN = ["6x6dn:a1c4b1a1aaa1ib1b3adb1b1", "6x6dt:f2aa3a4a2ada1aaadb1e1a"];

/** Hint plans, asked again whenever one runs out, finish `state` with the
 * answer's marks. */
function expectPlansFinish(start: NorinoriState, label: string): void {
  let state = start;
  const answer = answerOf(state.w, state.h, state.regions);
  // The plan is capped, so it is asked again until the board is done.
  for (let asked = 0; norinoriGame.status(state) !== "solved"; asked++) {
    expect(asked).toBeLessThan(state.grid.length);
    const result = norinoriGame.hint?.(state);
    if (!result?.ok) throw new Error(`refused on ${label}`);
    for (const step of result.steps) {
      if (step.move.kind !== "mark") throw new Error("a step marks squares");
      for (const { index, mark } of step.move.cells) expect(mark).toBe(answer?.[index]);
      state = executeMove(state, step.move);
    }
  }
}

describe("norinori hint plans", () => {
  it.each(WRITTEN)("lead %s to its answer", (id) => {
    expectPlansFinish(board(id), id);
  });

  itDeep.each(BOARDS)("lead a dealt $w x $h board at tier $diff to its answer", (p) => {
    for (const seed of ["plan a", "plan b"]) expectPlansFinish(deal(p, seed), seed);
  });

  it("a step rings exactly the squares its move marks", () => {
    const state = board(WRITTEN[1]);
    const result = norinoriGame.hint?.(state);
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
    const { state, step } = pinned("domino");
    if (step.move.kind !== "mark") throw new Error("a step marks squares");
    const [first, ...rest] = step.move.cells;
    const copy = { ...step, move: structuredClone(step.move) };
    const verdict = norinoriGame.hintKeepTrack?.(
      { kind: "mark", cells: [first] },
      copy,
      state,
    );
    expect(verdict).toBe(rest.length === 0 ? "completed" : "onTrack");
    if (rest.length > 0) expect(copy.move).toEqual({ kind: "mark", cells: rest });
  });

  it("a move the step does not ask for drops it", () => {
    const { state, step } = pinned("partner");
    if (step.move.kind !== "mark") throw new Error("a step marks squares");
    const { index, mark } = step.move.cells[0];
    const other = mark === 1 ? 2 : 1;
    expect(
      norinoriGame.hintKeepTrack?.(
        { kind: "mark", cells: [{ index, mark: other }] },
        step,
        state,
      ),
    ).toBe("off");
  });
});

describe("norinori hint frame", () => {
  it("rings the square and outlines the shaded squares a domino step reads", () => {
    const { recording, step } = renderPinnedHint(norinoriGame, pinned("domino"));
    expect(stepMarks(step).of("outline", CELL)).toHaveLength(2);
    expectRing(recording.ops, { rings: stepMarks(step).of("ring", CELL).length });
    expect(recording.ops.some((op) => paintsWith(op, COL_HINT_EVIDENCE))).toBe(true);
  });
});

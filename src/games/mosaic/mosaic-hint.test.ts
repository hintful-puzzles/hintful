/**
 * Mosaic's hint: its two rules, narrated and drawn (tier 2.5), and the plan
 * held to the solution. The targeted assertions stand beside the snapshot so a
 * careless `vitest -u` cannot erase them.
 */
import { describe, expect, it } from "vitest";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { type MosaicHint, mosaicHint } from "./hint.ts";
import { BLOCK, blockOf } from "./hint-marks.ts";
import { mosaicGame } from "./index.ts";
import { COL_HINT, COL_HINT_EVIDENCE } from "./render.ts";
import { newDesc, solveGameActual } from "./solver.ts";
import { newState, STATE_BLANK, STATE_MARKED } from "./state.ts";

const P = { width: 10, height: 10, aggressive: true };
const desc = newDesc(P, randomNew("mosaic-hint")).desc;

/** The two marks a step can make, each pinned on a position whose hint opens
 * with a step making it. */
const pinned = describeHintPins({
  game: mosaicGame,
  params: [P],
  kinds: {
    white: (step) => (step.highlights as MosaicHint).mark === STATE_BLANK,
    black: (step) => (step.highlights as MosaicHint).mark === STATE_MARKED,
  },
  pins: {
    /** Held on 247 of 493 positions walked. */
    white: "10x10:0c4a5c2a3456b5a25a655b3b55a5a20a22a44b11c4a232c14a3c5f5c8d44d4b3d5c",
    /** Held on 246 of 493 positions walked. */
    black:
      "10x10:c3c4442a4a5a44b3a4a4d53b3a133b23a3b4a7a1a2a5b3c323g212a5b5a0b32a2e02e2",
  },
});

describe("Mosaic's hint", () => {
  it("plans the whole board, every step agreeing with the solution", () => {
    const state = newState(P, desc);
    const solution = solveGameActual(state.board);
    const res = mosaicHint(state);
    if (!res.ok || !solution) throw new Error("no plan");
    const decided = new Set<number>();
    for (const step of res.steps) {
      const { cells, mark } = step.highlights as MosaicHint;
      for (const c of cells) {
        expect(solution[c], `square ${c}`).toBe(mark);
        decided.add(c);
      }
    }
    expect(decided.size).toBe(P.width * P.height);
  });

  it.each([
    ["white", STATE_BLANK, /already has its|allows no/],
    ["black", STATE_MARKED, /needs/],
  ] as const)("a step that makes squares %s is drawn and said", (kind, mark, words) => {
    const { id, moves, step } = pinned(kind);
    const { recording, hint } = renderScenario({
      game: mosaicGame,
      id,
      moves,
      showHint: true,
    });
    expect(hint?.explanation).toBe(step.explanation);
    const hl = hint?.highlights as MosaicHint;
    expect(hl.mark).toBe(mark);
    expect(hint?.explanation).toMatch(words);
    // Each decided square is ringed, never filled with the mark it gets.
    expectRing(recording.ops, COL_HINT, hl.cells.length);
    expect(stepMarks(hint).of("ring", CELL)).toHaveLength(hl.cells.length);
    // The number's block is one outline: a side per square on its perimeter.
    const [clue] = stepMarks(hint).of("outline", BLOCK);
    const block = blockOf(clue, P.width, P.height);
    const across = new Set(block.map((p) => p.x)).size;
    const down = new Set(block.map((p) => p.y)).size;
    const sides = recording.ops.filter(
      (o) => o.op === "rect" && o.color === COL_HINT_EVIDENCE,
    );
    expect(sides).toHaveLength(2 * (across + down));
    expect(recording.ops).toMatchSnapshot();
  });
});

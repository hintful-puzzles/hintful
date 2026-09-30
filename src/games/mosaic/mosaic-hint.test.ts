/**
 * Mosaic's hint: its two rules, narrated and drawn (tier 2.5), and the plan
 * held to the solution. The targeted assertions stand beside the snapshot so a
 * careless `vitest -u` cannot erase them.
 */
import { describe, expect, it } from "vitest";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
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
const id = `10x10:${desc}`;

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
  ] as const)("a step that makes squares %s is drawn and said", (_, mark, words) => {
    const { recording, hint } = renderScenario({
      game: mosaicGame,
      id,
      showHint: true,
      hintUntil: (step) => (step.highlights as MosaicHint).mark === mark,
    });
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

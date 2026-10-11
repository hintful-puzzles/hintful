/**
 * Mosaic's hint: its two rules, narrated and drawn (tier 2.5), and the plan
 * held to the solution. The targeted assertions stand beside the snapshot so a
 * careless `vitest -u` cannot erase them.
 */
import { describe, expect, it } from "vitest";
import { DIFF_EASY, DIFF_UNREASONABLE } from "../../engine/answer-search.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import { type MosaicHint, mosaicHint } from "./hint.ts";
import { BLOCK, blockOf } from "./hint-marks.ts";
import { mosaicGame } from "./index.ts";
import { COL_HINT, COL_HINT_EVIDENCE } from "./render.ts";
import { answerOf, newDesc, solveGameActual } from "./solver.ts";
import { newState, STATE_BLANK, STATE_MARKED } from "./state.ts";

const P = { width: 10, height: 10, aggressive: true, diff: DIFF_EASY };
const desc = newDesc(P, randomNew("mosaic-hint")).desc;

/** An Unreasonable board is where a dealt board's hint compares two numbers. */
const U = { ...P, diff: DIFF_UNREASONABLE };

/** The four steps, each pinned on a position whose hint speaks it. */
const pinned = describeHintPins({
  game: mosaicGame,
  params: [P, U],
  pins: {
    /** Held on 668 of 706 positions walked. */
    met: "10x10:0c4a5c2a3456b5a25a655b3b55a5a20a22a44b11c4a232c14a3c5f5c8d44d4b3d5c",
    /** Held on 673 of 706 positions walked. */
    needsAll:
      "10x10:c3c4442a4a5a44b3a4a4d53b3a133b23a3b4a7a1a2a5b3c323g212a5b5a0b32a2e02e2",
    /** Held on 178 of 706 positions walked. */
    needsMore:
      "10x10du:3a21j44b5b8a4a6a5c87c45a3477a4a45d86412b4a36a4f4c554a43a5k23a44a",
    /** Held on 202 of 706 positions walked. */
    sameNeed: {
      id: "10x10du:3a21j44b5b8a4a6a5c87c45a3477a4a45d86412b4a36a4f4c554a43a5k23a44a",
      moves:
        '[{"type":"fill","cells":[32,42,52],"mark":1},{"type":"fill","cells":[41,43,53,63],"mark":1}]',
    },
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
    ["clear", "met", STATE_BLANK, /already has its|allows no/],
    ["shaded", "needsAll", STATE_MARKED, /needs/],
  ] as const)("a step that makes squares %s is drawn and said", (_, rung, mark, words) => {
    const { recording, hint } = renderPinnedHint(mosaicGame, pinned(rung));
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

  it.each([
    [
      "needs more than",
      "needsMore",
      STATE_MARKED,
      /needs \d more .+ than .+, and only \d/,
    ],
    [
      "needs as many as",
      "sameNeed",
      STATE_BLANK,
      /empty squares are all in .+ block, and both/,
    ],
  ] as const)("a step where one number %s another is drawn and said", (_, rung, mark, words) => {
    const { recording, hint } = renderPinnedHint(mosaicGame, pinned(rung));
    const hl = hint?.highlights as MosaicHint;
    expect(hl.mark).toBe(mark);
    expect(hint?.explanation).toMatch(words);
    expectRing(recording.ops, COL_HINT, hl.cells.length);
    const rings = stepMarks(hint).of("ring", CELL);
    expect(rings).toHaveLength(hl.cells.length);

    // Both numbers are named, the first the one the sentence opens on, and
    // the ringed squares are ones only one of the two counts: the first's
    // where they are shaded, the other's where they are clear.
    const blocks = stepMarks(hint)
      .of("outline", BLOCK)
      .map((clue) => blockOf(clue, P.width, P.height));
    expect(blocks).toHaveLength(2);
    const [first, other] = mark === STATE_MARKED ? blocks : blocks.toReversed();
    const within = (
      block: readonly { x: number; y: number }[],
      p: { x: number; y: number },
    ) => block.some((q) => q.x === p.x && q.y === p.y);
    for (const p of rings) {
      expect(within(first ?? [], p)).toBe(true);
      expect(within(other ?? [], p)).toBe(false);
    }

    // Each block is outlined whole, so the two read as two squares: a side
    // per square on either perimeter, drawn once where the two share it.
    const perimeter = new Set<string>();
    for (const block of blocks) {
      const xs = block.map((p) => p.x);
      const ys = block.map((p) => p.y);
      for (const p of block) {
        if (p.x === Math.min(...xs)) perimeter.add(`${p.x},${p.y} left`);
        if (p.x === Math.max(...xs)) perimeter.add(`${p.x},${p.y} right`);
        if (p.y === Math.min(...ys)) perimeter.add(`${p.x},${p.y} top`);
        if (p.y === Math.max(...ys)) perimeter.add(`${p.x},${p.y} bottom`);
      }
    }
    const sides = recording.ops.filter(
      (o) => o.op === "rect" && o.color === COL_HINT_EVIDENCE,
    );
    expect(sides).toHaveLength(perimeter.size);
    expect(recording.ops).toMatchSnapshot();
  });

  it("on an Unreasonable board plans only what the answer has, and stops short", () => {
    let comparing = 0;
    for (let seed = 0; seed < 6; seed++) {
      const state = newState(U, newDesc(U, randomNew(`mosaic-hint-${seed}`)).desc);
      const answer = answerOf(state);
      const res = mosaicHint(state);
      if (!res.ok || answer.kind !== "one") throw new Error("no plan");
      const decided = new Set<number>();
      for (const step of res.steps) {
        const { cells, mark } = step.highlights as MosaicHint;
        if (step.rung === "needsMore" || step.rung === "sameNeed") comparing++;
        for (const c of cells) {
          expect(answer.solution[c], `seed ${seed}, square ${c}`).toBe(mark);
          decided.add(c);
        }
      }
      expect(decided.size).toBeLessThan(U.width * U.height);
    }
    expect(comparing).toBeGreaterThan(6);
  });
});

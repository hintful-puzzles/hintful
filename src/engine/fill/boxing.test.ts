/**
 * The walk of notes over any unit, on the `boxing` fixture: a 4x4 board in
 * 2x2 blocks, `blocks(2, 2)`, the diagonals units where its X is on, and
 * areas of four a rule holds distinct beside them.
 */

import { describe, expect, it } from "vitest";
import * as boxing from "../../generated/engine/testing/fixtures/boxing/boxing.compiled.ts";
import type { HintStep } from "../contract/game.ts";
import type { CandidateReading } from "../hint/candidate-hint.ts";
import { randomNew } from "../random/index.ts";
import { type FillBoard, solveBoard, spaceOf } from "./board.ts";
import type { CandidateFillHint } from "./candidates.ts";
import { fillGame } from "./game.ts";
import type { FillHint } from "./hint.ts";
import type { FillMove } from "./notes.ts";

const game = fillGame("boxing", boxing);
type Board = FillBoard<boxing.Dealt>;
type Step = HintStep<FillMove, FillHint>;

const params = (x: boolean, diff = 0) => ({
  w: 4,
  h: 4,
  diff,
  ...(x ? { variations: ["X"] } : {}),
});
const dealt = (x: boolean, diff: number, seed: string): Board => {
  const p = params(x, diff);
  return game.newState(p, game.newDesc(p, randomNew(seed)).desc);
};
const plan = (b: Board, reading: CandidateReading): Step[] => {
  const got = game.hint.plan(b, undefined, {
    ...game.newUi(b),
    candidateReading: reading,
  });
  if (!got.ok) throw new Error(`no plan: ${JSON.stringify(got)}`);
  return got.steps;
};
/** The 2x2 blocks' cells, as `blocks(2, 2)` cuts a 4x4 board. */
const BLOCKS = [
  [0, 1, 4, 5],
  [2, 3, 6, 7],
  [8, 9, 12, 13],
  [10, 11, 14, 15],
];
const DIAGONALS = [
  [0, 5, 10, 15],
  [3, 6, 9, 12],
];

describe("a board in blocks", () => {
  it("is read on a space whose units are its blocks, and its diagonals with X on", () => {
    const plain = spaceOf(boxing, dealt(false, 0, "a"));
    const lines = (sp: typeof plain) => sp.units.map((L) => [...sp.lineCells[L]]);
    // The blocks first, in the description's order, the diagonals after
    // the rows and columns.
    expect(lines(plain).length).toBe(12);
    expect(lines(plain).slice(0, 4)).toEqual(BLOCKS);
    const x = spaceOf(boxing, dealt(true, 0, "a"));
    expect(lines(x).length).toBe(14);
    expect(lines(x).slice(12)).toEqual(DIAGONALS);
  });

  it("deals an answer holding every number once in each unit and area", () => {
    for (const x of [false, true])
      for (const seed of ["a", "b", "c"]) {
        const b = dealt(x, 0, `${x}${seed}`);
        const g = solveBoard(boxing, b, 1).values;
        const units = [
          ...[0, 1, 2, 3].map((y) => [0, 1, 2, 3].map((i) => y * 4 + i)),
          ...[0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((y) => y * 4 + i)),
          ...BLOCKS,
          ...(x ? DIAGONALS : []),
        ];
        for (const u of units)
          expect(u.map((c) => g[c]).sort((p, q) => p - q)).toEqual([1, 2, 3, 4]);
        for (const cs of b.dealt.area.cells)
          expect(new Set(cs.map((c) => g[c])).size).toBe(cs.length);
      }
  });

  it("strikes a placed number from its row, column, block and area, and diagonal with X on", () => {
    for (const x of [false, true]) {
      const b0 = game.newState(params(x), game.newDesc(params(x), randomNew("m")).desc);
      // Every square open, so the placement is the one thing ruling out.
      const open = { ...b0, values: new Uint8Array(16), fixed: new Uint8Array(16) };
      const all = game.markAll?.(open);
      if (all === null || all === undefined) throw new Error("no mark-all");
      const b1 = game.executeMove(open, all);
      const b2 = game.executeMove(b1, {
        type: "set",
        x: 0,
        y: 0,
        n: 1,
        pencil: false,
        autoElim: true,
      });
      const lost = [...Array(16).keys()].filter(
        (c) => c !== 0 && ((b2.pencil?.[c] ?? 0) & 0b10) === 0,
      );
      const area = b0.dealt.area.cells[b0.dealt.area.of[0]];
      const reach = new Set([1, 2, 3, 4, 8, 12, 5, ...area, ...(x ? [10, 15] : [])]);
      reach.delete(0);
      expect(lost).toEqual([...reach].sort((p, q) => p - q));
    }
  });
});

describe("the walk of a board's notes over its units", () => {
  it("finishes a board of either variation, under either reading", () => {
    const rungs = new Map<string, number>();
    let boards = 0;
    for (const x of [false, true])
      for (const reading of ["populate", "implicit"] as const)
        for (const seed of ["a", "b", "c", "d"]) {
          let b = dealt(x, 0, `${x}${seed}`);
          for (let k = 0; game.status(b) !== "solved"; k++) {
            if (k > 200) throw new Error("the walk runs on");
            const [step] = plan(b, reading);
            rungs.set(step.rung, (rungs.get(step.rung) ?? 0) + 1);
            b = game.executeMove(b, step.move);
          }
          boards++;
        }
    expect(boards).toBe(16);
    expect(rungs.get("hiddenSingle")).toBeGreaterThan(0);
  });

  it("names a single's block, diagonal or area, striped whole", () => {
    const named = new Map<string, number>();
    const marked = (s: Step) => s.highlights as CandidateFillHint | undefined;
    for (const x of [false, true])
      for (const reading of ["implicit", "populate"] as const)
        for (let i = 0; i < 40; i++)
          for (const s of plan(dealt(x, 0, `${x}${i}`), reading)) {
            const m = /^No other square in this (\w+) can be \d/.exec(
              s.explanation ?? "",
            );
            if (m === null) continue;
            named.set(m[1], (named.get(m[1]) ?? 0) + 1);
            // A pocket an area's growth closed may be short of four.
            if (m[1] !== "area") expect(marked(s)?.hatch?.length).toBe(4);
          }
    // Measured 2026-11-23 over 100 boards of each variation under each
    // reading: 247 singles named in a box, 53 in a row, 62 in a column, 37
    // in an area and 21 in a diagonal; this sample of 40 expects some 15
    // areas and 8 diagonals.
    expect(named.get("box")).toBeGreaterThan(0);
    expect(named.get("area")).toBeGreaterThan(0);
    expect(named.get("diagonal")).toBeGreaterThan(0);
  });

  it("says how far a placed number reaches, with the diagonals where X is on", () => {
    for (const [x, words] of [
      [false, "row, column, block or area"],
      [true, "row, column, block, diagonal or area"],
    ] as const) {
      const steps = plan(dealt(x, 0, "w"), "populate");
      const clean = steps.find((s) => s.rung === "clean");
      expect(clean?.explanation).toBe(
        `Now clear the easy ones: cross out any number already in its square's ${words}.`,
      );
      const dup = steps.find((s) => s.rung === "dup");
      expect(dup?.explanation).toMatch(
        new RegExp(`^The \\d just placed can't repeat in its ${words}`),
      );
    }
  });
});

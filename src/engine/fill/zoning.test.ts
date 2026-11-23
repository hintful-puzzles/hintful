/**
 * A partition dealt to drawn sizes before the answer, and the answer
 * searched under it, on the `zoning` fixture: areas each holding 1 to their
 * size, equal numbers never side by side, the givens written after the
 * walls as digits between letter runs.
 */

import { describe, expect, it } from "vitest";
import * as zoning from "../../generated/engine/testing/fixtures/zoning/zoning.compiled.ts";
import { Dsf } from "../board/dsf.ts";
import { DESC_OUT_OF_RANGE, validateDesc } from "../contract/desc-error.ts";
import type { HintStep } from "../contract/game.ts";
import { encodeRegionWalls } from "../game-id/wall-runs.ts";
import type { CandidateReading } from "../hint/candidate-hint.ts";
import { randomNew } from "../random/index.ts";
import { type FillBoard, solveBoard, spaceOf } from "./board.ts";
import { type CandidateFillHint, candidateFill } from "./candidates.ts";
import { fillGame } from "./game.ts";
import { encodeDesc } from "./game-id.ts";
import type { FillHint } from "./hint.ts";
import type { FillMove } from "./notes.ts";

const game = fillGame("zoning", zoning);
type Board = FillBoard<zoning.Dealt>;

const params = (w: number, h = w) => ({ w, h, diff: 0 });
const board = (w: number, h: number, desc: string): Board =>
  game.newState(params(w, h), desc);

// A 3x3 board in three rows of three, each holding 1 to 3, with no two equal
// side by side: six gaps inside the rows and six walls between them, then a
// 2 given at the middle.
const ROWS3 = "f5,d2d";

describe("an answer searched under a partition dealt first", () => {
  it("deals areas of the sizes drawn, each holding 1 to its size, one answer", () => {
    for (const [w, h] of [
      [4, 4],
      [5, 5],
      [6, 7],
    ])
      for (const seed of ["a", "b", "c"]) {
        const { desc, aux } = game.newDesc(params(w, h), randomNew(`${w}${h}${seed}`));
        const b = board(w, h, desc);
        const { area } = b.dealt;
        for (const cs of area.cells) expect(cs.length).toBeLessThanOrEqual(4);
        // Some areas reach a size the list draws; a pocket may end short.
        expect(Math.max(...area.cells.map((cs) => cs.length))).toBeGreaterThan(1);
        const got = solveBoard(zoning, b, 0);
        expect(got.verdict).toBe("solved");
        const g = got.values;
        for (const cs of area.cells)
          expect(cs.map((c) => g[c]).sort((a, c) => a - c)).toEqual(
            cs.map((_, i) => i + 1),
          );
        expect(aux).toBeTruthy();
        expect(encodeDesc(zoning.deal, spaceOf(zoning, b), b.dealt)).toBe(desc);
      }
  });

  it("tries a square's numbers in a random order, not 1 first", () => {
    // The search assumes in the area with the fewest open squares, at its
    // first: tried in order, that square would hold 1 wherever it could.
    let firsts = 0;
    let ones = 0;
    for (const seed of ["a", "b", "c", "d", "e", "f"]) {
      const b = board(5, 5, game.newDesc(params(5), randomNew(seed)).desc);
      const g = solveBoard(zoning, b, 0).values;
      for (const cs of b.dealt.area.cells)
        if (cs.length > 1) {
          firsts++;
          if (g[Math.min(...cs)] === 1) ones++;
        }
    }
    // Measured 2026-11-23: 0.31, and 0.67 with the values in order.
    expect(ones / firsts).toBeLessThan(0.5);
  });

  it("draws other areas, and another answer, from another seed", () => {
    const descs = new Set(
      ["p", "q", "r", "s"].map((s) => game.newDesc(params(5), randomNew(s)).desc),
    );
    expect(descs.size).toBe(4);
  });
});

describe("the ID", () => {
  it("reads the walls, then the givens after a comma, and writes them back", () => {
    const b = board(3, 3, ROWS3);
    expect(b.dealt.area.cells.map((cs) => cs.length)).toEqual([3, 3, 3]);
    expect(Array.from(b.dealt.given.at)).toEqual([4]);
    expect(b.values[4]).toBe(2);
    expect(encodeDesc(zoning.deal, spaceOf(zoning, b), b.dealt)).toBe(ROWS3);
  });

  it("refuses a given larger than its area", () => {
    expect(validateDesc(game, params(3), "f5,d4d")).toBe(DESC_OUT_OF_RANGE);
  });

  it("reads an area as large as a cell's values reach, and refuses one larger", () => {
    // An 8x4 and a 7x5 with no wall inside: one area of 32 squares, whose
    // 32 no cell holds, and one of 35. A 6x5's 30 reads.
    const open = (w: number, h: number) => {
      const joined = new Dsf(w * h);
      for (let c = 1; c < w * h; c++) joined.merge(0, c);
      return `${encodeRegionWalls(joined, w, h)},${"z".repeat(Math.floor((w * h) / 26))}${String.fromCharCode(96 + ((w * h) % 26))}`;
    };
    expect(validateDesc(game, params(8, 4), open(8, 4))).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(game, params(7, 5), open(7, 5))).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(game, params(6, 5), open(6, 5))).toBeNull();
  });
});

describe("a ruleset written as its bare letter", () => {
  const corners = { w: 5, h: 5, diff: 0, sizes: { mode: 1 } };

  it("is written after the size, the first ruleset as nothing, and read back", () => {
    expect(game.encodeParams(params(5), true)).toBe("5x5de");
    expect(game.encodeParams(corners, true)).toBe("5x5Dde");
    expect(game.encodeParams(corners, false)).toBe("5x5D");
    expect(game.decodeParams("5x5Dde")).toMatchObject(corners);
    expect(game.decodeParams("5x5").sizes?.["mode"] ?? 0).toBe(0);
  });

  it("is the Custom dialog's game mode, and the menu's board", () => {
    const mode = game.paramConfig?.find((c) => c.kw === "ruleset");
    expect(mode?.type === "choices" ? mode.choices : null).toEqual([
      "Sides",
      "Corners",
    ]);
    expect(game.menu?.boards.map((b) => game.encodeParams(b, false))).toContain("5x5D");
  });

  it("deals the ruleset's areas, equal numbers apart at a corner too", () => {
    for (const seed of ["a", "b", "c"]) {
      const { desc } = game.newDesc(corners, randomNew(seed));
      const b = game.newState(corners, desc);
      for (const cs of b.dealt.area.cells) expect(cs.length).toBeLessThanOrEqual(5);
      const g = solveBoard(zoning, b, 0).values;
      for (let c = 0; c < 25; c++)
        for (const d of [4, 6])
          if (c + d < 25 && Math.abs((c % 5) - ((c + d) % 5)) === 1)
            expect(g[c + d]).not.toBe(g[c]);
    }
  });
});

describe("the walk of a board's notes in areas", () => {
  type Step = HintStep<FillMove, FillHint>;
  const at = (mode: number, diff = 0) => ({ w: 3, h: 3, diff, sizes: { mode } });
  /** Three rows of three, nothing given. */
  const blank = (mode: number): Board => game.newState(at(mode), "f5,i");
  const dealt = (w: number, mode: number, diff: number, seed: string): Board => {
    const p = { w, h: w, diff, sizes: { mode } };
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

  it("finishes a board of either ruleset and tier, under either reading", () => {
    const rungs = new Map<string, number>();
    let boards = 0;
    for (const mode of [0, 1])
      for (const diff of [0, 1])
        for (const reading of ["populate", "implicit"] as const)
          for (const seed of ["a", "b"]) {
            let b = dealt(5, mode, diff, `${mode}${diff}${seed}`);
            for (let k = 0; game.status(b) !== "solved"; k++) {
              if (k > 200) throw new Error("the walk runs on");
              const [step] = plan(b, reading);
              rungs.set(step.rung, (rungs.get(step.rung) ?? 0) + 1);
              b = game.executeMove(b, step.move);
            }
            boards++;
          }
    expect(boards).toBe(16);
    // A Normal board needs the description's own starve, and an area's
    // single is read in its area.
    expect(rungs.get("starve")).toBeGreaterThan(0);
    expect(rungs.get("hiddenSingle")).toBeGreaterThan(0);
  });

  it("names a single's area, striped whole, and notes the starved area first", () => {
    const steps = [0, 1].flatMap((mode) =>
      ["a", "b", "c"].flatMap((seed) => plan(dealt(5, mode, 1, seed), "implicit")),
    );
    // A step of the walk of notes is marked by its highlights.
    const marked = (s?: Step) => s?.highlights as CandidateFillHint | undefined;
    const hidden = steps.find((s) => s.rung === "hiddenSingle");
    expect(hidden?.explanation).toMatch(/^No other square in this area can be \d/);
    expect(marked(hidden)?.hatch?.length).toBeGreaterThan(1);
    // Under the implicit reading a starve rests on the area's notes, written
    // first: its `reads` mark.
    const k = steps.findIndex((s) => s.rung === "starve");
    expect(k).toBeGreaterThan(0);
    expect(marked(steps[k])?.reads?.length).toBeGreaterThan(0);
    expect(steps[k - 1].rung).toBe("note");
  });

  it("strikes a placed number from its area and beside it, or touching it", () => {
    for (const [mode, struck] of [
      [0, [1, 3, 5, 7]],
      [1, [0, 1, 2, 3, 5, 6, 7, 8]],
    ] as const) {
      const b0 = blank(mode);
      const all = game.markAll?.(b0);
      if (all === null || all === undefined) throw new Error("no mark-all");
      // Each square's notes are its own area's numbers: 1 to 3.
      const b1 = game.executeMove(b0, all);
      expect(Array.from(b1.pencil ?? [])).toEqual(Array(9).fill(0b1110));
      const b2 = game.executeMove(b1, {
        type: "set",
        x: 1,
        y: 1,
        n: 1,
        pencil: false,
        autoElim: true,
      });
      const lost = [...Array(9).keys()].filter(
        (c) => c !== 4 && ((b2.pencil?.[c] ?? 0) & 0b10) === 0,
      );
      expect(lost).toEqual(struck);
    }
  });

  it("says how far a placed number reaches in the ruleset's words", () => {
    for (const [mode, near] of [
      [0, "beside"],
      [1, "touching"],
    ] as const) {
      const steps = plan(dealt(5, mode, 0, "w"), "populate");
      const clean = steps.find((s) => s.rung === "clean");
      expect(clean?.explanation).toBe(
        `Now clear the easy ones: cross out any number already in its square's area or in a square ${near} it.`,
      );
      const dup = steps.find((s) => s.rung === "dup");
      expect(dup?.explanation).toMatch(
        new RegExp(
          `^The \\d just placed can't repeat in its area or the squares ${near} it`,
        ),
      );
    }
  });

  it("is refused on a board in parts whose description words none of its steps", () => {
    const b = blank(0);
    expect(() =>
      candidateFill(
        { ...zoning, STEPS: undefined },
        () => 0,
        () => game.newUi(b),
      ),
    ).toThrow(/words the walk's steps/);
  });
});

describe("typing", () => {
  it("offers keys to the largest area drawn, and refuses a number past the cell's area", () => {
    const keys = game.requestKeys?.(params(5)) ?? [];
    expect(keys.filter((k) => /^[0-9]$/.test(k.label)).map((k) => k.label)).toEqual([
      "1",
      "2",
      "3",
      "4",
    ]);
    // Three rows of three, nothing given: the top left square holds 1 to 3.
    const b = board(3, 3, "f5,i");
    const ui = game.newUi(b);
    const ds = game.newDrawState(b, 32);
    ui.cursor = { x: 0, y: 0, visible: true };
    const nowhere = { x: -1, y: -1 };
    expect(game.interpretMove(b, ui, ds, nowhere, "4".charCodeAt(0))).toBeNull();
    expect(game.interpretMove(b, ui, ds, nowhere, "3".charCodeAt(0))).toMatchObject({
      type: "set",
      n: 3,
    });
  });

  it("offers keys to a board's own largest area, where it is larger than any drawn", () => {
    // A 3x3 with no wall inside it: one area of nine, from an ID dealt
    // elsewhere. Its keypad must type the 9 its area owes.
    const digits = (b?: Board) =>
      (game.requestKeys?.(params(3), b) ?? [])
        .map((k) => k.label)
        .filter((l) => /^[0-9]$/.test(l));
    expect(digits(board(3, 3, "l,i")).at(-1)).toBe("9");
    expect(digits(board(3, 3, "f5,i")).at(-1)).toBe("4");
    expect(digits().at(-1)).toBe("4");
  });
});

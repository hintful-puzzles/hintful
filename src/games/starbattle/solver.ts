/**
 * Star Battle's deductions: the ladder `starbattle.description.yaml` states,
 * compiled, on the engine's marks and runner (`engine/ladder-runtime.ts`),
 * with the reason each technique records for the hint, and the answer check
 * its rules compile to.
 *
 * {@link solveStarbattle} runs the ladder to a fixpoint, which is how the
 * generator grades a board and how Solve and the mistake check find the
 * answer. {@link starbattleWalk} walks the same firings one at a time, and the
 * hint narrates each (docs/descriptions.md § "The runtime a ladder runs on").
 *
 * Every technique only ever decides a cell the rules force, so a board the
 * ladder finishes has exactly one answer, and the order the techniques fire
 * in cannot change it.
 */

import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import { describedSpace, partition } from "../../engine/describe-runtime.ts";
import type { DifficultyVerdict } from "../../engine/difficulty.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  ladderWalk,
  runLadder,
  TIERS as SCALE,
  type Taken,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import type { StepBudget } from "../../engine/step-budget.ts";
import * as starbattle from "./starbattle.compiled.ts";
import {
  BLANK,
  CROSSED,
  DIFF_TRICKY,
  STAR,
  type StarbattleMark,
  touching,
} from "./state.ts";

/** A row, a column or a region: each holds the board's number of stars. */
export interface Unit {
  kind: "row" | "column" | "region";
  /** Which row, column or region, from 0. */
  index: number;
  cells: readonly number[];
}

/** Why a firing decides its cells. A unit is named by its place in
 * {@link StarbattleBoard.units}. `need` is how many more stars the units
 * named wanted before the firing. */
export type StarbattleReason =
  /** A star: nothing touching it holds another. */
  | { kind: "around"; star: number }
  /** A unit that has its stars: the rest of it holds none. */
  | { kind: "full"; unit: number }
  /** A unit with exactly as many open cells as it needs stars. */
  | { kind: "exact"; unit: number; need: number }
  /** A row or column counted against the regions in it: see
   * {@link Confinement}. */
  | ({ kind: "confined" } & Confinement)
  /** A unit that has room for only `room` of its `need` stars unless the
   * cell holds one. */
  | { kind: "needed"; unit: number; need: number; room: number }
  /** A star in the cell would rule out the cells touching it. */
  | ({ kind: "crowded" } & Trial)
  /** The same, where the star would also complete a row, column or region
   * of its own and so rule out the rest of that. */
  | ({ kind: "starved" } & Trial)
  /** Several neighboring rows or columns counted against the regions in
   * them. */
  | ({ kind: "banded" } & Confinement);

/**
 * What a star tried in a cell would do to `unit`: rule out its open cells
 * `ruled`, and leave it `left` others with room for only `room` of the `need`
 * stars it would still want.
 */
export interface Trial {
  unit: number;
  need: number;
  room: number;
  ruled: number[];
  left: number;
  /** The units of the cell's own that the star would complete and that hold
   * some of `ruled`. None on a trial that only touches. */
  completes: number[];
}

/**
 * Lines (neighboring rows, or neighboring columns) and regions that need the
 * same number of stars between them, `need`.
 *
 * `rest: "lines"`: every open cell of the regions is in the lines, so the
 * regions' stars are all the lines have room for, and the lines' other cells
 * hold none. `rest: "regions"`: every open cell of the lines is in the
 * regions, so the lines take all the regions' stars, and the regions' cells
 * outside the lines hold none.
 */
export interface Confinement {
  lines: number[];
  regions: number[];
  need: number;
  rest: "lines" | "regions";
}

/** One deduction: `cells` all take `mark`. */
export interface StarbattleFiring {
  reason: StarbattleReason;
  cells: number[];
  mark: typeof STAR | typeof CROSSED;
}

/** The rungs a hint step can be, easiest first: the reasons' kinds. */
export const STARBATTLE_RUNGS = [
  "around",
  "full",
  "exact",
  "confined",
  "needed",
  "crowded",
  "starved",
  "banded",
] as const satisfies readonly StarbattleReason["kind"][];
export type StarbattleRung = (typeof STARBATTLE_RUNGS)[number];

/** The rows, then the columns, then the regions of a board. */
function unitsOf(size: number, regions: Int32Array): Unit[] {
  const lines = (kind: "row" | "column"): Unit[] =>
    Array.from({ length: size }, (_, index) => ({
      kind,
      index,
      cells: Array.from({ length: size }, (_, j) =>
        kind === "row" ? index * size + j : j * size + index,
      ),
    }));
  return [
    ...lines("row"),
    ...lines("column"),
    ...areasOf(size, regions).map(
      (cells, index): Unit => ({ kind: "region", index, cells }),
    ),
  ];
}

/** Each region's cells, in reading order. */
function areasOf(size: number, regions: Int32Array): number[][] {
  const areas: number[][] = Array.from({ length: size }, () => []);
  regions.forEach((r, i) => {
    areas[r].push(i);
  });
  return areas;
}

const TOUCHING = new Map<number, readonly (readonly number[])[]>();

/** For each cell of a grid `size` wide, the cells touching it. */
function touchingCells(size: number): readonly (readonly number[])[] {
  let cells = TOUCHING.get(size);
  if (!cells) {
    cells = Array.from({ length: size * size }, (_, i) => touching(size, i));
    TOUCHING.set(size, cells);
  }
  return cells;
}

/** The board the ladder works on: the regions, and a grid it writes as it
 * goes. */
export class StarbattleBoard {
  readonly units: readonly Unit[];
  private readonly around: readonly (readonly number[])[];
  private readonly at: readonly (readonly [number, number, number])[];

  constructor(
    readonly size: number,
    readonly stars: number,
    readonly regions: Int32Array,
    readonly grid: Uint8Array,
  ) {
    this.units = unitsOf(size, regions);
    this.around = touchingCells(size);
    this.at = Array.from(regions, (r, i) => [
      (i / size) | 0,
      size + (i % size),
      2 * size + r,
    ]);
  }

  /** The row, the column and the region of cell `i`, as places in
   * {@link units}. */
  unitsAt(i: number): readonly [number, number, number] {
    return this.at[i];
  }

  /** The cells that share a side or a corner with cell `i`. */
  touching(i: number): readonly number[] {
    return this.around[i];
  }

  /** The undecided cells of a unit. */
  open(unit: number): number[] {
    return this.units[unit].cells.filter((i) => this.grid[i] === BLANK);
  }

  /** How many more stars a unit needs. */
  need(unit: number): number {
    let held = 0;
    for (const i of this.units[unit].cells) if (this.grid[i] === STAR) held++;
    return this.stars - held;
  }

  /** Whether a cell is still undecided. */
  unfinished(): boolean {
    return this.grid.includes(BLANK);
  }
}

/** Two stars that touch, as a pair of cells, the earlier first. */
export function touchingStars(size: number, grid: Uint8Array): [number, number][] {
  const out: [number, number][] = [];
  grid.forEach((m, i) => {
    if (m !== STAR) return;
    for (const j of touching(size, i)) if (j > i && grid[j] === STAR) out.push([i, j]);
  });
  return out;
}

/** The board's regions and stars as the description reads them. */
function dealtOf(board: StarbattleBoard): starbattle.Dealt {
  return {
    region: partition(areasOf(board.size, board.regions), board.grid.length),
    stars: board.stars,
  };
}

/** Whether every row, column and region holds its stars and no two stars
 * touch, by the rules the description compiles to. A blank cell counts as
 * empty, so a player need cross nothing out to finish. */
export function isComplete(board: StarbattleBoard): boolean {
  return starbattle.isAnswer(
    board.grid.map((m) => (m === STAR ? STAR : CROSSED)),
    describedSpace(starbattle.units, board.size, board.size),
    dealtOf(board),
  );
}

/** The ladder over `board`, whose grid the marks are kept on. */
function starbattleLadder(board: StarbattleBoard): Ladder {
  const dealt = dealtOf(board);
  const { size } = board;
  const region = (r: number): number => 2 * size + r;
  const band = (k: number, dir: number, a: number): number[] =>
    Array.from({ length: k }, (_, j) => dir * size + a + j);
  const confined =
    (kind: "confined" | "banded") =>
    ({
      k,
      dir,
      a,
      n,
      I,
      R,
      lines,
    }: {
      k?: number;
      dir: number;
      a: number;
      n: number;
      I: readonly number[];
      R: readonly number[];
      lines: boolean;
    }): StarbattleReason => ({
      kind,
      lines: band(k ?? 1, dir, a),
      regions: (lines ? I : R).map(region),
      need: n,
      rest: lines ? "lines" : "regions",
    });
  const trial =
    (kind: "crowded" | "starved") =>
    (
      x: number,
      unit: number,
      n: number,
      room: number,
      Q: readonly number[],
      E: readonly number[],
    ): StarbattleReason => ({
      kind,
      unit,
      need: n,
      room,
      ruled: [...Q],
      left: E.length,
      completes:
        kind === "starved"
          ? board
              .unitsAt(x)
              .filter(
                (mine) =>
                  board.need(mine) === 1 &&
                  Q.some((i) => board.unitsAt(i).includes(mine)),
              )
          : [],
    });
  const crowded = trial("crowded");
  const starved = trial("starved");
  return describedLadder(starbattle, {
    around: uncluedRung(starbattle.around, ({ c }) => ({ kind: "around", star: c })),
    fullLine: compiledRung(starbattle.fullLine, dealt, ({ L }) => ({
      kind: "full",
      unit: L,
    })),
    fullRegion: compiledRung(starbattle.fullRegion, dealt, ({ r }) => ({
      kind: "full",
      unit: region(r),
    })),
    exactLine: compiledRung(starbattle.exactLine, dealt, ({ L, n }) => ({
      kind: "exact",
      unit: L,
      need: n,
    })),
    exactRegion: compiledRung(starbattle.exactRegion, dealt, ({ r, n }) => ({
      kind: "exact",
      unit: region(r),
      need: n,
    })),
    confined: compiledRung(starbattle.confined, dealt, confined("confined")),
    neededLine: compiledRung(starbattle.neededLine, dealt, ({ L, n, room }) => ({
      kind: "needed",
      unit: L,
      need: n,
      room,
    })),
    neededRegion: compiledRung(starbattle.neededRegion, dealt, ({ r, n, room }) => ({
      kind: "needed",
      unit: region(r),
      need: n,
      room,
    })),
    crowdedLine: compiledRung(
      starbattle.crowdedLine,
      dealt,
      ({ x, L, n, room, Q, E }) => crowded(x, L, n, room, Q, E),
    ),
    crowdedRegion: compiledRung(
      starbattle.crowdedRegion,
      dealt,
      ({ x, g, n, room, Q, E }) => crowded(x, region(g), n, room, Q, E),
    ),
    banded: compiledRung(starbattle.banded, dealt, confined("banded")),
    starvedLine: compiledRung(
      starbattle.starvedLine,
      dealt,
      ({ x, L, n, room, Q, E }) => starved(x, L, n, room, Q, E),
    ),
    starvedRegion: compiledRung(
      starbattle.starvedRegion,
      dealt,
      ({ x, g, n, room, Q, E }) => starved(x, region(g), n, room, Q, E),
    ),
  });
}

/** The values a square may hold: a star, or none. */
const DOMAIN = (1 << STAR) | (1 << CROSSED);

/** The marks the ladder reads, on the board's own grid. */
function marksOf(board: StarbattleBoard): CellMarks {
  const m = new CellMarks(
    describedSpace(starbattle.units, board.size, board.size),
    DOMAIN,
    board.grid,
  );
  m.seed(board.grid);
  return m;
}

/** The hardest tier there is. */
const TOP_TIER = DIFF_TRICKY;

/**
 * Solve in place with the ladder capped at tier `cap`, and say how it ended.
 * `firings` takes a count of each technique's firings, for a census.
 */
export function solveStarbattle(
  board: StarbattleBoard,
  cap: number,
  firings?: FiringTally,
): DifficultyVerdict {
  const m = marksOf(board);
  const { entries } = starbattleLadder(board);
  const impossible = runLadder(m, ladderTechniques(m, entries, { [SCALE]: cap }, {}), {
    firings,
  });
  if (impossible) return "impossible";
  if (board.unfinished()) return "unsolved";
  return isComplete(board) ? "solved" : "impossible";
}

/** The answer to a board's regions, or `null` where the ladder does not
 * reach one. */
export function answerOf(
  size: number,
  stars: number,
  regions: Int32Array,
): readonly StarbattleMark[] | null {
  const board = new StarbattleBoard(size, stars, regions, new Uint8Array(size * size));
  if (solveStarbattle(board, TOP_TIER) !== "solved") return null;
  return Array.from(board.grid, (m) => m as StarbattleMark);
}

/**
 * The cells a firing's premise reads, which a hint plan continues from: the
 * star it crosses round, or the rows, columns and regions it counts, and the
 * cells a trial star would rule out.
 */
function readsOf(b: StarbattleBoard, reason: StarbattleReason): number[] {
  const cellsOf = (units: readonly number[]): number[] =>
    units.flatMap((u) => b.units[u].cells);
  switch (reason.kind) {
    case "around":
      return [reason.star, ...b.touching(reason.star)];
    case "full":
    case "exact":
    case "needed":
      return cellsOf([reason.unit]);
    case "confined":
    case "banded":
      return cellsOf([...reason.lines, ...reason.regions]);
    case "crowded":
    case "starved":
      return [...reason.ruled, ...cellsOf([reason.unit, ...reason.completes])];
  }
}

/** The ladder one firing at a time, writing `board` as it goes, each the one
 * that carries on from the cells the last decided (`ladderWalk`): `next`
 * gives the firing just made, or `null` when none is left. */
export function starbattleWalk(
  board: StarbattleBoard,
  budget: StepBudget,
): { next(): StarbattleFiring | null; impossible(): boolean } {
  const m = marksOf(board);
  m.budget = budget;
  const { entries } = starbattleLadder(board);
  const walk = ladderWalk(m, entries, { [SCALE]: TOP_TIER }, ({ reasons }: Taken) =>
    readsOf(board, reasons[0] as StarbattleReason),
  );
  let impossible = false;
  return {
    next() {
      const f = walk.next();
      if (f === "contradiction") impossible = true;
      if (f === null || f === "contradiction") return null;
      const cells: number[] = [];
      for (let i = 0; i < f.facts.length; i += 3) cells.push(f.facts[i + 1] as number);
      return {
        reason: f.reasons[0] as StarbattleReason,
        cells,
        mark: f.facts[2] as typeof STAR | typeof CROSSED,
      };
    },
    impossible: () => impossible,
  };
}

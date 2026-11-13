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
  type LadderEntry,
  ladderTechniques,
  runLadder,
  TIERS as SCALE,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
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

/** The kinds of step a hint can be, which the description's `says` names: the
 * techniques' ids, and the arms of the two that count lines against regions. */
export const STARBATTLE_RUNGS = starbattle.SAYS_KINDS;
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

/** The ladder over the board `dealt` deals. */
function starbattleLadder(dealt: starbattle.Dealt): Ladder {
  return describedLadder(starbattle, {
    around: uncluedRung(starbattle.around),
    fullLine: compiledRung(starbattle.fullLine, dealt),
    fullRegion: compiledRung(starbattle.fullRegion, dealt),
    exactLine: compiledRung(starbattle.exactLine, dealt),
    exactRegion: compiledRung(starbattle.exactRegion, dealt),
    confined: compiledRung(starbattle.confined, dealt),
    neededLine: compiledRung(starbattle.neededLine, dealt),
    neededRegion: compiledRung(starbattle.neededRegion, dealt),
    crowdedLine: compiledRung(starbattle.crowdedLine, dealt),
    crowdedRegion: compiledRung(starbattle.crowdedRegion, dealt),
    banded: compiledRung(starbattle.banded, dealt),
    starvedLine: compiledRung(starbattle.starvedLine, dealt),
    starvedRegion: compiledRung(starbattle.starvedRegion, dealt),
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
  const { entries } = starbattleLadder(dealtOf(board));
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
 * What a hint walks from the player's marks: the marks over their grid, and
 * the ladder's techniques (every tier: a board that arrives by its ID carries
 * no tier, and the ladder tries its easier techniques first, which is the order
 * a hint wants anyway). A firing is taken one at a time, the one that carries
 * on from the squares the last decided (`ladderWalk`).
 */
export function hintWalk(state: {
  size: number;
  stars: number;
  regions: Int32Array;
  grid: Uint8Array;
}): { marks: CellMarks; entries: readonly LadderEntry[] } {
  const board = new StarbattleBoard(
    state.size,
    state.stars,
    state.regions,
    state.grid.slice(),
  );
  return { marks: marksOf(board), entries: starbattleLadder(dealtOf(board)).entries };
}

/**
 * Star Battle's deductions: one ladder, run two ways.
 *
 * {@link solveStarbattle} runs it to a fixpoint, which is how the generator
 * grades a board and how Solve and the mistake check find the answer.
 * {@link starbattleRecordingPass} runs the same rungs one firing at a time, and
 * the hint narrates each (docs/solver-and-generator.md § "One engine,
 * two projections").
 *
 * Every rung only ever decides a cell the rules force, so a board the ladder
 * finishes has exactly one answer, and the order the rungs fire in cannot
 * change it.
 */

import {
  type DeductionTechnique,
  type FiringTally,
  runDeductionFixpoint,
  type SingleFirings,
  singleFirings,
} from "../../engine/deduction-fixpoint.ts";
import type { DifficultyVerdict } from "../../engine/difficulty.ts";
import type { StepBudget } from "../../engine/step-budget.ts";
import {
  BLANK,
  CROSSED,
  DIFF_EASY,
  DIFF_NORMAL,
  DIFF_TRICKY,
  STAR,
  type StarbattleMark,
  touches,
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

/** The rungs, easiest first, by the `kind` of the reason a firing carries. */
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
  const areas: number[][] = Array.from({ length: size }, () => []);
  regions.forEach((r, i) => {
    areas[r].push(i);
  });
  return [
    ...lines("row"),
    ...lines("column"),
    ...areas.map((cells, index): Unit => ({ kind: "region", index, cells })),
  ];
}

const TOUCHING = new Map<number, readonly (readonly number[])[]>();

/** For each cell of a grid `size` wide, the cells touching it. A solve asks
 * this of every cell many times over, and it depends on nothing else. */
function touchingCells(size: number): readonly (readonly number[])[] {
  let cells = TOUCHING.get(size);
  if (!cells) {
    cells = Array.from({ length: size * size }, (_, i) => touching(size, i));
    TOUCHING.set(size, cells);
  }
  return cells;
}

/**
 * The most stars, up to `want`, that `cells` can hold with no two touching.
 * `cells` are open, and none touches a star already placed.
 */
function roomFor(size: number, cells: readonly number[], want: number): number {
  const placed: number[] = [];
  const fits = (from: number, more: number): boolean => {
    if (more === 0) return true;
    for (let i = from; i <= cells.length - more; i++) {
      if (placed.some((c) => touches(size, c, cells[i]))) continue;
      placed.push(cells[i]);
      const ok = fits(i + 1, more - 1);
      placed.pop();
      if (ok) return true;
    }
    return false;
  };
  for (let n = want; n > 0; n--) if (fits(0, n)) return n;
  return 0;
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

/** Whether every row, column and region holds its stars and no two stars
 * touch. A blank cell counts as empty, so a player need cross nothing out to
 * finish. */
export function isComplete(board: StarbattleBoard): boolean {
  return (
    board.units.every((_, u) => board.need(u) === 0) &&
    touchingStars(board.size, board.grid).length === 0
  );
}

type Found = StarbattleFiring | null;

/** The first star with an open cell touching it. */
function findAround(b: StarbattleBoard): Found {
  for (let star = 0; star < b.grid.length; star++) {
    if (b.grid[star] !== STAR) continue;
    const cells = touching(b.size, star).filter((i) => b.grid[i] === BLANK);
    if (cells.length > 0)
      return { reason: { kind: "around", star }, cells, mark: CROSSED };
  }
  return null;
}

/** The first unit that has its stars and still has open cells. */
function findFull(b: StarbattleBoard): Found {
  for (let unit = 0; unit < b.units.length; unit++) {
    if (b.need(unit) !== 0) continue;
    const cells = b.open(unit);
    if (cells.length > 0)
      return { reason: { kind: "full", unit }, cells, mark: CROSSED };
  }
  return null;
}

/** The first unit that needs every open cell it has, or `"contradiction"`
 * when a unit has too many stars or too few open cells. */
function findExact(b: StarbattleBoard): Found | "contradiction" {
  for (let unit = 0; unit < b.units.length; unit++) {
    const need = b.need(unit);
    const cells = b.open(unit);
    if (need < 0 || need > cells.length) return "contradiction";
    if (need > 0 && need === cells.length)
      return { reason: { kind: "exact", unit, need }, cells, mark: STAR };
  }
  return null;
}

/**
 * The first run of `count` neighboring rows, or columns, whose need for stars
 * equals that of the regions lying wholly inside the run, or of the regions
 * reaching into it, and which leaves cells to cross out.
 */
function findConfinement(
  b: StarbattleBoard,
  count: number,
): (Confinement & { cells: number[] }) | null | "contradiction" {
  const { size } = b;
  const regionUnits = Array.from({ length: size }, (_, r) => 2 * size + r);
  const wanting = regionUnits
    .map((unit) => ({ unit, need: b.need(unit), open: b.open(unit) }))
    .filter((r) => r.need > 0);

  for (const base of [0, size]) {
    for (let first = 0; first + count <= size; first++) {
      const lines = Array.from({ length: count }, (_, j) => base + first + j);
      const need = lines.reduce((sum, line) => sum + b.need(line), 0);
      if (need === 0) continue;
      const within = (i: number): boolean => {
        const at = base === 0 ? (i / size) | 0 : i % size;
        return at >= first && at < first + count;
      };

      const inside = wanting.filter((r) => r.open.every(within));
      const insideNeed = inside.reduce((sum, r) => sum + r.need, 0);
      if (insideNeed > need) return "contradiction";
      if (insideNeed === need) {
        const held = new Set(inside.flatMap((r) => r.open));
        const cells = lines.flatMap((line) => b.open(line)).filter((i) => !held.has(i));
        if (cells.length > 0)
          return {
            lines,
            regions: inside.map((r) => r.unit),
            need,
            rest: "lines",
            cells,
          };
      }

      const reaching = wanting.filter((r) => r.open.some(within));
      const reachingNeed = reaching.reduce((sum, r) => sum + r.need, 0);
      if (reachingNeed < need) return "contradiction";
      if (reachingNeed === need) {
        const cells = reaching.flatMap((r) => r.open.filter((i) => !within(i)));
        if (cells.length > 0)
          return {
            lines,
            regions: reaching.map((r) => r.unit),
            need,
            rest: "regions",
            cells: cells.sort((a, c) => a - c),
          };
      }
    }
  }
  return null;
}

/** The first cell a unit cannot do without: leaving it empty leaves the unit
 * room for fewer stars than it needs. */
function findNeeded(b: StarbattleBoard): Found {
  for (let unit = 0; unit < b.units.length; unit++) {
    const need = b.need(unit);
    if (need === 0) continue;
    const open = b.open(unit);
    for (const cell of open) {
      const room = roomFor(
        b.size,
        open.filter((i) => i !== cell),
        need,
      );
      if (room < need)
        return {
          reason: { kind: "needed", unit, need, room },
          cells: [cell],
          mark: STAR,
        };
    }
  }
  return null;
}

/** The first cell where a star would leave some unit too little room: the
 * star rules out every open cell touching it, and the rest of any unit of
 * its own that it completes. */
function findStarved(b: StarbattleBoard, kind: "crowded" | "starved", from = 0): Found {
  const { size, grid } = b;
  const open = b.units.map((_, unit) => b.open(unit));
  const needs = b.units.map((_, unit) => b.need(unit));
  // The cells a star would rule out, as the cell it was last tried for, and
  // how many of them each unit holds.
  const ruledFor = new Int32Array(grid.length).fill(-1);
  const ruledIn = new Int32Array(b.units.length);
  for (let cell = from; cell < grid.length; cell++) {
    if (grid[cell] !== BLANK) continue;
    const own = b.unitsAt(cell);
    ruledIn.fill(0);
    const rule = (i: number): void => {
      if (i === cell || ruledFor[i] === cell) return;
      ruledFor[i] = cell;
      for (const unit of b.unitsAt(i)) ruledIn[unit]++;
    };
    for (const i of b.touching(cell)) if (grid[i] === BLANK) rule(i);
    if (kind === "starved")
      for (const unit of own) if (needs[unit] === 1) open[unit].forEach(rule);

    for (let unit = 0; unit < b.units.length; unit++) {
      const mine = own.includes(unit);
      if (!mine && ruledIn[unit] === 0) continue;
      const need = needs[unit] - (mine ? 1 : 0);
      if (need <= 0) continue;
      // One star fits wherever a cell is left, so only a unit that needs
      // more has its cells looked at.
      const count = open[unit].length - ruledIn[unit] - (mine ? 1 : 0);
      if (count >= need && need === 1) continue;
      const left = open[unit].filter((i) => i !== cell && ruledFor[i] !== cell);
      const room = roomFor(size, left, need);
      if (room < need)
        return {
          reason: {
            kind,
            unit,
            need,
            room,
            ruled: open[unit].filter((i) => ruledFor[i] === cell),
            left: left.length,
            completes:
              kind === "starved"
                ? own.filter(
                    (mine) =>
                      needs[mine] === 1 &&
                      open[unit].some(
                        (i) => ruledFor[i] === cell && b.unitsAt(i).includes(mine),
                      ),
                  )
                : [],
          },
          cells: [cell],
          mark: CROSSED,
        };
    }
  }
  return null;
}

/** The ladder over `board`. A rung that fires writes its cells, and hands
 * the firing to `record` where there is one. */
function ladder(
  board: StarbattleBoard,
  record?: (firing: StarbattleFiring) => void,
): DeductionTechnique[] {
  const apply = (firing: StarbattleFiring): number => {
    for (const i of firing.cells) board.grid[i] = firing.mark;
    record?.(firing);
    return 1;
  };
  // A solve with no one listening runs a rung until it finds nothing more
  // before going back to the easier ones, where the hint takes one firing.
  const rung = (
    id: StarbattleRung,
    tier: number,
    find: () => Found | "contradiction",
  ): DeductionTechnique => ({
    id,
    tier,
    run: () => {
      for (let fired = 0; ; ) {
        const found = find();
        if (found === "contradiction") return -1;
        if (!found) return fired;
        fired += apply(found);
        if (record) return fired;
      }
    },
  });
  const confinement = (
    kind: "confined" | "banded",
    counts: readonly number[],
  ): Found | "contradiction" => {
    for (const count of counts) {
      const found = findConfinement(board, count);
      if (found === "contradiction") return found;
      if (found) {
        const { cells, ...confinement } = found;
        return { reason: { kind, ...confinement }, cells, mark: CROSSED };
      }
    }
    return null;
  };
  // Every run of more than one line and fewer than all of them, shortest
  // first.
  const bands = Array.from({ length: Math.max(0, board.size - 2) }, (_, j) => j + 2);
  // The same, going on from the cell it last crossed out: a trial star is
  // the costly rung, and what it found before a cell still holds.
  const starving = (kind: "crowded" | "starved"): DeductionTechnique => ({
    id: kind,
    tier: TIERS[kind],
    run: () => {
      let fired = 0;
      for (let found = findStarved(board, kind); found; ) {
        fired += apply(found);
        if (record) break;
        found = findStarved(board, kind, found.cells[0] + 1);
      }
      return fired;
    },
  });
  return [
    rung("around", TIERS.around, () => findAround(board)),
    rung("full", TIERS.full, () => findFull(board)),
    rung("exact", TIERS.exact, () => findExact(board)),
    rung("confined", TIERS.confined, () => confinement("confined", [1])),
    rung("needed", TIERS.needed, () => findNeeded(board)),
    starving("crowded"),
    rung("banded", TIERS.banded, () => confinement("banded", bands)),
    starving("starved"),
  ];
}

/** The tier each rung belongs to: the easiest a board that needs it is. */
const TIERS: Record<StarbattleRung, number> = {
  around: DIFF_EASY,
  full: DIFF_EASY,
  exact: DIFF_EASY,
  confined: DIFF_EASY,
  needed: DIFF_EASY,
  crowded: DIFF_EASY,
  banded: DIFF_NORMAL,
  starved: DIFF_TRICKY,
};

/** The hardest tier there is. */
const TOP_TIER = DIFF_TRICKY;

/**
 * Solve in place with the ladder capped at tier `cap`, and say how it ended.
 * `firings` takes a count of each rung's firings, for a census.
 */
export function solveStarbattle(
  board: StarbattleBoard,
  cap: number,
  firings?: FiringTally,
): DifficultyVerdict {
  const { impossible } = runDeductionFixpoint({
    techniques: ladder(board),
    maxTier: cap,
    firings,
    settled: () => !board.unfinished(),
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

/** The ladder one firing at a time, writing `board` as it goes: `next` gives
 * the firing just made, or `null` when no rung fires. */
export function starbattleRecordingPass(
  board: StarbattleBoard,
  budget: StepBudget,
): { next(): StarbattleFiring | null; impossible(): boolean } {
  let last: StarbattleFiring | null = null;
  const pass: SingleFirings = singleFirings({
    techniques: ladder(board, (firing) => {
      last = firing;
    }),
    budget,
    settled: () => !board.unfinished(),
  });
  return {
    next: () => (pass.next() ? last : null),
    impossible: () => pass.impossible(),
  };
}

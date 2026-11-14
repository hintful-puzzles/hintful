/**
 * The regions and singles a candidate plan reads, and the reasons a row/column
 * Latin game's singles narrate as. A single is read off the notes the walk
 * shows (`candidate-plan.ts`): a **naked** one, a cell's own notes down to one
 * value, shades the cell alone; a **hidden** one, a value with one home left in
 * a region, names and shades the whole region.
 */

import type { CandidateReading } from "./candidate-hint.ts";
import type { ConfinedLines, LatinWingReason } from "./latin.ts";
import type { Point } from "./types.ts";

/** A region a value may not repeat in: its member cell indices (`y * w + x`),
 * and whether it also holds every value once. A game declares each of a cell's
 * regions once, in narration preference order, and every consumer derives its
 * own list from that: the notes culls read all of them, and the hidden singles
 * only the ones that hold every value, since a value with one home left in a
 * region is forced there only if the region must hold it (a Killer cage need
 * not). A region with neither property (a Keen cage) is not declared, because
 * nothing reads it. A game tags each region with whatever it needs to name it
 * (a `line`/`index` for a row/column, a `kind` for a sub-block or diagonal)
 * and reads that tag back off the single's `region`. */
export interface CellRegion {
  cells: ArrayLike<number>;
  holdsEvery: boolean;
}

/** The declared regions of `R` a hidden single is read in. For a union that
 * tags only its whole regions for naming, this is the tagged arm. */
export type WholeRegion<R extends CellRegion> = R & { holdsEvery: true };

/** A row/column region tagged for narration: the cells of the line plus whether it
 * is a `row` (`index` = its y) or `col` (`index` = its x). */
export interface RowColRegion {
  cells: number[];
  holdsEvery: true;
  line: "row" | "col";
  index: number;
}

/** The two regions of cell `(x, y)` in a plain Latin square: its row and its
 * column, in narration-preference order (row first), each holding every value.
 * A Keen cage is an arithmetic constraint a value may repeat in, so it is not a
 * region at all. */
export function rowColRegions(x: number, y: number, w: number): RowColRegion[] {
  const row: number[] = [];
  const col: number[] = [];
  for (let k = 0; k < w; k++) {
    row.push(y * w + k);
    col.push(k * w + x);
  }
  return [
    { cells: row, holdsEvery: true, line: "row", index: y },
    { cells: col, holdsEvery: true, line: "col", index: x },
  ];
}

/** The reason a forced single placement carries — shared across the Latin family
 * (every game's `HintReason` union includes these two `kind`s: `single` from the
 * generic `LatinReason`, plus the game-local `hiddenSingle`). */
export type SingleReason =
  | { kind: "single" }
  | { kind: "regionsFull" }
  | { kind: "hiddenSingle"; n: number; line: "row" | "col"; index: number };

/** The {@link SingleReason}s a row/column plan walking `Reading` narrates
 * ({@link SingleWhyUnder}). */
export type SingleReasonUnder<Reading extends CandidateReading> =
  "implicit" extends Reading
    ? SingleReason
    : Exclude<SingleReason, { kind: "regionsFull" }>;

/** Why a single the plan can see is forced, before a game names it:
 * - `naked`: the cell's own notes are down to one;
 * - `regionsFull`: the cell has no notes, and its regions already hold every
 *   other value, which is how a cell reads under the implicit candidate
 *   reading (`candidate-plan.ts`'s `reading`);
 * - `hidden`: the value has one home left in `region`. */
export type SingleWhy<R> =
  | { kind: "naked" }
  | { kind: "regionsFull" }
  | { kind: "hidden"; region: R };

/** The {@link SingleWhy}s a plan walking `Reading` hands its game. A plan on
 * the populate reading alone reads every single off notes, so it is never
 * handed `regionsFull`. */
export type SingleWhyUnder<
  R,
  Reading extends CandidateReading,
> = "implicit" extends Reading
  ? SingleWhy<R>
  : Exclude<SingleWhy<R>, { kind: "regionsFull" }>;

/** The {@link SingleReason} a row/column single of `n` narrates as. */
export function singleReasonOf(n: number, why: SingleWhy<RowColRegion>): SingleReason {
  switch (why.kind) {
    case "naked":
      return { kind: "single" };
    case "regionsFull":
      return { kind: "regionsFull" };
    case "hidden":
      return {
        kind: "hiddenSingle",
        n,
        line: why.region.line,
        index: why.region.index,
      };
  }
}

/** The cells of a hidden single's line — the whole row (`line: "row"`, `index` =
 * its y) or column (`line: "col"`, `index` = its x) — that its sentence stripes. */
export function hiddenSingleLine(
  line: "row" | "col",
  index: number,
  w: number,
): Point[] {
  const cells: Point[] = [];
  if (line === "row") for (let k = 0; k < w; k++) cells.push({ x: k, y: index });
  else for (let k = 0; k < w; k++) cells.push({ x: index, y: k });
  return cells;
}

/** The generic Latin reasons whose narration is shared verbatim by the *row/column*
 * games (Keen, Unequal): a {@link SingleReason} (naked or hidden single)
 * plus the generic `dup` / `set` eliminations from `LatinReason`. The
 * `dup` reason may carry extra fields (`px`/`py`) — only `n` is read here. */
export type GenericLatinReason =
  | SingleReason
  /** A single in a cell whose units, named, hold every other value. */
  | { kind: "regionsFull"; regions: readonly string[] }
  /** A value with one home left in a unit the game names, a block or a
   * diagonal as well as a line. */
  | { kind: "hiddenSingle"; n: number; unit: { name: string; cells: readonly Point[] } }
  | { kind: "dup"; n: number; px: number; py: number }
  | { kind: "set"; cells: readonly Point[]; lines?: ConfinedLines }
  | LatinWingReason;

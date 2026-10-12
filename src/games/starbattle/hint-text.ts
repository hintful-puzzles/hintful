/**
 * Every sentence Star Battle's hint speaks, and every word inside one.
 *
 * The deduction decides which sentence and with what values
 * ([`hint.ts`](./hint.ts)); this file decides only how it reads. Each sentence
 * says what to look at and then what must follow (docs/hints.md
 * § "Writing the narration"). Every word that points at the board is a
 * reference to the mark it points at (`engine/hint-words.ts`): the squares a
 * step decides are ringed, the row, column or region it is about is striped,
 * and what else it reasons from is outlined.
 *
 * A step that decides several squares shrinks as the player makes some of
 * them, and its words are narrowed with it, so every word that counts the
 * ringed squares is a reference that re-renders from them.
 */

import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
  whole,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** A row, a column or a region, as the squares it is made of. */
export interface UnitSquares {
  kind: "row" | "column" | "region";
  cells: readonly Point[];
}

/** Several units of one kind, as all their squares. */
export interface UnitSet {
  count: number;
  cells: readonly Point[];
}

const starWord = (n: number): string => (n === 1 ? "star" : "stars");

/** "2 stars", or "1 more star" once some are placed. */
const needs = (need: number, placed: number): string =>
  `${need}${placed > 0 ? " more" : ""} ${starWord(need)}`;

const these = (cells: readonly Point[]): Narration =>
  mark.this("ring", CELL, cells, "square");

const mustBeEmpty = (cells: readonly Point[]): Narration =>
  phrase`${these(cells)} must be empty`;

/** "it must be …", over the one ringed square a sentence has already named. */
const itMustBe = (cell: Point, what: string): Narration =>
  phrase`${mark.as("ring", CELL, [cell], "it")} must ${what}`;

/** "this row", striped. */
const thisUnit = (unit: UnitSquares): Narration =>
  mark.this("stripes", whole(CELL), unit.cells, unit.kind);

/** "this column" or "these 3 columns", striped. */
const theseLines = (kind: "row" | "column", lines: UnitSet): Narration =>
  lines.count === 1
    ? mark.this("stripes", whole(CELL), lines.cells, kind)
    : mark.as("stripes", CELL, lines.cells, `these ${lines.count} ${kind}s`);

/** "the outlined region" or "the 2 outlined regions". */
const theRegions = (regions: UnitSet): Narration =>
  regions.count === 1
    ? mark.the("outline", whole(CELL), regions.cells, "region")
    : mark.as("outline", CELL, regions.cells, `the ${regions.count} outlined regions`);

/** A cell tried with a star, and the unit that star would leave short. */
export interface Trial {
  cell: Point;
  unit: UnitSquares;
  /** Whether the unit is one of the cell's own, so that the star would be
   * one of its stars. */
  own: boolean;
  /** The stars the unit would still need, and how many it would have room
   * for. */
  need: number;
  room: number;
  /** The open squares of the unit the star would rule out. */
  ruled: readonly Point[];
  /** Whether those are every open square the unit has besides the cell. */
  all: boolean;
  /** Whether the star rules out only what it touches. */
  touches: boolean;
  /** The kinds of the cell's own units the star would complete, where that
   * is what rules the squares out. */
  completes: readonly UnitSquares["kind"][];
}

/**
 * A trial's sentence. A star that only touches says what it touches. One
 * that completes a row, column or region of its own names up to two of them
 * as the cause, and with all three says only that it rules squares out.
 */
function trial(t: Trial): Sentence {
  const here = these([t.cell]);
  const unit = thisUnit(t.unit);
  const move = itMustBe(t.cell, "be empty");
  const cause =
    t.completes.length === 1 || t.completes.length === 2
      ? `complete its ${t.completes.join(" and ")}`
      : null;
  const still = `${t.need} ${t.own ? "more " : ""}${starWord(t.need)}`;
  if (t.all) {
    if (cause)
      return so({
        look: phrase`A star on ${here} would ${cause}, leaving ${unit} no open square${t.own ? ` for ${still}` : ""}`,
        move,
      });
    const does = t.touches ? "touch" : "rule out";
    return so({
      look: t.own
        ? phrase`A star on ${here} would ${does} the rest of ${unit}, which would still need ${t.need} ${starWord(t.need)}`
        : phrase`A star on ${here} would ${does} every open square of ${unit}, leaving it no room for a star`,
      move,
    });
  }
  const left = `${t.room} ${t.own ? "more" : starWord(t.room)}, not ${t.need}`;
  const does = cause ?? (t.touches ? "touch" : "rule out");
  // Named by its cause, a star's effect needs no outline; otherwise the
  // squares it rules out are the outlined ones.
  const what = cause ? "" : phrase` ${mark.the("outline", CELL, t.ruled, "square")}`;
  return so({
    look: phrase`A star on ${here} would ${does}${what}, leaving ${unit} room for ${left}`,
    move,
  });
}

/** Lines and regions that need the same stars: see `Confinement` in
 * [`solver.ts`](./solver.ts). */
export interface Confined {
  line: "row" | "column";
  lines: UnitSet;
  regions: UnitSet;
  need: number;
  /** The stars the lines, and the regions, already hold. */
  linesPlaced: number;
  regionsPlaced: number;
  rest: "lines" | "regions";
}

export const say = {
  /** A star, and the squares touching it. */
  around: (star: Point, cells: readonly Point[]): Sentence =>
    so({
      look: phrase`No star may touch ${mark.the("outline", CELL, [star], "star")}`,
      move: mustBeEmpty(cells),
    }),

  /** A unit that has all its stars. */
  full: (unit: UnitSquares, stars: number, cells: readonly Point[]): Sentence =>
    so({
      look: phrase`${thisUnit(unit)} has ${stars === 1 ? "its star" : `its ${stars} stars`}`,
      move: mustBeEmpty(cells),
    }),

  /** A unit that needs every open square it has. */
  exact: (
    unit: UnitSquares,
    need: number,
    placed: number,
    cells: readonly Point[],
  ): Sentence =>
    so({
      look: phrase`${thisUnit(unit)} needs ${needs(need, placed)} and has only ${need} open ${need === 1 ? "square" : "squares"}`,
      move: mark.as("ring", CELL, cells, (els) =>
        els.length > 1
          ? "these squares must hold stars"
          : "this square must hold a star",
      ),
    }),

  /** A unit that cannot fit its stars without one square. */
  needed: (
    unit: UnitSquares,
    need: number,
    placed: number,
    room: number,
    cell: Point,
  ): Sentence =>
    so({
      look: phrase`${thisUnit(unit)} needs ${needs(need, placed)} and without ${these([cell])} has room for ${room === 0 ? "none" : `only ${room}`}`,
      move: mark.as("ring", CELL, [cell], "that square must hold a star"),
    }),

  /** A star that would touch too much of a unit. */
  trial,

  /**
   * A row or column and the regions in it, or several of each. Whichever of
   * the two is named first holds its stars inside the other, which needs no
   * more than those, so the rest of the other is empty.
   */
  confined: (c: Confined, cells: readonly Point[]): Sentence => {
    const lines = theseLines(c.line, c.lines);
    const regions = theRegions(c.regions);
    const [first, firstUnits, placed, second, secondUnits] =
      c.rest === "lines"
        ? [regions, c.regions, c.regionsPlaced, lines, c.lines]
        : [lines, c.lines, c.linesPlaced, regions, c.regions];
    const verb = (units: UnitSet): string => (units.count === 1 ? "needs" : "need");
    // One star, one line and one region read better as whose star it is.
    if (c.need === 1 && c.lines.count === 1 && c.regions.count === 1)
      return so({
        look: phrase`${first} must put its ${placed > 0 ? "last " : ""}star in ${second}, which needs only that one`,
        move: mustBeEmpty(cells),
      });
    return so({
      look: phrase`${first} ${verb(firstUnits)} ${needs(c.need, placed)}, ${c.need > 1 ? "all " : ""}in ${second}, which ${verb(secondUnits)} only ${c.need}`,
      move: mustBeEmpty(cells),
    });
  },
};

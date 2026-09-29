/**
 * The marks Galaxies' hint draws, as the engine's roles (`hint-words.ts`).
 * `render.ts`'s `packHint` paints what the words name, and `painted` keeps the
 * words from naming a mark it would not show, so a sentence names only what
 * is on the board.
 *
 * A step decides cells (the focus ringed twice, its partner once), walls and
 * the dot the cells go to, so all three are rings, told apart by their kind;
 * the cells, walls and dots it reasons from are outlines; the galaxy or piece
 * it names is striped. Coordinates are the state's half-grid ones.
 */

import type { MarkKind } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import type { GalaxiesHint } from "./hint.ts";

const pointKey = (p: Point): string => `${p.x},${p.y}`;

/** A wall, at its edge's half-grid point. */
export const WALL: MarkKind<Point> = { name: "wall", key: pointKey };

/** A dot, at its half-grid point. */
export const DOT: MarkKind<Point> = { name: "dot", key: pointKey };

const same = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;

/** What a step's highlights paint, by role and kind. */
export interface Painted {
  /** The cell the sentence is about, when it is still to be decided. */
  focus: Point | null;
  /** The other cells the move decides: the focus's partner, or every cell of
   * a firing with no focus. */
  others: Point[];
  area: Point[];
  hatch: Point[];
  targetWalls: Point[];
  walls: Point[];
  targetDot: Point | null;
  refDots: Point[];
}

/**
 * The marks the words may name, as `packHint` can show them. A cell carries
 * one ring, the action's over the evidence's, and a dot is not ringed where it
 * sits on a cell the action fills: there the ring would be the action color on
 * itself.
 */
export function painted(hl: GalaxiesHint): Painted {
  const { focus } = hl;
  const focused = focus !== null && hl.targets.some((t) => same(t, focus));
  const filled = focus === null ? hl.targets : focused && focus ? [focus] : [];
  const isTarget = (p: Point) => hl.targets.some((t) => same(t, p));
  const ringed = (d: Point) =>
    !tilesAround(d).every((t) => filled.some((f) => same(f, t)));
  return {
    focus: focused ? focus : null,
    others: hl.targets.filter((t) => !(focused && focus && same(t, focus))),
    area: hl.area.filter(
      (a, i) => !isTarget(a) && hl.area.findIndex((b) => same(a, b)) === i,
    ),
    hatch: hl.hatch,
    targetWalls: hl.targetWalls,
    walls: hl.walls,
    targetDot: hl.targetDot && ringed(hl.targetDot) ? hl.targetDot : null,
    refDots: hl.refDots.filter(ringed),
  };
}

/** The cells whose corner, side or middle a dot sits on, as tile centers. A dot
 * is never on the board's rim, so every one of them is on the board. */
function tilesAround(d: Point): Point[] {
  const out: Point[] = [];
  for (let ty = Math.ceil((d.y - 2) / 2); ty <= d.y >> 1; ty++)
    for (let tx = Math.ceil((d.x - 2) / 2); tx <= d.x >> 1; tx++)
      out.push({ x: 2 * tx + 1, y: 2 * ty + 1 });
  return out;
}

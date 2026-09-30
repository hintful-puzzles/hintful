/**
 * Every sentence Net's hint speaks, and the words inside them.
 *
 * The deduction decides which reasons a step cites (`hint.ts`); this file
 * decides only how they read. Every word that points at the board is a
 * reference to the mark it points at (`engine/hint-words.ts`): the tile a
 * step locks, or the side it notes, is ringed; the notes and locks it reasons
 * from, and the tile whose turnings it reads, are outlined; the tiles a loop
 * runs through, or a group a turning would seal off, are striped.
 */

import {
  CELL,
  type MarkKind,
  mark,
  Narration,
  phrase,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { D, L, R, U, wireCount } from "../../engine/wires.ts";
import { NOTE_WIRE, type SideNote } from "./state.ts";

/** A side, named as a note move names it (from the tile left of it, `R`, or
 * above it, `D`), with the note a step places or cites there. */
export interface SideMark {
  readonly x: number;
  readonly y: number;
  readonly dir: number;
  readonly note: SideNote;
}

/** A side of the board, keyed by where it is and not by its note. */
export const SIDE: MarkKind<SideMark> = {
  name: "side",
  key: (s) => `${s.x},${s.y},${s.dir}`,
};

const DIR_WORD: Readonly<Record<number, string>> = {
  [R]: "right",
  [U]: "up",
  [L]: "left",
  [D]: "down",
};

/** "left", "down and left": the directions in `wires`, in reading order. */
export function dirWords(wires: number): string {
  const words = [U, R, D, L].filter((d) => wires & d).map((d) => DIR_WORD[d]);
  return words.length < 2
    ? words.join("")
    : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

/** What a tile is called, by its wires: the pieces the help names. */
export function pieceName(wires: number): string {
  const n = wireCount(wires);
  if (n === 1) return "dead end";
  if (n === 3) return "T";
  if (n === 4) return "cross";
  return wires === (R | L) || wires === (U | D) ? "straight" : "corner";
}

/** The reasons one step rests on, gathered for its sentence. */
export interface Premises {
  /** How many wall sides it cites. */
  readonly walls: number;
  readonly notes: readonly SideMark[];
  /** The locked tiles it cites. */
  readonly locks: readonly Point[];
  /** Whether some turning would close a loop, and whether some would seal a
   * group off, through or around the striped tiles. */
  readonly loop: boolean;
  readonly seal: boolean;
  readonly striped: readonly Point[];
  /** How the turnings that loop or seal point, when there is one of them:
   * its wires, or `null` for several. */
  readonly only: number | null;
}

function joined(parts: readonly (string | Narration)[]): Narration {
  const pieces: (string | Narration)[] = [];
  parts.forEach((p, i) => {
    if (i > 0) pieces.push(i === parts.length - 1 ? " and " : ", ");
    pieces.push(p);
  });
  return Narration.join(pieces);
}

/** "the wall, the outlined notes and locks". */
function fitted(p: Premises): Narration | null {
  const things: (string | Narration)[] = [];
  if (p.walls > 0) things.push(p.walls > 1 ? "the walls" : "the wall");
  const locks = (n: number) => (n > 1 ? "locks" : "lock");
  if (p.notes.length > 0 && p.locks.length > 0)
    things.push(
      phrase`${mark.the("outline", SIDE, p.notes, "note")} and ${mark.as("outline", CELL, p.locks, (els) => locks(els.length))}`,
    );
  else if (p.notes.length > 0) things.push(mark.the("outline", SIDE, p.notes, "note"));
  else if (p.locks.length > 0)
    things.push(
      mark.as("outline", CELL, p.locks, (els) => `the outlined ${locks(els.length)}`),
    );
  return things.length === 0 ? null : joined(things);
}

/**
 * Which turnings loop or seal, as the sentence can say it truthfully. One is
 * named by its wires. Several are named by what sets them apart — "any other
 * way", "any way but right", or "right" for a side none may cross — and, when
 * a fit clause stands beside them, only among the ways that fit, because the
 * rest fall to the fit and need not loop or seal at all.
 */
export interface Which {
  /** How several turnings point, with no fit clause beside them: "any other
   * way", "any way but right", "right". */
  readonly pointing: string;
  /** The same, among the ways that fit: "any other way that fits". */
  readonly fitting: string;
}

/** "must fit the wall, and would close a loop through … pointing down". */
function premise(p: Premises, which: Which): Narration {
  const fit = fitted(p);
  if (!p.loop && !p.seal) return fit ? phrase`must fit ${fit}` : phrase``;
  const striped = mark.the("stripes", CELL, p.striped, "square");
  const verb =
    p.loop && p.seal
      ? "close a loop through or seal off"
      : p.loop
        ? "close a loop through"
        : "seal off";
  if (p.only !== null) {
    const trap = phrase`would ${verb} ${striped} pointing ${dirWords(p.only)}`;
    return fit ? phrase`must fit ${fit}, and ${trap}` : trap;
  }
  return fit
    ? phrase`must fit ${fit}, and ${which.fitting} would ${verb} ${striped}`
    : phrase`would ${verb} ${striped} pointing ${which.pointing}`;
}

const OTHER_WAYS: Which = {
  pointing: "any other way",
  fitting: "any other way that fits",
};

export const say = {
  /** The first leg of a lock the tile must turn for. */
  turn: (tile: Point, wires: number, p: Premises): Narration =>
    phrase`${mark.this("ring", CELL, [tile], pieceName(wires)).capitalized()} ${premise(p, OTHER_WAYS)}, so only one way fits: turn it.`,

  /** A lock whose tile already shows its one way. */
  lock: (tile: Point, wires: number, p: Premises): Narration =>
    phrase`${mark.this("ring", CELL, [tile], pieceName(wires)).capitalized()} ${premise(p, OTHER_WAYS)}, so it must stay as it is: lock it.`,

  /** The lock after the turn. */
  thenLock: (tile: Point, wires: number): Narration =>
    phrase`Now lock ${mark.this("ring", CELL, [tile], pieceName(wires))}: no other way fits.`,

  /** A side every surviving turning agrees on: `facing` is the direction from
   * the outlined tile to the ringed side. */
  note: (
    tile: Point,
    wires: number,
    side: SideMark,
    facing: number,
    p: Premises,
  ): Narration => {
    const subject = mark.the("outline", CELL, [tile], pieceName(wires)).capitalized();
    const where = mark.this("ring", SIDE, [side], "side");
    const d = dirWords(facing);
    return side.note === NOTE_WIRE
      ? phrase`${subject} ${premise(p, { pointing: `any way but ${d}`, fitting: `any way that fits but ${d}` })}, so it must point ${d}: note a wire across ${where}.`
      : phrase`${subject} ${premise(p, { pointing: d, fitting: `any way that fits and points ${d}` })}, so it can never point ${d}: note no wire across ${where}.`;
  },
};

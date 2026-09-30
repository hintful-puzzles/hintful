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
  /** Whether every striped square is a dead end, which is what closes a group
   * off: a dead end has no other wire to lead out with. */
  readonly deadEnds: boolean;
  /** Whether a striped square is the tile's neighbor only across the edge of
   * a wrapping grid, which nothing on screen shows. */
  readonly acrossEdge: boolean;
  /** How the turnings that loop or seal point, when there is one of them:
   * its wires, or `null` for several. */
  readonly only: number | null;
}

/** How a tile lies when turned to `wires`: a straight lies across or stands
 * upright, and anything else points somewhere. */
function lying(wires: number): string {
  if (wires === (R | L)) return "lying across";
  if (wires === (U | D)) return "standing upright";
  return `pointing ${dirWords(wires)}`;
}

/** How a tile that keeps its turning stays: "upright", "as it is". */
function staying(wires: number): string {
  if (wires === (R | L)) return "across";
  if (wires === (U | D)) return "upright";
  return "as it is";
}

const NUMBER = ["", "one", "two", "three", "four", "five", "six", "seven", "eight"];

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

/** What a turning that loops or seals would do: "would close a loop through
 * the striped squares", or, when dead ends are what close the group, "would
 * join the striped dead ends, which have no other wire, closing all three off
 * from the rest". */
function trapped(p: Premises): Narration {
  const wraps = p.acrossEdge
    ? p.striped.length > 1
      ? " (one across the wrapped edge)"
      : " (across the wrapped edge)"
    : "";
  // Several turnings each close off a group of their own, so the stripes are
  // their union and no one count or "join them" is true of every turning.
  if (p.only === null) {
    const verb =
      p.loop && p.seal
        ? "close a loop through or seal off"
        : p.loop
          ? "close a loop through"
          : "seal off";
    const some = (els: readonly Point[]) =>
      els.length > 1 ? "some of the striped squares" : "the striped square";
    return phrase`would ${verb} ${mark.as("stripes", CELL, p.striped, some)}${wraps}`;
  }
  if (p.seal && !p.loop && p.deadEnds) {
    const n = p.striped.length;
    const all = n + 1;
    const closing = all === 2 ? "the two" : `all ${NUMBER[all] ?? String(all)}`;
    return phrase`would join ${mark.the("stripes", CELL, p.striped, "dead end")}${wraps}, which ${n > 1 ? "have" : "has"} no other wire, closing ${closing} off from the rest`;
  }
  const verb =
    p.loop && p.seal
      ? "close a loop through or seal off"
      : p.loop
        ? "close a loop through"
        : "seal off";
  return phrase`would ${verb} ${mark.the("stripes", CELL, p.striped, "square")}${wraps}`;
}

/**
 * A whole premise and conclusion about `subject`. The turning that loops or
 * seals comes first ("Lying across, this straight would …"), so it cannot be
 * read as describing the striped squares after it.
 */
function sentence(
  subject: Narration,
  p: Premises,
  which: Which,
  conclusion: Narration,
): Narration {
  const fit = fitted(p);
  if (!p.loop && !p.seal)
    return phrase`${subject.capitalized()} must fit ${fit ?? ""}, ${conclusion}`;
  const trap = trapped(p);
  if (fit === null) {
    const lead = p.only !== null ? lying(p.only) : `pointing ${which.pointing}`;
    const Lead = lead.charAt(0).toUpperCase() + lead.slice(1);
    return phrase`${Lead}, ${subject} ${trap}, ${conclusion}`;
  }
  return p.only !== null
    ? phrase`${subject.capitalized()} must fit ${fit}, and, ${lying(p.only)}, it ${trap}, ${conclusion}`
    : phrase`${subject.capitalized()} must fit ${fit}, and ${which.fitting} ${trap}, ${conclusion}`;
}

const OTHER_WAYS: Which = {
  pointing: "any other way",
  fitting: "any other way that fits",
};

export const say = {
  /** The first leg of a lock the tile must turn for. */
  turn: (tile: Point, wires: number, p: Premises): Narration =>
    sentence(
      mark.this("ring", CELL, [tile], pieceName(wires)),
      p,
      OTHER_WAYS,
      phrase`so only one way fits: turn it.`,
    ),

  /** A lock whose tile already shows its one way. */
  lock: (tile: Point, wires: number, p: Premises): Narration =>
    sentence(
      mark.this("ring", CELL, [tile], pieceName(wires)),
      p,
      OTHER_WAYS,
      phrase`so it must stay ${staying(wires)}: lock it.`,
    ),

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
    const subject = mark.the("outline", CELL, [tile], pieceName(wires));
    const where = mark.this("ring", SIDE, [side], "side");
    const d = dirWords(facing);
    return side.note === NOTE_WIRE
      ? sentence(
          subject,
          p,
          { pointing: `any way but ${d}`, fitting: `any way that fits but ${d}` },
          phrase`so it must point ${d}: note a wire across ${where}.`,
        )
      : sentence(
          subject,
          p,
          { pointing: d, fitting: `any way that fits and points ${d}` },
          phrase`so it can never point ${d}: note no wire across ${where}.`,
        );
  },
};

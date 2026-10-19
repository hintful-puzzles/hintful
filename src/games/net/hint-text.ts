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
  type Sentence,
  sentence,
  so,
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

/** The known sides a tile's turnings are held to. */
export interface Fit {
  /** How many wall sides are cited. */
  readonly walls: number;
  readonly notes: readonly SideMark[];
  /** The locked tiles cited. */
  readonly locks: readonly Point[];
}

/** A square beside the step's tile that one turning of the tile would leave
 * no way to turn: what it would still have to fit besides the tile, and the
 * loops, through the striped squares, that its ways that fit would close. */
export interface Stranded extends Fit {
  readonly at: Point;
  /** Its wires, which name the piece. */
  readonly wires: number;
  /** How many of its ways would close a loop. */
  readonly loops: number;
  /** Whether it is beside the tile only across the edge of a wrapping grid. */
  readonly acrossEdge: boolean;
}

/** The reasons one step rests on, gathered for its sentence. */
export interface Premises extends Fit {
  /** The squares some turning would leave with no way to turn. */
  readonly stranded: readonly Stranded[];
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
  /** Whether a sealed group is reached only through striped squares whose
   * turning is still open, so that no wire drawn yet shows it. */
  readonly runsOn: boolean;
  /** Whether one of those squares could carry the wire on only by closing a
   * loop, which the sentence then has to rule out aloud. */
  readonly barLoops: boolean;
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

/** "the wall", "the outlined notes and locks": each kind of side cited. */
function fittedThings(p: Fit): (string | Narration)[] {
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
  return things;
}

/** "the wall, the outlined notes and locks". */
function fitted(p: Fit): Narration | null {
  const things = fittedThings(p);
  return things.length === 0 ? null : joined(things);
}

const someStriped = (els: readonly Point[]) =>
  els.length > 1 ? "some striped squares" : "the striped square";

/** What a turning that strands the one square beside it would do: "would
 * leave the outlined T no way to fit it and the wall without closing a loop
 * through the striped squares". `piece` names the step's own tile where it is
 * outlined too, so that a neighbor of the same piece is "the other". */
function stranding(p: Premises, s: Stranded, piece: string | null): Narration {
  const name = pieceName(s.wires);
  const square = mark.the(
    "outline",
    CELL,
    [s.at],
    name,
    name === piece ? "the other" : "the",
  );
  const through =
    s.loops > 1
      ? mark.as("stripes", CELL, p.striped, someStriped)
      : mark.the("stripes", CELL, p.striped, "square");
  return phrase`would leave ${square}${s.acrossEdge ? " (across the wrapped edge)" : ""} no way to fit ${joined(["it", ...fittedThings(s)])} without closing a loop through ${through}`;
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
  /** The same, among the ways that fit, opening the sentence: "Every other
   * way this T fits the outlined lock". */
  readonly fitting: (subject: Narration, fit: Narration) => Narration;
}

/** What a turning that loops or seals would do: "would close a loop through
 * the striped squares", or, when dead ends are what close the group, "would
 * face the striped dead end" or "would join the striped dead ends, which have
 * no other wire, closing all three off from the rest"; or, when the group is
 * one its wire only runs into, "would lead only into the striped squares,
 * which end its wire however they turn". */
function trapped(p: Premises, piece: string | null): Narration {
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
    const striped = mark.as("stripes", CELL, p.striped, someStriped);
    if (p.stranded.length === 0) return phrase`would ${verb} ${striped}${wraps}`;
    const left = mark.as(
      "outline",
      CELL,
      p.stranded.map((s) => s.at),
      (els) => (els.length > 1 ? "one of the outlined squares" : "the outlined square"),
    );
    return p.loop || p.seal
      ? phrase`would ${verb} ${striped}${wraps}, or leave ${left} no way to turn without closing a loop`
      : phrase`would leave ${left} no way to turn without closing a loop through ${striped}`;
  }
  const [stranded] = p.stranded;
  if (stranded) return stranding(p, stranded, piece);
  if (p.seal && !p.loop && p.deadEnds) {
    const n = p.striped.length;
    // Two dead ends closed off together are this one and the striped one, in
    // the help's words: two dead ends can never face each other.
    if (n === 1)
      return phrase`would face ${mark.the("stripes", CELL, p.striped, "dead end")}${wraps}`;
    const all = n + 1;
    const closing = all === 2 ? "the two" : `all ${NUMBER[all] ?? String(all)}`;
    return phrase`would join ${mark.the("stripes", CELL, p.striped, "dead end")}${wraps}, which ${n > 1 ? "have" : "has"} no other wire, closing ${closing} off from the rest`;
  }
  if (p.seal && !p.loop && p.runsOn)
    return phrase`would lead only into ${mark.the("stripes", CELL, p.striped, "square")}${wraps}, which ${p.barLoops ? "end or loop" : "end"} its wire however they turn`;
  const verb =
    p.loop && p.seal
      ? "close a loop through or seal off"
      : p.loop
        ? "close a loop through"
        : "seal off";
  return phrase`would ${verb} ${mark.the("stripes", CELL, p.striped, "square")}${wraps}`;
}

/**
 * What to look at about `subject`, and the fit its conclusion still has to
 * name (`null` when the look names it, or there is none). The turning that
 * loops or seals comes first ("Lying across, this straight would …"), so it
 * cannot be read as describing the striped squares after it; the fit then
 * rules out the other ways where the conclusion does its work ("so only one
 * way fits the outlined lock").
 */
function look(
  subject: Narration,
  p: Premises,
  which: Which,
  piece: string | null = null,
): { look: Narration; fit: Narration | null } {
  const fit = fitted(p);
  if (!p.loop && !p.seal && p.stranded.length === 0)
    return { look: phrase`${subject} must fit ${fit ?? ""}`, fit: null };
  const trap = trapped(p, piece);
  if (p.only !== null)
    return { look: phrase`${lying(p.only)}, ${subject} ${trap}`, fit };
  if (fit === null)
    return { look: phrase`pointing ${which.pointing}, ${subject} ${trap}`, fit: null };
  return { look: phrase`${which.fitting(subject, fit)} ${trap}`, fit: null };
}

const OTHER_WAYS: Which = {
  pointing: "any other way",
  fitting: (subject, fit) => phrase`every other way ${subject} fits ${fit}`,
};

export const say = {
  /** The first leg of a lock the tile must turn for. */
  turn: (tile: Point, wires: number, p: Premises): Sentence => {
    const seen = look(mark.this("ring", CELL, [tile], pieceName(wires)), p, OTHER_WAYS);
    return so({
      look: seen.look,
      follows: seen.fit
        ? phrase`only one way fits ${seen.fit}`
        : phrase`only one way fits`,
      move: phrase`turn it`,
    });
  },

  /** A lock whose tile already shows its one way. */
  lock: (tile: Point, wires: number, p: Premises): Sentence => {
    const seen = look(mark.this("ring", CELL, [tile], pieceName(wires)), p, OTHER_WAYS);
    return so({
      look: seen.look,
      follows: seen.fit
        ? phrase`it can fit ${seen.fit} only ${staying(wires)}`
        : phrase`it must stay ${staying(wires)}`,
      move: phrase`lock it`,
    });
  },

  /** The lock after the turn, for the turn's reason. */
  thenLock: (tile: Point, wires: number): Sentence =>
    sentence({
      move: phrase`lock ${mark.this("ring", CELL, [tile], pieceName(wires))}`,
      relation: { kind: "again", basis: phrase`no other way fits` },
    }),

  /** A side every surviving turning agrees on: `facing` is the direction from
   * the outlined tile to the ringed side. */
  note: (
    tile: Point,
    wires: number,
    side: SideMark,
    facing: number,
    p: Premises,
  ): Sentence => {
    const subject = mark.the("outline", CELL, [tile], pieceName(wires));
    const where = mark.this("ring", SIDE, [side], "side");
    const d = dirWords(facing);
    const piece = pieceName(wires);
    // With the one turning ruled out first, the fit rules out the rest.
    const toFit = (fit: Narration | null) => (fit ? phrase`to fit ${fit}, ` : "");
    if (side.note === NOTE_WIRE) {
      const seen = look(
        subject,
        p,
        {
          pointing: `any way but ${d}`,
          fitting: (s, fit) => phrase`every way ${s} fits ${fit} but ${d}`,
        },
        piece,
      );
      return so({
        look: seen.look,
        follows: phrase`${toFit(seen.fit)}it must point ${d}`,
        move: phrase`note a wire across ${where}`,
      });
    }
    const seen = look(
      subject,
      p,
      {
        pointing: d,
        fitting: (s, fit) => phrase`every way ${s} fits ${fit} pointing ${d}`,
      },
      piece,
    );
    return so({
      look: seen.look,
      follows: phrase`${toFit(seen.fit)}it can never point ${d}`,
      move: phrase`note no wire across ${where}`,
    });
  },
};

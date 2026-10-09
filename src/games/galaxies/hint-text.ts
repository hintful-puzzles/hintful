/**
 * Every sentence Galaxies' hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`hint.ts`'s
 * `saidOf`, which reads each dot's color and whether a wall is the board's own
 * rim, into the step's `said`); this file decides only how it reads. Every word
 * that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`, `hint-marks.ts`), read off the step's highlights, so
 * a step shrunk by the player's own moves re-reads from what it still draws.
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
import type { GalaxiesHint } from "./hint.ts";
import { DOT, type Painted, painted, WALL } from "./hint-marks.ts";

/** What a sentence says beyond its marks: the values it reads off the board. */
export type GalaxiesSaid =
  /** `n` is how many cells the dot sits on, which says where it is. */
  | { kind: "dotTile"; black: boolean; n: number }
  /** `points` when both cells show arrows. */
  | { kind: "separate"; points: boolean }
  /** `edge` when the wall to match is the board's rim. */
  | { kind: "mirrorWall"; black: boolean; edge: boolean }
  | { kind: "enclosed"; black: boolean; openings: number }
  | { kind: "soleOwner"; black: boolean }
  | { kind: "onlyReach"; black: boolean }
  | { kind: "exclave" };

/** A dot, named by its color. */
const dot = (black: boolean): string => (black ? "black dot" : "white dot");

const els = (p: Point | null): Point[] => (p ? [p] : []);

/** "this cell": the ringed square a step opens on. */
const thisCell = (p: Painted): Narration =>
  mark.as("ring", CELL, els(p.focus), "this cell");
const partner = (p: Painted, words = "its partner"): Narration | string =>
  p.others.length > 0 ? phrase` and ${mark.as("ring", CELL, p.others, words)}` : "";
/** "it", with its partner when there is one. */
const itAnd = (p: Painted): Narration =>
  phrase`${mark.as("ring", CELL, els(p.focus), "it")}${partner(p)}`;
const ringedDot = (p: Painted, words: string): Narration =>
  mark.as("ring", DOT, els(p.targetDot), words);

function sentenceOf(p: Painted, said: GalaxiesSaid): Sentence {
  switch (said.kind) {
    case "dotTile": {
      const cells = mark.as("ring", CELL, p.others, (cs) =>
        cs.length === 1
          ? "this cell"
          : cs.length === 2
            ? "both these cells"
            : `these ${cs.length} cells`,
      );
      // Named by where it is: the dot is *on* the cells being filled, so it is
      // ringed only where a cell around it is not.
      const where =
        said.n === 2
          ? "between them"
          : said.n === 4
            ? "at their shared corner"
            : "they touch";
      return so({
        look: phrase`A galaxy covers the cells its dot sits on`,
        move: phrase`${cells} must belong to ${ringedDot(p, `the ${dot(said.black)}`)} ${where}`,
      });
    }

    // A cell that *holds* its own dot draws no arrow — there is nothing to point
    // at from inside itself — so "point at different dots" would send the player
    // looking for an arrow that is not there. Both cells are still visibly
    // settled: one shows an arrow, the other shows the dot.
    case "separate":
      return so({
        look: phrase`${mark.as("outline", CELL, p.area, "These two cells")} ${said.points ? "point at" : "go with"} ${mark.as("outline", DOT, p.refDots, "different dots")}`,
        follows: phrase`they belong to different galaxies`,
        move: phrase`${mark.as("ring", WALL, p.targetWalls, "a wall")} must run between them`,
      });

    // The mirrored wall is very often the board's own rim, and calling that
    // "the outlined wall" would have the player hunting for a wall they are
    // already looking at the edge of.
    // A cell the dot sits in the middle of is its own partner, and its walls
    // mirror to its own other side.
    case "mirrorWall": {
      const across = mark.as("outline", DOT, p.refDots, `the ${dot(said.black)}`);
      const pair =
        p.area.length === 1
          ? phrase`${mark.as("outline", CELL, p.area, "The outlined cell")} is its own partner across ${across}`
          : phrase`${mark.the("outline", CELL, p.area, "cell")} are partners across ${across}`;
      const wall = mark.this("ring", WALL, p.targetWalls, "wall");
      return said.edge
        ? so({
            look: phrase`${pair}; one ${p.area.length === 1 ? "side " : ""}meets ${mark.as("outline", WALL, p.walls, "the board's edge")}`,
            move: phrase`${wall} must match it`,
          })
        : so({
            look: pair,
            move: phrase`${mark.the("outline", WALL, p.walls, "wall")} must be mirrored by ${wall}`,
          });
    }

    // Its walled sides are drawn on the board, and "every way out" already
    // excludes them; that a galaxy is connected is the rule, and the help teaches
    // it (docs/games/hints.md § "Rules belong in the help").
    case "enclosed": {
      const lead = mark.as(
        "outline",
        CELL,
        p.area,
        said.openings === 1 ? "The only way out" : "Every way out",
      );
      return so({
        look: phrase`${lead} of ${thisCell(p)} leads into ${mark.the("stripes", whole(CELL), p.hatch, "galaxy")}`,
        move: phrase`${itAnd(p)} must belong to ${ringedDot(p, `the ringed ${dot(said.black)}`)}`,
      });
    }

    // The claim *is* this rung's own condition, so it is checkable by the player
    // with the gesture they already have: drag from the cell and count the rings.
    case "soleOwner":
      return so({
        look: phrase`Any other dot mirrors ${thisCell(p)} off the board or onto a dot`,
        move: phrase`${itAnd(p)} must belong to ${ringedDot(p, `the ringed ${dot(said.black)}`)}`,
      });

    // "shows how far", not "is everywhere": the acted-on cell carries the action
    // mark rather than the hatch, so the striped set is the reach minus one
    // square and an absolute claim would be a shade off true.
    case "onlyReach":
      return so({
        look: phrase`No other galaxy reaches ${thisCell(p)}`,
        move: phrase`${itAnd(p)} must join ${ringedDot(p, `the ringed ${dot(said.black)}`)}, whose reach ${mark.as("stripes", CELL, p.hatch, "the stripes show")}`,
      });

    case "exclave":
      return so({
        look: phrase`${mark.the("stripes", CELL, p.hatch, "cell")} can reach ${ringedDot(p, p.hatch.length === 1 ? "its ringed dot" : "their ringed dot")} only through ${thisCell(p)}`,
        move: phrase`${itAnd(p)} must be that dot's too`,
      });
  }
}

/** A step's sentence, from its highlights. */
export const say = (hl: GalaxiesHint): Sentence => sentenceOf(painted(hl), hl.said);

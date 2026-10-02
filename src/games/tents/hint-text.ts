/**
 * Every sentence Tents' hint speaks, and every word inside one.
 *
 * The deduction decides which sentence and with what values ([`hint.ts`](./hint.ts)'s
 * `stepsOf`); this file decides only how it reads. Each sentence runs
 * indication, reasoning, conclusion, with the conclusion in the necessity voice
 * (docs/games/hints.md § "Writing the narration").
 *
 * The words are the help page's: a square is a tent, grass, or open (still
 * blank), and a tent **belongs to** a tree once the two are joined, which the
 * player sees as a link drawn between them or reads off the board at a glance.
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the squares a step decides, and a link it asks for,
 * are ringed; the squares it reasons from are outlined, and so is the number it
 * counts with; and the row or column it counts along is striped ("this row").
 * That every tent sits beside a tree of its own and that tents never touch are
 * the rules, and sit in the help (docs/games/hints.md § "Rules belong in the
 * help").
 *
 * A step that decides several squares shrinks as the player makes some of them
 * (`tentsKeepTrack`), and its words are narrowed with it, so every word that
 * counts the ringed squares is a reference that re-renders from them.
 */

import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  sentence,
  so,
  whole,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { type HintLink, LINK, NUMBER } from "./hint-marks.ts";

/** Which kind of line a count is read along. */
export type LineKind = "row" | "column";

/** A direction from a tent to its tree. */
export type Dir = "up" | "down" | "left" | "right";

const TREE_AT: Record<Dir, string> = {
  up: "the tree above it",
  down: "the tree below it",
  left: "the tree to its left",
  right: "the tree to its right",
};

const TENT_AT: Record<Dir, string> = {
  up: "the one above it",
  down: "the one below it",
  left: "the one to its left",
  right: "the one to its right",
};

const tents = (n: number): string => (n === 1 ? "1 tent" : `${n} tents`);
const more = (n: number): string => (n === 1 ? "1 more tent" : `${n} more tents`);

/** Words for the ringed squares, by how many are left. */
const ringed = (cells: readonly Point[], one: string, many: string): Narration =>
  mark.as("ring", CELL, cells, (els) => (els.length > 1 ? many : one));

const these = (cells: readonly Point[]): Narration =>
  mark.this("ring", CELL, cells, "square");

/** "it must be" / "they must be", over the ringed squares. */
const mustBe = (cells: readonly Point[]): Narration =>
  phrase`${ringed(cells, "it", "they")} must be`;

/** The line a count is read along, and the number it is read against. */
export interface Counted {
  kind: LineKind;
  squares: readonly Point[];
  line: number;
}

const thisLine = (c: Counted): Narration =>
  mark.this("stripes", whole(CELL), c.squares, c.kind);

const number = (c: Counted, words: string): Narration =>
  mark.as("outline", NUMBER, [c.line], words);

const join = (link: HintLink, words: string): Narration =>
  mark.as("ring", LINK, [link], words);

export const say = {
  // --- grass --------------------------------------------------------------

  /** Squares no tree is beside. */
  noTree: (cells: readonly Point[]): Sentence =>
    so({
      look: phrase`Every tent sits beside a tree, and no tree is beside ${these(cells)}`,
      move: phrase`${mustBe(cells)} grass`,
    }),

  /** Squares every tree beside which already has its tent, shown in `area`. */
  treesDone: (cells: readonly Point[], area: readonly Point[]): Sentence => {
    const has = area.length
      ? mark.paren("outline", CELL, area, "already has its tent")
      : phrase`already has its tent`;
    return so({
      look: phrase`Every tree beside ${these(cells)} ${has}`,
      move: phrase`${mustBe(cells)} grass`,
    });
  },

  /** The open squares round one tent. */
  nextToTent: (cells: readonly Point[], tent: Point): Sentence =>
    so({
      look: phrase`Tents never touch, even diagonally`,
      move: phrase`${ringed(cells, "the open square", "every open square")} around ${mark.the("outline", CELL, [tent], "tent")} must be grass`,
    }),

  treeDiagonal: (cell: Point, tree: Point, pair: readonly Point[]): Sentence =>
    so({
      look: phrase`${mark.as("outline", CELL, [tree], "The outlined tree")}'s tent must go in one of ${mark.the("outline", CELL, pair, "square", "the two")}; either touches ${mark.as("ring", CELL, [cell], "the ringed one")}`,
      move: phrase`it must be grass`,
    }),

  // --- a tree's own tent ---------------------------------------------------

  /** A tree with one open square left; `taken` the tents beside it that
   * already belong to other trees. */
  treeSingle: (
    square: Point,
    tree: Point,
    taken: readonly Point[],
    link: HintLink,
  ): Sentence => {
    const joined = join(link, "joined to it");
    const theTree = mark.as("outline", CELL, [tree], "the outlined tree");
    return taken.length
      ? so({
          look: phrase`${mark.the("outline", CELL, taken, "tent")} ${taken.length > 1 ? "belong to other trees" : "belongs to another tree"}`,
          move: phrase`${theTree}'s tent must go in ${mark.as("ring", CELL, [square], "its only open square")}, ${joined}`,
        })
      : so({
          look: phrase`${theTree}'s only open square is ${mark.as("ring", CELL, [square], "the ringed one")}`,
          move: phrase`its tent must go there, ${joined}`,
        });
  },

  // --- joining a tent to its tree -----------------------------------------

  /** A tent every other tree beside which already has its tent (shown in
   * `area`). */
  tentLink: (
    tent: Point,
    tree: Point,
    to: Dir,
    area: readonly Point[],
    link: HintLink,
  ): Sentence => {
    const has = area.length
      ? mark.paren("outline", CELL, area, "has its tent")
      : phrase`already has its tent`;
    return so({
      look: phrase`Every other tree beside ${mark.as("ring", CELL, [tent], "the ringed tent")} ${has}`,
      follows: phrase`it must belong to ${mark.as("ring", CELL, [tree], TREE_AT[to])}`,
      move: join(link, "join them"),
    });
  },

  /** A tree with no open square, and one tent beside it not already another
   * tree's; `taken` the tents beside it that are, with their trees. */
  treeLink: (
    tree: Point,
    tent: Point,
    to: Dir,
    taken: readonly Point[],
    others: number,
    link: HintLink,
  ): Sentence => {
    const theTent = mark.as("ring", CELL, [tent], TENT_AT[to]);
    const joined = join(link, "join them");
    if (!taken.length)
      return so({
        look: phrase`${mark.as("ring", CELL, [tree], "The ringed tree")} has no open square beside it`,
        follows: phrase`its tent must be ${theTent}`,
        move: joined,
      });
    const belong =
      others > 1
        ? "The outlined tents belong to other trees"
        : "The outlined tent belongs to another tree";
    return so({
      look: mark.as("outline", CELL, taken, belong),
      follows: phrase`${mark.as("ring", CELL, [tree], "the ringed tree")}'s tent must be ${theTent}`,
      move: joined,
    });
  },

  // --- counting along a line ----------------------------------------------

  /** A line whose count of `clue` is already met. */
  countMet: (c: Counted, clue: number, cells: readonly Point[]): Sentence =>
    so({
      look:
        clue === 0
          ? phrase`${thisLine(c)}'s ${number(c, "number")} is 0`
          : phrase`${thisLine(c)} already has ${number(c, `its ${tents(clue)}`)}`,
      move: phrase`${ringed(cells, "its open square", "its open squares")} must be grass`,
    }),

  /** A line needing `need` tents with exactly `need` open squares, none side
   * by side. */
  allOpen: (c: Counted, need: number, cells: readonly Point[]): Sentence =>
    so({
      look: phrase`${thisLine(c)} needs ${number(c, more(need))} and has only ${need === 1 ? "1 open square" : `${need} open squares`}`,
      move: ringed(
        cells,
        "this square must be a tent",
        "these squares must all be tents",
      ),
    }),

  /** A line whose open squares have room for exactly `need` tents that do not
   * touch, so the ringed squares must hold one each. */
  noSpareRoom: (c: Counted, need: number, cells: readonly Point[]): Sentence =>
    so({
      look: phrase`${thisLine(c)} needs ${number(c, more(need))}, and its open squares have room for only ${need} that don't touch`,
      move: ringed(cells, "this one must be a tent", "these must be tents"),
    }),

  /** The same firing's other leg: squares between those tents, by the rule
   * the first leg's count did not need. */
  betweenThem: (c: Counted, cells: readonly Point[]): Sentence =>
    sentence({
      move: phrase`${ringed(cells, "the square", "the squares")} between the tents that ${thisLine(c)}'s ${number(c, "number")} needs must be grass`,
      relation: { kind: "again", basis: phrase`tents never touch` },
    }),

  /** Every placement touches the ringed squares in the lines alongside. */
  touchesBeside: (c: Counted, need: number, cells: readonly Point[]): Sentence =>
    so({
      look:
        need === 1
          ? phrase`Wherever ${thisLine(c)}'s ${number(c, "last tent")} goes, it touches ${these(cells)} beside it`
          : phrase`Wherever ${thisLine(c)}'s ${number(c, `${need} remaining tents`)} go, one touches ${ringed(cells, "this square", "each of these squares")} beside it`,
      move: phrase`${mustBe(cells)} grass`,
    }),
};

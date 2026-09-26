/**
 * Every sentence Tents' hint speaks, and every word inside one.
 *
 * The deduction decides which sentence and with what values ([`hint.ts`](./hint.ts)'s
 * `narrate`); this file decides only how it reads. Each sentence runs
 * indication, reasoning, conclusion, with the conclusion in the necessity voice
 * (docs/games/hints.md § "Writing the narration").
 *
 * The words are the help page's: a square is a tent, grass, or open (still
 * blank), and a tent **belongs to** a tree once the two are joined, which the
 * player sees as a link drawn between them or reads off the board at a glance.
 * The squares a step decides are ringed ("these squares"), the ones it reasons
 * from outlined, and the row or column it counts with is hatched ("this row").
 * That every tent sits beside a tree of its own and that tents never touch are
 * the rules, and sit in the help (docs/games/hints.md § "Rules belong in the
 * help").
 */

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
const these = (n: number): string => (n === 1 ? "this square" : "these squares");
const mustBe = (n: number): string => (n === 1 ? "it must be" : "they must be");

export const say = {
  // --- grass --------------------------------------------------------------

  /** `n` squares no tree is beside. */
  noTree: (n: number): string =>
    `Every tent sits beside a tree, and no tree is beside ${these(n)}, so ${mustBe(n)} grass.`,

  /** `n` squares every tree beside which already has its tent. */
  treesDone: (n: number): string =>
    `Every tree beside ${these(n)} already has its tent, so ${mustBe(n)} grass.`,

  /** The open squares round one tent. */
  nextToTent: (n: number): string =>
    `Tents never touch, even diagonally, so ${n === 1 ? "the open square" : "every open square"} around this tent must be grass.`,

  treeDiagonal:
    "This tree's tent must go in one of the two outlined squares, and either would touch the ringed one, so it must be grass.",

  // --- a tree's own tent ---------------------------------------------------

  /** A tree with one open square left; `taken` when a tent beside it already
   * belongs to another tree. */
  treeSingle: (taken: boolean): string =>
    taken
      ? "The outlined tent belongs to another tree, so this tree's tent must go in its only open square, joined to it."
      : "This tree's only open square is the ringed one, so its tent must go there, joined to it.",

  // --- joining a tent to its tree -----------------------------------------

  /** A tent every other tree beside which already has its tent. */
  tentLink: (to: Dir): string =>
    `Every other tree beside the ringed tent already has its tent, so it must belong to ${TREE_AT[to]}: join them.`,

  /** A tree with no open square, and one tent beside it not already another
   * tree's; `taken` when some tent beside it is. */
  treeLink: (to: Dir, taken: boolean): string =>
    taken
      ? `The outlined tent belongs to another tree, so the ringed tree's tent must be ${TENT_AT[to]}: join them.`
      : `The ringed tree has no open square beside it, so its tent must be ${TENT_AT[to]}: join them.`,

  // --- counting along a line ----------------------------------------------

  /** A line whose count of `clue` is already met. */
  countMet: (kind: LineKind, clue: number): string =>
    clue === 0
      ? `This ${kind} has no tents, so its open squares must be grass.`
      : `This ${kind} already has its ${tents(clue)}, so its open squares must be grass.`,

  /** A line needing `need` tents with exactly `need` open squares, none side
   * by side. */
  allOpen: (kind: LineKind, need: number): string =>
    need === 1
      ? `This ${kind} needs 1 more tent and has only 1 open square, so it must be a tent.`
      : `This ${kind} needs ${need} more tents and has only ${need} open squares, so they must all be tents.`,

  /** A line whose open squares have room for exactly `need` tents that do not
   * touch, so `n` squares must hold one. */
  noSpareRoom: (kind: LineKind, need: number, n: number): string =>
    `This ${kind} needs ${more(need)}, and its open squares have room for only ${need} that don't touch, so ${n === 1 ? "this one must be a tent" : "these must be tents"}.`,

  /** The same firing's other leg: `n` squares between those tents. */
  betweenThem: (n: number): string =>
    `Tents never touch, so ${n === 1 ? "the square" : "the squares"} between them must be grass.`,

  /** Every placement touches `n` squares in the lines alongside. */
  touchesBeside: (kind: LineKind, need: number, n: number): string =>
    need === 1
      ? `Wherever this ${kind}'s last tent goes, it touches ${these(n)} beside it, so ${mustBe(n)} grass.`
      : `Wherever this ${kind}'s ${need} remaining tents go, one touches ${n === 1 ? "this square" : "each of these squares"} beside it, so ${mustBe(n)} grass.`,
};

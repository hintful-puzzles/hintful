/**
 * The board of a fill game, laid out from its description: the answer's
 * values on the cells, in the description's own values and the space's own
 * order, the one mark a cell may carry, and the clues the board deals. The
 * ladder reads it as it is, so no game translates between its board and the
 * description's (`openspec/changes/a-game-from-its-description-alone`).
 */

import type { DifficultyVerdict } from "../contract/difficulty.ts";
import { CellMarks } from "../solve/cell-marks.ts";
import {
  type ClueList,
  describedSpace,
  type GridSpace,
  hexStore,
  type ListClues,
  type Partition,
  type Violation,
} from "../solve/describe-runtime.ts";
import {
  type CompiledLadder,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS,
} from "../solve/ladder-runtime.ts";
import type { FillPlay } from "./play.ts";

/** A board's clues by kind, a list kind's as lists (Pattern's runs), its
 * dealt partitions by name, and the sizes its params give beyond the grid's
 * (Star Battle's `stars`): a compiled module's `Dealt`. */
export type Clues<C> = {
  readonly [K in keyof C]: ClueList | ListClues | Partition | number;
};

/** The clues of kind `kind`, which the caller knows is a clue kind and not a
 * partition. */
export const listOf = <C>(dealt: C, kind: keyof C): ClueList => dealt[kind] as ClueList;

/** What a fill game's compiled module offers the engine, over its clues
 * `C`. */
export interface FillModule<C> {
  readonly units: readonly string[];
  readonly tiers: readonly string[];
  /** How the board is played: where `dealt` names a clue kind at a cell,
   * the cell is dealt holding it. */
  readonly play?: FillPlay;
  /** The values cell `c` may hold, as a bitmask (bit `d`). */
  domainOf(sp: GridSpace, cl: C, c: number): number;
  /** The answer check and the violations, a variation's rules where
   * `variations` has it on: a module with none takes no such argument. */
  isAnswer(
    g: ArrayLike<number>,
    sp: GridSpace,
    cl: C,
    variations: readonly string[],
  ): boolean;
  violations(
    g: ArrayLike<number>,
    sp: GridSpace,
    cl: C,
    variations: readonly string[],
  ): Violation[];
  /** Where the checks read the cells' marks (the element each names, `-1`
   * for none): whether those of a whole board hold of it. */
  marksHold?(
    g: ArrayLike<number>,
    sp: GridSpace,
    cl: C,
    mark: ArrayLike<number>,
  ): boolean;
  /** Whether the mark on cell `c` may stand on the values `g`: the mark's
   * `while`. A mark with none stands on any. */
  markWhile?(g: ArrayLike<number>, sp: GridSpace, cl: C, c: number): boolean;
  /** Whether cell `c` is washed on the values `g` (`play.wash`): an open one
   * then reads as the secondary value, which a piece there would break. */
  washed?(g: ArrayLike<number>, sp: GridSpace, cl: C, c: number): boolean;
  /** Where the board is a hexagon (`describe-runtime/hexagon.ts`): the clue kind
   * every cell of the store outside it holds. */
  readonly hexagon?: { readonly outside: string };
}

/** The stored grid of a board of `module`'s that the params `p` ask for:
 * the params' own size, or a hexagon's store. */
export const boardSizeOf = <C>(
  module: FillModule<C>,
  p: { w: number; h: number },
): { w: number; h: number } =>
  module.hexagon === undefined ? { w: p.w, h: p.h } : hexStore(p.w, p.h);

/** The board's values with each open washed cell read as the secondary
 * value, as the rules and the live errors read them; the values themselves
 * where nothing is washed. */
export function washedValues<C>(
  module: FillModule<C>,
  board: FillBoard<C>,
): Uint8Array {
  const { washed, play } = module;
  if (washed === undefined || play === undefined) return board.values;
  const sp = spaceOf(module, board);
  return Uint8Array.from(board.values, (v, c) =>
    v === 0 && washed(board.values, sp, board.dealt, c) ? play.secondary : v,
  );
}

/** A fill module with its ladder, as `describedLadder` reads it. Its ids are
 * any string, and a technique runs as a rung or on a cell by the list its id
 * is in (Light Up's bulb shines as it is placed), which `describedLadder`
 * reads apart; the type cannot say so for an id that is any string. */
export type LadderedFillModule<C> = FillModule<C> &
  Pick<CompiledLadder<string, never>, "ladder"> & {
    readonly placing: readonly { readonly id: string; readonly variation?: string }[];
    readonly striking: readonly { readonly id: string; readonly variation?: string }[];
    readonly techniques: Readonly<Record<string, { readonly dealt: boolean }>>;
  };

export interface FillBoard<C> {
  readonly w: number;
  readonly h: number;
  readonly dealt: C;
  /** The variations on, by name: the params', which no move changes. */
  readonly variations: readonly string[];
  /** Each cell's value, the description's, 0 where it has none. */
  readonly values: Uint8Array;
  /** 1 where the cell's domain leaves it one value, placed as the board is
   * dealt: no edit changes it. */
  readonly fixed: Uint8Array;
  /** The element each cell's mark names, `-1` where it has none. */
  readonly mark: Int32Array;
}

/** The space a board of `module`'s is read on. */
export function spaceOf<C>(
  module: FillModule<C>,
  b: { w: number; h: number },
): GridSpace {
  return describedSpace(module.units, b.w, b.h);
}

/** The bits `mask` holds one of, as that value, or 0 where it holds more or
 * none. */
const onlyValue = (mask: number): number =>
  mask !== 0 && (mask & (mask - 1)) === 0 ? 31 - Math.clz32(mask) : 0;

/** A fresh `w` by `h` board on the clues `dealt` with `variations` on, each
 * cell its domain leaves one value, and each the `play.dealt` kind sits at,
 * holding it. */
export function newBoard<C>(
  module: FillModule<C>,
  w: number,
  h: number,
  dealt: C,
  variations: readonly string[] = [],
): FillBoard<C> {
  const sp = describedSpace(module.units, w, h);
  const values = new Uint8Array(w * h);
  const fixed = new Uint8Array(w * h);
  for (const c of sp.cells) {
    const only = onlyValue(module.domainOf(sp, dealt, c));
    if (only === 0) continue;
    values[c] = only;
    fixed[c] = 1;
  }
  const kind = module.play?.dealt;
  if (kind !== undefined) {
    const given = dealt[kind as keyof C] as ClueList;
    given.at.forEach((c, k) => {
      values[c] = given.v[k];
      fixed[c] = 1;
    });
  }
  return {
    w,
    h,
    dealt,
    variations,
    values,
    fixed,
    mark: new Int32Array(w * h).fill(-1),
  };
}

/** The board as dealt: its fixed cells alone, and no marks. */
export function asDealt<C>(board: FillBoard<C>): FillBoard<C> {
  return {
    ...board,
    values: Uint8Array.from(board.values, (v, c) => (board.fixed[c] ? v : 0)),
    mark: new Int32Array(board.mark.length).fill(-1),
  };
}

/** Every value any cell of the board may hold, as a bitmask. */
function domainMask<C>(module: FillModule<C>, sp: GridSpace, dealt: C): number {
  let mask = 0;
  for (const c of sp.cells) mask |= module.domainOf(sp, dealt, c);
  return mask;
}

/** The ladder's marks on the board's values and marks, copied, whether they
 * hold of the board's clues, and the ladder's rungs. A value on the board
 * runs the techniques that run on placing, unrecorded, as one the ladder
 * places does: a bulb the player placed shines. */
export function marksOf<C>(
  module: LadderedFillModule<C>,
  board: FillBoard<C>,
): { marks: CellMarks; ok: boolean; entries: Ladder["entries"] } {
  const sp = spaceOf(module, board);
  const values = board.values.slice();
  const marks = new CellMarks(sp, domainMask(module, sp, board.dealt), values);
  const { entries, placing, striking } = ladderOf(module, board);
  marks.placing = placing;
  marks.striking = striking;
  const ok = marks.seed(values, (c) => module.domainOf(sp, board.dealt, c));
  marks.marked.set(board.mark);
  return { marks, ok, entries };
}

/** What the ladder made of a board: its verdict, and the values and marks
 * it reached. */
export interface Solved {
  readonly verdict: DifficultyVerdict;
  readonly values: Uint8Array;
  readonly mark: Int32Array;
}

/**
 * Run the ladder up to tier `cap` on the board's own values and marks:
 * `solved` where every cell is decided and the values are an answer,
 * `impossible` where a technique proved the marks inconsistent or the
 * finished values are no answer, and `unsolved` where the ladder ran dry.
 */
export function solveBoard<C>(
  module: LadderedFillModule<C>,
  board: FillBoard<C>,
  cap: number,
): Solved {
  const { marks, ok, entries } = marksOf(module, board);
  const out = (verdict: DifficultyVerdict): Solved => ({
    verdict,
    values: Uint8Array.from(marks.grid),
    mark: marks.marked.slice(),
  });
  if (!ok) return out("impossible");
  if (runLadder(marks, ladderTechniques(marks, entries, { [TIERS]: cap }, {})))
    return out("impossible");
  if (marks.grid.includes(0)) return out("unsolved");
  return out(isAnswerOf(module, board, marks.grid) ? "solved" : "impossible");
}

/** The ladder on the board's clues with its variations on. */
const ladderOf = <C>(module: LadderedFillModule<C>, board: FillBoard<C>) =>
  describedLadder(
    module as unknown as CompiledLadder<string, string, string>,
    board.dealt as never,
    {},
    undefined,
    board.variations,
  );

/** Whether `g` is an answer to the board: its clues, its variations on. */
export function isAnswerOf<C>(
  module: FillModule<C>,
  board: FillBoard<C>,
  g: ArrayLike<number>,
): boolean {
  return module.isAnswer(g, spaceOf(module, board), board.dealt, board.variations);
}

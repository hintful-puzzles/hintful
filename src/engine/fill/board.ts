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
  type Violation,
} from "../solve/describe-runtime.ts";
import {
  type CompiledLadder,
  type CompiledTechniquesOf,
  describedLadder,
  ladderTechniques,
  runLadder,
  TIERS,
} from "../solve/ladder-runtime.ts";
import type { FillPlay } from "./play.ts";

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
}

/** A fill module with its ladder, as `describedLadder` reads it. None runs a
 * technique on placing or striking yet; the first that does widens this. */
export type LadderedFillModule<C> = FillModule<C> &
  CompiledLadder<string, never, never, CompiledTechniquesOf<string, never, never>>;

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

/** Every value any cell of the board may hold, as a bitmask. */
function domainMask<C>(module: FillModule<C>, sp: GridSpace, dealt: C): number {
  let mask = 0;
  for (const c of sp.cells) mask |= module.domainOf(sp, dealt, c);
  return mask;
}

/** The ladder's marks on the board's values and marks, copied, and whether
 * they hold of the board's clues. */
export function marksOf<C>(
  module: FillModule<C>,
  board: FillBoard<C>,
): { marks: CellMarks; ok: boolean } {
  const sp = spaceOf(module, board);
  const values = board.values.slice();
  const marks = new CellMarks(sp, domainMask(module, sp, board.dealt), values);
  const ok = marks.seed(values, (c) => module.domainOf(sp, board.dealt, c));
  marks.marked.set(board.mark);
  return { marks, ok };
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
  const { marks, ok } = marksOf(module, board);
  const out = (verdict: DifficultyVerdict): Solved => ({
    verdict,
    values: Uint8Array.from(marks.grid),
    mark: marks.marked.slice(),
  });
  if (!ok) return out("impossible");
  const { entries } = ladderOf(module, board);
  if (runLadder(marks, ladderTechniques(marks, entries, { [TIERS]: cap }, {})))
    return out("impossible");
  if (marks.grid.includes(0)) return out("unsolved");
  return out(isAnswerOf(module, board, marks.grid) ? "solved" : "impossible");
}

/** The ladder on the board's clues with its variations on. */
export const ladderOf = <C>(module: LadderedFillModule<C>, board: FillBoard<C>) =>
  describedLadder(module, board.dealt as never, {}, undefined, board.variations);

/** Whether `g` is an answer to the board: its clues, its variations on. */
export function isAnswerOf<C>(
  module: FillModule<C>,
  board: FillBoard<C>,
  g: ArrayLike<number>,
): boolean {
  return module.isAnswer(g, spaceOf(module, board), board.dealt, board.variations);
}

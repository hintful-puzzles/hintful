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
  blocks,
  type ClueList,
  describedSpace,
  type GridSpace,
  hexStore,
  type ListClues,
  type Partition,
  type Violation,
} from "../solve/describe-runtime.ts";
import {
  type Caps,
  type CompiledLadder,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS,
} from "../solve/ladder-runtime.ts";
import { LATIN_LIBRARY } from "../solve/latin.ts";
import type { FillDeal } from "./game-id.ts";
import type { FillPlay } from "./play.ts";

/** A board's clues by kind, a list kind's as lists (Pattern's runs), its
 * dealt partitions by name, the sizes its params give beyond the grid's
 * (Star Battle's `stars`), and a clue at the board with fields, its `n`
 * entries a field (Boats' fleet): a compiled module's `Dealt`. */
export type Clues<C> = {
  readonly [K in keyof C]: ClueList | ListClues | Partition | number | FieldClue;
};

/** A clue at the board with fields: `n` entries, each field a list of them. */
export interface FieldClue {
  readonly n: number;
  readonly [field: string]: number | readonly number[];
}

/** The clues of kind `kind`, which the caller knows is a clue kind and not a
 * partition. */
export const listOf = <C>(dealt: C, kind: keyof C): ClueList => dealt[kind] as ClueList;

/** What a fill game's compiled module offers the engine, over its clues
 * `C`. */
export interface FillModule<C> {
  /** The sort of element the answer's values sit on: a cell, or the edge
   * between two cells side by side. */
  readonly answerSort: "cell" | "edge";
  /** The units no value repeats in, those of every variation. */
  readonly units: readonly string[];
  /** The unit each variation adds, by the unit's name: a board has it only
   * where the variation is on (Solo's X, the diagonals). */
  readonly unitVariations?: Readonly<Record<string, string>>;
  /** The partition among the units: its name, and where the sizes fix it,
   * its blocks' width and height, each a number or a size the params give
   * (`blocks(r, c)`). A board that deals it reads it off its clues, which a
   * board with blocks does under a ruleset that deals it (Solo's Jigsaw). */
  readonly boxes?: {
    readonly name: string;
    readonly blocks?: readonly [number | string, number | string];
    /** The variation under which a board with blocks deals them instead. */
    readonly dealtBy?: string;
  };
  readonly tiers: readonly string[];
  /** How the board is played: where `dealt` names a clue kind at a cell,
   * the cell is dealt holding it. */
  readonly play?: FillPlay;
  /** The values element `c` of the answer's sort may hold, as a bitmask
   * (bit `d`). */
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
  /** The deal, whose partition divided by drawn sizes, where it has one,
   * bounds the keypad of a domain that is a part's numbers. */
  readonly deal?: FillDeal;
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
  const { washed } = module;
  const secondary = module.play?.secondary;
  if (washed === undefined || secondary === undefined) return board.values;
  const sp = spaceOf(module, board);
  return Uint8Array.from(board.values, (v, c) =>
    v === 0 && washed(board.values, sp, board.dealt, c) ? secondary : v,
  );
}

/** A fill module with its ladder, as `describedLadder` reads it. Its ids are
 * any string, and a technique runs as a rung or on a cell by the list its id
 * is in (Light Up's bulb shines as it is placed), which `describedLadder`
 * reads apart; the type cannot say so for an id that is any string. */
export type LadderedFillModule<C> = FillModule<C> &
  Pick<CompiledLadder<string, never>, "ladder"> & {
    /** The scales it grades on besides `tiers`, each its tiers lowest first
     * (Solo's killer scale). */
    readonly scales?: Readonly<Record<string, readonly string[]>>;
    readonly placing: readonly { readonly id: string; readonly variation?: string }[];
    readonly striking: readonly { readonly id: string; readonly variation?: string }[];
    /** Each of the description's own techniques: whether it reads the
     * clues; the terms its firings say that name slots, which its words mark
     * in the margin beyond a line's end, and those that name a clue, by its
     * kind, which they mark where it is drawn; whether it places reading no notes,
     * so the walk offers it before they are set up; whether its steps
     * strike a value each, from every square it strikes it in; the one
     * rung its steps are recorded under, where that is not its id; and the
     * kind of rule it was placed as, by which the walk knows its own
     * singles. */
    readonly techniques: Readonly<
      Record<
        string,
        {
          readonly dealt: boolean;
          readonly kind?: string;
          readonly slotTerms?: readonly string[];
          readonly clueTerms?: Readonly<Record<string, string>>;
          readonly leads?: boolean;
          readonly byValue?: boolean;
          readonly rung?: string;
        }
      >
    >;
  };

export interface FillBoard<C> {
  readonly w: number;
  readonly h: number;
  readonly dealt: C;
  /** The variations on, by name: the params', which no move changes. */
  readonly variations: readonly string[];
  /** Each element's value, the description's, 0 where it has none: an
   * element of the answer's sort (`elementsOf`), numbered as the space
   * numbers it. */
  readonly values: Uint8Array;
  /** 1 where the element's domain leaves it one value, placed as the board
   * is dealt: no edit changes it. */
  readonly fixed: Uint8Array;
  /** The element each cell's mark names, `-1` where it has none. */
  readonly mark: Int32Array;
  /** Each open cell's candidate notes, bit `v` for value `v`, where the board
   * keeps them (`play.notes`, `notes.ts`); `null` where it keeps none. The
   * ladder never reads them. */
  readonly pencil: Int32Array | null;
  /** Of each clue kind the player may mark done (`play.done`, `done.ts`),
   * 1 a clue they marked, by its index in the kind's list. */
  readonly done: Readonly<Record<string, Uint8Array>>;
}

/** What a board's space is built from: its stored size, its clues, among
 * them the sizes its params give beyond the grid's, and its variations. */
export interface SpaceOf {
  readonly w: number;
  readonly h: number;
  readonly dealt: unknown;
  readonly variations: readonly string[];
}

/** The largest value a board on the space `sp` dealt `dealt` holds: the
 * top of its domain over every cell. */
export function topValue<C>(module: FillModule<C>, sp: GridSpace, dealt: C): number {
  let mask = 0;
  for (const c of sp.cells) mask |= module.domainOf(sp, dealt, c);
  return 31 - Math.clz32(mask);
}

/** The values a clue one a value is dealt for at each element on a board
 * dealt `dealt` (the desc's `values`), 0 where no kind is one a value: the
 * domain of a module with one is a size's, so the sizes alone give it. */
export const perValuesOf = <C>(
  module: FillModule<C>,
  sp: GridSpace,
  dealt: C,
): number => (module.deal?.perValue === undefined ? 0 : topValue(module, sp, dealt));

/** Each module's units by the variations on, kept, since a space is found
 * again by its units' identity first. */
const unitsKept = new WeakMap<object, Map<string, readonly string[]>>();

/** The space a board of `module`'s is read on: the units its variations
 * have, its boxes cut as its sizes say. */
export function spaceOf<C>(module: FillModule<C>, b: SpaceOf): GridSpace {
  const by = module.unitVariations;
  let units = module.units;
  if (by !== undefined) {
    let kept = unitsKept.get(module);
    if (kept === undefined) {
      kept = new Map();
      unitsKept.set(module, kept);
    }
    const key = b.variations.join();
    const known = kept.get(key);
    if (known === undefined) {
      units = module.units.filter(
        (u) => by[u] === undefined || b.variations.includes(by[u]),
      );
      kept.set(key, units);
    } else units = known;
  }
  const { boxes } = module;
  if (boxes === undefined) return describedSpace(units, b.w, b.h);
  const sizes = b.dealt as Readonly<Record<string, unknown>>;
  const dealt = sizes[boxes.name] as Partition | undefined;
  if (dealt !== undefined) return describedSpace(units, b.w, b.h, dealt.cells);
  // Before the deal divides it, a board has no boxes yet.
  if (
    boxes.blocks === undefined ||
    (boxes.dealtBy !== undefined && b.variations.includes(boxes.dealtBy))
  )
    return describedSpace(units, b.w, b.h);
  const [bw, bh] = boxes.blocks.map((a) => {
    const v = typeof a === "number" ? a : sizes[a];
    if (typeof v !== "number") throw new Error(`boxes: no size ${a} on the board`);
    return v;
  });
  if (bw * bh !== b.w || b.w !== b.h)
    throw new Error(`boxes: blocks ${bw} by ${bh} do not tile a ${b.w}x${b.h} board`);
  return describedSpace(units, b.w, b.h, blocks(bw, bh));
}

/** Each cell's part of the partition a board is walled by: the one among
 * its units where it has one (a Sudoku's blocks, cut or dealt), else the
 * first it deals; null where it has neither, or the partition is one a
 * variation deals and the board is without it. */
export function walledParts<C>(
  module: FillModule<C>,
  b: SpaceOf,
): ArrayLike<number> | null {
  const dealt = b.dealt as Readonly<Record<string, unknown>>;
  const name = module.boxes?.name ?? module.deal?.partitions?.[0];
  if (name === undefined) return null;
  const parts = dealt[name] as Partition | undefined;
  if (parts !== undefined) return parts.of;
  if (module.boxes === undefined) return null;
  const sp = spaceOf(module, b);
  return Int32Array.from(sp.cells, (c) => sp.boxes.indexOf(sp.boxOf[c]));
}

/** The space a board of the params `p` is read on, before it is dealt. */
export const paramSpaceOf = <C>(
  module: FillModule<C>,
  p: {
    w: number;
    h: number;
    sizes?: Readonly<Record<string, number>>;
    variations?: readonly string[];
  },
): GridSpace =>
  spaceOf(module, {
    ...boardSizeOf(module, p),
    dealt: p.sizes ?? {},
    variations: p.variations ?? [],
  });

/** The elements of `sp` the answer's values sit on, by the module's sort. */
export const elementsOf = (
  module: { readonly answerSort: "cell" | "edge" },
  sp: GridSpace,
): readonly number[] => (module.answerSort === "edge" ? sp.edges : sp.cells);

/** The bits `mask` holds one of, as that value, or 0 where it holds more or
 * none. */
const onlyValue = (mask: number): number =>
  mask !== 0 && (mask & (mask - 1)) === 0 ? 31 - Math.clz32(mask) : 0;

/** A fresh `w` by `h` board on the clues `dealt` with `variations` on, each
 * element its domain leaves one value, and each cell the `play.dealt` kind
 * sits at, holding it. */
export function newBoard<C>(
  module: FillModule<C>,
  w: number,
  h: number,
  dealt: C,
  variations: readonly string[] = [],
): FillBoard<C> {
  const sp = describedSpace(module.units, w, h);
  const elements = elementsOf(module, sp);
  const values = new Uint8Array(elements.length);
  const fixed = new Uint8Array(elements.length);
  for (const c of elements) {
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
    pencil: module.play?.notes === true ? new Int32Array(w * h) : null,
    done: Object.fromEntries(
      Object.keys(module.play?.done ?? {}).map((k) => [
        k,
        new Uint8Array(listOf(dealt, k as keyof C).at.length),
      ]),
    ),
  };
}

/** The board as dealt: its fixed cells alone, and no marks, notes or clues
 * marked done. */
export function asDealt<C>(board: FillBoard<C>): FillBoard<C> {
  return {
    ...board,
    values: Uint8Array.from(board.values, (v, c) => (board.fixed[c] ? v : 0)),
    mark: new Int32Array(board.mark.length).fill(-1),
    pencil: board.pencil === null ? null : new Int32Array(board.pencil.length),
    done: Object.fromEntries(
      Object.entries(board.done).map(([kind, flags]) => [
        kind,
        new Uint8Array(flags.length),
      ]),
    ),
  };
}

/** Every value any element of the board may hold, as a bitmask. */
function domainMask<C>(module: FillModule<C>, sp: GridSpace, dealt: C): number {
  let mask = 0;
  for (const c of elementsOf(module, sp)) mask |= module.domainOf(sp, dealt, c);
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
  const marks = new CellMarks(
    sp,
    domainMask(module, sp, board.dealt),
    values,
    null,
    module.answerSort,
  );
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
  cap: number | Caps,
): Solved {
  const { marks, ok, entries } = marksOf(module, board);
  const out = (verdict: DifficultyVerdict): Solved => ({
    verdict,
    values: Uint8Array.from(marks.grid),
    mark: marks.marked.slice(),
  });
  if (!ok) return out("impossible");
  const caps = typeof cap === "number" ? capsOf(module, cap) : cap;
  if (runLadder(marks, ladderTechniques(marks, entries, caps, {})))
    return out("impossible");
  if (marks.grid.includes(0)) return out("unsolved");
  return out(isAnswerOf(module, board, marks.grid) ? "solved" : "impossible");
}

/**
 * The caps the ladder runs at on a board of tier `tier`: the description's
 * own tiers at `tier`, and each of its other scales at its top. No player
 * asks a tier on another scale, so every board is asked the top of it, as
 * upstream's solo.c asks every Killer board `DIFF_KINTERSECT`.
 */
export function capsOf<C>(module: LadderedFillModule<C>, tier: number): Caps {
  const caps: Record<string, number> = { [TIERS]: tier };
  for (const [scale, tiers] of Object.entries(module.scales ?? {}))
    caps[scale] = tiers.length - 1;
  return caps;
}

/** The ladder on the board's clues with its variations on, each library
 * technique the description places (`use: latin.*`) the engine's. */
export const ladderOf = <C>(module: LadderedFillModule<C>, board: FillBoard<C>) =>
  describedLadder(
    module as unknown as CompiledLadder<string, string, string>,
    board.dealt as never,
    {},
    LATIN_LIBRARY,
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

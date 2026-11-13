/**
 * Magnets' solver: the ladder `magnets.description.yaml` states, compiled,
 * on the engine's marks and runner (`engine/ladder-runtime.ts`), and the
 * answer check its rules compile to.
 *
 * Easy is upstream's: a square down to one value, a line whose count is met
 * or has just enough room, and a line's one odd gap. Normal adds its count of
 * the tiles along and across a line. A tile's two ends are kept opposite as
 * values are placed and as they are struck, so a tile a player marks `?` is
 * neutral struck from both ends. Every board is finished by the ladder: the
 * game has no search tier.
 */

import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
  partition,
  perPlace,
  rangeMask,
} from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  placingRung,
  runLadder,
  strikingRung,
  TIERS,
  uncluedPlacingRung,
} from "../../engine/ladder-runtime.ts";
import type { GameStatus } from "../../engine/types.ts";
import * as magnets from "./magnets.compiled.ts";
import {
  COLUMN,
  GS_SET,
  type MagnetsCommon,
  type MagnetsState,
  NEGATIVE,
  NEUTRAL,
  POSITIVE,
  ROW,
} from "./state.ts";

/** A row or column, named the way the hint names it. */
export interface MagnetsLine {
  roworcol: number;
  num: number;
}

/**
 * The premise a technique was acting on when it changed the board: what the
 * hint narrates. `which` is a pole or neutral in the game's own values.
 */
export type MagnetsReason =
  /** Two values ruled out of an open square leave it one. */
  | { kind: "force"; cell: number }
  /** The line already has all the `which` its clue allows. */
  | { kind: "lineFull"; line: MagnetsLine; which: number }
  /** The line needs exactly as many more `which` as it has squares that can
   * still be one. */
  | { kind: "lineExact"; line: MagnetsLine; which: number }
  /** The line's +/− count is met once its marked magnets are counted. */
  | { kind: "magnetsFill"; line: MagnetsLine }
  /** One odd-length gap in a line of poles, which needs one more `which`. */
  | { kind: "oddGap"; line: MagnetsLine; which: number }
  /** The line has room for one more neutral square, so no domino lying along
   * it is neutral. */
  | { kind: "oneNeutralLeft"; line: MagnetsLine }
  /** The line needs as many more `which` as it has undecided dominoes. */
  | { kind: "everyDominoNeeded"; line: MagnetsLine; which: number }
  /** …and a domino that can take `which` at only one end takes it there. */
  | { kind: "onlyEndLeft"; line: MagnetsLine; which: number };

/** A square's value as the description reads it: + is 1, neutral 2 and −
 * 3, so a tile's other end holds 4 less. */
export function cellValue(which: number): number {
  return which === POSITIVE ? 1 : which === NEGATIVE ? 3 : 2;
}

/** A value the description reads, as the game's pole or neutral. */
export function whichOf(d: number): number {
  return d === 1 ? POSITIVE : d === 3 ? NEGATIVE : NEUTRAL;
}

/** The space a board's ladder runs on: its rows, then its columns. */
export function magnetsSpace(w: number, h: number): GridSpace {
  return describedSpace(magnets.units, w, h);
}

/** The space's line `L` as the hint names it. */
function lineOf(sp: GridSpace, L: number): MagnetsLine {
  return L < sp.h ? { roworcol: ROW, num: L } : { roworcol: COLUMN, num: L - sp.h };
}

/**
 * The board as the description deals it: its tiles, and each line's count of
 * + and of −, with the neutral squares' count where a line has both.
 */
export function dealtOf(w: number, h: number, common: MagnetsCommon): magnets.Dealt {
  const { dominoes, rowcount, colcount } = common;
  const tiles: number[][] = [];
  for (let i = 0; i < w * h; i++) {
    const j = dominoes[i];
    if (j === i) tiles.push([i]);
    else if (j > i) tiles.push([i, j]);
  }
  const at: number[] = [];
  const v: number[] = [];
  const deal = (L: number, counts: Int32Array, base: number) => {
    for (const which of [POSITIVE, NEUTRAL, NEGATIVE]) {
      const n = counts[base + which];
      if (n < 0) continue;
      at.push(perPlace(L, cellValue(which)));
      v.push(n);
    }
  };
  for (let y = 0; y < h; y++) deal(y, rowcount, y * 3);
  for (let x = 0; x < w; x++) deal(h + x, colcount, x * 3);
  return {
    tile: partition(tiles, w * h),
    count: clueList(at, v, perPlace(w + h, 0)),
  };
}

/** The ladder over the dealt board, each technique with the hint's reason
 * for it. */
export function magnetsLadder(dl: magnets.Dealt): Ladder {
  return describedLadder(magnets, {
    pair: placingRung(magnets.pair, dl),
    repel: uncluedPlacingRung(magnets.repel),
    tile: strikingRung(magnets.tile, dl),
    single: compiledRung(magnets.single, dl),
    count: compiledRung(magnets.count, dl),
    oddGap: compiledRung(magnets.oddGap, dl),
    marked: compiledRung(magnets.marked, dl),
    oneNeutral: compiledRung(magnets.oneNeutral, dl),
    everyTile: compiledRung(magnets.everyTile, dl),
    onlyEnd: compiledRung(magnets.onlyEnd, dl),
  });
}

/** The premise a firing acted on, from what its technique said. */
export function reasonOf(
  sp: GridSpace,
  kind: (typeof magnets.SAYS_KINDS)[number],
  terms: magnets.SaysById[keyof magnets.SaysById]["terms"],
): MagnetsReason {
  const { c, L, d } = terms as { c: number; L: number; d: number };
  switch (kind) {
    case "single":
      return { kind: "force", cell: c };
    case "count.full":
      return { kind: "lineFull", line: lineOf(sp, L), which: whichOf(d) };
    case "count.exact":
      return { kind: "lineExact", line: lineOf(sp, L), which: whichOf(d) };
    case "oddGap":
      return { kind: "oddGap", line: lineOf(sp, L), which: whichOf(d) };
    case "marked":
      return { kind: "magnetsFill", line: lineOf(sp, L) };
    case "oneNeutral":
      return { kind: "oneNeutralLeft", line: lineOf(sp, L) };
    case "everyTile":
      return { kind: "everyDominoNeeded", line: lineOf(sp, L), which: whichOf(d) };
    case "onlyEnd":
      return { kind: "onlyEndLeft", line: lineOf(sp, L), which: whichOf(d) };
  }
}

/** The marks over `values`, every open square holding what its tile allows
 * and each value on it placed; `null` where two of them clash. */
export function magnetsMarks(
  sp: GridSpace,
  dl: magnets.Dealt,
  ladder: Ladder,
  values: Uint8Array,
): CellMarks | null {
  const m = new CellMarks(sp, rangeMask(1, 3), values);
  m.placing = ladder.placing;
  m.striking = ladder.striking;
  return m.seed(values, (c) => magnets.domainOf(sp, dl, c)) ? m : null;
}

/** The values a board starts from: the squares no tile covers, neutral. */
export function givenValues(w: number, h: number, common: MagnetsCommon): Uint8Array {
  return Uint8Array.from({ length: w * h }, (_, i) =>
    common.dominoes[i] === i ? cellValue(NEUTRAL) : 0,
  );
}

/** What a run of the ladder reached: `1` the board's one answer, `0` stuck
 * short of one, `-1` a contradiction. */
export type Verdict = -1 | 0 | 1;

/** Run the ladder on `m` to a fixpoint, no harder than `cap`, and say what
 * it reached. */
export function deduce(
  m: CellMarks,
  ladder: Ladder,
  dl: magnets.Dealt,
  cap: number,
  firings?: FiringTally,
): Verdict {
  const techniques = ladderTechniques(m, ladder.entries, { [TIERS]: cap }, {});
  if (runLadder(m, techniques, { firings })) return -1;
  if (m.grid.includes(0)) return 0;
  return magnets.isAnswer(m.grid, m.sp, dl) ? 1 : -1;
}

/** The ladder's verdict on a board from its clues alone, no harder than
 * `cap`, and the grid it reached in the game's values (neutral where it
 * placed nothing). */
export function solveMagnets(
  w: number,
  h: number,
  common: MagnetsCommon,
  cap: number,
  firings?: FiringTally,
): { verdict: Verdict; grid: Int32Array } {
  const dl = dealtOf(w, h, common);
  const ladder = magnetsLadder(dl);
  const m = magnetsMarks(magnetsSpace(w, h), dl, ladder, givenValues(w, h, common));
  if (m === null) return { verdict: -1, grid: new Int32Array(w * h) };
  const verdict = deduce(m, ladder, dl, cap, firings);
  return { verdict, grid: Int32Array.from(m.grid, whichOf) };
}

/** The values a state's player has placed, 0 where a square is open. */
export function placedValues(state: MagnetsState): Uint8Array {
  return Uint8Array.from(state.grid, (which, i) =>
    state.flags[i] & GS_SET ? cellValue(which) : 0,
  );
}

/** Whether a state's tiles are an answer to its board, by the rules the
 * description compiles to. */
export function isSolved(state: MagnetsState): boolean {
  const { w, h, common } = state;
  return magnets.isAnswer(
    placedValues(state),
    magnetsSpace(w, h),
    dealtOf(w, h, common),
  );
}

export function status(state: MagnetsState): GameStatus {
  return isSolved(state) ? "solved" : "ongoing";
}

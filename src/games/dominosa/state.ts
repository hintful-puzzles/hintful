/**
 * dominosa — state, params, desc codec.
 *
 * A Dominosa board is an `(n+2) × (n+1)` grid of clue numbers (each `0…n`).
 * The player partitions it into 2×1 dominoes so the placed set is exactly the
 * `DCOUNT(n)` distinct number-pairs `0-0 … n-n`, one of each. `w·h = 2·DCOUNT`,
 * so a full cover uses every square.
 *
 * State layout mirrors upstream: the clue `numbers` are immutable once the game
 * is made (shared frozen across all states), while `grid` (each square → its
 * domino partner, or itself when unpaired) and `edges` (barrier annotations)
 * are cloned per move.
 */

import { digitValue, parseLeadingInt } from "../../engine/decimal.ts";
import {
  DESC_OUT_OF_RANGE,
  type DescParse,
  descBadCharacter,
  descValue,
  puzzleDescError,
} from "../../engine/desc-error.ts";
import { type DescReader, readDesc } from "../../engine/desc-reader.ts";
import { tierNames } from "../../engine/difficulty.ts";
import type { PresetMenu } from "../../engine/game.ts";
import type { GridCursor } from "../../engine/pointer.ts";

// --- combinatorial helpers (upstream TRI / DCOUNT / DINDEX macros) ----------

/** nth triangular number. */
export const TRI = (n: number): number => (n * (n + 1)) / 2;
/** Number of distinct dominoes for maximum face value `n`. */
export const DCOUNT = (n: number): number => TRI(n + 1);
/** Map an unordered number pair to its unique domino index (0 upward). */
export const DINDEX = (a: number, b: number): number =>
  TRI(Math.max(a, b)) + Math.min(a, b);

// --- barrier-edge bits (upstream EDGE_*) ------------------------------------

export const EDGE_L = 0x100;
export const EDGE_R = 0x200;
export const EDGE_T = 0x400;
export const EDGE_B = 0x800;

// --- difficulty -------------------------------------------------------------

export const DIFF_TRIVIAL = 0;
export const DIFF_BASIC = 1;
export const DIFF_HARD = 2;
export const DIFF_EXTREME = 3;
export const DIFF_AMBIGUOUS = 4;
export const DIFFCOUNT = 5;

/**
 * Tier names in enum order: four conventional tiers plus **Ambiguous**.
 *
 * The fourth is `Unreasonable` where upstream says `Extreme`: its
 * `deduceForcingChain` rung follows an implication closure until a chain
 * repeats a domino, a conclusion reached by propagating rather than by looking,
 * and the collection reserves that word for a tier that may require it. It is
 * the top *difficulty* even though Ambiguous sits after it, because Ambiguous is
 * not a harder rung but a relaxation of what the puzzle promises (the generator
 * skips the uniqueness search). The difficulty contract's `nonUniqueTiers`
 * declares that, which is also what exempts it from the tier-name guard.
 *
 * Only the names differ from upstream; the encoding chars are upstream's.
 */
export const DIFF_NAMES = [...tierNames(4, { search: true }), "Ambiguous"];
/** Encoding chars in enum order (upstream `dominosa_diffchars`). */
const DIFF_CHARS = "tbhea";

// --- params -----------------------------------------------------------------

export interface DominosaParams {
  /** Maximum face number on a domino. */
  n: number;
  diff: number;
  /** The board is `n+1` wide and `n+2` tall, rather than upstream's `n+2` wide
   * and `n+1` tall. Encoded as a `t`, so an id from before it existed still
   * decodes to the wide board its desc was written for. */
  tall: boolean;
}

/** The fields that fix the board's dimensions. */
export type DominosaShape = Pick<DominosaParams, "n" | "tall">;

export function boardSize({ n, tall }: DominosaShape): { w: number; h: number } {
  return tall ? { w: n + 1, h: n + 2 } : { w: n + 2, h: n + 1 };
}

export function defaultParams(): DominosaParams {
  return { n: 6, diff: DIFF_BASIC, tall: true };
}

const PRESETS: ReadonlyArray<readonly [number, number]> = [
  [3, DIFF_TRIVIAL],
  [4, DIFF_TRIVIAL],
  [5, DIFF_TRIVIAL],
  [6, DIFF_TRIVIAL],
  [4, DIFF_BASIC],
  [5, DIFF_BASIC],
  [6, DIFF_BASIC],
  [7, DIFF_BASIC],
  [8, DIFF_BASIC],
  [9, DIFF_BASIC],
  [6, DIFF_HARD],
  [6, DIFF_EXTREME],
];

export function presets(): PresetMenu<DominosaParams> {
  return {
    title: "Dominosa",
    submenu: PRESETS.map(([n, diff]) => ({ params: { n, diff, tall: true } })),
  };
}

export function encodeParams(p: DominosaParams, full: boolean): string {
  let s = `${p.n}${p.tall ? "t" : ""}`;
  if (full) s += `d${DIFF_CHARS[p.diff]}`;
  return s;
}

export function decodeParams(str: string): DominosaParams {
  const { value, next } = parseLeadingInt(str, 0);
  const n = next > 0 ? value : 6;
  let i = next;
  let diff = DIFF_BASIC;
  let tall = false;
  while (i < str.length) {
    const c = str[i++];
    if (c === "t") {
      tall = true;
    } else if (c === "a") {
      // Legacy encoding from before the difficulty system.
      diff = DIFF_AMBIGUOUS;
    } else if (c === "d") {
      diff = DIFFCOUNT + 1; // ...which is invalid, unless a known char follows
      if (i < str.length) {
        const idx = DIFF_CHARS.indexOf(str[i]);
        if (idx >= 0) diff = idx;
        i++;
      }
    }
  }
  return { n, diff, tall };
}

export function validateParams(p: DominosaParams, _full: boolean): string | null {
  // Mirror upstream's overflow guard against a huge grid.
  const INT_MAX = 0x7fffffff;
  if (p.n > INT_MAX - 2 || p.n + 2 > Math.floor(INT_MAX / (p.n + 1)))
    return "Maximum number on dominoes must not be unreasonably large.";
  return null;
}

// --- desc codec -------------------------------------------------------------

/**
 * The row-major clue numbers, a number under 10 as its digit and a larger one
 * in brackets, as {@link encodeNumbers} writes them. They must be the halves of
 * one full set of dominoes: every number `0..n` exactly `n+2` times.
 */
function parseDesc(p: DominosaParams, desc: string): DescParse<Int32Array> {
  const { n } = p;
  const { w, h } = boardSize(p);
  // `r` is annotated so that `r.fail` narrows `digit`.
  return readDesc(desc, (r: DescReader) => {
    const numbers = new Int32Array(w * h);
    const occ = new Int32Array(n + 1);
    for (let i = 0; i < numbers.length; i++) {
      let j: number;
      if (r.accept("[")) {
        j = r.int(10, n);
        r.expect("]");
      } else {
        const c = r.char();
        const digit = digitValue(c);
        if (digit === null) r.fail(descBadCharacter(c));
        if (digit > n) r.fail(DESC_OUT_OF_RANGE);
        j = digit;
      }
      numbers[i] = j;
      occ[j]++;
    }
    r.end();
    if (occ.some((k) => k !== n + 2)) r.fail(UNBALANCED);
    return numbers;
  });
}

const UNBALANCED = puzzleDescError(
  "This game ID's numbers can't be the halves of one full set of dominoes.",
);

/** Encode a numbers grid back to the desc string (bracket-escaping ≥10). */
export function encodeNumbers(numbers: Int32Array | number[]): string {
  return Array.from(numbers, (k) => (k < 10 ? String(k) : `[${k}]`)).join("");
}

// --- state ------------------------------------------------------------------

export interface DominosaState {
  params: DominosaParams;
  w: number;
  h: number;
  /** Frozen clue numbers, `w·h`, shared across all states of this game. */
  numbers: Int32Array;
  /** Each square → its domino partner's index, or itself when unpaired. */
  grid: Int32Array;
  /** Barrier-edge bits (`EDGE_*`) per square. */
  edges: Int32Array;
}

export function newState(p: DominosaParams, desc: string): DominosaState {
  const { w, h } = boardSize(p);
  const wh = w * h;
  const numbers = descValue(parseDesc(p, desc));
  const grid = new Int32Array(wh);
  for (let i = 0; i < wh; i++) grid[i] = i;
  return {
    params: p,
    w,
    h,
    numbers,
    grid,
    edges: new Int32Array(wh),
  };
}

/** `numbers` is frozen, so every state of a game shares it. */
export function cloneState(s: DominosaState): DominosaState {
  return { ...s, grid: s.grid.slice(), edges: s.edges.slice() };
}

/** Solved once every domino of the set has been placed. */
export function status(s: DominosaState): "solved" | "ongoing" {
  const used = new Set<number>();
  for (let i = 0; i < s.w * s.h; i++)
    if (s.grid[i] > i) used.add(DINDEX(s.numbers[i], s.numbers[s.grid[i]]));
  return used.size === DCOUNT(s.params.n) ? "solved" : "ongoing";
}

// --- move / ui / mistake types ----------------------------------------------

export type DominosaMove =
  | { type: "domino"; d1: number; d2: number }
  | { type: "edge"; d1: number; d2: number }
  | { type: "solve"; dominoes: ReadonlyArray<readonly [number, number]> };

export interface DominosaUi {
  /** Half-grid cursor position (`0…2w−2` × `0…2h−2`). */
  cursor: GridCursor;
  /** The two value-highlight slots (a face number, or −1 for empty). */
  highlight1: number;
  highlight2: number;
  /** The reference-panel spotlight: a domino index (`0…DCOUNT-1`) whose
   * candidate placements are boxed on the board, or `null` for none.
   * Ui-only, never a move, never serialized; cleared on completion. */
  highlightPair: number | null;
}

/** A player-placed domino cell that contradicts the unique solution. */
export interface DominosaMistake {
  index: number;
}

/**
 * Types and pure state helpers for Keen (KenKen / Inshi No Heya) — the
 * state/codec parts of `keen.c`.
 *
 * A board is a `w × w` Latin square of digits `1..w`. The grid is partitioned
 * into contiguous *cages* (a disjoint-set forest, {@link KeenClues.dsf}); each
 * cage carries an arithmetic clue — a target value and one of add / subtract /
 * multiply / divide — that its digits must satisfy. Subtraction and division
 * cages are always dominoes (area 2). The cage partition + clues are immutable
 * (shared by reference); the player's working digit (`grid`) and pencil-mark
 * bitmap (`pencil`) are cloned per move. Keen has **no givens** — every cell
 * starts blank.
 */

import { Dsf } from "../../engine/board/dsf.ts";
import {
  DESC_TOO_LONG,
  type DescParse,
  descValue,
  puzzleDescError,
} from "../../engine/contract/desc-error.ts";
import { difficultyItem, noSuchTier } from "../../engine/contract/difficulty.ts";
import type { ParamConfigItem } from "../../engine/contract/game.ts";
import type { RulesOf } from "../../engine/contract/rules.ts";
import { isDigit } from "../../engine/game-id/decimal.ts";
import { type DescReader, readDesc } from "../../engine/game-id/desc-reader.ts";
import { numberItem, squareSize } from "../../engine/game-id/params.ts";
import { choice, flag, paramsCodec, size } from "../../engine/game-id/params-codec.ts";
import {
  type CandidateReading,
  DEFAULT_CANDIDATE_READING,
} from "../../engine/hint/candidate-hint.ts";
import type { GridCursor } from "../../engine/input/pointer.ts";
import { newCursor } from "../../engine/input/pointer.ts";
import {
  type ClueList,
  clueList,
  partition,
} from "../../engine/solve/describe-runtime.ts";
import { describedRules } from "../../engine/solve/described-rules.ts";
import * as keen from "../../generated/games/keen/keen.compiled.ts";

// --- difficulty ------------------------------------------------------------

export type Difficulty = "easy" | "normal" | "hard" | "extreme" | "unreasonable";

export const DIFF_EASY = keen.TIER.easy;
export const DIFF_NORMAL = keen.TIER.normal;
export const DIFF_TRICKY = keen.TIER.tricky; // upstream's DIFF_HARD
export const DIFF_HARD = keen.TIER.hard; // upstream's DIFF_EXTREME
export const DIFF_UNREASONABLE = keen.TIER.unreasonable;

// Upstream's keen_diffchars, indexed by level.
const DIFF_CHARS = "enhxu";
const DIFF_NAMES = keen.tiers;
const DIFFS: Difficulty[] = ["easy", "normal", "hard", "extreme", "unreasonable"];

export function diffToLevel(d: Difficulty): number {
  const i = DIFFS.indexOf(d);
  return i < 0 ? DIFF_NORMAL : i;
}
function diffFromLevel(level: number): Difficulty {
  return DIFFS[level] ?? "normal";
}

// --- clue packing (upstream C_* / CMASK) -----------------------------------
// A clue is a single packed number: the top bits hold the operation, the rest
// the target value. The ordering (ADD/MUL before SUB/DIV, DIV last) is
// load-bearing for the generator's balanced clue assignment, so it is kept.

export const C_ADD = 0x00000000;
export const C_MUL = 0x20000000;
export const C_SUB = 0x40000000;
export const C_DIV = 0x60000000;
export const CMASK = 0x60000000;

export function clueOp(clue: number): number {
  return clue & CMASK;
}
export function clueVal(clue: number): number {
  return clue & ~CMASK;
}

/** Maximum cage area (upstream `MAXBLK`). */
export const MAXBLK = 6;

// --- params ----------------------------------------------------------------

export interface KeenParams {
  w: number;
  diff: Difficulty;
  multiplicationOnly: boolean;
}

export function defaultParams(): KeenParams {
  return { w: 6, diff: "normal", multiplicationOnly: false };
}

export const paramConfig: ParamConfigItem<KeenParams>[] = [
  numberItem<KeenParams>("grid-size", "Grid size", "w", {
    doc: "Width and height of the grid, which is also the largest number in it. A 3x3 has no puzzles above Normal.",
    // One digit per cell.
    bounds: { min: 3, max: 9 },
    label: { slot: "size", words: squareSize("w") },
  }),
  difficultyItem(DIFF_NAMES, {
    get: (p: KeenParams) => diffToLevel(p.diff),
    set: (p: KeenParams, tier: number) => {
      p.diff = diffFromLevel(tier);
    },
  }),
  {
    kw: "multiplication-only",
    name: "Multiplication only",
    type: "boolean",
    doc: "When enabled, every cage's clue is a product: no sums, differences or ratios. Such puzzles are rare above Tricky, and at 9x9 above Normal: except at 4x4 and 6x6 the first can take a quarter of a minute to appear, and a 9x9 above Tricky a minute or two.",
    label: {
      slot: "tail",
      words: (p) => (p.multiplicationOnly ? "multiplication only" : null),
    },
    get: (p) => p.multiplicationOnly,
    set: (p, v) => {
      p.multiplicationOnly = v;
    },
  },
];

/** The order, then the generator-only difficulty and multiplication letters. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  size(paramConfig, "grid-size"),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true }),
  flag(paramConfig, "m", "multiplication-only", { full: true }),
]);

export function validateParams(p: KeenParams, full: boolean): string | null {
  const level = diffToLevel(p.diff);
  // Measured 2026-10-05: none in 50,000 boards built at each tier above
  // Normal, with every operation and with multiplication alone.
  if (full && p.w === 3 && level > DIFF_NORMAL)
    return noSuchTier("3x3 puzzle", DIFF_NAMES[level]);
  // A 9x9 with multiplication alone is the slowest above Tricky, and is
  // dealt: measured 2026-10-20 under the deal's deadline, twelve deals a
  // tier, Hard took 17 s on average and none gave up, Unreasonable 36 s and
  // two of twelve gave up.
  return null;
}

// --- block-structure codec -------------------------------------------------

/**
 * Build, for the dsf over `a` cells, a map `minimal[i]` = the smallest-indexed
 * cell in `i`'s class (upstream `dsf_minimal`). Keen stores each cage's clue at
 * its minimal cell and the desc lists clues in minimal-cell order, so this
 * identity, not just connectivity, is load-bearing. Nothing reads a minimal
 * mid-merge, so it is computed once after all merges: in an ascending pass,
 * the first cell seen for each root is its minimum.
 */
export function buildMinimal(dsf: Dsf, a: number): Int32Array {
  const rootMin = new Int32Array(a).fill(-1);
  for (let i = 0; i < a; i++) {
    const r = dsf.canonify(i);
    if (rootMin[r] < 0) rootMin[r] = i;
  }
  const minimal = new Int32Array(a);
  for (let i = 0; i < a; i++) minimal[i] = rootMin[dsf.canonify(i)];
  return minimal;
}

/** The two cells either side of internal edge `i`, in the order the block
 * structure lists edges: the `w·(w−1)` vertical edges in reading order, then
 * the `w·(w−1)` horizontal edges in transposed order. */
function edgeCells(i: number, w: number): [number, number] {
  if (i < w * (w - 1)) {
    const cell = ((i / (w - 1)) | 0) * w + (i % (w - 1));
    return [cell, cell + 1];
  }
  const cell = (i % (w - 1)) * w + ((i / (w - 1)) | 0) - w;
  return [cell, cell + w];
}

/**
 * Encode the cage partition as the pattern of internal dividing lines (in
 * {@link edgeCells} order) plus one terminating virtual edge. Runs of non-edges
 * between edges are encoded `_` (0), `a`..`y` (1..25), `z` (25 with no
 * following edge). A second pass compresses a run of the same letter into
 * `letter + count`. Faithful to upstream `encode_block_structure`.
 */
export function encodeBlockStructure(w: number, dsf: Dsf): string {
  let raw = "";
  let currrun = 0;
  const total = 2 * w * (w - 1);
  for (let i = 0; i <= total; i++) {
    // The last edge is the terminating virtual one.
    if (i < total && dsf.equivalent(...edgeCells(i, w))) {
      currrun++;
      continue;
    }
    while (currrun > 25) {
      raw += "z";
      currrun -= 25;
    }
    raw += currrun ? String.fromCharCode(96 + currrun) : "_";
    currrun = 0;
  }

  // Compression pass: replace a run of the same character with one copy plus a
  // repeat count where that is shorter.
  let out = "";
  let r = 0;
  while (r < raw.length) {
    const c = raw[r];
    out += c;
    let i = 0;
    while (r + i < raw.length && raw[r + i] === c) i++;
    r += i;
    if (i === 2) out += c;
    else if (i > 2) out += String(i);
  }
  return out;
}

/**
 * Read the block structure {@link encodeBlockStructure} writes into `dsf`:
 * run letters, each optionally followed by a repeat count of at least 3 (two
 * repeats are written as the letter twice), up to the terminating virtual edge.
 */
function readBlockStructure(r: DescReader, w: number, dsf: Dsf): void {
  const total = 2 * w * (w - 1);
  let pos = 0;
  while (pos < total + 1) {
    const letter = r.char((c) => c === "_" || (c >= "a" && c <= "z"));
    const run = letter === "_" ? 0 : letter.charCodeAt(0) - 96;
    const repeats = r.peekIs(isDigit) ? r.int(3, total + 1) : 1;
    for (let k = 0; k < repeats; k++) {
      for (let c = run; c > 0; c--) {
        if (pos >= total) r.fail(DESC_TOO_LONG);
        dsf.merge(...edgeCells(pos, w));
        pos++;
      }
      // 'z' is the run of 25 with no following edge.
      if (run !== 25) {
        pos++;
        if (pos > total + 1) r.fail(DESC_TOO_LONG);
      }
    }
  }
}

// --- clues -----------------------------------------------------------------

/** The immutable cage partition + per-cage clue, shared across cloned states. */
export interface KeenClues {
  w: number;
  dsf: Dsf;
  /** `minimal[i]` = the minimal-indexed cell of `i`'s cage (clue storage key). */
  minimal: Int32Array;
  /** `a`-length; the packed `op | value` clue at each cage's minimal cell, 0
   * elsewhere. */
  clues: Int32Array;
}

// --- state -----------------------------------------------------------------

export interface KeenState {
  params: KeenParams;
  clues: KeenClues;
  /** `w²` working digits (0 = blank); cloned per move. */
  grid: Int8Array;
  /** `w²` pencil-mark bitmaps (bit `1<<n` = mark `n`); cloned per move. */
  pencil: Int32Array;
}

export function cloneState(s: KeenState): KeenState {
  return {
    params: s.params,
    clues: s.clues, // immutable, shared
    grid: s.grid.slice(),
    pencil: s.pencil.slice(),
  };
}

// --- desc codec ------------------------------------------------------------

/** Each clue operation's letter in a desc, and back. */
export const LETTER_OF_OP: Record<number, string> = {
  [C_ADD]: "a",
  [C_MUL]: "m",
  [C_SUB]: "s",
  [C_DIV]: "d",
};
const OP_OF_LETTER: Record<string, number> = { a: C_ADD, m: C_MUL, s: C_SUB, d: C_DIV };

/** The largest value a clue with operation `op` can have on a cage of `size`
 * cells of a `w`-wide board. */
function clueMax(op: number, size: number, w: number): number {
  if (op === C_ADD) return size * w;
  if (op === C_MUL) return Math.min(w ** size, C_MUL - 1);
  if (op === C_SUB) return w - 1;
  return w;
}

/** The block structure, a comma, then each cage's clue (an operation letter
 * and its value) in the order of the cages' minimal cells. */
function parseDesc(p: KeenParams, desc: string): DescParse<KeenClues> {
  const w = p.w;
  const a = w * w;
  return readDesc(desc, (r) => {
    const dsf = new Dsf(a);
    readBlockStructure(r, w, dsf);
    r.expect(",");
    const minimal = buildMinimal(dsf, a);
    const clues = new Int32Array(a);
    for (let cell = 0; cell < a; cell++) {
      if (minimal[cell] !== cell) continue;
      const op = OP_OF_LETTER[r.char((c) => Object.hasOwn(OP_OF_LETTER, c))];
      const size = dsf.size(cell);
      if ((op === C_SUB || op === C_DIV) && size !== 2) {
        r.fail(
          puzzleDescError(
            "This game ID gives a subtraction or division clue to a block that isn't two cells.",
          ),
        );
      }
      // Two different digits differ by at least 1, and divide to at least 2.
      clues[cell] = op | r.int(op === C_DIV ? 2 : 1, clueMax(op, size, w));
    }
    r.end();
    return { w, dsf, minimal, clues };
  });
}

export function newState(p: KeenParams, desc: string): KeenState {
  const a = p.w * p.w;
  return {
    params: p,
    clues: descValue(parseDesc(p, desc)),
    grid: new Int8Array(a),
    pencil: new Int32Array(a),
  };
}

// --- status ----------------------------------------------------------------

/** The board as its rules read it: a digit is its value, a blank square
 * undecided. */
export const rules: RulesOf<KeenState> = describedRules(keen, {
  grid: (s) => Uint8Array.from(s.grid),
  size: (s) => [s.params.w, s.params.w],
  deals: (s) => [dealtOf(cagesOf(s.params.w, s.clues))],
});

export function status(s: KeenState): "solved" | "ongoing" {
  return rules.isAnswer(s, s.grid) ? "solved" : "ongoing";
}

// --- the board as its description deals it ---------------------------------

/** The cages in the order of their least cells, each cage's cells in reading
 * order, and its packed clue: what the techniques read and their reasons
 * quote. */
export interface Cages {
  cells: number[][];
  clues: number[];
}

export function cagesOf(w: number, kclues: KeenClues): Cages {
  const out: Cages = { cells: [], clues: [] };
  const index = new Map<number, number>();
  for (let i = 0; i < w * w; i++) {
    const m = kclues.minimal[i];
    let r = index.get(m);
    if (r === undefined) {
      r = out.cells.length;
      index.set(m, r);
      out.cells.push([]);
      out.clues.push(kclues.clues[m]);
    }
    out.cells[r].push(i);
  }
  return out;
}

type ClueKind = Exclude<keyof keen.Dealt, "cage">;

const KIND_OF_OP = new Map<number, ClueKind>([
  [C_ADD, "sum"],
  [C_MUL, "product"],
  [C_SUB, "difference"],
  [C_DIV, "quotient"],
]);

/** The cages as the description deals them: each cage's clue of the kind its
 * sign names, at the cage. */
export function dealtOf(cages: Cages): keen.Dealt {
  const n = cages.cells.length;
  const ofKind = (kind: ClueKind): ClueList => {
    const rs = cages.clues.flatMap((clue, r) =>
      KIND_OF_OP.get(clueOp(clue)) === kind ? [r] : [],
    );
    return clueList(
      rs,
      rs.map((r) => clueVal(cages.clues[r])),
      n,
    );
  };
  return {
    cage: partition(cages.cells, n),
    sum: ofKind("sum"),
    product: ofKind("product"),
    difference: ofKind("difference"),
    quotient: ofKind("quotient"),
  };
}

// --- moves -----------------------------------------------------------------

export type KeenMove =
  /** Enter (or pencil-toggle) digit `n` at `(x, y)`; `n = 0` clears. `autoElim`
   * (auto-pencil mode, decided at move-creation off the Ui preference so replay
   * is deterministic) additionally strikes digit `n` from the pencil marks of
   * every other cell in the same row and column when this is a real placement. */
  | {
      type: "set";
      x: number;
      y: number;
      n: number;
      pencil: boolean;
      autoElim?: boolean;
    }
  /** Fill in every empty cell's pencil marks (the `M` key / fill-all button). */
  | { type: "pencilAll" }
  /** Strike (clear) the listed pencil candidates atomically — a hint's
   * single-firing elimination; idempotent (clearing an absent bit is a no-op). */
  | { type: "pencilStrike"; marks: { x: number; y: number; n: number }[] }
  /** Write the listed pencil candidates, `pencilStrike`'s mirror: a hint's note
   * step. */
  | { type: "pencilAdd"; marks: { x: number; y: number; n: number }[] }
  /** Auto-solve to the given full grid. */
  | { type: "solve"; grid: number[] };

// --- ui --------------------------------------------------------------------

export interface KeenUi {
  cursor: GridCursor;
  pencilMode: boolean;
  cursorFromKeyboard: boolean;
  /** Preference (default on; upstream `PREF_PENCIL_KEEP_HIGHLIGHT`): keep the
   * mouse highlight after a pencil-mark change. */
  pencilKeepHighlight: boolean;
  /** Preference (default on): right-click toggles a *sticky* pencil mode. */
  pencilSticky: boolean;
  /** Preference (default off, so notes clear only via mark-all or a hint):
   * placing a digit strikes it from the pencil marks of every other cell in its
   * row and column. */
  autoPencil: boolean;
  /** Preference: how a hint pencils (`CandidateReading`). */
  candidateReading: CandidateReading;
}

export function newUi(_state: KeenState): KeenUi {
  return {
    cursor: newCursor(),
    pencilMode: false,
    cursorFromKeyboard: false,
    pencilKeepHighlight: true,
    pencilSticky: true,
    autoPencil: false,
    candidateReading: DEFAULT_CANDIDATE_READING,
  };
}

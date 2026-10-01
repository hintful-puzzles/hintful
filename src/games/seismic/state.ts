/**
 * Seismic — params, immutable state, and the description codec.
 *
 * Seismic implements *Hakyuu* / *Ripple Effect* (© 2013 Lennard Sprong,
 * `puzzles/unreleased/seismic.c`). The grid is partitioned into regions; a
 * region of size `N` holds one each of `1..N`, and two equal numbers are kept
 * apart — at least `Z` cells between two `Z`s on a row or column (**Seismic**
 * mode), or never orthogonally/diagonally adjacent (**Tectonic** mode, whose
 * regions hold at most five cells).
 *
 * **Regions live in the shared {@link Dsf}, with no minimal-element map.**
 * Seismic reads `canonify` only as a region *identifier*: walls come from a
 * membership comparison, the solver re-reads its root-indexed scratch arrays
 * through `canonify`, and every clue is per-cell. So union-by-size's root choice
 * is unobservable and the shared `Dsf` is byte-match faithful as-is
 * (docs/games/solver-and-generator.md § "The Latin family"). Don't add a
 * min-dsf variant to "restore fidelity".
 */

import type { CandidateReading } from "../../engine/candidate-hint.ts";
import { digitValue, isDigit } from "../../engine/decimal.ts";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  type DescError,
  type DescParse,
  descValue,
  descVerdict,
  puzzleDescError,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { difficultyItem, tierNames } from "../../engine/difficulty.ts";
import { Dsf } from "../../engine/dsf.ts";
import type { ParamConfigItem } from "../../engine/game.ts";
import { dimensionParamConfig } from "../../engine/params.ts";
import { choice, dims, letters, paramsCodec } from "../../engine/params-codec.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { newCursor } from "../../engine/pointer.ts";
import {
  encodeRegionWalls,
  gapLetters,
  readRegionWalls,
} from "../../engine/wall-runs.ts";

// --- difficulty ------------------------------------------------------------

/** Naked singles + hidden-single-in-region only. */
export const DIFF_EASY = 0;
/** Adds the trial-placement deduction. */
export const DIFF_NORMAL = 1;
export const DIFFCOUNT = 2;

export const DIFF_NAMES: readonly string[] = tierNames(2);
/** The difficulty letters `encodeParams` writes and `decodeParams` reads. */
const DIFF_CHARS = "eh";

// --- game mode -------------------------------------------------------------

export const MODE_SEISMIC = 0;
export const MODE_TECTONIC = 1;

export const MODE_NAMES: readonly string[] = ["Seismic", "Tectonic"];

// --- cell flags ------------------------------------------------------------

/** A given: the player may not edit it. */
export const FM_FIXED = 0x01;
/** Live error: this number appears twice in its region. */
export const FM_ERRORDUP = 0x02;
/** Live error: an equal number sits within this number's keep-apart range. */
export const FM_ERRORDIST = 0x04;
export const FM_ERRORMASK = FM_ERRORDUP | FM_ERRORDIST;

// --- candidate bit helpers -------------------------------------------------

/** The candidate bit for number `n` (`1..9`) — bit `n − 1`, as upstream. */
export const numBit = (n: number): number => 1 << (n - 1);
/** Every candidate a region of size `k` admits: bits for `1..k`. */
export const areaBits = (k: number): number => (1 << k) - 1;

// --- params ----------------------------------------------------------------

export interface SeismicParams {
  w: number;
  h: number;
  /** {@link DIFF_EASY} or {@link DIFF_NORMAL}. */
  diff: number;
  /** {@link MODE_SEISMIC} or {@link MODE_TECTONIC}. */
  mode: number;
}

export const PRESETS: readonly SeismicParams[] = [
  { w: 4, h: 4, diff: DIFF_EASY, mode: MODE_SEISMIC },
  { w: 4, h: 4, diff: DIFF_EASY, mode: MODE_TECTONIC },
  { w: 4, h: 4, diff: DIFF_NORMAL, mode: MODE_SEISMIC },
  { w: 4, h: 4, diff: DIFF_NORMAL, mode: MODE_TECTONIC },
  { w: 6, h: 6, diff: DIFF_EASY, mode: MODE_SEISMIC },
  { w: 6, h: 6, diff: DIFF_EASY, mode: MODE_TECTONIC },
  { w: 6, h: 6, diff: DIFF_NORMAL, mode: MODE_SEISMIC },
  { w: 6, h: 6, diff: DIFF_NORMAL, mode: MODE_TECTONIC },
  { w: 7, h: 7, diff: DIFF_EASY, mode: MODE_SEISMIC },
  { w: 7, h: 7, diff: DIFF_EASY, mode: MODE_TECTONIC },
  { w: 7, h: 7, diff: DIFF_NORMAL, mode: MODE_SEISMIC },
  { w: 7, h: 7, diff: DIFF_NORMAL, mode: MODE_TECTONIC },
  // Past upstream's range (its generator stopped at 7×7): the largest board whose
  // *worst* observed generation stays near two seconds — see `MAX_CELLS_SEISMIC`,
  // which is set by the tail and not the median.
  { w: 8, h: 8, diff: DIFF_EASY, mode: MODE_SEISMIC },
  { w: 8, h: 8, diff: DIFF_EASY, mode: MODE_TECTONIC },
  { w: 8, h: 8, diff: DIFF_NORMAL, mode: MODE_SEISMIC },
  { w: 8, h: 8, diff: DIFF_NORMAL, mode: MODE_TECTONIC },
];

const DEFAULT_PRESET = 4;

export function defaultParams(): SeismicParams {
  return { ...PRESETS[DEFAULT_PRESET] };
}

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<SeismicParams>[] = [
  ...dimensionParamConfig<SeismicParams>({
    doc: "Size of the grid in squares. The limit depends on the mode: Tectonic goes up to 100 squares, Seismic up to 64. Seismic's keep-apart rule gets harder to satisfy the larger the board, so past that size a puzzle may never be found at all. Large boards can take several seconds to generate, which is why the ready-made types in the ‘Type’ menu stop at 8×8.",
    bounds: { min: 4 },
  }),
  difficultyItem(DIFF_NAMES, "diff", {
    doc: "Higher difficulties require more complex reasoning.",
  }),
  {
    kw: "game-mode",
    name: "Game mode",
    type: "choices",
    choices: [...MODE_NAMES],
    doc: "Switch between Seismic and Tectonic mode.",
    label: { slot: "lead" },
    get: (p) => p.mode,
    set: (p, v) => {
      p.mode = v === MODE_TECTONIC ? MODE_TECTONIC : MODE_SEISMIC;
    },
  },
];

/** `WxH`, a `T` for Tectonic (Seismic writes nothing), then the generator-only
 * difficulty letter. Upstream deliberately parks an unknown letter out of range
 * so that it is refused with a reason rather than silently defaulted. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  letters(paramConfig, "game-mode", ["", "T"]),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, {
    full: true,
    invalid: DIFFCOUNT + 1,
  }),
]);

/**
 * The largest board each mode's generator will be asked for, in cells. Two
 * different questions decide these two numbers, and conflating them is the
 * mistake this comment exists to prevent.
 *
 * **Tectonic's bound answers "how long is too long?"** Every Tectonic size up to
 * 100 cells is *reachable* — an exhaustive sweep of the accepted `(w, h,
 * difficulty)` combinations had zero failures — but nine seeds per slow size
 * showed medians that look fine hiding tails that do not:
 *
 * | Tectonic    | median      | worst of 9 seeds |
 * |-------------|-------------|------------------|
 * | 8×8  (64)   | 0.3–1.8 s   | **2.3 s**        |
 * | 10×8 (80)   | 1.4–1.9 s   | 17.0 s           |
 * | 9×9  (81)   | 1.1–1.5 s   | 16.2 s           |
 * | 10×10 (100) | 4.9–6.2 s   | 18.3 s           |
 *
 * A long wait in the Custom dialog is acceptable (owner decision), so Tectonic's
 * bound is the reachability limit, 100 cells, which admits 10×10 — the size
 * upstream's own TODO names ("10x10 is a common size for Hakyuu puzzles").
 * `PRESETS` still stops at 8×8: a preset is a wait sprung on anyone opening the
 * Type menu, whereas a Custom size is a wait the player chose.
 *
 * **Seismic's bound answers "is it possible at all?", and no wait fixes it.**
 * 10×10 Seismic does not generate: six attempts across both difficulties each
 * ran ~16 s and then threw `RetryLimitExceeded`. Nine region-size distributions
 * were measured against it, and the best managed 34 fills per 100 partitions
 * only by pushing mean region size to 4.45 against upstream's 2.62 — visibly
 * changing the puzzle at every size. Small-region distributions are *provably*
 * infeasible there: mean size 2.26 puts 44 `1`s on a 10×10 against a hard
 * ceiling of 50 (no two `1`s orthogonally adjacent). Reaching it needs a
 * different fill algorithm, not a tuned constant (`audit-author-known-issues`
 * §3a names the experiment that would cost one).
 *
 * So Seismic stays at **64**, the largest area whose worst observed run stays
 * near two seconds. Its exhaustive sweep passed up to 72 cells, but on
 * single-seed timings already reaching 5.5 s, with no tail measurement behind
 * them. Do not raise it without repeating the slow sizes over several seeds: a
 * median-based bound has been shipped here and retracted once already.
 *
 * Refusing in `validateParams`, where the Custom dialog can show a reason, is
 * docs/games/solver-and-generator.md § "Unlucky, impossible, and load-bearing
 * validation"'s prescribed handling. Its cost: a hand-authored Seismic
 * `10x10:⟨desc⟩` game ID is refused too, since params are validated the same
 * way for a `:desc` id as for a `#seed` one.
 */
export const MAX_CELLS_SEISMIC = 64;

/** @see MAX_CELLS_SEISMIC — Tectonic's limit is reachability, not the fill. */
export const MAX_CELLS_TECTONIC = 100;

function maxCells(mode: number): number {
  return mode === MODE_TECTONIC ? MAX_CELLS_TECTONIC : MAX_CELLS_SEISMIC;
}

export function validateParams(p: SeismicParams, _full: boolean): string | null {
  const max = maxCells(p.mode);
  if (p.w * p.h > max)
    return `Width times height must be at most ${max} in ${MODE_NAMES[p.mode]} mode (the generator cannot reliably build a larger board)`;
  return null;
}

// --- state -----------------------------------------------------------------

/** The mutable board the solver and the generator work on — exactly the part of
 * `game_state` they touch. {@link SeismicState} satisfies it structurally, so a
 * cloned state can be handed straight to the solver. */
export interface SeismicBoard {
  readonly w: number;
  readonly h: number;
  readonly mode: number;
  /** The region partition. Never mutated during play. */
  readonly dsf: Dsf;
  /** Placed numbers, `0` = empty. */
  readonly grid: Uint8Array;
  /** `FM_*` bits. */
  readonly flags: Uint8Array;
  /** Candidate bitmask per cell — the player's pencil marks during play, the
   * solver's live candidate set while solving. */
  readonly pencil: Uint16Array;
}

export interface SeismicState extends SeismicBoard {
  readonly params: SeismicParams;
}

export function blankBoard(w: number, h: number, mode: number): SeismicBoard {
  return {
    w,
    h,
    mode,
    dsf: new Dsf(w * h),
    grid: new Uint8Array(w * h),
    flags: new Uint8Array(w * h),
    pencil: new Uint16Array(w * h),
  };
}

export function cloneState(s: SeismicState): SeismicState {
  return {
    w: s.w,
    h: s.h,
    mode: s.mode,
    // The partition is immutable for the life of the game, so every state
    // shares one instance rather than cloning a union-find per keystroke.
    dsf: s.dsf,
    grid: s.grid.slice(),
    flags: s.flags.slice(),
    pencil: s.pencil.slice(),
    params: s.params,
  };
}

// --- moves and ui ----------------------------------------------------------

export type SeismicMove =
  /** Place (`pencil: false`) or toggle a pencil mark (`pencil: true`); `n === 0`
   * clears the cell / all of its marks. */
  | { type: "set"; x: number; y: number; n: number; pencil: boolean }
  /** Upstream's `M`: fill every empty cell's marks with its region's candidates. */
  | { type: "pencilAll" }
  /** Cross out several notes at once: how a hint step rules candidates out, since
   * one deduction can strike several and a pencil toggle is neither multi-cell nor
   * idempotent (docs/games/hints.md § "Persist, populate, and the moves"). */
  | { type: "pencilStrike"; marks: { x: number; y: number; n: number }[] }
  /** Write several notes at once: how a hint puts down the candidates a
   * deduction rests on, when the player leaves a cell's notes unwritten. */
  | { type: "pencilAdd"; marks: { x: number; y: number; n: number }[] }
  /** Fill in the solver's answer. */
  | { type: "solve"; grid: number[] };

export interface SeismicUi {
  /** Highlighted cell. */
  cursor: GridCursor;
  /** Whether the highlight was last moved by the keyboard (upstream keeps the
   * cursor visible after a keyboard entry, but hides it after a mouse one). */
  cursorFromKeyboard: boolean;
  /** Whether entry goes to pencil marks rather than the cell. */
  pencilMode: boolean;
  /** Fork divergence (docs/games/mechanics.md § "Pencil marks: the full note-taking UX"): right-click toggles a *persistent* pencil
   * mode rather than a one-shot pencil selection. */
  pencilSticky: boolean;
  /** Preference (default on): keep the mouse highlight after a pencil change. */
  pencilKeepHighlight: boolean;
  /** Preference: how a hint pencils (`CandidateReading`). */
  candidateReading: CandidateReading;
}

export function newUi(_state: SeismicState): SeismicUi {
  return {
    cursor: newCursor(),
    cursorFromKeyboard: false,
    pencilMode: false,
    pencilSticky: true,
    pencilKeepHighlight: true,
    // Not the convention: an Easy board falls to singles the board shows, so
    // the implicit plan writes no notes and is about half as long, with no cull
    // after each placement; on Normal the two are about even
    // (docs/games/hints.md § "Two readings of an unmarked cell").
    candidateReading: "implicit",
  };
}

// --- description codec -----------------------------------------------------

/** Encode the clue grid: letter runs for empty cells, the digit itself for a
 * given. */
function encodeClues(grid: ArrayLike<number>, s: number): string {
  let out = "";
  let erun = 0;
  for (let i = 0; i < s; i++) {
    if (grid[i] === 0) {
      erun++;
    } else {
      out += gapLetters(erun) + String(grid[i]);
      erun = 0;
    }
  }
  return out + gapLetters(erun);
}

/** The wall list plus the clue grid — upstream's `⟨walls⟩,⟨clues⟩` description. */
export function encodeDesc(board: SeismicBoard): string {
  const { w, h, dsf, grid } = board;
  return `${encodeRegionWalls(dsf, w, h)},${encodeClues(grid, w * h)}`;
}

function isClueChar(c: string): boolean {
  return (c >= "a" && c <= "z") || isDigit(c);
}

export const REGION_TOO_LARGE = puzzleDescError(
  "This game ID has a region of more than nine squares, too many to number with single digits.",
);
export const CLUE_TOO_LARGE = puzzleDescError(
  "This game ID gives a clue larger than the number of squares in its region.",
);

/**
 * Read a description: the region layout (`wall-runs.ts`), a `,`, then the clue
 * grid exactly covering the board, where a letter is a run of empty cells
 * (`a` = 1, `z` = 26) and a digit `1`–`9` is a given.
 */
function parseDesc(p: SeismicParams, desc: string): DescParse<SeismicBoard> {
  const { w, h } = p;
  const s = w * h;
  return readDesc(desc, (r) => {
    const board = blankBoard(w, h, p.mode);
    readRegionWalls(r, board.dsf, w, h);
    // Compress every path now, while the partition is being built. Every state
    // of a game shares this one `Dsf`, and `canonify` shortens the paths it
    // walks, so an uncompressed partition is rewritten by whatever reads it
    // first: a hint, a redraw, a mistake check. Compressed once, every later
    // read is a read, which is what `hint-resume.test.ts`'s "hint() leaves the
    // state unchanged" holds.
    for (let i = 0; i < s; i++) board.dsf.canonify(i);

    r.expect(",");
    for (let i = 0; i < s; ) {
      const c = r.char(isClueChar);
      const clue = digitValue(c);
      if (clue === null) {
        const run = c.charCodeAt(0) - "a".charCodeAt(0) + 1;
        if (run > s - i) r.fail(DESC_TOO_LONG);
        i += run;
        continue;
      }
      if (clue === 0) r.fail(DESC_OUT_OF_RANGE);
      board.grid[i] = clue;
      board.flags[i] = FM_FIXED;
      i++;
    }
    r.end();

    // The last offending cell decides the message, as upstream.
    let error: DescError | null = null;
    for (let i = 0; i < s; i++) {
      const size = board.dsf.size(i);
      if (size > 9) error = REGION_TOO_LARGE;
      if (board.grid[i] > size) error = CLUE_TOO_LARGE;
    }
    if (error) r.fail(error);
    return board;
  });
}

export function validateDesc(p: SeismicParams, desc: string): DescError | null {
  return descVerdict(parseDesc(p, desc));
}

export function newState(p: SeismicParams, desc: string): SeismicState {
  return { ...descValue(parseDesc(p, desc)), params: p };
}

// --- text rendering --------------------------------------------------------

export function textFormat(state: SeismicState): string {
  const { w, h, dsf, grid } = state;
  const rows: string[] = [];

  rows.push(`+${"-+".repeat(w)}`);
  for (let y = 0; y < h; y++) {
    let cells = "|";
    let under = "+";
    for (let x = 0; x < w; x++) {
      const c = grid[y * w + x];
      cells += c > 0 ? String(c) : ".";
      cells += x === w - 1 || !dsf.equivalent(y * w + x, y * w + x + 1) ? "|" : " ";
      under += y === h - 1 || !dsf.equivalent(y * w + x, (y + 1) * w + x) ? "-" : " ";
      under += "+";
    }
    rows.push(cells);
    rows.push(under);
  }
  return `${rows.join("\n")}\n`;
}

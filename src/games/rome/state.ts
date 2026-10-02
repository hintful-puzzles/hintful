/**
 * Rome (Nikoli's *Roma*) state, params, move/ui types and the desc codec —
 * port of the corresponding parts of `puzzles/unreleased/rome.c`.
 *
 * Fill every square with an arrow so that (1) every outlined region holds only
 * *distinct* arrows and (2) following the arrows from any square reaches a
 * circled goal. Upstream rewrites rule 2 into two local invariants that the
 * whole implementation turns on — **no arrow may point off the grid** and
 * **the arrows must not form a loop** — because a disjoint-set forest that
 * merges each arrow with the square it points at collapses a valid board into
 * components each holding exactly one goal (or one still-empty square).
 *
 * So Rome carries **two** disjoint-set forests, and keeping them apart is the
 * single most important thing to know about this port:
 *
 * - {@link RomeBoard.regions} — the *static region layout* (upstream
 *   `state->dsf`), built once from the desc's wall list and shared by
 *   reference through {@link cloneState}. Used to detect duplicate arrows.
 * - a *transient arrow-connectivity* forest, rebuilt from scratch on every
 *   validity check (see `solver.ts`) and never stored on a state.
 *
 * A cell is one packed `int`, as upstream's: the `FM_*` content bits plus the
 * `FE_*` rule-violation and `FD_*` display bits the validity check ORs back
 * in. The error bits are kept *in* the grid rather than recomputed on demand
 * because every consumer (renderer, `findMistakes`, the solver's `EMPTY`
 * tests) reads them, and the generator's comparisons run against cells
 * carrying them.
 */

import type {
  CandidateReading,
  Mark,
  NoteEncoding,
} from "../../engine/candidate-hint.ts";
import { DESC_TOO_LONG } from "../../engine/desc-error.ts";
import type { DescReader } from "../../engine/desc-reader.ts";
import { difficultyItem, tierNames } from "../../engine/difficulty.ts";
import { Dsf } from "../../engine/dsf.ts";
import type { ParamConfigItem, PresetMenu } from "../../engine/game.ts";
import type { CellRegion } from "../../engine/latin-hint.ts";
import { dimensionParamConfig } from "../../engine/params.ts";
import { choice, dims, paramsCodec } from "../../engine/params-codec.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import {
  encodeRegionWalls,
  gapLetters,
  readRegionWalls,
} from "../../engine/wall-runs.ts";

// --- cell bit-field (upstream values, verbatim) -----------------------------

export const EMPTY = 0;

export const FM_FIXED = 0x0001;
export const FM_GOAL = 0x0002;
export const FM_UP = 0x0004;
export const FM_DOWN = 0x0008;
export const FM_LEFT = 0x0010;
export const FM_RIGHT = 0x0020;

/** Points outside the grid. */
export const FE_BOUNDS = 0x0040;
/** Duplicate arrow within one outlined region. */
export const FE_DOUBLE = 0x0080;
/** Part of a loop. */
export const FE_LOOP = 0x0100;
/** Loop entry point — bounds the loop walk so it cannot spin. */
export const FE_LOOPSTART = 0x0200;

/** Its arrow chain reaches a goal. */
export const FD_TOGOAL = 0x2000;
/** Mouse button held down on this square. */
export const FD_ENTRY = 0x4000;

export const FM_ARROWMASK = FM_UP | FM_DOWN | FM_LEFT | FM_RIGHT;
export const FE_MASK = FE_LOOP | FE_LOOPSTART | FE_BOUNDS | FE_DOUBLE;

/** One of the four arrow bits. */
export type RomeDir = typeof FM_UP | typeof FM_DOWN | typeof FM_LEFT | typeof FM_RIGHT;

/**
 * The four arrows as the dense candidate values `1..4`, in upstream's bit
 * order.
 *
 * Rome's notes *are* bits already, so no bit-packing is needed — but the shared
 * candidate machinery enumerates a cell's candidates as `for (v = 1; v <=
 * values; v++)`, which needs a dense ordinal, and a `Mark` carries `n` rather
 * than a mask. So a direction crosses the framework boundary as its index here
 * and comes back through {@link dirBit}.
 */
export const DIR_BITS: readonly RomeDir[] = [FM_UP, FM_DOWN, FM_LEFT, FM_RIGHT];

/** How many arrow candidates a square may hold — the framework's `values`. */
export const DIR_COUNT = DIR_BITS.length;

/**
 * The placed-value a square that is decided but holds no arrow carries on a
 * candidate plan's working grid: a goal. `dirBit` maps it to no candidate bit,
 * which is the truth — a goal rules no arrow out of its neighbors. Goals sit in
 * one-square regions (`parseDesc` rejects any other placement), so nothing
 * ever asks it to.
 */
const GOAL_VALUE = DIR_COUNT + 1;

/** The arrow bit for candidate value `n`, or `0` for a value that is not an
 * arrow ({@link GOAL_VALUE}). */
export function dirBit(n: number): number {
  return DIR_BITS[n - 1] ?? 0;
}

/** The candidate value of one arrow bit; `0` for anything else. */
export function dirValue(bit: number): number {
  return DIR_BITS.indexOf(bit as RomeDir) + 1;
}

/**
 * Rome's note encoding for the shared candidate machinery: the arrow bits
 * themselves, four of them, and a per-square full set.
 *
 * **Rome's notes are already bits, so nothing is packed or unpacked here** —
 * `bit` is a lookup, not an encoding. What the shared machinery genuinely needs
 * is the *dense ordinal* its `for (v = 1; v <= values; v++)` scans and its
 * `Mark.n` carries; `NoteEncoding` is the one place a game says how the two
 * relate, and for a game whose values are bits that is near-identity.
 */
export function romeNotes(w: number, h: number): NoteEncoding {
  return {
    bit: dirBit,
    values: DIR_COUNT,
    all: (i) => legalDirs(i % w, (i / w) | 0, w, h),
  };
}

/**
 * The board as the shared candidate machinery reads a grid: one dense value per
 * square, `0` for undecided.
 *
 * Rome's own cells are packed bit-fields — an arrow OR'd with `FM_FIXED` and
 * whatever `FE_*` / `FD_*` bits the last validity check wrote — so they cannot
 * be read as values directly, and `0` is the only value the two spellings share.
 *
 * *An undecided square really is exactly `0`*, which is what makes that shared
 * `0` enough. Every `FE_*` bit requires an arrow to be wrong about, and
 * `FD_TOGOAL` cannot land on a blank square: a goal holds no arrow and neither
 * does a blank one, an arrow component is a forest, and a tree of `n` squares
 * spends `n - 1` arrows, so at most one of its squares can be without one.
 */
export function placedValues(board: RomeBoard): Uint8Array {
  const { grid } = board;
  const out = new Uint8Array(grid.length);
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === EMPTY) continue;
    out[i] = dirValue(grid[i] & FM_ARROWMASK) || GOAL_VALUE;
  }
  return out;
}

/**
 * A square's one uniqueness region, as the shared candidate machinery reads it:
 * the outlined area it belongs to.
 *
 * `holdsEvery` is `size === 4`, and that is not a coincidence to be argued —
 * it is `find4Position`'s own guard (`if (regions.size(i) !== 4) continue`),
 * arrived at independently. A region of four squares must hold all four arrows,
 * so an arrow with one home left in it is forced there; a smaller region only
 * forbids repeats, which is exactly the distinction `CellRegion.holdsEvery`
 * exists to draw.
 *
 * Cached per board, because a plan asks for a square's region on every note
 * cull and the partition never moves while a board is being solved.
 */
export function romeRegions(board: RomeBoard): (x: number, y: number) => CellRegion[] {
  const { w, regions } = board;
  const byRoot = new Map<number, number[]>();
  for (let i = 0; i < board.grid.length; i++) {
    const c = regions.canonify(i);
    const list = byRoot.get(c);
    if (list) list.push(i);
    else byRoot.set(c, [i]);
  }
  const cache = new Map<number, CellRegion[]>();
  return (x, y) => {
    const c = regions.canonify(y * w + x);
    let region = cache.get(c);
    if (!region) {
      const cells = byRoot.get(c) as number[];
      region = [{ cells, holdsEvery: cells.length === 4 }];
      cache.set(c, region);
    }
    return region;
  };
}

/**
 * The arrows square `(x, y)` could legally hold: all four, less any that would
 * point off the grid.
 *
 * **Rome's full candidate set is per-square, not a board-wide mask** — the one
 * place its notes differ in shape from a Latin game's, where every cell's
 * "everything" is the same `1..n`. The solver seeds its candidates with this,
 * the Mark-all press fills with it, and the hint's populate step fills with it;
 * all three have to agree, or the hint teaches a strike on a note the player's
 * board never had.
 */
export function legalDirs(x: number, y: number, w: number, h: number): number {
  let mask = FM_ARROWMASK;
  if (y === 0) mask &= ~FM_UP;
  if (y === h - 1) mask &= ~FM_DOWN;
  if (x === 0) mask &= ~FM_LEFT;
  if (x === w - 1) mask &= ~FM_RIGHT;
  return mask;
}

// --- difficulty -------------------------------------------------------------

export const DIFF_EASY = 0;
export const DIFF_NORMAL = 1;
export const DIFF_TRICKY = 2;
export const DIFFCOUNT = 3;

/** Difficulty encode chars (upstream `rome_diffchars`), index = tier. */
const DIFF_CHARS = "ent";
const DIFF_NAMES = tierNames(DIFFCOUNT);

// --- validity verdicts ------------------------------------------------------

export const STATUS_COMPLETE = 0;
export const STATUS_INCOMPLETE = 1;
export const STATUS_INVALID = 2;

// --- types ------------------------------------------------------------------

export interface RomeParams {
  w: number;
  h: number;
  /** One of `DIFF_EASY` / `DIFF_NORMAL` / `DIFF_TRICKY`. */
  diff: number;
}

/**
 * The mutable board the solver and generator work on — upstream's `game_state`
 * minus the two play flags. `RomeState` structurally *is* one, so the solver
 * takes a `RomeBoard` and every caller passes it a board it owns (a clone, a
 * generator scratch), never a live state.
 */
export interface RomeBoard {
  readonly w: number;
  readonly h: number;
  /** Static region layout (upstream `state->dsf`); never merged after decode
   * except by the generator, which owns its own scratch board. */
  readonly regions: Dsf;
  /** Packed cell bits, row-major. */
  readonly grid: Int32Array;
  /** Candidate direction set per square — the player's pencil marks, reused
   * by the solver as its working candidate set (upstream does the same). */
  readonly pencil: Int32Array;
}

export type RomeState = RomeBoard;

/**
 * A move is a *place* (set or clear an arrow), a *pencil* (toggle one mark, or
 * clear the square's marks), or a *solve* (the full-grid solution): upstream's
 * `"R x,y,c"` / `"P x,y,c"` / `"S<letters>"`.
 *
 * `pencilAll`, `pencilStrike` and `pencilAdd` are this fork's, for the Mark-all
 * press and the hint: a `pencil` toggle is one square and is not idempotent, so
 * neither a bulk fill nor a firing that rules out or writes several marks at
 * once can be built from it (docs/games/hints.md § "Persist, populate, and the
 * moves").
 */
export type RomeMove =
  | { kind: "place"; x: number; y: number; dir: RomeDir | null }
  | { kind: "pencil"; x: number; y: number; dir: RomeDir | null }
  | { kind: "pencilAll" }
  | { kind: "pencilStrike"; marks: readonly Mark[] }
  | { kind: "pencilAdd"; marks: readonly Mark[] }
  | { kind: "solve"; arrows: ReadonlyArray<RomeDir | null> };

// --- ui ---------------------------------------------------------------------

export const KEYMODE_MOVE = 1;
export const KEYMODE_PLACE = 2;
export const KEYMODE_PENCIL = 3;

export const MOUSEMODE_OFF = 0;
export const MOUSEMODE_PLACE = 1;
export const MOUSEMODE_PENCIL = 2;

export interface RomeUi {
  /** Highlighted square: the selection, which a pointer gesture changes only
   * when it resolves (`note-taking-cell.ts` § "the select-or-drag gesture"). */
  cursor: GridCursor;
  /** `KEYMODE_*`: what the keyboard cursor is armed for — plain movement,
   * placing an arrow, or penciling one. Whether the cursor is *shown* is
   * `cursor.visible`, like every other game's. */
  kmode: number;
  /** `MOUSEMODE_*`: the in-flight drag's mode, `OFF` when idle. */
  mmode: number;
  /** The square the in-flight drag was grabbed from, meaningless while
   * `mmode` is `OFF`. Its own field rather than the cursor, because a press
   * that may become a drag must leave the selection alone. */
  mx: number;
  my: number;
  /** The direction the in-flight drag currently points at (`EMPTY` = none). */
  mdir: number;
  /**
   * The collection's sticky Marks mode: while on, a drag lays a pencil mark and
   * a typed direction pencils it, rather than placing an arrow.
   *
   * **Rome's other two ways into a mark are a right-drag and a keyboard arm,
   * and a touch player has neither.** A right button is a mouse, and the app's
   * long-press fallback is unusable here because a held finger on a square is
   * already how an arrow drag begins. `kmode`'s one-shot `KEYMODE_PENCIL`
   * arming is upstream's and stays for the keyboard-cursor flow; this is the
   * mode the Marks key toggles, spelled as every other note-taking game spells
   * it so the engine offers the key by seeing it (`key-labels.ts`
   * `takesNotes`).
   */
  pencilMode: boolean;
  /** The keyboard revealed or moved the highlight, so an entry keeps it. */
  cursorFromKeyboard: boolean;
  /** Preference: a right tap latches notes mode rather than selecting for it. */
  pencilSticky: boolean;
  /** Preference: keep a tapped square's highlight through a pencil mark. */
  pencilKeepHighlight: boolean;
  /** Preference: tint squares that are part of a loop (upstream default off). */
  sloops: boolean;
  /** Preference: tint squares whose arrows reach a goal (default on). */
  sgoals: boolean;
  /** Preference: how a hint pencils (`CandidateReading`). */
  candidateReading: CandidateReading;
}

// --- params -----------------------------------------------------------------

const DEFAULT_PRESET = 3;

/** Every tier at 4x4, 6x6, 8x8 and 10x10. */
const PRESETS: RomeParams[] = [4, 6, 8, 10].flatMap((n) =>
  DIFF_NAMES.map((_, diff) => ({ w: n, h: n, diff })),
);

export function defaultParams(): RomeParams {
  return { ...PRESETS[DEFAULT_PRESET] };
}

export function presets(): PresetMenu<RomeParams> {
  return {
    title: "Rome",
    submenu: PRESETS.map((p) => ({ params: { ...p } })),
  };
}

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<RomeParams>[] = [
  ...dimensionParamConfig<RomeParams>({
    doc: "Size of the grid in squares.",
    bounds: { min: 3 },
  }),
  difficultyItem(DIFF_NAMES, "diff"),
];

/** `WxH`, plus the generator-only difficulty letter. Upstream: a `d` with an
 * absent or unrecognized char leaves the difficulty out of range, so
 * `paramsError` rejects it. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, {
    full: true,
    invalid: DIFFCOUNT + 1,
  }),
]);

// --- board helpers ----------------------------------------------------------

export function newBoard(w: number, h: number): RomeState {
  const s = w * h;
  return {
    w,
    h,
    regions: new Dsf(s),
    grid: new Int32Array(s),
    pencil: new Int32Array(s),
  };
}

/**
 * A clone that shares the region layout by reference: it never changes after
 * decode, and path compression, the only thing that touches it, cannot alter
 * the partition or its roots.
 */
export function cloneState(s: RomeState): RomeState {
  return {
    w: s.w,
    h: s.h,
    regions: s.regions,
    grid: s.grid.slice(),
    pencil: s.pencil.slice(),
  };
}

/**
 * A fresh board holding only this state's *fixed clues* — the position the
 * puzzle started from, with every player entry, pencil mark and transient
 * error/display bit stripped. `solve` and `findMistakes` both re-derive the
 * unique solution from this rather than from the live grid.
 */
export function boardFromClues(s: RomeState): RomeState {
  const grid = s.grid.map((c) =>
    c & FM_FIXED ? c & (FM_FIXED | FM_GOAL | FM_ARROWMASK) : EMPTY,
  );
  // Share the region layout: `romeSolve` never merges it.
  return { ...newBoard(s.w, s.h), regions: s.regions, grid };
}

// --- desc codec -------------------------------------------------------------

const CODE_a = "a".charCodeAt(0);

/** The clue letters, in the order the encoder writes a cell's bits. */
const CLUE_BITS: Readonly<Record<string, number>> = {
  U: FM_UP,
  D: FM_DOWN,
  L: FM_LEFT,
  R: FM_RIGHT,
  X: FM_GOAL,
};

function isClueChar(c: string): boolean {
  return (c >= "a" && c <= "z") || c in CLUE_BITS;
}

/**
 * Read a description's board — upstream `rome_read_desc`, the inverse of
 * {@link encodeDesc}: the region layout as a wall list (`wall-runs.ts`), a
 * `,`, then the clue grid, where a letter is a run of empty squares (`a` = 1,
 * `z` = 26) and `U`/`D`/`L`/`R`/`X` are fixed arrows and goals. The clue grid
 * covers the board exactly.
 */
export function readBoard(r: DescReader, p: RomeParams): RomeState {
  const { w, h } = p;
  const s = w * h;
  const board = newBoard(w, h);
  readRegionWalls(r, board.regions, w, h);
  r.expect(",");
  for (let i = 0; i < s; ) {
    const c = r.char(isClueChar);
    const clue: number | null = CLUE_BITS[c] ?? null;
    if (clue !== null) {
      board.grid[i++] = clue | FM_FIXED;
      continue;
    }
    const run = c.charCodeAt(0) - CODE_a + 1;
    if (run > s - i) r.fail(DESC_TOO_LONG);
    i += run;
  }
  return board;
}

/**
 * Encode a finished board as a description — upstream's `new_game_desc` tail,
 * the inverse of {@link readBoard}. A run of 26 or more empty squares is
 * written as `z`s and a remainder, which is how the reader takes it; upstream
 * wrote a single letter past `z`.
 */
export function encodeDesc(
  w: number,
  h: number,
  regions: Dsf,
  grid: Int32Array,
): string {
  let out = `${encodeRegionWalls(regions, w, h)},`;
  let erun = 0;
  for (let i = 0; i < w * h; i++) {
    const c = grid[i];
    if (c === EMPTY) {
      erun++;
      continue;
    }
    out += gapLetters(erun);
    erun = 0;
    for (const [ch, bit] of Object.entries(CLUE_BITS)) if (c & bit) out += ch;
  }
  return out + gapLetters(erun);
}

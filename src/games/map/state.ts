/**
 * Types and pure state helpers for Map (`map.c`) — the four-color puzzle.
 *
 * Color every region of a map so no two adjacent regions share a color,
 * given some regions pre-colored as immutable clues.
 *
 * The immutable board geometry lives in a shared {@link MapData} (see
 * `map-data.ts`) — the region-per-quadrant grid, the adjacency graph, the clue
 * flags and the label points — shared by reference across every cloned
 * {@link MapState} (upstream's refcounted `struct map`). A move copies only the
 * mutable per-region `coloring` and `pencil` arrays.
 */

import type { CandidateReading } from "../../engine/candidate-hint.ts";
import { isDigit, parseLeadingInt } from "../../engine/decimal.ts";
import { noSuchTier, tierNames, tooRareToDeal } from "../../engine/difficulty.ts";
import type { EntryMistakeKind } from "../../engine/entry-mistakes.ts";
import type { PresetMenu } from "../../engine/game.ts";
import { AREA_TOO_LARGE } from "../../engine/params.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { newCursor } from "../../engine/pointer.ts";
import type { MapData } from "./map-data.ts";

// --- difficulty ------------------------------------------------------

export const DIFF_EASY = 0;
export const DIFF_NORMAL = 1;
export const DIFF_HARD = 2;
export const DIFF_RECURSE = 3;
export const DIFFCOUNT = 4;

export const DIFF_NAMES: readonly string[] = tierNames(DIFFCOUNT, { search: true });
/** Upstream `map_diffchars`. */
const DIFF_CHARS = "enhu";

// --- params ----------------------------------------------------------

export interface MapParams {
  w: number;
  h: number;
  /** Number of regions. */
  n: number;
  /** Tier index into `DIFF_NAMES`. */
  diff: number;
}

export function defaultParams(): MapParams {
  return { w: 15, h: 20, n: 30, diff: DIFF_NORMAL };
}

/** Upstream's two sizes, each at every tier. */
const PRESETS: readonly MapParams[] = [
  { w: 15, h: 20, n: 30, diff: DIFF_EASY },
  { w: 15, h: 20, n: 30, diff: DIFF_NORMAL },
  { w: 15, h: 20, n: 30, diff: DIFF_HARD },
  { w: 15, h: 20, n: 30, diff: DIFF_RECURSE },
  { w: 25, h: 30, n: 75, diff: DIFF_EASY },
  { w: 25, h: 30, n: 75, diff: DIFF_NORMAL },
  { w: 25, h: 30, n: 75, diff: DIFF_HARD },
  { w: 25, h: 30, n: 75, diff: DIFF_RECURSE },
];

export function presets(): PresetMenu<MapParams> {
  return {
    title: "Map",
    submenu: PRESETS.map((p) => ({ params: { ...p } })),
  };
}

export function encodeParams(p: MapParams, full: boolean): string {
  let s = `${p.w}x${p.h}n${p.n}`;
  if (full) s += `d${DIFF_CHARS[p.diff]}`;
  return s;
}

/**
 * Upstream `decode_params`, faithfully lenient: `w`, optional `xH` (else
 * `h = w`), optional `nN` (tolerating a `.` in the count for old float-`n`
 * IDs — `atoi`-truncated), optional `dX` difficulty char. An absent `n`
 * defaults to `w*h/8`.
 */
export function decodeParams(s: string): MapParams {
  const p = defaultParams();

  const wParse = parseLeadingInt(s, 0);
  p.w = wParse.value;
  let i = wParse.next;

  if (s[i] === "x") {
    const hParse = parseLeadingInt(s, i + 1);
    p.h = hParse.value;
    i = hParse.next;
  } else {
    p.h = p.w;
  }

  if (s[i] === "n") {
    i++;
    const nParse = parseLeadingInt(s, i);
    p.n = nParse.value;
    i = nParse.next;
    // Tolerate (and skip) a trailing `.<digits>` fraction, as upstream does.
    while (i < s.length && (s[i] === "." || isDigit(s[i]))) i++;
  } else if (p.h > 0 && p.w > 0) {
    p.n = Math.floor((p.w * p.h) / 8);
  }

  if (s[i] === "d") {
    i++;
    const idx = DIFF_CHARS.indexOf(s[i] ?? "");
    if (idx >= 0) p.diff = idx;
    if (i < s.length) i++;
  }

  return p;
}

export function validateParams(p: MapParams, full: boolean): string | null {
  if (p.w > Math.floor(2147483647 / 2 / p.h)) return AREA_TOO_LARGE;
  if (p.n > p.w * p.h) return "There must be no more regions than squares.";
  return full && p.diff > DIFF_EASY ? tierRefusal(p) : null;
}

/**
 * The maps with no board at the tier asked for, and those where one is found
 * too seldom to wait for. Measured 2026-10-05 by running the generator out
 * over several sizes: the count beside each absence is maps built with none
 * found, and beside each rarity how many it took to find one.
 */
function tierRefusal(p: MapParams): string | null {
  const tier = DIFF_NAMES[p.diff];
  // 5,500,000.
  if (p.n <= 7) return noSuchTier(`map of ${p.n} regions`, tier);
  // 7,000,000.
  if (Math.min(p.w, p.h) === 2) return noSuchTier("map two squares wide", tier);
  // 3,400,000, from 3x3 to 10x10.
  if (p.n === p.w * p.h) return noSuchTier("map whose every square is a region", tier);
  if (p.n === 8) {
    // Normal once in 35,000 to 120,000, which is seconds; above it, 4,000,000.
    return p.diff === DIFF_NORMAL
      ? tooRareToDeal("maps of 8 regions", tier)
      : noSuchTier("map of 8 regions", tier);
  }
  if (p.diff >= DIFF_HARD) {
    // Once in 20,000 to 95,000: a second at 6x6 and seven at 15x20.
    if (p.n <= 10) return tooRareToDeal(`maps of ${p.n} regions`, tier);
    // Once in 60,000 to 335,000. Unreasonable is found within 45,000.
    if (p.diff === DIFF_HARD && Math.min(p.w, p.h) === 3)
      return tooRareToDeal("maps three squares wide", tier);
  }
  return null;
}

// --- moves -----------------------------------------------------------

/** One region edit within a move. */
export type MapOp =
  /** Set a region's color (`color` null = clear); clears its pencil. */
  | { op: "color"; region: number; color: number | null }
  /** Toggle one pencil bit (0..3). Only legal on an uncolored region. */
  | { op: "pencil"; region: number; bit: number };

/**
 * A player move: a list of region ops (a single drag-drop can change both a
 * color and pencil bits).
 */
export interface MapMove {
  ops: MapOp[];
}

// --- ui --------------------------------------------------------------

const FLASH_CYCLIC = 0;
export const FLASH_EACH_TO_WHITE = 1;
export const FLASH_ALL_TO_WHITE = 2;

/** Persisted drag/cursor UI + preferences (upstream `game_ui`). */
export interface MapUi {
  /** -2 = no drag; -1 = dragging a blank; >=0 = dragging that color. */
  dragColor: number;
  /** Pencil bitmask carried by a blank drag. */
  dragPencil: number;
  /** Pixel coords of the current drag position. */
  dragX: number;
  dragY: number;

  cursor: GridCursor;
  curLastmove: number;
  curMoved: boolean;

  /**
   * The collection's sticky Marks mode: while on, a drop pencils rather than
   * colors, which is exactly what a right-drag already does.
   *
   * Map's mark is not chosen by the mode — which pencil bit a drop sets comes
   * from the color the drag started on — so this arms the *kind* of drop, not
   * its content. That is why it fits: `drop` already takes the boolean, and the
   * mode just supplies it from somewhere a touch player can reach.
   */
  pencilMode: boolean;
  /** The keyboard revealed or moved the highlight, so an entry keeps it. */
  cursorFromKeyboard: boolean;

  // preferences
  /** How the hint reads a blank region with no dots (the `hint-notes` pref). */
  candidateReading: CandidateReading;
  /** A right tap latches notes mode rather than selecting for it. */
  pencilSticky: boolean;
  /** Keep a tapped region's highlight through a pencil mark. */
  pencilKeepHighlight: boolean;
  /** 0 = cyclic, 1 = each-to-white, 2 = all-to-white. */
  flashType: number;
  showNumbers: boolean;
  largeStipples: boolean;
}

export function newUi(_state: MapState): MapUi {
  return {
    dragColor: -2,
    dragPencil: 0,
    dragX: -1,
    dragY: -1,
    cursor: newCursor(),
    curLastmove: 0,
    curMoved: false,
    pencilMode: false,
    cursorFromKeyboard: false,
    // Not the collection's `populate`: an Easy board is solved from its
    // neighbors' colors alone and needs no dots at all. Measured over every
    // preset at six seeds (2026-09-25), the implicit plan takes 0.89x the
    // populate plan's steps on Easy and 0.98-1.03x on Normal, dotting 0-18% of
    // the blank regions; only Tricky, at 1.09-1.11x, would prefer populating.
    candidateReading: "implicit",
    pencilSticky: true,
    pencilKeepHighlight: true,
    flashType: FLASH_CYCLIC,
    showNumbers: false,
    largeStipples: false,
  };
}

// --- state -----------------------------------------------------------

export interface MapState {
  readonly params: MapParams;
  /** Shared immutable geometry (region grid, graph, clues, label points). */
  readonly map: MapData;
  /** Per-region color: -1 (blank) or 0..3. Length `n`. */
  readonly coloring: Int32Array;
  /** Per-region pencil-mark bitmask (only meaningful when blank). Length `n`. */
  readonly pencil: Int32Array;
}

export function cloneState(s: MapState): MapState {
  return { ...s, coloring: s.coloring.slice(), pencil: s.pencil.slice() };
}

/** A flagged region whose color contradicts the unique solution, or whose dots
 * leave that color out. */
export interface MapMistake {
  region: number;
  kind: EntryMistakeKind;
}

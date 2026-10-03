/**
 * Types, the cell alphabet, the desc codec and the pure move helpers for
 * Sokoban (barrel-pushing warehouse puzzle), after upstream
 * `puzzles/unfinished/sokoban.c`.
 *
 * The grid is a flat `Uint8Array` of the *character codes* game IDs use, so a
 * hand-authored level ID decodes as it does upstream. The full alphabet (pits,
 * deep pits, capital-letter labeled barrels) is ported although the generator
 * never emits it: hand-typed levels are what upstream's header names as
 * Sokoban's reason to exist.
 */

import { isDigit } from "../../engine/decimal.ts";
import {
  DESC_TOO_LONG,
  type DescParse,
  descNeedsOne,
  descValue,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import type { ParamConfigItem, PresetMenu } from "../../engine/game.ts";
import { dimensionParamConfig } from "../../engine/params.ts";
import { dims, paramsCodec } from "../../engine/params-codec.ts";
import type { GameStatus } from "../../engine/types.ts";

// --- the cell alphabet (char codes) -----------------------------------
// Upstream's #defines: each value is the character a game ID uses for it.

const c = (ch: string): number => ch.charCodeAt(0);

export const INITIAL = c("i"); // an untouched square during generation
export const SPACE = c("s");
export const WALL = c("w");
export const PIT = c("p");
export const DEEP_PIT = c("d");
export const TARGET = c("t");
export const BARREL = c("b");
export const BARRELTARGET = c("f"); // barrel on a target ('f'illed)
export const PLAYER = c("u"); // yo'u'; used in game IDs
export const PLAYERTARGET = c("v"); // player on a target

const A = c("A");
const Z = c("Z");

export function isPlayer(v: number): boolean {
  return v === PLAYER || v === PLAYERTARGET;
}
/**
 * A capital letter A–Z is a *labeled* barrel, letting an annotated level name
 * particular barrels; on a target it is stored as its control-character value
 * (A → ^A = 1, … Z → 26). Hence `isBarrel`/`isOnTarget` test ranges, not just
 * equality (upstream macros of the same name).
 */
export function isBarrel(v: number): boolean {
  return (
    v === BARREL || v === BARRELTARGET || (v >= A && v <= Z) || (v >= 1 && v <= 26)
  );
}
export function isOnTarget(v: number): boolean {
  return (
    v === TARGET || v === BARRELTARGET || v === PLAYERTARGET || (v >= 1 && v <= 26)
  );
}
/** Put a barrel onto a target: BARREL → BARRELTARGET, a capital → its ^ form. */
export function targetize(b: number): number {
  return b === BARREL ? BARRELTARGET : b - (A - 1);
}
/** Take a barrel off a target: BARRELTARGET → BARREL, a ^ form → its capital. */
export function detargetize(b: number): number {
  return b === BARRELTARGET ? BARREL : b + (A - 1);
}
/** The display letter for a labeled barrel, or 0 for a plain/anonymous one. */
export function barrelLabel(b: number): number {
  if (b >= A && b <= Z) return b;
  if (b >= 1 && b <= 26) return b + (A - 1);
  return 0;
}

// --- params -----------------------------------------------------------

export interface SokobanParams {
  w: number;
  h: number;
}

export function defaultParams(): SokobanParams {
  return { w: 10, h: 12 };
}

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<SokobanParams>[] =
  dimensionParamConfig<SokobanParams>({
    doc: "Size of the grid in squares.",
    bounds: { min: 4 },
  });

/** Upstream `decode_params`: `W` or `WxH`, square fallback on a bare number. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
]);

export function presets(): PresetMenu<SokobanParams> {
  const p = (w: number, h: number) => ({ params: { w, h } });
  return { title: "Type", submenu: [p(10, 12), p(12, 16), p(16, 20)] };
}

// --- state ------------------------------------------------------------

export interface SokobanState {
  readonly w: number;
  readonly h: number;
  /** Row-major grid of cell char codes. As upstream, the player's cell holds
   * the SPACE or TARGET *beneath* the player, whose position is `px`/`py`. */
  readonly grid: Uint8Array;
  readonly px: number;
  readonly py: number;
}

/** Sokoban has no persistent UI state (upstream `new_ui` returns NULL). */
export type SokobanUi = Record<string, never>;

/**
 * A single step: move the player by (dx, dy). Whether it is a walk or a push
 * is *derived* from the board by {@link moveType}, as the C decides in both
 * `interpret_move` and `execute_move`, so the move never carries it. Plain
 * JSON data, so the default move codec serves.
 */
export type SokobanStep = { type: "move"; dx: number; dy: number };

/** The hint's move: walk to the square behind the barrel at `(x, y)`, then
 * push it by `(dx, dy)`. No input makes it; a hint step plays it as the taps
 * that walk there and push (`hintGesture`). */
export type SokobanPush = {
  type: "push";
  x: number;
  y: number;
  dx: number;
  dy: number;
};

/** Solve's move: the finished board, written as a game ID writes a board. */
export type SokobanSolve = { type: "solve"; board: string };

export type SokobanMove = SokobanStep | SokobanPush | SokobanSolve;

/** Whether the player in `s` can walk to square `(x, y)`: through floor and
 * targets, never through a barrel, a wall or a pit. Orthogonal steps reach
 * every square a diagonal one does, since a diagonal needs a free square
 * beside it to pass through. */
export function canWalkTo(s: SokobanState, x: number, y: number): boolean {
  const { w, h, grid } = s;
  const goal = y * w + x;
  const seen = new Uint8Array(w * h);
  const queue = [s.py * w + s.px];
  seen[queue[0]] = 1;
  for (let q = 0; q < queue.length; q++) {
    const c = queue[q];
    if (c === goal) return true;
    const cx = c % w;
    for (const [nx, ny] of [
      [cx - 1, (c - cx) / w],
      [cx + 1, (c - cx) / w],
      [cx, (c - cx) / w - 1],
      [cx, (c - cx) / w + 1],
    ]) {
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const n = ny * w + nx;
      if (seen[n] || (grid[n] !== SPACE && grid[n] !== TARGET)) continue;
      seen[n] = 1;
      queue.push(n);
    }
  }
  return false;
}

/** The board as a game ID writes it: each cell's letter, the player's
 * square's as the player, a run of one letter as the letter and its count. */
export function encodeBoard(s: SokobanState): string {
  const at = s.py * s.w + s.px;
  const chars = Array.from(s.grid, (v, i) =>
    i === at ? (v === TARGET ? PLAYERTARGET : PLAYER) : v === INITIAL ? WALL : v,
  ).map((v) => String.fromCharCode(v));
  let out = "";
  for (let i = 0; i < chars.length; ) {
    let n = 1;
    while (i + n < chars.length && chars[i + n] === chars[i]) n++;
    out += n > 1 ? `${chars[i]}${n}` : chars[i];
    i += n;
  }
  return out;
}

// --- desc codec -------------------------------------------------------

/**
 * The letters a desc may use: the terrain, the player, and the barrels,
 * including a hand-typed level's capital-letter labeled ones. The generation-only
 * `INITIAL` square and a labeled barrel's on-target control character have no
 * place in an ID.
 */
const DESC_LETTERS = /^[swptdbfuvA-Z]$/;

/**
 * Runs of a cell letter and a repeat count of at least 2 (a single cell is
 * written bare), filling the board, with exactly one player. The player's cell
 * is stored as the SPACE or TARGET beneath it, as upstream's `new_game` does.
 */
function parseDesc(p: SokobanParams, desc: string): DescParse<SokobanState> {
  const area = p.w * p.h;
  return readDesc(desc, (r) => {
    const grid = new Uint8Array(area);
    let players = 0;
    let at = -1;
    let i = 0;
    while (i < area) {
      const ch = r.char((ch) => DESC_LETTERS.test(ch)).charCodeAt(0);
      const n = r.peekIs(isDigit) ? r.int(2, area) : 1;
      if (i + n > area) r.fail(DESC_TOO_LONG);
      let cell = ch;
      if (isPlayer(ch)) {
        players += n;
        at = i;
        cell = ch === PLAYERTARGET ? TARGET : SPACE;
      }
      grid.fill(cell, i, i + n);
      i += n;
    }
    r.end();
    if (players !== 1) r.fail(descNeedsOne("starting square for the player", players));
    return { w: p.w, h: p.h, grid, px: at % p.w, py: Math.floor(at / p.w) };
  });
}

export function newState(p: SokobanParams, desc: string): SokobanState {
  return descValue(parseDesc(p, desc));
}

// --- move classification ----------------------------------------------

export type MoveKind = "illegal" | "walk" | "push";

/**
 * Classify moving the player by (dx, dy) on this board (upstream `move_type`).
 * A push must be orthogonal, have a barrel ahead and a square that can accept
 * a barrel beyond it; a diagonal *walk* needs one of the two shared-adjacent
 * squares free to notionally pass through (the NetHack rule) and can never
 * push.
 */
export function moveType(state: SokobanState, dx: number, dy: number): MoveKind {
  const { w, h, grid, px, py } = state;
  const nx = px + dx;
  const ny = py + dy;

  if (nx < 0 || nx >= w || ny < 0 || ny >= h) return "illegal";

  const ahead = grid[ny * w + nx];
  if (ahead === WALL || ahead === PIT || ahead === DEEP_PIT) return "illegal";

  if (isBarrel(ahead)) {
    // A push: never diagonal, and the square beyond must accept a barrel.
    if (dx && dy) return "illegal";
    const nbx = nx + dx;
    const nby = ny + dy;
    if (nbx < 0 || nbx >= w || nby < 0 || nby >= h) return "illegal";
    const beyond = grid[nby * w + nbx];
    if (beyond === SPACE || beyond === TARGET || beyond === PIT || beyond === DEEP_PIT)
      return "push";
    return "illegal";
  }

  // An ordinary walk. A diagonal one needs one orthogonally-shared square to
  // be free to move through.
  if (dx && dy) {
    const vert = grid[(py + dy) * w + px];
    const horiz = grid[py * w + (px + dx)];
    if (vert !== SPACE && vert !== TARGET && horiz !== SPACE && horiz !== TARGET)
      return "illegal";
  }
  return "walk";
}

// --- status -----------------------------------------------------------

/**
 * Solved when the board cannot become any *more* complete: either no barrel is
 * off a target, or there is nowhere left to put one (no free target, no pit,
 * no deep pit). This handles spare barrels and levels with pits correctly.
 */
export function status(s: SokobanState): GameStatus {
  let freeBarrels = false;
  let freeTargets = false;
  for (const v of s.grid) {
    if (isBarrel(v) && !isOnTarget(v)) freeBarrels = true;
    if (v === DEEP_PIT || v === PIT || (!isBarrel(v) && isOnTarget(v)))
      freeTargets = true;
  }
  return !freeBarrels || !freeTargets ? "solved" : "ongoing";
}

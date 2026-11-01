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
import { describedSpace } from "../../engine/describe-runtime.ts";
import type { ParamConfigItem, PresetBoards } from "../../engine/game.ts";
import { dimensionParamConfig } from "../../engine/params.ts";
import { dims, paramsCodec } from "../../engine/params-codec.ts";
import type { GameStatus } from "../../engine/types.ts";
import * as sokoban from "./sokoban.compiled.ts";

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

/**
 * The largest board a level is dealt on. A deal generates levels until the
 * hint's search can finish one (`generator.ts`, `dealTries`), and both the
 * levels that takes and the cost of each grow with the area. Measured
 * 2026-10-06: the mean deal is 4.5 s at 30×30, 12 s at 30×40 and 30 s at
 * 40×40, where the search finished 3 levels in 100. A board that arrives with
 * its desc is any size.
 *
 * A player can stop a deal, so the wait alone would not earn a refusal. What
 * does is that last figure: past here the time goes on levels the search
 * gives up on, and the deal that ends it is likely the level dealt as it is
 * once the tries run out (`dealtLevel`), which the hint cannot open.
 */
const MAX_DEAL_AREA = 1200;

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<SokobanParams>[] =
  dimensionParamConfig<SokobanParams>({
    doc: `Size of the grid in squares. A new level has ${MAX_DEAL_AREA} squares at most, since the hint seldom finishes a larger one.`,
    bounds: { min: 4 },
  });

export function validateParams(p: SokobanParams, full: boolean): string | null {
  return full && p.w * p.h > MAX_DEAL_AREA
    ? `Width times height must be at most ${MAX_DEAL_AREA} to deal a level; the hint seldom finishes a larger one.`
    : null;
}

/** Upstream `decode_params`: `W` or `WxH`, square fallback on a bare number. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
]);

export const menu: PresetBoards<SokobanParams> = {
  boards: [
    { w: 10, h: 12 },
    { w: 12, h: 16 },
    { w: 16, h: 20 },
  ],
};

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

/** A push being aimed: the player or a barrel is held, and the pointer may
 * have been dragged out from it. */
export interface SokobanUi {
  /** The square pressed to start the drag, the player's or a barrel's; null
   * when nothing is held. */
  grab: { x: number; y: number } | null;
  /** The push the drag would make on release, or null while it aims at
   * nothing a barrel can do. */
  aim: SokobanPush | null;
}

/**
 * A single step: move the player by (dx, dy). Whether it is a walk or a push
 * is *derived* from the board by {@link moveType}, as the C decides in both
 * `interpret_move` and `execute_move`, so the move never carries it. The
 * keyboard's move. Plain JSON data, so the default move codec serves.
 */
export type SokobanStep = { type: "move"; dx: number; dy: number };

/** A tap's move: walk to square `(x, y)` by any way there, pushing nothing. */
export type SokobanWalk = { type: "walk"; x: number; y: number };

/** A drag's move: walk to the square behind the barrel at `(x, y)` if not
 * already there, then push it `n` squares along `(dx, dy)`. A drag makes it
 * from beside the barrel; a hint step names its push this way, walk included. */
export type SokobanPush = {
  type: "push";
  x: number;
  y: number;
  dx: number;
  dy: number;
  n: number;
};

/** Solve's move: the finished board, as {@link encodeBoard} writes it. */
export type SokobanSolve = { type: "solve"; board: string };

export type SokobanMove = SokobanStep | SokobanWalk | SokobanPush | SokobanSolve;

// --- the description's rules ---------------------------------------------

/** The description's rules on a board of this size. */
export function rulesOf(s: { w: number; h: number }) {
  return sokoban.rules(describedSpace(sokoban.units, s.w, s.h), {}, []);
}

/** The board as the description's layers. */
export function positionOf(s: SokobanState): sokoban.Position {
  const n = s.w * s.h;
  const ground = new Int32Array(n);
  const target = new Int32Array(n);
  const barrel = new Int32Array(n);
  const label = new Int32Array(n);
  const man = new Int32Array(n);
  s.grid.forEach((v, c) => {
    ground[c] = v === WALL ? 1 : v === PIT ? 2 : v === DEEP_PIT ? 3 : 0;
    target[c] = isOnTarget(v) ? 1 : 0;
    barrel[c] = isBarrel(v) ? 1 : 0;
    const letter = barrelLabel(v);
    label[c] = letter === 0 ? 0 : letter - A + 1;
  });
  man[s.py * s.w + s.px] = 1;
  return { ground, target, barrel, label, man };
}

/** The board the layers of `q` show, on `s`'s grid. */
function stateOf(s: SokobanState, q: sokoban.Position): SokobanState {
  const grid = Uint8Array.from(q.ground, (g, c) => {
    if (g !== 0) return g === 1 ? WALL : g === 2 ? PIT : DEEP_PIT;
    const on = q.target[c] === 1;
    if (q.barrel[c] === 0) return on ? TARGET : SPACE;
    const letter = q.label[c];
    if (letter === 0) return on ? BARRELTARGET : BARREL;
    return on ? letter : A + letter - 1;
  });
  const at = q.man.indexOf(1);
  return { w: s.w, h: s.h, grid, px: at % s.w, py: Math.floor(at / s.w) };
}

const inside = (s: SokobanState, x: number, y: number): boolean =>
  x >= 0 && x < s.w && y >= 0 && y < s.h;

/** The description's push of the barrel at `(bx, by)` along `(dx, dy)`, the
 * player starting on the square behind it; null where that is off the
 * board. */
function pushAt(
  s: SokobanState,
  bx: number,
  by: number,
  dx: number,
  dy: number,
): sokoban.Move | null {
  const [sx, sy, tx, ty] = [bx - dx, by - dy, bx + dx, by + dy];
  if (!inside(s, sx, sy) || !inside(s, bx, by) || !inside(s, tx, ty)) return null;
  return { move: "push", s: sy * s.w + sx, o: by * s.w + bx, t: ty * s.w + tx };
}

/**
 * The barrel at `(x, y)` pushed `n` squares along `(dx, dy)`, by the
 * description's pushes: the first from the square behind it, which the
 * player walks to, and each after from where the last left the player.
 * Null where any of them is not legal: the player cannot get behind it, or
 * something stops it sooner, a pit or a deep pit included.
 */
export function pushed(
  s: SokobanState,
  x: number,
  y: number,
  dx: number,
  dy: number,
  n: number,
): SokobanState | null {
  const rules = rulesOf(s);
  let p = positionOf(s);
  for (let i = 0; i < n; i++) {
    const m = pushAt(s, x + i * dx, y + i * dy, dx, dy);
    if (m === null || !rules.legal(p, m)) return null;
    p = rules.play(p, m);
  }
  return stateOf(s, p);
}

/** How many squares the barrel at `(bx, by)` can be pushed along `(dx, dy)`
 * in a row, from behind it, by the description's pushes: up to the first
 * wall or barrel in its way, and no further than a pit, which takes it. */
export function pushReach(
  s: SokobanState,
  bx: number,
  by: number,
  dx: number,
  dy: number,
): number {
  const rules = rulesOf(s);
  // The player behind the barrel, where the pushes start.
  let p: sokoban.Position = { ...positionOf(s), man: new Int32Array(s.w * s.h) };
  if (inside(s, bx - dx, by - dy)) p.man[(by - dy) * s.w + bx - dx] = 1;
  let n = 0;
  for (;;) {
    const m = pushAt(s, bx + n * dx, by + n * dy, dx, dy);
    if (m === null || !rules.legal(p, m)) return n;
    p = rules.play(p, m);
    n++;
  }
}

/** Whether the player in `s` can walk to square `(x, y)`, where they stand
 * or by the description's walk: through floor and targets, never through a
 * barrel, a wall or a pit. */
export function canWalkTo(s: SokobanState, x: number, y: number): boolean {
  if (!inside(s, x, y)) return false;
  if (x === s.px && y === s.py) return true;
  return rulesOf(s).legal(positionOf(s), { move: "walk", t: y * s.w + x });
}

/** The player walked to `(x, y)` by the description's walk, or null where
 * they cannot get there. */
export function walked(s: SokobanState, x: number, y: number): SokobanState | null {
  if (!canWalkTo(s, x, y)) return null;
  return { ...s, px: x, py: y };
}

/** The board as a game ID writes it: each cell's letter, the player's
 * square's as the player, a run of one letter as the letter and its count. A
 * labeled barrel on a target is written as the control character the grid
 * holds, which {@link decodeBoard} reads and a game ID cannot carry. */
export function encodeBoard(s: SokobanState): string {
  const at = s.py * s.w + s.px;
  const chars = Array.from(s.grid, (v, i) =>
    i === at ? (v === TARGET ? PLAYERTARGET : PLAYER) : v,
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
const isDescLetter = (ch: string): boolean => /^[swptdbfuvA-Z]$/.test(ch);

/** The letters {@link encodeBoard} writes of a board in play: a desc's, and a
 * labeled barrel's on-target control character, which pushing it home makes. */
const isBoardLetter = (ch: string): boolean =>
  isDescLetter(ch) || barrelLabel(ch.charCodeAt(0)) !== 0;

/**
 * Runs of a cell letter and a repeat count of at least 2 (a single cell is
 * written bare), filling the board, with exactly one player. The player's cell
 * is stored as the SPACE or TARGET beneath it, as upstream's `new_game` does.
 */
function parseDesc(
  p: SokobanParams,
  desc: string,
  isLetter = isDescLetter,
): DescParse<SokobanState> {
  const area = p.w * p.h;
  return readDesc(desc, (r) => {
    const grid = new Uint8Array(area);
    let players = 0;
    let at = -1;
    let i = 0;
    while (i < area) {
      const ch = r.char(isLetter).charCodeAt(0);
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

/** The board {@link encodeBoard} wrote, which may be one in play: a game ID's
 * letters and a labeled barrel on a target. */
export function decodeBoard(p: SokobanParams, board: string): SokobanState {
  return descValue(parseDesc(p, board, isBoardLetter));
}

// --- move classification ----------------------------------------------

export type MoveKind = "illegal" | "walk" | "push";

/**
 * The description's move that steps the player by (dx, dy), and which kind it
 * is, as upstream's `move_type` asks: a `step` to a square the player can
 * stand on (a diagonal one only past a corner with room to go round, the
 * NetHack rule), else a `push` of the barrel there (never diagonal), else
 * none.
 */
export function stepMove(
  state: SokobanState,
  dx: number,
  dy: number,
): { kind: MoveKind; move: sokoban.Move | null } {
  const { w, px, py } = state;
  if (!inside(state, px + dx, py + dy) || (dx === 0 && dy === 0))
    return { kind: "illegal", move: null };
  const rules = rulesOf(state);
  const p = positionOf(state);
  const b = py * w + px;
  const step: sokoban.Move = { move: "step", b, t: (py + dy) * w + px + dx };
  if (rules.legal(p, step)) return { kind: "walk", move: step };
  const push = pushAt(state, px + dx, py + dy, dx, dy);
  if (push !== null && rules.legal(p, push)) return { kind: "push", move: push };
  return { kind: "illegal", move: null };
}

/** Classify moving the player by (dx, dy) on this board (upstream
 * `move_type`), by the description's rules. */
export function moveType(state: SokobanState, dx: number, dy: number): MoveKind {
  return stepMove(state, dx, dy).kind;
}

/** The board after the description's `move`, which must be legal. */
export function played(state: SokobanState, move: sokoban.Move): SokobanState {
  return stateOf(state, rulesOf(state).play(positionOf(state), move));
}

// --- status -----------------------------------------------------------

/** Solved by the description's finish: no barrel off a target, or nowhere
 * left to put one (no free target, no pit, no deep pit), so spare barrels
 * and levels with pits finish too. */
export function status(s: SokobanState): GameStatus {
  return rulesOf(s).finished(positionOf(s)) ? "solved" : "ongoing";
}

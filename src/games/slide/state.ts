/**
 * Slide (Klotski) — the canonical board encoding, params, the desc codec and
 * the immutable state type. Faithful port of `puzzles/unfinished/slide.c`.
 *
 * The whole game turns on one insight from the C's header comment: **two
 * blocks of the same shape are indistinguishable**, so a board layout has a
 * *canonical* byte encoding, and there are no two distinct encodings of
 * indistinguishable layouts. Each square holds one of:
 *
 *  - {@link ANCHOR} — the first square (in left-to-right, top-to-bottom order)
 *    of some block;
 *  - {@link MAINANCHOR} — the same, for the *main* block (the one the player
 *    must deliver to the target);
 *  - a **distance** 1..{@link MAXDIST} — a later square of a block whose
 *    previous square was that many squares earlier, so the distances form a
 *    linked list running *backwards* through the block;
 *  - {@link EMPTY} or {@link WALL}.
 *
 * A 2×2 block is therefore `ANCHOR, DIST(1)`, then `w-2` squares later
 * `DIST(w-1), DIST(1)`. Forcefields (squares only the main block may cross)
 * cannot live in this encoding — the main block would erase them as it passed
 * — so they are a separate, never-changing array, shared by reference across
 * every state (docs/games/mechanics.md § "Idiomatic state, not a C
 * transliteration", the shared-frozen pattern; a runtime `Object.freeze` throws
 * on a populated typed array, so `readonly` is the whole guarantee).
 *
 * That canonical encoding is exactly what makes the exhaustive BFS solver in
 * `solver.ts` feasible, and what the generator's block-merge phase rewrites.
 */

import { isDigit, parseLeadingInt } from "../../engine/decimal.ts";
import {
  DESC_MALFORMED,
  DESC_TOO_LONG,
  type DescError,
  type DescParse,
  descNeedsOne,
  descValue,
  descVerdict,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { Dsf } from "../../engine/dsf.ts";
import type { PresetMenu } from "../../engine/game.ts";
import { parseDimensions } from "../../engine/params.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { newCursor } from "../../engine/pointer.ts";
import type { GameStatus } from "../../engine/types.ts";

// --- the board alphabet -----------------------------------------------

/** Top-left-most square of some piece. */
export const ANCHOR = 255;
/** Anchor of the *main* piece — the one that must reach the target. */
export const MAINANCHOR = 254;
export const EMPTY = 253;
export const WALL = 252;
/** Largest encodable back-link distance, and hence the theoretical maximum
 * board width (solver running time dictates a far smaller practical one). */
export const MAXDIST = 251;
export const MAXWID = MAXDIST;

/** A back-link to the previous square of the same block, `v` squares earlier. */
export function isDist(v: number): boolean {
  return v >= 1 && v <= MAXDIST;
}
export function isAnchor(v: number): boolean {
  return v === ANCHOR || v === MAINANCHOR;
}
export function isBlock(v: number): boolean {
  return isAnchor(v) || isDist(v);
}

// --- params -----------------------------------------------------------

export interface SlideParams {
  w: number;
  h: number;
  /** Upper bound on the generated puzzle's minimum solution length, or `-1`
   * for no limit. This bounds *length*, not technique — Slide has no
   * difficulty tiers. */
  maxmoves: number;
}

export function defaultParams(): SlideParams {
  return { w: 6, h: 7, maxmoves: 40 };
}

const PRESETS: readonly SlideParams[] = [
  { w: 6, h: 7, maxmoves: 25 },
  { w: 6, h: 7, maxmoves: -1 },
  { w: 6, h: 8, maxmoves: -1 },
];

export function presets(): PresetMenu<SlideParams> {
  return {
    title: "Slide",
    submenu: PRESETS.map((p) => ({ params: { ...p } })),
  };
}

export function encodeParams(p: SlideParams, _full: boolean): string {
  const limit = p.maxmoves >= 0 ? `m${p.maxmoves}` : "u";
  return `${p.w}x${p.h}${limit}`;
}

export function decodeParams(s: string): SlideParams {
  // Upstream `decode_params` mutates a struct that started as
  // `default_params()`, so a string with neither `m` nor `u` keeps the default
  // move limit rather than clearing it.
  const p = defaultParams();
  const { w, h, next } = parseDimensions(s);
  p.w = w;
  p.h = h;
  if (s[next] === "m") {
    p.maxmoves = parseLeadingInt(s, next + 1).value;
  } else if (s[next] === "u") {
    p.maxmoves = -1;
  }
  return p;
}

/**
 * The largest board this port will generate. Upstream bounds nothing but the
 * width (`w <= MAXWID`, i.e. what a `DIST` byte can encode) and leaves solver
 * runtime to dictate the real limit — a desktop developer's answer, not a
 * browser's. The generator runs an exhaustive BFS over reachable layouts *per
 * singleton removal and per merge attempt*, and both its time and its **memory**
 * grow explosively with the number of empty squares the main block needs in
 * order to travel.
 *
 * Measured over 5–7 seeds per size, in a plain `node` process (docs/games/testing.md § "Seed-deterministic, never clock-gated" —
 * never judge a generator's cost from inside vitest), after the visited-set
 * optimization in `solver.ts`:
 *
 * | cells | size  | min    | median | worst              |
 * | ----- | ----- | ------ | ------ | ------------------ |
 * | 42    | 7×6   | 0.07 s | 0.16 s | 0.25 s             |
 * | 45    | 9×5   | 0.64 s | 0.97 s | 1.12 s             |
 * | 48    | 8×6   | 0.74 s | 1.18 s | 1.84 s             |
 * | 48    | 12×4  | 0.69 s | 0.70 s | 1.23 s             |
 * | 48    | 6×8   | 0.52 s | 2.73 s | 5.59 s             |
 * | 49    | 7×7   | 0.94 s | 4.92 s | 14.70 s            |
 * | 50    | 10×5  | 6.79 s | 8.75 s | 17.51 s            |
 * | 54    | 9×6   | —      | —      | **4 GB heap OOM**  |
 *
 * So 48 — exactly the area of the largest upstream preset — is where the cliff
 * is: everything at or below it finishes in seconds, 49 already carries a
 * 15-second tail, and 54 does not finish at all. That last row is why this is a
 * bound rather than a retry budget: past the cliff the generator doesn't fail,
 * it exhausts the heap, which in the worker is a crash and not an error message.
 *
 * The check is on the **cell count** rather than on either dimension, because
 * that is what the cost tracks (12×4 and 6×8 are the same area and differ by
 * only 4× in the tail, while 8×6 → 9×6 is one extra column and unbounded).
 */
export const MAX_CELLS = 48;

export function validateParams(p: SlideParams, _full: boolean): string | null {
  // Not upstream's checks. See MAX_CELLS for the measurements.
  if (p.w * p.h > MAX_CELLS)
    return `Width times height must be at most ${MAX_CELLS} (the solver runs out of memory beyond that)`;

  // A limit of 0 asks for a puzzle solvable in no moves at all, i.e. one that
  // starts finished. Nothing satisfies it, so the generator would strip the
  // board bare and then fail; upstream asserts. Reject it where the Custom
  // dialog can say why. Any negative value means "no limit".
  if (p.maxmoves === 0) return "Solution length limit must be at least 1";

  return null;
}

// --- state ------------------------------------------------------------

/** One step of a stored Solve path: slide the block anchored at `from` so its
 * anchor lands on `to`. */
export interface SlideStep {
  readonly from: number;
  readonly to: number;
}

export interface SlideState {
  readonly w: number;
  readonly h: number;
  /** The canonical board bytes (see the module header). */
  readonly board: Uint8Array;
  /** Squares only the main block may slide over. Never changes after
   * `newState`, so every state shares this one array by reference. */
  readonly forcefield: Uint8Array;
  /** Target cell for the main block's anchor. */
  readonly tx: number;
  readonly ty: number;
  /** The generator's minimum solution length, for display only; `-1` when the
   * desc didn't carry one. */
  readonly minmoves: number;
  /** Where the last-moved block's anchor now sits, and where it sat before
   * the player started nudging it — the pair that makes a multi-nudge slide
   * count as one move (see `executeMove`). `-1` for "none". */
  readonly lastmoved: number;
  readonly lastmovedPos: number;
  readonly movecount: number;
  /** A Solve path the player can step through, and how far along it they are.
   * Dropped as soon as the player strays from it or finishes it. */
  readonly soln: readonly SlideStep[] | null;
  readonly solnIndex: number;
}

/** The main block's anchor sits on the target. */
export function status(s: SlideState): GameStatus {
  return s.board[s.ty * s.w + s.tx] === MAINANCHOR ? "solved" : "ongoing";
}

// --- UI (ephemeral; never serialized) ---------------------------------

/**
 * Two independent things, kept apart on purpose.
 *
 * **The grab** is a block picked up and not yet put down. It is reached two
 * ways — a pointer press, or a keyboard select — and the fields below do not
 * record which, because nothing downstream needs to know: both drive the same
 * reachable set and the same `{ kind: "move", from, to }`. It is *ephemeral*,
 * and {@link cancelGrab} drops it whenever the board moves underneath it.
 *
 * **The cursor** is a keyboard player's position on the board. It survives a
 * grab being canceled, because an undo changes the board but not the grid the
 * cursor is clamped to — losing it there would read as a lost keypress.
 */
export interface SlideUi {
  /** A block is picked up — by pointer drag or by keyboard select. */
  grabbed: boolean;
  /** Anchor of the grabbed block, and where its anchor currently sits
   * (snapped to the nearest reachable square). */
  grabAnchor: number;
  grabCurrpos: number;
  /** Which square *within* the block the player grabbed, so the block follows
   * the pointer — or the cursor — under the same square it was picked up by. */
  grabOffsetX: number;
  grabOffsetY: number;
  /** Squares the grabbed block's anchor can be slid to (1 = reachable),
   * computed once at grab time. Length `w*h`. */
  reachable: Uint8Array;
  /** The keyboard cursor's cell, and whether it is on screen. Hidden until the
   * first cursor key, and hidden again by any pointer press — the collection's
   * idiom (Flip, Mosaic). While a block is grabbed the cursor rides *with* it,
   * staying on the square the block was picked up by. */
  cursor: GridCursor;
}

export function newUi(state: SlideState): SlideUi {
  return {
    grabbed: false,
    grabAnchor: -1,
    grabCurrpos: -1,
    grabOffsetX: -1,
    grabOffsetY: -1,
    reachable: new Uint8Array(state.w * state.h),
    cursor: newCursor(),
  };
}

/** Put down whatever is held, leaving the cursor exactly where it is. */
export function cancelGrab(ui: SlideUi): void {
  ui.grabbed = false;
  ui.grabAnchor = -1;
  ui.grabCurrpos = -1;
  ui.grabOffsetX = -1;
  ui.grabOffsetY = -1;
  ui.reachable.fill(0);
}

/** The cell the cursor sits on, as a flat board index. */
export function cursorPos(ui: SlideUi, w: number): number {
  return ui.cursor.y * w + ui.cursor.x;
}

// --- moves ------------------------------------------------------------

/**
 * A slide of one block's anchor, or the arming of a Solve route — where
 * upstream used `"M<from>-<to>"` / `"S<from>-<to>,…"` move strings.
 *
 * A `"solve"` move does **not** fill the board in: it installs a route the
 * player walks with the step key, as Inertia's does. That is a game feature,
 * not the missing-bookkeeping case of
 * docs/games/solver-and-generator.md § "Solve and the generator's aux".
 */
export type SlideMove =
  | { kind: "move"; from: number; to: number }
  | { kind: "solve"; moves: readonly SlideStep[] };

// --- desc codec -------------------------------------------------------

/** The board byte each run-length letter stands for. */
const CELL_OF_LETTER: Record<string, number> = {
  a: ANCHOR,
  m: MAINANCHOR,
  e: EMPTY,
  w: WALL,
};

/**
 * Encode a board as a game description (upstream `new_game_desc`'s tail): a
 * run-length stream of `d<dist>` / `a` / `m` / `e` / `w` cells, each
 * optionally `f`-prefixed for a forcefield and followed by a repeat count,
 * then `,tx,ty,minmoves`.
 *
 * Note that a `d` cell carries **no** `f` prefix — upstream cannot express a
 * forcefield on a block square, and never needs to (the generator sets its
 * forcefield squares `EMPTY`). Byte-match surface, so it is ported exactly.
 */
export function encodeDesc(
  wh: number,
  board: Uint8Array,
  forcefield: Uint8Array,
  tx: number,
  ty: number,
  minmoves: number,
): string {
  let out = "";
  let i = 0;
  while (i < wh) {
    if (isDist(board[i])) {
      out += `d${board[i]}`;
      i++;
    } else {
      const b = board[i];
      const f = forcefield[i];
      const c = b === ANCHOR ? "a" : b === MAINANCHOR ? "m" : b === EMPTY ? "e" : "w";
      if (f) out += "f";
      out += c;
      i++;
      let count = 1;
      while (i < wh && board[i] === b && forcefield[i] === f) {
        i++;
        count++;
      }
      if (count > 1) out += String(count);
    }
  }
  return `${out},${tx},${ty},${minmoves}`;
}

interface SlideDesc {
  board: Uint8Array;
  forcefield: Uint8Array;
  tx: number;
  ty: number;
  minmoves: number;
}

/** The largest `minmoves` read. A solution length has no bound the board
 * states cheaply; this one only keeps the number exact. */
const MAX_MINMOVES = 1_000_000;

/**
 * What {@link encodeDesc} writes: the board's cells, then `,tx,ty` and an
 * optional `,minmoves` (absent, it reads as unknown, `-1`).
 */
function parseDesc(p: SlideParams, desc: string): DescParse<SlideDesc> {
  const { w, h } = p;
  const wh = w * h;
  return readDesc(desc, (r) => {
    const board = new Uint8Array(wh);
    const forcefield = new Uint8Array(wh);
    // Whether each square is the latest square so far of its block — the only
    // square a later `d` may link back to.
    const active = new Uint8Array(wh);
    let mains = 0;
    let i = 0;
    while (i < wh) {
      if (r.accept("d")) {
        const dist = r.int(1, Math.min(i, MAXDIST));
        if (!active[i - dist]) r.fail(DESC_MALFORMED);
        active[i - dist] = 0;
        active[i] = 1;
        board[i] = dist;
        i++;
        continue;
      }
      // A block square carries no forcefield, so `f` never precedes `d`.
      const f = r.accept("f") ? 1 : 0;
      const cell = CELL_OF_LETTER[r.char((c) => Object.hasOwn(CELL_OF_LETTER, c))];
      // A single square is written without a count.
      const count = r.peekIs(isDigit) ? r.int(2, wh) : 1;
      if (i + count > wh) r.fail(DESC_TOO_LONG);
      board.fill(cell, i, i + count);
      forcefield.fill(f, i, i + count);
      active.fill(isAnchor(cell) ? 1 : 0, i, i + count);
      if (cell === MAINANCHOR) mains += count;
      i += count;
    }
    // More cells after a full board.
    if (r.peekIs((c) => c !== ",")) r.fail(DESC_TOO_LONG);
    if (mains !== 1) r.fail(descNeedsOne("main piece", mains));
    r.expect(",");
    const tx = r.int(0, w - 1);
    r.expect(",");
    const ty = r.int(0, h - 1);
    const minmoves = r.accept(",") ? r.int(0, MAX_MINMOVES) : -1;
    r.end();
    return { board, forcefield, tx, ty, minmoves };
  });
}

export function validateDesc(p: SlideParams, desc: string): DescError | null {
  return descVerdict(parseDesc(p, desc));
}

export function newState(p: SlideParams, desc: string): SlideState {
  const { w, h } = p;
  const { board, forcefield, tx, ty, minmoves } = descValue(parseDesc(p, desc));
  return {
    w,
    h,
    board,
    forcefield,
    tx,
    ty,
    minmoves,
    lastmoved: -1,
    lastmovedPos: -1,
    movecount: 0,
    soln: null,
    solnIndex: -1,
  };
}

// --- text format ------------------------------------------------------

/**
 * Render the board as ASCII art (upstream `board_text_format`): a
 * `(2h+1) × (2w+1)` character grid in which cell interiors carry the block's
 * fill character and the gaps between them carry `|`, `-` and `+` wherever two
 * different blocks (or a block and empty space) meet.
 *
 * Two display-only corrections to the C, both invisible outside this function
 * (docs/games/rendering.md § "Display state in a narrow type" — a display bug with unambiguous intent is one you may just
 * fix; the desc differential never touches this path):
 *
 *  - The C decides "is this the main block?" with `data[t] == MAINANCHOR`,
 *    where `t` is the block's *disjoint-set root*. Union-by-size makes that
 *    root the block's second square for a two-square merge, so `data[t]` is a
 *    `DIST` byte and the main block is drawn `%` like any other — the `*` case
 *    can only fire for a one-square main block, which the generator never
 *    makes. Membership is what was meant, so we compare classes.
 *  - The C compares a class *index* against the raw `EMPTY`/`WALL` bytes
 *    (253/252), which alias real indices once `w*h > 252`. Distinct negative
 *    sentinels keep every empty square equal to every other (as intended)
 *    without ever colliding with a class.
 */
export function boardTextFormat(w: number, h: number, data: Uint8Array): string {
  const wh = w * h;
  const dsf = new Dsf(wh);
  for (let i = 0; i < wh; i++) if (isDist(data[i])) dsf.merge(i - data[i], i);

  const T_OUTSIDE = -1;
  const T_EMPTY = -2;
  const T_WALL = -3;

  let mainClass = T_OUTSIDE;
  for (let i = 0; i < wh; i++) if (data[i] === MAINANCHOR) mainClass = dsf.canonify(i);

  const dtype = (i: number): number =>
    isBlock(data[i]) ? dsf.canonify(i) : data[i] === EMPTY ? T_EMPTY : T_WALL;
  const dchar = (t: number): string =>
    t === T_EMPTY ? " " : t === T_WALL ? "#" : t === mainClass ? "*" : "%";

  let out = "";
  for (let y = 0; y < 2 * h + 1; y++) {
    for (let x = 0; x < 2 * w + 1; x++) {
      const i = Math.floor(y / 2) * w + Math.floor(x / 2);
      let v: string;

      if (y % 2 && x % 2) {
        v = dchar(dtype(i));
      } else if (y % 2) {
        const j1 = x > 0 ? dtype(i - 1) : T_OUTSIDE;
        const j2 = x < 2 * w ? dtype(i) : T_OUTSIDE;
        v = j1 !== j2 ? "|" : dchar(j1);
      } else if (x % 2) {
        const j1 = y > 0 ? dtype(i - w) : T_OUTSIDE;
        const j2 = y < 2 * h ? dtype(i) : T_OUTSIDE;
        v = j1 !== j2 ? "-" : dchar(j1);
      } else {
        const j1 = x > 0 && y > 0 ? dtype(i - w - 1) : T_OUTSIDE;
        const j2 = x > 0 && y < 2 * h ? dtype(i - 1) : T_OUTSIDE;
        const j3 = x < 2 * w && y > 0 ? dtype(i - w) : T_OUTSIDE;
        const j4 = x < 2 * w && y < 2 * h ? dtype(i) : T_OUTSIDE;
        if (j1 === j2 && j2 === j3 && j3 === j4) v = dchar(j1);
        else if (j1 === j2 && j3 === j4) v = "|";
        else if (j1 === j3 && j2 === j4) v = "-";
        else v = "+";
      }

      out += v;
    }
    out += "\n";
  }
  return out;
}

/** Upstream `game_text_format`. */
export function textFormat(s: SlideState): string {
  return boardTextFormat(s.w, s.h, s.board);
}

// --- status bar -------------------------------------------------------

/** Upstream's status-bar line (`game_redraw`'s tail). */
export function statusbarText(s: SlideState): string {
  const min = s.minmoves >= 0 ? ` (min ${s.minmoves})` : "";
  return `Moves: ${s.movecount}${min}`;
}

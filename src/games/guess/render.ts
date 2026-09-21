/**
 * Guess — palette, geometry, and rendering. A port of upstream's drawing
 * routines, keeping its per-row caches and PEG_* overlay flags.
 *
 * Nothing floats over the board, so nothing here saves a background: upstream's
 * blitter carried the peg under a drag, and a color is now entered by pressing
 * it rather than by carrying it.
 *
 * Below the rows, where upstream drew a blank box over the hidden answer, is
 * the **answer row**: one slot per peg, each showing a dot for every color —
 * filled while the color could still be there, hollow once the player has
 * ruled it out. It is the game's notation and, on a tap, a palette whose dots
 * sit in the column they enter.
 */

import { BLACK, PINK_WASH, TEAL_WASH, TEN, WHITE } from "../../engine/color/colors.ts";
import { HINT_ACTION, HINT_EVIDENCE, INK } from "../../engine/color/palette.ts";
import { guessBoard, guessEmptySlot } from "../../engine/color/palette-games.ts";
import { glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import {
  type PencilIndicatorStyle,
  pencilIndicatorBox,
  repaintPencilIndicator,
} from "../../engine/pencil-indicator.ts";
import type { Color, Point, Rect, Size } from "../../engine/types.ts";
import type { GuessHighlights } from "./hint.ts";
import {
  FEEDBACK_CORRECTCOLOR,
  FEEDBACK_CORRECTPLACE,
  type GuessMove,
  type GuessParams,
  type GuessState,
  type GuessUi,
  type PegRow,
  type SlotMark,
} from "./state.ts";

// --- color indices (upstream enum) -----------------------------------

export const COL_BACKGROUND = 0;
export const COL_FRAME = 1;
export const COL_CURSOR = 2;
export const COL_FLASH = 3;
export const COL_HOLD = 4;
export const COL_EMPTY = 5; // must be COL_1 - 1
export const COL_1 = 6; // COL_1..COL_10 = 6..15
export const COL_CORRECTPLACE = 16;
export const COL_CORRECTCOLOR = 17;
/** The hint's target: a ring round each answer-row dot a step acts on. */
export const COL_HINT = 18;
/** The hint's evidence: an outline round a row or an answer slot it reads. */
export const COL_HINT_CELL = 19;
export const NCOLORS = 20;

// --- peg overlay flags (upstream PEG_*) -------------------------------

const PEG_CURSOR = 0x1000;
const PEG_HOLD = 0x2000;
const PEG_LABELED = 0x4000;
const PEG_FLAGS = PEG_CURSOR | PEG_HOLD | PEG_LABELED;

// --- size constants ---------------------------------------------------

export const PREFERRED_TILE_SIZE = 32; // PEG_PREFER_SZ
const PEG_GAP = 0.1;
const PEG_HINT = 0.35;
const BORDER = 0.5;

/** Integer division truncating toward zero, matching C's `/` on ints. */
const idiv = (a: number, b: number): number => Math.trunc(a / b);

// --- geometry ---------------------------------------------------------

/** The params the layout depends on, which a draw state carries too.
 *
 * **Not `ncolors`.** The board drew a column of every color down its left side,
 * which is what used to make the palette a term in both dimensions; the colors
 * are on the key panel now, so the board is the guess rows and nothing else. */
type LayoutParams = Pick<GuessParams, "npegs" | "nguesses">;

interface Geom {
  npegs: number;
  nguesses: number;
  tileSize: number;
  hintsz: number;
  gapsz: number;
  border: number;
  pegrad: number;
  hintrad: number;
  guessx: number;
  guessy: number;
  solny: number;
  hintw: number;
  w: number;
  h: number;
}

export function computeSize(p: LayoutParams, tileSize: number): Size {
  const hintw = idiv(p.npegs + 1, 2);
  // Upstream's width carried a literal `2` for the palette column and the gap
  // between it and the rows, and its height took the greater of the column and
  // the rows. Both are gone with the column, which is about a quarter of the
  // board's width back at standard params.
  const hmul =
    BORDER * 2 + p.npegs + PEG_GAP * p.npegs + PEG_HINT * hintw + PEG_GAP * (hintw - 1);
  const vmul = BORDER * 2 + (p.nguesses + 1) + PEG_GAP * (p.nguesses + 1);
  return { w: Math.ceil(tileSize * hmul), h: Math.ceil(tileSize * vmul) };
}

function computeGeometry(p: LayoutParams, tileSize: number): Geom {
  const hintsz = Math.floor(tileSize * PEG_HINT);
  const gapsz = Math.floor(tileSize * PEG_GAP);
  const border = Math.floor(tileSize * BORDER);
  const pegrad = idiv(tileSize - 1, 2);
  const hintrad = idiv(hintsz - 1, 2);

  const guessh = (tileSize + gapsz) * p.nguesses + gapsz + tileSize;

  const { w, h } = computeSize(p, tileSize);
  const guessx = border;
  const guessy = idiv(h - guessh, 2);
  const solny = guessy + (tileSize + gapsz) * p.nguesses + gapsz;
  const hintw = idiv(p.npegs + 1, 2);

  return {
    npegs: p.npegs,
    nguesses: p.nguesses,
    tileSize,
    hintsz,
    gapsz,
    border,
    pegrad,
    hintrad,
    guessx,
    guessy,
    solny,
    hintw,
    w,
    h,
  };
}

// --- geometry accessors (upstream macros) -----------------------------

export const pegOff = (g: Geom): number => g.tileSize + g.gapsz;
const hintOff = (g: Geom): number => g.hintsz + g.gapsz;
const cgap = (g: Geom): number => Math.max(idiv(g.gapsz, 2), 1);

const GUESS_OX = (g: Geom): number => g.guessx;
const GUESS_OY = (g: Geom): number => g.guessy;
const guessX = (g: Geom, p: number): number => g.guessx + p * pegOff(g);
const guessY = (g: Geom, gi: number): number => g.guessy + gi * pegOff(g);
const GUESS_W = (g: Geom): number => g.npegs * pegOff(g);
const GUESS_H = (g: Geom): number => g.nguesses * pegOff(g);

const HINT_OX = (g: Geom): number => GUESS_OX(g) + GUESS_W(g) + g.gapsz;
const HINT_OY = (g: Geom): number =>
  GUESS_OY(g) + idiv(g.tileSize - hintOff(g) - g.hintsz, 2);
const hintX = (g: Geom): number => HINT_OX(g);
const hintY = (g: Geom, gi: number): number => HINT_OY(g) + gi * pegOff(g);
const HINT_W = (g: Geom): number => g.hintw * hintOff(g) - g.gapsz;

const SOLN_OX = (g: Geom): number => GUESS_OX(g);
const SOLN_OY = (g: Geom): number => GUESS_OY(g) + GUESS_H(g) + g.gapsz + 2;
const SOLN_W = (g: Geom): number => GUESS_W(g);
const SOLN_H = (g: Geom): number => pegOff(g);

// --- draw state -------------------------------------------------------

export interface GuessDrawState extends Geom {
  /** How many dots an answer slot holds — the one thing the layout does not
   * depend on and the answer row does. */
  ncolors: number;
  started: boolean;
  solved: number;
  nextGo: number;
  /** Per-row caches of last-drawn pegs (with PEG_* flags) + feedback. */
  guessesCache: PegRow[];
  solutionCache: PegRow;
  /** Per answer slot, the last-drawn {@link answerKey}; `-1` = never drawn. */
  answerCache: number[];
  /** The rows the last frame outlined for a hint, as a key. */
  hintRowsShown: string;
  /** What the pencil-mode indicator shows; `null` = never painted. */
  pencilModeShown: boolean | null;
}

function invalidRow(n: number): PegRow {
  return { pegs: new Array(n).fill(-1), feedback: new Array(n).fill(-1) };
}

export function newDrawState(s: GuessState, tileSize: number): GuessDrawState {
  const p = s.params;
  return {
    ...computeGeometry(p, tileSize),
    ncolors: p.ncolors,
    started: false,
    solved: 0,
    nextGo: 0,
    guessesCache: Array.from({ length: p.nguesses }, () => invalidRow(p.npegs)),
    solutionCache: invalidRow(p.npegs),
    answerCache: new Array(p.npegs).fill(-1),
    hintRowsShown: "",
    pencilModeShown: null,
  };
}

// --- the answer row -----------------------------------------------------

/** How an answer slot's dots are laid out: the squarest grid holding one per
 * color, filled a row at a time in color order. */
function dotGrid(ds: GuessDrawState): {
  cols: number;
  rows: number;
  cw: number;
  ch: number;
} {
  const cols = Math.ceil(Math.sqrt(ds.ncolors));
  const rows = Math.ceil(ds.ncolors / cols);
  return { cols, rows, cw: ds.tileSize / cols, ch: ds.tileSize / rows };
}

function dotCenter(ds: GuessDrawState, pos: number, color: number): Point {
  const { cols, cw, ch } = dotGrid(ds);
  const i = color - 1;
  return {
    x: Math.round(guessX(ds, pos) + (i % cols) * cw + cw / 2),
    y: Math.round(SOLN_OY(ds) + Math.floor(i / cols) * ch + ch / 2),
  };
}

/** A dot's radius, leaving room in its cell for the hint's ring round it. */
function dotRadius(ds: GuessDrawState): number {
  const { cw, ch } = dotGrid(ds);
  return Math.max(1, Math.floor(Math.min(cw, ch) / 2) - 3);
}

/**
 * The answer-row dot under a pointer: its slot and color, or color `0` for a
 * point inside a slot but on no dot. `null` outside every slot.
 *
 * The whole grid cell answers for its dot, not only the drawn circle, because
 * a dot is a small target and the cell is all it has.
 */
export function answerDotAt(ds: GuessDrawState, x: number, y: number): SlotMark | null {
  const ly = y - SOLN_OY(ds);
  if (ly < 0 || ly >= ds.tileSize) return null;
  const off = pegOff(ds);
  const pos = Math.floor((x - GUESS_OX(ds)) / off);
  if (pos < 0 || pos >= ds.npegs) return null;
  const lx = x - guessX(ds, pos);
  if (lx >= ds.tileSize) return null;
  const { cols, cw, ch } = dotGrid(ds);
  const index = Math.floor(ly / ch) * cols + Math.floor(lx / cw);
  return { pos, color: index < ds.ncolors ? index + 1 : 0 };
}

const ANSWER_RING_SHIFT = 11;
const ANSWER_CURSOR = 1 << 22;
const ANSWER_PREMISE = 1 << 23;

/**
 * Everything an answer slot's pixels depend on, as one integer: the colors
 * ruled out (bits `1..10`), the dots a hint rings (the same bits, shifted),
 * the notes cursor and the hint's outline.
 */
function answerKey(
  ruledOut: number,
  ringed: number,
  cursor: boolean,
  premise: boolean,
): number {
  return (
    ruledOut |
    (ringed << ANSWER_RING_SHIFT) |
    (cursor ? ANSWER_CURSOR : 0) |
    (premise ? ANSWER_PREMISE : 0)
  );
}

/** Four rects of thickness `t` just inside `r`: the outline shape a hint mark
 * takes, and the shape the cursor box takes. */
function outline(dr: GameDrawing, r: Rect, t: number, color: number): void {
  dr.drawRect(rect(r.x, r.y, r.w, t), color);
  dr.drawRect(rect(r.x, r.y + r.h - t, r.w, t), color);
  dr.drawRect(rect(r.x, r.y, t, r.h), color);
  dr.drawRect(rect(r.x + r.w - t, r.y, t, r.h), color);
}

function drawAnswerSlot(
  dr: GameDrawing,
  ds: GuessDrawState,
  pos: number,
  key: number,
): void {
  const ts = ds.tileSize;
  const cg = cgap(ds);
  const x = guessX(ds, pos);
  const y = SOLN_OY(ds);
  const area = rect(x - cg, y - cg, ts + cg * 2, ts + cg * 2);
  dr.drawRect(area, COL_BACKGROUND);
  dr.drawRect(rect(x, y, ts, ts), COL_EMPTY);
  const r = dotRadius(ds);
  for (let c = 1; c <= ds.ncolors; c++) {
    const at = dotCenter(ds, pos, c);
    // Hollow in its own color once ruled out, so the grid keeps its shape and
    // every dot stays where the player learned it.
    if (key & (1 << c)) dr.drawCircle(at, r, COL_EMPTY, COL_EMPTY + c);
    else dr.drawCircle(at, r, COL_EMPTY + c, COL_FRAME);
    if (key & (1 << (c + ANSWER_RING_SHIFT))) {
      // A pixel clear of the dot's own outline, so the ring reads as a ring.
      dr.drawCircle(at, r + 2, -1, COL_HINT);
      dr.drawCircle(at, r + 3, -1, COL_HINT);
    }
  }
  if (key & ANSWER_PREMISE) outline(dr, area, cg, COL_HINT_CELL);
  if (key & ANSWER_CURSOR) outline(dr, rect(x, y, ts, ts), 1, COL_CURSOR);
  dr.drawUpdate(area);
}

function answerRowRedraw(
  dr: GameDrawing,
  ds: GuessDrawState,
  s: GuessState,
  ui: GuessUi,
  hl: GuessHighlights | null,
): void {
  for (let pos = 0; pos < ds.npegs; pos++) {
    let ringed = 0;
    for (const d of hl?.dots ?? []) if (d.pos === pos) ringed |= 1 << d.color;
    const cursor = ui.pencilMode && ui.cursor.visible && ui.cursor.x === pos;
    const premise = hl?.slots.includes(pos) ?? false;
    const key = answerKey(s.ruledOut[pos], ringed, cursor, premise);
    if (ds.answerCache[pos] === key) continue;
    ds.answerCache[pos] = key;
    drawAnswerSlot(dr, ds, pos, key);
  }
}

/** The box round a whole scored row, pegs and feedback both. */
function rowBox(ds: GuessDrawState, gi: number): Rect {
  const cg = cgap(ds);
  const x0 = guessX(ds, 0) - cg;
  const y0 = guessY(ds, gi) - cg;
  const x1 = HINT_OX(ds) + HINT_W(ds) + ds.gapsz;
  return rect(x0, y0, x1 - x0, ds.tileSize + cg * 2);
}

// --- colors ----------------------------------------------------------

export function colors(defaultBackground: Color): Color[] {
  const ret: Color[] = new Array(NCOLORS);

  for (let i = 0; i < 10; i++) ret[COL_1 + i] = TEN[i];

  ret[COL_FRAME] = INK;
  // Not `CURSOR`: the cursor rings pegs of all ten hues, green among them.
  ret[COL_CURSOR] = INK;
  // Guess has no solved flash; upstream's `COL_FLASH` slot lights the feedback
  // holes of a row that is ready to mark. It and the held-peg slot are washes,
  // not pegs (so not `HELD`, whose green is one of the ten): they sit *behind*
  // a peg and must not be mistaken for one.
  ret[COL_FLASH] = TEAL_WASH;
  ret[COL_HOLD] = PINK_WASH;
  ret[COL_CORRECTPLACE] = BLACK;
  ret[COL_CORRECTCOLOR] = WHITE;
  ret[COL_BACKGROUND] = guessBoard(defaultBackground);
  ret[COL_EMPTY] = guessEmptySlot(defaultBackground);
  ret[COL_HINT] = HINT_ACTION;
  ret[COL_HINT_CELL] = HINT_EVIDENCE;

  return ret;
}

/** The pencil-mode indicator in ink, like Map's: a glyph in one of the ten peg
 * colors would read as a peg. */
const PENCIL_STYLE: PencilIndicatorStyle = {
  background: COL_BACKGROUND,
  body: COL_FRAME,
  ink: COL_BACKGROUND,
};

// --- low-level draw helpers -------------------------------------------

const rect = (x: number, y: number, w: number, h: number): Rect => ({ x, y, w, h });
const pt = (x: number, y: number): Point => ({ x, y });

function drawPeg(
  dr: GameDrawing,
  ds: GuessDrawState,
  cx: number,
  cy: number,
  labeled: boolean,
  col: number,
): void {
  const ts = ds.tileSize;
  const cg = cgap(ds);
  dr.drawRect(rect(cx - cg, cy - cg, ts + cg * 2, ts + cg * 2), COL_BACKGROUND);
  if (ds.pegrad > 0) {
    dr.drawCircle(
      pt(cx + ds.pegrad, cy + ds.pegrad),
      ds.pegrad,
      COL_EMPTY + col,
      col ? COL_FRAME : COL_EMPTY,
    );
  } else {
    dr.drawRect(rect(cx, cy, ts, ts), COL_EMPTY + col);
  }
  if (labeled && col) {
    dr.drawText(
      pt(cx + ds.pegrad, cy + ds.pegrad),
      glyphFont(ds.pegrad),
      COL_FRAME,
      String(col % 10),
    );
  }
  dr.drawUpdate(rect(cx - cg, cy - cg, ts + cg * 2, ts + cg * 2));
}

function drawCursor(dr: GameDrawing, ds: GuessDrawState, x: number, y: number): void {
  const ts = ds.tileSize;
  const cg = cgap(ds);
  dr.drawCircle(pt(x + ds.pegrad, y + ds.pegrad), ds.pegrad + cg, -1, COL_CURSOR);
  dr.drawUpdate(rect(x - cg, y - cg, ts + cg * 2, ts + cg * 2));
}

/** `guess === -1` draws the revealed solution row. `src` is the row to
 * show (null = blank), `curCol` is the cursor peg index (or -1). */
function guessRedraw(
  dr: GameDrawing,
  ds: GuessDrawState,
  guess: number,
  src: PegRow | null,
  holds: readonly boolean[] | null,
  curCol: number,
  force: boolean,
  labeled: boolean,
): void {
  let dest: PegRow;
  let rowx: number;
  let rowy: number;
  if (guess === -1) {
    dest = ds.solutionCache;
    rowx = SOLN_OX(ds);
    rowy = SOLN_OY(ds);
  } else {
    dest = ds.guessesCache[guess];
    rowx = guessX(ds, 0);
    rowy = guessY(ds, guess);
  }

  for (let i = 0; i < dest.pegs.length; i++) {
    let scol = src ? src.pegs[i] : 0;
    if (i === curCol) scol |= PEG_CURSOR;
    if (holds?.[i]) scol |= PEG_HOLD;
    if (labeled) scol |= PEG_LABELED;
    if (dest.pegs[i] !== scol || force) {
      drawPeg(dr, ds, rowx + pegOff(ds) * i, rowy, labeled, scol & ~PEG_FLAGS);
      if (scol & PEG_CURSOR) drawCursor(dr, ds, rowx + pegOff(ds) * i, rowy);
      if (scol & PEG_HOLD) {
        dr.drawRect(
          rect(
            rowx + pegOff(ds) * i,
            rowy + ds.tileSize + idiv(ds.gapsz, 2) - 2,
            ds.tileSize,
            2,
          ),
          COL_HOLD,
        );
      }
      dr.drawUpdate(
        rect(
          rowx + pegOff(ds) * i,
          rowy + ds.tileSize + idiv(ds.gapsz, 2) - 2,
          ds.tileSize,
          2,
        ),
      );
    }
    dest.pegs[i] = scol;
  }
}

function hintRedraw(
  dr: GameDrawing,
  ds: GuessDrawState,
  guess: number,
  src: PegRow | null,
  force: boolean,
  cursor: boolean,
  markable: boolean,
): void {
  const dest = ds.guessesCache[guess];
  const npegs = dest.feedback.length;
  const emptycol = markable ? COL_FLASH : COL_EMPTY;
  const hintlen = idiv(npegs + 1, 2);

  // Redraw all-or-none (the cursor box wraps the whole section).
  let needRedraw = false;
  for (let i = 0; i < npegs; i++) {
    let scol = src ? src.feedback[i] : 0;
    if (i === 0 && cursor) scol |= PEG_CURSOR;
    if (i === 0 && markable) scol |= PEG_HOLD;
    if (scol !== dest.feedback[i] || force) needRedraw = true;
    dest.feedback[i] = scol;
  }
  if (!needRedraw) return;

  const gap = ds.gapsz;
  const hinth = ds.hintsz + gap + ds.hintsz;
  const hx = hintX(ds) - gap;
  const hy = hintY(ds, guess) - gap;
  const hw = HINT_W(ds) + gap * 2;
  const hh = hinth + gap * 2;

  dr.drawRect(rect(hx, hy, hw, hh), COL_BACKGROUND);

  for (let i = 0; i < npegs; i++) {
    const scol = src ? src.feedback[i] : 0;
    const col =
      scol === FEEDBACK_CORRECTPLACE
        ? COL_CORRECTPLACE
        : scol === FEEDBACK_CORRECTCOLOR
          ? COL_CORRECTCOLOR
          : emptycol;
    let rowx = hintX(ds);
    let rowy = hintY(ds, guess);
    if (i < hintlen) {
      rowx += hintOff(ds) * i;
    } else {
      rowx += hintOff(ds) * (i - hintlen);
      rowy += hintOff(ds);
    }
    if (ds.hintrad > 0) {
      dr.drawCircle(
        pt(rowx + ds.hintrad, rowy + ds.hintrad),
        ds.hintrad,
        col,
        col === emptycol ? emptycol : COL_FRAME,
      );
    } else {
      dr.drawRect(rect(rowx, rowy, ds.hintsz, ds.hintsz), col);
    }
  }
  if (cursor) {
    const cg = cgap(ds);
    const x1 = hx + cg;
    const y1 = hy + cg;
    const x2 = hx + hw - cg;
    const y2 = hy + hh - cg;
    dr.drawLine(pt(x1, y1), pt(x2, y1), COL_CURSOR, 1);
    dr.drawLine(pt(x2, y1), pt(x2, y2), COL_CURSOR, 1);
    dr.drawLine(pt(x2, y2), pt(x1, y2), COL_CURSOR, 1);
    dr.drawLine(pt(x1, y2), pt(x1, y1), COL_CURSOR, 1);
  }
  dr.drawUpdate(rect(hx, hy, hw, hh));
}

function currmoveRedraw(
  dr: GameDrawing,
  ds: GuessDrawState,
  guess: number,
  col: number,
): void {
  const ox = guessX(ds, 0);
  const oy = guessY(ds, guess);
  const off = idiv(ds.tileSize, 4);
  dr.drawRect(rect(ox - off - 1, oy, 2, ds.tileSize), col);
  dr.drawUpdate(rect(ox - off - 1, oy, 2, ds.tileSize));
}

// --- game_redraw ------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: GuessDrawState,
  _prev: GuessState | null,
  s: GuessState,
  _dir: number,
  ui: GuessUi,
  _animTime: number,
  _flashTime: number,
  hint?: HintStep<GuessMove>,
): void {
  const newMove = s.nextGo !== ds.nextGo || !ds.started;
  const hl = (hint?.highlights as GuessHighlights | undefined) ?? null;

  // A row the hint outlines is outlined after the rows are drawn, over their
  // edges. When the set changes, the old outlines are painted out and every row
  // redrawn, since an outline crosses the gap between a row's pegs and its
  // feedback, which neither of them repaints.
  const hintRows = (hl?.rows ?? []).filter((gi) => gi < s.params.nguesses);
  const hintRowsKey = hintRows.join(",");
  const forceRows = hintRowsKey !== ds.hintRowsShown;
  if (forceRows && ds.started) {
    for (const gi of ds.hintRowsShown ? ds.hintRowsShown.split(",").map(Number) : []) {
      outline(dr, rowBox(ds, gi), cgap(ds), COL_BACKGROUND);
      dr.drawUpdate(rowBox(ds, gi));
    }
  }
  ds.hintRowsShown = hintRowsKey;

  if (!ds.started) {
    // The engine paints no pixels of its own: fill the background here.
    dr.drawRect(rect(0, 0, ds.w, ds.h), COL_BACKGROUND);
    dr.drawRect(
      rect(SOLN_OX(ds), SOLN_OY(ds) - ds.gapsz - 1, SOLN_W(ds), 2),
      COL_FRAME,
    );
    dr.drawUpdate(rect(0, 0, ds.w, ds.h));
  }

  // Past guesses + their hints (reverse order so the circular cursor on
  // the active row isn't overdrawn by the row above).
  for (let i = s.params.nguesses - 1; i >= 0; i--) {
    if (i < s.nextGo || s.solved) {
      guessRedraw(dr, ds, i, s.guesses[i], null, -1, forceRows, ui.showLabels);
      hintRedraw(
        dr,
        ds,
        i,
        s.guesses[i],
        forceRows || i === s.nextGo - 1,
        false,
        false,
      );
    } else if (i > s.nextGo) {
      guessRedraw(dr, ds, i, null, null, -1, forceRows, ui.showLabels);
      hintRedraw(dr, ds, i, null, forceRows, false, false);
    }
  }
  if (!s.solved) {
    // The active (incomplete) row, drawn from the game_ui. In notes mode the
    // cursor is in the answer row instead, where the next mark goes.
    const cursorHere = ui.cursor.visible && !ui.pencilMode;
    guessRedraw(
      dr,
      ds,
      s.nextGo,
      { pegs: ui.currPegs, feedback: [] },
      ui.holds,
      cursorHere ? ui.cursor.x : -1,
      forceRows,
      ui.showLabels,
    );
    hintRedraw(
      dr,
      ds,
      s.nextGo,
      null,
      true,
      cursorHere && ui.cursor.x === s.params.npegs,
      ui.markable,
    );
  }
  for (const gi of hintRows) outline(dr, rowBox(ds, gi), cgap(ds), COL_HINT_CELL);
  for (const gi of hintRows) dr.drawUpdate(rowBox(ds, gi));

  // The "current move" / "able to mark" marker beside the active row.
  if (newMove) currmoveRedraw(dr, ds, ds.nextGo, COL_BACKGROUND);
  if (!s.solved) currmoveRedraw(dr, ds, s.nextGo, COL_HOLD);

  // The solution box (or its reveal).
  if ((s.solved === 0) !== (ds.solved === 0) || !ds.started) {
    dr.drawRect(rect(SOLN_OX(ds), SOLN_OY(ds), SOLN_W(ds), SOLN_H(ds)), COL_BACKGROUND);
    dr.drawUpdate(rect(SOLN_OX(ds), SOLN_OY(ds), SOLN_W(ds), SOLN_H(ds)));
    ds.answerCache.fill(-1);
  }
  if (!s.solved) answerRowRedraw(dr, ds, s, ui, hl);
  else {
    guessRedraw(
      dr,
      ds,
      -1,
      { pegs: s.solution.slice(), feedback: [] },
      null,
      -1,
      ds.solved === 0,
      ui.showLabels,
    );
  }
  repaintPencilIndicator(
    dr,
    ds,
    ui.pencilMode,
    pencilIndicatorBox({ w: ds.w, h: ds.h }, ds.tileSize),
    PENCIL_STYLE,
  );

  ds.solved = s.solved;
  ds.nextGo = s.nextGo;
  ds.started = true;
}

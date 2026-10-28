/**
 * Undead rendering — port of `game_redraw` and its helpers from `undead.c`.
 *
 * Layout: a monster-count row across the top, then the `w × h` grid framed by a
 * one-tile border of sighting clues. Each interior cell draws a mirror (a thick
 * diagonal), a placed monster (a drawn ghost/vampire/zombie shape, or a letter
 * in ASCII mode), or a 2×2 grid of pencil notes. The count blocks and edge clues
 * recolor red on error and dim when complete / struck. Cells are diffed against
 * a per-monster-cell cache; the Check & Save mistake overlay rides a sidecar in
 * the diff key (docs/rendering.md § "The tile cache and the diff key"). The
 * fork's pencil-mode indicator sits in the top-right border corner.
 *
 * Upstream computes `cell_errors` but never *renders* them (only the count
 * blocks and edge clues turn red), and neither does this port; the inset red
 * outline is the separate Check & Save mistake overlay.
 */

import {
  cellSurface,
  clueDoneColor,
  ERROR,
  FLASH,
  FLASH_LEAD,
  givenSurface,
  HINT_OUTLINE,
  highlightWash,
  INK,
  PENCIL_BODY,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import {
  undeadGhost,
  undeadVampire,
  undeadZombie,
} from "../../engine/color/palette-games.ts";
import { drawStrike, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { HintMarks, type MarkBand, type MarkCell } from "../../engine/hint-mark.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import {
  cellHighlight,
  drawCellBackground,
  winHighlight,
} from "../../engine/note-taking-cell.ts";
import {
  HINT_AREA,
  HINT_TARGET,
  OverlaySidecar,
} from "../../engine/overlay-sidecar.ts";
import {
  type PencilIndicatorStyle,
  pencilIndicatorBox,
  pencilIndicatorReach,
  repaintPencilIndicator,
} from "../../engine/pencil-indicator.ts";
import { type GridCursor, newCursor } from "../../engine/pointer.ts";
import { NOTHING_TO_CLEAR, type RingClear, textBox } from "../../engine/ring.ts";
import type { Color, Point, Rect, Size } from "../../engine/types.ts";
import { type Flash, sweepStep, type WinTone, winSlot } from "../../engine/win-wave.ts";
import {
  CELL_MIRROR_L,
  COUNT_STYLE_PLACED_TOTAL,
  COUNT_STYLE_REMAINING,
  COUNT_STYLE_REMAINING_TOTAL,
  COUNT_STYLE_TOTAL,
  isSingleton,
  MON_GHOST,
  MON_VAMPIRE,
  MON_ZOMBIE,
  MONSTERS,
  range2grid,
  type UndeadMove,
  type UndeadState,
  type UndeadUi,
} from "./state.ts";

/** Highlight payload an Undead hint step carries (built in `index.ts`). See
 * docs/hints-marks.md § "The engine colors the marks". Coordinates are
 * interior (1-based) grid cells, matching `redraw`/`findMistakes`. */
export interface UndeadHint {
  /** The driving sightline's bounce path, outlined `COL_HINT_CELL` (evidence). */
  area: Point[];
  /** The cell(s) the deduction acts on, ringed. */
  targets: Point[];
  /** The candidate monster(s) ruled out, shown struck through in the notes. */
  marks: { x: number; y: number; monster: number }[];
}

export const PREFERRED_TILE_SIZE = 64;

const f = Math.floor;
const idiv = (a: number, b: number): number => Math.trunc(a / b);

// --- palette ---------------------------------------------------------------

export const COL_BACKGROUND = 0; // the board around the grid
export const COL_GRID = 1; // the line between two cells, and the frame
export const COL_TEXT = 2;
export const COL_ERROR = 3;
export const COL_HIGHLIGHT = 4;
export const COL_FLASH = 5;
export const COL_GHOST = 6;
export const COL_ZOMBIE = 7;
export const COL_VAMPIRE = 8;
export const COL_DONE = 9;
export const COL_PENCIL_BODY = 10;
// The explained-hint legend (docs/hints-marks.md § "The engine colors the
// marks"); the ring on the cell(s) the deduction acts on is the engine's.
export const COL_HINT_CELL = 11; // the driving sightline's bounce path (evidence)
export const COL_CELL = 12; // the surface of a cell the player fills
/** The lifted surface of what the puzzle fixed: a mirror, or a given monster. */
export const COL_GIVEN = 13;
/** The ground of a cell, a clue or a count the win flash's leading edge is
 * on; its body is {@link COL_FLASH}. */
export const COL_FLASH_LEAD = 14;

export function colors(defaultBackground: Color): Color[] {
  const bg = defaultBackground;
  const out: Color[] = [];
  out[COL_BACKGROUND] = bg;
  out[COL_GRID] = surfaceGrid(bg);
  out[COL_CELL] = cellSurface(bg);
  out[COL_GIVEN] = givenSurface(bg);
  out[COL_TEXT] = INK;
  out[COL_ERROR] = ERROR;
  out[COL_HIGHLIGHT] = highlightWash(bg);
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  out[COL_GHOST] = undeadGhost(bg);
  out[COL_ZOMBIE] = undeadZombie(bg);
  out[COL_VAMPIRE] = undeadVampire(bg);
  out[COL_DONE] = clueDoneColor(bg);
  out[COL_PENCIL_BODY] = PENCIL_BODY;
  out[COL_HINT_CELL] = HINT_OUTLINE;
  return out;
}

// --- geometry --------------------------------------------------------------

/**
 * The margin on every side. It carries the room the pencil indicator needs at
 * the canvas's top-right — the monster-count row spans the board's whole width
 * (`calculateCountLayout`), so that corner is not otherwise free — and takes it
 * on all four sides, so the board stays centered in its canvas rather than
 * sitting left of it.
 *
 * Exported because `interpretMove` maps a pixel back through this same origin,
 * and a second copy of it there would drift from this one.
 */
export const border = (ts: number): number => f(ts / 4) + pencilIndicatorReach(ts);

export function computeSize(p: { w: number; h: number }, ts: number): Size {
  // `border` already carries the indicator's margin, on every side.
  const b = border(ts);
  return { w: 2 * b + (p.w + 2) * ts, h: 2 * b + (p.h + 3) * ts };
}

// --- draw state ------------------------------------------------------------

export interface UndeadDrawState {
  started: boolean;
  tileSize: number;
  w: number;
  h: number;
  /** `numTotal` last-drawn monster bitmasks. */
  monsters: Int8Array;
  /** `numTotal` last-drawn pencil bitmasks. */
  pencil: Uint8Array;
  /** `wh` last-drawn cell-error flags (staleness only — see file note). */
  cellErrors: Uint8Array;
  /** `2·numPaths` last-drawn edge-clue error / done flags. */
  hintErrors: Uint8Array;
  hintsDone: Uint8Array;
  countErrors: Uint8Array;
  countPlaced: Int32Array;
  cursor: GridCursor;
  pencilMode: boolean;
  /** The win flash's tone on each cell and edge clue as last drawn,
   * indexed as the grid is, and on each of the three counts. */
  lit: Uint8Array;
  countLit: Uint8Array;
  ascii: boolean;
  countStyle: number;
  countFontsize: number;
  countW: number;
  countGap: number;
  countPadding: number;
  /** `wh` hint-overlay sidecar (fork addition): bit 0 = target cell, bit 1 =
   * evidence area, and the struck-monster mask in its `struck` lane. Owns the
   * repack/stale/commit dance that keeps the overlay in the cache diff key
   * (docs/rendering.md § "The tile cache and the diff key"). */
  hint: OverlaySidecar;
  /** `wh` mistake-overlay sidecar (Check & Save) — same dance. */
  wrong: OverlaySidecar;
  /** The hint target's ring and the evidence area's outline (fork additions),
   * drawn after the cell loop. See {@link markBand}. */
  marks: HintMarks;
  pencilModeShown: boolean | null;
}

export function newDrawState(state: UndeadState, tileSize: number): UndeadDrawState {
  const common = state.common;
  return {
    started: false,
    tileSize,
    w: common.w,
    h: common.h,
    monsters: new Int8Array(common.numTotal).fill(7),
    pencil: new Uint8Array(common.numTotal),
    cellErrors: new Uint8Array(common.wh),
    hintErrors: new Uint8Array(2 * common.numPaths),
    hintsDone: new Uint8Array(2 * common.numPaths),
    countErrors: new Uint8Array(3),
    countPlaced: new Int32Array(3),
    cursor: newCursor(),
    pencilMode: false,
    lit: new Uint8Array(common.wh),
    countLit: new Uint8Array(3),
    ascii: false,
    countStyle: COUNT_STYLE_TOTAL,
    countFontsize: 0,
    countW: 0,
    countGap: 0,
    countPadding: 0,
    hint: new OverlaySidecar(common.wh),
    wrong: new OverlaySidecar(common.wh),
    marks: new HintMarks(),
    pencilModeShown: null,
  };
}

// --- count-row layout (calculate_count_layout) -----------------------------

function calculateCountLayout(ds: UndeadDrawState): void {
  const ts = ds.tileSize;
  const COUNT_MSIZE = idiv(2 * ts, 3);
  const COUNT_GAP = idiv(ts, 3);
  const COUNT_FONTSIZE = idiv(ts, 2);
  const COUNT_PADDING = idiv(ts, 10);
  const DIGIT_WIDTH = 0.6;
  const totalW = (ds.w + 2) * ts;
  const maxDigits = String(ds.w * ds.h).length;

  let maxChars: number;
  if (ds.countStyle === COUNT_STYLE_REMAINING) maxChars = 1 + maxDigits;
  else if (ds.countStyle === COUNT_STYLE_PLACED_TOTAL)
    maxChars = maxDigits + 0.5 + maxDigits;
  else if (ds.countStyle === COUNT_STYLE_REMAINING_TOTAL)
    // remaining (with a possible minus sign when over-placed) / total
    maxChars = 1 + maxDigits + 0.5 + maxDigits;
  else maxChars = maxDigits;

  let fontsize = COUNT_FONTSIZE;
  let padding = COUNT_PADDING;
  let numberW = Math.trunc(maxChars * DIGIT_WIDTH * fontsize);
  let blockW = COUNT_MSIZE + padding + numberW;
  let gap = Math.min(COUNT_GAP, idiv(totalW - 3 * blockW, 2));

  if (gap < 0) {
    padding -= Math.min(idiv(-gap, 3), padding);
    blockW = COUNT_MSIZE + padding + numberW;
    gap = idiv(totalW - 3 * blockW, 2);
    if (gap < 0) {
      fontsize = Math.trunc(
        (totalW / 3 - COUNT_MSIZE - padding) / (maxChars * DIGIT_WIDTH),
      );
      fontsize = Math.max(fontsize, idiv(ts, 10));
      numberW = Math.trunc(maxChars * DIGIT_WIDTH * fontsize);
      blockW = COUNT_MSIZE + padding + numberW;
      gap = idiv(totalW - 3 * blockW, 2);
    }
    gap = Math.max(gap, 0);
  }

  ds.countFontsize = fontsize;
  ds.countW = blockW;
  ds.countGap = gap;
  ds.countPadding = padding;
}

const countX = (ds: UndeadDrawState, c: number): number =>
  border(ds.tileSize) +
  idiv((ds.w + 2) * ds.tileSize - ds.countW, 2) +
  (c - 1) * (ds.countGap + ds.countW);
const countY = (ts: number): number => border(ts);

/** The count block (0/1/2) under pixel `(px, py)`, or `-1`. Used by
 * `interpretMove` to place/clear a monster by clicking its count. */
export function countBlockAt(ds: UndeadDrawState, px: number, py: number): number {
  const ts = ds.tileSize;
  if (ts <= 0 || ds.countW <= 0) return -1;
  if (py < countY(ts) || py >= countY(ts) + ts) return -1;
  for (let c = 0; c < 3; c++) {
    if (px >= countX(ds, c) && px < countX(ds, c) + ds.countW) return c;
  }
  return -1;
}

// --- primitives ------------------------------------------------------------

function drawCircleOrPoint(
  dr: GameDrawing,
  cx: number,
  cy: number,
  radius: number,
  color: number,
): void {
  if (radius > 0) dr.drawCircle({ x: cx, y: cy }, radius, color, color);
  else dr.drawRect({ x: cx, y: cy, w: 1, h: 1 }, color);
}

/** Draw a monster shape centered at `(x, y)` into a `ts`-wide box (upstream
 * `draw_monster`). `ts` is the monster's own display size, not the tile size.
 * The paired features loop left then right. */
function drawMonster(
  dr: GameDrawing,
  x: number,
  y: number,
  ts: number,
  monster: number,
): void {
  const black = COL_TEXT;
  const m25 = idiv(2 * ts, 5);

  if (monster === MON_GHOST) {
    dr.clip({
      x: x - f(ts / 2) + 2,
      y: y - f(ts / 2) + 2,
      w: ts - 3,
      h: f(ts / 2) + 1,
    });
    dr.drawCircle({ x, y }, m25, COL_GHOST, black);
    dr.unclip();

    const poly: Point[] = [
      { x: x - m25, y: y - 2 },
      { x: x - m25, y: y + m25 },
    ];
    for (let j = 0; j < 3; j++) {
      const total = m25 * 2;
      const before = idiv(total * j, 3);
      const after = idiv(total * (j + 1), 3);
      const mid = idiv(before + after, 2);
      poly.push({ x: x - m25 + mid, y: y + m25 - idiv(total, 6) });
      poly.push({ x: x - m25 + after, y: y + m25 });
    }
    poly.push({ x: x + m25, y: y - 2 });

    dr.clip({ x: x - f(ts / 2) + 2, y, w: ts - 3, h: ts - f(ts / 2) - 1 });
    dr.drawPolygon(poly, COL_GHOST, black);
    dr.unclip();

    const eyeY = y - f(ts / 12);
    const pupil = f(ts / 48);
    for (const s of [-1, 1]) {
      dr.drawCircle(
        { x: x + s * f(ts / 6), y: eyeY },
        f(ts / 10),
        COL_BACKGROUND,
        black,
      );
    }
    for (const s of [-1, 1]) {
      drawCircleOrPoint(dr, x + s * f(ts / 6) + 1 + pupil, eyeY, pupil, black);
    }
  } else if (monster === MON_VAMPIRE) {
    dr.clip({ x: x - f(ts / 2) + 2, y: y - f(ts / 2) + 2, w: ts - 3, h: f(ts / 2) });
    dr.drawCircle({ x, y }, m25, black, black);
    dr.unclip();

    dr.clip({
      x: x - f(ts / 2) + 2,
      y: y - f(ts / 2) + 2,
      w: f(ts / 2) + 1,
      h: f(ts / 2),
    });
    dr.drawCircle({ x: x - f(ts / 7), y }, m25 - f(ts / 7), COL_VAMPIRE, black);
    dr.unclip();
    dr.clip({ x, y: y - f(ts / 2) + 2, w: f(ts / 2) + 1, h: f(ts / 2) });
    dr.drawCircle({ x: x + f(ts / 7), y }, m25 - f(ts / 7), COL_VAMPIRE, black);
    dr.unclip();

    dr.clip({ x: x - f(ts / 2) + 2, y, w: ts - 3, h: f(ts / 2) });
    dr.drawCircle({ x, y }, m25, COL_VAMPIRE, black);
    dr.unclip();

    const eyeY = y - f(ts / 16);
    for (const s of [-1, 1]) {
      dr.drawCircle(
        { x: x + s * f(ts / 7), y: eyeY },
        f(ts / 16),
        COL_BACKGROUND,
        black,
      );
    }
    drawCircleOrPoint(dr, x - f(ts / 7), eyeY, f(ts / 48), black);
    drawCircleOrPoint(dr, x + f(ts / 7), eyeY, f(ts / 48), black);

    dr.clip({ x: x - f(ts / 2) + 2, y: y + f(ts / 8), w: ts - 3, h: f(ts / 4) });
    for (const s of [-1, 1]) {
      dr.drawPolygon(
        [
          { x: x + s * idiv(3 * ts, 16), y: y + idiv(ts, 8) },
          { x: x + s * idiv(2 * ts, 16), y: y + idiv(7 * ts, 24) },
          { x: x + s * idiv(1 * ts, 16), y: y + idiv(ts, 8) },
        ],
        COL_BACKGROUND,
        black,
      );
    }
    dr.drawCircle({ x, y: y - f(ts / 5) }, m25, COL_VAMPIRE, black);
    dr.unclip();
  } else if (monster === MON_ZOMBIE) {
    dr.drawCircle({ x, y }, m25, COL_ZOMBIE, black);

    // Crossed-out eyes.
    const eyeY = y - f(ts / 12);
    const r = f(ts / 16);
    for (const s of [-1, 1]) {
      const ex = x + s * f(ts / 7);
      dr.drawLine({ x: ex - r, y: eyeY - r }, { x: ex + r, y: eyeY + r }, black, 1);
      dr.drawLine({ x: ex + r, y: eyeY - r }, { x: ex - r, y: eyeY + r }, black, 1);
    }

    const mouthY = y + f(ts / 6);
    dr.clip({ x: x - f(ts / 5), y: mouthY, w: m25 + 1, h: f(ts / 2) });
    dr.drawCircle({ x: x - f(ts / 15), y: mouthY }, f(ts / 12), COL_BACKGROUND, black);
    dr.unclip();
    dr.drawLine(
      { x: x - f(ts / 5), y: mouthY },
      { x: x + f(ts / 5), y: mouthY },
      black,
      1,
    );
  }
}

// --- cell + furniture drawing ----------------------------------------------

function cellCenter(
  ds: UndeadDrawState,
  x: number,
  y: number,
): { dx: number; dy: number } {
  const ts = ds.tileSize;
  return {
    dx: border(ts) + x * ts + f(ts / 2),
    dy: border(ts) + y * ts + f(ts / 2) + ts,
  };
}

/** A cell's `TILESIZE − 1` square, inside the grid lines around it. */
function cellRect(ds: UndeadDrawState, x: number, y: number): Rect {
  const ts = ds.tileSize;
  const { dx, dy } = cellCenter(ds, x, y);
  return { x: dx - f(ts / 2) + 1, y: dy - f(ts / 2) + 1, w: ts - 1, h: ts - 1 };
}

/**
 * Where a hint mark sits around cell `(x, y)` (border-ring coordinates) —
 * straddling the grid line, one pixel of gutter and a couple of the cell's own
 * edge.
 *
 * Undead's cells are `TILESIZE − 1` squares on a `TILESIZE` pitch over a
 * `COL_GRID` backing rectangle, so a single pixel between them is real gutter and
 * is what `HintMarks` paints back when a mark moves; the rest lies inside the
 * cell, where the cell's own repaint undoes it.
 *
 * The inner reach is bounded by the pencil glyphs rather than chosen: a penciled
 * monster is a circle of radius `2/5` of its `TILESIZE/2` box, centered a quarter
 * of a tile in, so it clears the cell edge by `TILESIZE/20`.
 */
function markBand(ds: UndeadDrawState, x: number, y: number): MarkBand {
  return {
    box: cellRect(ds, x, y),
    outer: 1,
    inner: Math.max(2, f(ds.tileSize / 24)),
  };
}

function drawMirror(
  dr: GameDrawing,
  ds: UndeadDrawState,
  x: number,
  y: number,
  mirror: number,
): void {
  const ts = ds.tileSize;
  const { dx, dy } = cellCenter(ds, x, y);
  // `\` falls to the right, `/` rises.
  const d = f(ts / 4);
  const fall = mirror === CELL_MIRROR_L ? d : -d;
  dr.drawLine(
    { x: dx - d, y: dy - fall },
    { x: dx + d, y: dy + fall },
    COL_TEXT,
    f(ts / 16),
  );
  dr.drawUpdate(cellRect(ds, x, y));
}

function drawBigMonster(
  dr: GameDrawing,
  ds: UndeadDrawState,
  x: number,
  y: number,
  monster: number,
  ascii: boolean,
): void {
  const ts = ds.tileSize;
  const { dx, dy } = cellCenter(ds, x, y);
  if (ascii) {
    const { origin, options } = bigMonsterText(ds, x, y);
    dr.drawText(origin, options, COL_TEXT, monsterLetter(monster));
    dr.drawUpdate({
      x: dx - f(ts / 2) + 2,
      y: dy - f(ts / 2) + 2,
      w: ts - 3,
      h: ts - 3,
    });
  } else {
    drawMonster(dr, dx, dy, idiv(3 * ts, 4), monster);
    dr.drawUpdate({
      x: dx - f(ts / 2) + 2,
      y: dy - f(ts / 2) + 2,
      w: ts - 3,
      h: ts - 3,
    });
  }
}

const monsterLetter = (monster: number): string =>
  monster === MON_GHOST
    ? "G"
    : monster === MON_VAMPIRE
      ? "V"
      : monster === MON_ZOMBIE
        ? "Z"
        : " ";

/** Where cell `(x, y)` draws a placed monster's letter: the arguments
 * `drawText` takes but the color, so the tile and a hint's ring read one
 * place. */
function bigMonsterText(ds: UndeadDrawState, x: number, y: number) {
  const { dx, dy } = cellCenter(ds, x, y);
  return { origin: { x: dx, y: dy }, options: glyphFont(f(ds.tileSize / 2)) };
}

/** Where cell `(x, y)`'s notes go: the monsters in `pencil` fill a 2×2 grid in
 * reading order, each at the center of its slot, which is where a letter is
 * drawn too. */
function pencilSlots(ds: UndeadDrawState, x: number, y: number, pencil: number) {
  const ts = ds.tileSize;
  const dx = border(ts) + x * ts + f(ts / 4);
  const dy = border(ts) + y * ts + f(ts / 4) + ts;
  return MONSTERS.filter((m) => pencil & m).map((m, slot) => ({
    m,
    origin: {
      x: dx + f(ts / 2) * (slot % 2),
      y: dy + f(ts / 2) * Math.floor(slot / 2),
    },
    options: glyphFont(f(ts / 4)),
  }));
}

/** The text cell `(x, y)` shows, for a hint's ring to keep clear of: the
 * letters of ASCII mode. A monster drawn as a picture is a shape, and an edge
 * clue sits in its own cell, past the one pixel a ring reaches outside its
 * cell. */
function cellText(
  ds: UndeadDrawState,
  state: UndeadState,
  ascii: boolean,
  x: number,
  y: number,
): RingClear {
  const { common } = state;
  if (!ascii || x < 1 || y < 1 || x > common.w || y > common.h) return NOTHING_TO_CLEAR;
  const xi = common.xinfo[x + y * (common.w + 2)];
  if (xi < 0) return NOTHING_TO_CLEAR;
  if (isSingleton(state.guess[xi])) {
    const { origin, options } = bigMonsterText(ds, x, y);
    const letter = monsterLetter(state.guess[xi]);
    return { enclose: [textBox(origin, options, letter)], avoid: [] };
  }
  const notes = pencilSlots(ds, x, y, state.pencil[xi]).map(({ m, origin, options }) =>
    textBox(origin, options, monsterLetter(m)),
  );
  return { enclose: notes, avoid: [] };
}

function drawPencils(
  dr: GameDrawing,
  ds: UndeadDrawState,
  x: number,
  y: number,
  pencil: number,
  ascii: boolean,
  struck: number,
  cell: Rect,
): void {
  const ts = ds.tileSize;
  const dx = border(ts) + x * ts + f(ts / 4);
  const dy = border(ts) + y * ts + f(ts / 4) + ts;
  for (const { m, origin, options } of pencilSlots(ds, x, y, pencil)) {
    const { x: cx, y: cy } = origin;
    if (!ascii) drawMonster(dr, cx, cy, f(ts / 2), m);
    else dr.drawText(origin, options, COL_TEXT, monsterLetter(m));
    // A struck candidate keeps its glyph and gains a strikethrough in the
    // note's own ink, the ink of its letter and of its monster's outline.
    if (struck & m)
      drawStrike(dr, { x: cx, y: cy }, f(ts / 3), COL_TEXT, cell, { slant: true });
  }
  dr.drawUpdate({
    x: dx - f(ts / 4) + 2,
    y: dy - f(ts / 4) + 2,
    w: f(ts / 2) - 3,
    h: f(ts / 2) - 3,
  });
}

function drawMonsterCountBackground(dr: GameDrawing, ds: UndeadDrawState): void {
  const ts = ds.tileSize;
  dr.drawRect(
    { x: 0, y: countY(ts), w: 2 * border(ts) + (ds.w + 2) * ts, h: ts },
    COL_BACKGROUND,
  );
  dr.drawUpdate({ x: 0, y: countY(ts), w: 2 * border(ts) + (ds.w + 2) * ts, h: ts });
}

function drawMonsterCount(
  dr: GameDrawing,
  ds: UndeadDrawState,
  state: UndeadState,
  c: number,
  hflash: WinTone,
): void {
  const ts = ds.tileSize;
  const dx = countX(ds, c);
  const dy = countY(ts);
  const dw = ds.countW;
  const dh = ts;
  const msize = idiv(2 * ts, 3);
  const placed = ds.countPlaced[c];
  const common = state.common;
  const total = [common.numGhosts, common.numVampires, common.numZombies][c];
  const bufm = c === 0 ? "G" : c === 1 ? "V" : "Z";

  let buf: string;
  if (ds.countStyle === COUNT_STYLE_REMAINING) {
    if (placed === total) buf = "0";
    else if (placed > total) buf = String(placed - total);
    else buf = `−${total - placed}`; // U+2212 minus sign
  } else if (ds.countStyle === COUNT_STYLE_PLACED_TOTAL) {
    buf = `${placed}/${total}`;
  } else if (ds.countStyle === COUNT_STYLE_REMAINING_TOTAL) {
    // remaining-to-place / total-needed; a negative remaining (over-placed) shows
    // a proper minus sign and renders red via the color logic below.
    const remaining = total - placed;
    const left = remaining < 0 ? `−${-remaining}` : String(remaining);
    buf = `${left}/${total}`;
  } else {
    buf = String(total);
  }

  dr.drawRect(
    { x: dx, y: dy, w: dw + ds.countGap, h: dh },
    hflash ? winSlot(hflash, COL_FLASH, COL_FLASH_LEAD) : COL_BACKGROUND,
  );
  if (!ds.ascii) {
    drawMonster(dr, dx + f(msize / 2), dy + f(dh / 2), msize, 1 << c);
  } else {
    dr.drawText(
      { x: dx + f(msize / 2), y: dy + f(dh / 2) },
      glyphFont(idiv(ts, 2)),
      COL_TEXT,
      bufm,
    );
  }
  const color =
    state.countErrors[c] || placed > total
      ? COL_ERROR
      : placed === total
        ? COL_DONE
        : COL_TEXT;
  dr.drawText(
    { x: dx + msize + ds.countPadding, y: dy + f(dh / 2) },
    {
      align: "left",
      baseline: "mathematical",
      fontType: "variable",
      size: ds.countFontsize,
    },
    color,
    buf,
  );
  dr.drawUpdate({ x: dx, y: dy, w: dw + ds.countGap, h: dh });
}

/** An edge sighting clue, in border cell `(x, y)`. */
function drawClue(
  dr: GameDrawing,
  ds: UndeadDrawState,
  x: number,
  y: number,
  color: number,
  clue: number,
  lit: WinTone,
): void {
  const ts = ds.tileSize;
  const dx = border(ts) + x * ts;
  const dy = border(ts) + y * ts + ts;
  const box = { x: dx + 2, y: dy + 2, w: ts - 3, h: ts - 3 };
  dr.drawRect(box, lit ? winSlot(lit, COL_FLASH, COL_FLASH_LEAD) : COL_BACKGROUND);
  dr.drawText(
    { x: dx + f(ts / 2), y: dy + f(ts / 2) },
    glyphFont(idiv(ts, 2)),
    color,
    String(clue),
  );
  dr.drawUpdate(box);
}

function rectOutline(
  dr: GameDrawing,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
): void {
  dr.drawPolygon(
    [
      { x, y },
      { x: x + w, y },
      { x: x + w, y: y + h },
      { x, y: y + h },
    ],
    -1,
    color,
  );
}

const PENCIL_STYLE: PencilIndicatorStyle = {
  background: COL_BACKGROUND,
  body: COL_PENCIL_BODY,
  ink: COL_TEXT,
};

/** The margin `computeSize` grows for it, at the canvas's top-right. */
const PENCIL_BOX = (ds: UndeadDrawState) =>
  pencilIndicatorBox(computeSize(ds, ds.tileSize), ds.tileSize);

// --- redraw ----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: UndeadDrawState,
  _prev: UndeadState | null,
  state: UndeadState,
  _dir: number,
  ui: UndeadUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<UndeadMove, UndeadHint>,
  mistakes?: readonly { x: number; y: number }[],
): void {
  const ts = ds.tileSize;
  const common = state.common;
  const w = ds.w;
  const h = ds.h;
  const stride = common.w + 2;
  const b = border(ts);
  // The win flash's tone on the cell or edge clue at grid `(x, y)`, and
  // whether that differs from the frame last drawn.
  const light = (x: number, y: number): { lit: WinTone; changed: boolean } => {
    const xy = x + y * stride;
    const lit = flash.win(sweepStep(x, y));
    const changed = ds.lit[xy] !== lit;
    ds.lit[xy] = lit;
    return { lit, changed };
  };

  if (!ds.started) {
    // The backing the cells leave showing as the grid: one pixel between two
    // cells, and one round the outside, so the frame is a grid line.
    dr.drawRect({ x: b + ts, y: b + 2 * ts, w: w * ts + 1, h: h * ts + 1 }, COL_GRID);
    ds.marks.reset(); // the backing rect just erased every grid line
  }

  const hchanged =
    ds.cursor.x !== ui.cursor.x ||
    ds.cursor.y !== ui.cursor.y ||
    ds.cursor.visible !== ui.cursor.visible ||
    ds.pencilMode !== ui.pencilMode;
  const changedAscii = ds.ascii !== ui.ascii;
  if (changedAscii) ds.ascii = ui.ascii;
  const changedCountStyle = ds.countStyle !== ui.countStyle;
  if (changedCountStyle) ds.countStyle = ui.countStyle;

  // Placed counts.
  const placed = [0, 0, 0];
  for (let i = 0; i < common.numTotal; i++) {
    if (state.guess[i] === MON_GHOST) placed[0]++;
    else if (state.guess[i] === MON_VAMPIRE) placed[1]++;
    else if (state.guess[i] === MON_ZOMBIE) placed[2]++;
  }

  if (changedCountStyle) drawMonsterCountBackground(dr, ds);
  if (changedCountStyle || !ds.started) calculateCountLayout(ds);

  for (let i = 0; i < 3; i++) {
    // A count sits in the row above the top clues, at its own column.
    const column = (countX(ds, i) + ds.countW / 2 - b) / ts - 0.5;
    const hflash = flash.win(sweepStep(column, -1));
    let stale =
      !ds.started || ds.countLit[i] !== hflash || changedAscii || changedCountStyle;
    ds.countLit[i] = hflash;
    if (ds.countErrors[i] !== state.countErrors[i]) {
      stale = true;
      ds.countErrors[i] = state.countErrors[i];
    }
    if (ds.countPlaced[i] !== placed[i]) {
      stale = true;
      ds.countPlaced[i] = placed[i];
    }
    if (stale) drawMonsterCount(dr, ds, state, i, hflash);
  }

  // The edge clues.
  const isClueStale = (index: number, litChanged: boolean): boolean => {
    let ret = litChanged;
    if (!ds.started) ret = true;
    if (ds.hintErrors[index] !== state.hintErrors[index]) {
      ds.hintErrors[index] = state.hintErrors[index];
      ret = true;
    }
    if (ds.hintsDone[index] !== state.hintsDone[index]) {
      ds.hintsDone[index] = state.hintsDone[index];
      ret = true;
    }
    return ret;
  };
  const clueColor = (index: number): number => {
    if (state.hintErrors[index]) return COL_ERROR;
    if (state.hintsDone[index]) return COL_DONE;
    return COL_TEXT;
  };
  const drawClueAt = (index: number, clue: number): void => {
    const g = range2grid(index, common.w, common.h);
    const { lit, changed } = light(g.x, g.y);
    if (!isClueStale(index, changed)) return;
    drawClue(dr, ds, g.x, g.y, clueColor(index), clue, lit);
  };
  for (const path of common.paths) {
    drawClueAt(path.gridStart, path.sightingsStart);
    drawClueAt(path.gridEnd, path.sightingsEnd);
  }

  // The two overlay sidecars. Hint: bit 0 target, bit 1 area, and the struck
  // monster mask in its `struck` lane.
  const index = (x: number, y: number) => x + y * stride;
  ds.hint.pack(stepMarks(hint), index, (m) => m.n);
  ds.wrong.packCells(mistakes ?? null, index);

  const targets: MarkCell[] = [];
  const evidence: MarkCell[] = [];
  for (let x = 1; x < w + 1; x++) {
    for (let y = 1; y < h + 1; y++) {
      const packed = ds.hint.packed[x + y * stride];
      if (packed & HINT_TARGET) targets.push({ x, y });
      if (packed & HINT_AREA) evidence.push({ x, y });
    }
  }
  const markStyle = {
    band: (x: number, y: number) => markBand(ds, x, y),
    text: (x: number, y: number) => cellText(ds, state, ui.ascii, x, y),
    evidenceColor: COL_HINT_CELL,
  };
  const underErased = new Uint8Array(ds.hint.packed.length);
  ds.marks.eraseBeforeTiles(dr, targets, evidence, markStyle, COL_GRID, (x, y) => {
    if (x >= 1 && x <= w && y >= 1 && y <= h) underErased[x + y * stride] = 1;
  });

  // Grid cells.
  for (let x = 1; x < w + 1; x++) {
    for (let y = 1; y < h + 1; y++) {
      const xy = x + y * stride;
      const xi = common.xinfo[xy];
      const c = common.grid[xy];

      const { lit: hflash, changed } = light(x, y);
      let stale = !ds.started || changed || changedAscii || underErased[xy] === 1;
      if (
        hchanged &&
        ((x === ui.cursor.x && y === ui.cursor.y) ||
          (x === ds.cursor.x && y === ds.cursor.y))
      )
        stale = true;
      if (xi >= 0 && state.guess[xi] !== ds.monsters[xi]) {
        stale = true;
        ds.monsters[xi] = state.guess[xi];
      }
      if (xi >= 0 && state.pencil[xi] !== ds.pencil[xi]) {
        stale = true;
        ds.pencil[xi] = state.pencil[xi];
      }
      if (state.cellErrors[xy] !== ds.cellErrors[xy]) {
        stale = true;
        ds.cellErrors[xy] = state.cellErrors[xy];
      }
      if (ds.hint.stale(xy)) stale = true;
      if (ds.wrong.stale(xy)) stale = true;

      if (stale) {
        const struck = ds.hint.struck[xy];
        // Both hint marks are drawn after this loop, the ring round the cell
        // and the outline on its border, so the cell paints its ordinary
        // background and a marked cell keeps showing the candidates the hint
        // is reasoning about.
        const cell = cellRect(ds, x, y);
        // A mirror and a given monster are the puzzle's, told by the cell
        // under them.
        const given = xi < 0 || common.fixed[xi] !== 0;
        drawCellBackground(
          dr,
          cell,
          winHighlight(hflash) ?? cellHighlight(ui, x, y),
          COL_HIGHLIGHT,
          given ? COL_GIVEN : COL_CELL,
          COL_FLASH,
          COL_FLASH_LEAD,
        );
        ds.hint.drawHatch(dr, xy, cell, ds.tileSize);
        dr.drawUpdate(cell);
        if (xi < 0) {
          drawMirror(dr, ds, x, y, c);
        } else if (isSingleton(state.guess[xi])) {
          drawBigMonster(dr, ds, x, y, state.guess[xi], ui.ascii);
        } else {
          drawPencils(dr, ds, x, y, state.pencil[xi], ui.ascii, struck, cell);
        }
        if (ds.wrong.at(xy)) {
          const { dx, dy } = cellCenter(ds, x, y);
          for (const inset of [2, 3]) {
            rectOutline(
              dr,
              dx - f(ts / 2) + inset,
              dy - f(ts / 2) + inset,
              ts - 2 * inset,
              ts - 2 * inset,
              COL_ERROR,
            );
          }
          dr.drawUpdate(cellRect(ds, x, y));
        }
        ds.hint.commit(xy);
        ds.wrong.commit(xy);
      }
    }
  }

  // The hint marks, after the cell loop and outside every clip, because they
  // straddle the grid line.
  ds.marks.paint(dr, targets, evidence, markStyle);

  // Pencil-mode indicator (fork addition).
  repaintPencilIndicator(dr, ds, ui.pencilMode, PENCIL_BOX(ds), PENCIL_STYLE);

  ds.cursor.x = ui.cursor.x;
  ds.cursor.y = ui.cursor.y;
  ds.cursor.visible = ui.cursor.visible;
  ds.pencilMode = ui.pencilMode;
  ds.started = true;
}

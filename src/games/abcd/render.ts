/**
 * ABCD rendering — idiomatic port of `game_redraw` / the draw helpers from
 * `abcd.c`.
 *
 * The `A…` border letters sit in the top-left gutter, the edge clues along the
 * top and left borders (red when a clue is exceeded or can no longer be met),
 * and a `w × h` block of cells: each holds an entered letter (red on an
 * adjacency violation, else the guess color) or, when empty, its pencil marks.
 * Under diagonal mode each interior corner carries a small cross as the
 * no-diagonal-touch cue. A solved board runs a diagonal-stripe flash. The
 * geometry is upstream's `NARROW_BORDERS` arm, which has no border.
 *
 * A cell's pixels depend only on its own letter, pencil marks and a small flag
 * set (cursor, pencil cursor, adjacency error, flash phase), so a per-tile
 * `Int32Array` cache suffices, with the Check & Save overlay in a sidecar so a
 * mistaken but unchanged cell still repaints (docs/games/rendering.md § "The
 * tile cache and the diff key").
 */

import { mkhighlight } from "../../engine/color/color-mkhighlight.ts";
import {
  ERROR,
  GRID_MID,
  HINT_ACTION,
  HINT_EVIDENCE,
  highlightWash,
  INK,
  PENCIL_BODY,
  pencilColor,
  playerEntryColor,
} from "../../engine/color/palette.ts";
import { abcdBorderLetter } from "../../engine/color/palette-games.ts";
import { glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { fromCoord as geometryFromCoord } from "../../engine/geometry.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { HintMarks, type MarkBand, type MarkCell } from "../../engine/hint-mark.ts";
import {
  type CellHighlight,
  cellHighlight,
  drawCellBackground,
  HIGHLIGHT_NONE,
} from "../../engine/note-taking-cell.ts";
import {
  HINT_AREA,
  HINT_TARGET,
  hintMarkBit,
  OverlaySidecar,
} from "../../engine/overlay-sidecar.ts";
import {
  type PencilIndicatorStyle,
  pencilIndicatorBox,
  pencilIndicatorCanvas,
  pencilIndicatorReach,
  repaintPencilIndicator,
} from "../../engine/pencil-indicator.ts";
import type { Color, Point, Size } from "../../engine/types.ts";
import type { AbcdHint } from "./hint.ts";
import {
  type AbcdMove,
  type AbcdState,
  type AbcdUi,
  EMPTY,
  horClue,
  letterBit,
  NO_NUMBER,
  verClue,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 36;
export const FLASH_TIME = 0.7;
const FLASH_FRAME = 0.1;

// --- palette (index-for-index with the upstream COL_* enum) ----------------

export const COL_OUTERBG = 0;
export const COL_INNERBG = 1;
export const COL_GRID = 2;
export const COL_BORDERLETTER = 3;
export const COL_TEXT = 4;
export const COL_GUESS = 5;
export const COL_ERROR = 6;
export const COL_PENCIL = 7;
export const COL_HIGHLIGHT = 8;
export const COL_LOWLIGHT = 9;
// Fork addition, appended past the upstream enum (ABCD has no dark-mode
// paletteOverrides, so a plain append is safe): the yellow body of the shared
// pencil-mode indicator glyph.
export const COL_PENCIL_BODY = 10;
/** The highlight's wash, in both its full-cell and its corner form. Upstream
 * used `COL_HIGHLIGHT`, mkhighlight's near-white, which the dark-mode pass
 * inverts to near-black; that one stays the completion flash's light stripe. */
export const COL_CURSOR = 11;
/** The hint's action color: its target rings, hatch and the clue it reads. */
export const COL_HINT = 12;
/** The hint's evidence color: the outline of the squares a reason rests on. */
export const COL_HINT_CELL = 13;

export function colors(defaultBackground: Color): Color[] {
  const outer = defaultBackground;
  const { background: inner, highlight, lowlight } = mkhighlight(defaultBackground);
  const out: Color[] = [];
  out[COL_OUTERBG] = outer;
  out[COL_INNERBG] = inner;
  out[COL_GRID] = GRID_MID;
  out[COL_BORDERLETTER] = abcdBorderLetter(outer);
  out[COL_TEXT] = INK;
  out[COL_GUESS] = playerEntryColor(inner);
  out[COL_ERROR] = ERROR;
  out[COL_PENCIL] = pencilColor(inner);
  out[COL_HIGHLIGHT] = highlight;
  out[COL_LOWLIGHT] = lowlight;
  out[COL_PENCIL_BODY] = PENCIL_BODY;
  // A fill under the letter and its notes: the note-taking cell's "you are
  // here" wash, which every game in that mechanic shares, not the green mark.
  out[COL_CURSOR] = highlightWash(inner);
  out[COL_HINT] = HINT_ACTION;
  out[COL_HINT_CELL] = HINT_EVIDENCE;
  return out;
}

// --- geometry --------------------------------------------------------------

const outerCoord = (v: number, ts: number): number => v * ts + pencilIndicatorReach(ts);
const innerCoord = (v: number, ts: number, n: number): number =>
  (v + n) * ts + pencilIndicatorReach(ts);

/** Pixel → grid cell along one axis (returns an out-of-range index off-grid).
 * The origin is the margin plus `n` whole tiles: the clue rows and columns sit
 * outside the grid, and the margin outside them. */
export function fromCoord(px: number, ts: number, n: number): number {
  return geometryFromCoord(px, ts, n * ts + pencilIndicatorReach(ts));
}

export function computeSize(p: { w: number; h: number; n: number }, ts: number): Size {
  // The +1 is upstream's `NARROW_BORDERS` tile-background allowance. The margin
  // around it is the room the pencil indicator needs at the canvas's top-right,
  // where the clue rows otherwise run to the corner — taken on every side, so
  // the board stays centered rather than sitting left of it.
  return pencilIndicatorCanvas({ w: (p.w + p.n) * ts + 1, h: (p.h + p.n) * ts }, ts);
}

// --- draw state ------------------------------------------------------------

// Cache-key bit layout for a cell's packed tile value.
const K_LETTER = 0; // bits 0-3: letter + 1 (0 = empty)
const K_HIGHLIGHT = 4; // bits 4-5: the cell's `CellHighlight`
const DF_ERR = 1 << 6; // this letter breaks an adjacency rule
const K_FLASH = 7; // bits 7-8: flash phase + 1 (0 = not flashing)
const K_PENCIL = 9; // bits 9+: the n-bit pencil-mark mask

export interface AbcdDrawState {
  started: boolean;
  tileSize: number;
  /** `w·h` last-drawn packed tile values (-1 = never drawn). */
  tiles: Int32Array;
  /** `(w+h)·n` last-drawn clue looks (-1 = never drawn): {@link CLUE_ERR},
   * {@link CLUE_HATCHED}, {@link CLUE_READ}. */
  clueLook: Int8Array;
  /** Mistake-overlay sidecar (fork addition) — keeps Check & Save in the diff key. */
  wrong: OverlaySidecar;
  /** The displayed hint: target and evidence bits, the hatch, and each struck
   * note at `hintMarkBit(letter)`. */
  hint: OverlaySidecar;
  /** The hint's rings and outline, painted once per frame after the tiles. */
  marks: HintMarks;
  /** Whether the pencil-mode indicator was on last frame (fork addition). */
  pencilModeShown: boolean | null;
}

/** A clue that is exceeded or can no longer be met. */
const CLUE_ERR = 1;
/** A clue slot on the line the hint names. */
const CLUE_HATCHED = 2;
/** The clue whose count the hint reads. */
const CLUE_READ = 4;

export function newDrawState(state: AbcdState, tileSize: number): AbcdDrawState {
  const { w, h, n } = state.params;
  return {
    started: false,
    tileSize,
    tiles: new Int32Array(w * h).fill(-1),
    clueLook: new Int8Array((w + h) * n).fill(-1),
    wrong: new OverlaySidecar(w * h),
    hint: new OverlaySidecar(w * h),
    marks: new HintMarks(),
    pencilModeShown: null,
  };
}

// --- error computation (base render, not findMistakes) ---------------------

/** Per-clue "over- or under-satisfiable" flag (upstream `abcd_count_clues`). */
function computeClueErrors(state: AbcdState): Uint8Array {
  const { w, h, n } = state.params;
  const { grid, numbers } = state;
  const err = new Uint8Array((w + h) * n);
  for (const horizontal of [true, false]) {
    const amx = horizontal ? h : w;
    const bmx = horizontal ? w : h;
    for (let a = 0; a < amx; a++) {
      for (let i = 0; i < n; i++) {
        const pos = horizontal ? horClue(a, i, n) : verClue(a, i, n, h);
        const clue = numbers[pos];
        if (clue === NO_NUMBER) continue;
        let found = 0;
        let empty = 0;
        for (let b = 0; b < bmx; b++) {
          const g = grid[horizontal ? a * w + b : b * w + a];
          if (g === i + 1) found++;
          else if (g === EMPTY) empty++;
        }
        if (found > clue || found + empty < clue) err[pos] = 1;
      }
    }
  }
  return err;
}

/** Per-cell "shares its letter with an identical neighbor" flag
 * (upstream `abcd_set_errors_adjacent`, all directions OR-ed). */
function computeAdjacencyErrors(state: AbcdState): Uint8Array {
  const { w, h, diag } = state.params;
  const g = state.grid;
  const err = new Uint8Array(w * h);
  const scan = (
    sx: number,
    sy: number,
    ex: number,
    ey: number,
    dx: number,
    dy: number,
  ): void => {
    for (let x = sx; x < ex; x++) {
      for (let y = sy; y < ey; y++) {
        const c = g[y * w + x];
        if (c !== EMPTY && c === g[(y + dy) * w + (x + dx)]) {
          err[y * w + x] = 1;
          err[(y + dy) * w + (x + dx)] = 1;
        }
      }
    }
  };
  scan(0, 0, w - 1, h, 1, 0); // horizontal
  scan(0, 0, w, h - 1, 0, 1); // vertical
  if (diag) {
    scan(0, 0, w - 1, h - 1, 1, 1); // topleft-bottomright
    scan(0, 1, w - 1, h, 1, -1); // bottomleft-topright
  }
  return err;
}

// --- drawing helpers -------------------------------------------------------

/** Draw `text` centered in the tile whose top-left is `(x, y)`, in the
 * half-tile font of every letter and clue except the pencil marks. */
function drawTileText(
  dr: GameDrawing,
  x: number,
  y: number,
  ts: number,
  color: number,
  text: string,
): void {
  const half = (ts / 2) | 0;
  dr.drawText({ x: x + half, y: y + half }, glyphFont(half), color, text);
}

/** The `A…` letters along the bottom and right edges of the top-left gutter,
 * sharing the corner letter. */
function drawBorderLetters(dr: GameDrawing, ts: number, n: number): void {
  const edge = outerCoord(n - 1, ts);
  for (let i = 0; i < n; i++) {
    const letter = String.fromCharCode(65 + i);
    drawTileText(dr, outerCoord(i, ts), edge, ts, COL_BORDERLETTER, letter);
    if (i < n - 1)
      drawTileText(dr, edge, outerCoord(i, ts), ts, COL_BORDERLETTER, letter);
  }
}

/** A cell's pencil marks, laid out by upstream's arithmetic. Bit
 * `hintMarkBit(i)` of `struck` is a letter the displayed hint rules out, drawn
 * with a line through it. */
function drawPencilMarks(
  dr: GameDrawing,
  state: AbcdState,
  ts: number,
  x: number,
  y: number,
  struck: number,
): void {
  const { w, n } = state.params;
  const notes = state.pencil[y * w + x];
  const ox = innerCoord(x, ts, n);
  const oy = innerCoord(y, ts, n);
  let nhints = 0;
  for (let i = 0; i < n; i++) if (notes & letterBit(i)) nhints++;
  if (nhints === 0) return;

  let hw = 1;
  while (hw * hw < nhints) hw++;
  if (hw < 3) hw = 3;
  let hh = ((nhints + hw - 1) / hw) | 0;
  if (hh < 2) hh = 2;
  const hmax = Math.max(hw, hh);
  const denom = ((hmax * (11 - hmax)) / 8) | 0;
  const fontsz = denom > 0 ? (ts / denom) | 0 : ts;

  let j = 0;
  for (let i = 0; i < n; i++) {
    if (!(notes & letterBit(i))) continue;
    const hx = j % hw;
    const hy = (j / hw) | 0;
    const at = {
      x: (ox + ((4 * hx + 3) * ts) / (4 * hw + 2)) | 0,
      y: (oy + ((4 * hy + 3) * ts) / (4 * hh + 2)) | 0,
    };
    dr.drawText(at, glyphFont(fontsz), COL_PENCIL, String.fromCharCode(65 + i));
    // The struck note keeps its own color, so it still reads as the player's
    // note; the line through it is what says the hint rules it out.
    if (struck & hintMarkBit(i)) {
      const r = Math.max(2, (fontsz / 3) | 0);
      dr.drawLine({ x: at.x - r, y: at.y }, { x: at.x + r, y: at.y }, COL_PENCIL, 2);
    }
    j++;
  }
}

/** The box a cell's background fills, and so where a hint's band sits inside
 * it: the cell's own repaint then undoes a band that moves on. */
function cellBox(x: number, y: number, ts: number, n: number) {
  return { x: innerCoord(x, ts, n) + 1, y: innerCoord(y, ts, n), w: ts - 1, h: ts - 1 };
}

function markBand(x: number, y: number, ts: number, n: number): MarkBand {
  return { box: cellBox(x, y, ts, n), outer: 0, inner: Math.max(2, ts >> 4) };
}

function drawTile(
  dr: GameDrawing,
  ds: AbcdDrawState,
  state: AbcdState,
  x: number,
  y: number,
  fs: number,
  flash: number,
  wrong: boolean,
): void {
  const ts = ds.tileSize;
  const { w, n, diag } = state.params;
  const tx = innerCoord(x, ts, n);
  const ty = innerCoord(y, ts, n);
  const flashing = flash >= 0;
  const i = y * w + x;
  const letter = state.grid[i];
  const box = cellBox(x, y, ts, n);

  // Background: a diagonal stripe while flashing, else the cell's highlight.
  drawCellBackground(
    dr,
    box,
    flashing ? HIGHLIGHT_NONE : (((fs >> K_HIGHLIGHT) & 3) as CellHighlight),
    COL_CURSOR,
    flashing && (x + y) % 3 === flash
      ? COL_HIGHLIGHT
      : flashing && (x + y + 2) % 3 === flash
        ? COL_LOWLIGHT
        : COL_INNERBG,
  );
  ds.hint.drawHatch(dr, i, box, COL_HINT, ts);

  if (letter !== EMPTY) {
    dr.drawText(
      { x: tx + ((ts / 2) | 0), y: ty + ((ts / 2) | 0) },
      glyphFont((ts / 2) | 0),
      fs & DF_ERR ? COL_ERROR : COL_GUESS,
      String.fromCharCode(64 + letter),
    );
  } else {
    drawPencilMarks(dr, state, ts, x, y, ds.hint.packed[i]);
  }

  // Cell border.
  dr.drawPolygon(
    [
      { x: tx, y: ty - 1 },
      { x: tx + ts, y: ty - 1 },
      { x: tx + ts, y: ty + ts - 1 },
      { x: tx, y: ty + ts - 1 },
    ],
    -1,
    COL_GRID,
  );

  // Diagonal-mode corner crosses (interior corners only).
  const d = (ts / 6) | 0;
  if (diag && x > 0 && y > 0)
    dr.drawLine({ x: tx, y: ty - 1 }, { x: tx + d, y: ty + d - 1 }, COL_GRID, 1);
  if (diag && x < w - 1 && y > 0)
    dr.drawLine(
      { x: tx + ts, y: ty - 1 },
      { x: tx + ts - d, y: ty + d - 1 },
      COL_GRID,
      1,
    );
  if (diag && x > 0 && y < state.params.h - 1)
    dr.drawLine(
      { x: tx, y: ty + ts - 1 },
      { x: tx + d, y: ty + ts - d - 1 },
      COL_GRID,
      1,
    );
  if (diag && x < w - 1 && y < state.params.h - 1)
    dr.drawLine(
      { x: tx + ts, y: ty + ts - 1 },
      { x: tx + ts - d, y: ty + ts - d - 1 },
      COL_GRID,
      1,
    );

  // Check & Save mistake overlay (fork addition): an inset red outline.
  if (wrong) {
    const l = tx;
    const t = ty;
    const r = tx + ts - 1;
    const b = ty + ts - 1;
    for (const inset of [2, 3]) {
      dr.drawLine(
        { x: l + inset, y: t + inset },
        { x: r - inset, y: t + inset },
        COL_ERROR,
        1,
      );
      dr.drawLine(
        { x: r - inset, y: t + inset },
        { x: r - inset, y: b - inset },
        COL_ERROR,
        1,
      );
      dr.drawLine(
        { x: r - inset, y: b - inset },
        { x: l + inset, y: b - inset },
        COL_ERROR,
        1,
      );
      dr.drawLine(
        { x: l + inset, y: b - inset },
        { x: l + inset, y: t + inset },
        COL_ERROR,
        1,
      );
    }
  }

  dr.drawUpdate({ x: tx, y: ty, w: ts, h: ts });
}

// --- pencil-mode indicator -------------------------------------------------

const PENCIL_STYLE: PencilIndicatorStyle = {
  background: COL_OUTERBG,
  body: COL_PENCIL_BODY,
  ink: COL_GRID,
};
/** The margin `computeSize` grows for it, at the canvas's top-right. */
const PENCIL_BOX = (p: { w: number; h: number; n: number }, ts: number) =>
  pencilIndicatorBox(computeSize(p, ts), ts);

// --- redraw ----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: AbcdDrawState,
  _prev: AbcdState | null,
  state: AbcdState,
  _dir: number,
  ui: AbcdUi,
  _animTime: number,
  flashTime: number,
  hint?: HintStep<AbcdMove, AbcdHint>,
  mistakes?: readonly Point[],
): void {
  const ts = ds.tileSize;
  const { w, h, n } = state.params;

  if (!ds.started) {
    drawBorderLetters(dr, ts, n);
    ds.started = true;
  }

  const flash = flashTime > 0 ? Math.floor(flashTime / FLASH_FRAME) % 3 : -1;
  const index = (x: number, y: number): number => y * w + x;
  ds.wrong.packCells(mistakes ?? null, index);
  ds.hint.pack(hint?.highlights ?? null, index, (m) => hintMarkBit(m.n - 1));

  // Clues (redraw only those whose look changed). The hint hatches the named
  // line on through its clue slots, and draws the count it reads in its color.
  const clueErr = computeClueErrors(state);
  const read = hint?.highlights?.clue ?? -1;
  // The clue's line: `numbers` holds the row clues, then the column clues.
  const readLine = read < 0 ? -1 : Math.floor(read / n);
  const lineHatched = read >= 0 && (hint?.highlights?.hatch?.length ?? 0) > 0;
  for (const horizontal of [true, false]) {
    const amx = horizontal ? h : w;
    for (let a = 0; a < amx; a++) {
      const hatched = lineHatched && readLine === (horizontal ? a : h + a);
      for (let i = 0; i < n; i++) {
        const pos = horizontal ? horClue(a, i, n) : verClue(a, i, n, h);
        const look =
          (clueErr[pos] ? CLUE_ERR : 0) |
          (hatched ? CLUE_HATCHED : 0) |
          (pos === read ? CLUE_READ : 0);
        if (ds.clueLook[pos] === look) continue;
        const oo = outerCoord(i, ts);
        const oi = innerCoord(a, ts, n);
        const ox = horizontal ? oo : oi;
        const oy = horizontal ? oi : oo;
        const slot = { x: ox, y: oy, w: ts - 1, h: ts - 1 };
        dr.drawRect(slot, COL_OUTERBG);
        if (look & CLUE_HATCHED) dr.drawHatch(slot, COL_HINT, hatchPeriod(ts));
        const clue = state.numbers[pos];
        if (clue !== NO_NUMBER) {
          const color =
            look & CLUE_ERR ? COL_ERROR : look & CLUE_READ ? COL_HINT : COL_TEXT;
          drawTileText(dr, ox, oy, ts, color, String(clue));
        }
        dr.drawUpdate(slot);
        ds.clueLook[pos] = look;
      }
    }
  }

  // Grid tiles.
  const adjErr = computeAdjacencyErrors(state);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let fs = 0;
      fs |= cellHighlight(ui, x, y) << K_HIGHLIGHT;
      if (adjErr[i]) fs |= DF_ERR;

      const letter = state.grid[i];
      const pencilMask = letter === EMPTY ? state.pencil[i] : 0;
      const tile =
        (letter << K_LETTER) | fs | ((flash + 1) << K_FLASH) | (pencilMask << K_PENCIL);

      if (ds.tiles[i] !== tile || ds.wrong.stale(i) || ds.hint.stale(i)) {
        drawTile(dr, ds, state, x, y, fs, flash, ds.wrong.at(i));
        ds.tiles[i] = tile;
        ds.wrong.commit(i);
        ds.hint.commit(i);
      }
    }
  }

  // The hint's marks, after every tile, so no tile painted this frame covers one.
  const targets: MarkCell[] = [];
  const evidence: MarkCell[] = [];
  for (let i = 0; i < w * h; i++) {
    const c = { x: i % w, y: (i / w) | 0 };
    if (ds.hint.packed[i] & HINT_TARGET) targets.push(c);
    if (ds.hint.packed[i] & HINT_AREA) evidence.push(c);
  }
  ds.marks.paint(dr, targets, evidence, {
    band: (x, y) => markBand(x, y, ts, n),
    targetColor: COL_HINT,
    evidenceColor: COL_HINT_CELL,
  });

  // Pencil-mode indicator (fork addition): the sticky-pencil "mode on" glyph.
  repaintPencilIndicator(
    dr,
    ds,
    ui.pencilMode,
    PENCIL_BOX(state.params, ts),
    PENCIL_STYLE,
  );
}

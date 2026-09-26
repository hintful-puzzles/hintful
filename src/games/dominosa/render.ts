/**
 * dominosa rendering — port of upstream's `game_redraw` / `draw_tile`. Each
 * square packs its full draw state (domino type, clash, highlights, barrier
 * edges, cursor sub-position, flash, and the mistake, hint and reference
 * overlays) into one `Int32Array` cache word, so the diff key covers every
 * overlay by construction (docs/games/rendering.md § "Overlay sidecars").
 *
 * Geometry follows upstream's web build (`NARROW_BORDERS`): `BORDER` is minus
 * the domino gutter, so the gutters bleed to the canvas edge.
 */

import { mkhighlight } from "../../engine/color/color-mkhighlight.ts";
import { GREEN, PURPLE, RED, RED_BOLD } from "../../engine/color/colors.ts";
import {
  ERROR,
  HINT_ACTION,
  HINT_EVIDENCE,
  INK,
  lineNoColor,
  PAPER,
} from "../../engine/color/palette.ts";
import { drawRectCorners, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import {
  type HintMarkStyle,
  HintMarks,
  type MarkBand,
  type MarkCell,
  MarkOutlines,
} from "../../engine/hint-mark.ts";
import type { Color, Size } from "../../engine/types.ts";
import type { DominosaHint } from "./index.ts";
import {
  boardSize,
  DCOUNT,
  DINDEX,
  type DominosaMistake,
  type DominosaMove,
  type DominosaShape,
  type DominosaState,
  type DominosaUi,
  EDGE_B,
  EDGE_L,
  EDGE_R,
  EDGE_T,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 32;
export const FLASH_TIME = 0.13;

// --- palette (mirrors the dominosa.c color enum index-for-index) ----------
export const COL_BACKGROUND = 0;
export const COL_TEXT = 1;
export const COL_DOMINO = 2;
export const COL_DOMINOCLASH = 3;
export const COL_DOMINOTEXT = 4;
export const COL_EDGE = 5;
export const COL_HIGHLIGHT_1 = 6;
export const COL_HIGHLIGHT_2 = 7;
// Fork overlays, appended past the upstream enum.
export const COL_MISTAKE = 8;
export const COL_HINT = 9; // the acted-on square's ring / the suggested edge
export const COL_HINT_CELL = 10; // the evidence squares' outline
// The reference-panel spotlight boxing a domino's candidate placements: violet,
// distinct from the mistake (red), hint (blue) and value-highlight (red/green)
// colors.
export const COL_REFERENCE = 11;

export function colors(defaultBackground: Color): Color[] {
  const { background } = mkhighlight(defaultBackground);
  const out: Color[] = [];
  out[COL_BACKGROUND] = background;
  out[COL_TEXT] = INK;
  out[COL_DOMINO] = INK;
  out[COL_DOMINOCLASH] = RED_BOLD;
  out[COL_DOMINOTEXT] = PAPER;
  // A barrier edge is "no domino crosses here" — the player ruling an edge
  // out, which is what Loopy's and Palisade's ruled-out edges mean.
  out[COL_EDGE] = lineNoColor(background);
  out[COL_HIGHLIGHT_1] = RED;
  out[COL_HIGHLIGHT_2] = GREEN;
  out[COL_MISTAKE] = ERROR;
  out[COL_HINT] = HINT_ACTION;
  // Both hint marks are outlines on the square's own border, so both take a
  // strong color: every Dominosa square carries a number, so a fill behind one
  // is exactly what has no working value.
  out[COL_HINT_CELL] = HINT_EVIDENCE;
  out[COL_REFERENCE] = PURPLE;
  return out;
}

// --- packed draw bits (upstream drawstate flags; also the cache key) --------
const TYPE_L = 0;
const TYPE_R = 1;
const TYPE_T = 2;
const TYPE_B = 3;
const TYPE_BLANK = 4;
const TYPE_MASK = 0x0f;

const DF_HIGHLIGHT_1 = 0x10;
const DF_HIGHLIGHT_2 = 0x20;
const DF_FLASH = 0x40;
const DF_CLASH = 0x80;
// EDGE_* (0x100..0x800) reuse the state bits.

const DF_CURSOR = 0x01000;
const DF_CURSOR_USEFUL = 0x02000;
const DF_CURSOR_XBASE = 0x10000;
const DF_CURSOR_XMASK = 0x30000;
const DF_CURSOR_YBASE = 0x40000;
const DF_CURSOR_YMASK = 0xc0000;
// Fork mistake overlay bit (no upstream analog): an inset red outline.
const DF_MISTAKE = 0x100000;
// Fork hint overlay bits. The target and evidence marks key on
// `DominosaDrawState.markSides` instead.
const DF_HINT_EDGE_L = 0x800000;
const DF_HINT_EDGE_R = 0x1000000;
const DF_HINT_EDGE_T = 0x2000000;
const DF_HINT_EDGE_B = 0x4000000;
// Fork reference-panel spotlight bit: this square is a candidate placement for
// the selected domino (boxed in COL_REFERENCE).
const DF_REF = 0x8000000;

// --- geometry ---------------------------------------------------------------
const gutter = (ts: number) => Math.floor(ts / 16);
/** The board's pixel origin — negative, so the domino gutters bleed to the
 * canvas edge (NARROW_BORDERS). Exported so `interpretMove` reads the same
 * number the painter does — one function, both callers
 * ([`docs/games/mechanics.md`](../../../docs/games/mechanics.md)). */
export const border = (ts: number) => -gutter(ts);
const coord = (n: number, ts: number) => n * ts + border(ts);
const dominoRadius = (ts: number) => Math.floor(ts / 8);
const coffset = (ts: number) => gutter(ts) + dominoRadius(ts);
const cursorRadius = (ts: number) => Math.floor(ts / 4);

export function computeSize(p: DominosaShape, ts: number): Size {
  const { w, h } = boardSize(p);
  return { w: w * ts + 2 * border(ts), h: h * ts + 2 * border(ts) };
}

// --- draw state -------------------------------------------------------------

export interface DominosaDrawState {
  tileSize: number;
  w: number;
  h: number;
  /** Last-drawn packed word per square; −1 forces a redraw. */
  visible: Int32Array;
  /** Last-drawn hint mark sides per square ({@link MarkOutlines.packed}): the
   * rest of the cache key, in a lane of its own because the word has no byte
   * left. A square whose sides change repaints, and that repaint erases them. */
  markSides: Uint8Array;
  /** The hint target's ring and the evidence area's outline (fork additions),
   * drawn after the square loop. See {@link markBand}. */
  marks: HintMarks;
}

export function newDrawState(
  state: DominosaState,
  tileSize: number,
): DominosaDrawState {
  return {
    tileSize,
    w: state.w,
    h: state.h,
    visible: new Int32Array(state.w * state.h).fill(-1),
    markSides: new Uint8Array(state.w * state.h),
    marks: new HintMarks(),
  };
}

/**
 * Where a hint mark sits around square `(x, y)` — **on the square's own border**.
 *
 * Dominosa's squares tile exactly, so the band lies wholly inside the box
 * (`outer` 0) and a square whose hint flags change repaints itself and takes its
 * mark with it. Every square carries a centered number, so the border is the
 * only place a mark can go.
 *
 * The box stops at the canvas: the outer squares' gutters bleed off it
 * (`border`), and a band left there is a side nobody sees.
 */
function markBand(ds: DominosaDrawState, x: number, y: number): MarkBand {
  const ts = ds.tileSize;
  const cw = ds.w * ts + 2 * border(ts);
  const ch = ds.h * ts + 2 * border(ts);
  const x0 = Math.max(0, coord(x, ts));
  const y0 = Math.max(0, coord(y, ts));
  const x1 = Math.min(cw, coord(x, ts) + ts);
  const y1 = Math.min(ch, coord(y, ts) + ts);
  return {
    box: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 },
    outer: 0,
    inner: Math.max(2, ts >> 4),
  };
}

// --- tile drawing -----------------------------------------------------------

function drawTile(
  dr: GameDrawing,
  ts: number,
  state: DominosaState,
  x: number,
  y: number,
  packed: number,
): void {
  const w = state.w;
  const cx = coord(x, ts);
  const cy = coord(y, ts);
  const g = gutter(ts);
  const co = coffset(ts);
  const rad = dominoRadius(ts);

  // No hint role in the background: every square carries a number, so the target
  // ring and the evidence outline go on the square's own border in `redraw`.
  // `markSides` is what makes a square repaint when a mark's side leaves it, and
  // that repaint is also what erases the side.
  dr.clip({ x: cx, y: cy, w: ts, h: ts });
  dr.drawRect({ x: cx, y: cy, w: ts, h: ts }, COL_BACKGROUND);

  const flags = packed & ~TYPE_MASK;
  const type = packed & TYPE_MASK;
  let nc: number;

  if (type !== TYPE_BLANK) {
    let bg = flags & DF_CLASH ? COL_DOMINOCLASH : COL_DOMINO;
    nc = COL_DOMINOTEXT;
    if (flags & DF_FLASH) {
      const tmp = nc;
      nc = bg;
      bg = tmp;
    }

    // Rounded corners: filled circles at the domino's outer corners.
    if (type === TYPE_L || type === TYPE_T)
      dr.drawCircle({ x: cx + co, y: cy + co }, rad, bg, bg);
    if (type === TYPE_R || type === TYPE_T)
      dr.drawCircle({ x: cx + ts - 1 - co, y: cy + co }, rad, bg, bg);
    if (type === TYPE_L || type === TYPE_B)
      dr.drawCircle({ x: cx + co, y: cy + ts - 1 - co }, rad, bg, bg);
    if (type === TYPE_R || type === TYPE_B)
      dr.drawCircle({ x: cx + ts - 1 - co, y: cy + ts - 1 - co }, rad, bg, bg);

    for (let i = 0; i < 2; i++) {
      let x1 = cx + (i ? g : co);
      let y1 = cy + (i ? co : g);
      let x2 = cx + ts - 1 - (i ? g : co);
      let y2 = cy + ts - 1 - (i ? co : g);
      if (type === TYPE_L) x2 = cx + ts + Math.floor(ts / 16);
      else if (type === TYPE_R) x1 = cx - Math.floor(ts / 16);
      else if (type === TYPE_T) y2 = cy + ts + Math.floor(ts / 16);
      else if (type === TYPE_B) y1 = cy - Math.floor(ts / 16);
      dr.drawRect({ x: x1, y: y1, w: x2 - x1 + 1, h: y2 - y1 + 1 }, bg);
    }
  } else {
    if (flags & EDGE_T)
      dr.drawRect({ x: cx + g, y: cy, w: ts - 2 * g, h: 1 }, COL_EDGE);
    if (flags & EDGE_B)
      dr.drawRect({ x: cx + g, y: cy + ts - 1, w: ts - 2 * g, h: 1 }, COL_EDGE);
    if (flags & EDGE_L)
      dr.drawRect({ x: cx, y: cy + g, w: 1, h: ts - 2 * g }, COL_EDGE);
    if (flags & EDGE_R)
      dr.drawRect({ x: cx + ts - 1, y: cy + g, w: 1, h: ts - 2 * g }, COL_EDGE);
    nc = COL_TEXT;
  }

  if (flags & DF_CURSOR) {
    const curx = Math.floor((flags & DF_CURSOR_XMASK) / DF_CURSOR_XBASE) & 3;
    const cury = Math.floor((flags & DF_CURSOR_YMASK) / DF_CURSOR_YBASE) & 3;
    const ox = cx + Math.floor((curx * ts) / 2);
    const oy = cy + Math.floor((cury * ts) / 2);
    drawRectCorners(dr, ox, oy, cursorRadius(ts), nc);
    if (flags & DF_CURSOR_USEFUL) drawRectCorners(dr, ox, oy, cursorRadius(ts) + 1, nc);
  }

  if (flags & DF_HIGHLIGHT_1) nc = COL_HIGHLIGHT_1;
  else if (flags & DF_HIGHLIGHT_2) nc = COL_HIGHLIGHT_2;

  // Fork findMistakes overlay: an inset red outline over the wrong domino.
  if (flags & DF_MISTAKE) {
    const t = Math.max(1, Math.floor(ts / 16));
    const inset = Math.max(2, Math.floor(ts / 8));
    const sx = cx + inset;
    const sy = cy + inset;
    const span = ts - 2 * inset;
    dr.drawRect({ x: sx, y: sy, w: span, h: t }, COL_MISTAKE);
    dr.drawRect({ x: sx, y: sy + span - t, w: span, h: t }, COL_MISTAKE);
    dr.drawRect({ x: sx, y: sy, w: t, h: span }, COL_MISTAKE);
    dr.drawRect({ x: sx + span - t, y: sy, w: t, h: span }, COL_MISTAKE);
  }

  // Reference spotlight: a box hugging the square edge in COL_REFERENCE, marking
  // it as a candidate placement for the selected domino. A small inset so two
  // adjacent candidate squares read as one domino-shaped pair.
  if (flags & DF_REF) {
    const t = Math.max(1, Math.floor(ts / 16));
    const inset = Math.max(1, Math.floor(ts / 16));
    const sx = cx + inset;
    const sy = cy + inset;
    const span = ts - 2 * inset;
    dr.drawRect({ x: sx, y: sy, w: span, h: t }, COL_REFERENCE);
    dr.drawRect({ x: sx, y: sy + span - t, w: span, h: t }, COL_REFERENCE);
    dr.drawRect({ x: sx, y: sy, w: t, h: span }, COL_REFERENCE);
    dr.drawRect({ x: sx + span - t, y: sy, w: t, h: span }, COL_REFERENCE);
  }

  // Hint: recolor the suggested barrier edge blue (a thick COL_HINT bar).
  if (flags & (DF_HINT_EDGE_L | DF_HINT_EDGE_R | DF_HINT_EDGE_T | DF_HINT_EDGE_B)) {
    const th = Math.max(2, Math.floor(ts / 12));
    if (flags & DF_HINT_EDGE_T)
      dr.drawRect({ x: cx + g, y: cy, w: ts - 2 * g, h: th }, COL_HINT);
    if (flags & DF_HINT_EDGE_B)
      dr.drawRect({ x: cx + g, y: cy + ts - th, w: ts - 2 * g, h: th }, COL_HINT);
    if (flags & DF_HINT_EDGE_L)
      dr.drawRect({ x: cx, y: cy + g, w: th, h: ts - 2 * g }, COL_HINT);
    if (flags & DF_HINT_EDGE_R)
      dr.drawRect({ x: cx + ts - th, y: cy + g, w: th, h: ts - 2 * g }, COL_HINT);
  }

  dr.drawText(
    { x: cx + Math.floor(ts / 2), y: cy + Math.floor(ts / 2) },
    glyphFont(Math.floor(ts / 2)),
    nc,
    String(state.numbers[y * w + x]),
  );

  dr.drawUpdate({ x: cx, y: cy, w: ts, h: ts });
  dr.unclip();
}

// --- redraw -----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: DominosaDrawState,
  _prev: DominosaState | null,
  state: DominosaState,
  _dir: number,
  ui: DominosaUi,
  _animTime: number,
  flashTime: number,
  hint?: HintStep<DominosaMove, DominosaHint>,
  mistakes?: readonly DominosaMistake[],
): void {
  const ts = ds.tileSize;
  const { w, h, grid, numbers } = state;
  const wh = w * h;
  const n = state.params.n;

  // The hint's marks. A square can be both acted on and part of the evidence,
  // and it then carries both.
  const hl = hint?.highlights;
  const hintEdge = hl?.edge ?? null;
  const cellAt = (i: number): MarkCell => ({ x: i % w, y: (i / w) | 0 });
  const hintTargets = (hl?.targets ?? []).map(cellAt);
  const hintEvidence = (hl?.evidence ?? []).map(cellAt);
  const markStyle: HintMarkStyle = {
    band: (x, y) => markBand(ds, x, y),
    targetColor: COL_HINT,
    evidenceColor: COL_HINT_CELL,
    // A placement's two squares are the domino it asks for: one ring. A
    // barrier's two squares are two squares with the wall between them.
    joinTargets: () => hl?.kind === "place",
  };
  const outlines = new MarkOutlines(hintTargets, hintEvidence, markStyle);

  // Count domino-value occurrences (capped at 2) so a value placed twice
  // highlights in red.
  const used = new Uint8Array(DCOUNT(n));
  for (let i = 0; i < wh; i++)
    if (grid[i] > i) {
      const di = DINDEX(numbers[i], numbers[grid[i]]);
      if (used[di] < 2) used[di]++;
    }

  const mistakeSet = mistakes?.length ? new Set(mistakes.map((m) => m.index)) : null;

  // Reference-panel spotlight: every square that borders another so the two
  // clue values form the selected domino is a candidate placement — box it.
  let refSet: Set<number> | null = null;
  if (ui.highlightPair !== null) {
    refSet = new Set<number>();
    const di = ui.highlightPair;
    for (let i = 0; i < wh; i++) {
      const x = i % w;
      if (x + 1 < w && DINDEX(numbers[i], numbers[i + 1]) === di) {
        refSet.add(i);
        refSet.add(i + 1);
      }
      if (i + w < wh && DINDEX(numbers[i], numbers[i + w]) === di) {
        refSet.add(i);
        refSet.add(i + w);
      }
    }
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let c: number;
      if (grid[i] === i - 1) c = TYPE_R;
      else if (grid[i] === i + 1) c = TYPE_L;
      else if (grid[i] === i - w) c = TYPE_B;
      else if (grid[i] === i + w) c = TYPE_T;
      else c = TYPE_BLANK;

      const n1 = numbers[i];
      if (c !== TYPE_BLANK) {
        const di = DINDEX(n1, numbers[grid[i]]);
        if (used[di] > 1) c |= DF_CLASH;
      } else {
        c |= state.edges[i];
      }

      if (n1 === ui.highlight1) c |= DF_HIGHLIGHT_1;
      if (n1 === ui.highlight2) c |= DF_HIGHLIGHT_2;

      if (flashTime !== 0) c |= DF_FLASH;

      if (ui.cursor.visible) {
        const curx = ui.cursor.x - (2 * x - 1);
        const cury = ui.cursor.y - (2 * y - 1);
        if (curx >= 0 && curx < 3 && cury >= 0 && cury < 3) {
          c |= DF_CURSOR | (curx * DF_CURSOR_XBASE) | (cury * DF_CURSOR_YBASE);
          if ((ui.cursor.x ^ ui.cursor.y) & 1) c |= DF_CURSOR_USEFUL;
        }
      }

      if (mistakeSet?.has(i)) c |= DF_MISTAKE;

      if (refSet?.has(i)) c |= DF_REF;

      if (hintEdge) {
        const [a, b] = hintEdge;
        if (i === a && b === a + 1) c |= DF_HINT_EDGE_R;
        else if (i === b && b === a + 1) c |= DF_HINT_EDGE_L;
        else if (i === a && b === a + w) c |= DF_HINT_EDGE_B;
        else if (i === b && b === a + w) c |= DF_HINT_EDGE_T;
      }

      const sides = outlines.packed(x, y);
      if (ds.visible[i] !== c || ds.markSides[i] !== sides) {
        drawTile(dr, ts, state, x, y, c);
        ds.visible[i] = c;
        ds.markSides[i] = sides;
      }
    }
  }

  // The hint marks, after the square loop and outside every clip.
  ds.marks.paint(dr, hintTargets, hintEvidence, markStyle);
}

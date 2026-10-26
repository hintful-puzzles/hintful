/**
 * Twiddle rendering: beveled numbered tiles, the block rotation animation with
 * each tile's bevel edges recolored through the turn, the cursor region
 * outline, and the win flash on a tile's face. Port of upstream `game_redraw` /
 * `draw_tile` / `rotate` / `highlight_colour`.
 */

import {
  CURSOR,
  cellSurface,
  FLASH,
  FLASH_LEAD,
  givenSurface,
  HINT_OUTLINE,
  INK,
} from "../../engine/color/palette.ts";
import {
  twiddleGentleHighlight,
  twiddleGentleLowlight,
} from "../../engine/color/palette-games.ts";
import { drawRecessedBorder, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { coord as coordE } from "../../engine/geometry.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import {
  MARK_EDGE_PX,
  type RingClear,
  type RingShape,
  ringShape,
  textBox,
} from "../../engine/ring.ts";
import type { Color, Point, Rect, Size } from "../../engine/types.ts";
import { type Flash, sweepStep, winSlot } from "../../engine/win-wave.ts";
import { BLOCK, LIFTED, TILE } from "./hint-text.ts";
import type { TwiddleMove, TwiddleState, TwiddleUi } from "./state.ts";

// --- constants --------------------------------------------------------

export const PREFERRED_TILE_SIZE = 48;
export const ANIM_PER_BLKSIZE_UNIT = 0.13;

const HIGHLIGHT_WIDTH_DIV = 20;

// --- color indices ---------------------------------------------------

export const COL_BACKGROUND = 0;
export const COL_TEXT = 1;
export const COL_HIGHLIGHT = 2;
export const COL_HIGHLIGHT_GENTLE = 3;
export const COL_LOWLIGHT = 4;
export const COL_LOWLIGHT_GENTLE = 5;
export const COL_HIGHCURSOR = 6;
export const COL_LOWCURSOR = 7;
/** A tile's face: the lifted surface, so the object the player moves stands
 * off the well it turns in, in both schemes. */
export const COL_TILE = 8;
/** The well: what a turning block uncovers. */
export const COL_WELL = 9;
/** The face of a tile the win flash is on. */
export const COL_FLASH = 10;
/** The face of a tile the win flash's leading edge is on. */
export const COL_FLASH_LEAD = 11;
/** The hint's outline: the tile it serves, and the square a run brings it to. */
export const COL_HINT_EVIDENCE = 12;
/** The dot at every block's pivot: the cursor's color, which marks where a
 * click acts. */
export const COL_PIVOT = 13;
export const NCOLORS = 14;

// --- cursor edge flags ------------------------------------------------

const CUR_TOP = 1;
const CUR_RIGHT = 2;
const CUR_BOTTOM = 4;
const CUR_LEFT = 8;
// --- hint mark flags --------------------------------------------------

/** Under the hint's ring round the turning block's pivot. */
const MARK_RING = 1;
/** Outlined: the tile the step serves, or the square a run brings it to. */
const MARK_OUTLINE = 2;
/** Striped: a finished tile a run lifts out, or that comes back. */
const MARK_STRIPES = 4;

// --- geometry ---------------------------------------------------------

/** How a tile's number is drawn, for the tile and the ring round it. */
const NUMBER_FONT = (ts: number) => glyphFont(ts / 3);

export function border(ts: number): number {
  return Math.floor(ts / 2);
}

export function coord(pos: number, ts: number): number {
  return coordE(pos, ts, border(ts));
}

function highlightWidth(ts: number): number {
  return Math.max(1, Math.floor(ts / HIGHLIGHT_WIDTH_DIV));
}

export function computeSize(p: Size, ts: number): Size {
  const b = border(ts);
  return { w: ts * p.w + 2 * b, h: ts * p.h + 2 * b };
}

/** Animation duration for a rotation of an `n×n` block. */
export function animLength(n: number): number {
  return ANIM_PER_BLKSIZE_UNIT * Math.sqrt(n - 1);
}

// --- draw state -------------------------------------------------------

export interface TwiddleDrawState {
  started: boolean;
  /** Per-cell cache of the win flash's tone on the tile, above its two bits
   * the hint's three mark bits, above those the four sides of a cursor or hover
   * outline, and above those the packed `number*4 + orient`; `-1` forces a
   * redraw (unknown, or inside the animating block). */
  cache: Int32Array;
  tileSize: number;
}

export function newDrawState(state: TwiddleState, tileSize: number): TwiddleDrawState {
  return {
    started: false,
    cache: new Int32Array(state.w * state.h).fill(-1),
    tileSize,
  };
}

// --- rotation ---------------------------------------------------------

/** The block turning mid-animation. */
interface Rotation {
  /** The block's pixel rect, which each of its tiles is clipped to. */
  block: Rect;
  /** The center of rotation. */
  ox: number;
  oy: number;
  cos: number;
  sin: number;
  leftColor: number;
  rightColor: number;
  topColor: number;
  bottomColor: number;
}

/** Rotate a point about the rotation center, rounding to nearest; the
 * identity when `rot` is null. */
function rotate(px: number, py: number, rot: Rotation | null): Point {
  if (!rot) return { x: px, y: py };
  const xf = px - rot.ox;
  const yf = py - rot.oy;
  const xf2 = rot.cos * xf + rot.sin * yf;
  const yf2 = -rot.sin * xf + rot.cos * yf;
  return { x: Math.round(xf2 + rot.ox), y: Math.round(yf2 + rot.oy) };
}

/** Upstream `highlight_colour`: the bevel color of an edge facing `angle`
 * radians, in 32 steps round the circle, so the four sides of a turning tile
 * recolor smoothly. Lit facing up and left, shaded facing down and right,
 * gentle in between. */
function highlightColor(angle: number): number {
  const step = Math.floor((angle + 2 * Math.PI) / (Math.PI / 16)) & 31;
  if (step >= 7 && step <= 16) return COL_HIGHLIGHT;
  if (step >= 4 && step <= 19) return COL_HIGHLIGHT_GENTLE;
  if (step >= 1 && step <= 22) return COL_LOWLIGHT_GENTLE;
  return COL_LOWLIGHT;
}

// --- tile drawing -----------------------------------------------------

function drawTile(
  dr: GameDrawing,
  ts: number,
  hw: number,
  orientable: boolean,
  px: number,
  py: number,
  num: number,
  orient: number,
  face: number,
  rot: Rotation | null,
  cedges: number,
  marks: number,
): void {
  if (rot) dr.clip(rot.block);

  // The four bevel edges, each a triangle from a pair of corners to the
  // center. During a rotation they all differ in color.
  const center = rotate(px + ts / 2, py + ts / 2, rot);
  const c00 = rotate(px, py, rot);
  const c10 = rotate(px + ts - 1, py, rot);
  const c11 = rotate(px + ts - 1, py + ts - 1, rot);
  const c01 = rotate(px, py + ts - 1, rot);

  // Right side.
  const right = rot ? rot.rightColor : COL_LOWLIGHT;
  dr.drawPolygon([c11, c10, center], right, right);
  // Bottom side.
  const bottom = rot ? rot.bottomColor : COL_LOWLIGHT;
  dr.drawPolygon([c11, c01, center], bottom, bottom);
  // Left side.
  const left = rot ? rot.leftColor : COL_HIGHLIGHT;
  dr.drawPolygon([c00, c01, center], left, left);
  // Top side.
  const top = rot ? rot.topColor : COL_HIGHLIGHT;
  dr.drawPolygon([c00, c10, center], top, top);

  // The blank center area.
  if (rot) {
    dr.drawPolygon(
      [
        rotate(px + hw, py + hw, rot),
        rotate(px + hw, py + ts - 1 - hw, rot),
        rotate(px + ts - 1 - hw, py + ts - 1 - hw, rot),
        rotate(px + ts - 1 - hw, py + hw, rot),
      ],
      face,
      face,
    );
  } else {
    dr.drawRect({ x: px + hw, y: py + hw, w: ts - 2 * hw, h: ts - 2 * hw }, face);
  }

  // Orientation triangle.
  if (orientable) {
    let xdx: number;
    let xdy: number;
    let ydx: number;
    let ydy: number;
    switch (orient & 3) {
      case 1:
        xdx = 0;
        xdy = -1;
        ydx = 1;
        ydy = 0;
        break;
      case 2:
        xdx = -1;
        xdy = 0;
        ydx = 0;
        ydy = -1;
        break;
      case 3:
        xdx = 0;
        xdy = 1;
        ydx = -1;
        ydy = 0;
        break;
      default: // 0
        xdx = 1;
        xdy = 0;
        ydx = 0;
        ydy = 1;
        break;
    }
    const cx = px + ts / 2;
    const cy = py + ts / 2;
    const displ = ts / 2 - hw - 2;
    const displ2 = ts / 3 - hw;
    dr.drawPolygon(
      [
        rotate(cx - displ * xdx + displ2 * ydx, cy - displ * xdy + displ2 * ydy, rot),
        rotate(cx + displ * xdx + displ2 * ydx, cy + displ * xdy + displ2 * ydy, rot),
        rotate(cx - displ * ydx, cy - displ * ydy, rot),
      ],
      COL_LOWLIGHT_GENTLE,
      COL_LOWLIGHT_GENTLE,
    );
  }

  // Stripes across the face, under the number so it stays legible. A mark
  // names the cell a tile ends a turn on, so it stands still while the tile
  // turns into it.
  if (marks & MARK_STRIPES)
    dr.drawHatch(
      { x: px + hw, y: py + hw, w: ts - 2 * hw, h: ts - 2 * hw },
      hatchPeriod(ts),
    );

  dr.drawText(center, NUMBER_FONT(ts), COL_TEXT, String(num));

  const band = (r: Rect, c: number) => dr.drawRect(r, c);
  // The block the keyboard cursor is on, or the mouse would turn: a band on
  // the bevel of the block's outer edge in the cursor color, so either reads
  // as one thing and neither as a move made.
  if (cedges) {
    if (cedges & CUR_TOP) band({ x: px, y: py, w: ts, h: hw }, COL_HIGHCURSOR);
    if (cedges & CUR_LEFT) band({ x: px, y: py, w: hw, h: ts }, COL_HIGHCURSOR);
    if (cedges & CUR_BOTTOM)
      band({ x: px, y: py + ts - hw, w: ts, h: hw }, COL_LOWCURSOR);
    if (cedges & CUR_RIGHT)
      band({ x: px + ts - hw, y: py, w: hw, h: ts }, COL_LOWCURSOR);
  }

  // The hint's outline sits just inside the bevel, never on the number; its
  // ring goes on the block's pivot, after the tiles (`redraw`).
  if (marks & MARK_OUTLINE) {
    const i = hw;
    const s = ts - 2 * hw;
    band({ x: px + i, y: py + i, w: s, h: hw }, COL_HINT_EVIDENCE);
    band({ x: px + i, y: py + i + s - hw, w: s, h: hw }, COL_HINT_EVIDENCE);
    band({ x: px + i, y: py + i, w: hw, h: s }, COL_HINT_EVIDENCE);
    band({ x: px + i + s - hw, y: py + i, w: hw, h: s }, COL_HINT_EVIDENCE);
  }

  if (rot) dr.unclip();
  dr.drawUpdate({ x: px, y: py, w: ts, h: ts });
}

/** The square round the dot at the pivot of the block at (`bx`, `by`). */
function pivotDot(bx: number, by: number, n: number, ts: number): Rect {
  const r = Math.max(2, Math.round(ts / 26));
  const x = coord(bx, ts) + (n * ts) / 2;
  const y = coord(by, ts) + (n * ts) / 2 + (n % 2 === 1 ? ts * 0.32 : 0);
  return { x: x - r, y: y - r, w: 2 * r, h: 2 * r };
}

// --- the hint's ring ----------------------------------------------------

/** The ring round a turning block's pivot at `center`, as large as the
 * numbers round it allow, with a curved arrow inside showing which way the
 * block turns, round the middle number an odd block's ring encloses. The
 * arrow's gap is at the bottom, where an odd block's pivot dot sits under its
 * middle number. */
function drawPivotRing(
  dr: GameDrawing,
  center: Point,
  ts: number,
  clear: RingClear,
  room: Rect,
  clockwise: boolean,
): void {
  const thickness = Math.max(2, Math.floor(ts / 16));
  const boxOf = (side: number): Rect => ({
    x: center.x - side / 2,
    y: center.y - side / 2,
    w: side,
    h: side,
  });
  const fitting = (side: number): RingShape | null => {
    try {
      return ringShape(boxOf(side), clear, thickness, room);
    } catch {
      return null;
    }
  };
  // Half the room: past that the ring reaches the next numbers out.
  const largest = Math.round(room.w / 2);
  let side = largest;
  let shape = fitting(side);
  while (!shape && side > ts / 2) shape = fitting(--side);
  // Nothing fits: `drawRing` says so.
  if (!shape) side = largest;
  const rect = shape?.rect ?? boxOf(side);
  const inner = Math.min(rect.w, rect.h) / 2 - thickness / 2 - MARK_EDGE_PX;
  const middle = { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
  // The arrow keeps as far from the number it goes round as the ring does.
  const within = Math.max(
    0,
    ...clear.enclose.flatMap((r) =>
      [r.x - middle.x, r.x + r.w - middle.x].flatMap((dx) =>
        [r.y - middle.y, r.y + r.h - middle.y].map((dy) => Math.hypot(dx, dy)),
      ),
    ),
  );
  dr.drawRing(boxOf(side), clear, thickness, {
    room,
    inside: (ink) =>
      drawTurnArrow(dr, middle, inner, within + MARK_EDGE_PX, ts, clockwise, ink),
  });
}

/** A three-quarter arc round `center`, between `within` and `inner` out from
 * it, with its head at the end the turn goes toward. */
function drawTurnArrow(
  dr: GameDrawing,
  center: Point,
  inner: number,
  within: number,
  ts: number,
  clockwise: boolean,
  ink: number,
): void {
  const width = Math.max(1, Math.round(ts / 20));
  // The head's base reaches `head` either side of the arc's middle line, and
  // touches neither the ring nor what the arc goes round.
  const head = Math.min(Math.max(3, 2 * width), (inner - 1 - within) / 2);
  // On a tile too small for its number to read, the ring is too small to
  // hold an arrow beside the head's own width: it is left out.
  if (head < width / 2 + 1) return;
  const mid = inner - 1 - head;
  const outer = mid + width / 2;
  // Screen angles run clockwise, y being down. The gap is centered on the
  // bottom (π/2): the arc leaves one side of it and the head points into it
  // from the other.
  const sign = clockwise ? 1 : -1;
  const gap = 0.75 * Math.PI;
  const start = Math.PI / 2 + (sign * gap) / 2;
  const sweep = sign * (2 * Math.PI - gap);
  const at = (r: number, a: number): Point => ({
    x: center.x + r * Math.cos(a),
    y: center.y + r * Math.sin(a),
  });
  const steps = 24;
  const band: Point[] = [];
  for (let k = 0; k <= steps; k++) band.push(at(outer, start + (sweep * k) / steps));
  for (let k = steps; k >= 0; k--)
    band.push(at(outer - width, start + (sweep * k) / steps));
  dr.drawPolygon(band, ink, ink);
  const end = start + sweep;
  // The head: a triangle whose base straddles the arc's end, pointing along
  // the turn.
  const tip = start + sweep + sign * ((1.6 * head) / mid);
  dr.drawPolygon([at(mid + head, end), at(mid, tip), at(mid - head, end)], ink, ink);
}

// --- redraw -----------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: TwiddleDrawState,
  prev: TwiddleState | null,
  state: TwiddleState,
  dir: number,
  ui: TwiddleUi,
  animTime: number,
  flash: Flash,
  activeHint?: HintStep<TwiddleMove>,
): void {
  const ts = ds.tileSize;
  const { w, h, n } = state;
  const hw = highlightWidth(ts);

  const hinted = stepMarks(activeHint);
  const ringed = hinted.of("ring", BLOCK)[0] ?? null;
  const outlined = new Set(hinted.of("outline", TILE));
  const stripedCells = new Set(hinted.of("stripes", LIFTED));
  // The ring sits on the block's pivot, and may lie on the tiles round it:
  // the four round the corner at the middle of an even block, and the middle
  // tile of an odd one with the eight round it, where the ring goes round the
  // middle number and the arrow round that.
  const half = Math.floor(n / 2);
  const ringLo = half - 1;
  const ringHi = n % 2 === 1 ? half + 1 : half;
  const inRinged = (tx: number, ty: number): boolean =>
    ringed !== null &&
    tx >= ringed.x + ringLo &&
    tx <= ringed.x + ringHi &&
    ty >= ringed.y + ringLo &&
    ty <= ringed.y + ringHi;
  /** The hint's mark bits on a cell. */
  const marksAt = (tx: number, ty: number): number => {
    let m = outlined.has(ty * w + tx) ? MARK_OUTLINE : 0;
    if (stripedCells.has(ty * w + tx)) m |= MARK_STRIPES;
    if (ringed && inRinged(tx, ty)) m |= MARK_RING;
    return m;
  };

  // The blocks outlined in the cursor color: the keyboard cursor's, and the
  // one the mouse would turn.
  const outlinedBlocks = [
    ...(ui.cursor.visible ? [{ x: ui.cursor.x, y: ui.cursor.y }] : []),
    ...(ui.hoverBlock ? [ui.hoverBlock] : []),
  ];
  const cursorAt = (tx: number, ty: number): number => {
    let e = 0;
    for (const b of outlinedBlocks) {
      if (tx < b.x || tx >= b.x + n || ty < b.y || ty >= b.y + n) continue;
      if (tx === b.x) e |= CUR_LEFT;
      if (ty === b.y) e |= CUR_TOP;
      if (tx === b.x + n - 1) e |= CUR_RIGHT;
      if (ty === b.y + n - 1) e |= CUR_BOTTOM;
    }
    return e;
  };

  if (!ds.started) {
    drawRecessedBorder(
      dr,
      {
        left: coord(0, ts) - hw,
        top: coord(0, ts) - hw,
        right: coord(w, ts) + hw - 1,
        bottom: coord(h, ts) + hw - 1,
      },
      ts,
      COL_HIGHLIGHT,
      COL_LOWLIGHT,
    );
    ds.started = true;
  }

  // Set up the rotation parameters if we're animating, and clear the
  // rotated region to the well first.
  let rot: Rotation | null = null;
  let lastx = -1;
  let lasty = -1;
  if (prev) {
    let lastr: number;
    if (dir > 0) {
      lastx = state.lastX;
      lasty = state.lastY;
      lastr = state.lastR;
    } else {
      lastx = prev.lastX;
      lasty = prev.lastY;
      lastr = -prev.lastR;
    }
    if (lastx >= 0 && lasty >= 0) {
      const animMax = animLength(n);
      const cw = ts * n;
      const block = { x: coord(lastx, ts), y: coord(lasty, ts), w: cw, h: cw };
      const angle = -(Math.PI / 2) * lastr * (1 - animTime / animMax);
      rot = {
        block,
        ox: block.x + cw / 2,
        oy: block.y + cw / 2,
        cos: Math.cos(angle),
        sin: Math.sin(angle),
        leftColor: highlightColor(Math.PI + angle),
        rightColor: highlightColor(angle),
        topColor: highlightColor(Math.PI / 2 + angle),
        bottomColor: highlightColor(-Math.PI / 2 + angle),
      };
      dr.drawRect(block, COL_WELL);
    }
  }

  let ringRepainted = false;
  for (let i = 0; i < w * h; i++) {
    const tx = i % w;
    const ty = Math.floor(i / w);

    // -1 ("always redraw") for cells inside the animating block.
    const inBlock =
      rot !== null && tx >= lastx && tx < lastx + n && ty >= lasty && ty < lasty + n;
    const lit = flash.win(sweepStep(tx, ty));
    const marks = marksAt(tx, ty);
    const cedges = cursorAt(tx, ty);
    const t = inBlock
      ? -1
      : ((((((state.numbers[i] * 4 + state.orient[i]) << 4) | cedges) << 3) | marks) <<
          2) |
        lit;

    if (ds.cache[i] !== t || t === -1) {
      const x = coord(tx, ts);
      const y = coord(ty, ts);

      drawTile(
        dr,
        ts,
        hw,
        state.orientable,
        x,
        y,
        state.numbers[i],
        state.orient[i],
        lit ? winSlot(lit, COL_FLASH, COL_FLASH_LEAD) : COL_TILE,
        // A tile outside the turning block draws unrotated, even mid-turn
        // (the win flash can repaint it while a new move animates).
        inBlock ? rot : null,
        cedges,
        marks,
      );
      ds.cache[i] = t;
      if (inRinged(tx, ty)) ringRepainted = true;
    }
  }

  // The hint's ring round the pivot of the block to turn, with the turn's
  // arrow inside it. A ring round the whole block cannot clear the numbers
  // in its corner tiles, and every block is the same size, so the pivot names
  // it. The ring lies on the tiles under it alone, which key on it, so it is
  // drawn again whenever one of them repaints.
  const move = activeHint?.move;
  if (ringed && ringRepainted && move?.type === "rotate") {
    const x0 = coord(ringed.x + ringLo, ts);
    const y0 = coord(ringed.y + ringLo, ts);
    const span = (ringHi - ringLo + 1) * ts;
    const room = { x: x0, y: y0, w: span, h: span };
    const numberAt = (tx: number, ty: number): Rect =>
      textBox(
        { x: coord(tx, ts) + ts / 2, y: coord(ty, ts) + ts / 2 },
        NUMBER_FONT(ts),
        String(state.numbers[ty * w + tx]),
      );
    const odd = n % 2 === 1;
    const enclose = odd ? [numberAt(ringed.x + half, ringed.y + half)] : [];
    const avoid: Rect[] = [];
    for (let ty = ringed.y + ringLo; ty <= ringed.y + ringHi; ty++)
      for (let tx = ringed.x + ringLo; tx <= ringed.x + ringHi; tx++)
        if (!(odd && tx === ringed.x + half && ty === ringed.y + half))
          avoid.push(numberAt(tx, ty));
    // The pivot dots of the blocks beside it, drawn over the ring, are kept
    // off its stroke too; its own lies within the arrow.
    for (let by = ringed.y - 1; by <= ringed.y + 1; by++)
      for (let bx = ringed.x - 1; bx <= ringed.x + 1; bx++)
        if (
          bx >= 0 &&
          by >= 0 &&
          bx <= w - n &&
          by <= h - n &&
          !(bx === ringed.x && by === ringed.y)
        )
          avoid.push(pivotDot(bx, by, n, ts));
    drawPivotRing(
      dr,
      { x: x0 + span / 2, y: y0 + span / 2 },
      ts,
      { enclose, avoid },
      room,
      move.dir === -1,
    );
  }

  // A dot at every block's pivot, so each square shows which blocks hold it.
  // Drawn over the tiles every frame: a tile repaints for its own reasons and
  // a dot on a grid corner spans four, and a pivot stands still while its
  // block turns about it. An even block's pivot is a grid corner, in the gap
  // between tiles; an odd block's is its center square, where the dot sits
  // below the number.
  for (let by = 0; by <= h - n; by++)
    for (let bx = 0; bx <= w - n; bx++) {
      const dot = pivotDot(bx, by, n, ts);
      dr.drawCircle(
        { x: dot.x + dot.w / 2, y: dot.y + dot.h / 2 },
        dot.w / 2,
        COL_PIVOT,
        COL_PIVOT,
      );
      dr.drawUpdate({ ...dot, w: dot.w + 1, h: dot.h + 1 });
    }
}

// --- palette ----------------------------------------------------------

function clampColor(c: Color): Color {
  return [
    Math.max(0, Math.min(1, c[0])),
    Math.max(0, Math.min(1, c[1])),
    Math.max(0, Math.min(1, c[2])),
  ];
}

/** Build the Twiddle palette from a base background + highlight/lowlight
 * (the gentle bevels and the cursor). */
export function buildColors(bg: Color, hi: Color, lo: Color): Color[] {
  const out: Color[] = new Array(NCOLORS);
  out[COL_BACKGROUND] = bg;
  out[COL_TEXT] = INK;
  out[COL_HIGHLIGHT] = hi;
  out[COL_HIGHLIGHT_GENTLE] = clampColor(twiddleGentleHighlight(bg));
  out[COL_LOWLIGHT] = lo;
  out[COL_LOWLIGHT_GENTLE] = clampColor(twiddleGentleLowlight(bg));
  // The cursor is the *outline* of the bevel triangles along the block's
  // edges, over their ordinary fill — a line, so one authored color serves
  // both the lit and the shaded sides. Two slots survive because the dark-mode
  // swap table keys them by index.
  out[COL_HIGHCURSOR] = CURSOR;
  out[COL_LOWCURSOR] = CURSOR;
  out[COL_TILE] = givenSurface(bg);
  out[COL_WELL] = cellSurface(bg);
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  out[COL_HINT_EVIDENCE] = HINT_OUTLINE;
  out[COL_PIVOT] = CURSOR;
  return out;
}

/**
 * Ball Sort's renderer: tubes standing in rows on the board's quiet surface,
 * each ball a disc of its color with a symbol of its own on it, so no two
 * colors are told apart by hue alone (`engine/piece.ts`).
 *
 * The tubes reflow into as many rows as keep the board no wider than tall.
 * Each tube repaints alone when its key changes; a frame with something in
 * flight (a pour's animation, a dragged run) paints the whole board, and the
 * frame after it paints the whole board again to take the flight off.
 *
 * The geometry lives here and `interpretMove` reads it (one function, both
 * callers, `docs/mechanics.md`).
 */

import { FREE, FREE_TEXT } from "../../engine/color/colors.ts";
import {
  CURSOR,
  cellSurface,
  FLASH,
  FLASH_LEAD,
  GRID_DARK,
  HELD,
} from "../../engine/color/palette.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import { drawPiece } from "../../engine/piece.ts";
import { NOTHING_TO_CLEAR } from "../../engine/ring.ts";
import type { Color, Point, Rect, Size } from "../../engine/types.ts";
import {
  type Flash,
  sweepStep,
  WIN_NONE,
  type WinTone,
  winSlot,
} from "../../engine/win-wave.ts";
import { landingSlots, movingBalls } from "./hint.ts";
import { POUR, RUN, TUBE } from "./kinds.ts";
import {
  type BallsortMove,
  type BallsortParams,
  type BallsortState,
  type BallsortUi,
  heightOf,
  MAX_COLORS,
  topRun,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 36;

/** How long a pour flies, in seconds: a move made dozens of times a board
 * sits at the short end of the 150–300 ms that interface motion guidelines
 * give a small element's move (Material Design 3, "Easing and duration"). */
export const POUR_SECONDS = 0.2;

// --- palette ----------------------------------------------------------------

const COL_BACKGROUND = 0;
/** The tube's glass, round its inside. */
const COL_WALL = 1;
/** The inside of a tube. */
const COL_INSIDE = 2;
const COL_CURSOR = 3;
/** The ring round each ball of the run picked up to pour. */
export const COL_HELD = 4;
const COL_FLASH = 5;
const COL_FLASH_LEAD = 6;
/** A ball of color `v` is `COL_BALL + v - 1`, its symbol `COL_SYMBOL + v - 1`. */
export const COL_BALL = 7;
export const COL_SYMBOL = COL_BALL + MAX_COLORS;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  // The glass is a line round the tube, strong enough to read as one on the
  // plain board.
  out[COL_WALL] = GRID_DARK;
  out[COL_INSIDE] = cellSurface(defaultBackground);
  out[COL_CURSOR] = CURSOR;
  out[COL_HELD] = HELD;
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  for (let i = 0; i < MAX_COLORS; i++) {
    out[COL_BALL + i] = FREE[i];
    out[COL_SYMBOL + i] = FREE_TEXT[i];
  }
  return out;
}

// --- geometry ---------------------------------------------------------------

const border = (ts: number): number => Math.floor(ts / 2);
/** From one tube's left edge to the next's. */
const pitch = (ts: number): number => Math.floor((ts * 3) / 2);
/** Room above a tube's mouth for the run picked up out of it. */
const headroom = (ts: number): number => ts;
/** A row of tubes: the headroom, the slots, and a gap below. */
const rowHeight = (h: number, ts: number): number =>
  headroom(ts) + h * ts + Math.floor(ts / 2);

/** How many rows `w` tubes of `h` stand in: the fewest that keep the board
 * no wider than tall. */
export function rowsFor(w: number, h: number): number {
  for (let rows = 1; ; rows++) {
    const across = Math.ceil(w / rows) * 3;
    if (across <= rows * (2 * h + 3)) return rows;
  }
}

export interface Layout {
  readonly rows: number;
  readonly perRow: number;
  readonly size: Size;
}

export function layoutOf(w: number, h: number, ts: number): Layout {
  const rows = rowsFor(w, h);
  const perRow = Math.ceil(w / rows);
  const b = border(ts);
  return {
    rows,
    perRow,
    size: { w: 2 * b + perRow * pitch(ts), h: 2 * b + rows * rowHeight(h, ts) },
  };
}

export function computeSize(p: BallsortParams, ts: number): Size {
  return layoutOf(p.colors + p.spare, p.capacity, ts).size;
}

/** Where tube `t` stands: its column and row, and its region, the box from
 * the top of its headroom to the gap below it, a pitch wide. */
export function tubeAt(
  s: { readonly w: number; readonly h: number },
  ts: number,
  t: number,
): { col: number; row: number; region: Rect; inside: Rect } {
  const { rows, perRow } = layoutOf(s.w, s.h, ts);
  const row = Math.floor(t / perRow);
  const col = t % perRow;
  const inRow = row < rows - 1 ? perRow : s.w - perRow * (rows - 1);
  const b = border(ts);
  const x = b + Math.floor(((perRow - inRow) * pitch(ts)) / 2) + col * pitch(ts);
  const y = b + row * rowHeight(s.h, ts);
  const region = { x, y, w: pitch(ts), h: rowHeight(s.h, ts) };
  const inside = {
    x: x + Math.floor((pitch(ts) - ts) / 2),
    y: y + headroom(ts),
    w: ts,
    h: s.h * ts,
  };
  return { col, row, region, inside };
}

/** The tube under pixel `p`, by the column and row it falls in, or null. */
export function tubeUnder(
  s: { readonly w: number; readonly h: number },
  ts: number,
  p: Point,
): number | null {
  for (let t = 0; t < s.w; t++) {
    const { region } = tubeAt(s, ts, t);
    if (
      p.x >= region.x &&
      p.x < region.x + region.w &&
      p.y >= region.y &&
      p.y < region.y + region.h
    )
      return t;
  }
  return null;
}

/** The middle of tube `t`'s slots: where a tap on it is aimed. */
export function tubeCenter(s: BallsortState, ts: number, t: number): Point {
  const { inside } = tubeAt(s, ts, t);
  return {
    x: inside.x + Math.floor(inside.w / 2),
    y: inside.y + Math.floor(inside.h / 2),
  };
}

/** The box of grid slot `i` (row 0 the mouth). */
function slotRect(s: BallsortState, ts: number, i: number): Rect {
  const t = i % s.w;
  const y = Math.floor(i / s.w);
  const { inside } = tubeAt(s, ts, t);
  return { x: inside.x, y: inside.y + y * ts, w: ts, h: ts };
}

/** The box round several slots of one tube. */
function around(rects: readonly Rect[]): Rect {
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  const x1 = Math.max(...rects.map((r) => r.x + r.w));
  const y1 = Math.max(...rects.map((r) => r.y + r.h));
  return { x, y, w: x1 - x, h: y1 - y };
}

// --- one ball ---------------------------------------------------------------

/**
 * The symbol of each color, in the order of `FREE`: a dot, a triangle, a
 * square, a diamond, a plus, a cross, a ring, a bar, a star and a triangle
 * standing on its point. Each as polygons round the ball's middle, in units
 * of the symbol's half width.
 */
const SYMBOLS: readonly (readonly (readonly [number, number])[])[][] = [
  [circle(0.45, 12)],
  [
    [
      [0, -0.9],
      [0.85, 0.65],
      [-0.85, 0.65],
    ],
  ],
  [
    [
      [-0.7, -0.7],
      [0.7, -0.7],
      [0.7, 0.7],
      [-0.7, 0.7],
    ],
  ],
  [
    [
      [0, -0.95],
      [0.75, 0],
      [0, 0.95],
      [-0.75, 0],
    ],
  ],
  [bar(0.95, 0.28), bar(0.28, 0.95)],
  [rotated(bar(0.95, 0.22), Math.PI / 4), rotated(bar(0.95, 0.22), -Math.PI / 4)],
  [],
  [bar(0.9, 0.3)],
  [star()],
  [
    [
      [0, 0.9],
      [0.85, -0.65],
      [-0.85, -0.65],
    ],
  ],
];
/** Which symbol is a ring, drawn as two circles rather than a polygon. */
const RING_SYMBOL = 6;

function circle(r: number, n: number): (readonly [number, number])[] {
  return Array.from({ length: n }, (_, k) => {
    const a = (2 * Math.PI * k) / n;
    return [r * Math.cos(a), r * Math.sin(a)] as const;
  });
}

function bar(hw: number, hh: number): (readonly [number, number])[] {
  return [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ];
}

function rotated(
  pts: readonly (readonly [number, number])[],
  a: number,
): (readonly [number, number])[] {
  return pts.map(([x, y]) => [
    x * Math.cos(a) - y * Math.sin(a),
    x * Math.sin(a) + y * Math.cos(a),
  ]);
}

function star(): (readonly [number, number])[] {
  return Array.from({ length: 10 }, (_, k) => {
    const r = k % 2 === 0 ? 1 : 0.42;
    const a = -Math.PI / 2 + (Math.PI * k) / 5;
    return [r * Math.cos(a), r * Math.sin(a)] as const;
  });
}

/** A ball of color `v` in the slot box `cell`, ringed as held where `held`. */
function drawBall(dr: GameDrawing, cell: Rect, v: number, held: boolean): void {
  const i = v - 1;
  if (held) drawPiece(dr, cell, "disc", COL_HELD);
  drawPiece(dr, cell, "disc", COL_BALL + i, held ? 0.78 : 1);
  const cx = cell.x + cell.w / 2;
  const cy = cell.y + cell.h / 2;
  const r = cell.w * (held ? 0.15 : 0.18);
  if (i % SYMBOLS.length === RING_SYMBOL) {
    dr.drawCircle({ x: cx, y: cy }, r * 0.8, -1, COL_SYMBOL + i);
    dr.drawCircle({ x: cx, y: cy }, r * 0.8 - 1, -1, COL_SYMBOL + i);
    return;
  }
  for (const poly of SYMBOLS[i % SYMBOLS.length]) {
    const pts = poly.map(([x, y]) => ({ x: cx + x * r, y: cy + y * r }));
    dr.drawPolygon(pts, COL_SYMBOL + i, COL_SYMBOL + i);
  }
}

// --- draw state -------------------------------------------------------------

export interface BallsortDrawState {
  tileSize: number;
  started: boolean;
  /** What each tube last showed, as its key; "" before it is drawn. */
  tubes: string[];
  /** Whether the last frame drew something in flight, which the next frame
   * paints the whole board over. */
  flying: boolean;
}

export function newDrawState(s: BallsortState, tileSize: number): BallsortDrawState {
  return {
    tileSize,
    started: false,
    tubes: new Array<string>(s.w).fill(""),
    flying: false,
  };
}

// --- one tube ---------------------------------------------------------------

interface TubeLook {
  /** Each slot's ball, row 0 the mouth. */
  readonly balls: readonly number[];
  /** How many balls at the top are lifted out, as the held run. */
  readonly lifted: number;
  readonly cursor: boolean;
  readonly tone: WinTone;
  /** Slots, by row, the hint rings as the run to pour, and as where it lands. */
  readonly ringRun: readonly number[];
  readonly ringLand: readonly number[];
  /** Slots, by row, a rival pour's stripes cover. */
  readonly striped: readonly number[];
}

const keyOf = (l: TubeLook): string =>
  `${l.balls.join("")}|${l.lifted}|${l.cursor ? 1 : 0}|${l.tone}|${l.ringRun.join(",")}|${l.ringLand.join(",")}|${l.striped.join(",")}`;

function drawTube(
  dr: GameDrawing,
  s: BallsortState,
  ts: number,
  t: number,
  l: TubeLook,
): void {
  const { region, inside } = tubeAt(s, ts, t);
  dr.clip(region);
  dr.drawRect(region, COL_BACKGROUND);

  // The glass: the inside's box with a round bottom, a line wide all round.
  // A circle is drawn about a pixel's center and stroked half a pixel past
  // its radius, so one of radius (ts - 1) / 2 covers exactly the ts pixels
  // the walls stand either side of.
  const r = (ts - 1) / 2;
  const wall = Math.max(1, Math.floor(ts / 18));
  const glass = (d: number, color: number) => {
    dr.drawRect(
      {
        x: inside.x - d,
        y: inside.y - d,
        w: inside.w + 2 * d,
        h: inside.h - ts / 2 + d,
      },
      color,
    );
    dr.drawCircle(
      { x: inside.x + r, y: inside.y + inside.h - 1 - r },
      r + d,
      color,
      color,
    );
  };
  glass(wall, COL_WALL);
  const ground =
    l.tone === WIN_NONE ? COL_INSIDE : winSlot(l.tone, COL_FLASH, COL_FLASH_LEAD);
  glass(0, ground);
  // The mouth is open: the glass's top edge is not drawn.
  dr.drawRect(
    { x: inside.x, y: inside.y - wall, w: inside.w, h: wall },
    COL_BACKGROUND,
  );

  const lift = Math.floor(ts * 0.6);
  const top = l.balls.findIndex((v) => v !== 0);
  const held = (y: number) => top >= 0 && y >= top && y < top + l.lifted;
  // Where row y's ball is drawn, lifted out of the tube when it is picked up,
  // and so where a mark on it goes with it.
  const slot = (y: number): Rect => ({
    x: inside.x,
    y: inside.y + y * ts - (held(y) ? lift : 0),
    w: ts,
    h: ts,
  });
  for (let y = 0; y < s.h; y++) {
    const v = l.balls[y];
    if (v !== 0) drawBall(dr, slot(y), v, held(y));
  }

  for (const y of l.striped) dr.drawHatch(slot(y), hatchPeriod(ts));
  // One ring round each unbroken span of rows, so a ring never claims a slot
  // between two it names.
  for (const rows of [l.ringRun, l.ringLand]) {
    let start = 0;
    for (let k = 1; k <= rows.length; k++) {
      if (k < rows.length && rows[k] === rows[k - 1] + 1) continue;
      const box = around(rows.slice(start, k).map(slot));
      dr.drawRing(box, NOTHING_TO_CLEAR, Math.max(2, Math.floor(ts / 14)));
      start = k;
    }
  }

  // The cursor: a bar under the tube, clear of the balls.
  if (l.cursor) {
    const y = inside.y + inside.h + Math.floor(ts / 6);
    dr.drawRect(
      { x: inside.x, y, w: inside.w, h: Math.max(2, Math.floor(ts / 10)) },
      COL_CURSOR,
    );
  }
  dr.unclip();
  dr.drawUpdate(region);
}

// --- what is in flight ------------------------------------------------------

/** Balls in the air, all of one color: the top left of each one's slot box. */
interface Flight {
  readonly color: number;
  readonly balls: readonly Point[];
}

function drawFlight(dr: GameDrawing, ts: number, f: Flight): void {
  for (const at of f.balls) {
    drawBall(dr, { x: at.x, y: at.y, w: ts, h: ts }, f.color, false);
    dr.drawUpdate({ x: at.x, y: at.y, w: ts, h: ts });
  }
}

/** The pour between `a` and `b`, two boards one pour apart: the tube that
 * lost balls, the one that gained them, and how many. */
function pourBetween(
  a: BallsortState,
  b: BallsortState,
): { from: number; to: number; count: number } | null {
  let from = -1;
  let to = -1;
  for (let t = 0; t < a.w; t++) {
    const d = heightOf(b, t) - heightOf(a, t);
    if (d < 0) from = t;
    if (d > 0) to = t;
  }
  if (from < 0 || to < 0) return null;
  return { from, to, count: heightOf(b, to) - heightOf(a, to) };
}

/** How far behind the ball before it each ball of a pour sets off, as a share
 * of one ball's flight, so the run streams out rather than sliding as a
 * column through the tubes beside it. */
const POUR_LAG = 0.25;

/**
 * The way one ball flies from slot box `a` to slot box `b`: up out of its
 * tube into its row's headroom (`hoverA`, clear of every mouth), across in
 * the headroom of the row it lands in (`hoverB`), and down into its slot.
 *
 * Between rows it goes by the gap beside its tube, toward the other tube, or
 * toward the board's middle `midX` where that tube stands right below: no
 * way between the rows is clear of glass, and over a gap a ball overlaps only
 * a quarter of each wall, where any other way crosses a tube.
 */
function flightPath(
  a: Point,
  b: Point,
  hoverA: number,
  hoverB: number,
  ts: number,
  midX: number,
): Point[] {
  const path = [a, { x: a.x, y: hoverA }];
  if (hoverA !== hoverB) {
    const right = Math.abs(b.x - a.x) < ts ? a.x + ts / 2 < midX : b.x > a.x;
    // A tube is ts wide and the gap beside it half that, so a ball over the
    // gap's middle stands three quarters of a ball to the side.
    const gap = a.x + (right ? 0.75 : -0.75) * ts;
    path.push({ x: gap, y: hoverA }, { x: gap, y: hoverB });
  }
  path.push({ x: b.x, y: hoverB }, b);
  return path;
}

/** The point `f` of the way along `path`, measured by length. */
function along(path: readonly Point[], f: number): Point {
  const legs = path
    .slice(1)
    .map((p, k) => Math.hypot(p.x - path[k].x, p.y - path[k].y));
  let d = Math.min(1, Math.max(0, f)) * legs.reduce((x, y) => x + y, 0);
  for (let k = 0; k < legs.length; k++) {
    if (d <= legs[k] || k === legs.length - 1) {
      const t = legs[k] === 0 ? 1 : Math.min(1, d / legs[k]);
      return {
        x: path[k].x + (path[k + 1].x - path[k].x) * t,
        y: path[k].y + (path[k + 1].y - path[k].y) * t,
      };
    }
    d -= legs[k];
  }
  return path[path.length - 1];
}

// --- redraw -----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: BallsortDrawState,
  prev: BallsortState | null,
  s: BallsortState,
  _dir: number,
  ui: BallsortUi,
  animTime: number,
  flash: Flash,
  hint?: HintStep<BallsortMove>,
): void {
  const ts = ds.tileSize;
  const { size } = layoutOf(s.w, s.h, ts);

  // What flies this frame: a pour under way, or a run dragged by the pointer.
  let flight: Flight | null = null;
  let board = s;
  const pour = prev && animTime > 0 ? pourBetween(prev, s) : null;
  if (prev && pour) {
    const f = Math.min(1, animTime / POUR_SECONDS);
    // The run is out of the tube it left and not yet in the one it reaches.
    const ball = s.ball.slice();
    const color = s.ball[(s.h - heightOf(s, pour.to)) * s.w + pour.to];
    for (let k = 0; k < pour.count; k++)
      ball[(s.h - heightOf(s, pour.to) + k) * s.w + pour.to] = 0;
    board = { ...s, ball };
    const fromTop = slotRect(
      prev,
      ts,
      (prev.h - heightOf(prev, pour.from)) * prev.w + pour.from,
    );
    const toTop = slotRect(s, ts, (s.h - heightOf(s, pour.to)) * s.w + pour.to);
    const hoverFrom = tubeAt(s, ts, pour.from).region.y;
    const hoverTo = tubeAt(s, ts, pour.to).region.y;
    const span = 1 + (pour.count - 1) * POUR_LAG;
    // Ball k of the run, from the top, leaves k-th and lands the deepest
    // still empty: the top ball goes first and comes to rest lowest.
    const balls = Array.from({ length: pour.count }, (_, k) => {
      const start = { x: fromTop.x, y: fromTop.y + k * ts };
      const end = { x: toTop.x, y: toTop.y + (pour.count - 1 - k) * ts };
      return along(
        flightPath(start, end, hoverFrom, hoverTo, ts, size.w / 2),
        f * span - k * POUR_LAG,
      );
    });
    flight = { color, balls };
  } else if (ui.drag?.moved) {
    const from = ui.drag.from;
    const run = topRun(s, from);
    if (run > 0) {
      const top = (s.h - heightOf(s, from)) * s.w + from;
      const ball = s.ball.slice();
      for (let k = 0; k < run; k++) ball[top + k * s.w] = 0;
      // The dragged run hangs from the pointer as it stood in its tube.
      const x = ui.drag.x - Math.floor(ts / 2);
      const y = ui.drag.y - Math.floor(ts / 2);
      flight = {
        color: s.ball[top],
        balls: Array.from({ length: run }, (_, k) => ({ x, y: y + k * ts })),
      };
      board = { ...s, ball };
    }
  }

  if (ds.flying || flight) {
    dr.drawRect({ x: 0, y: 0, w: size.w, h: size.h }, COL_BACKGROUND);
    dr.drawUpdate({ x: 0, y: 0, w: size.w, h: size.h });
    ds.tubes.fill("");
  }
  ds.started = true;

  // The displayed step's marks, read from its words and from nowhere else.
  const marks = stepMarks(hint);
  const ringRun = new Set(marks.of("ring", RUN));
  const ringLand = new Set(
    marks
      .of("ring", TUBE)
      .flatMap((t) =>
        hint?.move.type === "pour" && hint.move.to === t
          ? landingSlots(s, hint.move)
          : [],
      ),
  );
  const striped = new Set(
    marks
      .of("stripes", POUR)
      .flatMap((m) => [...movingBalls(s, m), ...landingSlots(s, m)]),
  );

  for (let t = 0; t < s.w; t++) {
    const { col, row } = tubeAt(s, ts, t);
    const rowsOf = (set: ReadonlySet<number>) => {
      const out: number[] = [];
      for (let y = 0; y < s.h; y++) if (set.has(y * s.w + t)) out.push(y);
      return out;
    };
    const look: TubeLook = {
      balls: Array.from({ length: s.h }, (_, y) => board.ball[y * s.w + t]),
      lifted: ui.held === t && !ui.drag?.moved ? topRun(s, t) : 0,
      cursor: ui.cursor.visible && ui.cursor.x === t,
      tone: flash.win(sweepStep(col, row)),
      ringRun: rowsOf(ringRun),
      ringLand: rowsOf(ringLand),
      striped: rowsOf(striped),
    };
    const key = keyOf(look);
    if (key === ds.tubes[t]) continue;
    drawTube(dr, s, ts, t, look);
    ds.tubes[t] = key;
  }

  if (flight) drawFlight(dr, ts, flight);
  ds.flying = flight !== null;
}

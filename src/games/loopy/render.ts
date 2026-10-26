/**
 * Loopy rendering — port of `game_compute_size` / `game_colours` /
 * `game_new_drawstate` / the drawing half of `loopy.c`.
 *
 * There is **no per-tiling drawing code at all**: faces are never filled,
 * edges are always straight `dot1→dot2` segments, and dots are always
 * circles. Every visible difference between the 18 tilings comes out of
 * `grid.ts`'s geometry.
 *
 * Two deliberate divergences from the C, both display-only:
 *
 * - **No incremental redraw.** Upstream carries ~200 lines of bounding-box,
 *   clip and `draw_update` machinery to repaint sub-rectangles, because an
 *   antialiased diagonal drawn over itself gets steadily thicker — which cannot
 *   happen in a renderer that clears and repaints. What survives is the part
 *   that carries meaning: the per-face error/satisfied key, and the five-phase
 *   color z-order, which is a real ordering — mistakes must paint over
 *   everything.
 * - **Whole-pixel coordinates** — see {@link border} and {@link toScreen}.
 *
 * The palette, by contrast, is upstream's exactly, *including* its known
 * misbehavior on a dark background: adapting for that here would fight the
 * app's own dark-mode pipeline. See {@link colors}.
 */

import {
  CURSOR,
  clueDoneColor,
  ERROR,
  FLASH,
  FLASH_LEAD,
  HINT_OUTLINE,
  INK,
  lineMaybeColor,
  lineNoColor,
  PENCIL_BODY,
  pencilColor,
} from "../../engine/color/palette.ts";
import { glyphFont, strokeScaledPolygon } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import type { Grid, GridDot, GridFace, GridType } from "../../engine/grid/index.ts";
import { gridComputeSize, gridFindIncenter } from "../../engine/grid/index.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import {
  drawPencilGlyph,
  pencilIndicatorBox,
  pencilIndicatorReach,
} from "../../engine/pencil-indicator.ts";
import { MARK_EDGE_PX, type RingClear, ringShape, textBox } from "../../engine/ring.ts";
import type { Color, DrawTextOptions, Point, Rect, Size } from "../../engine/types.ts";
import {
  type Flash,
  loopSteps,
  WIN_NONE,
  type WinTone,
  walkLoop,
  winSlot,
} from "../../engine/win-wave.ts";
import type { LoopyCursor } from "./cursor.ts";
import { CORNER, DOT, EDGE, FACE, PAIR } from "./hint-text.ts";
import type { LoopyMove, LoopyNoteDrag } from "./index.ts";
import { cornerArc, cursorCorner } from "./notes.ts";
import { gridTypeOf, LOOPY_GRIDS, type LoopyParams } from "./params.ts";
import {
  faceOrder,
  LINE_NO,
  LINE_UNKNOWN,
  LINE_YES,
  type LoopyMistake,
  type LoopyPair,
  type LoopyState,
  lineRun,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 32;

// --- palette (index-for-index with the loopy.c color enum) ----------------
export const COL_BACKGROUND = 0;
export const COL_FOREGROUND = 1;
export const COL_LINEUNKNOWN = 2;
export const COL_HIGHLIGHT = 3;
export const COL_MISTAKE = 4;
export const COL_SATISFIED = 5;
export const COL_FAINT = 6;
/** The keyboard cursor — this fork's addition; upstream has no cursor here. */
export const COL_CURSOR = 7;
/** What a hint step reasons from: clues, dots, lines and the notes it cites.
 * The edges it sets and the note it places are ringed by the engine. */
export const COL_HINT_CELL = 8;
/** The player's corner and pair notes. */
export const COL_PENCIL = 9;
/** The notes-mode indicator's pencil body. */
export const COL_PENCIL_BODY = 10;
/** The leading edge of the win flash, on an edge of the loop. */
export const COL_HIGHLIGHT_LEAD = 11;

/**
 * The subset of the game UI the renderer reads. The full `LoopyUi` lives in
 * `index.ts` and satisfies this structurally.
 */
export interface LoopyRenderUi {
  drawFaintLines: boolean;
  cursor: LoopyCursor;
  pencilMode: boolean;
  noteDrag: LoopyNoteDrag | null;
  pin: number;
  hoverEdge: number;
}

const clamp = (lo: number, v: number, hi: number): number =>
  Math.min(Math.max(lo, v), hi);

const dotRadius = (tileSize: number): number => clamp(1, (tileSize * 2.5) / 32, 3);
const lineThickness = (tileSize: number): number => clamp(1, (tileSize * 3) / 32, 3);
const faintLineThickness = (tileSize: number): number => clamp(0.5, tileSize / 24, 1.5);
/** The cursor's halo under its chosen edge: three line-widths, so the edge's own
 * color reads on top of it with a clear margin either side. */
const cursorHaloThickness = (tileSize: number): number => 3 * lineThickness(tileSize);
/** The disc under the cursor's dot: comfortably larger than the dot, and never
 * so large it reads as a face marking. */
const cursorDiscRadius = (tileSize: number): number =>
  clamp(4, 2 * dotRadius(tileSize) + 2, 9);

/**
 * The gutter around the board, in pixels: wide enough for the keyboard
 * cursor's disc on a boundary dot, for its halo on a boundary edge, and for a
 * **corner note on a boundary dot**, whose band reaches `0.45` of the shortest
 * edge at that dot and carries an outline just outside that again. Half the
 * corners of a board are at its rim, so a gutter sized for the cursor alone
 * clipped every one of them.
 *
 * It is also what the notes-mode pencil sits in — {@link pencilIndicatorBox}
 * puts that at the canvas's top-right, where no tiling draws anything.
 *
 * Rounded **up** to a whole pixel, which the C does not do: a whole-pixel
 * border keeps every coordinate integral (the pixel-center convention
 * `Drawing` expects).
 */
export function border(tileSize: number): number {
  return Math.ceil(
    Math.max(
      dotRadius(tileSize),
      cursorDiscRadius(tileSize),
      cornerNoteReach(tileSize),
      pencilIndicatorReach(tileSize),
    ),
  );
}

/** How far a corner note reaches from its dot: {@link drawCornerWedge}'s widest
 * band (`0.45` of an edge, and an edge at the rim is at most a tile), plus the
 * outline it draws outside that for "at most one line". */
const cornerNoteReach = (tileSize: number): number => 0.45 * tileSize + 6;

export interface LoopyDrawState {
  tileSize: number;
  /** Per-face clue coloring keys, as booleans in a byte array. */
  clueError: Uint8Array;
  clueSatisfied: Uint8Array;
}

export function newDrawState(s: LoopyState, tileSize: number): LoopyDrawState {
  const { numFaces } = s.grid;
  return {
    tileSize,
    clueError: new Uint8Array(numFaces),
    clueSatisfied: new Uint8Array(numFaces),
  };
}

export function computeSize(p: LoopyParams, tileSize: number): Size {
  return boardSize(gridTypeOf(p), p.w, p.h, tileSize);
}

/**
 * The board a `type`/`w`/`h` grid is given, from the tiling's **nominal**
 * extent. {@link redraw} paints its background to this, not to the built grid's
 * own extent: an aperiodic patch is trimmed and can come out narrower than
 * nominal, and the difference would otherwise go unpainted (a black strip down
 * the right of a Hats board).
 */
function boardSize(type: GridType, w: number, h: number, tileSize: number): Size {
  const g = gridComputeSize(type, w, h);
  const b = border(tileSize);
  // Multiply before dividing, to minimize rounding error on the integer
  // division (upstream's note).
  return {
    w: Math.floor((g.xExtent * tileSize) / g.tileSize) + 2 * b + 1,
    h: Math.floor((g.yExtent * tileSize) / g.tileSize) + 2 * b + 1,
  };
}

/**
 * The palette, index-for-index with the `loopy.c` color enum. Every value is
 * a shared role: the undecided and ruled-out edges are `lineMaybeColor` and
 * `lineNoColor`, which Palisade and Separate draw with too, and the board
 * itself is whatever `resolvePalette` hands every game.
 *
 * `COL_FAINT` and `COL_LINEUNKNOWN` derive from the background by moving
 * *towards black*, which upstream concedes fails on a dark host (`loopy.c`:
 * *"Except if the background is pretty dark already; then it ought to be a bit
 * lighter. Oy vey."*). **Do not adapt for it here**: `colors()` never sees a
 * dark background — `components/view.ts` hands the engine pure white in dark
 * mode and adapts the returned palette in OKLCH — and the two roles carry their
 * own authored dark values (docs/rendering.md § "Dark mode is the app's
 * concern").
 */
export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_FOREGROUND] = INK;
  out[COL_LINEUNKNOWN] = lineMaybeColor(defaultBackground);
  out[COL_HIGHLIGHT] = FLASH;
  out[COL_HIGHLIGHT_LEAD] = FLASH_LEAD;
  out[COL_MISTAKE] = ERROR;
  // A deliberate, player-visible aid: upstream drew a satisfied clue in the
  // same black as an open one. Graying it retires the clue the way Magnets and
  // Towers do.
  out[COL_SATISFIED] = clueDoneColor(defaultBackground);
  out[COL_FAINT] = lineNoColor(defaultBackground);
  out[COL_CURSOR] = CURSOR;
  out[COL_HINT_CELL] = HINT_OUTLINE;
  out[COL_PENCIL] = pencilColor(defaultBackground);
  out[COL_PENCIL_BODY] = PENCIL_BODY;
  return out;
}

// --- drawing ---------------------------------------------------------------

/**
 * Project a grid coordinate onto the canvas. Mirrors `grid_to_screen`.
 *
 * Rounds to nearest where the C truncates (its `int` division, and its `int`
 * assignment of the fractional `BORDER`). Both that and {@link border}'s
 * ceiling are **deliberate display-side choices, not fidelity bugs** — they
 * keep every drawing coordinate integral, which is what `Drawing`'s
 * pixel-center convention wants, and keep lines concentric with the dots they
 * join. Please don't "restore" the truncation.
 */
export function toScreen(
  g: Grid,
  tileSize: number,
  gx: number,
  gy: number,
): [number, number] {
  const b = border(tileSize);
  return [
    Math.round(((gx - g.lowestX) * tileSize) / g.tileSize) + b,
    Math.round(((gy - g.lowestY) * tileSize) / g.tileSize) + b,
  ];
}

/** The color phases, in z-order: mistakes paint over everything. */
const PHASES = [
  COL_FAINT,
  COL_LINEUNKNOWN,
  COL_FOREGROUND,
  COL_HIGHLIGHT,
  COL_HIGHLIGHT_LEAD,
  COL_MISTAKE,
] as const;

/** Each edge's step around the finished loop, from the edge nearest the
 * bottom-left corner and clockwise, and -1 for an edge off it. */
function loopOrder(s: LoopyState): Int32Array {
  const g = s.grid;
  const loop: number[] = [];
  for (let i = 0; i < g.numEdges; i++) if (s.lines[i] === LINE_YES) loop.push(i);
  const walk = walkLoop(
    loop.map((i) => [g.edges[i].dot1.index, g.edges[i].dot2.index] as const),
  ).links.map((k) => loop[k]);
  const steps = loopSteps(
    walk.map((i) => {
      const { dot1, dot2 } = g.edges[i];
      return { x: (dot1.x + dot2.x) / 2, y: (dot1.y + dot2.y) / 2 };
    }),
  );
  const around = new Int32Array(g.numEdges).fill(-1);
  walk.forEach((i, n) => {
    around[i] = steps[n];
  });
  return around;
}

/** The color edge `i` draws in: an error highlight overrides its line state, and
 * so does a line the mistake check says the loop does not run along. */
function lineColor(
  s: LoopyState,
  i: number,
  tone: WinTone,
  mistaken: Uint8Array,
): number {
  if (s.lineErrors[i]) return COL_MISTAKE;
  if (s.lines[i] === LINE_UNKNOWN) return COL_LINEUNKNOWN;
  if (s.lines[i] === LINE_NO) return COL_FAINT;
  if (mistaken[i]) return COL_MISTAKE;
  return tone === WIN_NONE
    ? COL_FOREGROUND
    : winSlot(tone, COL_HIGHLIGHT, COL_HIGHLIGHT_LEAD);
}

// --- notes, hint and mistake marks -------------------------------------------
//
// Loopy repaints every frame, so a mark needs no cache key and nothing to erase:
// it is drawn from the state, the ui and the displayed step each time, in its place
// in the z-order.

const midpoint = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

const along = (a: Point, b: Point, t: number): Point => ({
  x: Math.round(a.x + (b.x - a.x) * t),
  y: Math.round(a.y + (b.y - a.y) * t),
});

function dotAt(g: Grid, ts: number, d: GridDot): Point {
  const [x, y] = toScreen(g, ts, d.x, d.y);
  return { x, y };
}

function edgeEnds(g: Grid, ts: number, i: number): [Point, Point] {
  const e = g.edges[i];
  return [dotAt(g, ts, e.dot1), dotAt(g, ts, e.dot2)];
}

function edgeMidpoint(g: Grid, ts: number, i: number): Point {
  const [a, b] = edgeEnds(g, ts, i);
  return midpoint(a, b);
}

/** How thick a hint's ring is. */
const ringThickness = (ts: number): number =>
  Math.max(2, Math.round(lineThickness(ts) * 0.8));

/** The box round `points`, `pad` out on every side. */
function boxAround(points: readonly Point[], pad: number): Rect {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const x = Math.min(...xs) - pad;
  const y = Math.min(...ys) - pad;
  return { x, y, w: Math.max(...xs) + pad - x, h: Math.max(...ys) + pad - y };
}

/** The frame's text a ring at `box` might reach, `avoid`ed, and the text it
 * holds, `enclose`d. A ring never grows past half its box's short side, so
 * text further off than that is left out. */
function clearOf(
  box: Rect,
  texts: readonly Rect[],
  enclose: readonly Rect[] = [],
): RingClear {
  const reach = Math.min(box.w, box.h) / 2 + 2;
  const near = (r: Rect): boolean =>
    r.x < box.x + box.w + reach &&
    r.x + r.w > box.x - reach &&
    r.y < box.y + box.h + reach &&
    r.y + r.h > box.y - reach;
  return { enclose, avoid: texts.filter(near) };
}

/** How far the pill round an edge reaches either side of its line: never so
 * near that the stroke leaves no room for the edge inside it. */
const edgeRingPad = (ts: number): number =>
  Math.max(Math.round(0.12 * ts), ringThickness(ts) + lineThickness(ts) + 1);

/** The ring round an edge the hint sets: a pill along its middle, which is
 * a circle on a diagonal edge, with the edge drawn inside as it must become:
 * solid for a line, broken for an edge the loop cannot use, so the two read
 * apart without their color. */
function drawEdgeRing(
  dr: GameDrawing,
  a: Point,
  b: Point,
  line: boolean,
  ts: number,
  texts: readonly Rect[],
  room: Rect,
): void {
  const thickness = lineThickness(ts);
  const { box, clear } = edgeRingBox(a, b, edgeRingPad(ts), ts, texts, room);
  dr.drawRing(box, clear, ringThickness(ts), {
    room,
    inside: (ink) => {
      if (line) {
        dr.drawLine(a, b, ink, thickness);
        return;
      }
      for (let k = 0; k < 4; k++) {
        const t = 0.05 + k * 0.25;
        dr.drawLine(along(a, b, t), along(a, b, t + 0.15), ink, thickness);
      }
    },
  });
}

/** Where the pill round an edge goes: along its middle half or, where the
 * pair signs of the notes round it crowd that, slid along the edge and
 * widened a pixel or two to the nearest stretch they leave clear, and
 * shortened only where no half of it is. Any of these lies along the edge
 * alone, so it names the same edge. */
function edgeRingBox(
  a: Point,
  b: Point,
  pad: number,
  ts: number,
  texts: readonly Rect[],
  room: Rect,
): { box: Rect; clear: RingClear } {
  const shape = (start: number, length: number, grow: number) => {
    const box = boxAround(
      [along(a, b, start), along(a, b, start + length)],
      pad + grow,
    );
    return { box, clear: clearOf(box, texts) };
  };
  // The middle half of the edge, then shorter stretches of it.
  for (let tenths = 5; tenths >= 3; tenths--) {
    const length = tenths / 10;
    const slack = (1 - length) / 2;
    for (let off = 0; off <= slack + 1e-9; off += 0.05)
      for (const start of off === 0 ? [slack] : [slack - off, slack + off])
        for (let grow = 0; grow <= 3; grow++) {
          const candidate = shape(start, length, grow);
          if (fits(candidate.box, candidate.clear, ts, room)) return candidate;
        }
  }
  // Nothing clears: `drawRing` says so.
  return shape(0.25, 0.5, 0);
}

/** Where a clue's digit is drawn, which its text and a ring both read. */
function clueText(
  g: Grid,
  ts: number,
  f: GridFace,
): { origin: Point; options: DrawTextOptions } {
  gridFindIncenter(f);
  const [x, y] = toScreen(g, ts, f.ix, f.iy);
  return { origin: { x, y }, options: glyphFont(Math.floor(ts / 2)) };
}

/** A clue's outline, drawn inside its face so it never sits on the face's edges. */
function drawFaceOutline(dr: GameDrawing, g: Grid, ts: number, f: GridFace): void {
  gridFindIncenter(f);
  const [cx, cy] = toScreen(g, ts, f.ix, f.iy);
  const corners = f.dots.flatMap((d) => (d === null ? [] : [dotAt(g, ts, d)]));
  const thickness = Math.max(2, Math.round(lineThickness(ts) * 0.7));
  strokeScaledPolygon(dr, corners, { x: cx, y: cy }, 0.8, COL_HINT_CELL, thickness);
}

/** A ring round a dot the sentence names: an annulus, painted before the edges so
 * the lines at the dot stay on top of it. */
const dotRingRadius = (ts: number): number => clamp(5, 2 * dotRadius(ts) + 4, 10);

function drawDotRing(dr: GameDrawing, p: Point, ts: number): void {
  const outer = dotRingRadius(ts);
  const width = Math.max(2, Math.round(lineThickness(ts) * 0.8));
  dr.drawCircle(p, outer, COL_HINT_CELL, COL_HINT_CELL);
  dr.drawCircle(p, outer - width, COL_BACKGROUND, COL_BACKGROUND);
}

/** A pair note's `=` or `≠`: legible on a small board, and on a large one no bigger
 * than it needs to be beside a connector. */
const labelFont = (ts: number): number => clamp(10, Math.floor(ts / 4), 22);

/**
 * A corner note's wedge: a band across the angle between its two edges, filled
 * when the loop needs a line there and outlined when it has room for one at most
 * (both, for exactly one). `outline` draws only the band's edge, for the keyboard's
 * preview of the corner Enter would note.
 *
 * The band starts clear of the dot and stops short of the edges' midpoints, so the
 * wedges at the two ends of an edge never meet.
 */
function drawCornerWedge(
  dr: GameDrawing,
  g: Grid,
  ts: number,
  dline: number,
  bits: number,
  color: number,
  outline = false,
  radii?: WedgeRadii,
): void {
  const { band, arcAt, outer, stroke } = cornerWedge(g, ts, dline, radii);
  const polyline = (shape: Point[]): void => {
    for (let k = 0; k + 1 < shape.length; k++)
      dr.drawLine(shape[k], shape[k + 1], color, stroke);
  };
  if (outline) {
    polyline([...band, band[0]]);
    return;
  }
  if (bits & 1) dr.drawPolygon(band, color, color);
  // Alone, the band's outline. On a corner carrying exactly one line, a second arc
  // just outside the filled band.
  if (bits & 2) polyline(bits & 1 ? arcAt(outer + stroke + 2) : [...band, band[0]]);
}

/** How far from its dot a corner note's band runs. */
interface WedgeRadii {
  readonly inner: number;
  readonly outer: number;
}

/** A corner note's dot `p`, the shortest edge at it, its band, its arc at a
 * radius from the dot, its outer radius and its stroke: what
 * {@link drawCornerWedge} draws, at `radii` or the note's own. */
function cornerWedge(
  g: Grid,
  ts: number,
  dline: number,
  radii?: WedgeRadii,
): {
  p: Point;
  length: number;
  band: Point[];
  arcAt: (radius: number) => Point[];
  outer: number;
  stroke: number;
} {
  const { dot, from, sweep } = cornerArc(g, dline);
  const p = dotAt(g, ts, dot);
  const length = Math.min(
    ...dot.edges.map((e) => {
      const q = dotAt(g, ts, e.dot1 === dot ? e.dot2 : e.dot1);
      return Math.hypot(q.x - p.x, q.y - p.y);
    }),
  );
  const inner = radii?.inner ?? Math.min(dotRingRadius(ts) + 1, 0.25 * length);
  // Short of where a pair between the corner's own two edges crosses it (about a
  // third of an edge out on a square corner), so that pair's connector stays clear.
  const outer =
    radii?.outer ??
    Math.min(Math.max(inner + 8, 0.3 * Math.min(length, ts)), 0.45 * length);
  const arcAt = (radius: number): Point[] => {
    const points: Point[] = [];
    for (let k = 0; k <= 6; k++) {
      const a = from + sweep * (0.12 + (0.76 * k) / 6);
      points.push({
        x: Math.round(p.x + radius * Math.cos(a)),
        y: Math.round(p.y + radius * Math.sin(a)),
      });
    }
    return points;
  };
  const band = [...arcAt(outer), ...arcAt(inner).reverse()];
  const stroke = Math.max(2, Math.round(lineThickness(ts) * 0.8));
  return { p, length, band, arcAt, outer, stroke };
}

/** The ring round the corner note a step places: a circle round its dot,
 * with the note inside it drawn short enough to fit. A ring round the note's
 * own band would cross the clue of the face it lies in, which the band runs
 * up to. */
function drawCornerRing(
  dr: GameDrawing,
  g: Grid,
  ts: number,
  dline: number,
  bits: number,
  texts: readonly Rect[],
  room: Rect,
): void {
  const { p, length, stroke } = cornerWedge(g, ts, dline);
  const thickness = ringThickness(ts);
  const half = Math.round(0.4 * Math.min(length, ts));
  const box = { x: p.x - half, y: p.y - half, w: 2 * half, h: 2 * half };
  const second = (bits & 3) === 3 ? stroke + 2 : 0;
  const radii = { inner: dotRadius(ts) + 2, outer: half - thickness - 1 - second };
  dr.drawRing(box, clearOf(box, texts), thickness, {
    room,
    inside: (ink) => drawCornerWedge(dr, g, ts, dline, bits, ink, false, radii),
  });
}

/** A pair note's connector between the midpoints of its two edges, and its
 * `=` or `≠` at `at` (`placeSigns`). */
function drawPairConnector(
  dr: GameDrawing,
  g: Grid,
  ts: number,
  pair: LoopyPair,
  at: Point,
  color: number,
): { at: Point; text: string; color: number } {
  const { a, b, thickness, text } = pairConnector(g, ts, pair);
  dr.drawLine(a, b, color, thickness);
  for (const end of [a, b]) dr.drawCircle(end, thickness + 1, color, color);
  return { at, text, color };
}

/** A pair note's connector, from `a` to `b` `thickness` wide, and its sign's
 * `text`. */
function pairConnector(
  g: Grid,
  ts: number,
  pair: LoopyPair,
): { a: Point; b: Point; thickness: number; text: string } {
  return {
    a: edgeMidpoint(g, ts, pair.a),
    b: edgeMidpoint(g, ts, pair.b),
    thickness: Math.max(2, Math.round(lineThickness(ts) * 0.6)),
    text: pair.opposite ? "≠" : "=",
  };
}

/** Distance from the segment `a`–`b` to the rect `r`; 0 where they meet. */
function segmentRectDistance(a: Point, b: Point, r: Rect): number {
  const inside = (p: Point): boolean =>
    p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  if (inside(a) || inside(b)) return 0;
  const corners = [
    { x: r.x, y: r.y },
    { x: r.x + r.w, y: r.y },
    { x: r.x + r.w, y: r.y + r.h },
    { x: r.x, y: r.y + r.h },
  ];
  const cross = (o: Point, p: Point, q: Point): number =>
    (p.x - o.x) * (q.y - o.y) - (p.y - o.y) * (q.x - o.x);
  for (let k = 0; k < 4; k++) {
    const c = corners[k];
    const d = corners[(k + 1) % 4];
    if (cross(a, b, c) * cross(a, b, d) <= 0 && cross(c, d, a) * cross(c, d, b) <= 0)
      return 0;
  }
  const toSegment = (p: Point, s: Point, t: Point): number => {
    const dx = t.x - s.x;
    const dy = t.y - s.y;
    const len2 = dx * dx + dy * dy;
    const u =
      len2 === 0 ? 0 : clamp(0, ((p.x - s.x) * dx + (p.y - s.y) * dy) / len2, 1);
    return Math.hypot(p.x - s.x - u * dx, p.y - s.y - u * dy);
  };
  const rectPoint = (p: Point): number =>
    Math.hypot(
      Math.max(r.x - p.x, 0, p.x - (r.x + r.w)),
      Math.max(r.y - p.y, 0, p.y - (r.y + r.h)),
    );
  return Math.min(
    rectPoint(a),
    rectPoint(b),
    ...corners.map((c) => toSegment(c, a, b)),
  );
}

const SIGN_LAYOUTS = new WeakMap<
  readonly LoopyPair[],
  Map<string, Map<string, Point>>
>();

/**
 * Where each pair note's sign goes, by `pairKey`: beside its connector a third
 * of the way along, since at its middle the sign would sit on the clue of a
 * face the pair crosses, unless that puts it on an edge, a clue or a sign
 * already placed. Then it goes to the nearest spot along the connector, on
 * either side, that clears them all, or, on a spot crowded past that, the one
 * that crosses fewest. Placed in `pairKey` order, `extra` (the pair a hint
 * places) among them, so a note sits where it will once the move is made.
 */
function placeSigns(
  g: Grid,
  ts: number,
  s: LoopyState,
  extra: LoopyPair | null,
): Map<string, Point> {
  const cacheKey = `${ts}|${extra ? `${pairKey(extra.a, extra.b)}${extra.opposite}` : ""}`;
  const byState = SIGN_LAYOUTS.get(s.pairs) ?? new Map<string, Map<string, Point>>();
  SIGN_LAYOUTS.set(s.pairs, byState);
  const cached = byState.get(cacheKey);
  if (cached) return cached;

  const pairs = [...s.pairs];
  if (extra && !pairs.some((p) => pairKey(p.a, p.b) === pairKey(extra.a, extra.b)))
    pairs.push(extra);
  pairs.sort((p, q) => p.a - q.a || p.b - q.b);

  const edges = g.edges.map((_, i) => edgeEnds(g, ts, i));
  const lineClear = lineThickness(ts) / 2 + 1;
  const taken: Rect[] = [];
  for (let i = 0; i < g.numFaces; i++) {
    if (s.clues[i] < 0) continue;
    const { origin, options } = clueText(g, ts, g.faces[i]);
    taken.push(textBox(origin, options, String(s.clues[i])));
  }
  const overlaps = (r: Rect, q: Rect): boolean =>
    r.x < q.x + q.w + 1 &&
    q.x < r.x + r.w + 1 &&
    r.y < q.y + q.h + 1 &&
    q.y < r.y + r.h + 1;
  // Off the middle half of an edge by as far as a hint's pill round it
  // reaches, where it can be, so the pill has room.
  const pillClear = edgeRingPad(ts) + MARK_EDGE_PX;
  const reach = Math.max(lineClear, pillClear);
  /** Hard crossings (a line, a clue, a sign) count a hundred, a sign in the
   * reach of a pill one. */
  const conflicts = (box: Rect): number => {
    let n = 0;
    for (const [p, q] of edges) {
      if (
        Math.max(p.x, q.x) < box.x - reach ||
        Math.min(p.x, q.x) > box.x + box.w + reach ||
        Math.max(p.y, q.y) < box.y - reach ||
        Math.min(p.y, q.y) > box.y + box.h + reach
      )
        continue;
      if (segmentRectDistance(p, q, box) < lineClear) n += 100;
      else if (
        segmentRectDistance(along(p, q, 0.25), along(p, q, 0.75), box) < pillClear
      )
        n++;
    }
    for (const t of taken) if (overlaps(box, t)) n += 100;
    return n;
  };

  const out = new Map<string, Point>();
  const font = labelFont(ts);
  for (const pair of pairs) {
    const { a, b, text } = pairConnector(g, ts, pair);
    const len = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    let best: { at: Point; box: Rect; n: number } | null = null;
    search: for (const off of [0.7, 1]) {
      for (const along of [0.35, 0.5, 0.25, 0.65, 0.15, 0.75]) {
        for (const side of [1, -1]) {
          const at = {
            x: Math.round(a.x + (b.x - a.x) * along + nx * side * off * font),
            y: Math.round(a.y + (b.y - a.y) * along + ny * side * off * font),
          };
          const box = textBox(at, labelOptions(ts), text);
          const n = conflicts(box);
          if (!best || n < best.n) best = { at, box, n };
          if (n === 0) break search;
        }
      }
    }
    if (!best) continue;
    out.set(pairKey(pair.a, pair.b), best.at);
    taken.push(best.box);
  }
  byState.set(cacheKey, out);
  return out;
}

/** The ring round the pair note a step places: round its connector and its
 * sign, with both inside it. */
function drawPairRing(
  dr: GameDrawing,
  g: Grid,
  ts: number,
  pair: LoopyPair,
  at: Point,
  texts: readonly Rect[],
  room: Rect,
): void {
  const { a, b, thickness, text } = pairConnector(g, ts, pair);
  const sign = textBox(at, labelOptions(ts), text);
  // Padded as far on every side as the sign sticks out on one, so the ring
  // centers on the connector and a clue it runs through sits in its middle.
  const line = boxAround([a, b], 0);
  const out = Math.max(
    0,
    line.x - sign.x,
    sign.x + sign.w - (line.x + line.w),
    line.y - sign.y,
    sign.y + sign.h - (line.y + line.h),
  );
  const whole = boxAround([a, b], out + thickness + 1);
  // Where the player's other pair signs crowd the connector, no ring round
  // it clears them all; then the ring goes round the sign alone, with the
  // stretch of connector beside it, and where another sign all but touches
  // this one, a ring goes round each end of the connector instead, and the
  // sentence says which relation it is.
  const signBox = boxAround(
    [
      { x: sign.x, y: sign.y },
      { x: sign.x + sign.w, y: sign.y + sign.h },
    ],
    thickness + 1,
  );
  const ends = [a, b].map((p) => boxAround([p], 2 * thickness + ringThickness(ts)));
  const shapes: { box: Rect; clear: RingClear }[][] = [
    [{ box: whole, clear: clearOf(whole, texts, [sign]) }],
    [{ box: signBox, clear: clearOf(signBox, texts, [sign]) }],
    ends.map((box) => ({ box, clear: clearOf(box, [...texts, sign]) })),
  ];
  const rings =
    shapes.find((s) => s.every(({ box, clear }) => fits(box, clear, ts, room))) ??
    shapes[0];
  for (const { box, clear } of rings)
    dr.drawRing(box, clear, ringThickness(ts), {
      room,
      inside: (ink) => {
        drawPairConnector(dr, g, ts, pair, at, ink);
        drawLabel(dr, at, ts, text, ink);
      },
    });
}

/** Whether a ring at `box` fits clear of its text (`ringShape`). */
function fits(box: Rect, clear: RingClear, ts: number, room: Rect): boolean {
  try {
    ringShape(box, clear, ringThickness(ts), room);
    return true;
  } catch {
    return false;
  }
}

const labelOptions = (ts: number): DrawTextOptions => ({
  align: "center",
  baseline: "mathematical",
  fontType: "variable",
  size: labelFont(ts),
});

function drawLabel(
  dr: GameDrawing,
  at: Point,
  ts: number,
  text: string,
  color: number,
): void {
  dr.drawText(at, labelOptions(ts), color, text);
}

/** A red cross over an edge the player ruled out that the loop runs along. A red
 * line would read as a drawn line, which this edge is not. */
function drawMistakenCross(dr: GameDrawing, a: Point, b: Point, ts: number): void {
  const m = midpoint(a, b);
  const r = Math.max(3, Math.round(ts / 6));
  const t = lineThickness(ts);
  dr.drawLine({ x: m.x - r, y: m.y - r }, { x: m.x + r, y: m.y + r }, COL_MISTAKE, t);
  dr.drawLine({ x: m.x - r, y: m.y + r }, { x: m.x + r, y: m.y - r }, COL_MISTAKE, t);
}

const pairKey = (a: number, b: number): string => (a < b ? `${a}:${b}` : `${b}:${a}`);

/**
 * The player's notes, and the hint's marks on notes: each note in the pencil color,
 * red when the mistake check flags it, and in the evidence color when the displayed
 * step reasons from it. Returns the pair signs, which are drawn last.
 */
function drawNotes(
  dr: GameDrawing,
  g: Grid,
  ts: number,
  s: LoopyState,
  hint: HintStep<LoopyMove> | null,
  mistakes: readonly LoopyMistake[],
  signs: ReadonlyMap<string, Point>,
): { at: Point; text: string; color: number }[] {
  const wrongCorners = new Set<number>();
  const wrongPairs = new Set<string>();
  for (const m of mistakes) {
    if (m.kind === "corner") wrongCorners.add(m.dline);
    if (m.kind === "pair") wrongPairs.add(pairKey(m.a, m.b));
  }
  const marks = stepMarks(hint);
  const citedCorners = new Set(marks.of("outline", CORNER));
  const citedPairs = new Set(marks.of("outline", PAIR).map((p) => pairKey(p.a, p.b)));

  for (let dline = 0; dline < s.corners.length; dline++) {
    const bits = s.corners[dline];
    if (bits === 0) continue;
    const color = wrongCorners.has(dline)
      ? COL_MISTAKE
      : citedCorners.has(dline)
        ? COL_HINT_CELL
        : COL_PENCIL;
    drawCornerWedge(dr, g, ts, dline, bits, color);
  }
  const labels = s.pairs.map((p) => {
    const key = pairKey(p.a, p.b);
    const color = wrongPairs.has(key)
      ? COL_MISTAKE
      : citedPairs.has(key)
        ? COL_HINT_CELL
        : COL_PENCIL;
    return drawPairConnector(dr, g, ts, p, signAt(signs, p), color);
  });
  return labels;
}

/**
 * The hint's rings, over the edges so what each holds reads on top of the
 * edge's own line: each edge the step sets, and the note it places, which is
 * drawn off its move where the words ring it. `texts` is every text the frame
 * shows, which no ring crosses.
 */
function drawHintRings(
  dr: GameDrawing,
  g: Grid,
  ts: number,
  hint: HintStep<LoopyMove> | null,
  placing: LoopyPair | null,
  signs: ReadonlyMap<string, Point>,
  texts: readonly Rect[],
  room: Rect,
): void {
  const marks = stepMarks(hint ?? undefined);
  const move = hint?.move;
  const ops = move?.kind === "set" ? move.ops : [];
  const lineTo = new Map(ops.map((o) => [o.edge, o.state === LINE_YES]));
  for (const i of marks.of("ring", EDGE)) {
    const [a, b] = edgeEnds(g, ts, i);
    drawEdgeRing(dr, a, b, lineTo.get(i) ?? false, ts, texts, room);
  }
  if (move?.kind === "corner" && marks.of("ring", CORNER).includes(move.dline))
    drawCornerRing(dr, g, ts, move.dline, move.bits, texts, room);
  if (placing) drawPairRing(dr, g, ts, placing, signAt(signs, placing), texts, room);
}

/** The pair note a step places, where its words ring it. */
function placedPair(hint: HintStep<LoopyMove> | null): LoopyPair | null {
  const move = hint?.move;
  if (move?.kind !== "pair" || move.relation === "none") return null;
  const pair = { a: move.a, b: move.b, opposite: move.relation === "opposite" };
  const ringed = stepMarks(hint ?? undefined).of("ring", PAIR);
  return ringed.some((p) => PAIR.key(p) === PAIR.key(pair)) ? pair : null;
}

/** A pair's sign, as `placeSigns` placed it. */
function signAt(signs: ReadonlyMap<string, Point>, pair: LoopyPair): Point {
  const at = signs.get(pairKey(pair.a, pair.b));
  if (!at) throw new Error(`No sign placed for pair ${pair.a}:${pair.b}`);
  return at;
}

export function redraw(
  dr: GameDrawing,
  ds: LoopyDrawState,
  _prev: LoopyState | null,
  s: LoopyState,
  _dir: number,
  ui: LoopyRenderUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<LoopyMove>,
  mistakes?: readonly LoopyMistake[],
): void {
  const g = s.grid;
  const ts = ds.tileSize;
  const mistaken = new Uint8Array(g.numEdges);
  for (const m of mistakes ?? []) if (m.kind === "edge") mistaken[m.edge] = 1;
  const marks = stepMarks(hint);

  // Clue coloring. `clueError` and `clueSatisfied` are what the C diffs to
  // decide whether a face needs repainting; here they are simply the key that
  // selects the digit's color, recomputed each frame.
  for (let i = 0; i < g.numFaces; i++) {
    const n = s.clues[i];
    if (n < 0) continue;
    const sides = g.faces[i].order;
    const yes = faceOrder(s, i, LINE_YES);
    // When the YES edges already form exactly one loop and nothing else,
    // UNKNOWN counts as NO for clue checking. Some people play Loopy without
    // ever right-clicking, so they never mark a line NO; without this they
    // could close a loop over an underfilled clue and be shown neither a
    // victory flash nor a reason why not. Lighting the underfilled clue at the
    // instant the loop closes is the earliest moment this style of play makes
    // the error detectable at all. (Overfilled clues are caught either way.)
    const no = s.exactlyOneLoop ? sides - yes : faceOrder(s, i, LINE_NO);
    ds.clueError[i] = yes > n || no > sides - n ? 1 : 0;
    ds.clueSatisfied[i] = yes === n && no === sides - n ? 1 : 0;
  }

  // The win flash runs the loop: an edge's position is its step around it.
  const around = flash.winning ? loopOrder(s) : null;

  // Bucket the edges by color once, rather than upstream's scan-per-phase.
  const buckets = new Map<number, number[]>(PHASES.map((c) => [c, []]));
  for (let i = 0; i < g.numEdges; i++) {
    const flashing =
      around !== null && around[i] >= 0 ? flash.win(around[i]) : WIN_NONE;
    buckets.get(lineColor(s, i, flashing, mistaken))?.push(i);
  }

  // The whole canvas, from the nominal extent — not the built grid's, which a
  // trimmed aperiodic patch undershoots (see `boardSize`).
  const board = boardSize(LOOPY_GRIDS[s.gridType].type, s.w, s.h, ts);
  const w = board.w;
  const h = board.h;

  // Every frame is a full repaint, so this erases the previous frame.
  dr.drawRect({ x: 0, y: 0, w, h }, COL_BACKGROUND);

  // The keyboard cursor, drawn from grid geometry like everything else, so it
  // works on a Penrose patch as on squares. Two marks: a halo under the chosen
  // edge, painted *before* the edges so the edge's own color stays legible on
  // top of it (the state is what the player is about to change, so it must be
  // readable), and a disc under the cursor's dot, painted before the dots for
  // the same reason. Both take the collection-wide cursor color.
  // The run of lines under the pointer, haloed the same way and in the same
  // color as the cursor's own edge, and for the same reason: both mean "where
  // your attention is", and they belong to different devices — a click hides
  // the keyboard cursor — so the board never has to explain two greens at once.
  // Extent tells them apart when it does: one edge against a whole run.
  if (ui.hoverEdge >= 0) {
    for (const i of lineRun(s, ui.hoverEdge)) {
      const [a, b] = edgeEnds(g, ts, i);
      dr.drawLine(a, b, COL_CURSOR, cursorHaloThickness(ts));
    }
  }

  const cursor = ui.cursor;
  if (cursor.visible && cursor.edge >= 0) {
    const [a, b] = edgeEnds(g, ts, cursor.edge);
    dr.drawLine(a, b, COL_CURSOR, cursorHaloThickness(ts));
  }
  // The edge Space pinned for a pair, under the edges the same way.
  if (ui.pencilMode && ui.pin >= 0) {
    const [a, b] = edgeEnds(g, ts, ui.pin);
    dr.drawLine(a, b, COL_PENCIL, cursorHaloThickness(ts));
  }

  // The hint's outlines go under the edges and the clue digits, which stay
  // legible on top of them: a band under each edge it cites, a ring under each
  // dot it names, and an outline inside each clue it counts.
  const thin = Math.max(2, Math.round(2 * lineThickness(ts)));
  for (const i of marks.of("outline", EDGE)) {
    const [a, b] = edgeEnds(g, ts, i);
    dr.drawLine(a, b, COL_HINT_CELL, thin);
  }
  for (const f of marks.of("outline", FACE)) drawFaceOutline(dr, g, ts, g.faces[f]);
  for (const d of marks.of("outline", DOT))
    drawDotRing(dr, dotAt(g, ts, g.dots[d]), ts);

  const placing = placedPair(hint ?? null);
  const signs = placeSigns(g, ts, s, placing);
  const labels = drawNotes(dr, g, ts, s, hint ?? null, mistakes ?? [], signs);

  // Notes mode's previews: the corner Enter would note, and the pair a drag is
  // drawing out from the edge it started on.
  if (ui.pencilMode && cursor.visible) {
    const dline = cursorCorner(g, cursor);
    if (dline !== null) drawCornerWedge(dr, g, ts, dline, 0, COL_CURSOR, true);
  }
  const drag = ui.noteDrag;
  if (drag?.dragged && drag.from >= 0) {
    const thickness = Math.max(2, Math.round(lineThickness(ts) * 0.6));
    dr.drawLine(edgeMidpoint(g, ts, drag.from), drag.at, COL_PENCIL, thickness);
  }

  // Every text the frame shows, which a ring keeps off.
  const texts: Rect[] = labels.map(({ at, text }) =>
    textBox(at, labelOptions(ts), text),
  );
  for (let i = 0; i < g.numFaces; i++) {
    const n = s.clues[i];
    if (n < 0) continue;
    const { origin, options } = clueText(g, ts, g.faces[i]);
    texts.push(textBox(origin, options, String(n)));
    dr.drawText(
      origin,
      options,
      ds.clueError[i]
        ? COL_MISTAKE
        : ds.clueSatisfied[i]
          ? COL_SATISFIED
          : COL_FOREGROUND,
      String(n),
    );
  }

  for (const color of PHASES) {
    // Faint lines are the NO marks, which some players prefer not to see.
    if (color === COL_FAINT && !ui.drawFaintLines) continue;
    // A lit edge is drawn wider than a set one: at a set line's width the
    // flash color is a hairline against the board, and does not read as lit.
    const thickness =
      color === COL_FAINT
        ? faintLineThickness(ts)
        : color === COL_HIGHLIGHT || color === COL_HIGHLIGHT_LEAD
          ? 2 * lineThickness(ts)
          : lineThickness(ts);
    for (const i of buckets.get(color) ?? []) {
      const [a, b] = edgeEnds(g, ts, i);
      dr.drawLine(a, b, color, thickness);
    }
  }

  // Drawn whether or not faint lines are shown: a wrong mark must never be hidden
  // by a preference.
  for (let i = 0; i < g.numEdges; i++) {
    if (!mistaken[i] || s.lines[i] !== LINE_NO) continue;
    const [a, b] = edgeEnds(g, ts, i);
    drawMistakenCross(dr, a, b, ts);
  }

  drawHintRings(dr, g, ts, hint ?? null, placing, signs, texts, { x: 0, y: 0, w, h });

  for (const { at, text, color } of labels) drawLabel(dr, at, ts, text, color);

  if (cursor.visible) {
    const d = g.dots[cursor.dot];
    dr.drawCircle(dotAt(g, ts, d), cursorDiscRadius(ts), COL_CURSOR, COL_CURSOR);
  }

  for (let i = 0; i < g.numDots; i++) {
    dr.drawCircle(
      dotAt(g, ts, g.dots[i]),
      dotRadius(ts),
      COL_FOREGROUND,
      COL_FOREGROUND,
    );
  }

  // The notes-mode pencil, in the collection's place for it. Drawn outright each
  // frame rather than through `repaintPencilIndicator`, whose cache skips a repaint
  // when the mode has not changed: this renderer has just painted over it with the
  // background.
  if (ui.pencilMode) {
    const box = pencilIndicatorBox({ w, h }, ts);
    drawPencilGlyph(dr, box.x, box.y, box.size, COL_PENCIL_BODY, COL_FOREGROUND);
  }

  dr.drawUpdate({ x: 0, y: 0, w, h });
}

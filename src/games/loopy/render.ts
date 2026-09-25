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
  HINT_ACTION,
  HINT_EVIDENCE,
  INK,
  lineMaybeColor,
  lineNoColor,
  PENCIL_BODY,
  pencilColor,
} from "../../engine/color/palette.ts";
import { glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import type { Grid, GridDot, GridFace, GridType } from "../../engine/grid/index.ts";
import { gridComputeSize, gridFindIncenter } from "../../engine/grid/index.ts";
import {
  drawPencilGlyph,
  pencilIndicatorBox,
  pencilIndicatorReach,
} from "../../engine/pencil-indicator.ts";
import type { Color, Point, Size } from "../../engine/types.ts";
import type { LoopyCursor } from "./cursor.ts";
import type { LoopyHint } from "./hint.ts";
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
export const FLASH_TIME = 0.5;

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
/** The edges a hint step sets, and the note it places. */
export const COL_HINT = 8;
/** What a hint step reasons from: clues, dots, lines and the notes it cites. */
export const COL_HINT_CELL = 9;
/** The player's corner and pair notes. */
export const COL_PENCIL = 10;
/** The notes-mode indicator's pencil body. */
export const COL_PENCIL_BODY = 11;

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
 * own authored dark values (docs/games/rendering.md § "Dark mode is the app's
 * concern").
 */
export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_FOREGROUND] = INK;
  out[COL_LINEUNKNOWN] = lineMaybeColor(defaultBackground);
  out[COL_HIGHLIGHT] = FLASH;
  out[COL_MISTAKE] = ERROR;
  // A deliberate, player-visible aid: upstream drew a satisfied clue in the
  // same black as an open one. Graying it retires the clue the way Magnets and
  // Towers do.
  out[COL_SATISFIED] = clueDoneColor(defaultBackground);
  out[COL_FAINT] = lineNoColor(defaultBackground);
  out[COL_CURSOR] = CURSOR;
  out[COL_HINT] = HINT_ACTION;
  out[COL_HINT_CELL] = HINT_EVIDENCE;
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
function toScreen(g: Grid, tileSize: number, gx: number, gy: number): [number, number] {
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
  COL_MISTAKE,
] as const;

/** The color edge `i` draws in: an error highlight overrides its line state, and
 * so does a line the mistake check says the loop does not run along. */
function lineColor(
  s: LoopyState,
  i: number,
  flashing: boolean,
  mistaken: Uint8Array,
): number {
  if (s.lineErrors[i]) return COL_MISTAKE;
  if (s.lines[i] === LINE_UNKNOWN) return COL_LINEUNKNOWN;
  if (s.lines[i] === LINE_NO) return COL_FAINT;
  if (mistaken[i]) return COL_MISTAKE;
  return flashing ? COL_HIGHLIGHT : COL_FOREGROUND;
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

/** The band under an edge the hint sets: solid for a line, broken for an edge the
 * loop cannot use, so the two read apart without their color. */
function drawTargetBand(
  dr: GameDrawing,
  a: Point,
  b: Point,
  line: boolean,
  ts: number,
): void {
  const thickness = Math.max(3, Math.round(2.5 * lineThickness(ts)));
  if (line) {
    dr.drawLine(a, b, COL_HINT, thickness);
    return;
  }
  for (let k = 0; k < 4; k++) {
    const t = 0.05 + k * 0.25;
    dr.drawLine(along(a, b, t), along(a, b, t + 0.15), COL_HINT, thickness);
  }
}

/** A clue's outline, drawn inside its face so it never sits on the face's edges. */
function drawFaceOutline(dr: GameDrawing, g: Grid, ts: number, f: GridFace): void {
  gridFindIncenter(f);
  const [cx, cy] = toScreen(g, ts, f.ix, f.iy);
  const shrink = 0.8;
  const corners = f.dots.flatMap((d) => {
    if (d === null) return [];
    const p = dotAt(g, ts, d);
    return [
      {
        x: Math.round(cx + (p.x - cx) * shrink),
        y: Math.round(cy + (p.y - cy) * shrink),
      },
    ];
  });
  const thickness = Math.max(2, Math.round(lineThickness(ts) * 0.7));
  for (let i = 0; i < corners.length; i++) {
    dr.drawLine(
      corners[i],
      corners[(i + 1) % corners.length],
      COL_HINT_CELL,
      thickness,
    );
  }
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
): void {
  const { dot, from, sweep } = cornerArc(g, dline);
  const p = dotAt(g, ts, dot);
  const length = Math.min(
    ...dot.edges.map((e) => {
      const q = dotAt(g, ts, e.dot1 === dot ? e.dot2 : e.dot1);
      return Math.hypot(q.x - p.x, q.y - p.y);
    }),
  );
  const inner = Math.min(dotRingRadius(ts) + 1, 0.25 * length);
  // Short of where a pair between the corner's own two edges crosses it (about a
  // third of an edge out on a square corner), so that pair's connector stays clear.
  const outer = Math.min(
    Math.max(inner + 8, 0.3 * Math.min(length, ts)),
    0.45 * length,
  );
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

/** A pair note's connector between the midpoints of its two edges, and where its
 * `=` or `≠` goes: beside the connector and a third of the way along it, since at
 * its middle the sign would sit on the clue of a face the pair crosses. */
function drawPairConnector(
  dr: GameDrawing,
  g: Grid,
  ts: number,
  pair: LoopyPair,
  color: number,
): { at: Point; text: string; color: number } {
  const a = edgeMidpoint(g, ts, pair.a);
  const b = edgeMidpoint(g, ts, pair.b);
  const thickness = Math.max(2, Math.round(lineThickness(ts) * 0.6));
  dr.drawLine(a, b, color, thickness);
  for (const end of [a, b]) dr.drawCircle(end, thickness + 1, color, color);
  const len = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
  const off = labelFont(ts) * 0.7;
  return {
    at: {
      x: Math.round(a.x + (b.x - a.x) * 0.35 - ((b.y - a.y) / len) * off),
      y: Math.round(a.y + (b.y - a.y) * 0.35 + ((b.x - a.x) / len) * off),
    },
    text: pair.opposite ? "≠" : "=",
    color,
  };
}

function drawLabel(
  dr: GameDrawing,
  at: Point,
  ts: number,
  text: string,
  color: number,
): void {
  dr.drawText(
    at,
    {
      align: "center",
      baseline: "mathematical",
      fontType: "variable",
      size: labelFont(ts),
    },
    color,
    text,
  );
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
 * step reasons from it; then the note the step places, in the action color. Returns
 * the pair signs, which are drawn last.
 */
function drawNotes(
  dr: GameDrawing,
  g: Grid,
  ts: number,
  s: LoopyState,
  hint: HintStep<LoopyMove, LoopyHint> | null,
  mistakes: readonly LoopyMistake[],
): { at: Point; text: string; color: number }[] {
  const wrongCorners = new Set<number>();
  const wrongPairs = new Set<string>();
  for (const m of mistakes) {
    if (m.kind === "corner") wrongCorners.add(m.dline);
    if (m.kind === "pair") wrongPairs.add(pairKey(m.a, m.b));
  }
  const hl = hint?.highlights;
  const citedCorners = new Set(hl?.corners ?? []);
  const citedPairs = new Set((hl?.pairs ?? []).map((p) => pairKey(p.a, p.b)));

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
    return drawPairConnector(dr, g, ts, p, color);
  });

  const move = hint?.move;
  if (move?.kind === "corner")
    drawCornerWedge(dr, g, ts, move.dline, move.bits, COL_HINT);
  if (move?.kind === "pair" && move.relation !== "none") {
    const pair = { a: move.a, b: move.b, opposite: move.relation === "opposite" };
    labels.push(drawPairConnector(dr, g, ts, pair, COL_HINT));
  }
  return labels;
}

export function redraw(
  dr: GameDrawing,
  ds: LoopyDrawState,
  _prev: LoopyState | null,
  s: LoopyState,
  _dir: number,
  ui: LoopyRenderUi,
  _animTime: number,
  flashTime: number,
  hint?: HintStep<LoopyMove, LoopyHint>,
  mistakes?: readonly LoopyMistake[],
): void {
  const g = s.grid;
  const ts = ds.tileSize;
  const mistaken = new Uint8Array(g.numEdges);
  for (const m of mistakes ?? []) if (m.kind === "edge") mistaken[m.edge] = 1;
  const hl = hint?.highlights;

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

  // The completion flash is three visible segments over FLASH_TIME.
  const flashing =
    flashTime > 0 && (flashTime <= FLASH_TIME / 3 || flashTime >= (FLASH_TIME * 2) / 3);

  // Bucket the edges by color once, rather than upstream's scan-per-phase.
  const buckets = new Map<number, number[]>(PHASES.map((c) => [c, []]));
  for (let i = 0; i < g.numEdges; i++) {
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

  // The hint's marks go under the edges and the clue digits, which stay legible on
  // top of them: a band under each edge it sets or cites, a ring under each dot it
  // names, and an outline inside each clue it counts.
  if (hl) {
    const thin = Math.max(2, Math.round(2 * lineThickness(ts)));
    for (const i of hl.edges) {
      const [a, b] = edgeEnds(g, ts, i);
      dr.drawLine(a, b, COL_HINT_CELL, thin);
    }
    const ops = hint?.move.kind === "set" ? hint.move.ops : [];
    const lineTo = new Map(ops.map((o) => [o.edge, o.state === LINE_YES]));
    for (const i of hl.targets) {
      const [a, b] = edgeEnds(g, ts, i);
      drawTargetBand(dr, a, b, lineTo.get(i) ?? false, ts);
    }
    for (const f of hl.faces) drawFaceOutline(dr, g, ts, g.faces[f]);
    for (const d of hl.dots) drawDotRing(dr, dotAt(g, ts, g.dots[d]), ts);
  }

  const labels = drawNotes(dr, g, ts, s, hint ?? null, mistakes ?? []);

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

  for (let i = 0; i < g.numFaces; i++) {
    const n = s.clues[i];
    if (n < 0) continue;
    const f = g.faces[i];
    gridFindIncenter(f);
    const [x, y] = toScreen(g, ts, f.ix, f.iy);
    dr.drawText(
      { x, y },
      glyphFont(Math.floor(ts / 2)),
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
    const thickness = color === COL_FAINT ? faintLineThickness(ts) : lineThickness(ts);
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

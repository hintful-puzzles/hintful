/**
 * The CapsLock-style "pencil mode is on" indicator glyph — a small diagonal #2
 * pencil (yellow body + sharpened graphite tip), pointing down-left. Shared by
 * every pencil-mark game so the indicator looks identical across the
 * collection.
 *
 * The glyph is drawn into a `size × size` box at `(ox, oy)`, scaled by the same
 * fractions wherever each game places it. `bodyColor` is the pencil body
 * palette index, `gridColor` the outline/graphite index.
 */

import type { GameDrawing } from "./game.ts";
import type { Size } from "./types.ts";

/**
 * A game's three palette indices for the indicator. An object rather than three
 * more positional arguments: they are constant per game, so naming them once at
 * module scope keeps the call site to the part that varies.
 */
export interface PencilIndicatorStyle {
  /** What the box is painted with when the glyph is absent — and behind it. */
  background: number;
  /** The pencil's body. */
  body: number;
  /** Its outline and graphite. */
  ink: number;
}

/** The glyph's bounds in CSS pixels; see {@link pencilIndicatorSize}. */
const GLYPH_MIN = 20;
const GLYPH_MAX = 48;

/** The gap between the glyph and each of the two canvas edges it sits against. */
const inset = (tileSize: number): number => Math.max(1, Math.round(tileSize / 16));

/**
 * How much room the indicator needs at the canvas's top-right corner: the glyph
 * plus the gap on either side of it. **This is the figure a game reserves** —
 * either by taking a margin of its own that is never narrower
 * (`Math.max(ts / 2, pencilIndicatorReach(ts))`), or by growing one
 * ({@link pencilIndicatorCanvas}). It is about half a tile on a coarse board and
 * more on a fine one, so a margin of exactly half a tile does not hold it.
 *
 * It is the reach rather than the glyph because those are different numbers, and
 * a game reserving the glyph's size would be short by the inset at both edges.
 */
export function pencilIndicatorReach(tileSize: number): number {
  return pencilIndicatorSize(tileSize) + 2 * inset(tileSize);
}

/**
 * The canvas for a board whose own corner is occupied: {@link pencilIndicatorReach}
 * added on **every** side, so the glyph gets its corner and the board keeps equal
 * margins rather than being pushed off-center by a margin grown on one side only.
 *
 * The game adds the same reach to its own origin on both axes, and subtracts it
 * in `fromCoord`. Both axes, because a margin on the horizontal alone would make
 * a game's pixel→cell mapping differ per axis, and the games needing this each
 * have **one** axis-agnostic `fromCoord`.
 */
export function pencilIndicatorCanvas(board: Size, tileSize: number): Size {
  const margin = pencilIndicatorReach(tileSize);
  return { w: board.w + 2 * margin, h: board.h + 2 * margin };
}

/**
 * How big the glyph is drawn, everywhere: the half-tile corner less the gap at
 * either side of it, clamped between two sizes in CSS pixels.
 *
 * **The floor is about the canvas, not the tile.** The midend fits the canvas
 * to the player's screen, so a board of many cells gets small tiles on a canvas
 * as large as anyone's, and half of one of those tiles is a speck: Map's glyph
 * was 9px on a 417px canvas. Twenty pixels keeps the glyph at least 3.5% of the
 * canvas's short side at phone and laptop sizes, which is the bound
 * `pencil-indicator-placement.test.ts` asserts. The ceiling stops a coarse board
 * on a large screen from growing a status cue past the size of a toolbar icon.
 *
 * Private on purpose: a game that reserved *this* rather than
 * {@link pencilIndicatorReach} would be short by an inset at each edge.
 */
function pencilIndicatorSize(tileSize: number): number {
  const halfTile = Math.round(tileSize / 2) - 2 * inset(tileSize);
  return Math.min(GLYPH_MAX, Math.max(GLYPH_MIN, halfTile));
}

/**
 * **Where the glyph goes, in every game: the canvas's top-right corner**, inset
 * by a hair so it does not touch the edge.
 *
 * The position was each game's own until this, and the collection had drifted
 * into three answers — top-right in five games, top-left in three, a strip below
 * the board in three — so the one cue that says "your typing goes into notes
 * now" moved when the player changed puzzle. It is computed from the canvas
 * rather than from a cell or a clue ring, so it means the same thing whatever a
 * game's margins are made of; **a game with nothing at its top-right reserves
 * the room** (a border wide enough, or a canvas grown to make one), exactly as
 * it would for any other fixed furniture.
 */
export function pencilIndicatorBox(canvas: Size, tileSize: number): PencilIndicatorBox {
  const size = pencilIndicatorSize(tileSize);
  const gap = inset(tileSize);
  return { x: canvas.w - size - gap, y: gap, size };
}

/**
 * What the indicator remembers between frames. A game's draw state satisfies
 * this by carrying the field; there is no base class.
 *
 * **`null` means "this draw state has never painted it"**, which is why there
 * is no `firstFrame` argument. A fresh draw state — a new game, or a resize —
 * has an empty canvas under the indicator, so it must paint even when the mode
 * has not changed; `null` is never equal to a boolean, so that falls out of the
 * same comparison. The nine games this replaced each passed their own flag for
 * it, under three different spellings, and the thing that actually knows
 * whether anything has been painted is the cache.
 */
export interface PencilIndicatorCache {
  pencilModeShown: boolean | null;
}

/** Where it goes. Square rather than a rect: {@link drawPencilGlyph} scales
 * into a square, and a helper taking `w` and `h` would invite one that is
 * not. */
export interface PencilIndicatorBox {
  x: number;
  y: number;
  size: number;
}

/**
 * Paint the pencil-mode indicator into a `size × size` box, but only when what
 * it shows has changed — including the case where it has never been shown (see
 * {@link PencilIndicatorCache}).
 *
 * The cache lives here rather than at each call site because it is the part
 * that was drifting: nine games had three spellings of the same guard, and
 * establishing that they agreed took two passes over the collection.
 *
 * The box is invalidated whether or not the glyph was drawn — the `drawUpdate`
 * is what erases the glyph when the mode goes off, so it is not conditional on
 * `on`.
 */
export function repaintPencilIndicator(
  dr: GameDrawing,
  cache: PencilIndicatorCache,
  on: boolean,
  where: PencilIndicatorBox,
  style: PencilIndicatorStyle,
): void {
  if (cache.pencilModeShown === on) return;
  cache.pencilModeShown = on;
  const { x, y, size } = where;
  const box = { x, y, w: size, h: size };
  dr.drawRect(box, style.background);
  if (on) drawPencilGlyph(dr, x, y, size, style.body, style.ink);
  dr.drawUpdate(box);
}

export function drawPencilGlyph(
  dr: GameDrawing,
  ox: number,
  oy: number,
  size: number,
  bodyColor: number,
  gridColor: number,
): void {
  const at = (fx: number, fy: number) => ({
    x: ox + Math.round(size * fx),
    y: oy + Math.round(size * fy),
  });
  // Body: a crisp parallelogram from the (flat) eraser end to the tip.
  dr.drawPolygon(
    [at(0.729, 0.129), at(0.871, 0.271), at(0.463, 0.679), at(0.321, 0.537)],
    bodyColor,
    gridColor,
  );
  // Sharpened graphite point.
  dr.drawPolygon(
    [at(0.321, 0.537), at(0.463, 0.679), at(0.2, 0.8)],
    gridColor,
    gridColor,
  );
}

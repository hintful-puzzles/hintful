/**
 * **A piece**: the thing a cell holds on a board whose content is pieces. It
 * sits inset on its cell (`cellSurface`, `palette.ts`), so the grid shows
 * between two neighbors of one kind, and the marks a game draws at a cell's
 * edge (a cursor, a hint's ring) land beside the piece and never on it.
 *
 * A piece's kind is its shape as well as its color. Hue alone fails a
 * color-blind player, and a shape is still there in a grayscale screenshot.
 */

import type { GameDrawing } from "../contract/game.ts";
import type { Point, Rect } from "../contract/types.ts";

export type PieceShape = "square" | "disc";

/** A member of the two-state pair: an index into `TWO` (`colors.ts`),
 * {@link TWO_SHAPES} and {@link PAIR_NAMES}. */
export type PairIndex = 0 | 1;

/** The shapes of the two-state pair, in the order of `TWO` (`colors.ts`). */
export const TWO_SHAPES: readonly [PieceShape, PieceShape] = ["square", "disc"];

/**
 * **The words for the pair's pieces**, in the order of {@link TWO_SHAPES}: a
 * piece is named by its shape, which no theme changes, and never by its color,
 * which a theme does (owner, 2026-11-16). The square piece is a "block"
 * because "square" is already the board's word for a place on it.
 */
export const PAIR_NAMES: readonly [string, string] = ["block", "disc"];

/**
 * **Shaded**, in a game where a cell is shaded or is not (Pattern, Range,
 * Singles): the pair's first member, alone, so the only piece on the board is
 * the shaded one and a finished picture still reads as one. The color is
 * `SHADED` (`palette.ts`); this is its shape. What a cell known not to be
 * shaded shows is {@link drawRuledOutCross}, or the clear square (the `clear`
 * painter, `pieces/stock.ts`), by how much of the board the state covers.
 */
export const SHADED_SHAPE: PieceShape = TWO_SHAPES[0];
/** The word for a shaded cell: the rules' word, which no theme changes, where
 * the color is the theme's (owner, 2026-11-16: "distinguish between rules of
 * the game and our choice of colors"). */
export const SHADED_NAME = "shaded";
/** The word for a cell known not to be shaded, which holds no piece. One word
 * for every such game, so "clear" means one thing across them. */
export const UNSHADED_NAME = "clear";

/**
 * The mark for a cell the player has ruled out: a thin cross in the middle of
 * `cell`, half the cell wide, in `color` (the `RULED_OUT` role). One mark in
 * every game that has the state, so a cross never has to be learned twice.
 * On a board colored half and half the cross sits on a surface of its own
 * (the `clear` painter, `pieces/stock.ts`).
 */
export function drawRuledOutCross(dr: GameDrawing, cell: Rect, color: number): void {
  const cx = cell.x + Math.floor(cell.w / 2);
  const cy = cell.y + Math.floor(cell.h / 2);
  const off = Math.floor(cell.w / 4);
  const thickness = Math.max(1, Math.floor(cell.w / 16));
  dr.drawLine(
    { x: cx - off, y: cy - off },
    { x: cx + off, y: cy + off },
    color,
    thickness,
  );
  dr.drawLine(
    { x: cx - off, y: cy + off },
    { x: cx + off, y: cy - off },
    color,
    thickness,
  );
}

/**
 * `source`, a help page, with each `{{pair:0}}` and `{{pair:1}}` replaced by
 * that member's name. A page names a piece this way and never types it, so
 * the page says the word a hint's sentence does.
 */
export function expandPair(source: string): string {
  return source.replace(/\{\{pair:([^}]*)\}\}/g, (whole, index: string) => {
    const name = index === "0" ? PAIR_NAMES[0] : index === "1" ? PAIR_NAMES[1] : null;
    if (name === null) throw new Error(`${whole}: the pair has members 0 and 1`);
    return name;
  });
}

/** How far a piece stands in from each side of its cell. */
const inset = (cell: Rect): number => Math.max(2, Math.round(cell.w / 9));

/** The points of a square of half-side `r` about `c`, its corners rounded. */
function roundedSquare(c: Point, r: number): Point[] {
  const corner = r * 0.32;
  const steps = 4;
  const out: Point[] = [];
  // One quarter turn per corner, starting at the bottom right and going round.
  const centers: readonly (readonly [number, number])[] = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ];
  centers.forEach(([sx, sy], quarter) => {
    const cx = c.x + sx * (r - corner);
    const cy = c.y + sy * (r - corner);
    for (let i = 0; i <= steps; i++) {
      const a = ((quarter + i / steps) * Math.PI) / 2;
      out.push({ x: cx + corner * Math.cos(a), y: cy + corner * Math.sin(a) });
    }
  });
  return out;
}

/** The sides of a cell a {@link drawPiecePart} joins, as bits. */
export const JOIN_UP = 1;
export const JOIN_RIGHT = 2;
export const JOIN_DOWN = 4;
export const JOIN_LEFT = 8;

/** The side of `a` that faces `b`, a square beside it on a board `w` wide. */
export function joinToward(w: number, a: number, b: number): number {
  if (b === a - w) return JOIN_UP;
  if (b === a + w) return JOIN_DOWN;
  if (b === a - 1) return JOIN_LEFT;
  if (b === a + 1) return JOIN_RIGHT;
  throw new Error(`squares ${a} and ${b} are not beside each other`);
}

export interface PiecePartStyle {
  /** How an unjoined end is rounded: as a square piece's corner, or as a
   * half circle across the piece (a capped end, a ship's bow). */
  ends: "square" | "round";
  /** The color of the line across a joined side, where the piece's halves
   * meet, as on a domino; `null` for none. */
  divider: number | null;
  /** How far a joined side reaches, where it is not `cell`'s own edge: a
   * board whose squares are separated by a line the piece should cover. */
  reach?: Rect;
}

/**
 * Draw one cell's part of a **piece that spans cells**, a domino or a ship: on
 * `cell` as {@link drawPiece} draws a square piece, but reaching the cell's
 * edge on each side in `joined` (`JOIN_*` bits), with a corner rounded only
 * where neither of its sides is joined. Each cell draws its own part, so a
 * tile cache repaints one cell without its neighbor, and the parts of two
 * cells joined to each other meet in one tile.
 */
export function drawPiecePart(
  dr: GameDrawing,
  cell: Rect,
  joined: number,
  color: number,
  style: PiecePartStyle,
): void {
  const pad = inset(cell);
  const reach = style.reach ?? cell;
  const x0 = joined & JOIN_LEFT ? reach.x : cell.x + pad;
  const y0 = joined & JOIN_UP ? reach.y : cell.y + pad;
  const x1 = joined & JOIN_RIGHT ? reach.x + reach.w : cell.x + cell.w - pad;
  const y1 = joined & JOIN_DOWN ? reach.y + reach.h : cell.y + cell.h - pad;
  const half = cell.w / 2 - pad;
  const corner = style.ends === "round" ? half : half * 0.32;
  const steps = Math.min(12, Math.max(4, Math.ceil(corner / 2)));
  // Bottom right, bottom left, top left, top right, as `roundedSquare`; a
  // corner is rounded where neither of the two sides that meet there joins.
  const corners: readonly (readonly [number, number, number])[] = [
    [x1, y1, JOIN_RIGHT | JOIN_DOWN],
    [x0, y1, JOIN_LEFT | JOIN_DOWN],
    [x0, y0, JOIN_LEFT | JOIN_UP],
    [x1, y0, JOIN_RIGHT | JOIN_UP],
  ];
  const points: Point[] = [];
  corners.forEach(([px, py, sides], quarter) => {
    if (joined & sides || corner < 0.5) {
      points.push({ x: px, y: py });
      return;
    }
    const cx = px === x1 ? px - corner : px + corner;
    const cy = py === y1 ? py - corner : py + corner;
    for (let i = 0; i <= steps; i++) {
      const a = ((quarter + i / steps) * Math.PI) / 2;
      points.push({ x: cx + corner * Math.cos(a), y: cy + corner * Math.sin(a) });
    }
  });
  dr.drawPolygon(points, color, color);

  if (style.divider === null) return;
  // Half the line on each side of the meeting, so the two cells' halves make
  // one line; it stops short of the piece's long sides, as a domino's does.
  const t = Math.max(1, Math.round(cell.w / 64));
  const across = Math.round(pad * 1.5);
  if (joined & JOIN_RIGHT)
    dr.drawRect(
      { x: x1 - t, y: y0 + across, w: t, h: y1 - y0 - 2 * across },
      style.divider,
    );
  if (joined & JOIN_LEFT)
    dr.drawRect(
      { x: x0, y: y0 + across, w: t, h: y1 - y0 - 2 * across },
      style.divider,
    );
  if (joined & JOIN_DOWN)
    dr.drawRect(
      { x: x0 + across, y: y1 - t, w: x1 - x0 - 2 * across, h: t },
      style.divider,
    );
  if (joined & JOIN_UP)
    dr.drawRect(
      { x: x0 + across, y: y0, w: x1 - x0 - 2 * across, h: t },
      style.divider,
    );
}

/**
 * Draw a piece of `shape` in `color` on `cell`, the box of the cell's surface.
 * `grown` is how much of its size it has, for a piece that is being placed (it
 * grows from the middle) or taken away.
 */
export function drawPiece(
  dr: GameDrawing,
  cell: Rect,
  shape: PieceShape,
  color: number,
  grown = 1,
): void {
  const r = (cell.w / 2 - inset(cell)) * grown;
  if (r < 0.5) return;
  const c = { x: cell.x + cell.w / 2, y: cell.y + cell.h / 2 };
  if (shape === "disc") dr.drawCircle(c, r, color, color);
  else dr.drawPolygon(roundedSquare(c, r), color, color);
}

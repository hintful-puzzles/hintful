/**
 * A hint's board marks — the **ring** around the cell a deduction acts on and
 * the **outline** around the region it reasons from.
 *
 * The outline is a band on the cell's border; the ring is round and the
 * engine's (`GameDrawing.drawRing`), inside the band's reach, clear of the
 * text a game says its cells show ({@link HintMarkStyle.text}).
 *
 * Both go beside the content rather than behind it, which is the
 * whole point: a fill behind content cannot be rescued by choosing a different
 * color. Measured, `HINT_FILL` scores 1.91:1 against a pencil mark in light and
 * 1.96:1 in dark, and a joint search over both hint roles, every hue and both
 * schemes returns no feasible arrangement — the pale end of the palette holds
 * exactly one cool wash and the evidence has it, and the hues that clear ~2.6:1
 * sit beside `ERROR_WASH`, which would make the cell a hint points at look like
 * the cell that is *wrong*. A mark drawn on the
 * border is read *against* a surface rather than *through* it, so the constraint
 * disappears instead of being traded and the mark can take a strong color.
 *
 * **Where the border lives differs by game, and {@link MarkBand} is how a game
 * says so.** Keen and Solo sit on a `COL_GRID` backing rectangle with a
 * `2·GRIDEXTRA + 1` gutter between cells, so their band lies *outside* the
 * content box and costs the content nothing — but not in pure gutter: inside a
 * cage or sub-block each cell widens its background into the gutter, under the
 * band. Towers, Group, Undead, Filling and Crossing draw their own per-cell
 * outline on abutting tiles, so their band is *inside* the box, over the pixels
 * that outline already occupies; Clusters, Group and Undead add one pixel of
 * true gutter outside it. Unequal splits the difference: it has a `TILESIZE/2`
 * gap, but the greater-than chevrons live in it, so only the quarter nearest
 * the cell is free.
 *
 * **Who undoes a mark follows from that.** A band inside the box is undone by
 * the cell's own repaint, which the hint `OverlaySidecar` already triggers when
 * the overlay changes, so a game with no `outer` part only paints. An `outer`
 * part lies in the gutter, which no one tile owns and some tiles paint into, so
 * a mark that moved is erased explicitly — before the tile loop, by
 * {@link HintMarks.eraseBeforeTiles}, so the tiles it touches repaint on top —
 * and a mark that stayed is restamped every frame, because a neighbor
 * repainting for its own reasons can paint over a side.
 */

import type { GameDrawing } from "./game.ts";
import { type RingClear, ringContentBox } from "./ring.ts";
import type { Rect } from "./types.ts";

const MARK_TOP = 1;
const MARK_LEFT = 2;
const MARK_BOTTOM = 4;
const MARK_RIGHT = 8;
export const MARK_ALL = MARK_TOP | MARK_LEFT | MARK_BOTTOM | MARK_RIGHT;

export interface MarkCell {
  readonly x: number;
  readonly y: number;
}

/**
 * Where one cell's mark band sits, in pixels.
 *
 * `outer + inner` is the band's thickness on every side. A band reads as a
 * highlight by **color**, not by weight, so it wants the width of the border it
 * replaces rather than the heaviest line that fits.
 */
export interface MarkBand {
  /** The cell's content box — what its tile painter fills. */
  readonly box: Rect;
  /** Pixels the band takes *outside* the box, in the shared gutter. */
  readonly outer: number;
  /** Pixels it takes *inside* the box, over the cell's own border. */
  readonly inner: number;
}

/** Paint `sides` of `band` in `color`. */
export function drawMarkSides(
  dr: GameDrawing,
  band: MarkBand,
  sides: number,
  color: number,
): void {
  if (!sides) return;
  const { box, outer, inner } = band;
  const t = outer + inner;
  const x = box.x - outer;
  const y = box.y - outer;
  const w = box.w + 2 * outer;
  const h = box.h + 2 * outer;
  if (sides & MARK_TOP) dr.drawRect({ x, y, w, h: t }, color);
  if (sides & MARK_LEFT) dr.drawRect({ x, y, w: t, h }, color);
  if (sides & MARK_BOTTOM) dr.drawRect({ x, y: y + h - t, w, h: t }, color);
  if (sides & MARK_RIGHT) dr.drawRect({ x: x + w - t, y, w: t, h }, color);
  dr.drawUpdate({ x, y, w, h });
}

/**
 * The one rule that draws both shapes an evidence area needs: **paint a side
 * wherever the neighbor across it is not also evidence.**
 *
 * A contiguous region (a cage, a row, a line of sight) comes out as a single
 * contour, concave corners and all; a scattered set (a forcing chain's cells)
 * comes out as one ring per cell, which is honest — they really are separate
 * cells, and joining them would draw a boundary around board the deduction never
 * touched.
 */
export function outlineSides(
  x: number,
  y: number,
  inRegion: (x: number, y: number) => boolean,
): number {
  return (
    (inRegion(x, y - 1) ? 0 : MARK_TOP) |
    (inRegion(x - 1, y) ? 0 : MARK_LEFT) |
    (inRegion(x, y + 1) ? 0 : MARK_BOTTOM) |
    (inRegion(x + 1, y) ? 0 : MARK_RIGHT)
  );
}

export interface HintMarkStyle {
  /** Where cell `(x, y)`'s band sits. */
  band(x: number, y: number): MarkBand;
  /**
   * The text cell `(x, y)` shows this frame, for a ring to keep clear of: what
   * a ring on the cell encloses (its value and its notes), and what it may
   * enclose or leave outside but never cross (a cage clue in its corner).
   * Called for the target's neighbors too, which may lie off the board; a
   * ring leaves all of a neighbor's text outside.
   */
  text(x: number, y: number): RingClear;
  /** The outline around the region it reasons from. */
  evidenceColor: number;
  /**
   * Whether two edge-adjacent targets are one **piece**, ringed as one shape. A
   * domino the hint places is one ring of six sides, not two boxes with a double
   * bar across its middle. Omitted, no two targets join: a ring per cell.
   */
  joinTargets?: (a: MarkCell, b: MarkCell) => boolean;
  /**
   * Whether two edge-adjacent evidence cells share one outline. Omitted, any two
   * do — one contour around a region. A game whose evidence is whole pieces
   * joins only within a piece, so two dominoes side by side stay two shapes
   * rather than one that is not on the board.
   */
  joinEvidence?: (a: MarkCell, b: MarkCell) => boolean;
  /**
   * What a ring round `piece` holds besides the cell's own content: the move's
   * shape (Salad's entry, as X, circle or letter), drawn in the ring's `ink`
   * and clipped to the ring (`GameDrawing.drawRing`'s `inside`). Omitted, or
   * `null` for a piece, the ring holds nothing more.
   */
  inside?: (piece: readonly MarkCell[]) => ((ink: number) => void) | null;
}

const key = (c: MarkCell): number => c.y * 8192 + c.x;

/** What a frame's marks look like on the canvas. The sides as well as the
 * cells: a join can move a side while every cell keeps its role. */
function signatureOf(
  targets: readonly MarkCell[],
  evidence: readonly MarkCell[],
  style: HintMarkStyle,
  outlines = new MarkOutlines(targets, evidence, style),
): string {
  const cell = (c: MarkCell): string => `${key(c)}:${outlines.packed(c.x, c.y)}`;
  return `${targets.map(cell).join()}|${evidence.map(cell).join()}`;
}

/** The sides of each cell in `cells` that face away from its role: a side is
 * drawn unless the neighbor across it is in `cells` and `join`s it. */
function roleSides(
  cells: readonly MarkCell[],
  join: ((a: MarkCell, b: MarkCell) => boolean) | null,
): Map<number, number> {
  const inRole = new Set(cells.map(key));
  const out = new Map<number, number>();
  for (const c of cells) {
    const joined = (x: number, y: number): boolean =>
      inRole.has(key({ x, y })) && (join === null || join(c, { x, y }));
    out.set(key(c), outlineSides(c.x, c.y, joined));
  }
  return out;
}

const never = (): boolean => false;

/**
 * Which sides of each cell a frame's marks paint, per role.
 *
 * {@link HintMarks.paint} draws from this. A game whose band is inside the box
 * also keys its tile cache on {@link MarkOutlines.packed} once it joins cells:
 * a cell can stay a target while its partner leaves, and the side between them
 * lives in the cell that did not change.
 */
export class MarkOutlines {
  private readonly target: Map<number, number>;
  private readonly evidence: Map<number, number>;

  constructor(
    targets: readonly MarkCell[],
    evidence: readonly MarkCell[],
    joins: Pick<HintMarkStyle, "joinTargets" | "joinEvidence">,
  ) {
    this.target = roleSides(targets, joins.joinTargets ?? never);
    this.evidence = roleSides(evidence, joins.joinEvidence ?? null);
  }

  targetSides(x: number, y: number): number {
    return this.target.get(key({ x, y })) ?? 0;
  }

  evidenceSides(x: number, y: number): number {
    return this.evidence.get(key({ x, y })) ?? 0;
  }

  /** Both roles' sides in one byte — the target's low nibble, the evidence's
   * high — for a tile's cache word. */
  packed(x: number, y: number): number {
    return this.targetSides(x, y) | (this.evidenceSides(x, y) << 4);
  }
}

/**
 * The targets as the pieces a ring goes round: each set of targets `join`
 * links, when it is one straight run, and every other target alone. A ring is
 * round, and round a bent piece it would enclose board the piece is not on.
 */
function ringPieces(
  targets: readonly MarkCell[],
  join: (a: MarkCell, b: MarkCell) => boolean,
): MarkCell[][] {
  const byKey = new Map(targets.map((c) => [key(c), c]));
  const seen = new Set<number>();
  const pieces: MarkCell[][] = [];
  for (const start of targets) {
    if (seen.has(key(start))) continue;
    const piece = [start];
    seen.add(key(start));
    for (let i = 0; i < piece.length; i++) {
      const c = piece[i];
      for (const [dx, dy] of STEPS) {
        const n = byKey.get(key({ x: c.x + dx, y: c.y + dy }));
        if (!n || seen.has(key(n)) || !join(c, n)) continue;
        seen.add(key(n));
        piece.push(n);
      }
    }
    const straight =
      piece.every((c) => c.x === start.x) || piece.every((c) => c.y === start.y);
    if (straight) pieces.push(piece);
    else for (const c of piece) pieces.push([c]);
  }
  return pieces;
}

const STEPS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

const bounds = (rects: readonly Rect[]): Rect => {
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  const x1 = Math.max(...rects.map((r) => r.x + r.w));
  const y1 = Math.max(...rects.map((r) => r.y + r.h));
  return { x, y, w: x1 - x, h: y1 - y };
};

/** How thick {@link HintMarks} draws a ring on a cell of `band`: the band's
 * own width, as the outline is, and never under two pixels. */
const ringThickness = (band: MarkBand): number => Math.max(2, band.outer + band.inner);

/** One ring round `piece`, within the band its cells' repaint and erase
 * answer for, enclosing the piece's values and notes, and clear of the rest
 * of the text round it. */
function drawPieceRing(
  dr: GameDrawing,
  piece: readonly MarkCell[],
  style: HintMarkStyle,
) {
  const inPiece = new Set(piece.map(key));
  const bands = piece.map((c) => style.band(c.x, c.y));
  const enclose: Rect[] = [];
  const avoid: Rect[] = [];
  for (const c of piece) {
    const own = style.text(c.x, c.y);
    enclose.push(...own.enclose);
    avoid.push(...own.avoid);
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const n = { x: c.x + dx, y: c.y + dy };
        if (inPiece.has(key(n))) continue;
        const theirs = style.text(n.x, n.y);
        avoid.push(...theirs.enclose, ...theirs.avoid);
      }
  }
  dr.drawRing(
    bounds(bands.map((b) => b.box)),
    { enclose, avoid },
    ringThickness(bands[0]),
    {
      room: bounds(bands.map(bandRoom)),
      inside: style.inside?.(piece) ?? undefined,
      centered: true,
    },
  );
}

/** The pixels a cell's repaint and erase answer for: its box and the band's
 * part outside it. */
const bandRoom = ({ box, outer }: MarkBand): Rect => ({
  x: box.x - outer,
  y: box.y - outer,
  w: box.w + 2 * outer,
  h: box.h + 2 * outer,
});

/**
 * The box a cell of `band` keeps its text inside, so that the ring
 * {@link HintMarks} draws on the cell goes round all of it, centered and in
 * the cell's room. A game whose notes or corner clue reach past it lays them
 * out inside it, on every cell and in every frame, so that a hint does not
 * move the text it rings (the owner's choice, `keep-rings-off-a-cells-numbers`
 * D2). `within` is the part of the cell a game keeps its notes to for its own
 * reasons (a cage's outline, a neighbor's tower).
 */
export function ringTextBox(
  band: MarkBand,
  { within = band.box }: { within?: Rect } = {},
): Rect {
  const r = ringContentBox(band.box, ringThickness(band), bandRoom(band));
  const x = Math.max(r.x, within.x);
  const y = Math.max(r.y, within.y);
  return {
    x,
    y,
    w: Math.max(0, Math.min(r.x + r.w, within.x + within.w) - x),
    h: Math.max(0, Math.min(r.y + r.h, within.y + within.h) - y),
  };
}

/**
 * A frame's hint marks, in two phases around the tile loop:
 * {@link HintMarks.eraseBeforeTiles} before it, for a band with an `outer`
 * part, and {@link HintMarks.paint} after it and outside every clip.
 *
 * Paint after, because a mark that straddles the gutter has to survive its
 * neighbors' repaints and, in a game whose tiles overlap (Towers' 3D towers
 * spill into the cell up-left), has to sit on top of them. Once per frame, not
 * once per tile: Towers repaints each tile up to four times inside a single clip.
 */
export class HintMarks {
  private signature = "";
  private painted: MarkCell[] = [];

  /** Forget what is on the canvas — for a game whose first frame repaints it. */
  reset(): void {
    this.signature = "";
    this.painted = [];
  }

  /**
   * Erase, **before** the tile loop, every mark this frame will not draw as it
   * stands: the whole band, all four sides of every cell, back to `gutterColor`,
   * the resting color of the pixels outside the content box. `overlaps` is
   * called for each erased cell and its eight neighbors (which may lie off the
   * board), and the game repaints those tiles in its loop, on top of the erase.
   *
   * Before the tiles, because no color painted after them is right everywhere:
   * the band's inside part is the cell's own border, and a neighbor can widen
   * its background under the outside part (Keen's cages, Solo's sub-blocks).
   * Erasing first and letting every tile the band touches repaint settles both.
   * All four sides, because a side still wanted is restamped by {@link paint},
   * and erasing any less leaves a shrinking region's interior edge behind. Only
   * when the marks changed: erase-then-restamp every frame would flicker.
   *
   * Every game whose band has an `outer` part calls this; a band wholly inside
   * the box needs no erase, because the hint `OverlaySidecar` repaints the cell.
   */
  eraseBeforeTiles(
    dr: GameDrawing,
    targets: readonly MarkCell[],
    evidence: readonly MarkCell[],
    style: HintMarkStyle,
    gutterColor: number,
    overlaps: (x: number, y: number) => void,
  ): void {
    if (signatureOf(targets, evidence, style) === this.signature) return;
    for (const c of this.painted) {
      drawMarkSides(dr, style.band(c.x, c.y), MARK_ALL, gutterColor);
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) overlaps(c.x + dx, c.y + dy);
    }
    this.reset();
  }

  paint(
    dr: GameDrawing,
    targets: readonly MarkCell[],
    evidence: readonly MarkCell[],
    style: HintMarkStyle,
  ): void {
    const outlines = new MarkOutlines(targets, evidence, style);
    const signature = signatureOf(targets, evidence, style, outlines);
    for (const c of evidence)
      drawMarkSides(
        dr,
        style.band(c.x, c.y),
        outlines.evidenceSides(c.x, c.y),
        style.evidenceColor,
      );
    // The rings last, so they lie over any outline they cross.
    for (const piece of ringPieces(targets, style.joinTargets ?? never))
      drawPieceRing(dr, piece, style);
    this.signature = signature;
    this.painted = [...evidence, ...targets];
  }
}

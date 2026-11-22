/**
 * The border-marking grid's *look*: the third layer of the mechanic
 * [`border-grid.ts`](./border-grid.ts) owns the model and the input of.
 *
 * WHAT LIVES HERE is what would have to change in both games at once, by the
 * same test `border-grid.ts` states:
 *
 * - **How an error shows**: an edge the rules' violations name is red
 *   (`borderErrorMarks`), as is an edge Check & Save finds wrong.
 * - **The half-grid cursor**, whose *movement* `border-grid.ts` owns
 *   (`moveBorderCursor`).
 * - **The four edge rects**, keyed off the border bits the module defines, and
 *   the tile skeleton around them — clip, body, content, edges, unclip, update.
 * - **The geometry.**
 * - **The hint's marks**: its forced edges, the region its sentence is about
 *   (hatched) and the squares it cites (outlined). A hint here always ends in
 *   the player's own edge notation, so how it shows is the notation's.
 *
 * WHAT DOES NOT live here is the clue layer and everything below it. Palisade
 * draws a digit and counts a cell's walls; Separate draws a letter, shades
 * regions and reddens a letter repeated inside one. Those are the puzzles. A game supplies its own palette indices and
 * a `drawContent` callback for the middle of the tile, and computes its own
 * validity — the shared code never asks which game it is drawing.
 */

import type { Dsf } from "../board/dsf.ts";
import { squareEdges } from "../board/square-edges.ts";
import {
  COL_CURSOR,
  COL_ERROR,
  COL_FLASH,
  COL_FLASH_LEAD,
  COL_HINT_OUTLINE,
} from "../color/roles.ts";
import type { GameDrawing } from "../contract/game.ts";
import type { StepMarks } from "../contract/hint-words.ts";
import type { RulesOf } from "../contract/rules.ts";
import type { Rect, Size } from "../contract/types.ts";
import type { GridCursor } from "../input/pointer.ts";
import { glyphFont } from "../render/draw.ts";
import { drawMarkSides } from "../render/hint-mark.ts";
import { liveErrors } from "../render/live-errors.ts";
import { OverlaySidecar } from "../render/overlay-sidecar.ts";
import { textBox } from "../render/ring.ts";
import { TileCache } from "../render/tile-cache.ts";
import { WIN_BODY, WIN_LEAD, type WinTone } from "../render/win-wave.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";
import {
  BORDER,
  DISABLED,
  edgeSide,
  FLIP,
  margin,
  SQUARE_DIRS,
  squareSide,
} from "./border-grid.ts";
import { EDGE } from "./border-grid-hint.ts";
import { drawEdgeHints, type EdgeHint, edgeHintWords } from "./edge-hint.ts";

// --- geometry ---------------------------------------------------------------

/** The wall's thickness: a wall is drawn as a rect, not a line, because it
 * carries three states and an error color. Upstream's expression; every pixel
 * of the board depends on it. */
export const tileWidth = (ts: number): number => Math.max(Math.floor((3 * ts) / 32), 1);

/** The center of a tile's *body*, which is offset by half a wall from the
 * center of its cell. */
export const center = (ts: number): number =>
  Math.floor(ts / 2) + Math.floor(tileWidth(ts) / 2);

/** Room for the outer walls, plus `margin` either side. */
export function borderGridSize(w: number, h: number, ts: number): Size {
  return {
    w: w * ts + tileWidth(ts) + 2 * margin(ts),
    h: h * ts + tileWidth(ts) + 2 * margin(ts),
  };
}

// --- the packed tile flags --------------------------------------------------
//
// One layout for both games, which is free to change because these live only in
// `ds.cache` — a draw-state diff key, rebuilt from scratch by `newDrawState`,
// never persisted and never in a desc or a save. Bits 0..7 are the border bits
// themselves (`BORDER` and its `DISABLED` companions).

/** This edge is wrong: it makes a region the wrong size, or separates nothing. */
export const BORDER_ERROR = (border: number): number => border << 8;
/** The game's own clue on this cell contradicts the board. */
export const F_CLUE_ERROR = 1 << 12;
/** The body of the win flash's highlight is on this cell. */
export const F_FLASH = 1 << 13;
/**
 * Which of the nine half-grid positions in this tile the cursor is on, if any.
 *
 * Nothing *draws* from these — the cursor is drawn once, over the tiles, by
 * {@link drawBorderCursor}. They are here so the tile's diff key changes when
 * the cursor moves across it, which is what makes the old cursor get erased
 * (`docs/rendering.md` § "The tile cache and the diff key").
 */
export const CONTAINS_CURSOR = (x: number): number => x << 14;
/** This cell is in a region the game considers finished and correct. */
export const F_CORRECT = 1 << 23;
/** The puzzle put this cell's content here, so it sits on the lifted surface
 * of a given. */
export const F_GIVEN = 1 << 30;
/** The leading edge of the win flash's highlight is on this cell. The word's
 * last bit: a game with a flag of its own keeps it beside the word. */
export const F_FLASH_LEAD = 1 << 31;

/** The flag for what `flash.win` said of a cell, and 0 for a cell not lit. */
export function flashFlag(tone: WinTone): number {
  return tone === WIN_LEAD ? F_FLASH_LEAD : tone === WIN_BODY ? F_FLASH : 0;
}

/** Colors the shared parts draw with, by each game's own palette index. The
 * win flash, an error, the hint's marks and the cursor are the palette's
 * shared roles (`color/roles.ts`). */
export interface BorderGridColors {
  /** The surface of a cell. */
  background: number;
  /** The lifted surface under a cell flagged {@link F_GIVEN}; omit in a game
   * that flags none. */
  given?: number;
  correct: number;
  /** A wall, and the grid's ink generally. */
  grid: number;
  /** A border known *not* to be a wall. */
  lineNo: number;
  /** A border not yet decided. */
  lineMaybe: number;
}

// --- draw state --------------------------------------------------------------

export interface BorderGridDrawState {
  tileSize: number;
  w: number;
  h: number;
  /** Per cell, its packed tile flags and its `edge-hint.ts` word. */
  tiles: TileCache;
  /** The hint's outlined squares and hatched region, in the tiles' key. */
  hint: OverlaySidecar;
}

export function newBorderGridDrawState(
  w: number,
  h: number,
  tileSize: number,
): BorderGridDrawState {
  // Its rings are on edges (`packHintMarks`).
  const hint = new OverlaySidecar(w * h, { cellRing: false });
  return {
    tileSize,
    w,
    h,
    tiles: new TileCache(w * h, { words: 2, overlays: [hint] }),
    hint,
  };
}

// --- the flags a frame computes ----------------------------------------------

/**
 * The rules' live errors (`docs/rendering.md` § "Live errors are the
 * rules'") as the border grid draws them: each square's red sides, every
 * edge a violation names red on both its squares, and the squares whose
 * clue is red, a clue of kind `kind` being at the square `at` lists for it.
 * `sp` is the description's space, whose edges the violations index.
 */
export function borderErrorMarks<S>(
  rules: RulesOf<S>,
  s: S,
  sp: GridSpace,
  kind: string,
  at: ArrayLike<number>,
): { sides: Int32Array; clues: ReadonlySet<number> } {
  const live = liveErrors(rules, s);
  const sides = new Int32Array(sp.cells.length);
  const mark = (e: number) => {
    const p = sp.edgeEnds[2 * e];
    const { dir, to } = edgeSide(sp, e, p);
    sides[p] |= BORDER_ERROR(BORDER(dir));
    sides[to] |= BORDER_ERROR(BORDER(FLIP(dir)));
  };
  for (let e = 0; e < live.at.length; e++) if (live.at[e]) mark(e);
  for (const [a, b] of live.pairs) {
    mark(a);
    mark(b);
  }
  return {
    sides,
    clues: new Set([...(live.clues.get(kind) ?? [])].map((q) => at[q])),
  };
}

/**
 * The Check & Save overlay, as per-cell edge-error bits.
 *
 * A mistake is an edge that contradicts the unique solution, and it reddens
 * through the *same* channel as the live errors above — one red edge means
 * one thing to a player, whichever of the two found it.
 */
export function mistakeEdgeBits(
  w: number,
  h: number,
  mistakes?: readonly { x: number; y: number; dir: number }[],
): Int32Array {
  const mask = new Int32Array(w * h);
  for (const m of mistakes ?? []) mask[m.y * w + m.x] |= BORDER_ERROR(BORDER(m.dir));
  return mask;
}

/**
 * Pack the displayed hint step's marks for this frame: the outlined squares
 * and the striped region onto `ds.hint`, and, returned, each cell's
 * `edge-hint.ts` word for the edges it rings, drawn as what they must become.
 */
export function packHintMarks(ds: BorderGridDrawState, marks: StepMarks): Int32Array {
  const { w, h } = ds;
  ds.hint.pack(marks, (x, y) => y * w + x);
  return edgeHintWords(
    squareEdges(w, h),
    marks.of("ring", EDGE).map(
      (e): EdgeHint => ({
        edge: squareSide(w, e),
        shape: e.kind === "wall" ? "line" : "cross",
        role: "ring",
      }),
    ),
  );
}

/** The cursor-containment bits for this tile — see {@link CONTAINS_CURSOR}. */
export function cursorBits(cursor: GridCursor, c: number, r: number): number {
  const u = cursor.x - 2 * c;
  const v = cursor.y - 2 * r;
  if (!cursor.visible || u < 0 || u > 2 || v < 0 || v > 2) return 0;
  return CONTAINS_CURSOR(1 << (3 * u + v));
}

/**
 * A wall interior to a wall-bounded region separates nothing, so that region is
 * not finished however right its size or contents are. Both games invalidate on
 * it, and neither could want to differ: it is the same "dangling" the error
 * bits above already redden.
 */
export function invalidateDanglingRegions(
  w: number,
  h: number,
  borders: Uint8Array,
  black: Dsf,
  validRoot: Map<number, boolean>,
): void {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (x + 1 < w && borders[i] & BORDER(1) && black.equivalent(i, i + 1))
        validRoot.set(black.canonify(i), false);
      if (y + 1 < h && borders[i] & BORDER(2) && black.equivalent(i, i + w))
        validRoot.set(black.canonify(i), false);
    }
  }
}

// --- drawing ------------------------------------------------------------------

function edgeColor(flags: number, dir: number, colors: BorderGridColors): number {
  const b = BORDER(dir);
  if (flags & BORDER_ERROR(b)) return COL_ERROR;
  if (flags & b) return colors.grid; // a wall
  if (flags & DISABLED(b)) return colors.lineNo;
  return colors.lineMaybe;
}

/** The grid's dots, drawn once on the first frame over the ground the midend
 * lays in color 0. */
export function drawBorderGridBackground(
  dr: GameDrawing,
  ts: number,
  w: number,
  h: number,
  colors: BorderGridColors,
): void {
  const tw = tileWidth(ts);
  for (let r = 0; r <= h; r++) {
    for (let c = 0; c <= w; c++) {
      dr.drawRect(
        { x: margin(ts) + ts * c, y: margin(ts) + ts * r, w: tw, h: tw },
        colors.grid,
      );
    }
  }
}

/**
 * One tile: clip, body, the game's own content, the four border edges, unclip,
 * update.
 *
 * `drawContent` draws the middle — a digit, a letter, a hint outline. It gets
 * the **body** rect (inside the walls, which is what an inset outline wants) and
 * the tile **origin** (which is what a centered glyph wants, since `center`
 * already accounts for the wall). Both, because each game needs a different one
 * and re-deriving either at the call site puts the geometry back in two places.
 *
 * It is a callback rather than three exported steps because the *order* is the
 * point: content goes under the edges, and the clip/unclip/update bookkeeping
 * around all of it is exactly the sort of thing that drifts when two games each
 * spell it.
 */
export function drawBorderTile(
  dr: GameDrawing,
  ds: BorderGridDrawState,
  r: number,
  c: number,
  flags: number,
  colors: BorderGridColors,
  drawContent?: (body: Rect, origin: { x: number; y: number }) => void,
  edgeHint = 0,
): void {
  const ts = ds.tileSize;
  const i = r * ds.w + c;
  const w = tileWidth(ts);
  const x = margin(ts) + ts * c;
  const y = margin(ts) + ts * r;

  dr.clip({ x, y, w: ts + w, h: ts + w });

  const body = { x: x + w, y: y + w, w: ts - w, h: ts - w };
  dr.drawRect(
    body,
    flags & F_FLASH_LEAD
      ? COL_FLASH_LEAD
      : flags & F_FLASH
        ? COL_FLASH
        : flags & F_CORRECT
          ? colors.correct
          : colors.given !== undefined && flags & F_GIVEN
            ? colors.given
            : colors.background,
  );

  // The hint's evidence sits under the game's content: a region is hatched, a
  // cited square outlined rather than washed, because a wash would cover the
  // glyph the deduction reads and the `F_CORRECT` shade that shows a region is
  // finished. The outline is inset in the body because the square's border is
  // where the hint's own forced edges are drawn.
  ds.hint.drawHatch(dr, i, body, ts);
  drawMarkSides(
    dr,
    { box: body, outer: 0, inner: Math.max(2, ts >> 4) },
    ds.hint.outlineSides(i),
    COL_HINT_OUTLINE,
  );

  drawContent?.(body, { x, y });

  // Four border edges, by this file's direction (U, R, D, L).
  const edges: readonly Rect[] = [
    { x: x + w, y, w: ts - w, h: w },
    { x: x + ts, y: y + w, w, h: ts - w },
    { x: x + w, y: y + ts, w: ts - w, h: w },
    { x, y: y + w, w, h: ts - w },
  ];
  for (let dir = 0; dir < 4; dir++)
    dr.drawRect(edges[dir], edgeColor(flags, dir, colors));

  // The edges the displayed hint decides, each ringed by a pill along it with
  // what it must become inside: a wall is the edge in the ring's ink, and not
  // a wall is a cross on the edge. The app repaints a hint's ink over the
  // board, so an edge drawn in it would read as a wall whatever was drawn
  // over it. A pill keeps off the glyph in the middle of each square beside
  // the edge, the one a game's `drawContent` draws there.
  const each = (sides: number, draw: (rect: Rect) => void): void => {
    edges.forEach((rect, dir) => {
      if (sides & (1 << SQUARE_DIRS[dir])) draw(rect);
    });
  };
  const arm = Math.max(3, Math.floor(ts / 8));
  const weight = Math.max(2, ts >> 4);
  const glyph = (cx: number, cy: number): Rect =>
    textBox({ x: cx, y: cy }, glyphFont(Math.floor(ts / 2)), "0");
  drawEdgeHints(dr, edgeHint, COL_HINT_OUTLINE, {
    line: (sides, ink) => each(sides, (rect) => dr.drawRect(rect, ink)),
    cross: (sides, ink) =>
      each(sides, (rect) => {
        const mx = rect.x + Math.floor(rect.w / 2);
        const my = rect.y + Math.floor(rect.h / 2);
        dr.drawLine(
          { x: mx - arm, y: my - arm },
          { x: mx + arm, y: my + arm },
          ink,
          weight,
        );
        dr.drawLine(
          { x: mx - arm, y: my + arm },
          { x: mx + arm, y: my - arm },
          ink,
          weight,
        );
      }),
    ring: (d) => {
      const rect = edges[SQUARE_DIRS.indexOf(d)];
      const mx = rect.x + rect.w / 2;
      const my = rect.y + rect.h / 2;
      const along = Math.floor(ts * 0.75);
      const across = Math.floor(ts * 0.3);
      const flat = rect.w > rect.h;
      const w2 = (flat ? along : across) / 2;
      const h2 = (flat ? across : along) / 2;
      // The two squares the edge parts, by their middles.
      const cx = x + w + (ts - w) / 2;
      const cy = y + w + (ts - w) / 2;
      const other = { x: 2 * mx - cx, y: 2 * my - cy };
      return {
        box: { x: mx - w2, y: my - h2, w: 2 * w2, h: 2 * h2 },
        clear: { enclose: [], avoid: [glyph(cx, cy), glyph(other.x, other.y)] },
        thickness: weight,
        room: { x: mx - ts, y: my - ts, w: 2 * ts, h: 2 * ts },
      };
    },
  });

  dr.unclip();
  dr.drawUpdate({ x, y, w: ts + w, h: ts + w });
}

/**
 * The half-grid cursor, drawn over the tiles.
 *
 * `cur_type = (offX << 1) + offY`: 0 a corner, 1 a left border, 2 a top border,
 * 3 a cell center — which is why the box is a third of a tile across the axes
 * the cursor sits *between* cells on, and two thirds along the others.
 */
export function drawBorderCursor(
  dr: GameDrawing,
  ts: number,
  curX: number,
  curY: number,
): void {
  const color = COL_CURSOR;
  const offX = curX % 2;
  const offY = curY % 2;
  const x = margin(ts) + ts * Math.floor(curX / 2);
  const y = margin(ts) + ts * Math.floor(curY / 2);
  const w = tileWidth(ts);

  const centerX = x + (offX === 0 ? Math.floor(w / 2) : center(ts));
  const centerY = y + (offY === 0 ? Math.floor(w / 2) : center(ts));

  const third = Math.floor(ts / 3);
  const twoThird = Math.floor((2 * ts) / 3);
  const cw = offX === 0 ? third : twoThird;
  const ch = offY === 0 ? third : twoThird;

  const ox = centerX - Math.floor(cw / 2);
  const oy = centerY - Math.floor(ch / 2);
  // Outline (upstream `draw_rect_outline`): four 1-px edges.
  dr.drawLine({ x: ox, y: oy }, { x: ox + cw, y: oy }, color, 1);
  dr.drawLine({ x: ox + cw, y: oy }, { x: ox + cw, y: oy + ch }, color, 1);
  dr.drawLine({ x: ox + cw, y: oy + ch }, { x: ox, y: oy + ch }, color, 1);
  dr.drawLine({ x: ox, y: oy + ch }, { x: ox, y: oy }, color, 1);
  dr.drawUpdate({ x: ox, y: oy, w: cw + 1, h: ch + 1 });
}

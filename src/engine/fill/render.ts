/**
 * How a fill game on a square grid is drawn, by layers, from its description:
 * no game writes a renderer (`openspec/changes/a-game-from-its-description-alone`,
 * design.md § 6). Each tile is, bottom to top:
 *
 * 1. the grid line and the surface: the value's painter's, the win flash's,
 *    or an undecided cell's;
 * 2. the value's painter (`play`'s `paint:`);
 * 3. the cell mark's half of a link, toward the clue's cell;
 * 4. the live errors: two cells that break a rule together get a diamond on
 *    the side or corner they share, and a cell any other rule breaks at turns
 *    its piece red;
 * 5. the outline of a mistake Check & Save found;
 * 6. the cursor.
 *
 * After the tiles come the hint's rings and outlines, the ring round a link
 * the hint asks for, and the margins: each line's clue past its end, red
 * where its line breaks it and in the hint's color where a step counts with
 * it, and each line's fixed label (`labels:`) before its start.
 */

import {
  cellSurface,
  ERROR_TEXT,
  GRID_DARK,
  givenSurface,
  INK,
  surfaceGrid,
} from "../color/palette.ts";
import {
  COL_BACKGROUND,
  COL_CURSOR,
  COL_ERROR,
  COL_HINT_OUTLINE,
  FIRST_GAME_SLOT,
  rolePalette,
} from "../color/roles.ts";
import type { Frame, GameDrawing } from "../contract/game.ts";
import { CELL, stepMarks } from "../contract/hint-words.ts";
import type { Color, Rect, Size } from "../contract/types.ts";
import { drawRectCorners, drawThickRectOutline } from "../render/draw.ts";
import { hatchPeriod } from "../render/hatch.ts";
import {
  type HintMarkStyle,
  HintMarks,
  type MarkBand,
  type MarkCell,
  MarkOutlines,
} from "../render/hint-mark.ts";
import { liveErrors } from "../render/live-errors.ts";
import { PAINTERS, type Painter, type PainterName } from "../render/pieces/index.ts";
import { NOTHING_TO_CLEAR } from "../render/ring.ts";
import { TileCache } from "../render/tile-cache.ts";
import { sweepStep, type WinTone, winSlot } from "../render/win-wave.ts";
import { type ClueList, clueAt } from "../solve/describe-runtime.ts";
import { type FillMistake, rulesOf } from "./answer.ts";
import type { FillBoard, FillModule } from "./board.ts";
import type { Edit } from "./edit.ts";
import { type FillLink, LINK } from "./marks.ts";
import type { FillPlay, FillUi } from "./play.ts";

/** A board's clues, by kind. */
type Clues<C> = { readonly [K in keyof C]: ClueList };

/** What a fill game is drawn from, beside its board: the compiled module's
 * `play`, `lineClues` and `labels`. */
export interface FillLook<C> {
  readonly play: FillPlay;
  /** The clue kinds at lines, drawn past each line's end. */
  readonly lineClues: readonly (keyof C)[];
  /** The fixed text before each line's start, by the line's index along its
   * axis. */
  readonly labels?: { readonly start?: (i: number) => string };
}

export type FillFrame<C> = Frame<FillBoard<C>, FillUi, Edit, unknown, FillMistake>;

export interface FillDrawState {
  readonly tileSize: number;
  /** Per cell, what it shows and the hint's marks on it. */
  readonly tiles: TileCache;
  /** Per line, its clue's error, hint and hatch. */
  readonly clues: TileCache;
  readonly marks: HintMarks;
}

export interface FillRender<C> {
  readonly preferredTileSize: number;
  /** How far in from the canvas's top and left the board's first cell lies. */
  origin(tileSize: number): number;
  computeSize(size: { w: number; h: number }, tileSize: number): Size;
  colors(background: Color): Color[];
  newDrawState(board: FillBoard<C>, tileSize: number): FillDrawState;
  redraw(dr: GameDrawing, ds: FillDrawState, frame: FillFrame<C>): void;
}

const PREFERRED_TILE_SIZE = 32;

/** How long a piece placed or taken away grows or shrinks, in seconds; the
 * midend stretches it to a hint step's. */
export const PLACE_ANIM_TIME = 0.13;

/** How a broken rule's cells lie on a `w` by `h` grid: a run, three or more
 * in a row along part of one line, in order; or two or more whole parallel
 * lines; or `null`, anything else. */
function lineShape(
  at: readonly number[],
  w: number,
  h: number,
):
  | { kind: "run"; rows: boolean; cells: number[] }
  | { kind: "lines"; rows: boolean }
  | null {
  const cells = [...new Set(at)].sort((a, b) => a - b);
  const rows = new Set(cells.map((c) => Math.floor(c / w)));
  const columns = new Set(cells.map((c) => c % w));
  if (rows.size >= 2 && cells.length === rows.size * w)
    return { kind: "lines", rows: true };
  if (columns.size >= 2 && cells.length === columns.size * h)
    return { kind: "lines", rows: false };
  if (cells.length < 3) return null;
  const step = rows.size === 1 ? 1 : columns.size === 1 ? w : 0;
  const along = step === 1 ? w : h;
  if (step === 0 || cells.length >= along) return null;
  return cells.every((c, i) => i === 0 || c - cells[i - 1] === step)
    ? { kind: "run", rows: step === 1, cells }
    : null;
}

// The board's own slots; each painter's follow.
const COL_GRID = FIRST_GAME_SLOT;
/** The surface of a cell not yet decided. */
const COL_CELL = FIRST_GAME_SLOT + 1;
/** The clues, and a link: the player's own notation is drawn in the clues'
 * ink. */
const COL_INK = FIRST_GAME_SLOT + 2;
const COL_ERRTEXT = FIRST_GAME_SLOT + 3;
/** A line's fixed label, quieter than its clue. */
const COL_LABEL = FIRST_GAME_SLOT + 4;
const FIRST_PAINTER_SLOT = FIRST_GAME_SLOT + 5;

// --- the tile's word: the value in the low byte, the layers above ----------
/** The cell was dealt its value: an undecided cell's surface is lifted under
 * it. */
const FIXED = 1 << 8;
/** A rule breaks at the cell: its piece is drawn in error. */
const ERR_AT = 1 << 9;
/** Two cells break a rule together across a side or a corner: one bit each,
 * clockwise from the top left corner. */
const DIAMOND_SHIFT = 10;
const MISTAKE = 1 << 18;
const CURSOR = 1 << 19;
/** `L` has armed a link from the cursor's cell. */
const ARMED = 1 << 20;
const TONE_SHIFT = 21;
/** The links from this cell, a bit a direction (up, right, down, left). */
const LINK_SHIFT = 23;
/** The links from this cell found to be mistakes. */
const BAD_LINK_SHIFT = 27;

// --- the hint's word -------------------------------------------------------
// The ring and outline sides (`MarkOutlines.packed`) in the low byte.
/** The cell lies on the line a step stripes. */
const HINT_LINE = 1 << 8;
/** The link a step asks for from this cell, a bit a direction: the ring round
 * it lies over the tile, which repaints when it moves. */
const HINT_LINK_SHIFT = 9;

// --- the line word: a rule broken along a line -----------------------------
/** A run the rules forbid passes through the cell: a bar along it, which
 * reaches half a tile toward each of its ends, a bit a direction (up, right,
 * down, left). */
const RUN_SHIFT = 0;
/** The cell's row, or its column, is one of two or more the rules forbid
 * together: a bar across the whole line. */
const ACROSS_ROW = 1 << 4;
const ACROSS_COLUMN = 1 << 5;

/** The step to each of a cell's four sides, up, right, down, left. */
const DIRS: readonly (readonly [number, number])[] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

/** The direction from cell `a` to its orthogonal neighbor `b`, or `-1`. */
function dirTo(w: number, a: number, b: number): number {
  const dx = (b % w) - (a % w);
  const dy = Math.floor(b / w) - Math.floor(a / w);
  return DIRS.findIndex(([x, y]) => x === dx && y === dy);
}

/** The diamond's points round a cell, clockwise from its top left corner, as
 * fractions of the tile. */
const DIAMOND_AT: readonly (readonly [number, number])[] = [
  [0, 0],
  [0.5, 0],
  [1, 0],
  [1, 0.5],
  [1, 1],
  [0.5, 1],
  [0, 1],
  [0, 0.5],
];

/** The diamond bit for the point of a cell at `(fx, fy)`, in halves. */
const diamondBit = (hx: number, hy: number): number =>
  1 << (DIAMOND_SHIFT + DIAMOND_AT.findIndex(([x, y]) => x * 2 === hx && y * 2 === hy));

export function fillRender<C extends Clues<C>>(
  module: FillModule<C>,
  look: FillLook<C>,
  previewed: (board: FillBoard<C>, ui: FillUi) => FillBoard<C>,
): FillRender<C> {
  const { play, lineClues, labels } = look;
  const labelStart = labels?.start;
  const rules = rulesOf(module);

  // Each value's painter, and the slot of each of its colors: one slot a
  // named color, however many painters draw in it.
  type Placed = { painter: Painter; slot: readonly number[] };
  const painted = new Map<PainterName, Placed>();
  const byValue = new Map<number, Placed>();
  const slotOf = new Map<Color, number>();
  let next = FIRST_PAINTER_SLOT;
  for (const [v, { paint }] of [
    ...Object.entries(play.values),
    ...Object.entries(play.given ?? {}),
  ]) {
    if (!(paint in PAINTERS)) throw new Error(`play: no painter ${paint}`);
    const name = paint as PainterName;
    let got = painted.get(name);
    if (got === undefined) {
      const painter: Painter = PAINTERS[name];
      const slot = painter.colors([0, 0, 0]).map((c) => {
        const known = slotOf.get(c);
        if (known !== undefined) return known;
        slotOf.set(c, next);
        return next++;
      });
      got = { painter, slot };
      painted.set(name, got);
    }
    byValue.set(Number(v), got);
  }
  /** The lifted surface under a value the cell was dealt, after the painters'
   * slots so a board without one numbers them as before. */
  const COL_GIVEN = next;

  const start = (ts: number): number => (labelStart === undefined ? 1 : ts);
  const end = (ts: number): number => (lineClues.length > 0 ? ts + 2 : 1);
  const coord = (n: number, ts: number): number => n * ts + start(ts);

  function colors(bg: Color): Color[] {
    const out = rolePalette(bg);
    out[COL_GRID] = surfaceGrid(bg);
    out[COL_CELL] = cellSurface(bg);
    out[COL_INK] = INK;
    out[COL_ERRTEXT] = ERROR_TEXT;
    out[COL_LABEL] = GRID_DARK;
    out[COL_GIVEN] = givenSurface(bg);
    for (const { painter, slot } of painted.values())
      painter.colors(bg).forEach((c, i) => {
        out[slot[i]] = c;
      });
    return out;
  }

  /** The clue of line `k`, the first of the line clue kinds it has, or
   * `-1`. */
  const lineClue = (b: FillBoard<C>, k: number): number => {
    for (const kind of lineClues) {
      const v = clueAt(b.dealt[kind], k);
      if (v >= 0) return v;
    }
    return -1;
  };

  /** The cell a link from `c` names: the clue's own. */
  const linkClues = play.links === undefined ? null : (play.links.clue as keyof C);
  const linkTo = (b: FillBoard<C>, c: number): number =>
    linkClues === null || b.mark[c] < 0 ? -1 : b.dealt[linkClues].at[b.mark[c]];

  function drawDiamond(dr: GameDrawing, ts: number, x: number, y: number): void {
    const d = Math.floor((ts * 2) / 5);
    dr.drawPolygon(
      [
        { x: x - d, y },
        { x, y: y - d },
        { x: x + d, y },
        { x, y: y + d },
      ],
      COL_ERROR,
      COL_INK,
    );
    // An exclamation mark, drawn by hand: upstream's draw_text sat off center.
    const xext = Math.floor(ts / 16);
    const yext = Math.floor((ts * 2) / 5) - (xext * 2 + 2);
    dr.drawRect(
      { x: x - xext, y: y - yext, w: xext * 2 + 1, h: yext * 2 + 1 - xext * 3 },
      COL_ERRTEXT,
    );
    dr.drawRect(
      { x: x - xext, y: y + yext - xext * 2 + 1, w: xext * 2 + 1, h: xext * 2 },
      COL_ERRTEXT,
    );
  }

  /**
   * A tile's half of a link toward `d`: a thin line from the shared side a
   * quarter of the way in, which the neighbor's half completes across the grid
   * line. Thin and in ink, it reads as a mark the player made.
   */
  function drawLinkHalf(
    dr: GameDrawing,
    ts: number,
    tx: number,
    ty: number,
    d: number,
    color: number,
  ): void {
    const th = Math.max(2, Math.floor(ts / 14));
    const len = Math.floor(ts / 4) + 1;
    const mid = Math.floor(ts / 2) - Math.floor(th / 2);
    const rect: Rect = [
      { x: tx + mid, y: ty, w: th, h: len },
      { x: tx + ts - len, y: ty + mid, w: len, h: th },
      { x: tx + mid, y: ty + ts - len, w: th, h: len },
      { x: tx, y: ty + mid, w: len, h: th },
    ][d];
    dr.drawRect(rect, color);
  }

  /** A broken rule's bar, a thick outline inset from `box`. */
  function drawErrorBar(dr: GameDrawing, ts: number, box: Rect): void {
    const thick = Math.floor(ts / 10);
    const margin = Math.floor(ts / 20);
    drawThickRectOutline(
      dr,
      box.x + margin,
      box.y + margin,
      box.w - 2 * margin,
      box.h - 2 * margin,
      thick,
      COL_ERROR,
    );
  }

  function drawTile(
    dr: GameDrawing,
    ts: number,
    x: number,
    y: number,
    word: number,
    hintWord: number,
    lineWord: number,
    // A piece placed or taken away a moment ago: the value it grows from or
    // shrinks into, and how far it has got, 0 to 1.
    anim: { readonly from: number; readonly frac: number } | null = null,
  ): void {
    const v = word & 0xff;
    const tx = coord(x, ts);
    const ty = coord(y, ts);
    const tile = { x: tx, y: ty, w: ts, h: ts };
    const surface = { x: tx + 1, y: ty + 1, w: ts - 1, h: ts - 1 };
    const tone = ((word >> TONE_SHIFT) & 3) as WinTone;
    const piece = v === 0 ? undefined : byValue.get(v);

    dr.clip(tile);
    dr.drawRect(tile, COL_GRID);
    dr.drawRect(
      surface,
      tone
        ? winSlot(tone)
        : piece !== undefined && piece.painter.surface !== null
          ? piece.slot[piece.painter.surface]
          : word & FIXED
            ? COL_GIVEN
            : COL_CELL,
    );
    // Under the content, so the piece stays whole.
    if (hintWord & HINT_LINE) dr.drawHatch(surface, hatchPeriod(ts));
    // A piece taken away shrinks into its cell; one placed grows alone, since
    // two pieces in one cell read as neither.
    const shrinking = anim !== null && v === 0 ? byValue.get(anim.from) : undefined;
    if (shrinking !== undefined && anim !== null)
      shrinking.painter.paint(dr, tile, shrinking.slot, false, 1 - anim.frac);
    piece?.painter.paint(dr, tile, piece.slot, (word & ERR_AT) !== 0, anim?.frac ?? 1);

    // A run's bar reaches half a tile toward each end it continues to, the
    // clip keeping each tile to its own part.
    const half = Math.floor(ts / 2);
    const run = (d: number): boolean => (lineWord & (1 << (RUN_SHIFT + d))) !== 0;
    if (run(1) || run(3))
      drawErrorBar(dr, ts, {
        x: tx - (run(3) ? half : 0),
        y: ty,
        w: ts + (run(1) ? half : 0) + (run(3) ? half : 0),
        h: ts,
      });
    if (run(0) || run(2))
      drawErrorBar(dr, ts, {
        x: tx,
        y: ty - (run(0) ? half : 0),
        w: ts,
        h: ts + (run(0) ? half : 0) + (run(2) ? half : 0),
      });
    const across = Math.floor(ts / 12);
    if (lineWord & ACROSS_ROW)
      dr.drawRect({ x: tx, y: ty + half - across, w: ts, h: 2 * across }, COL_ERROR);
    if (lineWord & ACROSS_COLUMN)
      dr.drawRect({ x: tx + half - across, y: ty, w: 2 * across, h: ts }, COL_ERROR);

    for (let d = 0; d < 4; d++)
      if (word & (1 << (LINK_SHIFT + d)))
        drawLinkHalf(
          dr,
          ts,
          tx,
          ty,
          d,
          word & (1 << (BAD_LINK_SHIFT + d)) ? COL_ERROR : COL_INK,
        );
    DIAMOND_AT.forEach(([fx, fy], i) => {
      if (word & (1 << (DIAMOND_SHIFT + i)))
        drawDiamond(dr, ts, tx + Math.floor(ts * fx), ty + Math.floor(ts * fy));
    });

    if (word & MISTAKE) {
      const thick = Math.max(1, Math.floor(ts / 16));
      const inset = Math.max(2, Math.floor(ts / 8));
      const span = ts - 2 * inset;
      drawThickRectOutline(dr, tx + inset, ty + inset, span, span, thick, COL_ERROR);
    }
    if (word & CURSOR)
      drawRectCorners(
        dr,
        tx + Math.floor(ts / 2),
        ty + Math.floor(ts / 2),
        Math.floor(ts / 2) - 3,
        COL_CURSOR,
        word & ARMED ? Math.max(3, ts >> 3) : Math.max(2, ts >> 4),
      );

    dr.unclip();
    dr.drawUpdate(surface);
  }

  /** Where a hint mark sits round cell `(x, y)`: inside its own box, over
   * the grid line it owns, so a cell whose marks change repaints itself and
   * takes the old ones with it. */
  const markBand = (ts: number, x: number, y: number): MarkBand => ({
    box: { x: coord(x, ts), y: coord(y, ts), w: ts, h: ts },
    outer: 0,
    inner: Math.max(2, ts >> 4),
  });

  /**
   * The ring round the link a step asks for, with the link inside it. Where
   * the step rings both its cells, one pill round the two; otherwise a small
   * pill across the side they share.
   */
  function drawLinkRing(
    dr: GameDrawing,
    ts: number,
    w: number,
    { cell, to }: FillLink,
    whole: boolean,
  ): void {
    const [x, y, nx, ny] = [cell % w, Math.floor(cell / w), to % w, Math.floor(to / w)];
    const d = dirTo(w, cell, to);
    const room = {
      x: coord(Math.min(x, nx), ts),
      y: coord(Math.min(y, ny), ts),
      w: (Math.abs(nx - x) + 1) * ts,
      h: (Math.abs(ny - y) + 1) * ts,
    };
    const across = ny === y;
    const long = Math.floor(ts * 0.8);
    const short = Math.floor(ts / 3);
    const mx = across ? coord(Math.max(x, nx), ts) : coord(x, ts) + Math.floor(ts / 2);
    const my = across ? coord(y, ts) + Math.floor(ts / 2) : coord(Math.max(y, ny), ts);
    const box = whole
      ? room
      : across
        ? { x: mx - long / 2, y: my - short / 2, w: long, h: short }
        : { x: mx - short / 2, y: my - long / 2, w: short, h: long };
    const band = markBand(ts, x, y);
    dr.drawRing(box, NOTHING_TO_CLEAR, Math.max(2, band.outer + band.inner), {
      room,
      inside: (ink) => {
        drawLinkHalf(dr, ts, coord(x, ts), coord(y, ts), d, ink);
        drawLinkHalf(dr, ts, coord(nx, ts), coord(ny, ts), (d + 2) % 4, ink);
      },
    });
  }

  /** The tile words of the board's live errors: a pair's diamond and the
   * cells in error, the bars along a run and across lines, and the line
   * clues broken. */
  function errorWords(state: FillBoard<C>, shown: FillBoard<C>) {
    const { w, h } = state;
    const errors = liveErrors(rules, shown);
    const word = new Int32Array(w * h);
    for (const [a, b] of errors.pairs) {
      const [ax, ay, bx, by] = [a % w, Math.floor(a / w), b % w, Math.floor(b / w)];
      if (Math.abs(bx - ax) > 1 || Math.abs(by - ay) > 1) {
        word[a] |= ERR_AT;
        word[b] |= ERR_AT;
        continue;
      }
      // The point the two share, in halves of a tile from `a`'s corner; each
      // tile the diamond lies across paints its part.
      const px = ax * 2 + 1 + (bx - ax);
      const py = ay * 2 + 1 + (by - ay);
      for (let cy = Math.floor((py - 1) / 2); cy <= Math.floor(py / 2); cy++)
        for (let cx = Math.floor((px - 1) / 2); cx <= Math.floor(px / 2); cx++)
          if (cx >= 0 && cy >= 0 && cx < w && cy < h)
            word[cy * w + cx] |= diamondBit(px - cx * 2, py - cy * 2);
    }
    // Every other broken rule by how its cells lie: a run along a line gets a
    // bar, two or more whole lines a bar across each, and any other cells
    // their pieces in error.
    const lineWord = new Int32Array(w * h);
    for (const list of errors.byRule.values())
      for (const at of list) {
        if (at.length === 2) continue;
        const shape = lineShape(at, w, h);
        if (shape === null) for (const c of at) word[c] |= ERR_AT;
        else if (shape.kind === "lines")
          for (const c of at) lineWord[c] |= shape.rows ? ACROSS_ROW : ACROSS_COLUMN;
        else
          shape.cells.forEach((c, i) => {
            const [back, on] = shape.rows ? [3, 1] : [0, 2];
            if (i > 0) lineWord[c] |= 1 << (RUN_SHIFT + back);
            if (i < shape.cells.length - 1) lineWord[c] |= 1 << (RUN_SHIFT + on);
          });
      }
    const lineErrors = new Set<number>();
    for (const [kind, broken] of errors.clues)
      for (const q of broken) {
        const at = state.dealt[kind as keyof C].at[q];
        if (lineClues.includes(kind as keyof C)) lineErrors.add(at);
        else word[at] |= ERR_AT;
      }
    return { word, lineWord, lineErrors };
  }

  function redraw(dr: GameDrawing, ds: FillDrawState, frame: FillFrame<C>): void {
    const { state, prev, animTime, ui, flash, hint, mistakes } = frame;
    const ts = ds.tileSize;
    const { w, h } = state;
    const shown = ui.drag?.live ? previewed(state, ui) : state;

    if (ds.tiles.firstFrame()) {
      dr.drawRect(
        { x: coord(0, ts), y: coord(0, ts), w: w * ts + 1, h: h * ts + 1 },
        COL_GRID,
      );
      if (labelStart !== undefined) {
        const size = Math.floor((ts * 2) / 5);
        const font = {
          align: "center",
          baseline: "mathematical",
          fontType: "variable",
          size,
        } as const;
        const at = start(ts) - Math.floor(ts / 2);
        for (let y = 0; y < h; y++)
          dr.drawText(
            { x: at, y: coord(y, ts) + Math.floor(ts / 2) },
            font,
            COL_LABEL,
            labelStart(y),
          );
        for (let x = 0; x < w; x++)
          dr.drawText(
            { x: coord(x, ts) + Math.floor(ts / 2), y: at },
            font,
            COL_LABEL,
            labelStart(x),
          );
      }
    }

    // The live errors, on the board as the drag would leave it.
    const { word, lineWord, lineErrors } = errorWords(state, shown);

    // The links as drawn, both halves, and those Check & Save found wrong.
    const badLinks = new Set<number>();
    for (const m of mistakes ?? [])
      if (m.kind === "value") word[m.cell] |= MISTAKE;
      else badLinks.add(m.cell);
    for (let c = 0; c < w * h; c++) {
      const t = linkTo(shown, c);
      const d = t < 0 ? -1 : dirTo(w, c, t);
      if (d < 0) continue;
      const bad = badLinks.has(c) ? 1 : 0;
      word[c] |= (1 << (LINK_SHIFT + d)) | (bad << (BAD_LINK_SHIFT + d));
      const back = (d + 2) % 4;
      word[t] |= (1 << (LINK_SHIFT + back)) | (bad << (BAD_LINK_SHIFT + back));
    }

    // The hint: a ring round each cell it decides, a link's two cells one pill
    // with the link inside, an outline round the cells it reasons from, the
    // line it counts along striped, and the clue it counts with recolored.
    const marks = stepMarks(hint);
    const byReading = (cells: readonly MarkCell[]): MarkCell[] =>
      [...cells].sort((a, b) => a.y - b.y || a.x - b.x);
    const targets = byReading(marks.of("ring", CELL));
    const area = byReading(marks.of("outline", CELL));
    // A game without links has no step that rings one.
    const askedLinks = linkClues === null ? [] : marks.of("ring", LINK);
    const hintWord = new Int32Array(w * h);
    for (const l of askedLinks) {
      const d = dirTo(w, l.cell, l.to);
      hintWord[l.cell] |= 1 << (HINT_LINK_SHIFT + d);
      hintWord[l.to] |= 1 << (HINT_LINK_SHIFT + ((d + 2) % 4));
    }
    const markStyle: HintMarkStyle = {
      band: (x, y) => markBand(ts, x, y),
      // A cell holds a piece, never text; the clues lie past any ring's reach.
      text: () => NOTHING_TO_CLEAR,
      words: marks,
      evidenceColor: COL_HINT_OUTLINE,
    };
    const outlines = new MarkOutlines(targets, area, markStyle);
    const ringed = new Set(targets.map((c) => c.y * w + c.x));
    const whole = (l: FillLink): boolean => ringed.has(l.cell) && ringed.has(l.to);
    const inPill = new Set(askedLinks.filter(whole).flatMap((l) => [l.cell, l.to]));
    const unlinked = targets.filter((c) => !inPill.has(c.y * w + c.x));
    const stripes = marks.of("stripes", CELL);
    for (const p of stripes) hintWord[p.y * w + p.x] |= HINT_LINE;
    // The striped line, where the stripes lie along one: a line of one cell is
    // a row.
    const stripedLine =
      stripes.length === 0
        ? -1
        : stripes.every((p) => p.y === stripes[0].y)
          ? stripes[0].y
          : stripes.every((p) => p.x === stripes[0].x)
            ? h + stripes[0].x
            : -1;

    const cx = ui.cursor.visible ? ui.cursor.x : -1;
    const cy = ui.cursor.visible ? ui.cursor.y : -1;
    // A cell whose value just changed, while the engine drives timed redraws.
    const before = animTime > 0 && prev !== null ? prev.values : null;
    const frac = Math.min(1, animTime / PLACE_ANIM_TIME);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        let k = word[i] | shown.values[i] | (state.fixed[i] ? FIXED : 0);
        if (x === cx && y === cy) k |= CURSOR | (ui.linkArmed ? ARMED : 0);
        k |= flash.win(sweepStep(x, y)) << TONE_SHIFT;
        const hk = hintWord[i] | outlines.packed(x, y);
        // A growing piece is no key's: its tile is drawn every frame.
        if (before !== null && before[i] !== shown.values[i]) {
          ds.tiles.forget(i);
          drawTile(dr, ts, x, y, k, hk, lineWord[i], { from: before[i], frac });
        } else if (ds.tiles.changed(i, k, hk, lineWord[i]))
          drawTile(dr, ts, x, y, k, hk, lineWord[i]);
      }

    // After every tile, and every frame: `HintMarks.paint` always draws.
    ds.marks.paint(dr, unlinked, area, markStyle);
    for (const l of askedLinks) drawLinkRing(dr, ts, w, l, whole(l));

    if (lineClues.length === 0) return;
    const size = Math.floor(ts / 2);
    for (let k = 0; k < w + h; k++) {
      const v = lineClue(state, k);
      const hatched = stripedLine === k;
      const err = lineErrors.has(k);
      const key = (err ? 1 : 0) | (hatched ? 2 : 0);
      if (!ds.clues.changed(k, key)) continue;
      const row = k < h;
      const box = row
        ? { x: coord(w, ts) + 1, y: coord(k, ts), w: end(ts) - 1, h: ts }
        : { x: coord(k - h, ts), y: coord(h, ts) + 1, w: ts, h: end(ts) - 1 };
      dr.drawRect(box, COL_BACKGROUND);
      if (hatched) dr.drawHatch(box, hatchPeriod(ts));
      if (v >= 0)
        dr.drawText(
          row
            ? { x: coord(w + 1, ts), y: coord(k, ts) + Math.floor(ts / 2) }
            : { x: coord(k - h, ts) + Math.floor(ts / 2), y: coord(h + 1, ts) },
          {
            align: row ? "right" : "center",
            baseline: row ? "mathematical" : "alphabetic",
            fontType: "variable",
            size,
          },
          err ? COL_ERROR : COL_INK,
          String(v),
        );
      dr.drawUpdate(box);
    }
  }

  return {
    preferredTileSize: PREFERRED_TILE_SIZE,
    origin: start,
    computeSize: ({ w, h }, ts) => ({
      w: start(ts) + end(ts) + ts * w,
      h: start(ts) + end(ts) + ts * h,
    }),
    colors,
    newDrawState: (b, tileSize) => ({
      tileSize,
      tiles: new TileCache(b.w * b.h, { words: 3 }),
      clues: new TileCache(b.w + b.h),
      marks: new HintMarks(),
    }),
    redraw,
  };
}

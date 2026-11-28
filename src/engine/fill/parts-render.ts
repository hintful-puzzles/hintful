/**
 * How a board of parts (`parts.ts`, Map's regions) is drawn: over its
 * squares, each painted in its part's value, the borders between parts
 * drawn and a jagged border smoothed along a square's diagonal
 * (`render/parts-geometry.ts`), the notes as dots in a fixed formation on
 * every square of the part, a mistake red round each of its squares, and a
 * live error as a diamond on the border two clashing parts share. Upstream
 * map.c's `draw_square` and `game_redraw`. The fill renderer (`render.ts`)
 * keys a tile a cell and reads a cell as one square, so a board whose cells
 * are parts is drawn by this one (design.md § "Decisions" 30 of
 * `born-candidate-note-family-last`).
 */

import { COL_CURSOR, COL_ERROR, COL_FLASH, COL_FLASH_LEAD } from "../color/roles.ts";
import type { GameDrawing } from "../contract/game.ts";
import type { Rect } from "../contract/types.ts";
import { HintMarks } from "../render/hint-mark.ts";
import { liveErrors } from "../render/live-errors.ts";
import { OverlaySidecar } from "../render/overlay-sidecar.ts";
import {
  pencilIndicatorBox,
  pencilIndicatorCanvas,
  pencilIndicatorReach,
  repaintPencilIndicator,
} from "../render/pencil-indicator.ts";
import { TileCache } from "../render/tile-cache.ts";
import { sweepRanks, WIN_LEAD, WIN_NONE } from "../render/win-wave.ts";
import type { Squares } from "../solve/describe-runtime.ts";
import { rulesOf } from "./answer.ts";
import { type Clues, type FillBoard, type FillModule, spaceOf } from "./board.ts";
import { encodeDesc } from "./desc.ts";
import type { FillParams } from "./game-id.ts";
import type { PartsSpace } from "./parts.ts";
import {
  carriedLook,
  drawCarried,
  eraseCarried,
  newCarriedSprite,
} from "./render/carried.ts";
import { COL_ERRTEXT, COL_INK, fillPalette, swatchOf } from "./render/palette.ts";
import { bandWidth, drawBands } from "./render/parts-bands.ts";
import {
  BOTTOM,
  LEFT,
  type PartsGeometry,
  partAt,
  partsGeometry,
  RIGHT,
  split,
  TOP,
} from "./render/parts-geometry.ts";
import type { FillRenderModule } from "./render/setup.ts";
import type { FillDrawState, FillLook, FillRender } from "./render.ts";

const PREFERRED_TILE_SIZE = 32;

/** The values a square's dot formation has room for, one a row. */
const NOTED = 4;

// A square's first key word: its top and bottom triangles' parts' values,
// their notes, whether either part is a mistake, and the win flash on each.
const BOTTOM_VALUE = 4;
const TOP_NOTES = 8;
const BOTTOM_NOTES = 12;
const MISTAKE = 1 << 16;
const TOP_LIT = 17;
const BOTTOM_LIT = 19;
// Whether the square's top and bottom triangles are the selected part's,
// and whether it is the part's first square, which takes the note-taking
// corner while notes are typed.
const SELECTED_TOP = 1 << 21;
const SELECTED_BOTTOM = 1 << 22;
const NOTES_CORNER = 1 << 23;

/** Where a board of parts lies on its squares, which its drawing and its
 * input both read: one board is drawn and pressed frame after frame, so a
 * board's geometry is made once, from its clues. */
export function geometryOfParts<C extends Clues<C>>(
  module: FillModule<C>,
  parts: PartsSpace,
): (b: FillBoard<C>) => PartsGeometry {
  const deal = module.deal;
  if (deal === undefined) throw new Error("parts: a board of parts is dealt");
  const made = new WeakMap<object, PartsGeometry>();
  return (b) => {
    const key = b.dealt as object;
    let got = made.get(key);
    if (got === undefined) {
      const map = b.dealt[parts.of as keyof C] as unknown as Squares;
      // Upstream seeds the smoothing with the ID, which the board's clues
      // write again.
      got = partsGeometry(map, encodeDesc(module, deal, spaceOf(module, b), b.dealt));
      made.set(key, got);
    }
    return got;
  };
}

export function partsRender<C extends Clues<C>>(
  module: FillRenderModule<C>,
  look: FillLook<C>,
  geometryOf: (b: FillBoard<C>) => PartsGeometry,
): FillRender<C> {
  const { play } = look;
  const pal = fillPalette(play, false, false, false);
  const rules = rulesOf(module);

  const origin = (ts: number): number => pencilIndicatorReach(ts);
  /** The canvas of a board of `p.w` by `p.h` squares. */
  const computeSize = (p: Pick<FillParams, "w" | "h">, ts: number) =>
    pencilIndicatorCanvas({ w: p.w * ts + 1, h: p.h * ts + 1 }, ts);

  // Every value is a picture: a value or a note is drawn by its painter, as
  // the carry's are.
  const pictured = carriedLook(pal, (v) => {
    throw new Error(`parts: no painter for value ${v}`);
  });
  /** The surface a part holding `v` takes: its painter's, or the surface of
   * an undecided cell. */
  const surfaceOf = pictured.surface;

  /** Draw value `v`'s note as a dot of radius `r` at `(x, y)`. */
  const drawNote = (dr: GameDrawing, v: number, x: number, y: number, r: number) =>
    pictured.note(dr, { x: x - r, y: y - r, w: 2 * r, h: 2 * r }, v);

  function drawSquare(
    dr: GameDrawing,
    ts: number,
    g: PartsGeometry,
    s: number,
    key: number,
    errs: number,
  ): void {
    const { w } = g;
    const x = s % w;
    const y = Math.floor(s / w);
    const o = origin(ts);
    const px = o + x * ts;
    const py = o + y * ts;
    const tile: Rect = { x: px, y: py, w: ts, h: ts };
    const lit = (shift: number, v: number): number => {
      const tone = (key >> shift) & 3;
      return tone === WIN_NONE
        ? surfaceOf(v)
        : tone === WIN_LEAD
          ? COL_FLASH_LEAD
          : COL_FLASH;
    };
    dr.clip(tile);
    dr.drawRect(tile, lit(TOP_LIT, key & 15));

    // The bottom part's triangle, where the square is split: the diagonal
    // runs from top right to bottom left where the left triangle goes with
    // the top one.
    if (split(g, s)) {
      const apex = partAt(g, LEFT, s) === partAt(g, TOP, s) ? px + ts + 1 : px - 1;
      dr.drawPolygon(
        [
          { x: px - 1, y: py + ts + 1 },
          { x: apex, y: py - 1 },
          { x: px + ts + 1, y: py + ts + 1 },
        ],
        lit(BOTTOM_LIT, (key >> BOTTOM_VALUE) & 15),
        COL_INK,
      );
    }

    // The selection's band inside the part's border, under the notes.
    const band = [{ from: 0, to: bandWidth(ts), color: COL_CURSOR }];
    const notesCorner = (key & NOTES_CORNER) !== 0;
    drawBands(
      dr,
      g,
      s,
      px,
      py,
      ts,
      key & SELECTED_TOP ? band : [],
      key & SELECTED_BOTTOM ? band : [],
      {
        top: notesCorner && (key & SELECTED_TOP) !== 0,
        bottom: notesCorner && (key & SELECTED_BOTTOM) !== 0,
        color: COL_CURSOR,
      },
      COL_INK,
    );

    // The notes, a value a row, each in its column of a 5 by 5 formation,
    // on the triangle it falls in; none on the diagonal of a split square.
    const top = partAt(g, TOP, s);
    for (let yo = 0; yo < NOTED; yo++) {
      const xo = (yo * 2 + 1) % 5;
      const t =
        yo < xo && yo < 3 - xo
          ? TOP
          : yo > xo && yo > 3 - xo
            ? BOTTOM
            : xo < 2
              ? LEFT
              : RIGHT;
      if (yo === xo && partAt(g, TOP, s) !== partAt(g, LEFT, s)) continue;
      if (yo === 3 - xo && partAt(g, TOP, s) !== partAt(g, RIGHT, s)) continue;
      const notes = partAt(g, t, s) === top ? key >> TOP_NOTES : key >> BOTTOM_NOTES;
      if ((notes & (1 << yo)) === 0) continue;
      drawNote(
        dr,
        yo + 1,
        px + Math.floor(((xo + 1) * ts) / 5),
        py + Math.floor(((yo + 1) * ts) / 5),
        Math.floor(ts / 7),
      );
    }

    // The borders between parts, on the square's top and left, and its top
    // left corner where any border meets it.
    const at = (t: number, sx: number, sy: number) => partAt(g, t, sy * w + sx);
    if (x === 0 || at(RIGHT, x - 1, y) !== at(LEFT, x, y))
      dr.drawRect({ x: px, y: py, w: 1, h: ts }, COL_INK);
    if (y === 0 || at(BOTTOM, x, y - 1) !== at(TOP, x, y))
      dr.drawRect({ x: px, y: py, w: ts, h: 1 }, COL_INK);
    if (
      x === 0 ||
      y === 0 ||
      at(RIGHT, x - 1, y - 1) !== at(TOP, x, y) ||
      at(BOTTOM, x - 1, y - 1) !== at(LEFT, x, y)
    )
      dr.drawRect({ x: px, y: py, w: 1, h: 1 }, COL_INK);

    // A live error's diamond, at each of the square's nine half points it
    // reaches.
    for (let yo = 0; yo < 3; yo++)
      for (let xo = 0; xo < 3; xo++)
        if (errs & (1 << (yo * 3 + xo)))
          drawError(
            dr,
            ts,
            Math.floor((px * 2 + ts * xo) / 2),
            Math.floor((py * 2 + ts * yo) / 2),
          );

    // A mistake: a red outline inset in every square of the part.
    if (key & MISTAKE) {
      const inset = Math.max(1, Math.floor(ts / 12));
      const t = Math.max(1, Math.floor(ts / 16));
      const x0 = px + inset;
      const y0 = py + inset;
      const bw = ts - 2 * inset;
      dr.drawRect({ x: x0, y: y0, w: bw, h: t }, COL_ERROR);
      dr.drawRect({ x: x0, y: y0 + bw - t, w: bw, h: t }, COL_ERROR);
      dr.drawRect({ x: x0, y: y0, w: t, h: bw }, COL_ERROR);
      dr.drawRect({ x: x0 + bw - t, y: y0, w: t, h: bw }, COL_ERROR);
    }

    dr.unclip();
    dr.drawUpdate(tile);
  }

  /** A clash's diamond at `(x, y)`, with an exclamation mark drawn by hand,
   * as upstream draws it to keep it centered. */
  function drawError(dr: GameDrawing, ts: number, x: number, y: number): void {
    const r = Math.floor((ts * 2) / 5);
    dr.drawPolygon(
      [
        { x: x - r, y },
        { x, y: y - r },
        { x: x + r, y },
        { x, y: y + r },
      ],
      COL_ERROR,
      COL_INK,
    );
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

  return {
    preferredTileSize: PREFERRED_TILE_SIZE,
    origin,
    gap: () => 0,
    computeSize,
    colors: pal.colors,
    newDrawState: (b, tileSize) => {
      const g = geometryOf(b);
      if (b.pencil !== null && pal.byValue.size > NOTED)
        throw new Error(`parts: a square's notes have room for ${NOTED} values`);
      const none = new TileCache(0);
      return {
        tileSize,
        parts: null,
        tiles: new TileCache(g.w * g.h, { words: 2 }),
        breaches: [],
        struck: new OverlaySidecar(0),
        highlit: new OverlaySidecar(0),
        clues: none,
        lists: none,
        labels: none,
        margins: none,
        gaps: none,
        slots: none,
        corners: none,
        marks: new HintMarks(),
        tally: { shown: null },
        counts: { shown: null },
        recordList: { shown: null },
        band: { shown: null },
        badges: none,
        pencilModeShown: null,
        carried: newCarriedSprite(),
      };
    },
    redraw: (dr: GameDrawing, ds: FillDrawState, frame) => {
      const { state: b, ui, flash, mistakes } = frame;
      const g = geometryOf(b);
      const { w, h, n } = g;
      const wh = w * h;
      const ts = ds.tileSize;
      const o = origin(ts);
      eraseCarried(dr, ds.carried, ts);
      if (ds.tiles.firstFrame())
        dr.drawRect({ x: o, y: o, w: w * ts + 1, h: h * ts + 1 }, COL_INK);

      // The win flash sweeps the parts, each lit whole, ranked by its label
      // point along the diagonal.
      const lit = new Uint8Array(n);
      if (flash.winning) {
        const ranks = sweepRanks(g.labels);
        for (let p = 0; p < n; p++) lit[p] = flash.win(ranks[p]);
      }
      // The selected part, hidden while the win flash plays, and while notes
      // are typed the square that takes the note-taking corner: the part's
      // first whose top left corner is the part's, where the corner shows
      // whole, else its first.
      const selected = ui.cursor.visible && !flash.winning ? ui.cursor.x : -1;
      let notesSquare = -1;
      if (selected >= 0 && ui.pencilMode === true) {
        const squares = Array.from({ length: wh }, (_, s) => s);
        notesSquare =
          squares.find(
            (s) => partAt(g, TOP, s) === selected && partAt(g, LEFT, s) === selected,
          ) ??
          squares.find(
            (s) => partAt(g, TOP, s) === selected || partAt(g, BOTTOM, s) === selected,
          ) ??
          -1;
      }
      const wrong = new Set((mistakes ?? []).map((m) => m.cell));
      const notesOf = (p: number): number =>
        b.values[p] !== 0 || b.pencil === null ? 0 : (b.pencil[p] >> 1) & 15;

      const keys = new Int32Array(wh);
      for (let s = 0; s < wh; s++) {
        const t = partAt(g, TOP, s);
        const u = partAt(g, BOTTOM, s);
        keys[s] =
          b.values[t] |
          (b.values[u] << BOTTOM_VALUE) |
          (notesOf(t) << TOP_NOTES) |
          (notesOf(u) << BOTTOM_NOTES) |
          (wrong.has(t) || wrong.has(u) ? MISTAKE : 0) |
          (lit[t] << TOP_LIT) |
          (lit[u] << BOTTOM_LIT) |
          (t === selected ? SELECTED_TOP : 0) |
          (u === selected ? SELECTED_BOTTOM : 0) |
          (s === notesSquare ? NOTES_CORNER : 0);
      }

      // A diamond on each border the rules say is broken, on every square
      // its point touches.
      const errs = new Int32Array(wh);
      for (const [a, c] of liveErrors(rules, b).pairs) {
        const at = g.borders.get(a * n + c);
        if (at === undefined) continue;
        const ex = Math.floor(at.x / 2);
        const ey = Math.floor(at.y / 2);
        const xo = at.x % 2;
        const yo = at.y % 2;
        const mark = (sx: number, sy: number, bx: number, by: number) => {
          if (sx >= 0 && sx < w && sy >= 0 && sy < h)
            errs[sy * w + sx] |= 1 << (by * 3 + bx);
        };
        mark(ex, ey, xo, yo);
        if (xo === 0) mark(ex - 1, ey, 2, yo);
        if (yo === 0) mark(ex, ey - 1, xo, 2);
        if (xo === 0 && yo === 0) mark(ex - 1, ey - 1, 2, 2);
      }

      for (let s = 0; s < wh; s++)
        if (ds.tiles.changed(s, keys[s], errs[s]))
          drawSquare(dr, ts, g, s, keys[s], errs[s]);

      repaintPencilIndicator(
        dr,
        ds,
        ui.pencilMode === true,
        pencilIndicatorBox(computeSize(g, ts), ts),
        pal.PENCIL_STYLE,
      );
      drawCarried(dr, ds.carried, ts, ui.carry ?? null, pictured);
    },
    numbersLeft: () => 0,
    keySwatch: (v) => swatchOf(pal.byValue, v),
    partClueBox: () => null,
    countPressed: () => null,
    recordPressed: () => null,
    recordPoint: () => {
      throw new Error("parts: a board of parts has no list");
    },
    bandPressed: () => null,
    bandGrid: () => null,
    bandPoint: () => null,
    badgePoint: () => null,
    badgePressed: () => null,
    featureSlots: () => {
      throw new Error("parts: a board of parts has no features");
    },
    featureLetters: () => {
      throw new Error("parts: a board of parts has no features");
    },
  };
}

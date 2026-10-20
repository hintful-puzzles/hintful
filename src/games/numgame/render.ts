/**
 * Numgame's rendering: the target, six tiles and four operator buttons, each
 * an element that owns a box and repaints only when its key changes
 * (docs/rendering.md § "The tile cache and the diff key").
 *
 * An element paints its whole box, the ground around what it draws included,
 * so no two elements share a pixel and the hint's ring, which sits in that
 * ground, is part of the element it rings.
 */

import {
  CURSOR,
  cellSurface,
  clueDoneColor,
  FLASH,
  FLASH_LEAD,
  GOAL_WASH,
  givenSurface,
  HINT_RING,
  highlightWash,
  INK,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawRectCorners, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { drawMarkSides, MARK_ALL } from "../../engine/hint-mark.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import type { Color, Point, Rect, Size } from "../../engine/types.ts";
import {
  type Flash,
  sweepRanks,
  type WinTone,
  winSlot,
} from "../../engine/win-wave.ts";
import { SIGN, TILE } from "./hint-text.ts";
import { OPS, type Op } from "./solver.ts";
import {
  combined,
  type Made,
  madeText,
  type NumgameMove,
  type NumgameState,
  type NumgameUi,
  OP_SIGN,
  PLACES,
  ROW,
  type Tile,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 64;

/** Seconds a combination's first number takes to slide onto the second. */
export const SLIDE_S = 0.18;

// --- palette ----------------------------------------------------------------

const COL_BACKGROUND = 0;
const COL_EDGE = 1;
/** An operator's button. */
const COL_CELL = 2;
/** A number, dealt or made: one ground, so a made number does not read as
 * a different kind of tile; its sum beneath its value is what tells it. */
const COL_GIVEN = 3;
/** The selected number and the chosen operator. */
const COL_SELECTED = 4;
const COL_TEXT = 5;
/** A number the chosen operator cannot combine with the selected one. */
const COL_DIM = 6;
/** The target's ground: what the player seeks. */
const COL_TARGET = 7;
const COL_CURSOR = 8;
/** The ring on the numbers and the operator a hint step combines. */
export const COL_HINT = 9;
const COL_FLASH = 10;
const COL_FLASH_LEAD = 11;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_EDGE] = surfaceGrid(defaultBackground);
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_GIVEN] = givenSurface(defaultBackground);
  out[COL_SELECTED] = highlightWash(defaultBackground);
  out[COL_TEXT] = INK;
  out[COL_DIM] = clueDoneColor(defaultBackground);
  out[COL_TARGET] = GOAL_WASH;
  out[COL_CURSOR] = CURSOR;
  out[COL_HINT] = HINT_RING;
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  return out;
}

// --- geometry ---------------------------------------------------------------

/** Element indices: the six places, then the operators, then the target. */
const OP_BASE = PLACES;
const TARGET = OP_BASE + OPS.length;
const ELEMENTS = TARGET + 1;

/** Where everything sits at tile size `ts`. A tile is `ts` square; the gap
 * between elements is a quarter of that, and the board's border one gap. */
export interface Layout {
  readonly size: Size;
  /** What each element draws in, by element index. */
  readonly rects: readonly Rect[];
  /** Each element's box: its rect and its half of the gaps round it. The
   * gap is even, so the boxes meet and every pixel between them is one's. */
  readonly boxes: readonly Rect[];
  /** Half a gap: how far a box reaches past its rect. */
  readonly half: number;
  /** The six places' boxes together, which a slide crosses. */
  readonly places: Rect;
}

export function layout(ts: number): Layout {
  const half = Math.max(2, Math.round(ts / 8));
  const gap = 2 * half;
  const inner = ROW * ts + (ROW - 1) * gap;
  const targetH = Math.round(ts * 0.8);
  const tilesY = gap + targetH + gap;
  const opsY = tilesY + 2 * (ts + gap);
  const opH = Math.round(ts * 0.7);
  const rects: Rect[] = [];
  for (let p = 0; p < PLACES; p++)
    rects.push({
      x: gap + (p % ROW) * (ts + gap),
      y: tilesY + Math.floor(p / ROW) * (ts + gap),
      w: ts,
      h: ts,
    });
  const pitch = (inner + gap) / OPS.length;
  OPS.forEach((_, i) => {
    const x = gap + Math.round(i * pitch);
    rects.push({ x, y: opsY, w: gap + Math.round((i + 1) * pitch) - gap - x, h: opH });
  });
  rects.push({ x: gap, y: gap, w: inner, h: targetH });
  const boxes = rects.map((r) => ({
    x: r.x - half,
    y: r.y - half,
    w: r.w + 2 * half,
    h: r.h + 2 * half,
  }));
  const first = boxes[0];
  const last = boxes[PLACES - 1];
  return {
    size: { w: inner + 2 * gap, h: opsY + opH + gap },
    rects,
    boxes,
    half,
    places: {
      x: first.x,
      y: first.y,
      w: last.x + last.w - first.x,
      h: last.y + last.h - first.y,
    },
  };
}

export function computeSize(_p: unknown, ts: number): Size {
  return layout(ts).size;
}

/** The element a press at `p` lands on: a place, an operator's index past the
 * places, or the target; `null` for the ground between them. */
export function elementAt(ds: NumgameDrawState, p: Point): number | null {
  const i = ds.layout.boxes.findIndex(
    (b) => p.x >= b.x && p.x < b.x + b.w && p.y >= b.y && p.y < b.y + b.h,
  );
  return i < 0 ? null : i;
}

/** The middle of element `i`, where a hint's gesture taps it. */
export function elementCenter(ds: NumgameDrawState, i: number): Point {
  const r = ds.layout.rects[i];
  return { x: r.x + Math.floor(r.w / 2), y: r.y + Math.floor(r.h / 2) };
}

export const opElement = (op: Op): number => OP_BASE + OPS.indexOf(op);

// --- draw state -------------------------------------------------------------

/** Words of the cache a element keeps: its number and a made number's two
 * operands, each in two words since a product of six numbers passes 2^31,
 * then the flags. */
const KEY_WORDS = 7;
const F_PRESENT = 1;
const F_SELECTED = 1 << 2;
const F_DIM = 1 << 3;
const F_CURSOR = 1 << 4;
const F_RING = 1 << 5;
const K_TONE = 6;
const K_OP = 8;

export interface NumgameDrawState {
  started: boolean;
  tileSize: number;
  layout: Layout;
  /** Each element's position along the win flash's sweep. */
  sweep: readonly number[];
  /** What each element shows on the canvas, {@link KEY_WORDS} words each;
   * -1 before the first frame and after an animation's frames. */
  cache: Int32Array;
}

export function newDrawState(_s: NumgameState, tileSize: number): NumgameDrawState {
  const lay = layout(tileSize);
  const centers = lay.rects.map((r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 }));
  return {
    started: false,
    tileSize,
    layout: lay,
    sweep: sweepRanks(centers),
    cache: new Int32Array(ELEMENTS * KEY_WORDS).fill(-1),
  };
}

// --- one element ------------------------------------------------------------

interface Look {
  /** The number shown, or the operator's or the target's. */
  value: number;
  made: Made | null;
  op: Op | null;
  flags: number;
  tone: WinTone;
}

const SPLIT = 2 ** 31;

function key(look: Look, out: Int32Array, at: number): boolean {
  const words = [
    look.value % SPLIT,
    Math.floor(look.value / SPLIT),
    (look.made?.a ?? 0) % SPLIT,
    Math.floor((look.made?.a ?? 0) / SPLIT),
    (look.made?.b ?? 0) % SPLIT,
    Math.floor((look.made?.b ?? 0) / SPLIT),
    look.flags |
      (look.tone << K_TONE) |
      ((look.made ? OPS.indexOf(look.made.op) + 1 : 0) << K_OP),
  ];
  let same = true;
  words.forEach((w, k) => {
    if (out[at + k] !== w) same = false;
    out[at + k] = w;
  });
  return same;
}

/** The share of a tile's width its text may take: clear of the hint's ring,
 * which lies inside the tile's rim. */
const TEXT_SPAN = 0.7;

/** A font size at which `text` fits across `width`, no larger than `most`. */
function fitting(text: string, width: number, most: number): number {
  return Math.max(6, Math.floor(Math.min(most, width / (0.62 * text.length))));
}

function ground(look: Look, base: number): number {
  if (look.tone) return winSlot(look.tone, COL_FLASH, COL_FLASH_LEAD);
  return look.flags & F_SELECTED ? COL_SELECTED : base;
}

function drawElement(
  dr: GameDrawing,
  ds: NumgameDrawState,
  i: number,
  look: Look,
  at: Point = ds.layout.rects[i],
): void {
  const ts = ds.tileSize;
  const box = ds.layout.boxes[i];
  const base = ds.layout.rects[i];
  const r = { x: at.x, y: at.y, w: base.w, h: base.h };
  if (at === base) dr.drawRect(box, COL_BACKGROUND);
  const cx = r.x + Math.floor(r.w / 2);
  const text = look.flags & F_DIM ? COL_DIM : COL_TEXT;

  if (i === TARGET) {
    dr.drawRect(
      r,
      look.tone ? winSlot(look.tone, COL_FLASH, COL_FLASH_LEAD) : COL_TARGET,
    );
    const s = String(look.value);
    dr.drawText(
      { x: cx, y: r.y + Math.floor(r.h / 2) },
      glyphFont(fitting(s, r.w * 0.9, r.h * 0.7)),
      COL_TEXT,
      s,
    );
  } else if (i >= OP_BASE) {
    dr.drawRect(r, COL_EDGE);
    dr.drawRect(
      { x: r.x + 1, y: r.y + 1, w: r.w - 2, h: r.h - 2 },
      ground(look, COL_CELL),
    );
    dr.drawText(
      { x: cx, y: r.y + Math.floor(r.h / 2) },
      glyphFont(Math.floor(r.h * 0.6)),
      COL_TEXT,
      OP_SIGN[look.op ?? "+"],
    );
  } else if (look.flags & F_PRESENT) {
    dr.drawRect(r, COL_EDGE);
    dr.drawRect(
      { x: r.x + 1, y: r.y + 1, w: r.w - 2, h: r.h - 2 },
      ground(look, COL_GIVEN),
    );
    const s = String(look.value);
    if (look.made) {
      dr.drawText(
        { x: cx, y: r.y + Math.floor(r.h * 0.42) },
        glyphFont(fitting(s, r.w * TEXT_SPAN, ts * 0.45)),
        text,
        s,
      );
      const how = madeText(look.made);
      dr.drawText(
        { x: cx, y: r.y + Math.floor(r.h * 0.8) },
        glyphFont(fitting(how, r.w * TEXT_SPAN, ts * 0.2)),
        text,
        how,
      );
    } else {
      dr.drawText(
        { x: cx, y: r.y + Math.floor(r.h / 2) },
        glyphFont(fitting(s, r.w * TEXT_SPAN, ts * 0.5)),
        text,
        s,
      );
    }
  } else {
    // An empty place keeps its outline, so the board keeps its shape; a lit
    // one is outlined in the flash's color, wider than at rest.
    const { tone } = look;
    drawMarkSides(
      dr,
      { box: r, outer: 0, inner: tone ? Math.max(2, ts >> 4) : 1 },
      MARK_ALL,
      tone ? winSlot(tone, COL_FLASH, COL_FLASH_LEAD) : COL_EDGE,
    );
  }

  // The ring and the cursor sit in the gap round the element and on its rim,
  // never over what it shows.
  const band = Math.max(2, ts >> 4);
  if (look.flags & F_RING)
    drawMarkSides(
      dr,
      { box: r, outer: Math.min(band, ds.layout.half), inner: band },
      MARK_ALL,
      COL_HINT,
    );
  if (look.flags & F_CURSOR)
    drawRectCorners(
      dr,
      cx,
      r.y + Math.floor(r.h / 2),
      Math.floor(Math.min(r.w, r.h) / 2) - 3,
      COL_CURSOR,
      band,
    );
  dr.drawUpdate(box);
}

// --- redraw -----------------------------------------------------------------

/** The places a combination between `prev` and `s` emptied and filled, read
 * off the two boards: a place that held a number and holds none. */
function slide(
  prev: NumgameState,
  s: NumgameState,
): { from: number; into: number } | null {
  const from = s.slots.findIndex((t, i) => t === null && prev.slots[i] !== null);
  const into = s.slots.findIndex(
    (t, i) => t !== null && prev.slots[i] !== null && t !== prev.slots[i],
  );
  return from < 0 || into < 0 ? null : { from, into };
}

export function redraw(
  dr: GameDrawing,
  ds: NumgameDrawState,
  prev: NumgameState | null,
  state: NumgameState,
  _dir: number,
  ui: NumgameUi,
  animTime: number,
  flash: Flash,
  hint?: HintStep<NumgameMove>,
): void {
  const moving = animTime > 0 && prev !== null ? slide(prev, state) : null;
  // Mid-slide the board is the one being left, less the number in flight.
  const board = moving && prev ? prev : state;
  const slots = board.slots.map((t, i) => (moving?.from === i ? null : t));

  // A step's marks are of the board it was asked on, and mid-slide that board
  // is being left, its first number in flight, so they wait for the slide.
  const marks = stepMarks(moving ? undefined : hint);
  const ringedTiles = new Set(marks.of("ring", TILE));
  const ringedSigns = new Set(marks.of("ring", SIGN));
  const legal = (place: number): boolean =>
    ui.selected === null ||
    ui.op === null ||
    place === ui.selected ||
    combined(board.slots, { from: ui.selected, into: place, op: ui.op }) !== null;
  const cursorAt = ui.cursor.visible
    ? ui.cursor.y < 2
      ? ui.cursor.y * ROW + ui.cursor.x
      : OP_BASE + ui.cursor.x
    : -1;

  const looks: Look[] = [];
  slots.forEach((t: Tile | null, place) => {
    looks.push({
      value: t?.value ?? 0,
      made: t?.made ?? null,
      op: null,
      flags:
        (t ? F_PRESENT : 0) |
        (t && ui.selected === place ? F_SELECTED : 0) |
        (t && !legal(place) ? F_DIM : 0) |
        (ringedTiles.has(place) ? F_RING : 0),
      tone: flash.win(ds.sweep[place]),
    });
  });
  OPS.forEach((op, k) => {
    looks.push({
      value: 0,
      made: null,
      op,
      flags: (ui.op === op ? F_SELECTED : 0) | (ringedSigns.has(op) ? F_RING : 0),
      tone: flash.win(ds.sweep[OP_BASE + k]),
    });
  });
  looks.push({
    value: board.target,
    made: null,
    op: null,
    flags: 0,
    tone: flash.win(ds.sweep[TARGET]),
  });
  looks.forEach((look, i) => {
    if (i === cursorAt) look.flags |= F_CURSOR;
  });

  for (let i = 0; i < ELEMENTS; i++) {
    const same = key(looks[i], ds.cache, i * KEY_WORDS);
    if (same && ds.started && !moving) continue;
    drawElement(dr, ds, i, looks[i]);
  }
  ds.started = true;

  if (moving && prev) {
    const tile = prev.slots[moving.from];
    if (tile) {
      const a = ds.layout.rects[moving.from];
      const b = ds.layout.rects[moving.into];
      const t = Math.min(1, animTime / SLIDE_S);
      const at = {
        x: Math.round(a.x + (b.x - a.x) * t),
        y: Math.round(a.y + (b.y - a.y) * t),
      };
      drawElement(
        dr,
        ds,
        moving.from,
        {
          value: tile.value,
          made: tile.made,
          op: null,
          flags: F_PRESENT,
          tone: 0,
        },
        at,
      );
      dr.drawUpdate(ds.layout.places);
    }
    // The frames after the slide repaint every element from scratch.
    ds.cache.fill(-1);
  }
}

/**
 * A fill board's tiles: each cell's words this frame, and the tile painted
 * from them by its layers. `drawTile` calls the layers in their paint order,
 * bottom to top, which is the one list of what lies over what.
 */

import { COL_CURSOR } from "../../color/roles.ts";
import type { GameDrawing } from "../../contract/game.ts";
import { drawRectCorners } from "../../render/draw.ts";
import { JOINED_OPEN } from "../../render/piece.ts";
import { wallHalf } from "../../render/region-walls.ts";
import { sweepStep } from "../../render/win-wave.ts";
import type { Clues, FillBoard } from "../board.ts";
import { isDone } from "../done.ts";
import type { FillDrawState, FillFrame } from "../render.ts";
import type { CellLayout } from "./cell-text.ts";
import { paintDot } from "./layers/dots.ts";
import {
  edgeCursorBits,
  paintEdgeCursor,
  paintEdgeValues,
} from "./layers/edge-values.ts";
import type { TileFrame } from "./layers/layer.ts";
import { paintLinkHalves } from "./layers/links.ts";
import { paintBars, paintDiamonds } from "./layers/live-errors.ts";
import { drawMistake } from "./layers/mistakes.ts";
import { noteKey, paintNotes } from "./layers/notes.ts";
import {
  numberStates,
  paintNumber,
  paintNumberHint,
  shownNumber,
} from "./layers/numbers.ts";
import { paintNumeral } from "./layers/numerals.ts";
import { labelsOf, paintPartClue } from "./layers/part-clues.ts";
import { joinsOf, paintPiece } from "./layers/piece.ts";
import { highlightOf, paintSurface } from "./layers/surface.ts";
import { washesOf } from "./layers/wash.ts";
import type { FillSetup } from "./setup.ts";
import { paintRaised, repainted } from "./three-d.ts";
import {
  ARMED,
  CURSOR,
  FIXED,
  JOIN_SHIFT,
  LABEL_DONE,
  MISTAKE,
  NUMBER_UNDER,
  RAISED,
  type RaisedAt,
  SHAPE_OPEN,
  THREE_D,
  type TileWords,
  TONE_SHIFT,
  WASH_HIDES,
} from "./tile-word.ts";

/** How long a piece placed or taken away grows or shrinks, in seconds; the
 * midend stretches it to a hint step's. */
export const PLACE_ANIM_TIME = 0.13;

/** Each cell's words this frame, and whether its tile changed; `null` for
 * a cell the board does not draw. `words` are the errors', the mistakes'
 * and links', and the hint's. */
export function tileWordsOf<C extends Clues<C>>(
  cx: FillSetup<C>,
  lay: CellLayout,
  ds: FillDrawState,
  { state, prev, animTime, ui, flash }: FillFrame<C>,
  shown: FillBoard<C>,
  words: {
    readonly word: Int32Array;
    readonly lineWord: Int32Array;
    readonly edgeWord: Int32Array;
    readonly hintWord: (x: number, y: number) => number;
  },
): (TileWords | null)[] {
  const { w, h } = state;
  const cx0 = ui.cursor.visible ? ui.cursor.x : -1;
  const cy0 = ui.cursor.visible ? ui.cursor.y : -1;
  // On an answer on the edges a cell holds no value: its sides' are in its
  // edge word.
  const valueAt = (i: number): number => (cx.onEdges ? 0 : shown.values[i]);
  // A cell whose value just changed, while the engine drives timed redraws.
  const before = animTime > 0 && prev !== null && !cx.onEdges ? prev.values : null;
  const frac = Math.min(1, animTime / PLACE_ANIM_TIME);
  const states = numberStates(cx, shown);
  const joins = joinsOf(cx, shown);
  const washes = washesOf(cx, shown, ui);
  const labels = labelsOf(cx, state);
  const { parts } = ds;
  const tiles: (TileWords | null)[] = new Array(w * h).fill(null);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!lay.m.drawn(state, x, y)) continue;
      const i = y * w + x;
      const label = labels.get(i) ?? null;
      const v = valueAt(i);
      let k = words.word[i] | v | (state.fixed[i] ? FIXED : 0);
      // On the edges the cursor is on the half grid, a square's middle its
      // own point.
      if (cx.onEdges ? cx0 === 2 * x + 1 && cy0 === 2 * y + 1 : x === cx0 && y === cy0)
        k |= CURSOR | (ui.linkArmed ? ARMED : 0);
      k |= flash.win(sweepStep(x, y)) << TONE_SHIFT;
      const hk = words.hintWord(x, y);
      let lk =
        words.lineWord[i] |
        (states.get(i) ?? 0) |
        ((joins[i] & 0xf) << JOIN_SHIFT) |
        (joins[i] & JOINED_OPEN ? SHAPE_OPEN : 0) |
        washes[i] |
        (label !== null && isDone(state, label.kind, label.k) ? LABEL_DONE : 0);
      const n = shownNumber(cx, state, i, v, ui.hiddenShown);
      if (n >= 0 && v === cx.play.covers?.value) lk |= NUMBER_UNDER;
      const part =
        parts === null
          ? null
          : {
              walls: parts.walls[i],
              fill: parts.fills[i],
              inset: parts.inset?.[i] ?? -1,
              diagonal: parts.diagonal[i],
            };
      if (lay.f.threeD) lk |= THREE_D | (v !== 0 ? RAISED : 0);
      const nk = noteKey(shown, i, (k & CURSOR) !== 0, ui);
      const ek = words.edgeWord[i] | (cx.onEdges ? edgeCursorBits(ui.cursor, x, y) : 0);
      // A growing piece is no key's: its tile is drawn every frame.
      const grows = before !== null && before[i] !== v;
      if (grows) ds.tiles.forget(i);
      tiles[i] = {
        k,
        hk,
        lk,
        nk,
        ek,
        n,
        part,
        label: label?.text ?? null,
        anim: grows ? { from: before[i], frac } : null,
        changed: grows || ds.tiles.changed(i, k, hk, lk, nk, ek),
      };
    }
  return tiles;
}

/** Cell `at`'s tile from its words `t`, with `struck` the notes the hint's
 * step strikes from it, and the raised values of the cells next door that
 * reach into it, `spill`, painted over it in turn. */
function drawTile<C extends Clues<C>>(
  cx: FillSetup<C>,
  lay: CellLayout,
  dr: GameDrawing,
  ts: number,
  at: readonly [number, number, number],
  t: TileWords,
  struck: number,
  spill: readonly RaisedAt[],
): void {
  const { pal, typed, play } = cx;
  const { k: word, hk: hintWord, lk: lineWord, nk: noteWord, ek: edgeWord, part } = t;
  const [x, y, h] = at;
  const v = word & 0xff;
  const tx = lay.cellX(x, y, h, ts);
  const ty = lay.coord(y, ts);
  const tile = { x: tx, y: ty, w: ts, h: ts };
  const frame: TileFrame = {
    dr,
    ts,
    at,
    tx,
    ty,
    tile,
    word,
    hintWord,
    lineWord,
    noteWord,
    edgeWord,
    n: t.n,
    part,
    struck,
    label: t.label,
    piece: v === 0 || lineWord & WASH_HIDES ? null : (pal.byValue.get(v) ?? null),
    lay,
  };

  dr.clip(tile);
  paintSurface(pal, frame, highlightOf(typed, word, noteWord));
  paintPiece(cx, frame, t.anim);
  paintPartClue(pal.COL_DONE, frame);
  const raised = (lineWord & RAISED) !== 0;
  if (raised) paintRaised(cx, lay.f.top, dr, tile, { word, hintWord, noteWord });
  else if (typed) paintNumeral(pal.COL_ENTRY, frame);
  paintNotes(pal.COL_PENCIL, frame);
  if (play.dotted === true) paintDot(pal, frame);
  paintBars(frame);
  paintLinkHalves(frame);
  paintEdgeValues(pal, frame);
  paintDiamonds(frame);
  paintNumber(pal, frame, cx.onEdges);
  paintNumberHint(pal, frame);
  if (word & MISTAKE && !raised) drawMistake(dr, ts, tx, ty);
  // A board of buttons draws the cursor's corners; a board of numbers shows
  // it as the surface's highlight.
  if (word & CURSOR && !typed)
    drawRectCorners(
      dr,
      tx + Math.floor(ts / 2),
      ty + Math.floor(ts / 2),
      // Inside a wall, which a corner on the box's edge would paint over.
      Math.floor(ts / 2) - 3 - (part === null ? 0 : wallHalf(ts)),
      COL_CURSOR,
      word & ARMED ? Math.max(3, ts >> 3) : Math.max(2, ts >> 4),
    );
  paintEdgeCursor(frame);

  for (const s of spill) paintRaised(cx, lay.f.top, dr, s.tile, s);
  dr.unclip();
  dr.drawUpdate(part === null ? { x: tx + 1, y: ty + 1, w: ts - 1, h: ts - 1 } : tile);
}

/** Each tile that changed, with the raised values next door over it. */
export function paintTiles<C extends Clues<C>>(
  cx: FillSetup<C>,
  lay: CellLayout,
  dr: GameDrawing,
  ds: FillDrawState,
  b: FillBoard<C>,
  tiles: readonly (TileWords | null)[],
  raisedInto: (x: number, y: number) => readonly RaisedAt[],
): void {
  const ts = ds.tileSize;
  const { w, h } = b;
  const repaint = repainted(lay.f.threeD, w, h, tiles);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const t = tiles[i];
      if (t === null || !repaint[i]) continue;
      drawTile(cx, lay, dr, ts, [x, y, h], t, ds.struck.struck[i], raisedInto(x, y));
    }
}

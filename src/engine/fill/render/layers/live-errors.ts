/**
 * The live errors (`Game.rules`): two cells that break a rule together get a
 * diamond on the side or corner they share; a run the rules forbid gets a bar
 * along it, two or more whole lines a bar across each; a cell any other rule
 * breaks at turns its piece red. On an answer on the edges a rule breaks at
 * edges, which the edge values' layer draws red (`edge-values.ts`). A clue a
 * rule breaks is marked by its own layer or site, from the sets
 * {@link errorWords} returns.
 */

import { COL_ERROR } from "../../../color/roles.ts";
import type { GameDrawing } from "../../../contract/game.ts";
import type { Rect } from "../../../contract/types.ts";
import { drawThickRectOutline } from "../../../render/draw.ts";
import type { LiveErrors } from "../../../render/live-errors.ts";
import type { Partition } from "../../../solve/describe-runtime.ts";
import { type Clues, type FillBoard, listOf } from "../../board.ts";
import { COL_ERRTEXT, COL_INK } from "../palette.ts";
import type { FillSetup } from "../setup.ts";
import {
  ACROSS_COLUMN,
  ACROSS_ROW,
  DIAMOND_SHIFT,
  ERR_AT,
  LABEL_BROKEN,
  RUN_SHIFT,
} from "../tile-word.ts";
import type { TileFrame } from "./layer.ts";

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

/** The tile words of the board's live errors `errors`, read on the board
 * as the drag would leave it: a pair's diamond and the cells in error, the
 * bars along a run and across lines, and the line clues broken. */
export function errorWords<C extends Clues<C>>(
  setup: FillSetup<C>,
  state: FillBoard<C>,
  errors: LiveErrors,
) {
  const { partRules, gapped, lineClues, lineLists, slotClues, cornerKinds } = setup;
  const { valueMargins } = setup;
  const { partKinds, numbers, labeledBy, play } = setup;
  const { w, h } = state;
  const word = new Int32Array(w * h);
  // On an answer on the edges a rule breaks at edges, each drawn in error
  // whatever their number or shape.
  const edgeErrors = new Uint8Array(setup.onEdges ? errors.at.length : 0);
  if (setup.onEdges)
    for (const list of errors.byRule.values())
      for (const at of list) for (const e of at) edgeErrors[e] = 1;
  const cellRules = setup.onEdges ? [] : [...errors.byRule];
  // Two cells a rule breaks at together, but a part's: the two crosses
  // that leave a region no room are no pair.
  const pairs = cellRules.flatMap(([rule, list]) =>
    partRules.includes(rule) ? [] : list.filter((at) => at.length === 2),
  );
  for (const [a, b] of pairs) {
    const [ax, ay, bx, by] = [a % w, Math.floor(a / w), b % w, Math.floor(b / w)];
    // A point two cells share is in a gap, which neither tile draws.
    if (gapped || Math.abs(bx - ax) > 1 || Math.abs(by - ay) > 1) {
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
  for (const [rule, list] of cellRules)
    for (const at of list) {
      const ofPart = partRules.includes(rule);
      if (at.length === 2 && !ofPart) continue;
      const shape = ofPart ? null : lineShape(at, w, h);
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
  const gapErrors = new Set<number>();
  const slotErrors = new Set<number>();
  const cornerErrors = new Set<number>();
  const marginErrors = new Set<number>();
  // A broken number is drawn as a badge (`numberStates`), not on the piece;
  // a part's clue red at its part's first cell.
  // A record of the row of counts red by its index.
  const countErrors = new Set<number>();
  for (const [kind, broken] of errors.clues)
    for (const q of broken) {
      if (kind === setup.counted?.kind) {
        countErrors.add(q);
        continue;
      }
      const at = listOf(state.dealt, kind as keyof C).at[q];
      if (lineClues.includes(kind as keyof C) || lineLists.includes(kind as keyof C))
        lineErrors.add(at);
      else if (valueMargins.includes(kind as keyof C)) marginErrors.add(at);
      else if (slotClues.includes(kind as keyof C)) slotErrors.add(at);
      else if (cornerKinds.includes(kind as keyof C & string)) cornerErrors.add(at);
      else if (play.gaps?.[kind] !== undefined) gapErrors.add(at);
      else if (partKinds.includes(kind as keyof C & string))
        lineWord[(state.dealt[labeledBy as keyof C] as Partition).cells[at][0]] |=
          LABEL_BROKEN;
      else if (!numbers.includes(kind as keyof C & string)) word[at] |= ERR_AT;
    }
  return {
    word,
    lineWord,
    edgeErrors,
    lineErrors,
    gapErrors,
    slotErrors,
    cornerErrors,
    marginErrors,
    countErrors,
  };
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

/** The bars of a run through the cell and of the lines across it. A run's
 * bar reaches half a tile toward each end it continues to, the clip keeping
 * each tile to its own part. */
export function paintBars({ dr, ts, tx, ty, lineWord }: TileFrame): void {
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
}

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

/** The tile's part of each diamond on its sides and corners. */
export function paintDiamonds({ dr, ts, tx, ty, word }: TileFrame): void {
  DIAMOND_AT.forEach(([fx, fy], i) => {
    if (word & (1 << (DIAMOND_SHIFT + i)))
      drawDiamond(dr, ts, tx + Math.floor(ts * fx), ty + Math.floor(ts * fy));
  });
}

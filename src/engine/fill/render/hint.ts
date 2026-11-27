/**
 * The hint pass: what a step's marks put in the tiles' hint words, and what
 * it draws over the tiles. A ring round each cell it decides, a link's two
 * cells one pill with the link inside, an edge's pill with its value inside,
 * an outline round the cells it reasons from, the line it counts along
 * striped, and the clue it counts with recolored. Its rings, the link rings
 * and the edge rings are sites (`sites/hint-rings.ts`, `sites/link-rings.ts`,
 * `sites/edge-rings.ts`), after the tiles.
 */

import { COL_HINT_OUTLINE } from "../../color/roles.ts";
import { CELL, type StepMarks, stepMarks } from "../../contract/hint-words.ts";
import type { Rect } from "../../contract/types.ts";
import {
  type HintMarkStyle,
  type MarkCell,
  MarkOutlines,
} from "../../render/hint-mark.ts";
import { topFace } from "../../render/raised.ts";
import { NOTHING_TO_CLEAR, type RingClear, textBox } from "../../render/ring.ts";
import { type Clues, type FillBoard, listOf, spaceOf } from "../board.ts";
import { squaresOfEdge } from "../edge-target.ts";
import { ASKED_EDGE, type AskedEdge, type FillLink, LINK } from "../marks.ts";
import type { FillDrawState, FillFrame } from "../render.ts";
import type { CellLayout } from "./cell-text.ts";
import { numberText } from "./geometry.ts";
import { ballsOf, emptyIn } from "./layers/empty.ts";
import { notesIn } from "./layers/notes.ts";
import { labelsOf } from "./layers/part-clues.ts";
import type { FillSetup } from "./setup.ts";
import {
  BALL,
  BLOCK_SHIFT,
  dirTo,
  HINT_LINE,
  HINT_LINK_SHIFT,
  HINT_NUMBER,
} from "./tile-word.ts";

/** What the hint pass gives the tiles and the sites after them. */
export interface HintPass {
  readonly marks: StepMarks;
  /** Cell `(x, y)`'s hint word. */
  hintWord(x: number, y: number): number;
  /** The striped line, rows then columns, where the stripes lie along one;
   * `-1` where they do not. */
  readonly stripedLine: number;
  /** The cells ringed apart from a link's pill, and the area outlined. */
  readonly unlinked: readonly MarkCell[];
  readonly area: readonly MarkCell[];
  readonly markStyle: HintMarkStyle;
  /** The links a step asks for, each with whether one pill goes round both
   * its cells. */
  readonly askedLinks: readonly FillLink[];
  whole(l: FillLink): boolean;
  /** On an answer on the edges, the edges a step asks a value of. */
  readonly askedEdges: readonly AskedEdge[];
}

/** The text cell `(x, y)` shows, for a hint's ring to keep inside it: on a
 * board of numbers its numeral, or its notes; else the number written on
 * it. */
function cellText<C extends Clues<C>>(
  cx: FillSetup<C>,
  lay: CellLayout,
  b: FillBoard<C>,
  ds: FillDrawState,
  x: number,
  y: number,
): RingClear {
  const { w, h } = b;
  if (x < 0 || y < 0 || x >= w || y >= h) return NOTHING_TO_CLEAR;
  const ts = ds.tileSize;
  const at = y * w + x;
  const walls = ds.parts?.walls[at] ?? null;
  const tile: [number, number] = [lay.cellX(x, y, h, ts), lay.coord(y, ts)];
  const text = numberText(ts, ...tile);
  // A part's clue is kept outside the ring, which goes round what the
  // cell holds below it.
  const label = cx.labeled ? (labelsOf(cx, b).get(at) ?? null) : null;
  const avoid: Rect[] = [];
  if (label !== null) {
    const t = lay.labelText(ts, [x, y, h], walls, label.text);
    avoid.push(textBox(t.origin, t.options, label.text));
  }
  const enclosing = (enclose: RingClear["enclose"]): RingClear => ({
    enclose,
    avoid,
  });
  const v = b.values[at];
  const glyph = cx.glyphOf(b);
  if (lay.f.threeD && v !== 0) {
    const face = topFace({ x: tile[0], y: tile[1], w: ts, h: ts }, v, lay.f.top);
    const t = numberText(ts, face.x, face.y);
    return enclosing([textBox(t.origin, t.options, glyph(v))]);
  }
  if (cx.typed && v !== 0) {
    const t = lay.valueText(ts, [x, y, h], walls, ...tile);
    return enclosing([textBox(t.origin, t.options, glyph(v))]);
  }
  const noted = notesIn(b.pencil?.[at] ?? 0);
  if (noted.length > 0)
    return enclosing(
      lay
        .noteSlots(
          ts,
          [x, y, h],
          walls,
          noted.length,
          (ballsOf(cx, b, emptyIn(cx, b))[at] & BALL) !== 0,
        )
        .map(({ origin, options }, j) => textBox(origin, options, glyph(noted[j]))),
    );
  const n = cx.numberAt(b, at);
  if (n === null) return avoid.length === 0 ? NOTHING_TO_CLEAR : enclosing([]);
  return enclosing([
    textBox(text.origin, text.options, String(listOf(b.dealt, n.kind).v[n.k])),
  ]);
}

/** The hint pass over frame `frame`, its board as the drag would leave it
 * `shown`. */
export function hintPass<C extends Clues<C>>(
  cx: FillSetup<C>,
  lay: CellLayout,
  ds: FillDrawState,
  { state, hint }: FillFrame<C>,
  shown: FillBoard<C>,
): HintPass {
  const { clueCells, linkClues } = cx;
  const ts = ds.tileSize;
  const { w, h } = state;
  const marks = stepMarks(hint);
  // The notes the step strikes, where the board keeps notes.
  if (cx.notes)
    ds.struck.pack(
      marks,
      (x, y) => y * w + x,
      (m) => 1 << m.n,
    );
  const byReading = (cells: readonly MarkCell[]): MarkCell[] =>
    [...cells].sort((a, b) => a.y - b.y || a.x - b.x);
  const targets = byReading(marks.of("ring", CELL));
  // A clue at a slot is outlined in its margin, and lies on no tile.
  const onGrid = (c: { x: number; y: number }): boolean =>
    c.x >= 0 && c.y >= 0 && c.x < w && c.y < h;
  // An outlined number is the number the step reasons from: it is circled,
  // and its block outlined whole, apart from the rest of the area. A plain
  // number has no block, and outlined is a square of the area like any
  // other: the step names the one it counts from by its term.
  const outlined = byReading(marks.of("outline", CELL).filter(onGrid));
  const blocked = (c: { x: number; y: number }): boolean => {
    const kind = cx.numberAt(state, c.y * w + c.x)?.kind;
    return kind !== undefined && clueCells[kind] !== undefined;
  };
  const named = outlined.filter(blocked);
  const area = outlined.filter((c) => !blocked(c));
  // A game without links has no step that rings one.
  const askedLinks = linkClues === null ? [] : marks.of("ring", LINK);
  const hintWord = new Int32Array(w * h);
  const askedEdges = cx.onEdges ? marks.of("ring", ASKED_EDGE) : [];
  const rung = [
    ...askedLinks,
    ...askedEdges.map((e) => {
      const ends = squaresOfEdge(e);
      return { cell: ends[0].y * w + ends[0].x, to: ends[1].y * w + ends[1].x };
    }),
  ];
  for (const l of rung) {
    const d = dirTo(w, l.cell, l.to);
    hintWord[l.cell] |= 1 << (HINT_LINK_SHIFT + d);
    hintWord[l.to] |= 1 << (HINT_LINK_SHIFT + ((d + 2) % 4));
  }
  if (named.length > 0) {
    const sp = spaceOf(cx.module, state);
    for (const c of named) {
      const at = c.y * w + c.x;
      const { kind } = cx.numberAt(state, at) as { kind: keyof C & string };
      hintWord[at] |= HINT_NUMBER;
      // On an answer on the edges a number counts edges, not cells: the
      // circle round it is all its mark.
      if (cx.onEdges) continue;
      // A hexagon's corners are no cells a number counts on the board.
      const cells = (clueCells[kind] ?? (() => []))(sp, at).filter((d) =>
        lay.m.drawn(state, d % w, Math.floor(d / w)),
      );
      const block = new MarkOutlines(
        [],
        cells.map((d) => ({ x: d % w, y: Math.floor(d / w) })),
        lay.m.sides,
      );
      for (const d of cells)
        hintWord[d] |= block.evidenceSides(d % w, Math.floor(d / w)) << BLOCK_SHIFT;
    }
  }
  // A ring round a raised value goes round its top, where its numeral is.
  const ringedAt = new Set(targets.map((c) => c.y * w + c.x));
  const markStyle: HintMarkStyle = {
    band: (x, y) => {
      const band = lay.markBand(ts, [x, y, h], ds.parts?.walls[y * w + x] ?? null);
      const v = shown.values[y * w + x];
      return lay.f.threeD && v !== 0 && ringedAt.has(y * w + x)
        ? { ...band, box: topFace(band.box, v, lay.f.top) }
        : band;
    },
    // A ring keeps its cell's number inside it and its neighbors' outside;
    // the line clues lie past any ring's reach.
    text: (x, y) => cellText(cx, lay, state, ds, x, y),
    words: marks,
    evidenceColor: COL_HINT_OUTLINE,
    ...lay.m.sides,
  };
  const outlines = new MarkOutlines(targets, area, markStyle);
  const ringed = new Set(targets.map((c) => c.y * w + c.x));
  const whole = (l: FillLink): boolean => ringed.has(l.cell) && ringed.has(l.to);
  const inPill = new Set(askedLinks.filter(whole).flatMap((l) => [l.cell, l.to]));
  const unlinked = targets.filter((c) => !inPill.has(c.y * w + c.x));
  const stripes = marks.of("stripes", CELL).filter(onGrid);
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
  return {
    marks,
    hintWord: (x, y) => hintWord[y * w + x] | outlines.packed(x, y),
    stripedLine,
    unlinked,
    area,
    markStyle,
    askedLinks,
    whole,
    askedEdges,
  };
}

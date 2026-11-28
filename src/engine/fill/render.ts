/**
 * How a fill game on a square grid is drawn, by layers, from its description:
 * no game writes a renderer (`openspec/changes/a-game-from-its-description-alone`,
 * design.md § 6). This is the runner; each concept is a module of `render/`.
 *
 * A frame builds its layout (`render/geometry.ts`), the live errors' words
 * (`render/layers/live-errors.ts`), the mistakes' and links', and the hint's
 * (`render/hint.ts`); then each cell's tile words, and the tiles that
 * changed are painted layer by layer (`render/tile.ts`'s `drawTile`, which
 * holds their order). After the tiles come the raised values' margins
 * (`render/three-d.ts`) and the sites, {@link SITES}, in their order.
 */

import type { Frame, GameDrawing } from "../contract/game.ts";
import type { Color, Point, Rect, Size } from "../contract/types.ts";
import { HintMarks } from "../render/hint-mark.ts";
import { liveErrors } from "../render/live-errors.ts";
import { OverlaySidecar } from "../render/overlay-sidecar.ts";
import { TileCache } from "../render/tile-cache.ts";
import { perPlace } from "../solve/describe-runtime.ts";
import type { FillMistake } from "./answer.ts";
import type { BandGrid } from "./band.ts";
import {
  type Clues,
  type FillBoard,
  paramSpaceOf,
  perValuesOf,
  spaceOf,
  topValue,
} from "./board.ts";
import { countPressed, countRecords, countsAcross, countsLayout } from "./counts.ts";
import { type FillParams, givenOf } from "./game-id.ts";
import type { FillMove } from "./notes.ts";
import { orderOf, viewedErrors, viewedMistakes, viewedStep, viewOf } from "./order.ts";
import { tallyIn, tallyOf } from "./params/tally.ts";
import type { FillPlay, FillUi } from "./play.ts";
import {
  type ListPixels,
  listPixels,
  recordAtPixel,
  recordMiddle,
  recordTexts,
} from "./record-list.ts";
import { cellLayoutOf } from "./render/cell-text.ts";
import { drawFrame } from "./render/frame.ts";
import { layoutOf, tallyBeneath } from "./render/geometry.ts";
import { hintPass } from "./render/hint.ts";
import { breachesOf } from "./render/layers/breaches.ts";
import { edgeWordsOf } from "./render/layers/edge-values.ts";
import { featureTexts } from "./render/layers/features.ts";
import { addLinks } from "./render/layers/links.ts";
import { errorWords } from "./render/layers/live-errors.ts";
import { addMistakes } from "./render/layers/mistakes.ts";
import { numbersLeft } from "./render/layers/numbers.ts";
import { partClueBox } from "./render/layers/part-clues.ts";
import { partsOf } from "./render/layers/surface.ts";
import { type FillRenderModule, fillSetup } from "./render/setup.ts";
import { badged, badgeOf, badges } from "./render/sites/badges.ts";
import { band } from "./render/sites/band.ts";
import { corners } from "./render/sites/corners.ts";
import { counts } from "./render/sites/counts.ts";
import { edgeRings } from "./render/sites/edge-rings.ts";
import { gaps } from "./render/sites/gaps.ts";
import { hintRings } from "./render/sites/hint-rings.ts";
import { labels } from "./render/sites/labels.ts";
import { lineClues } from "./render/sites/line-clues.ts";
import { linkRings } from "./render/sites/link-rings.ts";
import { lists } from "./render/sites/lists.ts";
import { pencil } from "./render/sites/pencil.ts";
import { recordList } from "./render/sites/record-list.ts";
import type { FillSite } from "./render/sites/site.ts";
import { slots } from "./render/sites/slots.ts";
import { tally } from "./render/sites/tally.ts";
import { valueMargins } from "./render/sites/value-margins.ts";
import { raisedIntoOf, repaintMargins } from "./render/three-d.ts";
import { paintTiles, tileWordsOf } from "./render/tile.ts";

/** What a fill game is drawn from, beside its board: the compiled module's
 * `play`, `lineClues` and `labels`. */
export interface FillLook<C> {
  readonly play: FillPlay;
  /** The clue kinds at lines, drawn past each line's end. */
  readonly lineClues: readonly (keyof C)[];
  /** The clue kinds at slots, each drawn in the margin beyond its line's
   * end, at both ends of every line. */
  readonly slotClues?: readonly (keyof C)[];
  /** The list kinds at lines, each list stacked before its line's start. */
  readonly lineLists?: readonly (keyof C)[];
  /** The clue kinds at lines one a value, each line's before its start, a
   * tile a value (`value-margin.ts`). */
  readonly valueMargins?: readonly (keyof C)[];
  /** The clue kinds whose number is one of the answer's values, drawn as
   * its glyph. */
  readonly glyphClues?: readonly (keyof C)[];
  readonly labels?: FillLabels;
}

/** The fixed label before each line's start, by the line's index along its
 * axis: its text, or a value drawn as its glyph (`play.labels.glyph`). */
export interface FillLabels {
  readonly start?: (i: number) => string;
  readonly value?: (i: number) => number;
}

export type FillFrame<C> = Frame<FillBoard<C>, FillUi, FillMove, unknown, FillMistake>;

export interface FillDrawState {
  readonly tileSize: number;
  /** Each cell's walls (`regionWalls`) and the slot of the fill under it,
   * where the board has a partition drawn; `null` where it has none. Beside
   * them, the walls of a partition drawn inset, where it has one, and the
   * diagonals through each cell, bit 0 the main one's and bit 1 the
   * other's. */
  readonly parts: {
    readonly walls: Uint8Array;
    readonly fills: Uint8Array;
    readonly inset: Uint8Array | null;
    readonly diagonal: Uint8Array;
  } | null;
  /** Per cell, what it shows and the hint's marks on it. */
  readonly tiles: TileCache;
  /** Per cell, the breach labels it shows (`breachKey`), a lane the tiles'
   * key has no room for. */
  readonly breaches: (string | null)[];
  /** The notes the hint's step strikes, a lane the tiles' key has no room
   * for: packed on a board that keeps notes alone. */
  readonly struck: OverlaySidecar;
  /** Per cell, the player's highlight on it (`highlightsOf`), a lane the
   * tiles' key has no room for. */
  readonly highlit: OverlaySidecar;
  /** Per line, its clue's error, hint and hatch. */
  readonly clues: TileCache;
  /** Per line, its list's error, hatch, cursor and font. */
  readonly lists: TileCache;
  /** Per place, rows then columns, the line whose label it shows, where the
   * lines have labels. */
  readonly labels: TileCache;
  /** Per place of a clue one a value at a line (`perPlace`), its error,
   * done mark, hatch and outline, where the board has such clues. */
  readonly margins: TileCache;
  /** Per edge, the clue in its gap and its error, where the board has
   * gaps. */
  readonly gaps: TileCache;
  /** Per slot, its clue's error, done mark, hatch and outline, where the
   * board has clues at slots. */
  readonly slots: TileCache;
  /** Per corner, its clue and its error, where the board has clues at
   * corners. */
  readonly corners: TileCache;
  readonly marks: HintMarks;
  /** What the tally beneath the board shows found, `null` before it is
   * drawn. */
  readonly tally: { shown: string | null };
  /** What the row of counts beneath the board shows, `null` before it is
   * drawn. */
  readonly counts: { shown: string | null };
  /** What the list beneath the board shows, `null` before it is drawn. */
  readonly recordList: { shown: string | null };
  /** What the band beneath the board shows, `null` before it is drawn. */
  readonly band: { shown: string | null };
  /** Per square, its badge (`sites/badges.ts`), where the board has them. */
  readonly badges: TileCache;
  /** Whether the pencil-mode indicator shows, on a board that keeps notes:
   * `null` before it is drawn. */
  pencilModeShown: boolean | null;
}

export interface FillRender<C> {
  readonly preferredTileSize: number;
  /** How far in from the canvas's top and left the board's first cell lies. */
  origin(tileSize: number, board: FillBoard<C>): number;
  /** The space between two cells, 0 on a board without gaps. */
  gap(tileSize: number): number;
  computeSize(params: FillParams, tileSize: number): Size;
  colors(background: Color): Color[];
  newDrawState(board: FillBoard<C>, tileSize: number): FillDrawState;
  redraw(dr: GameDrawing, ds: FillDrawState, frame: FillFrame<C>): void;
  /** The numbers on cells not yet done, for the status bar. */
  numbersLeft(board: FillBoard<C>): number;
  /** The clue of the part holding cell `c`, with the box it is drawn in at
   * its part's first cell at tile size `ts`; `null` where the part has none
   * or the board has no clues at parts. */
  partClueBox(
    ts: number,
    board: FillBoard<C>,
    c: number,
  ): { readonly box: Rect; readonly kind: string; readonly k: number } | null;
  /** The value of the record of the row of counts a press at `p` lands on,
   * or `null` where it lands on none or the board has no row. */
  countPressed(board: FillBoard<C>, ds: FillDrawState, p: Point): number | null;
  /** The record of the list beneath the board a press at `p` lands on,
   * `null` where it lands on none or the board has no list. */
  recordPressed(board: FillBoard<C>, ds: FillDrawState, p: Point): number | null;
  /** The middle of record `k` of the list, where a press on it lands. */
  recordPoint(board: FillBoard<C>, ds: FillDrawState, k: number): Point;
  /** The value of the band beneath the board a press at `p` lands on, `null`
   * where it lands on none or the board has no band. */
  bandPressed(board: FillBoard<C>, ds: FillDrawState, p: Point): number | null;
  /** Board `b`'s band as the keyboard walks it, `null` where it has none. */
  bandGrid(board: FillBoard<C>): BandGrid | null;
  /** Where a press on value `v` of board `b`'s band lands, `null` where it
   * has no band. */
  bandPoint(board: FillBoard<C>, ds: FillDrawState, v: number): Point | null;
  /** Where a press on square `c`'s badge lands, `null` where it has none. */
  badgePoint(board: FillBoard<C>, ds: FillDrawState, c: number): Point | null;
  /** The square whose badge a press at `p` lands on, `null` where it lands
   * on none or the board has no badges. */
  badgePressed(board: FillBoard<C>, ds: FillDrawState, p: Point): number | null;
  /** Where cell `c`'s feature slots are drawn, where the values are features
   * (`play.numbers.features`), a slot a feature. */
  featureSlots(board: FillBoard<C>, ds: FillDrawState, c: number): readonly Rect[];
  /** Where cell `c`'s feature letters are drawn, slot by slot. */
  featureLetters(board: FillBoard<C>, ds: FillDrawState, c: number): readonly Point[];
}

const PREFERRED_TILE_SIZE = 32;

/** A frame of a board drawn in the order `lines`, as its view: the board
 * and the one animated from, the mistakes and the hint's step, each at the
 * cells of the view that show them. */
function viewedFrame<C>(frame: FillFrame<C>, lines: Int32Array): FillFrame<C> {
  const { state, prev, hint, mistakes } = frame;
  const { w } = state;
  return {
    ...frame,
    state: viewOf(state, lines),
    prev: prev === null ? null : viewOf(prev, lines),
    ...(hint === undefined ? {} : { hint: viewedStep(w, lines, hint) }),
    ...(mistakes === undefined ? {} : { mistakes: viewedMistakes(w, lines, mistakes) }),
  };
}

/**
 * What the board draws after its tiles, in paint order, which is behavior:
 * the pencil indicator and the slots after the raised values' margins, whose
 * repaint clears their caches; the corners after the tiles and the hint's
 * rings, whose words they read and over which their discs lie; the badges
 * after the gaps, which clear the gap a badge sits in.
 */
const SITES: readonly FillSite[] = [
  pencil,
  gaps,
  badges,
  slots,
  hintRings,
  corners,
  linkRings,
  edgeRings,
  tally,
  counts,
  recordList,
  band,
  lists,
  valueMargins,
  lineClues,
  labels,
];

export function fillRender<C extends Clues<C>>(
  module: FillRenderModule<C>,
  look: FillLook<C>,
  previewed: (board: FillBoard<C>, ui: FillUi) => FillBoard<C>,
): FillRender<C> {
  const cx = fillSetup(module, look, previewed);
  const { metrics } = cx;
  const sites = SITES.filter((s) => s.on(cx));

  /** The layout of a frame of board `b`, raised in 3D where `threeD`. */
  const layoutFor = (b: FillBoard<C>, threeD: boolean, top: number) =>
    cellLayoutOf(
      layoutOf(metrics, {
        depth: metrics.depthOf(b, cx.marginValues(b)),
        boardW: b.w,
        threeD,
        top,
      }),
      cx.labeled,
      cx.labelSizes,
    );

  function redraw(dr: GameDrawing, ds: FillDrawState, stored: FillFrame<C>): void {
    const { ui } = stored;
    // The live errors, on the board as the drag would leave it: read on the
    // board as it is stored, where its rules hold.
    const previewedStored = ui.drag?.live ? previewed(stored.state, ui) : stored.state;
    const live = liveErrors(cx.rules, previewedStored);
    // A board in an order is drawn as its view, each cell at its place.
    const lines = cx.ordered ? orderOf(stored.state, ui) : null;
    const frame = lines === null ? stored : viewedFrame(stored, lines);
    const { state, mistakes } = frame;
    const ts = ds.tileSize;
    const lay = layoutFor(
      state,
      cx.raises && ui.raised !== false,
      cx.raises ? topValue(module, spaceOf(module, state), state.dealt) : 1,
    );
    const shown = lines === null ? previewedStored : viewOf(previewedStored, lines);

    if (ds.tiles.firstFrame()) drawFrame(cx, lay, dr, ds, state);

    const viewed = lines === null ? live : viewedErrors(state.w, lines, live);
    const { word, lineWord, edgeErrors, ...errors } = errorWords(cx, state, viewed);
    const breaches = breachesOf(viewed.labels, cx.glyphOf(state));
    addLinks(cx, word, shown, mistakes ?? []);
    const edgeWord = edgeWordsOf(cx, shown, edgeErrors, mistakes ?? []);
    if (!cx.onEdges) addMistakes(word, edgeWord, mistakes ?? []);
    const hint = hintPass(cx, lay, ds, frame, shown);

    const tiles = tileWordsOf(cx, lay, ds, frame, shown, {
      word,
      lineWord,
      edgeWord,
      hintWord: hint.hintWord,
      breaches,
    });
    const raisedInto = raisedIntoOf(lay, state, ts, tiles);
    paintTiles(cx, lay, dr, ds, state, tiles, raisedInto);
    if (cx.raises) repaintMargins(cx, lay, dr, ds, state, tiles, raisedInto);

    const f = { dr, ds, cx, lay, state, shown, ui, errors, hint, tiles, raisedInto };
    for (const site of sites) site.paint(f);
  }

  return {
    preferredTileSize: PREFERRED_TILE_SIZE,
    origin: (ts, b) => metrics.startAt(ts, metrics.depthOf(b, cx.marginValues(b))),
    gap: metrics.gapOf,
    // A hexagon's rows reach half a tile past its width.
    computeSize: (p, size) => {
      const t = module.deal === undefined ? null : tallyIn(module.deal);
      // The margin of clues one a value is as deep as the values its ends
      // lay before the start, or the domain the params' sizes give.
      const values = !cx.margined
        ? 0
        : (module.play?.ends?.start.length ??
          (module.deal === undefined
            ? 0
            : perValuesOf(
                module,
                paramSpaceOf(module, p),
                givenOf(module.deal, p) as C,
              )));
      return metrics.canvasOf(
        p,
        values,
        t !== null ? tallyBeneath(tallyOf(t, p), p.w) : cx.untalliedBeneath(p.w),
        metrics.tileOf(size),
      );
    },
    colors: cx.pal.colors,
    newDrawState: (b, tileSize) => {
      const struck = new OverlaySidecar(b.w * b.h);
      const highlit = new OverlaySidecar(b.w * b.h);
      return {
        tileSize: metrics.tileOf(tileSize),
        parts: partsOf(cx, b),
        tiles: new TileCache(b.w * b.h, { words: 5, overlays: [struck, highlit] }),
        breaches: new Array<string | null>(b.w * b.h).fill(null),
        struck,
        highlit,
        clues: new TileCache(b.w + b.h),
        lists: new TileCache(b.w + b.h),
        labels: new TileCache(cx.labelStart === null ? 0 : b.w + b.h),
        margins: new TileCache(cx.margined ? perPlace(b.w + b.h, 0) : 0),
        gaps: new TileCache(cx.gapped ? spaceOf(module, b).edges.length : 0),
        slots: new TileCache(cx.slotted ? spaceOf(module, b).slots.length : 0),
        corners: new TileCache(cx.cornered ? spaceOf(module, b).corners.length : 0),
        marks: new HintMarks(),
        tally: { shown: null },
        counts: { shown: null },
        recordList: { shown: null },
        band: { shown: null },
        badges: new TileCache(badged(cx) ? b.w * b.h : 0, { words: 2 }),
        pencilModeShown: null,
      };
    },
    redraw,
    numbersLeft: (b) => numbersLeft(cx, b),
    partClueBox: (ts, b, c) =>
      partClueBox(
        cx,
        layoutFor(b, false, 1),
        metrics.tileOf(ts),
        b,
        c,
        (first) => partsOf(cx, b)?.walls[first] ?? null,
      ),
    countPressed: (b, ds, p) => {
      if (cx.counted === null) return null;
      const ts = ds.tileSize;
      const { x, y } = metrics.beneathAt(
        ts,
        metrics.depthOf(b, cx.marginValues(b)),
        b.h,
      );
      const records = countRecords(b, cx.counted);
      const lay = countsLayout(records, countsAcross(b.w));
      const i = countPressed(lay, x, y, ts, p.x, p.y);
      return i < 0 ? null : records[i].value;
    },
    recordPressed: (b, ds, p) => {
      const at = listPixelsOf(b, ds);
      const k = at === null ? -1 : recordAtPixel(at, p);
      return k < 0 ? null : k;
    },
    recordPoint: (b, ds, k) => {
      const at = listPixelsOf(b, ds);
      if (at === null) throw new Error("play list: the board has no list");
      return recordMiddle(at, k);
    },
    bandPressed: (b, ds, p) => {
      if (!cx.banded) return null;
      const depth = metrics.depthOf(b, cx.marginValues(b));
      const { values, pixels } = cx.bandOf(b, ds.tileSize, depth);
      const k = recordAtPixel(pixels, p);
      return k < 0 ? null : values[k];
    },
    bandGrid: (b) => (cx.banded ? cx.bandGrid(b) : null),
    bandPoint: (b, ds, v) => {
      if (!cx.banded) return null;
      const depth = metrics.depthOf(b, cx.marginValues(b));
      const { values, pixels } = cx.bandOf(b, ds.tileSize, depth);
      const o = pixels.origins[values.indexOf(v)];
      if (o === undefined) return null;
      return { x: Math.round(o.x + o.w / 2), y: Math.round(o.y - pixels.font * 0.35) };
    },
    badgePoint: (b, ds, c) => {
      if (!badged(cx) || b.fixed[c]) return null;
      const lay = layoutFor(b, false, 1);
      const { hit } = badgeOf(lay, ds.tileSize, c % b.w, Math.floor(c / b.w), b.h);
      return { x: Math.round(hit.x + hit.w / 2), y: Math.round(hit.y + hit.h / 2) };
    },
    badgePressed: (b, ds, p) => {
      if (!badged(cx)) return null;
      const lay = layoutFor(b, false, 1);
      for (let c = 0; c < b.w * b.h; c++) {
        if (b.fixed[c]) continue;
        const { hit } = badgeOf(lay, ds.tileSize, c % b.w, Math.floor(c / b.w), b.h);
        if (p.x >= hit.x && p.x < hit.x + hit.w && p.y >= hit.y && p.y < hit.y + hit.h)
          return c;
      }
      return null;
    },
    featureSlots: (b, ds, c) => {
      if (cx.features === null) throw new Error("play numbers: no features");
      const at = [c % b.w, Math.floor(c / b.w), b.h] as const;
      // A board of features is never raised.
      return layoutFor(b, false, 1).featureSlots(
        ds.tileSize,
        at,
        partsOf(cx, b)?.walls[c] ?? null,
        cx.features.names.length,
      );
    },
    featureLetters: (b, ds, c) => {
      if (cx.features === null) throw new Error("play numbers: no features");
      const at = [c % b.w, Math.floor(c / b.w), b.h] as const;
      const lay = layoutFor(b, false, 1);
      const walls = partsOf(cx, b)?.walls[c] ?? null;
      return featureTexts(
        lay.featureSlots(ds.tileSize, at, walls, cx.features.names.length),
        lay.markBand(ds.tileSize, at, walls),
      ).map((t) => t.origin);
    },
  };

  /** Where each record of board `b`'s list lies, as its site draws it;
   * `null` where the board has no list. */
  function listPixelsOf(b: FillBoard<C>, ds: FillDrawState): ListPixels | null {
    if (cx.listed === null) return null;
    const ts = ds.tileSize;
    const { x, y } = metrics.beneathAt(ts, metrics.depthOf(b, cx.marginValues(b)), b.h);
    return listPixels(recordTexts(b, cx.listed, cx.glyphOf(b)), b.w, ts, x, y);
  }
}

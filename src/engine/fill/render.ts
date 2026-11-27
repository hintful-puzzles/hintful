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
import type { Color, Rect, Size } from "../contract/types.ts";
import { HintMarks } from "../render/hint-mark.ts";
import { liveErrors } from "../render/live-errors.ts";
import { OverlaySidecar } from "../render/overlay-sidecar.ts";
import { TileCache } from "../render/tile-cache.ts";
import { perPlace } from "../solve/describe-runtime.ts";
import type { FillMistake } from "./answer.ts";
import {
  type Clues,
  type FillBoard,
  paramSpaceOf,
  perValuesOf,
  spaceOf,
  topValue,
} from "./board.ts";
import { type FillParams, givenOf } from "./game-id.ts";
import type { FillMove } from "./notes.ts";
import { orderOf, viewedErrors, viewedMistakes, viewedStep, viewOf } from "./order.ts";
import { tallyIn, tallyOf } from "./params/tally.ts";
import type { FillPlay, FillUi } from "./play.ts";
import { cellLayoutOf } from "./render/cell-text.ts";
import { drawFrame } from "./render/frame.ts";
import { layoutOf } from "./render/geometry.ts";
import { hintPass } from "./render/hint.ts";
import { edgeWordsOf } from "./render/layers/edge-values.ts";
import { addLinks } from "./render/layers/links.ts";
import { errorWords } from "./render/layers/live-errors.ts";
import { addMistakes } from "./render/layers/mistakes.ts";
import { numbersLeft } from "./render/layers/numbers.ts";
import { partClueBox } from "./render/layers/part-clues.ts";
import { partsOf } from "./render/layers/surface.ts";
import { type FillRenderModule, fillSetup } from "./render/setup.ts";
import { corners } from "./render/sites/corners.ts";
import { edgeRings } from "./render/sites/edge-rings.ts";
import { gaps } from "./render/sites/gaps.ts";
import { hintRings } from "./render/sites/hint-rings.ts";
import { labels } from "./render/sites/labels.ts";
import { lineClues } from "./render/sites/line-clues.ts";
import { linkRings } from "./render/sites/link-rings.ts";
import { lists } from "./render/sites/lists.ts";
import { pencil } from "./render/sites/pencil.ts";
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
  /** The fixed text before each line's start, by the line's index along its
   * axis. */
  readonly labels?: { readonly start?: (i: number) => string };
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
  /** The notes the hint's step strikes, a lane the tiles' key has no room
   * for: packed on a board that keeps notes alone. */
  readonly struck: OverlaySidecar;
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
 * rings, whose words they read and over which their discs lie.
 */
const SITES: readonly FillSite[] = [
  pencil,
  gaps,
  slots,
  hintRings,
  corners,
  linkRings,
  edgeRings,
  tally,
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

    const { word, lineWord, edgeErrors, ...errors } = errorWords(
      cx,
      state,
      lines === null ? live : viewedErrors(state.w, lines, live),
    );
    if (!cx.onEdges) addMistakes(word, mistakes ?? []);
    addLinks(cx, word, shown, mistakes ?? []);
    const edgeWord = edgeWordsOf(cx, shown, edgeErrors, mistakes ?? []);
    const hint = hintPass(cx, lay, ds, frame, shown);

    const tiles = tileWordsOf(cx, lay, ds, frame, shown, {
      word,
      lineWord,
      edgeWord,
      hintWord: hint.hintWord,
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
      // The margin of clues one a value is as deep as the domain the
      // params' sizes give.
      const values =
        cx.margined && module.deal !== undefined
          ? perValuesOf(module, paramSpaceOf(module, p), givenOf(module.deal, p) as C)
          : 0;
      return metrics.canvasOf(
        p,
        values,
        t === null ? null : tallyOf(t, p),
        metrics.tileOf(size),
      );
    },
    colors: cx.pal.colors,
    newDrawState: (b, tileSize) => {
      const struck = new OverlaySidecar(b.w * b.h);
      return {
        tileSize: metrics.tileOf(tileSize),
        parts: partsOf(cx, b),
        tiles: new TileCache(b.w * b.h, { words: 5, overlays: [struck] }),
        struck,
        clues: new TileCache(b.w + b.h),
        lists: new TileCache(b.w + b.h),
        labels: new TileCache(cx.labelStart === undefined ? 0 : b.w + b.h),
        margins: new TileCache(cx.margined ? perPlace(b.w + b.h, 0) : 0),
        gaps: new TileCache(cx.gapped ? spaceOf(module, b).edges.length : 0),
        slots: new TileCache(cx.slotted ? spaceOf(module, b).slots.length : 0),
        corners: new TileCache(cx.cornered ? spaceOf(module, b).corners.length : 0),
        marks: new HintMarks(),
        tally: { shown: null },
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
  };
}

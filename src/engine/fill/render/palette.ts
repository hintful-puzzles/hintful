/**
 * A fill board's palette: the board's own slots, each painter's, and the
 * slots a board fills only where it has what they color. A slot a board does
 * not use takes no number, so a palette has no hole.
 */

import {
  BLACK,
  GRAY_WASH,
  REGION_FILLS,
  WHITE,
  YELLOW_WASH,
} from "../../color/colors.ts";
import {
  CLEAR_MARK,
  cellSurface,
  clueDoneColor,
  ERROR_TEXT,
  GRID_DARK,
  givenSurface,
  highlightWash,
  INK,
  PENCIL_BODY,
  pencilColor,
  playerEntryColor,
  regionHighlightWash,
  surfaceGrid,
} from "../../color/palette.ts";
import { COL_BACKGROUND, FIRST_GAME_SLOT, rolePalette } from "../../color/roles.ts";
import type { Color } from "../../contract/types.ts";
import type { PencilIndicatorStyle } from "../../render/pencil-indicator.ts";
import type { EdgeValuePainter } from "../../render/pieces/edge-value.ts";
import { PAINTERS, type Painter, type PainterName } from "../../render/pieces/index.ts";
import { edgeTextOf } from "../answer.ts";
import type { FillPlay } from "../play.ts";

/** The fills a dealt partition's parts take: the region palette's first four,
 * as Star Battle's. */
export const REGION_SURFACES = REGION_FILLS.slice(0, 4);

// The board's own slots; each painter's follow.
export const COL_GRID = FIRST_GAME_SLOT;
/** The surface of a cell not yet decided. */
export const COL_CELL = FIRST_GAME_SLOT + 1;
/** The clues, and a link: the player's own notation is drawn in the clues'
 * ink. */
export const COL_INK = FIRST_GAME_SLOT + 2;
export const COL_ERRTEXT = FIRST_GAME_SLOT + 3;
/** A line's fixed label, quieter than its clue. */
export const COL_LABEL = FIRST_GAME_SLOT + 4;
const FIRST_PAINTER_SLOT = FIRST_GAME_SLOT + 5;

/** A value's painter and the slot of each of its colors. */
export type Placed<P = Painter> = {
  readonly painter: P;
  readonly slot: readonly number[];
};

/**
 * The palette's slots past the board's own: each painter's colors, one slot
 * a named color however many painters draw in it; then the lifted surface
 * under a value the cell was dealt, after the painters' so a board without
 * one numbers them as before; then a number's over a dark piece
 * (`COL_NUMBER_LIGHT`) and its two done colors, which only a board with
 * numbers fills. The board's ink is {@link COL_INK}. On an answer on the
 * edges (`onEdges`) each value's painter is an edge painter
 * (`EDGE_VALUE_PAINTERS`), in `edgeByValue`, and `byValue` is empty.
 */
export function fillSlots(
  play: FillPlay,
  onEdges = false,
): {
  painted: ReadonlyMap<string, Placed<Painter | EdgeValuePainter>>;
  byValue: ReadonlyMap<number, Placed>;
  edgeByValue: ReadonlyMap<number, Placed<EdgeValuePainter>>;
  COL_GIVEN: number;
  COL_NUMBER_LIGHT: number;
} {
  const painted = new Map<string, Placed<Painter | EdgeValuePainter>>();
  const byValue = new Map<number, Placed>();
  const edgeByValue = new Map<number, Placed<EdgeValuePainter>>();
  const slotOf = new Map<Color, number>();
  let next = FIRST_PAINTER_SLOT;
  const place = <P extends Painter | EdgeValuePainter>(
    name: string,
    painter: P,
  ): Placed<P> => {
    const got = painted.get(name);
    if (got !== undefined) return got as Placed<P>;
    const slot = painter.colors([0, 0, 0]).map((c) => {
      const known = slotOf.get(c);
      if (known !== undefined) return known;
      slotOf.set(c, next);
      return next++;
    });
    const placed = { painter, slot };
    painted.set(name, placed);
    return placed;
  };
  if (onEdges)
    for (const [v, { paint }] of Object.entries(play.values ?? {}))
      edgeByValue.set(Number(v), place(paint, edgeTextOf(play)[Number(v)]));
  else
    for (const [v, { paint }] of [
      ...Object.entries(play.values ?? {}),
      ...Object.entries(play.given ?? {}),
    ]) {
      if (!(paint in PAINTERS)) throw new Error(`play: no painter ${paint}`);
      byValue.set(Number(v), place(paint, PAINTERS[paint as PainterName]));
    }
  return { painted, byValue, edgeByValue, COL_GIVEN: next, COL_NUMBER_LIGHT: next + 1 };
}

/** Every slot a board's look takes past the board's own, and its colors. */
export interface FillPalette {
  readonly byValue: ReadonlyMap<number, Placed>;
  readonly edgeByValue: ReadonlyMap<number, Placed<EdgeValuePainter>>;
  readonly COL_GIVEN: number;
  readonly COL_NUMBER_LIGHT: number;
  readonly COL_NUMBER_LIGHT_DONE: number;
  readonly COL_NUMBER_DONE: number;
  readonly COL_WALL: number;
  readonly COL_REGION: number;
  readonly COL_DOT: number;
  readonly COL_DOT_LIGHT: number;
  readonly COL_WASH: number;
  readonly COL_HIGHLIGHT: number;
  readonly COL_ENTRY: number;
  readonly COL_PENCIL: number;
  readonly COL_PENCIL_BODY: number;
  readonly COL_DONE: number;
  readonly PENCIL_STYLE: PencilIndicatorStyle;
  colors(background: Color): Color[];
}

/** The palette of a board of `play`, with numbers on cells where `numbered`,
 * a partition drawn as walls and fills where `walled`, and its values on the
 * edges where `onEdges`. */
export function fillPalette(
  play: FillPlay,
  numbered: boolean,
  walled: boolean,
  onEdges: boolean,
): FillPalette {
  const { painted, byValue, edgeByValue, COL_GIVEN, COL_NUMBER_LIGHT } = fillSlots(
    play,
    onEdges,
  );
  const COL_NUMBER_LIGHT_DONE = COL_GIVEN + 2;
  const COL_NUMBER_DONE = COL_GIVEN + 3;
  /** A part's walls and the player's dividers (`play.dividers`), and the
   * first of the fills a part's cells take: after the numbers' slots, where
   * the board fills them, so a palette has no hole. */
  const COL_WALL = numbered ? COL_GIVEN + 4 : COL_GIVEN + 1;
  const COL_REGION = COL_WALL + 1;
  const divided = play.dividers === true;
  /** A dealt cell's dot (`play.dotted`): dark on a light piece, light on a
   * dark one, after the walls and the regions' fills where the board has
   * them, so a palette has no hole. */
  const COL_DOT = walled
    ? COL_REGION + REGION_SURFACES.length
    : divided
      ? COL_REGION
      : COL_WALL;
  const COL_DOT_LIGHT = COL_DOT + 1;
  /** A washed cell's surface (`play.wash`), after the dots' where the board
   * has them. */
  const COL_WASH = play.dotted === true ? COL_DOT + 2 : COL_DOT;
  /** On a board of numbers (`play.numbers`), the selected cell's wash and a
   * number the player typed, after the wash's slot where the board has one. */
  const typed = play.numbers !== undefined;
  const COL_HIGHLIGHT = play.wash !== undefined ? COL_WASH + 1 : COL_WASH;
  const COL_ENTRY = COL_HIGHLIGHT + 1;
  /** On a board that keeps notes (`play.notes`), the notes and the pencil-mode
   * indicator's body. */
  const notes = play.notes === true;
  const COL_PENCIL = COL_ENTRY + 1;
  const COL_PENCIL_BODY = COL_ENTRY + 2;
  /** Where the player marks clues done (`play.done`, a board of numbers'),
   * a done clue's gray, after the notes' slots where the board keeps them. */
  const marksDone = Object.keys(play.done ?? {}).length > 0;
  const COL_DONE = notes ? COL_PENCIL_BODY + 1 : COL_ENTRY + 1;
  const PENCIL_STYLE: PencilIndicatorStyle = {
    background: COL_BACKGROUND,
    body: COL_PENCIL_BODY,
    ink: COL_GRID,
  };

  function colors(bg: Color): Color[] {
    const out = rolePalette(bg);
    out[COL_GRID] = surfaceGrid(bg);
    out[COL_CELL] = cellSurface(bg);
    out[COL_INK] = INK;
    out[COL_ERRTEXT] = ERROR_TEXT;
    out[COL_LABEL] = GRID_DARK;
    out[COL_GIVEN] = givenSurface(bg);
    if (numbered) {
      // Pinned and not ink: it is read against the piece, whose own
      // lightness barely moves between the schemes.
      out[COL_NUMBER_LIGHT] = WHITE;
      // A gray between the piece and its white number in both schemes.
      out[COL_NUMBER_LIGHT_DONE] = GRAY_WASH;
      out[COL_NUMBER_DONE] = CLEAR_MARK;
    }
    if (walled || divided) out[COL_WALL] = INK;
    if (walled) {
      REGION_SURFACES.forEach((fill, k) => {
        out[COL_REGION + k] = fill;
      });
    }
    if (play.dotted === true) {
      // Pinned and not ink or paper: each dot is read against a piece whose
      // own lightness barely moves between the schemes.
      out[COL_DOT] = BLACK;
      out[COL_DOT_LIGHT] = WHITE;
    }
    // The wash step, not plain yellow: a washed cell is a large fill under the
    // pieces and must read as the board, lit, not as an object on it.
    if (play.wash !== undefined) out[COL_WASH] = YELLOW_WASH;
    if (typed) {
      out[COL_HIGHLIGHT] = !walled ? highlightWash(bg) : regionHighlightWash(bg);
      out[COL_ENTRY] = playerEntryColor(bg);
      if (notes) {
        out[COL_PENCIL] = pencilColor(bg);
        out[COL_PENCIL_BODY] = PENCIL_BODY;
      }
      if (marksDone) out[COL_DONE] = clueDoneColor(bg);
    }
    for (const { painter, slot } of painted.values())
      painter.colors(bg).forEach((c, i) => {
        out[slot[i]] = c;
      });
    return out;
  }

  return {
    byValue,
    edgeByValue,
    COL_GIVEN,
    COL_NUMBER_LIGHT,
    COL_NUMBER_LIGHT_DONE,
    COL_NUMBER_DONE,
    COL_WALL,
    COL_REGION,
    COL_DOT,
    COL_DOT_LIGHT,
    COL_WASH,
    COL_HIGHLIGHT,
    COL_ENTRY,
    COL_PENCIL,
    COL_PENCIL_BODY,
    COL_DONE,
    PENCIL_STYLE,
    colors,
  };
}

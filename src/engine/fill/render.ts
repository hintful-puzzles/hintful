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
 * 5. a number dealt on the cell (a cell kind the player does not fill): light
 *    on a dark piece, faint once every cell it counts is decided, and a red
 *    badge where it is broken;
 * 6. the hint's outline round a number's cells, and its circle round the
 *    number;
 * 7. the outline of a mistake Check & Save found;
 * 8. the cursor.
 *
 * After the tiles come the hint's rings and outlines, the ring round a link
 * the hint asks for, and the margins: each line's clue past its end, red
 * where its line breaks it and in the hint's color where a step counts with
 * it, and each line's fixed label (`labels:`) before its start.
 */

import { BLACK, GRAY_WASH, REGION_FILLS, WHITE, YELLOW_WASH } from "../color/colors.ts";
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
import { CELL, type StepMarks, stepMarks } from "../contract/hint-words.ts";
import type { Color, DrawTextOptions, Point, Rect, Size } from "../contract/types.ts";
import { regionFills } from "../generate/region-fill.ts";
import {
  type CellHighlight,
  drawCellBackground,
  HIGHLIGHT_ENTRY,
  HIGHLIGHT_NONE,
  HIGHLIGHT_NOTES,
  highlightFill,
  type NoteSlot,
  noteGrid,
} from "../mechanics/note-taking-cell.ts";
import {
  drawRectCorners,
  drawStrike,
  drawThickRectOutline,
  glyphFont,
} from "../render/draw.ts";
import { hatchPeriod } from "../render/hatch.ts";
import {
  drawMarkSides,
  type HintMarkStyle,
  HintMarks,
  MARK_ALL,
  type MarkBand,
  type MarkCell,
  MarkOutlines,
  ringTextBox,
  ringThickness,
} from "../render/hint-mark.ts";
import { liveErrors } from "../render/live-errors.ts";
import { OverlaySidecar } from "../render/overlay-sidecar.ts";
import {
  type PencilIndicatorStyle,
  pencilIndicatorBox,
  pencilIndicatorReach,
  repaintPencilIndicator,
} from "../render/pencil-indicator.ts";
import {
  JOIN_DOWN,
  JOIN_LEFT,
  JOIN_RIGHT,
  JOIN_UP,
  JOINED_OPEN,
  joinToward,
} from "../render/piece.ts";
import { PAINTERS, type Painter, type PainterName } from "../render/pieces/index.ts";
import { clearOfRises, drawSides, RECEIVED_FROM, topFace } from "../render/raised.ts";
import {
  drawWalledSquare,
  regionWalls,
  walledBoxes,
  wallHalf,
} from "../render/region-walls.ts";
import { NOTHING_TO_CLEAR, type RingClear, ringFits, textBox } from "../render/ring.ts";
import { TileCache } from "../render/tile-cache.ts";
import { sweepStep, type WinTone, winSlot } from "../render/win-wave.ts";
import {
  clueAt,
  hexShift,
  inHexagon,
  type ListClues,
  listAt,
  type Partition,
} from "../solve/describe-runtime.ts";
import { answerOf, type FillMistake, rulesOf } from "./answer.ts";
import { type Clues, type FillBoard, listOf, spaceOf } from "./board.ts";
import {
  cornerCell,
  cornerClueAt,
  cornerKindsOf,
  cornerRange,
  signedText,
} from "./corners.ts";
import { isDone } from "./done.ts";
import { type ClueMax, partKindsOf, tallyOf } from "./game-id.ts";
import { gapClueAt, gapKindsOf } from "./gaps.ts";
import { type FillLink, LINK } from "./marks.ts";
import type { FillMove } from "./notes.ts";
import { numeral, topValue } from "./numbers.ts";
import type { FillPlay, FillUi } from "./play.ts";
import type { SearchedFillModule } from "./search.ts";
import { slotAt, slotClueAt, slotPoint } from "./slots.ts";
import {
  drawTally,
  tallyAcross,
  tallyHeight,
  tallyPlaced,
  wholePieces,
} from "./tally-display.ts";

/** The fills a dealt partition's parts take: the region palette's first four,
 * as Star Battle's. */
const REGION_SURFACES = REGION_FILLS.slice(0, 4);

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
  /** The fixed text before each line's start, by the line's index along its
   * axis. */
  readonly labels?: { readonly start?: (i: number) => string };
}

export type FillFrame<C> = Frame<FillBoard<C>, FillUi, FillMove, unknown, FillMistake>;

export interface FillDrawState {
  readonly tileSize: number;
  /** Each cell's walls (`regionWalls`) and the slot of the fill under it,
   * where the board deals a partition; `null` where it deals none. */
  readonly parts: { readonly walls: Uint8Array; readonly fills: Uint8Array } | null;
  /** Per cell, what it shows and the hint's marks on it. */
  readonly tiles: TileCache;
  /** The notes the hint's step strikes, a lane the tiles' key has no room
   * for: packed on a board that keeps notes alone. */
  readonly struck: OverlaySidecar;
  /** Per line, its clue's error, hint and hatch. */
  readonly clues: TileCache;
  /** Per line, its list's error, hatch, cursor and font. */
  readonly lists: TileCache;
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
  origin(tileSize: number, board: { w: number; h: number }): number;
  /** The space between two cells, 0 on a board without gaps. */
  gap(tileSize: number): number;
  computeSize(
    size: { w: number; h: number; tally?: readonly number[] },
    tileSize: number,
  ): Size;
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
export const COL_INK = FIRST_GAME_SLOT + 2;
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

// --- the note word: a cell's notes, bit `v` a value's ----------------------
/** The selection on the cell takes notes: bit 0, which no value's note is. */
const NOTES_MODE = 1;

/** The values a note word holds, least first. */
const notesIn = (noteWord: number): number[] => {
  const out: number[] = [];
  for (let v = 1; v < 32; v++) if (noteWord & (1 << v)) out.push(v);
  return out;
};

// --- the hint's word -------------------------------------------------------
// The ring and outline sides (`MarkOutlines.packed`) in the low byte.
/** The cell lies on the line a step stripes. */
const HINT_LINE = 1 << 8;
/** The link a step asks for from this cell, a bit a direction: the ring round
 * it lies over the tile, which repaints when it moves. */
const HINT_LINK_SHIFT = 9;
/** The sides of the outline of a number's cells a step reasons from, its
 * block, which lies inside the tile: each number's whole, so two that
 * overlap read as two blocks. */
const BLOCK_SHIFT = 13;
/** The number on the cell is one a step reasons from: circled. */
const HINT_NUMBER = 1 << 17;

// --- the line word: a rule broken along a line -----------------------------
/** A run the rules forbid passes through the cell: a bar along it, which
 * reaches half a tile toward each of its ends, a bit a direction (up, right,
 * down, left). */
const RUN_SHIFT = 0;
/** The cell's row, or its column, is one of two or more the rules forbid
 * together: a bar across the whole line. */
const ACROSS_ROW = 1 << 4;
const ACROSS_COLUMN = 1 << 5;
/** The number on the cell is done: its cells are all decided, and agree. */
const NUMBER_DONE = 1 << 6;
/** The number on the cell is broken: its cells can no longer agree. */
const NUMBER_BROKEN = 1 << 7;
/** The side of a joining piece its other half is on (`JOIN_*`, `piece.ts`). */
const JOIN_SHIFT = 8;
/** The cell is washed (`play.wash`): its surface takes the wash. */
const WASHED = 1 << 12;
/** The cell is washed and the preference leaves its secondary piece out. */
const WASH_HIDES = 1 << 13;
/** The cell's piece hides its number (`play.hides`) and the preference shows
 * it: it is drawn smaller, the piece staying what the cell holds. */
const NUMBER_UNDER = 1 << 14;
/** The cell's running piece runs on, which way the board does not yet say
 * (`JOINED_OPEN`). */
const SHAPE_OPEN = 1 << 15;
/** The clue at a part drawn on the cell, its part's first, broken; and
 * marked done by the player. */
const LABEL_BROKEN = 1 << 16;
const LABEL_DONE = 1 << 17;
/** On a board drawn raised (`play.numbers.raised`) in 3D: the board is, and
 * the cell's value is raised. */
const THREE_D = 1 << 18;
const RAISED = 1 << 19;

/** A raised value drawn over another tile than its own: its tile and its
 * words. */
type RaisedAt = {
  readonly tile: Rect;
  readonly word: number;
  readonly hintWord: number;
  readonly noteWord: number;
};

/** What a cell's tile is drawn from this frame, and whether it changed. */
type TileWords = {
  readonly k: number;
  readonly hk: number;
  readonly lk: number;
  readonly nk: number;
  readonly n: number;
  readonly part: { readonly walls: number; readonly fill: number } | null;
  readonly label: string | null;
  readonly anim: { readonly from: number; readonly frac: number } | null;
  readonly changed: boolean;
};

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

/** A value's painter and the slot of each of its colors. */
type Placed = { readonly painter: Painter; readonly slot: readonly number[] };

/**
 * The palette's slots past the board's own: each painter's colors, one slot
 * a named color however many painters draw in it; then the lifted surface
 * under a value the cell was dealt, after the painters' so a board without
 * one numbers them as before; then a number's over a dark piece
 * (`COL_NUMBER_LIGHT`) and its two done colors, which only a board with
 * numbers fills. The board's ink is {@link COL_INK}.
 */
export function fillSlots(play: FillPlay): {
  painted: ReadonlyMap<PainterName, Placed>;
  byValue: ReadonlyMap<number, Placed>;
  COL_GIVEN: number;
  COL_NUMBER_LIGHT: number;
} {
  const painted = new Map<PainterName, Placed>();
  const byValue = new Map<number, Placed>();
  const slotOf = new Map<Color, number>();
  let next = FIRST_PAINTER_SLOT;
  for (const [v, { paint }] of [
    ...Object.entries(play.values ?? {}),
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
  return { painted, byValue, COL_GIVEN: next, COL_NUMBER_LIGHT: next + 1 };
}

export function fillRender<C extends Clues<C>>(
  module: SearchedFillModule<C> & {
    /** The rules over a dealt partition's parts, which break at the cells
     * they count however those lie. */
    readonly partRules?: readonly string[];
    /** Each clue kind's most value at an element, which a corner's clue of
     * one value is drawn as its sign alone by. */
    readonly clueMax?: ClueMax<C>;
  },
  look: FillLook<C>,
  previewed: (board: FillBoard<C>, ui: FillUi) => FillBoard<C>,
): FillRender<C> {
  const { play, lineClues, labels } = look;
  const lineLists = look.lineLists ?? [];
  const slotClues = look.slotClues ?? [];
  const slotted = slotClues.length > 0;
  const labelStart = labels?.start;
  // The dealt partition drawn as walls and fills: one, as no game deals two.
  const walled = module.deal?.partitions?.[0] as (keyof C & string) | undefined;
  const partRules: readonly string[] = module.partRules ?? [];
  const rules = rulesOf(module);
  const numbers = (module.numbers ?? []) as readonly (keyof C & string)[];
  const clueCells = module.clueCells ?? {};

  /** The number on cell `c`, its kind and its index in the kind's list, or
   * `null`. */
  const numberAt = (
    b: FillBoard<C>,
    c: number,
  ): { kind: keyof C & string; k: number } | null => {
    for (const kind of numbers) {
      const k = listOf(b.dealt, kind).byAt[c];
      if (k >= 0) return { kind, k };
    }
    return null;
  };

  /** The kinds at the dealt partition's parts, each drawn at its part's
   * first cell as its number and its sign. */
  const partKinds = partKindsOf(module.deal) as (keyof C & string)[];
  const labeled = partKinds.length > 0;
  /** The kinds at corners, each drawn on a disc where its four cells meet. */
  const cornerKinds = cornerKindsOf(module.deal) as (keyof C & string)[];
  const cornered = cornerKinds.length > 0;

  /** Each part's clue by its first cell: its kind, its index in the kind's
   * list, and its text. */
  const labelsOf = (
    b: FillBoard<C>,
  ): Map<number, { kind: keyof C & string; k: number; text: string }> => {
    const out = new Map<number, { kind: keyof C & string; k: number; text: string }>();
    if (walled === undefined) return out;
    const { cells } = b.dealt[walled] as Partition;
    for (const kind of partKinds) {
      const list = listOf(b.dealt, kind);
      list.at.forEach((r, k) => {
        out.set(cells[r][0], {
          kind,
          k,
          text: signedText(play.signs?.[kind] ?? null, list.v[k], 0, Infinity),
        });
      });
    }
    return out;
  };

  /** Each number's state on the board: done, broken or neither, by its
   * cell. A number is broken where the rules say its cells can no longer
   * agree with it, and done where they are all decided and do. */
  function numberStates(b: FillBoard<C>): Map<number, number> {
    const out = new Map<number, number>();
    if (numbers.length === 0) return out;
    const broken = liveErrors(rules, b).clues;
    const sp = spaceOf(module, b);
    for (const kind of numbers) {
      const list = listOf(b.dealt, kind);
      const bad = new Set(broken.get(kind) ?? []);
      const cellsOf = clueCells[kind];
      list.at.forEach((c, k) => {
        if (bad.has(k)) out.set(c, NUMBER_BROKEN);
        else if (cellsOf?.(sp, c).every((d) => b.values[d] !== 0))
          out.set(c, NUMBER_DONE);
      });
    }
    return out;
  }

  /** Each cell's walls and the slot of its part's fill, where the board
   * deals a partition. */
  const partsOf = (b: FillBoard<C>): FillDrawState["parts"] => {
    if (walled === undefined) return null;
    const { of } = b.dealt[walled] as Partition;
    const fills = regionFills(of, b.w, REGION_SURFACES.length);
    return {
      walls: regionWalls(b.w, b.h, of),
      fills: Uint8Array.from(of, (r) => COL_REGION + fills[r]),
    };
  };

  /** Each cell's join, the side its other half is on: a joining piece and
   * one beside it alike, each beside no other. A run of three stays apart.
   * A piece that runs (`Painter.runs`) joins its line as {@link runJoins}
   * reads it. */
  const joinsOf = (b: FillBoard<C>): Uint8Array => {
    const out = new Uint8Array(b.values.length);
    const joins = (v: number) => byValue.get(v)?.painter.joins === true;
    const runs = (v: number) => byValue.get(v)?.painter.runs === true;
    const keys = [...byValue.keys()];
    if (!keys.some(joins) && !keys.some(runs)) return out;
    const sp = spaceOf(module, b);
    const alike = (c: number) => sp.adj4[c].filter((d) => b.values[d] === b.values[c]);
    const answer =
      keys.some(runs) && b.fixed.some((f) => f) ? answerOf(module, b) : null;
    // Once the tally's pieces are all placed, an open square holds none.
    const full =
      tallied !== null &&
      tallyPlaced(b.values, tallied.value, tallyCounts(b, tallied.kind, tallied.count));
    for (const c of sp.cells) {
      if (runs(b.values[c])) {
        out[c] = runJoins(b, answer, c, full);
        continue;
      }
      if (!joins(b.values[c])) continue;
      const mine = alike(c);
      if (mine.length === 1 && alike(mine[0]).length === 1)
        out[c] = joinToward(b.w, c, mine[0]);
    }
    return out;
  };

  /**
   * A running piece's sides, as `joined` (`Painter.runs`): those it runs on
   * to, or `JOINED_OPEN` where the board does not yet say which way it runs.
   * A cell the puzzle gave runs as the answer does, so its shape is the one
   * it was given. Any other is whole where every side is shut (the edge, a
   * decided other value, or an open square where `openShut`), runs on through
   * where it is alike on both sides of a line, and ends where it is shut on
   * one side and alike on the other.
   */
  const runJoins = (
    b: FillBoard<C>,
    answer: Uint8Array | null,
    c: number,
    openShut: boolean,
  ): number => {
    const { w, h } = b;
    const [x, y] = [c % w, Math.floor(c / w)];
    const v = b.values[c];
    const at = (d: number): number | null => {
      const [dx, dy] = DIRS[d];
      const [nx, ny] = [x + dx, y + dy];
      return nx < 0 || ny < 0 || nx >= w || ny >= h ? null : ny * w + nx;
    };
    const sides = [JOIN_UP, JOIN_RIGHT, JOIN_DOWN, JOIN_LEFT];
    if (b.fixed[c] && answer !== null)
      return sides.reduce((j, side, d) => {
        const n = at(d);
        return n !== null && answer[n] === answer[c] ? j | side : j;
      }, 0);
    const alike = sides.map((_, d) => {
      const n = at(d);
      return n !== null && b.values[n] === v;
    });
    const shut = sides.map((_, d) => {
      const n = at(d);
      return n === null || (b.values[n] !== v && (b.values[n] !== 0 || openShut));
    });
    if (shut.every((s) => s)) return 0;
    for (const [a, z] of [
      [0, 2],
      [1, 3],
    ]) {
      if (alike[a] && alike[z]) return sides[a] | sides[z];
      if (shut[a] && alike[z]) return sides[z];
      if (shut[z] && alike[a]) return sides[a];
    }
    return JOINED_OPEN;
  };

  /** Each cell's wash bits: `WASHED` on a cell the board washes that was not
   * dealt, and `WASH_HIDES` too where it holds the secondary value and the
   * preference leaves that piece out. */
  const washesOf = (b: FillBoard<C>, ui: FillUi): Uint16Array => {
    const out = new Uint16Array(b.values.length);
    const { washed } = module;
    if (washed === undefined) return out;
    const sp = spaceOf(module, b);
    for (const c of sp.cells) {
      if (b.fixed[c] || !washed(b.values, sp, b.dealt, c)) continue;
      out[c] = WASHED;
      if (!ui.washedMarks && b.values[c] === play.secondary) out[c] |= WASH_HIDES;
    }
    return out;
  };

  /** The numbers not yet done, of those that can be. */
  const numbersLeft = (b: FillBoard<C>): number => {
    const states = numberStates(b);
    let left = 0;
    for (const kind of numbers)
      if (clueCells[kind] !== undefined)
        for (const c of listOf(b.dealt, kind).at)
          if (states.get(c) !== NUMBER_DONE) left++;
    return left;
  };

  /** Where a number on a tile at `(tx, ty)` is written, and its font: three
   * fifths of the tile, and a pixel less on a tile of 6 px or under, where a
   * ring fits between a 3 px number and its neighbors' by no step of its
   * search (measured 2026-10-28, `keep-rings-off-a-cells-numbers`). */
  const numberText = (ts: number, tx: number, ty: number) => ({
    origin: { x: tx + Math.floor(ts / 2), y: ty + Math.floor(ts / 2) },
    options: glyphFont(Math.floor((ts * 3) / 5) - (ts <= 6 ? 1 : 0)),
  });

  const { painted, byValue, COL_GIVEN, COL_NUMBER_LIGHT } = fillSlots(play);
  const COL_NUMBER_LIGHT_DONE = COL_GIVEN + 2;
  const COL_NUMBER_DONE = COL_GIVEN + 3;
  /** A part's walls, and the first of the fills its cells take: after the
   * numbers' slots, where the board fills them, so a palette has no hole. */
  const COL_WALL = numbers.length > 0 ? COL_GIVEN + 4 : COL_GIVEN + 1;
  const COL_REGION = COL_WALL + 1;
  /** A dealt cell's dot (`play.dotted`): dark on a light piece, light on a
   * dark one, after the walls and the regions' fills where the board has
   * them, so a palette has no hole. */
  const COL_DOT = walled === undefined ? COL_WALL : COL_REGION + REGION_SURFACES.length;
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

  /** The tiles before a board's lines its lists take, upstream pattern.c's
   * `TLBORDER`: a line of `d` holds at most about `d / 2` runs, which stack
   * a fifth as deep with room to spare. One depth serves both axes, the
   * longer side's, so the board has one origin. */
  const depthOf = (b: { w: number; h: number }): number =>
    lineLists.length === 0 ? 0 : Math.floor(Math.max(b.w, b.h) / 5) + 2;
  /** The board being drawn's list depth and width: every drawing call is
   * within a redraw, which sets them from its board first. */
  let depth = 0;
  let boardW = 0;
  /** Where the board draws its values raised (`play.numbers.raised`),
   * whether the board being drawn does (the appearance preference) and its
   * largest value, which stands a fixed share of a tile tall. */
  const raises = play.numbers?.raised === true;
  let threeD = false;
  let top = 1;
  /** Cell `i`'s number as drawn, holding `v`: -1 where it has none, or its
   * piece hides it (`play.hides`) and the preference does not show it. */
  const shownNumber = (
    state: FillBoard<C>,
    i: number,
    v: number,
    show: boolean,
  ): number => {
    const at = numberAt(state, i);
    if (at === null || (v === play.hides?.value && !show)) return -1;
    return listOf(state.dealt, at.kind).v[at.k];
  };
  // Where a press off the grid shows the hidden numbers, the board keeps
  // half a tile round it to press (upstream singles.c's BORDER); where it
  // keeps notes, the pencil-mode indicator's room at its top right.
  const rim = (ts: number): number =>
    notes
      ? Math.max(Math.floor(ts / 2), pencilIndicatorReach(ts))
      : play.hides === undefined
        ? 1
        : Math.floor(ts / 2);
  // A board with clues at slots keeps a tile's margin round it for them, and
  // an eighth more, upstream towers.c's BORDER, or the rim where that is wider.
  const slotMargin = (ts: number): number => Math.max(ts + Math.floor(ts / 8), rim(ts));
  const startAt = (ts: number, d: number): number =>
    labelStart !== undefined
      ? ts
      : d > 0
        ? d * ts + Math.floor(ts / 4)
        : slotted
          ? slotMargin(ts)
          : rim(ts);
  const start = (ts: number): number => startAt(ts, depth);
  const end = (ts: number): number =>
    lineClues.length > 0 ? ts + 2 : slotted ? slotMargin(ts) : rim(ts);
  // A board with clues at edges has a gap between every two cells to draw
  // them in, half a tile wide (upstream unequal.c's).
  const gapKinds = gapKindsOf<C>(play);
  const gapped = gapKinds.length > 0;
  const gapOf = (ts: number): number => (gapped ? Math.floor(ts / 2) : 0);
  /** From one cell's left to the next's. */
  const pitch = (ts: number): number => ts + gapOf(ts);
  const coord = (n: number, ts: number): number => n * pitch(ts) + start(ts);
  // A hexagon's rows are drawn sheared, each half a tile right of the one
  // above, its store's corners not at all.
  const hexagon = module.hexagon !== undefined;
  /** The left of cell `(x, y)` on a board `h` high. */
  const cellX = (x: number, y: number, h: number, ts: number): number =>
    coord(x, ts) + (hexagon ? hexShift(y, h, ts) : 0);
  const drawn = (b: { w: number; h: number }, x: number, y: number): boolean =>
    !hexagon || inHexagon(b.w, b.h, x, y);
  /** Which outlined cells share a side: on a hexagon only a row's, since a
   * cell overlaps those above and below it by half; across a gap none. */
  const sides = hexagon
    ? { joinEvidence: (a: { y: number }, b: { y: number }) => a.y === b.y }
    : gapped
      ? { joinEvidence: () => false }
      : {};
  /** The tile size a board is drawn at: even on a hexagon, so its rows shift
   * by exactly half a tile. */
  const tileOf = (ts: number): number => (hexagon ? ts & ~1 : ts);

  function colors(bg: Color): Color[] {
    const out = rolePalette(bg);
    out[COL_GRID] = surfaceGrid(bg);
    out[COL_CELL] = cellSurface(bg);
    out[COL_INK] = INK;
    out[COL_ERRTEXT] = ERROR_TEXT;
    out[COL_LABEL] = GRID_DARK;
    out[COL_GIVEN] = givenSurface(bg);
    if (numbers.length > 0) {
      // Pinned and not ink: it is read against the piece, whose own
      // lightness barely moves between the schemes.
      out[COL_NUMBER_LIGHT] = WHITE;
      // A gray between the piece and its white number in both schemes.
      out[COL_NUMBER_LIGHT_DONE] = GRAY_WASH;
      out[COL_NUMBER_DONE] = CLEAR_MARK;
    }
    if (walled !== undefined) {
      out[COL_WALL] = INK;
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
      out[COL_HIGHLIGHT] =
        walled === undefined ? highlightWash(bg) : regionHighlightWash(bg);
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

  /** The clue of line `k`, the first of the line clue kinds it has, or
   * `-1`. */
  const lineClue = (b: FillBoard<C>, k: number): number => {
    for (const kind of lineClues) {
      const v = clueAt(listOf(b.dealt, kind), k);
      if (v >= 0) return v;
    }
    return -1;
  };

  /** The cell a link from `c` names: the clue's own. */
  const linkClues = play.links === undefined ? null : (play.links.clue as keyof C);
  const linkTo = (b: FillBoard<C>, c: number): number =>
    linkClues === null || b.mark[c] < 0 ? -1 : listOf(b.dealt, linkClues).at[b.mark[c]];

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

  /** A cell's selection as drawn: a board of numbers shows it as the
   * note-taking cell's highlight, where a board of buttons draws the
   * cursor's corners. */
  const highlightOf = (word: number, noteWord: number): CellHighlight =>
    (word >> TONE_SHIFT) & 3 || !typed || (word & CURSOR) === 0
      ? HIGHLIGHT_NONE
      : noteWord & NOTES_MODE
        ? HIGHLIGHT_NOTES
        : HIGHLIGHT_ENTRY;

  /**
   * The raised value of the cell whose tile is `tile`: its sides and its top,
   * in the cell's surface and its selection's wash, edged in ink; on the top
   * its numeral, the hatch of a striped line and Check & Save's outline. The
   * clip is the caller's: a neighbor's tile, where its top reaches in.
   */
  function paintRaised(
    dr: GameDrawing,
    tile: Rect,
    { word, hintWord, noteWord }: Omit<RaisedAt, "tile">,
  ): void {
    const ts = tile.w;
    const v = word & 0xff;
    const face = topFace(tile, v, top);
    const tone = ((word >> TONE_SHIFT) & 3) as WinTone;
    const highlight = highlightOf(word, noteWord);
    const surface = tone ? winSlot(tone) : word & FIXED ? COL_GIVEN : COL_CELL;
    drawSides(
      dr,
      tile,
      face,
      highlightFill(highlight, COL_HIGHLIGHT, surface),
      COL_INK,
    );
    drawCellBackground(dr, face, highlight, COL_HIGHLIGHT, surface);
    if (hintWord & HINT_LINE) dr.drawHatch(face, hatchPeriod(ts));
    dr.drawPolygon(
      [
        { x: face.x, y: face.y - 1 },
        { x: face.x + ts, y: face.y - 1 },
        { x: face.x + ts, y: face.y + ts - 1 },
        { x: face.x, y: face.y + ts - 1 },
      ],
      -1,
      COL_INK,
    );
    const { origin, options } = numberText(ts, face.x, face.y);
    const ink = word & FIXED ? COL_INK : word & ERR_AT ? COL_ERROR : COL_ENTRY;
    dr.drawText(origin, options, ink, numeral(v));
    if (word & MISTAKE) drawMistake(dr, ts, face.x, face.y);
  }

  /** Check & Save's mark on a cell it found wrong, whose face is at
   * `(tx, ty)`: a red outline inset from its edges. */
  function drawMistake(dr: GameDrawing, ts: number, tx: number, ty: number): void {
    const thick = Math.max(1, Math.floor(ts / 16));
    const inset = Math.max(2, Math.floor(ts / 8));
    const span = ts - 2 * inset;
    drawThickRectOutline(dr, tx + inset, ty + inset, span, span, thick, COL_ERROR);
  }

  function drawTile(
    dr: GameDrawing,
    ts: number,
    // The cell, on a board `h` high.
    [x, y, h]: readonly [number, number, number],
    word: number,
    hintWord: number,
    lineWord: number,
    // On a board that keeps notes, the cell's notes, bit `v` a value's, and
    // `NOTES_MODE` where the selection takes notes.
    noteWord: number,
    // The number on the cell, `-1` where it has none.
    n: number,
    // The cell's walls and fill, where the board deals a partition.
    part: { readonly walls: number; readonly fill: number } | null,
    // The notes a hint's step strikes from the cell, bit `v` a value's.
    struck: number,
    // The clue of the part this is the first cell of, as written; `null`
    // where it is none's first.
    label: string | null,
    // A piece placed or taken away a moment ago: the value it grows from or
    // shrinks into, and how far it has got, 0 to 1.
    // The raised values of the cells next door that reach into this tile,
    // painted over it in turn.
    spill: readonly RaisedAt[],
    anim: { readonly from: number; readonly frac: number } | null = null,
  ): void {
    const v = word & 0xff;
    const tx = cellX(x, y, h, ts);
    const ty = coord(y, ts);
    const tile = { x: tx, y: ty, w: ts, h: ts };
    const tone = ((word >> TONE_SHIFT) & 3) as WinTone;
    const piece = v === 0 || lineWord & WASH_HIDES ? undefined : byValue.get(v);
    const highlight = highlightOf(word, noteWord);
    const ground = tone
      ? winSlot(tone)
      : piece !== undefined && piece.painter.surface !== null
        ? piece.slot[piece.painter.surface]
        : word & FIXED
          ? COL_GIVEN
          : lineWord & WASHED
            ? COL_WASH
            : (part?.fill ?? COL_CELL);
    // Under the content, so the piece stays whole.
    const lay = (surface: Rect) => {
      drawCellBackground(dr, surface, highlight, COL_HIGHLIGHT, ground);
      if (hintWord & HINT_LINE) dr.drawHatch(surface, hatchPeriod(ts));
    };

    dr.clip(tile);
    if (part === null) {
      dr.drawRect(tile, COL_GRID);
      // A board of lists doubles every fifth line inside it, to count along
      // a list by (upstream pattern.c's `grid_square`).
      const ruled = (i: number, n: number, at: 0 | 4) =>
        depth > 0 && i % 5 === at && (at === 0 ? i > 0 : i < n - 1) ? 1 : 0;
      const [l, t] = [ruled(x, boardW, 0), ruled(y, h, 0)];
      const [r, b] = [ruled(x, boardW, 4), ruled(y, h, 4)];
      lay({ x: tx + 1 + l, y: ty + 1 + t, w: ts - 1 - l - r, h: ts - 1 - t - b });
    } else
      drawWalledSquare(
        dr,
        ts,
        tile,
        part.walls,
        { grid: COL_GRID, wall: COL_WALL },
        lay,
      );
    // A piece taken away shrinks into its cell; one placed grows alone, since
    // two pieces in one cell read as neither.
    const shrinking = anim !== null && v === 0 ? byValue.get(anim.from) : undefined;
    const occupied = n >= 0;
    if (shrinking !== undefined && anim !== null)
      shrinking.painter.paint(dr, tile, shrinking.slot, false, 1 - anim.frac, occupied);
    if (word & FIXED && piece?.painter.given !== undefined)
      piece.painter.given(dr, tile, piece.slot);
    else
      piece?.painter.paint(
        dr,
        tile,
        piece.slot,
        (word & ERR_AT) !== 0,
        anim?.frac ?? 1,
        occupied,
        ((lineWord >> JOIN_SHIFT) & 0xf) | (lineWord & SHAPE_OPEN ? JOINED_OPEN : 0),
      );
    // A part's clue, in ink, red where it breaks, and else gray where the
    // player marked it done.
    if (label !== null) {
      const { origin, options } = labelText(ts, [x, y, h], part?.walls ?? null, label);
      const ink =
        lineWord & LABEL_BROKEN
          ? COL_ERROR
          : lineWord & LABEL_DONE
            ? COL_DONE
            : COL_INK;
      dr.drawText(origin, options, ink, label);
    }
    // A board of numbers draws each value as its numeral: a given in ink, the
    // player's in the entry color, red where a rule breaks at the cell.
    // A raised value stands on the cell, its numeral on its top.
    const raised = (lineWord & RAISED) !== 0;
    if (raised) paintRaised(dr, tile, { word, hintWord, noteWord });
    else if (typed && v !== 0) {
      const { origin, options } = valueText(ts, [x, y, h], part?.walls ?? null, tx, ty);
      const ink = word & FIXED ? COL_INK : word & ERR_AT ? COL_ERROR : COL_ENTRY;
      dr.drawText(origin, options, ink, numeral(v));
    }
    // An open cell's notes, in a grid within it, each the hint strikes
    // crossed through in its own color, so it still reads as the player's.
    if (v === 0) {
      const shown = notesIn(noteWord);
      noteSlots(ts, [x, y, h], part?.walls ?? null, shown.length).forEach(
        ({ origin, options }, j) => {
          dr.drawText(origin, options, COL_PENCIL, numeral(shown[j]));
          if (struck & (1 << shown[j]))
            drawStrike(dr, origin, options.size, COL_PENCIL, tile);
        },
      );
    }
    // A broken piece's badge takes the middle, where the dot would be.
    if (
      play.dotted === true &&
      piece !== undefined &&
      word & FIXED &&
      !(word & ERR_AT)
    ) {
      const dot = piece.painter.dark === true ? COL_DOT_LIGHT : COL_DOT;
      const at = { x: tx + Math.floor(ts / 2), y: ty + Math.floor(ts / 2) };
      dr.drawCircle(at, Math.floor(ts / 7), dot, dot);
    }

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

    // A number over whatever its cell holds: light over a dark piece; faint
    // once done; and broken, a badge on a decided cell, where red ink on a
    // piece would differ in hue with little of lightness in the dark scheme.
    if (n >= 0) {
      const full = numberText(ts, tx, ty);
      const text =
        lineWord & NUMBER_UNDER
          ? {
              ...full,
              options: {
                ...full.options,
                size: Math.floor((full.options.size * 3) / 4),
              },
            }
          : full;
      const dark = piece?.painter.dark === true;
      let color = dark ? COL_NUMBER_LIGHT : COL_INK;
      if (lineWord & NUMBER_BROKEN) {
        if (piece !== undefined)
          dr.drawCircle(text.origin, ts * 0.32, COL_ERROR, COL_ERROR);
        color = piece !== undefined ? COL_ERRTEXT : COL_ERROR;
      } else if (lineWord & NUMBER_DONE)
        color = dark ? COL_NUMBER_LIGHT_DONE : COL_NUMBER_DONE;
      dr.drawText(text.origin, text.options, color, String(n));
    }
    // The block of a number a step reasons from, inside the tile so its own
    // repaint undoes it, and the number circled, clear of the tile's edge so
    // it shows on a cell the step also rings. On a dark piece the circle
    // takes the number's own ink: the evidence color against it is a
    // difference of hue with little of lightness.
    const band = markBand(ts, [x, y, h], part?.walls ?? null);
    drawMarkSides(dr, band, (hintWord >> BLOCK_SHIFT) & MARK_ALL, COL_HINT_OUTLINE);
    if (hintWord & HINT_NUMBER) {
      const center = numberText(ts, tx, ty).origin;
      for (let i = 0; i < band.inner; i++)
        dr.drawCircle(
          center,
          ts * 0.33 - i,
          -1,
          piece?.painter.dark ? COL_NUMBER_LIGHT : COL_HINT_OUTLINE,
        );
    }

    if (word & MISTAKE && !raised) drawMistake(dr, ts, tx, ty);
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

    for (const s of spill) paintRaised(dr, s.tile, s);
    dr.unclip();
    dr.drawUpdate(
      part === null ? { x: tx + 1, y: ty + 1, w: ts - 1, h: ts - 1 } : tile,
    );
  }

  /** Where a hint mark sits round cell `(x, y)`: inside its own box, over
   * the grid line it owns, so a cell whose marks change repaints itself and
   * takes the old ones with it. On a walled cell, inside its walls: a band on
   * the line between two cells would read as a wall. */
  const markBand = (
    ts: number,
    [x, y, h]: readonly [number, number, number],
    walls: number | null,
  ): MarkBand => {
    const box = { x: cellX(x, y, h, ts), y: coord(y, ts), w: ts, h: ts };
    return {
      box: walls === null ? box : walledBoxes(ts, box.x, box.y, walls)[1],
      outer: 0,
      inner: Math.max(2, ts >> 4),
    };
  };

  /** The canvas a board `w` by `h` takes at tile size `ts`, with the tally of
   * `counts` beneath it where it has one, its pieces as long as they are. */
  const canvasOf = (
    { w, h }: { readonly w: number; readonly h: number },
    counts: readonly number[] | null,
    ts: number,
  ): Size => {
    const from = startAt(ts, depthOf({ w, h }));
    // The cells, and the gaps between them.
    const across = (n: number): number => pitch(ts) * n - gapOf(ts);
    return {
      w: Math.max(
        from + end(ts) + across(w) + (hexagon ? ts >> 1 : 0),
        counts === null ? 0 : from + Math.ceil(tallyAcross(counts, w) * ts),
      ),
      h:
        from +
        end(ts) +
        across(h) +
        (counts === null ? 0 : Math.ceil(tallyHeight(counts, w) * ts)),
    };
  };

  /** A part's clue's font: a quarter of the tile, from the left. */
  const labelFont = (ts: number) =>
    ({
      align: "left",
      baseline: "alphabetic",
      fontType: "variable",
      size: Math.floor(ts / 4),
    }) as const;

  /** Where a part's clue `text` is written in cell `(x, y)`: the top left
   * of the box a hint's ring goes round (upstream keen.c's). */
  const labelText = (
    ts: number,
    at: readonly [number, number, number],
    walls: number | null,
    text: string,
  ) => {
    const band = markBand(ts, at, walls);
    const area = ringTextBox(band);
    const place = (size: number) => {
      const options = { ...labelFont(ts), size };
      const ink = textBox({ x: 0, y: 0 }, options, text);
      return { origin: { x: area.x - ink.x, y: area.y - ink.y }, options };
    };
    // Every glyph a clue says inks one width, so its length decides its size.
    const key = `${ts}:${walls}:${text.length}`;
    let size = labelSizes.get(key);
    if (size === undefined) {
      size = labelFont(ts).size;
      while (size > 1 && !ringStepsRound(ts, at, walls, band, place(size), text))
        size--;
      labelSizes.set(key, size);
    }
    return place(size);
  };

  /** The most notes a cell's ring is fitted round under a clue: the digits,
   * as no board of clues at parts is wider than nine. */
  const NOTES_CHECKED = 9;

  /** Each clue's size, by tile size, walls and length: see {@link labelText}. */
  const labelSizes = new Map<string, number>();

  /** Whether a hint's ring on cell `(x, y)`, centered on it, steps round its
   * clue set at `t`: on the empty cell, and round every count of notes
   * below the clue. A clue of four characters at a small tile, and of five at
   * any, is set smaller until one does. */
  const ringStepsRound = (
    ts: number,
    at: readonly [number, number, number],
    walls: number | null,
    band: MarkBand,
    t: { origin: Point; options: DrawTextOptions },
    text: string,
  ): boolean => {
    const avoid = [textBox(t.origin, t.options, text)];
    const thickness = ringThickness(band);
    const room = { ...band.box };
    for (let count = 0; count <= NOTES_CHECKED; count++) {
      const enclose = noteSlots(ts, at, walls, count).map(({ origin, options }) =>
        textBox(origin, options, "8"),
      );
      if (ringFits(band.box, { enclose, avoid }, thickness, room, true) === null)
        return false;
    }
    return true;
  };

  /** On a board of clues at parts, the part of cell `(x, y)` a hint's ring
   * goes round below a clue's line, in every cell, so a clue neither shrinks
   * what a cell holds nor moves it off its neighbors' rows. */
  const belowClue = (
    ts: number,
    at: readonly [number, number, number],
    walls: number | null,
  ) => {
    const area = ringTextBox(markBand(ts, at, walls));
    // A clue's digits and signs ink one height whatever they say.
    const line = textBox({ x: 0, y: 0 }, labelFont(ts), "0");
    const top = area.y + line.h + Math.max(1, Math.floor(ts / 32));
    return { ...area, y: top, h: area.y + area.h - top };
  };

  /** Where `count` notes go in cell `(x, y)`, in order: the box a hint's
   * ring goes round, so it encloses them all, below a clue's line on a board
   * of clues at parts. */
  const noteSlots = (
    ts: number,
    at: readonly [number, number, number],
    walls: number | null,
    count: number,
  ): NoteSlot[] => {
    const band = markBand(ts, at, walls);
    // In 3D, clear of where the tallest value next door reaches in.
    const area = labeled
      ? belowClue(ts, at, walls)
      : threeD
        ? ringTextBox(band, { within: clearOfRises(band.box, top) })
        : ringTextBox(band);
    return noteGrid(area, count);
  };

  /** Where a typed value goes in cell `(x, y)`, its tile at `(tx, ty)`: the
   * tile's middle; on a board of clues at parts, the middle of the cell below
   * a clue's line, at half a tile as upstream keen.c's, so a clue never sits
   * under the value. */
  const valueText = (
    ts: number,
    at: readonly [number, number, number],
    walls: number | null,
    tx: number,
    ty: number,
  ) => {
    if (!labeled) return numberText(ts, tx, ty);
    const area = belowClue(ts, at, walls);
    return {
      origin: { x: tx + Math.floor(ts / 2), y: Math.floor(area.y + area.h / 2) },
      options: glyphFont(Math.floor(ts / 2)),
    };
  };

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
    // Its width alone, which walls do not change.
    const band = markBand(ts, [x, y, 0], null);
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
    // Two cells a rule breaks at together, but a part's: the two crosses
    // that leave a region no room are no pair.
    const pairs = [...errors.byRule].flatMap(([rule, list]) =>
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
    for (const [rule, list] of errors.byRule)
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
    // A broken number is drawn as a badge (`numberStates`), not on the piece;
    // a part's clue red at its part's first cell.
    for (const [kind, broken] of errors.clues)
      for (const q of broken) {
        const at = listOf(state.dealt, kind as keyof C).at[q];
        if (lineClues.includes(kind as keyof C) || lineLists.includes(kind as keyof C))
          lineErrors.add(at);
        else if (slotClues.includes(kind as keyof C)) slotErrors.add(at);
        else if (cornerKinds.includes(kind as keyof C & string)) cornerErrors.add(at);
        else if (play.gaps?.[kind] !== undefined) gapErrors.add(at);
        else if (partKinds.includes(kind as keyof C & string))
          lineWord[(state.dealt[walled as keyof C] as Partition).cells[at][0]] |=
            LABEL_BROKEN;
        else if (!numbers.includes(kind as keyof C & string)) word[at] |= ERR_AT;
      }
    return { word, lineWord, lineErrors, gapErrors, slotErrors, cornerErrors };
  }

  /**
   * Each corner's clue, on a disc a third of a tile across where its four
   * cells meet, its rim and text red where it breaks. A disc lies over its
   * four tiles and the hint's marks on them, so it is drawn after both:
   * where its own look moved, where a tile under it repainted, or where a
   * mark, drawn every frame, lies on a cell under it.
   */
  function drawCorners(
    dr: GameDrawing,
    ds: FillDrawState,
    b: FillBoard<C>,
    broken: ReadonlySet<number>,
    tiles: readonly (TileWords | null)[],
  ): void {
    if (!cornered) return;
    const ts = ds.tileSize;
    const { w } = b;
    const sp = spaceOf(module, b);
    const r = Math.floor(ts / 3);
    for (const k of sp.corners) {
      const clue = cornerClueAt(cornerKinds, b, k);
      const err = broken.has(k);
      const key =
        clue === null
          ? 0
          : 1 | (err ? 2 : 0) | (cornerKinds.indexOf(clue.kind) << 2) | (clue.v << 8);
      const under = sp.cornerCells[k].map((c) => tiles[c]);
      const touched = under.some((t) => t !== null && (t.changed || t.hk !== 0));
      if (!ds.corners.changed(k, key) && !touched) continue;
      if (clue === null) continue;
      const { x, y } = cornerCell(w, k);
      const at = { x: coord(x + 1, ts), y: coord(y + 1, ts) };
      const ink = err ? COL_ERROR : COL_INK;
      dr.drawCircle(at, r, COL_GIVEN, ink);
      const { deal, clueMax } = module;
      if (deal === undefined || clueMax === undefined)
        throw new Error("render: a clue at a corner on a board dealt by no deal");
      const [least, most] = cornerRange(deal, clueMax, clue.kind, sp, b.dealt);
      const text = signedText(play.signs?.[clue.kind] ?? null, clue.v, least, most);
      dr.drawText(at, glyphFont(r), ink, text);
      dr.drawUpdate({ x: at.x - r, y: at.y - r, w: 2 * r + 1, h: 2 * r + 1 });
    }
  }

  /**
   * Each slot's clue, in the margin beyond its line's end: red where the rules
   * break it, gray where the player marks it done, hatched where a step
   * stripes its line, and outlined where a step reasons from it.
   */
  function drawSlots(
    dr: GameDrawing,
    ds: FillDrawState,
    b: FillBoard<C>,
    slotErrors: ReadonlySet<number>,
    stripedLine: number,
    marks: StepMarks,
    raisedInto: (x: number, y: number) => readonly RaisedAt[],
  ): void {
    if (!slotted) return;
    const ts = ds.tileSize;
    const { w, h } = b;
    const sp = spaceOf(module, b);
    // A step names a slot by the square it lies in, off the grid.
    const outlined = new Set(
      marks.of("outline", CELL).map((c) => slotAt(w, h, c.x, c.y)),
    );
    for (const s of sp.slots) {
      const clue = slotClueAt(slotClues, b, s);
      const p = slotPoint(w, h, s);
      // The slot's line, as `stripedLine` numbers it: the rows, then the
      // columns.
      const line = p.y >= 0 && p.y < h ? p.y : h + p.x;
      const err = slotErrors.has(s);
      const done = clue !== null && isDone(b, clue.kind, clue.k);
      const key =
        (err ? 1 : 0) |
        (stripedLine === line ? 2 : 0) |
        (done ? 4 : 0) |
        (outlined.has(s) ? 8 : 0);
      if (!ds.slots.changed(s, key)) continue;
      const box = { x: coord(p.x, ts), y: coord(p.y, ts), w: ts, h: ts };
      dr.drawRect(box, COL_BACKGROUND);
      if (key & 2) dr.drawHatch(box, hatchPeriod(ts));
      // The grid's frame runs down the first column of a slot right of the
      // board and along the first row of one below it.
      const frame = ds.parts === null ? COL_GRID : COL_WALL;
      if (p.x === w) dr.drawRect({ x: box.x, y: box.y, w: 1, h: ts }, frame);
      if (p.y === h) dr.drawRect({ x: box.x, y: box.y, w: ts, h: 1 }, frame);
      if (clue !== null)
        dr.drawText(
          { x: box.x + Math.floor(ts / 2), y: box.y + Math.floor(ts / 2) },
          glyphFont(Math.floor(ts / 2)),
          err ? COL_ERROR : done ? COL_DONE : COL_INK,
          String(clue.v),
        );
      if (key & 8) {
        const thick = Math.max(2, Math.floor(ts / 16));
        drawThickRectOutline(dr, box.x, box.y, ts, ts, thick, COL_HINT_OUTLINE);
      }
      // The raised values of the top row and right column reach in over it.
      const raised = raisedInto(p.x, p.y);
      if (raised.length > 0) {
        dr.clip(box);
        for (const r of raised) paintRaised(dr, r.tile, r);
        dr.unclip();
      }
      dr.drawUpdate(box);
    }
  }

  /** The list of line `k`, the first of the list kinds that has one: empty
   * where none does. */
  const listOfLine = (b: FillBoard<C>, k: number): ArrayLike<number> => {
    for (const kind of lineLists) {
      const l = listAt(b.dealt[kind] as ListClues, k);
      if (l !== null) return l;
    }
    return [];
  };

  /**
   * Each line's list, before its start: a row's on one line, right against
   * the board, and a column's stacked upward from it, spread over the margin
   * where it is short (upstream pattern.c's `draw_numbers`). A list is red
   * where its line breaks it, striped with its line where a step stripes
   * that, and in the cursor's color where the cursor is on its line, so the
   * cursor's row and column are found from the margin.
   */
  function drawLists(
    dr: GameDrawing,
    ds: FillDrawState,
    b: FillBoard<C>,
    at: {
      readonly stripedLine: number;
      readonly lineErrors: ReadonlySet<number>;
      readonly cx: number;
      readonly cy: number;
    },
  ): void {
    const ts = ds.tileSize;
    const { w, h } = b;
    const from = start(ts);
    const half = Math.floor(ts / 2);
    // Upstream's font: smaller where a column's list has a number of two
    // digits, or a row's runs would not fit the margin at the larger size.
    let large = true;
    for (let k = 0; k < w + h; k++) {
      const list = listOfLine(b, k);
      if (k >= h && Array.from(list).some((n) => n >= 10)) large = false;
      if (k < h && list.length * 3 - 2 > depth * 2) large = false;
    }
    const size = Math.floor(ts / (large ? 1.6 : 2.2));
    for (let k = 0; k < w + h; k++) {
      const row = k < h;
      const err = at.lineErrors.has(k);
      const hatched = at.stripedLine === k;
      const cur = row ? k === at.cy : k - h === at.cx;
      const color = err ? COL_ERROR : cur ? COL_CURSOR : COL_INK;
      const key = (err ? 1 : 0) | (hatched ? 2 : 0) | (cur ? 4 : 0) | (large ? 8 : 0);
      if (!ds.lists.changed(k, key)) continue;
      const box = row
        ? { x: 0, y: coord(k, ts), w: from, h: ts }
        : { x: coord(k - h, ts), y: 0, w: ts, h: from };
      dr.clip(box);
      dr.drawRect(box, COL_BACKGROUND);
      if (hatched) dr.drawHatch(box, hatchPeriod(ts));
      const list = Array.from(listOfLine(b, k));
      if (row && list.length > 0)
        dr.drawText(
          { x: from - Math.floor(ts / 4), y: box.y + half },
          { align: "right", baseline: "mathematical", fontType: "variable", size },
          color,
          list.join(list.length > depth ? " " : "  "),
        );
      else if (list.length > 0) {
        // The last run sits a tile above the board, the first as high as
        // the list's length and the margin allow.
        const bottom = from - Math.floor((ts * 3) / 4);
        const span = bottom - half;
        const fit = Math.max(list.length, depth) - 1;
        list.forEach((n, j) => {
          dr.drawText(
            {
              x: box.x + half,
              y: bottom - Math.floor(((list.length - 1 - j) * span) / Math.max(1, fit)),
            },
            glyphFont(size),
            color,
            String(n),
          );
        });
      }
      dr.unclip();
      dr.drawUpdate(box);
    }
  }

  /** The board's tally of pieces (`deal.tally`), drawn beneath it as the
   * piece whose painter runs; `null` where it deals none. */
  const tallied = ((): {
    kind: keyof C;
    count: string;
    value: number;
    piece: { painter: Painter; slot: readonly number[] };
  } | null => {
    const t = module.deal?.tally;
    if (t === undefined) return null;
    const run = [...byValue.entries()].find(([, p]) => p.painter.runs === true);
    if (run === undefined) throw new Error("play: a tally, and no piece that runs");
    return { kind: t.kind as keyof C, count: t.count, value: run[0], piece: run[1] };
  })();
  /** The counts of a board's tally, the pieces of each length. */
  const tallyCounts = (
    b: FillBoard<C>,
    kind: keyof C,
    count: string,
  ): readonly number[] =>
    (b.dealt[kind] as unknown as Readonly<Record<string, readonly number[]>>)[count];

  /** The tally beneath the board, where the game has one and what it shows
   * found has moved. */
  function drawTallyOf(dr: GameDrawing, ds: FillDrawState, b: FillBoard<C>): void {
    const t = tallied;
    if (t === null) return;
    const counts = tallyCounts(b, t.kind, t.count);
    const full = tallyPlaced(b.values, t.value, counts);
    const found = wholePieces(b.values, b.w, b.h, t.value, counts.length, full);
    const key = found.join(",");
    if (ds.tally.shown === key) return;
    ds.tally.shown = key;
    const ts = ds.tileSize;
    drawTally(
      dr,
      ts,
      { x: coord(0, ts), y: coord(b.h, ts) + ts, w: b.w },
      counts,
      found,
      t.piece.painter,
      {
        piece: t.piece.slot,
        found: COL_LABEL,
        strike: COL_INK,
        over: COL_ERROR,
        background: COL_BACKGROUND,
      },
    );
  }

  /** The text cell `(x, y)` shows, for a hint's ring to keep inside it: on a
   * board of numbers its numeral, or its notes; else the number written on
   * it. */
  function cellText(
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
    const tile: [number, number] = [cellX(x, y, h, ts), coord(y, ts)];
    const text = numberText(ts, ...tile);
    // A part's clue is kept outside the ring, which goes round what the
    // cell holds below it.
    const label = labeled ? (labelsOf(b).get(at) ?? null) : null;
    const avoid: Rect[] = [];
    if (label !== null) {
      const t = labelText(ts, [x, y, h], walls, label.text);
      avoid.push(textBox(t.origin, t.options, label.text));
    }
    const enclosing = (enclose: RingClear["enclose"]): RingClear => ({
      enclose,
      avoid,
    });
    const v = b.values[at];
    if (threeD && v !== 0) {
      const face = topFace({ x: tile[0], y: tile[1], w: ts, h: ts }, v, top);
      const t = numberText(ts, face.x, face.y);
      return enclosing([textBox(t.origin, t.options, numeral(v))]);
    }
    if (typed && v !== 0) {
      const t = valueText(ts, [x, y, h], walls, ...tile);
      return enclosing([textBox(t.origin, t.options, numeral(v))]);
    }
    const noted = notesIn(b.pencil?.[at] ?? 0);
    if (noted.length > 0)
      return enclosing(
        noteSlots(ts, [x, y, h], walls, noted.length).map(({ origin, options }, j) =>
          textBox(origin, options, numeral(noted[j])),
        ),
      );
    const n = numberAt(b, at);
    if (n === null) return avoid.length === 0 ? NOTHING_TO_CLEAR : enclosing([]);
    return enclosing([
      textBox(text.origin, text.options, String(listOf(b.dealt, n.kind).v[n.k])),
    ]);
  }

  /** Into the tile words `word`, the cells Check & Save found wrong, and the
   * links as drawn on `shown`, both halves, those it found wrong in error. */
  function addMistakesAndLinks(
    word: Int32Array,
    shown: FillBoard<C>,
    mistakes: readonly FillMistake[],
  ): void {
    const { w, h } = shown;
    const badLinks = new Set<number>();
    for (const m of mistakes)
      if (m.kind === "mark") badLinks.add(m.cell);
      else word[m.cell] |= MISTAKE;
    for (let c = 0; c < w * h; c++) {
      const t = linkTo(shown, c);
      const d = t < 0 ? -1 : dirTo(w, c, t);
      if (d < 0) continue;
      const bad = badLinks.has(c) ? 1 : 0;
      word[c] |= (1 << (LINK_SHIFT + d)) | (bad << (BAD_LINK_SHIFT + d));
      const back = (d + 2) % 4;
      word[t] |= (1 << (LINK_SHIFT + back)) | (bad << (BAD_LINK_SHIFT + back));
    }
  }

  /** Cell `i`'s note word: its notes, and `NOTES_MODE` where the selection,
   * on it (`selected`), takes notes. */
  const noteKey = (b: FillBoard<C>, i: number, selected: boolean, ui: FillUi): number =>
    (b.pencil?.[i] ?? 0) | (selected && ui.pencilMode === true ? NOTES_MODE : 0);

  /** Each gap's clue, where it has moved: in ink, red where it breaks, and
   * else gray where the player marked it done. */
  function drawGaps(
    dr: GameDrawing,
    ds: FillDrawState,
    b: FillBoard<C>,
    broken: ReadonlySet<number>,
  ): void {
    const ts = ds.tileSize;
    const g = gapOf(ts);
    const sp = spaceOf(module, b);
    for (const e of sp.edges) {
      const clue = gapClueAt(gapKinds, b, sp, e);
      const err = broken.has(e);
      const done = clue !== null && isDone(b, clue.name, clue.k);
      const key =
        clue === null
          ? 0
          : 1 |
            (clue.kind << 1) |
            (clue.clue.toward << 8) |
            (err ? 1 << 10 : 0) |
            (done ? 1 << 11 : 0) |
            (clue.clue.value << 12);
      if (!ds.gaps.changed(e, key)) continue;
      const a = sp.edgeEnds[2 * e];
      const [x, y] = [a % b.w, Math.floor(a / b.w)];
      const right = sp.edgeEnds[2 * e + 1] === a + 1;
      // The gap past cell `a`, and inside it the part no cell's frame takes.
      const gap = right
        ? { x: coord(x, ts) + ts, y: coord(y, ts), w: g, h: ts }
        : { x: coord(x, ts), y: coord(y, ts) + ts, w: ts, h: g };
      const open = right
        ? { x: gap.x + 1, y: gap.y, w: g - 1, h: ts + 1 }
        : { x: gap.x, y: gap.y + 1, w: ts + 1, h: g - 1 };
      dr.clip(open);
      dr.drawRect(open, COL_BACKGROUND);
      clue?.painter.paint(
        dr,
        gap,
        clue.clue,
        err ? COL_ERROR : done ? COL_DONE : COL_INK,
        err,
      );
      dr.unclip();
      dr.drawUpdate(open);
    }
  }

  /** The raised values that reach into the tile at `(x, y)` of board `b`,
   * which may be off the board, in the order they are painted over it. */
  const raisedIntoOf =
    (b: FillBoard<C>, ts: number, tiles: readonly (TileWords | null)[]) =>
    (x: number, y: number): RaisedAt[] => {
      if (!threeD) return [];
      const { w, h } = b;
      return RECEIVED_FROM.flatMap(([dx, dy]) => {
        const [sx, sy] = [x + dx, y + dy];
        if (sx < 0 || sy < 0 || sx >= w || sy >= h) return [];
        const t = tiles[sy * w + sx];
        if (t === null || (t.lk & RAISED) === 0) return [];
        const tile = { x: cellX(sx, sy, h, ts), y: coord(sy, ts), w: ts, h: ts };
        return [{ tile, word: t.k, hintWord: t.hk, noteWord: t.nk }];
      });
    };

  /**
   * Each tile that changed, with the raised values next door over it. A
   * raised value reaches into the tiles up, right and up-right of its own,
   * which repaint with it. Turning 3D off changes every tile, and turning it
   * on every tile around a value, so in 2D none needs it.
   */
  function paintTiles(
    dr: GameDrawing,
    ds: FillDrawState,
    b: FillBoard<C>,
    tiles: readonly (TileWords | null)[],
    raisedInto: (x: number, y: number) => readonly RaisedAt[],
  ): void {
    const ts = ds.tileSize;
    const { w, h } = b;
    const repaint = tiles.map((t) => t?.changed === true);
    if (threeD)
      tiles.forEach((t, i) => {
        if (!t?.changed) return;
        const [x, y] = [i % w, Math.floor(i / w)];
        for (const [dx, dy] of RECEIVED_FROM) {
          const [rx, ry] = [x - dx, y - dy];
          if (rx >= 0 && ry >= 0 && rx < w && ry < h) repaint[ry * w + rx] = true;
        }
      });
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const t = tiles[i];
        if (t === null || !repaint[i]) continue;
        drawTile(
          dr,
          ts,
          [x, y, h],
          t.k,
          t.hk,
          t.lk,
          t.nk,
          t.n,
          t.part,
          ds.struck.struck[i],
          t.label,
          raisedInto(x, y),
          t.anim,
        );
      }
  }

  /**
   * The squares above the board and right of it, which the raised values of
   * its top row and right column reach into, where one of those changed: a
   * clue's slot is drawn again by `drawSlots`, which paints them over it,
   * and any other square is cleared to the background with them over it.
   */
  function repaintMargins(
    dr: GameDrawing,
    ds: FillDrawState,
    b: FillBoard<C>,
    tiles: readonly (TileWords | null)[],
    raisedInto: (x: number, y: number) => RaisedAt[],
  ): void {
    const ts = ds.tileSize;
    const { w, h } = b;
    const pencil = notes ? pencilIndicatorBox(canvasOf(b, null, ts), ts) : null;
    const margin = [
      ...Array.from({ length: w + 1 }, (_, x) => [x, -1] as const),
      ...Array.from({ length: h }, (_, y) => [w, y] as const),
    ];
    for (const [x, y] of margin) {
      const changed = RECEIVED_FROM.some(([dx, dy]) => {
        const [sx, sy] = [x + dx, y + dy];
        return sx >= 0 && sy >= 0 && sx < w && sy < h && tiles[sy * w + sx]?.changed;
      });
      if (!changed) continue;
      const s = slotted ? slotAt(w, h, x, y) : -1;
      if (s >= 0) {
        ds.slots.forget(s);
        continue;
      }
      const box = { x: coord(x, ts), y: coord(y, ts), w: ts, h: ts };
      dr.clip(box);
      dr.drawRect(box, COL_BACKGROUND);
      for (const r of raisedInto(x, y)) paintRaised(dr, r.tile, r);
      dr.unclip();
      dr.drawUpdate(box);
      if (
        pencil !== null &&
        box.x < pencil.x + pencil.size &&
        pencil.x < box.x + box.w &&
        box.y < pencil.y + pencil.size &&
        pencil.y < box.y + box.h
      )
        ds.pencilModeShown = null;
    }
  }

  function drawPencilMode(
    dr: GameDrawing,
    ds: FillDrawState,
    b: FillBoard<C>,
    ui: FillUi,
  ): void {
    const ts = ds.tileSize;
    const counts =
      tallied === null ? null : tallyCounts(b, tallied.kind, tallied.count);
    repaintPencilIndicator(
      dr,
      ds,
      ui.pencilMode === true,
      pencilIndicatorBox(canvasOf(b, counts, ts), ts),
      PENCIL_STYLE,
    );
  }

  /** Each cell's words this frame, and whether its tile changed; `null` for
   * a cell the board does not draw. `words` are the errors', the mistakes'
   * and links', and the hint's. */
  function tileWordsOf(
    ds: FillDrawState,
    { state, prev, animTime, ui, flash }: FillFrame<C>,
    shown: FillBoard<C>,
    words: {
      readonly word: Int32Array;
      readonly lineWord: Int32Array;
      readonly hintWord: (x: number, y: number) => number;
    },
  ): (TileWords | null)[] {
    const { w, h } = state;
    const cx = ui.cursor.visible ? ui.cursor.x : -1;
    const cy = ui.cursor.visible ? ui.cursor.y : -1;
    // A cell whose value just changed, while the engine drives timed redraws.
    const before = animTime > 0 && prev !== null ? prev.values : null;
    const frac = Math.min(1, animTime / PLACE_ANIM_TIME);
    const states = numberStates(shown);
    const joins = joinsOf(shown);
    const washes = washesOf(shown, ui);
    const labels = labelsOf(state);
    const { parts } = ds;
    const tiles: (TileWords | null)[] = new Array(w * h).fill(null);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (!drawn(state, x, y)) continue;
        const i = y * w + x;
        const label = labels.get(i) ?? null;
        let k = words.word[i] | shown.values[i] | (state.fixed[i] ? FIXED : 0);
        if (x === cx && y === cy) k |= CURSOR | (ui.linkArmed ? ARMED : 0);
        k |= flash.win(sweepStep(x, y)) << TONE_SHIFT;
        const hk = words.hintWord(x, y);
        let lk =
          words.lineWord[i] |
          (states.get(i) ?? 0) |
          ((joins[i] & 0xf) << JOIN_SHIFT) |
          (joins[i] & JOINED_OPEN ? SHAPE_OPEN : 0) |
          washes[i] |
          (label !== null && isDone(state, label.kind, label.k) ? LABEL_DONE : 0);
        const n = shownNumber(state, i, shown.values[i], ui.hiddenShown);
        if (n >= 0 && shown.values[i] === play.hides?.value) lk |= NUMBER_UNDER;
        const part =
          parts === null ? null : { walls: parts.walls[i], fill: parts.fills[i] };
        if (threeD) lk |= THREE_D | (shown.values[i] !== 0 ? RAISED : 0);
        const nk = noteKey(shown, i, (k & CURSOR) !== 0, ui);
        // A growing piece is no key's: its tile is drawn every frame.
        const grows = before !== null && before[i] !== shown.values[i];
        if (grows) ds.tiles.forget(i);
        tiles[i] = {
          k,
          hk,
          lk,
          nk,
          n,
          part,
          label: label?.text ?? null,
          anim: grows ? { from: before[i], frac } : null,
          changed: grows || ds.tiles.changed(i, k, hk, lk, nk),
        };
      }
    return tiles;
  }

  /** What the first frame draws under every tile: the grid's frame, and
   * each line's label where the board has them. */
  function drawFrame(dr: GameDrawing, ds: FillDrawState, state: FillBoard<C>): void {
    const ts = ds.tileSize;
    const { w, h } = state;
    // A walled board's frame is a wall: each cell paints its own top and
    // left, so this is the bottom and right of the last row and column. A
    // hexagon's edge is each of its cells' own, and so is a gapped board's.
    if (hexagon || gapped) {
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++)
          if (drawn(state, x, y))
            dr.drawRect(
              { x: cellX(x, y, h, ts), y: coord(y, ts), w: ts + 1, h: ts + 1 },
              COL_GRID,
            );
    } else
      dr.drawRect(
        { x: coord(0, ts), y: coord(0, ts), w: w * ts + 1, h: h * ts + 1 },
        ds.parts === null ? COL_GRID : COL_WALL,
      );
    if (labelStart === undefined) return;
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

  function redraw(dr: GameDrawing, ds: FillDrawState, frame: FillFrame<C>): void {
    const { state, ui, hint, mistakes } = frame;
    const ts = ds.tileSize;
    const { w, h } = state;
    threeD = raises && ui.raised !== false;
    top = raises ? topValue(module, spaceOf(module, state)) : 1;
    depth = depthOf(state);
    boardW = w;
    const shown = ui.drag?.live ? previewed(state, ui) : state;

    if (ds.tiles.firstFrame()) drawFrame(dr, ds, state);

    // The live errors, on the board as the drag would leave it.
    const { word, lineWord, lineErrors, gapErrors, slotErrors, cornerErrors } =
      errorWords(state, shown);

    addMistakesAndLinks(word, shown, mistakes ?? []);

    // The hint: a ring round each cell it decides, a link's two cells one pill
    // with the link inside, an outline round the cells it reasons from, the
    // line it counts along striped, and the clue it counts with recolored.
    const marks = stepMarks(hint);
    // The notes the step strikes, where the board keeps notes.
    if (notes)
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
      const kind = numberAt(state, c.y * w + c.x)?.kind;
      return kind !== undefined && clueCells[kind] !== undefined;
    };
    const named = outlined.filter(blocked);
    const area = outlined.filter((c) => !blocked(c));
    // A game without links has no step that rings one.
    const askedLinks = linkClues === null ? [] : marks.of("ring", LINK);
    const hintWord = new Int32Array(w * h);
    for (const l of askedLinks) {
      const d = dirTo(w, l.cell, l.to);
      hintWord[l.cell] |= 1 << (HINT_LINK_SHIFT + d);
      hintWord[l.to] |= 1 << (HINT_LINK_SHIFT + ((d + 2) % 4));
    }
    if (named.length > 0) {
      const sp = spaceOf(module, state);
      for (const c of named) {
        const at = c.y * w + c.x;
        const { kind } = numberAt(state, at) as { kind: keyof C & string };
        hintWord[at] |= HINT_NUMBER;
        // A hexagon's corners are no cells a number counts on the board.
        const cells = (clueCells[kind] ?? (() => []))(sp, at).filter((d) =>
          drawn(state, d % w, Math.floor(d / w)),
        );
        const block = new MarkOutlines(
          [],
          cells.map((d) => ({ x: d % w, y: Math.floor(d / w) })),
          sides,
        );
        for (const d of cells)
          hintWord[d] |= block.evidenceSides(d % w, Math.floor(d / w)) << BLOCK_SHIFT;
      }
    }
    // A ring round a raised value goes round its top, where its numeral is.
    const ringedAt = new Set(targets.map((c) => c.y * w + c.x));
    const markStyle: HintMarkStyle = {
      band: (x, y) => {
        const band = markBand(ts, [x, y, h], ds.parts?.walls[y * w + x] ?? null);
        const v = shown.values[y * w + x];
        return threeD && v !== 0 && ringedAt.has(y * w + x)
          ? { ...band, box: topFace(band.box, v, top) }
          : band;
      },
      // A ring keeps its cell's number inside it and its neighbors' outside;
      // the line clues lie past any ring's reach.
      text: (x, y) => cellText(state, ds, x, y),
      words: marks,
      evidenceColor: COL_HINT_OUTLINE,
      ...sides,
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

    const tiles = tileWordsOf(ds, frame, shown, {
      word,
      lineWord,
      hintWord: (x, y) => hintWord[y * w + x] | outlines.packed(x, y),
    });
    const raisedInto = raisedIntoOf(state, ts, tiles);
    paintTiles(dr, ds, state, tiles, raisedInto);
    if (raises) repaintMargins(dr, ds, state, tiles, raisedInto);

    if (notes) drawPencilMode(dr, ds, state, ui);
    if (gapped) drawGaps(dr, ds, state, gapErrors);
    drawSlots(dr, ds, state, slotErrors, stripedLine, marks, raisedInto);

    // After every tile, and every frame: `HintMarks.paint` always draws.
    ds.marks.paint(dr, unlinked, area, markStyle);
    drawCorners(dr, ds, state, cornerErrors, tiles);
    for (const l of askedLinks) drawLinkRing(dr, ts, w, l, whole(l));
    drawTallyOf(dr, ds, shown);

    if (lineLists.length > 0) {
      const [cx, cy] = ui.cursor.visible ? [ui.cursor.x, ui.cursor.y] : [-1, -1];
      drawLists(dr, ds, state, { stripedLine, lineErrors, cx, cy });
    }
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
    origin: (ts, b) => startAt(ts, depthOf(b)),
    gap: gapOf,
    // A hexagon's rows reach half a tile past its width.
    computeSize: (p, size) => {
      const tally = module.deal?.tally;
      return canvasOf(p, tally === undefined ? null : tallyOf(tally, p), tileOf(size));
    },
    colors,
    newDrawState: (b, tileSize) => {
      const struck = new OverlaySidecar(b.w * b.h);
      return {
        tileSize: tileOf(tileSize),
        parts: partsOf(b),
        tiles: new TileCache(b.w * b.h, { words: 4, overlays: [struck] }),
        struck,
        clues: new TileCache(b.w + b.h),
        lists: new TileCache(b.w + b.h),
        gaps: new TileCache(gapped ? spaceOf(module, b).edges.length : 0),
        slots: new TileCache(slotted ? spaceOf(module, b).slots.length : 0),
        corners: new TileCache(cornered ? spaceOf(module, b).corners.length : 0),
        marks: new HintMarks(),
        tally: { shown: null },
        pencilModeShown: null,
      };
    },
    redraw,
    numbersLeft,
    partClueBox(ts, b, c) {
      if (!labeled || walled === undefined) return null;
      const { of, cells } = b.dealt[walled] as Partition;
      const first = cells[of[c]][0];
      const label = labelsOf(b).get(first);
      if (label === undefined) return null;
      const size = tileOf(ts);
      depth = depthOf(b);
      const at = [first % b.w, Math.floor(first / b.w), b.h] as const;
      const walls = partsOf(b)?.walls[first] ?? null;
      const { origin, options } = labelText(size, at, walls, label.text);
      return {
        box: textBox(origin, options, label.text),
        kind: label.kind,
        k: label.k,
      };
    },
  };
}

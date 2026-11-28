/**
 * How a fill game is played, as its description's `play:` declares it
 * (`FillPlay`), and the engine's `Ui`. The input built from them is a board
 * of buttons' (`buttons.ts`) or a board of numbers' (`numbers.ts`): every
 * move is an `Edit`, so no game writes its own input
 * (`openspec/changes/a-game-from-its-description-alone`, design.md § 5).
 */

import type { Point } from "../contract/types.ts";
import type { CandidateReading } from "../hint/candidate-hint.ts";
import {
  type GridCursor,
  type GridDrag,
  newCursor,
  newDrag,
} from "../input/pointer.ts";
import type { EdgePainterName } from "../render/pieces/edge.ts";
import type { Way } from "./along.ts";
import type { ClickCycles } from "./click.ts";
import type { ReorderDrag } from "./order.ts";
import type { SelectShape } from "./select.ts";

/** A value the player places: what its verb does, as the Controls paragraph
 * completes "Click a square to …", the key or keys that place it, a letter
 * or a digit, and how it is printed and painted. */
export interface PlayValue {
  readonly does: string;
  readonly key: string | readonly string[];
  /** A cell's value's text; a value on an edge has none, its painter
   * printing it (`EDGE_VALUE_PAINTERS`). */
  readonly glyph?: string;
  readonly paint: string;
}

/** A wash the player switches on and off (`FillPlay.highlights`): the
 * surface it paints (`goal`, where the player is going, or `error`, the
 * mistake's), its preference, and whether that is on by default. */
export interface FillHighlight {
  readonly paint: "goal" | "error";
  readonly pref: { readonly kw: string; readonly name: string };
  readonly on: boolean;
}

/** A fill game's `play:`, as its compiled module exports it. */
export interface FillPlay {
  /** Where the values are the answer's domain, each drawn as its numeral and
   * typed into a selected cell (`numbers.ts`): such a board has no `values`
   * and no buttons. `raised`: each value drawn as a block as tall as it,
   * leaning up and right (`render/raised.ts`), or flat by the player's
   * appearance preference. `letters`: each value drawn, said and typed as
   * a letter from A, or as the letter at its place in an alphabet, a digit
   * typing the letter at its place from A. `empty`: the
   * value the answer repeats in a unit is the empty square, drawn as a
   * cross, and a square whose notes lack it is drawn in the ball the clue
   * kind `ball` is drawn as (`glyphs.ts`'s `emptyOf`). `pictures`: each
   * value drawn by its painter in place of its glyph, a note small, unless
   * the player's preference `pref` draws the glyphs; `A` switches it. With
   * no `pref`, always pictures. Each is said by its name in `names`, and
   * labeled by it on the keypad. `features`: each value a set of features
   * (the module's `featuresOf`), feature `k` drawn as `names`' letter `k`
   * in its slot of the square (`render/layers/features.ts`), over notes
   * kept full. */
  readonly numbers?: {
    readonly raised?: true;
    readonly features?: { readonly names: string };
    readonly letters?: true | string;
    readonly empty?: { readonly ball: string };
    readonly pictures?: {
      readonly paint: Readonly<Record<number, string>>;
      readonly names: Readonly<Record<number, string>>;
      readonly pref?: { readonly kw: string; readonly name: string };
    };
  };
  /** Whether a board of numbers keeps the player's candidate notes, a set of
   * values an open cell (`notes.ts`): the description's mark of them. */
  readonly notes?: true;
  /** Whether the notes are what each open cell can still hold, never a cell
   * left unnoted (the mark's `full`, Subsets'): dealt as its domain, given
   * back whole where a value is cleared, and a cell narrowed to one value
   * holding it (`notes.ts`'s `settleFullNotes`). */
  readonly fullNotes?: true;
  /** Where the board keeps notes, how its hint reads a cell with none until
   * the player chooses (`candidate-hint.ts`'s `CandidateReading`): the
   * convention, `populate`, where the description says nothing. */
  readonly hintNotes?: CandidateReading;
  /** The clue kinds at edges, each drawn in the gap between its cells by
   * the edge painter named: a board with any has a gap between every two
   * cells. */
  readonly gaps?: Readonly<Record<string, EdgePainterName>>;
  /** The clue kinds the player may mark done, each with what one is called
   * (`done.ts`): a press on such a clue grays it, and another restores it. */
  readonly done?: Readonly<Record<string, string>>;
  /** The clues at the board drawn as a row of counts beneath it, by kind the
   * field whose value a record's piece shows and a press on it places
   * (`counts.ts`). */
  readonly counts?: Readonly<Record<string, string>>;
  /** The clue at the board whose records are lists, drawn as a list beneath
   * it (`record-list.ts`). */
  readonly list?: string;
  /** Whether every value is drawn as a band beneath the board (`band.ts`). */
  readonly band?: true;
  /** Where typing goes along the list's sites (`along.ts`): the player's
   * preferences that move the selection along a site and wash the sites
   * through it, by key and name; and where the list is also a reference
   * aid (`record-panel.ts`), what it calls a record and a site. */
  readonly along?: {
    readonly advance: { readonly kw: string; readonly name: string };
    readonly wash: { readonly kw: string; readonly name: string };
    readonly panel?: { readonly record: string; readonly site: string };
  };
  /** Where the clues one a value at the lines are drawn (`value-margin.ts`):
   * the values before each line's start, the furthest out first, and those
   * past its end, the nearest first; a value in neither is drawn nowhere.
   * Absent, every value before the start. */
  readonly ends?: {
    readonly start: readonly number[];
    readonly end: readonly number[];
  };
  /** The player's preference for how the row of counts reads (`counts.ts`'s
   * `COUNT_STYLES`), by its key and name; absent, each count is its total. */
  readonly countStyle?: { readonly kw: string; readonly name: string };
  /** The sign drawn after the number of each clue kind at a dealt
   * partition's part or at a corner, by kind: a part's clue is drawn at its
   * part's first cell, and a corner's on a disc there. A list is a word a
   * value, and a kind of one value is its sign alone (`signedText`). */
  readonly signs?: Readonly<Record<string, string | readonly string[]>>;
  /** The values the player places, by the description's value. */
  readonly values?: Readonly<Record<number, PlayValue>>;
  /** The values only the deal places, a fixed cell's. */
  readonly given?: Readonly<Record<number, Pick<PlayValue, "glyph" | "paint">>>;
  /** The left button's value. */
  readonly primary?: number;
  /** The right button's, which rules a cell out. */
  readonly secondary?: number;
  /** What a click does: `toggle`, the default, sets the button's value or
   * empties a cell holding it; `cycle` goes round empty, the button's value
   * and the other button's; or, by button, the values it goes round after
   * empty, leaving a cell holding a value its list does not name. */
  readonly click?: "toggle" | "cycle" | ClickCycles;
  /** The dealt partition whose parts are played whole (`edit.ts`): a value
   * placed in one square writes the others the module's `wholeOthers`. */
  readonly whole?: { readonly part: string };
  /** The clue kind at a cell that the cell is dealt holding, fixed. */
  readonly dealt?: string;
  /** Whether a dealt cell is drawn with a dot on its piece, where its kind
   * says more than its value (Clusters' dot, which also counts). */
  readonly dotted?: true;
  /** The variation under which a small cross marks each corner inside the
   * grid (`render/layers/surface.ts`). */
  readonly cornerCrosses?: string;
  /** Whether the leading diagonal of a square board is drawn as a stroke
   * under each square on it (`render/layers/surface.ts`). */
  readonly leadingDiagonal?: true;
  /** The value an open cell reads as for the answer check, where the answer is
   * the other values alone; absent where every cell must be filled. */
  readonly blank?: number;
  /** A letter that empties a cell, beside Backspace and Delete. */
  readonly erase?: string;
  /** Whether a drag keeps to the row or column it runs along, where it
   * otherwise follows the pointer. */
  readonly straight?: true;
  /** The one button whose drag sweeps, where the other's acts where it began
   * alone; both sweep where absent. */
  readonly sweepWith?: "secondary";
  /** On a board of numbers, the shape a drag from the selected cell selects,
   * which a typed value fills at once (`select.ts`). */
  readonly select?: SelectShape;
  /** On a square board of numbers with line labels, whether the player may
   * rule a divider between two lines (`dividers.ts`). */
  readonly dividers?: true;
  /** On a square board of numbers with line labels, whether the player may
   * order the lines, a row and the same column together, by dragging a
   * label or with Shift and an arrow (`order.ts`). */
  readonly order?: true;
  /** Where the open cells a definition holds of are washed (`washed`), the
   * preference that draws the secondary piece on one, on by default. */
  readonly wash?: { readonly pref?: { readonly kw: string; readonly name: string } };
  /** Washes the player switches on and off (`highlighted`), in the order
   * the first that holds at a cell paints it: each one's paint, its
   * preference, and whether that is on by default. */
  readonly highlights?: readonly FillHighlight[];
  /** The value whose piece covers the number on its cell, and the
   * preference that shows it there, smaller, off by default; a press off
   * the grid flips it (upstream singles.c). */
  readonly covers?: {
    readonly value: number;
    readonly pref: { readonly kw: string; readonly name: string };
  };
  /** Whether an arrow at the grid's edge carries the cursor to the other. */
  readonly wrap?: true;
  /** The clue kind the cell mark names, where the player draws it as a link
   * between a cell and the clue's cell beside it. */
  readonly links?: {
    readonly clue: string;
    /** The hint's reading of the links: `engine/hint/glance.ts`. */
    readonly glance?: readonly string[];
    readonly askBefore?: readonly string[];
  };
}

/** The engine's `Ui` for a fill game. */
export interface FillUi {
  cursor: GridCursor;
  /** The drag: where it began, and where the pointer is. A board of numbers
   * keeps none: its one drag is the done marks' sweep, which the engine's
   * target verbs hold (`numbers.ts`). */
  drag?: GridDrag;
  /** The cells a drag that follows the pointer has passed, in order, the
   * first the pressed one. */
  path: number[];
  /** Where the dragging pointer last was, so a fast drag takes the cells it
   * passed between two events. */
  last: Point;
  /** The button the live drag began with, `-1` where none did. */
  dragButton: number;
  /** Whether the dragging pointer is over the board. */
  dragOk: boolean;
  /** Whether `L` armed a link, which the next arrow draws. */
  linkArmed: boolean;
  /** The wash's preference (`FillPlay.wash`): whether the secondary piece is
   * drawn on a washed cell. */
  washedMarks: boolean;
  /** On a board with highlights (`FillPlay.highlights`), each one's
   * preference, in their order: whether it is shown. */
  highlights?: boolean[];
  /** The covering preference (`FillPlay.covers`): whether a number shows on
   * the piece that covers it. */
  hiddenShown: boolean;
  /** On a board of numbers (`numbers.ts`, `typedUi`), whether the keyboard
   * moved the note-taking cell's highlight. */
  cursorFromKeyboard?: boolean;
  /** On a board of numbers that keeps notes alone, the note-taking cell's
   * mode and preferences, and auto-pencil. Any other board has none, since
   * the app reads a `Ui` with a pencil mode as one that takes notes. */
  pencilMode?: boolean;
  pencilSticky?: boolean;
  pencilKeepHighlight?: boolean;
  autoPencil?: boolean;
  /** On a board of numbers whose drag selects a shape (`FillPlay.select`),
   * the cells it selected, the cursor's first; empty where the selection is
   * the cursor's cell alone. */
  selected?: number[];
  /** On a board whose lines the player orders (`FillPlay.order`), the
   * header drag under way, `null` where none is. */
  reorder?: ReorderDrag | null;
  /** On a board that keeps notes, how its hint reads a cell with none (the
   * `hint-notes` preference). */
  candidateReading?: CandidateReading;
  /** On a board whose values are drawn raised, the appearance preference:
   * raised (3D), or flat (2D). */
  raised?: boolean;
  /** On a board whose values are drawn as pictures (`numbers.pictures`), the
   * player's preference: pictures, or the glyphs. */
  pictures?: boolean;
  /** On a board whose values are features (`numbers.features`), the slot of
   * the cursor's square the cursor is on (`features.ts`). */
  slot?: number;
  /** On a board whose pieces all point (`glyphs.ts`'s `waysOf`), what Enter
   * or Space armed the selection to take from the next arrow key: a value,
   * or a note; `null` where nothing is armed. */
  armed?: "value" | "note" | null;
  /** On a board whose counts' style is a preference (`FillPlay.countStyle`),
   * the player's choice, by its index in `COUNT_STYLES`. */
  countStyle?: number;
  /** On a board typed along its list's sites (`FillPlay.along`): the way a
   * typed value moves the selection; the record of the list picked up,
   * `-1` where none is; and the two preferences, moving the selection and
   * washing the sites through it. */
  way?: Way;
  held?: number;
  advance?: boolean;
  runWash?: boolean;
}

export function newFillUi(): FillUi {
  return {
    cursor: newCursor(),
    drag: newDrag(),
    path: [],
    last: { x: 0, y: 0 },
    dragButton: -1,
    dragOk: false,
    linkArmed: false,
    washedMarks: true,
    hiddenShown: false,
  };
}

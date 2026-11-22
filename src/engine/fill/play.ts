/**
 * How a fill game is played, built from its description's `play:`: the
 * engine's `Ui`, the verbs each button and key applies, the drag, the
 * Shift/Ctrl-arrow stroke and the link gesture. Every move is an `Edit`, so
 * no game writes its own input (`openspec/changes/a-game-from-its-description-alone`,
 * design.md § 5).
 */

import { UI_UPDATE, type UiUpdate } from "../contract/game.ts";
import type { Point } from "../contract/types.ts";
import { isDigit } from "../game-id/decimal.ts";
import {
  cursorDelta,
  endDrag,
  type GridCursor,
  type GridDrag,
  isCursorMove,
  isMouseDown,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  MOD_CTRL,
  MOD_SHFT,
  moveCursor,
  moveDrag,
  newCursor,
  newDrag,
  numpadDirection,
  RIGHT_BUTTON,
  startDrag,
  stripModifiers,
} from "../input/pointer.ts";
import {
  buttonVerb,
  digitKey,
  ERASE_KEYS,
  hexGrid,
  interpretTargetVerbs,
  type KeyOnlyVerb,
  letterKey,
  pressTarget,
  rulingOut,
  squareGrid,
  type TargetVerb,
  type TargetVerbs,
  type VerbKey,
} from "../input/target-verb.ts";
import { PAINTERS } from "../render/pieces/index.ts";
import {
  type ClueList,
  clueAt,
  hexShift,
  inHexagon,
} from "../solve/describe-runtime.ts";
import { type Clues, type FillBoard, type FillModule, listOf } from "./board.ts";

import { applyEdit, type Edit } from "./edit.ts";

/** Whether the painter named `paint` draws one of a pair of alike pieces. */
const paired = (paint: string): boolean =>
  paint in PAINTERS && PAINTERS[paint as keyof typeof PAINTERS].pair !== undefined;

/** The line the painter named `paint` runs along, where it draws a line
 * through its cell. */
const axisOf = (paint: string): "row" | "column" | null =>
  paint in PAINTERS ? (PAINTERS[paint as keyof typeof PAINTERS].axis ?? null) : null;

/** The values that are lines through their cell, by the line they run
 * along, or `null` where the values are not both lines. */
function axesOf(play: FillPlay): { row: number; column: number } | null {
  const by = new Map(
    Object.entries(play.values).map(([v, { paint }]) => [axisOf(paint), Number(v)]),
  );
  const row = by.get("row");
  const column = by.get("column");
  return row === undefined || column === undefined ? null : { row, column };
}

/** A value the player places: what its verb does, as the Controls paragraph
 * completes "Click a square to …", the key or keys that place it, a letter
 * or a digit, and how it is printed and painted. */
export interface PlayValue {
  readonly does: string;
  readonly key: string | readonly string[];
  readonly glyph: string;
  readonly paint: string;
}

/** A fill game's `play:`, as its compiled module exports it. */
export interface FillPlay {
  /** The values the player places, by the description's value. */
  readonly values: Readonly<Record<number, PlayValue>>;
  /** The values only the deal places, a fixed cell's. */
  readonly given?: Readonly<Record<number, Pick<PlayValue, "glyph" | "paint">>>;
  /** The left button's value. */
  readonly primary: number;
  /** The right button's, which rules a cell out. */
  readonly secondary: number;
  /** What a click does: `toggle`, the default, sets the button's value or
   * empties a cell holding it; `cycle` goes round empty, the button's value
   * and the other button's. */
  readonly click?: "toggle" | "cycle";
  /** The clue kind at a cell that the cell is dealt holding, fixed. */
  readonly dealt?: string;
  /** Whether a dealt cell is drawn with a dot on its piece, where its kind
   * says more than its value (Clusters' dot, which also counts). */
  readonly dotted?: true;
  /** The value an open cell reads as for the answer check, where the answer is
   * the other values alone; absent where every cell must be filled. */
  readonly blank?: number;
  /** A letter that empties a cell, beside Backspace and Delete. */
  readonly erase?: string;
  /** What a drag does: `line` paints the secondary value along one row or
   * column, `sweep` repeats the pressed verb on every cell it passes that
   * held what the pressed one held. */
  readonly stroke: "line" | "sweep";
  /** The one button whose drag sweeps, where the other's acts where it began
   * alone; both sweep where absent. */
  readonly sweepWith?: "secondary";
  /** Where the open cells a definition holds of are washed (`washed`), the
   * preference that draws the secondary piece on one, on by default. */
  readonly wash?: { readonly pref?: { readonly kw: string; readonly name: string } };
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
  /** The line stroke's drag, `null` in a game whose stroke is a sweep. */
  drag: GridDrag | null;
  /** The button the live drag began with, `-1` where none did. */
  dragButton: number;
  /** Whether the dragging pointer is over the board. */
  dragOk: boolean;
  /** Whether `L` armed a link, which the next arrow draws. */
  linkArmed: boolean;
  /** The wash's preference (`FillPlay.wash`): whether the secondary piece is
   * drawn on a washed cell. */
  washedMarks: boolean;
}

export function newFillUi(stroke: FillPlay["stroke"] = "line"): FillUi {
  return {
    cursor: newCursor(),
    drag: stroke === "line" ? newDrag() : null,
    dragButton: -1,
    dragOk: false,
    linkArmed: false,
    washedMarks: true,
  };
}

const KEY_L = [..."Ll"].map((ch) => ch.charCodeAt(0));

/** What an arm of the input answers where the button is not its own, so the
 * next arm takes it: `null` is an answer, "nothing happened". */
const PASS = "pass";
type Arm = Edit | UiUpdate | null | typeof PASS;

/** What a fill game's input reads of its draw state. */
interface Tiled {
  readonly tileSize: number;
}

/** A fill game's input: its verbs, `interpretMove`, and the edit a live drag
 * would make, which the renderer previews. */
export interface FillInput<C, D> {
  readonly targetVerbs: TargetVerbs<FillBoard<C>, FillUi, D, Point, Edit>;
  interpretMove(
    board: FillBoard<C>,
    ui: FillUi,
    ds: D,
    p: Point,
    button: number,
  ): Edit | UiUpdate | null;
  /** The edit releasing the live drag where it is now would make, `null`
   * where it would make none. */
  pendingEdit(board: FillBoard<C>, ui: FillUi): Edit | null;
  /** The board as the live drag would leave it, for the renderer. */
  previewed(board: FillBoard<C>, ui: FillUi): FillBoard<C>;
  /** The link edit joining cell `c` to the clue `q`'s cell, or parting them:
   * what a link drag between them makes. */
  linkEdit(board: FillBoard<C>, c: number, q: number): Edit;
}

/**
 * The input `play` declares, on a board drawn `origin(tileSize)` pixels in
 * from the top and left of the canvas.
 */
export function fillInput<C extends Clues<C>, D extends Tiled>(
  module: FillModule<C>,
  play: FillPlay,
  origin: (tileSize: number) => number,
): FillInput<C, D> {
  const { primary, secondary } = play;
  const axes = axesOf(play);
  type Verb = TargetVerb<FillBoard<C>, FillUi, Point, Edit>;
  const geometry =
    module.hexagon === undefined
      ? squareGrid<FillBoard<C>, D>({ size: (b) => b, border: origin })
      : hexGrid<FillBoard<C>, D>({
          size: (b) => b,
          border: origin,
          shift: (y, ts, b) => hexShift(y, b.h, ts),
          onBoard: (b, x, y) => inHexagon(b.w, b.h, x, y),
        });
  /** A key that moves the cursor: an arrow, or on a hexagon a number pad
   * direction, which there is a move before it is a digit. */
  const movesCursor = (raw: number): boolean =>
    isCursorMove(stripModifiers(raw)) ||
    (module.hexagon !== undefined &&
      numpadDirection(raw & ~(MOD_SHFT | MOD_CTRL)) !== null);

  /** A verb that sets a cell to `to(v)` from `v`, or means nothing on a fixed
   * cell or where it would leave the cell as it is. */
  const setting =
    (to: (v: number) => number) =>
    (b: FillBoard<C>, { x, y }: Point): Edit | null => {
      const c = y * b.w + x;
      const v = to(b.values[c]);
      return b.fixed[c] || v === b.values[c] ? null : { set: [c, v] };
    };
  /** A button's verb: toggling its value with empty, or going round empty,
   * its value and `then`. */
  const clicking = (value: number, then: number): Verb =>
    play.click === "cycle"
      ? {
          does: play.values[value].does,
          apply: setting((v) => (v === 0 ? value : v === value ? then : 0)),
        }
      : {
          does: `${play.values[value].does}, or empty it if it is already filled`,
          apply: setting((v) => (v === 0 ? value : 0)),
        };
  const keyOf = (k: string): VerbKey =>
    isDigit(k) ? digitKey(Number(k)) : letterKey(k);
  const keyOnly: KeyOnlyVerb<FillBoard<C>, FillUi, Point, Edit>[] = [
    ...Object.entries(play.values).map(([k, pv]) => {
      const value = Number(k);
      return {
        does: pv.does,
        keys: (typeof pv.key === "string" ? [pv.key] : pv.key).map(keyOf),
        apply: setting(() => value),
        pointer: {
          kind: "cycle" as const,
          button: value === secondary ? ("secondary" as const) : ("primary" as const),
        },
      };
    }),
    {
      does: "empty it",
      keys:
        play.erase === undefined ? ERASE_KEYS : [letterKey(play.erase), ...ERASE_KEYS],
      apply: setting(() => 0),
      pointer: { kind: "cycle", button: "primary" },
    },
  ];
  const targetVerbs: TargetVerbs<FillBoard<C>, FillUi, D, Point, Edit> = {
    geometry,
    primary: clicking(primary, secondary),
    // One of a pair of alike pieces (Unruly's block and disc), or of two
    // lines (Sticks'), is placed as the other is, and rules nothing out.
    secondary:
      paired(play.values[secondary].paint) || axes !== null
        ? clicking(secondary, primary)
        : rulingOut(clicking(secondary, primary)),
    keyOnly,
    ...(play.stroke === "sweep"
      ? {
          sweep: {
            holds: (b: FillBoard<C>, t: Point) => b.values[t.y * b.w + t.x],
            ...(play.sweepWith === undefined ? {} : { buttons: [play.sweepWith] }),
          },
        }
      : {}),
  };

  const links = play.links;
  const cluesOf = (b: FillBoard<C>): ClueList | null =>
    links === undefined ? null : listOf(b.dealt, links.clue as keyof C);
  /** Whether cell `c` may hold the link's near end: open, or the primary
   * value, and not dealt. */
  const linkable = (b: FillBoard<C>, c: number): boolean =>
    !b.fixed[c] && (b.values[c] === 0 || b.values[c] === primary);
  /** The link two orthogonal neighbors `a` and `b` make, as its near cell and
   * the clue's index, or `null` where they make none. */
  const joining = (
    b: FillBoard<C>,
    a: number,
    z: number,
  ): { c: number; q: number } | null => {
    const clues = cluesOf(b);
    if (clues === null) return null;
    const ax = a % b.w;
    const zx = z % b.w;
    if (Math.abs(ax - zx) + Math.abs((a - ax) / b.w - (z - zx) / b.w) !== 1)
      return null;
    for (const [c, t] of [
      [a, z],
      [z, a],
    ]) {
      if (clueAt(clues, t) < 0 || !linkable(b, c)) continue;
      return { c, q: clues.at.indexOf(t) };
    }
    return null;
  };
  function linkEdit(b: FillBoard<C>, c: number, q: number): Edit {
    if (b.mark[c] === q) return { mark: [c, -1] };
    // A link pairs: the clue lets go of any other cell that named it.
    const mark: number[] = [];
    for (let o = 0; o < b.mark.length; o++)
      if (o !== c && b.mark[o] === q) mark.push(o, -1);
    mark.push(c, q);
    return b.values[c] === 0 ? { set: [c, primary], mark } : { mark };
  }

  /** The link the live drag draws: a left drag between a cell and the clue
   * beside it. */
  function dragLink(b: FillBoard<C>, ui: FillUi, drag: GridDrag): Edit | null {
    const { sx, sy, ex, ey } = drag;
    if (ui.dragButton !== LEFT_BUTTON) return null;
    const got = joining(b, sy * b.w + sx, ey * b.w + ex);
    return got === null ? null : linkEdit(b, got.c, got.q);
  }

  function pendingEdit(b: FillBoard<C>, ui: FillUi): Edit | null {
    const drag = ui.drag;
    if (drag === null || !drag.live || !ui.dragOk || ui.dragButton < 0) return null;
    const link = dragLink(b, ui, drag);
    if (link !== null) return link;
    const { sx, sy, ex, ey } = drag;
    if (axes !== null && (sx !== ex || sy !== ey)) return alongEdit(b, drag, axes);
    // A left drag acts as a click where it began, and a right drag that never
    // left its cell is a right click: each its button's verb.
    if (ui.dragButton === LEFT_BUTTON || (sx === ex && sy === ey)) {
      const made = buttonVerb(targetVerbs, ui.dragButton)?.apply(
        b,
        { x: sx, y: sy },
        ui,
      );
      return made === undefined || made === null || made === UI_UPDATE ? null : made;
    }
    // A right drag paints the open cells along its line.
    const set: number[] = [];
    for (let y = Math.min(sy, ey); y <= Math.max(sy, ey); y++)
      for (let x = Math.min(sx, ex); x <= Math.max(sx, ex); x++) {
        const c = y * b.w + x;
        if (!b.fixed[c] && b.values[c] === 0) set.push(c, secondary);
      }
    return set.length === 0 ? null : { set };
  }

  /** A drag of either button where the values are lines: the line along the
   * drag's row or column through each cell it passes, or, where the cell it
   * began in already holds that line, each cell it passes emptied. */
  function alongEdit(
    b: FillBoard<C>,
    { sx, sy, ex, ey }: GridDrag,
    by: { row: number; column: number },
  ): Edit | null {
    const value = sy === ey ? by.row : by.column;
    const to = b.values[sy * b.w + sx] === value ? 0 : value;
    const set: number[] = [];
    for (let y = Math.min(sy, ey); y <= Math.max(sy, ey); y++)
      for (let x = Math.min(sx, ex); x <= Math.max(sx, ex); x++) {
        const c = y * b.w + x;
        if (!b.fixed[c] && b.values[c] !== to) set.push(c, to);
      }
    return set.length === 0 ? null : { set };
  }

  /** The line stroke: a press starts a drag, which keeps to one row or
   * column, and its release makes the edit it previewed. */
  function lineDrag(
    b: FillBoard<C>,
    ui: FillUi,
    drag: GridDrag,
    ds: D,
    p: Point,
    button: number,
  ): Arm {
    const at = targetVerbs.geometry.pointerTarget(b, ds, p, ui);
    if (button === LEFT_BUTTON || button === RIGHT_BUTTON) {
      if (at === null) return null;
      ui.dragButton = button;
      startDrag(drag, at.x, at.y);
      ui.dragOk = true;
      ui.linkArmed = false;
      pressTarget(targetVerbs, ui, at);
      return UI_UPDATE;
    }
    if (!(isMouseDrag(button) || isMouseRelease(button)) || ui.dragButton < 0)
      return PASS;
    // The engine ends a drag the board changed under: the gesture goes on, but
    // commits nothing from an anchor the change made stale.
    if (!drag.live) {
      if (isMouseRelease(button)) ui.dragButton = -1;
      return UI_UPDATE;
    }
    if (at === null) ui.dragOk = false;
    else {
      // The coordinate that moved less goes back to the drag's start.
      const { sx, sy } = drag;
      if (Math.abs(at.x - sx) < Math.abs(at.y - sy)) moveDrag(drag, sx, at.y);
      else moveDrag(drag, at.x, sy);
      ui.dragOk = true;
    }
    if (isMouseDrag(button)) return UI_UPDATE;
    const edit = pendingEdit(b, ui);
    ui.dragButton = -1;
    endDrag(drag);
    return edit ?? UI_UPDATE;
  }

  /** `L` arms a link at the cursor, and the next arrow draws it to the
   * neighbor that way, or parts the two, taking the cursor along. */
  function linkKey(b: FillBoard<C>, ui: FillUi, button: number): Arm {
    if (links === undefined) return PASS;
    const isL = KEY_L.includes(button);
    if (ui.linkArmed) {
      ui.linkArmed = false;
      const delta = cursorDelta(button);
      if (delta !== null) {
        const { x, y } = ui.cursor;
        const x2 = x + delta.dx;
        const y2 = y + delta.dy;
        const got =
          x2 >= 0 && x2 < b.w && y2 >= 0 && y2 < b.h
            ? joining(b, y * b.w + x, y2 * b.w + x2)
            : null;
        if (got !== null) {
          moveCursor(ui.cursor, button, b.w, b.h);
          return linkEdit(b, got.c, got.q);
        }
        return UI_UPDATE;
      }
      if (isL) return UI_UPDATE;
    }
    if (!isL || !ui.cursor.visible) return PASS;
    const c = ui.cursor.y * b.w + ui.cursor.x;
    const clues = cluesOf(b) as ClueList;
    if (clueAt(clues, c) < 0 && !linkable(b, c)) return null;
    ui.linkArmed = true;
    return UI_UPDATE;
  }

  /** Shift or Ctrl with an arrow paints the cells the cursor leaves and
   * enters with the secondary value: Shift the open ones, Ctrl the primary
   * ones as well; or, where the values are lines, by the way it moves. A
   * bare arrow only moves the cursor. */
  function strokeKey(b: FillBoard<C>, ui: FillUi, raw: number): Edit | UiUpdate | null {
    const c0 = ui.cursor.y * b.w + ui.cursor.x;
    const delta = cursorDelta(stripModifiers(raw));
    const moved = geometry.moveCursor(
      b,
      ui,
      module.hexagon === undefined ? stripModifiers(raw) : raw & ~(MOD_SHFT | MOD_CTRL),
    );
    const c1 = ui.cursor.y * b.w + ui.cursor.x;
    const set: number[] = [];
    // Where the values are lines, Ctrl draws the line along the way the
    // cursor moves, Shift the one across it, and both empty the cells.
    const both = MOD_SHFT | MOD_CTRL;
    const across = delta !== null && delta.dy === 0;
    const line =
      axes === null
        ? null
        : (raw & both) === both
          ? 0
          : raw & MOD_CTRL
            ? across
              ? axes.row
              : axes.column
            : across
              ? axes.column
              : axes.row;
    for (const c of c0 === c1 ? [c0] : [c0, c1]) {
      const v = b.values[c];
      if (b.fixed[c]) continue;
      if (line !== null) {
        if (v !== line) set.push(c, line);
      } else if (v === 0 || (raw & MOD_CTRL && v === primary)) set.push(c, secondary);
    }
    if (set.length > 0) return { set };
    return moved ? UI_UPDATE : null;
  }

  return {
    targetVerbs,
    pendingEdit,
    linkEdit,
    previewed(b, ui) {
      const edit = pendingEdit(b, ui);
      return edit === null ? b : applyEdit(module, b, edit);
    },
    interpretMove(b, ui, ds, p, raw) {
      const button = stripModifiers(raw);
      if (ui.drag !== null && (isMouseDown(button) || ui.dragButton >= 0)) {
        const got = lineDrag(b, ui, ui.drag, ds, p, button);
        if (got !== PASS) return got;
      }
      const linked = linkKey(b, ui, button);
      if (linked !== PASS) return linked;
      if (movesCursor(raw) && raw & (MOD_SHFT | MOD_CTRL)) return strokeKey(b, ui, raw);
      if (movesCursor(raw) && !isCursorMove(button))
        return geometry.moveCursor(b, ui, raw) ? UI_UPDATE : null;
      return interpretTargetVerbs(targetVerbs, b, ui, ds, p, raw);
    },
  };
}

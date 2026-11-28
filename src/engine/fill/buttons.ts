/**
 * A board of buttons' input, built from its description's `play:`: the
 * verbs each button and key applies, the drag, the Shift/Ctrl-arrow stroke
 * and the link gesture. Every move is an `Edit`, so no game writes its own
 * input. A board of numbers' is `numbers.ts`.
 */

import { UI_UPDATE, type UiUpdate } from "../contract/game.ts";
import type { Point } from "../contract/types.ts";
import { isDigit } from "../game-id/decimal.ts";
import {
  cursorDelta,
  endDrag,
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
import {
  type Clues,
  type FillBoard,
  type FillModule,
  listOf,
  spaceOf,
} from "./board.ts";
import { type Button, clickOf } from "./click.ts";
import { edgeGeometry, edgeReach, elementAtPoint } from "./edge-target.ts";
import { applyEdit, type Edit } from "./edit.ts";
import type { FillPlay, FillUi } from "./play.ts";

/** Whether the painter named `paint` draws one of a pair of alike pieces. */
const paired = (paint: string): boolean =>
  paint in PAINTERS && PAINTERS[paint as keyof typeof PAINTERS].pair !== undefined;

/** The line the painter named `paint` runs along, where it draws a line
 * through its cell. */
const axisOf = (paint: string): "row" | "column" | null =>
  paint in PAINTERS ? (PAINTERS[paint as keyof typeof PAINTERS].axis ?? null) : null;

/** A board played with the two buttons, each placing a value. */
type ButtonPlay = FillPlay &
  Required<Pick<FillPlay, "values" | "primary" | "secondary">>;

/** `play` as a board of buttons: the schema gives one all three fields,
 * and a board of numbers (`FillPlay.numbers`) none. */
function buttonsOf(play: FillPlay): ButtonPlay {
  const { values, primary, secondary } = play;
  if (values === undefined || primary === undefined || secondary === undefined)
    throw new Error("play: a board of numbers has no buttons");
  return { ...play, values, primary, secondary };
}

/** The values that are lines through their cell, by the line they run
 * along, or `null` where the values are not both lines. */
function axesOf(play: ButtonPlay): { row: number; column: number } | null {
  const by = new Map(
    Object.entries(play.values).map(([v, { paint }]) => [axisOf(paint), Number(v)]),
  );
  const row = by.get("row");
  const column = by.get("column");
  return row === undefined || column === undefined ? null : { row, column };
}

/** The Controls paragraph's sentence about the drag, for a game whose
 * values are lines (`lines`) or not. */
function dragWords(play: FillPlay, noun: string, lines: boolean): string {
  const along = play.straight === true ? " along a row or column" : "";
  if (lines)
    return (
      `Drag${along} to draw a line that way through each ${noun} you pass ` +
      `over; a drag that starts on a line already running that way clears ` +
      `them instead.`
    );
  const words =
    `drag${along} to do the same to every ${noun} you pass over that looked ` +
    `the same as the first.`;
  return play.sweepWith === undefined
    ? `Keep the button down and ${words}`
    : `Keep the right button down and ${words} A left drag acts only where it began.`;
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
 * The input `play` declares, on a board drawn `origin(tileSize, board)`
 * pixels in from the top and left of the canvas.
 */
export function fillInput<C extends Clues<C>, D extends Tiled>(
  module: FillModule<C>,
  buttons: FillPlay,
  origin: (tileSize: number, board: FillBoard<C>) => number,
  gap: (tileSize: number) => number = () => 0,
): FillInput<C, D> {
  const play = buttonsOf(buttons);
  const { primary, secondary } = play;
  const axes = axesOf(play);
  if (axes !== null && play.straight !== true)
    throw new Error("play: a game whose values are lines drags straight");
  type Verb = TargetVerb<FillBoard<C>, FillUi, Point, Edit>;
  // On an answer on the edges, a target is an edge's half-grid point
  // (`edge-target.ts`), and a drag is the engine's sweep along the edges.
  const onEdges = module.answerSort === "edge";
  const geometry = onEdges
    ? edgeGeometry<FillBoard<C>, D>(origin)
    : module.hexagon === undefined
      ? squareGrid<FillBoard<C>, D>({
          size: (b) => b,
          border: origin,
          gap,
          ...(play.wrap === true ? { wrap: true } : {}),
        })
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

  /** The element target `t` is, `-1` where it is none. */
  const elementAt = (b: FillBoard<C>, t: Point): number =>
    onEdges ? elementAtPoint(spaceOf(module, b), t) : t.y * b.w + t.x;
  /** A verb that sets an element to `to(v)` from `v`, or means nothing on a
   * fixed one or where it would leave the element as it is. */
  const setting =
    (to: (v: number) => number) =>
    (b: FillBoard<C>, t: Point): Edit | null => {
      const c = elementAt(b, t);
      if (c < 0) return null;
      const v = to(b.values[c]);
      return b.fixed[c] || v === b.values[c] ? null : { set: [c, v] };
    };
  const click = clickOf(play);
  /** A button's verb, as its click goes (`click.ts`). */
  const clicking = (button: Button): Verb => ({
    does: click.does(button),
    apply: setting((v) => click.next(button, v)),
  });
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
          button: click.buttonOf(value),
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
    primary: clicking("primary"),
    // One of a pair of alike pieces (Unruly's block and disc), or of two
    // lines (Sticks'), is placed as the other is, and rules nothing out.
    secondary:
      paired(play.values[secondary].paint) || axes !== null
        ? clicking("secondary")
        : rulingOut(clicking("secondary")),
    keyOnly,
    ...(onEdges
      ? {
          sweep: {
            holds: (b: FillBoard<C>, t: Point) => b.values[elementAt(b, t)],
            ...(play.sweepWith === undefined ? {} : { buttons: [play.sweepWith] }),
            ...edgeReach<FillBoard<C>, D>(origin),
          },
        }
      : { drags: dragWords(play, geometry.noun, axes !== null) }),
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
    if (drag === undefined || !drag.live || !ui.dragOk || ui.dragButton < 0)
      return null;
    const link = dragLink(b, ui, drag);
    if (link !== null) return link;
    const { sx, sy, ex, ey } = drag;
    if (axes !== null && (sx !== ex || sy !== ey)) return alongEdit(b, drag, axes);
    // The press is its button's verb where it began, and a drag gives every
    // cell it passes that held what the first held what the first became.
    const first = sy * b.w + sx;
    const made = buttonVerb(targetVerbs, ui.dragButton)?.apply(b, { x: sx, y: sy }, ui);
    if (made === undefined || made === null || made === UI_UPDATE) return null;
    const sweeps = play.sweepWith === undefined || ui.dragButton === RIGHT_BUTTON;
    const became = made.set?.[1];
    if (!sweeps || became === undefined) return made;
    const set = [first, became];
    for (const c of play.straight === true ? lineCells(b, drag) : ui.path)
      if (c !== first && !b.fixed[c] && b.values[c] === b.values[first])
        set.push(c, became);
    return { set };
  }

  /** The cells from a straight drag's start to its end, which share a row or
   * a column. */
  function lineCells(b: FillBoard<C>, { sx, sy, ex, ey }: GridDrag): number[] {
    const cells: number[] = [];
    for (let y = Math.min(sy, ey); y <= Math.max(sy, ey); y++)
      for (let x = Math.min(sx, ex); x <= Math.max(sx, ex); x++)
        cells.push(y * b.w + x);
    return cells;
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

  /** Every cell the pointer passed from `from` to `to`, sampled a few pixels
   * apart, added to a free drag's path. */
  function follow(b: FillBoard<C>, ui: FillUi, ds: D, from: Point, to: Point): void {
    const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / 3));
    for (let i = 1; i <= steps; i++) {
      const q = {
        x: from.x + ((to.x - from.x) * i) / steps,
        y: from.y + ((to.y - from.y) * i) / steps,
      };
      const t = geometry.pointerTarget(b, ds, q, ui);
      if (t === null) continue;
      const c = t.y * b.w + t.x;
      if (!ui.path.includes(c)) ui.path.push(c);
    }
  }

  /** The drag: a press starts it, it keeps to one row or column where `play`
   * says it is straight and follows the pointer otherwise, and its release
   * makes the edit it previewed. */
  function dragArm(
    b: FillBoard<C>,
    ui: FillUi,
    drag: GridDrag,
    ds: D,
    p: Point,
    button: number,
  ): Arm {
    const at = targetVerbs.geometry.pointerTarget(b, ds, p, ui);
    if (button === LEFT_BUTTON || button === RIGHT_BUTTON) {
      if (at === null) return PASS;
      ui.dragButton = button;
      startDrag(drag, at.x, at.y);
      ui.path = [at.y * b.w + at.x];
      ui.last = p;
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
    if (play.straight !== true) {
      follow(b, ui, ds, ui.last, p);
      ui.last = p;
    }
    if (at === null) ui.dragOk = false;
    else {
      const { sx, sy } = drag;
      // A straight drag's coordinate that moved less goes back to its start.
      if (play.straight !== true) moveDrag(drag, at.x, at.y);
      else if (Math.abs(at.x - sx) < Math.abs(at.y - sy)) moveDrag(drag, sx, at.y);
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
      // On the edges the verbs are all of it: a drag is their sweep, and an
      // arrow with Shift or Ctrl moves the cursor as a bare one does.
      if (onEdges) return interpretTargetVerbs(targetVerbs, b, ui, ds, p, raw);
      const button = stripModifiers(raw);
      if (isMouseDown(button) || ui.dragButton >= 0) {
        ui.drag ??= newDrag();
        const got = dragArm(b, ui, ui.drag, ds, p, button);
        if (got !== PASS) return got;
      }
      // A press off the grid shows or hides the numbers the piece covers.
      if (
        play.covers !== undefined &&
        isMouseDown(button) &&
        geometry.pointerTarget(b, ds, p, ui) === null
      ) {
        ui.cursor.visible = false;
        ui.hiddenShown = !ui.hiddenShown;
        return UI_UPDATE;
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

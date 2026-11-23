/**
 * A clue the player marks done (`play.done`), grayed so the eye skips it.
 * The board keeps one flag a clue of each such kind, by its index in the
 * kind's list, so the mark is the same wherever the clue sits; where a press
 * finds it is the clue's place's (a gap, for a clue at an edge; its drawn
 * text, for a clue at a part; its margin square, for a clue at a slot).
 */

import type { Point, Rect } from "../contract/types.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_UP,
  MOD_CTRL,
  MOD_SHFT,
  stripModifiers,
} from "../input/pointer.ts";
import { dragMarkVerbs, type TargetVerbs } from "../input/target-verb.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";
import { type Clues, type FillBoard, type FillModule, spaceOf } from "./board.ts";
import { gapClueAt, gapKindsOf } from "./gaps.ts";
import type { FillPlay, FillUi } from "./play.ts";
import { slotAt, slotClueAt } from "./slots.ts";

/** The clue of the part holding cell `c` on a board drawn at tile size
 * `ts`, with the box it is drawn in (`FillRender.partClueBox`). */
export type PartClueAt<C> = (
  ts: number,
  board: FillBoard<C>,
  c: number,
) => { readonly box: Rect; readonly kind: string; readonly k: number } | null;

/** A tile size for a part clue's kind and index alone. */
const KEY_TILE = 32;

/** Marks clue `k` of kind `kind` done, or unmarks it. */
export interface DoneMove {
  readonly type: "done";
  readonly kind: string;
  readonly k: number;
}

/** Whether `move` has a done move's shape, as a save holds it. */
export function isDoneShaped(move: unknown): move is DoneMove {
  if (typeof move !== "object" || move === null) return false;
  const m = move as { type?: unknown; kind?: unknown; k?: unknown };
  return m.type === "done" && typeof m.kind === "string" && Number.isInteger(m.k);
}

/** The board after `move`: its clue's flag flipped. A kind the board marks
 * none of, or a clue it lacks, was not built by the engine, and throws. */
export function applyDone<C>(board: FillBoard<C>, move: DoneMove): FillBoard<C> {
  const flags = board.done[move.kind];
  if (flags === undefined || move.k < 0 || move.k >= flags.length)
    throw new Error(`done: no clue ${move.k} of ${move.kind}`);
  const next = flags.slice();
  next[move.k] ^= 1;
  return { ...board, done: { ...board.done, [move.kind]: next } };
}

/** Whether clue `k` of `kind` is marked done on `board`. */
export const isDone = <C>(board: FillBoard<C>, kind: string, k: number): boolean =>
  board.done[kind]?.[k] === 1;

/** The done move for the clue drawn at edge `e`, the first of the kinds
 * marked done that has one; `null` where none does. */
function clueAtEdge<C extends Clues<C>>(
  module: FillModule<C>,
  play: FillPlay,
  board: FillBoard<C>,
  e: number,
): DoneMove | null {
  if (e < 0) return null;
  const clue = gapClueAt(gapKindsOf<C>(play), board, spaceOf(module, board), e);
  if (clue === null || !clue.painter.shows(clue.clue)) return null;
  return clue.name in (play.done ?? {})
    ? { type: "done", kind: clue.name, k: clue.k }
    : null;
}

/** A board's done marks: the drag declaration (`Game.doneClues`), and the
 * Shift or Ctrl arrow that marks the clue beside the cursor. */
export interface DoneInput<C, D> {
  readonly verbs: TargetVerbs<FillBoard<C>, FillUi, D, DoneMove, DoneMove>;
  /** Whether `rawButton` is a Shift or Ctrl arrow, which is the mark's. */
  isKey(rawButton: number): boolean;
  /** The done move the Shift or Ctrl arrow `rawButton` makes from the
   * cursor, `null` where no clue is that way. */
  keyed(board: FillBoard<C>, ui: FillUi, rawButton: number): DoneMove | null;
}

/**
 * The done marks of a board drawn with `gap` pixels between its cells from
 * `origin`, where its clues sit at edges: a press in a gap marks the clue in
 * it, with either button, and a drag on through the gaps marks each that
 * looked the same, as upstream Unequal's does. Where its clues sit at parts
 * (`partClue`), a press on a clue's text marks it, and a drag on marks
 * those that looked the same alike. Where they sit at slots (`slotKinds`), a
 * press on one in the margin marks it, and Shift or Ctrl with an arrow marks
 * the one at that end of the cursor's line.
 */
export function doneInput<C extends Clues<C>, D extends { readonly tileSize: number }>(
  module: FillModule<C>,
  play: FillPlay,
  origin: (tileSize: number, board: FillBoard<C>) => number,
  gap: (tileSize: number) => number,
  partClue: PartClueAt<C> | null = null,
  slotKinds: readonly (keyof C)[] = [],
): DoneInput<C, D> | null {
  const nouns = Object.values(play.done ?? {});
  if (nouns.length === 0) return null;
  const pitch = (ts: number): number => ts + gap(ts);
  const marked = (kind: string, k: number): DoneMove | null =>
    kind in (play.done ?? {}) ? { type: "done", kind, k } : null;
  /** The clue at slot `s`, where it is one marked done. */
  const atSlot = (b: FillBoard<C>, s: number): DoneMove | null => {
    if (s < 0) return null;
    const clue = slotClueAt(slotKinds, b, s);
    return clue === null ? null : marked(clue.kind, clue.k);
  };
  /** The clue in the margin square round `p`, beyond a line's end. */
  const slotClueOf = (b: FillBoard<C>, ts: number, p: Point): DoneMove | null => {
    if (slotKinds.length === 0) return null;
    const o = origin(ts, b);
    const x = Math.floor((p.x - o) / pitch(ts));
    const y = Math.floor((p.y - o) / pitch(ts));
    return atSlot(b, slotAt(b.w, b.h, x, y));
  };
  /** The clue of a part drawn round `p`, a few pixels' slack about its
   * text: a press elsewhere in its square selects the square. */
  const partClueAt = (b: FillBoard<C>, ts: number, p: Point): DoneMove | null => {
    if (partClue === null) return null;
    const o = origin(ts, b);
    const x = Math.floor((p.x - o) / pitch(ts));
    const y = Math.floor((p.y - o) / pitch(ts));
    if (x < 0 || y < 0 || x >= b.w || y >= b.h) return null;
    const clue = partClue(ts, b, y * b.w + x);
    if (clue === null) return null;
    const { box } = clue;
    const slack = Math.max(2, Math.floor(ts / 12));
    const inside =
      p.x >= box.x - slack &&
      p.x < box.x + box.w + slack &&
      p.y >= box.y - slack &&
      p.y < box.y + box.h + slack;
    return inside ? marked(clue.kind, clue.k) : null;
  };
  /** The edge whose gap holds `p`, or `-1`: past a cell's right side and
   * within its height, or below it and within its width. */
  const edgeAt = (sp: GridSpace, b: FillBoard<C>, ts: number, p: Point): number => {
    const o = origin(ts, b);
    const x = Math.floor((p.x - o) / pitch(ts));
    const y = Math.floor((p.y - o) / pitch(ts));
    if (x < 0 || y < 0 || x >= b.w || y >= b.h) return -1;
    const right = p.x - o - x * pitch(ts) >= ts;
    const below = p.y - o - y * pitch(ts) >= ts;
    if (right === below) return -1;
    const c = y * b.w + x;
    if (right) return x + 1 < b.w ? sp.edgeOf(c, c + 1) : -1;
    return y + 1 < b.h ? sp.edgeOf(c, c + b.w) : -1;
  };
  const verbs = dragMarkVerbs<FillBoard<C>, FillUi, D, DoneMove, DoneMove>({
    // One noun the help page says, the first kind's.
    noun: nouns[0],
    target: (b, ds, p) =>
      clueAtEdge(module, play, b, edgeAt(spaceOf(module, b), b, ds.tileSize, p)) ??
      partClueAt(b, ds.tileSize, p) ??
      slotClueOf(b, ds.tileSize, p),
    apply: (_b, clue) => clue,
    button: "either",
    sweep: { holds: (b, { kind, k }) => (isDone(b, kind, k) ? 1 : 0) },
  });
  const steps: readonly (readonly [number, number, number])[] = [
    [CURSOR_UP, 0, -1],
    [CURSOR_DOWN, 0, 1],
    [CURSOR_LEFT, -1, 0],
    [CURSOR_RIGHT, 1, 0],
  ];
  const stepOf = (raw: number) =>
    (raw & (MOD_SHFT | MOD_CTRL)) === 0
      ? null
      : (steps.find(([key]) => key === stripModifiers(raw)) ?? null);
  return {
    verbs,
    isKey: (raw) => stepOf(raw) !== null,
    keyed(b, ui, raw) {
      const step = stepOf(raw);
      if (step === null) return null;
      const { x, y } = ui.cursor;
      // On a board of clues at parts, any arrow marks the cursor's own
      // part's: its box is not read, so any tile size serves.
      const clue = partClue?.(KEY_TILE, b, y * b.w + x) ?? null;
      if (clue !== null) return marked(clue.kind, clue.k);
      // On a board of clues at slots, the clue at that end of the cursor's
      // line.
      if (slotKinds.length > 0) {
        const [dx, dy] = [step[1], step[2]];
        const ex = dx === 0 ? x : dx < 0 ? -1 : b.w;
        const ey = dy === 0 ? y : dy < 0 ? -1 : b.h;
        return atSlot(b, slotAt(b.w, b.h, ex, ey));
      }
      const [nx, ny] = [x + step[1], y + step[2]];
      if (nx < 0 || ny < 0 || nx >= b.w || ny >= b.h) return null;
      const sp = spaceOf(module, b);
      return clueAtEdge(module, play, b, sp.edgeOf(y * b.w + x, ny * b.w + nx));
    },
  };
}

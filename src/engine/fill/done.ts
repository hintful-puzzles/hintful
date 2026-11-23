/**
 * A clue the player marks done (`play.done`), grayed so the eye skips it.
 * The board keeps one flag a clue of each such kind, by its index in the
 * kind's list, so the mark is the same wherever the clue sits; where a press
 * finds it is the clue's place's (a gap, for a clue at an edge).
 */

import type { Point } from "../contract/types.ts";
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
import {
  type Clues,
  type FillBoard,
  type FillModule,
  listOf,
  spaceOf,
} from "./board.ts";
import type { FillPlay, FillUi } from "./play.ts";

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

/** The done move for the clue at edge `e`, the first of the kinds marked
 * done that has one; `null` where none does. */
function clueAtEdge<C>(
  play: FillPlay,
  board: FillBoard<C>,
  e: number,
): DoneMove | null {
  if (e < 0) return null;
  for (const kind of Object.keys(play.done ?? {})) {
    const k = listOf(board.dealt, kind as keyof C).byAt[e];
    if (k >= 0) return { type: "done", kind, k };
  }
  return null;
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
 * looked the same, as upstream Unequal's does.
 */
export function doneInput<C extends Clues<C>, D extends { readonly tileSize: number }>(
  module: FillModule<C>,
  play: FillPlay,
  origin: (tileSize: number, board: FillBoard<C>) => number,
  gap: (tileSize: number) => number,
): DoneInput<C, D> | null {
  const nouns = Object.values(play.done ?? {});
  if (nouns.length === 0) return null;
  const pitch = (ts: number): number => ts + gap(ts);
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
      clueAtEdge(play, b, edgeAt(spaceOf(module, b), b, ds.tileSize, p)),
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
      const [nx, ny] = [x + step[1], y + step[2]];
      if (nx < 0 || ny < 0 || nx >= b.w || ny >= b.h) return null;
      const sp = spaceOf(module, b);
      return clueAtEdge(play, b, sp.edgeOf(y * b.w + x, ny * b.w + nx));
    },
  };
}

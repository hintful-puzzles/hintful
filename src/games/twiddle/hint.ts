/**
 * Twiddle's hint: the planner's segments (`solver.ts`), one step a turn.
 *
 * A stage's tile travels by free turns, which move no finished tile, each its
 * own step, until the plan needs a sequence. From there to the tile's arrival
 * is one run: its first turn says what the run does and the rest say which
 * turn of it they are, flagged `continuesPrevious` so auto-play plays it as
 * one hint. A run always ends with the tile in place, so a step never promises
 * a square short of it.
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { SEARCH_OUT_OF_REACH } from "../../engine/hint-refusal.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { type Before, type Goal, say, type Turned } from "./hint-text.ts";
import { planTwiddle, type Turn, turnMove } from "./solver.ts";
import { doRotate, type TwiddleMove, type TwiddleState } from "./state.ts";

/** What a step's turn does for the tile it serves. */
export const TWIDDLE_RUNGS = [
  /** A free turn puts the tile in place. */
  "home",
  /** A free turn carries it nearer. */
  "carry",
  /** A run puts it in place and leaves the finished tiles as they were. */
  "run",
  /** A run that also puts tiles before its goal's place in place: the rest
   * of a run the player broke off, or a run that fills several on its way. */
  "fill",
] as const;
export type TwiddleRung = (typeof TWIDDLE_RUNGS)[number];

type Step = HintStep<TwiddleMove, unknown, TwiddleRung>;

export function hint(
  state: TwiddleState,
): HintResult<TwiddleMove, unknown, TwiddleRung> {
  const plan = planTwiddle(state);
  if (plan.segments.length === 0) return { ok: false, error: SEARCH_OUT_OF_REACH };

  const { w, n, orientable } = state;
  const size = state.numbers.length;
  const goal = Int32Array.from(state.numbers).sort();
  const rowsOnly = goal.some((v, i) => i > 0 && v === goal[i - 1]);
  const numbers = Int32Array.from(state.numbers);
  const orient = Uint8Array.from(state.orient);
  const right = (c: number) =>
    numbers[c] === goal[c] && (!orientable || orient[c] === 0);
  /** The first cell before `stage` that is wrong now, or -1. */
  const firstWrong = (stage: number) => {
    for (let c = 0; c < stage; c++) if (!right(c)) return c;
    return -1;
  };
  /** Whether a turn's block lies clear of the cells before `stage`. */
  const clear = (t: Turn, stage: number) => {
    const m = turnMove(w, n, t);
    const row = Math.floor(stage / w);
    return m.y > row || (m.y === row && m.x >= stage % w);
  };
  const play = (cells: Int32Array, t: Turn) => {
    const m = turnMove(w, n, t);
    doRotate(cells, new Uint8Array(size), w, n, false, m.x, m.y, m.dir);
  };

  const steps: Step[] = [];
  const segs = plan.segments;
  for (let i = 0; i < segs.length; ) {
    const stage = segs[i].stage;
    const fixedFrom = firstWrong(stage);
    // A free turn is its own step; anything else runs to the stage's end.
    const free =
      segs[i].turns.length === 1 && fixedFrom < 0 && clear(segs[i].turns[0], stage);
    const turns: Turn[] = [];
    if (free) turns.push(...segs[i++].turns);
    else
      for (; i < segs.length && segs[i].stage === stage; i++)
        turns.push(...segs[i].turns);

    const before: Before =
      fixedFrom < 0
        ? { fixes: false }
        : { fixes: true, tiles: Array.from(goal.subarray(fixedFrom, stage)) };
    // The tile served: the one the turns end on the stage's cell.
    const track = Int32Array.from({ length: size }, (_, c) => c);
    for (const t of turns) play(track, t);
    let at = track[stage];

    turns.forEach((t, k) => {
      const g: Goal = { at, number: goal[stage], rowsOnly };
      const m = turnMove(w, n, t);
      doRotate(numbers, orient, w, n, orientable, m.x, m.y, m.dir);
      const where = Int32Array.from({ length: size }, (_, c) => c);
      play(where, t);
      at = where.indexOf(at);
      const turned: Turned = { block: { x: m.x, y: m.y }, clockwise: m.dir === -1 };
      let rung: TwiddleRung;
      let words: Sentence;
      if (free) {
        const lands = at === stage && right(stage);
        rung = lands ? "home" : "carry";
        words = lands ? say.home(g, turned) : say.carry(g, turned);
      } else {
        rung = before.fixes ? "fill" : "run";
        words =
          turns.length === 1
            ? say.lastOfRun(g, turned, before)
            : k === 0
              ? say.runStart(g, turned, turns.length, before)
              : say.runOn(g, turned, k + 1, turns.length, before);
      }
      steps.push({
        move: m,
        rung,
        explanation: words.text,
        words,
        ...(k > 0 ? { continuesPrevious: true } : {}),
      });
    });
  }
  return { ok: true, steps };
}

/** A turn is named by its block and direction, so only the hinted one keeps
 * the plan. */
export function hintKeepTrack(
  m: TwiddleMove,
  step: HintStep<TwiddleMove>,
): HintTrackVerdict {
  const s = step.move;
  if (m.type !== "rotate" || s.type !== "rotate") return "off";
  return m.x === s.x && m.y === s.y && m.dir === s.dir ? "completed" : "off";
}

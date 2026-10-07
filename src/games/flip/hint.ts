/**
 * Flip's hint: the shortest answer, pressed in reading order.
 *
 * Nothing on a Flip board forces a press by itself, but an order does. Once
 * the squares before a square are left alone for good, a unlit square that no
 * later square flips can only be lit by this one. So a step is one of two
 * kinds: a press that is some unlit square's last chance, which is a deduction,
 * and a press nothing in the sweep decides, which is offered as one of the
 * fewest presses the board takes. The last press is said as what it is.
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import {
  NO_MOVE_WORTH_MAKING,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import type { Point } from "../../engine/types.ts";
import { say } from "./hint-text.ts";
import { shortestAnswer } from "./solver.ts";
import type { FlipMove, FlipState } from "./state.ts";

/** What a step rests on, by the branch of {@link hint} that chose its words. */
export const FLIP_RUNGS = ["lastPress", "lastChance", "fromTheAnswer"] as const;
export type FlipRung = (typeof FLIP_RUNGS)[number];

type Step = HintStep<FlipMove, unknown, FlipRung>;

/** For each square, the last square in reading order that flips it; -1 when
 * none does. */
function lastFlippers(s: Pick<FlipState, "w" | "h" | "matrix">): Int32Array {
  const wh = s.w * s.h;
  const last = new Int32Array(wh).fill(-1);
  for (let i = 0; i < wh; i++) {
    for (let j = 0; j < wh; j++) if (s.matrix[i * wh + j]) last[j] = i;
  }
  return last;
}

export function hint(state: FlipState): HintResult<FlipMove, unknown, FlipRung> {
  const answer = shortestAnswer(state);
  // Only a game ID typed by hand: the generator deals a board some presses
  // light, and a press keeps it one.
  if (!answer) return { ok: false, error: PUZZLE_NOT_REASONABLE };

  const { w, matrix } = state;
  const wh = w * state.h;
  const at = (i: number): Point => ({ x: i % w, y: Math.floor(i / w) });
  const last = lastFlippers(state);
  // Each step's unlit squares are read off the board it is shown on: the one
  // the presses before it leave.
  const grid = state.grid.slice();
  const steps: Step[] = [];
  // The presses the board a step is shown on still takes: the answer is the
  // shortest, and what is left of it is the shortest for the board it leaves.
  let left = answer.presses.reduce((n, p) => n + p, 0);
  for (let i = 0; i < wh; i++) {
    if (!answer.presses[i]) continue;
    const owed: Point[] = [];
    const also: Point[] = [];
    const unlit: Point[] = [];
    for (let j = 0; j < wh; j++) {
      if (j !== i && grid[j]) unlit.push(at(j));
      if (last[j] === i && grid[j]) owed.push(at(j));
      else if (j !== i && matrix[i * wh + j]) also.push(at(j));
    }
    // The last press says it finishes the board, whichever kind it is: every
    // square still unlit is one it flips.
    const rung: FlipRung =
      left === 1 ? "lastPress" : owed.length > 0 ? "lastChance" : "fromTheAnswer";
    const words =
      rung === "lastPress"
        ? say.lastPress(at(i), unlit)
        : rung === "lastChance"
          ? say.lastChance(at(i), owed, also)
          : say.fromTheAnswer(at(i), left, answer.only);
    left--;
    steps.push({
      move: { kind: "flip", ...at(i) },
      rung,
      explanation: words.text,
      words,
    });
    for (let j = 0; j < wh; j++) grid[j] ^= matrix[i * wh + j];
  }
  // A solved board, which the midend answers before asking.
  if (steps.length === 0) return { ok: false, error: NO_MOVE_WORTH_MAKING };
  return { ok: true, steps };
}

/** Pressing the step's square completes it; any other press changes which
 * presses are left, so the plan is dropped. */
export function hintKeepTrack(
  m: FlipMove,
  step: HintStep<FlipMove>,
  _state: FlipState,
): HintTrackVerdict {
  const want = step.move;
  if (m.kind !== "flip" || want.kind !== "flip") return "off";
  return m.x === want.x && m.y === want.y ? "completed" : "off";
}

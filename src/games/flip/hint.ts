/**
 * Flip's hint: the shortest answer, pressed in reading order.
 *
 * Nothing on a Flip board forces a press by itself, but an order does. Once
 * the squares before a square are left alone for good, a dark square that no
 * later square flips can only be lit by this one. So each step is one of two
 * kinds: a press that is some dark square's last chance, which is a deduction,
 * and a press nothing in the sweep decides, which the answer supplies.
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

export function hint(state: FlipState): HintResult<FlipMove> {
  const answer = shortestAnswer(state);
  // Only a game ID typed by hand: the generator deals a board some presses
  // light, and a press keeps it one.
  if (!answer) return { ok: false, error: PUZZLE_NOT_REASONABLE };

  const { w, matrix } = state;
  const wh = w * state.h;
  const at = (i: number): Point => ({ x: i % w, y: Math.floor(i / w) });
  const last = lastFlippers(state);
  // Each step's dark squares are read off the board it is shown on: the one
  // the presses before it leave.
  const grid = state.grid.slice();
  const steps: HintStep<FlipMove>[] = [];
  for (let i = 0; i < wh; i++) {
    if (!answer.presses[i]) continue;
    const owed: Point[] = [];
    for (let j = 0; j < wh; j++) if (last[j] === i && grid[j]) owed.push(at(j));
    const words =
      owed.length > 0
        ? say.lastChance(at(i), owed)
        : say.fromTheAnswer(at(i), answer.only);
    steps.push({ move: { kind: "flip", ...at(i) }, explanation: words.text, words });
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

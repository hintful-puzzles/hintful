/**
 * Flip's solver: the fewest presses that light the board.
 *
 * A press is its own undo and presses commute, so an answer is a set of
 * squares, and the sets that work are the solutions of a linear system over
 * GF(2): one equation a square, saying the presses that flip it are odd in
 * number exactly when it is unlit.
 */

import type { FlipState } from "./state.ts";

export interface FlipAnswer {
  /** 1 for each square to press, in reading order. */
  readonly presses: Uint8Array;
  /** Whether no other set of presses lights the board. */
  readonly only: boolean;
}

/**
 * The answer with the fewest presses, or `null` when no set of presses lights
 * the board.
 *
 * Among answers of that size it takes the first the counter reaches, and the
 * hint leans on that staying put. Pressing a square of the chosen answer
 * leaves the shortest answers that held it, each without it. The elimination
 * reads only the matrix, so the free squares are the same ones, and the press
 * either leaves every answer's free bits alone or clears the same bit in all
 * of them. Their order is unchanged either way, so the rest of the chosen
 * answer is chosen again.
 */
export function shortestAnswer(
  s: Pick<FlipState, "w" | "h" | "matrix" | "grid">,
): FlipAnswer | null {
  const wh = s.w * s.h;
  // equations[i] : wh coefficients + 1 value, over GF(2).
  const stride = wh + 1;
  const eq = new Uint8Array(stride * wh);
  for (let i = 0; i < wh; i++) {
    for (let j = 0; j < wh; j++) eq[i * stride + j] = s.matrix[j * wh + i];
    eq[i * stride + wh] = s.grid[i] & 1;
  }

  const rowXor = (r1: number, r2: number) => {
    for (let c = 0; c < stride; c++) eq[r1 * stride + c] ^= eq[r2 * stride + c];
  };

  let rowsDone = 0;
  let colsDone = 0;
  const free: number[] = [];
  for (;;) {
    let i = colsDone;
    let j = -1;
    for (; i < wh; i++) {
      for (j = rowsDone; j < wh; j++) {
        if (eq[j * stride + i]) break;
      }
      if (j < wh) break;
      free.push(i);
    }
    if (i === wh) {
      // Remaining equations are 0 = const; any 1 means insoluble.
      for (let r = rowsDone; r < wh; r++) {
        if (eq[r * stride + wh]) return null;
      }
      break;
    }
    if (j > rowsDone) rowXor(rowsDone, j);
    for (let r = rowsDone + 1; r < wh; r++) {
      if (eq[r * stride + i]) rowXor(r, rowsDone);
    }
    rowsDone++;
    colsDone = i + 1;
    if (rowsDone >= wh) break;
  }

  // Every answer, the free squares as a binary counter.
  const answer = new Uint8Array(wh);
  let best = new Uint8Array(wh);
  let bestLen = wh + 1;
  for (;;) {
    for (let r = rowsDone - 1; r >= 0; r--) {
      let lead = 0;
      while (lead < wh && !eq[r * stride + lead]) lead++;
      let v = eq[r * stride + wh];
      for (let k = lead + 1; k < wh; k++) {
        if (eq[r * stride + k]) v ^= answer[k];
      }
      answer[lead] = v;
    }
    let len = 0;
    for (let i = 0; i < wh; i++) if (answer[i]) len++;
    // Strictly fewer: the first answer of a size is the one kept.
    if (len < bestLen) {
      bestLen = len;
      best = answer.slice();
    }
    let i = 0;
    for (; i < free.length; i++) {
      answer[free[i]] = answer[free[i]] ? 0 : 1;
      if (answer[free[i]]) break;
    }
    if (i === free.length) break;
  }

  return { presses: best, only: free.length === 0 };
}

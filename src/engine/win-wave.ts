/**
 * The win flash: one highlight that travels the board, the same length in
 * every game.
 *
 * The engine owns the clock, the pace and how much is lit at once. A game owns
 * only where each of its elements sits along the route, which it says by the
 * **position** it asks {@link Flash.win} about, in steps: neighbors along the
 * route are one apart. That one number is the four routes:
 *
 *   - a path: the element's step from the start;
 *   - a loop: its step clockwise from the bottom-left corner ({@link loopSteps});
 *   - a network fed from a source: its distance from the source;
 *   - anything else: {@link sweepStep} of its center, a diagonal from the
 *     bottom left to the top right.
 */

import type { Point } from "./types.ts";

/** What `Game.redraw` is told about a flash. */
export interface Flash {
  /** Seconds into the flash the game's own `flashLength` asked for, and 0
   * when none is running, a win included. */
  readonly time: number;
  /** Whether a win flash is running, for a game that works its route out
   * (walks its loop, measures from its source) only when one is. */
  readonly winning: boolean;
  /** Whether the win's highlight is on the element at `position`. Ask for
   * every element that can light, on every frame, and for no other: the range
   * of positions asked about is the route the highlight travels. */
  win(position: number): boolean;
}

/** No flash of either kind: what a settled frame is drawn with. */
export const NO_FLASH: Flash = { time: 0, winning: false, win: () => false };

/** A flash of the game's own, `time` seconds in. */
export function ownFlash(time: number): Flash {
  return { time, winning: false, win: () => false };
}

/** How long the win flash lasts, on every board of every game. */
export const WIN_FLASH_S = 2;
/** How long the still flash lasts, which a player who asked for reduced
 * motion sees in the traveling one's place. */
export const WIN_STILL_S = 0.6;
/** The share of the route lit at once. A share and not a count of steps: at
 * one length for every board, a band a few squares long would light each
 * square of a long track for a few hundredths of a second. */
const WIN_BAND = 0.15;

/** The position of an element centered at `(x, y)` in a diagonal sweep from
 * the bottom left to the top right. Any coordinates with y downward serve, a
 * grid's or the canvas's, as long as one game uses one. */
export function sweepStep(x: number, y: number): number {
  return x - y;
}

/**
 * The sweep's positions for elements that sit on no grid (points, regions),
 * given their centers: each one's rank along the diagonal, elements on one
 * diagonal sharing a rank. Ranks and not {@link sweepStep} itself, because
 * scattered centers leave stretches of the diagonal with nothing on them,
 * and the highlight would cross those with the board dark.
 */
export function sweepRanks(points: readonly Point[]): number[] {
  const steps = points.map((p) => sweepStep(p.x, p.y));
  const ranked = [...new Set(steps)].sort((a, b) => a - b);
  const rank = new Map(ranked.map((step, i) => [step, i]));
  return steps.map((step) => rank.get(step) ?? 0);
}

/**
 * Each element's step around a closed route, given the elements' centers in
 * the order the route visits them (either way round). The count starts at the
 * element nearest the bottom-left corner and runs clockwise as drawn, y
 * downward.
 */
export function loopSteps(points: readonly Point[]): number[] {
  const n = points.length;
  let start = 0;
  // Twice the enclosed area, positive when the order is clockwise on screen.
  let turn = 0;
  for (let i = 0; i < n; i++) {
    const p = points[i];
    const q = points[(i + 1) % n];
    turn += p.x * q.y - q.x * p.y;
    const best = points[start];
    const d = sweepStep(p.x, p.y) - sweepStep(best.x, best.y);
    if (d < 0 || (d === 0 && p.y > best.y)) start = i;
  }
  return points.map((_, i) => (((turn >= 0 ? i - start : start - i) % n) + n) % n);
}

/**
 * A closed route in the order it runs, from its links: each link joins two
 * nodes, named by any numbers, and every node of the route has two links.
 * Returns the indices of `links` in route order, and the nodes, where
 * `nodes[i]` is the node `links[i]` is left by. Which of the two is the
 * route's element (Loopy's edges, Pearl's squares) is the game's to say, and
 * {@link loopSteps} takes it from there.
 */
export function walkLoop(links: readonly (readonly [number, number])[]): {
  links: number[];
  nodes: number[];
} {
  const at = new Map<number, number[]>();
  links.forEach(([a, b], i) => {
    for (const node of [a, b]) {
      const here = at.get(node);
      if (here) here.push(i);
      else at.set(node, [i]);
    }
  });
  const order: number[] = [];
  const nodes: number[] = [];
  if (links.length === 0) return { links: order, nodes };
  let link = 0;
  let node = links[0][0];
  do {
    order.push(link);
    nodes.push(node);
    const [a, b] = links[link];
    node = a === node ? b : a;
    const onward = at.get(node)?.find((i) => i !== link);
    if (onward === undefined) break;
    link = onward;
  } while (link !== 0 && order.length < links.length);
  return { links: order, nodes };
}

/** One win's highlight, from the move that won to the last element going
 * dark. The midend makes one, moves its clock and closes each frame. */
export class WinWave implements Flash {
  readonly time = 0;
  readonly winning = true;
  private elapsed = 0;
  private ended = false;
  // The positions asked about during the frame being drawn...
  private low = Number.POSITIVE_INFINITY;
  private high = Number.NEGATIVE_INFINITY;
  // ...and the route as the last finished frame left it. A frame is answered
  // from this alone, so asking twice in one frame (a warm draw state, then a
  // fresh one) gets one answer.
  private from = Number.NaN;
  private to = Number.NaN;

  /** `still`: the player asked for reduced motion, and the board lights all
   * at once in place of a highlight that travels. */
  constructor(private readonly still: boolean) {}

  win(position: number): boolean {
    if (position < this.low) this.low = position;
    if (position > this.high) this.high = position;
    // Past its length nothing is lit, said outright: the sums below would put
    // the last element a rounding error inside the band.
    if (Number.isNaN(this.from) || this.done) return false;
    if (this.still) return true;
    // Never under a step, so a board a few steps across has no moment with
    // nothing lit between one step and the next.
    const band = Math.max(1, (this.to - this.from) * WIN_BAND);
    // The head ends a band past the last element, which so goes dark too.
    const head =
      this.from + ((this.to - this.from + band) * this.elapsed) / WIN_FLASH_S;
    return position <= head && position > head - band;
  }

  /** Put the clock at `seconds` since the highlight set off. */
  seek(seconds: number): void {
    this.elapsed = seconds;
  }

  /** Close a frame: what it asked about is the route the next one travels. A
   * frame that asked nothing has no route, and ends the flash. */
  endFrame(): void {
    if (this.low > this.high) this.ended = true;
    this.from = this.low;
    this.to = this.high;
  }

  get done(): boolean {
    return this.ended || this.elapsed >= (this.still ? WIN_STILL_S : WIN_FLASH_S);
  }
}

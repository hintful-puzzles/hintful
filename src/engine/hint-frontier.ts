/**
 * Which deduction a hint plan takes next, when several are available at once:
 * the one that continues from what the plan's latest steps wrote.
 *
 * A candidate-elimination board routinely offers several independent firings at
 * one position, and a plan that takes whichever its scan reaches first walks
 * the player from one side of the board to the other for no reason the player
 * can see (`sequence-hints-in-cell-games`, `findings.md`). The rule is the
 * owner's (`order-hints-from-the-frontier` D1): stay where the work is, leave
 * only when nothing there fires, and among the firings at hand take the
 * cheapest. So continuity is the primary key and the game's own rung order the
 * tiebreak: a naked single beside the last step beats a strike beside it, and
 * both beat a naked single across the board.
 *
 * **"Continues" is shared ground, not distance.** A candidate continues from a
 * step when its premise reads a cell that step wrote (a hidden single in the row
 * a strike just touched, however far along the row), which is the relation the
 * player follows. Two cells side by side in different lines share nothing.
 *
 * **The frontier is the plan's own recent steps, most recent first**, and is
 * never the midend's displayed step or the player's last move: a plan is
 * recomputed whenever the player goes their own way, and an order keyed on
 * history would make two identical boards hint differently
 * (docs/games/hints.md § "Recompute-stable plans"). A fresh plan has no
 * frontier, so its first step is exactly the one the rung order gives.
 *
 * Only the choice is shared. Which firings are available, and what each one
 * reads, stays with the game that knows its deductions; a candidate that the
 * game cannot vouch for as available right now must not be offered at all,
 * because this module takes whatever it is handed.
 */

import type { Point } from "./types.ts";

/** A firing the plan could take now: the elements its premise reads, and how
 * to take it (emit its steps and apply them to the working board). `reads` is
 * asked only while a frontier is looking for a continuation. */
export interface FrontierCandidate<P = Point> {
  reads(): readonly P[];
  take(): void;
}

/** How many of the plan's latest steps count as the frontier. Continuing any of
 * the last three was available for 40% of the steps that continued none of
 * them, against 23% for the last one alone (`findings.md` § 1.5). */
const DEPTH = 3;

/**
 * The key of a cell on a `w` × `h` board, for a frontier over a grid. `null`
 * off the board (a clue in the margin): no step ever writes one, and a margin
 * cell keyed blindly would alias the first cell of the next row.
 */
export function gridKey(w: number, h: number = w): (p: Point) => number | null {
  return (p) => (p.x < 0 || p.y < 0 || p.x >= w || p.y >= h ? null : p.y * w + p.x);
}

/**
 * The frontier over whatever a game's steps act on, each named by `key`.
 *
 * **What an element is belongs to the game.** A grid game's is a cell
 * ({@link gridKey}); Map's is a region of a graph, which has no `(x, y)` at all
 * and is keyed by its own index. The rule never needed a geometry, only a way
 * to tell that two mentions name the same thing.
 */
export class HintFrontier<P = Point> {
  /** The elements each recent step wrote, most recent last. */
  private readonly recent: Set<number>[] = [];

  constructor(private readonly key: (p: P) => number | null) {}

  /**
   * Take the candidate that continues from the most recent step it can, trying
   * `rungs` in order at each depth; with nothing continuing, the first
   * candidate of the first non-empty rung, which is the choice the rung order
   * alone would make. Returns whether anything was taken.
   *
   * What the taken candidate wrote is read back off the steps it pushed onto
   * `steps` (their `targets`), so the frontier records what the player is shown
   * rather than what the game says it meant to do.
   */
  take(
    rungs: readonly (readonly FrontierCandidate<P>[])[],
    steps: readonly { highlights?: { targets?: readonly P[] } }[],
  ): boolean {
    const chosen = this.choose(rungs);
    if (!chosen) return false;
    const from = steps.length;
    chosen.take();
    const wrote = new Set<number>();
    for (let i = from; i < steps.length; i++)
      for (const p of steps[i].highlights?.targets ?? []) {
        const c = this.key(p);
        if (c !== null) wrote.add(c);
      }
    this.recent.push(wrote);
    if (this.recent.length > DEPTH) this.recent.shift();
    return true;
  }

  private choose(
    rungs: readonly (readonly FrontierCandidate<P>[])[],
  ): FrontierCandidate<P> | null {
    for (let age = this.recent.length - 1; age >= 0; age--) {
      const wrote = this.recent[age];
      for (const rung of rungs)
        for (const c of rung)
          if (
            c.reads().some((p) => {
              const i = this.key(p);
              return i !== null && wrote.has(i);
            })
          )
            return c;
    }
    for (const rung of rungs) if (rung.length > 0) return rung[0];
    return null;
  }
}

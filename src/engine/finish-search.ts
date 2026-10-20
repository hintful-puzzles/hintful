/**
 * The search for whether a position can still finish: depth-first, with a
 * memo of the positions it proved lost, budgeted in positions and drawing on a
 * request's `Allowance`, returning a `SearchOutcome`.
 *
 * The game says what its positions are; the soundness of the proof is said
 * here once. A key is compared exactly, a position is remembered as lost only
 * when every move from it was searched to the end, and a search the budget
 * cut short proves nothing but what it remembered.
 *
 * An ordered depth-first search is heavy-tailed: an early wrong turn buries
 * it in a subtree that cannot finish. So a plan may restart it with its ties
 * broken another way, sharing the memo, and end with one last try on the rest
 * of the budget (`add-samegame-hint` design D2). A try that finishes without a
 * line has searched everything, which is the proof.
 */

import type { Allowance } from "./rival-judging.ts";
import type { SearchOutcome } from "./search-outcome.ts";

/** What a game tells the search about its positions. */
export interface FinishSearch<Pos, Step> {
  /** Exact, never hashed: a collision would make a position that finishes
   * read as lost. A number is far faster in a `Set` where one fits. */
  readonly key: (p: Pos) => number | string;
  readonly finished: (p: Pos) => boolean;
  /** Sound and cheap: true only of a position nothing finishes from. */
  readonly lostAtAGlance: (p: Pos) => boolean;
  /**
   * The moves from `p` in the order to try them, each with the position after
   * it, drawn one at a time; `salt` is the restart, for a tie-break that
   * differs from one to the next. The search keeps no position past its turn,
   * so a game may hand out one board changed in place, and change it back in
   * a `finally` that runs when the search stops drawing.
   */
  readonly children: (p: Pos, salt: number) => Iterable<readonly [Step, Pos]>;
}

/** How a search spends its positions: `tries` restarts of `restart` positions
 * each, then one last try with whatever is left of `budget`. */
export interface Plan {
  readonly budget: number;
  readonly restart: number;
  readonly tries: number;
}

/** One try with the whole budget. */
export const exhaustive = (budget: number): Plan => ({ budget, restart: 0, tries: 0 });

/**
 * A line from `start` that finishes, a proof that none does, or neither past
 * the plan's budget or the `allowance`, whichever runs out first. A position
 * counts when it is expanded, which is where the cost is; a finished one is
 * never expanded.
 */
export function searchFinish<Pos, Step>(
  start: Pos,
  game: FinishSearch<Pos, Step>,
  plan: Plan,
  allowance: Allowance = { left: Number.POSITIVE_INFINITY },
): SearchOutcome<Step> {
  if (game.finished(start)) return { kind: "found", line: [] };
  const lost = new Set<number | string>();
  let left = plan.budget;
  for (let salt = 0; salt <= plan.tries && left > 0 && allowance.left > 0; salt++) {
    const cap = salt < plan.tries ? Math.min(left, plan.restart) : left;
    let work = 0;
    const line: Step[] = [];
    const dfs = (p: Pos): boolean | null => {
      if (game.finished(p)) return true;
      const key = game.key(p);
      if (lost.has(key)) return false;
      if (++work > cap || --allowance.left < 0) return null;
      if (!game.lostAtAGlance(p)) {
        for (const [step, after] of game.children(p, salt)) {
          line.push(step);
          const r = dfs(after);
          if (r !== false) return r;
          line.pop();
        }
      }
      lost.add(key);
      return false;
    };
    const r = dfs(start);
    left -= Math.min(work, cap);
    if (r === true) return { kind: "found", line };
    if (r === false) return { kind: "lost" };
  }
  return { kind: "out-of-reach" };
}

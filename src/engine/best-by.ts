/**
 * The best of a set by a score, and whether it is best alone.
 *
 * A hint that chooses among equally good moves by a secondary measure (the
 * room a move leaves, the answers a guess rules out) takes the best by it
 * (docs/hints-search.md § "What every game does": a secondary objective is a
 * tie-break among equal gains). A sentence that says so, "more than any
 * other", is true only where no other ties it, which `alone` says.
 */

/** The item of `items` with the greatest `score`, the first of a tie, and
 * whether every other item scores less; null of none. */
export function bestBy<T>(
  items: Iterable<T>,
  score: (item: T) => number,
): { item: T; score: number; alone: boolean } | null {
  let best: { item: T; score: number; alone: boolean } | null = null;
  for (const item of items) {
    const s = score(item);
    if (best === null || s > best.score) best = { item, score: s, alone: true };
    else if (s === best.score) best.alone = false;
  }
  return best;
}

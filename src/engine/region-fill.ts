/**
 * Which fill each region of a division takes, so that a board whose regions
 * the puzzle gives can color them: two regions that share a side never take
 * the same fill, however few fills there are for however many regions.
 *
 * The answer is a function of the division alone, with no random draw, so a
 * board wears the same fills each time it is opened.
 */

/** The regions each region shares a side with, and those it meets only at a
 * corner. */
function neighbors(
  regions: ArrayLike<number>,
  w: number,
  count: number,
): { beside: Set<number>[]; cornering: Set<number>[] } {
  const h = regions.length / w;
  const beside = Array.from({ length: count }, () => new Set<number>());
  const cornering = Array.from({ length: count }, () => new Set<number>());
  const join = (sets: Set<number>[], a: number, b: number): void => {
    if (a === b) return;
    sets[a].add(b);
    sets[b].add(a);
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const r = regions[y * w + x];
      if (x + 1 < w) join(beside, r, regions[y * w + x + 1]);
      if (y + 1 < h) {
        join(beside, r, regions[(y + 1) * w + x]);
        if (x + 1 < w) join(cornering, r, regions[(y + 1) * w + x + 1]);
        if (x > 0) join(cornering, r, regions[(y + 1) * w + x - 1]);
      }
    }
  }
  cornering.forEach((set, r) => {
    for (const other of beside[r]) set.delete(other);
  });
  return { beside, cornering };
}

/**
 * A fill for each region of a division, as a number below `fills`, indexed by
 * the region's number (`regionNumbers`, `divide.ts`). `regions` is each cell's
 * region, row by row, on a grid `w` wide.
 *
 * Regions that share a side differ. Past that the fills are spread: a region
 * takes the fill fewest regions have so far, and of those one that no region
 * it meets at a corner has. Four fills are enough for any division
 * of a grid, and a call with fewer throws where the division needs more.
 */
export function regionFills(
  regions: ArrayLike<number>,
  w: number,
  fills: number,
): Uint8Array {
  let count = 0;
  for (let i = 0; i < regions.length; i++) count = Math.max(count, regions[i] + 1);
  const { beside, cornering } = neighbors(regions, w, count);

  const NONE = 255;
  const fill = new Uint8Array(count).fill(NONE);
  const used = new Int32Array(fills);
  const fillsOf = (set: Set<number>): Set<number> => {
    const out = new Set<number>();
    for (const r of set) if (fill[r] !== NONE) out.add(fill[r]);
    return out;
  };

  // The region with the fewest fills left to it goes next, so a dead end is
  // met where it is made; among those, the one with the most neighbors.
  const next = (): number => {
    let best = -1;
    let bestTaken = -1;
    for (let r = 0; r < count; r++) {
      if (fill[r] !== NONE) continue;
      const taken = fillsOf(beside[r]).size;
      if (
        taken > bestTaken ||
        (taken === bestTaken && beside[r].size > beside[best].size)
      ) {
        best = r;
        bestTaken = taken;
      }
    }
    return best;
  };

  const place = (left: number): boolean => {
    if (left === 0) return true;
    const r = next();
    const taken = fillsOf(beside[r]);
    const atCorner = fillsOf(cornering[r]);
    const choices = Array.from({ length: fills }, (_, k) => k)
      .filter((k) => !taken.has(k))
      .sort(
        (a, b) =>
          used[a] - used[b] ||
          Number(atCorner.has(a)) - Number(atCorner.has(b)) ||
          a - b,
      );
    for (const k of choices) {
      fill[r] = k;
      used[k]++;
      if (place(left - 1)) return true;
      used[k]--;
      fill[r] = NONE;
    }
    return false;
  };

  if (!place(count))
    throw new Error(`${fills} fills cannot color a division of ${count} regions`);
  return fill;
}

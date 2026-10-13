/**
 * Coloring the regions of a division, so that two regions that share a side
 * never take the same fill.
 *
 * One walk, {@link colorRegions}, and two callers that differ only in what
 * they do where the division leaves a choice. Map's generator draws: the
 * coloring is the puzzle's answer, and a seed deals its own. A board that
 * colors the regions the puzzle gives takes {@link regionFills}, which draws
 * nothing, so the board wears the same fills each time it is opened.
 */

/** For each region, the regions it shares a side with, and those it meets
 * only at a corner. `regions` is each cell's region, row by row, on a grid
 * `w` wide. */
function regionNeighbors(
  regions: ArrayLike<number>,
  w: number,
): { beside: number[][]; cornering: number[][] } {
  let count = 0;
  for (let i = 0; i < regions.length; i++) count = Math.max(count, regions[i] + 1);
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
  return {
    beside: beside.map((set) => [...set]),
    cornering: cornering.map((set, r) => [...set].filter((o) => !beside[r].has(o))),
  };
}

/** What the walk does where the division leaves it a choice. */
export interface FillChoice {
  /** The region to fill next, of those with the fewest fills left to them,
   * which are `tied` in order of their numbers. */
  region(tied: readonly number[]): number;
  /**
   * The order to try a region's fills in. `free` is the fills none of its
   * neighbors has, lowest first, and is the walk's to give away; `fill` is
   * each region's fill so far, -1 where it has none.
   */
  order(free: number[], region: number, fill: Int32Array): readonly number[];
}

/**
 * A fill below `fills` for each region, such that no two regions in each
 * other's `beside` take the same one, or `null` where there is none. Four
 * fills are enough for any division of a grid.
 *
 * The region with the fewest fills left to it goes next, so that a dead end
 * is met where it is made, and a fill that leads to one is taken back.
 * `choice` settles the rest, and is asked in the order the walk goes: once
 * for the region and once for its fills, at every step.
 */
export function colorRegions(
  beside: readonly (readonly number[])[],
  fills: number,
  choice: FillChoice,
): Int32Array | null {
  const count = beside.length;
  const fill = new Int32Array(count).fill(-1);
  // How many of a region's neighbors hold each fill, and how many fills none
  // of them holds.
  const held = new Int32Array(count * fills);
  const left = new Int32Array(count).fill(fills);

  const place = (): boolean => {
    let fewest = fills + 1;
    let tied: number[] = [];
    for (let r = 0; r < count; r++) {
      if (fill[r] >= 0 || left[r] > fewest) continue;
      if (left[r] < fewest) {
        fewest = left[r];
        tied = [];
      }
      tied.push(r);
    }
    if (tied.length === 0) return true;

    const r = choice.region(tied);
    const free: number[] = [];
    for (let k = 0; k < fills; k++) if (held[r * fills + k] === 0) free.push(k);
    for (const k of choice.order(free, r, fill)) {
      fill[r] = k;
      for (const o of beside[r]) if (held[o * fills + k]++ === 0) left[o]--;
      if (place()) return true;
      for (const o of beside[r]) if (--held[o * fills + k] === 0) left[o]++;
      fill[r] = -1;
    }
    return false;
  };

  return place() ? fill : null;
}

/**
 * A fill for each region of a division the puzzle gives, as a number below
 * `fills`, indexed by the region's number (`regionNumbers`, `divide.ts`).
 * `regions` is each cell's region, row by row, on a grid `w` wide.
 *
 * Regions that share a side differ. Past that the fills are spread: a region
 * takes the fill that covers the fewest cells so far, and of those one that
 * no region it meets at a corner has. Nothing is drawn, so the answer is the
 * division's alone. A call with fewer than four fills throws where the
 * division needs more.
 */
export function regionFills(
  regions: ArrayLike<number>,
  w: number,
  fills: number,
): Int32Array {
  const { beside, cornering } = regionNeighbors(regions, w);
  const cells = new Int32Array(beside.length);
  for (let i = 0; i < regions.length; i++) cells[regions[i]]++;
  const found = colorRegions(beside, fills, {
    // The one with the most neighbors, which constrains the most.
    region: (tied) =>
      tied.reduce((best, r) => (beside[r].length > beside[best].length ? r : best)),
    order: (free, r, fill) => {
      // By cells and not by regions: what a player sees is how much of the
      // board is each color.
      const used = new Int32Array(fills);
      fill.forEach((k, o) => {
        if (k >= 0) used[k] += cells[o];
      });
      const atCorner = new Set(cornering[r].map((o) => fill[o]));
      return free.sort(
        (a, b) =>
          used[a] - used[b] ||
          Number(atCorner.has(a)) - Number(atCorner.has(b)) ||
          a - b,
      );
    },
  });
  if (!found)
    throw new Error(
      `${fills} fills cannot color a division of ${beside.length} regions`,
    );
  return found;
}

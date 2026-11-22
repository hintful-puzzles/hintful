/**
 * A hexagon of cells, as upstream's unreleased bricks.c lays one out: a
 * board `w` cells wide and `h` high whose rows each sit half a cell right of
 * the row above, stored as a parallelogram half its height wider than `w`
 * with its two corners outside. Each row of the stored grid is drawn half a
 * tile right of the one above it, so a cell's six neighbors are the four
 * beside and above and below it in the store, and the two diagonals that run
 * against the shear. A compiled module deals the corners' clue by
 * {@link inHexagon}, which is why this sits in the runtime.
 */

/** The stored grid of a `w` by `h` hexagon (upstream `bricks_grid_size`). */
export const hexStore = (w: number, h: number): { w: number; h: number } => ({
  w: w + Math.ceil(h / 2) - 1,
  h,
});

/** Whether stored cell (`x`, `y`) of a store `sw` wide and `h` high lies
 * within the hexagon, and not in one of its two corners (upstream
 * `bricks_apply_bounds`). */
export function inHexagon(sw: number, h: number, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= sw || y >= h) return false;
  if (x >= sw - Math.floor(y / 2)) return false;
  const extra = (h | y) & 1 ? 0 : 1;
  return x + extra >= Math.floor((h - y) / 2);
}

/** How far right of a plain grid stored row `y` of a hexagon `h` high is
 * drawn, at tile size `ts`: half a tile a row, the store's left corner
 * pulled back out of sight (upstream `game_set_offsets`). */
export const hexShift = (y: number, h: number, ts: number): number =>
  y * (ts >> 1) + (1 - Math.ceil(h / 2)) * ts;

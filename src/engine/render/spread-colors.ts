/**
 * Giving pieces colors from a set smaller than the pieces, so that pieces
 * near each other take different colors where the set allows.
 *
 * Nearness is read off what the puzzle gives, never off its answer: Path's
 * pairs are near when their numbers are, though two lines of the answer may
 * run side by side. Spreading by the answer would tell a player that two
 * pairs of one color do not touch.
 */

/** The squares a piece is given on, as the box round them. */
export interface PieceBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** How many squares lie between two boxes, across and down: 0 where they
 * overlap or share a side. */
function gap(a: PieceBox, b: PieceBox): number {
  return (
    Math.max(0, a.x0 - b.x1 - 1, b.x0 - a.x1 - 1) +
    Math.max(0, a.y0 - b.y1 - 1, b.y0 - a.y1 - 1)
  );
}

/**
 * A color below `colors` for each piece, such that pieces near each other
 * share one as little as the set allows.
 *
 * Each piece costs a color by how near the pieces holding it are, the cost
 * of one halving with each square between them, and a piece takes its
 * cheapest color in turn until none would move. From a start of the colors
 * in order, so a board with no more pieces than colors gives each its own.
 * Deterministic: a board wears the same colors each time it is opened.
 */
export function spreadColors(boxes: readonly PieceBox[], colors: number): Int32Array {
  const n = boxes.length;
  const color = Int32Array.from({ length: n }, (_, i) => i % colors);
  if (n <= colors) return color;
  const near = boxes.map((a) => boxes.map((b) => (a === b ? 0 : 2 ** -gap(a, b))));
  const cost = new Float64Array(colors);
  // Each move lowers the total cost, so the walk ends; the bound is a guard.
  for (let round = 0; round < 4 * n; round++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      cost.fill(0);
      for (let j = 0; j < n; j++) cost[color[j]] += near[i][j];
      let best = color[i];
      for (let c = 0; c < colors; c++) if (cost[c] < cost[best] - 1e-9) best = c;
      if (best !== color[i]) {
        color[i] = best;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return color;
}

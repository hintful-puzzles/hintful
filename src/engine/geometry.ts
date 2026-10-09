/**
 * Shared grid-coordinate helpers — the upstream `COORD` / `FROMCOORD`
 * mapping between cell indices and pixels, with the per-game border
 * supplied by the caller (most games use `Math.floor(tileSize / 2)`;
 * Sixteen uses a full tile). See the `engine-helpers` spec, "The engine
 * provides shared grid-coordinate helpers".
 */

/** Top-left pixel of cell `pos` along one axis. */
export function coord(pos: number, tileSize: number, border: number): number {
  return pos * tileSize + border;
}

/**
 * Cell index containing `pixel` along one axis. Returns a negative
 * index for pixels left of / above the first cell (inside the border),
 * so callers' bounds checks reject them — matching the upstream macro's
 * intent.
 *
 * **This is the collection's one spelling of the pixel→cell conversion.** A
 * plain `Math.floor` is correct in the border region too, so the C macro's
 * `+k·ts / −k` truncating-division idiom has no place here; its variants are
 * all exactly this function (`geometry.test.ts` checks two of them).
 *
 * **The one legitimate override is `Math.trunc`.** Truncation rounds toward
 * zero, so a click inside the top/left border margin folds onto the first row
 * or column the game draws there (row or column 0, or a legend beside it)
 * instead of landing one further out — upstream's behavior. A game that takes
 * it says so at its own `fromCoord` and names this helper as the thing it is
 * declining. That is the *only* way the two spellings differ, and it is
 * player-visible.
 *
 * A position that keeps its fraction of a tile (Rect tells a corner from an
 * edge by it) is not this conversion, and stays the game's own division.
 */
export function fromCoord(pixel: number, tileSize: number, border: number): number {
  return Math.floor((pixel - border) / tileSize);
}

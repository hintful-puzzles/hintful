/**
 * The tile cache: what each tile of a board shows on the canvas, as a packed
 * key, and the overlays that are part of that key (`docs/rendering.md`
 * § "The tile cache and the diff key").
 *
 * It owns the four things every tiled `redraw` used to write by hand: the
 * cache filled with "never drawn", the first frame, the miss test that
 * compares the key **and** every overlay, and the record of what was painted.
 * An overlay is registered once, when the draw state is built, so a frame
 * cannot test the key and forget an overlay: the class of bug in which a
 * mistake or a hint mark never repaints.
 *
 * What a tile is, how the tiles are walked and how one is painted stay the
 * game's: a ring of clues, several families of tiles and a clip that paints
 * four neighbors are all walks a game writes as plain loops around
 * {@link TileCache.changed}.
 */

import type { OverlaySidecar } from "./overlay-sidecar.ts";

/** A key no frame computes, so the first frame misses on every tile. */
const NEVER_DRAWN = -1;

export class TileCache {
  /** Per tile, `words` keys in a row: what the canvas shows. */
  private readonly keys: Int32Array;
  private readonly words: number;
  private readonly overlays: readonly OverlaySidecar[];
  private started = false;

  /**
   * `count` tiles, each keyed by `words` integers (more than one when the
   * packed key runs out of bits), and the `overlays` painted on them: every
   * sidecar a tile's painter reads.
   */
  constructor(
    count: number,
    {
      words = 1,
      overlays = [],
    }: { words?: number; overlays?: readonly OverlaySidecar[] } = {},
  ) {
    if (words < 1 || words > 4)
      throw new RangeError(`a tile key is 1 to 4 words, not ${words}`);
    this.words = words;
    this.overlays = overlays;
    this.keys = new Int32Array(count * words).fill(NEVER_DRAWN);
  }

  /** True on this draw state's first frame and on no other: where a game
   * paints what is its own beneath the tiles (the grid's frame). */
  firstFrame(): boolean {
    if (this.started) return false;
    this.started = true;
    return true;
  }

  /**
   * Whether tile `i` must be painted to show `key`: what it shows differs, or
   * an overlay on it moved. When it must, the tile is recorded as showing
   * both, so the caller paints it now. `k1` to `k3` are the key's further
   * words, in a cache built with them. Parameters and not a rest array,
   * because this runs for every tile of every frame and a rest array is an
   * allocation each time.
   */
  changed(i: number, key: number, k1 = 0, k2 = 0, k3 = 0): boolean {
    const keys = this.keys;
    const at = i * this.words;
    const n = this.words;
    const same =
      keys[at] === key &&
      (n < 2 || keys[at + 1] === k1) &&
      (n < 3 || keys[at + 2] === k2) &&
      (n < 4 || keys[at + 3] === k3);
    if (same && !this.overlayMoved(i)) return false;
    keys[at] = key;
    if (n > 1) keys[at + 1] = k1;
    if (n > 2) keys[at + 2] = k2;
    if (n > 3) keys[at + 3] = k3;
    for (const o of this.overlays) o.commit(i);
    return true;
  }

  /** Whether an overlay on tile `i` differs from what was painted, read before
   * {@link changed} records it: for a tile whose paint reaches its neighbors. */
  overlayMoved(i: number): boolean {
    const overlays = this.overlays;
    for (let k = 0; k < overlays.length; k++) if (overlays[k].stale(i)) return true;
    return false;
  }

  /** The key tile `i` shows, or -1 when it has not been painted. */
  shown(i: number): number {
    return this.keys[i * this.words];
  }

  /** Forget what tile `i` shows, so the next {@link changed} paints it: for
   * a tile something else painted over. */
  forget(i: number): void {
    this.keys.fill(NEVER_DRAWN, i * this.words, (i + 1) * this.words);
  }

  /** Forget every tile. */
  forgetAll(): void {
    this.keys.fill(NEVER_DRAWN);
  }
}

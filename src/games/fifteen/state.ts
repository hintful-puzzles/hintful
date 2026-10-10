import { DESC_REPEATED, type DescParse, descValue } from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import type { ParamConfigItem } from "../../engine/game.ts";
import { dimensionParamConfig } from "../../engine/params.ts";
import { dims, paramsCodec } from "../../engine/params-codec.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { permParity } from "../../engine/shuffle.ts";

// --- types -----------------------------------------------------------

export interface FifteenParams {
  w: number;
  h: number;
}

export interface FifteenState {
  readonly w: number;
  readonly h: number;
  readonly n: number;
  /** Tile values in row-major order; `0` is the gap. The solved board
   * reads `1, 2, …, n-1, 0`. */
  readonly tiles: Int32Array;
  /** Flat index of the gap (the cell holding value `0`). */
  readonly gapPos: number;
  readonly moveCount: number;
}

/** A slide carries the *destination* gap cell (upstream `"M x,y"`); a
 * solve snaps to the solved board (upstream `"S"`). Both are plain data,
 * so the default move codec suffices. */
export type FifteenMove = { type: "move"; x: number; y: number } | { type: "solve" };

export interface FifteenUi {
  /** Upstream's arrow-semantics preference: `false` means the pressed arrow
   * moves a *tile* that way, so the gap moves the opposite way. Always
   * `false`: the game declares no preference that sets it. */
  invertCursor: boolean;
}

// --- params ----------------------------------------------------------

export function defaultParams(): FifteenParams {
  return { w: 4, h: 4 };
}

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<FifteenParams>[] =
  dimensionParamConfig<FifteenParams>({
    doc: "Size of the grid in squares. Every board dealt can be solved, whatever its size.",
    bounds: { min: 2 },
  });

/** `WxH`, with upstream's square fallback: a bare `W` is a W×W board. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
]);

// --- presets ----------------------------------------------------------

export function presets() {
  return { submenu: [3, 4, 5].map((n) => ({ params: { w: n, h: n } })) };
}

// --- completion / parity ----------------------------------------------

/** Solved iff each cell `p` holds `p+1`, except the last holds `0`. */
export function isCompletedTiles(tiles: Int32Array, n: number): boolean {
  for (let p = 0; p < n; p++) {
    if (tiles[p] !== (p < n - 1 ? p + 1 : 0)) return false;
  }
  return true;
}

/** Required permutation parity for a board whose gap sits at flat index
 * `gap`: chessboard parity of the gap cell XOR parity of `n` (the solved
 * target `1..n-1,0` is a cyclic rotation of `0..n-1`, odd iff `n` is
 * even). Upstream `PARITY_P`. */
export function parityP(w: number, h: number, gap: number): number {
  const gx = gap % w;
  const gy = Math.floor(gap / w);
  return ((gx - (w - 1)) ^ (gy - (h - 1)) ^ (w * h + 1)) & 1;
}

/** Whether no slides can put this board in order. A slide changes the
 * permutation's parity and the gap's chessboard color together, so half of
 * all arrangements are out of reach, and which half never changes in play. */
export function hasNoSolution(s: FifteenState): boolean {
  return permParity(s.tiles, s.n) !== parityP(s.w, s.h, s.gapPos);
}

// --- desc / state -----------------------------------------------------

/** The tiles in reading order, `0` the gap, comma-separated. */
function parseDesc(p: FifteenParams, desc: string): DescParse<Int32Array> {
  const n = p.w * p.h;
  return readDesc(desc, (r) => {
    const tiles = new Int32Array(n);
    const used = new Set<number>();
    for (let i = 0; i < n; i++) {
      if (i > 0) r.expect(",");
      tiles[i] = r.int(0, n - 1);
      if (used.has(tiles[i])) r.fail(DESC_REPEATED);
      used.add(tiles[i]);
    }
    r.end();
    return tiles;
  });
}

export function newState(p: FifteenParams, desc: string): FifteenState {
  const n = p.w * p.h;
  const tiles = descValue(parseDesc(p, desc));
  return {
    w: p.w,
    h: p.h,
    n,
    tiles,
    gapPos: tiles.indexOf(0),
    moveCount: 0,
  };
}

export function status(state: FifteenState): "solved" | "ongoing" {
  return isCompletedTiles(state.tiles, state.n) ? "solved" : "ongoing";
}

// --- text format ------------------------------------------------------

export function textFormat(state: FifteenState): string {
  const colWidth = String(state.n - 1).length;
  const lines: string[] = [];
  for (let y = 0; y < state.h; y++) {
    const cells: string[] = [];
    for (let x = 0; x < state.w; x++) {
      const v = state.tiles[y * state.w + x];
      cells.push(v === 0 ? " ".repeat(colWidth) : String(v).padStart(colWidth));
    }
    lines.push(cells.join(" "));
  }
  return lines.join("\n");
}

// --- generator --------------------------------------------------------

/** Upstream's `new_game_desc`: place all tiles except the last two at
 * random, then order the final two so the permutation's parity matches
 * `parityP`, rejecting an already-solved layout. */
export function newDesc(p: FifteenParams, rng: RandomState): { desc: string } {
  const n = p.w * p.h;
  const tiles = new Int32Array(n);
  const used = new Uint8Array(n);

  const attempt = retryLimit("fifteen: a layout that is not already solved");
  do {
    attempt();
    tiles.fill(-1);
    used.fill(0);

    const gap = randomUpto(rng, n);
    tiles[gap] = 0;
    used[0] = 1;

    // Place everything except the last two tiles.
    let x = 0;
    for (let i = n - 1; i > 2; i--) {
      let k = randomUpto(rng, i);
      let j = 0;
      for (; j < n; j++) {
        if (used[j]) continue;
        if (k === 0) break;
        k--;
      }
      used[j] = 1;
      while (tiles[x] >= 0) x++;
      tiles[x] = j;
    }

    // The last two free locations and the last two unused pieces.
    const x1 = tiles.indexOf(-1);
    const x2 = tiles.indexOf(-1, x1 + 1);
    const p1 = used.indexOf(0);
    const p2 = used.indexOf(0, p1 + 1);

    // Try one way round; if parity is wrong, swap the last two.
    tiles[x1] = p1;
    tiles[x2] = p2;
    if (permParity(tiles, n) !== parityP(p.w, p.h, gap)) {
      tiles[x1] = p2;
      tiles[x2] = p1;
    }
  } while (isCompletedTiles(tiles, n));

  return { desc: tiles.join(",") };
}

import { DESC_REPEATED, type DescParse, descValue } from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { describedSpace } from "../../engine/describe-runtime.ts";
import type { ParamConfigItem, PresetBoards } from "../../engine/game.ts";
import { dimensionParamConfig } from "../../engine/params.ts";
import { dims, paramsCodec } from "../../engine/params-codec.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import * as fifteen from "./fifteen.compiled.ts";

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

/** Upstream's three squares, with an upright board after each of the two
 * larger. */
export const menu: PresetBoards<FifteenParams> = {
  boards: [
    [3, 3],
    [4, 4],
    [4, 5],
    [5, 5],
    [5, 6],
  ].map(([w, h]) => ({ w, h })),
};

// --- completion / parity ----------------------------------------------

/** The description's rules on a board of this size. */
export function rulesOf(s: { readonly w: number; readonly h: number }) {
  return fifteen.rules(describedSpace(fifteen.units, s.w, s.h), {}, []);
}

export const positionOf = (s: { readonly tiles: Int32Array }): fifteen.Position => ({
  value: s.tiles,
});

export function isCompleted(s: FifteenState): boolean {
  return rulesOf(s).finished(positionOf(s));
}

/** Whether no slides can put this board in order, by the description's
 * claim: half of all arrangements are out of reach, and which half never
 * changes in play. */
export function hasNoSolution(s: FifteenState): boolean {
  return rulesOf(s).deadEnd(positionOf(s)) !== null;
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
  return isCompleted(state) ? "solved" : "ongoing";
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
 * random, then order the final two so that the board is no dead end,
 * rejecting an already-solved layout. Swapping two tiles changes the
 * parity the description's claim reads, and the parity is the whole of what
 * keeps a board from finishing (the classic argument; the dead-end checker
 * finds it misses no board up to 3×3), so the order kept always finishes. */
export function newDesc(p: FifteenParams, rng: RandomState): { desc: string } {
  const rules = rulesOf(p);
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

    // Try one way round; where that cannot finish, swap the last two.
    tiles[x1] = p1;
    tiles[x2] = p2;
    if (rules.deadEnd({ value: tiles }) !== null) {
      tiles[x1] = p2;
      tiles[x2] = p1;
    }
  } while (rules.finished({ value: tiles }));

  return { desc: tiles.join(",") };
}

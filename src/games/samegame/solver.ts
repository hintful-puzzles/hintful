/**
 * Same Game's solver: a search for an order of removals that clears the
 * board, which also proves a board that no order clears.
 *
 * It is a depth-first search that tries first the removal leaving the fewest
 * squares with no partner beside them, and remembers every position it proved
 * lost. One such search is heavy-tailed, since an early mistake buries it in a
 * subtree that cannot clear, so it restarts with the ties broken another way
 * each time, sharing what it proved lost (`add-samegame-hint` design D2). A
 * restart that runs out of positions proves nothing; one that finishes without
 * clearing has searched everything, which is the proof.
 */

import type { Allowance, Verdict } from "../../engine/rival-judging.ts";
import { type SearchOutcome, searchVerdict } from "../../engine/search-outcome.ts";
import type { SamegameState } from "./state.ts";

/** A removable group: its squares' grid indices, ascending. */
export type Group = readonly number[];

/** A board as the search holds it: one color a cell, `0` empty. */
type Tiles = Uint8Array;

/** The board's groups of two or more squares of one color, each listed in
 * ascending index order, and the groups by their lowest index. */
export function groupsOf(tiles: ArrayLike<number>, w: number, h: number): Group[] {
  const seen = new Uint8Array(w * h);
  const out: Group[] = [];
  for (let start = 0; start < w * h; start++) {
    const c = tiles[start];
    if (c === 0 || seen[start]) continue;
    seen[start] = 1;
    const group = [start];
    for (let qi = 0; qi < group.length; qi++) {
      const k = group[qi];
      const x = k % w;
      for (const n of [x > 0 ? k - 1 : -1, x + 1 < w ? k + 1 : -1, k - w, k + w]) {
        if (n >= 0 && n < w * h && !seen[n] && tiles[n] === c) {
          seen[n] = 1;
          group.push(n);
        }
      }
    }
    if (group.length > 1) out.push(group.sort((a, b) => a - b));
  }
  return out;
}

/**
 * The board after removing `group`, as `executeMove` leaves it: the squares
 * above fall, and emptied columns close up to the left. `moved`, where given,
 * is filled with where each remaining square went, by its old index, and `-1`
 * for a square removed or a cell empty.
 */
export function removed(
  tiles: ArrayLike<number>,
  w: number,
  h: number,
  group: Group,
  moved?: Int32Array,
): Tiles {
  const gone = new Uint8Array(w * h);
  for (const i of group) gone[i] = 1;
  const out = new Uint8Array(w * h);
  moved?.fill(-1);
  let ox = 0;
  for (let x = 0; x < w; x++) {
    let oy = h - 1;
    for (let y = h - 1; y >= 0; y--) {
      const i = y * w + x;
      if (tiles[i] === 0 || gone[i]) continue;
      out[oy * w + ox] = tiles[i];
      if (moved) moved[i] = oy * w + ox;
      oy--;
    }
    if (oy < h - 1) ox++;
  }
  return out;
}

/** The squares with no square of their own color beside them. */
export function loneSquares(tiles: ArrayLike<number>, w: number, h: number): number[] {
  const out: number[] = [];
  for (let k = 0; k < w * h; k++) {
    const c = tiles[k];
    if (c === 0) continue;
    const x = k % w;
    if (
      !(x > 0 && tiles[k - 1] === c) &&
      !(x + 1 < w && tiles[k + 1] === c) &&
      !(k >= w && tiles[k - w] === c) &&
      !(k + w < w * h && tiles[k + w] === c)
    )
      out.push(k);
  }
  return out;
}

function loneCount(tiles: Tiles, w: number, h: number): number {
  let n = 0;
  for (let k = 0; k < w * h; k++) {
    const c = tiles[k];
    if (c === 0) continue;
    const x = k % w;
    if (
      !(x > 0 && tiles[k - 1] === c) &&
      !(x + 1 < w && tiles[k + 1] === c) &&
      !(k >= w && tiles[k - w] === c) &&
      !(k + w < w * h && tiles[k + w] === c)
    )
      n++;
  }
  return n;
}

/**
 * The squares that are the last of their color, by grid index. A removal takes
 * two or more of one color and no square changes color, so such a square can
 * never go, and the board can never be cleared.
 */
export function lastOfColor(tiles: ArrayLike<number>, ncols: number): number[] {
  const count = new Array<number>(ncols + 1).fill(0);
  const at = new Array<number>(ncols + 1).fill(-1);
  for (let i = 0; i < tiles.length; i++) {
    count[tiles[i]]++;
    at[tiles[i]] = i;
  }
  const out: number[] = [];
  for (let c = 1; c <= ncols; c++) if (count[c] === 1) out.push(at[c]);
  return out.sort((a, b) => a - b);
}

function hasLastOfColor(tiles: Tiles, ncols: number): boolean {
  const count = new Uint16Array(ncols + 1);
  for (const c of tiles) count[c]++;
  for (let c = 1; c <= ncols; c++) if (count[c] === 1) return true;
  return false;
}

/** Whether the board is empty: compaction fills the bottom-left cell first. */
const isEmpty = (tiles: Tiles, w: number, h: number): boolean =>
  tiles[(h - 1) * w] === 0;

/** Exact, never hashed: a collision would make a clearable position read as
 * lost. A color fits in a character. */
const keyOf = (tiles: Tiles): string => String.fromCharCode(...tiles);

/** A deterministic tie-break that differs from one restart to the next. */
const salted = (k: number, salt: number): number =>
  (Math.imul(k + 1, 0x9e3779b1) ^ Math.imul(salt + 1, 0x85ebca6b)) >>> 16;

/** How a search spends its positions: `tries` restarts of `restart`
 * positions each, then one last try with whatever is left of `budget`. */
export interface Plan {
  readonly budget: number;
  readonly restart: number;
  readonly tries: number;
}

/**
 * A clearing from `start`, a proof that none exists, or neither past the plan's
 * budget or the `allowance`, whichever runs out first. A position counts when
 * it is expanded, which is where the cost is.
 */
function search(
  start: Tiles,
  w: number,
  h: number,
  ncols: number,
  plan: Plan,
  allowance: Allowance,
): SearchOutcome<Group> {
  if (isEmpty(start, w, h)) return { kind: "found", line: [] };
  const lost = new Set<string>();
  let left = plan.budget;
  for (let salt = 0; salt <= plan.tries && left > 0 && allowance.left > 0; salt++) {
    const cap = salt < plan.tries ? Math.min(left, plan.restart) : left;
    let work = 0;
    const path: Group[] = [];
    const dfs = (t: Tiles): boolean | null => {
      const key = keyOf(t);
      if (lost.has(key)) return false;
      if (++work > cap || --allowance.left < 0) return null;
      if (!hasLastOfColor(t, ncols)) {
        const children = groupsOf(t, w, h).map((g) => {
          const after = removed(t, w, h, g);
          return {
            g,
            after,
            rank: loneCount(after, w, h) * 65536 + salted(g[0], salt),
          };
        });
        children.sort((a, b) => a.rank - b.rank);
        for (const { g, after } of children) {
          path.push(g);
          if (isEmpty(after, w, h)) return true;
          const r = dfs(after);
          if (r !== false) return r;
          path.pop();
        }
      }
      lost.add(key);
      return false;
    };
    const r = dfs(start);
    left -= Math.min(work, cap);
    if (r === true) return { kind: "found", line: path };
    if (r === false) return { kind: "lost" };
    // A try that stopped short proved nothing but what it put in `lost`.
  }
  return { kind: "out-of-reach" };
}

/** What a search established about a position: the groups to remove in turn. */
export type Clearing = SearchOutcome<Group>;

/** How many positions the hint's own search may expand, and each restart's
 * share: measured over every preset in `add-samegame-hint` design D2. */
const FIND: Plan = { budget: 60_000, restart: 500, tries: 110 };

/** A line of removals that clears `s`, a proof that none does, or neither,
 * past the search's reach. */
export function findClearing(s: SamegameState, plan: Plan = FIND): Clearing {
  const tiles = Uint8Array.from(s.tiles);
  if (hasLastOfColor(tiles, s.ncols)) return { kind: "lost" };
  return search(tiles, s.w, s.h, s.ncols, plan, { left: Number.POSITIVE_INFINITY });
}

/**
 * Whether the board `tiles` can still be cleared, from a search costing at
 * most `proof` positions of its own and no more than `allowance` holds.
 */
export function judge(
  s: SamegameState,
  tiles: ArrayLike<number>,
  allowance: Allowance,
  proof: number,
): Verdict {
  const t = Uint8Array.from(tiles);
  if (hasLastOfColor(t, s.ncols)) return "lost";
  return searchVerdict(
    search(
      t,
      s.w,
      s.h,
      s.ncols,
      { budget: proof, restart: proof >> 2, tries: 2 },
      allowance,
    ),
  );
}

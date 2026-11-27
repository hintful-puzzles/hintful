/**
 * An answer drawn at random as a description's `deal.sample` says: a value
 * scattered on a share of the cells, a partner beside each, matched one to
 * one, and the rest one other value. The clues are then the answer's, from
 * each kind's `means` (`deriveClues`), so no game writes its generator
 * (`openspec/changes/a-game-from-its-description-alone`, design.md § 7).
 *
 * The scatter and the matching are upstream's tents.c `new_game_desc`, which
 * is Tents' sample: a random order of the cells, each taken where it keeps
 * `apart` from those taken, and `matching`'s random maximum matching of the
 * scattered cells to the cells beside them.
 */

import { shuffle } from "../board/shuffle.ts";
import { type RandomState, randomBits, randomUpto } from "../random/index.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";
import { latinGenerate, matching } from "../solve/latin.ts";
import type { FillDivision } from "./game-id.ts";

type Near = "adj4" | "adj8";

/** How a deal draws its answer (`deal/samplers.ts`): built by the ladder
 * (`buildAnswer`),
 * scattered (`sampleAnswer`), as dominoes (`sampleDominoes`), or a count to
 * every line (`sampleLines`). */
export type Sample =
  | BuiltSample
  | ScatterSample
  | DominoSample
  | LinesSample
  | PictureSample
  | PiecesSample
  | LatinSample
  | SearchSample
  | WallsSample;

/** A partition of the cells, an answer on the edges: the board divided as
 * `walls.division` cuts it, `walls.value` on each edge between two parts and
 * `walls.rest` on each edge inside one (Palisade's regions). */
export interface WallsSample {
  readonly walls: {
    readonly division: FillDivision;
    readonly value: number;
    readonly rest: number;
  };
}

/** The walls of `parts`, each cell's part, as `sample` paints them on `sp`'s
 * edges. */
export function wallsOf(
  sample: WallsSample,
  sp: GridSpace,
  parts: Int32Array,
): Uint8Array {
  const { value, rest } = sample.walls;
  const g = new Uint8Array(sp.edges.length);
  for (const e of sp.edges)
    g[e] = parts[sp.edgeEnds[2 * e]] === parts[sp.edgeEnds[2 * e + 1]] ? rest : value;
  return g;
}

/** A Latin square on the board, its values `1` to its side. */
export interface LatinSample {
  readonly latin: true;
}

/** An answer the search finds under the partition the deal divides first
 * (`deal.divide`), its values tried in a random order. */
export interface SearchSample {
  readonly search: true;
}

/** A Latin square on the square board `sp`, as upstream's latin.c
 * `latin_generate` draws one. */
export function sampleLatin(sp: GridSpace, rs: RandomState): Uint8Array {
  if (sp.w !== sp.h) throw new Error("sample latin: the board is not square");
  return Uint8Array.from(latinGenerate(sp.w, rs));
}

/** The tally's pieces (`FillTally`), each a straight run of `value` as long
 * as its length, none touching another even at a corner; the rest `rest`. */
export interface PiecesSample {
  readonly pieces: { readonly value: number; readonly rest: number };
}

/**
 * The tally's pieces laid as upstream's boats.c `boats_generate_fleet` lays
 * a fleet, or `null` where one finds no room: the longest first, each in a
 * stretch of a row or column that holds no piece and no `rest`, at a random
 * place along it, `rest` then laid on its corners and past its ends, and on
 * its sides where it is one cell long. `counts[k]` is the number of pieces
 * `k + 1` long. Without `rs`, each is laid in the first stretch at its start,
 * which finds room wherever a random laying would.
 */
export function samplePieces(
  sample: PiecesSample,
  w: number,
  h: number,
  counts: readonly number[],
  rs: RandomState | null,
): Uint8Array | null {
  const { value, rest } = sample.pieces;
  const g = new Uint8Array(w * h);
  const lay = (x: number, y: number, v: number) => {
    if (x >= 0 && y >= 0 && x < w && y < h && g[y * w + x] === 0) g[y * w + x] = v;
  };
  /** Each stretch along a row, then along a column, of cells not `rest`,
   * that holds no piece. */
  const stretches = (): { x: number; y: number; len: number; across: boolean }[] => {
    const out: { x: number; y: number; len: number; across: boolean }[] = [];
    for (const across of [true, false]) {
      const [lines, along] = across ? [h, w] : [w, h];
      for (let l = 0; l < lines; l++) {
        let start = -1;
        let held = false;
        for (let i = 0; i <= along; i++) {
          const v = i === along ? rest : g[across ? l * w + i : i * w + l];
          if (v !== rest) {
            if (start < 0) start = i;
            if (v === value) held = true;
            continue;
          }
          if (start >= 0 && !held)
            out.push(
              across
                ? { x: start, y: l, len: i - start, across }
                : { x: l, y: start, len: i - start, across },
            );
          start = -1;
          held = false;
        }
      }
    }
    return out;
  };
  for (let size = counts.length; size >= 1; size--)
    for (let j = 0; j < counts[size - 1]; j++) {
      const order = stretches().filter((s) => s.len >= size);
      if (order.length === 0) return null;
      if (rs !== null) shuffle(order, rs);
      const s = order[0];
      const at = rs === null ? 0 : randomUpto(rs, s.len - size + 1);
      const [dx, dy] = s.across ? [1, 0] : [0, 1];
      const x0 = s.x + dx * at;
      const y0 = s.y + dy * at;
      for (let k = 0; k < size; k++) {
        const x = x0 + dx * k;
        const y = y0 + dy * k;
        g[y * w + x] = value;
        for (const [cx, cy] of [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ])
          lay(x + cx, y + cy, rest);
      }
      lay(x0 - dx, y0 - dy, rest);
      lay(x0 + dx * size, y0 + dy * size, rest);
      if (size === 1) {
        lay(x0 + dy, y0 + dx, rest);
        lay(x0 - dy, y0 - dx, rest);
      }
    }
  for (let i = 0; i < g.length; i++) if (g[i] === 0) g[i] = rest;
  return g;
}

/** A picture: smoothed noise, `value` at and above its median, `rest` below. */
export interface PictureSample {
  readonly picture: { readonly value: number; readonly rest: number };
}

const f = Math.fround;

/**
 * A picture as upstream's pattern.c `generate` draws one, or `null` where a
 * row or column across a side over two cells is all one value (too easy;
 * upstream's `generate_soluble`). Each cell's noise is averaged with its
 * eight neighbors' once, except along a side of two, where a 2x2 would be
 * four equal cells, and cut at the median. Upstream works in
 * single-precision floats and decides each cell by `>=`, so every step is
 * rounded as it does.
 */
export function samplePicture(
  sample: PictureSample,
  sp: GridSpace,
  rs: RandomState,
): Uint8Array | null {
  const { w, h } = sp;
  const n = w * h;
  const noise = new Float64Array(n);
  for (let i = 0; i < n; i++) noise[i] = f(f(randomUpto(rs, 100000000)) / f(100000000));
  const smooth = new Float64Array(n);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let cnt = 0;
      let sum = 0;
      for (let p = -1; p <= 1; p++)
        for (let q = -1; q <= 1; q++) {
          if (y + p < 0 || y + p >= h || x + q < 0 || x + q >= w) continue;
          if ((h === 2 && p !== 0) || (w === 2 && q !== 0)) continue;
          cnt++;
          sum = f(sum + noise[(y + p) * w + (x + q)]);
        }
      smooth[y * w + x] = f(sum / cnt);
    }
  const sorted = Float64Array.from(smooth).sort();
  let index = Math.floor(n / 2);
  if (w & h & 1) index += randomUpto(rs, 2);
  const threshold = index < n ? sorted[index] : f(sorted[n - 1] + 1);
  const { value, rest } = sample.picture;
  const g = Uint8Array.from(smooth, (s) => (s >= threshold ? value : rest));
  const mixed = (len: number, at: (i: number) => number): boolean => {
    for (let i = 1; i < len; i++) if (g[at(i)] !== g[at(0)]) return true;
    return false;
  };
  if (w > 2) for (let y = 0; y < h; y++) if (!mixed(w, (i) => y * w + i)) return null;
  if (h > 2) for (let x = 0; x < w; x++) if (!mixed(h, (i) => i * w + x)) return null;
  return g;
}

/** A value dealt on a share of the cells before the rest is drawn, as
 * symmetric as asked, each by the name of the option that gives it, the
 * share going up by `ramp` as draws fail. */
export interface FirstCells {
  readonly value: number;
  readonly share: string;
  readonly symmetry: string;
  readonly ramp?: {
    readonly every: number;
    readonly step: number;
    readonly top: number;
  };
}

/** An answer the ladder builds: any value of a cell's domain, or `value`
 * alone, placed at random and the rest decided, after the `first` cells. */
export interface BuiltSample {
  readonly build:
    | true
    | {
        readonly value: number;
        /** The cells in turn, the rows from the bottom, each from the left;
         * at random where absent. */
        readonly order?: "upward";
        /** The chance a cell that may hold `value` takes it, every cell then
         * decided in turn; absent, `value` alone is laid. */
        readonly share?: number;
        /** The least share of the open cells the answer gives `value`. */
        readonly least?: number;
      };
  readonly first?: FirstCells;
}

/** The share of `first` cells the draw numbered `draw` of a deal takes, from
 * the params' own `asked`: up `ramp.step` after each `ramp.every` draws, and
 * past `ramp.top` from `asked` again, since a small board nine-tenths walls
 * has too few squares to need a tier above the lowest (upstream lightup.c's
 * `new_game_desc` climbs and stays). */
export function rampedShare(
  ramp: FirstCells["ramp"],
  asked: number,
  draw: number,
): number {
  if (ramp === undefined || asked >= ramp.top) return asked;
  const steps = Math.ceil((ramp.top - asked) / ramp.step) + 1;
  return Math.min(
    ramp.top,
    asked + (Math.floor(draw / ramp.every) % steps) * ramp.step,
  );
}

/** `count` cells of `value` in every row and column, none within `apart` of
 * another; `rest` on every other cell. `count` is a number, or the name of a
 * size the params give (Star Battle's `stars`). */
export interface LinesSample {
  readonly lines: {
    readonly value: number;
    readonly count: number | string;
    readonly apart: Near;
  };
  readonly rest: number;
}

/** Dominoes of `value`, two cells side by side, no two touching along a
 * side, packed densely; `rest` on every other cell. */
export interface DominoSample {
  readonly dominoes: { readonly value: number };
  readonly rest: number;
}

export interface ScatterSample {
  readonly scatter: {
    readonly value: number;
    readonly share: number;
    readonly apart?: Near;
    /** Each cell takes the value at `share`'s chance, so the count varies
     * from answer to answer: a small board then draws from every picture
     * (Mosaic's 3x3 has 512, and those with four shaded cells, 126). */
    readonly each?: true;
    /** The share is of the cells tried, in a random order, each taken where
     * it may be, so how many are taken varies and a draw always has room
     * (upstream's range.c). */
    readonly tried?: true;
    /** A cell is taken only where the cells not taken stay one group. */
    readonly joinedRest?: true;
  };
  readonly partner?: { readonly value: number; readonly along: Near };
  readonly rest: number;
  /** Whether a row or column holding nothing but `rest` is refused: upstream's
   * Tents rejects one as giving nothing away. */
  readonly noBareLine?: boolean;
  /** Whether a cell a rule breaks at takes the other value, until none does
   * (`deal/climb.ts`, `mended`). */
  readonly mend?: true;
  /** Whether a draw after a refused one keeps what the ladder decided on it
   * (`deal/climb.ts`). */
  readonly climb?: true;
  /** The cells dealt a value before the scatter of `each` draws the rest
   * (Sticks' blocks). */
  readonly first?: FirstCells;
}

/** How many cells a share of `n` is: rounded down, a share written as a
 * decimal never losing a cell to its binary fraction. */
const shareOf = (share: number, n: number): number => Math.floor(share * n + 1e-9);

/** An answer as `sample` draws it on `sp`, or `null` where this draw found no
 * room for every scattered cell or no partner for each, or left a line bare
 * that `noBareLine` refuses. Where each cell is drawn alone, a cell `kept`
 * holds a value keeps it. `elements` are those the answer's values sit on:
 * the cells, or the edges, which keep no distance, partner or line. */
export function sampleAnswer(
  sample: ScatterSample,
  sp: GridSpace,
  rs: RandomState,
  kept: Uint8Array | null = null,
  elements: readonly number[] = sp.cells,
): Uint8Array | null {
  const n = elements.length;
  const { scatter, partner } = sample;
  if (
    elements !== sp.cells &&
    (scatter.apart !== undefined ||
      scatter.joinedRest === true ||
      partner !== undefined ||
      sample.noBareLine === true)
  )
    throw new Error("sample: only a cell keeps a distance, a partner or a line");
  const g = new Uint8Array(n);
  if (scatter.each === true) {
    if (scatter.apart !== undefined || partner !== undefined)
      throw new Error("sample: a value at each cell's chance keeps no distance");
    // A chance in 2^16, the share's own where it is a half.
    const odds = Math.round(scatter.share * 65536);
    for (const c of elements)
      g[c] =
        kept !== null && kept[c] !== 0
          ? kept[c]
          : randomBits(rs, 16) < odds
            ? scatter.value
            : sample.rest;
    return g;
  }
  if (kept !== null) throw new Error("sample: only a cell drawn alone is kept");
  const order = Int32Array.from(elements);
  const share = shareOf(scatter.share, n);
  // Tried, the share is of the cells tried, and none need be taken.
  let left = scatter.tried === true ? 0 : share;
  let taken = 0;
  for (let i = 0; scatter.tried === true ? i < share : left > 0 && i + left <= n; i++) {
    const which = i + randomUpto(rs, n - i);
    [order[i], order[which]] = [order[which], order[i]];
    const c = order[i];
    if (
      scatter.apart !== undefined &&
      sp[scatter.apart][c].some((o) => g[o] === scatter.value)
    )
      continue;
    g[c] = scatter.value;
    if (
      scatter.joinedRest === true &&
      !restJoined(sp, g, scatter.value, n - taken - 1)
    ) {
      g[c] = 0;
      continue;
    }
    taken++;
    left--;
  }
  if (left > 0) return null;
  if (partner !== undefined) {
    // The cells that could partner one, numbered for the matching.
    const room = new Int32Array(n).fill(-1);
    const rooms: number[] = [];
    const lists: number[][] = [];
    for (const c of sp.cells) {
      if (g[c] !== scatter.value) continue;
      const list: number[] = [];
      for (const o of sp[partner.along][c]) {
        if (g[o] === scatter.value) continue;
        if (room[o] < 0) {
          room[o] = rooms.length;
          rooms.push(o);
        }
        list.push(room[o]);
      }
      lists.push(list);
    }
    const paired = matching(
      lists.length,
      rooms.length,
      lists,
      lists.map((l) => l.length),
      rs,
    );
    if (paired.includes(-1)) return null;
    for (const r of paired) g[rooms[r]] = partner.value;
  }
  for (const c of elements) if (g[c] === 0) g[c] = sample.rest;
  if (
    sample.noBareLine === true &&
    sp.lines.some((L) => sp.lineCells[L].every((c) => g[c] === sample.rest))
  )
    return null;
  return g;
}

/** Whether the `count` cells of `g` not holding `value` are one group, side
 * by side. */
function restJoined(
  sp: GridSpace,
  g: Uint8Array,
  value: number,
  count: number,
): boolean {
  const start = sp.cells.find((c) => g[c] !== value);
  if (start === undefined) return true;
  const seen = new Uint8Array(g.length);
  seen[start] = 1;
  const stack = [start];
  let reached = 0;
  for (let c = stack.pop(); c !== undefined; c = stack.pop()) {
    reached++;
    for (const o of sp.adj4[c])
      if (!seen[o] && g[o] !== value) {
        seen[o] = 1;
        stack.push(o);
      }
  }
  return reached === count;
}

/** A count a deal reads, a number or the name of a size in `sizes`. */
function countOf(n: number | string, sizes: Readonly<Record<string, number>>): number {
  if (typeof n === "number") return n;
  const v = sizes[n];
  if (v === undefined) throw new Error(`deal: no size ${n} in the params`);
  return v;
}

/**
 * Every row and column holding `count` cells of the value, none within
 * `apart` of another, at random; `null` where the grid has no such answer.
 * A search down the rows, each row's ways in a random order, backing up from
 * a row with none left: the fork's own Star Battle generator's. Two cells of
 * the value are never side by side along a line, so a column takes one at
 * most every other row, which prunes a row that leaves a column too few.
 */
export function sampleLines(
  sample: LinesSample,
  sp: GridSpace,
  sizes: Readonly<Record<string, number>>,
  rs: RandomState,
): Uint8Array | null {
  const { w, h } = sp;
  const { value, apart } = sample.lines;
  const count = countOf(sample.lines.count, sizes);
  // Every way to take `count` cells of a row, none side by side.
  const ways: number[][] = [];
  const extend = (from: number, chosen: number[]): void => {
    if (chosen.length === count) {
      ways.push(chosen);
      return;
    }
    for (let x = from; x < w; x++) extend(x + 2, [...chosen, x]);
  };
  extend(0, []);
  // How far apart two cells of rows side by side must be, across.
  const reach = apart === "adj8" ? 1 : 0;
  const held = new Int32Array(w);
  const placed: number[][] = [];
  const fill = (y: number): boolean => {
    if (y === h) return true;
    const above = placed[y - 1] ?? [];
    const left = h - y;
    for (let x = 0; x < w; x++) {
      const room = above.includes(x) ? left - 1 : left;
      if (count - held[x] > Math.ceil(room / 2)) return false;
    }
    const order = ways.filter((row) =>
      row.every(
        (x) => held[x] < count && above.every((a) => a < x - reach || a > x + reach),
      ),
    );
    shuffle(order, rs);
    for (const row of order) {
      for (const x of row) held[x]++;
      placed.push(row);
      if (fill(y + 1)) return true;
      placed.pop();
      for (const x of row) held[x]--;
    }
    return false;
  };
  if (!fill(0)) return null;
  const g = new Uint8Array(w * h).fill(sample.rest);
  placed.forEach((row, y) => {
    for (const x of row) g[y * w + x] = value;
  });
  return g;
}

/** The rounds of {@link sampleDominoes}' refill. A greedy fill alone stops
 * at about 36% of the cells in dominoes at any size; 300 rounds reach about
 * 45% in under 10 ms at 10x10, and 1,500 only 48% for five times the cost
 * (measured on Norinori, 2026-11-16). */
const REFILL_ROUNDS = 300;

/**
 * Dominoes at random, no two side by side, packed as densely as
 * {@link REFILL_ROUNDS} rounds of a refill get them: take one domino away,
 * fill the grid again greedily, and keep the result where no fewer come
 * back. `null` where no domino fits.
 *
 * Density is what makes a partition grown round them come right: each of
 * Norinori's regions holds two of their cells, so the denser the dominoes the
 * smaller the regions, and a region's room for other answers grows with its
 * size. Packed so, a 10x10 Easy board deals in under a second where it took a
 * minute and more (2026-11-16). The refill is sen-ltd/norinori's
 * (`inducedMatching`, MIT).
 */
export function sampleDominoes(
  sample: DominoSample,
  sp: GridSpace,
  rs: RandomState,
): Uint8Array | null {
  const beside = sp.adj4;
  const held = new Uint8Array(sp.cells.length);
  // A cell is free while neither it nor a cell beside it is held.
  const free = (i: number): boolean =>
    held[i] === 0 && beside[i].every((j) => held[j] === 0);
  /** Dominoes in random order wherever one fits; how many. */
  const fill = (): number => {
    const order = Array.from(sp.cells);
    shuffle(order, rs);
    let placed = 0;
    for (const i of order) {
      if (!free(i)) continue;
      const partners = beside[i].filter(
        (j) => free(j) && beside[j].every((k) => k === i || held[k] === 0),
      );
      if (partners.length === 0) continue;
      held[i] = 1;
      held[partners[randomUpto(rs, partners.length)]] = 1;
      placed++;
    }
    return placed;
  };
  let count = fill();
  for (let round = 0; round < REFILL_ROUNDS && count > 0; round++) {
    const was = held.slice();
    const cells = sp.cells.filter((i) => held[i] === 1);
    const taken = cells[randomUpto(rs, cells.length)];
    // Its partner is the one held cell beside it.
    for (const j of [taken, ...beside[taken]]) held[j] = 0;
    const placed = fill();
    if (placed >= 1) count += placed - 1;
    else held.set(was);
  }
  if (count === 0) return null;
  return Uint8Array.from(held, (x) => (x === 1 ? sample.dominoes.value : sample.rest));
}

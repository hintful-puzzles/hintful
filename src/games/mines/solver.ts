/**
 * Mines' deduction: the ladder `mines.description.yaml` states, compiled, on
 * the engine's marks (`engine/ladder-runtime.ts`). The hint walks it from the
 * player's board, and the generator solves on it to certify each board it
 * deals, so every board dealt is one the hint finishes.
 *
 * **The numbers are revealed, not dealt.** Each one is a clue of the
 * description's `count` kind once its square is opened, so the clue list is
 * rebuilt from the board as squares open: the hint after each of its steps,
 * which can open more, and the generator after each pass and perturbation.
 * A square is a mine or safe in the marks only once a deduction or an
 * opening shows it; a flag is the player's claim and never a premise.
 */

import { singleFirings } from "../../engine/deduction-fixpoint.ts";
import {
  clueList,
  describedSpace,
  type GridSpace,
} from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS as SCALE,
} from "../../engine/ladder-runtime.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import * as mines from "./mines.compiled.ts";

/** What the marks hold: a mine, or a safe square. */
const MINE = 1;
const SAFE = 2;
const DOMAIN = (1 << MINE) | (1 << SAFE);

/** The unopened squares one opened number still has to account for. */
export interface Group {
  /** The number's square. */
  readonly clue: number;
  /** Its value. */
  readonly value: number;
  /** Its squares nothing has decided yet. */
  readonly cells: readonly number[];
  /** Mines still to place among {@link cells}. */
  readonly need: number;
  /** Its neighbors proved to be mines. */
  readonly mines: readonly number[];
}

/** A number's squares beyond another's whose squares all touch it: they hold
 * exactly {@link need} mines. */
export interface Region {
  readonly outer: Group;
  readonly inner: Group;
  readonly cells: readonly number[];
  readonly need: number;
}

/** One side of a pair: a number, or a region. */
export type Side = { readonly group: Group } | { readonly region: Region };

/** Why a firing decides its squares, as the hint says it. */
export type Firing =
  | { readonly rung: "satisfied"; readonly group: Group; readonly safes: number[] }
  | { readonly rung: "full"; readonly group: Group; readonly mines: number[] }
  | {
      /** `heavy` needs more than `light`; its own squares are the mines and
       * `light`'s own squares the safe ones. */
      readonly rung: "pair";
      readonly heavy: Side;
      readonly light: Side;
      readonly shared: number[];
      readonly mines: number[];
      readonly safes: number[];
    }
  | {
      readonly rung: "count";
      /** Mines in the whole board, proved so far, and still to find. */
      readonly total: number;
      readonly found: number;
      readonly left: number;
      /** The numbers counted, whose squares do not meet. */
      readonly members: readonly Side[];
      readonly counted: number[];
      readonly mines: number[];
      readonly safes: number[];
    };

/** What the board shows: its opened numbers, `-1` on a square not opened,
 * and its size and mine count. */
export interface Shown {
  readonly w: number;
  readonly h: number;
  readonly n: number;
  readonly numbers: ArrayLike<number>;
}

/** The opened numbers as the description reads them, written into `into`
 * where given, so a ladder built on it reads the board as it is now. */
function dealtOf(s: Shown, into?: mines.Dealt): mines.Dealt {
  const at: number[] = [];
  const v: number[] = [];
  for (let i = 0; i < s.w * s.h; i++) {
    if (s.numbers[i] < 0) continue;
    at.push(i);
    v.push(s.numbers[i]);
  }
  const count = clueList(at, v, s.w * s.h);
  if (into === undefined) return { count, mines: s.n };
  into.count = count;
  return into;
}

/** The last space built, kept: the generator builds marks again after each
 * perturbation, hundreds of times a deal, on one size of board. */
let space: GridSpace | null = null;

function spaceOf(s: Shown): GridSpace {
  if (space?.w !== s.w || space.h !== s.h)
    space = describedSpace(mines.units, s.w, s.h);
  return space;
}

/** The marks the ladder reads: each opened square safe, and `known` placed. */
function marksOf(s: Shown, known: Uint8Array): CellMarks {
  const grid = known.slice();
  for (let i = 0; i < grid.length; i++) if (s.numbers[i] >= 0) grid[i] = SAFE;
  const m = new CellMarks(spaceOf(s), DOMAIN, grid);
  m.seed(grid);
  return m;
}

/** The number at `c` as a group, on the marks before a firing's facts. */
function groupOf(m: CellMarks, dealt: mines.Dealt, c: number): Group {
  const { sp } = m;
  const cells: number[] = [];
  const found: number[] = [];
  const x = c % sp.w;
  const y = (c / sp.w) | 0;
  for (let j = Math.max(0, y - 1); j <= Math.min(sp.h - 1, y + 1); j++)
    for (let i = Math.max(0, x - 1); i <= Math.min(sp.w - 1, x + 1); i++) {
      const d = j * sp.w + i;
      if (d === c) continue;
      if (!m.known(d)) cells.push(d);
      else if (m.value(d) === MINE) found.push(d);
    }
  const value = dealt.count.valueAt[c];
  return { clue: c, value, cells, need: value - found.length, mines: found };
}

const minus = (a: readonly number[], b: readonly number[]): number[] =>
  a.filter((c) => !b.includes(c));
const meet = (a: readonly number[], b: readonly number[]): number[] =>
  a.filter((c) => b.includes(c));

/** The ladder over the numbers `dealt` holds, each firing with its reason. */
function minesLadder(dealt: mines.Dealt): Ladder {
  return describedLadder(mines, {
    alone: compiledRung(mines.alone, dealt, ({ c, U, n }, _c, _n, m): Firing => {
      const group = groupOf(m, dealt, c);
      return n === 0
        ? { rung: "satisfied", group, safes: [...U] }
        : { rung: "full", group, mines: [...U] };
    }),
    pair: compiledRung(mines.pair, dealt, ({ a, b, O, S }, _c, _n, m): Firing => {
      const heavy = groupOf(m, dealt, a);
      const light = groupOf(m, dealt, b);
      return {
        rung: "pair",
        heavy: { group: heavy },
        light: { group: light },
        shared: meet(heavy.cells, light.cells),
        mines: [...O],
        safes: [...S],
      };
    }),
    region: compiledRung(
      mines.region,
      dealt,
      ({ o, i, b, R, B, r, heavy }, _c, _n, m): Firing => {
        const region: Side = {
          region: {
            outer: groupOf(m, dealt, o),
            inner: groupOf(m, dealt, i),
            cells: [...R],
            need: r,
          },
        };
        const number: Side = { group: groupOf(m, dealt, b) };
        return {
          rung: "pair",
          heavy: heavy ? region : number,
          light: heavy ? number : region,
          shared: meet(R, B),
          mines: heavy ? minus(R, B) : minus(B, R),
          safes: heavy ? minus(B, R) : minus(R, B),
        };
      },
    ),
    regions: compiledRung(
      mines.regions,
      dealt,
      ({ o, i, R, r, p, q, S }, _c, _n, m): Firing => {
        const side = (
          outer: number,
          inner: number,
          cells: readonly number[],
          need: number,
        ): Side => ({
          region: {
            outer: groupOf(m, dealt, outer),
            inner: groupOf(m, dealt, inner),
            cells: [...cells],
            need,
          },
        });
        const heavy = side(o, i, R, r);
        const light = side(
          p,
          q,
          S,
          groupOf(m, dealt, p).need - groupOf(m, dealt, q).need,
        );
        return {
          rung: "pair",
          heavy,
          light,
          shared: meet(R, S),
          mines: minus(R, S),
          safes: minus(S, R),
        };
      },
    ),
    count: compiledRung(mines.count, dealt, ({ T, L, n, X }, _c, _n, m): Firing => {
      let found = 0;
      const all: number[] = [];
      for (let c = 0; c < m.sp.cells.length; c++) {
        if (m.value(c) === MINE) found++;
        if (!m.known(c) && !X.includes(c)) all.push(c);
      }
      return {
        rung: "count",
        total: dealt.mines,
        found,
        left: L,
        members: T.map((k) => ({ group: groupOf(m, dealt, dealt.count.at[k]) })),
        counted: [...X],
        mines: n === L ? [] : all,
        safes: n === L ? all : [],
      };
    }),
  });
}

/** A hint's walk over the ladder from what `s` shows and `known` proves,
 * one firing a call, the first the ladder's order makes, as `deduce.ts` took
 * them: a continuing walk asks every rung for all its firings each step, and
 * a plan runs to the end of the board, which on Expert took half a second a
 * hint (2026-11-01). `reveal` is told after each, and says the board as it
 * now shows, whose newly opened squares the marks then hold safe. */
export interface MinesWalk {
  next(): Firing | null;
  /** The board after the last firing's moves were played on it. */
  reveal(now: Shown): void;
}

export function minesWalk(s: Shown): MinesWalk {
  const m = marksOf(s, new Uint8Array(s.w * s.h));
  m.budget = stepBudget("mines hint");
  const dealt = dealtOf(s);
  const { entries } = minesLadder(dealt);
  let taken: Firing | null = null;
  m.recorder = (rec) => {
    taken ??= rec.reason as Firing;
  };
  const driver = singleFirings({
    techniques: ladderTechniques(m, entries, { [SCALE]: 0 }, {}),
    budget: m.budget,
    beforeTechnique: () => {
      m.group++;
    },
  });
  return {
    next() {
      taken = null;
      return driver.next() === null ? null : taken;
    },
    reveal(now) {
      dealtOf(now, dealt);
      for (let i = 0; i < now.w * now.h; i++)
        if (now.numbers[i] >= 0 && !m.known(i)) m.placeAt(i, SAFE);
    },
  };
}

// --- the generator's certificate --------------------------------------------

/** A square opened: its number, or `-1` where it is a mine. */
export type OpenCb = (x: number, y: number) => number;
export interface Perturbation {
  x: number;
  y: number;
  /** +1 = became a mine; -1 = cleared. */
  delta: number;
}
/** Make the board easier around a set of undecided squares, the 3×3 `mask`
 * from `(setx, sety)`, or anywhere where `mask` is 0, writing the numbers it
 * changes into `grid`; `null` to give up. */
export type PerturbCb = (
  grid: Int8Array,
  setx: number,
  sety: number,
  mask: number,
) => Perturbation[] | null;

/** Unknown, in the generator's grid of what is known: `-1` a mine, a number
 * an opened square. */
const UNKNOWN = -2;

/**
 * Solve `grid` (`-2` unknown, `-1` a mine, `0..8` an opened square) in place
 * on the ladder, opening each square it proves safe through `open`, and, where
 * it stalls, asking `perturb` to make the board easier around a number it
 * stalled on and solving again. Returns `-1` where it stalls with no
 * perturbation to make, `0` where it finished without one, and otherwise how
 * many it made: a board solved only after them is solved again from the start.
 */
export function ladderSolve(
  w: number,
  h: number,
  n: number,
  grid: Int8Array,
  open: OpenCb,
  perturb: PerturbCb | null,
  rs: RandomState | null,
): number {
  const shown: Shown = {
    w,
    h,
    n,
    get numbers() {
      return grid;
    },
  };
  let nperturbs = 0;
  for (;;) {
    // Deduce to a fixpoint, opening what it proves safe, until an opening
    // shows no new number. The marks carry over an opening, which only adds
    // a number; a perturbation can unsettle what they hold, so they are
    // built again after one.
    const known = new Uint8Array(w * h);
    for (let i = 0; i < grid.length; i++) if (grid[i] === -1) known[i] = MINE;
    const m = marksOf(shown, known);
    const dealt = dealtOf(shown);
    const techniques = ladderTechniques(
      m,
      minesLadder(dealt).entries,
      { [SCALE]: 0 },
      {},
    );
    for (let opened = true; opened; ) {
      opened = false;
      if (runLadder(m, techniques))
        throw new Error("mines: the ladder found the board inconsistent");
      for (let i = 0; i < grid.length; i++) {
        if (grid[i] !== UNKNOWN || !m.known(i)) continue;
        if (m.value(i) === MINE) grid[i] = -1;
        else {
          grid[i] = open(i % w, (i / w) | 0);
          if (grid[i] < 0) throw new Error("mines: the ladder opened a mine");
          opened = true;
        }
      }
      if (opened) dealtOf(shown, dealt);
    }
    if (!grid.includes(UNKNOWN)) return nperturbs;
    if (perturb === null) return -1;
    nperturbs++;
    // A number it stalled on: one with an undecided square.
    const stalled: number[] = [];
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] < 0) continue;
      const x = i % w;
      const y = (i / w) | 0;
      let open = false;
      for (let j = Math.max(0, y - 1); j <= Math.min(h - 1, y + 1); j++)
        for (let k = Math.max(0, x - 1); k <= Math.min(w - 1, x + 1); k++)
          if (grid[j * w + k] === UNKNOWN) open = true;
      if (open) stalled.push(i);
    }
    let ret: Perturbation[] | null;
    if (stalled.length === 0) ret = perturb(grid, 0, 0, 0);
    else {
      const c = stalled[randomUpto(rs as RandomState, stalled.length)];
      const x = (c % w) - 1;
      const y = ((c / w) | 0) - 1;
      let mask = 0;
      for (let dy = 0; dy < 3; dy++)
        for (let dx = 0; dx < 3; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx >= 0 && xx < w && yy >= 0 && yy < h && grid[yy * w + xx] === UNKNOWN)
            mask |= 1 << (dy * 3 + dx);
        }
      ret = perturb(grid, x, y, mask);
    }
    if (ret === null) return -1;
  }
}

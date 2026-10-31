/**
 * Each game's binding (design.md § "What a game still writes"): its state read
 * as an instance of its description. This file is what the games had to write
 * for the pilot, and task 2.3 measures it.
 */

import type { DescriptionJson } from "../../src/describe/description.ts";
import type { DeductionRecord } from "../../src/engine/deduction-record.ts";
import type { Game } from "../../src/engine/game.ts";
import { keenGame } from "../../src/games/keen/index.ts";
import {
  C_ADD,
  C_DIV,
  C_MUL,
  C_SUB,
  clueOp,
  clueVal,
  type KeenParams,
  type KeenState,
} from "../../src/games/keen/state.ts";
import { soloGame } from "../../src/games/solo/index.ts";
import {
  DIFF_BLOCK,
  DIFF_INTERSECT,
  DIFF_KINTERSECT,
  DIFF_SET,
  DIFF_SIMPLE,
  type SoloParams,
  type SoloState,
  SYMM_NONE,
} from "../../src/games/solo/state.ts";
import { towersGame } from "../../src/games/towers/index.ts";
import type { TowersParams, TowersState } from "../../src/games/towers/state.ts";
import { unequalGame } from "../../src/games/unequal/index.ts";
import {
  recordUnequalDeductions,
  solveUnequal,
} from "../../src/games/unequal/solver.ts";
import {
  ADJTHAN,
  type UnequalParams,
  type UnequalState,
} from "../../src/games/unequal/state.ts";
import { type Dealt, describedGame } from "./description.ts";
import type { Clue } from "./evaluate.ts";
import type { Elem, Space } from "./space.ts";

/** The game's members the pilot drives, at the game's own types. */
// biome-ignore lint/suspicious/noExplicitAny: a binding holds any game's moves, ui and draw state.
type Driven<P, S> = Game<P, S, any, any, any, any>;

export interface Binding<P, S> {
  game: Driven<P, S>;
  description: DescriptionJson;
  /** The params the pilot deals boards at. */
  params: P[];
  dealt(s: S): Dealt;
  /** The player's values, by cell index; 0 is none. */
  entries(s: S): ArrayLike<number>;
  /** The player's pencil marks, by cell index, bit `1 << v`; 0 is none. */
  notes?(s: S): ArrayLike<number>;
  /** The state with these values in every cell the player may change. */
  withEntries(s: S, values: ArrayLike<number>, notes?: ArrayLike<number>): S;
  /** The game's own solver from the givens, capped at a tier: the level it
   * returns and the candidates it ends with, by cell, bit `1 << v`. */
  ownLadder?(s: S, cap: number): { level: number; masks: Int32Array };
  /** The game's recording solver from the givens, capped at a tier: every
   * firing its hint narrates from, in order. */
  ownFirings?(s: S, cap: number): readonly DeductionRecord[];
}

/** A Latin solver's `o³` cube, `(x·o + y)·o + (n−1)`, as masks by cell. */
function cubeMasks(cube: Uint8Array, o: number): Int32Array {
  const masks = new Int32Array(o * o);
  for (let x = 0; x < o; x++)
    for (let y = 0; y < o; y++)
      for (let n = 1; n <= o; n++)
        if (cube[(x * o + y) * o + n - 1]) masks[y * o + x] |= 1 << n;
  return masks;
}

const tiers = <D extends string>(sizes: number[], diffs: readonly D[]) =>
  sizes.flatMap((w) => diffs.map((diff) => ({ w, diff })));

const cellAt = (space: { cells: Elem[] }, i: number): Elem => space.cells[i];

export const towersBinding: Binding<TowersParams, TowersState> = {
  game: towersGame,
  description: describedGame("src/games/towers/towers.description.yaml"),
  params: tiers([4, 5, 6], ["easy", "hard", "extreme", "unreasonable"] as const),
  dealt: (s) => ({
    sizes: { w: s.w },
    givens: s.immutable,
    clues: (space) => {
      const slots = space.names.get("slots") as Elem[];
      return [...s.clues].flatMap((v, i) =>
        v === 0 ? [] : [{ kind: "sees", at: slots[i], v }],
      );
    },
  }),
  entries: (s) => s.grid,
  withEntries: (s, values, notes) => ({
    ...s,
    grid: Int8Array.from(values),
    pencil: notes ? Int32Array.from(notes) : new Int32Array(s.w * s.w),
  }),
};

const KEEN_KIND: Readonly<Record<number, string>> = {
  [C_ADD]: "sum",
  [C_MUL]: "product",
  [C_SUB]: "difference",
  [C_DIV]: "quotient",
};

/** Keen's cages, in the order of their least cells, each in reading order. */
function keenCages(s: KeenState): number[][] {
  const { minimal } = s.clues;
  const at = new Map<number, number[]>();
  minimal.forEach((m, i) => {
    at.set(m, [...(at.get(m) ?? []), i]);
  });
  return [...at.values()];
}

export const keenBinding: Binding<KeenParams, KeenState> = {
  game: keenGame,
  description: describedGame("src/games/keen/keen.description.yaml"),
  params: tiers([4, 5, 6], [
    "easy",
    "normal",
    "hard",
    "extreme",
    "unreasonable",
  ] as const).map((p) => ({ ...p, multiplicationOnly: false })),
  dealt: (s) => ({
    sizes: { w: s.params.w },
    regions: { cage: keenCages(s) },
    givens: new Int8Array(s.grid.length),
    clues: (space) => {
      const cages = space.names.get("cage") as Elem[];
      return keenCages(s).map((cells, i) => {
        const clue = s.clues.clues[cells[0]];
        return { kind: KEEN_KIND[clueOp(clue)], at: cages[i], v: clueVal(clue) };
      });
    },
  }),
  entries: (s) => s.grid,
  notes: (s) => s.pencil,
  withEntries: (s, values, notes) => ({
    ...s,
    grid: Int8Array.from(values),
    pencil: notes ? Int32Array.from(notes) : new Int32Array(s.grid.length),
  }),
};

export const soloBinding: Binding<SoloParams, SoloState> = {
  game: soloGame,
  description: describedGame("src/games/solo/solo.description.yaml"),
  params: [
    ...[DIFF_BLOCK, DIFF_SIMPLE, DIFF_INTERSECT].map((diff) => ({
      ...soloGame.defaultParams(),
      c: 2,
      r: 3,
      diff,
    })),
    ...[DIFF_SIMPLE, DIFF_INTERSECT, DIFF_SET].map((diff) => ({
      ...soloGame.defaultParams(),
      c: 3,
      r: 3,
      diff,
    })),
    { ...soloGame.defaultParams(), diff: DIFF_SIMPLE, xtype: true },
    { ...soloGame.defaultParams(), c: 9, r: 1, diff: DIFF_SIMPLE },
    {
      ...soloGame.defaultParams(),
      symm: SYMM_NONE,
      kdiff: DIFF_KINTERSECT,
      killer: true,
    },
  ],
  dealt: (s) => ({
    variations: [
      ...(s.params.r === 1 ? ["Jigsaw"] : []),
      ...(s.xtype ? ["X"] : []),
      ...(s.killer ? ["Killer"] : []),
    ],
    sizes: { c: s.params.c, r: s.params.r },
    regions: {
      box: s.blocks.blocks,
      ...(s.killerData ? { cage: s.killerData.kblocks.blocks } : {}),
    },
    givens: s.grid.map((v, i) => (s.immutable[i] ? v : 0)),
    clues: (space) => {
      const k = s.killerData;
      if (k === null) return [];
      const cages = space.names.get("cage") as Elem[];
      return k.kblocks.blocks.map((cells, i) => ({
        kind: "cage",
        at: cages[i],
        v: Math.max(...cells.map((c) => k.kgrid[c])),
      }));
    },
  }),
  entries: (s) => s.grid,
  notes: (s) => s.pencil,
  withEntries: (s, values, notes) => ({
    ...s,
    grid: Int8Array.from(values),
    pencil: notes ? Int32Array.from(notes) : new Int32Array(s.grid.length),
  }),
};

/** One binding for both modes: the state says which description it is. */
function unequalDealt(s: UnequalState): Dealt {
  const o = s.order;
  return {
    sizes: { order: o },
    givens: s.immutable,
    clues: (space) => {
      const out: Clue[] = [];
      for (let i = 0; i < o * o; i++)
        for (const d of ADJTHAN) {
          const x = (i % o) + d.dx;
          const y = Math.floor(i / o) + d.dy;
          if (x < 0 || y < 0 || x >= o || y >= o) continue;
          const j = y * o + x;
          const flagged = (s.clueFlags[i] & d.f) !== 0;
          if (s.mode === "unequal") {
            if (flagged)
              out.push({
                kind: "greater",
                at: edgeOf(space, i, j),
                v: cellAt(space, i),
              });
          } else if (j > i) {
            // Every edge carries one: a bar or none, the clue kind complete.
            out.push({ kind: "bar", at: edgeOf(space, i, j), v: flagged ? 1 : 0 });
          }
        }
      return out;
    },
  };
}

function edgeOf(space: Space, i: number, j: number): Elem {
  const edge = space.fns.get("edge");
  if (edge === undefined) throw new Error("no edges in the space");
  return edge([space.cells[i], space.cells[j]]) as Elem;
}

const unequalCommon = {
  game: unequalGame,
  dealt: unequalDealt,
  entries: (s: UnequalState) => s.grid,
  notes: (s: UnequalState) => s.pencil,
  withEntries: (
    s: UnequalState,
    values: ArrayLike<number>,
    notes?: ArrayLike<number>,
  ) => ({
    ...s,
    grid: Int8Array.from(values),
    pencil: notes ? Int32Array.from(notes) : new Int32Array(s.order * s.order),
  }),
  ownLadder: (s: UnequalState, cap: number) => {
    const o = s.order;
    const cube = new Uint8Array(o * o * o);
    const level = solveUnequal(
      o,
      s.mode,
      s.clueFlags,
      Uint8Array.from(s.immutable),
      cap,
      cube,
    );
    return { level, masks: cubeMasks(cube, o) };
  },
  ownFirings: (s: UnequalState, cap: number) =>
    recordUnequalDeductions(
      s.order,
      s.mode,
      s.clueFlags,
      Uint8Array.from(s.immutable),
      cap,
    ),
};
const unequalDiffs = ["trivial", "easy", "tricky", "extreme", "recursive"] as const;

export const unequalBinding: Binding<UnequalParams, UnequalState> = {
  ...unequalCommon,
  description: describedGame("src/games/unequal/unequal.description.yaml"),
  params: tiers([4, 5, 6], unequalDiffs).map((p) => ({
    order: p.w,
    mode: "unequal",
    diff: p.diff,
  })),
};

export const adjacentBinding: Binding<UnequalParams, UnequalState> = {
  ...unequalCommon,
  description: describedGame("src/games/unequal/adjacent.description.yaml"),
  params: tiers([4, 5, 6], unequalDiffs).map((p) => ({
    order: p.w,
    mode: "adjacent",
    diff: p.diff,
  })),
};

/**
 * Each game's binding (design.md § "What a game still writes"): its state read
 * as an instance of its description. This file is what the games had to write
 * for the pilot, and task 2.3 measures it.
 */

import type { DescriptionJson } from "../../src/describe/description.ts";
import type { Game } from "../../src/engine/contract/game.ts";
import { mathraxGame } from "../../src/games/mathrax/index.ts";
import {
  CLUE_ADD,
  CLUE_DIV,
  CLUE_EVN,
  CLUE_MUL,
  CLUE_ODD,
  CLUE_SUB,
  F_IMMUTABLE,
  OPTIONSMASK as MATHRAX_OPTIONS,
  type MathraxParams,
  type MathraxState,
  clueNum as mathraxClueNum,
  clueType as mathraxClueType,
  OPTION_DIV,
  OPTION_EQL,
  OPTION_ODD,
} from "../../src/games/mathrax/state.ts";
import { saladGame } from "../../src/games/salad/index.ts";
import {
  CIRCLE,
  CROSS,
  GAMEMODE_LETTERS,
  GAMEMODE_NUMBERS,
  DIFF_EASY as SALAD_EASY,
  DIFF_NORMAL as SALAD_NORMAL,
  type SaladParams,
  type SaladState,
} from "../../src/games/salad/state.ts";
import { soloGame } from "../../src/games/solo/index.ts";
import {
  DIFF_EASY,
  DIFF_HARD,
  DIFF_KREGION,
  DIFF_NORMAL,
  DIFF_TRICKY,
  type SoloParams,
  type SoloState,
  SYMM_NONE,
} from "../../src/games/solo/state.ts";
import { towersGame } from "../../src/games/towers/index.ts";
import type { TowersParams, TowersState } from "../../src/games/towers/state.ts";
import { type Dealt, describedGame } from "./description.ts";
import type { Clue } from "./evaluate.ts";
import type { Elem } from "./space.ts";

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
  /** Whether the game refuses the player this value in this cell, which a
   * planted entry then leaves out (Salad's cross on a given ball). */
  refuses?(s: S, cell: number, v: number): boolean;
  /** The game's mistake kinds as the rules' (`cell` or `note`), where its
   * own are more (Salad's `cross`, a value entered wrong). */
  mistakeKinds?: Readonly<Record<string, string>>;
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

const MATHRAX_KIND: Readonly<Record<number, string>> = {
  [CLUE_ADD]: "sum",
  [CLUE_SUB]: "difference",
  [CLUE_MUL]: "product",
  [CLUE_DIV]: "quotient",
  [CLUE_EVN]: "parity",
  [CLUE_ODD]: "parity",
};

export const mathraxBinding: Binding<MathraxParams, MathraxState> = {
  game: mathraxGame,
  description: describedGame("src/games/mathrax/mathrax.description.yaml"),
  // With every kind allowed the generator's cascade all but never reaches a
  // quotient or a parity, and equality comes before a quotient in it, so
  // boards of a quotient and a parity alone, and equality and a parity.
  params: [4, 5, 6].flatMap((o) =>
    [MATHRAX_OPTIONS, OPTION_DIV | OPTION_ODD, OPTION_EQL | OPTION_ODD].flatMap(
      (options) =>
        (["easy", "normal", "tricky", "recursive"] as const).map((diff) => ({
          o,
          diff,
          options,
        })),
    ),
  ),
  dealt: (s) => ({
    sizes: { w: s.params.o },
    givens: Array.from(s.grid, (v, i) => (s.flags[i] & F_IMMUTABLE ? v : 0)),
    clues: (space) => {
      const corners = space.names.get("corners") as Elem[];
      return [...s.clues].flatMap((clue, k) => {
        const t = mathraxClueType(clue);
        if (t === 0) return [];
        const v = t === CLUE_EVN ? 0 : t === CLUE_ODD ? 1 : mathraxClueNum(clue);
        return [{ kind: MATHRAX_KIND[t], at: corners[k], v }];
      });
    },
  }),
  entries: (s) => s.grid,
  notes: (s) => s.pencil,
  withEntries: (s, values, notes) => ({
    ...s,
    grid: Uint8Array.from(values),
    pencil: notes ? Int32Array.from(notes) : new Int32Array(s.grid.length),
  }),
};

export const soloBinding: Binding<SoloParams, SoloState> = {
  game: soloGame,
  description: describedGame("src/games/solo/solo.description.yaml"),
  params: [
    ...[DIFF_EASY, DIFF_NORMAL, DIFF_TRICKY].map((diff) => ({
      ...soloGame.defaultParams(),
      c: 2,
      r: 3,
      diff,
    })),
    ...[DIFF_NORMAL, DIFF_TRICKY, DIFF_HARD].map((diff) => ({
      ...soloGame.defaultParams(),
      c: 3,
      r: 3,
      diff,
    })),
    { ...soloGame.defaultParams(), diff: DIFF_NORMAL, xtype: true },
    { ...soloGame.defaultParams(), c: 9, r: 1, diff: DIFF_NORMAL },
    {
      ...soloGame.defaultParams(),
      symm: SYMM_NONE,
      kdiff: DIFF_KREGION,
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
        kind: "total",
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

/** A border clue as Salad numbers it (top, left, bottom, right), as the
 * space numbers its slots (above each column, below each, left of each row,
 * right of each). */
const saladSlot = (cd: number, o: number): number =>
  [0, 2, 1, 3][(cd / o) | 0] * o + (cd % o);

export const saladBinding: Binding<SaladParams, SaladState> = {
  game: saladGame,
  description: describedGame("src/games/salad/salad.description.yaml"),
  // Normal deals a two-symbol Numbers board in most of a minute.
  params: [GAMEMODE_LETTERS, GAMEMODE_NUMBERS].flatMap((mode) =>
    [
      [4, 2],
      [4, 3],
      [5, 3],
      [5, 4],
      [6, 4],
    ].flatMap(([order, nums]) =>
      [SALAD_EASY, SALAD_NORMAL]
        .filter(
          (diff) => !(mode === GAMEMODE_NUMBERS && nums === 2 && diff === SALAD_NORMAL),
        )
        .map((diff) => ({ order, nums, mode, diff })),
    ),
  ),
  dealt: (s) => {
    const hole = s.nums + 1;
    return {
      sizes: { order: s.order, nums: s.nums },
      givens: Array.from(s.gridclues, (v) =>
        v === CROSS ? hole : v === CIRCLE ? 0 : v,
      ),
      clues: (space) => {
        const slots = space.names.get("slots") as Elem[];
        const out: Clue[] = [];
        s.borderclues.forEach((v, cd) => {
          if (v) out.push({ kind: "border", at: slots[saladSlot(cd, s.order)], v });
        });
        s.gridclues.forEach((v, c) => {
          if (v === CIRCLE) out.push({ kind: "ball", at: cellAt(space, c), v: hole });
        });
        return out;
      },
    };
  },
  // A blank square of a finished board is empty.
  entries: (s) => Array.from(s.grid, (v) => (v === 0 ? s.nums + 1 : v)),
  withEntries: (s, values, notes) => {
    const hole = s.nums + 1;
    const holes = s.holes.slice();
    for (let c = 0; c < values.length; c++)
      if (values[c] === hole && s.gridclues[c] !== CIRCLE) holes[c] = CROSS;
    return {
      ...s,
      grid: Uint8Array.from(values, (v) => (v === hole ? 0 : v)),
      holes,
      // Salad keeps value n at bit n - 1.
      pencil: Int32Array.from(
        notes ?? new Array<number>(values.length).fill(0),
        (m) => m >> 1,
      ),
    };
  },
  refuses: (s, cell, v) => v === s.nums + 1 && s.gridclues[cell] === CIRCLE,
  mistakeKinds: { cross: "cell" },
};

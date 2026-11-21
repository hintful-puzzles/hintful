/**
 * Light Up's solver: the ladder `lightup.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/solve/cell-marks.ts` and
 * `ladder-runtime.ts`), the answer check its rules compile to, and the search
 * beneath the ladder.
 *
 * Easy is upstream's cheap scan, a column at a time: a dark square with one
 * free square left that could light it, then a number whose count leaves its
 * free neighbors no choice. Normal adds upstream's discount sets: a square
 * whose bulb would spoil every square of a set one of which must hold a bulb
 * holds none.
 *
 * Beneath the ladder, a search by trial and error over it
 * ({@link searchAnswers}) counts a board's answers. It is what an
 * Unreasonable board is dealt by, and what Solve and the mistake check know
 * the answer from at every tier. The hint never runs it.
 */

import type { RulesOf } from "../../engine/contract/rules.ts";
import {
  type Answer,
  answerCache,
  type Deduced,
  searchAnswers as searchBoard,
} from "../../engine/solve/answer-search.ts";
import { CellMarks } from "../../engine/solve/cell-marks.ts";
import {
  clueAt,
  cluesWhere,
  describedSpace,
  type GridSpace,
  stretch,
} from "../../engine/solve/describe-runtime.ts";
import { describedRules } from "../../engine/solve/described-rules.ts";
import {
  describedLadder,
  type Ladder,
  type LadderEntry,
  ladderTechniques,
  runLadder,
  type Said,
  TIERS,
} from "../../engine/solve/ladder-runtime.ts";
import { stepBudget } from "../../engine/solve/step-budget.ts";
import * as lightup from "../../generated/games/lightup/lightup.compiled.ts";
import {
  F_BLACK,
  F_IMPOSSIBLE,
  F_LIGHT,
  F_NUMBERED,
  type LightupState,
} from "./state.ts";

/** What the description reads a square as holding: a bulb, or none, which a
 * wall holds too. */
export const BULB = 1;
export const NONE = 2;

/** The highest tier the ladder grades: Normal. */
const NORMAL = 1;

/** The values the description reads off a state: a wall holds none, and so
 * does a square the player has crossed; a bulb is a bulb. With `marks`
 * false, only the walls are read. */
function valuesOf(state: LightupState, marks: boolean): Uint8Array {
  return Uint8Array.from(state.flags, (f) => {
    if (f & F_BLACK) return NONE;
    if (!marks) return 0;
    if (f & F_LIGHT) return BULB;
    return f & F_IMPOSSIBLE ? NONE : 0;
  });
}

/** The board as the description deals it: its walls, and its numbers. */
export function dealtOf({ flags, lights }: LightupState): lightup.Dealt {
  const black = (f: number): boolean => (f & F_BLACK) !== 0;
  const numbered = (f: number): boolean => (f & F_NUMBERED) !== 0;
  return {
    wall: cluesWhere(
      flags,
      (f) => black(f) && !numbered(f),
      () => 0,
    ),
    number: cluesWhere(
      flags,
      (f) => black(f) && numbered(f),
      (_, c) => lights[c],
    ),
  };
}

/** The board as its rules read it: a bulb; a wall, and a square crossed or
 * lit without a bulb, as holding none, since a bulb on a lit square would
 * light another; any other square undecided. */
export const rules: RulesOf<LightupState> = describedRules(lightup, {
  grid: ({ flags, lights }) =>
    Uint8Array.from(flags, (f, i) =>
      f & F_LIGHT ? BULB : f & (F_BLACK | F_IMPOSSIBLE) || lights[i] > 0 ? NONE : 0,
    ),
  size: (s) => [s.w, s.h],
  deals: (s) => [dealtOf(s)],
});

/** The rules a square breaks, as the live errors draw them. */
export const EVERY_SQUARE_LIT: lightup.RuleName = "shape.0";
export const NO_BULB_LIGHTS_ANOTHER: lightup.RuleName = "shape.1";

function lightupSpace(w: number, h: number): GridSpace {
  return describedSpace(lightup.units, w, h);
}

/** The squares a bulb in `c` lights, `c` among them: the description's
 * `lights(c)`. */
function lightsOf(sp: GridSpace, dl: lightup.Dealt, c: number): number[] {
  const floors = (L: readonly number[]): number[] =>
    L.filter((p) => clueAt(dl.wall, p) < 0 && clueAt(dl.number, p) < 0);
  const row = sp.lineCells[sp.rowOf[c]];
  const col = sp.lineCells[sp.colOf[c]];
  return [
    ...stretch(row, c, floors(row)),
    ...stretch(col, c, floors(col)).filter((p) => p !== c),
  ];
}

/** The marks over `values`, every free square either way, the walls and
 * each bulb's light placed. False where two bulbs light each other. */
function lightupMarks(
  sp: GridSpace,
  dl: lightup.Dealt,
  ladder: Ladder,
  values: Uint8Array,
): CellMarks | null {
  const m = new CellMarks(sp, ~0, values);
  m.placing = ladder.placing;
  return m.seed(values, (c) => lightup.domainOf(sp, dl, c)) ? m : null;
}

/** Run the ladder on `m` to a fixpoint, no harder than `cap`, and say what
 * it reached. */
function deduce(m: CellMarks, ladder: Ladder, dl: lightup.Dealt, cap: number): Deduced {
  const techniques = ladderTechniques(m, ladder.entries, { [TIERS]: cap }, {});
  if (runLadder(m, techniques)) return "contradiction";
  if (m.grid.includes(0)) return "stuck";
  return lightup.isAnswer(m.grid, m.sp, dl) ? "solved" : "contradiction";
}

/**
 * Whether the ladder, no harder than `cap`, finishes the board from its
 * walls and numbers; the player's marks are not read. `used`, where given,
 * is told each number a reading of its count acted on, which upstream's
 * generator strips the others by.
 */
export function deductionFinishes(
  state: LightupState,
  cap: number,
  used?: (clue: number) => void,
): boolean {
  const dl = dealtOf(state);
  const ladder = describedLadder(lightup, dl);
  const sp = lightupSpace(state.w, state.h);
  const m = lightupMarks(sp, dl, ladder, valuesOf(state, false));
  if (m === null) return false;
  if (used) {
    m.recorder = (rec) => {
      // A number is read by `clueFull` and `clueExact`, whose `c` is the
      // numbered wall; every other technique's `c` is a square.
      const reason = rec.reason as Partial<Said<{ c?: number }, unknown>> | null;
      const c = reason?.binding?.c;
      if (c !== undefined && clueAt(dl.number, c) >= 0) used(c);
    };
    m.budget = stepBudget("lightup deduction");
    m.wholePasses = true;
  }
  return deduce(m, ladder, dl, cap) === "solved";
}

/** Whether a state's bulbs are an answer to its board, by the rules the
 * description compiles to. */
export function isSolved(state: LightupState): boolean {
  const values = valuesOf(state, true).map((v) => v || NONE);
  return lightup.isAnswer(values, lightupSpace(state.w, state.h), dealtOf(state));
}

// --- the search for a board's answers ---------------------------------------

/** What a search established about a board's answers; the one answer is
 * each square's value, `1` a bulb. */
export type LightupAnswer = Answer<Uint8Array>;

/**
 * The positions a search may try before it gives up, each one a free square
 * assumed one way and the deduction run from it.
 *
 * It decides which Unreasonable boards exist: a board that needs more is
 * thrown away when dealing and refused when pasted. Lowering it refuses boards
 * already dealt, which are in saved games.
 */
const SEARCH_BUDGET = 2_000;

/**
 * Count a board's answers up to two, by trial and error over the ladder.
 * Where it stops, the free square that would light the most dark squares is
 * assumed to hold no bulb, and then one, as upstream's recursion guessed.
 * `state` is read for its walls and numbers only.
 */
export function searchAnswers(
  state: LightupState,
  budget: number = SEARCH_BUDGET,
): LightupAnswer {
  const dl = dealtOf(state);
  const ladder = describedLadder(lightup, dl);
  const sp = lightupSpace(state.w, state.h);
  const start = lightupMarks(sp, dl, ladder, valuesOf(state, false));
  if (start === null) return { kind: "none" };
  const lights = sp.cells.map((c) => lightsOf(sp, dl, c));
  const branch = (m: CellMarks, at: number, d: number): CellMarks => {
    const sub = new CellMarks(sp, m.domain, m.grid.slice());
    sub.placing = ladder.placing;
    sub.cands.set(m.cands);
    sub.place(at, d);
    return sub;
  };
  const dark = (m: CellMarks, c: number): boolean =>
    lightup.domainOf(sp, dl, c) !== 1 << NONE &&
    !lights[c].some((p) => m.grid[p] === BULB);
  return searchBoard<CellMarks, Uint8Array>({
    start,
    deduce: (m) => deduce(m, ladder, dl, NORMAL),
    assume(m) {
      let best = -1;
      let most = 0;
      for (const c of sp.cells) {
        if (m.grid[c] !== 0) continue;
        const n = lights[c].filter((p) => dark(m, p)).length;
        if (n > most) {
          most = n;
          best = c;
        }
      }
      if (best < 0) return [];
      return [NONE, BULB].map((d) => branch(m, best, d));
    },
    solution: (m) => Uint8Array.from(m.grid),
    budget,
  });
}

/** Keyed on a state's dealt board, which every state of a game shares. */
const answers = answerCache<Uint8Array, Uint8Array>();

/** What a search of a state's walls and numbers established about their
 * answers. The player's marks are not read. */
export function answerOf(state: LightupState): LightupAnswer {
  return answers(state.board, () => searchAnswers(state));
}

/** Whether square `c` of an answer holds a bulb. */
export const holdsBulb = (solution: Uint8Array, c: number): boolean =>
  solution[c] === BULB;

// --- the hint's walk ---------------------------------------------------------

/** What a hint walks: the marks over a state's walls, numbers and the
 * player's bulbs and crosses, and the ladder's techniques; `null` where the
 * marks break the rules. */
export function hintWalk(state: LightupState): {
  marks: CellMarks;
  entries: readonly LadderEntry[];
} | null {
  const dl = dealtOf(state);
  const ladder = describedLadder(lightup, dl);
  const m = lightupMarks(
    lightupSpace(state.w, state.h),
    dl,
    ladder,
    valuesOf(state, true),
  );
  return m === null ? null : { marks: m, entries: ladder.entries };
}

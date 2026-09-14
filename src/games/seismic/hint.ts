/**
 * Seismic's explained hint: the plan, walked on a copy of the player's own board.
 *
 * **Deduced from the player's notes, not from the givens alone.** A candidate game
 * normally re-solves from the placed numbers and only compares the result with the
 * notes, because a note can be wrong (docs/games/hints.md § "The recorder and the
 * soundness boundary"). Seismic's `findMistakes` refuses the hint on any note that
 * has crossed out its cell's answer, so wherever this runs every cell's notes still
 * hold that answer, and a single or a starved area read off them is as sound as one
 * read off the solver's own candidates. It is also the deduction the player can
 * check against their screen.
 *
 * **Parallel to the solver's rungs, and held to them.** Each finder is the
 * one-firing form of a rung in `solver.ts`: {@link nakedSingle} is `marks`,
 * {@link hiddenSingle} is `areas` together with the single it leaves, and
 * {@link starves} is `attempt`. A rung sweeps the whole board and applies all it
 * finds, while a step is one firing, and the rules are a few lines each, so
 * re-deriving them costs less than threading an early return through all three.
 * The generator never calls this file, so no board changes. `seismic-hint.test.ts`
 * holds {@link starves} to `placeNumber` and `regionsViable`'s own verdicts, and
 * every plan to finishing its board.
 */

import {
  anyEmptyLacksNotes,
  type CandidateHighlights,
  type CandidateMoveAdapter,
  keepCandidateHintTrack,
  type Mark,
  type NoteEncoding,
  nakedSingle,
  obviousCleanStep,
  populateStep,
  refreshCandidateHintStep,
} from "../../engine/candidate-hint.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { deduceHintPlan, type HintPlanResult } from "../../engine/hint-plan.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { Point } from "../../engine/types.ts";
import { say } from "./hint-text.ts";
import { STATUS_UNFINISHED, validateGame } from "./solver.ts";
import {
  areaBits,
  MODE_TECTONIC,
  numBit,
  type SeismicBoard,
  type SeismicMove,
  type SeismicState,
} from "./state.ts";

export type SeismicHint = CandidateHighlights;

/** Seismic's notes: candidate `n` at bit `n − 1`, up to the nine a region may hold. */
const NOTES: NoteEncoding = { bit: numBit, values: 9 };

/** Seismic's moves already carry the shared names; only the note bit differs. */
const seismicCandidateMoves: CandidateMoveAdapter<SeismicMove> = {
  read: (m) => (m.type === "solve" ? null : m),
  strike: (marks) => ({ type: "pencilStrike", marks }),
  bit: numBit,
};

/** Why a number is placed. */
export type PlaceWhy = "singleton" | "naked" | "hidden";

/** One firing: what the plan does next, before it is put into words. */
export type SeismicFiring =
  | { kind: "populate" }
  | { kind: "clean"; marks: Mark[] }
  | {
      kind: "place";
      x: number;
      y: number;
      n: number;
      why: PlaceWhy;
      /** The area a hidden single reasons over; empty otherwise. */
      area: Point[];
      /** The live notes the placed number rules out. */
      cull: Mark[];
    }
  | { kind: "starve"; n: number; area: Point[]; targets: Point[] };

/** An area left with no home for `n` by an `n` in any of `targets`. */
export interface Starve {
  n: number;
  area: readonly number[];
  targets: number[];
}

const cellOf = (b: SeismicBoard, i: number): Point => ({
  x: i % b.w,
  y: (i / b.w) | 0,
});

/**
 * Would an `n` at `i` rule out an `n` at `j`? `placeNumber`'s rule, asked of one
 * pair: the same area, or the mode's keep-apart reach (`n` cells along a row or
 * column in Seismic, the eight neighbors in Tectonic).
 */
function clashes(b: SeismicBoard, i: number, j: number, n: number): boolean {
  if (i === j) return false;
  if (b.dsf.equivalent(i, j)) return true;
  const dx = Math.abs((i % b.w) - (j % b.w));
  const dy = Math.abs(((i / b.w) | 0) - ((j / b.w) | 0));
  return b.mode === MODE_TECTONIC
    ? dx <= 1 && dy <= 1
    : (dx === 0 && dy <= n) || (dy === 0 && dx <= n);
}

/** Every live note an `n` at `i` rules out. */
function cullOf(b: SeismicBoard, i: number, n: number): Mark[] {
  const marks: Mark[] = [];
  for (let j = 0; j < b.grid.length; j++) {
    if (b.grid[j] === 0 && b.pencil[j] & numBit(n) && clashes(b, i, j, n))
      marks.push({ ...cellOf(b, j), n });
  }
  return marks;
}

/**
 * The player's board, as the plan works on it. A placed cell's notes read as the
 * number it holds, because the rules read a placed cell's candidates that way and
 * whatever notes the player left under a number mean nothing.
 */
export function workingBoard(state: SeismicState): SeismicBoard {
  const { w, h, mode, dsf, grid } = state;
  const pencil = state.pencil.slice();
  for (let i = 0; i < grid.length; i++)
    pencil[i] = grid[i] ? numBit(grid[i]) : pencil[i] & areaBits(dsf.size(i));
  return { w, h, mode, dsf, grid: grid.slice(), flags: state.flags.slice(), pencil };
}

/** Each area's cells, areas in the order of their first cell. */
export function areasOf(b: SeismicBoard): number[][] {
  const byRoot = new Map<number, number[]>();
  for (let i = 0; i < b.grid.length; i++) {
    const root = b.dsf.canonify(i);
    const cells = byRoot.get(root);
    if (cells) cells.push(i);
    else byRoot.set(root, [i]);
  }
  return [...byRoot.values()];
}

/** Whether every empty cell of `area` carries notes, so its notes say where each
 * number can still go. */
const notedThroughout = (b: SeismicBoard, area: readonly number[]): boolean =>
  area.every((j) => b.grid[j] !== 0 || b.pencil[j] !== 0);

/** The empty cells of `area` still noting `n`, or `null` when `n` is already
 * placed there. */
function homesOf(b: SeismicBoard, area: readonly number[], n: number): number[] | null {
  if (area.some((j) => b.grid[j] === n)) return null;
  return area.filter((j) => b.grid[j] === 0 && (b.pencil[j] & numBit(n)) !== 0);
}

function placing(
  b: SeismicBoard,
  i: number,
  n: number,
  why: PlaceWhy,
  area: readonly number[],
): SeismicFiring {
  return {
    kind: "place",
    ...cellOf(b, i),
    n,
    why,
    area: area.map((j) => cellOf(b, j)),
    cull: cullOf(b, i, n),
  };
}

/** An empty cell that is a whole area, which can only hold a 1. */
function singleton(b: SeismicBoard): SeismicFiring | null {
  for (let i = 0; i < b.grid.length; i++)
    if (b.grid[i] === 0 && b.dsf.size(i) === 1)
      return placing(b, i, 1, "singleton", []);
  return null;
}

/** A number with one home left in an area. */
function hiddenSingle(
  b: SeismicBoard,
  areas: readonly number[][],
): SeismicFiring | null {
  for (const area of areas) {
    if (!notedThroughout(b, area)) continue;
    for (let n = 1; n <= area.length; n++) {
      const homes = homesOf(b, area, n);
      if (homes?.length === 1) return placing(b, homes[0], n, "hidden", area);
    }
  }
  return null;
}

/**
 * **The trial rung, as the deduction it always comes to.** `solverAttempt` places
 * a candidate, lets `placeNumber` strike it from every cell it clashes with, and
 * rejects it when some area has no home left for a number it owes. An `n` placed
 * at `c` takes `n` from other cells and other numbers from `c` alone, so the area
 * left short is either `c`'s own, missing a number only `c` could hold — a hidden
 * single, which is found first — or another area that has lost its last `n`.
 *
 * That second case is this finder: an area whose every remaining home for `n`
 * clashes with `c`. It is one placement and one look at one area, so it is a
 * **Check** (docs/games/solver-and-generator.md § "Check, Tactic, Search"), and
 * every cell that clashes with all of those homes is ruled out by the same fact,
 * which makes them one firing.
 */
export function* starves(
  b: SeismicBoard,
  areas: readonly (readonly number[])[],
): Generator<Starve> {
  for (const area of areas) {
    if (!notedThroughout(b, area)) continue;
    for (let n = 1; n <= area.length; n++) {
      const homes = homesOf(b, area, n);
      if (!homes || homes.length === 0) continue;
      const targets: number[] = [];
      for (let c = 0; c < b.grid.length; c++) {
        if (b.grid[c] !== 0 || !(b.pencil[c] & numBit(n))) continue;
        if (b.dsf.equivalent(c, area[0])) continue;
        if (homes.every((h) => clashes(b, c, h, n))) targets.push(c);
      }
      if (targets.length > 0) yield { n, area, targets };
    }
  }
}

/** Every note a number already placed rules out: the one-off setup strike. */
function obviousMarks(b: SeismicBoard): Mark[] {
  const marks: Mark[] = [];
  for (let j = 0; j < b.grid.length; j++) {
    if (b.grid[j] !== 0) continue;
    for (let n = 1; n <= 9; n++) {
      if (!(b.pencil[j] & numBit(n))) continue;
      for (let p = 0; p < b.grid.length; p++) {
        if (b.grid[p] === n && clashes(b, p, j, n)) {
          marks.push({ ...cellOf(b, j), n });
          break;
        }
      }
    }
  }
  return marks;
}

/**
 * The next firing, in the order a person solves: a single first, since it is the
 * move they make next; then the notes, filled once they are needed and cleaned of
 * what the placed numbers already rule out; then a hidden single; and only then an
 * area starved by a candidate.
 */
function nextFiring(
  b: SeismicBoard,
  areas: readonly number[][],
  setup: { cleaned: boolean },
): SeismicFiring | null {
  const lone = singleton(b);
  if (lone) return lone;

  const naked = nakedSingle(b.grid, b.pencil, b.w, NOTES);
  if (naked) return placing(b, naked.y * b.w + naked.x, naked.n, "naked", []);

  if (anyEmptyLacksNotes(b.grid, b.pencil)) return { kind: "populate" };

  if (!setup.cleaned) {
    setup.cleaned = true;
    const marks = obviousMarks(b);
    if (marks.length > 0) return { kind: "clean", marks };
  }

  const hidden = hiddenSingle(b, areas);
  if (hidden) return hidden;

  const starved = starves(b, areas).next();
  if (starved.done) return null;
  const { n, area, targets } = starved.value;
  return {
    kind: "starve",
    n,
    area: area.map((j) => cellOf(b, j)),
    targets: targets.map((c) => cellOf(b, c)),
  };
}

function strike(b: SeismicBoard, marks: readonly Mark[]): void {
  for (const m of marks) b.pencil[m.y * b.w + m.x] &= ~numBit(m.n);
}

/** Apply a firing exactly as following its steps changes the player's board. */
function applyFiring(b: SeismicBoard, f: SeismicFiring): void {
  switch (f.kind) {
    case "populate":
      // The additive `pencilAll`, mirrored: only cells with no notes are filled.
      for (let i = 0; i < b.grid.length; i++)
        if (b.grid[i] === 0 && b.pencil[i] === 0) b.pencil[i] = areaBits(b.dsf.size(i));
      return;
    case "clean":
      strike(b, f.marks);
      return;
    case "place": {
      const i = f.y * b.w + f.x;
      b.grid[i] = f.n;
      b.pencil[i] = numBit(f.n);
      strike(b, f.cull);
      return;
    }
    case "starve":
      strike(
        b,
        f.targets.map((t) => ({ ...t, n: f.n })),
      );
      return;
  }
}

/** The whole plan from the player's position, as firings. */
export function deduceSeismicPlan(
  state: SeismicState,
): HintPlanResult<SeismicFiring, number> {
  const board = workingBoard(state);
  const areas = areasOf(board);
  const setup = { cleaned: false };
  return deduceHintPlan<SeismicBoard, SeismicFiring, number>({
    board,
    status: validateGame,
    incomplete: STATUS_UNFINISHED,
    next: (b) => nextFiring(b, areas, setup),
    apply: applyFiring,
    budget: stepBudget("seismic hint plan"),
  });
}

function narratePlace(f: SeismicFiring & { kind: "place" }): string {
  switch (f.why) {
    case "singleton":
      return say.singleton;
    case "naked":
      return say.naked(f.n);
    case "hidden":
      return say.hidden(f.n);
  }
}

export function buildSteps(state: SeismicState): HintStep<SeismicMove, SeismicHint>[] {
  const tectonic = state.mode === MODE_TECTONIC;
  const steps: HintStep<SeismicMove, SeismicHint>[] = [];
  for (const f of deduceSeismicPlan(state).plan) {
    switch (f.kind) {
      case "populate":
        steps.push(populateStep({ type: "pencilAll" }, say.populate));
        break;
      case "clean":
        steps.push(
          obviousCleanStep(
            steps[steps.length - 1] ?? null,
            f.marks,
            say.clean(tectonic),
            seismicCandidateMoves,
          ),
        );
        break;
      case "place": {
        const cell = { x: f.x, y: f.y };
        steps.push({
          move: { type: "set", ...cell, n: f.n, pencil: false },
          explanation: narratePlace(f),
          highlights: { area: f.area, targets: [cell], marks: [] },
        });
        if (f.cull.length > 0) {
          steps.push({
            move: { type: "pencilStrike", marks: f.cull },
            explanation: say.cull(f.n, tectonic),
            highlights: {
              area: [cell],
              targets: f.cull.map(({ x, y }) => ({ x, y })),
              marks: f.cull,
            },
            continuesPrevious: true,
          });
        }
        break;
      }
      case "starve": {
        const marks = f.targets.map((t) => ({ ...t, n: f.n }));
        steps.push({
          move: { type: "pencilStrike", marks },
          explanation: say.starve(f.n, f.targets.length, tectonic),
          highlights: { area: f.area, targets: f.targets, marks },
        });
        break;
      }
    }
  }
  return steps;
}

export function hintKeepTrack(
  m: SeismicMove,
  step: HintStep<SeismicMove, SeismicHint>,
  state: SeismicState,
): HintTrackVerdict {
  return keepCandidateHintTrack(m, step, state.pencil, state.w, seismicCandidateMoves);
}

export function refreshHintStep(
  step: HintStep<SeismicMove, SeismicHint>,
  state: SeismicState,
): HintStep<SeismicMove, SeismicHint> | null {
  return refreshCandidateHintStep(
    step,
    state.grid,
    state.pencil,
    state.w,
    seismicCandidateMoves,
  );
}

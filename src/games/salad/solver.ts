/**
 * Salad's solver — a consumer of the shared Latin framework
 * ([`engine/latin.ts`](../../engine/latin.ts)), per
 * docs/solver-and-generator.md § "The Latin family".
 *
 * **The empty square is a symbol of the cube.** Salad wants "each of `nums`
 * symbols once per line, the other `order − nums` squares empty" — a
 * *pseudo*-Latin square. The cube expresses that directly: its last symbol,
 * {@link holeSymbol} (`nums + 1`), repeats `order − nums` times per line
 * (`LatinRepeats`), so every generic deduction reasons about "the empty square"
 * as a value with a multiplicity — placed when exactly that many cells of a line
 * can still be empty, struck from a line once it holds all its empties, weighed
 * correctly by set elimination, never used as a forcing-chain link. Upstream
 * instead fakes the rule with a *full* order-`o` square whose symbols above
 * `nums` are reinterpreted as holes, and translates between the two views by
 * hand (`latinholes_solver_sync`, `_count`, `_place_cross`, `_place_circle`);
 * the cube makes that layer unnecessary.
 *
 * The player's two markers map onto the cube in one line each: a **cross**
 * (known empty) is the hole symbol *placed*; a **ball** (known to hold a symbol,
 * which one unknown) is the hole symbol *struck*. The `holes` array on a board
 * is the player-facing record of those two facts and is read back off the cube
 * after a solve ({@link markersFromCube}).
 *
 * What stays Salad's own is the ABC End View border deduction
 * ({@link saladLettersSolverDir}).
 *
 * Two difficulties, both **guess-free**: `diffRecursive = DIFF_IMPOSSIBLE`, so
 * the cube never recurses or follows a forcing chain at either tier. Easy
 * (`DIFF_EASY`) is the border
 * deduction plus the generic positional / numeric elimination — which, with the
 * hole a real symbol, now includes "only these `k` squares can be empty" and
 * "this line already has its `k` empties"; Normal (`DIFF_HARD`) adds the
 * generic set elimination.
 */

import type {
  DeductionRecord,
  DeductionRecorder,
} from "../../engine/deduction-record.ts";
import { clueList } from "../../engine/describe-runtime.ts";
import { type EntryBoard, entryMistake } from "../../engine/entry-mistakes.ts";
import {
  compiledRung,
  DIFF_IMPOSSIBLE,
  LATIN_RUNGS,
  type LatinLadder,
  type LatinRepeats,
  type LatinRung,
  LatinSolver,
  type LatinSolverConfig,
  latinSolver,
} from "../../engine/latin.ts";
import * as salad from "./salad.compiled.ts";
import {
  borderScans,
  CIRCLE,
  CROSS,
  DIFF_EASY,
  DIFF_HARD,
  DIFF_HOLESONLY,
  GAMEMODE_LETTERS,
  latinholesCheck,
  type SaladBoard,
  type SaladState,
  saladNotes,
  scratchBoard,
} from "./state.ts";

// --- the hole as a cube symbol ---------------------------------------------

/** The cube's symbol for an empty square: one past the last real symbol. This
 * is also the value a solved working `grid` holds in an empty square, which is
 * why every reader of a solved grid tests `<= nums`. */
function holeSymbol(nums: number): number {
  return nums + 1;
}

/** How the cube is told about the empty squares. With exactly one empty square
 * per line (`nums = order − 1`) the hole is an ordinary once-per-line symbol
 * and needs no declaration. */
function repeatsFor(b: SaladBoard): LatinRepeats | null {
  const times = b.order - b.nums;
  return times >= 2 ? { times } : null;
}

/** Known empty: the hole symbol is *placed* here. */
function isKnownHole(solver: LatinSolver, i: number, hole: number): boolean {
  return solver.grid[i] === hole;
}

/** Known to hold a symbol (a ball, or a placed symbol): the hole is struck. */
function isKnownFilled(
  solver: LatinSolver,
  x: number,
  y: number,
  hole: number,
): boolean {
  return !solver.cubeGet(x, y, hole);
}

/** A cross: the square is empty, so the hole symbol goes here. A cross where
 * the cube has already ruled the hole out is a contradiction; emptying the cell
 * of every candidate is how the cube is told, and `elim` reports it. */
function placeCross(solver: LatinSolver, b: SaladBoard, x: number, y: number): void {
  const hole = holeSymbol(b.nums);
  if (solver.grid[y * b.order + x] !== 0) return;
  if (solver.cubeGet(x, y, hole)) solver.place(x, y, hole);
  else
    for (let n = 1; n <= solver.symbols; n++) solver.cube[solver.cubepos(x, y, n)] = 0;
}

/** A ball: the square holds *some* symbol, so it is not the hole. */
function placeCircle(solver: LatinSolver, b: SaladBoard, x: number, y: number): void {
  solver.cube[solver.cubepos(x, y, holeSymbol(b.nums))] = 0;
}

/** Read the two markers back off a finished cube into `holes`: a placed hole is
 * a cross, a struck hole a ball. `cube` is the solver's final candidate cube
 * (`cubeOut`), laid out with `symbols` values per cell. */
function markersFromCube(b: SaladBoard, grid: Uint8Array, cube: Uint8Array): void {
  const o = b.order;
  const hole = holeSymbol(b.nums);
  const symbols = hole;
  for (let i = 0; i < o * o; i++) {
    const x = i % o;
    const y = (i / o) | 0;
    if (grid[i] === hole) b.holes[i] = CROSS;
    else if (!cube[(x * o + y) * symbols + hole - 1]) b.holes[i] = CIRCLE;
  }
}

// --- the ABC End View border deduction -------------------------------------

/**
 * Why a border-clue elimination is forced — the premise Salad's hint narrates
 * (hint path only; every allocation below is gated on `solver.recorder`, so the
 * generator path builds none of these).
 */
export type BorderReason =
  /** Near the clue: the first square that could hold a symbol must hold the
   * clue's, so every *other* symbol is ruled out of it. `skipped` counts the
   * already-known-empty squares between the clue and this one. */
  | { kind: "borderNear"; clue: number; clueVal: number; skipped: number }
  /** Past the clue's reach: the clue's own symbol cannot sit this far in.
   * `reach` is how many squares from the clue it may still sit (0-based), which
   * starts at `order − nums` (the line's whole hole budget), is reduced by the
   * `tightenedBy` empty squares already marked beyond it, and is cut off
   * outright at `circleAt` if a square in between is known to hold a symbol. */
  | {
      kind: "borderFar";
      clue: number;
      clueVal: number;
      reach: number;
      holes: number;
      tightenedBy: number;
      circleAt: number | null;
    };

/**
 * Upstream `salad_letters_solver_dir`, for one border clue looking inward:
 *
 * - **Near the clue**, until the first square that isn't a known hole, no
 *   symbol *other than* the clue's can appear — whatever the clue sees first
 *   must be the clue.
 * - **Past the clue's reach**, the clue symbol itself can no longer appear. The
 *   reach is `order − nums` squares (the most holes a line can hold), shortened
 *   by every hole already confirmed *beyond* that distance, and cut short
 *   outright by a confirmed ball.
 *
 * "Known hole" and "known ball" are read off the cube — a placed hole symbol, a
 * struck one — where upstream read its marker array.
 */
function saladLettersSolverDir(
  solver: LatinSolver,
  b: SaladBoard,
  si: number,
  di: number,
  ei: number,
  cd: number,
): number {
  const clue = b.borderclues[cd];
  if (!clue) return 0;

  const o = solver.o;
  const nums = b.nums;
  const hole = holeSymbol(nums);
  const rec = solver.recorder;
  let nchanged = 0;

  // The furthest the clue symbol can sit from the clue: one square per hole the
  // line may still contain, minus the holes already confirmed out of range.
  let maxdist = o - nums;
  for (let i = si + di * (o - nums); i !== ei; i += di) {
    if (isKnownHole(solver, i, hole)) maxdist--;
  }

  let dist = 0;
  let found = false;
  let outofrange = false;
  // Hint-only provenance for the far arm: which square (if any) cut the reach
  // short by being known to hold a symbol.
  let circleAt: number | null = null;

  for (let i = si; i !== ei; i += di) {
    const x = i % o;
    const y = (i / o) | 0;

    if (!found) {
      for (let j = 1; j <= nums; j++) {
        if (j === clue) continue;
        const pos = solver.cubepos(x, y, j);
        if (solver.cube[pos]) {
          if (rec) {
            rec({
              kind: "elim",
              x,
              y,
              n: j,
              reason: {
                kind: "borderNear",
                clue: cd,
                clueVal: clue,
                skipped: dist,
              } satisfies BorderReason,
              group: solver.group,
            });
          }
          solver.cube[pos] = 0;
          nchanged++;
        }
      }
    }

    if (!isKnownHole(solver, i, hole)) found = true;

    if (outofrange) {
      const pos = solver.cubepos(x, y, clue);
      if (solver.cube[pos]) {
        if (rec) {
          rec({
            kind: "elim",
            x,
            y,
            n: clue,
            reason: {
              kind: "borderFar",
              clue: cd,
              clueVal: clue,
              reach: maxdist,
              holes: o - nums,
              tightenedBy: o - nums - maxdist,
              circleAt,
            } satisfies BorderReason,
            group: solver.group,
          });
        }
        solver.cube[pos] = 0;
        nchanged++;
      }
    }
    dist++;

    if (isKnownFilled(solver, x, y, hole)) {
      if (!outofrange) circleAt = i;
      outofrange = true;
    } else if (dist > maxdist) {
      outofrange = true;
    }
  }

  return nchanged;
}

/** Upstream `salad_letters_solver`: run the border deduction on all `4·order`
 * clues, in the top / left / bottom / right order the clue array uses. */
function saladLettersSolver(solver: LatinSolver, b: SaladBoard): number {
  let nchanged = 0;
  for (let i = 0; i < solver.o; i++) {
    for (const s of borderScans(i, solver.o)) {
      const n = saladLettersSolverDir(solver, b, s.start, s.step, s.end, s.clue);
      nchanged += n;
      // **Hint path only**: one *clue's* scan is one firing, so stop after the
      // first that fires and let the driver open a new `group`. Without this a
      // hint step would gather strikes from unrelated clues under one clue's
      // narration (docs/hints-candidates.md § "A cell decided without a value in the grid").
      // Gated, so the generator sweeps every clue exactly as upstream does.
      if (n && solver.recorder) return nchanged;
    }
  }
  return nchanged;
}

/** Salad's own rung: the border deduction, in ABC End View mode. Number Ball has
 * nothing of its own left — its balls and crosses are cube facts, and the hole
 * deductions upstream wrote by hand are the cube's generic ones now. */
function saladSolverEasy(solver: LatinSolver, b: SaladBoard): number {
  return b.mode === GAMEMODE_LETTERS ? saladLettersSolver(solver, b) : 0;
}

// --- the driver ------------------------------------------------------------

/** Seed the cube with the fixed grid clues — a symbol placement, or the
 * ball/cross constraints, which place no *real* symbol and so cannot travel
 * through the seeded grid. */
function seedGridClues(solver: LatinSolver, b: SaladBoard): void {
  const o = b.order;
  for (let i = 0; i < o * o; i++) {
    const clue = b.gridclues[i];
    const x = i % o;
    const y = (i / o) | 0;
    if (clue === CROSS) placeCross(solver, b, x, y);
    else if (clue === CIRCLE) placeCircle(solver, b, x, y);
    else if (clue && solver.grid[i] === 0) solver.place(x, y, clue);
  }
}

/** Seed the cube from a board's *confirmed markers* — the hint path's analog
 * of {@link seedGridClues}. A cross or ball is a real entry (Check & Save flags a
 * wrong one), so it is a fact the working cube may assume; the player's *pencil
 * notes* never are (docs/hints-candidates.md § "The recorder and the soundness
 * boundary"). Symbols need no seeding here because they sit in `b.grid`, which
 * `LatinSolver.alloc` places. */
function seedMarkers(solver: LatinSolver, b: SaladBoard): void {
  const o = b.order;
  for (let i = 0; i < o * o; i++) {
    const x = i % o;
    const y = (i / o) | 0;
    if (b.holes[i] === CROSS) placeCross(solver, b, x, y);
    else if (b.holes[i] === CIRCLE) placeCircle(solver, b, x, y);
  }
}

// --- the described ladder ----------------------------------------------------

/** A border slot as the space numbers it (above each column, below each,
 * left of each row, right of each), as Salad's clue array numbers it (top,
 * left, bottom, right). */
function clueOfSlot(slot: number, o: number): number {
  const side = (slot / o) | 0;
  return [0, 2, 1, 3][side] * o + (slot % o);
}

/** A border strike's reason: the clue's own letter struck past its reach,
 * any other letter near the clue. */
function borderReason(
  { k, L, H, reach, stop }: salad.BorderBinding,
  cell: number,
  n: number,
  cl: salad.Dealt,
  o: number,
): BorderReason {
  const clue = clueOfSlot(cl.border.at[k], o);
  const clueVal = cl.border.v[k];
  if (n !== clueVal)
    return { kind: "borderNear", clue, clueVal, skipped: L.indexOf(cell) };
  return {
    kind: "borderFar",
    clue,
    clueVal,
    reach,
    holes: H,
    tightenedBy: H - reach,
    circleAt: stop >= 0 && stop <= reach ? L[stop] : null,
  };
}

const SALAD_LADDER: Record<salad.LadderId, (cl: salad.Dealt) => LatinRung> = {
  border: (cl) =>
    compiledRung(salad.border, cl, (binding, cell, n, solver) =>
      borderReason(binding, cell, n, cl, solver.o),
    ),
  "latin.hiddenSingle": () => LATIN_RUNGS["latin.hiddenSingle"],
  "latin.single": () => LATIN_RUNGS["latin.single"],
  "latin.set": () => (solver) =>
    COMPARE.handSet && solver.repeat
      ? solver.diffSet(false)
      : LATIN_RUNGS["latin.set"](solver),
  "latin.fish": () => (solver) =>
    COMPARE.handFish && solver.repeat
      ? solver.diffSet(true)
      : LATIN_RUNGS["latin.fish"](solver),
  "latin.wing": () => LATIN_RUNGS["latin.wing"],
};

/** The board as its description deals it: the border letters in the order
 * the scan meets them, each line's top, left, bottom and right in turn; the
 * balls, which no technique reads, since a ball is seeded as a strike. */
function describedLadder(b: SaladBoard): LatinLadder {
  const o = b.order;
  const at: number[] = [];
  const v: number[] = [];
  const slots = [0, 2, 1, 3];
  for (let i = 0; i < o; i++)
    for (let side = 0; side < 4; side++) {
      const clue = b.borderclues[side * o + i];
      if (!clue) continue;
      at.push(slots[side] * o + i);
      v.push(clue);
    }
  const balls: number[] = [];
  for (let c = 0; c < o * o; c++) if (b.gridclues[c] === CIRCLE) balls.push(c);
  const cl: salad.Dealt = {
    border: clueList(at, v, 4 * o),
    ball: clueList(
      balls,
      balls.map(() => holeSymbol(b.nums)),
      o * o,
    ),
    nums: b.nums,
  };
  return {
    ladder: salad.ladder.map(({ id, tier }) => ({ tier, run: SALAD_LADDER[id](cl) })),
  };
}

/** The shared config for a solve at `maxdiff` over `b`, seeded by `seed`. */
function configFor(
  b: SaladBoard,
  maxdiff: number,
  seed: (solver: LatinSolver) => void,
  cubeOut: Uint8Array,
): LatinSolverConfig<SaladBoard> {
  return {
    repeats: repeatsFor(b),
    maxdiff,
    ...(COMPARE.handWritten
      ? {
          diffSimple: DIFF_EASY,
          diffSet0: DIFF_HARD,
          diffSet1: DIFF_HARD,
          usersolvers: [saladSolverEasy, null],
        }
      : describedLadder(b)),
    // Never search, by forcing chain or recursion: both tiers are pure
    // deduction (the guess-free policy).
    diffRecursive: DIFF_IMPOSSIBLE,
    // Salad has no whole-grid post-check beyond `latinholesCheck`.
    valid: () => true,
    ctx: b,
    seed,
    cubeOut,
  };
}

// --- the comparison ----------------------------------------------------------

/** The compiled ladder against the hand-written one: with `on`, every solve
 * runs both, the hand-written one on a copy, and tallies where they differ
 * (`research/describe/compare-salad.test.ts`). */
export const COMPARE = {
  on: false,
  /** Whether the solve now running runs the hand-written ladder. */
  handWritten: false,
  /** Whether the compiled ladder's set and its fish run the engine's own
   * multiplicity code where the empty square repeats. */
  handSet: false,
  handFish: false,
  compared: 0,
  mismatches: [] as { what: string[]; theirs: unknown; ours: unknown }[],
  /** The hand-written records compared, by kind. */
  reasons: new Map<string, number>(),
};

interface RunResult {
  ret: number;
  grid: Uint8Array;
  cube: Uint8Array;
  records: DeductionRecord[];
}

/** A record as compared: its group numbered by first appearance, since the
 * two ladders count their attempts differently, and its reason's keys in
 * order. */
function comparable(records: readonly DeductionRecord[]): string[] {
  const groups = new Map<number, number>();
  const sorted = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(sorted)
      : v !== null && typeof v === "object"
        ? Object.fromEntries(
            Object.entries(v)
              .sort(([a], [b]) => (a < b ? -1 : 1))
              .map(([k, x]) => [k, sorted(x)]),
          )
        : v;
  return records.map((r) => {
    if (!groups.has(r.group)) groups.set(r.group, groups.size);
    return JSON.stringify(sorted({ ...r, group: groups.get(r.group) }));
  });
}

function compareRuns(theirs: RunResult, ours: RunResult, where: string): void {
  COMPARE.compared++;
  for (const r of theirs.records) {
    const k = (r.reason as { kind: string }).kind;
    COMPARE.reasons.set(k, (COMPARE.reasons.get(k) ?? 0) + 1);
  }
  const what: string[] = [];
  if (theirs.ret !== ours.ret) what.push("diff");
  if (theirs.grid.join() !== ours.grid.join()) what.push("grid");
  if (theirs.cube.join() !== ours.cube.join()) what.push("cube");
  const a = comparable(theirs.records);
  const b = comparable(ours.records);
  if (a.join("\n") !== b.join("\n")) what.push("records");
  if (what.length === 0) return;
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  const left = (cube: Uint8Array) => cube.reduce((n, x) => n + (x ? 1 : 0), 0);
  COMPARE.mismatches.push({
    what,
    theirs: { where, diff: theirs.ret, left: left(theirs.cube), record: a[i], at: i },
    ours: { diff: ours.ret, left: left(ours.cube), record: b[i], n: b.length },
  });
}

/** `latinSolver` over `b` at `maxdiff`, the compiled ladder; with
 * `COMPARE.on`, the hand-written one too, on a copy, and the two compared. */
function solveSalad(
  grid: Uint8Array,
  b: SaladBoard,
  maxdiff: number,
  seed: (b: SaladBoard, solver: LatinSolver) => void,
  cube: Uint8Array,
  recorder: DeductionRecorder | null,
): number {
  const o = b.order;
  const run = (
    board: SaladBoard,
    g: Uint8Array,
    out: Uint8Array,
    rec: DeductionRecorder | null,
  ): number =>
    latinSolver(g, o, {
      ...configFor(board, maxdiff, (solver) => seed(board, solver), out),
      ...(rec ? { recorder: rec, budgetLabel: "salad hint" } : {}),
    });
  if (!COMPARE.on) return run(b, grid, cube, recorder);
  const theirs: DeductionRecord[] = [];
  const ours: DeductionRecord[] = [];
  const g = grid.slice();
  const c = new Uint8Array(cube.length);
  const copy: SaladBoard = { ...b, grid: g, holes: b.holes.slice() };
  COMPARE.handWritten = true;
  let theirRet: number;
  try {
    theirRet = run(copy, g, c, recorder ? (r) => theirs.push(r) : null);
  } finally {
    COMPARE.handWritten = false;
  }
  const ret = run(
    b,
    grid,
    cube,
    recorder
      ? (r) => {
          ours.push(r);
          recorder(r);
        }
      : null,
  );
  compareRuns(
    { ret: theirRet, grid: g, cube: c, records: theirs },
    { ret, grid, cube, records: ours },
    `${o}n${b.nums}${b.mode === GAMEMODE_LETTERS ? "L" : "B"} cap ${maxdiff}${recorder ? " hint" : ""}`,
  );
  return ret;
}

/** The final candidate cube's size for `b` — `order² × symbols`. */
function cubeSize(b: SaladBoard): number {
  return b.order * b.order * holeSymbol(b.nums);
}

/** What one recording run of the solver saw, from the player's board forward. */
export interface SaladDeductions {
  /** Every candidate cleared / cell placed, in solver order, each carrying the
   * reason that forced it. Values run over `1..nums + 1`: an op with
   * `n === nums + 1` concerns the empty-square symbol, whose player-visible
   * note is the X mark (see `hint.ts` for which of those the plan teaches). */
  ops: DeductionRecord[];
  /** The marker array at the deduction fixpoint: which squares are forced empty
   * ({@link CROSS}) or forced to hold a symbol ({@link CIRCLE}), read back off
   * the cube. */
  holes: Uint8Array;
  /** The grid at the fixpoint, holes as {@link holeSymbol}. */
  grid: Uint8Array;
}

/**
 * Run the solver over a copy of `b` at `maxdiff` with recording on, and report
 * everything it deduced (hint path only). Deductive only — both of Salad's tiers
 * pass `diffRecursive = DIFF_IMPOSSIBLE`, so there is nothing to cap.
 */
export function recordSaladDeductions(b: SaladBoard, maxdiff: number): SaladDeductions {
  const grid = b.grid.slice();
  const holes = b.holes.slice();
  const work: SaladBoard = { ...b, grid, holes };
  const ops: DeductionRecord[] = [];
  const cube = new Uint8Array(cubeSize(b));

  solveSalad(
    grid,
    work,
    maxdiff,
    (board, solver) => seedMarkers(solver, board),
    cube,
    (rec) => ops.push(rec),
  );
  markersFromCube(work, grid, cube);

  return { ops, holes, grid };
}

/**
 * Upstream `salad_solve`: solve `b` in place at difficulty `maxdiff` and report
 * whether the result is a *complete, valid* board. `b.grid` and `b.holes` are
 * written; the caller supplies them blank (the generator) or seeded with the
 * clues (play).
 *
 * `DIFF_HOLESONLY` is the Number Ball generator's quality gate rather than a
 * playable tier: reason about the empty squares alone — where the hole symbol
 * must go and where it cannot — and report whether *every* hole fell out with
 * no number entered. A board that passes never made the player think about a
 * number's position, which is the concept the mode exists for.
 */
export function saladSolve(b: SaladBoard, maxdiff: number): boolean {
  const o = b.order;
  const o2 = o * o;
  const hole = holeSymbol(b.nums);

  if (maxdiff === DIFF_HOLESONLY) {
    const solver = new LatinSolver(o, repeatsFor(b));
    solver.alloc(b.grid);
    seedGridClues(solver, b);
    holesOnlyFixpoint(solver, hole);
    let holes = 0;
    for (let i = 0; i < o2; i++) if (b.grid[i] === hole) holes++;
    return holes === (o - b.nums) * o;
  }

  const cube = new Uint8Array(cubeSize(b));
  solveSalad(
    b.grid,
    b,
    maxdiff,
    (board, solver) => seedGridClues(solver, board),
    cube,
    null,
  );
  markersFromCube(b, b.grid, cube);

  // Upstream discards the difficulty `latin_solver_main` reports and asks only
  // whether the board came out complete and legal — which, with recursion
  // disabled, is exactly "pure deduction finished it", hence unique.
  return latinholesCheck(b);
}

/**
 * The hole-only deductions to a fixpoint: a line with exactly its quota of
 * possible empties has them all (positional elimination on the hole symbol,
 * whose placement strikes the line once full), and a square that can hold
 * nothing *but* the hole is empty. Never places a real symbol — that is the
 * whole point of the gate.
 */
function holesOnlyFixpoint(solver: LatinSolver, hole: number): void {
  const o = solver.o;
  const s = solver.symbols;
  for (;;) {
    let changed = 0;
    for (let y = 0; y < o; y++) {
      if (solver.row[y * s + hole - 1] < solver.times) {
        if (solver.elim(solver.cubepos(0, y, hole), o * s) > 0) changed++;
      }
    }
    for (let x = 0; x < o; x++) {
      if (solver.col[x * s + hole - 1] < solver.times) {
        if (solver.elim(solver.cubepos(x, 0, hole), s) > 0) changed++;
      }
    }
    for (let i = 0; i < o * o; i++) {
      if (solver.grid[i] !== 0) continue;
      const x = i % o;
      const y = (i / o) | 0;
      let real = 0;
      for (let n = 1; n < hole; n++) if (solver.cubeGet(x, y, n)) real++;
      if (real === 0 && solver.cubeGet(x, y, hole)) {
        solver.place(x, y, hole);
        changed++;
      }
    }
    if (!changed) return;
  }
}

// --- Check & Save ----------------------------------------------------------

/** A player marking that contradicts the unique solution. All four render as
 * the same red overlay; the kinds exist so tests (and any future hint) can say
 * *what* is wrong. */
export interface SaladMistake {
  kind: "cell" | "cross" | "circle" | "note";
  x: number;
  y: number;
}

/**
 * The solved board as one entry per cell (a symbol `1..nums`, or 0 for a hole)
 * — what `Game.solve` turns into a `solve` move. `null` when no solution is
 * deducible.
 *
 * Solved at the top tier: Salad's Normal rung only *adds* sound generic
 * techniques to Easy's, so an Easy board still solves here (pinned by the
 * "generate low, solve high" check, docs/solver-and-generator.md
 * § "Solver-gated generation").
 */
export function saladSolution(s: SaladState): number[] | null {
  const board = scratchBoard(s);
  if (!saladSolve(board, DIFF_HARD)) return null;
  const cells: number[] = [];
  for (let i = 0; i < s.order * s.order; i++) {
    cells.push(board.grid[i] <= s.nums ? board.grid[i] : 0);
  }
  return cells;
}

/**
 * Re-solve from the fixed clues alone and flag every player marking the unique
 * solution contradicts (docs/solver-and-generator.md § "The solvable-game
 * contract"): a wrong symbol, a cross on a square that holds one, a circle on a
 * square that must stay empty, and — notes being first-class markings — an
 * empty square whose non-empty notes have crossed out its solution value.
 * Returns `[]` when the board is not uniquely deducible, so Check & Save neither
 * blesses nor blocks what it cannot judge.
 */
export function findMistakes(s: SaladState): SaladMistake[] {
  const o = s.order;
  const nums = s.nums;
  const sol = saladSolution(s);
  if (!sol) return [];

  // The "might be empty" mark is the note value just past the symbols, so a
  // hole's answer reads as that value — which no placed symbol can equal.
  const board: EntryBoard = {
    answer: sol.map((v) => (v === 0 ? nums + 1 : v)),
    entry: s.grid,
    notes: s.pencil,
    enc: saladNotes(nums),
  };
  const out: SaladMistake[] = [];
  for (let i = 0; i < o * o; i++) {
    const clue = s.gridclues[i];
    // A fixed symbol or cross is by definition correct; a fixed *circle* still
    // leaves the square's symbol up to the player.
    if (clue && clue !== CIRCLE) continue;

    const x = i % o;
    const y = (i / o) | 0;
    if (s.grid[i] === 0) {
      if (s.holes[i] === CROSS) {
        if (sol[i] !== 0) out.push({ kind: "cross", x, y });
        continue;
      }
      if (s.holes[i] === CIRCLE && sol[i] === 0) {
        out.push({ kind: "circle", x, y });
        continue;
      }
    }
    const kind = entryMistake(board, i);
    if (kind) out.push({ kind, x, y });
  }
  return out;
}

/**
 * Filling's solver: the ladder `filling.description.yaml` states, compiled,
 * on the engine's marks and runner (`engine/ladder-runtime.ts`), and the
 * search beneath the ladder.
 *
 * A region is the squares side by side that hold one number. The ladder is
 * Easy: a region grows where it must (`mustGrow`, `onlyWay`), a number is
 * ruled out of a square where it would make a region too big (`tooBig`) or
 * could not make one big enough (`noRoom`), and a square with one number
 * left takes it (`onlyNumber`). Both rulings out read only the numbers on
 * the board, so the square a hint fills by them is one the player can check
 * by looking. Beneath the ladder, a search by trial and error
 * ({@link searchAnswers}) counts a board's answers to two: it serves the Solve
 * command and `findMistakes`, and deals the Unreasonable tier. An Easy board
 * is one the ladder finishes.
 *
 * A hint walks the same ladder, one firing at a time ({@link deduceHintPlan}).
 */
import {
  type Answer,
  answerCache,
  type Deduced,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import type { DeductionRecord } from "../../engine/deduction-record.ts";
import { popcount, rangeMask } from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  describedLadder,
  type Ladder,
  ladderTechniques,
  ladderWalk,
  runLadder,
  type Taken,
  TIERS,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import * as filling from "./filling.compiled.ts";
import { dealtOf, spaceOf } from "./state.ts";

/** Why a *set* of cells is forced — drives the hint's narration. A single
 * deduction usually forces several squares at once, so a hint step carries a
 * group of cells sharing one reason (the cross-game "one firing = one journey"
 * bar), not a lone cell.
 * - `growth`: a region cannot reach its size without these empty squares (they
 *   are on every completion). `exact` ⇒ they *complete* the region.
 * - `blocked`: a region with one empty square beside it that it can grow into
 *   — always a single cell.
 * - `lonely`: every neighbor is filled and no neighboring region can grow to
 *   include this square, so it is a region of one — a 1.
 * - `bitmap`: every number but one is ruled out here; the local eliminators
 *   are the filled orthogonal neighbors. */
export type FillingHintReason =
  | { kind: "growth"; n: number; exact: boolean }
  | { kind: "blocked"; n: number }
  | { kind: "lonely" }
  | { kind: "bitmap"; n: number };

/** The rungs a hint step can be: the reasons' kinds. */
export const FILLING_RUNGS = ["growth", "blocked", "lonely", "bitmap"] as const;
export type FillingRung = (typeof FILLING_RUNGS)[number];

/** One step of a hint plan: a set of cells forced to the same value, the
 * evidence cells to shade (the region the deduction reasons about, or the
 * neighbors that pin a lonely / eliminated cell), and the reason. */
export interface FillingHintMove {
  cells: number[];
  value: number;
  area: number[];
  reason: FillingHintReason;
}

/** What a firing records: the reason a hint step narrates and the squares it
 * shades, or for a number ruled out of a square, which no step shows, `null`
 * and the square. */
interface Recorded {
  reason: FillingHintReason | null;
  area: number[];
}

/** The filled neighbors of square `c`: what pins a square's one number. */
function filledNeighbors(m: CellMarks, c: number): number[] {
  return m.sp.adj4[c].filter((y) => m.known(y));
}

/** The ladder, each technique with the reason its firings record, built from
 * the binding on the marks before the firing. It reads no clue, the numbers
 * given being placed on the marks, so one serves every board. */
function fillingLadder(): Ladder {
  return describedLadder(filling, {
    mustGrow: uncluedRung(
      filling.mustGrow,
      ({ A, d, Y }: filling.MustGrowBinding): Recorded => ({
        reason: { kind: "growth", n: d, exact: Y.length === d - A.length },
        area: [...A],
      }),
    ),
    onlyWay: uncluedRung(
      filling.onlyWay,
      ({ A, d }: filling.OnlyWayBinding): Recorded => ({
        reason: { kind: "blocked", n: d },
        area: [...A],
      }),
    ),
    tooBig: uncluedRung(
      filling.tooBig,
      ({ c }: filling.TooBigBinding): Recorded => ({ reason: null, area: [c] }),
    ),
    noRoom: uncluedRung(
      filling.noRoom,
      ({ c }: filling.NoRoomBinding): Recorded => ({ reason: null, area: [c] }),
    ),
    tooFar: uncluedRung(
      filling.tooFar,
      ({ c }: filling.TooFarBinding): Recorded => ({ reason: null, area: [c] }),
    ),
    onlyNumber: uncluedRung(
      filling.onlyNumber,
      ({ c }: filling.OnlyNumberBinding, _at, n, m): Recorded => {
        const evidence = filledNeighbors(m, c);
        const lonely = n === 1 && evidence.length === m.sp.adj4[c].length;
        return {
          reason: lonely ? { kind: "lonely" } : { kind: "bitmap", n },
          area: evidence,
        };
      },
    ),
  });
}

const LADDER = fillingLadder();

/** The working state of a deduction: the marks, the board they deal, and
 * whether the numbers on it already break the domain. */
interface Deduction {
  m: CellMarks;
  dl: filling.Dealt;
  impossible: boolean;
}

/** The marks over `board`, each number on it placed. */
function deduction(
  board: ArrayLike<number>,
  clues: ArrayLike<number>,
  w: number,
  h: number,
): Deduction {
  const sp = spaceOf(w, h);
  const dl = dealtOf(clues, w, h);
  const grid = Uint8Array.from(board);
  const m = new CellMarks(sp, rangeMask(1, dl.largest), grid);
  // A number past the largest a square may hold is no value of the domain:
  // the seeding refuses it, and the board has no answer.
  return { m, dl, impossible: !m.seed(grid) };
}

/** Where the ladder left the marks, it having found nothing inconsistent:
 * solved where every square is filled and the rules hold, inconsistent where
 * every square is filled and they do not. */
function verdictOf({ m, dl }: Deduction): Deduced {
  if (m.grid.includes(0)) return "stuck";
  return filling.isAnswer(m.grid, m.sp, dl) ? "solved" : "contradiction";
}

/** Run the ladder on `d` to a fixpoint and say what it reached. */
function deduce(d: Deduction): Deduced {
  const { m } = d;
  if (d.impossible) return "contradiction";
  const impossible = runLadder(
    m,
    ladderTechniques(m, LADDER.entries, { [TIERS]: 0 }, {}),
  );
  return impossible ? "contradiction" : verdictOf(d);
}

/** Solve from `orig` to fixpoint. `solved` is true iff the ladder filled every
 * cell with an answer; `board` is the (possibly partial) deduced grid. */
export function solveFilling(
  orig: ArrayLike<number>,
  w: number,
  h: number,
): { solved: boolean; board: Int32Array } {
  const d = deduction(orig, orig, w, h);
  const solved = deduce(d) === "solved";
  return { solved, board: Int32Array.from(d.m.grid) };
}

// --- the search for a board's answers ---------------------------------------

/** What a search established about a clue set's answers; the one answer is
 * the full grid. */
export type FillingAnswer = Answer<Int32Array>;

/**
 * The positions a search may try before it gives up, each one a number
 * assumed in a square and the ladder run from it.
 *
 * It decides which Unreasonable boards exist: a clue set that needs more is
 * thrown away when dealing and refused when pasted. Lowering it refuses boards
 * already dealt, which are in saved games. A dealt board needs 30 at most,
 * the generator's own bound, so the rest is room for a pasted one. Measured
 * 2026-10-10, running it out on a board with half its clues gone takes 0.1 s
 * at 7×9, 0.3 s at 13×17 and 1.9 s at 20×20.
 */
const SEARCH_BUDGET = 2_000;

/**
 * Count a clue set's answers up to two, by trial and error over the ladder:
 * where it stops, take the empty square with the fewest numbers left and
 * assume each in turn.
 */
export function searchAnswers(
  clues: ArrayLike<number>,
  w: number,
  h: number,
  budget: number = SEARCH_BUDGET,
): FillingAnswer {
  return searchBoard<Deduction, Int32Array>({
    start: deduction(clues, clues, w, h),
    deduce,
    assume: assumeNumbers,
    solution: (d) => Int32Array.from(d.m.grid),
    budget,
  });
}

/** The positions a stuck one divides into: its empty square with the fewest
 * numbers left, the first such in reading order, holding each of them. */
function assumeNumbers(d: Deduction): Deduction[] {
  const { m } = d;
  let at = -1;
  let fewest = Number.POSITIVE_INFINITY;
  for (let c = 0; c < m.grid.length; c++) {
    if (m.grid[c] !== 0) continue;
    const left = popcount(m.cands[c]);
    if (left < fewest) {
      fewest = left;
      at = c;
    }
  }
  if (at < 0) return [];
  const out: Deduction[] = [];
  for (let n = 1; n <= d.dl.largest; n++) {
    if (!m.has(at, n)) continue;
    const assumed = new CellMarks(m.sp, m.domain, m.grid.slice());
    assumed.cands.set(m.cands);
    assumed.place(at, n);
    out.push({ ...d, m: assumed });
  }
  return out;
}

/** Keyed on a state's clues, which every state of a game shares. */
const answers = answerCache<Uint8Array, Int32Array>();

/** What a search of a state's clues established about their answers. The
 * player's numbers are not read. */
export function answerOf(state: {
  clues: Uint8Array;
  w: number;
  h: number;
}): FillingAnswer {
  return answers(state.clues, () => searchAnswers(state.clues, state.w, state.h));
}

// --- the hint's walk ---------------------------------------------------------

/**
 * Deduce a hint plan from `board`, the player's current numbers with the
 * clues among them: the ladder's firings, one at a time, each the one that
 * carries on from the squares the plan last read and filled (`ladderWalk`),
 * so the plan grows the region it is working on before it moves on. A firing
 * that only rules a number out of a square is no step: the square's one
 * number is, with the neighbors that pin it. Each technique reads more the
 * more of the answer is filled in, so a board the ladder finishes from its
 * clues it finishes from every correct position.
 */
export function deduceHintPlan(
  board: ArrayLike<number>,
  w: number,
  h: number,
): FillingHintMove[] {
  const { m, impossible } = deduction(board, board, w, h);
  if (impossible) return [];
  const plan: FillingHintMove[] = [];
  let group = -1;
  m.recorder = (rec: DeductionRecord) => {
    const { reason, area } = rec.reason as Recorded;
    if (rec.kind !== "place" || reason === null) return;
    const cell = rec.y * w + rec.x;
    const last = plan.at(-1);
    if (last !== undefined && rec.group === group) {
      last.cells.push(cell);
      return;
    }
    group = rec.group;
    plan.push({ cells: [cell], value: rec.n, area, reason });
  };
  m.budget = stepBudget("filling hint");
  // The squares a firing reads and fills: a player follows a region as it
  // grows.
  const reads = ({ facts, reasons }: Taken): number[] => {
    const own: number[] = [];
    for (let i = 0; i < facts.length; i += 3) own.push(facts[i + 1]);
    return [...(reasons[0] as Recorded).area, ...own];
  };
  const walk = ladderWalk(m, LADDER.entries, { [TIERS]: 0 }, reads);
  for (let f = walk.next(); f !== null && f !== "contradiction"; f = walk.next());
  for (const step of plan) {
    const filled = new Set(step.cells);
    step.area = step.area.filter((c) => !filled.has(c));
  }
  return plan;
}

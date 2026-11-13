/**
 * Dominosa's solver: the ladder `dominosa.description.yaml` states,
 * compiled, on the engine's marks and runner (`engine/ladder-runtime.ts`),
 * the answer check its rules compile to, and the search beneath the ladder.
 *
 * The answer is on the spots, the edges between squares side by side, each
 * covered by one domino or by none. The ladder is upstream's deductions up
 * to its Hard tier, here Tricky, and its set reading with doubles at
 * Unreasonable. Beneath it, a search by trial and error ({@link answerOf})
 * counts a board's answers to two: it serves the Solve command and
 * `findMistakes`, and deals the Unreasonable tier, where upstream's forcing
 * chains dealt it. A board of a tier below is one the ladder finishes at
 * that tier and not below it.
 *
 * A hint walks the same ladder, one firing at a time ({@link dominosaWalk}).
 */

import {
  type Answer,
  answerCache,
  type Deduced,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import { type GridSpace, rangeMask } from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  placingRung,
  runLadder,
  TIERS,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import * as dominosa from "./dominosa.compiled.ts";
import {
  DIFF_BASIC,
  DIFF_EXTREME,
  DIFF_HARD,
  DOMINO,
  type DominosaShape,
  dealtOf,
  NONE,
  spaceOf,
} from "./state.ts";

/** What each technique says, as the hint's sentences read it. */
export type DominosaSays = dominosa.SaysById;

/** The two squares spot `e` joins, lower first. */
export function endsOf(sp: GridSpace, e: number): [number, number] {
  return [sp.edgeEnds[2 * e], sp.edgeEnds[2 * e + 1]];
}

/** The ladder over the dealt numbers. */
function dominosaLadder(dl: dominosa.Dealt): Ladder {
  return describedLadder(dominosa, {
    placed: placingRung(dominosa.placed, dl),
    onlySpot: compiledRung(dominosa.onlySpot, dl),
    squareOnly: uncluedRung(dominosa.squareOnly),
    squareSingleDomino: compiledRung(dominosa.squareSingleDomino, dl),
    mustOverlap: compiledRung(dominosa.mustOverlap, dl),
    localDuplicate: compiledRung(dominosa.localDuplicate, dl),
    localDuplicate2: compiledRung(dominosa.localDuplicate2, dl),
    parity: uncluedRung(dominosa.parity),
    set: compiledRung(dominosa.set, dl),
    setDoubles: compiledRung(dominosa.setDoubles, dl),
  });
}

/** The working state of a deduction: the marks on the spots, and the ladder
 * over the board's numbers. */
interface Deduction {
  m: CellMarks;
  ladder: Ladder;
  dl: dominosa.Dealt;
}

/** The marks with every domino of `partner` placed, and every spot
 * undecided where no `partner` is given. False where two of them clash. */
function deduction(
  shape: DominosaShape,
  numbers: ArrayLike<number>,
  partner: ArrayLike<number> | null = null,
): Deduction | null {
  const sp = spaceOf(shape);
  const dl = dealtOf(shape, numbers);
  const ladder = dominosaLadder(dl);
  const grid = new Uint8Array(sp.edges.length);
  if (partner)
    for (const e of sp.edges) {
      const [a, b] = endsOf(sp, e);
      if (partner[a] === b) grid[e] = DOMINO;
    }
  const m = new CellMarks(sp, rangeMask(DOMINO, NONE), grid, null, "edge");
  m.placing = ladder.placing;
  if (!m.seed(grid)) return null;
  return { m, ladder, dl };
}

/** A copy of `d` that shares no marks with it, for a search to assume on. */
function copied(d: Deduction): Deduction {
  const m = new CellMarks(d.m.sp, d.m.domain, d.m.grid.slice(), null, "edge");
  m.placing = d.ladder.placing;
  m.cands.set(d.m.cands);
  return { ...d, m };
}

/** A key naming the domino two numbers make, whichever way round. */
const dominoKey = (a: number, b: number): number =>
  a <= b ? b * (b + 1) + a : a * (a + 1) + b;

/**
 * Where the ladder left the marks, it having found nothing inconsistent:
 * `"solved"` where every square is covered and the rules hold. Under a wrong
 * assumption the ladder may stop on marks no answer extends without a rung
 * saying so, and this says so where it sees it at once: a square with no
 * spot left or covered twice, or a domino placed twice or with no spot left.
 */
function verdictOf(d: Deduction): Deduced {
  const { m, dl } = d;
  const { sp } = m;
  const nums = dl.number.v;
  const left = new Map<number, number>();
  const placed = new Map<number, number>();
  for (const e of sp.edges) {
    const [a, b] = endsOf(sp, e);
    const key = dominoKey(nums[a], nums[b]);
    if (!left.has(key)) left.set(key, 0);
    if (m.grid[e] === NONE) continue;
    left.set(key, (left.get(key) ?? 0) + 1);
    if (m.grid[e] === DOMINO) placed.set(key, (placed.get(key) ?? 0) + 1);
  }
  for (const count of left.values()) if (count === 0) return "contradiction";
  for (const count of placed.values()) if (count > 1) return "contradiction";
  let covered = 0;
  for (const c of sp.cells) {
    let open = 0;
    let dominoes = 0;
    for (const y of sp.adj4[c]) {
      const v = m.grid[sp.edgeOf(c, y)];
      if (v !== NONE) open++;
      if (v === DOMINO) dominoes++;
    }
    if (open === 0 || dominoes > 1) return "contradiction";
    if (dominoes === 1) covered++;
  }
  if (covered < sp.cells.length) return "stuck";
  const g = Uint8Array.from(m.grid, (v) => (v === DOMINO ? DOMINO : NONE));
  return dominosa.isAnswer(g, sp, dl) ? "solved" : "contradiction";
}

/**
 * Run the ladder on `d` no harder than `cap`, below Unreasonable's search,
 * and say what it reached. `grades` takes the hardest tier a firing used.
 */
function deduce(
  d: Deduction,
  cap: number,
  grades: Record<string, number> = {},
): Deduced {
  const { m, ladder } = d;
  const techniques = ladderTechniques(m, ladder.entries, { [TIERS]: cap }, grades);
  return runLadder(m, techniques) ? "contradiction" : verdictOf(d);
}

/** The spots of the answer the marks hold, as square pairs, lower first. */
function pairsOf(m: CellMarks): Array<[number, number]> {
  return m.sp.edges.filter((e) => m.grid[e] === DOMINO).map((e) => endsOf(m.sp, e));
}

// --- the search for a board's answers ---------------------------------------

/** What a search established about a board's answers; the one answer is its
 * dominoes, each a pair of squares. */
export type DominosaAnswer = Answer<Array<[number, number]>>;

/**
 * The positions a search may try before it gives up, each one a domino
 * assumed and the ladder run from it. It decides which Unreasonable boards
 * exist: a board that needs more is thrown away when dealing and refused
 * when pasted, so lowering it refuses boards already dealt.
 */
const SEARCH_BUDGET = 2_000;

/** The positions a stuck one divides into: a domino on each spot left round
 * the square with the fewest, each spot a position. */
function assumeDomino(d: Deduction): Deduction[] {
  const { m } = d;
  const { sp } = m;
  let at = -1;
  let fewest = 5;
  for (const c of sp.cells) {
    let open = 0;
    let covered = false;
    for (const y of sp.adj4[c]) {
      const v = m.grid[sp.edgeOf(c, y)];
      if (v === DOMINO) covered = true;
      if (v !== NONE) open++;
    }
    if (!covered && open < fewest) {
      fewest = open;
      at = c;
    }
  }
  if (at < 0) return [];
  return sp.adj4[at]
    .map((y) => sp.edgeOf(at, y))
    .filter((e) => m.grid[e] === 0)
    .map((e) => {
      const next = copied(d);
      next.m.place(e, DOMINO);
      return next;
    });
}

/** Count a board's answers up to two, by trial and error over the whole
 * ladder. */
function searchAnswers(
  shape: DominosaShape,
  numbers: ArrayLike<number>,
  budget: number = SEARCH_BUDGET,
): DominosaAnswer {
  const start = deduction(shape, numbers);
  if (start === null) return { kind: "none" };
  return searchBoard<Deduction, Array<[number, number]>>({
    start,
    deduce: (d) => deduce(d, DIFF_EXTREME),
    assume: assumeDomino,
    solution: (d) => pairsOf(d.m),
    budget,
  });
}

/** Keyed on a state's numbers, which every state of a game shares. */
const answers = answerCache<Int32Array, Array<[number, number]>>();

/** What a search of a board's numbers established about its answers. The
 * player's dominoes are not read. */
export function answerOf(state: {
  params: DominosaShape;
  numbers: Int32Array;
}): DominosaAnswer {
  return answers(state.numbers, () => searchAnswers(state.params, state.numbers));
}

/**
 * Solve a board from its numbers alone, no harder than `maxDiff`: below
 * Unreasonable by the ladder capped there, and at it by the search. `result`
 * is 0 where it has no answer, 1 where it has one this finds, and 2 where it
 * has several or the ladder stops short; `maxDiffUsed` is the hardest tier a
 * firing used, or Unreasonable where the ladder below it stops short of the
 * one answer.
 */
export function solveNumbers(
  shape: DominosaShape,
  numbers: ArrayLike<number>,
  maxDiff: number,
  budget: number = SEARCH_BUDGET,
): { result: number; maxDiffUsed: number; pairs: Array<[number, number]> } {
  const d = deduction(shape, numbers);
  if (d === null) return { result: 0, maxDiffUsed: 0, pairs: [] };
  const grades: Record<string, number> = {};
  const got = deduce(d, Math.min(maxDiff, DIFF_HARD), grades);
  const used = grades[TIERS] ?? 0;
  if (got === "solved") return { result: 1, maxDiffUsed: used, pairs: pairsOf(d.m) };
  if (got === "contradiction" || maxDiff < DIFF_EXTREME)
    return { result: got === "contradiction" ? 0 : 2, maxDiffUsed: used, pairs: [] };
  const answer = searchAnswers(shape, numbers, budget);
  if (answer.kind === "none")
    return { result: 0, maxDiffUsed: DIFF_EXTREME, pairs: [] };
  if (answer.kind !== "one") return { result: 2, maxDiffUsed: DIFF_EXTREME, pairs: [] };
  return { result: 1, maxDiffUsed: DIFF_EXTREME, pairs: answer.solution };
}

/** Whether some domino has one spot left or none: a toehold the tiers above
 * Normal are dealt without. */
function leavesToehold(d: Deduction): boolean {
  const { m, dl } = d;
  const nums = dl.number.v;
  const left = new Map<number, number>();
  for (const e of m.sp.edges) {
    const [a, b] = endsOf(m.sp, e);
    const key = dominoKey(nums[a], nums[b]);
    left.set(key, (left.get(key) ?? 0) + (m.grid[e] === NONE ? 0 : 1));
  }
  for (const count of left.values()) if (count <= 1) return true;
  return false;
}

/**
 * Whether a board is one the deal keeps at tier `diff`. Below Tricky, the
 * ladder capped there finishes it and needs that tier; above, the Normal
 * ladder stops on it with no toehold, and from there Tricky finishes it, or
 * at Unreasonable stops short and the search, held to `budget`, finds one
 * answer. The ladder at Tricky carries on from the Normal ladder's marks.
 */
export function dealsAt(
  shape: DominosaShape,
  numbers: ArrayLike<number>,
  diff: number,
  budget: number,
): boolean {
  const d = deduction(shape, numbers);
  if (d === null) return false;
  if (diff < DIFF_HARD) {
    const grades: Record<string, number> = {};
    return deduce(d, diff, grades) === "solved" && (grades[TIERS] ?? 0) === diff;
  }
  if (deduce(d, DIFF_BASIC) !== "stuck" || leavesToehold(d)) return false;
  const got = deduce(d, DIFF_HARD);
  if (diff === DIFF_HARD) return got === "solved";
  return got === "stuck" && searchAnswers(shape, numbers, budget).kind === "one";
}

// --- the hint's walk ---------------------------------------------------------

/** What the hint's steps need of the board besides what a firing says: its
 * space, and the spots whose barrier a plan has already shown or the player
 * has drawn (a plan is walked once with one context). */
export interface DominosaWalkContext {
  sp: GridSpace;
  seen: Set<string>;
}

/**
 * The marks over the player's dominoes and the ladder, for the engine's walk
 * to take a firing at a time (`engine/described-edge-hint.ts`). The player's
 * lines between squares are not read: a wrong one must not mislead the hint,
 * which works each out again. Null where the player's dominoes clash.
 */
export function dominosaWalk(
  shape: DominosaShape,
  numbers: ArrayLike<number>,
  partner: ArrayLike<number>,
): { marks: CellMarks; entries: Ladder["entries"]; ctx: DominosaWalkContext } | null {
  const d = deduction(shape, numbers, partner);
  if (d === null) return null;
  return {
    marks: d.m,
    entries: d.ladder.entries,
    ctx: { sp: d.m.sp, seen: new Set() },
  };
}

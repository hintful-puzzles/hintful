/**
 * Signpost's solver: the ladder `signpost.description.yaml` states, compiled,
 * on the engine's marks and runner (`engine/ladder-runtime.ts`), the answer
 * check its rules compile to, and the search beneath the ladder.
 *
 * The marks hold each square's link as the description reads it: 1 for the
 * last square, which links to none, and `d` for a link to the square `d - 1`
 * along the square's arrow. The ladder is Easy, its two techniques the forced
 * links: an arrow only one square can follow, and a square only one arrow can
 * lead into. An Easy board is one they finish, which is what the generator
 * keeps at that tier. An Unreasonable board is one the search at the foot of
 * this file proves has a single answer that the ladder stops short of.
 */

import {
  type Answer,
  answerCache,
  searchAnswers as searchBoard,
} from "../../engine/answer-search.ts";
import {
  clueList,
  compass,
  describedSpace,
  type GridSpace,
  rangeMask,
} from "../../engine/describe-runtime.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS,
} from "../../engine/ladder-runtime.ts";
import * as signpost from "./signpost.compiled.ts";
import {
  cloneState,
  FLAG_IMMUTABLE,
  isValidMove,
  makeLink,
  type SignpostState,
  stripNums,
  updateNumbers,
} from "./state.ts";

/** What the description reads a square as holding where it links to none:
 * the last square. */
const LAST = 1;

/** Why a square cannot be the other end of a link. */
export type Rival = "taken" | "chain" | "number";

/** The rungs a step can be: the description's techniques, in its order. */
export type SignpostRung = signpost.LadderId;

/** One forced link, from `from`'s arrow into `to`, and what it rests on. */
export interface SignpostFiring {
  kind: SignpostRung;
  from: number;
  to: number;
  /** The squares `from`'s arrow points at, in order (`onlyNext`). */
  line: number[];
  /** The other squares whose arrows point at `to` (`onlyBefore`). */
  others: number[];
  /** Why the rivals are ruled out: each reason at least one of them has. */
  why: Rival[];
}

// --- the board as the description reads it -----------------------------------

/** The last board size's space, which every solve reads again. */
let lastSpace: GridSpace | null = null;
function spaceOf(w: number, h: number): GridSpace {
  if (lastSpace?.w !== w || lastSpace.h !== h)
    lastSpace = describedSpace(signpost.units, w, h);
  return lastSpace;
}

/** The board as the description deals it: every square's arrow, numbered
 * from 1, and the given numbers. */
function dealtOf(s: SignpostState): signpost.Dealt {
  const all = Array.from({ length: s.n }, (_, i) => i);
  const given = all.filter((i) => s.flags[i] & FLAG_IMMUTABLE);
  return {
    arrow: clueList(
      all,
      all.map((i) => s.dirs[i] + 1),
      s.n,
    ),
    number: clueList(
      given,
      given.map((i) => s.nums[i]),
      s.n,
    ),
  };
}

/** How many squares from `i` to `j` along a line. */
const distance = (s: SignpostState, i: number, j: number): number =>
  Math.max(
    Math.abs((i % s.w) - (j % s.w)),
    Math.abs(Math.floor(i / s.w) - Math.floor(j / s.w)),
  );

/** The value the description reads in square `i` linking to `to`. */
export const linkValue = (s: SignpostState, i: number, to: number): number =>
  distance(s, i, to) + 1;

/** The value the description reads in each square: its link, the last
 * square's own, or none where it links to none yet. */
function valuesOf(s: SignpostState): Uint8Array {
  return Uint8Array.from(s.next, (to, i) =>
    to >= 0
      ? linkValue(s, i, to)
      : s.flags[i] & FLAG_IMMUTABLE && s.nums[i] === s.n
        ? LAST
        : 0,
  );
}

/** The square `i`'s value `d` links it to, -1 for none. */
export const linkOf = (s: SignpostState, i: number, d: number): number =>
  compass(spaceOf(s.w, s.h), i, s.dirs[i] + 1, d - 1);

/** The squares `i`'s arrow points at, nearest first. */
function arrowLine(s: SignpostState, i: number): number[] {
  const out: number[] = [];
  for (let at = linkOf(s, i, 2), k = 2; at >= 0; at = linkOf(s, i, ++k)) out.push(at);
  return out;
}

/** The squares whose arrows point at `j`. */
const aimsAt = (s: SignpostState, j: number): number[] =>
  Array.from({ length: s.n }, (_, i) => i).filter((i) => arrowLine(s, i).includes(j));

/**
 * Why `from`, which links to none yet, may not link into `to` on the marks:
 * `to`'s links lead round to `from`, it already has a square before it, or
 * the numbers forbid it, which is what the description's `may` leaves when
 * the other two do not hold. The second is named before the third where both
 * hold, since the board draws it. `next` is each square's link.
 */
function rivalOf(next: Int32Array, from: number, to: number): Rival {
  for (let at = to, steps = 0; at >= 0 && steps <= next.length; at = next[at], steps++)
    if (at === from) return "chain";
  return next.includes(to) ? "taken" : "number";
}

/** The distinct reasons in `rivals`, in a fixed order. */
const reasons = (rivals: readonly Rival[]): Rival[] =>
  (["taken", "chain", "number"] as const).filter((r) => rivals.includes(r));

/** A firing's link and the reasons its rivals are ruled out, read off the
 * marks' `grid` as it stood before the firing. */
export function firingOf(
  kind: SignpostRung,
  s: SignpostState,
  grid: ArrayLike<number>,
  from: number,
  to: number,
): SignpostFiring {
  const m = { grid };
  const next = Int32Array.from(grid, (d, i) => (d > LAST ? linkOf(s, i, d) : -1));
  if (kind === "onlyNext") {
    const line = arrowLine(s, from);
    return {
      kind,
      from,
      to,
      line,
      others: [],
      why: reasons(line.filter((j) => j !== to).map((j) => rivalOf(next, from, j))),
    };
  }
  // The last square's arrow points nowhere, as the board draws it.
  const others = aimsAt(s, to).filter((i) => i !== from && m.grid[i] !== LAST);
  return {
    kind,
    from,
    to,
    line: [],
    others,
    // A square already leading somewhere has the one link it may make.
    why: reasons(others.map((i) => (m.grid[i] !== 0 ? "taken" : rivalOf(next, i, to)))),
  };
}

/** The ladder over the dealt board. */
function signpostLadder(dl: signpost.Dealt): Ladder {
  return describedLadder(signpost, {
    onlyNext: compiledRung(signpost.onlyNext, dl),
    onlyBefore: compiledRung(signpost.onlyBefore, dl),
  });
}

/** The marks over a board's links and the ladder over its arrows and
 * numbers, or `null` where a link is one no square may hold. */
export function deduction(
  s: SignpostState,
): { m: CellMarks; ladder: Ladder; dl: signpost.Dealt } | null {
  const sp = spaceOf(s.w, s.h);
  const dl = dealtOf(s);
  // A link is at most the longer side less one, and the last square's 1.
  const m = new CellMarks(sp, rangeMask(1, Math.max(s.w, s.h)), valuesOf(s));
  if (!m.seed(m.grid, (c) => signpost.domainOf(sp, dl, c))) return null;
  return { m, ladder: signpostLadder(dl), dl };
}

/** Whether a board's links are its answer, by the description's rules. */
export function isAnswer(s: SignpostState): boolean {
  return signpost.isAnswer(valuesOf(s), spaceOf(s.w, s.h), dealtOf(s));
}

/**
 * Solve `state` in place from its links, its arrows and its given numbers:
 * the ladder's links are made in it. Returns 1 if solved, 0 if stuck, -1 if
 * the links break a rule.
 */
export function solveState(state: SignpostState): number {
  const d = deduction(state);
  if (d === null) {
    state.impossible = true;
    return -1;
  }
  const { m, ladder, dl } = d;
  const techniques = ladderTechniques(m, ladder.entries, { [TIERS]: 0 }, {});
  const broken = runLadder(m, techniques);
  m.grid.forEach((v, i) => {
    if (v > LAST && state.next[i] === -1) makeLink(state, i, linkOf(state, i, v));
  });
  updateNumbers(state);
  if (broken || state.impossible) {
    state.impossible = true;
    return -1;
  }
  if (m.grid.includes(0)) return 0;
  return signpost.isAnswer(m.grid, m.sp, dl) ? 1 : -1;
}

/** Whether the forced links finish the board from its arrows and its given
 * numbers. The player's links are not read. */
export function solverFinishes(board: SignpostState): boolean {
  const copy = cloneState(board);
  stripNums(copy);
  return solveState(copy) > 0;
}

// --- the search for a board's answers ---------------------------------------

/** What a search established about a board's answers; the one answer is each
 * square's link out, -1 for the last. */
export type SignpostAnswer = Answer<Int32Array>;

/**
 * The positions a search may try before it gives up, each one a square
 * assumed to link to one of the squares it could and the solver run from it.
 *
 * It decides which Unreasonable boards exist: a board that needs more is
 * thrown away when dealing and refused when pasted. Lowering it refuses boards
 * already dealt, which are in saved games.
 */
const SEARCH_BUDGET = 2_000;

/**
 * Count a board's answers up to two, by trial and error over the solver:
 * where it stops, take the square with the fewest squares it could link to
 * and assume each in turn, nearest first. `board` is read for its arrows and
 * its given numbers only.
 */
export function searchAnswers(
  board: SignpostState,
  budget: number = SEARCH_BUDGET,
): SignpostAnswer {
  const start = cloneState(board);
  stripNums(start);
  start.impossible = false;
  return searchBoard<SignpostState, Int32Array>({
    start,
    deduce(position) {
      const verdict = solveState(position);
      return verdict > 0 ? "solved" : verdict < 0 ? "contradiction" : "stuck";
    },
    assume: assumeLink,
    solution: (position) => position.next,
    budget,
  });
}

/**
 * The squares cell `i`, which has no link out, could link to: those its
 * arrow points at that nothing links to yet and the move may join, nearest
 * first, and only the next number's square where the arrow reaches it. The
 * search's order of trial, not a deduction: each one it leaves out no answer
 * has, as upstream's `solve_single` reads them.
 */
function successors(state: SignpostState, i: number): number[] {
  const { w, n } = state;
  const out: number[] = [];
  const sx = i % w;
  const sy = Math.floor(i / w);
  for (const j of arrowLine(state, i)) {
    if (!isValidMove(state, true, sx, sy, j % w, Math.floor(j / w))) continue;
    if (state.prev[j] !== -1) continue;
    out.push(j);
    const ni = state.nums[i];
    if (ni > 0 && ni < n && state.nums[j] === ni + 1) break;
  }
  return out;
}

/**
 * The positions a stuck one divides into: one square without a link out,
 * linked to each square it could link to. Every answer links it to exactly
 * one of them. The square is the one with the fewest, where a wrong link is
 * likeliest to be found at once.
 */
function assumeLink(position: SignpostState): SignpostState[] {
  const { n } = position;
  let at = -1;
  let fewest: number[] = [];
  for (let i = 0; i < n; i++) {
    if (position.next[i] !== -1 || position.nums[i] === n) continue;
    const walked = successors(position, i);
    if (at >= 0 && walked.length >= fewest.length) continue;
    at = i;
    fewest = walked;
  }
  return fewest.map((to) => {
    const linked = cloneState(position);
    makeLink(linked, at, to);
    return linked;
  });
}

/** Keyed on a state's arrows, which every state of a game shares. */
const answers = answerCache<Int8Array, Int32Array>();

/** What a search of a state's arrows and given numbers established about
 * their answers. The player's links are not read. */
export function answerOf(state: SignpostState): SignpostAnswer {
  return answers(state.dirs, () => searchAnswers(state));
}

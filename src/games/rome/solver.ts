/**
 * Rome's solver: the ladder `rome.description.yaml` states, compiled, on the
 * engine's marks and runner (`engine/ladder-runtime.ts`), with the reason each
 * technique records for the hint; the answer check its rules compile to; and
 * the validity check the board paints as it is played.
 *
 * One ladder serves the generator, which lays its arrows on it and keeps a
 * blanked clue only while the board still solves, so its verdict on every
 * intermediate board decides which puzzles exist; `solve()`; `findMistakes`;
 * and the hint, which records it. No technique supposes anything, so a board
 * the ladder drives to its end is uniquely solved, at every tier.
 */
import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import type { DeductionRecord } from "../../engine/deduction-record.ts";
import {
  DESC_CONTRADICTORY,
  type DescError,
  type DescParse,
  puzzleDescError,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import {
  clueList,
  describedSpace,
  partition,
  rangeMask,
  step,
  valuesOf,
} from "../../engine/describe-runtime.ts";
import { Dsf } from "../../engine/dsf.ts";
import { auditingPremises, offerReplay } from "../../engine/firing-replay.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderReplay,
  ladderTechniques,
  placingRung,
  runLadder,
  TIERS,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import * as rome from "./rome.compiled.ts";
import {
  DIFFCOUNT,
  dirBit,
  EMPTY,
  FD_TOGOAL,
  FE_BOUNDS,
  FE_DOUBLE,
  FE_LOOP,
  FE_LOOPSTART,
  FE_MASK,
  FM_ARROWMASK,
  FM_DOWN,
  FM_GOAL,
  FM_LEFT,
  FM_RIGHT,
  FM_UP,
  legalDirs,
  placedValues,
  type RomeBoard,
  type RomeParams,
  type RomeState,
  readBoard,
  STATUS_COMPLETE,
  STATUS_INCOMPLETE,
  STATUS_INVALID,
} from "./state.ts";

// --- validity check ---------------------------------------------------------

/**
 * Upstream `rome_validate_game`, the board as it paints while played.
 * Recomputes every `FE_*` / `FD_TOGOAL` bit on `board.grid` in place and
 * returns `STATUS_COMPLETE` / `STATUS_INCOMPLETE` / `STATUS_INVALID`.
 *
 * It rebuilds the **arrow-connectivity forest** by merging each arrow with
 * the square it points at, flagging an arrow that points off the grid
 * (`FE_BOUNDS`) and one whose target is already in its own component
 * (`FE_LOOPSTART`, which sits on a directed cycle; see {@link markLoops});
 * flags an arrow placed twice in one region (`FE_DOUBLE`); and, where
 * `fullErrors` asks, paints whole loops and marks the squares that reach a
 * goal. Whether a board is solved is the rules' to say ({@link isSolved}).
 */
export function validateGame(board: RomeBoard, fullErrors: boolean): number {
  const { w, h, grid, regions } = board;
  const s = w * h;
  const dsf = new Dsf(s);
  const sets = new Int32Array(s);
  const seterrs = new Int32Array(s);

  for (let i = 0; i < s; i++) grid[i] &= ~(FE_MASK | FD_TOGOAL);

  // Merge every arrow with the square it points at. An arrow whose target is
  // already in its own component closes a directed cycle, so flag it as the
  // loop's entry point and leave the components alone.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const c = grid[i];
      if (c & FM_UP) {
        if (y === 0) grid[i] |= FE_BOUNDS;
        else if (dsf.equivalent(i, i - w)) grid[i] |= FE_LOOPSTART;
        else dsf.merge(i, i - w);
      }
      if (c & FM_DOWN) {
        if (y === h - 1) grid[i] |= FE_BOUNDS;
        else if (dsf.equivalent(i, i + w)) grid[i] |= FE_LOOPSTART;
        else dsf.merge(i, i + w);
      }
      if (c & FM_LEFT) {
        if (x === 0) grid[i] |= FE_BOUNDS;
        else if (dsf.equivalent(i, i - 1)) grid[i] |= FE_LOOPSTART;
        else dsf.merge(i, i - 1);
      }
      if (c & FM_RIGHT) {
        if (x === w - 1) grid[i] |= FE_BOUNDS;
        else if (dsf.equivalent(i, i + 1)) grid[i] |= FE_LOOPSTART;
        else dsf.merge(i, i + 1);
      }
    }
  }

  if (fullErrors) markLoops(board);

  // Per-region arrow sets, and the arrows that appear twice in one region.
  for (let i = 0; i < s; i++) {
    if (grid[i] === EMPTY) continue;
    const c = regions.canonify(i);
    const arrow = grid[i] & FM_ARROWMASK;
    if (arrow & sets[c]) seterrs[c] |= arrow;
    else sets[c] |= arrow;
  }
  for (let i = 0; i < s; i++) {
    const c = regions.canonify(i);
    if (grid[i] & FM_ARROWMASK & seterrs[c]) grid[i] |= FE_DOUBLE;
  }

  if (fullErrors) {
    // Mark every square whose arrows lead to a goal: upstream's
    // `dsf_minimal(dsf, x) == dsf_minimal(dsf, i)` is a same-component test.
    for (let i = 0; i < s; i++) {
      if (!(grid[i] & FM_GOAL)) continue;
      for (let x = 0; x < s; x++) {
        if (dsf.equivalent(x, i)) grid[x] |= FD_TOGOAL;
      }
    }
  }

  let ret = STATUS_COMPLETE;
  for (let i = 0; i < s; i++) {
    if (grid[i] & FE_MASK) return STATUS_INVALID;
    if (grid[i] === EMPTY) ret = STATUS_INCOMPLETE;
  }
  return ret;
}

/**
 * Paint `FE_LOOP` on every square of every loop, walking each loop once from
 * its `FE_LOOPSTART` entry.
 *
 * The walk provably terminates. `FE_LOOPSTART` is set on `i` when `i`'s arrow
 * points at a square already in `i`'s component; since each square has at most
 * one outgoing arrow, every edge on the pre-existing path from `i` must be
 * directed *towards* `i`, so that path reads `j → … → i` and closing it with
 * `i → j` makes a directed cycle through `i`. Following arrows from `i`
 * therefore returns to `i`, which is itself a `FE_LOOPSTART`. The explicit
 * bound is a runaway guard for a port bug, not a real exit.
 */
function markLoops(board: RomeBoard): void {
  const { w, h, grid } = board;
  const s = w * h;
  for (let i = 0; i < s; i++) {
    if (!(grid[i] & FE_LOOPSTART)) continue;
    let x = i % w;
    let y = (i / w) | 0;
    for (let steps = 0; ; steps++) {
      if (steps > s) throw new Error("rome: loop walk did not close");
      const j = y * w + x;
      grid[j] |= FE_LOOP;
      const c = grid[j];
      if (c & FM_UP) y--;
      else if (c & FM_DOWN) y++;
      else if (c & FM_LEFT) x--;
      else if (c & FM_RIGHT) x++;
      if (grid[y * w + x] & FE_LOOPSTART) break;
    }
  }
}

// --- desc validation --------------------------------------------------------

export const ARROWS_ALREADY_SOLVED = puzzleDescError(
  "This game ID's arrows already lead every square to a goal, leaving nothing to solve.",
);
export const REGION_TOO_LARGE = puzzleDescError(
  "This game ID has a region of more than four squares, which four different arrows can't fill.",
);
export const GOAL_NOT_ALONE = puzzleDescError(
  "This game ID puts a goal in a region of more than one square.",
);

/**
 * Upstream `validate_desc` and `new_game` in one reading: decode, reject a
 * description that is already finished or already broken, then reject a region
 * larger than the four distinct arrows it could hold, or a goal outside a
 * single-square region (the last offending square decides which). The board
 * comes back with its validity bits set. Lives here rather than beside the
 * codec because its central assertion is a validity verdict.
 */
export function parseDesc(p: RomeParams, desc: string): DescParse<RomeState> {
  return readDesc(desc, (r) => {
    const board = readBoard(r, p);
    r.end();
    const status = validateGame(board, true);
    if (status === STATUS_COMPLETE) r.fail(ARROWS_ALREADY_SOLVED);
    if (status !== STATUS_INCOMPLETE) r.fail(DESC_CONTRADICTORY);

    let result: DescError | null = null;
    for (let i = 0; i < p.w * p.h; i++) {
      const size = board.regions.size(i);
      if (size > 4) result = REGION_TOO_LARGE;
      if (board.grid[i] & FM_GOAL && size > 1) result = GOAL_NOT_ALONE;
    }
    if (result) r.fail(result);
    return board;
  });
}

// --- the board as the description reads it ---------------------------------

/**
 * Why one recorded Rome deduction fired — the premise its sentence states and
 * its evidence shades, built from the firing's binding on the marks it read.
 * A culled arrow is the engine's `dup`, the cull the candidate plan does for
 * itself around every placement.
 */
export type RomeReason =
  /** The square's notes have collapsed to one arrow. */
  | { kind: "single" }
  /** Pointing that way joins a chain of arrows that leads back here. `path` is
   * that chain, from the square pointed at through to the square itself. */
  | { kind: "loop"; path: readonly number[] }
  /** In a four-square region, this is the only square left that can take the
   * arrows in `only`, so it can be nothing else. `region` is the four squares. */
  | { kind: "onlyHome"; only: readonly number[]; region: readonly number[] }
  /** The only arrow left anywhere that can point into `group`, the squares
   * already leading to the goal at `goal`. `reads` is every square bordering
   * the group, whose marks show that none of the others can
   * (`DeductionRecord`). */
  | {
      kind: "reach";
      goal: number;
      group: readonly number[];
      reads: readonly { x: number; y: number }[];
    }
  /** `(px, py)` can only point along this axis, and both its neighbors on it
   * share its region, so a neighbor pointing back would close a two-square
   * loop. */
  | { kind: "opposite"; px: number; py: number }
  /** Two squares of this region hold the same two candidates between them, so
   * those two arrows are spent. `pair` is the two squares and `values` the two
   * arrows they share, carried because a sentence built from the struck marks
   * would name only those the other squares still had. */
  | {
      kind: "pair";
      pair: readonly number[];
      values: readonly number[];
      region: readonly number[];
    };

const areasByDsf = new WeakMap<Dsf, ReturnType<typeof partition>>();

/** The board as the description deals it: its areas, in the order of their
 * first square, each in reading order, and its goals. The partition is kept
 * for the life of the board's areas, which every solve of it shares. */
function dealtOf(board: RomeBoard): rome.Dealt {
  let area = areasByDsf.get(board.regions);
  if (area === undefined) {
    const byRoot = new Map<number, number[]>();
    for (let i = 0; i < board.grid.length; i++) {
      const root = board.regions.canonify(i);
      const cells = byRoot.get(root);
      if (cells) cells.push(i);
      else byRoot.set(root, [i]);
    }
    area = partition([...byRoot.values()], board.grid.length);
    areasByDsf.set(board.regions, area);
  }
  const goals: number[] = [];
  for (let i = 0; i < board.grid.length; i++)
    if (board.grid[i] & FM_GOAL) goals.push(i);
  return {
    area,
    goal: clueList(
      goals,
      goals.map(() => 0),
      board.grid.length,
    ),
  };
}

/** The squares from `from` along the placed arrows to `to`, both included:
 * the chain a loop sentence names. The `loop` technique fired because `to`
 * is on `from`'s chain. */
function arrowPath(m: CellMarks, from: number, to: number): number[] {
  const path: number[] = [];
  for (
    let at = from;
    at >= 0 && path.length <= m.grid.length;
    at = step(m.sp, at, m.value(at))
  ) {
    path.push(at);
    if (at === to) return path;
  }
  throw new Error("rome: a loop with no chain back to its square");
}

/** The squares whose arrows lead to `goal`, it among them: the group a
 * `reach` sentence names. */
function groupOf(m: CellMarks, goal: number): number[] {
  const out: number[] = [];
  for (let c = 0; c < m.grid.length; c++) {
    let at = c;
    for (let n = 0; at >= 0 && at !== goal && n < m.grid.length; n++)
      at = step(m.sp, at, m.value(at));
    if (at === goal) out.push(c);
  }
  return out;
}

/** Why `reach` leaves `cell` one arrow: the group it is the only way into. */
function reachReason(m: CellMarks, home: readonly number[], cell: number): RomeReason {
  const { w } = m.sp;
  const into = valuesOf(m.cand(cell)).find((d) => home.includes(step(m.sp, cell, d)));
  if (into === undefined) throw new Error("rome: reach with no way into the goals");
  let goal = step(m.sp, cell, into);
  for (let n = 0; m.known(goal) && n < m.grid.length; n++) {
    const next = step(m.sp, goal, m.value(goal));
    if (next < 0) break;
    goal = next;
  }
  const group = groupOf(m, goal);
  const border = new Set<number>();
  for (const i of group)
    for (const p of m.sp.adj4[i]) if (!group.includes(p)) border.add(p);
  return {
    kind: "reach",
    goal,
    group,
    reads: [...border].map((i) => ({ x: i % w, y: (i / w) | 0 })),
  };
}

/** The ladder over the dealt areas and goals, each technique with its
 * reason. */
function romeLadder(dl: rome.Dealt): Ladder {
  return describedLadder(rome, {
    cull: placingRung(rome.cull, dl),
    lone: uncluedRung(rome.lone, (): RomeReason => ({ kind: "single" })),
    loop: uncluedRung(
      rome.loop,
      ({ c, q }, _cell, _n, m): RomeReason => ({
        kind: "loop",
        path: arrowPath(m, q, c),
      }),
    ),
    onlyHome: compiledRung(
      rome.onlyHome,
      dl,
      ({ r, d }): RomeReason => ({
        kind: "onlyHome",
        only: [d],
        region: dl.area.cells[r],
      }),
    ),
    pair: compiledRung(
      rome.pair,
      dl,
      ({ r, a, b }, _cell, _n, m): RomeReason => ({
        kind: "pair",
        pair: [b, a],
        values: valuesOf(m.cand(a)),
        region: dl.area.cells[r],
      }),
    ),
    reach: compiledRung(rome.reach, dl, ({ H }, cell, _n, m) =>
      reachReason(m, H, cell),
    ),
    opposite: compiledRung(
      rome.opposite,
      dl,
      ({ c }, _cell, _n, m): RomeReason => ({
        kind: "opposite",
        px: c % m.sp.w,
        py: (c / m.sp.w) | 0,
      }),
    ),
  });
}

/**
 * The marks over `grid`, a value a square (an arrow 1 to 4, a goal 5, 0 for
 * none), each square able to hold what its domain admits and each value on
 * it placed and culled; `null` where one is placed where it cannot be (an
 * arrow off the board, or twice in an area). The marks are the solver's own,
 * never the player's notes.
 */
function marksOf(
  board: RomeBoard,
  grid: Uint8Array,
  dl: rome.Dealt,
  ladder: Ladder,
): CellMarks | null {
  const m = new CellMarks(
    describedSpace(rome.units, board.w, board.h),
    rangeMask(1, 5),
    grid,
  );
  m.placing = ladder.placing;
  return m.seed(grid, (c) => rome.domainOf(m.sp, dl, c)) ? m : null;
}

/** Whether `board`'s grid, every square filled, is an answer, by the rules
 * its description compiles to. */
export function isSolved(board: RomeBoard): boolean {
  const grid = placedValues(board);
  return rome.isAnswer(
    grid,
    describedSpace(rome.units, board.w, board.h),
    dealtOf(board),
  );
}

/**
 * Solve `board` in place by the ladder up to `maxdiff`, returning the final
 * `STATUS_*`: its grid takes every arrow the ladder places, and its notes the
 * ladder's candidates. A board whose clues clash leaves each empty square
 * every arrow on the board, as the generator, laying arrows on it, reads.
 */
export function romeSolve(
  board: RomeBoard,
  maxdiff: number,
  firings?: FiringTally,
): number {
  const { w, h, grid, pencil } = board;
  const dl = dealtOf(board);
  const ladder = romeLadder(dl);
  const values = placedValues(board);
  const m = marksOf(board, values, dl, ladder);
  if (m === null) {
    for (let i = 0; i < grid.length; i++)
      pencil[i] =
        grid[i] === EMPTY
          ? legalDirs(i % w, (i / w) | 0, w, h)
          : grid[i] & FM_ARROWMASK;
    return STATUS_INVALID;
  }
  const impossible = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [TIERS]: maxdiff }, {}),
    { firings },
  );
  let full = true;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === EMPTY) grid[i] = dirBit(values[i]);
    if (grid[i] === EMPTY) full = false;
    let notes = 0;
    for (let d = 1; d <= 4; d++) if (m.has(i, d)) notes |= dirBit(d);
    pencil[i] = notes;
  }
  if (impossible) return STATUS_INVALID;
  if (!full) return STATUS_INCOMPLETE;
  return rome.isAnswer(values, m.sp, dl) ? STATUS_COMPLETE : STATUS_INVALID;
}

/**
 * The recording solver on the arrows `board` holds (never the player's
 * notes), up to `maxdiff`: every arrow it places and rules out, in order,
 * each with the reason the hint narrates. `board` is not modified.
 */
export function recordRomeDeductions(
  board: RomeBoard,
  maxdiff: number = DIFFCOUNT - 1,
): DeductionRecord[] {
  const ops: DeductionRecord[] = [];
  const dl = dealtOf(board);
  const ladder = romeLadder(dl);
  const m = marksOf(board, placedValues(board), dl, ladder);
  if (m === null) return ops;
  m.recorder = (rec) => ops.push(rec);
  m.budget = stepBudget("rome hint");
  const techniquesOn = (on: CellMarks) =>
    ladderTechniques(on, ladder.entries, { [TIERS]: maxdiff }, {});
  const replay = auditingPremises()
    ? ladderReplay(
        m,
        (values) => {
          const fresh = marksOf(board, Uint8Array.from(values), dl, ladder);
          if (fresh === null) throw new Error("rome replay: the edited board clashes");
          return fresh;
        },
        techniquesOn,
      )
    : null;
  runLadder(m, techniquesOn(m));
  if (replay) offerReplay(replay);
  return ops;
}

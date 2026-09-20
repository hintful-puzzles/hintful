/**
 * Rome's validity check and its pure-deduction solver — port of
 * `rome_validate_game` and `rome_solve` (plus the seven deduction rules) in
 * `puzzles/unreleased/rome.c`.
 *
 * ## The validity check is the engine, not a postscript
 *
 * {@link validateGame} does three jobs at once, which is why every deduction
 * rule takes its output rather than recomputing anything:
 *
 * 1. It rebuilds the **arrow-connectivity forest** by merging each arrow with
 *    the square it points at, flagging an arrow that points off the grid
 *    (`FE_BOUNDS`) and one whose target is already in its own component
 *    (`FE_LOOPSTART` — that square necessarily sits on a directed cycle; see
 *    the note on the loop walk below).
 * 2. It accumulates, per outlined region, the **set of arrows already placed**
 *    there (`sets`), flagging repeats (`FE_DOUBLE`).
 * 3. On the display path it walks each goal's component to mark the squares
 *    that reach it (`FD_TOGOAL`) and paints every loop square (`FE_LOOP`).
 *
 * ## Guess-free at every tier
 *
 * There is no backtracking anywhere in this solver, at any difficulty: Easy,
 * Normal and Tricky differ only in *which* closed-form techniques are allowed
 * to run. Rome therefore satisfies the project's guess-free generation policy
 * with no "Unreasonable" tier to carve out.
 *
 * ## Why the rule order and the DSF root choice are byte-match surface
 *
 * The generator is solver-gated at every step — it keeps a blanked clue only
 * while this solver still finishes the board — so the published description
 * depends on this solver's verdict on every intermediate board. Two
 * consequences worth stating loudly:
 *
 * - The rules must fire in upstream's order, with upstream's tier gating.
 * - {@link nakedPairs} scans `for (k = c; …)` from the region's **canonical
 *   root read as an element**, which can genuinely skip region members whose
 *   index is below that root. `dsf_new_min` does *not* make `dsf_canonify`
 *   return the region's minimum (it adds a separate `min[]` array read only by
 *   `dsf_minimal`), so the root here is the ordinary union-by-size root — and
 *   the shared {@link Dsf} reproduces `dsf.c`'s tie-break exactly, which is
 *   what makes this quirk portable rather than a divergence.
 */
import {
  type DeductionTechnique,
  type FiringTally,
  runDeductionFixpoint,
} from "../../engine/deduction-fixpoint.ts";
import type { DeductionRecord } from "../../engine/deduction-record.ts";
import { Dsf } from "../../engine/dsf.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  DIFF_TRICKY,
  DIR_BITS,
  dirValue,
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
  type RomeBoard,
  type RomeParams,
  readDesc,
  STATUS_COMPLETE,
  STATUS_INCOMPLETE,
  STATUS_INVALID,
} from "./state.ts";

// --- validity check ---------------------------------------------------------

/** Reusable working buffers for {@link validateGame}, so the solver's fixpoint
 * loop allocates nothing per iteration. */
export interface ValidateScratch {
  /** Arrow connectivity, reinitialized on every call. */
  dsf: Dsf;
  /** Arrows already placed, per region canonical root. */
  sets: Int32Array;
  /** Arrows placed more than once, per region canonical root. */
  seterrs: Int32Array;
}

function newValidateScratch(cells: number): ValidateScratch {
  return {
    dsf: new Dsf(cells),
    sets: new Int32Array(cells),
    seterrs: new Int32Array(cells),
  };
}

/**
 * Upstream `rome_validate_game`. Recomputes every `FE_*` / `FD_TOGOAL` bit on
 * `board.grid` in place and returns `STATUS_COMPLETE` / `STATUS_INCOMPLETE` /
 * `STATUS_INVALID`.
 *
 * `fullErrors` is upstream's `fullerrors`: the display path (`newState`,
 * `executeMove`) passes `true` to additionally paint whole loops and mark the
 * squares that reach a goal; the solver passes `false`, needing only the
 * verdict, the forest and the per-region arrow sets.
 */
export function validateGame(
  board: RomeBoard,
  fullErrors: boolean,
  scratch?: ValidateScratch,
): number {
  const { w, h, grid, regions } = board;
  const s = w * h;
  const { dsf, sets, seterrs } = scratch ?? newValidateScratch(s);

  for (let i = 0; i < s; i++) grid[i] &= ~(FE_MASK | FD_TOGOAL);

  dsf.reinit();
  sets.fill(0);
  seterrs.fill(0);

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

/**
 * Upstream `validate_desc`: decode, reject a description that is already
 * finished or already broken, then reject a region larger than the four
 * distinct arrows it could hold, or a goal outside a single-square region (the
 * last offending square decides which). Lives here rather than beside the
 * codec because its central assertion is a validity verdict.
 */
export function validateDesc(p: RomeParams, desc: string): string | null {
  const { board, error } = readDesc(p, desc);
  if (error) return error;
  if (validateGame(board, true) !== STATUS_INCOMPLETE) return "Puzzle contains errors";

  let result: string | null = null;
  for (let i = 0; i < p.w * p.h; i++) {
    const size = board.regions.size(i);
    if (size > 4) result = "A region is too large";
    if (board.grid[i] & FM_GOAL && size > 1) {
      result = "A goal is not placed in an area of 1 cell";
    }
  }
  return result;
}

// --- the recording projection -----------------------------------------------

/**
 * Why one recorded Rome deduction fired — the premise its sentence states and
 * its evidence shades. Each arm carries what the *finder* knew, because only
 * the finder knows which of several causes killed a candidate
 * (docs/games/hints.md § "The premise must single out the conclusion").
 *
 * `dup` is the shared {@link import("../../engine/candidate-plan.ts").DupReason}
 * spelling on purpose: `solverDoubles` is exactly the cull a candidate plan does
 * for itself around every placement, so recording it under that name is what
 * makes the shared machinery skip it as bookkeeping rather than teach it twice.
 */
export type RomeReason =
  /** The square's notes have collapsed to one arrow. */
  | { kind: "single" }
  /** That arrow is already placed at `(px, py)`, in this square's region. */
  | { kind: "dup"; n: number; px: number; py: number }
  /** Pointing that way joins a chain of arrows that leads back here. `path` is
   * that chain, from the square pointed at through to the square itself. */
  | { kind: "loop"; path: readonly number[] }
  /** In a four-square region, this is the only square left that can take the
   * arrows in `only`, so it can be nothing else. `region` is the four squares. */
  | { kind: "onlyHome"; only: readonly number[]; region: readonly number[] }
  /** The only arrow left anywhere that can point into `group`, the squares
   * already leading to the goal at `goal`. */
  | { kind: "reach"; goal: number; group: readonly number[] }
  /** `(px, py)` can only point along this axis, and both its neighbors on it
   * share its region, so a neighbor pointing back would close a two-square
   * loop. */
  | { kind: "opposite"; px: number; py: number }
  /** Two squares of this region hold the same two candidates between them, so
   * those two arrows are spent. `pair` is the two squares and `values` the two
   * arrows they share.
   *
   * `values` is carried rather than read back off the struck marks, because
   * those are only the *live* ones: where the region's other squares had
   * already lost one of the two, a sentence built from them would say a pair is
   * one arrow (docs/games/hints.md § "The premise must single out the
   * conclusion" — compute the reason where the elimination is computed). */
  | {
      kind: "pair";
      pair: readonly number[];
      values: readonly number[];
      region: readonly number[];
    };

/** One recorded Rome deduction. */
export interface RomeHintOp extends DeductionRecord {
  reason: RomeReason;
}

/**
 * The hint path's recorder. Every rung below takes one and is **oblivious to
 * it otherwise**: nothing here changes what a rung strikes, only what it says
 * about it, so the recording and the committing paths cannot diverge. That is
 * worth stating because Rome's generator is solver-gated at every step, and a
 * rung that behaved differently under a recorder would change every published
 * desc; `rome.test.ts` asserts the two paths agree rather than trusting it.
 *
 * A *firing* is one premise acting once. {@link open} starts one, and every op
 * of it carries that group, so the plan reads one deduction as one journey.
 */
class RomeRecording {
  private g = 0;
  readonly ops: RomeHintOp[] = [];

  constructor(private readonly w: number) {}

  /** Open a firing and return its group id. */
  open(): number {
    return ++this.g;
  }

  add(
    kind: "place" | "elim",
    cell: number,
    bit: number,
    reason: RomeReason,
    group: number,
  ): void {
    this.ops.push({
      kind,
      x: cell % this.w,
      y: (cell / this.w) | 0,
      n: dirValue(bit),
      reason,
      group,
    });
  }
}

/** The bits of `mask`, as candidate values. */
function valuesIn(mask: number): number[] {
  const out: number[] = [];
  for (const bit of DIR_BITS) {
    if (mask & bit) out.push(dirValue(bit));
  }
  return out;
}

// --- deduction rules --------------------------------------------------------

/** Ascending member lists per region canonical root. The region partition is
 * fixed for a whole solve, so {@link nakedPairs} builds this once instead of
 * rescanning the board — the same traversal, since both its `j` and `k` scans
 * are "region members in ascending index order" filtered by a lower bound. */
function regionMembers(board: RomeBoard): Map<number, number[]> {
  const { regions } = board;
  const out = new Map<number, number[]>();
  for (let i = 0; i < board.grid.length; i++) {
    const c = regions.canonify(i);
    const list = out.get(c);
    if (list) list.push(i);
    else out.set(c, [i]);
  }
  return out;
}

/** EASY: a square with a single remaining candidate takes it. */
function solverSingle(board: RomeBoard, rec: RomeRecording | null): number {
  const { grid, pencil } = board;
  let ret = 0;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] !== EMPTY) continue;
    const m = pencil[i];
    if (m === FM_UP || m === FM_DOWN || m === FM_LEFT || m === FM_RIGHT) {
      // Each single stands on its own notes, so each is its own firing.
      rec?.add("place", i, m, { kind: "single" }, rec.open());
      grid[i] = m;
      ret++;
    }
  }
  return ret;
}

/** The square of `i`'s region that already holds `bit`, for a `dup` reason's
 * `(px, py)`. The rung fires off `sets`, which remembers only *that* the arrow
 * is there; a sentence has to point at it. */
function holderOf(board: RomeBoard, i: number, bit: number): number {
  const { grid, regions } = board;
  const c = regions.canonify(i);
  for (let j = 0; j < grid.length; j++) {
    if (j !== i && regions.canonify(j) === c && grid[j] & bit) return j;
  }
  throw new Error("rome: a duplicate arrow with no holder in its region");
}

/** EASY: an arrow already placed in a region is ruled out everywhere in it. */
function solverDoubles(
  board: RomeBoard,
  sets: Int32Array,
  rec: RomeRecording | null,
): number {
  const { w, grid, pencil, regions } = board;
  let ret = 0;
  for (let i = 0; i < pencil.length; i++) {
    const prev = pencil[i];
    pencil[i] &= ~sets[regions.canonify(i)];
    if (prev === pencil[i]) continue;
    ret++;
    // Recorded under the shared `dup` name, so the plan treats it as the cull
    // it does around its own placements rather than as a technique to teach.
    // A struck note on an already-filled square is the solver tidying its own
    // working set, not a deduction, and is not recorded.
    if (rec && grid[i] === EMPTY) {
      const group = rec.open();
      for (const n of valuesIn(prev & ~pencil[i])) {
        const bit = DIR_BITS[n - 1];
        const holder = holderOf(board, i, bit);
        rec.add(
          "elim",
          i,
          bit,
          { kind: "dup", n, px: holder % w, py: (holder / w) | 0 },
          group,
        );
      }
    }
  }
  return ret;
}

/** EASY: a candidate that would point into the square's own arrow component
 * would close a loop, so it is impossible.
 *
 * The bounds guards are redundant — {@link initCandidates} clears the
 * border-illegal candidates, so the off-grid neighbor is never reached — but
 * upstream relies on that silently and reads out of bounds if it ever stops
 * holding. */
function solverLoops(board: RomeBoard, dsf: Dsf, rec: RomeRecording | null): number {
  const { w, h, grid, pencil } = board;
  let ret = 0;
  const strike = (i: number, bit: number, target: number): void => {
    pencil[i] &= ~bit;
    ret++;
    // The self-strike on a square that already holds this arrow is the solver
    // tidying its working set: the arrow is placed, so it closes no loop.
    if (rec && grid[i] === EMPTY) {
      rec.add(
        "elim",
        i,
        bit,
        { kind: "loop", path: arrowPath(board, target, i) },
        rec.open(),
      );
    }
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (pencil[i] & FM_UP && y > 0 && dsf.equivalent(i, i - w))
        strike(i, FM_UP, i - w);
      if (pencil[i] & FM_DOWN && y < h - 1 && dsf.equivalent(i, i + w))
        strike(i, FM_DOWN, i + w);
      if (pencil[i] & FM_LEFT && x > 0 && dsf.equivalent(i, i - 1))
        strike(i, FM_LEFT, i - 1);
      if (pencil[i] & FM_RIGHT && x < w - 1 && dsf.equivalent(i, i + 1))
        strike(i, FM_RIGHT, i + 1);
    }
  }
  return ret;
}

/**
 * The chain of arrows from `from` to `to`, inclusive of both — the walk a loop
 * sentence claims exists, computed rather than assumed (AGENTS.md § "Hint
 * quality bar", rule 5).
 *
 * It always exists where {@link solverLoops} calls it, and the argument is the
 * one {@link markLoops} makes: `from` and `to` share an arrow component, every
 * square has at most one outgoing arrow, and `to` is empty and so has none — so
 * the component is a tree whose every edge points towards its one arrow-less
 * square, which is `to`. Following arrows from `from` therefore arrives there.
 * The throw is the check on that argument, not decoration: it is what would
 * fire if a caller ever passed a pair the premise does not hold for.
 */
function arrowPath(board: RomeBoard, from: number, to: number): number[] {
  const { w, grid } = board;
  const path: number[] = [];
  let at = from;
  for (let steps = 0; steps <= grid.length; steps++) {
    path.push(at);
    if (at === to) return path;
    const c = grid[at];
    if (c & FM_UP) at -= w;
    else if (c & FM_DOWN) at += w;
    else if (c & FM_LEFT) at -= 1;
    else if (c & FM_RIGHT) at += 1;
    else break;
  }
  throw new Error("rome: no arrow chain between two squares of one component");
}

/** NORMAL: in a four-square region — which must hold all four arrows — a
 * direction that only one square can still take belongs to that square. */
function find4Position(
  board: RomeBoard,
  singles: Int32Array,
  doubles: Int32Array,
  members: Map<number, number[]>,
  rec: RomeRecording | null,
): number {
  const { grid, pencil, regions } = board;
  const s = pencil.length;
  singles.fill(0);
  doubles.fill(0);
  let ret = 0;

  for (let i = 0; i < s; i++) {
    if (regions.size(i) !== 4) continue;
    const c = regions.canonify(i);
    doubles[c] |= pencil[i] & singles[c];
    singles[c] |= pencil[i];
  }
  for (let i = 0; i < s; i++) {
    if (regions.size(i) !== 4) continue;
    const c = regions.canonify(i);
    const unique = singles[c] ^ doubles[c];
    const prev = pencil[i];
    if (pencil[i] & unique) pencil[i] &= unique;
    if (prev === pencil[i]) continue;
    ret++;
    // One square kept down to the arrows only it can take: one premise, so one
    // firing however many notes it clears.
    if (rec && grid[i] === EMPTY) {
      const group = rec.open();
      const reason: RomeReason = {
        kind: "onlyHome",
        only: valuesIn(prev & unique),
        region: members.get(c) as number[],
      };
      for (const n of valuesIn(prev & ~pencil[i])) {
        rec.add("elim", i, DIR_BITS[n - 1], reason, group);
      }
    }
  }
  return ret;
}

/** NORMAL: two squares of a region sharing the same pair of candidates use
 * both of them up, so the pair is ruled out of the region's other squares. */
function nakedPairs(
  board: RomeBoard,
  members: Map<number, number[]>,
  rec: RomeRecording | null,
): number {
  const { grid, pencil, regions } = board;
  const s = pencil.length;
  let ret = 0;

  for (let i = 0; i < s; i++) {
    if (regions.size(i) < 3) continue;
    const m = pencil[i];
    const poss =
      (m & FM_UP ? 1 : 0) +
      (m & FM_DOWN ? 1 : 0) +
      (m & FM_LEFT ? 1 : 0) +
      (m & FM_RIGHT ? 1 : 0);
    if (poss !== 2) continue;

    const c = regions.canonify(i);
    const list = members.get(c) as number[];
    for (const j of list) {
      // Upstream scans `j` from `i + 1`, so the pair is found once, from its
      // lower member.
      if (j <= i || pencil[j] !== pencil[i]) continue;
      // Upstream scans `k` from the region's canonical root — the union-by-size
      // root, NOT its minimum — so a member below that root is genuinely
      // skipped. Reproduced verbatim because the generator is solver-gated at
      // every step, so any deduction this rung does or does not make is a
      // deduction the published descs were chosen against. `rome-ladder.test.ts`
      // pins two boards that reach this loop; before them the whole rung was
      // uncertified and its `unreached` entry doubted the sentence above.
      const reason: RomeReason = {
        kind: "pair",
        pair: [i, j],
        values: valuesIn(m),
        region: list,
      };
      const group = rec?.open() ?? 0;
      for (const k of list) {
        if (k < c || k === i || k === j) continue;
        const prev = pencil[k];
        pencil[k] &= ~pencil[i];
        if (pencil[k] === prev) continue;
        ret++;
        if (rec && grid[k] === EMPTY) {
          for (const n of valuesIn(prev & ~pencil[k])) {
            rec.add("elim", k, DIR_BITS[n - 1], reason, group);
          }
        }
      }
    }
  }
  return ret;
}

/**
 * NORMAL: every square must eventually reach a goal, so at least one square
 * outside a goal's component has to point into it. When exactly one candidate
 * across the whole board could do that, it is forced.
 *
 * (Candidates from *inside* the component have already been struck by
 * {@link solverLoops}, which runs to exhaustion first — so every candidate
 * this sees genuinely grows the component.)
 */
function solverExpand(board: RomeBoard, dsf: Dsf, rec: RomeRecording | null): number {
  const { w, h, grid, pencil } = board;
  let dir = EMPTY;
  let idx = -1;
  let goal = -1;

  for (let i = 0; i < grid.length; i++) {
    if (!(grid[i] & FM_GOAL)) continue;
    const c = dsf.canonify(i);

    // Unrolled in upstream's order (right, left, down, up) — a candidate array
    // here would allocate once per square per goal on the generator hot path.
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i1 = y * w + x;
        if (x < w - 1 && dsf.canonify(i1 + 1) === c && pencil[i1] & FM_RIGHT) {
          if (dir !== EMPTY) return 0; // more than one option: nothing forced
          dir = FM_RIGHT;
          idx = i1;
          goal = i;
        }
        if (x > 0 && dsf.canonify(i1 - 1) === c && pencil[i1] & FM_LEFT) {
          if (dir !== EMPTY) return 0;
          dir = FM_LEFT;
          idx = i1;
          goal = i;
        }
        if (y < h - 1 && dsf.canonify(i1 + w) === c && pencil[i1] & FM_DOWN) {
          if (dir !== EMPTY) return 0;
          dir = FM_DOWN;
          idx = i1;
          goal = i;
        }
        if (y > 0 && dsf.canonify(i1 - w) === c && pencil[i1] & FM_UP) {
          if (dir !== EMPTY) return 0;
          dir = FM_UP;
          idx = i1;
          goal = i;
        }
      }
    }
  }

  if (dir !== EMPTY) {
    const prev = pencil[idx];
    pencil[idx] = dir;
    // One premise (only this arrow can still point into that goal's group), so
    // one firing however many of the square's other notes it clears.
    if (rec && grid[idx] === EMPTY) {
      const group = rec.open();
      const reason: RomeReason = {
        kind: "reach",
        goal,
        group: componentOf(dsf, grid.length, goal),
      };
      for (const n of valuesIn(prev & ~dir)) {
        rec.add("elim", idx, DIR_BITS[n - 1], reason, group);
      }
    }
    return 1;
  }
  return 0;
}

/** The squares whose arrows already lead to `goal` — the group a `reach`
 * sentence names and its evidence shades. */
function componentOf(dsf: Dsf, cells: number, goal: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < cells; i++) if (dsf.equivalent(i, goal)) out.push(i);
  return out;
}

/** TRICKY: a square whose only candidates are up/down cannot be pointed at by
 * an up or down arrow from the same region — the two would be the region's
 * single up and single down, and one of them would have to be spent twice.
 * Likewise for left/right.
 *
 * The neighbors are always in range: a square on the top row has had `FM_UP`
 * cleared, so its candidate set can never equal exactly `FM_UP|FM_DOWN`, and
 * symmetrically on the other three edges. */
function solverOpposites(board: RomeBoard, rec: RomeRecording | null): number {
  const { w, h, grid, pencil, regions } = board;
  let ret = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i1 = y * w + x;
      const twoWay =
        pencil[i1] === (FM_UP | FM_DOWN) || pencil[i1] === (FM_LEFT | FM_RIGHT);
      if (!twoWay) continue;
      // Both neighbors on the axis are ruled out by the same premise about this
      // square, so the two strikes are one firing.
      const reason: RomeReason = { kind: "opposite", px: x, py: y };
      const group = rec?.open() ?? 0;
      const strike = (j: number, bit: number): void => {
        if (!(pencil[j] & bit) || regions.canonify(j) !== regions.canonify(i1)) return;
        pencil[j] &= ~bit;
        ret++;
        if (rec && grid[j] === EMPTY) rec.add("elim", j, bit, reason, group);
      };

      if (pencil[i1] === (FM_UP | FM_DOWN)) {
        strike((y - 1) * w + x, FM_DOWN);
        strike((y + 1) * w + x, FM_UP);
      } else {
        strike(i1 - 1, FM_RIGHT);
        strike(i1 + 1, FM_LEFT);
      }
    }
  }
  return ret;
}

// --- the fixpoint -----------------------------------------------------------

/** Seed the candidates: all four arrows on an empty square, its own arrow on a
 * filled one, less any arrow that would point off the grid. */
function initCandidates(board: RomeBoard): void {
  const { w, h, grid, pencil } = board;
  for (let i = 0; i < w * h; i++) {
    pencil[i] =
      grid[i] === EMPTY ? legalDirs(i % w, (i / w) | 0, w, h) : grid[i] & FM_ARROWMASK;
  }
}

/**
 * Solve `board` in place by pure deduction up to `maxdiff`, returning the
 * final `STATUS_*`. Upstream `rome_solve`.
 *
 * Termination: each firing either fills a square (strictly fewer empties) or
 * strikes at least one candidate (strictly fewer mark bits), so the measure
 * `5·cells` decreases every iteration. The explicit cap turns a porting
 * divergence into a loud throw instead of a hung worker.
 */
export function romeSolve(
  board: RomeBoard,
  maxdiff: number,
  firings?: FiringTally,
  rec: RomeRecording | null = null,
): number {
  const s = board.w * board.h;
  const scratch = newValidateScratch(s);
  const { dsf, sets } = scratch;
  initCandidates(board);

  const members = regionMembers(board);
  const singles = new Int32Array(s);
  const doubles = new Int32Array(s);
  const maxIterations = 5 * s + 16;
  let status = STATUS_INCOMPLETE;
  let iteration = 0;

  const ladder: DeductionTechnique[] = [
    { id: "single", tier: DIFF_EASY, run: () => solverSingle(board, rec) },
    { id: "doubles", tier: DIFF_EASY, run: () => solverDoubles(board, sets, rec) },
    { id: "loops", tier: DIFF_EASY, run: () => solverLoops(board, dsf, rec) },
    {
      id: "find-4-position",
      tier: DIFF_NORMAL,
      run: () => find4Position(board, singles, doubles, members, rec),
    },
    {
      id: "naked-pairs",
      tier: DIFF_NORMAL,
      run: () => nakedPairs(board, members, rec),
    },
    { id: "expand", tier: DIFF_NORMAL, run: () => solverExpand(board, dsf, rec) },
    { id: "opposites", tier: DIFF_TRICKY, run: () => solverOpposites(board, rec) },
  ];

  runDeductionFixpoint({
    techniques: ladder,
    firings,
    // Upstream breaks out of the ladder at the first over-cap rung, where
    // `maxTier` skips only the over-cap rungs. The two agree because this
    // ladder is tier-sorted — they would not for a ladder that puts a cheap
    // rung after an expensive one. Check the ordering before copying this.
    maxTier: maxdiff,
    // Rome's own non-convergence guard, run where upstream ran it: at the top
    // of every iteration. Not the shared `stepBudget`, which is the recording
    // path's guard; the throw message and limit are this path's behavior.
    settled: () => {
      if (iteration++ > maxIterations) {
        throw new Error("rome: solver did not converge");
      }
      status = validateGame(board, false, scratch);
      return status !== STATUS_INCOMPLETE;
    },
  });

  return status;
}

/**
 * Every deduction the solver makes from `board`, in solver order, each tagged
 * with the premise that forced it — the raw script a hint narrates.
 *
 * `board` is solved in place, so callers pass a scratch board (the hint plan
 * rebuilds one from its working grid on every recompute). The generator never
 * reaches here.
 */
export function recordRomeDeductions(board: RomeBoard, maxdiff: number): RomeHintOp[] {
  const rec = new RomeRecording(board.w);
  romeSolve(board, maxdiff, undefined, rec);
  return rec.ops;
}

/**
 * Upstream's hand-written ladder, which `romeSolve` replaced with the shared
 * runner; kept as the oracle `rome-ladder.test.ts` checks the runner against.
 *
 * Rome returns a *status*, not a tier, so the runner's grade is unused here —
 * what it takes is the loop, the tier cap and the named rungs.
 */
export function romeSolveLegacy(board: RomeBoard, maxdiff: number): number {
  const s = board.w * board.h;
  const scratch = newValidateScratch(s);
  const { dsf, sets } = scratch;
  initCandidates(board);

  const members = regionMembers(board);
  const singles = new Int32Array(s);
  const doubles = new Int32Array(s);
  const maxIterations = 5 * s + 16;
  let status = STATUS_INCOMPLETE;

  for (let iteration = 0; ; iteration++) {
    if (iteration > maxIterations) throw new Error("rome: solver did not converge");

    status = validateGame(board, false, scratch);
    if (status !== STATUS_INCOMPLETE) break;

    if (solverSingle(board, null)) continue;
    if (solverDoubles(board, sets, null)) continue;
    if (solverLoops(board, dsf, null)) continue;

    if (maxdiff < DIFF_NORMAL) break;

    if (find4Position(board, singles, doubles, members, null)) continue;
    if (nakedPairs(board, members, null)) continue;
    if (solverExpand(board, dsf, null)) continue;

    if (maxdiff < DIFF_TRICKY) break;

    if (solverOpposites(board, null)) continue;

    break;
  }

  return status;
}

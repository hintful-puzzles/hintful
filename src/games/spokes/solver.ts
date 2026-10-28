/**
 * Spokes — the tiered deductive solver and the connectivity validator.
 *
 * Port of `spokes_solve` and friends from `puzzles/unreleased/spokes.c`. The
 * solver runs a fixpoint of four rules, gated by a difficulty tier:
 *
 * - {@link spokesSolverOnes} — a spoke joining two clue-`1` hubs would strand
 *   that pair, so mark it. A one-shot pre-pass, run once per solve.
 * - {@link spokesSolverFull} — hub saturation and exhaustion: if every
 *   remaining spoke must be a line, draw them all; if the clue is already
 *   satisfied, mark the rest.
 * - {@link spokesSolverDiagonal} — mark the diagonal that would cross an
 *   existing diagonal line in the same cell corner.
 * - {@link findBreaks} (Normal) — a Check: a hub's value is which of its
 *   spokes are lines, so one spoke tried as a line, with the hubs it fills
 *   taking no more, or ruled out, with the hub it leaves no spare spoke
 *   drawing the rest, is one value placed and looked at once. Where the board
 *   breaks, the spoke takes the other state (docs/solver-and-generator.md
 *   § "Check, Tactic, Search"). It replaced upstream's look-ahead capped at
 *   four deductions on 2026-10-28: at every stall measured, that walk was at
 *   most one deduction long, and the one was this value's.
 * - {@link spokesSolverAttempt} (Unreasonable) — contradiction look-ahead: try
 *   a spoke both ways, solve on from it with no bound, and if one way proves
 *   invalid, commit the other. That is a Search, and it is why the tier
 *   upstream calls `Hard` is named `Unreasonable` here.
 *
 * Validity is decided by counting lines/marks per hub, rejecting crossing
 * diagonals, and — over a `Dsf` of the line-connected hubs, plus a per-class
 * count of the lines still drawable out of it — rejecting a closed-off set
 * that can never reach the rest of the board.
 */

import {
  type FindingRung,
  findingTechniques,
  runDeductionFixpoint,
  singleFirings,
} from "../../engine/deduction-fixpoint.ts";
import { Dsf } from "../../engine/dsf.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import {
  cloneBoard,
  copyBoard,
  DIFF_EASY,
  DIFF_HARD,
  DIFF_TRICKY,
  DIR_BOTLEFT,
  DIR_BOTRIGHT,
  getSpoke,
  SPOKE_DIRS,
  SPOKE_EMPTY,
  SPOKE_LINE,
  SPOKE_MARKED,
  type SpokesBoard,
  type SpokesSpokeRef,
  spokeCounts,
  spokesCount,
  spokesPlace,
  syncDiagonalBlock,
} from "./state.ts";

/** Upstream's `STATUS_INVALID` / `STATUS_INCOMPLETE` / `STATUS_VALID`. */
export type SpokesStatus = "invalid" | "incomplete" | "valid";

/** The solver's reusable scratch (upstream `struct spokes_scratch`). */
export class SpokesScratch {
  /** Placeable spokes per hub (8 minus the hidden ones). */
  readonly nodes: Int32Array;
  /** Lines drawn per hub. */
  readonly lines: Int32Array;
  /** Marks placed per hub. */
  readonly marked: Int32Array;
  /** Line-connectivity of the hubs. */
  readonly dsf: Dsf;
  /** Per connected class (indexed by its canonical root), how many more lines
   * the class can still draw out of itself. */
  readonly open: Int32Array;

  constructor(cells: number) {
    this.nodes = new Int32Array(cells);
    this.lines = new Int32Array(cells);
    this.marked = new Int32Array(cells);
    this.dsf = new Dsf(cells);
    this.open = new Int32Array(cells);
  }
}

/**
 * Recount the per-hub tallies and rebuild the connectivity `Dsf`.
 *
 * `full` adds the *diagonal* bonus: a drawn diagonal makes the crossing
 * diagonal unplaceable, so the two hubs at its other corners count one extra
 * mark. Only the renderer asks for that (it decides whether a hub is
 * over-marked); the solve loop deliberately recounts without it, exactly as
 * upstream — `spokes_solver_diagonal` is what turns those into real marks.
 */
export function spokesSolverRecount(
  b: SpokesBoard,
  s: SpokesScratch,
  full: boolean,
): void {
  const { w, h } = b;
  const n = w * h;

  for (let i = 0; i < n; i++) {
    const counts = spokeCounts(b.spokes[i]);
    s.nodes[i] = 8 - (counts & 0xff);
    s.lines[i] = (counts >>> (SPOKE_LINE * 8)) & 0xff;
    s.marked[i] = (counts >>> (SPOKE_MARKED * 8)) & 0xff;
  }

  if (full) {
    for (let y = 0; y < h - 1; y++) {
      for (let x = 0; x < w - 1; x++) {
        const i = y * w + x;
        const hub = b.spokes[i];
        const hub2 = b.spokes[i + 1];
        if (
          getSpoke(hub, DIR_BOTRIGHT) === SPOKE_LINE &&
          getSpoke(hub2, DIR_BOTLEFT) === SPOKE_EMPTY
        ) {
          s.marked[i + 1]++;
          s.marked[i + w]++;
        }
        if (
          getSpoke(hub2, DIR_BOTLEFT) === SPOKE_LINE &&
          getSpoke(hub, DIR_BOTRIGHT) === SPOKE_EMPTY
        ) {
          s.marked[i]++;
          s.marked[i + w + 1]++;
        }
      }
    }
  }

  s.dsf.reinit();

  // Holes are folded into cell 0's class so that "one class of w*h cells"
  // means solved even on a board with holes in it. If cell 0 is *itself* a
  // hole, it first joins the earliest real hub so the class has a hub in it.
  if (!b.numbers[0]) {
    for (let i = 1; i < n; i++) {
      if (b.numbers[i]) {
        s.dsf.merge(i, 0);
        break;
      }
    }
  }

  for (let i = 0; i < n; i++) {
    if (!b.numbers[i]) {
      s.dsf.merge(i, 0);
    } else {
      for (let j = 0; j < 4; j++) {
        const x = (i % w) + SPOKE_DIRS[j].dx;
        const y = ((i / w) | 0) + SPOKE_DIRS[j].dy;
        if (
          x >= 0 &&
          x < w &&
          y >= 0 &&
          y < h &&
          getSpoke(b.spokes[i], j) === SPOKE_LINE
        ) {
          s.dsf.merge(i, y * w + x);
        }
      }
    }
  }
}

/**
 * For each connected class, how many more lines it can draw out of itself:
 * the sum over its hubs of "clue minus lines already drawn". Zero means the
 * class is closed — which is a win if it is the whole board and a dead end
 * otherwise.
 */
export function spokesFindIsolated(b: SpokesBoard, s: SpokesScratch): void {
  const n = b.w * b.h;
  s.open.fill(0);
  for (let i = 0; i < n; i++) {
    s.open[s.dsf.canonify(i)] += b.numbers[i] - s.lines[i];
  }
}

/** Is the board solved, still in progress, or already contradictory? */
export function spokesValidate(b: SpokesBoard, scratch?: SpokesScratch): SpokesStatus {
  const n = b.w * b.h;
  const s = scratch ?? new SpokesScratch(n);

  spokesSolverRecount(b, s, false);

  let ret: SpokesStatus = "valid";

  for (let i = 0; i < n && ret !== "invalid"; i++) {
    if (s.lines[i] < b.numbers[i]) ret = "incomplete";
    // Too many marks to still reach the clue, or too many lines already.
    if (s.marked[i] > s.nodes[i] - b.numbers[i]) ret = "invalid";
    if (s.lines[i] > b.numbers[i]) ret = "invalid";
  }

  for (let i = 0; i < n && ret !== "invalid"; i++) {
    // Crossing diagonals. The `i + 1 < n` guard is ours: upstream reads one
    // past the end, harmlessly, because the last hub's BOTRIGHT is hidden and
    // `&&` stops first.
    if (
      i + 1 < n &&
      getSpoke(b.spokes[i], DIR_BOTRIGHT) === SPOKE_LINE &&
      getSpoke(b.spokes[i + 1], DIR_BOTLEFT) === SPOKE_LINE
    ) {
      ret = "invalid";
    }
  }

  if (ret !== "invalid") {
    spokesFindIsolated(b, s);
    for (let i = 0; i < n && ret !== "invalid"; i++) {
      if (s.open[i] === 0 && s.dsf.canonify(i) === i && s.dsf.size(i) < n) {
        ret = "invalid";
      }
    }
  }

  return ret;
}

// --- deduction rules --------------------------------------------------------

/**
 * Mark every spoke joining two clue-`1` hubs: connecting them would close off
 * a group of two with no way to reach the rest. Skipped when the whole grid is
 * exactly two hubs, where that pair *is* the answer.
 *
 * Faithful quirk: the mark is placed without checking that the spoke is
 * `EMPTY`, so it overwrites a diagonal an `'X'` hole has hidden. Only
 * hand-authored descriptions reach that: the generator never emits `'X'`.
 */
function spokesSolverOnes(b: SpokesBoard): number {
  const { w, h } = b;
  let count = 0;
  for (let i = 0; i < w * h; i++) if (b.numbers[i]) count++;
  if (count === 2) return 0;

  let ret = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (b.numbers[y * w + x] !== 1) continue;
      for (let j = 0; j < 4; j++) {
        const nx = x + SPOKE_DIRS[j].dx;
        const ny = y + SPOKE_DIRS[j].dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        if (b.numbers[ny * w + nx] === 1) {
          spokesPlace(b, y * w + x, j, SPOKE_MARKED);
          ret++;
        }
      }
    }
  }
  return ret;
}

/**
 * Hub saturation and exhaustion. Reads the tallies {@link spokesValidate} last
 * computed and mutates as it sweeps, so later hubs in the same pass see
 * earlier placements but stale counts — faithful to upstream, and harmless
 * because the loop re-runs to a fixpoint.
 */
function spokesSolverFull(b: SpokesBoard, s: SpokesScratch): number {
  const n = b.w * b.h;
  let ret = 0;

  for (let i = 0; i < n; i++) {
    let changed = false;

    // Every placeable spoke that isn't marked must be a line.
    if (s.nodes[i] - s.marked[i] === b.numbers[i]) {
      for (let j = 0; j < 8; j++) {
        if (getSpoke(b.spokes[i], j) === SPOKE_EMPTY) {
          spokesPlace(b, i, j, SPOKE_LINE);
          changed = true;
        }
      }
    }

    // The clue is already satisfied, so nothing else can be a line.
    if (s.lines[i] === b.numbers[i]) {
      for (let j = 0; j < 8; j++) {
        if (getSpoke(b.spokes[i], j) === SPOKE_EMPTY) {
          spokesPlace(b, i, j, SPOKE_MARKED);
          changed = true;
        }
      }
    }

    if (changed) ret++;
  }

  return ret;
}

/** Mark the empty diagonal that would cross a drawn diagonal. */
function spokesSolverDiagonal(b: SpokesBoard): number {
  const { w, h } = b;
  let ret = 0;
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w - 1; x++) {
      const i = y * w + x;
      if (
        getSpoke(b.spokes[i], DIR_BOTRIGHT) === SPOKE_LINE &&
        getSpoke(b.spokes[i + 1], DIR_BOTLEFT) === SPOKE_EMPTY
      ) {
        spokesPlace(b, i + 1, DIR_BOTLEFT, SPOKE_MARKED);
        ret++;
      }
      if (
        getSpoke(b.spokes[i], DIR_BOTRIGHT) === SPOKE_EMPTY &&
        getSpoke(b.spokes[i + 1], DIR_BOTLEFT) === SPOKE_LINE
      ) {
        spokesPlace(b, i, DIR_BOTRIGHT, SPOKE_MARKED);
        ret++;
      }
    }
  }
  return ret ? 1 : 0;
}

/**
 * Contradiction look-ahead. For every undecided spoke, try it as a mark and as
 * a line; whenever the trial board provably becomes invalid at the (lower)
 * recursion tier, commit the opposite value on the real board.
 *
 * `copy` is a reusable scratch board and `s` the shared scratch — both are
 * clobbered, exactly as upstream, and the recursion tier is below
 * `DIFF_TRICKY`, so the recursive solve never re-enters this function.
 */
function spokesSolverAttempt(
  b: SpokesBoard,
  copy: SpokesBoard,
  s: SpokesScratch,
  diff: number,
): number {
  const n = b.w * b.h;
  let ret = 0;

  for (let i = 0; i < n; i++) {
    for (let dir = 0; dir < 8; dir++) {
      for (let l = 0; l < 2; l++) {
        if (getSpoke(b.spokes[i], dir) !== SPOKE_EMPTY) continue;

        copyBoard(b, copy);
        spokesPlace(copy, i, dir, l ? SPOKE_LINE : SPOKE_MARKED);
        if (spokesSolve(copy, s, diff) === "invalid") {
          spokesPlace(b, i, dir, l ? SPOKE_MARKED : SPOKE_LINE);
          ret++;
        }
      }
    }
  }

  return ret;
}

// --- the recording deduction pass (the hint's second projection) -----------

/** Which rung forced a firing. */
export type SpokesFiringKind = "twoOnes" | "saturation" | "exhaustion" | "breaks";

/** How a trial board is impossible: a hub with more lines than its count, or
 * too few spokes left for it; two diagonals crossing; or hubs walled off from
 * the rest. */
export type SpokesBreakKind = "overfilled" | "starved" | "crossing" | "sealed";

/**
 * One *firing*: one rung reaching one conclusion, with everything the hint
 * needs to narrate and highlight it. `forced` is the spokes it forces (each
 * becomes one leg of a single journey — they share a fate, so a saturated hub's
 * four lines are one hint, not four). `evidenceHubs` are the hubs whose clue or
 * lines are the argument (ringed, and read for their clue value in the prose).
 */
export interface SpokesFiring {
  kind: SpokesFiringKind;
  forced: SpokesSpokeRef[];
  evidenceHubs: number[];
  /** Breaks only: the state tried, whose break forces `forced`. */
  hypothesis?: SpokesSpokeRef;
  /** Breaks only: the hub a rule-out left no spoke to spare, which took all
   * its others, or `null`. */
  filled?: number | null;
  /** Breaks only: how, and where, the tried state breaks the board. */
  breakKind?: SpokesBreakKind;
}

/** Runaway/UX cap on plan length: Normal's Checks try every spoke and a
 * player rarely follows more than a few steps before diverging, so a
 * recompute yields the next batch. */
const HINT_PLAN_MAX = 40;

/** The EMPTY spoke directions of a hub, in `DIR_*` order. */
function emptyDirs(hub: number): number[] {
  const dirs: number[] = [];
  for (let d = 0; d < 8; d++) if (getSpoke(hub, d) === SPOKE_EMPTY) dirs.push(d);
  return dirs;
}

/** Whether a hub still needs more lines than it has drawn. */
function unsatisfied(b: SpokesBoard, i: number): boolean {
  return spokesCount(b.spokes[i], SPOKE_LINE) < b.numbers[i];
}

/**
 * Whether ruling out the spoke `(i, d)` actually advances the puzzle: only when
 * a hub at either end still needs lines. A mark between two satisfied hubs
 * narrows nothing, so it is never hinted. Nor is it ever load-bearing:
 * completion needs only the lines, and a spoke with both ends full feeds no
 * hub's saturation, so skipping it cannot stall the plan.
 */
function markHelps(b: SpokesBoard, i: number, d: number): boolean {
  if (unsatisfied(b, i)) return true;
  const nx = (i % b.w) + SPOKE_DIRS[d].dx;
  const ny = ((i / b.w) | 0) + SPOKE_DIRS[d].dy;
  if (nx < 0 || nx >= b.w || ny < 0 || ny >= b.h) return false;
  const j = ny * b.w + nx;
  return b.numbers[j] > 0 && unsatisfied(b, j);
}

/**
 * The two-ones rung as a firing: the still-EMPTY spoke joining two clue-`1`
 * hubs that **both still need their line**. Connecting them would satisfy both
 * yet seal the pair off, so the spoke is ruled out. Once either hub has its
 * line the pair can no longer connect, so the deduction is moot.
 *
 * Iterating `d < 4` visits each such edge once, from its lower-indexed end.
 * Skipped on a two-hub board, where the pair *is* the answer, as
 * {@link spokesSolverOnes} is.
 */
function* findTwoOnes(b: SpokesBoard): Generator<SpokesFiring> {
  const { w, h } = b;
  let clues = 0;
  for (let i = 0; i < w * h; i++) if (b.numbers[i]) clues++;
  if (clues === 2) return;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (b.numbers[i] !== 1 || !unsatisfied(b, i)) continue;
      for (let d = 0; d < 4; d++) {
        const nx = x + SPOKE_DIRS[d].dx;
        const ny = y + SPOKE_DIRS[d].dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const j = ny * w + nx;
        if (
          b.numbers[j] === 1 &&
          unsatisfied(b, j) &&
          getSpoke(b.spokes[i], d) === SPOKE_EMPTY
        ) {
          yield {
            kind: "twoOnes",
            forced: [{ index: i, dir: d, state: SPOKE_MARKED }],
            evidenceHubs: [i, j],
          };
        }
      }
    }
  }
}

/**
 * Hub saturation: a hub with exactly as many free spokes as the lines it still
 * needs — so every one of them is a line. The connection-drawing rung, and the
 * most direct progress, so it is tried first. Reads the tallies
 * {@link spokesValidate} last left in `s`.
 */
function* findSaturation(b: SpokesBoard, s: SpokesScratch): Generator<SpokesFiring> {
  const n = b.w * b.h;
  for (let i = 0; i < n; i++) {
    if (s.nodes[i] - s.marked[i] === b.numbers[i]) {
      const dirs = emptyDirs(b.spokes[i]);
      if (dirs.length) {
        yield {
          kind: "saturation",
          forced: dirs.map((d) => ({ index: i, dir: d, state: SPOKE_LINE })),
          evidenceHubs: [i],
        };
      }
    }
  }
}

/**
 * Hub exhaustion: a satisfied hub's remaining spokes cannot be lines. Only the
 * ones that reach a hub still needing lines are hinted ({@link markHelps}) — an
 * exhaustion mark onto another finished hub is busywork, and never needed for
 * completion.
 */
function* findExhaustion(b: SpokesBoard, s: SpokesScratch): Generator<SpokesFiring> {
  const n = b.w * b.h;
  for (let i = 0; i < n; i++) {
    if (s.lines[i] !== b.numbers[i]) continue;
    const dirs = emptyDirs(b.spokes[i]).filter((d) => markHelps(b, i, d));
    if (dirs.length) {
      yield {
        kind: "exhaustion",
        forced: dirs.map((d) => ({ index: i, dir: d, state: SPOKE_MARKED })),
        evidenceHubs: [i],
      };
    }
  }
}

/** Classify why an invalid board is impossible, and name the hubs at fault, so
 * a hint can point at the break rather than assert one. */
function analyzeBreak(
  b: SpokesBoard,
  s: SpokesScratch,
): { breakKind: SpokesBreakKind; hubs: number[] } {
  const n = b.w * b.h;
  spokesSolverRecount(b, s, false);

  for (let i = 0; i < n; i++) {
    if (s.lines[i] > b.numbers[i]) return { breakKind: "overfilled", hubs: [i] };
    if (s.marked[i] > s.nodes[i] - b.numbers[i])
      return { breakKind: "starved", hubs: [i] };
  }

  for (let i = 0; i + 1 < n; i++) {
    if (
      getSpoke(b.spokes[i], DIR_BOTRIGHT) === SPOKE_LINE &&
      getSpoke(b.spokes[i + 1], DIR_BOTLEFT) === SPOKE_LINE
    ) {
      return { breakKind: "crossing", hubs: [i, i + 1] };
    }
  }

  spokesFindIsolated(b, s);
  for (let i = 0; i < n; i++) {
    if (s.open[i] === 0 && s.dsf.canonify(i) === i && s.dsf.size(i) < n) {
      const hubs: number[] = [];
      for (let j = 0; j < n; j++) {
        if (b.numbers[j] && s.dsf.canonify(j) === i) hubs.push(j);
      }
      return { breakKind: "sealed", hubs };
    }
  }

  // Unreachable on a genuinely-invalid board, but keep the return total.
  return { breakKind: "sealed", hubs: [] };
}

/** Put `state` on spoke `(i, dir)` of `b`, ruling out the diagonal a line
 * crosses, as a move does. */
function place(b: SpokesBoard, i: number, dir: number, state: number): void {
  const old = getSpoke(b.spokes[i], dir);
  spokesPlace(b, i, dir, state);
  syncDiagonalBlock(b, i, dir, old, state, null);
}

/** The hubs at either end of spoke `(i, dir)`, the off-board end left out. */
function endsOf(b: SpokesBoard, i: number, dir: number): number[] {
  const x = (i % b.w) + SPOKE_DIRS[dir].dx;
  const y = ((i / b.w) | 0) + SPOKE_DIRS[dir].dy;
  return x < 0 || x >= b.w || y < 0 || y >= b.h ? [i] : [i, y * b.w + x];
}

/**
 * What `copy`, a trial board one value has been placed on, breaks at once, or
 * `null`. Nothing follows from the value first: the board is read as it would
 * stand, with what a player rules out there at a glance, which is every free
 * spoke of a hub that has all its lines. The trial board is left read.
 */
function breaksAt(
  copy: SpokesBoard,
  s: SpokesScratch,
): { breakKind: SpokesBreakKind; hubs: number[] } | null {
  spokesSolverRecount(copy, s, false);
  const n = copy.w * copy.h;
  const full: number[] = [];
  for (let i = 0; i < n; i++) if (s.lines[i] === copy.numbers[i]) full.push(i);
  for (const i of full)
    for (const d of emptyDirs(copy.spokes[i])) spokesPlace(copy, i, d, SPOKE_MARKED);
  return spokesValidate(copy, s) === "invalid" ? analyzeBreak(copy, s) : null;
}

/**
 * Normal's rung as firings: each free spoke that breaks the board at once one
 * way, and so takes the other. Tried as a line, the hubs it fills take no more
 * spokes; ruled out, a hub it leaves with no spoke to spare takes all its
 * others, which is that hub's value placed whole. Where the solver commits
 * every firing, `helpful` is off; a hint offers no rule-out that helps no hub.
 */
function* findBreaks(
  b: SpokesBoard,
  copy: SpokesBoard,
  s: SpokesScratch,
  helpful: boolean,
): Generator<SpokesFiring> {
  const n = b.w * b.h;
  for (let i = 0; i < n; i++) {
    for (let dir = 0; dir < 8; dir++) {
      if (getSpoke(b.spokes[i], dir) !== SPOKE_EMPTY) continue;
      // Each edge once, from the end that comes first.
      const ends = endsOf(b, i, dir);
      if (ends.length === 2 && ends[1] < i) continue;
      if (!helpful || markHelps(b, i, dir)) {
        copyBoard(b, copy);
        place(copy, i, dir, SPOKE_LINE);
        const broken = breaksAt(copy, s);
        if (broken) {
          yield {
            kind: "breaks",
            forced: [{ index: i, dir, state: SPOKE_MARKED }],
            hypothesis: { index: i, dir, state: SPOKE_LINE },
            evidenceHubs: broken.hubs,
            breakKind: broken.breakKind,
          };
          continue;
        }
      }
      copyBoard(b, copy);
      place(copy, i, dir, SPOKE_MARKED);
      // A hub this leaves with only as many free spokes as it needs lines.
      spokesSolverRecount(copy, s, false);
      const short = ends.find(
        (h) =>
          copy.numbers[h] > s.lines[h] && s.nodes[h] - s.marked[h] === copy.numbers[h],
      );
      if (short !== undefined)
        for (const d of emptyDirs(copy.spokes[short]))
          place(copy, short, d, SPOKE_LINE);
      const broken = breaksAt(copy, s);
      if (broken)
        yield {
          kind: "breaks",
          forced: [{ index: i, dir, state: SPOKE_LINE }],
          hypothesis: { index: i, dir, state: SPOKE_MARKED },
          filled: short ?? null,
          evidenceHubs: [
            ...new Set([...(short === undefined ? [] : [short]), ...broken.hubs]),
          ],
          breakKind: broken.breakKind,
        };
    }
  }
}

/** Normal's rung for the solver: commit every firing {@link findBreaks}
 * finds, each against the board as the ones before it left it. */
function spokesSolverBreaks(
  b: SpokesBoard,
  copy: SpokesBoard,
  s: SpokesScratch,
): number {
  let ret = 0;
  for (const f of findBreaks(b, copy, s, false)) {
    applyFiring(b, f);
    ret++;
  }
  return ret;
}

/** Apply a firing's forced spokes to a working board (both ends kept in sync),
 * auto-ruling-out the crossing of any diagonal line — exactly as `executeMove`
 * does in the real game, so the plan replay stays consistent without a separate
 * crossing rung. */
function applyFiring(b: SpokesBoard, f: SpokesFiring): void {
  for (const { index, dir, state } of f.forced) {
    const old = getSpoke(b.spokes[index], dir);
    spokesPlace(b, index, dir, state);
    syncDiagonalBlock(b, index, dir, old, state, null);
  }
}

/**
 * The hint's rungs over `b`, **goal-first**: forced connections
 * ({@link findSaturation}), then the genuinely-useful rule-outs (each gated so
 * it only fires when it helps a hub still needing lines), then Normal's
 * Checks. This deliberately reorders the solver's rungs — the hint only
 * needs each firing to be *forced*, not to match the solver's internal order,
 * and among firings beside the plan's work, or with none there, a connection
 * leads. `copy` is the Checks' trial board, and `null` below Normal.
 *
 * **The `Unreasonable` rung is deliberately absent.** `spokesSolve`'s
 * look-ahead solves on from a tried spoke with no bound, and that is a search,
 * not a technique, so no hint narrates it on any tier. The plan therefore stalls where bounded reasoning stalls and `hint`
 * says so, which is the honest answer. The *solver* keeps the rung: the
 * generator grades on it.
 */
function spokesRungs(
  b: SpokesBoard,
  s: SpokesScratch,
  copy: SpokesBoard | null,
): FindingRung<SpokesFiring>[] {
  // The tallies are read afresh: the Checks' trials leave their own in `s`.
  const tallied = (find: () => Iterable<SpokesFiring>) => () => {
    spokesSolverRecount(b, s, false);
    return find();
  };
  return [
    { id: "saturation", tier: 0, find: tallied(() => findSaturation(b, s)) },
    { id: "twoOnes", tier: 0, find: () => findTwoOnes(b) },
    { id: "exhaustion", tier: 0, find: tallied(() => findExhaustion(b, s)) },
    { id: "breaks", tier: 1, find: () => (copy ? findBreaks(b, copy, s, true) : []) },
  ];
}

/** The hubs at either end of a spoke. */
function spokeEnds(b: SpokesBoard, { index, dir }: SpokesSpokeRef): number[] {
  const nx = (index % b.w) + SPOKE_DIRS[dir].dx;
  const ny = ((index / b.w) | 0) + SPOKE_DIRS[dir].dy;
  return nx < 0 || nx >= b.w || ny < 0 || ny >= b.h ? [index] : [index, ny * b.w + nx];
}

/**
 * Replay the solver from the player's board, one firing at a time, returning
 * the ordered plan. Pure on its argument: it clones first.
 *
 * The default is `DIFF_TRICKY`, not the top tier: the hint reasons as hard as it
 * is *allowed* to, and the rung above Normal is a search
 * ({@link spokesRungs}). Passing `DIFF_HARD` changes nothing.
 */
export function deduceSpokesPlan(
  board0: SpokesBoard,
  diff: number = DIFF_TRICKY,
): SpokesFiring[] {
  const b = cloneBoard(board0);
  const s = new SpokesScratch(b.w * b.h);
  const copy = diff >= DIFF_TRICKY ? cloneBoard(b) : null;

  let last: SpokesFiring | null = null;
  const pass = singleFirings({
    techniques: findingTechniques(
      spokesRungs(b, s, copy),
      (f) => {
        applyFiring(b, f);
        last = f;
      },
      // A player follows the hubs: a firing reads the hubs it argues from and
      // the ends of the spokes it decides, and writes those ends.
      {
        reads: (f) => [...f.evidenceHubs, ...f.forced.flatMap((r) => spokeEnds(b, r))],
        writes: (f) => f.forced.flatMap((r) => spokeEnds(b, r)),
      },
    ),
    budget: stepBudget("spokes hint"),
    // A plan works round the hubs it has just joined before it moves on.
    continuing: true,
  });
  return deduceHintPlan<SpokesBoard, SpokesFiring, SpokesStatus>({
    board: b,
    status: (board) => spokesValidate(board, s),
    incomplete: "incomplete",
    next: () => (pass.next() ? last : null),
    planCap: HINT_PLAN_MAX,
  }).plan;
}

// --- the solve loop ---------------------------------------------------------

/**
 * Deduce as far as `diff` allows, mutating `b` in place, and report the
 * resulting status. `"valid"` means the board is fully and uniquely solved:
 * the generator accepts a clue set only while this holds.
 */
export function spokesSolve(
  b: SpokesBoard,
  scratch: SpokesScratch | null,
  diff: number,
): SpokesStatus {
  const s = scratch ?? new SpokesScratch(b.w * b.h);

  spokesSolverOnes(b); // one-shot pre-pass; never a ladder member

  const copy = diff >= DIFF_TRICKY ? cloneBoard(b) : null;

  // The shared ordered technique ladder (`engine/deduction-fixpoint.ts`). This
  // solver reports a *status*, so the runner's grade is unused. `copy` is
  // non-null exactly when diff >= DIFF_TRICKY.
  runDeductionFixpoint({
    techniques: [
      { id: "saturation", tier: DIFF_EASY, run: () => spokesSolverFull(b, s) },
      { id: "crossing-diagonal", tier: DIFF_EASY, run: () => spokesSolverDiagonal(b) },
      {
        id: "breaks",
        tier: DIFF_TRICKY,
        run: () => (copy ? spokesSolverBreaks(b, copy, s) : 0),
      },
      {
        id: "contradiction-unbounded",
        tier: DIFF_HARD,
        run: () => (copy && spokesSolverAttempt(b, copy, s, DIFF_EASY) ? 1 : 0),
      },
    ],
    maxTier: diff,
    settled: () => spokesValidate(b, s) !== "incomplete",
  });

  return spokesValidate(b, s);
}

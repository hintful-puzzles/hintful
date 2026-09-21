/**
 * Magnets' explained hint: the recording projection of [`solver.ts`](./solver.ts).
 *
 * The deduction is entirely the solver's: the same graded ladder, run one
 * firing at a time through `singleFirings` with a recorder standing
 * (docs/games/hints.md § "Recording the deduction", the *threaded* shape). This
 * file turns each firing into a journey of moves the player can make, and the
 * sentence and picture that explain it.
 *
 * **One ladder, not two.** The solver has a second runner call site,
 * `solveUnnumbered`, but it runs only inside the generator while dominoes are
 * being laid, before any clue exists; nothing a player sees is ever at that
 * stage.
 *
 * **A firing is shown only when it changes something the player writes**: a
 * placed domino, or a `?` on one. A firing that sets only the solver's
 * "cannot be + / −" bits advances the working board and is hidden, and that is
 * honest because the board already says it (`reading.ts`); a later step citing
 * it re-derives it from the board, in the board's own terms.
 */

import { singleFirings } from "../../engine/deduction-fixpoint.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import {
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import { type StepBudget, stepBudget } from "../../engine/step-budget.ts";
import { type Axis, type Cause, say } from "./hint-text.ts";
import {
  lineCells,
  lineTarget,
  type NotReason,
  placedIn,
  type ReadableBoard,
  whyNot,
} from "./reading.ts";
import { type MagnetsLine, type MagnetsReason, MagnetsSolver } from "./solver.ts";
import {
  clueIndex,
  executeMove,
  GS_MARK,
  GS_NOTNEUTRAL,
  GS_SET,
  type MagnetsMove,
  type MagnetsState,
  NEGATIVE,
  NEUTRAL,
  opposite,
  POSITIVE,
  ROW,
} from "./state.ts";

/**
 * How far ahead the plan is computed: a UX bound, not a correctness one. A
 * player rarely follows more than a handful of steps before going their own
 * way, and the plan is recomputed then anyway; it also keeps `hint()` cheap
 * enough to call after every move, which the cross-game resume walk does.
 */
const PLAN_CAP = 24;

/** The board a firing read, captured before it changed anything. */
export interface Snapshot extends ReadableBoard {
  readonly grid: Int32Array;
  readonly flags: Int32Array;
}

/** One deduction, and what it decided. */
export interface MagnetsFiring {
  reason: MagnetsReason;
  /** The board as the deduction found it, which is what its sentence cites. */
  before: Snapshot;
  /** One per domino the firing places: the end it is about, and its value. */
  placed: { idx: number; which: number }[];
  /** One per domino the firing marks as a magnet, named by its first square. */
  marked: number[];
}

/**
 * A solver standing where the player stands: every placed domino laid through
 * `set` (so its neighbors lose that pole, as the rules say) and every `?` taken
 * as the fact it records. The hint is asked only of a board `findMistakes`
 * passed, which re-solves and checks both, so none of this can contradict;
 * `null` if it somehow does.
 */
export function seedSolver(state: MagnetsState): MagnetsSolver | null {
  const { w, h, wh, grid, flags, common } = state;
  const solver = new MagnetsSolver(w, h, common);
  for (let i = 0; i < wh; i++) {
    if (common.dominoes[i] === i || !(flags[i] & GS_SET)) continue;
    if (solver.set(i, grid[i]) < 0) return null;
  }
  for (let i = 0; i < wh; i++) {
    if (flags[i] & GS_SET || !(flags[i] & GS_NOTNEUTRAL)) continue;
    if (solver.unflag(i, NEUTRAL) < 0) return null;
  }
  return solver;
}

const snapshot = (s: MagnetsSolver): Snapshot => ({
  w: s.w,
  h: s.h,
  common: s.common,
  grid: Int32Array.from(s.grid),
  flags: Int32Array.from(s.flags),
});

/** The domino's name: its lower-numbered square. */
const dominoOf = (s: ReadableBoard, i: number): number =>
  Math.min(i, s.common.dominoes[i]);

/** Which end of a newly placed domino the firing is about. */
function endOf(s: MagnetsSolver, reason: MagnetsReason, first: number): number {
  const second = s.common.dominoes[first];
  if (reason.kind === "force") {
    if (reason.cell === first || reason.cell === second) return reason.cell;
  } else if ("which" in reason) {
    const { roworcol, num } = reason.line;
    const onLine = (i: number) =>
      roworcol === ROW ? Math.floor(i / s.w) === num : i % s.w === num;
    for (const i of [first, second]) {
      if (onLine(i) && s.grid[i] === reason.which) return i;
    }
  }
  return first;
}

/**
 * The next firing from the solver's board, or `null` when the ladder is
 * exhausted (`impossible` says whether it stopped on a contradiction). Every
 * tier's rungs are tried, easiest first: a shared game ID carries no
 * difficulty, and the ladder restarts from the top after each firing anyway.
 */
export function recordingPass(
  solver: MagnetsSolver,
  budget: StepBudget,
): { next: () => MagnetsFiring | null; impossible: () => boolean } {
  const rec = { reason: null as MagnetsReason | null };
  solver.rec = rec;
  const ladder = singleFirings({
    techniques: solver.ladder(),
    budget,
    beforeTechnique: () => {
      rec.reason = null;
    },
  });

  const next = (): MagnetsFiring | null => {
    const before = snapshot(solver);
    if (!ladder.next()) return null;
    const placed = new Map<number, number>();
    const marked = new Set<number>();
    for (let i = 0; i < solver.wh; i++) {
      // `GS_MARK` is `advancedfull`'s scratch, rewritten whether or not it fires.
      if (((solver.flags[i] ^ before.flags[i]) & ~GS_MARK) === 0) continue;
      const d = dominoOf(solver, i);
      if (solver.flags[i] & GS_SET && !(before.flags[i] & GS_SET)) {
        placed.set(d, d);
      } else if (
        !(solver.flags[i] & GS_SET) &&
        solver.flags[i] & GS_NOTNEUTRAL &&
        !(before.flags[i] & GS_NOTNEUTRAL)
      ) {
        marked.add(d);
      }
    }
    const reason = rec.reason as MagnetsReason | null;
    if (!reason) throw new Error("magnets hint: a firing recorded no premise");
    return {
      reason,
      before,
      placed: [...placed.keys()].map((d) => {
        const idx = endOf(solver, reason, d);
        return { idx, which: solver.grid[idx] };
      }),
      marked: [...marked],
    };
  };

  return { next, impossible: ladder.impossible };
}

// --- narration ------------------------------------------------------------

/** What one step marks, in three roles (docs/games/hints.md § "The
 * element-type color legend"). */
export interface MagnetsHighlights {
  /** Squares the step decides: ringed in the action color. */
  targets: number[];
  /** Squares the deduction reasons from: outlined in the evidence color. */
  area: number[];
  /** Clue digits it counts with, as `countsDone` ring indices. */
  clues: number[];
}

const axisOf = (line: MagnetsLine): Axis => (line.roworcol === ROW ? "row" : "column");

/** The ring index of a line's clue for `pole` (+ top/left, − bottom/right). */
function clueOf(b: ReadableBoard, line: MagnetsLine, pole: number): number {
  const edge = pole === POSITIVE ? -1 : line.roworcol === ROW ? b.w : b.h;
  return line.roworcol === ROW
    ? clueIndex(b.w, b.h, edge, line.num)
    : clueIndex(b.w, b.h, line.num, edge);
}

/** A board reason in the sentence's terms. */
function causeOf(r: NotReason): Cause {
  if (r.kind === "partner") return causeOf(r.inner);
  if (r.kind === "touch") return { kind: "touch" };
  return {
    kind: "full",
    axis: axisOf(r.line),
    line: r.line.num,
    marked: r.magnets.length > 0,
  };
}

/** What a board reason points at: the pole it touches, or the met line and
 * its clue. */
function evidenceOf(
  b: ReadableBoard,
  r: NotReason,
  pole: number,
): { area: number[]; clues: number[] } {
  if (r.kind === "touch") return { area: [r.at], clues: [] };
  if (r.kind === "partner") {
    const inner = evidenceOf(b, r.inner, opposite(pole));
    return { area: [r.at, ...inner.area], clues: inner.clues };
  }
  return { area: lineCells(b, r.line), clues: [clueOf(b, r.line, pole)] };
}

/** The board says so, or the deduction is unsound: a firing's premises are
 * all readable (`magnets-reading.test.ts`). */
function mustRead(b: ReadableBoard, i: number, pole: number): NotReason {
  const r = whyNot(b, i, pole);
  if (!r)
    throw new Error(`magnets hint: square ${i} lost its reason not to be ${pole}`);
  return r;
}

/** A pole ruled out of one end of the domino, from either end's own facts. */
interface EndFact {
  end: number;
  pole: number;
  cause: Cause;
}

function endFact(i: number, pole: number, r: NotReason): EndFact {
  return r.kind === "partner"
    ? { end: r.at, pole: opposite(pole), cause: causeOf(r) }
    : { end: i, pole, cause: causeOf(r) };
}

interface Told {
  text: string;
  area: number[];
  clues: number[];
}

/** A square forced by the two poles (or the pole and the neutral) its board
 * rules out. `value` is what it becomes. */
function tellForce(b: ReadableBoard, cell: number, value: number): Told {
  const partner = b.common.dominoes[cell];
  if (value !== NEUTRAL) {
    // A marked magnet with one pole ruled out of this end.
    const banned = opposite(value);
    const r = mustRead(b, cell, banned);
    const ev = evidenceOf(b, r, banned);
    const text =
      r.kind === "partner"
        ? say.magnetThere(value, causeOf(r))
        : say.magnetHere(banned, causeOf(r));
    return { text, area: [partner, ...ev.area], clues: ev.clues };
  }
  const rp = mustRead(b, cell, POSITIVE);
  const rm = mustRead(b, cell, NEGATIVE);
  const plus = endFact(cell, POSITIVE, rp);
  const minus = endFact(cell, NEGATIVE, rm);
  const ep = evidenceOf(b, rp, POSITIVE);
  const em = evidenceOf(b, rm, NEGATIVE);
  const area = [...ep.area, ...em.area];
  const clues = [...ep.clues, ...em.clues];
  if (plus.end === minus.end) {
    return { text: say.oneEndNeither(plus.cause, minus.cause), area, clues };
  }
  // Different ends, so the same pole is ruled out of both.
  const { pole } = plus;
  const [a, b2] = [plus.cause, minus.cause];
  let text: string;
  if (a.kind === "touch" && b2.kind === "touch") text = say.bothEndsTouch(pole);
  else if (a.kind === "full" && b2.kind === "full" && a.axis === b2.axis) {
    text = a.line === b2.line ? say.alongFull(pole, a) : say.bothInFull(pole, a, b2);
  } else text = say.neitherEnd(pole, a, b2);
  return { text, area, clues };
}

/** Both clue digits of a line, for a premise about its neutral squares. */
const bothClues = (b: ReadableBoard, line: MagnetsLine): number[] =>
  [POSITIVE, NEGATIVE]
    .filter((pole) => lineTarget(b, line, pole) >= 0)
    .map((pole) => clueOf(b, line, pole));

/** How many more `pole`s the line needs, on the board the firing read. */
const needed = (b: ReadableBoard, line: MagnetsLine, pole: number): number =>
  lineTarget(b, line, pole) - placedIn(b, line, pole);

/** The sentence, evidence and clues of a firing's premise. */
function tell(f: MagnetsFiring, targets: number[]): Told {
  const b = f.before;
  const r = f.reason;
  if (r.kind === "force") return tellForce(b, r.cell, f.placed[0].which);
  const onTargets = new Set(targets);
  const area = lineCells(b, r.line).filter((i) => !onTargets.has(i));
  const axis = axisOf(r.line);
  switch (r.kind) {
    case "lineFull":
      // Only the neutral arm is ever shown: the ± arms set bits the board
      // already says (see the module doc).
      return { text: say.polesEverywhere(axis), area, clues: bothClues(b, r.line) };
    case "lineExact":
      if (r.which === NEUTRAL) {
        // With no marked magnet in the line to set aside, "only these aren't
        // in marked magnets" would cite marks that are not there.
        const empty = lineCells(b, r.line).filter((i) => !(b.flags[i] & GS_SET));
        return {
          text:
            empty.length === targets.length
              ? say.noPolesLeft(axis)
              : say.neutralExact(axis, targets.length),
          area,
          clues: bothClues(b, r.line),
        };
      }
      return {
        text: say.lineExact(axis, r.which, needed(b, r.line, r.which)),
        area,
        clues: [clueOf(b, r.line, r.which)],
      };
    case "oneNeutralLeft":
      return {
        text: say.oneNeutralLeft(axis, f.marked.length),
        area,
        clues: bothClues(b, r.line),
      };
    case "everyDominoNeeded":
      return {
        text: say.everyDominoNeeded(axis, r.which, needed(b, r.line, r.which)),
        area,
        clues: [clueOf(b, r.line, r.which)],
      };
    case "oddGap":
      return { text: say.oddGap(axis, r.which), area, clues: bothClues(b, r.line) };
    case "onlyEndLeft":
      return {
        text: say.onlyEndLeft(axis, r.which, needed(b, r.line, r.which)),
        area,
        clues: [clueOf(b, r.line, r.which)],
      };
    case "magnetsFill":
      throw new Error("magnets hint: a hidden premise reached narration");
  }
}

// --- the plan -------------------------------------------------------------

/** One leg of a firing's journey: a domino, and the squares of it the
 * sentence is about. */
interface Leg {
  move: MagnetsMove;
  squares: number[];
}

/** The legs of one firing: one per domino it decides or marks. */
function legsOf(f: MagnetsFiring): Leg[] {
  const b = f.before;
  const r = f.reason;
  const both = (i: number) => [i, b.common.dominoes[i]];
  // A line premise is about the squares on its line; a forced magnet end about
  // that end; a neutral domino or a marked magnet about both ends.
  const onLine = (i: number): number[] => {
    if (r.kind === "force") return [i];
    const cells = new Set(lineCells(b, r.line));
    return both(i).filter((c) => cells.has(c));
  };
  if (f.marked.length > 0) {
    return f.marked.map((d) => ({
      move: { type: "flag", idx: d, mode: "notneutral" },
      squares: both(d),
    }));
  }
  return f.placed.map(({ idx, which }) => ({
    move:
      which === NEUTRAL
        ? { type: "flag", idx, mode: "neutral" }
        : { type: "set", idx, which },
    squares: which === NEUTRAL && r.kind === "force" ? both(idx) : onLine(idx),
  }));
}

/** A firing as the journey the player is shown: one leg per domino, every leg
 * speaking the firing's one sentence, the rings shrinking as legs are done. */
function stepsOf(f: MagnetsFiring): HintStep<MagnetsMove, MagnetsHighlights>[] {
  const legs = legsOf(f);
  const told = tell(
    f,
    legs.flatMap((l) => l.squares),
  );
  const clues = [...new Set(told.clues)];
  return legs.map((leg, k) => {
    // A leg already done is part of what the sentence counts, so it rejoins
    // the evidence rather than vanishing from the picture.
    const targets = legs.slice(k).flatMap((l) => l.squares);
    const onTargets = new Set(targets);
    const area = [...new Set(told.area), ...legs.slice(0, k).flatMap((l) => l.squares)];
    return {
      move: leg.move,
      explanation: told.text,
      highlights: {
        targets,
        area: [...new Set(area)].filter((i) => !onTargets.has(i)),
        clues,
      },
      ...(k > 0 ? { continuesPrevious: true } : {}),
    };
  });
}

const allSet = (s: MagnetsSolver): boolean => {
  for (let i = 0; i < s.wh; i++) if (!(s.flags[i] & GS_SET)) return false;
  return true;
};

/** Deduce the plan from the player's board. The refusals every deductive hint
 * owes come first, in `index.ts`. */
export function magnetsHint(
  state: MagnetsState,
):
  | { ok: true; steps: HintStep<MagnetsMove, MagnetsHighlights>[] }
  | { ok: false; error: string } {
  const solver = seedSolver(state);
  if (!solver) return { ok: false, error: PUZZLE_NOT_REASONABLE };
  const pass = recordingPass(solver, stepBudget("magnets hint"));
  const { plan } = deduceHintPlan<MagnetsSolver, MagnetsFiring, string>({
    board: solver,
    status: (s) => (pass.impossible() ? "broken" : allSet(s) ? "done" : "open"),
    incomplete: "open",
    next: () => pass.next(),
    showable: (_, f) => f.placed.length > 0 || f.marked.length > 0,
    planCap: PLAN_CAP,
  });
  // A contradiction on a board `findMistakes` called clean would mean the
  // deduction is unsound, not that the player went wrong.
  if (pass.impossible()) return { ok: false, error: PUZZLE_NOT_REASONABLE };
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  return { ok: true, steps: plan.flatMap(stepsOf) };
}

// --- following the plan ---------------------------------------------------

/** What a domino holds, from the end `i`: `+`/`−`/neutral when placed, `?`
 * when marked, otherwise empty. The set bit is read first because neutral and
 * empty are the same grid value. */
function holds(s: MagnetsState, i: number): string {
  if (s.flags[i] & GS_SET) return `set${s.grid[i]}`;
  return s.flags[i] & GS_NOTNEUTRAL ? "marked" : "empty";
}

/** What the step's move leaves at its square. */
function goalOf(m: MagnetsMove): string {
  if (m.type === "set") return `set${m.which}`;
  if (m.type === "flag") {
    if (m.mode === "neutral") return `set${NEUTRAL}`;
    return m.mode === "notneutral" ? "marked" : "empty";
  }
  return "";
}

/**
 * Classify a player move against the displayed leg.
 *
 * Magnets' input is a cycle, so the move a leg asks for is often two presses
 * away: a − is placed through a + (or by pressing the other end once), and a
 * `?` through neutral. The press on the way is `"onTrack"`, which holds the
 * leg, and the press that lands it is `"completed"`. A clue's done-gray changes
 * no square and holds the leg too; anything else on another domino, or a value
 * that is on no way to the leg's, is `"off"`.
 */
export function magnetsKeepTrack(
  m: MagnetsMove,
  step: HintStep<MagnetsMove>,
  state: MagnetsState,
): HintTrackVerdict {
  if (m.type === "clue") return "onTrack";
  if (m.type === "solve" || step.move.type === "clue" || step.move.type === "solve") {
    return "off";
  }
  const at = step.move.idx;
  const { dominoes } = state.common;
  if (m.idx !== at && m.idx !== dominoes[at]) return "off";
  const now = holds(executeMove(state, m), at);
  const goal = goalOf(step.move);
  if (now === goal) return "completed";
  // One press short of the goal on the same domino's cycle.
  const onTheWay =
    step.move.type === "set"
      ? now === `set${opposite(step.move.which)}`
      : goal === "marked" && now === `set${NEUTRAL}`;
  return onTheWay ? "onTrack" : "off";
}

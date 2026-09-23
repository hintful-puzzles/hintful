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
import { type Axis, type Cause, type RuleOut, say } from "./hint-text.ts";
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
  /** Squares the deduction reasons from: outlined in the evidence color, one
   * outline per domino. */
  area: number[];
  /** The clue digits of the line it counts, as `countsDone` ring indices: the
   * action color. */
  clues: number[];
  /** Clue digits cited as a reason, a met line's count: the evidence color. */
  reasonClues: number[];
  /** The row or column the sentence calls "this row" or "this column",
   * hatched with its clues; `null` when the sentence is about a domino. */
  line: MagnetsLine | null;
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

/** What a board reason points at: the pole it touches, or the met line's clue.
 * A met line is a reason, never "this row", so it is its clue that is marked
 * and the hatch is left to the line the sentence counts. */
function evidenceOf(
  b: ReadableBoard,
  r: NotReason,
  pole: number,
): { area: number[]; reasonClues: number[]; lines: MagnetsLine[] } {
  if (r.kind === "touch") return { area: [r.at], reasonClues: [], lines: [] };
  if (r.kind === "partner") {
    const inner = evidenceOf(b, r.inner, opposite(pole));
    return { ...inner, area: [r.at, ...inner.area] };
  }
  return { area: [], reasonClues: [clueOf(b, r.line, pole)], lines: [r.line] };
}

/**
 * A domino's sentence names a met line only as "its row" or "its column", so
 * when exactly one line is named it is the line the sentence is about, and it
 * is hatched with its clue as the count read. Two lines named leave both as
 * reasons, marked by their clues: a hatch means one line.
 */
function namedLine(
  lines: readonly MagnetsLine[],
  reasonClues: readonly number[],
): Pick<Told, "line" | "clues" | "reasonClues"> {
  const distinct = [
    ...new Map(lines.map((l) => [`${l.roworcol}:${l.num}`, l])).values(),
  ];
  if (distinct.length !== 1) return { clues: [], reasonClues: [...reasonClues] };
  return { line: distinct[0], clues: [...reasonClues], reasonClues: [] };
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
  /** The clue digits of the line the sentence counts. */
  clues: number[];
  /** The row or column the sentence calls "this row" or "this column". */
  line?: MagnetsLine;
  /** Clue digits the premise cites as a reason: a met line's count. */
  reasonClues?: number[];
  /** Later legs' squares that the board as this leg finds it does not force
   * yet, so this step leaves them unringed. */
  notYet?: number[];
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
    return {
      text,
      area: [partner, ...ev.area],
      ...namedLine(ev.lines, ev.reasonClues),
    };
  }
  const rp = mustRead(b, cell, POSITIVE);
  const rm = mustRead(b, cell, NEGATIVE);
  const plus = endFact(cell, POSITIVE, rp);
  const minus = endFact(cell, NEGATIVE, rm);
  const ep = evidenceOf(b, rp, POSITIVE);
  const em = evidenceOf(b, rm, NEGATIVE);
  const area = [...ep.area, ...em.area];
  const named = namedLine(
    [...ep.lines, ...em.lines],
    [...ep.reasonClues, ...em.reasonClues],
  );
  if (plus.end === minus.end) {
    // Each fact is about the pole it names at that end, which is the opposite
    // of the one asked about when it was read through the partner.
    const [atPlus, atMinus] = plus.pole === POSITIVE ? [plus, minus] : [minus, plus];
    return {
      text: say.oneEndNeither(atPlus.cause, atMinus.cause),
      area,
      ...named,
    };
  }
  // Different ends, so the same pole is ruled out of both.
  const { pole } = plus;
  const [a, b2] = [plus.cause, minus.cause];
  let text: string;
  if (a.kind === "touch" && b2.kind === "touch") text = say.bothEndsTouch(pole);
  else if (a.kind === "full" && b2.kind === "full" && a.axis === b2.axis) {
    text = a.line === b2.line ? say.alongFull(pole, a) : say.bothInFull(pole, a, b2);
  } else text = say.neitherEnd(pole, a, b2);
  return { text, area, ...named };
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
  // The line itself is the hatch; the outline is kept for the squares a
  // sentence singles out within it.
  const { line } = r;
  const axis = axisOf(line);
  switch (r.kind) {
    case "lineFull":
      // Only the neutral arm is ever shown: the ± arms set bits the board
      // already says (see the module doc).
      return {
        text: say.polesEverywhere(axis),
        area: [],
        clues: bothClues(b, line),
        line,
      };
    case "lineExact":
      if (r.which === NEUTRAL) {
        // With no marked magnet in the line to set aside, "only these aren't
        // in marked magnets" would cite marks that are not there.
        const empty = lineCells(b, line).filter((i) => !(b.flags[i] & GS_SET));
        const onTargets = new Set(targets);
        return {
          text:
            empty.length === targets.length
              ? say.noPolesLeft(axis)
              : say.neutralExact(axis, targets.length),
          area: empty.filter((i) => !onTargets.has(i)),
          clues: bothClues(b, line),
          line,
        };
      }
      throw new Error("magnets hint: a count premise is told leg by leg");
    case "oneNeutralLeft":
      return {
        text: say.oneNeutralLeft(axis, f.marked.length),
        area: [],
        clues: bothClues(b, line),
        line,
      };
    case "everyDominoNeeded":
      return {
        text: say.everyDominoNeeded(axis, r.which, needed(b, line, r.which)),
        area: [],
        clues: [clueOf(b, line, r.which)],
        line,
      };
    case "oddGap":
      return {
        text: say.oddGap(axis, r.which),
        area: [],
        clues: bothClues(b, line),
        line,
      };
    case "onlyEndLeft":
      throw new Error("magnets hint: a count premise is told leg by leg");
    case "magnetsFill":
      throw new Error("magnets hint: a hidden premise reached narration");
  }
}

/** A premise that counts the squares of a line still able to take its pole:
 * the only two whose sentence rests on squares being ruled out. */
type CountReason = Extract<MagnetsReason, { kind: "lineExact" | "onlyEndLeft" }>;

function countPremise(r: MagnetsReason): r is CountReason {
  return r.kind === "onlyEndLeft" || (r.kind === "lineExact" && r.which !== NEUTRAL);
}

/** A board reason as the thing the pole at the square would do. */
function ruleOutOf(r: NotReason, counted: MagnetsLine): RuleOut {
  if (r.kind === "touch") return { kind: "touch" };
  if (r.kind === "full") return { kind: "full", axis: axisOf(r.line) };
  if (r.inner.kind === "touch") return { kind: "partnerTouch" };
  if (r.inner.kind === "full") {
    const { line } = r.inner;
    // The other end is next to this square, so a parallel line that is not
    // the counted one is the one beside it.
    const place =
      line.roworcol !== counted.roworcol
        ? "across"
        : line.num === counted.num
          ? "same"
          : "beside";
    return { kind: "partnerFull", axis: axisOf(line), place };
  }
  throw new Error("magnets hint: a partner's reason is its own square's");
}

/** The board a leg reads: `b` with every earlier leg's domino placed. */
function withLegs(b: ReadableBoard, legs: readonly Leg[]): ReadableBoard {
  const grid = Array.from(b.grid);
  const flags = Array.from(b.flags);
  for (const { move } of legs) {
    if (move.type !== "set") throw new Error("magnets hint: a count leg places a pole");
    const j = b.common.dominoes[move.idx];
    grid[move.idx] = move.which;
    grid[j] = opposite(move.which);
    flags[move.idx] |= GS_SET;
    flags[j] |= GS_SET;
  }
  return { ...b, grid, flags };
}

/**
 * Each leg of a count premise, told with why the line's other squares cannot
 * take its pole. The reasons are read off the board the firing found, where
 * the count was taken; a domino lying along the line gives its far end's
 * reason off the board as its own leg finds it, because the solver places a
 * firing's dominoes in one sweep and an earlier leg's pole can be what rules
 * that end out.
 */
function tellCount(
  f: MagnetsFiring,
  r: CountReason,
  legs: readonly Leg[],
): (k: number) => Told {
  const b = f.before;
  const pole = r.which;
  const cells = lineCells(b, r.line);
  const onLine = new Set(cells);
  const legSquares = new Set(
    legs.map((l) => (l.move.type === "set" ? l.move.idx : -1)),
  );
  const elsewhere: RuleOut[] = [];
  const area: number[] = [];
  const clues = [clueOf(b, r.line, pole)];
  const reasonClues: number[] = [];
  for (const i of cells) {
    if (b.flags[i] & GS_SET || legSquares.has(i)) continue;
    // In `onlyEndLeft`, a square still able to take the pole, or the far end
    // of a domino that still can, belongs to a domino the sentence counts.
    const why = whyNot(b, i, pole);
    if (!why) {
      if (r.kind === "onlyEndLeft") continue;
      throw new Error(
        `magnets hint: square ${i} can take the pole its line counts out`,
      );
    }
    const j = b.common.dominoes[i];
    if (
      r.kind === "onlyEndLeft" &&
      onLine.has(j) &&
      !(b.flags[j] & GS_SET) &&
      !whyNot(b, j, pole)
    ) {
      continue;
    }
    const ev = evidenceOf(b, why, pole);
    elsewhere.push(ruleOutOf(why, r.line));
    area.push(i, ...ev.area);
    reasonClues.push(...ev.reasonClues);
  }
  const { line } = r;
  const axis = axisOf(r.line);
  const idxOf = (leg: Leg): number => {
    if (leg.move.type !== "set")
      throw new Error("magnets hint: a count leg places a pole");
    return leg.move.idx;
  };
  /** The far end of the domino at `idx`, as `board` has it: off the line, still
   * able to take the pole, or ruled out of it and why. */
  type FarEnd =
    | { kind: "crosses" }
    | { kind: "open" }
    | { kind: "ruled"; why: NotReason };
  const farEnd = (board: ReadableBoard, idx: number): FarEnd => {
    const j = b.common.dominoes[idx];
    if (!onLine.has(j)) return { kind: "crosses" };
    const why = whyNot(board, j, pole);
    return why ? { kind: "ruled", why } : { kind: "open" };
  };
  return (k: number): Told => {
    // Each leg that lands gives the line one pole and takes one square (or
    // domino) out of those that can, so the count is the board's as it stands.
    const board = withLegs(b, legs.slice(0, k));
    const n = needed(board, r.line, pole);
    if (r.kind === "lineExact") {
      return {
        text: say.lineExact(axis, pole, n, elsewhere),
        area,
        clues,
        line,
        reasonClues,
      };
    }
    const notYet = legs
      .slice(k + 1)
      .filter((l) => farEnd(board, idxOf(l)).kind === "open")
      .map(idxOf);
    const idx = idxOf(legs[k]);
    const end = farEnd(board, idx);
    if (end.kind === "open") {
      throw new Error(`magnets hint: square ${idx} has lost its reason to be the end`);
    }
    if (end.kind === "crosses") {
      return {
        text: say.onlyEndLeft(axis, pole, n, elsewhere, null),
        area,
        clues,
        line,
        reasonClues,
        notYet,
      };
    }
    const j = b.common.dominoes[idx];
    const ev = evidenceOf(board, end.why, pole);
    return {
      text: say.onlyEndLeft(axis, pole, n, elsewhere, ruleOutOf(end.why, r.line)),
      area: [...area, j, ...ev.area],
      clues,
      line,
      reasonClues: [...reasonClues, ...ev.reasonClues],
      notYet,
    };
  };
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
  // A count premise is about the one square that takes the line's pole.
  const squaresOf = (idx: number, which: number): number[] => {
    if (countPremise(r)) return [idx];
    return which === NEUTRAL && r.kind === "force" ? both(idx) : onLine(idx);
  };
  return f.placed.map(({ idx, which }) => ({
    move:
      which === NEUTRAL
        ? { type: "flag", idx, mode: "neutral" }
        : { type: "set", idx, which },
    squares: squaresOf(idx, which),
  }));
}

/** A firing as the journey the player is shown: one leg per domino, every leg
 * speaking the firing's one sentence, the rings shrinking as legs are done. */
function stepsOf(f: MagnetsFiring): HintStep<MagnetsMove, MagnetsHighlights>[] {
  const legs = legsOf(f);
  const r = f.reason;
  let toldLeg: (k: number) => Told;
  if (countPremise(r)) toldLeg = tellCount(f, r, legs);
  else {
    const told = tell(
      f,
      legs.flatMap((l) => l.squares),
    );
    toldLeg = () => told;
  }
  return legs.map((leg, k) => {
    const told = toldLeg(k);
    // A leg already done is part of what the sentence counts, so it rejoins
    // the evidence rather than vanishing from the picture.
    const notYet = new Set(told.notYet);
    const targets = legs
      .slice(k)
      .flatMap((l) => l.squares)
      .filter((i) => !notYet.has(i));
    const onTargets = new Set(targets);
    const area = [...told.area, ...legs.slice(0, k).flatMap((l) => l.squares)];
    return {
      move: leg.move,
      explanation: told.text,
      highlights: {
        targets,
        area: [...new Set(area)].filter((i) => !onTargets.has(i)),
        clues: [...new Set(told.clues)],
        reasonClues: [...new Set(told.reasonClues)],
        line: told.line ?? null,
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

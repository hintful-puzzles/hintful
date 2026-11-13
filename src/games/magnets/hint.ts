/**
 * Magnets' explained hint: the compiled ladder of [`solver.ts`](./solver.ts),
 * walked one firing at a time (`ladderWalk`). This file turns each firing
 * into a journey of moves the player can make, and the sentence and picture
 * that explain it.
 *
 * **A firing is shown only when it changes something the player writes**: a
 * placed domino, or a `?` on one. A firing that sets only the solver's
 * "cannot be + / −" bits advances the working board and is hidden, and that is
 * honest because the board already says it (`reading.ts`); a later step citing
 * it re-derives it from the board, in the board's own terms.
 */

import { describedEdgeHint, type Fired } from "../../engine/described-edge-hint.ts";
import { spokenOf } from "../../engine/described-hint.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import {
  type CellMarks,
  type Ladder,
  ladderWalk,
  type Taken,
  TIERS,
} from "../../engine/ladder-runtime.ts";
import type { StepBudget } from "../../engine/step-budget.ts";
import {
  type Axis,
  type Cause,
  type LineMarks,
  type RuleOut,
  SQUARE,
  say,
} from "./hint-text.ts";
import * as magnets from "./magnets.compiled.ts";
import {
  lineCells,
  lineTarget,
  type NotReason,
  placedIn,
  type ReadableBoard,
  whyNot,
} from "./reading.ts";
import {
  cellValue,
  dealtOf,
  type MagnetsLine,
  type MagnetsReason,
  magnetsLadder,
  magnetsMarks,
  magnetsSpace,
  placedValues,
  reasonOf,
  whichOf,
} from "./solver.ts";
import {
  clueIndex,
  DIFF_TRICKY,
  executeMove,
  GS_NOTNEUTRAL,
  GS_SET,
  type MagnetsCommon,
  type MagnetsMove,
  type MagnetsState,
  NEGATIVE,
  NEUTRAL,
  notFlag,
  opposite,
  POSITIVE,
  ROW,
} from "./state.ts";

/**
 * How many steps ahead the plan is computed: a UX bound, not a correctness
 * one. A player rarely follows more than a handful of steps before going their
 * own way, and the plan is recomputed then anyway; it also keeps `hint()` cheap
 * enough to call after every move, which the cross-game resume walk does.
 */
const PLAN_CAP = 24;

/** The board a firing read, captured before it changed anything. */
export interface Snapshot extends ReadableBoard {
  readonly grid: Int32Array;
  readonly flags: Int32Array;
}

/** One deduction, and what it decided, as the sentences read it. */
interface MagnetsFiring {
  reason: MagnetsReason;
  /** The board as the deduction found it, which is what its sentence cites. */
  before: Snapshot;
  /** One per domino the firing places: the end it is about, and its value. */
  placed: { idx: number; which: number }[];
  /** One per domino the firing marks as a magnet, named by its first square. */
  marked: number[];
}

/** The compiled ladder's marks where the player stands, and what reads them. */
interface HintBoard {
  readonly w: number;
  readonly h: number;
  readonly common: MagnetsCommon;
  readonly m: CellMarks;
  readonly ladder: Ladder;
}

/**
 * The marks standing where the player stands: every placed domino placed (so
 * its neighbors lose that pole, as the rules say) and every `?` taken as the
 * fact it records, neutral struck from both ends. The hint is asked only of a
 * board `findMistakes` passed, which re-solves and checks both, so none of
 * this can contradict; `null` if it somehow does.
 */
function seedMarks(state: MagnetsState): HintBoard | null {
  const { w, h, wh, flags, common } = state;
  const dl = dealtOf(w, h, common);
  const ladder = magnetsLadder(dl);
  const m = magnetsMarks(magnetsSpace(w, h), dl, ladder, placedValues(state));
  if (m === null) return null;
  const neutral = cellValue(NEUTRAL);
  for (let i = 0; i < wh; i++)
    if (!(flags[i] & GS_SET) && flags[i] & GS_NOTNEUTRAL) m.strikeAt(i, neutral);
  return { w, h, common, m, ladder };
}

/** The marks as the sentences read them: a placed square's value and set
 * bit, and a "cannot be" bit for each value a square has lost. */
function snapshot(b: HintBoard): Snapshot {
  const { m } = b;
  const n = m.grid.length;
  const grid = new Int32Array(n);
  const flags = new Int32Array(n);
  for (let c = 0; c < n; c++) {
    if (m.known(c)) {
      grid[c] = whichOf(m.grid[c]);
      flags[c] |= GS_SET;
    }
    for (const which of [NEUTRAL, POSITIVE, NEGATIVE])
      if (!m.has(c, cellValue(which))) flags[c] |= notFlag(which);
  }
  return { w: b.w, h: b.h, common: b.common, grid, flags };
}

/** The domino's name: its lower-numbered square. */
const dominoOf = (s: ReadableBoard, i: number): number =>
  Math.min(i, s.common.dominoes[i]);

/** Which end of a newly placed domino the firing is about. */
function endOf(s: Snapshot, reason: MagnetsReason, first: number): number {
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

/** What the walk reads a firing by: the marks, and the board as the player's
 * sentences read it, taken before each firing ({@link noteBoard}). */
interface MagnetsWalkContext {
  board: HintBoard;
  before: Snapshot;
}

/**
 * What the hint walks: the marks where the player stands and the whole
 * ladder over them (every tier: a shared game ID carries no difficulty), or
 * `null` where the marks clash.
 */
function magnetsWalk(
  state: MagnetsState,
): { marks: CellMarks; entries: Ladder["entries"]; ctx: MagnetsWalkContext } | null {
  const board = seedMarks(state);
  if (!board) return null;
  return {
    marks: board.m,
    entries: board.ladder.entries,
    ctx: { board, before: snapshot(board) },
  };
}

/** Before each firing, the board as it stands: what the firing's sentence
 * cites, and what its placements are told from. */
function noteBoard(_m: CellMarks, ctx: MagnetsWalkContext): boolean {
  ctx.before = snapshot(ctx.board);
  return true;
}

/** What a firing did to the board the player writes on: a domino placed (the
 * end the reason is about), or marked `?`. A firing that sets only the
 * solver's "cannot be + / −" bits does neither. */
export function changesOf(
  before: Snapshot,
  after: Snapshot,
  reason: MagnetsReason,
): { placed: { idx: number; which: number }[]; marked: number[] } {
  const placed = new Set<number>();
  const marked = new Set<number>();
  for (let i = 0; i < after.grid.length; i++) {
    if (after.flags[i] === before.flags[i]) continue;
    const d = dominoOf(after, i);
    if (after.flags[i] & GS_SET && !(before.flags[i] & GS_SET)) placed.add(d);
    else if (
      !(after.flags[i] & GS_SET) &&
      after.flags[i] & GS_NOTNEUTRAL &&
      !(before.flags[i] & GS_NOTNEUTRAL)
    )
      marked.add(d);
  }
  return {
    placed: [...placed].map((d) => {
      const idx = endOf(after, reason, d);
      return { idx, which: after.grid[idx] };
    }),
    marked: [...marked],
  };
}

/** The kind of a firing the walk took: its technique, and the arm that held. */
function kindOf(taken: Taken): (typeof magnets.SAYS_KINDS)[number] {
  const { arm } = spokenOf<{ arm?: string }>(taken).says;
  return (
    arm === undefined ? taken.entry.id : `${taken.entry.id}.${arm}`
  ) as ReturnType<typeof kindOf>;
}

/**
 * The ladder's firings from the board `state` shows, each with the board
 * before and after it, `null` when none is left and `"contradiction"` where
 * the marks clash: the engine's walk, for a test to read each firing's board.
 */
export function walkFirings(
  state: MagnetsState,
  budget: StepBudget,
): () =>
  | { reason: MagnetsReason; before: Snapshot; after: Snapshot }
  | null
  | "contradiction" {
  const walked = magnetsWalk(state);
  if (walked === null) throw new Error("magnets hint: the board's marks clash");
  const { marks: m, entries, ctx } = walked;
  m.budget = budget;
  const walk = ladderWalk(m, entries, { [TIERS]: DIFF_TRICKY }, (taken) => [
    ...spokenOf<{ marks: { reads: readonly number[] } }>(taken).says.marks.reads,
  ]);
  return () => {
    const before = snapshot(ctx.board);
    const taken = walk.next();
    if (taken === null || taken === "contradiction") return taken;
    return {
      reason: reasonOf(
        m.sp,
        kindOf(taken),
        spokenOf<{ terms: magnets.SaysById[keyof magnets.SaysById]["terms"] }>(taken)
          .says.terms,
      ),
      before,
      after: snapshot(ctx.board),
    };
  };
}

// --- narration ------------------------------------------------------------

/** What a step's outlined clue digits are, beyond being outlined: the count
 * of the line it counts, and a clue cited as a reason, a met line's count,
 * each a reference of its own (docs/hints-marks.md § "The engine colors the
 * marks"). */
export interface MagnetsHighlights {
  /** The outlined clue digits cited as a reason, as `countsDone` ring
   * indices. */
  reasonClues: number[];
}

const axisOf = (line: MagnetsLine): Axis => (line.roworcol === ROW ? "row" : "column");

/** The ring index of a line's clue for `pole` (+ top/left, − bottom/right). */
function clueOf(b: ReadableBoard, line: MagnetsLine, pole: number): number {
  const edge = pole === POSITIVE ? -1 : line.roworcol === ROW ? b.w : b.h;
  return line.roworcol === ROW
    ? clueIndex(b.w, b.h, edge, line.num)
    : clueIndex(b.w, b.h, line.num, edge);
}

/** A board reason that `pole` cannot go at a square, in the sentence's terms:
 * read through the partner, it is the partner's reason for the opposite pole.
 * No line is hatched yet; {@link hatchedIn} says which is. */
function causeOf(b: ReadableBoard, r: NotReason, pole: number): Cause {
  if (r.kind === "partner") return causeOf(b, r.inner, opposite(pole));
  if (r.kind === "touch") return { kind: "touch", at: r.at };
  return {
    kind: "full",
    axis: axisOf(r.line),
    line: r.line.num,
    marked: r.magnets.length > 0,
    clue: clueOf(b, r.line, pole),
    hatched: null,
  };
}

/** `c`, with its line striped when it is the step's hatched `line`. */
function hatchedIn(c: Cause, line?: MagnetsLine): Cause {
  if (c.kind !== "full" || !line) return c;
  const axis = axisOf(line);
  return axis === c.axis && line.num === c.line ? { ...c, hatched: line } : c;
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

function endFact(b: ReadableBoard, i: number, pole: number, r: NotReason): EndFact {
  return r.kind === "partner"
    ? { end: r.at, pole: opposite(pole), cause: causeOf(b, r, pole) }
    : { end: i, pole, cause: causeOf(b, r, pole) };
}

interface Told {
  words: Sentence;
  area: number[];
  /** The clue digits of the line the sentence counts. */
  clues: number[];
  /** The row or column the sentence calls "this row" or "this column". */
  line?: MagnetsLine;
  /** Clue digits the premise cites as a reason: a met line's count. */
  reasonClues?: number[];
  /** The squares the sentence concludes, when that is not every remaining
   * leg's: a count premise's step speaks of some of its legs and not others. */
  targets?: number[];
}

/** A square forced by the two poles (or the pole and the neutral) its board
 * rules out. `value` is what it becomes. */
function tellForce(
  b: ReadableBoard,
  cell: number,
  value: number,
  targets: readonly number[],
): Told {
  const partner = b.common.dominoes[cell];
  if (value !== NEUTRAL) {
    // A marked magnet with one pole ruled out of this end.
    const banned = opposite(value);
    const r = mustRead(b, cell, banned);
    const ev = evidenceOf(b, r, banned);
    const named = namedLine(ev.lines, ev.reasonClues);
    const words =
      r.kind === "partner"
        ? say.magnetThere(
            targets,
            partner,
            value,
            hatchedIn(causeOf(b, r, banned), named.line),
          )
        : say.magnetHere(
            targets,
            partner,
            banned,
            hatchedIn(causeOf(b, r, banned), named.line),
          );
    return { words, area: [partner, ...ev.area], ...named };
  }
  const rp = mustRead(b, cell, POSITIVE);
  const rm = mustRead(b, cell, NEGATIVE);
  const ep = evidenceOf(b, rp, POSITIVE);
  const em = evidenceOf(b, rm, NEGATIVE);
  const area = [...ep.area, ...em.area];
  const named = namedLine(
    [...ep.lines, ...em.lines],
    [...ep.reasonClues, ...em.reasonClues],
  );
  const fact = (pole: number, r: NotReason): EndFact => {
    const f = endFact(b, cell, pole, r);
    return { ...f, cause: hatchedIn(f.cause, named.line) };
  };
  const plus = fact(POSITIVE, rp);
  const minus = fact(NEGATIVE, rm);
  if (plus.end === minus.end) {
    // Each fact is about the pole it names at that end, which is the opposite
    // of the one asked about when it was read through the partner.
    const [atPlus, atMinus] = plus.pole === POSITIVE ? [plus, minus] : [minus, plus];
    return {
      words: say.oneEndNeither(targets, atPlus.cause, atMinus.cause),
      area,
      ...named,
    };
  }
  // Different ends, so the same pole is ruled out of both.
  const { pole } = plus;
  const [a, b2] = [plus.cause, minus.cause];
  let words: Sentence;
  if (a.kind === "touch" && b2.kind === "touch")
    words = say.bothEndsTouch(targets, pole, [a.at, b2.at]);
  else if (a.kind === "full" && b2.kind === "full" && a.axis === b2.axis) {
    words =
      a.line === b2.line
        ? say.alongFull(targets, pole, a)
        : say.bothInFull(targets, pole, a, b2);
  } else words = say.neitherEnd(targets, pole, a, b2);
  return { words, area, ...named };
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
  if (r.kind === "force") return tellForce(b, r.cell, f.placed[0].which, targets);
  // The line itself is the hatch; the outline is kept for the squares a
  // sentence singles out within it.
  const { line } = r;
  const axis = axisOf(line);
  const marks = (clues: number[]): LineMarks => ({ line, clues, targets });
  switch (r.kind) {
    case "lineFull": {
      // Only the neutral arm is ever shown: the ± arms set bits the board
      // already says (see the module doc).
      const clues = bothClues(b, line);
      return { words: say.polesEverywhere(marks(clues), axis), area: [], clues, line };
    }
    case "lineExact":
      if (r.which === NEUTRAL) {
        // With no marked magnet in the line to set aside, "only these aren't
        // in marked magnets" would cite marks that are not there.
        const empty = lineCells(b, line).filter((i) => !(b.flags[i] & GS_SET));
        const onTargets = new Set(targets);
        const area = empty.filter((i) => !onTargets.has(i));
        const clues = bothClues(b, line);
        return {
          words:
            empty.length === targets.length
              ? say.noPolesLeft(marks(clues), axis)
              : say.neutralExact(marks(clues), axis, targets.length, area),
          area,
          clues,
          line,
        };
      }
      throw new Error("magnets hint: a count premise is told leg by leg");
    case "oneNeutralLeft": {
      const clues = bothClues(b, line);
      return {
        words: say.oneNeutralLeft(marks(clues), axis, f.marked.length),
        area: [],
        clues,
        line,
      };
    }
    case "everyDominoNeeded": {
      const clues = [clueOf(b, line, r.which)];
      return {
        words: say.everyDominoNeeded(
          marks(clues),
          axis,
          r.which,
          needed(b, line, r.which),
        ),
        area: [],
        clues,
        line,
      };
    }
    case "oddGap": {
      const clues = bothClues(b, line);
      return { words: say.oddGap(marks(clues), axis, r.which), area: [], clues, line };
    }
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
function ruleOutOf(
  b: ReadableBoard,
  r: NotReason,
  counted: MagnetsLine,
  pole: number,
): RuleOut {
  if (r.kind === "touch") return { kind: "touch", at: [r.at] };
  if (r.kind === "full")
    return { kind: "full", axis: axisOf(r.line), clues: [clueOf(b, r.line, pole)] };
  if (r.inner.kind === "touch") return { kind: "partnerTouch", at: [r.inner.at] };
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
    return {
      kind: "partnerFull",
      axis: axisOf(line),
      place,
      clues: [clueOf(b, line, opposite(pole))],
    };
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
  /** The squares "anywhere else" rules out, with their far halves when read
   * through them: the tiles "either outlined tile" names. */
  const ruled: number[] = [];
  const clues = [clueOf(b, r.line, pole)];
  const reasonClues: number[] = [];
  const ruledTiles = new Set<number>();
  let wholeTiles = true;
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
    elsewhere.push(ruleOutOf(b, why, r.line, pole));
    area.push(i, ...ev.area);
    ruled.push(i);
    if (why.kind === "partner") ruled.push(why.at);
    // A square the line's own clue rules out (a marked magnet along the line
    // already brings its last pole) cites the clue the step outlines as its
    // count, which is one mark, not two.
    reasonClues.push(...ev.reasonClues.filter((c) => !clues.includes(c)));
    // Read through its partner, a square's evidence begins with that partner,
    // so both halves are outlined: the tile is what the board shows. Unless
    // the partner is a square the journey rings, which the ring takes instead.
    if (why.kind === "partner" && !legSquares.has(why.at)) {
      ruledTiles.add(dominoOf(b, i));
    } else wholeTiles = false;
  }
  const tiles = wholeTiles ? ruledTiles.size : 0;
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
    const rest = { why: elsewhere, ruled, tiles };
    if (r.kind === "lineExact") {
      const targets = legs.slice(k).map(idxOf);
      return {
        words: say.lineExact({ line, clues, targets }, axis, pole, n, rest),
        area,
        clues,
        line,
        reasonClues,
        targets,
      };
    }
    // The dominoes the sentence counts, read off this leg's board: exactly
    // the `n` it names, or the words and the board disagree.
    const counted = new Set(
      cells
        .filter((i) => !(board.flags[i] & GS_SET) && !whyNot(board, i, pole))
        .map((i) => dominoOf(board, i)),
    );
    if (counted.size !== n) {
      throw new Error(
        `magnets hint: ${counted.size} dominoes can give the ${n} needed`,
      );
    }
    const idx = idxOf(legs[k]);
    const end = farEnd(board, idx);
    if (end.kind === "open") {
      throw new Error(`magnets hint: square ${idx} has lost its reason to be the end`);
    }
    if (end.kind === "crosses") {
      // One sentence for every crossing domino still to go: each has only this
      // square in the line. `legsOf` puts them first, so none waits on a leg
      // lying along it.
      const targets = legs
        .slice(k)
        .map(idxOf)
        .filter((i) => farEnd(board, i).kind === "crosses");
      return {
        words: say.onlyEndLeft({ line, clues, targets }, axis, pole, n, rest, {
          kind: "crosses",
          squares: targets.length,
        }),
        area,
        clues,
        line,
        reasonClues,
        targets,
      };
    }
    const j = b.common.dominoes[idx];
    const ev = evidenceOf(board, end.why, pole);
    return {
      words: say.onlyEndLeft({ line, clues, targets: [idx] }, axis, pole, n, rest, {
        kind: "along",
        why: ruleOutOf(board, end.why, r.line, pole),
        far: j,
      }),
      area: [...area, j, ...ev.area],
      clues,
      line,
      reasonClues: [
        ...reasonClues,
        ...ev.reasonClues.filter((c) => !clues.includes(c)),
      ],
      targets: [idx],
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
  // A count premise's crossing dominoes share one sentence, so they go first;
  // a domino lying along the line has its own, which may rest on theirs.
  const crosses = ({ idx }: { idx: number }) => onLine(idx).length === 1;
  const placed =
    r.kind === "onlyEndLeft"
      ? [...f.placed.filter(crosses), ...f.placed.filter((p) => !crosses(p))]
      : f.placed;
  return placed.map(({ idx, which }) => ({
    move:
      which === NEUTRAL
        ? { type: "flag", idx, mode: "neutral" }
        : { type: "set", idx, which },
    squares: squaresOf(idx, which),
  }));
}

/** The kinds of step a hint can speak: the description's, less `marked`,
 * which sets only bits the board already says, so none of its firings is
 * shown. */
export type MagnetsRung = Exclude<(typeof magnets.SAYS_KINDS)[number], "marked">;
export const MAGNETS_RUNGS = magnets.SAYS_KINDS.filter(
  (k): k is MagnetsRung => k !== "marked",
);

/** What a step's sentence is told of it: the words its firing's reading made
 * for the leg. */
interface MagnetsMarked {
  words: Sentence;
}

/** A firing as the journey the player is shown: one leg per domino, every leg
 * speaking the firing's one sentence, the rings shrinking as legs are done. A
 * firing that changes nothing the player writes is no step. */
function stepOf(
  fired: Fired<magnets.SaysById[keyof magnets.SaysById], MagnetsWalkContext>,
): { move: MagnetsMove; highlights: MagnetsHighlights; marked: MagnetsMarked }[] {
  const { taken, says, ctx, marks } = fired;
  const reason = reasonOf(marks.sp, kindOf(taken), says.terms);
  const before = ctx.before;
  const f: MagnetsFiring = {
    reason,
    before,
    ...changesOf(before, snapshot(ctx.board), reason),
  };
  if (f.placed.length === 0 && f.marked.length === 0) return [];
  const legs = legsOf(f);
  const r = f.reason;
  if (r.kind === "magnetsFill")
    throw new Error("magnets hint: a hidden premise reached narration");
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
    // A leg already done is on the board now, and the sentence's count is
    // taken after it, so it leaves the picture with its ring.
    const targets = told.targets ?? legs.slice(k).flatMap((l) => l.squares);
    const onTargets = new Set(targets);
    const area = [...new Set(told.area)].filter((i) => !onTargets.has(i));
    // One premise's words serve every leg, so each leg keeps only the squares
    // still in its picture: a square the journey rings is not outlined.
    const shown = new Set([
      ...targets.map((i) => `ring|${i}`),
      ...area.map((i) => `outline|${i}`),
    ]);
    const words = told.words.narrow(
      (role, kind, key) => kind !== SQUARE.name || shown.has(`${role}|${key}`),
    );
    return {
      move: leg.move,
      highlights: { reasonClues: [...new Set(told.reasonClues)] },
      marked: { words },
    };
  });
}

const sentence = (_spoken: unknown, { words }: MagnetsMarked): Sentence => words;

/**
 * The plan from the player's own board, by the engine's walk: every tier's
 * techniques, the firing that carries on from the squares and lines the walk
 * has just decided. A contradiction on a board `findMistakes` called clean
 * would mean the deduction is unsound, not that the player went wrong.
 */
export const magnetsHint = describedEdgeHint<
  MagnetsState,
  MagnetsMove,
  MagnetsHighlights,
  MagnetsMarked,
  MagnetsWalkContext,
  magnets.SaysById,
  MagnetsRung
>({
  name: "magnets hint",
  walk: magnetsWalk,
  settle: noteBoard,
  tiers: { lowest: () => DIFF_TRICKY, count: DIFF_TRICKY + 1 },
  plan: PLAN_CAP,
  done: (m) => !m.grid.includes(0),
  step: stepOf,
  say: {
    single: sentence,
    count: sentence,
    oddGap: sentence,
    marked: () => {
      throw new Error("magnets hint: a hidden premise reached narration");
    },
    oneNeutral: sentence,
    everyTile: sentence,
    onlyEnd: sentence,
  },
});

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

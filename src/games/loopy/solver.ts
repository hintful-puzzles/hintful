/**
 * Loopy's solver: the ladder `loopy.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/ladder-runtime.ts`) over the
 * board's tiling (`tilingSpace`), and the answer check its rules compile to.
 *
 * One ladder serves the generator, which keeps a removed clue only while the
 * board still solves at its tier, so its verdict on every intermediate board
 * decides which puzzles exist; Solve; the mistake check's answer; the
 * difficulty probe; and the hint, which walks it ({@link hintWalk}). No
 * technique supposes anything, so a board the ladder finishes is uniquely
 * solved.
 *
 * The marks are the lines, a mark on each corner of two edges side by side
 * round a dot (how many of the two are lines, the player's corner notes)
 * and a relation over the edges (the player's pair notes). A firing that
 * only narrows a corner or relates two edges draws no line: the hint keeps
 * it as a fact, and places it as a note where a line it draws cites it.
 */

import {
  clueList,
  type GridSpace,
  RELATE,
  rangeMask,
  STRIKE_EDGE,
  tilingSpace,
} from "../../engine/describe-runtime.ts";
import type { Grid } from "../../engine/grid/index.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  ladderTechniques,
  ladderWalk,
  type ReasonOf,
  type Rung,
  runLadder,
  type Taken,
  TIERS,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import type { StepBudget } from "../../engine/step-budget.ts";
import * as loopy from "./loopy.compiled.ts";
import { DIFF_HARD } from "./params.ts";
import {
  type BoundWitness,
  type CornerWhy,
  type LoopyReason,
  LoopyRecorder,
  type RecordedOp,
  type RelationWhy,
} from "./record.ts";
import {
  checkCompletion,
  cloneState,
  LINE_NO,
  LINE_UNKNOWN,
  LINE_YES,
  type LineState,
  type LoopyState,
} from "./state.ts";

export type SolverStatus = "solved" | "mistake" | "incomplete";

/** What the description reads a line as, and an edge with none. */
const LINE = 1;
const NONE = 2;
/** A corner that may hold any number of lines, 0 to 2. */
const ANY = rangeMask(0, 2);

const describedOf = (l: number): number =>
  l === LINE_YES ? LINE : l === LINE_NO ? NONE : 0;
const lineOf = (v: number): LineState =>
  v === LINE ? LINE_YES : v === NONE ? LINE_NO : LINE_UNKNOWN;

/** The board as the description deals it: a number on each face that has
 * one. */
function dealtOf(state: LoopyState): loopy.Dealt {
  const at: number[] = [];
  const v: number[] = [];
  state.clues.forEach((c, f) => {
    if (c >= 0) {
      at.push(f);
      v.push(c);
    }
  });
  return { number: clueList(at, v, state.clues.length) };
}

/**
 * Why one firing of the ladder holds: its technique and its binding, and,
 * for a count of a clue's other edges, what the count rests on (see
 * {@link boundOf}), all read before the firing changes anything.
 */
interface Fired {
  readonly kind: loopy.LadderId;
  readonly b: Readonly<Record<string, unknown>>;
  readonly witness?: Witness;
}

/** A count of some of a face's edges: each edge counted one, and each corner
 * counted one for its two edges, as angles. */
interface Witness {
  readonly edges: readonly number[];
  readonly corners: readonly number[];
  readonly total: number;
}

const fired =
  <B extends object>(kind: loopy.LadderId): ReasonOf<B> =>
  (b): Fired => ({ kind, b: { ...(b as Record<string, unknown>) } });

/**
 * The fewest lines (`min`) or the most (`max`) the edges of face `f` from
 * place `from` round to place `to`, both included, can hold, read as a
 * player counts them: each edge alone, or two side by side as one where the
 * corner between them has at most one line (for the most) or at least one
 * (for the fewest). Taken greedily along the run, which pairs as many
 * corners as can be.
 */
function boundOf(
  sp: GridSpace,
  m: CellMarks,
  f: number,
  from: number,
  to: number,
  kind: "min" | "max",
): Witness {
  const es = sp.faceEdges[f];
  const N = es.length;
  const counts = (e: number): boolean =>
    kind === "max" ? m.grid[e] !== NONE : m.grid[e] === LINE;
  const pairs = (e: number): boolean =>
    kind === "max" ? m.grid[e] !== NONE : m.grid[e] !== LINE;
  const bit = kind === "max" ? 4 : 1;
  const edges: number[] = [];
  const corners: number[] = [];
  const len = ((to - from + N) % N) + 1;
  for (let i = 0; i < len; ) {
    const x = es[(from + i) % N];
    if (i + 1 < len) {
      const y = es[(from + i + 1) % N];
      const a = sp.faceAngles[f][(from + i + 1) % N];
      if (pairs(x) && pairs(y) && (m.edgeCands[a] & bit) === 0) {
        corners.push(a);
        i += 2;
        continue;
      }
    }
    if (counts(x)) edges.push(x);
    i++;
  }
  return { edges, corners, total: edges.length + corners.length };
}

/** Where edge `e` sits round face `f`. */
const placeOf = (sp: GridSpace, f: number, e: number): number =>
  sp.faceEdges[f].indexOf(e);

/** The ladder over the dealt numbers, each technique with its reason. */
function loopyLadder(dl: loopy.Dealt): Ladder {
  const face = <B extends object>(
    kind: loopy.LadderId,
    run: (b: never, sp: GridSpace, cl: loopy.Dealt, fire: never) => number,
  ): Rung =>
    compiledRung(
      run as Parameters<typeof compiledRung<B, loopy.Dealt>>[0],
      dl,
      fired<B>(kind),
    );
  return describedLadder(loopy, {
    clueFull: face("clueFull", loopy.clueFull),
    clueStarved: face("clueStarved", loopy.clueStarved),
    clueBlockedPair: face("clueBlockedPair", loopy.clueBlockedPair),
    clueOneShort: face("clueOneShort", loopy.clueOneShort),
    deadEnd: uncluedRung(loopy.deadEnd, fired("deadEnd")),
    lineContinues: uncluedRung(loopy.lineContinues, fired("lineContinues")),
    dotFull: uncluedRung(loopy.dotFull, fired("dotFull")),
    earlyLoop: face("earlyLoop", loopy.earlyLoop),
    closed: uncluedRung(loopy.closed, fired("closed")),
    cornerAtDot: uncluedRung(loopy.cornerAtDot, fired("cornerAtDot")),
    cornerOther: uncluedRung(loopy.cornerOther, fired("cornerOther")),
    cornerBoth: uncluedRung(loopy.cornerBoth, fired("cornerBoth")),
    // A count's witness: the clue's other edges, from the one after `e`
    // round to the one before it, for the bound that settles `e`.
    clueBound: compiledRung(loopy.clueBound, dl, (b, _e, _d, m): Fired => {
      const sp = m.sp;
      const p = placeOf(sp, b.f, b.e);
      const N = sp.faceEdges[b.f].length;
      return {
        kind: "clueBound",
        b: { ...b },
        witness: boundOf(sp, m, b.f, (p + 1) % N, (p + N - 1) % N, b.P ? "min" : "max"),
      };
    }),
    // The clue's edges other than the corner's two, from the one after its
    // second round to the one before its first, for the bound that narrows
    // the corner: the fewest lines for at most one, the most for at least
    // one.
    cornerFromClue: compiledRung(loopy.cornerFromClue, dl, (b, _a, d, m): Fired => {
      const sp = m.sp;
      const N = sp.faceEdges[b.f].length;
      const at = sp.faceAngles[b.f].indexOf(b.a);
      return {
        kind: "cornerFromClue",
        b: { ...b, d },
        witness: boundOf(
          sp,
          m,
          b.f,
          (at + 1) % N,
          (at + N - 2) % N,
          d === 2 ? "min" : "max",
        ),
      };
    }),
    cornerAcross: uncluedRung(loopy.cornerAcross, fired("cornerAcross")),
    cornerExit: uncluedRung(loopy.cornerExit, fired("cornerExit")),
    cornerOppositeExit: uncluedRung(
      loopy.cornerOppositeExit,
      fired("cornerOppositeExit"),
    ),
    matchingPair: face("matchingPair", loopy.matchingPair),
    pairAtClue: face("pairAtClue", loopy.pairAtClue),
    parityClue: face("parityClue", loopy.parityClue),
    linkClue: face("linkClue", loopy.linkClue),
    pairFromCorner: uncluedRung(loopy.pairFromCorner, fired("pairFromCorner")),
    cornerFromPair: uncluedRung(loopy.cornerFromPair, fired("cornerFromPair")),
    pairAtDot: uncluedRung(loopy.pairAtDot, fired("pairAtDot")),
    parityDot: uncluedRung(loopy.parityDot, fired("parityDot")),
    linkDot: uncluedRung(loopy.linkDot, fired("linkDot")),
    related: uncluedRung(loopy.related, fired("related")),
  });
}

/** The ladder of a board, kept with the clues it was built for: every solve
 * of one board shares it. Checked against the clues themselves, since the
 * generator adds and removes clues in one array. */
const ladders = new WeakMap<
  Int8Array,
  { clues: Int8Array; dl: loopy.Dealt; ladder: Ladder }
>();

function ladderOf(state: LoopyState): { dl: loopy.Dealt; ladder: Ladder } {
  const kept = ladders.get(state.clues);
  if (kept?.clues.every((c, i) => c === state.clues[i])) return kept;
  const dl = dealtOf(state);
  const made = { clues: state.clues.slice(), dl, ladder: loopyLadder(dl) };
  ladders.set(state.clues, made);
  return made;
}

/** The marks of `state`'s lines, and, where `notes`, its corner and pair
 * notes. */
function marksOf(state: LoopyState, notes: boolean): CellMarks {
  const sp = tilingSpace(state.grid);
  const grid = Uint8Array.from(state.lines, describedOf);
  const m = new CellMarks(sp, rangeMask(1, 2), grid, null, "edge");
  m.edgeCands.fill(ANY);
  m.clearPairs();
  if (notes) {
    // A corner note's bit 1 is at least one line, bit 2 at most one.
    state.corners.forEach((bits, a) => {
      if (bits & 1) m.edgeCands[a] &= ~1;
      if (bits & 2) m.edgeCands[a] &= ~4;
    });
    for (const { a, b, opposite } of state.pairs) m.relateAt(a, b, opposite ? 2 : 1);
  }
  m.seed(grid);
  return m;
}

/**
 * Solve `state`'s board from its lines by the ladder up to tier `diff`: the
 * lines it ends with, and whether they are the board's answer, the marks
 * inconsistent, or neither.
 */
export function solveGame(
  state: LoopyState,
  diff: number,
): { status: SolverStatus; lines: Uint8Array } {
  const { dl, ladder } = ladderOf(state);
  const m = marksOf(state, false);
  const impossible = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [TIERS]: diff }, {}),
  );
  const lines = Uint8Array.from(m.grid, lineOf);
  if (impossible) return { status: "mistake", lines };
  if (m.grid.includes(0)) return { status: "incomplete", lines };
  return {
    status: loopy.isAnswer(m.grid, m.sp, dl) ? "solved" : "mistake",
    lines,
  };
}

/** Whether the ladder up to tier `diff` finishes the board: the generator
 * gates every clue it removes on this. */
export function gameHasUniqueSoln(state: LoopyState, diff: number): boolean {
  const { status } = solveGame(state, diff);
  if (status === "mistake")
    // The generator asks only about boards dealt from a real loop.
    throw new Error("loopy: the ladder found a contradiction in a dealt board");
  return status === "solved";
}

/**
 * The board's one answer, or `null` where the ladder cannot finish its clues
 * (a hand-typed description can leave it short). Solved from the clues alone
 * at the top tier, and kept per grid: every state of one game shares its
 * grid and its clues.
 */
export function uniqueSolution(state: LoopyState): Uint8Array | null {
  const known = solutions.get(state.grid);
  if (known !== undefined) return known;
  const blank = cloneState(state);
  blank.lines.fill(LINE_UNKNOWN);
  const { status, lines } = solveGame(blank, DIFF_HARD);
  const solution = status === "solved" ? lines : null;
  solutions.set(state.grid, solution);
  return solution;
}

const solutions = new WeakMap<Grid, Uint8Array | null>();

// --- the hint's walk ---------------------------------------------------------

/** One firing on the hint path that draws lines: the lines it changed, why,
 * and its tier. */
export interface LoopyFiring {
  readonly reason: LoopyReason;
  readonly ops: readonly RecordedOp[];
  readonly tier: number;
}

/** The board a hint plans on: the player's, a copy, its lines kept as the
 * walk draws them, and the facts the walk has found. */
export interface HintBoard {
  readonly state: LoopyState;
  readonly rec: LoopyRecorder;
  status: "mistake" | "incomplete";
}

/** Whether the board a hint plans on is finished: exactly one loop, every
 * clue met. */
export function hintBoardSolved(board: HintBoard): boolean {
  return checkCompletion(board.state);
}

/**
 * The ladder walked from the player's lines and notes, one firing a call
 * (`ladderWalk`, which takes the firing beside the line the plan is
 * drawing, and never one harder than the ladder's own next): each firing
 * that draws lines, with why. A firing that only narrows a corner or
 * relates two edges is no step of its own: it is recorded as a fact, with
 * the facts it rests on, for the plan to place as a note where a line cites
 * it. The player's own notes are facts whose premise is that they are on
 * the board.
 */
export function hintWalk(
  state: LoopyState,
  budget: StepBudget,
): { board: HintBoard; next: () => LoopyFiring | null } {
  const { ladder } = ladderOf(state);
  const work = cloneState(state);
  const m = marksOf(work, true);
  m.budget = budget;
  const sp = m.sp;
  const rec = new LoopyRecorder(sp.edges.length);
  const board: HintBoard = { state: work, rec, status: "incomplete" };
  seedNotes(sp, rec, state);
  // The dots a firing reads, which a plan continues from: its face's, its
  // dot's or its corner's, and those of the lines it settles.
  const reads = ({ facts, reasons }: Taken): number[] => {
    const out: number[] = [];
    const r = reasons[0] as Fired;
    const b = r.b;
    if (typeof b["f"] === "number") out.push(...sp.faceCells[b["f"]]);
    if (typeof b["c"] === "number") out.push(b["c"]);
    if (typeof b["a"] === "number") out.push(sp.angleCell[b["a"]]);
    for (let i = 0; i < facts.length; i += 3) {
      if (facts[i] === STRIKE_EDGE) out.push(sp.angleCell[facts[i + 1]]);
      else if (facts[i] === RELATE) continue;
      else out.push(sp.edgeEnds[2 * facts[i + 1]], sp.edgeEnds[2 * facts[i + 1] + 1]);
    }
    return out;
  };
  // The solve runs the dots' techniques first, which is cheaper; a hint
  // counts a clue before a dot where nothing continues its last step.
  const dots = new Set(["deadEnd", "lineContinues", "dotFull"]);
  const firstDot = ladder.entries.findIndex((e) => dots.has(e.id));
  const clues = ladder.entries.filter((e) => e.tier === 0 && e.id.startsWith("clue"));
  const order = [
    ...ladder.entries.slice(0, firstDot),
    ...clues,
    ...ladder.entries.slice(firstDot).filter((e) => !clues.includes(e)),
  ];
  const walk = ladderWalk(m, order, { [TIERS]: DIFF_HARD }, reads);
  const next = (): LoopyFiring | null => {
    for (;;) {
      const before = { grid: m.grid.slice(), corners: m.edgeCands.slice() };
      const taken = walk.next();
      if (taken === null) return null;
      if (taken === "contradiction") {
        board.status = "mistake";
        return null;
      }
      const r = taken.reasons[0] as Fired;
      const ops: RecordedOp[] = [];
      for (const e of sp.edges)
        if (m.grid[e] !== before.grid[e]) {
          const line = lineOf(m.grid[e]);
          work.lines[e] = line;
          ops.push({ edge: e, state: line });
        }
      if (ops.length === 0) {
        recordFacts(sp, rec, taken.reasons, before.corners, m);
        continue;
      }
      return {
        reason: lineReason(sp, rec, r, before.grid, ops),
        ops,
        tier: taken.entry.tier,
      };
    }
  };
  return { board, next };
}

/** The player's notes, as facts whose premise is that they are on the
 * board. */
function seedNotes(sp: GridSpace, rec: LoopyRecorder, state: LoopyState): void {
  state.corners.forEach((bits, a) => {
    const note = (bound: "atLeastOne" | "atMostOne"): void => {
      rec.corner(a, {
        kind: "corner",
        dot: sp.angleCell[a],
        edges: [sp.angleEdges[a][0], sp.angleEdges[a][1]],
        bound,
        why: { kind: "note" },
        parents: [],
      });
    };
    if (bits & 1) note("atLeastOne");
    if (bits & 2) note("atMostOne");
  });
  for (const { a, b, opposite } of state.pairs)
    rec.relate({
      kind: "relation",
      edges: [a, b],
      opposite,
      why: { kind: "note" },
      parents: [],
    });
}

const num = (r: Fired, k: string): number => r.b[k] as number;

/** The fact ids of a witness's corners, each read as its count's bound. */
const witnessOf = (
  rec: LoopyRecorder,
  w: Witness,
  bound: "atMostOne" | "atLeastOne",
): BoundWitness => ({
  edges: w.edges,
  corners: w.corners.map((a) => rec.cornerFact(a, bound)),
  total: w.total,
});

/**
 * Record what a firing that draws no line found: each corner bit it struck,
 * as a fact with why it holds and the facts it rests on, and each pair it
 * related.
 */
function recordFacts(
  sp: GridSpace,
  rec: LoopyRecorder,
  all: readonly object[],
  before: Int32Array,
  m: CellMarks,
): void {
  const r = all[0] as Fired;
  const corner = (
    a: number,
    bound: "atMostOne" | "atLeastOne",
    why: CornerWhy,
    parents: readonly number[],
  ): void => {
    const bit = bound === "atMostOne" ? 4 : 1;
    if ((before[a] & bit) === 0 || (m.edgeCands[a] & bit) !== 0) return;
    rec.corner(a, {
      kind: "corner",
      dot: sp.angleCell[a],
      edges: [sp.angleEdges[a][0], sp.angleEdges[a][1]],
      bound,
      why,
      parents,
    });
  };
  const relate = (
    e: number,
    g: number,
    opposite: boolean,
    why: RelationWhy,
    parents: readonly number[],
  ): void => {
    rec.relate({ kind: "relation", edges: [e, g], opposite, why, parents });
  };
  const opposite = (d: number): boolean => d === 2;
  switch (r.kind) {
    case "cornerAtDot": {
      const a = num(r, "a");
      corner(a, "atMostOne", { kind: "lineElsewhere" }, []);
      corner(a, "atLeastOne", { kind: "onlyWayOn" }, []);
      return;
    }
    case "cornerFromClue": {
      // A reason a strike, each with the count it rests on: the fewest
      // lines where the corner takes at most one, the most where at least
      // one.
      for (const s of all as readonly Fired[]) {
        const a = num(s, "a");
        const face = num(s, "f");
        const w = s.witness as Witness;
        if (s.b["d"] === 2)
          corner(
            a,
            "atMostOne",
            { kind: "clue", face, witness: witnessOf(rec, w, "atLeastOne") },
            [],
          );
        else
          corner(
            a,
            "atLeastOne",
            { kind: "clue", face, witness: witnessOf(rec, w, "atMostOne") },
            [],
          );
      }
      return;
    }
    case "cornerAcross":
      corner(num(r, "b"), "atMostOne", { kind: "acrossTheDot" }, [
        rec.cornerFact(num(r, "a"), "atLeastOne"),
      ]);
      return;
    case "cornerOppositeExit": {
      const a = num(r, "a");
      const parents = [rec.cornerFact(a, "atLeastOne"), rec.cornerFact(a, "atMostOne")];
      corner(num(r, "b"), "atLeastOne", { kind: "exactlyOneAcross" }, parents);
      corner(num(r, "b"), "atMostOne", { kind: "exactlyOneAcross" }, parents);
      return;
    }
    case "cornerFromPair": {
      const a = num(r, "a");
      const path = rec.path(num(r, "e"), num(r, "g"));
      corner(a, "atMostOne", { kind: "opposites" }, path);
      corner(a, "atLeastOne", { kind: "opposites" }, path);
      return;
    }
    case "pairFromCorner": {
      const a = num(r, "a");
      relate(
        num(r, "e"),
        num(r, "g"),
        true,
        { kind: "exactlyOneAtCorner", dot: sp.angleCell[a] },
        [rec.cornerFact(a, "atMostOne"), rec.cornerFact(a, "atLeastOne")],
      );
      return;
    }
    case "pairAtClue":
    case "pairAtDot": {
      const e = num(r, "e");
      const g = num(r, "g");
      const d = m.pairOf(e, g) === 4 ? 2 : 1;
      const why: RelationWhy =
        r.kind === "pairAtClue"
          ? { kind: "faceParity", face: num(r, "f") }
          : { kind: "dotParity", dot: num(r, "c") };
      relate(e, g, opposite(d), why, []);
      return;
    }
    case "linkClue":
    case "linkDot": {
      const h = num(r, "h");
      const k = num(r, "k");
      const d = m.pairOf(h, k) === 4 ? 2 : 1;
      const why: RelationWhy =
        r.kind === "linkClue"
          ? { kind: "faceLink", face: num(r, "f") }
          : { kind: "dotLink", dot: num(r, "c") };
      relate(h, k, opposite(d), why, rec.path(num(r, "e"), num(r, "g")));
      return;
    }
    default:
      throw new Error(`loopy hint: ${r.kind} draws no line and records nothing`);
  }
}

/** Why a firing that draws lines holds, in the hint's terms. */
function lineReason(
  sp: GridSpace,
  rec: LoopyRecorder,
  r: Fired,
  before: ArrayLike<number>,
  ops: readonly RecordedOp[],
): LoopyReason {
  switch (r.kind) {
    case "clueFull":
    case "clueStarved":
      return { kind: r.kind, face: num(r, "f") };
    case "clueBlockedPair": {
      const e = num(r, "e");
      return {
        kind: "clueBlockedPair",
        face: num(r, "f"),
        dots: [sp.edgeEnds[2 * e], sp.edgeEnds[2 * e + 1]],
        between: e,
      };
    }
    case "clueOneShort": {
      const a = num(r, "a");
      return {
        kind: "clueOneShort",
        face: num(r, "f"),
        dot: sp.angleCell[a],
        pair: [sp.angleEdges[a][0], sp.angleEdges[a][1]],
      };
    }
    case "deadEnd":
    case "lineContinues":
    case "dotFull":
      return { kind: r.kind, dot: num(r, "c") };
    case "earlyLoop": {
      // A line left out of the loop it would close, or else a clue it
      // would leave unmet.
      const G = r.b["G"] as readonly number[];
      const stray = sp.edges.some(
        (g) => before[g] === LINE && !G.includes(sp.edgeEnds[2 * g]),
      );
      return { kind: "earlyLoop", because: stray ? "strayLines" : "unmetClues" };
    }
    case "cornerOther":
    case "cornerBoth": {
      const a = num(r, "a");
      // At most one where a line, or both edges, were made empty.
      const bound = ops[0].state === LINE_NO ? "atMostOne" : "atLeastOne";
      return { kind: "corner", dot: sp.angleCell[a], fact: rec.cornerFact(a, bound) };
    }
    case "clueBound": {
      const w = r.witness as Witness;
      // Empty where the others already need every line, which counts the
      // fewest; a line where they can hold one fewer, which counts the most.
      const bound = r.b["P"] ? "atLeastOne" : "atMostOne";
      return {
        kind: "clueBound",
        face: num(r, "f"),
        edge: num(r, "e"),
        witness: witnessOf(rec, w, bound),
      };
    }
    case "cornerExit": {
      const a = num(r, "a");
      return {
        kind: "cornerExit",
        dot: sp.angleCell[a],
        facts: [rec.cornerFact(a, "atLeastOne"), rec.cornerFact(a, "atMostOne")],
      };
    }
    case "matchingPair":
      return {
        kind: "matchingPair",
        face: num(r, "f"),
        path: rec.path(num(r, "e"), num(r, "g")),
      };
    case "parityClue":
    case "parityDot":
      return {
        kind: "parity",
        face: r.kind === "parityClue" ? num(r, "f") : null,
        dot: r.kind === "parityDot" ? num(r, "c") : null,
        path: rec.path(num(r, "e"), num(r, "g")),
      };
    case "related": {
      const g = num(r, "g");
      return { kind: "related", from: g, path: rec.path(g, num(r, "e")) };
    }
    default:
      throw new Error(`loopy hint: ${r.kind} draws no line a hint narrates`);
  }
}

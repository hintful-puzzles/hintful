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
  type Reads,
  rangeMask,
  relationKey,
  STRIKE_EDGE,
  tilingSpace,
} from "../../engine/describe-runtime.ts";
import type { FactGraph } from "../../engine/fact-graph.ts";
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

/** What a clue's count of its other edges rests on: the edges counted one
 * each (lines drawn, or edges still open), and the corners counted one for
 * their two edges, as angles. */
export interface Witness {
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
//
// **Two kinds of fact live beside the lines.** From Normal the solver reasons
// about *corners* (two edges adjacent around a dot, known to carry at most one
// or at least one line between them) and from Hard about *pairs* (two edges
// known to be both lines or both empty, or exactly one of each). The player
// notes both (`LoopyState.corners` and `pairs`). The walk's graph holds each
// firing's facts and what each rests on (`engine/fact-graph.ts`); a corner is a
// `STRIKE_EDGE` about its angle, a pair a `RELATE` about its two edges. What
// the graph cannot say, because only Loopy knows it, is kept here beside it:
// why each note holds (`Note`) and the chain of pairs a firing narrates.

/** Which of a corner's two bits a fact sets. */
export type Bound = "atMostOne" | "atLeastOne";

/** The candidate a corner's fact strikes from its angle: of 0, 1 or 2 lines,
 * the 0 for at least one, the 2 for at most one. */
const AT_LEAST_ONE = 0;
const AT_MOST_ONE = 2;

/** Two edges one noted or found relation joins: both lines or both empty, or
 * exactly one of each. */
export interface Link {
  readonly edges: readonly [number, number];
  readonly opposite: boolean;
}

/** Why a corner carries at most one line, or at least one. */
export type CornerWhy =
  /** Its dot already has a line along some other edge, so a line through both
   * would give the dot three. */
  | { kind: "lineElsewhere" }
  /** Its dot has one line and these two are its only other edges still open. */
  | { kind: "onlyWayOn" }
  /** A clued face's other edges already need, or can only hold, so many lines
   * that this corner of it is decided. */
  | { kind: "clue"; face: number; witness: Witness }
  /** The corner across the dot (`from`) carries at least one line, and a dot
   * takes two lines at most. */
  | { kind: "acrossTheDot"; from: number }
  /** The corner across the dot (`from`) carries exactly one line, and this dot
   * has no line yet and four open edges, so the loop's other line here is in
   * this corner. */
  | { kind: "exactlyOneAcross"; from: number }
  /** Its two edges are opposites, so exactly one of them is a line: `path` is
   * the chain of relations between them. */
  | { kind: "opposites"; path: readonly Link[] };

/** Why two edges are known to match, or to be opposites. */
export type RelationWhy =
  /** Only these two of a clued face's edges are still open, so the clue's parity
   * decides whether they match. */
  | { kind: "faceParity"; face: number }
  /** Only these two of a dot's edges are still open, so the dot's parity (it takes
   * zero or two lines) decides whether they match. */
  | { kind: "dotParity"; dot: number }
  /** They make a corner (`from`) carrying exactly one line. */
  | { kind: "exactlyOneAtCorner"; dot: number; from: number }
  /** A clued face has four open edges and two of them are related, which relates
   * the other two by the clue's parity. `path` is the chain between the first
   * pair. */
  | { kind: "faceLink"; face: number; path: readonly Link[] }
  /** The same, at a dot with four open edges. */
  | { kind: "dotLink"; dot: number; path: readonly Link[] };

/** A fact of the walk that is no line, as the hint says it: `id` is its place
 * in the walk's graph. */
export type CornerNote = {
  readonly kind: "corner";
  readonly id: number;
  /** The dline the fact is a bit of, as `dlines.ts` indexes it. */
  readonly dline: number;
  readonly dot: number;
  readonly edges: readonly [number, number];
  readonly bound: Bound;
  readonly why: CornerWhy;
};

export type RelationNote = {
  readonly kind: "relation";
  readonly id: number;
  readonly edges: readonly [number, number];
  readonly opposite: boolean;
  readonly why: RelationWhy;
};

export type Note = CornerNote | RelationNote;

/** The premise behind one firing: a change to one or more lines. Where it
 * rests on a corner, that is the dline, and where on pairs, their chain. */
export type LoopyReason =
  /** A clue already has its lines, so its other edges are empty. */
  | { kind: "clueFull"; face: number }
  /** A clue has only as many edges left open as it needs, so all are lines. */
  | { kind: "clueStarved"; face: number }
  /** A clue needs all but one of its open edges, and two of them at a dot that
   * already has a line cannot both be lines, so every other open edge is. */
  | { kind: "clueOneShort"; face: number; dot: number; pair: readonly [number, number] }
  /** A clue needs all but one of its open edges, and two dots next to each other
   * around it already have a line, so the edge between them cannot be one and
   * every other open edge must be. */
  | {
      kind: "clueBlockedPair";
      face: number;
      dots: readonly [number, number];
      between: number;
    }
  /** A dot with no line and one open edge: a line there would dead-end. */
  | { kind: "deadEnd"; dot: number }
  /** A dot with one line and one open edge: the line must continue along it. */
  | { kind: "lineContinues"; dot: number }
  /** A dot with two lines takes no more. */
  | { kind: "dotFull"; dot: number }
  /** A clue's other edges already need all its lines (the edge is empty) or can
   * hold one fewer (the edge is a line). */
  | { kind: "clueBound"; face: number; edge: number; witness: Witness }
  /** A corner settles its edges against the dot's lines, and the ops say what
   * it forced. */
  | { kind: "corner"; dot: number; dline: number; bound: Bound }
  /** A dot with no line has three open edges and a corner carrying exactly one
   * line, so the loop leaves along the third. */
  | { kind: "cornerExit"; dot: number; dline: number }
  /** Two matching open edges of a clue with room for one more line (both empty)
   * or one more empty edge (both lines). `path` is the chain of relations. */
  | { kind: "matchingPair"; face: number; path: readonly Link[] }
  /** Three open edges of a clue or a dot, two of them related, so the parity
   * decides the third. */
  | { kind: "parity"; face: number | null; dot: number | null; path: readonly Link[] }
  /** An edge related to one whose state is known takes the state the relation
   * gives it. `from` is the known edge. */
  | { kind: "related"; from: number; path: readonly Link[] }
  /** The edge would close a loop that is not the whole answer. */
  | { kind: "earlyLoop"; because: "strayLines" | "unmetClues" };

export interface RecordedOp {
  edge: number;
  state: LineState;
}

/** One firing on the hint path that draws lines: the lines it changed, why,
 * its tier, and its place in the walk's graph. */
export interface LoopyFiring {
  readonly reason: LoopyReason;
  readonly ops: readonly RecordedOp[];
  readonly tier: number;
  readonly firing: number;
}

/** The board a hint plans on: the player's, a copy, its lines kept as the
 * walk draws them. */
export interface HintBoard {
  readonly state: LoopyState;
  status: "mistake" | "incomplete";
}

/** Whether the board a hint plans on is finished: exactly one loop, every
 * clue met. */
export function hintBoardSolved(board: HintBoard): boolean {
  return checkCompletion(board.state);
}

/** Every relation noted or found so far, both ways round. The ladder's
 * relation answers *whether* two edges are related; only this answers
 * *through what*. */
class Relations {
  private readonly at: { to: number; link: Link }[][];

  constructor(numEdges: number) {
    this.at = Array.from({ length: numEdges }, () => []);
  }

  add(link: Link): void {
    const [a, b] = link.edges;
    this.at[a].push({ to: b, link });
    this.at[b].push({ to: a, link });
  }

  /**
   * The links joining edge `a` to edge `b`, in order from `a`, by the shortest
   * chain. The ladder's relation said they are related, so a chain exists; not
   * finding one means a relation went unrecorded.
   */
  path(a: number, b: number): Link[] {
    if (a === b) return [];
    const via = new Map<number, { from: number; link: Link }>();
    const queue = [a];
    via.set(a, { from: -1, link: { edges: [a, a], opposite: false } });
    for (let i = 0; i < queue.length; i++) {
      const at = queue[i];
      for (const r of this.at[at]) {
        if (via.has(r.to)) continue;
        via.set(r.to, { from: at, link: r.link });
        if (r.to === b) {
          const links: Link[] = [];
          for (let e = b; e !== a; ) {
            const step = via.get(e);
            if (!step) break;
            links.push(step.link);
            e = step.from;
          }
          return links.reverse();
        }
        queue.push(r.to);
      }
    }
    throw new Error(`loopy hint: no recorded relation joins edges ${a} and ${b}`);
  }
}

/**
 * The ladder walked from the player's lines and notes, one firing a call
 * (`ladderWalk`, which takes the firing beside the line the plan is
 * drawing, and never one harder than the ladder's own next): each firing
 * that draws lines, with why. A firing that only narrows a corner or
 * relates two edges is no step of its own: its facts are in the graph and in
 * `notes`, for the plan to place as notes where a line cites them. The
 * player's own notes are roots: no fact, and nothing to place.
 */
export function hintWalk(
  state: LoopyState,
  budget: StepBudget,
): {
  board: HintBoard;
  graph: FactGraph;
  /** The notes the walk's firings made, by their facts' places in the graph. */
  notes: ReadonlyMap<number, Note>;
  angleEdges: (angle: number) => readonly [number, number];
  next: () => LoopyFiring | null;
} {
  const { ladder } = ladderOf(state);
  const work = cloneState(state);
  const m = marksOf(work, true);
  m.budget = budget;
  const sp = m.sp;
  const board: HintBoard = { state: work, status: "incomplete" };
  const relations = new Relations(sp.edges.length);
  for (const { a, b, opposite } of state.pairs)
    relations.add({ edges: [a, b], opposite });
  const notes = new Map<number, Note>();
  /** The chain each firing cites, found as it was asked what it cites. */
  const chains = new Map<Taken, readonly Link[]>();
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
  // What a firing rests on: the corners its count or its dot reads, and the
  // chain of relations it narrates, asked before the firing's facts are made.
  // A line is no premise: the player sees it.
  const citing = (f: Taken): Reads | readonly Reads[] => {
    const r = f.reasons[0] as Fired;
    // A corner bit is the candidate struck from its angle: 0 for at least one
    // line, 2 for at most one. A firing rests on the bits it names, not on
    // the angle's other.
    const bits: [number, number][] = [];
    const both = (a: number): void => {
      bits.push([a, AT_LEAST_ONE], [a, AT_MOST_ONE]);
    };
    let chain: readonly Link[] = [];
    switch (r.kind) {
      case "clueBound": {
        // Empty where the others already need every line, which counts the
        // fewest; a line where they can hold one fewer, which counts the most.
        const bit = r.b["P"] ? AT_LEAST_ONE : AT_MOST_ONE;
        for (const a of (r.witness as Witness).corners) bits.push([a, bit]);
        break;
      }
      case "cornerFromClue":
        // A strike each, each resting on its own count: the fewest lines
        // where the corner takes at most one, the most where at least one.
        chains.set(f, chain);
        return (f.reasons as readonly Fired[]).map((s) => ({
          cells: [],
          edges: [],
          edgeValues: (s.witness as Witness).corners.map((a): [number, number] => [
            a,
            s.b["d"] === 2 ? AT_LEAST_ONE : AT_MOST_ONE,
          ]),
        }));
      case "cornerOther": {
        // At most one where a line is, at least one where an edge is empty.
        const a = num(r, "a");
        bits.push([a, m.grid[num(r, "e")] === LINE ? AT_MOST_ONE : AT_LEAST_ONE]);
        break;
      }
      case "cornerBoth": {
        const a = num(r, "a");
        // Both edges empty where at most one line, both lines where at least one.
        bits.push([a, (m.edgeCands[a] & 4) === 0 ? AT_MOST_ONE : AT_LEAST_ONE]);
        break;
      }
      case "cornerAcross":
        bits.push([num(r, "a"), AT_LEAST_ONE]);
        break;
      case "cornerExit":
      case "cornerOppositeExit":
      case "pairFromCorner":
        both(num(r, "a"));
        break;
      case "matchingPair":
      case "parityClue":
      case "parityDot":
      case "linkClue":
      case "linkDot":
      case "cornerFromPair":
        chain = relations.path(num(r, "e"), num(r, "g"));
        break;
      case "related":
        chain = relations.path(num(r, "g"), num(r, "e"));
        break;
    }
    chains.set(f, chain);
    return {
      cells: [],
      edges: [],
      edgeValues: bits,
      relations: chain.map((l) => relationKey(l.edges[0], l.edges[1])),
    };
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
  const walk = ladderWalk(m, order, { [TIERS]: DIFF_HARD }, reads, { citing });
  const angleEdges = (a: number): readonly [number, number] => [
    sp.angleEdges[a][0],
    sp.angleEdges[a][1],
  ];
  let count = 0;
  const next = (): LoopyFiring | null => {
    for (;;) {
      const before = m.grid.slice();
      const first = walk.graph.facts.length;
      const got = walk.next();
      if (got === null) return null;
      if (got === "contradiction") {
        board.status = "mistake";
        return null;
      }
      const firing = count++;
      const ops: RecordedOp[] = [];
      for (const e of sp.edges)
        if (m.grid[e] !== before[e]) {
          const line = lineOf(m.grid[e]);
          work.lines[e] = line;
          ops.push({ edge: e, state: line });
        }
      const r = got.reasons[0] as Fired;
      for (let i = 0; i < got.facts.length; i += 3) {
        const noting = got.facts[i] === STRIKE_EDGE || got.facts[i] === RELATE;
        if (noting === ops.length > 0)
          throw new Error(`loopy hint: ${r.kind} both draws lines and makes notes`);
        if (!noting) continue;
        const note = noteOf(got, i, first + i / 3);
        notes.set(note.id, note);
        if (note.kind === "relation")
          relations.add({ edges: note.edges, opposite: note.opposite });
      }
      if (ops.length === 0) continue;
      return {
        reason: lineReason(sp, r, before, ops, chains.get(got) ?? []),
        ops,
        tier: got.entry.tier,
        firing,
      };
    }
  };
  const noteOf = (got: Taken, i: number, id: number): Note => {
    const at = got.facts[i + 1];
    const v = got.facts[i + 2];
    const s = got.reasons[i / 3] as Fired;
    const chain = chains.get(got) ?? [];
    if (got.facts[i] === RELATE) {
      const edges: readonly [number, number] = [at, v >> 2];
      const opposite = (v & 3) === 2;
      return { kind: "relation", id, edges, opposite, why: relationWhy(s, chain) };
    }
    const bound: Bound = v === AT_MOST_ONE ? "atMostOne" : "atLeastOne";
    return {
      kind: "corner",
      id,
      dline: at,
      dot: sp.angleCell[at],
      edges: angleEdges(at),
      bound,
      why: cornerWhy(s, bound, chain),
    };
  };
  const relationWhy = (s: Fired, chain: readonly Link[]): RelationWhy => {
    switch (s.kind) {
      case "pairFromCorner":
        return {
          kind: "exactlyOneAtCorner",
          dot: sp.angleCell[num(s, "a")],
          from: num(s, "a"),
        };
      case "pairAtClue":
        return { kind: "faceParity", face: num(s, "f") };
      case "pairAtDot":
        return { kind: "dotParity", dot: num(s, "c") };
      case "linkClue":
        return { kind: "faceLink", face: num(s, "f"), path: chain };
      case "linkDot":
        return { kind: "dotLink", dot: num(s, "c"), path: chain };
      default:
        throw new Error(`loopy hint: ${s.kind} relates no edges`);
    }
  };
  const cornerWhy = (s: Fired, bound: Bound, chain: readonly Link[]): CornerWhy => {
    switch (s.kind) {
      case "cornerAtDot":
        return { kind: bound === "atMostOne" ? "lineElsewhere" : "onlyWayOn" };
      case "cornerFromClue":
        return { kind: "clue", face: num(s, "f"), witness: s.witness as Witness };
      case "cornerAcross":
        return { kind: "acrossTheDot", from: num(s, "a") };
      case "cornerOppositeExit":
        return { kind: "exactlyOneAcross", from: num(s, "a") };
      case "cornerFromPair":
        return { kind: "opposites", path: chain };
      default:
        throw new Error(`loopy hint: ${s.kind} narrows no corner`);
    }
  };
  return { board, graph: walk.graph, notes, angleEdges, next };
}

const num = (r: Fired, k: string): number => r.b[k] as number;

/** Why a firing that draws lines holds, in the hint's terms. */
function lineReason(
  sp: GridSpace,
  r: Fired,
  before: ArrayLike<number>,
  ops: readonly RecordedOp[],
  chain: readonly Link[],
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
      return { kind: "corner", dot: sp.angleCell[a], dline: a, bound };
    }
    case "clueBound":
      return {
        kind: "clueBound",
        face: num(r, "f"),
        edge: num(r, "e"),
        witness: r.witness as Witness,
      };
    case "cornerExit": {
      const a = num(r, "a");
      return { kind: "cornerExit", dot: sp.angleCell[a], dline: a };
    }
    case "matchingPair":
      return { kind: "matchingPair", face: num(r, "f"), path: chain };
    case "parityClue":
    case "parityDot":
      return {
        kind: "parity",
        face: r.kind === "parityClue" ? num(r, "f") : null,
        dot: r.kind === "parityDot" ? num(r, "c") : null,
        path: chain,
      };
    case "related":
      return { kind: "related", from: num(r, "g"), path: chain };
    default:
      throw new Error(`loopy hint: ${r.kind} draws no line a hint narrates`);
  }
}

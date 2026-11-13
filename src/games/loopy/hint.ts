/**
 * Loopy's explained hint: the plan, walked on a copy of the player's own board.
 *
 * **Threaded through the solver, not written beside it.** The plan walks the
 * ladder the solver runs (`solver.ts`, {@link hintWalk}), each firing paired
 * with why it holds: among the easiest tier's firings it takes the one beside
 * the line it is drawing.
 *
 * **Sound because the mistake check vouches for every mark.** `findMistakes`
 * compares the board, notes included, with its unique solution and the hint
 * refuses on any wrong one, so the plan may take the player's marks as facts.
 *
 * **Every fact a step rests on is a note on the board first** (docs/hints-marks.md
 * § "Give the facts a notation"). From Normal the solver reasons about
 * corners and pairs of edges, which the player notes in notes mode. Each such fact
 * a line depends on becomes a step placing that note, as close before the line as
 * its sentence stays true ({@link planSteps}); the line's own step then cites the
 * notes. A pair derived through a chain of pairs is placed one link at a time, so no
 * step cites more than two.
 */

import { Dsf } from "../../engine/dsf.ts";
import { type FactGraph, placeNotes } from "../../engine/fact-graph.ts";
import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import {
  CONTRADICTION_UNLOCALIZED,
  DEDUCTION_EXHAUSTED,
} from "../../engine/hint-refusal.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import {
  type CornerBound,
  type CornerThen,
  EDGE,
  type Marked,
  say,
} from "./hint-text.ts";
import type { LoopyMove, LoopyOp } from "./index.ts";
import {
  type CornerNote,
  type HintBoard,
  hintBoardSolved,
  hintWalk,
  type Link,
  type LoopyFiring,
  type Note,
  type RelationNote,
} from "./solver.ts";
import {
  AF_ADAPTIVE,
  AF_FIXED,
  autofollowEdges,
  forcedRuleOuts,
  LINE_NO,
  LINE_UNKNOWN,
  LINE_YES,
  type LineState,
  type LoopyPair,
  type LoopyState,
} from "./state.ts";

type Marks = Omit<Marked, "targets">;

/**
 * The hint's rungs: a line step is the solver's firing, by its reason's kind,
 * and a note step is the sentence that places the note.
 */
export const LOOPY_RUNGS = [
  "clueFull",
  "clueStarved",
  "clueOneShort",
  "clueBlockedPair",
  "deadEnd",
  "lineContinues",
  "dotFull",
  "clueBound",
  "corner",
  "cornerExit",
  "matchingPair",
  "parity",
  "related",
  "earlyLoop",
  "cornerAtDot",
  "cornerFromClue",
  "cornerAcross",
  "cornerOppositeExit",
  "cornerFromPair",
  "pairAtClue",
  "pairAtDot",
  "pairAtCorner",
  "pairAcrossClue",
  "pairAcrossDot",
  "pairChain",
] as const;
export type LoopyRung = (typeof LOOPY_RUNGS)[number];

type Step = HintStep<LoopyMove, unknown, LoopyRung>;

/** One firing as the plan keeps it: the board just before it. */
interface Planned extends LoopyFiring {
  readonly before: Uint8Array;
}

type PlanStatus = "solved" | "incomplete";

/** The line firings from the player's position, the walk's graph of facts, and
 * the notes among them. `contradiction` when the solver found the marks
 * inconsistent, which only a board no solution vouches for can reach. */
export function deduceLoopyPlan(state: LoopyState): {
  plan: Planned[];
  graph: FactGraph;
  notes: ReadonlyMap<number, Note>;
  angleEdges: (angle: number) => readonly [number, number];
  contradiction: boolean;
} {
  const { board, graph, notes, angleEdges, next } = hintWalk(
    state,
    stepBudget("loopy hint plan"),
  );
  const { plan } = deduceHintPlan<HintBoard, Planned, PlanStatus>({
    board,
    status: (b) => (hintBoardSolved(b) ? "solved" : "incomplete"),
    incomplete: "incomplete",
    next: (b) => {
      const f = next();
      if (f === null) return null;
      const before = b.state.lines.slice();
      for (const op of f.ops) before[op.edge] = LINE_UNKNOWN;
      return { ...f, before };
    },
  });
  return { plan, graph, notes, angleEdges, contradiction: board.status === "mistake" };
}

const BIT = { atLeastOne: 1, atMostOne: 2 } as const;

const pairOf = (a: number, b: number, opposite: boolean): LoopyPair =>
  a < b ? { a, b, opposite } : { a: b, b: a, opposite };

const pairKey = (a: number, b: number): string => (a < b ? `${a}:${b}` : `${b}:${a}`);

/** The notes on the board as the plan goes: the player's, then each one placed. */
class Notes {
  readonly corners: Uint8Array;
  private readonly pairs: Map<string, boolean>;

  constructor(state: LoopyState) {
    this.corners = state.corners.slice();
    this.pairs = new Map(state.pairs.map((p) => [pairKey(p.a, p.b), p.opposite]));
  }

  hasPair(a: number, b: number): boolean {
    return this.pairs.has(pairKey(a, b));
  }

  addPair(p: LoopyPair): void {
    this.pairs.set(pairKey(p.a, p.b), p.opposite);
  }
}

interface Planner {
  readonly state: LoopyState;
  readonly angleEdges: (angle: number) => readonly [number, number];
  readonly notes: Notes;
  readonly steps: Step[];
}

const NO_MARKS: Marks = {
  placedCorner: null,
  placedPair: null,
  faces: [],
  dots: [],
  edges: [],
  corners: [],
  pairs: [],
};

/** The words a step speaks, given the marks it draws. */
type Words = (m: Marked) => Sentence;

function push(
  pl: Planner,
  rung: LoopyRung,
  move: LoopyMove,
  words: Words,
  marks: Partial<Marks>,
  targets: readonly number[] = [],
): void {
  const said = words({ ...NO_MARKS, ...marks, targets });
  pl.steps.push({ move, rung, explanation: said.text, words: said });
}

const yesAround = (
  edges: readonly ({ index: number } | null)[],
  lines: Uint8Array,
): number => edges.filter((e) => e !== null && lines[e.index] === LINE_YES).length;

/**
 * The one pair a chain of relations comes to, placing it a link at a time: from
 * A–B and B–C on the board, a step marks A–C, and so on to the chain's far end.
 */
function chainPair(pl: Planner, links: readonly Link[]): LoopyPair {
  const [x, y] = links[0].edges;
  if (links.length === 1) return pairOf(x, y, links[0].opposite);
  const start = links[1].edges.includes(x) ? y : x;
  let end = start === x ? y : x;
  let opposite = links[0].opposite;
  for (const link of links.slice(1)) {
    const [p, q] = link.edges;
    if (p !== end && q !== end) throw new Error("loopy hint: a chain with a gap");
    const next = p === end ? q : p;
    const joined = pairOf(start, next, opposite !== link.opposite);
    if (!pl.notes.hasPair(start, next)) {
      const first = opposite;
      push(
        pl,
        "pairChain",
        { kind: "pair", a: joined.a, b: joined.b, relation: relationWord(joined) },
        (m) => say.pairChain(first, link.opposite, m),
        {
          placedPair: joined,
          edges: [end],
          pairs: [pairOf(start, end, opposite), pairOf(end, next, link.opposite)],
        },
      );
      pl.notes.addPair(joined);
    }
    end = next;
    opposite = joined.opposite;
  }
  return pairOf(start, end, opposite);
}

const relationWord = (p: LoopyPair): "match" | "opposite" =>
  p.opposite ? "opposite" : "match";

const AT_DOT = new Set(["lineElsewhere", "onlyWayOn"]);

/** Whether two facts about one corner place one note together: both bits read off
 * the dot's own line, or both off one pair. */
const together = (f: CornerNote, g: CornerNote): boolean =>
  f.dline === g.dline &&
  ((AT_DOT.has(f.why.kind) && AT_DOT.has(g.why.kind)) ||
    (f.why.kind === "opposites" && g.why.kind === "opposites"));

/** A step placing one corner note: one fact, or two facts from one premise. */
function placeCorner(pl: Planner, group: readonly CornerNote[]): void {
  const f = group[0];
  let bits = 0;
  for (const g of group) bits |= BIT[g.bound];
  const had = pl.notes.corners[f.dline];
  if ((had & bits) === bits) return;
  const bound: CornerBound = bits === 3 ? "exactlyOne" : f.bound;
  const clue = (face: number): number => pl.state.clues[face];

  let rung: LoopyRung;
  let words: Words;
  let marks: Partial<Marks>;
  const why = f.why;
  switch (why.kind) {
    case "lineElsewhere":
    case "onlyWayOn":
      rung = "cornerAtDot";
      words = (m) => say.cornerAtDot(bound, m);
      marks = { dots: [f.dot] };
      break;
    case "clue":
      rung = "cornerFromClue";
      words = (m) => say.cornerFromClue(clue(why.face), why.witness.total, f.bound, m);
      marks = { faces: [why.face], corners: [...why.witness.corners] };
      break;
    case "acrossTheDot":
      rung = "cornerAcross";
      words = say.cornerAcross;
      marks = { dots: [f.dot], corners: [why.from] };
      break;
    case "exactlyOneAcross":
      rung = "cornerOppositeExit";
      words = say.cornerOppositeExit;
      marks = { dots: [f.dot], corners: [why.from] };
      break;
    case "opposites":
      rung = "cornerFromPair";
      marks = { pairs: [chainPair(pl, why.path)] };
      words = (m) => say.cornerFromPair(bound, m);
      break;
  }
  const next = had | bits;
  push(pl, rung, { kind: "corner", dline: f.dline, bits: next }, words, {
    ...marks,
    placedCorner: f.dline,
  });
  pl.notes.corners[f.dline] = next;
}

/** A step placing one pair note. */
function placePair(pl: Planner, f: RelationNote, before: Uint8Array): void {
  const [a, b] = f.edges;
  if (pl.notes.hasPair(a, b)) return;
  const g = pl.state.grid;
  const needed = (face: number): number =>
    pl.state.clues[face] - yesAround(g.faces[face].edges, before);
  const dotLines = (dot: number): number => yesAround(g.dots[dot].edges, before);

  let rung: LoopyRung;
  let words: Words;
  let marks: Partial<Marks>;
  const why = f.why;
  switch (why.kind) {
    case "faceParity": {
      rung = "pairAtClue";
      const clue = pl.state.clues[why.face];
      const more = needed(why.face);
      words = (m) => say.pairAtClue(clue, more, f.opposite, m);
      marks = { faces: [why.face] };
      break;
    }
    case "dotParity": {
      rung = "pairAtDot";
      const lines = dotLines(why.dot);
      words = (m) => say.pairAtDot(lines, f.opposite, m);
      marks = { dots: [why.dot] };
      break;
    }
    case "exactlyOneAtCorner":
      rung = "pairAtCorner";
      words = say.pairAtCorner;
      marks = { corners: [why.from] };
      break;
    case "faceLink": {
      rung = "pairAcrossClue";
      const pair = chainPair(pl, why.path);
      const clue = pl.state.clues[why.face];
      const more = needed(why.face);
      words = (m) => say.pairAcrossClue(clue, more, pair.opposite, f.opposite, m);
      marks = { faces: [why.face], pairs: [pair] };
      break;
    }
    case "dotLink": {
      rung = "pairAcrossDot";
      const pair = chainPair(pl, why.path);
      const lines = dotLines(why.dot);
      words = (m) => say.pairAcrossDot(lines, pair.opposite, f.opposite, m);
      marks = { dots: [why.dot], pairs: [pair] };
      break;
    }
  }
  const placed = pairOf(a, b, f.opposite);
  push(
    pl,
    rung,
    { kind: "pair", a: placed.a, b: placed.b, relation: relationWord(placed) },
    words,
    { ...marks, placedPair: placed },
  );
  pl.notes.addPair(placed);
}

/** The lines of the drawn chain an edge's dots already belong to. */
function chainThrough(state: LoopyState, lines: Uint8Array, edge: number): number[] {
  const g = state.grid;
  const seen = new Set<number>([g.edges[edge].dot1.index]);
  const queue = [g.edges[edge].dot1.index];
  const out: number[] = [];
  for (let i = 0; i < queue.length; i++) {
    for (const e of g.dots[queue[i]].edges) {
      if (lines[e.index] !== LINE_YES) continue;
      if (!out.includes(e.index)) out.push(e.index);
      for (const d of [e.dot1.index, e.dot2.index]) {
        if (seen.has(d)) continue;
        seen.add(d);
        queue.push(d);
      }
    }
  }
  return out;
}

/** The clues a loop closed by `edge` would leave unmet. */
function unmetClues(state: LoopyState, lines: Uint8Array, edge: number): number[] {
  const g = state.grid;
  const out: number[] = [];
  for (let i = 0; i < g.numFaces; i++) {
    const clue = state.clues[i];
    if (clue < 0) continue;
    const f = g.faces[i];
    const gains = f.edges.some((e) => e?.index === edge) ? 1 : 0;
    if (yesAround(f.edges, lines) + gains !== clue) out.push(i);
  }
  return out;
}

/** The sentence and the marks for one line firing, placing first any pair its
 * chain of pairs comes to. */
function narrate(pl: Planner, p: Planned): { words: Words; marks: Partial<Marks> } {
  const state = pl.state;
  const r = p.reason;
  const line = p.ops[0].state === LINE_YES;
  const clue = (face: number): number => state.clues[face];

  switch (r.kind) {
    case "clueFull":
      return {
        words: (m) => say.clueFull(clue(r.face), m),
        marks: { faces: [r.face] },
      };
    case "clueStarved":
      return {
        words: (m) => say.clueStarved(clue(r.face), m),
        marks: { faces: [r.face] },
      };
    case "clueOneShort":
      return {
        words: (m) => say.clueOneShort(clue(r.face), m),
        marks: { faces: [r.face], dots: [r.dot] },
      };
    case "clueBlockedPair":
      // Both dots, because the sentence says "both outlined dots": with one ring
      // the reader cannot tell which edge "joining them" means. The edges the
      // step sets are banded by the move itself.
      return {
        words: (m) => say.clueBlockedPair(clue(r.face), r.between, m),
        marks: { faces: [r.face], dots: [...r.dots] },
      };
    case "deadEnd":
      return { words: say.deadEnd, marks: { dots: [r.dot] } };
    case "lineContinues":
      return { words: say.lineContinues, marks: { dots: [r.dot] } };
    case "dotFull":
      return { words: say.dotFull, marks: { dots: [r.dot] } };

    case "earlyLoop": {
      const edge = p.ops[0].edge;
      const unmet = r.because === "unmetClues" ? unmetClues(state, p.before, edge) : [];
      return {
        words: (m) => say.earlyLoop(r.because, m),
        marks: { edges: chainThrough(state, p.before, edge), faces: unmet },
      };
    }
    case "clueBound": {
      const c = clue(r.face);
      return {
        words: (m) => (line ? say.boundLine(c, m) : say.boundEmpty(c, m)),
        marks: { faces: [r.face], corners: [...r.witness.corners] },
      };
    }

    case "corner":
    case "cornerExit": {
      const bound: CornerBound = r.kind === "cornerExit" ? "exactlyOne" : r.bound;
      const [a, b] = pl.angleEdges(r.dline);
      const bothOpen = p.before[a] === LINE_UNKNOWN && p.before[b] === LINE_UNKNOWN;
      let then: CornerThen;
      if (r.kind === "cornerExit") then = "exit";
      else if (bound === "atLeastOne") then = bothOpen ? "bothLines" : "otherLine";
      else then = bothOpen ? "neither" : "otherEmpty";
      const ringed = then === "bothLines" || then === "neither" || then === "exit";
      return {
        words: (m) => say.corner(bound, then, m),
        marks: { corners: [r.dline], dots: ringed ? [r.dot] : [] },
      };
    }

    case "matchingPair":
      return {
        marks: { faces: [r.face], pairs: [chainPair(pl, r.path)] },
        words: (m) => say.matchingPair(clue(r.face), line, m),
      };

    case "parity": {
      const pair = chainPair(pl, r.path);
      if (r.face !== null) {
        const c = clue(r.face);
        const needed = c - yesAround(state.grid.faces[r.face].edges, p.before);
        return {
          words: (m) => say.parityFace(c, needed, pair.opposite, line, m),
          marks: { faces: [r.face], pairs: [pair] },
        };
      }
      const dot = r.dot ?? 0;
      const dotLines = yesAround(state.grid.dots[dot].edges, p.before);
      return {
        words: (m) => say.parityDot(dotLines, pair.opposite, line, m),
        marks: { dots: [dot], pairs: [pair] },
      };
    }

    case "related": {
      const pair = chainPair(pl, r.path);
      const fromLine = p.before[r.from] === LINE_YES;
      return {
        words: (m) => say.related(pair.opposite, fromLine, line, m),
        marks: { edges: [r.from], pairs: [pair] },
      };
    }
  }
}

/**
 * Whether a note's own sentence can stop being true as the board fills.
 *
 * A fact only accumulates, so deferring a note can never make it underivable — but
 * the sentence quotes the board, and some premises expire. This branches on the
 * sentence `placeCorner` or `placePair` would produce, never on the fact's kind,
 * which does not track it: `cornerFromClue` has an expiring branch and
 * `pairAtCorner` is monotone. `findings.md` § "Which note sentences survive being
 * deferred" classifies all of them.
 */
export function sentenceExpires(state: LoopyState, f: Note): boolean {
  if (f.kind === "relation") {
    // "Only these two edges are still open", and the "four open edges" of the
    // across-a-clue pairs, both name a set that only shrinks. `pairAtCorner` cites
    // a corner note, which stays put.
    return f.why.kind !== "exactlyOneAtCorner";
  }
  if (f.why.kind !== "clue" || f.bound !== "atMostOne") return false;
  // Of `cornerFromClue`'s branches only "already give it N" counts drawn lines, and
  // that count grows. The "at most" branches state an upper bound, which stays true
  // as the real maximum falls, and the `1` branch cites the clue alone.
  return !(state.clues[f.why.face] === 1 && f.why.witness.corners.length === 0);
}

const openAround = (edges: readonly ({ index: number } | null)[], lines: Uint8Array) =>
  edges.filter((e) => e !== null && lines[e.index] === LINE_UNKNOWN).length;

/**
 * Whether the sentence placing `f` is still true of `lines`, a board later than the
 * one it was found on. Every expiring premise fails once and stays failed, because
 * an edge once settled stays settled.
 */
function sentenceHolds(
  state: LoopyState,
  angleEdges: (angle: number) => readonly [number, number],
  f: Note,
  lines: Uint8Array,
): boolean {
  if (!sentenceExpires(state, f)) return true;
  const g = state.grid;
  if (f.kind === "relation") {
    switch (f.why.kind) {
      case "faceParity":
      case "dotParity":
        // "Only these two are still open": the others were settled when it was said.
        return f.edges.every((e) => lines[e] === LINE_UNKNOWN);
      case "faceLink":
        return openAround(g.faces[f.why.face].edges, lines) === 4;
      case "dotLink":
        return openAround(g.dots[f.why.dot].edges, lines) === 4;
      default:
        return true;
    }
  }
  if (f.why.kind !== "clue") return true;
  // "Already give it N": no line has joined the ones the count was taken over.
  const counted = new Set<number>(f.edges);
  for (const a of f.why.witness.corners) for (const e of angleEdges(a)) counted.add(e);
  const drawn = g.faces[f.why.face].edges.filter(
    (e) => e !== null && !counted.has(e.index) && lines[e.index] === LINE_YES,
  ).length;
  return drawn === f.why.witness.edges.length;
}

/**
 * The facts placed at one plan position, split into the separate deductions they
 * make: two facts share a group when one cites the other or they place one note
 * together. Each group comes out deepest first, a branch at a time, so one leg
 * follows from the leg before it wherever the derivation allows.
 */
function deductions(
  graph: FactGraph,
  notes: ReadonlyMap<number, Note>,
  ids: readonly number[],
): number[][] {
  const facts = (id: number): Note => {
    const note = notes.get(id);
    if (note === undefined) throw new Error(`loopy hint: fact ${id} is no note`);
    return note;
  };
  /** What a fact cites, in the order its legs read: the two bits of one corner
   * with "at least one" first, so "exactly one" reads from its parts. */
  const citesOf = (id: number): readonly number[] => {
    const parents = graph.facts[id].parents ?? [];
    const firstOf = new Map<number, number>();
    for (const p of parents) {
      const n = notes.get(p);
      if (n?.kind === "corner" && !firstOf.has(n.dline)) firstOf.set(n.dline, p);
    }
    const key = (p: number): [number, number] => {
      const n = notes.get(p);
      if (n?.kind !== "corner") return [p, 0];
      return [firstOf.get(n.dline) as number, n.bound === "atLeastOne" ? 0 : 1];
    };
    return [...parents].sort((x, y) => key(x)[0] - key(y)[0] || key(x)[1] - key(y)[1]);
  };
  const here = new Set(ids);
  const dsf = new Dsf(graph.facts.length);
  const join = (a: number, b: number): void => dsf.merge(a, b);
  const partner = new Map<number, number>();
  for (const id of ids) {
    const f = facts(id);
    for (const c of citesOf(id)) if (here.has(c)) join(id, c);
    if (f.kind !== "corner" || partner.has(id)) continue;
    const g = ids.find((o) => {
      const h = facts(o);
      return o !== id && !partner.has(o) && h.kind === "corner" && together(f, h);
    });
    if (g !== undefined) {
      partner.set(id, g);
      partner.set(g, id);
      join(id, g);
    }
  }

  const groups = new Map<number, number[]>();
  for (const id of ids) {
    const r = dsf.canonify(id);
    groups.set(r, [...(groups.get(r) ?? []), id]);
  }
  const cited = new Set(ids.flatMap((id) => citesOf(id)));
  return [...groups.values()].map((group) => {
    const out: number[] = [];
    const seen = new Set<number>();
    const visit = (id: number): void => {
      if (seen.has(id)) return;
      seen.add(id);
      const mate = partner.get(id);
      if (mate !== undefined) seen.add(mate);
      for (const c of citesOf(id)) if (here.has(c)) visit(c);
      if (mate !== undefined) for (const c of citesOf(mate)) if (here.has(c)) visit(c);
      // A shared note is narrated from its first fact, the one found first.
      if (mate === undefined) out.push(id);
      else out.push(Math.min(id, mate), Math.max(id, mate));
    };
    for (const id of group) if (!cited.has(id)) visit(id);
    for (const id of group) visit(id);
    return out;
  });
}

/**
 * The plan's steps: the notes each line firing rests on, then the firing itself.
 *
 * A note whose sentence survives the board filling up is placed just before the
 * firing that cites it, rather than where the solver happened to find the fact —
 * which was a median of 15 firings earlier, and up to 143 (`findings.md`). A note
 * whose sentence can go stale is placed at the latest position it still describes,
 * which is beside its consumer whenever the board allows. No note is placed before a
 * note it cites.
 *
 * **A journey is one deduction.** The notes placed at one position split into the
 * separate derivations they make ({@link deductions}), and each is its own journey:
 * one that dumped them all in front of the line read as a tour of the board, since
 * independent derivations sit wherever their clues are. A firing resting on a single
 * derivation arrives as that derivation's last leg; one combining several is a
 * journey of its own after them, and a note no firing at that position cites is
 * never inside a firing's journey.
 *
 * Facts no line rests on are never placed, so a player is never asked to note
 * something no later step uses.
 */
function planSteps(
  state: LoopyState,
  { plan, graph, notes, angleEdges }: ReturnType<typeof deduceLoopyPlan>,
): Step[] {
  const pl: Planner = { state, angleEdges, notes: new Notes(state), steps: [] };
  const stepOf = new Map(plan.map((p, i) => [p.firing, i]));
  const factsOf = new Map<number, number[]>();
  for (const f of graph.facts) {
    const list = factsOf.get(f.firing);
    if (list === undefined) factsOf.set(f.firing, [f.id]);
    else list.push(f.id);
  }
  /** What each step rests on, deepest first. */
  const closure = plan.map(
    (p) =>
      new Set(
        (factsOf.get(p.firing) ?? []).flatMap((id) =>
          graph.restsOn(id).facts.map((f) => f.id),
        ),
      ),
  );
  const { steps: stepFirings, before } = placeNotes(graph, {
    isNote: (f) => f.about.space !== "cells",
    expired: (note, step) =>
      !sentenceHolds(
        state,
        angleEdges,
        notes.get(note) as Note,
        plan[stepOf.get(step) as number].before,
      ),
  });
  if (stepFirings.some((f, i) => f !== plan[i].firing))
    throw new Error("loopy hint: the graph's steps are not the line firings");

  /** Flag every leg after `start` as continuing the journey `start` leads. */
  const journey = (start: number): void => {
    for (let k = start + 1; k < pl.steps.length; k++)
      pl.steps[k].continuesPrevious = true;
  };

  plan.forEach((p, i) => {
    const groups = deductions(graph, notes, before[i]);
    const uses = (group: readonly number[]): boolean =>
      group.some((id) => closure[i].has(id));
    // The groups this firing does not rest on first, so its own come straight before it.
    const ordered = [...groups.filter((g) => !uses(g)), ...groups.filter(uses)];
    let lastStart = -1;
    let usedGroups = 0;
    for (const group of ordered) {
      const start = pl.steps.length;
      for (let k = 0; k < group.length; k++) {
        const f = notes.get(group[k]) as Note;
        if (f.kind === "relation") {
          placePair(pl, f, p.before);
          continue;
        }
        const g = k + 1 < group.length ? (notes.get(group[k + 1]) as Note) : null;
        if (g?.kind === "corner" && together(f, g)) {
          placeCorner(pl, [f, g]);
          k++;
        } else {
          placeCorner(pl, [f]);
        }
      }
      // Counted from what actually landed: `placeCorner` and `placePair` return
      // early when the note is already there, and `chainPair` pushes a leg per link.
      if (pl.steps.length === start) continue;
      journey(start);
      if (uses(group)) {
        usedGroups++;
        lastStart = start;
      }
    }
    const lineStart = usedGroups === 1 ? lastStart : pl.steps.length;
    const { words, marks } = narrate(pl, p);
    const ops: LoopyOp[] = p.ops.map(({ edge, state: to }) => ({ edge, state: to }));
    push(
      pl,
      p.reason.kind,
      { kind: "set", ops },
      words,
      marks,
      ops.map((o) => o.edge),
    );
    journey(lineStart);
  });
  return pl.steps;
}

export function hint(state: LoopyState): HintResult<LoopyMove, unknown, LoopyRung> {
  const found = deduceLoopyPlan(state);
  if (found.plan.length === 0) {
    return {
      ok: false,
      error: found.contradiction ? CONTRADICTION_UNLOCALIZED : DEDUCTION_EXHAUSTED,
    };
  }
  return { ok: true, steps: planSteps(state, found) };
}

/**
 * Whether a move follows the step. Handed the board before the move.
 *
 * A line step completes once every edge it sets is set its way, and tracks a move
 * setting some of them. A note step completes once the note holds what the step
 * places, and tracks a move cycling that same note towards it, since a tap steps a
 * note through its states one at a time.
 */
export function hintKeepTrack(
  m: LoopyMove,
  step: HintStep<LoopyMove>,
  state: LoopyState,
): HintTrackVerdict {
  const want = step.move;
  switch (want.kind) {
    case "corner":
      if (m.kind !== "corner" || m.dline !== want.dline) return "off";
      return (m.bits & want.bits) === want.bits ? "completed" : "onTrack";
    case "pair":
      if (m.kind !== "pair" || pairKey(m.a, m.b) !== pairKey(want.a, want.b))
        return "off";
      return m.relation === want.relation ? "completed" : "onTrack";
    case "set":
    case "solve": {
      if (m.kind !== "set") return "off";
      const lines = new Map(want.ops.map((o) => [o.edge, o.state]));
      // A player with `autoRuleOut` on draws the hint's line and the exclusions that
      // line forces, in one move. Those extra ops are this step taken, not a
      // different move, so they are tolerated — but **derived from `want`**, so an
      // exclusion the step does not force is still a divergence and still drops the
      // plan. Without this, 27.8% of Loopy's own `set` steps verdicted "off" when
      // followed with the aid on (measured over three 7x7 Tricky plans).
      // Auto-follow extends a click only through dots where the line has one
      // way on, so the corridor it adds is forced by the step's own edges and is
      // tolerated the same way, under either setting.
      let followed: Map<number, LineState> | null = null;
      const corridor = (): Map<number, LineState> => {
        if (followed) return followed;
        followed = new Map(lines);
        for (const [edge, to] of lines)
          for (const autofollow of [AF_FIXED, AF_ADAPTIVE])
            for (const e of autofollowEdges(
              state,
              { autofollow },
              state.grid.edges[edge],
            ))
              if (!followed.has(e)) followed.set(e, to);
        return followed;
      };
      let forced: Set<number> | null = null;
      for (const op of m.ops) {
        if (lines.get(op.edge) === op.state) continue;
        if (corridor().get(op.edge) === op.state) continue;
        if (op.state !== LINE_NO) return "off";
        forced ??= new Set(forcedRuleOuts(state, corridor()));
        if (!forced.has(op.edge)) return "off";
      }
      const moved = new Map(m.ops.map((o) => [o.edge, o.state]));
      for (const [edge, to] of lines) {
        if ((moved.get(edge) ?? state.lines[edge]) !== to) return "onTrack";
      }
      return "completed";
    }
  }
}

/** Drop the edges the board already has as the step wants them, or the whole step
 * once its note is already there. */
export function refreshHintStep<H, R extends string>(
  step: HintStep<LoopyMove, H, R>,
  state: LoopyState,
): HintStep<LoopyMove, H, R> | null {
  const move = step.move;
  switch (move.kind) {
    case "corner":
      return (state.corners[move.dline] & move.bits) === move.bits ? null : step;
    case "pair": {
      const opposite = move.relation === "opposite";
      const there = state.pairs.some(
        (p) => pairKey(p.a, p.b) === pairKey(move.a, move.b) && p.opposite === opposite,
      );
      return there ? null : step;
    }
    case "set":
    case "solve": {
      const ops = move.ops.filter((o) => state.lines[o.edge] !== o.state);
      if (ops.length === move.ops.length) return step;
      if (ops.length === 0) return null;
      const kept = new Set(ops.map((o) => EDGE.key(o.edge)));
      const words = step.words?.narrow(
        (role, kind, key) => role !== "ring" || kind !== EDGE.name || kept.has(key),
      );
      return {
        ...step,
        ...(words && { words, explanation: words.text }),
        move: { ...move, ops },
      };
    }
  }
}

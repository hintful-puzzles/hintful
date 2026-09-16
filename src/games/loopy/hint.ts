/**
 * Loopy's explained hint: the plan, walked on a copy of the player's own board.
 *
 * **Threaded through the solver, not written beside it.** Loopy's rungs are the
 * solver's own (`solver.ts`), run with a recorder that names the premise behind
 * each change and returns at the first one, and with the tiers tried easiest
 * first ({@link nextFiring}). The generator never builds a recorder, so no board
 * changes; the frozen differential is the proof.
 *
 * **Sound because the mistake check vouches for every mark.** `findMistakes`
 * compares the board, notes included, with its unique solution and the hint
 * refuses on any wrong one, so the plan may take the player's marks as facts.
 *
 * **Every fact a step rests on is a note on the board first** (docs/games/hints.md
 * § "The marks have to be the player's own"). From Normal the solver reasons about
 * corners and pairs of edges, which the player notes in notes mode. Each such fact
 * a line depends on becomes a step placing that note, at the point in the plan
 * where it was found, so its sentence is read against the lines it was derived
 * from; the line's own step then cites the notes. A pair derived through a chain of
 * pairs is placed one link at a time, so no step cites more than two.
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import {
  CONTRADICTION_UNLOCALIZED,
  commonHintRefusal,
  DEDUCTION_EXHAUSTED,
} from "../../engine/hint-refusal.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { type CornerBound, type CornerThen, say } from "./hint-text.ts";
import type { LoopyMove, LoopyOp } from "./index.ts";
import {
  type CornerFact,
  firingRoots,
  type LoopyFact,
  type RelationFact,
} from "./record.ts";
import {
  hintBoardSolved,
  hintSolver,
  type LoopyFiring,
  nextFiring,
  type SolverState,
} from "./solver.ts";
import { LINE_UNKNOWN, LINE_YES, type LoopyPair, type LoopyState } from "./state.ts";

export interface LoopyHint {
  /** The edges the step sets. */
  readonly targets: readonly number[];
  /** The clues the sentence names or counts: outlined. */
  readonly faces: readonly number[];
  /** The dot the sentence names: ringed. */
  readonly dots: readonly number[];
  /** Lines the sentence cites: the loop an edge would close, the known edge a pair
   * relates this one to, or the edge two chained pairs share. */
  readonly edges: readonly number[];
  /** The corner notes the sentence reasons from, by dline. */
  readonly corners: readonly number[];
  /** The pair notes the sentence reasons from. */
  readonly pairs: readonly LoopyPair[];
}

type Marks = Omit<LoopyHint, "targets">;

/** One firing as the plan keeps it: the board just before it, and the facts it
 * rests on, deepest first. */
interface Planned extends LoopyFiring {
  readonly before: Uint8Array;
  readonly closure: readonly number[];
}

type PlanStatus = "solved" | "incomplete";

/** The line firings from the player's position, and every fact the recorder found
 * on the way. `contradiction` when the solver found the marks inconsistent, which
 * only a board no solution vouches for can reach. */
export function deduceLoopyPlan(state: LoopyState): {
  plan: Planned[];
  facts: readonly LoopyFact[];
  tickOf: readonly number[];
  contradiction: boolean;
} {
  const ss = hintSolver(state);
  const rec = ss.rec;
  if (rec === null) throw new Error("loopy hint: the hint solver has no recorder");
  const budget = stepBudget("loopy hint plan");
  const { plan } = deduceHintPlan<SolverState, Planned, PlanStatus>({
    board: ss,
    status: (b) => (hintBoardSolved(b) ? "solved" : "incomplete"),
    incomplete: "incomplete",
    next: (b) => {
      const f = nextFiring(b, () => budget.tick());
      if (f === null) return null;
      const before = b.state.lines.slice();
      for (const op of f.ops) before[op.edge] = LINE_UNKNOWN;
      rec.tick++;
      return { ...f, before, closure: rec.closure(firingRoots(f.reason)) };
    },
  });
  return {
    plan,
    facts: rec.facts,
    tickOf: rec.tickOf,
    contradiction: ss.status === "mistake",
  };
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
  readonly facts: readonly LoopyFact[];
  readonly notes: Notes;
  readonly steps: HintStep<LoopyMove, LoopyHint>[];
}

const NO_MARKS: Marks = { faces: [], dots: [], edges: [], corners: [], pairs: [] };

function push(
  pl: Planner,
  move: LoopyMove,
  explanation: string,
  marks: Partial<Marks>,
  targets: readonly number[] = [],
): void {
  pl.steps.push({ move, explanation, highlights: { ...NO_MARKS, ...marks, targets } });
}

function cornerOf(pl: Planner, id: number): CornerFact {
  const f = pl.facts[id];
  if (f.kind !== "corner")
    throw new Error("loopy hint: a corner premise that is not a corner");
  return f;
}

function relationOf(pl: Planner, id: number): RelationFact {
  const f = pl.facts[id];
  if (f.kind !== "relation")
    throw new Error("loopy hint: a pair premise that is not a pair");
  return f;
}

const yesAround = (
  edges: readonly ({ index: number } | null)[],
  lines: Uint8Array,
): number => edges.filter((e) => e !== null && lines[e.index] === LINE_YES).length;

/**
 * The one pair a chain of relations comes to, placing it a link at a time: from
 * A–B and B–C on the board, a step marks A–C, and so on to the chain's far end.
 */
function chainPair(pl: Planner, path: readonly number[]): LoopyPair {
  const links = path.map((id) => relationOf(pl, id));
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
      push(
        pl,
        { kind: "pair", a: joined.a, b: joined.b, relation: relationWord(joined) },
        say.pairChain(opposite, link.opposite),
        {
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
const together = (f: CornerFact, g: CornerFact): boolean =>
  f.dline === g.dline &&
  ((AT_DOT.has(f.why.kind) && AT_DOT.has(g.why.kind)) ||
    (f.why.kind === "opposites" && g.why.kind === "opposites"));

/** A step placing one corner note: one fact, or two facts from one premise. */
function placeCorner(pl: Planner, group: readonly CornerFact[]): void {
  const f = group[0];
  let bits = 0;
  for (const g of group) bits |= BIT[g.bound];
  const had = pl.notes.corners[f.dline];
  if ((had & bits) === bits) return;
  const bound: CornerBound = bits === 3 ? "exactlyOne" : f.bound;
  const clue = (face: number): number => pl.state.clues[face];

  let explanation: string;
  let marks: Partial<Marks>;
  const why = f.why;
  switch (why.kind) {
    case "note":
      return;
    case "lineElsewhere":
    case "onlyWayOn":
      explanation = say.cornerAtDot(bound);
      marks = { dots: [f.dot] };
      break;
    case "clue":
      explanation = say.cornerFromClue(
        clue(why.face),
        why.witness.total,
        why.witness.corners.length,
        f.bound,
      );
      marks = {
        faces: [why.face],
        corners: why.witness.corners.map((id) => cornerOf(pl, id).dline),
      };
      break;
    case "acrossTheDot":
      explanation = say.cornerAcross;
      marks = { dots: [f.dot], corners: [cornerOf(pl, f.parents[0]).dline] };
      break;
    case "exactlyOneAcross":
      explanation = say.cornerOppositeExit;
      marks = { dots: [f.dot], corners: [cornerOf(pl, f.parents[0]).dline] };
      break;
    case "opposites":
      marks = { pairs: [chainPair(pl, f.parents)] };
      explanation = say.cornerFromPair(bound);
      break;
  }
  const next = had | bits;
  push(pl, { kind: "corner", dline: f.dline, bits: next }, explanation, marks);
  pl.notes.corners[f.dline] = next;
}

/** A step placing one pair note. */
function placePair(pl: Planner, f: RelationFact, before: Uint8Array): void {
  const [a, b] = f.edges;
  if (pl.notes.hasPair(a, b)) return;
  const g = pl.state.grid;
  const needed = (face: number): number =>
    pl.state.clues[face] - yesAround(g.faces[face].edges, before);
  const dotLines = (dot: number): number => yesAround(g.dots[dot].edges, before);

  let explanation: string;
  let marks: Partial<Marks>;
  const why = f.why;
  switch (why.kind) {
    case "note":
      return;
    case "faceParity":
      explanation = say.pairAtClue(
        pl.state.clues[why.face],
        needed(why.face),
        f.opposite,
      );
      marks = { faces: [why.face] };
      break;
    case "dotParity":
      explanation = say.pairAtDot(dotLines(why.dot), f.opposite);
      marks = { dots: [why.dot] };
      break;
    case "exactlyOneAtCorner":
      explanation = say.pairAtCorner;
      marks = { corners: [cornerOf(pl, f.parents[0]).dline] };
      break;
    case "faceLink": {
      const pair = chainPair(pl, f.parents);
      explanation = say.pairAcrossClue(
        pl.state.clues[why.face],
        needed(why.face),
        pair.opposite,
        f.opposite,
      );
      marks = { faces: [why.face], pairs: [pair] };
      break;
    }
    case "dotLink": {
      const pair = chainPair(pl, f.parents);
      explanation = say.pairAcrossDot(dotLines(why.dot), pair.opposite, f.opposite);
      marks = { dots: [why.dot], pairs: [pair] };
      break;
    }
  }
  const placed = pairOf(a, b, f.opposite);
  push(
    pl,
    { kind: "pair", a: placed.a, b: placed.b, relation: relationWord(placed) },
    explanation,
    marks,
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
function narrate(
  pl: Planner,
  p: Planned,
): { explanation: string; marks: Partial<Marks> } {
  const state = pl.state;
  const r = p.reason;
  const count = p.ops.length;
  const line = p.ops[0].state === LINE_YES;
  const clue = (face: number): number => state.clues[face];

  switch (r.kind) {
    case "clueFull":
      return {
        explanation: say.clueFull(clue(r.face), count),
        marks: { faces: [r.face] },
      };
    case "clueStarved":
      return {
        explanation: say.clueStarved(clue(r.face), count),
        marks: { faces: [r.face] },
      };
    case "clueOneShort":
      return {
        explanation: say.clueOneShort(clue(r.face)),
        marks: { faces: [r.face], dots: [r.dot] },
      };
    case "deadEnd":
      return { explanation: say.deadEnd, marks: { dots: [r.dot] } };
    case "lineContinues":
      return { explanation: say.lineContinues, marks: { dots: [r.dot] } };
    case "dotFull":
      return { explanation: say.dotFull(count), marks: { dots: [r.dot] } };

    case "earlyLoop": {
      const edge = p.ops[0].edge;
      const unmet = r.because === "unmetClues" ? unmetClues(state, p.before, edge) : [];
      return {
        explanation: say.earlyLoop(r.because, unmet.length),
        marks: { edges: chainThrough(state, p.before, edge), faces: unmet },
      };
    }
    case "closesLoop":
      return {
        explanation: say.closesLoop,
        marks: { edges: chainThrough(state, p.before, p.ops[0].edge) },
      };

    case "clueBound": {
      const c = clue(r.face);
      const n = r.witness.corners.length;
      return {
        explanation: line ? say.boundLine(c, n) : say.boundEmpty(c, n),
        marks: {
          faces: [r.face],
          corners: r.witness.corners.map((id) => cornerOf(pl, id).dline),
        },
      };
    }

    case "corner":
    case "cornerExit": {
      const ids = r.kind === "corner" ? [r.fact] : [...r.facts];
      const first = cornerOf(pl, ids[0]);
      const bound: CornerBound = ids.length === 2 ? "exactlyOne" : first.bound;
      const [a, b] = first.edges;
      const bothOpen = p.before[a] === LINE_UNKNOWN && p.before[b] === LINE_UNKNOWN;
      let then: CornerThen;
      if (r.kind === "cornerExit") then = "exit";
      else if (bound === "atLeastOne") then = bothOpen ? "bothLines" : "otherLine";
      else then = bothOpen ? "neither" : "otherEmpty";
      const ringed = then === "bothLines" || then === "neither" || then === "exit";
      return {
        explanation: say.corner(bound, then),
        marks: { corners: [first.dline], dots: ringed ? [r.dot] : [] },
      };
    }

    case "matchingPair":
      return {
        marks: { faces: [r.face], pairs: [chainPair(pl, r.path)] },
        explanation: say.matchingPair(clue(r.face), line),
      };

    case "parity": {
      const pair = chainPair(pl, r.path);
      if (r.face !== null) {
        const face = state.grid.faces[r.face];
        const needed = clue(r.face) - yesAround(face.edges, p.before);
        return {
          explanation: say.parityFace(clue(r.face), needed, pair.opposite, line),
          marks: { faces: [r.face], pairs: [pair] },
        };
      }
      const dot = r.dot ?? 0;
      const dotLines = yesAround(state.grid.dots[dot].edges, p.before);
      return {
        explanation: say.parityDot(dotLines, pair.opposite, line),
        marks: { dots: [dot], pairs: [pair] },
      };
    }

    case "related": {
      const pair = chainPair(pl, r.path);
      const fromLine = p.before[r.from] === LINE_YES;
      return {
        explanation: say.related(pair.opposite, fromLine, line),
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
function sentenceExpires(state: LoopyState, f: LoopyFact): boolean {
  if (f.kind === "relation") {
    // "Only these two edges are still open", and the "four open edges" of the
    // across-a-clue pairs, both name a set that only shrinks. `pairAtCorner` cites
    // a corner note, which stays put.
    return f.why.kind !== "exactlyOneAtCorner" && f.why.kind !== "note";
  }
  if (f.why.kind !== "clue" || f.bound !== "atMostOne") return false;
  // Of `cornerFromClue`'s branches only "already give it N" counts drawn lines, and
  // that count grows. The "at most" branches state an upper bound, which stays true
  // as the real maximum falls, and the `1` branch cites the clue alone.
  return !(state.clues[f.why.face] === 1 && f.why.witness.corners.length === 0);
}

/**
 * The plan's steps: before each line firing, a step placing each note it and the
 * later firings rest on, then the firing itself.
 *
 * A note whose sentence survives the board filling up is placed beside the firing
 * that cites it, rather than where the solver happened to find the fact — which was
 * a median of 15 firings earlier, and up to 143 (`findings.md`). A note whose
 * sentence would go stale stays where it was found, that being the last position its
 * premise still describes, and no note is placed before a note it cites.
 *
 * Facts no line rests on are never placed, so a player is never asked to note
 * something no later step uses. Each firing's notes and the firing form one journey:
 * every leg after the first is flagged `continuesPrevious`, so a note and the
 * deduction it serves arrive as a single hint.
 */
function planSteps(
  state: LoopyState,
  plan: readonly Planned[],
  facts: readonly LoopyFact[],
  tickOf: readonly number[],
): HintStep<LoopyMove, LoopyHint>[] {
  const pl: Planner = { state, facts, notes: new Notes(state), steps: [] };
  const firstUse = new Map<number, number>();
  plan.forEach((p, i) => {
    for (const id of p.closure) if (!firstUse.has(id)) firstUse.set(id, i);
  });

  const slot = new Map<number, number>();
  for (const [id, use] of firstUse) {
    slot.set(id, sentenceExpires(state, facts[id]) ? tickOf[id] : use);
  }
  // A note may not follow one that cites it. A fact's parents always have smaller
  // ids, so one descending pass pulls each back to its earliest dependent.
  for (const id of [...slot.keys()].sort((x, y) => y - x)) {
    const at = slot.get(id) as number;
    const f = facts[id];
    const cites =
      f.kind === "corner" && f.why.kind === "clue"
        ? [...f.parents, ...f.why.witness.corners]
        : f.parents;
    for (const p of cites) {
      const was = slot.get(p);
      if (was !== undefined && was > at) slot.set(p, at);
    }
  }

  const found = new Map<number, number[]>();
  for (const id of [...slot.keys()].sort((x, y) => x - y)) {
    if (facts[id].why.kind === "note") continue;
    const at = slot.get(id) as number;
    found.set(at, [...(found.get(at) ?? []), id]);
  }

  plan.forEach((p, i) => {
    const start = pl.steps.length;
    const ids = found.get(i) ?? [];
    for (let k = 0; k < ids.length; k++) {
      const f = facts[ids[k]];
      if (f.kind === "relation") {
        placePair(pl, f, p.before);
        continue;
      }
      const g = k + 1 < ids.length ? facts[ids[k + 1]] : null;
      if (g?.kind === "corner" && together(f, g)) {
        placeCorner(pl, [f, g]);
        k++;
      } else {
        placeCorner(pl, [f]);
      }
    }
    const { explanation, marks } = narrate(pl, p);
    const ops: LoopyOp[] = p.ops.map(({ edge, state: to }) => ({ edge, state: to }));
    push(
      pl,
      { kind: "set", ops },
      explanation,
      marks,
      ops.map((o) => o.edge),
    );
    // Counted from what actually landed rather than decided ahead of the pushes:
    // `placeCorner` and `placePair` return early when the note is already there, and
    // `chainPair` pushes a leg per link from inside one of them.
    for (let k = start + 1; k < pl.steps.length; k++) {
      pl.steps[k].continuesPrevious = true;
    }
  });
  return pl.steps;
}

export function hint(
  state: LoopyState,
  mistakes: number,
): HintResult<LoopyMove, LoopyHint> {
  const refusal = commonHintRefusal(state.completed, mistakes);
  if (refusal) return refusal;
  const { plan, facts, tickOf, contradiction } = deduceLoopyPlan(state);
  if (plan.length === 0) {
    return {
      ok: false,
      error: contradiction ? CONTRADICTION_UNLOCALIZED : DEDUCTION_EXHAUSTED,
    };
  }
  return { ok: true, steps: planSteps(state, plan, facts, tickOf) };
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
      for (const op of m.ops) if (lines.get(op.edge) !== op.state) return "off";
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
export function refreshHintStep(
  step: HintStep<LoopyMove>,
  state: LoopyState,
): HintStep<LoopyMove> | null {
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
      const highlights = step.highlights as LoopyHint;
      return {
        ...step,
        move: { ...move, ops },
        highlights: { ...highlights, targets: ops.map((o) => o.edge) },
      };
    }
  }
}

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

import { Dsf } from "../../engine/board/dsf.ts";
import type {
  HintResult,
  HintStep,
  HintTrackVerdict,
  MoveVerdict,
} from "../../engine/contract/game.ts";
import {
  CONTRADICTION_UNLOCALIZED,
  DEDUCTION_EXHAUSTED,
} from "../../engine/contract/hint-refusal.ts";
import type { Sentence } from "../../engine/contract/hint-words.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import { type Judging, judgeWalked } from "../../engine/move-judge.ts";
import { type FactGraph, placeNotes } from "../../engine/solve/fact-graph.ts";
import { stepBudget } from "../../engine/solve/step-budget.ts";
import { type Clauses, statedSentence } from "../../engine/stated.ts";
import { STATED, voice } from "../../generated/games/loopy/loopy.compiled.ts";
import type { LoopyMove, LoopyOp } from "./index.ts";
import { CORNER, DOT, EDGE, FACE, PAIR } from "./kinds.ts";
import {
  type CornerNote,
  type HintBoard,
  hintBoardSolved,
  hintWalk,
  type Link,
  type LoopyFiring,
  type Note,
  type RelationNote,
  shownMarks,
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

/** An element a step's words point at: everything is an index but a pair note. */
type Elem = number | LoopyPair;

/** What a corner is known to carry. */
type CornerBound = "atLeastOne" | "atMostOne" | "exactlyOne";

/** What a reference to each sort a description names is drawn on. */
const SORT_KINDS = { face: FACE, cell: DOT, edge: EDGE, angle: CORNER, pair: PAIR };

/**
 * The words of a step the plan emits, as `loopy.description.yaml`'s `steps`
 * state them: a step decides an edge, a corner or a pair, named so.
 */
export const speak = voice<Elem>({
  kind: EDGE,
  kinds: SORT_KINDS,
  nouns: { edge: "edge", angle: "corner", pair: "pair" },
  value: String,
});

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
export function deduceLoopyPlan(
  state: LoopyState,
  judging?: Judging,
): {
  plan: Planned[];
  graph: FactGraph;
  notes: ReadonlyMap<number, Note>;
  angleEdges: (angle: number) => readonly [number, number];
  contradiction: boolean;
} {
  const { board, graph, notes, angleEdges, next } = hintWalk(
    state,
    stepBudget("loopy hint plan"),
    judging,
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

function push(pl: Planner, rung: LoopyRung, move: LoopyMove, said: Sentence): void {
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
        speak.sentence("pairChain", {
          ring: [joined],
          terms: { mixed: first !== link.opposite, opposite: first },
          marks: {
            outline: {
              edge: [end],
              pair: [pairOf(start, end, opposite), pairOf(end, next, link.opposite)],
            },
          },
        }),
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

  let rung: LoopyRung;
  let words: Sentence;
  const { outline } = f;
  const ring = [f.dline];
  const why = f.why;
  switch (why.kind) {
    case "lineElsewhere":
    case "onlyWayOn":
      rung = "cornerAtDot";
      words = speak.sentence("cornerAtDot", {
        ring: ring,
        terms: { atMost: bound === "atMostOne", exactly: bound === "exactlyOne" },
        marks: { outline: { cell: outline.dots } },
      });
      break;
    case "clue":
      rung = "cornerFromClue";
      words = speak.sentence("cornerFromClue", {
        ring: ring,
        terms: {
          n: why.clue,
          total: why.witness.total,
          atLeast: f.bound === "atLeastOne",
        },
        marks: { outline: { face: outline.faces, angle: why.witness.corners } },
      });
      break;
    case "acrossTheDot":
      rung = "cornerAcross";
      words = speak.sentence("cornerAcross", {
        ring: ring,
        marks: { outline: { angle: outline.corners, cell: outline.dots } },
      });
      break;
    case "exactlyOneAcross":
      rung = "cornerOppositeExit";
      words = speak.sentence("cornerOppositeExit", {
        ring: ring,
        marks: { outline: { angle: outline.corners, cell: outline.dots } },
      });
      break;
    case "opposites":
      rung = "cornerFromPair";
      words = speak.sentence("cornerFromPair", {
        ring: ring,
        terms: { exactly: bound === "exactlyOne", atMost: bound === "atMostOne" },
        marks: { outline: { pair: [chainPair(pl, why.path)] } },
      });
      break;
  }
  const next = had | bits;
  push(pl, rung, { kind: "corner", dline: f.dline, bits: next }, words);
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
  const placed = pairOf(a, b, f.opposite);
  const { outline } = f;
  const ring = [placed];
  const why = f.why;
  // What the board shows of a clue or a dot is read where the note is placed,
  // which may be later than where it was found: the sentence quotes the board.
  let words: Sentence;
  switch (why.kind) {
    case "faceParity":
      rung = "pairAtClue";
      words = speak.sentence("pairAtClue", {
        ring: ring,
        terms: { n: why.clue, needed: needed(why.face), opposite: f.opposite },
        marks: { outline: { face: outline.faces } },
      });
      break;
    case "dotParity":
      rung = "pairAtDot";
      words = speak.sentence("pairAtDot", {
        ring: ring,
        terms: { hasLine: dotLines(why.dot) === 1, opposite: f.opposite },
        marks: { outline: { cell: outline.dots } },
      });
      break;
    case "exactlyOneAtCorner":
      rung = "pairAtCorner";
      words = speak.sentence("pairAtCorner", {
        ring: ring,
        marks: { outline: { angle: outline.corners } },
      });
      break;
    case "faceLink": {
      rung = "pairAcrossClue";
      const pair = chainPair(pl, why.path);
      words = speak.sentence("pairAcrossClue", {
        ring: ring,
        terms: {
          n: why.clue,
          needed: needed(why.face),
          pairOpposite: pair.opposite,
          opposite: f.opposite,
        },
        marks: { outline: { face: outline.faces, pair: [pair] } },
      });
      break;
    }
    case "dotLink": {
      rung = "pairAcrossDot";
      const pair = chainPair(pl, why.path);
      words = speak.sentence("pairAcrossDot", {
        ring: ring,
        terms: {
          hasLine: dotLines(why.dot) === 1,
          pairOpposite: pair.opposite,
          opposite: f.opposite,
        },
        marks: { outline: { cell: outline.dots, pair: [pair] } },
      });
      break;
    }
  }
  push(
    pl,
    rung,
    { kind: "pair", a: placed.a, b: placed.b, relation: relationWord(placed) },
    words,
  );
  pl.notes.addPair(placed);
}

/** The sentence and the marks for one line firing, placing first any pair its
 * chain of pairs comes to. */
function narrate(pl: Planner, p: Planned): Sentence {
  const state = pl.state;
  const r = p.reason;
  const line = p.ops[0].state === LINE_YES;
  const outline = r.outline;
  // The ring is the edges the step sets.
  const ring = p.ops.map((o) => o.edge);

  const stated = (STATED as Readonly<Record<string, { step?: readonly Clauses[] }>>)[
    r.kind
  ]?.step;
  if (stated !== undefined) {
    // The description states this kind's words; the ring is the edges it sets.
    return statedSentence<Elem>(stated[r.said.wording ?? 0], {
      kind: EDGE,
      kinds: SORT_KINDS,
      at: (i) => i,
      ring,
      marks: r.said.marks,
      terms: r.said.terms,
      value: String,
      noun: "edge",
    });
  }

  switch (r.kind) {
    case "clueFull":
    case "clueStarved":
    case "clueOneShort":
    case "clueBlockedPair":
    case "deadEnd":
    case "lineContinues":
    case "dotFull":
    case "earlyLoop":
      throw new Error(`loopy hint: ${r.kind} is stated, and its clauses are missing`);
    case "clueBound": {
      // The corners the count leans on are the solver's (`boundOf`), which no
      // formula states.
      const marks = { outline: { face: outline.faces, angle: r.witness.corners } };
      return line
        ? speak.sentence("boundLine", {
            ring: ring,
            terms: { n: r.clue, fewer: r.clue - 1 },
            marks: marks,
          })
        : speak.sentence("boundEmpty", {
            ring: ring,
            terms: { n: r.clue, single: r.clue === 1 },
            marks: marks,
          });
    }

    case "corner": {
      const [a, b] = pl.angleEdges(r.dline);
      const bothOpen = p.before[a] === LINE_UNKNOWN && p.before[b] === LINE_UNKNOWN;
      // The corner's bound and the dot's other edges decide which it is.
      const angle = { outline: { angle: outline.corners } };
      const both = { outline: { angle: outline.corners, cell: outline.dots } };
      if (r.bound === "atLeastOne")
        return bothOpen
          ? speak.sentence("cornerBothLines", { ring: ring, marks: both })
          : speak.sentence("cornerOtherLine", { ring: ring, marks: angle });
      return bothOpen
        ? speak.sentence("cornerNeither", { ring: ring, marks: both })
        : speak.sentence("cornerOtherEmpty", { ring: ring, marks: angle });
    }

    case "cornerExit":
      return speak.sentence("cornerExit", {
        ring: ring,
        marks: { outline: { angle: outline.corners, cell: outline.dots } },
      });

    case "matchingPair":
      return speak.sentence("matchingPair", {
        ring: ring,
        terms: { n: r.clue, line },
        marks: { outline: { face: outline.faces, pair: [chainPair(pl, r.path)] } },
      });

    case "parity": {
      const pair = chainPair(pl, r.path);
      if (r.face !== null && r.clue !== null) {
        const c = r.clue;
        return speak.sentence("parityFace", {
          ring: ring,
          terms: {
            n: c,
            needed: c - yesAround(state.grid.faces[r.face].edges, p.before),
            opposite: pair.opposite,
            line,
          },
          marks: { outline: { face: outline.faces, pair: [pair] } },
        });
      }
      const dotLines = yesAround(state.grid.dots[r.dot ?? 0].edges, p.before);
      return speak.sentence("parityDot", {
        ring: ring,
        terms: { hasLine: dotLines === 1, opposite: pair.opposite, line },
        marks: { outline: { cell: outline.dots, pair: [pair] } },
      });
    }

    case "related": {
      const pair = chainPair(pl, r.path);
      return speak.sentence("related", {
        ring: ring,
        terms: {
          opposite: pair.opposite,
          fromLine: p.before[r.from] === LINE_YES,
          line,
        },
        marks: { outline: { pair: [pair], edge: outline.edges } },
      });
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
    const words = narrate(pl, p);
    const ops: LoopyOp[] = p.ops.map(({ edge, state: to }) => ({ edge, state: to }));
    push(pl, p.reason.kind, { kind: "set", ops }, words);
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
 * What Check & save says of the last move: a line drawn or a corner note
 * placed. A pair of lines marked alike or opposite is a relation, no fact a
 * firing makes, and is not judged.
 */
export function judgeMove(before: LoopyState, after: LoopyState): MoveVerdict | null {
  return judgeWalked(before, after, shownMarks, (judging) => {
    deduceLoopyPlan(before, judging);
  });
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

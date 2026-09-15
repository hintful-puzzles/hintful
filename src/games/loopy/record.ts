/**
 * What Loopy's solver records on the hint path: each change to a line, the
 * premise that forced it, and the notes it rests on.
 *
 * **Two kinds of fact live beside the lines.** From Normal the solver reasons
 * about *corners* — two edges adjacent around a dot, known to carry at most one or
 * at least one line between them — and from Hard about *pairs*, two edges known to
 * be both lines or both empty, or exactly one of each. The player notes both
 * (`LoopyState.corners` and `pairs`), and the hint places each fact it relies on as
 * a note before the step that cites it, so every fact carries its own premise and
 * the facts it was derived from, and the plan position it was found at.
 *
 * The recorder exists only on the hint path. `solveGame` never builds one, and
 * every recording site in `solver.ts` is behind `ss.rec`, so the generator's
 * path — and with it which boards exist — is unchanged; the frozen differential
 * is the proof.
 */

import type { LineState } from "./state.ts";

/** Which of a corner's two bits a fact sets. */
export type Bound = "atMostOne" | "atLeastOne";

/** Why a corner carries at most one line, or at least one. */
export type CornerWhy =
  /** The player noted it. */
  | { kind: "note" }
  /** Its dot already has a line along some other edge, so a line through both
   * would give the dot three. */
  | { kind: "lineElsewhere" }
  /** Its dot has one line and these two are its only other edges still open. */
  | { kind: "onlyWayOn" }
  /** A clued face's other edges already need, or can only hold, so many lines
   * that this corner of it is decided. `lines` and `corners` are what the count
   * rests on: see {@link BoundWitness}. */
  | { kind: "clue"; face: number; witness: BoundWitness }
  /** The corner across the dot carries at least one line, and a dot takes two
   * lines at most. `parents[0]` is that corner. */
  | { kind: "acrossTheDot" }
  /** The corner across the dot carries exactly one line, and this dot has no line
   * yet and four open edges, so the loop's other line here is in this corner.
   * `parents` are that corner's two facts. */
  | { kind: "exactlyOneAcross" }
  /** Its two edges are opposites, so exactly one of them is a line. `parents` is
   * the chain of relations between them. */
  | { kind: "opposites" };

/** Why two edges are known to match, or to be opposites. */
export type RelationWhy =
  /** The player noted it. */
  | { kind: "note" }
  /** Only these two of a clued face's edges are still open, so the clue's parity
   * decides whether they match. */
  | { kind: "faceParity"; face: number }
  /** Only these two of a dot's edges are still open, so the dot's parity (it takes
   * zero or two lines) decides whether they match. */
  | { kind: "dotParity"; dot: number }
  /** They make a corner carrying exactly one line. `parents` are its two facts. */
  | { kind: "exactlyOneAtCorner"; dot: number }
  /** A clued face has four open edges and two of them are related, which relates
   * the other two by the clue's parity. `parents` is the chain between the first
   * pair. */
  | { kind: "faceLink"; face: number }
  /** The same, at a dot with four open edges. */
  | { kind: "dotLink"; dot: number };

export type CornerFact = {
  kind: "corner";
  /** The dline the fact is a bit of, as `dlines.ts` indexes it. */
  dline: number;
  dot: number;
  edges: readonly [number, number];
  bound: Bound;
  why: CornerWhy;
  parents: readonly number[];
};

export type RelationFact = {
  kind: "relation";
  edges: readonly [number, number];
  opposite: boolean;
  why: RelationWhy;
  parents: readonly number[];
};

export type LoopyFact = CornerFact | RelationFact;

/**
 * What a clue's count of its other edges rests on: the lines already drawn (for a
 * lower bound) or the edges still open (for an upper bound), taken singly, and the
 * corners whose two edges count as one. The corners are fact ids.
 */
export interface BoundWitness {
  /** Edges counted one each. */
  readonly edges: readonly number[];
  /** Facts for the corners counted as one line between two edges. */
  readonly corners: readonly number[];
  /** The count they come to. */
  readonly total: number;
}

/** The premise behind one firing: a change to one or more lines. */
export type LoopyReason =
  /** A clue already has its lines, so its other edges are empty. */
  | { kind: "clueFull"; face: number }
  /** A clue has only as many edges left open as it needs, so all are lines. */
  | { kind: "clueStarved"; face: number }
  /** A clue needs all but one of its open edges, and two of them at a dot that
   * already has a line cannot both be lines, so every other open edge is. */
  | { kind: "clueOneShort"; face: number; dot: number; pair: readonly [number, number] }
  /** A dot with no line and one open edge: a line there would dead-end. */
  | { kind: "deadEnd"; dot: number }
  /** A dot with one line and one open edge: the line must continue along it. */
  | { kind: "lineContinues"; dot: number }
  /** A dot with two lines takes no more. */
  | { kind: "dotFull"; dot: number }
  /** A clue's other edges already need all its lines (the edge is empty) or can
   * hold one fewer (the edge is a line). */
  | { kind: "clueBound"; face: number; edge: number; witness: BoundWitness }
  /** A corner fact settles its edges against the dot's lines: `fact` is the
   * corner, and the ops say what it forced. */
  | { kind: "corner"; dot: number; fact: number }
  /** A dot with no line has three open edges and a corner carrying exactly one
   * line, so the loop leaves along the third. `facts` are the corner's two. */
  | { kind: "cornerExit"; dot: number; facts: readonly [number, number] }
  /** Two matching open edges of a clue with room for one more line (both empty)
   * or one more empty edge (both lines). `path` is the chain of relations. */
  | { kind: "matchingPair"; face: number; path: readonly number[] }
  /** Three open edges of a clue or a dot, two of them related, so the parity
   * decides the third. */
  | { kind: "parity"; face: number | null; dot: number | null; path: readonly number[] }
  /** An edge related to one whose state is known takes the state the relation
   * gives it. `from` is the known edge. */
  | { kind: "related"; from: number; path: readonly number[] }
  /** The edge would close a loop that is not the whole answer. */
  | { kind: "earlyLoop"; because: "strayLines" | "unmetClues" }
  /** The edge closes a loop through every line with every clue met. */
  | { kind: "closesLoop" };

/** The facts a firing's premise names directly; everything else it rests on is
 * reached through their parents. */
export function firingRoots(r: LoopyReason): number[] {
  switch (r.kind) {
    case "clueBound":
      return [...r.witness.corners];
    case "corner":
      return [r.fact];
    case "cornerExit":
      return [...r.facts];
    case "matchingPair":
    case "parity":
    case "related":
      return [...r.path];
    default:
      return [];
  }
}

export interface RecordedOp {
  edge: number;
  state: LineState;
}

/** One edge of the relation graph: `to`, whether it is the opposite, and the
 * fact that recorded it. */
interface RelationEdge {
  to: number;
  opposite: boolean;
  fact: number;
}

export class LoopyRecorder {
  readonly facts: LoopyFact[] = [];
  /** The plan position each fact was found at: how many firings came before it.
   * The board is unchanged between a fact and the firing it was found ahead of,
   * so a note placed there is narrated against the lines it was derived from. */
  readonly tickOf: number[] = [];
  /** Stamped onto each fact as it is recorded; the planner advances it. */
  tick = 0;
  /** The fact behind each dline bit — `2 * dline + (atMostOne ? 1 : 0)` — or `-1`
   * where the bit was read straight off a line in the pair, which no consumer
   * ever needs a fact for. */
  readonly bitFact: Int32Array;
  /** Every relation recorded, both ways round. The flip dsf answers *whether* two
   * edges are related; only this answers *through what*. */
  private readonly relations: RelationEdge[][];
  /** The lines the current firing changed, captured by `solverSetLine`. */
  ops: RecordedOp[] = [];
  reason: LoopyReason | null = null;

  constructor(numEdges: number) {
    this.bitFact = new Int32Array(4 * numEdges).fill(-1);
    this.relations = Array.from({ length: numEdges }, () => []);
  }

  private addFact(fact: LoopyFact): number {
    this.facts.push(fact);
    this.tickOf.push(this.tick);
    return this.facts.length - 1;
  }

  /** Record a corner bit's fact, returning its id. */
  corner(dline: number, fact: Omit<CornerFact, "dline">): number {
    const id = this.addFact({ ...fact, dline });
    this.bitFact[2 * dline + (fact.bound === "atMostOne" ? 1 : 0)] = id;
    return id;
  }

  cornerFact(dline: number, bound: Bound): number {
    return this.bitFact[2 * dline + (bound === "atMostOne" ? 1 : 0)];
  }

  relate(fact: RelationFact): number {
    const id = this.addFact(fact);
    const [a, b] = fact.edges;
    this.relations[a].push({ to: b, opposite: fact.opposite, fact: id });
    this.relations[b].push({ to: a, opposite: fact.opposite, fact: id });
    return id;
  }

  /**
   * The relation facts joining edge `a` to edge `b`, in order from `a`, by the
   * shortest chain. The flip dsf said they are related, so a chain exists; not
   * finding one means a merge went unrecorded.
   */
  path(a: number, b: number): number[] {
    if (a === b) return [];
    const via = new Map<number, { from: number; fact: number }>([
      [a, { from: -1, fact: -1 }],
    ]);
    const queue = [a];
    for (let i = 0; i < queue.length; i++) {
      const at = queue[i];
      for (const r of this.relations[at]) {
        if (via.has(r.to)) continue;
        via.set(r.to, { from: at, fact: r.fact });
        if (r.to === b) {
          const facts: number[] = [];
          for (let e = b; e !== a; ) {
            const step = via.get(e);
            if (!step) break;
            facts.push(step.fact);
            e = step.from;
          }
          return facts.reverse();
        }
        queue.push(r.to);
      }
    }
    throw new Error(`loopy hint: no recorded relation joins edges ${a} and ${b}`);
  }

  /** Every fact a set of facts rests on, itself included, deepest first. */
  closure(roots: readonly number[]): number[] {
    const seen = new Set<number>();
    const out: number[] = [];
    const visit = (id: number): void => {
      if (id < 0 || seen.has(id)) return;
      seen.add(id);
      for (const p of this.facts[id].parents) visit(p);
      const f = this.facts[id];
      if (f.kind === "corner" && f.why.kind === "clue")
        for (const c of f.why.witness.corners) visit(c);
      out.push(id);
    };
    for (const r of roots) visit(r);
    return out;
  }
}

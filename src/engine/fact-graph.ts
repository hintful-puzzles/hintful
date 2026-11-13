/**
 * The facts a walk made, each with its firing and its parents, and the answer
 * to "what does this fact rest on?" from any position in the walk.
 *
 * A fact is one of a firing's facts ({@link Facts}): a value placed, a
 * candidate struck, an edge's mark struck, a cell marked. What it is about is
 * one element of a space: the answer's elements (`cells`, which are edges
 * where the answer is on the edges) or the edge marks (`edges`), the two
 * spaces {@link Reads} reports.
 *
 * A fact's parents are **derived**, never written by a game: a firing's
 * parents are the facts made earlier in the walk about any element the firing
 * read ({@link Reads}), since each is part of what that element was when it
 * was read. An element read with no earlier fact about it was what the board
 * showed when the walk began: a *root*, which is a mark the player can see.
 *
 * A technique that does not say `reads: true` reports none, so its firing has
 * no known parents and an answer that passes through it is `complete: false`:
 * the engine says so rather than answering from less.
 *
 * Relation facts (`RELATE`) are about no readable element yet: `Reads` does
 * not record a relation read, so they are kept as facts with no parents and
 * nothing rests on them (`explain-a-firing-by-its-witness-and-parents` 3.4,
 * Loopy, decides what the relation needs).
 */

import {
  type Facts,
  MARK,
  PLACE,
  RELATE,
  type Reads,
  STRIKE,
  STRIKE_EDGE,
} from "./describe-runtime.ts";
import type { Firing } from "./ladder-runtime.ts";

/** Which of {@link Reads}' two spaces an element is in. */
export type Space = "cells" | "edges";

export interface Fact {
  /** The fact's place in the walk, from 0: the order it was made. */
  readonly id: number;
  /** The firing that made it, by its place in the walk, from 0. */
  readonly firing: number;
  /** The fact's kind: `STRIKE`, `PLACE`, `STRIKE_EDGE`, `MARK` or `RELATE`. */
  readonly kind: number;
  /** The value it is about: the one placed, the candidate struck, the mark
   * struck from an edge. */
  readonly value: number;
  /** What it is about, `null` for a relation. */
  readonly about: { readonly space: Space; readonly at: number } | null;
  /** The facts it rests on, by id, in the order made; `null` where its
   * firing reported no reads. */
  readonly parents: readonly number[] | null;
}

/** What a fact rests on. */
export interface Rests {
  /** The facts it rests on, transitively, in the order made, itself not
   * among them. */
  readonly facts: readonly Fact[];
  /** The elements read, down the chain, that no fact of the walk made: the
   * marks the walk began with. */
  readonly roots: {
    readonly cells: readonly number[];
    readonly edges: readonly number[];
  };
  /** Whether every firing in the chain reported its reads. */
  readonly complete: boolean;
}

const spaceOf = (kind: number): Space | null =>
  kind === STRIKE || kind === PLACE || kind === MARK
    ? "cells"
    : kind === STRIKE_EDGE
      ? "edges"
      : null;

/** The reads a firing reports, from the reason of any of its facts. */
export function readsOf(firing: Pick<Firing, "reasons">): Reads | null {
  for (const r of firing.reasons) {
    const says = (r as { says?: { reads?: Reads } }).says;
    if (says?.reads !== undefined) return says.reads;
  }
  return null;
}

export class FactGraph {
  readonly facts: Fact[] = [];
  /** What each firing read, by its place in the walk. */
  private readonly reads: (Reads | null)[] = [];
  /** The ids of the facts about each element, in the order made. */
  private readonly about: Record<Space, Map<number, number[]>> = {
    cells: new Map(),
    edges: new Map(),
  };

  /**
   * Keep a firing's facts, made now: each with the parents its reads name.
   * Call it before the firing's own facts change the marks the next firing
   * reads, in the order the walk takes them. Returns the new facts' ids.
   */
  record(facts: Facts, reads: Reads | null): readonly number[] {
    const firing = this.reads.length;
    this.reads.push(reads);
    const parents =
      reads === null
        ? null
        : [
            ...new Set([
              ...reads.cells.flatMap((x) => this.about.cells.get(x) ?? []),
              ...reads.edges.flatMap((x) => this.about.edges.get(x) ?? []),
            ]),
          ].sort((a, b) => a - b);
    const made: number[] = [];
    for (let i = 0; i < facts.length; i += 3) {
      const kind = facts[i];
      const space = spaceOf(kind);
      const id = this.facts.length;
      this.facts.push({
        id,
        firing,
        kind,
        value: facts[i + 2],
        about: space === null ? null : { space, at: facts[i + 1] },
        parents: kind === RELATE ? null : parents,
      });
      made.push(id);
    }
    // After all of them: a firing's facts do not rest on each other.
    for (const id of made) {
      const { about } = this.facts[id];
      if (about === null) continue;
      const list = this.about[about.space].get(about.at);
      if (list === undefined) this.about[about.space].set(about.at, [id]);
      else list.push(id);
    }
    return made;
  }

  /** The facts about one element, in the order made. */
  factsAbout(space: Space, at: number): readonly Fact[] {
    return (this.about[space].get(at) ?? []).map((id) => this.facts[id]);
  }

  /** What fact `id` rests on: what its firing read, and what those facts
   * read in turn, from the position the fact was made at. */
  restsOn(id: number): Rests {
    const seen = new Set<number>();
    const roots = { cells: new Set<number>(), edges: new Set<number>() };
    let complete = true;
    const visit = (f: Fact): void => {
      if (f.parents === null) {
        // A relation has no reads to report and is not an incomplete chain's
        // fault; a reads-less firing is.
        if (f.kind !== RELATE) complete = false;
        return;
      }
      for (const p of f.parents) {
        if (seen.has(p)) continue;
        seen.add(p);
        visit(this.facts[p]);
      }
    };
    const start = this.facts[id];
    if (start === undefined) throw new Error(`no fact ${id} in the graph`);
    visit(start);
    // The roots: the elements a firing in the chain read that no fact made
    // before it. Facts of one firing share their reads, so each is visited once.
    const firings = new Set([
      start.firing,
      ...[...seen].map((p) => this.facts[p].firing),
    ]);
    for (const firing of firings) {
      const reads = this.reads[firing];
      if (reads === null) continue;
      for (const space of ["cells", "edges"] as const)
        for (const x of reads[space]) {
          const first = this.about[space].get(x)?.[0];
          if (first === undefined || this.facts[first].firing >= firing)
            roots[space].add(x);
        }
    }
    return {
      facts: [...seen].sort((a, b) => a - b).map((p) => this.facts[p]),
      roots: { cells: [...roots.cells], edges: [...roots.edges] },
      complete,
    };
  }
}

/** What {@link placeNotes} is asked. */
export interface NotePlacement {
  /** Whether a fact is one the player cannot see as a mark on the board. */
  readonly isNote: (fact: Fact) => boolean;
  /**
   * Whether a fact makes its firing a step. Absent, every fact that is not a
   * note does. A game whose notes are some of an element's facts (Slant's
   * merge is the strike that completes it; the strike before is no note and
   * no step) says it.
   */
  readonly isStep?: (fact: Fact) => boolean;
  /**
   * Whether the sentence of the note made by firing `note` has stopped
   * holding by the time step `step` (both by place in the walk): a note whose
   * sentence quotes the board goes at its own tick, not beside its consumer.
   * Without it a note is never expired.
   */
  readonly expired?: (note: number, step: number) => boolean;
}

/**
 * Where the notes go in a hint's steps. A firing that makes only notes is not
 * a step; every other firing is, in the order made. Each note a step rests on
 * (transitively) is placed just before the first step that does, in firing
 * order, as one journey with it, and a note nothing cites is placed nowhere.
 * A note whose sentence has expired by its first consumer is placed instead at
 * its own tick, before the first step made after it. A note rests on notes
 * too, and is never placed after one that rests on it.
 *
 * Returns the steps (firings, in order) and, for each, the note firings placed
 * before it, in firing order.
 */
export function placeNotes(
  graph: FactGraph,
  { isNote, isStep = (f) => !isNote(f), expired }: NotePlacement,
): {
  readonly steps: readonly number[];
  readonly before: readonly (readonly number[])[];
} {
  const made = new Map<number, Fact[]>();
  for (const f of graph.facts) {
    const list = made.get(f.firing);
    if (list === undefined) made.set(f.firing, [f]);
    else list.push(f);
  }
  const firings = [...made.keys()].sort((a, b) => a - b);
  const steps = firings.filter((x) => (made.get(x) ?? []).some(isStep));
  const restsNotes = (firing: number): Set<number> => {
    const out = new Set<number>();
    for (const fact of made.get(firing) ?? [])
      for (const p of graph.restsOn(fact.id).facts) if (isNote(p)) out.add(p.firing);
    out.delete(firing);
    return out;
  };
  const at = new Map<number, number>();
  steps.forEach((firing, i) => {
    for (const note of restsNotes(firing)) if (!at.has(note)) at.set(note, i);
  });
  // A note's own tick: the first step made after it.
  const own = (note: number): number => {
    const i = steps.findIndex((s) => s > note);
    return i < 0 ? steps.length - 1 : i;
  };
  // Latest first, so a note's place is final before its parents are moved by it.
  for (const note of [...at.keys()].sort((a, b) => b - a)) {
    const first = at.get(note) as number;
    if (expired?.(note, steps[first]) === true)
      at.set(note, Math.min(first, own(note)));
    const here = at.get(note) as number;
    for (const p of restsNotes(note)) {
      const there = at.get(p);
      if (there === undefined || there > here) at.set(p, here);
    }
  }
  const before: number[][] = steps.map(() => []);
  for (const note of [...at.keys()].sort((a, b) => a - b))
    before[at.get(note) as number].push(note);
  return { steps, before };
}

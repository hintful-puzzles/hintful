import { describe, expect, it } from "vitest";
import { pathGame } from "../games/path/index.ts";
import { pathWalk } from "../games/path/solver.ts";
import { DIFF_NORMAL, MODE_PATH, newState } from "../games/path/state.ts";
import { newDesc as newSlantDesc } from "../games/slant/generator.ts";
import { deduceHintPlan } from "../games/slant/solver.ts";
import { DIFF_HARD, newState as slantNewState } from "../games/slant/state.ts";
import { MARK, PLACE, STRIKE, STRIKE_EDGE } from "./describe-runtime.ts";
import { FactGraph, placeNotes, readsOf } from "./fact-graph.ts";
import { ladderWalk, TIERS } from "./ladder-runtime.ts";
import { randomNew } from "./random/index.ts";

const reads = (cells: number[], edges: number[] = []) => ({ cells, edges });

describe("a placing hook's facts", () => {
  it("are a firing of their own, resting on the placed cell, with the value struck", () => {
    let hooks = 0;
    for (const seed of ["a", "b", "c", "d", "e", "f"]) {
      const p = { w: 7, h: 7, diff: DIFF_HARD };
      const state = slantNewState(p, newSlantDesc(p, randomNew(`h${seed}`)).desc);
      const { graph } = deduceHintPlan(
        state.w,
        state.h,
        state.clues,
        state.soln,
        state.alike,
      );
      for (const f of graph.facts) {
        if (f.kind !== STRIKE_EDGE || f.parents === null) continue;
        const rests = graph.restsOn(f.id);
        // A strike made by a placement rests on the fact placing the cell.
        const placed = f.parents
          .map((id) => graph.facts[id])
          .filter((q) => q.kind === PLACE);
        if (placed.length === 0) continue;
        hooks++;
        expect(rests.facts.some((q) => q.kind === PLACE)).toBe(true);
        expect([1, 2]).toContain(f.value);
        // The hook's firing is not the placement's own.
        expect(placed.every((q) => q.firing < f.firing)).toBe(true);
      }
    }
    // Seven boards of seven squares a side draw dozens of diagonals.
    expect(hooks).toBeGreaterThan(20);
  });
});

describe("what a fact rests on", () => {
  it("is the facts about what its firing read, transitively, and the elements no fact made", () => {
    const g = new FactGraph();
    // Firing 0 reads cell 9 (a root) and strikes cell 1.
    const [a] = g.record([STRIKE, 1, 0], reads([9]));
    // Firing 1 reads cell 1 and places cell 2.
    const [b] = g.record([PLACE, 2, 1], reads([1]));
    // Firing 2 reads cell 2 and edge 5, and strikes cell 3 and edge 6.
    const [c, d] = g.record([STRIKE, 3, 0, STRIKE_EDGE, 6, 1], reads([2], [5]));
    // Firing 3 reads cell 7, which nothing made.
    const [e] = g.record([PLACE, 4, 1], reads([7]));
    expect(g.facts[c].parents).toEqual([b]);
    expect(g.facts[d].parents).toEqual([b]);

    const rests = g.restsOn(c);
    expect(rests.facts.map((f) => f.id)).toEqual([a, b]);
    expect(rests.roots).toEqual({ cells: [9], edges: [5] });
    expect(rests.complete).toBe(true);
    // A firing that reads the element it then strikes read it as the board
    // showed it: a root, not its own fact.
    const [f] = g.record([STRIKE, 8, 0], reads([8]));
    expect(g.restsOn(f).roots.cells).toEqual([8]);
    // The unrelated firing rests on nothing the walk made.
    expect(g.restsOn(e)).toMatchObject({ facts: [], roots: { cells: [7] } });
    // From any position: a fact earlier in the walk answers as it did.
    expect(g.restsOn(b).facts.map((f) => f.id)).toEqual([a]);
  });

  it("takes every earlier fact about an element a firing read, and none made after", () => {
    const g = new FactGraph();
    const [s1] = g.record([STRIKE, 1, 0], reads([]));
    const [s2] = g.record([STRIKE, 1, 1], reads([]));
    const [p] = g.record([PLACE, 2, 1], reads([1]));
    g.record([STRIKE, 1, 2], reads([]));
    expect(g.facts[p].parents).toEqual([s1, s2]);
  });

  it("says it is not complete where a firing reported no reads", () => {
    const g = new FactGraph();
    const [a] = g.record([STRIKE, 1, 0], null);
    const [b] = g.record([PLACE, 2, 1], reads([1]));
    expect(g.restsOn(b)).toMatchObject({ complete: false });
    expect(g.facts[a].parents).toBeNull();
  });

  it("rests, on Path's walk, on facts about elements the firing read", () => {
    let checked = 0;
    let withParents = 0;
    for (const seed of [0, 1, 2, 3, 4, 5, 6, 7]) {
      const p = { w: 7, h: 7, diff: DIFF_NORMAL, mode: MODE_PATH };
      const state = newState(p, pathGame.newDesc(p, randomNew(`g${seed}`)).desc);
      const { marks, entries } = pathWalk(state);
      const walk = ladderWalk(marks, entries, { [TIERS]: 99 }, () => []);
      const firingReads = new Map<number, ReturnType<typeof readsOf>>();
      for (;;) {
        const before = walk.graph.facts.length;
        const taken = walk.next();
        if (taken === null || taken === "contradiction") break;
        firingReads.set(walk.graph.facts[before].firing, readsOf(taken));
      }
      for (const f of walk.graph.facts) {
        const r = firingReads.get(f.firing) ?? null;
        // A parent is earlier, and about an element the firing read.
        if (f.parents === null) {
          expect(r).toBeNull();
          continue;
        }
        expect(r).not.toBeNull();
        for (const id of f.parents) {
          const parent = walk.graph.facts[id];
          expect(parent.firing).toBeLessThan(f.firing);
          expect(parent.about?.space).toBe("cells");
          expect(r?.cells).toContain(parent.about?.at);
          withParents++;
        }
        checked++;
      }
    }
    // What the check looked at: lineBreaks fired, and with parents.
    expect(checked).toBeGreaterThan(5);
    expect(withParents).toBeGreaterThan(0);
  });
});

describe("where the notes go", () => {
  // A MARK fact is a note (the player cannot see it); a PLACE is a step.
  const isNote = (f: { kind: number }) => f.kind === MARK;

  /** Firing 0: note on cell 1 (reads 10). 1: note on cell 2 (reads 1).
   * 2: note on cell 3, cited by nothing. 3: step reading cell 1.
   * 4: step reading cell 2, whose note rests on the note of cell 1. */
  const walk = () => {
    const g = new FactGraph();
    g.record([MARK, 1, 0], reads([10]));
    g.record([MARK, 2, 0], reads([1]));
    g.record([MARK, 3, 0], reads([10]));
    g.record([PLACE, 20, 1], reads([1]));
    g.record([PLACE, 21, 1], reads([2]));
    return g;
  };

  it("puts a note before its first consumer, in firing order, and none that nothing cites", () => {
    const { steps, before } = placeNotes(walk(), { isNote });
    expect(steps).toEqual([3, 4]);
    // Note 0 is cited by step 3; note 1 (resting on 0) by step 4; note 2 by none.
    expect(before).toEqual([[0], [1]]);
  });

  it("places a note ahead of the note that rests on it, even when the first consumer is later", () => {
    const g = new FactGraph();
    g.record([MARK, 1, 0], reads([10]));
    g.record([MARK, 2, 0], reads([1]));
    g.record([PLACE, 20, 1], reads([30]));
    g.record([PLACE, 21, 1], reads([2]));
    expect(placeNotes(g, { isNote }).before).toEqual([[], [0, 1]]);
  });

  it("puts an expired note at its own tick, with the notes it rests on", () => {
    const g = new FactGraph();
    g.record([MARK, 1, 0], reads([10]));
    g.record([MARK, 2, 0], reads([1]));
    g.record([PLACE, 20, 1], reads([30]));
    g.record([PLACE, 21, 1], reads([2]));
    g.record([PLACE, 22, 1], reads([2]));
    const { before } = placeNotes(g, { isNote, expired: (note) => note === 1 });
    expect(before).toEqual([[0, 1], [], []]);
  });
});

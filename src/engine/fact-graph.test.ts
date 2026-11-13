import { describe, expect, it } from "vitest";
import { pathGame } from "../games/path/index.ts";
import { pathWalk } from "../games/path/solver.ts";
import { DIFF_NORMAL, MODE_PATH, newState } from "../games/path/state.ts";
import { PLACE, STRIKE, STRIKE_EDGE } from "./describe-runtime.ts";
import { FactGraph, readsOf } from "./fact-graph.ts";
import { ladderWalk, TIERS } from "./ladder-runtime.ts";
import { randomNew } from "./random/index.ts";

const reads = (cells: number[], edges: number[] = []) => ({ cells, edges });

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

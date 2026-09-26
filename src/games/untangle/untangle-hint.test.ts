/**
 * Tier-1 tests for Untangle's hint (`hint.ts`).
 *
 * What the hint promises: every number it says is the board's own count, a
 * "moved here" step really takes crossings off the board, and following hints
 * from *any* position — a fresh circle, a random scatter, a board with or
 * without the generator's `aux` — ends solved.
 */

import { describe, expect, it } from "vitest";
import { ALREADY_SOLVED, NO_MOVE_WORTH_MAKING } from "../../engine/hint-refusal.ts";
import { randomNew, randomUpto } from "../../engine/random/index.ts";
import { deduceUntangleHintPlan } from "./hint.ts";
import { say } from "./hint-text.ts";
import { untangleGame } from "./index.ts";
import { cross, findCrossings, type UntangleState } from "./state.ts";

function generated(n: number, seed: string) {
  const { desc, aux } = untangleGame.newDesc({ n }, randomNew(seed));
  return { state: untangleGame.newState({ n }, desc), aux };
}

/** The same board with every point scattered at random — the kind of
 * half-untangled mess a player leaves, where greedy moves run out. */
function scattered(s: UntangleState, seed: string): UntangleState {
  const rng = randomNew(seed);
  const d = 64;
  const points = s.pts.map((_, i) => ({
    i,
    x: Math.round(d * 0.3) + randomUpto(rng, Math.floor(d * (s.w - 0.6))),
    y: Math.round(d * 0.3) + randomUpto(rng, Math.floor(d * (s.w - 0.6))),
    d,
  }));
  return untangleGame.executeMove(s, { kind: "place", points, solving: false });
}

const count = (s: UntangleState): number => findCrossings(s.pts, s.edges).count;

/** Crossings `v`'s lines make, recounted independently of the hint. */
function lineCrossings(s: UntangleState, v: number): number {
  let c = 0;
  for (const e of s.edges) {
    if (e.a !== v && e.b !== v) continue;
    const u = e.a === v ? e.b : e.a;
    for (const f of s.edges) {
      if (f.a === v || f.b === v || f.a === u || f.b === u) continue;
      if (cross(s.pts[v], s.pts[u], s.pts[f.a], s.pts[f.b])) c++;
    }
  }
  return c;
}

/**
 * Follow hints to the end, applying each whole plan and asking again, checking
 * every step's claim against the board. Returns how many steps of each kind
 * were taken.
 */
function followHints(start: UntangleState, aux?: string) {
  let s = start;
  let clears = 0;
  let rebuilds = 0;
  for (let asks = 0; asks < 60; asks++) {
    if (s.completed) return { s, clears, rebuilds };
    const res = deduceUntangleHintPlan(s, aux);
    if (!res.ok) throw new Error(`hint gave up on an unsolved board: ${res.error}`);
    for (const st of res.steps) {
      const v = st.move.points[0].i;
      expect(st.highlights?.vertex).toBe(v);
      const before = lineCrossings(s, v);
      const total = count(s);
      const next = untangleGame.executeMove(s, st.move);
      const after = lineCrossings(next, v);
      if (st.explanation === say.rebuild) {
        rebuilds++;
      } else {
        clears++;
        expect(st.explanation).toBe(say.clear(before, after));
        expect(after).toBeLessThan(before);
        // Only v's lines moved, so the board loses exactly what they did.
        expect(count(next)).toBe(total - (before - after));
        // A ring for at least every crossing the step takes away.
        expect(st.highlights?.cleared.length).toBeGreaterThanOrEqual(before - after);
      }
      s = next;
    }
  }
  throw new Error("following hints did not converge");
}

describe("Untangle hint", () => {
  it("narrates true counts and solves every board it is followed on", () => {
    // Seed-deterministic but heavy: n=25 is the largest preset and the size at
    // which greedy moves most often run out.
    let rebuilds = 0;
    let boards = 0;
    for (const n of [6, 10, 15, 25]) {
      for (let i = 0; i < 4; i++) {
        const { state, aux } = generated(n, `hint-${n}-${i}`);
        for (const [start, withAux] of [
          [state, aux],
          [scattered(state, `scatter-${n}-${i}`), undefined],
        ] as const) {
          const out = followHints(start, withAux);
          expect(out.s.completed).toBe(true);
          rebuilds += out.rebuilds;
          boards++;
        }
      }
    }
    expect(boards).toBe(32);
    // Vacuity: the fallback for "no single move helps" must actually have run,
    // or this test says nothing about the stall that made the old hint give up.
    expect(rebuilds).toBeGreaterThan(0);
  });

  it("finishes spacious rather than knotted in the middle", () => {
    for (const seed of ["spread-a", "spread-b", "spread-c"]) {
      const { state, aux } = generated(10, seed);
      const { s } = followHints(state, aux);
      const xs = s.pts.map((p) => p.x / p.d);
      const ys = s.pts.map((p) => p.y / p.d);
      const span = Math.min(
        Math.max(...xs) - Math.min(...xs),
        Math.max(...ys) - Math.min(...ys),
      );
      expect(span).toBeGreaterThan(s.w * 0.4);
    }
  });

  it("refuses a solved board with the collection's wording", () => {
    const { state, aux } = generated(10, "hint-solved");
    const res = untangleGame.solve?.(state, state, aux);
    if (!res?.ok) throw new Error("Solve failed");
    const solved = untangleGame.executeMove(state, res.move);
    expect(solved.completed).toBe(true);
    expect(deduceUntangleHintPlan(solved)).toEqual({
      ok: false,
      error: ALREADY_SOLVED,
    });
  });

  it("on a graph that cannot be untangled, stops when no move helps", () => {
    // K5 typed in by hand: a hint can still reduce crossings, then says so.
    const desc = "0-1,0-2,0-3,0-4,1-2,1-3,1-4,2-3,2-4,3-4";
    let s = untangleGame.newState({ n: 5 }, desc);
    for (let asks = 0; asks < 20; asks++) {
      const res = deduceUntangleHintPlan(s);
      if (!res.ok) {
        expect(res.error).toBe(NO_MOVE_WORTH_MAKING);
        expect(count(s)).toBeGreaterThan(0);
        return;
      }
      for (const st of res.steps) s = untangleGame.executeMove(s, st.move);
    }
    throw new Error("the hint never admitted K5 cannot be untangled");
  });
});

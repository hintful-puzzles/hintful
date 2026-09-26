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
import { SLOW_TESTS_ENABLED } from "../../engine/testing/slow.ts";
import { samePoint } from "./geometry.ts";
import { deduceUntangleHintPlan } from "./hint.ts";
import { say } from "./hint-text.ts";
import { untangleGame } from "./index.ts";
import { closestOrientation, solvedLayout } from "./solution.ts";
import { findCrossings, type UntangleState } from "./state.ts";

function generated(n: number, seed: string) {
  const { desc, aux } = untangleGame.newDesc({ n }, randomNew(seed));
  return { state: untangleGame.newState({ n }, desc), aux };
}

/** The same board with every point scattered at random on a `1/d` grid — the
 * kind of half-untangled mess a player leaves, where greedy moves run out. A
 * coarse grid (snap-to-grid play) puts points exactly on lines, where `cross()`
 * stops being symmetric and a careless count disagrees with the board. */
function scattered(s: UntangleState, seed: string, d: number): UntangleState {
  const rng = randomNew(seed);
  const points = s.pts.map((_, i) => ({
    i,
    x: 1 + randomUpto(rng, d * s.w - 1),
    y: 1 + randomUpto(rng, d * s.w - 1),
    d,
  }));
  return untangleGame.executeMove(s, { kind: "place", points, solving: false });
}

const count = (s: UntangleState): number => findCrossings(s.pts, s.edges).count;

/** Crossings `v`'s lines make, as the board itself counts them: its total less
 * the total with `v`'s lines taken away. Independent of the hint's own count,
 * and immune to `cross()`'s asymmetry when a point lies on a line, because the
 * board's own pairing does both counts. */
function lineCrossings(s: UntangleState, v: number): number {
  const rest = s.edges.filter((e) => e.a !== v && e.b !== v);
  return count(s) - findCrossings(s.pts, rest).count;
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
  let journeys = 0;
  let finishing = 0;
  let moves = 0;
  // A rearranging step's sentence depends on the move after it, which may be
  // the head of the next request's plan; it is checked once that is known.
  let pending: { explanation: string; before: number; after: number } | null = null;
  const settle = (nextGain: number | null) => {
    if (pending === null) return;
    const added = pending.after - pending.before;
    const opens =
      nextGain !== null && nextGain > 0 && nextGain >= added ? nextGain : null;
    expect(pending.explanation).toBe(
      say.rearrange(pending.before, pending.after, opens),
    );
    pending = null;
  };
  for (let asks = 0; asks < 60; asks++) {
    if (s.completed) {
      settle(null);
      return { s, clears, rebuilds, journeys, finishing, moves };
    }
    const res = deduceUntangleHintPlan(s, aux);
    if (!res.ok) throw new Error(`hint gave up on an unsolved board: ${res.error}`);
    const legs = res.steps[0].highlights?.marked.length ?? 0;
    if (legs > 0) {
      // A journey is the whole plan: every leg's count is the board's, the
      // marked points are the ones still to move, and it does what its first
      // leg says it does.
      journeys++;
      // The step before may name the single move it frees, which the search
      // found and the journey then did better than: only its form is checked.
      if (pending !== null) {
        const { explanation, before, after } = pending;
        expect([
          say.rearrange(before, after, null),
          ...Array.from({ length: 40 }, (_, k) => say.rearrange(before, after, k + 1)),
        ]).toContain(explanation);
        pending = null;
      }
      const movers = res.steps.map((st) => st.move.points[0].i);
      expect(res.steps.length).toBe(legs + 1);
      const finishes = res.steps[0].explanation.includes("clears every crossing.");
      if (finishes) finishing++;
      const crossingsBefore = count(s);
      // Points on their place in the solved layout are what keep a hint
      // recomputed after any step from cycling: a journey starts elsewhere,
      // and one that leaves crossings behind moves none of them.
      const layout = solvedLayout(s.n, s.w, s.edges, aux);
      if (layout !== null) {
        const targets = closestOrientation(layout, s.pts, s.w);
        const placed = (v: number) => samePoint(s.pts[v], targets[v]);
        expect(placed(movers[0])).toBe(false);
        if (!finishes) expect(movers.filter(placed)).toEqual([]);
      }
      res.steps.forEach((st, i) => {
        const v = movers[i];
        expect(st.highlights?.vertex).toBe(v);
        expect(st.highlights?.marked).toEqual(movers.slice(i + 1));
        expect(st.continuesPrevious ?? false).toBe(i > 0);
        const before = lineCrossings(s, v);
        s = untangleGame.executeMove(s, st.move);
        moves++;
        const after = lineCrossings(s, v);
        expect(st.explanation).toBe(
          say.journey(i, res.steps.length, finishes, before, after),
        );
        expect(st.explanation.length).toBeLessThanOrEqual(120);
        // What keeps a hint recomputed after any step from cycling.
        if (i === 0) expect(after).toBeLessThan(before);
      });
      if (finishes) expect(s.completed).toBe(true);
      for (const v of movers) expect(lineCrossings(s, v)).toBe(0);
      expect(count(s)).toBeLessThan(crossingsBefore);
      continue;
    }
    for (const st of res.steps) {
      const v = st.move.points[0].i;
      expect(st.highlights?.vertex).toBe(v);
      const before = lineCrossings(s, v);
      const next = untangleGame.executeMove(s, st.move);
      const after = lineCrossings(next, v);
      settle(before - after);
      if (after < before) {
        clears++;
        expect(st.explanation).toBe(say.clear(before, after));
        // A ring for at least every crossing the step takes away.
        expect(st.highlights?.cleared.length).toBeGreaterThanOrEqual(before - after);
      } else {
        rebuilds++;
        pending = { explanation: st.explanation, before, after };
      }
      s = next;
      moves++;
    }
  }
  throw new Error("following hints did not converge");
}

describe("Untangle hint", () => {
  it("narrates true counts and solves every board it is followed on", () => {
    // Seed-deterministic but heavy: n=25 is the largest preset and the size at
    // which greedy moves most often run out. Every size and every kind of
    // start runs on each commit; the slow tier adds more seeds of each.
    const seeds = SLOW_TESTS_ENABLED ? 4 : 2;
    let rebuilds = 0;
    let journeys = 0;
    let finishing = 0;
    let boards = 0;
    for (const n of [6, 10, 15, 25]) {
      for (let i = 0; i < seeds; i++) {
        const { state, aux } = generated(n, `hint-${n}-${i}`);
        for (const [start, withAux] of [
          [state, aux],
          [scattered(state, `scatter-${n}-${i}`, 64), undefined],
          [scattered(state, `snapped-${n}-${i}`, 1), aux],
        ] as const) {
          const out = followHints(start, withAux);
          expect(out.s.completed).toBe(true);
          rebuilds += out.rebuilds;
          journeys += out.journeys;
          finishing += out.finishing;
          boards++;
        }
      }
    }
    expect(boards).toBe(4 * seeds * 3);
    // Vacuity: the fallback for "no single move helps" must actually have run,
    // or this test says nothing about the stall that made the old hint give up;
    // and journeys of both kinds, or their checks above checked nothing.
    expect(rebuilds).toBeGreaterThan(0);
    expect(finishing).toBeGreaterThan(0);
    expect(journeys - finishing).toBeGreaterThan(0);
  });

  it("never spends a stall-breaking move on a point with nothing to untangle", () => {
    // The owner's board (a shared ID, so no aux): following hints, the fallback
    // once nudged a crossing-free point 0.18 units and said it "keeps its lines
    // clear". Pinned as the description, since that is what the hint reads.
    const desc =
      "0-5,0-10,0-12,0-19,1-4,1-8,1-10,1-16,2-6,2-13,2-17,3-7,3-14,3-19,4-8,4-18," +
      "5-7,5-12,5-19,6-9,6-11,6-17,7-14,7-19,8-16,8-18,9-11,9-15,10-12,13-14," +
      "13-15,13-17,14-17,15-16,15-18,16-18";
    const start = untangleGame.newState({ n: 20 }, desc);
    let steps = 0;
    let s = start;
    while (!s.completed && steps < 200) {
      const res = deduceUntangleHintPlan(s);
      if (!res.ok) throw new Error(res.error);
      for (const st of res.steps) {
        expect(st.explanation).not.toContain("keeps its lines clear");
        s = untangleGame.executeMove(s, st.move);
        steps++;
      }
    }
    expect(s.completed).toBe(true);
    // ...and the full checks, counts included, hold on it too. Before the
    // endgame journeys, following hints took 35 moves here.
    const out = followHints(start);
    expect(out.s.completed).toBe(true);
    expect(out.moves).toBeLessThanOrEqual(24);
  });

  it("finishes the owner's board in about as many moves as the owner", () => {
    // `20#343769d2db4f418cccd3b79e00c975d0`, pinned as what the hint reads so a
    // change to the generator cannot swap the board. The owner followed hints
    // to move 15 and finished in 5 moves of their own, 20 in all; before the
    // endgame journeys, the hint took 31, thrashing from move 14 on.
    const desc =
      "0-3,0-4,0-10,1-7,1-9,1-14,2-3,2-4,2-13,2-18,3-10,3-18,4-10,5-7,5-9,5-16," +
      "5-19,6-8,6-12,6-15,7-9,8-11,8-12,8-14,9-14,10-15,11-15,11-17,11-18,12-15," +
      "13-16,13-17,13-19,14-17,16-19,17-18";
    const aux =
      "S;P0:11,3/2;P1:3,11/2;P2:13,7/2;P3:11,5/2;P4:11,1/2;P5:9,13/2;P6:1,3/2;" +
      "P7:3,13/2;P8:1,5/2;P9:5,11/2;P10:9,1/2;P11:7,5/2;P12:3,3/2;P13:13,9/2;" +
      "P14:3,9/2;P15:1,1/2;P16:11,11/2;P17:7,7/2;P18:9,7/2;P19:11,13/2";
    const out = followHints(untangleGame.newState({ n: 20 }, desc), aux);
    expect(out.s.completed).toBe(true);
    expect(out.finishing).toBe(1);
    expect(out.moves).toBeLessThanOrEqual(22);
  });

  it("never moves a placed point in a journey that leaves crossings behind", () => {
    // A position reached by following hints from a snapped 25-point scatter,
    // where the best partial journey would move point 4 off its place in the
    // solved layout. Pinned as positions, not as the seed that reached them,
    // so a change elsewhere in the hint cannot walk the check past it: the
    // follow-hints sample above has no such position on the per-commit seeds.
    const desc =
      "0-2,0-20,0-22,0-23,1-6,1-7,1-8,1-17,2-20,2-23,3-9,3-20,3-21,4-5,4-6,4-15," +
      "4-16,5-8,5-12,5-16,6-17,6-19,7-8,7-17,7-18,9-14,9-20,9-21,10-11,10-13," +
      "10-14,10-15,11-13,11-14,12-16,12-24,13-21,13-24,14-21,15-16,15-24,17-18," +
      "18-19,19-22,19-23,22-23";
    const aux =
      "S;P0:13,1/2;P1:13,13/2;P2:11,3/2;P3:3,1/2;P4:9,13/2;P5:9,15/2;P6:11,11/2;" +
      "P7:15,13/2;P8:15,15/2;P9:3,3/2;P10:5,9/2;P11:3,9/2;P12:5,15/2;P13:3,11/2;" +
      "P14:3,5/2;P15:7,11/2;P16:7,13/2;P17:13,11/2;P18:15,9/2;P19:15,7/2;" +
      "P20:7,3/2;P21:1,5/2;P22:15,5/2;P23:13,5/2;P24:3,15/2";
    const at =
      "198/128,72/128;4/1,7/1;117/64,121/64;173/64,84/64;450/128,826/128;4/1,4/1;" +
      "2/1,7/1;321/64,474/64;72/128,952/128;339/64,140/64;414/64,214/64;" +
      "420/64,152/64;4/1,4/1;469/64,121/64;377/64,121/64;574/128,700/128;2/1,3/1;" +
      "265/64,400/64;265/64,344/64;72/128,450/128;574/128,198/128;284/64,66/64;" +
      "72/128,324/128;80/64,196/64;826/128,952/128";
    const points = at.split(";").map((p, i) => {
      const [x, d, y] = p.split(/[/,]/).map(Number);
      return { i, x, y, d };
    });
    const start = untangleGame.executeMove(untangleGame.newState({ n: 25 }, desc), {
      kind: "place",
      points,
      solving: false,
    });
    const out = followHints(start, aux);
    expect(out.s.completed).toBe(true);
    expect(out.journeys - out.finishing).toBeGreaterThan(0);
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

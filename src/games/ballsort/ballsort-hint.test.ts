/**
 * Ball Sort's hint: a pinned position and its sentence for every rung, and
 * what a plan does on any board.
 *
 * `npm run hint-scan -- <this file>` writes the pins
 * (docs/testing.md § "Pinning a hint's positions").
 */
import { describe, expect, it } from "vitest";
import { stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { NO_SOLUTION_FROM_HERE } from "../../engine/solve-failure.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { hasNoSolution, hint, landingSlots, movingBalls } from "./hint.ts";
import { ballsortGame } from "./index.ts";
import { POUR, RUN, TUBE } from "./kinds.ts";
import { Reach } from "./solver.ts";
import {
  type BallsortParams,
  type BallsortState,
  encodeDesc,
  legalPours,
  newState,
  poured,
} from "./state.ts";

const G = ballsortGame;

const pinned = describeHintPins({
  game: G,
  params: [G.decodeParams("4h4e2"), G.decodeParams("5h4e1")],
  seeds: 20,
  descOf: encodeDesc,
  // A hint keeps to lines that sort the board, and a trap is about a pour
  // that would not, so the scan strays on every other turn.
  stray: (s, turn, hinted) => {
    if (turn % 2 === 0 && hinted) return hinted;
    const pours = legalPours(s);
    return pours.length > 0 ? pours[turn % pours.length] : null;
  },
  pins: {
    /** Held on 90 of 1027 positions walked. */
    last: "4h4e2:bbb,dddd,aaaa,b,cccc,",
    /** Held on 32 of 1027 positions walked. */
    only: "5h4e1:abea,aaee,ddcd,edbb,bccc,",
    /** Held on 63 of 1027 positions walked. */
    trap: "5h4e1:eccc,adea,aebb,ebac,ddbd,",
    /** Held on 313 of 1027 positions walked. */
    fills: "4h4e2:cbac,aaba,bb,ccdd,dd,",
    /** Held on 529 of 1027 positions walked. */
    serves: "4h4e2:ccad,dbab,acdd,bbac,,",
  },
});

function deal(p: BallsortParams, seed: string): BallsortState {
  return newState(p, G.newDesc(p, randomNew(seed)).desc);
}

describe("Ball Sort's hint", () => {
  it.each([
    "4h4e2",
    "7h4e2",
    "5h4e1",
  ])("on %s, each hinted pour is one nearer sorted, to the end", (params) => {
    const p = G.decodeParams(params);
    for (const seed of ["a", "b", "c"]) {
      let s = deal(p, seed);
      const reach = Reach.of(s);
      let left = reach?.distance(s) ?? null;
      expect(left).not.toBeNull();
      while (G.status(s) !== "solved") {
        const result = hint(s);
        if (!result.ok) throw new Error(result.error);
        const [step] = result.steps;
        s = G.executeMove(s, step.move);
        const now = reach?.distance(s) ?? null;
        expect(now).toBe((left ?? 0) - 1);
        left = now;
      }
      expect(left).toBe(0);
    }
  });

  it("rings the balls that go and the slots they land in, and stripes a lost rival's", () => {
    for (const kind of ["trap", "serves"] as const) {
      const { state, steps } = pinned(kind);
      const step = steps[0];
      const marks = stepMarks(step);
      if (step.move.type !== "pour") throw new Error("expected a pour");
      expect(marks.of("ring", RUN)).toEqual(movingBalls(state, step.move));
      expect(marks.of("ring", TUBE)).toEqual([step.move.to]);
      if (kind === "trap") {
        const [rival] = marks.of("stripes", POUR);
        const after = poured(state, { type: "pour", ...rival });
        expect(Reach.of(state)?.distance(after)).toBeNull();
        expect(landingSlots(state, rival).length).toBeGreaterThan(0);
      }
    }
  });

  it("sees at a glance a board with no pour at all", () => {
    // The two tubes with room show b and c on top, and no other tube does.
    const stuck = newState(G.decodeParams("3h2e1"), "ca,b,ba,c");
    expect(legalPours(stuck)).toEqual([]);
    expect(G.status(stuck)).toBe("ongoing");
    expect(hasNoSolution(stuck)).toBe(true);
  });

  it("refuses a dead end that still has pours, which only the search proves", () => {
    const p = G.decodeParams("5h4e1");
    let found = 0;
    for (const seed of ["d1", "d2", "d3", "d4", "d5"]) {
      let s = deal(p, seed);
      for (let turn = 0; turn < 40; turn++) {
        const pours = legalPours(s);
        if (pours.length === 0) break;
        s = poured(s, pours[(turn * 7) % pours.length]);
        if (Reach.of(s)?.distance(s) !== null || legalPours(s).length === 0) continue;
        expect(hasNoSolution(s)).toBe(false);
        expect(hint(s)).toEqual({ ok: false, error: NO_SOLUTION_FROM_HERE });
        found++;
        break;
      }
    }
    expect(found).toBeGreaterThan(0);
  });
});

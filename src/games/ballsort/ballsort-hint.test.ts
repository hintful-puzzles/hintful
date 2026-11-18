/**
 * Ball Sort's hint: a pinned position and its sentence for every rung, and
 * what a plan does on any board.
 *
 * `npm run hint-scan -- <this file>` writes the pins
 * (docs/testing.md § "Pinning a hint's positions").
 */
import { describe, expect, it } from "vitest";
import { FREE_NAMES } from "../../engine/color/colors.ts";
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
  isSorted,
  legalPours,
  newState,
  poured,
  topColor,
} from "./state.ts";

const G = ballsortGame;

const pinned = describeHintPins({
  game: G,
  params: [G.decodeParams("4h4e2"), G.decodeParams("5h4e1")],
  seeds: 20,
  descOf: encodeDesc,
  // A hint keeps to lines that sort the board, and a choice of two is about
  // a pour that would not, so the scan strays on every other turn.
  stray: (s, turn, hinted) => {
    if (turn % 2 === 0 && hinted) return hinted;
    const pours = legalPours(s);
    return pours.length > 0 ? pours[turn % pours.length] : null;
  },
  pins: {
    /** Held on 90 of 1027 positions walked. */
    last: "4h4e2:bbb,dddd,aaaa,b,cccc,",
    /** Held on 313 of 1027 positions walked. */
    fills: "4h4e2:cbac,aaba,bb,ccdd,dd,",
    /** Held on 30 of 1027 positions walked. */
    either: "5h4e1:bcd,ceaa,ade,acce,dbde,bb",
    /** Held on 278 of 1027 positions walked. */
    frees: "4h4e2:ccad,dbab,acdd,bbac,,",
    /** Held on 35 of 1027 positions walked. */
    empties: "4h4e2:dcc,aa,ccbb,bbad,dd,a",
    /** Held on 187 of 1027 positions walked. */
    joins: "4h4e2:cca,dbab,acdd,bbac,d,",
    /** Held on 84 of 1027 positions walked. */
    starts: "4h4e2:dcdb,cdba,bdaa,bcca,,",
    /** Held on 10 of 1027 positions walked. */
    plain: "5h4e1:abae,cceb,dedb,adcc,bead,",
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
    for (const kind of ["either", "plain"] as const) {
      const { state, steps } = pinned(kind);
      const step = steps[0];
      const marks = stepMarks(step);
      if (step.move.type !== "pour") throw new Error("expected a pour");
      expect(marks.of("ring", RUN)).toEqual(movingBalls(state, step.move));
      expect(marks.of("ring", TUBE)).toEqual([step.move.to]);
      if (kind === "either") {
        expect(legalPours(state)).toHaveLength(2);
        const [rival] = marks.of("stripes", POUR);
        const after = poured(state, { type: "pour", ...rival });
        expect(Reach.of(state)?.distance(after)).toBeNull();
        expect(landingSlots(state, rival).length).toBeGreaterThan(0);
      }
    }
  });

  it("frees balls the hints go on to move before covering them, of the color it names", () => {
    const { state, steps } = pinned("frees");
    const first = steps[0].move;
    if (first.type !== "pour") throw new Error("expected a pour");
    let s = G.executeMove(state, first);
    const named = topColor(s, first.from);
    for (;;) {
      const result = hint(s);
      if (!result.ok) throw new Error(result.error);
      const next = result.steps[0].move;
      if (next.type !== "pour") throw new Error("expected a pour");
      expect(next.to, "nothing is poured onto the freed balls").not.toBe(first.from);
      if (next.from === first.from) {
        expect(topColor(s, next.from)).toBe(named);
        expect(steps[0].explanation).toContain(`the ${FREE_NAMES[named - 1].only} `);
        return;
      }
      s = G.executeMove(s, next);
    }
  });

  it("starts a tube the hints go on to fill with its color before pouring out of it", () => {
    const { state, steps } = pinned("starts");
    const first = steps[0].move;
    if (first.type !== "pour") throw new Error("expected a pour");
    let s = G.executeMove(state, first);
    const color = topColor(s, first.to);
    expect(steps[0].explanation).toContain(`a tube of ${FREE_NAMES[color - 1].only}`);
    while (!isSorted(s, first.to)) {
      const result = hint(s);
      if (!result.ok) throw new Error(result.error);
      const next = result.steps[0].move;
      if (next.type !== "pour") throw new Error("expected a pour");
      expect(next.from, "nothing leaves the tube begun").not.toBe(first.to);
      s = G.executeMove(s, next);
    }
    expect(topColor(s, first.to)).toBe(color);
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

/**
 * Pegs' solver, Solve and hint (`add-pegs-hint`).
 *
 * Each narration branch is pinned by the position it fires on, found by a scan
 * over random play on 5×5 Random boards (2026-10-02), so a change to the
 * generator cannot quietly stop a branch being exercised.
 */

import { describe, expect, it } from "vitest";
import { stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { NO_SOLUTION_FROM_HERE } from "../../engine/solve-failure.ts";
import { leafPresets } from "../../engine/testing/presets.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { hint, hintKeepTrack } from "./hint.ts";
import { HOLE, PEG } from "./hint-text.ts";
import { pegsGame } from "./index.ts";
import { findFinish, frozenPegs, legalJumps, provedLost } from "./solver.ts";
import { GRID_PEG, type PegsMove, type PegsState, status } from "./state.ts";

const G = pegsGame;

function load(id: string): PegsState {
  const [params, desc] = id.split(":");
  return G.newState(G.decodeParams(params), desc);
}

const pegCount = (s: PegsState) => s.grid.filter((v) => v === GRID_PEG).length;

const PINNED = {
  /** The first step's every rival jump loses. */
  only: "5x5:OOPPOOHHPPHHHPHOPPPHOOOPO",
  /** A rival jump to the first step would leave a peg frozen. */
  strands: "5x5:OHHHPOOPPPPHHPHOOPHPOOPOO",
  /** A plan in which one peg jumps twice running. */
  run: "5x5:OPPHPOOPPPPPHPPOOPPPOOPOO",
  /** Lost, with no peg frozen: only the exhaustive search can say so. */
  lost: "5x5:POPPPPHPOOPHHHHPPHOOHOOOO",
} as const;

/** Two pegs, each beyond any other's reach. */
const TWO_CUT_OFF = "5x1:PHHHP";
/** A pair that can still jump, and a peg walled off from it. */
const ONE_CUT_OFF = "7x1:PPHOHHP";

describe("pegs solver", () => {
  it("finishes every preset's dealt board, and the line it finds plays out", () => {
    const presets = leafPresets(G);
    expect(presets.length).toBeGreaterThan(0);
    for (const { params } of presets) {
      const { desc } = G.newDesc(params, randomNew("solver"));
      let s = G.newState(params, desc);
      const finish = findFinish(s);
      if (finish.kind !== "found") throw new Error(`${G.encodeParams(params, true)}`);
      for (const j of finish.jumps) {
        s = G.executeMove(s, {
          type: "jump",
          sx: j.from % s.w,
          sy: Math.floor(j.from / s.w),
          tx: j.to % s.w,
          ty: Math.floor(j.to / s.w),
        });
      }
      expect(status(s)).toBe("solved");
    }
  });

  it("calls a peg frozen only on a position the exhaustive search proves lost", () => {
    // The closure's soundness, checked against a search with no closure in it:
    // every 5×5 position random play reaches whose frozen check fires.
    let fired = 0;
    const params = G.decodeParams("5x5random");
    for (let seed = 0; seed < 40; seed++) {
      const rng = randomNew(`frozen${seed}`);
      let s = G.newState(params, G.newDesc(params, rng).desc);
      for (let k = 0; k < 15; k++) {
        if (frozenPegs(s).length > 0) {
          fired++;
          expect(findFinish(s).kind).toBe("lost");
        }
        const jumps = legalJumps(s);
        if (jumps.length === 0) break;
        const j = jumps[k % jumps.length];
        s = G.executeMove(s, {
          type: "jump",
          sx: j.from % 5,
          sy: Math.floor(j.from / 5),
          tx: j.to % 5,
          ty: Math.floor(j.to / 5),
        });
      }
    }
    expect(fired).toBeGreaterThan(0);
  });

  it("proves the pinned lost position lost, with no peg frozen", () => {
    const s = load(PINNED.lost);
    expect(frozenPegs(s)).toEqual([]);
    expect(provedLost(s, 100_000)).toBe(true);
    expect(provedLost(load(PINNED.only), 100_000)).toBe(false);
  });

  it("does not call a finished board's last peg frozen", () => {
    // A desc must have two pegs, so the finished board is built directly.
    const grid = Uint8Array.from([0, 0, GRID_PEG]);
    expect(frozenPegs({ w: 3, h: 1, grid })).toEqual([]);
  });
});

describe("pegs hint", () => {
  it("refuses a board with pegs cut off, counting them", () => {
    const two = hint(load(TWO_CUT_OFF));
    expect(two.ok).toBe(false);
    if (!two.ok) expect(two.error).toMatch(/^2 pegs are cut off/);
    const one = hint(load(ONE_CUT_OFF));
    expect(one.ok).toBe(false);
    if (!one.ok) expect(one.error).toMatch(/^A peg is cut off/);
  });

  it("refuses a lost board with nothing frozen as one no solution leaves", () => {
    expect(hint(load(PINNED.lost))).toEqual({
      ok: false,
      error: NO_SOLUTION_FROM_HERE,
    });
  });

  it("says a jump is the only one only where it is", () => {
    const r = hint(load(PINNED.only));
    if (!r.ok) throw new Error(r.error);
    expect(r.steps[0].explanation).toMatch(/only jump from here that can still finish/);
  });

  it("outlines the peg a rival jump would cut off", () => {
    const s = load(PINNED.strands);
    const r = hint(s);
    if (!r.ok) throw new Error(r.error);
    const step = r.steps[0];
    expect(step.explanation).toMatch(/would cut off the outlined peg/);
    const [cut] = stepMarks(step).of("outline", PEG);
    expect(s.grid[cut]).toBe(GRID_PEG);
    // It really is a rival that cuts it off, not the hinted jump.
    const rival = legalJumps(s).find((j) => {
      const grid = new Uint8Array(s.grid);
      grid[j.from] = 0;
      grid[j.over] = 0;
      grid[j.to] = 1;
      return frozenPegs({ ...s, grid }).includes(cut);
    });
    expect(rival).toBeDefined();
  });

  it("runs one peg's chain of jumps as one journey", () => {
    const r = hint(load(PINNED.run));
    if (!r.ok) throw new Error(r.error);
    const i = r.steps.findIndex((st) => st.continuesPrevious);
    expect(i).toBeGreaterThan(0);
    const [prev, next] = [r.steps[i - 1].move, r.steps[i].move];
    if (prev.type !== "jump" || next.type !== "jump") throw new Error("jumps");
    expect([next.sx, next.sy]).toEqual([prev.tx, prev.ty]);
  });

  it("rings the jumping peg and the hole it lands in, and following it solves", () => {
    let s = load("7x7:OOPPPOOOOPPPOOPPPPPPPPPPHPPPPPPPPPPOOPPPOOOOPPPOO");
    const r = hint(s);
    if (!r.ok) throw new Error(r.error);
    expect(r.steps).toHaveLength(pegCount(s) - 1);
    for (const step of r.steps) {
      const m = step.move;
      if (m.type !== "jump") throw new Error("jump");
      const marks = stepMarks(step);
      expect(marks.of("ring", PEG)).toEqual([m.sy * s.w + m.sx]);
      expect(marks.of("ring", HOLE)).toEqual([m.ty * s.w + m.tx]);
      expect(hintKeepTrack(m, step, s)).toBe("completed");
      s = G.executeMove(s, m);
    }
    expect(status(s)).toBe("solved");
  });

  it("drops the plan on any other jump", () => {
    const s = load(PINNED.strands);
    const r = hint(s);
    if (!r.ok) throw new Error(r.error);
    const step = r.steps[0];
    const want = step.move;
    if (want.type !== "jump") throw new Error("jump");
    const other = legalJumps(s).find(
      (j) => j.from !== want.sy * s.w + want.sx || j.to !== want.ty * s.w + want.tx,
    );
    if (!other) throw new Error("expected a rival jump");
    const m: PegsMove = {
      type: "jump",
      sx: other.from % s.w,
      sy: Math.floor(other.from / s.w),
      tx: other.to % s.w,
      ty: Math.floor(other.to / s.w),
    };
    expect(hintKeepTrack(m, step, s)).toBe("off");
  });

  it("draws the rings in the hint's colors (tier 2.5)", () => {
    const { recording } = renderScenario({
      game: G,
      id: PINNED.strands,
      showHint: true,
    });
    const rings = (color: number) =>
      recording.ops.filter(
        (o) => o.op === "circle" && o.fill === -1 && o.outline === color,
      ).length;
    // COL_HINT and COL_HINT_EVIDENCE: two strokes per ring, a ringed peg and
    // hole, and one outlined peg.
    expect(rings(6)).toBe(4);
    expect(rings(7)).toBe(2);
    expect(recording.ops).toMatchSnapshot();
  });
});

describe("pegs solve", () => {
  const solveOf = (orig: string, curr: string) => {
    const solve = G.solve;
    if (!solve) throw new Error("expected solve");
    return solve(load(orig), load(curr));
  };

  it("finishes from the player's position when it can", () => {
    const r = solveOf(PINNED.only, PINNED.only);
    if (!r.ok) throw new Error(r.error);
    const done = G.executeMove(load(PINNED.only), r.move);
    expect(status(done)).toBe("solved");
  });

  it("falls back to the dealt board when the player's position is lost", () => {
    const r = solveOf("7x1:PPHOHHH", ONE_CUT_OFF);
    expect(r).toEqual({ ok: true, move: { type: "solve", finish: 2 } });
    if (!r.ok) return;
    expect(G.textFormat?.(G.executeMove(load(ONE_CUT_OFF), r.move))).toBe("--* ---");
  });

  it("says a board no line finishes from has no solution", () => {
    expect(solveOf(TWO_CUT_OFF, TWO_CUT_OFF)).toEqual({
      ok: false,
      error: "This puzzle has no solution.",
    });
  });

  it("round-trips the solve move through a save", () => {
    const m: PegsMove = { type: "solve", finish: 12 };
    expect(G.deserializeMove?.(G.serializeMove?.(m))).toEqual(m);
  });
});

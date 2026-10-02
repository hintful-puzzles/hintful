/**
 * Pegs' solver, Solve and hint (`add-pegs-hint`).
 *
 * Each sentence the hint can say is pinned by a position it fires on, found by
 * a fixed-seed scan over hint-guided and random play on 5×5 Random and 7×7
 * Random boards (2026-10-02), so a change to the generator cannot quietly stop
 * a branch being exercised.
 */

import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { NO_SOLUTION_FROM_HERE } from "../../engine/solve-failure.ts";
import { bindingDefects } from "../../engine/testing/hint-binding.ts";
import { leafPresets } from "../../engine/testing/presets.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { hint, hintKeepTrack } from "./hint.ts";
import { HOLE, JUMP, type Marked, PEG } from "./hint-text.ts";
import { pegsGame } from "./index.ts";
import { findFinish, frozenPegs, legalJumps, provedLost } from "./solver.ts";
import { GRID_HOLE, GRID_PEG, type PegsMove, type PegsState, status } from "./state.ts";

const G = pegsGame;

function load(id: string): PegsState {
  const [params, desc] = id.split(":");
  return G.newState(G.decodeParams(params), desc);
}

const pegCount = (s: PegsState) => s.grid.filter((v) => v === GRID_PEG).length;

function played(s: PegsState, j: Marked): PegsState {
  const grid = new Uint8Array(s.grid);
  grid[j.from] = GRID_HOLE;
  grid[(j.from + j.to) / 2] = GRID_HOLE;
  grid[j.to] = GRID_PEG;
  return { ...s, grid };
}

const asMarked = (s: PegsState, m: PegsMove): Marked => {
  if (m.type !== "jump") throw new Error("expected a jump");
  return { from: m.sy * s.w + m.sx, to: m.ty * s.w + m.tx };
};

const same = (a: Marked, b: Marked) => a.from === b.from && a.to === b.to;

const PINNED = {
  /** A rival cuts a peg off at once. */
  trap: "5x5:OOOOPHHHHHOHHHPOHHPPOOHPO",
  /** After a rival, every next jump cuts off the same peg. */
  trapSoon: "5x5:OOPPPOOPHOOHPPPHHHPPOOHHO",
  /** The plan opens by clearing a row, a column, or a block of six. */
  row: "5x5:PPHPPPOPPOPPPPPPPHPPOOPOO",
  column: "5x5:OHOOOHHPHOHHPHHPPPHHPHPPO",
  block: "5x5:OPPPPPPPPPPPHPPPPPPOPPPOO",
  /** Every rival loses. */
  only: "5x5:OOPPPOOPHOOPPHPHHPPPOOPHO",
  /** Every rival settled: some finish, some lose. */
  onlyThese: "5x5:OOOOPPHPHHOHHPPOPPPPOOPPO",
  /** Some finish, some lose, and some were past the search. */
  alsoThese: "7x7:PPHHOOOOPPHHOHOOHPHHHOHPPPPPOOPHHPPOHHPPPPOOOHOOO",
  /** Every jump can finish. */
  anyJump: "5x5:OOOOPPPPPPOPPPPOPPHPOOPPO",
  /** The jump that leaves one peg. */
  last: "5x5:OOOOHHHHHHOHHPPOHHHHOOHHO",
  /** Lost, with no peg frozen: only the exhaustive search can say so. */
  lost: "5x5:POPPPPHPOOPHHHHPPHOOHOOOO",
} as const;

/** Two pegs, each beyond any other's reach. */
const TWO_CUT_OFF = "5x1:PHHHP";
/** A pair that can still jump, and a peg walled off from it. */
const ONE_CUT_OFF = "7x1:PPHOHHP";

/** The hint at `id`, which must offer a plan, with its first step's text
 * checked against `text`. */
function planAt(
  id: string,
  text: RegExp,
): { s: PegsState; steps: HintStep<PegsMove>[] } {
  const s = load(id);
  const r = hint(s);
  if (!r.ok) throw new Error(r.error);
  expect(r.steps[0].explanation).toMatch(text);
  for (const step of r.steps) expect(step.explanation.length).toBeLessThanOrEqual(120);
  return { s, steps: r.steps };
}

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

  it("stripes a rival that cuts a peg off at once, and outlines that peg", () => {
    const { s, steps } = planAt(
      PINNED.trap,
      /The striped jump would cut off the outlined peg/,
    );
    const marks = stepMarks(steps[0]);
    const [rival] = marks.of("stripes", JUMP);
    const [victim] = marks.of("outline", PEG);
    expect(legalJumps(s).some((j) => same(j, rival))).toBe(true);
    expect(same(rival, asMarked(s, steps[0].move))).toBe(false);
    expect(frozenPegs(played(s, rival))).toContain(victim);
  });

  it("names a rival after which every jump cuts the outlined peg off", () => {
    const { s, steps } = planAt(PINNED.trapSoon, /any jump you make next cuts off/);
    const marks = stepMarks(steps[0]);
    const [rival] = marks.of("stripes", JUMP);
    const [victim] = marks.of("outline", PEG);
    const next = played(s, rival);
    expect(frozenPegs(next)).toEqual([]);
    const replies = legalJumps(next);
    expect(replies.length).toBeGreaterThan(0);
    for (const j of replies) expect(frozenPegs(played(next, j))).toContain(victim);
  });

  for (const [name, n] of [
    ["row", 3],
    ["column", 3],
    ["block", 6],
  ] as const) {
    it(`walks the clearing of a ${name} as one journey`, () => {
      const { s, steps } = planAt(
        PINNED[name],
        new RegExp(`clear the striped ${name} and`),
      );
      expect(steps).toHaveLength(n);
      expect(steps.slice(1).every((st) => st.continuesPrevious)).toBe(true);
      expect(steps[0].continuesPrevious).toBeUndefined();
      const shape = stepMarks(steps[0]).of("stripes", PEG);
      expect(shape).toHaveLength(n);
      let end = s;
      for (const st of steps) end = G.executeMove(end, st.move);
      // Exactly the striped pegs are gone, and everything else is as it was.
      for (const [i, v] of s.grid.entries())
        expect(end.grid[i]).toBe(shape.includes(i) ? GRID_HOLE : v);
    });
  }

  it("says a jump is the only one only where every rival is proved lost", () => {
    const { s, steps } = planAt(PINNED.only, /only jump here that can still finish/);
    const j = asMarked(s, steps[0].move);
    const rivals = legalJumps(s).filter((r) => !same(r, j));
    expect(rivals.length).toBeGreaterThan(0);
    for (const r of rivals) expect(provedLost(played(s, r), 100_000)).toBe(true);
  });

  it("draws the arrows on exactly the rivals that can still finish", () => {
    const { s, steps } = planAt(
      PINNED.onlyThese,
      /Only it and the jumps? with (an )?arrows?/,
    );
    const j = asMarked(s, steps[0].move);
    const arrows = stepMarks(steps[0]).of("outline", JUMP);
    expect(arrows.length).toBeGreaterThan(0);
    for (const r of legalJumps(s).filter((r) => !same(r, j))) {
      const shown = arrows.some((a) => same(a, r));
      if (shown) expect(findFinish(played(s, r)).kind).toBe("found");
      else expect(provedLost(played(s, r), 100_000)).toBe(true);
    }
  });

  it("claims nothing about an undrawn rival the search could not settle", () => {
    const { s, steps } = planAt(
      PINNED.alsoThese,
      /can also finish with one peg; some others cannot/,
    );
    const j = asMarked(s, steps[0].move);
    const arrows = stepMarks(steps[0]).of("outline", JUMP);
    for (const a of arrows) expect(findFinish(played(s, a)).kind).toBe("found");
    const undrawn = legalJumps(s).filter(
      (r) => !same(r, j) && !arrows.some((a) => same(a, r)),
    );
    expect(undrawn.some((r) => provedLost(played(s, r), 300_000))).toBe(true);
  });

  it("says every jump can finish only where each one can", () => {
    const { s } = planAt(PINNED.anyJump, /^Every jump here can still finish/);
    for (const r of legalJumps(s)) expect(findFinish(played(s, r)).kind).toBe("found");
  });

  it("names the jump that leaves one peg", () => {
    const { s, steps } = planAt(PINNED.last, /to finish with one peg\.$/);
    expect(status(G.executeMove(s, steps[0].move))).toBe("solved");
  });

  it("binds every pinned step's words to what it draws", () => {
    let checked = 0;
    for (const id of Object.values(PINNED)) {
      if (id === PINNED.lost) continue;
      let s = load(id);
      const r = hint(s);
      if (!r.ok) throw new Error(`${id}: ${r.error}`);
      for (const step of r.steps) {
        expect(bindingDefects(G, s, G.newUi(s), step), id).toEqual([]);
        s = G.executeMove(s, step.move);
        checked++;
      }
    }
    // Ten plans, three of them packages of 3, 3 and 6 legs.
    expect(checked).toBe(7 + 3 + 3 + 6);
  });

  it("rings the jumping peg and the hole it lands in, and following it solves", () => {
    let s = load("7x7:OOPPPOOOOPPPOOPPPPPPPPPPHPPPPPPPPPPOOPPPOOOOPPPOO");
    let requests = 0;
    while (status(s) !== "solved") {
      const r = hint(s);
      if (!r.ok) throw new Error(r.error);
      requests++;
      for (const step of r.steps) {
        const m = step.move;
        if (m.type !== "jump") throw new Error("jump");
        const marks = stepMarks(step);
        expect(marks.of("ring", PEG)).toEqual([m.sy * s.w + m.sx]);
        expect(marks.of("ring", HOLE)).toEqual([m.ty * s.w + m.tx]);
        expect(hintKeepTrack(m, step, s)).toBe("completed");
        s = G.executeMove(s, m);
      }
    }
    expect(requests).toBeGreaterThan(1);
    expect(pegCount(s)).toBe(1);
  });

  it("drops the plan on any other jump", () => {
    const s = load(PINNED.trap);
    const r = hint(s);
    if (!r.ok) throw new Error(r.error);
    const step = r.steps[0];
    const want = asMarked(s, step.move);
    const other = legalJumps(s).find((j) => !same(j, want));
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

  // COL_HINT and COL_HINT_EVIDENCE.
  const COL_HINT = 6;
  const COL_HINT_EVIDENCE = 7;

  it("draws a trap's rings, outline and stripes (tier 2.5)", () => {
    const { recording } = renderScenario({ game: G, id: PINNED.trap, showHint: true });
    const rings = (color: number) =>
      recording.ops.filter(
        (o) => o.op === "circle" && o.fill === -1 && o.outline === color,
      ).length;
    // Two strokes per ring: a ringed peg and hole, and one outlined peg.
    expect(rings(COL_HINT)).toBe(4);
    expect(rings(COL_HINT_EVIDENCE)).toBe(2);
    // The rival's three squares are striped.
    expect(recording.ops.filter((o) => o.op === "hatch").length).toBe(3);
    expect(recording.ops).toMatchSnapshot();
  });

  it("draws an arrow per rival that can still finish (tier 2.5)", () => {
    const s = load(PINNED.onlyThese);
    const r = hint(s);
    if (!r.ok) throw new Error(r.error);
    const arrows = stepMarks(r.steps[0]).of("outline", JUMP);
    const { recording } = renderScenario({
      game: G,
      id: PINNED.onlyThese,
      showHint: true,
    });
    // An arrowhead is drawn once, by the square holding the hole it points at,
    // and clipped away in the other two.
    const heads = recording.ops.filter(
      (o) => o.op === "polygon" && o.fill === COL_HINT_EVIDENCE,
    );
    expect(heads.length).toBe(arrows.length * 3);
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

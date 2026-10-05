import { describe, expect, it } from "vitest";
import {
  BORDER,
  BORDER_MASK,
  buildDsf,
  DISABLED,
  DX,
  DY,
  FLIP,
  initBorders,
} from "../../engine/border-grid.ts";
import { EDGE } from "../../engine/border-grid-hint.ts";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  descBadCharacter,
  validateDesc,
} from "../../engine/desc-error.ts";
import type { HintStep } from "../../engine/game.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { presetMenu } from "../../engine/param-label.ts";
import { paramsError } from "../../engine/params.ts";
import { newCursor } from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { palisadeGame } from "./index.ts";
import { deduceForcedEdges, newDesc, solver, solveToBorders } from "./solver.ts";
import {
  bitcount,
  decodeParams,
  encodeDesc,
  encodeParams,
  isSolved,
  newState,
  type PalisadeHint,
  type PalisadeMove,
  type PalisadeParams,
  type PalisadeState,
} from "./state.ts";

const PRESETS: PalisadeParams[] = [
  { w: 5, h: 5, k: 5 },
  { w: 6, h: 8, k: 6 },
  { w: 8, h: 10, k: 8 },
  { w: 12, h: 15, k: 10 },
];

describe("palisade params", () => {
  it("encodes and round-trips", () => {
    expect(encodeParams({ w: 8, h: 6, k: 6 }, true)).toBe("8x6n6");
    expect(decodeParams("8x6n6")).toEqual({ w: 8, h: 6, k: 6 });
  });

  it("decodes a bare size leniently", () => {
    expect(decodeParams("5")).toEqual({ w: 5, h: 5, k: 5 });
    expect(decodeParams("7x7")).toEqual({ w: 7, h: 7, k: 7 });
  });

  it("validates the region-size constraints", () => {
    const error = (p: PalisadeParams) => paramsError(palisadeGame, p, true);
    expect(error({ w: 5, h: 5, k: 5 })).toBeNull();
    expect(error({ w: 5, h: 5, k: 0 })).toBe("Region size must be at least 1.");
    expect(error({ w: 5, h: 5, k: 7 })).not.toBeNull(); // 7 ∤ 25
    expect(error({ w: 5, h: 5, k: 25 })).not.toBeNull(); // k = wh
    expect(error({ w: 4, h: 4, k: 2 })).not.toBeNull(); // k=2 corridor
    expect(error({ w: 1, h: 4, k: 2 })).toBeNull(); // k=2 allowed on a strip
  });

  it("titles its presets by size and region size", () => {
    expect(presetMenu(palisadeGame).submenu?.[1]?.title).toBe("6x8, regions of size 6");
  });
});

describe("palisade desc codec", () => {
  it("round-trips a clue grid", () => {
    const p = { w: 5, h: 5, k: 5 };
    const { desc } = newDesc(p, randomNew("palisade-desc"));
    expect(validateDesc(palisadeGame, p, desc)).toBeNull();
    const state = newState(p, desc);
    expect(encodeDesc(state.clues, p.w * p.h)).toBe(desc);
  });

  it("rejects malformed descs", () => {
    const p = { w: 5, h: 5, k: 5 };
    expect(validateDesc(palisadeGame, p, "5")).toBe(DESC_OUT_OF_RANGE); // clue > 4
    expect(validateDesc(palisadeGame, p, "?")).toBe(descBadCharacter("?"));
    expect(validateDesc(palisadeGame, p, "z".repeat(2))).toBe(DESC_TOO_LONG); // 52 > 25 squares
  });
});

describe("palisade solver + generator", () => {
  // Generation is CPU-heavy (the 15×12 preset is ~0.7s/board) and slower still
  // under parallel-suite load; the verdict below is what matters, not the clock.
  it("generates uniquely solvable boards across presets", () => {
    for (const p of PRESETS) {
      const rng = randomNew(`palisade-gen-${p.w}x${p.h}`);
      const { desc } = newDesc(p, rng);
      const state = newState(p, desc);
      const sol = solveToBorders(p, state.clues);
      expect(sol).not.toBeNull();
      if (sol) {
        expect(isSolved(p.w, p.h, p.k, state.clues, sol)).toBe(true);
      }
    }
  });

  it("the solver fills the rim into a valid division", () => {
    const p = { w: 5, h: 5, k: 5 };
    const { desc } = newDesc(p, randomNew("palisade-solve"));
    const clues = newState(p, desc).clues;
    const borders = initBorders(p.w, p.h);
    expect(solver(p, clues, borders)).toBe(true);
    // Every region exactly k, every clue equals its wall count.
    const dsf = buildDsf(p.w, p.h, borders, true);
    for (let i = 0; i < p.w * p.h; i++) {
      expect(dsf.size(i)).toBe(p.k);
      if (clues[i] >= 0) expect(bitcount(borders[i])).toBe(clues[i]);
    }
  });
});

describe("palisade moves", () => {
  it("toggles a wall on both shared sides", () => {
    const p = { w: 5, h: 5, k: 5 };
    const { desc } = newDesc(p, randomNew("palisade-move"));
    const s0 = newState(p, desc);
    // Right edge of cell (1,1): flag BORDER_R on (1,1), BORDER_L on (2,1).
    const s1 = palisadeGame.executeMove(s0, {
      type: "edges",
      edits: [
        { x: 1, y: 1, flag: BORDER(1) },
        { x: 2, y: 1, flag: BORDER(3) },
      ],
    });
    expect(s1.borders[1 * 5 + 1] & BORDER(1)).toBeTruthy();
    expect(s1.borders[1 * 5 + 2] & BORDER(3)).toBeTruthy();
    expect(s0.borders[1 * 5 + 1] & BORDER(1)).toBeFalsy(); // original unchanged
  });

  it("rejects toggling a grid-rim wall", () => {
    const p = { w: 5, h: 5, k: 5 };
    const s0 = newState(p, newDesc(p, randomNew("palisade-rim")).desc);
    expect(() =>
      palisadeGame.executeMove(s0, {
        type: "edges",
        edits: [{ x: 0, y: 0, flag: BORDER(0) }], // up wall on top row → off-grid
      }),
    ).toThrow();
  });

  it("a solve move completes the board", () => {
    const p = { w: 5, h: 5, k: 5 };
    const s0 = newState(p, newDesc(p, randomNew("palisade-solvemove")).desc);
    const res = palisadeGame.solve?.(s0, s0);
    expect(res?.ok).toBe(true);
    if (res?.ok) {
      const solved = palisadeGame.executeMove(s0, res.move);
      expect(palisadeGame.status(solved)).toBe("solved");
    }
  });
});

describe("palisade findMistakes", () => {
  it("flags a wall the solution lacks and stays clean on the solution", () => {
    const p = { w: 5, h: 5, k: 5 };
    const s0 = newState(p, newDesc(p, randomNew("palisade-mistake")).desc);
    const sol = solveToBorders(p, s0.clues);
    expect(sol).not.toBeNull();
    if (!sol) return;

    // The full solution has no mistakes.
    const solvedState = { ...s0, borders: sol.slice() };
    expect(palisadeGame.findMistakes?.(solvedState)).toHaveLength(0);

    // Draw a wall the solution does not contain → at least one mistake.
    // Find an interior edge with no wall in the solution.
    let found = false;
    for (let y = 0; y < p.h && !found; y++) {
      for (let x = 0; x < p.w && !found; x++) {
        const i = y * p.w + x;
        if (x + 1 < p.w && !(sol[i] & BORDER(1))) {
          const bad = sol.slice();
          bad[i] |= BORDER(1);
          bad[i + 1] |= BORDER(3);
          const mistakes = palisadeGame.findMistakes?.({ ...s0, borders: bad }) ?? [];
          expect(mistakes.length).toBeGreaterThan(0);
          found = true;
        }
      }
    }
    expect(found).toBe(true);
  });

  it("flags a no-wall mark contradicting the solution", () => {
    const p = { w: 5, h: 5, k: 5 };
    const s0 = newState(p, newDesc(p, randomNew("palisade-mark")).desc);
    const sol = solveToBorders(p, s0.clues);
    // A generated board that stops solving, or a solution with no interior wall,
    // would leave every assertion below unreached — so both end the test rather
    // than returning from it.
    if (!sol) throw new Error("the generated board did not solve");
    // Find an interior edge that IS a wall in the solution; mark it no-wall.
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x + 1 < p.w; x++) {
        const i = y * p.w + x;
        if (sol[i] & BORDER(1)) {
          const bad = sol.slice();
          // remove the wall and assert a no-wall mark there
          bad[i] &= ~BORDER(1) & 0xff;
          bad[i] |= DISABLED(BORDER(1));
          const mistakes = palisadeGame.findMistakes?.({ ...s0, borders: bad }) ?? [];
          expect(mistakes.some((m) => m.x === x && m.y === y && m.dir === 1)).toBe(
            true,
          );
          return;
        }
      }
    }
    throw new Error("the solution had no interior wall to contradict");
  });
});

// When the flash plays is the engine's (`midend.test.ts`); Palisade supplies
// its duration and a status that is the board's.
describe("palisade completion", () => {
  it("has a win flash", () => {
    const p = { w: 5, h: 5, k: 5 };
    const s0 = newState(p, newDesc(p, randomNew("palisade-flash")).desc);
    expect(palisadeGame.solvedFlash?.(s0, { cursor: newCursor(1, 1) })).toBeGreaterThan(
      0,
    );
  });

  it("breaking a solved board reverts it to unsolved", () => {
    const p = { w: 5, h: 5, k: 5 };
    const s0 = newState(p, newDesc(p, randomNew("palisade-unstick")).desc);
    const sol = solveToBorders(p, s0.clues);
    if (!sol) throw new Error("the generated board did not solve");
    const solved = { ...s0, borders: sol.slice() };
    expect(palisadeGame.status(solved)).toBe("solved");
    // Remove an interior wall → no longer a valid division.
    let broke = false;
    for (let y = 0; y < p.h && !broke; y++) {
      for (let x = 0; x + 1 < p.w && !broke; x++) {
        const i = y * p.w + x;
        if (sol[i] & BORDER(1)) {
          const next = palisadeGame.executeMove(solved, {
            type: "edges",
            edits: [
              { x, y, flag: BORDER(1) },
              { x: x + 1, y, flag: BORDER(3) },
            ],
          });
          expect(palisadeGame.status(next)).toBe("ongoing");
          broke = true;
        }
      }
    }
    expect(broke).toBe(true);
  });
});

describe("palisade hint", () => {
  const P = { w: 5, h: 5, k: 5 };
  const hlOf = (step: HintStep<PalisadeMove>): PalisadeHint =>
    step.highlights as PalisadeHint;
  /** What a step's words mark: the edges it rings beyond its own, the region
   * it stripes, the squares it outlines. */
  const marksOf = (step: HintStep<PalisadeMove>) => {
    const m = stepMarks(step);
    return {
      siblings: m.of("ring", EDGE).length - 1,
      hatch: m.of("stripes", CELL).length,
      cells: m.of("outline", CELL).length,
    };
  };
  const physicalEdge = (
    h: { x: number; y: number; dir: number },
    w: number,
  ): number => {
    const i = h.y * w + h.x;
    const j = i + DY[h.dir] * w + DX[h.dir];
    const lo = Math.min(i, j);
    return lo * 2 + (Math.max(i, j) - lo === 1 ? 0 : 1);
  };

  /** Whether the plan from `state` opens a journey: a first leg with a
   * continuation after it. */
  const opensJourney = (state: PalisadeState): boolean => {
    const r = palisadeGame.hint?.(state);
    return r?.ok === true && r.steps[1]?.continuesPrevious === true;
  };

  /** The steps the tests below read, each pinned on a position whose hint
   * opens with one. */
  const pinned = describeHintPins({
    game: palisadeGame,
    params: [P, { w: 8, h: 6, k: 6 }],
    kinds: {
      journey: (_, state) => opensJourney(state),
      noWall: (step) => hlOf(step).kind === "nowall",
    },
    pins: {
      /** Held on 286 of 1307 positions walked. */
      journey: "5x5n5:g0g2b2b2b2",
      /** Held on 654 of 1307 positions walked. */
      noWall: "5x5n5:g0g2b2b2b2",
      /** Held on 15 of 1307 positions walked. */
      cluesVersusRegionSize: "5x5n5:a2a1a2b2e1e33",
      /** Held on 1129 of 1307 positions walked. */
      numberExhausted: "5x5n5:g0g2b2b2b2",
      /** Held on 1289 of 1307 positions walked. */
      notTooBig: {
        id: "5x5n5:a2c1e232c22d2",
        moves:
          '[{"type":"edges","edits":[{"x":0,"y":1,"flag":16},{"x":0,"y":0,"flag":64}]},{"type":"edges","edits":[{"x":0,"y":1,"flag":32},{"x":1,"y":1,"flag":128}]},{"type":"edges","edits":[{"x":0,"y":1,"flag":64},{"x":0,"y":2,"flag":16}]},{"type":"edges","edits":[{"x":1,"y":0,"flag":64},{"x":1,"y":1,"flag":16}]},{"type":"edges","edits":[{"x":1,"y":0,"flag":2},{"x":2,"y":0,"flag":8}]}]',
      },
      /** Held on 1292 of 1307 positions walked. */
      notTooSmall: {
        id: "5x5n5:23m2a33b1a3",
        moves:
          '[{"type":"edges","edits":[{"x":2,"y":3,"flag":2},{"x":3,"y":3,"flag":8}]},{"type":"edges","edits":[{"x":3,"y":3,"flag":4},{"x":3,"y":4,"flag":1}]},{"type":"edges","edits":[{"x":0,"y":0,"flag":32},{"x":1,"y":0,"flag":128}]},{"type":"edges","edits":[{"x":0,"y":0,"flag":64},{"x":0,"y":1,"flag":16}]},{"type":"edges","edits":[{"x":1,"y":0,"flag":2},{"x":2,"y":0,"flag":8}]},{"type":"edges","edits":[{"x":1,"y":0,"flag":4},{"x":1,"y":1,"flag":1}]},{"type":"edges","edits":[{"x":1,"y":4,"flag":16},{"x":1,"y":3,"flag":64}]},{"type":"edges","edits":[{"x":1,"y":4,"flag":32},{"x":2,"y":4,"flag":128}]},{"type":"edges","edits":[{"x":1,"y":4,"flag":128},{"x":0,"y":4,"flag":32}]},{"type":"edges","edits":[{"x":1,"y":1,"flag":8},{"x":0,"y":1,"flag":2}]}]',
      },
      /** Held on 1174 of 1307 positions walked. */
      noDanglingEdges: {
        id: "5x5n5:b31c2a3b3d1c2",
        moves:
          '[{"type":"edges","edits":[{"x":3,"y":0,"flag":32},{"x":4,"y":0,"flag":128}]},{"type":"edges","edits":[{"x":3,"y":0,"flag":64},{"x":3,"y":1,"flag":16}]},{"type":"edges","edits":[{"x":3,"y":0,"flag":128},{"x":2,"y":0,"flag":32}]},{"type":"edges","edits":[{"x":2,"y":0,"flag":4},{"x":2,"y":1,"flag":1}]},{"type":"edges","edits":[{"x":2,"y":0,"flag":8},{"x":1,"y":0,"flag":2}]}]',
      },
      equivalentEdges: {
        id: "5x5n5:c2d2d22a13b222",
        moves:
          '[{"type":"edges","edits":[{"x":0,"y":4,"flag":16},{"x":0,"y":3,"flag":64}]},{"type":"edges","edits":[{"x":0,"y":4,"flag":32},{"x":1,"y":4,"flag":128}]}]',
      },
    },
  });

  it("deduces a chain whose moves solve the board", () => {
    const s0 = newState(P, newDesc(P, randomNew("palisade-hint-chain")).desc);
    const r = palisadeGame.hint?.(s0);
    expect(r?.ok).toBe(true);
    if (!r?.ok) return;
    expect(r.steps.length).toBeGreaterThan(0);

    let s = s0;
    for (const step of r.steps) s = palisadeGame.executeMove(s, step.move);
    expect(palisadeGame.status(s)).toBe("solved");
  });

  it("records de-duplicated interior edges (rim-seeded)", () => {
    const s0 = newState(P, newDesc(P, randomNew("palisade-hint-rec")).desc);
    const forced = deduceForcedEdges(P, s0.clues, s0.borders);
    expect(forced.length).toBeGreaterThan(0);
    const ids = forced.map((e) => physicalEdge(e, P.w));
    // No physical edge appears twice (the dedup pass) and every edge is
    // interior (its neighbor is on the grid).
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of forced) {
      const nx = e.x + DX[e.dir];
      const ny = e.y + DY[e.dir];
      expect(nx >= 0 && nx < P.w && ny >= 0 && ny < P.h).toBe(true);
    }
  });

  it("captures referenced cells (and siblings) for highlighting", () => {
    const s0 = newState(P, newDesc(P, randomNew("palisade-hint-ctx")).desc);
    const forced = deduceForcedEdges(P, s0.clues, s0.borders);
    // Clue-pair / region deductions name cells (the hint derives sibling
    // edges from the firing group, not from the forced edge). The
    // fresh-board opener is a clue-vs-region wall, so at least one forced
    // edge carries a non-empty `cells` reference.
    expect(forced.some((e) => (e.cells?.length ?? 0) > 0)).toBe(true);
    const cvr = forced.find((e) => e.rule === "cluesVersusRegionSize");
    if (cvr) {
      // The two named cells are the two adjacent clues sharing the wall.
      expect(cvr.cells).toHaveLength(2);
      for (const i of cvr.cells ?? []) expect(s0.clues[i]).not.toBe(-1);
    }
  });

  it("groups a multi-edge deduction into one continuesPrevious journey", () => {
    const { steps } = pinned("journey");
    // A plan never opens on a continuation, and every continuation leg is
    // preceded by the unflagged start of its journey, which surfaces its
    // still-to-do edges as siblings (so leg 0 shows the whole set).
    expect(steps[0].continuesPrevious).toBeUndefined();
    const firstCont = steps.findIndex((s) => s.continuesPrevious);
    expect(firstCont).toBeGreaterThan(0);
    const start = steps[firstCont - 1];
    expect(start.continuesPrevious).toBeUndefined();
    expect(marksOf(start).siblings).toBeGreaterThan(0);
    // The continuation's narration is the short form, naming the edges it
    // rings and pointing back at the evidence the first leg named.
    expect(steps[firstCont].explanation).toMatch(
      /^…and (this edge|these edges) .*, for /,
    );
  });

  it("equivalentEdges opens a journey stating the shared-fate coupling", () => {
    // Its opener leg must spell out the shared-fate coupling.
    const { step: opener, steps, index } = pinned("equivalentEdges");
    expect(opener.continuesPrevious).toBeUndefined();
    expect(steps[index + 1]?.continuesPrevious).toBe(true);
    expect(opener.explanation).toMatch(/share a fate/);
    expect(marksOf(opener).siblings).toBeGreaterThan(0);
    expect(marksOf(opener).hatch).toBeGreaterThan(1);
    expect(marksOf(opener).cells).toBe(0);
  });

  it("does not re-hint an edge the player already marked no-wall", () => {
    const { state: s0, step: nowall } = pinned("noWall");
    const target = physicalEdge(hlOf(nowall), s0.w);

    const s1 = palisadeGame.executeMove(s0, nowall.move);
    const r2 = palisadeGame.hint?.(s1);
    expect(r2?.ok).toBe(true);
    if (!r2?.ok) return;
    expect(r2.steps.some((s) => physicalEdge(hlOf(s), s0.w) === target)).toBe(false);
  });

  it("counts a solved board as finished, so the midend refuses it", () => {
    const s0 = newState(P, newDesc(P, randomNew("palisade-hint-solved")).desc);
    const r = palisadeGame.solve?.(s0, s0);
    if (!r?.ok) throw new Error("the generated board did not solve");
    expect(palisadeGame.status(palisadeGame.executeMove(s0, r.move))).toBe("solved");
  });

  it("flags a wall the solution lacks, so the midend refuses it", () => {
    const s0 = newState(P, newDesc(P, randomNew("palisade-hint-bad")).desc);
    const sol = solveToBorders(P, s0.clues);
    if (!sol) throw new Error("the generated board did not solve");
    // Draw a wall on an interior edge the solution does not have.
    for (let y = 0; y < P.h; y++) {
      for (let x = 0; x + 1 < P.w; x++) {
        const i = y * P.w + x;
        if (!(sol[i] & BORDER(1))) {
          const bad = s0.borders.slice();
          bad[i] |= BORDER(1);
          bad[i + 1] |= BORDER(3);
          const wrong = { ...s0, borders: bad };
          expect(palisadeGame.findMistakes?.(wrong).length ?? 0).toBeGreaterThan(0);
          return;
        }
      }
    }
    throw new Error("the solution walled every interior edge");
  });

  it("hintKeepTrack completes on the hinted edit and rejects the wrong one", () => {
    const s0 = newState(P, newDesc(P, randomNew("palisade-hint-track")).desc);
    const r = palisadeGame.hint?.(s0);
    if (!r?.ok) throw new Error("no hint on a fresh board");
    const step = r.steps[0];
    const hl = hlOf(step);

    // The exact hinted edit completes the step.
    expect(palisadeGame.hintKeepTrack?.(step.move, step, s0)).toBe("completed");

    // The wrong button on the same edge (other bit) deviates.
    const wrongFlag = hl.kind === "wall" ? DISABLED(BORDER(hl.dir)) : BORDER(hl.dir);
    const wrong: PalisadeMove = {
      type: "edges",
      edits: [{ x: hl.x, y: hl.y, flag: wrongFlag }],
    };
    expect(palisadeGame.hintKeepTrack?.(wrong, step, s0)).toBe("off");

    // An edit on an unrelated edge deviates.
    const other: PalisadeMove = {
      type: "edges",
      edits: [{ x: hl.x === 0 ? P.w - 1 : 0, y: hl.y, flag: BORDER(FLIP(hl.dir)) }],
    };
    expect(palisadeGame.hintKeepTrack?.(other, step, s0)).toBe("off");
  });
});

describe("palisade misc", () => {
  it("exposes the four presets", () => {
    const menu = palisadeGame.presets();
    expect(menu.submenu?.map((m) => m.params)).toEqual(PRESETS);
  });

  it("BORDER_MASK is the low nibble", () => {
    expect(BORDER_MASK).toBe(15);
    expect(bitcount(BORDER(0) | BORDER(2) | DISABLED(BORDER(1)))).toBe(2);
  });
});

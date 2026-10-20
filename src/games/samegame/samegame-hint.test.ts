/**
 * Same Game's solver, Solve and hint (`add-samegame-hint`).
 *
 * Each sentence the hint can say is pinned by a position it fires on, through
 * `testing/hint-positions.ts`, so a change to the generator cannot quietly stop
 * a branch being exercised.
 */

import { describe, expect, it } from "vitest";
import { DESC_NO_SOLUTION } from "../../engine/desc-error.ts";
import type { HintStep } from "../../engine/game.ts";
import { isDeadEnd } from "../../engine/hint-refusal.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { Midend } from "../../engine/midend.ts";
import { randomNew, randomUpto } from "../../engine/random/index.ts";
import { NO_SOLUTION_FROM_HERE } from "../../engine/solve-failure.ts";
import {
  bindingDefects,
  deadEndBindingDefects,
} from "../../engine/testing/hint-binding.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { leafPresets } from "../../engine/testing/presets.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import type { Point } from "../../engine/types.ts";
import {
  hasNoSolution,
  hint,
  hintKeepTrack,
  SAMEGAME_RUNGS,
  type SamegameRung,
} from "./hint.ts";
import { executeMove, samegameGame } from "./index.ts";
import { COL_HINT, COL_HINT_EVIDENCE } from "./render.ts";
import {
  findClearing,
  type Group,
  groupsOf,
  lastOfColor,
  loneSquares,
  removed,
} from "./solver.ts";
import { isCleared, type SamegameMove, type SamegameState, status } from "./state.ts";

const G = samegameGame;

function load(id: string): SamegameState {
  const [params, desc] = id.split(":");
  return G.newState(G.decodeParams(params), desc);
}

type Step = HintStep<SamegameMove, unknown, SamegameRung>;

const indexOf = (s: SamegameState, p: Point) => p.y * s.w + p.x;
/** A group as the board indices of its squares, ascending. */
const asGroup = (s: SamegameState, ps: readonly Point[]): Group =>
  ps.map((p) => indexOf(s, p)).sort((a, b) => a - b);
const played = (s: SamegameState, g: Group): SamegameState =>
  executeMove(s, { type: "remove", tiles: [...g] });
const sameGroup = (a: Group, b: Group) =>
  a.length === b.length && a.every((v, i) => v === b[i]);
const moveGroup = (step: Step): Group => {
  if (step.move.type !== "remove") throw new Error("expected a removal");
  return step.move.tiles;
};
const rivalsOf = (s: SamegameState, step: Step): Group[] =>
  groupsOf(s.tiles, s.w, s.h).filter((g) => !sameGroup(g, moveGroup(step)));
/** Whether `s` can be cleared, settled by a search with room to spare. */
const verdict = (s: SamegameState) =>
  findClearing(s, { budget: 2_000_000, restart: 0, tries: 0 }).kind;

/**
 * Each rung pinned on a position that speaks it. The scan strays from the
 * hint on every other turn, because a hint keeps to removals that leave the
 * board clearable and several rungs are about a rival that would not.
 */
const pinned = describeHintPins({
  game: G,
  params: [G.decodeParams("5x5c3s2"), G.decodeParams("10x15c4s2")],
  seeds: 12,
  stray: (s, turn, hinted) => {
    if (turn % 2 === 0 && hinted) return hinted;
    const gs = groupsOf(s.tiles, s.w, s.h);
    return gs.length > 0
      ? { type: "remove" as const, tiles: [...gs[turn % gs.length]] }
      : null;
  },
  pins: {
    /** Held on 36 of 1213 positions walked. */
    last: {
      id: "5x5c3s2:2,1,3,3,1,3,3,2,3,1,3,1,2,1,2,2,1,3,3,2,1,2,2,1,1",
      moves:
        '[{"type":"remove","tiles":[5,6,10]},{"type":"remove","tiles":[17,18]},{"type":"remove","tiles":[10,15]},{"type":"remove","tiles":[7,8,13]},{"type":"remove","tiles":[12,17,21,22]},{"type":"remove","tiles":[13,18]}]',
    },
    /** Held on 7 of 1213 positions walked. */
    none: {
      id: "10x15c4s2:1,2,1,2,3,3,2,3,1,4,1,2,4,3,4,4,4,4,3,2,2,3,4,2,4,3,1,2,3,1,3,4,2,2,3,3,1,2,2,1,2,4,2,1,1,1,2,4,4,2,4,3,3,2,1,1,2,3,2,4,4,4,4,3,3,4,1,1,2,3,2,2,1,3,2,3,4,4,4,3,3,2,3,1,2,4,3,1,2,2,1,1,1,2,3,4,3,1,3,4,1,4,3,2,1,1,2,4,3,4,4,1,3,4,2,3,2,1,2,3,2,2,2,3,2,1,3,2,1,1,4,1,3,4,3,2,4,1,4,3,3,2,2,4,3,1,4,2,4,1",
      moves:
        '[{"type":"remove","tiles":[120,121,122]},{"type":"remove","tiles":[10,20]},{"type":"remove","tiles":[69,79]},{"type":"remove","tiles":[18,28]},{"type":"remove","tiles":[128,129]},{"type":"remove","tiles":[25,34,35]},{"type":"remove","tiles":[61,62,63,64,73]},{"type":"remove","tiles":[40,41]},{"type":"remove","tiles":[76,77]},{"type":"remove","tiles":[56,66]},{"type":"remove","tiles":[45,54,55,56,63,64,66,76,77,87,97]},{"type":"remove","tiles":[82,83]},{"type":"remove","tiles":[112,122,123,132]},{"type":"remove","tiles":[100,101,110]},{"type":"remove","tiles":[123,133,143]},{"type":"remove","tiles":[98,99]},{"type":"remove","tiles":[86,96,97]},{"type":"remove","tiles":[120,130]},{"type":"remove","tiles":[100,110,111,112]},{"type":"remove","tiles":[134,144]},{"type":"remove","tiles":[55,65]},{"type":"remove","tiles":[64,65,75]},{"type":"remove","tiles":[94,100,101,102,103,104,110,111,112,113,120,123,133,134,135,141,142,143,144]},{"type":"remove","tiles":[95,96,97,98,99,105,107,109,119]},{"type":"remove","tiles":[131,141,142]},{"type":"remove","tiles":[130,140]},{"type":"remove","tiles":[77,78]},{"type":"remove","tiles":[98,108]},{"type":"remove","tiles":[126,127]},{"type":"remove","tiles":[134,143,144]},{"type":"remove","tiles":[135,145]},{"type":"remove","tiles":[141,142,143,144,145]},{"type":"remove","tiles":[125,135,145,146]},{"type":"remove","tiles":[100,110]},{"type":"remove","tiles":[115,125]},{"type":"remove","tiles":[136,146]},{"type":"remove","tiles":[135,144,145]},{"type":"remove","tiles":[120,130,131,140,141]},{"type":"remove","tiles":[125,133,134,135,144]},{"type":"remove","tiles":[132,142,143]}]',
    },
    /** Held on 121 of 1213 positions walked. */
    lastOfColor: {
      id: "5x5c3s2:2,1,2,2,2,2,1,1,1,3,3,2,3,3,3,1,1,1,1,2,3,2,3,3,1",
      moves: [{ type: "remove", tiles: [15, 16, 17, 18] }],
    },
    /** Held on 0 of 1213 positions walked: a rival that strands every square at
     * once is rare where a square the last of its color is not, and that trap
     * leads. Found by trying small random boards. */
    stuck: "3x2c3s2:3,3,1,1,2,2",
    /** Held on 2 of 1213 positions walked. */
    only: {
      id: "10x15c4s2:3,2,3,4,2,3,2,3,4,2,4,2,1,1,4,1,2,3,4,1,4,3,3,4,4,4,3,1,1,4,3,4,1,1,1,4,3,1,2,4,4,2,3,2,2,1,4,2,2,1,4,1,4,4,1,1,2,4,1,4,3,3,2,1,3,2,2,4,2,3,1,1,3,3,3,3,3,1,2,3,2,4,4,1,4,3,2,4,3,1,2,1,3,3,2,1,2,3,3,4,1,4,2,4,2,1,3,4,2,4,3,4,4,3,3,4,3,2,1,3,3,2,3,1,2,1,2,1,2,3,2,3,2,4,2,4,2,1,4,2,1,3,1,1,4,1,4,2,1,2",
      moves:
        '[{"type":"remove","tiles":[88,97,98]},{"type":"remove","tiles":[6,16]},{"type":"remove","tiles":[40,50]},{"type":"remove","tiles":[17,26,27,36]},{"type":"remove","tiles":[12,13]},{"type":"remove","tiles":[32,33,34]},{"type":"remove","tiles":[23,24,25,33,34,35]},{"type":"remove","tiles":[50,60,61]},{"type":"remove","tiles":[80,90]},{"type":"remove","tiles":[64,72,73,74,75,76,85]},{"type":"remove","tiles":[61,71]},{"type":"remove","tiles":[70,80,81,82]},{"type":"remove","tiles":[127,137]},{"type":"remove","tiles":[88,98,108]},{"type":"remove","tiles":[29,39]},{"type":"remove","tiles":[94,104]},{"type":"remove","tiles":[66,74,76,77,84,85,86,96]},{"type":"remove","tiles":[106,116]},{"type":"remove","tiles":[139,149]},{"type":"remove","tiles":[115,116,117,127]},{"type":"remove","tiles":[108,109,118]},{"type":"remove","tiles":[131,141]},{"type":"remove","tiles":[126,136,137,147]},{"type":"remove","tiles":[42,52,62]},{"type":"remove","tiles":[99,109]},{"type":"remove","tiles":[80,81]},{"type":"remove","tiles":[110,120]},{"type":"remove","tiles":[107,117]},{"type":"remove","tiles":[103,104]},{"type":"remove","tiles":[124,134]},{"type":"remove","tiles":[142,143]},{"type":"remove","tiles":[147,148]},{"type":"remove","tiles":[110,111,120]},{"type":"remove","tiles":[88,98]},{"type":"remove","tiles":[137,146,147,148]},{"type":"remove","tiles":[126,136,146]},{"type":"remove","tiles":[145,146]},{"type":"remove","tiles":[106,116,126]},{"type":"remove","tiles":[85,95,105,115,116,124,125,126,135]},{"type":"remove","tiles":[111,112]},{"type":"remove","tiles":[143,144,145]},{"type":"remove","tiles":[141,142]},{"type":"remove","tiles":[121,131,132,141]},{"type":"remove","tiles":[136,144,145,146]}]',
    },
    /** Held on 49 of 1213 positions walked. */
    onlyThese: "5x5c3s2:1,1,3,1,2,2,2,3,1,2,3,1,2,3,1,3,2,1,1,3,1,3,3,2,1",
    /** Held on 4 of 1213 positions walked. */
    alsoThese: {
      id: "10x15c4s2:2,1,4,2,1,1,4,2,1,3,2,2,3,4,1,1,1,4,4,2,4,3,3,4,3,2,3,1,1,2,2,3,4,1,2,3,4,2,4,3,1,1,1,2,1,3,4,1,1,2,3,1,1,4,1,2,1,2,3,2,4,3,2,4,2,3,4,1,4,1,2,3,2,3,4,3,3,2,3,1,2,2,3,2,2,1,2,4,1,2,4,1,4,1,1,4,3,4,3,3,3,2,4,2,4,3,2,1,4,4,2,2,3,1,1,3,2,3,2,2,1,3,4,2,4,2,3,4,3,3,4,3,4,3,2,3,4,2,1,1,3,1,3,4,4,3,1,3,3,2",
      moves:
        '[{"type":"remove","tiles":[113,114]},{"type":"remove","tiles":[65,75,76]},{"type":"remove","tiles":[106,116]},{"type":"remove","tiles":[69,79]},{"type":"remove","tiles":[70,80,81]},{"type":"remove","tiles":[46,47,48]},{"type":"remove","tiles":[70,71,81,82,83]},{"type":"remove","tiles":[122,132]},{"type":"remove","tiles":[42,51,52,61]},{"type":"remove","tiles":[33,43]},{"type":"remove","tiles":[37,38]},{"type":"remove","tiles":[55,56,65]},{"type":"remove","tiles":[105,115,116,117,126]},{"type":"remove","tiles":[125,126]},{"type":"remove","tiles":[53,54,64]},{"type":"remove","tiles":[115,116,117]},{"type":"remove","tiles":[58,59]},{"type":"remove","tiles":[87,88]},{"type":"remove","tiles":[60,61]},{"type":"remove","tiles":[49,59,69,79,89]},{"type":"remove","tiles":[135,145]},{"type":"remove","tiles":[61,70,71,72,81,82,91]},{"type":"remove","tiles":[58,67,68,78]},{"type":"remove","tiles":[96,106,107,108,109,116,117,126,127,136]},{"type":"remove","tiles":[50,60]},{"type":"remove","tiles":[97,107,117,118,119,127,137]},{"type":"remove","tiles":[108,109,118,119,128,129]},{"type":"remove","tiles":[147,148]},{"type":"remove","tiles":[34,44]},{"type":"remove","tiles":[112,122]},{"type":"remove","tiles":[73,83,84]}]',
    },
    /** Held on 514 of 1213 positions walked. */
    anyGroup: "5x5c3s2:2,1,3,3,1,3,3,2,3,1,3,1,2,1,2,2,1,3,3,2,1,2,2,1,1",
    /** Held on 411 of 1213 positions walked. */
    joins:
      "10x15c4s2:4,4,1,4,2,3,4,1,2,2,4,3,2,2,1,1,4,1,1,2,1,3,2,3,4,3,3,4,1,1,1,2,1,3,4,1,3,1,3,4,3,2,1,4,2,3,2,2,3,3,2,4,4,2,1,2,4,4,1,3,2,3,1,2,1,2,4,2,1,4,4,3,1,4,4,1,1,2,2,4,2,1,3,2,1,2,2,4,1,2,2,1,3,2,3,2,4,3,4,3,1,3,4,1,1,1,4,2,4,3,1,3,1,2,4,3,3,1,1,2,2,2,3,3,2,2,1,4,3,3,3,4,1,1,3,1,2,4,2,3,4,3,3,4,4,1,2,3,2,1",
    /** Held on 69 of 1213 positions walked. */
    plain: {
      id: "10x15c4s2:1,4,2,3,3,4,1,4,4,2,3,4,2,3,3,1,3,4,1,2,3,1,3,2,1,1,4,1,1,3,2,3,4,2,1,2,3,4,4,3,2,3,4,4,2,2,3,4,2,4,1,2,2,4,2,3,4,2,2,1,2,3,4,1,3,3,2,4,1,3,2,3,1,1,4,4,1,4,3,3,3,4,1,2,3,4,1,2,4,4,4,3,2,3,3,1,2,3,2,1,2,3,1,4,2,1,2,3,4,2,1,4,3,4,2,4,4,2,3,3,1,2,1,2,1,3,4,2,1,2,3,4,2,1,2,4,2,3,4,4,1,4,2,3,2,1,2,1,2,3",
      moves:
        '[{"type":"remove","tiles":[110,120]},{"type":"remove","tiles":[76,86]},{"type":"remove","tiles":[103,113]},{"type":"remove","tiles":[112,113]},{"type":"remove","tiles":[118,119]},{"type":"remove","tiles":[119,129]},{"type":"remove","tiles":[99,109]},{"type":"remove","tiles":[55,56,64,65,66]},{"type":"remove","tiles":[134,144]},{"type":"remove","tiles":[104,114]}]',
    },
  },
});

/** Lost with a group still to remove and no square the last of its color:
 * only the search can say so. */
const LOST = "6x1c3s2:1,1,2,1,2,2";
/** A board on which the third color has one square. */
const LAST_RED = "3x2c3s2:2,2,3,1,2,3";

describe("samegame solver", () => {
  it("clears every preset's dealt board, and the line it finds plays out", () => {
    const presets = leafPresets(G);
    expect(presets.length).toBeGreaterThan(0);
    for (const { params } of presets) {
      let s = G.newState(params, G.newDesc(params, randomNew("solver")).desc);
      const found = findClearing(s);
      if (found.kind !== "found") throw new Error(G.encodeParams(params, true));
      for (const g of found.line) s = played(s, g);
      expect(isCleared(s)).toBe(true);
    }
  });

  it("removes a group as executeMove does, and says where each square went", () => {
    const s = load("3x3c3s2:1,2,3,1,2,3,2,3,3");
    const g = groupsOf(s.tiles, s.w, s.h).find((x) => s.tiles[x[0]] === 3);
    if (!g) throw new Error("expected a group of 3s");
    const moved = new Int32Array(9);
    expect([...removed(s.tiles, 3, 3, g, moved)]).toEqual(played(s, g).tiles);
    for (let i = 0; i < 9; i++) {
      if (g.includes(i)) expect(moved[i]).toBe(-1);
      else expect(played(s, g).tiles[moved[i]]).toBe(s.tiles[i]);
    }
  });

  it("agrees with brute force on every position random play reaches on small boards", () => {
    // An enumeration with no ordering, memo or pruning: the verdict the
    // search's restarts and its last-of-color cut must reproduce.
    const brute = (t: readonly number[], w: number, h: number): boolean => {
      if (t.every((c) => c === 0)) return true;
      return groupsOf(t, w, h).some((g) => brute([...removed(t, w, h, g)], w, h));
    };
    let lost = 0;
    let clear = 0;
    for (const id of ["4x4c3s2", "5x4c3s2", "4x5c4s2"]) {
      const params = G.decodeParams(id);
      for (let seed = 0; seed < 30; seed++) {
        const rng = randomNew(`brute${seed}`);
        let s = G.newState(params, G.newDesc(params, rng).desc);
        for (let k = 0; k < 8 && !isCleared(s); k++) {
          // Restarts too short to finish, so the verdict rests on what they
          // leave proved lost and on the last try.
          const tiny = findClearing(s, { budget: 100_000, restart: 3, tries: 5 }).kind;
          const truth = brute(s.tiles, s.w, s.h);
          expect(tiny, `${id} seed ${seed} after ${k}`).toBe(truth ? "found" : "lost");
          if (truth) clear++;
          else lost++;
          const gs = groupsOf(s.tiles, s.w, s.h);
          if (gs.length === 0) break;
          s = played(s, gs[randomUpto(rng, gs.length)]);
        }
      }
    }
    // Both verdicts were reached, and often.
    expect(clear).toBeGreaterThan(100);
    expect(lost).toBeGreaterThan(50);
  });

  it("proves the pinned lost position lost, with no square the last of its color", () => {
    const s = load(LOST);
    expect(lastOfColor(s.tiles, s.ncols)).toEqual([]);
    expect(groupsOf(s.tiles, s.w, s.h).length).toBeGreaterThan(0);
    expect(findClearing(s).kind).toBe("lost");
  });

  it("says a board is past its reach rather than lost when the budget runs out", () => {
    const s = load(LOST);
    expect(findClearing(s, { budget: 1, restart: 1, tries: 1 }).kind).toBe(
      "out-of-reach",
    );
  });
});

describe("samegame hint", () => {
  it("outlines a square that is the last of its color, as a dead end", () => {
    const s = load(LAST_RED);
    const r = hasNoSolution(s);
    if (typeof r === "boolean") throw new Error("expected a marked dead end");
    expect(r.error).toBe(
      "The outlined square is the last of its color, so the board can never be cleared. Undo until it has another square of its color.",
    );
    expect(isDeadEnd(r.error)).toBe(true);
    expect(stepMarks(r).of("outline", CELL)).toEqual([{ x: 0, y: 1 }]);
    expect(deadEndBindingDefects(G, s, G.newUi(s), r)).toEqual([]);
  });

  it("calls a stuck board a dead end, and proves nothing of a lost one", () => {
    expect(hasNoSolution(load("3x1c3s2:1,2,1"))).toBe(true);
    expect(hasNoSolution(load(LOST))).toBe(false);
  });

  it("does not open a board with a square the last of its color", () => {
    expect(new Midend(G).newGameFromId(LAST_RED)).toBe(DESC_NO_SOLUTION);
  });

  it("refuses a lost board as one no solution leaves", () => {
    expect(hint(load(LOST))).toEqual({ ok: false, error: NO_SOLUTION_FROM_HERE });
  });

  it("stripes a rival that leaves a square the last of its color, and outlines it", () => {
    const { state: s, steps } = pinned("lastOfColor");
    const marks = stepMarks(steps[0]);
    const rival = asGroup(s, marks.of("stripes", CELL));
    const [victim] = marks.of("outline", CELL);
    expect(rivalsOf(s, steps[0]).some((r) => sameGroup(r, rival))).toBe(true);
    // The victim, by its color, is the one left after the rival; after the
    // hinted removal no color is down to one.
    const c = s.tiles[indexOf(s, victim)];
    expect(s.tiles[rival[0]]).toBe(c);
    expect(s.tiles.filter((t) => t === c).length).toBe(rival.length + 1);
    expect(lastOfColor(played(s, moveGroup(steps[0])).tiles, s.ncols)).toEqual([]);
  });

  it("stripes a rival that leaves no group at all", () => {
    const { state: s, steps } = pinned("stuck");
    const rival = asGroup(s, stepMarks(steps[0]).of("stripes", CELL));
    const left = played(s, rival);
    expect(isCleared(left)).toBe(false);
    expect(groupsOf(left.tiles, s.w, s.h)).toEqual([]);
  });

  it("says a group is the only one to remove only where every rival is proved lost", () => {
    const { state: s, steps } = pinned("only");
    const rivals = rivalsOf(s, steps[0]);
    expect(rivals.length).toBeGreaterThan(0);
    for (const r of rivals) expect(verdict(played(s, r))).toBe("lost");
  });

  it("outlines exactly the other groups that leave a board that can be cleared", () => {
    const { state: s, steps } = pinned("onlyThese");
    const outlined = new Set(
      stepMarks(steps[0])
        .of("outline", CELL)
        .map((p) => indexOf(s, p)),
    );
    expect(outlined.size).toBeGreaterThan(0);
    for (const r of rivalsOf(s, steps[0])) {
      const shown = r.every((i) => outlined.has(i));
      expect(verdict(played(s, r)), `${r}`).toBe(shown ? "found" : "lost");
    }
  });

  it("claims nothing about an unoutlined rival the search could not settle", () => {
    const { state: s, steps } = pinned("alsoThese");
    const outlined = new Set(
      stepMarks(steps[0])
        .of("outline", CELL)
        .map((p) => indexOf(s, p)),
    );
    const rivals = rivalsOf(s, steps[0]);
    for (const r of rivals.filter((g) => g.every((i) => outlined.has(i))))
      expect(verdict(played(s, r))).toBe("found");
    const undrawn = rivals.filter((g) => !g.some((i) => outlined.has(i)));
    expect(undrawn.some((r) => verdict(played(s, r)) === "lost")).toBe(true);
  });

  it("says any group can go next only where each one can", () => {
    const { state: s, steps } = pinned("anyGroup");
    for (const r of rivalsOf(s, steps[0])) expect(verdict(played(s, r))).toBe("found");
  });

  it("outlines a square with no partner that the removal brings one to", () => {
    const { state: s, steps } = pinned("joins");
    const [lone] = stepMarks(steps[0]).of("outline", CELL);
    const i = indexOf(s, lone);
    expect(loneSquares(s.tiles, s.w, s.h)).toContain(i);
    const moved = new Int32Array(s.w * s.h);
    const next = removed(s.tiles, s.w, s.h, moveGroup(steps[0]), moved);
    expect(loneSquares(next, s.w, s.h)).not.toContain(moved[i]);
  });

  it("names the last removal as the one that clears the board", () => {
    const { state: s, steps } = pinned("last");
    expect(status(executeMove(s, steps[0].move))).toBe("solved");
  });

  it("binds every pinned step's words to what it draws", () => {
    for (const rung of SAMEGAME_RUNGS) {
      const { state: s, steps } = pinned(rung);
      for (const step of steps)
        expect(bindingDefects(G, s, G.newUi(s), step), rung).toEqual([]);
    }
  });

  it("keeps to the plan on its own removal, in any order, and drops it on another", () => {
    const { state: s, steps } = pinned("lastOfColor");
    const g = moveGroup(steps[0]);
    expect(
      hintKeepTrack({ type: "remove", tiles: [...g].reverse() }, steps[0], s),
    ).toBe("completed");
    const [other] = rivalsOf(s, steps[0]);
    expect(hintKeepTrack({ type: "remove", tiles: [...other] }, steps[0], s)).toBe(
      "off",
    );
  });

  it("walks the largest preset's board to cleared, asking again after every removal", () => {
    // The ledger in hint-resume.test.ts names this walk as the one that covers
    // the largest board on every commit.
    const params = G.decodeParams("15x20c4s2");
    let s = G.newState(params, G.newDesc(params, randomNew("walk")).desc);
    let asked = 0;
    while (!isCleared(s)) {
      const r = hint(s);
      if (!r.ok) throw new Error(`refused after ${asked}: ${r.error}`);
      s = executeMove(s, r.steps[0].move);
      asked++;
    }
    expect(asked).toBeGreaterThan(20);
  });

  it("draws a trap's ring, the victim's outline and the rival's stripes", () => {
    const pin = pinned("lastOfColor");
    const { recording } = renderPinnedHint(G, pin);
    const rects = (color: number) =>
      recording.ops.filter((o) => o.op === "rect" && o.color === color).length;
    expect(rects(COL_HINT)).toBeGreaterThan(0);
    expect(rects(COL_HINT_EVIDENCE)).toBeGreaterThan(0);
    const rival = stepMarks(pin.step).of("stripes", CELL);
    const hatches = recording.ops.filter((o) => o.op === "hatch");
    expect(hatches.length).toBe(rival.length);
  });
});

describe("samegame solve", () => {
  const solveOf = (orig: SamegameState, curr: SamegameState) => {
    const solve = G.solve;
    if (!solve) throw new Error("expected solve");
    return solve(orig, curr);
  };

  it("clears the board from the player's position, or from the dealt one", () => {
    const params = G.decodeParams("5x5c3s2");
    const dealt = G.newState(params, G.newDesc(params, randomNew("solve")).desc);
    const r = solveOf(dealt, load(LOST));
    expect(r).toEqual({ ok: true, move: { type: "solve" } });
    if (!r.ok) return;
    const done = executeMove(load(LOST), r.move);
    expect(status(done)).toBe("solved");
    expect(done.score).toBe(load(LOST).score);
  });

  it("says a board no order of removals clears has no solution", () => {
    expect(solveOf(load(LOST), load(LOST))).toEqual({
      ok: false,
      error: "This puzzle has no solution.",
    });
  });

  it("keeps a solved board through a save", () => {
    const params = G.decodeParams("5x5c3s2");
    const midend = new Midend(G);
    const id = `5x5c3s2:${G.newDesc(params, randomNew("saved")).desc}`;
    expect(midend.newGameFromId(id)).toBeNull();
    expect(midend.solve()).toBeNull();
    const back = new Midend(G);
    expect(back.loadGame(midend.saveGame())).toBeNull();
    // Five empty rows: the board the solve move left.
    expect(back.formatAsText()).toBe("     \n".repeat(5));
  });
});

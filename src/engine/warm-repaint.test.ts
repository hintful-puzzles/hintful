/**
 * The cross-game guard on every render cache: **a frame drawn on a warm draw
 * state looks like the same frame drawn on a fresh one.**
 *
 * `testing/repaint-differential.ts` says what is compared and why the
 * comparison is sound. What it catches is any way a tile can fail to repaint —
 * flags sharing a bit, a value overflowing its field, a painter input missing
 * from the key — which is why this replaced the per-module flag lists: a
 * module listing its own flags cannot see the flag it forgot, and none of the
 * collisions that census found was two named flags sharing a bit.
 *
 * Population: every registered game, from the registry.
 *
 * **A pass is only as strong as what the run showed the game**, so each game
 * also answers for its reach. An animation the midend armed must have been
 * painted part-way at least once, which is what failed while the run ticked
 * its clock in whole seconds. A game with a hint must have painted every mark
 * its renderer can paint: each `role|kind` the renderer asks the displayed
 * marks for (`StepMarks.of`), in a role the game's legend lists. A mark the run
 * never shows passes the comparison whatever its tile key gets wrong, which is
 * how Pegs' stripes and arrows went unchecked. Where the seeded deal does not
 * reach a mark, the game pins a board that does ({@link PINNED}). Mistake
 * frames are counted but not required: reaching a board with a mistake takes a
 * move that is specific to the game, which is why
 * `src/mistake-overlay-coverage.test.ts` is a ledger rather than a guard.
 */
import { describe, expect, it } from "vitest";
import "../games/index.ts";
import type { MarkRole } from "./hint-words.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import type { AnyGame } from "./testing/input-probe.ts";
import {
  type RepaintRun,
  repaintDifferential,
} from "./testing/repaint-differential.ts";

const IDS = registeredGameIds().sort();
const EVENTS = 60;
/** Input events on a pinned board, before the walk of its hint's plan. */
const PINNED_EVENTS = 20;

/**
 * Boards a game's run starts from as well as its deal, each because the
 * seeded run never paints a mark its renderer can paint. A board is the
 * input itself (`params:desc`), never a seed, since a seed reaches a mark only
 * through a generator that is free to stop dealing it. Each must paint a mark
 * the seeded run does not, so a pin the run has caught up with is named.
 */
const PINNED: Readonly<Record<string, readonly string[]>> = {
  crossing: [
    // A note ruled out in a square, which the 7x7 deal's plan never needs.
    "11x11:2a6a2a2b1a1a2b3a6a1a3b1a2b1a1a2a1a3b1a1a3a2a5a1b2c1a3b3b1b3b2a4a3a1,19,23,24,31,32,42,46,48,51,53,59,63,65,74,77,83,89,97,126,276,343,361,435,443,498,547,693,794,886,948,4777,5618,6843,8629,9745,37664,47511,944232,2183531",
  ],
  // The outlined cells a placement reasons from.
  filling: [
    "9x13:b6d9b4a86699255b6c4a5b6a98c6b9d778299a877b7a2b4e5a499b3d9b95a52a995b5d9c8d5a6a8c",
  ],
  // An outlined wall, which only the Unreasonable rungs reason from.
  galaxies: ["7x7du:mbgziedzjfzepcbd"],
  // A ringed note, which Tricky's eliminations strike.
  group: ["8dh:1_2_3_4_5_6_7_8_2g3f7_4e5a5a4e6a8e7e8a8e6_2"],
  // An outlined answer slot, read when a color is placed by elimination.
  guess: ["c8p5g12Bm:3bc2d346bb"],
  loopy: [
    // Outlined corners, then outlined pairs of edges (add-loopy-notation).
    "7x7t0dn:a322a2a2b1a2a1a2a13b332c30b21b22d3a2c3",
    "7x7t0dh:323b23a2b23a23a2a122c22a2c21332a23d2a21a",
  ],
  // A ringed note.
  mathrax: ["5dn:m1g1c,aS2cS1S3dS0d"],
  // A striped core two clues overlap on.
  rect: [
    "17x17:e6a14a4c2b3c5a2zb2a9b5f45v6a2m4g3c4c2c4_6j11e2h3_3d5a2f18h3m4_2h20m4b5i2q14d18b8a4c15a2k5_5i6g",
  ],
  // A striped row or column.
  rome: ["4x4dn:1a3aa5aba2,gUaLRUcX"],
  // The number just placed, outlined, and a ringed note.
  seismic: ["4x4dh:1b3a2babaa1,i1f"],
  // An outlined cell.
  signpost: ["4x4c:1eefgc10cafcfcebca16a"],
  solo: [
    // Outlined cells, then a ringed note.
    "2x3da:6f2b3c5b4_4b5c1b2f1",
    "2x3di:3c5b4a2d4b2_2b5d2a1b1c6",
  ],
  // A ringed cell and a ringed tally set.
  subsets: ["4x4n4de:_,_RL,10R,_,_,9D,_,_D,_URD,_,_DL,_,_,4R,_,5UL"],
  // A striped piece.
  tracks: [
    "15x15dh:zbAzzg5aCgAd5m5Cc9a9bCeAuAs9zsCc,5,3,3,3,3,4,11,12,8,4,10,S10,7,11,12,2,5,8,6,3,5,S9,9,13,15,13,9,6,1,2",
  ],
};

/**
 * Marks a renderer can paint that its game's hint never draws, with the
 * reason. A pair whose role the legend does not list needs no entry: no step
 * may name it (`testing/hint-binding.ts`).
 */
const UNREACHED: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  crossing: {
    "outline|cell":
      "the shared HintSidecar reads outlined cells, and Crossing's hint outlines only listed numbers",
  },
  rect: {
    // Measured 2026-10-02: the walk of 6,000 unique deals fired the other
    // rungs 37,785 times and this one never; 3 of 315 deals without
    // uniqueness fired it, and on those the hint then throws.
    "ring|line":
      "the last rung fires only on boards dealt without a unique solution, whose hint crashes until let-a-board-waive-the-deduction-promise",
  },
};

describe("a warm frame matches a fresh one", () => {
  it("is not vacuous — the registry offered every game", () => {
    expect(IDS.length).toBeGreaterThan(50);
  });

  it("pins and excuses only games it knows", () => {
    expect(Object.keys(PINNED).filter((id) => !IDS.includes(id))).toEqual([]);
    expect(Object.keys(UNREACHED).filter((id) => !IDS.includes(id))).toEqual([]);
  });

  it.each(IDS)("%s: repaints every tile it must", (id) => {
    const game = getTsGame(id) as AnyGame;
    const run = repaintDifferential(game, id, EVENTS);
    expect(run.mismatch, JSON.stringify(run.mismatch)).toBeNull();
    expect(run.frames).toBeGreaterThan(EVENTS);
    if (run.reached.armed > 0) {
      expect(
        run.reached.animated,
        "armed an animation, painted none of it",
      ).toBeGreaterThan(0);
    }

    const pinned: RepaintRun[] = (PINNED[id] ?? []).map((board) => {
      const r = repaintDifferential(game, id, PINNED_EVENTS, board);
      expect(r.mismatch, `${board}: ${JSON.stringify(r.mismatch)}`).toBeNull();
      const adds = [...r.reached.marks].filter((p) => !run.reached.marks.has(p));
      expect(adds, `${board} paints nothing the seeded run does not`).not.toEqual([]);
      return r;
    });

    const legend = game.hintMarks?.roles ?? {};
    if (typeof game.hint !== "function") {
      expect(Object.keys(legend)).toEqual([]);
      return;
    }
    const runs = [run, ...pinned];
    const painted = new Set(runs.flatMap((r) => [...r.reached.marks]));
    const asked = new Set(runs.flatMap((r) => [...r.reached.asked]));
    // Vacuity: a hinted game painted a hint frame and its renderer read marks.
    expect(run.reached.hinted, "has a hint, painted no hint frame").toBeGreaterThan(0);
    expect(asked.size, "the renderer never read the hint's marks").toBeGreaterThan(0);

    const roleOf = (pair: string) => pair.slice(0, pair.indexOf("|")) as MarkRole;
    // Every role the help's list of marks describes is one the renderer paints.
    const unread = (Object.keys(legend) as MarkRole[]).filter(
      (role) => ![...asked].some((p) => roleOf(p) === role),
    );
    expect(unread, "the legend lists roles the renderer never reads").toEqual([]);

    const excused = UNREACHED[id] ?? {};
    const missing = [...asked]
      .filter((p) => roleOf(p) in legend && !painted.has(p))
      .sort();
    expect(missing, "marks the renderer can paint that no run painted").toEqual(
      Object.keys(excused).sort(),
    );
  });
});

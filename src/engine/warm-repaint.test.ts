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
 * reach a mark, the game pins a board that does ({@link PINNED}). The
 * requirement reads hint marks only: a mark the rules draw (Bricks' gravity
 * diamond) is held by a board pinned in its game's own tests. A game that finds
 * mistakes must have painted a mistake overlay on a warm frame, and taken it
 * off again: on a cold frame every tile misses the cache, so the overlay paints
 * whether or not its key carries it. Where the seeded run never checks a wrong
 * board, the game pins one with the moves that make it wrong ({@link WRONG}).
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
import { FIRST_SHARE, ofThisShare } from "./testing/sweep-share.ts";

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
  // A striped square: the reach of the one run that can fill it.
  ascent: ["5x5mRdt:25_1a4b24_2_8_6_22d12a15a17c19a"],
  crossing: [
    // A note ruled out in a square, which the 7x7 deal's plan never needs.
    "11x11:2a6a2a2b1a1a2b3a6a1a3b1a2b1a1a2a1a3b1a1a3a2a5a1b2c1a3b3b1b3b2a4a3a1,19,23,24,31,32,42,46,48,51,53,59,63,65,74,77,83,89,97,126,276,343,361,435,443,498,547,693,794,886,948,4777,5618,6843,8629,9745,37664,47511,944232,2183531",
    // The outlined squares a number's one run clashes with elsewhere, which
    // the deal's plan takes later than its run reaches.
    "7x7du:a8a1b2a5a2c3a2a2b1a1a7,11,13,19,43,49,53,58,83,88,112,175,356,36961,56159,143643,2985635",
  ],
  // The outlined cells a placement reasons from.
  filling: [
    "9x13:b6d9b4a86699255b6c4a5b6a98c6b9d778299a877b7a2b4e5a499b3d9b95a52a995b5d9c8d5a6a8c",
  ],
  // An outlined wall, which only the Unreasonable rungs reason from.
  galaxies: ["7x7du:mbgziedzjfzepcbd"],
  // A struck note, which Tricky's eliminations make.
  group: ["8dh:1_2_3_4_5_6_7_8_2g3f7_4e5a5a4e6a8e7e8a8e6_2"],
  // An outlined answer slot, read when a color is placed by elimination.
  guess: ["c8p5g12Bm:3bc2d346bb"],
  loopy: [
    // Outlined corners, then outlined pairs of edges.
    "7x7t0dn:a322a2a2b1a2a1a2a13b332c30b21b22d3a2c3",
    "7x7t0dh:323b23a2b23a23a2a122c22a2c21332a23d2a21a",
  ],
  // A struck note.
  mathrax: ["5dn:m1g1c,aS2cS1S3dS0d"],
  // Outlined edges, the pair of lines a square is tried with.
  path: ["5x5dn:d1a2_3e4b4_2b1c3"],
  rect: [
    // A striped core two clues overlap on.
    "17x17:e6a14a4c2b3c5a2zb2a9b5f45v6a2m4g3c4c2c4_6j11e2h3_3d5a2f18h3m4_2h20m4b5i2q14d18b8a4c15a2k5_5i6g",
    // A ringed line.
    "10x10e0.5:a3c4b3g2_3f16_12n4i4c5b3g21m8h4a4e4c",
  ],
  // A striped row or column.
  rome: ["4x4dn:1a3aa5aba2,gUaLRUcX"],
  sokoban: [
    // Arrows on the ways a barrel can still finish.
    "10x12:w11fs2f2w5fs2ws3fw2s7w4s2usbs2w2tbsfs2bsw2tbswst2bw4s2ws2tw3tbsws2fw6f2s2w8s2w11",
    // An outlined target, the one to leave empty until the ringed one is filled.
    "10x12:w11tbtbs2btw3s4btw4fws2bstw3s3fs3w2tbs4tbw2s2tsfbstw2sb2susf2w2fsts5w2s2fs4fw3fs3w14",
  ],
  // The number just placed, outlined, and a struck note.
  seismic: ["4x4dh:1b3a2babaa1,i1f"],
  // An outlined cell.
  signpost: ["4x4c:1eefgc10cafcfcebca16a"],
  solo: [
    // Outlined cells, then a struck note.
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
 * A wrong board for each game whose seeded run never checks one: a board, and
 * the moves that make it wrong, which no desc can hold. A pin for a game whose
 * seeded run has caught up with it is named.
 */
const WRONG: Readonly<Record<string, { board: string; moves: readonly unknown[] }>> = {
  abcd: {
    board:
      "5x5n4de:3,1,1,0,0,1,2,2,2,2,1,0,2,1,2,0,2,0,1,2,2,1,0,2,2,1,2,0,1,2,1,1,1,1,2,1,3,0,2,0,",
    moves: [{ type: "enter", x: 1, y: 4, letter: 2 }],
  },
  bridges: {
    board: "7x7i30e10m2d0:2b4a4g25b4d1c3a4e4g2b2a1a",
    moves: [{ ops: [{ op: "M", x: 0, y: 0 }] }],
  },
  crossing: {
    board: "5x5de:1b6b1a2b1a1a4,27,33,49,51,55,462,774,5346,6154",
    moves: [{ kind: "pencil", x: 2, y: 4, digit: 8 }],
  },
  filling: {
    board:
      "9x13de:a9f6a5325a3o85377572888a7b7a8a4c7b7a7b5779a7d88b7b7b8a66a8a8c6a6e2443a44i",
    moves: [{ type: "set", cells: [115], value: 1 }],
  },
  group: {
    board: "6dn:1_2_3_4_5_6_2a5c3c2a4e5_4d6b5_3a",
    moves: [{ type: "set", cells: [{ x: 3, y: 3 }], n: 4 }],
  },
  guess: {
    board: "c6p4g10Bm:85914229",
    moves: [{ type: "mark", marks: [{ pos: 2, color: 4 }], ruledOut: true }],
  },
  mines: {
    board:
      "9x9n10:r10,u,45df7c5c7dbc0652701ae2bbd0e2972739a2ba45c19a369d25b62fa360597a266f5a0c1a67eff466d2719bf494e2c41cb633a95bc321699fd5c1439302",
    moves: [
      { type: "begin", x: 7, y: 4, mines: "f5ae2f9f6d94482111d80" },
      { type: "ops", ops: [{ op: "F", x: 3, y: 8 }] },
    ],
  },
  net: {
    board: "5x5de:9217c52e346bd123d7db1412c",
    moves: [
      { type: "rotate", op: "A", x: 2, y: 2 },
      { type: "lock", x: 2, y: 2 },
    ],
  },
  rome: {
    board: "6x6de:3c1c1aa2a2a1a3b4a5a1a2a1a3,aLbRbDLaLeDbUXUaUdDLRaLbL",
    moves: [{ kind: "place", x: 5, y: 1, dir: 16 }],
  },
  seismic: {
    board: "6x6de:1aaaa2a7a3a1c2c2bada1e1,b1b1q4e3a5d",
    moves: [{ type: "set", x: 5, y: 1, n: 4, pencil: true }],
  },
  signpost: {
    board: "4x4cde:1edgeeebfbbhf2abg16a",
    moves: [{ type: "link", fromX: 0, fromY: 2, toX: 1, toY: 1 }],
  },
  towers: {
    board: "5de:4/2/1/4/2/2/3/3/1/2/3/2/2/1/3/2/3/1/3/2",
    moves: [{ type: "set", x: 0, y: 2, n: 2, pencil: false, autoElim: false }],
  },
};

/**
 * Marks a renderer can paint that its game's hint never draws, with the
 * reason. A pair whose role the legend does not list needs no entry: no step
 * may name it (`testing/hint-binding.ts`).
 */
const UNREACHED: Readonly<Record<string, Readonly<Record<string, string>>>> = {};

describe("a warm frame matches a fresh one", () => {
  // Checks that walk nothing, so the first share holds them for every share.
  if (FIRST_SHARE) {
    it("is not vacuous — the registry offered every game", () => {
      expect(IDS.length).toBeGreaterThan(50);
    });

    it("pins and excuses only games it knows", () => {
      expect(Object.keys(PINNED).filter((id) => !IDS.includes(id))).toEqual([]);
      expect(Object.keys(UNREACHED).filter((id) => !IDS.includes(id))).toEqual([]);
      expect(
        Object.keys(WRONG).filter(
          (id) =>
            !IDS.includes(id) || typeof getTsGame(id)?.findMistakes !== "function",
        ),
      ).toEqual([]);
    });
  }

  it.each(ofThisShare(IDS))("%s: repaints every tile it must", (id) => {
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

    if (typeof game.findMistakes === "function") {
      const pin = WRONG[id];
      if (pin) {
        expect(
          run.reached.mistaken,
          "the seeded run checks a wrong board: drop its pin",
        ).toBe(0);
        const r = repaintDifferential(game, id, PINNED_EVENTS, pin.board, pin.moves);
        expect(r.mismatch, `${pin.board}: ${JSON.stringify(r.mismatch)}`).toBeNull();
        expect(
          r.reached.mistaken,
          `${pin.board}: the pinned moves are not wrong`,
        ).toBeGreaterThan(0);
      } else {
        expect(
          run.reached.mistaken,
          "finds mistakes, painted none on a warm frame: pin a wrong board",
        ).toBeGreaterThan(0);
      }
    }

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

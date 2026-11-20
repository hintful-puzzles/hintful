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
 * reach a mark, a bounded search over the boards every sweep deals finds one
 * that does ({@link searchBoards}). A board pinned by hand had to be found
 * again whenever a change to shared data, a word list or a dealer, moved
 * which board the seed dealt. The
 * requirement reads hint marks only: a mark the rules draw (Bricks' gravity
 * diamond) is held by a board pinned in its game's own tests. A game that finds
 * mistakes must have painted a mistake overlay on a warm frame, and taken it
 * off again: on a cold frame every tile misses the cache, so the overlay paints
 * whether or not its key carries it. Where the seeded run never checks a wrong
 * board, the game pins one with the moves that make it wrong ({@link WRONG}).
 */
import { describe, expect, it } from "vitest";
import { hasHint } from "../engine/contract/game.ts";
import type { MarkRole } from "../engine/contract/hint-words.ts";
import { dealt } from "../engine/testing/dealt.ts";
import {
  REGISTERED_GAME_COUNT,
  REGISTERED_GAMES,
  REGISTERED_IDS,
} from "../engine/testing/enrollment.ts";
import type { AnyGame } from "../engine/testing/input-probe.ts";
import { expectLedger } from "../engine/testing/ledger.ts";
import { dealtBoards } from "../engine/testing/presets.ts";
import {
  type RepaintRun,
  repaintDifferential,
} from "../engine/testing/repaint-differential.ts";
import { FIRST_SHARE, ofThisShare } from "../engine/testing/sweep-share.ts";

const EVENTS = 60;
/** Input events on a wrong board, before the walk of its hint's plan. */
const WRONG_EVENTS = 20;

/** Boards the search tries at most, for a game whose deal leaves a mark
 * unpainted. The furthest any game needed was the ninth (2026-11-20); a mark
 * past the bound fails the game, so the bound costs only a failing run. */
const SEARCH_BOUND = 24;

/**
 * The boards searched, in order, for a mark no earlier run painted: every mode
 * and tier on the smallest board offering it, then a second board of each,
 * and so on up to {@link SEARCH_BOUND}. They are the boards every cross-game
 * sweep deals, so the search deals nothing of its own until it asks for a
 * second round.
 */
function* searchBoards(game: AnyGame): Generator<string> {
  const presets = dealtBoards(game, { scalarEnds: false });
  for (let k = 0; k < SEARCH_BOUND; k++) {
    const { params } = presets[k % presets.length];
    const n = Math.floor(k / presets.length);
    yield `${game.encodeParams(params, true)}:${dealt(game, params, n).desc}`;
  }
}

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
  adjacent: {
    board:
      "5de:5,0,0D,0R,0DL,0,3,0UR,0DL,0UD,0R,0DL,0RD,0UL,0U,0D,0UR,0UL,0,0D,0UR,0RL,0L,0R,0UL,",
    moves: [{ type: "set", x: 1, y: 0, n: 2, pencil: false }],
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
  keen: {
    board: "6dn:a_24b_a7ca3baa,a12m15m72a3d2s1a7d3s1d3a5d2m12m20s1s1",
    moves: [{ type: "set", x: 0, y: 0, n: 2, pencil: false }],
  },
  mathrax: {
    board: "5de:f1e5i1b,aM4bS0eA7e",
    moves: [{ type: "set", x: 0, y: 0, n: 1, pencil: false }],
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
  undead: {
    board: "4x4dn:1,2,7,dLLbRRcLLa,2,3,4,3,4,3,2,3,3,2,1,1,1,0,0,4",
    moves: [{ type: "set", cell: 0, monster: 1 }],
  },
  // GLAND and POEM, with a line from the A of NAME to its M.
  wordtrail: {
    board: "4x3n2de:45,namedlgo3p",
    moves: [{ kind: "edges", changes: [{ edge: 1, mark: 1, from: 1 }] }],
  },
};

/**
 * Marks a renderer can paint that its game's hint never draws, with the
 * reason. A pair whose role the legend does not list needs no entry: no step
 * may name it (`testing/hint-binding.ts`).
 */
const UNREACHED: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  wordtrail: {
    "outline|edge":
      "Every technique reasons from a letter, so its hint outlines letters; " +
      "the engine's edge hint reads outlined edges for every game.",
  },
};

describe("a warm frame matches a fresh one", () => {
  // Checks that walk nothing, so the first share holds them for every share.
  if (FIRST_SHARE) {
    it("is not vacuous — the registry offered every game", () => {
      expect(REGISTERED_GAME_COUNT).toBeGreaterThan(50);
    });

    it("pins and excuses only games it knows", () => {
      expect(
        Object.keys(UNREACHED).filter((id) => !REGISTERED_IDS.includes(id)),
      ).toEqual([]);
      const findsMistakes = new Set(
        REGISTERED_GAMES.filter(([, g]) => typeof g.findMistakes === "function").map(
          ([id]) => id,
        ),
      );
      expect(Object.keys(WRONG).filter((id) => !findsMistakes.has(id))).toEqual([]);
    });
  }

  it.each(
    ofThisShare(REGISTERED_GAMES),
  )("%s: repaints every tile it must", (id, game) => {
    const run = repaintDifferential(game, id, EVENTS);
    expect(run.mismatch, JSON.stringify(run.mismatch)).toBeNull();
    expect(run.frames).toBeGreaterThan(EVENTS);
    if (run.reached.armed > 0) {
      expect(
        run.reached.animated,
        "armed an animation, painted none of it",
      ).toBeGreaterThan(0);
    }

    if (typeof game.findMistakes === "function") {
      const pin = WRONG[id];
      if (pin) {
        expect(
          run.reached.mistaken,
          "the seeded run checks a wrong board: remove its entry from WRONG " +
            "(src/guards/warm-repaint.test.ts)",
        ).toBe(0);
        const r = repaintDifferential(game, id, WRONG_EVENTS, pin.board, pin.moves);
        expect(r.mismatch, `${pin.board}: ${JSON.stringify(r.mismatch)}`).toBeNull();
        expect(
          r.reached.mistaken,
          `${pin.board}: the pinned moves are not wrong`,
        ).toBeGreaterThan(0);
      } else {
        expect(
          run.reached.mistaken,
          "finds mistakes, painted none on a warm frame. Pin a wrong board in " +
            `WRONG (src/guards/warm-repaint.test.ts): \`${id}: { board: ` +
            '"<params>:<desc>", moves: [<the moves that make it wrong>] },`, ' +
            "the board from `npm run game-id -- " +
            `${id} --seed <any>\``,
        ).toBeGreaterThan(0);
      }
    }

    const legend = game.hint.marks.roles;
    if (!hasHint(game)) {
      expect(Object.keys(legend)).toEqual([]);
      return;
    }
    const runs: RepaintRun[] = [run];
    const roleOf = (pair: string) => pair.slice(0, pair.indexOf("|")) as MarkRole;
    const excused = UNREACHED[id] ?? {};
    /** The marks the renderer asked for that no run has painted yet. */
    const unpainted = (): string[] => {
      const painted = new Set(runs.flatMap((r) => [...r.reached.marks]));
      const asked = new Set(runs.flatMap((r) => [...r.reached.asked]));
      return [...asked]
        .filter((p) => roleOf(p) in legend && !painted.has(p) && !(p in excused))
        .sort();
    };
    const covered: string[] = [];
    let tried = 0;
    for (const board of searchBoards(game)) {
      const before = unpainted();
      if (before.length === 0) break;
      tried++;
      // No input events: the hint's opening steps and the walk of its plan
      // are what paint its marks, and the seeded run's events already reached
      // the input paths.
      const r = repaintDifferential(game, id, 0, board);
      expect(r.mismatch, `${board}: ${JSON.stringify(r.mismatch)}`).toBeNull();
      runs.push(r);
      const now = before.filter((p) => r.reached.marks.has(p));
      if (now.length > 0) covered.push(`${now.join(", ")} on ${board} (#${tried})`);
    }
    // Which board painted what, so a game whose search runs long is seen.
    if (covered.length > 0)
      console.log(`${id}: the search painted ${covered.join("; ")}`);

    const painted = new Set(runs.flatMap((r) => [...r.reached.marks]));
    const asked = new Set(runs.flatMap((r) => [...r.reached.asked]));
    // Vacuity: a hinted game painted a hint frame and its renderer read marks.
    expect(run.reached.hinted, "has a hint, painted no hint frame").toBeGreaterThan(0);
    expect(asked.size, "the renderer never read the hint's marks").toBeGreaterThan(0);

    // Every role the help's list of marks describes is one the renderer paints.
    const unread = (Object.keys(legend) as MarkRole[]).filter(
      (role) => ![...asked].some((p) => roleOf(p) === role),
    );
    expect(unread, "the legend lists roles the renderer never reads").toEqual([]);

    const missing = [...asked]
      .filter((p) => roleOf(p) in legend && !painted.has(p))
      .sort();
    expectLedger(missing, excused, {
      table: `UNREACHED.${id}`,
      file: "src/guards/warm-repaint.test.ts",
      found: `marks the renderer can paint that no run painted, the seeded one and ${tried} searched boards`,
      add:
        "make a hint on a dealt board paint it, raise SEARCH_BOUND if the " +
        "search stopped there, or add the mark with why the hint never draws it",
    });
  });
});

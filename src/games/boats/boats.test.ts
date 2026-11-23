/**
 * Boats, born from its description: what only this game's statements
 * decide. The engine's own tests read fill games for the board, the input,
 * the deal and the hint (`engine/fill/*.test.ts`), and the cross-game guards
 * reach it as a registered game. What is left here is upstream's IDs and
 * params, the fleet the deal lays and the shapes it gives, the fleet beneath
 * the board, a wrong square outlined by Check & Save, and each rung's
 * pinned board.
 */

import { describe, expect, it } from "vitest";
import { COL_ERROR } from "../../engine/color/roles.ts";
import { DESC_OUT_OF_RANGE } from "../../engine/contract/desc-error.ts";
import { listOf, spaceOf } from "../../engine/fill/board.ts";
import { encodeDesc } from "../../engine/fill/game-id.ts";
import { wholePieces } from "../../engine/fill/tally-display.ts";
import { Midend } from "../../engine/midend/midend.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import * as boats from "../../generated/games/boats/boats.compiled.ts";
import { game } from "../../generated/games/boats/boats.game.ts";

const SHIP = 1;
const WATER = 2;

/** Boards upstream's generator and the hand-written port dealt. */
const UPSTREAM = [
  "7x9f4dh,4,3,2,1:5,3,1,3,3,1,4,3,3,2,2,0,2,2,4,2,jCzyW",
  "6x6f3deS,3,2,1:2,2,1,1,0,4,1,-,3,1,-,1,WaWWgTLqWaW",
  "10x10f4dtS,4,3,2,1:1,1,5,-,2,4,2,2,-,1,1,1,3,1,0,5,0,5,1,3,bWeWpTcRyCvW",
  "10x10f4dhS,4,3,2,1:2,4,3,0,2,1,0,3,2,3,1,3,1,5,0,-,3,-,-,0,nWtRcRzaBuR",
];

/** A board from its game ID. */
const loaded = (id: string) => {
  const [params, desc] = id.split(":");
  return game.newState(game.decodeParams(params), desc);
};

/** A board's clues of `kind`. */
const list = (b: ReturnType<typeof loaded>, kind: "n" | "seg") => listOf(b.dealt, kind);

/** What a pasted ID opens as: its params, or the refusal. */
const opened = (id: string) => {
  const me = new Midend(game);
  return me.newGameFromId(id) ?? me.getParams();
};

/** The board's answer. */
const answer = (b: ReturnType<typeof loaded>) => {
  const solved = game.solve(b, b);
  if (!solved.ok) throw new Error(solved.error);
  return game.executeMove(b, solved.move);
};

/** The hand-written port's moves on `id`, each a rectangle whose empty
 * squares it fills with a boat (`B`) or water (`W`), as the fill board's
 * edits, made in turn. */
const fills = (id: string, json: string) => {
  let b = loaded(id);
  const moves = JSON.parse(json) as {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    to: "B" | "W";
  }[];
  return moves.map(({ x0, y0, x1, y1, to }) => {
    const set: number[] = [];
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++)
        if (b.values[y * b.w + x] === 0)
          set.push(y * b.w + x, to === "B" ? SHIP : WATER);
    const edit = { set };
    b = game.executeMove(b, edit);
    return edit;
  });
};

describe("boats", () => {
  it("reads upstream's IDs and writes the desc back", () => {
    for (const id of UPSTREAM) {
      expect(opened(id), id).toBe(id.split(":")[0]);
      const b = loaded(id);
      expect(encodeDesc(boats.deal, spaceOf(boats, b), b.dealt), id).toBe(
        id.split(":")[1],
      );
    }
    // A hidden number is none, and a given square is its shape: the rows'
    // numbers come after the columns' in the ID, and its second row's is
    // hidden.
    const b = loaded(UPSTREAM[1]);
    expect(Array.from(list(b, "n").at).slice(0, 2)).toEqual([0, 2]);
    expect(Array.from(list(b, "n").v).slice(0, 2)).toEqual([1, 3]);
    expect(Array.from(list(b, "seg").at).slice(0, 2)).toEqual([0, 2]);
    expect(Array.from(list(b, "seg").v).slice(0, 2)).toEqual([2, 2]);
  });

  it("writes its params as upstream did, the fleet at the end", () => {
    for (const s of ["7x9f4dh,4,3,2,1", "6x6f3deS,3,2,1", "5x5f2dt,0,2"]) {
      const p = game.decodeParams(s);
      expect(game.encodeParams(p, true)).toBe(s);
    }
    // Without a fleet size, upstream's four; the tier and the flag are the
    // full ID's alone.
    expect(game.encodeParams(game.decodeParams("8x8"), true)).toBe("8x8f4de,4,3,2,1");
    expect(game.encodeParams(game.decodeParams("8x8f3dtS,1,1,1"), false)).toBe(
      "8x8f3,1,1,1",
    );
  });

  it("refuses a fleet the board cannot take, with upstream's words", () => {
    const refused = (s: string) => game.validateParams?.(game.decodeParams(s), true);
    expect(refused("4x4f5de")).toBe(
      "Fleet size must be smaller than the width and height.",
    );
    expect(refused("4x4f3de,0,0,0")).toBe("The fleet must contain at least 1 piece.");
    expect(refused("4x4f3de,9,9,9")).toBe("The fleet does not fit into the grid.");
    expect(refused("3x3f1dn,1")).toMatch(/Normal/);
    expect(refused("3x3f1de,1")).toBeNull();
  });

  it("refuses a desc that is not one", () => {
    expect(opened("3x3f1de,1:0,1,0,0,1,0,")).toBe("3x3f1de,1");
    expect(opened("3x3f1de,1:0,1,0,0,1,0,dS")).toBe("3x3f1de,1");
    expect(opened("3x3f1de,1:0,1,0,0,1,0,dX")).toMatch(/\.$/);
    expect(opened("3x3f1de,1:0,1,0,0,1,0,dSz")).toMatch(/\.$/);
    expect(opened("3x3f1de,1:0,1,0,0,1,4,")).toBe(DESC_OUT_OF_RANGE);
    expect(opened("3x3f1de,1:0,1,0,0,1,0")).toMatch(/\.$/);
  });

  it("deals each tier, its fleet whole and each given square its shape", () => {
    for (const id of ["6x6f3de", "6x6f3dnS", "8x8f4dt", "10x10f4dh", "7x9f4deS"]) {
      const p = game.decodeParams(id);
      const full = game.encodeParams(p, true);
      for (const seed of ["a", "b"]) {
        const { desc } = game.newDesc(p, randomNew(`boats-${id}-${seed}`));
        expect(opened(`${full}:${desc}`), `${id}:${desc}`).toBe(full);
        const board = loaded(`${full}:${desc}`);
        const done = answer(board);
        expect(game.status(done), `${id}:${desc}`).toBe("solved");
        const { w, h } = board;
        const counts = (board.dealt.fleet as unknown as { boats: number[] }).boats;
        expect(wholePieces(done.values, w, h, SHIP, counts.length)).toEqual(counts);
        // A given square is never one of unknown shape, and is the shape
        // the answer gives it.
        const ship = (x: number, y: number) =>
          x >= 0 && y >= 0 && x < w && y < h && done.values[y * w + x] === SHIP;
        const seg = list(board, "seg");
        seg.at.forEach((c, k) => {
          const [x, y] = [c % w, Math.floor(c / w)];
          const v = seg.v[k];
          const [up, right, down, left] = [
            ship(x, y - 1),
            ship(x + 1, y),
            ship(x, y + 1),
            ship(x - 1, y),
          ];
          const shape =
            done.values[c] === WATER
              ? 2
              : !(up || right || down || left)
                ? 9
                : (up && down) || (left && right)
                  ? 6
                  : down
                    ? 4
                    : up
                      ? 5
                      : right
                        ? 7
                        : 8;
          expect(v, `${id}:${desc} at ${c}`).toBe(shape);
        });
        // Remove numbers hides some; without it every number shows.
        const hidden = w + h - list(board, "n").at.length;
        if (p.hides === true) expect(hidden, `${id}:${desc}`).toBeGreaterThan(0);
        else expect(hidden, `${id}:${desc}`).toBe(0);
      }
    }
  });

  it("counts a boat found only once it is shut in by water", () => {
    const b = loaded("4x4f2de,1,1:1,0,0,2,0,0,1,2,");
    const n = (set: number[]) =>
      wholePieces(game.executeMove(b, { set }).values, 4, 4, SHIP, 2);
    // A boat of two along the bottom row's left, then shut in.
    expect(n([12, SHIP, 13, SHIP])).toEqual([0, 0]);
    expect(n([12, SHIP, 13, SHIP, 8, WATER, 9, WATER, 14, WATER])).toEqual([0, 1]);
    // A run longer than the fleet's longest is no boat it counts.
    expect(
      n([12, SHIP, 13, SHIP, 14, SHIP, 8, WATER, 9, WATER, 10, WATER, 15, WATER]),
    ).toEqual([0, 0]);
  });

  it("writes its text, the numbers past each line", () => {
    const b = answer(loaded(UPSTREAM[1]));
    const text = game.textFormat?.(b) ?? "";
    expect(text.split("\n")[1]).toBe("| ~ | # | ~ | ~ | ~ | ~ | 1 |");
  });

  it("outlines a square Check & Save finds wrong, which breaks no rule yet", () => {
    const id = UPSTREAM[1];
    const fresh = loaded(id);
    const values = answer(fresh).values;
    const count = (r: ReturnType<typeof renderScenario>) =>
      r.recording.ops.filter((o) => "color" in o && o.color === COL_ERROR).length;
    for (let c = 0; c < values.length; c++) {
      if (fresh.fixed[c]) continue;
      const moves = [{ set: [c, values[c] === SHIP ? WATER : SHIP] }];
      if (count(renderScenario({ game, id, moves })) > 0) continue;
      const shown = renderScenario({ game, id, moves, showMistakes: true });
      expect(shown.mistakeCount).toBe(1);
      expect(count(shown)).toBeGreaterThan(0);
      return;
    }
    throw new Error("no wrong square that breaks no rule");
  });
});

describeHintPins({
  game,
  params: [
    "6x6f3de",
    "6x6f3dnS",
    "8x8f4dn",
    "8x8f4dtS",
    "10x10f4dt",
    "10x10f4dtS",
    "10x10f4dhS",
  ].map((s) => game.decodeParams(s)),
  unreached: {
    near:
      "a segment's diagonal squares are its water as it is placed (touch, on " +
      "place), and every step that places one says so, so no square is left " +
      "for near: none in 1,115 positions walked on 60 boards, nor after any " +
      "one answer segment the player placed on two boards.",
  },
  pins: {
    given: UPSTREAM[1],
    /** Held on 1145 of 1344 positions walked. */
    lineShips: "6x6f3de,3,2,1:4,0,4,0,2,0,2,1,3,1,2,1,dWcWsWcWaW",
    /** Held on 332 of 1344 positions walked. */
    total: {
      id: "6x6f3dnS,3,2,1:-,2,1,-,3,-,-,-,-,4,-,-,gBbBlWkW",
      moves:
        '[{"set":[1,1,13,2,6,2,8,2]},{"set":[4,1,16,2,9,2,11,2]},{"set":[19,2,25,2,31,2]},{"set":[18,1,20,1,21,1,22,1,26,2,27,2,28,2,29,2]},{"set":[32,2]},{"set":[34,2]},{"set":[24,2]}]',
    },
    /** Held on 226 of 1344 positions walked. */
    center: {
      id: "8x8f4dn,4,3,2,1:2,2,3,4,2,1,5,1,1,5,0,6,0,2,1,5,jLnWzfC",
      moves: [{ set: [11, 1, 9, 2, 2, 2, 4, 2, 18, 2, 20, 2] }],
    },
    /** Held on 262 of 1344 positions walked. */
    extend: {
      id: "6x6f3dnS,3,2,1:-,0,-,-,-,-,-,-,2,-,2,-,SdSbLlWdWaWWcW",
      moves:
        '[{"set":[6,2]},{"set":[11,2,4,2]},{"set":[9,1,2,2,14,2,16,2]},{"set":[12,1,17,1,19,2,22,2]},{"set":[25,2,31,2]},{"set":[24,1,27,1,20,2,32,2,34,2]}]',
    },
    lineWater: "6x6f3deS,3,2,1:0,4,0,3,1,2,-,1,0,3,-,3,uW",
    /** Held on 301 of 1344 positions walked. */
    isolated: {
      id: "6x6f3dnS,3,2,1:-,-,-,4,-,-,-,-,-,-,-,-,bLcTeBjSfSbS",
      moves:
        '[{"set":[3,1,8,2,10,2]},{"set":[0,2]},{"set":[18,2]},{"set":[17,2,29,2,22,2]},{"set":[24,2,31,2]},{"set":[27,2,34,2,32,2]},{"set":[15,1,21,1,14,2,20,2]}]',
    },
    /** Held on 374 of 1344 positions walked. */
    grow: {
      id: "6x6f3dnS,3,2,1:-,-,-,-,-,3,-,2,-,-,-,-,kWcScTcSjL",
      moves:
        '[{"set":[9,2,21,2]},{"set":[25,1,13,2,18,2,30,2,32,2]},{"set":[17,2]},{"set":[35,1,33,2]},{"set":[6,1,7,1,0,2,1,2,2,2]},{"set":[5,1]}]',
    },
    /** Held on 376 of 1344 positions walked. */
    onlyFit: {
      id: "8x8f4dn,4,3,2,1:3,0,4,2,4,0,5,2,1,5,1,4,0,5,2,2,zaLz",
      moves:
        '[{"set":[28,1,26,2,19,2,21,2,35,2,37,2]},{"set":[32,2,33,2,38,2,39,2]},{"set":[1,2,9,2,17,2,25,2,41,2,49,2,57,2]},{"set":[5,2,13,2,29,2,45,2,53,2,61,2]}]',
    },
    /** Kept by hand: the scan's boards reach none. */
    centerRoom: {
      id: "8x8f4dnS,4,3,2,1:4,2,0,4,2,3,3,2,-,-,4,-,0,-,2,3,sTzhCeW",
      moves: fills(
        "8x8f4dnS,4,3,2,1:4,2,0,4,2,3,3,2,-,-,4,-,0,-,2,3,sTzhCeW",
        '[{"x0":3,"y0":3,"x1":3,"y1":3,"to":"B"},{"x0":3,"y0":1,"x1":3,"y1":1,"to":"W"},{"x0":4,"y0":1,"x1":4,"y1":1,"to":"W"},{"x0":4,"y0":3,"x1":4,"y1":3,"to":"W"},{"x0":2,"y0":3,"x1":2,"y1":3,"to":"W"},{"x0":2,"y0":1,"x1":2,"y1":1,"to":"W"},{"x0":4,"y0":2,"x1":4,"y1":2,"to":"W"},{"x0":4,"y0":4,"x1":4,"y1":4,"to":"W"},{"x0":2,"y0":2,"x1":2,"y1":4,"to":"W"},{"x0":7,"y0":5,"x1":7,"y1":5,"to":"W"},{"x0":7,"y0":7,"x1":7,"y1":7,"to":"W"},{"x0":5,"y0":7,"x1":5,"y1":7,"to":"W"},{"x0":5,"y0":5,"x1":5,"y1":5,"to":"W"},{"x0":0,"y0":4,"x1":7,"y1":4,"to":"W"},{"x0":2,"y0":0,"x1":2,"y1":7,"to":"W"}]',
      ),
    },
    /** Held on 341 of 1344 positions walked. */
    tooLong: {
      id: "6x6f3dnS,3,2,1:-,-,-,-,-,-,-,3,-,-,2,-,aSpBgTaW",
      moves:
        '[{"set":[2,2,7,2,0,2]},{"set":[12,1,24,2]},{"set":[32,1,20,2,27,2]},{"set":[9,1,10,1,11,1,3,2,4,2,5,2,14,2,15,2,16,2,17,2]},{"set":[29,1,22,2,34,2]}]',
    },
    /** Held on 74 of 1344 positions walked. */
    shortRun: {
      id: "6x6f3dnS,3,2,1:-,-,-,-,2,-,-,-,-,1,-,4,fTaTbSpWdW",
      moves:
        '[{"set":[12,1,0,2,7,2,19,2]},{"set":[14,1,2,2,9,2,21,2]},{"set":[5,2,17,2,10,2]},{"set":[22,1,34,1,27,2,29,2]},{"set":[18,2,20,2,23,2]}]',
    },
    /** Kept by hand: the scan's boards reach none. */
    "hidden.satisfied": {
      id: "10x10f4dtS,4,3,2,1:1,0,1,2,1,4,1,3,4,3,2,0,1,0,3,1,-,3,2,-,zzzgTdShR",
      moves: fills(
        "10x10f4dtS,4,3,2,1:1,0,1,2,1,4,1,3,4,3,2,0,1,0,3,1,-,3,2,-,zzzgTdShR",
        '[{"x0":5,"y0":9,"x1":5,"y1":9,"to":"B"},{"x0":5,"y0":7,"x1":5,"y1":7,"to":"W"},{"x0":0,"y0":8,"x1":0,"y1":8,"to":"W"},{"x0":1,"y0":9,"x1":1,"y1":9,"to":"W"},{"x0":8,"y0":9,"x1":8,"y1":9,"to":"B"},{"x0":6,"y0":7,"x1":6,"y1":7,"to":"W"},{"x0":6,"y0":9,"x1":6,"y1":9,"to":"W"},{"x0":4,"y0":9,"x1":4,"y1":9,"to":"W"},{"x0":4,"y0":7,"x1":4,"y1":7,"to":"W"},{"x0":1,"y0":8,"x1":1,"y1":8,"to":"W"},{"x0":4,"y0":8,"x1":6,"y1":8,"to":"W"},{"x0":9,"y0":8,"x1":9,"y1":8,"to":"W"},{"x0":7,"y0":8,"x1":7,"y1":8,"to":"W"},{"x0":8,"y0":8,"x1":8,"y1":8,"to":"W"},{"x0":0,"y0":1,"x1":9,"y1":1,"to":"W"},{"x0":0,"y0":3,"x1":9,"y1":3,"to":"W"},{"x0":0,"y0":0,"x1":0,"y1":7,"to":"W"},{"x0":1,"y0":0,"x1":1,"y1":7,"to":"W"},{"x0":2,"y0":7,"x1":2,"y1":7,"to":"W"},{"x0":8,"y0":6,"x1":8,"y1":6,"to":"W"},{"x0":4,"y0":6,"x1":5,"y1":6,"to":"B"},{"x0":5,"y0":5,"x1":5,"y1":5,"to":"W"},{"x0":3,"y0":7,"x1":3,"y1":7,"to":"W"},{"x0":3,"y0":5,"x1":3,"y1":5,"to":"W"},{"x0":4,"y0":5,"x1":6,"y1":5,"to":"W"},{"x0":7,"y0":7,"x1":9,"y1":7,"to":"B"},{"x0":6,"y0":6,"x1":6,"y1":6,"to":"W"},{"x0":7,"y0":6,"x1":9,"y1":6,"to":"W"},{"x0":4,"y0":0,"x1":4,"y1":4,"to":"W"},{"x0":2,"y0":6,"x1":3,"y1":6,"to":"B"},{"x0":2,"y0":5,"x1":2,"y1":5,"to":"W"},{"x0":2,"y0":0,"x1":2,"y1":9,"to":"W"},{"x0":3,"y0":8,"x1":3,"y1":8,"to":"B"},{"x0":3,"y0":0,"x1":3,"y1":9,"to":"W"}]',
      ),
    },
    /** Held on 17 of 1344 positions walked. */
    "hidden.forced":
      "10x10f4dhS,4,3,2,1:-,-,-,4,1,-,-,-,3,-,0,-,3,-,-,1,4,-,2,0,oSbWbBkCfSeLnWsR",
    /** Held on 352 of 1344 positions walked. */
    onlyRuns: {
      id: "10x10f4dt,4,3,2,1:2,2,3,0,3,4,0,3,2,1,1,2,1,5,1,2,1,4,2,1,lBkTfLzwW",
      moves:
        '[{"set":[2,1,11,2]},{"set":[34,1,14,2,25,2,43,2,45,2]},{"set":[32,1,30,2,41,2]},{"set":[0,2,4,2,5,2,6,2,7,2,8,2,9,2]},{"set":[26,2,27,2,28,2,29,2]},{"set":[52,2,62,2,72,2,82,2,92,2]},{"set":[53,2,63,2,73,2,83,2,93,2]},{"set":[16,2,36,2,46,2,56,2,66,2,76,2,86,2,96,2]}]',
    },
    /** Held on 380 of 1344 positions walked. */
    shared: {
      id: "10x10f4dt,4,3,2,1:2,1,4,1,3,1,0,3,3,2,1,2,3,2,4,2,1,1,2,2,dTznRdWzaBcW",
      moves:
        '[{"set":[14,1,3,2,5,2,23,2,25,2]},{"set":[44,1,46,2,33,2,35,2,53,2,55,2]},{"set":[68,1,88,2,57,2,59,2,77,2,79,2]},{"set":[0,2,1,2,2,2,6,2,7,2,8,2,9,2]},{"set":[60,2,61,2,62,2,63,2,64,2,65,2,66,2]},{"set":[70,2,71,2,72,2,73,2,74,2,75,2,76,2]},{"set":[24,2,84,2,94,2]},{"set":[85,2,95,2]},{"set":[16,2,26,2,86,2,96,2]}]',
    },
    /** Held on 191 of 1344 positions walked. */
    lastWater: {
      id: "10x10f4dhS,4,3,2,1:3,-,-,3,-,2,-,-,-,-,-,5,-,-,-,-,-,-,2,1,kLeRnSmRdRfTfWdWdWpS",
      moves:
        '[{"set":[12,1,10,2,1,2,3,2]},{"set":[16,1,18,2,5,2,7,2,25,2,27,2]},{"set":[33,2,31,2]},{"set":[45,1,34,2,36,2,54,2,56,2]},{"set":[50,1,52,2,61,2]},{"set":[68,1,48,2,59,2,77,2,79,2]},{"set":[82,2,93,2,91,2]},{"set":[90,2,94,2,95,2,96,2,97,2,98,2,99,2]},{"set":[30,1,80,1,71,2]},{"set":[64,2]}]',
    },
    /** Held on 34 of 1344 positions walked. */
    lastShip: {
      id: "10x10f4dhS,4,3,2,1:3,-,-,3,-,2,-,-,-,-,-,5,-,-,-,-,-,-,2,1,kLeRnSmRdRfTfWdWdWpS",
      moves:
        '[{"set":[12,1,10,2,1,2,3,2]},{"set":[16,1,18,2,5,2,7,2,25,2,27,2]},{"set":[33,2,31,2]},{"set":[45,1,34,2,36,2,54,2,56,2]},{"set":[50,1,52,2,61,2]},{"set":[68,1,48,2,59,2,77,2,79,2]},{"set":[82,2,93,2,91,2]},{"set":[90,2,94,2,95,2,96,2,97,2,98,2,99,2]},{"set":[30,1,80,1,71,2]},{"set":[64,2]},{"set":[63,1,72,2,74,2]}]',
    },
    /** A middle segment's trial: a 7x9 Hard board five steps in. */
    centerTrial: {
      id: UPSTREAM[0],
      moves: fills(
        UPSTREAM[0],
        '[{"x0":4,"y0":0,"x1":4,"y1":0,"to":"W"},{"x0":4,"y0":2,"x1":4,"y1":2,"to":"W"},{"x0":2,"y0":2,"x1":2,"y1":2,"to":"W"},{"x0":2,"y0":0,"x1":2,"y1":0,"to":"W"},{"x0":0,"y0":4,"x1":6,"y1":4,"to":"W"}]',
      ),
    },
  },
});

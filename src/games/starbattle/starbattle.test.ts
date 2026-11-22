/**
 * Star Battle, born from its description: what only this game's statements
 * decide. The engine's own tests read fill games for the board, the input,
 * the deal and the hint (`engine/fill/*.test.ts`), and the cross-game guards
 * reach it as a registered game. What is left here is a position for every
 * kind of step its hint takes, the stars in the params and the grid each
 * needs, the regions read from their walls and counted, a star drawn, and
 * the wordings no walk reaches.
 *
 * The 5x5 board below is one the hand-written generator dealt. Its regions,
 * and the one answer:
 *
 *     A A A A B      . . * . .
 *     C A D D B      . . . . *
 *     C C D D D  ->  . * . . .
 *     E E D D D      . . . * .
 *     E D D D D      * . . . .
 */

import { describe, expect, it } from "vitest";
import { COL_ERROR } from "../../engine/color/roles.ts";
import { CELL } from "../../engine/contract/hint-words.ts";
import type { Point } from "../../engine/contract/types.ts";
import { paramsError } from "../../engine/game-id/params.ts";
import { statedSentence } from "../../engine/hint/stated.ts";
import type { Partition } from "../../engine/solve/describe-runtime.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { STATED } from "../../generated/games/starbattle/starbattle.compiled.ts";
import { game } from "../../generated/games/starbattle/starbattle.game.ts";

const STAR = 1;
const ID = "5s1de:c2aacbca1bb2dc";

/** A position for every kind of step. */
describeHintPins({
  game,
  params: [
    { w: 6, h: 6, diff: 2, sizes: { stars: 1 } },
    { w: 8, h: 8, diff: 0, sizes: { stars: 2 } },
    { w: 9, h: 9, diff: 1, sizes: { stars: 2 } },
  ],
  pins: {
    around: {
      id: "8s2de:eeca1caab3c3e1ebeb3h3caj2ah1a",
      moves: [{ set: [44, STAR] }],
    },
    fullLine: {
      id: "6s1dt:1baa3aacabae1adc1aac1d1",
      moves: '[{"set":[24,2,25,2,26,2,27,2]},{"set":[30,1]},{"set":[31,2]}]',
    },
    fullRegion: {
      id: "6s1dt:2b2a1ae4a1aac1bccababd",
      moves:
        '[{"set":[12,2,18,2,24,2,30,2]},{"set":[1,2,7,2,13,2,19,2]},{"set":[5,2,8,2,9,2,11,2,21,2,23,2,29,2]},{"set":[15,2]},{"set":[26,2]},{"set":[27,2]},{"set":[32,2]},{"set":[22,2]},{"set":[20,1]},{"set":[14,2,25,2]},{"set":[2,2]}]',
    },
    exactLine: {
      id: "6s1dt:aab1bababbaaacbaj2e1a",
      moves:
        '[{"set":[30,2,31,2,32,2,35,2]},{"set":[24,2,28,2,29,2]},{"set":[0,2,6,2]},{"set":[4,2,9,2,10,2,15,2,16,2,21,2,22,2]}]',
    },
    exactRegion: {
      id: "6s1dt:1baa3aacabae1adc1aac1d1",
      moves: '[{"set":[24,2,25,2,26,2,27,2]}]',
    },
    "confined.lines": "6s1dt:1baa3aacabae1adc1aac1d1",
    "confined.regions": {
      id: "6s1dt:2b2a1ae4a1aac1bccababd",
      moves: '[{"set":[12,2,18,2,24,2,30,2]},{"set":[1,2,7,2,13,2,19,2]}]',
    },
    neededLine: {
      id: "8s2de:eeca1caab3c3e1ebeb3h3caj2ah1a",
      moves:
        '[{"set":[44,1]},{"set":[36,2,37,2,45,2,53,2,52,2,51,2,43,2,35,2]},{"set":[56,2,57,2,58,2,59,2,63,2]},{"set":[54,2,55,2]}]',
    },
    neededRegion: "8s2de:eeca1caab3c3e1ebeb3h3caj2ah1a",
    crowdedLine: {
      id: "6s1dt:bd1ca1caabbd1c1a2dba1ba",
      moves: '[{"set":[32,2,33,2,34,2,35,2]}]',
    },
    crowdedRegion: "6s1dt:dca2cab1ab1eba3a1e1caa",
    "banded.lines": {
      id: "9s2dn:f2bc1dabbcba1ac1ad1a1a1bcdc2c4d1c1c2a1fbaga1a1aab3a",
      moves: '[{"set":[64,2]},{"set":[68,2]},{"set":[70,2]}]',
    },
    "banded.regions": {
      id: "6s1dt:dca2cab1ab1eba3a1e1caa",
      moves: '[{"set":[4,2]},{"set":[27,2]},{"set":[34,2]}]',
    },
    starvedLine: {
      id: "6s1dt:2b2a1ae4a1aac1bccababd",
      moves:
        '[{"set":[12,2,18,2,24,2,30,2]},{"set":[1,2,7,2,13,2,19,2]},{"set":[5,2,8,2,9,2,11,2,21,2,23,2,29,2]},{"set":[15,2]},{"set":[26,2]},{"set":[27,2]},{"set":[32,2]}]',
    },
    starvedRegion: {
      id: "6s1dt:dca2cab1ab1eba3a1e1caa",
      moves:
        '[{"set":[4,2]},{"set":[27,2]},{"set":[34,2]},{"set":[12,2,14,2]},{"set":[2,2,3,2,8,2,9,2,32,2]},{"set":[21,2]},{"set":[19,2]},{"set":[25,2]},{"set":[35,2]}]',
    },
  },
});

/** A board from its game ID. */
const loaded = (id: string) => {
  const [params, desc] = id.split(":");
  return game.newState(game.decodeParams(params), desc);
};

describe("starbattle", () => {
  it("writes its stars and its square size as the hand-written game did", () => {
    const p = { w: 10, h: 10, diff: 1, sizes: { stars: 2 } };
    expect(game.encodeParams(p, true)).toBe("10s2dn");
    expect(game.decodeParams("10s2dn")).toEqual(p);
    expect(game.encodeParams(p, false)).toBe("10s2");
  });

  it("refuses a grid too small for its stars", () => {
    const refusal = (w: number, stars: number) =>
      paramsError(game, { w, h: w, diff: 0, sizes: { stars } }, true);
    expect(refusal(7, 2)).toBe("Two stars: the grid size must be at least 8.");
    expect(refusal(11, 3)).toBe("Three stars: the grid size must be at least 12.");
    expect(refusal(8, 2)).toBeNull();
    expect(refusal(4, 1)).toBeNull();
    expect(refusal(26, 1)).toBeNull();
    expect(refusal(27, 1)).not.toBeNull();
  });

  it("reads its regions from their walls, numbered as they are met", () => {
    const board = loaded(ID);
    const { of } = board.dealt.region as Partition;
    expect(Array.from(of.slice(0, 10))).toEqual([0, 0, 0, 0, 1, 2, 0, 3, 3, 1]);
    expect(board.dealt.stars).toBe(1);
  });

  it.each([
    ["too short", "c2aacbca1bb"],
    ["too long", "c2aacbca1bb2dc9"],
    ["a stray character", "c2aacbca1bb2d!"],
    ["a region to every square", "40"],
  ])("refuses a desc that is %s", (_why, desc) => {
    expect(() => loaded(`5s1de:${desc}`)).toThrow();
  });

  it("deals a board of the stars it is asked for", () => {
    const solved = (id: string) => {
      const board = loaded(id);
      const s = game.solve(board, board);
      if (!s.ok) throw new Error("no answer");
      return game.executeMove(board, s.move).values;
    };
    const stars = solved("8s2de:eeca1caab3c3e1ebeb3h3caj2ah1a");
    for (let y = 0; y < 8; y++)
      expect(stars.slice(y * 8, y * 8 + 8).filter((v) => v === STAR)).toHaveLength(2);
  });

  it("draws a star, and an error where two touch at a corner", () => {
    const ops = (moves: { set: number[] }[]) =>
      renderScenario({ game, id: ID, moves }).recording.ops;
    const stars = (moves: { set: number[] }[]) =>
      ops(moves).filter((o) => o.op === "polygon" && o.points.length === 10);
    const errors = (moves: { set: number[] }[]) =>
      ops(moves).filter((o) => o.op === "polygon" && o.fill === COL_ERROR);
    expect(stars([])).toHaveLength(0);
    expect(stars([{ set: [2, STAR] }])).toHaveLength(1);
    expect(errors([{ set: [2, STAR, 9, STAR] }])).toHaveLength(0);
    expect(errors([{ set: [2, STAR, 8, STAR] }]).length).toBeGreaterThan(0);
  });

  it("outlines a star Check & Save finds wrong, which breaks no rule yet", () => {
    // A star on square 7, which the answer leaves empty, touches no star.
    const moves = [{ set: [7, STAR] }];
    const shown = renderScenario({ game, id: ID, moves, showMistakes: true });
    expect(shown.mistakeCount).toBe(1);
    const count = (r: ReturnType<typeof renderScenario>) =>
      r.recording.ops.filter((o) => "color" in o && o.color === COL_ERROR).length;
    expect(count(renderScenario({ game, id: ID, moves }))).toBe(0);
    expect(count(shown)).toBeGreaterThan(0);
  });
});

// The walk's boards never meet a star that completes its unit and leaves it
// nowhere for more, a starved star that completes all three or none, and a
// needed square with no room left in its unit; their clauses are rendered
// directly, so a change to their words or slots shows.
describe("the wordings no walk reaches", () => {
  const at = (c: number): Point => ({ x: c % 4, y: (c / 4) | 0 });
  const words = (
    clauses: readonly { look: string; move: string }[],
    wording: number,
    terms: Record<string, number | boolean>,
  ): string =>
    statedSentence(clauses[wording], {
      kind: CELL,
      at,
      ring: [at(5)],
      marks: { outline: [at(6), at(7)] },
      terms: {
        n: 2,
        room: 1,
        row: true,
        mine: true,
        one: true,
        closesRow: true,
        closesCol: false,
        closesRegion: false,
        ...terms,
      },
      value: String,
    }).text;
  const starved = STATED.starvedLine.step;

  it("says a completing star that leaves its line nowhere for more", () => {
    expect(words(starved, 0, { exhausted: true })).toBe(
      "A star on this square would complete its row, leaving this row nowhere for 2 more stars, so it must be empty.",
    );
  });

  it("says a star that blocks without completing anything", () => {
    expect(words(starved, 1, {})).toBe(
      "A star on this square would block the rest of this row, which would still need 2 stars, so it must be empty.",
    );
    expect(words(starved, 2, {})).toBe(
      "A star on this square would block every open square of this row, leaving it no room for a star, so it must be empty.",
    );
    expect(words(starved, 3, { mine: false, room: 3 })).toBe(
      "A star on this square would block the outlined squares, leaving this row room for 3, not 2, so it must be empty.",
    );
  });

  it("names the kinds a star completes in pairs", () => {
    const say = (r: boolean, c: boolean, g: boolean): string =>
      words(starved, 0, {
        closesRow: r,
        closesCol: c,
        closesRegion: g,
        exhausted: false,
      });
    expect(say(true, true, false)).toContain("complete its row and column,");
    expect(say(true, false, true)).toContain("complete its row and region,");
    expect(say(false, true, true)).toContain("complete its column and region,");
    expect(say(false, false, true)).toContain("complete its region,");
  });

  it("says a needed square with no room left in the unit", () => {
    expect(words(STATED.neededLine.step, 0, { none: true, placed: false })).toBe(
      "This row needs 2 stars and without this square has room for none, so that square must hold a star.",
    );
  });
});

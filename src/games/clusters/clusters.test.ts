/**
 * Clusters, born from its description: what only this game's statements
 * decide. The engine's own tests read fill games for the board, the input,
 * the deal and the hint (`engine/fill/*.test.ts`), and the cross-game guards
 * reach it as a registered game. What is left here is a position for every
 * kind of step its hint takes, upstream's dots read as the right pieces, the
 * sizes each tier refuses, the dots drawn, and a wrong piece outlined.
 */

import { describe, expect, it } from "vitest";
import { COL_ERROR } from "../../engine/color/roles.ts";
import { CELL } from "../../engine/contract/hint-words.ts";
import type { Point } from "../../engine/contract/types.ts";
import { paramsError } from "../../engine/game-id/params.ts";
import { statedSentence } from "../../engine/hint/stated.ts";
import { PAIR_NAMES } from "../../engine/render/piece.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { STATED } from "../../generated/games/clusters/clusters.compiled.ts";
import { game } from "../../generated/games/clusters/clusters.game.ts";

const BLOCK = 1;
const DISC = 2;

/** A position for every kind of step. */
describeHintPins({
  game,
  params: [
    { w: 7, h: 7, diff: 0 },
    { w: 9, h: 9, diff: 1 },
  ],
  unreached: {
    "countShort.same":
      "countShort's group asks that its first tile have an empty neighbor the " +
      "other does not touch, which is the kind's own squares of that tile, so " +
      "the arm for none of them never holds.",
  },
  pins: {
    /** Held on 729 of 1112 positions walked. */
    "refute.selfSurrounded": "7x7de:AabAbcDaddAaAhAFaCe",
    /** Held on 1063 of 1112 positions walked. */
    "refute.selfReach": "7x7de:cbJacAaceeAchd",
    /** Held on 836 of 1112 positions walked. */
    "refute.nearSurrounded": "7x7de:AFafCFadDbAAHCc",
    /** Held on 973 of 1112 positions walked. */
    "refute.nearReach": {
      id: "9x9dt:jCCaAiFCAafbdFebbAGcAabAa",
      moves: [{ set: [0, 2] }],
    },
    /** Held on 1032 of 1112 positions walked. */
    "refute.dotOvercount": { id: "7x7de:cbJacAaceeAchd", moves: [{ set: [3, 2] }] },
    /** Held on 343 of 1112 positions walked. */
    "countFull.more": {
      id: "9x9dt:jCCaAiFCAafbdFebbAGcAabAa",
      moves:
        '[{"set":[0,2]},{"set":[1,2]},{"set":[8,1]},{"set":[7,1]},{"set":[6,1]},{"set":[10,1]},{"set":[2,2]},{"set":[11,1]},{"set":[3,2]},{"set":[4,2]},{"set":[13,2]},{"set":[14,2]},{"set":[5,2]},{"set":[18,1]},{"set":[19,1]},{"set":[21,2]},{"set":[24,2]},{"set":[25,2]},{"set":[27,1]},{"set":[67,1]},{"set":[71,1]},{"set":[70,1]},{"set":[78,2]},{"set":[68,1]},{"set":[52,1]},{"set":[42,1]}]',
    },
    /** Held on 240 of 1112 positions walked. */
    "countFull.same": {
      id: "9x9dt:jCCaAiFCAafbdFebbAGcAabAa",
      moves:
        '[{"set":[0,2]},{"set":[1,2]},{"set":[8,1]},{"set":[7,1]},{"set":[6,1]},{"set":[10,1]},{"set":[2,2]},{"set":[11,1]},{"set":[3,2]},{"set":[4,2]},{"set":[13,2]},{"set":[14,2]},{"set":[5,2]},{"set":[18,1]},{"set":[19,1]},{"set":[21,2]},{"set":[24,2]},{"set":[25,2]},{"set":[27,1]},{"set":[67,1]},{"set":[71,1]},{"set":[70,1]},{"set":[78,2]},{"set":[68,1]}]',
    },
    /** Held on 42 of 1112 positions walked. */
    "countShort.more": {
      id: "9x9dt:dAbAaJFaeACjDfcBCEei",
      moves:
        '[{"set":[16,1]},{"set":[17,2]},{"set":[15,1]},{"set":[5,2]},{"set":[13,1]},{"set":[14,2]},{"set":[23,2]},{"set":[26,2]},{"set":[33,2]},{"set":[32,2]},{"set":[35,2]},{"set":[42,2]},{"set":[43,1]},{"set":[52,1]},{"set":[53,1]},{"set":[61,2]},{"set":[60,2]},{"set":[63,2]},{"set":[45,1]},{"set":[36,1]},{"set":[27,1]},{"set":[9,2]},{"set":[0,2]},{"set":[1,2]},{"set":[2,2]},{"set":[10,2]},{"set":[12,1]},{"set":[19,2]},{"set":[46,1]},{"set":[55,1]},{"set":[70,2]},{"set":[71,2]},{"set":[73,1]},{"set":[64,1]},{"set":[74,1]},{"set":[80,2]},{"set":[79,2]},{"set":[68,2]},{"set":[69,2]},{"set":[77,2]},{"set":[78,2]},{"set":[76,2]},{"set":[75,2]},{"set":[65,1]},{"set":[66,2]},{"set":[56,1]},{"set":[47,1]},{"set":[39,2]},{"set":[21,1]},{"set":[22,1]},{"set":[29,1]},{"set":[40,2]},{"set":[41,2]},{"set":[49,2]},{"set":[58,1]},{"set":[50,2]},{"set":[51,2]}]',
    },
  },
});

describe("clusters", () => {
  it("reads upstream's dots as pieces fixed on the board", () => {
    // Upstream's dot runs: a block's letter is uppercase and a disc's
    // lowercase, its offset from `a` the run of empty squares before it.
    const board = game.newState(game.decodeParams("7x7"), "ccACCcdfAbbBCacIa");
    const pieces = Array.from(board.values, (v, c) => (board.fixed[c] ? v : 0));
    expect(pieces.slice(0, 10)).toEqual([0, 0, DISC, 0, 0, DISC, BLOCK, 0, 0, BLOCK]);
    expect(pieces.filter((v) => v !== 0)).toHaveLength(16);
  });

  it("refuses the boards that have no puzzle, and Normal's only when dealing", () => {
    const check = (w: number, h: number, diff: number, full: boolean) =>
      paramsError(game, { w, h, diff }, full);
    expect(check(1, 1, 0, true)).not.toBeNull();
    expect(check(2, 2, 0, true)).not.toBeNull();
    expect(check(1, 3, 0, true)).toBeNull();
    // Normal binds from twelve squares, two wide.
    expect(check(3, 3, 1, true)).not.toBeNull();
    expect(check(1, 20, 1, true)).not.toBeNull();
    expect(check(3, 4, 1, true)).toBeNull();
    // A game ID carries its board, which loads at any size.
    expect(check(3, 3, 1, false)).toBeNull();
  });

  it("reads a game ID from before the tiers as Easy", () => {
    expect(game.decodeParams("7x7").diff).toBe(0);
    expect(game.encodeParams(game.decodeParams("7x7dt"), true)).toBe("7x7dt");
  });

  it("draws a dot on each dealt piece, and none on a piece placed", () => {
    const id = "7x7de:ccACCcdfAbbBCacIa";
    // A dot is the smallest circle drawn; a disc is larger.
    const dots = (r: ReturnType<typeof renderScenario>) => {
      const radii = r.recording.ops.flatMap((o) => (o.op === "circle" ? [o.r] : []));
      return radii.filter((x) => x === Math.min(...radii)).length;
    };
    const fresh = dots(renderScenario({ game, id }));
    expect(fresh).toBe(16);
    expect(dots(renderScenario({ game, id, moves: [{ set: [0, BLOCK] }] }))).toBe(16);
  });

  // The count's wordings name each tile by piece and dot; the walk meets only
  // some of them (a `most` of none, and tiles of one kind, are rare).
  describe("a count's wordings", () => {
    const at = (c: number): Point => ({ x: c % 3, y: (c / 3) | 0 });
    const words = (wording: number, terms: Record<string, number | boolean>): string =>
      statedSentence(STATED["countShort.more"].step[wording], {
        kind: CELL,
        at,
        ring: [at(8)],
        marks: { outline: [at(0), at(4)] },
        terms: {
          one: 0,
          two: 4,
          oneValue: BLOCK,
          oneDot: 1,
          twoValue: BLOCK,
          twoDot: 1,
          v: BLOCK,
          w: DISC,
          least: 2,
          most: 1,
          none: false,
          alike: true,
          own: true,
          ...terms,
        },
        value: String,
        piece: (v) => (v === BLOCK ? 0 : 1),
      }).text;
    const [first, second] = PAIR_NAMES;

    it("tells two tiles of one kind apart as one and the other", () => {
      expect(words(0, {})).toBe(
        `One outlined dotted ${first} must touch two more ${first}s, and the other outlined dotted ${first} allows at most one ${first} beside it, so this square, beside only the first, must hold a ${first}.`,
      );
    });

    it("names each tile by its piece and dot, and the square the other's own", () => {
      expect(
        words(1, { twoValue: DISC, twoDot: 0, alike: false, own: false, least: 1 }),
      ).toBe(
        `The outlined dotted ${first} must touch one more ${first}, and the outlined ${second} allows at most one ${first} beside it, so this square, beside only the ${second}, must hold a ${second}.`,
      );
    });

    it("says a tile that allows none", () => {
      expect(
        words(1, { twoValue: DISC, twoDot: 0, alike: false, none: true, most: 0 }),
      ).toBe(
        `The outlined dotted ${first} must touch two more ${first}s, and the outlined ${second} allows no ${first}s beside it, so this square, beside only the dotted ${first}, must hold a ${first}.`,
      );
    });
  });

  it("outlines a piece Check & Save finds wrong, which breaks no rule yet", () => {
    const id = "7x7de:ccACCcdfAbbBCacIa";
    const fresh = game.newState(game.decodeParams("7x7de"), id.split(":")[1]);
    const solved = game.solve(fresh, fresh);
    if (!solved.ok) throw new Error("no answer");
    const answer = game.executeMove(fresh, solved.move).values;
    const count = (r: ReturnType<typeof renderScenario>) =>
      r.recording.ops.filter((o) => "color" in o && o.color === COL_ERROR).length;
    for (let c = 0; c < answer.length; c++) {
      if (fresh.fixed[c]) continue;
      const moves = [{ set: [c, answer[c] === BLOCK ? DISC : BLOCK] }];
      if (count(renderScenario({ game, id, moves })) > 0) continue;
      const shown = renderScenario({ game, id, moves, showMistakes: true });
      expect(shown.mistakeCount).toBe(1);
      expect(count(shown)).toBeGreaterThan(0);
      return;
    }
    throw new Error("no wrong piece that breaks no rule");
  });
});

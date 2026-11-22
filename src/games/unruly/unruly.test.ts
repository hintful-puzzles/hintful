/**
 * Unruly, born from its description: what only this game's statements decide.
 * The engine's own tests read its compiled module for the click cycle, the
 * dot runs, the modifier, the built and hidden deal, the pair's pieces and
 * the line-shaped live errors (`engine/fill/*.test.ts`), and the cross-game
 * guards reach it as a registered game. What is left here is a position for
 * every kind of step its hint takes, upstream's givens read as the right
 * pieces, the size its unique rule allows, and a wrong piece outlined.
 */

import { describe, expect, it } from "vitest";
import { COL_ERROR } from "../../engine/color/roles.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { game } from "../../generated/games/unruly/unruly.game.ts";

const BLOCK = 1;
const DISC = 2;

/** A position for every kind of step. */
describeHintPins({
  game,
  // No preset turns unique rows on at the top tier, and only a board dealt
  // with it fires that rung.
  params: [
    { w: 14, h: 14, diff: 2 },
    { w: 8, h: 8, diff: 2, variations: ["unique"] },
  ],
  pins: {
    /** Held on 2221 of 2243 positions walked. */
    threes: "14x14dn:BBADaFcaCdMFCCCdfcCEfebdDbBobBABAMABgajJBGBacjac",
    /** Held on 1810 of 2243 positions walked. */
    lastGap: {
      id: "8x8udn:aDcfCBbiBbgDACfCCd",
      moves:
        '[{"set":[17,2]},{"set":[43,2]},{"set":[46,2]},{"set":[25,1]},{"set":[52,2]},{"set":[53,1]},{"set":[21,1]},{"set":[37,2]},{"set":[61,2]},{"set":[38,1]},{"set":[62,1]}]',
    },
    /** Held on 1493 of 2243 positions walked. */
    quota: {
      id: "8x8udn:MBAaAIjabCaIBdcba",
      moves:
        '[{"set":[13,2]},{"set":[35,1]},{"set":[38,1]},{"set":[53,2]},{"set":[62,1]},{"set":[34,2]},{"set":[45,1]},{"set":[46,2]}]',
    },
    /** Held on 1550 of 2243 positions walked. */
    lastOne: {
      id: "8x8udn:AcabHbatBcaDicCb",
      moves:
        '[{"set":[2,1]},{"set":[1,2]},{"set":[5,1]},{"set":[18,1]},{"set":[41,1]},{"set":[44,1]},{"set":[9,1]},{"set":[10,2]},{"set":[51,1]},{"set":[31,2]},{"set":[55,2]},{"set":[7,1]}]',
    },
    /** Held on 402 of 2243 positions walked. */
    unique: {
      id: "8x8udn:MBAaAIjabCaIBdcba",
      moves:
        '[{"set":[13,2]},{"set":[35,1]},{"set":[38,1]},{"set":[53,2]},{"set":[62,1]},{"set":[34,2]},{"set":[45,1]},{"set":[46,2]},{"set":[32,1,33,1]},{"set":[25,2]},{"set":[5,1,21,1,29,1]},{"set":[6,2,22,2,30,2]}]',
    },
  },
});

describe("unruly", () => {
  it("reads upstream's givens as pieces fixed on the board", () => {
    // Upstream's dot runs: a block's letter is uppercase and a disc's
    // lowercase, its offset from `a` the run of empty squares before it, and
    // a last letter closes the board.
    const board = game.newState(game.decodeParams("6x6"), "aBdIAEbceaca");
    const pieces = Array.from(board.values, (v, c) => (board.fixed[c] ? v : 0));
    expect(pieces.slice(0, 8)).toEqual([DISC, 0, BLOCK, 0, 0, 0, DISC, 0]);
    expect(pieces.filter((v) => v !== 0)).toHaveLength(11);
  });

  it("bounds a board's size by the rows its unique rule leaves", () => {
    const with6 = (h: number) =>
      game.validateParams?.({ w: 6, h, diff: 0, variations: ["unique"] }, true) ?? null;
    // 14 different rows of six squares keep the rules (OEIS A177790).
    expect(with6(14)).toBeNull();
    expect(with6(16)).not.toBeNull();
    expect(game.validateParams?.({ w: 6, h: 16, diff: 0 }, true) ?? null).toBeNull();
  });

  it("outlines a piece Check & Save finds wrong, which breaks no rule yet", () => {
    const id = "6x6dt:aBdIAEbceaca";
    const fresh = game.newState(game.decodeParams("6x6dt"), id.split(":")[1]);
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

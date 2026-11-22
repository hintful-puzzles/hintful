/**
 * Tents, born from its description: what only this game's statements decide.
 * The engine's own tests read its compiled module for the board, the input,
 * the layers, the deal and the hint (`engine/fill/*.test.ts`), and the
 * cross-game guards reach it as a registered game. What is left here is a
 * position for every kind of step its hint takes, a wrong tent outlined, and
 * what a tent rules out.
 */

import { describe, expect, it } from "vitest";
import { COL_ERROR } from "../../engine/color/roles.ts";
import type { HintStep } from "../../engine/contract/game.ts";
import type { Edit } from "../../engine/fill/edit.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { game } from "../../generated/games/tents/tents.game.ts";

const TENT = 1;
const GRASS = 2;

type Step = HintStep<Edit, unknown, string>;

/** A position for every kind of step, and for a step that only draws a link
 * and one that rules out the squares between a line's tents. */
describeHintPins({
  game,
  params: [
    { w: 8, h: 8, diff: 0 },
    { w: 8, h: 8, diff: 1 },
    { w: 10, h: 10, diff: 0 },
    { w: 10, h: 10, diff: 1 },
    { w: 15, h: 15, diff: 1 },
  ],
  kinds: {
    linkAlone: (step: Step) =>
      step.move.set === undefined && step.move.mark !== undefined,
    betweenThem: (step: Step) =>
      step.rung === "lineCount.noSpareRoom" &&
      (step.move.set ?? []).some((v, i) => i % 2 === 1 && v === GRASS),
  },
  pins: {
    /** Held on 43 of 2554 positions walked. */
    linkAlone: {
      id: "8x8de:dj_cnbbcbfada,3,0,2,2,1,1,1,2,2,1,1,1,1,2,0,4",
      moves:
        '[{"set":[0,2,1,2,2,2,6,2,9,2,10,2,11,2,13,2,18,2,22,2,25,2,26,2,29,2,31,2,32,2,50,2,51,2,52,2,59,2,60,2]},{"set":[49,2,53,2,54,2]},{"set":[56,1,58,1,61,1,63,1]}]',
    },
    /** Held on 12 of 2554 positions walked. */
    betweenThem: {
      id: "8x8de:ha__aamcm_ahc,3,1,2,2,1,1,1,1,4,0,1,2,0,2,0,3",
      moves:
        '[{"set":[1,2,5,2,7,2,21,2,23,2,25,2,27,2,28,2,32,2,36,2,37,2,39,2,44,2,45,2,46,2,47,2,53,2,54,2,55,2,58,2,62,2,63,2]}]',
    },
    /** Held on 334 of 2554 positions walked. */
    tentLink: {
      id: "8x8de:dj_cnbbcbfada,3,0,2,2,1,1,1,2,2,1,1,1,1,2,0,4",
      moves:
        '[{"set":[0,2,1,2,2,2,6,2,9,2,10,2,11,2,13,2,18,2,22,2,25,2,26,2,29,2,31,2,32,2,50,2,51,2,52,2,59,2,60,2]},{"set":[49,2,53,2,54,2]},{"set":[56,1,58,1,61,1,63,1]}]',
    },
    /** Held on 60 of 2554 positions walked. */
    noTree: "8x8de:dj_cnbbcbfada,3,0,2,2,1,1,1,2,2,1,1,1,1,2,0,4",
    /** Held on 1254 of 2554 positions walked. */
    treesDone: {
      id: "8x8de:heh_cj__kdab_,3,1,1,1,1,1,1,3,1,1,2,1,1,3,0,3",
      moves:
        '[{"set":[1,2,2,2,3,2,4,2,5,2,7,2,10,2,11,2,12,2,17,2,18,2,19,2,21,2,26,2,30,2,34,2,35,2,37,2,43,2,44,2,46,2,51,2,56,2]},{"set":[42,1,45,1,47,1]}]',
    },
    /** Held on 2396 of 2554 positions walked. */
    nextToTent: {
      id: "8x8de:i_dadfffabj_c,1,2,2,1,1,2,1,2,2,1,2,1,0,3,0,3",
      moves:
        '[{"set":[0,2,3,2,4,2,5,2,6,2,12,2,13,2,19,2,20,2,24,2,26,2,27,2,31,2,32,2,33,2,34,2,38,2,39,2,41,2,47,2,50,2,54,2,55,2,57,2,62,2,63,2]},{"set":[7,1]}]',
    },
    /** Held on 2453 of 2554 positions walked. */
    treeSingle: {
      id: "8x8de:__bgbarap_bba,1,2,1,0,3,1,1,3,3,1,1,2,0,2,0,3",
      moves:
        '[{"set":[6,2,10,2,19,2,21,2,22,2,24,2,26,2,27,2,29,2,31,2,32,2,33,2,34,2,40,2,41,2,42,2,43,2,45,2,49,2,50,2,52,2,53,2]}]',
    },
    /** Held on 98 of 2554 positions walked. */
    treeLink: {
      id: "15x15dt:bafcaac_kea_hhfbccda__damdffekicd___ceikabbagd,5,2,3,4,2,4,2,3,2,4,3,2,4,2,3,5,2,3,4,1,6,1,3,4,1,4,2,3,2,4",
      moves:
        '[{"set":[6,2,7,2,13,2,14,2,28,2,31,2,33,2,40,2,47,2,49,2,50,2,52,2,56,2,61,2,65,2,67,2,68,2,79,2,83,2,84,2,93,2,99,2,100,2,102,2,106,2,107,2,109,2,113,2,114,2,118,2,119,2,120,2,125,2,127,2,128,2,132,2,134,2,139,2,140,2,141,2,142,2,144,2,146,2,150,2,156,2,160,2,164,2,172,2,176,2,178,2,179,2,186,2,188,2,193,2,194,2,196,2,198,2,199,2,200,2,209,2,214,2,215,2,216,2,218,2,223,2,224,2]},{"set":[78,1,80,1,82,1,85,1,87,1]},{"set":[64,2,94,2,92,2,62,2]},{"set":[66,2,96,2]},{"set":[98,2]},{"set":[71,2,101,2,69,2]},{"set":[72,2,103,2]},{"set":[59,2]}]',
    },
    /** Held on 549 of 2554 positions walked. */
    treeDiagonal: {
      id: "8x8dt:hdabbacediabj,3,0,3,0,1,2,1,2,3,1,1,2,2,1,1,1",
      moves:
        '[{"set":[1,2,2,2,3,2,4,2,6,2,11,2,24,2,36,2,43,2,44,2,47,2,55,2,57,2,59,2,60,2,62,2,63,2]}]',
    },
    /** Held on 2210 of 2554 positions walked. */
    "lineCount.countMet": {
      id: "8x8de:dj_cnbbcbfada,3,0,2,2,1,1,1,2,2,1,1,1,1,2,0,4",
      moves:
        '[{"set":[0,2,1,2,2,2,6,2,9,2,10,2,11,2,13,2,18,2,22,2,25,2,26,2,29,2,31,2,32,2,50,2,51,2,52,2,59,2,60,2]}]',
    },
    /** Held on 2314 of 2554 positions walked. */
    "lineCount.allOpen": {
      id: "8x8de:heh_cj__kdab_,3,1,1,1,1,1,1,3,1,1,2,1,1,3,0,3",
      moves:
        '[{"set":[1,2,2,2,3,2,4,2,5,2,7,2,10,2,11,2,12,2,17,2,18,2,19,2,21,2,26,2,30,2,34,2,35,2,37,2,43,2,44,2,46,2,51,2,56,2]}]',
    },
    /** Held on 1117 of 2554 positions walked. */
    "lineCount.noSpareRoom": {
      id: "8x8de:i_dadfffabj_c,1,2,2,1,1,2,1,2,2,1,2,1,0,3,0,3",
      moves:
        '[{"set":[0,2,3,2,4,2,5,2,6,2,12,2,13,2,19,2,20,2,24,2,26,2,27,2,31,2,32,2,33,2,34,2,38,2,39,2,41,2,47,2,50,2,54,2,55,2,57,2,62,2,63,2]}]',
    },
    /** Held on 824 of 2554 positions walked. */
    lineNeighbors: {
      id: "8x8dt:fcekheaa_jaa_,1,1,3,1,2,1,1,2,1,1,1,2,1,2,1,3",
      moves:
        '[{"set":[0,2,1,2,3,2,4,2,12,2,13,2,15,2,19,2,21,2,22,2,23,2,25,2,26,2,30,2,31,2,32,2,33,2,34,2,41,2,50,2,52,2,54,2,57,2]}]',
    },
  },
});

describe("a wrong tent", () => {
  it("is outlined once Check & save finds it, though it breaks no rule yet", () => {
    const id = "8x8de:bcd_geddcjfbb,1,2,0,4,0,3,0,2,3,1,2,1,1,1,2,1";
    const fresh = game.newState({ w: 8, h: 8, diff: 0 }, id.split(":")[1]);
    const solved = game.solve(fresh, fresh);
    if (!solved.ok) throw new Error("no answer");
    const answer = game.executeMove(fresh, solved.move).values;
    const errorOps = (moves: Edit[], showMistakes: boolean) =>
      renderScenario({ game, id, moves, showMistakes });
    const count = (r: ReturnType<typeof errorOps>) =>
      r.recording.ops.filter((o) => "color" in o && o.color === COL_ERROR).length;
    // The first square the answer leaves grass whose tent alone the live
    // rules let stand: no number, touch or pairing is broken by it.
    for (let c = 0; c < answer.length; c++) {
      if (answer[c] !== GRASS) continue;
      const moves = [{ set: [c, TENT] }];
      if (count(errorOps(moves, false)) > 0) continue;
      const shown = errorOps(moves, true);
      expect(shown.mistakeCount).toBe(1);
      expect(count(shown)).toBeGreaterThan(0);
      return;
    }
    throw new Error("no wrong tent that breaks no rule");
  });
});

describe("what a tent rules out", () => {
  // Upstream's 4x4: trees at (3,0), (0,2) and (0,3); columns 1, 1, 1, 0 and
  // rows 1, 1, 0, 1. Its tents are at (2,0), (0,1) and (1,3).
  const board = game.newState({ w: 4, h: 4, diff: 0 }, "cdcc,1,1,1,0,1,1,0,1");
  const bring = game.rulesOut?.bring;
  if (bring === undefined) throw new Error("tents declares no rulesOut");
  const cell = (x: number, y: number) => y * 4 + x;

  it("brings grass round the tent, and on the rest of a line it completes", () => {
    const placed = game.executeMove(board, { set: [cell(1, 3), TENT] });
    const brought = bring(board, placed);
    // Round the tent: (1,2), (2,2) and (2,3); the rest of row 3: (3,3); the
    // rest of column 1: (1,0) and (1,1). Row 2 and column 3, whose numbers
    // are 0, are no placement's: their grass is not brought.
    expect(brought).toEqual({
      set: [1, 5, 9, 10, 14, 15].flatMap((c) => [c, GRASS]),
    });
  });

  it("brings a line's grass only where the tent is the last it needs", () => {
    // Upstream's 8x8, whose numbers run to 4. Each tent of the answer is
    // placed alone on the fresh board, and what it brings is the rule as
    // the help words it: the open squares round it, and those of its row or
    // column where the number is 1.
    const w = 8;
    const fresh = game.newState(
      { w, h: w, diff: 0 },
      "bcd_geddcjfbb,1,2,0,4,0,3,0,2,3,1,2,1,1,1,2,1",
    );
    const solved = game.solve(fresh, fresh);
    if (!solved.ok) throw new Error("no answer");
    const answer = game.executeMove(fresh, solved.move).values;
    const numbers = "1,2,0,4,0,3,0,2,3,1,2,1,1,1,2,1".split(",").map(Number);
    let lineBrought = 0;
    for (let t = 0; t < w * w; t++) {
      if (answer[t] !== TENT) continue;
      const tx = t % w;
      const ty = Math.floor(t / w);
      const want = new Set<number>();
      for (let c = 0; c < w * w; c++) {
        if (fresh.values[c] !== 0 || c === t) continue;
        const x = c % w;
        const y = Math.floor(c / w);
        const round = Math.abs(x - tx) <= 1 && Math.abs(y - ty) <= 1;
        // Upstream's numbers: the columns, then the rows.
        if (
          round ||
          (y === ty && numbers[w + ty] === 1) ||
          (x === tx && numbers[tx] === 1)
        )
          want.add(c);
      }
      const placed = game.executeMove(fresh, { set: [t, TENT] });
      const set = bring(fresh, placed)?.set ?? [];
      expect(set.filter((_, i) => i % 2 === 1).every((v) => v === GRASS)).toBe(true);
      const got = set.filter((_, i) => i % 2 === 0);
      expect(got, `the tent at (${tx},${ty})`).toEqual([...want].sort((a, b) => a - b));
      if (numbers[w + ty] === 1 || numbers[tx] === 1) lineBrought++;
    }
    // Some tent completes a line and some does not, so both halves are read.
    expect(lineBrought).toBeGreaterThan(0);
    expect(lineBrought).toBeLessThan(numbers.slice(0, w).reduce((a, b) => a + b));
  });
});

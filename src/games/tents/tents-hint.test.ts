/**
 * Tents' explained hint: the claims its narration makes, and what only this
 * game can check.
 *
 * The cross-game guards cover narration form, plan purity, resuming from any
 * position and the overlay reaching the render cache; Tents joined them by
 * declaring `hint()`. What is left here:
 *
 *  - **Following the hint finishes every board it deals, and every step is
 *    true**: after each one the board has no mistake, links included.
 *  - **Every firing stands on the board the player can see.** Its premise
 *    snapshot is exactly the player's board with the links read off it
 *    (`seenBoard`), so no firing rests on a pairing the ladder tied and the
 *    board does not show.
 *  - **A link is drawn only for a step that rests on it**: the firing after a
 *    link step could not have fired before it.
 *  - **Every premise and every line case is reached** (docs/hints.md
 *    § "Census the reasons, not only the rungs").
 */

import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { bindingDefects } from "../../engine/testing/hint-binding.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { tentsHint, tentsKeepTrack } from "./hint.ts";
import { say } from "./hint-text.ts";
import { tentsGame } from "./index.ts";
import {
  firesOn,
  seenBoard,
  TENTS_RUNGS,
  type TentsRung,
  tentsSolve,
} from "./solver.ts";
import {
  BLANK,
  DIFF_EASY,
  DIFF_TRICKY,
  DX,
  DY,
  executeMove,
  FLIP,
  MAXDIR,
  NONTENT,
  newState,
  TENT,
  type TentsMove,
  type TentsParams,
  type TentsState,
  TREE,
} from "./state.ts";

type Step = HintStep<TentsMove, unknown, TentsRung>;

const SHAPES: TentsParams[] = [
  { w: 8, h: 8, diff: DIFF_EASY },
  { w: 8, h: 8, diff: DIFF_TRICKY },
  { w: 10, h: 10, diff: DIFF_EASY },
  { w: 10, h: 10, diff: DIFF_TRICKY },
  { w: 15, h: 15, diff: DIFF_TRICKY },
];
const SEEDS = ["th-a", "th-b", "th-c", "th-d", "th-e", "th-f"];
const CORPUS = SHAPES.flatMap((p) => SEEDS.map((seed) => ({ p, seed })));

const label = (p: TentsParams, seed: string) =>
  `${p.w}x${p.h} ${p.diff === DIFF_EASY ? "Easy" : "Tricky"} / ${seed}`;

function deal(p: TentsParams, seed: string): TentsState {
  return newState(p, tentsGame.newDesc(p, randomNew(label(p, seed))).desc);
}

/** A firing as the player meets it: its step, and the legs that continue it. */
interface Firing {
  rung: TentsRung;
  steps: Step[];
}

/** The plan from `state`, a firing being its first step and the legs that
 * continue it. */
function plan(state: TentsState): Firing[] {
  const res = tentsHint(state);
  expect(res.ok, "the hint ran dry").toBe(true);
  if (!res.ok) return [];
  const out: Firing[] = [];
  for (const step of res.steps) {
    if (step.continuesPrevious && out.length > 0) out[out.length - 1].steps.push(step);
    else out.push({ rung: step.rung as TentsRung, steps: [step] });
  }
  return out;
}

/** Follow whole plans from `start` to the end, re-asking when one runs out;
 * `each` sees every firing with the board it was planned on. */
function walk(
  start: TentsState,
  each: (f: Firing, state: TentsState) => void,
): TentsState {
  let state = start;
  for (let asks = 0; asks < 200 && tentsGame.status(state) !== "solved"; asks++) {
    for (const p of plan(state)) {
      each(p, state);
      for (const step of p.steps) state = executeMove(state, step.move);
    }
  }
  return state;
}

describe("following the hint finishes every board, one true step at a time", () => {
  for (const { p, seed } of CORPUS) {
    it(label(p, seed), () => {
      let steps = 0;
      const end = walk(deal(p, seed), ({ steps: legs }, before) => {
        let state = before;
        for (const step of legs) {
          steps++;
          expect(step.explanation.length, step.explanation).toBeLessThanOrEqual(120);
          state = executeMove(state, step.move);
          expect(tentsGame.findMistakes?.(state), step.explanation).toEqual([]);
        }
      });
      expect(tentsGame.status(end), "following the hint did not finish the board").toBe(
        "solved",
      );
      expect(steps).toBeGreaterThan(10);
    });
  }
});

/** The board a firing should have reasoned from: the player's, with the links
 * read off it. */
function seen(state: TentsState): { soln: Int8Array; links: Int8Array } {
  const b = seenBoard(state);
  if (b === null) throw new Error("the player's board contradicts itself");
  return b;
}

describe("every firing stands on the board the player can see", () => {
  it("the links a sentence leans on include ones the player never drew", () => {
    // The walk reads the links afresh before every firing (`settleLinks`), so
    // each firing is told of the board as `seenBoard` reads it; this holds the
    // reading to account for doing work, not echoing the drawn links.
    let firings = 0;
    let unseenLinks = 0;
    for (const { p, seed } of CORPUS) {
      walk(deal(p, seed), (_firing, state) => {
        const b = seen(state);
        firings++;
        for (let i = 0; i < b.links.length; i++)
          if (b.links[i] && !state.links[i]) unseenLinks++;
      });
    }
    expect(firings).toBeGreaterThan(500);
    expect(unseenLinks).toBeGreaterThan(100);
  });
});

describe("a link is drawn only for a step that rests on it", () => {
  // A tent placed for a tree is joined in the same move, as the gesture does;
  // what this holds to account is a step that draws only a link.
  it("the firing after a link could not have fired without it", () => {
    let checked = 0;
    for (const { p, seed } of CORPUS) {
      let pending: TentsState | null = null;
      walk(deal(p, seed), ({ rung }, state) => {
        const linkOnly = (k: string) => k === "tentLink" || k === "treeLink";
        if (pending && !linkOnly(rung)) {
          expect(firesOn(pending, rung), rung).toBe(false);
          checked++;
        }
        pending = linkOnly(rung) ? state : null;
      });
    }
    // A plan that stays where its work is asks for few links of their own:
    // five on this corpus (2026-10-22), against eighteen taking the first
    // firing each rung meets.
    expect(checked).toBeGreaterThan(3);
  });
});

type LineCase = "countMet" | "allOpen" | "noSpareRoom" | "betweenThem";

/** Which of a line count's cases a leg is, read off what it decides: grass or
 * tents, a later leg or the first, and whether its tents take every open
 * square of the line it stripes. `state` is the board the firing was planned
 * on. */
function lineCaseOf(step: Step, state: TentsState): LineCase | null {
  if (step.rung !== "lineCount" || step.move.type !== "cells") return null;
  const { cells } = step.move;
  if (cells[0].v === NONTENT)
    return step.continuesPrevious ? "betweenThem" : "countMet";
  const open = stepMarks(step)
    .of("stripes", CELL)
    .filter((p) => state.grid[p.y * state.w + p.x] === BLANK);
  return open.length === cells.length ? "allOpen" : "noSpareRoom";
}

/** A line count's case. Any leg of the opening firing may be it: the square
 * between two tents is a later leg, and is another premise's once the tents
 * beside it are placed. */
const lineCase =
  (which: LineCase) =>
  (_step: Step, state: TentsState): boolean =>
    plan(state)[0]?.steps.some((s) => lineCaseOf(s, state) === which) ?? false;

/** A step deciding at least `n` grass squares. */
const grass =
  (n: number) =>
  (step: Step): boolean =>
    step.move.type === "cells" &&
    step.move.cells.length >= n &&
    step.move.cells[0].v === NONTENT;

/** A position for every kind of premise and every line case, and for the
 * shapes of step the keep-track tests follow by hand. */
const pinned = describeHintPins({
  game: tentsGame,
  params: SHAPES,
  kinds: {
    countMet: lineCase("countMet"),
    allOpen: lineCase("allOpen"),
    noSpareRoom: lineCase("noSpareRoom"),
    betweenThem: lineCase("betweenThem"),
    grass: grass(1),
    grassOfSeveral: grass(2),
    link: (step: Step) => step.move.type === "link",
  },
  pins: {
    /** Held on 201 of 2589 positions walked. */
    countMet: {
      id: "8x8de:_adra_fecbhac,1,2,0,4,0,3,0,2,1,2,1,2,1,3,0,2",
      moves:
        '[{"type":"cells","cells":[{"x":4,"y":0,"v":3},{"x":5,"y":0,"v":3},{"x":1,"y":1,"v":3},{"x":3,"y":1,"v":3},{"x":4,"y":1,"v":3},{"x":5,"y":1,"v":3},{"x":6,"y":1,"v":3},{"x":0,"y":2,"v":3},{"x":1,"y":2,"v":3},{"x":3,"y":2,"v":3},{"x":6,"y":2,"v":3},{"x":7,"y":2,"v":3},{"x":0,"y":3,"v":3},{"x":7,"y":3,"v":3},{"x":0,"y":4,"v":3},{"x":1,"y":4,"v":3},{"x":7,"y":4,"v":3},{"x":0,"y":5,"v":3},{"x":3,"y":6,"v":3},{"x":5,"y":6,"v":3},{"x":7,"y":6,"v":3},{"x":0,"y":7,"v":3},{"x":6,"y":7,"v":3},{"x":7,"y":7,"v":3}]}]',
    },
    /** Held on 341 of 2589 positions walked. */
    allOpen: {
      id: "10x10de:dacb_hdafcdfanebag_ga,5,0,3,1,2,2,2,2,2,1,4,0,3,2,1,3,1,2,2,2",
      moves:
        '[{"type":"cells","cells":[{"x":1,"y":0,"v":3},{"x":2,"y":0,"v":3},{"x":8,"y":0,"v":3},{"x":9,"y":0,"v":3},{"x":7,"y":1,"v":3},{"x":9,"y":1,"v":3},{"x":1,"y":2,"v":3},{"x":5,"y":2,"v":3},{"x":6,"y":2,"v":3},{"x":2,"y":3,"v":3},{"x":4,"y":3,"v":3},{"x":5,"y":3,"v":3},{"x":9,"y":3,"v":3},{"x":4,"y":4,"v":3},{"x":8,"y":4,"v":3},{"x":9,"y":4,"v":3},{"x":0,"y":5,"v":3},{"x":7,"y":5,"v":3},{"x":8,"y":5,"v":3},{"x":9,"y":5,"v":3},{"x":1,"y":6,"v":3},{"x":2,"y":6,"v":3},{"x":4,"y":6,"v":3},{"x":7,"y":6,"v":3},{"x":8,"y":6,"v":3},{"x":2,"y":7,"v":3},{"x":3,"y":7,"v":3},{"x":4,"y":7,"v":3},{"x":3,"y":8,"v":3},{"x":4,"y":8,"v":3},{"x":5,"y":8,"v":3},{"x":7,"y":8,"v":3},{"x":2,"y":9,"v":3},{"x":3,"y":9,"v":3},{"x":4,"y":9,"v":3},{"x":5,"y":9,"v":3},{"x":6,"y":9,"v":3}]}]',
    },
    /** Held on 113 of 2589 positions walked. */
    noSpareRoom: {
      id: "8x8de:hdfb_eh_abmba,1,2,1,2,0,2,1,3,1,2,1,3,0,2,1,2",
      moves:
        '[{"type":"cells","cells":[{"x":1,"y":0,"v":3},{"x":2,"y":0,"v":3},{"x":3,"y":0,"v":3},{"x":4,"y":0,"v":3},{"x":6,"y":0,"v":3},{"x":7,"y":0,"v":3},{"x":2,"y":1,"v":3},{"x":3,"y":1,"v":3},{"x":1,"y":2,"v":3},{"x":2,"y":2,"v":3},{"x":2,"y":3,"v":3},{"x":3,"y":3,"v":3},{"x":1,"y":4,"v":3},{"x":3,"y":4,"v":3},{"x":4,"y":4,"v":3},{"x":1,"y":6,"v":3},{"x":4,"y":6,"v":3},{"x":7,"y":6,"v":3},{"x":0,"y":7,"v":3},{"x":1,"y":7,"v":3}]}]',
    },
    /** Held on 11 of 2589 positions walked. */
    betweenThem: {
      id: "15x15dt:aecadc_adcg_clcbfagehbdcgabbffaocbggacebecf_ga,4,3,2,3,3,3,3,4,3,2,4,1,3,2,5,6,1,5,1,2,4,1,6,0,3,4,4,2,4,2",
      moves:
        '[{"type":"cells","cells":[{"x":4,"y":0,"v":3},{"x":5,"y":0,"v":3},{"x":9,"y":0,"v":3},{"x":5,"y":1,"v":3},{"x":14,"y":1,"v":3},{"x":6,"y":2,"v":3},{"x":9,"y":2,"v":3},{"x":5,"y":3,"v":3},{"x":6,"y":3,"v":3},{"x":8,"y":3,"v":3},{"x":9,"y":3,"v":3},{"x":10,"y":3,"v":3},{"x":11,"y":3,"v":3},{"x":10,"y":4,"v":3},{"x":11,"y":4,"v":3},{"x":12,"y":4,"v":3},{"x":3,"y":5,"v":3},{"x":5,"y":5,"v":3},{"x":6,"y":5,"v":3},{"x":11,"y":5,"v":3},{"x":13,"y":5,"v":3},{"x":3,"y":6,"v":3},{"x":4,"y":6,"v":3},{"x":5,"y":6,"v":3},{"x":7,"y":6,"v":3},{"x":8,"y":7,"v":3},{"x":10,"y":7,"v":3},{"x":11,"y":7,"v":3},{"x":9,"y":8,"v":3},{"x":10,"y":8,"v":3},{"x":11,"y":8,"v":3},{"x":12,"y":8,"v":3},{"x":0,"y":9,"v":3},{"x":2,"y":9,"v":3},{"x":3,"y":9,"v":3},{"x":10,"y":9,"v":3},{"x":11,"y":9,"v":3},{"x":12,"y":9,"v":3},{"x":0,"y":10,"v":3},{"x":2,"y":10,"v":3},{"x":3,"y":10,"v":3},{"x":4,"y":10,"v":3},{"x":5,"y":10,"v":3},{"x":7,"y":10,"v":3},{"x":11,"y":10,"v":3},{"x":3,"y":11,"v":3},{"x":5,"y":11,"v":3},{"x":6,"y":11,"v":3},{"x":7,"y":11,"v":3},{"x":11,"y":11,"v":3},{"x":12,"y":11,"v":3},{"x":0,"y":12,"v":3},{"x":6,"y":12,"v":3},{"x":10,"y":12,"v":3},{"x":11,"y":12,"v":3},{"x":0,"y":13,"v":3},{"x":6,"y":13,"v":3},{"x":10,"y":13,"v":3},{"x":0,"y":14,"v":3},{"x":1,"y":14,"v":3},{"x":7,"y":14,"v":3},{"x":9,"y":14,"v":3},{"x":10,"y":14,"v":3},{"x":11,"y":14,"v":3}]},{"type":"cells","cells":[{"x":13,"y":6,"v":3}]},{"type":"cells","cells":[{"x":13,"y":9,"v":3}]},{"type":"cells","cells":[{"x":3,"y":13,"v":3}]}]',
    },
    /** Held on 1480 of 2589 positions walked. */
    grass: "8x8de:bcbeahc_g_iak,0,3,1,2,1,2,0,3,4,0,1,3,0,2,0,2",
    /** Held on 467 of 2589 positions walked. */
    grassOfSeveral: "8x8de:bcbeahc_g_iak,0,3,1,2,1,2,0,3,4,0,1,3,0,2,0,2",
    /** Held on 655 of 2589 positions walked. */
    link: {
      id: "8x8de:bcbeahc_g_iak,0,3,1,2,1,2,0,3,4,0,1,3,0,2,0,2",
      moves:
        '[{"type":"cells","cells":[{"x":0,"y":0,"v":3},{"x":4,"y":0,"v":3},{"x":3,"y":1,"v":3},{"x":4,"y":1,"v":3},{"x":5,"y":1,"v":3},{"x":3,"y":2,"v":3},{"x":4,"y":2,"v":3},{"x":5,"y":2,"v":3},{"x":0,"y":3,"v":3},{"x":4,"y":3,"v":3},{"x":1,"y":4,"v":3},{"x":3,"y":4,"v":3},{"x":4,"y":4,"v":3},{"x":5,"y":4,"v":3},{"x":3,"y":5,"v":3},{"x":5,"y":5,"v":3},{"x":6,"y":5,"v":3},{"x":6,"y":6,"v":3},{"x":7,"y":6,"v":3},{"x":0,"y":7,"v":3},{"x":1,"y":7,"v":3},{"x":3,"y":7,"v":3},{"x":5,"y":7,"v":3},{"x":6,"y":7,"v":3},{"x":7,"y":7,"v":3}]}]',
    },
    /** Held on 284 of 2589 positions walked. */
    tentLink: {
      id: "8x8de:hcabfehj_adbb,3,1,1,1,1,1,1,3,1,1,2,1,1,3,0,3",
      moves:
        '[{"type":"cells","cells":[{"x":1,"y":0,"v":3},{"x":2,"y":0,"v":3},{"x":3,"y":0,"v":3},{"x":5,"y":0,"v":3},{"x":7,"y":0,"v":3},{"x":2,"y":1,"v":3},{"x":3,"y":2,"v":3},{"x":5,"y":2,"v":3},{"x":7,"y":2,"v":3},{"x":2,"y":3,"v":3},{"x":3,"y":3,"v":3},{"x":4,"y":3,"v":3},{"x":1,"y":4,"v":3},{"x":2,"y":4,"v":3},{"x":3,"y":4,"v":3},{"x":4,"y":4,"v":3},{"x":5,"y":4,"v":3},{"x":0,"y":5,"v":3},{"x":1,"y":5,"v":3},{"x":4,"y":5,"v":3},{"x":6,"y":5,"v":3},{"x":0,"y":6,"v":3},{"x":7,"y":6,"v":3},{"x":0,"y":7,"v":3},{"x":7,"y":7,"v":3}]},{"type":"cells","cells":[{"x":0,"y":0,"v":2},{"x":0,"y":2,"v":2},{"x":0,"y":4,"v":2}]},{"type":"cells","cells":[{"x":1,"y":1,"v":3}]},{"type":"cells","cells":[{"x":1,"y":3,"v":3}]}]',
    },
    /** Held on 60 of 2589 positions walked. */
    noTree: "8x8de:bcbeahc_g_iak,0,3,1,2,1,2,0,3,4,0,1,3,0,2,0,2",
    /** Held on 1172 of 2589 positions walked. */
    treesDone: {
      id: "8x8de:cbfaafihbbdec,3,0,2,1,0,3,0,3,2,0,3,1,1,1,3,1",
      moves:
        '[{"type":"cells","cells":[{"x":0,"y":0,"v":3},{"x":1,"y":0,"v":3},{"x":0,"y":1,"v":3},{"x":2,"y":1,"v":3},{"x":3,"y":2,"v":3},{"x":4,"y":2,"v":3},{"x":6,"y":2,"v":3},{"x":3,"y":3,"v":3},{"x":4,"y":3,"v":3},{"x":5,"y":3,"v":3},{"x":6,"y":3,"v":3},{"x":7,"y":3,"v":3},{"x":4,"y":4,"v":3},{"x":5,"y":4,"v":3},{"x":7,"y":4,"v":3},{"x":0,"y":5,"v":3},{"x":0,"y":7,"v":3},{"x":2,"y":7,"v":3},{"x":7,"y":7,"v":3}]},{"type":"cells","cells":[{"x":0,"y":2,"v":2},{"x":0,"y":4,"v":2},{"x":0,"y":6,"v":2}]}]',
    },
    /** Held on 2418 of 2589 positions walked. */
    nextToTent: {
      id: "8x8de:bcbeahc_g_iak,0,3,1,2,1,2,0,3,4,0,1,3,0,2,0,2",
      moves:
        '[{"type":"cells","cells":[{"x":0,"y":0,"v":3},{"x":4,"y":0,"v":3},{"x":3,"y":1,"v":3},{"x":4,"y":1,"v":3},{"x":5,"y":1,"v":3},{"x":3,"y":2,"v":3},{"x":4,"y":2,"v":3},{"x":5,"y":2,"v":3},{"x":0,"y":3,"v":3},{"x":4,"y":3,"v":3},{"x":1,"y":4,"v":3},{"x":3,"y":4,"v":3},{"x":4,"y":4,"v":3},{"x":5,"y":4,"v":3},{"x":3,"y":5,"v":3},{"x":5,"y":5,"v":3},{"x":6,"y":5,"v":3},{"x":6,"y":6,"v":3},{"x":7,"y":6,"v":3},{"x":0,"y":7,"v":3},{"x":1,"y":7,"v":3},{"x":3,"y":7,"v":3},{"x":5,"y":7,"v":3},{"x":6,"y":7,"v":3},{"x":7,"y":7,"v":3}]},{"type":"link","x":7,"y":2,"d":4,"on":true}]',
    },
    /** Held on 2512 of 2589 positions walked. */
    treeSingle: {
      id: "8x8de:bcbeahc_g_iak,0,3,1,2,1,2,0,3,4,0,1,3,0,2,0,2",
      moves:
        '[{"type":"cells","cells":[{"x":0,"y":0,"v":3},{"x":4,"y":0,"v":3},{"x":3,"y":1,"v":3},{"x":4,"y":1,"v":3},{"x":5,"y":1,"v":3},{"x":3,"y":2,"v":3},{"x":4,"y":2,"v":3},{"x":5,"y":2,"v":3},{"x":0,"y":3,"v":3},{"x":4,"y":3,"v":3},{"x":1,"y":4,"v":3},{"x":3,"y":4,"v":3},{"x":4,"y":4,"v":3},{"x":5,"y":4,"v":3},{"x":3,"y":5,"v":3},{"x":5,"y":5,"v":3},{"x":6,"y":5,"v":3},{"x":6,"y":6,"v":3},{"x":7,"y":6,"v":3},{"x":0,"y":7,"v":3},{"x":1,"y":7,"v":3},{"x":3,"y":7,"v":3},{"x":5,"y":7,"v":3},{"x":6,"y":7,"v":3},{"x":7,"y":7,"v":3}]}]',
    },
    /** Held on 84 of 2589 positions walked. */
    treeLink: {
      id: "10x10dt:agaa_aidlcldbdbcadcbd,3,1,2,2,2,1,4,1,1,3,1,4,1,3,1,3,1,1,4,1",
      moves:
        '[{"type":"cells","cells":[{"x":5,"y":0,"v":3},{"x":7,"y":0,"v":3},{"x":8,"y":1,"v":3},{"x":0,"y":2,"v":3},{"x":2,"y":2,"v":3},{"x":8,"y":2,"v":3},{"x":9,"y":2,"v":3},{"x":3,"y":3,"v":3},{"x":5,"y":3,"v":3},{"x":7,"y":3,"v":3},{"x":9,"y":3,"v":3},{"x":0,"y":4,"v":3},{"x":2,"y":4,"v":3},{"x":6,"y":4,"v":3},{"x":0,"y":5,"v":3},{"x":2,"y":5,"v":3},{"x":3,"y":5,"v":3},{"x":5,"y":5,"v":3},{"x":7,"y":5,"v":3},{"x":3,"y":6,"v":3},{"x":0,"y":7,"v":3},{"x":2,"y":7,"v":3},{"x":6,"y":8,"v":3},{"x":0,"y":9,"v":3},{"x":7,"y":9,"v":3},{"x":9,"y":9,"v":3}]},{"type":"cells","cells":[{"x":9,"y":1,"v":2}]},{"type":"cells","cells":[{"x":8,"y":0,"v":3}]},{"type":"cells","cells":[{"x":1,"y":7,"v":3}]},{"type":"cells","cells":[{"x":5,"y":4,"v":3},{"x":7,"y":4,"v":3},{"x":5,"y":6,"v":3},{"x":7,"y":6,"v":3},{"x":5,"y":8,"v":3},{"x":7,"y":8,"v":3}]},{"type":"cells","cells":[{"x":0,"y":8,"v":2},{"x":2,"y":8,"v":2},{"x":4,"y":8,"v":2},{"x":9,"y":8,"v":2}]},{"type":"cells","cells":[{"x":8,"y":9,"v":3}]},{"type":"cells","cells":[{"x":3,"y":7,"v":3},{"x":1,"y":9,"v":3},{"x":3,"y":9,"v":3}]},{"type":"cells","cells":[{"x":5,"y":7,"v":3},{"x":4,"y":9,"v":3}]},{"type":"cells","cells":[{"x":8,"y":7,"v":3},{"x":9,"y":7,"v":3}]},{"type":"link","x":6,"y":7,"d":3,"on":true},{"type":"link","x":6,"y":5,"d":4,"on":true},{"type":"link","x":6,"y":9,"d":2,"on":true},{"type":"cells","cells":[{"x":8,"y":5,"v":3}]}]',
    },
    /** Held on 724 of 2589 positions walked. */
    treeDiagonal: {
      id: "8x8de:hfbad_ibdbacj,2,1,1,2,1,2,1,2,1,3,0,3,1,2,1,1",
      moves:
        '[{"type":"cells","cells":[{"x":1,"y":0,"v":3},{"x":2,"y":0,"v":3},{"x":3,"y":0,"v":3},{"x":4,"y":0,"v":3},{"x":5,"y":0,"v":3},{"x":6,"y":0,"v":3},{"x":3,"y":1,"v":3},{"x":5,"y":1,"v":3},{"x":6,"y":2,"v":3},{"x":5,"y":3,"v":3},{"x":6,"y":3,"v":3},{"x":0,"y":4,"v":3},{"x":0,"y":5,"v":3},{"x":2,"y":5,"v":3},{"x":3,"y":6,"v":3},{"x":0,"y":7,"v":3},{"x":2,"y":7,"v":3},{"x":3,"y":7,"v":3},{"x":4,"y":7,"v":3},{"x":6,"y":7,"v":3},{"x":7,"y":7,"v":3}]}]',
    },
    /** Held on 2451 of 2589 positions walked. */
    lineCount: {
      id: "8x8de:cbfaafihbbdec,3,0,2,1,0,3,0,3,2,0,3,1,1,1,3,1",
      moves:
        '[{"type":"cells","cells":[{"x":0,"y":0,"v":3},{"x":1,"y":0,"v":3},{"x":0,"y":1,"v":3},{"x":2,"y":1,"v":3},{"x":3,"y":2,"v":3},{"x":4,"y":2,"v":3},{"x":6,"y":2,"v":3},{"x":3,"y":3,"v":3},{"x":4,"y":3,"v":3},{"x":5,"y":3,"v":3},{"x":6,"y":3,"v":3},{"x":7,"y":3,"v":3},{"x":4,"y":4,"v":3},{"x":5,"y":4,"v":3},{"x":7,"y":4,"v":3},{"x":0,"y":5,"v":3},{"x":0,"y":7,"v":3},{"x":2,"y":7,"v":3},{"x":7,"y":7,"v":3}]}]',
    },
    /** Held on 750 of 2589 positions walked. */
    lineNeighbors: {
      id: "10x10dt:cbcbb_aijdabakdffdbg_,3,1,2,3,1,2,1,2,2,3,4,1,2,2,3,1,2,2,1,2",
      moves:
        '[{"type":"cells","cells":[{"x":1,"y":0,"v":3},{"x":8,"y":0,"v":3},{"x":1,"y":2,"v":3},{"x":2,"y":2,"v":3},{"x":4,"y":2,"v":3},{"x":5,"y":2,"v":3},{"x":1,"y":3,"v":3},{"x":2,"y":3,"v":3},{"x":3,"y":3,"v":3},{"x":4,"y":3,"v":3},{"x":6,"y":3,"v":3},{"x":8,"y":3,"v":3},{"x":3,"y":4,"v":3},{"x":9,"y":4,"v":3},{"x":6,"y":5,"v":3},{"x":8,"y":5,"v":3},{"x":1,"y":6,"v":3},{"x":7,"y":6,"v":3},{"x":0,"y":7,"v":3},{"x":1,"y":7,"v":3},{"x":2,"y":7,"v":3},{"x":0,"y":8,"v":3},{"x":5,"y":8,"v":3},{"x":4,"y":9,"v":3},{"x":5,"y":9,"v":3},{"x":6,"y":9,"v":3},{"x":7,"y":9,"v":3}]}]',
    },
  },
});

describe("every premise the corpus reaches is reached", () => {
  it("a pin stands for every kind of premise", () => {
    // The rungs are the solver's reasons, and a reason with no pinned position
    // does not compile above. Each pin's plan opens with its premise.
    for (const rung of TENTS_RUNGS) expect(pinned(rung).steps[0].rung).toBe(rung);
  });

  it("says a line's count from the clue, singular and plural", () => {
    const row = {
      kind: "row" as const,
      line: 5,
      squares: [0, 1, 2].map((x) => ({ x, y: 0 })),
    };
    const column = { kind: "column" as const, line: 0, squares: [{ x: 0, y: 0 }] };
    const one = [{ x: 1, y: 0 }];
    const two = [...one, { x: 2, y: 0 }];
    expect(say.countMet(row, 1, two).text).toBe(
      "This row already has its 1 tent, so its open squares must be grass.",
    );
    expect(say.allOpen(column, 1, one).text).toMatch(
      /1 open square, so the ringed square must be a tent/,
    );
    expect(say.noSpareRoom(row, 2, one).text).toMatch(
      /the ringed square must be a tent\.$/,
    );
  });
});

describe("the player's links", () => {
  /** A board with its solution, and one of its tents beside two trees. */
  function forkedTent() {
    for (const { p, seed } of CORPUS) {
      const state = deal(p, seed);
      const puzzle = Int8Array.from(state.grid, (v) => (v === TREE ? TREE : 0));
      const { soln, links } = tentsSolve(p.w, p.h, puzzle, state.numbers, DIFF_TRICKY);
      for (let i = 0; i < soln.length; i++) {
        if (soln[i] !== TENT) continue;
        const trees: number[] = [];
        for (let d = 1; d < MAXDIR; d++) {
          const x = (i % p.w) + DX(d);
          const y = Math.floor(i / p.w) + DY(d);
          if (x >= 0 && x < p.w && y >= 0 && y < p.h && soln[y * p.w + x] === TREE)
            trees.push(d);
        }
        if (trees.length < 2) continue;
        const right = trees.find((d) => d === links[i]);
        const wrong = trees.find((d) => d !== links[i]);
        if (right === undefined || wrong === undefined) continue;
        const x = i % p.w;
        const y = Math.floor(i / p.w);
        const placed = executeMove(state, {
          type: "cells",
          cells: [{ x, y, v: TENT }],
        });
        return { placed, x, y, right, wrong, tent: i };
      }
    }
    throw new Error("no tent beside two trees in the corpus");
  }

  it("flags a link no pairing of the solution holds, so the midend refuses a hint", () => {
    const { placed, x, y, wrong, right } = forkedTent();
    const linked = executeMove(placed, { type: "link", x, y, d: wrong, on: true });
    // Whether a link like this is wrong depends on the rest of the pairing; on
    // the corpus's first forked tent, no pairing holds it.
    expect(
      (tentsGame.findMistakes?.(linked) ?? []).some((m) => m.kind === "link"),
    ).toBe(true);
    const good = executeMove(placed, { type: "link", x, y, d: right, on: true });
    expect(tentsGame.findMistakes?.(good)).toEqual([]);
  });

  it("finds a wrong link somewhere in the corpus", () => {
    // The test above is conditional, so this is its vacuity guard: over every
    // tent beside two trees, some wrong link must be flagged.
    let flagged = 0;
    for (const { p, seed } of CORPUS.slice(0, 12)) {
      const state = deal(p, seed);
      const puzzle = Int8Array.from(state.grid, (v) => (v === TREE ? TREE : 0));
      const { soln, links } = tentsSolve(p.w, p.h, puzzle, state.numbers, DIFF_TRICKY);
      const tents = [...soln.keys()].filter((i) => soln[i] === TENT);
      const all = executeMove(state, {
        type: "cells",
        cells: tents.map((i) => ({ x: i % p.w, y: Math.floor(i / p.w), v: TENT })),
      });
      for (const i of tents)
        for (let d = 1; d < MAXDIR; d++) {
          const j = i + DY(d) * p.w + DX(d);
          const x = (i % p.w) + DX(d);
          const y = Math.floor(i / p.w) + DY(d);
          if (
            d === links[i] ||
            x < 0 ||
            x >= p.w ||
            y < 0 ||
            y >= p.h ||
            soln[j] !== TREE
          )
            continue;
          const s = executeMove(all, {
            type: "link",
            x: i % p.w,
            y: Math.floor(i / p.w),
            d,
            on: true,
          });
          if (tentsGame.findMistakes?.(s).some((m) => m.kind === "link")) flagged++;
        }
    }
    expect(flagged).toBeGreaterThan(0);
  });

  it("takes a drawn link as given and never asks for it again", () => {
    const { placed, x, y, right, tent } = forkedTent();
    const linked = executeMove(placed, { type: "link", x, y, d: right, on: true });
    for (const { steps } of plan(linked))
      for (const { move } of steps)
        if (move.type === "link") expect(move.y * linked.w + move.x).not.toBe(tent);
    expect(Array.from(seen(linked).links)).toContain(right);
  });
});

describe("following a step by hand", () => {
  // A step's words hold functions, so a copy clones only the data keep-track
  // rewrites in place.
  const copy = (s: Step): Step => ({
    ...s,
    move: structuredClone(s.move),
  });

  /** A pinned position and its own copy of the step a hint opens with there. */
  function stepAt(kind: Parameters<typeof pinned>[0]) {
    const { state, step } = pinned(kind);
    return { state, step: copy(step) };
  }

  it("shrinks a step square by square, and completes on the last", () => {
    const { state, step } = stepAt("grassOfSeveral");
    if (step.move.type !== "cells") throw new Error("not a cells step");
    const [first, ...rest] = step.move.cells;
    const one: TentsMove = { type: "cells", cells: [first] };
    const before = step.explanation;
    expect(tentsKeepTrack(one, step, state)).toBe("onTrack");
    expect(stepMarks(step).of("ring", CELL)).toHaveLength(rest.length);
    // Its words shrink with it, naming just the rings left.
    const after = executeMove(state, one);
    expect(bindingDefects(tentsGame, after, tentsGame.newUi(after), step)).toEqual([]);
    if (rest.length === 1) expect(step.explanation).not.toBe(before);
    expect(tentsKeepTrack({ type: "cells", cells: rest }, step, after)).toBe(
      "completed",
    );
  });

  it("goes off a step for a square it does not ask for, or a tent where it asks grass", () => {
    const { state, step } = stepAt("grass");
    if (step.move.type !== "cells") throw new Error("not a cells step");
    const target = step.move.cells[0];
    const tent: TentsMove = { type: "cells", cells: [{ ...target, v: TENT }] };
    expect(tentsKeepTrack(tent, step, state)).toBe("off");
    const other = [...state.grid.keys()].find(
      (i) =>
        state.grid[i] === 0 &&
        !(
          step.move.type === "cells" &&
          step.move.cells.some((c) => c.y * state.w + c.x === i)
        ),
    );
    if (other === undefined) throw new Error("no other open square");
    const stray: TentsMove = {
      type: "cells",
      cells: [{ x: other % state.w, y: Math.floor(other / state.w), v: NONTENT }],
    };
    expect(tentsKeepTrack(stray, step, state)).toBe("off");
  });

  it("takes a tree's tent placed by a click as progress, and the link as the rest", () => {
    const { state, step } = pinned("treeSingle");
    if (step.move.type !== "link") throw new Error("a tree's tent is placed by a link");
    const { x, y } = step.move;
    expect(state.grid[y * state.w + x]).toBe(0);
    const click: TentsMove = { type: "cells", cells: [{ x, y, v: TENT }] };
    const followed = copy(step);
    expect(tentsKeepTrack(click, followed, state)).toBe("onTrack");
    const placed = executeMove(state, click);
    expect(tentsKeepTrack(followed.move, followed, placed)).toBe("completed");
    // The combined move itself completes it at once.
    expect(tentsKeepTrack(step.move, copy(step), state)).toBe("completed");
  });

  it("completes a link step by the link, from either end", () => {
    const { state, step } = pinned("link");
    if (step.move.type !== "link") throw new Error("not a link step");
    const { x, y, d } = step.move;
    // The same link spelled from the tree's end.
    const fromTree: TentsMove = {
      type: "link",
      x: x + DX(d),
      y: y + DY(d),
      d: FLIP(d),
      on: true,
    };
    expect(tentsKeepTrack(fromTree, copy(step), state)).toBe("completed");
  });
});

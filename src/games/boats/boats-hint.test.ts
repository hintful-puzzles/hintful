/**
 * Boats — the explained hint.
 *
 * The load-bearing test is `every square a plan forces matches the unique
 * solution`: the recording pass re-derives each technique's *condition* beside
 * `solveBoats` rather than calling into it, so a mis-transcribed condition would
 * be a hint that confidently tells the player to place a wrong square. Checking
 * every planned square against a re-solve is what makes that impossible to ship
 * unnoticed, and it is cheap enough to run over every preset.
 *
 * Convergence (`a plan built one fresh hint at a time solves the board`) is the
 * other half: the cross-game `hint-resume.test.ts` guard only walks each game's
 * *first* preset, so the per-tier sweep lives here.
 */

import { describe, expect, it } from "vitest";
import { COL_HINT_OUTLINE } from "../../engine/color/roles.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { CELL, NARRATION_LIMIT } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { type Clauses, statedSentence } from "../../engine/stated.ts";
import {
  describeHintKindPins,
  describeHintPins,
} from "../../engine/testing/hint-positions.ts";
import { expectRing, ringsOf } from "../../engine/testing/mark-shape.ts";
import {
  type DrawOp,
  opsOfKind,
  RecordingDrawing,
} from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderPinnedHint,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import type { Point } from "../../engine/types.ts";
import { NO_FLASH } from "../../engine/win-wave.ts";
import { STATED } from "../../generated/games/boats/boats.compiled.ts";
import { newBoatsDesc } from "./generator.ts";
import { type BoatsHint, boatsGame } from "./index.ts";
import { solveToGrid } from "./solver.ts";
import {
  type BoatsMove,
  type BoatsParams,
  type BoatsState,
  boardOf,
  DIFF_EASY,
  DIFF_HARD,
  DIFF_NORMAL,
  DIFF_TRICKY,
  decodeParams,
  defaultFleet,
  EMPTY,
  encodeParams,
  fillOf,
  isShip,
  NO_CLUE,
  newState,
  STATUS_COMPLETE,
  STATUS_INVALID,
} from "./state.ts";
import { validateFullState } from "./validate.ts";

// The boards these tests were written on, by index: 0 = 6×6 Easy, 4 = 8×8
// Normal, 8 = 10×10 Tricky, 9 = 10×10 Hard. They are kept here by their
// params, so a change to the menu does not move a pinned board.
const BOARDS: readonly Omit<BoatsParams, "fleetData">[] = [
  { w: 6, h: 6, fleet: 3, diff: DIFF_EASY, strip: false },
  { w: 6, h: 6, fleet: 3, diff: DIFF_NORMAL, strip: false },
  { w: 6, h: 6, fleet: 3, diff: DIFF_HARD, strip: false },
  { w: 8, h: 8, fleet: 4, diff: DIFF_EASY, strip: false },
  { w: 8, h: 8, fleet: 4, diff: DIFF_NORMAL, strip: false },
  { w: 8, h: 8, fleet: 4, diff: DIFF_HARD, strip: false },
  { w: 10, h: 10, fleet: 4, diff: DIFF_EASY, strip: false },
  { w: 10, h: 10, fleet: 4, diff: DIFF_NORMAL, strip: false },
  { w: 10, h: 10, fleet: 4, diff: DIFF_TRICKY, strip: false },
  { w: 10, h: 10, fleet: 4, diff: DIFF_HARD, strip: false },
  { w: 10, h: 12, fleet: 5, diff: DIFF_TRICKY, strip: false },
  { w: 10, h: 12, fleet: 5, diff: DIFF_HARD, strip: false },
];

function presetParams(i: number): BoatsParams {
  const p = BOARDS[i];
  return { ...p, fleetData: defaultFleet(p.fleet) };
}

const TIERS = [
  [0, "Easy"],
  [4, "Normal"],
  [8, "Tricky"],
  [9, "Hard"],
] as const;

function board(preset: number, seed: string, strip = false): BoatsState {
  const p = { ...presetParams(preset), strip };
  return newState(p, newBoatsDesc(p, randomNew(seed)).desc);
}

function play(state: BoatsState, move: BoatsMove): BoatsState {
  return boatsGame.executeMove(state, move);
}

function isSolved(state: BoatsState): boolean {
  return validateFullState(boardOf(state)) === STATUS_COMPLETE;
}

function hintOf(state: BoatsState) {
  const r = boatsGame.hint.plan(state);
  if (!r) throw new Error("boats declares no hint()");
  return r;
}

/** A position for each technique. Both strip settings, since a strip board
 * starts from fewer givens. */
const pinnedFiring = describeHintPins({
  game: boatsGame,
  params: [0, 1, 4, 7, 8, 9, 11].flatMap((preset) => [
    { ...presetParams(preset), strip: true },
    { ...presetParams(preset), strip: false },
  ]),
  kinds: {
    // A line whose water fill decides more than one square.
    lineWaterOfSeveral: (step) =>
      step.rung === "lineWater" && (step.highlights as BoatsHint).targets.length > 1,
  },
  pins: {
    /** Kept by hand: a middle segment's trial is the hint's step on 1 of
     * 8,554 positions walked on 160 Hard boards (2026-11-17), so the scan's
     * boards do not reach it. A 7x9 Hard board five steps in. */
    centerTrial: {
      id: "7x9f4dh,4,3,2,1:5,3,1,3,3,1,4,3,3,2,2,0,2,2,4,2,jCzyW",
      moves:
        '[{"kind":"fill","x0":4,"y0":0,"x1":4,"y1":0,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":2,"x1":4,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":2,"x1":2,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":0,"x1":2,"y1":0,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":4,"x1":6,"y1":4,"from":"-","to":"W"}]',
    },
    /** Held on 944 of 7038 positions walked. */
    lineWaterOfSeveral: "6x6f3deS,3,2,1:0,4,0,3,1,2,-,1,0,3,-,3,uW",
    /** Held on 885 of 7038 positions walked. */
    given: "6x6f3deS,3,2,1:2,2,1,1,0,4,1,-,3,1,-,1,WaWWgTLqWaW",
    /** Held on 3870 of 7038 positions walked. */
    near: "6x6f3dnS,3,2,1:-,0,-,-,0,2,1,-,3,-,1,-,nCiW",
    /** Held on 6941 of 7038 positions walked. */
    lineShips: {
      id: "6x6f3dnS,3,2,1:0,4,0,3,1,2,-,1,-,3,1,3,uW",
      moves:
        '[{"kind":"fill","x0":0,"y0":0,"x1":0,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":0,"x1":2,"y1":5,"from":"-","to":"W"}]',
    },
    /** Held on 634 of 7038 positions walked. */
    total: {
      id: "6x6f3deS,3,2,1:-,2,1,-,-,-,2,-,1,0,-,0,aWiR",
      moves:
        '[{"kind":"fill","x0":4,"y0":1,"x1":4,"y1":1,"from":"-","to":"B"},{"kind":"fill","x0":5,"y0":0,"x1":5,"y1":0,"from":"-","to":"W"},{"kind":"fill","x0":5,"y0":2,"x1":5,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":2,"x1":3,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":0,"x1":3,"y1":0,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":0,"x1":4,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":0,"x1":2,"y1":0,"from":"-","to":"B"},{"kind":"fill","x0":1,"y0":1,"x1":1,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":1,"x1":3,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":3,"x1":5,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":5,"x1":5,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":2,"x1":1,"y1":4,"from":"-","to":"B"},{"kind":"fill","x0":0,"y0":1,"x1":2,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":2,"x1":2,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":4,"x1":2,"y1":4,"from":"-","to":"W"}]',
    },
    /** Held on 1392 of 7038 positions walked. */
    center: {
      id: "10x10f4dtS,4,3,2,1:0,-,3,2,0,-,5,-,5,-,2,2,1,1,3,3,0,1,4,3,fWzoWzuC",
      moves:
        '[{"kind":"fill","x0":7,"y0":8,"x1":7,"y1":8,"from":"-","to":"W"},{"kind":"fill","x0":5,"y0":8,"x1":5,"y1":8,"from":"-","to":"W"}]',
    },
    /** Held on 763 of 7038 positions walked. */
    extend: {
      id: "6x6f3deS,3,2,1:4,-,-,2,0,3,3,-,-,1,2,0,eSWz",
      moves:
        '[{"kind":"fill","x0":5,"y0":1,"x1":5,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":0,"x1":4,"y1":0,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":1,"x1":4,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":5,"x1":5,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":0,"x1":0,"y1":4,"from":"-","to":"B"},{"kind":"fill","x0":1,"y0":1,"x1":1,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":3,"x1":1,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":2,"x1":1,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":3,"x1":5,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":5,"y0":2,"x1":5,"y1":4,"from":"-","to":"B"},{"kind":"fill","x0":2,"y0":4,"x1":4,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":2,"x1":4,"y1":2,"from":"-","to":"W"}]',
    },
    /** Held on 6913 of 7038 positions walked. */
    lineWater: "6x6f3deS,3,2,1:0,4,0,3,1,2,-,1,0,3,-,3,uW",
    /** Held on 503 of 7038 positions walked. */
    isolated: {
      id: "6x6f3dnS,3,2,1:-,0,-,-,0,2,1,-,3,-,1,-,nCiW",
      moves:
        '[{"kind":"fill","x0":3,"y0":1,"x1":3,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":3,"x1":3,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":3,"x1":1,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":1,"x1":1,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":0,"x1":1,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":1,"x1":2,"y1":3,"from":"-","to":"B"},{"kind":"fill","x0":3,"y0":0,"x1":3,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":4,"x1":3,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":0,"x1":4,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":2,"x1":5,"y1":2,"from":"-","to":"B"},{"kind":"fill","x0":2,"y0":0,"x1":2,"y1":0,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":4,"x1":2,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":5,"y0":4,"x1":5,"y1":4,"from":"-","to":"B"},{"kind":"fill","x0":5,"y0":0,"x1":5,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":0,"x1":0,"y1":0,"from":"-","to":"B"},{"kind":"fill","x0":0,"y0":1,"x1":0,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":3,"x1":0,"y1":3,"from":"-","to":"B"}]',
    },
    /** Held on 1928 of 7038 positions walked. */
    grow: {
      id: "6x6f3dnS,3,2,1:0,-,-,2,-,-,-,2,1,2,-,-,aSzeB",
      moves:
        '[{"kind":"fill","x0":2,"y0":0,"x1":2,"y1":0,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":1,"x1":1,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":0,"x1":0,"y1":0,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":4,"x1":3,"y1":4,"from":"-","to":"B"},{"kind":"fill","x0":0,"y0":1,"x1":2,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":3,"x1":4,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":5,"x1":4,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":5,"x1":2,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":3,"x1":2,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":4,"x1":4,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":2,"x1":0,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":0,"x1":3,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":1,"x1":5,"y1":1,"from":"-","to":"B"},{"kind":"fill","x0":5,"y0":0,"x1":5,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":0,"x1":4,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":3,"x1":5,"y1":3,"from":"-","to":"B"},{"kind":"fill","x0":2,"y0":2,"x1":2,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":2,"x1":1,"y1":2,"from":"-","to":"B"}]',
    },
    /** Held on 2309 of 7038 positions walked. */
    onlyFit: {
      id: "6x6f3dn,3,2,1:3,1,1,0,3,2,1,2,0,2,2,3,dTzaW",
      moves:
        '[{"kind":"fill","x0":4,"y0":1,"x1":4,"y1":1,"from":"-","to":"B"},{"kind":"fill","x0":3,"y0":1,"x1":5,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":5,"y0":0,"x1":5,"y1":0,"from":"-","to":"W"},{"kind":"fill","x0":5,"y0":2,"x1":5,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":0,"x1":3,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":0,"x1":2,"y1":0,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":2,"x1":4,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":3,"x1":3,"y1":5,"from":"-","to":"W"}]',
    },
    /** Held on 122 of 7038 positions walked. */
    centerRoom: {
      id: "8x8f4dnS,4,3,2,1:4,2,0,4,2,3,3,2,-,-,4,-,0,-,2,3,sTzhCeW",
      moves:
        '[{"kind":"fill","x0":3,"y0":3,"x1":3,"y1":3,"from":"-","to":"B"},{"kind":"fill","x0":3,"y0":1,"x1":3,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":1,"x1":4,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":3,"x1":4,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":3,"x1":2,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":1,"x1":2,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":2,"x1":4,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":4,"x1":4,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":2,"x1":2,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":7,"y0":5,"x1":7,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":7,"y0":7,"x1":7,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":5,"y0":7,"x1":5,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":5,"y0":5,"x1":5,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":4,"x1":7,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":0,"x1":2,"y1":7,"from":"-","to":"W"}]',
    },
    /** Held on 2681 of 7038 positions walked. */
    tooLong: {
      id: "6x6f3dnS,3,2,1:-,0,-,-,0,2,1,-,3,-,1,-,nCiW",
      moves:
        '[{"kind":"fill","x0":3,"y0":1,"x1":3,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":3,"x1":3,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":3,"x1":1,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":1,"x1":1,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":0,"x1":1,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":1,"x1":2,"y1":3,"from":"-","to":"B"},{"kind":"fill","x0":3,"y0":0,"x1":3,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":4,"x1":3,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":0,"x1":4,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":2,"x1":5,"y1":2,"from":"-","to":"B"}]',
    },
    /** Held on 609 of 7038 positions walked. */
    shortRun: {
      id: "8x8f4dn,4,3,2,1:2,4,3,3,2,0,2,4,4,2,3,0,4,2,2,3,jWfWbWaWzbT",
      moves:
        '[{"kind":"fill","x0":3,"y0":7,"x1":3,"y1":7,"from":"-","to":"B"},{"kind":"fill","x0":3,"y0":5,"x1":3,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":5,"x1":4,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":7,"x1":4,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":7,"x1":2,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":5,"x1":2,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":6,"x1":4,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":3,"x1":7,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":0,"x1":2,"y1":4,"from":"-","to":"B"},{"kind":"fill","x0":1,"y0":1,"x1":3,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":5,"x1":1,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":0,"x1":1,"y1":7,"from":"-","to":"B"},{"kind":"fill","x0":0,"y0":1,"x1":0,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":5,"x1":0,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":7,"x1":0,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":6,"x1":0,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":5,"y0":6,"x1":7,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":5,"y0":0,"x1":5,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":6,"y0":5,"x1":7,"y1":5,"from":"-","to":"B"},{"kind":"fill","x0":7,"y0":4,"x1":7,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":6,"y0":4,"x1":6,"y1":4,"from":"-","to":"W"}]',
    },
    /** Held on 650 of 7038 positions walked. */
    "hidden.satisfied": {
      id: "10x10f4dtS,4,3,2,1:1,0,1,2,1,4,1,3,4,3,2,0,1,0,3,1,-,3,2,-,zzzgTdShR",
      moves:
        '[{"kind":"fill","x0":5,"y0":9,"x1":5,"y1":9,"from":"-","to":"B"},{"kind":"fill","x0":5,"y0":7,"x1":5,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":8,"x1":0,"y1":8,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":9,"x1":1,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":9,"x1":8,"y1":9,"from":"-","to":"B"},{"kind":"fill","x0":6,"y0":7,"x1":6,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":6,"y0":9,"x1":6,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":9,"x1":4,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":7,"x1":4,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":8,"x1":1,"y1":8,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":8,"x1":6,"y1":8,"from":"-","to":"W"},{"kind":"fill","x0":9,"y0":8,"x1":9,"y1":8,"from":"-","to":"W"},{"kind":"fill","x0":7,"y0":8,"x1":7,"y1":8,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":8,"x1":8,"y1":8,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":1,"x1":9,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":3,"x1":9,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":0,"x1":0,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":0,"x1":1,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":7,"x1":2,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":6,"x1":8,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":6,"x1":5,"y1":6,"from":"-","to":"B"},{"kind":"fill","x0":5,"y0":5,"x1":5,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":7,"x1":3,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":5,"x1":3,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":5,"x1":6,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":7,"y0":7,"x1":9,"y1":7,"from":"-","to":"B"},{"kind":"fill","x0":6,"y0":6,"x1":6,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":7,"y0":6,"x1":9,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":0,"x1":4,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":6,"x1":3,"y1":6,"from":"-","to":"B"},{"kind":"fill","x0":2,"y0":5,"x1":2,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":0,"x1":2,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":8,"x1":3,"y1":8,"from":"-","to":"B"},{"kind":"fill","x0":3,"y0":0,"x1":3,"y1":9,"from":"-","to":"W"}]',
    },
    /** Held on 525 of 7038 positions walked. */
    "hidden.forced": {
      id: "10x10f4dtS,4,3,2,1:1,1,5,-,2,4,2,2,-,1,1,1,3,1,0,5,0,5,1,3,bWeWpTcRyCvW",
      moves:
        '[{"kind":"fill","x0":5,"y0":3,"x1":5,"y1":3,"from":"-","to":"B"},{"kind":"fill","x0":5,"y0":1,"x1":5,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":2,"x1":8,"y1":2,"from":"-","to":"B"},{"kind":"fill","x0":6,"y0":1,"x1":6,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":6,"y0":3,"x1":6,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":3,"x1":4,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":1,"x1":4,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":9,"y0":1,"x1":9,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":9,"y0":3,"x1":9,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":7,"y0":3,"x1":7,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":7,"y0":1,"x1":7,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":1,"x1":8,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":6,"y0":2,"x1":6,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":6,"y0":4,"x1":6,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":2,"x1":4,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":6,"y0":6,"x1":6,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":6,"x1":4,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":2,"x1":7,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":3,"x1":3,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":4,"x1":9,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":5,"x1":6,"y1":5,"from":"-","to":"B"},{"kind":"fill","x0":3,"y0":6,"x1":5,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":7,"y0":6,"x1":7,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":6,"x1":9,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":1,"x1":2,"y1":9,"from":"-","to":"B"},{"kind":"fill","x0":1,"y0":0,"x1":3,"y1":0,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":8,"x1":3,"y1":8,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":7,"x1":3,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":9,"x1":3,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":7,"x1":1,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":1,"x1":3,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":5,"x1":1,"y1":5,"from":"-","to":"B"},{"kind":"fill","x0":0,"y0":5,"x1":9,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":8,"x1":9,"y1":8,"from":"-","to":"W"},{"kind":"fill","x0":9,"y0":0,"x1":9,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":7,"x1":7,"y1":7,"from":"-","to":"B"},{"kind":"fill","x0":0,"y0":7,"x1":0,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":0,"x1":4,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":5,"y0":0,"x1":5,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":6,"y0":0,"x1":6,"y1":9,"from":"-","to":"W"}]',
    },
    /** Held on 1756 of 7038 positions walked. */
    onlyRuns: {
      id: "10x10f4dh,4,3,2,1:3,1,3,1,2,0,2,4,0,4,0,3,5,0,2,2,4,1,1,2,zzqBTz",
      moves:
        '[{"kind":"fill","x0":9,"y0":5,"x1":9,"y1":5,"from":"-","to":"B"},{"kind":"fill","x0":9,"y0":7,"x1":9,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":8,"x1":0,"y1":8,"from":"-","to":"B"},{"kind":"fill","x0":0,"y0":6,"x1":0,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":6,"x1":8,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":4,"x1":8,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":5,"x1":8,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":6,"x1":1,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":8,"x1":1,"y1":8,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":7,"x1":1,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":0,"x1":9,"y1":0,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":3,"x1":9,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":7,"x1":7,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":8,"x1":9,"y1":8,"from":"-","to":"W"},{"kind":"fill","x0":5,"y0":1,"x1":5,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":1,"x1":8,"y1":9,"from":"-","to":"W"}]',
    },
    /** Held on 2560 of 7038 positions walked. */
    shared: {
      id: "10x10f4dh,4,3,2,1:3,5,2,2,2,2,1,1,1,1,2,2,1,4,1,1,2,1,3,3,jTzzfSwS",
      moves:
        '[{"kind":"fill","x0":0,"y0":2,"x1":0,"y1":2,"from":"-","to":"B"},{"kind":"fill","x0":0,"y0":0,"x1":0,"y1":0,"from":"-","to":"W"},{"kind":"fill","x0":9,"y0":5,"x1":9,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":9,"y0":7,"x1":9,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":6,"x1":8,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":8,"x1":3,"y1":8,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":9,"x1":4,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":0,"x1":1,"y1":0,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":2,"x1":1,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":1,"x1":1,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":5,"x1":8,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":8,"x1":4,"y1":8,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":2,"x1":9,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":9,"y0":0,"x1":9,"y1":9,"from":"-","to":"W"}]',
    },
    /** Held on 2413 of 7038 positions walked. */
    lastWater: {
      id: "10x10f4dh,4,3,2,1:3,2,2,5,3,0,2,2,1,0,0,5,0,4,3,1,1,2,0,4,kLeWzfSzmWeW",
      moves:
        '[{"kind":"fill","x0":2,"y0":1,"x1":2,"y1":1,"from":"-","to":"B"},{"kind":"fill","x0":0,"y0":1,"x1":0,"y1":1,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":4,"x1":0,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":5,"x1":1,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":6,"x1":0,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":0,"x1":2,"y1":0,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":2,"x1":2,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":0,"x1":0,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":0,"x1":3,"y1":0,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":2,"x1":3,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":0,"x1":1,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":1,"y0":4,"x1":1,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":0,"x1":9,"y1":0,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":2,"x1":9,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":5,"x1":9,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":8,"x1":9,"y1":8,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":3,"x1":0,"y1":7,"from":"-","to":"B"},{"kind":"fill","x0":5,"y0":1,"x1":5,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":9,"y0":1,"x1":9,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":6,"x1":4,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":6,"x1":2,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":7,"x1":4,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":2,"y0":7,"x1":2,"y1":7,"from":"-","to":"W"}]',
    },
    /** Held on 1092 of 7038 positions walked. */
    lastShip: {
      id: "10x10f4dhS,4,3,2,1:2,4,3,0,2,1,0,3,2,3,1,3,1,5,0,-,3,-,-,0,nWtRcRzaBuR",
      moves:
        '[{"kind":"fill","x0":4,"y0":3,"x1":4,"y1":3,"from":"-","to":"B"},{"kind":"fill","x0":6,"y0":3,"x1":6,"y1":3,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":3,"x1":8,"y1":3,"from":"-","to":"B"},{"kind":"fill","x0":7,"y0":5,"x1":7,"y1":5,"from":"-","to":"B"},{"kind":"fill","x0":7,"y0":7,"x1":7,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":8,"x1":8,"y1":8,"from":"-","to":"B"},{"kind":"fill","x0":5,"y0":2,"x1":5,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":5,"y0":4,"x1":5,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":4,"x1":3,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":2,"x1":3,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":6,"y0":2,"x1":6,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":6,"y0":4,"x1":6,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":4,"y0":2,"x1":4,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":9,"y0":2,"x1":9,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":9,"y0":4,"x1":9,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":7,"y0":4,"x1":7,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":7,"y0":2,"x1":7,"y1":2,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":2,"x1":8,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":6,"y0":6,"x1":8,"y1":6,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":5,"x1":8,"y1":5,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":7,"x1":8,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":6,"y0":5,"x1":6,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":9,"y0":7,"x1":9,"y1":7,"from":"-","to":"W"},{"kind":"fill","x0":9,"y0":9,"x1":9,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":7,"y0":9,"x1":7,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":9,"x1":8,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":4,"x1":2,"y1":4,"from":"-","to":"W"},{"kind":"fill","x0":0,"y0":9,"x1":6,"y1":9,"from":"-","to":"W"},{"kind":"fill","x0":3,"y0":0,"x1":3,"y1":8,"from":"-","to":"W"},{"kind":"fill","x0":5,"y0":0,"x1":5,"y1":8,"from":"-","to":"W"},{"kind":"fill","x0":6,"y0":0,"x1":6,"y1":8,"from":"-","to":"W"},{"kind":"fill","x0":8,"y0":0,"x1":8,"y1":1,"from":"-","to":"W"}]',
    },
  },
});

describe("boats hint — soundness", () => {
  it("every square a plan forces matches the unique solution", () => {
    let checked = 0;
    for (const [preset] of TIERS) {
      for (let s = 0; s < 4; s++) {
        const state = board(preset, `sound-${preset}-${s}`, s % 2 === 0);
        const truth = solveToGrid(state);
        expect(truth.ok).toBe(true);
        if (!truth.ok) continue;

        const plan = hintOf(state);
        if (!plan.ok) continue;
        for (const step of plan.steps) {
          // A journey's legs share one highlight, whose squares are the firing's.
          if (step.continuesPrevious) continue;
          for (const sq of (step.highlights as BoatsHint).targets) {
            const i = sq.y * state.params.w + sq.x;
            // Reported as an object so a failure names the guilty technique.
            expect({
              technique: step.rung,
              at: `${sq.x},${sq.y}`,
              ship: sq.ship,
            }).toEqual({
              technique: step.rung,
              at: `${sq.x},${sq.y}`,
              ship: isShip(truth.grid[i]),
            });
            checked++;
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(500);
  });

  it("hint() does not mutate the state it is given", () => {
    const state = board(4, "purity");
    const before = Int8Array.from(state.grid);
    hintOf(state);
    expect(state.grid).toEqual(before);
  });
});

describe("boats hint — convergence", () => {
  it.each(
    TIERS,
  )("solves a %s board one freshly-recomputed hint at a time", (preset) => {
    for (let s = 0; s < 3; s++) {
      let state = board(preset, `converge-${preset}-${s}`);
      for (let guard = 0; guard < 500 && !isSolved(state); guard++) {
        const r = hintOf(state);
        expect(r.ok, `stuck at step ${guard}: ${r.ok ? "" : r.error}`).toBe(true);
        if (!r.ok) break;
        // Only the first step, exactly as the app does when the player then
        // goes their own way — the plan must be recomputable from anywhere.
        state = play(state, r.steps[0].move);
      }
      expect(isSolved(state)).toBe(true);
    }
  });

  it("resumes from a position the player reached themselves", () => {
    // Every third turn, ignore the hint and play a correct square of the
    // player's own choosing instead, so the board keeps arriving at positions
    // no plan proposed. A recording solver written to run from empty is not
    // automatically resumable (docs/hints.md § "A hint must resume from
    // any position"); this is what catches it.
    let state = board(4, "resume-own-play");
    const truth = solveToGrid(state);
    expect(truth.ok).toBe(true);
    if (!truth.ok) return;
    const { w, h } = state.params;

    for (let turn = 0; turn < 500 && !isSolved(state); turn++) {
      if (turn % 3 === 2) {
        // The player's own move: the last still-undecided square of the grid.
        let played = false;
        for (let i = w * h - 1; i >= 0 && !played; i--) {
          if (state.gridClues[i] !== EMPTY || fillOf(state.grid[i]) !== "-") continue;
          state = play(state, {
            kind: "fill",
            x0: i % w,
            y0: Math.floor(i / w),
            x1: i % w,
            y1: Math.floor(i / w),
            from: "-",
            to: isShip(truth.grid[i]) ? "B" : "W",
          });
          played = true;
        }
        if (played) continue;
      }
      const r = hintOf(state);
      expect(r.ok, r.ok ? "" : r.error).toBe(true);
      if (!r.ok) break;
      state = play(state, r.steps[0].move);
    }
    expect(isSolved(state)).toBe(true);
  });

  it("replays at the board's own difficulty, not at the maximum", () => {
    // A hint that replayed at DIFFCOUNT could teach a harder technique than
    // the board needs.
    const easy = hintOf(board(0, "tier-easy"));
    expect(easy.ok).toBe(true);
    if (!easy.ok) return;
    const easyKinds = new Set([
      "given",
      "near",
      "lineShips",
      "total",
      "center",
      "extend",
      "lineWater",
      "isolated",
    ]);
    expect(easy.steps.filter((s) => !easyKinds.has(s.rung))).toEqual([]);
  });
});

describe("boats hint — narration", () => {
  /** Every technique the deduction reaches on generated boards, with the phrase
   * that proves the narration explains *why* rather than only *what*. */
  const REFUTED =
    /^If this square (?:were|held) (?:a |its (?:row|column)'s (?:and (?:row|column)'s )?last )?(?:water|boat segment),/;
  const SATISFIED =
    /(already has the \d+ boat squares? its number allows|already has (?:its|all \d+ of its) boat squares?|takes no boat squares|number is 0|can only be \d+, and it has that many)/;
  const NARRATIONS: [Parameters<typeof pinnedFiring>[0], RegExp][] = [
    ["given", /boat's (top|bottom|left|right) end|one-square boat/],
    ["near", /Boats never touch, not even at a corner/],
    ["lineWater", SATISFIED],
    ["hidden.satisfied", SATISFIED],
    ["lineShips", /needs .* and has .* free square/],
    ["hidden.forced", /hidden number can only be \d+/],
    ["total", /Every square of water .* is already marked/],
    ["center", /middle segment has (outlined water|the board's edge)/],
    ["isolated", /water or the board's edge surrounds this square/],
    ["extend", /shut in on three sides/],
    [
      "centerRoom",
      /no room for a boat running (?:across|up and down) through this middle segment/,
    ],
    ["tooLong", /joins .* into a boat of \d+/],
    ["grow", /unfinished boat can't stop at \d+/],
    ["shortRun", /every \d+-boat is already placed/],
    ["onlyFit", /run[s]? can hold the \d+-boat/],
    ["onlyRuns", /run[s]? can hold the (?:\d+ remaining )?\d+-boats?/],
    ["shared", /has \d+ water left, so an outlined square must be a boat/],
    ["lastWater", REFUTED],
    ["lastShip", REFUTED],
    [
      "centerTrial",
      /^If the boat through this middle segment ran (?:up and down|across),/,
    ],
  ];

  it.each(NARRATIONS)("explains the %s deduction", (kind, phrase) => {
    const { step } = pinnedFiring(kind);
    expect(step.rung).toBe(kind);
    expect(step.explanation, `no step narrated the ${kind} firing`).toMatch(phrase);
  });

  it("states a refutation's rule rather than asserting the square is forced", () => {
    for (const kind of ["lastWater", "lastShip", "centerTrial"] as const) {
      const { step } = pinnedFiring(kind);
      // A "so it is forced" with no named rule is exactly the un-narrated step
      // the spec forbids.
      expect(step.explanation).toMatch(
        /(touching corner to corner|couldn't reach its \d+|more than its \d+ boat squares|more boat squares \(outlined\) than the whole fleet|rest of the fleet would no longer fit|longer than any in the fleet|more \d+-boats \(outlined\) than the fleet has)/,
      );
    }
  });

  it("stripes every line a sentence calls striped", () => {
    // A middle segment's refutation once ringed the breached column while the
    // sentence called it striped. Pinned as the desc the rung fired on, plus a
    // sweep so a second firing site that forgets `line` is caught too.
    const pinned = newState(
      decodeParams("10x12f5dh,5,4,3,2,1"),
      "5,4,4,2,5,2,3,3,0,7,1,4,3,4,4,2,3,2,2,5,0,5,fTdCzwCoTz",
    );
    const boards = [pinned, ...[8, 9, 11].map((p) => board(p, `striped-${p}`))];
    let striped = 0;
    for (const state of boards) {
      const r = hintOf(state);
      if (!r.ok) continue;
      for (const step of r.steps) {
        if (!step.explanation.includes("striped")) continue;
        striped++;
        const line = (step.highlights as BoatsHint | undefined)?.line ?? [];
        expect(line.length, step.explanation).toBeGreaterThan(0);
      }
    }
    expect(striped, "no step called a line striped").toBeGreaterThan(0);
  });

  it("never narrates the never-touch water as a deduction of its own", () => {
    // The water a placement drags along is shown as part of the same step, not
    // explained again — a rule of the game belongs in the help
    // (docs/hints.md § "Rules belong in the help").
    const { step } = pinnedFiring("lineShips");
    expect(step.explanation).toMatch(/needs \d+ /);
    expect(step.explanation).not.toContain("never touch");
  });
});

describe("boats hint — one deduction is one hint", () => {
  it("emits a multi-square firing as one journey, not several hints", () => {
    // A whole-line water fill is the canonical case.
    const { state } = pinnedFiring("lineWater");
    const r = hintOf(state);
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    const opener = r.steps.findIndex((s) => s.continuesPrevious !== true);
    expect(opener).toBeGreaterThanOrEqual(0);
    // Every continuation leg repeats its journey's explanation and highlight,
    // so the picture never shrinks mid-hint.
    for (let i = 1; i < r.steps.length; i++) {
      if (!r.steps[i].continuesPrevious) continue;
      expect(r.steps[i].explanation).toBe(r.steps[i - 1].explanation);
      expect(r.steps[i].highlights).toBe(r.steps[i - 1].highlights);
    }
  });

  it("fills a whole deduced line with a single move where it can", () => {
    const { state, step, index, steps } = pinnedFiring("lineWaterOfSeveral");
    const squares = (step.highlights as BoatsHint).targets;
    expect(squares.length).toBeGreaterThan(1);
    // One move: no continuation leg follows it.
    expect(steps[index + 1]?.continuesPrevious ?? false).toBe(false);

    const move = step.move;
    if (move.kind !== "fill") throw new Error("expected a fill move");
    const { w } = state.params;
    // The board as the firing found it: every earlier step of the plan made.
    let found = state;
    for (const earlier of steps.slice(0, index)) found = play(found, earlier.move);
    // The rectangle covers every square the deduction decides…
    for (const s of squares)
      expect(
        s.x >= move.x0 && s.x <= move.x1 && s.y >= move.y0 && s.y <= move.y1,
        `${s.x},${s.y} outside the move`,
      ).toBe(true);
    // …and nothing else it could change: its other squares were already decided
    // on the board as the firing fired, so a `from: "-"` fill leaves them alone.
    let undecided = 0;
    for (let y = move.y0; y <= move.y1; y++)
      for (let x = move.x0; x <= move.x1; x++)
        if (fillOf(found.grid[y * w + x]) === "-") undecided++;
    expect(undecided).toBe(squares.length);
  });

  it("never asks for a square the step did not claim", () => {
    // A `fill` rectangle sets every still-empty square in its span, so a step
    // whose span reaches past its own targets would silently decide squares the
    // narration never mentioned — and, worse, decide them wrongly.
    let decided = 0;
    for (const [preset] of TIERS) {
      let state = board(preset, `span-${preset}`);
      for (let guard = 0; guard < 40 && !isSolved(state); guard++) {
        const r = hintOf(state);
        if (!r.ok) break;
        const step = r.steps[0];
        const hl = step.highlights as BoatsHint;
        const after = play(state, step.move);
        const { w, h } = state.params;
        for (let i = 0; i < w * h; i++) {
          // Compare *decidedness*, not raw bytes: `executeMove` runs
          // `adjustShips`, which rewrites an existing SHIP_VAGUE into its
          // resolved shape — a change in the byte, not a decision.
          if (fillOf(after.grid[i]) === fillOf(state.grid[i])) continue;
          const t = hl.targets.find((c) => c.y * w + c.x === i);
          expect(
            t,
            `${preset}: changed ${i % w},${Math.floor(i / w)} un-asked`,
          ).toBeDefined();
          expect(isShip(after.grid[i])).toBe(t?.ship);
          decided++;
        }
        state = after;
      }
    }
    // A plan whose moves decided nothing would walk every tier and assert
    // nothing — the comparison is on decidedness, so it is easy to empty.
    expect(decided, "no hinted move decided a square").toBeGreaterThan(0);
  });
});

describe("boats hint — refusals", () => {
  it("counts a solved board as finished, so the midend refuses it", () => {
    const state = board(0, "refuse-solved");
    const solved = boatsGame.solve(state, state);
    expect(solved?.ok).toBe(true);
    if (!solved?.ok) return;
    expect(boatsGame.status(play(state, solved.move))).toBe("solved");
  });

  it("flags a wrong-but-rule-legal placement, so the midend refuses it", () => {
    // The whole point of basing the mistake check on a re-solve: this square
    // breaks no rule yet, so a live rule check would let the hint reason on.
    const state = board(0, "refuse-wrong");
    const truth = solveToGrid(state);
    expect(truth.ok).toBe(true);
    if (!truth.ok) return;

    const { w, h } = state.params;
    let wrong: BoatsState | null = null;
    for (let i = 0; i < w * h && !wrong; i++) {
      if (state.gridClues[i] !== EMPTY || isShip(truth.grid[i])) continue;
      const candidate = play(state, {
        kind: "fill",
        x0: i % w,
        y0: Math.floor(i / w),
        x1: i % w,
        y1: Math.floor(i / w),
        from: "-",
        to: "B",
      });
      // Keep only a placement the live rules still accept.
      if (validateFullState(boardOf(candidate)) !== STATUS_INVALID) wrong = candidate;
    }
    expect(wrong).not.toBeNull();
    if (!wrong) return;

    expect(boatsGame.findMistakes?.(wrong).length ?? 0).toBeGreaterThan(0);
  });

  it("refuses when no deduction is available", () => {
    // Reachable only from a hand-written game id, since every generated board is
    // solver-gated: here every occupancy number is hidden and no segment given,
    // so the clues determine nothing at all.
    const p = { ...presetParams(0), strip: true };
    const blank = newState(p, "-,".repeat(p.w + p.h));
    const r = hintOf(blank);
    expect(r.ok).toBe(false);
    // The constant, not a substring of it: a regex over a message is a second,
    // weaker statement of what the message is, and goes stale when the wording
    // changes.
    if (!r.ok) expect(r.error).toBe(DEDUCTION_EXHAUSTED);
  });
});

describe("boats hint — keeping track", () => {
  it("advances only when every square the step marks is placed", () => {
    const state = board(4, "track");
    const r = hintOf(state);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const step = r.steps[0];
    const hl = step.highlights as BoatsHint;
    if (step.move.kind !== "fill") throw new Error("expected a fill move");
    const leg = step.move;
    const legTargets = hl.targets.filter(
      (t) =>
        t.x >= leg.x0 &&
        t.x <= leg.x1 &&
        t.y >= leg.y0 &&
        t.y <= leg.y1 &&
        t.ship === (leg.to === "B"),
    );
    expect(legTargets.length).toBeGreaterThan(0);

    // The step's own move finishes the leg it belongs to.
    expect(boatsGame.hint.keepTrack(leg, step, state)).toBe("completed");

    const one = legTargets[0];
    const single = (to: "B" | "W"): BoatsMove => ({
      kind: "fill",
      x0: one.x,
      y0: one.y,
      x1: one.x,
      y1: one.y,
      from: "-",
      to,
    });

    if (legTargets.length > 1)
      expect(boatsGame.hint.keepTrack(single(one.ship ? "B" : "W"), step, state)).toBe(
        "onTrack",
      );

    // Setting one of the leg's squares to the opposite is off-plan.
    expect(boatsGame.hint.keepTrack(single(one.ship ? "W" : "B"), step, state)).toBe(
      "off",
    );
  });

  it("completes a journey leg by leg, so the plan actually advances", () => {
    // The failure this guards: judging a leg against the whole journey's
    // squares means leg 1 never completes, the midend never advances, and
    // auto-play re-applies the same leg for ever.
    const { state } = pinnedFiring("lineShips");
    const r = hintOf(state);
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    let at = state;
    for (const step of r.steps) {
      const verdict = boatsGame.hint.keepTrack(step.move, step, at);
      expect(verdict).toBe("completed");
      at = play(at, step.move);
      if (step === r.steps[1]) break;
    }
  });
});

/** Palette-index probe: a `rect`/`line`/`text` op carries `color`, a
 * `polygon`/`circle` op carries `fill`/`outline`. */
function usesColor(ops: readonly DrawOp[], index: number): boolean {
  return ops.some(
    (o) =>
      ("color" in o && o.color === index) ||
      ("fill" in o && o.fill === index) ||
      ("outline" in o && o.outline === index),
  );
}

const pinned = describeHintKindPins({
  game: boatsGame,
  params: TIERS.map(([preset]) => presetParams(preset)),
  kinds: {
    evidence: (step) => (step.highlights as BoatsHint).evidence.length > 0,
  },
  pins: {
    /** Held on 1152 of 1834 positions walked. */
    evidence: "6x6f3de,3,2,1:2,2,1,1,0,4,1,1,3,1,3,1,WaWWgTLqWaW",
  },
});

describe("boats hint — rendering", () => {
  function frame(preset: number, showHint: boolean) {
    const p = presetParams(preset);
    const desc = newBoatsDesc(p, randomNew(`render-${preset}`)).desc;
    return renderScenario({
      game: boatsGame,
      id: `${encodeParams(p, true)}:${desc}`,
      showHint,
    });
  }

  it.each(TIERS)("rings the %s hint's targets, with the action inside", (preset) => {
    const result = frame(preset, true);
    const hl = result.hint?.highlights as BoatsHint | undefined;
    const targets = hl?.targets.length ?? 0;
    expect(targets).toBeGreaterThan(0);
    expectRing(result.recording.ops, { rings: targets });
    // Inside each ring, the action in the game's own vocabulary — a segment
    // for a boat, the water tildes for water — in the ring's ink.
    const [ring] = ringsOf(result.recording.ops);
    expect(
      result.recording.ops.filter(
        (o) => o.op !== "ring" && "color" in o && o.color === ring.color,
      ).length,
    ).toBeGreaterThanOrEqual(targets);
  });

  it("shades or rings the evidence the deduction reasons over", () => {
    // `allWaterPlaced` is the one honestly-global technique and declares none,
    // so the frame is a step that carries some.
    const result = renderPinnedHint(boatsGame, pinned("evidence"));
    expect(usesColor(result.recording.ops, COL_HINT_OUTLINE)).toBe(true);
  });

  it.each([
    "lineShips",
    "lineWater",
    "centerRoom",
  ] as const)("%s hatches the line it names, with its number, and outlines no line", (kind) => {
    const { step, state } = pinnedFiring(kind);
    const w = state.params.w;
    const h = state.params.h;
    // The line is one whole row or column.
    const { line, evidence } = step.highlights as BoatsHint;
    const isColumn = line.every((c) => c.x === line[0].x);
    expect(line).toHaveLength(isColumn ? h : w);
    // Any outline is a particular square, never the line again.
    expect(evidence.length).toBeLessThan(2);

    // Drawn from the step itself, as the player would see it.
    const ts = 32;
    const recording = new RecordingDrawing(boatsGame.colors(DEFAULT_BACKGROUND));
    boatsGame.redraw(
      recording,
      boatsGame.newDrawState(state, ts),
      null,
      state,
      0,
      boatsGame.newUi(state),
      0,
      NO_FLASH,
      step,
    );
    const hatches = opsOfKind(recording.ops, "hatch");
    // Every square of the line, and its number's slot when it has one.
    const slot = isColumn ? line[0].x : w + line[0].y;
    const numbered = state.borderClues[slot] !== NO_CLUE;
    expect(hatches).toHaveLength(line.length + (numbered ? 1 : 0));
  });

  it("paints no hint color at all when no hint is displayed", () => {
    const result = frame(0, false);
    expect(ringsOf(result.recording.ops)).toEqual([]);
    expect(usesColor(result.recording.ops, COL_HINT_OUTLINE)).toBe(false);
  });

  it("matches the recorded hint frame", () => {
    expect(frame(0, true).recording.ops).toMatchSnapshot();
  });
});

/** Guards the two placement marks stay distinct — a single color standing for
 * "place a boat" and "place water" would read as one action
 * (docs/hints-marks.md § "Echo the move's shape in the hint color"). */
describe("boats hint — the two move shapes", () => {
  it("carries both placement shapes on the step that forces both", () => {
    // A line filled with boats drags its never-touch water along, so one step
    // routinely asks for both actions — and each must be marked as itself.
    const { step } = pinnedFiring("lineShips");
    const hl = step.highlights as BoatsHint;
    expect(hl.targets.some((t) => t.ship)).toBe(true);
    expect(hl.targets.some((t) => !t.ship)).toBe(true);
  });
});

// The walks' boards never meet a hidden number ("Remove numbers" is not a
// preset the walks deal), or a fleet with nothing left to find; their clauses
// are rendered directly, so a change to their words or slots shows.
describe("boats hint — the wordings no walk reaches", () => {
  const at = (c: number): Point => ({ x: c % 4, y: (c / 4) | 0 });
  const words = (
    clauses: Clauses,
    terms: Record<string, number | boolean>,
    ships: number[] = [],
    waters: number[] = [],
  ): string =>
    statedSentence(clauses, {
      kind: CELL,
      at,
      ring: [...ships, ...waters].map(at),
      placing: (n) => (n === 1 ? ships : waters).map(at),
      consequences: [],
      marks: { outline: [at(1), at(2)], stripes: [at(4), at(5), at(6), at(7)] },
      terms,
      value: String,
      unit: () => "row",
    }).text;

  it("says a hidden number, and what it leaves", () => {
    const satisfied = STATED["hidden.satisfied"].step;
    expect(words(satisfied[0], { number: 0 }, [], [4, 5])).toBe(
      "This row's hidden number can only be 0, so every square in it must be water.",
    );
    expect(words(satisfied[1], { number: 2 }, [], [4, 5])).toBe(
      "This row's hidden number can only be 2, and it has that many boat squares, so its other squares must be water.",
    );
    const forced = STATED["hidden.forced"].step;
    expect(words(forced[0], { number: 1, left: 1 }, [5])).toBe(
      "This row's hidden number can only be 1, so it needs one more: its one free square must hold a boat segment.",
    );
    expect(words(forced[1], { number: 3, left: 2 }, [4, 5])).toBe(
      "This row's hidden number can only be 3, so it needs 2 more: all 2 of its free squares must hold boat segments.",
    );
  });

  it("says where a hidden number is the line's reason, and a middle one fills its crossing line", () => {
    const shared = STATED.shared.step;
    const t = { number: 2, room: 1, horizontal: true };
    expect(words(shared[0], t, [], [5])).toContain(
      "hidden number can only be 2. This row has 1 water left",
    );
    expect(words(shared[0], t, [], [5])).toContain("fills its column if central");
    expect(words(shared[1], t, [], [5])).toContain(
      "hidden number can only be 2. This row has 1 water left",
    );
    expect(words(shared[1], t, [], [5])).not.toContain("central");
  });

  it("says a square water once every boat is found, with the segments it is beside", () => {
    const tooLong = STATED.tooLong.step;
    expect(words(tooLong[0], { joined: 3, largest: 0 }, [], [5])).toBe(
      "Every boat in the fleet has been found, so this square, beside the outlined segments, must be water.",
    );
    expect(words(tooLong[1], { joined: 3, largest: 0 }, [], [5])).toBe(
      "Every boat in the fleet has been found, so this square must be water.",
    );
  });
});

// A walk's boards rarely meet a long trial with both lines filled, a middle
// segment's trial, or every rule a trial may break.
describe("boats hint — the trials' wordings no walk reaches", () => {
  const at = (c: number): Point => ({ x: c % 4, y: (c / 4) | 0 });
  // Each break's flag (the last, `extra`, has none) and its terms.
  const none = {
    brokeTouching: false,
    brokeLineCount: false,
    brokeFleetCount: false,
    brokeOverlong: false,
    corner: [1, 6],
    line: [4, 5, 6, 7],
    across: true,
    over: false,
    reach: 0,
    many: false,
    afloat: [1, 2],
    long: [1, 2],
    size: 2,
    sized: [1, 2],
  };
  const trial = (
    id: "lastWater" | "lastShip" | "centerTrial",
    terms: Record<string, number | boolean>,
    ring: number[],
  ): string =>
    statedSentence(STATED[id].step[0], {
      kind: CELL,
      at,
      ring: ring.map(at),
      placing: () => ring.map(at),
      consequences: [],
      marks: { outline: [at(1), at(2)], stripes: [] },
      terms: { ...none, ...terms },
      value: String,
      unit: () => "row",
    }).text;
  const line = { horizontal: true, crossing: true };
  const count = { brokeLineCount: true, reach: 3 };

  // Both lines' words ("its row's and column's last") are the longest wording:
  // a boat's short move leaves room for them with a count, a water's does not,
  // and a sentence takes the line's, or neither, as its length allows.
  it("names the line's last water or boat where the sentence stays short", () => {
    expect(trial("lastWater", { ...line, ship: false, ...count }, [5])).toBe(
      "If this square were its row's last water, the striped row couldn't reach its 3, so it must hold a boat segment.",
    );
    expect(
      trial("lastWater", { ...line, horizontal: false, ship: false, ...count }, [5]),
    ).toContain("its column's last water");
    expect(trial("lastShip", { ...line, ship: true, ...count }, [5])).toBe(
      "If this square held its row's and column's last boat segment, the striped row couldn't reach its 3, so it must be water.",
    );
  });

  it("says the last wording, whatever its length, when none fits", () => {
    const said = trial(
      "lastWater",
      { ...line, ship: false, brokeFleetCount: true, many: false },
      [5],
    );
    expect(said).toBe(
      "If this square were water, the rest of the fleet would no longer fit beside these boats (outlined), so it must hold a boat segment.",
    );
    expect(said.length).toBeGreaterThan(NARRATION_LIMIT);
  });

  it("says each rule a trial may break", () => {
    const said = (terms: Record<string, number | boolean>): string =>
      trial("lastShip", { ...line, ship: true, ...terms }, [5]);
    expect(said({ brokeTouching: true })).toContain(
      ", two boats would end up touching corner to corner (outlined), so",
    );
    expect(said({ ...count, over: true, across: false })).toContain(
      ", the striped column would have more than its 3 boat squares, so",
    );
    expect(said({ brokeFleetCount: true, many: true })).toContain(
      ", there would be more boat squares (outlined) than the whole fleet has, so",
    );
    expect(said({ brokeOverlong: true })).toContain(
      ", the outlined boat would be longer than any in the fleet, so",
    );
    expect(said({})).toContain(
      ", there would be more 2-boats (outlined) than the fleet has, so",
    );
  });

  it("says a middle segment's trial, up and down or across", () => {
    expect(trial("centerTrial", { center: 1, vertical: true, ...count }, [5])).toBe(
      "If the boat through this middle segment ran up and down, the striped row couldn't reach its 3, so the ringed square must be water.",
    );
    expect(
      trial("centerTrial", { center: 1, vertical: true, ...count }, [5, 9]),
    ).toContain(", so the squares above and below it must be water.");
    expect(
      trial(
        "centerTrial",
        { center: 1, vertical: false, brokeFleetCount: true, many: true },
        [5, 7],
      ),
    ).toBe(
      "If the boat through this middle segment ran across, there would be more boat squares (outlined) than the whole fleet has, so the squares either side of it must be water.",
    );
  });
});

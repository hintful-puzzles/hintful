/**
 * Group hint tests: the recorded deductions, the plan the hint builds, its
 * refusals, and the keep-track verdicts.
 *
 * The cross-game guards (`hint-resume` / `hint-quality` / `hint-overlay`) already
 * cover convergence, purity, narration form and overlay-reaches-cache once Group
 * is enrolled in `hint-games.ts`; this file covers the Group-specific techniques
 * — the associativity placement, the identity-row/column fill journey, and the
 * identity-hidden identity-mark elimination — which the shared first-leaf preset
 * (6×6 Normal, identity shown) never exercises.
 */

import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import {
  describeHintKindPins,
  describeHintPins,
} from "../../engine/testing/hint-positions.ts";
import { groupGame } from "./index.ts";
import { type HintReason, recordGroupDeductions } from "./solver.ts";
import {
  DIFF_EXTREME,
  type GroupMove,
  type GroupParams,
  type GroupState,
  newState,
  newUi,
} from "./state.ts";

const NORMAL: GroupParams = { w: 6, diff: 1, id: true };
const HARD_HIDDEN: GroupParams = { w: 8, diff: 2, id: false };

function board(p: GroupParams, seed: string): GroupState {
  const { desc } = groupGame.newDesc(p, randomNew(seed));
  return newState(p, desc);
}

/** Walk hints from `state`, applying each plan's first step, collecting the
 * narrations seen and whether the board reached solved. */
function walk(
  p: GroupParams,
  seed: string,
): { texts: string[]; solved: boolean; states: GroupState[] } {
  let state = board(p, seed);
  const texts: string[] = [];
  const states: GroupState[] = [state];
  for (let i = 0; i < 500 && groupGame.status(state) === "ongoing"; i++) {
    const res = groupGame.hint?.(state, undefined);
    if (!res?.ok) break;
    for (const s of res.steps) texts.push(s.explanation);
    state = groupGame.executeMove(state, res.steps[0].move);
    states.push(state);
  }
  return { texts, solved: groupGame.status(state) === "solved", states };
}

/**
 * Every rung on a position whose plan speaks it, and the steps the narration
 * and keep-track tests below are asserted on. A plan is asked under one reading
 * of the note-less cells, and `populate` and `note` are each spoken under one
 * of the two, so the boards are split between them by how many givens a board
 * has.
 */
const pinned = describeHintPins({
  game: groupGame,
  // The 8x8 at the tier above the presets' is where a forcing chain is met.
  params: [NORMAL, HARD_HIDDEN, { w: 8, diff: 3, id: false }],
  seeds: 30,
  ui: (state) => ({
    ...newUi(state),
    candidateReading:
      state.immutable.filter((g) => g !== 0).length % 2 === 0 ? "implicit" : "populate",
  }),
  kinds: {
    placement: (step) => (step.move as GroupMove).type === "set",
    // A strike whose first mark the board still shows.
    liveStrike: (step, state) => {
      const mv = step.move as GroupMove;
      if (mv.type !== "pencilStrike") return false;
      const k = mv.marks[0];
      return (state.pencil[k.y * state.w + k.x] & (1 << k.n)) !== 0;
    },
  },
  pins: {
    /** Held on 4034 of 5651 positions walked. */
    placement: "6dn:1_2_3_4_5_6_2e3b6b4d2_5a4b1_6e",
    /** Held on 514 of 5651 positions walked. */
    liveStrike: {
      id: "8dhi:a7a2a8b4p1e2m3q6",
      moves:
        '[{"type":"set","cells":[{"x":0,"y":6}],"n":2},{"type":"set","cells":[{"x":7,"y":1}],"n":7},{"type":"set","cells":[{"x":6,"y":1}],"n":1},{"type":"set","cells":[{"x":5,"y":3}],"n":7},{"type":"pencilAdd","marks":[{"x":0,"y":0,"n":1},{"x":0,"y":0,"n":3},{"x":0,"y":0,"n":5},{"x":0,"y":0,"n":6}]},{"type":"pencilAdd","marks":[{"x":0,"y":2,"n":1},{"x":0,"y":2,"n":3},{"x":0,"y":2,"n":5},{"x":0,"y":2,"n":6},{"x":0,"y":2,"n":7},{"x":0,"y":2,"n":8}]},{"type":"pencilAdd","marks":[{"x":2,"y":0,"n":1},{"x":2,"y":0,"n":3},{"x":2,"y":0,"n":4},{"x":2,"y":0,"n":5},{"x":2,"y":0,"n":6}]},{"type":"pencilAdd","marks":[{"x":0,"y":4,"n":1},{"x":0,"y":4,"n":3},{"x":0,"y":4,"n":5},{"x":0,"y":4,"n":6},{"x":0,"y":4,"n":7},{"x":0,"y":4,"n":8}]},{"type":"pencilAdd","marks":[{"x":4,"y":0,"n":1},{"x":4,"y":0,"n":3},{"x":4,"y":0,"n":4},{"x":4,"y":0,"n":5},{"x":4,"y":0,"n":6}]},{"type":"pencilAdd","marks":[{"x":0,"y":5,"n":1},{"x":0,"y":5,"n":5},{"x":0,"y":5,"n":6},{"x":0,"y":5,"n":7},{"x":0,"y":5,"n":8}]},{"type":"pencilAdd","marks":[{"x":0,"y":7,"n":1},{"x":0,"y":7,"n":3},{"x":0,"y":7,"n":5},{"x":0,"y":7,"n":7},{"x":0,"y":7,"n":8}]}]',
    },
    /** Held on 228 of 5651 positions walked. */
    populate: "6dxi:a5b6w4_1_2e",
    /** Held on 892 of 5651 positions walked. */
    clean: { id: "6dxi:a5b6w4_1_2e", moves: [{ type: "pencilAll" }] },
    /** Held on 1357 of 5651 positions walked. */
    note: {
      id: "8dhi:j1_8e1f6o4_5c7m2d",
      moves: [{ type: "set", cells: [{ x: 2, y: 4 }], n: 4 }],
    },
    /** Held on 4929 of 5651 positions walked. */
    dup: "8dhi:i1_6d7e2c5_8c6z7d2a",
    /** Held on 4827 of 5651 positions walked. */
    single: {
      id: "6dxi:p4a6b1d4a6g",
      moves:
        '[{"type":"set","cells":[{"x":3,"y":0}],"n":6},{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":6},{"x":1,"y":0,"n":6},{"x":2,"y":0,"n":4},{"x":2,"y":0,"n":6},{"x":4,"y":0,"n":4},{"x":4,"y":0,"n":6},{"x":5,"y":0,"n":6},{"x":0,"y":1,"n":6},{"x":2,"y":1,"n":4},{"x":3,"y":1,"n":1},{"x":3,"y":1,"n":6},{"x":4,"y":1,"n":4},{"x":4,"y":1,"n":6},{"x":0,"y":2,"n":4},{"x":0,"y":2,"n":6},{"x":1,"y":2,"n":4},{"x":2,"y":2,"n":4},{"x":3,"y":2,"n":1},{"x":3,"y":2,"n":4},{"x":3,"y":2,"n":6},{"x":5,"y":2,"n":4},{"x":1,"y":3,"n":1},{"x":1,"y":3,"n":6},{"x":2,"y":3,"n":1},{"x":2,"y":3,"n":4},{"x":2,"y":3,"n":6},{"x":4,"y":3,"n":1},{"x":4,"y":3,"n":4},{"x":4,"y":3,"n":6},{"x":5,"y":3,"n":1},{"x":5,"y":3,"n":6},{"x":0,"y":4,"n":4},{"x":0,"y":4,"n":6},{"x":1,"y":4,"n":4},{"x":1,"y":4,"n":6},{"x":3,"y":4,"n":1},{"x":3,"y":4,"n":4},{"x":3,"y":4,"n":6},{"x":5,"y":4,"n":4},{"x":5,"y":4,"n":6},{"x":0,"y":5,"n":6},{"x":2,"y":5,"n":4},{"x":3,"y":5,"n":1},{"x":3,"y":5,"n":6},{"x":4,"y":5,"n":4},{"x":4,"y":5,"n":6}]},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":1},{"x":0,"y":1,"n":2},{"x":1,"y":0,"n":2},{"x":0,"y":2,"n":3},{"x":2,"y":0,"n":3},{"x":0,"y":4,"n":5},{"x":4,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":1},{"x":0,"y":2,"n":1},{"x":2,"y":1,"n":2},{"x":1,"y":2,"n":2},{"x":2,"y":2,"n":3},{"x":2,"y":5,"n":6},{"x":5,"y":2,"n":6}]},{"type":"pencilStrike","marks":[{"x":3,"y":1,"n":2},{"x":1,"y":3,"n":2},{"x":3,"y":2,"n":3},{"x":2,"y":3,"n":3},{"x":3,"y":4,"n":5},{"x":4,"y":3,"n":5}]},{"type":"pencilStrike","marks":[{"x":4,"y":0,"n":1},{"x":0,"y":4,"n":1},{"x":4,"y":1,"n":2},{"x":1,"y":4,"n":2}]},{"type":"pencilStrike","marks":[{"x":1,"y":2,"n":5},{"x":2,"y":2,"n":2},{"x":2,"y":2,"n":5},{"x":5,"y":2,"n":2},{"x":5,"y":2,"n":5}]},{"type":"pencilStrike","marks":[{"x":1,"y":4,"n":3},{"x":5,"y":4,"n":2},{"x":5,"y":4,"n":3}]},{"type":"pencilStrike","marks":[{"x":2,"y":1,"n":5},{"x":2,"y":5,"n":2},{"x":2,"y":5,"n":5}]},{"type":"pencilStrike","marks":[{"x":4,"y":1,"n":3},{"x":4,"y":5,"n":2},{"x":4,"y":5,"n":3}]},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":1},{"x":1,"y":2,"n":1},{"x":1,"y":5,"n":1},{"x":5,"y":1,"n":1},{"x":5,"y":2,"n":1},{"x":5,"y":5,"n":1}]}]',
    },
    /** Held on 2368 of 5651 positions walked. */
    regionsFull: "6dn:1_2_3_4_5_6_2e3e4b5_3a5e6d2",
    /** Held on 5282 of 5651 positions walked. */
    hiddenSingle: "6dn:1_2_3_4_5_6_2e3_1d4_6d5b3b6_5d",
    /** Held on 1199 of 5651 positions walked. */
    set: {
      id: "6dxi:a5b6w4_1_2e",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":2},{"x":0,"y":0,"n":5},{"x":0,"y":0,"n":6},{"x":2,"y":0,"n":5},{"x":2,"y":0,"n":6},{"x":3,"y":0,"n":5},{"x":3,"y":0,"n":6},{"x":5,"y":0,"n":1},{"x":5,"y":0,"n":5},{"x":5,"y":0,"n":6},{"x":0,"y":1,"n":2},{"x":1,"y":1,"n":5},{"x":4,"y":1,"n":4},{"x":4,"y":1,"n":6},{"x":5,"y":1,"n":1},{"x":0,"y":2,"n":2},{"x":1,"y":2,"n":5},{"x":4,"y":2,"n":4},{"x":4,"y":2,"n":6},{"x":5,"y":2,"n":1},{"x":0,"y":3,"n":2},{"x":1,"y":3,"n":5},{"x":4,"y":3,"n":4},{"x":4,"y":3,"n":6},{"x":5,"y":3,"n":1},{"x":0,"y":4,"n":1},{"x":0,"y":4,"n":2},{"x":0,"y":4,"n":4},{"x":1,"y":4,"n":1},{"x":1,"y":4,"n":4},{"x":1,"y":4,"n":5},{"x":2,"y":4,"n":1},{"x":2,"y":4,"n":4},{"x":3,"y":4,"n":1},{"x":3,"y":4,"n":4},{"x":1,"y":5,"n":2},{"x":1,"y":5,"n":5},{"x":2,"y":5,"n":2},{"x":3,"y":5,"n":2},{"x":4,"y":5,"n":2},{"x":4,"y":5,"n":4},{"x":4,"y":5,"n":6},{"x":5,"y":5,"n":1},{"x":5,"y":5,"n":2}]},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":1},{"x":0,"y":2,"n":3},{"x":2,"y":0,"n":3},{"x":0,"y":3,"n":4},{"x":3,"y":0,"n":4},{"x":0,"y":4,"n":5}]},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":1},{"x":1,"y":1,"n":2},{"x":1,"y":2,"n":3},{"x":2,"y":1,"n":3},{"x":1,"y":3,"n":4},{"x":3,"y":1,"n":4},{"x":4,"y":1,"n":5},{"x":1,"y":5,"n":6},{"x":5,"y":1,"n":6}]},{"type":"pencilStrike","marks":[{"x":4,"y":1,"n":2},{"x":1,"y":4,"n":2},{"x":4,"y":2,"n":3},{"x":2,"y":4,"n":3}]},{"type":"pencilStrike","marks":[{"x":5,"y":1,"n":2},{"x":5,"y":2,"n":3},{"x":2,"y":5,"n":3},{"x":5,"y":3,"n":4},{"x":3,"y":5,"n":4},{"x":4,"y":5,"n":5},{"x":5,"y":5,"n":6}]}]',
    },
    /** Held on 33 of 5651 positions walked. */
    forcing: {
      id: "8dxi:8b7n5b2r3l8h6a",
      moves:
        '[{"type":"set","cells":[{"x":0,"y":1}],"n":5},{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":7},{"x":1,"y":0,"n":8},{"x":2,"y":0,"n":5},{"x":2,"y":0,"n":7},{"x":2,"y":0,"n":8},{"x":4,"y":0,"n":7},{"x":4,"y":0,"n":8},{"x":5,"y":0,"n":2},{"x":5,"y":0,"n":7},{"x":5,"y":0,"n":8},{"x":6,"y":0,"n":6},{"x":6,"y":0,"n":7},{"x":6,"y":0,"n":8},{"x":7,"y":0,"n":7},{"x":7,"y":0,"n":8},{"x":1,"y":1,"n":5},{"x":2,"y":1,"n":5},{"x":3,"y":1,"n":5},{"x":3,"y":1,"n":7},{"x":4,"y":1,"n":5},{"x":5,"y":1,"n":2},{"x":5,"y":1,"n":5},{"x":5,"y":1,"n":8},{"x":6,"y":1,"n":5},{"x":6,"y":1,"n":6},{"x":7,"y":1,"n":5},{"x":0,"y":2,"n":2},{"x":0,"y":2,"n":3},{"x":0,"y":2,"n":5},{"x":0,"y":2,"n":8},{"x":1,"y":2,"n":2},{"x":1,"y":2,"n":5},{"x":3,"y":2,"n":2},{"x":3,"y":2,"n":5},{"x":3,"y":2,"n":7},{"x":4,"y":2,"n":2},{"x":4,"y":2,"n":5},{"x":6,"y":2,"n":2},{"x":6,"y":2,"n":5},{"x":6,"y":2,"n":6},{"x":7,"y":2,"n":2},{"x":7,"y":2,"n":5},{"x":0,"y":3,"n":3},{"x":0,"y":3,"n":5},{"x":0,"y":3,"n":8},{"x":2,"y":3,"n":5},{"x":3,"y":3,"n":7},{"x":5,"y":3,"n":2},{"x":5,"y":3,"n":8},{"x":6,"y":3,"n":6},{"x":0,"y":4,"n":3},{"x":0,"y":4,"n":5},{"x":0,"y":4,"n":8},{"x":2,"y":4,"n":5},{"x":3,"y":4,"n":7},{"x":5,"y":4,"n":2},{"x":5,"y":4,"n":8},{"x":6,"y":4,"n":6},{"x":1,"y":5,"n":3},{"x":2,"y":5,"n":3},{"x":2,"y":5,"n":5},{"x":3,"y":5,"n":3},{"x":3,"y":5,"n":7},{"x":4,"y":5,"n":3},{"x":5,"y":5,"n":2},{"x":5,"y":5,"n":3},{"x":5,"y":5,"n":8},{"x":6,"y":5,"n":3},{"x":6,"y":5,"n":6},{"x":7,"y":5,"n":3},{"x":0,"y":6,"n":3},{"x":0,"y":6,"n":5},{"x":0,"y":6,"n":8},{"x":1,"y":6,"n":8},{"x":2,"y":6,"n":5},{"x":2,"y":6,"n":8},{"x":3,"y":6,"n":7},{"x":3,"y":6,"n":8},{"x":4,"y":6,"n":8},{"x":6,"y":6,"n":6},{"x":6,"y":6,"n":8},{"x":7,"y":6,"n":8},{"x":0,"y":7,"n":3},{"x":0,"y":7,"n":5},{"x":0,"y":7,"n":6},{"x":0,"y":7,"n":8},{"x":1,"y":7,"n":6},{"x":2,"y":7,"n":5},{"x":2,"y":7,"n":6},{"x":3,"y":7,"n":6},{"x":3,"y":7,"n":7},{"x":4,"y":7,"n":6},{"x":5,"y":7,"n":2},{"x":5,"y":7,"n":6},{"x":5,"y":7,"n":8},{"x":7,"y":7,"n":6}]},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":2},{"x":2,"y":0,"n":3},{"x":0,"y":3,"n":4},{"x":4,"y":0,"n":5},{"x":5,"y":0,"n":6},{"x":0,"y":6,"n":7}]},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":1},{"x":1,"y":1,"n":2},{"x":1,"y":2,"n":3},{"x":2,"y":1,"n":3},{"x":1,"y":3,"n":4},{"x":3,"y":1,"n":4},{"x":1,"y":4,"n":5},{"x":1,"y":5,"n":6},{"x":5,"y":1,"n":6},{"x":1,"y":6,"n":7},{"x":6,"y":1,"n":7},{"x":1,"y":7,"n":8},{"x":7,"y":1,"n":8}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":1},{"x":0,"y":2,"n":1},{"x":2,"y":1,"n":2},{"x":2,"y":3,"n":4},{"x":3,"y":2,"n":4},{"x":2,"y":5,"n":6},{"x":2,"y":6,"n":7},{"x":6,"y":2,"n":7},{"x":2,"y":7,"n":8},{"x":7,"y":2,"n":8}]},{"type":"pencilStrike","marks":[{"x":0,"y":3,"n":1},{"x":3,"y":1,"n":2},{"x":1,"y":3,"n":2},{"x":3,"y":2,"n":3},{"x":2,"y":3,"n":3},{"x":3,"y":3,"n":4},{"x":3,"y":4,"n":5},{"x":4,"y":3,"n":5},{"x":3,"y":5,"n":6},{"x":5,"y":3,"n":6},{"x":6,"y":3,"n":7},{"x":3,"y":7,"n":8},{"x":7,"y":3,"n":8}]},{"type":"pencilStrike","marks":[{"x":5,"y":0,"n":1},{"x":1,"y":5,"n":2},{"x":5,"y":3,"n":4},{"x":3,"y":5,"n":4},{"x":5,"y":4,"n":5},{"x":4,"y":5,"n":5},{"x":5,"y":5,"n":6},{"x":6,"y":5,"n":7},{"x":7,"y":5,"n":8}]},{"type":"set","cells":[{"x":5,"y":4}],"n":6},{"type":"set","cells":[{"x":1,"y":2}],"n":6},{"type":"set","cells":[{"x":4,"y":2}],"n":3},{"type":"set","cells":[{"x":1,"y":4}],"n":2},{"type":"set","cells":[{"x":2,"y":4}],"n":3},{"type":"set","cells":[{"x":4,"y":4}],"n":5},{"type":"set","cells":[{"x":4,"y":0}],"n":1},{"type":"set","cells":[{"x":4,"y":7}],"n":8},{"type":"set","cells":[{"x":0,"y":4}],"n":1},{"type":"set","cells":[{"x":7,"y":1}],"n":1},{"type":"set","cells":[{"x":7,"y":4}],"n":8},{"type":"set","cells":[{"x":6,"y":4}],"n":7},{"type":"set","cells":[{"x":3,"y":4}],"n":4},{"type":"set","cells":[{"x":6,"y":1}],"n":4},{"type":"set","cells":[{"x":5,"y":3}],"n":1},{"type":"set","cells":[{"x":2,"y":3}],"n":8},{"type":"set","cells":[{"x":1,"y":7}],"n":1},{"type":"set","cells":[{"x":1,"y":0}],"n":5},{"type":"set","cells":[{"x":4,"y":1}],"n":2},{"type":"set","cells":[{"x":4,"y":5}],"n":6},{"type":"set","cells":[{"x":4,"y":3}],"n":4},{"type":"set","cells":[{"x":4,"y":6}],"n":7},{"type":"set","cells":[{"x":2,"y":7}],"n":4},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":4},{"x":5,"y":0,"n":5},{"x":6,"y":0,"n":1},{"x":6,"y":0,"n":4},{"x":6,"y":0,"n":5},{"x":7,"y":0,"n":1},{"x":7,"y":0,"n":5},{"x":1,"y":1,"n":1},{"x":1,"y":1,"n":4},{"x":1,"y":1,"n":6},{"x":2,"y":1,"n":1},{"x":2,"y":1,"n":4},{"x":2,"y":1,"n":8},{"x":3,"y":1,"n":1},{"x":5,"y":1,"n":1},{"x":5,"y":1,"n":4},{"x":0,"y":2,"n":6},{"x":3,"y":2,"n":6},{"x":6,"y":2,"n":3},{"x":6,"y":2,"n":4},{"x":7,"y":2,"n":1},{"x":7,"y":2,"n":3},{"x":7,"y":2,"n":6},{"x":1,"y":3,"n":1},{"x":1,"y":3,"n":5},{"x":1,"y":3,"n":6},{"x":1,"y":3,"n":8},{"x":3,"y":3,"n":1},{"x":3,"y":3,"n":8},{"x":6,"y":3,"n":1},{"x":6,"y":3,"n":4},{"x":6,"y":3,"n":8},{"x":7,"y":3,"n":1},{"x":7,"y":3,"n":4},{"x":1,"y":5,"n":1},{"x":1,"y":5,"n":5},{"x":2,"y":5,"n":4},{"x":2,"y":5,"n":8},{"x":5,"y":5,"n":1},{"x":6,"y":5,"n":4},{"x":7,"y":5,"n":1},{"x":7,"y":5,"n":6},{"x":0,"y":6,"n":1},{"x":1,"y":6,"n":1},{"x":1,"y":6,"n":2},{"x":1,"y":6,"n":5},{"x":1,"y":6,"n":6},{"x":2,"y":6,"n":3},{"x":2,"y":6,"n":4},{"x":3,"y":6,"n":4},{"x":6,"y":6,"n":4},{"x":6,"y":6,"n":7},{"x":7,"y":6,"n":1},{"x":7,"y":6,"n":7},{"x":0,"y":7,"n":1},{"x":0,"y":7,"n":4},{"x":3,"y":7,"n":1},{"x":3,"y":7,"n":4},{"x":5,"y":7,"n":1},{"x":5,"y":7,"n":4},{"x":7,"y":7,"n":1},{"x":7,"y":7,"n":4},{"x":7,"y":7,"n":8}]}]',
    },
    /** Held on 4696 of 5651 positions walked. */
    associativity: "6dn:1_2_3_4_5_6_2e3b6b4d2_5a4b1_6e",
    /** Held on 2158 of 5651 positions walked. */
    identityFill: {
      id: "6dxi:2m4b1h1b4f",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":2},{"x":2,"y":0,"n":1},{"x":2,"y":0,"n":2},{"x":2,"y":0,"n":4},{"x":3,"y":0,"n":2},{"x":4,"y":0,"n":2},{"x":5,"y":0,"n":1},{"x":5,"y":0,"n":2},{"x":5,"y":0,"n":4},{"x":0,"y":1,"n":2},{"x":2,"y":1,"n":1},{"x":2,"y":1,"n":4},{"x":5,"y":1,"n":1},{"x":5,"y":1,"n":4},{"x":0,"y":2,"n":1},{"x":0,"y":2,"n":2},{"x":0,"y":2,"n":4},{"x":1,"y":2,"n":1},{"x":1,"y":2,"n":4},{"x":3,"y":2,"n":1},{"x":3,"y":2,"n":4},{"x":4,"y":2,"n":1},{"x":4,"y":2,"n":4},{"x":0,"y":3,"n":2},{"x":2,"y":3,"n":1},{"x":2,"y":3,"n":4},{"x":5,"y":3,"n":1},{"x":5,"y":3,"n":4},{"x":0,"y":4,"n":1},{"x":0,"y":4,"n":2},{"x":0,"y":4,"n":4},{"x":1,"y":4,"n":1},{"x":1,"y":4,"n":4},{"x":3,"y":4,"n":1},{"x":3,"y":4,"n":4},{"x":4,"y":4,"n":1},{"x":4,"y":4,"n":4},{"x":0,"y":5,"n":2},{"x":2,"y":5,"n":1},{"x":2,"y":5,"n":4},{"x":5,"y":5,"n":1},{"x":5,"y":5,"n":4}]},{"type":"pencilStrike","marks":[{"x":0,"y":2,"n":3},{"x":2,"y":0,"n":3},{"x":0,"y":3,"n":4},{"x":3,"y":0,"n":4},{"x":0,"y":4,"n":5},{"x":4,"y":0,"n":5},{"x":0,"y":5,"n":6},{"x":5,"y":0,"n":6}]},{"type":"pencilStrike","marks":[{"x":2,"y":1,"n":2},{"x":1,"y":2,"n":2},{"x":4,"y":2,"n":5},{"x":2,"y":5,"n":6}]},{"type":"pencilStrike","marks":[{"x":4,"y":0,"n":1},{"x":4,"y":1,"n":2},{"x":1,"y":4,"n":2},{"x":4,"y":2,"n":3},{"x":4,"y":3,"n":4},{"x":4,"y":4,"n":5},{"x":4,"y":5,"n":6}]},{"type":"pencilStrike","marks":[{"x":0,"y":5,"n":1},{"x":5,"y":1,"n":2},{"x":1,"y":5,"n":2},{"x":2,"y":5,"n":3},{"x":3,"y":5,"n":4},{"x":4,"y":5,"n":5},{"x":5,"y":5,"n":6}]},{"type":"pencilStrike","marks":[{"x":3,"y":1,"n":2},{"x":3,"y":3,"n":2},{"x":3,"y":5,"n":2},{"x":4,"y":3,"n":2},{"x":4,"y":5,"n":2}]},{"type":"set","cells":[{"x":1,"y":1}],"n":2}]',
    },
    /** Held on 1653 of 5651 positions walked. */
    identityElim: {
      id: "8dhi:a7a2a8b4p1e2m3q6",
      moves:
        '[{"type":"set","cells":[{"x":0,"y":6}],"n":2},{"type":"set","cells":[{"x":7,"y":1}],"n":7},{"type":"set","cells":[{"x":6,"y":1}],"n":1},{"type":"set","cells":[{"x":5,"y":3}],"n":7},{"type":"pencilAdd","marks":[{"x":0,"y":0,"n":1},{"x":0,"y":0,"n":3},{"x":0,"y":0,"n":5},{"x":0,"y":0,"n":6}]},{"type":"pencilAdd","marks":[{"x":0,"y":2,"n":1},{"x":0,"y":2,"n":3},{"x":0,"y":2,"n":5},{"x":0,"y":2,"n":6},{"x":0,"y":2,"n":7},{"x":0,"y":2,"n":8}]},{"type":"pencilAdd","marks":[{"x":2,"y":0,"n":1},{"x":2,"y":0,"n":3},{"x":2,"y":0,"n":4},{"x":2,"y":0,"n":5},{"x":2,"y":0,"n":6}]},{"type":"pencilAdd","marks":[{"x":0,"y":4,"n":1},{"x":0,"y":4,"n":3},{"x":0,"y":4,"n":5},{"x":0,"y":4,"n":6},{"x":0,"y":4,"n":7},{"x":0,"y":4,"n":8}]},{"type":"pencilAdd","marks":[{"x":4,"y":0,"n":1},{"x":4,"y":0,"n":3},{"x":4,"y":0,"n":4},{"x":4,"y":0,"n":5},{"x":4,"y":0,"n":6}]},{"type":"pencilAdd","marks":[{"x":0,"y":5,"n":1},{"x":0,"y":5,"n":5},{"x":0,"y":5,"n":6},{"x":0,"y":5,"n":7},{"x":0,"y":5,"n":8}]},{"type":"pencilAdd","marks":[{"x":0,"y":7,"n":1},{"x":0,"y":7,"n":3},{"x":0,"y":7,"n":5},{"x":0,"y":7,"n":7},{"x":0,"y":7,"n":8}]}]',
    },
  },
});

/** A populate step, which only the reading that has one gives. */
const pinnedPopulate = describeHintKindPins({
  game: groupGame,
  params: [HARD_HIDDEN],
  ui: (state) => ({ ...newUi(state), candidateReading: "populate" }),
  kinds: {
    populate: (step) => step.rung === "populate",
  },
  pins: {
    /** Held on 12 of 766 positions walked. */
    populate: {
      id: "8dhi:j1_8e1f6o4_5c7m2d",
      moves: [{ type: "set", cells: [{ x: 2, y: 4 }], n: 4 }],
    },
  },
});

describe("group hint — recorded deductions", () => {
  it("records each Group technique across generated boards", () => {
    const kinds = new Set<string>();
    for (const [p, seeds] of [
      [NORMAL, ["a1", "a2", "a3", "a4", "a5"]],
      [HARD_HIDDEN, ["h1", "h2", "h3", "h4", "h5", "h6"]],
    ] as const) {
      for (const seed of seeds) {
        const state = board(p, seed);
        const ops = recordGroupDeductions(
          state.grid.slice(),
          p.w,
          Math.min(p.diff, DIFF_EXTREME),
        );
        for (const op of ops) kinds.add((op.reason as HintReason).kind);
      }
    }
    // Group's own three deductions plus the generic Latin single are all fired.
    expect(kinds.has("associativity")).toBe(true);
    expect(kinds.has("identityFill")).toBe(true);
    expect(kinds.has("identityElim")).toBe(true);
    expect(kinds.has("single")).toBe(true);
  });

  it("an associativity record names its triple and the forced fourth product", () => {
    // The narration states the law with concrete element letters.
    const text = pinned("associativity").step.explanation;
    // "…In any group, (a·b)·c = a·(b·c), so <fourth> must also be <v>."
    expect(text).toMatch(/The grid shows .+·.+ = .+, .+·.+ = .+ and/);
    expect(text).toMatch(/In any group, \(.+·.+\)·.+ = .+·\(.+·.+\), so /);
    expect(text).toMatch(/must also be [a-z]\./);
  });
});

describe("group hint — plan solves boards", () => {
  it("solves a Normal (identity-shown) board by following hints", () => {
    const { solved } = walk(NORMAL, "solve-normal");
    expect(solved).toBe(true);
  });

  it("solves an identity-hidden Tricky board, teaching an identity-mark elimination", () => {
    // The identity-hidden `DIFF_HARD` (Tricky) tier is the one that exercises
    // solverHard, which the shared first-leaf resume never reaches.
    let { state } = pinned("identityElim");
    expect(state.id, "the elimination is an identity-hidden board's").toBe(false);
    for (let i = 0; i < 500 && groupGame.status(state) === "ongoing"; i++) {
      const res = groupGame.hint?.(state, undefined);
      if (!res?.ok) break;
      state = groupGame.executeMove(state, res.steps[0].move);
    }
    expect(groupGame.status(state)).toBe("solved");
  });

  it("a hint resumes from a self-played mid-game position (identity-hidden)", () => {
    // Reach a mid-game position by following ~1/3 of a solve, then confirm a
    // fresh hint still makes progress and drives to solved.
    const { states } = walk(HARD_HIDDEN, "h2");
    const mid = states[Math.floor(states.length / 3)];
    let state = mid;
    let progressed = false;
    for (let i = 0; i < 500 && groupGame.status(state) === "ongoing"; i++) {
      const res = groupGame.hint?.(state, undefined);
      expect(res?.ok, `refused mid-game after ${i} moves`).toBe(true);
      if (!res?.ok) break;
      state = groupGame.executeMove(state, res.steps[0].move);
      progressed = true;
    }
    expect(progressed).toBe(true);
    expect(groupGame.status(state)).toBe("solved");
  });
});

describe("group hint — placements on a note-free board", () => {
  // Group places before it populates, so these placements are classified with
  // few notes or none. A hidden single's sentence says every other empty cell of
  // the line rules the value out; with no notes, that must hold of the values
  // each cell's own row and column leave it.
  it("claims a hidden single only where the board shows one", () => {
    let claims = 0;
    for (const seed of ["nf0", "nf1", "nf2", "nf3", "nf4"]) {
      const state = board(NORMAL, seed);
      const w = state.w;
      const res = groupGame.hint?.(state, undefined);
      if (!res?.ok) continue;
      const g = Uint8Array.from(state.grid);
      const open = (x: number, y: number, n: number): boolean => {
        if (g[y * w + x] !== 0) return false;
        for (let k = 0; k < w; k++)
          if (g[y * w + k] === n || g[k * w + x] === n) return false;
        return true;
      };
      for (const st of res.steps) {
        const mv = st.move as GroupMove;
        if (mv.type === "pencilAll") break;
        if (mv.type !== "set") continue;
        const { x, y } = mv.cells[0];
        const line = /^Every other cell in this (row|column) rules out/.exec(
          st.explanation,
        )?.[1];
        if (line) {
          claims++;
          for (let k = 0; k < w; k++) {
            const [cx, cy] = line === "row" ? [k, y] : [x, k];
            if (cx === x && cy === y) continue;
            expect(open(cx, cy, mv.n), `${seed}: ${st.explanation}`).toBe(false);
          }
        }
        g[y * w + x] = mv.n;
      }
    }
    expect(claims).toBeGreaterThan(0);
  });
});

describe("group hint — boards the midend refuses", () => {
  it("counts a solved board as finished, so the midend refuses it", () => {
    const orig = board(NORMAL, "refuse-solved");
    const sr = groupGame.solve?.(orig, orig, undefined);
    expect(sr?.ok).toBe(true);
    if (!sr?.ok) return;
    const solved = groupGame.executeMove(orig, sr.move);
    expect(groupGame.status(solved)).toBe("solved");
  });

  it("flags a wrong entry, so the midend refuses it", () => {
    const orig = board(NORMAL, "refuse-mistake");
    const sr = groupGame.solve?.(orig, orig, undefined);
    if (!sr?.ok || sr.move.type !== "solve") throw new Error("solve() failed");
    const soln = sr.move.grid;
    // Fill the first empty cell with a *wrong* value.
    const w = orig.w;
    let target = -1;
    for (let i = 0; i < w * w; i++)
      if (!orig.immutable[i]) {
        target = i;
        break;
      }
    expect(target).toBeGreaterThanOrEqual(0);
    const wrong = (soln[target] % w) + 1; // any value != the solution's
    const bad = groupGame.executeMove(orig, {
      type: "set",
      cells: [{ x: target % w, y: (target / w) | 0 }],
      n: wrong,
    });
    expect(groupGame.findMistakes?.(bad).length ?? 0).toBeGreaterThan(0);
  });

  it("flags marks that have crossed out a cell's answer, so the midend refuses them", () => {
    const orig = board(NORMAL, "refuse-note-mistake");
    const sr = groupGame.solve?.(orig, orig, undefined);
    if (!sr?.ok || sr.move.type !== "solve") throw new Error("solve() failed");
    const soln = sr.move.grid;
    const w = orig.w;
    const target = orig.immutable.findIndex((fixed) => !fixed);
    expect(target).toBeGreaterThanOrEqual(0);
    const x = target % w;
    const y = (target / w) | 0;
    const wrong = (soln[target] % w) + 1;

    // Extra candidates beside the answer are ordinary mid-solve state.
    const extra = groupGame.executeMove(orig, {
      type: "pencilAdd",
      marks: [
        { x, y, n: soln[target] },
        { x, y, n: wrong },
      ],
    });
    expect(groupGame.findMistakes?.(extra)).toEqual([]);

    const bad = groupGame.executeMove(orig, {
      type: "pencilAdd",
      marks: [{ x, y, n: wrong }],
    });
    expect(groupGame.findMistakes?.(bad)).toEqual([{ x, y, kind: "note" }]);
  });
});

describe("group hint — keepTrack", () => {
  it("a placement move completes a set step; a wrong one drops the plan", () => {
    const { state, step } = pinned("placement");
    const m = step.move as Extract<GroupMove, { type: "set" }>;
    const cell = m.cells[0];
    expect(
      groupGame.hintKeepTrack?.(
        { type: "set", cells: [{ x: cell.x, y: cell.y }], n: m.n },
        step,
        state,
      ),
    ).toBe("completed");
    // A different value at the same cell is off-plan.
    expect(
      groupGame.hintKeepTrack?.(
        { type: "set", cells: [{ x: cell.x, y: cell.y }], n: (m.n % state.w) + 1 },
        step,
        state,
      ),
    ).toBe("off");
  });

  it("a pencil toggle clearing a strike mark tracks the plan", () => {
    // A strike whose first mark is live against the board, followed with a
    // toggle.
    const found = pinned("liveStrike");
    const mv = found.step.move as Extract<GroupMove, { type: "pencilStrike" }>;
    const k = mv.marks[0];
    const verdict = groupGame.hintKeepTrack?.(
      { type: "pencil", cells: [{ x: k.x, y: k.y }], n: k.n },
      found.step,
      found.state,
    );
    // Clearing one of several marks is onTrack; the sole mark would be completed.
    expect(verdict === "onTrack" || verdict === "completed").toBe(true);
  });

  it("a Mark-all completes a populate step", () => {
    const { state: s, step: pop } = pinnedPopulate("populate");
    expect(groupGame.hintKeepTrack?.({ type: "pencilAll" }, pop, s)).toBe("completed");
    expect(
      groupGame.hintKeepTrack?.({ type: "set", cells: [{ x: 0, y: 0 }], n: 1 }, pop, s),
    ).toBe("off");
  });
});

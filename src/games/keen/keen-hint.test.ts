/**
 * Keen explained-hint tests.
 *
 * Tier 1 — the recording solver records a cage reason per firing and its replayed
 * placements complete a generated board; `hint` populates, strikes (cage
 * eliminations + basic-Latin culls) and places with quality-bar narration; refusal
 * on solved / on mistakes; `hintKeepTrack` verdicts. Tier 2.5 — a render-scenario
 * snapshot of a cage-elimination journey frame (struck candidate `COL_PENCIL`
 * strikethrough, evidence `COL_HINT_CELL`, cage clue glyphs still drawn).
 */
import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import {
  describeHintKindPins,
  describeHintPins,
} from "../../engine/testing/hint-positions.ts";
import { expectRing, markSides } from "../../engine/testing/mark-shape.ts";
import { opsOfKind } from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderPinnedHint,
} from "../../engine/testing/render-scenario.ts";
import { newKeenDesc } from "./generator.ts";
import { keenGame } from "./index.ts";
import { COL_HINT, COL_HINT_CELL, COL_PENCIL } from "./render.ts";
import { type HintReason, recordKeenDeductions } from "./solver.ts";
import {
  DIFF_EXTREME,
  diffToLevel,
  type KeenMove,
  type KeenParams,
  type KeenState,
  newState,
  newUi,
  status,
} from "./state.ts";

function gen(p: KeenParams, seed: string) {
  const { desc, aux } = newKeenDesc(p, randomNew(seed));
  return { p, desc, aux, st: newState(p, desc) };
}

// biome-ignore lint/suspicious/noExplicitAny: structural access to hint highlights/move in tests.
type AnyStep = any;

// The acted-on cell is **ringed**, not filled (`expectRing`): a fill measured
// 1.91:1 against a pencil mark in light and 1.96 in dark, painting over the
// digits the hint talks about, and no palette color fixes that without landing
// next to `ERROR_WASH`. A ring sits beside the content, so it can use the
// emphatic `HINT_ACTION` blue.

const NORMAL: KeenParams = { w: 6, diff: "normal", multiplicationOnly: false };
const HARD: KeenParams = { w: 6, diff: "hard", multiplicationOnly: false };

const SMALL: KeenParams = { w: 4, diff: "easy", multiplicationOnly: false };

/**
 * Every rung on a position whose plan speaks it. A plan is asked under one
 * reading of the note-less cells, and `populate` and `note` are each spoken
 * under one of the two, so the boards are split between them by how many cages
 * a board has.
 */
describeHintPins({
  game: keenGame,
  params: [SMALL, NORMAL, HARD, { ...NORMAL, diff: "extreme" }],
  seeds: 6,
  ui: (s) => ({
    ...newUi(s),
    candidateReading:
      s.clues.clues.filter((c) => c !== 0).length % 2 === 0 ? "populate" : "implicit",
  }),
  pins: {
    /** Held on 11 of 2328 positions walked. */
    populate: "4de:_a_7a4_a3,s1m8d2s1a4d2a7m4",
    /** Held on 529 of 2328 positions walked. */
    clean: {
      id: "6dn:a3_a_16a__a3_aa__aa_aba4_,a8s2m2s2a7m15a7s4s1d2d3m20d2d3d2m80a8",
      moves:
        '[{"type":"pencilAdd","marks":[{"x":1,"y":0,"n":1},{"x":1,"y":0,"n":2},{"x":1,"y":0,"n":3},{"x":1,"y":0,"n":4},{"x":1,"y":0,"n":5},{"x":1,"y":0,"n":6}]},{"type":"pencilAdd","marks":[{"x":0,"y":0,"n":2},{"x":0,"y":0,"n":3},{"x":0,"y":0,"n":5},{"x":0,"y":0,"n":6}]},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":1},{"x":1,"y":0,"n":4}]},{"type":"pencilAdd","marks":[{"x":5,"y":0,"n":1},{"x":5,"y":0,"n":2},{"x":5,"y":0,"n":3},{"x":5,"y":0,"n":4},{"x":5,"y":0,"n":5},{"x":5,"y":0,"n":6}]},{"type":"pencilAdd","marks":[{"x":4,"y":1,"n":1},{"x":4,"y":1,"n":2},{"x":4,"y":1,"n":3},{"x":4,"y":1,"n":4},{"x":4,"y":1,"n":5},{"x":4,"y":1,"n":6}]},{"type":"set","x":4,"y":0,"n":2,"pencil":false,"autoElim":false}]',
    },
    /** Held on 790 of 2328 positions walked. */
    note: "4de:aa_a__a3_a__aa_,a7d2m4s1a10m8s1",
    /** Held on 2245 of 2328 positions walked. */
    dup: "4de:aa_a__a3_a__aa_,a7d2m4s1a10m8s1",
    /** Held on 2328 of 2328 positions walked. */
    single: {
      id: "6dh:b_a_3a__a_3a_4ba10__a_6a__,m150a7s3s2s1m12a7a6d3m10s3a8m12m48d2s3",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":4}]},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":4},{"x":1,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":4}]},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":1},{"x":1,"y":1,"n":2},{"x":1,"y":1,"n":3},{"x":1,"y":1,"n":4},{"x":1,"y":1,"n":6}]}]',
    },
    /** Held on 912 of 2328 positions walked. */
    regionsFull: {
      id: "4de:_a_3abb__aa_a__,d2m36m4a7s1s1d2",
      moves:
        '[{"type":"pencilAdd","marks":[{"x":0,"y":1,"n":1},{"x":0,"y":1,"n":2},{"x":0,"y":1,"n":3},{"x":0,"y":1,"n":4}]},{"type":"pencilAdd","marks":[{"x":0,"y":0,"n":1},{"x":0,"y":0,"n":2},{"x":0,"y":0,"n":4}]},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":3}]},{"type":"pencilAdd","marks":[{"x":2,"y":0,"n":1},{"x":2,"y":0,"n":2},{"x":2,"y":0,"n":3},{"x":2,"y":0,"n":4}]},{"type":"pencilAdd","marks":[{"x":2,"y":1,"n":1},{"x":2,"y":1,"n":2},{"x":2,"y":1,"n":3},{"x":2,"y":1,"n":4}]},{"type":"pencilAdd","marks":[{"x":1,"y":0,"n":3},{"x":1,"y":0,"n":4}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":1},{"x":2,"y":0,"n":2}]},{"type":"pencilStrike","marks":[{"x":2,"y":1,"n":1},{"x":2,"y":1,"n":2}]},{"type":"pencilAdd","marks":[{"x":3,"y":1,"n":1},{"x":3,"y":1,"n":2},{"x":3,"y":1,"n":3},{"x":3,"y":1,"n":4}]},{"type":"pencilAdd","marks":[{"x":3,"y":0,"n":1},{"x":3,"y":0,"n":4}]},{"type":"pencilStrike","marks":[{"x":3,"y":1,"n":2},{"x":3,"y":1,"n":3}]},{"type":"pencilAdd","marks":[{"x":3,"y":3,"n":1},{"x":3,"y":3,"n":2},{"x":3,"y":3,"n":3},{"x":3,"y":3,"n":4}]},{"type":"pencilAdd","marks":[{"x":2,"y":3,"n":1},{"x":2,"y":3,"n":2},{"x":2,"y":3,"n":4}]},{"type":"pencilStrike","marks":[{"x":3,"y":3,"n":3}]},{"type":"set","x":0,"y":0,"n":2,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":2}]},{"type":"set","x":3,"y":0,"n":1,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":3,"y":1,"n":1},{"x":3,"y":3,"n":1}]},{"type":"set","x":3,"y":1,"n":4,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":4},{"x":2,"y":1,"n":4},{"x":3,"y":3,"n":4}]},{"type":"set","x":0,"y":1,"n":1,"pencil":false,"autoElim":false},{"type":"set","x":2,"y":1,"n":3,"pencil":false,"autoElim":false}]',
    },
    /** Held on 1846 of 2328 positions walked. */
    hiddenSingle: {
      id: "4de:_a_7a4_a3,s2m4a5m6d2d2a5s2",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":2},{"x":1,"y":0,"n":3}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":2},{"x":2,"y":0,"n":3}]},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":1},{"x":1,"y":1,"n":4}]},{"type":"pencilStrike","marks":[{"x":1,"y":2,"n":1},{"x":1,"y":2,"n":4}]},{"type":"pencilStrike","marks":[{"x":2,"y":1,"n":3}]},{"type":"pencilStrike","marks":[{"x":2,"y":2,"n":3}]},{"type":"pencilStrike","marks":[{"x":0,"y":2,"n":3}]},{"type":"pencilStrike","marks":[{"x":0,"y":3,"n":3}]}]',
    },
    /** Held on 343 of 2328 positions walked. */
    set: {
      id: "6dx:a3_aa_a__a__a_3a__ab__a_5b_a4__b_,a7s1a7m6s1s1m24m10m12a16d3s2s2d2a8",
      moves:
        '[{"type":"pencilAdd","marks":[{"x":0,"y":2,"n":1},{"x":0,"y":2,"n":2},{"x":0,"y":2,"n":3},{"x":0,"y":2,"n":4},{"x":0,"y":2,"n":5},{"x":0,"y":2,"n":6}]},{"type":"pencilAdd","marks":[{"x":0,"y":3,"n":1},{"x":0,"y":3,"n":2},{"x":0,"y":3,"n":3},{"x":0,"y":3,"n":4},{"x":0,"y":3,"n":5},{"x":0,"y":3,"n":6}]},{"type":"pencilAdd","marks":[{"x":0,"y":1,"n":1},{"x":0,"y":1,"n":2},{"x":0,"y":1,"n":3}]},{"type":"pencilStrike","marks":[{"x":0,"y":2,"n":4},{"x":0,"y":2,"n":5},{"x":0,"y":2,"n":6}]},{"type":"pencilStrike","marks":[{"x":0,"y":3,"n":4},{"x":0,"y":3,"n":5},{"x":0,"y":3,"n":6}]},{"type":"pencilAdd","marks":[{"x":5,"y":1,"n":1},{"x":5,"y":1,"n":2},{"x":5,"y":1,"n":3},{"x":5,"y":1,"n":4},{"x":5,"y":1,"n":5},{"x":5,"y":1,"n":6}]},{"type":"pencilAdd","marks":[{"x":4,"y":2,"n":1},{"x":4,"y":2,"n":2},{"x":4,"y":2,"n":3},{"x":4,"y":2,"n":4},{"x":4,"y":2,"n":5},{"x":4,"y":2,"n":6}]},{"type":"pencilAdd","marks":[{"x":4,"y":1,"n":1},{"x":4,"y":1,"n":2},{"x":4,"y":1,"n":3},{"x":4,"y":1,"n":4},{"x":4,"y":1,"n":6}]},{"type":"pencilStrike","marks":[{"x":5,"y":1,"n":5}]},{"type":"pencilStrike","marks":[{"x":4,"y":2,"n":5}]},{"type":"pencilAdd","marks":[{"x":3,"y":2,"n":1},{"x":3,"y":2,"n":2},{"x":3,"y":2,"n":3},{"x":3,"y":2,"n":4},{"x":3,"y":2,"n":5},{"x":3,"y":2,"n":6}]},{"type":"pencilAdd","marks":[{"x":3,"y":3,"n":1},{"x":3,"y":3,"n":2},{"x":3,"y":3,"n":3},{"x":3,"y":3,"n":4},{"x":3,"y":3,"n":5},{"x":3,"y":3,"n":6}]},{"type":"pencilAdd","marks":[{"x":2,"y":2,"n":1},{"x":2,"y":2,"n":2},{"x":2,"y":2,"n":5}]},{"type":"pencilStrike","marks":[{"x":3,"y":2,"n":3},{"x":3,"y":2,"n":4},{"x":3,"y":2,"n":6}]},{"type":"pencilStrike","marks":[{"x":3,"y":3,"n":3},{"x":3,"y":3,"n":4},{"x":3,"y":3,"n":6}]},{"type":"pencilAdd","marks":[{"x":5,"y":3,"n":1},{"x":5,"y":3,"n":2},{"x":5,"y":3,"n":3},{"x":5,"y":3,"n":4},{"x":5,"y":3,"n":5},{"x":5,"y":3,"n":6}]},{"type":"pencilAdd","marks":[{"x":5,"y":4,"n":1},{"x":5,"y":4,"n":2},{"x":5,"y":4,"n":3},{"x":5,"y":4,"n":4},{"x":5,"y":4,"n":5},{"x":5,"y":4,"n":6}]},{"type":"pencilAdd","marks":[{"x":5,"y":2,"n":1},{"x":5,"y":2,"n":2},{"x":5,"y":2,"n":3},{"x":5,"y":2,"n":4},{"x":5,"y":2,"n":6}]},{"type":"pencilStrike","marks":[{"x":5,"y":3,"n":5}]},{"type":"pencilStrike","marks":[{"x":5,"y":4,"n":5}]},{"type":"pencilAdd","marks":[{"x":4,"y":4,"n":1},{"x":4,"y":4,"n":2},{"x":4,"y":4,"n":3},{"x":4,"y":4,"n":4},{"x":4,"y":4,"n":5},{"x":4,"y":4,"n":6}]},{"type":"pencilAdd","marks":[{"x":4,"y":3,"n":1},{"x":4,"y":3,"n":2},{"x":4,"y":3,"n":3},{"x":4,"y":3,"n":6}]},{"type":"pencilStrike","marks":[{"x":4,"y":4,"n":4},{"x":4,"y":4,"n":5}]},{"type":"pencilAdd","marks":[{"x":1,"y":5,"n":1},{"x":1,"y":5,"n":2},{"x":1,"y":5,"n":3},{"x":1,"y":5,"n":4},{"x":1,"y":5,"n":5},{"x":1,"y":5,"n":6}]},{"type":"pencilAdd","marks":[{"x":0,"y":5,"n":1},{"x":0,"y":5,"n":2},{"x":0,"y":5,"n":3},{"x":0,"y":5,"n":4},{"x":0,"y":5,"n":6}]},{"type":"pencilStrike","marks":[{"x":1,"y":5,"n":5}]},{"type":"pencilAdd","marks":[{"x":5,"y":5,"n":1},{"x":5,"y":5,"n":2},{"x":5,"y":5,"n":3},{"x":5,"y":5,"n":4},{"x":5,"y":5,"n":5},{"x":5,"y":5,"n":6}]},{"type":"pencilAdd","marks":[{"x":4,"y":5,"n":2},{"x":4,"y":5,"n":3},{"x":4,"y":5,"n":5},{"x":4,"y":5,"n":6}]},{"type":"pencilStrike","marks":[{"x":5,"y":5,"n":1},{"x":5,"y":5,"n":4}]},{"type":"pencilAdd","marks":[{"x":0,"y":0,"n":4},{"x":0,"y":0,"n":5},{"x":0,"y":0,"n":6}]},{"type":"pencilAdd","marks":[{"x":0,"y":4,"n":4},{"x":0,"y":4,"n":5},{"x":0,"y":4,"n":6}]},{"type":"pencilStrike","marks":[{"x":0,"y":5,"n":1},{"x":0,"y":5,"n":2},{"x":0,"y":5,"n":3}]},{"type":"pencilAdd","marks":[{"x":1,"y":0,"n":1},{"x":1,"y":0,"n":2},{"x":1,"y":0,"n":3}]},{"type":"pencilAdd","marks":[{"x":1,"y":4,"n":2},{"x":1,"y":4,"n":3},{"x":1,"y":4,"n":4},{"x":1,"y":4,"n":6}]},{"type":"pencilStrike","marks":[{"x":1,"y":5,"n":1},{"x":1,"y":5,"n":4},{"x":1,"y":5,"n":6}]},{"type":"pencilAdd","marks":[{"x":5,"y":0,"n":2},{"x":5,"y":0,"n":3},{"x":5,"y":0,"n":4},{"x":5,"y":0,"n":5},{"x":5,"y":0,"n":6}]},{"type":"pencilStrike","marks":[{"x":5,"y":1,"n":1}]},{"type":"pencilAdd","marks":[{"x":4,"y":0,"n":1},{"x":4,"y":0,"n":2},{"x":4,"y":0,"n":3},{"x":4,"y":0,"n":4},{"x":4,"y":0,"n":5}]}]',
    },
    /** Held on 82 of 2328 positions walked. */
    forcing: {
      id: "6dx:__aa__a_10a_a3ba_aa__aa__a_3a__aa_,s3m12a5d3m6s1s1d2d2s2a5a8a5s1m12m6d2m15",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":1},{"x":1,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":1},{"x":1,"y":1,"n":5}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":5},{"x":2,"y":0,"n":6}]},{"type":"pencilStrike","marks":[{"x":3,"y":0,"n":5},{"x":3,"y":0,"n":6}]},{"type":"pencilStrike","marks":[{"x":4,"y":0,"n":4},{"x":4,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":5,"y":0,"n":4},{"x":5,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":1,"y":2,"n":5}]},{"type":"pencilStrike","marks":[{"x":1,"y":3,"n":5}]},{"type":"pencilStrike","marks":[{"x":4,"y":2,"n":5},{"x":4,"y":2,"n":6}]},{"type":"pencilStrike","marks":[{"x":4,"y":3,"n":5},{"x":4,"y":3,"n":6}]},{"type":"pencilStrike","marks":[{"x":2,"y":3,"n":1},{"x":2,"y":3,"n":4}]},{"type":"pencilStrike","marks":[{"x":2,"y":4,"n":1},{"x":2,"y":4,"n":4}]},{"type":"pencilStrike","marks":[{"x":5,"y":3,"n":5},{"x":5,"y":3,"n":6}]},{"type":"pencilStrike","marks":[{"x":5,"y":4,"n":5},{"x":5,"y":4,"n":6}]},{"type":"pencilStrike","marks":[{"x":3,"y":4,"n":1},{"x":3,"y":4,"n":5}]},{"type":"pencilStrike","marks":[{"x":4,"y":4,"n":1},{"x":4,"y":4,"n":5}]},{"type":"set","x":0,"y":0,"n":5,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":5},{"x":0,"y":2,"n":5},{"x":0,"y":3,"n":5},{"x":0,"y":4,"n":5},{"x":0,"y":5,"n":5}]},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":1},{"x":0,"y":1,"n":3},{"x":0,"y":1,"n":4},{"x":0,"y":1,"n":6}]},{"type":"set","x":0,"y":1,"n":2,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":2},{"x":2,"y":1,"n":2},{"x":3,"y":1,"n":2},{"x":4,"y":1,"n":2},{"x":5,"y":1,"n":2},{"x":0,"y":2,"n":2},{"x":0,"y":3,"n":2},{"x":0,"y":4,"n":2},{"x":0,"y":5,"n":2}]},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":6}]},{"type":"pencilStrike","marks":[{"x":2,"y":1,"n":4},{"x":2,"y":1,"n":5}]},{"type":"pencilStrike","marks":[{"x":2,"y":2,"n":3},{"x":2,"y":2,"n":4},{"x":2,"y":2,"n":5}]},{"type":"pencilStrike","marks":[{"x":3,"y":1,"n":1}]},{"type":"pencilStrike","marks":[{"x":4,"y":1,"n":1}]},{"type":"pencilStrike","marks":[{"x":5,"y":2,"n":1}]},{"type":"pencilStrike","marks":[{"x":0,"y":2,"n":1},{"x":0,"y":2,"n":4}]},{"type":"pencilStrike","marks":[{"x":0,"y":3,"n":1},{"x":0,"y":3,"n":4}]},{"type":"pencilStrike","marks":[{"x":1,"y":4,"n":1},{"x":1,"y":4,"n":6}]},{"type":"pencilStrike","marks":[{"x":0,"y":5,"n":4}]},{"type":"pencilStrike","marks":[{"x":1,"y":5,"n":3},{"x":1,"y":5,"n":4},{"x":1,"y":5,"n":5}]},{"type":"set","x":0,"y":4,"n":4,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":1,"y":4,"n":4},{"x":3,"y":4,"n":4},{"x":4,"y":4,"n":4},{"x":5,"y":4,"n":4}]},{"type":"pencilStrike","marks":[{"x":5,"y":3,"n":1}]},{"type":"pencilStrike","marks":[{"x":1,"y":4,"n":2}]},{"type":"pencilStrike","marks":[{"x":3,"y":4,"n":3}]},{"type":"pencilStrike","marks":[{"x":4,"y":4,"n":3}]},{"type":"set","x":0,"y":5,"n":1,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":1,"y":5,"n":1},{"x":2,"y":5,"n":1},{"x":3,"y":5,"n":1},{"x":4,"y":5,"n":1},{"x":5,"y":5,"n":1}]},{"type":"pencilStrike","marks":[{"x":1,"y":5,"n":2}]},{"type":"set","x":1,"y":5,"n":6,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":6},{"x":1,"y":2,"n":6},{"x":1,"y":3,"n":6},{"x":2,"y":5,"n":6},{"x":3,"y":5,"n":6},{"x":4,"y":5,"n":6},{"x":5,"y":5,"n":6}]},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":2}]},{"type":"pencilStrike","marks":[{"x":1,"y":2,"n":3}]},{"type":"pencilStrike","marks":[{"x":1,"y":3,"n":3}]},{"type":"pencilStrike","marks":[{"x":1,"y":2,"n":4}]},{"type":"set","x":1,"y":4,"n":5,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":2,"y":4,"n":5}]},{"type":"pencilStrike","marks":[{"x":2,"y":3,"n":3}]},{"type":"set","x":5,"y":4,"n":1,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":5,"y":0,"n":1},{"x":5,"y":1,"n":1}]},{"type":"pencilStrike","marks":[{"x":4,"y":0,"n":3}]},{"type":"pencilStrike","marks":[{"x":5,"y":3,"n":2},{"x":5,"y":3,"n":3}]},{"type":"set","x":5,"y":3,"n":4,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":5,"y":1,"n":4},{"x":5,"y":2,"n":4},{"x":1,"y":3,"n":4},{"x":3,"y":3,"n":4},{"x":4,"y":3,"n":4},{"x":5,"y":5,"n":4}]},{"type":"pencilStrike","marks":[{"x":4,"y":5,"n":2},{"x":4,"y":5,"n":4}]},{"type":"pencilStrike","marks":[{"x":5,"y":5,"n":2}]},{"type":"set","x":2,"y":1,"n":1,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":1},{"x":2,"y":2,"n":1}]},{"type":"pencilStrike","marks":[{"x":3,"y":0,"n":4}]},{"type":"pencilStrike","marks":[{"x":2,"y":2,"n":2}]},{"type":"set","x":2,"y":2,"n":6,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":0,"y":2,"n":6},{"x":3,"y":2,"n":6},{"x":5,"y":2,"n":6},{"x":2,"y":3,"n":6},{"x":2,"y":4,"n":6}]},{"type":"set","x":0,"y":2,"n":3,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":3,"y":2,"n":3},{"x":4,"y":2,"n":3},{"x":5,"y":2,"n":3},{"x":0,"y":3,"n":3}]},{"type":"set","x":0,"y":3,"n":6,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":3,"y":3,"n":6}]},{"type":"pencilStrike","marks":[{"x":5,"y":1,"n":5}]},{"type":"pencilStrike","marks":[{"x":3,"y":2,"n":2}]},{"type":"pencilStrike","marks":[{"x":3,"y":3,"n":1},{"x":3,"y":3,"n":5}]},{"type":"pencilStrike","marks":[{"x":4,"y":2,"n":1}]},{"type":"pencilStrike","marks":[{"x":4,"y":3,"n":2}]},{"type":"set","x":2,"y":3,"n":5,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":2,"y":5,"n":5}]},{"type":"pencilStrike","marks":[{"x":2,"y":4,"n":2}]},{"type":"set","x":2,"y":4,"n":3,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":3},{"x":2,"y":5,"n":3}]},{"type":"pencilStrike","marks":[{"x":3,"y":0,"n":2}]},{"type":"pencilStrike","marks":[{"x":3,"y":5,"n":3},{"x":3,"y":5,"n":5}]}]',
    },
    /** Held on 1894 of 2328 positions walked. */
    cage: {
      id: "4de:aa_a__a3_a__aa_,a7d2m4s1a10m8s1",
      moves:
        '[{"type":"pencilAdd","marks":[{"x":1,"y":0,"n":1},{"x":1,"y":0,"n":2},{"x":1,"y":0,"n":3},{"x":1,"y":0,"n":4}]}]',
    },
    /** Held on 552 of 2328 positions walked. */
    cageLine: {
      id: "6dx:_a3_a_3a_3aa_3a_3aa_3a__ba_3a__caa,m10m12d3m4a10s1m12m6d2s1a10a7a7s1s1s2",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":3},{"x":0,"y":0,"n":4},{"x":0,"y":0,"n":6}]},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":3},{"x":0,"y":1,"n":4},{"x":0,"y":1,"n":6}]},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":3},{"x":1,"y":1,"n":4},{"x":1,"y":1,"n":6}]},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":1},{"x":1,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":1},{"x":2,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":3,"y":0,"n":4},{"x":3,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":4,"y":0,"n":4},{"x":4,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":5,"y":0,"n":2},{"x":5,"y":0,"n":3},{"x":5,"y":0,"n":5},{"x":5,"y":0,"n":6}]},{"type":"pencilStrike","marks":[{"x":5,"y":1,"n":2},{"x":5,"y":1,"n":3},{"x":5,"y":1,"n":5},{"x":5,"y":1,"n":6}]},{"type":"pencilStrike","marks":[{"x":1,"y":2,"n":4},{"x":1,"y":2,"n":5}]},{"type":"pencilStrike","marks":[{"x":1,"y":3,"n":4},{"x":1,"y":3,"n":5}]},{"type":"pencilStrike","marks":[{"x":3,"y":2,"n":5}]},{"type":"pencilStrike","marks":[{"x":4,"y":2,"n":5}]},{"type":"pencilStrike","marks":[{"x":3,"y":3,"n":5},{"x":3,"y":3,"n":6}]},{"type":"set","x":0,"y":0,"n":5,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":5},{"x":0,"y":2,"n":5},{"x":0,"y":3,"n":5},{"x":0,"y":4,"n":5},{"x":0,"y":5,"n":5}]},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":5}]},{"type":"pencilStrike","marks":[{"x":0,"y":2,"n":1}]},{"type":"pencilStrike","marks":[{"x":0,"y":3,"n":1}]},{"type":"pencilStrike","marks":[{"x":1,"y":4,"n":2}]}]',
    },
  },
});

/** Steps a hint gives on a board as dealt, each kind on the size its test
 * reads. */
const pinnedFresh = describeHintKindPins({
  game: keenGame,
  params: [NORMAL, SMALL],
  kinds: {
    populate: (step) => step.rung === "populate",
    hiddenSingle: (step, state) =>
      state.params.w === NORMAL.w && step.rung === "hiddenSingle",
    // On the board's first row or column, where every cell's hatch starts at
    // the board's edge: an inner line's cells start a pixel apart wherever a
    // cage wall thickens, and the frame test reads the line as one strip.
    hiddenSingleSmall: (step, state) => {
      const hatch = ((step as AnyStep).highlights?.hatch ?? []) as {
        x: number;
        y: number;
      }[];
      return (
        state.params.w === SMALL.w &&
        step.rung === "hiddenSingle" &&
        (hatch.every((c) => c.x === 0) || hatch.every((c) => c.y === 0))
      );
    },
  },
  pins: {
    /** Held on 24 of 1630 positions walked. */
    populate: "6dn:aac_b_12b_a_3a_3a__a4__a_3aa,d2m6m15a12d2a6a5d3s2s4m24s4s3d2m36a8s3",
    /** Held on 87 of 1630 positions walked. */
    hiddenSingle: {
      id: "6dn:_3a_3aa_a3_3a__a3__b_a3_9a4,a5m6d3s1s1m3d2m60s2m6a11a6s1d3a5s3d3",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":5},{"x":0,"y":0,"n":6}]},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":5},{"x":0,"y":1,"n":6}]},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":4},{"x":1,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":4},{"x":1,"y":1,"n":5}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":4},{"x":2,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":2,"y":1,"n":4},{"x":2,"y":1,"n":5}]},{"type":"pencilStrike","marks":[{"x":3,"y":1,"n":2},{"x":3,"y":1,"n":4},{"x":3,"y":1,"n":5},{"x":3,"y":1,"n":6}]},{"type":"pencilStrike","marks":[{"x":4,"y":1,"n":2},{"x":4,"y":1,"n":4},{"x":4,"y":1,"n":5},{"x":4,"y":1,"n":6}]},{"type":"pencilStrike","marks":[{"x":4,"y":3,"n":3},{"x":4,"y":3,"n":6}]},{"type":"pencilStrike","marks":[{"x":4,"y":4,"n":3},{"x":4,"y":4,"n":6}]}]',
    },
    /** Held on 10 of 1630 positions walked. */
    hiddenSingleSmall: {
      id: "4de:_a_3abb__aa_a__,d2m36m4a7s1s1d2",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":3}]},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":3}]},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":1},{"x":1,"y":0,"n":2}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":1},{"x":2,"y":0,"n":2}]},{"type":"pencilStrike","marks":[{"x":2,"y":1,"n":1},{"x":2,"y":1,"n":2}]},{"type":"pencilStrike","marks":[{"x":3,"y":0,"n":2},{"x":3,"y":0,"n":3}]},{"type":"pencilStrike","marks":[{"x":3,"y":1,"n":2},{"x":3,"y":1,"n":3}]},{"type":"pencilStrike","marks":[{"x":2,"y":3,"n":3}]},{"type":"pencilStrike","marks":[{"x":3,"y":3,"n":3}]}]',
    },
  },
});

/** Steps a hint gives once the player has marked every candidate. */
const pinnedMarked = describeHintKindPins({
  game: keenGame,
  params: [NORMAL],
  opening: (): KeenMove[] => [{ type: "pencilAll" }],
  kinds: {
    cage: (step) => step.rung === "cage" || step.rung === "cageLine",
    cageRuledOut: (step) => step.rung === "cage",
    strikeOfSeveral: (step) => {
      const move = step.move as KeenMove;
      return move.type === "pencilStrike" && move.marks.length >= 2;
    },
  },
  pins: {
    /** Held on 459 of 1171 positions walked. */
    cage: {
      id: "6dn:aac_b_12b_a_3a_3a__a4__a_3aa,d2m6m15a12d2a6a5d3s2s4m24s4s3d2m36a8s3",
      moves: [{ type: "pencilAll" }],
    },
    /** Held on 459 of 1171 positions walked. */
    cageRuledOut: {
      id: "6dn:aac_b_12b_a_3a_3a__a4__a_3aa,d2m6m15a12d2a6a5d3s2s4m24s4s3d2m36a8s3",
      moves: [{ type: "pencilAll" }],
    },
    /** Held on 469 of 1171 positions walked. */
    strikeOfSeveral: {
      id: "6dn:a3_a_16a__a3_aa__aa_aba4_,a8s2m2s2a7m15a7s4s1d2d3m20d2d3d2m80a8",
      moves: [{ type: "pencilAll" }],
    },
  },
});

// --- tier 1: recording solver ----------------------------------------------

describe("keen recording solver", () => {
  it("records a cage reason and its placements complete the board", () => {
    const { st } = gen(NORMAL, "rec-normal");
    const ops = recordKeenDeductions(
      st.params.w,
      st.clues,
      Uint8Array.from(st.grid),
      Math.min(diffToLevel(NORMAL.diff), DIFF_EXTREME),
    );
    expect(ops.length).toBeGreaterThan(0);
    const kinds = new Set(ops.map((o) => (o.reason as HintReason).kind));
    // The signature cage deduction is exercised.
    expect(kinds.has("cage")).toBe(true);

    // Replaying the placements reconstructs the full (unique) solution.
    const w = st.params.w;
    const filled = new Uint8Array(w * w);
    for (const op of ops) if (op.kind === "place") filled[op.y * w + op.x] = op.n;
    for (let i = 0; i < w * w; i++) expect(filled[i]).toBeGreaterThan(0);
  });

  it("with recording off, leaves the generate/solve path producing a unique solution", () => {
    // A smoke check that recording is opt-in: solving without a recorder still
    // yields the same kind of result (the byte-identical guarantee is the C
    // differential in keen-differential.test.ts; this just guards the wiring).
    const { st } = gen(NORMAL, "rec-off");
    const r = keenGame.solve?.(st, st);
    expect(r?.ok).toBe(true);
  });
});

// --- tier 1: hint plan ------------------------------------------------------

describe("keen hint", () => {
  it("populates before the first elimination", () => {
    const { st } = gen(NORMAL, "hint-empty");
    const res = keenGame.hint?.(st);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    const moves = res.steps.map((s) => (s.move as KeenMove).type);
    const populateAt = moves.indexOf("pencilAll");
    const firstStrike = moves.indexOf("pencilStrike");
    expect(populateAt).toBe(0);
    expect(firstStrike).toBeGreaterThan(0);
    expect(populateAt).toBeLessThan(firstStrike);
  });

  it("skips populate once notes are present", () => {
    const { st } = gen(NORMAL, "hint-pop");
    const populated = keenGame.executeMove(st, { type: "pencilAll" });
    const res = keenGame.hint?.(populated);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    expect((res.steps[0].move as KeenMove).type).not.toBe("pencilAll");
  });

  it("surfaces a naked single as the next move ahead of any elimination", () => {
    const { st } = gen(NORMAL, "hint-naked");
    const r = keenGame.solve?.(st, st);
    if (!r?.ok || r.move.type !== "solve") throw new Error("solve failed");
    const w = st.params.w;
    const x = 2;
    const y = 3;
    const i = y * w + x;
    const v = r.move.grid[i];
    const populated = keenGame.executeMove(st, { type: "pencilAll" });
    // Narrow this one cell to a single candidate (its solution value).
    const marks = [];
    for (let n = 1; n <= w; n++) if (n !== v) marks.push({ x, y, n });
    const narrowed = keenGame.executeMove(populated, { type: "pencilStrike", marks });

    const res = keenGame.hint?.(narrowed);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    // Auto-pencil defaults off, so a placement carries `autoElim: false` (the
    // player cleans notes via the mark-all button or follows the hint's strike legs).
    expect(res.steps[0].move).toEqual({
      type: "set",
      x,
      y,
      n: v,
      pencil: false,
      autoElim: false,
    });
    expect(res.steps[0].explanation).toMatch(/can only be/);
  });

  it("every deduction conclusion uses the necessity voice", () => {
    const { st } = gen(NORMAL, "voice");
    const populated = keenGame.executeMove(st, { type: "pencilAll" });
    const res = keenGame.hint?.(populated);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    // A strike concludes "must cross out …" / "must cross them out"; a placement
    // "it can only be N"; never a bare "is/are/stays". (Populate is the lone
    // instruction.)
    const modal = /can only|can't|must (be|cross)/i;
    for (const s of res.steps) {
      if ((s.move as KeenMove).type === "pencilAll") continue;
      expect(s.explanation).toMatch(modal);
    }
  });

  it("names the cage by its arithmetic clue", () => {
    const { step: cageStep } = pinnedMarked("cage");
    // Every cage narration names a concrete goal (one of the four operations).
    expect(cageStep.explanation).toMatch(/sum to|multiply to|differ by|ratio of/);
  });

  it("a cage-strike step's marks all lie in one cell (no bleed across the cage)", () => {
    let checked = 0;
    for (const p of [NORMAL, HARD]) {
      for (let s = 0; s < 8; s++) {
        const { st } = gen(p, `bleed-${p.diff}-${s}`);
        const res = keenGame.hint?.(st);
        if (!res?.ok) continue;
        for (const step of res.steps as AnyStep[]) {
          if (step.move.type !== "pencilStrike") continue;
          if (step.rung !== "cage" && step.rung !== "cageLine") continue; // skip basic-Latin dup steps
          const marks = step.move.marks as { x: number; y: number; n: number }[];
          const cells = new Set(marks.map((m) => `${m.x},${m.y}`));
          expect(cells.size).toBe(1);
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it("auto-pencil on folds away the trivial row/column eliminations a placement implies", () => {
    // Walk a few placements in so a `set` step (and its row/column cleanup) is in
    // range, then compare the dup-step counts.
    const { st } = gen(NORMAL, "autopencil");
    const uiOn = newUi(st);
    uiOn.autoPencil = true;
    const on = keenGame.hint?.(st, undefined, uiOn);
    const uiOff = newUi(st);
    uiOff.autoPencil = false;
    const off = keenGame.hint?.(st, undefined, uiOff);
    expect(on?.ok && off?.ok).toBe(true);
    if (!on?.ok || !off?.ok) return;
    const dupCount = (r: typeof on) => r.steps.filter((s) => s.rung === "dup").length;
    // With auto-pencil off, each placement also teaches its row/column cleanup.
    expect(dupCount(off)).toBeGreaterThan(dupCount(on));
    expect(off.steps.length).toBeGreaterThan(on.steps.length);
  });

  it("narrates a hidden single by its line and hatches the whole line", () => {
    // A hidden single (a cell still showing several candidates, but the placed
    // digit fits nowhere else in its row/column) must NOT be narrated as a naked
    // single ("every other number ruled out in this cell"); it names the line and
    // hatches it.
    const found = pinnedFresh("hiddenSingle");
    const step = found.step as AnyStep;
    const w = found.state.params.w;
    const m = step.move as { type: string; x: number; y: number; n: number };
    // The narration is a placement, never the naked-single phrasing.
    expect(step.explanation).not.toMatch(/Every other number has been ruled out/);
    expect(step.explanation).toMatch(/in this (row|column) rules out/);
    // The hatch is exactly one full line (w cells) through the target.
    const area = (step.highlights?.hatch ?? []) as { x: number; y: number }[];
    expect(area.length).toBe(w);
    const isRow = /in this row/.test(step.explanation);
    for (const a of area) {
      if (isRow) expect(a.y).toBe(m.y);
      else expect(a.x).toBe(m.x);
    }
    expect(area.some((a) => a.x === m.x && a.y === m.y)).toBe(true);
  });

  it("counts a solved board as finished and flags a wrong entry, the boards the midend refuses", () => {
    const { st } = gen(NORMAL, "refuse");
    const r = keenGame.solve?.(st, st);
    if (!r?.ok) throw new Error("solve failed");
    const solved = keenGame.executeMove(st, r.move);
    expect(keenGame.status(solved)).toBe("solved");

    const w = st.params.w;
    const sol = (r.move as { type: "solve"; grid: number[] }).grid;
    const wrong = (sol[0] % w) + 1;
    const bad = keenGame.executeMove(st, {
      type: "set",
      x: 0,
      y: 0,
      n: wrong,
      pencil: false,
    });
    expect(keenGame.findMistakes?.(bad).length ?? 0).toBeGreaterThan(0);
  });
});

// --- tier 1: keep-track -----------------------------------------------------

describe("keen hintKeepTrack", () => {
  it("matches a populate step, rejects anything else", () => {
    const { state: st, step } = pinnedFresh("populate");
    expect(keenGame.hintKeepTrack?.({ type: "pencilAll" }, step, st)).toBe("completed");
    expect(
      keenGame.hintKeepTrack?.(
        { type: "set", x: 0, y: 0, n: 1, pencil: false },
        step,
        st,
      ),
    ).toBe("off");
  });

  it("shrinks then finishes a multi-mark strike journey", () => {
    const found = pinnedMarked("strikeOfSeveral");
    const populated = found.state;
    const step = found.step as AnyStep;

    const marks = [...step.move.marks] as { x: number; y: number; n: number }[];
    const first = marks[0];
    const v1 = keenGame.hintKeepTrack?.(
      { type: "set", x: first.x, y: first.y, n: first.n, pencil: true },
      step,
      populated,
    );
    expect(v1).toBe("onTrack");
    expect((step.move as { marks: unknown[] }).marks.length).toBe(marks.length - 1);

    let cur = keenGame.executeMove(populated, {
      type: "set",
      x: first.x,
      y: first.y,
      n: first.n,
      pencil: true,
    });
    for (let k = 1; k < marks.length; k++) {
      const mk = marks[k];
      const v = keenGame.hintKeepTrack?.(
        { type: "set", x: mk.x, y: mk.y, n: mk.n, pencil: true },
        step,
        cur,
      );
      expect(v).toBe(k === marks.length - 1 ? "completed" : "onTrack");
      cur = keenGame.executeMove(cur, {
        type: "set",
        x: mk.x,
        y: mk.y,
        n: mk.n,
        pencil: true,
      });
    }
  });
});

// --- tier 1: resume to solved ----------------------------------------------

describe("keen hint resumes to solved", () => {
  it("completes a fresh board one recomputed hint at a time", () => {
    const { st: start, aux } = gen(NORMAL, "resume");
    let state: KeenState = start;
    for (let moves = 0; moves < 2000; moves++) {
      if (status(state) === "solved") return;
      const res = keenGame.hint?.(state, aux);
      expect(res?.ok).toBe(true);
      if (!res?.ok) throw new Error(`gave up: ${res?.error}`);
      state = keenGame.executeMove(state, res.steps[0].move);
    }
    throw new Error("did not converge");
  });
});

// --- tier 2.5: render ------------------------------------------------------

describe("keen hint render", () => {
  it("a cage elimination hatches the cage and strikes the candidate", () => {
    const { recording, hint } = renderPinnedHint(
      keenGame,
      pinnedMarked("cageRuledOut"),
      { defaultBackground: DEFAULT_BACKGROUND },
    );
    // "This cage" is hatched, one hatch per cell of it, and nothing in it is
    // outlined: the cage is the region, not a particular cell.
    const cage = (hint?.highlights as { hatch?: unknown[] }).hatch ?? [];
    expect(cage.length).toBeGreaterThan(0);
    const hatches = opsOfKind(recording.ops, "hatch");
    expect(new Set(hatches.map((h) => `${h.x},${h.y}`)).size).toBe(cage.length);
    expect(markSides(recording.ops, COL_HINT_CELL)).toEqual([]);
    // The struck candidate keeps its COL_PENCIL digit, crossed through in COL_PENCIL.
    expect(recording.ops.some((o) => o.op === "line" && o.color === COL_PENCIL)).toBe(
      true,
    );
    expect(recording.ops.some((o) => o.op === "text" && o.color === COL_PENCIL)).toBe(
      true,
    );
    // A strike step gets the same ring as a placement: the cell a hint acts on
    // is marked the same way whatever the move, so it is never left identified
    // only by the strikethrough the player has to spot first.
    expectRing(recording.ops, COL_HINT);
    expect(recording.ops).toMatchSnapshot();
  });

  it("a hidden-single placement hatches the whole line and rings the target", () => {
    const { recording, hint } = renderPinnedHint(
      keenGame,
      pinnedFresh("hiddenSingleSmall"),
      { defaultBackground: DEFAULT_BACKGROUND },
    );
    expect(hint?.explanation).toMatch(/in this (row|column) rules out/);
    // One hatch per cell of the line, all in one strip, and no outline: the
    // line is the hatch, and nothing in it is a particular reason.
    const hatches = opsOfKind(recording.ops, "hatch");
    expect(hatches).toHaveLength(SMALL.w);
    for (const h of hatches) expect(h.color).toBe(COL_HINT);
    const isRow = /in this row/.test(hint?.explanation ?? "");
    expect(new Set(hatches.map((h) => (isRow ? h.y : h.x))).size).toBe(1);
    expect(markSides(recording.ops, COL_HINT_CELL)).toEqual([]);
    expectRing(recording.ops, COL_HINT);
    expect(recording.ops).toMatchSnapshot();
  });
});

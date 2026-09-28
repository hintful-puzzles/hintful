/*
 * Solo's `runDeductionFixpoint` ladder, certified by a census of which rungs
 * fire. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 *
 * **Solo grades on two scales**, sudoku `diff` and killer `kdiff`, each with
 * its own cap, where the harness walks one number: a cap here is
 * `maxdiff * 10 + maxkdiff`, and every pair is walked.
 */
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { solveSolo } from "./solver.ts";
import {
  DIFF_EXTREME,
  DIFF_KINTERSECT,
  DIFF_RECURSIVE,
  decodeParams,
  newState,
  type SoloState,
} from "./state.ts";

/**
 * Published boards, pinned as descs rather than seeds so that a generator
 * change cannot quietly take a rung out of the corpus (Rome's
 * `rome-ladder.test.ts` says why). Between them they fire every rung; the
 * census below is what says so.
 */
const BOARDS: { label: string; board: string }[] = [
  { label: "2x2 Easy", board: "2x2db:c1_2f4_3c" },
  { label: "2x3 Normal", board: "2x3db:a2_1b3h3a1b4a6h3b4_5a" },
  {
    label: "3x3 Tricky",
    board: "3x3di:c2c3_7d4_3a1a4_3a9c8a2f4a8b1a6b3a6f1a8c4a2_5a4a7_9d3_9c8c",
  },
  {
    label: "3x3 Hard",
    board: "3x3da:a4_9a2g6_5g9c2_1_2b4d7_7_5e6_9_1d9b3_9_7c3g6_2g9a7_8a",
  },
  {
    label: "3x3 Extreme, forcing chain",
    board: "3x3de:e9_3e2a4_1c4b5a7_6b7c3_9_5c6c4c8_1_5c3b3_8a2b9c9_4a7e4_3e",
  },
  {
    label: "3x3 Extreme, digit set",
    board: "3x3r4de:1_3c8_2a4b7_6a2b5_2c1b8a8_1e6c4c5c7e3_8a5b4c1_7b1a5_9b3a1_2c5_7",
  },
  {
    label: "3x3 Unreasonable",
    board: "3x3du:b2b7b8b1a2_6_5c7a1c9a4b8c1a1g9a2c9b5a5c1a8c6_4_9a7b2b6b9b",
  },
  {
    label: "3x3 Hard X",
    board: "3x3xda:b5f9_2c1_4b4a1_2_9_8k2i2k4_1_7_6a8b9_6c3_4f7b",
  },
  {
    label: "3x3 Extreme X, diagonal set",
    board: "3x3xade:5_6b7e4c6c9f6b8j5d2f1a5d4a2_7b9c7d2d6_1a",
  },
  {
    label: "9 Jigsaw Hard",
    board:
      "9jda:6c5a2d7_2b1e3f5d3_7a8g7a4_3d1f5e1b3_7d9a6c2," +
      "cacababaea______bdab_abdb_cdbba__a_d_bcaadbdba__a__dcbca",
  },
  {
    label: "3x4 Normal",
    board:
      "3x4db:a12a5_3d1c2b12b8a3e3a9a2a7b4d3a6f6_2a5_9_11b4a7_1a10_8c11f9c12_7a3_" +
      "8a7b9_6_3a12_10f11a1d9b4a6a2a3e2a4b9b8c10d3_2a11a",
  },
  {
    label: "3x3 Killer, cage sums",
    board:
      "3x3ka:zzzc,___a__a__a_________________aaa_a__aa__________a____aaaaaba_aba__aaa_" +
      "aa_a__a_aaaba_a_aa_a__a_a___aaa__,15_14_8_8a5_12_11d19c5_10_7_11_8_12a14_11f10c" +
      "12_4a15b9a12a6_17a17a9_10a13a14a12e14a8a6_10a11f11a15a",
  },
];

function stateOf(board: string): SoloState {
  const colon = board.indexOf(":");
  return newState(decodeParams(board.slice(0, colon)), board.slice(colon + 1));
}

/**
 * A board one wrong digit away from its published one, so the corpus has
 * rungs proving boards inconsistent as well as solving them: the first empty
 * cell, holding the first digit its givens allow that is not its answer.
 */
function misplaced(board: string): SoloState {
  const s = stateOf(board);
  const { cr } = s;
  const answer = solveSolo(s).grid;
  const grid = s.grid.slice();
  const cell = grid.indexOf(0);
  const [x, y] = [cell % cr, (cell / cr) | 0];
  const b = s.blocks.whichblock[cell];
  for (let n = 1; n <= cr; n++) {
    if (n === answer[cell]) continue;
    const clash = grid.some(
      (v, i) =>
        v === n &&
        (i % cr === x || ((i / cr) | 0) === y || s.blocks.whichblock[i] === b),
    );
    if (clash) continue;
    grid[cell] = n;
    return { ...s, grid };
  }
  throw new Error(`${board}: no digit to misplace`);
}

const cases = [
  ...BOARDS.map(({ label, board }) => ({ label, board: () => stateOf(board) })),
  ...BOARDS.filter((b) => /Tricky|Hard$|Killer,/.test(b.label)).map(
    ({ label, board }) => ({
      label: `${label}, one digit wrong`,
      board: () => misplaced(board),
    }),
  ),
];

// Every pair of deduction caps, and search at the top one only: a search
// branch is a fresh solve through the ladder, and searching a killer board
// with its killer rungs capped away takes minutes.
const caps: number[] = [DIFF_RECURSIVE * 10 + DIFF_KINTERSECT];
for (let maxdiff = 0; maxdiff <= DIFF_EXTREME; maxdiff++)
  for (let maxkdiff = 0; maxkdiff <= DIFF_KINTERSECT; maxkdiff++)
    caps.push(maxdiff * 10 + maxkdiff);

describeLadderCensus<SoloState>({
  game: "solo",
  rungs: [
    "block-single",
    "killer-single",
    "killer-region",
    "killer-minmax",
    "killer-sums",
    "line-single",
    "diag-single",
    "naked-single",
    "line-intersect",
    "diag-intersect",
    "region-set",
    "diag-set",
    "digit-set",
    "forcing-chain",
  ],
  unreached: {},
  caps,
  cases,
  solve: (s, cap, firings) => solveSolo(s, Math.floor(cap / 10), cap % 10, firings),
});

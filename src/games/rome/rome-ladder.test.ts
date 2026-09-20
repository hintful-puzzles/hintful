/*
 * Rome's adoption of `runDeductionFixpoint`, proved by equivalence. The
 * harness and the argument for it are `engine/testing/ladder-equivalence.ts`;
 * this file is the declaration.
 *
 * **Rome is the adopter whose tier gates were mid-ladder `break`s**, and the
 * runner *skips* over-cap rungs instead. The two agree only because Rome's
 * ladder is tier-sorted, which `romeSolve` says at the `maxTier` line — this
 * file is the check on real boards at all three caps.
 */
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderEquivalence } from "../../engine/testing/ladder-equivalence.ts";
import { newRomeDesc } from "./generator.ts";
import { romeSolve, romeSolveLegacy } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  DIFF_TRICKY,
  type RomeParams,
  readDesc,
} from "./state.ts";

const SHAPES: RomeParams[] = [
  { w: 4, h: 4, diff: DIFF_EASY },
  { w: 6, h: 6, diff: DIFF_NORMAL },
  { w: 6, h: 6, diff: DIFF_TRICKY },
  { w: 8, h: 8, diff: DIFF_NORMAL },
  { w: 8, h: 8, diff: DIFF_TRICKY },
  { w: 10, h: 10, diff: DIFF_TRICKY },
];

// Five rather than three: `naked-pairs` fired on none of the first twelve
// boards, and widening is what the census is for — a rung goes in `unreached`
// only after the corpus has genuinely been given a chance to reach it.
const SEEDS = ["lad-a", "lad-b", "lad-c", "lad-d", "lad-e"];

/**
 * Two boards that fire `naked-pairs`, which thirty randomly seeded ones did
 * not, so the census has an entry for every rung rather than a shortfall.
 *
 * **They are pinned as descs, not as seeds**, because a seed reaches a rung
 * only through the generator, and a generator change would silently take the
 * corpus back to thirty boards with the census still reporting health. Found
 * 2026-09-20 by solving 120 published descs (6x6 and 8x8, Normal and Tricky)
 * and keeping the two that fired: the rate is around one board in sixty, which
 * is why five seeds a shape missed it.
 */
const PAIR_BOARDS: { label: string; params: RomeParams; desc: string }[] = [
  {
    label: "6x6 diff=2 naked-pairs",
    params: { w: 6, h: 6, diff: DIFF_TRICKY },
    desc: "1a1aa2a4b1a1ab2a1a4c3aaa1a2aa,aLDRDgRaXUDcLcRUaURg",
  },
  {
    label: "8x8 diff=2 naked-pairs",
    params: { w: 8, h: 8, diff: DIFF_TRICKY },
    desc:
      "2bac3a1a4b2b7a1a2aaa1ba6a3da3a4ba2a1ac5b3a," +
      "DDbDLaLcLReXDULbULULeURbUcRbUXdUDRDiL",
  },
];

const cases = [
  ...SHAPES.flatMap((params) =>
    SEEDS.map((seed) => {
      const label = `${params.w}x${params.h} diff=${params.diff} ${seed}`;
      const { desc } = newRomeDesc(params, randomNew(`rome-ladder-${label}`));
      return { label, board: () => readDesc(params, desc).board };
    }),
  ),
  ...PAIR_BOARDS.map(({ label, params, desc }) => ({
    label,
    board: () => readDesc(params, desc).board,
  })),
];

describeLadderEquivalence({
  game: "rome",
  rungs: [
    "single",
    "doubles",
    "loops",
    "find-4-position",
    "naked-pairs",
    "expand",
    "opposites",
  ],
  // Empty, which is the goal. `naked-pairs` stood here until `add-rome-hint`
  // (2026-09-20) found the two boards in `PAIR_BOARDS` above; the entry's own
  // instruction was to retire it by building a board that fires it.
  unreached: {},
  caps: [DIFF_EASY, DIFF_NORMAL, DIFF_TRICKY],
  cases,
  viaRunner: romeSolve,
  viaLegacy: romeSolveLegacy,
  // `grid` is the placed arrows, `pencil` the solver's live candidate set;
  // `regions` is the static layout and is never merged while solving.
  key: (b) => `${Array.from(b.grid).join(",")}|${Array.from(b.pencil).join(",")}`,
});

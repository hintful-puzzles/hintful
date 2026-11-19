/**
 * What stands in for an oracle: every board dealt needs exactly the tier it
 * was asked at, and every rung of the ladder fires on boards the generator
 * deals (docs/testing.md § "What a new game ships"). The ladder decides only
 * what the rules force, so a board it finishes has one answer.
 */

import { randomNew } from "../../engine/random/index.ts";
import { describeDealtTiers } from "../../engine/testing/absent-tiers.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { leafPresets } from "../../engine/testing/presets.ts";
import { newWordtrailDesc } from "./generator.ts";
import { wordtrailGame } from "./index.ts";
import { solveWordtrail, WORDTRAIL_RUNGS } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  encodeParams,
  newState,
  type WordtrailParams,
} from "./state.ts";

/** Every preset, the smallest board at each tier, one that is not square,
 * one with a single word, and the largest. */
const SHAPES: WordtrailParams[] = [
  ...leafPresets(wordtrailGame).map((l) => l.params),
  { w: 3, h: 3, words: 2, diff: DIFF_EASY },
  { w: 3, h: 3, words: 2, diff: DIFF_NORMAL },
  { w: 3, h: 2, words: 1, diff: DIFF_EASY },
  { w: 6, h: 4, words: 4, diff: DIFF_NORMAL },
  { w: 8, h: 8, words: 8, diff: DIFF_NORMAL },
];

describeDealtTiers(
  wordtrailGame,
  SHAPES.map((p) => encodeParams(p, true)),
);

const SEEDS = ["a", "b", "c"];

describeLadderCensus<WordtrailParams & { desc: string }>({
  game: "wordtrail",
  rungs: WORDTRAIL_RUNGS,
  unreached: {},
  caps: [DIFF_EASY, DIFF_NORMAL],
  cases: SHAPES.flatMap((p) =>
    SEEDS.map((seed) => {
      const label = `${encodeParams(p, true)} ${seed}`;
      return {
        label,
        board: () => ({
          ...p,
          desc: newWordtrailDesc(p, randomNew(`ladder ${label}`)).desc,
        }),
      };
    }),
  ),
  solve: (p, cap, firings) => solveWordtrail(newState(p, p.desc), cap, firings),
});

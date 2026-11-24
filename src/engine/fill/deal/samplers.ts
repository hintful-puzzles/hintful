/**
 * How a draw samples its answer, a sampler for each kind of `deal.sample`,
 * keyed by the key that names the kind. A sampler that deals its partition
 * with the answer (`search`) returns both; the others leave the partition to
 * `partition.ts`.
 */

import { drawRejected } from "../../contract/deal-census.ts";
import type { Clues } from "../board.ts";
import { piecesOf } from "../params/tally.ts";
import {
  type Sample,
  sampleAnswer,
  sampleDominoes,
  sampleLatin,
  sampleLines,
  samplePicture,
  samplePieces,
} from "../sample.ts";
import { searchedPositions } from "../search.ts";
import { buildAnswer, climbBuild, DEAD_END } from "./build.ts";
import type { DealContext, Grown } from "./context.ts";
import { firstLaid } from "./first-laid.ts";
import { divided } from "./partition.ts";

/** The positions the search for an answer under a divided partition may try
 * (`sample: { search: true }`) before the draw is thrown away and the
 * partition divided again. */
const ANSWER_SEARCH_BUDGET = 2_000;

/** An answer drawn, and the partitions drawn with it; `null` where they are
 * left to be dealt round it. */
export interface Drawn {
  readonly g: Uint8Array;
  readonly grown: Grown | null;
}

type SampleKey =
  | "search"
  | "build"
  | "dominoes"
  | "lines"
  | "picture"
  | "pieces"
  | "latin"
  | "scatter";

type Sampler<S> = <C extends Clues<C>>(sample: S, cx: DealContext<C>) => Drawn | null;

/** An answer alone, or the draw refused where there is none. */
const answer = (g: Uint8Array | null): Drawn | null =>
  g === null ? drawRejected("fill: the sample drew no answer") : { g, grown: null };

const SAMPLERS: {
  readonly [K in SampleKey]: Sampler<Extract<Sample, Readonly<Record<K, unknown>>>>;
} = {
  search(_, cx) {
    const grown = divided(cx);
    if (grown === null) return null;
    const blank = new Uint8Array(cx.sp.cells.length);
    const found = searchedPositions(
      cx.module,
      cx.board(cx.module.deriveClues(blank, cx.sp, grown, cx.given)),
      { budget: ANSWER_SEARCH_BUDGET, random: cx.rs },
      1,
    );
    if (found === null || found.length === 0)
      return drawRejected("fill: the search found no answer under the partition");
    return { g: found[0], grown };
  },
  build(sample, cx) {
    const g = buildAnswer(
      cx.module,
      cx.deal,
      sample,
      cx.sp,
      cx.p,
      cx.rs,
      cx.layouts++,
      cx.buildTier,
    );
    return answer(
      g === DEAD_END ? climbBuild(cx, "fill: the build met a dead end") : g,
    );
  },
  dominoes: (sample, cx) => answer(sampleDominoes(sample, cx.sp, cx.rs)),
  lines: (sample, cx) => answer(sampleLines(sample, cx.sp, cx.sizes, cx.rs)),
  picture: (sample, cx) => answer(samplePicture(sample, cx.sp, cx.rs)),
  pieces: (sample, cx) =>
    answer(samplePieces(sample, cx.sp.w, cx.sp.h, piecesOf(cx.deal, cx.p), cx.rs)),
  latin: (_, cx) => answer(sampleLatin(cx.sp, cx.rs)),
  scatter: (sample, cx) =>
    answer(
      sampleAnswer(
        sample,
        cx.sp,
        cx.rs,
        sample.first === undefined
          ? null
          : firstLaid(sample.first, cx.deal, cx.p, cx.rs, cx.layouts++),
      ),
    ),
};

/** A draw of `sample`'s answer by its kind's sampler. */
export function drawSample<C extends Clues<C>>(
  sample: Sample,
  cx: DealContext<C>,
): Drawn | null {
  const key = (Object.keys(SAMPLERS) as SampleKey[]).find((k) => k in sample);
  if (key === undefined) throw new Error("deal: a sample of no kind");
  return (SAMPLERS[key] as Sampler<Sample>)(sample, cx);
}

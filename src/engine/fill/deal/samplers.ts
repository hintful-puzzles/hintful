/**
 * How a draw samples its answer, a sampler for each kind of `deal.sample`,
 * keyed by the key that names the kind. A sampler that deals its partition
 * with the answer (`search`) returns both; the others leave the partition to
 * `partition.ts`.
 */

import { drawRejected } from "../../contract/deal-census.ts";
import { inHexagon } from "../../solve/describe-runtime.ts";
import { type Clues, elementsOf, topValue } from "../board.ts";
import { dividePartition } from "../divide.ts";
import { piecesOf } from "../params/tally.ts";
import {
  type LatinSample,
  type Sample,
  sampleAnswer,
  sampleDominoes,
  sampleLatin,
  sampleLines,
  samplePicture,
  samplePieces,
  wallsOf,
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

/** The tier the search for an answer deduces up to: the easiest, or none
 * where the easiest is the search tier. Any answer will do, and a stronger
 * technique costs more at every position than the branches it saves: Solo's
 * search over its whole ladder below Unreasonable, `latin.set`'s walk of
 * each line's subsets included, dealt 3x3 Unreasonable in 101 ms and at the
 * easiest tier in 19 (median of six seeds, bundled, 2026-11-27). */
const ANSWER_SEARCH_CAP = 0;

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
  | "scatter"
  | "walls";

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
      {
        budget: ANSWER_SEARCH_BUDGET,
        random: cx.rs,
        cap: Math.min(ANSWER_SEARCH_CAP, cx.module.tiers.length - 2),
      },
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
  // The domain is read off the sizes, which the clues hold where a deal
  // keeps them.
  latin<C extends Clues<C>>(_: LatinSample, cx: DealContext<C>) {
    const top = topValue(cx.module, cx.sp, cx.sizes as unknown as C);
    return answer(sampleLatin(cx.sp, cx.rs, top));
  },
  walls(sample, cx) {
    const parts = dividePartition(sample.walls.division, cx.sp, cx.sizes, cx.rs);
    return answer(parts === null ? null : wallsOf(sample, cx.sp, parts));
  },
  scatter: (sample, cx) => {
    const first =
      sample.first === undefined
        ? null
        : firstLaid(sample.first, cx.deal, cx.p, cx.rs, cx.layouts++);
    return answer(
      sampleAnswer(
        sample,
        cx.sp,
        cx.rs,
        outsideKept(sample, cx, first),
        elementsOf(cx.module, cx.sp),
      ),
    );
  },
};

/**
 * `kept`, with each cell of a hexagon's store outside the hexagon holding the
 * value the scatter leaves a cell: drawn there, a scattered value broke the
 * outside kind's meaning on all but one draw in hundreds (`shearing`, 5 high,
 * 2026-11-24). `kept` as it is on a board that is no hexagon, and for a
 * scatter not drawn a cell at a time, which keeps no cell.
 */
function outsideKept<C extends Clues<C>>(
  sample: Extract<Sample, { scatter: unknown }>,
  cx: DealContext<C>,
  kept: Uint8Array | null,
): Uint8Array | null {
  if (cx.module.hexagon === undefined || sample.scatter.each !== true) return kept;
  const { sp } = cx;
  const out = kept === null ? new Uint8Array(sp.cells.length) : kept.slice();
  for (const c of sp.cells)
    if (!inHexagon(sp.w, sp.h, c % sp.w, Math.floor(c / sp.w))) out[c] = sample.rest;
  return out;
}

/** A draw of `sample`'s answer by its kind's sampler. */
export function drawSample<C extends Clues<C>>(
  sample: Sample,
  cx: DealContext<C>,
): Drawn | null {
  const key = (Object.keys(SAMPLERS) as SampleKey[]).find((k) => k in sample);
  if (key === undefined) throw new Error("deal: a sample of no kind");
  return (SAMPLERS[key] as Sampler<Sample>)(sample, cx);
}

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
import { sampleGroup } from "../group-table.ts";
import { piecesOf } from "../params/tally.ts";
import { isUnder } from "../params/under.ts";
import {
  type LatinSample,
  type OnceSample,
  type Sample,
  sampleAnswer,
  sampleDominoes,
  sampleLatin,
  sampleLines,
  sampleOnce,
  samplePicture,
  samplePieces,
  sampleUniform,
  type UniformSample,
  wallsOf,
} from "../sample.ts";
import { searchedPositions } from "../search.ts";
import { buildAnswer, climbBuild, DEAD_END } from "./build.ts";
import type { DealContext, Grown } from "./context.ts";
import { firstLaid } from "./first-laid.ts";
import { keepingAll } from "./keeping.ts";
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
 * left to be dealt round it. `blank` is the cells dealt no clue of a kind
 * the deal hides, where the sample leaves any. */
export interface Drawn {
  readonly g: Uint8Array;
  readonly grown: Grown | null;
  readonly blank?: readonly number[];
}

type SampleKey =
  | "search"
  | "build"
  | "dominoes"
  | "group"
  | "lines"
  | "picture"
  | "pieces"
  | "latin"
  | "once"
  | "scatter"
  | "uniform"
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
  // A partition divided apart from the answer is divided first, and the
  // answer built on it (Magnets' tiles).
  build(sample, cx) {
    const grown = cx.deal.divide === undefined ? {} : divided(cx);
    if (grown === null) return null;
    const g = buildAnswer(
      cx.module,
      cx.deal,
      sample,
      cx.sp,
      cx.p,
      cx.rs,
      cx.layouts++,
      cx.buildTier,
      grown,
    );
    if (g === DEAD_END) return climbBuild(cx, "fill: the build met a dead end");
    if (g === null) return drawRejected("fill: the sample drew no answer");
    return { g, grown: cx.deal.divide === undefined ? null : grown };
  },
  dominoes: (sample, cx) => answer(sampleDominoes(sample, cx.sp, cx.rs)),
  group(sample, cx) {
    const { hidden } = sample.group;
    const got = sampleGroup(
      sample,
      cx.sp,
      cx.rs,
      hidden !== undefined && isUnder(cx.deal, cx.p, cx.variations, hidden),
    );
    return { g: got.g, grown: null, blank: got.blank };
  },
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
  once<C extends Clues<C>>(_: OnceSample, cx: DealContext<C>) {
    const top = topValue(cx.module, cx.sp, cx.sizes as unknown as C);
    return answer(sampleOnce(cx.sp.cells.length, top, cx.rs));
  },
  walls(sample, cx) {
    const parts = dividePartition(sample.walls.division, cx.sp, cx.sizes, cx.rs);
    return answer(parts === null ? null : wallsOf(sample, cx.sp, parts));
  },
  uniform<C extends Clues<C>>(sample: UniformSample, cx: DealContext<C>) {
    const first =
      sample.first === undefined
        ? null
        : firstLaid(sample.first, cx.deal, cx.p, cx.rs, cx.layouts++);
    // The domain may read what the first cells deal (Crossing's digits, on
    // squares that are no wall), so its top is read with them.
    const laid =
      first === null
        ? (cx.sizes as unknown as C)
        : firstClues(cx, sample.reads ?? [], first);
    if (first !== null && cx.module.firstKeeps?.(cx.sp, laid, cx.p.diff) === false)
      return drawRejected("fill: the first cells' keep refuses them");
    const top = topValue(cx.module, cx.sp, laid);
    return answer(sampleUniform(sample, cx.sp.cells.length, top, first, cx.rs));
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

/** The clues `first` derives of the kinds `reads` names, with the sizes:
 * every other kind derived from first cells alone is no answer's. */
function firstClues<C extends Clues<C>>(
  cx: DealContext<C>,
  reads: readonly string[],
  first: Uint8Array,
): C {
  const laid = keepingAll(
    cx.module.deriveClues(first, cx.sp, {}, cx.given),
    cx.deal,
    Object.keys(cx.deal.universes).filter((k) => !reads.includes(k)),
    cx.sp,
    [],
  );
  return { ...laid, ...cx.sizes };
}

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

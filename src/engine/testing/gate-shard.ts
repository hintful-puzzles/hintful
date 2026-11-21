/**
 * Which part of the suite a shard of CI's Gate workflow runs.
 *
 * CI runs the suite as a matrix of jobs on runners of their own, so that its
 * wall time follows the suite's CPU time over the shards rather than over one
 * runner's workers (`build-pipeline`, "CI runs the suite in shards"). The
 * workflow names each job's part in `GATE_CI_PART`, as `<shard>/<shards>`
 * counted from 1, and `vitest.config.ts` keeps the files of that shard.
 *
 * vitest's own `--shard` is not used: it places a file by the hash of its
 * path alone, so every share of a spread file (`SPREAD` there) would land in
 * one shard, and that shard would walk each spread sweep whole.
 *
 * Dev/test-only; never imported by production code.
 */

/** A shard of CI's suite: the `index`-th of `of`, from 0. */
interface GateShard {
  readonly index: number;
  readonly of: number;
}

/** The shard this run is, or `null` for a run of the whole suite. */
export function shardFromEnv(
  env: Readonly<Partial<Record<string, string>>>,
): GateShard | null {
  const part = env["GATE_CI_PART"];
  const match = /^(\d+)\/(\d+)$/.exec(part ?? "");
  if (match === null) return null;
  const index = Number(match[1]) - 1;
  const of = Number(match[2]);
  if (index < 0 || index >= of)
    throw new Error(`GATE_CI_PART names shard ${part}, which is not one of its count`);
  return { index, of };
}

/**
 * Whether a test file is the shard's. A file is placed by its path's hash, so
 * a file added or removed moves no other between shards, and every shard
 * computes the same placement from the same tree without asking another.
 * The placement does not know what a file costs, so the shards' totals
 * differ by the luck of the hash; `test-cost.ts` judges their mean.
 */
export function inShard(file: string, shard: GateShard): boolean {
  // FNV-1a over the path's UTF-16 units: any hash that spreads paths will do.
  let hash = 0x811c9dc5;
  for (let i = 0; i < file.length; i++)
    hash = Math.imul(hash ^ file.charCodeAt(i), 0x01000193) >>> 0;
  return hash % shard.of === shard.index;
}

/**
 * The shares of a spread file a shard walks: `perShard` of them, numbered
 * after those of the shards before it, out of `perShard` for every shard. So
 * the shards together walk every share once, whatever their count.
 */
export function sharesOf(
  shard: GateShard | null,
  perShard: number,
): { index: number; of: number }[] {
  const { index, of } = shard ?? { index: 0, of: 1 };
  return Array.from({ length: perShard }, (_, k) => ({
    index: index * perShard + k,
    of: of * perShard,
  }));
}

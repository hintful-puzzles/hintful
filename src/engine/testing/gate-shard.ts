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
 * The test files of `files` that are the shard's. They are ordered by their
 * paths' hashes and dealt in turn, so each shard holds as many files as the
 * next, give or take one, and every shard computes the same placement from
 * the same tree without asking another. A file's own hash residue is no
 * placement: FNV-1a's low bits follow its characters' low bits, and four
 * shards by `hash % 4` drew 252, 136, 154 and 106 of 648 files (Gate run
 * 44877134962). The placement does not know what a file costs, so the
 * shards' totals still differ by the luck of the order; `test-cost.ts`
 * judges their mean.
 */
export function ofShard(files: readonly string[], shard: GateShard): string[] {
  return files
    .map((file) => ({ file, hash: fnv1a(file) }))
    .sort((a, b) => a.hash - b.hash || (a.file < b.file ? -1 : 1))
    .filter((_, i) => i % shard.of === shard.index)
    .map(({ file }) => file)
    .sort();
}

/** FNV-1a over a string's UTF-16 units: an order unrelated to the paths'. */
function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++)
    hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193) >>> 0;
  return hash;
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

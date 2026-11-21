/**
 * CI's shards together run every test file and every share of a spread sweep
 * exactly once. A file or a share no shard holds runs nowhere, and every shard
 * reports green.
 */
import { describe, expect, it } from "vitest";
import { inShard, shardFromEnv, sharesOf } from "./gate-shard.ts";

const shardsOf = (of: number) =>
  Array.from({ length: of }, (_, index) => ({ index, of }));

describe("CI's shards", () => {
  it("read their part as one-based, and a run outside them as the whole suite", () => {
    expect(shardFromEnv({ GATE_CI_PART: "3/4" })).toEqual({ index: 2, of: 4 });
    for (const part of [undefined, "", "checks", "suite"])
      expect(shardFromEnv({ GATE_CI_PART: part })).toBeNull();
    expect(() => shardFromEnv({ GATE_CI_PART: "5/4" })).toThrow();
    expect(() => shardFromEnv({ GATE_CI_PART: "0/4" })).toThrow();
  });

  it("place each file in exactly one shard", () => {
    const files = Array.from({ length: 200 }, (_, i) => `src/guards/g${i}.test.ts`);
    for (const of of [1, 2, 3, 4, 7]) {
      for (const file of files)
        expect(shardsOf(of).filter((s) => inShard(file, s)).length, file).toBe(1);
      // A placement that put everything in one shard would pass the above.
      if (of > 1)
        for (const shard of shardsOf(of))
          expect(files.some((f) => inShard(f, shard))).toBe(true);
    }
  });

  it("walk every share of a spread sweep exactly once between them", () => {
    for (const of of [1, 2, 3, 4, 7])
      for (const perShard of [1, 4]) {
        const shares = shardsOf(of).flatMap((s) => sharesOf(s, perShard));
        expect(new Set(shares.map((s) => s.of))).toEqual(new Set([of * perShard]));
        expect(shares.map((s) => s.index)).toEqual(
          Array.from({ length: of * perShard }, (_, i) => i),
        );
      }
    expect(sharesOf(null, 4)).toEqual(sharesOf({ index: 0, of: 1 }, 4));
  });
});

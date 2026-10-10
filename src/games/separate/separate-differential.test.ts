/**
 * The boards upstream's C dealt, against the ported solver.
 *
 * Upstream kept a board only when its solver solved it, so the ported solver
 * solving every one says it reaches upstream's verdict on them. The generator
 * is not upstream's (it places letters for the solver where upstream filled
 * at random), so no seed is asked to deal its board again.
 *
 * The fixture is **frozen and cannot be regenerated**: the C build and the
 * trace harness that captured it are gone — see `engine/testing/differential.ts`.
 */
import { describe, expect, it } from "vitest";
import cReference from "./__fixtures__/separate-c-reference.json" with { type: "json" };
import { solve } from "./solver.ts";

interface Fixture {
  seed: string;
  desc: string;
  w: number;
  h: number;
  k: number;
}
const data = cReference as { fixtures: Fixture[] };

describe("separate's solver on upstream's boards (frozen C reference)", () => {
  it.each(
    data.fixtures.map((f) => [`${f.w}x${f.h}n${f.k} seed=${f.seed}`, f] as const),
  )("solves %s", (_label, f) => {
    const letters = Uint8Array.from(f.desc, (c) => c.charCodeAt(0) - 65);
    expect(letters).toHaveLength(f.w * f.h);
    expect(solve(f, letters)).not.toBeNull();
  });
});

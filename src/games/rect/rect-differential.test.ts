/**
 * Gated byte-match differential: the TS generator reproduces the C generator's
 * `desc` **and** `aux` byte for byte for the same seed and params.
 *
 * This is the strongest bar available (docs/games/testing.md § "Byte-match:
 * fidelity where there is a right answer") and the guard that the generator's
 * RNG draw order *and* the souped-up `rect_solver` (the only data-dependent
 * branch of the generation loop, via the uniqueness gate) are faithful: the
 * produced desc depends on the solver's verdict on every candidate layout and
 * on every winnowing draw, so a subtle divergence in either shows up here as a
 * mismatched desc. `random.ts` is bit-identical to `random.c`, and every
 * generation draw is a `randomUpto`.
 *
 * The fixtures are a frozen recording from upstream's `auxiliary/rect-trace.c`
 * harness; neither it nor `rect.c` is in this repo.
 *
 * The generator deals only boards the hint's rungs finish (`rungsFinish`), and
 * deals again where C would return one they do not, so a seed whose C board is
 * one of those diverges from C there on purpose. No fixture here is such a
 * board; `rect-hint.test.ts` pins one as the board the gate turns away. The two
 * fixtures C dealt with "Ensure unique solution" off are retired with the
 * option.
 */

import { describe, expect, it } from "vitest";
import { validateDesc } from "../../engine/desc-error.ts";
import { randomNew } from "../../engine/random/index.ts";
import reference from "./__fixtures__/rect-c-reference.json" with { type: "json" };
import { newDesc } from "./generator.ts";
import { rectGame } from "./index.ts";
import type { RectParams } from "./state.ts";

interface RectFixture {
  w: number;
  h: number;
  expandfactor: number;
  seed: string;
  desc: string;
  aux: string;
}

const FIXTURES: readonly RectFixture[] = reference.fixtures;

const paramsOf = (f: RectFixture): RectParams => ({
  w: f.w,
  h: f.h,
  expandfactor: f.expandfactor,
});

describe("rect differential (vs C reference)", () => {
  for (const f of FIXTURES) {
    const label = `${f.w}x${f.h}${f.expandfactor ? `e${f.expandfactor}` : ""} seed=${f.seed}`;
    it(`reproduces the C desc + aux byte for byte — ${label}`, () => {
      const p = paramsOf(f);
      const { desc, aux } = newDesc(p, randomNew(f.seed));
      expect(desc).toBe(f.desc);
      expect(aux).toBe(f.aux);
      expect(validateDesc(rectGame, p, desc)).toBeNull();
    });
  }
});

/**
 * Same Game — gated differential check against a frozen snapshot of
 * C-generated reference boards (`__fixtures__/samegame-c-reference.json`).
 *
 * Same Game's generator consults no solver (unlike Flood), so the *desc* is
 * the whole reproducible output. The bar is therefore that the TS generator
 * reproduces the C engine's grid byte-for-byte for the same seed, proving
 * `random.ts` is bit-identical through every `randomUpto` call the generator
 * makes. The fixtures C's random-scatter generator dealt are retired with it.
 *
 * The fixture is **frozen and cannot be regenerated**: the build it was
 * captured under is gone with the C sources and the harness (see
 * `engine/testing/differential.ts`).
 */
import { expect } from "vitest";
import { validateDesc } from "../../engine/desc-error.ts";
import { describeDescDifferential } from "../../engine/testing/differential.ts";
import cReference from "./__fixtures__/samegame-c-reference.json" with { type: "json" };
import { samegameGame } from "./index.ts";
import { newDesc, type SamegameParams } from "./state.ts";

interface Fixture {
  w: number;
  h: number;
  ncols: number;
  scoresub: number;
  seed: string;
  desc: string;
}

const data = cReference as { fixtures: Fixture[] };

describeDescDifferential<Fixture, SamegameParams>({
  title: "Same Game differential (frozen C reference)",
  fixtures: data.fixtures,
  label: (f) => `${f.w}x${f.h}c${f.ncols}s${f.scoresub} seed=${f.seed}`,
  params: (f) => ({
    w: f.w,
    h: f.h,
    ncols: f.ncols,
    scoresub: f.scoresub,
  }),
  newDesc,
  extra: (f, p) => {
    expect(validateDesc(samegameGame, p, f.desc)).toBeNull();
  },
});

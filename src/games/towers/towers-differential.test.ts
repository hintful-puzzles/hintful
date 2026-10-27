/**
 * Gated C-vs-TS differential for the Towers port. Reads the committed fixture
 * recorded from upstream towers.c (puzzles/auxiliary/towers-trace.c) and
 * asserts:
 *
 *  1. TS `newTowersDesc` over the same seed reproduces the C desc
 *     byte-for-byte — the whole generation chain (Latin square → clue
 *     derivation → solver-gated removal) is a faithful port and the RNG is
 *     bit-identical, so the streams must agree exactly.
 *  2. The TS solver grades the C-generated board at the C-recorded difficulty
 *     (and does not solve it one level below).
 *
 * The fixture is **frozen and cannot be regenerated**: the C build and the
 * trace harness that captured it no longer exist — see
 * `engine/testing/differential.ts`.
 *
 * **From Tricky up the fixtures are re-founded.** Upstream's Tricky
 * (`DIFF_EXTREME`) has forcing chains, which here are a search and sit at
 * Unreasonable, so a board the C graded Tricky by a chain grades Unreasonable,
 * and the generator from Tricky up keeps different boards. Those fixtures keep
 * the grade, Tricky or the Unreasonable the chain moved to, and drop the
 * byte-match.
 */
import { describe, expect, it } from "vitest";
import { describeDescDifferential } from "../../engine/testing/differential.ts";
import cReference from "./__fixtures__/towers-c-reference.json" with { type: "json" };
import { newTowersDesc } from "./generator.ts";
import { DIFF_AMBIGUOUS, DIFF_IMPOSSIBLE, solveTowers } from "./solver.ts";
import {
  DIFF_EXTREME,
  DIFF_UNREASONABLE,
  diffFromLevel,
  newState,
  type TowersParams,
} from "./state.ts";

interface Fixture {
  w: number;
  diff: number;
  seed: string;
  desc: string;
  solverDiff: number;
}

const data = cReference as { fixtures: Fixture[] };

const params = (f: Fixture): TowersParams => ({ w: f.w, diff: diffFromLevel(f.diff) });
const label = (f: Fixture) => `${f.w}d${f.diff} seed=${f.seed}`;

// 1. Byte-for-byte desc match — the shared faithful-generator bar.
describeDescDifferential<Fixture, TowersParams>({
  title: "Towers C-vs-TS differential — desc byte-match (gated)",
  fixtures: data.fixtures.filter((f) => f.diff < DIFF_EXTREME),
  label,
  params,
  newDesc: (p, rng) => newTowersDesc(p, rng),
});

// 2. Solver agreement — game-specific (decode + grade), inline.
describe("Towers C-vs-TS differential — solver agreement (gated)", () => {
  for (const f of data.fixtures) {
    const p = params(f);
    it(`${label(f)}: TS solver grades the C board at the recorded difficulty`, () => {
      const s = newState(p, f.desc);
      // Grades exactly at the recorded difficulty, or a chain's Tricky at
      // Unreasonable.
      const soln = Uint8Array.from(s.immutable);
      const ret = solveTowers(f.w, s.clues, soln, f.solverDiff);
      if (f.solverDiff === DIFF_EXTREME && ret !== DIFF_EXTREME) {
        const searched = Uint8Array.from(s.immutable);
        expect(solveTowers(f.w, s.clues, searched, DIFF_UNREASONABLE)).toBe(
          DIFF_UNREASONABLE,
        );
      } else expect(ret).toBe(f.solverDiff);
      // Not solvable one level below.
      if (f.solverDiff > 0) {
        const below = Uint8Array.from(s.immutable);
        const r = solveTowers(f.w, s.clues, below, f.solverDiff - 1);
        expect(
          r === DIFF_IMPOSSIBLE || r === DIFF_AMBIGUOUS || r > f.solverDiff - 1,
        ).toBe(true);
      }
    });
  }
});

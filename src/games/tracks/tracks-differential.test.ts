/**
 * Gated byte-match differential for the Tracks generator + solver.
 *
 * For each C-recorded fixture: (1) at Easy, the TS `newDesc` over the same
 * seed reproduces the C desc byte-for-byte (a faithful solver-gated generator
 * over the bit-identical `random.ts`), and (2) the TS solver grades the C board
 * at the recorded difficulty and one rung below fails to solve it.
 *
 * Above Easy the byte-match is retired, not re-recorded: `addClues` no longer
 * rejects a bare board that stalls short of the target tier
 * (`deal-every-tracks-board`), so any seed whose deal met one now deals a
 * different board. Easy cannot reach that branch. What replaces the oracle
 * there is `difficulty-contract.test.ts`, which grades generated boards at
 * exactly their preset's tier.
 */
import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import fixtures from "./__fixtures__/tracks-c-reference.json" with { type: "json" };
import { newDesc } from "./generator.ts";
import { tracksSolve } from "./solver.ts";
import { DIFF_EASY, newState, stateToBoard, type TracksParams } from "./state.ts";

interface Fixture {
  w: number;
  h: number;
  diff: number;
  single_ones: number;
  seed: string;
  desc: string;
  solveRet: number;
  gradeDiff: number;
}

const paramsOf = (f: Fixture): TracksParams => ({
  w: f.w,
  h: f.h,
  diff: f.diff,
  singleOnes: f.single_ones !== 0,
});

describe("tracks generator differential (byte-match vs C)", () => {
  const all = fixtures.fixtures as Fixture[];
  const easy = all.filter((f) => f.diff === DIFF_EASY);

  it("keeps an Easy fixture to byte-match", () => {
    expect(easy.length).toBeGreaterThan(0);
  });

  for (const f of easy) {
    it(`${f.seed} (${f.w}x${f.h} diff=${f.diff}): TS desc matches C byte-for-byte`, () => {
      const { desc } = newDesc(paramsOf(f), randomNew(f.seed));
      expect(desc).toBe(f.desc);
    });
  }

  for (const f of all) {
    it(`${f.seed}: TS solver grades the C board at difficulty ${f.gradeDiff}`, () => {
      const board = stateToBoard(newState(paramsOf(f), f.desc));
      const graded = tracksSolve(board, 3 /* DIFF_COUNT */);
      expect(graded.ret).toBe(f.solveRet);
      expect(graded.maxDiff).toBe(f.gradeDiff);
      if (f.gradeDiff > 0) {
        const easier = tracksSolve(
          stateToBoard(newState(paramsOf(f), f.desc)),
          f.gradeDiff - 1,
        );
        expect(easier.ret).toBeLessThan(1); // one rung below cannot finish
      }
    });
  }
});

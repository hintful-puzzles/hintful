/**
 * Net: the frozen C-generated boards (`__fixtures__/net-c-reference.json`),
 * decoded rather than regenerated.
 *
 * Each board was one upstream's generator accepted, with its solution as
 * upstream recorded it. So each must still validate and have one answer, the
 * solution recorded: a net under the codec and the search that no longer
 * depends on reproducing upstream's generator, which the ladder the
 * description states replaced. What the shipped generator guarantees is
 * asserted in `net.test.ts` and `net-tier.test.ts`.
 *
 * The fixture is **frozen and cannot be regenerated**: the harness that
 * captured it is gone (see `engine/testing/differential.ts`).
 */

import { describe, expect, it } from "vitest";
import { DIFF_EASY } from "../../engine/answer-search.ts";
import { validateDesc } from "../../engine/desc-error.ts";
import reference from "./__fixtures__/net-c-reference.json" with { type: "json" };
import { netGame } from "./index.ts";
import { answerOf } from "./solver.ts";
import { isComplete, type NetParams, newState } from "./state.ts";

interface NetFixture {
  w: number;
  h: number;
  wrapping: boolean;
  barrierProbability: number;
  seed: string;
  desc: string;
  aux: string;
}

const FIXTURES: readonly NetFixture[] = reference.fixtures;

describe("Net frozen C boards", () => {
  it("covers every recorded board", () => {
    expect(FIXTURES).toHaveLength(12);
  });

  for (const f of FIXTURES) {
    const p: NetParams = {
      w: f.w,
      h: f.h,
      wrapping: f.wrapping,
      barrierProbability: f.barrierProbability,
      diff: DIFF_EASY,
    };
    it(`${f.w}x${f.h}${f.wrapping ? "w" : ""} ${f.seed}: decodes and has one answer, upstream's`, () => {
      expect(validateDesc(netGame, p, f.desc)).toBeNull();
      const s = newState(p, f.desc);
      const answer = answerOf(s);
      if (answer.kind !== "one") throw new Error(`${f.seed}: ${answer.kind}`);
      expect(Array.from(answer.solution, (t) => t.toString(16)).join("")).toBe(f.aux);
      const solved = {
        ...s,
        tiles: Uint8Array.from(f.aux, (c) => Number.parseInt(c, 16)),
      };
      expect(isComplete(solved)).toBe(true);
    });
  }
});

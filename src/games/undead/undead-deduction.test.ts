/**
 * The Undead ladder as the generator grades by it: each tier's rung needed
 * on a board that needs it, a board with two answers left unsolved rather
 * than guessed, and the guess-free generation property: every accepted board
 * is solved by the ladder with **zero recursion**, at the rung its tier
 * demands. Each technique's soundness is the description checker's.
 */
import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { newUndeadDesc } from "./generator.ts";
import {
  isUniquelySolvable,
  RUNG_ARC,
  RUNG_COUNTING,
  RUNG_FORCING,
  solveDeductive,
} from "./solver.ts";
import {
  type Difficulty,
  MON_NONE,
  MON_VAMPIRE,
  MON_ZOMBIE,
  newState,
  type UndeadParams,
} from "./state.ts";

const undecided = (n: number): Uint8Array => new Uint8Array(n).fill(MON_NONE);

describe("undead counting rung", () => {
  it("is required for a Normal board the sightlines alone leave open", () => {
    // Dealt by the generator from the seed "undead-counting-2".
    const params: UndeadParams = { w: 4, h: 4, diff: "normal" };
    const common = newState(
      params,
      "2,5,4,RgLaRbRLa,0,4,2,4,5,3,2,2,4,0,0,1,1,1,3,0",
    ).common;
    expect(solveDeductive(common, undecided(common.numTotal), RUNG_ARC).solved).toBe(
      false,
    );
    const counting = solveDeductive(common, undecided(common.numTotal), RUNG_COUNTING);
    expect(counting.solved).toBe(true);
    expect(counting.rung).toBe(RUNG_COUNTING);
  });
});

describe("undead forcing rung", () => {
  it("is required for a Tricky board (counting alone stalls, forcing finishes)", () => {
    const params: UndeadParams = { w: 5, h: 5, diff: "tricky" };
    const { desc } = newUndeadDesc(params, randomNew("undead-forcing-rung"));
    const common = newState(params, desc).common;
    const start = undecided(common.numTotal);

    // Sightlines and counting cannot finish a Tricky board…
    expect(solveDeductive(common, start, RUNG_COUNTING).solved).toBe(false);
    // …but the depth-1 forcing rung does, with no recursion.
    const forcing = solveDeductive(common, start, RUNG_FORCING);
    expect(forcing.solved).toBe(true);
    expect(forcing.rung).toBe(RUNG_FORCING);
  });
});

describe("undead deduction/recursion boundary", () => {
  it("leaves a genuinely ambiguous board unsolved rather than guessing", () => {
    // Two squares side by side, no mirror, a vampire and a zombie: each shows
    // one monster up and down its column and two along the row either way
    // round, so depth-1 forcing finds no contradiction either way. The ladder
    // must NOT nest hypotheses to pick one: it leaves the board unsolved.
    const common = newState({ w: 2, h: 1, diff: "easy" }, "0,1,1,b,1,1,2,1,1,2").common;
    const result = solveDeductive(common, undecided(2), RUNG_FORCING);
    expect(result.solved).toBe(false);
    expect(result.inconsistent).toBe(false);
    expect(Array.from(result.guess)).toEqual([
      MON_VAMPIRE | MON_ZOMBIE,
      MON_VAMPIRE | MON_ZOMBIE,
    ]);
    expect(isUniquelySolvable(common)).toBe(false);
  });
});

describe("undead guess-free generation property", () => {
  const tiers: [number, number, Difficulty][] = [
    [4, 4, "easy"],
    [4, 4, "normal"],
    [4, 4, "tricky"],
    [5, 5, "normal"],
    [5, 5, "tricky"],
  ];
  for (const [w, h, diff] of tiers) {
    it(`every accepted ${w}x${h} ${diff} board is solved by the ladder with no recursion`, () => {
      const params: UndeadParams = { w, h, diff };
      for (let i = 0; i < 5; i++) {
        const { desc } = newUndeadDesc(
          params,
          randomNew(`prop-${w}x${h}-${diff}-${i}`),
        );
        const common = newState(params, desc).common;
        const grade = solveDeductive(common, undecided(common.numTotal)); // full ladder
        expect(grade.solved).toBe(true); // deductive, zero recursion
        expect(grade.inconsistent).toBe(false);
        if (diff === "easy") expect(grade.rung).toBe(RUNG_ARC);
        else if (diff === "normal")
          expect(grade.rung === RUNG_ARC || grade.rung === RUNG_COUNTING).toBe(true);
        else expect(grade.rung).toBe(RUNG_FORCING);
        // Independently unique.
        expect(isUniquelySolvable(common)).toBe(true);
      }
    }, 30_000);
  }
});

/**
 * A symmetric hide by the orbits of a symmetry the player chooses, on the
 * `turning` fixture: the givens a deal leaves keep each of Solo's eight
 * symmetries, and the option is written as upstream solo.c writes it, after
 * the modifiers' letters, the default unwritten.
 */

import { describe, expect, it } from "vitest";
import schema from "../../describe/description.schema.json" with { type: "json" };
import * as turning from "../../generated/engine/testing/fixtures/turning/turning.compiled.ts";
import { orbitOf, SYMMETRIES, type Symmetry } from "../generate/symmetry.ts";
import { randomNew } from "../random/index.ts";
import { fillGame } from "./game.ts";
import type { FillParams } from "./game-id.ts";

const game = fillGame("turning", turning);
const choices = turning.deal.options?.["symmetry"]?.choices ?? [];

const params = (w: number, symmetry: number, x = false): FillParams => ({
  w,
  h: w,
  diff: 0,
  options: { symmetry },
  ...(x ? { variations: ["X"] } : {}),
});

/** The squares a board of `p` dealt from `seed` shows a given on. */
const givens = (p: FillParams, seed: string): Set<number> => {
  const b = game.newState(p, game.newDesc(p, randomNew(seed)).desc);
  return new Set(b.dealt.given.at);
};

describe("the orbits of a symmetry", () => {
  it("are closed, and as large as the symmetry's order off its axes", () => {
    const order: Record<Symmetry, number> = {
      none: 1,
      halfTurn: 2,
      quarterTurn: 4,
      mirrorLeftRight: 2,
      mirrorTopBottom: 2,
      mirrorDiagonal: 2,
      mirrorBothWays: 4,
      mirrorBothDiagonals: 4,
      mirrorEightWays: 8,
    };
    for (const s of SYMMETRIES) {
      // (1, 2) on a 7x7 is on no axis and no diagonal.
      expect(orbitOf(s, 7, 7, 2 * 7 + 1)).toHaveLength(order[s]);
      for (let c = 0; c < 49; c++) {
        const orbit = orbitOf(s, 7, 7, c);
        for (const d of orbit)
          expect(new Set(orbitOf(s, 7, 7, d))).toEqual(new Set(orbit));
      }
    }
  });

  it("reflect in the lines they are named for", () => {
    // (1, 2) on a 5 by 4 board.
    const c = 2 * 5 + 1;
    expect(orbitOf("mirrorLeftRight", 5, 4, c)).toEqual([c, 2 * 5 + 3]);
    expect(orbitOf("mirrorTopBottom", 5, 4, c)).toEqual([c, 1 * 5 + 1]);
    expect(orbitOf("halfTurn", 5, 4, c)).toEqual([c, 1 * 5 + 3]);
    expect(orbitOf("mirrorDiagonal", 5, 5, c)).toEqual([c, 1 * 5 + 2]);
    expect(() => orbitOf("quarterTurn", 5, 4, c)).toThrow(/square board/);
  });

  it("are the schema's symmetries, in its order", () => {
    expect(schema.$defs.symmetry.enum).toEqual([...SYMMETRIES]);
  });
});

describe("a hide that keeps the symmetry the option chooses", () => {
  it("leaves givens closed under each of the eight", () => {
    let boards = 0;
    for (const [i, choice] of choices.entries()) {
      const s = choice.symmetry;
      if (s === undefined) throw new Error("turning: a choice with no symmetry");
      for (const w of [5, 6])
        for (const seed of ["a", "b"]) {
          const shown = givens(params(w, i, seed === "b"), `${s}${w}${seed}`);
          for (const c of shown)
            for (const d of orbitOf(s, w, w, c)) expect(shown.has(d)).toBe(true);
          boards++;
        }
    }
    expect(boards).toBe(32);
  });

  it("hides further where the board keeps no symmetry", () => {
    // The same answer hidden square by square is left with no more givens
    // than hidden orbit by orbit, and over a few boards with fewer.
    let fewer = 0;
    for (const seed of ["a", "b", "c", "d"]) {
      const none = givens(params(6, 0), seed).size;
      const eight = givens(params(6, 7), seed).size;
      expect(none).toBeLessThanOrEqual(eight);
      if (none < eight) fewer++;
    }
    expect(fewer).toBeGreaterThan(0);
  });
});

describe("a symmetry written as upstream solo.c writes it", () => {
  it("writes each choice's code after the modifiers' letters, the default none", () => {
    const codes = choices.map((_, i) => game.encodeParams(params(6, i, true), true));
    expect(codes).toEqual([
      "6xade",
      "6xde",
      "6xr4de",
      "6xm2de",
      "6xmd2de",
      "6xm4de",
      "6xmd4de",
      "6xm8de",
    ]);
    expect(game.encodeParams(params(6, 5), false)).toBe("6");
  });

  it("reads each back, `r2` and an absent one as the default", () => {
    for (const [i] of choices.entries())
      expect(game.decodeParams(game.encodeParams(params(6, i, true), true))).toEqual(
        params(6, i, true),
      );
    expect(game.decodeParams("6r2de").options).toEqual({ symmetry: 1 });
    expect(game.decodeParams("6").options).toEqual({ symmetry: 1 });
    expect(game.decodeParams("6md4").options).toEqual({ symmetry: 6 });
  });
});

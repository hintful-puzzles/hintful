/**
 * An answer drawn from shipped data (`deal.sample.group`), on the `grouping`
 * fixture, a group's table of letters: a group of the board's order from its
 * generators, its elements permuted. With the identity shown it stays the
 * first letter, `e`, and its row and column stay given (the hide's `keep`);
 * under `i` it is permuted with the rest, and its lines and another
 * element's are dealt no given, the hide starting at the lowest tier the
 * ruleset takes.
 */

import { describe, expect, it } from "vitest";
import * as grouping from "../../generated/engine/testing/fixtures/grouping/grouping.compiled.ts";
import { newDealCensus, takingCensus } from "../contract/deal-census.ts";
import { randomNew } from "../random/index.ts";
import { type FillBoard, solveBoard } from "./board.ts";
import { fillGame } from "./game.ts";
import { groupTable } from "./group-table.ts";

type Board = FillBoard<grouping.Dealt>;

const game = fillGame("grouping", grouping);

function dealt(id: string, seed: string): { b: Board; answer: Uint8Array } {
  const p = game.decodeParams(id);
  const { desc, aux } = game.newDesc(p, randomNew(`grouping-${id}-${seed}`));
  return {
    b: game.newState(p, desc),
    answer: Uint8Array.from(aux ?? "", (ch) => Number.parseInt(ch, 36)),
  };
}

/** Row a, column b of table `t` of side `n`: a·b, the elements from 1. */
const mul = (t: ArrayLike<number>, n: number, a: number, b: number): number =>
  t[(a - 1) * n + (b - 1)];

/** The element of `t` that leaves every element as it is. */
function identityOf(t: ArrayLike<number>, n: number): number {
  const all = Array.from({ length: n }, (_, i) => i + 1);
  const e = all.find((x) =>
    all.every((a) => mul(t, n, x, a) === a && mul(t, n, a, x) === a),
  );
  if (e === undefined) throw new Error("no identity");
  return e;
}

/** Whether `t` is a group's table: Latin, with an identity, associative. */
function isGroup(t: ArrayLike<number>, n: number): boolean {
  identityOf(t, n);
  const all = Array.from({ length: n }, (_, i) => i + 1);
  return all.every(
    (a) =>
      new Set(all.map((b) => mul(t, n, a, b))).size === n &&
      new Set(all.map((b) => mul(t, n, b, a))).size === n &&
      all.every((b) =>
        all.every(
          (c) => mul(t, n, mul(t, n, a, b), c) === mul(t, n, a, mul(t, n, b, c)),
        ),
      ),
  );
}

/** The value given at cell `c` of `b`, 0 where none is. */
const given = (b: Board, c: number): number => (b.fixed[c] === 1 ? b.values[c] : 0);

/** The elements whose row and column hold no given. */
function blankLines(b: Board): number[] {
  const n = b.w;
  return Array.from({ length: n }, (_, i) => i + 1).filter((a) =>
    Array.from({ length: n }, (_, k) => k).every(
      (k) => given(b, (a - 1) * n + k) === 0 && given(b, k * n + (a - 1)) === 0,
    ),
  );
}

describe("an answer drawn as a group's table", () => {
  it("multiplies the generators out from the identity's row", () => {
    // Upstream's order-6 groups: the dihedral and the cyclic.
    for (const gens of [["CFEBAD", "BADCFE"], ["DCFEBA"]]) {
      const t = groupTable(6, gens);
      expect(t).not.toBeNull();
      expect(isGroup(t as Uint8Array, 6), gens.join()).toBe(true);
    }
    // One transposition reaches two rows of three.
    expect(groupTable(3, ["BAC"])).toBeNull();
  });

  it("keeps the identity first and its row and column given where it is shown", () => {
    let permuted = 0;
    for (const id of ["4de", "5dn", "6dn"])
      for (const seed of ["a", "b", "c"]) {
        const { b, answer } = dealt(id, seed);
        const n = b.w;
        expect(isGroup(answer, n), `${id} ${seed}`).toBe(true);
        expect(identityOf(answer, n), `${id} ${seed}`).toBe(1);
        for (let k = 0; k < n; k++) {
          expect(given(b, k), `${id} ${seed} row`).toBe(k + 1);
          expect(given(b, k * n), `${id} ${seed} column`).toBe(k + 1);
        }
        // The other elements are permuted: not always the table's order.
        if (answer[n + 1] !== mul(groupTable(n, ["BCDA"]) ?? [], n, 2, 2)) permuted++;
        expect(solveBoard(grouping, b, game.decodeParams(id).diff).verdict).toBe(
          "solved",
        );
      }
    expect(permuted).toBeGreaterThan(0);
  });

  it("hides the identity and blanks its lines and another's under `i`", () => {
    const identities = new Set<number>();
    for (const id of ["5dni", "6dni", "6dti"])
      for (const seed of ["a", "b", "c", "d"]) {
        const { b, answer } = dealt(id, seed);
        const n = b.w;
        expect(isGroup(answer, n), `${id} ${seed}`).toBe(true);
        const e = identityOf(answer, n);
        identities.add(e);
        const blank = blankLines(b);
        expect(blank, `${id} ${seed}`).toContain(e);
        expect(blank.length, `${id} ${seed}`).toBeGreaterThanOrEqual(2);
        expect(solveBoard(grouping, b, game.decodeParams(id).diff).verdict).toBe(
          "solved",
        );
      }
    expect(identities.size).toBeGreaterThan(1);
  });

  it("hides from the lowest tier the ruleset takes", () => {
    // Easy finishes no board whose identity's lines are blank, so a hide
    // from Easy threw away every draw, until 64 in a row, before it tried
    // Normal (`SHORT_OF_LOWEST_RUN`).
    const census = newDealCensus();
    takingCensus(census, () => dealt("5dni", "lowest"));
    expect(census.rejected.get("fill: the lowest tier stops short of every clue")).toBe(
      undefined,
    );
  });

  it("deals a board of the asked tier, not one the tier below finishes", () => {
    for (const id of ["6dn", "6dti"]) {
      const { b } = dealt(id, "tier");
      const diff = game.decodeParams(id).diff;
      expect(solveBoard(grouping, b, diff).verdict, id).toBe("solved");
      expect(solveBoard(grouping, b, diff - 1).verdict, id).not.toBe("solved");
    }
  });
});

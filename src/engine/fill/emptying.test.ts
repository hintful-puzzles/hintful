/**
 * A value a unit holds more than once, on the `emptying` fixture: each row
 * and column holds 1 to `k` once and the empty square, `k + 1`, on the rest,
 * as Salad's lines do. Its answer is a Latin square folded to the domain,
 * the ladder's marks count the empty square as often as a line holds it, and
 * a clue whose meaning reads `k` is derived from the answer.
 */

import { describe, expect, it } from "vitest";
import * as emptying from "../../generated/engine/testing/fixtures/emptying/emptying.compiled.ts";
import { randomNew } from "../random/index.ts";
import { newBoard, paramSpaceOf, solveBoard, spaceOf } from "./board.ts";
import { fillGame } from "./game.ts";
import { sampleLatin } from "./sample.ts";

const game = fillGame("emptying", emptying);

/** How many times each value is held by each row and column of `g`. */
function lineCounts(g: ArrayLike<number>, w: number): Map<number, number>[] {
  const out: Map<number, number>[] = [];
  for (let i = 0; i < w; i++)
    for (const at of [(j: number) => i * w + j, (j: number) => j * w + i]) {
      const n = new Map<number, number>();
      for (let j = 0; j < w; j++) n.set(g[at(j)], (n.get(g[at(j)]) ?? 0) + 1);
      out.push(n);
    }
  return out;
}

/** The counts a line of a board `w` wide holding 1 to `k` and the rest empty
 * has. */
const folded = (w: number, k: number): Map<number, number> =>
  new Map([
    ...Array.from({ length: k }, (_, i) => [i + 1, 1] as [number, number]),
    [k + 1, w - k],
  ]);

describe("an answer with a value a unit holds more than once", () => {
  it("is sampled as a Latin square folded to the domain", () => {
    for (const [w, k] of [
      [4, 3],
      [5, 3],
      [6, 2],
    ]) {
      const sp = paramSpaceOf(emptying, { w, h: w });
      for (let i = 0; i < 5; i++) {
        const g = sampleLatin(sp, randomNew(`folded-${w}-${i}`), k + 1);
        for (const counts of lineCounts(g, w))
          expect([...counts].sort()).toEqual([...folded(w, k)].sort());
      }
    }
  });

  it("is finished by the ladder, which counts the empty square as often as a line holds it", () => {
    // Every clue the answer shows, and no given: the Latin library's
    // techniques strike or place the empty square by its count in a line.
    const p = game.decodeParams("5k3");
    const sp = paramSpaceOf(emptying, p);
    let solved = 0;
    for (let i = 0; i < 30; i++) {
      const g = sampleLatin(sp, randomNew(`ladder-${i}`), 4);
      const sizes = { k: 3 };
      const cl = emptying.deriveClues(g, sp, {}, sizes);
      expect(emptying.isAnswer(g, sp, cl)).toBe(true);
      const got = solveBoard(emptying, newBoard(emptying, 5, 5, cl, []), 0);
      // Never impossible: a marks that counted the empty square once a line
      // would strike it from a line already holding one.
      expect(got.verdict).not.toBe("impossible");
      if (got.verdict === "solved") {
        expect([...got.values]).toEqual([...g]);
        solved++;
      }
    }
    expect(solved).toBeGreaterThan(0);
  });

  it("derives a clue whose meaning reads a size, and deals a board of it", () => {
    for (const id of ["4k3", "5k3", "5k4"]) {
      const p = game.decodeParams(id);
      const k = p.sizes?.["k"] ?? 0;
      const b = game.newState(p, game.newDesc(p, randomNew(id)).desc);
      const { sees } = b.dealt;
      expect(sees.at.length).toBeGreaterThan(0);
      // The first number a clue sees is never the empty square.
      for (const v of sees.v) expect(v).toBeLessThanOrEqual(k);
      const got = solveBoard(emptying, b, 0);
      expect(got.verdict).toBe("solved");
      const w = p.w;
      for (const counts of lineCounts(got.values, w))
        expect([...counts].sort()).toEqual([...folded(w, k)].sort());
      expect(emptying.isAnswer(got.values, spaceOf(emptying, b), b.dealt)).toBe(true);
    }
  });
});

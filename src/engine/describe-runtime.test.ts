import { expect, it } from "vitest";
import { connected, cuts, describedSpace } from "./describe-runtime.ts";
import { randomNew, randomUpto } from "./random/index.ts";

/** Whether `S` is one group, by merging every pair side by side. */
function joined(w: number, S: readonly number[]): boolean {
  const root = new Map(S.map((c) => [c, c]));
  const find = (c: number): number => {
    while (root.get(c) !== c) c = root.get(c) as number;
    return c;
  };
  for (const c of S) {
    if ((c + 1) % w !== 0 && root.has(c + 1)) root.set(find(c), find(c + 1));
    if (root.has(c + w)) root.set(find(c), find(c + w));
  }
  return new Set(S.map(find)).size <= 1;
}

it("connected and cuts read their definitions on every shape of set", () => {
  const rs = randomNew("cuts");
  let cut = 0;
  for (let w = 1; w <= 5; w++)
    for (let h = 1; h <= 5; h++) {
      const sp = describedSpace([], w, h);
      for (let k = 0; k < 200; k++) {
        const S = sp.cells.filter(() => randomUpto(rs, 3) > 0);
        expect(connected(sp, S)).toBe(joined(w, S));
        const want = S.filter(
          (c) =>
            !joined(
              w,
              S.filter((x) => x !== c),
            ),
        );
        expect(cuts(sp, S)).toEqual(want);
        cut += want.length;
      }
    }
  // Enough sets with cuts that a search missing them would show.
  expect(cut).toBeGreaterThan(1000);
});

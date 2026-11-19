/**
 * The check's sightline, walked a step at a time over every way it could
 * stand (`sightlineGuards`), against the runtime's tracer on each mirror
 * layout: every layout of a 3×3 board, and of a 2×4 one.
 */
import { expect, it } from "vitest";
import { describedSpace, sightSets } from "../../src/engine/describe-runtime.ts";
import { sightlineGuards } from "./describe-check.ts";

for (const [w, h] of [
  [3, 3],
  [2, 4],
]) {
  it(`agrees with the tracer on every ${w}×${h} layout`, () => {
    const sp = describedSpace([], w, h);
    const n = w * h;
    const layout = new Array<number>(n).fill(0);
    let layouts = 0;
    for (let k = 0; k < 3 ** n; k++) {
      for (let c = 0, r = k; c < n; c++, r = (r / 3) | 0) layout[c] = r % 3;
      layouts++;
      for (const s of sp.slots) {
        const want = sightSets(sp, s, (c) => layout[c]);
        const got = sightlineGuards(sp, s, (c) => [[true, layout[c]]]);
        const members = (m: ReadonlyMap<number, unknown>): number[] =>
          [...m].filter(([, g]) => g === true).map(([c]) => c);
        const sorted = (xs: readonly number[]): number[] =>
          [...xs].sort((a, b) => a - b);
        for (const f of ["all", "direct", "bent", "twice"] as const)
          expect(members(got[f]), `${f} from ${s} on ${layout}`).toEqual(
            sorted(want[f]),
          );
        expect(members(got.exit), `exit from ${s} on ${layout}`).toEqual([want.exit]);
      }
    }
    expect(layouts).toBe(3 ** n);
  });
}

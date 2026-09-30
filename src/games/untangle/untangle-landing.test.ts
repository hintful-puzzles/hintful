/**
 * The hint asks only for spots the pointer can land on, at every tile size the
 * app draws Untangle at and with snap-to-grid either way.
 *
 * A real `Midend` is sized so the board is drawn at the tile size under test,
 * and the plan is walked with `executeHint`, which plays each step's drag
 * through `interpretMove` and throws when the drop does not complete the step
 * (`untangleKeepTrack`). At the preferred tile size of 64 a drop is exact, so
 * this walks the sizes where it is not: the smallest one the hint guarantees,
 * and one whose pixels share no factor with the layout's 1/64 grid.
 */
import { describe, expect, it } from "vitest";
import { Midend } from "../../engine/midend.ts";
import { untangleGame } from "./index.ts";
import { TS_MIN } from "./landing.ts";
import { coordLimit } from "./state.ts";

const N = 10;
const TILE_SIZES = [TS_MIN, 23];
/** Boards whose walk, with spots left where the search found them rather than
 * moved to landable ones (`Board.land`), asks for a drop that changes the
 * moved point's crossings: the first at tiles 16 and 23, the second at 23.
 * Found by walking 150 generated boards at each size (3 of the 300 walks
 * failed so), and pinned as descs so no generator change can retire them; a
 * change to the hint's search can, so re-find them whenever a `Board.land` that
 * returns its spot unmoved no longer fails this file. */
const DESCS = [
  "0-1,0-5,0-9,1-2,1-5,2-6,2-8,2-9,3-4,3-5,3-7,4-7,4-9,5-8,6-7,6-8,6-9,7-8",
  "0-2,0-5,0-6,0-7,1-2,1-4,1-6,2-4,2-5,3-6,3-7,3-9,4-6,5-8,7-8,7-9,8-9",
];
/** Far above any walk a ten-point board needs, so only a loop reaches it. */
const MAX_STEPS = 300;

describe("untangle: every hint step lands where the pointer drops it", () => {
  for (const snap of [false, true]) {
    for (const ts of TILE_SIZES) {
      it(`tile ${ts}, snap ${snap ? "on" : "off"}`, () => {
        let played = 0;
        for (const desc of DESCS) {
          const midend = new Midend(untangleGame);
          expect(midend.newGameFromId(`${N}:${desc}`)).toBeNull();
          midend.setPreferences({ "snap-to-grid": snap });
          const side = coordLimit(N) * ts;
          expect(midend.size({ w: side, h: side })).toEqual({ w: side, h: side });
          let refusal: string | null = null;
          for (let step = 0; step < MAX_STEPS && refusal === null; step++) {
            refusal = midend.executeHint();
            if (refusal === null) played++;
          }
          expect(refusal, `${desc}: the walk never ended`).not.toBeNull();
        }
        expect(played).toBeGreaterThan(0);
      });
    }
  }
});

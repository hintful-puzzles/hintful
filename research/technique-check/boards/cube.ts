/**
 * The small boards Cube deals, for the dead-end checker (`DealtBoard` in
 * `../dead-end-check.ts`): every solid on every arena of sides up to four the
 * game accepts, each with the roll table the game deals it, built by the
 * game's own code. The checker keeps those whose positions are few enough to
 * search whole.
 */

import { gridArea } from "../../../src/games/cube/grid.ts";
import { dealtOf } from "../../../src/games/cube/roll.ts";
import { SOLIDS } from "../../../src/games/cube/solids.ts";
import { newState, validateParams } from "../../../src/games/cube/state.ts";
import type { DealtBoard } from "../dead-end-check.ts";

export function boards(): DealtBoard[] {
  const out: DealtBoard[] = [];
  for (let solid = 0; solid < SOLIDS.length; solid++)
    for (let d1 = 0; d1 <= 4; d1++)
      for (let d2 = 0; d2 <= 4; d2++) {
        const p = { solid, d1, d2 };
        if (validateParams(p, true) !== null) continue;
        const n = gridArea(d1, d2, SOLIDS[solid].order);
        // Any desc of the arena: its table is the arena's alone.
        const s = newState(p, `${"0".repeat(Math.ceil(n / 4))},0`);
        const dealt = dealtOf(s);
        out.push({
          w: n,
          h: 1,
          dealt: { ...dealt },
          sizes: { solid, d1, d2, squares: n, nfaces: dealt.nfaces },
        });
      }
  return out;
}

/**
 * The small boards Netslide deals, for the dead-end checker (`DealtBoard` in
 * `../dead-end-check.ts`): every board of up to four tiles, wrapping and
 * walled, each with the barriers its desc can name, every set of them where
 * there are four sites or fewer and otherwise none, each one alone, and all;
 * each with the table of sides the game deals it, built by the game's own
 * desc parser and barrier code.
 */

import { dealtOf, newState } from "../../../src/games/netslide/state.ts";
import type { DealtBoard } from "../dead-end-check.ts";

export function boards(): DealtBoard[] {
  const out: DealtBoard[] = [];
  for (let w = 1; w <= 4; w++)
    for (let h = 1; w * h <= 4; h++)
      for (const wrapping of [false, true]) {
        // The barrier sites a desc can name, in its order: after each tile, a
        // wall on its right, then one below it.
        const sites: string[] = [];
        for (let y = 0; y < h; y++)
          for (let x = 0; x < w; x++) {
            if (wrapping || x < w - 1) sites.push(`${x},${y}v`);
            if (wrapping || y < h - 1) sites.push(`${x},${y}h`);
          }
        const sets: Set<string>[] =
          sites.length <= 4
            ? Array.from(
                { length: 2 ** sites.length },
                (_, k) => new Set(sites.filter((_, i) => (k >> i) & 1)),
              )
            : [new Set(), ...sites.map((s) => new Set([s])), new Set(sites)];
        for (const walls of sets) {
          let desc = "";
          for (let y = 0; y < h; y++)
            for (let x = 0; x < w; x++) {
              desc += "0";
              if (walls.has(`${x},${y}v`)) desc += "v";
              if (walls.has(`${x},${y}h`)) desc += "h";
            }
          const p = { w, h, wrapping, barrierProbability: 0, movetarget: 0 };
          out.push({
            w,
            h,
            dealt: { ...dealtOf(newState(p, desc)) },
            sizes: { w, h, wrapping: wrapping ? 1 : 0, barriers: walls.size },
          });
        }
      }
  return out;
}

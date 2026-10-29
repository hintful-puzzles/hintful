/**
 * The generator's time per deal on the hand-written Latin ladder and on the
 * compiled one, each preset, the same seeds, and whether they dealt the same
 * boards. `openspec/changes/compile-the-latin-ladder/tasks.md` 3.7.
 */
import { it } from "vitest";
import { CHECK } from "../../src/engine/latin.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { LATIN_GAMES, presetParams } from "./latin-games.ts";
import { writeResult } from "./pilot.ts";

const SEEDS = 6;

it("time per deal", () => {
  const lines: string[] = [];
  for (const [name, g] of LATIN_GAMES)
    for (const p of presetParams(g)) {
      const ms = { hand: 0, built: 0 };
      const descs = { hand: [] as string[], built: [] as string[] };
      // Each side twice, alternating, and the second pass kept, so neither
      // pays for warming the JIT.
      for (const pass of [0, 1])
        for (const hand of [true, false]) {
          CHECK.handWritten = hand;
          const t0 = performance.now();
          const out: string[] = [];
          for (let s = 0; s < SEEDS; s++)
            out.push(g.newDesc(p, randomNew(`speed ${name} ${s}`)).desc);
          const t = (performance.now() - t0) / SEEDS;
          if (pass === 1) {
            ms[hand ? "hand" : "built"] = t;
            descs[hand ? "hand" : "built"] = out;
          }
        }
      CHECK.handWritten = false;
      const same = descs.hand.join() === descs.built.join();
      lines.push(
        `${name} ${g.encodeParams(p, true)}: hand ${ms.hand.toFixed(1)} ms, built ${ms.built.toFixed(1)} ms, x${(ms.built / ms.hand).toFixed(2)}${same ? "" : " BOARDS DIFFER"}`,
      );
    }
  writeResult("results-speed-compiled.txt", `${lines.join("\n")}\n`);
});

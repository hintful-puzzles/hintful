/**
 * The generator's time per deal on every Solo preset, and on Killer at
 * other sizes, the hand-written ladder and the compiled one, the same seeds,
 * each run twice and the second pass kept, so neither pays for warming the
 * JIT. `openspec/changes/describe-solo/report.md` § "Speed" quotes it.
 */
import { it } from "vitest";
import type { PresetMenu } from "../../src/engine/game.ts";
import { presetMenu } from "../../src/engine/param-label.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { soloGame } from "../../src/games/solo/index.ts";
import { COMPARE } from "../../src/games/solo/solver.ts";
import {
  DIFF_INTERSECT,
  type SoloParams,
  SYMM_NONE,
} from "../../src/games/solo/state.ts";
import { progress } from "./pilot.ts";

const SEEDS = Number(process.env["SEEDS"] ?? 6);

function presets(): SoloParams[] {
  const out: SoloParams[] = [];
  const walk = (menu: PresetMenu<SoloParams>): void => {
    if (menu.submenu) for (const child of menu.submenu) walk(child);
    else if (menu.params !== undefined) out.push(menu.params);
  };
  walk(presetMenu(soloGame));
  return out;
}

function perDeal(p: SoloParams, handWritten: boolean): number {
  COMPARE.handWritten = handWritten;
  let ms = 0;
  try {
    for (const pass of [0, 1]) {
      const t0 = performance.now();
      for (let s = 0; s < SEEDS; s++) soloGame.newDesc(p, randomNew(`speed solo ${s}`));
      if (pass === 1) ms = (performance.now() - t0) / SEEDS;
    }
  } finally {
    COMPARE.handWritten = false;
  }
  return ms;
}

it("time per deal", () => {
  const killer = (c: number, r: number): SoloParams => ({
    ...soloGame.defaultParams(),
    c,
    r,
    diff: DIFF_INTERSECT,
    symm: SYMM_NONE,
    killer: true,
  });
  for (const p of [...presets(), killer(2, 3), killer(6, 1), killer(3, 3)]) {
    const hand = perDeal(p, true);
    const built = perDeal(p, false);
    progress(
      `${soloGame.encodeParams(p, true)}: hand-written ${hand.toFixed(1)} ms, compiled ${built.toFixed(1)} ms, ${(built / hand).toFixed(2)}x`,
    );
  }
}, 3_600_000);

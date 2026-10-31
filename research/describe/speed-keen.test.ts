/**
 * The generator's time per deal on every Keen preset, the hand-written
 * deductions and the compiled ladder, the same seeds, each run twice and the
 * second pass kept, so neither pays for warming the JIT.
 * `openspec/changes/describe-keen/report.md` § "Speed" quotes it.
 */
import { it } from "vitest";
import type { PresetMenu } from "../../src/engine/game.ts";
import { presetMenu } from "../../src/engine/param-label.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { keenGame } from "../../src/games/keen/index.ts";
import { COMPARE } from "../../src/games/keen/solver.ts";
import type { KeenParams } from "../../src/games/keen/state.ts";
import { progress } from "./pilot.ts";

const SEEDS = Number(process.env["SEEDS"] ?? 6);

function presets(): KeenParams[] {
  const out: KeenParams[] = [];
  const walk = (menu: PresetMenu<KeenParams>): void => {
    if (menu.submenu) for (const child of menu.submenu) walk(child);
    else if (menu.params !== undefined) out.push(menu.params);
  };
  walk(presetMenu(keenGame));
  return out;
}

function perDeal(p: KeenParams, handWritten: boolean): number {
  COMPARE.handWritten = handWritten;
  let ms = 0;
  try {
    for (const pass of [0, 1]) {
      const t0 = performance.now();
      for (let s = 0; s < SEEDS; s++) keenGame.newDesc(p, randomNew(`speed keen ${s}`));
      if (pass === 1) ms = (performance.now() - t0) / SEEDS;
    }
  } finally {
    COMPARE.handWritten = false;
  }
  return ms;
}

it("time per deal", () => {
  for (const p of presets()) {
    const hand = perDeal(p, true);
    const built = perDeal(p, false);
    progress(
      `${keenGame.encodeParams(p, true)}: hand-written ${hand.toFixed(1)} ms, compiled ${built.toFixed(1)} ms, ${(built / hand).toFixed(2)}x`,
    );
  }
});

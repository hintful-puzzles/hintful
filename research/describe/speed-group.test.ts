/**
 * The generator's time per deal: Group on its hand-written deductions and on
 * its compiled ladder, and Unequal's compiled presets, the same seeds, each
 * side twice and the second pass kept. `openspec/changes/describe-group/
 * tasks.md` 3.1; `compile-the-latin-ladder`'s `report.md` § "Speed" ran the
 * same measurement.
 */
import { it } from "vitest";
import type { PresetMenu } from "../../src/engine/game.ts";
import { presetMenu } from "../../src/engine/param-label.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { groupGame } from "../../src/games/group/index.ts";
import { COMPARE } from "../../src/games/group/solver.ts";
import { unequalGame } from "../../src/games/unequal/index.ts";

const SEEDS = 6;

function presets(game: AnyGame): unknown[] {
  const out: unknown[] = [];
  const walk = (menu: PresetMenu<unknown>): void => {
    if (menu.submenu) for (const child of menu.submenu) walk(child);
    else if (menu.params !== undefined) out.push(menu.params);
  };
  walk(presetMenu(game as never) as PresetMenu<unknown>);
  return out;
}

// biome-ignore lint/suspicious/noExplicitAny: a run over two games' params.
type AnyGame = any;

function perDeal(g: AnyGame, p: unknown, name: string): { ms: number; descs: string } {
  let ms = 0;
  let descs = "";
  for (const pass of [0, 1]) {
    const t0 = performance.now();
    const out: string[] = [];
    for (let s = 0; s < SEEDS; s++)
      out.push(g.newDesc(p, randomNew(`speed ${name} ${s}`)).desc);
    if (pass === 1) {
      ms = (performance.now() - t0) / SEEDS;
      descs = out.join();
    }
  }
  return { ms, descs };
}

it("time per deal", () => {
  const lines: string[] = [];
  for (const p of presets(groupGame)) {
    COMPARE.handWritten = true;
    const hand = perDeal(groupGame, p, "group");
    COMPARE.handWritten = false;
    const built = perDeal(groupGame, p, "group");
    lines.push(
      `group ${groupGame.encodeParams(p as never, true)}: hand ${hand.ms.toFixed(1)} ms, built ${built.ms.toFixed(1)} ms, x${(built.ms / hand.ms).toFixed(2)}${hand.descs === built.descs ? "" : " BOARDS DIFFER"}`,
    );
  }
  for (const p of presets(unequalGame)) {
    const built = perDeal(unequalGame, p, "unequal");
    lines.push(
      `unequal ${unequalGame.encodeParams(p as never, true)}: built ${built.ms.toFixed(1)} ms`,
    );
  }
  console.log(lines.join("\n"));
});

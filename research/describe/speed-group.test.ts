/**
 * The generator's time per deal on every Group and Unequal preset, the same
 * seeds, each run twice and the second pass kept, so neither pays for warming
 * the JIT. `openspec/changes/archive/*-describe-group/report.md` § "Speed"
 * quotes it against the hand-written engine.
 */
import { it } from "vitest";
import type { PresetMenu } from "../../src/engine/game.ts";
import { presetMenu } from "../../src/engine/param-label.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { groupGame } from "../../src/games/group/index.ts";
import { unequalGame } from "../../src/games/unequal/index.ts";

const SEEDS = 6;

// biome-ignore lint/suspicious/noExplicitAny: a run over two games' params.
type AnyGame = any;

function presets(game: AnyGame): unknown[] {
  const out: unknown[] = [];
  const walk = (menu: PresetMenu<unknown>): void => {
    if (menu.submenu) for (const child of menu.submenu) walk(child);
    else if (menu.params !== undefined) out.push(menu.params);
  };
  walk(presetMenu(game));
  return out;
}

function perDeal(g: AnyGame, p: unknown, name: string): number {
  let ms = 0;
  for (const pass of [0, 1]) {
    const t0 = performance.now();
    for (let s = 0; s < SEEDS; s++) g.newDesc(p, randomNew(`speed ${name} ${s}`));
    if (pass === 1) ms = (performance.now() - t0) / SEEDS;
  }
  return ms;
}

it("time per deal", () => {
  const lines: string[] = [];
  for (const [name, g] of [
    ["group", groupGame],
    ["unequal", unequalGame],
  ] as const)
    for (const p of presets(g))
      lines.push(
        `${name} ${g.encodeParams(p as never, true)}: ${perDeal(g, p, name).toFixed(1)} ms`,
      );
  console.log(lines.join("\n"));
});

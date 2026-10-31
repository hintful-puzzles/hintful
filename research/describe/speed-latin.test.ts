/**
 * The generator's time per deal on every Latin game's presets, the same
 * seeds, each run twice and the second pass kept, so neither pays for
 * warming the JIT. Run on two builds and compare the lines:
 * `openspec/changes/archive/*-describe-salad/report.md` § "Speed" quotes it
 * for the library read with a multiplicity.
 */
import { it } from "vitest";
import type { PresetMenu } from "../../src/engine/game.ts";
import { presetMenu } from "../../src/engine/param-label.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { groupGame } from "../../src/games/group/index.ts";
import { keenGame } from "../../src/games/keen/index.ts";
import { mathraxGame } from "../../src/games/mathrax/index.ts";
import { saladGame } from "../../src/games/salad/index.ts";
import { soloGame } from "../../src/games/solo/index.ts";
import { towersGame } from "../../src/games/towers/index.ts";
import { unequalGame } from "../../src/games/unequal/index.ts";
import { progress } from "./pilot.ts";

const SEEDS = Number(process.env["SEEDS"] ?? 4);

// biome-ignore lint/suspicious/noExplicitAny: a run over every Latin game.
type AnyGame = any;

const GAMES: [string, AnyGame][] = [
  ["unequal", unequalGame],
  ["towers", towersGame],
  ["keen", keenGame],
  ["group", groupGame],
  ["mathrax", mathraxGame],
  ["salad", saladGame],
  ["solo", soloGame],
];

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
  // SPEED_GAMES narrows the run to some games, by name, comma-separated.
  const only = process.env["SPEED_GAMES"]?.split(",") ?? null;
  for (const [name, g] of GAMES.filter(([n]) => only === null || only.includes(n)))
    for (const p of presets(g))
      progress(
        `${name} ${g.encodeParams(p, true)}: ${perDeal(g, p, name).toFixed(1)} ms`,
      );
}, 7_200_000);

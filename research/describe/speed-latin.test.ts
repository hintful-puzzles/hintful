/**
 * The generator's time per deal on every described game's presets, the same
 * seeds, each run twice and the second pass kept, so neither pays for
 * warming the JIT. Run on two builds and compare the lines:
 * `openspec/changes/archive/*-describe-salad/report.md` § "Speed" quotes it
 * for the library read with a multiplicity.
 */
import { it } from "vitest";
import type { PresetMenu } from "../../src/engine/contract/game.ts";
import { presetMenu } from "../../src/engine/game-id/param-label.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { groupGame } from "../../src/games/group/index.ts";
import { game as adjacentGame } from "../../src/generated/games/adjacent/adjacent.game.ts";
import { game as keenGame } from "../../src/generated/games/keen/keen.game.ts";
import { game as mathraxGame } from "../../src/generated/games/mathrax/mathrax.game.ts";
import { game as saladGame } from "../../src/generated/games/salad/salad.game.ts";
import { game as seismicGame } from "../../src/generated/games/seismic/seismic.game.ts";
import { game as soloGame } from "../../src/generated/games/solo/solo.game.ts";
import { game as towersGame } from "../../src/generated/games/towers/towers.game.ts";
import { game as unequalGame } from "../../src/generated/games/unequal/unequal.game.ts";
import { game as unrulyGame } from "../../src/generated/games/unruly/unruly.game.ts";
import { say } from "../progress.ts";

const SEEDS = Number(process.env["SEEDS"] ?? 4);

// biome-ignore lint/suspicious/noExplicitAny: a run over every Latin game.
type AnyGame = any;

const GAMES: [string, AnyGame][] = [
  ["unequal", unequalGame],
  ["adjacent", adjacentGame],
  ["towers", towersGame],
  ["keen", keenGame],
  ["group", groupGame],
  ["mathrax", mathraxGame],
  ["salad", saladGame],
  ["solo", soloGame],
  ["unruly", unrulyGame],
  ["seismic", seismicGame],
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
      say(`${name} ${g.encodeParams(p, true)}: ${perDeal(g, p, name).toFixed(1)} ms`);
}, 7_200_000);

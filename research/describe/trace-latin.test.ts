/**
 * Every described game's deals and hint walks, written out step by step (the
 * board each deal gives, and each hint step's rung, move and words), so two
 * builds of the compiled modules can be diffed. `describe-group` ran it with
 * the compiler's hoisting off and on (tasks 3.1). A record's firing `group`
 * is printed where a step's words carry the record, and is a counter, so
 * mask it before diffing two runners.
 */
import { writeFileSync } from "node:fs";
import { it } from "vitest";
import type { PresetMenu } from "../../src/engine/contract/game.ts";
import { presetMenu } from "../../src/engine/game-id/param-label.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { groupGame } from "../../src/games/group/index.ts";
import { saladGame } from "../../src/games/salad/index.ts";
import { game as adjacentGame } from "../../src/generated/games/adjacent/adjacent.game.ts";
import { game as clustersGame } from "../../src/generated/games/clusters/clusters.game.ts";
import { game as keenGame } from "../../src/generated/games/keen/keen.game.ts";
import { game as mathraxGame } from "../../src/generated/games/mathrax/mathrax.game.ts";
import { game as mosaicGame } from "../../src/generated/games/mosaic/mosaic.game.ts";
import { game as seismicGame } from "../../src/generated/games/seismic/seismic.game.ts";
import { game as soloGame } from "../../src/generated/games/solo/solo.game.ts";
import { game as starbattleGame } from "../../src/generated/games/starbattle/starbattle.game.ts";
import { game as towersGame } from "../../src/generated/games/towers/towers.game.ts";
import { game as unequalGame } from "../../src/generated/games/unequal/unequal.game.ts";
import { game as unrulyGame } from "../../src/generated/games/unruly/unruly.game.ts";
import { say } from "../progress.ts";

// biome-ignore lint/suspicious/noExplicitAny: a walk over any Latin game.
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
  ["starbattle", starbattleGame],
  ["mosaic", mosaicGame],
  ["clusters", clustersGame],
];

/** Boards beyond the presets: Killer at other sizes and tiers, and with X. */
const EXTRA: Record<string, unknown[]> = {
  group: [2, 3, 4].map((diff) => ({ w: 8, diff, id: false })),
  solo: ["2x3kadi", "3x3kadi", "3x3kada", "6jkadi", "3x3xkadb"].map((p) =>
    soloGame.decodeParams(p),
  ),
};
const SEEDS = 3;
const STEPS = 200;

function presets(game: AnyGame): unknown[] {
  const out: unknown[] = [];
  const walk = (menu: PresetMenu<unknown>): void => {
    if (menu.submenu) for (const child of menu.submenu) walk(child);
    else if (menu.params !== undefined) out.push(menu.params);
  };
  walk(presetMenu(game));
  return out;
}

it("trace", () => {
  const out = process.env["TRACE_OUT"];
  if (out === undefined) throw new Error("TRACE_OUT names the file to write");
  // TRACE_GAMES narrows the walk to some games, by name, comma-separated.
  const only = process.env["TRACE_GAMES"]?.split(",") ?? null;
  const lines: string[] = [];
  for (const [name, g] of GAMES.filter(([n]) => only === null || only.includes(n)))
    for (const p of [g.defaultParams(), ...presets(g), ...(EXTRA[name] ?? [])]) {
      say(`${name} ${g.encodeParams(p, true)}: ${lines.length} lines so far`);
      for (let s = 0; s < SEEDS; s++) {
        const { desc } = g.newDesc(p, randomNew(`trace ${name} ${s}`));
        lines.push(`${name} ${g.encodeParams(p, true)} ${s}: ${desc}`);
        let state = g.newState(p, desc);
        for (let k = 0; k < STEPS; k++) {
          const h = g.hint.plan(state);
          if (!h.ok || h.steps.length === 0) {
            lines.push(`  end ${JSON.stringify(h.ok === false ? h : "done")}`);
            break;
          }
          const step = h.steps[0];
          lines.push(
            `  ${step.rung} ${JSON.stringify(step.move)} ${JSON.stringify(step.text ?? step)}`,
          );
          if (!step.move) break;
          const next = g.executeMove(state, step.move);
          if (next === null) break;
          state = next;
        }
      }
    }
  writeFileSync(out, `${lines.join("\n")}\n`);
  say(`${lines.length} lines`);
});

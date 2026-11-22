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
import { adjacentGame } from "../../src/games/adjacent/index.ts";
import { clustersGame } from "../../src/games/clusters/index.ts";
import { groupGame } from "../../src/games/group/index.ts";
import { keenGame } from "../../src/games/keen/index.ts";
import { mathraxGame } from "../../src/games/mathrax/index.ts";
import { saladGame } from "../../src/games/salad/index.ts";
import { seismicGame } from "../../src/games/seismic/index.ts";
import { soloGame } from "../../src/games/solo/index.ts";
import { DIFF_HARD, DIFF_TRICKY, SYMM_NONE } from "../../src/games/solo/state.ts";
import { starbattleGame } from "../../src/games/starbattle/index.ts";
import { towersGame } from "../../src/games/towers/index.ts";
import { unequalGame } from "../../src/games/unequal/index.ts";
import { game as mosaicGame } from "../../src/generated/games/mosaic/mosaic.game.ts";
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
  solo: [
    { c: 2, r: 3, diff: DIFF_TRICKY },
    { c: 3, r: 3, diff: DIFF_TRICKY },
    { c: 3, r: 3, diff: DIFF_HARD },
    { c: 6, r: 1, diff: DIFF_TRICKY },
    { c: 3, r: 3, xtype: true },
    { c: 3, r: 3, xtype: true, killer: true },
  ].map((p) => ({ ...soloGame.defaultParams(), symm: SYMM_NONE, killer: true, ...p })),
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

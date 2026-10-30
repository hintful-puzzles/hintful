/**
 * Every Latin game's deals and hint walks, written out step by step (the
 * board each deal gives, and each hint step's rung, move and words), so two
 * builds of the compiled modules can be diffed. `describe-group` ran it with
 * the compiler's hoisting off and on (tasks 3.1).
 */
import { writeFileSync } from "node:fs";
import { it } from "vitest";
import type { PresetMenu } from "../../src/engine/game.ts";
import { presetMenu } from "../../src/engine/param-label.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { groupGame } from "../../src/games/group/index.ts";
import { keenGame } from "../../src/games/keen/index.ts";
import { mathraxGame } from "../../src/games/mathrax/index.ts";
import { saladGame } from "../../src/games/salad/index.ts";
import { towersGame } from "../../src/games/towers/index.ts";
import { unequalGame } from "../../src/games/unequal/index.ts";

// biome-ignore lint/suspicious/noExplicitAny: a walk over any Latin game.
type AnyGame = any;

const GAMES: [string, AnyGame][] = [
  ["unequal", unequalGame],
  ["towers", towersGame],
  ["keen", keenGame],
  ["group", groupGame],
  ["mathrax", mathraxGame],
  ["salad", saladGame],
];
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
  const lines: string[] = [];
  const hidden = [2, 3, 4].map((diff) => ({ w: 8, diff, id: false }));
  for (const [name, g] of GAMES)
    for (const p of [
      g.defaultParams(),
      ...presets(g),
      ...(name === "group" ? hidden : []),
    ])
      for (let s = 0; s < SEEDS; s++) {
        const { desc } = g.newDesc(p, randomNew(`trace ${name} ${s}`));
        lines.push(`${name} ${g.encodeParams(p, true)} ${s}: ${desc}`);
        let state = g.newState(p, desc);
        for (let k = 0; k < STEPS; k++) {
          const h = g.hint?.(state);
          if (!h?.ok || h.steps.length === 0) {
            lines.push(`  end ${JSON.stringify(h?.ok === false ? h : "done")}`);
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
  writeFileSync(out, `${lines.join("\n")}\n`);
  console.log(`${lines.length} lines`);
});

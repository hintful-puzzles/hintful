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
import { soloGame } from "../../src/games/solo/index.ts";
import { COMPARE as SOLO } from "../../src/games/solo/solver.ts";
import { DIFF_INTERSECT, DIFF_SET, SYMM_NONE } from "../../src/games/solo/state.ts";
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
  ["solo", soloGame],
];

/** Boards beyond the presets: Killer at other sizes and tiers, and with X. */
const EXTRA: Record<string, unknown[]> = {
  group: [2, 3, 4].map((diff) => ({ w: 8, diff, id: false })),
  solo: [
    { c: 2, r: 3, diff: DIFF_INTERSECT },
    { c: 3, r: 3, diff: DIFF_INTERSECT },
    { c: 3, r: 3, diff: DIFF_SET },
    { c: 6, r: 1, diff: DIFF_INTERSECT },
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
  // SOLO_HAND_WRITTEN runs Solo's hand-written ladder, while it is there.
  SOLO.handWritten = process.env["SOLO_HAND_WRITTEN"] !== undefined;
  // SOLO_READ_AT_START has its min/max read each cage as the call found it.
  SOLO.readAtStart = process.env["SOLO_READ_AT_START"] !== undefined;
  // SOLO_DOMAIN_SUMS has its sums count only the board's values.
  SOLO.domainSums = process.env["SOLO_DOMAIN_SUMS"] !== undefined;
  // SOLO_SOLVE_PATH sets the comparison's switches that change only how much
  // one solve-path firing does, so the generator deals what the compiled
  // ladder deals.
  const solvePath = process.env["SOLO_SOLVE_PATH"] !== undefined;
  SOLO.splitParts = solvePath;
  SOLO.onePlacement = solvePath;
  SOLO.freshCages = solvePath;
  SOLO.oneAtATime = solvePath;
  for (const [name, g] of GAMES.filter(([n]) => only === null || only.includes(n)))
    for (const p of [g.defaultParams(), ...presets(g), ...(EXTRA[name] ?? [])])
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

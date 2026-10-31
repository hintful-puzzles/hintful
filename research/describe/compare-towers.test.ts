/**
 * Towers' compiled ladder against its hand-written deductions, on every
 * preset's deals and hint walks: with `COMPARE.on`, every `solveTowers` call
 * runs both on copies and tallies where they differ in what they return, the
 * grid, the cube or the records. `openspec/changes/describe-towers/tasks.md`
 * 2.3.
 */
import { expect, it } from "vitest";
import type { PresetMenu } from "../../src/engine/game.ts";
import { presetMenu } from "../../src/engine/param-label.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { towersGame } from "../../src/games/towers/index.ts";
import { COMPARE } from "../../src/games/towers/solver.ts";

const SEEDS = Number(process.env["SEEDS"] ?? 3);
const STEPS = 300;

function presets(): unknown[] {
  const out: unknown[] = [];
  const walk = (menu: PresetMenu<unknown>): void => {
    if (menu.submenu) for (const child of menu.submenu) walk(child);
    else if (menu.params !== undefined) out.push(menu.params);
  };
  walk(presetMenu(towersGame) as PresetMenu<unknown>);
  return out;
}

it("towers: the compiled ladder against the hand-written one", () => {
  COMPARE.on = true;
  COMPARE.compared = 0;
  COMPARE.mismatches.length = 0;
  COMPARE.reasons.clear();
  const g = towersGame;
  let boards = 0;
  let hints = 0;
  // The walk's steps by rung, so a zero is seen to cover Towers' own.
  const rungs = new Map<string, number>();
  // The menu's presets, and the sizes it does not offer at each tier.
  const sizes = [3, 4, 5, 7, 8].flatMap((w) =>
    ["easy", "hard", "extreme", "unreasonable"]
      .filter((diff) => w > 3 || diff === "easy" || diff === "hard")
      .map((diff) => ({ w, diff })),
  );
  try {
    for (const p of [g.defaultParams(), ...presets(), ...sizes] as ReturnType<
      typeof g.defaultParams
    >[])
      for (let s = 0; s < SEEDS; s++) {
        const { desc } = g.newDesc(p, randomNew(`check towers ${s}`));
        boards++;
        let state = g.newState(p, desc);
        for (let k = 0; k < STEPS; k++) {
          const h = g.hint?.(state);
          if (!h?.ok || h.steps.length === 0) break;
          const rung = h.steps[0].rung ?? "?";
          rungs.set(rung, (rungs.get(rung) ?? 0) + 1);
          const move = h.steps[0].move;
          if (!move) break;
          const next = g.executeMove(state, move);
          if (next === null) break;
          state = next;
          hints++;
        }
      }
  } finally {
    COMPARE.on = false;
  }
  console.log(
    `towers: ${boards} boards, ${hints} hint steps, ${COMPARE.compared} compared, ${COMPARE.mismatches.length} differ`,
  );
  console.log(`steps: ${[...rungs].sort().join(" ")}`);
  console.log(`records: ${[...COMPARE.reasons].sort().join(" ")}`);
  console.log(COMPARE.mismatches.slice(0, 3));
  expect(COMPARE.mismatches).toEqual([]);
});

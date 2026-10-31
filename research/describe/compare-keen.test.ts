/**
 * Keen's compiled ladder against its hand-written deductions, on every
 * preset's deals and hint walks: with `COMPARE.on`, every `solveKeen` call
 * runs both on copies and tallies where they differ in what they return, the
 * grid, the cube or the records. `openspec/changes/describe-keen/tasks.md`
 * 2.4.
 */
import { expect, it } from "vitest";
import type { PresetMenu } from "../../src/engine/game.ts";
import { presetMenu } from "../../src/engine/param-label.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { RetryLimitExceeded } from "../../src/engine/retry-limit.ts";
import { keenGame } from "../../src/games/keen/index.ts";
import { COMPARE } from "../../src/games/keen/solver.ts";
import type { KeenParams } from "../../src/games/keen/state.ts";
import { progress } from "./pilot.ts";

const SEEDS = Number(process.env["SEEDS"] ?? 3);
const STEPS = 400;

function presets(): KeenParams[] {
  const out: KeenParams[] = [];
  const walk = (menu: PresetMenu<KeenParams>): void => {
    if (menu.submenu) for (const child of menu.submenu) walk(child);
    else if (menu.params !== undefined) out.push(menu.params);
  };
  walk(presetMenu(keenGame));
  return out;
}

it("keen: the compiled ladder against the hand-written one", () => {
  COMPARE.on = true;
  COMPARE.compared = 0;
  COMPARE.mismatches.length = 0;
  COMPARE.reasons.clear();
  const g = keenGame;
  let boards = 0;
  let hints = 0;
  // The walk's steps by rung, so a zero is seen to cover Keen's own.
  const rungs = new Map<string, number>();
  // The menu's presets, and the sizes it does not offer at each tier.
  const tiers = ["easy", "normal", "hard", "extreme", "unreasonable"] as const;
  const sizes: KeenParams[] = [
    ...(["easy", "normal"] as const).map((diff) => ({
      w: 3,
      diff,
      multiplicationOnly: false,
    })),
    ...[7, 8].flatMap((w) =>
      tiers.map((diff) => ({ w, diff, multiplicationOnly: false })),
    ),
    ...tiers.map((diff) => ({ w: 5, diff, multiplicationOnly: true })),
  ];
  const only = process.env["ONLY"];
  try {
    for (const p of [g.defaultParams(), ...presets(), ...sizes]) {
      const name = g.encodeParams(p, true);
      if (only !== undefined && name !== only) continue;
      for (let s = 0; s < SEEDS; s++) {
        let desc: string;
        try {
          desc = g.newDesc(p, randomNew(`check keen ${s}`)).desc;
        } catch (e) {
          if (!(e instanceof RetryLimitExceeded)) throw e;
          progress(`${name}: the generator gives up`);
          break;
        }
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
        progress(
          `${name} seed ${s}: ${COMPARE.compared} compared, ${COMPARE.mismatches.length} differ`,
        );
      }
    }
  } finally {
    COMPARE.on = false;
  }
  progress(
    `keen: ${boards} boards, ${hints} hint steps, ${COMPARE.compared} compared, ${COMPARE.mismatches.length} differ`,
  );
  progress(`steps: ${[...rungs].sort().join(" ")}`);
  progress(`records: ${[...COMPARE.reasons].sort().join(" ")}`);
  progress(JSON.stringify(COMPARE.mismatches.slice(0, 3), null, 1));
  expect(COMPARE.mismatches).toEqual([]);
});

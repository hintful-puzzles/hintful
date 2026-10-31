/**
 * Mathrax's compiled ladder against its hand-written deductions, on every
 * preset's deals and hint walks: with `COMPARE.on`, every `mathraxSolve` call
 * runs both on copies and tallies where they differ in what they return, the
 * grid, the cube or the records. `openspec/changes/describe-mathrax/tasks.md`
 * 2.4.
 */
import { expect, it } from "vitest";
import type { PresetMenu } from "../../src/engine/game.ts";
import { presetMenu } from "../../src/engine/param-label.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { RetryLimitExceeded } from "../../src/engine/retry-limit.ts";
import { mathraxGame } from "../../src/games/mathrax/index.ts";
import { COMPARE } from "../../src/games/mathrax/solver.ts";
import {
  type MathraxDiff,
  type MathraxParams,
  OPTION_ADD,
  OPTION_DIV,
  OPTION_EQL,
  OPTION_MUL,
  OPTION_ODD,
  OPTION_SUB,
  OPTIONSMASK,
} from "../../src/games/mathrax/state.ts";
import { progress } from "./pilot.ts";

const SEEDS = Number(process.env["SEEDS"] ?? 3);
const STEPS = 400;

function presets(): MathraxParams[] {
  const out: MathraxParams[] = [];
  const walk = (menu: PresetMenu<MathraxParams>): void => {
    if (menu.submenu) for (const child of menu.submenu) walk(child);
    else if (menu.params !== undefined) out.push(menu.params);
  };
  walk(presetMenu(mathraxGame));
  return out;
}

it("mathrax: the compiled ladder against the hand-written one", () => {
  COMPARE.on = true;
  COMPARE.compared = 0;
  COMPARE.mismatches.length = 0;
  COMPARE.reasons.clear();
  const g = mathraxGame;
  let boards = 0;
  let hints = 0;
  // The walk's steps by rung, so a zero is seen to cover Mathrax's own.
  const rungs = new Map<string, number>();
  // The menu's presets; every size at every tier; and each clue kind alone,
  // and all but each, at the default size.
  const tiers: MathraxDiff[] = ["easy", "normal", "tricky", "recursive"];
  const kinds = [
    OPTION_ADD,
    OPTION_SUB,
    OPTION_MUL,
    OPTION_DIV,
    OPTION_EQL,
    OPTION_ODD,
  ];
  const params: MathraxParams[] = [
    g.defaultParams(),
    ...presets(),
    ...[3, 4, 5, 6, 7, 8, 9].flatMap((o) =>
      tiers.map((diff) => ({ o, diff, options: OPTIONSMASK })),
    ),
    ...kinds.flatMap((bit) =>
      tiers.flatMap((diff) => [
        { o: 5, diff, options: bit },
        { o: 5, diff, options: OPTIONSMASK & ~bit },
      ]),
    ),
  ];
  const only = process.env["ONLY"];
  const seen = new Set<string>();
  try {
    for (const p of params) {
      const name = g.encodeParams(p, true);
      if (seen.has(name) || (only !== undefined && name !== only)) continue;
      seen.add(name);
      if (g.validateParams?.(p, true)) continue;
      for (let s = 0; s < SEEDS; s++) {
        let desc: string;
        try {
          desc = g.newDesc(p, randomNew(`check mathrax ${s}`)).desc;
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
    `mathrax: ${boards} boards, ${hints} hint steps, ${COMPARE.compared} compared, ${COMPARE.mismatches.length} differ`,
  );
  progress(`steps: ${[...rungs].sort().join(" ")}`);
  progress(`records: ${[...COMPARE.reasons].sort().join(" ")}`);
  progress(JSON.stringify(COMPARE.mismatches.slice(0, 3), null, 1));
  expect(COMPARE.mismatches).toEqual([]);
}, 3_600_000);

/**
 * The compiled Latin ladder against the hand-written one it replaces, on
 * every Latin game's deals and hint walks: with `CHECK.selfCheck` on, every
 * `latinSolver` call runs both on copies and throws where they differ in what
 * they return, the grid, the cube or the records (`compareRuns`).
 * `openspec/changes/compile-the-latin-ladder/tasks.md` 3.3.
 */
import { describe, expect, it } from "vitest";
import { CHECK } from "../../src/engine/latin.ts";
import { randomNew } from "../../src/engine/random/index.ts";
import { LATIN_GAMES, presetParams } from "./latin-games.ts";

const SEEDS = 3;
const STEPS = 60;

describe("the compiled Latin ladder against the hand-written one", () => {
  for (const [name, g] of LATIN_GAMES)
    it(name, () => {
      CHECK.selfCheck = true;
      const before = CHECK.compared;
      let boards = 0;
      let hints = 0;
      try {
        for (const p of [g.defaultParams(), ...presetParams(g)])
          for (let s = 0; s < SEEDS; s++) {
            const { desc } = g.newDesc(p, randomNew(`check ${name} ${s}`));
            boards++;
            let state = g.newState(p, desc);
            for (let k = 0; k < STEPS; k++) {
              const h = g.hint?.(state);
              if (!h?.ok || h.steps.length === 0) break;
              const move = h.steps[0].move;
              if (!move) break;
              const next = g.executeMove(state, move);
              if (next === null) break;
              state = next;
              hints++;
            }
          }
      } finally {
        CHECK.selfCheck = false;
      }
      console.log(
        `${name}: ${boards} boards, ${hints} hint steps, ${CHECK.compared - before} compared`,
      );
      expect(CHECK.mismatches).toBe(0);
    });
});

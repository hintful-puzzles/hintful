/*
 * **Check & Save outlines a wrong entry that breaks no rule yet**, in every
 * game born from its description.
 *
 * A live error mark shows a broken rule as the player plays; an entry the
 * answer disagrees with and no rule refuses yet is shown only by Check &
 * Save, and only if the overlay draws it. So on a board dealt from a fixed
 * seed, the first open cell whose other value draws no error is given that
 * value; Check & Save then counts one mistake, and the frame draws in the
 * error color. `mistake-overlay-coverage.test.ts` counts a born game covered
 * by this.
 *
 * The population is the born games (`testing/born-games.ts`), each a fill
 * game, whose board is its values and the cells the deal fixed.
 */
import { describe, expect, it } from "vitest";
import { COL_ERROR } from "../engine/color/roles.ts";
import { BORN_GAMES } from "../engine/testing/born-games.ts";
import { dealt } from "../engine/testing/dealt.ts";
import { dealtBoards } from "../engine/testing/presets.ts";
import { renderScenario } from "../engine/testing/render-scenario.ts";

interface FillBoard {
  readonly values: Uint8Array;
  readonly fixed: Uint8Array;
}

/** How many ops a frame draws in the error color. */
const errorOps = (r: ReturnType<typeof renderScenario>): number =>
  r.recording.ops.filter((o) => "color" in o && o.color === COL_ERROR).length;

describe("Check & Save outlines a wrong entry that breaks no rule", () => {
  it("reads a real population", () => {
    expect(BORN_GAMES.length).toBeGreaterThanOrEqual(14);
  });

  for (const { id, game } of BORN_GAMES)
    it(id, () => {
      expect(game.findMistakes, `${id} has no mistake check`).toBeDefined();
      const { params } = dealtBoards(game, { scalarEnds: false })[0];
      const board = `${game.encodeParams(params, true)}:${dealt(game, params).desc}`;
      const fresh = game.newState(params, dealt(game, params).desc) as FillBoard;
      const solved = game.solve(fresh, fresh);
      if (!solved.ok) throw new Error(`${board}: no answer (${solved.error})`);
      const answer = (game.executeMove(fresh, solved.move) as FillBoard).values;
      // The values the player enters: those the answer holds on open cells.
      const entered = [
        ...new Set(Array.from(answer).filter((v, c) => !fresh.fixed[c] && v !== 0)),
      ];
      expect(entered.length, `${board}: values entered`).toBeGreaterThan(0);
      for (let c = 0; c < answer.length; c++) {
        if (fresh.fixed[c]) continue;
        for (const v of entered) {
          if (v === answer[c]) continue;
          const moves = [{ set: [c, v] }];
          if (errorOps(renderScenario({ game, id: board, moves })) > 0) continue;
          const shown = renderScenario({ game, id: board, moves, showMistakes: true });
          expect(shown.mistakeCount, `${board}: ${v} at ${c}`).toBe(1);
          expect(errorOps(shown), `${board}: ${v} at ${c}, drawn`).toBeGreaterThan(0);
          return;
        }
      }
      throw new Error(`${board}: no wrong entry that breaks no rule`);
    });
});

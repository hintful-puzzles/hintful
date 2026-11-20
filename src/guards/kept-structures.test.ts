/**
 * Every structure the runtime keeps over the marks, read against one made
 * afresh at each read, in every game whose compiled module keeps one: each
 * shared board solved at every cap, and its hint walked. A kept structure
 * trusts that every change to the marks is a logged placement or a new epoch,
 * which a game's own code could break by writing the grid in place.
 */
import { expect, it } from "vitest";
import { difficultyTiers } from "../engine/contract/difficulty.ts";
import { setKeptCheck } from "../engine/describe-runtime.ts";
import { dealt } from "../engine/testing/dealt.ts";
import {
  type AnyGame,
  gamesUsing,
  REGISTERED_GAMES,
} from "../engine/testing/enrollment.ts";
import { dealtBoards } from "../engine/testing/presets.ts";

/** What a compiled module calls to read a kept structure. */
const KEPT = ["keptEdgeGroups", "linkedSum", "linkedOf"].map((name) => ({
  module: "src/engine/describe-runtime.ts",
  name,
}));

const KEEPING = gamesUsing(
  REGISTERED_GAMES.map(([id]) => id),
  KEPT,
  "call",
);
const KEEPERS: [string, AnyGame][] = REGISTERED_GAMES.filter(([id]) =>
  KEEPING.includes(id),
);

/** Hint requests made of each board, and boards a game. */
const STEPS = 30;
const BOARDS = 3;

it("some games keep a structure over the marks", () => {
  expect(KEEPERS.length).toBeGreaterThan(0);
});

for (const [id, game] of KEEPERS) {
  it(`${id}'s kept structures agree with fresh ones through solves and hints`, () => {
    const caps = difficultyTiers(game)?.length ?? 0;
    setKeptCheck(true);
    try {
      // Three boards: a fresh structure at every read makes each dear.
      for (const { params } of dealtBoards(game).slice(0, BOARDS)) {
        const { desc, aux } = dealt(game, params);
        for (let cap = 0; cap < caps; cap++)
          game.difficulty?.solveAtCap(params, desc, cap);
        game.finishesByDeduction?.(game.newState(params, desc));
        let state = game.newState(params, desc);
        const ui = game.newUi(state);
        for (let i = 0; i < STEPS && game.status(state) === "ongoing"; i++) {
          const res = game.hint.plan(state, aux, ui);
          if (!res?.ok) break;
          const step = res.steps[0];
          if (step === undefined) break;
          state = game.executeMove(state, step.move);
        }
      }
    } finally {
      // The reads it checked: none would mean the switch reached nothing.
      expect(setKeptCheck(false)).toBeGreaterThan(0);
    }
  });
}

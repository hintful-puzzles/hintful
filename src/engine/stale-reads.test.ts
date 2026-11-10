/**
 * A compiled binding must not fire on reads of the marks that a fact of its
 * own run changed since (`docs/descriptions.md` § "What a technique compiles
 * to"). The compiler decides which reads to make again and when: under a
 * count of facts, at a slot it chooses, narrowed to the groups a binding
 * used. Under `setStaleCheck` every binding reads all its binders afresh
 * before it fires and throws where one no longer holds, so a mistake in any
 * of those choices fails here, in every game whose module the compiler gave
 * the guard, not only in the game whose own tests happen to reach it.
 *
 * The shared boards are solved at every cap, which runs each binding on the
 * solve path, where a run goes on past a firing. A short hint walk reaches
 * the techniques of a game with no tiers (Guess, Mines). A game whose boards
 * never make a read go stale cannot fail here: where the compiler's read made
 * again never fails on a game's boards, dropping it changes nothing that game
 * does. Some reads fail only on a rarer board (Bridges' at its sixth Normal
 * deal, Crossing's at its ninth Unreasonable one, 2026-11-10), so the slow
 * tier deals more boards of each preset under the switch.
 */
import { describe, expect, it } from "vitest";
import "../games/index.ts";
import { setStaleCheck } from "./describe-runtime.ts";
import { difficultyTiers } from "./difficulty.ts";
import { getTsGame } from "./registry.ts";
import { dealt, dealtAgain } from "./testing/dealt.ts";
import { type AnyGame, gatePresets } from "./testing/hint-games.ts";
import { seedBudget } from "./testing/slow.ts";

const modules = import.meta.glob<string>("../games/*/*.compiled.ts", {
  eager: true,
  query: "?raw",
  import: "default",
});

/** The games whose compiled module guards a binding, by what it compiled. */
const GUARDED = Object.entries(modules)
  .filter(([, text]) => text.includes("staleChecking) {"))
  .map(([path]) => path.split("/")[2])
  .sort();

/** Hint requests made of each board. */
const STEPS = 5;

/** Boards of each preset dealt afresh under the switch, past the shared one:
 * a deal runs the ladder on many boards of its own. */
const DEALS = seedBudget(0, 12);

describe("no compiled binding fires on a stale read", () => {
  it("has games to check", () => {
    expect(GUARDED.length).toBeGreaterThan(0);
  });

  for (const id of GUARDED)
    it(`${id}: its bindings read afresh what they bound`, () => {
      const game = getTsGame(id) as AnyGame;
      const presets = gatePresets(game);
      expect(presets.length).toBeGreaterThan(0);
      const caps = difficultyTiers(game)?.length ?? 0;
      setStaleCheck(true);
      try {
        for (const { params } of presets) {
          const { desc, aux } = dealt(game, params);
          for (let cap = 0; cap < caps; cap++)
            game.difficulty?.solveAtCap(params, desc, cap);
          let state = game.newState(params, desc);
          const ui = game.newUi(state);
          for (let i = 0; i < STEPS && game.status(state) === "ongoing"; i++) {
            const res = game.hint?.(state, aux, ui);
            if (!res?.ok) break;
            const step = res.steps[0];
            if (step === undefined) break;
            state = game.executeMove(state, step.move);
          }
          for (let n = 1; n <= DEALS; n++) dealtAgain(game, params, n);
        }
      } finally {
        // The bindings it checked: none would mean the switch reached nothing.
        expect(setStaleCheck(false)).toBeGreaterThan(0);
      }
    });
});

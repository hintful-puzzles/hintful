/**
 * Every hint that speaks keeps its sentences in the game's `hint-text.ts`
 * (docs/games/hints.md § "The sentences live in one file per game").
 *
 * **Both populations are derived.** The games are the registry's hinting games
 * (`HINT_GAMES`), split by whether a hint on a real board says anything — which
 * is how a game whose steps carried no words would be excused without a ledger. The
 * text modules are whatever `hint-text.ts` files exist. Each side is asserted
 * against the other, so a speaking game without one fails, and so does a text
 * module left behind by a game whose hint stopped speaking.
 */

import { describe, expect, it } from "vitest";
import { randomNew } from "./random/index.ts";
import { gatePresets, HINT_GAMES } from "./testing/hint-games.ts";

/** Game ids with a text module, read off the paths alone (nothing is loaded). */
const WITH_TEXT = new Set(
  Object.keys(import.meta.glob("../games/*/hint-text.ts")).map((p) => p.split("/")[2]),
);

const SEEDS = ["ht-a", "ht-b", "ht-c"];

/**
 * Does this game's hint put words on screen? One speaking step on any board of
 * the gate slice settles it.
 *
 * **The widening is almost free here, and it is not symmetric.** This returns
 * on the first speaking step, so a game that speaks costs what it always cost —
 * one board — and only a *silent* game walks the whole slice, which is the case
 * the answer has to be right about. Reading the easiest preset alone
 * (`slice-the-first-leaf-hint-guards-by-axis`) could call a game silent on the
 * strength of a board with no deduction to narrate, and then demand that its
 * `hint-text.ts` be deleted.
 */
function speaks(id: string): boolean {
  const game = HINT_GAMES.find(([g]) => g === id)?.[1];
  if (!game) return false;
  for (const { title, params } of gatePresets(id, game)) {
    for (const seed of SEEDS) {
      let board: { desc: string; aux?: string };
      try {
        board = game.newDesc(params, randomNew(`${id}-${title}-${seed}`));
      } catch {
        continue;
      }
      const { desc, aux } = board;
      const res = game.hint?.(game.newState(params, desc), aux);
      if (res?.ok && res.steps.some((s) => s.explanation !== "")) return true;
    }
  }
  return false;
}

describe("hint sentences live in one file per game", () => {
  it("every game whose hint speaks has a hint-text.ts, and no other game does", () => {
    const speaking = HINT_GAMES.map(([id]) => id).filter(speaks);
    // Vacuity: a glob or a registry that found nothing would pass both checks.
    expect(speaking.length, "almost no hinting game spoke").toBeGreaterThan(25);
    expect(WITH_TEXT.size, "the glob found almost no text modules").toBeGreaterThan(25);

    expect(
      speaking.filter((id) => !WITH_TEXT.has(id)),
      "these hints speak, but keep their sentences outside a hint-text.ts",
    ).toEqual([]);
    expect(
      [...WITH_TEXT].filter((id) => !speaking.includes(id)),
      "these games have a hint-text.ts, but their hint says nothing",
    ).toEqual([]);
  });
});

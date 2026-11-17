/**
 * Every hint that speaks states its sentences in its description, and no game
 * keeps a `hint-text.ts` (docs/hints.md § "The sentences live in the
 * description").
 *
 * **Both populations are derived.** The games are the registry's hinting games
 * (`HINT_GAMES`), split by whether a hint on a real board says anything — which
 * is how a game whose steps carried no words would be excused without a ledger. The
 * stated games are whichever compiled modules state words. Each side is asserted
 * against the other, so a speaking game without stated words fails, and so do
 * words left behind by a game whose hint stopped speaking.
 */

import { describe, expect, it } from "vitest";
import { dealt } from "./testing/dealt.ts";
import { gatePresets, HINT_GAMES } from "./testing/hint-games.ts";

/** Game ids with a text module, read off the paths alone (nothing is loaded),
 * and the skeletons', `skeleton/<kind>`: a game is a copy of one, so a
 * skeleton's text module is refused in every game made from it. */
const WITH_TEXT = new Set(
  Object.keys(
    import.meta.glob(["../games/*/hint-text.ts", "../skeleton/*/hint-text.ts"]),
  ).map((p) => {
    const [, dir, id] = p.split("/");
    return dir === "games" ? id : `${dir}/${id}`;
  }),
);

/** Game ids whose description states its sentences: a compiled module with a
 * non-empty `STATED` (a technique's words) or `STEPS` (a planner's kinds of
 * step). The hint already loads these modules, so reading them here costs
 * nothing. */
const STATED_GAMES = new Set(
  Object.entries(
    import.meta.glob<Record<string, object>>("../generated/games/*/*.compiled.ts", {
      eager: true,
    }),
  )
    .filter(([, m]) =>
      ["STATED", "STEPS"].some((name) => name in m && Object.keys(m[name]).length > 0),
    )
    .map(([p]) => p.split("/").at(-2) ?? ""),
);

const SEEDS = [0, 1, 2];

/**
 * Does this game's hint put words on screen? One speaking step on any board of
 * the gate slice settles it.
 *
 * **The widening is almost free here, and it is not symmetric.** This returns
 * on the first speaking step, so a game that speaks costs what it always cost —
 * one board — and only a *silent* game walks the whole slice, which is the case
 * the answer has to be right about. Reading the easiest preset alone could
 * call a game silent on the
 * strength of a board with no deduction to narrate, and then demand that its
 * `hint-text.ts` be deleted.
 */
function speaks(id: string): boolean {
  const game = HINT_GAMES.find(([g]) => g === id)?.[1];
  if (!game) return false;
  for (const { params } of gatePresets(game)) {
    for (const seed of SEEDS) {
      let board: { desc: string; aux?: string };
      try {
        board = dealt(game, params, seed);
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

describe("hint sentences live in the description", () => {
  it("every game whose hint speaks states its words, and no other game does", () => {
    const speaking = HINT_GAMES.map(([id]) => id).filter(speaks);
    // Vacuity: a glob or a registry that found nothing would pass both checks.
    expect(speaking.length, "almost no hinting game spoke").toBeGreaterThan(25);
    expect(
      STATED_GAMES.size,
      "the glob found almost no stated description",
    ).toBeGreaterThan(25);

    expect(
      speaking.filter((id) => !STATED_GAMES.has(id)),
      "these hints speak, but their description states no words",
    ).toEqual([]);
    expect(
      [...STATED_GAMES].filter((id) => !speaking.includes(id)),
      "these games state words, but their hint says nothing",
    ).toEqual([]);
  });

  it("no game or skeleton keeps a hint-text.ts", () => {
    expect(
      [...WITH_TEXT],
      "these games or skeletons keep sentences outside their description",
    ).toEqual([]);
  });
});

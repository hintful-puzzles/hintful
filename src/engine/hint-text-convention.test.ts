/**
 * Every hint that speaks keeps its sentences in the game's `hint-text.ts`, or
 * states them in its description (docs/hints.md § "The sentences live in one
 * file per game").
 *
 * **Both populations are derived.** The games are the registry's hinting games
 * (`HINT_GAMES`), split by whether a hint on a real board says anything — which
 * is how a game whose steps carried no words would be excused without a ledger. The
 * text modules are whatever `hint-text.ts` files exist. Each side is asserted
 * against the other, so a speaking game without one fails, and so does a text
 * module left behind by a game whose hint stopped speaking.
 */

import { describe, expect, it } from "vitest";
import { dealt } from "./testing/dealt.ts";
import { gatePresets, HINT_GAMES } from "./testing/hint-games.ts";

/** Game ids with a text module, read off the paths alone (nothing is loaded). */
const WITH_TEXT = new Set(
  Object.keys(import.meta.glob("../games/*/hint-text.ts")).map((p) => p.split("/")[2]),
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

/** Where a game's sentences may live: its text module or its description. */
const SPOKEN_FROM = new Set([...WITH_TEXT, ...STATED_GAMES]);

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

describe("hint sentences live in one file per game", () => {
  it("every game whose hint speaks has a hint-text.ts or stated words, and no other game does", () => {
    const speaking = HINT_GAMES.map(([id]) => id).filter(speaks);
    // Vacuity: a glob or a registry that found nothing would pass both checks.
    expect(speaking.length, "almost no hinting game spoke").toBeGreaterThan(25);
    expect(WITH_TEXT.size, "the glob found almost no text modules").toBeGreaterThan(25);

    expect(STATED_GAMES.size, "the glob found no stated description").toBeGreaterThan(
      0,
    );

    expect(
      speaking.filter((id) => !SPOKEN_FROM.has(id)),
      "these hints speak, but keep their sentences outside a hint-text.ts or a stated description",
    ).toEqual([]);
    expect(
      [...SPOKEN_FROM].filter((id) => !speaking.includes(id)),
      "these games have a hint-text.ts or stated words, but their hint says nothing",
    ).toEqual([]);
  });

  it("every text module exports its sentences as `say`", async () => {
    const modules = import.meta.glob<Record<string, unknown>>(
      "../games/*/hint-text.ts",
    );
    const without: string[] = [];
    for (const [path, load] of Object.entries(modules))
      if (!("say" in (await load()))) without.push(path.split("/")[2]);
    expect(Object.keys(modules).length).toBe(WITH_TEXT.size);
    expect(without, "these text modules export no `say`").toEqual([]);
  });
});

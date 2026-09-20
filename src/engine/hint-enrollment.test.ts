/**
 * The guard on the *instrument*, for the six cross-game hint guards.
 *
 * `HINT_GAMES` used to be a hand-maintained array of thirty games, and
 * `derive-hint-enrollment` replaced it with a filter over the registry. That
 * removes the old failure — a game with a `hint()` left off the list, getting
 * zero of the six guards, silently — by construction rather than by assertion:
 * there is no list to forget to edit, so no test here can meaningfully "check
 * that games are enrolled". **Asserting the derivation against its own
 * definition would be a tautology**, the shape AGENTS.md calls out (a guard must
 * measure the thing it claims to guard, not restate it).
 *
 * What a derivation *can* fail at is finding nothing, or finding less. That is
 * the failure this file exists for, and it is the shape this repo has hit six
 * times (`grid.test.ts`'s `d.edges.length === d.order`, the touch sweep counting
 * the catalog while iterating the registry, the silently-empty
 * `import.meta.glob`, both halves of the help-link check).
 *
 * **Measured, not assumed** (`derive-hint-enrollment`). Breaking the derivation
 * so it matches nothing and running the six consuming guards: under a bare
 * `vitest run` they *error* with "No test found in suite", because each builds
 * its `it()` blocks in a loop over `HINT_GAMES` and an empty array leaves an
 * empty `describe`. That looks like adequate protection — and it is not the
 * configuration the gate uses. `npm run test:run` passes **`--passWithNoTests`**,
 * and under it all six report `Test Files passed / Tests: no tests` and the gate
 * goes green having checked no game at all. So the floors below are the only
 * thing standing between an empty derivation and a clean commit.
 */
import { describe, expect, it } from "vitest";
import {
  axisSlice,
  HINT_GAMES,
  leafPresets,
  presetAxes,
  REGISTERED_GAME_COUNT,
} from "./testing/hint-games.ts";

describe("the hint-guard enrolled set is derived, and non-vacuous", () => {
  it("drew from a fully populated registry", () => {
    // THE POPULATION, not the result. A filter can return a healthy-looking
    // count from a short population, so the floor goes here first. Deliberately
    // below the true count (57 when written): it separates "working" from
    // "enumerating nothing", and is not a ratchet a legitimate change must bump.
    expect(REGISTERED_GAME_COUNT).toBeGreaterThan(50);
  });

  it("enrolled the games that ship a hint, and did not come back empty", () => {
    // A floor at the count the hand-maintained list carried on the day it was
    // replaced. Adding a hint raises it and is fine; falling below it means a
    // game lost its hint or the derivation lost the game, and both deserve to
    // fail loudly rather than to quietly shrink six guards' coverage.
    expect(HINT_GAMES.length).toBeGreaterThanOrEqual(30);
    // …and strictly fewer than the whole registry, because the collection
    // deliberately keeps some games hintless for now (owner, 2026-09-04: they
    // are the corpus for assessing the framework work). An enrolled set equal to
    // the registry would mean the filter stopped filtering.
    expect(HINT_GAMES.length).toBeLessThan(REGISTERED_GAME_COUNT);
  });

  it("hands every guard a usable pair", () => {
    // Cheap, and it catches the one way the map above could be wrong without
    // being empty: an id that resolves to nothing.
    for (const [id, game] of HINT_GAMES) {
      expect(id, "a game id must be a non-empty string").toBeTruthy();
      expect(game, `${id}: registry returned no game`).toBeTruthy();
    }
  });

  it("is stably ordered, so a failing sweep is reproducible", () => {
    const ids = HINT_GAMES.map(([id]) => id);
    expect(ids).toEqual([...ids].sort());
    expect(new Set(ids).size, "a game enrolled twice").toBe(ids.length);
  });
});

/**
 * The guard on the **second** instrument these sweeps run on: which of a game's
 * presets the per-commit slice keeps (`axisSlice`).
 *
 * It fails in the same one way the enrolled set does — by finding less — and
 * with the same silence, because a slice that collapsed to one board per game
 * leaves every walk green over a smaller collection. The difference is that
 * `HINT_GAMES` collapsing to nothing at least stops generating `it()` blocks,
 * while a collapsed slice generates all of them and walks the easiest board of
 * each, which is precisely the state this slice was twice widened out of.
 */
describe("the per-commit preset slice is derived, and did not collapse", () => {
  const rows = HINT_GAMES.map(([id, game]) => {
    const presets = leafPresets(game.presets());
    return { id, game, presets, slice: axisSlice(game, presets) };
  });

  it("found axes to slice on, in nearly every game", () => {
    // THE POPULATION the slice was drawn from, first: `paramConfig` is where
    // the axes come from, and `custom-params.test.ts` already fails a
    // registered game whose list is empty — so a game here with no config at
    // all means that guard and this one disagree, which is worth knowing.
    for (const { id, game } of rows) {
      expect(
        game.paramConfig?.length,
        `${id}: no paramConfig to derive axes from`,
      ).toBeGreaterThan(0);
    }
    // Then the result. A game whose presets genuinely vary nothing has no axis
    // and is not a defect — Fifteen offers one preset — but a *collection* with
    // no axes anywhere means the derivation stopped reading params.
    const axed = rows
      .map(({ id, game, presets }) => ({ id, kws: presetAxes(game, presets) }))
      .filter((r) => r.kws.length > 0);
    expect(
      axed.length,
      `axes found: ${axed.map((r) => `${r.id}[${r.kws.map((a) => a.kw)}]`).join(" ")}`,
    ).toBeGreaterThan(rows.length - 3);
  });

  it("keeps a board for every value of every discrete axis", () => {
    // Recomputed the plain way rather than through `axisSlice`'s greedy, so
    // this fails if the cover is wrong rather than restating that it is right.
    // Scoped to the discrete axes: a scalar axis is deliberately covered at its
    // ends only, and asserting that here would just re-derive `wantedValues`.
    let discrete = 0;
    for (const { id, game, presets, slice } of rows) {
      for (const item of game.paramConfig ?? []) {
        if (item.type === "string") continue;
        discrete++;
        const offered = [...new Set(presets.map((e) => item.get(e.params)))].sort();
        const walked = [...new Set(slice.map((e) => item.get(e.params)))].sort();
        expect(walked, `${id}: "${item.kw}" values the slice skips`).toEqual(offered);
      }
    }
    // How many axes the loop above actually looked at. Without it a
    // `paramConfig` that stopped declaring types — or one read through a
    // renamed accessor — would skip every item and report health. 50 when
    // written, floored well under it: the floor separates "read the config"
    // from "read nothing", and is not a ratchet a new game has to bump.
    expect(discrete, "no discrete axis examined").toBeGreaterThan(30);
  });

  it("reaches the modes that keying on tier alone hid", () => {
    // **The known positive** (AGENTS.md § "Method"). The two assertions above
    // both read `paramConfig`, so a single fault there — a renamed accessor, a
    // `get` that throws and is swallowed — could satisfy them while the slice
    // walked nothing but easy boards. These name a handful of modes by the
    // *params a walked board carries*, which is the thing the walk actually
    // receives, and they were each unwalked before `slice-presets-by-the-axes-
    // a-game-varies`. Keyed on params rather than on the preset's title, so
    // rewording a menu entry cannot quietly disarm one.
    const carries = (id: string, f: (p: Record<string, unknown>) => boolean): boolean =>
      (rows.find((r) => r.id === id)?.slice ?? []).some((e) =>
        f(e.params as Record<string, unknown>),
      );
    expect(
      carries("solo", (p) => p["killer"] === true),
      "no Solo Killer board",
    ).toBe(true);
    expect(
      carries("solo", (p) => p["xtype"] === true),
      "no Solo X board",
    ).toBe(true);
    expect(
      carries("solo", (p) => p["r"] === 1),
      "no Solo jigsaw board",
    ).toBe(true);
    expect(
      carries("unequal", (p) => p["mode"] === "adjacent"),
      "no Unequal Adjacent board",
    ).toBe(true);
    expect(
      carries("seismic", (p) => p["mode"] === 1),
      "no Seismic Tectonic board",
    ).toBe(true);
  });
});

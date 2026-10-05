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
import { difficultyTiers, tierOf } from "./difficulty.ts";
import { REGISTERED_GAME_COUNT, REGISTERED_GAMES } from "./testing/enrollment.ts";
import { gatePresets, HINT_GAMES } from "./testing/hint-games.ts";
import { axisSlice, dealtBoards, leafPresets, presetAxes } from "./testing/presets.ts";
import { SCANNED_TEST_FILES, testCodeLinesMatching } from "./testing/test-source.ts";

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
    const presets = leafPresets(game);
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

/**
 * The guard on the **third** instrument, and the one the other two could not
 * supply: *does a sweep call the slice at all?*
 *
 * The two above assert that the derivation and the slice are healthy. Neither
 * can see a guard that never asks them — and that was the state of every
 * cross-game sweep but one until
 * `slice-the-first-leaf-hint-guards-by-axis`: each built its own boards from
 * `firstLeaf(game.presets())`, or synthesized them with a `withTier` that
 * writes the tier field and nothing else, so no board any of them ran on
 * carried a cage, a jigsaw block, an X diagonal, an Adjacent clue, a Tectonic
 * region or any Loopy tiling but Squares.
 *
 * **Three of them sat inside the file whose main walk had already been fixed**,
 * which is the whole reason this check exists rather than a sentence in a
 * guide: a sweep fixed once is not a sweep that stays fixed, and the next one
 * is written by copying a neighbor.
 *
 * Keyed on the **shape** — the two calls themselves, anywhere in any test file,
 * comments stripped — and the superset is then classified by the ledger rather
 * than narrowed away (`AGENTS.md` § "A scan that keys on a name"). The ledger is
 * the rule 3 shape from `docs/games/testing.md` § "How a cross-game guard finds
 * its population": the scan says *who*, each entry says *why*, and the equality
 * below means neither can rot.
 */
const BUILDS_ITS_OWN_BOARDS: Record<string, string> = {
  "scripts/checks/tier-walk.test.ts":
    "Its question is the one a menu cannot be asked: whether a size the menu " +
    "does not offer can carry the tier written onto it. So it writes every tier " +
    "onto every size from a field's minimum up, which is the form a sweep of " +
    "the menu must not take, and it is a report outside the gate.",
  "src/engine/hint-quality.test.ts":
    "`lintCases` deliberately walks one corner the presets menu does not offer " +
    "— the last preset at the hardest teachable tier — because Group speaks the " +
    "shared Latin chain sentence at 12x12 Hard and at no point of its seven " +
    "presets. A Custom-dialog combination is a board a player can sit in front " +
    "of, and the ledger's rot half would read a live listing as dead without it.",
  "src/engine/hint-ordinal.test.ts":
    "`chainBoards`, the boards its scan for a pin deals, are the slice AND every " +
    "tier of the smallest preset, because a two-candidate chain needs a small " +
    "grid at a hard tier and a menu never pairs those. Measured: Keen emits an " +
    "ordered chain on none of its ten presets at eight seeds each, and readily " +
    "on 4x4 at Hard.",
  "src/engine/difficulty-contract.test.ts":
    "Its three cases generate no board at all — they ask whether `withTier` " +
    "writes a field `tierOf` and the codec read back, which is arithmetic on a " +
    "params record that any valid record exercises. Everything here that is " +
    "about boards already reads every leaf preset.",
  "src/engine/difficulty.test.ts":
    "Exercises `withTier` against a hand-written difficulty item rather than a " +
    "game, the way `hint-games.test.ts` exercises the slicing rule against a " +
    "hand-written menu: there is no presets menu in it to read.",
  "src/engine/preset-menu-shape.test.ts":
    "Deals no board. It writes a tier onto a preset to ask two things about the " +
    "menu itself: which of its lines are one board (the params with the tier " +
    "set aside), and whether a tier the menu leaves out is one any of its " +
    "boards would accept.",
  "src/engine/params-declared.test.ts":
    "Labels the default params at every tier and deals no board: what it " +
    "checks is the words, which no board can change.",
  "src/engine/upstream-descs.test.ts":
    "Deals no board: it loads the descs upstream's generator wrote, under the " +
    "params each fixture states, and `withTier` places a tier the fixture " +
    "numbers where the game's params name it.",
};

describe("a cross-game sweep takes its boards from the slice", () => {
  // `withTier` is the engine's since `declare-params-in-one-place`, called as a
  // function; `\b` still matches the method spelling a copied guard might keep.
  const OWN_BOARDS = /\bfirstLeaf\(|\bwithTier\(/;

  it("scanned the suite, and only the ledgered files build their own", () => {
    // Vacuity, first and for the usual reason: a glob that matched nothing
    // yields a clean bill of health over no files at all.
    expect(
      SCANNED_TEST_FILES,
      "the test-source glob found almost nothing",
    ).toBeGreaterThan(250);
    const found = [
      ...new Set(testCodeLinesMatching(OWN_BOARDS).map((m) => m.id)),
    ].sort();
    expect(
      found,
      "a test builds its own board population instead of calling `gatePresets` " +
        '(docs/games/testing.md § "Slicing a preset sweep for the gate"). If it ' +
        "genuinely needs a params record the presets menu does not offer, say " +
        "which behavior needs it and add it to BUILDS_ITS_OWN_BOARDS.",
    ).toEqual(Object.keys(BUILDS_ITS_OWN_BOARDS).sort());
  });

  it("every ledger entry states a reason", () => {
    // The other direction: an entry left behind by a file that stopped doing it
    // is a dead exemption, and a one-word entry is not a reason.
    for (const [path, why] of Object.entries(BUILDS_ITS_OWN_BOARDS))
      expect(why.length, `${path}'s entry states no reason`).toBeGreaterThan(80);
  });
});

/**
 * The guard on the **fourth** instrument: what the slice cannot reach because
 * the menu does not offer it.
 *
 * The slice walks one preset per value the presets vary, so a value the Custom
 * dialog offers and no preset holds was dealt by no cross-game guard. Salad's
 * hint threw on 71 of 1,195 Normal boards while all eleven of its presets were
 * Easy (`fix-salad-number-ball-hint-throw`). `dealtBoards` deals each such
 * value on the smallest preset that accepts it, and this asks whether it did.
 *
 * A value no preset accepts has no board, and is held to the ledger: the key
 * is `<game>: <kw> = <the dialog's words>`, and the reason says what does deal
 * it. **Empty, and meant to stay so.** ABCD's rule against diagonal touching
 * needs five letters and was the one entry, until its menu gained a board
 * with five.
 */
const NO_BOARD: Record<string, string> = {};

describe("every choice the Custom dialog offers is dealt", () => {
  const rows = REGISTERED_GAMES.map(([id, game]) => ({
    id,
    game,
    // What a guard is handed: `gatePresets` for a hinting game, and the same
    // function beneath it for the rest, which `desc-error-games.test.ts` calls.
    dealt: typeof game.hint === "function" ? gatePresets(id, game) : dealtBoards(game),
  }));

  it("deals a board for every value of every closed set, or says why not", () => {
    // Recomputed from `paramConfig` and the dealt boards alone, never through
    // `unofferedValues`, so this fails when the derivation is wrong and not
    // only when it disagrees with itself.
    const undealt: string[] = [];
    let examined = 0;
    for (const { id, game, dealt } of rows) {
      for (const item of game.paramConfig ?? []) {
        if (item.type === "string") continue;
        const held = new Set(dealt.map((e) => item.get(e.params)));
        const offered: [boolean | number, string][] =
          item.type === "boolean"
            ? [
                [false, "off"],
                [true, "on"],
              ]
            : item.choices.map((words: string, i: number) => [i, words]);
        for (const [value, words] of offered) {
          examined++;
          if (!held.has(value)) undealt.push(`${id}: ${item.kw} = ${words}`);
        }
      }
    }
    // How many values the loop looked at, for the reason every count here has
    // one. 229 when written, floored well beneath it.
    expect(examined, "no closed-set value examined").toBeGreaterThan(150);
    expect(undealt.sort()).toEqual(Object.keys(NO_BOARD).sort());
    for (const [key, why] of Object.entries(NO_BOARD))
      expect(why.length, `${key}'s entry states no reason`).toBeGreaterThan(80);
  });

  it("writes onto a copy, and leaves every game's menu as it was", () => {
    // A menu hands out the game's own preset objects, so a setter that reached
    // one would change what every later test and every later deal reads. The
    // copy is one level deep, which is enough while no setter writes through
    // a field; this is what says so.
    for (const [id, game] of REGISTERED_GAMES) {
      const menu = () =>
        leafPresets(game).map((e) => game.encodeParams(e.params, true));
      const before = menu();
      dealtBoards(game, { every: true });
      expect(menu(), `${id}: dealing changed a preset`).toEqual(before);
    }
  });

  it("reaches the tiers and rules no menu offered", () => {
    // **The known positive.** The case above reads every value through the
    // item's own `get`, so a `set` that wrote nothing and a `get` that read
    // nothing would agree with each other. These name boards by the params
    // they carry. Each was dealt by no cross-game guard before
    // `walk-every-choice-the-dialog-offers`; a menu that later gains the value
    // keeps them true.
    const dealtFor = (id: string): Record<string, unknown>[] =>
      (rows.find((r) => r.id === id)?.dealt ?? []).map(
        (e) => e.params as Record<string, unknown>,
      );
    const tierDealt = (id: string, tier: string): boolean => {
      const game = rows.find((r) => r.id === id)?.game;
      const tiers = game ? difficultyTiers(game) : null;
      if (!game || !tiers) return false;
      return dealtFor(id).some((p) => tiers[tierOf(game, p)] === tier);
    };
    expect(tierDealt("loopy", "Tricky"), "no Loopy Tricky board").toBe(true);
    expect(tierDealt("group", "Hard"), "no Group Hard board").toBe(true);
    expect(tierDealt("unequal", "Easy"), "no Unequal Easy board").toBe(true);
    expect(
      dealtFor("guess").some((p) => p["allowBlank"] === true),
      "no Guess board allowing blanks",
    ).toBe(true);
    expect(
      dealtFor("abcd").some((p) => p["diag"] === true),
      "no ABCD board without diagonal touching",
    ).toBe(true);
  });
});

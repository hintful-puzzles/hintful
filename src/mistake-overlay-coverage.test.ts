/*
 * **A game that finds mistakes should have a test that asserts what its
 * overlay draws.**
 *
 * The overlay's *repaint* is not this file's: `engine/warm-repaint.test.ts`
 * requires every game that finds mistakes to paint the overlay on a warm frame
 * and compares that frame with a fresh paint. What no cross-game test can say
 * is whether the overlay looks like anything, since a frame that draws no
 * mistake at all matches its fresh twin. The mark is a shape of the game's own,
 * so the games assert it, and this counts which do.
 *
 * It makes the gap **visible and non-growing**: the population is derived, the
 * covered set is derived, and the shortfall is a ledger asserted to be exactly
 * the difference. A new game that offers `findMistakes` without an overlay test
 * fails here, and every entry deleted from the ledger is a game whose
 * Check-&-Save feedback someone has seen drawn. That is the `NO_KEYBOARD` shape
 * (`docs/testing.md` § "How a cross-game guard finds its population").
 *
 * ON THE KEYS. The population comes from the **capability set** (the optional
 * `Game` members a game carries), not from a grep for `findMistakes`, which a
 * game may spell differently. The coverage side takes every spelling of a
 * driven mistake frame, because a key narrowed to the newest one over-reports
 * the shortfall, and an over-reported shortfall fails no commit
 * (`docs/method.md` § "A scan that keys on a name";
 * `openspec/postmortems/2026-09-09-tile-loop-inversion-withdrawal.md`).
 *
 * **What this deliberately does not measure**: whether a game's live *error*
 * mark (a broken rule shown as the player plays) is drawn in a test. That is a
 * different mark for a different reason, often drawn differently so a player
 * can tell the two apart (Crossing's mistake box is nested `drawRectOutline`
 * lines inset inside the tile), and only the Check-&-Save one is counted here.
 * A game may be listed below and still have its error frame well covered.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { capabilitySets } from "./engine/testing/enrollment.ts";
import { registerAllGames } from "./games/index.ts";

beforeAll(registerAllGames);

/** Every game's **test** files, by game id — the opposite of the usual scan. */
const testSources = (() => {
  const modules = import.meta.glob<string>("./games/**/*.test.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  });
  const byGame = new Map<string, string[]>();
  for (const [path, text] of Object.entries(modules)) {
    const id = path.split("/")[2];
    if (!id) continue;
    byGame.set(id, [...(byGame.get(id) ?? []), text]);
  }
  return byGame;
})();

/**
 * Does any of this game's test files drive the mistake overlay onto a frame and
 * assert the paint?
 *
 * **Three spellings**: `renderScenario`'s `showMistakes`, and a test's own
 * `findMistakes` call followed by a redraw, through the midend or the game.
 *
 * The `showMistakes` arm is file-wide and unconditional — the flag *is* a
 * driven mistake frame, by construction, so nothing further need be proved
 * about it. The other two are calls a test can make for reasons that have
 * nothing to do with painting (Galaxies' hint suite calls `findMistakes` to
 * check a *refusal message*), so they are required to sit in the same `it`
 * block as a redraw and an assertion about what it emitted. A block key rather
 * than a file key, deliberately: two of these games call `findMistakes` in one
 * file and paint it in another.
 */
function isCovered(sources: readonly string[]): boolean {
  return sources.some((text) => {
    if (text.includes("showMistakes")) return true;
    return text.split(/\bit\(/).some(
      (block) =>
        /findMistakes\??[.(]/.test(block) &&
        // `[Rr]edraw` and not `\bredraw`: a game whose export collides with
        // something in its own test file imports it aliased, as Galaxies
        // calls `galaxiesRedraw(`.
        /[Rr]edraw\w*\(/.test(block) &&
        /\.ops\b|toMatchSnapshot/.test(block),
    );
  });
}

/**
 * Games that offer `findMistakes` but never render its overlay in a test.
 *
 * **This list may only shrink.** Each entry is a game whose mistake mark is
 * drawn by code no test has ever looked at; deleting one means adding a test
 * that paints it and asserts what it drew, in any of the spellings above.
 */
const NO_OVERLAY_TEST = [
  "ascent",
  "bridges",
  "dominosa",
  "filling",
  "group",
  "mosaic",
  "palisade",
  "pattern",
  // Range renders the overlay from a hand-written mistake list, not one the
  // game's `findMistakes` flagged, so none of the spellings above match it.
  "range",
  "undead",
  "unequal",
];

describe("a game that finds mistakes has a test that paints them", () => {
  it("reads a real population and real test sources", () => {
    // Three vacuity numbers, because there are three derivations and any of
    // them could silently match nothing and report health.
    expect(testSources.size).toBeGreaterThanOrEqual(50);
    expect(
      capabilitySets().filter((c) => c.members.includes("findMistakes")).length,
    ).toBeGreaterThanOrEqual(35);
    // The coverage key itself. A regex that stops matching after a rename would
    // otherwise push every game onto the ledger, and the ledger assertion would
    // report the shortfall as *growing* rather than the key as broken.
    const covered = capabilitySets()
      .filter((c) => c.members.includes("findMistakes"))
      .filter((c) => isCovered(testSources.get(c.id) ?? []));
    expect(covered.length).toBeGreaterThanOrEqual(25);
  });

  it("has exactly the recorded shortfall — no more", () => {
    const offers = capabilitySets()
      .filter((c) => c.members.includes("findMistakes"))
      .map((c) => c.id);
    const uncovered = offers
      .filter((id) => !isCovered(testSources.get(id) ?? []))
      .sort();
    expect(uncovered).toEqual([...NO_OVERLAY_TEST].sort());
  });

  it("keeps the ledger free of games that do not offer mistakes at all", () => {
    // The ledger's own honesty check: an entry for a game without
    // `findMistakes` would be a permanent excuse nothing could ever retire.
    const offers = new Set(
      capabilitySets()
        .filter((c) => c.members.includes("findMistakes"))
        .map((c) => c.id),
    );
    expect(NO_OVERLAY_TEST.filter((id) => !offers.has(id))).toEqual([]);
  });
});

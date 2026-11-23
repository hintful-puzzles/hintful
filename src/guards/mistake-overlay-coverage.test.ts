/*
 * **A game that finds mistakes should have a test that asserts what its
 * overlay draws.**
 *
 * The overlay's *repaint* is not this file's: `guards/warm-repaint.test.ts`
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

import ts from "typescript";
import { describe, expect, it } from "vitest";
import { BORN_GAMES } from "../engine/testing/born-games.ts";
import { capabilitySets } from "../engine/testing/enrollment.ts";
import { expectLedger } from "../engine/testing/ledger.ts";
import {
  callsTo,
  nodesOf,
  parsed,
  resolveSpecifier,
} from "../engine/testing/syntax.ts";
import "../games/index.ts";

/** Every game's **test** files, by game id — the opposite of the usual scan. */
const testSources = (() => {
  const modules = import.meta.glob<string>("../games/**/*.test.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  });
  const byGame = new Map<string, ts.SourceFile[]>();
  for (const [key, text] of Object.entries(modules)) {
    const id = key.split("/")[2];
    if (!id) continue;
    const sf = parsed(resolveSpecifier("src/guards/x.ts", key), text);
    byGame.set(id, [...(byGame.get(id) ?? []), sf]);
  }
  return byGame;
})();

/** The name a call is made through, or `null` for a computed callee. */
function calleeName(call: ts.CallExpression): string | null {
  const e = call.expression;
  if (ts.isIdentifier(e)) return e.text;
  if (ts.isPropertyAccessExpression(e)) return e.name.text;
  return null;
}

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
function isCovered(sources: readonly ts.SourceFile[]): boolean {
  return sources.some((sf) => {
    const nodes = [...nodesOf(sf)];
    if (nodes.some((n) => ts.isIdentifier(n) && n.text === "showMistakes")) return true;
    return callsTo(sf, "it").some((block) => {
      const names = [...nodesOf(block)].flatMap((n) =>
        ts.isCallExpression(n) ? [calleeName(n) ?? ""] : [],
      );
      return (
        names.includes("findMistakes") &&
        // `[Rr]edraw` and not `redraw` alone: a game whose export collides
        // with something in its own test file imports it aliased, as Galaxies
        // calls `galaxiesRedraw(`.
        names.some((name) => /[Rr]edraw/.test(name)) &&
        (names.includes("toMatchSnapshot") ||
          [...nodesOf(block)].some(
            (n) => ts.isPropertyAccessExpression(n) && n.name.text === "ops",
          ))
      );
    });
  });
}

/** The born games, whose overlay `mistake-outline.test.ts` paints and
 * asserts, from the population that guard reads. */
const BORN = new Set(BORN_GAMES.map((b) => b.id));

/** Whether a game's overlay is painted and asserted: a born game by the
 * cross-game guard, any other by a test of its own. */
const coveredGame = (id: string): boolean =>
  BORN.has(id) || isCovered(testSources.get(id) ?? []);

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
  "palisade",
  "undead",
];

describe("a game that finds mistakes has a test that paints them", () => {
  it("reads a real population and real test sources", () => {
    // Three vacuity checks, because there are three derivations and any of
    // them could silently match nothing and report health. A born game's
    // tests are its cases file, so every other game's test files are read.
    const unread = capabilitySets()
      .map((c) => c.id)
      .filter((id) => !BORN.has(id) && !testSources.has(id));
    expect(unread).toEqual([]);
    expect(
      capabilitySets().filter((c) => c.members.includes("findMistakes")).length,
    ).toBeGreaterThanOrEqual(35);
    // The coverage key itself. A regex that stops matching after a rename would
    // otherwise push every game onto the ledger, and the ledger assertion would
    // report the shortfall as *growing* rather than the key as broken.
    const covered = capabilitySets()
      .filter((c) => c.members.includes("findMistakes"))
      .filter((c) => coveredGame(c.id));
    expect(covered.length).toBeGreaterThanOrEqual(25);
  });

  it("has exactly the recorded shortfall — no more", () => {
    const offers = capabilitySets()
      .filter((c) => c.members.includes("findMistakes"))
      .map((c) => c.id);
    const uncovered = offers.filter((id) => !coveredGame(id)).sort();
    expectLedger(uncovered, Object.fromEntries(NO_OVERLAY_TEST.map((id) => [id, id])), {
      table: "NO_OVERLAY_TEST",
      file: "src/guards/mistake-overlay-coverage.test.ts",
      found: "games with `findMistakes` and no test that paints the overlay",
      add: 'paint the overlay in its own test (docs/rendering.md § "Prove the overlay repaints"); the list only shrinks',
      value: null,
    });
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

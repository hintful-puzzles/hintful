/**
 * The phrases the hint vocabulary retired (`standardize-hint-vocabulary`, owner
 * 2026-11-13), checked at the source of every hinting game and of the engine's
 * shared narration, the way `hint-em-dash.test.ts` checks the em-dash.
 *
 * - "rule out" as a verb for what a move does: a mark ends "must be {the
 *   game's off-mark}" and a struck value or note ends "must go".
 * - "is out" / "are out" as the same closing. Mastermind's framed colors keep
 *   it: the color is out of the answer, and no mark of the player's is.
 * - ", so there is something to cross out", which said why a populate step
 *   exists and nothing the board does not already show.
 *
 * The scan is a superset (any code line, not only a narration string), and the
 * population is derived (`HINT_GAMES`), so a game that joins is held at once.
 */
import { describe, expect, it } from "vitest";
import {
  engineCodeLinesMatching,
  SCANNED_ENGINE_FILES,
} from "./testing/engine-source.ts";
import { codeLinesMatching, SCANNED_SOURCE_FILES } from "./testing/enrollment.ts";
import { HINT_GAMES } from "./testing/hint-games.ts";

const RETIRED = /\brule out\b|something to cross out/i;
const IS_OUT = /\b(?:is|are) out\b/i;

/** Loopy's preference label, which names a setting and not a hint step; a
 * label is the player's to be asked about, so it is left as it is. */
const SETTING_LABEL = /^name: "Rule out edges that counting has already settled",?$/;

/** The game that keeps "is out" as its own closing. */
const KEEPS_IS_OUT = new Set(["guess"]);

describe("no hint says a retired phrase", () => {
  it("scanned a populated source tree", () => {
    expect(SCANNED_SOURCE_FILES).toBeGreaterThan(100);
    expect(SCANNED_ENGINE_FILES).toBeGreaterThan(50);
    expect(HINT_GAMES.length).toBeGreaterThan(25);
    expect(KEEPS_IS_OUT.size).toBe(1);
    expect(HINT_GAMES.some(([id]) => KEEPS_IS_OUT.has(id))).toBe(true);
  });

  it("holds every hinting game to the retired verb and the retired clause", () => {
    const hits = codeLinesMatching(
      HINT_GAMES.map(([id]) => id),
      RETIRED,
    ).filter((h) => !SETTING_LABEL.test(h.line));
    expect(hits.map((h) => `${h.id}: ${h.line}`)).toEqual([]);
  });

  it('holds every hinting game but Mastermind to "is out"', () => {
    const hits = codeLinesMatching(
      HINT_GAMES.map(([id]) => id).filter((id) => !KEEPS_IS_OUT.has(id)),
      IS_OUT,
    );
    expect(hits.map((h) => `${h.id}: ${h.line}`)).toEqual([]);
  });

  it("holds the engine's shared narration to both", () => {
    const hits = [
      ...engineCodeLinesMatching(RETIRED),
      ...engineCodeLinesMatching(IS_OUT),
    ];
    expect(hits.map((h) => `${h.id}: ${h.line}`)).toEqual([]);
  });
});

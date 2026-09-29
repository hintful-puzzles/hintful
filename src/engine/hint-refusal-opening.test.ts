/**
 * **The shared refusal opening**: a hinted game refuses "already solved" and
 * "fix the mistakes first" through `commonHintRefusal`, rather than writing the
 * pair out. Kept apart from `hint-refusal.test.ts`, which reads source only and
 * so runs in the gate's scan pass, because the exemption here is read off the
 * registered games' `findMistakes` sections.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import { sectionState } from "./sections.ts";

beforeAll(registerAllGames);

/** Every game's `index.ts`, as raw text. An unmatched glob yields `{}`
 * silently, hence the vacuity assertion below. */
const indexSources = import.meta.glob<string>("../games/*/index.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});

/**
 * Why a game still names `ALREADY_SOLVED` or `FIX_MISTAKES_FIRST` itself instead
 * of taking the pair from `commonHintRefusal` — one entry per game, and the
 * derivation below asserts this is *exactly* the set that did not adopt.
 *
 * This is the `NO_KEYBOARD` shape (`docs/games/testing.md` § "How a cross-game
 * guard finds its population"): the derivation says **who**, the ledger says
 * **why**, and neither can rot, because a game that adopts starts failing until
 * its entry is deleted and a game that regresses fails until one is added.
 *
 * A game that declares `findMistakes` not applicable owes no pair, since half
 * of it is a refusal it can never give, and is not listed: its opening is the
 * one line "already solved".
 */
const OPENS_ITS_OWN_REFUSAL: Record<string, string> = {
  bricks:
    "chooses between FIX_MISTAKES_FIRST and CONTRADICTION_UNLOCALIZED: its board can be inconsistent with no single entry provably wrong, and the promised highlight would never come.",
  clusters: "as Bricks — the second refusal is conditional, not the pair's.",
};

describe("the shared refusal opening", () => {
  /** Games whose `index.ts` names the half of the pair it passes. An adopter
   * names neither — it calls `commonHintRefusal` — so this set *is* the
   * non-adopters. */
  const namesThePair = new Map<string, string>();
  let adopters = 0;
  for (const [path, text] of Object.entries(indexSources)) {
    const m = path.match(/games\/([^/]+)\/index\.ts$/);
    if (!m) continue;
    namesThePair.set(m[1], text);
    if (text.includes("commonHintRefusal(")) adopters++;
  }
  const nothingToBeWrongAbout = (id: string): boolean => {
    const game = getTsGame(id);
    return game !== null && sectionState(game, "findMistakes").kind === "notApplicable";
  };

  it("is taken by every game that owes the plain pair", () => {
    // THE GUARD. A game that hand-writes "solved first, then wrong" is asking
    // for two rules to be got right by hand that the helper makes structural:
    // the order (a finished board is not a wrong board) and the promise that
    // `FIX_MISTAKES_FIRST` only fires where something will actually be
    // highlighted. Fifteen games wrote them out and `commonHintRefusal` had
    // **no callers at all** until `adopt-the-shared-refusal-opening`.
    const opensItsOwn = [...namesThePair]
      .filter(([, text]) => /\bALREADY_SOLVED\b|\bFIX_MISTAKES_FIRST\b/.test(text))
      .map(([id]) => id)
      .filter((id) => !nothingToBeWrongAbout(id));
    expect(opensItsOwn.sort()).toEqual(Object.keys(OPENS_ITS_OWN_REFUSAL).sort());
  });

  it("never asks a game with nothing to be wrong about to fix its mistakes", () => {
    const excused = registeredGameIds().filter(nothingToBeWrongAbout);
    // Known positive: Fifteen's tiles have no wrong arrangement.
    expect(excused).toContain("fifteen");
    const promising = excused.filter((id) =>
      /\bFIX_MISTAKES_FIRST\b|commonHintRefusal\(/.test(namesThePair.get(id) ?? ""),
    );
    expect(promising).toEqual([]);
  });

  it("counts the adopters, so the sweep cannot quietly shrink", () => {
    // The vacuity half: the assertions above would also pass if the scan
    // stopped seeing game sources entirely. Fifteen adopted; the floor sits
    // below that and is not a ratchet a legitimate change has to bump.
    expect(namesThePair.size).toBe(registeredGameIds().length);
    expect(adopters).toBeGreaterThan(10);
  });
});

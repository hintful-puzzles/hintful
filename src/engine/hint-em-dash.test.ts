/**
 * The em-dash rule, checked at the **source** rather than only at run time.
 * `hint-quality.test.ts` states the rule (owner, 2026-09-09) and checks what its
 * walks hear a hint say.
 *
 * Those runtime sweeps walk each game's first preset and one board per tier, so
 * they only ever see the arms that *fire* on those boards — and a narration arm
 * can be genuinely hard to reach. Palisade's `cluesVersusRegionSize` counting
 * arm is the worked example: it needs a region size below 6, which one of the
 * four shipped presets has, and across twelve seeds of every preset it never
 * fired once. A rule enforced only where a hint happens to land is a rule
 * enforced on the easy tiers.
 *
 * So the population is the hinting games (derived), and the net is each one's
 * comment-stripped code. That is a **superset** of narration — a preset title or
 * an error string would be caught too — and that is deliberate: the collection
 * has repeatedly been bitten by a scan narrowed to where the authors expected to
 * find the thing. There is nothing else in these directories writing an em-dash
 * today, and if something appears, classifying it is cheaper than having missed
 * it.
 *
 * A file of its own because it reads every engine module, so it runs whole on
 * any engine commit; inside `hint-quality.test.ts` it took that file's walks
 * with it (`scripts/checks/reach.ts`).
 */
import { describe, expect, it } from "vitest";
import {
  engineCodeLinesMatching,
  SCANNED_ENGINE_FILES,
} from "./testing/engine-source.ts";
import { codeLinesMatching, SCANNED_SOURCE_FILES } from "./testing/enrollment.ts";
import { HINT_GAMES } from "./testing/hint-games.ts";

/** Not the en-dash: Dominosa writes its dominoes `3–5`, where the dash is
 * notation rather than punctuation. */
const EM_DASH = /—/;

describe("no hinting game writes an em-dash", () => {
  it("scanned a populated source tree", () => {
    // Vacuity: an unmatched `import.meta.glob` yields `{}`, and the assertions
    // below then pass over nothing at all while reporting health.
    expect(SCANNED_SOURCE_FILES).toBeGreaterThan(100);
    expect(SCANNED_ENGINE_FILES).toBeGreaterThan(50);
    expect(HINT_GAMES.length).toBeGreaterThan(25);
  });

  it("uses a comma, a semicolon or a sentence break instead", () => {
    const hits = codeLinesMatching(
      HINT_GAMES.map(([id]) => id),
      EM_DASH,
    );
    expect(
      hits.map((h) => `${h.id}: ${h.line}`),
      "em-dash in a hinting game's code; rewrite the sentence rather than dropping the clause",
    ).toEqual([]);
  });

  // The engine writes narration on behalf of whole families of games, so a
  // sweep that stopped at `games/**` would report a clean collection while the
  // sentence those games actually show carried the character.
  it("holds the engine's shared narration to the same rule", () => {
    const hits = engineCodeLinesMatching(EM_DASH);
    expect(
      hits.map((h) => `${h.id}: ${h.line}`),
      "em-dash in shipped engine code; rewrite the sentence rather than dropping the clause",
    ).toEqual([]);
  });
});

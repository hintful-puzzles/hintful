/**
 * **The families are a navigation a player learns, and a population the
 * maintenance work names** — so both halves are held here: the shape of the
 * taxonomy, and, wherever the code can vouch for a family, the tag against the
 * code.
 */
import { describe, expect, it } from "vitest";
import {
  codeLinesMatching,
  membersNotMentioning,
  SCANNED_SOURCE_FILES,
} from "../engine/testing/enrollment.ts";
import { puzzleFamilies, puzzleIds, puzzlesInFamily } from "./catalog.ts";
import { familiesOffered } from "./catalog-search.ts";

describe("the family taxonomy", () => {
  it("puts every game in exactly one family, with no family of fewer than two", () => {
    // Vacuity: a family list or catalog that came back empty would make every
    // assertion below hold over nothing.
    expect(puzzleFamilies.length).toBeGreaterThan(5);
    expect(puzzleIds.length).toBeGreaterThan(50);

    const placed = puzzleFamilies.flatMap(({ id }) => puzzlesInFamily(id));
    expect([...placed].sort()).toEqual([...puzzleIds].sort());

    // A chip that shows one game is a link, not a family; one that shows none
    // is a dead control.
    const small = puzzleFamilies
      .map(({ id }) => ({ id, size: puzzlesInFamily(id).length }))
      .filter(({ size }) => size < 2);
    expect(small).toEqual([]);
  });

  it("gives every family a distinct label", () => {
    const labels = puzzleFamilies.map(({ label }) => label.toLowerCase());
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe("the chips beside a search", () => {
  const pressed = puzzleFamilies[0].id;

  it("offers every family until something is typed", () => {
    expect(familiesOffered("", null)).toEqual(puzzleFamilies);
    expect(familiesOffered("  ", pressed)).toEqual(puzzleFamilies);
  });

  it("offers only the pressed family once something is typed", () => {
    expect(familiesOffered("solo", null)).toEqual([]);
    expect(familiesOffered("solo", pressed).map(({ id }) => id)).toEqual([pressed]);
  });
});

describe("a family the code can vouch for agrees with the code", () => {
  /*
   * Latin squares, bounded from both sides by what a game's own code imports:
   *
   * - **below**: every game narrating with the shared Latin hint vocabulary
   *   (`engine/latin-hint`, or the Latin sentences `engine/hint-text.ts`
   *   shares) is a Latin square — its hints speak of rows and columns holding
   *   each symbol once;
   * - **above**: every game tagged Latin squares uses the shared Latin engine
   *   (`engine/latin`, `engine/latin-hint` or those sentences) — a Latin square
   *   that built its own solver from nothing would be a family member the
   *   shared work could not reach, and that is worth hearing about.
   *
   * The scan reads each file as it compiles, so a type-only import is not a
   * use: Solo's one runtime tie to the Latin helpers is the chain sentence,
   * which numbers the chain itself.
   *
   * The two bounds are not equal and need not be: Ascent, Singles and Tents
   * borrow a Latin helper without being Latin squares.
   */
  const latin = puzzlesInFamily("latin");
  const LATIN_SPEECH =
    /engine\/latin-hint|\b(?:narrateLatinReason|latinPremise|forcingChainPremise)\(/;
  const LATIN_RULES = /engine\/latin-hint|\b(?:latinPremise|forcingChainPremise)\(/;

  it("scans the games' sources at all", () => {
    expect(SCANNED_SOURCE_FILES).toBeGreaterThan(100);
    expect(latin.length).toBeGreaterThan(1);
  });

  it("tags every game that speaks the Latin hint vocabulary as Latin squares", () => {
    // The single-placement sentence (`narrateLatinReason`) is borrowed by games
    // that are not Latin squares, as the helpers are; the arms that state a
    // Latin rule are the strikes' and the chain's.
    const speakers = [
      ...new Set(codeLinesMatching([...puzzleIds], LATIN_RULES).map((m) => m.id)),
    ];
    // A known positive, so a scan that stopped seeing imports cannot pass.
    expect(speakers).toContain("solo");
    expect(speakers.filter((id) => !latin.includes(id))).toEqual([]);
  });

  it("finds the shared Latin engine in every game tagged Latin squares", () => {
    const silent = membersNotMentioning([...latin], "engine/latin");
    const speakers = new Set(codeLinesMatching(silent, LATIN_SPEECH).map((m) => m.id));
    expect(silent.filter((id) => !speakers.has(id))).toEqual([]);
  });
});

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

describe("a family the code can vouch for agrees with the code", () => {
  /*
   * Latin squares, bounded from both sides by what a game's own code imports:
   *
   * - **below**: every game narrating with the shared Latin hint vocabulary
   *   (`engine/latin-hint`) is a Latin square — its hints speak of rows and
   *   columns holding each symbol once;
   * - **above**: every game tagged Latin squares uses the shared Latin engine
   *   (`engine/latin` or `engine/latin-hint`) — a Latin square that built its
   *   own solver from nothing would be a family member the shared work could
   *   not reach, and that is worth hearing about.
   *
   * The two bounds are not equal and need not be: Ascent, Singles and Tents
   * borrow a Latin helper without being Latin squares.
   */
  const latin = puzzlesInFamily("latin");

  it("scans the games' sources at all", () => {
    expect(SCANNED_SOURCE_FILES).toBeGreaterThan(100);
    expect(latin.length).toBeGreaterThan(1);
  });

  it("tags every game that speaks the Latin hint vocabulary as Latin squares", () => {
    const speakers = [
      ...new Set(
        codeLinesMatching([...puzzleIds], /engine\/latin-hint/).map((m) => m.id),
      ),
    ];
    // A known positive, so a scan that stopped seeing imports cannot pass.
    expect(speakers).toContain("solo");
    expect(speakers.filter((id) => !latin.includes(id))).toEqual([]);
  });

  it("finds the shared Latin engine in every game tagged Latin squares", () => {
    expect(membersNotMentioning([...latin], "engine/latin")).toEqual([]);
  });
});

/*
 * A game born from its description is tested by its data: its
 * `<game>.cases.yaml`, which the engine reads (`testing/game-cases.ts`) and
 * this runs, case by case, for every born game (`testing/born-games.ts`).
 *
 * `npm run hint-scan -- <a cases file>` runs this file with `GAME_CASES` set
 * to that game, so only its cases are declared and its scan alone runs.
 */
import { describe, expect, it } from "vitest";
import { BORN_GAMES, CASES_FILES } from "../engine/testing/born-games.ts";
import { describeGameCases, parseGameCases } from "../engine/testing/game-cases.ts";
import { expectLedger } from "../engine/testing/ledger.ts";

const only = (globalThis as { process?: { env?: Record<string, string | undefined> } })
  .process?.env?.["GAME_CASES"];

/**
 * Born games whose tests are still a test file of their own, until each
 * moves to its cases file (`a-game-is-tested-by-its-data`). **This list only
 * shrinks**: a game born from now on ships a cases file.
 */
const NOT_YET_DATA: Readonly<Record<string, string>> = {
  bricks: "bricks.test.ts",
  singles: "singles.test.ts",
  sticks: "sticks.test.ts",
};

describe("a born game's cases", () => {
  it.skipIf(only !== undefined)("reads a real population", () => {
    expect(BORN_GAMES.length).toBeGreaterThanOrEqual(14);
  });

  it.skipIf(only !== undefined)(
    "has a cases file for every born game not yet moved",
    () => {
      expectLedger(
        BORN_GAMES.filter((b) => b.cases === null).map((b) => b.id),
        NOT_YET_DATA,
        {
          table: "NOT_YET_DATA",
          file: "src/guards/born-game-cases.test.ts",
          found: "born games with no cases file",
          add: 'write `<game>.cases.yaml` beside the description (docs/testing.md § "What a new game ships"); the list only shrinks',
          value: null,
        },
      );
    },
  );

  it.skipIf(only !== undefined)("holds no cases file a born game does not own", () => {
    const owned = new Set(BORN_GAMES.flatMap((b) => (b.cases ? [b.cases.path] : [])));
    expect(CASES_FILES.filter((p) => !owned.has(p))).toEqual([]);
  });
});

for (const born of BORN_GAMES) {
  if (born.cases === null) continue;
  if (only !== undefined && only !== born.id) continue;
  describeGameCases(
    born.game,
    parseGameCases(born.cases.text, born.cases.path),
    born.compiled,
  );
}

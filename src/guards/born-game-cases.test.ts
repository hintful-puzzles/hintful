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

const only = (globalThis as { process?: { env?: Record<string, string | undefined> } })
  .process?.env?.["GAME_CASES"];

/** Every test file under a game's directory, from the root: listed, never
 * loaded. */
const GAME_TEST_FILES = Object.keys(import.meta.glob("../games/*/*.test.ts")).map(
  (key) => key.replace(/^\.\.\//, "src/"),
);

describe("a born game's cases", () => {
  it.skipIf(only !== undefined)("reads a real population", () => {
    expect(BORN_GAMES.length).toBeGreaterThanOrEqual(14);
    expect(GAME_TEST_FILES.length).toBeGreaterThan(0);
  });

  // Write `<game>.cases.yaml` beside the description (docs/testing.md
  // § "What a new game ships"); a case it cannot state is an engine check
  // missing, written in the engine for any game to name.
  it.skipIf(only !== undefined)("has a cases file for every born game", () => {
    expect(BORN_GAMES.filter((b) => b.cases === null).map((b) => b.id)).toEqual([]);
  });

  it.skipIf(only !== undefined)("holds a born game to no test file of its own", () => {
    const dirs = BORN_GAMES.map((b) => b.source.replace(/[^/]+$/, ""));
    expect(GAME_TEST_FILES.filter((p) => dirs.some((d) => p.startsWith(d)))).toEqual(
      [],
    );
  });

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

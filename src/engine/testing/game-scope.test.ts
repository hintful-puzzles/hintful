/**
 * **The guard under `game-scope.ts`**: the hook skips the cross-game cases of
 * every game outside a commit's scope. Which games are in it is the walk's
 * question, and `scripts/checks/select-tests.ts --verify` holds that to known
 * positives; this holds the filter and the variable.
 *
 * The names below are joined the way vitest joins them before matching `-t`:
 * each describe title, then the test's own, separated by single spaces with no
 * file prefix (checked against `vitest list -t` on 2026-09-27, vitest 4.1). A
 * vitest that joined them differently would make the filter skip nothing, which
 * costs time and never a case.
 */
import { describe, expect, it } from "vitest";
import { otherGamesFilter, scopeFromEnv } from "./game-scope.ts";

const ALL = ["loopy", "net", "netslide", "pearl", "solo"];

function runs(scope: string[], name: string): boolean {
  const pattern = otherGamesFilter(scope, ALL);
  return pattern === null || new RegExp(pattern).test(name);
}

describe("the scope a run was given", () => {
  it("is honored only in the per-commit hook", () => {
    expect(
      scopeFromEnv({ GATE_PRECOMMIT: "1", GATE_GAME_SCOPE: "loopy,pearl" }),
    ).toEqual(["loopy", "pearl"]);
    expect(scopeFromEnv({ GATE_GAME_SCOPE: "pearl" })).toBeNull();
    expect(scopeFromEnv({ CI: "true", GATE_GAME_SCOPE: "pearl" })).toBeNull();
  });

  it("is nothing when the hook found no scope", () => {
    expect(scopeFromEnv({ GATE_PRECOMMIT: "1", GATE_GAME_SCOPE: "" })).toBeNull();
    expect(scopeFromEnv({ GATE_PRECOMMIT: "1" })).toBeNull();
  });
});

describe("the name filter a game scope makes", () => {
  it("skips another game's case and keeps the touched game's", () => {
    expect(runs(["pearl"], "a hint marks beside the content loopy: ringed")).toBe(
      false,
    );
    expect(runs(["pearl"], "a hint marks beside the content pearl: ringed")).toBe(true);
    expect(runs(["pearl"], "loopy: a case titled at the top level")).toBe(false);
  });

  it("keeps every test that is not titled for a game", () => {
    expect(runs(["pearl"], "the tiered-game set is derived from the registry")).toBe(
      true,
    );
    expect(runs(["pearl"], "loopy difficulty contract names its tiers")).toBe(true);
  });

  it("tells an id from a longer id it begins", () => {
    expect(runs(["netslide"], "a sweep net: case")).toBe(false);
    expect(runs(["netslide"], "a sweep netslide: case")).toBe(true);
    expect(runs(["net"], "a sweep netslide: case")).toBe(false);
  });

  it("skips nothing when every game is in scope", () => {
    expect(otherGamesFilter(ALL, ALL)).toBeNull();
  });

  it("refuses an id that would change the pattern's meaning", () => {
    expect(() => otherGamesFilter([], ["pearl", "a|b"])).toThrow();
  });
});

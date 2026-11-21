/**
 * A skeleton is a game that never registers, so the registry's rules reach it
 * only in the copy `scripts/new-game.sh` stamps, whose first test run then
 * fails. This holds each skeleton to them where it stands.
 */

import { describe, expect, it } from "vitest";
import type { Game } from "../engine/contract/game.ts";
import { assertRegistrable } from "../engine/midend/registry.ts";

type AnyGame = Game<unknown, unknown, unknown, unknown, unknown>;

const skeletons = Object.entries(
  import.meta.glob<Record<string, unknown>>("./*/index.ts", { eager: true }),
).map(([path, module]) => ({ path, game: module["skeletonGame"] as AnyGame }));

describe("every skeleton", () => {
  it("is found", () => {
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });

  for (const { path, game } of skeletons)
    it(`${path} keeps the rules a registered game keeps`, () => {
      expect(() => assertRegistrable(game)).not.toThrow();
    });
});

// The scaffold writes imports into the copy as text, which no compiler reads
// until a game is stamped, so a module the engine moves leaves them dangling.
describe("the scaffold's written imports", () => {
  const scripts = import.meta.glob<string>(
    ["../../scripts/new-game.sh", "../../scripts/new-game-register.mjs"],
    { query: "?raw", import: "default", eager: true },
  );
  // Its keys alone are read; `?raw` and lazy, so no module is imported.
  const engine = new Set(
    Object.keys(import.meta.glob("../engine/**/*.ts", { query: "?raw" })),
  );
  // Written for `src/games/<id>/`, so `../../engine/` there is `../engine/` here.
  const specifiers = Object.entries(scripts).flatMap(([script, text]) =>
    [...text.matchAll(/\.\.\/\.\.\/(engine\/[\w/.-]+\.ts)/g)].map((m) => ({
      script,
      written: m[0],
      here: `../${m[1]}`,
    })),
  );

  it("are found in both scripts", () => {
    expect(new Set(specifiers.map((s) => s.script)).size).toBe(2);
  });

  for (const { script, written, here } of specifiers)
    it(`${script}'s ${written} names a module`, () => {
      expect(engine.has(here)).toBe(true);
    });
});

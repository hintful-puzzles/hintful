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

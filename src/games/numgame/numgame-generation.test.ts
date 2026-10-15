/**
 * What stands in for an oracle at generation: every board dealt needs exactly
 * the tier it was asked at, for every count of large numbers
 * (docs/testing.md § "What a new game ships"). The solver itself is held to
 * an independent search in `numgame.test.ts`.
 */
import { describeDealtTiers } from "../../engine/testing/absent-tiers.ts";
import { numgameGame } from "./index.ts";
import { encodeParams, LARGE } from "./state.ts";

const TIERS = 4;

describeDealtTiers(
  numgameGame,
  Array.from({ length: LARGE.length + 1 }, (_, large) =>
    Array.from({ length: TIERS }, (_, diff) => encodeParams({ large, diff }, true)),
  ).flat(),
);

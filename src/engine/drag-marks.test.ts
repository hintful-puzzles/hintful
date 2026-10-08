/**
 * The marks that drag in games whose input is not target-verb, each declared
 * with `dragMarkVerbs` and held to what the declaration says by the same check
 * as every `targetVerbs.sweep` (`testing/sweep-probe.ts`): a drag between two
 * like targets marks both, and one Undo takes it back.
 *
 * Named here and not derived, because these verbs are a game's own and no
 * `Game` member carries them. A fifth such mark joins by a line below; one
 * that never joins has no check, which is why a game that can declare
 * `targetVerbs.sweep` does that and is found by `target-verb-sweep.test.ts`.
 */

import { beforeAll, describe, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { noteVerbs } from "../games/net/index.ts";
import { crossDrag } from "../games/pearl/index.ts";
import { markDrag } from "../games/slant/index.ts";
import { clueDrag as towersClueDrag } from "../games/towers/index.ts";
import { clueDrag as undeadClueDrag } from "../games/undead/index.ts";
import { spentDrag } from "../games/unequal/index.ts";
import { PENCIL_MODE_BUTTON } from "./pointer.ts";
import { getTsGame } from "./registry.ts";
import type { AnyGame } from "./testing/input-probe.ts";
import { expectDragRepeatsThePress } from "./testing/sweep-probe.ts";

beforeAll(registerAllGames);

const game = (id: string) => getTsGame(id) as unknown as AnyGame;

describe("a mark declared with dragMarkVerbs is what its drag does", () => {
  it("Pearl: the right button's cross on an edge", () => {
    expectDragRepeatsThePress(game("pearl"), "pearl", crossDrag);
  });
  it("Towers: a clue marked done", () => {
    expectDragRepeatsThePress(game("towers"), "towers", towersClueDrag);
  });
  it("Undead: a clue marked done", () => {
    expectDragRepeatsThePress(game("undead"), "undead", undeadClueDrag);
  });
  it("Unequal: a clue marked spent", () => {
    expectDragRepeatsThePress(game("unequal"), "unequal", spentDrag);
  });
  it("Slant, in notes mode: the mark between two squares", () => {
    expectDragRepeatsThePress(game("slant"), "slant", markDrag, [PENCIL_MODE_BUTTON]);
  });
  it("Net, in notes mode: a side's note with either button, and a lock", () => {
    expectDragRepeatsThePress(game("net"), "net", noteVerbs, [PENCIL_MODE_BUTTON]);
  });
});

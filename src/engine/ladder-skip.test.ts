/**
 * A compiled technique's solve run visits only the elements a fact reached
 * since a binding there found nothing (`CellMarks.visit`). That is sound only
 * if its footprint names every mark a binding reads, so every game whose
 * compiled module skips deals the same boards with skipping and without: a
 * board's description holds every verdict its generator's ladder gave, so a
 * binding skipped that would have fired changes a board.
 */
import { describe, expect, it } from "vitest";
import "../games/index.ts";
import { CellMarks } from "./ladder-runtime.ts";
import { getTsGame } from "./registry.ts";
import { dealt, dealtAgain } from "./testing/dealt.ts";
import { type AnyGame, gatePresets } from "./testing/hint-games.ts";
import { FIRST_SHARE, ofThisShare } from "./testing/sweep-share.ts";

const modules = import.meta.glob<string>("../games/*/*.compiled.ts", {
  eager: true,
  query: "?raw",
  import: "default",
});

/** The games whose compiled module emits a footprint, by what it compiled. */
const SKIPPING = Object.entries(modules)
  .filter(([, text]) => /: Footprint = /.test(text))
  .map(([path]) => path.split("/")[2])
  .sort();

/**
 * The board the sweeps share, dealt again without skipping. One deal is
 * thousands of runs of every technique, and a footprint planted with one
 * read, or blind to the relation, changed a board on the first preset it
 * reached. The shared board is the skipping deal, skipping being on.
 */
function unskipped(game: AnyGame, params: unknown): string {
  const before = CellMarks.skipping;
  CellMarks.skipping = false;
  try {
    return dealtAgain(game, params).desc;
  } finally {
    CellMarks.skipping = before;
  }
}

/** Each board of each skipping game, shared out by board: one game, Loopy,
 * holds most of the cost (`docs/testing.md` § "A sweep too long for one
 * worker"). */
const CASES = ofThisShare(
  SKIPPING.flatMap((id) => {
    const game = getTsGame(id) as AnyGame;
    return gatePresets(game).map(({ title, params }) => ({ id, game, title, params }));
  }),
);

// A suite with no case fails, and a share may hold no board.
describe.runIf(FIRST_SHARE || CASES.length > 0)(
  "a solve that skips deals the boards one that does not deals",
  () => {
    if (FIRST_SHARE)
      it("has games to compare, each with a board", () => {
        expect(SKIPPING.length).toBeGreaterThan(0);
        for (const id of SKIPPING)
          expect(gatePresets(getTsGame(id) as AnyGame).length, id).toBeGreaterThan(0);
      });

    for (const { id, game, title, params } of CASES)
      it(`${id}: ${title}`, () => {
        expect(CellMarks.skipping).toBe(true);
        expect(unskipped(game, params)).toBe(dealt(game, params).desc);
      });
  },
);

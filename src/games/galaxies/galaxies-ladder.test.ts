/*
 * The firing census of Galaxies' compiled ladder: which rungs the generated
 * corpus reaches. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 *
 * **The census solves at `Normal`, so it stops at the ladder.** The search
 * beneath it, at `Unreasonable`, takes no tally.
 */
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { galaxiesGame } from "./index.ts";
import {
  clearForSolve,
  GALAXIES_RUNGS,
  GalaxiesDiff,
  type GalaxiesRung,
  solverState,
} from "./solver.ts";
import { cloneState, type GalaxiesState } from "./state.ts";

interface Shape {
  w: number;
  h: number;
  diff: GalaxiesDiff;
}

const SHAPES: Shape[] = [
  { w: 5, h: 5, diff: GalaxiesDiff.Normal },
  { w: 7, h: 7, diff: GalaxiesDiff.Normal },
  { w: 7, h: 7, diff: GalaxiesDiff.Unreasonable },
  { w: 9, h: 9, diff: GalaxiesDiff.Normal },
  // A square walled in with one galaxy is rare in the ladder's order: the
  // seeds of the shapes above meet none (2026-11-07).
  { w: 10, h: 10, diff: GalaxiesDiff.Normal },
];

const SEEDS = ["lad-a", "lad-b", "lad-c"];

const cases = SHAPES.flatMap((p) =>
  SEEDS.map((seed) => {
    const label = `${p.w}x${p.h} diff=${p.diff} ${seed}`;
    const { desc } = galaxiesGame.newDesc(p, randomNew(`galaxies-ladder-${label}`));
    const base = galaxiesGame.newState(p, desc);
    return {
      label,
      board: (): GalaxiesState => {
        // Clear the player-side associations so the ladder starts from the dots
        // alone, exactly as the generator and `solve` do.
        const s = cloneState(base);
        clearForSolve(s);
        return s;
      },
    };
  }),
);

const UNREACHED: Partial<Record<GalaxiesRung, string>> = {
  split:
    "A line between two squares of one galaxy is a contradiction, which a board " +
    "with an answer never shows to the ladder: it ends a search's dead branch.",
};

describeLadderCensus<GalaxiesState>({
  game: "galaxies",
  rungs: [...GALAXIES_RUNGS],
  unreached: UNREACHED,
  // Every rung is `GalaxiesDiff.Normal`, so there is a single cap to walk. The
  // enum's other values are verdicts, not harder tiers.
  caps: [GalaxiesDiff.Normal],
  cases,
  solve: (s, cap, firings) => solverState(s, cap, firings),
});

/*
 * The firing census of Galaxies' `runDeductionFixpoint` ladder: which rungs the
 * generated corpus reaches. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 *
 * **Galaxies was the adoption allowed to fail.** It is the only adopter that
 * threads a `SolverRecorder` through its rungs — the recorder its explained
 * hint narrates from — and the task said in terms that if the shared runner
 * could not carry that, Galaxies stays out. It carried it without touching it:
 * `runDeductionFixpoint` is oblivious to a rung's side effects, so each rung
 * still takes `rec` and still records the same firings. `galaxies-hint.test.ts`
 * asserts the narration strings.
 *
 * **The census solves at `Normal`, so it stops at the ladder.** `maxDiff` gates
 * only `solverRecurse` above it, which takes no tally.
 */
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { galaxiesGame } from "./index.ts";
import { clearForSolve, GalaxiesDiff, solverState } from "./solver.ts";
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

describeLadderCensus<GalaxiesState>({
  game: "galaxies",
  rungs: ["lines-opposite", "spaces-oneposs", "expand-dots", "extend-exclaves"],
  unreached: {},
  // Every rung is `GalaxiesDiff.Normal`, so there is a single cap to walk. The
  // enum's other values are verdict sentinels, not harder tiers.
  caps: [GalaxiesDiff.Normal],
  cases,
  solve: (s, cap, firings) => solverState(s, cap, firings),
});

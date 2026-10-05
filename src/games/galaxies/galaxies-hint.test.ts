/**
 * Galaxies' explained hint: the deductions it narrates, the words it uses for
 * each, and the ways a player can follow one.
 *
 * The cross-game guards (`hint-resume`, `hint-overlay`, `hint-quality`) cover
 * convergence, purity, overlay-reaches-the-cache and narration *form* for
 * every hinting game at once; Galaxies is enrolled in
 * `engine/testing/hint-games.ts`. What is here is what only Galaxies can say:
 * that each rung fires with the evidence its sentence claims, that every
 * association it offers is the one the unique solution holds (the property
 * that replaces the byte-match oracle on this new code path), and that
 * following a hint by any of the three gestures counts as following it.
 */
import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/index.ts";
import { randomNew } from "../../engine/random/index.ts";
import { bindingDefects } from "../../engine/testing/hint-binding.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import {
  type GalaxiesHint,
  type GalaxiesRung,
  galaxiesHintPlan,
  narrate,
} from "./hint.ts";
import { type GalaxiesMove, galaxiesGame } from "./index.ts";
import { clearForSolve, GalaxiesDiff, solverState } from "./solver.ts";
import {
  cloneState,
  F_EDGE_SET,
  F_TILE_ASSOC,
  type GalaxiesState,
  idx,
  rebuildDots,
} from "./state.ts";

type Step = HintStep<GalaxiesMove, GalaxiesHint, GalaxiesRung>;

const NORMAL_7 = { w: 7, h: 7, diff: GalaxiesDiff.Normal };
const UNREASONABLE_7 = { w: 7, h: 7, diff: GalaxiesDiff.Unreasonable };

function board(params: typeof NORMAL_7, seed: string): GalaxiesState {
  const { desc } = galaxiesGame.newDesc(params, randomNew(seed));
  return galaxiesGame.newState(params, desc);
}

function hintOf(s: GalaxiesState): Step[] {
  const res = galaxiesGame.hint?.(s);
  if (!res?.ok) throw new Error(`hint refused: ${res && !res.ok ? res.error : "?"}`);
  return res.steps;
}

const targets = (step: Step): number => step.highlights?.targets.length ?? 0;

/** Whether a step mirrors a wall of this case: the wall it matches is the
 * board's rim or a drawn one, across a pair of cells or one that is its own
 * partner. */
function mirrors(step: Step, want: { edge: boolean; cells: number }): boolean {
  const said = step.highlights?.said;
  if (said?.kind !== "mirrorWall" || said.edge !== want.edge) return false;
  // A cell that is its own partner is listed as both.
  const cells = new Set(step.highlights?.area.map((c) => `${c.x},${c.y}`));
  return cells.size === want.cells;
}

/**
 * Every rung pinned on a position that speaks it, the cases of a rung that
 * read differently, and the shapes of step the follow tests need.
 *
 * The wording at each pin is held by the harness's snapshot: the narration is
 * the product, so a silent edit should be a red diff. Both tiers and two sizes
 * are scanned, because where a rung sits in the ladder decides which boards
 * reach it: mirroring a wall is last, so it fires only once the direct rungs
 * are spent. Two ways out of an enclosed cell, three or four are one wording;
 * one way out is a second that no scan reaches, checked on the constructed
 * firing below.
 */
const pinned = describeHintPins({
  game: galaxiesGame,
  params: [
    NORMAL_7,
    { w: 15, h: 15, diff: GalaxiesDiff.Normal },
    UNREASONABLE_7,
    { w: 15, h: 15, diff: GalaxiesDiff.Unreasonable },
  ],
  kinds: {
    // A dot sitting *inside* a cell needs no arrow: the game refuses to draw
    // one there, so that firing is never shown. A dot on an edge owns two
    // cells, which is the rung's own pin, and a dot on a corner four.
    dotAtCorner: (step) => step.rung === "dotTile" && targets(step) === 4,
    // The rung's own pin mirrors a drawn wall across a pair of cells.
    wallMirroredOffEdge: (step) => mirrors(step, { edge: true, cells: 2 }),
    wallMirroredAboutOwnCell: (step) => mirrors(step, { edge: false, cells: 1 }),
    association: (step) => targets(step) > 0 && step.highlights?.targetDot != null,
    severalCells: (step) => targets(step) > 1 && step.highlights?.targetDot != null,
  },
  pins: {
    /** Held on 246 of 7067 positions walked. */
    dotAtCorner: "7x7dn:ajhrekfsrijvkk",
    /** Held on 191 of 7067 positions walked. */
    wallMirroredOffEdge: {
      id: "7x7du:mkibeyrzadbdkzb",
      moves:
        '[{"ops":[{"kind":"assoc","x":11,"y":2,"ax":11,"ay":2}],"solving":false},{"ops":[{"kind":"assoc","x":1,"y":4,"ax":1,"ay":4}],"solving":false},{"ops":[{"kind":"assoc","x":2,"y":10,"ax":2,"ay":10}],"solving":false},{"ops":[{"kind":"assoc","x":13,"y":10,"ax":13,"ay":10}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":1}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":3}],"solving":false},{"ops":[{"kind":"edge","x":10,"y":3}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":8}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":10,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":1,"y":12}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":3,"ax":5,"ay":7}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":3}],"solving":false},{"ops":[{"kind":"assoc","x":5,"y":3,"ax":5,"ay":7}],"solving":false},{"ops":[{"kind":"edge","x":6,"y":3}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":10}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":11}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":5,"ax":5,"ay":7}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":5}],"solving":false},{"ops":[{"kind":"edge","x":6,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":9}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":7,"ax":5,"ay":7}],"solving":false},{"ops":[{"kind":"edge","x":3,"y":8}],"solving":false},{"ops":[{"kind":"assoc","x":5,"y":13,"ax":5,"ay":7}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":1,"ax":5,"ay":7}],"solving":false},{"ops":[{"kind":"assoc","x":11,"y":7,"ax":11,"ay":9}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":11}],"solving":false}]',
    },
    /** Held on 74 of 7067 positions walked. */
    wallMirroredAboutOwnCell: {
      id: "7x7du:devsbnpzdugpd",
      moves:
        '[{"ops":[{"kind":"assoc","x":4,"y":1,"ax":4,"ay":1}],"solving":false},{"ops":[{"kind":"assoc","x":11,"y":4,"ax":11,"ay":4}],"solving":false},{"ops":[{"kind":"assoc","x":13,"y":4,"ax":13,"ay":4}],"solving":false},{"ops":[{"kind":"assoc","x":1,"y":6,"ax":1,"ay":6}],"solving":false},{"ops":[{"kind":"assoc","x":4,"y":7,"ax":4,"ay":7}],"solving":false},{"ops":[{"kind":"assoc","x":2,"y":11,"ax":2,"ay":11}],"solving":false},{"ops":[{"kind":"assoc","x":12,"y":12,"ax":12,"ay":12}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":2}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":3}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":5}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":7}],"solving":false},{"ops":[{"kind":"edge","x":10,"y":11}],"solving":false},{"ops":[{"kind":"edge","x":3,"y":12}],"solving":false},{"ops":[{"kind":"assoc","x":7,"y":3,"ax":5,"ay":3}],"solving":false},{"ops":[{"kind":"edge","x":3,"y":2}],"solving":false},{"ops":[{"kind":"assoc","x":9,"y":3,"ax":5,"ay":3}],"solving":false},{"ops":[{"kind":"edge","x":9,"y":2}],"solving":false},{"ops":[{"kind":"edge","x":10,"y":3}],"solving":false},{"ops":[{"kind":"edge","x":1,"y":4}],"solving":false},{"ops":[{"kind":"assoc","x":7,"y":7,"ax":7,"ay":9}],"solving":false},{"ops":[{"kind":"edge","x":6,"y":7}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":11}],"solving":false},{"ops":[{"kind":"assoc","x":11,"y":7,"ax":11,"ay":4}],"solving":false},{"ops":[{"kind":"edge","x":10,"y":1}],"solving":false},{"ops":[{"kind":"assoc","x":13,"y":7,"ax":13,"ay":4}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":1}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":7}],"solving":false},{"ops":[{"kind":"assoc","x":9,"y":7,"ax":7,"ay":9}],"solving":false},{"ops":[{"kind":"edge","x":10,"y":7}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":11}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":8}],"solving":false},{"ops":[{"kind":"edge","x":13,"y":8}],"solving":false}]',
    },
    /** Held on 2192 of 7067 positions walked. */
    association: "7x7dn:cgqkdqdzcjdptkdb",
    /** Held on 2192 of 7067 positions walked. */
    severalCells: "7x7dn:cgqkdqdzcjdptkdb",
    /** Held on 858 of 7067 positions walked. */
    dotTile: "7x7dn:cgqkdqdzcjdptkdb",
    /** Held on 6249 of 7067 positions walked. */
    separate: {
      id: "7x7dn:ajhrekfsrijvkk",
      moves:
        '[{"ops":[{"kind":"assoc","x":6,"y":2,"ax":6,"ay":2}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":4,"ax":3,"ay":4}],"solving":false},{"ops":[{"kind":"assoc","x":13,"y":6,"ax":13,"ay":6}],"solving":false},{"ops":[{"kind":"assoc","x":5,"y":8,"ax":5,"ay":8}],"solving":false},{"ops":[{"kind":"assoc","x":5,"y":12,"ax":5,"ay":12}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":2}],"solving":false}]',
    },
    /** Held on 393 of 7067 positions walked. */
    enclosed: {
      id: "7x7dn:ajhrekfsrijvkk",
      moves:
        '[{"ops":[{"kind":"assoc","x":6,"y":2,"ax":6,"ay":2}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":4,"ax":3,"ay":4}],"solving":false},{"ops":[{"kind":"assoc","x":13,"y":6,"ax":13,"ay":6}],"solving":false},{"ops":[{"kind":"assoc","x":5,"y":8,"ax":5,"ay":8}],"solving":false},{"ops":[{"kind":"assoc","x":5,"y":12,"ax":5,"ay":12}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":2}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":3}],"solving":false},{"ops":[{"kind":"edge","x":7,"y":4}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":5}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":10}],"solving":false},{"ops":[{"kind":"edge","x":6,"y":11}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":13}],"solving":false},{"ops":[{"kind":"assoc","x":9,"y":1,"ax":11,"ay":1}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":1}],"solving":false},{"ops":[{"kind":"assoc","x":11,"y":5,"ax":11,"ay":9}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":4}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":5}],"solving":false},{"ops":[{"kind":"assoc","x":7,"y":7,"ax":5,"ay":8}],"solving":false},{"ops":[{"kind":"edge","x":7,"y":6}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":9}],"solving":false},{"ops":[{"kind":"assoc","x":9,"y":7,"ax":11,"ay":9}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":7}],"solving":false}]',
    },
    /** Held on 3076 of 7067 positions walked. */
    soleOwner: {
      id: "7x7du:pgddzgtguvfth",
      moves:
        '[{"ops":[{"kind":"assoc","x":3,"y":2,"ax":3,"ay":2}],"solving":false},{"ops":[{"kind":"assoc","x":10,"y":2,"ax":10,"ay":2}],"solving":false},{"ops":[{"kind":"assoc","x":12,"y":7,"ax":12,"ay":7}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":3}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":3}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":4}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":6}],"solving":false},{"ops":[{"kind":"edge","x":3,"y":12}],"solving":false}]',
    },
    /** Held on 3726 of 7067 positions walked. */
    onlyReach: {
      id: "7x7du:pgddzgtguvfth",
      moves:
        '[{"ops":[{"kind":"assoc","x":3,"y":2,"ax":3,"ay":2}],"solving":false},{"ops":[{"kind":"assoc","x":10,"y":2,"ax":10,"ay":2}],"solving":false},{"ops":[{"kind":"assoc","x":12,"y":7,"ax":12,"ay":7}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":3}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":3}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":4}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":6}],"solving":false},{"ops":[{"kind":"edge","x":3,"y":12}],"solving":false},{"ops":[{"kind":"assoc","x":1,"y":1,"ax":1,"ay":3}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":1}],"solving":false},{"ops":[{"kind":"assoc","x":5,"y":1,"ax":5,"ay":3}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":1}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":6}],"solving":false},{"ops":[{"kind":"assoc","x":7,"y":3,"ax":10,"ay":2}],"solving":false},{"ops":[{"kind":"edge","x":6,"y":3}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":5,"ax":5,"ay":3}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":1}],"solving":false},{"ops":[{"kind":"edge","x":7,"y":2}],"solving":false},{"ops":[{"kind":"edge","x":3,"y":4}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":5}],"solving":false},{"ops":[{"kind":"assoc","x":1,"y":11,"ax":3,"ay":11}],"solving":false}]',
    },
    /** Held on 245 of 7067 positions walked. */
    exclave: {
      id: "15x15dn:elgebzzsjklbssbzztjwhizalgnzhrdzyfecgzglijgzjzkefcjvzzkpuozkqd",
      moves:
        '[{"ops":[{"kind":"assoc","x":24,"y":1,"ax":24,"ay":1}],"solving":false},{"ops":[{"kind":"assoc","x":2,"y":2,"ax":2,"ay":2}],"solving":false},{"ops":[{"kind":"assoc","x":13,"y":4,"ax":13,"ay":4}],"solving":false},{"ops":[{"kind":"assoc","x":23,"y":4,"ax":23,"ay":4}],"solving":false},{"ops":[{"kind":"assoc","x":9,"y":6,"ax":9,"ay":6}],"solving":false},{"ops":[{"kind":"assoc","x":28,"y":6,"ax":28,"ay":6}],"solving":false},{"ops":[{"kind":"assoc","x":17,"y":10,"ax":17,"ay":10}],"solving":false},{"ops":[{"kind":"assoc","x":25,"y":10,"ax":25,"ay":10}],"solving":false},{"ops":[{"kind":"assoc","x":2,"y":12,"ax":2,"ay":12}],"solving":false},{"ops":[{"kind":"assoc","x":14,"y":12,"ax":14,"ay":12}],"solving":false},{"ops":[{"kind":"assoc","x":21,"y":12,"ax":21,"ay":12}],"solving":false},{"ops":[{"kind":"assoc","x":6,"y":13,"ax":6,"ay":13}],"solving":false},{"ops":[{"kind":"assoc","x":10,"y":14,"ax":10,"ay":14}],"solving":false},{"ops":[{"kind":"assoc","x":28,"y":14,"ax":28,"ay":14}],"solving":false},{"ops":[{"kind":"assoc","x":24,"y":16,"ax":24,"ay":16}],"solving":false},{"ops":[{"kind":"assoc","x":6,"y":17,"ax":6,"ay":17}],"solving":false},{"ops":[{"kind":"assoc","x":16,"y":17,"ax":16,"ay":17}],"solving":false},{"ops":[{"kind":"assoc","x":19,"y":18,"ax":19,"ay":18}],"solving":false},{"ops":[{"kind":"assoc","x":2,"y":19,"ax":2,"ay":19}],"solving":false},{"ops":[{"kind":"assoc","x":28,"y":19,"ax":28,"ay":19}],"solving":false},{"ops":[{"kind":"assoc","x":12,"y":22,"ax":12,"ay":22}],"solving":false},{"ops":[{"kind":"assoc","x":17,"y":22,"ax":17,"ay":22}],"solving":false},{"ops":[{"kind":"assoc","x":23,"y":22,"ax":23,"ay":22}],"solving":false},{"ops":[{"kind":"assoc","x":26,"y":22,"ax":26,"ay":22}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":26,"ax":3,"ay":26}],"solving":false},{"ops":[{"kind":"assoc","x":19,"y":26,"ax":19,"ay":26}],"solving":false},{"ops":[{"kind":"assoc","x":26,"y":27,"ax":26,"ay":27}],"solving":false},{"ops":[{"kind":"assoc","x":4,"y":29,"ax":4,"ay":29}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":1}],"solving":false},{"ops":[{"kind":"edge","x":23,"y":2}],"solving":false},{"ops":[{"kind":"edge","x":18,"y":5}],"solving":false},{"ops":[{"kind":"edge","x":24,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":13,"y":10}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":11}],"solving":false},{"ops":[{"kind":"edge","x":16,"y":11}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":12}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":13}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":13}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":13}],"solving":false},{"ops":[{"kind":"edge","x":3,"y":14}],"solving":false},{"ops":[{"kind":"edge","x":26,"y":15}],"solving":false},{"ops":[{"kind":"edge","x":9,"y":16}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":17}],"solving":false},{"ops":[{"kind":"edge","x":18,"y":17}],"solving":false},{"ops":[{"kind":"edge","x":1,"y":18}],"solving":false},{"ops":[{"kind":"edge","x":20,"y":19}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":20}],"solving":false},{"ops":[{"kind":"edge","x":27,"y":20}],"solving":false},{"ops":[{"kind":"edge","x":24,"y":21}],"solving":false},{"ops":[{"kind":"edge","x":24,"y":23}],"solving":false},{"ops":[{"kind":"edge","x":28,"y":23}],"solving":false},{"ops":[{"kind":"edge","x":3,"y":28}],"solving":false},{"ops":[{"kind":"edge","x":25,"y":28}],"solving":false},{"ops":[{"kind":"assoc","x":25,"y":3,"ax":23,"ay":4}],"solving":false},{"ops":[{"kind":"edge","x":25,"y":2}],"solving":false},{"ops":[{"kind":"edge","x":20,"y":5}],"solving":false},{"ops":[{"kind":"assoc","x":27,"y":3,"ax":28,"ay":6}],"solving":false},{"ops":[{"kind":"edge","x":26,"y":3}],"solving":false},{"ops":[{"kind":"assoc","x":29,"y":3,"ax":28,"ay":6}],"solving":false},{"ops":[{"kind":"edge","x":29,"y":2}],"solving":false},{"ops":[{"kind":"edge","x":26,"y":9}],"solving":false},{"ops":[{"kind":"assoc","x":1,"y":5,"ax":1,"ay":7}],"solving":false},{"ops":[{"kind":"edge","x":1,"y":4}],"solving":false},{"ops":[{"kind":"edge","x":1,"y":10}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":5,"ax":5,"ay":5}],"solving":false},{"ops":[{"kind":"edge","x":3,"y":4}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":5}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":5}],"solving":false},{"ops":[{"kind":"assoc","x":25,"y":5,"ax":23,"ay":4}],"solving":false},{"ops":[{"kind":"edge","x":26,"y":5}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":7,"ax":5,"ay":5}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":7}],"solving":false},{"ops":[{"kind":"assoc","x":27,"y":11,"ax":28,"ay":14}],"solving":false},{"ops":[{"kind":"edge","x":27,"y":10}],"solving":false},{"ops":[{"kind":"edge","x":26,"y":11}],"solving":false},{"ops":[{"kind":"edge","x":29,"y":18}],"solving":false},{"ops":[{"kind":"assoc","x":7,"y":15,"ax":6,"ay":17}],"solving":false},{"ops":[{"kind":"edge","x":7,"y":14}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":15}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":19}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":20}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":17,"ax":2,"ay":19}],"solving":false},{"ops":[{"kind":"edge","x":3,"y":16}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":17}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":17}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":21,"ax":5,"ay":21}],"solving":false},{"ops":[{"kind":"edge","x":3,"y":20}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":21}],"solving":false},{"ops":[{"kind":"edge","x":7,"y":22}],"solving":false},{"ops":[{"kind":"assoc","x":1,"y":23,"ax":5,"ay":21}],"solving":false},{"ops":[{"kind":"edge","x":9,"y":18}],"solving":false},{"ops":[{"kind":"edge","x":10,"y":19}],"solving":false},{"ops":[{"kind":"edge","x":1,"y":22}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":23,"ax":5,"ay":21}],"solving":false},{"ops":[{"kind":"edge","x":7,"y":18}],"solving":false},{"ops":[{"kind":"edge","x":6,"y":19}],"solving":false},{"ops":[{"kind":"edge","x":3,"y":24}],"solving":false},{"ops":[{"kind":"assoc","x":1,"y":25,"ax":3,"ay":26}],"solving":false},{"ops":[{"kind":"edge","x":1,"y":24}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":28}],"solving":false},{"ops":[{"kind":"assoc","x":13,"y":25,"ax":11,"ay":27}],"solving":false},{"ops":[{"kind":"edge","x":13,"y":24}],"solving":false},{"ops":[{"kind":"assoc","x":27,"y":25,"ax":26,"ay":22}],"solving":false},{"ops":[{"kind":"edge","x":25,"y":18}],"solving":false},{"ops":[{"kind":"edge","x":26,"y":19}],"solving":false},{"ops":[{"kind":"edge","x":27,"y":26}],"solving":false},{"ops":[{"kind":"assoc","x":1,"y":27,"ax":3,"ay":26}],"solving":false},{"ops":[{"kind":"assoc","x":21,"y":27,"ax":19,"ay":26}],"solving":false},{"ops":[{"kind":"edge","x":17,"y":24}],"solving":false},{"ops":[{"kind":"edge","x":21,"y":28}],"solving":false},{"ops":[{"kind":"assoc","x":29,"y":27,"ax":26,"ay":27}],"solving":false},{"ops":[{"kind":"edge","x":22,"y":27}],"solving":false},{"ops":[{"kind":"assoc","x":11,"y":29,"ax":11,"ay":27}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":24}],"solving":false},{"ops":[{"kind":"assoc","x":13,"y":29,"ax":11,"ay":27}],"solving":false},{"ops":[{"kind":"assoc","x":15,"y":29,"ax":11,"ay":27}],"solving":false},{"ops":[{"kind":"edge","x":7,"y":24}],"solving":false},{"ops":[{"kind":"edge","x":6,"y":25}],"solving":false},{"ops":[{"kind":"assoc","x":29,"y":29,"ax":26,"ay":27}],"solving":false},{"ops":[{"kind":"edge","x":23,"y":24}],"solving":false},{"ops":[{"kind":"assoc","x":5,"y":3,"ax":5,"ay":5}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":2}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":3}],"solving":false},{"ops":[{"kind":"assoc","x":9,"y":3,"ax":9,"ay":6}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":3}],"solving":false},{"ops":[{"kind":"assoc","x":11,"y":7,"ax":13,"ay":4}],"solving":false},{"ops":[{"kind":"edge","x":16,"y":1}],"solving":false},{"ops":[{"kind":"edge","x":10,"y":7}],"solving":false},{"ops":[{"kind":"assoc","x":13,"y":1,"ax":13,"ay":4}],"solving":false},{"ops":[{"kind":"edge","x":13,"y":8}],"solving":false},{"ops":[{"kind":"assoc","x":23,"y":13,"ax":21,"ay":12}],"solving":false},{"ops":[{"kind":"edge","x":18,"y":11}],"solving":false},{"ops":[{"kind":"edge","x":23,"y":14}],"solving":false},{"ops":[{"kind":"assoc","x":7,"y":7,"ax":9,"ay":6}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":5}],"solving":false},{"ops":[{"kind":"edge","x":7,"y":6}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":6}],"solving":false},{"ops":[{"kind":"edge","x":6,"y":7}],"solving":false},{"ops":[{"kind":"assoc","x":13,"y":15,"ax":14,"ay":12}],"solving":false},{"ops":[{"kind":"edge","x":14,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":16,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":15}],"solving":false},{"ops":[{"kind":"assoc","x":19,"y":1,"ax":19,"ay":5}],"solving":false},{"ops":[{"kind":"edge","x":18,"y":1}],"solving":false},{"ops":[{"kind":"edge","x":18,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":19,"y":10}],"solving":false},{"ops":[{"kind":"assoc","x":5,"y":9,"ax":10,"ay":14}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":8}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":10}],"solving":false},{"ops":[{"kind":"edge","x":15,"y":18}],"solving":false},{"ops":[{"kind":"assoc","x":11,"y":9,"ax":14,"ay":12}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":8}],"solving":false},{"ops":[{"kind":"edge","x":10,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":17,"y":16}],"solving":false},{"ops":[{"kind":"assoc","x":21,"y":9,"ax":21,"ay":12}],"solving":false},{"ops":[{"kind":"edge","x":20,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":22,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":22,"y":15}],"solving":false},{"ops":[{"kind":"assoc","x":15,"y":15,"ax":16,"ay":17}],"solving":false},{"ops":[{"kind":"edge","x":15,"y":14}],"solving":false},{"ops":[{"kind":"edge","x":14,"y":15}],"solving":false},{"ops":[{"kind":"edge","x":16,"y":15}],"solving":false},{"ops":[{"kind":"edge","x":16,"y":19}],"solving":false},{"ops":[{"kind":"edge","x":18,"y":19}],"solving":false},{"ops":[{"kind":"edge","x":17,"y":20}],"solving":false},{"ops":[{"kind":"assoc","x":9,"y":21,"ax":12,"ay":22}],"solving":false},{"ops":[{"kind":"edge","x":9,"y":20}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":21}],"solving":false},{"ops":[{"kind":"edge","x":16,"y":23}],"solving":false},{"ops":[{"kind":"assoc","x":19,"y":21,"ax":19,"ay":18}],"solving":false},{"ops":[{"kind":"edge","x":18,"y":15}],"solving":false},{"ops":[{"kind":"edge","x":20,"y":15}],"solving":false},{"ops":[{"kind":"edge","x":18,"y":21}],"solving":false},{"ops":[{"kind":"assoc","x":21,"y":21,"ax":21,"ay":19}],"solving":false},{"ops":[{"kind":"edge","x":21,"y":16}],"solving":false},{"ops":[{"kind":"edge","x":20,"y":17}],"solving":false},{"ops":[{"kind":"edge","x":22,"y":17}],"solving":false},{"ops":[{"kind":"edge","x":20,"y":21}],"solving":false},{"ops":[{"kind":"edge","x":22,"y":21}],"solving":false},{"ops":[{"kind":"assoc","x":21,"y":7,"ax":19,"ay":5}],"solving":false},{"ops":[{"kind":"edge","x":17,"y":2}],"solving":false},{"ops":[{"kind":"edge","x":17,"y":4}],"solving":false},{"ops":[{"kind":"edge","x":21,"y":6}],"solving":false},{"ops":[{"kind":"edge","x":21,"y":8}],"solving":false},{"ops":[{"kind":"assoc","x":15,"y":3,"ax":19,"ay":5}],"solving":false},{"ops":[{"kind":"edge","x":15,"y":2}],"solving":false},{"ops":[{"kind":"edge","x":14,"y":3}],"solving":false},{"ops":[{"kind":"edge","x":23,"y":6}],"solving":false},{"ops":[{"kind":"edge","x":23,"y":8}],"solving":false},{"ops":[{"kind":"assoc","x":19,"y":3,"ax":19,"ay":5}],"solving":false},{"ops":[{"kind":"edge","x":20,"y":3}],"solving":false},{"ops":[{"kind":"assoc","x":23,"y":11,"ax":21,"ay":12}],"solving":false},{"ops":[{"kind":"edge","x":23,"y":10}],"solving":false},{"ops":[{"kind":"edge","x":24,"y":11}],"solving":false},{"ops":[{"kind":"edge","x":19,"y":14}],"solving":false},{"ops":[{"kind":"assoc","x":21,"y":23,"ax":19,"ay":26}],"solving":false},{"ops":[{"kind":"edge","x":21,"y":22}],"solving":false},{"ops":[{"kind":"edge","x":22,"y":23}],"solving":false},{"ops":[{"kind":"edge","x":16,"y":29}],"solving":false},{"ops":[{"kind":"assoc","x":15,"y":25,"ax":11,"ay":27}],"solving":false},{"ops":[{"kind":"edge","x":15,"y":24}],"solving":false},{"ops":[{"kind":"edge","x":16,"y":25}],"solving":false},{"ops":[{"kind":"edge","x":6,"y":29}],"solving":false},{"ops":[{"kind":"assoc","x":21,"y":25,"ax":19,"ay":26}],"solving":false},{"ops":[{"kind":"edge","x":22,"y":25}],"solving":false},{"ops":[{"kind":"assoc","x":25,"y":25,"ax":26,"ay":27}],"solving":false},{"ops":[{"kind":"edge","x":25,"y":24}],"solving":false},{"ops":[{"kind":"edge","x":26,"y":25}],"solving":false},{"ops":[{"kind":"edge","x":26,"y":29}],"solving":false},{"ops":[{"kind":"assoc","x":7,"y":27,"ax":11,"ay":27}],"solving":false},{"ops":[{"kind":"edge","x":6,"y":27}],"solving":false},{"ops":[{"kind":"edge","x":16,"y":27}],"solving":false},{"ops":[{"kind":"assoc","x":9,"y":27,"ax":11,"ay":27}],"solving":false},{"ops":[{"kind":"assoc","x":1,"y":29,"ax":3,"ay":26}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":22}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":23}],"solving":false},{"ops":[{"kind":"edge","x":6,"y":23}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":29}],"solving":false},{"ops":[{"kind":"assoc","x":9,"y":23,"ax":12,"ay":22}],"solving":false},{"ops":[{"kind":"edge","x":15,"y":20}],"solving":false},{"ops":[{"kind":"edge","x":16,"y":21}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":23}],"solving":false},{"ops":[{"kind":"edge","x":9,"y":24}],"solving":false},{"ops":[{"kind":"assoc","x":19,"y":23,"ax":19,"ay":26}],"solving":false},{"ops":[{"kind":"edge","x":19,"y":22}],"solving":false},{"ops":[{"kind":"edge","x":18,"y":23}],"solving":false},{"ops":[{"kind":"edge","x":20,"y":29}],"solving":false},{"ops":[{"kind":"assoc","x":23,"y":29,"ax":26,"ay":27}],"solving":false},{"ops":[{"kind":"edge","x":29,"y":24}],"solving":false},{"ops":[{"kind":"edge","x":28,"y":25}],"solving":false},{"ops":[{"kind":"edge","x":22,"y":29}],"solving":false},{"ops":[{"kind":"edge","x":24,"y":29}],"solving":false},{"ops":[{"kind":"assoc","x":23,"y":19,"ax":24,"ay":16}],"solving":false},{"ops":[{"kind":"edge","x":25,"y":12}],"solving":false},{"ops":[{"kind":"edge","x":24,"y":13}],"solving":false},{"ops":[{"kind":"edge","x":26,"y":13}],"solving":false},{"ops":[{"kind":"edge","x":22,"y":19}],"solving":false},{"ops":[{"kind":"edge","x":24,"y":19}],"solving":false},{"ops":[{"kind":"edge","x":23,"y":20}],"solving":false},{"ops":[{"kind":"assoc","x":29,"y":21,"ax":28,"ay":19}],"solving":false},{"ops":[{"kind":"edge","x":27,"y":16}],"solving":false},{"ops":[{"kind":"edge","x":26,"y":17}],"solving":false},{"ops":[{"kind":"edge","x":28,"y":17}],"solving":false},{"ops":[{"kind":"edge","x":28,"y":21}],"solving":false},{"ops":[{"kind":"edge","x":29,"y":22}],"solving":false},{"ops":[{"kind":"assoc","x":25,"y":7,"ax":23,"ay":4}],"solving":false},{"ops":[{"kind":"edge","x":20,"y":1}],"solving":false},{"ops":[{"kind":"edge","x":22,"y":1}],"solving":false},{"ops":[{"kind":"edge","x":24,"y":7}],"solving":false},{"ops":[{"kind":"edge","x":26,"y":7}],"solving":false},{"ops":[{"kind":"edge","x":25,"y":8}],"solving":false},{"ops":[{"kind":"assoc","x":27,"y":1,"ax":28,"ay":6}],"solving":false},{"ops":[{"kind":"edge","x":26,"y":1}],"solving":false},{"ops":[{"kind":"edge","x":28,"y":1}],"solving":false},{"ops":[{"kind":"edge","x":28,"y":11}],"solving":false},{"ops":[{"kind":"edge","x":29,"y":12}],"solving":false},{"ops":[{"kind":"assoc","x":11,"y":11,"ax":14,"ay":12}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":12}],"solving":false},{"ops":[{"kind":"edge","x":17,"y":12}],"solving":false},{"ops":[{"kind":"edge","x":18,"y":13}],"solving":false},{"ops":[{"kind":"assoc","x":7,"y":1,"ax":5,"ay":5}],"solving":false},{"ops":[{"kind":"edge","x":6,"y":1}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":3,"y":10}],"solving":false},{"ops":[{"kind":"assoc","x":1,"y":15,"ax":3,"ay":15}],"solving":false},{"ops":[{"kind":"edge","x":1,"y":14}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":14}],"solving":false},{"ops":[{"kind":"edge","x":6,"y":15}],"solving":false},{"ops":[{"kind":"edge","x":1,"y":16}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":16}],"solving":false},{"ops":[{"kind":"assoc","x":7,"y":9,"ax":10,"ay":14}],"solving":false},{"ops":[{"kind":"edge","x":7,"y":8}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":19}],"solving":false},{"ops":[{"kind":"edge","x":13,"y":20}],"solving":false},{"ops":[{"kind":"assoc","x":11,"y":3,"ax":13,"ay":4}],"solving":false},{"ops":[{"kind":"edge","x":10,"y":3}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":4}],"solving":false},{"ops":[{"kind":"edge","x":15,"y":4}],"solving":false},{"ops":[{"kind":"edge","x":16,"y":5}],"solving":false}]',
    },
    /** Held on 1041 of 7067 positions walked. */
    mirrorWall: {
      id: "7x7du:mkibeyrzadbdkzb",
      moves:
        '[{"ops":[{"kind":"assoc","x":11,"y":2,"ax":11,"ay":2}],"solving":false},{"ops":[{"kind":"assoc","x":1,"y":4,"ax":1,"ay":4}],"solving":false},{"ops":[{"kind":"assoc","x":2,"y":10,"ax":2,"ay":10}],"solving":false},{"ops":[{"kind":"assoc","x":13,"y":10,"ax":13,"ay":10}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":1}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":3}],"solving":false},{"ops":[{"kind":"edge","x":10,"y":3}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":8}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":10,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":1,"y":12}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":3,"ax":5,"ay":7}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":3}],"solving":false},{"ops":[{"kind":"assoc","x":5,"y":3,"ax":5,"ay":7}],"solving":false},{"ops":[{"kind":"edge","x":6,"y":3}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":10}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":11}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":5,"ax":5,"ay":7}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":5}],"solving":false},{"ops":[{"kind":"edge","x":6,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":9}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":7,"ax":5,"ay":7}],"solving":false},{"ops":[{"kind":"edge","x":3,"y":8}],"solving":false},{"ops":[{"kind":"assoc","x":5,"y":13,"ax":5,"ay":7}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":1,"ax":5,"ay":7}],"solving":false},{"ops":[{"kind":"assoc","x":11,"y":7,"ax":11,"ay":9}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":11}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":4}],"solving":false},{"ops":[{"kind":"edge","x":13,"y":2}],"solving":false}]',
    },
  },
});

/** The canonical solution's dot for every tile — the board the hint's every
 * claim is measured against. */
function solution(s: GalaxiesState): GalaxiesState {
  const sol = cloneState(s);
  clearForSolve(sol);
  sol.dots = rebuildDots(sol);
  const diff = solverState(sol, GalaxiesDiff.Unreasonable);
  expect([GalaxiesDiff.Normal, GalaxiesDiff.Unreasonable]).toContain(diff);
  return sol;
}

describe("the plan is sound: every step agrees with the unique solution", () => {
  // The property that stands in for the byte-match oracle here. A hint is a
  // second projection of the solver, so a wrong deduction would not show up
  // in the generator's frozen differential at all — it would show up as a
  // player being told to draw an arrow the puzzle contradicts.
  for (const [name, params] of [
    ["Easy", NORMAL_7],
    ["Unreasonable", UNREASONABLE_7],
  ] as const) {
    it(`${name}: no association or wall contradicts the solution`, () => {
      for (const seed of ["sound-a", "sound-b", "sound-c"]) {
        const start = board(params, seed);
        const sol = solution(start);
        let s = start;
        for (let i = 0; i < 400 && galaxiesGame.status(s) === "ongoing"; i++) {
          // An Unreasonable board may legitimately run out of deduction; what
          // is under test is that nothing the hint *did* say was wrong.
          const res = galaxiesGame.hint?.(s);
          if (!res?.ok && params.diff === GalaxiesDiff.Unreasonable) break;
          const steps = hintOf(s);
          for (const step of steps) {
            const hl = step.highlights;
            if (!hl) continue;
            for (const t of hl.targets) {
              const si = idx(sol, t.x, t.y);
              expect(sol.flags[si] & F_TILE_ASSOC).toBeTruthy();
              expect(
                [sol.dotx[si], sol.doty[si]],
                `${seed}: hint pointed (${t.x},${t.y}) at the wrong dot`,
              ).toEqual([hl.targetDot?.x, hl.targetDot?.y]);
            }
            for (const wall of hl.targetWalls) {
              expect(
                sol.flags[idx(sol, wall.x, wall.y)] & F_EDGE_SET,
                `${seed}: hint asked for a wall at (${wall.x},${wall.y}) the solution does not have`,
              ).toBeTruthy();
            }
          }
          s = galaxiesGame.executeMove(s, steps[0].move);
        }
        if (params.diff === GalaxiesDiff.Normal) {
          expect(
            galaxiesGame.status(s),
            `${seed}: hints did not finish the board`,
          ).toBe("solved");
        }
      }
    });
  }
});

describe("each deduction is narrated in its own vocabulary", () => {
  it("a cell with a single way out reads in the singular", () => {
    // The one wording asserted on a *constructed* firing rather than a found
    // one: 48 board-walks produce this rung 25 times and never with one
    // opening, because walling three sides of a still-unassociated cell takes
    // an unusual board. The branch stays — the alternative is saying "Every
    // way out" about one way out — so its wording is checked here instead of
    // pretending a scan covers it.
    const s = board(NORMAL_7, "singular");
    const dot = s.dots[0];
    expect(
      narrate(s, {
        kind: "enclosed",
        tile: { x: 3, y: 3 },
        opp: null,
        dot,
        openings: [{ x: 5, y: 3 }],
        galaxy: [{ x: 5, y: 3 }],
      }).replace("black dot", "white dot"),
    ).toBe(
      "The only way out of this cell leads into the striped galaxy, so it must belong to the ringed white dot.",
    );
  });
});

describe("the hint never guesses, and says so when that is the end of the road", () => {
  // The guess-free policy's line, in the sharp form (owner, 2026-08-11): a
  // contradiction you can *see* from a placement is checking, and belongs
  // anywhere; one you only reach by *propagating* from a hypothesis is
  // guessing, and is not a technique a hint can teach at all. Galaxies once
  // shipped a rung of the second kind on the Unreasonable tier; it was
  // removed, so the guarantee below is now unconditional rather than
  // per-tier.
  it("every step it offers is a rule the board shows, on either tier", () => {
    // A guessing step would have to say what it *tried*; a deduced one states
    // a premise. This is a shape check on the vocabulary, cheap and blunt.
    //
    // Kept **stricter than** the cross-game version now in
    // `engine/hint-quality.test.ts` (`audit-guessing-tier-names` promoted it
    // there, since a rule enforced in one game is not enforced). This one also
    // rejects `suppose` / `if it were` outright, which the shared check cannot:
    // several games narrate a *single-step* refutation that way and are right
    // to. Galaxies has no such arm, so the tighter net costs it nothing and
    // pins the game the rule was written from.
    const speculative =
      /\btr(y|ied|ies)\b|\bsuppose\b|\bif it were\b|\bbreak the board\b/i;
    for (const params of [NORMAL_7, UNREASONABLE_7]) {
      for (const seed of ["gf-a", "gf-b"]) {
        let s = board(params, seed);
        for (
          let batch = 0;
          batch < 40 && galaxiesGame.status(s) === "ongoing";
          batch++
        ) {
          const res = galaxiesGame.hint?.(s);
          if (!res?.ok) break;
          for (const step of res.steps) {
            expect(
              speculative.test(step.explanation),
              `${seed}: a speculative step — "${step.explanation}"`,
            ).toBe(false);
            s = galaxiesGame.executeMove(s, step.move);
          }
        }
      }
    }
  });

  it("an Easy board is always carried all the way to solved", () => {
    // The tier's promise: pure deduction suffices, so the hint must never
    // reach the refusal below on an Easy board.
    for (const size of [7, 10]) {
      for (const seed of ["gf-a", "gf-b", "gf-c"]) {
        const params = { w: size, h: size, diff: GalaxiesDiff.Normal };
        let s = board(params, `${seed}-${size}`);
        for (let b = 0; b < 40 && galaxiesGame.status(s) === "ongoing"; b++) {
          const res = galaxiesGame.hint?.(s);
          expect(res?.ok, `${seed}/${size}: Easy board stalled`).toBe(true);
          if (!res?.ok) break;
          for (const step of res.steps) s = galaxiesGame.executeMove(s, step.move);
        }
        expect(galaxiesGame.status(s), `${seed}/${size}: not solved`).toBe("solved");
      }
    }
  });

  it("an Unreasonable board that runs out gets told what to do instead", () => {
    // Where deduction genuinely ends, the refusal has to be useful: this is
    // the position the tier exists for, not an error.
    let refusals = 0;
    for (const seed of ["gu-a", "gu-b", "gu-c", "gu-d"]) {
      let s = board(UNREASONABLE_7, seed);
      for (let b = 0; b < 40 && galaxiesGame.status(s) === "ongoing"; b++) {
        const res = galaxiesGame.hint?.(s);
        if (!res?.ok) {
          refusals++;
          expect(res?.error).toMatch(/^Nothing further follows by deduction here\./);
          expect(res?.error).toMatch(/save a checkpoint/);
          break;
        }
        for (const step of res.steps) s = galaxiesGame.executeMove(s, step.move);
      }
    }
    // If this ever came out zero the tier would be indistinguishable from
    // Easy, which is its own defect (`grade-difficulty-tiers-honestly`).
    expect(refusals, "no Unreasonable board needed to guess").toBeGreaterThan(0);
  });
});

describe("a deduction the player cannot act on never costs the plan a step", () => {
  // The shipped bug this pins (owner-reported on a 15x15): a dot sitting
  // *inside* a cell forces that cell, the game refuses to draw an arrow
  // there, and so the firing re-derives on every recompute and can never be
  // shown. With the plan capped by firings rather than by showable steps,
  // twenty of those in a row spent the entire budget and the hint announced
  // "No further move can be deduced" on a board with a hundred moves left.
  const REPORTED = "fnizegzhxrhzzzsfcjzlfdprczfzfezqcinjjyvtzybbmdtxpzzcjgfizfjgh";
  const params = { w: 15, h: 15, diff: GalaxiesDiff.Unreasonable };

  it("the reported board keeps offering hints deep into the solve", () => {
    let s = galaxiesGame.newState(params, REPORTED);
    let sawUnshowable = false;
    let offered = 0;
    // Batch-replay whole plans rather than recomputing per move: this reaches
    // the same mid-game depth in a few calls instead of dozens, and the plan
    // machinery is what is under test, not the walk.
    for (let batch = 0; batch < 6 && galaxiesGame.status(s) === "ongoing"; batch++) {
      // The hidden firings no longer sit in the plan: the shared loop drops
      // them and counts them, which is the number this probe needs.
      sawUnshowable ||= galaxiesHintPlan(s).hidden > 0;
      const res = galaxiesGame.hint?.(s);
      // A refusal *deep* in an Unreasonable board is legitimate — deduction
      // can genuinely run out there. Refusing at the first ask, on a board
      // with a hundred moves left, is the bug this pins.
      if (!res?.ok) break;
      offered++;
      for (const step of res.steps) s = galaxiesGame.executeMove(s, step.move);
    }
    expect(offered, "the reported board refused straight away").toBeGreaterThan(3);
    // The guard is only meaningful if this board really does produce firings
    // the player can never act on — the whole point of the class.
    expect(
      sawUnshowable,
      "no unshowable firing occurred; the test proves nothing",
    ).toBe(true);
  });
});

describe("the picture carries the argument", () => {
  it("every step highlights something, and the acted-on cell is never also evidence", () => {
    for (const seed of ["pic-a", "pic-b"]) {
      let s = board(NORMAL_7, seed);
      for (let i = 0; i < 400 && galaxiesGame.status(s) === "ongoing"; i++) {
        const steps = hintOf(s);
        for (const step of steps) {
          const hl = step.highlights;
          expect(hl, "a step with no highlights").toBeDefined();
          if (!hl) continue;
          const marks =
            hl.targets.length + hl.targetWalls.length + (hl.targetDot ? 1 : 0);
          expect(
            marks,
            `${step.explanation} — marks nothing to act on`,
          ).toBeGreaterThan(0);
          // Only the cell being acted on is kept out of its own evidence: it
          // owns the action color and the doubled ring. The *partner* stays in
          // the evidence — it is inside the area the sentence describes, and
          // marking it there is what keeps it the quieter of the two.
          const f = hl.focus;
          if (f) {
            expect(
              hl.area.some((a) => a.x === f.x && a.y === f.y),
              "the acted-on cell is also marked as evidence",
            ).toBe(false);
          } else {
            for (const t of hl.targets) {
              expect(
                hl.area.some((a) => a.x === t.x && a.y === t.y),
                "a target cell is also marked as evidence",
              ).toBe(false);
            }
          }
        }
        s = galaxiesGame.executeMove(s, steps[0].move);
      }
    }
  });

  it("a deduction naming a mark actually draws it", () => {
    // The per-game form of the visible-evidence rule: a sentence saying "the
    // outlined cells" must outline some, and one saying "striped" must hatch
    // some.
    const said = [
      { word: /outlined/, mark: (s: Step) => s.highlights?.area.length ?? 0 },
      {
        word: /striped|stripes show/,
        mark: (s: Step) => s.highlights?.hatch.length ?? 0,
      },
    ];
    const checked = [0, 0];
    for (const seed of ["gh-scan-0", "gh-scan-1", "gh-scan-2", "gh-scan-3"]) {
      let s = board(UNREASONABLE_7, seed);
      for (let i = 0; i < 400 && galaxiesGame.status(s) === "ongoing"; i++) {
        const res = galaxiesGame.hint?.(s);
        if (!res?.ok) break; // deduction ran out — legitimate on this tier
        const step = res.steps[0];
        said.forEach(({ word, mark }, k) => {
          if (!word.test(step.explanation)) return;
          expect(
            mark(step),
            `"${step.explanation}" names a mark it does not draw`,
          ).toBeGreaterThan(0);
          checked[k]++;
        });
        s = galaxiesGame.executeMove(s, step.move);
      }
    }
    // The scan keys on the words, so a rewording would silently empty it.
    expect(
      checked[0],
      "no step said 'outlined'; the regex has gone stale",
    ).toBeGreaterThan(0);
    expect(
      checked[1],
      "no step said 'striped'; the regex has gone stale",
    ).toBeGreaterThan(0);
  });

  it("a wall step points at a wall, an association step points at a dot", () => {
    let checked = 0;
    for (const seed of ["role-a", "role-b"]) {
      let s = board(NORMAL_7, seed);
      for (let i = 0; i < 400 && galaxiesGame.status(s) === "ongoing"; i++) {
        const step = hintOf(s)[0];
        const hl = step.highlights;
        if (!hl) continue;
        const isWall = hl.targetWalls.length > 0;
        expect(isWall ? hl.targets.length : hl.targetWalls.length).toBe(0);
        checked++;
        // One ring role at a time, so "the ringed dot" is never ambiguous.
        if (hl.targetDot) expect(hl.refDots.length).toBe(0);
        s = galaxiesGame.executeMove(s, step.move);
      }
    }
    // A plan that stopped carrying highlights would `continue` past everything.
    expect(checked, "no step carried highlights").toBeGreaterThan(0);
  });
});

describe("refusals", () => {
  it("counts a solved board as finished, so the midend refuses it", () => {
    let s = board(NORMAL_7, "refuse-solved");
    const res = galaxiesGame.solve?.(s, s);
    expect(res?.ok).toBe(true);
    if (res?.ok) s = galaxiesGame.executeMove(s, res.move);
    expect(galaxiesGame.status(s)).toBe("solved");
  });

  it("flags a wrong association, so the midend refuses it", () => {
    const s = board(NORMAL_7, "refuse-wrong");
    const sol = solution(s);
    // Find a tile and a dot the solution does *not* pair, and pair them.
    let wrong: GalaxiesMove | null = null;
    for (let y = 1; y < s.sy - 1 && !wrong; y += 2) {
      for (let x = 1; x < s.sx - 1 && !wrong; x += 2) {
        const si = idx(sol, x, y);
        for (const d of s.dots) {
          if (sol.dotx[si] === d.x && sol.doty[si] === d.y) continue;
          const move: GalaxiesMove = {
            ops: [{ kind: "assoc", x, y, ax: d.x, ay: d.y }],
            solving: false,
          };
          const after = galaxiesGame.executeMove(s, move);
          if ((after.flags[idx(after, x, y)] & F_TILE_ASSOC) === 0) continue;
          if (after.dotx[idx(after, x, y)] !== d.x) continue;
          wrong = move;
          break;
        }
      }
    }
    expect(wrong, "no wrong association was placeable on this board").not.toBeNull();
    if (!wrong) return;
    const dirty = galaxiesGame.executeMove(s, wrong);
    expect(galaxiesGame.findMistakes?.(dirty).length ?? 0).toBeGreaterThan(0);
  });
});

describe("following the plan", () => {
  it("counts the association as completed however the player draws it", () => {
    const { step, state } = pinned("association");
    const hl = step.highlights;
    if (!hl?.targetDot) throw new Error("an association goes to a dot");
    const target = hl.targets[0];
    const dot = hl.targetDot;
    // Dragging from the dot, dragging from the cell and the keyboard all end
    // in the same move shape, but the *op* need not match the plan's own: the
    // plan may have asked at the dot's coordinates and the player at the
    // cell's. Judged by effect, both are following.
    const byCell: GalaxiesMove = {
      ops: [{ kind: "assoc", x: target.x, y: target.y, ax: dot.x, ay: dot.y }],
      solving: false,
    };
    expect(["completed", "onTrack"]).toContain(
      galaxiesGame.hintKeepTrack?.(byCell, step, state),
    );
  });

  it("holds a multi-cell step on track until its last cell lands", () => {
    const found = pinned("severalCells");
    const hl = found.step.highlights;
    if (!hl?.targetDot) throw new Error("an association goes to a dot");
    const one: GalaxiesMove = {
      ops: [
        {
          kind: "assoc",
          x: hl.targets[0].x,
          y: hl.targets[0].y,
          ax: hl.targetDot.x,
          ay: hl.targetDot.y,
        },
      ],
      solving: false,
    };
    const verdict = galaxiesGame.hintKeepTrack?.(one, found.step, found.state);
    // Either the pair the game commits atomically finished the step, or the
    // step wants more cells and stays displayed — never "off".
    expect(["completed", "onTrack"]).toContain(verdict);
  });

  it("re-reads a step the player has partly made from what it still draws", () => {
    // A dot on a corner owns four cells, and one arrow commits a cell with its
    // partner, so the player's own arrow leaves two: the step shrinks, and its
    // sentence and its dot ring follow.
    const found = pinned("dotAtCorner");
    const hl = found.step.highlights;
    if (!hl?.targetDot) throw new Error("a dot's cells go to the dot");
    const [t] = hl.targets;
    const s = galaxiesGame.executeMove(found.state, {
      ops: [{ kind: "assoc", x: t.x, y: t.y, ax: hl.targetDot.x, ay: hl.targetDot.y }],
      solving: false,
    });
    const live = galaxiesGame.refreshHintStep?.(found.step, s);
    if (!live) throw new Error("the step was left half made");
    expect(live.highlights?.targets).toHaveLength(2);
    expect(live.explanation).toMatch(/so both these cells must belong to/);
    expect(bindingDefects(galaxiesGame, s, galaxiesGame.newUi(s), live)).toEqual([]);
  });

  it("drops the plan when the player goes their own way", () => {
    const { step, state } = pinned("association");
    // An unrelated wall somewhere the step never mentions.
    let elsewhere: GalaxiesMove | null = null;
    for (let y = 1; y < state.sy - 1 && !elsewhere; y++) {
      for (let x = 1; x < state.sx - 1; x++) {
        if (x % 2 === y % 2) continue; // not an edge cell
        if (state.flags[idx(state, x, y)] & F_EDGE_SET) continue;
        if (step.highlights?.targetWalls.some((w) => w.x === x && w.y === y)) continue;
        elsewhere = { ops: [{ kind: "edge", x, y }], solving: false };
        break;
      }
    }
    expect(elsewhere).not.toBeNull();
    if (!elsewhere) return;
    expect(galaxiesGame.hintKeepTrack?.(elsewhere, step, state)).toBe("off");
  });

  it("refreshes a step away once the board already shows it", () => {
    const { step, state } = pinned("association");
    expect(galaxiesGame.refreshHintStep?.(step, state)).toBe(step);
    const after = galaxiesGame.executeMove(state, step.move);
    expect(galaxiesGame.refreshHintStep?.(step, after)).toBeNull();
  });
});

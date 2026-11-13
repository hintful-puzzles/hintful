/**
 * Clusters explained hint.
 *
 * Tier 1: the hint's walk over the ladder — every kind of step fires with a
 * true, checkable premise; the plan solves the board; the plan is
 * recompute-stable; refusals are honest. Steps are located by a fixed-seed
 * scan over generated boards (docs/hints.md § "Verifying a hint in-process"'s
 * idiom) rather than hand-crafted grids: the ≥2-same-neighbors rule makes small
 * valid mid-game boards fiddly to craft, and a property checked on a real
 * firing is the stronger assertion anyway.
 *
 * Tier 2.5: render-scenario frames — the ringed target and the thin rings on
 * the tiles a step reads all reach the canvas, plus a snapshot.
 *
 * Cross-game guards (resume walk, overlay-reaches-cache, narration form) run
 * from `engine/testing/hint-games.ts` enrollment, not here.
 */
import { describe, expect, it } from "vitest";
import { resolvePalette } from "../../engine/color/color-mkhighlight.ts";
import { TWO_NAMES } from "../../engine/color/colors.ts";
import type { HintStep } from "../../engine/game.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { Midend } from "../../engine/midend.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import {
  renderPinnedHint,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import type { ClustersHint } from "./hint.ts";
import { clustersGame } from "./index.ts";
import { border, COL_0, COL_1, COL_HINT_CELL, PREFERRED_TILE_SIZE } from "./render.ts";
import { COMPLETE, clustersStatus, findErrors } from "./solver.ts";
import {
  type ClustersFill,
  type ClustersMove,
  type ClustersState,
  COLMASK,
  DIFF_TRICKY,
  F_COLOR_0,
  F_COLOR_1,
  F_SINGLE,
  newState,
  opposite,
} from "./state.ts";

const P = { w: 7, h: 7, diff: DIFF_TRICKY };
/** The **full** params string, difficulty included. A hand-written id must
 * carry the tier: `encodeParams(p, false)` omits it, so "7x7" decodes as Easy
 * and a scenario built from it would generate a different board from the one
 * a fixed-seed scan over `P` just found. */
const ID = clustersGame.encodeParams(P, true);

function generate(seed: string): ClustersState {
  const { desc } = clustersGame.newDesc(P, randomNew(seed));
  return newState(P, desc);
}

type Step = HintStep<ClustersMove, ClustersHint, string>;

/** The steps of the hint on `state`, none where it refuses. */
function stepsOf(state: ClustersState): Step[] {
  const res = clustersGame.hint?.(state);
  return res?.ok ? (res.steps as Step[]) : [];
}

/** The square a step colors, and the color it asks. */
function decided(step: Step): { index: number; fill: ClustersFill } {
  const [t] = step.highlights?.targets ?? [];
  if (!t) throw new Error("a step with no square");
  return { index: t.y * P.w + t.x, fill: t.value };
}

/** A position for each kind of step. */
const pinned = describeHintPins({
  game: clustersGame,
  params: [P],
  pins: {
    /** Held on 222 of 431 positions walked. */
    "refute.selfSurrounded": "7x7dt:bcAbeICacDCIaca",
    /** Held on 413 of 431 positions walked. */
    "refute.selfReach": "7x7dt:cGadAadGgKbb",
    /** Held on 305 of 431 positions walked. */
    "refute.nearSurrounded": "7x7dt:cGadAadGgKbb",
    /** Held on 364 of 431 positions walked. */
    "refute.nearReach": "7x7dt:cGadAadGgKbb",
    /** Held on 411 of 431 positions walked. */
    "refute.dotOvercount": {
      id: "7x7dt:cGadAadGgKbb",
      moves: [{ kind: "paint", cells: [{ index: 3, fill: 1 }] }],
    },
    /** Held on 221 of 431 positions walked. */
    countFull: "7x7dt:DgfcfBEdHe",
    /** Held on 54 of 431 positions walked. */
    countShort: {
      id: "7x7dt:BaAaAckAbDafDaDaea",
      moves:
        '[{"kind":"paint","cells":[{"index":0,"fill":2}]},{"kind":"paint","cells":[{"index":6,"fill":2}]},{"kind":"paint","cells":[{"index":7,"fill":2}]},{"kind":"paint","cells":[{"index":9,"fill":1}]},{"kind":"paint","cells":[{"index":10,"fill":2}]},{"kind":"paint","cells":[{"index":11,"fill":1}]},{"kind":"paint","cells":[{"index":12,"fill":1}]},{"kind":"paint","cells":[{"index":13,"fill":2}]},{"kind":"paint","cells":[{"index":14,"fill":2}]},{"kind":"paint","cells":[{"index":15,"fill":2}]},{"kind":"paint","cells":[{"index":16,"fill":2}]},{"kind":"paint","cells":[{"index":17,"fill":2}]},{"kind":"paint","cells":[{"index":18,"fill":2}]},{"kind":"paint","cells":[{"index":25,"fill":2}]},{"kind":"paint","cells":[{"index":34,"fill":1}]},{"kind":"paint","cells":[{"index":32,"fill":2}]},{"kind":"paint","cells":[{"index":35,"fill":2}]},{"kind":"paint","cells":[{"index":40,"fill":2}]},{"kind":"paint","cells":[{"index":41,"fill":1}]},{"kind":"paint","cells":[{"index":39,"fill":2}]},{"kind":"paint","cells":[{"index":47,"fill":2}]},{"kind":"paint","cells":[{"index":46,"fill":2}]},{"kind":"paint","cells":[{"index":30,"fill":1}]},{"kind":"paint","cells":[{"index":21,"fill":2}]},{"kind":"paint","cells":[{"index":28,"fill":2}]}]',
    },
  },
});

/** A pinned position, the step its plan opens with, and the grid it fires on. */
function findDeduction(kind: Parameters<typeof pinned>[0]): {
  index: number;
  fill: ClustersFill;
  refuted: ClustersFill;
  step: Step;
  grid: Uint8Array;
  state: ClustersState;
} {
  const pin = pinned(kind).state;
  const plan = stepsOf(pin);
  const at = plan.findIndex((s) => s.rung === kind);
  if (at < 0) throw new Error(`${kind}: the plan has no such step here`);
  // The board the step fires on: the squares the plan colors before it.
  const state = plan
    .slice(0, at)
    .reduce((s, earlier) => clustersGame.executeMove(s, earlier.move), pin);
  const step = plan[at];
  const { index, fill } = decided(step);
  return { index, fill, refuted: opposite(fill), step, grid: state.grid, state };
}

const neighborsOf = (i: number, w: number, h: number): number[] => {
  const x = i % w;
  const y = (i - x) / w;
  const out: number[] = [];
  if (x > 0) out.push(i - 1);
  if (x < w - 1) out.push(i + 1);
  if (y > 0) out.push(i - w);
  if (y < h - 1) out.push(i + w);
  return out;
};

const sameNeighbors = (grid: Uint8Array, i: number, w: number, h: number): number =>
  neighborsOf(i, w, h).filter((n) => (grid[n] & COLMASK) === (grid[i] & COLMASK))
    .length;

/** The squares a step outlines, as indices. */
const outlinedOf = (step: Step): number[] =>
  stepMarks(step)
    .of("outline", CELL)
    .map((p) => p.y * P.w + p.x);

describe("the hint's plan", () => {
  it("solves every generated board, and COMPLETE certifies it", () => {
    for (const seed of ["plan-a", "plan-b", "plan-c"]) {
      const state = generate(seed);
      const grid = state.grid.slice();
      for (const step of stepsOf(state)) {
        const { index, fill } = decided(step);
        expect(grid[index]).toBe(0); // never re-paints a filled cell
        grid[index] = fill;
      }
      expect(clustersStatus(grid, P.w, P.h)).toBe(COMPLETE);
    }
  });

  it("is recompute-stable: applying the first move leaves the rest of the plan", () => {
    // Only the first: a plan takes the firing beside its last step, and a
    // fresh one has no last step, so after two moves it may start elsewhere
    // among firings as easy (as Bricks' twin test holds it).
    const state = generate("plan-a");
    const plan = stepsOf(state);
    const replan = stepsOf(clustersGame.executeMove(state, plan[0].move));
    expect(replan.map((s) => s.move)).toEqual(plan.slice(1).map((s) => s.move));
  });

  it("a surrounded-at-target firing really has every neighbor the forced color", () => {
    const hit = findDeduction("refute.selfSurrounded");
    for (const n of neighborsOf(hit.index, P.w, P.h)) {
      expect(hit.grid[n] & COLMASK).toBe(hit.fill);
    }
  });

  it("a reachTwo-at-target firing: the refuted color really cannot reach two", () => {
    const hit = findDeduction("refute.selfReach");
    // At most one neighbor could ever share the refuted color.
    const friendly = neighborsOf(hit.index, P.w, P.h).filter(
      (n) => hit.grid[n] === 0 || (hit.grid[n] & COLMASK) === hit.refuted,
    );
    expect(friendly.length).toBeLessThanOrEqual(1);
  });

  it("a dotOvercount firing: the danger dot is adjacent and already has its one", () => {
    const hit = findDeduction("refute.dotOvercount");
    const [dot] = outlinedOf(hit.step);
    expect(neighborsOf(hit.index, P.w, P.h)).toContain(dot);
    expect(hit.grid[dot] & F_SINGLE).toBeTruthy();
    expect(hit.grid[dot] & COLMASK).toBe(hit.refuted);
    expect(sameNeighbors(hit.grid, dot, P.w, P.h)).toBe(1);
  });

  it.each([
    "refute.nearSurrounded",
    "refute.nearReach",
  ] as const)("a %s firing: the outlined tile is a neighbor with the forced color", (kind) => {
    const hit = findDeduction(kind);
    const [tile] = outlinedOf(hit.step);
    expect(neighborsOf(hit.index, P.w, P.h)).toContain(tile);
    expect(hit.grid[tile] & COLMASK).toBe(hit.fill);
  });

  it.each([
    "countFull",
    "countShort",
  ] as const)("a %s firing: the cell is a neighbor of the first tile that the shared squares leave out, and the answer's color", (kind) => {
    const hit = findDeduction(kind);
    const tiles = outlinedOf(hit.step);
    expect(tiles).toHaveLength(2);
    for (const t of tiles) expect(hit.grid[t] & COLMASK).not.toBe(0);
    // The first tile is the one beside the cell; the second does not touch it.
    const [a, b] = neighborsOf(tiles[0], P.w, P.h).includes(hit.index)
      ? tiles
      : [tiles[1], tiles[0]];
    expect(neighborsOf(a, P.w, P.h)).toContain(hit.index);
    expect(neighborsOf(b, P.w, P.h)).not.toContain(hit.index);
    const solved = clustersGame.solve?.(hit.state, hit.state);
    if (!solved?.ok || solved.move.kind !== "solve") throw new Error("no answer");
    expect(solved.move.fills[hit.index]).toBe(hit.fill);
  });
});

describe("hint", () => {
  it("narrates each reason kind with its rule and highlights the danger tile", () => {
    const state = generate("plan-a");
    const res = clustersGame.hint?.(state);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    for (const step of res.steps as Step[]) {
      const { index, fill } = decided(step);
      const outlined = outlinedOf(step);
      expect(stepMarks(step).of("ring", CELL)).toEqual([
        { x: index % P.w, y: Math.floor(index / P.w) },
      ]);
      if (step.rung.startsWith("count")) {
        expect(step.explanation).toMatch(
          /must also touch|allows (?:no|at most \w+) \w+ beside/,
        );
        expect(outlined).toHaveLength(2);
      } else if (step.rung === "refute.dotOvercount") {
        expect(step.explanation).toMatch(
          new RegExp(
            `already touches its one (?:${TWO_NAMES.map((w) => w.light).join("|")}) tile`,
          ),
        );
        expect(outlined).toHaveLength(1);
      } else if (step.rung === "refute.nearSurrounded") {
        expect(step.explanation).toContain("seal");
      } else if (step.rung === "refute.selfReach" || step.rung === "refute.nearReach") {
        expect(step.explanation).toContain("touch two");
      }
      // "outlined" is uttered iff a ring is on display.
      expect(step.explanation.includes("outlined")).toBe(outlined.length > 0);

      // A bare "this cell" points at nothing once a *second* mark is on the
      // board, so wherever one exists the sentence must tie the target to it,
      // and the tie is geometric rather than a color name (`hints.md`: color is
      // never the only cue). `beside this cell` / `its outlined … neighbor` for
      // the adjacent break; for a count, "this cell" is the first tile's
      // neighbor that does not touch the second.
      if (outlined.length > 0) {
        expect(
          /beside this cell|its outlined \w+ neighbor|from it|also touch|beside the/.test(
            step.explanation,
          ),
          `${step.explanation} — a second mark is shown but "this cell" is not tied to it`,
        ).toBe(true);
      }
      // The conclusion names the forced color in the necessity voice, in the
      // palette's word for the piece the cell is drawn as.
      expect(step.explanation).toContain(
        `must be ${TWO_NAMES[fill === F_COLOR_0 ? 1 : 0].light}`,
      );
    }
  });

  it("counts a solved board as finished, so the midend refuses it", () => {
    const state = generate("plan-a");
    const solved = clustersGame.solve?.(state, state);
    if (!solved?.ok) throw new Error("solve refused");
    expect(clustersGame.status(clustersGame.executeMove(state, solved.move))).toBe(
      "solved",
    );
  });

  it("flags a rule-violating board, so the midend refuses it", () => {
    // Painting the refuted color of a refutation trips the rule immediately,
    // so findMistakes flags it.
    const hit = findDeduction("refute.selfReach");
    // The firing's board, with the refuted move made for real.
    const grid = hit.grid.slice();
    grid[hit.index] = hit.refuted;
    expect(
      clustersGame.findMistakes?.({ ...hit.state, grid }).length ?? 0,
    ).toBeGreaterThan(0);
  });

  it("names the tile on a wrong-but-locally-clean board", () => {
    // Painting a *count* firing's refuted color breaks no local rule (the
    // contradiction needs the two counts), so only the answer can say which
    // tile is wrong, and the midend then never asks the hint about the board.
    const hit = findDeduction("countFull");
    const grid = hit.grid.slice();
    grid[hit.index] = hit.refuted;
    const wrong: ClustersState = { ...hit.state, grid };
    expect(findErrors(grid, wrong.w, wrong.h)).toEqual([]);
    expect(clustersGame.findMistakes?.(wrong).map((m) => m.index)).toEqual([hit.index]);
  });
});

describe("hintKeepTrack", () => {
  const state = generate("plan-a");
  // A step is shrunk in place by a followed move, so each check takes its own.
  const fresh = (): Step => stepsOf(state)[0];
  const { index, fill } = decided(fresh());
  const other = fill === F_COLOR_0 ? F_COLOR_1 : F_COLOR_0;
  const track = clustersGame.hintKeepTrack;
  const elsewhere = state.grid.findIndex((tile, i) => tile === 0 && i !== index);

  it("completes on exactly the hinted paint", () => {
    expect(track?.({ kind: "paint", cells: [{ index, fill }] }, fresh(), state)).toBe(
      "completed",
    );
  });

  it("drops the plan on the wrong color, wrong cell, or a multi-cell drag", () => {
    expect(
      track?.({ kind: "paint", cells: [{ index, fill: other }] }, fresh(), state),
    ).toBe("off");
    expect(
      track?.({ kind: "paint", cells: [{ index: elsewhere, fill }] }, fresh(), state),
    ).toBe("off");
    expect(
      track?.(
        {
          kind: "paint",
          cells: [
            { index, fill },
            { index: elsewhere, fill },
          ],
        },
        fresh(),
        state,
      ),
    ).toBe("off");
  });
});

describe("hint through the midend", () => {
  it("shows a step, advances on the followed move, and walks to solved", () => {
    const midend = new Midend(clustersGame);
    expect(midend.newGameFromId(`${ID}#mid-walk`)).toBeNull();
    let refusal: string | null = null;
    for (let guard = 0; guard < 100 && !refusal; guard++) {
      refusal = midend.hint();
      if (refusal) break;
      const step = midend.activeHintStep();
      expect(step).not.toBeNull();
      if (!step) return;
      midend.playMoves([step.move]);
    }
    // The walk ends at the solved board's refusal — the only way out.
    expect(refusal).toContain("already solved");
  });
});

describe("hint rendering (tier 2.5)", () => {
  // The palette itself, before any frame. Every other assertion in this block
  // compares a recorded op's `color` against a `COL_*` **index**, which is a
  // proxy: two indices can resolve to one color, and a hint target in the
  // `COL_1` tile's blue would pass them all while looking like a placed tile
  // (`color-collide.test.ts` is advisory). This is the non-proxy form.
  it("every hint role is a color the board does not already use", () => {
    const palette = resolvePalette(clustersGame, [1, 1, 1]);
    const key = (i: number) => palette[i].join(",");
    // The ring's ink is the engine's, the first slot past the game's own.
    const ringInk = palette.length - 2;
    const roles = [ringInk, COL_HINT_CELL];
    for (const role of roles) {
      for (const tile of [COL_0, COL_1]) {
        expect(
          key(role),
          `hint role ${role} is the same color as tile ${tile}`,
        ).not.toBe(key(tile));
      }
    }
    // …and the hint roles are distinct from one another, so a target and its
    // evidence never collapse into one mark.
    expect(new Set(roles.map(key)).size).toBe(roles.length);
  });

  it("a direct hint frame rings the target", () => {
    const result = renderScenario({
      game: clustersGame,
      id: `${ID}#render-hint`,
      showHint: true,
    });
    expect(result.hint).toBeDefined();
    expectRing(result.recording.ops);
    expect(result.recording.ops).toMatchSnapshot();
  });

  it("a count frame rings both tiles it reads", () => {
    const result = renderPinnedHint(clustersGame, pinned("countFull"));
    const tiles = stepMarks(result.step).of("outline", CELL);
    expect(tiles).toHaveLength(2);
    const ops = result.recording.ops;
    // One thin ring round each tile, which is four bands: doubled, it would
    // cross the piece.
    const ts = PREFERRED_TILE_SIZE;
    const side = ts - 3;
    const rt = Math.max(2, Math.floor(ts / 12));
    for (const tile of tiles) {
      const px = tile.x * ts + border(ts) + 1;
      const py = tile.y * ts + border(ts) + 1;
      expect(
        ops.filter(
          (o) =>
            o.op === "rect" &&
            o.color === COL_HINT_CELL &&
            Math.min(o.w, o.h) === rt &&
            Math.max(o.w, o.h) === side &&
            (o.x === px || o.x === px + side - rt) &&
            (o.y === py || o.y === py + side - rt),
        ),
      ).toHaveLength(4);
    }
    expect(ops).toMatchSnapshot();
  });
});

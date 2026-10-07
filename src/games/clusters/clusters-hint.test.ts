/**
 * Clusters explained hint.
 *
 * Tier 1: the recording deduction pass (`deduceHintPlan`) — every reason kind
 * fires with a true, checkable premise; the plan solves the board; the plan is
 * recompute-stable; refusals are honest. Deductions are located by a
 * fixed-seed scan over generated boards (docs/games/hints.md § "Verifying a hint in-process"'s idiom) rather
 * than hand-crafted grids: the ≥2-same-neighbors rule makes small valid
 * mid-game boards fiddly to craft, and a property checked on a real firing is
 * the stronger assertion anyway.
 *
 * Tier 2.5: render-scenario frames — the COL_HINT target, the danger double
 * ring, and a chain's what-if marks all reach the canvas, plus a snapshot.
 *
 * Cross-game guards (resume walk, overlay-reaches-cache, narration form) run
 * from `engine/testing/hint-games.ts` enrollment, not here.
 */
import { describe, expect, it } from "vitest";
import { TWO_NAMES } from "../../engine/color/colors.ts";
import { CONTRADICTION_UNLOCALIZED } from "../../engine/hint-refusal.ts";
import { CELL, mark, phrase, stepMarks, unshaped } from "../../engine/hint-words.ts";
import { Midend } from "../../engine/midend.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderPinnedHint,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { BoxRaster } from "../../engine/testing/repaint-differential.ts";
import { type ClustersHintHighlights, clustersGame } from "./index.ts";
import { COL_0, COL_1, COL_HINT, COL_HINT_CELL, COL_HINT_DANGER } from "./render.ts";
import {
  type ClustersDeduction,
  type ClustersRuleKind,
  type ClustersRung,
  COMPLETE,
  clustersStatus,
  deduceHintPlan,
} from "./solver.ts";
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

/** The deduction the plan opens with on `state`, or null when it has none. */
function openingDeduction(state: ClustersState): ClustersDeduction | null {
  return deduceHintPlan(state.grid, state.w, state.h).deductions[0] ?? null;
}

/** A direct step whose refuted color breaks `rule`: at the hinted cell itself
 * when `atTarget`, which no step field says, so the opening deduction is
 * asked. */
const breaks =
  (rule: ClustersRuleKind, atTarget?: true) =>
  (step: { rung: ClustersRung }, state: ClustersState): boolean => {
    const d = openingDeduction(state);
    if (step.rung !== "direct" || d?.reason.at.kind !== rule) return false;
    return !atTarget || d.reason.at.cell === d.index;
  };

/** A position for each rung, for the rules a direct step's refuted color
 * breaks, and the chain step whose frame is asserted below. */
const pinned = describeHintPins({
  game: clustersGame,
  params: [P],
  kinds: {
    surroundedAtTarget: breaks("surrounded", true),
    reachTwoAtTarget: breaks("reachTwo", true),
    dotOvercount: breaks("dotOvercount"),
    // A what-if step that ends at a contradiction the frame can ring.
    chainWithDanger: (step) =>
      step.rung === "chain" && Boolean(step.highlights?.danger),
  },
  pins: {
    /** Held on 12 of 433 positions walked. */
    surroundedAtTarget: "7x7dt:bcAbeICacDCIaca",
    /** Held on 134 of 433 positions walked. */
    reachTwoAtTarget: "7x7dt:cGadAadGgKbb",
    /** Held on 128 of 433 positions walked. */
    dotOvercount: {
      id: "7x7dt:cGadAadGgKbb",
      moves: [{ kind: "paint", cells: [{ index: 3, fill: 1 }] }],
    },
    /** Held on 14 of 433 positions walked. */
    chainWithDanger: {
      id: "7x7dt:bcAbeICacDCIaca",
      moves:
        '[{"kind":"paint","cells":[{"index":0,"fill":1}]},{"kind":"paint","cells":[{"index":2,"fill":2}]},{"kind":"paint","cells":[{"index":3,"fill":2}]},{"kind":"paint","cells":[{"index":6,"fill":2}]},{"kind":"paint","cells":[{"index":8,"fill":2}]},{"kind":"paint","cells":[{"index":9,"fill":2}]},{"kind":"paint","cells":[{"index":10,"fill":2}]},{"kind":"paint","cells":[{"index":11,"fill":1}]},{"kind":"paint","cells":[{"index":13,"fill":2}]},{"kind":"paint","cells":[{"index":14,"fill":2}]},{"kind":"paint","cells":[{"index":15,"fill":2}]},{"kind":"paint","cells":[{"index":19,"fill":2}]},{"kind":"paint","cells":[{"index":20,"fill":2}]},{"kind":"paint","cells":[{"index":22,"fill":1}]},{"kind":"paint","cells":[{"index":23,"fill":1}]},{"kind":"paint","cells":[{"index":29,"fill":1}]},{"kind":"paint","cells":[{"index":42,"fill":2}]},{"kind":"paint","cells":[{"index":36,"fill":1}]},{"kind":"paint","cells":[{"index":43,"fill":2}]},{"kind":"paint","cells":[{"index":37,"fill":1}]},{"kind":"paint","cells":[{"index":30,"fill":1}]}]',
    },
    /** Held on 433 of 433 positions walked. */
    direct: "7x7dt:cGadAadGgKbb",
    /** Held on 347 of 433 positions walked. */
    chain: {
      id: "7x7dt:aBaCEjcAlEabAc",
      moves:
        '[{"kind":"paint","cells":[{"index":35,"fill":2}]},{"kind":"paint","cells":[{"index":44,"fill":1}]},{"kind":"paint","cells":[{"index":30,"fill":2}]},{"kind":"paint","cells":[{"index":36,"fill":2}]},{"kind":"paint","cells":[{"index":29,"fill":2}]},{"kind":"paint","cells":[{"index":28,"fill":2}]},{"kind":"paint","cells":[{"index":38,"fill":2}]},{"kind":"paint","cells":[{"index":31,"fill":2}]},{"kind":"paint","cells":[{"index":39,"fill":2}]},{"kind":"paint","cells":[{"index":32,"fill":2}]},{"kind":"paint","cells":[{"index":18,"fill":1}]},{"kind":"paint","cells":[{"index":17,"fill":1}]},{"kind":"paint","cells":[{"index":19,"fill":1}]},{"kind":"paint","cells":[{"index":23,"fill":2}]},{"kind":"paint","cells":[{"index":26,"fill":1}]},{"kind":"paint","cells":[{"index":47,"fill":1}]},{"kind":"paint","cells":[{"index":40,"fill":1}]},{"kind":"paint","cells":[{"index":48,"fill":1}]},{"kind":"paint","cells":[{"index":41,"fill":1}]}]',
    },
  },
});

/** A pinned position, the deduction its plan opens with, and the grid it
 * fires on. */
function findDeduction(kind: Parameters<typeof pinned>[0]): {
  d: ClustersDeduction;
  grid: Uint8Array;
  state: ClustersState;
} {
  const { state } = pinned(kind);
  const d = openingDeduction(state);
  if (!d) throw new Error(`${kind}: the plan has no deduction here`);
  return { d, grid: state.grid, state };
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

describe("deduceHintPlan", () => {
  it("solves every generated board, and COMPLETE certifies it", () => {
    for (const seed of ["plan-a", "plan-b", "plan-c"]) {
      const state = generate(seed);
      const plan = deduceHintPlan(state.grid, state.w, state.h);
      expect(plan.verdict).toBe(COMPLETE);
      const grid = state.grid.slice();
      for (const d of plan.deductions) {
        expect(grid[d.index]).toBe(0); // never re-paints a filled cell
        grid[d.index] = d.fill;
      }
      expect(clustersStatus(grid, P.w, P.h)).toBe(COMPLETE);
    }
  });

  it("is recompute-stable: applying the first move leaves the rest of the plan", () => {
    const state = generate("plan-a");
    const plan = deduceHintPlan(state.grid, state.w, state.h);
    const grid = state.grid.slice();
    for (let i = 0; i < Math.min(8, plan.deductions.length - 1); i++) {
      grid[plan.deductions[i].index] = plan.deductions[i].fill;
      const replan = deduceHintPlan(grid, state.w, state.h);
      expect(replan.deductions).toEqual(plan.deductions.slice(i + 1));
    }
  });

  it("a surrounded-at-target firing really has every neighbor the forced color", () => {
    const hit = findDeduction("surroundedAtTarget");
    for (const n of neighborsOf(hit.d.index, P.w, P.h)) {
      expect(hit.grid[n] & COLMASK).toBe(hit.d.fill);
    }
  });

  it("a reachTwo-at-target firing: the refuted color really cannot reach two", () => {
    const hit = findDeduction("reachTwoAtTarget");
    // At most one neighbor could ever share the refuted color.
    const friendly = neighborsOf(hit.d.index, P.w, P.h).filter(
      (n) => hit.grid[n] === 0 || (hit.grid[n] & COLMASK) === hit.d.refuted,
    );
    expect(friendly.length).toBeLessThanOrEqual(1);
  });

  it("a dotOvercount firing: the danger dot is adjacent and already has its one", () => {
    const hit = findDeduction("dotOvercount");
    if (hit.d.reason.kind !== "direct") throw new Error("not a direct firing");
    const dot = hit.d.reason.at.cell;
    expect(neighborsOf(hit.d.index, P.w, P.h)).toContain(dot);
    expect(hit.grid[dot] & F_SINGLE).toBeTruthy();
    expect(hit.grid[dot] & COLMASK).toBe(hit.d.refuted);
    expect(sameNeighbors(hit.grid, dot, P.w, P.h)).toBe(1);
  });

  it("a chain firing: what-if cells are empty, distinct, and the end is adjacent to the last mark", () => {
    const hit = findDeduction("chain");
    if (hit.d.reason.kind !== "chain") throw new Error("not a chain firing");
    const { steps, at } = hit.d.reason;
    expect(steps.length).toBeGreaterThan(0);
    const indices = steps.map((s) => s.index);
    expect(new Set(indices).size).toBe(indices.length);
    for (const s of steps) expect(hit.grid[s.index]).toBe(0);
    // The contradiction surfaces where the last hypothetical fill landed:
    // at that cell or one of its neighbors.
    const last = indices[indices.length - 1];
    expect([last, ...neighborsOf(last, P.w, P.h)]).toContain(at.cell);
  });
});

describe("hint", () => {
  it("narrates each reason kind with its rule and highlights the danger tile", () => {
    const state = generate("plan-a");
    const res = clustersGame.hint?.(state);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    const plan = deduceHintPlan(state.grid, state.w, state.h);
    res.steps.forEach((step, i) => {
      const d = plan.deductions[i];
      const hl = step.highlights as ClustersHintHighlights;
      expect(stepMarks(step).of("ring", CELL)).toEqual([
        { x: d.index % P.w, y: Math.floor(d.index / P.w) },
      ]);
      const kind = d.reason.at.kind;
      if (d.reason.kind === "chain") {
        expect(step.explanation).toMatch(
          new RegExp(`^Suppose this cell were (${TWO_NAMES.join("|")}):`),
        );
        expect(hl.chain.length).toBe(d.reason.steps.length);
      } else if (kind === "dotOvercount") {
        expect(step.explanation).toMatch(
          new RegExp(`already touches its one (?:${TWO_NAMES.join("|")}) tile`),
        );
        expect(hl.danger).toBeDefined();
      } else if (kind === "surrounded" && d.reason.at.cell !== d.index) {
        expect(step.explanation).toContain("seal");
      } else if (kind === "reachTwo") {
        expect(step.explanation).toContain("touch two");
      }
      // "outlined" is uttered iff the danger ring is on display.
      expect(step.explanation.includes("outlined")).toBe(hl.danger !== undefined);

      // A bare "this cell" points at nothing once a *second* mark is on the
      // board, so wherever one exists the sentence must tie the target to it,
      // and the tie is geometric rather than a color name (`hints.md`: color is
      // never the only cue). `beside this cell` / `its outlined … neighbor` for
      // the adjacent break, `from it` for a chain, whose break is adjacent to
      // the last link instead.
      const secondMark = hl.danger !== undefined || hl.chain.length > 0;
      if (secondMark) {
        expect(
          /beside this cell|its outlined \w+ neighbor|from it/.test(step.explanation),
          `${step.explanation} — a second mark is shown but "this cell" is not tied to it`,
        ).toBe(true);
      }
      // The conclusion names the forced color in the necessity voice, in the
      // palette's word for the piece the cell is drawn as.
      expect(step.explanation).toContain(
        `must be ${TWO_NAMES[d.fill === F_COLOR_0 ? 1 : 0]}`,
      );
    });
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
    // Painting the refuted color of a *direct* firing trips the rule
    // immediately, so findMistakes flags it.
    const hit = findDeduction("direct");
    // The firing's board, with the refuted move made for real.
    const grid = hit.grid.slice();
    grid[hit.d.index] = hit.d.refuted;
    expect(
      clustersGame.findMistakes?.({ ...hit.state, grid }).length ?? 0,
    ).toBeGreaterThan(0);
  });

  it("refuses honestly on a wrong-but-locally-clean board", () => {
    // Painting a *chain* firing's refuted color breaks no local rule (the
    // contradiction needs the lookahead), so findMistakes stays empty — but
    // the plan runs into the contradiction and the hint must say so, not
    // deduce onward from a doomed position.
    const hit = findDeduction("chain");
    const grid = hit.grid.slice();
    grid[hit.d.index] = hit.d.refuted;
    const wrong: ClustersState = { ...hit.state, grid };
    expect(clustersGame.findMistakes?.(wrong)).toHaveLength(0);
    const res = clustersGame.hint?.(wrong);
    expect(res?.ok).toBe(false);
    if (res?.ok !== false) return;
    expect(res.error).toBe(CONTRADICTION_UNLOCALIZED);
  });
});

describe("hintKeepTrack", () => {
  const step = {
    move: {
      kind: "paint",
      cells: [{ index: 5, fill: F_COLOR_0 as ClustersFill }],
    } as ClustersMove,
    rung: "direct" as const,
    explanation: "",
  };
  const state = {} as ClustersState;
  const track = clustersGame.hintKeepTrack;

  it("completes on exactly the hinted paint", () => {
    expect(
      track?.({ kind: "paint", cells: [{ index: 5, fill: F_COLOR_0 }] }, step, state),
    ).toBe("completed");
  });

  it("drops the plan on the wrong color, wrong cell, or a multi-cell drag", () => {
    expect(
      track?.({ kind: "paint", cells: [{ index: 5, fill: F_COLOR_1 }] }, step, state),
    ).toBe("off");
    expect(
      track?.({ kind: "paint", cells: [{ index: 6, fill: F_COLOR_0 }] }, step, state),
    ).toBe("off");
    expect(
      track?.(
        {
          kind: "paint",
          cells: [
            { index: 5, fill: F_COLOR_0 },
            { index: 6, fill: F_COLOR_0 },
          ],
        },
        step,
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
    const palette = clustersGame.colors([1, 1, 1]);
    const key = (i: number) => palette[i].join(",");
    const roles = [COL_HINT, COL_HINT_CELL, COL_HINT_DANGER];
    for (const role of roles) {
      for (const tile of [COL_0, COL_1]) {
        expect(
          key(role),
          `hint role ${role} is the same color as tile ${tile}`,
        ).not.toBe(key(tile));
      }
    }
    // …and the hint roles are distinct from one another, so a target, its
    // evidence and its contradiction never collapse into one mark.
    //
    // The chain ordinal is deliberately *not* a fourth role: it is drawn in
    // `COL_HINT_CELL` because a number saying where a cell falls in the chain is
    // an index into the evidence, not a premise of its own. Asserting that
    // identity is the point — two meanings arriving at one value down two routes
    // is what `palette.ts`'s two-layer split exists to prevent.
    expect(new Set(roles.map(key)).size).toBe(roles.length);
  });

  it("a direct hint frame paints the COL_HINT target", () => {
    const result = renderScenario({
      game: clustersGame,
      id: `${ID}#render-hint`,
      showHint: true,
    });
    expect(result.hint).toBeDefined();
    const ops = result.recording.ops;
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT)).toBe(true);
    expect(result.recording.ops).toMatchSnapshot();
  });

  it("a chain frame paints the what-if marks and the danger double ring", () => {
    const result = renderPinnedHint(clustersGame, pinned("chainWithDanger"));
    const { step } = result;
    const hl = step.highlights as ClustersHintHighlights;
    expect(hl.chain.length).toBeGreaterThan(0);
    const ops = result.recording.ops;
    // Every what-if cell is outlined COL_HINT_CELL and carries a small piece
    // of the color the hypothesis would force: smaller than any placed piece.
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT_CELL)).toBe(true);
    const width = (o: (typeof ops)[number]): number | null => {
      if (o.op === "circle" && o.fill === COL_0) return 2 * o.r;
      if (o.op !== "polygon" || o.fill !== COL_1) return null;
      const xs = o.points.map((p) => p[0]);
      return Math.max(...xs) - Math.min(...xs);
    };
    const widths = ops.map(width).filter((v): v is number => v !== null);
    expect(Math.min(...widths)).toBeLessThan(Math.max(...widths) / 2);
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT_DANGER)).toBe(true);

    // …and each carries its **ordinal**: an unordered set of shaded cells
    // cannot be checked against a narration that says they fall one after
    // another. Asserted as the exact set `1..n` rather than "some text was drawn", so a chain
    // that numbers only its first cell, numbers from 0, or repeats a digit
    // fails — the count is the guard that a snapshot re-baseline cannot erase.
    const digits = ops
      .flatMap((o) => (o.op === "text" && o.color === COL_HINT_CELL ? [o.text] : []))
      .sort();
    expect(digits).toEqual(
      Array.from({ length: hl.chain.length }, (_, i) => String(i + 1)).sort(),
    );

    expect(ops).toMatchSnapshot();
  });

  it("a chain cell whose outline side closes repaints, keeping its own overlay", () => {
    // The chain's outline joins neighboring cells, so a cell can keep its role,
    // color and ordinal while a neighbor joining it removes the side between
    // them — the one change the overlay bits cannot see.
    const state = generate("join-side");
    const ts = clustersGame.preferredTileSize ?? 32;
    const size = clustersGame.computeSize(P, ts);
    const palette = clustersGame.colors(DEFAULT_BACKGROUND);
    const step = (chain: ClustersHintHighlights["chain"]) => ({
      move: { kind: "paint", cells: [] } satisfies ClustersMove,
      rung: "chain" as const,
      explanation: "",
      words: unshaped(
        phrase`${mark.this("ring", CELL, [{ x: 0, y: 0 }], "cell")} and ${mark.the("outline", CELL, chain, "cell")}`,
        "evident",
      ),
      highlights: { chain } satisfies ClustersHintHighlights,
    });
    const alone = step([{ x: 3, y: 3, fill: F_COLOR_0, order: 1 }]);
    const joined = step([
      { x: 3, y: 3, fill: F_COLOR_0, order: 1 },
      { x: 2, y: 3, fill: F_COLOR_0, order: 2 },
    ]);
    const frame = (
      ds: ReturnType<typeof clustersGame.newDrawState>,
      hint: typeof alone,
    ) => {
      const rec = new RecordingDrawing(palette);
      clustersGame.redraw(
        rec,
        ds,
        null,
        state,
        0,
        clustersGame.newUi(state),
        0,
        0,
        hint,
      );
      return rec.ops;
    };

    const ds = clustersGame.newDrawState(state, ts);
    const warm = new BoxRaster(size.w, size.h);
    warm.apply(frame(ds, alone));
    warm.apply(frame(ds, joined));
    const fresh = new BoxRaster(size.w, size.h);
    fresh.apply(frame(clustersGame.newDrawState(state, ts), joined));

    // Known positive: the lone cell's left side is drawn in the first frame.
    const left = new BoxRaster(size.w, size.h);
    left.apply(frame(clustersGame.newDrawState(state, ts), alone));
    const differing = (a: BoxRaster, b: BoxRaster) =>
      [...a.px.keys()].filter((i) => a.px[i] !== b.px[i]).length;
    expect(differing(left, fresh)).toBeGreaterThan(0);
    expect(differing(warm, fresh), "pixels a warm canvas shows differently").toBe(0);
  });
});

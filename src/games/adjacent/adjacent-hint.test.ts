/**
 * Adjacent explained-hint tests.
 *
 * Tier 1 — the recording solver records a reason per technique and its
 * replayed placements complete a generated board; the narration speaks the
 * necessity voice and reads right at the value extremes; a bar strike marks only
 * its own cell; resume to solved. Tier 2.5 — a render-scenario snapshot of a
 * bar-elimination journey frame. What the edge-clue square's hint does
 * whatever its clue (populate, keep-track, refusals) is tested through Unequal.
 */
import { describe, expect, it } from "vitest";
import { newEdgeClueDesc } from "../../engine/edge-clue-latin/generator.ts";
import { COL_HINT_CELL, COL_PENCIL } from "../../engine/edge-clue-latin/render.ts";
import { recordEdgeClueDeductions } from "../../engine/edge-clue-latin/solver.ts";
import {
  DIFF_EXTREME,
  diffToLevel,
  type EdgeClueMove,
  type EdgeClueParams,
  type EdgeClueState,
  newState,
  newUi,
  status,
} from "../../engine/edge-clue-latin/state.ts";
import { randomNew } from "../../engine/random/index.ts";
import {
  describeHintKindPins,
  describeHintPins,
} from "../../engine/testing/hint-positions.ts";
import { expectContour } from "../../engine/testing/mark-shape.ts";
import {
  DEFAULT_BACKGROUND,
  renderPinnedHint,
} from "../../engine/testing/render-scenario.ts";
import { adjacentGame } from "./index.ts";
import type { HintReason } from "./solver.ts";
import { BARS } from "./state.ts";

function gen(p: EdgeClueParams, seed: string) {
  const { desc, aux } = newEdgeClueDesc(BARS, p, randomNew(seed));
  return { p, desc, aux, st: newState(BARS, p, desc) };
}

// biome-ignore lint/suspicious/noExplicitAny: structural access to hint highlights/move in tests.
type AnyStep = any;

const ADJ: EdgeClueParams = { order: 5, diff: "tricky" };

// --- tier 1: recording solver ----------------------------------------------

describe("adjacent recording solver", () => {
  it("records bar reasons and its placements complete the board", () => {
    const { st } = gen(ADJ, "rec-adjacent");
    const ops = recordEdgeClueDeductions(
      st.order,
      BARS,
      st.clueFlags,
      Uint8Array.from(st.grid),
      Math.min(diffToLevel(ADJ.diff), DIFF_EXTREME),
    );
    expect(ops.length).toBeGreaterThan(0);
    const kinds = new Set(ops.map((o) => (o.reason as HintReason).kind));
    // The bar's deduction is exercised.
    expect(kinds.has("adjacent")).toBe(true);

    // Replaying the placements reconstructs the full (unique) solution.
    const filled = Uint8Array.from(st.immutable);
    for (const op of ops)
      if (op.kind === "place") filled[op.y * st.order + op.x] = op.n;
    for (let i = 0; i < st.order * st.order; i++) expect(filled[i]).toBeGreaterThan(0);
  });
});

// --- tier 1: hint plan ------------------------------------------------------

describe("adjacent hint", () => {
  it("every deduction conclusion uses the necessity voice", () => {
    const { st } = gen(ADJ, "voice-adjacent");
    const populated = adjacentGame.executeMove(st, { type: "pencilAll" });
    const res = adjacentGame.hint?.(populated);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    // A strike concludes "we must cross out …" or "… cross them out"; a
    // placement "it can only be N"; never a bare "is/are/stays". (The populate
    // fill and the bulk obvious-clean are setup instructions, not deductions,
    // so they are exempt.)
    const modal = /can only|can't|must (be|go)/i;
    const isSetup = (s: (typeof res.steps)[number]) =>
      s.rung === "populate" || s.rung === "clean";
    for (const s of res.steps) {
      if (isSetup(s)) continue;
      expect(s.explanation).toMatch(modal);
    }
  });

  it("differ-by-1 narration reads correctly at the value extremes", () => {
    // The bar must never say "N−1 or N+1" (wrong at N=1 or N=o); it says "one
    // away from N".
    const { st } = gen(ADJ, "adj-extreme");
    const populated = adjacentGame.executeMove(st, { type: "pencilAll" });
    const res = adjacentGame.hint?.(populated);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    for (const s of res.steps) {
      expect(s.explanation).not.toMatch(/-\s*1 or|\+\s*1/);
    }
  });

  it("a bar-strike step's marks all lie in its narrated cell (no bleed)", () => {
    let checked = 0;
    for (let s = 0; s < 8; s++) {
      const { st } = gen(ADJ, `bleed-adjacent-${s}`);
      const res = adjacentGame.hint?.(st);
      if (!res?.ok) continue;
      for (const step of res.steps as AnyStep[]) {
        if (step.move.type !== "pencilStrike") continue;
        const marks = step.move.marks as { x: number; y: number; n: number }[];
        // A bar strike (adjacent/adjacentSet) shades two evidence cells and
        // acts on exactly one of them; every mark is in that one cell.
        // Basic-Latin/dup steps shade ≤1 cell; a set outlines the cells that
        // account for what it strikes, which lie outside them.
        const area: { x: number; y: number }[] = step.highlights?.area ?? [];
        if (area.length !== 2 || step.rung === "set") continue;
        const cells = new Set(marks.map((m) => `${m.x},${m.y}`));
        expect(cells.size).toBe(1);
        for (const m of marks) {
          expect(area.some((a) => a.x === m.x && a.y === m.y)).toBe(true);
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
});

// --- tier 1: resume to solved ------------------------------------------------

describe("adjacent hint resumes to solved", () => {
  it("completes a fresh board one recomputed hint at a time", () => {
    const { st: start, aux } = gen(ADJ, "resume-adjacent");
    let state = start;
    for (let moves = 0; moves < 600; moves++) {
      if (status(state) === "solved") return;
      const res = adjacentGame.hint?.(state, aux);
      expect(res?.ok).toBe(true);
      if (!res?.ok) throw new Error(`gave up: ${res?.error}`);
      state = adjacentGame.executeMove(state, res.steps[0].move);
    }
    throw new Error("did not converge");
  });
});

// --- tier 2.5: render ------------------------------------------------------

const strikes = (step: AnyStep): number =>
  step.move.type === "pencilStrike" ? step.move.marks.length : 0;

/** How many of a board's cells carry a clue, which splits the boards a scan
 * deals in two. */
const clueSum = (s: EdgeClueState): number => s.clueFlags.filter((f) => f !== 0).length;

/**
 * Every rung on a position whose plan speaks it. A plan is asked under one
 * reading of the note-less cells, and `populate` and `note` are each spoken
 * under one of the two, so the boards are split between them. The wing fires
 * on no 5x5 Hard board the scan deals, so the Hard cell is the menu's 7x7.
 */
describeHintPins({
  game: adjacentGame,
  params: [ADJ, { order: 7, diff: "extreme" }],
  ui: (s) => ({
    ...newUi(s),
    candidateReading: clueSum(s) % 2 === 0 ? "populate" : "implicit",
  }),
  pins: {
    populate:
      "5dk:0D,0RD,0DL,0,5,0UD,0U,0UR,0L,0,0UD,0D,1,0RD,0DL,0U,0URD,0L,0UR,0UL,0,0UR,0L,0,0,",
    clean:
      "5dk:0D,0RD,0DL,0,5,0UD,0U,0UR,0L,0,0UD,0D,1,0RD,0DL,0U,0URD,0L,0UR,0UL,0,0UR,0L,0,0,",
    /** Held on 337 of 2546 positions walked. */
    note: {
      id: "5dk:0R,0DL,0RD,0L,0,0,0UR,0UDL,0D,0,0RD,0L,0UD,0UR,0L,0U,0R,0URDL,0RL,0DL,2,0,0U,0,0U,",
      moves:
        '[{"type":"pencilAdd","marks":[{"x":0,"y":3,"n":4},{"x":0,"y":3,"n":5}]},{"type":"pencilAdd","marks":[{"x":1,"y":4,"n":4},{"x":1,"y":4,"n":5}]}]',
    },
    dup: "5dk:0D,0RD,0DL,0,5,0UD,0U,0UR,0L,0,0UD,0D,1,0RD,0DL,0U,0URD,0L,0UR,0UL,0,0UR,0L,0,0,",
    single:
      "5dk:0D,0RD,0DL,0,5,0UD,0U,0UR,0L,0,0UD,0D,1,0RD,0DL,0U,0URD,0L,0UR,0UL,0,0UR,0L,0,0,",
    /** Held on 866 of 2546 positions walked. */
    regionsFull: {
      id: "5dk:0D,1,0D,0,0,0UR,0L,0URD,0L,0,0,0RD,0UL,0R,0DL,0D,0U,0D,0D,0U,0U,0R,0URL,0UL,1,",
      moves:
        '[{"type":"pencilAdd","marks":[{"x":2,"y":0,"n":3},{"x":2,"y":0,"n":4},{"x":2,"y":0,"n":5}]},{"type":"pencilAdd","marks":[{"x":1,"y":1,"n":3},{"x":1,"y":1,"n":4},{"x":1,"y":1,"n":5}]},{"type":"pencilAdd","marks":[{"x":0,"y":0,"n":3},{"x":0,"y":0,"n":4},{"x":0,"y":0,"n":5}]},{"type":"pencilAdd","marks":[{"x":4,"y":3,"n":3},{"x":4,"y":3,"n":4},{"x":4,"y":3,"n":5}]},{"type":"pencilAdd","marks":[{"x":3,"y":4,"n":3},{"x":3,"y":4,"n":4},{"x":3,"y":4,"n":5}]},{"type":"pencilAdd","marks":[{"x":0,"y":1,"n":2},{"x":0,"y":1,"n":3},{"x":0,"y":1,"n":4},{"x":0,"y":1,"n":5}]},{"type":"pencilAdd","marks":[{"x":2,"y":1,"n":1},{"x":2,"y":1,"n":2},{"x":2,"y":1,"n":3},{"x":2,"y":1,"n":5}]},{"type":"pencilAdd","marks":[{"x":1,"y":2,"n":2},{"x":1,"y":2,"n":3},{"x":1,"y":2,"n":5}]},{"type":"pencilAdd","marks":[{"x":2,"y":2,"n":1},{"x":2,"y":2,"n":2},{"x":2,"y":2,"n":3},{"x":2,"y":2,"n":4}]},{"type":"pencilAdd","marks":[{"x":1,"y":3,"n":2},{"x":1,"y":3,"n":3},{"x":1,"y":3,"n":4}]},{"type":"pencilAdd","marks":[{"x":2,"y":3,"n":1},{"x":2,"y":3,"n":2},{"x":2,"y":3,"n":4},{"x":2,"y":3,"n":5}]},{"type":"pencilAdd","marks":[{"x":1,"y":4,"n":2},{"x":1,"y":4,"n":4},{"x":1,"y":4,"n":5}]},{"type":"pencilAdd","marks":[{"x":0,"y":3,"n":1},{"x":0,"y":3,"n":2},{"x":0,"y":3,"n":4},{"x":0,"y":3,"n":5}]},{"type":"pencilAdd","marks":[{"x":2,"y":4,"n":3},{"x":2,"y":4,"n":4},{"x":2,"y":4,"n":5}]},{"type":"pencilAdd","marks":[{"x":3,"y":0,"n":2},{"x":3,"y":0,"n":3},{"x":3,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":2,"y":1,"n":1}]},{"type":"set","x":3,"y":1,"n":1,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":3,"y":0,"n":2}]},{"type":"pencilAdd","marks":[{"x":3,"y":2,"n":3},{"x":3,"y":2,"n":4},{"x":3,"y":2,"n":5}]},{"type":"pencilStrike","marks":[{"x":2,"y":1,"n":3},{"x":2,"y":1,"n":5}]},{"type":"set","x":2,"y":1,"n":2,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":2},{"x":2,"y":2,"n":2},{"x":2,"y":3,"n":2}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":4},{"x":2,"y":0,"n":5}]},{"type":"set","x":2,"y":0,"n":3,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":3},{"x":3,"y":0,"n":3},{"x":2,"y":2,"n":3},{"x":2,"y":4,"n":3}]},{"type":"set","x":3,"y":0,"n":5,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":5},{"x":3,"y":2,"n":5},{"x":3,"y":4,"n":5}]},{"type":"set","x":0,"y":0,"n":4,"pencil":false,"autoElim":false}]',
    },
    hiddenSingle: {
      id: "5dk:2,0RD,0L,0,0,0RD,0UL,0R,0RDL,0DL,0U,0,0R,0URDL,0UL,0,0RD,0L,0UR,0DL,0R,0UL,0,1,0U,",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":2},{"x":2,"y":0,"n":2},{"x":3,"y":0,"n":1},{"x":3,"y":0,"n":2},{"x":4,"y":0,"n":2},{"x":0,"y":1,"n":2},{"x":3,"y":1,"n":1},{"x":0,"y":2,"n":2},{"x":3,"y":2,"n":1},{"x":0,"y":3,"n":2},{"x":3,"y":3,"n":1},{"x":0,"y":4,"n":1},{"x":0,"y":4,"n":2},{"x":1,"y":4,"n":1},{"x":2,"y":4,"n":1},{"x":4,"y":4,"n":1}]},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":1},{"x":1,"y":0,"n":3}]},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":1},{"x":0,"y":1,"n":3}]},{"type":"pencilStrike","marks":[{"x":3,"y":3,"n":2}]},{"type":"pencilStrike","marks":[{"x":4,"y":4,"n":2}]},{"type":"pencilStrike","marks":[{"x":2,"y":4,"n":2}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":1}]}]',
    },
    /** Held on 675 of 2546 positions walked. */
    set: {
      id: "5dk:0,0,0,0,0,1,0D,0RD,0L,0,0RD,0UL,0U,0,0,0U,0D,0D,0,3,0R,0UL,0UR,0L,0,",
      moves:
        '[{"type":"pencilAdd","marks":[{"x":0,"y":0,"n":3},{"x":0,"y":0,"n":4},{"x":0,"y":0,"n":5}]},{"type":"pencilAdd","marks":[{"x":1,"y":1,"n":3},{"x":1,"y":1,"n":4},{"x":1,"y":1,"n":5}]},{"type":"pencilAdd","marks":[{"x":0,"y":2,"n":3},{"x":0,"y":2,"n":4},{"x":0,"y":2,"n":5}]},{"type":"pencilAdd","marks":[{"x":4,"y":2,"n":1},{"x":4,"y":2,"n":5}]},{"type":"pencilAdd","marks":[{"x":4,"y":4,"n":1},{"x":4,"y":4,"n":5}]},{"type":"pencilAdd","marks":[{"x":3,"y":3,"n":1},{"x":3,"y":3,"n":5}]},{"type":"pencilAdd","marks":[{"x":1,"y":0,"n":1},{"x":1,"y":0,"n":2},{"x":1,"y":0,"n":3},{"x":1,"y":0,"n":5}]},{"type":"pencilAdd","marks":[{"x":1,"y":2,"n":2},{"x":1,"y":2,"n":3},{"x":1,"y":2,"n":4},{"x":1,"y":2,"n":5}]},{"type":"pencilAdd","marks":[{"x":2,"y":1,"n":2},{"x":2,"y":1,"n":3},{"x":2,"y":1,"n":5}]},{"type":"pencilAdd","marks":[{"x":3,"y":1,"n":2},{"x":3,"y":1,"n":3},{"x":3,"y":1,"n":4}]},{"type":"pencilAdd","marks":[{"x":2,"y":2,"n":1},{"x":2,"y":2,"n":2},{"x":2,"y":2,"n":3},{"x":2,"y":2,"n":4}]},{"type":"pencilAdd","marks":[{"x":3,"y":0,"n":1},{"x":3,"y":0,"n":2},{"x":3,"y":0,"n":4},{"x":3,"y":0,"n":5}]},{"type":"pencilAdd","marks":[{"x":3,"y":2,"n":1},{"x":3,"y":2,"n":2},{"x":3,"y":2,"n":4},{"x":3,"y":2,"n":5}]}]',
    },
    /** Held on 67 of 2546 positions walked. */
    wing: {
      id: "6dx:0RD,0L,0,0R,0RDL,0L,0U,0D,0R,0L,0U,0,0R,0URL,0L,0RD,0L,1,0RD,0L,0R,0UL,0R,0L,0U,0D,0R,0RL,0DL,2,0,0U,0R,0L,0U,0,",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":5,"y":0,"n":1},{"x":5,"y":0,"n":2},{"x":5,"y":1,"n":1},{"x":5,"y":1,"n":2},{"x":0,"y":2,"n":1},{"x":1,"y":2,"n":1},{"x":2,"y":2,"n":1},{"x":3,"y":2,"n":1},{"x":4,"y":2,"n":1},{"x":5,"y":3,"n":1},{"x":5,"y":3,"n":2},{"x":0,"y":4,"n":2},{"x":1,"y":4,"n":2},{"x":2,"y":4,"n":2},{"x":3,"y":4,"n":2},{"x":4,"y":4,"n":2},{"x":5,"y":5,"n":1},{"x":5,"y":5,"n":2}]},{"type":"pencilStrike","marks":[{"x":4,"y":2,"n":2}]},{"type":"pencilStrike","marks":[{"x":5,"y":3,"n":3}]},{"type":"pencilStrike","marks":[{"x":5,"y":5,"n":3}]},{"type":"pencilStrike","marks":[{"x":4,"y":4,"n":1},{"x":4,"y":4,"n":3}]},{"type":"pencilStrike","marks":[{"x":0,"y":3,"n":1}]},{"type":"pencilStrike","marks":[{"x":1,"y":5,"n":1}]},{"type":"pencilStrike","marks":[{"x":3,"y":4,"n":1}]},{"type":"pencilStrike","marks":[{"x":2,"y":4,"n":1}]},{"type":"pencilStrike","marks":[{"x":4,"y":3,"n":5}]},{"type":"pencilStrike","marks":[{"x":5,"y":3,"n":6}]},{"type":"pencilStrike","marks":[{"x":4,"y":5,"n":1},{"x":4,"y":5,"n":2}]},{"type":"pencilStrike","marks":[{"x":4,"y":0,"n":1}]},{"type":"pencilStrike","marks":[{"x":4,"y":3,"n":1},{"x":4,"y":3,"n":2}]},{"type":"pencilStrike","marks":[{"x":4,"y":5,"n":5}]},{"type":"pencilStrike","marks":[{"x":4,"y":4,"n":6}]},{"type":"pencilStrike","marks":[{"x":4,"y":3,"n":4}]},{"type":"set","x":4,"y":1,"n":1,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":1},{"x":1,"y":1,"n":1},{"x":2,"y":1,"n":1},{"x":3,"y":1,"n":1}]},{"type":"pencilStrike","marks":[{"x":4,"y":0,"n":3},{"x":4,"y":0,"n":4},{"x":4,"y":0,"n":5},{"x":4,"y":0,"n":6}]},{"type":"set","x":4,"y":0,"n":2,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":2},{"x":1,"y":0,"n":2},{"x":2,"y":0,"n":2},{"x":3,"y":0,"n":2}]},{"type":"pencilStrike","marks":[{"x":5,"y":0,"n":4},{"x":5,"y":0,"n":5},{"x":5,"y":0,"n":6}]},{"type":"set","x":5,"y":0,"n":3,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":3},{"x":1,"y":0,"n":3},{"x":2,"y":0,"n":3},{"x":3,"y":0,"n":3},{"x":5,"y":1,"n":3}]},{"type":"pencilStrike","marks":[{"x":3,"y":0,"n":4},{"x":3,"y":0,"n":5},{"x":3,"y":0,"n":6}]},{"type":"set","x":3,"y":0,"n":1,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":1},{"x":1,"y":0,"n":1},{"x":2,"y":0,"n":1},{"x":3,"y":3,"n":1},{"x":3,"y":5,"n":1}]},{"type":"pencilStrike","marks":[{"x":3,"y":1,"n":2}]},{"type":"pencilStrike","marks":[{"x":5,"y":1,"n":4}]},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":2}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":5}]},{"type":"pencilStrike","marks":[{"x":1,"y":2,"n":6}]},{"type":"pencilStrike","marks":[{"x":2,"y":1,"n":5}]},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":3,"y":1,"n":6}]},{"type":"pencilStrike","marks":[{"x":3,"y":2,"n":4}]},{"type":"set","x":0,"y":0,"n":5,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":5},{"x":0,"y":2,"n":5},{"x":0,"y":3,"n":5},{"x":0,"y":4,"n":5},{"x":0,"y":5,"n":5}]},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":3}]},{"type":"pencilStrike","marks":[{"x":1,"y":3,"n":6}]},{"type":"pencilStrike","marks":[{"x":0,"y":4,"n":6}]},{"type":"pencilStrike","marks":[{"x":0,"y":3,"n":6}]},{"type":"pencilStrike","marks":[{"x":0,"y":2,"n":3}]},{"type":"pencilStrike","marks":[{"x":1,"y":2,"n":2},{"x":1,"y":2,"n":4}]},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":3}]},{"type":"pencilStrike","marks":[{"x":2,"y":2,"n":3},{"x":2,"y":2,"n":5}]},{"type":"pencilStrike","marks":[{"x":1,"y":3,"n":4}]}]',
    },
    adjacent: {
      id: "5dk:0D,0RD,0DL,0,5,0UD,0U,0UR,0L,0,0UD,0D,1,0RD,0DL,0U,0URD,0L,0UR,0UL,0,0UR,0L,0,0,",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":5},{"x":1,"y":0,"n":5},{"x":2,"y":0,"n":1},{"x":2,"y":0,"n":5},{"x":3,"y":0,"n":5},{"x":2,"y":1,"n":1},{"x":4,"y":1,"n":5},{"x":0,"y":2,"n":1},{"x":1,"y":2,"n":1},{"x":3,"y":2,"n":1},{"x":4,"y":2,"n":1},{"x":4,"y":2,"n":5},{"x":2,"y":3,"n":1},{"x":4,"y":3,"n":5},{"x":2,"y":4,"n":1},{"x":4,"y":4,"n":5}]}]',
    },
    adjacentSet: {
      id: "5dk:0R,0DL,0RD,0L,0,0,0UR,0UDL,0D,0,0RD,0L,0UD,0UR,0L,0U,0R,0URDL,0RL,0DL,2,0,0U,0,0U,",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":2},{"x":0,"y":1,"n":2},{"x":0,"y":2,"n":2},{"x":0,"y":3,"n":2},{"x":1,"y":4,"n":2},{"x":2,"y":4,"n":2},{"x":3,"y":4,"n":2},{"x":4,"y":4,"n":2}]},{"type":"pencilStrike","marks":[{"x":0,"y":3,"n":1},{"x":0,"y":3,"n":3}]},{"type":"pencilStrike","marks":[{"x":1,"y":4,"n":1},{"x":1,"y":4,"n":3}]}]',
    },
  },
});

/** Positions on a board with every candidate penciled in first, a bar's
 * strike among them. */
const pinned = describeHintKindPins({
  game: adjacentGame,
  params: [ADJ],
  opening: (): EdgeClueMove[] => [{ type: "pencilAll" }],
  kinds: {
    barStrike: (step) =>
      strikes(step) > 0 && (step.rung === "adjacent" || step.rung === "adjacentSet"),
  },
  pins: {
    barStrike: {
      id: "5dk:0D,0RD,0DL,0,5,0UD,0U,0UR,0L,0,0UD,0D,1,0RD,0DL,0U,0URD,0L,0UR,0UL,0,0UR,0L,0,0,",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":5},{"x":1,"y":0,"n":5},{"x":2,"y":0,"n":1},{"x":2,"y":0,"n":5},{"x":3,"y":0,"n":5},{"x":2,"y":1,"n":1},{"x":4,"y":1,"n":5},{"x":0,"y":2,"n":1},{"x":1,"y":2,"n":1},{"x":3,"y":2,"n":1},{"x":4,"y":2,"n":1},{"x":4,"y":2,"n":5},{"x":2,"y":3,"n":1},{"x":4,"y":3,"n":5},{"x":2,"y":4,"n":1},{"x":4,"y":4,"n":5}]}]',
    },
  },
});

describe("adjacent hint render", () => {
  it("a bar's elimination outlines the pair and strikes the candidate", () => {
    const { recording } = renderPinnedHint(adjacentGame, pinned("barStrike"), {
      defaultBackground: DEFAULT_BACKGROUND,
    });
    expectContour(recording.ops, COL_HINT_CELL, 2);
    expect(recording.ops.some((o) => o.op === "line" && o.color === COL_PENCIL)).toBe(
      true,
    );
    expect(recording.ops).toMatchSnapshot();
  });
});

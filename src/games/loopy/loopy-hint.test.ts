/**
 * Loopy's hint: what the cross-game hint guards cannot say about it.
 *
 * `hint-resume.test.ts` walks Loopy's presets to solved, `hint-quality.test.ts`
 * holds its voice and length, and `hint-mark.test.ts` and `hint-overlay.test.ts`
 * its frames. This file holds the claims that are Loopy's own: every step agrees
 * with the solution on every tiling; the numbers a sentence states are the numbers
 * its marks show; a numbered chain is numbered 1 to n, once each; which premises
 * the corpus reaches; and the mistake check the hint's soundness rests on.
 */
import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { FIX_MISTAKES_FIRST } from "../../engine/hint-refusal.ts";
import { randomNew } from "../../engine/random/index.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import {
  deduceLoopyPlan,
  hintKeepTrack,
  type LoopyHint,
  refreshHintStep,
} from "./hint.ts";
import { say } from "./hint-text.ts";
import { type LoopyMove, loopyGame } from "./index.ts";
import {
  DIFF_EASY,
  DIFF_HARD,
  DIFF_NORMAL,
  DIFF_TRICKY,
  encodeParams,
  LOOPY_GRIDS,
  type LoopyParams,
} from "./params.ts";
import type { LoopyReason } from "./record.ts";
import { COL_HINT, COL_HINT_CELL, COL_MISTAKE, PREFERRED_TILE_SIZE } from "./render.ts";
import { uniqueSolution } from "./solver.ts";
import {
  LINE_NO,
  LINE_UNKNOWN,
  LINE_YES,
  type LineState,
  type LoopyState,
  newState,
} from "./state.ts";

interface Board {
  name: string;
  id: string;
  state: LoopyState;
}

function board(name: string, p: LoopyParams, seed: string): Board {
  const { desc } = loopyGame.newDesc(p, randomNew(`loopy-hint-${name}-${seed}`));
  return {
    name: `${name}/${seed}`,
    id: `${encodeParams(p, true)}:${desc}`,
    state: newState(p, desc),
  };
}

let corpusCache: Board[] | null = null;

/** Squares at every tier, and every tiling at Hard, where every rung is allowed:
 * the triangular grid, whose dots have the highest degree, and both aperiodic
 * families among them. */
function corpus(): Board[] {
  if (corpusCache) return corpusCache;
  const boards: Board[] = [];
  for (const diff of [DIFF_EASY, DIFF_NORMAL, DIFF_TRICKY, DIFF_HARD]) {
    for (const seed of ["a", "b"])
      boards.push(board(`squares-${diff}`, { w: 7, h: 7, diff, type: 0 }, seed));
  }
  LOOPY_GRIDS.forEach((grid, type) => {
    const size = Math.max(5, grid.amin);
    boards.push(board(grid.type, { w: size, h: size, diff: DIFF_HARD, type }, "a"));
  });
  corpusCache = boards;
  return boards;
}

const stepsOf = (state: LoopyState): HintStep<LoopyMove>[] => {
  const res = loopyGame.hint?.(state);
  if (!res?.ok) throw new Error(`loopy hint refused: ${res?.error}`);
  return res.steps;
};

const marksOf = (step: HintStep<LoopyMove>): LoopyHint => step.highlights as LoopyHint;

describe("Loopy hint: soundness on every tiling", () => {
  it("every step agrees with the solution, and following the plan finishes the board", () => {
    const tilings = new Set<string>();
    for (const b of corpus()) {
      const solution = uniqueSolution(b.state);
      expect(solution, `${b.name}: no unique solution`).not.toBeNull();
      if (solution === null) continue;
      let state = b.state;
      for (const [i, step] of stepsOf(b.state).entries()) {
        for (const op of step.move.ops) {
          expect(op.state, `${b.name} step ${i}: "${step.explanation}"`).toBe(
            solution[op.edge],
          );
        }
        state = loopyGame.executeMove(state, step.move);
      }
      expect(state.completed, `${b.name}: the plan stopped short`).toBe(true);
      tilings.add(b.name.split("/")[0]);
    }
    // Every tiling was walked, not only the ones that generated.
    for (const grid of LOOPY_GRIDS)
      expect(tilings.has(grid.type), grid.type).toBe(true);
  });
});

/** Every premise the hint can name, so adding one breaks compilation here until
 * the census below accounts for it. */
const REASONS: Record<LoopyReason["kind"], true> = {
  clueFull: true,
  clueStarved: true,
  clueOneShort: true,
  deadEnd: true,
  lineContinues: true,
  dotFull: true,
  clueBound: true,
  corner: true,
  cornerExit: true,
  matchingPair: true,
  parity: true,
  related: true,
  earlyLoop: true,
  closesLoop: true,
};

/** Premises no board in the corpus fires, each with why. Their sentences are read
 * by the direct tests further down, since no walk reaches them. */
const UNREACHED: Partial<Record<LoopyReason["kind"], string>> = {
  related:
    "The edge dsf's propagation step settles an edge from a related one whose state is known; a rung below it, or parity on three open edges, always settles the edge first.",
  closesLoop:
    "An edge closing a loop that meets every clue: on a uniquely solvable board the clue and dot rules draw that last edge before the loop rung looks at it.",
};

describe("Loopy hint: the premises the corpus reaches", () => {
  it("fires every premise it names, except the ledgered ones", () => {
    const reached = new Set<string>();
    for (const b of corpus()) {
      for (const p of deduceLoopyPlan(b.state).plan) reached.add(p.reason.kind);
    }
    const unreached = Object.keys(REASONS).filter((k) => !reached.has(k));
    expect(unreached.sort()).toEqual(Object.keys(UNREACHED).sort());
  });

  it("speaks the ledgered premises' sentences in the necessity voice", () => {
    expect(say.closesLoop).toMatch(/must be a line\.$/);
    expect(say.related(1, false, true, true)).toBe(
      "The numbered pair makes this edge match the marked line, so it must be a line.",
    );
    expect(say.related(2, true, false, true)).toBe(
      "The numbered pairs make this edge the opposite of the marked ruled-out edge, so it must be a line.",
    );
  });
});

describe("Loopy hint: the words and the marks agree", () => {
  it("a count leans on exactly the corners it marks, and the sentence states it", () => {
    let checked = 0;
    for (const b of corpus()) {
      const plan = deduceLoopyPlan(b.state).plan;
      const steps = stepsOf(b.state);
      expect(steps.length, b.name).toBe(plan.length);
      plan.forEach((p, i) => {
        if (p.reason.kind !== "clueBound") return;
        const { witness, face } = p.reason;
        const clue = b.state.clues[face];
        const line = p.ops[0].state === LINE_YES;
        expect(witness.edges.length + witness.corners.length, b.name).toBe(
          witness.total,
        );
        expect(witness.total, b.name).toBe(line ? clue - 1 : clue);
        expect(witness.corners.length, b.name).toBeGreaterThan(0);
        const marks = marksOf(steps[i]);
        const text = steps[i].explanation;
        expect(marks.faces).toEqual([face]);
        if (marks.corners.every((c) => c.labels.length === 0)) {
          // Explained in words: the marked corners are the count's corners.
          expect(marks.corners.length, `${b.name}: ${text}`).toBe(
            witness.corners.length,
          );
        } else {
          // Numbered: the count's own corners are the ones the sentence cites.
          const label = new Map(p.closure.map((id, k) => [id, k + 1]));
          for (const id of witness.corners) {
            expect(text, b.name).toMatch(new RegExp(`\\b${label.get(id)}\\b`));
          }
        }
        checked++;
      });
    }
    expect(checked, "the corpus reached no clue count").toBeGreaterThan(20);
  });

  it("a numbered chain is numbered 1 to n once each, and cites only numbers it draws", () => {
    let numbered = 0;
    let unnumbered = 0;
    for (const b of corpus()) {
      const plan = deduceLoopyPlan(b.state).plan;
      stepsOf(b.state).forEach((step, i) => {
        const marks = marksOf(step);
        const labels = [
          ...marks.corners.flatMap((c) => c.labels),
          ...marks.relations.map((r) => r.label),
        ].sort((x, y) => x - y);
        const cited = [...step.explanation.matchAll(/\d+/g)].map((m) => Number(m[0]));
        if (labels.length === 0) {
          if (marks.corners.length > 0) unnumbered++;
          expect(marks.relations, `${b.name}: a pair drawn without a number`).toEqual(
            [],
          );
          expect(step.explanation).not.toMatch(/numbered|corner \d/);
          return;
        }
        numbered++;
        expect(labels, `${b.name}: ${step.explanation}`).toEqual(
          plan[i].closure.map((_, k) => k + 1),
        );
        const drawn = new Set(labels);
        const corners = step.explanation.match(/corners? ([\d, and]+)/);
        for (const n of corners?.[1].match(/\d+/g)?.map(Number) ?? []) {
          expect(drawn.has(n), `${b.name}: cites corner ${n} it never draws`).toBe(
            true,
          );
        }
        expect(cited.length).toBeGreaterThan(0);
      });
    }
    expect(numbered, "the corpus reached no numbered chain").toBeGreaterThan(10);
    expect(
      unnumbered,
      "the corpus reached no corner explained in words",
    ).toBeGreaterThan(10);
  });

  it("every deictic word points at a mark of its kind", () => {
    const kinds = new Set<string>();
    for (const b of corpus()) {
      for (const step of stepsOf(b.state)) {
        const text = step.explanation;
        const marks = marksOf(step);
        const at = `${b.name}: "${text}"`;
        expect(marks.targets, at).toEqual(step.move.ops.map((o) => o.edge));
        if (/the ringed dot/i.test(text)) {
          expect(marks.dots, at).toHaveLength(1);
          kinds.add("dot");
        } else {
          expect(marks.dots, at).toEqual([]);
        }
        const clue = text.match(/[Tt]his (\d+)/);
        if (clue) {
          expect(marks.faces.length, at).toBeGreaterThan(0);
          expect(b.state.clues[marks.faces[0]], at).toBe(Number(clue[1]));
          kinds.add("clue");
        }
        if (/the marked corner/.test(text)) {
          expect(marks.corners.length, at).toBeGreaterThan(0);
          expect(
            marks.corners.every((c) => c.labels.length === 0),
            at,
          ).toBe(true);
          kinds.add("corner");
        }
        if (/the marked lines/.test(text)) {
          expect(marks.edges.length, at).toBeGreaterThan(0);
          kinds.add("lines");
        }
        if (/numbered pairs? /.test(text)) {
          expect(marks.relations.length, at).toBeGreaterThan(0);
          kinds.add("pairs");
        }
      }
    }
    expect([...kinds].sort()).toEqual(["clue", "corner", "dot", "lines", "pairs"]);
  });
});

describe("Loopy hint: following and refreshing a step", () => {
  /** A step setting two or more edges, with the board it applies to. */
  const multi = (): { state: LoopyState; step: HintStep<LoopyMove> } => {
    for (const b of corpus()) {
      let state = b.state;
      for (const step of stepsOf(b.state)) {
        if (step.move.ops.length >= 2) return { state, step };
        state = loopyGame.executeMove(state, step.move);
      }
    }
    throw new Error("no multi-edge step in the corpus");
  };

  it("completes on every edge set, tracks a subset, and drops anything else", () => {
    const { state, step } = multi();
    const [first, second] = step.move.ops;
    const set = (ops: { edge: number; state: LineState }[]): LoopyMove => ({
      kind: "set",
      ops,
    });
    expect(hintKeepTrack(set([first]), step, state)).toBe("onTrack");
    expect(hintKeepTrack(set([...step.move.ops]), step, state)).toBe("completed");
    const flipped = (first.state === LINE_YES ? LINE_NO : LINE_YES) as LineState;
    expect(
      hintKeepTrack(set([{ edge: first.edge, state: flipped }]), step, state),
    ).toBe("off");
    const other = state.lines.findIndex(
      (l, e) => l === LINE_UNKNOWN && !step.move.ops.some((o) => o.edge === e),
    );
    expect(hintKeepTrack(set([{ edge: other, state: LINE_YES }]), step, state)).toBe(
      "off",
    );

    const after = loopyGame.executeMove(state, set([first]));
    const refreshed = refreshHintStep(step, after);
    expect(refreshed?.move.ops.map((o) => o.edge)).toEqual(
      step.move.ops.slice(1).map((o) => o.edge),
    );
    expect(second.edge).toBe(refreshed?.move.ops[0].edge);
    expect(refreshHintStep(step, loopyGame.executeMove(state, step.move))).toBeNull();
  });
});

describe("Loopy mistakes", () => {
  const wrongMark = (b: Board, line: LineState): { move: LoopyMove; edge: number } => {
    const solution = uniqueSolution(b.state);
    if (solution === null) throw new Error("no solution");
    const edge = solution.findIndex((s) => s !== line);
    return { move: { kind: "set", ops: [{ edge, state: line }] }, edge };
  };

  it("reports a line the loop does not use, and refuses the hint", () => {
    const b = corpus()[0];
    const { move, edge } = wrongMark(b, LINE_YES);
    const solution = uniqueSolution(b.state) ?? new Uint8Array();
    const right = solution.findIndex((s) => s === LINE_YES);
    const state = loopyGame.executeMove(loopyGame.executeMove(b.state, move), {
      kind: "set",
      ops: [{ edge: right, state: LINE_YES }],
    });
    expect(loopyGame.findMistakes?.(state)).toEqual([{ edge }]);
    expect(loopyGame.hint?.(state)).toEqual({ ok: false, error: FIX_MISTAKES_FIRST });

    const frame = renderScenario({
      game: loopyGame,
      id: b.id,
      moves: [move],
      showMistakes: true,
    });
    expect(
      frame.recording.ops.some((o) => o.op === "line" && o.color === COL_MISTAKE),
    ).toBe(true);
  });

  it("crosses out a ruled-out edge the loop needs, even with faint lines off", () => {
    const b = corpus()[0];
    const { move, edge } = wrongMark(b, LINE_NO);
    const state = loopyGame.executeMove(b.state, move);
    const mistakes = loopyGame.findMistakes?.(state) ?? [];
    expect(mistakes).toEqual([{ edge }]);

    const dr = new RecordingDrawing(loopyGame.colors(DEFAULT_BACKGROUND));
    const ui = loopyGame.newUi(state);
    ui.drawFaintLines = false;
    const ds = loopyGame.newDrawState(state, PREFERRED_TILE_SIZE);
    loopyGame.redraw(dr, ds, null, state, 0, ui, 0, 0, undefined, mistakes);
    const red = dr.ops.filter((o) => o.op === "line" && o.color === COL_MISTAKE);
    // A cross: two strokes, and the edge's own faint line is not drawn at all.
    expect(red).toHaveLength(2);
  });
});

describe("Loopy hint frames", () => {
  /** The first step on a fixed-seed Hard board whose marks satisfy `want`. */
  function frame(want: (m: LoopyHint, text: string) => boolean) {
    for (let seed = 0; seed < 20; seed++) {
      const id = `${encodeParams({ w: 7, h: 7, diff: DIFF_HARD, type: 0 }, true)}#frame-${seed}`;
      const result = renderScenario({
        game: loopyGame,
        id,
        showHint: true,
        hintUntil: (s) => want(marksOf(s), s.explanation),
      });
      const step = result.hint;
      if (step && want(marksOf(step), step.explanation)) return { result, step };
    }
    throw new Error("no such step in 20 seeds");
  }

  it("bands the edges a step sets: solid for a line, broken for an edge that can't be one", () => {
    const line = frame((m, t) => m.targets.length === 1 && /must be a line\.$/.test(t));
    const empty = frame(
      (m, t) => m.targets.length === 1 && /can't be a line\.$/.test(t),
    );
    const bands = (ops: typeof line.result.recording.ops) =>
      ops.filter((o) => o.op === "line" && o.color === COL_HINT);
    expect(bands(line.result.recording.ops)).toHaveLength(1);
    expect(bands(empty.result.recording.ops)).toHaveLength(4);
  });

  it("draws a numbered chain's wedges and pairs, and every number on them", () => {
    const { result, step } = frame(
      (m) => m.relations.length > 0 && m.corners.some((c) => c.labels.length > 0),
    );
    const marks = marksOf(step);
    const ops = result.recording.ops;
    const texts = ops.flatMap((o) =>
      o.op === "text" && o.size < PREFERRED_TILE_SIZE / 2 ? [o.text] : [],
    );
    for (const c of marks.corners) expect(texts).toContain(c.labels.join(","));
    for (const r of marks.relations)
      expect(texts).toContain(`${r.label}${r.opposite ? "≠" : "="}`);
    const filled = ops.filter((o) => o.op === "polygon" && o.fill === COL_HINT_CELL);
    expect(filled).toHaveLength(marks.corners.filter((c) => c.atLeastOne).length);
    expect(ops).toMatchSnapshot();
  });
});

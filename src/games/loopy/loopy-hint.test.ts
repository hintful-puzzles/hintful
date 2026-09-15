/**
 * Loopy's hint: what the cross-game hint guards cannot say about it.
 *
 * `hint-resume.test.ts` walks Loopy's presets to solved, `hint-quality.test.ts`
 * holds its voice and length, and `hint-mark.test.ts` and `hint-overlay.test.ts`
 * its frames. This file holds the claims that are Loopy's own: every step, notes
 * included, agrees with the solution on every tiling; every note a step reasons
 * from is on the board when it is shown, which is the rule the notes exist for; the
 * words and the marks agree; which premises the corpus reaches; and the mistake
 * check the hint's soundness rests on.
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
import { dlineEnds } from "./dlines.ts";
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
import type { CornerWhy, LoopyReason, RelationWhy } from "./record.ts";
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

type Step = HintStep<LoopyMove>;

const stepsCache = new Map<LoopyState, Step[]>();

const stepsOf = (state: LoopyState): Step[] => {
  const cached = stepsCache.get(state);
  if (cached) return cached;
  const res = loopyGame.hint?.(state);
  if (!res?.ok) throw new Error(`loopy hint refused: ${res?.error}`);
  stepsCache.set(state, res.steps);
  return res.steps;
};

const marksOf = (step: Step): LoopyHint => step.highlights as LoopyHint;

/** The lines a move sets; a note move sets none. */
const opsOf = (move: LoopyMove): readonly { edge: number; state: LineState }[] =>
  move.kind === "set" ? move.ops : [];

/** Every step of every corpus plan, with the board it is shown on. */
function* walk(): Generator<{ b: Board; step: Step; state: LoopyState; i: number }> {
  for (const b of corpus()) {
    let state = b.state;
    for (const [i, step] of stepsOf(b.state).entries()) {
      yield { b, step, state, i };
      state = loopyGame.executeMove(state, step.move);
    }
  }
}

/** Whether a note move says only what the solution's lines bear out. */
function noteAgrees(state: LoopyState, move: LoopyMove, solution: Uint8Array): boolean {
  const isLine = (e: number): boolean => solution[e] === LINE_YES;
  if (move.kind === "corner") {
    const { first, second } = dlineEnds(state.grid, move.dline);
    const lines = (isLine(first) ? 1 : 0) + (isLine(second) ? 1 : 0);
    return !(move.bits & 1 && lines === 0) && !(move.bits & 2 && lines === 2);
  }
  if (move.kind === "pair") {
    return (isLine(move.a) !== isLine(move.b)) === (move.relation === "opposite");
  }
  return true;
}

describe("Loopy hint: soundness on every tiling", () => {
  it("every step agrees with the solution, notes included, and following the plan finishes the board", () => {
    const tilings = new Set<string>();
    let notes = 0;
    for (const b of corpus()) {
      const solution = uniqueSolution(b.state);
      expect(solution, `${b.name}: no unique solution`).not.toBeNull();
      if (solution === null) continue;
      let state = b.state;
      for (const [i, step] of stepsOf(b.state).entries()) {
        const at = `${b.name} step ${i}: "${step.explanation}"`;
        for (const op of opsOf(step.move)) expect(op.state, at).toBe(solution[op.edge]);
        expect(noteAgrees(state, step.move, solution), at).toBe(true);
        if (step.move.kind !== "set") notes++;
        state = loopyGame.executeMove(state, step.move);
      }
      expect(state.completed, `${b.name}: the plan stopped short`).toBe(true);
      expect(loopyGame.findMistakes?.(state), b.name).toEqual([]);
      tilings.add(b.name.split("/")[0]);
    }
    // Every tiling was walked, not only the ones that generated.
    for (const grid of LOOPY_GRIDS)
      expect(tilings.has(grid.type), grid.type).toBe(true);
    expect(notes, "the corpus placed no note").toBeGreaterThan(100);
  });

  it("an Easy or Normal square board needs no pair, and an Easy one no note at all", () => {
    let easy = 0;
    let normal = 0;
    for (const b of corpus().filter((x) => x.name.startsWith("squares-"))) {
      const tier = Number(b.name.split("-")[1].split("/")[0]);
      const kinds = new Set(stepsOf(b.state).map((s) => s.move.kind));
      if (tier === DIFF_EASY) {
        expect([...kinds], b.name).toEqual(["set"]);
        easy++;
      }
      if (tier === DIFF_NORMAL) {
        expect(kinds.has("pair"), b.name).toBe(false);
        normal++;
      }
    }
    expect([easy, normal]).toEqual([2, 2]);
  });
});

describe("Loopy hint: a step reasons only from notes on the board", () => {
  it("every note a step cites is there when the step is shown, and no step cites more than two pairs", () => {
    let corners = 0;
    let pairs = 0;
    for (const { b, step, state, i } of walk()) {
      const marks = marksOf(step);
      const at = `${b.name} step ${i}: "${step.explanation}"`;
      for (const dline of marks.corners) {
        expect(state.corners[dline], at).not.toBe(0);
        corners++;
      }
      for (const p of marks.pairs) {
        expect(state.pairs, at).toContainEqual(p);
        pairs++;
      }
      expect(marks.pairs.length, at).toBeLessThanOrEqual(2);
    }
    expect(corners, "the corpus cited no corner note").toBeGreaterThan(20);
    expect(pairs, "the corpus cited no pair note").toBeGreaterThan(20);
  });

  it("every step changes the board: no note is placed twice", () => {
    for (const { b, step, state, i } of walk()) {
      const next = loopyGame.executeMove(state, step.move);
      const same =
        next.lines.every((l, e) => l === state.lines[e]) &&
        next.corners.every((c, d) => c === state.corners[d]) &&
        next.pairs.length === state.pairs.length;
      expect(same, `${b.name} step ${i}: "${step.explanation}"`).toBe(false);
    }
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

const CORNER_WHYS: Record<Exclude<CornerWhy["kind"], "note">, true> = {
  lineElsewhere: true,
  onlyWayOn: true,
  clue: true,
  acrossTheDot: true,
  exactlyOneAcross: true,
  opposites: true,
};

const RELATION_WHYS: Record<Exclude<RelationWhy["kind"], "note">, true> = {
  faceParity: true,
  dotParity: true,
  exactlyOneAtCorner: true,
  faceLink: true,
  dotLink: true,
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
  it("fires every premise it names, and places every kind of note, except the ledgered ones", () => {
    const reached = new Set<string>();
    const whys = new Set<string>();
    for (const b of corpus()) {
      const { plan, facts } = deduceLoopyPlan(b.state);
      for (const p of plan) {
        reached.add(p.reason.kind);
        for (const id of p.closure) whys.add(facts[id].why.kind);
      }
    }
    const unreached = Object.keys(REASONS).filter((k) => !reached.has(k));
    expect(unreached.sort()).toEqual(Object.keys(UNREACHED).sort());
    for (const why of [...Object.keys(CORNER_WHYS), ...Object.keys(RELATION_WHYS)])
      expect(whys.has(why), why).toBe(true);
  });

  it("speaks the ledgered premises' sentences in the necessity voice", () => {
    expect(say.closesLoop).toMatch(/must be a line\.$/);
    expect(say.related(false, true, true)).toBe(
      "The marked pair makes this edge match the marked line, so it must be a line.",
    );
    expect(say.related(true, false, true)).toBe(
      "The marked pair makes this edge the opposite of the marked ruled-out edge, so it must be a line.",
    );
  });
});

describe("Loopy hint: the words and the marks agree", () => {
  it("a count leans on exactly the corners it cites, and the sentence says how many", () => {
    let checked = 0;
    for (const b of corpus()) {
      const { plan } = deduceLoopyPlan(b.state);
      const lineSteps = stepsOf(b.state).filter((s) => s.move.kind === "set");
      expect(lineSteps.length, b.name).toBe(plan.length);
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
        const marks = marksOf(lineSteps[i]);
        const text = lineSteps[i].explanation;
        expect(marks.faces).toEqual([face]);
        expect(marks.corners.length, text).toBe(witness.corners.length);
        expect(text).toMatch(
          witness.corners.length === 1
            ? /the marked corner as one/
            : /each marked corner/,
        );
        checked++;
      });
    }
    expect(checked, "the corpus reached no clue count").toBeGreaterThan(20);
  });

  it("every deictic word points at a mark of its kind", () => {
    const kinds = new Set<string>();
    for (const { b, step, i } of walk()) {
      const text = step.explanation;
      const marks = marksOf(step);
      const at = `${b.name} step ${i}: "${text}"`;
      expect(marks.targets, at).toEqual(opsOf(step.move).map((o) => o.edge));
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
      if (/each marked corner/i.test(text)) {
        expect(marks.corners.length, at).toBeGreaterThan(1);
      } else if (/the marked corner/i.test(text)) {
        expect(marks.corners, at).toHaveLength(1);
        kinds.add("corner");
      } else {
        expect(marks.corners, at).toEqual([]);
      }
      if (/the marked pairs share/i.test(text)) {
        expect(marks.pairs, at).toHaveLength(2);
        expect(marks.edges, at).toHaveLength(1);
        kinds.add("chain");
      } else if (/the marked pair\b/i.test(text)) {
        expect(marks.pairs, at).toHaveLength(1);
        kinds.add("pair");
      } else {
        expect(marks.pairs, at).toEqual([]);
      }
      if (/the marked lines/.test(text)) {
        expect(marks.edges.length, at).toBeGreaterThan(0);
        kinds.add("lines");
      }
      expect(/this corner/.test(text), at).toBe(step.move.kind === "corner");
      if (step.move.kind === "corner") kinds.add("places a corner");
      if (step.move.kind === "pair") {
        expect(text, at).toMatch(/these (two|edges)/i);
        kinds.add("places a pair");
      }
    }
    expect([...kinds].sort()).toEqual([
      "chain",
      "clue",
      "corner",
      "dot",
      "lines",
      "pair",
      "places a corner",
      "places a pair",
    ]);
  });
});

describe("Loopy hint: following and refreshing a step", () => {
  /** The first step satisfying `want`, with the board it applies to. */
  const first = (want: (s: Step) => boolean): { state: LoopyState; step: Step } => {
    for (const { step, state } of walk()) if (want(step)) return { state, step };
    throw new Error("no such step in the corpus");
  };

  it("a line step completes on every edge set, tracks a subset, and drops anything else", () => {
    const { state, step } = first((s) => opsOf(s.move).length >= 2);
    const stepOps = opsOf(step.move);
    const [one, two] = stepOps;
    const set = (ops: { edge: number; state: LineState }[]): LoopyMove => ({
      kind: "set",
      ops,
    });
    expect(hintKeepTrack(set([one]), step, state)).toBe("onTrack");
    expect(hintKeepTrack(set([...stepOps]), step, state)).toBe("completed");
    const flipped = (one.state === LINE_YES ? LINE_NO : LINE_YES) as LineState;
    expect(hintKeepTrack(set([{ edge: one.edge, state: flipped }]), step, state)).toBe(
      "off",
    );
    const other = state.lines.findIndex(
      (l, e) => l === LINE_UNKNOWN && !stepOps.some((o) => o.edge === e),
    );
    expect(hintKeepTrack(set([{ edge: other, state: LINE_YES }]), step, state)).toBe(
      "off",
    );

    const after = loopyGame.executeMove(state, set([one]));
    const refreshed = refreshHintStep(step, after);
    const refreshedOps = refreshed ? opsOf(refreshed.move) : [];
    expect(refreshedOps.map((o) => o.edge)).toEqual(
      stepOps.slice(1).map((o) => o.edge),
    );
    expect(two.edge).toBe(refreshedOps[0]?.edge);
    expect(refreshHintStep(step, loopyGame.executeMove(state, step.move))).toBeNull();
  });

  it("a corner step completes once the note holds it, tracks a tap on the same corner, and drops anything else", () => {
    const { state, step } = first(
      (s) => s.move.kind === "corner" && (s.move.bits === 2 || s.move.bits === 3),
    );
    const move = step.move;
    if (move.kind !== "corner") throw new Error("unreachable");
    const corner = (dline: number, bits: number): LoopyMove => ({
      kind: "corner",
      dline,
      bits,
    });
    expect(hintKeepTrack(move, step, state)).toBe("completed");
    expect(hintKeepTrack(corner(move.dline, 1), step, state)).toBe("onTrack");
    expect(hintKeepTrack(corner(move.dline + 1, move.bits), step, state)).toBe("off");
    expect(hintKeepTrack({ kind: "set", ops: [] }, step, state)).toBe("off");
    expect(refreshHintStep(step, state)).toBe(step);
    expect(refreshHintStep(step, loopyGame.executeMove(state, move))).toBeNull();
  });

  it("a pair step completes on its relation, tracks the same pair, and drops another", () => {
    const { state, step } = first((s) => s.move.kind === "pair");
    const move = step.move;
    if (move.kind !== "pair") throw new Error("unreachable");
    const other = move.relation === "match" ? "opposite" : "match";
    expect(hintKeepTrack({ ...move, a: move.b, b: move.a }, step, state)).toBe(
      "completed",
    );
    expect(hintKeepTrack({ ...move, relation: other }, step, state)).toBe("onTrack");
    expect(hintKeepTrack({ ...move, b: move.b + 1 }, step, state)).toBe("off");
    expect(refreshHintStep(step, loopyGame.executeMove(state, move))).toBeNull();
    expect(
      refreshHintStep(step, loopyGame.executeMove(state, { ...move, relation: other })),
    ).toBe(step);
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
    const right = solution.indexOf(LINE_YES);
    const state = loopyGame.executeMove(loopyGame.executeMove(b.state, move), {
      kind: "set",
      ops: [{ edge: right, state: LINE_YES }],
    });
    expect(loopyGame.findMistakes?.(state)).toEqual([{ kind: "edge", edge }]);
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
    expect(mistakes).toEqual([{ kind: "edge", edge }]);

    const dr = new RecordingDrawing(loopyGame.colors(DEFAULT_BACKGROUND));
    const ui = loopyGame.newUi(state);
    ui.drawFaintLines = false;
    const ds = loopyGame.newDrawState(state, PREFERRED_TILE_SIZE);
    loopyGame.redraw(dr, ds, null, state, 0, ui, 0, 0, undefined, mistakes);
    const red = dr.ops.filter((o) => o.op === "line" && o.color === COL_MISTAKE);
    // A cross: two strokes, and the edge's own faint line is not drawn at all.
    expect(red).toHaveLength(2);
  });

  it("reports a corner note or a pair note the solution breaks, draws it red, and refuses the hint", () => {
    const b = corpus()[0];
    const solution = uniqueSolution(b.state);
    if (solution === null) throw new Error("no solution");
    const g = b.state.grid;
    const isLine = (e: number): boolean => solution[e] === LINE_YES;
    // A corner the loop passes by, noted as needing a line.
    let dline = 0;
    while (dline < 2 * g.numEdges) {
      const { first, second } = dlineEnds(g, dline);
      if (!isLine(first) && !isLine(second)) break;
      dline++;
    }
    // Two edges the loop treats differently, noted as matching.
    const a = solution.indexOf(LINE_YES);
    const other = solution.indexOf(LINE_NO);
    const moves: LoopyMove[] = [
      { kind: "corner", dline, bits: 1 },
      { kind: "pair", a: Math.min(a, other), b: Math.max(a, other), relation: "match" },
    ];
    const state = moves.reduce((s, m) => loopyGame.executeMove(s, m), b.state);
    expect(loopyGame.findMistakes?.(state)).toEqual([
      { kind: "corner", dline },
      { kind: "pair", a: Math.min(a, other), b: Math.max(a, other) },
    ]);
    expect(loopyGame.hint?.(state)).toEqual({ ok: false, error: FIX_MISTAKES_FIRST });

    const frame = renderScenario({
      game: loopyGame,
      id: b.id,
      moves,
      showMistakes: true,
    });
    const ops = frame.recording.ops;
    expect(ops.some((o) => o.op === "polygon" && o.fill === COL_MISTAKE)).toBe(true);
    expect(
      ops.some((o) => o.op === "text" && o.text === "=" && o.color === COL_MISTAKE),
    ).toBe(true);
  });
});

describe("Loopy hint frames", () => {
  /** The first step on a fixed-seed Hard board satisfying `want`. */
  function frame(want: (step: Step) => boolean) {
    for (let seed = 0; seed < 20; seed++) {
      const id = `${encodeParams({ w: 7, h: 7, diff: DIFF_HARD, type: 0 }, true)}#frame-${seed}`;
      const result = renderScenario({
        game: loopyGame,
        id,
        showHint: true,
        hintUntil: want,
      });
      const step = result.hint;
      if (step && want(step)) return { result, step };
    }
    throw new Error("no such step in 20 seeds");
  }

  it("bands the edges a step sets: solid for a line, broken for an edge that can't be one", () => {
    const line = frame(
      (s) => marksOf(s).targets.length === 1 && /must be a line\.$/.test(s.explanation),
    );
    const empty = frame(
      (s) =>
        marksOf(s).targets.length === 1 && /can't be a line\.$/.test(s.explanation),
    );
    const bands = (ops: typeof line.result.recording.ops) =>
      ops.filter((o) => o.op === "line" && o.color === COL_HINT);
    expect(bands(line.result.recording.ops)).toHaveLength(1);
    expect(bands(empty.result.recording.ops)).toHaveLength(4);
  });

  it("draws the pair a step places in the action color, and the pairs it cites in the evidence color", () => {
    const { result, step } = frame(
      (s) => s.move.kind === "pair" && marksOf(s).pairs.length > 0,
    );
    const ops = result.recording.ops;
    const signs = (color: number) =>
      ops.filter((o) => o.op === "text" && o.color === color && /^[=≠]$/.test(o.text));
    expect(signs(COL_HINT)).toHaveLength(1);
    expect(signs(COL_HINT_CELL)).toHaveLength(marksOf(step).pairs.length);
    expect(ops).toMatchSnapshot();
  });

  it("draws the corner a step places in the action color, over the corner it cites", () => {
    const { result, step } = frame(
      (s) => s.move.kind === "corner" && marksOf(s).corners.length > 0,
    );
    const ops = result.recording.ops;
    const move = step.move;
    if (move.kind !== "corner") throw new Error("unreachable");
    const inColor = (color: number) =>
      ops.filter(
        (o) =>
          (o.op === "polygon" && o.fill === color) ||
          (o.op === "line" && o.color === color),
      );
    expect(inColor(COL_HINT).length).toBeGreaterThan(0);
    expect(inColor(COL_HINT_CELL).length).toBeGreaterThan(0);
    // A filled band for a corner needing a line, and none for one that can only
    // take one at most.
    const filled = ops.filter((o) => o.op === "polygon" && o.fill === COL_HINT);
    expect(filled).toHaveLength(move.bits & 1 ? 1 : 0);
  });
});

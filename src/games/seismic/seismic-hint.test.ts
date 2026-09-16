/**
 * Seismic's explained hint, measured over generated boards.
 *
 * Tiers (docs/games/testing.md § "The test tiers"): tier 1 for the plan, the
 * finders and the keep-track hooks; tier 2.5 for the frames the hint draws. The
 * cross-game guards enroll Seismic by its `hint`, so resume, purity, voice and
 * length are theirs and are not repeated here.
 */
import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { Midend } from "../../engine/index.ts";
import { randomNew } from "../../engine/random/index.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import {
  areasOf,
  deduceSeismicPlan,
  hintKeepTrack,
  type PlaceWhy,
  refreshHintStep,
  type SeismicFiring,
  type SeismicHint,
  starves,
  workingBoard,
} from "./hint.ts";
import { say } from "./hint-text.ts";
import { seismicGame } from "./index.ts";
import { COL_HINT, COL_HINT_CELL, COL_NUM_PENCIL, origin } from "./render.ts";
import { placeNumber, regionsViable, STATUS_COMPLETE } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  MODE_SEISMIC,
  MODE_TECTONIC,
  numBit,
  type SeismicMove,
  type SeismicParams,
  type SeismicState,
} from "./state.ts";

type Step = HintStep<SeismicMove, SeismicHint>;

/** Both modes at both tiers, plus a board wider than tall and one taller than
 * wide: the shared note helpers once scanned a square of the width. */
const SHAPES: SeismicParams[] = [
  { w: 6, h: 6, diff: DIFF_EASY, mode: MODE_SEISMIC },
  { w: 6, h: 6, diff: DIFF_EASY, mode: MODE_TECTONIC },
  { w: 6, h: 6, diff: DIFF_NORMAL, mode: MODE_SEISMIC },
  { w: 6, h: 6, diff: DIFF_NORMAL, mode: MODE_TECTONIC },
  { w: 7, h: 7, diff: DIFF_NORMAL, mode: MODE_SEISMIC },
  { w: 7, h: 7, diff: DIFF_NORMAL, mode: MODE_TECTONIC },
  { w: 8, h: 5, diff: DIFF_NORMAL, mode: MODE_SEISMIC },
  { w: 5, h: 8, diff: DIFF_NORMAL, mode: MODE_TECTONIC },
];

const SEEDS = ["sh-a", "sh-b", "sh-c"];

interface Board {
  label: string;
  params: SeismicParams;
  desc: string;
  state: SeismicState;
}

let corpus: Board[] | null = null;

function boards(): Board[] {
  corpus ??= SHAPES.flatMap((params) =>
    SEEDS.map((seed) => {
      const label = `${seismicGame.encodeParams(params, true)}#${seed}`;
      const { desc } = seismicGame.newDesc(params, randomNew(label));
      return { label, params, desc, state: seismicGame.newState(params, desc) };
    }),
  );
  return corpus;
}

function planOf(label: string, state: SeismicState): Step[] {
  const r = seismicGame.hint?.(state);
  if (!r?.ok) throw new Error(`${label}: hint refused: ${r?.error}`);
  return r.steps as Step[];
}

function highlightsOf(step: Step): SeismicHint {
  if (!step.highlights) throw new Error(`no highlights on "${step.explanation}"`);
  return step.highlights;
}

const cellIndex = (state: SeismicState, c: { x: number; y: number }): number =>
  c.y * state.w + c.x;

// --- the corpus -------------------------------------------------------------

/** Every premise the plan can speak. Adding a firing kind or a reason to place
 * fails to compile until it is listed here (docs/games/hints.md § "Census the
 * reasons, not only the rungs"). */
type Kind = Exclude<SeismicFiring["kind"], "place"> | PlaceWhy | "cull";

const KINDS: Record<Kind, true> = {
  populate: true,
  clean: true,
  singleton: true,
  naked: true,
  hidden: true,
  cull: true,
  starve: true,
};

function kindsOf(f: SeismicFiring): Kind[] {
  if (f.kind !== "place") return [f.kind];
  return f.cull.length > 0 ? [f.why, "cull"] : [f.why];
}

describe("the corpus", () => {
  it("finishes every board and reaches every premise, with nothing ledgered", () => {
    const seen = new Set<Kind>();
    let firings = 0;
    for (const { label, state } of boards()) {
      const { status, plan } = deduceSeismicPlan(state);
      expect(status, `${label} stalled`).toBe(STATUS_COMPLETE);
      for (const f of plan) for (const k of kindsOf(f)) seen.add(k);
      firings += plan.length;
    }
    expect(firings, "the census walked almost nothing").toBeGreaterThan(500);
    expect(Object.keys(KINDS).filter((k) => !seen.has(k as Kind))).toEqual([]);
  });

  it("needs a starved area on Normal boards and never on Easy ones", () => {
    // Easy boards are certified by the naked and hidden singles alone, and the
    // plan tries those first, so a starved area on one means the order broke.
    let normal = 0;
    for (const { label, params, state } of boards()) {
      const starved = deduceSeismicPlan(state).plan.filter((f) => f.kind === "starve");
      if (params.diff === DIFF_EASY) expect(starved, label).toEqual([]);
      else normal += starved.length;
    }
    expect(normal).toBeGreaterThan(20);
  });
});

// --- the trial rung ---------------------------------------------------------

/** The candidates the Normal rung itself rejects: place each, and ask whether
 * every area can still house every number it owes. */
function rungRejects(state: SeismicState): string[] {
  const b = workingBoard(state);
  const areas = new Int32Array(b.grid.length);
  const out: string[] = [];
  for (let c = 0; c < b.grid.length; c++) {
    if (b.grid[c] !== 0) continue;
    for (let n = 1; n <= 9; n++) {
      if (!(b.pencil[c] & numBit(n))) continue;
      const trial = { ...b, grid: b.grid.slice(), pencil: b.pencil.slice() };
      placeNumber(trial, c % b.w, (c / b.w) | 0, n);
      if (!regionsViable(trial, areas)) out.push(`${c}:${n}`);
    }
  }
  return out.sort();
}

describe("the starved-area finder", () => {
  it("strikes exactly what the trial rung rejects, wherever it is the next step", () => {
    let points = 0;
    for (const { label, params, state: start } of boards()) {
      if (params.diff === DIFF_EASY) continue;
      let state = start;
      for (let move = 0; move < 500 && !state.completed; move++) {
        if (deduceSeismicPlan(state).plan[0]?.kind === "starve") {
          points++;
          const b = workingBoard(state);
          // A set: two areas can each rule out the same note.
          const found = new Set<string>();
          for (const s of starves(b, areasOf(b)))
            for (const c of s.targets) found.add(`${c}:${s.n}`);
          expect([...found].sort(), `${label} move ${move}`).toEqual(
            rungRejects(state),
          );
        }
        state = seismicGame.executeMove(state, planOf(label, state)[0].move);
      }
      expect(state.completed, `${label} never finished`).toBe(true);
    }
    expect(points, "no trial point was checked").toBeGreaterThan(20);
  });
});

// --- words and pictures -----------------------------------------------------

describe("each step's picture matches its words", () => {
  it("names, marks and strikes exactly what the deduction concerns", () => {
    const counted = new Map<string, number>();
    const count = (k: string) => counted.set(k, (counted.get(k) ?? 0) + 1);
    for (const { label, params, state: start } of boards()) {
      const tectonic = params.mode === MODE_TECTONIC;
      let state = start;
      for (const step of planOf(label, start)) {
        const m = step.move;
        const hl = highlightsOf(step);
        const where = `${label}: "${step.explanation}"`;
        if (m.type === "set") {
          const i = cellIndex(state, m);
          expect(hl.targets, where).toEqual([{ x: m.x, y: m.y }]);
          expect(hl.marks, where).toEqual([]);
          if (step.explanation === say.singleton) {
            expect([state.dsf.size(i), m.n], where).toEqual([1, 1]);
            count("singleton");
          } else if (step.explanation === say.naked(m.n)) {
            // "Every other number has been ruled out" is true of the notes shown.
            expect(state.pencil[i], where).toBe(numBit(m.n));
            count("naked");
          } else {
            expect(step.explanation, where).toBe(say.hidden(m.n));
            const area = hl.area.map((c) => cellIndex(state, c));
            expect(area, where).toContain(i);
            expect(area.length, where).toBe(state.dsf.size(i));
            const rivals = area.filter(
              (j) => j !== i && state.grid[j] === 0 && state.pencil[j] & numBit(m.n),
            );
            expect(rivals, where).toEqual([]);
            count("hidden");
          }
        } else if (m.type === "pencilStrike") {
          const struck = m.marks.map((k) => `${cellIndex(state, k)}:${k.n}`).sort();
          const cells = (ps: readonly { x: number; y: number }[]) =>
            [...new Set(ps.map((c) => cellIndex(state, c)))].sort((p, q) => p - q);
          expect(
            cells(hl.targets),
            `${where}: the ringed cells are the struck ones`,
          ).toEqual(cells(m.marks));
          const n = m.marks[0].n;
          if (step.explanation === say.clean(tectonic)) {
            count("clean");
          } else if (step.explanation === say.cull(n, tectonic)) {
            // The leg after a placement strikes what `placeNumber` itself strikes.
            expect(step.continuesPrevious, where).toBe(true);
            expect(hl.area, where).toHaveLength(1);
            const p = cellIndex(state, hl.area[0]);
            expect(state.grid[p], where).toBe(n);
            const b = workingBoard(state);
            const before = b.pencil.slice();
            placeNumber(b, p % b.w, (p / b.w) | 0, n);
            const byRule: string[] = [];
            for (let j = 0; j < b.grid.length; j++)
              if (j !== p && b.grid[j] === 0 && before[j] !== b.pencil[j])
                byRule.push(`${j}:${n}`);
            expect(struck, where).toEqual(byRule.sort());
            count("cull");
          } else {
            expect(step.explanation, where).toBe(
              say.starve(n, hl.targets.length, tectonic),
            );
            expect(new Set(m.marks.map((k) => k.n)), where).toEqual(new Set([n]));
            const area = hl.area.map((c) => cellIndex(state, c));
            expect(area.length, `${where}: a whole area`).toBe(state.dsf.size(area[0]));
            for (const k of m.marks)
              expect(area, `${where}: a struck cell sits outside`).not.toContain(
                cellIndex(state, k),
              );
            count("starve");
          }
        } else {
          expect(step.explanation, where).toBe(say.populate);
          count("populate");
        }
        state = seismicGame.executeMove(state, m);
      }
      expect(state.completed, `${label}: following the plan finishes the board`).toBe(
        true,
      );
    }
    // The vacuity pair: enough steps, and every branch above taken.
    expect([...counted.values()].reduce((a, b) => a + b, 0)).toBeGreaterThan(1000);
    expect([...counted.keys()].sort()).toEqual(
      ["clean", "cull", "hidden", "naked", "populate", "singleton", "starve"].sort(),
    );
  });
});

// --- the player's own board -------------------------------------------------

function boardWhere(pred: (b: Board) => boolean): Board {
  const found = boards().find(pred);
  if (!found) throw new Error("no such board in the corpus");
  return found;
}

describe("the player's own board", () => {
  it("resumes from notes the player has narrowed, and never re-fills them", () => {
    const { label, state: start } = boardWhere(
      (b) => b.params.diff === DIFF_NORMAL && b.params.mode === MODE_SEISMIC,
    );
    const solved = seismicGame.solve?.(start, start);
    if (!solved?.ok || solved.move.type !== "solve") throw new Error("unsolvable");
    const answer = solved.move.grid;

    let state = seismicGame.executeMove(start, { type: "pencilAll" });
    // Narrow every other empty cell to its answer and one wrong-but-possible note.
    let narrowed = 0;
    for (let i = 0; i < state.grid.length; i += 2) {
      if (state.grid[i] !== 0) continue;
      const others = state.pencil[i] & ~numBit(answer[i]);
      const keep = numBit(answer[i]) | (others & -others);
      for (let n = 1; n <= 9; n++) {
        if (state.pencil[i] & numBit(n) && !(keep & numBit(n))) {
          const x = i % state.w;
          const y = (i / state.w) | 0;
          state = seismicGame.executeMove(state, {
            type: "set",
            x,
            y,
            n,
            pencil: true,
          });
        }
      }
      narrowed++;
    }
    expect(narrowed).toBeGreaterThan(3);
    expect(seismicGame.findMistakes?.(state)).toEqual([]);

    const first = planOf(label, state);
    expect(first.some((s) => s.move.type === "pencilAll")).toBe(false);
    for (let move = 0; move < 500 && !state.completed; move++)
      state = seismicGame.executeMove(state, planOf(label, state)[0].move);
    expect(state.completed).toBe(true);
  });

  it("follows a strike note by note, and refreshes a stored one to what is left", () => {
    const { label, state: start } = boardWhere((b) => b.params.diff === DIFF_NORMAL);
    let state = start;
    const steps = planOf(label, start);
    const at = steps.findIndex(
      (s) => s.move.type === "pencilStrike" && s.move.marks.length >= 2,
    );
    expect(at, "no multi-note strike in the plan").toBeGreaterThanOrEqual(0);
    for (const s of steps.slice(0, at)) state = seismicGame.executeMove(state, s.move);

    const original = steps[at];
    if (original.move.type !== "pencilStrike") throw new Error("unreachable");
    const [first, ...rest] = original.move.marks;
    const toggle: SeismicMove = { type: "set", ...first, pencil: true };

    const followed: Step = structuredClone(original);
    expect(hintKeepTrack(toggle, followed, state)).toBe("onTrack");
    expect(followed.move).toEqual({ type: "pencilStrike", marks: rest });
    expect(highlightsOf(followed).marks).toEqual(rest);

    const after = seismicGame.executeMove(state, toggle);
    expect(refreshHintStep(structuredClone(original), after)?.move).toEqual({
      type: "pencilStrike",
      marks: rest,
    });
    // Toggling the same note again would put it back, which is not the hint.
    expect(hintKeepTrack(toggle, structuredClone(original), after)).toBe("off");
  });

  it("completes a placement only with the number it names", () => {
    const { label, state } = boardWhere((b) => b.params.mode === MODE_TECTONIC);
    const step = planOf(label, state).find((s) => s.move.type === "set");
    if (!step || step.move.type !== "set") throw new Error("no placement in the plan");
    const other = step.move.n === 1 ? 2 : 1;
    expect(hintKeepTrack({ ...step.move }, step, state)).toBe("completed");
    expect(hintKeepTrack({ ...step.move, n: other }, step, state)).toBe("off");
  });
});

// --- the sentences ----------------------------------------------------------

describe("the sentences at their extremes", () => {
  it("counts one cell in the singular, and states each mode's own reach", () => {
    expect(say.cull(1, false)).toContain("within 1 cell of it");
    expect(say.cull(9, false)).toContain("within 9 cells of it");
    expect(say.cull(3, true)).not.toContain("within");
    expect(say.starve(1, 1, false)).toBe(
      "The outlined area can put its 1 only in line with this cell and within 1 cell of it, so this cell can't be 1.",
    );
    expect(say.starve(4, 3, true)).toBe(
      "The outlined area can put its 4 only in a cell touching each of these, so none of them can be 4.",
    );
  });

  it("fits at a glance for every number, count and mode", () => {
    const all: string[] = [say.populate, say.singleton];
    for (const tectonic of [false, true]) {
      all.push(say.clean(tectonic));
      for (let n = 1; n <= 9; n++) {
        all.push(say.naked(n), say.hidden(n), say.cull(n, tectonic));
        for (const targets of [1, 2, 6]) all.push(say.starve(n, targets, tectonic));
      }
    }
    expect(all.filter((s) => s.length > 120)).toEqual([]);
  });
});

// --- frames -----------------------------------------------------------------

const isStarve = (step: HintStep<SeismicMove>): boolean =>
  step.explanation.startsWith("The outlined area can put its");

describe("the frames a hint draws", () => {
  it("rings each struck cell, outlines the starved area, and strikes each note through", () => {
    const params: SeismicParams = { w: 6, h: 6, diff: DIFF_NORMAL, mode: MODE_SEISMIC };
    let found: { hint?: HintStep<SeismicMove>; recording: RecordingDrawing } | null =
      null;
    for (let s = 0; s < 20 && !found; s++) {
      const r = renderScenario({
        game: seismicGame,
        id: `${seismicGame.encodeParams(params, true)}#starve-${s}`,
        showHint: true,
        hintUntil: isStarve,
      });
      if (r.hint && isStarve(r.hint)) found = r;
    }
    if (!found?.hint) throw new Error("no seed reached a starved-area step");
    const hl = found.hint.highlights as SeismicHint;
    const ops = found.recording.ops;

    expectRing(ops, COL_HINT, hl.targets.length);
    // One contour around the area: a side wherever the cell across is outside it.
    const inArea = new Set(hl.area.map((c) => `${c.x},${c.y}`));
    let sides = 0;
    for (const c of hl.area)
      for (const [dx, dy] of [
        [0, -1],
        [-1, 0],
        [0, 1],
        [1, 0],
      ])
        if (!inArea.has(`${c.x + dx},${c.y + dy}`)) sides++;
    expect(
      ops.filter((o) => o.op === "rect" && o.color === COL_HINT_CELL),
    ).toHaveLength(sides);
    expect(
      ops.filter((o) => o.op === "line" && o.color === COL_NUM_PENCIL),
    ).toHaveLength(hl.marks.length);
    expect(ops).toMatchSnapshot();
  });

  it("repaints a cell that stays outlined when the outline around it changes", () => {
    // A mark inside a cell is undone only by that cell's repaint. When a cell is
    // outlined in two consecutive steps, as a different part of a different
    // shape, and the move between them leaves the cell itself alone, nothing but
    // the outline says it must repaint: its old sides would stay on screen.
    let checked = 0;
    for (const { label, params, desc, state } of boards()) {
      if (checked > 0) break;
      const steps = planOf(label, state);
      for (let i = 0; i + 1 < steps.length && checked === 0; i++) {
        const [a, b] = [highlightsOf(steps[i]), highlightsOf(steps[i + 1])];
        const mv = steps[i].move;
        const touched = new Set(
          mv.type === "pencilStrike"
            ? mv.marks.map((k) => `${k.x},${k.y}`)
            : mv.type === "set"
              ? [`${mv.x},${mv.y}`]
              : [],
        );
        const shape = (hl: SeismicHint, c: { x: number; y: number }) => {
          const has = new Set(hl.area.map((d) => `${d.x},${d.y}`));
          return [
            [0, -1],
            [-1, 0],
            [0, 1],
            [1, 0],
          ].map(([dx, dy]) => has.has(`${c.x + dx},${c.y + dy}`));
        };
        const keeps = a.area.find(
          (c) =>
            b.area.some((d) => d.x === c.x && d.y === c.y) &&
            !touched.has(`${c.x},${c.y}`) &&
            shape(a, c).join() !== shape(b, c).join(),
        );
        if (!keeps) continue;

        const midend = new Midend(seismicGame);
        expect(
          midend.newGameFromId(`${seismicGame.encodeParams(params, true)}:${desc}`),
        ).toBeNull();
        midend.size({ w: 700, h: 700 });
        expect(midend.hint()).toBeNull();
        for (let k = 0; k < i; k++) midend.executeHint();
        expect(midend.activeHintStep()?.explanation).toBe(steps[i].explanation);
        const warm = new RecordingDrawing(seismicGame.colors([0.8, 0.8, 0.8]));
        midend.redraw(warm);
        const clip = warm.ops.find((o) => o.op === "clip");
        if (!clip || clip.op !== "clip") throw new Error("no tile was drawn");
        const ts = clip.w;

        midend.executeHint();
        expect(midend.activeHintStep()?.explanation).toBe(steps[i + 1].explanation);
        const frame = new RecordingDrawing(seismicGame.colors([0.8, 0.8, 0.8]));
        midend.redraw(frame);
        // Every tile clips to its own square, so a clip at the cell's origin is
        // the cell repainting.
        const x = origin(ts) + keeps.x * ts;
        const y = origin(ts) + keeps.y * ts;
        expect(
          frame.ops.some((o) => o.op === "clip" && o.x === x && o.y === y),
          `${label} step ${i}: cell ${keeps.x},${keeps.y} kept its old outline`,
        ).toBe(true);
        checked++;
      }
    }
    expect(checked, "no board had a cell outlined twice in different shapes").toBe(1);
  });
});

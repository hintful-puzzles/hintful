/**
 * ABCD's explained hint, measured over generated boards.
 *
 * Tiers (docs/games/testing.md § "The test tiers"): tier 1 for the plan, the
 * finders and the keep-track hooks; tier 2.5 for the runs frame. The cross-game
 * guards enroll ABCD by its `hint` and its `candidateReading`, so resume, voice,
 * length, continuity and the implicit reading's premise duty are theirs and are
 * not repeated here.
 */
import { describe, expect, it } from "vitest";
import type { CandidateReading } from "../../engine/candidate-hint.ts";
import type { HintStep } from "../../engine/game.ts";
import { randomNew } from "../../engine/random/index.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import {
  opsOfKind,
  type RecordingDrawing,
} from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { type AbcdHint, hintKeepTrack, packedLines, refreshHintStep } from "./hint.ts";
import { say } from "./hint-text.ts";
import { abcdGame } from "./index.ts";
import { COL_HINT, COL_HINT_CELL } from "./render.ts";
import { newSolverBoard, runsForce, solveBoard } from "./solver.ts";
import {
  type AbcdMove,
  type AbcdParams,
  type AbcdState,
  abcdPresets,
  letterBit,
} from "./state.ts";

type Step = HintStep<AbcdMove, AbcdHint>;

/** Every preset, plus diagonal mode and a thin board. */
const SHAPES: AbcdParams[] = [
  ...abcdPresets,
  { w: 6, h: 6, n: 5, diag: true, removenums: true },
  { w: 3, h: 9, n: 3, diag: false, removenums: true },
];

const SEEDS = ["ah-a", "ah-b"];

const READINGS: readonly CandidateReading[] = ["populate", "implicit"];

interface Board {
  label: string;
  params: AbcdParams;
  state: AbcdState;
}

let corpus: Board[] | null = null;

function boards(): Board[] {
  corpus ??= SHAPES.flatMap((params) =>
    SEEDS.map((seed) => {
      const label = `${abcdGame.encodeParams(params, true)}#${seed}`;
      const { desc } = abcdGame.newDesc(params, randomNew(label));
      return { label, params, state: abcdGame.newState(params, desc) };
    }),
  );
  return corpus;
}

function planOf(label: string, state: AbcdState, reading?: CandidateReading): Step[] {
  const ui = abcdGame.newUi(state);
  const r = abcdGame.hint?.(state, undefined, {
    ...ui,
    candidateReading: reading ?? ui.candidateReading,
  });
  if (!r?.ok) throw new Error(`${label}: hint refused: ${r?.error}`);
  return r.steps as Step[];
}

// --- the counting argument --------------------------------------------------

/** Every way to put `req` letters in the `open` positions of a line with no two
 * adjacent, by brute force: the oracle `runsForce`'s claim is checked against. */
function arrangements(open: readonly boolean[], req: number): number[][] {
  const out: number[][] = [];
  const walk = (from: number, chosen: number[]): void => {
    if (chosen.length === req) {
      out.push([...chosen]);
      return;
    }
    for (let b = from; b < open.length; b++) if (open[b]) walk(b + 2, [...chosen, b]);
  };
  walk(0, []);
  return out;
}

describe("the runs technique's arithmetic", () => {
  it("forces exactly the positions every arrangement shares, whenever it speaks", () => {
    // Every open pattern up to length 9 and every count: the sentence "the
    // outlined cells fit only k apart, so each stretch is full" is a claim,
    // and this checks it against every arrangement rather than against itself.
    let spoke = 0;
    for (let len = 1; len <= 9; len++)
      for (let mask = 0; mask < 1 << len; mask++) {
        const open = Array.from({ length: len }, (_, b) => ((mask >> b) & 1) === 1);
        for (let req = 1; req <= 5; req++) {
          const { most, forced } = runsForce(open, req);
          const all = arrangements(open, req);
          // `most` really is the most that fit.
          expect(arrangements(open, most + 1)).toEqual([]);
          if (most > 0) expect(arrangements(open, most).length).toBeGreaterThan(0);
          if (forced.length === 0) continue;
          spoke++;
          expect(most).toBe(req);
          // Every forced position is in every arrangement.
          for (const a of all) for (const b of forced) expect(a).toContain(b);
        }
      }
    expect(spoke).toBeGreaterThan(500);
  });
});

// --- the corpus -------------------------------------------------------------

/** Every premise the plan can speak. Adding one fails the census below until it
 * is listed (docs/games/hints.md § "Census the reasons, not only the rungs"). */
type Kind =
  | "populate"
  | "clean"
  | "note"
  | "naked"
  | "regionsFull"
  | "cull"
  | "satisfied"
  | "fold"
  | "onlyHomes"
  | "packed"
  | "alsoForced";

const isSatisfied = (text: string): boolean =>
  /^This (row|column) (must hold no|already holds)/.test(text);

function kindOf(step: Step, diag: boolean): Kind {
  const m = step.move;
  const text = step.explanation;
  if (text === say.populate) return "populate";
  if (text === say.clean(diag)) return "clean";
  if (m.type === "pencilAdd") return isSatisfied(text) ? "fold" : "note";
  if (m.type === "pencilStrike") {
    if (text.startsWith(say.cull(m.marks[0].letter + 1, diag))) return "cull";
    if (isSatisfied(text)) return "satisfied";
  } else if (m.type === "enter" && m.letter !== null) {
    const n = m.letter + 1;
    if (isSatisfied(text)) return "fold";
    if (text === say.naked(n)) return "naked";
    if (text === say.regionsFull(n, diag)) return "regionsFull";
    if (text === say.alsoForced(n)) return "alsoForced";
    if (text.includes("fit only")) return "packed";
    if (text.includes("can take one")) return "onlyHomes";
  }
  throw new Error(`an unclassified step: "${text}"`);
}

/**
 * What each reading reaches over the corpus. A fresh board has nothing placed,
 * so the obvious clean has nothing to clear on it: `clean` is reached from a
 * board the player has filled into, below. The implicit reading writes each
 * note-less cell's notes as a deduction needs them, and folds a strike from one
 * such cell into what it leaves.
 */
const REACHES: Record<CandidateReading, readonly Kind[]> = {
  populate: [
    "populate",
    "naked",
    "cull",
    "satisfied",
    "onlyHomes",
    "packed",
    "alsoForced",
  ],
  implicit: [
    "note",
    "naked",
    "regionsFull",
    "cull",
    "satisfied",
    "fold",
    "onlyHomes",
    "packed",
    "alsoForced",
  ],
};

describe.each(READINGS)("the corpus, under the %s reading", (reading) => {
  it("finishes every board and reaches every premise", () => {
    const seen = new Set<Kind>();
    let steps = 0;
    for (const { label, params, state: start } of boards()) {
      let state = start;
      const plan = planOf(label, start, reading);
      for (const step of plan) {
        seen.add(kindOf(step, params.diag));
        state = abcdGame.executeMove(state, step.move);
      }
      expect(state.completed, `${label} stalled`).toBe(true);
      steps += plan.length;
    }
    expect(steps, "the census walked almost nothing").toBeGreaterThan(1000);
    expect([...seen].sort()).toEqual([...REACHES[reading]].sort());
  });
});

// --- the finders, held to the solver ----------------------------------------

describe("the runs finder", () => {
  it("is the solver's technique: every line it finds, the solver's runs rung places", () => {
    // On a board where the singles and satisfied lines are spent, the hint's
    // finder, reading the populated notes, forces exactly what one sweep of the
    // solver's runs rung would, line for line.
    let points = 0;
    for (const { label, params, state: start } of boards()) {
      let state = start;
      for (let move = 0; move < 400 && !state.completed; move++) {
        const plan = planOf(label, state, "populate");
        const head = plan[0];
        if (head.move.type === "enter" && kindOf(head, params.diag) === "packed") {
          points++;
          const found = [
            ...packedLines(params, state.grid, state.pencil, state.numbers),
          ];
          expect(found.length, `${label} move ${move}`).toBeGreaterThan(0);
          for (const f of found)
            for (const i of f.forced)
              expect(state.pencil[i] & letterBit(f.n - 1)).not.toBe(0);
          expect(
            found.some((f) =>
              f.forced.includes(
                head.move.type === "enter" ? head.move.y * params.w + head.move.x : -1,
              ),
            ),
          ).toBe(true);
        }
        state = abcdGame.executeMove(state, head.move);
      }
      // The whole plan's answer is the solver's.
      const solved = solveBoard(newSolverBoard(params, state.numbers), state.numbers);
      expect(Array.from(state.grid), label).toEqual(Array.from(solved.grid));
    }
    expect(points, "the walk met almost no runs step").toBeGreaterThan(20);
  });
});

// --- the player's own board -------------------------------------------------

function firstBoard(pred: (b: Board) => boolean): Board {
  const found = boards().find(pred);
  if (!found) throw new Error("no such board in the corpus");
  return found;
}

describe("the player's own board", () => {
  it("refuses on a note that has crossed out its cell's answer", () => {
    const { label, state: start } = firstBoard((b) => b.params.removenums);
    const solved = abcdGame.solve?.(start, start);
    if (!solved?.ok || solved.move.type !== "solve")
      throw new Error(`${label}: unsolvable`);
    const answer = solved.move.grid[0];
    let state = abcdGame.executeMove(start, { type: "pencilAll" });
    expect(abcdGame.findMistakes?.(state)).toEqual([]);
    state = abcdGame.executeMove(state, { type: "pencil", x: 0, y: 0, letter: answer });
    expect(abcdGame.findMistakes?.(state)).toEqual([{ x: 0, y: 0 }]);
    expect(abcdGame.hint?.(state, undefined)?.ok).toBe(false);
  });

  it("clears the obvious notes on a board the player filled into without notes", () => {
    const { label, params, state: start } = firstBoard((b) => !b.params.removenums);
    const solved = abcdGame.solve?.(start, start);
    if (!solved?.ok || solved.move.type !== "solve")
      throw new Error(`${label}: unsolvable`);
    const state = abcdGame.executeMove(start, {
      type: "enter",
      x: 1,
      y: 1,
      letter: solved.move.grid[params.w + 1],
    });
    const plan = planOf(label, state, "populate");
    expect(plan.map((s) => kindOf(s, params.diag)).slice(0, 2)).toEqual([
      "populate",
      "clean",
    ]);
  });

  it("follows a strike note by note, in the game's own letters", () => {
    const { label, state: start } = firstBoard((b) => b.params.removenums);
    let state = start;
    const steps = planOf(label, start, "populate");
    const at = steps.findIndex(
      (s) => s.move.type === "pencilStrike" && s.move.marks.length >= 2,
    );
    expect(at, "no multi-note strike in the plan").toBeGreaterThanOrEqual(0);
    for (const s of steps.slice(0, at)) state = abcdGame.executeMove(state, s.move);

    const original = steps[at];
    if (original.move.type !== "pencilStrike") throw new Error("unreachable");
    const [first, ...rest] = original.move.marks;
    const toggle: AbcdMove = { type: "pencil", ...first };

    const followed: Step = structuredClone(original);
    expect(hintKeepTrack(toggle, followed, state)).toBe("onTrack");
    expect(followed.move).toEqual({ type: "pencilStrike", marks: rest });

    const after = abcdGame.executeMove(state, toggle);
    expect(refreshHintStep(structuredClone(original), after)?.move).toEqual({
      type: "pencilStrike",
      marks: rest,
    });
    expect(hintKeepTrack(toggle, structuredClone(original), after)).toBe("off");
  });

  it("completes a placement only with the letter it names", () => {
    const { label, state } = boards()[0];
    const step = planOf(label, state).find((s) => s.move.type === "enter");
    if (!step || step.move.type !== "enter" || step.move.letter === null)
      throw new Error("no placement in the plan");
    const other = (step.move.letter + 1) % state.params.n;
    expect(hintKeepTrack({ ...step.move }, step, state)).toBe("completed");
    expect(hintKeepTrack({ ...step.move, letter: other }, step, state)).toBe("off");
  });
});

// --- the sentences ----------------------------------------------------------

describe("the sentences at their extremes", () => {
  it("counts in the singular and states each mode's own reach", () => {
    expect(say.onlyHomes("row", 1, 1, false)).toBe(
      "This row needs one A and no other cell in it can take one, so this cell must be A.",
    );
    expect(say.onlyHomes("column", 2, 3, true)).toBe(
      "This column needs 3 more Bs and only the outlined cells can take one, so this cell must be B.",
    );
    expect(say.packed("row", 3, 2, false)).toBe(
      "This row needs 2 Cs, and the outlined cells fit only 2 apart, so each stretch is full: this cell must be C.",
    );
    expect(say.satisfied("row", 1, 0)).toBe("This row must hold no A");
    expect(say.satisfied("column", 2, 1)).toBe("This column already holds its one B");
    expect(say.cull(1, true)).toContain("even at a corner");
    expect(say.cull(1, false)).toContain("beside, above or below");
  });

  it("fits at a glance for every letter, count and line, conclusions included", () => {
    const all: string[] = [say.populate];
    const conclusion = ", so we must cross out the other Is in it.";
    for (const diag of [false, true]) {
      all.push(say.clean(diag), say.note([1, 2, 3, 4], false, diag));
      all.push(say.note([], true, diag));
      for (let n = 1; n <= 9; n++) {
        all.push(say.naked(n), say.regionsFull(n, diag), say.alsoForced(n));
        all.push(`${say.cull(n, diag)}, so we must cross out ${say.culled(n)}.`);
        for (const line of ["row", "column"] as const)
          for (let k = 0; k <= 9; k++) {
            all.push(`${say.satisfied(line, n, k)}${conclusion}`);
            if (k === 0) continue;
            for (const more of [false, true]) {
              all.push(say.onlyHomes(line, n, k, more));
              if (k > 1) all.push(say.packed(line, n, k, more));
            }
          }
      }
    }
    expect(all.filter((s) => s.length > 120)).toEqual([]);
  });
});

// --- frames -----------------------------------------------------------------

describe("the frames a hint draws", () => {
  it("hatches the runs line, outlines its stretches, rings the cell and colors the count", () => {
    const params: AbcdParams = { w: 5, h: 5, n: 4, diag: false, removenums: true };
    let found: { hint?: HintStep<AbcdMove>; recording: RecordingDrawing } | null = null;
    for (let s = 0; s < 20 && !found; s++) {
      const r = renderScenario({
        game: abcdGame,
        id: `${abcdGame.encodeParams(params, true)}#runs-${s}`,
        showHint: true,
        hintUntil: (step) => step.explanation.includes("fit only"),
      });
      if (r.hint?.explanation.includes("fit only")) found = r;
    }
    if (!found?.hint) throw new Error("no seed reached a runs step");
    const hl = found.hint.highlights as AbcdHint;
    const ops = found.recording.ops;

    expectRing(ops, COL_HINT, 1);
    // The line the sentence names is hatched, cell by cell and on through its
    // clue slots: one slot per letter.
    const line = hl.hatch ?? [];
    expect(line.length).toBe(5);
    expect(opsOfKind(ops, "hatch")).toHaveLength(5 + params.n);
    // The count the sentence reads is drawn in the action color.
    expect(ops.some((o) => o.op === "text" && o.color === COL_HINT)).toBe(true);
    // The stretches the sentence counts are outlined.
    expect(hl.area.length).toBeGreaterThan(1);
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT_CELL)).toBe(true);
    expect(ops).toMatchSnapshot();
  });
});

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
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { opsOfKind } from "../../engine/testing/recording-drawing.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import {
  type AbcdHint,
  type AbcdRung,
  hintKeepTrack,
  packedLines,
  refreshHintStep,
} from "./hint.ts";
import { CLUE, type LineMarks, say } from "./hint-text.ts";
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

type Step = HintStep<AbcdMove, AbcdHint, AbcdRung>;

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

/** Whether a runs step outlines a stretch: two cells of its line side by side.
 * Cells that must all take the letter never touch, so a step that outlines two
 * that do is the technique proper, counting what each stretch fits. */
function outlinesStretch(step: Step): boolean {
  const open = stepMarks(step).of("outline", CELL);
  return open.some((a) =>
    open.some((b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1),
  );
}
/** Whether a step reads a clue's count. A runs firing's later legs do not. */
const readsCount = (step: Step): boolean =>
  stepMarks(step).of("outline", CLUE).length > 0;

/** The steps the keep-track and frame tests below are asserted on, and a
 * position for every rung. The orthogonal boards are read with the notes
 * populated and the diagonal ones implicitly, since `note` and `regionsFull`
 * are spoken only of a cell with no notes. The second line of play opens with
 * a letter written on the bare board, which is what `clean` clears after. */
const RUNS_PARAMS: AbcdParams = { w: 5, h: 5, n: 4, diag: false, removenums: true };
const pinned = describeHintPins({
  game: abcdGame,
  params: [RUNS_PARAMS, { ...RUNS_PARAMS, diag: true }],
  ui: (state) => ({
    ...abcdGame.newUi(state),
    candidateReading: state.params.diag ? "implicit" : "populate",
  }),
  stray: (state, turn, hinted): AbcdMove | null => {
    if (turn > 0) return hinted;
    const solved = abcdGame.solve?.(state, state);
    if (!solved?.ok || solved.move.type !== "solve") throw new Error("unsolvable");
    const at = state.params.w + 1;
    return { type: "enter", x: 1, y: 1, letter: solved.move.grid[at] };
  },
  kinds: {
    runs: (step) => step.rung === "packed" && readsCount(step) && outlinesStretch(step),
    multiNoteStrike: (step) =>
      step.move.type === "pencilStrike" && step.move.marks.length >= 2,
  },
  pins: {
    /** Held on 197 of 2388 positions walked. */
    runs: {
      id: "5x5n4R:1,-,-,-,1,-,2,0,2,2,-,-,1,1,1,-,3,-,1,-,3,-,1,-,-,-,1,2,2,-,-,-,2,1,1,-,-,-,-,-,",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":1,"letter":3},{"x":1,"y":1,"letter":3},{"x":2,"y":1,"letter":3},{"x":3,"y":1,"letter":3},{"x":4,"y":1,"letter":3}]}]',
    },
    /** Held on 498 of 2388 positions walked. */
    multiNoteStrike: {
      id: "5x5n4R:-,0,-,2,2,-,1,-,-,2,-,2,1,-,-,2,-,1,-,0,1,-,1,-,-,0,3,-,-,0,-,2,0,-,-,-,-,1,-,2,",
      moves: [{ type: "pencilAll" }],
    },
    /** Held on 36 of 2388 positions walked. */
    populate:
      "5x5n4R:-,0,-,2,2,-,1,-,-,2,-,2,1,-,-,2,-,1,-,0,1,-,1,-,-,0,3,-,-,0,-,2,0,-,-,-,-,1,-,2,",
    /** Held on 757 of 2388 positions walked. */
    clean: {
      id: "5x5n4R:-,0,-,2,2,-,1,-,-,2,-,2,1,-,-,2,-,1,-,0,1,-,1,-,-,0,3,-,-,0,-,2,0,-,-,-,-,1,-,2,",
      moves: [{ type: "enter", x: 1, y: 1, letter: 3 }, { type: "pencilAll" }],
    },
    /** Held on 656 of 2388 positions walked. */
    note: "5x5n4DR:-,-,-,-,-,-,-,-,-,-,-,-,-,-,2,1,-,-,-,-,-,3,-,0,3,-,-,-,-,-,-,-,-,-,0,-,-,3,-,-,",
    /** Held on 2155 of 2388 positions walked. */
    dup: "5x5n4R:-,0,-,2,2,-,1,-,-,2,-,2,1,-,-,2,-,1,-,0,1,-,1,-,-,0,3,-,-,0,-,2,0,-,-,-,-,1,-,2,",
    /** Held on 2278 of 2388 positions walked. */
    single: {
      id: "5x5n4R:-,-,-,1,-,-,1,0,1,-,-,-,1,1,-,2,1,-,-,-,0,3,-,0,1,1,-,1,-,2,-,-,-,-,1,-,1,-,-,0,",
      moves:
        '[{"type":"enter","x":1,"y":1,"letter":1},{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":1,"y":0,"letter":1},{"x":0,"y":1,"letter":1},{"x":2,"y":1,"letter":1},{"x":1,"y":2,"letter":1}]},{"type":"pencilStrike","marks":[{"x":0,"y":1,"letter":3},{"x":2,"y":1,"letter":3},{"x":3,"y":1,"letter":3},{"x":4,"y":1,"letter":3}]},{"type":"pencilStrike","marks":[{"x":0,"y":0,"letter":0},{"x":0,"y":1,"letter":0},{"x":0,"y":2,"letter":0},{"x":0,"y":3,"letter":0},{"x":0,"y":4,"letter":0}]}]',
    },
    /** Held on 1123 of 2388 positions walked. */
    regionsFull: {
      id: "5x5n4DR:-,-,-,2,-,-,-,-,-,1,-,-,-,-,-,-,-,-,-,-,2,-,-,3,-,-,-,-,-,-,-,-,-,3,-,-,-,-,-,3,",
      moves:
        '[{"type":"enter","x":1,"y":1,"letter":1},{"type":"pencilAdd","marks":[{"x":0,"y":1,"letter":0},{"x":0,"y":1,"letter":2},{"x":0,"y":1,"letter":3}]},{"type":"pencilAdd","marks":[{"x":0,"y":2,"letter":0},{"x":0,"y":2,"letter":2},{"x":0,"y":2,"letter":3}]},{"type":"pencilAdd","marks":[{"x":0,"y":3,"letter":0},{"x":0,"y":3,"letter":1},{"x":0,"y":3,"letter":2},{"x":0,"y":3,"letter":3}]},{"type":"pencilAdd","marks":[{"x":0,"y":4,"letter":0},{"x":0,"y":4,"letter":1},{"x":0,"y":4,"letter":2},{"x":0,"y":4,"letter":3}]},{"type":"enter","x":0,"y":0,"letter":3},{"type":"pencilStrike","marks":[{"x":0,"y":1,"letter":3}]},{"type":"enter","x":0,"y":2,"letter":3},{"type":"pencilStrike","marks":[{"x":0,"y":3,"letter":3}]},{"type":"enter","x":0,"y":1,"letter":0}]',
    },
    /** Held on 1683 of 2388 positions walked. */
    satisfied: {
      id: "5x5n4R:-,0,-,2,2,-,1,-,-,2,-,2,1,-,-,2,-,1,-,0,1,-,1,-,-,0,3,-,-,0,-,2,0,-,-,-,-,1,-,2,",
      moves: [{ type: "pencilAll" }],
    },
    /** Held on 2040 of 2388 positions walked. */
    packed: {
      id: "5x5n4R:1,-,-,-,1,-,2,0,2,2,-,-,1,1,1,-,3,-,1,-,3,-,1,-,-,-,1,2,2,-,-,-,2,1,1,-,-,-,-,-,",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":1,"letter":3},{"x":1,"y":1,"letter":3},{"x":2,"y":1,"letter":3},{"x":3,"y":1,"letter":3},{"x":4,"y":1,"letter":3}]}]',
    },
  },
});

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

function kindOf(step: Step): Kind {
  switch (step.rung) {
    case "single":
      return "naked";
    case "dup":
      return "cull";
    // A strike from a cell with no notes is folded into what it leaves there.
    case "satisfied":
      return step.move.type === "pencilStrike" ? "satisfied" : "fold";
    case "packed":
      if (!readsCount(step)) return "alsoForced";
      return outlinesStretch(step) ? "packed" : "onlyHomes";
    default:
      return step.rung;
  }
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
    for (const { label, state: start } of boards()) {
      let state = start;
      const plan = planOf(label, start, reading);
      for (const step of plan) {
        seen.add(kindOf(step));
        state = abcdGame.executeMove(state, step.move);
      }
      expect(abcdGame.status(state), `${label} stalled`).toBe("solved");
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
      for (let move = 0; move < 400 && abcdGame.status(state) !== "solved"; move++) {
        const plan = planOf(label, state, "populate");
        const head = plan[0];
        if (head.move.type === "enter" && kindOf(head) === "packed") {
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
  it("flags a note that has crossed out its cell's answer, so the midend refuses it", () => {
    const { label, state: start } = firstBoard((b) => b.params.removenums);
    const solved = abcdGame.solve?.(start, start);
    if (!solved?.ok || solved.move.type !== "solve")
      throw new Error(`${label}: unsolvable`);
    const answer = solved.move.grid[0];
    let state = abcdGame.executeMove(start, { type: "pencilAll" });
    expect(abcdGame.findMistakes?.(state)).toEqual([]);
    state = abcdGame.executeMove(state, { type: "pencil", x: 0, y: 0, letter: answer });
    expect(abcdGame.findMistakes?.(state)).toEqual([{ x: 0, y: 0, kind: "note" }]);
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
    expect(plan.map(kindOf).slice(0, 2)).toEqual(["populate", "clean"]);
  });

  it("follows a strike note by note, in the game's own letters", () => {
    const { state, step: original } = pinned("multiNoteStrike");
    if (original.move.type !== "pencilStrike") throw new Error("unreachable");
    const [first, ...rest] = original.move.marks;
    const toggle: AbcdMove = { type: "pencil", ...first };

    // A step's words hold functions, so a copy clones only the data keep-track
    // rewrites in place.
    const copy = (s: Step): Step => ({
      ...s,
      move: structuredClone(s.move),
      highlights: structuredClone(s.highlights),
    });
    const followed = copy(original);
    expect(hintKeepTrack(toggle, followed, state)).toBe("onTrack");
    expect(followed.move).toEqual({ type: "pencilStrike", marks: rest });
    // Its words shrink with it.
    expect(followed.explanation).toBe(followed.words?.text);

    const after = abcdGame.executeMove(state, toggle);
    expect(refreshHintStep(copy(original), after)?.move).toEqual({
      type: "pencilStrike",
      marks: rest,
    });
    expect(hintKeepTrack(toggle, copy(original), after)).toBe("off");
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
  const lineOf = (word: "row" | "column"): LineMarks => ({
    word,
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ],
    clue: 0,
  });
  const at = (n: number) => ({ x: 0, y: 0, n });
  const two = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
  ];

  it("counts in the singular and states each mode's own reach", () => {
    expect(say.onlyHomes(lineOf("row"), at(1), 1, false, [at(1)]).text).toBe(
      "This row needs one A and no other cell in it can take one, so this cell must be A.",
    );
    expect(say.onlyHomes(lineOf("column"), at(2), 3, true, two).text).toBe(
      "This column needs 3 more Bs and only the outlined cells can take one, so this cell must be B.",
    );
    expect(say.packed(lineOf("row"), at(3), 2, false, two).text).toBe(
      "This row needs 2 Cs, and the outlined cells fit only 2 apart, so each stretch is full: this cell must be C.",
    );
    expect(say.satisfied(lineOf("row"), 1, 0, []).text).toBe("This row must hold no A");
    expect(say.satisfied(lineOf("column"), 2, 1, [at(2)]).text).toBe(
      "This column already holds its one B",
    );
    expect(say.cull(at(1), 1, true).text).toContain("even at a corner");
    expect(say.cull(at(1), 1, false).text).toContain("beside, above or below");
  });

  it("fits at a glance for every letter, count and line, conclusions included", () => {
    const all: string[] = [say.populate];
    const conclusion = ", so we must cross out the other Is in it.";
    for (const diag of [false, true]) {
      all.push(
        say.clean(diag)([at(1)]).text,
        say.note(at(0), [1, 2, 3, 4], false, diag).text,
      );
      all.push(say.note(at(0), [], true, diag).text);
      for (let n = 1; n <= 9; n++) {
        for (const word of ["row", "column"] as const)
          all.push(
            say.naked(at(n), 9).text,
            say.regionsFull(at(n), diag).text,
            say.alsoForced(lineOf(word), at(n)).text,
          );
        all.push(
          `${say.cull(at(n), n, diag).text}, so we must cross out ${say.culled(n)}.`,
        );
        for (const word of ["row", "column"] as const)
          for (let k = 0; k <= 9; k++) {
            all.push(`${say.satisfied(lineOf(word), n, k, [at(n)]).text}${conclusion}`);
            if (k === 0) continue;
            for (const more of [false, true]) {
              all.push(say.onlyHomes(lineOf(word), at(n), k, more, two).text);
              if (k > 1) all.push(say.packed(lineOf(word), at(n), k, more, two).text);
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
    const result = renderPinnedHint(abcdGame, pinned("runs"));
    const { step } = result;
    const hl = step.highlights as AbcdHint;
    const ops = result.recording.ops;

    expectRing(ops, COL_HINT, 1);
    // The line the sentence names is hatched, cell by cell and on through its
    // clue slots: one slot per letter.
    const line = hl.hatch ?? [];
    expect(line.length).toBe(5);
    expect(opsOfKind(ops, "hatch")).toHaveLength(5 + RUNS_PARAMS.n);
    // The count the sentence reads is drawn in the action color.
    expect(ops.some((o) => o.op === "text" && o.color === COL_HINT)).toBe(true);
    // The stretches the sentence counts are outlined.
    expect(hl.area.length).toBeGreaterThan(1);
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT_CELL)).toBe(true);
    expect(ops).toMatchSnapshot();
  });
});

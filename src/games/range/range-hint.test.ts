import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import type { RangeHint } from "./hint.ts";
import { CLUE } from "./hint-text.ts";
import { rangeGame } from "./index.ts";
import { answerOf } from "./solver.ts";
import {
  BLACK,
  decodeParams,
  EMPTY,
  newState,
  type RangeCellValue,
  type RangeMove,
  type RangeState,
} from "./state.ts";

function fromSeed(params: string, seed: string): RangeState {
  const p = decodeParams(params);
  const { desc } = rangeGame.newDesc(p, randomNew(seed));
  return newState(p, desc);
}

/** Every kind of step, on a board whose plan speaks it. */
describeHintPins({
  game: rangeGame,
  params: [decodeParams("9x6")],
  pins: {
    /** Held on 471 of 482 positions walked. */
    besideShaded: {
      id: "9x6de:f3a8e2b7b7e8_7e3b5b6e4a7f",
      moves: [{ sets: [{ r: 5, c: 1, value: "black" }] }],
    },
    /** Held on 476 of 482 positions walked. */
    "capped.satisfied": {
      id: "9x6de:9a9g2c7k12_5k3c5g4a6",
      moves: [{ sets: [{ r: 0, c: 1, value: "white" }] }],
    },
    /** Held on 382 of 482 positions walked. */
    "capped.overrun": "9x6de:f3a8e2b7b7e8_7e3b5b6e4a7f",
    /** Held on 479 of 482 positions walked. */
    reach: "9x6de:a4d6a4_9e7e7j6e10e4_6a5d8a",
    /** Held on 173 of 482 positions walked. */
    cut: {
      id: "9x6de:3e11h9a5c10j6c5a8h11e12",
      moves:
        '[{"sets":[{"r":2,"c":6,"value":"white"}]},{"sets":[{"r":0,"c":5,"value":"white"}]},{"sets":[{"r":0,"c":4,"value":"white"}]},{"sets":[{"r":0,"c":3,"value":"white"}]},{"sets":[{"r":1,"c":0,"value":"white"}]},{"sets":[{"r":1,"c":5,"value":"white"}]},{"sets":[{"r":2,"c":4,"value":"white"}]},{"sets":[{"r":3,"c":2,"value":"white"}]},{"sets":[{"r":5,"c":3,"value":"white"}]},{"sets":[{"r":5,"c":4,"value":"white"}]},{"sets":[{"r":5,"c":5,"value":"white"}]},{"sets":[{"r":4,"c":8,"value":"white"}]},{"sets":[{"r":3,"c":8,"value":"white"}]},{"sets":[{"r":2,"c":8,"value":"white"}]},{"sets":[{"r":0,"c":8,"value":"black"}]},{"sets":[{"r":0,"c":7,"value":"white"}]},{"sets":[{"r":1,"c":7,"value":"black"}]},{"sets":[{"r":2,"c":7,"value":"white"}]},{"sets":[{"r":3,"c":6,"value":"white"}]},{"sets":[{"r":0,"c":2,"value":"white"}]},{"sets":[{"r":0,"c":1,"value":"black"}]},{"sets":[{"r":1,"c":1,"value":"white"}]},{"sets":[{"r":2,"c":0,"value":"white"}]},{"sets":[{"r":3,"c":0,"value":"black"}]},{"sets":[{"r":3,"c":1,"value":"white"}]},{"sets":[{"r":4,"c":6,"value":"white"}]},{"sets":[{"r":5,"c":6,"value":"white"}]},{"sets":[{"r":1,"c":4,"value":"white"}]},{"sets":[{"r":1,"c":3,"value":"white"}]},{"sets":[{"r":1,"c":2,"value":"black"}]},{"sets":[{"r":2,"c":2,"value":"white"}]},{"sets":[{"r":4,"c":1,"value":"white"}]},{"sets":[{"r":4,"c":3,"value":"white"}]},{"sets":[{"r":4,"c":4,"value":"white"}]},{"sets":[{"r":4,"c":5,"value":"black"}]},{"sets":[{"r":5,"c":0,"value":"black"}]},{"sets":[{"r":5,"c":1,"value":"white"}]},{"sets":[{"r":5,"c":7,"value":"white"}]}]',
    },
  },
});

/** The steps of the hint on a state, none where it refuses. */
function stepsOf(state: RangeState): HintStep<RangeMove, RangeHint, string>[] {
  const res = rangeGame.hint?.(state);
  return res?.ok ? (res.steps as HintStep<RangeMove, RangeHint, string>[]) : [];
}

/** The square a step decides: its place, and the value it asks. */
const decided = (
  step: HintStep<RangeMove, RangeHint>,
): { r: number; c: number; value: string } => step.move.sets[0];

describe("the hint's steps", () => {
  it("outlines a black cell beside the neighbor it forces clear", () => {
    // 3x3, center black, no clues — adjacency forces the 4 neighbors white.
    const grid = Int8Array.from([
      EMPTY,
      EMPTY,
      EMPTY,
      EMPTY,
      BLACK,
      EMPTY,
      EMPTY,
      EMPTY,
      EMPTY,
    ]);
    const plan = stepsOf({ w: 3, h: 3, grid, clues: new Int8Array(9) });
    const adj = plan.find((m) => m.rung === "besideShaded");
    expect(adj).toBeDefined();
    if (!adj) return;
    expect(decided(adj).value).toBe("white");
    expect(stepMarks(adj).of("outline", CELL)).toEqual([{ x: 1, y: 1 }]);
  });

  it("takes the ladder's first rung first, one step a square", () => {
    // A shaded square of the answer marked first: its neighbors are the first
    // steps, though numbers force squares elsewhere from the start.
    const st = newState(decodeParams("9x6"), "d11a12h7b10e11d7e4b9h5a2d");
    const answer = answerOf(st);
    if (answer.kind !== "one") throw new Error(answer.kind);
    const shaded = answer.solution.indexOf(BLACK);
    const grid = st.grid.slice();
    grid[shaded] = BLACK;
    const [r, c] = [Math.floor(shaded / 9), shaded % 9];
    const open = [
      [r - 1, c],
      [r, c + 1],
      [r + 1, c],
      [r, c - 1],
    ]
      .filter(([y, x]) => y >= 0 && y < 6 && x >= 0 && x < 9)
      .map(([y, x]) => y * 9 + x)
      .filter((p) => grid[p] === EMPTY);
    const plan = stepsOf({ ...st, grid });
    const first = plan.slice(0, open.length);
    expect(first.map((m) => m.rung)).toEqual(open.map(() => "besideShaded"));
    expect(new Set(first.map((m) => decided(m).r * 9 + decided(m).c))).toEqual(
      new Set(open),
    );
    expect(plan.slice(open.length).some((m) => m.rung !== "besideShaded")).toBe(true);
  });

  it("has a clue's step on a generated board", () => {
    const st = fromSeed("9x6", "range-hint-reason");
    const plan = stepsOf(st);
    expect(plan.length).toBeGreaterThan(0);
    expect(
      plan.some((m) =>
        ["capped.satisfied", "capped.overrun", "reach"].includes(m.rung),
      ),
    ).toBe(true);
  });
});

describe("hint", () => {
  it("returns a plan whose moves are legal and solve the board", () => {
    const st = fromSeed("9x6", "range-hint-plan");
    const res = rangeGame.hint?.(st);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    expect(res.steps.length).toBeGreaterThan(0);
    expect(res.steps[0].explanation.length).toBeGreaterThan(0);

    // Apply every step move in order — the board ends full and solved.
    let cur = st;
    for (const step of res.steps) {
      cur = rangeGame.executeMove(cur, step.move);
    }
    expect(cur.grid.includes(EMPTY)).toBe(false);
    expect(rangeGame.status(cur)).toBe("solved");
  });

  it("gives every step visible evidence (an area or a black to outline)", () => {
    // The product goal: a hint shows *why*, not just *what*. Across the
    // whole plan, no step may be a bare conclusion — each carries an outlined
    // area (a clue's line of sight / the white cells a cut would isolate), a
    // striped reach run, or an outlined black premise cell.
    for (const seed of ["range-hint-plan", "range-evidence-2", "range-evidence-3"]) {
      const st = fromSeed("9x6", seed);
      const res = rangeGame.hint?.(st);
      if (!res?.ok) throw new Error("expected a plan");
      for (const step of res.steps) {
        const [target] = (step.highlights as RangeHint).targets;
        const marks = stepMarks(step);
        const outlined = marks.of("outline", CELL);
        const run = marks.of("stripes", CELL);
        expect(outlined.length + run.length).toBeGreaterThan(0);
        // Neither the outline nor the run includes the target cell itself.
        for (const cells of [outlined, run])
          expect(cells.some((a) => a.y === target.y && a.x === target.x)).toBe(false);
      }
    }
  });

  it("ties 'this cell' to the second mark, on every step of every reason", () => {
    // Every Range step shows a second mark (the test above pins that), so a
    // bare "this cell" would point at neither it nor the target. The tie is
    // geometric — never a color name, which `docs/hints.md` § "Two marks
    // of one kind: tie them, and never by color" forbids as scheme-relative and invisible to a color-blind
    // reader.
    const TIE =
      /touches the outlined \S+ square|just past (?:it|them|the outlined squares?)|along the striped run(?: to|:) the ringed square|the outlined squares? around it/;
    const kinds = new Set<string>();
    let checked = 0;
    for (const seed of ["range-hint-plan", "range-evidence-2", "range-evidence-3"]) {
      let cur = fromSeed("9x6", seed);
      for (let round = 0; round < 40; round++) {
        const res = rangeGame.hint?.(cur);
        if (!res?.ok) break;
        for (let i = 0; i < res.steps.length; i++) {
          const step = res.steps[i];
          kinds.add(step.rung);
          checked++;
          expect(
            TIE.test(step.explanation),
            `${step.rung}: ${step.explanation} — a second mark is shown but "this cell" is not tied to it`,
          ).toBe(true);
          // Words and picture agree in *both* directions: a sentence saying
          // "this N" is pointing at a mark, so the mark must exist. The clue
          // is named this way rather than as "clue N" because a clue sits
          // inside its own shaded line of sight and that run can hold a
          // second clue of the same value — seen live on 9x6, two 13s.
          const clues = stepMarks(step).of("outline", CLUE);
          if (/\bthis \d+/i.test(step.explanation)) {
            expect(clues.length, `${step.explanation} — no clue is marked`).toBe(1);
          } else {
            expect(clues).toEqual([]);
          }
        }
        for (const step of res.steps) cur = rangeGame.executeMove(cur, step.move);
      }
    }
    // Vacuity guards: an empty sweep, or one that only ever reached the
    // adjacency rule (whose sentence was already tied), would pass the
    // assertion above while measuring nothing.
    expect(checked).toBeGreaterThan(50);
    expect([...kinds].sort()).toEqual([
      "besideShaded",
      "capped.overrun",
      "capped.satisfied",
      "cut",
      "reach",
    ]);
  });

  it("counts the board its plan finishes as solved, so the midend refuses it", () => {
    const st = fromSeed("9x6", "range-hint-solved");
    const res0 = rangeGame.hint?.(st);
    if (!res0?.ok) throw new Error("expected a plan");
    let cur = st;
    for (const step of res0.steps) cur = rangeGame.executeMove(cur, step.move);
    expect(rangeGame.status(cur)).toBe("solved");
  });

  it("flags a cell dotted against the solution, so the midend refuses it", () => {
    const st = fromSeed("9x6", "range-hint-mistake");
    const solution = rangeGame.solve?.(st, st);
    if (!solution?.ok) throw new Error("expected solvable");
    const solved = rangeGame.executeMove(st, solution.move);
    const blackCell = solved.grid.indexOf(BLACK);
    const r = Math.floor(blackCell / st.w);
    const c = blackCell % st.w;
    // Dot a solution-black cell white on the fresh board → a mistake.
    const wrong = rangeGame.executeMove(st, { sets: [{ r, c, value: "white" }] });
    expect(rangeGame.findMistakes?.(wrong).length ?? 0).toBeGreaterThan(0);
  });
});

describe("hintKeepTrack", () => {
  it("completes when the move sets the hinted cell, off otherwise", () => {
    const st = fromSeed("9x6", "range-hint-track");
    const res = rangeGame.hint?.(st);
    if (!res?.ok) throw new Error("expected a plan");
    const step = res.steps[0];
    const [hinted] = (step.highlights as RangeHint).targets;
    const target = {
      r: hinted.y,
      c: hinted.x,
      value: (hinted.value === 1 ? "black" : "white") as RangeCellValue,
    };

    // The move that sets the hinted cell to the hinted value → completed.
    const right: RangeMove = {
      sets: [{ r: target.r, c: target.c, value: target.value }],
    };
    expect(rangeGame.hintKeepTrack?.(right, step, st)).toBe("completed");

    // The hinted cell, but the wrong value → off.
    const wrongValue: RangeCellValue = target.value === "black" ? "white" : "black";
    const wrong: RangeMove = {
      sets: [{ r: target.r, c: target.c, value: wrongValue }],
    };
    expect(rangeGame.hintKeepTrack?.(wrong, step, st)).toBe("off");

    // A different cell → off.
    const other = st.grid.findIndex(
      (v, i) => v <= 0 && i !== target.r * st.w + target.c,
    );
    const elsewhere: RangeMove = {
      sets: [{ r: Math.floor(other / st.w), c: other % st.w, value: target.value }],
    };
    expect(rangeGame.hintKeepTrack?.(elsewhere, step, st)).toBe("off");
  });
});

import { describe, expect, it } from "vitest";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { CLUE } from "./hint-text.ts";
import { type RangeHint, rangeGame } from "./index.ts";
import { deduceHintPlan, findErrors } from "./solver.ts";
import {
  BLACK,
  decodeParams,
  EMPTY,
  newState,
  type RangeCellValue,
  type RangeMove,
  type RangeState,
  WHITE,
} from "./state.ts";

function fromSeed(params: string, seed: string): RangeState {
  const p = decodeParams(params);
  const { desc } = rangeGame.newDesc(p, randomNew(seed));
  return newState(p, desc);
}

/** Every rule, on a board whose plan speaks it. */
describeHintPins({
  game: rangeGame,
  params: [decodeParams("9x6")],
  pins: {
    /** Held on 482 of 483 positions walked. */
    adjacency: {
      id: "9x6:d6c3d4f4l12f6d3c9d",
      moves:
        '[{"sets":[{"r":2,"c":6,"value":"white"}]},{"sets":[{"r":3,"c":5,"value":"white"}]},{"sets":[{"r":3,"c":4,"value":"white"}]},{"sets":[{"r":2,"c":4,"value":"black"}]},{"sets":[{"r":3,"c":3,"value":"white"}]},{"sets":[{"r":3,"c":2,"value":"white"}]},{"sets":[{"r":5,"c":5,"value":"white"}]},{"sets":[{"r":5,"c":6,"value":"white"}]},{"sets":[{"r":5,"c":3,"value":"white"}]},{"sets":[{"r":4,"c":0,"value":"white"}]},{"sets":[{"r":4,"c":5,"value":"white"}]},{"sets":[{"r":5,"c":2,"value":"white"}]},{"sets":[{"r":5,"c":1,"value":"black"}]},{"sets":[{"r":3,"c":0,"value":"white"}]},{"sets":[{"r":2,"c":0,"value":"black"}]},{"sets":[{"r":5,"c":7,"value":"white"}]},{"sets":[{"r":5,"c":8,"value":"white"}]}]',
    },
    /** Held on 483 of 483 positions walked. */
    satisfied: {
      id: "9x6:a3_7c5b7b6j8f4j12b4b6c8_5a",
      moves: [{ sets: [{ r: 1, c: 1, value: "white" }] }],
    },
    /** Held on 332 of 483 positions walked. */
    overrun: {
      id: "9x6:d6c3d4f4l12f6d3c9d",
      moves:
        '[{"sets":[{"r":2,"c":6,"value":"white"}]},{"sets":[{"r":3,"c":5,"value":"white"}]},{"sets":[{"r":3,"c":4,"value":"white"}]}]',
    },
    /** Held on 461 of 483 positions walked. */
    reach: "9x6:a4d6a4_9e7e7j6e10e4_6a5d8a",
    /** Held on 208 of 483 positions walked. */
    connect: {
      id: "9x6:3e11h9a5c10j6c5a8h11e12",
      moves:
        '[{"sets":[{"r":2,"c":6,"value":"white"}]},{"sets":[{"r":0,"c":5,"value":"white"}]},{"sets":[{"r":0,"c":4,"value":"white"}]},{"sets":[{"r":0,"c":3,"value":"white"}]},{"sets":[{"r":1,"c":0,"value":"white"}]},{"sets":[{"r":1,"c":5,"value":"white"}]},{"sets":[{"r":2,"c":4,"value":"white"}]},{"sets":[{"r":5,"c":3,"value":"white"}]},{"sets":[{"r":5,"c":4,"value":"white"}]},{"sets":[{"r":5,"c":5,"value":"white"}]},{"sets":[{"r":3,"c":2,"value":"white"}]},{"sets":[{"r":4,"c":8,"value":"white"}]},{"sets":[{"r":3,"c":8,"value":"white"}]},{"sets":[{"r":2,"c":8,"value":"white"}]},{"sets":[{"r":0,"c":8,"value":"black"}]},{"sets":[{"r":3,"c":6,"value":"white"}]},{"sets":[{"r":0,"c":2,"value":"white"}]},{"sets":[{"r":0,"c":1,"value":"black"}]},{"sets":[{"r":2,"c":0,"value":"white"}]},{"sets":[{"r":3,"c":0,"value":"black"}]},{"sets":[{"r":4,"c":6,"value":"white"}]},{"sets":[{"r":5,"c":6,"value":"white"}]},{"sets":[{"r":0,"c":7,"value":"white"}]},{"sets":[{"r":1,"c":7,"value":"black"}]},{"sets":[{"r":1,"c":4,"value":"white"}]},{"sets":[{"r":1,"c":3,"value":"white"}]},{"sets":[{"r":1,"c":2,"value":"black"}]},{"sets":[{"r":4,"c":1,"value":"white"}]},{"sets":[{"r":4,"c":3,"value":"white"}]},{"sets":[{"r":4,"c":4,"value":"white"}]},{"sets":[{"r":5,"c":0,"value":"black"}]},{"sets":[{"r":4,"c":5,"value":"black"}]},{"sets":[{"r":2,"c":2,"value":"white"}]},{"sets":[{"r":5,"c":7,"value":"white"}]},{"sets":[{"r":5,"c":1,"value":"white"}]},{"sets":[{"r":1,"c":1,"value":"white"}]},{"sets":[{"r":2,"c":7,"value":"white"}]},{"sets":[{"r":3,"c":1,"value":"white"}]}]',
    },
  },
});

describe("deduceHintPlan", () => {
  it("records an adjacency reason for a black cell's neighbor", () => {
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
    const plan = deduceHintPlan(grid, 3, 3);
    const adj = plan.find((m) => m.reason.kind === "adjacency");
    expect(adj).toBeDefined();
    expect(adj?.value).toBe(WHITE);
    if (adj?.reason.kind === "adjacency") {
      expect(adj.reason.from).toEqual({ r: 1, c: 1 });
    }
  });

  it("records a clue reason on a generated board", () => {
    const st = fromSeed("9x6", "range-hint-reason");
    const plan = deduceHintPlan(st.grid, st.w, st.h);
    expect(plan.length).toBeGreaterThan(0);
    expect(
      plan.some((m) => ["satisfied", "overrun", "reach"].includes(m.reason.kind)),
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

    // Apply every step move in order — the board ends error-free (solved).
    let cur = st;
    for (const step of res.steps) {
      cur = rangeGame.executeMove(cur, step.move);
    }
    expect(findErrors(cur.grid, cur.w, cur.h)).toBe(false);
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
        const hl = step.highlights as RangeHint;
        const marks = stepMarks(step);
        const outlined = marks.of("outline", CELL);
        const run = marks.of("stripes", CELL);
        expect(outlined.length + run.length).toBeGreaterThan(0);
        // Neither the outline nor the run includes the target cell itself.
        for (const cells of [outlined, run])
          expect(cells.some((a) => a.y === hl.target.r && a.x === hl.target.c)).toBe(
            false,
          );
      }
    }
  });

  it("ties 'this cell' to the second mark, on every step of every reason", () => {
    // Every Range step shows a second mark (the test above pins that), so a
    // bare "this cell" would point at neither it nor the target. The tie is
    // geometric — never a color name, which `docs/games/hints.md` § "Two marks
    // on the board" forbids as scheme-relative and invisible to a color-blind
    // reader.
    const TIE =
      /touches the outlined \S+ square|just past (?:it|them|the outlined cells?)|along the striped run(?: to|:) the ringed cell|the outlined cells? around it/;
    const kinds = new Set<string>();
    let checked = 0;
    for (const seed of ["range-hint-plan", "range-evidence-2", "range-evidence-3"]) {
      let cur = fromSeed("9x6", seed);
      for (let round = 0; round < 40; round++) {
        const res = rangeGame.hint?.(cur);
        if (!res?.ok) break;
        // `hint()` builds one step per plan entry, in order, so the reason and
        // the sentence it produced line up index for index.
        const plan = deduceHintPlan(cur.grid, cur.w, cur.h);
        expect(plan.length).toBe(res.steps.length);
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
      "adjacency",
      "connect",
      "overrun",
      "reach",
      "satisfied",
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
    const target = (step.highlights as RangeHint | undefined)?.target;
    if (!target) throw new Error("expected a target");

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
    const elsewhere: RangeMove = {
      sets: [{ r: (target.r + 1) % st.h, c: target.c, value: target.value }],
    };
    expect(rangeGame.hintKeepTrack?.(elsewhere, step, st)).toBe("off");
  });
});

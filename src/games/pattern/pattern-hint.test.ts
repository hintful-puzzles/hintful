/**
 * Tier-1 tests for Pattern's explained hint. The cross-game guarantees (a hint
 * solves from any mid-game position, a plan step is never a no-op, `hint()` is
 * pure) live in `engine/hint-resume.test.ts`. This file covers Pattern's own
 * bar: the plan completes the board, every forced cell agrees with the unique
 * solution, the narration teaches (indication-led, necessity voice), the
 * color-legend roles are disjoint, and refusal and keep-track behave.
 */
import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { bindingDefects } from "../../engine/testing/hint-binding.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { type PatternHint, patternGame } from "./index.ts";
import { deduceHintPlan, solveState } from "./solver.ts";
import {
  GRID_EMPTY,
  GRID_FULL,
  GRID_UNKNOWN,
  type PatternMove,
  type PatternParams,
  type PatternState,
} from "./state.ts";

const SEEDS = ["ph-a", "ph-b", "ph-c", "ph-d", "ph-e"];
const P: PatternParams = { w: 10, h: 10 };

function freshBoard(seed: string): PatternState {
  const { desc } = patternGame.newDesc(P, randomNew(seed));
  return patternGame.newState(P, desc);
}

/** The steps the tests below read, each pinned on a position whose hint opens
 * with one. The 30x30 boards are for the bottom rung, which only fires on
 * larger boards. */
const pinned = describeHintPins({
  game: patternGame,
  params: [P, { w: 30, h: 30 }],
  seeds: 4,
  kinds: {
    severalCells: (step) => (step.highlights as PatternHint).cells.length > 1,
  },
  pins: {
    /** Held on 593 of 1826 positions walked. */
    severalCells:
      "10x10:1.1.1.1/6.3/6.2/6.1/6.1/2.2/6/1.2/1/1/4/4/5/4/6.2/7/2/2.1/2.3/8",
    /** Held on 1826 of 1826 positions walked. */
    overlap: "10x10:1.1.1.1/6.3/6.2/6.1/6.1/2.2/6/1.2/1/1/4/4/5/4/6.2/7/2/2.1/2.3/8",
    /** Held on 1821 of 1826 positions walked. */
    unreachable: {
      id: "10x10:1.1.1.1/6.3/6.2/6.1/6.1/2.2/6/1.2/1/1/4/4/5/4/6.2/7/2/2.1/2.3/8",
      moves:
        '[{"type":"fillCells","value":1,"cells":[1,11,21,31,41,51]},{"type":"fillCells","value":1,"cells":[71,81,91]}]',
    },
    /** Built by hand: a 3x3 board whose first and last columns have no clue.
     * The scan's boards never had a clueless line. */
    lineEmpty: "3x3:/3//1/1/1",
    /** Held on 26 of 1826 positions walked. */
    intersection: {
      id: "30x30:4.3.5.3/2.3.3/4.4.1/4.2.4/9.4.2/8.3.5/1.3.2.3/2.1.1.2.1/5.1.5/5.1.3/3.3.3.8/3.1.1.8.3/3.8.2.5/4.11.2.5/5.5.3.3.3.1.1/8.1.1.8/2.3.3.2.1.1.5.4/2.3.1.2.9/4.4.7/4.7.5/16.1/11.1.1.1.1/7.3.2.1/7.1.1.1.2.4/2.3.1.2.2.2/2.1.4.3.3.4/2.1.7.5.3/4.3.2.6.6/2.4.8.4/1.3.2.1.3.3/5.4.5/11.4/1.4.9.1.1/6.2.4.5.2/10.4.5/1.4.9.1/2.1.4.12/1.3.1.13.4/1.4.5.1.12/1.5.5.4.2.2/1.4.2.2/1.2.8/6.5.1/4.8.1/1.1.4.3.1/2.1.1.2.4.1.1/6.2.4.2.5/7.2.1.1.3.5/1.5.2.3.1.6/2.6.3/2.1.6.3/4.4.2.3/3.4.4.2/3.5.3/1.1.4.3/1.3.3.2/2.1.2.4.1.1.4/2.2.4.4.1.1.3/3.3.3.5.4.3/4.4.1.3.3",
      moves:
        '[{"type":"fillCells","value":1,"cells":[313,343,373,403,433,463]},{"type":"fillCells","value":1,"cells":[104,134]},{"type":"fillCells","value":1,"cells":[284,314]},{"type":"fillCells","value":1,"cells":[166]},{"type":"fillCells","value":1,"cells":[286]},{"type":"fillCells","value":1,"cells":[616,646,676]},{"type":"fillCells","value":1,"cells":[796,826]},{"type":"fillCells","value":1,"cells":[380,410,440,470]},{"type":"fillCells","value":1,"cells":[537]},{"type":"fillCells","value":1,"cells":[747]},{"type":"fillCells","value":1,"cells":[129]},{"type":"fillCells","value":1,"cells":[198,199,200,201]},{"type":"fillCells","value":1,"cells":[230,260,290,320,350]},{"type":"fillCells","value":1,"cells":[231,261,291,321]},{"type":"fillCells","value":1,"cells":[222,223,224,225,226,227,228,229]},{"type":"fillCells","value":1,"cells":[236]},{"type":"fillCells","value":1,"cells":[245]},{"type":"fillCells","value":0,"cells":[5]},{"type":"fillCells","value":1,"cells":[250,251]},{"type":"fillCells","value":1,"cells":[258,259]},{"type":"fillCells","value":1,"cells":[262,263,264,265,266]},{"type":"fillCells","value":1,"cells":[516]},{"type":"fillCells","value":1,"cells":[535,536]},{"type":"fillCells","value":1,"cells":[856]}]',
    },
  },
});

/** `hint`/`solve` are optional on `Game`; assert Pattern provides them. */
function doHint(state: PatternState) {
  const r = patternGame.hint?.(state);
  if (!r) throw new Error("pattern has no hint()");
  return r;
}
function doSolve(state: PatternState) {
  const r = patternGame.solve?.(state, state);
  if (!r) throw new Error("pattern has no solve()");
  return r;
}

describe("pattern hint — plan correctness", () => {
  it("the full plan solves every generated board", () => {
    for (const seed of SEEDS) {
      let state = freshBoard(seed);
      const res = doHint(state);
      expect(res.ok, `${seed}: expected a plan from the empty board`).toBe(true);
      if (!res.ok) continue;
      for (const step of res.steps) state = patternGame.executeMove(state, step.move);
      expect(
        patternGame.status(state),
        `${seed}: plan did not complete the board`,
      ).toBe("solved");
    }
  });

  it("every forced cell agrees with the unique solution", () => {
    for (const seed of SEEDS) {
      const state = freshBoard(seed);
      const solution = solveState(state);
      expect(solution).not.toBeNull();
      if (!solution) continue;
      const plan = deduceHintPlan(state);
      for (const m of plan) {
        for (const cell of m.cells) {
          expect(
            solution[cell],
            `${seed}: hinted cell ${cell} value ${m.value} contradicts the solution`,
          ).toBe(m.value);
          // A hint only ever forces a currently-undecided cell.
          expect(state.grid[cell]).toBe(GRID_UNKNOWN);
        }
      }
    }
  });

  it("each firing is single-color (black overlaps, white gaps)", () => {
    for (const seed of SEEDS) {
      const plan = deduceHintPlan(freshBoard(seed));
      for (const m of plan) {
        expect([GRID_FULL, GRID_EMPTY]).toContain(m.value);
        if (m.reason.kind === "overlap") expect(m.value).toBe(GRID_FULL);
        if (m.reason.kind === "unreachable" || m.reason.kind === "lineEmpty") {
          expect(m.value).toBe(GRID_EMPTY);
        }
      }
    }
  });
});

describe("pattern hint — narration", () => {
  it("leads with the indication and concludes in the necessity voice", () => {
    let read = 0;
    for (const seed of SEEDS) {
      const res = doHint(freshBoard(seed));
      if (!res.ok) continue;
      for (const step of res.steps) {
        read++;
        const t = step.explanation;
        // Opens by naming the board pattern (the row/column being reasoned over).
        expect(t, `bad opener: "${t}"`).toMatch(/^(This|No run|Every way)\b/);
        // Concludes with a modal of necessity, never a bare state-of-being verb.
        expect(t, `no necessity modal: "${t}"`).toMatch(/must (be|stay) (black|white)/);
        expect(t, `flat state-of-being verb: "${t}"`).not.toMatch(
          /\b(is|are|stays|it's)\b/,
        );
      }
    }
    // Every seed refusing would leave this walking no narration at all.
    expect(read, "no seed produced a plan to read").toBeGreaterThan(0);
  });

  it("re-reads cleanly at the pinned (zero-slack) extreme", () => {
    // A run with no room to slide must not narrate "slide only 0 cells".
    let sawPinned = false;
    for (const seed of SEEDS) {
      const res = doHint(freshBoard(seed));
      if (!res.ok) continue;
      for (const step of res.steps) {
        expect(step.explanation).not.toMatch(/slide only 0 cell/);
        if (/has nowhere to slide/.test(step.explanation)) sawPinned = true;
      }
    }
    expect(sawPinned, "expected at least one zero-slack firing").toBe(true);
  });

  it("every step names a technique — no generic un-narrated fallback", () => {
    // Over a spread of sizes (the bottom rung only fires on larger boards), every
    // plan step carries a named line technique; none is a generic "just because".
    const named = new Set(["overlap", "unreachable", "lineEmpty", "intersection"]);
    for (const w of [10, 20, 30]) {
      for (let i = 0; i < 12; i++) {
        const P: PatternParams = { w, h: w };
        const { desc } = patternGame.newDesc(P, randomNew(`named-${w}-${i}`));
        const state = patternGame.newState(P, desc);
        for (const m of deduceHintPlan(state)) {
          expect(named.has(m.reason.kind), `un-named reason: ${m.reason.kind}`).toBe(
            true,
          );
        }
      }
    }
  });

  it("the intersection bottom rung narrates as an explained technique", () => {
    // The step shown for an intersection firing reads as a named
    // necessity-voice deduction (never the misleading "only one arrangement
    // fits").
    const t = pinned("intersection").step.explanation;
    expect(t, `bad intersection narration: "${t}"`).toMatch(
      /^Every way this (row|column)'s runs can fit (covers|leaves out) .*, so (it|they) must be (black|white)\.$/,
    );
    expect(t).not.toMatch(/only one arrangement/i);
  });
});

describe("pattern hint — color legend", () => {
  it("target / black-ref / white-ref roles are disjoint", () => {
    let read = 0;
    for (const seed of SEEDS) {
      for (const h of deduceHintPlan(freshBoard(seed))) {
        read++;
        const targets = new Set(h.cells);
        for (const b of h.blackRefs) expect(targets.has(b)).toBe(false);
        for (const w of h.whiteRefs) expect(targets.has(w)).toBe(false);
        const blacks = new Set(h.blackRefs);
        for (const w of h.whiteRefs) expect(blacks.has(w)).toBe(false);
      }
    }
    expect(read, "no seed produced a plan to read").toBeGreaterThan(0);
  });

  it("a cited ref is an actually-placed mark of its own color", () => {
    // Rings must sit on decided cells (their color is the evidence), never on
    // an undecided cell or a forced target.
    for (const seed of SEEDS) {
      const state = freshBoard(seed);
      const plan = deduceHintPlan(state);
      // Walk the plan on a working grid so refs are checked against the board
      // the step actually fires on.
      const working = Uint8Array.from(state.grid);
      for (const m of plan) {
        for (const b of m.blackRefs) expect(working[b]).toBe(GRID_FULL);
        for (const w of m.whiteRefs) expect(working[w]).toBe(GRID_EMPTY);
        for (const c of m.cells) working[c] = m.value;
      }
    }
  });
});

describe("pattern hint — boards the midend refuses", () => {
  it("counts a solved board as finished", () => {
    const state = freshBoard("ph-a");
    const sr = doSolve(state);
    expect(sr.ok).toBe(true);
    if (!sr.ok) return;
    const done = patternGame.executeMove(state, sr.move);
    expect(patternGame.status(done)).toBe("solved");
  });

  it("flags a cell set against the solution", () => {
    const state = freshBoard("ph-b");
    const solution = solveState(state);
    if (!solution) throw new Error("expected solvable");
    // Place the opposite of the solution at cell 0 → a guaranteed mistake.
    const wrong: PatternMove = {
      type: "fillCells",
      value: solution[0] === GRID_FULL ? GRID_EMPTY : GRID_FULL,
      cells: [0],
    };
    const bad = patternGame.executeMove(state, wrong);
    expect((patternGame.findMistakes?.(bad) ?? []).length).toBeGreaterThan(0);
  });
});

describe("pattern hint — keep track", () => {
  it("completes on a full follow, tracks a partial, drops a deviation", () => {
    // A multi-cell step, to exercise the shrink path.
    const { state, step } = pinned("severalCells");
    const h = step.highlights as PatternHint;

    // A partial fill of one target cell → onTrack, step shrinks to the rest.
    const partial: PatternMove = {
      type: "fillCells",
      value: h.value,
      cells: [h.cells[0]],
    };
    const clone = { ...step, highlights: { ...h }, move: step.move };
    expect(patternGame.hintKeepTrack?.(partial, clone, state)).toBe("onTrack");
    expect((clone.highlights as PatternHint).cells).toEqual(h.cells.slice(1));
    // The shrunk step's words name only the cells left, and say so in its text.
    const filled = patternGame.executeMove(state, partial);
    expect(
      bindingDefects(patternGame, filled, patternGame.newUi(filled), clone),
    ).toEqual([]);
    if (h.cells.length === 2) expect(clone.explanation).toMatch(/\bthis cell\b/);

    // Filling all cells at once → completed.
    const all: PatternMove = {
      type: "fillCells",
      value: h.value,
      cells: [...h.cells],
    };
    expect(
      patternGame.hintKeepTrack?.(all, { ...step, highlights: { ...h } }, state),
    ).toBe("completed");

    // Wrong value on a target → off.
    const wrongVal: PatternMove = {
      type: "fillCells",
      value: h.value === GRID_FULL ? GRID_EMPTY : GRID_FULL,
      cells: [h.cells[0]],
    };
    expect(
      patternGame.hintKeepTrack?.(wrongVal, { ...step, highlights: { ...h } }, state),
    ).toBe("off");
  });
});

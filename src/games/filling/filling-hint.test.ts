/**
 * Filling (Fillomino) hint tests. Tier 1 (the grouped deduction, the hint
 * plan, keep-track, refusals) + tier 2.5 (a render scenario of a hint frame).
 * See docs/games/hints.md.
 */
import { describe, expect, it } from "vitest";
import { hintFinishes } from "../../engine/hint-finishes.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew, randomUpto } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing, markSides } from "../../engine/testing/mark-shape.ts";
import { opsOfKind } from "../../engine/testing/recording-drawing.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import { type FillingHint, fillingGame } from "./index.ts";
import { COL_HINT, COL_HINT_CELL } from "./render.ts";
import { deduceHintPlan, type FillingHintMove, solveFilling } from "./solver.ts";
import { decodeParams, executeMove, type FillingState, newState } from "./state.ts";

function fromSeed(params: string, seed: string): FillingState {
  const p = decodeParams(params);
  const { desc } = fillingGame.newDesc(p, randomNew(seed));
  return newState(p, desc);
}

const SEEDS = ["filling-hint-a", "filling-hint-b", "filling-hint-c", "filling-hint-d"];

describe("deduceHintPlan", () => {
  it("groups a region's forced completion into one step", () => {
    // "1a2" = clue 1, empty, clue 2. The 2-region (one cell) can only complete
    // through the middle cell — an exact, single-square growth deduction.
    const st = newState(decodeParams("3x1"), "1a2");
    const plan = deduceHintPlan(st.board, st.clues, 3, 1);
    expect(plan.length).toBe(1);
    expect(plan[0].cells).toEqual([1]);
    expect(plan[0].value).toBe(2);
    expect(plan[0].reason).toEqual({ kind: "growth", n: 2, exact: true });
    expect(plan[0].area).toEqual([2]); // the existing clue-2 cell, shaded
  });

  it("can force several squares of one region in a single step", () => {
    // A 4-region (one clue) in a 4x1 strip can only run rightward: the three
    // empty cells are all forced together → one exact multi-square growth step.
    const st = newState(decodeParams("4x1"), "4c");
    const plan = deduceHintPlan(st.board, st.clues, 4, 1);
    expect(plan.length).toBe(1);
    expect([...plan[0].cells].sort((a, b) => a - b)).toEqual([1, 2, 3]);
    expect(plan[0].reason).toEqual({ kind: "growth", n: 4, exact: true });
  });

  it("only ever emits the four known reason kinds", () => {
    const kinds = new Set<string>();
    for (let s = 0; s < 24; s++) {
      const st = fromSeed("9x7", `filling-kinds-${s}`);
      for (const m of deduceHintPlan(st.board, st.clues, st.w, st.h))
        kinds.add(m.reason.kind);
    }
    for (const k of kinds) {
      expect(["growth", "blocked", "lonely", "bitmap"]).toContain(k);
    }
    expect(kinds.has("growth")).toBe(true); // region growth dominates
  });

  it("every region-based step shows non-empty evidence, never its own targets", () => {
    // The product goal: a hint shows *why*. Region steps (growth / blocked)
    // must carry a shaded region; the global candidate-elimination (bitmap)
    // step may reason non-locally — relaxed. No step shades a target cell.
    for (const seed of SEEDS) {
      const st = fromSeed("9x7", seed);
      const plan = deduceHintPlan(st.board, st.clues, st.w, st.h);
      expect(plan.length).toBeGreaterThan(0);
      for (const m of plan) {
        for (const c of m.cells) expect(m.area).not.toContain(c);
        if (m.reason.kind === "growth" || m.reason.kind === "blocked") {
          expect(m.area.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

/**
 * Candidate elimination is not monotone, so the rules can stall on a board
 * with more correct squares than the clues, and the plan then keeps what the
 * solver deduced from the clues alone. These two dealt boards are ones whose
 * plan needs that from the opening: the hint places a square of a region away
 * from the rest of it, and an elimination the clues gave is gone.
 */
describe("a board the rules stall on once more of it is filled", () => {
  const STALLING = [
    "7x9:a24h8e45552a5255a4d8a2a4d1b544d53a444553b",
    "9x13:3d6c2b84664d8a6a8838b9a48b9g6a49a77b6b777c3c244d4b473d1a4a8c77a7c4c38c5c52b2",
  ];

  function fromId(id: string): FillingState {
    const [params, desc] = id.split(":");
    return newState(decodeParams(params), desc);
  }

  /** The board `plan` leaves when played on `board`. */
  function played(board: ArrayLike<number>, plan: FillingHintMove[]): Int32Array {
    const out = Int32Array.from(board);
    for (const m of plan) for (const c of m.cells) out[c] = m.value;
    return out;
  }

  for (const id of STALLING) {
    it(`${id.split(":")[0]}: the plan finishes it, and would not from the board alone`, () => {
      const st = fromId(id);
      const { solved, board: answer } = solveFilling(st.clues, st.w, st.h);
      expect(solved).toBe(true);
      expect(hintFinishes(fillingGame, st)).toBe(true);

      const plan = deduceHintPlan(st.board, st.clues, st.w, st.h);
      expect([...played(st.board, plan)]).toEqual([...answer]);
      // With no run from the clues to keep, the same plan stops short, so
      // these boards do reach the kept deduction.
      const alone = deduceHintPlan(st.board, new Int32Array(st.w * st.h), st.w, st.h);
      expect(alone.length).toBeLessThan(plan.length);
      expect(played(st.board, alone)).toContain(0);
      // The kept step is narrated on the board it is shown on: its evidence
      // is that board's filled neighbors.
      const kept = plan[alone.length];
      expect(kept.reason.kind).toBe("bitmap");
      const before = played(st.board, plan.slice(0, alone.length));
      expect(kept.area.length).toBeGreaterThan(0);
      for (const c of kept.area) expect(before[c]).not.toBe(0);
    });
  }

  it("finishes from a player's positions, any share of the answer filled in", () => {
    let positions = 0;
    for (const id of STALLING) {
      const st = fromId(id);
      const answer = solveFilling(st.clues, st.w, st.h).board;
      const rng = randomNew(`filling-partial-${id}`);
      for (let round = 0; round < 40; round++) {
        const board = Int32Array.from(st.clues);
        const share = 10 + randomUpto(rng, 80);
        for (let i = 0; i < board.length; i++) {
          if (board[i] === 0 && randomUpto(rng, 100) < share) board[i] = answer[i];
        }
        const plan = deduceHintPlan(board, st.clues, st.w, st.h);
        expect([...played(board, plan)]).toEqual([...answer]);
        positions++;
      }
    }
    expect(positions).toBe(80);
  });
});

describe("hint", () => {
  it("returns a plan whose moves are legal and solve the board", () => {
    const st = fromSeed("9x7", "filling-hint-plan");
    const res = fillingGame.hint?.(st);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    expect(res.steps.length).toBeGreaterThan(0);

    let cur = st;
    for (const step of res.steps) {
      expect(step.explanation.length).toBeGreaterThan(0);
      cur = fillingGame.executeMove(cur, step.move);
    }
    expect(fillingGame.status(cur)).toBe("solved");
  });

  it("never shades a target cell in its own area", () => {
    for (const seed of SEEDS) {
      const st = fromSeed("9x7", seed);
      const res = fillingGame.hint?.(st);
      if (!res?.ok) throw new Error("expected a plan");
      for (const step of res.steps) {
        const marks = stepMarks(step);
        for (const c of marks.of("ring", CELL))
          expect(marks.of("outline", CELL)).not.toContainEqual(c);
      }
    }
  });

  it("counts the board its plan finishes as solved, so the midend refuses it", () => {
    const st = fromSeed("9x7", "filling-hint-solved");
    const res0 = fillingGame.hint?.(st);
    if (!res0?.ok) throw new Error("expected a plan");
    let cur = st;
    for (const step of res0.steps) cur = fillingGame.executeMove(cur, step.move);
    expect(fillingGame.status(cur)).toBe("solved");
  });

  it("flags a wrong value, so the midend refuses it", () => {
    const st = fromSeed("9x7", "filling-hint-mistake");
    const solution = solveFilling(st.clues, st.w, st.h).board;
    let target = -1;
    for (let i = 0; i < st.w * st.h; i++) {
      if (st.clues[i] === 0) {
        target = i;
        break;
      }
    }
    expect(target).toBeGreaterThanOrEqual(0);
    const wrong = solution[target] === 1 ? 2 : 1;
    const dirty = executeMove(st, { type: "set", cells: [target], value: wrong });
    expect(fillingGame.findMistakes?.(dirty).length ?? 0).toBeGreaterThan(0);
  });
});

describe("hintKeepTrack", () => {
  it("completes on a full fill, off on the wrong value or an extra cell", () => {
    const st = fromSeed("9x7", "filling-hint-track");
    const res = fillingGame.hint?.(st);
    if (!res?.ok) throw new Error("expected a plan");
    const step = res.steps[0];
    const hl = step.highlights as FillingHint;

    // Filling all the step's cells with the hinted value → completed.
    const all = { type: "set" as const, cells: [...hl.cells], value: hl.value };
    expect(fillingGame.hintKeepTrack?.(all, step, st)).toBe("completed");

    // The hinted cells, but the wrong value → off.
    const wrongValue = {
      type: "set" as const,
      cells: [...hl.cells],
      value: hl.value === 1 ? 2 : 1,
    };
    expect(fillingGame.hintKeepTrack?.(wrongValue, step, st)).toBe("off");

    // A cell outside the step → off.
    const stray = st.clues.findIndex((v, i) => v === 0 && !hl.cells.includes(i));
    const elsewhere = { type: "set" as const, cells: [stray], value: hl.value };
    expect(fillingGame.hintKeepTrack?.(elsewhere, step, st)).toBe("off");
  });

  it("stays on track and shrinks the step on a partial fill of a group", () => {
    // The 4x1 "4c" board forces three squares in one step; filling one of them
    // keeps the step on track with the other two still to go.
    const st = newState(decodeParams("4x1"), "4c");
    const res = fillingGame.hint?.(st);
    if (!res?.ok) throw new Error("expected a plan");
    const step = res.steps[0];
    const hl = step.highlights as FillingHint;
    expect(hl.cells.length).toBe(3);

    const one = { type: "set" as const, cells: [hl.cells[0]], value: hl.value };
    expect(fillingGame.hintKeepTrack?.(one, step, st)).toBe("onTrack");
    // The step shrank to the remaining two squares.
    expect((step.highlights as FillingHint).cells).toHaveLength(2);
    expect((step.highlights as FillingHint).cells).not.toContain(hl.cells[0]);
    // …and its words with it: the sentence rings the two squares left.
    expect(step.words?.refs.find((r) => r.role === "ring")?.elements).toHaveLength(2);
    expect(step.explanation).toBe(step.words?.text);
  });
});

const pinned = describeHintPins({
  game: fillingGame,
  params: [decodeParams("9x7")],
  kinds: {
    // A step about one region, which it stripes.
    stripedRegion: (step) => stepMarks(step).of("stripes", CELL).length > 0,
  },
  pins: {
    /** Held on 298 of 310 positions walked. */
    stripedRegion: "9x7:c2c2b6a5d53663a27a4c3a7a4b773a7c7b22324b6d2b",
    /** Held on 309 of 310 positions walked. */
    growth: "9x7:c2c2b6a5d53663a27a4c3a7a4b773a7c7b22324b6d2b",
    /** Held on 116 of 310 positions walked. */
    blocked: {
      id: "9x7:a64e4a65b354c95d569a9b7b4c5f45a52b3d4a2a",
      moves:
        '[{"type":"set","cells":[3],"value":4},{"type":"set","cells":[18],"value":6},{"type":"set","cells":[12],"value":5},{"type":"set","cells":[4],"value":4},{"type":"set","cells":[22],"value":5},{"type":"set","cells":[24],"value":5},{"type":"set","cells":[58],"value":4}]',
    },
    /** Held on 51 of 310 positions walked. */
    lonely: {
      id: "9x7:12d95d992a5542a99b55a4499c3a7h778b64478b8c5",
      moves:
        '[{"type":"set","cells":[45],"value":7},{"type":"set","cells":[56,57],"value":8},{"type":"set","cells":[61,60,59,50],"value":5},{"type":"set","cells":[42],"value":6},{"type":"set","cells":[43],"value":4},{"type":"set","cells":[34],"value":3},{"type":"set","cells":[44],"value":4},{"type":"set","cells":[33],"value":3},{"type":"set","cells":[41],"value":6},{"type":"set","cells":[39],"value":8},{"type":"set","cells":[32],"value":6},{"type":"set","cells":[36],"value":7},{"type":"set","cells":[2],"value":2},{"type":"set","cells":[20],"value":2},{"type":"set","cells":[27],"value":4},{"type":"set","cells":[38],"value":7},{"type":"set","cells":[49,40],"value":8},{"type":"set","cells":[23,24],"value":6},{"type":"set","cells":[5,4],"value":9},{"type":"set","cells":[15],"value":2}]',
    },
    /** Held on 120 of 310 positions walked. */
    bitmap: {
      id: "9x7:2b5a5a3b1a95b68b4a9a6e99a6b345a992d6b44b26d4b",
      moves:
        '[{"type":"set","cells":[4],"value":5},{"type":"set","cells":[6],"value":3},{"type":"set","cells":[21],"value":9},{"type":"set","cells":[26],"value":8},{"type":"set","cells":[28],"value":4},{"type":"set","cells":[39,48],"value":5},{"type":"set","cells":[43],"value":2},{"type":"set","cells":[35,44,53],"value":8},{"type":"set","cells":[56,57],"value":6},{"type":"set","cells":[49],"value":5},{"type":"set","cells":[45],"value":2},{"type":"set","cells":[27,18],"value":3},{"type":"set","cells":[58],"value":6},{"type":"set","cells":[29],"value":5},{"type":"set","cells":[19],"value":4}]',
    },
  },
});

describe("filling hint render scenario", () => {
  it("rings the target(s) and hatches the region the sentence names", () => {
    const { recording, step } = renderPinnedHint(fillingGame, pinned("stripedRegion"));
    const marks = stepMarks(step);
    expect(marks.of("stripes", CELL).length).toBeGreaterThan(0);
    expectRing(recording.ops, COL_HINT, marks.of("ring", CELL).length);
    // "The striped region of N": every cell of it hatched, the digits drawn
    // over the stripes, and no outline, since the region is not a particular
    // cell the reason rests on.
    expect(marks.of("outline", CELL)).toEqual([]);
    const hatches = opsOfKind(recording.ops, "hatch");
    expect(new Set(hatches.map((h) => `${h.x},${h.y}`)).size).toBe(
      marks.of("stripes", CELL).length,
    );
    expect(markSides(recording.ops, COL_HINT_CELL)).toEqual([]);
    expect(recording.ops.some((o) => o.op === "text")).toBe(true); // clues
    expect(recording.ops).toMatchSnapshot();
  });
});

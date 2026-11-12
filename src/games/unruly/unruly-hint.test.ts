// Tier-1 hint logic for Unruly: each step names its technique and marks its
// premise, the `hint` plan is legal + solves
// the board, refuses on solved / mistaken boards, groups one firing into one
// journey, and every step carries visible evidence. Plus `animLength` for the
// placement animation.
import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { newCursor } from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { type Cell, EMPTY as E, ONE as O, ZERO as Z } from "./constants.ts";
import { newDesc } from "./generator.ts";
import { type UnrulyHint, type UnrulyRung, unrulyGame } from "./index.ts";
import { PLACE_ANIM_TIME } from "./render.ts";
import { isComplete } from "./solver.ts";
import {
  encodeGrid,
  newState,
  type UnrulyMove,
  type UnrulyParams,
  type UnrulyState,
} from "./state.ts";

/** Build a state directly from a grid of cell values (no immutable clues). */
function craft(rows: Cell[][], unique = false): UnrulyState {
  const h2 = rows.length;
  const w2 = rows[0].length;
  const grid = new Uint8Array(w2 * h2);
  for (let y = 0; y < h2; y++)
    for (let x = 0; x < w2; x++) grid[y * w2 + x] = rows[y][x];
  return {
    w2,
    h2,
    unique,
    grid,
    immutable: new Uint8Array(w2 * h2),
  };
}

const blankRow = (): Cell[] => [E, E, E, E, E, E];
const padTo6 = (top: Cell[][]): Cell[][] => {
  const rows = top.slice();
  while (rows.length < 6) rows.push(blankRow());
  return rows;
};

const pinned = describeHintPins({
  game: unrulyGame,
  // No preset turns unique rows on, and only a board dealt with it fires
  // that rung.
  params: [
    { w2: 14, h2: 14, unique: false, diff: 2 },
    { w2: 8, h2: 8, unique: true, diff: 2 },
  ],
  descOf: (s) => encodeGrid(s.grid, s.w2 * s.h2),
  kinds: {
    // A board whose plan holds a firing that forces several cells.
    groupedPlan: (_step, state) => plan(state).some((s) => s.continuesPrevious),
  },
  pins: {
    /** Held on 1970 of 2399 positions walked. */
    groupedPlan: "14x14dn:bbadAfCAcDmfcccDFCceFEBDdBbOBbabamabGAJjbgbACJAc",
    /** Held on 2377 of 2399 positions walked. */
    threes: "14x14dn:bbadAfCAcDmfcccDFCceFEBDdBbOBbabamabGAJjbgbACJAc",
    /** Held on 2382 of 2399 positions walked. */
    lastGap: "8x8udn:mAaaAaifBaAAaAcAbAfAaDCaAa",
    /** Held on 1943 of 2399 positions walked. */
    quota: "8x8udn:mAaaAaiHaAAaAcAbAfAaDCaAa",
    /** Held on 431 of 2399 positions walked. */
    unique: "8x8udn:CCaAbdAaBDaADaaAbDaAccAaGaACaAaAb",
    /** Held on 2074 of 2399 positions walked. */
    lastOne: "8x8udn:aAaAAaAabAdBAaMFbbAAacdDACcb",
  },
});

/** The hint's steps from `state`: the plan, in the order a player meets it. */
function plan(state: UnrulyState): HintStep<UnrulyMove, UnrulyHint, UnrulyRung>[] {
  const res = unrulyGame.hint?.(state);
  if (!res?.ok) throw new Error("expected a plan");
  return res.steps;
}

/** The cells a step marks in `role`, as `x,y`, sorted. */
const markedAt = (
  step: HintStep<UnrulyMove, UnrulyHint, UnrulyRung>,
  role: "outline" | "stripes",
): string[] =>
  stepMarks(step)
    .of(role, CELL)
    .map((p) => `${p.x},${p.y}`)
    .sort();

describe("hint — per-technique steps", () => {
  it("threes: two same-color cells force the third opposite", () => {
    const [step] = plan(craft(padTo6([[O, O, E, E, E, E]])));
    expect(step.rung).toBe("threes");
    expect(step.highlights?.target).toEqual({ x: 2, y: 0, value: Z });
    expect(markedAt(step, "outline")).toEqual(["0,0", "1,0"]);
    expect(markedAt(step, "stripes")).toEqual([]);
  });

  it("groups one firing (a line-fill) into one journey, per-cell techniques apart", () => {
    // On a real board the same firing forces several cells (a completed count
    // or a near-complete remainder); they must read as one journey. In a
    // grouped plan every continuation shares its predecessor's firing (same
    // technique + line); the per-cell techniques never continue.
    const steps = plan(pinned("groupedPlan").state);
    let found = false;
    for (let i = 1; i < steps.length; i++) {
      if (!steps[i].continuesPrevious) continue;
      found = true;
      expect(steps[i].rung).toBe(steps[i - 1].rung);
      expect(["lastGap", "quota", "lastOne"]).toContain(steps[i].rung);
      expect(markedAt(steps[i], "stripes")).toEqual(markedAt(steps[i - 1], "stripes"));
    }
    // A threes/unique move (per-cell) is never a continuation.
    for (const step of steps) {
      if (step.rung === "threes" || step.rung === "unique")
        expect(step.continuesPrevious).toBe(false);
    }
    expect(found).toBe(true);
  });

  it("single gap: the lone empty in a count-complete line", () => {
    const [step] = plan(craft(padTo6([[O, Z, O, Z, O, E]])));
    expect(step.rung).toBe("lastGap");
    expect(step.highlights?.target).toEqual({ x: 5, y: 0, value: Z });
    expect(step.continuesPrevious).toBe(false);
  });

  it("near-complete: the worked example pins the last odd cell to a window", () => {
    // `1 1 0 . . .`: the last 1 can't go in the final cell (would make 0 0 0),
    // so the remaining cells are forced 0.
    const [step] = plan(craft(padTo6([[O, O, Z, E, E, E]])));
    expect(step.rung).toBe("lastOne");
    expect(step.highlights?.target).toEqual({ x: 5, y: 0, value: Z });
    // The window and the abutting piece it rests on.
    expect(markedAt(step, "outline")).toEqual(["2,0", "3,0", "4,0"]);
  });

  it("unique: a cell that would duplicate a full row is forbidden", () => {
    // Row 0 full, row 5 matches it except at two empties; the unique-rows rule
    // forces those cells away from duplicating row 0.
    const rows = padTo6([[O, Z, O, Z, O, Z]]);
    rows[5] = [O, Z, O, E, E, Z];
    const [step] = plan(craft(rows, true));
    expect(step.rung).toBe("unique");
    // The row being completed is striped, the row it would copy outlined.
    expect(markedAt(step, "stripes")).toEqual([
      "0,5",
      "1,5",
      "2,5",
      "3,5",
      "4,5",
      "5,5",
    ]);
    expect(markedAt(step, "outline")).toEqual([
      "0,0",
      "1,0",
      "2,0",
      "3,0",
      "4,0",
      "5,0",
    ]);
  });
});

function fromSeed(p: UnrulyParams, seed: string): UnrulyState {
  const { desc } = newDesc(p, randomNew(seed));
  return newState(p, desc);
}

describe("hint", () => {
  const P: UnrulyParams = { w2: 8, h2: 8, unique: false, diff: 1 };

  it("returns a plan whose moves are legal and solve the board", () => {
    const st = fromSeed(P, "unruly-hint-plan");
    const res = unrulyGame.hint?.(st);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    expect(res.steps.length).toBeGreaterThan(0);
    expect(res.steps[0].explanation.length).toBeGreaterThan(0);
    let cur = st;
    for (const step of res.steps) cur = unrulyGame.executeMove(cur, step.move);
    expect(isComplete(cur)).toBe(true);
  });

  it("gives every step visible evidence (a hatched line or a ringed premise)", () => {
    for (const seed of ["unruly-hint-plan", "unruly-ev-2", "unruly-ev-3"]) {
      const st = fromSeed(P, seed);
      const res = unrulyGame.hint?.(st);
      if (!res?.ok) throw new Error("expected a plan");
      for (const step of res.steps) {
        const hl = step.highlights as UnrulyHint;
        const marks = stepMarks(step);
        const line = marks.of("stripes", CELL);
        expect(line.length > 0 || marks.of("outline", CELL).length > 0).toBe(true);
        // A hatched line is one whole row or column, through the target.
        if (line.length > 0) {
          expect(line.some((p) => p.x === hl.target.x && p.y === hl.target.y)).toBe(
            true,
          );
          const rows = new Set(line.map((p) => p.y));
          const cols = new Set(line.map((p) => p.x));
          expect(rows.size === 1 ? st.w2 : cols.size === 1 ? st.h2 : -1).toBe(
            line.length,
          );
        }
      }
    }
  });

  it("counts the board its plan finishes as solved, so the midend refuses it", () => {
    const st = fromSeed(P, "unruly-hint-solved");
    const res0 = unrulyGame.hint?.(st);
    if (!res0?.ok) throw new Error("expected a plan");
    let cur = st;
    for (const step of res0.steps) cur = unrulyGame.executeMove(cur, step.move);
    expect(unrulyGame.status(cur)).toBe("solved");
  });

  it("flags the opposite of the hint's first move, so the midend refuses it", () => {
    const st = fromSeed(P, "unruly-hint-mistake");
    // The hint's own first move is correct; play the opposite → a mistake.
    const res = unrulyGame.hint?.(st);
    if (!res?.ok) throw new Error("expected a plan");
    const t = (res.steps[0].highlights as UnrulyHint).target;
    const wrong: Cell = t.value === O ? Z : O;
    const bad = unrulyGame.executeMove(st, {
      type: "place",
      x: t.x,
      y: t.y,
      value: wrong,
    });
    expect(unrulyGame.findMistakes?.(bad).length ?? 0).toBeGreaterThan(0);
  });
});

describe("hintKeepTrack", () => {
  it("completes when the move sets the hinted cell, off otherwise", () => {
    const st = fromSeed({ w2: 8, h2: 8, unique: false, diff: 1 }, "unruly-track");
    const res = unrulyGame.hint?.(st);
    if (!res?.ok) throw new Error("expected a plan");
    const step = res.steps[0];
    const t = (step.highlights as UnrulyHint).target;

    const right: UnrulyMove = {
      type: "place",
      x: t.x,
      y: t.y,
      value: t.value as Cell,
    };
    expect(unrulyGame.hintKeepTrack?.(right, step, st)).toBe("completed");

    const wrongVal: UnrulyMove = {
      type: "place",
      x: t.x,
      y: t.y,
      value: t.value === O ? Z : O,
    };
    expect(unrulyGame.hintKeepTrack?.(wrongVal, step, st)).toBe("off");

    const elsewhere: UnrulyMove = {
      type: "place",
      x: (t.x + 1) % st.w2,
      y: t.y,
      value: t.value as Cell,
    };
    expect(unrulyGame.hintKeepTrack?.(elsewhere, step, st)).toBe("off");
  });
});

describe("animLength", () => {
  const P: UnrulyParams = { w2: 6, h2: 6, unique: false, diff: 0 };
  const ui = { cursor: newCursor() };
  const blank = craft(padTo6([]));

  it("animates a single-cell placement", () => {
    const next = unrulyGame.executeMove(blank, { type: "place", x: 1, y: 1, value: O });
    expect(unrulyGame.animLength?.(blank, next, 1, ui)).toBe(PLACE_ANIM_TIME);
  });

  it("does not animate a bulk solve fill", () => {
    const st = fromSeed(P, "unruly-anim-solve");
    const solveRes = unrulyGame.solve?.(st, st);
    if (!solveRes?.ok) throw new Error("expected solvable");
    const solved = unrulyGame.executeMove(st, solveRes.move);
    expect(unrulyGame.animLength?.(st, solved, 1, ui)).toBe(0);
  });

  it("does not animate when nothing changed", () => {
    expect(unrulyGame.animLength?.(blank, blank, 1, ui)).toBe(0);
  });
});

/**
 * The claim `reading.ts` makes: every "cannot be +" or "cannot be −" bit the
 * solver ever holds on an undecided square is something the player can read off
 * the board: its placed poles, its `?` marks and its clue counts. That is why
 * the hint needs no notation for those two bits and may leave the firings that
 * set only them unshown (`hint.ts`).
 *
 * Held over whole solves from empty, one firing at a time, on the path the hint
 * actually walks (a recorder standing, so each rung returns per premise).
 */
import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { newMagnetsDesc } from "./generator.ts";
import { recordingPass, seedSolver } from "./hint.ts";
import { type ReadableBoard, whyNot } from "./reading.ts";
import {
  GS_NOTNEGATIVE,
  GS_NOTNEUTRAL,
  GS_NOTPOSITIVE,
  GS_SET,
  type MagnetsParams,
  NEGATIVE,
  NEUTRAL,
  newState,
  POSITIVE,
  presets,
  ROW,
} from "./state.ts";

const SEEDS = 6;
const PRESETS = presets().submenu ?? [];

describe("magnets board reading", () => {
  it("reads every NOT-pole bit the solver sets, at every firing", () => {
    let boards = 0;
    let bits = 0;
    let viaMagnets = 0;
    const unread: string[] = [];
    for (const entry of PRESETS) {
      if (!("params" in entry)) continue;
      const p = entry.params as MagnetsParams;
      for (let seed = 0; seed < SEEDS; seed++) {
        const label = `${p.w}x${p.h}d${p.diff}${p.stripclues ? "s" : ""}#${seed}`;
        const { desc } = newMagnetsDesc(p, randomNew(`magnets-reading-${label}`));
        const solver = seedSolver(newState(p, desc));
        if (!solver) throw new Error(`${label}: a fresh board failed to seed`);
        const pass = recordingPass(solver, stepBudget("magnets reading"));
        boards++;
        while (pass.next()) {
          for (let i = 0; i < solver.wh; i++) {
            if (solver.flags[i] & GS_SET) continue;
            for (const [bit, pole] of [
              [GS_NOTPOSITIVE, POSITIVE],
              [GS_NOTNEGATIVE, NEGATIVE],
            ] as const) {
              if (!(solver.flags[i] & bit)) continue;
              bits++;
              const r = whyNot(solver, i, pole);
              if (!r) unread.push(`${label} ${desc}: square ${i} not ${pole}`);
              const own = r?.kind === "partner" ? r.inner : r;
              if (own?.kind === "full" && own.magnets.length > 0) viaMagnets++;
            }
          }
        }
        expect(pass.impossible(), label).toBe(false);
      }
    }
    expect(unread).toEqual([]);
    // Vacuity: every preset walked, a real population of bits, and the arm
    // that counts marked magnets reached (it is `advancedfull`'s, and the one
    // most easily broken).
    expect(PRESETS.length).toBeGreaterThan(0);
    expect(boards).toBe(PRESETS.length * SEEDS);
    expect(bits).toBeGreaterThan(5000);
    expect(viaMagnets).toBeGreaterThan(20);
  });

  // A 4x2 board of two horizontal dominoes per row, with + clues of 1 on row 0
  // and every other clue absent.
  //   row 0: [0 1][2 3]
  //   row 1: [4 5][6 7]
  const common = {
    dominoes: Int32Array.from([1, 0, 3, 2, 5, 4, 7, 6]),
    rowcount: Int32Array.from([-1, 1, -1, -1, -1, -1]),
    colcount: new Int32Array(12).fill(-1),
  };
  const board = (grid: number[], flags: number[]): ReadableBoard => ({
    w: 4,
    h: 2,
    common,
    grid,
    flags,
  });

  it("names a touching pole, a met line, and the far end's reason", () => {
    const S = GS_SET;
    // A + placed at square 5 (so 4 is −).
    const b = board([0, 0, 0, 0, NEGATIVE, POSITIVE, 0, 0], [0, 0, 0, 0, S, S, 0, 0]);
    expect(whyNot(b, 1, POSITIVE)).toEqual({ kind: "touch", at: 5 });
    // Row 1's + is not clued, so only the touch speaks for square 6's −: its
    // partner 7 touches nothing, and 6 touches the + at 5, not a −.
    expect(whyNot(b, 6, NEGATIVE)).toBeNull();
    // 6 cannot be + (it touches the + at 5), so its partner 7 cannot be −.
    expect(whyNot(b, 7, NEGATIVE)).toEqual({
      kind: "partner",
      at: 6,
      inner: { kind: "touch", at: 5 },
    });
    // Row 0 has its one + placed: every other square there cannot be +.
    const full = board(
      [POSITIVE, NEGATIVE, 0, 0, 0, 0, 0, 0],
      [S, S, 0, 0, 0, 0, 0, 0],
    );
    expect(whyNot(full, 2, POSITIVE)).toEqual({
      kind: "full",
      line: { roworcol: ROW, num: 0 },
      placed: 1,
      magnets: [],
    });
  });

  it("counts a marked magnet lying along the line, but never the square's own", () => {
    // Row 0: domino [0 1] marked `?`, so it brings row 0's one +.
    const Q = GS_NOTNEUTRAL;
    const marked = board([0, 0, 0, 0, 0, 0, 0, 0], [Q, Q, 0, 0, 0, 0, 0, 0]);
    expect(whyNot(marked, 2, POSITIVE)).toEqual({
      kind: "full",
      line: { roworcol: ROW, num: 0 },
      placed: 0,
      magnets: [0],
    });
    // The marked domino itself is not ruled out by its own count.
    expect(whyNot(marked, 0, POSITIVE)).toBeNull();
  });

  it("reads only the poles", () => {
    const b = board([0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]);
    expect(() => whyNot(b, 0, NEUTRAL)).toThrow();
  });
});

/**
 * Mines' hint (`hint.ts`, `deduce.ts`, `hint-text.ts`): what it says, what it
 * marks, and that it never takes a flag on trust.
 */

import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { randomNew } from "../../engine/random/index.ts";
import type { AnyGame } from "../../engine/testing/enrollment.ts";
import { bindingDefects } from "../../engine/testing/hint-binding.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { DEAD_BOARD, type MinesHint } from "./hint.ts";
import { minesGame } from "./index.ts";
import { COL_HINT, COL_HINT_EVIDENCE } from "./render.ts";
import { FLAG, type MinesMove, type MinesState } from "./state.ts";

type Step = HintStep<MinesMove, MinesHint>;

const params = (w: number, h: number, n: number, unique = true) => ({
  ...minesGame.defaultParams(),
  w,
  h,
  n,
  unique,
});

function fresh(
  w: number,
  h: number,
  n: number,
  seed: string,
  unique = true,
): MinesState {
  const p = params(w, h, n, unique);
  return minesGame.newState(p, minesGame.newDesc(p, randomNew(seed)).desc);
}

const open = (x: number, y: number): MinesMove => ({
  type: "ops",
  ops: [{ op: "O", x, y }],
});

function plan(s: MinesState): Step[] {
  const r = minesGame.hint?.(s);
  if (!r?.ok) throw new Error(`no plan: ${r?.error}`);
  return r.steps;
}

/** Follow the hint to the end, collecting every step with the board it was
 * shown on; stops at a solve or a refusal. */
function walk(s0: MinesState): { steps: [MinesState, Step][]; end: MinesState } {
  const steps: [MinesState, Step][] = [];
  let s = s0;
  for (let round = 0; round < 60 && minesGame.status(s) !== "solved"; round++) {
    const r = minesGame.hint?.(s);
    if (!r?.ok) break;
    for (const step of r.steps) {
      steps.push([s, step]);
      s = minesGame.executeMove(s, step.move);
    }
  }
  return { steps, end: s };
}

describe("Mines hint: the start of a board", () => {
  it("opens the middle square of a board not laid out yet", () => {
    const s = fresh(9, 9, 10, "start");
    const steps = plan(s);
    expect(steps).toHaveLength(1);
    expect(steps[0].move).toEqual(open(4, 4));
    expect(steps[0].highlights).toEqual({ kind: "open", targets: [{ x: 4, y: 4 }] });
    expect(steps[0].explanation).toMatch(/^No mine is ever laid in the first square/);
    expect(
      bindingDefects(minesGame as AnyGame, s, minesGame.newUi(s), steps[0]),
    ).toEqual([]);
  });

  it("opens the crossed square after an undo back to the start", () => {
    const s0 = fresh(9, 9, 10, "restart");
    // Opening a corner lays the board out around it; s0 shares that layout.
    minesGame.executeMove(s0, open(0, 0));
    const steps = plan(s0);
    expect(steps).toHaveLength(1);
    expect(steps[0].move).toEqual(open(0, 0));
    expect(steps[0].explanation).toMatch(/drawn with a cross/);
  });

  it("refuses on a board whose last move opened a mine, telling the player to undo", () => {
    const s1 = minesGame.executeMove(fresh(9, 9, 10, "dead"), open(4, 4));
    const mines = s1.layout.mines as Int8Array;
    const i = mines.findIndex((m) => m === 1);
    const dead = minesGame.executeMove(s1, open(i % 9, Math.floor(i / 9)));
    expect(dead.dead).toBe(true);
    expect(minesGame.hint?.(dead)).toEqual({ ok: false, error: DEAD_BOARD });
  });
});

describe("Mines hint: the deductions", () => {
  // A dense preset reaches every rung within a few boards.
  const boards = Array.from({ length: 16 }, (_, k) =>
    minesGame.executeMove(fresh(9, 9, 35, `rungs-${k}`), open(4, 4)),
  );
  const walked = boards.map(walk);

  it("solves every board by following its own steps", () => {
    for (const { end } of walked) expect(minesGame.status(end)).toBe("solved");
  });

  it("teaches every rung, each bound to its marks", () => {
    const seen = { satisfied: 0, full: 0, pair: 0, count: 0 };
    let checked = 0;
    for (const { steps } of walked)
      for (const [s, step] of steps) {
        const t = step.explanation;
        if (/already touches|has no mine around it/.test(t)) seen.satisfied++;
        if (/unopened squares? (?:left )?around it, so/.test(t)) seen.full++;
        if (/allows? at most|can be among|both need/.test(t)) seen.pair++;
        if (/mines? (?:is|are) left|mines are found/.test(t)) seen.count++;
        expect(
          bindingDefects(minesGame as AnyGame, s, minesGame.newUi(s), step),
        ).toEqual([]);
        checked++;
      }
    expect(checked).toBeGreaterThan(500);
    for (const [rung, n] of Object.entries(seen))
      expect(n, `no ${rung} step in ${checked}`).toBeGreaterThan(0);
  });

  it("names two numbers of one value by where they sit", () => {
    // A sentence that names both (a continuation leg may name just one).
    const twins = walked
      .flatMap(({ steps }) => steps.map(([, step]) => step.explanation))
      .filter(
        (t) => (t.match(/\b(?:upper|lower|left|right) outlined \d/g) ?? []).length >= 2,
      );
    expect(twins.length).toBeGreaterThan(0);
    for (const t of twins) {
      const [, a] = /(upper|left) outlined/.exec(t) ?? [];
      const [, b] = /(lower|right) outlined/.exec(t) ?? [];
      expect(a !== undefined && b !== undefined, t).toBe(true);
    }
  });
});

describe("Mines hint: flags are the player's claims", () => {
  it("takes a flag off a square the numbers prove safe, then opens it", () => {
    const s1 = minesGame.executeMove(fresh(9, 9, 10, "wrong-flag"), open(4, 4));
    const target = plan(s1).find((st) => st.highlights?.kind === "open")?.highlights
      ?.targets[0];
    if (!target) throw new Error("the plan opens nothing");
    const flagged = minesGame.executeMove(s1, {
      type: "ops",
      ops: [{ op: "F", x: target.x, y: target.y }],
    });
    expect(flagged.grid[target.y * 9 + target.x]).toBe(FLAG);
    const steps = plan(flagged);
    const i = steps.findIndex(
      (st) =>
        st.highlights?.kind === "unflag" &&
        st.highlights.targets.some((t) => t.x === target.x && t.y === target.y),
    );
    expect(i).toBeGreaterThanOrEqual(0);
    expect(steps[i].explanation).toMatch(/must come off\.$/);
    // The same firing goes on to open it.
    expect(steps[i + 1].continuesPrevious).toBe(true);
    expect(steps[i + 1].highlights?.kind).toBe("open");
  });

  it("never cites a flag it has not proved, so a wrong flag does not move a premise", () => {
    const s1 = minesGame.executeMove(fresh(9, 9, 10, "decoy"), open(4, 4));
    const before = plan(s1).map((st) => st.explanation);
    // A flag on a covered square far from every opened number.
    const far = s1.grid.findIndex(
      (v, i) => v < 0 && !(s1.layout.mines as Int8Array)[i] && i !== 0,
    );
    const decoy = minesGame.executeMove(s1, {
      type: "ops",
      ops: [{ op: "F", x: far % 9, y: Math.floor(far / 9) }],
    });
    const after = plan(decoy).map((st) => st.explanation);
    // The first deduction reads the same, flag or no flag.
    expect(after[0]).toBe(before[0]);
  });
});

describe("Mines hint: following a step", () => {
  it("keeps an open step on track through a flood, and drops it for a flag", () => {
    const s1 = minesGame.executeMove(fresh(9, 9, 10, "track"), open(4, 4));
    const step = plan(s1).find((st) => st.highlights?.kind === "open");
    if (!step?.highlights) throw new Error("the plan opens nothing");
    const t = step.highlights.targets[0];
    const copy = (): Step => ({ ...step, move: structuredClone(step.move) });
    expect(minesGame.hintKeepTrack?.(open(t.x, t.y), copy(), s1)).not.toBe("off");
    const flag: MinesMove = { type: "ops", ops: [{ op: "F", x: t.x, y: t.y }] };
    expect(minesGame.hintKeepTrack?.(flag, copy(), s1)).toBe("off");
  });

  it("drops the targets the board already shows done", () => {
    const s1 = minesGame.executeMove(fresh(9, 9, 35, "refresh"), open(4, 4));
    const step = plan(s1).find(
      (st) => st.highlights?.kind === "flag" && st.highlights.targets.length > 1,
    );
    if (!step?.highlights) return expect.unreachable("no multi-square flag step");
    const [first, ...rest] = step.highlights.targets;
    const after = minesGame.executeMove(s1, {
      type: "ops",
      ops: [{ op: "F", x: first.x, y: first.y }],
    });
    const refreshed = minesGame.refreshHintStep?.(step, after);
    expect(refreshed?.highlights?.targets).toEqual(rest);
    expect(refreshed?.explanation).toBe(refreshed?.words?.text);
  });
});

describe("Mines hint: a board dealt without Ensure solubility", () => {
  it("says deduction has run out where it does", () => {
    let refused = 0;
    for (let k = 0; k < 10; k++) {
      const s = minesGame.executeMove(
        fresh(16, 16, 60, `risky-${k}`, false),
        open(8, 8),
      );
      const { end } = walk(s);
      if (minesGame.status(end) === "solved" || end.dead) continue;
      expect(minesGame.hint?.(end)).toEqual({ ok: false, error: DEDUCTION_EXHAUSTED });
      refused++;
    }
    expect(refused).toBeGreaterThan(0);
  });
});

describe("Mines hint: render (tier 2.5)", () => {
  it("rings what a two-number step decides, outlines the numbers and stripes the shared squares", () => {
    let found: ReturnType<typeof renderScenario> | null = null;
    for (let k = 0; k < 40 && found === null; k++) {
      const r = renderScenario({
        game: minesGame,
        id: `9x9n35#pair-${k}`,
        moves: [open(4, 4)],
        showHint: true,
        hintUntil: (step) =>
          / allows at most \d+ in the striped squares/.test(step.explanation),
      });
      if (r.hint && / allows at most/.test(r.hint.explanation)) found = r;
    }
    if (found === null) return expect.unreachable("no two-number step in 40 boards");
    const ops = found.recording.ops;
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT)).toBe(true);
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT_EVIDENCE)).toBe(
      true,
    );
    expect(ops.some((o) => o.op === "hatch" && o.color === COL_HINT)).toBe(true);
    expect(ops).toMatchSnapshot();
  });
});

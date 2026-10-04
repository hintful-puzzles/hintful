/**
 * Mines' hint (`hint.ts`, `deduce.ts`, `hint-text.ts`): what it says, what it
 * marks, and that it never takes a flag on trust.
 */

import { describe, expect, it } from "vitest";
import { DESC_NOT_DEDUCIBLE, loadVerdict } from "../../engine/desc-error.ts";
import type { HintStep } from "../../engine/game.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { Midend } from "../../engine/index.ts";
import { randomNew, randomUpto } from "../../engine/random/index.ts";
import { decodeSave, encodeSave } from "../../engine/save.ts";
import type { AnyGame } from "../../engine/testing/enrollment.ts";
import { bindingDefects } from "../../engine/testing/hint-binding.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { DEAD_BOARD, type MinesHint } from "./hint.ts";
import { minesGame } from "./index.ts";
import { COL_HINT, COL_HINT_EVIDENCE } from "./render.ts";
import { FLAG, type MinesMove, type MinesState } from "./state.ts";

type Step = HintStep<MinesMove, MinesHint>;

const params = (w: number, h: number, n: number) => ({
  ...minesGame.defaultParams(),
  w,
  h,
  n,
});

function fresh(w: number, h: number, n: number, seed: string): MinesState {
  const p = params(w, h, n);
  return minesGame.newState(p, minesGame.newDesc(p, randomNew(seed)).desc);
}

/** The public desc of a 16x16 board with 60 mines scattered at random around a
 * first click at (8, 8), as upstream lays one out with "Ensure solubility"
 * off: nothing makes it deducible. Written unmasked (`u`). */
function scattered(seed: string): string {
  const rs = randomNew(seed);
  const free: number[] = [];
  for (let i = 0; i < 256; i++)
    if (Math.abs((i >> 4) - 8) > 1 || Math.abs((i & 15) - 8) > 1) free.push(i);
  const nibbles = new Array<number>(64).fill(0);
  for (let n = 0; n < 60; n++) {
    const [i] = free.splice(randomUpto(rs, free.length), 1);
    nibbles[i >> 2] |= 8 >> (i & 3);
  }
  return `8,8,u${nibbles.map((v) => v.toString(16)).join("")}`;
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
    const i = mines.indexOf(1);
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

describe("Mines hint: a flag is a premise only once proved", () => {
  it("never cites a flag it has not proved, so a lucky flag does not move a premise", () => {
    const s1 = minesGame.executeMove(fresh(9, 9, 10, "decoy"), open(4, 4));
    const before = plan(s1).map((st) => st.explanation);
    // A right flag on a mine no opened number touches.
    const touched = (i: number) =>
      [-10, -9, -8, -1, 1, 8, 9, 10].some((d) => {
        const j = i + d;
        return (
          j >= 0 &&
          j < 81 &&
          Math.abs((j % 9) - (i % 9)) <= 1 &&
          s1.grid[j] >= 0 &&
          s1.grid[j] <= 8
        );
      });
    const far = s1.grid.findIndex(
      (v, i) => v < 0 && (s1.layout.mines as Int8Array)[i] === 1 && !touched(i),
    );
    expect(far).toBeGreaterThanOrEqual(0);
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

  // The plan never proves some of this board's mines, so the open that wins
  // leaves them covered and the win flags them. Judged "off", the step that
  // finished the board could not be played.
  it("keeps the winning open on track while the win flags the mines left", () => {
    const p = minesGame.defaultParams();
    const s0 = minesGame.newState(p, minesGame.newDesc(p, randomNew("census-2")).desc);
    const { steps, end } = walk(s0);
    expect(minesGame.status(end)).toBe("solved");
    const [s, last] = steps[steps.length - 1];
    const flagged = (b: MinesState) => b.grid.filter((v) => v === FLAG).length;
    expect(last.highlights?.kind).toBe("open");
    expect(flagged(end)).toBeGreaterThan(flagged(s));
    const copy: Step = { ...last, move: structuredClone(last.move) };
    expect(minesGame.hintKeepTrack?.(last.move, copy, s)).toBe("completed");
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

describe("Mines hint: a board that needs a guess", () => {
  it("does not load, and its hint says deduction has run out where it does", () => {
    const p = params(16, 16, 60);
    let refused = 0;
    for (let k = 0; k < 10; k++) {
      const desc = scattered(`risky-${k}`);
      const { end } = walk(minesGame.newState(p, desc));
      if (minesGame.status(end) === "solved") {
        expect(loadVerdict(minesGame, p, desc)).toBeNull();
        continue;
      }
      expect(minesGame.hint?.(end)).toEqual({ ok: false, error: DEDUCTION_EXHAUSTED });
      expect(loadVerdict(minesGame, p, desc)).toBe(DESC_NOT_DEDUCIBLE);
      refused++;
    }
    expect(refused).toBeGreaterThan(0);
  });

  it("is not restored from a save either", () => {
    // A save rebuilds from the private desc, which names no first click, so
    // the midend asks the public one.
    const m = new Midend(minesGame);
    expect(m.newGameFromId("16x16n60#save")).toBeNull();
    m.playMoves([open(8, 8)]);
    const save = decodeSave(m.saveGame());
    const p = params(16, 16, 60);
    const desc = Array.from({ length: 10 }, (_, k) => scattered(`risky-${k}`)).find(
      (d) => loadVerdict(minesGame, p, d) !== null,
    );
    if (desc === undefined) return expect.unreachable("no board needing a guess");
    const risky = encodeSave({ ...save, desc, privDesc: desc.slice("8,8,".length) });
    expect(new Midend(minesGame).loadGame(encodeSave(save))).toBeNull();
    expect(new Midend(minesGame).loadGame(risky)).toBe(
      `Could not restore this saved game: ${DESC_NOT_DEDUCIBLE}`,
    );
  });

  it("is not what the generator lays out", () => {
    for (let k = 0; k < 4; k++) {
      const s = minesGame.executeMove(fresh(16, 16, 60, `sound-${k}`), open(8, 8));
      expect(minesGame.finishesByDeduction?.(s)).toBe(true);
    }
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

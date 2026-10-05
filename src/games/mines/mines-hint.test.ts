/**
 * Mines' hint (`hint.ts`, `deduce.ts`, `hint-text.ts`): what it says, what it
 * marks, and that it never takes a flag on trust.
 */

import { describe, expect, it } from "vitest";
import { DESC_NOT_DEDUCIBLE, loadVerdict } from "../../engine/desc-error.ts";
import type { HintStep } from "../../engine/game.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { Midend } from "../../engine/index.ts";
import { randomNew, randomUpto } from "../../engine/random/index.ts";
import { decodeSave, encodeSave } from "../../engine/save.ts";
import type { AnyGame } from "../../engine/testing/enrollment.ts";
import { bindingDefects } from "../../engine/testing/hint-binding.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { DEAD_BOARD, type MinesHint, type MinesRung } from "./hint.ts";
import { minesGame } from "./index.ts";
import { COL_HINT, COL_HINT_EVIDENCE } from "./render.ts";
import { FLAG, type MinesMove, type MinesState } from "./state.ts";

type Step = HintStep<MinesMove, MinesHint, MinesRung>;

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

const flagged = (b: MinesState): number => b.grid.filter((v) => v === FLAG).length;

/** The steps the following and render tests read, each pinned on a position
 * whose hint opens with one. A board is laid out by its first click, so every
 * pin starts with the opening click in the middle. */
const pinned = describeHintPins({
  game: minesGame,
  params: [params(9, 9, 10), params(9, 9, 35)],
  opening: (): MinesMove[] => [open(4, 4)],
  kinds: {
    open: (step) => step.highlights?.kind === "open",
    severalFlags: (step) =>
      step.highlights?.kind === "flag" && step.highlights.targets.length > 1,
    // The plan never proves some of the board's mines, so the open that wins
    // leaves them covered and the win flags them.
    winningOpenFlagsTheRest: (step, state) => {
      if (step.highlights?.kind !== "open") return false;
      const end = minesGame.executeMove(state, step.move);
      return minesGame.status(end) === "solved" && flagged(end) > flagged(state);
    },
    // Two numbers that share squares: both outlined, the squares striped.
    twoNumbers: (step) =>
      step.rung === "pair" &&
      stepMarks(step).of("outline", CELL).length === 2 &&
      stepMarks(step).of("stripes", CELL).length > 0,
  },
  unreached: {
    restart:
      'spoken only on a laid-out board with no square open, which is a board undone back to its start: a pin is a desc and the moves played on it, and a laid-out desc opens its first square. "opens the crossed square after an undo back to the start" builds one',
  },
  pins: {
    /** Held on 351 of 632 positions walked. */
    open: {
      id: "9x9n10:r10,u,b5985f51ca0b0d130793b461c08d151bc905c2a2c3557702ac6e69f4a8be9a3fa9e10ca1eb20535440bf0cdd18db91fff447b724ed9a7c0ddbbf56ee02",
      moves:
        '[{"type":"ops","ops":[{"op":"O","x":4,"y":4}]},{"type":"ops","ops":[{"op":"F","x":2,"y":1}]}]',
    },
    /** Held on 103 of 632 positions walked. */
    severalFlags: {
      id: "9x9n10:r10,u,33c21e9a927d75aecf9e760f2d2c50656c6416164cb8fb65f1693562b902dedd1a9b0a5147240437f3fd8e3dfcb7f38d77ed22bf940754d980af7b1602",
      moves: [{ type: "ops", ops: [{ op: "O", x: 4, y: 4 }] }],
    },
    /** Held on 14 of 632 positions walked. */
    winningOpenFlagsTheRest: {
      id: "9x9n10:r10,u,b5985f51ca0b0d130793b461c08d151bc905c2a2c3557702ac6e69f4a8be9a3fa9e10ca1eb20535440bf0cdd18db91fff447b724ed9a7c0ddbbf56ee02",
      moves:
        '[{"type":"ops","ops":[{"op":"O","x":4,"y":4}]},{"type":"ops","ops":[{"op":"F","x":2,"y":1}]},{"type":"ops","ops":[{"op":"O","x":2,"y":0},{"op":"O","x":3,"y":0},{"op":"O","x":4,"y":0}]},{"type":"ops","ops":[{"op":"O","x":1,"y":0},{"op":"O","x":1,"y":1}]},{"type":"ops","ops":[{"op":"F","x":5,"y":0}]},{"type":"ops","ops":[{"op":"F","x":1,"y":6}]},{"type":"ops","ops":[{"op":"O","x":0,"y":4},{"op":"O","x":0,"y":5},{"op":"O","x":0,"y":6}]},{"type":"ops","ops":[{"op":"F","x":0,"y":3}]},{"type":"ops","ops":[{"op":"O","x":0,"y":1},{"op":"O","x":0,"y":2}]},{"type":"ops","ops":[{"op":"F","x":0,"y":0}]},{"type":"ops","ops":[{"op":"F","x":6,"y":4}]},{"type":"ops","ops":[{"op":"O","x":6,"y":2},{"op":"O","x":6,"y":3}]},{"type":"ops","ops":[{"op":"F","x":6,"y":1}]},{"type":"ops","ops":[{"op":"O","x":6,"y":0}]},{"type":"ops","ops":[{"op":"O","x":7,"y":0},{"op":"O","x":7,"y":1}]},{"type":"ops","ops":[{"op":"O","x":8,"y":0}]},{"type":"ops","ops":[{"op":"F","x":8,"y":6}]},{"type":"ops","ops":[{"op":"O","x":0,"y":7}]}]',
    },
    /** Held on 38 of 632 positions walked. */
    twoNumbers: {
      id: "9x9n35:r35,u,a0dba5e4ea00f0ab2d03b97355b4d34d6029eea9369f6d2f2b9a27d1bb251d2f93ab9d8bef2299dfd7cb11725e11f8be919d1d1b2af9c8422ce571b402",
      moves: [{ type: "ops", ops: [{ op: "O", x: 4, y: 4 }] }],
    },
    /** A board not laid out yet, which the scan's opening click is past: kept
     * by hand, with no move played. */
    firstClick:
      "9x9n10:r10,u,33c21e9a927d75aecf9e760f2d2c50656c6416164cb8fb65f1693562b902dedd1a9b0a5147240437f3fd8e3dfcb7f38d77ed22bf940754d980af7b1602",
    /** Held on 628 of 632 positions walked. */
    satisfied: {
      id: "9x9n10:r10,u,b5985f51ca0b0d130793b461c08d151bc905c2a2c3557702ac6e69f4a8be9a3fa9e10ca1eb20535440bf0cdd18db91fff447b724ed9a7c0ddbbf56ee02",
      moves:
        '[{"type":"ops","ops":[{"op":"O","x":4,"y":4}]},{"type":"ops","ops":[{"op":"F","x":2,"y":1}]}]',
    },
    /** Held on 582 of 632 positions walked. */
    full: {
      id: "9x9n10:r10,u,b5985f51ca0b0d130793b461c08d151bc905c2a2c3557702ac6e69f4a8be9a3fa9e10ca1eb20535440bf0cdd18db91fff447b724ed9a7c0ddbbf56ee02",
      moves: [{ type: "ops", ops: [{ op: "O", x: 4, y: 4 }] }],
    },
    /** Held on 201 of 632 positions walked. */
    pair: {
      id: "9x9n35:r35,u,a0dba5e4ea00f0ab2d03b97355b4d34d6029eea9369f6d2f2b9a27d1bb251d2f93ab9d8bef2299dfd7cb11725e11f8be919d1d1b2af9c8422ce571b402",
      moves: [{ type: "ops", ops: [{ op: "O", x: 4, y: 4 }] }],
    },
    /** Held on 122 of 632 positions walked. */
    count: {
      id: "9x9n10:r10,u,8c06a4442cfba80767c91c69ae55f206aa83611323495683336b351958dfd19388a2a63b6821a917dc303edce6f7b78d4289a412dcb2fa0ff747e70e02",
      moves:
        '[{"type":"ops","ops":[{"op":"O","x":4,"y":4}]},{"type":"ops","ops":[{"op":"F","x":4,"y":1}]},{"type":"ops","ops":[{"op":"O","x":4,"y":0}]},{"type":"ops","ops":[{"op":"O","x":3,"y":0},{"op":"O","x":3,"y":1}]},{"type":"ops","ops":[{"op":"F","x":3,"y":6}]},{"type":"ops","ops":[{"op":"F","x":7,"y":6}]},{"type":"ops","ops":[{"op":"O","x":8,"y":6}]},{"type":"ops","ops":[{"op":"O","x":2,"y":6}]},{"type":"ops","ops":[{"op":"F","x":1,"y":6},{"op":"F","x":1,"y":7},{"op":"F","x":1,"y":8}]},{"type":"ops","ops":[{"op":"O","x":1,"y":5},{"op":"O","x":2,"y":5}]},{"type":"ops","ops":[{"op":"F","x":2,"y":4}]},{"type":"ops","ops":[{"op":"O","x":2,"y":2},{"op":"O","x":2,"y":3}]},{"type":"ops","ops":[{"op":"F","x":2,"y":1}]},{"type":"ops","ops":[{"op":"O","x":2,"y":0}]},{"type":"ops","ops":[{"op":"O","x":1,"y":1},{"op":"O","x":1,"y":2},{"op":"O","x":1,"y":3}]},{"type":"ops","ops":[{"op":"F","x":1,"y":0}]},{"type":"ops","ops":[{"op":"O","x":0,"y":0},{"op":"O","x":0,"y":1},{"op":"O","x":0,"y":2}]},{"type":"ops","ops":[{"op":"O","x":0,"y":6}]},{"type":"ops","ops":[{"op":"F","x":0,"y":7}]}]',
    },
  },
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

  it("still knows the crossed square after that board is saved and loaded", () => {
    // A save rebuilds the board from its private desc, which holds the layout
    // and not the first click; replaying the click is what puts it back.
    const played = minesGame.executeMove(fresh(9, 9, 10, "restart-saved"), open(4, 4));
    const priv = minesGame.supersededDesc?.(played)?.privDesc;
    if (!priv) throw new Error("expected a private desc");
    const loaded = minesGame.newState(params(9, 9, 10), priv);
    minesGame.executeMove(loaded, open(4, 4));
    const steps = plan(loaded);
    expect(steps[0].rung).toBe("restart");
    expect(steps[0].move).toEqual(open(4, 4));
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
        if (step.rung in seen) seen[step.rung as keyof typeof seen]++;
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
    const { state: s1, step } = pinned("open");
    if (!step.highlights) throw new Error("unreachable");
    const t = step.highlights.targets[0];
    const copy = (): Step => ({ ...step, move: structuredClone(step.move) });
    expect(minesGame.hintKeepTrack?.(open(t.x, t.y), copy(), s1)).not.toBe("off");
    const flag: MinesMove = { type: "ops", ops: [{ op: "F", x: t.x, y: t.y }] };
    expect(minesGame.hintKeepTrack?.(flag, copy(), s1)).toBe("off");
  });

  // Judged "off", the step that finished the board could not be played.
  it("keeps the winning open on track while the win flags the mines left", () => {
    const { state: s, step: last } = pinned("winningOpenFlagsTheRest");
    const end = minesGame.executeMove(s, last.move);
    expect(minesGame.status(end)).toBe("solved");
    expect(flagged(end)).toBeGreaterThan(flagged(s));
    const copy: Step = { ...last, move: structuredClone(last.move) };
    expect(minesGame.hintKeepTrack?.(last.move, copy, s)).toBe("completed");
  });

  it("drops the targets the board already shows done", () => {
    const { state: s1, step } = pinned("severalFlags");
    if (!step.highlights) throw new Error("unreachable");
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
    const { id, moves, step } = pinned("twoNumbers");
    const found = renderScenario({ game: minesGame, id, moves, showHint: true });
    expect(found.hint?.explanation).toBe(step.explanation);
    const ops = found.recording.ops;
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT)).toBe(true);
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT_EVIDENCE)).toBe(
      true,
    );
    expect(ops.some((o) => o.op === "hatch" && o.color === COL_HINT)).toBe(true);
    expect(ops).toMatchSnapshot();
  });
});

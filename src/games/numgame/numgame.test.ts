/**
 * Numgame's own behavior: the codecs, a move, the input, the solver held to
 * an independent search, Solve, a lost board, a save, and the frame.
 *
 * The board most tests use is Countdown's most famous:
 *
 *     target 952 from 100 75 50 25 6 3
 *
 * whose answer, ((100 + 6) × 3 × 75 − 50) ÷ 25, takes all five operations.
 */
import { describe, expect, it } from "vitest";
import { UI_UPDATE } from "../../engine/game.ts";
import { Midend } from "../../engine/index.ts";
import {
  CURSOR_DOWN,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  LEFT_BUTTON,
} from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { numgameGame } from "./index.ts";
import { elementCenter, layout, opElement } from "./render.ts";
import { combine, OPS, type Op, Reach, stepsOf } from "./solver.ts";
import {
  decodeParams,
  encodeParams,
  executeMove,
  type NumgameMove,
  type NumgameState,
  newState,
} from "./state.ts";

const P = { large: 4, diff: 3 };
const DESC = "100,75,50,25,6,3=952";
const ID = `${encodeParams(P, true)}:${DESC}`;

const combo = (from: number, op: Op, into: number): NumgameMove => ({
  kind: "combine",
  from,
  into,
  op,
});

describe("numgame params", () => {
  it("round-trip through their string, tier included only in full", () => {
    const p = { large: 2, diff: 2 };
    expect(encodeParams(p, true)).toBe("l2dt");
    expect(decodeParams(encodeParams(p, true))).toEqual(p);
    // The brief form leaves the tier at the default's.
    expect(decodeParams(encodeParams(p, false))).toEqual({ ...p, diff: 1 });
  });
});

describe("numgame desc", () => {
  it("reads six numbers and a target", () => {
    const s = newState(P, DESC);
    expect(s.target).toBe(952);
    expect(s.dealt).toEqual([100, 75, 50, 25, 6, 3]);
    expect(s.slots.map((t) => t?.value)).toEqual([100, 75, 50, 25, 6, 3]);
  });

  it.each([
    ["five numbers", "100,75,50,25,6=952"],
    ["seven numbers", "100,75,50,25,6,3,1=952"],
    ["no target", "100,75,50,25,6,3"],
    ["a zero", "100,75,50,25,6,0=952"],
    ["a number past Countdown's cards", "101,75,50,25,6,3=952"],
    ["a target of five digits", "100,75,50,25,6,3=10000"],
    ["a stray character", "100,75,50,25,6,3=95x"],
  ])("refuses a desc with %s", (_why, desc) => {
    expect(() => newState(P, desc)).toThrow();
  });
});

describe("numgame moves", () => {
  const start = newState(P, DESC);

  it("puts the result in the larger number's place and empties the smaller's, either way round", () => {
    for (const m of [combo(0, "+", 4), combo(4, "+", 0)]) {
      const s = executeMove(start, m);
      expect(s.slots[4]).toBeNull();
      expect(s.slots[0]).toEqual({ value: 106, made: { a: 100, op: "+", b: 6 } });
    }
    expect(start.slots[0]?.value).toBe(100);
  });

  it("puts the result of two equal numbers in the lower place", () => {
    const twos = newState(P, "2,2,3,4,5,6=100");
    expect(executeMove(twos, combo(1, "*", 0)).slots.map((t) => t?.value)).toEqual([
      4,
      undefined,
      3,
      4,
      5,
      6,
    ]);
  });

  it("takes the smaller from or into the larger, whichever was tapped first", () => {
    expect(executeMove(start, combo(5, "-", 1)).slots[1]?.value).toBe(72);
    expect(executeMove(start, combo(5, "/", 1)).slots[1]?.value).toBe(25);
  });

  it.each([
    ["a remainder", combo(1, "/", 4)],
    ["a difference of nothing", combo(2, "-", 2)],
    ["an empty place", combo(5, "+", 4)],
  ])("refuses %s", (_why, move) => {
    const s = executeMove(start, combo(0, "+", 5));
    expect(() => executeMove(s, move)).toThrow();
  });

  it("refuses a move another build wrote", () => {
    expect(() =>
      executeMove(start, { kind: "combine", from: "0", into: 4, op: "+" } as never),
    ).toThrow();
    expect(() => executeMove(start, { kind: "flip" } as never)).toThrow(/numgame/);
  });

  it("is solved when a number on the board is the target", () => {
    let s: NumgameState = start;
    for (const m of [
      combo(0, "+", 4), // 106, in 100's place
      combo(0, "*", 5), // 318
      combo(0, "*", 1), // 23850
      combo(0, "-", 2), // 23800
    ]) {
      s = executeMove(s, m);
      expect(numgameGame.status(s)).toBe("ongoing");
    }
    expect(numgameGame.status(executeMove(s, combo(0, "/", 3)))).toBe("solved");
  });
});

describe("numgame input", () => {
  const start = newState(P, DESC);
  const ds = numgameGame.newDrawState(start, 64);
  const tap = (ui: ReturnType<typeof numgameGame.newUi>, element: number) =>
    numgameGame.interpretMove(start, ui, ds, elementCenter(ds, element), LEFT_BUTTON);

  it("makes a move from a number, an operator and another number", () => {
    const ui = numgameGame.newUi(start);
    expect(tap(ui, 0)).toBe(UI_UPDATE);
    expect(tap(ui, opElement("+"))).toBe(UI_UPDATE);
    // 100 is the larger, so it takes the result.
    expect(tap(ui, 4)).toEqual(combo(4, "+", 0));
  });

  it("moves the selection while no operator is chosen, and drops it on a second tap", () => {
    const ui = numgameGame.newUi(start);
    tap(ui, 0);
    tap(ui, 2);
    expect(ui.selected).toBe(2);
    tap(ui, 2);
    expect(ui.selected).toBeNull();
  });

  it("does nothing on a number the operator cannot combine with, or on the target", () => {
    const ui = numgameGame.newUi(start);
    tap(ui, 1); // 75
    tap(ui, opElement("/"));
    expect(tap(ui, 4)).toBeNull(); // 75 ÷ 6
    const target = { x: layout(64).rects[10].x + 2, y: layout(64).rects[10].y + 2 };
    expect(numgameGame.interpretMove(start, ui, ds, target, LEFT_BUTTON)).toBeNull();
  });

  it("chooses an operator by its key, and only with a number selected", () => {
    const ui = numgameGame.newUi(start);
    const key = (c: string) =>
      numgameGame.interpretMove(start, ui, ds, { x: 0, y: 0 }, c.charCodeAt(0));
    expect(key("x")).toBeNull();
    tap(ui, 0);
    expect(key("x")).toBe(UI_UPDATE);
    expect(ui.op).toBe("*");
    expect(key("/")).toBe(UI_UPDATE);
    expect(ui.op).toBe("/");
  });

  it("picks the number under the cursor with an operator's key, so three keys make a move", () => {
    const ui = numgameGame.newUi(start);
    const press = (b: number) =>
      numgameGame.interpretMove(start, ui, ds, { x: 0, y: 0 }, b);
    press(CURSOR_SELECT); // shows the cursor on the first number, 100
    expect(press("+".charCodeAt(0))).toBe(UI_UPDATE);
    expect(ui).toMatchObject({ selected: 0, op: "+" });
    press(CURSOR_DOWN);
    press(CURSOR_RIGHT);
    expect(press(CURSOR_SELECT)).toEqual(combo(4, "+", 0));
  });

  it("reaches the operators with the cursor", () => {
    const ui = numgameGame.newUi(start);
    const press = (b: number) =>
      numgameGame.interpretMove(start, ui, ds, { x: 0, y: 0 }, b);
    press(CURSOR_SELECT); // shows the cursor on the first number
    press(CURSOR_SELECT); // and selects it
    press(CURSOR_DOWN);
    press(CURSOR_DOWN);
    press(CURSOR_SELECT);
    expect(ui.op).toBe("+");
  });
});

/**
 * The oracle: a plain recursion over the multiset of numbers, which shares
 * nothing with the subset search but `combine`. Every value it reaches, with
 * the fewest operations, is what the solver says.
 */
function bruteForce(numbers: readonly number[]): Map<number, number> {
  const out = new Map<number, number>();
  const seen = new Set<string>();
  const walk = (nums: readonly number[], ops: number): void => {
    const key = [...nums].sort((a, b) => a - b).join(",");
    if (seen.has(key)) return;
    seen.add(key);
    for (const n of nums) if ((out.get(n) ?? Infinity) > ops) out.set(n, ops);
    for (let i = 0; i < nums.length; i++)
      for (let j = i + 1; j < nums.length; j++)
        for (const op of OPS) {
          const r = combine(nums[i], op, nums[j]);
          if (r === null) continue;
          walk([...nums.filter((_, k) => k !== i && k !== j), r], ops + 1);
        }
  };
  walk(numbers, 0);
  return out;
}

describe("numgame solver", () => {
  const boards: number[][] = [
    [100, 75, 50, 25, 6, 3],
    [1, 1, 2, 2, 3, 3],
    [10, 10, 9, 1],
  ];
  // Two dealt boards besides; the plain search takes a second on one with
  // large numbers, so two is what it earns.
  const rng = randomNew("numgame oracle");
  for (const large of [0, 2])
    boards.push(
      newState(P, numgameGame.newDesc({ large, diff: 1 }, rng).desc).dealt.slice(),
    );

  it.each(
    boards.map((b) => [b.join(" "), b]),
  )("agrees with a plain search on every value from %s", (_name, nums) => {
    const reach = new Reach(
      nums as number[],
      (nums as number[]).map((_, i) => i),
    );
    // The multiset walk counts the numbers themselves as 0 operations.
    const fewest = reach.allValues();
    expect(new Map([...fewest].sort())).toEqual(
      new Map([...bruteForce(nums as number[])].sort()),
    );
  });

  it("plays every calculation it gives to the value it is filed under", () => {
    const start = newState(P, DESC);
    const reach = new Reach(
      start.dealt,
      start.dealt.map((_, i) => i),
    );
    let played = 0;
    for (const [value, ops] of reach.allValues()) {
      if (value < 100 || value > 999) continue;
      const expr = reach.expression(value);
      if (expr === null) throw new Error(`no calculation for ${value}`);
      const steps = stepsOf(expr);
      expect(steps).toHaveLength(ops);
      const end = steps.reduce(
        (s, step) => executeMove(s, { kind: "combine", ...step }),
        start,
      );
      expect(end.slots.some((t) => t?.value === value)).toBe(true);
      played++;
    }
    // Every three-digit value this board makes was played.
    expect(played).toBeGreaterThan(800);
  });

  it("finds Countdown's 952 in five operations, and no fewer", () => {
    const start = newState(P, DESC);
    expect(new Reach(start.dealt, [0, 1, 2, 3, 4, 5]).fewestOps(952)).toBe(5);
  });
});

describe("numgame completion", () => {
  const start = newState(P, DESC);

  it("solves from the board as played where it can", () => {
    const played = executeMove(start, combo(0, "+", 4));
    const solved = numgameGame.solve?.(start, played);
    if (!solved?.ok) throw new Error("expected a solution");
    expect(solved.move).toMatchObject({ kind: "solve", restart: false });
    expect(numgameGame.status(executeMove(played, solved.move))).toBe("solved");
  });

  it("starts again from the numbers dealt where the board as played is lost", () => {
    // 100 × 75 × 50 = 375000, with 25, 6 and 3 left.
    const lost = executeMove(executeMove(start, combo(0, "*", 1)), combo(0, "*", 2));
    expect(numgameGame.hasNoSolution?.(lost)).toMatchObject({ ok: false });
    const solved = numgameGame.solve?.(start, lost);
    if (!solved?.ok) throw new Error("expected a solution");
    expect(solved.move).toMatchObject({ kind: "solve", restart: true });
    expect(numgameGame.status(executeMove(lost, solved.move))).toBe("solved");
  });

  it("refuses to load a target the numbers cannot make", () => {
    const midend = new Midend(numgameGame);
    expect(
      midend.newGameFromId(`${encodeParams(P, true)}:1,1,2,2,3,3=952`),
    ).not.toBeNull();
    expect(numgameGame.hasNoSolution?.(start)).toBe(false);
  });
});

describe("numgame save", () => {
  it("a saved game loads with its moves", () => {
    const { midend } = renderScenario({
      game: numgameGame,
      id: ID,
      moves: [combo(0, "+", 4), combo(0, "*", 5)],
    });
    const loaded = new Midend(numgameGame);
    expect(loaded.loadGame(midend.saveGame())).toBeNull();
    expect(loaded.formatAsText()).toBe(
      "Target: 952\n318 (106 × 3)  75  50\n25  -  -\n",
    );
  });
});

describe("numgame frame", () => {
  it("draws the board", () => {
    const { recording } = renderScenario({
      game: numgameGame,
      id: ID,
      moves: [combo(0, "+", 4)],
    });
    expect(recording.ops).toMatchSnapshot();
  });

  it("rings a hint's numbers and operator", () => {
    const hinted = renderScenario({ game: numgameGame, id: ID, showHint: true });
    expect(hinted.hint).toBeDefined();
    expectRing(hinted.recording.ops, { rings: 3 });
  });
});

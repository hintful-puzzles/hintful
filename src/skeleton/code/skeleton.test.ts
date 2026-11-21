/**
 * Skeleton's own behavior: the score, the codecs, the routing of keys and taps
 * onto the shared row mechanic, the answer row and its check, a save, and the
 * frame.
 */
import { describe, expect, it } from "vitest";
import { COL_ERROR } from "../../engine/color/roles.ts";
import { UI_UPDATE } from "../../engine/contract/game.ts";
import { CLEAR_BUTTON } from "../../engine/input/key-labels.ts";
import {
  CURSOR_SELECT,
  LEFT_BUTTON,
  PENCIL_MODE_BUTTON,
} from "../../engine/input/pointer.ts";
import { Midend } from "../../engine/midend/midend.ts";
import { randomNew } from "../../engine/random/index.ts";
import { ringsOf } from "../../engine/testing/mark-shape.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { skeletonGame } from "./index.ts";
import { answerRect, COL_IN_PLACE, centerOf, tileRect } from "./render.ts";
import {
  ABSENT,
  defaultParams,
  ELSEWHERE,
  encodeDesc,
  encodeParams,
  IN_PLACE,
  newDesc,
  newState,
  type SkeletonMove,
  type SkeletonState,
  type SkeletonUi,
  score,
  validateParams,
} from "./state.ts";

const P = defaultParams();
const CODE = [1, 2, 3, 4];
const ID = `${encodeParams(P, true)}:${encodeDesc(CODE)}`;
const SUBMIT = 13;
const key = (d: number): number => String(d).charCodeAt(0);

const guess = (...digits: number[]): SkeletonMove => ({ type: "guess", digits });

function start(): { state: SkeletonState; ui: SkeletonUi } {
  const state = newState(P, encodeDesc(CODE));
  return { state, ui: skeletonGame.newUi(state) };
}

/** Send `button` at `at`; a move is executed and the row rebuilt as the
 * midend would. */
function send(
  s: SkeletonState,
  ui: SkeletonUi,
  button: number,
  at = { x: 0, y: 0 },
): { state: SkeletonState; result: ReturnType<typeof skeletonGame.interpretMove> } {
  const ds = preferredDrawState(skeletonGame, s);
  const result = skeletonGame.interpretMove(s, ui, ds, at, button);
  if (result === null || result === UI_UPDATE) return { state: s, result };
  const next = skeletonGame.executeMove(s, result as SkeletonMove);
  skeletonGame.changedState?.(ui, s, next);
  return { state: next, result };
}

describe("the score", () => {
  it("marks in place, elsewhere and absent", () => {
    expect(score([1, 3, 5, 6], CODE)).toEqual([IN_PLACE, ELSEWHERE, ABSENT, ABSENT]);
  });
});

describe("params and desc", () => {
  it("write params as length, symbols and rows", () => {
    expect(encodeParams({ len: 3, nsymbols: 6, nguesses: 7 }, true)).toBe("3s6g7");
  });

  it("refuse fewer digits than the code is long", () => {
    expect(validateParams({ ...P, nsymbols: 3 }, true)).toMatch(/\.$/);
    expect(validateParams(P, true)).toBeNull();
  });

  it("deal a code of different digits, hidden in the desc", () => {
    const { desc } = newDesc(P, randomNew("deal"));
    const { code } = newState(P, desc);
    expect(new Set(code).size).toBe(P.len);
    expect(desc).not.toContain(code.join(""));
  });

  it.each([
    ["a repeated digit", encodeDesc([1, 1, 2, 3])],
    ["a digit past the last", encodeDesc([1, 2, 3, 9])],
    ["too short", encodeDesc([1, 2, 3])],
  ])("refuse a desc with %s", (_why, desc) => {
    expect(() => newState(P, desc)).toThrow();
  });
});

describe("the working row", () => {
  it("is filled by digit keys and sent by Submit", () => {
    let { state, ui } = start();
    for (const d of [5, 6, 1, 2]) send(state, ui, key(d));
    expect(ui.entries).toEqual([5, 6, 1, 2]);
    ({ state } = send(state, ui, SUBMIT));
    expect(state.rows).toHaveLength(1);
    expect(state.rows[0].marks).toEqual([ABSENT, ABSENT, ELSEWHERE, ELSEWHERE]);
    expect(ui.entries).toEqual([0, 0, 0, 0]);
  });

  it("refuses a row that repeats a digit, saying why, until it is edited", () => {
    const { state, ui } = start();
    for (const d of [5, 5, 1, 2]) send(state, ui, key(d));
    expect(send(state, ui, SUBMIT).result).toBe(UI_UPDATE);
    expect(ui.refused).toBe(true);
    expect(skeletonGame.statusbarText?.(state, ui)).toMatch(/the 5 is used twice/);
    send(state, ui, CLEAR_BUTTON);
    expect(ui.refused).toBe(false);
  });

  it("a tap on a square chooses where the next digit goes", () => {
    const { state, ui } = start();
    const ts = preferredDrawState(skeletonGame, state).tileSize;
    send(state, ui, LEFT_BUTTON, centerOf(tileRect(ts, 0, 2)));
    send(state, ui, key(6));
    expect(ui.entries).toEqual([0, 0, 6, 0]);
  });
});

describe("the answer row", () => {
  it("a tap on a slot switches to marks, and a digit rules itself out there", () => {
    let { state, ui } = start();
    const ts = preferredDrawState(skeletonGame, state).tileSize;
    send(state, ui, LEFT_BUTTON, centerOf(answerRect(ts, P, 1)));
    expect(ui.pencilMode).toBe(true);
    ({ state } = send(state, ui, key(5)));
    expect(state.ruledOut[1]).toBe(1 << 5);
    ({ state } = send(state, ui, key(5)));
    expect(state.ruledOut[1]).toBe(0);
  });

  it("Enter on a square, and the Marks key, switch the mode", () => {
    const { state, ui } = start();
    send(state, ui, key(1));
    send(state, ui, CURSOR_SELECT);
    expect(ui.pencilMode).toBe(true);
    send(state, ui, PENCIL_MODE_BUTTON);
    expect(ui.pencilMode).toBe(false);
  });

  it("a rule-out of the code's own digit is the one mistake", () => {
    const { state } = start();
    const mark = (pos: number, value: number): SkeletonMove => ({
      type: "mark",
      marks: [{ pos, value }],
      ruledOut: true,
    });
    const right = skeletonGame.executeMove(state, mark(0, 5));
    expect(skeletonGame.findMistakes?.(right)).toEqual([]);
    const wrong = skeletonGame.executeMove(right, mark(2, 3));
    expect(skeletonGame.findMistakes?.(wrong)).toEqual([{ pos: 2 }]);
  });
});

describe("the end", () => {
  it("the solve move wins", () => {
    const { state } = start();
    const solved = skeletonGame.solve(state, state);
    if (!solved?.ok) throw new Error("expected the code");
    expect(skeletonGame.status(skeletonGame.executeMove(state, solved.move))).toBe(
      "solved",
    );
  });

  it("running out of rows loses, and names the code", () => {
    const short = newState({ ...P, nguesses: 1 }, encodeDesc(CODE));
    const lost = skeletonGame.executeMove(short, guess(4, 3, 2, 1));
    expect(skeletonGame.status(lost)).toBe("lost");
    expect(skeletonGame.statusbarText?.(lost, skeletonGame.newUi(lost))).toMatch(
      /1234/,
    );
  });
});

describe("a save", () => {
  it("keeps the rows, the marks and the row being written", () => {
    const { midend } = renderScenario({
      game: skeletonGame,
      id: ID,
      moves: [guess(5, 6, 1, 2)],
    });
    midend.processInput(0, 0, key(3));
    const loaded = new Midend(skeletonGame);
    const saved = midend.saveGame();
    expect(loaded.loadGame(saved)).toBeNull();
    expect(loaded.saveGame()).toEqual(saved);
    expect(new TextDecoder().decode(saved)).toContain("3...");
  });
});

describe("the frame", () => {
  it("draws the board", () => {
    const { recording } = renderScenario({
      game: skeletonGame,
      id: ID,
      moves: [guess(1, 5, 6, 2)],
    });
    expect(recording.ops).toMatchSnapshot();
    expect(recording.ops.some((op) => paintsWith(op, COL_IN_PLACE))).toBe(true);
  });

  it("frames a mistake and rings a hint's marks", () => {
    const wrong = renderScenario({
      game: skeletonGame,
      id: ID,
      moves: [{ type: "mark", marks: [{ pos: 0, value: 1 }], ruledOut: true }],
      showMistakes: true,
    });
    expect(wrong.mistakeCount).toBe(1);
    expect(wrong.recording.ops.some((op) => paintsWith(op, COL_ERROR))).toBe(true);

    const hinted = renderScenario({
      game: skeletonGame,
      id: ID,
      moves: [guess(5, 6, 1, 2)],
      showHint: true,
    });
    expect(hinted.hint).toBeDefined();
    expect(ringsOf(hinted.recording.ops).length).toBeGreaterThan(0);
  });
});

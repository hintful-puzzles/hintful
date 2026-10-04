/*
 * The check behind Check & save (`Midend.check`): mistakes first, then the
 * hint's verdict, without showing a hint.
 */
import { describe, expect, it, vi } from "vitest";
import { type FakeMove, type FakeState, fakeGame } from "./fake-game.ts";
import type { HintResult } from "./game.ts";
import {
  CONTRADICTION_UNLOCALIZED,
  DEDUCTION_EXHAUSTED,
  type MarkedDeadEnd,
  markedDeadEnd,
  SEARCH_OUT_OF_REACH,
} from "./hint-refusal.ts";
import { CELL, mark, phrase } from "./hint-words.ts";
import { Midend } from "./midend.ts";
import { decodeSave } from "./save.ts";
import { RecordingDrawing } from "./testing/recording-drawing.ts";

/** What the hint says at each count below the target; a plan anywhere else. */
const REFUSALS: Record<number, () => HintResult<FakeMove>> = {
  [-1]: () => ({ ok: false, error: CONTRADICTION_UNLOCALIZED }),
  [-2]: () =>
    markedDeadEnd(
      phrase`${mark.the("outline", CELL, [{ x: 0, y: 0 }], "square").capitalized()} is cut off. Undo.`,
    ),
  [-3]: () => ({ ok: false, error: SEARCH_OUT_OF_REACH }),
  [-4]: () => ({ ok: false, error: DEDUCTION_EXHAUSTED }),
};

function plan(s: FakeState): HintResult<FakeMove> {
  if (!fakeGame.hint) throw new Error("fakeGame has a hint");
  return fakeGame.hint(s, undefined, null);
}

function checkedGame() {
  const hint = vi.fn(
    (s: FakeState): HintResult<FakeMove> => REFUSALS[s.count]?.() ?? plan(s),
  );
  const shown: (MarkedDeadEnd | null)[] = [];
  const game: typeof fakeGame = {
    ...fakeGame,
    hint,
    findMistakes: (s) => (s.count === -9 ? ["wrong"] : []),
    redraw: (_dr, ds, _p, _s, _d, _ui, _a, _f, _h, _m, deadEnd) => {
      ds.redrawCalls += 1;
      shown.push(deadEnd ?? null);
    },
  };
  const m = new Midend(game);
  m.newGameFromId("t3:g3-0");
  const at = (count: number) => {
    const decs: FakeMove[] = Array.from({ length: -count }, () => "dec");
    m.playMoves(decs);
  };
  const paint = (): MarkedDeadEnd | null => {
    m.redraw(new RecordingDrawing(game.colors([0, 0, 0])));
    return shown[shown.length - 1] ?? null;
  };
  return { m, hint, at, paint };
}

describe("the check behind Check & save", () => {
  it("finds mistakes first, and never asks the hint about a wrong board", () => {
    const { m, hint, at } = checkedGame();
    at(-9);
    expect(m.check()).toEqual({ kind: "mistakes", count: 1 });
    expect(hint).not.toHaveBeenCalled();
  });

  it("refuses a dead end the hint names, in its words", () => {
    const { m, at } = checkedGame();
    at(-1);
    expect(m.check()).toEqual({ kind: "dead-end", reason: CONTRADICTION_UNLOCALIZED });
  });

  it("marks a dead end's cause until the next move puts it away", () => {
    const { m, at, paint } = checkedGame();
    at(-2);
    const verdict = m.check();
    expect(verdict).toEqual({
      kind: "dead-end",
      reason: "The outlined square is cut off. Undo.",
    });
    expect(paint()?.words.text).toBe("The outlined square is cut off. Undo.");
    m.playMoves(["inc"]);
    expect(paint()).toBeNull();
  });

  it("marks it on a Hint press too", () => {
    const { m, at, paint } = checkedGame();
    at(-2);
    expect(m.hint()).toBe("The outlined square is cut off. Undo.");
    expect(m.activeHintStep()).toBeNull();
    expect(paint()?.words.text).toBe("The outlined square is cut off. Undo.");
  });

  it("settles nothing past the search's reach, and passes a board deduction ran out on", () => {
    const { m, at, paint } = checkedGame();
    at(-3);
    expect(m.check()).toEqual({ kind: "out-of-reach" });
    m.playMoves(["dec"]);
    expect(m.check()).toEqual({ kind: "sound", mistakesChecked: true });
    expect(paint()).toBeNull();
  });

  // Owner, 2026-10-04: a check that finds something saves the player the time
  // of finding it, which is the app doing some of the solving; one that finds
  // nothing does not.
  describe("counts as help exactly when it finds something", () => {
    const helped = (m: { saveGame(): Uint8Array }) =>
      decodeSave(m.saveGame()).hinted === true;

    it("on mistakes, from Check and from the Hint button alike", () => {
      for (const press of ["check", "hint"] as const) {
        const { m, at } = checkedGame();
        at(-9);
        expect(helped(m)).toBe(false);
        m[press]();
        expect(helped(m), press).toBe(true);
      }
    });

    it("on a dead end, marked or not, from either button", () => {
      for (const count of [-1, -2]) {
        for (const press of ["check", "hint"] as const) {
          const { m, at } = checkedGame();
          at(count);
          m[press]();
          expect(helped(m), `${press} at ${count}`).toBe(true);
        }
      }
    });

    it("not on a sound board, nor on one the hint can settle nothing about", () => {
      const { m, at } = checkedGame();
      expect(m.check()).toEqual({ kind: "sound", mistakesChecked: true });
      expect(helped(m)).toBe(false);
      at(-3);
      expect(m.check()).toEqual({ kind: "out-of-reach" });
      expect(m.hint()).toBe(SEARCH_OUT_OF_REACH);
      m.playMoves(["dec"]);
      expect(m.check()).toEqual({ kind: "sound", mistakesChecked: true });
      expect(helped(m)).toBe(false);
    });
  });

  it("shows no hint, and takes a stored plan as its answer", () => {
    const { m, hint } = checkedGame();
    expect(m.check()).toEqual({ kind: "sound", mistakesChecked: true });
    expect(m.activeHintStep()).toBeNull();
    expect(m.hint()).toBeNull();
    hint.mockClear();
    expect(m.check()).toEqual({ kind: "sound", mistakesChecked: true });
    expect(hint).not.toHaveBeenCalled();
  });

  it("asks nothing of a finished board, or of a game with neither hook", () => {
    const { m, hint } = checkedGame();
    m.playMoves(["inc", "inc", "inc"]);
    hint.mockClear();
    expect(m.check()).toEqual({ kind: "sound", mistakesChecked: true });
    expect(hint).not.toHaveBeenCalled();

    const bare = new Midend({ ...fakeGame, hint: undefined });
    bare.newGameFromId("t3:g3-0");
    expect(bare.check()).toEqual({ kind: "sound", mistakesChecked: false });
  });
});

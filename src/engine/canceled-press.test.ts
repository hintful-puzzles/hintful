/**
 * **A canceled press leaves a game as it was before the press**, swept
 * through the real registry and a real `Midend`, so a game is covered the day
 * it is registered.
 *
 * The engine owns this (`Midend.cancelPress`): it puts back the `Ui` and the
 * place in the history it kept at the press, and no game hears of a cancel.
 * So what is guarded is that the engine can do it for every game's `Ui`, and
 * that nothing a gesture changes lives anywhere the engine does not put back.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { LEFT_BUTTON, LEFT_RELEASE } from "./pointer.ts";
import { REGISTERED_GAME_COUNT, REGISTERED_GAMES } from "./testing/enrollment.ts";
import { canceledPresses, probeBoard, probePoints } from "./testing/input-probe.ts";
import { inSweep, itOverWholeSweep } from "./testing/slow.ts";
import type { Point } from "./types.ts";

beforeAll(registerAllGames);

/**
 * Games in which the probe canceled no press that had moved, each with why.
 * The moved case says nothing about them, so the set is asserted exact. Empty,
 * and meant to stay so.
 */
const NO_MOVED_PRESS: Record<string, string> = {};

/** A point where this game makes a move on the press itself, found by
 * trying: a table of which games act on the press would be a manifest. */
function pressThatMoves(b: ReturnType<typeof probeBoard>): Point | null {
  for (const p of probePoints(b.size)) {
    b.reset();
    const before = b.moves();
    const claimed = b.m.processInput(p.x, p.y, LEFT_BUTTON);
    const moved = b.moves() !== before;
    b.m.processInput(p.x, p.y, LEFT_RELEASE);
    if (claimed && moved) return p;
  }
  return null;
}

describe("a canceled press leaves a game as it was before the press", () => {
  it("sweeps a non-trivial population", () => {
    expect(REGISTERED_GAME_COUNT).toBeGreaterThanOrEqual(57);
  });

  // One case per game, so a run scoped to one game walks only that game's
  // board (`testing/game-scope.ts`); what reads across them follows the loop.
  const unmovedOnly: string[] = [];
  let actOnThePress = 0;

  for (const [id, game] of REGISTERED_GAMES) {
    it(`${id}: with both buttons, moved and unmoved, and with no press open`, () => {
      const r = canceledPresses(game, id);
      expect(r.canceled, "no press was claimed, so none was canceled").toBeGreaterThan(
        0,
      );
      expect(r.left, `of ${r.canceled} presses canceled`).toEqual([]);
      if (r.moved === 0) unmovedOnly.push(id);

      const b = probeBoard(game, id);
      expect(b.m.cancelPress(), "nothing was pressed").toBe(false);
      for (const p of probePoints(b.size).slice(0, 12)) {
        b.m.processInput(p.x, p.y, LEFT_BUTTON);
        b.m.processInput(p.x, p.y, LEFT_RELEASE);
        const released = b.held();
        expect(b.m.cancelPress(), "the press was released").toBe(false);
        expect(b.held()).toBe(released);
      }

      const p = pressThatMoves(b);
      if (p === null) return;
      actOnThePress++;

      // One move made and undone: it is what Redo holds.
      b.reset();
      b.m.processInput(p.x, p.y, LEFT_BUTTON);
      b.m.processInput(p.x, p.y, LEFT_RELEASE);
      const played = b.held();
      b.m.undo();
      const undone = b.held();

      // A press there makes a move, which drops what was ahead of it, and a
      // cancel takes the move back and keeps the moves ahead for Redo.
      b.m.processInput(p.x, p.y, LEFT_BUTTON);
      expect(b.moves(), "the press made its move").toBe(1);
      expect(b.m.cancelPress(), "a press was open").toBe(true);
      expect(b.held(), "the canceled press's move stayed").toBe(undone);
      expect(b.moves()).toBe(0);
      b.m.redo();
      expect(b.held(), "Redo lost the move ahead of the press").toBe(played);

      // Once the board has changed under the press, a cancel changes nothing:
      // the gesture's own move, then an Undo from outside it.
      b.reset();
      b.m.processInput(p.x, p.y, LEFT_BUTTON);
      b.m.processInput(p.x, p.y, LEFT_RELEASE);
      b.m.processInput(p.x, p.y, LEFT_BUTTON);
      b.m.undo();
      const after = b.held();
      expect(b.m.cancelPress(), "the press outlived an Undo").toBe(false);
      expect(b.held()).toBe(after);
    });
  }

  it("canceled a press that had moved in every game but the ones it names", () => {
    expect(unmovedOnly.sort()).toEqual(
      Object.keys(NO_MOVED_PRESS).filter(inSweep).sort(),
    );
  });

  // Most click games act on the press; a handful would mean a broken probe.
  itOverWholeSweep("found a press that makes a move in most click games", () => {
    expect(actOnThePress).toBeGreaterThanOrEqual(10);
  });
});

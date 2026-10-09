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
import { builtGames } from "./testing/enrollment.ts";
import { canceledPresses, probeBoard, probePoints } from "./testing/input-probe.ts";
import type { Point } from "./types.ts";

beforeAll(registerAllGames);

/**
 * Games in which the probe canceled no press that had moved, each with why.
 * The moved case says nothing about them, so the set is asserted exact. Empty,
 * and meant to stay so.
 */
const NO_MOVED_PRESS: Record<string, string> = {};

describe("a canceled press leaves a game as it was before the press", () => {
  it("sweeps a non-trivial population", () => {
    expect(builtGames().length).toBeGreaterThanOrEqual(57);
  });

  it("in every game, with both buttons, moved and unmoved", () => {
    const left: string[] = [];
    const unmovedOnly: string[] = [];
    const power: string[] = [];
    for (const { id, game } of builtGames()) {
      const r = canceledPresses(game, id);
      // Named first, so the failure says which games and how many presses.
      for (const l of r.left.slice(0, 3)) left.push(`${id}: ${l}`);
      if (r.left.length > 3) left.push(`${id}: and ${r.left.length - 3} more`);
      expect(
        r.canceled,
        `${id}: no press was claimed, so none was canceled`,
      ).toBeGreaterThan(0);
      if (r.moved === 0) unmovedOnly.push(id);
      power.push(`${id} ${r.canceled}`);
    }
    expect(left, `presses canceled per game: ${power.join(", ")}`).toEqual([]);
    expect(unmovedOnly.sort()).toEqual(Object.keys(NO_MOVED_PRESS).sort());
  });

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

  it("takes back a move the press made, and keeps the moves ahead for Redo", () => {
    let exercised = 0;
    for (const { id, game } of builtGames()) {
      const b = probeBoard(game, id);
      const p = pressThatMoves(b);
      if (p === null) continue;
      exercised++;

      // One move made and undone: it is what Redo holds.
      b.reset();
      b.m.processInput(p.x, p.y, LEFT_BUTTON);
      b.m.processInput(p.x, p.y, LEFT_RELEASE);
      const played = b.held();
      b.m.undo();
      const undone = b.held();

      // A press there makes a move, which drops what was ahead of it.
      b.m.processInput(p.x, p.y, LEFT_BUTTON);
      expect(b.moves(), `${id}: the press made its move`).toBe(1);
      expect(b.m.cancelPress(), `${id}: a press was open`).toBe(true);
      expect(b.held(), `${id}: the canceled press's move stayed`).toBe(undone);
      expect(b.moves()).toBe(0);

      b.m.redo();
      expect(b.held(), `${id}: Redo lost the move ahead of the press`).toBe(played);
    }
    // Most click games act on the press; a handful would mean a broken probe.
    expect(exercised).toBeGreaterThanOrEqual(10);
  });

  it("changes nothing once the board has changed under the press", () => {
    let exercised = 0;
    for (const { id, game } of builtGames()) {
      const b = probeBoard(game, id);
      const p = pressThatMoves(b);
      if (p === null) continue;
      exercised++;
      b.reset();
      b.m.processInput(p.x, p.y, LEFT_BUTTON);
      b.m.processInput(p.x, p.y, LEFT_RELEASE);
      b.m.processInput(p.x, p.y, LEFT_BUTTON);
      // The gesture's own move, then an Undo from outside it.
      b.m.undo();
      const after = b.held();
      expect(b.m.cancelPress(), `${id}: the press outlived an Undo`).toBe(false);
      expect(b.held()).toBe(after);
    }
    expect(exercised).toBeGreaterThanOrEqual(10);
  });

  it("changes nothing with no press open", () => {
    for (const { id, game } of builtGames()) {
      const b = probeBoard(game, id);
      expect(b.m.cancelPress(), `${id}: nothing was pressed`).toBe(false);
      for (const p of probePoints(b.size).slice(0, 12)) {
        b.m.processInput(p.x, p.y, LEFT_BUTTON);
        b.m.processInput(p.x, p.y, LEFT_RELEASE);
        const released = b.held();
        expect(b.m.cancelPress(), `${id}: the press was released`).toBe(false);
        expect(b.held()).toBe(released);
      }
    }
  });
});

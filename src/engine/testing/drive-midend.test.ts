import { describe, expect, expectTypeOf, it } from "vitest";
import { cubeGame } from "../../games/cube/index.ts";
import { Midend } from "../midend.ts";
import { CURSOR_RIGHT } from "../pointer.ts";
import { driveMidend, type Notification, observeMidend } from "./drive-midend.ts";

describe("driveMidend", () => {
  it("records nothing until a game is dealt", () => {
    const h = driveMidend(cubeGame);
    expect(h.notes).toEqual([]);
    expect(h.last("game-state-change")).toBeNull();
    expect(h.redraws()).toBe(0);
  });

  it("last(type) is the newest notification of that type, typed by it", () => {
    const h = driveMidend(cubeGame);
    expect(h.midend.newGameFromId("c3x3:000,4")).toBeNull();
    const before = h.last("status-bar-change");
    expectTypeOf(before).toEqualTypeOf<Notification<"status-bar-change"> | null>();
    expect(before?.statusBarText).toContain("Moves: 0");

    expect(h.midend.processInput(0, 0, CURSOR_RIGHT)).toBe(true);
    expect(h.last("status-bar-change")?.statusBarText).toContain("Moves: 1");
    expect(h.last("game-state-change")?.currentMove).toBe(1);
    expect(h.redraws()).toBeGreaterThan(0);
  });

  it("clearing notes forgets what came before", () => {
    const h = driveMidend(cubeGame);
    h.midend.newGameFromId("c3x3:000,4");
    h.notes.length = 0;
    expect(h.last("game-id-change")).toBeNull();
  });

  it("observeMidend replaces the callbacks of a midend the test holds", () => {
    const m = new Midend(cubeGame);
    const first = observeMidend(m);
    const second = observeMidend(m);
    m.newGameFromId("c3x3:000,4");
    expect(first.notes).toEqual([]);
    expect(second.last("game-id-change")).not.toBeNull();
  });

  it("timerActive reports the midend's last request for the clock", () => {
    const h = driveMidend(cubeGame);
    expect(h.timerActive()).toBe(false);
    h.midend.newGameFromId("c3x3:000,4");
    // Cube animates its roll.
    h.midend.processInput(0, 0, CURSOR_RIGHT);
    expect(h.timerActive()).toBe(true);
  });
});

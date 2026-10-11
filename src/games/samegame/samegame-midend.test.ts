// Tier-1 midend integration: drive the real `Midend` with Same Game
// through a selection (status bar must update on the selection-only
// UI_UPDATE), a removal that scores and compacts, undo, and a win that
// reports "solved".
import { describe, expect, it } from "vitest";
import { LEFT_BUTTON } from "../../engine/pointer.ts";
import { driveMidend } from "../../engine/testing/drive-midend.ts";
import { samegameGame } from "./index.ts";

const TS = 32; // the midend sets the preferred tile size (32); border = 16.
const at = (cx: number, cy: number) => ({ x: cx * TS + 16 + 10, y: cy * TS + 16 + 10 });

function harness() {
  const h = driveMidend(samegameGame);
  const status = () => h.last("game-state-change")?.status;
  const statusBar = () => h.last("status-bar-change")?.statusBarText;
  return { m: h.midend, status, statusBar };
}

describe("Same Game midend lifecycle", () => {
  it("updates the status bar on a selection-only UI update", () => {
    const h = harness();
    // row0: 1 1 2 / row1: 3 3 3 / row2: 1 2 2, scoring (n-1)².
    expect(h.m.newGameFromId("3x3c3s1:1,1,2,3,3,3,1,2,2")).toBeNull();
    expect(h.statusBar()).toBe("Score: 0");
    // Select the color-3 group (cell (0,1)); no history move, but the
    // status bar must reflect the selection.
    expect(h.m.processInput(at(0, 1).x, at(0, 1).y, LEFT_BUTTON)).toBe(true);
    expect(h.statusBar()).toBe("Score: 0  Selected: 3 (4)"); // (3-1)² under s1
  });

  it("removes a group, scoring and compacting, and undo restores it", () => {
    const h = harness();
    h.m.newGameFromId("3x3c3s1:1,1,2,3,3,3,1,2,2");
    h.m.processInput(at(0, 1).x, at(0, 1).y, LEFT_BUTTON); // select group of 3
    h.m.processInput(at(0, 1).x, at(0, 1).y, LEFT_BUTTON); // confirm removal
    expect(h.statusBar()).toBe("Score: 4"); // (3-1)² = 4
    h.m.undo();
    expect(h.statusBar()).toBe("Score: 0");
  });

  it("opens the save of a game played until it is stuck", () => {
    const h = harness();
    // row0: 1 1 3 / row1: 2 3 2. Removing the 1s leaves the 3s corner to
    // corner and the 2s apart: no move.
    expect(h.m.newGameFromId("3x2c3s2:1,1,3,2,3,2")).toBeNull();
    h.m.processInput(at(0, 0).x, at(0, 0).y, LEFT_BUTTON);
    h.m.processInput(at(0, 0).x, at(0, 0).y, LEFT_BUTTON);
    expect(h.statusBar()).toBe("Cannot move! Score: 0");
    // Loading refuses a dealt board with no move; this one was dealt a move.
    const save = h.m.saveGame();
    const again = harness();
    expect(again.m.loadGame(save)).toBeNull();
    expect(again.statusBar()).toBe("Cannot move! Score: 0");
    again.m.undo();
    expect(again.statusBar()).toBe("Score: 0");
  });

  it("reports solved when the board is cleared", () => {
    const h = harness();
    h.m.newGameFromId("2x1c3s2:1,1");
    h.m.processInput(at(0, 0).x, at(0, 0).y, LEFT_BUTTON); // select the pair
    h.m.processInput(at(0, 0).x, at(0, 0).y, LEFT_BUTTON); // remove → empty board
    expect(h.status()).toBe("solved");
    expect(h.statusBar()).toContain("COMPLETED!");
  });
});

import { describe, expect, it } from "vitest";
import { GridDrag, newDrag, startDrag } from "./pointer.ts";
import { copyUi, restoreUi } from "./ui-snapshot.ts";

describe("a Ui copied and put back", () => {
  it("keeps a GridDrag a GridDrag, and independent of the live one", () => {
    const ui = { drag: newDrag() };
    const saved = copyUi(ui);
    startDrag(ui.drag, 3, 4);
    expect(saved.drag).toBeInstanceOf(GridDrag);
    expect(saved.drag.live).toBe(false);
    restoreUi(ui, saved);
    expect(ui.drag).toBeInstanceOf(GridDrag);
    expect(ui.drag.live).toBe(false);
  });

  it("copies arrays, typed arrays, sets and maps by value", () => {
    const ui = {
      cells: [1, 2],
      reach: new Uint8Array([1, 0]),
      sel: new Set([5]),
      at: new Map([["a", { n: 1 }]]),
    };
    const saved = copyUi(ui);
    ui.cells.push(3);
    ui.reach[1] = 9;
    ui.sel.add(6);
    const a = ui.at.get("a");
    if (a) a.n = 2;
    restoreUi(ui, saved);
    expect(ui.cells).toEqual([1, 2]);
    expect(ui.reach).toEqual(new Uint8Array([1, 0]));
    expect(ui.reach).toBeInstanceOf(Uint8Array);
    expect([...ui.sel]).toEqual([5]);
    expect(ui.at.get("a")).toEqual({ n: 1 });
  });

  it("keeps one object reached twice as one object, cycles included", () => {
    const shared = { n: 1 };
    const ui: { a: object; b: object; self?: unknown } = { a: shared, b: shared };
    ui.self = ui;
    const saved = copyUi(ui);
    expect(saved.a).toBe(saved.b);
    expect(saved.a).not.toBe(shared);
    expect(saved.self).toBe(saved);
  });

  it("restores in place, and drops a field the gesture added", () => {
    const ui: { cursor: { x: number }; pending?: boolean } = { cursor: { x: 1 } };
    const held = ui;
    const saved = copyUi(ui);
    ui.pending = true;
    ui.cursor = { x: 7 };
    restoreUi(ui, saved);
    expect(ui).toBe(held);
    expect(ui).toEqual({ cursor: { x: 1 } });
    expect("pending" in ui).toBe(false);
  });

  it("refuses an object whose content is not its own properties", () => {
    expect(() => copyUi({ at: new Date(0) })).toThrow(/\[object Date\]/);
  });

  it("is nothing to do for a game with no Ui", () => {
    expect(copyUi(undefined)).toBeUndefined();
    expect(() => restoreUi(undefined, undefined)).not.toThrow();
  });
});

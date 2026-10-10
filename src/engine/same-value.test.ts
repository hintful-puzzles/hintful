import { describe, expect, it } from "vitest";
import { GridDrag, newDrag } from "./pointer.ts";
import { sameShown, sameValue } from "./same-value.ts";
import { copyUi } from "./ui-snapshot.ts";

/** A state of every kind the games hold, built afresh on each call. */
const board = () => ({
  w: 3,
  solved: false,
  name: "a",
  none: null,
  cells: [1, 2, [3]],
  marks: new Uint8Array([1, 0, 2]),
  wide: new Int32Array([-1, 7]),
  at: new Map<unknown, unknown>([
    ["a", { n: 1 }],
    [2, [1]],
  ]),
  seen: new Set([5, 6]),
  drag: newDrag(),
});

describe("whether two values hold the same thing", () => {
  it("says so of two boards built apart, and of a board and its copy", () => {
    expect(sameValue(board(), board())).toBe(true);
    const b = board();
    expect(sameValue(b, copyUi(b))).toBe(true);
    expect(sameValue(b, b)).toBe(true);
  });

  it("sees a difference in each kind of part", () => {
    const changes: ((b: ReturnType<typeof board>) => void)[] = [
      (b) => {
        b.w = 4;
      },
      (b) => {
        b.solved = true;
      },
      (b) => {
        b.cells[0] = 9;
      },
      (b) => {
        (b.cells[2] as number[])[0] = 9;
      },
      (b) => {
        b.cells.push(4);
      },
      (b) => {
        b.marks[0] = 2;
      },
      (b) => {
        b.wide[1] = 8;
      },
      (b) => {
        b.at.set("a", { n: 2 });
      },
      (b) => {
        b.at.set("z", 1);
      },
      (b) => {
        b.seen.delete(5);
        b.seen.add(7);
      },
      (b) => {
        b.drag.live = true;
      },
    ];
    for (const change of changes) {
      const b = board();
      change(b);
      expect(sameValue(board(), b), String(change)).toBe(false);
      expect(sameValue(b, board()), String(change)).toBe(false);
    }
  });

  it("tells a missing key from one that holds undefined, and null from an object", () => {
    expect(sameValue({ a: undefined }, {})).toBe(false);
    expect(sameValue({ a: undefined }, { b: undefined })).toBe(false);
    expect(sameValue({ a: null }, { a: {} })).toBe(false);
    expect(sameValue([], {})).toBe(false);
    expect(sameValue(new Uint8Array([1]), new Int8Array([1]))).toBe(false);
    expect(sameValue(newDrag(), { ...newDrag() })).toBe(false);
    expect(sameValue(newDrag(), newDrag())).toBe(true);
    expect(newDrag()).toBeInstanceOf(GridDrag);
  });

  it("calls NaN the same as NaN, and a function the same only as itself", () => {
    const f = () => 1;
    expect(sameValue({ n: Number.NaN, f }, { n: Number.NaN, f })).toBe(true);
    expect(sameValue({ f }, { f: () => 1 })).toBe(false);
  });

  it("ends on a value that holds itself", () => {
    type Node = { n: number; next?: Node; grid?: unknown };
    const ring = (n: number): Node => {
      const a: Node = { n: 1 };
      const b: Node = { n, next: a };
      a.next = b;
      a.grid = { owner: a };
      return a;
    };
    expect(sameValue(ring(2), ring(2))).toBe(true);
    expect(sameValue(ring(2), ring(3))).toBe(false);
  });

  it("refuses a kind it cannot read, and never calls two of them the same", () => {
    expect(() => sameValue({ d: new Date(1) }, { d: new Date(2) })).toThrow(
      /\[object Date\]/,
    );
  });
});

describe("whether two values show the same thing", () => {
  const ui = (x: number, visible: boolean, held = 0) => ({
    cursor: { x, y: 0, visible },
    held,
    parts: [{ at: x, visible }],
  });

  it("calls a part hidden in both the same, wherever it sits", () => {
    expect(sameShown(ui(1, false), ui(2, false))).toBe(true);
    expect(sameValue(ui(1, false), ui(2, false))).toBe(false);
  });

  it("sees a part shown, hidden, or moved while it shows", () => {
    expect(sameShown(ui(1, false), ui(1, true))).toBe(false);
    expect(sameShown(ui(1, true), ui(1, false))).toBe(false);
    expect(sameShown(ui(1, true), ui(2, true))).toBe(false);
  });

  it("sees every other difference, beside a hidden part as anywhere", () => {
    expect(sameShown(ui(1, false), ui(2, false, 1))).toBe(false);
    expect(sameShown(board(), board())).toBe(true);
    const b = board();
    b.drag.live = true;
    expect(sameShown(board(), b)).toBe(false);
  });
});

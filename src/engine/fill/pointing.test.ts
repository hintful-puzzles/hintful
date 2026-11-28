/**
 * A board of numbers drawn as pieces that point (`numbers.pictures` naming
 * arrows, and no preference), on the `pointing` fixture, a Latin square of
 * the four arrows: a value placed is its arrow in the player's color, a given
 * one in ink, and a note is a small arrow in pencil on the side of its square
 * it points to; the board is always pictures, `A` switching nothing.
 */

import { describe, expect, it } from "vitest";
import * as pointing from "../../generated/engine/testing/fixtures/pointing/pointing.compiled.ts";
import { INK, pencilColor, playerEntryColor } from "../color/palette.ts";
import { UI_UPDATE } from "../contract/game.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
} from "../input/pointer.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import type { FillBoard } from "./board.ts";
import { fillGame } from "./game.ts";
import type { FillUi } from "./play.ts";

type Board = FillBoard<pointing.Dealt>;
type Line = Extract<DrawOp, { op: "line" }>;

const game = fillGame("pointing", pointing);
const TS = 48;
const colors = game.colors(DEFAULT_BACKGROUND);
const p = game.decodeParams("4");
const b: Board = game.newState(p, game.newDesc(p, randomNew("pointing")).desc);
const open = [...b.fixed].indexOf(0);
const fixedAt = [...b.fixed].indexOf(1);

/** The palette slots of `color`, each a painter took for it. */
const slotsOf = (color: readonly number[]): number[] =>
  colors.flatMap((c, i) =>
    c.every((x, j) => Math.abs(x - color[j]) < 1e-9) ? [i] : [],
  );

/** The ops of a first frame of board `s` under `ui`. */
function draw(s: Board, ui: FillUi = game.newUi(s)): readonly DrawOp[] {
  const dr = new RecordingDrawing(colors);
  game.redraw(dr, game.newDrawState(s, TS), {
    state: s,
    prev: null,
    dir: 1,
    ui,
    animTime: 0,
    flash: NO_FLASH,
  } as never);
  return dr.ops;
}

/** The lines drawn inside cell `c`'s tile in one of the colors `slots`. */
function linesIn(ops: readonly DrawOp[], c: number, slots: readonly number[]): Line[] {
  const at = (q: number, from: number) => q >= from && q <= from + TS;
  const lines = ops.filter(
    (op): op is Line => op.op === "line" && slots.includes(op.color),
  );
  // The tile's box is the one the lines of the cell's own arrow sit in: find
  // it from the board's origin, read off the given's own arrow.
  return lines.filter((l) => {
    const [x, y] = [c % b.w, Math.floor(c / b.w)];
    const ox = origin.x + x * TS;
    const oy = origin.y + y * TS;
    return at(l.x1, ox) && at(l.x2, ox) && at(l.y1, oy) && at(l.y2, oy);
  });
}

/** The top left of the board's first tile: where the given's arrow, the
 * one ink-colored arrow of the first frame, sits less its cell's place. */
const origin = (() => {
  const ink = slotsOf(INK);
  const lines = draw(b).filter(
    (op): op is Line => op.op === "line" && ink.includes(op.color),
  );
  // The given's shaft, its longest line, runs through its tile's middle.
  const shaft = lines.reduce((a, l) =>
    Math.hypot(l.x2 - l.x1, l.y2 - l.y1) > Math.hypot(a.x2 - a.x1, a.y2 - a.y1) ? l : a,
  );
  const mid = { x: (shaft.x1 + shaft.x2) / 2, y: (shaft.y1 + shaft.y2) / 2 };
  const [x, y] = [fixedAt % b.w, Math.floor(fixedAt / b.w)];
  return {
    x: Math.round(mid.x - TS / 2) - x * TS,
    y: Math.round(mid.y - TS / 2) - y * TS,
  };
})();

/** The move a key makes with the cursor on the open square: `key`'s
 * character, or the button `code` where given, on board `s`. */
function press(key: string, ui: FillUi = at(open), code?: number, s: Board = b) {
  return game.interpretMove(
    s,
    ui,
    game.newDrawState(s, TS),
    { x: 0, y: 0 },
    code ?? key.charCodeAt(0),
  );
}

/** A Ui with the cursor on `c`. */
function at(c: number): FillUi {
  const ui = game.newUi(b);
  Object.assign(ui.cursor, { x: c % b.w, y: Math.floor(c / b.w), visible: true });
  return ui;
}

/** The tip of an arrow: the end its head's strokes meet at. */
function tipOf(lines: readonly Line[]): { x: number; y: number } {
  const ends = lines.flatMap((l) => [`${l.x1},${l.y1}`, `${l.x2},${l.y2}`]);
  const tip = ends.find((e) => ends.filter((f) => f === e).length >= 3);
  if (tip === undefined) throw new Error("no arrow's tip");
  const [x, y] = tip.split(",").map(Number);
  return { x, y };
}

describe("a board of numbers drawn as arrows", () => {
  const entry = slotsOf(playerEntryColor(DEFAULT_BACKGROUND));
  const pencil = slotsOf(pencilColor(DEFAULT_BACKGROUND));
  const ink = slotsOf(INK);

  it("draws a given's arrow in ink, and the player's in the entry color", () => {
    expect(linesIn(draw(b), fixedAt, ink)).toHaveLength(3);
    const move = press("8");
    if (move === null || typeof move !== "object" || !("type" in move))
      throw new Error("8 typed nothing");
    const placed = game.executeMove(b, move);
    const lines = linesIn(draw(placed), open, entry);
    expect(lines).toHaveLength(3);
    // Value 1 points up: its tip is its highest point.
    const tip = tipOf(lines);
    expect(Math.min(...lines.flatMap((l) => [l.y1, l.y2]))).toBe(tip.y);
  });

  it("notes each arrow small, in pencil, on the side of its square it points to", () => {
    const [x, y] = [open % b.w, Math.floor(open / b.w)];
    const middle = { x: origin.x + x * TS + TS / 2, y: origin.y + y * TS + TS / 2 };
    const noteOf = (n: number) => {
      const noted = game.executeMove(b, {
        type: "pencilAdd",
        marks: [{ x, y, n }],
      } as never);
      const lines = linesIn(draw(noted), open, pencil);
      expect(lines).toHaveLength(3);
      const xs = lines.flatMap((l) => [l.x1, l.x2]);
      const ys = lines.flatMap((l) => [l.y1, l.y2]);
      return {
        x: (Math.min(...xs) + Math.max(...xs)) / 2 - middle.x,
        y: (Math.min(...ys) + Math.max(...ys)) / 2 - middle.y,
        size: Math.max(
          Math.max(...xs) - Math.min(...xs),
          Math.max(...ys) - Math.min(...ys),
        ),
      };
    };
    const [up, down, leftward, rightward] = [1, 2, 3, 4].map(noteOf);
    const off = TS / 6;
    expect(up.y).toBeLessThan(-off);
    expect(down.y).toBeGreaterThan(off);
    expect(leftward.x).toBeLessThan(-off);
    expect(rightward.x).toBeGreaterThan(off);
    for (const note of [up, down]) expect(Math.abs(note.x)).toBeLessThan(2);
    for (const note of [leftward, rightward]) expect(Math.abs(note.y)).toBeLessThan(2);
    // A note is small: under a third of its square.
    for (const note of [up, down, leftward, rightward])
      expect(note.size).toBeLessThan(TS / 3);
  });

  it("offers no preference for glyphs, and A switches nothing", () => {
    expect(
      game.prefs?.some((q) => q.type === "choices" && q.choices[0] === "Pictures"),
    ).toBe(false);
    const ui = at(open);
    press("A", ui);
    expect(ui.pictures).toBe(true);
  });

  it("labels each value's key by its arrow, the number pad digit of its way", () => {
    const keys = game.requestKeys?.(p, b) ?? [];
    expect(keys.map((k) => k.label)).toEqual(["↑", "↓", "←", "→", "Clear"]);
    expect(keys.slice(0, 4).map((k) => String.fromCharCode(k.button))).toEqual([
      "8",
      "2",
      "4",
      "6",
    ]);
    expect(press("8")).toMatchObject({ type: "set", n: 1, pencil: false });
    expect(press("6")).toMatchObject({ type: "set", n: 4, pencil: false });
    // A digit no way has types nothing.
    expect(press("1")).toBeNull();
  });
});

/** The middle of cell `c`'s square, `[dx, dy]` squares on. */
const middleOf = (c: number, dx = 0, dy = 0) => ({
  x: origin.x + (c % b.w) * TS + TS / 2 + dx * TS,
  y: origin.y + Math.floor(c / b.w) * TS + TS / 2 + dy * TS,
});

/** Each pointer event of a drag on board `s` from cell `c` by `[dx, dy]`
 * squares, the input's answers in turn. */
function dragFrom(
  s: Board,
  ui: FillUi,
  c: number,
  [dx, dy]: readonly [number, number],
  button = LEFT_BUTTON,
) {
  const ds = game.newDrawState(s, TS);
  const [drag, release] =
    button === LEFT_BUTTON ? [LEFT_DRAG, LEFT_RELEASE] : [RIGHT_DRAG, RIGHT_RELEASE];
  const pressed = game.interpretMove(s, ui, ds, middleOf(c), button);
  const moved = game.interpretMove(s, ui, ds, middleOf(c, dx, dy), drag);
  const shown = draw(s, ui);
  const released = game.interpretMove(s, ui, ds, middleOf(c, dx, dy), release);
  return { pressed, moved, shown, released };
}

describe("a board whose every piece points, played by its way", () => {
  /** The move `made` is, failing where it is none. */
  const moveOf = (made: unknown) => {
    if (made === null || typeof made !== "object" || !("type" in made))
      throw new Error(`no move: ${JSON.stringify(made)}`);
    return made as Parameters<typeof game.executeMove>[1];
  };

  it("places the value whose arrow points the way a drag goes, a press committing nothing", () => {
    const ui = game.newUi(b);
    const { pressed, released } = dragFrom(b, ui, open, [0.3, -1.2]);
    // The press leaves the selection alone: it may be a drag.
    expect(pressed).toBe(UI_UPDATE);
    expect(ui.cursor.visible).toBe(false);
    expect(released).toMatchObject({ type: "set", n: 1, pencil: false });
    // Across wins a tie; and a drag off the board still reads its way.
    expect(dragFrom(b, game.newUi(b), open, [-1, 1]).released).toMatchObject({ n: 3 });
    expect(dragFrom(b, game.newUi(b), open, [5, 0]).released).toMatchObject({ n: 4 });
  });

  it("previews the dragged arrow, as the board would be left", () => {
    const { shown } = dragFrom(b, game.newUi(b), open, [0, 1]);
    const entry = slotsOf(playerEntryColor(DEFAULT_BACKGROUND));
    const lines = linesIn(shown, open, entry);
    expect(lines).toHaveLength(3);
    // Value 2 points down: its tip is its lowest point.
    expect(Math.max(...lines.flatMap((l) => [l.y1, l.y2]))).toBe(tipOf(lines).y);
  });

  it("clears a square dragged back onto, and a tap selects one", () => {
    const placed = game.executeMove(
      b,
      moveOf(dragFrom(b, game.newUi(b), open, [0, -1]).released),
    );
    expect(dragFrom(placed, game.newUi(placed), open, [0, 0]).released).toMatchObject({
      type: "set",
      n: 0,
    });
    const ui = game.newUi(b);
    expect(dragFrom(b, ui, open, [0, 0]).released).toBe(UI_UPDATE);
    expect(ui.cursor).toMatchObject({
      x: open % b.w,
      y: Math.floor(open / b.w),
      visible: true,
    });
  });

  it("notes the way with the right button, or with Marks on; a press on a given is nothing", () => {
    expect(
      dragFrom(b, game.newUi(b), open, [1, 0], RIGHT_BUTTON).released,
    ).toMatchObject({
      type: "set",
      n: 4,
      pencil: true,
    });
    const ui = game.newUi(b);
    ui.pencilMode = true;
    expect(dragFrom(b, ui, open, [0, 1]).released).toMatchObject({
      n: 2,
      pencil: true,
    });
    expect(dragFrom(b, game.newUi(b), fixedAt, [0, 1]).pressed).toBeNull();
  });

  it("arms the selection with Enter for an arrow key, drawn as a `?`, and Space clears it", () => {
    const ui = at(open);
    expect(press("\r", ui, CURSOR_SELECT)).toBe(UI_UPDATE);
    expect(ui.armed).toBe("value");
    // Enter arms; it does not switch notes.
    expect(ui.pencilMode).toBe(false);
    const shown = draw(b, ui).filter((op) => op.op === "text" && op.text === "?");
    expect(shown).toHaveLength(1);
    expect(press("", ui, CURSOR_LEFT)).toMatchObject({
      type: "set",
      n: 3,
      pencil: false,
    });
    expect(ui.armed).toBeNull();
    // The cursor did not move: the arrow was the value's.
    expect(ui.cursor).toMatchObject({ x: open % b.w, y: Math.floor(open / b.w) });
    const placed = game.executeMove(b, moveOf(press("4")));
    const again = at(open);
    press("\r", again, CURSOR_SELECT);
    expect(press(" ", again, CURSOR_SELECT2, placed)).toMatchObject({
      type: "set",
      n: 0,
    });
  });

  it("arms a note with Space on an empty square, drawn as a `?` in pencil", () => {
    const ui = at(open);
    expect(press(" ", ui, CURSOR_SELECT2)).toBe(UI_UPDATE);
    expect(ui.armed).toBe("note");
    const pencil = slotsOf(pencilColor(DEFAULT_BACKGROUND));
    const shown = draw(b, ui).filter(
      (op) => op.op === "text" && op.text === "?" && pencil.includes(op.color),
    );
    expect(shown).toHaveLength(1);
    expect(press("", ui, CURSOR_DOWN)).toMatchObject({
      type: "set",
      n: 2,
      pencil: true,
    });
    // Unarmed, an arrow key moves the cursor.
    const moved = at(open);
    moved.cursor.y = 0;
    press("", moved, CURSOR_DOWN);
    expect(moved.cursor.y).toBe(1);
  });
});

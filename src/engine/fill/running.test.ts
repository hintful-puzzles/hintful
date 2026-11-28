/**
 * Typing along a list's sites (`play.along`), on the `running` fixture: a
 * value typed moves the selection along the run it is filling, its way
 * snapped, turned and set by an arrow; a number of the list written whole,
 * pressed with a square selected or picked up and dropped; and the runs
 * through the selection washed, a held number's previewed.
 */

import { describe, expect, it } from "vitest";
import * as running from "../../generated/engine/testing/fixtures/running/running.compiled.ts";
import { BLUE_BOLD, ORANGE_BOLD } from "../color/colors.ts";
import { previewInk } from "../color/palette.ts";
import { UI_UPDATE } from "../contract/game.ts";
import type { Point } from "../contract/types.ts";
import type { PointerAction } from "../input/hint-gesture.ts";
import { digitKeyCode } from "../input/key-labels.ts";
import {
  CURSOR_DOWN,
  CURSOR_RIGHT,
  LEFT_BUTTON,
  LEFT_RELEASE,
  PENCIL_MODE_BUTTON,
  RIGHT_BUTTON,
} from "../input/pointer.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { NONE_HELD, sitesOf } from "./along.ts";
import type { FillBoard } from "./board.ts";
import type { Edit } from "./edit.ts";
import { fillGame } from "./game.ts";
import type { FillMove } from "./notes.ts";
import type { FillUi } from "./play.ts";

const game = fillGame("running", running);
type Board = FillBoard<running.Dealt>;

/**
 * A dealt 5x4, walls `#`, and the answer:
 *
 *     2 1 # 3 #
 *     5 # 8 4 7
 *     9 6 1 # 2
 *     1 # 3 6 6
 *
 * Its numbers, 0 to 7: 21, 34, 366, 726, 813, 847, 961, 2591.
 */
const DESC = "2a1a1a6a2a3,21,34,366,726,813,847,961,2591";
const [W, H, TS] = [5, 4, 40];
const p = game.decodeParams(`${W}x${H}`);
const empty: Board = game.newState(p, DESC);
const [N21, N34, , , N813, N847, , N2591] = [0, 1, 2, 3, 4, 5, 6, 7];

const colors = game.colors(DEFAULT_BACKGROUND);
const ds = () => game.newDrawState(empty, TS);
const draw = (b: Board, ui: FillUi, hint?: unknown): readonly DrawOp[] => {
  const dr = new RecordingDrawing(colors);
  game.redraw(dr, game.newDrawState(b, TS), {
    state: b,
    prev: null,
    dir: 1,
    ui,
    animTime: 0,
    flash: NO_FLASH,
    ...(hint === undefined ? {} : { hint }),
  } as never);
  return dr.ops;
};
/** The grid's top left, read off its frame. */
const corner = ((): Point => {
  const frame = draw(empty, game.newUi(empty)).find(
    (op) => op.op === "rect" && op.w === W * TS + 1,
  );
  if (frame?.op !== "rect") throw new Error("no frame");
  return { x: frame.x, y: frame.y };
})();
const middle = (c: number): Point => ({
  x: corner.x + (c % W) * TS + TS / 2,
  y: corner.y + Math.floor(c / W) * TS + TS / 2,
});
/** Where number `k` of the list is drawn: inside its text. */
const listed = (k: number): Point => {
  const texts = draw(empty, game.newUi(empty)).filter(
    (op): op is Extract<DrawOp, { op: "text" }> =>
      op.op === "text" && op.y > corner.y + H * TS,
  );
  const t = texts[k];
  return { x: t.x + 2, y: t.y - Math.floor(t.size / 3) };
};

/** A board played by hand: each press and key through the input, each move
 * made. */
function playing(start: Board = empty) {
  let b = start;
  const ui = game.newUi(b);
  const d = ds();
  const moves: FillMove[] = [];
  const send = (at: Point, button: number) => {
    const got = game.interpretMove(b, ui, d, at, button);
    if (got !== null && got !== UI_UPDATE) {
      moves.push(got);
      b = game.executeMove(b, got);
    }
    return got;
  };
  return {
    ui,
    moves,
    board: () => b,
    tap: (c: number, button = LEFT_BUTTON) => {
      const got = send(middle(c), button);
      send(middle(c), button === LEFT_BUTTON ? LEFT_RELEASE : button + 3);
      return got;
    },
    take: (k: number) => send(listed(k), LEFT_BUTTON),
    key: (code: number) => send({ x: 0, y: 0 }, code),
    type: (...digits: number[]) => {
      for (const d of digits) send({ x: 0, y: 0 }, digitKeyCode(d));
    },
    at: () => (ui.cursor.visible ? ui.cursor.y * W + ui.cursor.x : -1),
  };
}

/** Board `empty` with the values `set`, cell and value in turn. */
const holding = (...set: number[]): Board =>
  game.executeMove(empty, { set } satisfies Edit);

describe("the sites typing goes along", () => {
  it("are the runs each number is read along, a row's or a column's", () => {
    const s = sitesOf(running, empty);
    expect(s.all.map((site) => [Array.from(site.cells), site.way])).toEqual([
      [[0, 1], "row"],
      [[7, 8, 9], "row"],
      [[10, 11, 12], "row"],
      [[17, 18, 19], "row"],
      [[0, 5, 10, 15], "column"],
      [[7, 12, 17], "column"],
      [[3, 8], "column"],
      [[9, 14, 19], "column"],
    ]);
  });
});

describe("a value typed moves the selection along its run", () => {
  it("writes a whole number after one press, and stays at the run's end", () => {
    const g = playing();
    g.tap(7);
    g.type(8, 4);
    expect(g.at()).toBe(9);
    g.type(7);
    expect(Array.from([7, 8, 9], (c) => g.board().values[c])).toEqual([8, 4, 7]);
    // The pointer put the selection there, and the last value puts it away.
    expect(g.at()).toBe(-1);
  });

  it("snaps to the one run through a square, and a second press turns the way", () => {
    const g = playing();
    g.tap(5);
    g.type(5);
    expect(g.at()).toBe(10);
    // Square 10 lies on two runs; the way stays the column's.
    g.type(9);
    expect(g.at()).toBe(15);
    const t = playing();
    t.tap(7);
    expect(t.tap(7)).toBe(UI_UPDATE);
    expect(t.at()).toBe(7);
    t.type(8);
    expect(t.at()).toBe(12);
    // A second press where one run alone passes puts the selection away.
    t.tap(5);
    t.tap(5);
    expect(t.at()).toBe(-1);
  });

  it("goes the way the arrow last pressed does", () => {
    const g = playing();
    g.tap(7);
    g.key(CURSOR_DOWN);
    expect(g.at()).toBe(12);
    g.type(1);
    expect(g.at()).toBe(17);
    g.key(CURSOR_RIGHT);
    g.type(6);
    expect(g.at()).toBe(19);
  });

  it("steps over a value the square holds already, making no move", () => {
    const g = playing(holding(7, 8));
    g.tap(7);
    g.type(8);
    expect(g.moves).toEqual([]);
    expect(g.at()).toBe(8);
    g.type(4);
    expect(g.board().values[8]).toBe(4);
  });

  it("stays put for a note, a clear and the preference off", () => {
    const g = playing(holding(7, 8));
    g.tap(7);
    g.key(0x08);
    expect(g.board().values[7]).toBe(0);
    expect(g.at()).toBe(-1);
    const n = playing();
    n.tap(8, RIGHT_BUTTON);
    n.type(4);
    expect(n.at()).toBe(8);
    const off = playing();
    const pref = game.prefs?.find((q) => q.kw === "auto-advance");
    if (pref?.type !== "boolean") throw new Error("no auto-advance");
    expect(pref.get(off.ui)).toBe(true);
    pref.set(off.ui, false);
    off.tap(0);
    off.key(CURSOR_RIGHT);
    off.type(1);
    expect(off.at()).toBe(1);
  });
});

describe("a number of the list written whole", () => {
  it("is picked up, and dropped into a run it fits, the square left selected", () => {
    const g = playing();
    expect(g.take(N847)).toBe(UI_UPDATE);
    expect(g.ui.held).toBe(N847);
    g.tap(8);
    expect(g.moves).toEqual([{ set: [7, 8, 8, 4, 9, 7] }]);
    expect(g.ui.held).toBe(NONE_HELD);
    expect(g.at()).toBe(8);
  });

  it("is written straight into a run through the selected square", () => {
    const g = playing();
    g.tap(8);
    g.take(N34);
    expect(g.moves).toEqual([{ set: [3, 3, 8, 4] }]);
  });

  it("goes in the run more written in, whichever way the selection goes", () => {
    // Square 12's 1 is 813's second digit, down from square 7.
    const g = playing(holding(12, 1));
    g.tap(7);
    expect(g.ui.way).toBe("row");
    g.take(N813);
    expect(g.moves).toEqual([{ set: [7, 8, 17, 3] }]);
  });

  it("fits no run once another reads it, and is held instead", () => {
    const g = playing(holding(0, 2, 1, 1));
    g.tap(3);
    g.take(N21);
    expect(g.moves).toEqual([]);
    expect(g.ui.held).toBe(N21);
  });

  it("is put down by a press on it, a value typed, or a press where it cannot go", () => {
    const g = playing();
    g.take(N2591);
    g.take(N2591);
    expect(g.ui.held).toBe(NONE_HELD);
    g.take(N2591);
    g.tap(7);
    expect(g.ui.held).toBe(NONE_HELD);
    expect(g.moves).toEqual([]);
    expect(g.at()).toBe(7);
    g.take(N2591);
    g.type(8);
    expect(g.ui.held).toBe(NONE_HELD);
  });

  it("stays held through a press on a wall, a right press and an arrow, and in notes is only held", () => {
    const g = playing();
    g.take(N2591);
    g.tap(2);
    g.tap(8, RIGHT_BUTTON);
    g.key(CURSOR_DOWN);
    expect(g.ui.held).toBe(N2591);
    const n = playing();
    n.tap(0);
    n.key(PENCIL_MODE_BUTTON);
    n.take(N2591);
    expect(n.moves).toEqual([]);
    expect(n.ui.held).toBe(N2591);
  });
});

describe("the washes", () => {
  const filled = (ops: readonly DrawOp[], color: readonly number[]) =>
    ops.filter(
      (op) => op.op === "rect" && colors[op.color]?.every((v, i) => v === color[i]),
    ).length;
  const texts = (ops: readonly DrawOp[], color: readonly number[]) =>
    ops
      .filter(
        (op): op is Extract<DrawOp, { op: "text" }> =>
          op.op === "text" && colors[op.color]?.every((v, i) => v === color[i]),
      )
      .map((t) => t.text);

  it("wash the runs through the selection, each way its color, under the preference", () => {
    const g = playing();
    g.tap(7);
    // The selected square takes the selection's wash.
    expect(filled(draw(empty, g.ui), BLUE_BOLD)).toBe(2);
    expect(filled(draw(empty, g.ui), ORANGE_BOLD)).toBe(2);
    const pref = game.prefs?.find((q) => q.kw === "highlight-runs");
    if (pref?.type !== "boolean") throw new Error("no highlight-runs");
    pref.set(g.ui, false);
    expect(filled(draw(empty, g.ui), BLUE_BOLD)).toBe(0);
    pref.set(g.ui, true);
    // A shown hint owns the board's coloring.
    const hint = { highlights: { area: [], hatch: [], targets: [], marks: [] } };
    expect(filled(draw(empty, g.ui, hint), BLUE_BOLD)).toBe(0);
  });

  it("show a held number in every run it fits, its digits where one alone does", () => {
    const g = playing();
    g.take(N2591);
    const one = draw(empty, g.ui);
    expect(filled(one, ORANGE_BOLD)).toBe(4);
    expect(texts(one, previewInk(DEFAULT_BACKGROUND))).toEqual(["2", "5", "9", "1"]);
    g.take(N2591);
    g.take(N847);
    const many = draw(empty, g.ui);
    // Three rows and two columns of three squares, which cross at five, the
    // row's wash drawn there.
    expect(filled(many, BLUE_BOLD)).toBe(9);
    expect(filled(many, ORANGE_BOLD)).toBe(1);
    expect(texts(many, previewInk(DEFAULT_BACKGROUND))).toEqual([]);
  });
});

describe("a hint's gesture", () => {
  /** The board the gesture `actions` leaves `b` as, from `ui`. */
  const replay = (b: Board, ui: FillUi, actions: readonly PointerAction[]): Board => {
    let at = b;
    const d = ds();
    const send = (pt: Point, button: number) => {
      const got = game.interpretMove(at, ui, d, pt, button);
      if (got !== null && got !== UI_UPDATE) at = game.executeMove(at, got);
    };
    for (const a of actions) {
      if (a.kind === "key") send({ x: 0, y: 0 }, a.code);
      else if (a.kind === "click") {
        send(a.at, LEFT_BUTTON);
        send(a.at, LEFT_RELEASE);
      }
    }
    return at;
  };

  it("types a whole run with the selection moving along it, a held number put down first", () => {
    // 366's middle square lies on its row alone, where a second tap would
    // put the selection away.
    const move: Edit = { set: [17, 3, 18, 6, 19, 6] };
    const step = { move, explanation: "", highlights: {} } as never;
    for (const held of [NONE_HELD, N2591, N847]) {
      const g = playing();
      if (held !== NONE_HELD) g.take(held);
      g.tap(7);
      const ui = structuredClone(g.ui);
      const { gesture } = game.hint;
      if (gesture === undefined) throw new Error("no gesture");
      const actions = gesture(empty, ui, ds(), move, step);
      const after = replay(empty, ui, actions);
      expect(Array.from([17, 18, 19], (c) => after.values[c])).toEqual([3, 6, 6]);
      expect(ui.held).toBe(NONE_HELD);
    }
  });
});

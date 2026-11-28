/**
 * A board of sets, each placed once, on the `holding` fixture: a horseshoe
 * between two squares where one's set holds the other's, drawn in the gap
 * between them.
 */

import { describe, expect, it } from "vitest";
import * as holding from "../../generated/engine/testing/fixtures/holding/holding.compiled.ts";
import { GREEN_WASH } from "../color/colors.ts";
import { COL_CURSOR, COL_ERROR, COL_HINT_OUTLINE } from "../color/roles.ts";
import { loadDesc, validateDesc } from "../contract/desc-error.ts";
import { UI_UPDATE } from "../contract/game.ts";
import {
  BACKSPACE,
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  CURSOR_UP,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  RIGHT_BUTTON,
  RIGHT_RELEASE,
} from "../input/pointer.ts";
import { randomNew } from "../random/index.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { renderScenario } from "../testing/render-scenario.ts";
import { paramSpaceOf, solveBoard } from "./board.ts";
import { fillGame } from "./game.ts";
import type { FillMove } from "./notes.ts";
import { COL_INK } from "./render/palette.ts";

const game = fillGame("holding", holding);

// A set is one more than its letters' bits, A 1 and B 2: the empty set 1,
// {A} 2, {B} 3 and {A, B} 4.
const letters = (d: number): number => d - 1;
const holds = (x: number, y: number): boolean =>
  x !== y && (letters(x) & letters(y)) === letters(y);

const PARAMS = game.defaultParams();

/** The desc of the 2x2 board `answer` as upstream subsets.c writes it: a
 * square's letters as a number, `_` where it is `hidden`, then a letter for
 * each side whose neighbor's set its own holds, a comma between two. */
function descOf(answer: readonly number[], hidden: readonly number[] = []): string {
  const sides: [string, number, number][] = [
    ["U", 0, -1],
    ["R", 1, 0],
    ["D", 0, 1],
    ["L", -1, 0],
  ];
  return answer
    .map((v, c) => {
      const [x, y] = [c % 2, Math.floor(c / 2)];
      const open = sides.filter(([, dx, dy]) => {
        const [nx, ny] = [x + dx, y + dy];
        return nx >= 0 && ny >= 0 && nx < 2 && ny < 2 && holds(v, answer[ny * 2 + nx]);
      });
      return `${hidden.includes(c) ? "_" : letters(v)}${open.map(([s]) => s).join("")}`;
    })
    .join(",");
}

const idOf = (answer: readonly number[], hidden: readonly number[] = []): string =>
  `${game.encodeParams(PARAMS, false)}:${descOf(answer, hidden)}`;

const drawn = (id: string, moves: { set: number[] }[] = []): DrawOp[] =>
  renderScenario({ game, id, moves }).recording.ops;

// {A} {B}
// {}  {A, B}
const ANSWER = [2, 3, 1, 4];
// Every square open: no set is placed, so every square's notes are every set.
// A board that leaves {A}'s and {B}'s squares both open has two answers,
// the letters swapped, so the midend loads none: a test drawing the board
// gives one of them.
const ALL = [0, 1, 2, 3];
// {B} given: square 0 is {}, {A} or {A, B}, as are squares 2 and 3.
const BUT_B = [0, 2, 3];

describe("a horseshoe", () => {
  it("opens toward the square whose set holds the other's, and is none where neither does", () => {
    const ops = drawn(idOf(ANSWER));
    const shoes = ops
      .filter(
        (o): o is Extract<DrawOp, { op: "circle" }> =>
          o.op === "circle" && o.fill === COL_INK,
      )
      .sort((a, b) => a.cy - b.cy || a.cx - b.cx);
    // Its legs: the ink bar drawn over the ring's half toward the holder.
    const legs = (s: (typeof shoes)[number]): [number, number] => {
      const bar = ops.find(
        (o): o is Extract<DrawOp, { op: "rect" }> =>
          o.op === "rect" &&
          o.color === COL_INK &&
          o.x <= s.cx + 1 &&
          o.x + o.w >= s.cx &&
          o.y <= s.cy + 1 &&
          o.y + o.h >= s.cy,
      );
      if (bar === undefined) throw new Error("a horseshoe with no legs");
      const [mx, my] = [bar.x + bar.w / 2 - s.cx, bar.y + bar.h / 2 - s.cy];
      // Off the center by a pixel or less is along its axis.
      const side = (m: number) => (Math.abs(m) <= 1 ? 0 : Math.sign(m));
      return [side(mx), side(my)];
    };
    // {A} over {}, {B} over {A, B}, then {} beside {A, B}; {A} beside {B}
    // has none.
    expect(shoes).toHaveLength(3);
    expect(shoes.map(legs)).toEqual([
      [0, -1],
      [0, 1],
      [1, 0],
    ]);
  });

  it("is a red cross where two squares with none between them hold one another", () => {
    const id = idOf(ANSWER, [0]);
    const red = (ops: DrawOp[]) =>
      ops.filter(
        (o): o is Extract<DrawOp, { op: "line" }> =>
          o.op === "line" && o.color === COL_ERROR,
      );
    expect(red(drawn(id))).toEqual([]);
    // The empty set beside {B}, which holds it.
    const cross = red(drawn(id, [{ set: [0, 1] }]));
    expect(cross).toHaveLength(2);
    const mid = (l: (typeof cross)[number]) => [(l.x1 + l.x2) / 2, (l.y1 + l.y2) / 2];
    expect(mid(cross[0])).toEqual(mid(cross[1]));
  });

  it("writes the board's text between its squares, open toward the holder", () => {
    const text = game.textFormat?.(game.newState(PARAMS, descOf(ANSWER))) ?? "";
    // {A} over {} opens up, {B} over {A, B} down, {} beside {A, B} right.
    expect(text).toContain("∪");
    expect(text).toContain("∩");
    expect(text).toContain("⊂");
  });
});

describe("the deal and the ID", () => {
  it("places every set once, and writes it as upstream does", () => {
    const sp = paramSpaceOf(holding, { w: 2, h: 2 });
    let hiddenSeen = 0;
    const answers = new Set<string>();
    for (const seed of ["a", "b", "c", "d", "e", "f"]) {
      const { desc } = game.newDesc(PARAMS, randomNew(seed));
      const board = game.newState(PARAMS, desc);
      const solved = solveBoard(holding, board, 0);
      expect(solved.verdict).toBe("solved");
      const answer = Array.from(solved.values);
      expect([...answer].sort()).toEqual([1, 2, 3, 4]);
      answers.add(answer.join());
      const hidden = sp.cells.filter((c) => board.dealt.given.valueAt[c] < 0);
      hiddenSeen += hidden.length;
      expect(desc).toBe(descOf(answer, hidden));
    }
    // The sets are shuffled, and the deal hides what the board still
    // finishes without.
    expect(answers.size).toBeGreaterThan(1);
    expect(hiddenSeen).toBeGreaterThan(0);
  });

  it("reads a board back as it was written", () => {
    // {A} {B} over {} {A, B}: {A} holds the {} below it, and {A, B} the {B}
    // above it and the {} left of it.
    const desc = "_D,2,0,3UL";
    expect(descOf(ANSWER, [0])).toBe(desc);
    expect(validateDesc(game, PARAMS, desc)).toBeNull();
    const board = game.newState(PARAMS, desc);
    expect(Array.from(board.dealt.given.valueAt)).toEqual([-1, 3, 1, 4]);
    expect(solveBoard(holding, board, 0).values).toEqual(Uint8Array.from(ANSWER));
  });

  it("refuses a horseshoe off the board, one open at both ends, and a set past the last", () => {
    expect(validateDesc(game, PARAMS, "_DU,2,0,3UL")).not.toBeNull();
    expect(validateDesc(game, PARAMS, "_D,2,0U,3UL")).not.toBeNull();
    expect(validateDesc(game, PARAMS, "_D,2,4,3UL")).not.toBeNull();
    expect(validateDesc(game, PARAMS, "_D,2,0,3UL,")).not.toBeNull();
    expect(validateDesc(game, PARAMS, "_D,2,0")).not.toBeNull();
  });

  it("loads no board with a set given twice, which has no answer", () => {
    expect(validateDesc(game, PARAMS, "1D,1,0,3UL")).toBeNull();
    expect(loadDesc(game, PARAMS, "1D,1,0,3UL").ok).toBe(false);
    expect(loadDesc(game, PARAMS, "_D,2,0,3UL").ok).toBe(true);
  });
});

describe("a set drawn as its letters", () => {
  /** Every letter and cross drawn on the squares: a letter alone, which the
   * band's sets are not, and a cross's falling stroke, which no strike is. */
  const drawnMarks = (id: string, moves: FillMove[] = []) => {
    const ops = renderScenario({ game, id, moves }).recording.ops;
    const marks: { x: number; y: number; mark: string }[] = [
      ...ops.flatMap((o) =>
        o.op === "text" && (o.text === "A" || o.text === "B")
          ? [{ x: o.x, y: o.y, mark: o.text }]
          : [],
      ),
      // A cross is two ink lines through one middle; one of them stands for it.
      ...ops.flatMap((o) =>
        o.op === "line" && o.color === COL_INK && o.y1 < o.y2 && o.x1 < o.x2
          ? [{ x: (o.x1 + o.x2) / 2, y: (o.y1 + o.y2) / 2, mark: "x" }]
          : [],
      ),
    ];
    return marks;
  };
  // The middle of the board, between its two columns and its two rows of
  // squares: on the board with every set placed, each slot draws something.
  const full = drawnMarks(idOf(ANSWER));
  const middle = (axis: "x" | "y") => {
    const at = full.map((m) => m[axis]);
    return (Math.min(...at) + Math.max(...at)) / 2;
  };
  const [MX, MY] = [middle("x"), middle("y")];
  /** What each square's slots show, A's then B's: a letter, `x` for a
   * cross, `.` for nothing, read off where each is drawn. */
  const marksOf = (id: string, moves: FillMove[] = []) => {
    const marks = drawnMarks(id, moves);
    return [0, 1, 2, 3].map((c) =>
      marks
        .filter((m) => Number(m.x >= MX) === c % 2 && Number(m.y >= MY) === c >> 1)
        .sort((a, b) => a.x - b.x),
    );
  };
  // Where each square's two slots are, A's left of B's: on the board with
  // every set placed, each slot draws something.
  const places = marksOf(idOf(ANSWER)).map((ms) => ms.map((m) => m.x));
  const slots = (id: string, moves: FillMove[] = []): string[] =>
    marksOf(id, moves).map((mine, c) =>
      places[c]
        .map((x) => mine.find((m) => Math.abs(m.x - x) <= 1)?.mark ?? ".")
        .join(""),
    );
  const strike = (c: number, ...sets: number[]): FillMove => ({
    type: "pencilStrike",
    marks: sets.map((n) => ({ x: c % 2, y: Math.floor(c / 2), n })),
  });

  it("draws a placed set's letters, and a cross for each it lacks", () => {
    expect(slots(idOf(ANSWER))).toEqual(["Ax", "xB", "xx", "AB"]);
  });

  it("draws on an open square what every set left in it agrees on", () => {
    const id = idOf(ANSWER, BUT_B);
    // {}, {A} and {A, B} left: they agree on no letter.
    expect(slots(id)).toEqual(["..", "xB", "..", ".."]);
    // {A} and {A, B} left: A is there, B open.
    expect(slots(id, [strike(0, 1)])).toEqual(["A.", "xB", "..", ".."]);
    // {} and {A} left: B is not, A open.
    expect(slots(id, [strike(0, 4)])).toEqual([".x", "xB", "..", ".."]);
    // Square 1 open beside the rest given: {B} alone left, placed at the deal.
    expect(slots(idOf(ANSWER, [1]))).toEqual(["Ax", "xB", "xx", "AB"]);
  });
});

describe("the band of every set", () => {
  /** Each set's text in the band, in the order drawn, with how it is: `ink`,
   * `done` (gray) or `red`, and whether a line strikes it. */
  const bandOf = (id: string, moves: FillMove[] = []) => {
    const ops = renderScenario({ game, id, moves }).recording.ops;
    const texts = ops.filter(
      (o): o is Extract<DrawOp, { op: "text" }> =>
        o.op === "text" && /^[A_][B_]$/.test(o.text),
    );
    const struck = (t: (typeof texts)[number]) =>
      ops.some(
        (o) =>
          o.op === "line" &&
          o.y1 === o.y2 &&
          o.x1 === t.x &&
          o.y1 < t.y &&
          o.y1 > t.y - 20,
      );
    return texts.map(
      (t) =>
        `${t.text} ${t.color === COL_ERROR ? "red" : t.color === COL_INK ? "ink" : "done"}${struck(t) ? " struck" : ""}`,
    );
  };

  it("writes every set beneath the board as its letters, a gap for each it lacks", () => {
    const { h } = renderScenario({ game, id: idOf(ANSWER, [0]) }).size;
    const ops = drawn(idOf(ANSWER, [0]));
    const band = ops.filter(
      (o): o is Extract<DrawOp, { op: "text" }> =>
        o.op === "text" && /^[A_][B_]$/.test(o.text),
    );
    expect(band.map((o) => o.text)).toEqual(["__", "A_", "_B", "AB"]);
    // Below every square's letters, on the canvas.
    const letters = ops.flatMap((o) =>
      o.op === "text" && o.text.length === 1 ? [o.y] : [],
    );
    expect(letters.length).toBeGreaterThan(0);
    for (const o of band) {
      expect(o.y).toBeLessThan(h);
      expect(o.y).toBeGreaterThan(Math.max(...letters));
    }
  });

  it("grays a set once placed, unstruck, and reds one placed twice", () => {
    // The band's strike is kept for what the square in focus rules out.
    // {A} and {A, B} given: squares 1 and 2 each {} or {B}.
    const id = idOf(ANSWER, [1, 2]);
    expect(bandOf(id)).toEqual(["__ ink", "A_ done", "_B ink", "AB done"]);
    // {B} placed leaves square 2 {}, which it then holds.
    expect(bandOf(id, [{ set: [1, 3] }])).toEqual([
      "__ done",
      "A_ done",
      "_B done",
      "AB done",
    ]);
    // {A, B} placed a second time.
    expect(bandOf(id, [{ set: [1, 4] }])).toEqual([
      "__ ink",
      "A_ done",
      "_B ink",
      "AB red",
    ]);
  });
});

describe("a press on the band", () => {
  // Squares 0 and 3 open, each {A} or {A, B}.
  const id = idOf(ANSWER, [0, 3]);
  /** Where set `text` is written in the band: a point on its text. */
  const pointOf = (text: string): { x: number; y: number } => {
    const o = drawn(id).find(
      (o): o is Extract<DrawOp, { op: "text" }> => o.op === "text" && o.text === text,
    );
    if (o === undefined) throw new Error(`no ${text} in the band`);
    return { x: o.x + 2, y: o.y - 2 };
  };
  /** The squares washed green after pressing `presses` sets of the band,
   * each by the top left of its largest wash, and whether a set is framed. */
  const spotlit = (...presses: string[]) => {
    const { midend, palette } = renderScenario({ game, id });
    for (const text of presses) {
      const at = pointOf(text);
      midend.processInput(at.x, at.y, LEFT_BUTTON);
      midend.processInput(at.x, at.y, LEFT_RELEASE);
    }
    const recording = new RecordingDrawing(palette);
    midend.forceRedraw(recording);
    const green = (c: number) => palette[c].every((x, i) => x === GREEN_WASH[i]);
    const squares = new Set(
      recording.ops.flatMap((o) =>
        o.op === "rect" && green(o.color) && o.w > 8 ? [`${o.x},${o.y}`] : [],
      ),
    );
    return {
      squares: squares.size,
      framed: recording.ops.some(
        (o) => o.op === "rect" && o.color === COL_HINT_OUTLINE,
      ),
    };
  };

  it("spotlights the squares a set can still go in, the one holding it among them", () => {
    // {A, B}: among squares 0's and 3's notes.
    expect(spotlit("AB")).toEqual({ squares: 2, framed: true });
    // {}: given in square 2 alone.
    expect(spotlit("__")).toEqual({ squares: 1, framed: true });
  });

  it("is put out by a second press on the set, and moved by a press on another", () => {
    expect(spotlit("AB", "AB")).toEqual({ squares: 0, framed: false });
    expect(spotlit("AB", "__")).toEqual({ squares: 1, framed: true });
  });

  it("changes the Ui alone", () => {
    const b = game.newState(PARAMS, descOf(ANSWER, [0, 3]));
    const ui = game.newUi(b);
    const ds = game.newDrawState(b, 32);
    const at = pointOf("A_");
    expect(game.interpretMove(b, ui, ds, at, LEFT_BUTTON)).toBe(UI_UPDATE);
    expect(ui.spotlit).toBe(2);
  });
});

describe("a square in focus", () => {
  const hidden = BUT_B;
  const id = idOf(ANSWER, hidden);
  // A horseshoe is two circles at one middle, its ring and its hole; a badge
  // is a circle alone.
  const badgesOf = (ops: readonly DrawOp[]) => {
    const circles = ops.filter(
      (o): o is Extract<DrawOp, { op: "circle" }> => o.op === "circle",
    );
    return circles.filter(
      (o) => circles.filter((q) => q.cx === o.cx && q.cy === o.cy).length === 1,
    );
  };
  const bandText = (ops: readonly DrawOp[], text: string) => {
    const o = ops.find(
      (o): o is Extract<DrawOp, { op: "text" }> => o.op === "text" && o.text === text,
    );
    if (o === undefined) throw new Error(`no ${text} in the band`);
    return o;
  };
  /** The frame after pressing, in order, the badge (`badge`) or a set of
   * the band (its text): its ops, the board and the Ui. */
  const pressing = (...targets: string[]) => {
    const { midend, palette, recording: first } = renderScenario({ game, id });
    const [badge] = badgesOf(first.ops);
    // The game's own hooks beside the midend's, for the board and the Ui
    // the midend keeps to itself; the frame is drawn at its tile size.
    let board = game.newState(PARAMS, descOf(ANSWER, hidden));
    const ui = game.newUi(board);
    const ds = game.newDrawState(board, game.preferredTileSize);
    for (const t of targets) {
      const at =
        t === "badge"
          ? { x: badge.cx, y: badge.cy }
          : { x: bandText(first.ops, t).x + 2, y: bandText(first.ops, t).y - 2 };
      midend.processInput(at.x, at.y, LEFT_BUTTON);
      midend.processInput(at.x, at.y, LEFT_RELEASE);
      const made = game.interpretMove(board, ui, ds, at, LEFT_BUTTON);
      if (made !== null && made !== UI_UPDATE) board = game.executeMove(board, made);
    }
    const recording = new RecordingDrawing(palette);
    midend.forceRedraw(recording);
    return { ops: recording.ops, board, ui };
  };
  /** The sets of the band a line strikes. */
  const struck = (ops: readonly DrawOp[]) =>
    ["__", "A_", "_B", "AB"].filter((text) => {
      const t = bandText(ops, text);
      return ops.some(
        (o) =>
          o.op === "line" &&
          o.y1 === o.y2 &&
          o.x1 <= t.x &&
          o.x2 >= t.x + 4 &&
          o.y1 < t.y &&
          o.y1 > t.y - 20,
      );
    });

  it("is offered by a badge above each open square alone, filled while in focus", () => {
    const { ops } = pressing();
    const badges = badgesOf(ops);
    expect(badges.length).toBe(3);
    // Above square 0's letters.
    const letters = ops.flatMap((o) =>
      o.op === "text" && o.text.length === 1 ? [o] : [],
    );
    expect(badges[0].cy).toBeLessThan(Math.min(...letters.map((o) => o.y - 10)));
    expect(badges[0].fill).not.toBe(badges[0].outline);
    const [focused] = badgesOf(pressing("badge").ops);
    expect(focused.fill).toBe(focused.outline);
    expect(pressing("badge").ui.focus).toBe(0);
    expect(pressing("badge", "badge").ui.focus).toBe(-1);
  });

  it("is where a press on the band strikes a set from, and gives it back", () => {
    // Square 0's notes {}, {A} and {A, B}, bits 1, 2 and 4.
    const after = pressing("badge", "AB");
    // The given {B} is struck too: the square's notes rule it out.
    expect(Array.from(after.board.pencil ?? [])[0]).toBe(0b00110);
    expect(struck(after.ops)).toEqual(["_B", "AB"]);
    // No spotlight: the press was the square's.
    expect(after.ui.spotlit ?? 0).toBe(0);
    const back = pressing("badge", "AB", "AB");
    expect(Array.from(back.board.pencil ?? [])[0]).toBe(0b10110);
    expect(struck(back.ops)).toEqual(["_B"]);
  });

  it("strikes nothing while out of focus, and places the last set left", () => {
    expect(struck(pressing("AB").ops)).toEqual([]);
    const placed = pressing("badge", "__", "AB");
    expect(placed.board.values[0]).toBe(2);
    // Which leaves {A} in no other square.
    expect(Array.from(placed.board.pencil ?? []).map((n) => n & 0b100)).toEqual([
      0, 0, 0, 0,
    ]);
  });

  it("keeps its badge drawn when the gap it sits in is drawn again", () => {
    // Squares 2 and 3 open: square 2's badge is in the gap below square 0,
    // whose horseshoe goes red once {A, B} is placed beneath it.
    const {
      midend,
      palette,
      recording: first,
    } = renderScenario({
      game,
      id: idOf(ANSWER, [2, 3]),
    });
    const [badge] = badgesOf(first.ops);
    midend.playMoves([{ set: [2, 4] }]);
    const recording = new RecordingDrawing(palette);
    midend.redraw(recording);
    const ops = recording.ops;
    // The gap's background, drawn over the badge's middle.
    const cleared = ops.findLastIndex(
      (o) =>
        o.op === "rect" &&
        o.x <= badge.cx &&
        o.x + o.w > badge.cx &&
        o.y <= badge.cy &&
        o.y + o.h > badge.cy &&
        o.w > badge.r * 3,
    );
    expect(
      ops.some(
        (o) =>
          (o.op === "circle" && o.fill === COL_ERROR) ||
          ("color" in o && o.color === COL_ERROR),
      ),
    ).toBe(true);
    expect(cleared).toBeGreaterThanOrEqual(0);
    expect(badgesOf(ops.slice(cleared)).map((o) => [o.cx, o.cy])).toContainEqual([
      badge.cx,
      badge.cy,
    ]);
  });

  it("puts out the spotlight, which a press with no square in focus lights again", () => {
    expect(pressing("AB", "badge").ui.spotlit).toBe(0);
    expect(pressing("badge", "badge", "AB").ui.spotlit).toBe(4);
  });
});

describe("the keyboard in the band", () => {
  // Square 2, the bottom row's left, open with squares 0 and 3; {B} given.
  const hidden = [0, 2, 3];
  const id = idOf(ANSWER, hidden);
  /** The board, Ui and frame after `keys`, Down repeated until the cursor
   * is in the band first where `enter`. */
  const keying = (enter: boolean, ...keys: number[]) => {
    const { midend, palette } = renderScenario({ game, id });
    let board = game.newState(PARAMS, descOf(ANSWER, hidden));
    const ui = game.newUi(board);
    const ds = game.newDrawState(board, game.preferredTileSize);
    const press = (key: number) => {
      midend.processInput(0, 0, key);
      const made = game.interpretMove(board, ui, ds, { x: 0, y: 0 }, key);
      if (made !== null && made !== UI_UPDATE) board = game.executeMove(board, made);
    };
    for (let n = 0; enter && (ui.bandAt ?? -1) < 0; n++) {
      if (n > 10) throw new Error("Down never reached the band");
      press(CURSOR_DOWN);
    }
    for (const k of keys) press(k);
    const recording = new RecordingDrawing(palette);
    midend.forceRedraw(recording);
    return { ops: recording.ops, board, ui };
  };

  it("is entered by Down from the bottom row, its square put in focus", () => {
    const { ui, ops } = keying(true);
    expect(ui.bandAt).toBe(0);
    expect(ui.focus).toBe(2);
    expect(ui.cursor.visible).toBe(false);
    // Its corners about the band's first set, below the board.
    const first = ops.find((o) => o.op === "text" && o.text === "__");
    if (first?.op !== "text") throw new Error("no __");
    const corners = ops.filter(
      (o) => "color" in o && o.color === COL_CURSOR && o.op === "line",
    );
    expect(corners.length).toBeGreaterThan(0);
    for (const o of corners)
      if (o.op === "line") expect(Math.abs(o.y1 - (first.y - 8))).toBeLessThan(30);
  });

  it("walks the band, and Up from its top row goes back to the board", () => {
    expect(keying(true, CURSOR_DOWN, CURSOR_DOWN).ui.bandAt).toBe(2);
    expect(keying(true, CURSOR_DOWN, CURSOR_UP).ui.bandAt).toBe(0);
    const back = keying(true, CURSOR_UP).ui;
    expect(back.bandAt).toBe(-1);
    expect(back.cursor.visible).toBe(true);
  });

  it("strikes the set under it from the square in focus, and gives it back", () => {
    const struck = keying(true, CURSOR_SELECT).board;
    const before = keying(false).board;
    const notes = (b: typeof struck) => Array.from(b.pencil ?? [])[2];
    // The empty set, struck by Enter and given back by Backspace.
    expect(notes(struck)).toBe(notes(before) & ~(1 << 1));
    expect(notes(keying(true, CURSOR_SELECT, CURSOR_SELECT2).board)).toBe(
      notes(before),
    );
    expect(notes(keying(true, CURSOR_SELECT, BACKSPACE).board)).toBe(notes(before));
  });
});

describe("notes full from the deal", () => {
  // Every set, bits 1 to 4.
  const EVERY = 0b11110;
  const open = (hidden: readonly number[]) =>
    game.newState(PARAMS, descOf(ANSWER, hidden));
  const strike = (c: number, ...sets: number[]): FillMove => ({
    type: "pencilStrike",
    marks: sets.map((n) => ({ x: c % 2, y: Math.floor(c / 2), n })),
  });
  const play = (hidden: readonly number[], ...moves: FillMove[]) =>
    moves.reduce((b, m) => game.executeMove(b, m), open(hidden));

  it("are every set not given in each open square as dealt, and none in a given one", () => {
    expect(Array.from(open(ALL).pencil ?? [])).toEqual([EVERY, EVERY, EVERY, EVERY]);
    // {B} and {} given: {A} and {A, B} left.
    expect(Array.from(open([0, 3]).pencil ?? [])).toEqual([0b10100, 0, 0, 0b10100]);
  });

  it("place the one set a square is narrowed to, and strike it from the others", () => {
    const b = play(ALL, strike(0, 1, 3, 4));
    expect(b.values[0]).toBe(2);
    expect(Array.from(b.pencil ?? [])).toEqual([0, 0b11010, 0b11010, 0b11010]);
    // Two left stay notes.
    expect(play(ALL, strike(0, 1, 4)).pencil?.[0]).toBe(0b01100);
    // A square left one set by another's placing holds it, and strikes it in
    // turn: {} and {A, B} given leave {A} and {B}.
    expect(Array.from(play([0, 1], { set: [0, 2] }).values)).toEqual([2, 3, 1, 4]);
  });

  it("give every set back to a square whose set is cleared, but not to the others", () => {
    const b = play(ALL, strike(0, 1, 4), { set: [0, 3] }, { set: [0, 0] });
    expect(b.values[0]).toBe(0);
    expect(b.pencil?.[0]).toBe(EVERY);
    // {B}, struck as it was placed, stays struck: the player gives it back.
    expect(b.pencil?.[1]).toBe(0b10110);
  });

  it("are not struck to nothing", () => {
    const b = play(ALL, strike(0, 1, 4), strike(0, 2, 3));
    expect(b.values[0]).toBe(0);
    expect(b.pencil?.[0]).toBe(0b01100);
  });

  it("leave no square unnoted, and are taken by the slots, so no note preference is offered", () => {
    // No hint-notes preference, nor a pencil mode's or auto-pencil's: no
    // value or note is typed.
    expect(game.prefs).toBeUndefined();
    expect(game.newUi(open([0])).pencilMode).toBeUndefined();
  });

  it("are finished by the walk's strike alone where it leaves one set", () => {
    // {B} and {A, B} given: squares 0 and 2 each {} or {A}, and no horseshoe
    // between square 0 and {B}.
    const b = open([0, 2]);
    const plan = game.hint.plan(b);
    if (!plan.ok) throw new Error(`no plan: ${JSON.stringify(plan)}`);
    expect(game.status(game.executeMove(b, plan.steps[0].move))).toBe("solved");
  });
});

describe("a slot press", () => {
  type Board = ReturnType<typeof game.newState>;
  const TS = game.preferredTileSize;
  const verbs = game.targetVerbs;
  if (verbs === undefined) throw new Error("holding: no slot verbs");
  const open = (hidden: readonly number[]) =>
    game.newState(PARAMS, descOf(ANSWER, hidden));
  /** What square `c`'s sets are: its value, or its notes. */
  const sets = (b: Board, c: number): number =>
    b.values[c] !== 0 ? 1 << b.values[c] : (b.pencil?.[c] ?? 0);
  const A = 0;
  const B = 1;
  /** The board after a press of `button` on feature `k`'s slot of square
   * `c`, through the input, and the move it made. */
  const press = (b: Board, c: number, k: number, button = LEFT_BUTTON) => {
    const ds = game.newDrawState(b, TS);
    const ui = game.newUi(b);
    const at = verbs.geometry.pointAt(b, ds, { x: c % 2, y: c >> 1, k }, ui);
    const move = game.interpretMove(b, ui, ds, at, button);
    game.interpretMove(
      b,
      ui,
      ds,
      at,
      button === LEFT_BUTTON ? LEFT_RELEASE : RIGHT_RELEASE,
    );
    if (move === null || move === UI_UPDATE) return { move, board: b };
    return { move, board: game.executeMove(b, move) };
  };
  const strike = (c: number, ...n: number[]): FillMove => ({
    type: "pencilStrike",
    marks: n.map((v) => ({ x: c % 2, y: c >> 1, n: v })),
  });
  // {} 1, {A} 2, {B} 3, {A, B} 4.
  const EVERY = 0b11110;

  it("lands where the letter is drawn, and is on no slot between two", () => {
    const b = open([]);
    const ds = game.newDrawState(b, TS);
    const ui = game.newUi(b);
    const drawnAt = renderScenario({ game, id: idOf(ANSWER) }).recording.ops.flatMap(
      (o) => (o.op === "text" && (o.text === "A" || o.text === "B") ? [o] : []),
    );
    for (const [c, set] of ANSWER.entries())
      for (const k of [A, B]) {
        if (!(letters(set) & (1 << k))) continue;
        const t = { x: c % 2, y: c >> 1, k };
        const p = verbs.geometry.pointAt(b, ds, t, ui);
        const letter = drawnAt.filter(
          (o) => o.text === "AB"[k] && Math.hypot(o.x - p.x, o.y - p.y) <= 1,
        );
        expect(letter, `square ${c}'s ${"AB"[k]}`).toHaveLength(1);
        expect(verbs.geometry.pointerTarget(b, ds, p, ui)).toEqual(t);
      }
    // Square 0's two slots meet halfway between their middles, on the line
    // between them; a press just past it is the other slot's.
    const [a, z] = [A, B].map((k) =>
      verbs.geometry.pointAt(b, ds, { x: 0, y: 0, k }, ui),
    );
    const mid = Math.round((a.x + z.x) / 2);
    expect(
      verbs.geometry.pointerTarget(b, ds, { x: mid + 1, y: a.y }, ui),
    ).toMatchObject({
      k: B,
    });
  });

  it("goes round present, absent and undecided, striking and giving back halves", () => {
    const first = press(open(ALL), 0, A);
    // A present: the sets lacking it struck.
    expect(first.move).toEqual(strike(0, 1, 3));
    expect(sets(first.board, 0)).toBe(0b10100);
    // A absent: those holding it struck, and those lacking it given back.
    const second = press(first.board, 0, A);
    expect(second.move).toEqual({ notes: [0, 0b01010] });
    // Undecided: every set given back.
    const third = press(second.board, 0, A);
    expect(third.move).toMatchObject({ type: "pencilAdd" });
    expect(sets(third.board, 0)).toBe(EVERY);
  });

  it("goes the other way round with the right button", () => {
    const first = press(open(ALL), 0, B, RIGHT_BUTTON);
    // B absent: {} and {A} left.
    expect(sets(first.board, 0)).toBe(0b00110);
    const second = press(first.board, 0, B, RIGHT_BUTTON);
    expect(sets(second.board, 0)).toBe(0b11000);
  });

  it("places the one set left, and from a placed set gives back what the other letter allows", () => {
    // {A, B} ruled out first: A present leaves {A} alone.
    const ruled = game.executeMove(open(ALL), strike(0, 4));
    const placed = press(ruled, 0, A).board;
    expect(placed.values[0]).toBe(2);
    // B undecided again, from absent: {A, B} back, though it was ruled out,
    // since A is decided and allows it.
    const back = press(placed, 0, B);
    expect(back.move).toEqual({ set: [0, 0], notes: [0, 0b10100] });
    expect(back.board.values[0]).toBe(0);
    expect(sets(back.board, 0)).toBe(0b10100);
  });

  it("does nothing on a given square", () => {
    expect(press(open([3]), 0, A).move).toBeNull();
  });

  it("is carried by a drag to a slot holding what the pressed one held", () => {
    // Square 0's A straight down to square 2's, which lies below it.
    const b = open(ALL);
    const ds = game.newDrawState(b, TS);
    const ui = game.newUi(b);
    const pointAt = (c: number) =>
      verbs.geometry.pointAt(b, ds, { x: c % 2, y: c >> 1, k: A }, ui);
    expect(game.interpretMove(b, ui, ds, pointAt(0), LEFT_BUTTON)).toEqual(
      strike(0, 1, 3),
    );
    expect(game.interpretMove(b, ui, ds, pointAt(2), LEFT_DRAG)).toEqual(
      strike(2, 1, 3),
    );
  });

  it("is made at the cursor by Enter, Space and erase, which the arrows walk over the slots", () => {
    const b = open([0, 1, 3]);
    const ds = game.newDrawState(b, TS);
    const ui = game.newUi(b);
    const key = (button: number) =>
      game.interpretMove(b, ui, ds, { x: 0, y: 0 }, button);
    // The cursor starts on square 0's A, and the first arrow moves it from
    // there and shows it.
    expect(key(CURSOR_RIGHT)).toBe(UI_UPDATE);
    expect([ui.cursor.x, ui.cursor.y, ui.slot]).toEqual([0, 0, B]);
    key(CURSOR_RIGHT);
    expect([ui.cursor.x, ui.cursor.y, ui.slot]).toEqual([1, 0, A]);
    key(CURSOR_RIGHT);
    // The board's edge.
    expect(key(CURSOR_RIGHT)).toBeNull();
    expect([ui.cursor.x, ui.cursor.y, ui.slot]).toEqual([1, 0, B]);
    key(CURSOR_DOWN);
    expect([ui.cursor.x, ui.cursor.y, ui.slot]).toEqual([1, 1, B]);
    // Square 3's B, among {A}, {B} and {A, B} with {} given: present, then
    // absent the other way round.
    expect(key(CURSOR_SELECT)).toEqual(strike(3, 2));
    expect(key(CURSOR_SELECT2)).toEqual(strike(3, 3, 4));
    // Present, and erased back to undecided.
    const struck = game.executeMove(b, strike(3, 2));
    expect(game.interpretMove(struck, ui, ds, { x: 0, y: 0 }, BACKSPACE)).toMatchObject(
      {
        type: "pencilAdd",
      },
    );
    // Square 2 is given.
    key(CURSOR_LEFT);
    key(CURSOR_LEFT);
    expect([ui.cursor.x, ui.cursor.y, ui.slot]).toEqual([0, 1, B]);
    expect(key(CURSOR_SELECT)).toBeNull();
    key(CURSOR_UP);
    expect([ui.cursor.x, ui.cursor.y, ui.slot]).toEqual([0, 0, B]);
  });

  it("types nothing, and offers no keypad", () => {
    const b = open([0]);
    const ds = game.newDrawState(b, TS);
    expect(
      game.interpretMove(b, game.newUi(b), ds, { x: 0, y: 0 }, "2".charCodeAt(0)),
    ).toBeNull();
    // No keypad, and no Marks key: the notes are the slots', with no mode.
    expect(game.requestKeys).toBeUndefined();
    expect(game.notesWithoutMode).toBe(true);
  });

  it("draws the cursor as corners round its slot's letter, and no square highlighted", () => {
    const b = open([0]);
    const ds = game.newDrawState(b, TS);
    const ui = game.newUi(b);
    const t = { x: 1, y: 1, k: B };
    const p = verbs.geometry.pointAt(b, ds, t, ui);
    const { ops } = renderScenario({
      game,
      id: idOf(ANSWER, [0]),
      // Down from square 0's A to square 2's, then right over its B to
      // square 3's A and B.
      presses: [CURSOR_DOWN, CURSOR_RIGHT, CURSOR_RIGHT, CURSOR_RIGHT],
    }).recording;
    const corners = ops.filter(
      (o): o is Extract<DrawOp, { op: "line" }> =>
        o.op === "line" && o.color === COL_CURSOR,
    );
    expect(corners.length).toBeGreaterThan(0);
    const xs = corners.flatMap((l) => [l.x1, l.x2]);
    const ys = corners.flatMap((l) => [l.y1, l.y2]);
    expect(Math.abs((Math.min(...xs) + Math.max(...xs)) / 2 - p.x)).toBeLessThanOrEqual(
      1,
    );
    expect(Math.abs((Math.min(...ys) + Math.max(...ys)) / 2 - p.y)).toBeLessThanOrEqual(
      1,
    );
  });
});

describe("Check & Save on a board of letters", () => {
  // Every set but the given {B}: bits 1, 2 and 4.
  const LEFT = 0b10110;
  const strike = (c: number, ...sets: number[]): FillMove => ({
    type: "pencilStrike",
    marks: sets.map((n) => ({ x: c % 2, y: c >> 1, n })),
  });
  const played = (...moves: FillMove[]) =>
    moves.reduce(
      (b, m) => game.executeMove(b, m),
      game.newState(PARAMS, descOf(ANSWER, BUT_B)),
    );
  /** The red letters and crosses drawn on the squares, and whether any
   * outline is: the band's sets, two letters each, are its own. */
  const reds = (...moves: FillMove[]) => {
    const ops = renderScenario({
      game,
      id: idOf(ANSWER, BUT_B),
      moves,
      showMistakes: true,
    }).recording.ops;
    return {
      letters: ops.flatMap((o) =>
        o.op === "text" && o.color === COL_ERROR && o.text.length === 1 ? [o.text] : [],
      ),
      crosses: ops.filter(
        (o) => o.op === "line" && o.color === COL_ERROR && o.y1 < o.y2 && o.x1 < o.x2,
      ).length,
      outlined: ops.some((o) => o.op === "rect" && o.color === COL_ERROR),
    };
  };

  it("draws a wrong set's letters red where they differ, and not what its strike decides", () => {
    // Square 0's set is {A}: {A, B} has B too. Placed, it strikes {A, B}
    // from squares 2 and 3, which leaves B decided absent in square 3,
    // whose set has it: the board's strike, not the player's, so the one
    // mistake is the placement.
    const b = played({ set: [0, 4] });
    expect(b.pencil?.[3]).toBe(0b00110);
    expect(game.findMistakes?.(b)).toEqual([{ cell: 0, kind: "value", slots: 0b10 }]);
    // The cross is the gap's: {A, B} holds {B} beside it, and no horseshoe
    // says so.
    expect(reds({ set: [0, 4] })).toEqual({
      letters: ["B"],
      crosses: 1,
      outlined: false,
    });
  });

  it("draws red a letter the notes decide wrongly, and outlines a square they leave wrong with none decided", () => {
    // Square 3 is {A, B}: with it struck, {} and {A} are left, B decided
    // absent.
    const decided = strike(3, 4);
    expect(game.findMistakes?.(played(decided))).toEqual([
      { cell: 3, kind: "note", slots: 0b10 },
    ]);
    expect(reds(decided)).toEqual({ letters: [], crosses: 1, outlined: false });
    // Square 0's {A} struck: {} and {A, B} decide no letter, so the square
    // is outlined.
    expect(game.findMistakes?.(played(strike(0, 2)))).toEqual([
      { cell: 0, kind: "note" },
    ]);
    expect(reds(strike(0, 2))).toEqual({ letters: [], crosses: 0, outlined: true });
  });

  it("clears a square's wrong notes by giving back every set not placed", () => {
    const b = played(strike(3, 4));
    const cleared = (
      game.clearMistakes?.(b, game.findMistakes?.(b) ?? []) ?? []
    ).reduce((at, m) => game.executeMove(at, m), b);
    expect(cleared.pencil?.[3]).toBe(LEFT);
    expect(game.findMistakes?.(cleared)).toEqual([]);
  });
});

describe("a hint's gesture on a board of letters", () => {
  type Board = ReturnType<typeof game.newState>;
  const { gesture, keepTrack } = game.hint;
  if (gesture === undefined) throw new Error("holding: no hint gesture");
  /** The first step on the board `hidden` leaves open, its gesture, and
   * each press of it judged by the hint's track as the midend judges it;
   * with `move`, the step made that strike instead, one the fixture's walk,
   * a square a step, never makes. */
  const followed = (
    answer: readonly number[],
    hidden: readonly number[],
    move: FillMove | null = null,
  ) => {
    const b = game.newState(PARAMS, descOf(answer, hidden));
    const plan = game.hint.plan(b);
    if (!plan.ok) throw new Error(`no plan: ${JSON.stringify(plan)}`);
    const step = {
      ...plan.steps[0],
      move: structuredClone(move ?? plan.steps[0].move),
    };
    const ui = game.newUi(b);
    const ds = game.newDrawState(b, game.preferredTileSize);
    const actions = gesture(b, ui, ds, step.move, step);
    let at: Board = b;
    const verdicts: string[] = [];
    for (const a of actions) {
      if (a.kind !== "click") throw new Error(`a ${a.kind}, not a press`);
      const [down, up] =
        a.button === "primary"
          ? [LEFT_BUTTON, LEFT_RELEASE]
          : [RIGHT_BUTTON, RIGHT_RELEASE];
      const move = game.interpretMove(at, ui, ds, a.at, down);
      game.interpretMove(at, ui, ds, a.at, up);
      if (move === null) throw new Error("a press made nothing");
      // A badge's press puts a square in focus, and moves nothing.
      if (move === UI_UPDATE) {
        verdicts.push(`focus ${ui.focus}`);
        continue;
      }
      verdicts.push(keepTrack(move, step, at));
      at = game.executeMove(at, move);
    }
    return {
      actions,
      verdicts,
      before: b,
      after: at,
      struck: move ?? plan.steps[0].move,
      ui,
    };
  };
  const strike = (cells: readonly number[], ...sets: number[]): FillMove => ({
    type: "pencilStrike",
    marks: cells.flatMap((c) => sets.map((n) => ({ x: c % 2, y: c >> 1, n }))),
  });

  it("strikes a square's sets as the letters whose halves they are, one press each", () => {
    // Square 0 holds {}, {A} or {A, B}, {B} given beside it with no
    // horseshoe between: {} and {A, B} struck, A's lacking half by A present
    // and B's holding half by B absent.
    const { actions, verdicts, after } = followed(ANSWER, [0, 2, 3]);
    expect(actions.map((a) => (a.kind === "click" ? a.button : a.kind))).toEqual([
      "primary",
      "secondary",
    ]);
    expect(verdicts).toEqual(["onTrack", "completed"]);
    expect(after.values[0]).toBe(2);
  });

  it("presses each square the strike reaches, and leaves the struck notes as the step does", () => {
    // Squares 0 and 1 holding any set: {} and {B} struck from both, A present.
    const { actions, verdicts, before, after, struck } = followed(
      ANSWER,
      ALL,
      strike([0, 1], 1, 3),
    );
    expect(actions).toHaveLength(2);
    expect(verdicts).toEqual(["onTrack", "completed"]);
    const stepped = game.executeMove(before, struck);
    expect(Array.from(after.pencil ?? [])).toEqual(Array.from(stepped.pencil ?? []));
  });

  it("strikes on the band what no union of letter halves strikes, each square in focus in turn", () => {
    // Every square open: {A, B} struck alone from squares 0 to 2, which no
    // letter's half is.
    const { verdicts, before, after, struck, ui } = followed(
      ANSWER,
      ALL,
      strike([0, 1, 2], 4),
    );
    expect(verdicts).toEqual([
      "focus 0",
      "onTrack",
      "focus 1",
      "onTrack",
      "focus 2",
      "completed",
      "focus -1",
    ]);
    const stepped = game.executeMove(before, struck);
    expect(Array.from(after.pencil ?? [])).toEqual(Array.from(stepped.pencil ?? []));
    expect(ui.spotlit ?? 0).toBe(0);
  });

  it("crosses out on the band each set the step strikes, in its own ink", () => {
    const crossed = (hidden: readonly number[]) => {
      const { recording } = renderScenario({
        game,
        id: idOf(ANSWER, hidden),
        showHint: true,
      });
      const ops = recording.ops;
      return ["__", "A_", "_B", "AB"].filter((text) => {
        const t = ops.find((o) => o.op === "text" && o.text === text);
        if (t?.op !== "text") throw new Error(`no ${text}`);
        // Two lines across the text, rising and falling, in the text's ink.
        const across = ops.filter(
          (o) =>
            o.op === "line" &&
            o.color === t.color &&
            Math.min(o.x1, o.x2) <= t.x &&
            Math.max(o.x1, o.x2) > t.x + 4 &&
            Math.min(o.y1, o.y2) < t.y - 4 &&
            Math.max(o.y1, o.y2) >= t.y - 4 &&
            o.y1 !== o.y2,
        );
        return across.length === 2;
      });
    };
    // Square 0 holds {}, {A} or {A, B}, beside {B} with no horseshoe: {}
    // and {A, B} struck from it.
    expect(crossed([0, 2, 3])).toEqual(["__", "AB"]);
  });
});

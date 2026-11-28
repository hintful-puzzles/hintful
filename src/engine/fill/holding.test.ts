/**
 * A board of sets, each placed once, on the `holding` fixture: a horseshoe
 * between two squares where one's set holds the other's, drawn in the gap
 * between them.
 */

import { describe, expect, it } from "vitest";
import * as holding from "../../generated/engine/testing/fixtures/holding/holding.compiled.ts";
import { COL_CURSOR, COL_ERROR } from "../color/roles.ts";
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
import type { DrawOp } from "../testing/recording-drawing.ts";
import { renderScenario } from "../testing/render-scenario.ts";
import { paramSpaceOf } from "./board.ts";
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

/** The desc of the 2x2 board `answer`, its squares `hidden` written as
 * nothing, each edge's horseshoe read off it. */
function descOf(answer: readonly number[], hidden: readonly number[] = []): string {
  const sp = paramSpaceOf(holding, { w: 2, h: 2 });
  const shoes = sp.edges.map((e) => {
    const [a, z] = [answer[sp.edgeEnds[2 * e]], answer[sp.edgeEnds[2 * e + 1]]];
    return holds(a, z) ? 1 : holds(z, a) ? 2 : 0;
  });
  const given = answer.map((v, c) => (hidden.includes(c) ? "" : v));
  return [...given, ...shoes].join(",");
}

const idOf = (answer: readonly number[], hidden: readonly number[] = []): string =>
  `${game.encodeParams(PARAMS, false)}:${descOf(answer, hidden)}`;

const drawn = (id: string, moves: { set: number[] }[] = []): DrawOp[] =>
  renderScenario({ game, id, moves }).recording.ops;

// {A} {B}
// {}  {A, B}
const ANSWER = [2, 3, 1, 4];

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
    const id = idOf(ANSWER, [0]);
    // Every set is left: they agree on no letter.
    expect(slots(id)).toEqual(["..", "xB", "xx", "AB"]);
    // {A} and {A, B} left: A is there, B open.
    expect(slots(id, [strike(0, 1, 3)])).toEqual(["A.", "xB", "xx", "AB"]);
    // {} and {A} left: B is not, A open.
    expect(slots(id, [strike(0, 3, 4)])).toEqual([".x", "xB", "xx", "AB"]);
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
    // Every set but {A} given.
    const id = idOf(ANSWER, [0]);
    expect(bandOf(id)).toEqual(["__ done", "A_ ink", "_B done", "AB done"]);
    expect(bandOf(id, [{ set: [0, 2] }])).toEqual([
      "__ done",
      "A_ done",
      "_B done",
      "AB done",
    ]);
    // {A, B} placed a second time.
    expect(bandOf(id, [{ set: [0, 4] }])).toEqual([
      "__ done",
      "A_ ink",
      "_B done",
      "AB red",
    ]);
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

  it("are every set in each open square as dealt, and none in a given one", () => {
    expect(Array.from(open([0, 3]).pencil ?? [])).toEqual([EVERY, 0, 0, EVERY]);
  });

  it("place the one set a square is narrowed to", () => {
    const b = play([0, 3], strike(0, 1, 3, 4));
    expect(b.values[0]).toBe(2);
    expect(b.pencil?.[0]).toBe(0);
    // Two left stay notes.
    expect(play([0, 3], strike(0, 1, 4)).pencil?.[0]).toBe(0b01100);
  });

  it("give every set back to a square whose set is cleared", () => {
    const b = play([0, 3], strike(0, 1, 4), { set: [0, 3] }, { set: [0, 0] });
    expect(b.values[0]).toBe(0);
    expect(b.pencil?.[0]).toBe(EVERY);
  });

  it("are not struck to nothing", () => {
    const b = play([0, 3], strike(0, 1, 4), strike(0, 2, 3));
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
    const b = open([0]);
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
    const first = press(open([0, 3]), 0, A);
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
    const first = press(open([0, 3]), 0, B, RIGHT_BUTTON);
    // B absent: {} and {A} left.
    expect(sets(first.board, 0)).toBe(0b00110);
    const second = press(first.board, 0, B, RIGHT_BUTTON);
    expect(sets(second.board, 0)).toBe(0b11000);
  });

  it("places the one set left, and from a placed set gives back what the other letter allows", () => {
    // {A, B} ruled out first: A present leaves {A} alone.
    const ruled = game.executeMove(open([0, 3]), strike(0, 4));
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
    const b = open([0, 2]);
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
    // Square 3's B: present, then absent the other way round.
    expect(key(CURSOR_SELECT)).toEqual(strike(3, 1, 2));
    expect(key(CURSOR_SELECT2)).toEqual(strike(3, 3, 4));
    const struck = game.executeMove(b, strike(3, 3, 4));
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
    expect(game.requestKeys?.(PARAMS, b)).toEqual([]);
  });

  it("draws the cursor as corners round its slot's middle, and no square highlighted", () => {
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
  // Every set, bits 1 to 4.
  const EVERY = 0b11110;
  const strike = (c: number, ...sets: number[]): FillMove => ({
    type: "pencilStrike",
    marks: sets.map((n) => ({ x: c % 2, y: c >> 1, n })),
  });
  const played = (...moves: FillMove[]) =>
    moves.reduce(
      (b, m) => game.executeMove(b, m),
      game.newState(PARAMS, descOf(ANSWER, [0])),
    );
  /** The red letters and crosses drawn on the squares, and whether any
   * outline is: the band's sets, two letters each, are its own. */
  const reds = (...moves: FillMove[]) => {
    const ops = renderScenario({
      game,
      id: idOf(ANSWER, [0]),
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

  it("draws a wrong set's letters red where they differ, and no outline", () => {
    // Square 0's set is {A}: {B} has B and lacks A.
    const b = played({ set: [0, 3] });
    expect(game.findMistakes?.(b)).toEqual([{ cell: 0, kind: "value", slots: 0b11 }]);
    expect(reds({ set: [0, 3] })).toEqual({
      letters: ["B"],
      crosses: 1,
      outlined: false,
    });
  });

  it("draws red a letter the notes decide wrongly, and outlines a square they leave wrong with none decided", () => {
    // {} and {B} left: A decided absent, which {A} has.
    const decided = strike(0, 2, 4);
    expect(game.findMistakes?.(played(decided))).toEqual([
      { cell: 0, kind: "note", slots: 0b01 },
    ]);
    expect(reds(decided)).toEqual({ letters: [], crosses: 1, outlined: false });
    // {A} alone struck: no letter is decided, so the square is outlined.
    expect(game.findMistakes?.(played(strike(0, 2)))).toEqual([
      { cell: 0, kind: "note" },
    ]);
    expect(reds(strike(0, 2))).toEqual({ letters: [], crosses: 0, outlined: true });
  });

  it("clears a square's wrong notes by giving every set back", () => {
    const b = played(strike(0, 2, 4));
    const cleared = (
      game.clearMistakes?.(b, game.findMistakes?.(b) ?? []) ?? []
    ).reduce((at, m) => game.executeMove(at, m), b);
    expect(cleared.pencil?.[0]).toBe(EVERY);
    expect(game.findMistakes?.(cleared)).toEqual([]);
  });
});

describe("a hint's gesture on a board of letters", () => {
  type Board = ReturnType<typeof game.newState>;
  const { gesture, keepTrack } = game.hint;
  if (gesture === undefined) throw new Error("holding: no hint gesture");
  /** The first step on the board `hidden` leaves open, its gesture, and
   * each press of it judged by the hint's track as the midend judges it. */
  const followed = (answer: readonly number[], hidden: readonly number[]) => {
    const b = game.newState(PARAMS, descOf(answer, hidden));
    const plan = game.hint.plan(b);
    if (!plan.ok) throw new Error(`no plan: ${JSON.stringify(plan)}`);
    const step = { ...plan.steps[0], move: structuredClone(plan.steps[0].move) };
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
      if (move === null || move === UI_UPDATE) throw new Error("a press made nothing");
      verdicts.push(keepTrack(move, step, at));
      at = game.executeMove(at, move);
    }
    return { actions, verdicts, before: b, after: at, struck: plan.steps[0].move };
  };

  it("strikes a square's sets as the letters whose halves they are, one press each", () => {
    // Square 0 is {A}: {}, {B} and {A, B} struck, A's lacking half by A
    // present and B's holding half by B absent.
    const { actions, verdicts, after } = followed(ANSWER, [0]);
    expect(actions.map((a) => (a.kind === "click" ? a.button : a.kind))).toEqual([
      "primary",
      "secondary",
    ]);
    expect(verdicts).toEqual(["onTrack", "completed"]);
    expect(after.values[0]).toBe(2);
  });

  it("presses each square the strike reaches, and leaves the struck notes as the step does", () => {
    // Squares 0 and 3, {A} and {A, B}: {} and {B} struck from both, A present.
    const { actions, verdicts, before, after, struck } = followed(ANSWER, [0, 3]);
    expect(actions).toHaveLength(2);
    expect(verdicts).toEqual(["onTrack", "completed"]);
    const stepped = game.executeMove(before, struck);
    expect(Array.from(after.pencil ?? [])).toEqual(Array.from(stepped.pencil ?? []));
  });

  it("refuses a strike that is no union of letter halves", () => {
    // Every square open but square 3: {A, B} struck alone from squares
    // 0 to 2, which no letter's half is.
    expect(() => followed(ANSWER, [0, 1, 2])).toThrow(/no letter's half/);
  });
});

/**
 * A clue one a value, on the `counting` fixture: a number beside each row
 * and column for each of the values 1 to `k`, `k` a size the params give
 * as a number; the board's answer built on no clue; and the walk of notes
 * on a board with no unit, whose placed number reaches only as far as its
 * technique strikes; the clues drawn in a margin before the lines, a tile
 * a value, marked done, printed, and outlined where a step reads one.
 */

import { describe, expect, it } from "vitest";
import * as counting from "../../generated/engine/testing/fixtures/counting/counting.compiled.ts";
import { clueDoneColor } from "../color/palette.ts";
import { COL_ERROR, COL_HINT_OUTLINE } from "../color/roles.ts";
import { validateDesc } from "../contract/desc-error.ts";
import { type HintStep, UI_UPDATE } from "../contract/game.ts";
import { CELL, stepMarks } from "../contract/hint-words.ts";
import type { Color, Point } from "../contract/types.ts";
import type { CandidateReading } from "../hint/candidate-hint.ts";
import {
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_UP,
  LEFT_BUTTON,
  MOD_CTRL,
  MOD_SHFT,
} from "../input/pointer.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { perElement, perPlace, perValue } from "../solve/describe-runtime.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND, renderScenario } from "../testing/render-scenario.ts";
import { type FillBoard, solveBoard, spaceOf } from "./board.ts";
import { fillGame } from "./game.ts";
import type { FillHint } from "./hint.ts";
import { type FillMove, isCandidateMove } from "./notes.ts";
import { marginPlaceAt, marginPoint } from "./value-margin.ts";

const game = fillGame("counting", counting);
type Board = FillBoard<counting.Dealt>;

const dealt = (id: string, seed: string): Board => {
  const p = game.decodeParams(id);
  return game.newState(p, game.newDesc(p, randomNew(seed)).desc);
};

const code = (key: string): number => key.charCodeAt(0);

/** How many of `d` the cells `cells` of `g` hold. */
const holding = (g: ArrayLike<number>, cells: readonly number[], d: number) =>
  cells.filter((c) => g[c] === d).length;

describe("a size that is a number", () => {
  it("is written after the grid as its letter and the number", () => {
    const p = game.decodeParams("4x5k4");
    expect(p).toMatchObject({ w: 4, h: 5, sizes: { k: 4 } });
    expect(game.encodeParams(p, false)).toBe("4x5k4");
    // A board that names none has the default.
    expect(game.decodeParams("4x5").sizes).toEqual({ k: 3 });
  });

  it("refuses a number outside its range, even in a brief ID", () => {
    expect(game.validateParams?.(game.decodeParams("4x4k5"), false)).toMatch(
      /Values must be between 2 and 4/,
    );
    expect(game.validateParams?.(game.decodeParams("4x4k2"), false)).toBeNull();
  });

  it("is a number in the Custom dialog, and said in a board's name", () => {
    const field = game.paramConfig?.find((i) => i.kw === "values");
    expect(field?.type).toBe("string");
    const p = game.decodeParams("4x4k4");
    expect(field?.get(p)).toBe("4");
    expect(field?.label?.words?.(p)).toBe("4 values");
  });
});

describe("a clue one a value", () => {
  it("is dealt for each line and value, as many as the answer holds", () => {
    for (const id of ["4x4k3", "4x3k3", "4x4k4"])
      for (const seed of ["a", "b", "c"]) {
        const b = dealt(id, seed);
        const sp = spaceOf(counting, b);
        const g = solveBoard(counting, b, 0).values;
        const k = game.decodeParams(id).sizes?.["k"] ?? 0;
        const { count } = b.dealt;
        expect(count.at.length).toBe(sp.lines.length * k);
        for (const L of sp.lines)
          for (let d = 1; d <= k; d++)
            expect(count.valueAt[perPlace(L, d)]).toBe(holding(g, sp.lineCells[L], d));
      }
  });

  it("is written each line's values in turn, rows then columns, and read back", () => {
    const p = game.decodeParams("4x3k3");
    const b = dealt("4x3k3", "w");
    const sp = spaceOf(counting, b);
    const desc = game.newDesc(p, randomNew("w")).desc;
    const numbers = desc.split(",").slice(0, -1).map(Number);
    expect(numbers.length).toBe(sp.lines.length * 3);
    // The rows first, then the columns.
    expect(sp.lines.map((L) => sp.lineCells[L][0])).toEqual([0, 4, 8, 0, 1, 2, 3]);
    sp.lines.forEach((L, i) => {
      for (let d = 1; d <= 3; d++)
        expect(numbers[3 * i + d - 1]).toBe(b.dealt.count.valueAt[perPlace(L, d)]);
    });
    // A hidden clue is a `-`, which a board reads as none.
    const hidden = `-,${desc.slice(desc.indexOf(",") + 1)}`;
    const read = game.newState(p, hidden);
    expect(read.dealt.count.valueAt[perPlace(sp.lines[0], 1)]).toBe(-1);
    // A line holds a clue for each value, and no more.
    expect(validateDesc(game, p, `${desc}1,`)).not.toBeNull();
    expect(validateDesc(game, p, desc.slice(0, -2))).not.toBeNull();
  });

  it("is dealt on an answer built on no clue, which the ladder finishes", () => {
    // A blank board's count of every value is 0, no answer's: a build read
    // off it dealt nothing.
    for (const seed of ["a", "b", "c", "d"]) {
      const b = dealt("4x4k3", seed);
      expect(solveBoard(counting, b, 0).verdict).toBe("solved");
    }
  });
});

describe("values as letters", () => {
  it("are keyed as letters from A", () => {
    const keys = game.requestKeys?.(game.decodeParams("4x4k3")) ?? [];
    expect(keys.map((k) => k.label)).toEqual(["A", "B", "C", "Clear"]);
    expect(keys.slice(0, 3).map((k) => k.button)).toEqual(["A", "B", "C"].map(code));
  });

  it("are typed by either case of a letter, or by a digit for the letter at its place", () => {
    const b = dealt("4x4k3", "w");
    const ds = game.newDrawState(b, 32);
    const typed = (key: string) => {
      const ui = game.newUi(b);
      ui.cursor.x = 2;
      ui.cursor.y = 1;
      ui.cursor.visible = true;
      return game.interpretMove(b, ui, ds, { x: 0, y: 0 }, code(key));
    };
    for (const key of ["b", "B", "2"])
      expect(typed(key)).toMatchObject({ type: "set", x: 2, y: 1, n: 2 });
    // Past the board's letters, and past the alphabet's first `k`.
    expect(typed("d")).toBeNull();
    expect(typed("4")).toBeNull();
  });

  it("are drawn, noted and said as letters", () => {
    const id = "4x4k3";
    const b = dealt(id, "w");
    const g = solveBoard(counting, b, 0).values;
    const letter = String.fromCharCode(64 + g[0]);
    const { recording } = renderScenario({
      game,
      id: `${id}:${game.newDesc(game.decodeParams(id), randomNew("w")).desc}`,
      moves: [
        { type: "set", x: 0, y: 0, n: g[0], pencil: false },
        { type: "set", x: 1, y: 0, n: 1, pencil: true },
        { type: "set", x: 1, y: 0, n: 3, pencil: true },
      ],
    });
    const texts = recording.ops.flatMap((o) => (o.op === "text" ? [o.text] : []));
    // The placed letter and the two notes, beside the margin's headings; the
    // clues beside the lines stay numbers.
    expect(texts.filter((t) => /^[A-Z]$/.test(t)).sort()).toEqual(
      [letter, "A", "C", "A", "A", "B", "B", "C"].sort(),
    );
    expect(texts.filter((t) => /^[0-9]$/.test(t)).length).toBeGreaterThan(0);
    // The hint names a letter by its glyph, a count by its digits.
    const said = new Set<string>();
    let at = b;
    for (let k = 0; game.status(at) !== "solved" && k < 200; k++) {
      const got = game.hint.plan(at, undefined, game.newUi(at));
      if (!got.ok) throw new Error("no plan");
      said.add(got.steps[0].explanation);
      at = game.executeMove(at, got.steps[0].move);
    }
    const words = [...said].join("\n");
    expect(words).toMatch(/must be [ABC]\b|can only be [ABC]\b/);
    expect(words).not.toMatch(/must be [1-9]\b|can only be [1-9]\b/);
  });
});

describe("a clue one a value in the margin before its line", () => {
  const TS = 32;
  const colors = game.colors(DEFAULT_BACKGROUND);
  const sameColor = (a: Color, b: Color): boolean => a.every((v, i) => v === b[i]);
  const draw = (b: Board, extra: object = {}): readonly DrawOp[] => {
    const dr = new RecordingDrawing(colors);
    game.redraw(dr, game.newDrawState(b, TS), {
      state: b,
      prev: null,
      dir: 1,
      ui: game.newUi(b),
      animTime: 0,
      flash: NO_FLASH,
      ...extra,
    } as never);
    return dr.ops;
  };
  const texts = (ops: readonly DrawOp[]) =>
    ops.filter((op): op is Extract<DrawOp, { op: "text" }> => op.op === "text");
  /** Where board `s`'s first square lies, read off the grid's frame. */
  const fillOrigin = (s: Board): number => {
    const frame = draw(s).find((op) => op.op === "rect" && op.w === 4 * TS + 1);
    if (frame?.op !== "rect") throw new Error("no frame");
    return frame.x;
  };
  const b = dealt("4x4k3", "w");
  const o = fillOrigin(b);
  /** The middle of the square at `(x, y)`, off the grid or on it. */
  const middle = ({ x, y }: Point): Point => ({
    x: o + x * TS + TS / 2,
    y: o + y * TS + TS / 2,
  });
  const ds = game.newDrawState(b, TS);
  const { count } = b.dealt;

  it("is a tile deep for each value, on the canvas the params size", () => {
    const p3 = game.decodeParams("4x4k3");
    const p4 = game.decodeParams("4x4k4");
    expect(fillOrigin(dealt("4x4k4", "w")) - fillOrigin(b)).toBe(TS);
    expect(game.computeSize(p4, TS).w - game.computeSize(p3, TS).w).toBe(TS);
    // The board lies its margin and a rim in from the top left, and the
    // canvas holds it with a rim beyond.
    const { w } = game.computeSize(p3, TS);
    expect(w - 4 * TS - o).toBe(o - 3 * TS);
  });

  it("leaves every grid line single, where a board of lists doubles each fifth", () => {
    // Each square's surface inside its grid line: a doubled line narrows it.
    const narrowed = draw(dealt("6x6k3", "w")).filter(
      (op) => op.op === "rect" && op.w === TS - 2 && op.h >= TS - 2,
    );
    expect(narrowed).toHaveLength(0);
  });

  it("writes each clue in its value's square, its value heading the margin", () => {
    const off = (t: Point) => t.x < o || t.y < o;
    const drawn = texts(draw(b)).filter(off);
    const clues = drawn.filter((t) => /^[0-9]$/.test(t.text));
    expect(clues.map((t) => [t.text, { x: t.x, y: t.y }])).toEqual(
      Array.from(count.at, (place, k) => [
        String(count.v[k]),
        middle(marginPoint(4, 3, place)),
      ]),
    );
    // Value 1 furthest out: row 0's clue for A is three tiles before it.
    expect(marginPoint(4, 3, perPlace(0, 1))).toEqual({ x: -3, y: 0 });
    expect(marginPoint(4, 3, perPlace(4 + 2, 3))).toEqual({ x: 2, y: -1 });
    const heads = drawn.filter((t) => /^[A-Z]$/.test(t.text));
    expect(heads.map((t) => [t.text, { x: t.x, y: t.y }])).toEqual([
      ["A", middle({ x: -3, y: -1 })],
      ["A", middle({ x: -1, y: -3 })],
      ["B", middle({ x: -2, y: -1 })],
      ["B", middle({ x: -1, y: -2 })],
      ["C", middle({ x: -1, y: -1 })],
    ]);
  });

  it("draws a clue red once its line holds more of its value", () => {
    // A line's clue of 0 for a value, and a square of that line.
    const k = Array.from(count.v).indexOf(0);
    expect(k).toBeGreaterThanOrEqual(0);
    const place = count.at[k];
    const sp = spaceOf(counting, b);
    const c = sp.lineCells[perElement(place)][0];
    const broken = game.executeMove(b, {
      type: "set",
      x: c % 4,
      y: Math.floor(c / 4),
      n: perValue(place),
      pencil: false,
    });
    const red = texts(draw(broken)).filter((t) =>
      sameColor(colors[t.color], colors[COL_ERROR]),
    );
    expect(red.map((t) => ({ x: t.x, y: t.y }))).toContainEqual(
      middle(marginPoint(4, 3, place)),
    );
  });

  /** The board after the move a press at `p` makes. */
  const pressed = (s: Board, p: Point, button = LEFT_BUTTON) => {
    const move = game.interpretMove(s, game.newUi(s), ds, p, button);
    if (move === null || move === UI_UPDATE) throw new Error("the press made no move");
    return game.executeMove(s, move);
  };

  it("is marked done by a press on it, drawn gray, and by Shift or Ctrl with Left or Up", () => {
    const place = perPlace(1, 2);
    const marked = pressed(b, middle(marginPoint(4, 3, place)));
    expect(Array.from(marked.done["count"] ?? [])[count.byAt[place]]).toBe(1);
    const gray = clueDoneColor(DEFAULT_BACKGROUND);
    const grays = (s: Board) =>
      texts(draw(s)).filter((t) => sameColor(colors[t.color], gray)).length;
    expect(grays(b)).toBe(0);
    expect(grays(marked)).toBe(1);
    // A heading, and the margins' corner, take no mark.
    for (const p of [
      { x: -1, y: -1 },
      { x: -2, y: -1 },
    ])
      expect(
        game.interpretMove(b, game.newUi(b), ds, middle(p), LEFT_BUTTON),
      ).toBeNull();
    // The cursor on a square holding B: its row's clue for B, its column's.
    const at = game.executeMove(b, { type: "set", x: 2, y: 1, n: 2, pencil: false });
    const ui = game.newUi(at);
    Object.assign(ui.cursor, { x: 2, y: 1, visible: true });
    const key = (k: number) => game.interpretMove(at, ui, ds, { x: 0, y: 0 }, k);
    const marks = (p: number) => ({ type: "done", kind: "count", k: count.byAt[p] });
    expect(key(CURSOR_LEFT | MOD_SHFT)).toEqual(marks(perPlace(1, 2)));
    expect(key(CURSOR_UP | MOD_CTRL)).toEqual(marks(perPlace(4 + 2, 2)));
    expect(key(CURSOR_RIGHT | MOD_SHFT)).toBeNull();
  });

  it("is printed before its line in the text, a value a column, each headed", () => {
    const text = (game.textFormat?.(b) ?? "").split("\n");
    const row = (L: number) =>
      [1, 2, 3].map((d) => String(count.valueAt[perPlace(L, d)]).padEnd(2)).join("");
    const column = (d: number) =>
      [0, 1, 2, 3]
        .map((x) => `  ${count.valueAt[perPlace(4 + x, d)]} `)
        .join("")
        .trimEnd();
    expect(text.slice(0, 3)).toEqual([
      `    A ${column(1)}`,
      `    B ${column(2)}`,
      `A B C ${column(3)}`,
    ]);
    expect(text[3]).toBe("      +---+---+---+---+");
    expect(text[4]).toBe(`${row(0)}| . | . | . | . |`);
    expect(text).toHaveLength(3 + 9 + 1);
  });

  it("is outlined where a step reads it", () => {
    let outlined = 0;
    for (const seed of ["a", "b", "c", "d"]) {
      let s = dealt("4x4k3", seed);
      for (let made = 0; game.status(s) !== "solved"; made++) {
        expect(made).toBeLessThan(200);
        const got = game.hint.plan(s, undefined, game.newUi(s));
        if (!got.ok) throw new Error("no plan");
        const [step] = got.steps;
        if (step.rung === "full") {
          const places = stepMarks(step)
            .of("outline", CELL)
            .map((q) => marginPlaceAt(4, 4, 3, q.x, q.y));
          expect(places).toHaveLength(1);
          const [place] = places;
          expect(s.dealt.count.byAt[place]).toBeGreaterThanOrEqual(0);
          // Its line is the one striped.
          const striped = stepMarks(step).of("stripes", CELL);
          const L = perElement(place);
          expect(striped.every((q) => (L < 4 ? q.y === L : q.x === L - 4))).toBe(true);
          const p = marginPoint(4, 3, place);
          const sides = draw(s, { hint: step }).filter(
            (op) =>
              op.op === "rect" &&
              sameColor(colors[op.color], colors[COL_HINT_OUTLINE]) &&
              op.x >= o + p.x * TS &&
              op.x + op.w <= o + (p.x + 1) * TS &&
              op.y >= o + p.y * TS &&
              op.y + op.h <= o + (p.y + 1) * TS,
          );
          expect(sides).toHaveLength(4);
          outlined++;
        }
        s = game.executeMove(s, step.move);
      }
    }
    expect(outlined).toBeGreaterThan(0);
  });
});

describe("a size and a tier bounded by a setting", () => {
  const refusal = (id: string, full: boolean) =>
    game.validateParams?.(game.decodeParams(id), full) ?? null;

  it("holds a size to its least under a variation, named by the variation", () => {
    expect(refusal("4x4k3D", false)).toBe(
      "Values must be at least 4 with no diagonal touching.",
    );
    expect(refusal("4x4k4D", false)).toBeNull();
    expect(refusal("4x4k3", false)).toBeNull();
  });

  it("refuses a tier past a deal flag's bounds where the flag is off, in a full ID alone", () => {
    const p = game.decodeParams("2x2k2");
    const full = game.encodeParams(p, true);
    expect(refusal(full, true)).toBe("No 2x2 puzzle with every clue showing is Easy.");
    expect(refusal(full, false)).toBeNull();
    const hidden = game.encodeParams({ ...p, settings: { removeClues: 1 } }, true);
    expect(hidden).toContain("R");
    expect(refusal(hidden, true)).toBeNull();
    expect(
      refusal(game.encodeParams(game.decodeParams("3x2k2"), true), true),
    ).toBeNull();
  });

  it("hides numbers where the flag is on, and none where it is off", () => {
    const p = game.decodeParams("4x4k3");
    const shown = (q: typeof p) =>
      game.newState(q, game.newDesc(q, randomNew("w")).desc).dealt.count.at.length;
    expect(shown(p)).toBe(8 * 3);
    expect(shown({ ...p, settings: { removeClues: 1 } })).toBeLessThan(8 * 3);
  });
});

describe("corner crosses under a variation", () => {
  const TS = 48;
  const crosses = (id: string): number => {
    const b = dealt(id, "w");
    const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
    game.redraw(dr, game.newDrawState(b, TS), {
      state: b,
      prev: null,
      dir: 1,
      ui: game.newUi(b),
      animTime: 0,
      flash: NO_FLASH,
    } as never);
    // A stroke a sixth of a tile long, from a corner toward the square's
    // middle.
    const d = Math.floor(TS / 6);
    return dr.ops.filter(
      (o) =>
        o.op === "line" && Math.abs(o.x2 - o.x1) === d && Math.abs(o.y2 - o.y1) === d,
    ).length;
  };

  it("marks each corner inside the grid with four strokes, and none without it", () => {
    // A 4 by 4 grid has 3 by 3 corners inside it.
    expect(crosses("4x4k4D")).toBe(9 * 4);
    expect(crosses("4x4k4")).toBe(0);
  });
});

describe("the walk of notes on a board with no unit", () => {
  const plan = (
    b: Board,
    reading: CandidateReading,
  ): HintStep<FillMove, FillHint>[] => {
    const got = game.hint.plan(b, undefined, {
      ...game.newUi(b),
      candidateReading: reading,
    });
    if (!got.ok) throw new Error(`no plan: ${JSON.stringify(got)}`);
    return got.steps;
  };

  it("finishes a board under either reading, a placement striking its neighbors", () => {
    const rungs = new Set<string>();
    let boards = 0;
    for (const reading of ["populate", "implicit"] as const)
      for (const seed of ["a", "b", "c", "d"]) {
        let b = dealt("4x4k3", `${reading}${seed}`);
        for (let k = 0; game.status(b) !== "solved"; k++) {
          if (k > 200) throw new Error("the walk runs on");
          const [step] = plan(b, reading);
          rungs.add(step.rung);
          b = game.executeMove(b, step.move);
        }
        boards++;
      }
    expect(boards).toBe(8);
    expect(rungs.has("full")).toBe(true);
    expect(rungs.has("hiddenSingle")).toBe(false);
  });

  // `full`'s words name neither a cell nor the letter struck, so a firing's
  // strikes from cells whose notes are written are one step, as a set's are.
  it("strikes a technique's firing from every noted cell in one step", () => {
    let widest = 0;
    let fulls = 0;
    for (const seed of ["a", "b", "c", "d"]) {
      let b = dealt("4x4k3", `populate${seed}`);
      for (let k = 0; game.status(b) !== "solved"; k++) {
        if (k > 200) throw new Error("the walk runs on");
        const [step] = plan(b, "populate");
        const { move } = step;
        if (
          step.rung === "full" &&
          isCandidateMove(move) &&
          move.type === "pencilStrike"
        ) {
          fulls++;
          widest = Math.max(widest, new Set(move.marks.map((m) => m.y * 4 + m.x)).size);
        }
        b = game.executeMove(b, step.move);
      }
    }
    expect(fulls).toBeGreaterThan(0);
    expect(widest).toBeGreaterThan(1);
  });

  it("says how far a placed number reaches in the description's words", () => {
    // A number placed, so the opening clean has something to strike.
    const b = dealt("4x4k3", "w");
    const n = solveBoard(counting, b, 0).values[5];
    const placed = game.executeMove(b, { type: "set", x: 1, y: 1, n, pencil: false });
    const steps = plan(placed, "populate");
    expect(steps.find((s) => s.rung === "clean")?.explanation).toBe(
      "Now clear the easy ones: cross out any letter already beside its square.",
    );
  });
});

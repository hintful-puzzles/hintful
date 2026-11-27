/**
 * A value a unit holds more than once, on the `emptying` fixture: each row
 * and column holds 1 to `k` once and the empty square, `k + 1`, on the rest,
 * as Salad's lines do. Its answer is a Latin square folded to the domain,
 * the ladder's marks count the empty square as often as a line holds it, and
 * a clue whose meaning reads `k` is derived from the answer; and the empty
 * square typed by X, noted as an X, drawn as a cross and struck by a ball.
 */

import { describe, expect, it } from "vitest";
import * as emptying from "../../generated/engine/testing/fixtures/emptying/emptying.compiled.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import {
  type FillBoard,
  newBoard,
  paramSpaceOf,
  solveBoard,
  spaceOf,
} from "./board.ts";
import { refusalOf } from "./deal/accept.ts";
import { dealContext } from "./deal/context.ts";
import { hideOf } from "./deal/hide.ts";
import { encodeDesc } from "./desc.ts";
import { fillGame } from "./game.ts";
import { applyMove, type FillMove } from "./notes.ts";
import { numberInput } from "./numbers.ts";
import { newFillUi } from "./play.ts";
import { fillRender } from "./render.ts";
import { sampleLatin } from "./sample.ts";

const game = fillGame("emptying", emptying);

/** How many times each value is held by each row and column of `g`. */
function lineCounts(g: ArrayLike<number>, w: number): Map<number, number>[] {
  const out: Map<number, number>[] = [];
  for (let i = 0; i < w; i++)
    for (const at of [(j: number) => i * w + j, (j: number) => j * w + i]) {
      const n = new Map<number, number>();
      for (let j = 0; j < w; j++) n.set(g[at(j)], (n.get(g[at(j)]) ?? 0) + 1);
      out.push(n);
    }
  return out;
}

/** The counts a line of a board `w` wide holding 1 to `k` and the rest empty
 * has. */
const folded = (w: number, k: number): Map<number, number> =>
  new Map([
    ...Array.from({ length: k }, (_, i) => [i + 1, 1] as [number, number]),
    [k + 1, w - k],
  ]);

describe("an answer with a value a unit holds more than once", () => {
  it("is sampled as a Latin square folded to the domain", () => {
    for (const [w, k] of [
      [4, 3],
      [5, 3],
      [6, 2],
    ]) {
      const sp = paramSpaceOf(emptying, { w, h: w });
      for (let i = 0; i < 5; i++) {
        const g = sampleLatin(sp, randomNew(`folded-${w}-${i}`), k + 1);
        for (const counts of lineCounts(g, w))
          expect([...counts].sort()).toEqual([...folded(w, k)].sort());
      }
    }
  });

  it("is finished by the ladder, which counts the empty square as often as a line holds it", () => {
    // Every clue the answer shows, and no given: the Latin library's
    // techniques strike or place the empty square by its count in a line.
    const p = game.decodeParams("5k3");
    const sp = paramSpaceOf(emptying, p);
    let solved = 0;
    for (let i = 0; i < 30; i++) {
      const g = sampleLatin(sp, randomNew(`ladder-${i}`), 4);
      const sizes = { k: 3, mode: 0 };
      const cl = emptying.deriveClues(g, sp, {}, sizes);
      expect(emptying.isAnswer(g, sp, cl)).toBe(true);
      const got = solveBoard(emptying, newBoard(emptying, 5, 5, cl, []), 0);
      // Never impossible: a marks that counted the empty square once a line
      // would strike it from a line already holding one.
      expect(got.verdict).not.toBe("impossible");
      if (got.verdict === "solved") {
        expect([...got.values]).toEqual([...g]);
        solved++;
      }
    }
    expect(solved).toBeGreaterThan(0);
  });

  it("derives a clue whose meaning reads a size, and deals a board of it", () => {
    for (const id of ["4k3", "5k3", "5k4"]) {
      const p = game.decodeParams(id);
      const k = p.sizes?.["k"] ?? 0;
      const b = game.newState(p, game.newDesc(p, randomNew(id)).desc);
      const { sees } = b.dealt;
      expect(sees.at.length).toBeGreaterThan(0);
      // The first number a clue sees is never the empty square.
      for (const v of sees.v) expect(v).toBeLessThanOrEqual(k);
      const got = solveBoard(emptying, b, 0);
      expect(got.verdict).toBe("solved");
      const w = p.w;
      for (const counts of lineCounts(got.values, w))
        expect([...counts].sort()).toEqual([...folded(w, k)].sort());
      expect(emptying.isAnswer(got.values, spaceOf(emptying, b), b.dealt)).toBe(true);
    }
  });
});

describe("the empty square", () => {
  const p = game.decodeParams("5k3B");
  // A board dealt a ball, which a deal may hide every one of.
  const board = ((): FillBoard<emptying.Dealt> => {
    for (let i = 0; ; i++) {
      const b = game.newState(p, game.newDesc(p, randomNew(`empty-${i}`)).desc);
      if (b.dealt.ball.at.length > 0) return b;
    }
  })();
  const EMPTY = 4;
  const TS = 32;
  const ds = { tileSize: TS };
  const input = numberInput<emptying.Dealt, typeof ds>(emptying, () => 0);
  const open = [...board.fixed].indexOf(0);
  const given = [...board.fixed].indexOf(1);
  const pt = { x: 0, y: 0 };
  /** What `key` does on cell `c` of `b`, selected. */
  const press = (
    b: FillBoard<emptying.Dealt>,
    c: number,
    key: string,
    notes = false,
  ) => {
    const ui = game.newUi(b);
    Object.assign(ui.cursor, { x: c % 5, y: Math.floor(c / 5), visible: true });
    ui.pencilMode = notes;
    return input.interpretMove(b, ui, ds, pt, key.charCodeAt(0));
  };
  const notesOf = (b: FillBoard<emptying.Dealt>, c: number) =>
    [1, 2, 3, 4].filter((n) => ((b.pencil?.[c] ?? 0) >> n) & 1);
  /** `b` after `key` on cell `c`. */
  const typing = (
    b: FillBoard<emptying.Dealt>,
    c: number,
    key: string,
    notes = false,
  ) => {
    const move = press(b, c, key, notes);
    if (move === null || typeof move !== "object")
      throw new Error(`${key} made no move`);
    return applyMove(emptying, b, move as FillMove);
  };

  it("is typed by X, - and _, its glyph's key typing nothing", () => {
    for (const key of ["X", "x", "-", "_"])
      expect(press(board, open, key), key).toMatchObject({ type: "set", n: EMPTY });
    expect(press(board, open, "4")).toBeNull();
    expect(press(board, open, "3")).toMatchObject({ n: 3 });
    expect(press(board, given, "X")).toBeNull();
    // In notes, X is the empty square's note.
    expect(notesOf(typing(board, open, "X", true), open)).toEqual([EMPTY]);
  });

  it("is struck from a square's notes by O, which puts it back the second time", () => {
    for (const key of ["O", "o", "+", "="])
      expect(notesOf(typing(board, open, key), open), key).toEqual([1, 2, 3]);
    const balled = typing(board, open, "O");
    expect(notesOf(typing(balled, open, "O"), open)).toEqual([]);
    // Notes holding the empty square lose it; notes without it gain it.
    const noted = typing(typing(board, open, "1", true), open, "X", true);
    const struck = typing(noted, open, "O");
    expect(notesOf(struck, open)).toEqual([1]);
    expect(notesOf(typing(struck, open, "O"), open)).toEqual([1, EMPTY]);
    // A square holding a value takes no ball.
    expect(press(typing(board, open, "X"), open, "O")).toBeNull();
    expect(press(board, given, "O")).toBeNull();
  });

  it("offers the symbols, X, O and the clear key", () => {
    expect(game.requestKeys?.(p).map((k) => k.label)).toEqual([
      "1",
      "2",
      "3",
      "X",
      "O",
      "Clear",
    ]);
  });

  it("shows a hint's placement of it as X", () => {
    const keys = input
      .gesture(board, newFillUi(), ds, { set: [open, EMPTY] })
      .flatMap((a) => (a.kind === "key" ? [a.code] : []));
    expect(keys).toEqual(["X".charCodeAt(0)]);
  });

  it("rules itself out of a line by auto-pencil only once the line holds every copy", () => {
    // A row of five holds the empty square twice: the first placed strikes
    // nothing from the row, the second strikes it from the rest.
    const row = [0, 1, 2, 3, 4];
    const blank: FillBoard<emptying.Dealt> = {
      ...board,
      values: new Uint8Array(25),
      fixed: new Uint8Array(25),
      pencil: new Int32Array(25).fill(0b11110),
    };
    const place = (b: typeof blank, c: number) =>
      applyMove(emptying, b, {
        type: "set",
        x: c % 5,
        y: 0,
        n: EMPTY,
        pencil: false,
        autoElim: true,
      });
    const once = place(blank, 0);
    expect(row.slice(1).map((c) => notesOf(once, c))).toEqual(
      row.slice(1).map(() => [1, 2, 3, 4]),
    );
    const twice = place(once, 1);
    expect(row.slice(2).map((c) => notesOf(twice, c))).toEqual(
      row.slice(2).map(() => [1, 2, 3]),
    );
    // Its column holds it once, and loses nothing.
    expect(notesOf(twice, 5)).toEqual([1, 2, 3, 4]);
  });

  describe("drawn", () => {
    const draw = (b: FillBoard<emptying.Dealt>): readonly DrawOp[] => {
      const render = fillRender(
        emptying,
        {
          play: emptying.play,
          lineClues: emptying.lineClues,
          slotClues: emptying.slotClues,
        },
        (s) => s,
      );
      const dr = new RecordingDrawing(render.colors(DEFAULT_BACKGROUND));
      render.redraw(dr, render.newDrawState(b, TS), {
        state: b,
        prev: null,
        dir: 1,
        ui: newFillUi(),
        animTime: 0,
        flash: NO_FLASH,
      });
      return dr.ops;
    };
    const count = (ops: readonly DrawOp[], op: DrawOp["op"]) =>
      ops.filter((o) => o.op === op).length;
    const texts = (ops: readonly DrawOp[]) =>
      ops.flatMap((o) => (o.op === "text" ? [o.text] : []));
    /** The texts `b` draws beyond the dealt board's, the givens'. */
    const added = (b: FillBoard<emptying.Dealt>) => {
      const left = texts(draw(board));
      return texts(draw(b))
        .filter((t) => {
          const i = left.indexOf(t);
          if (i < 0) return true;
          left.splice(i, 1);
          return false;
        })
        .sort();
    };

    it("draws a placed empty square as a cross, not its glyph", () => {
      const base = draw(board);
      const crossed = draw(typing(board, open, "X"));
      expect(count(crossed, "line") - count(base, "line")).toBe(2);
      expect(texts(crossed)).toEqual(texts(base));
    });

    it("notes it as an X", () => {
      expect(added(typing(typing(board, open, "X", true), open, "2", true))).toEqual([
        "2",
        "X",
      ]);
    });

    it("draws a ball round a square whose notes lack it, bare where they are every other value", () => {
      const base = draw(board);
      const bare = draw(typing(board, open, "O"));
      expect(count(bare, "circle")).toBeGreaterThan(count(base, "circle"));
      expect(texts(bare)).toEqual(texts(base));
      expect(added(typing(typing(board, open, "O"), open, "1", true))).toEqual([
        "2",
        "3",
      ]);
    });

    it("draws a clue's ball as the player's, in ink", () => {
      const balls = board.dealt.ball.at.length;
      expect(balls).toBeGreaterThan(0);
      const inks = (ops: readonly DrawOp[]) =>
        new Set(ops.flatMap((o) => (o.op === "circle" ? [o.outlineRgb] : [])));
      const free = [...board.fixed].findIndex(
        (f, c) => f === 0 && !board.dealt.ball.at.includes(c),
      );
      expect(inks(draw(board)).size).toBe(1);
      expect(inks(draw(typing(board, free, "O"))).size).toBe(2);
    });
  });
});

describe("a clue kind a ruleset deals", () => {
  it("is dealt and written on its ruleset's boards alone", () => {
    for (const [id, on, off] of [
      ["4k3S", "sees", "ball"],
      ["5k3S", "sees", "ball"],
      ["5k3B", "ball", "sees"],
      ["6k3B", "ball", "sees"],
    ] as const) {
      const p = game.decodeParams(id);
      const { desc } = game.newDesc(p, randomNew(id));
      const b = game.newState(p, desc);
      expect(b.dealt[on].at.length, id).toBeGreaterThan(0);
      expect(b.dealt[off].at.length, id).toBe(0);
      expect(solveBoard(emptying, b, 0).verdict, id).toBe("solved");
      // The slots' segment ends in a comma, which a board without them does
      // not write.
      const commas = desc.split(",").length - 1;
      expect(commas, id).toBe(on === "sees" ? 1 : 0);
      // The other ruleset reads none of it.
      const other = game.decodeParams(id.replace(/[SB]$/, on === "sees" ? "B" : "S"));
      expect(() => game.newState(other, desc), id).toThrow();
    }
  });

  it("reads no code of a kind its board is not dealt", () => {
    // Every slot blank, then a ball on the first square and the rest blank.
    const read = (id: string, desc: string) =>
      game.newState(game.decodeParams(id), desc).dealt;
    expect([...read("4k3B", "Oo").ball.at]).toEqual([0]);
    expect(() => read("4k3S", "p,Oo")).toThrow();
    expect([...read("4k3S", "p,Ao").given.at]).toEqual([0]);
  });

  it("writes the ruleset's code at its default", () => {
    const p = game.decodeParams("4k3");
    expect(game.encodeParams(p, false)).toBe("4k3S");
    expect(game.encodeParams(game.decodeParams("4k3B"), false)).toBe("4k3B");
  });
});

describe("the deal", () => {
  /** A deal's context and hide on board `id`, its answer and every clue
   * the answer derives. */
  const drawn = (id: string, seed: string) => {
    const p = game.decodeParams(id);
    const rs = randomNew(seed);
    const cx = dealContext(emptying, emptying.deal, p, rs);
    const k = p.sizes?.["k"] ?? 0;
    const g = sampleLatin(cx.sp, rs, k + 1);
    return { cx, k, g, clues: emptying.deriveClues(g, cx.sp, {}, cx.sizes) };
  };

  it("hides every given on a Sight board below 5x5, and from 5x5 shows some", () => {
    const givens = (id: string) =>
      Array.from({ length: 10 }, (_, i) => {
        const p = game.decodeParams(id);
        return game.newState(p, game.newDesc(p, randomNew(`whole-${id}-${i}`)).desc)
          .dealt.given.at.length;
      });
    expect(givens("4k3S")).toEqual(Array(10).fill(0));
    expect(Math.max(...givens("5k3S"))).toBeGreaterThan(0);
    // A Balls board is not Sight's, so it shows givens at any size.
    expect(Math.max(...givens("4k3B"))).toBeGreaterThan(0);
  });

  const validate = (id: string, full: boolean): string | null => {
    if (game.validateParams === undefined) throw new Error("no validateParams");
    return game.validateParams(game.decodeParams(id), full);
  };

  it("refuses as many values as a line has squares", () => {
    const why = (id: string) => validate(id, false);
    expect(why("4k4")).toBe("Values must be less than the grid size.");
    expect(why("5k4")).toBeNull();
  });

  it("refuses a tier a ruleset's bounds keep from a board of its sizes", () => {
    const why = (id: string) => validate(id, true);
    expect(why("4k2Bdn")).toBe("No 4x4 Balls puzzle with 2 values is Normal.");
    expect(why("5k2Bdn")).toBeNull();
    // Other sizes, another ruleset and another tier keep no such bound.
    expect(why("4k3Bdn")).toBeNull();
    expect(why("4k2Sdn")).toBeNull();
    expect(why("4k2Bde")).toBeNull();
    // Only a full ID names the tier.
    expect(validate("4k2Bdn", false)).toBeNull();
  });

  it("tries a ball straight after the number at its square goes", () => {
    for (let i = 0; i < 5; i++) {
      const { cx, clues } = drawn("5k3B", `after-${i}`);
      const hide = hideOf(cx);
      const order = hide.hideOrder(clues, hide.unitsOf(clues, hide.allShown(clues)));
      // The hidden kinds are numbered given, sees, ball, in the deal's order.
      const balls = clues.given.at.length + clues.sees.at.length;
      let followed = 0;
      order.forEach(([j], n) => {
        if (j < balls) return;
        const at = clues.ball.at[j - balls];
        expect(order[n - 1]?.[0], `ball at ${at}`).toBe(clues.given.byAt[at]);
        followed++;
      });
      expect(followed).toBe(clues.ball.at.length);
    }
  });

  it("keeps a ball while the number at its square is shown", () => {
    let weakened = 0;
    for (let i = 0; i < 10; i++) {
      const { cx, k, clues } = drawn("5k3B", `kept-${i}`);
      const kept = hideOf(cx).hideUpTo(clues, 0);
      if (kept === null) continue;
      const { given, ball } = kept;
      // A number shown has its ball beside it.
      given.at.forEach((at, j) => {
        if (given.v[j] <= k)
          expect(ball.byAt[at], `ball at ${at}`).toBeGreaterThanOrEqual(0);
      });
      for (const at of ball.at) if (given.byAt[at] < 0) weakened++;
    }
    expect(weakened).toBeGreaterThan(0);
  });

  it("refuses a board whose empty squares the named techniques alone place", () => {
    for (let i = 0; i < 5; i++) {
      const { cx, g, clues } = drawn("5k3B", `refuse-${i}`);
      // Every number given: the empty squares fall without a number placed.
      expect(refusalOf(cx)(clues, g)).toBe(
        "fill: the refused techniques alone place the value's squares",
      );
    }
    for (let i = 0; i < 10; i++) {
      const { cx, g, clues } = drawn("5k3B", `kept-board-${i}`);
      const kept = hideOf(cx).hideUpTo(clues, 0);
      if (kept === null) continue;
      const refused = refusalOf(cx)(kept, g);
      if (refused === null) return;
    }
    expect.fail("no board of ten hidden from was kept");
  });
});

describe("values as a ruleset draws them", () => {
  const dealt = (id: string, seed: string) => {
    const p = game.decodeParams(id);
    const { desc } = game.newDesc(p, randomNew(seed));
    return { p, desc, b: game.newState(p, desc) };
  };
  const read = (id: string, desc: string) =>
    game.newState(game.decodeParams(id), desc).dealt;

  it("writes each as its glyph, the slots' clues and a comma, then the squares", () => {
    for (let i = 0; i < 10; i++) {
      // Sight's in letters, the empty square X; Balls' in numerals, X and O.
      const sight = dealt("5k3S", `glyph-${i}`);
      expect(sight.desc, sight.desc).toMatch(
        /^[a-z]*([A-C][a-z]*)*,[a-z]*([A-CX][a-z]*)*$/,
      );
      const balls = dealt("5k3B", `glyph-${i}`);
      expect(balls.desc, balls.desc).toMatch(/^[a-z]*([1-3XO][a-z]*)*$/);
      // Each reads back to what it was written from.
      for (const { b, desc } of [sight, balls])
        expect(encodeDesc(emptying, emptying.deal, spaceOf(emptying, b), b.dealt)).toBe(
          desc,
        );
    }
    // A board of no givens writes its squares as a run (upstream Salad's),
    // and the comma stands between the two.
    expect(read("4k3S", "p,p").given.at.length).toBe(0);
    expect(() => read("4k3S", "pp")).toThrow();
    expect(() => read("4k3S", "p")).toThrow();
  });

  it("writes the slots top, left, bottom and right, where the space numbers them top, bottom, left, right", () => {
    // The fifth slot written is the left of the first row, the space's
    // ninth; the ninth written the bottom of the first column, its fifth.
    expect([...read("4k3S", "dAk,p").sees.at]).toEqual([8]);
    expect([...read("4k3S", "hAg,p").sees.at]).toEqual([4]);
    expect([...read("4k3S", "oA,p").sees.at]).toEqual([15]);
  });

  it("reads a glyph of the board's ruleset alone, within the values its size gives", () => {
    expect([...read("4k3B", "1o").given.v]).toEqual([1]);
    expect([...read("4k3B", "Xo").given.v]).toEqual([4]);
    expect(() => read("4k3B", "Ao")).toThrow();
    expect(() => read("4k3S", "p,1o")).toThrow();
    // A value past `k`, which a desc read without the sizes once let by.
    expect(() => read("4k3B", "4o")).toThrow();
    expect(() => read("4k3S", "p,Do")).toThrow();
    expect(() => read("4k3S", "Do,p")).toThrow();
  });

  it("draws, prints and offers keys in the ruleset's glyphs, typed by letter or digit on both", () => {
    const sight = dealt("5k3S", "keys").b;
    const balls = dealt("5k3B", "keys").b;
    const labels = (id: string) =>
      game.requestKeys?.(game.decodeParams(id)).map((k) => k.label);
    expect(labels("5k3S")).toEqual(["A", "B", "C", "X", "O", "Clear"]);
    expect(labels("5k3B")).toEqual(["1", "2", "3", "X", "O", "Clear"]);
    const input = numberInput<emptying.Dealt, { tileSize: number }>(emptying, () => 0);
    for (const b of [sight, balls]) {
      const open = [...b.fixed].indexOf(0);
      for (const key of ["A", "a", "1"]) {
        const ui = game.newUi(b);
        Object.assign(ui.cursor, {
          x: open % 5,
          y: Math.floor(open / 5),
          visible: true,
        });
        const at = { x: 0, y: 0 };
        expect(
          input.interpretMove(b, ui, { tileSize: 32 }, at, key.charCodeAt(0)),
          key,
        ).toMatchObject({ n: 1 });
      }
    }
    // Drawn, a Sight board's givens and clues are letters; a Balls board's
    // numerals.
    const drawn = (b: FillBoard<emptying.Dealt>) => {
      const render = fillRender(
        emptying,
        {
          play: emptying.play,
          lineClues: emptying.lineClues,
          slotClues: emptying.slotClues,
          glyphClues: emptying.glyphClues,
        },
        (s) => s,
      );
      const dr = new RecordingDrawing(render.colors(DEFAULT_BACKGROUND));
      render.redraw(dr, render.newDrawState(b, 32), {
        state: b,
        prev: null,
        dir: 1,
        ui: newFillUi(),
        animTime: 0,
        flash: NO_FLASH,
      });
      return dr.ops.flatMap((o) => (o.op === "text" ? [o.text] : [])).join("");
    };
    expect(drawn(sight)).toMatch(/^[A-C]+$/);
    expect(drawn(balls)).toMatch(/^[1-3]+$/);
    // The text format prints the board's glyphs: the slots' letters, and the
    // empty square as X.
    const text = game.textFormat?.(sight) ?? "";
    expect(text).toMatch(/[A-C]/);
    expect(text).not.toMatch(/[1-9]/);
    expect(game.textFormat?.(balls) ?? "").not.toMatch(/[A-C]/);
    const open = [...balls.fixed].indexOf(0);
    const emptied = {
      ...balls,
      values: balls.values.map((v, c) => (c === open ? 4 : v)),
    };
    expect(game.textFormat?.(emptied) ?? "").toContain(" X ");
  });

  it("says a clue's value in the ruleset's glyph", () => {
    let said = 0;
    for (let i = 0; i < 10 && said === 0; i++) {
      const { b } = dealt("5k3S", `said-${i}`);
      const got = game.hint.plan(b);
      if (!got.ok) throw new Error(`no plan: ${got.error}`);
      for (const s of got.steps) {
        const m = /sees (\S+) first/.exec(s.explanation ?? "");
        if (m === null) continue;
        expect(m[1]).toMatch(/^[A-C]$/);
        said++;
      }
    }
    expect(said).toBeGreaterThan(0);
  });
});

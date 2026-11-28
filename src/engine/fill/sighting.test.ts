/**
 * Values only the deal places on a board of numbers, and an ID written as
 * upstream undead.c's, on the `sighting` fixture: ghosts and zombies among
 * mirrors, numbers round the grid counting the zombies each sightline passes.
 * A mirror is a value its clue fixes, drawn by its painter whatever the
 * player's preference, typed by no key and noted by no note; the ID holds the
 * counts, the grid's mirrors and given monsters between runs of empty
 * squares, and the numbers clockwise from the top left.
 */

import { describe, expect, it } from "vitest";
import * as sighting from "../../generated/engine/testing/fixtures/sighting/sighting.compiled.ts";
import { validateDesc } from "../contract/desc-error.ts";
import { CELL, mark, phrase } from "../contract/hint-words.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { sights } from "../solve/describe-runtime.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { type FillBoard, solveBoard, spaceOf } from "./board.ts";
import { sightlinesLaid } from "./deal/sightlines.ts";
import { encodeDesc } from "./desc.ts";
import { fillGame } from "./game.ts";
import type { FillUi } from "./play.ts";

type Board = FillBoard<sighting.Dealt>;

const game = fillGame("sighting", sighting);
const TS = 48;
const colors = game.colors(DEFAULT_BACKGROUND);
const p = game.decodeParams("3x3");

/** A 3x3 of four ghosts and three zombies, a mirror `\` in its top left
 * corner and one `/` in its middle, and the numbers 0 to 11 written round
 * it: each number says where it was read from. */
const DESC = "4,3,LcRd,0,1,2,3,4,5,6,7,8,9,10,11";
/** The slot each place round the grid is, clockwise from the top left: the
 * top left to right, the right top to bottom, the bottom right to left and
 * the left bottom to top. The space numbers the slots above each column,
 * below each, left of each row and right of each. */
const CLOCKWISE = [0, 1, 2, 9, 10, 11, 5, 4, 3, 8, 7, 6];

const mirrored: Board = game.newState(p, DESC);

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

/** The ops of `ops` drawn inside cell `c`'s square, read off the grid's frame. */
function inCell(ops: readonly DrawOp[], c: number, w: number): DrawOp[] {
  const frame = ops.find((op) => op.op === "rect" && op.w === w * TS + 1);
  if (frame?.op !== "rect") throw new Error("no frame");
  const x0 = frame.x + (c % w) * TS;
  const y0 = frame.y + Math.floor(c / w) * TS;
  const inside = (x: number, y: number) =>
    x > x0 && x < x0 + TS && y > y0 && y < y0 + TS;
  return ops.filter((op) => {
    if (op.op === "line") return inside((op.x1 + op.x2) / 2, (op.y1 + op.y2) / 2);
    if (op.op === "text") return inside(op.x, op.y);
    return false;
  });
}

describe("an ID written as upstream undead.c's", () => {
  it("reads the counts, the mirrors and the runs between them", () => {
    expect(mirrored.dealt.total.many).toEqual([4, 3]);
    const { mirror } = mirrored.dealt;
    expect([...mirror.at]).toEqual([0, 4]);
    expect([...mirror.v]).toEqual([1, 2]);
    // A mirror is fixed at its value, `\` 3 and `/` 4.
    expect([mirrored.values[0], mirrored.values[4]]).toEqual([3, 4]);
    expect([mirrored.fixed[0], mirrored.fixed[4]]).toEqual([1, 1]);
    expect([...mirrored.fixed].filter((f) => f === 1)).toHaveLength(2);
  });

  it("reads the numbers clockwise from the top left", () => {
    const { sees } = mirrored.dealt;
    expect(CLOCKWISE.map((s) => sees.valueAt[s])).toEqual(
      Array.from({ length: 12 }, (_, k) => k),
    );
  });

  it("writes a board back as it read it", () => {
    expect(
      encodeDesc(sighting, sighting.deal, spaceOf(sighting, mirrored), mirrored.dealt),
    ).toBe(DESC);
  });

  it("writes a dealt board, its givens as letters, and reads it back", () => {
    for (const seed of ["a", "b", "c"]) {
      const { desc } = game.newDesc(p, randomNew(seed));
      expect(validateDesc(game, p, desc)).toBeNull();
      const b = game.newState(p, desc);
      expect(encodeDesc(sighting, sighting.deal, spaceOf(sighting, b), b.dealt)).toBe(
        desc,
      );
      expect(desc).toMatch(/^\d+,\d+,[a-zGZLR]+(,\d+){12}$/);
    }
  });

  it("refuses a grid too long or too short, and a mirror's number past its two", () => {
    expect(validateDesc(game, p, "4,3,LcRe,0,1,2,3,4,5,6,7,8,9,10,11")).not.toBeNull();
    expect(validateDesc(game, p, "4,3,LcRc,0,1,2,3,4,5,6,7,8,9,10,11")).not.toBeNull();
    expect(validateDesc(game, p, "4,3,LcRd,0,1,2,3,4,5,6,7,8,9,10")).not.toBeNull();
  });
});

describe("a step's stripes beside the slots", () => {
  it("hatches no clue for stripes on part of a row, as a sightline's are", () => {
    // The square right of the middle mirror, the one striped square of
    // its row: no line, so the clues at the row's ends are not its.
    const words = phrase`${mark.this("stripes", CELL, [{ x: 2, y: 1 }], "square")}`;
    const dr = new RecordingDrawing(colors);
    game.redraw(dr, game.newDrawState(mirrored, TS), {
      state: mirrored,
      prev: null,
      dir: 1,
      ui: game.newUi(mirrored),
      animTime: 0,
      flash: NO_FLASH,
      hint: { words, highlights: { area: [], hatch: [], targets: [], marks: [] } },
    } as never);
    expect(dr.ops.filter((op) => op.op === "hatch")).toHaveLength(1);
  });
});

describe("values only the deal places, on a board of numbers", () => {
  it("draws a mirror by its painter, as pictures and as letters alike", () => {
    const pictured = draw(mirrored);
    const ui = game.newUi(mirrored);
    ui.pictures = false;
    const lettered = draw(mirrored, ui);
    for (const c of [0, 4]) {
      const ops = inCell(pictured, c, 3);
      expect(ops.some((op) => op.op === "line")).toBe(true);
      expect(ops.some((op) => op.op === "text" && op.text.trim() !== "")).toBe(false);
      expect(inCell(lettered, c, 3)).toEqual(ops);
    }
  });

  it("prints a mirror as its glyph, and the counts beneath the grid", () => {
    const text = (game.textFormat?.(mirrored) ?? "").split("\n");
    const [top, middle] = text.filter((l) => l.includes("\\") || l.includes("/"));
    expect(top).toContain("\\");
    expect(middle).toContain("/");
    expect(text.filter((l) => l !== "").at(-1)).toBe("G: 4 Z: 3");
  });

  it("offers a key for each monster and none for a mirror", () => {
    const keys = game.requestKeys?.(p, mirrored) ?? [];
    expect(keys.map((k) => k.label)).toEqual(["Ghost", "Zombie", expect.anything()]);
    expect(game.requestKeys?.(p).map((k) => k.label)).toEqual(keys.map((k) => k.label));
  });

  it("types nothing into a mirror's square", () => {
    const ui = game.newUi(mirrored);
    Object.assign(ui.cursor, { x: 1, y: 1, visible: true });
    for (const key of ["G", "Z", "1", "2", "3", "4"])
      expect(
        game.interpretMove(
          mirrored,
          ui,
          game.newDrawState(mirrored, TS),
          { x: 0, y: 0 },
          key.charCodeAt(0),
        ),
      ).toBeNull();
  });
});

describe("a deal of mirrors first, sightlines filled, and boards kept", () => {
  const p4 = game.decodeParams("4x4");
  const boards = ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8"].map((seed) =>
    game.newState(p4, game.newDesc(p4, randomNew(seed)).desc),
  );
  /** The most squares a sightline of board `b` passes. */
  const longest = (b: Board): number =>
    Math.max(...sights(spaceOf(sighting, b), b.dealt.mirror).map((s) => s.all.length));
  /** A 2x6 of twelve ghosts and no mirror, every number 0. */
  const tall = game.newState(game.decodeParams("2x6"), `12,0,l${",0".repeat(16)}`);
  const sized = (b: Board) => ({ ...b.dealt, w: b.w, h: b.h });

  it("lays mirrors first on a share of the squares within its bounds, either way", () => {
    const ways = new Set<number>();
    for (const b of boards) {
      const { at, v } = b.dealt.mirror;
      expect(at.length).toBeGreaterThanOrEqual(2);
      expect(at.length).toBeLessThanOrEqual(8);
      for (const m of v) ways.add(m);
    }
    expect([...ways].sort()).toEqual([1, 2]);
  });

  it("keeps first cells whose sightlines pass at most a side and one squares", () => {
    for (const b of boards) expect(longest(b)).toBeLessThanOrEqual(5);
    expect(longest(tall)).toBe(6);
    expect(sighting.firstKeeps(spaceOf(sighting, tall), sized(tall), 0)).toBe(false);
    expect(sighting.firstKeeps(spaceOf(sighting, mirrored), sized(mirrored), 0)).toBe(
      true,
    );
  });

  it("keeps a board holding ghosts, and as many zombies or more", () => {
    for (const b of boards) {
      const [ghosts, zombies] = b.dealt.total.many;
      expect(ghosts).toBeGreaterThan(0);
      expect(zombies).toBeGreaterThanOrEqual(ghosts);
    }
    expect(sighting.dealKeeps(spaceOf(sighting, tall), sized(tall), 0)).toBe(false);
    expect(sighting.dealKeeps(spaceOf(sighting, mirrored), sized(mirrored), 0)).toBe(
      false,
    );
    const [b] = boards;
    expect(sighting.dealKeeps(spaceOf(sighting, b), sized(b), 0)).toBe(true);
  });

  it("fills the shortest sightline so that its two numbers single out its monsters", () => {
    // A 4x4 with no mirror: every sightline a row or column of four, which
    // most fillings share their numbers with another of.
    const open = game.newState(p4, `16,0,p${",0".repeat(16)}`);
    const sp = spaceOf(sighting, open);
    const kinds = sighting.deal.sample.sightlines;
    const first = 0;
    const { all: cells, exit } = sights(sp, open.dealt.mirror)[first];
    const key = (g: ArrayLike<number>) =>
      `${sighting.sightClue(g, sp, open.dealt, first)},${sighting.sightClue(g, sp, open.dealt, exit)}`;
    for (const seed of ["l1", "l2", "l3", "l4", "l5", "l6"]) {
      const start = new Uint8Array(16);
      const laid = sightlinesLaid(
        sighting,
        kinds,
        start,
        sp,
        open.dealt,
        p4,
        randomNew(seed),
      );
      expect(cells.every((c) => laid[c] !== 0)).toBe(true);
      const want = key(laid);
      let alike = 0;
      for (let f = 0; f < 1 << cells.length; f++) {
        const g = laid.slice();
        for (const [k, c] of cells.entries()) g[c] = ((f >> k) & 1) + 1;
        if (key(g) === want) alike++;
      }
      expect(alike).toBe(1);
    }
  });

  it("grades a board needing a rung more often than its tier allows as the tier above", () => {
    // Every number 0 on a 3x3 of ghosts: one pass of the sightlines passing
    // no zombie strikes every zombie, which a bound of none at Easy refuses.
    const ghosts = game.newState(p, `9,0,i${",0".repeat(12)}`);
    const most = (n: number) => ({
      ...sighting,
      ladder: sighting.ladder.map((e) => (e.id === "none" ? { ...e, most: n } : e)),
    });
    expect(solveBoard(most(1), ghosts, 0).verdict).toBe("solved");
    expect(solveBoard(most(0), ghosts, 0).verdict).toBe("unsolved");
    expect(solveBoard(most(0), ghosts, 1).verdict).toBe("solved");
  });
});

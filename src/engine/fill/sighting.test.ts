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
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { type FillBoard, spaceOf } from "./board.ts";
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
      expect(desc).toMatch(/^\d+,\d+,[a-zGZ]+(,\d+){12}$/);
    }
  });

  it("refuses a grid too long or too short, and a mirror's number past its two", () => {
    expect(validateDesc(game, p, "4,3,LcRe,0,1,2,3,4,5,6,7,8,9,10,11")).not.toBeNull();
    expect(validateDesc(game, p, "4,3,LcRc,0,1,2,3,4,5,6,7,8,9,10,11")).not.toBeNull();
    expect(validateDesc(game, p, "4,3,LcRd,0,1,2,3,4,5,6,7,8,9,10")).not.toBeNull();
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
    expect(keys.map((k) => k.label)).toEqual(["G", "Z", expect.anything()]);
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

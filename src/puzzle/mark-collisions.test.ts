/**
 * Two unrelated things a game draws are not one color and one shape
 * (`engine-colors` § "Two unrelated marks are not one color and one shape").
 *
 * Path's walls were ink bars beside its ink lines, and read as lines reaching
 * no number (owner, 2026-10-23). The marks are read off each game's own frames
 * (`mark-collisions.ts`), so a game joins by being registered.
 *
 * {@link DECLARED} is a ledger, one entry per pair with its reason: two slots
 * that are one meaning, or that the player tells apart by something the stroke
 * alone does not show. It is held exact, so an entry whose pair no longer
 * collides fails and cannot outlive its reason.
 */
import { describe, expect, it } from "vitest";
import "../games/index.ts";
import type { DrawOp } from "../engine/testing/recording-drawing.ts";
import * as dominosa from "../games/dominosa/render.ts";
import * as galaxies from "../games/galaxies/render.ts";
import * as mosaic from "../games/mosaic/render.ts";
import * as path from "../games/path/render.ts";
import * as sticks from "../games/sticks/render.ts";
import * as untangle from "../games/untangle/render.ts";
import { puzzleIds } from "./catalog.ts";
import { alike, frameMarks, markCollisions } from "./mark-collisions.ts";

interface Declared {
  pair: [number, number];
  why: string;
}

const NUMBER_ON_A_PIECE =
  "one number, in ink on an open cell and in white on a dark piece; the dark scheme lightens both";

const DECLARED: Record<string, Declared[]> = {
  dominosa: [
    { pair: [dominosa.COL_TEXT, dominosa.COL_DOMINOTEXT], why: NUMBER_ON_A_PIECE },
  ],
  galaxies: [
    {
      pair: [galaxies.COL_EDGE, galaxies.COL_ARROW],
      why: "an arrow's shaft beside the grid in a black dot's region: the arrow has a head and sits inside a cell",
    },
  ],
  mosaic: [
    { pair: [mosaic.COL_TEXT, mosaic.COL_TEXT_ON_PIECE], why: NUMBER_ON_A_PIECE },
  ],
  path: [
    // The seventh pair's color is pale enough that its number takes ink.
    {
      pair: [path.COL_TEXT, path.COL_PAIR_TEXT + 6],
      why: "one number, in ink on an open disc and in ink on the seventh pair's pale filled one",
    },
  ],
  sticks: [{ pair: [sticks.COL_NUMBER, sticks.COL_TEXT], why: NUMBER_ON_A_PIECE }],
  untangle: [
    {
      pair: [untangle.COL_LINE, untangle.COL_OUTLINE],
      why: "an edge beside the play area's frame: an edge ends at a vertex at each end",
    },
  ],
};

const key = ([a, b]: readonly [number, number]): string =>
  `${Math.min(a, b)}:${Math.max(a, b)}`;

describe("a mark's shape is read off the ops", () => {
  const line = (x2: number, y2: number, thickness: number, color = 1): DrawOp => ({
    op: "line",
    x1: 0,
    y1: 0,
    x2,
    y2,
    thickness,
    color,
    rgb: "",
  });
  const rect = (x: number, y: number, w: number, h: number, color = 1): DrawOp => ({
    op: "rect",
    x,
    y,
    w,
    h,
    color,
    rgb: "",
  });
  const circle = (r: number, fill: number, outline: number): DrawOp => ({
    op: "circle",
    cx: 10,
    cy: 10,
    r,
    fill,
    fillRgb: "",
    outline,
    outlineRgb: "",
  });
  const kinds = (ops: DrawOp[]): string[] =>
    frameMarks(ops, 32).map((m) => `${m.kind} ${m.slot} ${m.size}`);

  it("a line and a long rect are bars, a slanted line a slash", () => {
    expect(kinds([line(32, 0, 4)])).toEqual(["bar 1 4"]);
    expect(kinds([rect(0, 0, 32, 3)])).toEqual(["bar 1 3"]);
    expect(kinds([line(10, 10, 2)])).toEqual(["slash 1 2"]);
  });

  it("a rect is a fill across most of a tile, a block below that", () => {
    expect(kinds([rect(0, 0, 30, 30)])).toEqual(["fill 1 30"]);
    expect(kinds([rect(0, 0, 8, 8)])).toEqual(["block 1 8"]);
  });

  it("a circle is a disc, and a ring when hollowed or unfilled", () => {
    expect(kinds([circle(6, 2, 2)])).toEqual(["disc 2 6"]);
    expect(kinds([circle(6, -1, 3)])).toEqual(["ring 3 6"]);
    expect(kinds([circle(6, 2, 2), circle(4, 0, 0)]).sort()).toEqual([
      "disc 0 4",
      "ring 2 6",
    ]);
  });

  it("text is text", () => {
    const text: DrawOp = {
      op: "text",
      x: 0,
      y: 0,
      text: "5",
      align: "center",
      baseline: "mathematical",
      fontType: "variable",
      size: 16,
      color: 4,
      rgb: "",
    };
    expect(kinds([text])).toEqual(["text 4 16"]);
  });

  it("a rim is no mark of its own", () => {
    // An outline in another slot from the fill.
    expect(kinds([circle(6, 2, 3)])).toEqual(["disc 2 6"]);
    // A line edged by a wider one beneath it.
    expect(kinds([line(32, 0, 7, 8), line(32, 0, 5, 4)])).toEqual(["bar 4 5"]);
    // A rect edged by a slightly larger one beneath it.
    expect(kinds([rect(0, 0, 7, 29, 1), rect(1, 1, 5, 27, 6)])).toEqual(["bar 6 5"]);
  });

  it("ink text beside an ink grid line is not one mark", () => {
    const grid = frameMarks([line(32, 0, 1)], 32);
    const digit = frameMarks(
      [
        {
          op: "text",
          x: 16,
          y: 16,
          text: "1",
          align: "center",
          baseline: "mathematical",
          fontType: "variable",
          size: 1,
          color: 1,
          rgb: "",
        },
      ],
      32,
    );
    expect(alike(grid, digit)).toBeNull();
  });
});

describe("no two unrelated marks are one color and one shape", () => {
  for (const id of puzzleIds) {
    it(`${id}: every collision is declared, and every declaration collides`, () => {
      const census = markCollisions(id);
      // Frames that painted next to nothing would pass everything below.
      expect(census.marks.size).toBeGreaterThanOrEqual(3);
      const found = census.collisions.map((c) => key([c.a, c.b])).sort();
      const declared = (DECLARED[id] ?? []).map((d) => key(d.pair)).sort();
      const shown = census.collisions.map(
        ({ a, b, marks: [p, q], scheme }) =>
          `slots ${a} and ${b}: ${p.kind} ${p.size}x${p.length} and ${q.size}x${q.length}, one color in ${scheme}`,
      );
      expect(
        found,
        `${id}: slots drawn as one mark in one color, against those declared\n${shown.join("\n")}`,
      ).toEqual(declared);
    });
  }

  it("names only games that exist, and gives every entry a reason", () => {
    for (const [id, entries] of Object.entries(DECLARED)) {
      expect(puzzleIds).toContain(id);
      for (const d of entries) expect(d.why.length).toBeGreaterThan(20);
    }
  });

  // The pair this guard exists for is still the same mark, so it is the wall's
  // color alone that keeps it apart, and the guard would see it collapse.
  it("path: a wall and a line reaching no number are one mark", () => {
    const { marks } = markCollisions("path");
    expect(
      alike(marks.get(path.COL_LINE) ?? [], marks.get(path.COL_WALL) ?? []),
    ).not.toBeNull();
  });
});

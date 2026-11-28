/**
 * Two unrelated things a game draws are not one color and one shape
 * (`engine-colors` § "Two unrelated marks are not one color and one shape").
 *
 * Path's walls were ink bars beside its ink lines, and read as lines reaching
 * no number (owner, 2026-10-23). The marks are read off each game's own frames
 * (`mark-collisions.ts`), so a game joins by being registered.
 *
 * {@link DECLARED} is a ledger, one entry per meaning with its reason: slots
 * that are one meaning, or that the player tells apart by something the stroke
 * alone does not show. Every collision on the boards read must be declared,
 * and an entry none of whose pairs collides on any of them fails, so it cannot
 * outlive its reason.
 */
import { describe, expect, it } from "vitest";
import "../games/index.ts";
import { COL_INK, fillPalette, fillSlots } from "../engine/fill/render/palette.ts";
import type { DrawOp } from "../engine/testing/recording-drawing.ts";
import { FIRST_SHARE, ofThisShare } from "../engine/testing/sweep-share.ts";
import * as ballsort from "../games/ballsort/render.ts";
import * as dominosa from "../games/dominosa/render.ts";
import * as galaxies from "../games/galaxies/render.ts";
import * as path from "../games/path/render.ts";
import * as untangle from "../games/untangle/render.ts";
import * as wordtrail from "../games/wordtrail/render.ts";
import * as boats from "../generated/games/boats/boats.compiled.ts";
import * as mosaic from "../generated/games/mosaic/mosaic.compiled.ts";
import * as rome from "../generated/games/rome/rome.compiled.ts";
import * as sticks from "../generated/games/sticks/sticks.compiled.ts";
import { puzzleIds } from "./catalog.ts";
import {
  alike,
  frameMarks,
  type MarkCensus,
  markCollisions,
} from "./mark-collisions.ts";

/**
 * A declaration names slots by what they mean: any slot of `among` drawn as
 * one mark in one color with any other of `among`, or with any of `against`
 * when it is given. A family of slots, a color's text for each of a game's
 * colors, is declared once, so which of its members collide may move with
 * the boards dealt and the ledger does not.
 */
interface Declared {
  among: readonly number[];
  against?: readonly number[];
  why: string;
}

/** Every pair a declaration covers. */
const pairsOf = ({ among, against }: Declared): string[] =>
  (against ?? among).flatMap((b) =>
    among.filter((a) => a !== b).map((a) => key([a, b])),
  );

const NUMBER_ON_A_PIECE =
  "one number, in ink on an open cell and in white on a dark piece; the dark scheme lightens both";

/** The `n` slots from `first` on, one for each of a game's colors. */
const family = (first: number, n: number): number[] =>
  Array.from({ length: n }, (_, i) => first + i);

const DECLARED: Record<string, Declared[]> = {
  // Ball Sort's square, diamond, plus and cross, each a four-cornered polygon
  // to the reading, are four colors' symbols.
  ballsort: [
    {
      among: family(ballsort.COL_SYMBOL + 2, 4),
      why: "two colors' symbols, each on a ball of its own color, a square apart from a diamond by its corners and a plus from a cross by its angle",
    },
  ],
  boats: [
    {
      among: [COL_INK],
      against: [fillSlots(boats.play).painted.get("sea")?.slot[1] ?? -1],
      why: "a count beside the grid and the waves of a square the puzzle gave as water: a digit outside the grid, a tilde inside it",
    },
  ],
  dominosa: [
    {
      among: [dominosa.COL_TEXT],
      against: [dominosa.COL_DOMINOTEXT],
      why: NUMBER_ON_A_PIECE,
    },
  ],
  galaxies: [
    {
      among: [galaxies.COL_EDGE],
      against: [galaxies.COL_ARROW],
      why: "an arrow's shaft beside the grid in a black dot's region: the arrow has a head and sits inside a cell",
    },
  ],
  mosaic: [
    {
      among: [COL_INK],
      against: [fillSlots(mosaic.play).COL_NUMBER_LIGHT],
      why: NUMBER_ON_A_PIECE,
    },
  ],
  // A pair's color pale enough that its number takes ink.
  path: [
    {
      among: [path.COL_TEXT, ...family(path.COL_PAIR_TEXT, path.PAIRS)],
      why: "one number, in ink on an open disc or on a pale filled one, whose color says which pair it is",
    },
  ],
  // A picture board with no numerals, its areas walled.
  rome: [
    {
      among: [fillSlots(rome.play).painted.get("arrowUp")?.slot[1] ?? -1],
      against: [fillPalette(rome.play, false, true, false).COL_WALL],
      why: "a given arrow's shaft beside an area's wall: the arrow has a head and sits inside a square, the wall on its edge",
    },
  ],
  sticks: [
    {
      among: [COL_INK],
      against: [fillSlots(sticks.play).COL_NUMBER_LIGHT],
      why: NUMBER_ON_A_PIECE,
    },
  ],
  untangle: [
    {
      among: [untangle.COL_LINE],
      against: [untangle.COL_OUTLINE],
      why: "an edge beside the play area's frame: an edge ends at a vertex at each end",
    },
  ],
  // A word's color pale enough in the light scheme that its letters take ink,
  // as an open letter's does.
  wordtrail: [
    {
      among: [wordtrail.COL_TEXT, ...family(wordtrail.COL_HUE_TEXT, wordtrail.HUES)],
      why: "one letter, in ink on an open disc or on a word's colored disc, which says what word it is in",
    },
  ],
};

function key([a, b]: readonly [number, number]): string {
  return `${Math.min(a, b)}:${Math.max(a, b)}`;
}

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

const censuses = new Map<string, MarkCensus>();
function censusOf(id: string): MarkCensus {
  const census = censuses.get(id) ?? markCollisions(id);
  censuses.set(id, census);
  return census;
}

describe("no two unrelated marks are one color and one shape", () => {
  for (const id of ofThisShare(puzzleIds)) {
    it(`${id}: every collision is declared, and every declaration collides`, () => {
      const census = censusOf(id);
      // Frames that painted next to nothing would pass everything below.
      expect(census.marks.size).toBeGreaterThanOrEqual(3);
      const declarations = DECLARED[id] ?? [];
      const covered = new Set(declarations.flatMap(pairsOf));
      const undeclared = census.collisions
        .filter((c) => !covered.has(key([c.a, c.b])))
        .map(
          ({ a, b, marks: [p, q], scheme }) =>
            `slots ${a} and ${b}: ${p.kind} ${p.size}x${p.length} and ${q.size}x${q.length}, one color in ${scheme}`,
        );
      const found = new Set(census.collisions.map((c) => key([c.a, c.b])));
      const stale = declarations
        .filter((d) => !pairsOf(d).some((p) => found.has(p)))
        .map((d) => d.why);
      const boards = census.boards.map((b) => b.id).join(", ");
      expect(
        undeclared,
        `${id}: slots drawn as one mark in one color, on ${boards}, and not in ` +
          `DECLARED.${id} (src/puzzle/mark-collisions.test.ts). Tell the marks ` +
          "apart, or declare the pair, or the family of slots it is one of, " +
          "with why it may look the same.",
      ).toEqual([]);
      expect(
        stale,
        `${id}: declarations in DECLARED.${id} (src/puzzle/mark-collisions.test.ts) ` +
          `that no board of ${boards} collides on; remove each one.`,
      ).toEqual([]);
    });

    // The pair this guard exists for is still the same mark, so it is the
    // wall's color alone that keeps it apart, and the guard would see it
    // collapse.
    if (id === "path")
      it("path: a wall and a line reaching no number are one mark", () => {
        const { marks } = censusOf("path");
        expect(
          alike(marks.get(path.COL_LINE) ?? [], marks.get(path.COL_WALL) ?? []),
        ).not.toBeNull();
      });
  }

  if (FIRST_SHARE)
    it("names only games that exist, and gives every entry a reason", () => {
      for (const [id, entries] of Object.entries(DECLARED)) {
        expect(puzzleIds).toContain(id);
        for (const d of entries) expect(d.why.length).toBeGreaterThan(20);
      }
    });
});

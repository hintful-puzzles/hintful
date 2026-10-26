/**
 * Galaxies' hint, as pixels — tier 2.5 (docs/testing.md § "Render
 * scenarios"). Each frame is a pinned position played into a real `Midend`, so
 * these are the frames a player sees, not a hand-built drawstate.
 *
 * What is worth asserting here rather than on the highlight object: the hint's
 * *action* rings have to actually reach the canvas, a wall the board does not
 * have yet has to be drawn anyway (nothing else in this renderer paints an
 * unset edge), and the two mark roles have to stay one apiece.
 */
import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { describeHintKindPins } from "../../engine/testing/hint-positions.ts";
import {
  expectRing,
  isThin,
  markSides,
  ringsOf,
} from "../../engine/testing/mark-shape.ts";
import { type DrawOp, opsOfKind } from "../../engine/testing/recording-drawing.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import type { GalaxiesHint } from "./hint.ts";
import { type GalaxiesMove, galaxiesGame } from "./index.ts";
import { COL_HINT_CELL, PREFERRED_TILE_SIZE as TS } from "./render.ts";
import { GalaxiesDiff } from "./solver.ts";

const lit = (step: HintStep<GalaxiesMove, GalaxiesHint>): GalaxiesHint => {
  if (!step.highlights) throw new Error("a Galaxies step always has highlights");
  return step.highlights;
};

/** The shapes of step whose frames are asserted below, each pinned on a
 * position whose hint opens with one. */
const pinned = describeHintKindPins({
  game: galaxiesGame,
  params: [{ w: 7, h: 7, diff: GalaxiesDiff.Normal }],
  kinds: {
    // A `focus` is what marks a deduction about *one* cell, whose dot is
    // therefore somewhere else and gets a ring.
    oneCellAndItsPartner: (s) => lit(s).focus !== null && lit(s).targets.length > 1,
    // No focus, because every cell a dot claims is equally the point.
    aDotsOwnCells: (s) => lit(s).focus === null && lit(s).targets.length > 0,
    wall: (s) => lit(s).targetWalls.length > 0,
    evidence: (s) => lit(s).area.length > 1 && lit(s).targets.length > 0,
    everyMark: (s) =>
      lit(s).focus !== null &&
      lit(s).targets.length > 1 &&
      lit(s).area.length > 0 &&
      lit(s).hatch.length > 0,
  },
  pins: {
    /** Held on 143 of 770 positions walked. */
    oneCellAndItsPartner: {
      id: "7x7dn:dzbsozpcewrb",
      moves:
        '[{"ops":[{"kind":"assoc","x":4,"y":1,"ax":4,"ay":1}],"solving":false},{"ops":[{"kind":"assoc","x":11,"y":4,"ax":11,"ay":4}],"solving":false},{"ops":[{"kind":"assoc","x":2,"y":9,"ax":2,"ay":9}],"solving":false},{"ops":[{"kind":"assoc","x":10,"y":9,"ax":10,"ay":9}],"solving":false},{"ops":[{"kind":"assoc","x":12,"y":12,"ax":12,"ay":12}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":2}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":5}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":9}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":10}],"solving":false}]',
    },
    /** Held on 93 of 770 positions walked. */
    aDotsOwnCells: "7x7dn:cgqkdqdzcjdptkdb",
    /** Held on 534 of 770 positions walked. */
    wall: {
      id: "7x7dn:ajhrekfsrijvkk",
      moves:
        '[{"ops":[{"kind":"assoc","x":6,"y":2,"ax":6,"ay":2}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":4,"ax":3,"ay":4}],"solving":false},{"ops":[{"kind":"assoc","x":13,"y":6,"ax":13,"ay":6}],"solving":false},{"ops":[{"kind":"assoc","x":5,"y":8,"ax":5,"ay":8}],"solving":false},{"ops":[{"kind":"assoc","x":5,"y":12,"ax":5,"ay":12}],"solving":false}]',
    },
    /** Held on 2 of 770 positions walked. */
    evidence: {
      id: "7x7dn:ajhrekfsrijvkk",
      moves:
        '[{"ops":[{"kind":"assoc","x":6,"y":2,"ax":6,"ay":2}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":4,"ax":3,"ay":4}],"solving":false},{"ops":[{"kind":"assoc","x":13,"y":6,"ax":13,"ay":6}],"solving":false},{"ops":[{"kind":"assoc","x":5,"y":8,"ax":5,"ay":8}],"solving":false},{"ops":[{"kind":"assoc","x":5,"y":12,"ax":5,"ay":12}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":2}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":3}],"solving":false},{"ops":[{"kind":"edge","x":7,"y":4}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":5}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":10}],"solving":false},{"ops":[{"kind":"edge","x":6,"y":11}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":13}],"solving":false},{"ops":[{"kind":"assoc","x":9,"y":1,"ax":11,"ay":1}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":1}],"solving":false},{"ops":[{"kind":"assoc","x":11,"y":5,"ax":11,"ay":9}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":4}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":5}],"solving":false},{"ops":[{"kind":"assoc","x":7,"y":7,"ax":5,"ay":8}],"solving":false},{"ops":[{"kind":"edge","x":7,"y":6}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":9}],"solving":false},{"ops":[{"kind":"assoc","x":9,"y":7,"ax":11,"ay":9}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":7}],"solving":false}]',
    },
    /** Held on 2 of 770 positions walked. */
    everyMark: {
      id: "7x7dn:ajhrekfsrijvkk",
      moves:
        '[{"ops":[{"kind":"assoc","x":6,"y":2,"ax":6,"ay":2}],"solving":false},{"ops":[{"kind":"assoc","x":3,"y":4,"ax":3,"ay":4}],"solving":false},{"ops":[{"kind":"assoc","x":13,"y":6,"ax":13,"ay":6}],"solving":false},{"ops":[{"kind":"assoc","x":5,"y":8,"ax":5,"ay":8}],"solving":false},{"ops":[{"kind":"assoc","x":5,"y":12,"ax":5,"ay":12}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":2}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":3}],"solving":false},{"ops":[{"kind":"edge","x":7,"y":4}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":5}],"solving":false},{"ops":[{"kind":"edge","x":5,"y":10}],"solving":false},{"ops":[{"kind":"edge","x":6,"y":11}],"solving":false},{"ops":[{"kind":"edge","x":4,"y":13}],"solving":false},{"ops":[{"kind":"assoc","x":9,"y":1,"ax":11,"ay":1}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":1}],"solving":false},{"ops":[{"kind":"assoc","x":11,"y":5,"ax":11,"ay":9}],"solving":false},{"ops":[{"kind":"edge","x":11,"y":4}],"solving":false},{"ops":[{"kind":"edge","x":12,"y":5}],"solving":false},{"ops":[{"kind":"assoc","x":7,"y":7,"ax":5,"ay":8}],"solving":false},{"ops":[{"kind":"edge","x":7,"y":6}],"solving":false},{"ops":[{"kind":"edge","x":2,"y":9}],"solving":false},{"ops":[{"kind":"assoc","x":9,"y":7,"ax":11,"ay":9}],"solving":false},{"ops":[{"kind":"edge","x":8,"y":7}],"solving":false}]',
    },
  },
});

/** The frame a pinned position's hint draws, through a real `Midend`. */
function hintFrame(kind: Parameters<typeof pinned>[0]) {
  const result = renderPinnedHint(galaxiesGame, pinned(kind));
  return { ...result, hl: lit(result.step) };
}

const rects = (ops: DrawOp[], color: number) =>
  ops.filter((o) => o.op === "rect" && o.color === color);
const circles = (ops: DrawOp[], outline: number) =>
  ops.filter((o) => o.op === "circle" && o.outline === outline);

/** The frame's rings by their center: each with the distinct sizes drawn
 * there, since a ring on a tile's corner is drawn by every tile that clips
 * it. */
function ringCenters(ops: DrawOp[]): Map<string, Set<number>> {
  const out = new Map<string, Set<number>>();
  for (const r of ringsOf(ops)) {
    const at = `${r.x + r.w / 2},${r.y + r.h / 2}`;
    out.set(at, (out.get(at) ?? new Set()).add(r.w));
  }
  return out;
}

/** Whether `at` (a `ringCenters` key) is the middle of a cell. */
const isCellCenter = (at: string): boolean =>
  at.split(",").every((c) => (Number(c) - TS) % TS === TS / 2);

describe("a displayed hint reaches the canvas", () => {
  it("an association double-rings the deduced cell, rings its partner and the dot", () => {
    // A `focus` is what marks a deduction about *one* cell, whose dot is
    // therefore somewhere else and gets a ring; a dot's-own-cells step has no
    // focus and no ring (the next test).
    const { recording, hl } = hintFrame("oneCellAndItsPartner");
    expect(hl.targetDot).toBeDefined();
    expect(hl.focus).toBeDefined();
    expect(hl.refDots).toHaveLength(0);

    // Rings and nothing else in their ink: no solid fill, since a Galaxies
    // cell's fill *is* its association, so a hint that painted over it would
    // take away the premise.
    expectRing(recording.ops, { rings: ringsOf(recording.ops).length });
    // The focus cell is **doubled** and the partner single: the words say "this
    // cell", so only one cell may look like the thing being said (owner-reported
    // when both were marked alike). Two concentric rings for the focus, one for
    // each partner.
    const centers = ringCenters(recording.ops);
    // A dot may stand on a cell's middle, so its ring is told by where the dot
    // is, not by where it falls.
    const dot = hl.targetDot;
    if (!dot) throw new Error("an association step rings its dot");
    const dotAt = `${TS + (dot.x * TS) / 2},${TS + (dot.y * TS) / 2}`;
    expect(centers.has(dotAt), "the dot is ringed").toBe(true);
    const cells = [...centers].filter(([at]) => at !== dotAt && isCellCenter(at));
    expect(cells).toHaveLength(hl.targets.length);
    expect(cells.filter(([, sizes]) => sizes.size === 2)).toHaveLength(1);
    expect(cells.filter(([, sizes]) => sizes.size === 1)).toHaveLength(
      hl.targets.length - 1,
    );
    // The dot is ringed, and is the only one marked: "the ringed dot" cannot
    // be ambiguous.
    expect(centers.size).toBe(hl.targets.length + 1);
    expect(circles(recording.ops, COL_HINT_CELL)).toHaveLength(0);
  });

  it("never rings a dot standing on a cell it has filled", () => {
    // The ring-on-ring case: the ring's own color on its own color. A
    // dot's-own-cells step is the one that hits it — no focus, because every
    // cell it claims is equally the point, and the dot is standing on them.
    const { recording, hl } = hintFrame("aDotsOwnCells");
    expect(hl.targetDot).toBeDefined();
    const centers = [...ringCenters(recording.ops).keys()];
    expect(centers).toHaveLength(hl.targets.length);
    for (const at of centers) expect(isCellCenter(at), at).toBe(true);
  });

  it("a forced wall is drawn even though the board has no wall there", () => {
    const { recording, hl, midend } = hintFrame("wall");
    expect(hl.targetWalls).toHaveLength(1);
    const wall = hl.targetWalls[0];
    // The premise of the whole assertion: the board really does not have this
    // wall yet, so nothing but the hint could have painted a bar there. Read
    // off the text rendering, which draws a set wall as `|` or `-` — the one
    // view of the midend's board a test can take from outside.
    const text = (midend.formatAsText() ?? "").split("\n");
    expect(text[wall.y]?.[wall.x], "the board already had the hinted wall").toBe(" ");

    // Both tiles the wall separates draw their part of one pill round it, a
    // tile long and half a tile across.
    const pills = ringsOf(recording.ops).filter(
      (r) => Math.max(r.w, r.h) > 1.5 * Math.min(r.w, r.h),
    );
    expect(pills).toHaveLength(2);
    expect(pills[1]).toEqual(pills[0]);
    // Inside it, the wall, a bar and never a tile-sized fill: a hint that
    // filled the cell would be saying "this cell", which is a different move.
    const bars = rects(recording.ops, pills[0].color);
    expect(bars.length).toBeGreaterThanOrEqual(2);
    for (const bar of bars) {
      if (bar.op !== "rect") continue;
      expect(Math.min(bar.w, bar.h)).toBeLessThan(Math.max(bar.w, bar.h) / 2);
    }
  });

  it("evidence rings the cells the sentence says it reasons over", () => {
    const { recording, hl } = hintFrame("evidence");
    // One ring per evidence cell, and no fill: an evidence cell's own black or
    // white background is what the deduction is reading, so a wash over it would
    // erase the reading.
    const sides = markSides(recording.ops, COL_HINT_CELL);
    expect(sides.length).toBe(4 * hl.area.length);
    for (const s of sides) expect(isThin(s)).toBe(true);
  });

  it("the opening hint frame is stable", () => {
    const { recording } = hintFrame("aDotsOwnCells");
    expect(recording.ops).toMatchSnapshot();
  });

  it("a frame carrying every mark at once is stable", () => {
    // The opener above is a dot's-own-cells step, which has no evidence, no
    // partner and no ring — so on its own it pinned none of the marks the two
    // acceptance rounds reworked. This frame carries all of them.
    const { recording } = hintFrame("everyMark");
    // The galaxy the sentence names is striped, over each cell's own fill.
    expect(opsOfKind(recording.ops, "hatch").length).toBeGreaterThan(0);
    expect(recording.ops).toMatchSnapshot();
  });
});

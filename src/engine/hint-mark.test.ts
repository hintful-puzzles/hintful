/**
 * The cross-game guard on how a hint marks the board: **a ring is round, and
 * a mark goes beside the content, never behind it**.
 *
 * One sweep over the `hint-games.ts` enrollment, so a newly ported game with a
 * `hint()` is covered by adding the one line it already has to add. The ring's
 * ink is the engine's (`resolvePalette`), so its index is known for every game;
 * a game's own `COL_HINT_CELL` is read out of its `render.ts` exports.
 *
 * The ring cannot be drawn in another shape (`GameDrawing.drawRing` is the
 * only way to its ink), so the sweep holds the frames to what that promises:
 * nothing in the ring's ink but a ring and the move's shape inside one. And
 * **shape, not color**, for the outline: no rect in its ink is *cell-sized and
 * thick in both directions*, a fill over the digits a hint is talking about.
 *
 * The measurement behind the rule is in `hint-mark.ts`; the per-game calls are
 * in `docs/hints-marks.md` § "Shade vs ring".
 */
import { describe, expect, it } from "vitest";
import { type HintMarkStyle, HintMarks, type MarkCell, NO_TEXT } from "./hint-mark.ts";
import { Midend } from "./index.ts";
import { RING_MIN_ROUNDNESS } from "./ring.ts";
import { beginDealt } from "./testing/dealt.ts";
import { gatePresets, HINT_GAMES } from "./testing/hint-games.ts";
import { outsideRings, ringsOf } from "./testing/mark-shape.ts";
import {
  type DrawOp,
  paintsWith,
  RecordingDrawing,
} from "./testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "./testing/render-scenario.ts";
import { perCommit } from "./testing/slow.ts";
import type { Color, Rect } from "./types.ts";

const RENDERERS = import.meta.glob<Record<string, unknown>>("../games/*/render.ts", {
  eager: true,
});

interface Op {
  op: string;
  color?: number;
  w?: number;
  h?: number;
}

/** A rect that is thick in both directions and at least half a cell across —
 * i.e. a fill, not a mark. */
function solidFills(ops: readonly Op[], color: number, cell: number): Op[] {
  return ops.filter((o) => {
    if (o.op !== "rect" || o.color !== color) return false;
    const w = o.w ?? 0;
    const h = o.h ?? 0;
    return Math.min(w, h) * 4 >= Math.max(w, h) && Math.min(w, h) >= cell / 2;
  });
}

/** Every `render.ts` in the games tree, by puzzle id. */
function renderersById(): Map<string, Record<string, unknown>> {
  const byId = new Map<string, Record<string, unknown>>();
  for (const [path, mod] of Object.entries(RENDERERS)) {
    const m = path.match(/\/games\/([^/]+)\//);
    // Throwing rather than skipping: a path shape this does not recognize is a
    // module silently dropped from the sweep, which is how a guard goes quiet.
    if (!m) throw new Error(`unexpected renderer path ${path}`);
    byId.set(m[1], mod);
  }
  return byId;
}

/**
 * Walk a game's hint plan and hand back every frame it paints.
 *
 * **Every board the gate slice offers, two seeds each** — and that ordering is
 * the point. A fill hides in a rung the opener never reaches, which is why this
 * walks six steps deep (a chain frame, Clusters' on a Tricky board, can first
 * appear past the third step); but it also hides in a *renderer branch* the
 * first preset never enters. Seeds of `2x2 Trivial` say nothing about how Solo
 * marks a Killer cage, nor about Loopy's other tilings, each of which is a
 * different geometry drawn by a different branch. Breadth of board is what
 * this guard's subject varies with, not seeds.
 *
 * Most of its cost is that breadth — Loopy's tilings and Solo's modes and
 * tiers. It does not touch the gate's wall clock, which is set by the longest
 * file rather than by this one.
 */
function hintFrames(
  id: string,
  game: (typeof HINT_GAMES)[number][1],
): { ops: DrawOp[]; cell: number }[] {
  const palette = game.colors(DEFAULT_BACKGROUND);
  const frames: { ops: DrawOp[]; cell: number }[] = [];
  for (const { params } of gatePresets(id, game)) {
    for (let s = 0; s < perCommit(1, 2); s++) {
      const midend = new Midend(game);
      if (beginDealt(midend, game, params, s)) continue;
      const size = midend.size({ w: 700, h: 700 });
      const cell = Math.min(size.w, size.h) / 20;
      if (midend.hint()) continue;
      for (let step = 0; step < 6; step++) {
        const frame = new RecordingDrawing(palette);
        midend.redraw(frame);
        if (!midend.activeHintStep()) break;
        frames.push({ ops: frame.ops, cell });
        midend.executeHint();
      }
    }
  }
  return frames;
}

describe("a hint marks beside the content, never behind it", () => {
  const byId = renderersById();

  it("looks at every game's renderer", () => {
    // The "how many things did I look at?" guard. An `import.meta.glob` that
    // matches nothing yields `{}` and every assertion below then passes
    // vacuously — this repo has been bitten by that exact silence before.
    expect(byId.size).toBeGreaterThanOrEqual(50);
    // **Every hinting game's renderer is findable**, so the list is empty —
    // and an empty list still asserts something, because a game that hides its
    // renderer shows up here.
    expect(HINT_GAMES.filter(([id]) => !byId.has(id)).map(([id]) => id)).toEqual([]);
  });

  for (const [id, game] of HINT_GAMES) {
    const evidence = byId.get(id)?.["COL_HINT_CELL"];

    it(`${id}: a ring is round, and nothing is filled`, () => {
      const frames = hintFrames(id, game);
      expect(frames.length, `${id} produced no hint frame to check`).toBeGreaterThan(0);
      // The ring's ink follows the game's palette (`resolvePalette`).
      const ringInk = game.colors(DEFAULT_BACKGROUND).length;
      for (const { ops, cell } of frames) {
        const stray = outsideRings(ops).filter((o) => paintsWith(o, ringInk));
        expect(
          stray,
          `${id} draws in the ring's ink outside a ring: ${JSON.stringify(stray[0])}`,
        ).toHaveLength(0);
        for (const r of ringsOf(ops))
          expect(
            r.radius,
            `${id}: a ${r.w}×${r.h} ring is round`,
          ).toBeGreaterThanOrEqual(
            Math.floor((RING_MIN_ROUNDNESS * Math.min(r.w, r.h)) / 2),
          );
        if (typeof evidence === "number") {
          const washes = solidFills(ops, evidence, cell);
          expect(
            washes,
            `${id} washes a cell with its evidence color: ${JSON.stringify(washes[0])}`,
          ).toHaveLength(0);
        }
      }
    });
  }
});

describe("HintMarks undoes a mark the way a fresh canvas never had it", () => {
  // One cell on a gutter-colored backing, with a band that reaches inside the
  // cell (Clusters, Group and Undead draw theirs that way).
  const GUTTER = 1;
  const FILL = 0;
  const EVIDENCE = 3;
  const backing = (dr: RecordingDrawing) => {
    dr.drawRect({ x: 0, y: 0, w: 30, h: 30 }, GUTTER);
  };
  const palette: Color[] = [
    [0.8, 0.8, 0.8],
    [0, 0, 0],
    [0, 0, 1],
    [0, 1, 1],
  ];
  /** The engine's ring ink, after the palette's four. */
  const RING = 4;
  const marked: MarkCell[] = [{ x: 0, y: 0 }];
  // Every op here is a rect or a ring, and a ring is painted as the band of its
  // box its stroke may reach, so a canvas of palette indices is exact enough:
  // it can only over-cover.
  const paintOn = (px: Int8Array, rec: RecordingDrawing): Int8Array => {
    const rect = (x: number, y: number, w: number, h: number, c: number) => {
      for (let j = y; j < y + h; j++) px.fill(c, j * 30 + x, j * 30 + x + w);
    };
    for (const o of rec.ops) {
      if (o.op === "rect") rect(o.x, o.y, o.w, o.h, o.color);
      else if (o.op === "ring") {
        const t = Math.ceil(o.thickness / 2);
        const [x, y] = [o.x - t, o.y - t];
        const [w, h] = [o.w + 2 * t, o.h + 2 * t];
        rect(x, y, w, 2 * t, o.color);
        rect(x, y + h - 2 * t, w, 2 * t, o.color);
        rect(x, y, 2 * t, h, o.color);
        rect(x + w - 2 * t, y, 2 * t, h, o.color);
      } else throw new Error(`unexpected ${o.op}`);
    }
    return px;
  };
  const differing = (a: Int8Array, b: Int8Array) =>
    [...a.keys()]
      .filter((i) => a[i] !== b[i])
      .map((i) => `${i % 30},${Math.floor(i / 30)}`);

  /**
   * Mark cell (0,0), then drop the mark on the same HintMarks and canvas the
   * way a game does — erase, repaint the tiles it names, restamp — and return
   * that canvas beside a fresh paint of the second frame, plus what the erase
   * named.
   */
  function dropMark(
    band: { box: Rect; outer: number; inner: number },
    tiles: Record<string, (dr: RecordingDrawing) => void>,
    probe: number,
    role: "ring" | "outline",
  ) {
    const style: HintMarkStyle = {
      band: () => band,
      text: () => NO_TEXT,
      evidenceColor: EVIDENCE,
    };
    const [targets, evidence] = role === "ring" ? [marked, []] : [[], marked];
    const board = (dr: RecordingDrawing) => {
      backing(dr);
      for (const t of Object.values(tiles)) t(dr);
    };
    const marks = new HintMarks();
    const first = new RecordingDrawing(palette);
    board(first);
    marks.paint(first, targets, evidence, style);
    const warm = paintOn(new Int8Array(900), first);
    // Known positive: the mark really covered the pixel under test.
    expect(warm[probe]).toBe(role === "ring" ? RING : EVIDENCE);

    const second = new RecordingDrawing(palette);
    const named = new Set<string>();
    marks.eraseBeforeTiles(second, [], [], style, GUTTER, (x, y) =>
      named.add(`${x},${y}`),
    );
    for (const k of named) tiles[k]?.(second);
    marks.paint(second, [], [], style);
    paintOn(warm, second);

    const cold = new RecordingDrawing(palette);
    board(cold);
    new HintMarks().paint(cold, [], [], style);
    return { warm, fresh: paintOn(new Int8Array(900), cold), named };
  }

  it("repaints the cell over a band that reaches inside it", () => {
    // Clusters, Group and Undead: one pixel of gutter, three of the cell's edge.
    const box = { x: 5, y: 5, w: 20, h: 20 };
    const { warm, fresh } = dropMark(
      { box, outer: 1, inner: 3 },
      { "0,0": (dr) => dr.drawRect(box, FILL) },
      (box.y + 1) * 30 + box.x + 10,
      "outline",
    );
    expect(differing(warm, fresh), "pixels a warm canvas shows differently").toEqual(
      [],
    );
  });

  it("repaints the cell under its ring", () => {
    const box = { x: 5, y: 5, w: 20, h: 20 };
    const { warm, fresh } = dropMark(
      { box, outer: 1, inner: 3 },
      { "0,0": (dr) => dr.drawRect(box, FILL) },
      (box.y + 1) * 30 + box.x + 10,
      "ring",
    );
    expect(differing(warm, fresh), "pixels a warm canvas shows differently").toEqual(
      [],
    );
  });

  it("repaints a neighbor whose tile paints under the band", () => {
    // Keen's cage and Solo's sub-block: the band lies wholly outside cell A's
    // box, but cell B widens its background two pixels into it.
    const a = { x: 4, y: 10, w: 8, h: 8 };
    const { warm, fresh, named } = dropMark(
      { box: a, outer: 2, inner: 0 },
      {
        "0,0": (dr) => dr.drawRect(a, FILL),
        "1,0": (dr) => dr.drawRect({ x: 12, y: 10, w: 10, h: 8 }, FILL),
      },
      12 * 30 + 12,
      "outline",
    );
    expect(named.has("1,0"), "the neighbor under the band is named").toBe(true);
    expect(differing(warm, fresh)).toEqual([]);
  });

  it("does nothing before the tiles while the marks stand", () => {
    const style: HintMarkStyle = {
      band: () => ({ box: { x: 5, y: 5, w: 20, h: 20 }, outer: 1, inner: 3 }),
      text: () => NO_TEXT,
      evidenceColor: EVIDENCE,
    };
    const marks = new HintMarks();
    marks.paint(new RecordingDrawing(palette), marked, [], style);
    const again = new RecordingDrawing(palette);
    let named = 0;
    marks.eraseBeforeTiles(again, marked, [], style, GUTTER, () => named++);
    expect(again.ops).toEqual([]);
    expect(named).toBe(0);
  });
});

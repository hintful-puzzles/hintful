/**
 * **The pencil-mode indicator is in the same place in every game that has one.**
 *
 * The collection had drifted into three answers — a border corner in five games,
 * a top-left gutter in three, a strip below the board in three, and a tile-cache
 * bit in one — so the single cue that says *your typing goes into notes now*
 * moved when the player changed puzzle. {@link pencilIndicatorBox} now decides,
 * and this asserts that every game obeys it rather than merely importing it.
 *
 * **What is asserted is where the pixels land, not which helper was called.** A
 * game that computed the same corner by hand would pass, which is correct — the
 * requirement is about the player's eye — and a game that kept its own corner
 * fails however tidily it is written. The population is derived from the `Ui`
 * each `newUi` returns, so a game joins by having the mode
 * (`AGENTS.md` § "Convention over configuration"; `testing/enrollment.ts`).
 *
 * The frame is taken twice, with the mode off and on, and only the ops the
 * second frame adds are judged: that keeps the probe blind to what a game draws
 * for its own reasons, and needs no game to name its own palette indices here.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { type PencilIndicatorBox, pencilIndicatorBox } from "./pencil-indicator.ts";
import { type AnyGame, builtGames, enrolledIn } from "./testing/enrollment.ts";
import { paramsCorpus } from "./testing/params-corpus.ts";
import type { DrawOp } from "./testing/recording-drawing.ts";
import { RecordingDrawing } from "./testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "./testing/render-scenario.ts";
import type { Size } from "./types.ts";

beforeAll(registerAllGames);

/** A game takes notes iff its own `Ui` carries the collection's mode flag. */
const noteTaking = enrolledIn((g) => typeof g.ui["pencilMode"] === "boolean");

/** Every corner a draw op touches. `clip`/`unclip` bound nothing themselves. */
function cornersOf(op: DrawOp): { x: number; y: number }[] {
  switch (op.op) {
    case "rect":
    case "hatch":
      return [
        { x: op.x, y: op.y },
        { x: op.x + op.w, y: op.y + op.h },
      ];
    case "line": {
      const t = Math.ceil(op.thickness / 2);
      return [
        { x: Math.min(op.x1, op.x2) - t, y: Math.min(op.y1, op.y2) - t },
        { x: Math.max(op.x1, op.x2) + t, y: Math.max(op.y1, op.y2) + t },
      ];
    }
    case "polygon":
      return op.points.map(([x, y]) => ({ x, y }));
    case "circle":
      return [
        { x: op.cx - op.r, y: op.cy - op.r },
        { x: op.cx + op.r, y: op.cy + op.r },
      ];
    case "text":
      return [{ x: op.x, y: op.y }];
    default:
      return [];
  }
}

/**
 * The frame a game paints with pencil mode `on`, from a draw state that has
 * never painted — so the indicator's own cache cannot skip it.
 *
 * The cursor is hidden first: several games also shade the *cursor cell*
 * differently in pencil mode, which is a second, legitimate cue and not this
 * one. With no cursor showing, the only thing the mode changes is the indicator.
 */
function frameWith(
  game: AnyGame,
  state: unknown,
  on: boolean,
  ts = game.preferredTileSize ?? 32,
): DrawOp[] {
  const ui = game.newUi(state) as {
    pencilMode: boolean;
    cursor?: { visible: boolean };
  };
  ui.pencilMode = on;
  if (ui.cursor) ui.cursor.visible = false;
  const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
  game.redraw(dr, game.newDrawState(state, ts), null, state, 1, ui, 0, 0);
  return dr.ops;
}

/** The ops the `on` frame has that the `off` frame does not, as a multiset. */
function addedByPencilMode(off: DrawOp[], on: DrawOp[]): DrawOp[] {
  const remaining = new Map<string, number>();
  for (const op of off) {
    const k = JSON.stringify(op);
    remaining.set(k, (remaining.get(k) ?? 0) + 1);
  }
  const added: DrawOp[] = [];
  for (const op of on) {
    const k = JSON.stringify(op);
    const left = remaining.get(k) ?? 0;
    if (left > 0) remaining.set(k, left - 1);
    else added.push(op);
  }
  return added;
}

describe("the pencil-mode indicator is where the engine puts it", () => {
  it("found the note-taking games at all", () => {
    // Vacuity, both halves: a filter that matched nothing, or a registry that
    // built nothing, would make every case below pass over an empty set.
    expect(noteTaking.population).toBeGreaterThanOrEqual(50);
    expect(noteTaking.ids.length).toBeGreaterThanOrEqual(12);
  });

  for (const { id, game, state } of builtGames()) {
    if (!noteTaking.ids.includes(id)) continue;

    it(`${id}: draws it in the engine's box and nowhere else`, () => {
      const ts = game.preferredTileSize ?? 32;
      const box = pencilIndicatorBox(game.computeSize(game.defaultParams(), ts), ts);
      const added = addedByPencilMode(
        frameWith(game, state, false),
        frameWith(game, state, true),
      );

      // Turning the mode on has to show, or the player has no cue at all.
      expect(
        added.length,
        `${id} draws nothing when pencil mode goes on`,
      ).toBeGreaterThan(0);

      for (const op of added) {
        for (const c of cornersOf(op)) {
          expect(
            c.x >= box.x &&
              c.x <= box.x + box.size &&
              c.y >= box.y &&
              c.y <= box.y + box.size,
            `${id} paints ${op.op} at (${c.x}, ${c.y}) for pencil mode, outside the engine's box ${JSON.stringify(box)}`,
          ).toBe(true);
        }
      }
    });
  }
});

/**
 * Tile sizes either side of where the glyph's floor starts to bite (a tile of
 * about 48 for the half-tile rule), because below it the glyph is wider than
 * half a tile and a margin sized as half a tile no longer holds it. Not a
 * realistic range: the reservation has to hold at any tile, since a large
 * custom board on a phone reaches tiles this small.
 */
const SWEEP_TILES = [12, 16, 20, 24, 32, 48, 64, 96];

/** Whether an op's bounding box reaches into the box's interior. */
function overlaps(op: DrawOp, box: PencilIndicatorBox): boolean {
  const cs = cornersOf(op);
  if (cs.length === 0) return false;
  const xs = cs.map((c) => c.x);
  const ys = cs.map((c) => c.y);
  return (
    Math.min(...xs) < box.x + box.size &&
    Math.max(...xs) > box.x &&
    Math.min(...ys) < box.y + box.size &&
    Math.max(...ys) > box.y
  );
}

describe("every note-taking game keeps the glyph's box clear", () => {
  /**
   * With the mode off, the only thing a game may paint in the box is the plain
   * background the indicator erases to, and only underneath it. Anything else
   * means the glyph sits on a cell, a clue or a line: under the indicator it is
   * erased when the mode changes, and over it the glyph is drawn on.
   */
  let framesChecked = 0;
  for (const { id, game, state } of builtGames()) {
    if (!noteTaking.ids.includes(id)) continue;

    it(`${id}: nothing of the board reaches the box, at any tile size`, () => {
      for (const ts of SWEEP_TILES) {
        const canvas = game.computeSize(game.defaultParams(), ts);
        const box = pencilIndicatorBox(canvas, ts);
        const ops = frameWith(game, state, false, ts);
        // The indicator's own erase. A game that repaints the whole canvas each
        // frame (Loopy) has none, and its background is the canvas-wide clear.
        const own = ops.findIndex(
          (o) =>
            o.op === "rect" &&
            o.x === box.x &&
            o.y === box.y &&
            o.w === box.size &&
            o.h === box.size,
        );
        const background =
          ops[own] ??
          ops.find(
            (o) =>
              o.op === "rect" &&
              o.x <= 0 &&
              o.y <= 0 &&
              o.w >= canvas.w &&
              o.h >= canvas.h,
          );
        expect(
          background?.op,
          `${id} at tile ${ts} paints neither the indicator's box nor a canvas-wide background`,
        ).toBe("rect");
        const bg = (background as { rgb: string }).rgb;
        framesChecked++;
        ops.forEach((op, i) => {
          if (i === own || !overlaps(op, box)) return;
          const under = own < 0 || i < own;
          if (op.op === "rect" && op.rgb === bg && under) return;
          expect.fail(
            `${id} at tile ${ts} paints ${JSON.stringify(op)} ${under ? "under" : "over"} the indicator's box ${JSON.stringify(box)}`,
          );
        });
      }
    });
  }

  it("looked at a frame per game and tile size", () => {
    expect(framesChecked).toBe(noteTaking.ids.length * SWEEP_TILES.length);
  });
});

/**
 * The slots a player's screen gives the canvas: a phone and the laptop window
 * the defect was found in. The midend picks the largest tile whose canvas
 * fits, as {@link fittedTile} does here.
 */
const SLOTS = [
  { name: "phone", w: 380, h: 480 },
  { name: "laptop", w: 682, h: 556 },
];

/**
 * The glyph's share of the canvas's short side it may not fall below. The
 * collection's coarse boards sit between 3.5% and 6.5% at these slots; Map
 * sat at 2.2%, a 9px glyph on a 417px canvas, and read as a speck.
 */
const MIN_SHARE = 0.035;

function fittedTile(game: AnyGame, params: unknown, slot: Size): number {
  let ts = 1;
  for (;;) {
    const next = game.computeSize(params, ts + 1);
    if (next.w > slot.w || next.h > slot.h) return ts;
    ts++;
  }
}

describe("the glyph reads against the canvas it sits on", () => {
  let cases = 0;
  for (const { id, game } of builtGames()) {
    if (!noteTaking.ids.includes(id)) continue;

    it(`${id}: at least ${(MIN_SHARE * 100).toFixed(1)}% of the short side, every preset and slot`, () => {
      for (const { label, params } of paramsCorpus(game)) {
        for (const slot of SLOTS) {
          const ts = fittedTile(game, params, slot);
          const canvas = game.computeSize(params, ts);
          const { size } = pencilIndicatorBox(canvas, ts);
          const share = size / Math.min(canvas.w, canvas.h);
          cases++;
          expect(
            share,
            `${id} ${label} on a ${slot.name}: a ${size}px glyph on a ${canvas.w}×${canvas.h} canvas`,
          ).toBeGreaterThanOrEqual(MIN_SHARE);
        }
      }
    });
  }

  it("measured every member at every slot", () => {
    expect(cases).toBeGreaterThanOrEqual(noteTaking.ids.length * SLOTS.length);
  });
});

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
import type { GameDrawing } from "./game.ts";
import { pencilIndicatorBox } from "./pencil-indicator.ts";
import { type AnyGame, builtGames, enrolledIn } from "./testing/enrollment.ts";
import type { DrawOp } from "./testing/recording-drawing.ts";
import { RecordingDrawing } from "./testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "./testing/render-scenario.ts";

beforeAll(registerAllGames);

/** A game takes notes iff its own `Ui` carries the collection's mode flag. */
const noteTaking = enrolledIn((g) => typeof g.ui["pencilMode"] === "boolean");

/** Every corner a draw op touches. `clip`/`unclip` bound nothing themselves. */
function cornersOf(op: DrawOp): { x: number; y: number }[] {
  switch (op.op) {
    case "rect":
      return [
        { x: op.x, y: op.y },
        { x: op.x + op.w, y: op.y + op.h },
      ];
    case "line":
      return [
        { x: op.x1, y: op.y1 },
        { x: op.x2, y: op.y2 },
      ];
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
function frameWith(game: AnyGame, state: unknown, on: boolean): DrawOp[] {
  const ui = game.newUi(state) as {
    pencilMode: boolean;
    cursor?: { visible: boolean };
  };
  ui.pencilMode = on;
  if (ui.cursor) ui.cursor.visible = false;
  const ts = game.preferredTileSize ?? 32;
  const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
  game.redraw(
    dr as unknown as GameDrawing,
    game.newDrawState(state, ts),
    null,
    state,
    1,
    ui,
    0,
    0,
  );
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

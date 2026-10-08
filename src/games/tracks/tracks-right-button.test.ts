/**
 * The right button in Tracks: a cross on a square is the mark a player wants,
 * and a cross on an edge the rare one. So a right-click crosses an edge only
 * on the narrow strip along it, and a right-drag crosses squares wherever it
 * starts.
 */

import { describe, expect, it } from "vitest";
import { UI_UPDATE } from "../../engine/game.ts";
import { RIGHT_BUTTON, RIGHT_DRAG, RIGHT_RELEASE } from "../../engine/pointer.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { tracksGame } from "./index.ts";
import { centeredCoord, metrics, PREFERRED_TILE_SIZE } from "./render.ts";
import { newState, type TracksParams } from "./state.ts";

const P: TracksParams = { w: 6, h: 6, diff: 0, singleOnes: true };
const DESC = "f6pCkC,2,3,3,2,3,S3,3,S3,3,3,2,2";
const M = metrics(PREFERRED_TILE_SIZE);
const center = (n: number) => centeredCoord(n, M);

/** A right press and release at `(x, y)`: the move the click makes. */
function rightClick(x: number, y: number) {
  const st = newState(P, DESC);
  const ui = tracksGame.newUi(st);
  const ds = preferredDrawState(tracksGame, st);
  tracksGame.interpretMove(st, ui, ds, { x, y }, RIGHT_BUTTON);
  return tracksGame.interpretMove(st, ui, ds, { x, y }, RIGHT_RELEASE);
}

describe("Tracks: the right button", () => {
  it("crosses the square from anywhere but the strip along an edge", () => {
    // Well off the square's middle, where a left click would address the
    // edge, and still short of the strip.
    const off = M.tile / 2 - 6;
    for (const [dx, dy] of [
      [0, 0],
      [off, 0],
      [-off, 0],
      [0, off],
      [0, -off],
    ])
      expect(rightClick(center(2) + dx, center(3) + dy)).toEqual({
        ops: [{ kind: "square", x: 2, y: 3, track: false, set: true }],
      });
  });

  it("crosses the edge on the strip along it", () => {
    // Two pixels inside the square's right side.
    const move = rightClick(center(2) + M.tile / 2 - 2, center(3));
    expect(move).toMatchObject({ ops: [{ kind: "edge", track: false, set: true }] });
  });

  it("a drag crosses squares, even when it starts on an edge's strip", () => {
    const st = newState(P, DESC);
    const ui = tracksGame.newUi(st);
    const ds = preferredDrawState(tracksGame, st);
    const y = center(3);
    tracksGame.interpretMove(
      st,
      ui,
      ds,
      { x: center(1) + M.tile / 2 - 2, y },
      RIGHT_BUTTON,
    );
    // The drag makes no move as it goes: the squares are one move on release.
    expect(tracksGame.interpretMove(st, ui, ds, { x: center(3), y }, RIGHT_DRAG)).toBe(
      UI_UPDATE,
    );
    const move = tracksGame.interpretMove(
      st,
      ui,
      ds,
      { x: center(3), y },
      RIGHT_RELEASE,
    );
    expect(move).toMatchObject({
      ops: [1, 2, 3].map((x) => ({ kind: "square", x, y: 3, track: false, set: true })),
    });
  });
});

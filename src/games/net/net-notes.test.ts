/**
 * Net's side notes (`add-net-notation`): the note move and the side it names,
 * notes-mode input, what Check & Save flags, and the frame.
 */

import { describe, expect, it } from "vitest";
import { UI_UPDATE } from "../../engine/game.ts";
import {
  CURSOR_RIGHT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  ESCAPE,
  LEFT_BUTTON,
  PENCIL_MODE_BUTTON,
  RIGHT_BUTTON,
} from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { opsOfKind } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { D, L, R, U } from "../../engine/wires.ts";
import { newDesc } from "./generator.ts";
import { netGame } from "./index.ts";
import { findMistakes } from "./mistakes.ts";
import {
  boardMargin,
  COL_ERR,
  COL_PENCIL,
  lineThick,
  PREFERRED_TILE_SIZE,
} from "./render.ts";
import {
  LOCKED,
  type NetMove,
  type NetParams,
  type NetState,
  NOTE_NONE,
  NOTE_UNKNOWN,
  NOTE_WIRE,
  newState,
  newUi,
  sideIndex,
} from "./state.ts";

const P: NetParams = {
  w: 5,
  h: 5,
  wrapping: false,
  barrierProbability: 0,
};
const PW: NetParams = { ...P, wrapping: true };

function board(p: NetParams, seed: string) {
  const { desc, aux } = newDesc(p, randomNew(seed));
  const state = newState(p, desc);
  const solution = Uint8Array.from(aux ?? "", (c) => Number.parseInt(c, 16));
  return { id: `${netGame.encodeParams(p, true)}:${desc}`, state, solution };
}

const ts = PREFERRED_TILE_SIZE;
const ds = () => ({ tileSize: ts }) as Parameters<typeof netGame.interpretMove>[2];
/** A point inside tile `(x, y)`, `fx`/`fy` of the way across it. */
function at(x: number, y: number, fx: number, fy: number) {
  const o = boardMargin(ts) + lineThick(ts);
  return { x: o + (x + fx) * ts, y: o + (y + fy) * ts };
}

describe("the note move", () => {
  it("names a side once, from either tile, and across a wrapping edge", () => {
    const s = { w: 5, h: 5 };
    expect(sideIndex(s, 2, 1, L)).toBe(sideIndex(s, 1, 1, R));
    expect(sideIndex(s, 2, 1, U)).toBe(sideIndex(s, 2, 0, D));
    expect(sideIndex(s, 0, 3, L)).toBe(sideIndex(s, 4, 3, R));
    expect(sideIndex(s, 3, 0, U)).toBe(sideIndex(s, 3, 4, D));
  });

  it("sets a note absolutely, and changes no tile", () => {
    const { state } = board(P, "notes-move");
    const m: NetMove = { type: "note", x: 1, y: 2, dir: R, note: NOTE_WIRE };
    const once = netGame.executeMove(state, m);
    expect(once.sides[sideIndex(once, 2, 2, L)]).toBe(NOTE_WIRE);
    expect(once.tiles).toEqual(state.tiles);
    expect(netGame.executeMove(once, m).sides).toEqual(once.sides);
  });
});

describe("notes mode", () => {
  const fresh = () => {
    const { state } = board(P, "notes-input");
    const ui = newUi(state);
    netGame.interpretMove(state, ui, ds(), { x: 0, y: 0 }, PENCIL_MODE_BUTTON);
    return { state, ui };
  };

  it("the Marks key toggles it", () => {
    const { state } = board(P, "notes-input");
    const ui = newUi(state);
    expect(
      netGame.interpretMove(state, ui, ds(), { x: 0, y: 0 }, PENCIL_MODE_BUTTON),
    ).toBe(UI_UPDATE);
    expect(ui.pencilMode).toBe(true);
  });

  it("a tap notes the side it lands nearest: left a wire, right none, again off", () => {
    const { state, ui } = fresh();
    const nearRight = at(1, 2, 0.95, 0.5);
    const wire = netGame.interpretMove(state, ui, ds(), nearRight, LEFT_BUTTON);
    expect(wire).toEqual({ type: "note", x: 1, y: 2, dir: R, note: NOTE_WIRE });
    const nearTop = at(3, 3, 0.5, 0.05);
    expect(netGame.interpretMove(state, ui, ds(), nearTop, RIGHT_BUTTON)).toEqual({
      type: "note",
      x: 3,
      y: 2,
      dir: D,
      note: NOTE_NONE,
    });
    const after = netGame.executeMove(state, wire as NetMove);
    expect(netGame.interpretMove(after, ui, ds(), nearRight, LEFT_BUTTON)).toEqual({
      type: "note",
      x: 1,
      y: 2,
      dir: R,
      note: NOTE_UNKNOWN,
    });
  });

  it("a tap in a tile's middle third locks it, with either button, and a tap outside it notes", () => {
    const { state, ui } = fresh();
    const lock = { type: "lock", x: 2, y: 1 };
    for (const button of [LEFT_BUTTON, RIGHT_BUTTON]) {
      expect(
        netGame.interpretMove(state, ui, ds(), at(2, 1, 0.5, 0.5), button),
      ).toEqual(lock);
      expect(
        netGame.interpretMove(state, ui, ds(), at(2, 1, 0.36, 0.64), button),
      ).toEqual(lock);
    }
    // Just outside the middle third, the nearest side is noted as before.
    expect(
      netGame.interpretMove(state, ui, ds(), at(2, 1, 0.3, 0.5), LEFT_BUTTON),
    ).toMatchObject({ type: "note", x: 1, y: 1, dir: R });
    // And the lock it makes is the move `S` makes at the cursor.
    const locked = netGame.executeMove(state, lock as NetMove);
    expect(locked.tiles[1 * state.w + 2] & LOCKED).toBe(LOCKED);
  });

  it("a wall takes no note", () => {
    const { state, ui } = fresh();
    expect(
      netGame.interpretMove(state, ui, ds(), at(0, 2, 0.02, 0.5), LEFT_BUTTON),
    ).toBeNull();
  });

  it("from the keyboard: pick a tile, then Enter or Space on a neighbor", () => {
    const { state, ui } = fresh();
    ui.cursor.x = 1;
    ui.cursor.y = 1;
    ui.cursor.visible = true;
    expect(netGame.interpretMove(state, ui, ds(), { x: 0, y: 0 }, CURSOR_SELECT)).toBe(
      UI_UPDATE,
    );
    expect(ui.pin).toEqual({ x: 1, y: 1 });
    netGame.interpretMove(state, ui, ds(), { x: 0, y: 0 }, CURSOR_RIGHT);
    expect(
      netGame.interpretMove(state, ui, ds(), { x: 0, y: 0 }, CURSOR_SELECT2),
    ).toEqual({
      type: "note",
      x: 1,
      y: 1,
      dir: R,
      note: NOTE_NONE,
    });
    expect(ui.pin).toBeNull();

    netGame.interpretMove(state, ui, ds(), { x: 0, y: 0 }, CURSOR_SELECT);
    expect(ui.pin).toEqual({ x: 2, y: 1 });
    expect(netGame.interpretMove(state, ui, ds(), { x: 0, y: 0 }, ESCAPE)).toBe(
      UI_UPDATE,
    );
    expect(ui.pin).toBeNull();
  });

  it("wraps: the tiles either side of a wrapping edge are neighbors", () => {
    const { state } = board(PW, "notes-wrap");
    const ui = newUi(state);
    netGame.interpretMove(state, ui, ds(), { x: 0, y: 0 }, PENCIL_MODE_BUTTON);
    Object.assign(ui.cursor, { x: 4, y: 0, visible: true });
    netGame.interpretMove(state, ui, ds(), { x: 0, y: 0 }, CURSOR_SELECT);
    netGame.interpretMove(state, ui, ds(), { x: 0, y: 0 }, CURSOR_RIGHT);
    expect(ui.cursor.x).toBe(0);
    expect(
      netGame.interpretMove(state, ui, ds(), { x: 0, y: 0 }, CURSOR_SELECT),
    ).toEqual({
      type: "note",
      x: 4,
      y: 0,
      dir: R,
      note: NOTE_WIRE,
    });
  });
});

describe("mistakes", () => {
  const lockAs = (s: NetState, x: number, y: number, wires: number): NetState => {
    const tiles = Uint8Array.from(s.tiles);
    tiles[y * s.w + x] = wires | LOCKED;
    return { ...s, tiles };
  };
  const note = (s: NetState, x: number, y: number, dir: number, n: number) =>
    netGame.executeMove(s, { type: "note", x, y, dir, note: n as 0 | 1 | 2 });

  it("flags a lock or a note the solution contradicts, and nothing else", () => {
    const { state, solution } = board(P, "notes-mistakes");
    const i = 2 * P.w + 2;
    const right = solution[i] & 0xf;
    expect(findMistakes(lockAs(state, 2, 2, right))).toEqual([]);
    const crosses = (solution[i] & R) !== 0;
    const truthful = note(state, 2, 2, R, crosses ? NOTE_WIRE : NOTE_NONE);
    expect(findMistakes(truthful)).toEqual([]);
    const lying = note(state, 2, 2, R, crosses ? NOTE_NONE : NOTE_WIRE);
    expect(findMistakes(lying)).toEqual([{ kind: "side", x: 2, y: 2, dir: R }]);
    // A lock is wrong only by being turned wrong, so turn it: a quarter turn
    // changes every tile but a cross, which the seed does not put at (2, 2).
    const turned = ((right << 1) | (right >> 3)) & 0xf;
    expect(turned).not.toBe(right);
    expect(findMistakes(lockAs(state, 2, 2, turned))).toEqual([
      { kind: "tile", x: 2, y: 2 },
    ]);
  });
});

describe("the frame", () => {
  it("draws a note in pencil, and in the error color once it is flagged", () => {
    const { id, solution } = board(P, "notes-frame");
    const crosses = (solution[2 * P.w + 1] & R) !== 0;
    const lie: NetMove = {
      type: "note",
      x: 1,
      y: 2,
      dir: R,
      note: crosses ? NOTE_NONE : NOTE_WIRE,
    };
    const plain = renderScenario({ game: netGame, id, moves: [lie] });
    expect(
      plain.recording.ops.some((o) => "color" in o && o.color === COL_PENCIL),
    ).toBe(true);
    expect(
      opsOfKind(plain.recording.ops, "line").some((o) => o.color === COL_ERR),
    ).toBe(false);
    const checked = renderScenario({
      game: netGame,
      id,
      moves: [lie],
      showMistakes: true,
    });
    expect(checked.mistakeCount).toBe(1);
    expect(
      checked.recording.ops.some((o) => "color" in o && o.color === COL_PENCIL),
    ).toBe(false);
  });

  it("shows the pencil while notes mode is on", () => {
    const { id } = board(P, "notes-frame");
    const off = renderScenario({ game: netGame, id });
    const on = renderScenario({ game: netGame, id, presses: [PENCIL_MODE_BUTTON] });
    const polys = (r: typeof off) => opsOfKind(r.recording.ops, "polygon").length;
    expect(polys(on)).toBeGreaterThan(polys(off));
  });
});

/**
 * Loopy's notes: the corner and pair marks a player makes in notes mode, which the
 * hint's steps place and cite (`add-loopy-notation`'s design).
 *
 * 1. **Where a tap lands, on every tiling.** The tap resolves by angle around the
 *    nearest dot, and the solver indexes corners around faces; the two agree only
 *    if a dot's edges really run the way `notes.ts` assumes. So a point inside each
 *    face's corner is resolved and compared with `dlineIndexFromFace`, which
 *    `dlines.test.ts` holds to the grid.
 * 2. **The gestures.** A tap cycles a corner and a drag a pair; a touch hold (the
 *    right button) cycles the other way; a canceled press notes nothing; the
 *    keyboard's Enter is the tap on the same corner.
 * 3. **A note survives a save**, and draws: pencil, red when wrong, the indicator
 *    below the board and never on it.
 */
import { describe, expect, it } from "vitest";
import { UI_UPDATE } from "../../engine/game.ts";
import type { Grid, GridFace } from "../../engine/grid/index.ts";
import { pencilModeKey } from "../../engine/key-labels.ts";
import { Midend } from "../../engine/midend.ts";
import {
  CURSOR_DOWN,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  PENCIL_MODE_BUTTON,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
} from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { dlineEnds, dlineIndexFromDot, dlineIndexFromFace } from "./dlines.ts";
import { newDesc } from "./generator.ts";
import { buildLoopyGrid } from "./grid-build.ts";
import { type LoopyMove, type LoopyUi, loopyGame } from "./index.ts";
import { cornerArc, cornerAt, cursorCorner } from "./notes.ts";
import {
  DIFF_EASY,
  encodeParams,
  gridTypeOf,
  LOOPY_GRIDS,
  type LoopyParams,
} from "./params.ts";
import {
  border,
  COL_CURSOR,
  COL_MISTAKE,
  COL_PENCIL,
  COL_PENCIL_BODY,
  type LoopyDrawState,
} from "./render.ts";
import { type LoopyState, newState } from "./state.ts";

/** The collection's pencil-mode toggle, which is all Loopy has: its right button
 * and its held finger already rule an edge out. */
const NOTES = PENCIL_MODE_BUTTON;
const ESCAPE = 27;
const BACKSPACE = 127;

/** Whether a grid point lies inside a face's polygon: the even-odd rule, written
 * here so the check does not lean on the module it checks. */
function insideFace(f: GridFace, x: number, y: number): boolean {
  const pts = f.dots.flatMap((d) => (d === null ? [] : [d]));
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x)
      inside = !inside;
  }
  return inside;
}

describe("a corner is where a tap in it lands, on every tiling", () => {
  it("sees every tiling", () => {
    expect(LOOPY_GRIDS.length).toBe(18);
  });

  for (const [type, spec] of LOOPY_GRIDS.entries()) {
    it(`${spec.type}: the corners round each dot make one turn, and a tap in a face's corner resolves to it`, () => {
      const size = Math.max(4, spec.amin);
      const { grid } = buildLoopyGrid(
        gridTypeOf({ w: size, h: size, diff: 0, type }),
        size,
        size,
        randomNew(`notes-${type}`),
      );
      expect(grid.numFaces).toBeGreaterThan(0);

      for (const dot of grid.dots) {
        let total = 0;
        for (let j = 0; j < dot.order; j++) {
          total += Math.abs(cornerArc(grid, dlineIndexFromDot(dot, j)).sweep);
        }
        expect(total, `${spec.type} dot ${dot.index}`).toBeCloseTo(2 * Math.PI, 6);
      }

      // Points on a small circle round each dot, each classified by the face whose
      // polygon holds it — not by anything `notes.ts` computes — must resolve to
      // that face's corner at the dot, as `dlines.ts` indexes it.
      const seen = new Set<number>();
      for (const f of grid.faces) {
        for (let i = 0; i < f.order; i++) {
          const d = f.dots[i];
          if (d === null) continue;
          const shortest = Math.min(
            ...d.edges.map((e) => {
              const far = e.dot1 === d ? e.dot2 : e.dot1;
              return Math.hypot(far.x - d.x, far.y - d.y);
            }),
          );
          const r = 0.1 * shortest;
          for (let k = 0; k < 90; k++) {
            const a = (k * 2 * Math.PI) / 90 + 0.01;
            const x = d.x + r * Math.cos(a);
            const y = d.y + r * Math.sin(a);
            if (!insideFace(f, x, y)) continue;
            const want = dlineIndexFromFace(f, i);
            expect(
              cornerAt(grid, x, y),
              `${spec.type} face ${f.index} corner ${i}`,
            ).toBe(want);
            seen.add(want);
          }
        }
      }
      // Every face corner was sampled, not only the wide ones.
      let corners = 0;
      for (const f of grid.faces) corners += f.order;
      expect(seen.size).toBe(corners);
    });
  }

  it("resolves nothing far off the board", () => {
    const { grid } = buildLoopyGrid(
      gridTypeOf({ w: 5, h: 5, diff: 0, type: 0 }),
      5,
      5,
      randomNew("off"),
    );
    expect(cornerAt(grid, grid.lowestX - 10 * grid.tileSize, grid.lowestY)).toBeNull();
  });
});

// --- a board to drive -------------------------------------------------------

function board(type = 0, w = 5, h = 5) {
  const p: LoopyParams = { w, h, diff: DIFF_EASY, type };
  const { desc } = newDesc(p, randomNew("loopy-notes"));
  const s = newState(p, desc);
  const ui = loopyGame.newUi(s);
  const ds = preferredDrawState(loopyGame, s);
  return { p, desc, s, ui, ds };
}

function toScreen(g: Grid, ds: LoopyDrawState, x: number, y: number) {
  const b = border(ds.tileSize);
  return {
    x: Math.round(((x - g.lowestX) * ds.tileSize) / g.tileSize) + b,
    y: Math.round(((y - g.lowestY) * ds.tileSize) / g.tileSize) + b,
  };
}

/** Where a pointer would tap inside a corner: along its angle's bisector. */
function inCorner(s: LoopyState, ds: LoopyDrawState, dline: number) {
  const { dot, from, sweep } = cornerArc(s.grid, dline);
  const r = 0.3 * s.grid.tileSize;
  const a = from + sweep / 2;
  return toScreen(s.grid, ds, dot.x + r * Math.cos(a), dot.y + r * Math.sin(a));
}

function edgeMid(s: LoopyState, ds: LoopyDrawState, edge: number) {
  const e = s.grid.edges[edge];
  return toScreen(s.grid, ds, (e.dot1.x + e.dot2.x) / 2, (e.dot1.y + e.dot2.y) / 2);
}

function input(
  b: { s: LoopyState; ui: LoopyUi; ds: LoopyDrawState },
  button: number,
  at = { x: 0, y: 0 },
) {
  return loopyGame.interpretMove(b.s, b.ui, b.ds, at, button);
}

/** Apply a move to the driven board, and return it. */
function apply(b: { s: LoopyState }, move: unknown): LoopyMove {
  if (move === null || move === UI_UPDATE)
    throw new Error(`not a move: ${String(move)}`);
  b.s = loopyGame.executeMove(b.s, move as LoopyMove);
  return move as LoopyMove;
}

describe("notes mode by pointer", () => {
  it("is off until the Marks key, which turns it off again", () => {
    const b = board();
    expect(b.ui.pencilMode).toBe(false);
    expect(input(b, NOTES)).toBe(UI_UPDATE);
    expect(b.ui.pencilMode).toBe(true);
    expect(input(b, NOTES)).toBe(UI_UPDATE);
    expect(b.ui.pencilMode).toBe(false);
    // Loopy's keypad is that key and nothing else; that every pencil game offers
    // it, and that pressing it toggles the mode, is `pencil-mode-key.test.ts`.
    expect(loopyGame.requestKeys?.(b.p)).toEqual([pencilModeKey]);
  });

  it("a tap cycles the corner it lands in; the right button, a held finger, cycles back", () => {
    const b = board();
    input(b, NOTES);
    const dline = dlineIndexFromFace(b.s.grid.faces[6], 0);
    const at = inCorner(b.s, b.ds, dline);
    const tap = (down: number, up: number) => {
      expect(input(b, down, at)).toBe(UI_UPDATE);
      return apply(b, input(b, up, at));
    };
    expect(tap(LEFT_BUTTON, LEFT_RELEASE)).toEqual({ kind: "corner", dline, bits: 1 });
    expect(tap(LEFT_BUTTON, LEFT_RELEASE)).toEqual({ kind: "corner", dline, bits: 2 });
    expect(tap(LEFT_BUTTON, LEFT_RELEASE)).toEqual({ kind: "corner", dline, bits: 3 });
    expect(tap(LEFT_BUTTON, LEFT_RELEASE)).toEqual({ kind: "corner", dline, bits: 0 });
    expect(tap(RIGHT_BUTTON, RIGHT_RELEASE)).toEqual({
      kind: "corner",
      dline,
      bits: 3,
    });
    // With the mode off the same tap sets a line, as it always has.
    input(b, NOTES);
    const click = input(b, LEFT_BUTTON, edgeMid(b.s, b.ds, 0));
    expect((click as LoopyMove).kind).toBe("set");
  });

  it("a drag from one edge to another cycles their pair, whichever button the drag arrives as", () => {
    const b = board();
    input(b, NOTES);
    const [x, y] = [0, 30];
    const drag = (
      down: number,
      move: number,
      up: number,
      end = edgeMid(b.s, b.ds, y),
    ) => {
      expect(input(b, down, edgeMid(b.s, b.ds, x))).toBe(UI_UPDATE);
      expect(input(b, move, edgeMid(b.s, b.ds, y))).toBe(UI_UPDATE);
      expect(b.ui.noteDrag?.dragged).toBe(true);
      return input(b, up, end);
    };
    expect(apply(b, drag(LEFT_BUTTON, LEFT_DRAG, LEFT_RELEASE))).toEqual({
      kind: "pair",
      a: x,
      b: y,
      relation: "match",
    });
    expect(apply(b, drag(LEFT_BUTTON, LEFT_DRAG, LEFT_RELEASE))).toMatchObject({
      relation: "opposite",
    });
    expect(b.s.pairs).toEqual([{ a: x, b: y, opposite: true }]);
    // A finger held before dragging is the right button, and cycles back.
    expect(apply(b, drag(RIGHT_BUTTON, RIGHT_DRAG, RIGHT_RELEASE))).toMatchObject({
      relation: "match",
    });
    // A canceled press is released off the board, and notes nothing.
    expect(drag(LEFT_BUTTON, LEFT_DRAG, LEFT_RELEASE, { x: -100, y: -100 })).toBe(
      UI_UPDATE,
    );
    expect(b.ui.noteDrag).toBeNull();
  });
});

describe("notes mode by keyboard", () => {
  it("Enter notes the corner clockwise from the chosen edge, the same move as a tap in it", () => {
    const byKey = board();
    input(byKey, NOTES);
    input(byKey, CURSOR_RIGHT);
    input(byKey, CURSOR_DOWN);
    const dline = cursorCorner(byKey.s.grid, byKey.ui.cursor);
    expect(dline).not.toBeNull();
    const key = input(byKey, CURSOR_SELECT);

    const byTap = board();
    input(byTap, NOTES);
    const at = inCorner(byTap.s, byTap.ds, dline ?? -1);
    input(byTap, LEFT_BUTTON, at);
    expect(key).toEqual(input(byTap, LEFT_RELEASE, at));
    expect(key).toEqual({ kind: "corner", dline, bits: 1 });

    apply(byKey, key);
    expect(apply(byKey, input(byKey, BACKSPACE))).toEqual({
      kind: "corner",
      dline,
      bits: 0,
    });
  });

  it("every corner of every tiling is clockwise from one of its edges at its dot", () => {
    for (const [type, spec] of LOOPY_GRIDS.entries()) {
      const size = Math.max(4, spec.amin);
      const { grid } = buildLoopyGrid(
        gridTypeOf({ w: size, h: size, diff: 0, type }),
        size,
        size,
        randomNew(`kb-notes-${type}`),
      );
      for (let dline = 0; dline < 2 * grid.numEdges; dline++) {
        const { dot, first } = dlineEnds(grid, dline);
        const cursor = { dot: dot.index, edge: first, arrow: 0, visible: true };
        expect(cursorCorner(grid, cursor), spec.type).toBe(dline);
      }
    }
  });

  it("Space pins an edge and Space on another pairs them; Escape drops a pin before it hides the cursor", () => {
    const b = board();
    input(b, NOTES);
    input(b, CURSOR_RIGHT);
    const first = b.ui.cursor.edge;
    expect(input(b, CURSOR_SELECT2)).toBe(UI_UPDATE);
    expect(b.ui.pin).toBe(first);
    // Space again on the same edge lets go of it.
    expect(input(b, CURSOR_SELECT2)).toBe(UI_UPDATE);
    expect(b.ui.pin).toBe(-1);

    input(b, CURSOR_SELECT2);
    input(b, CURSOR_RIGHT);
    const second = b.ui.cursor.edge;
    expect(apply(b, input(b, CURSOR_SELECT2))).toEqual({
      kind: "pair",
      a: Math.min(first, second),
      b: Math.max(first, second),
      relation: "match",
    });
    expect(b.ui.pin).toBe(-1);

    input(b, CURSOR_SELECT2);
    expect(input(b, ESCAPE)).toBe(UI_UPDATE);
    expect(b.ui.pin).toBe(-1);
    expect(b.ui.cursor.visible).toBe(true);
    expect(input(b, ESCAPE)).toBe(UI_UPDATE);
    expect(b.ui.cursor.visible).toBe(false);
  });
});

describe("notes on the board", () => {
  const moves = (s: LoopyState): LoopyMove[] => [
    { kind: "set", ops: [{ edge: 3, state: 1 }] },
    { kind: "corner", dline: dlineIndexFromFace(s.grid.faces[0], 0), bits: 3 },
    { kind: "pair", a: 1, b: 12, relation: "opposite" },
  ];

  it("reject a note naming nothing", () => {
    const { s } = board();
    expect(() =>
      loopyGame.executeMove(s, { kind: "corner", dline: -1, bits: 1 }),
    ).toThrow();
    expect(() =>
      loopyGame.executeMove(s, { kind: "corner", dline: 0, bits: 4 }),
    ).toThrow();
    expect(() =>
      loopyGame.executeMove(s, { kind: "pair", a: 2, b: 2, relation: "match" }),
    ).toThrow();
  });

  it("survive a save, and a log of lines alone still loads", () => {
    const { p, desc, s } = board();
    const id = `${encodeParams(p, true)}:${desc}`;
    const saved = new Midend(loopyGame);
    expect(saved.newGameFromId(id)).toBeNull();
    saved.playMoves(moves(s));
    const bytes = saved.saveGame();

    const loaded = new Midend(loopyGame);
    expect(loaded.loadGame(bytes)).toBeNull();
    expect([...loaded.saveGame()]).toEqual([...bytes]);

    // The moves a save written before notes existed can hold.
    const lines = new Midend(loopyGame);
    lines.newGameFromId(id);
    lines.playMoves([moves(s)[0]]);
    expect(new Midend(loopyGame).loadGame(lines.saveGame())).toBeNull();
  });

  it("draw in pencil, red when wrong, inside the canvas; the mode's pencil sits top-right and the keyboard previews its corner", () => {
    const b = board();
    const state = moves(b.s).reduce((s, m) => loopyGame.executeMove(s, m), b.s);
    const palette = loopyGame.colors(DEFAULT_BACKGROUND);
    const draw = (ui: LoopyUi, mistakes = loopyGame.findMistakes?.(state) ?? []) => {
      const dr = new RecordingDrawing(palette);
      loopyGame.redraw(dr, b.ds, null, state, 0, ui, 0, 0, undefined, mistakes);
      return dr.ops;
    };

    const plain = draw(b.ui, []);
    expect(plain.some((o) => o.op === "polygon" && o.fill === COL_PENCIL)).toBe(true);
    expect(
      plain.some((o) => o.op === "text" && o.text === "≠" && o.color === COL_PENCIL),
    ).toBe(true);
    expect(plain.some((o) => o.op === "polygon" && o.fill === COL_PENCIL_BODY)).toBe(
      false,
    );

    const wrong = draw(b.ui, [
      { kind: "corner", dline: dlineIndexFromFace(state.grid.faces[0], 0) },
    ]);
    expect(wrong.some((o) => o.op === "polygon" && o.fill === COL_MISTAKE)).toBe(true);

    // Half a board's corners are on its rim, and a corner note's band reaches
    // nearly half an edge, so a gutter sized for the cursor alone clipped every
    // one of them: the notes on this board must fall inside the canvas.
    const { w, h } = loopyGame.computeSize(b.p, b.ds.tileSize);
    const notes = plain.filter((o) => o.op === "polygon" && o.fill === COL_PENCIL);
    expect(notes.length).toBeGreaterThan(0);
    for (const note of notes)
      for (const [x, y] of note.op === "polygon" ? note.points : []) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(w);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(h);
      }

    const ui = { ...b.ui, pencilMode: true };
    input({ s: state, ui, ds: b.ds }, CURSOR_RIGHT);
    const on = draw(ui, []);
    const glyph = on.filter((o) => o.op === "polygon" && o.fill === COL_PENCIL_BODY);
    expect(glyph).toHaveLength(1);
    // The collection's place for it: above and right of every dot, inside the
    // canvas (`engine/pencil-indicator.ts` `pencilIndicatorBox`).
    const dots = on.flatMap((o) =>
      o.op === "circle" && o.fill !== COL_CURSOR ? [o] : [],
    );
    const topDot = Math.min(...dots.map((d) => d.cy - d.r));
    const rightDot = Math.max(...dots.map((d) => d.cx + d.r));
    for (const [x, y] of glyph[0].op === "polygon" ? glyph[0].points : []) {
      expect(y).toBeLessThan(topDot);
      expect(x).toBeGreaterThan(rightDot);
      expect(x).toBeLessThanOrEqual(w);
      expect(y).toBeGreaterThanOrEqual(0);
    }
    // The corner Enter would note, outlined in the cursor's color.
    expect(
      on.filter((o) => o.op === "line" && o.color === COL_CURSOR).length,
    ).toBeGreaterThan(1);
  });
});

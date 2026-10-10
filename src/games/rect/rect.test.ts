/**
 * Tier-1/2 behavioral tests for the Rectangles port: params/desc codecs,
 * input mapping (drag-draw / drag-erase / edge-toggle / no-op suppression),
 * completion, `findMistakes`, and the mistake render overlay.
 */
import { describe, expect, it } from "vitest";
import { DIFF_EASY, DIFF_UNREASONABLE } from "../../engine/answer-search.ts";
import { DESC_NOT_UNIQUE, loadVerdict, validateDesc } from "../../engine/desc-error.ts";
import { Midend } from "../../engine/index.ts";
import { describeParams, presetMenu } from "../../engine/param-label.ts";
import { paramsError } from "../../engine/params.ts";
import {
  CURSOR_UP,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  RIGHT_BUTTON,
  RIGHT_RELEASE,
} from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { itSlow } from "../../engine/testing/slow.ts";
import { newDesc } from "./generator.ts";
import { rungsFinish } from "./hint.ts";
import { rectGame } from "./index.ts";
import { cloneRectState, executeMove, newState, status } from "./moves.ts";
import { BORDER, COL_MISTAKE, newDrawState, redraw } from "./render.ts";
import {
  decodeParams,
  encodeNumbers,
  encodeParams,
  type RectParams,
  type RectState,
} from "./state.ts";

const P = (over: Partial<RectParams> = {}): RectParams => ({
  w: 7,
  h: 7,
  expandfactor: 0,
  diff: DIFF_EASY,
  ...over,
});

const TILE = rectGame.preferredTileSize ?? 24;
// Pixel coordinate of a fractional grid coordinate.
const px = (g: number) => g * TILE + BORDER;

/** Seed 3's 7x7 board with one interior vedge drawn that its solution lacks. */
function boardWithWrongWall(): { st: RectState; wrong: { x: number; y: number } } {
  const p = P();
  const st = newState(p, newDesc(p, randomNew("3")).desc);
  const solveMove = rectGame.solve?.(st, st, undefined);
  if (!solveMove?.ok) throw new Error("unsolvable");
  const solved = executeMove(st, solveMove.move);
  for (let y = 0; y < p.h; y++)
    for (let x = 1; x < p.w; x++)
      if (!solved.vedge[y * p.w + x])
        return {
          st: executeMove(st, { type: "edge", edge: "v", x, y }),
          wrong: { x, y },
        };
  throw new Error("no free edge");
}

describe("rect params codec", () => {
  it("round-trips full params including the e suffix", () => {
    for (const p of [
      P(),
      P({ w: 9, h: 7 }),
      P({ w: 8, h: 8, expandfactor: Math.fround(0.3) }),
      P({ w: 10, h: 10, expandfactor: Math.fround(0.5) }),
    ]) {
      const s = encodeParams(p, true);
      expect(decodeParams(s)).toEqual(p);
    }
  });

  it("encodes the expected strings", () => {
    expect(encodeParams(P({ w: 9, h: 7 }), true)).toBe("9x7de");
    expect(encodeParams(P(), true)).toBe("7x7de");
    expect(encodeParams(P({ expandfactor: 0.5 }), true)).toBe("7x7e0.5de");
    expect(encodeParams(P({ expandfactor: 0.5, diff: DIFF_UNREASONABLE }), true)).toBe(
      "7x7e0.5du",
    );
    expect(encodeParams(P({ expandfactor: 0.5 }), false)).toBe("7x7"); // non-full drops suffixes
  });

  it("reads a string from before the tiers as Easy, and the tier after it", () => {
    expect(decodeParams("9x7")).toEqual(P({ w: 9, h: 7 }));
    expect(decodeParams("9x7du")).toEqual(P({ w: 9, h: 7, diff: DIFF_UNREASONABLE }));
    expect(decodeParams("10x10e0.5adu")).toEqual(
      P({ w: 10, h: 10, expandfactor: Math.fround(0.5), diff: DIFF_UNREASONABLE }),
    );
  });

  it("reads past upstream's `a`, which asks for a board with no promised answer", () => {
    expect(decodeParams("9x7a")).toEqual(P({ w: 9, h: 7 }));
    expect(decodeParams("10x10e0.5a")).toEqual(
      P({ w: 10, h: 10, expandfactor: Math.fround(0.5) }),
    );
  });

  it("rejects invalid params", () => {
    const error = (p: RectParams) => paramsError(rectGame, p, true);
    expect(error(P({ w: 1, h: 1 }))).not.toBeNull(); // area < 2
    expect(error(P({ w: 0, h: 5 }))).toBe("Width must be at least 1.");
    expect(error(P({ expandfactor: -1 }))).toBe("Expansion factor must be at least 0.");
    expect(error(P())).toBeNull();
  });

  it("labels a custom grid with its expansion", () => {
    expect(describeParams(rectGame, P({ w: 9, h: 7, expandfactor: 0.5 }))).toBe(
      "9x7 Easy, 50% expansion",
    );
    expect(presetMenu(rectGame).submenu?.[0]?.title).toBe("7x7 Easy");
  });
});

describe("rect desc codec", () => {
  it("round-trips a generated desc through newState + re-encode", () => {
    for (const seed of ["1", "2", "3"]) {
      const p = P();
      const { desc } = newDesc(p, randomNew(seed));
      expect(validateDesc(rectGame, p, desc)).toBeNull();
      const st = newState(p, desc);
      expect(encodeNumbers(st.grid, p.w * p.h)).toBe(desc);
    }
  });

  it("rejects malformed descs", () => {
    const p = P({ w: 3, h: 3 }); // area 9
    expect(validateDesc(rectGame, p, "i")).toBeNull(); // 9 empties exactly fills
    expect(validateDesc(rectGame, p, "h")).not.toBeNull(); // 8 < 9
    expect(validateDesc(rectGame, p, "j")).not.toBeNull(); // 10 > 9
    expect(validateDesc(rectGame, p, "!")).not.toBeNull(); // bad char
  });

  it("refuses what encodeNumbers never writes", () => {
    const p = P({ w: 3, h: 3 });
    expect(validateDesc(rectGame, p, "3_6g")).toBeNull();
    // A number no rectangle on the board can have, including one large
    // enough to wrap a 32-bit cell to a different number.
    expect(validateDesc(rectGame, p, "10h")).toMatch(/out of range/);
    expect(validateDesc(rectGame, p, "4294967299h")).toMatch(/out of range/);
    expect(validateDesc(rectGame, p, "0h")).toMatch(/out of range/);
    // A `_` anywhere but between two adjacent numbers.
    expect(validateDesc(rectGame, p, "_3_6g")).toMatch(/"_"/);
    expect(validateDesc(rectGame, p, "3_6g_")).toMatch(/too long/);
    expect(validateDesc(rectGame, p, "3a_5f")).toMatch(/"_"/);
    expect(validateDesc(rectGame, p, "3_6g,")).toMatch(/too long/);
    expect(validateDesc(rectGame, p, "3_6f")).toMatch(/too short/);
  });
});

describe("rect input → moves", () => {
  it("a click on an edge toggles that edge", () => {
    const p = P();
    // Blank board (all empties) so we can toggle edges freely.
    const st = newState(p, "zw"); // 26+23 = 49 = 7*7
    const ui = rectGame.newUi(st);
    // Grid point (2.5, 3.0) is the horizontal edge on top of cell (2,3).
    const point = { x: px(2.5), y: px(3.0) };
    expect(
      rectGame.interpretMove(
        st,
        ui,
        preferredDrawState(rectGame, st),
        point,
        LEFT_BUTTON,
      ),
    ).toBeDefined();
    const move = rectGame.interpretMove(
      st,
      ui,
      preferredDrawState(rectGame, st),
      point,
      LEFT_RELEASE,
    );
    expect(move).toEqual({ type: "edge", edge: "h", x: 2, y: 3 });
    const next = executeMove(st, move as never);
    expect(next.hedge[3 * 7 + 2]).toBe(1);
    // Toggling again clears it.
    expect(executeMove(next, move as never).hedge[3 * 7 + 2]).toBe(0);
  });

  it("a left-drag draws a rectangle outline", () => {
    const p = P();
    const st = newState(p, "zw");
    const ui = rectGame.newUi(st);
    // Drag from grid vertex (2,2) to (4,4) → a 2×2 outline at (2,2).
    rectGame.interpretMove(
      st,
      ui,
      preferredDrawState(rectGame, st),
      { x: px(2), y: px(2) },
      LEFT_BUTTON,
    );
    rectGame.interpretMove(
      st,
      ui,
      preferredDrawState(rectGame, st),
      { x: px(4), y: px(4) },
      LEFT_DRAG,
    );
    const move = rectGame.interpretMove(
      st,
      ui,
      preferredDrawState(rectGame, st),
      { x: px(4), y: px(4) },
      LEFT_RELEASE,
    );
    expect(move).toEqual({ type: "rect", erasing: false, x: 2, y: 2, w: 2, h: 2 });
    const next = executeMove(st, move as never);
    // The four boundary edges of the 2×2 are set.
    expect(next.vedge[2 * 7 + 2]).toBe(1); // left of the box (x=2)
    expect(next.vedge[2 * 7 + 4]).toBe(1); // right of the box (x=4)
    expect(next.hedge[2 * 7 + 2]).toBe(1); // top (y=2)
    expect(next.hedge[4 * 7 + 2]).toBe(1); // bottom (y=4)
  });

  it("a right-drag erases interior edges without drawing an outline", () => {
    const p = P();
    let st = newState(p, "zw");
    // First draw a 2×2 outline via a rect move.
    st = executeMove(st, { type: "rect", erasing: false, x: 2, y: 2, w: 2, h: 2 });
    // Draw an interior wall inside it (vedge at x=3).
    st = executeMove(st, { type: "edge", edge: "v", x: 3, y: 2 });
    expect(st.vedge[2 * 7 + 3]).toBe(1);
    // Right-drag over the box erases interior edges, keeping the outline.
    const ui = rectGame.newUi(st);
    rectGame.interpretMove(
      st,
      ui,
      preferredDrawState(rectGame, st),
      { x: px(2), y: px(2) },
      RIGHT_BUTTON,
    );
    rectGame.interpretMove(
      st,
      ui,
      preferredDrawState(rectGame, st),
      { x: px(4), y: px(4) },
      LEFT_DRAG,
    );
    const move = rectGame.interpretMove(
      st,
      ui,
      preferredDrawState(rectGame, st),
      { x: px(4), y: px(4) },
      RIGHT_RELEASE,
    );
    expect(move).toEqual({ type: "rect", erasing: true, x: 2, y: 2, w: 2, h: 2 });
    const next = executeMove(st, move as never);
    expect(next.vedge[2 * 7 + 3]).toBe(0); // interior erased
    expect(next.vedge[2 * 7 + 2]).toBe(1); // outline kept
  });

  it("a click on a cell center yields no move", () => {
    const p = P();
    const st = newState(p, "zw");
    const ui = rectGame.newUi(st);
    const center = { x: px(3.5), y: px(3.5) };
    rectGame.interpretMove(
      st,
      ui,
      preferredDrawState(rectGame, st),
      center,
      LEFT_BUTTON,
    );
    const move = rectGame.interpretMove(
      st,
      ui,
      preferredDrawState(rectGame, st),
      center,
      LEFT_RELEASE,
    );
    // A center click maps to no H/V edge, so no move is produced.
    expect(move === null || (move as { type?: string }).type === undefined).toBe(true);
  });

  // The two drag tests above both drive press → drag → release, and both are
  // blind to a transposed drag anchor — for different reasons. The edge click
  // never reads the anchor at all (it derives the edge from the release's own
  // coordinates), and the rectangle drags (2,2) → (4,4), which is symmetric, so
  // swapping x for y at the press produces the same box. Measured: swapping the
  // two coordinates the press writes passed all 32 rect tests.
  //
  // Exercising a code path is not the same as discriminating within it; a
  // symmetric fixture hides a transposition however thoroughly it is driven.
  it("anchors an asymmetric drag the right way round", () => {
    const st = newState(P(), "zw");
    const ui = rectGame.newUi(st);
    const ds = preferredDrawState(rectGame, st);
    // 3 wide by 1 tall — a box that is not its own transpose.
    rectGame.interpretMove(st, ui, ds, { x: px(1), y: px(2) }, LEFT_BUTTON);
    rectGame.interpretMove(st, ui, ds, { x: px(4), y: px(3) }, LEFT_DRAG);
    const move = rectGame.interpretMove(
      st,
      ui,
      ds,
      { x: px(4), y: px(3) },
      LEFT_RELEASE,
    );
    expect(move).toEqual({ type: "rect", erasing: false, x: 1, y: 2, w: 3, h: 1 });
  });

  it("rounds the far edge outward, so a drag into a cell includes it", () => {
    // The half-grid pair halves into cells with the near edge rounding down and
    // the far edge rounding up. Both effects are invisible when the drag starts
    // and ends on vertices (even half-grid coords), which is what the test above
    // does — so this one releases over a cell *center* (an odd coordinate),
    // where dropping the outward rounding would lose the last column.
    const st = newState(P(), "zw");
    const ui = rectGame.newUi(st);
    const ds = preferredDrawState(rectGame, st);
    rectGame.interpretMove(st, ui, ds, { x: px(1), y: px(2) }, LEFT_BUTTON);
    rectGame.interpretMove(st, ui, ds, { x: px(3.5), y: px(3.5) }, LEFT_DRAG);
    const move = rectGame.interpretMove(
      st,
      ui,
      ds,
      { x: px(3.5), y: px(3.5) },
      LEFT_RELEASE,
    );
    // Anchor vertex (1,2) → half-grid (2,4); release at cell center (3,3) →
    // half-grid (7,7). So cells x 1..4 and y 2..4: a 3x2 box.
    expect(move).toEqual({ type: "rect", erasing: false, x: 1, y: 2, w: 3, h: 2 });
  });

  it("a click that never moves emits an edge, not a rectangle", () => {
    // `dragged` stays false until the pointer leaves the press point, which is
    // what keeps a bare click on an edge from committing a 1x1 box.
    const st = newState(P(), "zw");
    const ui = rectGame.newUi(st);
    const ds = preferredDrawState(rectGame, st);
    const point = { x: px(2.5), y: px(3.0) };
    rectGame.interpretMove(st, ui, ds, point, LEFT_BUTTON);
    expect(ui.dragged).toBe(false);
    expect(rectGame.interpretMove(st, ui, ds, point, LEFT_RELEASE)).toEqual({
      type: "edge",
      edge: "h",
      x: 2,
      y: 3,
    });
  });

  it("a drag that moves off the press point sets dragged, and the release clears it", () => {
    const st = newState(P(), "zw");
    const ui = rectGame.newUi(st);
    const ds = preferredDrawState(rectGame, st);
    rectGame.interpretMove(st, ui, ds, { x: px(1), y: px(2) }, LEFT_BUTTON);
    expect(ui.dragged).toBe(false);
    rectGame.interpretMove(st, ui, ds, { x: px(4), y: px(3) }, LEFT_DRAG);
    expect(ui.dragged).toBe(true);
    rectGame.interpretMove(st, ui, ds, { x: px(4), y: px(3) }, LEFT_RELEASE);
    // The release resets the drag, so the next press starts from nothing.
    expect(ui.dragged).toBe(false);
  });

  it("first arrow press only reveals the cursor", () => {
    const st = newState(P(), "zw");
    const ui = rectGame.newUi(st);
    expect(ui.cursor.visible).toBe(false);
    rectGame.interpretMove(
      st,
      ui,
      preferredDrawState(rectGame, st),
      { x: 0, y: 0 },
      CURSOR_UP,
    );
    expect(ui.cursor.visible).toBe(true);
  });
});

describe("rect completion + solve", () => {
  it("solving a generated board reports solved", () => {
    for (const seed of ["1", "7", "20"]) {
      const p = P();
      const { desc, aux } = newDesc(p, randomNew(seed));
      const st = newState(p, desc);
      expect(status(st)).toBe("ongoing");
      const solved = rectGame.solve?.(st, st, aux);
      expect(solved?.ok).toBe(true);
      if (solved?.ok) expect(status(executeMove(st, solved.move))).toBe("solved");
    }
  });

  it("the built-in solver (no aux) also completes the board", () => {
    const p = P();
    const { desc } = newDesc(p, randomNew("5"));
    const st = newState(p, desc);
    const solved = rectGame.solve?.(st, st, undefined);
    expect(solved?.ok).toBe(true);
    if (solved?.ok) expect(status(executeMove(st, solved.move))).toBe("solved");
  });

  it.each([
    { edge: "v", x: 1, y: 1 },
    { edge: "h", x: 1, y: 1 },
  ] as const)("a line inside a rectangle ($edge) leaves it unfinished", (line) => {
    // One 4 on a 2x2 board: solved as it stands, and the line reaches
    // neither the row nor the column the rectangle is measured along.
    const st = newState(P({ w: 2, h: 2 }), "4c");
    expect(status(st)).toBe("solved");
    expect(status(executeMove(st, { type: "edge", ...line }))).toBe("ongoing");
  });
});

describe("rect deals past the menu", () => {
  it.each([
    0.5, 2,
  ])("a strip is dealt with an expansion factor of %d", (expandfactor) => {
    // Upstream stretches it from a grid no squares wide, and does not return.
    for (const [w, h] of [
      [1, 7],
      [9, 1],
    ]) {
      const p = P({ w, h, expandfactor });
      const { desc } = newDesc(p, randomNew(`strip-${w}x${h}`));
      expect(rungsFinish(newState(p, desc)), desc).toBe(true);
    }
  });

  itSlow("a 60x60 board is dealt, and opens when pasted", () => {
    const p = P({ w: 60, h: 60 });
    const { desc } = newDesc(p, randomNew("sixty"));
    const me = new Midend(rectGame);
    expect(me.newGameFromId(`60x60:${desc}`)).toBeNull();
    expect(me.getParams()).toBe("60x60de");
  });
});

describe("rect findMistakes", () => {
  it("flags a wall the unique solution does not contain", () => {
    const { st, wrong } = boardWithWrongWall();
    const mistakes = rectGame.findMistakes?.(st) ?? [];
    expect(mistakes).toContainEqual({ edge: "v", ...wrong });
  });

  it("returns [] on an untouched board", () => {
    const p = P();
    const { desc } = newDesc(p, randomNew("3"));
    expect(rectGame.findMistakes?.(newState(p, desc)) ?? []).toEqual([]);
  });

  it("returns [] on a correctly-solved board", () => {
    const p = P();
    const { desc } = newDesc(p, randomNew("3"));
    const st = newState(p, desc);
    const solveMove = rectGame.solve?.(st, st, undefined);
    if (!solveMove?.ok) throw new Error("unsolvable");
    const solved = executeMove(st, solveMove.move);
    expect(rectGame.findMistakes?.(solved) ?? []).toEqual([]);
  });
});

describe("rect loading", () => {
  const tierOf = (p: RectParams, desc: string) => {
    const me = new Midend(rectGame);
    return me.newGameFromId(`${encodeParams(p, false)}:${desc}`) ?? me.getParams();
  };

  it("refuses a board with several answers", () => {
    // A board upstream dealt with "Ensure unique solution" off, and one built
    // here the same way.
    expect(loadVerdict(rectGame, P(), "c2f2a6a8e5c2b3_4c6d3d2b4a2a")).toBe(
      DESC_NOT_UNIQUE,
    );
    expect(loadVerdict(rectGame, P({ w: 4, h: 4 }), "2b2_2a2b2b2a2_2")).toBe(
      DESC_NOT_UNIQUE,
    );
  });

  it("opens a board the solver finishes and the hint's rungs do not as Unreasonable", () => {
    // `rect-hint.test.ts` pins it as one the generator's Easy gate turns
    // away. It has one answer, and its hint stops short of it, which is what
    // a player of it meets and what the tier's name is for.
    expect(tierOf(P({ w: 9, h: 9 }), "c4c5b9c12b2h2k12e2f2_3c12a8l3d5d")).toBe("9x9du");
  });

  it("loads upstream's 10x10 board, which the hint finishes through a line", () => {
    const p = P({ w: 10, h: 10, expandfactor: 0.5 });
    expect(loadVerdict(rectGame, p, "a3c4b3g2_3f16_12n4i4c5b3g21m8h4a4e4c")).toBeNull();
  });

  it("opens a board only the hint's rungs finish as Easy", () => {
    // The rungs look one fit ahead (`starve`), which the solver does not, so
    // they finish this board and the solver stalls on it. A board the hint
    // finishes needs no trial and error, and the answer the mistake check
    // goes by is the search's, which has one here.
    const desc = "b4c2b3a2_2a2b3c4a4b3_6b6h4e2a2a";
    expect(rungsFinish(newState(P(), desc))).toBe(true);
    expect(tierOf(P(), desc)).toBe("7x7de");
  });
});

describe("rect render", () => {
  it("draws the grid and number text on the initial frame", () => {
    const p = P();
    const { desc } = newDesc(p, randomNew("1"));
    const st = newState(p, desc);
    const ds = newDrawState(st, TILE);
    const dr = new RecordingDrawing(rectGame.colors(DEFAULT_BACKGROUND));
    redraw(dr, ds, null, st, 1, rectGame.newUi(st), 0, 0);
    expect(dr.ops.some((o) => o.op === "rect")).toBe(true);
    expect(dr.ops.some((o) => o.op === "text")).toBe(true);
  });

  it("paints the mistake overlay even on an already-drawn tile", () => {
    const { st } = boardWithWrongWall();
    const ds = newDrawState(st, TILE);
    const ui = rectGame.newUi(st);
    const palette = rectGame.colors(DEFAULT_BACKGROUND);
    // Warm the drawstate without the overlay, then repaint with it.
    redraw(new RecordingDrawing(palette), ds, null, st, 1, ui, 0, 0);
    const mistakes = rectGame.findMistakes?.(st) ?? [];
    expect(mistakes.length).toBeGreaterThan(0);
    const dr = new RecordingDrawing(palette);
    redraw(dr, ds, null, st, 1, ui, 0, 0, undefined, mistakes);
    expect(dr.ops.some((o) => o.op === "rect" && o.color === COL_MISTAKE)).toBe(true);

    // A third frame without the overlay clears the red.
    const dr2 = new RecordingDrawing(palette);
    redraw(dr2, ds, null, st, 1, ui, 0, 0);
    expect(dr2.ops.some((o) => o.op === "rect" && o.color === COL_MISTAKE)).toBe(false);
  });

  it("clone is independent of the source state", () => {
    const st = newState(P(), "zw");
    const c = cloneRectState(st);
    c.vedge[0] = 1;
    expect(st.vedge[0]).toBe(0);
  });
});

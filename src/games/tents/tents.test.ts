/**
 * Tier-1 behavioral + tier-2 render tests for the tents port.
 * Byte-match generation/solver agreement lives in tents-differential.test.ts;
 * a render-scenario snapshot in tents-render-scenario.test.ts.
 */
import { describe, expect, it } from "vitest";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descBadCharacter,
  validateDesc,
} from "../../engine/desc-error.ts";
import { UI_UPDATE } from "../../engine/game.ts";
import { paramsError } from "../../engine/params.ts";
import {
  CURSOR_RIGHT,
  cancelDrags,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
} from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import type { Point } from "../../engine/types.ts";
import { newTentsDesc } from "./generator.ts";
import { tentsGame } from "./index.ts";
import { COL_MISTAKE, computeSize, dragXform, newDrawState, redraw } from "./render.ts";
import { tentsSolve } from "./solver.ts";
import {
  BLANK,
  checkCompletion,
  DIFF_EASY,
  DIFF_TRICKY,
  encodeDesc,
  encodeParams,
  executeMove,
  NONTENT,
  newState,
  partnerOf,
  TENT,
  type TentsMove,
  type TentsParams,
  type TentsState,
  TREE,
} from "./state.ts";

function genBoard(
  p: TentsParams,
  seed: string,
): { state: TentsState; soln: Int8Array; aux: string } {
  const { desc, aux } = newTentsDesc(p, randomNew(seed));
  const state = newState(p, desc);
  const puzzle = Int8Array.from(state.grid, (v) => (v === TREE ? TREE : 0));
  const { soln } = tentsSolve(p.w, p.h, puzzle, state.numbers, DIFF_TRICKY);
  return { state, soln, aux };
}

describe("tents params", () => {
  it("round-trips through encode/decode", () => {
    for (const p of [
      { w: 8, h: 8, diff: DIFF_EASY },
      { w: 15, h: 15, diff: DIFF_TRICKY },
      { w: 6, h: 9, diff: DIFF_TRICKY },
    ]) {
      expect(tentsGame.decodeParams(encodeParams(p, true))).toEqual(p);
    }
    expect(tentsGame.decodeParams("10")).toEqual({ w: 10, h: 10, diff: DIFF_EASY });
  });

  it("rejects too-small grids and unknown difficulty", () => {
    const error = (p: TentsParams) => paramsError(tentsGame, p, true);
    expect(error({ w: 3, h: 8, diff: DIFF_EASY })).toBe("Width must be at least 4.");
    expect(error({ w: 8, h: 3, diff: DIFF_EASY })).toBe("Height must be at least 4.");
    expect(error({ w: 8, h: 8, diff: 5 })).toMatch(/^Difficulty must be one of/);
    expect(error({ w: 8, h: 8, diff: DIFF_EASY })).toBeNull();
  });
});

describe("tents desc codec", () => {
  it("round-trips a generated desc", () => {
    const p = { w: 8, h: 8, diff: DIFF_EASY };
    const { desc } = newTentsDesc(p, randomNew("codec-0"));
    expect(validateDesc(tentsGame, p, desc)).toBeNull();
    const { grid, numbers } = newState(p, desc);
    expect(encodeDesc(p.w, p.h, grid, numbers)).toBe(desc);
  });

  it("rejects malformed descs", () => {
    const p = { w: 4, h: 4, diff: DIFF_EASY };
    expect(validateDesc(tentsGame, p, "Q,0,0,0,0,0,0,0,0")).not.toBeNull(); // bad char
    expect(validateDesc(tentsGame, p, "_,0,0,0,0,0,0,0,0")).not.toBeNull(); // too little grid data
    expect(validateDesc(tentsGame, p, "zzza")).not.toBeNull(); // missing numbers
  });

  it("reads exactly what the encoder writes", () => {
    const p = { w: 4, h: 4, diff: DIFF_EASY };
    const zeros = ",0,0,0,0,0,0,0,0";
    expect(validateDesc(tentsGame, p, `p${zeros}`)).toBeNull();
    // Upstream's pre-placed tent, which the encoder never writes.
    expect(validateDesc(tentsGame, p, `o_!${zeros}`)).toBe(descBadCharacter("!"));
    expect(validateDesc(tentsGame, p, "p,0,0,,0,0,0,0,0")).toBe(descBadCharacter(","));
    expect(validateDesc(tentsGame, p, "p,0,5,0,0,0,0,0,0")).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(tentsGame, p, `q${zeros}`)).toBe(DESC_TOO_LONG);
    expect(validateDesc(tentsGame, p, `z${zeros}`)).toBe(DESC_TOO_LONG);
    expect(validateDesc(tentsGame, p, `p${zeros}x`)).toBe(DESC_TOO_LONG);
    expect(validateDesc(tentsGame, p, "p,0,0")).toBe(DESC_TOO_SHORT);
  });
});

describe("tents generator", () => {
  it("produces uniquely-solvable boards at exactly their difficulty", () => {
    for (const [p, seed] of [
      [{ w: 8, h: 8, diff: DIFF_EASY }, "gen-e"],
      [{ w: 8, h: 8, diff: DIFF_TRICKY }, "gen-t"],
      [{ w: 10, h: 10, diff: DIFF_TRICKY }, "gen-t2"],
    ] as const) {
      const { state } = genBoard(p, seed);
      const puzzle = Int8Array.from(state.grid, (v) => (v === TREE ? TREE : 0));
      expect(tentsSolve(p.w, p.h, puzzle, state.numbers, p.diff).ret).toBe(1);
      expect(tentsSolve(p.w, p.h, puzzle, state.numbers, p.diff - 1).ret).toBe(2);
    }
  }, 30_000);

  it("the solution satisfies every completion constraint", () => {
    const p = { w: 10, h: 10, diff: DIFF_EASY };
    const { state, soln } = genBoard(p, "gen-valid");
    const full = Int8Array.from(state.grid);
    for (let i = 0; i < p.w * p.h; i++) {
      if (full[i] !== TREE) full[i] = soln[i] === TENT ? TENT : NONTENT;
    }
    expect(checkCompletion(p.w, p.h, full, state.numbers)).toBe(true);
  });
});

describe("tents completion (executeMove)", () => {
  it("marks the board complete when the solution is applied", () => {
    const p = { w: 8, h: 8, diff: DIFF_EASY };
    const { state, soln } = genBoard(p, "complete-0");
    const tents: number[] = [];
    for (let i = 0; i < p.w * p.h; i++) if (soln[i] === TENT) tents.push(i);
    const done = executeMove(state, { type: "solve", tents });
    expect(tentsGame.status(done)).toBe("solved");
  });

  it("an all-non-tent board is not complete", () => {
    const p = { w: 8, h: 8, diff: DIFF_EASY };
    const { state } = genBoard(p, "complete-1");
    const cleared = executeMove(state, {
      type: "cells",
      cells: [...Array(p.w * p.h).keys()]
        .filter((i) => state.grid[i] !== TREE)
        .map((i) => ({ x: i % p.w, y: Math.floor(i / p.w), v: NONTENT })),
    });
    expect(tentsGame.status(cleared)).toBe("ongoing");
  });
});

describe("tents solve()", () => {
  it("recovers the solution (aux path) and matches the re-solve", () => {
    const p = { w: 8, h: 8, diff: DIFF_EASY };
    const { state, soln, aux } = genBoard(p, "solve-0");
    const res = tentsGame.solve?.(state, state, aux);
    expect(res?.ok).toBe(true);
    if (res?.ok) {
      expect(tentsGame.status(executeMove(state, res.move))).toBe("solved");
      if (res.move.type === "solve") {
        const set = new Set(res.move.tents);
        for (let i = 0; i < p.w * p.h; i++) expect(set.has(i)).toBe(soln[i] === TENT);
      }
    }
  });

  it("recovers without aux (re-solve path)", () => {
    const p = { w: 8, h: 8, diff: DIFF_TRICKY };
    const { state } = genBoard(p, "solve-1");
    const res = tentsGame.solve?.(state, state);
    expect(res?.ok).toBe(true);
    if (res?.ok) expect(tentsGame.status(executeMove(state, res.move))).toBe("solved");
  });
});

describe("tents findMistakes", () => {
  it("flags a wrong tent and a wrong non-tent, not blanks", () => {
    const p = { w: 8, h: 8, diff: DIFF_EASY };
    const { state, soln } = genBoard(p, "mistake-0");
    let notTentIdx = -1;
    let tentIdx = -1;
    for (let i = 0; i < p.w * p.h; i++) {
      if (state.grid[i] === TREE) continue;
      if (soln[i] !== TENT && notTentIdx < 0) notTentIdx = i;
      if (soln[i] === TENT && tentIdx < 0) tentIdx = i;
    }
    const dirty = executeMove(state, {
      type: "cells",
      cells: [
        { x: notTentIdx % p.w, y: Math.floor(notTentIdx / p.w), v: TENT },
        { x: tentIdx % p.w, y: Math.floor(tentIdx / p.w), v: NONTENT },
      ],
    });
    const mistakes = tentsGame.findMistakes?.(dirty) ?? [];
    const keys = new Set(mistakes.map((m) => m.y * p.w + m.x));
    expect(keys.has(notTentIdx)).toBe(true);
    expect(keys.has(tentIdx)).toBe(true);
    expect(mistakes.length).toBe(2);
  });

  it("reports no mistakes for a partially-correct board", () => {
    const p = { w: 8, h: 8, diff: DIFF_EASY };
    const { state, soln } = genBoard(p, "mistake-1");
    const cells: { x: number; y: number; v: number }[] = [];
    let placed = 0;
    for (let i = 0; i < p.w * p.h && placed < 3; i++) {
      if (soln[i] === TENT && state.grid[i] !== TREE) {
        cells.push({ x: i % p.w, y: Math.floor(i / p.w), v: TENT });
        placed++;
      }
    }
    const partial = executeMove(state, { type: "cells", cells });
    expect(tentsGame.findMistakes?.(partial) ?? []).toEqual([]);
  });
});

describe("tents input (drag model)", () => {
  it("left click places a tent then clears it; right click a non-tent", () => {
    const p = { w: 8, h: 8, diff: DIFF_EASY };
    const { state } = genBoard(p, "input-0");
    const ui = tentsGame.newUi(state);
    const ds = newDrawState(state, 32);
    const blank = [...Array(p.w * p.h).keys()].find((i) => state.grid[i] === BLANK);
    expect(blank).toBeDefined();
    const bx = (blank as number) % p.w;
    const by = Math.floor((blank as number) / p.w);
    const px = { x: bx * 32 + 17, y: by * 32 + 17 };

    tentsGame.interpretMove(state, ui, ds, px, LEFT_BUTTON);
    const m1 = tentsGame.interpretMove(state, ui, ds, px, LEFT_RELEASE);
    expect(m1).toMatchObject({ type: "cells", cells: [{ x: bx, y: by, v: TENT }] });
    const s1 = executeMove(state, m1 as never);

    tentsGame.interpretMove(s1, ui, ds, px, LEFT_BUTTON);
    const m2 = tentsGame.interpretMove(s1, ui, ds, px, LEFT_RELEASE);
    expect(m2).toMatchObject({ type: "cells", cells: [{ x: bx, y: by, v: BLANK }] });

    tentsGame.interpretMove(state, ui, ds, px, RIGHT_BUTTON);
    const m3 = tentsGame.interpretMove(state, ui, ds, px, RIGHT_RELEASE);
    expect(m3).toMatchObject({ type: "cells", cells: [{ x: bx, y: by, v: NONTENT }] });
  });

  // The tests below send drag *motion*. Until they were written nothing did:
  // the press/release pair above never moves the pointer, so swapping the two
  // arguments of the drag's anchor passed all 27 tents tests (measured while
  // converting this game to the shared `GridDrag` — `name-the-drag`).
  const TS = 32;

  /** A board, its ui/ds, and a pixel point for a cell center. */
  function dragRig(seed: string) {
    const p = { w: 8, h: 8, diff: DIFF_EASY };
    const { state } = genBoard(p, seed);
    const ui = tentsGame.newUi(state);
    const ds = newDrawState(state, TS);
    const at = (x: number, y: number) => ({ x: x * TS + 17, y: y * TS + 17 });
    return { p, state, ui, ds, at };
  }

  it("a right-drag along a row paints every blank it covers", () => {
    const { p, state, ui, ds, at } = dragRig("drag-row");
    // A row with at least three blanks in a row to sweep.
    let row = -1;
    let from = -1;
    for (let y = 0; y < p.h && row < 0; y++) {
      for (let x = 0; x + 2 < p.w; x++) {
        if ([0, 1, 2].every((k) => state.grid[y * p.w + x + k] === BLANK)) {
          row = y;
          from = x;
          break;
        }
      }
    }
    expect(row).toBeGreaterThanOrEqual(0);

    tentsGame.interpretMove(state, ui, ds, at(from, row), RIGHT_BUTTON);
    tentsGame.interpretMove(state, ui, ds, at(from + 2, row), RIGHT_DRAG);
    const move = tentsGame.interpretMove(
      state,
      ui,
      ds,
      at(from + 2, row),
      RIGHT_RELEASE,
    );

    expect(move).toMatchObject({ type: "cells" });
    const cells = (move as { cells: readonly { x: number; y: number; v: number }[] })
      .cells;
    // Exactly the three swept cells, on the swept row, all turned to non-tent.
    expect(cells.map((c) => `${c.x},${c.y}`).sort()).toEqual(
      [from, from + 1, from + 2].map((x) => `${x},${row}`).sort(),
    );
    expect(cells.every((c) => c.v === NONTENT)).toBe(true);
  });

  it("snaps the drag to one axis, so a diagonal sweep stays in a line", () => {
    // Upstream limits a drag to one row or column: whichever coordinate moved
    // *less* is pulled back to the anchor. A diagonal that is mostly sideways
    // is therefore a row drag, and touches no other row.
    const { state, ui, ds, at } = dragRig("drag-snap");
    tentsGame.interpretMove(state, ui, ds, at(1, 3), RIGHT_BUTTON);
    // 4 across, 1 down — the vertical component is the smaller, so it snaps.
    tentsGame.interpretMove(state, ui, ds, at(5, 4), RIGHT_DRAG);
    expect(ui.drag.sy).toBe(3);
    expect(ui.drag.ey).toBe(3);
    expect(ui.drag.ex).toBe(5);

    // And the other way round: mostly downward snaps the column.
    tentsGame.interpretMove(state, ui, ds, at(1, 3), RIGHT_BUTTON);
    tentsGame.interpretMove(state, ui, ds, at(2, 7), RIGHT_DRAG);
    expect(ui.drag.sx).toBe(1);
    expect(ui.drag.ex).toBe(1);
    expect(ui.drag.ey).toBe(7);
  });

  it("commits nothing when the drag is released off the grid", () => {
    // `dragOk` is not liveness — it says the pointer is over a valid cell right
    // now. A release while it is false abandons the drag.
    const { state, ui, ds, at } = dragRig("drag-off");
    tentsGame.interpretMove(state, ui, ds, at(2, 2), RIGHT_BUTTON);
    tentsGame.interpretMove(state, ui, ds, { x: -50, y: -50 }, RIGHT_DRAG);
    expect(ui.dragOk).toBe(false);
    const move = tentsGame.interpretMove(
      state,
      ui,
      ds,
      { x: -50, y: -50 },
      RIGHT_RELEASE,
    );
    expect(move).toBe(UI_UPDATE);
    expect(ui.drag.live).toBe(false);
  });

  it("stops previewing a drag the board changed under", () => {
    // Found by playing, not by a test: undo mid-drag (the rail's Undo is
    // reachable with the button still down) and Tents went on painting the
    // preview until the player let go, because `redraw` keyed it off
    // `dragButton` — which the engine's cancel does not touch — rather than off
    // `drag.live`, which it does.
    //
    // Deterministic here because the board and the coordinates are known. The
    // collection-wide version of this was attempted and withdrawn; see
    // `engine/drag-cancel.test.ts` for why.
    const p = { w: 8, h: 8, diff: DIFF_EASY };
    const { state } = genBoard(p, "preview-cancel");
    const ui = tentsGame.newUi(state);
    const ds = newDrawState(state, TS);
    const at = (x: number, y: number) => ({ x: x * TS + 17, y: y * TS + 17 });

    const frame = () => {
      const dr = new RecordingDrawing(tentsGame.colors(DEFAULT_BACKGROUND));
      tentsGame.redraw(dr, newDrawState(state, TS), null, state, 1, ui, 0, 0);
      return JSON.stringify(dr.ops);
    };

    const undragged = frame();
    tentsGame.interpretMove(state, ui, ds, at(1, 3), RIGHT_BUTTON);
    tentsGame.interpretMove(state, ui, ds, at(4, 3), RIGHT_DRAG);
    expect(frame(), "the drag should preview something to lose").not.toBe(undragged);

    // Exactly what the midend does when it replaces the state — Tents declares
    // no `changedState`, so the engine's sweep is the whole of its protection.
    expect(cancelDrags(ui)).toBe(1);
    expect(ui.drag.live).toBe(false);
    expect(frame(), "a canceled drag is still previewed").toBe(undragged);
  });

  // NOT GUARDED, deliberately: `redraw`'s *second* drag gate, which transforms
  // the drag's start cell before computing errors so a press gives instant
  // "that would be wrong" feedback. It is fixed the same way (it asks
  // `drag.live` now), but a test for it could not be made to discriminate:
  // mutating that gate alone leaves the cell loop correct, so the cell still
  // renders blank and the stray error flag has nothing to show on. A test that
  // passes either way is decoration, so there is a note here instead of one.

  it("leaves no drag running after a release", () => {
    // The engine will cancel a live drag on a state change; a drag that is
    // still marked live after its own release would be canceled spuriously.
    const { state, ui, ds, at } = dragRig("drag-end");
    tentsGame.interpretMove(state, ui, ds, at(2, 2), LEFT_BUTTON);
    expect(ui.drag.live).toBe(true);
    tentsGame.interpretMove(state, ui, ds, at(2, 2), LEFT_RELEASE);
    expect(ui.drag.live).toBe(false);
  });
});

describe("the link notation", () => {
  const TS = 32;
  const at = (x: number, y: number) => ({ x: x * TS + 17, y: y * TS + 17 });

  /** A board with an open square beside a tree, the square and the tree. */
  function rig(seed: string) {
    const p = { w: 8, h: 8, diff: DIFF_EASY };
    const { state } = genBoard(p, seed);
    for (let i = 0; i < p.w * p.h; i++) {
      if (state.grid[i] !== TREE) continue;
      const x = i % p.w;
      const y = Math.floor(i / p.w);
      if (x + 1 < p.w && state.grid[i + 1] === BLANK) {
        const ui = tentsGame.newUi(state);
        return {
          p,
          state,
          ui,
          ds: newDrawState(state, TS),
          tree: { x, y },
          open: { x: x + 1, y },
        };
      }
    }
    throw new Error("no tree with an open square to its right");
  }

  function drag(r: ReturnType<typeof rig>, s: TentsState, from: Point, to: Point) {
    tentsGame.interpretMove(s, r.ui, r.ds, at(from.x, from.y), LEFT_BUTTON);
    tentsGame.interpretMove(s, r.ui, r.ds, at(to.x, to.y), LEFT_DRAG);
    return tentsGame.interpretMove(s, r.ui, r.ds, at(to.x, to.y), LEFT_RELEASE);
  }

  it("a drag from a tree to an open square places the tent joined to it", () => {
    const r = rig("link-a");
    const m = drag(r, r.state, r.tree, r.open);
    expect(m).toMatchObject({ type: "link", on: true });
    const s = executeMove(r.state, m as TentsMove);
    const tent = r.open.y * r.p.w + r.open.x;
    expect(s.grid[tent]).toBe(TENT);
    expect(partnerOf(r.p.w, s.links, tent)).toBe(r.tree.y * r.p.w + r.tree.x);
  });

  it("works from the open square's end, and a second drag parts them", () => {
    const r = rig("link-b");
    const m = drag(r, r.state, r.open, r.tree);
    const s = executeMove(r.state, m as TentsMove);
    const tent = r.open.y * r.p.w + r.open.x;
    expect(partnerOf(r.p.w, s.links, tent)).toBe(r.tree.y * r.p.w + r.tree.x);
    const parted = executeMove(s, drag(r, s, r.tree, r.open) as TentsMove);
    expect(parted.grid[tent]).toBe(TENT);
    expect(partnerOf(r.p.w, parted.links, tent)).toBe(-1);
  });

  it("previews the tent while the drag is held", () => {
    const r = rig("link-c");
    tentsGame.interpretMove(r.state, r.ui, r.ds, at(r.tree.x, r.tree.y), LEFT_BUTTON);
    tentsGame.interpretMove(r.state, r.ui, r.ds, at(r.open.x, r.open.y), LEFT_DRAG);
    expect(dragXform(r.ui, r.state, r.open.x, r.open.y)).toBe(TENT);
  });

  it("the keyboard does the same with L and an arrow", () => {
    const r = rig("link-d");
    r.ui.cursor.visible = true;
    r.ui.cursor.x = r.tree.x;
    r.ui.cursor.y = r.tree.y;
    expect(
      tentsGame.interpretMove(r.state, r.ui, r.ds, { x: 0, y: 0 }, "l".charCodeAt(0)),
    ).toBe(UI_UPDATE);
    const m = tentsGame.interpretMove(
      r.state,
      r.ui,
      r.ds,
      { x: 0, y: 0 },
      CURSOR_RIGHT,
    );
    expect(m).toMatchObject({ type: "link", on: true });
    expect(r.ui.cursor.x).toBe(r.open.x);
    expect(r.ui.linkArmed).toBe(false);
  });

  it("a stone's-throw wobble off a square that is no pair still clicks", () => {
    // Two open squares side by side: not the link gesture, so the old
    // click-at-the-start stands.
    const r = rig("link-e");
    const { grid } = r.state;
    const i = [...grid.keys()].find(
      (k) => k % r.p.w < r.p.w - 1 && grid[k] === BLANK && grid[k + 1] === BLANK,
    );
    if (i === undefined) throw new Error("no two open squares side by side");
    const from = { x: i % r.p.w, y: Math.floor(i / r.p.w) };
    const m = drag(r, r.state, from, { x: from.x + 1, y: from.y });
    expect(m).toMatchObject({ type: "cells", cells: [{ ...from, v: TENT }] });
  });
});

describe("tents render (tier 2)", () => {
  it("draws the mistake overlay even when the tile was already drawn", () => {
    const p = { w: 8, h: 8, diff: DIFF_EASY };
    const { state, soln } = genBoard(p, "render-0");
    let idx = -1;
    for (let i = 0; i < p.w * p.h; i++) {
      if (state.grid[i] !== TREE && soln[i] !== TENT) {
        idx = i;
        break;
      }
    }
    const wrong = executeMove(state, {
      type: "cells",
      cells: [{ x: idx % p.w, y: Math.floor(idx / p.w), v: TENT }],
    });
    const mistakes = tentsGame.findMistakes?.(wrong) ?? [];
    expect(mistakes.length).toBe(1);

    const rec = new RecordingDrawing(tentsGame.colors([0.9, 0.9, 0.9]));
    const ds = newDrawState(wrong, 32);
    const ui = tentsGame.newUi(wrong);

    // Paint the tent tile without the overlay, then again WITH it (no tile-
    // value change) — the overlay must still appear on the second paint.
    redraw(rec, ds, null, wrong, 1, ui, 0, 0, undefined, undefined);
    rec.ops.length = 0;
    redraw(rec, ds, null, wrong, 1, ui, 0, 0, undefined, mistakes);

    expect(rec.ops.some((o) => o.op === "rect" && o.color === COL_MISTAKE)).toBe(true);
  });

  it("computeSize matches the NARROW_BORDERS geometry", () => {
    expect(computeSize({ w: 8, h: 8, diff: DIFF_EASY }, 32)).toEqual({
      w: 1 + (32 + 2) + 32 * 8,
      h: 1 + (32 + 2) + 32 * 8,
    });
  });
});

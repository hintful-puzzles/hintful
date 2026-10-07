/**
 * Tier-2.5 render scenarios for tents: drive a real Midend to a target frame
 * and capture `redraw`. Targeted op assertions (grid lines, a tree, the edge
 * numbers, the adjacency error diamond, the findMistakes overlay) plus one
 * snapshot so a render regression is a reviewable text diff (`vitest -u`
 * re-baselines an intended change; the targeted assertions survive a careless
 * `-u`).
 */
import { describe, expect, it } from "vitest";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintKindPins } from "../../engine/testing/hint-positions.ts";
import type { DrawOp } from "../../engine/testing/recording-drawing.ts";
import {
  renderPinnedHint,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { LINK, NUMBER } from "./hint-marks.ts";
import { tentsGame } from "./index.ts";
import {
  COL_ERROR,
  COL_GRID,
  COL_HINT,
  COL_LINK,
  COL_MISTAKE,
  COL_TREELEAF,
} from "./render.ts";
import { tentsSolve } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_TRICKY,
  encodeParams,
  newState,
  R,
  TENT,
  type TentsMove,
  type TentsParams,
  TREE,
} from "./state.ts";

function board(p: TentsParams, seed: string) {
  const { desc } = tentsGame.newDesc(p, randomNew(seed));
  const state = newState(p, desc);
  const puzzle = Int8Array.from(state.grid, (v) => (v === TREE ? TREE : 0));
  const { soln, links } = tentsSolve(p.w, p.h, puzzle, state.numbers, DIFF_TRICKY);
  return { id: `${encodeParams(p, true)}:${desc}`, state, soln, links };
}

/** A Tricky position for each premise whose frame is asserted below: the
 * step a plan opens with there rests on it, since that is the step a frame
 * shows. */
const pinned = describeHintKindPins({
  game: tentsGame,
  params: [{ w: 10, h: 10, diff: DIFF_TRICKY }],
  kinds: {
    lineCount: (step) => step.rung === "lineCount",
    lineNeighbors: (step) => step.rung === "lineNeighbors",
    tentLink: (step) => step.rung === "tentLink",
  },
  pins: {
    /** Held on 112 of 482 positions walked. */
    lineCount: {
      id: "10x10dt:agaa_aidlcldbdbcadcbd,3,1,2,2,2,1,4,1,1,3,1,4,1,3,1,3,1,1,4,1",
      moves:
        '[{"type":"cells","cells":[{"x":5,"y":0,"v":3},{"x":7,"y":0,"v":3},{"x":8,"y":1,"v":3},{"x":0,"y":2,"v":3},{"x":2,"y":2,"v":3},{"x":8,"y":2,"v":3},{"x":9,"y":2,"v":3},{"x":3,"y":3,"v":3},{"x":5,"y":3,"v":3},{"x":7,"y":3,"v":3},{"x":9,"y":3,"v":3},{"x":0,"y":4,"v":3},{"x":2,"y":4,"v":3},{"x":6,"y":4,"v":3},{"x":0,"y":5,"v":3},{"x":2,"y":5,"v":3},{"x":3,"y":5,"v":3},{"x":5,"y":5,"v":3},{"x":7,"y":5,"v":3},{"x":3,"y":6,"v":3},{"x":0,"y":7,"v":3},{"x":2,"y":7,"v":3},{"x":6,"y":8,"v":3},{"x":0,"y":9,"v":3},{"x":7,"y":9,"v":3},{"x":9,"y":9,"v":3}]}]',
    },
    /** Held on 26 of 482 positions walked. */
    lineNeighbors: {
      id: "10x10dt:cbcbb_aijdabakdffdbg_,3,1,2,3,1,2,1,2,2,3,4,1,2,2,3,1,2,2,1,2",
      moves:
        '[{"type":"cells","cells":[{"x":1,"y":0,"v":3},{"x":8,"y":0,"v":3},{"x":1,"y":2,"v":3},{"x":2,"y":2,"v":3},{"x":4,"y":2,"v":3},{"x":5,"y":2,"v":3},{"x":1,"y":3,"v":3},{"x":2,"y":3,"v":3},{"x":3,"y":3,"v":3},{"x":4,"y":3,"v":3},{"x":6,"y":3,"v":3},{"x":8,"y":3,"v":3},{"x":3,"y":4,"v":3},{"x":9,"y":4,"v":3},{"x":6,"y":5,"v":3},{"x":8,"y":5,"v":3},{"x":1,"y":6,"v":3},{"x":7,"y":6,"v":3},{"x":0,"y":7,"v":3},{"x":1,"y":7,"v":3},{"x":2,"y":7,"v":3},{"x":0,"y":8,"v":3},{"x":5,"y":8,"v":3},{"x":4,"y":9,"v":3},{"x":5,"y":9,"v":3},{"x":6,"y":9,"v":3},{"x":7,"y":9,"v":3}]}]',
    },
    /** Held on 4 of 482 positions walked. */
    tentLink: {
      id: "10x10dt:cea_ccbcqgfbd_jg_abac,4,1,1,3,2,2,1,2,1,3,3,1,2,2,1,3,0,3,1,4",
      moves:
        '[{"type":"cells","cells":[{"x":0,"y":0,"v":3},{"x":5,"y":0,"v":3},{"x":7,"y":0,"v":3},{"x":4,"y":1,"v":3},{"x":8,"y":1,"v":3},{"x":5,"y":2,"v":3},{"x":9,"y":2,"v":3},{"x":1,"y":3,"v":3},{"x":2,"y":3,"v":3},{"x":4,"y":3,"v":3},{"x":6,"y":3,"v":3},{"x":8,"y":3,"v":3},{"x":9,"y":3,"v":3},{"x":0,"y":4,"v":3},{"x":1,"y":4,"v":3},{"x":2,"y":4,"v":3},{"x":7,"y":4,"v":3},{"x":8,"y":4,"v":3},{"x":9,"y":4,"v":3},{"x":1,"y":5,"v":3},{"x":6,"y":5,"v":3},{"x":7,"y":5,"v":3},{"x":5,"y":6,"v":3},{"x":6,"y":6,"v":3},{"x":1,"y":7,"v":3},{"x":2,"y":7,"v":3},{"x":4,"y":7,"v":3},{"x":5,"y":7,"v":3},{"x":6,"y":7,"v":3},{"x":7,"y":7,"v":3},{"x":2,"y":8,"v":3},{"x":3,"y":8,"v":3},{"x":5,"y":8,"v":3}]},{"type":"cells","cells":[{"x":1,"y":6,"v":3},{"x":2,"y":6,"v":3},{"x":4,"y":6,"v":3},{"x":7,"y":6,"v":3}]},{"type":"link","x":3,"y":7,"d":1,"on":true},{"type":"cells","cells":[{"x":4,"y":8,"v":3}]},{"type":"cells","cells":[{"x":0,"y":7,"v":2}]},{"type":"cells","cells":[{"x":1,"y":8,"v":3}]},{"type":"cells","cells":[{"x":1,"y":2,"v":3}]},{"type":"cells","cells":[{"x":1,"y":0,"v":2}]},{"type":"cells","cells":[{"x":2,"y":0,"v":3},{"x":0,"y":1,"v":3}]},{"type":"link","x":0,"y":3,"d":1,"on":true},{"type":"cells","cells":[{"x":0,"y":5,"v":2},{"x":0,"y":9,"v":2}]}]',
    },
  },
});

describe("tents render scenarios", () => {
  it("opener frame: grid lines, a tree, edge numbers", () => {
    const p = { w: 8, h: 8, diff: DIFF_EASY };
    const { id } = board(p, "trs-0");
    const { recording, size } = renderScenario({ game: tentsGame, id });

    // Grid lines in COL_GRID.
    expect(recording.ops.some((o) => o.op === "line" && o.color === COL_GRID)).toBe(
      true,
    );
    // A tree leaf (green circle).
    expect(
      recording.ops.some((o) => o.op === "circle" && o.fill === COL_TREELEAF),
    ).toBe(true);
    // The edge numbers (text).
    expect(recording.ops.some((o) => o.op === "text")).toBe(true);
    expect(size.w).toBeGreaterThan(0);

    expect(recording.ops).toMatchSnapshot();
  });

  it("adjacency error frame: two adjacent tents draw a red error diamond", () => {
    const p = { w: 8, h: 8, diff: DIFF_EASY };
    const { id, state } = board(p, "trs-adj");
    // Find two horizontally-adjacent non-tree cells.
    let ax = -1;
    let ay = -1;
    for (let y = 0; y < p.h && ax < 0; y++) {
      for (let x = 0; x + 1 < p.w; x++) {
        if (state.grid[y * p.w + x] !== TREE && state.grid[y * p.w + x + 1] !== TREE) {
          ax = x;
          ay = y;
          break;
        }
      }
    }
    const moves: TentsMove[] = [
      { type: "cells", cells: [{ x: ax, y: ay, v: TENT }] },
      { type: "cells", cells: [{ x: ax + 1, y: ay, v: TENT }] },
    ];
    const { recording } = renderScenario({ game: tentsGame, id, moves });

    // The adjacency diamond is a polygon filled COL_ERROR.
    expect(recording.ops.some((o) => o.op === "polygon" && o.fill === COL_ERROR)).toBe(
      true,
    );
  });

  /** The frame a pinned position's hint draws, through a real `Midend`. */
  const frame = (kind: Parameters<typeof pinned>[0]) => {
    const result = renderPinnedHint(tentsGame, pinned(kind));
    return result;
  };

  it("line-count frame: the line hatched, its clue in the action color, targets ringed", () => {
    const { recording, hint } = frame("lineCount");
    expect(stepMarks(hint).of("outline", NUMBER)).toHaveLength(1);
    expect(hint?.explanation).toMatch(/^This (row|column) /);
    expect(recording.ops.some((o) => o.op === "hatch" && o.color === COL_HINT)).toBe(
      true,
    );
    expect(recording.ops.some((o) => o.op === "text" && o.color === COL_HINT)).toBe(
      true,
    );
    expect(recording.ops.some((o) => o.op === "rect" && o.color === COL_HINT)).toBe(
      true,
    );
    expect(recording.ops).toMatchSnapshot();
  });

  it("line-neighbors frame: the counted line hatched, the squares beside it ringed", () => {
    const { recording, hint } = frame("lineNeighbors");
    const marks = stepMarks(hint);
    expect(hint?.explanation).toMatch(/^Wherever this (row|column)/);
    // The ringed squares lie off the hatched line.
    const striped = new Set(marks.of("stripes", CELL).map((p) => `${p.x},${p.y}`));
    const targets = marks.of("ring", CELL);
    expect(striped.size).toBeGreaterThan(0);
    expect(targets.length).toBeGreaterThan(0);
    expect(targets.every((p) => !striped.has(`${p.x},${p.y}`))).toBe(true);
    expect(recording.ops.some((o) => o.op === "hatch" && o.color === COL_HINT)).toBe(
      true,
    );
    expect(recording.ops).toMatchSnapshot();
  });

  it("link frame: the link the step asks for drawn in the action color", () => {
    const { recording, hint } = frame("tentLink");
    const marks = stepMarks(hint);
    expect(hint?.move).toMatchObject({ type: "link", on: true });
    expect(marks.of("ring", LINK)).toHaveLength(1);
    expect(marks.of("ring", CELL)).toHaveLength(2);
    // The link's two halves: thin, and in the hint's color.
    const bars = recording.ops.filter(
      (o) => o.op === "rect" && o.color === COL_HINT && Math.min(o.w, o.h) <= 3,
    );
    expect(bars.length).toBeGreaterThanOrEqual(2);
  });

  it("a player's link is ink, and a wrong one takes the mistake color", () => {
    const p = { w: 8, h: 8, diff: DIFF_EASY };
    const { id, soln, links } = board(p, "trs-link");
    const tent = [...soln.keys()].find((i) => soln[i] === TENT);
    if (tent === undefined) throw new Error("no tent");
    const x = tent % p.w;
    const y = Math.floor(tent / p.w);
    const thin = (ops: DrawOp[], color: number) =>
      ops.filter(
        (o) =>
          o.op === "rect" &&
          o.color === color &&
          Math.min(o.w, o.h) <= 3 &&
          Math.max(o.w, o.h) > 3,
      );

    // The solution's own pairing: no mistake, and the link in ink.
    const right = renderScenario({
      game: tentsGame,
      id,
      moves: [{ type: "link", x, y, d: links[tent], on: true }],
      showMistakes: true,
    });
    expect(right.mistakeCount).toBe(0);
    expect(thin(right.recording.ops, COL_LINK).length).toBeGreaterThanOrEqual(2);

    // The tent joined to no tree beside it at all would be refused by the
    // move, so a wrong link is made from a tree whose tent lies elsewhere: join
    // it to an open square beside it, which places a wrong tent there too.
    for (let i = 0; i < soln.length; i++) {
      if (soln[i] !== TREE || i % p.w === p.w - 1 || soln[i + 1] === TENT) continue;
      if (soln[i + 1] === TREE) continue;
      const wrong = renderScenario({
        game: tentsGame,
        id,
        moves: [{ type: "link", x: i % p.w, y: Math.floor(i / p.w), d: R, on: true }],
        showMistakes: true,
      });
      expect(wrong.mistakeCount).toBeGreaterThanOrEqual(2);
      expect(thin(wrong.recording.ops, COL_MISTAKE).length).toBeGreaterThanOrEqual(2);
      return;
    }
    throw new Error("no tree with a non-tent square to its right");
  });

  it("mistake frame: a wrong tent draws the COL_MISTAKE overlay", () => {
    const p = { w: 8, h: 8, diff: DIFF_EASY };
    const { id, state, soln } = board(p, "trs-mis");
    let idx = -1;
    for (let i = 0; i < p.w * p.h; i++) {
      if (state.grid[i] !== TREE && soln[i] !== TENT) {
        idx = i;
        break;
      }
    }
    const moves: TentsMove[] = [
      { type: "cells", cells: [{ x: idx % p.w, y: Math.floor(idx / p.w), v: TENT }] },
    ];
    const { recording, mistakeCount } = renderScenario({
      game: tentsGame,
      id,
      moves,
      showMistakes: true,
    });
    expect(mistakeCount).toBeGreaterThanOrEqual(1);
    expect(recording.ops.some((o) => o.op === "rect" && o.color === COL_MISTAKE)).toBe(
      true,
    );
  });
});

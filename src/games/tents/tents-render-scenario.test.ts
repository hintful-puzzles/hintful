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
import type { DrawOp } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { tentsPlan } from "./hint.ts";
import { LINK, NUMBER } from "./hint-marks.ts";
import { tentsGame } from "./index.ts";
import { COL_ERROR, COL_GRID, COL_HINT, COL_MISTAKE, COL_TREELEAF } from "./render.ts";
import { type TentsReason, tentsSolve } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_TRICKY,
  encodeParams,
  executeMove,
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

  /**
   * The moves that reach the first firing of `kind` on some Tricky board, by
   * following the hint: the frame then shows that firing as its first step.
   */
  function reach(kind: TentsReason["kind"]): { id: string; moves: TentsMove[] } {
    for (let s = 0; s < 40; s++) {
      const p = { w: 10, h: 10, diff: DIFF_TRICKY };
      const { id, state: start } = board(p, `trs-${kind}-${s}`);
      let state = start;
      const moves: TentsMove[] = [];
      for (let asks = 0; asks < 100 && !state.completed; asks++) {
        const { plan } = tentsPlan(state);
        if (plan.length === 0) break;
        for (const { firing, steps } of plan) {
          if (firing.reason.kind === kind) return { id, moves };
          for (const step of steps) {
            moves.push(step.move);
            state = executeMove(state, step.move);
          }
        }
      }
    }
    throw new Error(`no ${kind} firing within 40 boards`);
  }

  const frame = (kind: TentsReason["kind"]) => {
    const { id, moves } = reach(kind);
    return renderScenario({ game: tentsGame, id, moves, showHint: true });
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
    expect(thin(right.recording.ops, COL_GRID).length).toBeGreaterThanOrEqual(2);

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

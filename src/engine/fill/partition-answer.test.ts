/**
 * A partition of the cells stated as an answer on the edges, on the
 * `fencing` fixture: sampled as the walls between the parts of a division,
 * drawn as walls, played and hinted by the fill engine.
 */

import { describe, expect, it } from "vitest";
import * as fencing from "../../generated/engine/testing/fixtures/fencing/fencing.compiled.ts";
import { Dsf } from "../board/dsf.ts";
import { descValue } from "../contract/desc-error.ts";
import { UI_UPDATE } from "../contract/game.ts";
import { LEFT_BUTTON, LEFT_RELEASE } from "../input/pointer.ts";
import { randomNew } from "../random/index.ts";
import type { GridSpace } from "../solve/describe-runtime.ts";
import { walkHints } from "../testing/hint-walk.ts";
import { renderScenario } from "../testing/render-scenario.ts";
import { encodeAnswer } from "./answer.ts";
import { newBoard, paramSpaceOf, solveBoard } from "./board.ts";
import { dealFill } from "./deal.ts";
import { decodeDesc } from "./desc.ts";
import { pointOfElement } from "./edge-target.ts";
import { fillGame } from "./game.ts";
import { fillInput, newFillUi } from "./play.ts";
import { fillSlots } from "./render/palette.ts";
import { wallsOf } from "./sample.ts";

const WALL = 1;
const OPEN = 2;

/** Each cell's region, the squares the open edges join. */
function regionsOf(sp: GridSpace, values: Uint8Array): Dsf {
  const dsf = new Dsf(sp.cells.length);
  for (const e of sp.edges)
    if (values[e] === OPEN) dsf.merge(sp.edgeEnds[2 * e], sp.edgeEnds[2 * e + 1]);
  return dsf;
}

/** A `w` by `h` board dealt from `seed`: its desc, its answer and its board. */
function dealt(seed: string, w: number, h: number) {
  const p = { w, h, diff: fencing.TIER.easy };
  const { desc, aux } = dealFill(fencing, fencing.deal, p, randomNew(seed));
  const sp = paramSpaceOf(fencing, p);
  const board = newBoard(
    fencing,
    w,
    h,
    descValue(decodeDesc(fencing.deal, sp, fencing.clueMax, desc)),
  );
  return { id: `${w}x${h}:${desc}`, aux, sp, board };
}

describe("a partition as an answer on the edges", () => {
  it("paints a wall between two parts and none inside one", () => {
    const sp = paramSpaceOf(fencing, { w: 3, h: 3 });
    const g = wallsOf(
      { walls: { division: { equal: 3 }, value: WALL, rest: OPEN } },
      sp,
      Int32Array.from(sp.cells, (c) => Math.floor(c / 3)),
    );
    expect(g.length).toBe(sp.edges.length);
    for (const e of sp.edges) {
      const [a, b] = [sp.edgeEnds[2 * e], sp.edgeEnds[2 * e + 1]];
      expect(g[e]).toBe(Math.floor(a / 3) === Math.floor(b / 3) ? OPEN : WALL);
    }
    // The rim's walls count: a row's ends have three, its middle two.
    expect(Array.from(fencing.deriveClues(g, sp).number.v)).toEqual([
      3, 2, 3, 3, 2, 3, 3, 2, 3,
    ]);
  });

  it("is dealt as regions of three, which the ladder finishes on", () => {
    let boards = 0;
    for (const seed of ["fence-a", "fence-b", "fence-c", "fence-d"]) {
      const { aux, sp, board } = dealt(seed, 6, 4);
      const got = solveBoard(fencing, board, fencing.TIER.easy);
      expect(got.verdict).toBe("solved");
      expect(encodeAnswer(got.values)).toBe(aux);
      const dsf = regionsOf(sp, got.values);
      for (const c of sp.cells) expect(dsf.size(c)).toBe(3);
      // A wall stands between two squares exactly where their regions differ.
      for (const e of sp.edges)
        expect(got.values[e] === WALL).toBe(
          !dsf.equivalent(sp.edgeEnds[2 * e], sp.edgeEnds[2 * e + 1]),
        );
      boards++;
    }
    expect(boards).toBe(4);
  });

  it("refuses a board that regions of three do not tile", () => {
    const game = fillGame("fencing", fencing);
    const params = (w: number, h: number) => ({ ...game.defaultParams(), w, h });
    expect(game.validateParams?.(params(4, 4), true)).toBe(
      "The region size must divide the number of squares, 16.",
    );
    expect(game.validateParams?.(params(4, 3), true)).toBeNull();
  });

  it("is drawn with each wall's two squares drawing its half, and the rim a wall", () => {
    const { id, sp } = dealt("fence-draw", 3, 4);
    const game = fillGame("fencing", fencing);
    const ink = fillSlots(fencing.play, true).edgeByValue.get(WALL)?.slot[0] ?? -1;
    const walls = (moves: { set: number[] }[]) =>
      renderScenario({ game, id, moves }).recording.ops.filter(
        (o) => o.op === "rect" && o.color === ink,
      ).length;
    expect(walls([{ set: [sp.edgeOf(0, 3), WALL] }]) - walls([])).toBe(2);
    // Each of the 3 by 4 board's 14 sides on the rim.
    expect(walls([])).toBe(14);
  });

  it("is played by a click on an edge, which builds a wall", () => {
    const { sp, board } = dealt("fence-play", 3, 4);
    const ds = { tileSize: 20 };
    const input = fillInput<fencing.Dealt, typeof ds>(fencing, fencing.play, () => 0);
    const ui = fillGame("fencing", fencing).newUi(board);
    const at = input.targetVerbs.geometry.pointAt(
      board,
      ds,
      pointOfElement(sp, sp.edgeOf(1, 4)),
      newFillUi(),
    );
    const got = input.interpretMove(board, ui, ds, at, LEFT_BUTTON);
    input.interpretMove(board, ui, ds, at, LEFT_RELEASE);
    expect(got !== null && got !== UI_UPDATE && "set" in got ? got.set : null).toEqual([
      sp.edgeOf(1, 4),
      WALL,
    ]);
  });

  it("is hinted to the finish, a region's size among the reasons", () => {
    const game = fillGame("fencing", fencing);
    const words: string[] = [];
    let solved = 0;
    const { boards } = walkHints(
      game,
      { steps: 400 },
      {
        board: (b) => {
          b.observed.notes.length = 0;
        },
        played: (step, _i, b) => {
          words.push(step.explanation);
          if (b.observed.last("game-state-change")?.status === "solved") solved++;
        },
      },
    );
    expect(boards).toBeGreaterThan(0);
    expect(solved).toBe(boards);
    expect(words.some((w) => /region/.test(w))).toBe(true);
  });
});

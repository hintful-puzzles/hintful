/**
 * A fill game of two alike pieces, on the `pairing` fixture: the click cycle
 * and digit keys, the givens dealt as fixed cells and written as upstream's
 * dot runs, a modifier in the params, the menu's boards, the answer built by
 * the ladder and its givens hidden, and the pieces and line-shaped live
 * errors the board draws. A piece drawn whole, which does not grow, is the
 * `linking` fixture's.
 */

import { describe, expect, it } from "vitest";
import * as linking from "../../generated/engine/testing/fixtures/linking/linking.compiled.ts";
import * as pairing from "../../generated/engine/testing/fixtures/pairing/pairing.compiled.ts";
import { givenSurface } from "../color/palette.ts";
import { COL_ERROR } from "../color/roles.ts";
import { descValue } from "../contract/desc-error.ts";
import { UI_UPDATE } from "../contract/game.ts";
import { presetGrid } from "../game-id/preset-grid.ts";
import {
  LEFT_BUTTON,
  LEFT_RELEASE,
  RIGHT_BUTTON,
  RIGHT_RELEASE,
} from "../input/pointer.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { clueList } from "../solve/describe-runtime.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import {
  type FillBoard,
  newBoard,
  paramSpaceOf,
  solveBoard,
  spaceOf,
} from "./board.ts";
import { dealFill } from "./deal.ts";
import { decodeDesc, encodeDesc } from "./desc.ts";
import { applyEdit, type Edit } from "./edit.ts";
import { fillGame } from "./game.ts";
import { type FillParams, fillParams } from "./game-id.ts";
import { fillInput, newFillUi } from "./play.ts";
import { PLACE_ANIM_TIME } from "./render/tile.ts";
import { fillRender } from "./render.ts";

const BLOCK = 1;
const DISC = 2;
const W = 6;
const TS = 32;
type Board = FillBoard<pairing.Dealt>;

/** A 6x6 board with a given at each of `givens`' cells. */
function board(givens: Record<number, number> = {}, variations: string[] = []): Board {
  const at = Object.keys(givens).map(Number);
  return newBoard(
    pairing,
    W,
    W,
    {
      given: clueList(
        at,
        at.map((c) => givens[c]),
        W * W,
      ),
    },
    variations,
  );
}

const game = fillGame("pairing", pairing);

const read = (desc: string) =>
  descValue(
    decodeDesc<pairing.Dealt>(
      pairing.deal,
      paramSpaceOf(pairing, { w: W, h: W }),
      pairing.clueMax,
      desc,
    ),
  );

describe("a fill game of two alike pieces", () => {
  it("cycles a cell round empty and both pieces, the right button the other way", () => {
    const ds = { tileSize: TS };
    const input = fillInput<pairing.Dealt, typeof ds>(pairing, pairing.play, () => 0);
    const ui = newFillUi();
    const center = { x: TS / 2, y: TS / 2 };
    const clicks = (b: Board, button: number, release: number): number[] => {
      const seen: number[] = [];
      for (let k = 0; k < 3; k++) {
        // A sweep's press makes the edit, and its release ends the stroke.
        for (const at of [button, release]) {
          const got = input.interpretMove(b, ui, ds, center, at);
          if (got !== null && got !== UI_UPDATE) b = applyEdit(pairing, b, got);
        }
        seen.push(b.values[0]);
      }
      return seen;
    };
    expect(clicks(board(), LEFT_BUTTON, LEFT_RELEASE)).toEqual([BLOCK, DISC, 0]);
    expect(clicks(board(), RIGHT_BUTTON, RIGHT_RELEASE)).toEqual([DISC, BLOCK, 0]);
    // A given is no button's.
    expect(clicks(board({ 0: DISC }), LEFT_BUTTON, LEFT_RELEASE)).toEqual([
      DISC,
      DISC,
      DISC,
    ]);
  });

  it("places a piece by each of its digit keys", () => {
    const ds = { tileSize: TS };
    const input = fillInput<pairing.Dealt, typeof ds>(pairing, pairing.play, () => 0);
    const ui = newFillUi();
    ui.cursor.visible = true;
    const press = (key: string): number => {
      const got = input.interpretMove(
        board(),
        ui,
        ds,
        { x: -1, y: -1 },
        key.charCodeAt(0),
      );
      return got === null || got === UI_UPDATE ? 0 : (got.set?.[1] ?? 0);
    };
    expect(["1", "0", "2"].map(press)).toEqual([BLOCK, DISC, DISC]);
  });

  it("reads upstream's dot runs as fixed givens and writes them back", () => {
    const desc = "aBdIAEbceaca";
    const dealt = read(desc);
    const b = newBoard(pairing, W, W, dealt);
    expect([b.values[0], b.values[2], b.fixed[0], b.fixed[1]]).toEqual([
      DISC,
      BLOCK,
      1,
      0,
    ]);
    expect(encodeDesc(pairing, pairing.deal, spaceOf(pairing, b), dealt)).toBe(desc);
  });

  it("writes a variation's flag by its letter, and no variation where none is on", () => {
    const defaults = (): FillParams => ({ w: 8, h: 8, diff: 0 });
    const { encodeParams, decodeParams } = fillParams(
      pairing.deal,
      pairing.tiers,
      defaults,
    );
    const unique = { w: 8, h: 8, diff: 1, variations: ["unique"] };
    expect(encodeParams(unique, true)).toBe("8x8udn");
    expect(decodeParams("8x8udn")).toEqual(unique);
    expect(decodeParams("8x8dn")).toEqual({ w: 8, h: 8, diff: 1 });
  });

  it("starts on its default board at its default tier, and offers each board at its tiers, then the variant", () => {
    expect(game.defaultParams()).toEqual({ w: 6, h: 6, diff: 1 });
    const lines = (presetGrid(game.paramConfig, game.menu).submenu ?? []).map((m) =>
      m.params === undefined ? "" : game.encodeParams(m.params, true),
    );
    expect(lines).toEqual(["4x4de", "6x6de", "6x6dn", "6x6udn"]);
  });

  it("deals a built answer with every given hidden that the tier can spare", () => {
    const p = { w: W, h: W, diff: 1 };
    const { desc, aux } = dealFill(pairing, pairing.deal, p, randomNew("pair-deal"));
    const dealt = read(desc);
    const b = newBoard(pairing, W, W, dealt);
    expect(solveBoard(pairing, b, 1).verdict).toBe("solved");
    expect(solveBoard(pairing, b, 0).verdict).not.toBe("solved");
    // Each given is the answer's, and none could go and leave the board
    // finished at its tier.
    const at = Array.from(dealt.given.at);
    expect(at.length).toBeGreaterThan(0);
    at.forEach((c, k) => {
      expect(dealt.given.v[k].toString(36)).toBe(aux[c]);
      const without = at.filter((_, j) => j !== k);
      const fewer = {
        given: clueList(
          without,
          without.map((c2) => Number(aux[c2])),
          W * W,
        ),
      };
      expect(solveBoard(pairing, newBoard(pairing, W, W, fewer), 1).verdict).not.toBe(
        "solved",
      );
    });
  });
});

describe("a placement's animation", () => {
  it("runs where one cell takes or loses a piece that grows", () => {
    const b = board();
    const one = applyEdit(pairing, b, { set: [0, DISC] });
    const two = applyEdit(pairing, b, { set: [0, DISC, 1, BLOCK] });
    expect(game.animLength?.(b, one, 1, newFillUi())).toBe(PLACE_ANIM_TIME);
    expect(game.animLength?.(one, b, -1, newFillUi())).toBe(PLACE_ANIM_TIME);
    expect(game.animLength?.(b, two, 1, newFillUi())).toBe(0);
  });

  it("does not run for a piece drawn whole", () => {
    // `linking`'s piece is the `tent` painter's, which does not grow.
    const game = fillGame("linking", linking);
    const g = Uint8Array.from("PA.....P...AAP..", (ch) => "_P.A".indexOf(ch));
    const b = newBoard(
      linking,
      4,
      4,
      linking.deriveClues(g, paramSpaceOf(linking, { w: 4, h: 4 })),
    );
    const c = b.values.indexOf(0);
    const piece = applyEdit(linking, b, { set: [c, 1] });
    expect(game.animLength?.(b, piece, 1, newFillUi())).toBe(0);
  });
});

describe("a fill game of two alike pieces, drawn", () => {
  const render = () => {
    const ds = { tileSize: TS };
    const input = fillInput<pairing.Dealt, typeof ds>(pairing, pairing.play, () => 1);
    return fillRender(pairing, { play: pairing.play, lineClues: [] }, input.previewed);
  };
  function draw(
    b: Board,
    edits: readonly Edit[],
    anim: { prev: Board; animTime: number } | null = null,
  ): { ops: readonly DrawOp[]; colors: number[][] } {
    for (const e of edits) b = applyEdit(pairing, b, e);
    const r = render();
    const colors = r.colors(DEFAULT_BACKGROUND);
    const dr = new RecordingDrawing(colors);
    r.redraw(dr, r.newDrawState(b, TS), {
      state: b,
      prev: anim?.prev ?? null,
      dir: 1,
      ui: newFillUi(),
      animTime: anim?.animTime ?? 0,
      flash: NO_FLASH,
    });
    return { ops: dr.ops, colors: colors.map((c) => [...c]) };
  }
  const red = (ops: readonly DrawOp[], op: DrawOp["op"]) =>
    ops.filter(
      (o) =>
        o.op === op &&
        ("color" in o ? o.color : "fill" in o ? o.fill : -1) === COL_ERROR,
    );
  const row = (pieces: number[], y = 0): Edit => ({
    set: pieces.flatMap((v, x) => (v === 0 ? [] : [y * W + x, v])),
  });

  it("lifts the surface under a given, and under no piece the player placed", () => {
    const { ops, colors } = draw(board({ 0: BLOCK }), [{ set: [1, BLOCK] }]);
    const lifted = colors.findIndex(
      (c) =>
        JSON.stringify(c) === JSON.stringify([...givenSurface(DEFAULT_BACKGROUND)]),
    );
    const surfaces = ops.filter(
      (o) => o.op === "rect" && o.color === lifted && o.w === TS - 1,
    );
    expect(surfaces).toHaveLength(1);
  });

  it("draws a run of three as a bar along it, and no badge", () => {
    const { ops } = draw(board(), [row([BLOCK, BLOCK, BLOCK])]);
    expect(red(ops, "rect").length).toBeGreaterThan(0);
    expect(red(ops, "circle")).toHaveLength(0);
    expect(red(draw(board(), [row([BLOCK, BLOCK, DISC])]).ops, "rect")).toHaveLength(0);
  });

  it("puts a badge on each piece of a line with more than its half", () => {
    const { ops } = draw(board(), [row([BLOCK, DISC, BLOCK, BLOCK, DISC, BLOCK])]);
    expect(red(ops, "circle")).toHaveLength(4);
  });

  it("strikes across two lines alike where the unique rule is on", () => {
    const pieces = [BLOCK, BLOCK, DISC, BLOCK, DISC, DISC];
    const edits = [row(pieces, 0), row(pieces, 1)];
    const strikes = (b: Board) =>
      red(draw(b, edits).ops, "rect").filter(
        (o) => o.op === "rect" && o.w === TS && o.h === 2 * Math.floor(TS / 12),
      );
    expect(strikes(board({}, ["unique"]))).toHaveLength(2 * W);
    expect(strikes(board())).toHaveLength(0);
  });

  it("grows a piece just placed from the middle of its cell", () => {
    const before = board();
    const width = (anim: { prev: Board; animTime: number } | null) => {
      const discs = draw(before, [{ set: [0, DISC] }], anim).ops.filter(
        (o) => o.op === "circle" && o.fill !== COL_ERROR,
      );
      return discs.length === 0
        ? 0
        : Math.max(...discs.map((o) => (o.op === "circle" ? o.r : 0)));
    };
    const whole = width(null);
    const half = width({ prev: before, animTime: PLACE_ANIM_TIME / 2 });
    expect(half).toBeGreaterThan(0);
    expect(half).toBeLessThan(whole);
  });
});

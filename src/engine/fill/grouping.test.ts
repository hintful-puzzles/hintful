/**
 * An answer drawn from shipped data (`deal.sample.group`), on the `grouping`
 * fixture, a group's table of letters: a group of the board's order from its
 * generators, its elements permuted. With the identity shown it stays the
 * first letter, `e`, and its row and column stay given (the hide's `keep`);
 * under `i` it is permuted with the rest, and its lines and another
 * element's are dealt no given, the hide starting at the lowest tier the
 * ruleset takes.
 */

import { describe, expect, it } from "vitest";
import * as grouping from "../../generated/engine/testing/fixtures/grouping/grouping.compiled.ts";
import { COL_ERROR } from "../color/roles.ts";
import { newDealCensus, takingCensus } from "../contract/deal-census.ts";
import { randomNew } from "../random/index.ts";
import { liveErrors } from "../render/live-errors.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { type FillBoard, solveBoard } from "./board.ts";
import { fillGame } from "./game.ts";
import { groupTable } from "./group-table.ts";

type Board = FillBoard<grouping.Dealt>;

const game = fillGame("grouping", grouping);
const TS = 48;

function dealt(id: string, seed: string): { b: Board; answer: Uint8Array } {
  const p = game.decodeParams(id);
  const { desc, aux } = game.newDesc(p, randomNew(`grouping-${id}-${seed}`));
  return {
    b: game.newState(p, desc),
    answer: Uint8Array.from(aux ?? "", (ch) => Number.parseInt(ch, 36)),
  };
}

/** Row a, column b of table `t` of side `n`: a·b, the elements from 1. */
const mul = (t: ArrayLike<number>, n: number, a: number, b: number): number =>
  t[(a - 1) * n + (b - 1)];

/** The element of `t` that leaves every element as it is. */
function identityOf(t: ArrayLike<number>, n: number): number {
  const all = Array.from({ length: n }, (_, i) => i + 1);
  const e = all.find((x) =>
    all.every((a) => mul(t, n, x, a) === a && mul(t, n, a, x) === a),
  );
  if (e === undefined) throw new Error("no identity");
  return e;
}

/** Whether `t` is a group's table: Latin, with an identity, associative. */
function isGroup(t: ArrayLike<number>, n: number): boolean {
  identityOf(t, n);
  const all = Array.from({ length: n }, (_, i) => i + 1);
  return all.every(
    (a) =>
      new Set(all.map((b) => mul(t, n, a, b))).size === n &&
      new Set(all.map((b) => mul(t, n, b, a))).size === n &&
      all.every((b) =>
        all.every(
          (c) => mul(t, n, mul(t, n, a, b), c) === mul(t, n, a, mul(t, n, b, c)),
        ),
      ),
  );
}

/** The value given at cell `c` of `b`, 0 where none is. */
const given = (b: Board, c: number): number => (b.fixed[c] === 1 ? b.values[c] : 0);

/** The elements whose row and column hold no given. */
function blankLines(b: Board): number[] {
  const n = b.w;
  return Array.from({ length: n }, (_, i) => i + 1).filter((a) =>
    Array.from({ length: n }, (_, k) => k).every(
      (k) => given(b, (a - 1) * n + k) === 0 && given(b, k * n + (a - 1)) === 0,
    ),
  );
}

describe("an answer drawn as a group's table", () => {
  it("multiplies the generators out from the identity's row", () => {
    // Upstream's order-6 groups: the dihedral and the cyclic.
    for (const gens of [["CFEBAD", "BADCFE"], ["DCFEBA"]]) {
      const t = groupTable(6, gens);
      expect(t).not.toBeNull();
      expect(isGroup(t as Uint8Array, 6), gens.join()).toBe(true);
    }
    // One transposition reaches two rows of three.
    expect(groupTable(3, ["BAC"])).toBeNull();
  });

  it("keeps the identity first and its row and column given where it is shown", () => {
    let permuted = 0;
    for (const id of ["4de", "5dn", "6dn"])
      for (const seed of ["a", "b", "c"]) {
        const { b, answer } = dealt(id, seed);
        const n = b.w;
        expect(isGroup(answer, n), `${id} ${seed}`).toBe(true);
        expect(identityOf(answer, n), `${id} ${seed}`).toBe(1);
        for (let k = 0; k < n; k++) {
          expect(given(b, k), `${id} ${seed} row`).toBe(k + 1);
          expect(given(b, k * n), `${id} ${seed} column`).toBe(k + 1);
        }
        // The other elements are permuted: not always the table's order.
        if (answer[n + 1] !== mul(groupTable(n, ["BCDA"]) ?? [], n, 2, 2)) permuted++;
        expect(solveBoard(grouping, b, game.decodeParams(id).diff).verdict).toBe(
          "solved",
        );
      }
    expect(permuted).toBeGreaterThan(0);
  });

  it("hides the identity and blanks its lines and another's under `i`", () => {
    const identities = new Set<number>();
    for (const id of ["5dni", "6dni", "6dti"])
      for (const seed of ["a", "b", "c", "d"]) {
        const { b, answer } = dealt(id, seed);
        const n = b.w;
        expect(isGroup(answer, n), `${id} ${seed}`).toBe(true);
        const e = identityOf(answer, n);
        identities.add(e);
        const blank = blankLines(b);
        expect(blank, `${id} ${seed}`).toContain(e);
        expect(blank.length, `${id} ${seed}`).toBeGreaterThanOrEqual(2);
        expect(solveBoard(grouping, b, game.decodeParams(id).diff).verdict).toBe(
          "solved",
        );
      }
    expect(identities.size).toBeGreaterThan(1);
  });

  it("hides from the lowest tier the ruleset takes", () => {
    // Easy finishes no board whose identity's lines are blank, so a hide
    // from Easy threw away every draw, until 64 in a row, before it tried
    // Normal (`SHORT_OF_LOWEST_RUN`).
    const census = newDealCensus();
    takingCensus(census, () => dealt("5dni", "lowest"));
    expect(census.rejected.get("fill: the lowest tier stops short of every clue")).toBe(
      undefined,
    );
  });

  it("labels a failed product with its triple on its two sides, its squares not in error", () => {
    // A board with no given: (a·b)·c and a·(b·c), a = 2, b = 3, c = 4, each
    // placed and differing, with no letter twice in a line.
    const p = game.decodeParams("4dn");
    const blank = game.newState(p, "p");
    const values = blank.values.slice();
    const [ab, bc, left, right] = [1 * 4 + 2, 2 * 4 + 3, 3 * 4 + 3, 1 * 4 + 1];
    values[ab] = 4;
    values[bc] = 2;
    values[left] = 4;
    values[right] = 3;
    const b: Board = { ...blank, values };
    if (game.rules === undefined) throw new Error("grouping states no rules");
    const live = liveErrors(game.rules, b);
    expect(live.byRule.get("associative")).toBeUndefined();
    expect(Array.from(live.at)).not.toContain(1);
    // The letters drawn E first: 1 e, 2 a, 3 b, 4 c.
    expect(live.labels).toEqual([
      { at: left, place: "above", says: ["(", 2, 3, ")", 4] },
      { at: right, place: "below", says: [2, "(", 3, 4, ")"] },
    ]);
    // Drawn on a frame after one without the fourth letter, so the labels
    // repaint tiles whose words are the same.
    const ds = game.newDrawState(b, TS);
    const frame = (state: Board): DrawOp[] => {
      const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
      game.redraw(dr, ds, {
        state,
        prev: null,
        dir: 1,
        ui: game.newUi(state),
        animTime: 0,
        flash: NO_FLASH,
      });
      return dr.ops;
    };
    const short = values.slice();
    short[right] = 0;
    frame({ ...blank, values: short });
    const texts = frame(b).flatMap((o) => (o.op === "text" ? [o] : []));
    const red = texts.filter((o) => o.color === COL_ERROR);
    expect(red.map((o) => o.text).sort()).toEqual(["(ab)c", "a(bc)"]);
    // Each over or under its square's letter, in the same tile.
    const by = (text: string) => red.find((o) => o.text === text) ?? null;
    const near = (label: DrawOp | null, letter: string, dy: number) =>
      label !== null &&
      label.op === "text" &&
      texts.some(
        (o) =>
          o.text === letter &&
          o.x === label.x &&
          (o.y - label.y) * dy > 0 &&
          Math.abs(o.y - label.y) < TS / 2,
      );
    expect(near(by("(ab)c"), "c", 1)).toBe(true);
    expect(near(by("a(bc)"), "b", -1)).toBe(true);
  });

  it("strokes each square of the leading diagonal corner to corner", () => {
    const b = game.newState(game.decodeParams("4dn"), "p");
    const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
    game.redraw(dr, game.newDrawState(b, TS), {
      state: b,
      prev: null,
      dir: 1,
      ui: game.newUi(b),
      animTime: 0,
      flash: NO_FLASH,
    });
    // A line falling as far as it runs right, a square wide, on the diagonal
    // alone: its corner as far in across as down.
    const strokes = dr.ops.flatMap((o) =>
      o.op === "line" && o.x2 - o.x1 === TS && o.y2 - o.y1 === TS ? [o] : [],
    );
    expect(strokes).toHaveLength(4);
    const lean = strokes[0].x1 - strokes[0].y1;
    expect(strokes.every((o) => o.x1 - o.y1 === lean)).toBe(true);
  });

  it("deals a board of the asked tier, not one the tier below finishes", () => {
    for (const id of ["6dn", "6dti"]) {
      const { b } = dealt(id, "tier");
      const diff = game.decodeParams(id).diff;
      expect(solveBoard(grouping, b, diff).verdict, id).toBe("solved");
      expect(solveBoard(grouping, b, diff - 1).verdict, id).not.toBe("solved");
    }
  });
});

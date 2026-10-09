/**
 * Behavioral tests for Bridges (tier 1 logic + tier 2.5 render). The byte-match
 * generator/solver differential is `bridges-differential.test.ts`.
 */
import { describe, expect, it } from "vitest";
import {
  DESC_TOO_LONG,
  puzzleDescError,
  validateDesc,
} from "../../engine/desc-error.ts";
import { UI_UPDATE } from "../../engine/game.ts";
import { Midend } from "../../engine/index.ts";
import { paramsError } from "../../engine/params.ts";
import {
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
} from "../../engine/pointer.ts";
import { type RandomState, randomNew } from "../../engine/random/index.ts";
import { shuffle } from "../../engine/shuffle.ts";
import {
  describeAbsentTiers,
  describeDealtTiers,
} from "../../engine/testing/absent-tiers.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { newBridgesDesc } from "./generator.ts";
import { bridgesGame } from "./index.ts";
import { COL_ISLAND, COL_MARK, newDrawState } from "./render.ts";
import { solveFromScratch } from "./solver.ts";
import {
  BRIDGES_PRESETS,
  type BridgesMove,
  type BridgesOp,
  BridgesState,
  decodeParams,
  encodeGame,
  encodeParams,
  G_LINEH,
  G_LINEV,
  G_MARK,
  G_NOLINEH,
  G_WARN,
  newStateFromDesc,
} from "./state.ts";

describe("bridges params codec", () => {
  it("round-trips every preset in full form", () => {
    for (const p of BRIDGES_PRESETS) {
      expect(decodeParams(encodeParams(p, true))).toEqual(p);
    }
  });

  it("encodes the full form as C does (7x7 hard)", () => {
    expect(encodeParams(BRIDGES_PRESETS[2], true)).toBe("7x7i30e10m2d2");
  });

  it("non-full form carries maxb and the loop flag", () => {
    const p = { ...BRIDGES_PRESETS[0], allowloops: false };
    expect(encodeParams(p, false)).toBe("7x7m2L");
    expect(decodeParams("7x7m2L").allowloops).toBe(false);
  });

  it("rejects a too-small grid", () => {
    expect(paramsError(bridgesGame, { ...BRIDGES_PRESETS[0], w: 2, h: 2 }, true)).toBe(
      "Width must be at least 3.",
    );
    expect(paramsError(bridgesGame, BRIDGES_PRESETS[0], true)).toBeNull();
  });

  // One cell of each family `sparseRefusal` names. A run-out here is a
  // million boards and more, so two budgets and not five.
  describeAbsentTiers(
    bridgesGame,
    [
      "3x3i30e10m2d1",
      "4x4i30e10m2d2",
      "5x5i20e10m2Ld2",
      "5x5i20e10m1d1",
      "7x7i30e100m1d1",
    ],
    { budgets: 2 },
  );

  it("names the islands a refused board would have", () => {
    const refusal = (id: string): string | null =>
      paramsError(bridgesGame, decodeParams(id), true);
    expect(refusal("8x8i5e10m2d1")).toBe("No puzzle of 3 islands is Normal.");
    expect(refusal("9x9i5e10m2d2")).toBe("No puzzle of 4 islands is Tricky.");
    expect(refusal("9x9i5e10m2d1")).toBeNull();
    expect(refusal("10x10i5e10m2d2")).toBeNull();
    expect(refusal("10x10i5e10m3Ld2")).toBeNull();
    expect(refusal("4x6i30e10m1d1")).toBeNull();
    expect(refusal("7x7i30e100m1Ld1")).toBeNull();
  });

  // Rare and quick: found once in tens of thousands of boards, each of which
  // takes microseconds, so the retry budget has to be that long.
  describeDealtTiers(bridgesGame, ["9x9i5e10m4d1", "10x10i5e10m2d2", "4x4i30e10m2d1"]);

  // The generator grades the state it grew, whose islands are in the order
  // they were placed. While the grade depended on that order, about one board
  // in a hundred dealt here as Tricky was solved by Easy once loaded, and the
  // 78th of these was one.
  describeDealtTiers(bridgesGame, ["11x11i5e10m4d2"], { deals: 80 });
});

describe("the grade does not depend on island order", () => {
  /** Which of Easy, Normal and Tricky solve the board, as three digits. */
  const verdict = (st: BridgesState): string =>
    [0, 1, 2].map((d) => solveFromScratch(st.workingCopy(), d)).join("");

  /** The board of `loaded`, its islands listed in `order`. */
  const reordered = (loaded: BridgesState, order: readonly number[]): BridgesState => {
    const st = BridgesState.empty(loaded.params);
    for (const i of order) {
      const is = loaded.islands[i];
      st.islandAdd(is.x, is.y, is.count);
    }
    st.mapFindOrthogonal();
    st.mapUpdatePossibles();
    return st;
  };

  const shuffledOrder = (n: number, rng: RandomState): number[] => {
    const order = Array.from({ length: n }, (_, i) => i);
    shuffle(order, rng);
    return order;
  };

  // Each was dealt as Tricky from the state the generator grew, and Easy
  // solves it in reading order.
  it.each([
    "5x5i30e10m4d2:5aAa3i2b3b4c5",
    "11x11i5e10m3d2:4b7f2zzf2zn3b2g",
    "11x11i5e10m3d2:2i1zg4d7d2zzh2e",
    "11x11i5e10m4d2:5dAd3v4zzx3d3e",
  ])("%s is Easy in every order", (id) => {
    const [params, desc] = id.split(":");
    const loaded = newStateFromDesc(decodeParams(params), desc);
    const rng = randomNew(`island-order-${id}`);
    const verdicts = new Set<string>();
    for (let k = 0; k < 720; k++) {
      const order = shuffledOrder(loaded.islands.length, rng);
      verdicts.add(verdict(reordered(loaded, order)));
    }
    expect([...verdicts]).toEqual(["111"]);
  });

  // The boards above are the guard; this reaches ones nobody chose. With the
  // room on a span counted the old way it fails here, and passed at four
  // other sizes of the same 150 deals, so it is kept to the size it sees at.
  it.each([
    "11x11i5e10m3d2",
  ])("%s: a dealt board has one grade however its islands are listed", (params) => {
    const p = decodeParams(params);
    const rng = randomNew(`island-order-${params}`);
    const split: string[] = [];
    let boards = 0;
    for (let seed = 0; seed < 150; seed++) {
      const { desc } = newBridgesDesc(p, randomNew(`${params}-${seed}`));
      const loaded = newStateFromDesc(p, desc);
      const want = verdict(loaded);
      boards++;
      for (let k = 0; k < 12; k++) {
        const order = shuffledOrder(loaded.islands.length, rng);
        if (verdict(reordered(loaded, order)) !== want) {
          split.push(desc);
          break;
        }
      }
    }
    expect(boards).toBe(150);
    expect(split).toEqual([]);
  });
});

describe("bridges desc codec", () => {
  const p3 = { ...BRIDGES_PRESETS[0], w: 3, h: 3 };
  const desc = "1a2c2a1"; // (0,0)=1 (2,0)=2 (0,2)=2 (2,2)=1

  it("parses a desc and re-encodes it identically", () => {
    const state = newStateFromDesc(p3, desc);
    expect(state.islands.length).toBe(4);
    expect(encodeGame(state)).toBe(desc);
  });

  it("finds orthogonal neighbors across empty cells", () => {
    const state = newStateFromDesc(p3, desc);
    expect(state.islandAt(0, 0)?.nislands).toBe(2);
  });

  it("validateDesc accepts a good desc and rejects overruns / lone islands", () => {
    expect(validateDesc(bridgesGame, p3, desc)).toBeNull();
    expect(validateDesc(bridgesGame, p3, "zzz")).toBe(DESC_TOO_LONG);
    expect(validateDesc(bridgesGame, p3, "1i")).toBe(DESC_TOO_LONG);
    expect(validateDesc(bridgesGame, p3, "1h")).toBe(
      puzzleDescError("This game ID has fewer than two islands."),
    );
    expect(validateDesc(bridgesGame, p3, "11g")).toBe(
      puzzleDescError("This game ID places two islands next to each other."),
    );
  });
});

describe("bridges input model (drag → move)", () => {
  // Two islands in the top row of a 3x3 board, empty elsewhere.
  const p3 = { ...BRIDGES_PRESETS[0], w: 3, h: 3 };
  const twoIslands = () => newStateFromDesc(p3, "1a1f");
  const ts = 24;
  const b = 4; // border(24)
  const center = (cell: number) => cell * ts + b + Math.trunc(ts / 2);

  it("left-drag between adjacent islands emits an L bridge move", () => {
    const s = twoIslands();
    const ui = bridgesGame.newUi(s);
    const ds = newDrawState(s, ts);

    // Press on island (0,0), drag toward (2,0), release.
    expect(
      bridgesGame.interpretMove(s, ui, ds, { x: center(0), y: center(0) }, LEFT_BUTTON),
    ).toBe(UI_UPDATE);
    expect(
      bridgesGame.interpretMove(s, ui, ds, { x: center(2), y: center(0) }, LEFT_DRAG),
    ).toBe(UI_UPDATE);
    const move = bridgesGame.interpretMove(
      s,
      ui,
      ds,
      { x: center(2), y: center(0) },
      LEFT_RELEASE,
    ) as BridgesMove;
    expect(move.ops).toEqual([{ op: "L", x1: 0, y1: 0, x2: 2, y2: 0, n: 1 }]);

    const s2 = bridgesGame.executeMove(s, move);
    expect(s2.gridCount(1, 0, G_LINEH)).toBe(1);
  });

  it("a canceled press on an island draws no bridge", () => {
    // The frontend reports a canceled press as a drag far off the canvas's top
    // left corner and then a release there. From island (2,0) that point lies
    // up and to the left, where island (0,0) is in line.
    for (const [press, drag, release] of [
      [LEFT_BUTTON, LEFT_DRAG, LEFT_RELEASE],
      [RIGHT_BUTTON, RIGHT_DRAG, RIGHT_RELEASE],
    ]) {
      const s = twoIslands();
      const ui = bridgesGame.newUi(s);
      const ds = newDrawState(s, ts);
      const at = { x: center(2), y: center(0) };
      expect(bridgesGame.interpretMove(s, ui, ds, at, press)).toBe(UI_UPDATE);
      const off = { x: -100, y: -100 };
      for (const button of [drag, release]) {
        const r = bridgesGame.interpretMove(s, ui, ds, off, button);
        expect(r === null || r === UI_UPDATE).toBe(true);
      }
      expect(ui.drag.live).toBe(false);
    }
  });

  it("a drag that overshoots the canvas's left edge still draws its bridge", () => {
    const s = twoIslands();
    const ui = bridgesGame.newUi(s);
    const ds = newDrawState(s, ts);
    const row = center(0);
    bridgesGame.interpretMove(s, ui, ds, { x: center(2), y: row }, LEFT_BUTTON);
    bridgesGame.interpretMove(s, ui, ds, { x: center(1), y: row }, LEFT_DRAG);
    bridgesGame.interpretMove(s, ui, ds, { x: -30, y: row }, LEFT_DRAG);
    const move = bridgesGame.interpretMove(
      s,
      ui,
      ds,
      { x: -30, y: row },
      LEFT_RELEASE,
    ) as BridgesMove;
    expect(move.ops).toEqual([{ op: "L", x1: 2, y1: 0, x2: 0, y2: 0, n: 1 }]);
  });

  /** A right-drag from island (0,0) to island (2,0), as the pointer sends it. */
  const rightDrag = (s: BridgesState): ReturnType<typeof bridgesGame.interpretMove> => {
    const ui = bridgesGame.newUi(s);
    const ds = newDrawState(s, ts);
    bridgesGame.interpretMove(s, ui, ds, { x: center(0), y: center(0) }, RIGHT_BUTTON);
    bridgesGame.interpretMove(s, ui, ds, { x: center(2), y: center(0) }, RIGHT_DRAG);
    return bridgesGame.interpretMove(
      s,
      ui,
      ds,
      { x: center(2), y: center(0) },
      RIGHT_RELEASE,
    );
  };
  const span = { x1: 0, y1: 0, x2: 2, y2: 0 };

  it("right-drag lowers the span's limit one step: at most one, then none, then free", () => {
    const s = twoIslands();
    const m1 = rightDrag(s) as BridgesMove;
    expect(m1.ops).toEqual([{ op: "C", ...span, n: 1 }]);
    const s1 = bridgesGame.executeMove(s, m1);
    expect(s1.maximum(1, 1, 0)).toBe(1);

    // The limit is lifted as the cross goes down, so a cross never stands on
    // top of a limit that would outlive it.
    const m2 = rightDrag(s1) as BridgesMove;
    expect(m2.ops).toEqual([
      { op: "C", ...span, n: 2 },
      { op: "N", ...span },
    ]);
    const s2 = bridgesGame.executeMove(s1, m2);
    expect(s2.gridAt(1, 0) & G_NOLINEH).toBeTruthy();
    expect(s2.maximum(1, 1, 0)).toBe(2);

    const m3 = rightDrag(s2) as BridgesMove;
    expect(m3.ops).toEqual([{ op: "N", ...span }]);
    const s3 = bridgesGame.executeMove(s2, m3);
    expect(s3.gridAt(1, 0) & G_NOLINEH).toBeFalsy();
    expect(s3.maximum(1, 1, 0)).toBe(2);
  });

  it("over a bridge the limit stops at the bridges drawn and never reaches the cross", () => {
    const one = bridgesGame.executeMove(twoIslands(), {
      ops: [{ op: "L", ...span, n: 1 }],
    });
    const m1 = rightDrag(one) as BridgesMove;
    expect(m1.ops).toEqual([{ op: "C", ...span, n: 1 }]);
    const capped = bridgesGame.executeMove(one, m1);
    expect((rightDrag(capped) as BridgesMove).ops).toEqual([
      { op: "C", ...span, n: 2 },
    ]);
    // A full bundle with no limit has nothing to lower: the drag finds no far
    // end, and the release commits nothing.
    const two = bridgesGame.executeMove(twoIslands(), {
      ops: [{ op: "L", ...span, n: 2 }],
    });
    expect(rightDrag(two)).toBe(UI_UPDATE);
    // And a limit under the bridges already drawn is refused outright.
    expect(() =>
      bridgesGame.executeMove(two, { ops: [{ op: "C", ...span, n: 1 }] }),
    ).toThrow(/C limit/);
  });

  it("stops marking a loop's bridges once it is opened, while another loop stands", () => {
    // Two squares of four islands side by side, on a board that forbids loops.
    const p = { ...BRIDGES_PRESETS[0], w: 7, h: 3, allowloops: false };
    const board = newStateFromDesc(p, "2a2a2a2g2a2a2a2");
    const square = (x: number): BridgesOp[] => [
      { op: "L", x1: x, y1: 0, x2: x + 2, y2: 0, n: 1 },
      { op: "L", x1: x, y1: 2, x2: x + 2, y2: 2, n: 1 },
      { op: "L", x1: x, y1: 0, x2: x, y2: 2, n: 1 },
      { op: "L", x1: x + 2, y1: 0, x2: x + 2, y2: 2, n: 1 },
    ];
    const both = bridgesGame.executeMove(board, { ops: [...square(0), ...square(4)] });
    expect(both.gridAt(1, 0) & G_WARN).toBeTruthy();
    expect(both.gridAt(5, 0) & G_WARN).toBeTruthy();

    const opened = bridgesGame.executeMove(both, {
      ops: [{ op: "L", x1: 0, y1: 0, x2: 2, y2: 0, n: 0 }],
    });
    // The left square is a loop no more, and none of its bridges is marked;
    // the right one still is.
    expect(opened.gridAt(1, 2) & G_WARN).toBeFalsy();
    expect(opened.gridAt(0, 1) & G_WARN).toBeFalsy();
    expect(opened.gridAt(5, 0) & G_WARN).toBeTruthy();
  });

  it("a plain click toggles the island mark", () => {
    const s = twoIslands();
    const ds = newDrawState(s, ts);

    // A left click on an island with no drag toggles its mark.
    const ui2 = bridgesGame.newUi(s);
    bridgesGame.interpretMove(s, ui2, ds, { x: center(0), y: center(0) }, LEFT_BUTTON);
    const mmove = bridgesGame.interpretMove(
      s,
      ui2,
      ds,
      { x: center(0), y: center(0) },
      LEFT_RELEASE,
    ) as BridgesMove;
    expect(mmove.ops).toEqual([{ op: "M", x: 0, y: 0 }]);
    const s3 = bridgesGame.executeMove(s, mmove);
    expect(s3.gridAt(0, 0) & G_MARK).toBeTruthy();
  });

  // Both tests above press on island (0, 0), which is its own transpose — so
  // neither can see the drag source being stored x-for-y. Measured: swapping
  // the two coordinates the press writes passed all 72 bridges tests. The
  // board below puts its islands on the middle row instead, where (0, 1) and
  // (1, 0) are different cells and only one of them is an island.
  const middleRow = () => newStateFromDesc(p3, "c1a1c"); // islands (0,1), (2,1)

  it("stores the drag source the right way round on an asymmetric board", () => {
    const s = middleRow();
    const ui = bridgesGame.newUi(s);
    const ds = newDrawState(s, ts);

    expect(
      bridgesGame.interpretMove(s, ui, ds, { x: center(0), y: center(1) }, LEFT_BUTTON),
    ).toBe(UI_UPDATE);
    bridgesGame.interpretMove(s, ui, ds, { x: center(2), y: center(1) }, LEFT_DRAG);
    const move = bridgesGame.interpretMove(
      s,
      ui,
      ds,
      { x: center(2), y: center(1) },
      LEFT_RELEASE,
    ) as BridgesMove;
    expect(move.ops).toEqual([{ op: "L", x1: 0, y1: 1, x2: 2, y2: 1, n: 1 }]);
  });

  it("a press on an empty square cancels rather than arming a drag", () => {
    // (1, 0) is empty on this board: a press there must leave nothing armed, or
    // the following drag would run from a square holding no island.
    const s = middleRow();
    const ui = bridgesGame.newUi(s);
    const ds = newDrawState(s, ts);

    bridgesGame.interpretMove(s, ui, ds, { x: center(1), y: center(0) }, LEFT_BUTTON);
    // Nothing armed is the assertion: a later drag resolving to no island would
    // also emit no move, so checking only the move cannot tell the two apart.
    expect(ui.drag.live).toBe(false);
    expect(ui.drag.sx).toBe(-1);

    bridgesGame.interpretMove(s, ui, ds, { x: center(2), y: center(1) }, LEFT_DRAG);
    expect(ui.dragged).toBe(false);
    const move = bridgesGame.interpretMove(
      s,
      ui,
      ds,
      { x: center(2), y: center(1) },
      LEFT_RELEASE,
    );
    expect(move).not.toMatchObject({ ops: [{ op: "L" }] });
  });

  it("a press alone points at no island yet", () => {
    // The press anchors the source but must leave the far end unresolved:
    // `render` draws a drag line whenever there is a destination, so a far end
    // left sitting on the source would draw one from the island to itself.
    const s = middleRow();
    const ui = bridgesGame.newUi(s);
    const ds = newDrawState(s, ts);

    bridgesGame.interpretMove(s, ui, ds, { x: center(0), y: center(1) }, LEFT_BUTTON);
    expect([ui.drag.sx, ui.drag.sy]).toEqual([0, 1]);
    expect([ui.drag.ex, ui.drag.ey]).toEqual([-1, -1]);
  });

  it("leaves nothing armed after a release", () => {
    // The engine cancels a live drag when the board changes under it, so a
    // drag still marked live after its own release would be canceled for no
    // reason — and, before that, a stray drag event could resume it.
    const s = middleRow();
    const ui = bridgesGame.newUi(s);
    const ds = newDrawState(s, ts);

    bridgesGame.interpretMove(s, ui, ds, { x: center(0), y: center(1) }, LEFT_BUTTON);
    bridgesGame.interpretMove(s, ui, ds, { x: center(2), y: center(1) }, LEFT_DRAG);
    bridgesGame.interpretMove(s, ui, ds, { x: center(2), y: center(1) }, LEFT_RELEASE);
    expect(ui.dragged).toBe(false);
    expect(ui.drag.live).toBe(false);
    expect(ui.drag.sx).toBe(-1);
    expect(ui.drag.sy).toBe(-1);
  });
});

describe("bridges solve + findMistakes", () => {
  const genState = (difficulty: number, seed: string) => {
    const p = { ...BRIDGES_PRESETS[0], difficulty };
    const { desc } = newBridgesDesc(p, randomNew(seed));
    return { p, state: bridgesGame.newState(p, desc) };
  };

  it("solve() produces a move that completes a freshly generated board", () => {
    const { state } = genState(0, "bridges-solve-easy");
    const res = bridgesGame.solve?.(state, state);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    const solved = bridgesGame.executeMove(state, res.move);
    expect(bridgesGame.status(solved)).toBe("solved");
  });

  it("a fully solved board has no mistakes; an extra bridge is flagged", () => {
    const { state } = genState(0, "bridges-mistake-easy");
    const res = bridgesGame.solve?.(state, state);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    const solved = bridgesGame.executeMove(state, res.move);
    expect(bridgesGame.findMistakes?.(solved)).toEqual([]);

    // Over-bridge (n=2) every right/down span the unique solution uses exactly
    // once — that strictly exceeds the solution, so each must be flagged.
    const ops: BridgesOp[] = solved.islands.flatMap((is) =>
      is.points
        .filter(
          (pt) =>
            pt.off > 0 &&
            (pt.dx === 1 || pt.dy === 1) &&
            solved.gridCount(pt.x, pt.y, pt.dx ? G_LINEH : G_LINEV) === 1,
        )
        .map((pt) => ({
          op: "L" as const,
          x1: is.x,
          y1: is.y,
          x2: is.x + pt.off * pt.dx,
          y2: is.y + pt.off * pt.dy,
          n: 2,
        })),
    );
    if (ops.length === 0) return; // no single-bridge span to over-bridge; skip
    const over = bridgesGame.executeMove(state, { ops });
    const mistakes = bridgesGame.findMistakes?.(over) ?? [];
    expect(mistakes.length).toBeGreaterThan(0);
  });

  it("a limit below the solution's bridges is flagged, the cross included", () => {
    const { state } = genState(2, "bridges-mistake-limit");
    const res = bridgesGame.solve?.(state, state);
    if (!res?.ok) throw new Error("the generated board did not solve");
    const solved = bridgesGame.executeMove(state, res.move);
    // Every right/down span, by what the solution puts on it.
    const spans = state.islands.flatMap((is) =>
      is.points
        .filter((pt) => pt.off > 0 && (pt.dx === 1 || pt.dy === 1))
        .map((pt) => ({
          span: {
            x1: is.x,
            y1: is.y,
            x2: is.x + pt.off * pt.dx,
            y2: is.y + pt.off * pt.dy,
          },
          needs: solved.gridCount(pt.x, pt.y, pt.dx ? G_LINEH : G_LINEV),
        })),
    );
    const double = spans.find((s) => s.needs === 2);
    const single = spans.find((s) => s.needs === 1);
    if (!double || !single) throw new Error("no single and double span to limit");

    const flagged = (ops: BridgesOp[]) =>
      bridgesGame.findMistakes?.(bridgesGame.executeMove(state, { ops })) ?? [];
    expect(flagged([{ op: "C", ...double.span, n: 1 }])).toEqual([double.span]);
    expect(flagged([{ op: "N", ...single.span }])).toEqual([single.span]);
    // A limit the solution keeps to is no mistake, however tight.
    expect(flagged([{ op: "C", ...single.span, n: 1 }])).toEqual([]);

    // And Solve lifts a limit the player wrote, even one it agrees with.
    const limited = bridgesGame.executeMove(state, {
      ops: [{ op: "C", ...single.span, n: 1 }],
    });
    const again = bridgesGame.solve?.(state, limited);
    if (!again?.ok) throw new Error("a correct limit stopped the solve");
    const after = bridgesGame.executeMove(limited, again.move);
    expect(bridgesGame.status(after)).toBe("solved");
    expect(after.maxh.every((m) => m === after.maxb)).toBe(true);
    expect(after.maxv.every((m) => m === after.maxb)).toBe(true);
  });
});

describe("bridges auto-mark aid", () => {
  const p3 = { ...BRIDGES_PRESETS[0], w: 3, h: 3 };

  it("lifts a satisfied island only when the pref is on, without locking it", () => {
    const s0 = newStateFromDesc(p3, "1a1f"); // two count-1 islands
    // One bridge satisfies both count-1 islands.
    const s1 = bridgesGame.executeMove(s0, {
      ops: [{ op: "L", x1: 0, y1: 0, x2: 2, y2: 0, n: 1 }],
    });
    const palette = bridgesGame.colors([0.9, 0.9, 0.9]);
    const markCircles = (autoMark: boolean) => {
      const ds = newDrawState(s1, 24);
      const ui = { ...bridgesGame.newUi(s1), autoMark };
      const rec = new RecordingDrawing(palette);
      bridgesGame.redraw?.(rec, ds, null, s1, 0, ui, 0, 0);
      return rec.ops.filter((o) => o.op === "circle" && o.fill === COL_MARK).length;
    };

    expect(markCircles(true)).toBeGreaterThan(0); // satisfied islands lifted
    expect(markCircles(false)).toBe(0); // no lift when the pref is off
    // An island with bridges still to take has the quiet surface.
    const fresh = new RecordingDrawing(palette);
    bridgesGame.redraw?.(
      fresh,
      newDrawState(s0, 24),
      null,
      s0,
      0,
      bridgesGame.newUi(s0),
      0,
      0,
    );
    const faces = (fill: number) =>
      fresh.ops.filter((o) => o.op === "circle" && o.fill === fill).length;
    expect(faces(COL_ISLAND)).toBeGreaterThan(0);
    expect(faces(COL_MARK)).toBe(0);
    // Purely visual: the island is NOT actually marked/locked in the state.
    expect(s1.gridAt(0, 0) & G_MARK).toBeFalsy();
  });
});

describe("bridges render smoke (tier 2.5)", () => {
  it("redraws a generated board: background + island circles + a clue", () => {
    const p = BRIDGES_PRESETS[0];
    const { desc } = newBridgesDesc(p, randomNew("bridges-render"));
    const id = `${encodeParams(p, true)}:${desc}`;
    const { recording } = renderScenario({ game: bridgesGame, id });
    expect(recording.ops.some((o) => o.op === "rect")).toBe(true);
    expect(recording.ops.some((o) => o.op === "circle")).toBe(true);
    expect(recording.ops.some((o) => o.op === "text")).toBe(true);
  });
});

describe("bridges save round-trip", () => {
  it("saveGame -> loadGame restores an equivalent game", () => {
    const p = BRIDGES_PRESETS[0];
    const { desc } = newBridgesDesc(p, randomNew("bridges-save"));
    const id = `${encodeParams(p, true)}:${desc}`;
    const me = new Midend(bridgesGame);
    expect(me.newGameFromId(id)).toBeNull();
    const saved = me.saveGame();
    const me2 = new Midend(bridgesGame);
    expect(me2.loadGame(saved)).toBeNull();
    expect(me2.formatAsText?.()).toBe(me.formatAsText?.());
  });
});

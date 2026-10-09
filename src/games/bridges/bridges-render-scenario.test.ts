/**
 * Tier-2.5 render scenarios for Bridges: drive a real Midend to a hint frame
 * and capture `redraw`. Targeted op assertions plus a snapshot, so a render
 * regression is a reviewable text diff (`vitest -u` re-baselines; the targeted
 * assertions survive a careless `-u`).
 *
 * The frame is what settles this game's answer to `hint-mark.ts`: every mark
 * here is one of the game's own shapes recolored, because neither thing a
 * Bridges deduction points at is a cell whose border box means anything.
 */
import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { Midend } from "../../engine/index.ts";
import {
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  RIGHT_BUTTON,
  RIGHT_DRAG,
} from "../../engine/pointer.ts";
import { describeHintKindPins } from "../../engine/testing/hint-positions.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderPinnedHint,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import type { BridgesHighlights } from "./hint.ts";
import { bridgesGame } from "./index.ts";
import {
  border,
  COL_FOREGROUND,
  COL_HINT,
  COL_HINT_CELL,
  COL_SELECTED,
  PREFERRED_TILE_SIZE,
} from "./render.ts";
import {
  BRIDGES_PRESETS,
  type BridgesMove,
  type BridgesOp,
  encodeParams,
  G_LINEH,
  G_LINEV,
} from "./state.ts";

const P = BRIDGES_PRESETS[2];
const ID = `${bridgesGame.encodeParams(P, true)}#bridges-scenario`;

const lit = (step: HintStep<BridgesMove, unknown>): BridgesHighlights =>
  step.highlights as BridgesHighlights;

/** The steps whose frames are asserted below. */
const pinned = describeHintKindPins({
  game: bridgesGame,
  params: [P],
  kinds: {
    citesIslands: (s) => lit(s).islands.length > 0,
    // One limit of one bridge, which is the one label the frame is read for.
    limitsSpan: (s) =>
      lit(s).targets.filter((t) => t.limit !== null).length === 1 &&
      lit(s).targets.every((t) => t.limit === null || t.limit === 1),
    // A second bridge on a span that already carries one.
    raisesSpan: (s, state) =>
      lit(s).targets.some((t) => {
        const dx = Math.sign(t.x2 - t.x1);
        const dy = Math.sign(t.y2 - t.y1);
        const drawn = state.gridCount(t.x1 + dx, t.y1 + dy, dx ? G_LINEH : G_LINEV);
        return drawn > 0 && t.bridges > drawn;
      }),
  },
  pins: {
    /** Held on 60 of 145 positions walked. */
    citesIslands: "7x7i30e10m2d2:3a3a2a2n2l3g2a4a5a4",
    /** Held on 19 of 145 positions walked. */
    limitsSpan: {
      id: "7x7i30e10m2d2:3c4a2o3b3j1e2c2a2",
      moves:
        '[{"ops":[{"op":"L","x1":0,"y1":0,"x2":4,"y2":0,"n":1},{"op":"L","x1":0,"y1":0,"x2":0,"y2":6,"n":1}]},{"ops":[{"op":"L","x1":1,"y1":3,"x2":4,"y2":3,"n":2},{"op":"L","x1":1,"y1":3,"x2":1,"y2":5,"n":1}]}]',
    },
    /** Held on 20 of 145 positions walked. */
    raisesSpan: {
      id: "7x7i30e10m2d2:2a4c2g5a7b3d1c5a3b1h2b3b2",
      moves:
        '[{"ops":[{"op":"L","x1":0,"y1":2,"x2":2,"y2":2,"n":1},{"op":"L","x1":0,"y1":2,"x2":0,"y2":0,"n":1},{"op":"L","x1":0,"y1":2,"x2":0,"y2":4,"n":1}]},{"ops":[{"op":"L","x1":2,"y1":2,"x2":5,"y2":2,"n":1},{"op":"L","x1":2,"y1":2,"x2":2,"y2":0,"n":1},{"op":"L","x1":2,"y1":2,"x2":2,"y2":4,"n":1}]}]',
    },
  },
});

/** The frame a pinned position's hint draws, through a real `Midend`. */
function hintFrame(kind: Parameters<typeof pinned>[0]) {
  const result = renderPinnedHint(bridgesGame, pinned(kind));
  const { step } = result;
  return { recording: result.recording, step };
}

describe("Bridges render scenarios", () => {
  it("opener frame: island clues drawn, no bridges yet", () => {
    const { recording } = renderScenario({ game: bridgesGame, id: ID });
    expect(recording.ops.some((o) => o.op === "text")).toBe(true);
    expect(recording.ops.some((o) => o.op === "circle")).toBe(true);
    expect(recording.ops).toMatchSnapshot();
  });

  it("a displayed hint draws the bridge it asks for, and never fills a tile", () => {
    const { recording, hint } = renderScenario({
      game: bridgesGame,
      id: ID,
      showHint: true,
    });
    expect(hint?.explanation.length).toBeGreaterThan(20);

    // The action is a *bridge*, drawn as the bar the game draws, recolored.
    expect(
      recording.ops.some((o) => o.op === "rect" && o.color === COL_HINT),
      "the hint drew no bridge in the action color",
    ).toBe(true);
    // …and the island the sentence is about is its own rim and digit recolored,
    // which is a circle and a piece of text rather than any kind of rect.
    // The rim is an annulus: an `fg` disc with a `bg` disc painted over it, so
    // the color is on the outer circle's `fill`/`outline` and what survives is
    // a ring the width of one line.
    expect(
      recording.ops.some((o) => o.op === "circle" && o.outline === COL_HINT),
      "the focus island's rim is not in the action color",
    ).toBe(true);
    expect(
      recording.ops.some((o) => o.op === "text" && o.color === COL_HINT),
      "the focus island's clue digit is not in the action color",
    ).toBe(true);

    // No hint mark is a fill. The cross-game guard says this too; a
    // frame-level assertion is what survives a careless `vitest -u`
    // (docs/games/hints.md § "Shade vs ring").
    for (const o of recording.ops) {
      if (o.op !== "rect") continue;
      if (o.color !== COL_HINT && o.color !== COL_HINT_CELL) continue;
      const short = Math.min(o.w, o.h);
      expect(
        short * 4 < Math.max(o.w, o.h) || short < PREFERRED_TILE_SIZE / 2,
        `a hint mark is tile-sized in both directions: ${JSON.stringify(o)}`,
      ).toBe(true);
    }
    expect(recording.ops).toMatchSnapshot();
  });

  it("a step that cites other islands outlines exactly those", () => {
    const { recording, step } = hintFrame("citesIslands");
    const cited = lit(step).islands;
    // One recolored rim per cited island. Only the outer circle carries the
    // color, and an island's arcs intrude into its four neighbor tiles, which
    // is why the count is a floor rather than an equality.
    const rims = recording.ops.filter(
      (o) => o.op === "circle" && o.outline === COL_HINT_CELL,
    );
    expect(rims.length).toBeGreaterThanOrEqual(cited.length);
  });

  // A board with a span to limit: its top row runs 2 … 2 across six empty
  // squares, and a double bridge there would seal the two 2s off.
  const LIMITED = "7x7i30e10m2d2:2e2a2a5a2a3a2g5b43i2c2a3c3";
  const TOP_ROW = { x1: 0, y1: 0, x2: 6, y2: 0 };
  const limitLabels = (ops: ReturnType<typeof renderScenario>["recording"]["ops"]) =>
    ops.flatMap((o) => (o.op === "text" && o.text.startsWith("≤") ? [o] : []));

  it("a limit the player writes is drawn once, mid-span, in board ink", () => {
    const { recording } = renderScenario({
      game: bridgesGame,
      id: LIMITED,
      moves: [{ ops: [{ op: "C", ...TOP_ROW, n: 1 }] }],
    });
    const labels = limitLabels(recording.ops);
    expect(labels.map((o) => [o.text, o.color])).toEqual([["≤1", COL_FOREGROUND]]);
    // On the middle square of the six between the two islands: x = 3.
    const ts = PREFERRED_TILE_SIZE;
    expect(Math.trunc(labels[0].x / ts)).toBe(3);
    expect(recording.ops).toMatchSnapshot();
  });

  it("a step that limits a span writes the limit in the action color", () => {
    const { recording } = hintFrame("limitsSpan");
    expect(limitLabels(recording.ops).map((o) => [o.text, o.color])).toEqual([
      ["≤1", COL_HINT],
    ]);
    expect(recording.ops).toMatchSnapshot();
  });

  it("a bridge the step adds to an existing one leaves the first in board ink", () => {
    // The half of "highlight, never perform" a bundle has to get right: raising
    // a span from one bridge to two draws two bars, and only the new one is the
    // hint's (docs/games/hints.md § "Echo the move's shape in the hint color").
    const { recording } = hintFrame("raisesSpan");
    expect(
      recording.ops.some((o) => o.op === "rect" && o.color === COL_FOREGROUND),
      "the board's own bridges vanished behind the hint",
    ).toBe(true);
  });
});

describe("Bridges drag preview", () => {
  // A 4 in the corner of a 3x3 board with a 2 along the row and a 2 down the
  // column, one empty square between each pair: two spans to drag along and to
  // move a drag between.
  const BOARD = `${encodeParams({ ...BRIDGES_PRESETS[0], w: 3, h: 3 }, true)}:4a2c2b`;
  const ACROSS = { x1: 0, y1: 0, x2: 2, y2: 0 };
  const TS = PREFERRED_TILE_SIZE;
  const center = (cell: number): number => cell * TS + border(TS) + TS / 2;
  type Board = ReturnType<typeof board>;

  /** A board with `ops` played, painted once so a later frame has a cache to
   * beat. */
  function board(ops: BridgesOp[] = []) {
    const m = new Midend(bridgesGame);
    expect(m.newGameFromId(BOARD)).toBeNull();
    if (ops.length > 0) m.playMoves([{ ops }]);
    m.redraw(new RecordingDrawing(m.getColorPalette(DEFAULT_BACKGROUND)));
    return m;
  }

  /** What the next frame paints on the square at (x, y): the color of each
   * bridge bar, of each cross stroke and of the limit written there. `null`
   * when the frame leaves the square alone. */
  function frame(m: Board, x: number, y: number) {
    const rec = new RecordingDrawing(m.getColorPalette(DEFAULT_BACKGROUND));
    m.redraw(rec);
    const ox = x * TS + border(TS);
    const oy = y * TS + border(TS);
    const from = rec.ops.findIndex(
      (o) => o.op === "clip" && o.x === ox && o.y === oy && o.w === TS && o.h === TS,
    );
    if (from < 0) return null;
    const to = rec.ops.findIndex((o, i) => i > from && o.op === "unclip");
    const ops = rec.ops.slice(from, to);
    return {
      // A bar runs the square's whole length and is an eighth of it across.
      bars: ops.flatMap((o) =>
        o.op === "rect" && Math.max(o.w, o.h) === TS && Math.min(o.w, o.h) === TS / 8
          ? [o.color]
          : [],
      ),
      crosses: ops.flatMap((o) => (o.op === "line" ? [o.color] : [])),
      limit: ops.flatMap((o) =>
        o.op === "text" && o.text.startsWith("≤") ? [[o.text, o.color]] : [],
      ),
    };
  }
  type Shown = NonNullable<ReturnType<typeof frame>>;

  const BARE: Shown = { bars: [], crosses: [], limit: [] };
  const press = (m: Board, button: number): void => {
    m.processInput(center(0), center(0), button);
  };
  const across = (m: Board, button: number): void => {
    m.processInput(center(2), center(0), button);
  };

  it.each([
    ["an empty span shows the first bridge", [], [COL_SELECTED]],
    [
      "a span with one bridge shows the two it would carry",
      [{ op: "L", ...ACROSS, n: 1 }],
      [COL_SELECTED, COL_SELECTED],
    ],
    ["a span at its limit shows them lifted off", [{ op: "L", ...ACROSS, n: 2 }], []],
  ] satisfies [
    string,
    BridgesOp[],
    number[],
  ][])("a bridge drag over %s", (_name, ops, bars) => {
    const m = board(ops);
    press(m, LEFT_BUTTON);
    across(m, LEFT_DRAG);
    expect(frame(m, 1, 0)).toEqual({ ...BARE, bars });
  });

  it.each([
    [
      "an unlimited span shows the limit it would write",
      [],
      { ...BARE, limit: [["≤1", COL_SELECTED]] },
    ],
    [
      "a span limited to one shows the cross",
      [{ op: "C", ...ACROSS, n: 1 }],
      { ...BARE, crosses: Array<number>(4).fill(COL_SELECTED) },
    ],
    ["a crossed span shows it bare", [{ op: "N", ...ACROSS }], BARE],
    [
      "a limit already down at its bridge shows the limit lifted",
      [
        { op: "L", ...ACROSS, n: 1 },
        { op: "C", ...ACROSS, n: 1 },
      ],
      { ...BARE, bars: [COL_SELECTED] },
    ],
  ] satisfies [
    string,
    BridgesOp[],
    Shown,
  ][])("a secondary drag over %s", (_name, ops, shown) => {
    const m = board(ops);
    press(m, RIGHT_BUTTON);
    across(m, RIGHT_DRAG);
    expect(frame(m, 1, 0)).toEqual(shown);
  });

  it("the release leaves what the preview showed, in board ink", () => {
    const m = board();
    press(m, LEFT_BUTTON);
    across(m, LEFT_DRAG);
    frame(m, 1, 0);
    across(m, LEFT_RELEASE);
    expect(frame(m, 1, 0)).toEqual({ ...BARE, bars: [COL_FOREGROUND] });
  });

  it("a drag that turns to another island moves the preview and leaves no trail", () => {
    const m = board();
    press(m, LEFT_BUTTON);
    across(m, LEFT_DRAG);
    frame(m, 1, 0);
    m.processInput(center(0), center(2), LEFT_DRAG);
    const left = frame(m, 1, 0);
    // A frame is consumed by reading it, so the square the drag turned to is
    // read from a second turn.
    across(m, LEFT_DRAG);
    frame(m, 1, 0);
    m.processInput(center(0), center(2), LEFT_DRAG);
    expect([left, frame(m, 0, 1)]).toEqual([BARE, { ...BARE, bars: [COL_SELECTED] }]);
  });

  it("a drag that returns to its island, or is canceled, puts the span back", () => {
    const m = board();
    press(m, LEFT_BUTTON);
    across(m, LEFT_DRAG);
    frame(m, 1, 0);
    press(m, LEFT_DRAG);
    expect(frame(m, 1, 0)).toEqual(BARE);

    across(m, LEFT_DRAG);
    frame(m, 1, 0);
    expect(m.cancelPress()).toBe(true);
    expect(frame(m, 1, 0)).toEqual(BARE);
  });
});

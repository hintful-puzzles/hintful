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
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import type { BridgesHighlights } from "./hint.ts";
import { bridgesGame } from "./index.ts";
import {
  COL_FOREGROUND,
  COL_HINT,
  COL_HINT_CELL,
  PREFERRED_TILE_SIZE,
} from "./render.ts";
import { BRIDGES_PRESETS, type BridgesMove, G_LINEH, G_LINEV } from "./state.ts";

const P = BRIDGES_PRESETS[2];
const ID = `${bridgesGame.encodeParams(P, true)}#bridges-scenario`;

const lit = (step: HintStep<BridgesMove, unknown>): BridgesHighlights =>
  step.highlights as BridgesHighlights;

/** The steps whose frames are asserted below. */
const pinned = describeHintPins({
  game: bridgesGame,
  params: [P],
  kinds: {
    citesIslands: (s) => lit(s).islands.length > 0,
    // One limit of one bridge, which is the one label the frame is read for.
    limitsSpan: (s) =>
      /at most one can run this way/.test(s.explanation) &&
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
  const { id, moves, step } = pinned(kind);
  const result = renderScenario({ game: bridgesGame, id, moves, showHint: true });
  expect(result.hint?.explanation).toBe(step.explanation);
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

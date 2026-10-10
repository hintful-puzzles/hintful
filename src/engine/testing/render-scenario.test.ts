// Mechanics of the Midend-backed scenario driver, exercised against a
// real full-featured game (Palisade: redraw + hint + findMistakes). The
// game-specific seed frames (the equivalentEdges hint) live in
// palisade-render-scenario.test.ts; this file pins the driver contract.
import { describe, expect, it } from "vitest";
import { newDesc } from "../../games/palisade/generator.ts";
import { palisadeGame } from "../../games/palisade/index.ts";
import { COL_GRID, COL_HINT } from "../../games/palisade/render.ts";
import { BORDER } from "../border-grid.ts";
import { randomNew } from "../random/index.ts";
import { renderPinnedHint, renderScenario } from "./render-scenario.ts";
import { toSvg } from "./svg-drawing.ts";

const P = palisadeGame.decodeParams("5x5n5");
const ID = `5x5n5:${newDesc(P, randomNew("render-scenario")).desc}`;

// A guaranteed-valid interior edge edit: toggle the wall between cells
// (1,1) and (2,1). executeMove just XORs the border bits, so this is a
// legal move on any board, independent of the generated clues.
const WALL_MOVE = {
  type: "edges" as const,
  edits: [
    { x: 1, y: 1, flag: BORDER(1) },
    { x: 2, y: 1, flag: BORDER(3) },
  ],
};

describe("renderScenario", () => {
  it("throws on an invalid id rather than capturing an empty frame", () => {
    expect(() => renderScenario({ game: palisadeGame, id: "not-an-id" })).toThrow(
      /invalid id/,
    );
  });

  it("captures a non-empty frame for a fresh board", () => {
    const { recording, size } = renderScenario({ game: palisadeGame, id: ID });
    expect(recording.ops.length).toBeGreaterThan(0);
    // The clue digits and the grid rim are drawn.
    expect(recording.ops.some((o) => o.op === "text")).toBe(true);
    expect(recording.ops.some((o) => o.op === "rect" && o.color === COL_GRID)).toBe(
      true,
    );
    expect(size.w).toBeGreaterThan(0);
    expect(size.h).toBeGreaterThan(0);
  });

  it("replays Moves directly through the midend (not pointer events)", () => {
    const before = renderScenario({ game: palisadeGame, id: ID });
    const after = renderScenario({ game: palisadeGame, id: ID, moves: [WALL_MOVE] });

    // The move actually took: the board state changed (the save bytes
    // differ) and so did the captured render.
    const beforeSave = before.midend.saveGame();
    const afterSave = after.midend.saveGame();
    expect(afterSave).not.toEqual(beforeSave);
    expect(JSON.stringify(after.recording.ops)).not.toBe(
      JSON.stringify(before.recording.ops),
    );
  });

  it("reports the mistake count (0 on a fresh board)", () => {
    const { mistakeCount } = renderScenario({
      game: palisadeGame,
      id: ID,
      showMistakes: true,
    });
    expect(mistakeCount).toBe(0);
  });

  it("shows a hint step and paints its action edge in COL_HINT", () => {
    const { hint, recording } = renderScenario({
      game: palisadeGame,
      id: ID,
      showHint: true,
    });
    expect(hint).toBeDefined();
    expect(recording.ops.some((o) => o.op === "rect" && o.color === COL_HINT)).toBe(
      true,
    );
  });

  it("shows a pinned plan's later leg, with the legs before it played", () => {
    const state = palisadeGame.newState(P, ID.slice(ID.indexOf(":") + 1));
    const plan = palisadeGame.hint?.(state);
    if (!plan?.ok) throw new Error("the board has a plan");
    const { steps } = plan;
    expect(steps.length).toBeGreaterThan(1);
    const pin = { id: ID, moves: [] };

    const leg = renderPinnedHint(palisadeGame, { ...pin, step: steps[1], index: 1 });
    expect(leg.hint.move).toEqual(steps[1].move);
    expect(leg.step).toBe(steps[1]);
    // The leg before it is on the board it is shown on: the save holds a move
    // the opener's does not.
    const opener = renderPinnedHint(palisadeGame, {
      ...pin,
      step: steps[0],
      index: 0,
    });
    expect(opener.hint.move).toEqual(steps[0].move);
    expect(leg.midend.saveGame().length).toBeGreaterThan(
      opener.midend.saveGame().length,
    );
    // A pin whose step the midend does not show is refused, not rendered.
    expect(() =>
      renderPinnedHint(palisadeGame, { ...pin, step: steps[1], index: 0 }),
    ).toThrow(/the midend shows/);
  });

  it("toSvg renders the same record as a well-formed SVG", () => {
    const { recording, size } = renderScenario({ game: palisadeGame, id: ID });
    const svg = toSvg(recording.ops, size);
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("</svg>");
    expect(svg).toContain("<rect");
    expect(svg).toContain(`width="${size.w}"`);
  });
});

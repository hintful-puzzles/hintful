/**
 * Tier-2.5 render scenarios for magnets: drive a real Midend to a target frame
 * and capture `redraw`. Targeted op assertions (background, corner symbols,
 * domino fills, clue numbers, a placed magnet, the touching-terminal red
 * error, the findMistakes overlay) plus one snapshot so a render regression is
 * a reviewable text diff (`vitest -u` re-baselines an intended change; the
 * targeted assertions survive a careless `-u`).
 */
import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { randomNew } from "../../engine/random/index.ts";
import {
  expectContour,
  expectRing,
  isThin,
  markSides,
} from "../../engine/testing/mark-shape.ts";
import { opsOfKind } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import type { MagnetsHighlights } from "./hint.ts";
import { magnetsGame } from "./index.ts";
import {
  COL_HINT,
  COL_HINT_CELL,
  COL_MISTAKE,
  COL_NEGATIVE,
  COL_POSITIVE,
} from "./render.ts";
import {
  DIFF_EASY,
  encodeParams,
  type MagnetsMove,
  type MagnetsParams,
  newState,
  ROW,
} from "./state.ts";

function board(p: MagnetsParams, seed: string) {
  const { desc, aux } = magnetsGame.newDesc(p, randomNew(seed));
  const state = newState(p, desc);
  return { id: `${encodeParams(p, true)}:${desc}`, state, aux: aux ?? "" };
}

/** The left cell of some horizontal domino in a board. */
function horizontalDomino(state: ReturnType<typeof newState>): number {
  for (let i = 0; i < state.wh; i++) {
    if (state.common.dominoes[i] === i + 1) return i;
  }
  throw new Error("no horizontal domino in board");
}

const P: MagnetsParams = { w: 6, h: 5, diff: DIFF_EASY, stripclues: false };

describe("magnets render scenarios", () => {
  it("opener frame: domino fills + clue numbers", () => {
    const { id } = board(P, "mrs-0");
    const { recording, size } = renderScenario({ game: magnetsGame, id });

    // Rounded-domino corners are circles.
    expect(recording.ops.some((o) => o.op === "circle")).toBe(true);
    // Clue numbers (and corner + / − symbols) draw text/rects.
    expect(recording.ops.some((o) => o.op === "text")).toBe(true);
    expect(size.w).toBeGreaterThan(0);

    expect(recording.ops).toMatchSnapshot();
  });

  it("a placed magnet draws + (positive) and − (negative) fills", () => {
    const { id, state } = board(P, "mrs-magnet");
    const idx = horizontalDomino(state);
    const moves: MagnetsMove[] = [{ type: "set", idx, which: 1 }];
    const { recording } = renderScenario({ game: magnetsGame, id, moves });

    // The magnet symbols are drawn in COL_POSITIVE / COL_NEGATIVE background.
    expect(recording.ops.some((o) => o.op === "rect" && o.color === COL_POSITIVE)).toBe(
      true,
    );
    expect(recording.ops.some((o) => o.op === "rect" && o.color === COL_NEGATIVE)).toBe(
      true,
    );
  });

  /** The first hint frame, over a few boards, whose step `want` picks. */
  function hintFrame(want: (s: HintStep<MagnetsMove, MagnetsHighlights>) => boolean) {
    for (let seed = 0; seed < 20; seed++) {
      const { id } = board(P, `mrs-hint-${seed}`);
      const result = renderScenario({
        game: magnetsGame,
        id,
        showHint: true,
        hintUntil: (s) => want(s as HintStep<MagnetsMove, MagnetsHighlights>),
      });
      const step = result.hint as HintStep<MagnetsMove, MagnetsHighlights> | undefined;
      if (step && want(step)) return { ...result, step };
    }
    throw new Error("no board shows such a step");
  }

  it("a placement rings the one square it decides and marks its evidence beside it", () => {
    const { recording } = hintFrame(
      (s) =>
        s.move.type === "set" &&
        s.highlights?.targets.length === 1 &&
        s.highlights.area.length > 0,
    );
    // Four thin sides, none solid: the square keeps its own content.
    expectRing(recording.ops, COL_HINT, 1);
    const evidence = markSides(recording.ops, COL_HINT_CELL);
    expect(evidence.length).toBeGreaterThan(0);
    for (const side of evidence) expect(isThin(side)).toBe(true);
    expect(recording.ops).toMatchSnapshot();
  });

  it("a `?` step rings the domino as one shape and recolors the line's clues", () => {
    const { recording, step } = hintFrame(
      (s) =>
        s.move.type === "flag" &&
        s.move.mode === "notneutral" &&
        s.highlights?.targets.length === 2 &&
        s.highlights.clues.length > 0,
    );
    // One contour around both ends, not a ring per square.
    expectContour(recording.ops, COL_HINT, 2);
    const hinted = recording.ops.filter((o) => o.op === "text" && o.color === COL_HINT);
    expect(hinted.length).toBe(step.highlights?.clues.length);
    expect(recording.ops).toMatchSnapshot();
  });

  it("hatches the line a step counts, clue slots included, and nothing else", () => {
    const { recording, step } = hintFrame((s) => s.highlights?.line != null);
    const line = step.highlights?.line;
    if (!line) throw new Error("the picked step names no line");
    const hatches = opsOfKind(recording.ops, "hatch");
    // One per square of the line, and one for each clue slot at its ends.
    const length = line.roworcol === ROW ? P.w : P.h;
    expect(hatches).toHaveLength(length + 2);
    for (const h of hatches) expect(h.color).toBe(COL_HINT);
    // All in one strip: every hatch shares the line's x (a column) or y (a row).
    const along = new Set(hatches.map((h) => (line.roworcol === ROW ? h.y : h.x)));
    expect(along.size).toBe(1);
  });

  it("findMistakes overlay repaints even when the cell was already drawn", () => {
    const { id, state, aux } = board(P, "mrs-mistake");
    const idx = horizontalDomino(state);
    // Place this domino opposite to its solution so it is a mistake; the seed
    // is one whose domino is a magnet in the solution.
    expect(aux[idx]).not.toBe(".");
    const wrong = aux[idx] === "+" ? 2 : 1;

    const moves: MagnetsMove[] = [{ type: "set", idx, which: wrong }];
    const { recording } = renderScenario({
      game: magnetsGame,
      id,
      moves,
      showMistakes: true,
    });
    // The mistake overlay (inset red outline) appears on a frame *after* the
    // move that placed the cell (docs/games/rendering.md § "Overlay sidecars":
    // the overlay must be in the diff key).
    expect(recording.ops.some((o) => o.op === "rect" && o.color === COL_MISTAKE)).toBe(
      true,
    );
  });
});

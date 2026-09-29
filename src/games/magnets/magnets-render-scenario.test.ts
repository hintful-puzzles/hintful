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
import { stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import {
  expectPieceRing,
  expectRing,
  isThin,
  markSides,
} from "../../engine/testing/mark-shape.ts";
import { opsOfKind, RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import type { MagnetsHighlights } from "./hint.ts";
import { CLUE, LINE, SQUARE } from "./hint-text.ts";
import { magnetsGame } from "./index.ts";
import {
  COL_HINT,
  COL_HINT_CELL,
  COL_MISTAKE,
  COL_NEGATIVE,
  COL_POSITIVE,
  colors,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
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

  /** The clue digits a step outlines as the count it reads. */
  const countedClues = (s: HintStep<MagnetsMove, MagnetsHighlights>) =>
    stepMarks(s)
      .of("outline", CLUE)
      .filter((c) => !s.highlights?.reasonClues.includes(c));

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
        stepMarks(s).of("ring", SQUARE).length === 1 &&
        stepMarks(s).of("outline", SQUARE).length > 0,
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
        stepMarks(s).of("ring", SQUARE).length === 2 &&
        countedClues(s).length > 0,
    );
    // One ring around both ends, not a ring per square.
    expectPieceRing(recording.ops, COL_HINT);
    const hinted = recording.ops.filter((o) => o.op === "text" && o.color === COL_HINT);
    expect(hinted.length).toBe(countedClues(step).length);
    expect(recording.ops).toMatchSnapshot();
  });

  it("hatches the line a step counts, clue slots included, and nothing else", () => {
    const { recording, step } = hintFrame(
      (s) => stepMarks(s).of("stripes", LINE).length > 0,
    );
    const [line] = stepMarks(step).of("stripes", LINE);
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

  it("a square repainting alone paints nothing into its partner's box", () => {
    const { state } = board(P, "mrs-0");
    const ts = PREFERRED_TILE_SIZE;
    const ds = newDrawState(state, ts);
    const ui = { cursor: { x: 0, y: 0, visible: false } };
    redraw(new RecordingDrawing(colors(DEFAULT_BACKGROUND)), ds, state, ui, 0);
    const leaders = [
      horizontalDomino(state),
      state.common.dominoes.findIndex((o, i) => o === i + state.w),
    ];
    expect(leaders[1]).toBeGreaterThanOrEqual(0);
    for (const i of leaders) {
      const x = i % state.w;
      const y = Math.floor(i / state.w);
      ui.cursor = { x, y, visible: false };
      redraw(new RecordingDrawing(colors(DEFAULT_BACKGROUND)), ds, state, ui, 0);
      // The cursor arriving repaints this square and not its partner, so
      // whatever the square paints past its own box stays on the canvas.
      ui.cursor = { x, y, visible: true };
      const dr = new RecordingDrawing(colors(DEFAULT_BACKGROUND));
      redraw(dr, ds, state, ui, 0);
      const box = {
        x0: (x + 1) * ts,
        y0: (y + 1) * ts,
        x1: (x + 2) * ts,
        y1: (y + 2) * ts,
      };
      const rects = opsOfKind(dr.ops, "rect");
      expect(rects.length).toBeGreaterThan(0);
      for (const r of rects) {
        expect(r.x).toBeGreaterThanOrEqual(box.x0);
        expect(r.y).toBeGreaterThanOrEqual(box.y0);
        expect(r.x + r.w).toBeLessThanOrEqual(box.x1);
        expect(r.y + r.h).toBeLessThanOrEqual(box.y1);
      }
    }
  });
});

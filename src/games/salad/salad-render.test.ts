/**
 * Tier-2.5 render scenarios for Salad, plus the two tier-2 frames the scenario
 * driver cannot reach (they depend on `Ui` state, which `renderScenario`
 * replays no pointer events to set).
 *
 * Each scenario pairs targeted op assertions — the real guarantee — with a
 * `toMatchSnapshot` so unintended drift shows up as a reviewable text diff.
 * Re-baseline an intended change with `vitest -u` and commit the regenerated
 * `__snapshots__/*.snap`.
 */
import { describe, expect, it } from "vitest";
import { newCursor } from "../../engine/pointer.ts";
import { describeHintKindPins } from "../../engine/testing/hint-positions.ts";
import { expectRing, isThin, markSides } from "../../engine/testing/mark-shape.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import type { SaladHint } from "./hint.ts";
import { saladGame } from "./index.ts";
import {
  COL_BACKGROUND,
  COL_BORDERCLUE,
  COL_CURSOR,
  COL_G_HOLE,
  COL_HIGHLIGHT,
  COL_HINT,
  COL_HINT_CELL,
  COL_I_BALLBG,
  COL_I_HOLE,
  COL_MISTAKE,
  COL_PENCIL,
  COL_PENCIL_BODY,
  FLASH_TIME,
  newDrawState,
  redraw,
} from "./render.ts";
import { saladSolution } from "./solver.ts";
import {
  DIFF_EASY,
  GAMEMODE_LETTERS,
  GAMEMODE_NUMBERS,
  newState,
  newUi,
  type SaladMove,
  type SaladParams,
} from "./state.ts";

const LETTERS_P: SaladParams = {
  order: 4,
  nums: 3,
  mode: GAMEMODE_LETTERS,
  diff: DIFF_EASY,
};
const LETTERS_DESC = "CaCbAfBaAa,p";
const LETTERS_ID = `4n3Lde:${LETTERS_DESC}`;

const NUMBERS_P: SaladParams = {
  order: 5,
  nums: 3,
  mode: GAMEMODE_NUMBERS,
  diff: DIFF_EASY,
};
const NUMBERS_DESC = "d1cO32b3aXa1d2b";
const NUMBERS_ID = `5n3Bde:${NUMBERS_DESC}`;

describe("salad render scenarios", () => {
  it("draws the ABC End View border clues in the margin", () => {
    const { recording } = renderScenario({ game: saladGame, id: LETTERS_ID });
    const clues = recording.ops.filter(
      (o) => o.op === "text" && o.color === COL_BORDERCLUE,
    );
    // The reference board carries five border clues (C, C, A, B, A).
    expect(clues).toHaveLength(5);
    expect(clues.map((o) => (o.op === "text" ? o.text : "")).sort()).toEqual([
      "A",
      "A",
      "B",
      "C",
      "C",
    ]);
    expect(recording.ops).toMatchSnapshot();
  });

  it("does not let a border clue's erase wipe the grid's outline", () => {
    // Regression: the four clue tiles abut the play area, and
    // the grid's outermost boundary lines are drawn by the neighboring *cells*
    // on the shared pixel. A clue that erases its whole tile therefore rubs out
    // the boundary — which happened on the right edge, so every row carrying a
    // right-hand clue lost its outer cell border. Assert the invariant (no
    // background fill may cover a boundary line) rather than the pixel offset,
    // so a different fix still passes.
    const ts = saladGame.preferredTileSize ?? 32;
    const o = LETTERS_P.order;
    const { recording } = renderScenario({ game: saladGame, id: LETTERS_ID });

    // The grid's outline, as a closed box: the cells paint their borders on
    // `x = ts`/`x = (o+1)·ts` and `y = ts−1`/`y = (o+1)·ts−1`. No clue-tile
    // erase may touch it.
    const box = {
      x0: ts,
      x1: (o + 1) * ts,
      y0: ts - 1,
      y1: (o + 1) * ts - 1,
    };
    // Only the clue-tile erases matter: they are the background fills smaller
    // than a whole tile (a cell's own repaint is `ts × ts` and legitimately
    // repaints its own borders straight afterwards).
    const erases = recording.ops.filter(
      (op) => op.op === "rect" && op.color === COL_BACKGROUND && op.w < ts,
    );
    expect(erases.length).toBeGreaterThan(0);
    for (const e of erases) {
      if (e.op !== "rect") continue;
      const overlaps =
        e.x <= box.x1 &&
        e.x + e.w - 1 >= box.x0 &&
        e.y <= box.y1 &&
        e.y + e.h - 1 >= box.y0;
      expect({ x: e.x, y: e.y, overlaps }).toEqual({ x: e.x, y: e.y, overlaps: false });
    }
  });

  it("draws Number Ball's balls and crosses", () => {
    const { recording } = renderScenario({ game: saladGame, id: NUMBERS_ID });
    // A ball is two concentric circles; a *given* one takes the immutable
    // ball background.
    expect(
      recording.ops.some((o) => o.op === "circle" && o.fill === COL_I_BALLBG),
    ).toBe(true);
    // A given cross is two thick strokes in the immutable hole color, and
    // none is drawn in the player's guess color on an untouched board.
    expect(recording.ops.some((o) => o.op === "line" && o.color === COL_I_HOLE)).toBe(
      true,
    );
    expect(recording.ops.some((o) => o.op === "line" && o.color === COL_G_HOLE)).toBe(
      false,
    );
    expect(recording.ops).toMatchSnapshot();
  });

  it("draws pencil marks after Mark all", () => {
    const moves: SaladMove[] = [{ type: "markAll" }];
    const { recording } = renderScenario({
      game: saladGame,
      id: NUMBERS_ID,
      moves,
    });
    const notes = recording.ops.filter(
      (o) => o.op === "text" && o.color === COL_PENCIL,
    );
    expect(notes.length).toBeGreaterThan(0);
    // The "might be empty" mark renders as an X alongside the digits.
    expect(notes.some((o) => o.op === "text" && o.text === "X")).toBe(true);
    expect(recording.ops).toMatchSnapshot();
  });

  it("outlines a Check & Save mistake in red", () => {
    const s = newState(NUMBERS_P, NUMBERS_DESC);
    const sol = saladSolution(s);
    if (!sol) throw new Error("expected a solution");
    const o = s.order;
    const i = sol.findIndex((v, k) => v > 0 && !s.gridclues[k]);
    const { recording, mistakeCount } = renderScenario({
      game: saladGame,
      id: NUMBERS_ID,
      moves: [
        { type: "set", x: i % o, y: (i / o) | 0, value: (sol[i] % NUMBERS_P.nums) + 1 },
      ],
      showMistakes: true,
    });
    expect(mistakeCount).toBeGreaterThan(0);
    expect(
      recording.ops.some((op) => op.op === "line" && op.color === COL_MISTAKE),
    ).toBe(true);
    expect(recording.ops).toMatchSnapshot();
  });
});

const hlOf = (step: { highlights?: unknown }): SaladHint =>
  step.highlights as SaladHint;

/** The steps whose frames are asserted below, each pinned on a position whose
 * hint opens with one. The letters board has one empty square per line. */
const pinned = describeHintKindPins({
  game: saladGame,
  params: [LETTERS_P, NUMBERS_P],
  kinds: {
    // The far rung, over a run of more than one square.
    confinedRun: (step) => step.rung === "borderFar" && hlOf(step).area.length > 1,
    // The near rung where the run is a single square: the square it decides
    // is the one outlined.
    nearestSquare: (step) => {
      const { area, targets } = hlOf(step);
      return (
        step.rung === "borderNear" &&
        targets.every((t) => area.some((a) => a.x === t.x && a.y === t.y))
      );
    },
    // The markers and a placement, on a numbers board.
    emptyMarker: (step, state) =>
      state.mode === GAMEMODE_NUMBERS && hlOf(step).ghost === "cross",
    symbolMarker: (step, state) =>
      state.mode === GAMEMODE_NUMBERS && hlOf(step).ghost === "circle",
    placement: (step, state) =>
      state.mode === GAMEMODE_NUMBERS && typeof hlOf(step).ghost === "number",
  },
  pins: {
    /** Held on 53 of 966 positions walked. */
    confinedRun: {
      id: "4n3Lde:bBcAAaBf,p",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":1,"y":3,"n":1},{"x":1,"y":3,"n":3}]}]',
    },
    /** Held on 56 of 966 positions walked. */
    nearestSquare: { id: "4n3Lde:bBcAAaBf,p", moves: [{ type: "pencilAll" }] },
    /** Held on 93 of 966 positions walked. */
    emptyMarker: "5n3Bde:bXc1ObOg2113Ob",
    /** Held on 103 of 966 positions walked. */
    symbolMarker: "5n3Bde:dXbXb2a1aX1bOb3c",
    /** Held on 128 of 966 positions walked. */
    placement: {
      id: "5n3Bde:Oa2b1bOd3b1Xc2bO",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":1},{"x":0,"y":0,"n":2},{"x":1,"y":0,"n":1},{"x":1,"y":0,"n":2},{"x":3,"y":0,"n":2},{"x":3,"y":0,"n":3},{"x":4,"y":0,"n":2},{"x":1,"y":1,"n":1},{"x":1,"y":1,"n":2},{"x":2,"y":1,"n":1},{"x":2,"y":1,"n":2},{"x":3,"y":1,"n":1},{"x":3,"y":1,"n":3},{"x":4,"y":1,"n":1},{"x":0,"y":2,"n":1},{"x":0,"y":2,"n":3},{"x":1,"y":2,"n":1},{"x":1,"y":2,"n":2},{"x":1,"y":2,"n":3},{"x":2,"y":2,"n":2},{"x":2,"y":2,"n":3},{"x":4,"y":2,"n":3},{"x":0,"y":3,"n":1},{"x":3,"y":3,"n":1},{"x":3,"y":3,"n":3},{"x":4,"y":3,"n":1},{"x":0,"y":4,"n":1},{"x":0,"y":4,"n":2},{"x":2,"y":4,"n":2},{"x":3,"y":4,"n":2},{"x":3,"y":4,"n":3},{"x":4,"y":4,"n":2}]}]',
    },
  },
});

describe("salad hint frames", () => {
  /** The frame a pinned position's hint draws, through a real `Midend`. */
  const hintFrame = (kind: Parameters<typeof pinned>[0]) => {
    const { id, moves, step } = pinned(kind);
    const result = renderScenario({ game: saladGame, id, moves, showHint: true });
    expect(result.hint?.explanation).toBe(step.explanation);
    return result;
  };

  it("outlines the run a clue's symbol is confined to, and lights the clue", () => {
    // The far arm: the clue's own symbol can sit only within the line's hole
    // budget of the clue, so the squares beyond it lose that candidate. The
    // outlined run is where it *can* be — the premise as an area, not one cell.
    const { recording, hint } = hintFrame("confinedRun");
    expect(hint?.explanation).toMatch(/has room for only \d+ empty square/);
    // The run is a **contour**: a side wherever the neighbor across it is not
    // also evidence, so a contiguous run of `n` squares comes out as `2n + 2`
    // thin sides rather than `4n` per-square rings or one solid wash.
    const outline = markSides(recording.ops, COL_HINT_CELL);
    expect(outline.length).toBeGreaterThan(4);
    for (const s of outline) expect(isThin(s)).toBe(true);
    // The premise is only visible if the clue glyph is part of the highlight:
    // it is redrawn in COL_HINT rather than the usual clue color.
    expect(recording.ops.some((o) => o.op === "text" && o.color === COL_HINT)).toBe(
      true,
    );
    // Each square acted on is ringed in COL_HINT, so its struck notes stay
    // legible.
    expectRing(
      recording.ops,
      COL_HINT,
      (hint?.highlights as SaladHint | undefined)?.targets.length,
    );
    expect(recording.ops).toMatchSnapshot();
  });

  it("outlines the nearest square a clue can see, when that is the whole premise", () => {
    // The near arm on a board with one empty square per line: the run really is
    // a single square, and saying so is honest rather than a missing area. One
    // square's contour is a ring — four sides, which is what the neighbor rule
    // gives when nothing beside it is evidence.
    const { recording, hint } = hintFrame("nearestSquare");
    expect(hint?.explanation).toMatch(/and this square is nearest to it/);
    expectRing(recording.ops, COL_HINT_CELL);
    expect(recording.ops.some((o) => o.op === "text" && o.color === COL_HINT)).toBe(
      true,
    );
  });

  it("previews an empty-square marker as a cross in the hint color", () => {
    const { recording, hint } = hintFrame("emptyMarker");
    expect(hint?.explanation).toMatch(/must be empty/);
    // Salad writes three shapes, so the hint echoes the one it is asking for —
    // here the two strokes of a cross, in COL_HINT.
    const strokes = recording.ops.filter(
      (o) => o.op === "line" && o.color === COL_HINT,
    );
    expect(strokes.length).toBeGreaterThanOrEqual(2);
    expect(recording.ops).toMatchSnapshot();
  });

  it("previews a holds-a-symbol marker as a ball in the hint color", () => {
    const { recording, hint } = hintFrame("symbolMarker");
    expect(hint?.explanation).toMatch(/hold a number|holds a number/);
    expect(recording.ops.some((o) => o.op === "circle" && o.outline === COL_HINT)).toBe(
      true,
    );
    expect(recording.ops).toMatchSnapshot();
  });

  it("previews a placement as its own symbol, and strikes what it rules out", () => {
    const { recording, hint } = hintFrame("placement");
    const want = hint?.explanation.match(/it can only be (\d)/)?.[1];
    expect(want).toBeDefined();
    expect(
      recording.ops.some(
        (o) => o.op === "text" && o.color === COL_HINT && o.text === want,
      ),
    ).toBe(true);
    expect(recording.ops).toMatchSnapshot();
  });

  it("crosses a struck candidate through, keeping the note itself legible", () => {
    // The Towers convention: the struck note keeps COL_PENCIL (so it still reads
    // as a real note) and gains a strikethrough in the same color.
    // A walk down one plan on a fixed board, not a pin: the strike follows a
    // placement inside a plan and opened none of 966 hints asked afresh.
    const { recording } = renderScenario({
      game: saladGame,
      id: NUMBERS_ID,
      showHint: true,
      hintUntil: (step) => step.rung === "dup",
    });
    const notes = recording.ops.filter(
      (o) => o.op === "text" && o.color === COL_PENCIL,
    );
    const rules = recording.ops.filter(
      (o) => o.op === "line" && o.color === COL_PENCIL,
    );
    expect(notes.length).toBeGreaterThan(0);
    expect(rules.length).toBeGreaterThan(0);
  });
});

// --- tier 2: frames that depend on Ui state --------------------------------

/** Paint one frame straight against the game's `redraw`, so the `Ui` (cursor,
 * pencil mode) and the flash clock can be set explicitly. */
function paint(
  state: ReturnType<typeof newState>,
  ui: ReturnType<typeof newUi>,
  flashTime = 0,
): RecordingDrawing {
  const ds = newDrawState(state, saladGame.preferredTileSize ?? 32);
  const rec = new RecordingDrawing(saladGame.colors(DEFAULT_BACKGROUND));
  redraw(rec, ds, null, state, 0, ui, 0, flashTime);
  return rec;
}

describe("salad Ui-driven frames", () => {
  it("fills the selected square, and shows a corner triangle in pencil mode", () => {
    const s = newState(LETTERS_P, LETTERS_DESC);
    const ui = { ...newUi(s), cursor: newCursor(1, 2, true) };

    const ink = paint(s, ui);
    expect(
      ink.ops.some(
        (o) => o.op === "rect" && o.color === COL_CURSOR && o.w === 40 && o.h === 40,
      ),
    ).toBe(true);
    // No pencil-mode glyph while entering ink.
    expect(ink.ops.some((o) => o.op === "polygon" && o.fill === COL_PENCIL_BODY)).toBe(
      false,
    );

    const pencil = paint(s, { ...ui, pencilMode: true });
    // The pencil highlight is a half-tile corner triangle, not a full fill.
    expect(
      pencil.ops.some(
        (o) => o.op === "polygon" && o.fill === COL_CURSOR && o.points.length === 3,
      ),
    ).toBe(true);
    // ...and the CapsLock-style indicator appears in the clue margin.
    expect(
      pencil.ops.some((o) => o.op === "polygon" && o.fill === COL_PENCIL_BODY),
    ).toBe(true);
  });

  it("plays the completion flash as a moving three-phase wave", () => {
    const s = newState(LETTERS_P, LETTERS_DESC);
    const ui = newUi(s);
    // Two phases of the same flash must paint *differently* — a snapshot alone
    // cannot tell you an animation is moving (docs/games/rendering.md § "The tile cache and the diff key").
    const phaseA = paint(s, ui, FLASH_TIME);
    const phaseB = paint(s, ui, FLASH_TIME - 0.1);
    const wave = (r: RecordingDrawing) =>
      r.ops
        .filter((o) => o.op === "rect" && o.color === COL_HIGHLIGHT)
        .map((o) => (o.op === "rect" ? `${o.x},${o.y}` : ""))
        .join(" ");
    expect(wave(phaseA)).not.toBe("");
    expect(wave(phaseA)).not.toBe(wave(phaseB));
  });
});

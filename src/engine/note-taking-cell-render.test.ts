/**
 * The note-taking cell's picture, in every game that carries the mechanic.
 *
 * Each member is dealt its default board, painted once with the highlight
 * hidden, and then repainted **on the same draw state** through the frames a
 * player moves between. Because the draw state is kept, each frame below is
 * only what the game *repainted* — so it records the highlight's picture and,
 * as a side effect, that the game's tile cache noticed the highlight at all: a
 * game that left the highlight out of its tile key would repaint nothing, and
 * the "put away" frame would be empty.
 *
 * What is asserted is the picture the player learns once and meets everywhere:
 * the whole cell in the wash for entry, a right triangle in the wash in the
 * top-left corner for notes, and neither once the highlight is put away. The
 * wash is `highlightWash` of the host background, derived here rather than read
 * off any game's palette, so a game cannot pass by agreeing with itself.
 *
 * The geometry itself is `drawCellBackground`'s and is unit-tested beside it in
 * `note-taking-cell.test.ts`; the snapshots are what notice a game handing it a
 * different rect.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { mkhighlightBackground, resolvePalette } from "./color/color-mkhighlight.ts";
import { highlightWash } from "./color/palette.ts";
import {
  type BuiltGame,
  builtGames,
  enrolledIn,
  membersNotMentioning,
} from "./testing/enrollment.ts";
import { preferredDrawState } from "./testing/preferred-draw-state.ts";
import {
  type DrawOp,
  opsOfKind,
  RecordingDrawing,
  rgbLabel,
} from "./testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "./testing/render-scenario.ts";

beforeAll(registerAllGames);

const WASH = rgbLabel(highlightWash(mkhighlightBackground(DEFAULT_BACKGROUND)));

/** Where to look for a cell the game will highlight, `(1, 1)` first: a border
 * cell is where games put their special cases, and a clue or a wall is where
 * they rightly show something else (Crossing's corner brackets on a wall). */
const CANDIDATES = [
  { x: 1, y: 1 },
  ...Array.from({ length: 16 }, (_, i) => ({ x: i % 4, y: Math.floor(i / 4) })),
];

interface Frames {
  entry: DrawOp[];
  keyboard: DrawOp[];
  notes: DrawOp[];
  away: DrawOp[];
}

interface NoteTakingFields {
  cursor: { x: number; y: number; visible: boolean };
  pencilMode: boolean;
  cursorFromKeyboard: boolean;
}

function framesAt(g: BuiltGame, at: { x: number; y: number }): Frames {
  const { game, state } = g;
  const palette = resolvePalette(game, DEFAULT_BACKGROUND);
  const ds = preferredDrawState(game, state);
  const ui = game.newUi(state) as NoteTakingFields;
  const paint = (): DrawOp[] => {
    const rec = new RecordingDrawing(palette);
    game.redraw(rec, ds, null, state, 1, ui, 0, 0);
    return rec.ops;
  };

  ui.cursor.visible = false;
  paint();
  ui.cursor = { ...at, visible: true };
  ui.cursorFromKeyboard = false;
  const entry = paint();
  ui.cursor.visible = false;
  paint();
  ui.cursor.visible = true;
  ui.cursorFromKeyboard = true;
  const keyboard = paint();
  ui.cursorFromKeyboard = false;
  ui.pencilMode = true;
  const notes = paint();
  ui.cursor.visible = false;
  ui.pencilMode = false;
  const away = paint();
  return { entry, keyboard, notes, away };
}

const washedRects = (ops: DrawOp[]) =>
  opsOfKind(ops, "rect").filter((o) => o.rgb === WASH);

/** The notes triangle: three points, a right angle at the first, legs along
 * the axes running right and down — the top-left corner of whatever it sits in. */
const cornerTriangles = (ops: DrawOp[]) =>
  opsOfKind(ops, "polygon").filter((o) => {
    if (o.fillRgb !== WASH || o.points.length !== 3) return false;
    const [[x0, y0], [x1, y1], [x2, y2]] = o.points;
    return y1 === y0 && x1 > x0 && x2 === x0 && y2 > y0;
  });

/** The first candidate cell whose entry frame shows the wash, and its frames.
 * Throws inside the test that asks, so one game failing to find one fails that
 * game rather than the collection of the whole file. */
function framesOf(
  g: BuiltGame,
): () => { at: { x: number; y: number }; frames: Frames } {
  for (const at of CANDIDATES) {
    const frames = framesAt(g, at);
    if (washedRects(frames.entry).length > 0) return () => ({ at, frames });
  }
  return () => {
    throw new Error(`${g.id}: no cell near the corner shows the wash when selected`);
  };
}

const noteTaking = enrolledIn(
  (g) =>
    typeof g.ui["pencilMode"] === "boolean" &&
    typeof g.ui["cursorFromKeyboard"] === "boolean",
);

it("looked at the note-taking games (vacuity guard)", () => {
  expect(noteTaking.population).toBeGreaterThanOrEqual(50);
  expect(noteTaking.ids.length).toBeGreaterThanOrEqual(11);
});

it("every member paints its cell background through drawCellBackground", () => {
  // A source scan for the reason `note-taking-cell.test.ts` gives for its own:
  // what is being asserted is that no hand-drawn copy exists beside the shared
  // one, which no frame can show.
  expect(
    membersNotMentioning(noteTaking.ids, "drawCellBackground("),
    "carry the note-taking Ui but draw the highlight by hand",
  ).toEqual([]);
});

describe.each(noteTaking.ids)("%s", (id) => {
  const g = builtGames().find((b) => b.id === id) as BuiltGame;
  const found = framesOf(g);

  it("washes the whole cell for entry, from the mouse and the keyboard alike", () => {
    const { frames } = found();
    expect(cornerTriangles(frames.entry)).toEqual([]);
    expect(washedRects(frames.keyboard).length, "keyboard").toBeGreaterThan(0);
  });

  it("draws the corner triangle, and only it, for notes", () => {
    const { frames } = found();
    // One place, though maybe painted more than once: Towers repaints a tile's
    // neighbors with it, because a raised tower's faces overlap them.
    const places = new Set(cornerTriangles(frames.notes).map((o) => `${o.points}`));
    expect(places.size).toBe(1);
    expect(washedRects(frames.notes)).toEqual([]);
  });

  it("repaints the cell when the highlight is put away", () => {
    const { frames } = found();
    expect(frames.away.length).toBeGreaterThan(0);
    expect(washedRects(frames.away)).toEqual([]);
    expect(cornerTriangles(frames.away)).toEqual([]);
  });

  it("matches its recorded frames", () => {
    const { at, frames } = found();
    expect({ at, ...frames }).toMatchSnapshot();
  });
});

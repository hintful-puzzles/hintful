/**
 * Mosaic (upstream's `mosaic.c`, Fill-a-Pix): numeric clues count the
 * black cells of their 3×3 neighborhood (itself included); mark every
 * cell black or white. Click toggles unmarked→black→white→unmarked
 * (right-click cycles the other way); aligned drags paint the click's
 * mark across a straight run.
 */

import type { Game, UiUpdate } from "../../engine/game.ts";
import { dimensionParamConfig, transposeDimensions } from "../../engine/params.ts";
import {
  cursorDelta,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  newCursor,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  interpretTargetVerbs,
  squareGrid,
  type TargetVerbs,
  verbClicks,
} from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { type MosaicHint, mosaicHint, mosaicKeepTrack } from "./hint.ts";
import {
  colors,
  computeSize,
  FLASH_TIME,
  type MosaicDrawState,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import { encodeSolution, findMistakes, newDesc, solveGameActual } from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  MAX_TILES,
  type MosaicMistake,
  type MosaicMove,
  type MosaicParams,
  type MosaicState,
  type MosaicUi,
  newState,
  paintRun,
  presets,
  STATE_MARK_MASK,
  STATE_UNMARKED,
  status,
  statusbarText,
  textFormat,
  validateDesc,
  validateParams,
} from "./state.ts";

function isMouseEvent(button: number): boolean {
  return button >= LEFT_BUTTON && button <= RIGHT_RELEASE;
}

// --- input -------------------------------------------------------------

function newUi(_state: MosaicState): MosaicUi {
  return {
    lastX: -1,
    lastY: -1,
    lastState: 0,
    cursor: newCursor(),
  };
}

/** A verb that cycles the square one way: `double` is the right button's
 * way round, two steps forward in a cycle of three. */
const toggle =
  (double: boolean) =>
  (_s: MosaicState, { x, y }: Point): MosaicMove => ({ type: "toggle", x, y, double });

const targetVerbs: TargetVerbs<
  MosaicState,
  MosaicUi,
  MosaicDrawState,
  Point,
  MosaicMove
> = {
  geometry: squareGrid({
    size: (s) => ({ w: s.width, h: s.height }),
    border: (ts) => Math.floor(ts / 2),
  }),
  primary: {
    does: "turn it black, then white, then empty again",
    apply: toggle(false),
  },
  secondary: {
    does: "turn it white, then black, then empty again",
    apply: toggle(true),
  },
};

function interpretMove(
  state: MosaicState,
  ui: MosaicUi,
  ds: MosaicDrawState,
  p: Point,
  button: number,
): MosaicMove | null | UiUpdate {
  const raw = stripModifiers(button);
  const { width, height } = state;

  // After completion, only cursor browsing is accepted (upstream freeze).
  if (state.notCompletedClues === 0 && !cursorDelta(raw)) return null;

  const ts = ds.tileSize;
  const m = Math.floor(ts / 2);
  const offsetX = p.x - m;
  const offsetY = p.y - m;
  const gameX = Math.floor(offsetX / ts);
  const gameY = Math.floor(offsetY / ts);
  const inBounds = gameX >= 0 && gameY >= 0 && gameX < width && gameY < height;

  if (isMouseEvent(raw) && (offsetX < 0 || offsetY < 0)) return null;

  if (raw === LEFT_BUTTON || raw === RIGHT_BUTTON) {
    if (!inBounds) {
      ui.lastX = -1;
      ui.lastY = -1;
      return null;
    }
    // Capture the mark this cell is about to become; aligned drags and
    // the release paint it onto still-unmarked cells.
    const cur = state.cells[gameY * width + gameX] & STATE_MARK_MASK;
    ui.lastState = (cur + (raw === RIGHT_BUTTON ? 2 : 1)) % STATE_MARK_MASK;
    ui.lastX = gameX;
    ui.lastY = gameY;
    return interpretTargetVerbs(targetVerbs, state, ui, ds, p, raw);
  }

  const isDrag = raw === LEFT_DRAG || raw === RIGHT_DRAG;
  if (isDrag || raw === LEFT_RELEASE || raw === RIGHT_RELEASE) {
    ui.cursor.visible = false;
    const aligned =
      inBounds &&
      ui.lastX >= 0 &&
      ui.lastY >= 0 &&
      (gameY === ui.lastY || gameX === ui.lastX);
    if (!aligned) {
      ui.lastX = -1;
      ui.lastY = -1;
      return null;
    }
    const move: MosaicMove = {
      type: "paint",
      x: gameX,
      y: gameY,
      srcX: ui.lastX,
      srcY: ui.lastY,
      paintState: ui.lastState,
    };
    // Upstream's `changed` check: a paint that would change no cell emits
    // no move, so it leaves no no-op entry in the history.
    const changed =
      ui.lastState !== STATE_UNMARKED &&
      paintRun(gameX, gameY, ui.lastX, ui.lastY).some(
        (c) =>
          c.x < width &&
          c.y < height &&
          (state.cells[c.y * width + c.x] & STATE_MARK_MASK) === 0,
      );
    if (isDrag) {
      // The drag anchor advances; the release keeps it.
      ui.lastX = gameX;
      ui.lastY = gameY;
    }
    return changed ? move : null;
  }

  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, raw);
}

// --- flash --------------------------------------------------------------

function flashLength(
  prev: MosaicState,
  next: MosaicState,
  _dir: number,
  _ui: MosaicUi,
): number {
  if (!prev.cheated && prev.notCompletedClues > 0 && next.notCompletedClues === 0) {
    return FLASH_TIME;
  }
  return 0;
}

// --- Game object -----------------------------------------------------------

export const mosaicGame: Game<
  MosaicParams,
  MosaicState,
  MosaicMove,
  MosaicUi,
  MosaicDrawState,
  MosaicMistake,
  MosaicHint
> = {
  id: "mosaic",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions<MosaicParams>({ w: "width", h: "height" }),
  paramConfig: [
    ...dimensionParamConfig<MosaicParams>({
      fields: { w: "width", h: "height" },
      doc: `Size of the grid in squares. The grid may hold at most ${MAX_TILES} squares.`,
      bounds: { min: 3 },
    }),
    {
      kw: "aggressive-generation",
      name: "Aggressive generation",
      type: "boolean",
      doc: "Every puzzle hides the clues the game never used while solving it. When on, the game also tries taking away each clue that remains, and keeps it away whenever the puzzle can still be solved without it, so fewer numbers are shown, which usually makes the puzzle harder.",
      label: {
        slot: "tail",
        // Upstream recommends it off above about 30x30, and its presets follow.
        words: (p) =>
          p.aggressive === p.width * p.height < 30 * 30
            ? null
            : `${p.aggressive ? "slower" : "faster"} generation`,
      },
      get: (p) => p.aggressive,
      set: (p, v) => {
        p.aggressive = v;
      },
    },
  ],

  newDesc,
  validateDesc,
  newState,
  newUi,

  targetVerbs,
  interpretMove,
  executeMove,
  status,

  solve(orig, _curr) {
    const sol = solveGameActual(orig.board);
    if (!sol) return { ok: false, error: "Could not solve this board" };
    return { ok: true, move: { type: "solve", solution: encodeSolution(sol) } };
  },

  findMistakes,

  hint: mosaicHint,
  hintKeepTrack: mosaicKeepTrack,
  // A tap on each of the step's squares: a tap cycles a filled square too,
  // where a drag would paint only empty ones.
  hintGesture: (state, ui, ds, m, step) =>
    m.type === "fill"
      ? verbClicks(
          targetVerbs,
          { executeMove, hintKeepTrack: mosaicKeepTrack },
          state,
          ui,
          ds,
          step,
          m.cells.map((i) => ({ x: i % state.width, y: Math.floor(i / state.width) })),
        )
      : [],
  hintMarks: {
    roles: {
      ring: "the squares the step decides; the sentence says whether they must be black or white.",
      outline:
        "the number the step reasons from and its block: the number's own square and the eight around it.",
    },
  },

  textFormat,
  statusbarText,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  flashLength,
};

registerGame(mosaicGame);

/**
 * Netslide — Richard Boulton's cross between Net and Sixteen.
 *
 * The board is a Net wiring grid whose solved form is a spanning tree rooted at
 * the center. Instead of rotating a tile, you slide a whole row or column, and
 * it wraps around. The center row and center column cannot be slid — that one
 * restriction is what turns a shuffle into a puzzle.
 *
 * There is no solver: the generator saves the unshuffled grid as `aux` and
 * `solve` replays it, faithful to upstream.
 */

import { assertNever } from "../../engine/assert-never.ts";
import type { Game, SolveResult } from "../../engine/game.ts";
import { UI_UPDATE, type UiUpdate } from "../../engine/game.ts";
import { click } from "../../engine/hint-gesture.ts";
import {
  atof,
  dimensionParamConfig,
  formatG,
  numberItem,
  transposeDimensions,
} from "../../engine/params.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  isCursorMove,
  LEFT_BUTTON,
  RIGHT_BUTTON,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { GameStatus, Point } from "../../engine/types.ts";
import { newDesc } from "./generator.ts";
import { arrowFor, hint, hintKeepTrack, type NetslideHint, parseAux } from "./hint.ts";
import { reconstructSolution } from "./reconstruct.ts";
import {
  ANIM_TIME,
  border,
  colors,
  computeSize,
  FLASH_FRAME,
  type NetslideDrawState,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  c2diff,
  c2pos,
  computeActive,
  decodeParams,
  defaultParams,
  encodeParams,
  isComplete,
  type NetslideMove,
  type NetslideParams,
  type NetslideState,
  type NetslideUi,
  newState,
  newUi,
  pos2c,
  slideCol,
  slideRow,
  validateDesc,
  validateParams,
} from "./state.ts";

/** The 9 upstream presets. "Difficulty" is entirely a matter of how much help
 * the barriers give: at probability 1 every wall the solution permits is drawn
 * in, which pins most tiles; at 0 you get none; wrapping removes the border
 * walls too, which is harder again. */
const PRESETS: NetslideParams[] = [
  { w: 3, h: 3, wrapping: false, barrierProbability: 1, movetarget: 0 },
  { w: 3, h: 3, wrapping: false, barrierProbability: 0, movetarget: 0 },
  { w: 3, h: 3, wrapping: true, barrierProbability: 0, movetarget: 0 },
  { w: 4, h: 4, wrapping: false, barrierProbability: 1, movetarget: 0 },
  { w: 4, h: 4, wrapping: false, barrierProbability: 0, movetarget: 0 },
  { w: 4, h: 4, wrapping: true, barrierProbability: 0, movetarget: 0 },
  { w: 5, h: 5, wrapping: false, barrierProbability: 1, movetarget: 0 },
  { w: 5, h: 5, wrapping: false, barrierProbability: 0, movetarget: 0 },
  { w: 5, h: 5, wrapping: true, barrierProbability: 0, movetarget: 0 },
];

function presetTitle(p: NetslideParams): string {
  const difficulty = p.wrapping
    ? "hard"
    : p.barrierProbability === 1
      ? "easy"
      : "medium";
  return `${p.w}x${p.h} ${difficulty}`;
}

/* ----------------------------------------------------------------------
 * Moves.
 */

function executeMove(s: NetslideState, m: NetslideMove): NetslideState {
  if (m.type === "solve") {
    if (m.tiles.length !== s.w * s.h) throw new Error("solve move has the wrong size");
    return {
      ...s,
      tiles: Uint8Array.from(m.tiles),
      cheated: true,
      completed: 1,
      moveCount: 1,
      // Upstream leaves the previous move's line here, so Solve animates a
      // phantom slide of the finished grid; clearing it lets Solve simply show
      // the answer.
      lastMoveRow: -1,
      lastMoveCol: -1,
      lastMoveDir: 0,
    };
  }
  if (m.type !== "slide") return assertNever(m, "netslide: executeMove");

  const limit = m.axis === "col" ? s.w : s.h;
  if (m.index < 0 || m.index >= limit) throw new Error(`no such ${m.axis} ${m.index}`);

  const tiles = new Uint8Array(s.tiles);
  if (m.axis === "col") slideCol(s.w, s.h, tiles, m.dir, m.index);
  else slideRow(s.w, tiles, m.dir, m.index);

  const moveCount = s.moveCount + 1;
  return {
    ...s,
    tiles,
    moveCount,
    completed: s.completed || (isComplete(s, tiles) ? moveCount : 0),
    lastMoveRow: m.axis === "col" ? -1 : m.index,
    lastMoveCol: m.axis === "col" ? m.index : -1,
    lastMoveDir: m.dir,
  };
}

/**
 * A click in the gutter beside a row or column slides that line; the **right
 * button reverses** the direction. A click beside the center row or center
 * column does nothing — those lines cannot be slid.
 *
 * The keyboard cursor walks the ring of arrow positions and select slides the
 * line it is on. (As upstream, `CURSOR_SELECT2` does *not* reverse — only the
 * real right mouse button does.)
 */
/** The cell a press lands in along one axis, the gutters being `-1` and the
 * size. The `+2 … −2` shuffle keeps the division positive so it truncates the
 * way C's does. */
function cellAt(pixel: number, ts: number): number {
  return Math.floor((pixel - (border(ts) + 1) + 2 * ts) / ts) - 2;
}

/** The middle of cell `c` along one axis, as {@link cellAt} reads it. */
function cellCenter(c: number, ts: number): number {
  return border(ts) + 1 + c * ts + Math.floor(ts / 2);
}

function interpretMove(
  s: NetslideState,
  ui: NetslideUi,
  ds: NetslideDrawState,
  p: Point,
  rawButton: number,
): NetslideMove | null | UiUpdate {
  const button = stripModifiers(rawButton);
  const ts = ds.tileSize;

  if (isCursorMove(button)) {
    const diff = c2diff(s.w, s.h, ui.cursor.x, ui.cursor.y, button);
    if (diff !== 0) {
      let pos = c2pos(s.w, s.h, ui.cursor.x, ui.cursor.y);
      // Step along the ring until we land on a line that can actually be slid.
      do {
        pos += diff;
        const c = pos2c(s.w, s.h, pos);
        ui.cursor.x = c.cx;
        ui.cursor.y = c.cy;
      } while (ui.cursor.x === s.cx || ui.cursor.y === s.cy);
    }
    ui.cursor.visible = true;
    return UI_UPDATE;
  }

  let cx: number;
  let cy: number;

  if (button === LEFT_BUTTON || button === RIGHT_BUTTON) {
    cx = cellAt(p.x, ts);
    cy = cellAt(p.y, ts);
    ui.cursor.visible = false;
  } else if (button === CURSOR_SELECT || button === CURSOR_SELECT2) {
    if (!ui.cursor.visible) {
      // A select with no cursor showing just reveals it.
      ui.cursor.visible = true;
      return UI_UPDATE;
    }
    cx = ui.cursor.x;
    cy = ui.cursor.y;
  } else {
    return null;
  }

  const sign = button === RIGHT_BUTTON ? -1 : 1;
  // Beside a row: the left gutter slides it left, the right gutter right.
  if (cy >= 0 && cy < s.h && cy !== s.cy && (cx === -1 || cx === s.w)) {
    const dir = (cx === -1 ? sign : -sign) as 1 | -1;
    return { type: "slide", axis: "row", index: cy, dir };
  }
  // Beside a column: the top gutter slides it up, the bottom gutter down.
  if (cx >= 0 && cx < s.w && cx !== s.cx && (cy === -1 || cy === s.h)) {
    const dir = (cy === -1 ? sign : -sign) as 1 | -1;
    return { type: "slide", axis: "col", index: cx, dir };
  }
  return null;
}

/* ----------------------------------------------------------------------
 * The Game.
 */

export const netslideGame: Game<
  NetslideParams,
  NetslideState,
  NetslideMove,
  NetslideUi,
  NetslideDrawState,
  unknown,
  NetslideHint
> = {
  id: "netslide",

  defaultParams,
  presets: () => ({
    title: "Netslide",
    submenu: PRESETS.map((p) => ({ title: presetTitle(p), params: { ...p } })),
  }),
  encodeParams,
  decodeParams,
  validateParams,

  transposeParams: transposeDimensions(),
  paramConfig: [
    ...dimensionParamConfig<NetslideParams>({
      doc: "Size of the grid in squares.",
      bounds: { min: 2 },
    }),
    {
      kw: "walls-wrap-around",
      name: "Walls wrap around",
      type: "boolean",
      doc: "When on, the network may run off one edge of the grid and come back on the opposite edge, so the outside of the grid is no longer a wall.",
      label: { slot: "kind", words: (p) => (p.wrapping ? "wrapping" : null) },
      get: (p) => p.wrapping,
      set: (p, v) => {
        p.wrapping = v;
      },
    },
    {
      kw: "barrier-probability",
      name: "Barrier probability",
      type: "string",
      doc: "The share of the places where the finished network has no wire that get a barrier drawn across them. At 0 there are no barriers inside the grid; at 1 every such place has one, which gives away a lot about the solution.",
      bounds: { min: 0, max: 1 },
      label: {
        slot: "tail",
        words: (p) =>
          p.barrierProbability > 0
            ? `${Math.round(p.barrierProbability * 100)}% barriers`
            : null,
      },
      get: (p) => formatG(p.barrierProbability),
      // The C stores this as a `float`, and the board depends on the exact
      // value, so round to single precision here rather than at generation.
      set: (p, v) => {
        p.barrierProbability = Math.fround(atof(v));
      },
    },
    numberItem<NetslideParams>(
      "number-of-shuffling-moves",
      "Number of shuffling moves",
      "movetarget",
      {
        doc: "How many random slides scramble the finished network. At 0, the number is chosen from the size of the grid.",
        bounds: { min: 0 },
        label: {
          slot: "tail",
          words: (p) => (p.movetarget ? `${p.movetarget} shuffles` : null),
        },
      },
    ),
  ],

  newDesc,
  validateDesc,
  newState,
  newUi,

  interpretMove,
  executeMove,

  // The midend upgrades this to "solved-with-help" when Solve was used.
  status: (s): GameStatus => (s.completed ? "solved" : "ongoing"),
  notApplicable: {
    findMistakes:
      "Every arrangement of the tiles is a step on the way to the answer, so no move can be wrong, only longer.",
  },

  // Netslide has no solver, so the answer is the generator's unshuffled grid.
  // A game that arrived as a shared link or a bookmark carries no `aux`, and
  // upstream simply gives up on those; we recover the finished grid from the
  // board instead (`reconstruct.ts`), so Solve — and Hint — work on any board a
  // player can actually be looking at.
  solve: (_orig, curr, aux): SolveResult<NetslideMove> => {
    const tiles = parseAux(aux ?? null, curr.w * curr.h) ?? reconstructSolution(curr);
    if (!tiles) return { ok: false, error: "Solution not known for this puzzle" };
    return { ok: true, move: { type: "solve", tiles: Array.from(tiles) } };
  },

  hint,
  hintMarks: {
    roles: {
      ring: "what the step decides: the piece it is placing, with a double ring round its square, the arrow to click, drawn in the hint's color, and the square the slide takes the piece to, outlined. A solid outline is where the piece belongs; a dashed one is a square it is only passing through, or being parked in to set up a later move. When the slide only starts a longer journey, both squares are marked, and the dashed one nearer the piece is where this slide lands it. The words name the piece by its shape: a *loose end*, a *straight*, a *corner*, a *T-piece* or a *cross*.",
      stripes:
        "the source's row or column, when the hint says it never slides: a piece sitting in it can only be moved along the other direction.",
    },
  },
  hintKeepTrack,
  hintGesture(s, _ui, ds, m) {
    if (m.type !== "slide") return [];
    const { arrowX, arrowY } = arrowFor(s, m);
    const ts = ds.tileSize;
    return [click({ x: cellCenter(arrowX, ts), y: cellCenter(arrowY, ts) })];
  },

  statusbarText: (s) => {
    const active = computeActive(s, -1, -1).filter((a) => a !== 0).length;
    let text = s.cheated
      ? `Moves since auto-solve: ${s.moveCount - s.completed}`
      : `${s.completed ? "COMPLETED! " : ""}Moves: ${s.completed || s.moveCount}`;
    if (s.movetarget) text += ` (target ${s.movetarget})`;
    return `${text} Active: ${active}/${s.w * s.h}`;
  },

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => ANIM_TIME,

  flashLength: (a, b) => {
    if (a.completed || !b.completed || a.cheated || b.cheated) return 0;
    // The flash ripples outward from the center, so it must run long enough to
    // reach the furthest corner and then finish that tile's four frames.
    const reach = Math.max(b.cx + 1, b.cy + 1, b.w - b.cx, b.h - b.cy);
    return FLASH_FRAME * (reach + 4);
  },
};

registerGame(netslideGame);

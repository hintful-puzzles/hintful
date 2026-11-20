/**
 * Netslide — Richard Boulton's cross between Net and Sixteen.
 *
 * The board is a Net wiring grid whose solved form is a spanning tree rooted at
 * the source. Instead of rotating a tile, you slide a whole row or column, and
 * it wraps around. The source's row and column cannot be slid — that one
 * restriction is what turns a shuffle into a puzzle.
 *
 * There is no solver: the generator saves the unshuffled grid as `aux`, and
 * `solve` replays it or, on a board that came without one, recovers the
 * finished grid from the tiles (`reconstruct.ts`).
 */

import { fromCoord } from "../../engine/board/geometry.ts";
import { assertNever, rejectMove } from "../../engine/contract/assert-never.ts";
import type { Game, SolveResult, UiUpdate } from "../../engine/contract/game.ts";
import { SOLUTION_UNKNOWN } from "../../engine/contract/solve-failure.ts";
import type { GameStatus, Point } from "../../engine/contract/types.ts";
import { nothingToDeduce } from "../../engine/hint-finishes.ts";
import {
  interpretTargetVerbs,
  type TargetVerbs,
  verbGesture,
} from "../../engine/input/target-verb.ts";
import {
  atof,
  dimensionParamConfig,
  formatG,
  numberItem,
  transposeDimensions,
} from "../../engine/params.ts";
import { registerGame } from "../../engine/registry.ts";
import { wrappingRulesetItem } from "../../engine/ruleset.ts";
import { newDesc } from "./generator.ts";
import {
  arrowFor,
  hint,
  hintKeepTrack,
  NETSLIDE_RUNGS,
  type NetslideHint,
  type NetslideRung,
  parseAux,
} from "./hint.ts";
import { reconstructSolution } from "./reconstruct.ts";
import {
  ANIM_TIME,
  border,
  colors,
  computeSize,
  type NetslideDrawState,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  c2diff,
  c2pos,
  decodeParams,
  defaultParams,
  describedSlide,
  encodeParams,
  hasNoSolution,
  isComplete,
  type NetslideMove,
  type NetslideParams,
  type NetslideState,
  type NetslideUi,
  newState,
  newUi,
  pos2c,
  positionOf,
  poweredTiles,
  rulesOf,
  validateParams,
} from "./state.ts";

/** Upstream's nine presets, its 5x5 made an upright 4x6. "Difficulty" is entirely a matter of how much help
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
  { w: 4, h: 6, wrapping: false, barrierProbability: 1, movetarget: 0 },
  { w: 4, h: 6, wrapping: false, barrierProbability: 0, movetarget: 0 },
  { w: 4, h: 6, wrapping: true, barrierProbability: 0, movetarget: 0 },
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
      moveCount: s.moveCount + 1,
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
  const rules = rulesOf(s);
  const p = positionOf(s.tiles);
  const slide = describedSlide(s, m);
  if (!rules.legal(p, slide)) rejectMove(m, "netslide: executeMove");

  return {
    ...s,
    tiles: Uint8Array.from(rules.play(p, slide).tile),
    moveCount: s.moveCount + 1,
    lastMoveRow: m.axis === "col" ? -1 : m.index,
    lastMoveCol: m.axis === "col" ? m.index : -1,
    lastMoveDir: m.dir,
  };
}

/**
 * A click in the gutter beside a row or column slides that line; the **right
 * button reverses** the direction. A click beside the source's row or column
 * does nothing — those lines cannot be slid.
 *
 * The keyboard cursor walks the ring of arrow positions and select slides the
 * line it is on. (As upstream, `CURSOR_SELECT2` does *not* reverse — only the
 * real right mouse button does.)
 */
/** The cell a press lands in along one axis, the gutters being `-1` and the
 * size. The origin is one pixel inside the border: each tile's left and top
 * outline pixel reads as the cell before it, as upstream's hit test does. */
function cellAt(pixel: number, ts: number): number {
  return fromCoord(pixel, ts, border(ts) + 1);
}

/** The middle of cell `c` along one axis, as {@link cellAt} reads it. */
function cellCenter(c: number, ts: number): number {
  return border(ts) + 1 + c * ts + Math.floor(ts / 2);
}

/** The slide the arrow at `t` makes, `sign` 1 the way it points and -1 the
 * other; `null` where `t` is no arrow, the source's row and column having
 * none. */
function slideAt(s: NetslideState, t: Point, sign: 1 | -1): NetslideMove | null {
  // Beside a row: the left gutter slides it left, the right gutter right.
  if (t.y >= 0 && t.y < s.h && t.y !== s.cy && (t.x === -1 || t.x === s.w)) {
    const dir = (t.x === -1 ? sign : -sign) as 1 | -1;
    return { type: "slide", axis: "row", index: t.y, dir };
  }
  // Beside a column: the top gutter slides it up, the bottom gutter down.
  if (t.x >= 0 && t.x < s.w && t.x !== s.cx && (t.y === -1 || t.y === s.h)) {
    const dir = (t.y === -1 ? sign : -sign) as 1 | -1;
    return { type: "slide", axis: "col", index: t.x, dir };
  }
  return null;
}

/** The target is an arrow in the gutter round the grid, and the cursor walks
 * the ring of them. */
const targetVerbs: TargetVerbs<
  NetslideState,
  NetslideUi,
  NetslideDrawState,
  Point,
  NetslideMove
> = {
  geometry: {
    noun: "arrow",
    pointerTarget: (s, ds, p) => {
      const t = { x: cellAt(p.x, ds.tileSize), y: cellAt(p.y, ds.tileSize) };
      return slideAt(s, t, 1) === null ? null : t;
    },
    pointAt: (_s, ds, t) => ({
      x: cellCenter(t.x, ds.tileSize),
      y: cellCenter(t.y, ds.tileSize),
    }),
    cursorTarget: (_s, ui) => ({ x: ui.cursor.x, y: ui.cursor.y }),
    parkCursor: (ui, t) => {
      ui.cursor.x = t.x;
      ui.cursor.y = t.y;
    },
    moveCursor: (s, ui, button) => {
      const { cursor } = ui;
      const shown = !cursor.visible;
      cursor.visible = true;
      const diff = c2diff(s.w, s.h, cursor.x, cursor.y, button);
      if (diff === 0) return shown;
      let pos = c2pos(s.w, s.h, cursor.x, cursor.y);
      // Step along the ring until we land on a line that can actually be slid.
      do {
        pos += diff;
        const c = pos2c(s.w, s.h, pos);
        cursor.x = c.cx;
        cursor.y = c.cy;
      } while (cursor.x === s.cx || cursor.y === s.cy);
      return true;
    },
  },
  primary: {
    does: "slide its row or column the way it points",
    apply: (s, t) => slideAt(s, t, 1),
  },
  secondary: {
    does: "slide the line the opposite way",
    apply: (s, t) => slideAt(s, t, -1),
  },
};

function interpretMove(
  s: NetslideState,
  ui: NetslideUi,
  ds: NetslideDrawState,
  p: Point,
  button: number,
): NetslideMove | null | UiUpdate {
  return interpretTargetVerbs(targetVerbs, s, ui, ds, p, button);
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
  NetslideHint,
  NetslideRung
> = {
  id: "netslide",

  defaultParams,
  menu: { boards: PRESETS, title: presetTitle },
  encodeParams,
  decodeParams,
  validateParams,

  transposeParams: transposeDimensions(),
  paramConfig: [
    ...dimensionParamConfig<NetslideParams>({
      doc: "Size of the grid in squares.",
      bounds: { min: 2 },
    }),
    wrappingRulesetItem<NetslideParams>("network"),
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
  newState,
  newUi,

  targetVerbs,
  interpretMove,
  executeMove,

  finishesByDeduction: nothingToDeduce,
  status: (s): GameStatus => (isComplete(s) ? "solved" : "ongoing"),
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
    if (!tiles) return { ok: false, error: SOLUTION_UNKNOWN };
    return { ok: true, move: { type: "solve", tiles: Array.from(tiles) } };
  },
  hasNoSolution,
  hint: {
    plan: hint,
    rungs: NETSLIDE_RUNGS,
    marks: {
      roles: {
        ring: "what the step decides: the piece to slide, and the arrow to click, which is filled blue. The words give the way it slides (left, right, up or down), say whether the piece then belongs there or is being set up for a later move, and name the piece by its shape: a *loose end*, a *straight*, a *corner*, a *T-piece* or a *cross*.",
      },
    },
    keepTrack: hintKeepTrack,
    gesture(s, ui, ds, m) {
      if (m.type !== "slide") return [];
      const { arrowX, arrowY } = arrowFor(s, m);
      return verbGesture(targetVerbs, s, ds, ui, [{ x: arrowX, y: arrowY }]);
    },
  },

  statusbarText: (s) => {
    const active = poweredTiles(s).length;
    let text = `Moves: ${s.moveCount}`;
    if (s.movetarget) text += ` (target ${s.movetarget})`;
    return `${text} Active: ${active}/${s.w * s.h}`;
  },

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => ANIM_TIME,
};

registerGame(netslideGame);

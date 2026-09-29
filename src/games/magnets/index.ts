/**
 * Magnets — native TS port of `magnets.c`. Fill a grid of pre-laid dominoes so
 * each domino is a magnet (`+`/`−`) or neutral, no two orthogonally-adjacent
 * cells share a polarity, and each row/column holds its `+`/`−` clue counts.
 */

import type { DifficultyContract } from "../../engine/difficulty.ts";
import { winFlash } from "../../engine/flash.ts";
import type {
  Game,
  HintResult,
  HintStep,
  SolveResult,
  UiUpdate,
} from "../../engine/game.ts";
import { fromCoord as fromCoordE } from "../../engine/geometry.ts";
import { commonHintRefusal } from "../../engine/hint-refusal.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { gridCursorMove, newCursor } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  interpretTargetVerbs,
  type TargetGeometry,
  type TargetVerbs,
} from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { newMagnetsDesc } from "./generator.ts";
import { type MagnetsHighlights, magnetsHint, magnetsKeepTrack } from "./hint.ts";
import {
  colors,
  computeSize,
  FLASH_TIME,
  type MagnetsDrawState,
  newDrawState,
  origin,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import { MagnetsSolver } from "./solver.ts";
import {
  clueIndex,
  DIFF_COUNT,
  decodeParams,
  defaultParams,
  EMPTY,
  encodeParams,
  executeMove,
  GS_NOTNEUTRAL,
  GS_SET,
  isClue,
  type MagnetsMistake,
  type MagnetsMove,
  type MagnetsParams,
  type MagnetsState,
  type MagnetsUi,
  NEGATIVE,
  NEUTRAL,
  newState,
  POSITIVE,
  paramConfig,
  presets,
  status,
  textFormat,
  validateDesc,
  validateParams,
} from "./state.ts";

function newUi(_state: MagnetsState): MagnetsUi {
  return { cursor: newCursor() };
}

function changedState(
  ui: MagnetsUi,
  oldState: MagnetsState | null,
  newState_: MagnetsState,
): void {
  if (oldState && !oldState.completed && newState_.completed) ui.cursor.visible = false;
}

/** Whether `(x, y)`, in the clue ring's coordinates, is a tile or a clue. */
const onBoard = (s: MagnetsState, x: number, y: number) =>
  (x >= 0 && x < s.w && y >= 0 && y < s.h) || isClue(s.w, s.h, x, y);

/**
 * A target is a tile or a clue: `(x, y)` runs from −1 to `w` and `h`, the ring
 * outside the grid holding the clues. The cursor walks the ring too, so a
 * keyboard player can mark a clue done, and skips the four corners, which hold
 * no clue.
 */
const geometry: TargetGeometry<MagnetsState, MagnetsUi, MagnetsDrawState, Point> = {
  noun: "tile",
  pointerTarget(s, ds, p) {
    const ts = ds.tileSize;
    const x = fromCoordE(p.x, ts, origin(ts));
    const y = fromCoordE(p.y, ts, origin(ts));
    return onBoard(s, x, y) ? { x, y } : null;
  },
  cursorTarget: (s, ui) =>
    onBoard(s, ui.cursor.x, ui.cursor.y) ? { x: ui.cursor.x, y: ui.cursor.y } : null,
  parkCursor(ui, t) {
    ui.cursor.x = t.x;
    ui.cursor.y = t.y;
  },
  moveCursor(s, ui, button) {
    const wasShown = ui.cursor.visible;
    ui.cursor.visible = true;
    const moved = gridCursorMove(
      button,
      ui.cursor.x + 1,
      ui.cursor.y + 1,
      s.w + 2,
      s.h + 2,
    );
    if (moved === null || !onBoard(s, moved.x - 1, moved.y - 1)) return !wasShown;
    ui.cursor.x = moved.x - 1;
    ui.cursor.y = moved.y - 1;
    return true;
  },
};

/** The tile's index, or `null` for a clue or a singleton, which never holds a
 * magnet. */
function tileAt(s: MagnetsState, { x, y }: Point): number | null {
  if (x < 0 || x >= s.w || y < 0 || y >= s.h) return null;
  const idx = y * s.w + x;
  return s.common.dominoes[idx] === idx ? null : idx;
}

const targetVerbs: TargetVerbs<
  MagnetsState,
  MagnetsUi,
  MagnetsDrawState,
  Point,
  MagnetsMove
> = {
  geometry,
  primary: {
    does:
      "make it a magnet, with the + in the end you click; click it again to turn " +
      "the magnet round, and a third time to empty it",
    // empty → + → − → empty; can't cycle a magnet from a placed neutral. On a
    // clue, marks it done or not.
    apply(s, t) {
      if (isClue(s.w, s.h, t.x, t.y))
        return { type: "clue", clue: clueIndex(s.w, s.h, t.x, t.y) };
      const idx = tileAt(s, t);
      if (idx === null) return null;
      const curr = s.grid[idx];
      if (curr === NEUTRAL && s.flags[idx] & GS_SET) return null;
      if (curr === EMPTY) return { type: "set", idx, which: POSITIVE };
      if (curr === POSITIVE) return { type: "set", idx, which: NEGATIVE };
      return { type: "flag", idx, mode: "empty" };
    },
  },
  secondary: {
    does:
      "cycle it between empty, neutral, and a ? mark saying you're sure it's a " +
      "magnet but don't yet know which way round it goes",
    // empty → neutral → not-neutral → empty; not from a magnet.
    apply(s, t) {
      const idx = tileAt(s, t);
      if (idx === null || s.grid[idx] !== NEUTRAL) return null;
      if (s.flags[idx] & GS_SET) return { type: "flag", idx, mode: "notneutral" };
      if (s.flags[idx] & GS_NOTNEUTRAL) return { type: "flag", idx, mode: "empty" };
      return { type: "flag", idx, mode: "neutral" };
    },
  },
};

function interpretMove(
  state: MagnetsState,
  ui: MagnetsUi,
  ds: MagnetsDrawState,
  p: Point,
  rawButton: number,
): MagnetsMove | null | UiUpdate {
  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton);
}

const CHAR2GRID = (c: string): number =>
  c === "+" ? POSITIVE : c === "-" ? NEGATIVE : NEUTRAL;

function solve(
  orig: MagnetsState,
  _curr: MagnetsState,
  aux?: string,
): SolveResult<MagnetsMove> {
  if (aux && aux.length === orig.wh) {
    return { ok: true, move: { type: "solve", solution: Array.from(aux, CHAR2GRID) } };
  }
  const solver = new MagnetsSolver(orig.w, orig.h, orig.common);
  const ret = solver.solve(DIFF_COUNT);
  if (ret > 0) {
    return { ok: true, move: { type: "solve", solution: Array.from(solver.grid) } };
  }
  return {
    ok: false,
    error: ret < 0 ? "Puzzle is impossible." : "Unable to solve puzzle.",
  };
}

/** Re-solve from the clues and flag every player-set cell whose value
 * contradicts the unique solution, and every `?` on a domino that is neutral
 * in it. The `?` counts because the hint reads it as a fact (`hint.ts`
 * `seedSolver`), so the check has to vouch for it (docs/games/hints.md §
 * "Deduce from the notes when the mistake check vouches for them"). Blanks are
 * never mistakes, and a non-uniquely-solvable board yields none. */
function findMistakes(state: MagnetsState): readonly MagnetsMistake[] {
  const { w, wh, grid, flags, common } = state;
  const solver = new MagnetsSolver(w, state.h, common);
  if (solver.solve(DIFF_COUNT) <= 0) return [];
  const out: MagnetsMistake[] = [];
  for (let i = 0; i < wh; i++) {
    if (common.dominoes[i] === i) continue;
    const wrong =
      flags[i] & GS_SET
        ? grid[i] !== solver.grid[i]
        : (flags[i] & GS_NOTNEUTRAL) !== 0 && solver.grid[i] === NEUTRAL;
    if (wrong) out.push({ x: i % w, y: Math.floor(i / w) });
  }
  return out;
}

/** The explained hint: the two refusals every deductive hint owes, then the
 * recording projection ([`hint.ts`](./hint.ts)). */
function hint(state: MagnetsState): HintResult<MagnetsMove, MagnetsHighlights> {
  const refusal = commonHintRefusal(state.completed, findMistakes(state).length);
  if (refusal) return refusal;
  return magnetsHint(state);
}

const difficulty: DifficultyContract<MagnetsParams> = {
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    const ret = new MagnetsSolver(s.w, s.h, s.common).solve(cap);
    return ret < 0 ? "impossible" : ret > 0 ? "solved" : "unsolved";
  },
};

export const magnetsGame: Game<
  MagnetsParams,
  MagnetsState,
  MagnetsMove,
  MagnetsUi,
  MagnetsDrawState,
  MagnetsMistake,
  MagnetsHighlights
> = {
  id: "magnets",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newMagnetsDesc,
  validateDesc,
  newState,
  newUi,
  changedState,

  targetVerbs,
  interpretMove,
  executeMove,
  status,

  solve,
  findMistakes,
  hint,
  hintMarks: {
    roles: {
      ring: "what the step decides: one end of a magnet, or a whole tile to make neutral or to mark ?.",
      outline:
        'what the step reasons from: the magnet a pole would touch, the tiles elsewhere in the line that can\'t take the pole ("either outlined tile"), and the numbers it reads. The number a step counts with is drawn in the hint color, and the number of a line it only cites, because that line already has all its + or − poles, in a second color: "its row", "the column beside it".',
      stripes:
        'the row or column the sentence calls "this row" or "this column", running on through its numbers.',
    },
  },
  hintKeepTrack: magnetsKeepTrack,
  difficulty,

  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw: (dr, ds, _prev, s, _dir, ui, _animTime, flashTime, hintStep, mistakes) =>
    redraw(
      dr,
      ds,
      s,
      ui,
      flashTime,
      mistakes,
      hintStep as HintStep<MagnetsMove, MagnetsHighlights> | undefined,
    ),

  flashLength: (from, to) => winFlash(from, to, FLASH_TIME),
};

registerGame(magnetsGame);

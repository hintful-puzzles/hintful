import { assertNever, rejectMove } from "../../engine/contract/assert-never.ts";
import {
  type Game,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/contract/game.ts";
import type { Point } from "../../engine/contract/types.ts";
import { nothingToDeduce } from "../../engine/hint-finishes.ts";
import { newCursor } from "../../engine/input/pointer.ts";
import {
  interpretTargetVerbs,
  squareGrid,
  type TargetVerbs,
  verbGesture,
} from "../../engine/input/target-verb.ts";
import { registerGame } from "../../engine/registry.ts";
import { solveBySearch } from "../../engine/search-outcome.ts";
import {
  hasNoSolution,
  hint,
  hintKeepTrack,
  SAMEGAME_RUNGS,
  type SamegameRung,
} from "./hint.ts";
import { HINT_MARKS } from "./kinds.ts";
import {
  colors,
  computeSize,
  FLASH_FRAME,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type SamegameDrawState,
} from "./render.ts";
import { findClearing } from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  groupOf,
  isCleared,
  isStuck,
  menu,
  newDesc,
  newState,
  npoints,
  paramConfig,
  positionOf,
  rulesOf,
  type SamegameMove,
  type SamegameParams,
  type SamegameState,
  type SamegameUi,
  status,
  textFormat,
  validateParams,
} from "./state.ts";

// --- UI / selection ---------------------------------------------------

function newUi(state: SamegameState): SamegameUi {
  return {
    selected: new Array<boolean>(state.w * state.h).fill(false),
    nselected: 0,
    cursor: newCursor(),
  };
}

/** Upstream `sel_clear`. */
function selClear(ui: SamegameUi): void {
  ui.selected.fill(false);
  ui.nselected = 0;
}

/** Upstream `game_changed_state` → `sel_clear`: the picked region resets
 * across every real transition. */
function changedState(
  ui: SamegameUi,
  _old: SamegameState | null,
  _new: SamegameState,
): void {
  selClear(ui);
}

/** Upstream `sel_expand`: the connected same-color region at (tx,ty) into
 * the selection. A lone tile (region size 1) cannot be removed, so the
 * selection collapses. */
function selExpand(ui: SamegameUi, state: SamegameState, tx: number, ty: number): void {
  const group = groupOf(state, ty * state.w + tx);
  for (const k of group) ui.selected[k] = true;
  if (group.length > 1) ui.nselected = group.length;
  else selClear(ui);
}

/** Upstream `sel_movedesc`: collect the selected indices into a `remove`
 * move and clear the selection. */
function selMovedesc(ui: SamegameUi): SamegameMove {
  const tiles: number[] = [];
  for (let i = 0; i < ui.selected.length; i++) if (ui.selected[i]) tiles.push(i);
  selClear(ui);
  return { type: "remove", tiles };
}

// --- input ------------------------------------------------------------

/** Highlight the group at `t` in place of whatever was highlighted. */
function highlight(ui: SamegameUi, state: SamegameState, t: Point): UiUpdate {
  selClear(ui);
  selExpand(ui, state, t.x, t.y);
  return UI_UPDATE;
}

/** A removal is picked in two parts: the first press on a group highlights
 * it, and the second either removes it or lets it go. */
const targetVerbs: TargetVerbs<
  SamegameState,
  SamegameUi,
  SamegameDrawState,
  Point,
  SamegameMove
> = {
  // The cursor wraps toroidally on this board.
  geometry: squareGrid({
    size: (s) => s,
    border: (ts) => Math.floor(ts / 2),
    wrap: true,
  }),
  primary: {
    does: "highlight its group, or remove the group once it is highlighted",
    apply: (s, t, ui) => {
      const i = t.y * s.w + t.x;
      if (s.tiles[i] === 0) return null;
      return ui.selected[i] ? selMovedesc(ui) : highlight(ui, s, t);
    },
  },
  secondary: {
    does: "highlight its group, or let go of the group once it is highlighted",
    apply: (s, t, ui) => {
      const i = t.y * s.w + t.x;
      if (s.tiles[i] === 0) return null;
      if (!ui.selected[i]) return highlight(ui, s, t);
      selClear(ui);
      return UI_UPDATE;
    },
  },
};

function interpretMove(
  state: SamegameState,
  ui: SamegameUi,
  ds: SamegameDrawState,
  p: Point,
  button: number,
): SamegameMove | null | UiUpdate {
  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, button);
}

// --- move execution ---------------------------------------------------

export function executeMove(state: SamegameState, move: SamegameMove): SamegameState {
  const { w, h } = state;
  if (move.type === "solve") return { ...state, tiles: new Int32Array(w * h) };
  if (move.type !== "remove") return assertNever(move, "samegame: executeMove");
  // A move read back from a save is checked for the field the removal reads.
  if (!Array.isArray(move.tiles)) rejectMove(move, "samegame: executeMove");

  for (const idx of move.tiles) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= w * h)
      throw new Error(`Move index ${idx} out of range`);
  }
  // The description's removal is bound by the group's first square, and the
  // move names every square of that group.
  const p = positionOf(state.tiles);
  const rules = rulesOf(state);
  const removal = { move: "remove", s: Math.min(...move.tiles) } as const;
  if (move.tiles.length === 0 || !rules.legal(p, removal))
    rejectMove(move, "samegame: executeMove");
  const group = groupOf(state, removal.s);
  const named = new Set(move.tiles);
  if (move.tiles.length !== group.length || group.some((k) => !named.has(k)))
    rejectMove(move, "samegame: executeMove");
  const score = state.score + npoints(state.scoresub, move.tiles.length);
  return { ...state, tiles: rules.play(p, removal).tile, score };
}

// --- solve -----------------------------------------------------------

/** The emptied board, where a clearing is found from the player's position or
 * else from the dealt one, which the generator makes clearable. The fallback
 * keeps the hint's out-of-reach refusal honest when it sends the player here. */
function solve(orig: SamegameState, curr: SamegameState): SolveResult<SamegameMove> {
  return solveBySearch(orig, curr, findClearing, () => ({ type: "solve" }));
}

// --- status bar -------------------------------------------------------

function statusbarText(state: SamegameState, ui: SamegameUi): string {
  const score = `Score: ${state.score}`;
  if (isCleared(state)) return score;
  if (isStuck(state)) return `Cannot move! ${score}`;
  if (ui.nselected)
    return `${score}  Selected: ${ui.nselected} (${npoints(state.scoresub, ui.nselected)})`;
  return score;
}

// --- flash ------------------------------------------------------------

/** A board that gets stuck flashes, though the status does not show it. */
function flashLength(
  oldState: SamegameState,
  newState: SamegameState,
  _dir: number,
  _ui: SamegameUi,
): number {
  return !isStuck(oldState) && isStuck(newState) ? 2 * FLASH_FRAME : 0;
}

// --- Game object ------------------------------------------------------

export const samegameGame: Game<
  SamegameParams,
  SamegameState,
  SamegameMove,
  SamegameUi,
  SamegameDrawState,
  never,
  unknown,
  SamegameRung
> = {
  id: "samegame",

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  paramConfig,

  newDesc,
  newState,
  newUi,
  changedState,

  targetVerbs,
  interpretMove,
  executeMove,
  finishesByDeduction: nothingToDeduce,
  status,
  notApplicable: {
    findMistakes:
      "Any order of removals that empties the grid wins, so there is no single answer to check a move against.",
    transposeParams:
      "Squares fall down and emptied columns close up to the left, so a board turned on its side would be a different puzzle.",
  },
  solve,
  hasNoSolution,
  hint: {
    plan: hint,
    marks: HINT_MARKS,
    rungs: SAMEGAME_RUNGS,
    keepTrack: hintKeepTrack,
    // The two clicks a player makes on a square of the group: one highlights
    // it, the next removes it. One click where it is already highlighted.
    gesture(s, ui, ds, m) {
      if (m.type !== "remove") return [];
      const i = m.tiles[0];
      const t = { x: i % s.w, y: Math.floor(i / s.w) };
      return verbGesture(targetVerbs, s, ds, ui, ui.selected[i] ? [t] : [t, t]);
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
  // A stuck board is not a loss (the player undoes and plays on), yet nobody
  // is playing it, so the timer holds on it.
  timerHolds: isStuck,
};

registerGame(samegameGame);

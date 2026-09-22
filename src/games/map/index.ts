/**
 * Map (`map.c`). Color every region of a map so no two adjacent regions share a
 * color, given some regions pre-colored as clues.
 *
 * Press picks up the color of the region under the pointer (or, on a blank
 * region, its pencil marks) into a floating drag blob; release drops it onto
 * the region under the pointer. A right-drag from a color onto a blank region
 * toggles one pencil bit; a keyboard cursor picks/drops via select. A drop that
 * changes nothing produces no move — and selects the region under it instead,
 * which is what puts a cursor under a finger.
 *
 * A color key (or the panel's swatch) colors the region at the cursor, or in
 * notes mode toggles that color as a mark; Clear empties it.
 */

import { assertNever, rejectMove } from "../../engine/assert-never.ts";
import type { DifficultyContract } from "../../engine/difficulty.ts";
import type { Game, SolveResult, UiUpdate } from "../../engine/game.ts";
import { UI_UPDATE } from "../../engine/game.ts";
import { colorKeys } from "../../engine/key-labels.ts";
import {
  noOpEntryResult,
  pressNoteTakingCell,
  releaseHighlightAfterEntry,
} from "../../engine/note-taking-cell.ts";
import { dimensionParamConfig, parseConfigInt } from "../../engine/params.ts";
import {
  pencilKeepHighlightPref,
  stickyPencilPref,
} from "../../engine/pencil-prefs.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  digitOf,
  isCursorMove,
  isEraseKey,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  moveCursor,
  PENCIL_MODE_BUTTON,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { GameStatus, KeyLabel, Point } from "../../engine/types.ts";
import { newMapDesc } from "./generator.ts";
import { newMapData, validateDesc } from "./map-data.ts";
import {
  COL_0,
  colors,
  computeSize,
  flashLengthFromUi,
  fromCoord,
  type MapDrawState,
  newDrawState,
  placeCursorAtCoords,
  redraw,
  regionFromCoords,
  regionFromUiCursor,
} from "./render.ts";
import { mapSolver, SOLVER_IMPOSSIBLE, SOLVER_UNIQUE } from "./solver.ts";
import {
  cloneState,
  DIFF_NAMES,
  DIFFCOUNT,
  decodeParams,
  defaultParams,
  encodeParams,
  type MapMistake,
  type MapMove,
  type MapOp,
  type MapParams,
  type MapState,
  type MapUi,
  newUi,
  presets,
  validateParams,
} from "./state.ts";

const FOUR = 4;

// --- new state -------------------------------------------------------

function newState(p: MapParams, desc: string): MapState {
  const { map, coloring } = newMapData(p, desc);
  return {
    params: p,
    map,
    coloring,
    pencil: new Int32Array(p.n),
    completed: false,
    cheated: false,
  };
}

// --- moves -----------------------------------------------------------

/** Start a drag from region `r`: its color, or when blank its pencil marks. */
function pickUp(state: MapState, ui: MapUi, r: number): void {
  if (r < 0) {
    ui.dragColor = -1;
    ui.dragPencil = 0;
  } else {
    ui.dragColor = state.coloring[r];
    ui.dragPencil = ui.dragColor >= 0 ? 0 : state.pencil[r];
  }
}

/** End the drag by dropping its color/pencil on region `r` (upstream
 * `drag_dropped`). */
function drop(
  state: MapState,
  ui: MapUi,
  r: number,
  altButton: boolean,
): MapMove | UiUpdate {
  let c = ui.dragColor;
  let p = ui.dragPencil;
  ui.dragColor = -2;
  if (r < 0) return UI_UPDATE; // drag into border
  if (state.map.immutable[r]) return UI_UPDATE; // can't change a clue
  if (state.coloring[r] === c && state.pencil[r] === p) return UI_UPDATE; // no change

  if (altButton) {
    if (state.coloring[r] >= 0) return UI_UPDATE; // can't pencil a colored region
    if (c >= 0) {
      // Right-drag from a color onto a blank toggles one pencil.
      p = state.pencil[r] ^ (1 << c);
      c = -1;
    }
    // Otherwise, right-drag blank→blank == left-drag.
  }

  const ops: MapOp[] = [];
  let oldp = state.pencil[r];
  if (c !== state.coloring[r]) {
    ops.push({ op: "color", region: r, color: c < 0 ? null : c });
    if (c >= 0) oldp = 0;
  }
  for (let i = 0; i < FOUR; i++)
    if ((oldp ^ p) & (1 << i)) ops.push({ op: "pencil", region: r, bit: i });

  return ops.length ? { ops } : UI_UPDATE;
}

/**
 * The four region colors, plus Clear. The engine appends the Marks key.
 *
 * Map's element is a *color*, so each key carries the palette index it enters
 * and the panel paints it in that color; the label is still the character the
 * key sends, so pressing `2` and tapping the second key are visibly the same
 * input.
 */
function requestKeys(): KeyLabel[] {
  return colorKeys(FOUR, COL_0);
}

/**
 * What a color key or Clear puts in the player's hand: a color index, `-1` for
 * blank, or `null` for a button that is neither.
 */
function heldByKey(button: number): number | null {
  const digit = digitOf(button);
  if (digit !== null && digit >= 1 && digit <= FOUR) return digit - 1;
  return isEraseKey(button) ? -1 : null;
}

function interpretMove(
  state: MapState,
  ui: MapUi,
  ds: MapDrawState,
  point: Point,
  rawButton: number,
): MapMove | null | UiUpdate {
  const button = stripModifiers(rawButton);
  const { w, h } = state.params;
  const ts = ds.tileSize;

  // Toggle region numbers.
  if (button === 108 || button === 76) {
    ui.showNumbers = !ui.showNumbers;
    return UI_UPDATE;
  }

  // The Marks key (and the app's bare P), which the engine offers because Map
  // keeps notes. Map's mark is laid by dragging *from* a colored region onto a
  // blank one, and which bit it sets comes from the drag's origin — so the mode
  // does not choose the mark, it chooses whether the drop pencils or colors,
  // which is the `altButton` the right-drag already supplies.
  if (button === PENCIL_MODE_BUTTON) {
    ui.pencilMode = !ui.pencilMode;
    return UI_UPDATE;
  }

  if (isCursorMove(button)) {
    moveCursor(ui.cursor, button, w, h);
    ui.curMoved = true;
    ui.curLastmove = button;
    ui.cursorFromKeyboard = true;
    return UI_UPDATE;
  }

  if (button === CURSOR_SELECT || button === CURSOR_SELECT2) {
    ui.cursorFromKeyboard = true;
    if (!ui.cursor.visible) {
      ui.cursor.visible = true;
      return UI_UPDATE;
    }
    if (ui.dragColor === -2) {
      pickUp(state, ui, regionFromUiCursor(state.map, ui));
      ui.curMoved = false;
      return UI_UPDATE;
    }
    if (!ui.curMoved) ui.dragColor = -1; // double-select removes the color
    const r = regionFromUiCursor(state.map, ui);
    return drop(state, ui, r, button === CURSOR_SELECT2 || ui.pencilMode);
  }

  // A color key or Clear, entered at the cursor — the collection's "select a
  // cell, tap a value", where in notes mode the same key marks it instead
  // (`docs/games/input.md` § "Put a game's markable elements on the panel").
  //
  // The key *is* the pick-up: Map holds a color rather than typing one, so
  // loading what the key names into the drag and dropping it where the cursor
  // is gets the whole vocabulary for free — a mark in notes mode, a refusal on
  // a clue, no move where nothing changes.
  //
  // Only with the cursor shown, as the digit games do: entering at a cursor
  // nobody can see would put a color somewhere the player is not looking. An
  // arrow key reveals it, and so does a tap.
  const held = heldByKey(button);
  if (held !== null && ui.cursor.visible && ui.dragColor === -2) {
    ui.dragColor = held;
    ui.dragPencil = 0;
    const entered = drop(state, ui, regionFromUiCursor(state.map, ui), ui.pencilMode);
    if (entered === UI_UPDATE) return noOpEntryResult(ui);
    releaseHighlightAfterEntry(ui);
    return entered;
  }

  if (button === LEFT_BUTTON || button === RIGHT_BUTTON) {
    pickUp(state, ui, regionFromCoords(state.map, ts, point.x, point.y));
    ui.dragX = point.x;
    ui.dragY = point.y;
    ui.cursor.visible = false;
    return UI_UPDATE;
  }

  if ((button === LEFT_DRAG || button === RIGHT_DRAG) && ui.dragColor > -2) {
    ui.dragX = point.x;
    ui.dragY = point.y;
    return UI_UPDATE;
  }

  if ((button === LEFT_RELEASE || button === RIGHT_RELEASE) && ui.dragColor > -2) {
    const r = regionFromCoords(state.map, ts, point.x, point.y);
    const dropped = drop(state, ui, r, button === RIGHT_RELEASE || ui.pencilMode);

    // A gesture that commits nothing selects the region instead. That is what
    // makes the color keys reachable on touch, where there are no arrow keys
    // to walk a cursor with, and it costs nothing: a tap is a press and a
    // release on one region, so it picks that region's own color up and puts
    // it straight back — already a no-op before this existed.
    //
    // What it does to the highlight is the note-taking cell's rule, with the
    // button the gesture used: a right tap selects for notes (or latches
    // them, sticky). The press already took the highlight down to start its
    // drag, so a repeat tap re-selects rather than putting it away.
    if (dropped === UI_UPDATE && r >= 0) {
      const pressed = pressNoteTakingCell(
        ui,
        button === RIGHT_RELEASE ? RIGHT_BUTTON : LEFT_BUTTON,
        fromCoord(point.x, ts),
        fromCoord(point.y, ts),
        { canEnter: !state.map.immutable[r], canMark: state.coloring[r] < 0 },
      );
      // The mechanic names a cell; the finger named a triangle of it.
      if (pressed === "moved") placeCursorAtCoords(ui, ts, point.x, point.y);
    }
    return dropped;
  }

  return null;
}

function isComplete(s: MapState): boolean {
  const n = s.params.n;
  for (let i = 0; i < n; i++) if (s.coloring[i] < 0) return false;
  const { graph, ngraph } = s.map;
  for (let i = 0; i < ngraph; i++) {
    const j = Math.floor(graph[i] / n);
    const k = graph[i] % n;
    if (s.coloring[j] === s.coloring[k]) return false;
  }
  return true;
}

function executeMove(s: MapState, m: MapMove): MapState {
  // A move is an op list, not a union, so there is no discriminant to narrow to
  // `never`: check the one field the dispatch reads (see `rejectMove`).
  if (!Array.isArray(m.ops)) rejectMove(m, "map: executeMove");

  const ret = cloneState(s);
  for (const op of m.ops) {
    if (op.op === "color") {
      ret.coloring[op.region] = op.color ?? -1;
      ret.pencil[op.region] = 0;
    } else if (op.op === "pencil") {
      // Illegal on a colored region (upstream returns NULL).
      if (ret.coloring[op.region] >= 0)
        throw new Error("map: pencil on a colored region");
      ret.pencil[op.region] ^= 1 << op.bit;
    } else {
      return assertNever(op, "map: executeMove");
    }
  }
  if (m.solve) return { ...ret, cheated: true };

  if (!ret.completed && isComplete(ret)) return { ...ret, completed: true };
  return ret;
}

function status(s: MapState): GameStatus {
  return s.completed ? "solved" : "ongoing";
}

// --- solve / mistakes ------------------------------------------------

/** The clue coloring: clue colors at immutable regions, -1 elsewhere. */
function clueColoring(s: MapState): Int32Array {
  const n = s.params.n;
  const clues = new Int32Array(n).fill(-1);
  for (let i = 0; i < n; i++) if (s.map.immutable[i]) clues[i] = s.coloring[i];
  return clues;
}

/** Parse a generator `aux` (`"S;c:r;c:r;…"`) into a solution coloring. */
function solutionFromAux(aux: string, n: number): Int32Array {
  const sol = new Int32Array(n).fill(-1);
  for (const tok of aux.split(";")) {
    if (tok === "S" || tok === "") continue;
    const [c, r] = tok.split(":");
    sol[Number(r)] = Number(c);
  }
  return sol;
}

function solveToMove(curr: MapState, solution: Int32Array): SolveResult<MapMove> {
  const n = curr.params.n;
  const ops: MapOp[] = [];
  for (let i = 0; i < n; i++)
    if (solution[i] >= 0 && solution[i] !== curr.coloring[i])
      ops.push({ op: "color", region: i, color: solution[i] });
  return { ok: true, move: { ops, solve: true } };
}

function solve(orig: MapState, curr: MapState, aux?: string): SolveResult<MapMove> {
  const n = orig.params.n;
  if (aux) return solveToMove(curr, solutionFromAux(aux, n));

  const coloring = clueColoring(orig);
  const ret = mapSolver(orig.map.graph, n, orig.map.ngraph, coloring, DIFFCOUNT - 1);
  if (ret !== SOLVER_UNIQUE) {
    return {
      ok: false,
      error:
        ret === SOLVER_IMPOSSIBLE
          ? "Puzzle is inconsistent"
          : "Unable to find a unique solution for this puzzle",
    };
  }
  return solveToMove(curr, coloring);
}

/**
 * Boards are uniquely solvable, so any region colored against the unique
 * solution is a definite mistake. Re-solve from the clues; if not unique,
 * report none.
 */
function findMistakes(state: MapState): readonly MapMistake[] {
  const n = state.params.n;
  const coloring = clueColoring(state);
  if (
    mapSolver(state.map.graph, n, state.map.ngraph, coloring, DIFFCOUNT - 1) !==
    SOLVER_UNIQUE
  )
    return [];

  const out: MapMistake[] = [];
  for (let i = 0; i < n; i++)
    if (state.coloring[i] >= 0 && state.coloring[i] !== coloring[i])
      out.push({ region: i });
  return out;
}

// --- flash -----------------------------------------------------------

function flashLength(
  oldState: MapState,
  newState_: MapState,
  _dir: number,
  ui: MapUi,
): number {
  return !oldState.completed && newState_.completed && !newState_.cheated
    ? flashLengthFromUi(ui)
    : 0;
}

// --- register --------------------------------------------------------

/** Map's difficulty contract (`engine/difficulty.ts`). The coloring `mapSolver`
 * works from is `clueColoring`, the givens alone, so the player's own colors
 * never enter the verdict. */
const difficulty: DifficultyContract<MapParams> = {
  tierOf: (p) => p.diff,
  withTier: (p, tier) => ({ ...p, diff: tier }),
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    const ret = mapSolver(s.map.graph, p.n, s.map.ngraph, clueColoring(s), cap);
    if (ret === SOLVER_UNIQUE) return "solved";
    return ret === SOLVER_IMPOSSIBLE ? "impossible" : "unsolved";
  },
};

export const mapGame: Game<
  MapParams,
  MapState,
  MapMove,
  MapUi,
  MapDrawState,
  MapMistake
> = {
  id: "map",
  wantsStatusbar: false,
  isTimed: false,
  canSolve: true,
  canFormatAsText: false,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  paramConfig: [
    ...dimensionParamConfig<MapParams>(),
    {
      kw: "regions",
      name: "Regions",
      type: "string",
      get: (p) => String(p.n),
      set: (p, v) => {
        p.n = parseConfigInt(v);
      },
    },
    {
      kw: "difficulty",
      name: "Difficulty",
      type: "choices",
      choices: [...DIFF_NAMES],
      get: (p) => p.diff,
      set: (p, v) => {
        p.diff = v;
      },
    },
  ],
  describeParams: (p) => ({
    width: String(p.w),
    height: String(p.h),
    regions: String(p.n),
    difficulty: p.diff,
  }),

  newDesc: newMapDesc,
  validateDesc,
  newState,
  newUi,

  interpretMove,
  executeMove,
  status,

  solve,
  difficulty,
  findMistakes,
  requestKeys,

  prefs: [
    {
      kw: "flash-type",
      name: "Victory flash effect",
      type: "choices",
      choices: ["Cyclic", "Each to white", "All to white"],
      get: (ui) => ui.flashType,
      set: (ui, v) => {
        ui.flashType = v;
      },
    },
    {
      kw: "show-numbers",
      name: "Number regions",
      type: "boolean",
      get: (ui) => ui.showNumbers,
      set: (ui, v) => {
        ui.showNumbers = v;
      },
    },
    {
      kw: "stipple-style",
      name: "Display style for stipple marks",
      type: "choices",
      choices: ["Small", "Large"],
      get: (ui) => (ui.largeStipples ? 1 : 0),
      set: (ui, v) => {
        ui.largeStipples = v === 1;
      },
    },
    stickyPencilPref(),
    pencilKeepHighlightPref(),
  ],

  colors,
  preferredTileSize: 20,
  computeSize,
  newDrawState,
  redraw,

  flashLength,
};

registerGame(mapGame);

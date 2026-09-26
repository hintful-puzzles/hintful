/**
 * Rome — native TS port of `puzzles/unreleased/rome.c` (Nikoli's *Roma*).
 *
 * Fill every square with an arrow so that every outlined region holds only
 * distinct arrows and following the arrows from anywhere reaches a circled
 * goal. Grab a square and drag a direction to place an arrow (right-drag, or
 * the Marks key, for a pencil mark), or move the keyboard cursor and press
 * Enter (Space for pencil) followed by a direction — or type `8`/`2`/`4`/`6`
 * directly.
 *
 * Rule violations are shown live, as upstream does: an arrow duplicated within
 * a region turns red, an arrow pointing off the grid reddens its square, and
 * (by preference) so do the squares of a loop. Check & Save adds the layer the
 * live checks cannot give — see {@link findMistakes}.
 */

import { assertNever } from "../../engine/assert-never.ts";
import {
  adaptiveMarkAll,
  anyEmptyLacksNotes,
  candidateHint,
  DEFAULT_CANDIDATE_READING,
  type Mark,
  obviousCandidateMarks,
  regionReach,
} from "../../engine/candidate-hint.ts";
import type { DifficultyContract } from "../../engine/difficulty.ts";
import { winFlash } from "../../engine/flash.ts";
import {
  type Game,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import { clearKey } from "../../engine/key-labels.ts";
import {
  dragEnteredNoteTakingCell,
  noOpEntryResult,
  releaseHighlightAfterEntry,
  tapNoteTakingCell,
} from "../../engine/note-taking-cell.ts";
import { transposeDimensions } from "../../engine/params.ts";
import {
  candidateReadingPref,
  pencilKeepHighlightPref,
  stickyPencilPref,
} from "../../engine/pencil-prefs.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  CURSOR_UP,
  isCursorMove,
  isEraseKey,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  moveCursor,
  newCursor,
  PENCIL_MODE_BUTTON,
  RIGHT_BUTTON,
  showCursor,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { ConfigValues, KeyLabel, Point } from "../../engine/types.ts";
import { newRomeDesc } from "./generator.ts";
import {
  buildSteps,
  hintKeepTrack,
  refreshHintStep,
  romeCandidateMoves,
} from "./hint.ts";
import {
  colors,
  computeSize,
  FLASH_TIME,
  newDrawState,
  origin,
  PREFERRED_TILE_SIZE,
  type RomeDrawState,
  redraw,
} from "./render.ts";
import { romeSolve, validateDesc, validateGame } from "./solver.ts";
import {
  boardFromClues,
  cloneState,
  DIFFCOUNT,
  decodeParams,
  defaultParams,
  dirBit,
  EMPTY,
  encodeParams,
  FE_BOUNDS,
  FE_DOUBLE,
  FE_LOOP,
  FM_ARROWMASK,
  FM_DOWN,
  FM_FIXED,
  FM_LEFT,
  FM_RIGHT,
  FM_UP,
  KEYMODE_MOVE,
  KEYMODE_PENCIL,
  KEYMODE_PLACE,
  legalDirs,
  MOUSEMODE_OFF,
  MOUSEMODE_PENCIL,
  MOUSEMODE_PLACE,
  paramConfig,
  placedValues,
  presets,
  type RomeDir,
  type RomeMove,
  type RomeParams,
  type RomeState,
  type RomeUi,
  readDesc,
  romeNotes,
  romeRegions,
  STATUS_COMPLETE,
  STATUS_INVALID,
  status,
  validateParams,
} from "./state.ts";

/**
 * A square Check & Save flags. `bounds` / `double` / `loop` are the rule
 * violations the board already shows live; `wrong` is an arrow that breaks no
 * rule *yet* but contradicts the puzzle's unique solution; `note` is an empty
 * square whose marks have crossed out the arrow the solution wants there.
 */
export interface RomeMistake {
  index: number;
  kind: "bounds" | "double" | "loop" | "wrong" | "note";
}

// --- setup ------------------------------------------------------------------

function newState(p: RomeParams, desc: string): RomeState {
  const { board } = readDesc(p, desc);
  validateGame(board, true);
  return board;
}

function newUi(_state: RomeState): RomeUi {
  return {
    cursor: newCursor(),
    kmode: KEYMODE_MOVE,
    mmode: MOUSEMODE_OFF,
    mx: 0,
    my: 0,
    mdir: EMPTY,
    pencilMode: false,
    cursorFromKeyboard: false,
    pencilSticky: true,
    pencilKeepHighlight: true,
    // Upstream defaults: highlight the squares that reach a goal (a genuinely
    // useful built-in aid), leave loop highlighting off.
    sloops: false,
    sgoals: true,
    // The convention, although the implicit plan is shorter: it leaves the
    // squares its last step worked on for another part of the board too often
    // for `hint-frontier.test.ts`'s continuity bound
    // (`fold-notes-into-conclusions` design D4).
    candidateReading: DEFAULT_CANDIDATE_READING,
  };
}

// --- input ------------------------------------------------------------------

/** Direct arrow entry by character code, keyed off the bare characters as
 * upstream does, so the number-row digits work too (docs/games/input.md §
 * "The numeric keypad never arrives"). */
const DIGIT_DIRS: Readonly<Record<number, RomeDir>> = {
  56: FM_UP, // '8'
  50: FM_DOWN, // '2'
  52: FM_LEFT, // '4'
  54: FM_RIGHT, // '6'
};

/**
 * Whether the player may note an arrow pointing `dir` at `(x, y)`: never one
 * pointing off the grid. Mark-all never offers that note and the solver never
 * considers that arrow, so the hint has no strike for it and could not explain
 * the placement it hides (`rome-hint.test.ts` pins the board). Upstream accepts it.
 * Placing such an arrow stays allowed, because the board flags it as an error.
 */
function markable(state: RomeState, x: number, y: number, dir: number): boolean {
  return (legalDirs(x, y, state.w, state.h) & dir) !== 0;
}

/**
 * The on-screen keypad: one key per arrow, then Clear.
 *
 * **A note-taking game's elements belong on buttons**, the way every digit game
 * puts its digits there — select a square and toggle what it may hold. Rome's
 * only other way to mark was a drag, which is a different motion for the same
 * job and the one thing a player has to learn twice.
 *
 * The keys send the character codes Rome's typed entry already answers
 * ({@link DIGIT_DIRS}), so the panel needed no new input path — it needed the
 * *cursor* to be reachable by tap, which is what the notes-mode tap gives it.
 * The engine appends the Marks key after these.
 */
const ARROW_KEYS: KeyLabel[] = [
  { button: 56, label: "↑" },
  { button: 50, label: "↓" },
  { button: 52, label: "←" },
  { button: 54, label: "→" },
  clearKey,
];

/** Upstream `FROMCOORD`: C integer division **truncates toward zero**, so a
 * pixel inside the two-pixel border maps to row/column 0 rather than to -1 —
 * hence `Math.trunc`, not the shared `fromCoord`'s floor. */
function fromCoordTrunc(pixel: number, ts: number): number {
  return Math.trunc((pixel - origin(ts)) / ts);
}

/**
 * A direction typed at the shown cursor, or Clear (`null`), in whichever mode
 * the cursor is in. What the entry does to the highlight is the note-taking
 * cell's rule.
 */
function typedEntry(
  state: RomeState,
  ui: RomeUi,
  dir: RomeDir | null,
): RomeMove | UiUpdate | null {
  const { x, y } = ui.cursor;
  const here = state.grid[y * state.w + x];
  const pencil = ui.kmode === KEYMODE_PENCIL || ui.pencilMode;
  ui.kmode = KEYMODE_MOVE;
  if (dir !== null) {
    if (pencil && !markable(state, x, y, dir)) return UI_UPDATE;
    if (!pencil && (here & FM_ARROWMASK) === dir) return noOpEntryResult(ui);
  }
  releaseHighlightAfterEntry(ui);
  // In notes mode Clear empties the square's *marks*: the key clears whatever
  // the mode is entering, or it is a control that does the one thing the
  // player did not ask for.
  return { kind: pencil ? "pencil" : "place", x, y, dir };
}

function interpretMove(
  state: RomeState,
  ui: RomeUi,
  ds: RomeDrawState,
  p: Point,
  rawButton: number,
): RomeMove | null | UiUpdate {
  const { w, h, grid } = state;
  const button = stripModifiers(rawButton);
  const ts = ds.tileSize;

  // The highlighted square, captured up front exactly as upstream does: a
  // cursor move below updates `ui`, but every move emitted this call is about
  // the square that was highlighted on entry.
  const x = ui.cursor.x;
  const y = ui.cursor.y;
  const here = grid[y * w + x];

  if (ui.mmode === MOUSEMODE_OFF) {
    // 'M' / 'm': fill every blank square's marks, then — on an already-filled
    // board — strike the arrows each square's own outlined region already
    // holds. That second press is `solverDoubles` by hand, which is why the
    // hint's opening clean and this press agree without either citing the
    // other: both read `romeRegions`.
    if (button === 77 || button === 109) {
      const values = placedValues(state);
      return adaptiveMarkAll<RomeMove, Mark>(
        anyEmptyLacksNotes(values, state.pencil),
        () =>
          obviousCandidateMarks(
            values,
            state.pencil,
            w,
            regionReach(w, romeRegions(state)),
            romeNotes(w, h),
          ),
        romeCandidateMoves,
      );
    }

    // The Marks key (and the app's bare P). The engine puts it on every
    // note-taking game's keypad, so this is the one control a touch player has
    // for marks: Rome's other two ways in are a right-drag and a keyboard arm.
    if (button === PENCIL_MODE_BUTTON) {
      ui.pencilMode = !ui.pencilMode;
      return UI_UPDATE;
    }

    if (isCursorMove(button) && ui.kmode === KEYMODE_MOVE) {
      moveCursor(ui.cursor, button, w, h);
      ui.cursorFromKeyboard = true;
      return UI_UPDATE;
    }

    // Enter arms (or disarms) arrow placement.
    if (button === CURSOR_SELECT && !(here & FM_FIXED)) {
      showCursor(ui.cursor);
      ui.cursorFromKeyboard = true;
      ui.kmode = ui.kmode !== KEYMODE_PLACE ? KEYMODE_PLACE : KEYMODE_MOVE;
      return UI_UPDATE;
    }

    // Space arms pencil mode on an empty square...
    if (button === CURSOR_SELECT2 && here === EMPTY && ui.kmode !== KEYMODE_PLACE) {
      showCursor(ui.cursor);
      ui.cursorFromKeyboard = true;
      ui.kmode = ui.kmode !== KEYMODE_PENCIL ? KEYMODE_PENCIL : KEYMODE_MOVE;
      return UI_UPDATE;
    }

    // ...but while placement is armed, Space clears the square instead.
    if (button === CURSOR_SELECT2 && ui.kmode === KEYMODE_PLACE) {
      ui.kmode = KEYMODE_MOVE;
      if (here & FM_FIXED) return UI_UPDATE;
      return { kind: "place", x, y, dir: null };
    }

    // A direction key while armed commits the arrow or the mark.
    if (
      (ui.kmode === KEYMODE_PLACE || ui.kmode === KEYMODE_PENCIL) &&
      isCursorMove(button)
    ) {
      const pencil = ui.kmode === KEYMODE_PENCIL;
      ui.kmode = KEYMODE_MOVE;
      if (here & FM_FIXED) return UI_UPDATE;
      if (here !== EMPTY && pencil) return UI_UPDATE;

      const dir =
        button === CURSOR_UP
          ? FM_UP
          : button === CURSOR_DOWN
            ? FM_DOWN
            : button === CURSOR_LEFT
              ? FM_LEFT
              : FM_RIGHT;
      // Placing the arrow that is already there is a no-op, not a history entry.
      if (here & dir) return UI_UPDATE;
      if (pencil && !markable(state, x, y, dir)) return UI_UPDATE;
      return { kind: pencil ? "pencil" : "place", x, y, dir };
    }

    // Type a direction directly, in whichever mode the cursor is in.
    const dir = DIGIT_DIRS[button];
    const typed = dir !== undefined || isEraseKey(button);
    if (typed && ui.cursor.visible && !(here & FM_FIXED))
      return typedEntry(state, ui, dir ?? null);

    // Grab a square: left starts an arrow drag, right a pencil drag.
    if (button === LEFT_BUTTON || button === RIGHT_BUTTON) {
      const gx = fromCoordTrunc(p.x, ts);
      const gy = fromCoordTrunc(p.y, ts);
      if (gx < 0 || gx >= w || gy < 0 || gy >= h) return null;
      if (grid[gy * w + gx] & FM_FIXED) return null;

      // The selection is left alone: this press may turn out to be a drag, and
      // until the gesture resolves what is selected is still what was selected
      // (`note-taking-cell.ts` § "the select-or-drag gesture"). The grabbed
      // square is the drag's, not the cursor's.
      ui.mx = gx;
      ui.my = gy;
      ui.kmode = KEYMODE_MOVE;
      // Marks mode makes the ordinary drag a pencil drag, which is what gives a
      // touch player the gesture at all: the right button is a mouse, and a
      // long press is already how an arrow drag starts here.
      ui.mmode =
        button === LEFT_BUTTON && !ui.pencilMode ? MOUSEMODE_PLACE : MOUSEMODE_PENCIL;
      ui.mdir = EMPTY;
      return UI_UPDATE;
    }

    return null;
  }

  if (isMouseDrag(button) || isMouseRelease(button)) {
    // Everything this gesture is about is the *grabbed* square, which is the
    // drag's own and not the selection.
    const gx = ui.mx;
    const gy = ui.my;
    const at = grid[gy * w + gx];

    // The direction is read from the *square* the pointer is over, not from a
    // pixel offset: back on the grabbed square means "clear".
    const cx = p.x >= origin(ts) ? fromCoordTrunc(p.x, ts) : -1;
    const cy = p.y >= origin(ts) ? fromCoordTrunc(p.y, ts) : -1;

    let c: number;
    if (cx === gx && cy === gy) c = EMPTY;
    else if (Math.abs(cx - gx) < Math.abs(cy - gy)) c = cy < gy ? FM_UP : FM_DOWN;
    else c = cx < gx ? FM_LEFT : FM_RIGHT;
    // A pencil drag off the grid's edge reads as no drag at all, so its preview
    // never shows a mark the release would refuse.
    if (ui.mmode === MOUSEMODE_PENCIL && c !== EMPTY && !markable(state, gx, gy, c))
      c = EMPTY;

    if (c !== ui.mdir && isMouseDrag(button)) {
      ui.mdir = c;
      return UI_UPDATE;
    }

    if (isMouseRelease(button)) {
      const pencil = ui.mmode === MOUSEMODE_PENCIL;
      ui.mmode = MOUSEMODE_OFF;
      // A release that commits nothing **selects** the square instead — a tap
      // in notes mode, or one that lands back on the arrow already there.
      //
      // That is what makes the keypad reachable: its keys enter at the cursor,
      // and a touch player has no other way to put the cursor anywhere. Both
      // arms were bare no-ops before the panel existed, so nothing that used to
      // make a move stops making one; dragging still enters directly, and this
      // is the second way in rather than a replacement.
      //
      // The second arm masks to the arrow bits because upstream compares the
      // whole cell, so an arrow carrying an error bit would emit a move that
      // changes nothing.
      //
      // Rome's selection is the square itself, so the tap says nothing about
      // what it is on and the mechanic answers that for itself.
      if ((c === EMPTY && pencil) || (!pencil && c === (at & FM_ARROWMASK))) {
        tapNoteTakingCell(
          ui,
          button,
          { x: gx, y: gy },
          { canEnter: !(at & FM_FIXED), canMark: at === EMPTY },
        );
        return UI_UPDATE;
      }

      // The drag entered an arrow or a mark with the pointer, so the highlight
      // follows it to the grabbed square and goes away, exactly as a typed
      // entry's does.
      dragEnteredNoteTakingCell(ui, gx, gy);
      return {
        kind: pencil ? "pencil" : "place",
        x: gx,
        y: gy,
        dir: c === EMPTY ? null : (c as RomeDir),
      };
    }
  }

  return null;
}

// --- moves ------------------------------------------------------------------

function executeMove(state: RomeState, move: RomeMove): RomeState {
  const next = cloneState(state);
  const { w, h, grid, pencil } = next;

  if (move.kind === "solve") {
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] & FM_FIXED) continue;
      grid[i] = move.arrows[i] ?? EMPTY;
    }
    next.completed = validateGame(next, true) === STATUS_COMPLETE;
    next.cheated = next.completed;
    return next;
  }
  // ## THE ADDITIVE RULE, stated once
  //
  // `engine/candidate-hint.ts` § "THE ADDITIVE RULE, stated once". A square the
  // player has already narrowed keeps its marks; only a note-less empty square
  // is filled. What "every candidate" means is Rome's own, and it is per
  // square rather than a board-wide mask: see `legalDirs`.
  if (move.kind === "pencilAll") {
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] === EMPTY && pencil[i] === EMPTY) {
        pencil[i] = legalDirs(i % w, (i / w) | 0, w, h);
      }
    }
    return next;
  }

  if (move.kind === "pencilStrike") {
    for (const m of move.marks) pencil[m.y * w + m.x] &= ~dirBit(m.n);
    return next;
  }

  if (move.kind === "pencilAdd") {
    for (const m of move.marks) pencil[m.y * w + m.x] |= dirBit(m.n);
    return next;
  }

  // Before the bounds check below, not inside it: a move with no coordinates
  // makes every one of those comparisons false rather than true.
  if (move.kind !== "place" && move.kind !== "pencil") {
    return assertNever(move, "rome: executeMove");
  }

  const { x, y } = move;
  if (x < 0 || x >= w || y < 0 || y >= h) {
    throw new Error(`rome: move out of range (${x}, ${y})`);
  }
  const i = y * w + x;
  if (grid[i] & FM_FIXED) throw new Error("rome: cannot change a fixed clue");

  // The mask is for a move log recorded before input refused such a mark: it
  // replays as a no-op rather than as a note no hint can strike.
  if (move.kind === "place") grid[i] = move.dir ?? EMPTY;
  else
    pencil[i] =
      move.dir === null ? EMPTY : (pencil[i] ^ move.dir) & legalDirs(x, y, w, h);

  if (validateGame(next, true) === STATUS_COMPLETE) next.completed = true;
  return next;
}

/**
 * The unique solution's grid, re-derived from the fixed clues alone, or `null`
 * when this board is not deducible (a hand-written description, say). Never
 * derived from anything the player entered.
 */
function solutionGrid(state: RomeState): Int32Array | null {
  const board = boardFromClues(state);
  return romeSolve(board, DIFFCOUNT) === STATUS_COMPLETE ? board.grid : null;
}

function solve(orig: RomeState): SolveResult<RomeMove> {
  const solution = solutionGrid(orig);
  if (!solution) return { ok: false, error: "Unable to solve this puzzle." };
  const arrows: (RomeDir | null)[] = Array.from(solution, (c) => {
    const arrow = c & FM_ARROWMASK;
    return arrow === 0 ? null : (arrow as RomeDir);
  });
  return { ok: true, move: { kind: "solve", arrows } };
}

/**
 * Two layers, because either alone would bless a wrong board
 * (docs/games/solver-and-generator.md § "The solvable-game contract").
 *
 * The **rule violations** — an off-grid arrow, an arrow duplicated inside a
 * region, an arrow on a loop — are what the board already paints as you play,
 * and the validity check has already computed them into the grid.
 *
 * But an arrow can break no rule and still contradict the puzzle's unique
 * answer, and Check & Save must not store that board. So the second layer
 * re-solves from the fixed clues and flags every placed arrow the solution
 * disagrees with.
 *
 * **A mark is a claim that the arrow is still possible**, so a square whose
 * marks have crossed out the answer is wrong in the same way a wrong arrow is,
 * and is flagged the same way (docs/games/mechanics.md § "Pencil marks: the
 * full note-taking UX"; every other note-taking game in the collection does
 * this). Rome's marks went unchecked until `add-rome-hint`, on the strength of
 * upstream's "can be used for any purpose" — but a Mark-all press that fills
 * every legal arrow, and a hint that teaches the player to cross them off, both
 * only make sense under the possibility reading, and the solver has always read
 * the same array that way.
 */
function findMistakes(state: RomeState): readonly RomeMistake[] {
  const out: RomeMistake[] = [];
  const { grid } = state;

  for (let i = 0; i < grid.length; i++) {
    const c = grid[i];
    const kind =
      c & FE_BOUNDS ? "bounds" : c & FE_DOUBLE ? "double" : c & FE_LOOP ? "loop" : null;
    if (kind) out.push({ index: i, kind });
  }

  const solution = solutionGrid(state);
  if (solution) {
    for (let i = 0; i < grid.length; i++) {
      // A clue is never wrong, and a rule violation is already reported.
      if (grid[i] & (FM_FIXED | FE_BOUNDS | FE_DOUBLE | FE_LOOP)) continue;
      const answer = solution[i] & FM_ARROWMASK;
      const arrow = grid[i] & FM_ARROWMASK;
      if (arrow !== 0) {
        if (arrow !== answer) out.push({ index: i, kind: "wrong" });
        continue;
      }
      // An empty square is incomplete, never wrong — but its marks can be. A
      // square with no marks is saying nothing, which is why the emptiness test
      // is on the marks rather than on the square.
      if (state.pencil[i] !== EMPTY && !(state.pencil[i] & answer)) {
        out.push({ index: i, kind: "note" });
      }
    }
  }

  return out;
}

function flashLength(
  from: RomeState,
  to: RomeState,
  _dir: number,
  _ui: RomeUi,
): number {
  return winFlash(from, to, FLASH_TIME);
}

// --- the game ---------------------------------------------------------------

/** Rome's difficulty contract (`engine/difficulty.ts`), judged from
 * {@link boardFromClues} so the verdict is about the puzzle alone. */
const difficulty: DifficultyContract<RomeParams> = {
  tierOf: (p) => p.diff,
  withTier: (p, tier) => ({ ...p, diff: tier }),
  solveAtCap: (p, desc, cap) => {
    const ret = romeSolve(boardFromClues(newState(p, desc)), cap);
    if (ret === STATUS_COMPLETE) return "solved";
    return ret === STATUS_INVALID ? "impossible" : "unsolved";
  },
};

export const romeGame: Game<
  RomeParams,
  RomeState,
  RomeMove,
  RomeUi,
  RomeDrawState,
  RomeMistake
> = {
  id: "rome",
  canMarkAll: true,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,

  describeParams: (p): ConfigValues => ({
    width: String(p.w),
    height: String(p.h),
    difficulty: p.diff,
  }),
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newRomeDesc,
  validateDesc,
  newState,
  newUi,

  interpretMove,
  executeMove,
  status,

  solve,
  difficulty,
  findMistakes,
  requestKeys: () => ARROW_KEYS,

  // Rome has no auto-pencil preference, so a placement's area cull is always
  // taught as an explicit strike rather than folded into the placement.
  hint: (state, _aux, ui) =>
    candidateHint(state, ui ?? newUi(state), findMistakes, buildSteps),
  hintKeepTrack,
  refreshHintStep,

  // Upstream's two highlight preferences, with its own keywords and defaults,
  // then the note-taking cell's two.
  prefs: [
    {
      kw: "goal",
      name: "Highlight arrows pointing towards goal",
      type: "boolean",
      get: (ui) => ui.sgoals,
      set: (ui, v) => {
        ui.sgoals = v;
      },
    },
    {
      kw: "loop",
      name: "Highlight loops",
      type: "boolean",
      get: (ui) => ui.sloops,
      set: (ui, v) => {
        ui.sloops = v;
      },
    },
    stickyPencilPref(),
    pencilKeepHighlightPref(),
    candidateReadingPref(),
  ],

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  flashLength,
};

registerGame(romeGame);

/**
 * Guess — the Mastermind clone, ported from upstream's `guess.c`.
 *
 * Deduce a hidden combination of `npegs` color pegs drawn from `ncolors`
 * colors within `nguesses` rows; each submitted row is scored with Knuth's
 * black/white feedback. Win on all-correct-place, lose (and reveal) when the
 * rows run out. The working row lives in `GuessUi`, rebuilt by
 * `changedState` whenever the row being played changes; the answer row's
 * rule-out marks live in the state, and the hint (`hint.ts`) places them.
 */

import { assertNever } from "../../engine/assert-never.ts";
import { parseLeadingInt } from "../../engine/decimal.ts";
import { type Game, UI_UPDATE, type UiUpdate } from "../../engine/game.ts";
import { colorKeysZeroIsTen } from "../../engine/key-labels.ts";
import { parseConfigInt } from "../../engine/params.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  digitOf,
  isCursorMove,
  isEraseKey,
  isMouseRelease,
  moveCursor,
  newCursor,
  PENCIL_MODE_BUTTON,
  RIGHT_BUTTON,
  RIGHT_RELEASE,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { KeyLabel, Point } from "../../engine/types.ts";
import { guessHint, guessHintKeepTrack, guessRefreshHintStep } from "./hint.ts";
import {
  answerDotAt,
  COL_1,
  colors,
  computeSize,
  type GuessDrawState,
  newDrawState,
  PREFERRED_TILE_SIZE,
  pegOff,
  redraw,
} from "./render.ts";
import {
  cloneState,
  decodeParams,
  defaultParams,
  encodeParams,
  type GuessMove,
  type GuessParams,
  type GuessState,
  type GuessUi,
  isMarkable,
  markPegs,
  newDesc,
  newState,
  presets,
  status,
  validateDesc,
  validateParams,
} from "./state.ts";

// --- UI ----------------------------------------------------------------

function newUi(state: GuessState): GuessUi {
  const p = state.params;
  return {
    params: p,
    currPegs: new Array(p.npegs).fill(0),
    holds: new Array(p.npegs).fill(false),
    cursor: newCursor(),
    markable: false,
    showLabels: false,
    pencilMode: false,
  };
}

/**
 * Upstream `game_changed_state`: rebuild the working row from the state's holds
 * whenever the row being played changes — a submit, an undo or redo of one, a
 * reveal.
 *
 * **Only then**, because a mark is a move too and the row is not in it: rebuilt
 * after every transition, ruling a color out of the answer row would throw
 * away the half-composed guess the player was marking against.
 */
function changedState(ui: GuessUi, prev: GuessState | null, next: GuessState): void {
  if (prev && prev.nextGo === next.nextGo && prev.solved === next.solved) return;

  const { npegs } = next.params;
  const lastRow = next.nextGo > 0 ? next.guesses[next.nextGo - 1] : null;
  for (let i = 0; i < npegs; i++) {
    ui.holds[i] = !next.solved && next.holds[i];
    ui.currPegs[i] = ui.holds[i] && lastRow ? lastRow.pegs[i] : 0;
  }
  ui.markable = isMarkable(next.params, ui.currPegs);
  restCursor(ui, npegs);
}

function setPeg(params: GuessParams, ui: GuessUi, peg: number, col: number): void {
  ui.currPegs[peg] = col;
  ui.markable = isMarkable(params, ui.currPegs);
}

// --- where a color lands -----------------------------------------------

/** The first slot of the working row with no color in it, or `-1`. */
function firstEmpty(ui: GuessUi, npegs: number): number {
  for (let i = 0; i < npegs; i++) {
    if (ui.currPegs[i] === 0) return i;
  }
  return -1;
}

/**
 * Park the cursor where the next color will go: the first empty slot, else the
 * submit position.
 *
 * **This is the fix for a defect a keyboard used to hide.** The cursor used to
 * be reset to peg 0 after every transition, and a color key used to advance it
 * by one index — so a player holding pegs 0 and 2 got a row pre-filled out of
 * order and the very first color they pressed overwrote a peg they had asked to
 * keep. Filling the first *open* slot handles a row pre-filled in any pattern,
 * which advancing by index structurally cannot.
 *
 * `fallback` is where to rest when the row is full but cannot be submitted (a
 * repeated color under `allowMultiple: false`): the submit position would draw
 * the submit box around a row that will not go.
 */
function restCursor(ui: GuessUi, npegs: number, fallback = 0): void {
  const open = firstEmpty(ui, npegs);
  ui.cursor.x = open >= 0 ? open : ui.markable ? npegs : fallback;
}

/**
 * Enter `color` where the player is pointing: slot `at` when they tapped that
 * slot's dot in the answer row, else the slot they selected, else the first
 * empty one. Declines when the row is full and nothing is selected, as
 * a Wordle row does — there is nowhere for the color to go, and overwriting
 * a slot the player did not name would be a guess about which.
 */
function enterColor(
  params: GuessParams,
  ui: GuessUi,
  color: number,
  at = -1,
): UiUpdate | null {
  const { npegs } = params;
  const chosen = at >= 0 ? at : markSlot(ui, npegs);
  const slot = chosen >= 0 ? chosen : firstEmpty(ui, npegs);
  if (slot < 0) return null;
  setPeg(params, ui, slot, color);
  // The ring is the "where does the next one land" marker, so it is shown
  // whether or not the player has ever moved a cursor.
  ui.cursor.visible = true;
  restCursor(ui, npegs, slot);
  return UI_UPDATE;
}

/** The last color the player *typed*: the rightmost filled slot they are not
 * holding. A held slot was carried over from the previous row rather than
 * entered, so Backspace walks past it rather than undoing a hold. */
function lastTyped(ui: GuessUi, npegs: number): number {
  for (let i = npegs - 1; i >= 0; i--) {
    if (ui.currPegs[i] !== 0 && !ui.holds[i]) return i;
  }
  return -1;
}

function buildGuessMove(ui: GuessUi): GuessMove {
  return { type: "guess", pegs: ui.currPegs.slice(), holds: ui.holds.slice() };
}

// --- answer-row marks -------------------------------------------------

/** Rule `color` out of answer slot `pos`, or back in if it is already out. */
function toggleMark(state: GuessState, pos: number, color: number): GuessMove {
  const out = (state.ruledOut[pos] & (1 << color)) !== 0;
  return { type: "mark", marks: [{ pos, color }], ruledOut: !out };
}

/** Put every color of answer slot `pos` back, or decline if none is out. */
function clearMarks(state: GuessState, pos: number): GuessMove | null {
  const marks = [];
  for (let c = 1; c <= state.params.ncolors; c++) {
    if (state.ruledOut[pos] & (1 << c)) marks.push({ pos, color: c });
  }
  return marks.length > 0 ? { type: "mark", marks, ruledOut: false } : null;
}

/** The slot a mark from the keyboard goes in: the cursor's, when it is on one. */
function markSlot(ui: GuessUi, npegs: number): number {
  return ui.cursor.visible && ui.cursor.x < npegs ? ui.cursor.x : -1;
}

// --- input ------------------------------------------------------------

/**
 * ASCII carriage return — the Submit key's own code. This frontend maps a
 * physical Enter to `CURSOR_SELECT` (`view-interactive.ts`'s `puzzleKeyMap`),
 * so 13 arrives from the panel and from nowhere else, and the two spellings of
 * "send this row" stay distinguishable: Enter submits from the cursor's submit
 * position, this key submits from wherever the player is.
 */
const SUBMIT_BUTTON = 13;

/**
 * One key per color, then Clear, then Submit. The colors are Guess's elements
 * and this is where the collection puts a game's elements
 * (`docs/games/input.md` § "Put a game's markable elements on the panel").
 *
 * Painted from Guess's own palette rather than labeled with a bare digit: no
 * character names a color. The label stays the digit the keyboard sends, and
 * the tenth color is `'0'` — the key `digitOf` answers as zero and this game
 * reads as ten.
 *
 * **Submit is a key rather than an automatic consequence of filling the last
 * slot.** Undo cannot take a submitted row back — `changedState` rebuilds the
 * working row from the holds alone, so undoing the first guess of a board
 * returns an empty row rather than the one that was sent — which makes an
 * accidental submission a retype rather than a mistake to correct.
 *
 * It cannot be offered conditionally: `requestKeys` takes params only, because
 * the panel reloads only on a param change. Pressing it on a row that cannot
 * go is declined, and the status line says why.
 */
function requestKeys(p: GuessParams): KeyLabel[] {
  return [
    ...colorKeysZeroIsTen(p.ncolors, COL_1),
    { button: SUBMIT_BUTTON, label: "Submit" },
  ];
}

function interpretMove(
  from: GuessState,
  ui: GuessUi,
  ds: GuessDrawState,
  p: Point,
  button: number,
): GuessMove | null | UiUpdate {
  const params = from.params;
  const { npegs, ncolors } = params;

  // Label toggle is allowed even after the game ends.
  if (button === 0x6c || button === 0x4c /* 'l' | 'L' */) {
    ui.showLabels = !ui.showLabels;
    return UI_UPDATE;
  }
  if (from.solved) return null;

  const off = pegOff(ds);
  const { x, y } = p;

  // Hit-test the row being composed and the feedback pegs beside it — that
  // row's height only. Upstream's region ran `nguesses` rows down from it,
  // which once the answer row became a target swallowed it from the third
  // guess on: a tap on a dot selected the peg above it instead.
  let overGuess = -1; // current-row peg index
  let overHint = false;

  const guessOx = ds.guessx;
  const guessOy = ds.guessy + from.nextGo * off;
  const guessW = npegs * off;

  if (x >= guessOx && y >= guessOy && y < guessOy + off) {
    if (x < guessOx + guessW) overGuess = Math.floor((x - guessOx) / off);
    else overHint = true;
  }

  // --- pointer ---
  //
  // Every pointer action happens on the **release**, and the press is declined.
  // There is no drag to defer to, so claiming the press would buy only drag
  // frames nothing reads — and an unconsumed press is answered with a release
  // at the press point (`view-interactive.ts`), which makes a press that slides
  // off before it lifts still act where it started.
  //
  // Keyed on the button *class* rather than `LEFT_RELEASE`, so a press promoted
  // to the right button by the 350 ms touch hold still finishes as itself: a
  // held finger over the feedback pegs still submits. The hold toggle below is
  // the one meaning that stays the secondary button's alone, which is why Guess
  // cannot declare `ignoresSecondaryButton`.
  if (isMouseRelease(button)) {
    // A tap on a current-row slot **selects** it, so a row can be edited rather
    // than only filled left to right — and so a player with no arrow keys can
    // put a deliberate blank anywhere in the row, which filling the first empty
    // slot cannot express on its own.
    if (overGuess > -1) {
      ui.cursor.x = overGuess;
      ui.cursor.visible = true;
      return UI_UPDATE;
    }
    const dot = answerDotAt(ds, x, y);
    if (dot) {
      // The press already acted on a held finger or a right-click (below), so
      // its release has nothing left to do here.
      if (button === RIGHT_RELEASE) return null;
      // A tap on an answer-row dot **enters that color in that column**, which
      // is the pointer's way to place a peg without the keypad; in notes mode
      // it rules the color out instead, as the color keys do.
      if (dot.color === 0) {
        ui.cursor.x = dot.pos;
        ui.cursor.visible = true;
        return UI_UPDATE;
      }
      if (!ui.pencilMode) return enterColor(params, ui, dot.color, dot.pos);
      ui.cursor.x = dot.pos;
      ui.cursor.visible = true;
      return toggleMark(from, dot.pos, dot.color);
    }
    if (overHint && ui.markable) return buildGuessMove(ui);
    return null;
  }
  if (button === RIGHT_BUTTON) {
    if (overGuess > -1) {
      ui.holds[overGuess] = !ui.holds[overGuess];
      return UI_UPDATE;
    }
    // A right-click or a held finger on a dot rules it out in either mode —
    // the way to mark with no keypad and no mode to switch into.
    const dot = answerDotAt(ds, x, y);
    if (dot && dot.color > 0) return toggleMark(from, dot.pos, dot.color);
    return null;
  }

  // --- keyboard ---
  if (button === PENCIL_MODE_BUTTON) {
    ui.pencilMode = !ui.pencilMode;
    // Notes go in a slot, and the submit position is not one.
    if (ui.pencilMode && ui.cursor.x >= npegs) ui.cursor.x = npegs - 1;
    return UI_UPDATE;
  }
  if (isCursorMove(button)) {
    // One axis: the slot the next color fills, or — in notes mode — the answer
    // slot the next mark goes in, which is why the submit position drops out
    // there.
    const maxcur = npegs + (ui.markable && !ui.pencilMode ? 1 : 0);
    return moveCursor(ui.cursor, button, maxcur, 1) ? UI_UPDATE : null;
  }
  if (button === SUBMIT_BUTTON) return ui.markable ? buildGuessMove(ui) : null;
  if (button === CURSOR_SELECT) {
    // On the submit position Enter submits; on a slot it toggles notes mode,
    // which is what Enter on the highlight does in every note-taking game.
    // Declined with the cursor hidden, so it claims no key it did not act on.
    if (!ui.cursor.visible) return null;
    if (ui.cursor.x < npegs) {
      ui.pencilMode = !ui.pencilMode;
      return UI_UPDATE;
    }
    return ui.markable ? buildGuessMove(ui) : null;
  }
  // A digit picks a color; `0` is the tenth, which only a ten-color game has.
  const digit = digitOf(button);
  const color = digit === 0 ? 10 : digit;
  if (color !== null && color <= ncolors) {
    if (!ui.pencilMode) return enterColor(params, ui, color);
    const slot = markSlot(ui, npegs);
    return slot >= 0 ? toggleMark(from, slot, color) : null;
  }
  if (ui.pencilMode && isEraseKey(button)) {
    // Clear, in notes mode, puts the cursor's answer slot back to every color.
    const slot = markSlot(ui, npegs);
    return slot >= 0 ? clearMarks(from, slot) : null;
  }
  if (button === 0x44 || button === 0x64 || isEraseKey(button) /* 'D' | 'd' */) {
    // Rub out the selected slot, or — with nothing selected, or a selection
    // sitting on a slot that is already empty — the last color the player
    // typed. Backspacing is what makes the key work on a *full* row, where the
    // cursor rests on the submit position and this used to decline: that is
    // the moment a typo is most likely and most worth correcting.
    //
    // Both branches take a slot from a bounded scan or a cursor checked against
    // `npegs`, so this can no longer write `currPegs[npegs]`. Unguarded — as
    // upstream leaves it — that lengthens the row while `isMarkable` (reading
    // only the first `npegs`) still says yes, and `executeMove` then rejects
    // the guess with an illegal peg.
    const at = ui.cursor.visible && ui.cursor.x < npegs ? ui.cursor.x : -1;
    const slot = at >= 0 && ui.currPegs[at] !== 0 ? at : lastTyped(ui, npegs);
    if (slot < 0) return null;
    setPeg(params, ui, slot, 0);
    ui.cursor.x = slot;
    ui.cursor.visible = true;
    return UI_UPDATE;
  }
  if (button === CURSOR_SELECT2) {
    if (ui.cursor.x === npegs) return null;
    ui.cursor.visible = true;
    ui.holds[ui.cursor.x] = !ui.holds[ui.cursor.x];
    return UI_UPDATE;
  }
  return null;
}

// --- moves ------------------------------------------------------------

function executeMove(s: GuessState, m: GuessMove): GuessState {
  if (m.type === "solve") return { ...cloneState(s), solved: -1 };
  if (m.type === "mark") {
    const { npegs, ncolors } = s.params;
    const ret = cloneState(s);
    for (const { pos, color } of m.marks) {
      if (pos < 0 || pos >= npegs || color < 1 || color > ncolors) {
        throw new Error(`Illegal answer-row mark ${color} at ${pos}`);
      }
      if (m.ruledOut) ret.ruledOut[pos] |= 1 << color;
      else ret.ruledOut[pos] &= ~(1 << color);
    }
    return ret;
  }
  if (m.type !== "guess") return assertNever(m, "guess: executeMove");
  if (s.solved) throw new Error("No guesses allowed once the game is over");

  const { npegs, ncolors, nguesses, allowBlank } = s.params;
  const minColor = allowBlank ? 0 : 1;
  for (const v of m.pegs) {
    if (v < minColor || v > ncolors) throw new Error(`Illegal guess peg ${v}`);
  }

  const ret = cloneState(s);
  const row = ret.guesses[s.nextGo];
  const { feedback, ncPlace } = markPegs(m.pegs, s.solution, ncolors);
  for (let i = 0; i < npegs; i++) row.pegs[i] = m.pegs[i];
  row.feedback = feedback;

  const holds = m.holds.slice();
  if (ncPlace === npegs) return { ...ret, holds, solved: 1 };
  // Running out of rows loses, and reveals the answer.
  const nextGo = s.nextGo + 1;
  return { ...ret, holds, nextGo, solved: nextGo >= nguesses ? -1 : 0 };
}

// --- the Ui that outlives a save --------------------------------------

/**
 * The half-composed row and the live holds, in upstream's `encode_ui` format:
 * one peg color per slot, comma-separated, each suffixed `_` when held
 * (`3_,0,5,2`).
 *
 * Neither survives the move log, because neither is in it — a row is only
 * recorded once it is submitted, and a hold is only recorded as part of the
 * guess that carries it. Upstream persists both deliberately; here it matters
 * more, because composing a row is now the whole of playing this game rather
 * than one of two ways in.
 */
function encodeUi(ui: GuessUi): string {
  return ui.currPegs.map((peg, i) => `${peg}${ui.holds[i] ? "_" : ""}`).join(",");
}

function decodeUi(ui: GuessUi, encoded: string): void {
  const fields = encoded.split(",");
  const { npegs, ncolors } = ui.params;
  for (let i = 0; i < npegs; i++) {
    const field = fields[i] ?? "";
    const { value } = parseLeadingInt(field, 0);
    // A save is not a trusted input: a color this game does not have becomes an
    // empty slot, as upstream's decode_ui does.
    ui.currPegs[i] = value >= 1 && value <= ncolors ? value : 0;
    ui.holds[i] = field.endsWith("_");
  }
  ui.markable = isMarkable(ui.params, ui.currPegs);
  restCursor(ui, npegs);
}

// --- status line ------------------------------------------------------

/** Whether a color appears twice in the working row. */
function hasRepeat(pegs: readonly number[]): boolean {
  const seen = new Set<number>();
  for (const peg of pegs) {
    if (peg === 0) continue;
    if (seen.has(peg)) return true;
    seen.add(peg);
  }
  return false;
}

/**
 * The status line. It exists for one sentence — **why a row the player has
 * finished cannot be sent** — which the submit arms otherwise answer with a
 * silent `null`, and a key that appears to do nothing is indistinguishable from
 * one that is broken.
 *
 * The rest is the count a Mastermind player is always keeping anyway.
 */
function statusbarText(s: GuessState, ui: GuessUi): string {
  const { nguesses } = s.params;
  if (s.solved > 0) {
    const used = s.nextGo + 1;
    return `Solved in ${used} ${used === 1 ? "guess" : "guesses"}.`;
  }
  if (s.solved < 0) {
    return s.nextGo >= nguesses
      ? "Out of guesses: the answer is revealed."
      : "The answer is revealed.";
  }
  const where = `Guess ${s.nextGo + 1} of ${nguesses}`;
  if (ui.markable) return `${where}: ready to submit.`;
  if (!s.params.allowMultiple && hasRepeat(ui.currPegs)) {
    return `${where}: this game allows no repeated colors.`;
  }
  return where;
}

// --- Game object ------------------------------------------------------

export const guessGame: Game<
  GuessParams,
  GuessState,
  GuessMove,
  GuessUi,
  GuessDrawState
> = {
  id: "guess",
  wantsStatusbar: true,
  isTimed: false,
  canSolve: true,
  canFormatAsText: false,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  paramConfig: [
    {
      kw: "colors",
      name: "Colors",
      type: "string",
      get: (p) => String(p.ncolors),
      set: (p, v) => {
        p.ncolors = parseConfigInt(v);
      },
    },
    {
      kw: "pegs-per-guess",
      name: "Pegs per guess",
      type: "string",
      get: (p) => String(p.npegs),
      set: (p, v) => {
        p.npegs = parseConfigInt(v);
      },
    },
    {
      kw: "guesses",
      name: "Guesses",
      type: "string",
      get: (p) => String(p.nguesses),
      set: (p, v) => {
        p.nguesses = parseConfigInt(v);
      },
    },
    {
      kw: "allow-blanks",
      name: "Allow blanks",
      type: "boolean",
      get: (p) => p.allowBlank,
      set: (p, v) => {
        p.allowBlank = v;
      },
    },
    {
      kw: "allow-duplicates",
      name: "Allow duplicates",
      type: "boolean",
      get: (p) => p.allowMultiple,
      set: (p, v) => {
        p.allowMultiple = v;
      },
    },
  ],
  describeParams: (p) => ({
    colors: String(p.ncolors),
    "pegs-per-guess": String(p.npegs),
    guesses: String(p.nguesses),
    "allow-blanks": p.allowBlank,
    "allow-duplicates": p.allowMultiple,
  }),

  newDesc,
  validateDesc,
  newState,
  newUi,
  changedState,
  encodeUi,
  decodeUi,

  interpretMove,
  executeMove,
  status,
  requestKeys,
  statusbarText,

  solve() {
    // A give-up, as upstream's "S": reveal the answer, scored as a loss.
    return { ok: true, move: { type: "solve" } };
  },
  hint: (state, _aux, ui) => guessHint(state, ui),
  hintKeepTrack: guessHintKeepTrack,
  refreshHintStep: guessRefreshHintStep,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,
};

registerGame(guessGame);

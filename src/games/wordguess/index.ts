/**
 * Wordguess: find a hidden word in a few guesses, each a word of the list,
 * scored a letter at a time: in place, elsewhere in the word, or not there.
 *
 * Guess's shape (`code-rows.ts`): the working row lives in the `Ui` and is
 * edited through the shared mechanic, and a guess is the one move. This file
 * is the `Game` object, the routing of taps and keys onto it, and the
 * dictionary; the board and the score are [`state.ts`](./state.ts).
 */

import { rejectMove } from "../../engine/assert-never.ts";
import { enterValue, restCursor, rubOut } from "../../engine/code-rows.ts";
import { type Game, UI_UPDATE, type UiUpdate } from "../../engine/game.ts";
import { nothingToDeduce } from "../../engine/hint-finishes.ts";
import { click, key, type PointerAction } from "../../engine/hint-gesture.ts";
import { clearKey, letterKeyboard } from "../../engine/key-labels.ts";
import {
  CURSOR_SELECT,
  isCursorMove,
  isEraseKey,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  moveCursor,
  newCursor,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { KeyLabel, KeyStatus, Point, ReferenceModel } from "../../engine/types.ts";
import { answerWords } from "../../engine/word-list/index.ts";
import {
  dictionaryWords,
  WORDGUESS_RUNGS,
  wordguessHint,
  wordguessHintKeepTrack,
} from "./hint.ts";
import {
  COL_ELSEWHERE,
  COL_IN_PLACE,
  centerOf,
  colors,
  computeSize,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  tileRect,
  type WordguessDrawState,
  workingSlotAt,
} from "./render.ts";
import {
  ABSENT,
  decodeParams,
  defaultParams,
  ELSEWHERE,
  encodeParams,
  IN_PLACE,
  letterOf,
  menu,
  newDesc,
  newState,
  outcome,
  paramConfig,
  refusal,
  score,
  status,
  validateParams,
  valuesOf,
  type WordguessMove,
  type WordguessParams,
  type WordguessState,
  type WordguessUi,
  wordOf,
} from "./state.ts";

// --- UI ---------------------------------------------------------------------

function newUi(state: WordguessState): WordguessUi {
  return {
    params: state.params,
    entries: new Array(state.params.len).fill(0),
    cursor: newCursor(),
    ready: false,
    refused: false,
  };
}

/** Whether a row may go: the state's refusal, read for the row it is about. */
const readyIn =
  (s: WordguessState) =>
  (letters: readonly number[]): boolean =>
    refusal(s, letters) === null;

/** A fresh, empty working row whenever a guess is scored or taken back. */
function changedState(
  ui: WordguessUi,
  prev: WordguessState | null,
  next: WordguessState,
): void {
  if (prev && prev.rows.length === next.rows.length) return;
  ui.entries.fill(0);
  ui.ready = false;
  ui.refused = false;
  restCursor(ui);
}

// --- keys -------------------------------------------------------------------

/** ASCII carriage return, the Submit key's own code: a physical Enter arrives
 * as `CURSOR_SELECT`, so this code comes from the panel alone. */
const SUBMIT_BUTTON = 13;
/** The letter a button types, `1..26`, either case, or `null`. */
function letterFrom(button: number): number | null {
  if (button >= 0x61 && button <= 0x7a) return button - 0x60;
  if (button >= 0x41 && button <= 0x5a) return button - 0x40;
  return null;
}

/**
 * The letters as a keyboard has them, with Submit and Clear flanking the last
 * row where a word game keeps Enter and Backspace. Submit is a key rather than
 * the consequence of filling the last slot, because a row that goes cannot be
 * undone back to the word typed; a row that cannot go is declined, and the
 * status line says why.
 */
function requestKeys(_p: WordguessParams): KeyLabel[] {
  const keys = letterKeyboard();
  const last = keys.findIndex((k) => k.row === 2);
  keys.splice(last, 0, { button: SUBMIT_BUTTON, label: "Submit", row: 2 });
  keys.push({ ...clearKey, row: 2 });
  return keys;
}

/** Each letter key as the board has scored that letter, at its best: in place
 * in some row, elsewhere, or nowhere, which is a letter the word lacks. A
 * scored copy outranks an absent one, since only a copy past those the word
 * has is scored absent. */
function keyStatus(s: WordguessState): KeyStatus[] {
  const best = new Map<number, number>();
  for (const { letters, marks } of s.rows) {
    letters.forEach((v, i) => {
      best.set(v, Math.max(best.get(v) ?? ABSENT, marks[i]));
    });
  }
  return [...best].map(([v, mark]): KeyStatus => {
    const button = letterOf(v).toUpperCase().charCodeAt(0);
    if (mark === IN_PLACE)
      return { button, look: "fill", swatch: COL_IN_PLACE, spoken: "in place" };
    if (mark === ELSEWHERE)
      return { button, look: "disc", swatch: COL_ELSEWHERE, spoken: "in the word" };
    return { button, look: "faint", spoken: "not in the word" };
  });
}

// --- input ------------------------------------------------------------------

function guessMove(ui: WordguessUi): WordguessMove {
  return { type: "guess", letters: ui.entries.slice() };
}

/**
 * Submit, from the panel or Enter: the guess when the row may go. A full row
 * that may not is refused where the player is looking, with a frame round the
 * row until it is edited, while the status bar says why; a key that seemed to
 * do nothing would read as broken. A row with a gap is declined.
 */
function send(ui: WordguessUi): WordguessMove | UiUpdate | null {
  if (ui.ready) return guessMove(ui);
  if (ui.entries.includes(0) || ui.refused) return null;
  ui.refused = true;
  return UI_UPDATE;
}

function interpretMove(
  from: WordguessState,
  ui: WordguessUi,
  ds: WordguessDrawState,
  p: Point,
  button: number,
): WordguessMove | null | UiUpdate {
  if (outcome(from) !== 0) return null;
  const { len } = from.params;
  const ready = readyIn(from);

  // A press selects a slot of the working row. The selection is all a tap
  // does, so it is made on the press, and the drag and release that follow do
  // nothing.
  if (button === LEFT_BUTTON) {
    const slot = workingSlotAt(from, ds.tileSize, p.x, p.y);
    if (slot < 0) return null;
    if (ui.cursor.visible && ui.cursor.x === slot) return null;
    ui.cursor.x = slot;
    ui.cursor.visible = true;
    return UI_UPDATE;
  }
  if (isMouseDrag(button) || isMouseRelease(button)) return null;

  if (isCursorMove(button)) {
    const maxcur = len + (ui.ready ? 1 : 0);
    return moveCursor(ui.cursor, button, maxcur, 1) ? UI_UPDATE : null;
  }
  // Enter after a word sends it, wherever the frame is: a player types a word
  // and presses Enter.
  if (button === SUBMIT_BUTTON || button === CURSOR_SELECT) return send(ui);

  const letter = letterFrom(button);
  if (letter !== null) {
    // A letter is the game's even where the row has no room for it: declined,
    // it would fall through to the app's one-letter shortcuts, and an N typed
    // past the end of a word would deal a new game.
    if (enterValue(ui, letter, ready, "close")) ui.refused = false;
    return UI_UPDATE;
  }
  if (isEraseKey(button)) {
    if (!rubOut(ui, ready)) return null;
    ui.refused = false;
    return UI_UPDATE;
  }
  return null;
}

// --- moves ------------------------------------------------------------------

function executeMove(s: WordguessState, m: WordguessMove): WordguessState {
  if (m.type !== "guess") rejectMove(m, "wordguess");
  if (outcome(s) !== 0) throw new Error("No guesses once the game is over");
  const why = refusal(s, m.letters);
  if (why !== null) throw new Error(`Illegal guess ${wordOf(m.letters)}: ${why}`);
  const row = { letters: m.letters.slice(), marks: score(m.letters, s.answer) };
  return { ...s, rows: [...s.rows, row] };
}

// --- the dictionary ---------------------------------------------------------

/**
 * Every word the game can draw at this length, A to Z, those that no longer
 * fit every score ruled out: a guess that cannot win may still split the
 * rest best, so the whole list is the player's to choose from. Where no
 * answer fits, the other words that do are listed too, so "Fits" holds the
 * words the hint counts.
 */
function reference(s: WordguessState, _ui: WordguessUi): ReferenceModel {
  const fitting = new Set(dictionaryWords(s).words);
  const words = [...new Set([...answerWords(s.params.len), ...fitting])].sort();
  const byLetter = new Map<string, string[]>();
  for (const word of words) {
    const letter = word[0].toUpperCase();
    const group = byLetter.get(letter);
    if (group) group.push(word);
    else byLetter.set(letter, [word]);
  }
  return {
    instructions: "Tap a word to write it into the row you are filling.",
    search: true,
    filters: [{ label: "Fits", statuses: ["outstanding"] }],
    sections: [...byLetter].map(([letter, group]) => ({
      heading: letter,
      group: null,
      items: group.map((word) => ({
        key: word,
        label: word.toUpperCase(),
        status: fitting.has(word) ? "outstanding" : "ruledOut",
      })),
    })),
    // A word written in is the row's, edited from there as typed letters
    // are, so nothing stays selected in the list.
    selected: null,
    hinted: [],
  };
}

/** Write `key`, a word of the list, into the working row, as if typed. */
function selectReference(ui: WordguessUi, key: string | null): boolean {
  if (key === null || key.length !== ui.entries.length) return false;
  const letters = valuesOf(key);
  if (letters.every((v, i) => ui.entries[i] === v)) return false;
  letters.forEach((v, i) => {
    ui.entries[i] = v;
  });
  ui.ready = true;
  ui.refused = false;
  restCursor(ui, -1);
  return true;
}

// --- the Ui that outlives a save --------------------------------------------

/** The word being written, a letter a slot and `.` for an empty one. It is in
 * no move until it is submitted, so without this a reload would lose it. */
function encodeUi(ui: WordguessUi): string {
  return ui.entries.map((v) => (v > 0 ? letterOf(v) : ".")).join("");
}

function decodeUi(ui: WordguessUi, encoded: string, s: WordguessState): void {
  // A save is not a trusted input: anything but a letter is an empty slot.
  for (let i = 0; i < ui.entries.length; i++) {
    ui.entries[i] = letterFrom(encoded.charCodeAt(i)) ?? 0;
  }
  ui.ready = readyIn(s)(ui.entries);
  // A whole row that is no word takes no more letters, as when it was typed.
  restCursor(ui, -1);
}

// --- status line ------------------------------------------------------------

/** Why a row the player has finished cannot be sent, which a declined Submit
 * would otherwise leave unsaid; and the count of guesses. */
function statusbarText(s: WordguessState, ui: WordguessUi): string {
  const o = outcome(s);
  if (o > 0) {
    const used = s.rows.length;
    return `Solved in ${used} ${used === 1 ? "guess" : "guesses"}.`;
  }
  if (o < 0) return `Out of guesses: the word was ${wordOf(s.answer).toUpperCase()}.`;
  const where = `Guess ${s.rows.length + 1} of ${s.params.nguesses}`;
  if (ui.entries.includes(0)) return where;
  const why = refusal(s, ui.entries);
  return why === null ? `${where}: ready to submit.` : `${where}: ${why}.`;
}

// --- Game object ------------------------------------------------------------

export const wordguessGame: Game<
  WordguessParams,
  WordguessState,
  WordguessMove,
  WordguessUi,
  WordguessDrawState
> = {
  id: "wordguess",

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  paramConfig,
  notApplicable: {
    transposeParams:
      "Your guesses run down the board in the order you made them, so there is no grid to turn.",
  },

  newDesc,
  newState,
  newUi,
  changedState,
  encodeUi,
  decodeUi,

  interpretMove,
  // A tap only selects; there is no second action to hold a finger for.
  ignoresSecondaryButton: true,
  executeMove,
  finishesByDeduction: nothingToDeduce,
  status,
  requestKeys,
  keyStatus,
  statusbarText,
  reference: { title: "Dictionary", model: reference, select: selectReference },

  solve(_orig, curr) {
    return { ok: true, move: { type: "guess", letters: curr.answer.slice() } };
  },
  hint: (state) => wordguessHint(state),
  hintRungs: WORDGUESS_RUNGS,
  hintMarks: {
    roles: {
      ring: "the squares of the row you are writing: *the ringed squares* the suggested word goes in.",
    },
  },
  hintKeepTrack: wordguessHintKeepTrack,
  // A tap selects a square of the row being written, and a letter key types
  // the letter there.
  hintGesture(state, ui, ds, m): readonly PointerAction[] {
    const letterKey = (v: number) => key(letterOf(v).toUpperCase().charCodeAt(0));
    const ts = ds.tileSize;
    const typed = m.letters.flatMap((v, pos) =>
      ui.entries[pos] === v
        ? []
        : [click(centerOf(tileRect(ts, state.rows.length, pos))), letterKey(v)],
    );
    return [...typed, key(SUBMIT_BUTTON)];
  },

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,
};

registerGame(wordguessGame);

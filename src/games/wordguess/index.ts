/**
 * Wordguess: find a hidden word in a few guesses, each a word of the list,
 * scored a letter at a time: in place, elsewhere in the word, or not there.
 *
 * Guess's shape (`code-rows.ts`): the working row lives in the `Ui` and is
 * edited through the shared mechanic, and the answer row's rule-outs are moves.
 * This file is the `Game` object and the routing of taps and keys onto it; the
 * board and the score are [`state.ts`](./state.ts).
 */

import { assertNever } from "../../engine/assert-never.ts";
import {
  enterValue,
  isRuledOut,
  restCursor,
  rubOut,
  ruledOutAt,
  selectedSlot,
  withRuleOuts,
} from "../../engine/code-rows.ts";
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
  PENCIL_MODE_BUTTON,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { KeyLabel, KeyStatus, Point } from "../../engine/types.ts";
import {
  WORDGUESS_RUNGS,
  wordguessHint,
  wordguessHintKeepTrack,
  wordguessRefreshHintStep,
} from "./hint.ts";
import {
  answerRect,
  answerSlotAt,
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
  findMistakes,
  IN_PLACE,
  letterOf,
  menu,
  NLETTERS,
  newDesc,
  newState,
  outcome,
  paramConfig,
  refusal,
  score,
  status,
  validateParams,
  type WordguessMistake,
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
    pencilMode: false,
    refused: false,
  };
}

/** Whether a row may go: the state's refusal, read for the row it is about. */
const readyIn =
  (s: WordguessState) =>
  (letters: readonly number[]): boolean =>
    refusal(s, letters) === null;

/** A fresh, empty working row whenever a guess is scored or taken back. A mark
 * leaves the row alone, so ruling a letter out does not throw away the word
 * the player was writing. */
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

function toggleMark(s: WordguessState, pos: number, letter: number): WordguessMove {
  const out = isRuledOut(s.ruledOut, pos, letter);
  return { type: "mark", marks: [{ pos, letter }], ruledOut: !out };
}

function clearMarks(s: WordguessState, pos: number): WordguessMove | null {
  const marks = ruledOutAt(s.ruledOut, pos, NLETTERS).map((letter) => ({
    pos,
    letter,
  }));
  return marks.length > 0 ? { type: "mark", marks, ruledOut: false } : null;
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

  // A press selects a slot of the working row or of the answer row, and the row
  // it is in decides what a letter does. The selection is all a tap does, so it
  // is made on the press, and the drag and release that follow do nothing.
  if (button === LEFT_BUTTON) {
    const working = workingSlotAt(from, ds.tileSize, p.x, p.y);
    const answer = answerSlotAt(from.params, ds.tileSize, p.x, p.y);
    const slot = working >= 0 ? working : answer;
    if (slot < 0) return null;
    const notes = working < 0;
    if (ui.cursor.visible && ui.cursor.x === slot && ui.pencilMode === notes)
      return null;
    ui.cursor.x = slot;
    ui.cursor.visible = true;
    ui.pencilMode = notes;
    return UI_UPDATE;
  }
  if (isMouseDrag(button) || isMouseRelease(button)) return null;

  if (button === PENCIL_MODE_BUTTON) {
    ui.pencilMode = !ui.pencilMode;
    if (ui.pencilMode && ui.cursor.x >= len) ui.cursor.x = len - 1;
    return UI_UPDATE;
  }
  if (isCursorMove(button)) {
    const maxcur = len + (ui.ready && !ui.pencilMode ? 1 : 0);
    return moveCursor(ui.cursor, button, maxcur, 1) ? UI_UPDATE : null;
  }
  if (button === SUBMIT_BUTTON) return send(ui);
  if (button === CURSOR_SELECT) {
    // Enter after a word sends it, wherever the frame is: a player types a
    // word and presses Enter. Unlike Guess's Enter on a slot, it never switches
    // Marks on, which would turn the next word typed into rule-outs; in Marks
    // mode it goes back to typing.
    if (ui.pencilMode) {
      ui.pencilMode = false;
      restCursor(ui);
      return UI_UPDATE;
    }
    return send(ui);
  }

  const letter = letterFrom(button);
  if (letter !== null) {
    if (ui.pencilMode) {
      const slot = selectedSlot(ui);
      return slot >= 0 ? toggleMark(from, slot, letter) : UI_UPDATE;
    }
    // A letter is the game's even where the row has no room for it: declined,
    // it would fall through to the app's one-letter shortcuts, and an N typed
    // past the end of a word would deal a new game.
    if (enterValue(ui, letter, ready, "close")) ui.refused = false;
    return UI_UPDATE;
  }
  if (isEraseKey(button)) {
    if (ui.pencilMode) {
      const slot = selectedSlot(ui);
      return slot >= 0 ? clearMarks(from, slot) : null;
    }
    if (!rubOut(ui, ready)) return null;
    ui.refused = false;
    return UI_UPDATE;
  }
  return null;
}

// --- moves ------------------------------------------------------------------

function executeMove(s: WordguessState, m: WordguessMove): WordguessState {
  if (m.type === "mark") {
    const marks = m.marks.map(({ pos, letter }) => ({ pos, value: letter }));
    return { ...s, ruledOut: withRuleOuts(s.ruledOut, marks, m.ruledOut, NLETTERS) };
  }
  if (m.type !== "guess") return assertNever(m, "wordguess: executeMove");
  if (outcome(s) !== 0) throw new Error("No guesses once the game is over");
  const why = refusal(s, m.letters);
  if (why !== null) throw new Error(`Illegal guess ${wordOf(m.letters)}: ${why}`);
  const row = { letters: m.letters.slice(), marks: score(m.letters, s.answer) };
  return { ...s, rows: [...s.rows, row] };
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
  WordguessDrawState,
  WordguessMistake
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
  findMistakes,
  // Every letter of a wrong slot comes back, so the clearing does not say
  // which rule-out was the answer's letter, as the check does not.
  clearMistakes: (state, mistakes) =>
    mistakes.flatMap(({ pos }) => clearMarks(state, pos) ?? []),
  requestKeys,
  keyStatus,
  statusbarText,

  solve(_orig, curr) {
    return { ok: true, move: { type: "guess", letters: curr.answer.slice() } };
  },
  hint: (state) => wordguessHint(state),
  hintRungs: WORDGUESS_RUNGS,
  hintMarks: {
    roles: {
      ring: "the squares of the row you are writing, when the step suggests a guess: *the ringed squares* the word goes in.",
      strike:
        "a letter in the answer row: *the struck letters*, the ones the step rules out of their slots.",
      outline:
        "an answer slot, in a second color: *the outlined slot*, one whose letters the step already knows and leans on.",
      stripes: "a scored row: *the striped row* the step reads.",
    },
  },
  hintKeepTrack: wordguessHintKeepTrack,
  refreshHintStep: wordguessRefreshHintStep,
  // A tap selects a slot, and the row it is in decides whether a letter key
  // types the letter or rules it out of the answer.
  hintGesture(state, ui, ds, m): readonly PointerAction[] {
    const letterKey = (v: number) => key(letterOf(v).toUpperCase().charCodeAt(0));
    const ts = ds.tileSize;
    if (m.type === "mark") {
      return m.marks.flatMap((mark) => [
        click(centerOf(answerRect(state.params, ts, mark.pos))),
        letterKey(mark.letter),
      ]);
    }
    if (m.type !== "guess") return [];
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

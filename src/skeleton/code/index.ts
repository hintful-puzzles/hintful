/**
 * Skeleton: find a hidden code of different digits in a few guesses, each
 * scored a digit at a time: in place, elsewhere in the code, or not there.
 *
 * The working row lives in the `Ui` and is edited through the shared
 * mechanic (`code-rows.ts`), as is the answer row of rule-outs. This file is
 * the `Game` object and the routing of taps and keys onto it; the board and
 * the score are [`state.ts`](./state.ts).
 */

import { rejectMove } from "../../engine/contract/assert-never.ts";
import { type Game, UI_UPDATE, type UiUpdate } from "../../engine/contract/game.ts";
import type { KeyLabel, Point, ReferenceModel } from "../../engine/contract/types.ts";
import { click, key, type PointerAction } from "../../engine/input/hint-gesture.ts";
import { digitKeyCode, digitKeys } from "../../engine/input/key-labels.ts";
import {
  CURSOR_SELECT,
  digitOf,
  isCursorMove,
  isEraseKey,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  moveCursor,
  newCursor,
  PENCIL_MODE_BUTTON,
} from "../../engine/input/pointer.ts";
import {
  enterValue,
  isRuledOut,
  restCursor,
  rubOut,
  ruledOutAt,
  selectedSlot,
  withRuleOuts,
} from "../../engine/mechanics/code-rows.ts";
import { nothingToDeduce } from "../../engine/solve/hint-finishes.ts";
import {
  codesFitting,
  SKELETON_RUNGS,
  type SkeletonHighlights,
  type SkeletonRung,
  skeletonHint,
  skeletonHintKeepTrack,
  skeletonRefreshHintStep,
} from "./hint.ts";
import {
  answerRect,
  answerSlotAt,
  centerOf,
  colors,
  computeSize,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type SkeletonDrawState,
  tileRect,
  workingSlotAt,
} from "./render.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  findMistakes,
  menu,
  newDesc,
  newState,
  outcome,
  paramConfig,
  refusal,
  type SkeletonMistake,
  type SkeletonMove,
  type SkeletonParams,
  type SkeletonState,
  type SkeletonUi,
  score,
  status,
  validateParams,
} from "./state.ts";

// --- UI ---------------------------------------------------------------------

function newUi(state: SkeletonState): SkeletonUi {
  return {
    params: state.params,
    entries: new Array(state.params.len).fill(0),
    cursor: newCursor(),
    pencilMode: false,
    ready: false,
    refused: false,
  };
}

/** Whether a row may go: the state's refusal, read for the row it is about. */
const readyIn =
  (s: SkeletonState) =>
  (digits: readonly number[]): boolean =>
    refusal(s, digits) === null;

/** A fresh, empty working row whenever a guess is scored or taken back. A
 * mark is a move too, and leaves the row being written alone. */
function changedState(
  ui: SkeletonUi,
  prev: SkeletonState | null,
  next: SkeletonState,
): void {
  if (prev && prev.rows.length === next.rows.length) return;
  ui.entries.fill(0);
  ui.ready = false;
  ui.refused = false;
  restCursor(ui);
}

// --- answer-row marks -------------------------------------------------------

/** Rule `digit` out of answer slot `pos`, or back in if it is already out. */
function toggleMark(s: SkeletonState, pos: number, digit: number): SkeletonMove {
  const out = isRuledOut(s.ruledOut, pos, digit);
  return { type: "mark", marks: [{ pos, value: digit }], ruledOut: !out };
}

/** Put every digit of answer slot `pos` back, or decline if none is out. */
function clearMarks(s: SkeletonState, pos: number): SkeletonMove | null {
  const marks = ruledOutAt(s.ruledOut, pos, s.params.nsymbols).map((value) => ({
    pos,
    value,
  }));
  return marks.length > 0 ? { type: "mark", marks, ruledOut: false } : null;
}

// --- keys -------------------------------------------------------------------

/** ASCII carriage return, the Submit key's own code: a physical Enter arrives
 * as `CURSOR_SELECT`, so this code comes from the panel alone. */
const SUBMIT_BUTTON = 13;

/**
 * A key a digit, Clear, then Submit. Submit is a key rather than the
 * consequence of filling the last square, because a row that goes cannot be
 * undone back to the guess typed; a row that cannot go is refused, and the
 * status line says why. The engine adds the Marks key.
 */
function requestKeys(p: SkeletonParams): KeyLabel[] {
  return [...digitKeys(p.nsymbols), { button: SUBMIT_BUTTON, label: "Submit" }];
}

// --- input ------------------------------------------------------------------

function guessMove(ui: SkeletonUi): SkeletonMove {
  return { type: "guess", digits: ui.entries.slice() };
}

/**
 * Submit: the guess when the row may go. A full row that may not is refused
 * where the player is looking, with a frame round the row until it is edited,
 * while the status bar says why; a key that seemed to do nothing would read as
 * broken. A row with a gap is declined.
 */
function send(ui: SkeletonUi): SkeletonMove | UiUpdate | null {
  if (ui.ready) return guessMove(ui);
  if (ui.entries.includes(0) || ui.refused) return null;
  ui.refused = true;
  return UI_UPDATE;
}

function interpretMove(
  from: SkeletonState,
  ui: SkeletonUi,
  ds: SkeletonDrawState,
  p: Point,
  button: number,
): SkeletonMove | null | UiUpdate {
  if (outcome(from) !== 0) return null;
  const { len, nsymbols } = from.params;
  const ready = readyIn(from);

  // A press selects a square of the working row, or a slot of the answer row,
  // and the row it is in decides what a digit key does: enter the digit, or
  // rule it out. The selection is all a tap does, so it is made on the press.
  if (button === LEFT_BUTTON) {
    const square = workingSlotAt(from, ds.tileSize, p.x, p.y);
    const slot = answerSlotAt(from, ds.tileSize, p.x, p.y);
    const at = square >= 0 ? square : slot;
    if (at < 0) return null;
    const pencil = square < 0;
    if (ui.cursor.visible && ui.cursor.x === at && ui.pencilMode === pencil)
      return null;
    ui.cursor.x = at;
    ui.cursor.visible = true;
    ui.pencilMode = pencil;
    return UI_UPDATE;
  }
  if (isMouseDrag(button) || isMouseRelease(button)) return null;

  if (button === PENCIL_MODE_BUTTON) {
    ui.pencilMode = !ui.pencilMode;
    // Notes go in a slot, and the submit position is not one.
    if (ui.pencilMode && ui.cursor.x >= len) ui.cursor.x = len - 1;
    return UI_UPDATE;
  }
  if (isCursorMove(button)) {
    const maxcur = len + (ui.ready && !ui.pencilMode ? 1 : 0);
    return moveCursor(ui.cursor, button, maxcur, 1) ? UI_UPDATE : null;
  }
  if (button === SUBMIT_BUTTON) return send(ui);
  if (button === CURSOR_SELECT) {
    // Past the last square Enter submits; on a square it switches notes mode,
    // as Enter on the highlight does in every note-taking game.
    if (!ui.cursor.visible) return null;
    if (ui.cursor.x < len) {
      ui.pencilMode = !ui.pencilMode;
      return UI_UPDATE;
    }
    return send(ui);
  }

  const digit = digitOf(button);
  if (digit !== null && digit >= 1 && digit <= nsymbols) {
    if (ui.pencilMode) {
      const slot = selectedSlot(ui);
      return slot >= 0 ? toggleMark(from, slot, digit) : null;
    }
    if (!enterValue(ui, digit, ready)) return null;
    ui.refused = false;
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

function executeMove(s: SkeletonState, m: SkeletonMove): SkeletonState {
  if (m.type === "mark") {
    return {
      ...s,
      ruledOut: withRuleOuts(s.ruledOut, m.marks, m.ruledOut, s.params.nsymbols),
    };
  }
  if (m.type !== "guess") rejectMove(m, "skeleton");
  if (outcome(s) !== 0) throw new Error("No guesses once the game is over");
  const why = refusal(s, m.digits);
  if (why !== null) throw new Error(`Illegal guess ${m.digits.join("")}: ${why}`);
  const row = { digits: m.digits.slice(), marks: score(m.digits, s.code) };
  return { ...s, rows: [...s.rows, row] };
}

// --- the reference ----------------------------------------------------------

/**
 * Every code that still fits every score, by its first digit: what the hint
 * counts, so the list and the hint's count agree.
 */
function reference(s: SkeletonState, _ui: SkeletonUi): ReferenceModel {
  const byFirst = new Map<number, string[]>();
  for (const code of codesFitting(s)) {
    const group = byFirst.get(code[0]);
    if (group) group.push(code.join(""));
    else byFirst.set(code[0], [code.join("")]);
  }
  return {
    instructions: "Tap a code to write it into the row you are filling.",
    search: true,
    filters: [],
    sections: [...byFirst].map(([first, group]) => ({
      heading: String(first),
      group: null,
      items: group.map((code) => ({ key: code, label: code, status: "outstanding" })),
    })),
    // A code written in is the row's, edited from there as typed digits are,
    // so nothing stays selected in the list.
    selected: null,
    hinted: [],
  };
}

/** Write `key`, a code of the list, into the working row, as if typed. */
function selectReference(
  s: SkeletonState,
  ui: SkeletonUi,
  key: string | null,
): UiUpdate | null {
  if (key === null || key.length !== ui.entries.length) return null;
  const digits = Array.from(key, Number);
  if (digits.every((v, i) => ui.entries[i] === v)) return null;
  digits.forEach((v, i) => {
    ui.entries[i] = v;
  });
  ui.ready = readyIn(s)(ui.entries);
  ui.refused = false;
  ui.pencilMode = false;
  restCursor(ui);
  return UI_UPDATE;
}

// --- the Ui that outlives a save --------------------------------------------

/** The guess being written, a digit a square and `.` for an empty one. It is
 * in no move until it is submitted, so without this a reload would lose it. */
function encodeUi(ui: SkeletonUi): string {
  return ui.entries.map((v) => (v > 0 ? String(v) : ".")).join("");
}

function decodeUi(ui: SkeletonUi, encoded: string, s: SkeletonState): void {
  // A save is not a trusted input: anything but a digit of this game is an
  // empty square.
  for (let i = 0; i < ui.entries.length; i++) {
    const v = Number(encoded[i]);
    ui.entries[i] = Number.isInteger(v) && v >= 1 && v <= s.params.nsymbols ? v : 0;
  }
  ui.ready = readyIn(s)(ui.entries);
  restCursor(ui);
}

// --- status line ------------------------------------------------------------

/** Why a row the player has finished cannot be sent, which a declined Submit
 * would otherwise leave unsaid; and the count of guesses. */
function statusbarText(s: SkeletonState, ui: SkeletonUi): string {
  const o = outcome(s);
  if (o > 0) {
    const used = s.rows.length;
    return `Solved in ${used} ${used === 1 ? "guess" : "guesses"}.`;
  }
  if (o < 0) return `Out of guesses: the code was ${s.code.join("")}.`;
  const where = `Guess ${s.rows.length + 1} of ${s.params.nguesses}`;
  if (ui.entries.includes(0)) return where;
  const why = refusal(s, ui.entries);
  return why === null ? `${where}: ready to submit.` : `${where}: ${why}.`;
}

// --- the hint's gesture -----------------------------------------------------

/** A tap selects a square or a slot, and a digit key enters the digit there,
 * or rules it out. */
function hintGesture(
  state: SkeletonState,
  ui: SkeletonUi,
  ds: SkeletonDrawState,
  m: SkeletonMove,
): readonly PointerAction[] {
  const ts = ds.tileSize;
  const digitKey = (v: number) => key(digitKeyCode(v));
  if (m.type === "mark") {
    return m.marks.flatMap(({ pos, value }) => [
      click(centerOf(answerRect(ts, state.params, pos))),
      digitKey(value),
    ]);
  }
  const typed = m.digits.flatMap((v, pos) =>
    ui.entries[pos] === v && !ui.pencilMode
      ? []
      : [click(centerOf(tileRect(ts, state.rows.length, pos))), digitKey(v)],
  );
  return [...typed, key(SUBMIT_BUTTON)];
}

// --- Game object ------------------------------------------------------------

export const skeletonGame: Game<
  SkeletonParams,
  SkeletonState,
  SkeletonMove,
  SkeletonUi,
  SkeletonDrawState,
  SkeletonMistake,
  SkeletonHighlights,
  SkeletonRung
> = {
  id: "skeleton",

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
  uiCodec: { encode: encodeUi, decode: decodeUi },

  interpretMove,
  // A tap only selects; there is no second action to hold a finger for.
  ignoresSecondaryButton: true,
  executeMove,
  finishesByDeduction: nothingToDeduce,
  status,
  findMistakes,
  // Every digit of a wrong slot comes back, so the clearing does not say
  // which rule-out was the code's digit, as the check does not.
  clearMistakes: (state, mistakes) =>
    mistakes.flatMap(({ pos }) => clearMarks(state, pos) ?? []),
  requestKeys,
  statusbarText,
  reference: {
    title: "Codes",
    model: reference,
    // The model reads only the board: a selection writes into the row.
    watches: () => "",
    select: selectReference,
  },

  solve(_orig, curr) {
    return { ok: true, move: { type: "guess", digits: curr.code.slice() } };
  },
  hint: {
    plan: (state) => skeletonHint(state),
    rungs: SKELETON_RUNGS,
    marks: {
      roles: {
        ring: "what the step acts on: *the ringed digits* in the answer row, which it rules out, or *the ringed squares* of the row you are filling, where the guess it suggests goes.",
        stripes: "a scored row: *the striped row* the step reads.",
      },
    },
    keepTrack: skeletonHintKeepTrack,
    refreshStep: skeletonRefreshHintStep,
    gesture: hintGesture,
  },

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,
};

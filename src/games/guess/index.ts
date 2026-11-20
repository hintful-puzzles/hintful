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

import {
  enterValue,
  isRuledOut,
  restCursor,
  rubOut,
  ruledOutAt,
  selectedSlot,
  withRuleOuts,
} from "../../engine/code-rows.ts";
import { assertNever } from "../../engine/contract/assert-never.ts";
import { type Game, UI_UPDATE, type UiUpdate } from "../../engine/contract/game.ts";
import type { KeyLabel, Point } from "../../engine/contract/types.ts";
import { parseLeadingInt } from "../../engine/decimal.ts";
import { nothingToDeduce } from "../../engine/hint-finishes.ts";
import { click, key, type PointerAction } from "../../engine/hint-gesture.ts";
import { colorKeysZeroIsTen } from "../../engine/key-labels.ts";
import { modifierItem } from "../../engine/modifier.ts";
import { numberItem } from "../../engine/params.ts";
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
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  GUESS_RUNGS,
  type GuessHighlights,
  type GuessRung,
  guessHint,
  guessHintKeepTrack,
  guessRefreshHintStep,
} from "./hint.ts";
import {
  answerSlotAt,
  answerSlotPoint,
  COL_1,
  colors,
  computeSize,
  type GuessDrawState,
  guessSlotPoint,
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
  findMistakes,
  type GuessMistake,
  type GuessMove,
  type GuessParams,
  type GuessState,
  type GuessUi,
  isMarkable,
  MAXCOLORS,
  markPegs,
  menu,
  newDesc,
  newState,
  outcome,
  status,
  validateParams,
} from "./state.ts";

// --- UI ----------------------------------------------------------------

function newUi(state: GuessState): GuessUi {
  const p = state.params;
  return {
    params: p,
    entries: new Array(p.npegs).fill(0),
    holds: new Array(p.npegs).fill(false),
    cursor: newCursor(),
    ready: false,
    showLabels: false,
    pencilMode: false,
  };
}

const readyFor =
  (params: GuessParams) =>
  (pegs: readonly number[]): boolean =>
    isMarkable(params, pegs);

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
  const over = outcome(next) !== 0;
  if (prev && prev.nextGo === next.nextGo && (outcome(prev) !== 0) === over) return;

  const { npegs } = next.params;
  const lastRow = next.nextGo > 0 ? next.guesses[next.nextGo - 1] : null;
  for (let i = 0; i < npegs; i++) {
    ui.holds[i] = !over && next.holds[i];
    ui.entries[i] = ui.holds[i] && lastRow ? lastRow.pegs[i] : 0;
  }
  ui.ready = isMarkable(next.params, ui.entries);
  restCursor(ui);
}

function buildGuessMove(ui: GuessUi): GuessMove {
  return { type: "guess", pegs: ui.entries.slice(), holds: ui.holds.slice() };
}

// --- answer-row marks -------------------------------------------------

/** Rule `color` out of answer slot `pos`, or back in if it is already out. */
function toggleMark(state: GuessState, pos: number, color: number): GuessMove {
  const out = isRuledOut(state.ruledOut, pos, color);
  return { type: "mark", marks: [{ pos, color }], ruledOut: !out };
}

/** Put every color of answer slot `pos` back, or decline if none is out. */
function clearMarks(state: GuessState, pos: number): GuessMove | null {
  const marks = ruledOutAt(state.ruledOut, pos, state.params.ncolors).map((color) => ({
    pos,
    color,
  }));
  return marks.length > 0 ? { type: "mark", marks, ruledOut: false } : null;
}

// --- input ------------------------------------------------------------

/**
 * ASCII carriage return — the Submit key's own code. This frontend maps a
 * physical Enter to `CURSOR_SELECT` (`engine/key-map.ts`),
 * so 13 arrives from the panel and from nowhere else, and the two spellings of
 * "send this row" stay distinguishable: Enter submits from the cursor's submit
 * position, this key submits from wherever the player is.
 */
const SUBMIT_BUTTON = 13;

/**
 * One key per color, then Clear, then Submit. The colors are Guess's elements
 * and this is where the collection puts a game's elements
 * (`docs/input.md` § "The on-screen keypad").
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
  if (outcome(from) !== 0) return null;

  const off = pegOff(ds);
  const { x, y } = p;

  // Hit-test the row being composed and the feedback pegs beside it — that
  // row's height only. Upstream's region ran `nguesses` rows down from it,
  // which once the answer row became a target swallowed it from the third
  // guess on: a tap on one of its colors selected the peg above it instead.
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
    //
    // **Where the selection is decides what a color key does**: on the working
    // row it enters a peg, on the answer row it rules the color out. So a tap
    // selects a slot of either row and sets notes mode to match, and the mode
    // is always visible as the row the frame is on.
    if (overGuess > -1) {
      ui.cursor.x = overGuess;
      ui.cursor.visible = true;
      ui.pencilMode = false;
      return UI_UPDATE;
    }
    // A tap on an answer slot selects the *slot*, never one color in it. Aiming
    // at a color's block was the first design, and on a phone a block is a
    // fifth of a peg across: the owner's taps kept landing on the wrong one.
    const slot = answerSlotAt(ds, x, y);
    if (slot >= 0) {
      ui.cursor.x = slot;
      ui.cursor.visible = true;
      ui.pencilMode = true;
      return UI_UPDATE;
    }
    if (overHint && ui.ready) return buildGuessMove(ui);
    return null;
  }
  if (button === RIGHT_BUTTON) {
    if (overGuess > -1) {
      ui.holds[overGuess] = !ui.holds[overGuess];
      return UI_UPDATE;
    }
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
    const maxcur = npegs + (ui.ready && !ui.pencilMode ? 1 : 0);
    return moveCursor(ui.cursor, button, maxcur, 1) ? UI_UPDATE : null;
  }
  if (button === SUBMIT_BUTTON) return ui.ready ? buildGuessMove(ui) : null;
  if (button === CURSOR_SELECT) {
    // On the submit position Enter submits; on a slot it toggles notes mode,
    // which is what Enter on the highlight does in every note-taking game.
    // Declined with the cursor hidden, so it claims no key it did not act on.
    if (!ui.cursor.visible) return null;
    if (ui.cursor.x < npegs) {
      ui.pencilMode = !ui.pencilMode;
      return UI_UPDATE;
    }
    return ui.ready ? buildGuessMove(ui) : null;
  }
  // A digit picks a color; `0` is the tenth, which only a ten-color game has.
  const digit = digitOf(button);
  const color = digit === 0 ? 10 : digit;
  if (color !== null && color <= ncolors) {
    if (!ui.pencilMode)
      return enterValue(ui, color, readyFor(params)) ? UI_UPDATE : null;
    const slot = selectedSlot(ui);
    return slot >= 0 ? toggleMark(from, slot, color) : null;
  }
  // `D` and `d` are the erase key's letter aliases, so they follow it into
  // whichever row the frame is on.
  const erase = isEraseKey(button) || button === 0x44 || button === 0x64;
  if (erase && ui.pencilMode) {
    // Clear, in notes mode, puts the cursor's answer slot back to every color.
    const slot = selectedSlot(ui);
    return slot >= 0 ? clearMarks(from, slot) : null;
  }
  if (erase) {
    // A held slot was carried over from the previous row rather than typed, so
    // Backspace walks past it rather than undoing a hold.
    return rubOut(ui, readyFor(params), (slot) => !ui.holds[slot]) ? UI_UPDATE : null;
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
  if (m.type === "mark") {
    // A save's mark names its value `color`, so the move keeps that field.
    const marks = m.marks.map(({ pos, color }) => ({ pos, value: color }));
    const ruledOut = withRuleOuts(s.ruledOut, marks, m.ruledOut, s.params.ncolors);
    return { ...cloneState(s), ruledOut };
  }
  if (m.type !== "guess") return assertNever(m, "guess: executeMove");
  if (outcome(s) !== 0) throw new Error("No guesses allowed once the game is over");

  const { npegs, ncolors, allowBlank } = s.params;
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
  // A win keeps the winning row at `nextGo`, which is how `outcome` reads it;
  // running out of rows loses, and reveals the answer.
  if (ncPlace === npegs) return { ...ret, holds };
  return { ...ret, holds, nextGo: s.nextGo + 1 };
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
  return ui.entries.map((peg, i) => `${peg}${ui.holds[i] ? "_" : ""}`).join(",");
}

function decodeUi(ui: GuessUi, encoded: string): void {
  const fields = encoded.split(",");
  const { npegs, ncolors } = ui.params;
  for (let i = 0; i < npegs; i++) {
    const field = fields[i] ?? "";
    const { value } = parseLeadingInt(field, 0);
    // A save is not a trusted input: a color this game does not have becomes an
    // empty slot, as upstream's decode_ui does.
    ui.entries[i] = value >= 1 && value <= ncolors ? value : 0;
    ui.holds[i] = field.endsWith("_");
  }
  ui.ready = isMarkable(ui.params, ui.entries);
  restCursor(ui);
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
  const over = outcome(s);
  if (over > 0) {
    const used = s.nextGo + 1;
    return `Solved in ${used} ${used === 1 ? "guess" : "guesses"}.`;
  }
  if (over < 0) return "Out of guesses: the answer is revealed.";
  const where = `Guess ${s.nextGo + 1} of ${nguesses}`;
  if (ui.ready) return `${where}: ready to submit.`;
  if (!s.params.allowMultiple && hasRepeat(ui.entries)) {
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
  GuessDrawState,
  GuessMistake,
  GuessHighlights,
  GuessRung
> = {
  id: "guess",

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  paramConfig: [
    numberItem<GuessParams>("colors", "Colors", "ncolors", {
      doc: "How many colors the answer is chosen from.",
      bounds: { min: 2, max: MAXCOLORS, maxShown: true },
      // A blank is one more thing a peg can be, so it is said with the colors.
      label: {
        slot: "tail",
        words: (p) => `${p.ncolors} colors${p.allowBlank ? " + blank" : ""}`,
      },
    }),
    numberItem<GuessParams>("pegs-per-guess", "Pegs per guess", "npegs", {
      doc: "How many pegs the hidden combination has, and so how many go in each guess.",
      bounds: { min: 2 },
      label: { slot: "size", words: (p) => `${p.npegs}x${p.nguesses}` },
    }),
    numberItem<GuessParams>("guesses", "Guesses", "nguesses", {
      doc: "How many rows you have to find the answer in.",
      bounds: { min: 1 },
    }),
    {
      kw: "allow-blanks",
      name: "Allow blanks",
      type: "boolean",
      doc: "When on, you may submit a guess with some pegs left empty, as long as it has at least one color in it. The answer itself never has a blank.",
      get: (p) => p.allowBlank,
      set: (p, v) => {
        p.allowBlank = v;
      },
    },
    modifierItem<GuessParams>({
      kw: "allow-duplicates",
      name: "Allow duplicates",
      type: "boolean",
      when: false,
      words: "no duplicates",
      slot: "tail",
      rule: "every peg of the answer is a different color, and so is every peg of a guess.",
      note: "There must then be at least as many colors as pegs.",
      get: (p) => p.allowMultiple,
      set: (p, v) => {
        p.allowMultiple = v;
      },
    }),
  ],

  newDesc,
  newState,
  newUi,
  changedState,
  uiCodec: { encode: encodeUi, decode: decodeUi },

  interpretMove,
  executeMove,
  finishesByDeduction: nothingToDeduce,
  status,
  findMistakes,
  // Every color of a wrong slot comes back, so the clearing does not say
  // which rule-out was the code's color, as the check does not.
  clearMistakes: (state, mistakes) =>
    mistakes.flatMap(({ pos }) => clearMarks(state, pos) ?? []),
  notApplicable: {
    transposeParams:
      "Your guesses run down the board in the order you made them, so there is no grid to turn.",
  },
  requestKeys,
  statusbarText,

  solve(_orig, curr) {
    // The answer, played as the next guess: upstream's "S" revealed it as a
    // loss instead.
    const holds = new Array<boolean>(curr.params.npegs).fill(false);
    return { ok: true, move: { type: "guess", pegs: curr.solution.slice(), holds } };
  },
  hint: {
    plan: (state, _aux, ui) => guessHint(state, ui),
    rungs: GUESS_RUNGS,
    marks: {
      roles: {
        ring: "the colors the step acts on, each with a frame beside it in the answer row: *the framed colors*, which the step rules out, or, when it suggests a guess, the color it picks for each slot.",
        outline:
          "an answer slot, in a second color: *the outlined slot*, one whose colors the step already knows and leans on.",
        stripes: "a scored row, its score included: *the striped row* the step reads.",
      },
    },
    keepTrack: guessHintKeepTrack,
    refreshStep: guessRefreshHintStep,
    // A tap selects a slot, and the row it is in decides whether a color key
    // enters a peg or rules the color out of the answer.
    gesture(state, ui, ds, m): readonly PointerAction[] {
      const keys = requestKeys(state.params);
      const colorKey = (color: number) => key(keys[color - 1].button);
      if (m.type === "mark") {
        return m.marks.flatMap((mark) => [
          click(answerSlotPoint(ds, mark.pos)),
          colorKey(mark.color),
        ]);
      }
      if (m.type !== "guess") return [];
      const typed = m.pegs.flatMap((color, pos) =>
        ui.entries[pos] === color
          ? []
          : [click(guessSlotPoint(ds, state.nextGo, pos)), colorKey(color)],
      );
      return [...typed, key(SUBMIT_BUTTON)];
    },
  },

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,
};

registerGame(guessGame);

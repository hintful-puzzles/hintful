/**
 * Wordguess's own tests: the score, the desc, what a guess may be, and the
 * routing of keys and taps onto the shared row mechanic.
 */
import { describe, expect, it } from "vitest";
import { UI_UPDATE } from "../../engine/game.ts";
import { CLEAR_BUTTON } from "../../engine/key-labels.ts";
import {
  CURSOR_RIGHT,
  CURSOR_SELECT,
  LEFT_BUTTON,
  LEFT_RELEASE,
} from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { isAnswer } from "../../engine/word-list/index.ts";
import { wordguessGame } from "./index.ts";
import { answerRect, centerOf, tileRect } from "./render.ts";
import {
  ABSENT,
  decodeParams,
  defaultParams,
  ELSEWHERE,
  encodeDesc,
  encodeParams,
  IN_PLACE,
  newDesc,
  newState,
  outcome,
  refusal,
  score,
  valuesOf,
  type WordguessMove,
  type WordguessParams,
  type WordguessState,
  wordOf,
} from "./state.ts";

const ZERO = { x: 0, y: 0 };
const SUBMIT = 13;

function board(answer: string, params: Partial<WordguessParams> = {}): WordguessState {
  const p = { ...defaultParams(), len: answer.length, ...params };
  return newState(p, encodeDesc(valuesOf(answer)));
}

function play(s: WordguessState, ...words: string[]): WordguessState {
  return words.reduce(
    (st, w) => wordguessGame.executeMove(st, { type: "guess", letters: valuesOf(w) }),
    s,
  );
}

const marksOf = (guess: string, answer: string): number[] =>
  score(valuesOf(guess), valuesOf(answer));

/** Press a key as the keyboard sends it; a move is executed. */
function press(
  s: WordguessState,
  ui: ReturnType<typeof wordguessGame.newUi>,
  button: number,
) {
  const ds = preferredDrawState(wordguessGame, s);
  const r = wordguessGame.interpretMove(s, ui, ds, ZERO, button);
  if (r === null || r === UI_UPDATE) return { state: s, result: r };
  const next = wordguessGame.executeMove(s, r as WordguessMove);
  wordguessGame.changedState?.(ui, s, next);
  return { state: next, result: r };
}

function typeWord(
  s: WordguessState,
  ui: ReturnType<typeof wordguessGame.newUi>,
  word: string,
) {
  for (const ch of word) press(s, ui, ch.charCodeAt(0));
}

describe("the score", () => {
  it("marks in place, elsewhere and absent", () => {
    expect(marksOf("crane", "cigar")).toEqual([
      IN_PLACE,
      ELSEWHERE,
      ELSEWHERE,
      ABSENT,
      ABSENT,
    ]);
  });
  it("scores a repeated letter as many times as the answer has spare copies, in place first", () => {
    // The answer has one L: the guess's first L takes it, and the other two
    // are scored as not there.
    expect(marksOf("lolly", "hotel")).toEqual([
      ELSEWHERE,
      IN_PLACE,
      ABSENT,
      ABSENT,
      ABSENT,
    ]);
    expect(marksOf("speed", "abide")).toEqual([
      ABSENT,
      ABSENT,
      ELSEWHERE,
      ABSENT,
      ELSEWHERE,
    ]);
    expect(marksOf("eerie", "speed")).toEqual([
      ELSEWHERE,
      ELSEWHERE,
      ABSENT,
      ABSENT,
      ABSENT,
    ]);
  });
});

describe("params and desc", () => {
  it("round-trips params", () => {
    for (const p of [defaultParams(), { len: 4, nguesses: 8, hard: true }]) {
      expect(decodeParams(encodeParams(p, true))).toEqual(p);
    }
    expect(encodeParams({ len: 5, nguesses: 6, hard: true }, true)).toBe("5g6h");
  });
  it("deals an answer, and hides it in the desc", () => {
    const { desc } = newDesc(defaultParams(), randomNew("deal"));
    const s = newState(defaultParams(), desc);
    expect(isAnswer(wordOf(s.answer))).toBe(true);
    expect(desc).not.toContain(wordOf(s.answer));
  });
  it("refuses a desc whose word no guess could be", () => {
    const p = defaultParams();
    expect(() => newState(p, encodeDesc(valuesOf("qzxqz")))).toThrow(
      /not in the word list/,
    );
  });
});

describe("what a guess may be", () => {
  it("is a word of the list", () => {
    const s = board("cigar");
    expect(refusal(s, valuesOf("crane"))).toBeNull();
    expect(refusal(s, valuesOf("crnae"))).toMatch(/CRNAE is not in the word list/);
  });
  it("in hard mode keeps what the scores showed", () => {
    const s = play(board("cigar", { hard: true }), "crane");
    expect(refusal(s, valuesOf("moist"))).toMatch(/keeps the C in place 1/);
    expect(refusal(s, valuesOf("coast"))).toMatch(/uses the R again/);
    expect(refusal(s, valuesOf("cards"))).toBeNull();
  });
  it("wins on the answer and loses, showing it, when the rows run out", () => {
    const s = board("cigar", { nguesses: 2 });
    expect(outcome(play(s, "crane", "cigar"))).toBe(1);
    const lost = play(s, "crane", "moist");
    expect(outcome(lost)).toBe(-1);
    expect(wordguessGame.statusbarText?.(lost, wordguessGame.newUi(lost))).toMatch(
      /CIGAR/,
    );
  });
});

describe("input", () => {
  it("types a word and submits it", () => {
    const s = board("cigar");
    const ui = wordguessGame.newUi(s);
    typeWord(s, ui, "Crane");
    expect(ui.ready).toBe(true);
    const { state, result } = press(s, ui, SUBMIT);
    expect(result).toEqual({ type: "guess", letters: valuesOf("crane") });
    expect(state.rows).toHaveLength(1);
    expect(ui.entries).toEqual([0, 0, 0, 0, 0]);
  });
  it("refuses a row that is no word where the player looks, and says why", () => {
    const s = board("cigar");
    const ui = wordguessGame.newUi(s);
    typeWord(s, ui, "crnae");
    expect(press(s, ui, SUBMIT).result).toBe(UI_UPDATE);
    expect(ui.refused).toBe(true);
    expect(press(s, ui, SUBMIT).result).toBeNull();
    expect(wordguessGame.statusbarText?.(s, ui)).toMatch(
      /CRNAE is not in the word list/,
    );
    press(s, ui, CLEAR_BUTTON);
    expect(ui.refused).toBe(false);
    // A row with a gap is declined, not refused.
    expect(press(s, ui, SUBMIT).result).toBeNull();
    expect(ui.refused).toBe(false);
  });
  it("consumes a letter the full row has no room for, so no shortcut fires", () => {
    const s = board("cigar");
    const ui = wordguessGame.newUi(s);
    typeWord(s, ui, "crane");
    const before = ui.entries.slice();
    expect(press(s, ui, "n".charCodeAt(0)).result).toBe(UI_UPDATE);
    expect(ui.entries).toEqual(before);
  });
  it("rubs out the last letter, and Enter on the submit position sends the row", () => {
    const s = board("cigar");
    const ui = wordguessGame.newUi(s);
    typeWord(s, ui, "cranx");
    press(s, ui, CLEAR_BUTTON);
    expect(wordOf(ui.entries.slice(0, 4))).toBe("cran");
    expect(ui.entries[4]).toBe(0);
    press(s, ui, "e".charCodeAt(0));
    expect(ui.cursor.x).toBe(5);
    expect(press(s, ui, CURSOR_SELECT).result).toEqual({
      type: "guess",
      letters: valuesOf("crane"),
    });
  });
  it("rules a letter out of a tapped answer slot, and back in", () => {
    const s = board("cigar");
    const ui = wordguessGame.newUi(s);
    const ds = preferredDrawState(wordguessGame, s);
    const at = centerOf(answerRect(s.params, ds.tileSize, 2));
    expect(wordguessGame.interpretMove(s, ui, ds, at, LEFT_BUTTON)).toBe(UI_UPDATE);
    expect(ui.pencilMode).toBe(true);
    // A second press on the same slot changes nothing, so it is declined, and
    // the release after a press does nothing.
    expect(wordguessGame.interpretMove(s, ui, ds, at, LEFT_BUTTON)).toBeNull();
    expect(wordguessGame.interpretMove(s, ui, ds, at, LEFT_RELEASE)).toBeNull();
    const { state } = press(s, ui, "q".charCodeAt(0));
    expect(state.ruledOut[2]).toBe(1 << 17);
    expect(press(state, ui, "q".charCodeAt(0)).state.ruledOut[2]).toBe(0);
    // A tap on the working row goes back to typing.
    const tile = centerOf(tileRect(ds.tileSize, 0, 0));
    wordguessGame.interpretMove(s, ui, ds, tile, LEFT_BUTTON);
    expect(ui.pencilMode).toBe(false);
  });
  it("keeps a half-written word across a mark and a save", () => {
    const s = board("cigar");
    const ui = wordguessGame.newUi(s);
    typeWord(s, ui, "cr");
    const marked = wordguessGame.executeMove(s, {
      type: "mark",
      marks: [{ pos: 0, letter: 1 }],
      ruledOut: true,
    });
    wordguessGame.changedState?.(ui, s, marked);
    expect(wordOf(ui.entries.slice(0, 2))).toBe("cr");
    const encoded = wordguessGame.encodeUi?.(ui) ?? "";
    expect(encoded).toBe("cr...");
    const back = wordguessGame.newUi(s);
    wordguessGame.decodeUi?.(back, encoded);
    expect(back.entries).toEqual(ui.entries);
    expect(back.cursor.x).toBe(2);
  });
  it("sends the word on Enter wherever the frame is, and never enters Marks mode", () => {
    const s = board("cigar");
    const ui = wordguessGame.newUi(s);
    typeWord(s, ui, "crnae");
    ui.cursor.x = 2;
    expect(press(s, ui, CURSOR_SELECT).result).toBe(UI_UPDATE);
    expect(ui.refused).toBe(true);
    expect(ui.pencilMode).toBe(false);
    for (let i = 0; i < 5; i++) press(s, ui, CLEAR_BUTTON);
    typeWord(s, ui, "crane");
    ui.cursor.x = 0;
    expect(press(s, ui, CURSOR_SELECT).result).toEqual({
      type: "guess",
      letters: valuesOf("crane"),
    });
    ui.pencilMode = true;
    expect(press(s, ui, CURSOR_SELECT).result).toBe(UI_UPDATE);
    expect(ui.pencilMode).toBe(false);
  });
  it("moves the cursor onto the submit position only when the row may go", () => {
    const s = board("cigar");
    const ui = wordguessGame.newUi(s);
    typeWord(s, ui, "crnae");
    ui.cursor.x = 4;
    expect(press(s, ui, CURSOR_RIGHT).result).toBeNull();
  });
});

describe("Check & save", () => {
  it("names a slot whose answer letter is ruled out, never the letter", () => {
    const s = wordguessGame.executeMove(board("cigar"), {
      type: "mark",
      marks: [
        { pos: 1, letter: 9 },
        { pos: 1, letter: 1 },
      ],
      ruledOut: true,
    });
    expect(wordguessGame.findMistakes?.(s)).toEqual([{ pos: 1 }]);
  });
});

describe("the keypad", () => {
  it("is the alphabet, Clear and Submit", () => {
    const keys = wordguessGame.requestKeys?.(defaultParams()) ?? [];
    expect(keys.map((k) => k.label).join(" ")).toBe(
      "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z Clear Submit",
    );
  });
});

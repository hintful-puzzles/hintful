/**
 * Wordguess's own tests: the score, the desc, what a guess may be, and the
 * routing of keys and taps onto the shared row mechanic.
 */
import { describe, expect, it } from "vitest";
import { UI_UPDATE } from "../../engine/contract/game.ts";
import { answerWords, isAnswer } from "../../engine/generate/word-list/index.ts";
import { CLEAR_BUTTON } from "../../engine/input/key-labels.ts";
import {
  CURSOR_RIGHT,
  CURSOR_SELECT,
  LEFT_BUTTON,
  LEFT_RELEASE,
} from "../../engine/input/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { wordguessGame } from "./index.ts";
import { centerOf, tileRect } from "./render.ts";
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
  it("declines a letter past a full row that is no word, but changes a tapped slot", () => {
    const s = board("cigar");
    const ui = wordguessGame.newUi(s);
    typeWord(s, ui, "cranx");
    expect(ui.cursor.visible).toBe(false);
    expect(press(s, ui, "e".charCodeAt(0)).result).toBe(UI_UPDATE);
    expect(wordOf(ui.entries)).toBe("cranx");
    const ds = preferredDrawState(wordguessGame, s);
    const last = centerOf(tileRect(ds.tileSize, 0, 4));
    wordguessGame.interpretMove(s, ui, ds, last, LEFT_BUTTON);
    press(s, ui, "k".charCodeAt(0));
    expect(wordOf(ui.entries)).toBe("crank");
    expect(ui.cursor.x).toBe(5);
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
  it("changes one letter where a tap on the working row puts the frame", () => {
    const s = board("cigar");
    const ui = wordguessGame.newUi(s);
    const ds = preferredDrawState(wordguessGame, s);
    typeWord(s, ui, "cranx");
    const at = centerOf(tileRect(ds.tileSize, 0, 4));
    expect(wordguessGame.interpretMove(s, ui, ds, at, LEFT_BUTTON)).toBe(UI_UPDATE);
    // A second press on the same slot changes nothing, so it is declined, and
    // the release after a press does nothing.
    expect(wordguessGame.interpretMove(s, ui, ds, at, LEFT_BUTTON)).toBeNull();
    expect(wordguessGame.interpretMove(s, ui, ds, at, LEFT_RELEASE)).toBeNull();
    press(s, ui, "k".charCodeAt(0));
    expect(wordOf(ui.entries)).toBe("crank");
  });
  it("keeps a half-written word across a save", () => {
    const s = board("cigar");
    const ui = wordguessGame.newUi(s);
    typeWord(s, ui, "cr");
    const encoded = wordguessGame.uiCodec?.encode(ui) ?? "";
    expect(encoded).toBe("cr...");
    const back = wordguessGame.newUi(s);
    wordguessGame.uiCodec?.decode(back, encoded, s);
    expect(back.entries).toEqual(ui.entries);
    expect(back.cursor.x).toBe(2);
  });
  it("sends a whole word brought back from a save", () => {
    const s = board("cigar");
    const ui = wordguessGame.newUi(s);
    typeWord(s, ui, "crane");
    const back = wordguessGame.newUi(s);
    wordguessGame.uiCodec?.decode(back, wordguessGame.uiCodec?.encode(ui) ?? "", s);
    expect(back.ready).toBe(true);
    expect(press(s, back, SUBMIT).result).toEqual({
      type: "guess",
      letters: valuesOf("crane"),
    });
  });
  it("sends the word on Enter wherever the frame is", () => {
    const s = board("cigar");
    const ui = wordguessGame.newUi(s);
    typeWord(s, ui, "crnae");
    ui.cursor.x = 2;
    expect(press(s, ui, CURSOR_SELECT).result).toBe(UI_UPDATE);
    expect(ui.refused).toBe(true);
    for (let i = 0; i < 5; i++) press(s, ui, CLEAR_BUTTON);
    typeWord(s, ui, "crane");
    ui.cursor.x = 0;
    expect(press(s, ui, CURSOR_SELECT).result).toEqual({
      type: "guess",
      letters: valuesOf("crane"),
    });
  });
  it("moves the cursor onto the submit position only when the row may go", () => {
    const s = board("cigar");
    const ui = wordguessGame.newUi(s);
    typeWord(s, ui, "crnae");
    ui.cursor.x = 4;
    ui.cursor.visible = true;
    expect(press(s, ui, CURSOR_RIGHT).result).toBeNull();
  });
});

describe("the dictionary", () => {
  const model = (s: WordguessState) => {
    const m = wordguessGame.reference?.model(s, wordguessGame.newUi(s));
    if (!m) throw new Error("wordguess has no dictionary");
    return m;
  };
  const items = (s: WordguessState) => model(s).sections.flatMap((x) => x.items);

  it("lists every answer word A to Z, striking those that no longer fit", () => {
    const s = play(board("cigar"), "crane");
    const m = model(s);
    expect(wordguessGame.reference?.title).toBe("Dictionary");
    expect(m.search).toBe(true);
    expect(m.filters).toEqual([{ label: "Fits", statuses: ["outstanding"] }]);
    expect(items(s).map((i) => i.key)).toEqual([...answerWords(5)].sort());
    expect(m.sections.map((x) => x.heading)).toEqual(
      m.sections.map((x) => x.items[0].key[0].toUpperCase()),
    );
    const fits = (w: string) =>
      score(valuesOf("crane"), valuesOf(w)).join() === s.rows[0].marks.join();
    for (const i of items(s))
      expect(i.status, i.key).toBe(fits(i.key) ? "outstanding" : "ruledOut");
    expect(items(s).find((i) => i.key === "cigar")?.status).toBe("outstanding");
    expect(items(s).find((i) => i.key === "crane")?.status).toBe("ruledOut");
  });

  it("writes a struck word into the row as readily as one that fits", () => {
    const s = play(board("cigar"), "crane");
    const ui = wordguessGame.newUi(s);
    expect(wordguessGame.reference?.select(s, ui, "moist")).toBe(UI_UPDATE);
    expect(wordOf(ui.entries)).toBe("moist");
    expect(ui.ready).toBe(true);
  });

  it("writes a tapped word into the working row, ready to go, and makes no move", () => {
    const s = play(board("cigar"), "crane");
    const ui = wordguessGame.newUi(s);
    expect(wordguessGame.reference?.select(s, ui, "cigar")).toBe(UI_UPDATE);
    expect(wordOf(ui.entries)).toBe("cigar");
    expect(ui.ready).toBe(true);
    // The word already in the row: nothing to change.
    expect(wordguessGame.reference?.select(s, ui, "cigar")).toBeNull();
    expect(press(s, ui, SUBMIT).result).toEqual({
      type: "guess",
      letters: valuesOf("cigar"),
    });
  });
});

describe("the keypad", () => {
  it("is a keyboard, Submit and Clear flanking its last row", () => {
    const keys = wordguessGame.requestKeys?.(defaultParams()) ?? [];
    const rows = [0, 1, 2].map((r) =>
      keys
        .filter((k) => k.row === r)
        .map((k) => k.label)
        .join(" "),
    );
    expect(rows).toEqual([
      "Q W E R T Y U I O P",
      "A S D F G H J K L",
      "Submit Z X C V B N M Clear",
    ]);
  });
  it("shows each letter scored at its best: in place, in the word, or not", () => {
    // LOLLY against HOTEL: one L elsewhere and two absent, so L is in the
    // word; O in place; Y absent.
    const s = play(board("hotel"), "lolly");
    const status = new Map(
      (wordguessGame.keyStatus?.(s) ?? []).map((k) => [
        String.fromCharCode(k.button),
        k.look,
      ]),
    );
    expect(Object.fromEntries(status)).toEqual({ L: "disc", O: "fill", Y: "faint" });
  });
});

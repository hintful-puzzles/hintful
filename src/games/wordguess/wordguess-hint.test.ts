/**
 * Wordguess's hint: one step, a guess. Its sentence quotes counts, so those
 * are recounted from scratch, by `state.ts`'s own score, and agree with the
 * dictionary's. And a player who does nothing but follow the hint must win
 * inside the rows on every preset, measured over every answer.
 */
import { describe, expect, it } from "vitest";
import { GAME_OVER } from "../../engine/hint-refusal.ts";
import { randomNew, randomUpto } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { opsOfKind } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { deepBudget, itSlow } from "../../engine/testing/slow.ts";
import { answerWords, guessWords } from "../../engine/word-list/index.ts";
import { dictionaryWords, wordguessHint, wordguessHintKeepTrack } from "./hint.ts";
import { wordguessGame } from "./index.ts";
import {
  defaultParams,
  encodeDesc,
  encodeParams,
  menu,
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

function withAnswer(p: WordguessParams, word: string): WordguessState {
  return newState(p, encodeDesc(valuesOf(word)));
}

function play(state: WordguessState, word: string): WordguessState {
  return wordguessGame.executeMove(state, { type: "guess", letters: valuesOf(word) });
}

/** Would every scored row have scored as it did, had `word` been hidden? */
const fits = (state: WordguessState, word: string): boolean =>
  state.rows.every((r) => score(r.letters, valuesOf(word)).join() === r.marks.join());

function plan(state: WordguessState) {
  const res = wordguessHint(state);
  if (!res.ok) throw new Error(res.error);
  return res.steps;
}

describe("a guess's sentence quotes counts that are true", () => {
  it("counts the common words that fit, and leaves no more than it says", () => {
    const p = defaultParams();
    const answers = answerWords(p.len);
    const rs = randomNew("probe-claims");
    let checked = 0;
    for (let game = 0; game < 30; game++) {
      let state = withAnswer(p, answers[randomUpto(rs, answers.length)]);
      const rows = 1 + randomUpto(rs, 2);
      for (let r = 0; r < rows && outcome(state) === 0; r++) {
        state = play(state, answers[randomUpto(rs, answers.length)]);
      }
      if (outcome(state) !== 0) continue;
      const step = plan(state).at(-1);
      const move = step?.move as Extract<WordguessMove, { type: "guess" }>;
      const word = wordOf(move.letters);
      expect(refusal(state, move.letters)).toBeNull();
      const allowed = answers.filter((a) => fits(state, a));
      // The dictionary lists exactly the words the sentence counts.
      expect(dictionaryWords(state)).toEqual({ words: allowed, common: true });
      const parts = new Map<string, number>();
      for (const a of allowed) {
        if (a === word) continue;
        const key = score(move.letters, valuesOf(a)).join("");
        parts.set(key, (parts.get(key) ?? 0) + 1);
      }
      const worst = Math.max(0, ...parts.values());
      const text = step?.explanation ?? "";
      expect(text).toContain(word.toUpperCase());
      if (allowed.length === 1) {
        expect(step?.rung).toBe("onlyAnswer");
        expect(word).toBe(allowed[0]);
      } else {
        expect(text).toMatch(new RegExp(`\\b${allowed.length} common words\\b`));
        expect(text).toMatch(new RegExp(`\\bat most ${worst}\\b`));
        expect(step?.rung).toBe(allowed.includes(word) ? "probe" : "split");
      }
      checked++;
    }
    expect(checked).toBeGreaterThan(20);
  });

  it("counts every word of the list once no common word fits", () => {
    // A game ID may hide a word that is no common one.
    const p = defaultParams();
    const answers = new Set(answerWords(p.len));
    const rare = guessWords(p.len).find((w) => !answers.has(w));
    if (rare === undefined) throw new Error("every guess is an answer");
    let state = withAnswer(p, rare);
    for (let turn = 0; turn < p.nguesses && outcome(state) === 0; turn++) {
      const step = plan(state).at(-1);
      state = wordguessGame.executeMove(state, step?.move as WordguessMove);
    }
    expect(outcome(state)).toBe(1);
  });
});

/** Plays every `stride`th answer of each preset by the hint, and holds each
 * game won within its rows. */
function followEvery(stride: number): void {
  for (const p of menu.boards) {
    const words = answerWords(p.len).filter((_, i) => i % stride === 0);
    for (const word of words) {
      let state = withAnswer(p, word);
      while (outcome(state) === 0) {
        for (const step of plan(state))
          state = wordguessGame.executeMove(state, step.move);
      }
      expect(outcome(state), `${encodeParams(p, true)} ${word}`).toBe(1);
    }
  }
}

describe("a player who follows the hint wins inside the rows", () => {
  // Every answer takes about two minutes, past a file's gate budget; a spread
  // sample holds each run, the deep tier a denser one, and the slow tier all.
  it("on a spread of answers of every preset", () => followEvery(deepBudget(60, 15)));
  itSlow("on every answer of every preset", () => followEvery(1));
});

describe("the plan", () => {
  const p = defaultParams();

  it("is one guess, and reads nothing but the rows", () => {
    // HOUSE and MOUSE score CRANE alike.
    const plans = ["mouse", "house"].map((w) => plan(play(withAnswer(p, w), "crane")));
    // A step's words hold functions, so the plans are compared by their data.
    const data = (steps: ReturnType<typeof plan>) =>
      steps.map(({ words: _, ...rest }) => rest);
    expect(data(plans[0])).toEqual(data(plans[1]));
    expect(plans[0]).toHaveLength(1);
    expect(plans[0][0].move.type).toBe("guess");
  });

  it("is completed by its guess, and dropped by another", () => {
    const state = play(withAnswer(p, "mouse"), "crane");
    const step = plan(state)[0];
    expect(wordguessHintKeepTrack(step.move, step)).toBe("completed");
    const other: WordguessMove = { type: "guess", letters: valuesOf("house") };
    expect(wordguessHintKeepTrack(other, step)).toBe("off");
  });

  it("refuses a lost game as over", () => {
    let lost = withAnswer(p, "mouse");
    for (let row = 0; row < p.nguesses; row++) lost = play(lost, "crane");
    expect(wordguessGame.status(lost)).toBe("lost");
    expect(wordguessHint(lost)).toEqual({ ok: false, error: GAME_OVER });
  });
});

/**
 * Each rung pinned on a position that speaks it. The hint's own guesses are
 * chosen to split the words, so the scan's second line plays a word of its
 * own on every other row.
 */
describeHintPins({
  game: wordguessGame,
  params: menu.boards,
  seeds: 8,
  maxSteps: 60,
  stray: (s, turn, hinted): WordguessMove | null => {
    if (s.rows.length % 2 === 0) return hinted;
    const words = answerWords(s.params.len);
    const word = words[(turn * 7919 + s.rows.length * 104_729) % words.length];
    const letters = valuesOf(word);
    return refusal(s, letters) === null ? { type: "guess", letters } : hinted;
  },
  pins: {
    onlyAnswer: {
      id: "4g6:0d2bbae4",
      moves: [{ type: "guess", letters: [1, 5, 15, 14] }],
    },
    opening: "4g6:c97b5898",
    probe: {
      id: "4g6:7149f871",
      moves: [{ type: "guess", letters: [1, 5, 15, 14] }],
    },
    split: {
      id: "4g6:721ba8ae",
      moves: [{ type: "guess", letters: [1, 5, 15, 14] }],
    },
  },
});

describe("the hint frame", () => {
  const p = defaultParams();
  const id = `${encodeParams(p, true)}:${encodeDesc(valuesOf("mouse"))}`;

  it("rings the squares a suggested guess goes in, and draws nothing else", () => {
    const res = renderScenario({ game: wordguessGame, id, moves: [], showHint: true });
    expect(res.hint?.rung).toBe("opening");
    const ops = res.recording.ops;
    expectRing(ops, { rings: p.len });
    expect(opsOfKind(ops, "line")).toHaveLength(0);
    expect(opsOfKind(ops, "hatch")).toHaveLength(0);
  });
});

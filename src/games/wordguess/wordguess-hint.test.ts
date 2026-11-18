/**
 * Wordguess's hint.
 *
 * Its two halves are held to different standards, as Guess's are. Every
 * **mark** it places is a firing of a technique the description states, each
 * checked sound by the soundness checker, so here each is pinned on a
 * position. Every **guess** sentence quotes counts, so those are recounted
 * from scratch, by `state.ts`'s own score. And a player who does nothing but
 * follow the hint must win inside the rows on every preset, measured over
 * every answer.
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
import {
  type WordguessHighlights,
  wordguessHint,
  wordguessHintKeepTrack,
  wordguessRefreshHintStep,
} from "./hint.ts";
import { wordguessGame } from "./index.ts";
import {
  decodeParams,
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

  it("teaches a mark only once, and not one the player already made", () => {
    // CRANE against MOUSE: only the E scores, in place.
    let state = withAnswer(p, "mouse");
    state = play(state, "crane");
    const first = plan(state)[0];
    expect(first.rung).toBe("inPlace");
    const marks = (first.move as Extract<WordguessMove, { type: "mark" }>).marks;
    expect(marks).toHaveLength(25);
    expect(marks.every((m) => m.pos === 4)).toBe(true);
    expect(first.explanation).toMatch(/scored E in place/);

    const marked = wordguessGame.executeMove(state, {
      type: "mark",
      marks: [{ pos: 4, letter: 1 }],
      ruledOut: true,
    });
    const again = plan(marked)[0].move as Extract<WordguessMove, { type: "mark" }>;
    expect(again.marks).not.toContainEqual({ pos: 4, letter: 1 });
    expect(again.marks).toHaveLength(24);
  });

  it("ends every plan with a guess, and reads nothing but the rows", () => {
    // HOUSE and MOUSE score CRANE alike.
    const plans = ["mouse", "house"].map((w) => plan(play(withAnswer(p, w), "crane")));
    // A step's words hold functions, so the plans are compared by their data.
    const data = (steps: ReturnType<typeof plan>) =>
      steps.map(({ words: _, ...rest }) => rest);
    expect(data(plans[0])).toEqual(data(plans[1]));
    expect(plans[0].at(-1)?.move.type).toBe("guess");
  });

  it("follows a player's marks by hand, and drops what they already did", () => {
    const state = play(withAnswer(p, "mouse"), "crane");
    const step = plan(state)[0];
    const one: WordguessMove = {
      type: "mark",
      marks: [{ pos: 4, letter: 1 }],
      ruledOut: true,
    };
    expect(wordguessHintKeepTrack(one, step, state)).toBe("onTrack");
    const after = wordguessGame.executeMove(state, one);
    const refreshed = wordguessRefreshHintStep(step, after);
    const left = refreshed?.move as Extract<WordguessMove, { type: "mark" }>;
    expect(left.marks).toHaveLength(24);
    expect((refreshed?.highlights as WordguessHighlights).marked).toHaveLength(24);
    expect(wordguessRefreshHintStep(step, state)).toBe(step);
    expect(wordguessHintKeepTrack(left, step, after)).toBe("completed");
    expect(
      wordguessRefreshHintStep(step, wordguessGame.executeMove(after, left)),
    ).toBeNull();
    const elsewhere: WordguessMove = {
      type: "mark",
      marks: [{ pos: 0, letter: 1 }],
      ruledOut: true,
    };
    expect(wordguessHintKeepTrack(elsewhere, step, state)).toBe("off");
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
 * chosen to split the words, and the rungs about a repeated letter fire only
 * on a row a player would more likely enter, so the scan's second line plays
 * a word of its own on every other row.
 */
describeHintPins({
  game: wordguessGame,
  params: menu.boards,
  seeds: 8,
  maxSteps: 60,
  stray: (s, turn, hinted): WordguessMove | null => {
    if (hinted?.type === "mark" || s.rows.length % 2 === 0) return hinted;
    const words = answerWords(s.params.len);
    const word = words[(turn * 7919 + s.rows.length * 104_729) % words.length];
    const letters = valuesOf(word);
    return refusal(s, letters) === null ? { type: "guess", letters } : hinted;
  },
  pins: {
    /** Held on 101 of 674 positions walked. */
    inPlace: {
      id: "4g6:c97b5898",
      moves: [{ type: "guess", letters: [1, 5, 15, 14] }],
    },
    /** Held on 286 of 674 positions walked. */
    absent: { id: "4g6:721ba8ae", moves: [{ type: "guess", letters: [1, 5, 15, 14] }] },
    /** Held on 248 of 674 positions walked. */
    notHere: {
      id: "4g6:721ba8ae",
      moves:
        '[{"type":"guess","letters":[1,5,15,14]},{"type":"mark","marks":[{"pos":0,"letter":5},{"pos":1,"letter":5},{"pos":2,"letter":5},{"pos":3,"letter":5},{"pos":0,"letter":14},{"pos":1,"letter":14},{"pos":2,"letter":14},{"pos":3,"letter":14}],"ruledOut":true}]',
    },
    /** Held on 46 of 674 positions walked. */
    onlyPlace: {
      id: "4g6:0d2bbae4",
      moves:
        '[{"type":"guess","letters":[1,5,15,14]},{"type":"mark","marks":[{"pos":2,"letter":1},{"pos":2,"letter":2},{"pos":2,"letter":3},{"pos":2,"letter":4},{"pos":2,"letter":5},{"pos":2,"letter":6},{"pos":2,"letter":7},{"pos":2,"letter":8},{"pos":2,"letter":9},{"pos":2,"letter":10},{"pos":2,"letter":11},{"pos":2,"letter":12},{"pos":2,"letter":13},{"pos":2,"letter":14},{"pos":2,"letter":16},{"pos":2,"letter":17},{"pos":2,"letter":18},{"pos":2,"letter":19},{"pos":2,"letter":20},{"pos":2,"letter":21},{"pos":2,"letter":22},{"pos":2,"letter":23},{"pos":2,"letter":24},{"pos":2,"letter":25},{"pos":2,"letter":26}],"ruledOut":true},{"type":"mark","marks":[{"pos":0,"letter":5},{"pos":1,"letter":5},{"pos":3,"letter":5},{"pos":0,"letter":14},{"pos":1,"letter":14},{"pos":3,"letter":14}],"ruledOut":true},{"type":"mark","marks":[{"pos":0,"letter":1}],"ruledOut":true},{"type":"guess","letters":[8,1,22,5]},{"type":"mark","marks":[{"pos":0,"letter":22},{"pos":1,"letter":22},{"pos":3,"letter":22}],"ruledOut":true},{"type":"mark","marks":[{"pos":0,"letter":8},{"pos":1,"letter":1}],"ruledOut":true}]',
    },
    /** Held on 49 of 674 positions walked. */
    copiesPlaced: {
      id: "4g6:b19d44b2",
      moves:
        '[{"type":"guess","letters":[1,5,15,14]},{"type":"mark","marks":[{"pos":1,"letter":1},{"pos":1,"letter":2},{"pos":1,"letter":3},{"pos":1,"letter":4},{"pos":1,"letter":6},{"pos":1,"letter":7},{"pos":1,"letter":8},{"pos":1,"letter":9},{"pos":1,"letter":10},{"pos":1,"letter":11},{"pos":1,"letter":12},{"pos":1,"letter":13},{"pos":1,"letter":14},{"pos":1,"letter":15},{"pos":1,"letter":16},{"pos":1,"letter":17},{"pos":1,"letter":18},{"pos":1,"letter":19},{"pos":1,"letter":20},{"pos":1,"letter":21},{"pos":1,"letter":22},{"pos":1,"letter":23},{"pos":1,"letter":24},{"pos":1,"letter":25},{"pos":1,"letter":26}],"ruledOut":true},{"type":"mark","marks":[{"pos":0,"letter":1},{"pos":2,"letter":1},{"pos":3,"letter":1},{"pos":0,"letter":14},{"pos":2,"letter":14},{"pos":3,"letter":14},{"pos":0,"letter":15},{"pos":2,"letter":15},{"pos":3,"letter":15}],"ruledOut":true},{"type":"guess","letters":[18,5,5,4]},{"type":"mark","marks":[{"pos":0,"letter":4},{"pos":2,"letter":4},{"pos":3,"letter":4},{"pos":0,"letter":18},{"pos":2,"letter":18},{"pos":3,"letter":18}],"ruledOut":true},{"type":"mark","marks":[{"pos":2,"letter":5}],"ruledOut":true}]',
    },
    /** Held on 6 of 674 positions walked. */
    lettersFill: {
      id: "4g6:43e3cc94",
      moves:
        '[{"type":"guess","letters":[1,5,15,14]},{"type":"mark","marks":[{"pos":0,"letter":1},{"pos":1,"letter":1},{"pos":2,"letter":1},{"pos":3,"letter":1}],"ruledOut":true},{"type":"mark","marks":[{"pos":1,"letter":5},{"pos":2,"letter":15},{"pos":3,"letter":14}],"ruledOut":true},{"type":"guess","letters":[18,5,5,4]},{"type":"mark","marks":[{"pos":0,"letter":18},{"pos":1,"letter":18},{"pos":2,"letter":18},{"pos":3,"letter":18}],"ruledOut":true},{"type":"mark","marks":[{"pos":2,"letter":5},{"pos":3,"letter":4}],"ruledOut":true}]',
    },
    /** Held on 233 of 674 positions walked. */
    onlyAnswer: {
      id: "4g6:0d2bbae4",
      moves:
        '[{"type":"guess","letters":[1,5,15,14]},{"type":"mark","marks":[{"pos":2,"letter":1},{"pos":2,"letter":2},{"pos":2,"letter":3},{"pos":2,"letter":4},{"pos":2,"letter":5},{"pos":2,"letter":6},{"pos":2,"letter":7},{"pos":2,"letter":8},{"pos":2,"letter":9},{"pos":2,"letter":10},{"pos":2,"letter":11},{"pos":2,"letter":12},{"pos":2,"letter":13},{"pos":2,"letter":14},{"pos":2,"letter":16},{"pos":2,"letter":17},{"pos":2,"letter":18},{"pos":2,"letter":19},{"pos":2,"letter":20},{"pos":2,"letter":21},{"pos":2,"letter":22},{"pos":2,"letter":23},{"pos":2,"letter":24},{"pos":2,"letter":25},{"pos":2,"letter":26}],"ruledOut":true},{"type":"mark","marks":[{"pos":0,"letter":5},{"pos":1,"letter":5},{"pos":3,"letter":5},{"pos":0,"letter":14},{"pos":1,"letter":14},{"pos":3,"letter":14}],"ruledOut":true},{"type":"mark","marks":[{"pos":0,"letter":1}],"ruledOut":true}]',
    },
    /** Held on 64 of 674 positions walked. */
    opening: "4g6:c97b5898",
    /** Held on 247 of 674 positions walked. */
    probe: {
      id: "4g6:7149f871",
      moves:
        '[{"type":"guess","letters":[1,5,15,14]},{"type":"mark","marks":[{"pos":0,"letter":1},{"pos":1,"letter":1},{"pos":2,"letter":1},{"pos":3,"letter":1},{"pos":0,"letter":5},{"pos":1,"letter":5},{"pos":2,"letter":5},{"pos":3,"letter":5},{"pos":0,"letter":14},{"pos":1,"letter":14},{"pos":2,"letter":14},{"pos":3,"letter":14},{"pos":0,"letter":15},{"pos":1,"letter":15},{"pos":2,"letter":15},{"pos":3,"letter":15}],"ruledOut":true}]',
    },
    /** Held on 130 of 674 positions walked. */
    split: {
      id: "4g6:721ba8ae",
      moves:
        '[{"type":"guess","letters":[1,5,15,14]},{"type":"mark","marks":[{"pos":0,"letter":5},{"pos":1,"letter":5},{"pos":2,"letter":5},{"pos":3,"letter":5},{"pos":0,"letter":14},{"pos":1,"letter":14},{"pos":2,"letter":14},{"pos":3,"letter":14}],"ruledOut":true},{"type":"mark","marks":[{"pos":0,"letter":1},{"pos":2,"letter":15}],"ruledOut":true}]',
    },
  },
});

describe("the hint frame", () => {
  const p = defaultParams();
  const id = `${encodeParams(p, true)}:${encodeDesc(valuesOf("mouse"))}`;

  it("stripes the row it reads and strikes the letters it rules out", () => {
    const res = renderScenario({
      game: wordguessGame,
      id,
      moves: [{ type: "guess", letters: valuesOf("crane") }],
      showHint: true,
    });
    const step = res.hint;
    expect(step?.rung).toBe("inPlace");
    const hl = step?.highlights as WordguessHighlights;
    expect(hl.line).toEqual([0]);
    const ops = res.recording.ops;
    // A strike is two strokes, an X, and the board draws no other line.
    expect(opsOfKind(ops, "line")).toHaveLength(2 * hl.marked.length);
    expectRing(ops, { rings: 0 });
    // The striped row is hatched a tile at a time, and nothing else is.
    expect(opsOfKind(ops, "hatch")).toHaveLength(p.len);
  });

  it("rings the squares a suggested guess goes in", () => {
    const res = renderScenario({ game: wordguessGame, id, moves: [], showHint: true });
    expect(res.hint?.rung).toBe("opening");
    const ops = res.recording.ops;
    expectRing(ops, { rings: p.len });
    expect(opsOfKind(ops, "line")).toHaveLength(0);
  });
});

it("decodes the presets it pins", () => {
  for (const p of menu.boards) expect(decodeParams(encodeParams(p, true))).toEqual(p);
});

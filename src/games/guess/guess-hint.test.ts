/**
 * Guess's answer-row notation and its hint.
 *
 * The hint's two halves are held to different standards, so they are tested
 * differently. Every **mark** it places is a claim that no answer the rows
 * allow has that color in that slot, so the rules are brute-forced against the
 * whole answer space. Every **probe** sentence quotes two counts, so those are
 * recounted from scratch. And a player who does nothing but follow the hint
 * must win inside the row limit on the presets, which is measured over every
 * Standard answer rather than a handful.
 */
import { describe, expect, it } from "vitest";
import { UI_UPDATE } from "../../engine/game.ts";
import { CLEAR_BUTTON } from "../../engine/key-labels.ts";
import {
  CURSOR_SELECT,
  LEFT_RELEASE,
  PENCIL_MODE_BUTTON,
  RIGHT_BUTTON,
} from "../../engine/pointer.ts";
import { type RandomState, randomNew, randomUpto } from "../../engine/random/index.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import {
  type GuessHighlights,
  guessHint,
  guessHintKeepTrack,
  guessRefreshHintStep,
  provenRuleOuts,
} from "./hint.ts";
import type { Reason } from "./hint-text.ts";
import { guessGame } from "./index.ts";
import { answerSlotAt, COL_HINT, COL_HINT_CELL } from "./render.ts";
import {
  decodeParams,
  defaultParams,
  type GuessMove,
  type GuessParams,
  type GuessState,
  markPegs,
  newDesc,
  newState,
} from "./state.ts";

const ZERO = { x: 0, y: 0 };

function allAnswers(p: GuessParams): number[][] {
  const out: number[][] = [];
  const cur: number[] = [];
  const visit = (): void => {
    if (cur.length === p.npegs) {
      out.push(cur.slice());
      return;
    }
    for (let c = 1; c <= p.ncolors; c++) {
      if (!p.allowMultiple && cur.includes(c)) continue;
      cur.push(c);
      visit();
      cur.pop();
    }
  };
  visit();
  return out;
}

/** Would every scored row have scored as it did, had `answer` been hidden? */
function fits(state: GuessState, answer: readonly number[]): boolean {
  for (let i = 0; i < state.nextGo; i++) {
    const row = state.guesses[i];
    const { feedback } = markPegs(row.pegs, answer, state.params.ncolors);
    if (feedback.some((f, j) => f !== row.feedback[j])) return false;
  }
  return true;
}

function withAnswer(p: GuessParams, answer: number[]): GuessState {
  return { ...newState(p, newDesc(p, randomNew("unused")).desc), solution: answer };
}

function play(state: GuessState, pegs: number[]): GuessState {
  return guessGame.executeMove(state, {
    type: "guess",
    pegs,
    holds: pegs.map(() => false),
  });
}

/** A guess drawn to exercise the rules: sometimes one color throughout, since
 * that is the only row that tells the player a color's exact count. */
function randomGuess(p: GuessParams, rs: RandomState): number[] {
  if (p.allowMultiple && randomUpto(rs, 4) === 0) {
    const c = randomUpto(rs, p.ncolors) + 1;
    return new Array(p.npegs).fill(c);
  }
  const pool = Array.from({ length: p.ncolors }, (_, i) => i + 1);
  return Array.from({ length: p.npegs }, () => {
    const c = pool[randomUpto(rs, pool.length)];
    if (!p.allowMultiple) pool.splice(pool.indexOf(c), 1);
    return c;
  });
}

/** Every deduction kind, so the census fails to compile when one is added. */
const DEDUCTIONS: Record<
  Exclude<Reason["kind"], "onlyAnswer" | "opening" | "probe" | "probeFits">,
  true
> = {
  scoredNothing: true,
  noBlack: true,
  everyPegScored: true,
  noRepeats: true,
  blacksForced: true,
  blacksAccounted: true,
  totalAccounted: true,
};

describe("every mark the rules prove holds for every answer the rows allow", () => {
  const CONFIGS = [
    "c4p3g8Bm",
    "c4p4g8Bm",
    "c3p4g8Bm",
    "c5p3g8BM",
    "c5p4g8BM",
    "c6p4g10Bm",
  ];
  const fired = new Map<string, number>();
  let marksChecked = 0;

  for (const code of CONFIGS) {
    it(code, () => {
      const p = decodeParams(code);
      const space = allAnswers(p);
      const rs = randomNew(`sound-${code}`);
      for (let game = 0; game < 300; game++) {
        const answer = space[randomUpto(rs, space.length)];
        let state = withAnswer(p, answer);
        const rows = 1 + randomUpto(rs, 4);
        for (let r = 0; r < rows && state.solved === 0; r++) {
          state = play(state, randomGuess(p, rs));
        }
        if (state.solved !== 0) continue;
        const { out, fired: reasons } = provenRuleOuts(state);
        for (const r of reasons) fired.set(r.kind, (fired.get(r.kind) ?? 0) + 1);
        const allowed = space.filter((a) => fits(state, a));
        expect(allowed.some((a) => a.join() === answer.join())).toBe(true);
        for (let pos = 0; pos < p.npegs; pos++) {
          for (let c = 1; c <= p.ncolors; c++) {
            if (!(out[pos] & (1 << c))) continue;
            marksChecked++;
            const counter = allowed.find((a) => a[pos] === c);
            expect(
              counter,
              `${code}: ${c} ruled out of slot ${pos}, but ${counter?.join("")} fits`,
            ).toBeUndefined();
          }
        }
      }
    });
  }

  it("checked marks from every rule, so none of them is dead", () => {
    // Runs after the configs above, over what they recorded. A rule that no
    // game reached would have been "proved sound" over nothing.
    expect(marksChecked).toBeGreaterThan(5000);
    for (const kind of Object.keys(DEDUCTIONS)) {
      expect(fired.get(kind) ?? 0, `${kind} never fired`).toBeGreaterThan(0);
    }
  });
});

describe("the probe's sentence quotes counts that are true", () => {
  it("fits every row, and leaves no more than it says", () => {
    const p = defaultParams();
    const space = allAnswers(p);
    const rs = randomNew("probe-claims");
    let checked = 0;
    for (let game = 0; game < 40; game++) {
      let state = withAnswer(p, space[randomUpto(rs, space.length)]);
      const rows = randomUpto(rs, 3);
      for (let r = 0; r < rows && state.solved === 0; r++) {
        state = play(state, randomGuess(p, rs));
      }
      if (state.solved !== 0) continue;
      const res = guessHint(state);
      if (!res.ok) throw new Error(res.error);
      const probe = res.steps.at(-1)?.move as Extract<GuessMove, { type: "guess" }>;
      const allowed = space.filter((a) => fits(state, a));
      expect(fits(state, probe.pegs)).toBe(true);

      const parts = new Map<string, number>();
      for (const a of allowed) {
        const { feedback } = markPegs(probe.pegs, a, p.ncolors);
        if (feedback.every((f) => f === 1)) continue;
        const key = feedback.join("");
        parts.set(key, (parts.get(key) ?? 0) + 1);
      }
      const worst = Math.max(0, ...parts.values());
      const text = res.steps.at(-1)?.explanation ?? "";
      if (allowed.length === 1) expect(text).toMatch(/^Only one answer fits/);
      else {
        expect(text).toMatch(new RegExp(`\\b${allowed.length} answers\\b`));
        expect(text).toMatch(new RegExp(`\\bat most ${worst}\\b`));
      }
      checked++;
    }
    expect(checked).toBeGreaterThan(30);
  });
});

/** Follow the hint from a fresh board to the end, recomputing after every
 * step, as a player who asks after each move does. Returns the rows used, or
 * `Infinity` on a loss. */
function rowsByHints(p: GuessParams, answer: number[]): number {
  let state = withAnswer(p, answer);
  for (let steps = 0; steps < 200; steps++) {
    if (state.solved > 0) return state.nextGo + 1;
    if (state.solved < 0) return Number.POSITIVE_INFINITY;
    const res = guessHint(state);
    if (!res.ok) throw new Error(res.error);
    state = guessGame.executeMove(state, res.steps[0].move);
  }
  throw new Error("the hint did not converge");
}

describe("a player who follows the hint wins inside the row limit", () => {
  it("on every Standard answer", () => {
    // Measured when written (2026-09-21): at most 6 rows of the 10.
    const p = defaultParams();
    const worst = Math.max(...allAnswers(p).map((a) => rowsByHints(p, a)));
    expect(worst).toBeLessThanOrEqual(p.nguesses);
    expect(worst).toBeGreaterThan(3);
  });

  it("on Super and without repeats, over a sample", () => {
    for (const code of ["c8p5g12Bm", "c6p4g10BM"]) {
      const p = decodeParams(code);
      const space = allAnswers(p);
      const rs = randomNew(`walk-${code}`);
      for (let i = 0; i < 40; i++) {
        const answer = space[randomUpto(rs, space.length)];
        expect(
          rowsByHints(p, answer),
          `${code} ${answer.join("")}`,
        ).toBeLessThanOrEqual(p.nguesses);
      }
    }
  });
});

describe("the plan", () => {
  const p = decodeParams("c6p4g10BM");

  it("teaches a mark only once, and not one the player already made", () => {
    let state = withAnswer(p, [3, 4, 6, 1]);
    state = play(state, [1, 2, 3, 4]); // two whites, no blacks
    const res = guessHint(state);
    if (!res.ok) throw new Error(res.error);
    expect(res.steps[0].move).toEqual({
      type: "mark",
      marks: [
        { pos: 0, color: 1 },
        { pos: 1, color: 2 },
        { pos: 2, color: 3 },
        { pos: 3, color: 4 },
      ],
      ruledOut: true,
    });
    expect(res.steps[0].explanation).toMatch(/no black pegs/);

    const marked = guessGame.executeMove(state, {
      type: "mark",
      marks: [{ pos: 1, color: 2 }],
      ruledOut: true,
    });
    const again = guessHint(marked);
    if (!again.ok) throw new Error(again.error);
    const move = again.steps[0].move as Extract<GuessMove, { type: "mark" }>;
    expect(move.marks).not.toContainEqual({ pos: 1, color: 2 });
    expect(move.marks).toHaveLength(3);
  });

  it("ends every plan with a guess, and reads nothing but the rows", () => {
    // The same rows over two different hidden answers give the same plan.
    const rows = [
      [1, 2, 3, 4],
      [2, 1, 5, 6],
    ];
    const first = rows.reduce(play, withAnswer(p, [3, 4, 6, 1]));
    const other = allAnswers(p).find((x) => x.join() !== "3,4,6,1" && fits(first, x));
    if (!other) throw new Error("no second answer fits those rows");
    const plans = [first, rows.reduce(play, withAnswer(p, other))];
    const [a, b] = plans.map((s) => guessHint(s));
    expect(a).toEqual(b);
    if (!a.ok) throw new Error(a.error);
    expect(a.steps.at(-1)?.move.type).toBe("guess");
  });

  it("follows a player's marks by hand, and drops what they already did", () => {
    let state = withAnswer(p, [3, 4, 6, 1]);
    state = play(state, [1, 2, 3, 4]);
    const res = guessHint(state);
    if (!res.ok) throw new Error(res.error);
    const step = res.steps[0];
    const one: GuessMove = {
      type: "mark",
      marks: [{ pos: 0, color: 1 }],
      ruledOut: true,
    };
    expect(guessHintKeepTrack(one, step, state)).toBe("onTrack");
    const after = guessGame.executeMove(state, one);
    const refreshed = guessRefreshHintStep(step, after);
    const left = refreshed?.move as Extract<GuessMove, { type: "mark" }>;
    expect(left.marks).toHaveLength(3);
    expect((refreshed?.highlights as GuessHighlights).marked).toHaveLength(3);
    expect(guessRefreshHintStep(step, state)).toBe(step);
    const rest: GuessMove = { ...left };
    expect(guessHintKeepTrack(rest, step, after)).toBe("completed");
    expect(guessRefreshHintStep(step, guessGame.executeMove(after, rest))).toBeNull();
    const elsewhere: GuessMove = {
      type: "mark",
      marks: [{ pos: 0, color: 6 }],
      ruledOut: true,
    };
    expect(guessHintKeepTrack(elsewhere, step, state)).toBe("off");
  });

  it("refuses once the game is over", () => {
    const state = withAnswer(p, [3, 4, 6, 1]);
    expect(guessHint(play(state, [3, 4, 6, 1])).ok).toBe(false);
  });
});

describe("the answer row takes marks and colors", () => {
  function fresh() {
    const p = defaultParams();
    const state = withAnswer(p, [1, 2, 3, 4]);
    const ui = guessGame.newUi(state);
    guessGame.changedState?.(ui, null, state);
    const ds = preferredDrawState(guessGame, state);
    return { state, ui, ds };
  }

  /** Every point the hit test puts in answer slot `pos`, found by asking it
   * rather than by restating the layout. */
  function slotPoints(ds: ReturnType<typeof fresh>["ds"], pos: number) {
    const points: { x: number; y: number }[] = [];
    for (let y = 0; y < ds.h; y++) {
      for (let x = 0; x < ds.w; x++) {
        if (answerSlotAt(ds, x, y) === pos) points.push({ x, y });
      }
    }
    if (points.length === 0) throw new Error(`no point in slot ${pos}`);
    return points;
  }

  it("a tap anywhere on an answer slot selects it for marking, and marks nothing", () => {
    // The slot is the target, never one color's block: on a phone a block is a
    // fifth of a peg across, and taps aimed at one landed on its neighbor.
    const { state, ui, ds } = fresh();
    const points = slotPoints(ds, 2);
    // At least the whole slot, not only its blocks.
    expect(points.length).toBeGreaterThanOrEqual(ds.tileSize * ds.answerh);
    for (const at of [points[0], points[points.length - 1]]) {
      ui.pencilMode = false;
      expect(guessGame.interpretMove(state, ui, ds, at, LEFT_RELEASE)).toBe(UI_UPDATE);
      expect(ui.pencilMode).toBe(true);
      expect(ui.cursor).toMatchObject({ x: 2, visible: true });
    }
    expect(ui.currPegs).toEqual([0, 0, 0, 0]);
    // The color key then rules its color out of that slot.
    const key = guessGame.requestKeys?.(state.params)?.[4].button ?? -1;
    expect(guessGame.interpretMove(state, ui, ds, ZERO, key)).toEqual({
      type: "mark",
      marks: [{ pos: 2, color: 5 }],
      ruledOut: true,
    });
  });

  it("a tap on the working row goes back to entering pegs", () => {
    const { state, ui, ds } = fresh();
    guessGame.interpretMove(state, ui, ds, slotPoints(ds, 1)[0], LEFT_RELEASE);
    expect(ui.pencilMode).toBe(true);
    const peg = { x: ds.guessx + 3 * (ds.tileSize + ds.gapsz) + 2, y: ds.guessy + 2 };
    expect(guessGame.interpretMove(state, ui, ds, peg, LEFT_RELEASE)).toBe(UI_UPDATE);
    expect(ui.pencilMode).toBe(false);
    expect(ui.cursor.x).toBe(3);
  });

  it("still selects the answer slot once the rows above have been played", () => {
    // The current row's hit region used to run `nguesses` rows down from it,
    // so from the third guess on it covered the answer row and a tap there
    // selected the peg above instead. Found in the browser, not by a test.
    const { ui, ds } = fresh();
    let state = fresh().state;
    for (const row of [
      [5, 5, 6, 6],
      [6, 5, 6, 5],
      [5, 6, 5, 6],
    ]) {
      const next = play(state, row);
      guessGame.changedState?.(ui, state, next);
      state = next;
    }
    guessGame.interpretMove(state, ui, ds, slotPoints(ds, 1)[0], LEFT_RELEASE);
    expect(ui.pencilMode).toBe(true);
    expect(ui.cursor.x).toBe(1);
  });

  it("a right-click or held finger on an answer slot marks nothing", () => {
    const { state, ui, ds } = fresh();
    const at = slotPoints(ds, 1)[0];
    expect(guessGame.interpretMove(state, ui, ds, at, RIGHT_BUTTON)).toBeNull();
  });

  it("in notes mode a color key marks, and Clear empties the slot", () => {
    const { state, ui, ds } = fresh();
    expect(guessGame.interpretMove(state, ui, ds, ZERO, PENCIL_MODE_BUTTON)).toBe(
      UI_UPDATE,
    );
    ui.cursor.x = 2;
    ui.cursor.visible = true;
    const key = guessGame.requestKeys?.(state.params)?.[3].button ?? -1;
    const move = guessGame.interpretMove(state, ui, ds, ZERO, key);
    expect(move).toEqual({
      type: "mark",
      marks: [{ pos: 2, color: 4 }],
      ruledOut: true,
    });
    const marked = guessGame.executeMove(state, move as GuessMove);
    // Again, and the mark comes back out.
    expect(guessGame.interpretMove(marked, ui, ds, ZERO, key)).toEqual({
      type: "mark",
      marks: [{ pos: 2, color: 4 }],
      ruledOut: false,
    });
    expect(guessGame.interpretMove(marked, ui, ds, ZERO, CLEAR_BUTTON)).toEqual({
      type: "mark",
      marks: [{ pos: 2, color: 4 }],
      ruledOut: false,
    });
    expect(ui.currPegs).toEqual([0, 0, 0, 0]);
  });

  it("Enter on a slot toggles notes mode, and on the submit position submits", () => {
    const { state, ui, ds } = fresh();
    ui.cursor.visible = true;
    ui.cursor.x = 1;
    expect(guessGame.interpretMove(state, ui, ds, ZERO, CURSOR_SELECT)).toBe(UI_UPDATE);
    expect(ui.pencilMode).toBe(true);
    expect(guessGame.interpretMove(state, ui, ds, ZERO, CURSOR_SELECT)).toBe(UI_UPDATE);
    expect(ui.pencilMode).toBe(false);
    ui.currPegs.splice(0, 4, 1, 2, 3, 5);
    ui.markable = true;
    ui.cursor.x = state.params.npegs;
    expect(guessGame.interpretMove(state, ui, ds, ZERO, CURSOR_SELECT)).toMatchObject({
      type: "guess",
    });
  });

  it("notes mode keeps the cursor off the submit position", () => {
    const { state, ui, ds } = fresh();
    ui.cursor.visible = true;
    ui.cursor.x = state.params.npegs;
    guessGame.interpretMove(state, ui, ds, ZERO, PENCIL_MODE_BUTTON);
    expect(ui.cursor.x).toBe(state.params.npegs - 1);
  });
});

describe("the hint frame", () => {
  it("outlines the row it reads and frames the colors it marks", () => {
    // A row of two colors the answer lacks scores nothing, which is the
    // plainest firing there is: both colors, ruled out everywhere.
    const p = defaultParams();
    const { desc } = newDesc(p, randomNew("hint-frame"));
    const answer = newState(p, desc).solution;
    const [a, b] = [1, 2, 3, 4, 5, 6].filter((c) => !answer.includes(c));
    const res = renderScenario({
      game: guessGame,
      id: `${guessGame.encodeParams(p, true)}:${desc}`,
      moves: [
        { type: "guess", pegs: [a, a, b, b], holds: [false, false, false, false] },
      ],
      showHint: true,
    });
    const step = res.hint;
    expect(step?.move.type).toBe("mark");
    expect(step?.explanation).toMatch(/scored nothing/);
    const hl = step?.highlights as GuessHighlights;
    expect(hl.rows).toEqual([0]);
    expect(hl.marked).toHaveLength(2 * p.npegs);
    const ops = res.recording.ops;
    const frames = ops.filter((o) => o.op === "rect" && o.color === COL_HINT);
    // A four-sided frame beside each marked block, every side of it thin: a
    // mark in the gap, never a fill over the color it is about.
    expect(frames.length).toBe(hl.marked.length * 4);
    for (const f of frames) {
      if (f.op === "rect") expect(Math.min(f.w, f.h)).toBeLessThanOrEqual(2);
    }
    const outlineRects = ops.filter(
      (o) => o.op === "rect" && o.color === COL_HINT_CELL,
    );
    expect(outlineRects.length).toBe(4);
    expect(ops).toMatchSnapshot();
  });
});

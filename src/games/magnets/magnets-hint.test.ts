/**
 * Magnets' explained hint (`hint.ts`): the plan finishes every board, every
 * premise the solver holds is reached and shown or hidden as it should be, the
 * sentences stay within the collection's bounds at every value they take, and
 * following a leg by the game's own press cycle keeps the plan.
 */
import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { randomNew } from "../../engine/random/index.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { newMagnetsDesc } from "./generator.ts";
import {
  type MagnetsHighlights,
  magnetsKeepTrack,
  recordingPass,
  seedSolver,
} from "./hint.ts";
import { type Axis, type Cause, type RuleOut, say } from "./hint-text.ts";
import { magnetsGame } from "./index.ts";
import type { MagnetsReason } from "./solver.ts";
import {
  DIFF_TRICKY,
  executeMove,
  GS_NOTNEUTRAL,
  type MagnetsMove,
  type MagnetsParams,
  type MagnetsState,
  NEGATIVE,
  NEUTRAL,
  newState,
  POSITIVE,
  presets,
} from "./state.ts";

const hint = (s: MagnetsState) => {
  const h = magnetsGame.hint;
  if (!h) throw new Error("magnets declares no hint");
  return h(s);
};

function boardsOf(
  seeds: number,
): { label: string; state: MagnetsState; aux: string }[] {
  const out = [];
  for (const entry of presets().submenu ?? []) {
    if (!("params" in entry)) continue;
    const p = entry.params as MagnetsParams;
    for (let seed = 0; seed < seeds; seed++) {
      const label = `${p.w}x${p.h}d${p.diff}${p.stripclues ? "s" : ""}#${seed}`;
      const { desc, aux } = newMagnetsDesc(p, randomNew(`magnets-hint-${label}`));
      out.push({ label, state: newState(p, desc), aux: aux ?? "" });
    }
  }
  return out;
}

const CORPUS = boardsOf(3);

/** Every premise the solver names, so adding one breaks compilation here until
 * the census below accounts for it. */
const KINDS: Record<MagnetsReason["kind"], true> = {
  force: true,
  lineFull: true,
  lineExact: true,
  magnetsFill: true,
  oddGap: true,
  oneNeutralLeft: true,
  everyDominoNeeded: true,
  onlyEndLeft: true,
};

describe("magnets hint", () => {
  it("follows its own plan to a finished board on every preset", () => {
    let steps = 0;
    for (const { label, state: start } of CORPUS) {
      let state = start;
      for (let asks = 0; !state.completed; asks++) {
        expect(asks, `${label}: the plan never finished`).toBeLessThan(200);
        const res = hint(state);
        expect(res.ok, `${label}: ${res.ok ? "" : res.error}`).toBe(true);
        if (!res.ok) break;
        for (const step of res.steps) {
          state = executeMove(state, step.move);
          steps++;
        }
      }
      expect(magnetsGame.findMistakes?.(state), label).toEqual([]);
    }
    expect(steps).toBeGreaterThan(500);
  });

  it("reaches every premise, and shows exactly the ones that change what the player writes", () => {
    const shown = new Set<string>();
    const hidden = new Set<string>();
    for (const { state } of CORPUS) {
      const solver = seedSolver(state);
      if (!solver) throw new Error("a fresh board failed to seed");
      const pass = recordingPass(solver, stepBudget("magnets census"));
      for (let f = pass.next(); f; f = pass.next()) {
        const visible = f.placed.length > 0 || f.marked.length > 0;
        const key =
          f.reason.kind === "lineFull"
            ? `lineFull/${f.reason.which === NEUTRAL ? "neutral" : "pole"}`
            : f.reason.kind;
        (visible ? shown : hidden).add(key);
        // A firing places or marks, never both: the legs are one kind of move.
        expect(f.placed.length > 0 && f.marked.length > 0).toBe(false);
      }
    }
    // The rungs that set only "cannot be +/−" bits are hidden, always: the
    // board already says what they found (magnets-reading.test.ts).
    expect([...hidden].sort()).toEqual(["lineFull/pole", "magnetsFill"]);
    expect([...shown].sort()).toEqual(
      [
        ...Object.keys(KINDS).filter((k) => k !== "magnetsFill" && k !== "lineFull"),
        "lineFull/neutral",
      ].sort(),
    );
  });

  it("does not re-mark a `?` the player already made", () => {
    // Find a board whose plan opens by marking magnets, make the first mark
    // ourselves, and ask again.
    for (const { label, state } of CORPUS) {
      const res = hint(state);
      if (!res.ok) continue;
      const first = res.steps[0].move;
      if (first.type !== "flag" || first.mode !== "notneutral") continue;
      const marked = executeMove(state, first);
      expect(marked.flags[first.idx] & GS_NOTNEUTRAL).not.toBe(0);
      const again = hint(marked);
      expect(again.ok, label).toBe(true);
      if (!again.ok) return;
      const remarks = again.steps.filter(
        (s) =>
          s.move.type === "flag" &&
          s.move.mode === "notneutral" &&
          (s.move.idx === first.idx ||
            s.move.idx === marked.common.dominoes[first.idx]),
      );
      expect(remarks).toEqual([]);
      return;
    }
    throw new Error("no board in the corpus opens with a `?`");
  });

  it("calls a `?` on a neutral domino a mistake, and refuses to hint past it", () => {
    // A neutral square that is half of a domino, not a lone blank square.
    const found = CORPUS.flatMap(({ state, aux }) =>
      [...aux].flatMap((c, idx) =>
        c === "." && state.common.dominoes[idx] !== idx ? [{ state, idx }] : [],
      ),
    )[0];
    if (!found) throw new Error("no neutral domino in the corpus");
    const { state, idx } = found;
    const wrong = executeMove(state, { type: "flag", idx, mode: "notneutral" });
    const w = state.w;
    expect(magnetsGame.findMistakes?.(wrong)).toContainEqual({
      x: idx % w,
      y: Math.floor(idx / w),
    });
    expect(hint(wrong).ok).toBe(false);
  });
});

describe("magnets hint: following a leg", () => {
  /** The first leg of the plan on some board matching `want`, and the board. */
  function legWhere(want: (m: MagnetsMove) => boolean) {
    for (const { state } of CORPUS) {
      const res = hint(state);
      if (!res.ok) continue;
      let s = state;
      for (const step of res.steps) {
        if (want(step.move)) return { state: s, step };
        s = executeMove(s, step.move);
      }
    }
    throw new Error("no such leg in the corpus");
  }

  const partner = (s: MagnetsState, i: number) => s.common.dominoes[i];

  it("takes a − through the + on the way, or one press on the other end", () => {
    const { state, step } = legWhere((m) => m.type === "set" && m.which === NEGATIVE);
    const move = step.move as MagnetsMove & { type: "set" };
    const plus: MagnetsMove = { type: "set", idx: move.idx, which: POSITIVE };
    expect(magnetsKeepTrack(plus, step, state)).toBe("onTrack");
    expect(magnetsKeepTrack(move, step, executeMove(state, plus))).toBe("completed");
    const fromPartner: MagnetsMove = {
      type: "set",
      idx: partner(state, move.idx),
      which: POSITIVE,
    };
    expect(magnetsKeepTrack(fromPartner, step, state)).toBe("completed");
  });

  it("takes a `?` through neutral on the way", () => {
    const { state, step } = legWhere(
      (m) => m.type === "flag" && m.mode === "notneutral",
    );
    const idx = (step.move as MagnetsMove & { type: "flag" }).idx;
    const neutral: MagnetsMove = { type: "flag", idx, mode: "neutral" };
    expect(magnetsKeepTrack(neutral, step, state)).toBe("onTrack");
    expect(magnetsKeepTrack(step.move, step, executeMove(state, neutral))).toBe(
      "completed",
    );
  });

  it("holds the leg through a clue's done-gray, and drops it for another domino", () => {
    const { state, step } = legWhere((m) => m.type === "set");
    const idx = (step.move as MagnetsMove & { type: "set" }).idx;
    expect(magnetsKeepTrack({ type: "clue", clue: 0 }, step, state)).toBe("onTrack");
    const elsewhere = [...Array(state.wh).keys()].find(
      (i) => i !== idx && i !== partner(state, idx) && partner(state, i) !== i,
    );
    if (elsewhere === undefined) throw new Error("the board has one domino");
    expect(
      magnetsKeepTrack({ type: "set", idx: elsewhere, which: POSITIVE }, step, state),
    ).toBe("off");
  });

  it("rings the leg's own squares and the ones after it, never one already done", () => {
    const { state } = CORPUS[0];
    const res = hint(state);
    if (!res.ok) throw new Error(res.error);
    let s = state;
    for (const step of res.steps as HintStep<MagnetsMove, MagnetsHighlights>[]) {
      const targets = step.highlights?.targets ?? [];
      expect(targets.length).toBeGreaterThan(0);
      for (const t of targets)
        expect(s.flags[t] & 2, `square ${t} already placed`).toBe(0);
      s = executeMove(s, step.move);
    }
  });
});

describe("a count premise shows why the rest of its line is ruled out", () => {
  // The owner's playtest board (2026-09-22), pinned as its desc. Column 2 needs
  // three +s from five dominoes; the two reaching left into column 1 cannot
  // give one, because a + would put a − in column 1, whose − clue is 0. The
  // old step outlined their right halves as one shape, a vertical domino that
  // is not on the board, and said nothing about column 1.
  const at = (x: number, y: number) => y * 5 + x;
  const column = (x: number) => [0, 1, 2, 3, 4, 5].map((y) => at(x, y));
  function steps(): HintStep<MagnetsMove, MagnetsHighlights>[] {
    const p: MagnetsParams = { w: 5, h: 6, diff: 1, stripclues: true };
    let s = newState(p, "..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB");
    s = executeMove(s, { type: "set", idx: at(1, 4), which: NEUTRAL });
    const res = hint(s);
    if (!res.ok) throw new Error(res.error);
    return res.steps.slice(0, 3) as HintStep<MagnetsMove, MagnetsHighlights>[];
  }

  it("names the reason, and marks it rather than the rest of the line", () => {
    const [first] = steps();
    expect(first.explanation).toBe(
      "This column needs 3 more +s and just 3 dominoes can still give one; " +
        "a + anywhere else would put one − too many in a column, so this square must be +.",
    );
    const area = new Set(first.highlights?.area);
    // The two ruled-out squares of column 2, and nothing else of it.
    expect(column(2).filter((i) => area.has(i))).toEqual([at(2, 1), at(2, 2)]);
    // Column 1 is what rules them out, with its clue.
    for (const i of column(1)) expect(area.has(i), `square ${i}`).toBe(true);
    expect(first.highlights?.clues).toHaveLength(2);
  });

  it("rings only the square that takes the pole, once the board forces it", () => {
    const [first, second, third] = steps();
    // The vertical domino's + goes at its bottom only because the second leg's
    // + lands beside its top, so neither earlier step rings it.
    expect(first.highlights?.targets).toEqual([at(2, 0), at(2, 3)]);
    expect(second.highlights?.targets).toEqual([at(2, 3)]);
    expect(third.highlights?.targets).toEqual([at(2, 5)]);
    expect(third.explanation).toContain(
      "A + at this domino's other end would touch a +, so this end must be +.",
    );
    expect(third.highlights?.area).toEqual(
      expect.arrayContaining([at(2, 4), at(2, 3)]),
    );
  });

  it("counts from the board each leg finds, not the one the journey began on", () => {
    const [, second, third] = steps();
    expect(second.explanation).toMatch(
      /^This column needs 2 more \+s and just 2 dominoes/,
    );
    expect(third.explanation).toMatch(
      /^This column needs one more \+ and only this domino can still give it;/,
    );
  });
});

describe("magnets hint sentences", () => {
  const axes: Axis[] = ["row", "column"];
  const poles = [POSITIVE, NEGATIVE];
  const causes: Cause[] = axes.flatMap((axis) => [
    { kind: "touch" as const },
    { kind: "full" as const, axis, line: 0, marked: false },
    { kind: "full" as const, axis, line: 1, marked: true },
  ]);

  const ruleOuts: RuleOut[] = [
    { kind: "touch" },
    ...axes.flatMap((axis) => [
      { kind: "full" as const, axis },
      { kind: "partnerFull" as const, axis },
    ]),
    { kind: "partnerTouch" },
  ];
  /** No reason, one, and every reason at once: the longest list. */
  const elsewheres: RuleOut[][] = [[], ...ruleOuts.map((r) => [r]), ruleOuts];

  /** The count premises that say why the rest of their line is ruled out:
   * two premises, so held to the ledger's bound (`hint-quality.test.ts`
   * `LONG_NARRATIONS`) rather than 120. */
  function everyCountSentence(): { text: string; reasoned: boolean }[] {
    const out: { text: string; reasoned: boolean }[] = [];
    for (const pole of poles)
      for (const axis of axes)
        for (const n of [1, 2, 9])
          for (const elsewhere of elsewheres) {
            out.push({
              text: say.lineExact(axis, pole, n, elsewhere),
              reasoned: elsewhere.length > 0,
            });
            for (const end of [null, ...ruleOuts]) {
              out.push({
                text: say.onlyEndLeft(axis, pole, n, elsewhere, end),
                reasoned: elsewhere.length > 0 || end !== null,
              });
            }
          }
    return out;
  }

  /** Every sentence the arms can speak, at every value that changes the words:
   * the only instrument that reads an arm no corpus happens to fire
   * (docs/games/hints.md § "Census the reasons, not only the rungs"). */
  function everySentence(): string[] {
    const out: string[] = everyCountSentence()
      .filter((s) => !s.reasoned)
      .map((s) => s.text);
    for (const pole of poles) {
      out.push(say.bothEndsTouch(pole));
      for (const c of causes) {
        out.push(say.magnetHere(pole, c), say.magnetThere(pole, c));
        if (c.kind === "full") {
          out.push(say.alongFull(pole, c));
          for (const d of causes)
            if (d.kind === "full" && d.axis === c.axis)
              out.push(say.bothInFull(pole, c, d));
        }
        for (const d of causes) {
          out.push(say.neitherEnd(pole, c, d), say.oneEndNeither(c, d));
        }
      }
      for (const axis of axes) {
        for (const n of [1, 2, 9]) out.push(say.everyDominoNeeded(axis, pole, n));
        out.push(say.oddGap(axis, pole));
      }
    }
    for (const axis of axes) {
      out.push(say.polesEverywhere(axis), say.noPolesLeft(axis));
      for (const n of [1, 2, 9]) {
        out.push(say.neutralExact(axis, n), say.oneNeutralLeft(axis, n));
      }
    }
    return out;
  }

  it("stays within 120 characters at every value, and never uses an em-dash", () => {
    const all = everySentence();
    expect(all.length).toBeGreaterThan(150);
    for (const s of all) {
      expect(s.length, s).toBeLessThanOrEqual(120);
      expect(s, s).not.toContain("—");
    }
  });

  it("gives a count premise's reasons within the ledger's 300 characters", () => {
    const reasoned = everyCountSentence().filter((s) => s.reasoned);
    expect(reasoned.length).toBeGreaterThan(200);
    for (const { text } of reasoned) {
      expect(text.length, text).toBeLessThanOrEqual(300);
      expect(text, text).not.toContain("—");
      // The ledger's pattern for these, so a rewording cannot slip off it.
      expect(text, text).toMatch(
        / anywhere else would |at this domino's other end would/,
      );
    }
  });

  it("concludes every sentence with a necessity", () => {
    const all = [...everySentence(), ...everyCountSentence().map((s) => s.text)];
    for (const s of all) expect(s, s).toMatch(/must (be|go)|must start/);
  });

  it("lists each reason once, in a fixed order", () => {
    const s = say.lineExact("row", POSITIVE, 2, [
      { kind: "partnerTouch" },
      { kind: "touch" },
      { kind: "touch" },
    ]);
    expect(s).toContain("a + anywhere else would touch a + or put a − beside a −,");
  });

  it("never cites a marked magnet on a board with none", () => {
    // The fresh-board firing specifically (docs/games/hints.md § "Sanity-read
    // at the degenerate extremes"): nothing is marked yet, so no sentence on
    // the first plan may lean on a mark.
    let checked = 0;
    for (const { state } of CORPUS) {
      const res = hint(state);
      if (!res.ok) continue;
      checked++;
      expect(res.steps[0].explanation).not.toMatch(/marked/);
    }
    expect(checked).toBe(CORPUS.length);
  });

  it("speaks the singular at one", () => {
    expect(say.lineExact("row", POSITIVE, 1, [])).toContain("one more +");
    expect(say.lineExact("row", POSITIVE, 1, [])).toContain("this square");
    expect(say.oneNeutralLeft("column", 1)).toContain("this domino");
    expect(say.neutralExact("row", 1)).toContain("this one");
  });

  it("marks a line's clue digits, the line and the squares it decides", () => {
    // Whole plans, not first steps: a step deep in a plan is drawn from the
    // board as it stands then, which is where a stale picture would show.
    let steps = 0;
    const lineSteps: number[] = [];
    for (const { label, state: start } of CORPUS.filter((b) =>
      b.label.includes(`d${DIFF_TRICKY}`),
    )) {
      let state = start;
      for (let asks = 0; !state.completed && asks < 200; asks++) {
        const res = hint(state);
        expect(res.ok, label).toBe(true);
        if (!res.ok) break;
        for (const step of res.steps as HintStep<MagnetsMove, MagnetsHighlights>[]) {
          steps++;
          const h = step.highlights;
          expect(h?.targets.length).toBeGreaterThan(0);
          // Every step shows its evidence: a line, a touching pole or a domino.
          expect((h?.area.length ?? 0) + (h?.clues.length ?? 0)).toBeGreaterThan(0);
          // No square is both what is decided and what it is decided from.
          const targets = new Set(h?.targets);
          expect(h?.area.filter((i) => targets.has(i))).toEqual([]);
          // A sentence about "this row" or "this column" marks its clue.
          if (/^This (row|column)/.test(step.explanation)) {
            lineSteps.push(h?.clues.length ?? 0);
          }
          state = executeMove(state, step.move);
        }
      }
    }
    expect(steps).toBeGreaterThan(300);
    expect(lineSteps.length).toBeGreaterThan(50);
    expect(lineSteps.filter((n) => n === 0)).toEqual([]);
  });
});

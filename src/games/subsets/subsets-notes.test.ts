/**
 * Subsets' rule-out marks (`add-subsets-notation`): the tally input, the move,
 * the mistake check that vouches for the marks, and the hint that places them.
 * The hint's claims are checked against the board each step is shown on, not
 * against the recorder that produced them.
 */
import { describe, expect, it } from "vitest";
import { type HintStep, UI_UPDATE } from "../../engine/game.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import {
  BACKSPACE,
  CURSOR_DOWN,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  CURSOR_UP,
  LEFT_BUTTON,
  newCursor,
} from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintKindPins } from "../../engine/testing/hint-positions.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderPinnedHint,
} from "../../engine/testing/render-scenario.ts";
import { newSubsetsDesc } from "./generator.ts";
import { TALLY_SET } from "./hint-marks.ts";
import { subsetsGame } from "./index.ts";
import {
  COL_ERROR,
  COL_GUESS,
  COL_HINT,
  COL_HINT_CELL,
  COL_HINT_SPOT,
  COL_RULED_OUT,
  newDrawState,
} from "./render.ts";
import {
  candidateCells,
  candidateSets,
  canHold,
  findMistakes,
  solveCopy,
} from "./solver.ts";
import {
  ADJTHAN,
  DIFF_EASY,
  DIFF_NORMAL,
  newState,
  type SubsetsMove,
  type SubsetsState,
  type SubsetsUi,
} from "./state.ts";

const TS = 36;

function gen(diff: number, seed: string): SubsetsState {
  const p = { w: 4, h: 4, n: 4, diff };
  return newState(p, newSubsetsDesc(p, randomNew(seed)).desc);
}

/** The pixel at the center of tally entry `value` (render.ts's layout). */
function tallyPoint(value: number): { x: number; y: number } {
  const x = Math.floor(value / 4);
  const y = value % 4;
  return {
    x: x * 3 * TS + Math.floor(2 * TS * 0.75),
    y: Math.floor(y * 0.75 * TS) + 6 * 2 * TS,
  };
}

function press(
  s: SubsetsState,
  u: SubsetsUi,
  button: number,
  p = { x: 0, y: 0 },
): ReturnType<typeof subsetsGame.interpretMove> {
  return subsetsGame.interpretMove(s, u, newDrawState(s, TS), p, button);
}

const firstUndecided = (s: SubsetsState): number => {
  for (let i = 0; i < 16; i++) if (s.known[i] !== s.mask[i]) return i;
  throw new Error("no undecided cell");
};

describe("subsets rule-out input", () => {
  const s = gen(DIFF_EASY, "notes-input");

  it("a tally press with an undecided cell in focus rules the set out, and back in", () => {
    const u = subsetsGame.newUi(s);
    const cell = firstUndecided(s);
    u.highlightCell = cell;
    expect(press(s, u, LEFT_BUTTON, tallyPoint(6))).toEqual({
      kind: "rule",
      pos: cell,
      value: 6,
      on: true,
    });
    const ruled = subsetsGame.executeMove(s, {
      kind: "rule",
      pos: cell,
      value: 6,
      on: true,
    });
    expect(ruled.ruledOut[cell]).toBe(1 << 6);
    // The aid reads it: the set leaves the cell's list, and the cell the set's.
    expect(candidateSets(s, cell)).toContain(6);
    expect(candidateSets(ruled, cell)).not.toContain(6);
    expect(candidateCells(ruled, 6)).not.toContain(cell);
    expect(press(ruled, u, LEFT_BUTTON, tallyPoint(6))).toMatchObject({ on: false });
    // The focus stays, so several sets can be ruled out in a row.
    expect(u.highlightCell).toBe(cell);
  });

  it("with no cell in focus, or a decided one, a tally press still spotlights", () => {
    const u = subsetsGame.newUi(s);
    expect(press(s, u, LEFT_BUTTON, tallyPoint(6))).toBe(UI_UPDATE);
    expect(u.highlightSet).toBe(6);
    const given = s.immutable.findIndex((b) => b !== 0);
    expect(given).toBeGreaterThanOrEqual(0);
    u.highlightSet = null;
    u.highlightCell = given;
    expect(press(s, u, LEFT_BUTTON, tallyPoint(6))).toBe(UI_UPDATE);
    expect(u).toMatchObject({ highlightSet: 6, highlightCell: null });
  });

  it("a rule move is absolute, so replaying it is harmless", () => {
    const m: SubsetsMove = { kind: "rule", pos: 3, value: 9, on: true };
    const once = subsetsGame.executeMove(s, m);
    expect(subsetsGame.executeMove(once, m).ruledOut).toEqual(once.ruledOut);
    expect(s.ruledOut[3]).toBe(0);
  });

  it("the keyboard walks down into the tally, rules out, erases, and walks back", () => {
    const u = subsetsGame.newUi(s);
    // Down from the grid's bottom slot row enters the band, keeping the focus.
    u.cursor = newCursor(3, 10, true);
    const cell = 12 + 1;
    u.highlightCell = cell;
    expect(press(s, u, CURSOR_DOWN)).toBe(UI_UPDATE);
    expect(u.tallyCursor).toBe(4);
    expect(u.highlightCell).toBe(cell);
    press(s, u, CURSOR_RIGHT);
    press(s, u, CURSOR_DOWN);
    expect(u.tallyCursor).toBe(9);
    const undecided = s.known[cell] !== s.mask[cell];
    const sel = press(s, u, CURSOR_SELECT);
    if (undecided) expect(sel).toEqual({ kind: "rule", pos: cell, value: 9, on: true });
    else expect(sel).toBe(UI_UPDATE);
    // Erase takes a rule-out back, and does nothing where there is none.
    const ruled = subsetsGame.executeMove(s, {
      kind: "rule",
      pos: cell,
      value: 9,
      on: true,
    });
    u.highlightCell = cell;
    expect(press(ruled, u, BACKSPACE)).toEqual({
      kind: "rule",
      pos: cell,
      value: 9,
      on: false,
    });
    expect(press(s, u, BACKSPACE)).toBeNull();
    // Up from the band's top row returns to the grid cell under the cursor.
    press(s, u, CURSOR_UP);
    expect(press(s, u, CURSOR_UP)).toBe(UI_UPDATE);
    expect(u.tallyCursor).toBeNull();
    expect(u.highlightCell).toBe(cell);
  });
});

describe("the reference aid repaints on a warm draw state", () => {
  it("fills a cell's badge when it is clicked while the other aid lights it", () => {
    // Both aids mark the cell alike, so its key once stayed the same and the
    // badge never filled. A fresh draw state would repaint anyway; this one
    // is reused.
    const s = gen(DIFF_EASY, "badge-warm");
    const cell = firstUndecided(s);
    const set = candidateSets(s, cell)[0];
    expect(candidateCells(s, set)).toContain(cell);
    const ds = newDrawState(s, TS);
    const ui = subsetsGame.newUi(s);
    const frame = () => {
      const rec = new RecordingDrawing(subsetsGame.colors(DEFAULT_BACKGROUND));
      subsetsGame.redraw(rec, ds, null, s, 0, ui, 0, 0);
      return rec.ops.filter((o) => o.op === "circle" && o.fill === COL_HINT_SPOT);
    };
    ui.highlightSet = set;
    expect(frame()).toEqual([]);
    ui.highlightSet = null;
    ui.highlightCell = cell;
    expect(frame()).toHaveLength(1);
    ui.highlightCell = null;
    ui.highlightSet = set;
    expect(frame()).toEqual([]);
  });
});

describe("subsets rule-out mistakes", () => {
  it("ruling out the solution's set is a mistake, and ruling out another is not", () => {
    const s = gen(DIFF_EASY, "notes-mistake");
    const { solved } = solveCopy(s);
    const cell = firstUndecided(s);
    const wrong = subsetsGame.executeMove(s, {
      kind: "rule",
      pos: cell,
      value: solved.known[cell],
      on: true,
    });
    expect(findMistakes(wrong)).toEqual([
      { kind: "ruled", pos: cell, value: solved.known[cell] },
    ]);

    const other = (solved.known[cell] + 1) % 16;
    const right = subsetsGame.executeMove(s, {
      kind: "rule",
      pos: cell,
      value: other,
      on: true,
    });
    expect(findMistakes(right)).toEqual([]);
  });

  it("a wrong rule-out is drawn in the error color while its cell is in focus", () => {
    const s = gen(DIFF_EASY, "notes-mistake");
    const { solved } = solveCopy(s);
    const cell = firstUndecided(s);
    const good = (solved.known[cell] + 1) % 16;
    let board = s;
    for (const value of [solved.known[cell], good])
      board = subsetsGame.executeMove(board, {
        kind: "rule",
        pos: cell,
        value,
        on: true,
      });
    const ui = subsetsGame.newUi(board);
    const strikes = (focus: number | null) => {
      ui.highlightCell = focus;
      const rec = new RecordingDrawing(subsetsGame.colors(DEFAULT_BACKGROUND));
      subsetsGame.redraw(
        rec,
        newDrawState(board, TS),
        null,
        board,
        0,
        ui,
        0,
        0,
        undefined,
        findMistakes(board),
      );
      // A line that is not a stroke of a cleared slot's cross is a strike.
      return rec.ops
        .filter((o) => o.op === "line" && o.color !== COL_RULED_OUT)
        .map((o) => ("color" in o ? o.color : -1));
    };
    expect(strikes(cell).sort()).toEqual([COL_GUESS, COL_ERROR].sort());
    // The strikes belong to the cell in focus, and to no other.
    expect(strikes(null)).toEqual([]);
  });
});

// --- the hint's claims, walked against the board --------------------------

type Step = HintStep<SubsetsMove>;

/** Is there a horseshoe from `sup` (superset end) to its neighbor `sub`? */
function arrow(s: SubsetsState, sup: number, sub: number): boolean {
  const x = sup % s.w;
  const y = Math.floor(sup / s.w);
  return ADJTHAN.some(
    (d) =>
      (s.clues[sup] & d.f) !== 0 &&
      x + d.dx === sub % s.w &&
      y + d.dy === Math.floor(sub / s.w),
  );
}

const strictSub = (a: number, b: number): boolean => a !== b && (a & b) === a;

interface WalkTally {
  ruleOuts: number;
  heads: number;
  journeys: number;
}

/**
 * Walk one board's whole plan, applying each step, and hold every claim to the
 * board it is shown on: a rule-out is true, not already shown, and its
 * horseshoe and highlighted sets are what the sentence says; each is used by
 * the firing it sits beside; and the firing then follows from the board.
 */
function walkClaims(start: SubsetsState, tally: WalkTally): void {
  const res = subsetsGame.hint?.(start);
  if (!res?.ok) throw new Error("no hint on a fresh board");
  const { solved } = solveCopy(start);
  const steps = res.steps as Step[];
  let board = start;
  let journey: Step[] = [];
  const closeJourney = (): void => {
    if (!journey.length) return;
    tally.journeys++;
    // Every rule-out is used: by the firing's letters (it holds a letter the
    // firing clears or lacks one it marks), by its hidden single (it is the
    // placed set, ruled out of another cell), or by a later rule-out's premise
    // in the same journey.
    const lead = journey.find((st) => st.move.kind === "set");
    let marked = 0;
    let cleared = 0;
    for (const st of journey) {
      if (st.move.kind !== "set") continue;
      if (st.move.type === "known") marked |= 1 << st.move.bit;
      else cleared |= 1 << st.move.bit;
    }
    const single = lead?.rung === "hiddenSingle";
    journey.forEach((st, k) => {
      const m = st.move;
      if (m.kind !== "rule") return;
      const usedLater = journey.slice(k + 1).some((later) => {
        const lm = later.move;
        if (lm.kind !== "rule") return false;
        const via = stepMarks(later).of("outline", CELL)[0];
        if (!via || via.y * 4 + via.x !== m.pos) return false;
        const head = arrow(board, m.pos, lm.pos);
        return head ? strictSub(lm.value, m.value) : strictSub(m.value, lm.value);
      });
      const byFiring =
        lead !== undefined &&
        lead.move.kind === "set" &&
        (single
          ? m.pos !== lead.move.pos &&
            stepMarks(lead).of("outline", TALLY_SET)[0] === m.value
          : m.pos === lead.move.pos &&
            ((marked & ~m.value) !== 0 || (cleared & m.value) !== 0));
      expect(usedLater || byFiring, `an unused rule-out: ${JSON.stringify(m)}`).toBe(
        true,
      );
    });
    journey = [];
  };

  for (const st of steps) {
    if (!st.continuesPrevious) closeJourney();
    journey.push(st);
    const m = st.move;
    const marks = stepMarks(st);
    const cells = marks.of("outline", CELL);
    const sets = marks.of("outline", TALLY_SET);
    if (m.kind === "rule") {
      tally.ruleOuts++;
      // True, and not already on the board in any form.
      expect(m.on).toBe(true);
      expect(solved.known[m.pos]).not.toBe(m.value);
      expect(canHold(board, m.pos, m.value)).toBe(true);
      // "No outlined set is a bigger set holding / smaller set inside it."
      expect(cells).toHaveLength(1);
      const via = cells[0].y * board.w + cells[0].x;
      expect(sets).toEqual(candidateSets(board, via).filter((v) => v !== m.value));
      const head = arrow(board, via, m.pos);
      expect(head || arrow(board, m.pos, via), "a rule-out across no horseshoe").toBe(
        true,
      );
      if (head) tally.heads++;
      expect(st.explanation).toContain(
        head ? "bigger set holding" : "smaller set inside",
      );
      for (const v of sets)
        expect(head ? strictSub(m.value, v) : strictSub(v, m.value)).toBe(false);
      expect(marks.of("ring", TALLY_SET)).toEqual([m.value]);
    } else if (
      m.kind === "set" &&
      journey.every((j) => j === st || j.move.kind !== "set")
    ) {
      // The firing's lead letter, which states what the later ones rest on.
      if (st.rung === "hiddenSingle")
        expect(candidateCells(board, sets[0])).toEqual([m.pos]);
      if (st.rung === "collapse") {
        expect(sets).toEqual(candidateSets(board, m.pos));
        const b = 1 << m.bit;
        for (const v of sets) expect((v & b) !== 0).toBe(m.type === "known");
      }
    }
    board = subsetsGame.executeMove(board, m);
  }
  closeJourney();
  expect(subsetsGame.status(board)).toBe("solved");
}

const pinned = describeHintKindPins({
  game: subsetsGame,
  params: [{ w: 4, h: 4, n: 4, diff: DIFF_NORMAL }],
  kinds: { ruleOut: (step) => step.rung === "ruleOut" },
  pins: {
    /** Held on 140 of 668 positions walked. */
    ruleOut: {
      id: "4x4n4dt:14D,7R,_,_DL,_,_,_UD,_,1,6,_,15UDL,13U,10,_URL,_",
      moves:
        '[{"kind":"set","type":"cleared","pos":4,"bit":0},{"kind":"set","type":"cleared","pos":2,"bit":3},{"kind":"set","type":"known","pos":14,"bit":1},{"kind":"set","type":"known","pos":14,"bit":3},{"kind":"set","type":"known","pos":5,"bit":3}]',
    },
  },
});

describe("the hint places the rule-outs it rests on", () => {
  for (const [name, diff] of [
    ["Easy", DIFF_EASY],
    ["Normal", DIFF_NORMAL],
  ] as const) {
    it(`${name}: every rule-out is true, needed, placed once and read off the board`, () => {
      const tally: WalkTally = { ruleOuts: 0, heads: 0, journeys: 0 };
      for (let seed = 0; seed < 12; seed++)
        walkClaims(gen(diff, `notes-walk-${seed}`), tally);
      // Vacuity: the walk met rule-outs, and at Normal both halves of the rule.
      expect(tally.ruleOuts).toBeGreaterThan(10);
      if (diff === DIFF_NORMAL) expect(tally.heads).toBeGreaterThan(0);
    });
  }

  it("a plan resumed from rule-outs made out of order places each once, and only where true", () => {
    let resumed = 0;
    for (let seed = 0; seed < 8; seed++) {
      const start = gen(DIFF_NORMAL, `notes-resume-${seed}`);
      const res = subsetsGame.hint?.(start);
      if (!res?.ok) throw new Error("no hint");
      // Make every other rule-out the plan would, in reverse order, first.
      const rules = res.steps.map((st) => st.move).filter((m) => m.kind === "rule");
      let board = start;
      rules
        .filter((_, k) => k % 2 === 1)
        .reverse()
        .forEach((m) => {
          board = subsetsGame.executeMove(board, m);
        });
      if (board === start) continue;
      resumed++;
      expect(findMistakes(board)).toEqual([]);
      walkClaims(board, { ruleOuts: 0, heads: 0, journeys: 0 });
    }
    expect(resumed).toBeGreaterThan(0);
  });

  it("the rule-out hint frame boxes the set and the neighbor's sets, and frames the cell", () => {
    const frame = renderPinnedHint(subsetsGame, pinned("ruleOut"));
    const ops = frame.recording.ops;
    const rects = ops.filter((o) => o.op === "rect");
    expect(rects.some((o) => o.color === COL_HINT)).toBe(true);
    expect(rects.some((o) => o.color === COL_HINT_CELL)).toBe(true);
    expect(ops).toMatchSnapshot();
  });
});

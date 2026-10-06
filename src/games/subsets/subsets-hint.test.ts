/**
 * Subsets explained hint.
 *
 * Tier 1: the recording deduction pass (`deduceHintPlan`) — every reason kind,
 * completeness and recompute-stability from any position, and the `hint()`
 * narration/refusal contract. Tier 2.5: a hint frame reaches the render cache
 * with its target slot and evidence shading. The from-position resume and the
 * overlay-in-cache guarantees are also covered cross-game via
 * `hint-resume.test.ts` / `hint-overlay.test.ts` (Subsets is enrolled in
 * `testing/hint-games.ts`).
 */
import { describe, expect, it } from "vitest";
import { UI_UPDATE } from "../../engine/game.ts";
import { CONTRADICTION_UNLOCALIZED } from "../../engine/hint-refusal.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { Midend } from "../../engine/index.ts";
import { CURSOR_DOWN, LEFT_BUTTON, newCursor } from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import { newSubsetsDesc } from "./generator.ts";
import { SLOT, TALLY_SET } from "./hint-marks.ts";
import { subsetsGame } from "./index.ts";
import {
  COL_HINT,
  COL_HINT_CELL,
  COL_HINT_SPOT,
  newDrawState,
  redraw,
} from "./render.ts";
import {
  candidateCells,
  candidateSets,
  deduceHintPlan,
  findMistakes,
  pickExclusion,
  type SubsetsDeduction,
  solveCopy,
  subsetsValidate,
  whyCantPlace,
} from "./solver.ts";
import { cloneState, DIFF_EASY, newState, type SubsetsState } from "./state.ts";

const P = { w: 4, h: 4, n: 4, diff: DIFF_EASY };

function gen(seed: string): SubsetsState {
  const { desc } = newSubsetsDesc(P, randomNew(seed));
  return newState(P, desc);
}

/** A copy of `state` with the rule-outs firing `d` rests on marked. */
function withMarks(state: SubsetsState, d: SubsetsDeduction): SubsetsState {
  const next = cloneState(state);
  for (const m of d.marks) next.ruledOut[m.pos] |= 1 << m.value;
  return next;
}

/** Apply one firing (its rule-outs, then every letter it decides) to a copy of
 * `state`. */
function applyFiring(state: SubsetsState, d: SubsetsDeduction): SubsetsState {
  const next = withMarks(state, d);
  for (const set of d.sets) {
    const b = 1 << set.bit;
    if (set.type === "known") {
      next.known[d.pos] |= b;
      next.mask[d.pos] |= b;
    } else {
      next.known[d.pos] &= ~b;
      next.mask[d.pos] &= ~b;
    }
  }
  return next;
}

/** A kind by the firing the deduction opens with on the board: the one a hint
 * there narrates. */
const opensWith =
  (pred: (d: SubsetsDeduction) => boolean) =>
  (_step: unknown, state: SubsetsState): boolean => {
    const [d] = deduceHintPlan(state).deductions;
    return d !== undefined && pred(d);
  };

const pinned = describeHintPins({
  game: subsetsGame,
  params: [P],
  seeds: 60,
  kinds: {
    // The cube finds a set with one cell left that the board does not show.
    cubeLastPlace: opensWith(
      (d) => d.reason.kind === "hiddenSingle" && d.marks.length > 0,
    ),
    severalLetters: opensWith((d) => d.sets.length > 1),
    // A collapse with a competitor set a visible rule blocks, which the
    // sentence can then point at.
    collapseWithCompetitor: (_step, state) => {
      const [d] = deduceHintPlan(state).deductions;
      return (
        d !== undefined &&
        d.reason.kind === "collapse" &&
        pickExclusion(withMarks(state, d), d.pos, d.reason.survivors) !== null
      );
    },
  },
  pins: {
    /** Held on 2 of 2659 positions walked. */
    cubeLastPlace: {
      id: "4x4n4de:_,_RL,_,_,3,_D,9D,6,10,_R,_,13L,12,_UR,1U,_UL",
      moves:
        '[{"kind":"set","type":"cleared","pos":10,"bit":1},{"kind":"set","type":"cleared","pos":10,"bit":2},{"kind":"set","type":"known","pos":13,"bit":0},{"kind":"set","type":"cleared","pos":10,"bit":3},{"kind":"set","type":"known","pos":15,"bit":0},{"kind":"set","type":"known","pos":15,"bit":2},{"kind":"set","type":"known","pos":15,"bit":3},{"kind":"set","type":"cleared","pos":10,"bit":0},{"kind":"set","type":"known","pos":15,"bit":1},{"kind":"set","type":"known","pos":5,"bit":2},{"kind":"set","type":"known","pos":9,"bit":2},{"kind":"set","type":"known","pos":13,"bit":2},{"kind":"set","type":"cleared","pos":9,"bit":3},{"kind":"set","type":"cleared","pos":13,"bit":3}]',
    },
    /** Held on 1245 of 2659 positions walked. */
    severalLetters: "4x4n4de:4,_RDL,9,_D,_D,_,_UDL,10,_D,_,_D,_D,_,_URL,8,_",
    /** Held on 836 of 2659 positions walked. */
    collapseWithCompetitor: {
      id: "4x4n4de:12D,_R,_,_DL,_,4L,7RL,2,10U,_,_,_UDL,_,9,_,_",
      moves:
        '[{"kind":"set","type":"cleared","pos":4,"bit":0},{"kind":"set","type":"cleared","pos":4,"bit":1},{"kind":"set","type":"known","pos":3,"bit":1},{"kind":"set","type":"cleared","pos":4,"bit":3},{"kind":"set","type":"cleared","pos":4,"bit":2},{"kind":"set","type":"known","pos":11,"bit":1}]',
    },
    /** Held on 1281 of 2659 positions walked. */
    ruleOut: {
      id: "4x4n4de:12D,_R,_,_DL,_,4L,7RL,2,10U,_,_,_UDL,_,9,_,_",
      moves:
        '[{"kind":"set","type":"cleared","pos":4,"bit":0},{"kind":"set","type":"cleared","pos":4,"bit":1},{"kind":"set","type":"known","pos":3,"bit":1},{"kind":"set","type":"cleared","pos":4,"bit":3},{"kind":"set","type":"cleared","pos":4,"bit":2},{"kind":"set","type":"known","pos":11,"bit":1}]',
    },
    /** Held on 1492 of 2659 positions walked. */
    arrowKnown: "4x4n4de:4,_RDL,9,_D,_D,_,_UDL,10,_D,_,_D,_D,_,_URL,8,_",
    /** Held on 1738 of 2659 positions walked. */
    arrowMask: "4x4n4de:_R,_,11RL,_,5,_U,_,_UDL,_,_RDL,8,_,10,_,_RL,4",
    /** Held on 2657 of 2659 positions walked. */
    hiddenSingle: {
      id: "4x4n4de:3,12,_RDL,8,_,_R,_,_L,11,_,_UDL,_U,5,_UR,_R,_",
      moves:
        '[{"kind":"set","type":"known","pos":2,"bit":3},{"kind":"set","type":"known","pos":2,"bit":2}]',
    },
    /** Held on 1804 of 2659 positions walked. */
    collapse: {
      id: "4x4n4de:12D,_R,_,_DL,_,4L,7RL,2,10U,_,_,_UDL,_,9,_,_",
      moves:
        '[{"kind":"set","type":"cleared","pos":4,"bit":0},{"kind":"set","type":"cleared","pos":4,"bit":1},{"kind":"set","type":"known","pos":3,"bit":1},{"kind":"set","type":"cleared","pos":4,"bit":3},{"kind":"set","type":"cleared","pos":4,"bit":2},{"kind":"set","type":"known","pos":11,"bit":1}]',
    },
  },
});

/** A pinned position and the firing the deduction opens with there. */
function firingAt(kind: Parameters<typeof pinned>[0]) {
  const { state } = pinned(kind);
  return { state, d: deduceHintPlan(state).deductions[0] };
}

describe("deduceHintPlan", () => {
  it("solves every generated board from the givens; complete certifies it", () => {
    for (let s = 0; s < 30; s++) {
      const state = gen(`plan-${s}`);
      const plan = deduceHintPlan(state);
      expect(plan.status).toBe("complete");

      // Apply the whole plan → a complete board; no firing ever re-decides a
      // letter already decided before it fired.
      let work = cloneState(state);
      for (const d of plan.deductions) {
        for (const set of d.sets) {
          const b = 1 << set.bit;
          // The letter must be undecided (unknown) before this firing.
          const known = (work.known[d.pos] & b) !== 0;
          const cleared = (work.mask[d.pos] & b) === 0;
          expect(known || cleared).toBe(false);
        }
        work = applyFiring(work, d);
      }
      expect(subsetsValidate(work)).toBe("complete");
    }
  });

  it("is recompute-stable: applying the first firing leaves the rest of the plan", () => {
    let compared = 0;
    for (let s = 0; s < 12; s++) {
      const state = gen(`stable-${s}`);
      const plan = deduceHintPlan(state);
      if (plan.deductions.length < 2) continue;
      const next = applyFiring(state, plan.deductions[0]);
      const replan = deduceHintPlan(next);
      expect(replan.deductions).toEqual(plan.deductions.slice(1));
      compared++;
    }
    // A planner that stopped returning multi-firing plans would skip all twelve.
    expect(compared, "no seed produced a plan of two or more firings").toBeGreaterThan(
      0,
    );
  });

  it("an arrowKnown firing propagates the subset's marked letters up the arrow", () => {
    const hit = firingAt("arrowKnown");
    const r = hit.d.reason;
    if (r.kind !== "arrowKnown") throw new Error("the pin opens with another firing");
    expect(hit.d.pos).toBe(r.from); // the superset gains the letters
    // The arrow really points from -> to, and every gained letter is confirmed
    // in the subset `to`.
    const { w } = hit.state;
    const fromXY = { x: r.from % w, y: Math.floor(r.from / w) };
    const toXY = { x: r.to % w, y: Math.floor(r.to / w) };
    expect(Math.abs(fromXY.x - toXY.x) + Math.abs(fromXY.y - toXY.y)).toBe(1);
    for (const set of hit.d.sets) {
      expect(set.type).toBe("known");
      expect(hit.state.known[r.to] & (1 << set.bit)).toBeTruthy();
    }
  });

  it("an arrowMask firing propagates the superset's exclusions down the arrow", () => {
    const hit = firingAt("arrowMask");
    const r = hit.d.reason;
    if (r.kind !== "arrowMask") throw new Error("the pin opens with another firing");
    expect(hit.d.pos).toBe(r.to); // the subset loses the letters
    for (const set of hit.d.sets) {
      expect(set.type).toBe("cleared");
      // The letter is ruled out of the superset `from`.
      expect(hit.state.mask[r.from] & (1 << set.bit)).toBeFalsy();
    }
  });

  it("a collapse firing's survivors really agree on every decided letter", () => {
    const hit = firingAt("collapse");
    const r = hit.d.reason;
    if (r.kind !== "collapse") throw new Error("the pin opens with another firing");
    expect(r.survivors.length).toBeGreaterThan(0);
    for (const set of hit.d.sets) {
      const b = 1 << set.bit;
      if (set.type === "known") {
        // every surviving set contains the letter
        for (const v of r.survivors) expect(v & b).toBeTruthy();
      } else {
        // no surviving set contains it
        for (const v of r.survivors) expect(v & b).toBeFalsy();
      }
    }
  });

  it("a hidden single places a set whose only candidate cell is the target", () => {
    const hit = firingAt("hiddenSingle");
    const r = hit.d.reason;
    if (r.kind !== "hiddenSingle") throw new Error("the pin opens with another firing");
    // The set can go in exactly one cell — the target — per the shallow aid.
    const cells = candidateCells(withMarks(hit.state, hit.d), r.value);
    expect(cells).toEqual([hit.d.pos]);
    // After the firing the cell holds exactly `value`.
    const after = applyFiring(hit.state, hit.d);
    expect(after.known[hit.d.pos]).toBe(r.value);
    expect(after.mask[hit.d.pos]).toBe(r.value);
  });

  it("the cube's last-place firing is a hidden single once its rule-outs are marked", () => {
    // The cube finds a set with one cell left that the board does not show; the
    // rule-outs it places are what make the aid show it.
    const hit = firingAt("cubeLastPlace");
    const r = hit.d.reason;
    if (r.kind !== "hiddenSingle") throw new Error("the pin opens with another firing");
    expect(candidateCells(hit.state, r.value).length).toBeGreaterThan(1);
    expect(candidateCells(withMarks(hit.state, hit.d), r.value)).toEqual([hit.d.pos]);
  });
});

describe("candidateCells (reference aid + hidden single)", () => {
  it("only lists cells where the set breaks no visible rule, and a placed set returns its home", () => {
    for (let s = 0; s < 20; s++) {
      const state = gen(`cc-${s}`);
      for (let v = 0; v < 16; v++) {
        const cells = candidateCells(state, v);
        for (const i of cells) {
          // Either the cell already holds v, or v is consistent with its marks.
          const decided = state.known[i] === state.mask[i];
          if (decided) {
            expect(state.known[i]).toBe(v);
          } else {
            expect(state.known[i] & v).toBe(state.known[i]); // has every known letter
            expect(v & state.mask[i]).toBe(v); // no cleared letter
          }
        }
      }
      // A given (decided) cell's own value lists that cell among its candidates.
      for (let i = 0; i < 16; i++) {
        if (state.known[i] === state.mask[i]) {
          expect(candidateCells(state, state.known[i])).toContain(i);
        }
      }
      // A placed set can go nowhere else — its candidate cells are all decided.
      const placedValues = new Set<number>();
      for (let i = 0; i < 16; i++)
        if (state.known[i] === state.mask[i]) placedValues.add(state.known[i]);
      for (const v of placedValues)
        for (const i of candidateCells(state, v))
          expect(state.known[i]).toBe(state.mask[i]);
    }
  });

  it("candidateSets is the reverse: a cell's still-possible sets, none placed elsewhere", () => {
    for (let s = 0; s < 20; s++) {
      const state = gen(`cs-${s}`);
      for (let i = 0; i < 16; i++) {
        const sets = candidateSets(state, i);
        if (state.known[i] === state.mask[i]) {
          expect(sets).toEqual([state.known[i]]); // decided → just its own set
          continue;
        }
        for (const v of sets) {
          // Consistent with the cell, and reciprocally the cell is a candidate.
          expect(candidateCells(state, v)).toContain(i);
        }
      }
    }
  });

  it("pickExclusion returns a competitor a visible rule really blocks", () => {
    let checked = 0;
    for (let s = 0; s < 40 && checked < 5; s++) {
      let state = gen(`px-${s}`);
      for (let step = 0; step < 200; step++) {
        const plan = deduceHintPlan(state);
        const d = plan.deductions[0];
        if (!d) break;
        if (d.reason.kind === "collapse") {
          const ex = pickExclusion(state, d.pos, d.reason.survivors);
          if (ex) {
            checked++;
            // The competitor is not a survivor, and its block is real.
            expect(d.reason.survivors).not.toContain(ex.value);
            if (ex.block.kind === "placed") {
              expect(state.known[ex.block.cell]).toBe(state.mask[ex.block.cell]);
              expect(state.known[ex.block.cell]).toBe(ex.value);
            } else {
              expect(whyCantPlace(state, d.pos, ex.value)).not.toBeNull();
            }
          }
        }
        state = applyFiring(state, d);
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
});

describe("hint", () => {
  it("narrates each firing with premise and conclusion, and highlights", () => {
    const state = gen("narrate-a");
    const res = subsetsGame.hint?.(state);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    for (const step of res.steps) {
      expect(step.explanation.length).toBeGreaterThan(20);
      const marks = stepMarks(step);
      expect(marks.of("ring", SLOT).length + marks.of("ring", CELL).length).toBe(1);
      // Every leg is one slot or one rule-out with its own action; the lead leg
      // also names the highlighted thing it reasons from (attention → deduction
      // → action).
      expect(step.explanation).toMatch(
        step.move.kind === "rule"
          ? /rules .* out of this cell/
          : /(mark .*present|clear)/i,
      );
      if (!step.continuesPrevious) {
        expect(step.explanation).toMatch(/outlined (cell|set)/i);
      }
    }
  });

  it("groups a multi-letter firing into one continuesPrevious journey", () => {
    // A firing that decides >1 letter is emitted as a lead + continuation legs
    // on one cell, each ringing its own letter.
    const { state, steps } = pinned("severalLetters");
    // The opening firing is the first one hint emits; its legs 2+ are flagged.
    const firstLen = deduceHintPlan(state).deductions[0].sets.length;
    for (let k = 1; k < firstLen; k++) {
      expect(steps[k].continuesPrevious).toBe(true);
      const [slot] = stepMarks(steps[k]).of("ring", SLOT);
      const [leadSlot] = stepMarks(steps[0]).of("ring", SLOT);
      const move = steps[k].move;
      expect({ x: slot.x, y: slot.y }).toEqual({ x: leadSlot.x, y: leadSlot.y });
      expect(move.kind === "set" && slot.bit === move.bit).toBe(true);
    }
    expect(steps[0].continuesPrevious).toBeUndefined();
  });

  it("counts a solved board as finished, so the midend refuses it", () => {
    const state = gen("refuse-solved");
    const solved = subsetsGame.solve?.(state, state);
    if (!solved?.ok) throw new Error("solve refused");
    expect(subsetsGame.status(subsetsGame.executeMove(state, solved.move))).toBe(
      "solved",
    );
  });

  it("flags a rule-violating board, so the midend refuses it", () => {
    // Place one set-value into two decided cells: a duplicate findMistakes flags.
    const state = gen("refuse-dup");
    const { solved } = solveCopy(state);
    // Copy one solved blank cell's value onto another blank cell so the value
    // appears twice.
    const blanks: number[] = [];
    for (let i = 0; i < P.w * P.h; i++) if (!state.immutable[i]) blanks.push(i);
    const dup = cloneState(state);
    dup.known[blanks[0]] = solved.known[blanks[1]];
    dup.mask[blanks[0]] = solved.mask[blanks[1]];
    dup.known[blanks[1]] = solved.known[blanks[1]];
    dup.mask[blanks[1]] = solved.mask[blanks[1]];
    expect(findMistakes(dup).length).toBeGreaterThan(0);
  });

  it("refuses honestly on a wrong-but-locally-clean mark", () => {
    const state = gen("refuse-clean");
    const { solved } = solveCopy(state);
    // Set one letter of a blank cell to the opposite of the solution, leaving
    // the cell otherwise undecided — no local rule breaks, findMistakes empty.
    let wrong: SubsetsState | null = null;
    for (let i = 0; i < P.w * P.h && !wrong; i++) {
      if (state.immutable[i]) continue;
      for (let b = 0; b < P.n; b++) {
        const bit = 1 << b;
        const w2 = cloneState(state);
        if (solved.known[i] & bit) {
          // solution has it → clear it (wrong)
          w2.known[i] &= ~bit;
          w2.mask[i] &= ~bit;
        } else {
          // solution lacks it → mark known (wrong)
          w2.known[i] |= bit;
          w2.mask[i] |= bit;
        }
        // Cell must stay undecided so no local rule fires.
        if (w2.known[i] !== w2.mask[i] && findMistakes(w2).length === 0) {
          wrong = w2;
          break;
        }
      }
    }
    expect(wrong).not.toBeNull();
    if (!wrong) return;
    const res = subsetsGame.hint?.(wrong);
    expect(res?.ok).toBe(false);
    if (res?.ok !== false) return;
    expect(res.error).toBe(CONTRADICTION_UNLOCALIZED);
  });
});

describe("hintKeepTrack", () => {
  const step = {
    move: { kind: "set" as const, type: "known" as const, pos: 5, bit: 2 },
    rung: "collapse" as const,
    explanation: "",
  };
  it("completes on the exact letter toggle, off otherwise", () => {
    expect(
      subsetsGame.hintKeepTrack?.(
        { kind: "set", type: "known", pos: 5, bit: 2 },
        step,
        {} as SubsetsState,
      ),
    ).toBe("completed");
    expect(
      subsetsGame.hintKeepTrack?.(
        { kind: "set", type: "cleared", pos: 5, bit: 2 },
        step,
        {} as SubsetsState,
      ),
    ).toBe("off");
    expect(
      subsetsGame.hintKeepTrack?.(
        { kind: "set", type: "known", pos: 6, bit: 2 },
        step,
        {} as SubsetsState,
      ),
    ).toBe("off");
  });
});

describe("highlights", () => {
  it("arrows point at a neighbor cell; a collapse points at tally sets", () => {
    const arrow = stepMarks(pinned("arrowKnown").step);
    expect(arrow.of("outline", CELL).length).toBeGreaterThan(0);
    expect(arrow.of("outline", TALLY_SET).length).toBe(0);
    expect(arrow.of("stripes", CELL).length).toBe(0);

    const collapse = stepMarks(pinned("collapse").step);
    expect(collapse.of("outline", TALLY_SET).length).toBeGreaterThan(0);
    // A collapse points at the surviving sets in the tally, plus at most one
    // grid cell — the excluded competitor's blocker.
    expect(collapse.of("outline", CELL).length).toBeLessThanOrEqual(1);
    expect(collapse.of("stripes", CELL).length).toBe(0);
  });

  it("a hidden single spotlights its set's one candidate cell (the target)", () => {
    const marks = stepMarks(pinned("hiddenSingle").step);
    const [slot] = marks.of("ring", SLOT);
    // The spotlight is the set's single home, which is the acted cell.
    expect(marks.of("stripes", CELL)).toEqual([{ x: slot.x, y: slot.y }]);
    expect(marks.of("outline", TALLY_SET).length).toBe(1);
  });
});

describe("reference-aid affordance", () => {
  it("clicking a tally set toggles its spotlight in the ui", () => {
    const state = gen("aff-a");
    const ui = subsetsGame.newUi(state);
    expect(ui.highlightSet).toBeNull();
    // The tally entry for set-value cn=x*h+y sits below the grid. Compute the
    // click point for cn=0 (top-left tally entry) from the render layout.
    const ts = 36;
    const cw = 2;
    const ch = 2;
    const tallyPoint = (cn: number): { x: number; y: number } => {
      const x = Math.floor(cn / state.h);
      const y = cn % state.h;
      return {
        x: x * (cw + 1) * ts + Math.floor(cw * ts * 0.75),
        y: Math.floor(y * 0.75 * ts) + (state.h + 2) * ch * ts,
      };
    };
    const ds = newDrawState(state, ts);
    const r1 = subsetsGame.interpretMove(state, ui, ds, tallyPoint(5), LEFT_BUTTON);
    expect(r1).toBe(UI_UPDATE);
    expect(ui.highlightSet).toBe(5);
    // Clicking the same entry again clears it.
    const r2 = subsetsGame.interpretMove(state, ui, ds, tallyPoint(5), LEFT_BUTTON);
    expect(r2).toBe(UI_UPDATE);
    expect(ui.highlightSet).toBeNull();
  });

  it("moving the cursor focuses that cell for the reverse aid, clearing a set spotlight", () => {
    const state = gen("aff-b");
    const ui = subsetsGame.newUi(state);
    ui.highlightSet = 3;
    const ds = newDrawState(state, 36);
    const r = subsetsGame.interpretMove(state, ui, ds, { x: 0, y: 0 }, CURSOR_DOWN);
    expect(r).toBe(UI_UPDATE);
    expect(ui.highlightSet).toBeNull();
    expect(ui.highlightCell).not.toBeNull();
  });

  it("clicking a cell's inspect icon focuses it without editing; editing a slot does not", () => {
    const state = gen("aff-c");
    const ui = subsetsGame.newUi(state);
    const ts = 36;
    const ds = newDrawState(state, ts);
    // The inspect icon sits in the margin above the block's left edge
    // (index.ts iconHit).
    const cell = 5;
    const cx = cell % state.w;
    const cy = Math.floor(cell / state.w);
    const bx = (cx * 3 + 0.5) * ts;
    const by = (cy * 3 + 0.5) * ts;
    const iconPoint = { x: bx + ts * 0.22, y: by - ts * 0.28 };
    const r = subsetsGame.interpretMove(state, ui, ds, iconPoint, LEFT_BUTTON);
    expect(r).toBe(UI_UPDATE);
    expect(ui.highlightCell).toBe(cell);
    // Clicking the same icon again clears it.
    expect(subsetsGame.interpretMove(state, ui, ds, iconPoint, LEFT_BUTTON)).toBe(
      UI_UPDATE,
    );
    expect(ui.highlightCell).toBeNull();
    // Editing a slot (the top-left slot center, below the icon) does NOT focus.
    const slotPoint = { x: cx * 3 * ts + ts, y: cy * 3 * ts + ts };
    subsetsGame.interpretMove(state, ui, ds, slotPoint, LEFT_BUTTON);
    expect(ui.highlightCell).toBeNull();
  });

  it("touching the reference aid dismisses a displayed hint (uiUpdateClearsHint)", () => {
    // A displayed hint suppresses the aid, so an aid click must clear the hint
    // or it does nothing visible.
    const midend = new Midend(subsetsGame);
    expect(midend.newGameFromId("4x4n4#aid-dismiss")).toBeNull();
    expect(midend.hint()).toBeNull();
    expect(midend.activeHintStep()).not.toBeNull();
    // A tally click is a UI_UPDATE; it must clear the hint.
    const ts = 36;
    const tallyPoint = {
      x: 0 * 3 * ts + Math.floor(2 * ts * 0.75),
      y: Math.floor(0 * 0.75 * ts) + (4 + 2) * 2 * ts,
    };
    midend.processInput(tallyPoint.x, tallyPoint.y, LEFT_BUTTON);
    expect(midend.activeHintStep()).toBeNull();
  });
});

describe("subgoal continuation narration", () => {
  it("every continuation leg names its referent (never a bare pronoun) and the subgoal", () => {
    let checked = 0;
    for (let s = 0; s < 30 && checked < 8; s++) {
      let state = gen(`cont-${s}`);
      for (let step = 0; step < 200; step++) {
        if (subsetsGame.status(state) === "solved") break;
        const res = subsetsGame.hint?.(state);
        if (!res?.ok) break;
        res.steps.forEach((st, k) => {
          if (!st.continuesPrevious) return;
          checked++;
          // The referent is explicit — "the outlined cell/set(s)" — never a
          // sentence-leading bare "It"/"They"/"None of them".
          expect(st.explanation).toMatch(/the outlined (cell|sets?)|outlined set/);
          expect(st.explanation).not.toMatch(/^(It|They|None of them)\b/);
          // A letter after a letter of the same cell continues that cell's
          // sub-goal; a firing's lead after its rule-outs states its own.
          const prev = res.steps[k - 1].move;
          if (st.move.kind === "set" && prev.kind === "set" && prev.pos === st.move.pos)
            expect(st.explanation).toMatch(
              /^…and (?:mark [A-Z] present|clear [A-Z]) in this cell too, for /,
            );
        });
        state = applyFiring(state, deduceHintPlan(state).deductions[0]);
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
});

describe("collapse exclusion (#2 — why not X)", () => {
  it("a collapse hint explains why a competitor set can't go there", () => {
    const { state, steps } = pinned("collapseWithCompetitor");
    const [d] = deduceHintPlan(state).deductions;
    // The firing's lead letter comes after the rule-outs it rests on.
    const lead = steps[d.marks.length];
    expect(lead.explanation).toMatch(/For instance, .* (can't go here|already placed)/);
    // The blocker cell is outlined so the clause has a referent, and only on
    // the leg that says the clause.
    expect(stepMarks(lead).of("outline", CELL).length).toBeGreaterThan(0);
    const next = steps[d.marks.length + 1];
    if (next?.continuesPrevious)
      expect(stepMarks(next).of("outline", CELL)).toEqual([]);
  });
});

describe("hint rendering (tier 2.5)", () => {
  /** The frame a pinned position's hint draws, through a real `Midend`. */
  function hintFrame(kind: Parameters<typeof pinned>[0]) {
    return renderPinnedHint(subsetsGame, pinned(kind));
  }

  it("an arrow hint frame paints the COL_HINT target slot and the COL_HINT_CELL neighbor", () => {
    const result = hintFrame("arrowKnown");
    const ops = result.recording.ops;
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT)).toBe(true);
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT_CELL)).toBe(true);
    expect(ops).toMatchSnapshot();
  });

  it("a collapse hint frame boxes the highlighted set in the tally band", () => {
    const result = hintFrame("collapse");
    // A collapse boxes the surviving sets in the tally (COL_HINT_CELL), and may
    // also frame one blocker cell for the "why not X" clause. A box rather
    // than a tint: the label's own color carries the state (error red, used-up
    // gray), so a fill behind it competes with what has to be read.
    expect(stepMarks(result.hint).of("outline", TALLY_SET).length).toBeGreaterThan(0);
    const ops = result.recording.ops;
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT)).toBe(true);
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT_CELL)).toBe(true);
    expect(ops).toMatchSnapshot();
  });

  it("a hidden-single hint frame hatches the set's one candidate cell", () => {
    const result = hintFrame("hiddenSingle");
    expect(stepMarks(result.hint).of("stripes", CELL)).toHaveLength(1);
    const ops = result.recording.ops;
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT)).toBe(true);
    // Striped like every other game's named line or region, one hatch per
    // letter square of the cell; the spotlight frame stays the aid's.
    const hatches = ops.filter((o) => o.op === "hatch");
    expect(hatches.length).toBe(4);
    expect(hatches.every((o) => o.color === COL_HINT)).toBe(true);
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT_SPOT)).toBe(false);
    expect(ops).toMatchSnapshot();
  });
});

describe("reference-aid rendering (tier 2.5)", () => {
  it("a spotlit set lights its candidate cells COL_HINT_SPOT and tints its tally entry", () => {
    // A partial board with a set clicked: drive redraw directly with the ui.
    let state = gen("aff-render");
    for (let step = 0; step < 5; step++) {
      const d = deduceHintPlan(state).deductions[0];
      if (!d) break;
      state = applyFiring(state, d);
    }
    // Pick an unplaced set with ≥2 candidate cells.
    let pick = -1;
    for (let v = 0; v < 16 && pick < 0; v++) {
      if (candidateCells(state, v).length >= 2) pick = v;
    }
    expect(pick).toBeGreaterThanOrEqual(0);
    const palette = subsetsGame.colors([0.827, 0.827, 0.827]);
    const rec = new RecordingDrawing(palette);
    const ds = newDrawState(state, 36);
    const ui = {
      cursor: newCursor(),
      highlightSet: pick,
      highlightCell: null,
      tallyCursor: null,
    };
    redraw(rec, ds, null, state, 0, ui, 0, 0, undefined, undefined);
    expect(rec.ops.some((o) => o.op === "rect" && o.color === COL_HINT_SPOT)).toBe(
      true,
    );
    expect(rec.ops.some((o) => o.op === "rect" && o.color === COL_HINT_CELL)).toBe(
      true,
    );
  });
});

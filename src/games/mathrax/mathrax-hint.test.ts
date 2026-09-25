/**
 * Mathrax explained-hint tests.
 *
 * Tier 1 — the recording solver attributes each elimination to **one** clue
 * acting on **one** cell and its replayed placements complete a generated board;
 * `hint` populates, strikes and places with quality-bar narration; the clue
 * sentence it speaks follows the board rather than the record; refusal on solved
 * / on mistakes; `hintKeepTrack` verdicts; resume to solved. Tier 2.5 — render
 * scenarios for both clue shapes: the arithmetic clue's diagonal pair (two
 * separate rings, because the pair shares no edge) and the `E`/`O` clue's block
 * of four.
 */
import { describe, expect, it } from "vitest";
import type { CandidateReading } from "../../engine/candidate-hint.ts";
import { randomNew } from "../../engine/random/index.ts";
import { expectRing, markSides } from "../../engine/testing/mark-shape.ts";
import {
  DEFAULT_BACKGROUND,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { newMathraxDesc } from "./generator.ts";
import { mathraxGame } from "./index.ts";
import { COL_HINT, COL_HINT_CELL, COL_PENCIL } from "./render.ts";
import { type HintReason, mathraxSolve, recordMathraxDeductions } from "./solver.ts";
import {
  clueIsParity,
  DIFF_TRICKY,
  diffToLevel,
  encodeParams,
  F_IMMUTABLE,
  type MathraxMove,
  type MathraxParams,
  type MathraxState,
  newState,
  newUi,
  status,
} from "./state.ts";

function gen(p: MathraxParams, seed: string) {
  const { desc } = newMathraxDesc(p, randomNew(seed));
  return { p, desc, st: newState(p, desc) };
}

// biome-ignore lint/suspicious/noExplicitAny: structural access to hint highlights/move in tests.
type AnyStep = any;

const NORMAL: MathraxParams = { o: 5, diff: "normal", options: 63 };
const TRICKY: MathraxParams = { o: 6, diff: "tricky", options: 63 };

const givens = (s: MathraxState): Uint8Array =>
  s.grid.map((d, i) => (s.flags[i] & F_IMMUTABLE ? d : 0));

// --- tier 1: recording solver ----------------------------------------------

describe("mathrax recording solver", () => {
  it("records a clue reason and its placements complete the board", () => {
    const { st } = gen(NORMAL, "rec-normal");
    const ops = recordMathraxDeductions(
      st.params.o,
      st.clues,
      givens(st),
      Math.min(diffToLevel(NORMAL.diff), DIFF_TRICKY),
    );
    expect(ops.length).toBeGreaterThan(0);
    expect(ops.some((o) => (o.reason as HintReason).kind === "clue")).toBe(true);

    const filled = givens(st);
    for (const op of ops)
      if (op.kind === "place") filled[op.y * st.params.o + op.x] = op.n;
    for (let i = 0; i < st.params.o * st.params.o; i++)
      expect(filled[i]).toBeGreaterThan(0);
  });

  it("gives one firing one clue acting on one cell", () => {
    // The whole reason the recording path differs from the generator's: the
    // deduction intersects up to four clues per cell at once, and a hint step
    // that narrated one of them while striking marks another ruled out would be
    // a lie. `group` is what a hint step is built from, so the property has to
    // hold per group (docs/games/hints.md § "A rung is not a premise").
    let groups = 0;
    for (const p of [NORMAL, TRICKY]) {
      for (let s = 0; s < 6; s++) {
        const { st } = gen(p, `firing-${p.o}-${s}`);
        const ops = recordMathraxDeductions(
          st.params.o,
          st.clues,
          givens(st),
          Math.min(diffToLevel(p.diff), DIFF_TRICKY),
        );
        const byGroup = new Map<number, typeof ops>();
        for (const op of ops) {
          if ((op.reason as HintReason).kind !== "clue") continue;
          const g = byGroup.get(op.group) ?? [];
          g.push(op);
          byGroup.set(op.group, g);
        }
        for (const g of byGroup.values()) {
          groups++;
          expect(new Set(g.map((o) => `${o.x},${o.y}`)).size).toBe(1);
          const clue = g.map((o) => JSON.stringify(o.reason));
          expect(new Set(clue).size).toBe(1);
        }
      }
    }
    expect(groups).toBeGreaterThan(50);
  });

  it("solves identically with and without a recorder", () => {
    // The recording path commits one clue's eliminations per firing where the
    // generator path sweeps the whole board, so it is a *finer attribution* of
    // the same eliminations and must reach the same verdict on the same grid.
    // The generator is solver-gated, so a divergence here would change which
    // boards exist (docs/games/solver-and-generator.md § "Solver-gated
    // generation"); the frozen fixture corpus checks the other side of it.
    let checked = 0;
    for (const p of [NORMAL, TRICKY]) {
      for (let s = 0; s < 6; s++) {
        const { st } = gen(p, `gate-${p.o}-${s}`);
        for (const cap of [0, 1, 2, 3]) {
          const plain = givens(st);
          const taped = givens(st);
          const verdict = mathraxSolve(p.o, plain, st.clues, cap);
          expect(mathraxSolve(p.o, taped, st.clues, cap, () => {})).toBe(verdict);
          expect([...taped]).toEqual([...plain]);
          checked++;
        }
      }
    }
    expect(checked).toBe(48);
  });
});

// --- tier 1: hint plan ------------------------------------------------------

function firstHint(st: MathraxState, reading?: CandidateReading) {
  const ui = { ...newUi(st), ...(reading ? { candidateReading: reading } : {}) };
  const res = mathraxGame.hint?.(st, undefined, ui);
  if (!res?.ok) throw new Error(`hint refused: ${res && !res.ok ? res.error : "—"}`);
  return res;
}

describe("mathrax hint", () => {
  it("populates before the first elimination, then places", () => {
    const { st } = gen(NORMAL, "hint-empty");
    const moves = firstHint(st, "populate").steps.map(
      (s) => (s.move as MathraxMove).type,
    );
    expect(moves.indexOf("pencilAll")).toBe(0);
    expect(moves.indexOf("pencilStrike")).toBeGreaterThan(0);
    expect(moves.includes("set")).toBe(true);
  });

  it("skips populate once notes are present", () => {
    const { st } = gen(NORMAL, "hint-pop");
    const populated = mathraxGame.executeMove(st, { type: "pencilAll" });
    expect((firstHint(populated).steps[0].move as MathraxMove).type).not.toBe(
      "pencilAll",
    );
  });

  it("every deduction conclusion uses the necessity voice", () => {
    for (const p of [NORMAL, TRICKY]) {
      const { st } = gen(p, `voice-${p.o}`);
      const populated = mathraxGame.executeMove(st, { type: "pencilAll" });
      const res = mathraxGame.hint?.(populated);
      expect(res?.ok).toBe(true);
      if (!res?.ok) continue;
      const modal = /can only|can't|must (be|cross)/i;
      const isSetup = (s: (typeof res.steps)[number]) =>
        (s.move as MathraxMove).type === "pencilAll" ||
        /clear the easy ones/.test(s.explanation);
      for (const s of res.steps) {
        if (isSetup(s)) continue;
        expect(s.explanation).toMatch(modal);
      }
    }
  });

  it("a clue-strike step's marks all lie in its one narrated cell", () => {
    let checked = 0;
    for (const p of [NORMAL, TRICKY]) {
      for (let s = 0; s < 8; s++) {
        const { st } = gen(p, `bleed-${p.o}-${s}`);
        const res = mathraxGame.hint?.(st);
        if (!res?.ok) continue;
        for (const step of res.steps as AnyStep[]) {
          if (step.move.type !== "pencilStrike") continue;
          if (!/clue/.test(step.explanation)) continue;
          const marks = step.move.marks as { x: number; y: number; n: number }[];
          expect(new Set(marks.map((m) => `${m.x},${m.y}`)).size).toBe(1);
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(20);
  });

  it("shades a clue by the cells that identify it", () => {
    // Mathrax's clue sits on an intersection, which the board has no mark for,
    // so the evidence is the cells the clue constrains: the diagonal pair for an
    // arithmetic clue, the block of four for `E`/`O`. Either set meets at
    // exactly one intersection, so the shading points at one clue.
    let pairs = 0;
    let quads = 0;
    for (const p of [NORMAL, TRICKY]) {
      for (let s = 0; s < 8; s++) {
        const { st } = gen(p, `area-${p.o}-${s}`);
        const res = mathraxGame.hint?.(st);
        if (!res?.ok) continue;
        for (const step of res.steps as AnyStep[]) {
          const area: { x: number; y: number }[] = step.highlights?.area ?? [];
          if (!/ clue/.test(step.explanation)) continue;
          if (/all four numbers around it/.test(step.explanation)) {
            expect(area).toHaveLength(4);
            const xs = new Set(area.map((a) => a.x));
            const ys = new Set(area.map((a) => a.y));
            expect(xs.size).toBe(2);
            expect(ys.size).toBe(2);
            expect(Math.max(...xs) - Math.min(...xs)).toBe(1);
            expect(Math.max(...ys) - Math.min(...ys)).toBe(1);
            quads++;
          } else {
            expect(area).toHaveLength(2);
            expect(Math.abs(area[0].x - area[1].x)).toBe(1);
            expect(Math.abs(area[0].y - area[1].y)).toBe(1);
            pairs++;
          }
        }
      }
    }
    expect(pairs).toBeGreaterThan(20);
    expect(quads).toBeGreaterThan(0);
  });

  it("names a digit across a clue only when one is there to see", () => {
    // The two clue sentences are chosen by the *working board*, not by what the
    // solver's cube happened to know: "the 3 across it" is a claim about a digit
    // the player can see. Checked on the step the plan offers first, which is
    // built against exactly the board this state shows.
    let named = 0;
    let open = 0;
    for (const p of [NORMAL, TRICKY]) {
      let st = gen(p, `across-${p.o}`).st;
      for (let k = 0; k < 120 && status(st) !== "solved"; k++) {
        const res = mathraxGame.hint?.(st);
        if (!res?.ok) break;
        const step = res.steps[0] as AnyStep;
        const m = /and the (\d) across it/.exec(step.explanation);
        const area: { x: number; y: number }[] = step.highlights?.area ?? [];
        if (m) {
          // The evidence pair is [acted-on cell, the cell across the clue].
          const across = area[1];
          expect(st.grid[across.y * p.o + across.x]).toBe(Number(m[1]));
          named++;
        } else if (/^Nothing open across the/.test(step.explanation)) {
          const across = area[1];
          expect(st.grid[across.y * p.o + across.x]).toBe(0);
          open++;
        }
        st = mathraxGame.executeMove(st, step.move);
      }
    }
    expect(named).toBeGreaterThan(0);
    expect(open).toBeGreaterThan(0);
  });

  it("reads correctly at the degenerate clue values", () => {
    // `=` is a subtraction clue of 0 and a `1÷` clue is a division of 1; both
    // mean "equal", and neither may say "differ by 0" or "divide to give 1".
    let equality = 0;
    let read = 0;
    for (const p of [NORMAL, TRICKY]) {
      for (let s = 0; s < 8; s++) {
        const { st } = gen(p, `degenerate-${p.o}-${s}`);
        const res = mathraxGame.hint?.(st);
        if (!res?.ok) continue;
        for (const step of res.steps) {
          expect(step.explanation).not.toMatch(/differ by 0|give 1\b|is 0 away/);
          read++;
          if (/the = clue|matches /.test(step.explanation)) equality++;
        }
      }
    }
    // A negative assertion passes over an empty walk, so count what it read —
    // and count the equality clue itself, since a corpus that stopped producing
    // one would leave the two arms it exercises unexercised while staying green.
    expect(read).toBeGreaterThan(100);
    expect(equality).toBeGreaterThan(0);
  });

  it("auto-pencil on folds away the trivial row/column eliminations", () => {
    const { st } = gen(NORMAL, "hint-autopencil");
    const populated = mathraxGame.executeMove(st, { type: "pencilAll" });
    const dupRe = /from the other cells they pass through/;
    const uiOn = newUi(populated);
    uiOn.autoPencil = true;
    const on = mathraxGame.hint?.(populated, undefined, uiOn);
    const uiOff = newUi(populated);
    uiOff.autoPencil = false;
    const off = mathraxGame.hint?.(populated, undefined, uiOff);
    expect(on?.ok && off?.ok).toBe(true);
    if (!on?.ok || !off?.ok) return;
    const dupCount = (r: typeof on) =>
      r.steps.filter((s) => dupRe.test(s.explanation)).length;
    expect(dupCount(off)).toBeGreaterThan(dupCount(on));
    expect(off.steps.length).toBeGreaterThan(on.steps.length);
  });

  it("refuses on a solved board and on a board with mistakes", () => {
    const { st } = gen(NORMAL, "hint-refuse");
    const r = mathraxGame.solve?.(st, st);
    if (!r?.ok || r.move.type !== "solve") throw new Error("solve failed");
    expect(mathraxGame.hint?.(mathraxGame.executeMove(st, r.move)).ok).toBe(false);

    const o = st.params.o;
    const empty = [...st.flags].findIndex((f) => !(f & F_IMMUTABLE));
    const wrong = (r.move.grid[empty] % o) + 1;
    const bad = mathraxGame.executeMove(st, {
      type: "set",
      x: empty % o,
      y: (empty / o) | 0,
      n: wrong,
      pencil: false,
    });
    expect(mathraxGame.hint?.(bad).ok).toBe(false);
  });
});

// --- tier 1: keep-track -----------------------------------------------------

describe("mathrax hintKeepTrack", () => {
  it("matches a populate step, rejects anything else", () => {
    const { st } = gen(NORMAL, "kt-pop");
    const res = firstHint(st, "populate");
    const step = res.steps.find((s) => (s.move as MathraxMove).type === "pencilAll");
    if (!step) throw new Error("no populate step");
    expect(mathraxGame.hintKeepTrack?.({ type: "pencilAll" }, step, st)).toBe(
      "completed",
    );
    expect(
      mathraxGame.hintKeepTrack?.(
        { type: "set", x: 0, y: 0, n: 1, pencil: false },
        step,
        st,
      ),
    ).toBe("off");
  });

  it("shrinks then finishes a multi-mark strike journey", () => {
    const { st } = gen(NORMAL, "kt-strike");
    const populated = mathraxGame.executeMove(st, { type: "pencilAll" });
    const res = mathraxGame.hint?.(populated);
    if (!res?.ok) throw new Error("hint refused");
    const step = res.steps.find(
      (s) =>
        (s.move as MathraxMove).type === "pencilStrike" &&
        (s.move as { type: "pencilStrike"; marks: unknown[] }).marks.length >= 2,
    ) as AnyStep | undefined;
    if (!step) throw new Error("no multi-mark strike step");

    const marks = [...step.move.marks] as { x: number; y: number; n: number }[];
    let cur = populated;
    for (let k = 0; k < marks.length; k++) {
      const mk = marks[k];
      const toggle: MathraxMove = {
        type: "set",
        x: mk.x,
        y: mk.y,
        n: mk.n,
        pencil: true,
      };
      expect(mathraxGame.hintKeepTrack?.(toggle, step, cur)).toBe(
        k === marks.length - 1 ? "completed" : "onTrack",
      );
      cur = mathraxGame.executeMove(cur, toggle);
    }
  });
});

// --- tier 1: resume to solved ----------------------------------------------

describe("mathrax hint resumes to solved", () => {
  for (const p of [NORMAL, TRICKY]) {
    it(`completes a fresh ${encodeParams(p, true)} board one recomputed hint at a time`, () => {
      let state = gen(p, `resume-${p.o}`).st;
      for (let moves = 0; moves < 800; moves++) {
        if (status(state) === "solved") return;
        const res = mathraxGame.hint?.(state);
        expect(res?.ok).toBe(true);
        if (!res?.ok) throw new Error(`gave up: ${res?.error}`);
        state = mathraxGame.executeMove(state, res.steps[0].move);
      }
      throw new Error("did not converge");
    });
  }
});

// --- tier 2.5: render ------------------------------------------------------

/** Scan seeds for an id whose hint, after populating, reaches a clue strike
 * matching `pred` — so the frame is deterministic without a known desc. */
function clueStrikeFrame(p: MathraxParams, pred: (s: string) => boolean): string {
  for (let s = 0; s < 40; s++) {
    const seed = `frame-${p.o}-${s}`;
    const { st } = gen(p, seed);
    const populated = mathraxGame.executeMove(st, { type: "pencilAll" });
    const res = mathraxGame.hint?.(populated);
    if (!res?.ok) continue;
    if (
      res.steps.some(
        (step) =>
          (step.move as MathraxMove).type === "pencilStrike" && pred(step.explanation),
      )
    )
      return `${encodeParams(p, true)}#${seed}`;
  }
  throw new Error(`no clue-strike frame found for ${encodeParams(p, true)}`);
}

describe("mathrax hint render", () => {
  it("an arithmetic clue rings its diagonal pair and strikes the candidate", () => {
    const pred = (e: string) => / clue/.test(e) && !/all four numbers/.test(e);
    const id = clueStrikeFrame(NORMAL, pred);
    const { recording, hint } = renderScenario({
      game: mathraxGame,
      id,
      defaultBackground: DEFAULT_BACKGROUND,
      moves: [{ type: "pencilAll" }],
      showHint: true,
      hintUntil: (s) => pred(s.explanation),
    });
    expect(hint?.explanation).toMatch(/ clue/);
    // Two **separate** rings, not one contour: the pair is diagonal, so the two
    // cells share no edge and joining them would outline board the clue does not
    // constrain (`hint-mark.ts`'s `outlineSides`).
    expectRing(recording.ops, COL_HINT_CELL, 2);
    // The struck candidate keeps its COL_PENCIL digit, crossed through in the
    // same color; the acted-on cell is ringed COL_HINT rather than filled.
    expect(recording.ops.some((o) => o.op === "line" && o.color === COL_PENCIL)).toBe(
      true,
    );
    expectRing(recording.ops, COL_HINT, (hint?.highlights as AnyStep)?.targets.length);
    // The clue circles are still drawn.
    expect(recording.ops.some((o) => o.op === "circle")).toBe(true);
    expect(recording.ops).toMatchSnapshot();
  });

  it("an even/odd clue outlines the block of four it constrains", () => {
    const pred = (e: string) => /all four numbers around it/.test(e);
    const id = clueStrikeFrame(TRICKY, pred);
    const { recording, hint } = renderScenario({
      game: mathraxGame,
      id,
      defaultBackground: DEFAULT_BACKGROUND,
      moves: [{ type: "pencilAll" }],
      showHint: true,
      hintUntil: (s) => pred(s.explanation),
    });
    expect(hint?.explanation).toMatch(/all four numbers around it are (even|odd)/);
    // A 2x2 block's contour is its eight outer sides — four per-cell rings would
    // be sixteen, so the count still tells the two apart.
    expect(markSides(recording.ops, COL_HINT_CELL)).toHaveLength(8);
    expectRing(recording.ops, COL_HINT, (hint?.highlights as AnyStep)?.targets.length);
    expect(recording.ops).toMatchSnapshot();
  });
});

// --- the clue shape helper --------------------------------------------------

describe("clueIsParity", () => {
  it("splits the clue kinds the two sentences need", () => {
    // 1..4 are the arithmetic types, 5 and 6 are E and O; 0 is no clue.
    expect([0, 1, 2, 3, 4, 5, 6].map(clueIsParity)).toEqual([
      false,
      false,
      false,
      false,
      false,
      true,
      true,
    ]);
  });
});

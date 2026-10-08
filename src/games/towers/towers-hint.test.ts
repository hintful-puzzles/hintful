/**
 * Towers explained-hint tests.
 *
 * Tier 1 — the recording solver records a reason per technique and its replayed
 * placements complete a generated board; `hint` populates, strikes and places
 * with quality-bar narration (indication → necessity voice); refusal on
 * solved / on mistakes; `hintKeepTrack` verdicts. Tier 2.5 — a render-scenario
 * snapshot of a clue-elimination journey frame (struck candidates `COL_HINT`,
 * the clue's line of sight hatched, clues still drawn).
 */
import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import {
  describeHintKindPins,
  describeHintPins,
} from "../../engine/testing/hint-positions.ts";
import { expectRing, isThin, markSides } from "../../engine/testing/mark-shape.ts";
import { opsOfKind } from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderPinnedHint,
} from "../../engine/testing/render-scenario.ts";
import { newTowersDesc } from "./generator.ts";
import { towersGame } from "./index.ts";
import { COL_HINT, COL_HINT_CELL, COL_PENCIL } from "./render.ts";
import { type HintReason, recordTowersDeductions } from "./solver.ts";
import {
  DIFF_EXTREME,
  type Difficulty,
  diffToLevel,
  newState,
  newUi,
  type TowersMove,
  type TowersParams,
  type TowersState,
} from "./state.ts";

function gen(w: number, diff: TowersParams["diff"], seed: string) {
  const p: TowersParams = { w, diff };
  const { desc } = newTowersDesc(p, randomNew(seed));
  return { p, desc, st: newState(p, desc) };
}

function solutionGrid(st: TowersState): number[] {
  const r = towersGame.solve?.(st, st);
  if (!r?.ok || r.move.type !== "solve") throw new Error("solve failed");
  return r.move.grid;
}

// biome-ignore lint/suspicious/noExplicitAny: structural access to hint highlights/move in tests.
type AnyStep = any;

// --- tier 1: recording solver ----------------------------------------------

describe("towers recording solver", () => {
  it("records reasons and its placements complete the board", () => {
    const { p, st } = gen(5, "easy", "rec-easy");
    const grid = Uint8Array.from(st.grid);
    const ops = recordTowersDeductions(
      st.w,
      st.clues,
      grid,
      Math.min(diffToLevel(p.diff), DIFF_EXTREME),
    );
    expect(ops.length).toBeGreaterThan(0);

    // Every op carries a discriminated reason.
    const kinds = new Set(ops.map((o) => (o.reason as HintReason).kind));
    // An easy board exercises the basic Towers + Latin techniques.
    expect(kinds.size).toBeGreaterThan(1);
    expect(
      [...kinds].some((k) => k === "facing" || k === "lineFull" || k === "lowerBound"),
    ).toBe(true);

    // Replaying the placements reconstructs the full (unique) solution.
    const filled = Uint8Array.from(st.immutable);
    for (const op of ops) if (op.kind === "place") filled[op.y * st.w + op.x] = op.n;
    for (let i = 0; i < st.w * st.w; i++) expect(filled[i]).toBeGreaterThan(0);
  });

  it("records the harder techniques on a Normal board", () => {
    const { p, st } = gen(6, "hard", "rec-hard");
    const grid = Uint8Array.from(st.grid);
    const ops = recordTowersDeductions(
      st.w,
      st.clues,
      grid,
      Math.min(diffToLevel(p.diff), DIFF_EXTREME),
    );
    const kinds = new Set(ops.map((o) => (o.reason as HintReason).kind));
    // Normal boards (`"hard"`) engage the set (naked-subset) deduction at some
    // point.
    expect(ops.length).toBeGreaterThan(0);
    expect(kinds.has("set") || kinds.has("arrangement")).toBe(true);
  });
});

// --- tier 1: hint plan ------------------------------------------------------

function firstHint(st: TowersState) {
  const res = towersGame.hint?.(st);
  if (!res) throw new Error("no hint method");
  return res;
}

describe("towers hint", () => {
  it("populates before the first elimination (forced placements may precede)", () => {
    // Notes are penciled in lazily: forced placements that need no notes
    // (extreme-clue lines, facing pairs) come first, and the populate step
    // appears only when an elimination first needs something to cross out — but
    // always *before* that first elimination.
    const { st } = gen(5, "easy", "hint-empty");
    const res = firstHint(st);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const moves = res.steps.map((s) => (s.move as TowersMove).type);
    const firstStrike = moves.indexOf("pencilStrike");
    const populateAt = moves.indexOf("pencilAll");
    // This board needs eliminations, so it both populates and strikes and places.
    expect(firstStrike).toBeGreaterThanOrEqual(0);
    expect(populateAt).toBeGreaterThanOrEqual(0);
    expect(moves.includes("set")).toBe(true);
    // The populate step precedes the first elimination.
    expect(populateAt).toBeLessThan(firstStrike);
  });

  it("cleans the obvious candidates right after populate (Mark-all parity)", () => {
    // The populate journey fills all candidates, then immediately strikes the
    // obvious ones — every height already standing in a cell's row/column from
    // the placements the plan made before populate — as one `continuesPrevious`
    // leg. So the plan never re-teaches those trivial eliminations and the notes
    // match what the adaptive "fill all pencil marks" control produces.
    const { st } = gen(5, "easy", "hint-empty");
    const res = firstHint(st);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const steps = res.steps as AnyStep[];
    const populateAt = steps.findIndex((s) => s.move.type === "pencilAll");
    expect(populateAt).toBeGreaterThanOrEqual(0);
    const clean = steps[populateAt + 1];
    expect(clean.move.type).toBe("pencilStrike");
    expect(clean.continuesPrevious).toBe(true);
    expect(clean.explanation).toMatch(/cross out|clear the easy/i);
    expect(clean.move.marks.length).toBeGreaterThan(0);
    // Every struck candidate is genuinely obvious: the value already stands in
    // that cell's row or column on the board the populate journey produced.
    const w = st.w;
    const grid = Int8Array.from(st.grid);
    // Replay the steps up to (and including) populate onto a working grid.
    for (let i = 0; i <= populateAt; i++) {
      const m = steps[i].move as TowersMove;
      if (m.type === "set") grid[m.y * w + m.x] = m.n;
    }
    for (const mk of clean.move.marks as { x: number; y: number; n: number }[]) {
      let seen = false;
      for (let k = 0; k < w; k++) {
        if (grid[mk.y * w + k] === mk.n || grid[k * w + mk.x] === mk.n) seen = true;
      }
      expect(seen).toBe(true);
    }
  });

  it("clue-strike marks never bleed outside the narrated clue's line (regression)", () => {
    // One recorded firing must cover a single clue, or a hint step narrates one
    // clue's line of sight while a struck mark sits on a *different* clue's
    // line. A clue-strike step hatches its clue's line; every struck mark must
    // lie within it.
    //
    // A forcing chain is the other shape: an ordered `area`, and the cell being
    // struck is deliberately **not** on it: the chain drives some other cell to
    // the value, and the conclusion loses it by lining up with that cell.
    // Selecting on the ordinal tests the distinction directly: a numbered area
    // *is* the chain.
    const diffs: Difficulty[] = ["easy", "hard", "extreme"];
    let checked = 0;
    let chainsChecked = 0;
    for (const diff of diffs) {
      for (let s = 0; s < 8; s++) {
        const { st } = gen(5, diff, `bleed-${diff}-${s}`);
        const res = towersGame.hint?.(st);
        if (!res?.ok) continue;
        for (const step of res.steps as AnyStep[]) {
          if (step.move.type !== "pencilStrike") continue;
          // A set across lines stripes the lines it confines a height in, and
          // strikes outside them by design.
          if (step.rung === "set") continue;
          const area: { x: number; y: number; order?: number }[] =
            step.highlights?.area ?? [];
          const line: { x: number; y: number }[] = step.highlights?.hatch ?? [];
          const isChain = area.some((a) => a.order !== undefined);
          if (!isChain && line.length === 0) continue; // dup continuation: no clue line
          for (const m of step.move.marks as { x: number; y: number }[]) {
            if (isChain) {
              // The other half of the invariant, asserted rather than skipped:
              // a conclusion sitting *on* its own chain would mean the chain
              // had already decided the cell it claims to be deducing.
              expect(area.some((a) => a.x === m.x && a.y === m.y)).toBe(false);
              chainsChecked++;
            } else {
              expect(line.some((a) => a.x === m.x && a.y === m.y)).toBe(true);
              checked++;
            }
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(0);
    // These fixed seeds reach forcing chains too (seven chain marks), so the
    // chain half of the invariant is asserted rather than merely reported.
    expect(chainsChecked).toBeGreaterThan(0);
  });

  it("skips populate once notes are present", () => {
    const { st } = gen(5, "easy", "hint-pop");
    const populated = towersGame.executeMove(st, { type: "pencilAll" });
    const res = firstHint(populated);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect((res.steps[0].move as TowersMove).type).not.toBe("pencilAll");
  });

  it("every deduction conclusion uses the necessity voice", () => {
    const { st } = gen(5, "easy", "hint-voice");
    const populated = towersGame.executeMove(st, { type: "pencilAll" });
    const res = firstHint(populated);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    // A deduction concludes either with a positive necessity ("can only be/sit"
    // for a placement) or with the necessity-voiced strike action ("we must
    // cross out the N") for an elimination — never a bare "is/are/stays".
    const modal = /can only|can't|must (be|stay|hold|cross)/i;
    for (const s of res.steps) {
      expect(s.explanation).toMatch(modal);
    }
  });

  it("auto-pencil on folds away the trivial row/column eliminations", () => {
    const { st } = gen(5, "easy", "hint-autopencil");
    const populated = towersGame.executeMove(st, { type: "pencilAll" });
    const uiOn = newUi(populated);
    uiOn.autoPencil = true;
    const on = towersGame.hint?.(populated, undefined, uiOn);
    expect(on?.ok).toBe(true);
    if (on?.ok) expect(on.steps.some((s) => s.rung === "dup")).toBe(false);

    const uiOff = newUi(populated);
    uiOff.autoPencil = false;
    const off = towersGame.hint?.(populated, undefined, uiOff);
    expect(off?.ok).toBe(true);
    if (off?.ok) {
      // With auto-pencil off the player must clean notes by hand, so the hint
      // teaches those eliminations as explicit continuation strikes.
      expect(off.steps.some((s) => s.rung === "dup")).toBe(true);
      expect(off.steps.length).toBeGreaterThan(on?.ok ? on.steps.length : 0);
    }
  });

  it("surfaces a naked single as the next move (suggestion 2)", () => {
    // A naked single out-ranks every other technique (including the extreme-clue
    // line fill), so a cell narrowed to one candidate is placed first.
    const { st } = gen(5, "easy", "hint-naked");
    const sol = solutionGrid(st);
    const w = st.w;
    const i = [...st.immutable].indexOf(0);
    const x = i % w;
    const y = (i / w) | 0;
    const v = sol[i];
    const populated = towersGame.executeMove(st, { type: "pencilAll" });
    // Strike every candidate but the solution height in this one cell, leaving a
    // naked single there.
    const marks = [];
    for (let n = 1; n <= w; n++) if (n !== v) marks.push({ x, y, n });
    const narrowed = towersGame.executeMove(populated, { type: "pencilStrike", marks });

    const res = towersGame.hint?.(narrowed);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    // The very next step places that cell (no populate needed — notes present).
    // Auto-pencil defaults off, so the placement carries `autoElim: false`.
    expect(res.steps[0].move).toEqual({
      type: "set",
      x,
      y,
      n: v,
      pencil: false,
      autoElim: false,
    });
    expect(res.steps[0].explanation).toMatch(/can only be|must be/);
  });

  it("counts a solved board as finished and flags a wrong tower, the boards the midend refuses", () => {
    const { st } = gen(5, "easy", "hint-refuse");
    const r = towersGame.solve?.(st, st);
    if (!r?.ok) throw new Error("solve failed");
    const solved = towersGame.executeMove(st, r.move);
    expect(towersGame.status(solved)).toBe("solved");

    const w = st.w;
    const empty = [...st.immutable].indexOf(0);
    const sol = (r.move as { type: "solve"; grid: number[] }).grid;
    const wrong = (sol[empty] % w) + 1;
    const bad = towersGame.executeMove(st, {
      type: "set",
      x: empty % w,
      y: (empty / w) | 0,
      n: wrong,
      pencil: false,
    });
    expect(towersGame.findMistakes?.(bad).length ?? 0).toBeGreaterThan(0);
  });
});

// --- tier 1: keep-track -----------------------------------------------------

const strikes = (step: AnyStep): number =>
  step.move.type === "pencilStrike" ? step.move.marks.length : 0;

/** A board's sum of clues, which splits the boards a scan deals in two. */
const clueSum = (s: TowersState): number => s.clues.reduce((a, b) => a + b, 0);

/**
 * Every rung on a position whose plan speaks it. A plan is asked under one
 * reading of the note-less cells, and `populate` and `note` are each spoken
 * under one of the two, so the boards are split between them.
 */
describeHintPins({
  game: towersGame,
  params: [
    { w: 5, diff: "easy" },
    { w: 5, diff: "hard" },
    { w: 5, diff: "extreme" },
  ],
  ui: (s) => ({
    ...newUi(s),
    candidateReading: clueSum(s) % 2 === 0 ? "populate" : "implicit",
  }),
  pins: {
    /** Held on 54 of 2058 positions walked. */
    populate: "5dh:///2/4///4/3///2//////3/2/",
    /** Held on 479 of 2058 positions walked. */
    clean: {
      id: "5dh:2/2/3/2//////4/////1///2/2/,l1h3c",
      moves:
        '[{"type":"set","x":0,"y":4,"n":5,"pencil":false,"autoElim":false},{"type":"pencilAll"}]',
    },
    /** Held on 499 of 2058 positions walked. */
    note: {
      id: "5dx:/1/2/2////////4//////4/2/",
      moves: [{ type: "set", x: 1, y: 0, n: 5, pencil: false, autoElim: false }],
    },
    /** Held on 1924 of 2058 positions walked. */
    dup: "5de:2/2/1/5/3/2/2/3/1/3/3/1/3/2/2/2/2/1/3/2",
    /** Held on 2046 of 2058 positions walked. */
    single: {
      id: "5dh:/3///1////3/2/////2///4//,g1h3d1c",
      moves:
        '[{"type":"set","x":4,"y":0,"n":5,"pencil":false,"autoElim":false},{"type":"pencilAdd","marks":[{"x":1,"y":1,"n":2},{"x":1,"y":1,"n":4}]},{"type":"set","x":1,"y":0,"n":2,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":2}]}]',
    },
    /** Held on 973 of 2058 positions walked. */
    regionsFull: {
      id: "5de:2/2/1/5/3/2/2/3/1/3/3/1/3/2/2/2/2/1/3/2",
      moves:
        '[{"type":"set","x":3,"y":0,"n":1,"pencil":false,"autoElim":false},{"type":"set","x":3,"y":1,"n":2,"pencil":false,"autoElim":false},{"type":"set","x":3,"y":2,"n":3,"pencil":false,"autoElim":false},{"type":"set","x":3,"y":3,"n":4,"pencil":false,"autoElim":false}]',
    },
    /** Held on 1442 of 2058 positions walked. */
    hiddenSingle: {
      id: "5dh:///3//3/////3///4///1///",
      moves:
        '[{"type":"set","x":4,"y":1,"n":5,"pencil":false,"autoElim":false},{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":4,"y":0,"n":5},{"x":0,"y":1,"n":5},{"x":1,"y":1,"n":5},{"x":2,"y":1,"n":5},{"x":3,"y":1,"n":5},{"x":4,"y":2,"n":5},{"x":4,"y":3,"n":5},{"x":4,"y":4,"n":5}]},{"type":"pencilStrike","marks":[{"x":3,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":3,"y":0,"n":4}]},{"type":"pencilStrike","marks":[{"x":0,"y":4,"n":5},{"x":0,"y":3,"n":5}]},{"type":"pencilStrike","marks":[{"x":0,"y":4,"n":4}]},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":5},{"x":1,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":4}]},{"type":"pencilStrike","marks":[{"x":1,"y":3,"n":5},{"x":2,"y":3,"n":5}]},{"type":"pencilStrike","marks":[{"x":0,"y":3,"n":4},{"x":1,"y":3,"n":4}]},{"type":"pencilStrike","marks":[{"x":0,"y":3,"n":3}]}]',
    },
    /** Held on 251 of 2058 positions walked. */
    set: {
      id: "5dx:///2/2//3/1////2//2////4//",
      moves:
        '[{"type":"set","x":2,"y":4,"n":5,"pencil":false,"autoElim":false},{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":5},{"x":2,"y":1,"n":5},{"x":2,"y":2,"n":5},{"x":2,"y":3,"n":5},{"x":0,"y":4,"n":5},{"x":1,"y":4,"n":5},{"x":3,"y":4,"n":5},{"x":4,"y":4,"n":5}]},{"type":"pencilStrike","marks":[{"x":3,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":4,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":1,"y":3,"n":5}]},{"type":"pencilStrike","marks":[{"x":1,"y":4,"n":4}]},{"type":"pencilStrike","marks":[{"x":0,"y":1,"n":5}]},{"type":"pencilStrike","marks":[{"x":0,"y":3,"n":5}]},{"type":"pencilStrike","marks":[{"x":4,"y":2,"n":5},{"x":3,"y":2,"n":5}]},{"type":"pencilStrike","marks":[{"x":4,"y":2,"n":4},{"x":3,"y":2,"n":4}]},{"type":"pencilStrike","marks":[{"x":4,"y":2,"n":3}]},{"type":"pencilStrike","marks":[{"x":3,"y":1,"n":4}]},{"type":"pencilStrike","marks":[{"x":4,"y":1,"n":4}]},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":4}]},{"type":"pencilStrike","marks":[{"x":0,"y":3,"n":1}]},{"type":"pencilStrike","marks":[{"x":0,"y":3,"n":2}]},{"type":"pencilStrike","marks":[{"x":1,"y":3,"n":4}]},{"type":"pencilStrike","marks":[{"x":2,"y":3,"n":4}]},{"type":"pencilStrike","marks":[{"x":3,"y":3,"n":4}]}]',
    },
    /** Held on 393 of 2058 positions walked. */
    forcing: {
      id: "5dx:2/2/3/2//////4/////1////2/,l1h3c",
      moves:
        '[{"type":"set","x":0,"y":4,"n":5,"pencil":false,"autoElim":false},{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":5},{"x":1,"y":0,"n":3},{"x":2,"y":0,"n":1},{"x":0,"y":1,"n":5},{"x":1,"y":1,"n":3},{"x":2,"y":1,"n":1},{"x":0,"y":2,"n":1},{"x":0,"y":2,"n":5},{"x":1,"y":2,"n":1},{"x":1,"y":2,"n":3},{"x":3,"y":2,"n":1},{"x":4,"y":2,"n":1},{"x":0,"y":3,"n":5},{"x":1,"y":3,"n":3},{"x":2,"y":3,"n":1},{"x":2,"y":4,"n":1},{"x":2,"y":4,"n":3},{"x":2,"y":4,"n":5},{"x":3,"y":4,"n":3},{"x":3,"y":4,"n":5},{"x":4,"y":4,"n":3},{"x":4,"y":4,"n":5}]},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":1}]},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":2}]},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":3}]},{"type":"set","x":0,"y":0,"n":4,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":4},{"x":2,"y":0,"n":4},{"x":3,"y":0,"n":4},{"x":4,"y":0,"n":4},{"x":0,"y":1,"n":4},{"x":0,"y":2,"n":4},{"x":0,"y":3,"n":4}]},{"type":"pencilStrike","marks":[{"x":1,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":2,"y":0,"n":5},{"x":2,"y":1,"n":5}]},{"type":"pencilStrike","marks":[{"x":3,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":4,"y":3,"n":5},{"x":4,"y":2,"n":5}]},{"type":"pencilStrike","marks":[{"x":4,"y":4,"n":4},{"x":4,"y":3,"n":4}]},{"type":"set","x":4,"y":0,"n":5,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":4,"y":1,"n":5}]},{"type":"set","x":2,"y":3,"n":5,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":1,"y":3,"n":5},{"x":3,"y":3,"n":5}]},{"type":"pencilStrike","marks":[{"x":4,"y":3,"n":1}]},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":2}]},{"type":"pencilStrike","marks":[{"x":1,"y":1,"n":4}]},{"type":"pencilStrike","marks":[{"x":2,"y":1,"n":2}]},{"type":"pencilStrike","marks":[{"x":3,"y":1,"n":3}]},{"type":"pencilStrike","marks":[{"x":3,"y":1,"n":4}]},{"type":"pencilStrike","marks":[{"x":4,"y":2,"n":3}]},{"type":"pencilStrike","marks":[{"x":3,"y":3,"n":3}]},{"type":"pencilStrike","marks":[{"x":3,"y":3,"n":4}]},{"type":"set","x":1,"y":3,"n":4,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":1,"y":2,"n":4}]}]',
    },
    /** Held on 57 of 2058 positions walked. */
    fullLine: "5de:2/2/1/5/3/2/2/3/1/3/3/1/3/2/2/2/2/1/3/2",
    /** Held on 107 of 2058 positions walked. */
    tallestNearest: "5de:2/3/1/2/3/2/1/4/3/2/2/4/1/4/2/2/2/4/1/2",
    /** Held on 138 of 2058 positions walked. */
    facing: "5dh:/2//2//3/4//2////3///3////,d2b3q",
    /** Held on 1034 of 2058 positions walked. */
    lineFull: {
      id: "5dx:////3/2/2/4/3//3/1////3/4///",
      moves: [{ type: "set", x: 0, y: 1, n: 5, pencil: false, autoElim: false }],
    },
    /** Held on 630 of 2058 positions walked. */
    lowerBound: "5dx:/2////4//4////2//4///3///2",
    /** Held on 968 of 2058 positions walked. */
    arrangement: {
      id: "5dh:///////1///3////2//2/4/1/,t3b1a",
      moves:
        '[{"type":"set","x":2,"y":4,"n":5,"pencil":false,"autoElim":false},{"type":"set","x":4,"y":3,"n":5,"pencil":false,"autoElim":false},{"type":"pencilAdd","marks":[{"x":0,"y":0,"n":1},{"x":0,"y":0,"n":2},{"x":0,"y":0,"n":4},{"x":0,"y":0,"n":5}]},{"type":"pencilAdd","marks":[{"x":1,"y":0,"n":1},{"x":1,"y":0,"n":2},{"x":1,"y":0,"n":3},{"x":1,"y":0,"n":4},{"x":1,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":5},{"x":1,"y":0,"n":5}]},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":4}]},{"type":"pencilAdd","marks":[{"x":4,"y":2,"n":1},{"x":4,"y":2,"n":2},{"x":4,"y":2,"n":3},{"x":4,"y":2,"n":4}]},{"type":"pencilAdd","marks":[{"x":3,"y":2,"n":2},{"x":3,"y":2,"n":3},{"x":3,"y":2,"n":4}]},{"type":"pencilStrike","marks":[{"x":4,"y":2,"n":4},{"x":3,"y":2,"n":4}]},{"type":"pencilStrike","marks":[{"x":4,"y":2,"n":3}]},{"type":"pencilAdd","marks":[{"x":4,"y":4,"n":2},{"x":4,"y":4,"n":4}]}]',
    },
  },
});

/** Positions on a board with every candidate penciled in first. */
const pinned = describeHintKindPins({
  game: towersGame,
  params: [{ w: 5, diff: "easy" }],
  opening: (): TowersMove[] => [{ type: "pencilAll" }],
  kinds: {
    strike: (step) => strikes(step) > 0,
    multiMarkStrike: (step) => strikes(step) >= 2,
    placement: (step) => step.move.type === "set",
    // A clue lower-bound elimination, which shades a line of sight.
    lowerBound: (step) => step.rung === "lowerBound",
  },
  pins: {
    /** Held on 300 of 600 positions walked. */
    strike: {
      id: "5de:4/3/1/2/2/1/2/2/3/2/3/3/2/4/1/2/2/2/1/3",
      moves:
        '[{"type":"pencilAll"},{"type":"set","x":2,"y":0,"n":5,"pencil":false,"autoElim":false},{"type":"set","x":0,"y":4,"n":5,"pencil":false,"autoElim":false},{"type":"set","x":4,"y":3,"n":5,"pencil":false,"autoElim":false}]',
    },
    /** Held on 122 of 600 positions walked. */
    multiMarkStrike: {
      id: "5de:4/3/1/2/2/1/2/2/3/2/3/3/2/4/1/2/2/2/1/3",
      moves:
        '[{"type":"pencilAll"},{"type":"set","x":2,"y":0,"n":5,"pencil":false,"autoElim":false},{"type":"set","x":0,"y":4,"n":5,"pencil":false,"autoElim":false},{"type":"set","x":4,"y":3,"n":5,"pencil":false,"autoElim":false}]',
    },
    /** Held on 300 of 600 positions walked. */
    placement: {
      id: "5de:2/2/1/5/3/2/2/3/1/3/3/1/3/2/2/2/2/1/3/2",
      moves: [{ type: "pencilAll" }],
    },
    /** Held on 81 of 600 positions walked. */
    lowerBound: {
      id: "5de:4/3/1/2/2/1/2/2/3/2/3/3/2/4/1/2/2/2/1/3",
      moves:
        '[{"type":"pencilAll"},{"type":"set","x":2,"y":0,"n":5,"pencil":false,"autoElim":false},{"type":"set","x":0,"y":4,"n":5,"pencil":false,"autoElim":false},{"type":"set","x":4,"y":3,"n":5,"pencil":false,"autoElim":false},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":5},{"x":1,"y":0,"n":5},{"x":3,"y":0,"n":5},{"x":4,"y":0,"n":5},{"x":0,"y":1,"n":5},{"x":2,"y":1,"n":5},{"x":4,"y":1,"n":5},{"x":0,"y":2,"n":5},{"x":2,"y":2,"n":5},{"x":4,"y":2,"n":5},{"x":0,"y":3,"n":5},{"x":1,"y":3,"n":5},{"x":2,"y":3,"n":5},{"x":3,"y":3,"n":5},{"x":1,"y":4,"n":5},{"x":2,"y":4,"n":5},{"x":3,"y":4,"n":5},{"x":4,"y":4,"n":5}]}]',
    },
  },
});

describe("towers hintKeepTrack", () => {
  it("matches a populate step", () => {
    const { st } = gen(5, "easy", "kt-pop");
    const res = firstHint(st);
    if (!res.ok) throw new Error("refused");
    const step = res.steps.find((s) => (s.move as TowersMove).type === "pencilAll");
    if (!step) throw new Error("no populate step");
    expect(towersGame.hintKeepTrack?.({ type: "pencilAll" }, step, st)).toBe(
      "completed",
    );
    expect(
      towersGame.hintKeepTrack?.(
        { type: "set", x: 0, y: 0, n: 1, pencil: false },
        step,
        st,
      ),
    ).toBe("off");
  });

  it("shrinks then finishes a multi-mark strike journey", () => {
    // A strike step with more than one mark, to exercise onTrack.
    const { state: populated, step } = pinned("multiMarkStrike");

    const total = (step.move as Extract<TowersMove, { type: "pencilStrike" }>).marks
      .length;
    let cur = populated;
    for (let k = 0; k < total; k++) {
      // Always strike the *current* first remaining mark (the step shrinks).
      const m = (step.move as Extract<TowersMove, { type: "pencilStrike" }>).marks[0];
      const toggle: TowersMove = { type: "set", x: m.x, y: m.y, n: m.n, pencil: true };
      // `hintKeepTrack` sees the PRE-move state (production passes the state the
      // move is applied to, before applying it — `Midend.processInput`), so
      // classify against `cur` *then* advance it.
      const verdict = towersGame.hintKeepTrack?.(toggle, step, cur);
      cur = towersGame.executeMove(cur, toggle);
      expect(verdict).toBe(k === total - 1 ? "completed" : "onTrack");
    }
    // The journey shrank as it was followed: only the final (just-completed)
    // mark remains — the midend advances past the step on "completed".
    expect(
      (step.move as Extract<TowersMove, { type: "pencilStrike" }>).marks.length,
    ).toBe(1);
  });

  it("a strike step rejects a non-target candidate and a re-add", () => {
    const { step, state } = pinned("strike");
    const m = (step.move as Extract<TowersMove, { type: "pencilStrike" }>).marks[0];
    // A toggle on a cell/candidate the step doesn't target is off-plan.
    const otherN = (m.n % 5) + 1;
    const nonTarget: TowersMove = {
      type: "set",
      x: m.x,
      y: m.y,
      n: otherN,
      pencil: true,
    };
    // Only off if (x,y,otherN) isn't itself one of the marks. `hintKeepTrack`
    // sees the PRE-move state (`state`). A step that struck every candidate in
    // the cell would leave nothing to reject, so the branch is asserted taken.
    const alsoStruck = (
      step.move as Extract<TowersMove, { type: "pencilStrike" }>
    ).marks.some((k) => k.x === m.x && k.y === m.y && k.n === otherN);
    expect(alsoStruck, "the step struck every candidate — no non-target left").toBe(
      false,
    );
    expect(towersGame.hintKeepTrack?.(nonTarget, step, state)).toBe("off");
  });

  it("a placement step matches the entered height", () => {
    const { step, state } = pinned("placement");
    const move = step.move as Extract<TowersMove, { type: "set" }>;
    expect(towersGame.hintKeepTrack?.(move, step, state)).toBe("completed");
    expect(
      towersGame.hintKeepTrack?.({ ...move, n: (move.n % 5) + 1 }, step, state),
    ).toBe("off");
  });

  it("a strike step never mixes heights; its narration names the struck height", () => {
    // A single clue firing can rule out *several* heights (the lower-bound rule
    // strikes both 4 and 5 along a line). Each height must be its own step so
    // the narration ("a tower of height 5…") matches what is crossed out — a
    // step striking 4 *and* 5 while the text says only 5 is the reported bug.
    // The further heights of one firing are continuation legs of one journey.
    let checked = 0;
    let sawJourneyLeg = false;
    for (let i = 0; i < 30 && checked < 40; i++) {
      const { st } = gen(5, "easy", `mix-${i}`);
      const pop = towersGame.executeMove(st, { type: "pencilAll" });
      const res = towersGame.hint?.(pop);
      if (!res?.ok) continue;
      for (const step of res.steps) {
        const m = step.move as TowersMove;
        if (m.type !== "pencilStrike") continue;
        checked++;
        if (step.continuesPrevious) sawJourneyLeg = true;
        const heights = new Set(m.marks.map((k) => k.n));
        expect(
          heights.size,
          `step "${step.explanation.slice(0, 48)}" mixes heights`,
        ).toBe(1);
        const n = m.marks[0].n;
        // Every elimination conclusion names the concrete struck height.
        expect(step.explanation).toContain(`cross out the ${n}`);
      }
    }
    expect(checked).toBeGreaterThan(0);
    // Multi-height firings exist on these boards, emitted as continuation legs.
    expect(sawJourneyLeg).toBe(true);
  });
});

// --- tier 2.5: render scenario ----------------------------------------------

/** The frame a pinned position's hint draws, through a real `Midend`. */
function hintFrame(kind: Parameters<typeof pinned>[0]) {
  const result = renderPinnedHint(towersGame, pinned(kind), {
    defaultBackground: DEFAULT_BACKGROUND,
  });
  return result;
}

describe("towers hint render", () => {
  it("a clue-elimination journey hatches the line of sight and strikes candidates", () => {
    const { recording, hint } = hintFrame("lowerBound");

    // The line of sight is hatched through both clue slots, in one strip; the
    // clue it is read from is the one cell outlined, COL_HINT_CELL.
    // Distinct cells, since a changed tile repaints the neighbors its tower
    // overlaps and so paints a hatched neighbor again.
    const hatches = opsOfKind(recording.ops, "hatch");
    expect(new Set(hatches.map((h) => `${h.x},${h.y}`)).size).toBe(5 + 2);
    for (const h of hatches) expect(h.color).toBe(COL_HINT);
    // One strip, read off the step's cells: a raised tower's hatch sits on its
    // top face, offset from the cell below it, so the drawn rects do not share
    // a coordinate.
    const line =
      (hint?.highlights as { hatch?: { x: number; y: number }[] }).hatch ?? [];
    expect(line).toHaveLength(5 + 2);
    const xs = new Set(line.map((c) => c.x));
    const ys = new Set(line.map((c) => c.y));
    expect(Math.min(xs.size, ys.size)).toBe(1);
    const evidence = markSides(recording.ops, COL_HINT_CELL);
    expect(evidence).toHaveLength(4);
    for (const s of evidence) expect(isThin(s)).toBe(true);
    // The struck candidate keeps its normal pencil color (legible) and is
    // crossed through with a same-color (COL_PENCIL) line — the strikethrough,
    // not a recolor, is the "ruled out" cue (highest contrast against the
    // lighter hint background).
    expect(recording.ops.some((o) => o.op === "line" && o.color === COL_PENCIL)).toBe(
      true,
    );
    expect(recording.ops.some((o) => o.op === "text" && o.color === COL_PENCIL)).toBe(
      true,
    );
    expect(recording.ops.some((o) => o.op === "text" && o.color === COL_HINT)).toBe(
      false,
    );
    // ...and the strike cell is **ringed** COL_HINT rather than filled with it.
    // A fill would hide the struck digit, making the candidate look
    // already-removed. The ring is the same mark a placement target gets, so a
    // strike is never identified *only* by a strikethrough the player has to
    // spot first.
    expectRing(recording.ops, COL_HINT, (hint?.highlights as AnyStep)?.targets.length);
    // Clues are still drawn (text).
    expect(recording.ops.some((o) => o.op === "text")).toBe(true);

    expect(recording.ops).toMatchSnapshot();
  });

  it("a placement step rings its target cell COL_HINT", () => {
    const { recording, hint } = hintFrame("placement");
    // A placement target is ringed COL_HINT, and carries no struck digit/line.
    expectRing(recording.ops, COL_HINT, (hint?.highlights as AnyStep)?.targets.length);
    expect(recording.ops.some((o) => o.op === "line" && o.color === COL_HINT)).toBe(
      false,
    );
  });
});

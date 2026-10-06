/**
 * Seismic's explained hint, measured over generated boards.
 *
 * Tiers (docs/games/testing.md § "The test tiers"): tier 1 for the plan, the
 * finders and the keep-track hooks; tier 2.5 for the frames the hint draws. The
 * cross-game guards enroll Seismic by its `hint` and its `candidateReading`, so
 * resume, purity, voice, length, continuity and the implicit reading's premise
 * duty are theirs and are not repeated here.
 */
import { describe, expect, it } from "vitest";
import { type CandidateReading, nakedSingles } from "../../engine/candidate-hint.ts";
import type { HintStep } from "../../engine/game.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { opsOfKind } from "../../engine/testing/recording-drawing.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import {
  areasOf,
  hiddenSingles,
  hintKeepTrack,
  refreshHintStep,
  type SeismicHint,
  type SeismicRung,
  starves,
  workingBoard,
} from "./hint.ts";
import { say } from "./hint-text.ts";
import { seismicGame } from "./index.ts";
import { COL_HINT, COL_HINT_CELL, COL_NUM_PENCIL } from "./render.ts";
import { placeNumber, regionsViable } from "./solver.ts";
import {
  areaBits,
  DIFF_EASY,
  DIFF_NORMAL,
  MODE_SEISMIC,
  MODE_TECTONIC,
  numBit,
  type SeismicMove,
  type SeismicParams,
  type SeismicState,
} from "./state.ts";

type Step = HintStep<SeismicMove, SeismicHint, SeismicRung>;

const isSolved = (s: SeismicState): boolean => seismicGame.status(s) === "solved";

/** Both modes at both tiers, plus a board wider than tall and one taller than
 * wide: the shared note helpers once scanned a square of the width. */
const SHAPES: SeismicParams[] = [
  { w: 6, h: 6, diff: DIFF_EASY, mode: MODE_SEISMIC },
  { w: 6, h: 6, diff: DIFF_EASY, mode: MODE_TECTONIC },
  { w: 6, h: 6, diff: DIFF_NORMAL, mode: MODE_SEISMIC },
  { w: 6, h: 6, diff: DIFF_NORMAL, mode: MODE_TECTONIC },
  { w: 7, h: 7, diff: DIFF_NORMAL, mode: MODE_SEISMIC },
  { w: 7, h: 7, diff: DIFF_NORMAL, mode: MODE_TECTONIC },
  { w: 8, h: 5, diff: DIFF_NORMAL, mode: MODE_SEISMIC },
  { w: 5, h: 8, diff: DIFF_NORMAL, mode: MODE_TECTONIC },
];

const SEEDS = ["sh-a", "sh-b", "sh-c"];

const READINGS: readonly CandidateReading[] = ["populate", "implicit"];

interface Board {
  label: string;
  params: SeismicParams;
  desc: string;
  state: SeismicState;
}

let corpus: Board[] | null = null;

function boards(): Board[] {
  corpus ??= SHAPES.flatMap((params) =>
    SEEDS.map((seed) => {
      const label = `${seismicGame.encodeParams(params, true)}#${seed}`;
      const { desc } = seismicGame.newDesc(params, randomNew(label));
      return { label, params, desc, state: seismicGame.newState(params, desc) };
    }),
  );
  return corpus;
}

function planOf(
  label: string,
  state: SeismicState,
  reading?: CandidateReading,
): Step[] {
  const ui = seismicGame.newUi(state);
  const r = seismicGame.hint?.(state, undefined, {
    ...ui,
    candidateReading: reading ?? ui.candidateReading,
  });
  if (!r?.ok) throw new Error(`${label}: hint refused: ${r?.error}`);
  return r.steps as Step[];
}

function highlightsOf(step: Step): SeismicHint {
  if (!step.highlights) throw new Error(`no highlights on "${step.explanation}"`);
  return step.highlights;
}

const cellIndex = (state: SeismicState, c: { x: number; y: number }): number =>
  c.y * state.w + c.x;

/**
 * Every blank cell's candidates by the solver's own rule: fill every blank cell
 * with what its area admits, then `placeNumber` every number on the board, which
 * strikes it wherever it reaches. What a note-less cell reads as, held to the
 * rule rather than to the hint's own `reach`.
 */
function byRule(state: SeismicState): Uint16Array {
  const b = workingBoard(state);
  for (let i = 0; i < b.grid.length; i++)
    if (b.grid[i] === 0) b.pencil[i] = areaBits(b.dsf.size(i));
  for (let i = 0; i < b.grid.length; i++)
    if (b.grid[i] !== 0) placeNumber(b, i % b.w, (i / b.w) | 0, b.grid[i]);
  return b.pencil;
}

/** The notes a blank cell reads as: its own, or where it has none, the rule's. */
function shownOf(state: SeismicState): Uint16Array {
  const rule = byRule(state);
  return state.pencil.map((p, i) => (state.grid[i] !== 0 ? 0 : p || rule[i]));
}

// --- the corpus -------------------------------------------------------------

/** Every premise the plan can speak. Adding one fails the census below until it
 * is listed here (docs/games/hints.md § "Census the reasons, not only the
 * rungs"). */
type Kind =
  | "populate"
  | "clean"
  | "note"
  | "singleton"
  | "naked"
  | "regionsFull"
  | "hidden"
  | "cull"
  | "starve"
  | "fold";

const isStarve = (step: Step): boolean => step.rung === "starve";

/** A step's premise, read off its rung and its move. */
function kindOf(step: Step): Kind {
  switch (step.rung) {
    // A strike from a cell with no notes is folded into what it leaves there.
    case "starve":
      return step.move.type === "pencilStrike" ? "starve" : "fold";
    case "dup":
      return "cull";
    case "single":
      return "naked";
    default:
      return step.rung;
  }
}

/** The sentence a step of `kind` speaks, where it is one sentence: no
 * sentence's words depend on which cells its references carry, only on how
 * many, so each is rebuilt at the step's own cell. Null for a kind whose words
 * vary with what it reads. */
function wordsOf(kind: Kind, m: SeismicMove, tectonic: boolean): string | null {
  if (kind === "populate") return say.populate;
  if (kind === "clean") return say.clean(tectonic)([]).text;
  if (m.type !== "set") return null;
  if (kind === "singleton") return say.singleton(m).text;
  if (kind === "naked") return say.naked(m, 9).text;
  if (kind === "regionsFull") return say.regionsFull(m, m.n, tectonic).text;
  if (kind === "hidden") return say.hidden([], m, m.n).text;
  return null;
}

/** What each reading must reach over the corpus. The populate reading writes
 * every note first, so it never writes one cell's; the implicit reading has
 * nothing to fill or, on a fresh board, to clean, and its singles on a
 * note-less cell are `regionsFull`. */
const REACHES: Record<CandidateReading, readonly Kind[]> = {
  populate: ["populate", "clean", "singleton", "naked", "hidden", "cull", "starve"],
  implicit: [
    "note",
    "singleton",
    "naked",
    "regionsFull",
    "hidden",
    "cull",
    "starve",
    "fold",
  ],
};

describe.each(READINGS)("the corpus, under the %s reading", (reading) => {
  it("finishes every board and reaches every premise", () => {
    const seen = new Set<Kind>();
    let steps = 0;
    for (const { label, state: start } of boards()) {
      let state = start;
      for (const step of planOf(label, start, reading)) {
        seen.add(kindOf(step));
        state = seismicGame.executeMove(state, step.move);
      }
      expect(isSolved(state), `${label} stalled`).toBe(true);
      steps += planOf(label, start, reading).length;
    }
    expect(steps, "the census walked almost nothing").toBeGreaterThan(500);
    expect([...seen].sort()).toEqual([...REACHES[reading]].sort());
  });

  it("needs a starved area on Normal boards and never on Easy ones", () => {
    // Easy boards are certified by the singles alone, and the starve rung waits
    // for every single to be gone, so a starved area on one means that broke.
    let normal = 0;
    for (const { label, params, state } of boards()) {
      const starved = planOf(label, state, reading).filter(isStarve);
      if (params.diff === DIFF_EASY) expect(starved, label).toEqual([]);
      else normal += starved.length;
    }
    expect(normal).toBeGreaterThan(20);
  });
});

// --- the trial rung ---------------------------------------------------------

/** The candidates the Normal rung itself rejects: place each, and ask whether
 * every area can still house every number it owes. */
function rungRejects(state: SeismicState): string[] {
  const b = workingBoard(state);
  const areas = new Int32Array(b.grid.length);
  const out: string[] = [];
  for (let c = 0; c < b.grid.length; c++) {
    if (b.grid[c] !== 0) continue;
    for (let n = 1; n <= 9; n++) {
      if (!(b.pencil[c] & numBit(n))) continue;
      const trial = { ...b, grid: b.grid.slice(), pencil: b.pencil.slice() };
      placeNumber(trial, c % b.w, (c / b.w) | 0, n);
      if (!regionsViable(trial, areas)) out.push(`${c}:${n}`);
    }
  }
  return out.sort();
}

describe("the starved-area finder", () => {
  it("strikes exactly what the trial rung rejects, wherever it is the next step", () => {
    // The populate reading, so every cell's notes are on the board and the
    // rung reads the same candidates the finder does.
    let points = 0;
    for (const { label, params, state: start } of boards()) {
      if (params.diff === DIFF_EASY) continue;
      let state = start;
      for (let move = 0; move < 500 && !isSolved(state); move++) {
        const plan = planOf(label, state, "populate");
        if (isStarve(plan[0])) {
          points++;
          const b = workingBoard(state);
          const areas = areasOf(b);
          // Where it fires, the singles are spent: that is when the trial rung
          // rejects nothing but a starved area's clashes.
          expect(
            nakedSingles(b.grid, b.pencil, b.w, { bit: numBit, values: 9 }),
          ).toEqual([]);
          expect(hiddenSingles(b, areas)).toEqual([]);
          // A set: two areas can each rule out the same note.
          const found = new Set<string>();
          for (const s of starves(b, areas))
            for (const c of s.targets) found.add(`${c}:${s.n}`);
          expect([...found].sort(), `${label} move ${move}`).toEqual(
            rungRejects(state),
          );
        }
        state = seismicGame.executeMove(state, plan[0].move);
      }
      expect(isSolved(state), `${label} never finished`).toBe(true);
    }
    expect(points, "no trial point was checked").toBeGreaterThan(20);
  });
});

// --- words and pictures -----------------------------------------------------

describe.each(
  READINGS,
)("each step's picture matches its words, under the %s reading", (reading) => {
  it("names, marks and strikes exactly what the deduction concerns", () => {
    const counted = new Map<Kind, number>();
    for (const { label, params, state: start } of boards()) {
      const tectonic = params.mode === MODE_TECTONIC;
      let state = start;
      for (const step of planOf(label, start, reading)) {
        const m = step.move;
        const hl = highlightsOf(step);
        const where = `${label}: "${step.explanation}"`;
        const kind = kindOf(step);
        const words = wordsOf(kind, m, tectonic);
        if (words !== null) expect(step.explanation, where).toBe(words);
        counted.set(kind, (counted.get(kind) ?? 0) + 1);
        const shown = shownOf(state);
        switch (kind) {
          case "populate":
          case "clean":
            break;
          case "singleton":
          case "naked":
          case "regionsFull":
          case "hidden": {
            if (m.type !== "set") throw new Error(where);
            const i = cellIndex(state, m);
            expect(hl.targets, where).toEqual([{ x: m.x, y: m.y }]);
            expect(hl.marks, where).toEqual([]);
            if (kind === "singleton")
              expect([state.dsf.size(i), m.n], where).toEqual([1, 1]);
            // "Every other number has been ruled out" is true of the notes shown.
            if (kind === "naked") expect(state.pencil[i], where).toBe(numBit(m.n));
            // …and of the rule, where the cell has none.
            if (kind === "regionsFull") {
              expect(state.pencil[i], where).toBe(0);
              expect(shown[i], where).toBe(numBit(m.n));
            }
            if (kind === "hidden") {
              expect(hl.area, where).toEqual([]);
              const area = (hl.hatch ?? []).map((c) => cellIndex(state, c));
              expect(area, where).toContain(i);
              expect(area.length, where).toBe(state.dsf.size(i));
              const rivals = area.filter(
                (j) => j !== i && state.grid[j] === 0 && shown[j] & numBit(m.n),
              );
              expect(rivals, where).toEqual([]);
            }
            break;
          }
          case "note": {
            // A note leg writes exactly what the rule leaves a note-less cell.
            if (m.type !== "pencilAdd") throw new Error(where);
            expect(new Set(m.marks.map((k) => cellIndex(state, k))).size, where).toBe(
              1,
            );
            const i = cellIndex(state, m.marks[0]);
            expect(state.pencil[i], where).toBe(0);
            const bits = m.marks.reduce((a, k) => a | numBit(k.n), 0);
            expect(bits, where).toBe(shown[i]);
            break;
          }
          case "cull": {
            // The leg after a placement strikes what `placeNumber` itself strikes.
            if (m.type !== "pencilStrike") throw new Error(where);
            const n = m.marks[0].n;
            const premise = say.cull(m.marks[0], n, tectonic).text;
            expect(step.explanation.slice(0, premise.length), where).toBe(premise);
            expect(step.continuesPrevious, where).toBe(true);
            expect(hl.area, where).toHaveLength(1);
            const p = cellIndex(state, hl.area[0]);
            expect(state.grid[p], where).toBe(n);
            const b = workingBoard(state);
            const before = b.pencil.slice();
            placeNumber(b, p % b.w, (p / b.w) | 0, n);
            const struck = m.marks.map((k) => `${cellIndex(state, k)}:${k.n}`).sort();
            const rule: string[] = [];
            for (let j = 0; j < b.grid.length; j++)
              if (j !== p && b.grid[j] === 0 && before[j] !== b.pencil[j])
                rule.push(`${j}:${n}`);
            expect(struck, where).toEqual(rule.sort());
            break;
          }
          case "starve":
          case "fold": {
            const area = (hl.hatch ?? []).map((c) => cellIndex(state, c));
            expect(hl.area, where).toEqual([]);
            expect(area.length, `${where}: a whole area`).toBe(state.dsf.size(area[0]));
            // The area's notes are the premise, so they are on the board.
            for (const j of area)
              if (state.grid[j] === 0) expect(state.pencil[j], where).not.toBe(0);
            for (const t of hl.targets)
              expect(area, `${where}: a struck cell sits outside`).not.toContain(
                cellIndex(state, t),
              );
            if (kind === "starve") {
              if (m.type !== "pencilStrike") throw new Error(where);
              const cells = (ps: readonly { x: number; y: number }[]) =>
                [...new Set(ps.map((c) => cellIndex(state, c)))].sort((a, b) => a - b);
              expect(
                cells(hl.targets),
                `${where}: the ringed cells are the struck ones`,
              ).toEqual(cells(m.marks));
              expect(new Set(m.marks.map((k) => k.n)).size, where).toBe(1);
            } else {
              // A starve on a note-less cell ends in what it leaves there.
              expect(hl.targets, where).toHaveLength(1);
              const i = cellIndex(state, hl.targets[0]);
              expect(state.pencil[i], where).toBe(0);
              const left =
                m.type === "set"
                  ? numBit(m.n)
                  : m.type === "pencilAdd"
                    ? m.marks.reduce((a, k) => a | numBit(k.n), 0)
                    : -1;
              expect(
                left & ~shown[i],
                `${where}: leaves only what the rule allows`,
              ).toBe(0);
              expect(left, where).not.toBe(shown[i]);
            }
            break;
          }
        }
        state = seismicGame.executeMove(state, m);
      }
      expect(isSolved(state), `${label}: following the plan finishes the board`).toBe(
        true,
      );
    }
    // The vacuity pair: enough steps, and every branch above taken.
    expect([...counted.values()].reduce((a, b) => a + b, 0)).toBeGreaterThan(1000);
    expect([...counted.keys()].sort()).toEqual([...REACHES[reading]].sort());
  });
});

// --- the player's own board -------------------------------------------------

/** A position for every rung, and the steps the following and frame tests
 * read, each pinned on a position whose hint opens with one. The 7x7 boards
 * are read with the notes penciled in first, which is where a plan speaks
 * `populate` and `clean`; the rest as the game reads them by default. */
const pinned = describeHintPins({
  game: seismicGame,
  params: SHAPES,
  seeds: 3,
  ui: (state) => ({
    ...seismicGame.newUi(state),
    ...(state.w === 7 ? { candidateReading: "populate" as const } : {}),
  }),
  kinds: {
    severalNotes: (step) =>
      step.move.type === "pencilStrike" && step.move.marks.length >= 2,
    placement: (step) => step.move.type === "set",
    starvedArea: (step) => isStarve(step) && step.move.type === "pencilStrike",
  },
  pins: {
    /** Held on 215 of 1378 positions walked. */
    severalNotes: {
      id: "6x6Tdh:2ab1a1a4a3ad2aabbc1bda2a,e43d5f2e5k",
      moves:
        '[{"type":"set","x":0,"y":0,"n":1,"pencil":false},{"type":"set","x":5,"y":5,"n":1,"pencil":false},{"type":"set","x":0,"y":2,"n":1,"pencil":false},{"type":"pencilAdd","marks":[{"x":1,"y":0,"n":4},{"x":1,"y":0,"n":5}]},{"type":"pencilAdd","marks":[{"x":1,"y":1,"n":4},{"x":1,"y":1,"n":5}]},{"type":"pencilAdd","marks":[{"x":2,"y":0,"n":1},{"x":2,"y":0,"n":2},{"x":2,"y":0,"n":3},{"x":2,"y":0,"n":4},{"x":2,"y":0,"n":5}]},{"type":"pencilAdd","marks":[{"x":2,"y":1,"n":1},{"x":2,"y":1,"n":2},{"x":2,"y":1,"n":3},{"x":2,"y":1,"n":4},{"x":2,"y":1,"n":5}]}]',
    },
    /** Held on 821 of 1378 positions walked. */
    placement: "6x6de:1ca2b2b2ba1a1c1aa1a2f3ac1a,a51a2g43i5k2",
    /** Held on 110 of 1378 positions walked. */
    starvedArea: {
      id: "8x5dh:b2ba4a2aa1aa1ba1aeb1a1aaac1a2aa,g2r3a5k",
      moves:
        '[{"type":"pencilAdd","marks":[{"x":4,"y":0,"n":1},{"x":4,"y":0,"n":2}]},{"type":"pencilAdd","marks":[{"x":4,"y":1,"n":1},{"x":4,"y":1,"n":2}]},{"type":"pencilAdd","marks":[{"x":4,"y":2,"n":1},{"x":4,"y":2,"n":3},{"x":4,"y":2,"n":4}]},{"type":"pencilAdd","marks":[{"x":2,"y":2,"n":1},{"x":2,"y":2,"n":2}]},{"type":"pencilAdd","marks":[{"x":3,"y":3,"n":1},{"x":3,"y":3,"n":2}]},{"type":"pencilAdd","marks":[{"x":3,"y":2,"n":2},{"x":3,"y":2,"n":3}]}]',
    },
    /** Held on 12 of 1378 positions walked. */
    populate: "7x7Tdh:bda1ab1c5a1b1a1ac2aa2a2c2ab1c1bac2b,5a3a1a4i5a3e1j2j5a5",
    /** Held on 418 of 1378 positions walked. */
    clean: {
      id: "7x7Tdh:bda1ab1c5a1b1a1ac2aa2a2c2ab1c1bac2b,5a3a1a4i5a3e1j2j5a5",
      moves: [{ type: "pencilAll" }],
    },
    /** Held on 346 of 1378 positions walked. */
    note: "6x6dh:1ca2b2b2ba1a1c1aa1a2f3ac1a,a51i4j5f3d2",
    /** Held on 1125 of 1378 positions walked. */
    dup: "6x6dh:1ca2b2b2ba1a1c1aa1a2f3ac1a,a51i4j5f3d2",
    /** Held on 36 of 1378 positions walked. */
    singleton: "7x7dh:1aa4ab9b5b2abccaa2bd1ea2ca3a,n2g4z",
    /** Held on 1189 of 1378 positions walked. */
    single: {
      id: "7x7Tdh:bc1a1abb1c1a2a1aaaaa2aa1b2d4a2aca1af,a34b1c5a2n3g1c2b5g",
      moves:
        '[{"type":"pencilAll"},{"type":"pencilStrike","marks":[{"x":0,"y":0,"n":3},{"x":0,"y":0,"n":4},{"x":0,"y":0,"n":5},{"x":3,"y":0,"n":1},{"x":3,"y":0,"n":2},{"x":3,"y":0,"n":4},{"x":3,"y":0,"n":5},{"x":4,"y":0,"n":1},{"x":4,"y":0,"n":2},{"x":6,"y":0,"n":1},{"x":6,"y":0,"n":2},{"x":0,"y":1,"n":3},{"x":1,"y":1,"n":3},{"x":1,"y":1,"n":4},{"x":1,"y":1,"n":5},{"x":3,"y":1,"n":2},{"x":3,"y":1,"n":3},{"x":3,"y":1,"n":4},{"x":3,"y":1,"n":5},{"x":5,"y":1,"n":1},{"x":5,"y":1,"n":2},{"x":6,"y":1,"n":1},{"x":1,"y":2,"n":5},{"x":2,"y":2,"n":5},{"x":3,"y":2,"n":2},{"x":3,"y":2,"n":5},{"x":4,"y":2,"n":2},{"x":4,"y":2,"n":3},{"x":5,"y":2,"n":2},{"x":5,"y":2,"n":3},{"x":6,"y":2,"n":3},{"x":2,"y":3,"n":3},{"x":3,"y":3,"n":3},{"x":4,"y":3,"n":3},{"x":6,"y":3,"n":1},{"x":6,"y":3,"n":3},{"x":6,"y":3,"n":5},{"x":2,"y":4,"n":2},{"x":3,"y":4,"n":2},{"x":4,"y":4,"n":2},{"x":4,"y":4,"n":3},{"x":5,"y":4,"n":1},{"x":5,"y":4,"n":3},{"x":5,"y":4,"n":5},{"x":2,"y":5,"n":2},{"x":4,"y":5,"n":2},{"x":5,"y":5,"n":1},{"x":2,"y":6,"n":2},{"x":3,"y":6,"n":2},{"x":4,"y":6,"n":2},{"x":6,"y":6,"n":1},{"x":6,"y":6,"n":5}]}]',
    },
    /** Held on 792 of 1378 positions walked. */
    regionsFull: "6x6de:1ca2b2b2ba1a1c1aa1a2f3ac1a,a51a2g43i5k2",
    /** Held on 942 of 1378 positions walked. */
    hidden: "5x8Tdh:baac2f3baaa1e2b1a5a2abf,2b1a3a5f5d1a14g2h4",
    /** Held on 688 of 1378 positions walked. */
    starve: {
      id: "8x5dh:b2ba4a2aa1aa1ba1aeb1a1aaac1a2aa,g2r3a5k",
      moves:
        '[{"type":"pencilAdd","marks":[{"x":4,"y":0,"n":1},{"x":4,"y":0,"n":2}]},{"type":"pencilAdd","marks":[{"x":4,"y":1,"n":1},{"x":4,"y":1,"n":2}]}]',
    },
  },
});

function boardWhere(pred: (b: Board) => boolean): Board {
  const found = boards().find(pred);
  if (!found) throw new Error("no such board in the corpus");
  return found;
}

describe("the player's own board", () => {
  it("resumes from notes the player has narrowed, and never re-fills them", () => {
    const { label, state: start } = boardWhere(
      (b) => b.params.diff === DIFF_NORMAL && b.params.mode === MODE_SEISMIC,
    );
    const solved = seismicGame.solve?.(start, start);
    if (!solved?.ok || solved.move.type !== "solve") throw new Error("unsolvable");
    const answer = solved.move.grid;

    let state = seismicGame.executeMove(start, { type: "pencilAll" });
    // Narrow every other empty cell to its answer and one wrong-but-possible note.
    let narrowed = 0;
    for (let i = 0; i < state.grid.length; i += 2) {
      if (state.grid[i] !== 0) continue;
      const others = state.pencil[i] & ~numBit(answer[i]);
      const keep = numBit(answer[i]) | (others & -others);
      for (let n = 1; n <= 9; n++) {
        if (state.pencil[i] & numBit(n) && !(keep & numBit(n))) {
          const x = i % state.w;
          const y = (i / state.w) | 0;
          state = seismicGame.executeMove(state, {
            type: "set",
            x,
            y,
            n,
            pencil: true,
          });
        }
      }
      narrowed++;
    }
    expect(narrowed).toBeGreaterThan(3);
    expect(seismicGame.findMistakes?.(state)).toEqual([]);

    for (const reading of READINGS) {
      let s = state;
      const first = planOf(label, s, reading);
      expect(first.some((step) => step.move.type === "pencilAll")).toBe(false);
      for (let move = 0; move < 500 && !isSolved(s); move++)
        s = seismicGame.executeMove(s, planOf(label, s, reading)[0].move);
      expect(isSolved(s), reading).toBe(true);
    }
  });

  it("follows a strike note by note, and refreshes a stored one to what is left", () => {
    const { state, step } = pinned("severalNotes");
    const original = step as Step;
    if (original.move.type !== "pencilStrike") throw new Error("unreachable");
    const [first, ...rest] = original.move.marks;
    const toggle: SeismicMove = { type: "set", ...first, pencil: true };

    // A copy, not a clone: a step's words carry functions, and keep-track
    // replaces the fields it changes rather than mutating them.
    const copy = (): Step => ({ ...original });
    const followed = copy();
    expect(hintKeepTrack(toggle, followed, state)).toBe("onTrack");
    expect(followed.move).toEqual({ type: "pencilStrike", marks: rest });
    expect(highlightsOf(followed).marks).toEqual(rest);
    // The words shrink with the marks they name.
    expect(followed.explanation).toBe(followed.words?.text);

    const after = seismicGame.executeMove(state, toggle);
    const refreshed = refreshHintStep(copy(), after);
    expect(refreshed?.move).toEqual({ type: "pencilStrike", marks: rest });
    expect(refreshed?.explanation).toBe(refreshed?.words?.text);
    // Toggling the same note again would put it back, which is not the hint.
    expect(hintKeepTrack(toggle, copy(), after)).toBe("off");
  });

  it("completes a placement only with the number it names", () => {
    const { state, step } = pinned("placement");
    if (step.move.type !== "set") throw new Error("unreachable");
    const other = step.move.n === 1 ? 2 : 1;
    expect(hintKeepTrack({ ...step.move }, step, state)).toBe("completed");
    expect(hintKeepTrack({ ...step.move, n: other }, step, state)).toBe("off");
  });
});

// --- the sentences ----------------------------------------------------------

describe("the sentences at their extremes", () => {
  const at = { x: 0, y: 0 };
  /** `count` distinct target cells. */
  const targets = (count: number) =>
    Array.from({ length: count }, (_, i) => ({ x: i, y: 1 }));

  it("counts one cell in the singular, and states each mode's own reach", () => {
    expect(say.cull(at, 1, false).text).toContain("within 1 cell of it");
    expect(say.cull(at, 9, false).text).toContain("within 9 cells of it");
    expect(say.cull(at, 3, true).text).not.toContain("within");
    expect(say.starve([at], 1, targets(1), false).text).toBe(
      "The striped area can put its 1 only in line with this cell and within 1 cell of it",
    );
    expect(say.starve([at], 4, targets(3), true).text).toBe(
      "The striped area can put its 4 only in a cell touching each of these",
    );
    expect(say.note(at, [2], false, true).text).toBe(
      "Only 2 isn't already in this cell's area or in a cell touching it, so pencil it in.",
    );
  });

  it("fits at a glance for every number, count and mode, conclusions included", () => {
    const all: string[] = [say.populate, say.singleton(at).text];
    // The longest ending the walk adds: a strike naming its notes, or on one
    // note-less cell, a fold keeping four values.
    const ending = (n: number, count: number): string =>
      count === 1
        ? ", so pencil in only 1, 2, 3 and 4."
        : `, so we must cross out ${say.starved(n, count)}.`;
    for (const tectonic of [false, true]) {
      all.push(
        say.clean(tectonic)([]).text,
        say.note(at, [1, 2, 3, 4], false, tectonic).text,
      );
      all.push(say.note(at, [], true, tectonic).text);
      for (let n = 1; n <= 9; n++) {
        const m = { ...at, n };
        all.push(
          say.naked(m, 9).text,
          say.hidden([at], at, n).text,
          say.regionsFull(at, n, tectonic).text,
        );
        all.push(
          `${say.cull(at, n, tectonic).text}, so we must cross out ${say.culled(n)}.`,
        );
        for (const count of [1, 2, 6])
          all.push(
            `${say.starve([at], n, targets(count), tectonic).text}${ending(n, count)}`,
          );
      }
    }
    expect(all.filter((s) => s.length > 120)).toEqual([]);
  });
});

// --- frames -----------------------------------------------------------------

describe("the frames a hint draws", () => {
  it("rings each struck cell, hatches the starved area, and strikes each note through", () => {
    const found = renderPinnedHint(seismicGame, pinned("starvedArea"));
    const { step } = found;
    const hl = step.highlights as SeismicHint;
    const ops = found.recording.ops;

    expectRing(ops, COL_HINT, hl.targets.length);
    // The area the sentence names is hatched, cell by cell, and outlined nowhere.
    const area = hl.hatch ?? [];
    expect(area.length).toBeGreaterThan(1);
    const hatched = opsOfKind(ops, "hatch");
    expect(new Set(hatched.map((h) => `${h.x},${h.y}`)).size).toBe(area.length);
    expect(ops.filter((o) => o.op === "rect" && o.color === COL_HINT_CELL)).toEqual([]);
    expect(
      ops.filter((o) => o.op === "line" && o.color === COL_NUM_PENCIL),
    ).toHaveLength(hl.marks.length);
    expect(ops).toMatchSnapshot();
  });
});

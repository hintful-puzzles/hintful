/**
 * Rome's explained hint: the shared candidate-elimination plan, walked over
 * arrows instead of digits.
 *
 * ## What this game was picked to press on, and what it found
 *
 * Rome is the collection's only candidate game whose candidates are **not
 * values** (its notes are direction bits) and whose uniqueness regions come
 * from a **`Dsf`** rather than from `y * w + x` arithmetic. Three of the four
 * things that were expected to chafe did not:
 *
 * - **The region adapter is six lines** (`romeRegions`), and
 *   `CellRegion.holdsEvery` turned out to be `size === 4` — which is the
 *   description's `onlyHome` guard. A region of four squares must hold all
 *   four arrows; a smaller one only forbids repeats. That is exactly the
 *   distinction the engine's flag draws, so the walk's hidden single in such
 *   an area is `onlyHome`, and the game writes no rung for it.
 * - **`NoteEncoding` fit a game whose values are bits**, near-identically:
 *   `bit` is a lookup and `values` is 4. What it was *missing* was a way to say
 *   what a blank square's full note set is, because Rome's is bounded by the
 *   grid edge and so differs square to square; that is now `NoteEncoding.all`.
 * - **The reachability techniques needed no rung shape of their own.** `loop`,
 *   `reach`, `pair` and `opposite` all strike candidates, so each is an
 *   ordinary strike whose *reason* happens to be a fact about a graph.
 *
 * ## Deduced from the player's notes
 *
 * `candidateHint` refuses on any mistake, and Rome's `findMistakes` flags both
 * a placed arrow the solution disagrees with **and** a square whose marks have
 * crossed out its answer. So wherever this runs, every placed arrow is right
 * and every square's marks still hold its answer, and the plan records
 * nothing: the walk reads the singles off the notes it shows, and each of
 * Rome's own strikes is the compiled technique run on them (`techniqueRung`,
 * docs/hints-candidates.md § "Deduce from the notes when the mistake check
 * vouches for them"). What a sentence names beyond the technique's terms (a
 * loop's chain, a goal's group) is read off the arrows placed.
 */

import {
  type CandidateHighlights,
  type CandidateMoveAdapter,
  type CandidatePlanPrefs,
  keepCandidateHintTrack,
  type Mark,
  refreshCandidateHintStep,
} from "../../engine/candidate-hint.ts";
import {
  CANDIDATE_RUNGS,
  type CandidateRung,
  type DupReason,
  type Firing,
  type NotesLadder,
  type PlanRung,
  runCandidatePlan,
  strikesOf,
  techniqueRung,
} from "../../engine/candidate-plan.ts";
import { describedSpace, rangeMask, step } from "../../engine/describe-runtime.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import type { Premise } from "../../engine/hint-text.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import {
  CellMarks,
  type Firing as LadderFiring,
  type Said,
  TIERS,
} from "../../engine/ladder-runtime.ts";
import type { CellRegion } from "../../engine/latin-hint.ts";
import type { Point } from "../../engine/types.ts";
import { say } from "./hint-text.ts";
import * as rome from "./rome.compiled.ts";
import { dealtOf, romeLadder } from "./solver.ts";
import {
  DIFFCOUNT,
  DIR_COUNT,
  dirBit,
  dirValue,
  placedValues,
  type RomeDir,
  type RomeMove,
  type RomeState,
  romeNotes,
  romeRegions,
} from "./state.ts";

/**
 * Rome's dialect of the three canonical candidate moves: its own are keyed by
 * `kind` rather than `type`, and its arrows are bits rather than values.
 *
 * `place` is supplied because the default builds a `{ type: "set" }` Rome
 * cannot execute; it ignores `autoElim` because Rome has no auto-pencil
 * preference for it to read.
 */
export const romeCandidateMoves: CandidateMoveAdapter<RomeMove> = {
  read: (m) => {
    if (m.kind === "place" && m.dir !== null)
      return { type: "set", x: m.x, y: m.y, n: dirValue(m.dir), pencil: false };
    if (m.kind === "pencil" && m.dir !== null)
      return { type: "set", x: m.x, y: m.y, n: dirValue(m.dir), pencil: true };
    if (m.kind === "pencilAll") return { type: "pencilAll" };
    if (m.kind === "pencilStrike") return { type: "pencilStrike", marks: [...m.marks] };
    if (m.kind === "pencilAdd") return { type: "pencilAdd", marks: [...m.marks] };
    // `solve`, and the two "clear this square" moves, are Rome's own.
    return null;
  },
  strike: (marks) => ({ kind: "pencilStrike", marks }),
  add: (marks) => ({ kind: "pencilAdd", marks }),
  populate: () => ({ kind: "pencilAll" }),
  place: (x, y, n) => ({ kind: "place", x, y, dir: dirBit(n) as RomeDir }),
  bit: dirBit,
};

/** Rome's hint highlights are the shared candidate shape: the evidence to
 * shade, the squares acted on, and the marks struck. */
export type RomeHint = CandidateHighlights;

/** Why the plan's next step is forced. */
type RomeHintReason =
  /** The square's notes have collapsed to one arrow. */
  | { kind: "single" }
  | { kind: "regionsFull" }
  /** The only square of a four-square area left to take arrow `n`. */
  | { kind: "hiddenSingle"; n: number; region: readonly number[] }
  /** Pointing that way joins a chain of arrows that leads back here. `path` is
   * that chain, from the square pointed at through to the square itself. */
  | { kind: "loop"; path: readonly number[] }
  /** The only arrow left anywhere that can point into `group`, the squares
   * already leading to one goal. `reads` is every square bordering the group,
   * whose marks show that none of the others can. */
  | { kind: "reach"; group: readonly number[]; reads: readonly Point[] }
  /** `(px, py)` can only point along this axis, and both its neighbors on it
   * share its area, so a neighbor pointing back would close a two-square
   * loop. */
  | { kind: "opposite"; px: number; py: number }
  /** Two squares of this area hold the same two arrows between them, so those
   * two arrows are spent. `values` is carried because a sentence built from
   * the struck marks would name only those the other squares still had. */
  | {
      kind: "pair";
      pair: readonly number[];
      values: readonly number[];
      region: readonly number[];
    };

/** Every rung a Rome step can be: the walk's own, and the kinds of
 * {@link RomeHintReason}. */
export const ROME_RUNGS = [
  ...CANDIDATE_RUNGS,
  "single",
  "regionsFull",
  "hiddenSingle",
  "loop",
  "reach",
  "opposite",
  "pair",
] as const;
export type RomeRung = (typeof ROME_RUNGS)[number];

const cellsOf = (w: number, cells: readonly number[]): Point[] =>
  cells.map((i) => ({ x: i % w, y: (i / w) | 0 }));

/** The sentence a placement speaks, at the placed square `m`. What it marks is
 * what it names: the square ringed, and the area a hidden single reasons over
 * striped (docs/hints.md § "Bind the words to the marks"). */
function narrate(reason: RomeHintReason | DupReason, m: Mark, w: number): Sentence {
  switch (reason.kind) {
    case "single":
      return say.single(m, m.n);
    case "regionsFull":
      return say.regionsFull(m, m.n);
    case "hiddenSingle":
      return say.hiddenSingle(cellsOf(w, reason.region), m, reason.n);
    default:
      throw new Error(`a ${reason.kind} deduction strikes`);
  }
}

/** A strike's premise, which the walk concludes with the move it makes.
 * `struck` is the struck arrows, all in one square except for a pair's.
 * `areaOf` is the area a square belongs to. */
function premise(
  reason: RomeHintReason | DupReason,
  struck: readonly Mark[],
  w: number,
  areaOf: (x: number, y: number) => readonly number[],
): Premise {
  const at = struck[0];
  const n = at.n;
  switch (reason.kind) {
    case "dup": {
      const placed = { x: reason.px, y: reason.py };
      const area = cellsOf(w, areaOf(reason.px, reason.py));
      return { premise: say.dup(area, placed, reason.n), where: say.dupWhere };
    }
    // The walk back to this square *is* the premise; the arrows on its squares
    // give its order.
    case "loop":
      return { premise: say.loop(cellsOf(w, reason.path), n, at) };
    case "reach":
      return {
        premise: say.reach(cellsOf(w, reason.group), at),
        struck: say.reachStruck,
      };
    case "opposite":
      return {
        premise: say.opposite(
          { x: reason.px, y: reason.py },
          cellsOf(w, areaOf(reason.px, reason.py)),
          n,
          axisOf(n),
        ),
      };
    case "pair":
      return {
        premise: say.pair(cellsOf(w, reason.pair), cellsOf(w, reason.region), [
          ...reason.values,
        ]),
        where: say.pairWhere,
      };
    default:
      throw new Error(`a ${reason.kind} deduction places`);
  }
}

/** The two arrows a square restricted to one axis may take — the premise an
 * `opposite` firing rests on, derived from the struck direction rather than
 * carried, because the technique only fires on an exact axis pair. */
function axisOf(n: number): number[] {
  return n <= 2 ? [1, 2] : [3, 4];
}

/** The terms a firing of technique `id` says (`says` in the description). */
function termsOf<K extends keyof rome.SaysById>(
  f: LadderFiring,
  _id: K,
): rome.SaysById[K]["terms"] {
  return (f.reasons[0] as Said<unknown, rome.SaysById[K]>).says.terms;
}

export function buildSteps(
  state: RomeState,
  { autoClean, reading }: CandidatePlanPrefs,
): HintStep<RomeMove, RomeHint, RomeRung>[] {
  const { w, h } = state;
  const steps: HintStep<RomeMove, RomeHint, PlanRung<RomeHintReason>>[] = [];
  const grid = placedValues(state);
  const pencil = Int32Array.from(state.pencil);
  const regionsOf = romeRegions(state);
  const areaOf = (x: number, y: number): readonly number[] =>
    Array.from(regionsOf(x, y)[0].cells);
  const enc = { ...romeNotes(w, h), values: DIR_COUNT };
  const dl = dealtOf(state);
  const sp = describedSpace(rome.units, w, h);
  const on: NotesLadder = {
    ladder: romeLadder(dl),
    marks: () => new CellMarks(sp, rangeMask(1, DIR_COUNT + 1), grid),
    enc,
    // A board does not keep the tier it was dealt at, so its hint may teach
    // any of them, as the solve it recorded did.
    caps: { [TIERS]: DIFFCOUNT },
  };
  const cellOf = (i: number): Point => ({ x: i % w, y: (i / w) | 0 });
  const isArrow = (i: number): boolean => grid[i] >= 1 && grid[i] <= DIR_COUNT;
  /** Where following the arrows placed from `from` stops: a goal, or a square
   * with no arrow yet. */
  const chainEnd = (from: number): number => {
    let at = from;
    for (let n = 0; isArrow(at) && n < grid.length; n++) {
      const next = step(sp, at, grid[at]);
      if (next < 0) break;
      at = next;
    }
    return at;
  };
  /** The squares from `from` along the arrows placed to `to`, both included:
   * the chain a loop sentence names. */
  const arrowPath = (from: number, to: number): number[] => {
    const path: number[] = [];
    for (
      let at = from;
      at >= 0 && path.length <= grid.length;
      at = step(sp, at, grid[at])
    ) {
      path.push(at);
      if (at === to) return path;
      if (!isArrow(at)) break;
    }
    throw new Error("rome: a loop with no chain back to its square");
  };
  const struck = (f: LadderFiring): Mark[] => strikesOf(f, w);

  type Rung = CandidateRung<RomeMove, RomeHint, RomeHintReason>;
  type RomeFiring = Firing<RomeMove, RomeHint, RomeHintReason>;
  const rung = (
    id: keyof rome.SaysById,
    legs: (f: LadderFiring, shown: ArrayLike<number>) => RomeFiring | null,
  ): Rung => techniqueRung<RomeMove, RomeHint, RomeHintReason>(on, id, legs);

  const loop = rung("loop", (f) => {
    const { c, q } = termsOf(f, "loop");
    return [{ strike: struck(f), reason: { kind: "loop", path: arrowPath(q, c) } }];
  });
  const pair = rung("pair", (f, shown) => {
    const { r, a, b } = termsOf(f, "pair");
    const values: number[] = [];
    for (let d = 1; d <= DIR_COUNT; d++) if (shown[a] & dirBit(d)) values.push(d);
    return [
      {
        strike: struck(f),
        reason: { kind: "pair", pair: [b, a], values, region: dl.area.cells[r] },
      },
    ];
  });
  const reach = rung("reach", (f) => {
    const { p, d } = termsOf(f, "reach");
    const goal = chainEnd(step(sp, p, d));
    const group: number[] = [];
    for (let c = 0; c < grid.length; c++) if (chainEnd(c) === goal) group.push(c);
    const border = new Set<number>();
    for (const i of group)
      for (const j of sp.adj4[i]) if (!group.includes(j)) border.add(j);
    return [
      {
        strike: struck(f),
        reason: { kind: "reach", group, reads: [...border].map(cellOf) },
      },
    ];
  });
  // Each neighbor pointed back into the two-way square is its own step.
  const opposite = rung("opposite", (f) => {
    const { c } = termsOf(f, "opposite");
    const reason: RomeHintReason = { kind: "opposite", ...pointOf(c, w) };
    const bySquare = new Map<number, Mark[]>();
    for (const m of struck(f)) {
      const i = m.y * w + m.x;
      bySquare.set(i, [...(bySquare.get(i) ?? []), m]);
    }
    return [...bySquare.values()].map((strike) => ({ strike, reason }));
  });

  runCandidatePlan<RomeMove, RomeHint, RomeHintReason, CellRegion>({
    w,
    steps,
    grid,
    pencil,
    enc,
    moves: romeCandidateMoves,
    autoClean,
    reading,
    label: "rome hint plan",
    regionsOf,
    // The ladder's order: a technique waits for every one before it.
    rungs: [loop, pair, reach, opposite],
    singleReason: (n, why) => {
      switch (why.kind) {
        case "naked":
          return { kind: "single" };
        case "regionsFull":
          return { kind: "regionsFull" };
        case "hidden":
          return { kind: "hiddenSingle", n, region: Array.from(why.region.cells) };
      }
    },
    placeWords: (m, reason) => ({ words: narrate(reason, m, w) }),
    strikeWords: (struck, reason) => premise(reason, struck, w, areaOf),
    conclude: say.conclude,
    notes: {
      populate: say.populate,
      cleanObvious: say.cleanObvious,
      note: (at, values, every) => say.note(at, values, every),
    },
  });
  return steps;
}

const pointOf = (i: number, w: number): { px: number; py: number } => ({
  px: i % w,
  py: (i / w) | 0,
});

/** Classify a player move against the displayed step (shared bookkeeping, in
 * Rome's move dialect). */
export function hintKeepTrack(
  m: RomeMove,
  step: HintStep<RomeMove, RomeHint, RomeRung>,
  state: RomeState,
): HintTrackVerdict {
  return keepCandidateHintTrack(m, step, state.pencil, state.w, romeCandidateMoves);
}

/** Re-validate a stored step against the current board before display. */
export function refreshHintStep(
  step: HintStep<RomeMove, RomeHint, RomeRung>,
  state: RomeState,
): HintStep<RomeMove, RomeHint, RomeRung> | null {
  return refreshCandidateHintStep(
    step,
    placedValues(state),
    state.pencil,
    state.w,
    romeCandidateMoves,
  );
}

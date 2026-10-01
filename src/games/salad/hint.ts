/**
 * Salad's explained hint — a **candidate-elimination** plan
 * (docs/games/hints.md § "Candidate-elimination games").
 *
 * Salad is the first candidate game whose value set is not uniform: the cube
 * reasons about the empty square as a symbol with a multiplicity (`solver.ts`,
 * `holeSymbol`), while on the *player's board* that symbol is one "might be
 * empty" X mark and, once settled, an empty-square marker rather than an entry.
 * The consequences run through this whole file, so they are worth stating once:
 *
 * 1. **A square's emptiness is taught as a marker, not as a note strike.** The
 *    cube does place the hole symbol, and does strike it — but the player
 *    settles a square with a cross or a ball, so a cross/ball is emitted as a
 *    marker step whose *why* is re-derived from the board the player can see:
 *    a line's counts first, then a note collapse, and only then the honest
 *    weaker "taking this row and column
 *    together" arm, which is the cube's own verdict read back as markers. The
 *    cube's eliminations *of* the hole symbol are dropped from the strike walk
 *    for the same reason: teaching one fact twice, as an X-mark strike and then
 *    as the marker it amounts to, would be noise.
 * 2. **Only the border deduction needs to be recorded.** The generic rungs
 *    record their placements and strikes through the shared solver; the
 *    recorder is threaded through the ABC End View border scan alone
 *    (`solver.ts`), which is the one Salad deduction that strikes candidates the
 *    player holds notes for.
 * 3. **The walk terminates on {@link latinholesCheck}, not "the grid is full".**
 *    A solved board legitimately leaves `order − nums` squares per line blank,
 *    so a fill-the-grid loop would never end.
 *
 * The reusable mechanics come from `engine/candidate-hint.ts` and
 * `engine/latin-hint.ts`; what lives here is the walk, the reason union and the
 * meaning — plus the `NoteEncoding` (`bit(n) = 1 << (n − 1)`, `values = nums + 1`)
 * that lets those helpers read Salad's notes at all.
 */

import {
  type CandidateHighlights,
  type CandidateMoveAdapter,
  type CandidatePlanPrefs,
  type Cell,
  candidateGesture,
  candidateHint,
  emitObviousCleanStep,
  keepCandidateHintTrack,
  type Mark,
  populateStep,
  refreshCandidateHintStep,
  regionReach,
} from "../../engine/candidate-hint.ts";
import {
  evidenceOf,
  type Firing,
  type Leg,
  populateThenClean,
  runLatinCandidatePlan,
} from "../../engine/candidate-plan.ts";
import type { DeductionRecord } from "../../engine/deduction-record.ts";
import {
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  narratedStep,
} from "../../engine/game.ts";
import type { PointerAction } from "../../engine/hint-gesture.ts";
import {
  latinPremise,
  narrateLatinReason,
  type Premise,
} from "../../engine/hint-text.ts";
import type { Narration } from "../../engine/hint-words.ts";
import type { LatinRepeatReason } from "../../engine/latin.ts";
import {
  type ForcingLink,
  hiddenSingleLine,
  type SingleReason,
} from "../../engine/latin-hint.ts";
import { noteEntryGesture } from "../../engine/note-taking-cell.ts";
import type { OrderedCell } from "../../engine/overlay-sidecar.ts";
import type { Point } from "../../engine/types.ts";
import { CLUE, saladVocab, say } from "./hint-text.ts";
import { type BorderReason, recordSaladDeductions } from "./solver.ts";
import {
  borderScanFor,
  CIRCLE,
  CROSS,
  clueSide,
  KEY_CIRCLE,
  KEY_CROSS,
  latinholesCheck,
  needsPencilFill,
  type SaladBoard,
  type SaladMark,
  type SaladMove,
  type SaladState,
  type SaladUi,
  saladNotes,
  saladRegions,
} from "./state.ts";

// --- reasons ---------------------------------------------------------------

/** Why the hint's next step is forced. Salad's own arms, plus the generic Latin
 * ones it inherits from the shared solver (narrated by `narrateLatinReason`). */
export type SaladReason =
  | BorderReason
  /** A line already carries every empty square it may hold, so the rest of it
   * must hold symbols. */
  | { kind: "countHolesDone"; line: "row" | "col"; index: number }
  /** A line's symbol-holding squares are all accounted for, so the rest of it
   * must be empty. `allPlaced` distinguishes "all its letters are written in"
   * from "we know which squares hold them". */
  | { kind: "countLettersDone"; line: "row" | "col"; index: number; allPlaced: boolean }
  /** The square's notes have come down to the empty-square mark alone. */
  | { kind: "crossNaked" }
  /** Tidy-up leg: squares just settled as holding a symbol keep no
   * "might be empty" mark. */
  | { kind: "circleXNote"; count: number }
  | SingleReason
  | { kind: "dup"; n: number; px: number; py: number }
  | { kind: "set"; cells: readonly Cell[] }
  /** The shared solver's forcing chain, with the chain it followed — the same
   * shape `latin.ts` records, so the numbered squares and the case-split
   * narration come for free. */
  | { kind: "forcing"; chain: ForcingLink[]; shares: "row" | "col" }
  /** The cube's own "this line has all its empty squares" strike of the hole
   * symbol. Recorded, and narratable, but the strike walk drops hole-symbol
   * strikes (file header, point 1), so it is reached only if that changes. */
  | LatinRepeatReason;

/** What a Salad hint step draws (docs/games/hints.md § "The element-type color
 * legend"): `area` is the deduction's evidence, `targets` the squares it acts
 * on, `marks` the notes it strikes, `clues` the border clues it reasons from,
 * and `ghost` the entry it is asking for, previewed in `COL_HINT` in the shape
 * of whichever of Salad's three moves it is. */
export interface SaladHint extends CandidateHighlights {
  clues: number[];
  ghost?: "cross" | "circle" | number;
}

type SaladOp = DeductionRecord & { reason: SaladReason };

// --- narration -------------------------------------------------------------

/**
 * Narrate *why* a placement or a marker is forced (docs/games/hints.md §
 * "Writing the narration"): lead with the indication, give the reasoning,
 * conclude in the necessity voice. `n` is the placed symbol; a marker reads
 * none. The words are [`hint-text.ts`](./hint-text.ts)'s.
 */
export function narrate(
  reason: SaladReason,
  at: Mark,
  state: { mode: number; order: number; nums: number },
): Narration {
  const { mode, order, nums } = state;
  const text = say(mode);
  switch (reason.kind) {
    case "countHolesDone":
      return text.countHolesDone(
        reason.line,
        hiddenSingleLine(reason.line, reason.index, order),
        order - nums,
        at,
      );
    case "countLettersDone":
      return text.countLettersDone(
        reason.line,
        hiddenSingleLine(reason.line, reason.index, order),
        reason.allPlaced,
        nums,
        at,
      );
    case "crossNaked":
      return text.crossNaked(at);
    case "borderNear":
    case "borderFar":
    case "circleXNote":
    case "repeatFull":
      throw new Error(`a ${reason.kind} deduction strikes`);
    default:
      return narrateLatinReason(reason, at, order, saladVocab(mode));
  }
}

/** The squares of the line a border clue looks along, nearest first. */
function clueLine(clue: number, o: number): Cell[] {
  const s = borderScanFor(clue, o);
  const cells: Cell[] = [];
  for (let i = s.start, k = 0; k < o; k++, i += s.step)
    cells.push({ x: i % o, y: (i / o) | 0 });
  return cells;
}

/** Why a strike is forced, which the walk concludes with the move it makes.
 * `marks` are the struck candidates. A border deduction outlines exactly the
 * run of squares its argument is about, read off the shared
 * {@link borderScanFor} rather than re-derived; its words name it. */
export function premise(
  reason: SaladReason,
  marks: readonly Mark[],
  state: { mode: number; order: number; nums: number },
): Premise {
  const { mode, order } = state;
  const o = order;
  const text = say(mode);
  const at = marks[0];
  switch (reason.kind) {
    case "borderNear": {
      const line = clueLine(reason.clue, o);
      const c = { side: clueSide(reason.clue, o).side, clue: reason.clue, line };
      // The squares the "sees it first" argument walks over, known empty,
      // before the one it decides.
      return {
        premise: text.borderNear(c, reason.clueVal, line.slice(0, reason.skipped), at),
      };
    }
    case "borderFar": {
      const { side, axis } = clueSide(reason.clue, o);
      const line = clueLine(reason.clue, o);
      // The run the clue's own symbol is confined to: up to the blocking ball,
      // else the counting bound.
      const s = borderScanFor(reason.clue, o);
      const run: Cell[] = [];
      for (let i = s.start; i !== s.end; i += s.step) {
        run.push({ x: i % o, y: (i / o) | 0 });
        if (
          reason.circleAt !== null ? i === reason.circleAt : run.length > reason.reach
        )
          break;
      }
      const blockedAt =
        reason.circleAt === null
          ? null
          : { x: reason.circleAt % o, y: (reason.circleAt / o) | 0 };
      return {
        premise: text.borderFar(
          { side, clue: reason.clue, line },
          {
            axis,
            clueVal: reason.clueVal,
            blockedAt,
            reach: reason.reach,
            holes: reason.holes,
            tightenedBy: reason.tightenedBy,
            run,
          },
        ),
        where: text.borderFarWhere(blockedAt !== null),
      };
    }
    case "circleXNote":
      return {
        premise: text.circleXNote(cellsOf(marks)),
        struck: text.emptyMarks(reason.count),
      };
    case "repeatFull":
      return {
        premise: text.repeatFull(
          reason.line,
          hiddenSingleLine(reason.line, reason.index, o),
          reason.times,
          at,
        ),
        struck: text.emptyMarks(1),
      };
    case "countHolesDone":
    case "countLettersDone":
    case "crossNaked":
      throw new Error(`a ${reason.kind} deduction marks a square`);
    default:
      return latinPremise(reason, marks, saladVocab(mode));
  }
}

/** The squares `marks` are in, each once. */
function cellsOf(marks: readonly Mark[]): Cell[] {
  const seen = new Set<string>();
  const out: Cell[] = [];
  for (const m of marks) {
    const k = `${m.x},${m.y}`;
    if (!seen.has(k)) {
      seen.add(k);
      out.push({ x: m.x, y: m.y });
    }
  }
  return out;
}

/** The border clues a step's words light: the `clues` a Salad highlight adds to
 * the candidate walk's, read off the words as the walk reads `area` and
 * `hatch`. */
function cluesNamed(words: Narration): number[] {
  const out = new Set<number>();
  for (const r of words.refs)
    if (r.kind.name === CLUE.name)
      for (const c of r.elements as readonly number[]) out.add(c);
  return [...out];
}

/** A marker step's evidence, read off its words as the walk reads its own
 * steps', and the clues they light. */
function markerEvidence(words: Narration): {
  area: OrderedCell[];
  hatch?: Cell[];
  clues: number[];
} {
  return { ...evidenceOf(words), clues: cluesNamed(words) };
}

// --- the plan walk ---------------------------------------------------------

/** A working copy of everything the player can see, advanced as the plan is
 * built. Notes hidden on screen (a crossed or filled square shows none) are
 * dropped, so the walk can never teach a strike the player cannot see. */
interface Working {
  grid: Uint8Array;
  holes: Uint8Array;
  pencil: Int32Array;
}

function startWorking(s: SaladState): Working {
  const w: Working = {
    grid: Uint8Array.from(s.grid),
    holes: Uint8Array.from(s.holes),
    pencil: Int32Array.from(s.pencil),
  };
  for (let i = 0; i < w.pencil.length; i++) {
    if (w.grid[i] !== 0 || w.holes[i] === CROSS) w.pencil[i] = 0;
  }
  return w;
}

/**
 * The grid a recorded placement is judged made against — `availableFirings`'
 * and `nextPlace`'s "is this cell decided yet?". Salad is the first game where
 * that differs from the symbol grid: the cube places its hole symbol in a square
 * the player settles with an empty-square marker, and that square's grid entry
 * stays blank for ever, so judging by `grid` alone would leave the op permanently
 * unmade and hold back every strike whose premise reads that square.
 */
function placedProbe(w: Working): Uint8Array {
  const out = Uint8Array.from(w.grid);
  for (let i = 0; i < out.length; i++) {
    if (out[i] === 0 && w.holes[i] === CROSS) out[i] = 255;
  }
  return out;
}

/** The squares whose notes have come down to a single *symbol* — the move a
 * person makes next. The X-mark-only case is a *cross*, not a placement (see the
 * file header), and is handled by the marker pass. */
function nakedSymbols(w: Working, o: number, nums: number): Mark[] {
  const out: Mark[] = [];
  for (let i = 0; i < o * o; i++) {
    if (w.grid[i] !== 0 || w.holes[i] === CROSS) continue;
    const m = w.pencil[i];
    if (m === 0 || (m & (m - 1)) !== 0) continue;
    for (let n = 1; n <= nums; n++) {
      if (m === 1 << (n - 1)) out.push({ x: i % o, y: (i / o) | 0, n });
    }
  }
  return out;
}

/** One marker deduction: the squares it settles, the marker it settles them to,
 * and why. */
interface MarkerFiring {
  mark: "cross" | "circle";
  cells: Cell[];
  reason: SaladReason;
}

/** The cheap marker deductions available on the board *as the player sees it*
 * — a line's counts first (visible and countable), then a note collapse. When
 * there are none, the caller falls through to the recorded strikes/placements
 * and finally to the cube's own verdict. */
function cheapMarkers(w: Working, o: number, nums: number): MarkerFiring[] {
  const out: MarkerFiring[] = [];
  const lines: { line: "row" | "col"; index: number; cells: number[] }[] = [];
  for (let y = 0; y < o; y++) {
    const cells: number[] = [];
    for (let x = 0; x < o; x++) cells.push(y * o + x);
    lines.push({ line: "row", index: y, cells });
  }
  for (let x = 0; x < o; x++) {
    const cells: number[] = [];
    for (let y = 0; y < o; y++) cells.push(y * o + x);
    lines.push({ line: "col", index: x, cells });
  }

  const at = (i: number): Cell => ({ x: i % o, y: (i / o) | 0 });

  for (const l of lines) {
    let crosses = 0;
    let circles = 0;
    let placed = 0;
    const blank: number[] = [];
    for (const i of l.cells) {
      if (w.holes[i] === CROSS) crosses++;
      else if (w.holes[i] === CIRCLE) {
        circles++;
        if (w.grid[i] !== 0) placed++;
      } else blank.push(i);
    }
    if (blank.length === 0) continue;
    if (crosses === o - nums) {
      out.push({
        mark: "circle",
        cells: blank.map(at),
        reason: { kind: "countHolesDone", line: l.line, index: l.index },
      });
    } else if (circles === nums) {
      out.push({
        mark: "cross",
        cells: blank.map(at),
        reason: {
          kind: "countLettersDone",
          line: l.line,
          index: l.index,
          allPlaced: placed === nums,
        },
      });
    }
  }

  // A square whose notes have collapsed onto the empty-square mark alone.
  const xbit = 1 << nums;
  for (let i = 0; i < o * o; i++) {
    if (w.grid[i] !== 0 || w.holes[i] !== 0) continue;
    if (w.pencil[i] === xbit) {
      out.push({ mark: "cross", cells: [at(i)], reason: { kind: "crossNaked" } });
    }
  }
  return out;
}

/** Throw if the cube forces a marker the working board still lacks once every
 * recorded strike and placement is on it. No reason the plan can narrate
 * explains such a marker, so it rests on a strike the plan skipped: the marker
 * twin of `classifyPlacementInRegions`'s throw (AGENTS.md § "Hint quality bar",
 * rule 6). */
function assertEveryMarkerExplained(
  w: Working,
  fixpointHoles: Uint8Array,
  o: number,
): void {
  for (let i = 0; i < o * o; i++) {
    if (w.holes[i] !== 0 || w.grid[i] !== 0) continue;
    const m = fixpointHoles[i];
    if (m !== CROSS && m !== CIRCLE) continue;
    throw new Error(
      `hint plan: the ${m === CROSS ? "empty-square" : "letter"} marker at ` +
        `(${i % o}, ${(i / o) | 0}) has no reason the notes show, so the plan ` +
        "skipped a strike it rests on",
    );
  }
}

/** Salad's dialect for the shared plan mechanics. The three canonical shapes map
 * onto `set`/`pencil`/`markAll`/`pencilStrike`; the **marker** entries are a
 * fourth shape the canonical set has no room for, so they are read as `null`
 * here (⇒ off-plan) and handled by {@link hintKeepTrack} /
 * {@link refreshHintStep} before they delegate. `nums` places the "might be
 * empty" note, which the walk reads as candidate `nums + 1`. */
const saladCandidateMoves = (nums: number): CandidateMoveAdapter<SaladMove> => ({
  read: (m) => {
    // Both fills read as the canonical populate: the plan asks for the additive
    // `pencilAll`, and a legacy move log's resetting `markAll` did at least as
    // much, so either satisfies the step.
    if (m.type === "pencilAll" || m.type === "markAll") return { type: "pencilAll" };
    if (m.type === "pencilStrike") return { type: "pencilStrike", marks: [...m.marks] };
    if ((m.type === "set" || m.type === "pencil") && typeof m.value === "number") {
      return {
        type: "set",
        x: m.x,
        y: m.y,
        n: m.value,
        pencil: m.type === "pencil",
      };
    }
    // A penciled X toggles the "might be empty" note, as `executeMove` does.
    if (m.type === "pencil" && m.value === "cross") {
      return { type: "set", x: m.x, y: m.y, n: nums + 1, pencil: true };
    }
    return null;
  },
  strike: (marks) => ({ type: "pencilStrike", marks }),
  place: (x, y, n) => ({ type: "set", x, y, value: n }),
  bit: (n) => 1 << (n - 1),
});

/** True when `move` writes one of Salad's two emptiness markers as a real entry
 * — the move shape the canonical `CandidateMove` set has no member for. */
function markerMove(
  move: SaladMove,
): { x: number; y: number; mark: "cross" | "circle" } | null {
  if (move.type !== "set") return null;
  if (move.value === "cross") return { x: move.x, y: move.y, mark: "cross" };
  if (move.value === "circle") return { x: move.x, y: move.y, mark: "circle" };
  return null;
}

type SaladFiring = Firing<SaladMove, SaladHint, SaladReason>;

/** One marker firing as a single journey — one deduction, one hint
 * (quality-bar rule 2) — followed by a folded tidy-up leg clearing the
 * "might be empty" marks the balls it places make impossible. */
function markerFiring(f: MarkerFiring, w: Working, state: SaladState): SaladFiring {
  const o = state.order;
  const nums = state.nums;
  const legs: Leg<SaladMove, SaladHint, SaladReason>[] = f.cells.map((c) => {
    const words = narrate(f.reason, { ...c, n: 0 }, state);
    return {
      step: narratedStep<SaladMove, SaladHint>({
        move: { type: "set", x: c.x, y: c.y, value: f.mark },
        words,
        highlights: {
          ...markerEvidence(words),
          targets: [c],
          marks: [],
          ghost: f.mark,
        },
      }),
      apply: () => {
        const i = c.y * o + c.x;
        w.holes[i] = f.mark === "cross" ? CROSS : CIRCLE;
        if (f.mark === "cross") w.pencil[i] = 0;
      },
    };
  });
  const tidy = f.mark === "circle" ? emptyNotesOn(w, f.cells, o, nums) : [];
  if (tidy.length > 0)
    legs.push({ strike: tidy, reason: { kind: "circleXNote", count: tidy.length } });
  return legs;
}

/** The "might be empty" notes still on `cells`. */
function emptyNotesOn(
  w: Working,
  cells: readonly Cell[],
  o: number,
  nums: number,
): SaladMark[] {
  return cells
    .filter((c) => w.pencil[c.y * o + c.x] & (1 << nums))
    .map((c) => ({ x: c.x, y: c.y, n: nums + 1 }));
}

/**
 * The tidy-up as a firing of its own, for a circle already on the board: one
 * the player put there, or one an earlier hint placed before the player went
 * their own way. The circle's own firing strikes the note in the same journey,
 * but only while it is placing the circle, so without this a leftover note
 * would hide the placement behind it for good.
 */
function circledEmptyNotes(w: Working, o: number, nums: number): SaladFiring[] {
  const circled: Cell[] = [];
  for (let i = 0; i < o * o; i++) {
    if (w.grid[i] === 0 && w.holes[i] === CIRCLE)
      circled.push({ x: i % o, y: (i / o) | 0 });
  }
  const tidy = emptyNotesOn(w, circled, o, nums);
  if (tidy.length === 0) return [];
  return [[{ strike: tidy, reason: { kind: "circleXNote", count: tidy.length } }]];
}

/**
 * Build the plan by walking a working copy of the board the way a person plays:
 * a collapsed square first, then the visible line counts, then (once notes
 * exist) the border and generic eliminations, then the placements they force,
 * and only last the deductions that need the whole row and column taken
 * together.
 */
function buildSteps(
  state: SaladState,
  { autoClean }: CandidatePlanPrefs,
): HintStep<SaladMove, SaladHint>[] {
  const o = state.order;
  const nums = state.nums;
  const steps: HintStep<SaladMove, SaladHint>[] = [];
  const w = startWorking(state);
  const enc = saladNotes(nums);
  const text = say(state.mode);
  const regionsOf = saladRegions(o);
  const board = (): SaladBoard => ({
    order: o,
    nums,
    mode: state.mode,
    borderclues: state.borderclues,
    gridclues: state.gridclues,
    grid: w.grid,
    holes: w.holes,
  });

  // The same predicate the Mark-all button's fill half uses, so the opener fires
  // exactly when a press of that button would fill something.
  let populated = !needsPencilFill({ order: o, ...w });

  const allMarks = (1 << (nums + 1)) - 1;
  const symbolMarks = (1 << nums) - 1;
  /**
   * The opener: pencil in the squares that carry no mark yet, and **only** those
   * (the additive `pencilAll`, not the resetting `markAll`). The working copy has
   * to mirror that fill exactly, or the plan would go on to teach strikes on
   * candidates the player had already crossed out — a step whose mark is
   * invisible on their board.
   */
  const populate = (): void => {
    for (let i = 0; i < o * o; i++) {
      if (w.grid[i] === 0 && w.holes[i] !== CROSS && w.pencil[i] === 0) {
        w.pencil[i] = w.holes[i] === CIRCLE ? symbolMarks : allMarks;
      }
    }
    steps.push(
      populateStep<SaladMove, SaladHint>({ type: "pencilAll" }, text.populate),
    );
    populated = true;
  };

  /** The cube's markers, for the check that the plan explained every one. */
  let holes: Uint8Array = new Uint8Array(0);

  // Notes are needed once the note-free rungs are spent, so fill them in — as
  // the player's own Mark-all move, once — then bulk-clear the candidates a
  // placed symbol already rules out, in one step, so the walk teaches real
  // deductions rather than N trivial row/column culls (docs/games/hints.md §
  // "Persist, populate, and the moves"). A setup of Salad's own, so the plan
  // always walks the populate reading: a square's "might be empty" note is a
  // candidate no row or column rules out, so the implicit reading would have
  // to say when to write it, and nothing has asked it to yet.
  const setUp = populateThenClean({ done: () => populated, ensure: populate }, () => {
    if (
      !emitObviousCleanStep<SaladMove, SaladHint>(
        steps,
        w.grid,
        w.pencil,
        o,
        regionReach(o, regionsOf),
        text.cleanObvious,
        { enc, adapter: saladCandidateMoves(nums) },
      )
    )
      return false;
    // The shared helper builds the common highlight fields; Salad's carry a
    // clue list too.
    const step = steps[steps.length - 1];
    step.highlights = { ...(step.highlights as SaladHint), clues: [] };
    return true;
  });

  runLatinCandidatePlan<SaladMove, SaladHint, SaladOp, SaladReason>({
    w: o,
    steps,
    grid: w.grid,
    pencil: w.pencil,
    enc,
    moves: saladCandidateMoves(nums),
    autoClean,
    label: "salad hint plan",
    cap: o * o * (nums + 4) + 8,
    finished: () => latinholesCheck(board()),
    // Strikes *of* the hole symbol are dropped: the same fact reaches the
    // player as a marker step (file header, point 1), and teaching it twice
    // would be noise. Hole *placements* are kept, because a strike whose
    // premise reads a square the board has not settled yet still waits for it.
    record: () => {
      const rec = recordSaladDeductions(board(), state.diff);
      holes = rec.holes;
      return (rec.ops as SaladOp[]).filter((op) => op.kind === "place" || op.n <= nums);
    },
    // The walk reads the outline and the stripes off the words; the clues they
    // light are Salad's, read the same way.
    placeWords: (m, reason) => {
      const words = narrate(reason, m, state);
      return { words, clues: cluesNamed(words), ghost: m.n };
    },
    strikeWords: (marks, reason) => {
      const p = premise(reason, marks, state);
      return { ...p, clues: cluesNamed(p.premise) };
    },
    // The far border arm names the clue's *symbol* and rules it out along a
    // run, so it is one multi-square leg; everything else names *this square*.
    strikeAxis: (op) =>
      op.reason.kind === "borderFar"
        ? `far:${op.n}`
        : `${op.reason.kind}:${op.y * o + op.x}`,
    setUp,
    // The setup is Salad's own; the vocabulary still words the conclusions.
    notes: { placedVerb: "placed", ...saladVocab(state.mode) },
    // The cheapest emptiness deductions: a line's counts, or a collapse onto
    // the empty-square mark. Both need no notes beyond what is on screen, so a
    // Number Ball board opens on them rather than on "pencil everything in".
    rungs: [
      () => cheapMarkers(w, o, nums).map((f) => markerFiring(f, w, state)),
      () => circledEmptyNotes(w, o, nums),
    ],
    // A lone "might be empty" note is a marker, not a symbol to place.
    singles: () => nakedSymbols(w, o, nums),
    // The cube's hole symbols are settled by markers, never placed.
    placeable: (op) => op.n <= nums,
    placed: () => placedProbe(w),
    onPlace: (x, y) => {
      w.holes[y * o + x] = CIRCLE;
    },
    // Nothing further is deducible from here.
    stuck: () => assertEveryMarkerExplained(w, holes, o),
  });
  return steps;
}

// --- the Game hooks --------------------------------------------------------

export function hint(
  state: SaladState,
  _aux?: string,
  _ui?: SaladUi,
): HintResult<SaladMove, SaladHint> {
  // No `autoPencil` preference to honor: Salad has no auto-elimination on
  // placement, so the plan always teaches the row/column note cull explicitly.
  return candidateHint(state, null, buildSteps);
}

/** Classify a player move against the displayed step. Salad's two emptiness
 * markers are a move shape the shared mechanics have no member for, so they are
 * judged here; everything else delegates. */
export function hintKeepTrack(
  m: SaladMove,
  step: HintStep<SaladMove, SaladHint>,
  state: SaladState,
): HintTrackVerdict {
  const want = markerMove(step.move);
  if (want) {
    const got = markerMove(m);
    return got && got.x === want.x && got.y === want.y && got.mark === want.mark
      ? "completed"
      : "off";
  }
  return keepCandidateHintTrack(
    m,
    step,
    state.pencil,
    state.order,
    saladCandidateMoves(state.nums),
  );
}

/** How the pointer makes a step's `move`, with `at` the middle of a cell and
 * `code` the keypad key typing symbol `n`: a marker is its X or O key in ink,
 * and the "might be empty" note is X in pencil mode. `markAll` is what the
 * mark-all control makes now. */
export function hintGesture(
  state: SaladState,
  ui: SaladUi,
  at: (x: number, y: number) => Point,
  code: (n: number) => number,
  move: SaladMove,
  markAll: unknown,
): PointerAction[] {
  const marker = markerMove(move);
  if (marker) {
    return noteEntryGesture(ui, at, [
      {
        x: marker.x,
        y: marker.y,
        code: marker.mark === "cross" ? KEY_CROSS : KEY_CIRCLE,
        pencil: false,
      },
    ]);
  }
  const nums = state.nums;
  return candidateGesture(
    move,
    ui,
    at,
    (n) => (n === nums + 1 ? KEY_CROSS : code(n)),
    saladCandidateMoves(nums),
    markAll,
  );
}

/** Re-validate a stored step before it is (re-)displayed. A marker step is
 * resolved once the square carries that marker — which the shared placement arm
 * cannot see, because a cross leaves the grid blank for ever. */
export function refreshHintStep(
  step: HintStep<SaladMove, SaladHint>,
  state: SaladState,
): HintStep<SaladMove, SaladHint> | null {
  const want = markerMove(step.move);
  if (want) {
    const at = state.holes[want.y * state.order + want.x];
    const already = want.mark === "cross" ? at === CROSS : at === CIRCLE;
    return already ? null : step;
  }
  return refreshCandidateHintStep(
    step,
    state.grid,
    state.pencil,
    state.order,
    saladCandidateMoves(state.nums),
  );
}

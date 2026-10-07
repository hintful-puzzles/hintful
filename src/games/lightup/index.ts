/**
 * Light Up (Akari) — native TS port of `lightup.c`. Place bulbs on open
 * squares so every open square is lit, no bulb shines on another, and
 * every numbered black square has exactly that many adjacent bulbs.
 *
 * Left-click toggles a bulb; right-click toggles the player's "no bulb
 * here" impossible-mark (each placing clears the other). Keyboard: arrow
 * cursor, Enter/select for a bulb, `i`/select2 for a mark. Clue numbers
 * turn red when provably wrong; bulbs turn red when they light each
 * other. Check & Save additionally flags bulbs/marks contradicting the
 * unique solution.
 */

import { assertNever, rejectMove } from "../../engine/assert-never.ts";
import { type DifficultyContract, difficultyItem } from "../../engine/difficulty.ts";
import type {
  Game,
  HintResult,
  HintStep,
  HintTrackVerdict,
  SolveResult,
  UiUpdate,
} from "../../engine/game.ts";
import {
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import { changedCells, trackTargets } from "../../engine/hint-track.ts";
import { CELL, type Sentence } from "../../engine/hint-words.ts";
import {
  dimensionParamConfig,
  numberItem,
  transposeDimensions,
} from "../../engine/params.ts";
import { newCursor } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  SYMM_NONE,
  SYMM_ROT2,
  SYMM_ROT4,
  SYMMETRY_CHOICES,
} from "../../engine/symmetric-blacks.ts";
import {
  interpretTargetVerbs,
  letterKey,
  squareGrid,
  type TargetVerbs,
  verbGesture,
} from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { newLightupDesc, puzzleIsGood } from "./generator.ts";
import { type Marked, say } from "./hint-text.ts";
import {
  border,
  colors,
  computeSize,
  FLASH_TIME,
  type LightupDrawState,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  deduceHintPlan,
  dosolve,
  F_SOLVE_ALLOWRECURSE,
  F_SOLVE_DISCOUNTSETS,
  type LightupFiring,
  solveUnique,
} from "./solver.ts";
import {
  cloneState,
  DIFF_NAMES,
  decodeParams,
  defaultParams,
  encodeParams,
  F_BLACK,
  F_IMPOSSIBLE,
  F_LIGHT,
  gridCorrect,
  idx,
  type LightupMove,
  type LightupOp,
  type LightupParams,
  type LightupState,
  type LightupUi,
  newState,
  presets,
  setLight,
  status,
  textFormat,
  validateParams,
} from "./state.ts";

/** A cell Check & Save flags: a bulb the unique solution doesn't have
 * (`"light"`), or an impossible-mark sitting on a solution bulb
 * (`"mark"`). */
export interface LightupMistake {
  x: number;
  y: number;
  kind: "light" | "mark";
}

function newUi(_state: LightupState): LightupUi {
  return { cursor: newCursor(), drawBlobsWhenLit: true };
}

function changedState(
  ui: LightupUi,
  _old: LightupState | null,
  next: LightupState,
): void {
  if (gridCorrect(next)) ui.cursor.visible = false;
}

/** A bulb or a dot on square `{ x, y }`: toggled, except that each refuses a
 * square holding the other. */
function toggle(kind: "light" | "impossible") {
  return (state: LightupState, { x, y }: Point): LightupMove | null => {
    const flags = state.flags[idx(x, y, state.w)];
    if (flags & F_BLACK) return null;
    if (flags & (kind === "light" ? F_IMPOSSIBLE : F_LIGHT)) return null;
    return { ops: [{ kind, x, y }] };
  };
}

const targetVerbs: TargetVerbs<
  LightupState,
  LightupUi,
  LightupDrawState,
  Point,
  LightupMove
> = {
  geometry: squareGrid({ size: (s) => s, border }),
  primary: { does: "place or remove a light", apply: toggle("light") },
  secondary: {
    does: "place or remove a dot, marking a square you think holds no light",
    keys: [letterKey("I")],
    apply: toggle("impossible"),
  },
};

function interpretMove(
  state: LightupState,
  ui: LightupUi,
  ds: LightupDrawState,
  p: Point,
  button: number,
): LightupMove | null | UiUpdate {
  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, button);
}

function executeMove(state: LightupState, move: LightupMove): LightupState {
  // A move is an op list, not a union, so there is no discriminant to narrow to
  // `never`: check the one field the dispatch reads (see `rejectMove`).
  if (!Array.isArray(move.ops)) rejectMove(move, "lightup: executeMove");

  const next = cloneState(state);
  const { w, h } = next;
  for (const op of move.ops) {
    if (op.x < 0 || op.y < 0 || op.x >= w || op.y >= h)
      throw new Error("Light Up move out of bounds");
    const i = idx(op.x, op.y, w);
    const flags = next.flags[i];
    if (flags & F_BLACK) throw new Error("Light Up move targets a black square");
    // Bulb and impossible-mark are mutually exclusive; each is a toggle.
    if (op.kind === "light") {
      next.flags[i] &= ~F_IMPOSSIBLE;
      setLight(next, op.x, op.y, !(flags & F_LIGHT));
    } else if (op.kind === "impossible") {
      setLight(next, op.x, op.y, false);
      next.flags[i] ^= F_IMPOSSIBLE;
    } else {
      // `op` is one interface with a two-value `kind`, not a union of shapes,
      // so it is `op.kind` that narrows to `never` here. The offending op goes
      // in the context instead.
      assertNever(op.kind, `lightup: executeMove op at (${op.x},${op.y})`);
    }
  }
  return next;
}

function solve(orig: LightupState, curr: LightupState): SolveResult<LightupMove> {
  // We don't care about uniqueness here; if the player typed an ambiguous
  // desc, any solution will do.
  const sflags = F_SOLVE_ALLOWRECURSE | F_SOLVE_DISCOUNTSETS;

  // Try solving from where we are now (for a non-unique puzzle this may
  // produce a different answer than from scratch)...
  let solved = cloneState(curr);
  if (dosolve(solved, sflags) <= 0) {
    // ... then from the clean puzzle.
    solved = cloneState(orig);
    if (dosolve(solved, sflags) <= 0) {
      return { ok: false, error: PUZZLE_NOT_REASONABLE };
    }
  }

  const ops: LightupOp[] = [];
  for (let x = 0; x < curr.w; x++) {
    for (let y = 0; y < curr.h; y++) {
      const i = idx(x, y, curr.w);
      if ((curr.flags[i] & F_LIGHT) !== (solved.flags[i] & F_LIGHT)) {
        ops.push({ kind: "light", x, y });
      } else if ((curr.flags[i] & F_IMPOSSIBLE) !== (solved.flags[i] & F_IMPOSSIBLE)) {
        ops.push({ kind: "impossible", x, y });
      }
    }
  }
  return { ok: true, move: { solve: true, ops } };
}

function findMistakes(state: LightupState): readonly LightupMistake[] {
  const solution = solveUnique(state);
  if (!solution) return [];
  const out: LightupMistake[] = [];
  for (let y = 0; y < state.h; y++) {
    for (let x = 0; x < state.w; x++) {
      const i = idx(x, y, state.w);
      if (state.flags[i] & F_BLACK) continue;
      if (state.flags[i] & F_LIGHT && !(solution.flags[i] & F_LIGHT)) {
        out.push({ x, y, kind: "light" });
      } else if (state.flags[i] & F_IMPOSSIBLE && solution.flags[i] & F_LIGHT) {
        // A mark asserts "no bulb here"; it is provably wrong only when
        // the solution puts a bulb on that very square.
        out.push({ x, y, kind: "mark" });
      }
    }
  }
  return out;
}

// --- hint --------------------------------------------------------------------
//
// The hint plan is the deductive solver's own script, run from the
// player's position (bulbs and impossible-marks honored as constraints)
// with the recorder on. One firing = one (possibly multi-cell) step, and
// an elimination step's move is the game's own impossible-mark, so
// following the plan leaves on the board exactly the trail the solver
// reasons over — a later "every other way to light this square is crossed
// out" narration is then *visible*.

/** Plan data for a Light Up hint step. `kind` is the mark the step places on
 * its `targets`, which `hintKeepTrack` and `refreshHintStep` read. `dark` is
 * the unlit square the deduction is about (pink ring) and `clue` the driving
 * clue, whose digit recolors: the words outline both alongside the rest of the
 * evidence, and the renderer reads them here to tell the three glyphs apart. */
export interface LightupHint {
  kind: "light" | "impossible";
  targets: Point[];
  dark?: Point;
  clue?: Point;
}

/** A step's highlights, and its `area`: the deduction's evidence besides the
 * dark square and the clue, shaded light-blue when the square is dark and
 * ringed green when it is lit (the fill would hide the "already lit"
 * premise). */
type Marks = LightupHint & { area: Point[] };

const sameCell = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;

function buildHighlights(f: LightupFiring): Marks {
  const notTarget = (c: Point): boolean => !f.cells.some((t) => sameCell(t, c));
  switch (f.reason.kind) {
    case "forcedLight": {
      const dark = f.reason.dark;
      const isTargetItself = f.cells.some((t) => sameCell(t, dark));
      return {
        kind: f.kind,
        targets: f.cells,
        area: f.reason.corridor.filter((c) => notTarget(c) && !sameCell(c, dark)),
        dark: isTargetItself ? undefined : dark,
      };
    }
    case "clueSatisfied":
      // The placed bulbs are the premise; they are lit, so the renderer
      // rings them. The clue itself is cued by its recolored digit.
      return {
        kind: f.kind,
        targets: f.cells,
        area: f.reason.bulbs,
        clue: f.reason.clue,
      };
    case "clueSaturated":
      // The premise is just the clue's count against its free neighbors,
      // and the free neighbors are all targets — no separate evidence.
      return { kind: f.kind, targets: f.cells, area: [], clue: f.reason.clue };
    case "discountUnlit": {
      const dark = f.reason.dark;
      return {
        kind: f.kind,
        targets: f.cells,
        area: f.reason.set.filter((c) => notTarget(c) && !sameCell(c, dark)),
        dark,
      };
    }
    case "discountClue":
      return {
        kind: f.kind,
        targets: f.cells,
        area: f.reason.set.filter(notTarget),
        clue: f.reason.clue,
      };
  }
}

/** Narrate *why* the firing's marks are forced. **`hl` is the frame the
 * player is looking at**, so a branch can tell whether a second mark is even
 * on the board before deciding how much to say. The words, and the deixis
 * ties they carry, are [`hint-text.ts`](./hint-text.ts)'s. */
function narrate(f: LightupFiring, hl: Marks): Sentence {
  const m: Marked = {
    targets: hl.targets,
    area: hl.area,
    dark: hl.dark ?? null,
    clue: hl.clue ?? null,
  };
  switch (f.reason.kind) {
    case "forcedLight": {
      const dark = f.reason.dark;
      return f.cells.some((t) => sameCell(t, dark))
        ? say.forcedLightSelf(m)
        : say.forcedLightOther(m);
    }
    case "clueSatisfied":
      return say.clueSatisfied(f.reason.n, m);
    case "clueSaturated":
      return say.clueSaturated(m);
    case "discountUnlit": {
      const dark = f.reason.dark;
      return say.discountUnlit(
        f.reason.set.some((c) => sameCell(c, dark)),
        m,
      );
    }
    case "discountClue":
      return say.discountClue(m);
  }
}

/** `step`'s words narrowed to the targets `left`, as its highlights are. */
function narrowWords(
  step: HintStep<LightupMove, LightupHint>,
  left: readonly Point[],
): Pick<HintStep<LightupMove, LightupHint>, "words" | "explanation"> {
  if (!step.words) return { explanation: step.explanation };
  const kept = new Set(left.map((c) => CELL.key(c)));
  const words = step.words.narrow(
    (role, _kind, key) => role !== "ring" || kept.has(key),
  );
  return { words, explanation: words.text };
}

/** The solver's rules, by the `kind` of the reason each firing carries. */
export const LIGHTUP_RUNGS = [
  "forcedLight",
  "clueSatisfied",
  "clueSaturated",
  "discountUnlit",
  "discountClue",
] as const satisfies readonly LightupFiring["reason"]["kind"][];
export type LightupRung = (typeof LIGHTUP_RUNGS)[number];

function buildStep(f: LightupFiring): HintStep<LightupMove, LightupHint, LightupRung> {
  // The sentence is given the marks, since a narration can only be held to
  // "say which mark you mean" if it knows which marks there are.
  const marks = buildHighlights(f);
  const words = narrate(f, marks);
  const { area: _, ...highlights } = marks;
  return {
    move: { ops: f.cells.map((c) => ({ kind: f.kind, x: c.x, y: c.y })) },
    rung: f.reason.kind,
    explanation: words.text,
    words,
    highlights,
  };
}

function hint(state: LightupState): HintResult<LightupMove, LightupHint, LightupRung> {
  const plan = deduceHintPlan(state);
  // Only reachable on an Unreasonable board (Easy/Normal boards are
  // deduction-complete by generation): refuse honestly at the guess point.
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  return { ok: true, steps: plan.map(buildStep) };
}

/** The player's mark on cell `i`: `F_LIGHT`, `F_IMPOSSIBLE` or 0. */
const markAt = (state: LightupState, i: number): number =>
  state.flags[i] & (F_LIGHT | F_IMPOSSIBLE);

const markFlag = (kind: "light" | "impossible"): number =>
  kind === "light" ? F_LIGHT : F_IMPOSSIBLE;

/** Does the cell already carry the step's mark? */
function hasMark(
  state: LightupState,
  cell: Point,
  kind: "light" | "impossible",
): boolean {
  return markAt(state, idx(cell.x, cell.y, state.w)) === markFlag(kind);
}

/** Classify a player move by what it did to the board
 * (`engine/hint-track.ts`), so a toggle that takes a mark back off is a change
 * the step never asked for; a multi-cell step shrinks in place. */
function hintKeepTrack(
  m: LightupMove,
  step: HintStep<LightupMove, LightupHint>,
  state: LightupState,
): HintTrackVerdict {
  if (m.solve) return "off";
  const hl = step.highlights;
  if (!hl) return "off";
  const after = executeMove(state, m);
  const { verdict, left } = trackTargets({
    targets: hl.targets,
    changes: changedCells(
      state.flags.length,
      (i) => markAt(state, i),
      (i) => markAt(after, i),
    ),
    key: (c) => idx(c.x, c.y, state.w),
    want: () => markFlag(hl.kind),
    holds: (c) => hasMark(after, c, hl.kind),
  });
  if (verdict === "onTrack") {
    step.move = { ops: left.map((c) => ({ kind: hl.kind, x: c.x, y: c.y })) };
    step.highlights = { ...hl, targets: left };
    Object.assign(step, narrowWords(step, left));
  }
  return verdict;
}

/** Validate-at-display: drop targets that already carry the step's mark
 * (e.g. after undo/redo shuffles), `null` once every one does. */
function refreshHintStep(
  step: HintStep<LightupMove, LightupHint>,
  state: LightupState,
): HintStep<LightupMove, LightupHint> | null {
  const hl = step.highlights;
  if (!hl) return step;
  const left = hl.targets.filter((t) => !hasMark(state, t, hl.kind));
  if (left.length === 0) return null;
  if (left.length === hl.targets.length) return step;
  return {
    ...step,
    ...narrowWords(step, left),
    move: { ops: left.map((c) => ({ kind: hl.kind, x: c.x, y: c.y })) },
    highlights: { ...hl, targets: left },
  };
}

/** Light Up's difficulty contract (`engine/difficulty.ts`). `puzzleIsGood` is
 * already this predicate, spelled for the generator; it hands the cap to the
 * solver as a flag set (`flagsFromDifficulty`), not as a number. */
const difficulty: DifficultyContract<LightupParams> = {
  solveAtCap: (p, desc, cap) =>
    puzzleIsGood(newState(p, desc), cap) ? "solved" : "unsolved",
};

export const lightupGame: Game<
  LightupParams,
  LightupState,
  LightupMove,
  LightupUi,
  LightupDrawState,
  LightupMistake,
  LightupHint,
  LightupRung
> = {
  id: "lightup",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,

  transposeParams: transposeDimensions(),
  paramConfig: [
    ...dimensionParamConfig<LightupParams>({
      doc: "Size of the grid in squares. A 2x2 has only Easy puzzles, and a board needs nine squares to have an Unreasonable one. A 3x3 has none with symmetry, and no Normal one with 4-way symmetry; a 4x4 with 4-way symmetry has none it can deal.",
      bounds: { min: 2 },
    }),
    numberItem<LightupParams>(
      "percentage-of-black-squares",
      "%age of walls",
      "blackpc",
      {
        doc: "Roughly what share of the grid is walls, from 5 to 100. If no good puzzle turns up with that many, the generator adds more, 5% at a time, up to 90%, and then starts again.",
        label: {
          slot: "tail",
          words: (p) => (p.blackpc === 20 ? null : `${p.blackpc}% walls`),
        },
      },
    ),
    {
      kw: "symmetry",
      name: "Symmetry",
      type: "choices",
      choices: SYMMETRY_CHOICES,
      doc: "How the walls are arranged: <em>None</em>, <em>2-way mirror</em> (the bottom half reflects the top), <em>2-way rotational</em> (the same after a half turn), <em>4-way mirror</em> (reflected both left to right and top to bottom) or <em>4-way rotational</em> (the same after a quarter turn). 4-way rotational needs a square grid, and both 4-way settings need a grid at least 3 squares across in one direction. Only the black squares follow the symmetry; the numbers in them need not.",
      label: {
        slot: "tail",
        // The presets' own: 4-way rotational on the small square board, 2-way
        // on the rest.
        words: (p) => {
          const usual = p.w === p.h && p.w * p.h < 50 ? SYMM_ROT4 : SYMM_ROT2;
          if (p.symm === usual) return null;
          return p.symm === SYMM_NONE
            ? "no symmetry"
            : (SYMMETRY_CHOICES[p.symm] ?? null);
        },
      },
      get: (p) => p.symm,
      set: (p, v) => {
        p.symm = v;
      },
    },
    difficultyItem(DIFF_NAMES, "difficulty"),
  ],

  newDesc: newLightupDesc,
  newState,
  newUi,
  changedState,

  interpretMove,
  targetVerbs,
  executeMove,
  status,

  solve,
  findMistakes,
  difficulty,

  hint,
  hintRungs: LIGHTUP_RUNGS,
  hintMarks: {
    roles: {
      ring: 'each square the step decides: it takes a bulb, or, when the sentence says it "can\'t hold a bulb", a dot.',
      outline:
        "what the step reasons from, told apart by the sentence's nouns and drawn three ways: “the outlined clue” has a ring round its wall; “the outlined dark square”, which still has to be lit, has a pink double ring; and the other squares the reason rests on, such as a clue's bulbs, are shaded when dark and have a green double ring when lit.",
    },
  },
  hintKeepTrack,
  hintGesture: (s, ui, ds, m) =>
    verbGesture(
      targetVerbs,
      s,
      ds,
      ui,
      m.ops,
      m.ops[0]?.kind === "light" ? "primary" : "secondary",
    ),
  refreshHintStep,

  textFormat,

  prefs: [
    {
      kw: "show-lit-blobs",
      name: "Draw non-light marks even when lit",
      type: "boolean",
      get: (ui) => ui.drawBlobsWhenLit,
      set: (ui, v) => {
        ui.drawBlobsWhenLit = v;
      },
    },
  ],

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  solvedFlash: () => FLASH_TIME,
};

registerGame(lightupGame);

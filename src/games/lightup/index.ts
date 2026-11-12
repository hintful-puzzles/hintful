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

import { solveFromAnswer } from "../../engine/answer-search.ts";
import { assertNever, rejectMove } from "../../engine/assert-never.ts";
import { describedFiringHint } from "../../engine/described-firing-hint.ts";
import { type DifficultyContract, difficultyItem } from "../../engine/difficulty.ts";
import type { Game, SolveResult, UiUpdate } from "../../engine/game.ts";
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
  rulingOut,
  squareGrid,
  type TargetVerbs,
  verbGesture,
} from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { newLightupDesc } from "./generator.ts";
import { sentences } from "./hint-text.ts";
import { SAYS_EACH, SAYS_KINDS, type SaysById } from "./lightup.compiled.ts";
import {
  border,
  colors,
  computeSize,
  type LightupDrawState,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import {
  answerOf,
  BULB,
  deductionFinishes,
  hintWalk,
  holdsBulb,
  isSolved,
  NONE,
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
  F_NUMBERED,
  idx,
  type LightupMove,
  type LightupOp,
  type LightupParams,
  type LightupState,
  type LightupUi,
  menu,
  newState,
  setLight,
  TIERS,
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
  if (isSolved(next)) ui.cursor.visible = false;
}

/** A bulb or a cross on square `{ x, y }`: toggled, except that each refuses a
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
  secondary: rulingOut({
    does: "place or remove a cross, marking a square you think holds no light",
    keys: [letterKey("I")],
    apply: toggle("impossible"),
  }),
  // The cross only: a row of bulbs light each other, so it is never wanted.
  sweep: {
    holds: (s, { x, y }) => s.flags[idx(x, y, s.w)] & (F_LIGHT | F_IMPOSSIBLE),
    buttons: ["secondary"],
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

/** The squares orthogonally beside `{ x, y }`. */
function besides(s: LightupState, x: number, y: number): Point[] {
  return [
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 },
  ].filter((p) => p.x >= 0 && p.y >= 0 && p.x < s.w && p.y < s.h);
}

/**
 * The free squares each new bulb rules out at a glance, by a cross: the rest
 * of those round a numbered wall beside it that has all its lights.
 */
function ruledOut(before: LightupState, after: LightupState): LightupMove | null {
  const { w, flags } = after;
  const out = new Map<number, Point>();
  for (let y = 0; y < after.h; y++)
    for (let x = 0; x < w; x++) {
      const i = idx(x, y, w);
      if (!(flags[i] & F_LIGHT) || before.flags[i] & F_LIGHT) continue;
      for (const clue of besides(after, x, y)) {
        const c = idx(clue.x, clue.y, w);
        if (!(flags[c] & F_NUMBERED)) continue;
        const round = besides(after, clue.x, clue.y);
        const lit = round.filter((p) => flags[idx(p.x, p.y, w)] & F_LIGHT);
        if (lit.length !== after.lights[c]) continue;
        for (const p of round)
          if (!(flags[idx(p.x, p.y, w)] & (F_BLACK | F_LIGHT | F_IMPOSSIBLE)))
            out.set(idx(p.x, p.y, w), p);
      }
    }
  const ops = [...out]
    .sort(([a], [b]) => a - b)
    .map(([, p]): LightupOp => ({ kind: "impossible", ...p }));
  return ops.length === 0 ? null : { ops };
}

/** The answer's bulbs: one toggled wherever the answer differs, which takes
 * a cross off the square it lands on. Every other cross stays. */
function solveMove(curr: LightupState, solution: Uint8Array): LightupMove {
  const ops: LightupOp[] = [];
  for (let x = 0; x < curr.w; x++) {
    for (let y = 0; y < curr.h; y++) {
      const i = idx(x, y, curr.w);
      if (curr.flags[i] & F_BLACK) continue;
      if (((curr.flags[i] & F_LIGHT) !== 0) !== holdsBulb(solution, i))
        ops.push({ kind: "light", x, y });
    }
  }
  return { solve: true, ops };
}

function solve(orig: LightupState, curr: LightupState): SolveResult<LightupMove> {
  return solveFromAnswer(answerOf(orig), (solution) => solveMove(curr, solution));
}

function findMistakes(state: LightupState): readonly LightupMistake[] {
  const answer = answerOf(state);
  if (answer.kind !== "one") return [];
  const { solution } = answer;
  const out: LightupMistake[] = [];
  for (let y = 0; y < state.h; y++) {
    for (let x = 0; x < state.w; x++) {
      const i = idx(x, y, state.w);
      if (state.flags[i] & F_BLACK) continue;
      if (state.flags[i] & F_LIGHT && !holdsBulb(solution, i)) {
        out.push({ x, y, kind: "light" });
      } else if (state.flags[i] & F_IMPOSSIBLE && holdsBulb(solution, i)) {
        // A mark asserts "no bulb here"; it is provably wrong only when
        // the solution puts a bulb on that very square.
        out.push({ x, y, kind: "mark" });
      }
    }
  }
  return out;
}

/** Each wrong bulb or cross toggled off, in one move. */
function clearMistakes(
  _state: LightupState,
  mistakes: readonly LightupMistake[],
): LightupMove[] {
  const ops = mistakes.map(
    ({ x, y, kind }): LightupOp => ({
      kind: kind === "light" ? "light" : "impossible",
      x,
      y,
    }),
  );
  return ops.length === 0 ? [] : [{ ops }];
}

/** The first bulb of the answer not yet on the board. */
function revealOne(state: LightupState, solved: LightupState): LightupMove | null {
  for (let y = 0; y < state.h; y++)
    for (let x = 0; x < state.w; x++) {
      const i = idx(x, y, state.w);
      if (solved.flags[i] & F_LIGHT && !(state.flags[i] & F_LIGHT))
        return { ops: [{ kind: "light", x, y }] };
    }
  return null;
}

// --- hint --------------------------------------------------------------------
//
// The hint plan is the deductive solver's own script, run from the
// player's position (bulbs and impossible-marks honored as constraints):
// the ladder's firings, a step each (a discount, a step a square), built by
// the engine from what `lightup.description.yaml` says of them. An
// elimination step's move is the game's own impossible-mark, so following
// the plan leaves on the board exactly the trail the solver reasons over: a
// later "every other way to light this square is crossed out" narration is
// then *visible*.

/** What a step asks of a square: a bulb (`1`) or a cross (`2`), as the
 * description reads a square. */
export interface LightupTarget extends Point {
  value: number;
}

/** Plan data for a Light Up hint step. `kind` is the mark the step places on
 * its `targets`, which `hintKeepTrack` and `refreshHintStep` read. `dark` is
 * the unlit square the deduction is about and `clue` the driving clue: the
 * words outline both alongside the rest of the evidence, and the renderer
 * reads them here to tell the clue's ring on its wall from a square's. */
export interface LightupHint {
  kind: "light" | "impossible";
  targets: LightupTarget[];
  dark?: Point;
  clue?: Point;
}

/** What the description reads a square as holding: a bulb, a cross, or
 * nothing. */
function valueAt(state: LightupState, c: number): number {
  const f = state.flags[c];
  return f & F_LIGHT ? BULB : f & F_IMPOSSIBLE ? NONE : 0;
}

const opKind = (t: LightupTarget): LightupOp["kind"] =>
  t.value === BULB ? "light" : "impossible";

/** The hint: the ladder's firings, built by the engine from what the
 * description says of them. */
const described = describedFiringHint<
  LightupState,
  LightupMove,
  LightupTarget,
  SaysById,
  LightupRung,
  LightupHint
>({
  name: "lightup hint",
  walk: hintWalk,
  // The player rarely follows more than a few firings before diverging, and a
  // recompute yields the next batch.
  plan: 60,
  each: SAYS_EACH,
  // A bulb lights its lines and a player does not cross each: the squares the
  // solver's `shine` rules out are what the board already shows.
  consequences: false,
  width: (s) => s.w,
  size: (s) => s.w * s.h,
  valueAt,
  execute: executeMove,
  foreign: (m) => m.solve === true,
  target: (at, n) => ({ ...at, value: n }),
  want: (t) => t.value,
  move: (targets) => ({
    ops: targets.map((t) => ({ kind: opKind(t), x: t.x, y: t.y })),
  }),
  // The one square or number a step is about is drawn apart: a number is a
  // wall, and a dark square is not.
  highlights: ({ targets, strand }, state) => {
    const about = strand[0];
    const wall = about && state.flags[idx(about.x, about.y, state.w)] & F_BLACK;
    return {
      kind: opKind(targets[0]),
      targets,
      ...(about && !wall ? { dark: about } : {}),
      ...(about && wall ? { clue: about } : {}),
    };
  },
  say: sentences,
});

const { hint, hintKeepTrack, refreshHintStep } = described;

/** The solver's rules, by the kind of step each makes: a technique's id, and
 * for `square` the arm of it that held. */
export const LIGHTUP_RUNGS = SAYS_KINDS;
export type LightupRung = (typeof LIGHTUP_RUNGS)[number];

/** Light Up's difficulty contract: the ladder at Easy and Normal, the
 * search at Unreasonable. */
const difficulty: DifficultyContract<LightupParams> = TIERS.contract({
  newState,
  deductionFinishes: (state: LightupState, cap: number) =>
    deductionFinishes(state, cap),
  answerOf,
});

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
  menu,
  encodeParams,
  decodeParams,
  validateParams,

  transposeParams: transposeDimensions(),
  paramConfig: [
    ...dimensionParamConfig<LightupParams>({
      doc: "Size of the grid in squares. A 2x2 has only Easy puzzles, and a board needs nine squares to have an Unreasonable one. A 3x3 has none with symmetry, and no Normal one with 4-way symmetry; a 4x4 has none with 4-way mirror symmetry.",
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
      doc: "How the walls are arranged: <em>None</em>, <em>2-way mirror</em> (the bottom half reflects the top), <em>2-way rotational</em> (the same after a half turn), <em>4-way mirror</em> (reflected both left to right and top to bottom) or <em>4-way rotational</em> (the same after a quarter turn). 4-way rotational needs a square grid, and both 4-way settings need a grid at least 3 squares across in one direction. Only the walls follow the symmetry; the numbers in them need not.",
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
  status: (s) => (isSolved(s) ? "solved" : "ongoing"),

  solve,
  findMistakes,
  clearMistakes,
  revealOne,
  difficulty,

  hint,
  hintRungs: LIGHTUP_RUNGS,
  hintMarks: {
    roles: {
      ring: 'each square the step decides: it takes a bulb, or, when the sentence says it "can\'t hold a bulb", a cross.',
      outline:
        "what the step reasons from, told apart by the sentence's nouns: “the outlined clue” has a ring round its wall, and “the outlined dark square”, which still has to be lit, and the other squares the reason rests on, such as a clue's bulbs, have a double ring.",
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
  rulesOut: {
    name: "Cross out the other squares round a numbered wall once it has all its lights",
    bring: ruledOut,
  },

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
};

registerGame(lightupGame);

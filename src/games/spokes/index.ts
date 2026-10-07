/**
 * Spokes — native TS port of `puzzles/unreleased/spokes.c` (© 2014 Lennard
 * Sprong). Draw horizontal, vertical and diagonal lines between numbered hubs
 * so that every hub carries exactly its number of lines, no two diagonals
 * cross, and all the hubs end up in one connected group.
 *
 * Controls: the targets are the spoke dots on each hub's rim, addressed on
 * the keyboard cursor's half-grid. A click aims at the dot its press points
 * toward, and a drag from a hub aims at the dot toward where it lets go; each
 * toggles the line (left) or a "ruled out" mark (right).
 *
 * Fork addition: `findMistakes` re-solves from the clues and flags every line
 * the unique solution forbids (and every mark it needs a line at), so Check &
 * Save refuses to checkpoint a board that has already gone wrong. That is
 * distinct from the live error coloring — a red rim on a group that can no
 * longer reach the rest, a red clue on an over-filled hub — which is immediate
 * local validation, not a comparison against the answer.
 */

import { assertNever } from "../../engine/assert-never.ts";
import type { DifficultyContract } from "../../engine/difficulty.ts";
import {
  type Game,
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  type PresetMenu,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import { fromCoord } from "../../engine/geometry.ts";
import type { PointerAction } from "../../engine/hint-gesture.ts";
import {
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { transposeDimensions } from "../../engine/params.ts";
import {
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  moveCursor,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  buttonVerb,
  interpretTargetVerbs,
  pressTarget,
  type TargetGeometry,
  type TargetVerb,
  type TargetVerbs,
  verbClicks,
} from "../../engine/target-verb.ts";
import type { GameStatus, Point } from "../../engine/types.ts";
import { newSpokesDesc } from "./generator.ts";
import { type Marked, type Spoke, say } from "./hint-text.ts";
import {
  colors,
  computeSize,
  FLASH_TIME,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type SpokesDrawState,
  toCoord,
} from "./render.ts";
import {
  deduceSpokesPlan,
  type SpokesFiring,
  spokesSolve,
  spokesValidate,
} from "./solver.ts";
import {
  clearBoard,
  cloneBoard,
  cloneState,
  crossingSpoke,
  DIFFCOUNT,
  decodeParams,
  defaultParams,
  encodeParams,
  getSpoke,
  newState,
  newUi,
  PRESETS,
  paramConfig,
  SPOKE_DIRS,
  SPOKE_EMPTY,
  SPOKE_HIDDEN,
  SPOKE_LINE,
  SPOKE_MARKED,
  type SpokesMistake,
  type SpokesMove,
  type SpokesParams,
  type SpokesSpokeRef,
  type SpokesState,
  type SpokesUi,
  spokesPlace,
  syncDiagonalBlock,
  textFormat,
  validateParams,
} from "./state.ts";

// --- presets ----------------------------------------------------------------

function presets(): PresetMenu<SpokesParams> {
  return {
    title: "Spokes",
    submenu: PRESETS.map((p) => ({ params: { ...p } })),
  };
}

// --- input ------------------------------------------------------------------

/** The eight-way direction a drag from a hub's center points in: the pointer
 * angle snapped to the nearest 45°, in `DIR_*` order. */
function dragDirection(dx: number, dy: number): number {
  const angle = (Math.atan2(dy, dx) + Math.PI / 8) / (Math.PI / 4);
  return Math.trunc(angle + 16) & 7;
}

/** The dot a point on hub `(hx, hy)`'s tile aims at: the half-grid position
 * of the spoke toward the neighbor it points to, or `null` in the hub's dead
 * zone or toward no neighbor. A click aims from where it lands and a drag from
 * where it has got to, so both read this. */
function aimedSpoke(
  state: SpokesState,
  ts: number,
  hx: number,
  hy: number,
  p: Point,
): Point | null {
  const dx = p.x - toCoord(hx, ts);
  const dy = p.y - toCoord(hy, ts);
  // A point that hasn't left the hub yet points nowhere in particular.
  if (dx * dx + dy * dy < (ts * ts) / 22) return null;
  const d = SPOKE_DIRS[dragDirection(dx, dy)];
  const nx = hx + d.dx;
  const ny = hy + d.dy;
  if (nx < 0 || nx >= state.w || ny < 0 || ny >= state.h) return null;
  return { x: 3 * hx + d.dx, y: 3 * hy + d.dy };
}

/** The hub a half-grid position belongs to and the offset of its dot, which
 * is `(0, 0)` on the hub's own center. The half-grid puts a hub on every third
 * sub-cell and its eight spoke dots on the ones between. */
function onHalfGrid(t: Point): { hx: number; hy: number; ox: number; oy: number } {
  return {
    hx: ((t.x + 1) / 3) | 0,
    hy: ((t.y + 1) / 3) | 0,
    ox: ((t.x + 1) % 3) - 1,
    oy: ((t.y + 1) % 3) - 1,
  };
}

/** A verb on the spoke whose dot is at `t`: an empty spoke becomes `mark`, and
 * anything else is cleared. */
const toggleSpoke =
  (mark: number) =>
  (state: SpokesState, t: Point): SpokesMove | null => {
    const { w } = state;
    const { hx, hy, ox, oy } = onHalfGrid(t);
    if (ox === 0 && oy === 0) return null;
    const from = hy * w + hx;
    const to = from + oy * w + ox;
    const start = Math.min(from, to);
    const end = Math.max(from, to);
    const sx = start % w;
    const sy = (start / w) | 0;

    for (let dir = 0; dir < 4; dir++) {
      if ((sy + SPOKE_DIRS[dir].dy) * w + sx + SPOKE_DIRS[dir].dx !== end) continue;
      const old = getSpoke(state.spokes[start], dir);
      if (old === SPOKE_HIDDEN) return null;

      // A diagonal whose crossing partner is already a line is auto-ruled-out
      // and inert — the game placed that mark, so the player can't toggle it
      // (and can't draw a crossing line). Erasing the *line* clears it.
      const cross = crossingSpoke(state, start, dir);
      if (cross && getSpoke(state.spokes[cross.i], cross.d) === SPOKE_LINE) return null;

      const next = old !== SPOKE_EMPTY ? SPOKE_EMPTY : mark;
      return { kind: "set", index: start, dir, state: next };
    }
    return null;
  };

type SpokesVerb = TargetVerb<SpokesState, SpokesUi, Point, SpokesMove>;
const lineVerb: SpokesVerb = {
  does:
    "draw a line from its hub to the hub it points at, or clear it if it " +
    "already holds a line or a mark",
  apply: toggleSpoke(SPOKE_LINE),
};
const markVerb: SpokesVerb = {
  does: "mark it as unused, or clear it if it already holds a line or a mark",
  apply: toggleSpoke(SPOKE_MARKED),
};

/** The spoke dots, addressed on the cursor's half-grid. A press addresses the
 * dot its hub's tile aims it at; the cursor rests on a dot, or on a hub's
 * center, which addresses none. */
const geometry: TargetGeometry<SpokesState, SpokesUi, SpokesDrawState, Point> = {
  noun: "dot",
  pointerTarget(state, ds, p) {
    const ts = ds.tileSize;
    const hx = fromCoord(p.x, ts, 0);
    const hy = fromCoord(p.y, ts, 0);
    if (hx < 0 || hx >= state.w || hy < 0 || hy >= state.h) return null;
    return aimedSpoke(state, ts, hx, hy, p);
  },
  pointAt(_state, ds, t) {
    // Past the dead zone and short of the tile's edge, along the dot's line.
    const ts = ds.tileSize;
    const { hx, hy, ox, oy } = onHalfGrid(t);
    const r = (0.35 * ts) / Math.hypot(ox, oy);
    return {
      x: Math.round(toCoord(hx, ts) + r * ox),
      y: Math.round(toCoord(hy, ts) + r * oy),
    };
  },
  cursorTarget(_state, ui) {
    const { ox, oy } = onHalfGrid(ui.cursor);
    return ox === 0 && oy === 0 ? null : { x: ui.cursor.x, y: ui.cursor.y };
  },
  parkCursor(ui, t) {
    ui.cursor.x = t.x;
    ui.cursor.y = t.y;
  },
  moveCursor: (state, ui, button) =>
    moveCursor(ui.cursor, button, state.w * 3 - 2, state.h * 3 - 2),
};

const targetVerbs: TargetVerbs<
  SpokesState,
  SpokesUi,
  SpokesDrawState,
  Point,
  SpokesMove
> = { geometry, primary: lineVerb, secondary: markVerb };

function interpretMove(
  state: SpokesState,
  ui: SpokesUi,
  ds: SpokesDrawState,
  p: Point,
  rawButton: number,
): SpokesMove | null | UiUpdate {
  const { w, h } = state;
  const ts = ds.tileSize;
  const button = stripModifiers(rawButton);

  if (button === LEFT_BUTTON || button === RIGHT_BUTTON) {
    const x = fromCoord(p.x, ts, 0);
    const y = fromCoord(p.y, ts, 0);
    if (x < 0 || x >= w || y < 0 || y >= h) return null;
    ui.dragStart = y * w + x;
    ui.drag = button === LEFT_BUTTON ? "left" : "right";
    pressTarget(
      targetVerbs,
      ui,
      aimedSpoke(state, ts, x, y, p) ?? { x: 3 * x, y: 3 * y },
    );
  }

  if (
    button === LEFT_BUTTON ||
    button === RIGHT_BUTTON ||
    button === LEFT_DRAG ||
    button === RIGHT_DRAG
  ) {
    if (ui.dragStart === -1) return null;
    const sx = ui.dragStart % w;
    const sy = (ui.dragStart / w) | 0;
    const aimed = aimedSpoke(state, ts, sx, sy, p);
    ui.dragEnd = aimed
      ? ui.dragStart + (aimed.y - 3 * sy) * w + (aimed.x - 3 * sx)
      : -1;
    return UI_UPDATE;
  }

  // A release, dragged or not, applies its button's verb to the spoke it was
  // aiming at when it let go.
  if (button === LEFT_RELEASE || button === RIGHT_RELEASE) {
    const from = ui.dragStart;
    const to = ui.dragEnd;
    const verb = buttonVerb(targetVerbs, button);
    const pressed = ui.drag !== "none";
    ui.dragStart = -1;
    ui.dragEnd = -1;
    ui.drag = "none";
    if (!pressed) return null;
    if (from === -1 || to === -1) return UI_UPDATE;
    const fx = from % w;
    const fy = (from / w) | 0;
    const dot = { x: 3 * fx + ((to % w) - fx), y: 3 * fy + (((to / w) | 0) - fy) };
    return verb?.apply(state, dot, ui) ?? UI_UPDATE;
  }

  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton);
}

// --- moves ------------------------------------------------------------------

function executeMove(state: SpokesState, move: SpokesMove): SpokesState {
  const next = cloneState(state);

  if (move.kind === "solve") {
    clearBoard(next);
    for (const { index, dir, state: s } of move.spokes) {
      if (getSpoke(next.spokes[index], dir) !== SPOKE_HIDDEN) {
        spokesPlace(next, index, dir, s);
      }
    }
    return next;
  }
  if (move.kind !== "set") return assertNever(move, "spokes: executeMove");

  const old = getSpoke(next.spokes[move.index], move.dir);
  if (old !== SPOKE_HIDDEN) {
    spokesPlace(next, move.index, move.dir, move.state);
    syncDiagonalBlock(next, move.index, move.dir, old, move.state);
  }
  return next;
}

// --- solving ----------------------------------------------------------------

/** Deduce the unique solution from the clues alone, on a fresh board that
 * keeps this state's spoke topology (which hubs exist, which spokes can) but
 * none of the player's marks. `null` when the board is not uniquely
 * deducible. */
function solveFromClues(state: SpokesState) {
  const board = cloneBoard(state);
  clearBoard(board);
  return spokesSolve(board, null, DIFFCOUNT) === "valid" ? board : null;
}

function solve(orig: SpokesState): SolveResult<SpokesMove> {
  const solved = solveFromClues(orig);
  if (!solved) return { ok: false, error: PUZZLE_NOT_REASONABLE };

  const spokes: SpokesSpokeRef[] = [];
  for (let i = 0; i < solved.w * solved.h; i++) {
    for (let d = 0; d < 4; d++) {
      const s = getSpoke(solved.spokes[i], d);
      if (s === SPOKE_LINE || s === SPOKE_MARKED)
        spokes.push({ index: i, dir: d, state: s });
    }
  }
  return { ok: true, move: { kind: "solve", spokes } };
}

function findMistakes(state: SpokesState): readonly SpokesMistake[] {
  const solved = solveFromClues(state);
  if (!solved) return [];

  const out: SpokesMistake[] = [];
  // `d < 4` visits each edge exactly once, from its lower-indexed end.
  for (let i = 0; i < state.w * state.h; i++) {
    for (let d = 0; d < 4; d++) {
      const player = getSpoke(state.spokes[i], d);
      const answer = getSpoke(solved.spokes[i], d);
      if (player === SPOKE_LINE && answer !== SPOKE_LINE) {
        out.push({ kind: "line", index: i, dir: d });
      } else if (player === SPOKE_MARKED && answer === SPOKE_LINE) {
        out.push({ kind: "mark", index: i, dir: d });
      }
    }
  }
  return out;
}

// --- hint (a second projection of the deductive solver) ---------------------

/**
 * What a Spokes hint leg is about; its marks are the ones its words name.
 * `spokes` are the spokes the firing still forces from this leg on (the earlier
 * legs', once followed, are real lines or marks, and the renderer tints only a
 * spoke that is still EMPTY), each with what the step sets it to: a ringed
 * `SPOKE_LINE` spoke is drawn as a `COL_HINT` line ("draw this"), a
 * `SPOKE_MARKED` one as a `COL_HINT` dot at its rim ("rule this out"), so the
 * picture never claims a different action than the words. `evidence` are the
 * hubs whose clue or lines are the argument. The whole deduction stays visible
 * while its legs are followed one at a time. `w` is the grid width, which a
 * spoke's canonical end is taken in.
 */
export interface SpokesHint {
  spokes: SpokesSpokeRef[];
  evidence: number[];
  w: number;
}

const spokeOf = (sp: SpokesSpokeRef, w: number): Spoke =>
  canonicalEdge(sp.index, sp.dir, w);

const markedOf = (hl: SpokesHint): Marked => ({
  spokes: hl.spokes.map((sp) => spokeOf(sp, hl.w)),
  hubs: hl.evidence,
});

/** The hint's rungs: the kinds of the solver's firings. */
export const SPOKES_RUNGS = [
  "twoOnes",
  "saturation",
  "exhaustion",
  "contradiction",
] as const;
export type SpokesRung = (typeof SPOKES_RUNGS)[number];

/**
 * Narrate why a firing is forced — one crisp line for a player who knows the
 * rules, premise then conclusion, in the necessity voice (the hint quality bar).
 * Every claim here is one {@link deduceSpokesPlan} has checked.
 */
function narrate(f: SpokesFiring, hl: SpokesHint): Sentence {
  const m = markedOf(hl);
  switch (f.kind) {
    case "twoOnes":
      return say.twoOnes(m);
    case "saturation":
      return say.saturation(f.forced.length, m);
    case "exhaustion":
      return say.exhaustion(m);
    case "contradiction":
      return say.contradiction(f.hypothesis?.state === SPOKE_LINE, f.breakKind, m);
  }
}

/** The short continuation narration for legs 2+ of a multi-spoke firing. */
function continuation(f: SpokesFiring, hl: SpokesHint): Sentence {
  return say.continuation(f.kind === "saturation", markedOf(hl));
}

/** Flatten one firing into its journey of legs: leg 0 carries the full
 * narration, the rest continue it. Each leg shows the spokes still to settle,
 * so the whole deduction stays on screen as its spokes are drawn one by one. */
function stepsOfFiring(
  f: SpokesFiring,
  w: number,
): HintStep<SpokesMove, SpokesHint, SpokesRung>[] {
  return f.forced.map((sp, leg) => {
    const highlights: SpokesHint = {
      spokes: f.forced.slice(leg),
      evidence: f.evidenceHubs,
      w,
    };
    const words = leg === 0 ? narrate(f, highlights) : continuation(f, highlights);
    return {
      move: { kind: "set", ...sp },
      rung: f.kind,
      explanation: words.text,
      words,
      highlights,
      continuesPrevious: leg > 0,
    };
  });
}

function hint(state: SpokesState): HintResult<SpokesMove, SpokesHint, SpokesRung> {
  if (!solveFromClues(state)) {
    return { ok: false, error: PUZZLE_NOT_REASONABLE };
  }

  const plan = deduceSpokesPlan(cloneBoard(state));
  if (plan.length === 0) {
    return { ok: false, error: DEDUCTION_EXHAUSTED };
  }
  return { ok: true, steps: plan.flatMap((f) => stepsOfFiring(f, state.w)) };
}

/** A move completes the current leg when it sets the leg's exact spoke to the
 * hinted state. Following a *different* spoke of the same firing reads as
 * off-plan, but a recompute simply re-offers the firing's remaining spokes, so
 * the deduction resumes either way. */
function hintKeepTrack(
  m: SpokesMove,
  step: HintStep<SpokesMove, SpokesHint>,
  state: SpokesState,
): HintTrackVerdict {
  if (m.kind !== "set") return "off";
  const target = step.move;
  if (target.kind !== "set") return "off";
  return sameEdge(m, target, state.w) && m.state === target.state ? "completed" : "off";
}

/** A click on the spoke's dot, beside the hub the move names it from. */
function hintGesture(
  state: SpokesState,
  ui: SpokesUi,
  ds: SpokesDrawState,
  m: SpokesMove,
  step: HintStep<SpokesMove, SpokesHint>,
): readonly PointerAction[] {
  if (m.kind !== "set") return [];
  const { w } = state;
  const d = SPOKE_DIRS[m.dir];
  const dot = { x: 3 * (m.index % w) + d.dx, y: 3 * ((m.index / w) | 0) + d.dy };
  return verbClicks(targetVerbs, { executeMove, hintKeepTrack }, state, ui, ds, step, [
    dot,
  ]);
}

/** Do two `set` moves name the same edge? A spoke has two ends; a move may cite
 * either, so compare in the canonical `dir < 4` form. */
function sameEdge(
  a: { index: number; dir: number },
  b: { index: number; dir: number },
  w: number,
): boolean {
  const ca = canonicalEdge(a.index, a.dir, w);
  const cb = canonicalEdge(b.index, b.dir, w);
  return ca.index === cb.index && ca.dir === cb.dir;
}

/** The canonical end of an edge — the `dir < 4` end, so the two ends of one
 * spoke reduce to the same `(index, dir)`. */
function canonicalEdge(
  index: number,
  dir: number,
  w: number,
): { index: number; dir: number } {
  if (dir < 4) return { index, dir };
  const nx = (index % w) + SPOKE_DIRS[dir].dx;
  const ny = ((index / w) | 0) + SPOKE_DIRS[dir].dy;
  return { index: ny * w + nx, dir: dir ^ 4 };
}

// --- the game ---------------------------------------------------------------

/** Spokes' difficulty contract (`engine/difficulty.ts`). `spokesSolve` returns
 * `"valid"` (fully and uniquely solved — what the generator gates on),
 * `"incomplete"` or `"invalid"`, run on a fresh board from the clues alone. */
const difficulty: DifficultyContract<SpokesParams> = {
  solveAtCap: (p, desc, cap) => {
    const ret = spokesSolve(newState(p, desc), null, cap);
    return ret === "valid" ? "solved" : ret === "invalid" ? "impossible" : "unsolved";
  },
};

export const spokesGame: Game<
  SpokesParams,
  SpokesState,
  SpokesMove,
  SpokesUi,
  SpokesDrawState,
  SpokesMistake,
  SpokesHint,
  SpokesRung
> = {
  id: "spokes",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,

  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newSpokesDesc,
  newState,
  newUi,
  prefs: [
    {
      // Fork aid: lift a hub once its clue is met (visual only, no lock), the
      // cue Bridges offers on a satisfied island; see `COL_SATISFIED`.
      kw: "mark-satisfied",
      name: "Highlight hubs once their spoke count is met",
      type: "boolean",
      get: (ui) => ui.markSatisfied,
      set: (ui, v) => {
        ui.markSatisfied = v;
      },
    },
  ],

  targetVerbs,
  interpretMove,
  executeMove,
  status: (s): GameStatus => (spokesValidate(s) === "valid" ? "solved" : "ongoing"),

  solve,
  difficulty,
  hint,
  hintMarks: {
    roles: {
      ring: "each spoke the step decides: a line in the hint color is one to draw, and a ring round a dot on a hub's rim is one to rule out by marking that dot as unused, as described above.",
      outline: "the hubs the step reasons from, with a halo in a second color.",
    },
  },
  hintRungs: SPOKES_RUNGS,
  hintKeepTrack,
  hintGesture,
  findMistakes,
  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  solvedFlash: () => FLASH_TIME,
};

registerGame(spokesGame);

/**
 * Boats — native TS port of `unreleased/boats.c` (Lennard Sprong, 2012).
 *
 * *Battleships*: locate a known fleet in the grid. The numbers on the right and
 * bottom count the occupied cells of each row and column, a few boat segments
 * are given with their orientation, and no two boats touch — not even
 * diagonally. A boat is crossed off the list at the bottom once it is completely
 * surrounded by water.
 *
 * **Input is a line-fill drag.** A left-click cycles a square empty → boat →
 * water → empty; a right-click toggles water; and a press-and-drag fills a run
 * along whichever axis the pointer moved further, previewing as it goes and
 * committing on release. A keyboard cursor with Enter (boat) and Space (water)
 * does the same one square at a time, and Ctrl/Shift with an arrow fills a line
 * as the cursor moves.
 *
 * Unresolved segments are the interesting part of the model: the player only
 * ever says "there is *something* here", and `adjustShips` turns that into the
 * right shape — end cap, center or single — as soon as the neighbors decide it.
 *
 * Layout: [`state.ts`](./state.ts) (params, cell model, codecs, moves/ui),
 * [`validate.ts`](./validate.ts) (the shared status passes),
 * [`solver.ts`](./solver.ts) (the four deduction tiers + `findMistakes`),
 * [`generator.ts`](./generator.ts) (solver-gated generation + `validateParams`),
 * [`hint-solver.ts`](./hint-solver.ts) and [`hint-text.ts`](./hint-text.ts)
 * (the explained hint), [`render.ts`](./render.ts).
 */

import { assertNever } from "../../engine/assert-never.ts";
import type { DifficultyContract } from "../../engine/difficulty.ts";
import { winFlash } from "../../engine/flash.ts";
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
import { commonHintRefusal, DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { CELL, type MarkRef, type Narration } from "../../engine/hint-words.ts";
import {
  dimensionParamConfig,
  parseConfigInt,
  transposeDimensions,
} from "../../engine/params.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  endDrag,
  gridCursorMove,
  isCursorMove,
  isEraseKey,
  isMouseDown,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  MIDDLE_BUTTON,
  MOD_CTRL,
  MOD_SHFT,
  moveDrag,
  RIGHT_BUTTON,
  startDrag,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { ConfigValues, GameStatus, Point } from "../../engine/types.ts";
import { newBoatsDesc, validateParams } from "./generator.ts";
import { type BoatsFiring, type BoatsSquare, deduceBoatsPlan } from "./hint-solver.ts";
import { type BoatsMarks, say } from "./hint-text.ts";
import {
  type BoatsDrawState,
  colors,
  computeSize,
  FLASH_TIME,
  fromCoord,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import { type BoatsMistake, findMistakes, solveBoats, solveToGrid } from "./solver.ts";
import {
  type BoatsFill,
  type BoatsFillFrom,
  type BoatsMove,
  type BoatsParams,
  type BoatsState,
  type BoatsUi,
  boardOf,
  DIFF_NAMES,
  decodeFleet,
  decodeParams,
  defaultFleet,
  defaultParams,
  EMPTY,
  encodeFleet,
  encodeParams,
  fillChangesAnything,
  fillOf,
  newState,
  newUi,
  PRESETS,
  presetParams,
  presetTitle,
  SHIP_VAGUE,
  STATUS_COMPLETE,
  textFormat,
  validateDesc,
  WATER,
} from "./state.ts";
import { adjustShips, validateFullState } from "./validate.ts";

function presets(): PresetMenu<BoatsParams> {
  return {
    title: "Boats",
    submenu: PRESETS.map((_, i) => {
      const p = presetParams(i);
      return { title: presetTitle(p), params: p };
    }),
  };
}

// --- input -----------------------------------------------------------------

/** Left-click cycles empty → boat → water → empty. */
function leftCycle(from: BoatsFill): BoatsFill {
  return from === "B" ? "W" : from === "-" ? "B" : "-";
}

function interpretMove(
  state: BoatsState,
  ui: BoatsUi,
  ds: BoatsDrawState,
  point: Point,
  rawButton: number,
): BoatsMove | null | UiUpdate {
  const { w, h } = state.params;
  const ts = ds.tileSize;
  const button = stripModifiers(rawButton);

  let gx = fromCoord(point.x, ts);
  let gy = fromCoord(point.y, ts);
  // Players usually want to fill a whole line, so the click target on the far
  // edges reaches into the number row/column (upstream does the same).
  if (gx === w) gx = w - 1;
  if (gy === h) gy = h - 1;

  if (isMouseDown(button) && gx >= 0 && gy >= 0 && gx < w && gy < h) {
    let from: BoatsFillFrom = fillOf(state.grid[gy * w + gx]);
    let to: BoatsFill = "-";

    if (button === LEFT_BUTTON) {
      to = leftCycle(from);
      // Clearing to water applies to the whole dragged line regardless of
      // what each square currently holds.
      if (to === "W") from = "*";
    }
    if (button === RIGHT_BUTTON) to = from === "-" ? "W" : "-";
    if (button === MIDDLE_BUTTON) from = "*";

    ui.dragFrom = from;
    ui.dragTo = to;
    ui.dragOk = true;
    startDrag(ui.drag, gx, gy);
    ui.cursor.visible = false;
    return UI_UPDATE;
  }

  if ((isMouseDrag(button) || isMouseRelease(button)) && ui.drag.live) {
    if (gx < 0 || gy < 0 || gx >= w || gy >= h) {
      ui.dragOk = false;
    } else {
      // A drag is limited to one row or column: whichever coordinate has moved
      // less snaps back to the drag's start.
      if (Math.abs(gx - ui.drag.sx) < Math.abs(gy - ui.drag.sy)) gx = ui.drag.sx;
      else gy = ui.drag.sy;

      moveDrag(ui.drag, gx, gy);
      ui.dragOk = true;
    }

    if (isMouseRelease(button)) {
      const commit = ui.dragOk;
      const from = ui.dragFrom as BoatsFillFrom;
      const to = ui.dragTo as BoatsFill;
      const { sx, sy, ex, ey } = ui.drag;
      const x0 = Math.min(sx, ex);
      const x1 = Math.max(sx, ex);
      const y0 = Math.min(sy, ey);
      const y1 = Math.max(sy, ey);
      ui.dragOk = false;
      // Liveness ends with the release, not with the next press: before this
      // the branch was entered on `dragTo !== ""`, which the release left set,
      // so a stray drag event arriving after one could re-arm the fill.
      endDrag(ui.drag);

      if (commit && fillChangesAnything(state, x0, y0, x1, y1, from, to))
        return { kind: "fill", x0, y0, x1, y1, from, to };
    }
    return UI_UPDATE;
  }

  if (isCursorMove(button)) {
    const fromX = ui.cursor.x;
    const fromY = ui.cursor.y;
    const moved = gridCursorMove(button, ui.cursor.x, ui.cursor.y, w, h);
    if (moved) {
      ui.cursor.x = moved.x;
      ui.cursor.y = moved.y;
    }
    ui.cursor.visible = true;

    // Hold Ctrl (boats), Shift (water) or both (clear) to fill as you move.
    if (rawButton & (MOD_CTRL | MOD_SHFT)) {
      const to: BoatsFill =
        rawButton & MOD_CTRL ? (rawButton & MOD_SHFT ? "-" : "B") : "W";
      const from: BoatsFillFrom = to === "-" ? "*" : "-";
      const x0 = Math.min(fromX, ui.cursor.x);
      const x1 = Math.max(fromX, ui.cursor.x);
      const y0 = Math.min(fromY, ui.cursor.y);
      const y1 = Math.max(fromY, ui.cursor.y);

      if (fillChangesAnything(state, x0, y0, x1, y1, from, to))
        return { kind: "fill", x0, y0, x1, y1, from, to };
    }

    return UI_UPDATE;
  }

  if (
    ui.cursor.visible &&
    (button === CURSOR_SELECT || button === CURSOR_SELECT2 || isEraseKey(button))
  ) {
    const x = ui.cursor.x;
    const y = ui.cursor.y;
    const from = fillOf(state.grid[y * w + x]);
    let to: BoatsFill = "-";
    if (button === CURSOR_SELECT && from === "-") to = "B";
    if (button === CURSOR_SELECT2 && from === "-") to = "W";

    if (fillChangesAnything(state, x, y, x, y, from, to))
      return { kind: "fill", x0: x, y0: y, x1: x, y1: y, from, to };
  }

  return null;
}

// --- moves -----------------------------------------------------------------

function executeMove(state: BoatsState, move: BoatsMove): BoatsState {
  const b = boardOf(state);
  const { w, grid } = b;

  if (move.kind === "fill") {
    const { x0, x1, y0, y1, from, to } = move;
    const fill = to === "B" ? SHIP_VAGUE : to === "W" ? WATER : EMPTY;
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        const i = y * w + x;
        if (state.gridClues[i] !== EMPTY) continue; // a given square is fixed
        if (from !== "*" && fillOf(grid[i]) !== from) continue;
        grid[i] = fill;
      }
    }
  } else if (move.kind === "solve") {
    if (move.grid.length !== grid.length)
      throw new Error("boats: solve move has the wrong grid size");
    grid.set(move.grid);
  } else {
    return assertNever(move, "boats: executeMove");
  }

  // Resolve every segment's shape from its neighbors, then see whether that
  // finished the puzzle.
  adjustShips(b);
  const completed = validateFullState(b) === STATUS_COMPLETE;

  return {
    ...state,
    grid,
    completed,
    // A solve that did not actually finish the grid is not cheating.
    cheated: move.kind === "solve" ? completed : state.cheated,
  };
}

function solve(orig: BoatsState): SolveResult<BoatsMove> {
  const result = solveToGrid(orig);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, move: { kind: "solve", grid: Array.from(result.grid) } };
}

function status(s: BoatsState): GameStatus {
  return s.completed ? "solved" : "ongoing";
}

// --- hint (a second projection of the deduction engine) ---------------------

/**
 * What a Boats hint step marks on the board. `targets` are the squares to
 * decide — drawn in `COL_HINT` in the shape of the action each one is (a boat
 * mark for a segment, a water mark for water), because a single color standing
 * for two different actions reads as one action (docs/games/hints.md § "Echo
 * the move's shape in the hint color"). `evidence` is the particular squares
 * the deduction reasons from, outlined `COL_HINT_CELL`; `line` the row or column
 * the sentence names, hatched with its clue.
 */
export interface BoatsHint {
  targets: BoatsSquare[];
  evidence: Point[];
  line: Point[];
  /** The board's size, which bounds what the renderer draws. */
  w: number;
  h: number;
}

/** The squares `hl` draws on a `w` by `h` board, by role: the renderer skips
 * any off the board, and draws a decided square's mark over an outline. */
function drawnSquares(hl: BoatsHint, w: number, h: number) {
  const on = (c: Point): boolean => c.x >= 0 && c.y >= 0 && c.x < w && c.y < h;
  const targets = hl.targets.filter(on);
  const decided = new Set(targets.map((t) => t.y * w + t.x));
  return {
    targets,
    evidence: hl.evidence.filter((c) => on(c) && !decided.has(c.y * w + c.x)),
    line: hl.line.filter(on),
  };
}

/** What a step's highlights draw: the `drawn` half of Boats' legend. */
function boatsHintMarks(hl: BoatsHint): MarkRef[] {
  const { targets, evidence, line } = drawnSquares(hl, hl.w, hl.h);
  return [
    { role: "ring", kind: CELL, elements: targets.map(({ x, y }) => ({ x, y })) },
    { role: "outline", kind: CELL, elements: evidence },
    { role: "stripes", kind: CELL, elements: line },
  ] as MarkRef[];
}

/** Which sentence a firing speaks, and with what values, naming the squares
 * `hl` marks. The words are [`hint-text.ts`](./hint-text.ts)'s. */
function narrate(f: BoatsFiring, hl: BoatsHint): Narration {
  const t = f.technique;
  const { evidence, line } = drawnSquares(hl, hl.w, hl.h);
  const pt = ({ x, y }: Point): Point => ({ x, y });
  const m: BoatsMarks = {
    ships: f.squares.filter((s) => s.ship).map(pt),
    waters: f.squares.filter((s) => !s.ship).map(pt),
    follows: f.consequences.map(pt),
    evidence,
    line,
  };

  switch (t.kind) {
    case "givenClue":
      return say.givenClue(t, m);
    case "neverTouch":
      return say.neverTouch(m);
    case "lineSatisfied":
      return say.lineSatisfied(t, m);
    case "lineForced":
      return say.lineForced(t, m);
    case "allWaterPlaced":
      return say.allWaterPlaced(m);
    case "centerForced":
      return say.centerForced(t, m);
    case "isolated":
      return say.isolated(m);
    case "mustExtend":
      return say.mustExtend(m);
    case "centerCount":
      return say.centerCount(t, m);
    case "growTooLong":
      return say.growTooLong(t, m);
    case "mustGrow":
      return say.mustGrow(t, m);
    case "runTooShort":
      return say.runTooShort(t, m);
    case "onlyRunsLeft":
      return say.onlyRunsLeft(t, m);
    case "sharedDiagonal":
      return say.sharedDiagonal(t, m);
    case "refuted":
      return say.refuted(t, m);
  }
}

/**
 * The moves one firing asks for, in reading order with boats before water.
 *
 * A `fill` move is a rectangle with `from: "-"`, so it sets every *still-empty*
 * square in its span — which makes a whole-line deduction one move rather than
 * eight. The span is therefore only widened when every square in it is either a
 * target or already decided **on the board as this firing fired**; anything else
 * would quietly decide a square the step never claimed.
 */
function legMoves(f: BoatsFiring, w: number, squares: BoatsSquare[]): BoatsMove[] {
  const out: BoatsMove[] = [];
  const fill = (x0: number, y0: number, x1: number, y1: number, ship: boolean) =>
    ({ kind: "fill", x0, y0, x1, y1, from: "-", to: ship ? "B" : "W" }) as BoatsMove;

  for (const ship of [true, false]) {
    const group = squares.filter((s) => s.ship === ship);
    if (group.length === 0) continue;

    const x0 = Math.min(...group.map((s) => s.x));
    const x1 = Math.max(...group.map((s) => s.x));
    const y0 = Math.min(...group.map((s) => s.y));
    const y1 = Math.max(...group.map((s) => s.y));

    let spanIsOurs = x0 === x1 || y0 === y1;
    for (let x = x0; spanIsOurs && x <= x1; x++)
      for (let y = y0; spanIsOurs && y <= y1; y++) {
        if (f.grid[y * w + x] !== EMPTY) continue; // untouched by a `from: "-"` fill
        if (!group.some((s) => s.x === x && s.y === y)) spanIsOurs = false;
      }

    if (spanIsOurs) out.push(fill(x0, y0, x1, y1, ship));
    else for (const s of group) out.push(fill(s.x, s.y, s.x, s.y, ship));
  }
  return out;
}

/**
 * One firing is **one journey**: a deduction that forces several squares is a
 * single hint whose continuation legs are flagged `continuesPrevious`, so the
 * midend keeps it displayed across the legs and auto-play walks them as one
 * (docs/games/hints.md § "Group one firing into one step"). The narration
 * rides on the opening leg; the rest carry the same highlight so the picture
 * never shrinks mid-journey.
 */
function stepsFor(
  f: BoatsFiring,
  w: number,
  h: number,
): HintStep<BoatsMove, BoatsHint>[] {
  // The never-touch water a placement drags along is part of *this* step — it
  // is the rule doing its work, not a further deduction — so it is highlighted
  // and moved with the firing, and named only in a closing clause.
  const targets = [...f.squares, ...f.consequences];
  const highlights: BoatsHint = { targets, evidence: f.evidence, line: f.line, w, h };
  const words = narrate(f, highlights);

  return legMoves(f, w, targets).map((move, i) => ({
    move,
    explanation: words.text,
    words,
    highlights,
    continuesPrevious: i > 0,
  }));
}

function hint(state: BoatsState): HintResult<BoatsMove, BoatsHint> {
  // `findMistakes` is a re-solve, so this also catches the placement that breaks
  // no rule *yet* but appears in no solution — deducing onward from a doomed
  // board would produce confident nonsense (docs/games/hints.md § "Refusal
  // couples to the mistake overlay").
  const refusal = commonHintRefusal(state.completed, findMistakes(state).length);
  if (refusal) return refusal;

  const plan = deduceBoatsPlan(state);
  const steps = plan.firings.flatMap((f) =>
    stepsFor(f, state.params.w, state.params.h),
  );
  if (steps.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  return { ok: true, steps };
}

/**
 * A move completes the step when every square **this leg** asks for ends up as
 * asked.
 *
 * The judgment is per *leg*, not per journey, and that distinction is
 * load-bearing: the midend advances the plan on `"completed"` and holds the
 * same step on `"onTrack"`, so a journey whose legs could only complete
 * together would stall on its first leg for ever (and `executeHint` would
 * re-apply that leg on every tick). A leg's own squares are the journey's
 * targets that fall inside its move's rectangle and match its fill, so the
 * split needs nothing stored beyond `step.move`.
 *
 * No shrink-in-place is needed on `"onTrack"` (contrast Filling): a Boats fill
 * carries `from: "-"`, so re-applying a partly-done leg touches only what is
 * still empty.
 */
function hintKeepTrack(
  m: BoatsMove,
  step: HintStep<BoatsMove, BoatsHint>,
  state: BoatsState,
): HintTrackVerdict {
  if (m.kind !== "fill" || step.move.kind !== "fill") return "off";
  const hl = step.highlights;
  if (!hl) return "off";

  const leg = step.move;
  const legTargets = hl.targets.filter(
    (t) =>
      t.x >= leg.x0 &&
      t.x <= leg.x1 &&
      t.y >= leg.y0 &&
      t.y <= leg.y1 &&
      t.ship === (leg.to === "B"),
  );
  if (legTargets.length === 0) return "off";

  const { w } = state.params;
  const after = executeMove(state, m);
  let done = 0;
  for (const t of legTargets) {
    const i = t.y * w + t.x;
    const want: BoatsFill = t.ship ? "B" : "W";
    if (fillOf(after.grid[i]) === want) {
      done++;
      continue;
    }
    // Touched one of this leg's squares and set it to something else.
    if (fillOf(after.grid[i]) !== fillOf(state.grid[i])) return "off";
  }

  if (done === legTargets.length) return "completed";
  return done > 0 ? "onTrack" : "off";
}

function flashLength(from: BoatsState, to: BoatsState): number {
  return winFlash(from, to, FLASH_TIME);
}

// --- params UI -------------------------------------------------------------

/** The fleet configuration as the Custom dialog and the type-menu summary show
 * it: blank when it is the default pyramid for this fleet size, exactly as
 * upstream's `game_configure` does. */
function fleetConfigString(p: BoatsParams): string {
  const def = defaultFleet(p.fleet);
  const same =
    def.length === p.fleetData.length && def.every((n, i) => n === p.fleetData[i]);
  return same ? "" : encodeFleet(p.fleetData, p.fleet);
}

/**
 * Boats' difficulty contract (`engine/difficulty.ts`) — **the collection's one
 * declared non-monotone solver**, and the reason the guard has a workaround
 * branch at all.
 *
 * `checkDsf`, which runs from Normal upward, counts an unfinished run of length
 * `k` as a completed size-`k` boat, so it can report a contradiction the board
 * does not have and leave most Easy boards *stuck at the maximum cap* while
 * they solve fine at Easy. The workaround every consumer applies is
 * `solveAtAnyTier` — ask each cap in turn and take the first success — and
 * declaring `nonMonotone` here is what points the cross-game guard at that
 * property instead of at monotonicity. `solveAtAnyTier`'s header has the
 * measurement.
 */
const difficulty: DifficultyContract<BoatsParams> = {
  nonMonotone: true,
  tierOf: (p) => p.diff,
  withTier: (p, tier) => ({ ...p, diff: tier }),
  solveAtCap: (p, desc, cap) => {
    const result = solveBoats(boardOf(newState(p, desc)), cap);
    return result.kind === "solved"
      ? "solved"
      : result.kind === "invalid"
        ? "impossible"
        : "unsolved";
  },
};

export const boatsGame: Game<
  BoatsParams,
  BoatsState,
  BoatsMove,
  BoatsUi,
  BoatsDrawState,
  BoatsMistake,
  BoatsHint
> = {
  id: "boats",
  // Param-dependent: `textFormat` returns undefined past 10×10.

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,

  describeParams: (p): ConfigValues => ({
    width: String(p.w),
    height: String(p.h),
    "fleet-size": String(p.fleet),
    difficulty: p.diff,
    "remove-numbers": p.strip ? 1 : 0,
    "fleet-configuration": fleetConfigString(p),
  }),

  transposeParams: transposeDimensions(),
  paramConfig: [
    ...dimensionParamConfig<BoatsParams>(),
    {
      kw: "fleet-size",
      name: "Fleet size",
      type: "string",
      get: (p) => String(p.fleet),
      set: (p, v) => {
        p.fleet = parseConfigInt(v);
        // Upstream `custom_params` re-reads the fleet list against the new
        // size, so growing the fleet size extends the default pyramid.
        p.fleetData = defaultFleet(p.fleet);
      },
    },
    {
      kw: "fleet-configuration",
      name: "Fleet configuration",
      type: "string",
      get: fleetConfigString,
      set: (p, v) => {
        p.fleetData = v === "" ? defaultFleet(p.fleet) : decodeFleet(v, p.fleet);
      },
    },
    {
      kw: "difficulty",
      name: "Difficulty",
      type: "choices",
      choices: [...DIFF_NAMES],
      get: (p) => p.diff,
      set: (p, v) => {
        p.diff = v;
      },
    },
    {
      kw: "remove-numbers",
      name: "Remove numbers",
      type: "boolean",
      get: (p) => p.strip,
      set: (p, v) => {
        p.strip = v;
      },
    },
  ],

  newDesc: newBoatsDesc,
  validateDesc,
  newState,
  newUi,

  interpretMove,
  executeMove,
  status,

  solve,
  findMistakes,
  difficulty,
  hint,
  hintMarks: {
    roles: {
      ring: "the squares the step decides, drawn in the hint color in the shape of what goes there: a small boat segment for a boat square, two wavy lines, like a given water square's, for water. A step that places a boat segment also shows the water that has to go round it.",
      outline:
        "the squares it reasons from, such as a given segment, the rest of an unfinished boat, or the water that closes a square in.",
      stripes:
        "the row or column whose number it counts with, and the stripes run on through that number.",
    },
    drawn: boatsHintMarks,
  },
  hintKeepTrack,
  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  flashLength,
};

registerGame(boatsGame);

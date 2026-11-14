/**
 * Galaxies' explained hint: the next association or wall the board forces,
 * as the ladder `galaxies.description.yaml` states walks to it
 * (`hintWalk`). Each firing's reason says *why*; everything in this file
 * turns one into a step the player can read and follow.
 *
 * Two vocabularies, because Galaxies is played in two:
 *
 *  - the **association** — an arrow saying "this cell belongs to that dot".
 *    Consequence-free notation (it never enters `checkComplete`), which is
 *    exactly what makes it safe for a hint to teach in.
 *  - the **wall** — the only thing that actually completes the board. Every
 *    wall the hint asks for follows from associations already made, so the
 *    plan teaches the reasoning and then cashes it in.
 */

import { describedEdgeHint, type Fired } from "../../engine/described-edge-hint.ts";
import { spokenOf } from "../../engine/described-hint.ts";
import type { HintStep } from "../../engine/index.ts";
import type { CellMarks } from "../../engine/ladder-runtime.ts";
import type { Point } from "../../engine/types.ts";
import type * as galaxies from "./galaxies.compiled.ts";
import { type GalaxiesSaid, say } from "./hint-text.ts";
import type { GalaxiesMove } from "./index.ts";
import { okToAddAssocWithOpposite } from "./moves.ts";
import {
  type GalaxiesFiring,
  type GalaxiesRung,
  galaxiesWalk,
  HINT_ROLES,
  HINT_TIER,
  marksBefore,
  readsOf,
  reasonOf,
} from "./solver.ts";
import {
  addAssoc,
  checkComplete,
  cloneState,
  F_DOT_BLACK,
  F_EDGE_SET,
  F_TILE_ASSOC,
  type GalaxiesState,
  idx,
  inInterior,
  SpaceType,
  spaceTypeAt,
} from "./state.ts";

export { GALAXIES_RUNGS, type GalaxiesRung } from "./solver.ts";

/**
 * What a step paints, in two roles (docs/hints-marks.md § "The engine colors
 * the marks"):
 *
 *  - the **action** — the cells the association claims, the walls it draws,
 *    and the dot it points at. One color, because they are one move.
 *  - the **evidence** — the cells, walls and dots the argument reasons over.
 *
 * Cells are tile centers and walls are edge cells, both in the state's
 * half-grid coordinates, so the renderer can place them without arithmetic.
 */
export interface GalaxiesHint {
  /** Cells the move associates — the tile *and* its 180° partner, which the
   * game commits in the same move. Both are the action, and the plan tracks
   * both; {@link focus} is which of them the deduction is actually about. */
  targets: Point[];
  /**
   * The one cell the narration is about, when the firing has one. A deduction
   * settles a cell and the game brings its 180° partner along: two cells, one
   * move, but only one the player has to think about. So the deduced cell
   * takes the solid action color and the partner a bare outline of it — same
   * hue because they share a fate, different weight because only one is the
   * point.
   *
   * `null` where the cells really are equivalent (a dot's own cells, all
   * forced by one rule); there, all of them fill solid.
   */
  focus: Point | null;
  /** Walls the move draws. */
  targetWalls: Point[];
  /** The dot the association points at, ringed in the action color. */
  targetDot: Point | null;
  /** Particular cells the deduction reasons from, outlined. */
  area: Point[];
  /** The galaxy or piece of one the sentence is about ("the striped galaxy"),
   * hatched (docs/hints-marks.md § "Hatch the line the sentence names"). */
  hatch: Point[];
  /** Walls the deduction reasons over. */
  walls: Point[];
  /** Dots the argument cites (never the one it acts on — one ring role per
   * color, so "the ringed dot" is never ambiguous). */
  refDots: Point[];
  /** What the sentence reads off the board besides these marks, so a step
   * re-reads from its highlights when they shrink (`say`). */
  said: GalaxiesSaid;
}

/**
 * How many *showable* steps one `hint()` call plans ahead. A UX bound: the
 * player sees one step at a time and every request recomputes, so a longer
 * plan only costs a slower press.
 *
 * Showable, not firings: a dot inside its own cell forces that cell, but the
 * game draws no arrow there, so the firing recurs on every recompute and is
 * never shown. The engine counts steps, which a firing the board would not
 * take makes none of.
 */
const PLAN_CAP = 20;

const EMPTY: Omit<GalaxiesHint, "targets" | "said"> = {
  focus: null,
  targetWalls: [],
  targetDot: null,
  area: [],
  hatch: [],
  walls: [],
  refDots: [],
};

// --- the plan ---------------------------------------------------------

/** A firing plus whether the player's board would actually take it. A
 * deduction inside a region the player has already closed correctly is sound
 * and pointless — `addAssocWithOpposite` refuses to draw an arrow there — so
 * it advances the working board and is never shown (the Spokes
 * "useless-but-forced move" rule, docs/hints.md § "Hint the move that
 * advances the goal"). */
interface Planned {
  firing: GalaxiesFiring;
  showable: boolean;
}

/** Would the game commit this association if the player made it? Nothing in
 * the predicate depends on associations — only on the dots and the walls — so
 * asking after the working board has applied the firing gives the same answer
 * as asking before. */
function committable(s: GalaxiesState, tile: Point, dot: Point): boolean {
  return okToAddAssocWithOpposite(s, tile.x, tile.y, dot.x, dot.y);
}

function planned(s: GalaxiesState, firing: GalaxiesFiring): Planned {
  switch (firing.kind) {
    case "separate":
    case "mirrorWall":
      // A wall the solver forces is always one the player may draw: a wall may
      // not pass through a dot, and the cells a dot sits on are all its own,
      // so no such wall is ever a boundary.
      return { firing, showable: true };
    case "dotTile": {
      const tiles = firing.tiles.filter((t) => committable(s, t, firing.dot));
      return { firing: { ...firing, tiles }, showable: tiles.length > 0 };
    }
    default:
      return { firing, showable: committable(s, firing.tile, firing.dot) };
  }
}

/** Make a firing on the plan's working board, shown or not: its line, or the
 * arrows it draws. */
function applyFiring(b: GalaxiesState, f: GalaxiesFiring): void {
  switch (f.kind) {
    case "separate":
    case "mirrorWall":
      b.flags[idx(b, f.edge.x, f.edge.y)] |= F_EDGE_SET;
      return;
    case "dotTile":
      for (const t of f.tiles) addAssoc(b, t.x, t.y, f.dot.x, f.dot.y);
      return;
    default:
      for (const t of pair(f.tile, f.opp)) addAssoc(b, t.x, t.y, f.dot.x, f.dot.y);
  }
}

/** What the walk reads a firing by: the board the plan's steps have drawn on,
 * which says whether the game would take an arrow, and the dots. */
interface GalaxiesWalkContext {
  board: GalaxiesState;
  dl: galaxies.Dealt;
  marks: CellMarks;
}

/** What a step's sentence is told of it: the highlights it is read from. */
interface GalaxiesMarked {
  highlights: GalaxiesHint;
}

/** A firing's step, if the player's board would take it: the walk makes each
 * firing on its own marks and the board follows it, so whether the game would
 * take an arrow is asked of the lines drawn so far. One it would not take
 * advances the board and is no step. */
function stepOf(
  fired: Fired<galaxies.SaysById[keyof galaxies.SaysById], GalaxiesWalkContext>,
  state: GalaxiesState,
): { move: GalaxiesMove; highlights: GalaxiesHint; marked: GalaxiesMarked }[] {
  const { taken, ctx, before, marks } = fired;
  const firing = reasonOf(
    marksBefore(marks, before, taken),
    ctx.dl,
    taken.entry.id as keyof galaxies.SaysById,
    fired.says.terms,
  );
  const p = planned(ctx.board, firing);
  applyFiring(ctx.board, firing);
  if (!p.showable) return [];
  const highlights = highlightsOf(state, p.firing);
  return [{ move: moveOf(p.firing), highlights, marked: { highlights } }];
}

/**
 * The plan from the player's own board: the deduction as far as the plan cap
 * allows, a step for each firing the board would take. Nothing beyond the
 * ladder: trying a square's dot and following it until something breaks would
 * settle more boards, and was removed on owner acceptance, since it teaches no
 * technique. The hint refuses instead.
 *
 * A dot inside its own cell forces that cell, but the game draws no arrow
 * there, so the firing recurs on every recompute and is never shown; the
 * engine's walk takes it without a step, and the step budget catches a firing
 * that decides nothing.
 */
export const galaxiesHint = describedEdgeHint<
  GalaxiesState,
  GalaxiesMove,
  GalaxiesHint,
  GalaxiesMarked,
  GalaxiesWalkContext,
  galaxies.SaysById,
  GalaxiesRung
>({
  name: "galaxies hint",
  walk: (state) => {
    const { marks, entries, dl } = galaxiesWalk(state);
    return { marks, entries, ctx: { board: cloneState(state), dl, marks } };
  },
  tiers: { lowest: () => HINT_TIER, count: HINT_TIER + 1 },
  roles: HINT_ROLES,
  plan: PLAN_CAP,
  done: (_marks, { board }) => checkComplete(board, false).complete,
  // The walk asks before a firing is made, so the live marks are the ones it
  // was found on.
  reads: (taken, { dl, marks }) =>
    readsOf(
      marks.sp,
      reasonOf(
        marks,
        dl,
        taken.entry.id as keyof galaxies.SaysById,
        spokenOf<galaxies.SaysById[keyof galaxies.SaysById]>(taken).says.terms,
      ),
    ),
  step: stepOf,
  say: (_spoken, { highlights }) => say(highlights),
});

// --- narration --------------------------------------------------------

/** Is this wall part of the board's own rim? Those are set before the player
 * touches anything, so the narration names them as the board's edge. */
function atBoardEdge(s: GalaxiesState, wall: Point): boolean {
  return wall.x === 0 || wall.y === 0 || wall.x === s.sx - 1 || wall.y === s.sy - 1;
}

function isBlack(s: GalaxiesState, dot: Point): boolean {
  return (s.flags[idx(s, dot.x, dot.y)] & F_DOT_BLACK) !== 0;
}

/** Which sentence a firing speaks, and with what values. The words are
 * [`hint-text.ts`](./hint-text.ts)'s. */
function saidOf(s: GalaxiesState, firing: GalaxiesFiring): GalaxiesSaid {
  switch (firing.kind) {
    case "dotTile":
      return { kind: "dotTile", black: isBlack(s, firing.dot), n: firing.tiles.length };
    case "separate":
      // Whether both cells draw arrows: a cell that holds its own dot does not.
      return {
        kind: "separate",
        points: firing.tiles.every(
          (t, n) => t.x !== firing.dots[n].x || t.y !== firing.dots[n].y,
        ),
      };
    case "mirrorWall":
      return {
        kind: "mirrorWall",
        black: isBlack(s, firing.dot),
        edge: atBoardEdge(s, firing.from),
      };
    case "enclosed":
      return {
        kind: "enclosed",
        black: isBlack(s, firing.dot),
        openings: firing.openings.length,
      };
    case "soleOwner":
    case "onlyReach":
      return { kind: firing.kind, black: isBlack(s, firing.dot) };
    case "exclave":
      return { kind: "exclave" };
  }
}

/** A firing's sentence, as its step speaks it. */
export function narrate(s: GalaxiesState, firing: GalaxiesFiring): string {
  return say(highlightsOf(s, firing)).text;
}

// --- highlights -------------------------------------------------------

/** The cells an association claims: the tile and the partner the same move
 * commits. A tile that is its own partner (dead center of its galaxy) lists
 * once. */
function pair(tile: Point, opp: Point | null): Point[] {
  if (!opp || (opp.x === tile.x && opp.y === tile.y)) return [tile];
  return [tile, opp];
}

/** The action of an association firing: the claimed pair, the deduced cell
 * and the dot. */
type Marks = Omit<GalaxiesHint, "said">;

function claim(f: { tile: Point; opp: Point | null; dot: Point }): Marks {
  return { ...EMPTY, targets: pair(f.tile, f.opp), focus: f.tile, targetDot: f.dot };
}

/**
 * The evidence area minus the cell being acted on. The partner stays shaded:
 * it is inside the area the sentence describes, and an outline over a shaded
 * cell reads as the quieter mark it is meant to be.
 */
function evidenceFor(cells: Point[], focus: Point): Point[] {
  return cells.filter((c) => c.x !== focus.x || c.y !== focus.y);
}

function highlightsOf(s: GalaxiesState, firing: GalaxiesFiring): GalaxiesHint {
  return { ...marksOf(firing), said: saidOf(s, firing) };
}

function marksOf(firing: GalaxiesFiring): Marks {
  switch (firing.kind) {
    case "dotTile":
      return { ...EMPTY, targets: firing.tiles, targetDot: firing.dot };
    case "separate":
      return {
        ...EMPTY,
        targets: [],
        targetWalls: [firing.edge],
        area: [firing.tiles[0], firing.tiles[1]],
        refDots: dedupe(firing.dots),
      };
    case "mirrorWall":
      return {
        ...EMPTY,
        targets: [],
        targetWalls: [firing.edge],
        // Both partners are shaded: the technique the step teaches is
        // *finding* the partner across the dot, so the picture has to show the
        // pair, not just the cell the evidence wall touches.
        area: [firing.tile, firing.opp],
        walls: [firing.from],
        refDots: [firing.dot],
      };
    case "enclosed":
      // The ways out are the premise, outlined; the galaxy they lead into is
      // what the sentence names, hatched.
      return {
        ...claim(firing),
        area: evidenceFor(firing.openings, firing.tile),
        hatch: evidenceFor(firing.galaxy, firing.tile),
      };
    case "soleOwner":
      // No shaded area: the argument is about the dots, and the one that
      // survives is ringed. The ruled-out dots stay unmarked, since symmetry
      // alone leaves up to eleven of them on a 15x15 (measured), and eleven
      // crossed-out dots teach nothing.
      return claim(firing);
    case "onlyReach":
      return { ...claim(firing), hatch: evidenceFor(firing.region, firing.tile) };
    case "exclave":
      return { ...claim(firing), hatch: evidenceFor(firing.component, firing.tile) };
  }
}

function dedupe(cells: Point[]): Point[] {
  return cells.filter(
    (c, i) => cells.findIndex((o) => o.x === c.x && o.y === c.y) === i,
  );
}

// --- the move ---------------------------------------------------------

function moveOf(firing: GalaxiesFiring): GalaxiesMove {
  if (firing.kind === "separate" || firing.kind === "mirrorWall") {
    return {
      ops: [{ kind: "edge", x: firing.edge.x, y: firing.edge.y }],
      solving: false,
    };
  }
  // A dot's own cells are one op at the dot itself (`applyOp` walks the dot's
  // 3x3), so a vertex dot's four cells are one move, as one deduction should be.
  const at = firing.kind === "dotTile" ? firing.dot : firing.tile;
  return {
    ops: [{ kind: "assoc", x: at.x, y: at.y, ax: firing.dot.x, ay: firing.dot.y }],
    solving: false,
  };
}

// --- following the plan -----------------------------------------------

/** Is everything this step asks for already true of `s`? */
export function stepSatisfied(
  s: GalaxiesState,
  step: HintStep<GalaxiesMove, GalaxiesHint>,
): boolean {
  return outstanding(s, step).length === 0;
}

/** The parts of the step the board does not yet show — cells still to be
 * associated with the hinted dot, plus walls still to be drawn. */
export function outstanding(
  s: GalaxiesState,
  step: HintStep<GalaxiesMove, GalaxiesHint>,
): Point[] {
  const hl = step.highlights;
  if (!hl) return [];
  const out: Point[] = [];
  for (const w of hl.targetWalls) {
    if (!wallSet(s, w)) out.push(w);
  }
  const dot = hl.targetDot;
  if (dot) {
    for (const t of hl.targets) {
      if (!associatedWith(s, t, dot)) out.push(t);
    }
  }
  return out;
}

function wallSet(s: GalaxiesState, w: Point): boolean {
  if (!inInterior(s, w.x, w.y) || spaceTypeAt(w.x, w.y) !== SpaceType.Edge) {
    return false;
  }
  return (s.flags[idx(s, w.x, w.y)] & F_EDGE_SET) !== 0;
}

function associatedWith(s: GalaxiesState, tile: Point, dot: Point): boolean {
  const i = idx(s, tile.x, tile.y);
  if (!(s.flags[i] & F_TILE_ASSOC)) return false;
  return s.dotx[i] === dot.x && s.doty[i] === dot.y;
}

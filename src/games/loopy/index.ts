/**
 * Loopy — native TS port of `loopy.c` (Mike Pinna 2005-6; substantially
 * rewritten for general grids by Lambros Lambrou, 2008).
 *
 * Draw a single closed loop along the grid's edges so that every numbered face
 * is bordered by exactly that many loop segments. Playable on **all eighteen**
 * tilings `grid.ts` provides, from squares to Penrose patches, hats and
 * spectres.
 *
 * **Two ways to reach an edge, one way to set it.** A pointer reaches an edge
 * by `gridNearestEdge`; the keyboard walks the cursor along one (a plain arrow)
 * or aims at one without moving (Shift+arrow) — `cursor.ts`. Both then go
 * through {@link setEdge}, so a keyboard selection *is* the click on that edge,
 * autofollow included, rather than a second input model beside it. Left / Enter
 * toggles an edge's YES, right / Space its NO, and Backspace clears it — see
 * {@link nextLineState}.
 *
 * **Notes mode** (`ui.pencilMode`, toggled by the collection's Marks key, which
 * the app's P shortcut also sends) turns the same inputs onto the player's corner
 * and pair notes (`notes.ts`): a tap cycles the corner it lands in and a drag from
 * one edge to another cycles their pair; Enter cycles the corner following the
 * cursor's edge, and Space pins an edge and then pairs it with the next one Space
 * is pressed on. The other pencil games also toggle the mode with the right
 * button and Enter, both of which already set lines here.
 *
 * Upstream gives Loopy no keyboard at all (`loopy.c` has no `CURSOR_`
 * reference), so the keyboard here is this fork's design, not a port.
 *
 * This file is the `Game` glue plus input handling; the rest of the port lives
 * beside it.
 */

import { assertNever } from "../../engine/assert-never.ts";
import type { DifficultyContract } from "../../engine/difficulty.ts";
import { winFlash } from "../../engine/flash.ts";
import {
  type Game,
  type GamePref,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import type { Grid, GridDot, GridEdge } from "../../engine/grid/index.ts";
import { gridNearestEdge } from "../../engine/grid/index.ts";
import {
  BACKSPACE,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  DELETE,
  isCancelKey,
  isCursorMove,
  isEraseKey,
  isMouseDown,
  isMouseDrag,
  isMouseRelease,
  LEFT_BUTTON,
  MOD_SHFT,
  PENCIL_MODE_BUTTON,
  RIGHT_BUTTON,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  interpretTargetVerbs,
  type TargetGeometry,
  type TargetVerbs,
} from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import {
  farDot,
  type LoopyCursor,
  newLoopyCursor,
  nextEdgeFor,
  walkEdge,
} from "./cursor.ts";
import { dlineEnds } from "./dlines.ts";
import { newDesc } from "./generator.ts";
import { hint, hintKeepTrack, refreshHintStep } from "./hint.ts";
import { cornerAt, cursorCorner, nextCornerNote, nextPairNote } from "./notes.ts";
import {
  DIFF_MAX,
  decodeParams,
  defaultParams,
  encodeParams,
  type LoopyParams,
  paramConfig,
  presets,
  transposeParams,
  validateParams,
} from "./params.ts";
import {
  border,
  colors,
  computeSize,
  FLASH_TIME,
  type LoopyDrawState,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import { solveGame, uniqueSolution } from "./solver.ts";
import {
  checkCompletion,
  cloneState,
  forcedRuleOuts,
  LINE_NO,
  LINE_UNKNOWN,
  LINE_YES,
  type LineState,
  type LoopyMistake,
  type LoopyState,
  newState,
  textFormat,
  validateDesc,
} from "./state.ts";

/** One edge set to one state. Moves are **absolute sets, never toggles**, so
 * re-applying a move is idempotent — which is what lets the autofollow walk
 * name the same edge twice without consequence. */
export interface LoopyOp {
  edge: number;
  state: LineState;
}

/** A player move, or the Solve action, which also marks the game as solved with
 * help. Upstream encodes these as a string that `execute_move` re-parses; that
 * was a C program's only way to express a variant, and the save format is
 * ours. */
export type LoopyMove =
  | { kind: "set"; ops: readonly LoopyOp[] }
  | { kind: "solve"; ops: readonly LoopyOp[] }
  /** Set a corner note's bits outright (1 at least one line, 2 at most one). */
  | { kind: "corner"; dline: number; bits: number }
  /** Set a pair note outright, or clear it with `"none"`. */
  | { kind: "pair"; a: number; b: number; relation: PairRelation };

export type PairRelation = "none" | "match" | "opposite";

/** How much an edge click drags its neighbors along with it. */
export const AF_OFF = 0;
export const AF_FIXED = 1;
export const AF_ADAPTIVE = 2;

export interface LoopyUi {
  /** Draw excluded (NO) lines very faintly rather than invisibly. */
  drawFaintLines: boolean;
  /** {@link AF_OFF} / {@link AF_FIXED} / {@link AF_ADAPTIVE}. */
  autofollow: number;
  /** Drawing a line also excludes the edges that settles by counting
   * ({@link forcedRuleOuts}). */
  autoRuleOut: boolean;
  /** The keyboard cursor: a dot and one of its incident edges (`cursor.ts`). */
  cursor: LoopyCursor;
  /** Notes mode: input notes corners and pairs instead of setting lines. */
  pencilMode: boolean;
  /** A notes-mode press not yet released, or `null`. */
  noteDrag: LoopyNoteDrag | null;
  /** The edge Space pinned for a pair note, or `-1`. */
  pin: number;
  /** The edge the pointer is over, or `-1`. Its whole run of drawn lines is
   * highlighted, so a player can see what a move would close without tracing
   * the board. Mouse-only — touch reports no hover — so nothing may depend on
   * it, and it is never read by a move. */
  hoverEdge: number;
}

/** A notes-mode press, which the release decides is a tap or a drag. */
export interface LoopyNoteDrag {
  /** Where the press went down. */
  readonly start: Point;
  /** The edge nearest the press, or `-1`. */
  readonly from: number;
  /** The button it arrived as, which sets which way a note cycles. */
  readonly button: number;
  /** Where the pointer is now. */
  at: Point;
  /** Set once the pointer has gone half a tile from the press, so a drag that
   * comes back is still a drag. */
  dragged: boolean;
}

function newUi(state: LoopyState): LoopyUi {
  // Upstream also reads `LOOPY_FAINT_LINES` / `LOOPY_AUTOFOLLOW` environment
  // variables here, a pre-preferences relic with no meaning in a browser; the
  // prefs below are the whole story.
  return {
    drawFaintLines: true,
    autofollow: AF_OFF,
    // On, where the other two aids are off: this one asserts a count that is already
    // true and forced, so it discards nothing and takes no decision away from the
    // player (owner, 2026-09-18; the reasoning is in the change's proposal).
    autoRuleOut: true,
    cursor: newLoopyCursor(state.grid),
    pencilMode: false,
    noteDrag: null,
    pin: -1,
    hoverEdge: -1,
  };
}

/**
 * The pointer moved over the board, or left it (`p === null`).
 *
 * Remembers the edge under it so {@link redraw} can light that edge's whole run
 * of drawn lines — the premise of "don't close this into a loop while other
 * segments remain", which the board otherwise makes the player trace by eye.
 *
 * **Returns `null` when the hovered edge has not changed**, which is what keeps
 * a pointer sweep from repainting on every frame: most moves within a tile land
 * on the same nearest edge.
 */
function hover(
  state: LoopyState,
  ui: LoopyUi,
  ds: LoopyDrawState,
  p: Point | null,
): UiUpdate | null {
  const e = p === null ? null : edgeAt(state.grid, ds.tileSize, p);
  // Only a drawn line has a run to show, so anything else reads as "nothing
  // hovered" rather than as a highlight of one edge.
  const next = e !== null && state.lines[e.index] === LINE_YES ? e.index : -1;
  if (next === ui.hoverEdge) return null;
  ui.hoverEdge = next;
  return UI_UPDATE;
}

const prefs: GamePref<LoopyUi>[] = [
  {
    kw: "draw-faint-lines",
    name: "Draw excluded grid lines faintly",
    type: "boolean",
    get: (ui) => ui.drawFaintLines,
    set: (ui, v) => {
      ui.drawFaintLines = v;
    },
  },
  {
    kw: "auto-follow",
    name: "Auto-follow unique paths of edges",
    type: "choices",
    choices: ["No", "Based on grid only", "Based on grid and game state"],
    get: (ui) => ui.autofollow,
    set: (ui, v) => {
      ui.autofollow = v;
    },
  },
  {
    kw: "auto-rule-out",
    name: "Rule out edges that counting has already settled",
    type: "boolean",
    get: (ui) => ui.autoRuleOut,
    set: (ui, v) => {
      ui.autoRuleOut = v;
    },
  },
];

/**
 * What clicking `button` does to an edge currently in state `old`, or `null`
 * when the button does nothing here.
 *
 * Each button sets its own state on an undecided edge and clears a decided
 * one: left (a tap) sets YES, right (a long press) sets NO, and an erase key
 * always clears. A finger reaches both states as a mouse does,
 * so upstream's stylus 3-cycles are not kept.
 */
export function nextLineState(button: number, old: number): LineState | null {
  if (isEraseKey(button)) return LINE_UNKNOWN;
  switch (button) {
    case LEFT_BUTTON:
      return old === LINE_UNKNOWN ? LINE_YES : LINE_UNKNOWN;
    case RIGHT_BUTTON:
      return old === LINE_UNKNOWN ? LINE_NO : LINE_UNKNOWN;
    default:
      return null;
  }
}

/**
 * Extend a click along any run of edges whose continuation is forced, so a
 * player tracing a corridor does not have to click every segment of it.
 *
 * Walks outwards from both ends of the clicked edge. At each dot, an edge is a
 * *candidate* continuation unless the preference excludes it: under
 * {@link AF_FIXED} every other edge at the dot counts (so the walk follows the
 * grid's own shape only), while under {@link AF_ADAPTIVE} edges the player has
 * already marked NO are skipped, so the walk also follows the corridor the
 * player has carved — except when the click itself is a NO, where excluding
 * NO edges would be self-defeating. The walk continues only while exactly one
 * candidate exists and it currently matches the clicked edge's old state.
 *
 * Returning on coming full circle replaces upstream's `goto autofollow_done`,
 * which breaks only the inner loop, so its second end retraces the same edges.
 * Ops are absolute sets, so the board is the same either way.
 */
export function autofollowEdges(
  state: LoopyState,
  ui: Pick<LoopyUi, "autofollow">,
  clicked: GridEdge,
): Set<number> {
  const edges = new Set<number>([clicked.index]);
  const clickedState = state.lines[clicked.index];

  for (const start of [clicked.dot1, clicked.dot2]) {
    let dot: GridDot = start;
    let eThis: GridEdge = clicked;

    for (;;) {
      let eNext: GridEdge | null = null;
      let nFound = 0;
      for (let j = 0; j < dot.order; j++) {
        const candidate = dot.edges[j];
        if (candidate === eThis) continue;
        if (
          ui.autofollow === AF_FIXED ||
          clickedState === LINE_NO ||
          state.lines[candidate.index] !== LINE_NO
        ) {
          eNext = candidate;
          nFound++;
        }
      }

      if (nFound !== 1 || eNext === null) break;
      if (state.lines[eNext.index] !== clickedState) break;
      // Came all the way round a loop back to where we started.
      if (eNext === clicked) return edges;

      dot = eNext.dot1 !== dot ? eNext.dot1 : eNext.dot2;
      eThis = eNext;
      edges.add(eThis.index);
    }
  }
  return edges;
}

/**
 * The one "set this edge" implementation: what pressing `button` on `e` does,
 * autofollow included. The pointer arm and the keyboard arm of
 * {@link interpretMove} differ only in where `e` comes from, which is what
 * makes a keyboard selection the *same* move as the click on that edge rather
 * than a parallel path that agrees with it today (the Slide rule — see
 * docs/games/input.md § "Giving a drag game a keyboard").
 */
function setEdge(
  state: LoopyState,
  ui: LoopyUi,
  e: GridEdge,
  button: number,
): LoopyMove | null {
  const newLine = nextLineState(button, state.lines[e.index]);
  if (newLine === null) return null;

  const edges =
    ui.autofollow === AF_OFF
      ? new Set<number>([e.index])
      : autofollowEdges(state, ui, e);

  const ops = new Map<number, LineState>();
  for (const edge of edges) ops.set(edge, newLine);
  // After autofollow, so a corridor and the edges its far end settles arrive as one
  // move — and so one undo takes the whole thing back.
  if (ui.autoRuleOut) {
    for (const edge of forcedRuleOuts(state, ops)) ops.set(edge, LINE_NO);
  }

  return {
    kind: "set",
    ops: [...ops].map(([edge, to]) => ({ edge, state: to })),
  };
}

/** The edge nearest a pointer position, or `null` off the grid. */
function edgeAt(g: Grid, tileSize: number, p: Point): GridEdge | null {
  // Screen coordinates to grid coordinates. `Math.trunc`, not `Math.floor`:
  // this mirrors C's integer division, which rounds towards zero, and grid
  // coordinates are genuinely negative for several tilings (and for any click
  // in the border), where the two disagree.
  const gx = Math.trunc(((p.x - border(tileSize)) * g.tileSize) / tileSize) + g.lowestX;
  const gy = Math.trunc(((p.y - border(tileSize)) * g.tileSize) / tileSize) + g.lowestY;
  return gridNearestEdge(g, gx, gy);
}

/** The pointer button a select key stands for: Enter is the left button and
 * Space the right. An erase key stands for itself. */
function buttonForKey(button: number): number | null {
  if (button === CURSOR_SELECT) return LEFT_BUTTON;
  if (button === CURSOR_SELECT2) return RIGHT_BUTTON;
  if (isEraseKey(button)) return button;
  return null;
}

/** Screen coordinates to grid coordinates, unrounded: a corner is found by angle,
 * which rounding would bend near a dot. */
function gridPoint(g: Grid, tileSize: number, p: Point): Point {
  const b = border(tileSize);
  return {
    x: ((p.x - b) * g.tileSize) / tileSize + g.lowestX,
    y: ((p.y - b) * g.tileSize) / tileSize + g.lowestY,
  };
}

function pairRelation(state: LoopyState, a: number, b: number): PairRelation {
  const [lo, hi] = a < b ? [a, b] : [b, a];
  const pair = state.pairs.find((p) => p.a === lo && p.b === hi);
  if (!pair) return "none";
  return pair.opposite ? "opposite" : "match";
}

function cornerMove(
  state: LoopyState,
  dline: number,
  button: number,
): LoopyMove | null {
  const bits = nextCornerNote(state.corners[dline], button);
  if (bits === null || bits === state.corners[dline]) return null;
  return { kind: "corner", dline, bits };
}

function pairMove(
  state: LoopyState,
  a: number,
  b: number,
  button: number,
): LoopyMove | null {
  const was = pairRelation(state, a, b);
  const relation = nextPairNote(was, button);
  if (relation === null || relation === was) return null;
  return { kind: "pair", a: Math.min(a, b), b: Math.max(a, b), relation };
}

/** What a notes-mode press comes to when it is released: a tap cycles the corner
 * it went down in, and a drag from one edge to another cycles their pair. A
 * release off the board, as the frontend sends for a canceled press, is neither. */
function releaseNote(
  state: LoopyState,
  ds: LoopyDrawState,
  drag: LoopyNoteDrag,
): LoopyMove | null {
  const g = state.grid;
  if (!drag.dragged) {
    const at = gridPoint(g, ds.tileSize, drag.start);
    const dline = cornerAt(g, at.x, at.y);
    return dline === null ? null : cornerMove(state, dline, drag.button);
  }
  const to = edgeAt(g, ds.tileSize, drag.at);
  if (drag.from < 0 || to === null || to.index === drag.from) return null;
  return pairMove(state, drag.from, to.index, drag.button);
}

/**
 * Notes mode's keys, at the cursor. Enter cycles the corner clockwise from the
 * chosen edge, and Backspace clears it; every corner is clockwise from one of its
 * edges at its dot, and aiming reaches every edge there. Space pins the chosen
 * edge, and Space on another edge cycles the pair between them.
 */
function noteByKey(
  state: LoopyState,
  ui: LoopyUi,
  button: number,
): LoopyMove | UiUpdate | null {
  const cursor = ui.cursor;
  if (button === RIGHT_BUTTON) {
    if (ui.pin < 0 || ui.pin === cursor.edge) {
      ui.pin = ui.pin < 0 ? cursor.edge : -1;
      return UI_UPDATE;
    }
    const pinned = ui.pin;
    ui.pin = -1;
    return pairMove(state, pinned, cursor.edge, LEFT_BUTTON);
  }
  const dline = cursorCorner(state.grid, cursor);
  return dline === null ? null : cornerMove(state, dline, button);
}

function interpretMove(
  state: LoopyState,
  ui: LoopyUi,
  ds: LoopyDrawState,
  p: Point,
  rawButton: number,
): LoopyMove | null | UiUpdate {
  const g = state.grid;
  const shift = (rawButton & MOD_SHFT) !== 0;
  const button = stripModifiers(rawButton);
  const cursor = ui.cursor;

  if (button === PENCIL_MODE_BUTTON) {
    ui.pencilMode = !ui.pencilMode;
    ui.pin = -1;
    ui.noteDrag = null;
    return UI_UPDATE;
  }

  if (isMouseDown(button) && ui.pencilMode) {
    // A tap notes a corner and a drag notes a pair, and only the release can
    // tell them apart, so the press is claimed and decided then
    // (docs/games/input.md § "A button with two meanings resolves on the release").
    cursor.visible = false;
    const e = edgeAt(g, ds.tileSize, p);
    ui.pin = -1;
    ui.noteDrag = { start: p, at: p, from: e?.index ?? -1, button, dragged: false };
    return UI_UPDATE;
  }

  if (isMouseDrag(button) || isMouseRelease(button)) {
    // Whatever button class the drag and release arrive as: a finger held still
    // before dragging arrives as the right button (docs/games/input.md § "A touch
    // hold arrives as the right button"), and the press already said which way.
    const drag = ui.noteDrag;
    if (drag === null) return null;
    drag.at = p;
    if (Math.hypot(p.x - drag.start.x, p.y - drag.start.y) > ds.tileSize / 2)
      drag.dragged = true;
    if (isMouseDrag(button)) return UI_UPDATE;
    ui.noteDrag = null;
    return releaseNote(state, ds, drag) ?? UI_UPDATE;
  }

  if (isCursorMove(button) && shift) {
    // Aim without moving: the nearest edge this way, or — on a repeat of the
    // same arrow — the next one round. The fallback for the few edges no walk
    // can select (`cursor.ts`); the first press also reveals the cursor without
    // acting, as an arrow that is itself an action must.
    const e = nextEdgeFor(cursor, g.dots[cursor.dot], button);
    if (e === null) return null;
    cursor.edge = e.index;
    cursor.arrow = button;
    cursor.visible = true;
    return UI_UPDATE;
  }

  const asButton = buttonForKey(button);
  if (asButton !== null && ui.pencilMode) {
    const revealed = !cursor.visible;
    cursor.visible = true;
    if (cursor.edge < 0) return revealed ? UI_UPDATE : null; // nothing chosen yet
    return noteByKey(state, ui, asButton) ?? (revealed ? UI_UPDATE : null);
  }

  // Escape; the erase keys are the clearing verb's, below.
  if (isCancelKey(button) && !isEraseKey(button)) {
    if (ui.pin >= 0) {
      ui.pin = -1;
      return UI_UPDATE;
    }
    if (!cursor.visible) return null;
    cursor.visible = false;
    return UI_UPDATE;
  }

  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton);
}

/**
 * A target is an edge. A press names the nearest; the cursor is a dot and the
 * edge it last walked along (or aimed at), and the arrows walk it from dot to
 * dot, so Enter marks the line behind it — a pen that inks where it has been.
 * The cursor stays put after a key: it is already at the far end of the edge,
 * so the same key again undoes the mark just made.
 */
const geometry: TargetGeometry<LoopyState, LoopyUi, LoopyDrawState, GridEdge> = {
  noun: "edge",
  pointerTarget: (s, ds, p) => edgeAt(s.grid, ds.tileSize, p),
  cursorTarget: (s, ui) => (ui.cursor.edge < 0 ? null : s.grid.edges[ui.cursor.edge]),
  parkCursor(ui, e) {
    const { cursor } = ui;
    if (e.dot1.index !== cursor.dot && e.dot2.index !== cursor.dot)
      cursor.dot = e.dot1.index;
    cursor.edge = e.index;
    cursor.arrow = 0;
  },
  moveCursor(s, ui, button) {
    // One dot along the edge that best continues this way, which becomes the
    // chosen edge.
    const dot = s.grid.dots[ui.cursor.dot];
    const e = walkEdge(dot, button);
    if (e === null) return false;
    moveCursorAlong(ui.cursor, dot, e);
    return true;
  },
};

const lineVerb = (button: number) => (s: LoopyState, e: GridEdge, ui: LoopyUi) =>
  setEdge(s, ui, e, button);

const targetVerbs: TargetVerbs<
  LoopyState,
  LoopyUi,
  LoopyDrawState,
  GridEdge,
  LoopyMove
> = {
  geometry,
  primary: {
    does:
      "mark it as part of the loop (black), and again to return it to undecided " +
      "(yellow)",
    apply: lineVerb(LEFT_BUTTON),
  },
  secondary: {
    does:
      "mark it as definitely not part of the loop (faint gray), and again to " +
      "return it to undecided",
    apply: lineVerb(RIGHT_BUTTON),
  },
  keyOnly: [
    {
      does: "return the edge under the cursor to undecided",
      keys: [
        { codes: [BACKSPACE], name: "Backspace" },
        { codes: [DELETE], name: "Delete" },
      ],
      apply: lineVerb(DELETE),
      pointer: { kind: "cycle", button: "primary" },
    },
  ],
};

/** Carry the cursor over `e` to its far dot, keeping `e` chosen (it is incident
 * to the new dot too) and forgetting which arrow chose it, so the next arrow
 * press ranks afresh from the new dot rather than continuing an old cycle. */
function moveCursorAlong(cursor: LoopyCursor, from: GridDot, e: GridEdge): void {
  cursor.dot = farDot(e, from).index;
  cursor.edge = e.index;
  cursor.arrow = 0;
  cursor.visible = true;
}

function executeMove(state: LoopyState, move: LoopyMove): LoopyState {
  switch (move.kind) {
    case "set":
    case "solve":
      return executeLines(state, move);
    case "corner":
      return executeCorner(state, move);
    case "pair":
      return executePair(state, move);
    default:
      return assertNever(move, "loopy: executeMove");
  }
}

function executeCorner(
  state: LoopyState,
  move: LoopyMove & { kind: "corner" },
): LoopyState {
  if (move.dline < 0 || move.dline >= state.corners.length) {
    throw new Error(`loopy: move names dline ${move.dline}, out of range`);
  }
  if (move.bits < 0 || move.bits > 3) {
    throw new Error(`loopy: corner note ${move.bits} is not a note`);
  }
  const next = cloneState(state);
  next.corners[move.dline] = move.bits;
  return next;
}

function executePair(
  state: LoopyState,
  move: LoopyMove & { kind: "pair" },
): LoopyState {
  const a = Math.min(move.a, move.b);
  const b = Math.max(move.a, move.b);
  if (a < 0 || b >= state.grid.numEdges || a === b) {
    throw new Error(`loopy: edges ${a} and ${b} cannot be a pair`);
  }
  const pairs = state.pairs.filter((p) => p.a !== a || p.b !== b);
  if (move.relation !== "none") {
    pairs.push({ a, b, opposite: move.relation === "opposite" });
    pairs.sort((p, q) => p.a - q.a || p.b - q.b);
  }
  return { ...cloneState(state), pairs };
}

function executeLines(
  state: LoopyState,
  move: LoopyMove & { kind: "set" | "solve" },
): LoopyState {
  const next = cloneState(state);
  for (const op of move.ops) {
    if (op.edge < 0 || op.edge >= next.grid.numEdges) {
      throw new Error(`loopy: move names edge ${op.edge}, out of range`);
    }
    next.lines[op.edge] = op.state;
  }
  if (move.kind === "solve") next.cheated = true;
  // `solved` is sticky, as upstream: it is only ever set, never cleared, so
  // undoing past the winning move leaves the game recorded as having been won.
  if (checkCompletion(next)) next.completed = true;
  return next;
}

/** Fill in the solution. Solves from the **initial** state, not the player's —
 * a partly-filled board with a mistake on it would otherwise poison the run. */
function solve(orig: LoopyState, _curr: LoopyState): SolveResult<LoopyMove> {
  const ss = solveGame(orig, DIFF_MAX);
  const ops: LoopyOp[] = [];
  for (let i = 0; i < ss.state.lines.length; i++) {
    const line = ss.state.lines[i];
    if (line !== LINE_UNKNOWN) ops.push({ edge: i, state: line as LineState });
  }
  // Upstream returns the solver's best effort whatever its verdict — an
  // ambiguous or incomplete result still fills in everything it did prove,
  // which is more useful to a stuck player than an error message.
  return { ok: true, move: { kind: "solve", ops } };
}

/**
 * Every edge the player has marked against the board's solution: a line the loop
 * does not run along, or an edge ruled out that it does.
 *
 * `checkCompletion`'s `lineErrors` is a different thing and stays: it flags a
 * *rule* broken on the board as drawn (a dot with three lines, a loop that is not
 * the only one), which it can see without knowing the answer. This compares with
 * the answer, so it also finds a line that breaks no rule and is still wrong, and
 * that is what lets the hint take the player's marks as facts. A board whose clues
 * admit no provably unique solution has nothing to compare with and reports none.
 */
function findMistakes(state: LoopyState): readonly LoopyMistake[] {
  const solution = uniqueSolution(state);
  if (solution === null) return [];
  const out: LoopyMistake[] = [];
  for (let edge = 0; edge < state.lines.length; edge++) {
    const line = state.lines[edge];
    if (line !== LINE_UNKNOWN && line !== solution[edge])
      out.push({ kind: "edge", edge });
  }
  const isLine = (edge: number): boolean => solution[edge] === LINE_YES;
  for (let dline = 0; dline < state.corners.length; dline++) {
    const bits = state.corners[dline];
    if (bits === 0) continue;
    const { first, second } = dlineEnds(state.grid, dline);
    const lines = (isLine(first) ? 1 : 0) + (isLine(second) ? 1 : 0);
    if ((bits & 1 && lines === 0) || (bits & 2 && lines === 2)) {
      out.push({ kind: "corner", dline });
    }
  }
  for (const { a, b, opposite } of state.pairs) {
    if ((isLine(a) !== isLine(b)) !== opposite) out.push({ kind: "pair", a, b });
  }
  return out;
}

/** Loopy's difficulty contract (`engine/difficulty.ts`). Its generator gates
 * every clue removal on `"solved"` specifically: an `"ambiguous"` verdict means
 * the solver only got there by trying a loop closure, which is not a deduction
 * a player could be expected to make. `solveGame` is used directly rather than
 * `gameHasUniqueSoln`, which throws on a contradiction because the generator
 * only ever asks it about boards derived from a real loop — a probe has no such
 * guarantee, and a contradiction is a verdict here, not a porting bug. */
const difficulty: DifficultyContract<LoopyParams> = {
  solveAtCap: (p, desc, cap) => {
    const ss = solveGame(newState(p, desc), cap);
    if (ss.status === "mistake") return "impossible";
    return ss.status === "solved" ? "solved" : "unsolved";
  },
};

export const loopyGame: Game<
  LoopyParams,
  LoopyState,
  LoopyMove,
  LoopyUi,
  LoopyDrawState,
  LoopyMistake
> = {
  id: "loopy",
  // True in the sense the interface means it — Loopy *has* a text format — but
  // it only covers the square tiling, so `textFormat` returns `undefined` for
  // the other seventeen (upstream's `game_can_format_as_text_now(params)`).

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams,
  paramConfig,

  newDesc,
  validateDesc,
  newState,
  newUi,

  targetVerbs,
  interpretMove,
  executeMove,
  hover,
  // The midend upgrades this to "solved-with-help" itself when Solve was used.
  status: (s) => (s.completed ? "solved" : "ongoing"),
  solve,
  difficulty,
  findMistakes,
  hint: (state) => hint(state, findMistakes(state).length),
  hintMarks: {
    roles: {
      ring: "what the step decides, in blue: a band along an edge it sets, solid when it must be a line and broken when it can't be one, or a note it places, called “this corner” or “these two edges”.",
      outline:
        "what the step reasons from: the clue it counts (“this 3”) outlined, the dot it reasons about (“the outlined dot”) ringed, a band under the drawn lines it cites, such as the loop an edge would close (“the marked lines”), and the notes it cites (“the marked corner”, “the marked pair”), highlighted.",
    },
  },
  hintKeepTrack,
  refreshHintStep,
  textFormat,
  prefs,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,
  flashLength: (a, b) => winFlash(a, b, FLASH_TIME),
};

registerGame(loopyGame);

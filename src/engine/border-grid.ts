/**
 * The border-marking grid: the mechanic Palisade and Separate share.
 *
 * Both games divide a square grid into regions by marking the edges *between*
 * cells with a tri-state — wall / not-a-wall / undecided — and differ only in
 * what constrains the regions (Palisade counts each cell's walls, Separate fixes
 * region sizes and keeps marked cells apart). The mechanic the player operates
 * is one design, so it is written once.
 *
 * WHAT LIVES HERE is only what would have to change in both games at once to
 * keep them correct: the edge bit vocabulary, the geometry that turns a tile
 * size into a coordinate, and the input mechanic. Each game keeps its own clue
 * semantics, solver, generator, completion test and clue rendering — and its own
 * `Move` type, because the shared code reports *which edge and how its state
 * should cycle*, never a move. A shared move type would couple two save formats
 * that have no reason to be identical.
 *
 * The mechanic's **look** lives next door in
 * [`border-grid-render.ts`](./border-grid-render.ts): the error model over the
 * two DSFs, the half-grid cursor this file *moves*, the four edge rects and the
 * geometry — a sibling only because one file holding both would be long.
 *
 * WHAT DOES NOT live here is code that merely looks alike. A loop over `w*h`
 * that reads a flag and draws a line resembles its counterpart in any grid game
 * in this collection; unifying that would couple two renderers with no reason to
 * move together. The test is not "are these the same text" but *"would a change
 * here have to happen in both games at once?"* — which the error model and the
 * cursor pass, being the rendering *of this mechanic*.
 */
import { Dsf } from "./dsf.ts";
import { cursorDelta, type GridCursor } from "./pointer.ts";
import {
  DOWN,
  type EdgeLayout,
  LEFT,
  pointAtSide,
  RIGHT,
  type Side,
  sideAt,
  sideMiddle,
  squareEdges,
  UP,
} from "./square-edges.ts";
import { rulingOut, type TargetGeometry, type TargetVerbs } from "./target-verb.ts";

// --- the edge bit vocabulary -----------------------------------------------
// A cell stores its four borders in the low nibble and their "definitely not a
// wall" companions in the high nibble, so one `number` per cell carries the
// whole tri-state. Upstream's encoding, kept because both games' descriptions
// and saves are written in terms of it.

export const BORDER_U = 1;
export const BORDER_R = 2;
export const BORDER_D = 4;
export const BORDER_L = 8;
export const BORDER_MASK = BORDER_U | BORDER_R | BORDER_D | BORDER_L;

/** The bit for direction `dir` (0=up, 1=right, 2=down, 3=left). */
export const BORDER = (dir: number): number => 1 << dir;

/** The "known not to be a wall" companion bit for a border bit. */
export const DISABLED = (border: number): number => border << 4;

/** The direction facing `dir` from the neighboring cell. */
export const FLIP = (dir: number): number => dir ^ 2;

export const DX = [0, +1, 0, -1] as const;
export const DY = [-1, 0, +1, 0] as const;

/** `square-edges.ts`'s direction for each of this file's. This file numbers
 * directions by the bit each one's border is saved in, which is upstream's
 * order and not the engine's. */
const SQUARE_DIRS: readonly number[] = [UP, RIGHT, DOWN, LEFT];

/** The tri-state a single edge can be in, as the input mechanic sees it. */
const MAYBE = 0;
const YES = 1;
const NO = 2;

export function outOfBounds(x: number, y: number, w: number, h: number): boolean {
  return x < 0 || x >= w || y < 0 || y >= h;
}

const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

// --- geometry ---------------------------------------------------------------

/** Half a tile of slack around the grid, so a border on the outer edge is
 * clickable and drawable. */
export const margin = (ts: number): number => Math.floor(ts / 2);

// --- the input mechanic ------------------------------------------------------

/** The part of a game's state this mechanic reads. Both games' states satisfy
 * it structurally. */
export interface BorderGridState {
  w: number;
  h: number;
  borders: ArrayLike<number>;
}

/** The cursor state this mechanic maintains: the collection's shared
 * {@link GridCursor}, but read in HALF-cells — `(2x+1, 2y+1)` is the center of
 * cell `(x,y)`, so an even coordinate names an edge and both-even a corner.
 * That is what lets one cursor address cells and the edges between them without
 * a second state variable, and it is why the traversal below is this module's
 * own rather than `pointer.ts`'s `moveCursor`. */
export interface BorderGridUi {
  cursor: GridCursor;
}

/** One cell's worth of bits to toggle. An edge always produces two of these —
 * a wall belongs to both cells it separates, and they must agree. */
export interface BorderEdit {
  x: number;
  y: number;
  flag: number;
}

/** An edge between two cells, named from the cell `(x, y)` in direction `dir`.
 * The rim of the grid, with no second cell, is never one. */
export interface BorderEdge {
  x: number;
  y: number;
  dir: number;
}

/**
 * The interior edge nearest a press at `(px0, py0)`, or `null` outside the grid
 * or on its rim.
 */
export function pointerEdge(
  state: BorderGridState,
  px: number,
  py: number,
  ts: number,
): BorderEdge | null {
  // No still middle: every press inside a cell aims at one of its sides.
  const side = sideAt(squareEdges(state.w, state.h), layout(ts), { x: px, y: py }, 0);
  if (!side) return null;
  return {
    x: side.cell % state.w,
    y: Math.floor(side.cell / state.w),
    dir: SQUARE_DIRS.indexOf(side.dir),
  };
}

/** The board's pixel layout, as `square-edges.ts` aims at an edge in it. */
const layout = (ts: number): EdgeLayout => ({ tile: ts, border: margin(ts) });

/** `square-edges.ts`'s side for an edge named from a cell. */
const sideOf = (w: number, { x, y, dir }: BorderEdge): Side => ({
  cell: y * w + x,
  dir: SQUARE_DIRS[dir],
});

/**
 * The paired edits that cycle `edge` one way. Toward a wall: undecided → wall →
 * undecided, and a not-a-wall mark goes straight to a wall. Toward not-a-wall
 * the same, mirrored. Both cells the edge separates are edited, since a wall
 * belongs to both and they must agree.
 */
export function edgeEdits(
  state: BorderGridState,
  { x, y, dir }: BorderEdge,
  towardWall: boolean,
): BorderEdit[] {
  const b = state.borders[y * state.w + x];
  const cur = b & BORDER(dir) ? YES : b & DISABLED(BORDER(dir)) ? NO : MAYBE;
  const next = towardWall ? (cur === YES ? MAYBE : YES) : cur === NO ? MAYBE : NO;

  let gdiff = 0;
  if ((cur === YES) !== (next === YES)) gdiff |= BORDER(dir);
  if ((cur === NO) !== (next === NO)) gdiff |= DISABLED(BORDER(dir));

  // The neighbor's bits are the same toggles seen from the other side: shift
  // each nibble from `dir` to the facing direction.
  const hdiff =
    ((gdiff >> dir) << FLIP(dir)) | ((gdiff >> (dir + 4)) << (FLIP(dir) + 4));
  return [
    { x, y, flag: gdiff },
    { x: x + DX[dir], y: y + DY[dir], flag: hdiff },
  ];
}

/**
 * The mechanic's geometry for the target-verb model: a press addresses the
 * nearest interior edge, and the half-cell cursor (see {@link BorderGridUi})
 * addresses the edge it rests on, or nothing on a corner or a tile center.
 */
export function borderGridGeometry<
  State extends BorderGridState,
  DrawState extends { readonly tileSize: number },
>(): TargetGeometry<State, BorderGridUi, DrawState, BorderEdge> {
  return {
    noun: "edge",
    pointerTarget: (s, ds, p) => pointerEdge(s, p.x, p.y, ds.tileSize),
    pointAt: (s, ds, e) =>
      pointAtSide(squareEdges(s.w, s.h), layout(ds.tileSize), sideOf(s.w, e)),
    cursorTarget(_s, ui) {
      const { x, y } = ui.cursor;
      if (x % 2 === y % 2) return null;
      // An even coordinate is the line left of, or above, a cell.
      return { x: Math.floor(x / 2), y: Math.floor(y / 2), dir: x % 2 === 0 ? 3 : 0 };
    },
    parkCursor(ui, e) {
      ui.cursor.x = 2 * e.x + 1 + DX[e.dir];
      ui.cursor.y = 2 * e.y + 1 + DY[e.dir];
    },
    moveCursor(s, ui, button) {
      const d = cursorDelta(button);
      if (d === null) return false;
      moveBorderCursor(ui, d, s.w, s.h);
      return true;
    },
  };
}

/**
 * The whole input mechanic as target verbs: the left button draws a wall and
 * the right marks not-a-wall. The game supplies only how a list of edits
 * becomes a `Move` of its own — this module knows which edge was addressed and
 * how its tri-state cycles, and coupling the two games' moves would couple two
 * save formats.
 */
export function borderGridVerbs<
  State extends BorderGridState,
  Ui extends BorderGridUi,
  DrawState extends { readonly tileSize: number },
  Move,
>(
  toMove: (edits: BorderEdit[]) => Move,
): TargetVerbs<State, Ui, DrawState, BorderEdge, Move> {
  return {
    geometry: borderGridGeometry<State, DrawState>(),
    primary: {
      does:
        "mark it as a division between regions (black), and again to return it " +
        "to undecided (yellow)",
      apply: (s, e) => toMove(edgeEdits(s, e, true)),
    },
    secondary: rulingOut({
      does:
        "mark it as definitely not a division (faint gray), and again to return " +
        "it to undecided",
      apply: (s: State, e: BorderEdge) => toMove(edgeEdits(s, e, false)),
    }),
    // Along a line of edges or round a corner, each taken near its middle:
    // every corner the drag passes is where four edges' catchments meet.
    sweep: {
      holds: (s, { x, y, dir }) => {
        const b = s.borders[y * s.w + x];
        return b & BORDER(dir) ? YES : b & DISABLED(BORDER(dir)) ? NO : MAYBE;
      },
      within: (ds) => ds.tileSize * 0.3,
      middle: (ds, s, e) =>
        sideMiddle(squareEdges(s.w, s.h), layout(ds.tileSize), sideOf(s.w, e)),
    },
  };
}

/** Move the half-cell cursor by one step, clamped inside the grid. Named apart
 * from `pointer.ts`'s `moveCursor` because the traversal genuinely differs: a
 * step here crosses half a cell, from an edge to a center or back. */
export function moveBorderCursor(
  ui: BorderGridUi,
  d: { dx: number; dy: number },
  w: number,
  h: number,
): void {
  ui.cursor.visible = true;
  ui.cursor.x = clamp(ui.cursor.x + d.dx, 1, 2 * w - 1);
  ui.cursor.y = clamp(ui.cursor.y + d.dy, 1, 2 * h - 1);
}

// --- border-array construction and connectivity ------------------------------

/** A fresh border byte array with only the grid-rim walls set. */
export function initBorders(w: number, h: number): Uint8Array {
  const borders = new Uint8Array(w * h);
  const wh = w * h;
  for (let c = 0; c < w; c++) {
    borders[c] |= BORDER_U;
    borders[wh - 1 - c] |= BORDER_D;
  }
  for (let r = 0; r < h; r++) {
    borders[r * w] |= BORDER_L;
    borders[wh - 1 - r * w] |= BORDER_R;
  }
  return borders;
}

/**
 * Connected components along `borders`.
 *
 * `black=true` merges across an edge with **no wall** — the regions the walls
 * actually divide the grid into. `black=false` merges only across an edge
 * explicitly marked *not* a wall — the components the player has committed to
 * being one region, which is what error highlighting needs, since a merely
 * undecided edge proves nothing.
 */
export function buildDsf(
  w: number,
  h: number,
  borders: Uint8Array,
  black: boolean,
): Dsf {
  const dsf = new Dsf(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (
        x + 1 < w &&
        (black ? !(borders[i] & BORDER_R) : borders[i] & DISABLED(BORDER_R))
      )
        dsf.merge(i, i + 1);
      if (
        y + 1 < h &&
        (black ? !(borders[i] & BORDER_D) : borders[i] & DISABLED(BORDER_D))
      )
        dsf.merge(i, i + w);
    }
  }
  return dsf;
}

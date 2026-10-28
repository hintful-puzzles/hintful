/**
 * Clusters state, params, move/ui types, and the desc codec — port of the
 * corresponding parts of `puzzles/unreleased/clusters.c`.
 *
 * The board is one `Uint8Array` of upstream's flag byte per cell: `F_COLOR_0`
 * (red), `F_COLOR_1` (blue) or 0 (empty), OR-ed with `F_SINGLE` for a given dot.
 * Upstream also stores its transient error and cursor flags in the grid; play
 * state never carries them (errors are recomputed on demand, see solver.ts), so
 * the given bytes stay clean for the desc encoder.
 */

import { searchTiers } from "../../engine/answer-search.ts";
import { type DescParse, descValue } from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { readDotRuns, writeDotRuns } from "../../engine/dot-runs.ts";
import type { ParamConfigItem, PresetBoards } from "../../engine/game.ts";
import { AREA_TOO_LARGE, dimensionParamConfig } from "../../engine/params.ts";
import { choice, dims, paramsCodec } from "../../engine/params-codec.ts";
import type { GridCursor } from "../../engine/pointer.ts";

// --- difficulty -------------------------------------------------------------

/** Solvable by the single-cell proof by contradiction alone. */
export const DIFF_EASY = 0;
/** Needs two tiles' counts read over the squares both touch. */
export const DIFF_TRICKY = 1;

/** The tiers: two the ladder finishes, then Unreasonable, which a search
 * proves has one answer. Unreasonable came with Normal's count (2026-10-28),
 * so that a board dealt before it, which may need the supposition Normal had
 * until then, still opens. */
export const TIERS = searchTiers(2);

/** Has one answer the ladder does not reach. */
export const DIFF_UNREASONABLE = TIERS.unreasonable;

export const DIFF_NAMES: readonly string[] = TIERS.names;

/** The `d<char>` param suffix, index = tier. */
const DIFF_CHARS = "etu";

// --- cell flag bits (upstream) ---------------------------------------------

export const F_COLOR_0 = 0x01; // upstream's red
export const F_COLOR_1 = 0x02; // upstream's blue
/** Which member of the collection's two-state pair (`TWO`, `TWO_NAMES`,
 * `TWO_SHAPES`) a colored cell is. `F_COLOR_1` is the first, as the color the
 * primary button gives. */
export const pairIndex = (cell: number): 0 | 1 => (cell & F_COLOR_1 ? 0 : 1);
export const F_SINGLE = 0x04; // a "dot": touches exactly one same-color cell
/** Transient rule-violation bit. Upstream `clusters_validate` mutates this
 * into the grid; the solver/generator reproduce that (it decides which boards a
 * seed produces — see solver.ts), but persisted play state stays free of it. */
export const F_ERROR = 0x08;
export const COLMASK = F_COLOR_0 | F_COLOR_1;

/** The color part of a move edit / solve cell: 0 empty, `F_COLOR_0` or
 * `F_COLOR_1` — the same byte value the grid stores (givens excepted,
 * which additionally carry `F_SINGLE`). */
export type ClustersFill = 0 | typeof F_COLOR_0 | typeof F_COLOR_1;

export const opposite = (fill: ClustersFill): ClustersFill =>
  fill === F_COLOR_0 ? F_COLOR_1 : F_COLOR_0;

// --- types -----------------------------------------------------------------

export interface ClustersParams {
  w: number;
  h: number;
  /** {@link DIFF_EASY} or {@link DIFF_TRICKY}. */
  diff: number;
}

export interface ClustersState {
  w: number;
  h: number;
  /** Flag byte per cell, row-major. */
  grid: Uint8Array;
}

/**
 * A move is either a *paint* — a list of cell edits committed together (one
 * click, one keyboard place, or a whole accreting drag) — or a *solve* — the
 * full-grid solution fill. Upstream serializes these as an `A%d;B%d;C%d;…`
 * string / an `S`-prefixed grid string.
 */
export type ClustersMove =
  | { kind: "paint"; cells: ReadonlyArray<{ index: number; fill: ClustersFill }> }
  | { kind: "solve"; fills: ReadonlyArray<ClustersFill> };

export interface ClustersUi {
  /** Keyboard cursor. */
  cursor: GridCursor;
  /** The accreting paint drag (the model Bricks and Sticks share). `dragType`
   * is `-1` until a press picks the {@link ClustersFill} to paint; `drag`
   * accretes the cell indices the pointer has passed over, previewed by the
   * renderer and committed as one `paint` move on release. Ephemeral — never in
   * persisted state. */
  dragType: number;
  drag: number[];
}

// --- params ----------------------------------------------------------------

const BOARDS: readonly ClustersParams[] = [
  { w: 7, h: 7, diff: DIFF_EASY },
  { w: 6, h: 8, diff: DIFF_EASY },
  { w: 9, h: 9, diff: DIFF_EASY },
  { w: 9, h: 11, diff: DIFF_EASY },
];

/** The largest board the menu offers at Normal. A Normal deal's tail is long
 * from about fifty squares up: of eight deals, the slowest 9x9 took 0.9 s,
 * 8x10 2.1 s and 9x11 1.9 s, and one 10x10 of six took 10 s (2026-10-27). */
const MENU_NORMAL_AREA = 81;

export function defaultParams(): ClustersParams {
  return { ...BOARDS[0] };
}

export const menu: PresetBoards<ClustersParams> = {
  boards: BOARDS,
  tiers: (b) => (b.w * b.h > MENU_NORMAL_AREA ? [DIFF_EASY, DIFF_EASY] : null),
};

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<ClustersParams>[] = [
  ...dimensionParamConfig<ClustersParams>({ doc: "Size of the grid in squares." }),
  TIERS.item(
    "diff",
    "Every puzzle has exactly one solution.<p><em>Easy</em> puzzles can be finished a square at a time: for each empty square, one of the two colors breaks a rule outright, so the other one is forced.</p><p><em>Normal</em> puzzles also need two tiles' counts read together over the squares both touch. A board an Easy player could finish is not offered as Normal.</p><p><em>Unreasonable</em> puzzles may need you to try a color and follow where it leads.</p>",
  ),
];

/**
 * A leading integer is the width (and default height); an `x<int>` overrides
 * the height; an optional `d<char>` selects the tier. A game ID from before
 * the tiers existed has no `d`, so it lands on the default — see
 * `defaultParams`.
 */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true }),
]);

/**
 * The smallest board on which a Normal puzzle exists: **twelve squares, and at
 * least two wide**.
 *
 * Normal demands a board the single-cell rule cannot finish, and a small grid has
 * nowhere to hide a deduction that deep. Measured by running the real gate over
 * every shape from 1×2 to 6×9, ten seeds each, with each seed given 10,000
 * attempts: **every** shape of twelve squares or
 * more bound the tier on all ten seeds, and **no** shape below it bound on any —
 * 2×5 and 3×3 never, 2×6 and 3×4 always.
 *
 * Area alone is not the rule, which is why both halves are stated. A 1×N strip
 * never binds *at any length* — 1×20 failed all five seeds — because a cell in a
 * one-wide board has at most two neighbors, so the single-cell rule decides it
 * immediately or not at all, and there is no second tile for a count to read.
 * Measured for Normal's lookahead; with the count in its place the same
 * shapes bound and failed, five deals each (2026-10-28). Unreasonable is not
 * refused: nothing has proved where its boards end.
 *
 * Refusing is the collection's rule for a tier with no boards: silently handing
 * back an Easy board is the same defect as a tier that does not bind, and an
 * honest gate with nothing to find would spin until its retry guard gave up.
 */
const MIN_TRICKY_AREA = 12;

export function validateParams(p: ClustersParams, full: boolean): string | null {
  // Upstream order: too-large before too-small.
  if (p.w * p.h >= 10000) return AREA_TOO_LARGE;
  if (p.w * p.h < 2) return "Width times height must be at least 2.";
  // 1x2 and 2x2 pass upstream's area check and have no puzzle whatever the
  // difficulty: every coloring of them either leaves a cell touching none of
  // its own color (which the generator flips away) or reduces to clues that
  // prune to nothing. Measured — those two shapes, alone among every shape up to
  // 4x7, never produced a board in 10,000 attempts; `max(w,h) >= 3` is exactly
  // their complement.
  if (Math.max(p.w, p.h) < 3) return "Width or height must be at least three.";
  // Generation only: a saved game or a game ID carrying its own description
  // still loads at any size, because `full` is false there.
  if (
    full &&
    p.diff === DIFF_TRICKY &&
    (Math.min(p.w, p.h) < 2 || p.w * p.h < MIN_TRICKY_AREA)
  ) {
    return `${DIFF_NAMES[DIFF_TRICKY]} needs a board of at least 12 squares, at least two wide.`;
  }
  return null;
}

// --- desc codec (upstream new_game_desc/new_game) ---------------------------

/** The given dots of a grid as `engine/dot-runs.ts` writes them: red
 * lowercase, blue uppercase. Only `F_COLOR_x|F_SINGLE` cells are dots. */
export function encodeDesc(grid: Uint8Array, w: number, h: number): string {
  return writeDotRuns(w * h, (i) =>
    grid[i] === (F_COLOR_1 | F_SINGLE)
      ? 1
      : grid[i] === (F_COLOR_0 | F_SINGLE)
        ? 0
        : null,
  );
}

function parseDesc(p: ClustersParams, desc: string): DescParse<Uint8Array> {
  const s = p.w * p.h;
  return readDesc(desc, (r) => {
    const grid = new Uint8Array(s);
    readDotRuns(r, s, (i, kind) => {
      grid[i] = (kind === 1 ? F_COLOR_1 : F_COLOR_0) | F_SINGLE;
    });
    return grid;
  });
}

export function newState(p: ClustersParams, desc: string): ClustersState {
  return { w: p.w, h: p.h, grid: descValue(parseDesc(p, desc)) };
}

export function cloneState(s: ClustersState): ClustersState {
  return { ...s, grid: s.grid.slice() };
}

// --- text format (upstream game_text_format) -------------------------------

export function textFormat(s: ClustersState): string {
  const { w, h, grid } = s;
  let out = "";
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = grid[y * w + x];
      const base = c & F_COLOR_0 ? "r" : c & F_COLOR_1 ? "b" : ".";
      // Uppercase for a given dot (never on an empty cell — givens are colored).
      out += `${c & F_SINGLE ? base.toUpperCase() : base} `;
    }
    out += "\n";
  }
  return out;
}

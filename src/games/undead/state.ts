import {
  DESC_TOO_LONG,
  type DescError,
  type DescParse,
  descValue,
  descVerdict,
  puzzleDescError,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import { difficultyItem, tierNames } from "../../engine/difficulty.ts";
import type { ParamConfigItem } from "../../engine/game.ts";
import { dimensionParamConfig } from "../../engine/params.ts";
import { choice, dims, paramsCodec } from "../../engine/params-codec.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { newCursor } from "../../engine/pointer.ts";
/**
 * Types and pure state helpers for Undead ("Haunted Mirror Mazes"), from
 * upstream `undead.c`.
 *
 * The board is a `w × h` grid embedded in a `(w+2) × (h+2)` array: each interior
 * cell is a fixed diagonal mirror (`\` = `CELL_MIRROR_L`, `/` = `CELL_MIRROR_R`)
 * or a monster cell, and the border cells carry the edge sighting clues. The
 * player places a Ghost (`1`), Vampire (`2`) or Zombie (`4`) in each monster
 * cell.
 *
 * The immutable, generation-derived data (the grid, the cell→monster-index map
 * `xinfo`, the per-type totals, the fixed-cell flags and the traced sightlines)
 * lives in a shared {@link UndeadCommon}; the per-move data lives in
 * {@link UndeadState}, which references one `common` and clones cheaply.
 */

// --- difficulty ------------------------------------------------------------

export type Difficulty = "easy" | "normal" | "tricky";

export const DIFF_EASY = 0;
export const DIFF_NORMAL = 1;
export const DIFF_TRICKY = 2;

// Upstream's `undead_diffchars`, indexed by level: game IDs and saves carry
// these letters.
const DIFF_CHARS = "ent";
// The top tier is `Unreasonable`: rung 3 (`forcingPass`) hypothesizes one
// candidate and runs the arc-consistency + counting fixpoint from it to a
// contradiction, a solve-from-hypothesis only an Unreasonable tier may require.
// No board needs a hypothesis nested inside that one (measured by
// `strengthen-undead-deduction`), and Easy and Normal stop below rung 3.
const DIFF_NAMES = tierNames(3, { search: true });
const DIFFS: Difficulty[] = ["easy", "normal", "tricky"];

export function diffToLevel(d: Difficulty): number {
  const i = DIFFS.indexOf(d);
  return i < 0 ? DIFF_NORMAL : i;
}
export function diffFromLevel(level: number): Difficulty {
  return DIFFS[level] ?? "normal";
}

// --- cell states (upstream CELL_* enum) ------------------------------------
//
// Upstream's `CELL_EMPTY` (0) and `CELL_UNDEF` (6) are absent because this port
// reads neither: an unfilled square is `MON_NONE` in the monster bitmask below,
// and nothing here needs a sentinel past the last monster.
export const CELL_MIRROR_L = 1; // '\'
export const CELL_MIRROR_R = 2; // '/'
const CELL_GHOST = 3;
const CELL_VAMPIRE = 4;
const CELL_ZOMBIE = 5;

// --- monster bitmask values ------------------------------------------------

export const MON_GHOST = 1;
export const MON_VAMPIRE = 2;
export const MON_ZOMBIE = 4;
export const MON_NONE = 7; // undecided (all candidates)
export const MONSTERS = [MON_GHOST, MON_VAMPIRE, MON_ZOMBIE] as const;

/** A single monster: a placed cell, or a candidate set narrowed to one. */
export const isSingleton = (v: number): boolean =>
  v === MON_GHOST || v === MON_VAMPIRE || v === MON_ZOMBIE;

// --- grid walk directions (upstream DIRECTION_* enum) ----------------------

const DIRECTION_NONE = 0;
const DIRECTION_UP = 1;
const DIRECTION_RIGHT = 2;
const DIRECTION_LEFT = 3;
const DIRECTION_DOWN = 4;

// --- params ----------------------------------------------------------------

export interface UndeadParams {
  w: number;
  h: number;
  diff: Difficulty;
}

/** Upstream `undead_presets`. */
export const PRESETS: UndeadParams[] = [
  { w: 4, h: 4, diff: "easy" },
  { w: 4, h: 4, diff: "normal" },
  { w: 4, h: 4, diff: "tricky" },
  { w: 5, h: 5, diff: "easy" },
  { w: 5, h: 5, diff: "normal" },
  { w: 5, h: 5, diff: "tricky" },
  { w: 7, h: 7, diff: "easy" },
  { w: 7, h: 7, diff: "normal" },
];

/** upstream DEFAULT_PRESET = 1 (4x4 Normal). */
export function defaultParams(): UndeadParams {
  return { ...PRESETS[1] };
}

/** The "Custom type…" form, and the field list the codec below encodes. */
export const paramConfig: ParamConfigItem<UndeadParams>[] = [
  ...dimensionParamConfig<UndeadParams>({
    doc: "Size of the grid in squares, at most 54 squares in all.",
    bounds: { min: 3 },
  }),
  difficultyItem(DIFF_NAMES, {
    get: (p: UndeadParams) => diffToLevel(p.diff),
    set: (p: UndeadParams, tier: number) => {
      p.diff = diffFromLevel(tier);
    },
  }),
];

/** `WxH`, plus the generator-only difficulty letter. An unknown letter leaves
 * the default tier. */
export const { encodeParams, decodeParams } = paramsCodec(defaultParams, [
  dims(paramConfig),
  choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true }),
]);

export function validateParams(p: UndeadParams, _full: boolean): string | null {
  if (p.w > Math.floor(54 / p.h)) return "Width times height must be at most 54.";
  return null;
}

// --- edge <-> grid mapping (range2grid / grid2range / num2grid) -------------

/** Map an edge position index (clockwise from the top-left) to the border cell
 * `(x, y)` and the inward direction a sightline entering there travels. */
export function range2grid(
  rangeno: number,
  width: number,
  height: number,
): { x: number; y: number; dir: number } {
  if (rangeno < 0) return { x: 0, y: 0, dir: DIRECTION_NONE };
  if (rangeno < width) return { x: rangeno + 1, y: 0, dir: DIRECTION_DOWN };
  rangeno -= width;
  if (rangeno < height) return { x: width + 1, y: rangeno + 1, dir: DIRECTION_LEFT };
  rangeno -= height;
  if (rangeno < width) return { x: width - rangeno, y: height + 1, dir: DIRECTION_UP };
  rangeno -= width;
  if (rangeno < height) return { x: 0, y: height - rangeno, dir: DIRECTION_RIGHT };
  return { x: 0, y: 0, dir: DIRECTION_NONE };
}

/** Inverse of {@link range2grid}: the edge index for a border (clue) cell, or
 * `-1` for an interior, corner or off-board cell. */
export function grid2range(x: number, y: number, w: number, h: number): number {
  if (x > 0 && x < w + 1 && y > 0 && y < h + 1) return -1;
  if (x < 0 || x > w + 1 || y < 0 || y > h + 1) return -1;
  if ((x === 0 || x === w + 1) && (y === 0 || y === h + 1)) return -1;
  if (y === 0) return x - 1;
  if (x === w + 1) return y - 1 + w;
  if (y === h + 1) return 2 * w + h - x;
  return 2 * (w + h) - y;
}

/** Interior cell `(x, y)` (1-based) for the `num`-th monster cell in reading
 * order. */
function num2grid(num: number, width: number): { x: number; y: number } {
  return { x: 1 + (num % width), y: 1 + Math.floor(num / width) };
}

// --- shared immutable structure --------------------------------------------

export interface UndeadPath {
  length: number;
  /** `length` entries: monster index, or `-1` at a mirror. */
  p: Int32Array;
  /** `length` entries: the cell index `x + y·(w+2)` walked at each step. */
  xy: Int32Array;
  /** the distinct monster indices on this path, in traversal order. */
  mapping: Int32Array;
  /** count of distinct monsters on the path (the `mapping` length). */
  numMonsters: number;
  /** edge indices of the two ends. */
  gridStart: number;
  gridEnd: number;
  /** sighting clue at each end (filled from `grid` by {@link makePaths}). */
  sightingsStart: number;
  sightingsEnd: number;
}

export interface UndeadCommon {
  params: UndeadParams;
  w: number;
  h: number;
  /** (w+2)·(h+2). */
  wh: number;
  numGhosts: number;
  numVampires: number;
  numZombies: number;
  numTotal: number;
  /** `wh` cell types / border clue numbers. */
  grid: Int32Array;
  /** `wh` cell→monster-index map (`>=0` monster cell, `-1` mirror, `-2` clue). */
  xinfo: Int32Array;
  /** `numTotal` fixed-cell flags (hand-entered givens). */
  fixed: Uint8Array;
  /** `w + h` traced sightlines. */
  paths: UndeadPath[];
  numPaths: number;
}

/**
 * Trace every sightline of the maze (upstream `make_paths`) from `common.grid`
 * (mirrors and border clue numbers) into the pre-allocated `common.paths`.
 */
export function makePaths(common: UndeadCommon): void {
  const { w, h, grid, xinfo, paths } = common;
  const stride = w + 2;
  let count = 0;
  const tracedEnds = new Set<number>();

  for (let i = 0; i < 2 * (w + h); i++) {
    if (tracedEnds.has(i)) continue; // the reverse of a path already traced

    const path = paths[count++];
    path.length = 0;
    path.gridStart = i;
    let { x, y, dir } = range2grid(i, w, h);
    path.sightingsStart = grid[x + y * stride];

    while (true) {
      if (dir === DIRECTION_DOWN) y++;
      else if (dir === DIRECTION_LEFT) x--;
      else if (dir === DIRECTION_UP) y--;
      else if (dir === DIRECTION_RIGHT) x++;

      const r = grid2range(x, y, w, h);
      if (r !== -1) {
        path.gridEnd = r;
        path.sightingsEnd = grid[x + y * stride];
        tracedEnds.add(r);
        break;
      }

      const cell = x + y * stride;
      path.xy[path.length] = cell;
      path.p[path.length++] = xinfo[cell]; // -1 at a mirror
      if (grid[cell] === CELL_MIRROR_L) {
        if (dir === DIRECTION_DOWN) dir = DIRECTION_RIGHT;
        else if (dir === DIRECTION_LEFT) dir = DIRECTION_UP;
        else if (dir === DIRECTION_UP) dir = DIRECTION_LEFT;
        else if (dir === DIRECTION_RIGHT) dir = DIRECTION_DOWN;
      } else if (grid[cell] === CELL_MIRROR_R) {
        if (dir === DIRECTION_DOWN) dir = DIRECTION_LEFT;
        else if (dir === DIRECTION_LEFT) dir = DIRECTION_DOWN;
        else if (dir === DIRECTION_UP) dir = DIRECTION_RIGHT;
        else if (dir === DIRECTION_RIGHT) dir = DIRECTION_UP;
      }
    }

    // The distinct monsters on the path, in traversal order.
    const distinct = new Set<number>();
    for (let k = 0; k < path.length; k++) if (path.p[k] !== -1) distinct.add(path.p[k]);
    path.mapping.set([...distinct]);
    path.numMonsters = distinct.size;
  }
}

/** Stable sort of the traced paths by ascending monster count (upstream
 * `qsort(path_cmp)`, whose tie order is unspecified). */
export function sortPaths(common: UndeadCommon): void {
  common.paths.sort((a, b) => a.numMonsters - b.numMonsters);
}

/** How many monsters `guess` shows along `path` seen from its start, or from
 * its end with `fromEnd`: vampires before the first mirror, ghosts after it,
 * zombies always. */
export function visibleCount(
  path: UndeadPath,
  guess: ArrayLike<number>,
  fromEnd: boolean,
): number {
  let count = 0;
  let mirror = false;
  for (let k = 0; k < path.length; k++) {
    const m = path.p[fromEnd ? path.length - 1 - k : k];
    if (m === -1) mirror = true;
    else if (guess[m] === MON_GHOST && mirror) count++;
    else if (guess[m] === MON_VAMPIRE && !mirror) count++;
    else if (guess[m] === MON_ZOMBIE) count++;
  }
  return count;
}

function newPath(wh: number): UndeadPath {
  return {
    length: 0,
    p: new Int32Array(wh),
    xy: new Int32Array(wh),
    mapping: new Int32Array(wh),
    numMonsters: 0,
    gridStart: -1,
    gridEnd: -1,
    sightingsStart: 0,
    sightingsEnd: 0,
  };
}

/** Allocate a fresh `common` with empty grid/paths (the parts `newState` and the
 * generator both fill). */
export function newCommon(params: UndeadParams): UndeadCommon {
  const w = params.w;
  const h = params.h;
  const wh = (w + 2) * (h + 2);
  const numPaths = w + h;
  const paths: UndeadPath[] = [];
  for (let i = 0; i < numPaths; i++) paths.push(newPath(wh));
  return {
    params,
    w,
    h,
    wh,
    numGhosts: 0,
    numVampires: 0,
    numZombies: 0,
    numTotal: 0,
    grid: new Int32Array(wh),
    xinfo: new Int32Array(wh),
    fixed: new Uint8Array(0),
    paths,
    numPaths,
  };
}

// --- state -----------------------------------------------------------------

export interface UndeadState {
  common: UndeadCommon;
  /** `numTotal` monster bitmask per cell: 1 ghost, 2 vampire, 4 zombie, 7
   * undecided. */
  guess: Uint8Array;
  /** `numTotal` pencil-mark bitmasks (only meaningful while `guess === 7`). */
  pencil: Uint8Array;
  /** `wh` live cell-error flags. */
  cellErrors: Uint8Array;
  /** `2·numPaths` live edge-clue error flags (indexed by edge position). */
  hintErrors: Uint8Array;
  /** 3 live count-error flags (ghost / vampire / zombie). */
  countErrors: Uint8Array;
  /** `2·numPaths` struck-through ("done") flags per edge clue. */
  hintsDone: Uint8Array;
}

export function cloneState(s: UndeadState): UndeadState {
  return {
    common: s.common,
    guess: s.guess.slice(),
    pencil: s.pencil.slice(),
    cellErrors: s.cellErrors.slice(),
    hintErrors: s.hintErrors.slice(),
    countErrors: s.countErrors.slice(),
    hintsDone: s.hintsDone.slice(),
  };
}

function blankState(common: UndeadCommon): UndeadState {
  return {
    common,
    guess: new Uint8Array(common.numTotal).fill(MON_NONE),
    pencil: new Uint8Array(common.numTotal),
    cellErrors: new Uint8Array(common.wh),
    hintErrors: new Uint8Array(2 * common.numPaths),
    countErrors: new Uint8Array(3),
    hintsDone: new Uint8Array(2 * common.numPaths),
  };
}

// --- moves -----------------------------------------------------------------

export type UndeadMove =
  /** Place a monster (1/2/4) in cell `cell`. */
  | { type: "set"; cell: number; monster: number }
  /** Clear cell `cell` (back to undecided, drop pencils). */
  | { type: "clear"; cell: number }
  /** Toggle a pencil mark (1/2/4) in cell `cell`. */
  | { type: "pencil"; cell: number; monster: number }
  /** Clear a list of candidate bits across cells at once, the hint's note move.
   * Idempotent, unlike `pencil`, so it is resume-safe in a kept plan
   * (docs/games/hints.md § "Persist, populate, and the moves"). */
  | { type: "pencilStrike"; marks: { cell: number; monster: number }[] }
  /** Fill every undecided cell with all candidate notes (`M`). */
  | { type: "markAll" }
  /** Toggle the struck-through ("done") state of edge clue `clue`. */
  | { type: "hintDone"; clue: number }
  /** Auto-solve: `placements[i]` is the monster (1/2/4) for cell `i`. */
  | { type: "solve"; placements: number[] };

// --- ui --------------------------------------------------------------------

export const COUNT_STYLE_TOTAL = 0;
export const COUNT_STYLE_REMAINING = 1;
export const COUNT_STYLE_PLACED_TOTAL = 2;
/** Fork addition (default): remaining-to-place / total-needed, e.g. `3/8`. */
export const COUNT_STYLE_REMAINING_TOTAL = 3;

export interface UndeadUi {
  cursor: GridCursor;
  pencilMode: boolean;
  cursorFromKeyboard: boolean;
  /** Preference (`monsters`): false → pictures, true → letters. Also toggled by
   * the `a` key in play. */
  ascii: boolean;
  /** Preference (default off): keep the mouse highlight after a pencil change. */
  pencilKeepHighlight: boolean;
  /** Preference (default on, fork divergence): right-click toggles a sticky
   * pencil mode. */
  pencilSticky: boolean;
  /** Preference (`count-style`): 0 total, 1 remaining, 2 placed/total, 3
   * remaining/total (default). Set in Preferences only — no in-play toggle. */
  countStyle: number;
}

export function newUi(_state: UndeadState): UndeadUi {
  return {
    cursor: newCursor(),
    pencilMode: false,
    cursorFromKeyboard: false,
    ascii: false,
    pencilKeepHighlight: true,
    pencilSticky: true,
    countStyle: COUNT_STYLE_REMAINING_TOTAL,
  };
}

// --- desc codec ------------------------------------------------------------

/** A given monster's letter: its cell value and its placed monster. */
const GIVEN_MONSTERS = new Map<string, readonly [number, number]>([
  ["G", [CELL_GHOST, MON_GHOST]],
  ["V", [CELL_VAMPIRE, MON_VAMPIRE]],
  ["Z", [CELL_ZOMBIE, MON_ZOMBIE]],
]);

const isGridChar = (c: string): boolean =>
  (c >= "a" && c <= "z") || c === "L" || c === "R" || GIVEN_MONSTERS.has(c);

/**
 * The three monster totals, the grid in reading order — `a`–`z` a run of 1–26
 * empty monster squares, `L`/`R` a mirror, `G`/`V`/`Z` a monster given in
 * place (upstream's grammar; the generator never writes one) — and the
 * `2(w + h)` sightings round the edge (upstream `new_game`).
 */
function parseDesc(params: UndeadParams, desc: string): DescParse<UndeadState> {
  return readDesc(desc, (r) => {
    const common = newCommon(params);
    const { w, h } = common;
    const wh = w * h;
    const stride = w + 2;

    common.numGhosts = r.int(0, wh);
    r.expect(",");
    common.numVampires = r.int(0, wh);
    r.expect(",");
    common.numZombies = r.int(0, wh);
    r.expect(",");
    common.numTotal = common.numGhosts + common.numVampires + common.numZombies;

    const state = blankState(common);
    common.fixed = new Uint8Array(common.numTotal);

    // `n` numbers the interior cells in reading order, `count` the monster cells.
    let count = 0;
    let n = 0;
    const nextCell = (): number => {
      const g = num2grid(n++, w);
      return g.x + g.y * stride;
    };
    while (n < wh) {
      const c = r.char(isGridChar);
      const given = GIVEN_MONSTERS.get(c);
      if (c === "L" || c === "R") {
        const cell = nextCell();
        common.grid[cell] = c === "L" ? CELL_MIRROR_L : CELL_MIRROR_R;
        common.xinfo[cell] = -1;
      } else if (given) {
        const [cellValue, monster] = given;
        const cell = nextCell();
        common.grid[cell] = cellValue;
        common.xinfo[cell] = count;
        state.guess[count] = monster;
        common.fixed[count++] = 1;
      } else {
        const run = c.charCodeAt(0) - 96;
        if (n + run > wh) r.fail(DESC_TOO_LONG);
        for (let k = 0; k < run; k++) common.xinfo[nextCell()] = count++;
      }
    }
    if (count !== common.numTotal)
      r.fail(
        puzzleDescError(
          "This game ID's monster counts don't add up to the number of empty squares.",
        ),
      );

    // A sighting path crosses each square at most twice, once along each axis.
    for (let i = 0; i < 2 * (w + h); i++) {
      r.expect(",");
      const gg = range2grid(i, w, h);
      common.grid[gg.x + gg.y * stride] = r.int(0, 2 * wh);
      common.xinfo[gg.x + gg.y * stride] = -2;
    }
    r.end();

    // The four corners don't matter; zero them.
    for (const cell of [0, w + 1, w + 1 + (h + 1) * stride, (h + 1) * stride]) {
      common.grid[cell] = 0;
      common.xinfo[cell] = -2;
    }

    makePaths(common);
    sortPaths(common);
    return state;
  });
}

export function newState(params: UndeadParams, desc: string): UndeadState {
  return descValue(parseDesc(params, desc));
}

export function validateDesc(p: UndeadParams, desc: string): DescError | null {
  return descVerdict(parseDesc(p, desc));
}

// --- live error recomputation (check_numbers_draw + check_path_solution) ----

/**
 * Recompute the live legality overlays from `state.guess` (upstream
 * `execute_move`'s post-move sweep). Mutates `state.cellErrors`/`hintErrors`/
 * `countErrors`; returns whether the board is fully placed *and* legal (every
 * cell a single monster, all counts and sightings satisfied) — the completion
 * signal.
 */
export function recomputeErrors(state: UndeadState): boolean {
  state.cellErrors.fill(0);
  state.hintErrors.fill(0);
  state.countErrors.fill(0);
  let correct = checkNumbersDraw(state);
  for (const path of state.common.paths) {
    if (!checkPathSolution(state, path)) correct = false;
  }
  return correct && state.guess.every(isSingleton);
}

function checkNumbersDraw(state: UndeadState): boolean {
  const common = state.common;
  const stride = common.w + 2;
  const counts = MONSTERS.map((m) => state.guess.filter((g) => g === m).length);
  const totals = [common.numGhosts, common.numVampires, common.numZombies];
  const filled = counts[0] + counts[1] + counts[2] >= common.numTotal;
  let valid = true;
  for (let t = 0; t < 3; t++) {
    if (counts[t] > totals[t] || (filled && counts[t] !== totals[t])) {
      valid = false;
      state.countErrors[t] = 1;
      for (let x = 1; x <= common.w; x++) {
        for (let y = 1; y <= common.h; y++) {
          const xy = x + y * stride;
          const xi = common.xinfo[xy];
          if (xi >= 0 && state.guess[xi] === MONSTERS[t]) state.cellErrors[xy] = 1;
        }
      }
    }
  }
  return valid;
}

/** Flag each of `path`'s clues that its cells can no longer meet: more
 * monsters already visible than it says, or too few even if every undecided
 * cell turned out visible. */
function checkPathSolution(state: UndeadState, path: UndeadPath): boolean {
  let unfilled = 0;
  for (let i = 0; i < path.length; i++) {
    if (path.p[i] !== -1 && state.guess[path.p[i]] === MON_NONE) unfilled++;
  }
  let correct = true;
  const check = (edge: number, clue: number, fromEnd: boolean): void => {
    const seen = visibleCount(path, state.guess, fromEnd);
    if (seen > clue || seen + unfilled < clue) {
      correct = false;
      state.hintErrors[edge] = 1;
    }
  };
  check(path.gridStart, path.sightingsStart, false);
  check(path.gridEnd, path.sightingsEnd, true);
  if (!correct) {
    for (let i = 0; i < path.length; i++) state.cellErrors[path.xy[i]] = 1;
  }
  return correct;
}

// --- status / text ---------------------------------------------------------

/** The move's error check, run on a copy because it writes the error flags. */
export function status(s: UndeadState): "solved" | "ongoing" {
  return recomputeErrors(cloneState(s)) ? "solved" : "ongoing";
}

/** ASCII board, matching `game_text_format`. */
export function textFormat(s: UndeadState): string {
  const common = s.common;
  const w = common.w;
  const h = common.h;
  const stride = w + 2;
  let out = `G: ${common.numGhosts} V: ${common.numVampires} Z: ${common.numZombies}\n\n`;
  for (let y = 0; y < h + 2; y++) {
    for (let x = 0; x < w + 2; x++) {
      const c = common.grid[x + y * stride];
      const xi = common.xinfo[x + y * stride];
      const r = grid2range(x, y, w, h);
      if (r !== -1) {
        out += c.toString().padStart(2, " ");
      } else if (c === CELL_MIRROR_L) {
        out += " \\";
      } else if (c === CELL_MIRROR_R) {
        out += " /";
      } else if (xi >= 0) {
        const g = s.guess[xi];
        out +=
          g === MON_GHOST
            ? " G"
            : g === MON_VAMPIRE
              ? " V"
              : g === MON_ZOMBIE
                ? " Z"
                : " .";
      } else {
        out += "  ";
      }
    }
    out += "\n";
  }
  return out;
}

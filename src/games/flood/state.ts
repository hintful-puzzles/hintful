import { digitValue, isDigit, parseLeadingInt } from "../../engine/decimal.ts";
import {
  DESC_OUT_OF_RANGE,
  type DescError,
  type DescParse,
  descValue,
  descVerdict,
} from "../../engine/desc-error.ts";
import { readDesc } from "../../engine/desc-reader.ts";
import type { PresetMenu } from "../../engine/game.ts";
import { parseDimensions } from "../../engine/params.ts";
import type { GridCursor } from "../../engine/pointer.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import type { GameStatus } from "../../engine/types.ts";
import { choosemove, completed, fill, SolverScratch } from "./solver.ts";

// --- constants --------------------------------------------------------

/** The flood-fill anchor: the top-left corner (upstream `FILLX`/`FILLY`). */
export const FILLX = 0;
export const FILLY = 0;

/** Upper limit on colors, from the count of distinct RGB values
 * upstream defines (`MAXCOLORS`). */
export const MAXCOLORS = 10;

// --- types ------------------------------------------------------------

export interface FloodParams {
  w: number;
  h: number;
  colors: number;
  /** Extra moves permitted above the solver's move count. */
  leniency: number;
}

export interface FloodState {
  readonly w: number;
  readonly h: number;
  /** Number of distinct colors in play (cells hold `0..colors-1`). */
  readonly colors: number;
  /** Color per cell in row-major order. Below `MAXCOLORS`, so each is one
   * digit in the desc and the text format. */
  readonly grid: Uint8Array;
  readonly moves: number;
  readonly movelimit: number;
}

/** A fill picks a color for the corner region; a solve snaps to the
 * solved board. Both are plain JSON-safe data, so the default move codec
 * suffices. Upstream's stored solution path (`soln`, which Solve set and
 * the secondary select stepped through) is dropped: the hint plan
 * replaces it. */
export type FloodMove = { type: "fill"; color: number } | { type: "solve" };

export interface FloodUi {
  cursor: GridCursor;
}

// --- params -----------------------------------------------------------

export function defaultParams(): FloodParams {
  return { w: 12, h: 12, colors: 6, leniency: 5 };
}

export function encodeParams(p: FloodParams, full: boolean): string {
  let s = `${p.w}x${p.h}`;
  if (full) s += `c${p.colors}m${p.leniency}`;
  return s;
}

export function decodeParams(s: string): FloodParams {
  // Upstream's format: `WxH` (a bare `W` is square), then `c<colors>` and
  // `m<leniency>` anywhere in the remainder, each read with `atoi`.
  const ret = defaultParams();
  const dims = parseDimensions(s);
  ret.w = dims.w;
  ret.h = dims.h;
  let i = dims.next;
  while (i < s.length) {
    if (s[i] === "c") {
      const r = parseLeadingInt(s, i + 1);
      ret.colors = r.value;
      i = r.next;
    } else if (s[i] === "m") {
      const r = parseLeadingInt(s, i + 1);
      ret.leniency = r.value;
      i = r.next;
    } else {
      i++;
    }
  }
  return ret;
}

export function validateParams(p: FloodParams, _full: boolean): string | null {
  if (p.w * p.h < 2) return "Grid must contain at least two squares.";
  return null;
}

// --- presets ----------------------------------------------------------

export function presets(): PresetMenu<FloodParams> {
  const p = (w: number, h: number, colors: number, leniency: number) => ({
    params: { w, h, colors, leniency },
  });
  // Upstream's Easy/Medium/Hard are extra-move allowances, not tiers, so no
  // field says them.
  const named = (title: string, w: number, h: number, leniency: number) => ({
    title,
    ...p(w, h, 6, leniency),
  });
  return {
    title: "Type",
    submenu: [
      named("12x12 Easy", 12, 12, 5),
      named("12x12 Medium", 12, 12, 2),
      named("12x12 Hard", 12, 12, 0),
      named("16x16 Medium", 16, 16, 2),
      named("16x16 Hard", 16, 16, 0),
      p(12, 12, 3, 0),
      p(12, 12, 4, 0),
    ],
  };
}

// --- desc -------------------------------------------------------------

/** One color digit per cell, a comma, then the move limit. */
function parseDesc(
  p: FloodParams,
  desc: string,
): DescParse<{ grid: Uint8Array; movelimit: number }> {
  const wh = p.w * p.h;
  return readDesc(desc, (r) => {
    const grid = new Uint8Array(wh);
    for (let i = 0; i < wh; i++) {
      const c = digitValue(r.char(isDigit)) as number;
      if (c >= p.colors) r.fail(DESC_OUT_OF_RANGE);
      grid[i] = c;
    }
    r.expect(",");
    // The limit is the solver's count plus the leniency, which no param
    // bounds; this bound only keeps it an exact integer.
    const movelimit = r.int(0, Number.MAX_SAFE_INTEGER);
    r.end();
    return { grid, movelimit };
  });
}

export function validateDesc(p: FloodParams, desc: string): DescError | null {
  return descVerdict(parseDesc(p, desc));
}

export function newState(p: FloodParams, desc: string): FloodState {
  const { grid, movelimit } = descValue(parseDesc(p, desc));
  let colors = 0;
  for (const c of grid) if (c >= colors) colors = c + 1;
  return {
    w: p.w,
    h: p.h,
    colors,
    grid,
    moves: 0,
    movelimit,
  };
}

// --- status -----------------------------------------------------------

/** Upstream's `game_status`: completing within the limit wins; reaching the
 * limit otherwise loses, even if a later fill completes the grid. */
export function status(state: FloodState): GameStatus {
  if (completed(state.grid) && state.moves <= state.movelimit) return "solved";
  if (state.moves >= state.movelimit) return "lost";
  return "ongoing";
}

// --- text format ------------------------------------------------------

export function textFormat(state: FloodState): string {
  const { w, h, grid } = state;
  let text = "";
  for (let y = 0; y < h; y++) text += `${grid.subarray(y * w, (y + 1) * w).join("")}\n`;
  return text;
}

// --- generator --------------------------------------------------------

/** Upstream's `new_game_desc`: invent a random grid (re-rolling an
 * already-complete one), run the heuristic solver to count the moves it
 * needs, and set the move limit to that count plus the leniency. The
 * differential checks both halves: the grid reproduces from `random.ts`,
 * the limit only if the solver makes C's choices. */
export function newDesc(p: FloodParams, rng: RandomState): { desc: string } {
  const { w, h, colors, leniency } = p;
  const wh = w * h;
  const scratch = new SolverScratch(w, h);

  const grid = new Uint8Array(wh);
  do {
    for (let i = 0; i < wh; i++) grid[i] = randomUpto(rng, colors);
  } while (completed(grid));

  // Run the solver on a copy, counting its moves.
  const work = Uint8Array.from(grid);
  let moves = 0;
  while (!completed(work)) {
    const move = choosemove(w, h, work, FILLX, FILLY, colors, scratch);
    fill(w, h, work, FILLX, FILLY, move, scratch.queue0);
    moves++;
  }
  return { desc: `${grid.join("")},${moves + leniency}` };
}

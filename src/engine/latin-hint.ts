/**
 * Shared hint helpers for the Latin-square family. The generic `latin.ts` solver
 * records *every* forced single placement (its `elim`) under one reason —
 * `{ kind: "single" }` — but `elim` fires on three slice kinds: a *cell* slice (a
 * genuine **naked** single, the cell's own candidates collapsed to one) and a
 * *row* / *column* slice (a **hidden** single — a digit that fits only one cell
 * of that line, while the cell itself still shows several candidates).
 *
 * Narrating a hidden single as "every other number has been ruled out in this
 * cell" is wrong — the player is looking at a cell that still visibly holds
 * several candidates. So a hint must re-derive *which* kind it is from the working
 * board and narrate + shade accordingly (a naked single shades the cell alone; a
 * hidden single names and shades its whole row/column). This module is that
 * re-derivation, shared so every Latin game tells the truth the same way.
 */

import { type NoteEncoding, nextPlace } from "./candidate-hint.ts";
import type { DeductionRecord } from "./deduction-record.ts";
import type { ForcingLink } from "./latin.ts";
import type { OrderedCell } from "./overlay-sidecar.ts";
import type { Point } from "./types.ts";

/** Re-exported so a game declaring its own reason union reaches the chain shape
 * from the hint module it already imports (as `latin.ts` does for
 * `DeductionRecord`). */
export type { ForcingLink };

/** A forced single placement, classified against the working board:
 * - `naked` — the cell's own candidates are exactly `{n}`;
 * - `hidden` — a row/column no other empty cell of which can still take `n`.
 *
 * There is no third kind. A placement the notes show as neither rests on strikes
 * the plan never placed, which a hint may not narrate (AGENTS.md § "Hint quality
 * bar", rule 6), so {@link classifyPlacementInRegions} throws instead. */
export type SinglePlacement =
  | { kind: "naked" }
  | { kind: "hidden"; line: "row" | "col"; index: number };

/** A region a value may not repeat in: its member cell indices (`y * w + x`),
 * and whether it also holds every value once. A game declares each of a cell's
 * regions once, in narration preference order, and every consumer derives its
 * own list from that: the notes culls read all of them, and the placement
 * classifier only the ones that hold every value, since a value with one home
 * left in a region is forced there only if the region must hold it (a Killer
 * cage need not). A region with neither property (a Keen cage) is not declared,
 * because nothing reads it. A game tags each region with whatever it needs to
 * name it (a `line`/`index` for a row/column, a `kind` for a sub-block or
 * diagonal) and reads that tag back off the classifier's `region`. */
export interface CellRegion {
  cells: ArrayLike<number>;
  holdsEvery: boolean;
}

/** The declared regions of `R` the classifier reasons over. For a union that
 * tags only its whole regions for naming, this is the tagged arm. */
export type WholeRegion<R extends CellRegion> = R & { holdsEvery: true };

/** Whether the forced placement of digit `n` at `cell` is a *naked* single (the
 * cell's notes are exactly `{n}`) or a *hidden* single in one of `regions` (no
 * other empty cell of that region still notes `n`). The generic core of
 * docs/games/hints.md § "Re-derive a placement's why" for any
 * candidate-elimination game: the Latin row/column games pass `[row, column]`;
 * Solo passes `[row, column, block, diag0, diag1]` and its Killer cage, which is
 * skipped because it need not hold every digit. Regions are tested in order,
 * so the first match wins (callers list them in narration preference order).
 *
 * **Throws when it is neither**: the notes then still show candidates the solver
 * has ruled out, so the plan skipped a strike the placement rests on. Every
 * plan that classifies a placement passes here, which is what makes the
 * cross-game hint walks (`hint-resume.test.ts`, `hint-quality.test.ts`) the
 * guard for it. */
export function classifyPlacementInRegions<R extends CellRegion>(
  grid: ArrayLike<number>,
  pencil: ArrayLike<number>,
  cell: number,
  n: number,
  regions: readonly R[],
  enc?: NoteEncoding,
): { kind: "naked" } | { kind: "hidden"; region: WholeRegion<R> } {
  const c = placementInRegions(grid, pencil, cell, n, regions, enc);
  if (c) return c;
  throw new Error(
    `hint plan: placing ${n} at cell ${cell} is neither a naked nor a hidden single ` +
      "in the notes, so the plan skipped a strike it rests on",
  );
}

/** {@link classifyPlacementInRegions} for a placement that may not be a single
 * yet: `null` where it would throw. What a plan asks of a placement it is
 * choosing *between*, where "not a single on these notes" means "not available
 * now" rather than "the plan skipped a strike". */
function placementInRegions<R extends CellRegion>(
  grid: ArrayLike<number>,
  pencil: ArrayLike<number>,
  cell: number,
  n: number,
  regions: readonly R[],
  enc?: NoteEncoding,
): { kind: "naked" } | { kind: "hidden"; region: WholeRegion<R> } | null {
  const bit = (enc?.bit ?? ((v: number): number => 1 << v))(n);
  if (pencil[cell] === bit) return { kind: "naked" };
  for (const region of regions) {
    if (!isWhole(region)) continue;
    let hidden = true;
    for (let i = 0; i < region.cells.length; i++) {
      const j = region.cells[i];
      if (j === cell) continue;
      if (grid[j] === 0 && pencil[j] & bit) {
        hidden = false;
        break;
      }
    }
    if (hidden) return { kind: "hidden", region };
  }
  return null;
}

function isWhole<R extends CellRegion>(region: R): region is WholeRegion<R> {
  return region.holdsEvery;
}

/** Why a placement a plan could take now is forced: a single the notes show, or
 * (`recorded`) the solver's own reason, which the game keeps. */
export type PlacementWhy<R> =
  | { kind: "naked" }
  | { kind: "hidden"; region: R }
  | { kind: "recorded" };

/**
 * The recorded placements a plan could take now, in solver order — the choices
 * `HintFrontier` picks among.
 *
 * A placement the solver records as a plain `single` is available whenever the
 * notes show it as a naked or hidden single in one of its cell's `regionsOf` that
 * holds every value; the solver's having placed it is what makes trusting the
 * notes sound. A placement
 * with a reason of its own (a clue or cage that forces it) rests on the solver's
 * cube rather than on the notes, so it is offered only as the plan's last
 * resort: the first unreflected placement, when `nothingElse` says every other
 * rung of the plan came up empty.
 *
 * In that position a plain single the notes do not show is the plan having
 * skipped a strike, and it is classified with the throwing
 * {@link classifyPlacementInRegions}, so the cross-game hint walks stay the
 * guard for it. Anywhere earlier it is merely not available yet: another
 * rung's firing may be the very premise it waits on.
 */
export function availablePlacements<Op extends DeductionRecord, R extends CellRegion>(
  ops: readonly Op[],
  grid: ArrayLike<number>,
  pencil: ArrayLike<number>,
  w: number,
  regionsOf: (x: number, y: number) => readonly R[],
  nothingElse: boolean,
  opts?: { enc?: NoteEncoding; placed?: ArrayLike<number> },
): { op: Op; why: PlacementWhy<WholeRegion<R>> }[] {
  const placed = opts?.placed ?? grid;
  const first = nextPlace(ops, placed, w);
  const out: { op: Op; why: PlacementWhy<WholeRegion<R>> }[] = [];
  for (const op of ops) {
    if (op.kind !== "place" || placed[op.y * w + op.x] !== 0) continue;
    const cell = op.y * w + op.x;
    const regions = regionsOf(op.x, op.y);
    const lead = op === first && nothingElse;
    if ((op.reason as { kind?: string }).kind !== "single") {
      if (lead) out.push({ op, why: { kind: "recorded" } });
      continue;
    }
    const why = lead
      ? classifyPlacementInRegions(grid, pencil, cell, op.n, regions, opts?.enc)
      : placementInRegions(grid, pencil, cell, op.n, regions, opts?.enc);
    if (why) out.push({ op, why });
  }
  return out;
}

/** A row/column region tagged for narration: the cells of the line plus whether it
 * is a `row` (`index` = its y) or `col` (`index` = its x). */
export interface RowColRegion {
  cells: number[];
  holdsEvery: true;
  line: "row" | "col";
  index: number;
}

/** The two regions of cell `(x, y)` in a plain Latin square: its row and its
 * column, in narration-preference order (row first), each holding every value.
 * A Keen cage is an arithmetic constraint a value may repeat in, so it is not a
 * region at all. */
export function rowColRegions(x: number, y: number, w: number): RowColRegion[] {
  const row: number[] = [];
  const col: number[] = [];
  for (let k = 0; k < w; k++) {
    row.push(y * w + k);
    col.push(k * w + x);
  }
  return [
    { cells: row, holdsEvery: true, line: "row", index: y },
    { cells: col, holdsEvery: true, line: "col", index: x },
  ];
}

/**
 * Classify the forced placement of digit `n` at `(x, y)` on the working board
 * (`grid`: 0 = empty; `pencil`: bit `1 << d` = candidate `d`) as a naked or a
 * hidden (row or column) single — the row/column specialization of
 * {@link classifyPlacementInRegions}, and it throws where that does.
 */
export function classifyPlacement(
  grid: ArrayLike<number>,
  pencil: ArrayLike<number>,
  x: number,
  y: number,
  n: number,
  w: number,
  enc?: NoteEncoding,
): SinglePlacement {
  const c = classifyPlacementInRegions(
    grid,
    pencil,
    y * w + x,
    n,
    rowColRegions(x, y, w),
    enc,
  );
  if (c.kind === "hidden")
    return { kind: "hidden", line: c.region.line, index: c.region.index };
  return c;
}

/** The reason a forced single placement carries — shared across the Latin family
 * (every game's `HintReason` union includes these two `kind`s: `single` from the
 * generic `LatinReason`, plus the game-local `hiddenSingle`). */
export type SingleReason =
  | { kind: "single" }
  | { kind: "hiddenSingle"; n: number; line: "row" | "col"; index: number };

/** Re-derive *why* a generic-`single` placement is forced, from the working board:
 * a naked single (the cell's candidates collapsed to one) or a hidden single (the
 * digit fits only one cell of a row/column). The recording solver records both
 * under one `single` reason; this tells them apart so the narration is truthful. */
export function singlePlacementReason(
  grid: ArrayLike<number>,
  pencil: ArrayLike<number>,
  x: number,
  y: number,
  n: number,
  w: number,
  enc?: NoteEncoding,
): SingleReason {
  const c = classifyPlacement(grid, pencil, x, y, n, w, enc);
  switch (c.kind) {
    case "naked":
      return { kind: "single" };
    case "hidden":
      return { kind: "hiddenSingle", n, line: c.line, index: c.index };
  }
}

/** The {@link SingleReason} a row/column single of `n` narrates as. */
export function singleReasonOf(
  n: number,
  why: { kind: "naked" } | { kind: "hidden"; region: RowColRegion },
): SingleReason {
  return why.kind === "naked"
    ? { kind: "single" }
    : { kind: "hiddenSingle", n, line: why.region.line, index: why.region.index };
}

/** A hidden single as {@link singleReasonOf} states it. */
export type HiddenSingleReason = Extract<SingleReason, { kind: "hiddenSingle" }>;

/** Read a hidden single back off a game's own reason union, or `null` for any
 * other reason — what a *shared* consumer needs to act on the reason
 * {@link singleReasonOf} made without knowing the game's wider union. Sound for
 * the row/column family because a reason union that can hold a
 * {@link SingleReason} at all holds this arm with these fields; a game whose
 * `hiddenSingle` says something else (Solo names a block or a diagonal, not a
 * line) cannot take that reason in the first place. */
export function hiddenSingleOf(reason: unknown): HiddenSingleReason | null {
  const r = reason as { kind?: string };
  return r.kind === "hiddenSingle" ? (r as HiddenSingleReason) : null;
}

/** The cells of a hidden single's line — the whole row (`line: "row"`, `index` =
 * its y) or column (`line: "col"`, `index` = its x) — to shade as evidence. */
export function hiddenSingleLine(
  line: "row" | "col",
  index: number,
  w: number,
): Point[] {
  const cells: Point[] = [];
  if (line === "row") for (let k = 0; k < w; k++) cells.push({ x: k, y: index });
  else for (let k = 0; k < w; k++) cells.push({ x: index, y: k });
  return cells;
}

/** The generic Latin reasons whose narration is shared verbatim by the *row/column*
 * games (Keen, Unequal): a {@link SingleReason} (naked or hidden single)
 * plus the generic `dup` / `set` / `forcing` eliminations from `LatinReason`. The
 * `dup` reason may carry extra fields (`px`/`py`) — only `n` is read here. */
export type GenericLatinReason =
  | SingleReason
  | { kind: "dup"; n: number }
  | { kind: "set" }
  | { kind: "forcing"; chain: readonly ForcingLink[]; shares: "row" | "col" };

/**
 * A forcing chain's cells as **ordered** evidence, so the board shows which
 * consequence fell when and the narration can cite them by number. Shaded like
 * any other evidence area; the ordinal is what makes the shading a chain rather
 * than a heap.
 *
 * Shared by every game whose forcing reason comes from `latin.ts`, so the
 * numbering can never disagree with the sentence between games.
 */
export function forcingChainArea(reason: {
  chain: readonly ForcingLink[];
}): OrderedCell[] {
  return reason.chain.map((c, i) => ({ x: c.x, y: c.y, order: i + 1 }));
}

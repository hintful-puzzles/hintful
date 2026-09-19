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

import type { NoteEncoding } from "./candidate-hint.ts";
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

/** A region the {@link classifyPlacementInRegions} classifier reasons over: its
 * member cell indices (`y * w + x`). A game tags each region with whatever it
 * needs to name it (a `line`/`index` for a row/column, a `kind` for a sub-block
 * or diagonal) and reads that tag back off the returned `region`. */
export interface ClassifyRegion {
  cells: ArrayLike<number>;
}

/** Whether the forced placement of digit `n` at `cell` is a *naked* single (the
 * cell's notes are exactly `{n}`) or a *hidden* single in one of `regions` (no
 * other empty cell of that region still notes `n`). The generic core of
 * docs/games/hints.md § "Re-derive a placement's why" for any
 * candidate-elimination game: the Latin row/column games pass `[row, column]`;
 * Solo passes `[row, column, block, diag0, diag1]`. Regions are tested in order,
 * so the first match wins (callers list them in narration preference order).
 *
 * **Throws when it is neither**: the notes then still show candidates the solver
 * has ruled out, so the plan skipped a strike the placement rests on. Every
 * plan that classifies a placement passes here, which is what makes the
 * cross-game hint walks (`hint-resume.test.ts`, `hint-quality.test.ts`) the
 * guard for it. */
export function classifyPlacementInRegions<R extends ClassifyRegion>(
  grid: ArrayLike<number>,
  pencil: ArrayLike<number>,
  cell: number,
  n: number,
  regions: readonly R[],
  enc?: NoteEncoding,
): { kind: "naked" } | { kind: "hidden"; region: R } {
  const bit = (enc?.bit ?? ((v: number): number => 1 << v))(n);
  if (pencil[cell] === bit) return { kind: "naked" };
  for (const region of regions) {
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
  throw new Error(
    `hint plan: placing ${n} at cell ${cell} is neither a naked nor a hidden single ` +
      "in the notes, so the plan skipped a strike it rests on",
  );
}

/** A row/column region tagged for narration: the cells of the line plus whether it
 * is a `row` (`index` = its y) or `col` (`index` = its x). */
export interface RowColRegion {
  cells: number[];
  line: "row" | "col";
  index: number;
}

/** The two uniqueness regions of cell `(x, y)` in a plain Latin square: its row
 * and its column, in narration-preference order (row first). The `regionsOf`
 * provider for Towers / Unequal / Keen — those games' *only* uniqueness regions (a
 * Keen cage is an arithmetic constraint, not a uniqueness region). The single
 * source of truth shared by the placement classifier, the basic-region strike and
 * the placement dup-cull, so they can never disagree about a cell's regions. */
export function rowColRegions(x: number, y: number, w: number): RowColRegion[] {
  const row: number[] = [];
  const col: number[] = [];
  for (let k = 0; k < w; k++) {
    row.push(y * w + k);
    col.push(k * w + x);
  }
  return [
    { cells: row, line: "row", index: y },
    { cells: col, line: "col", index: x },
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

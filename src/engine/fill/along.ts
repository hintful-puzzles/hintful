/**
 * Typing along a list's sites (`play.along`, Crossing's runs): each binding
 * of `deal.records` the list is read off gives a site, the ordered cells its
 * record's members are read along (the compiled `recordSites`). A value typed
 * moves the selection to the next cell of the site it is filling, which way
 * the selection goes, a row's or a column's, being remembered; and a record
 * of the list is written whole into a site it still fits, picked up from the
 * list and dropped there, or pressed while a cell of the site is selected.
 *
 * Whether a record fits is read off the player's values alone, never their
 * notes or the answer: the aid takes the copying off the player, and leaves
 * the deduction of which record goes where to them.
 */

import { UI_UPDATE, type UiUpdate } from "../contract/game.ts";
import { CURSOR_DOWN, CURSOR_UP } from "../input/pointer.ts";
import { type FillBoard, type FillModule, spaceOf } from "./board.ts";
import type { Edit } from "./edit.ts";
import type { FillUi } from "./play.ts";
import { listRecords } from "./record-list.ts";

/** The way a site runs, and the selection goes along one. */
export type Way = "row" | "column";

/** A site: its cells in the order its record's members are read, and the
 * way it runs. */
export interface Site {
  readonly cells: Int32Array;
  readonly way: Way;
}

/** A board's sites, and by cell the index of the site through it each way,
 * `-1` where none runs through it that way. */
export interface Sites {
  readonly all: readonly Site[];
  readonly row: Int32Array;
  readonly column: Int32Array;
}

/** No record held (`FillUi.held`). */
export const NONE_HELD = -1;

// A board's sites are its clues', and one board is played move after move.
const sitesBy = new WeakMap<object, Sites>();

/** The sites of board `b`. */
export function sitesOf<C>(module: FillModule<C>, b: FillBoard<C>): Sites {
  const key = b.dealt as object;
  const got = sitesBy.get(key);
  if (got !== undefined) return got;
  const { recordSites } = module;
  if (recordSites === undefined) throw new Error("play along: no recordSites");
  const row = new Int32Array(b.w * b.h).fill(-1);
  const column = new Int32Array(b.w * b.h).fill(-1);
  const all = recordSites(spaceOf(module, b), b.dealt).map((cells, i): Site => {
    const first = cells[0] ?? 0;
    const last = cells[cells.length - 1] ?? 0;
    const way: Way =
      Math.floor(first / b.w) === Math.floor(last / b.w) ? "row" : "column";
    const by = way === "row" ? row : column;
    for (const c of cells) if (by[c] < 0) by[c] = i;
    return { cells, way };
  });
  const sites = { all, row, column };
  sitesBy.set(key, sites);
  return sites;
}

/** The index of the site through cell `c` going `way`, `-1` where none
 * does. */
export const siteThrough = (s: Sites, c: number, way: Way): number =>
  (way === "row" ? s.row : s.column)[c];

/** Whether two sites cross at cell `c`, one each way. */
const crossesAt = (s: Sites, c: number): boolean => s.row[c] >= 0 && s.column[c] >= 0;

/** The way the selection goes at cell `c`: that of the one site through it
 * where only one runs through it, else `way`. */
function snapWay(s: Sites, c: number, way: Way): Way {
  const row = s.row[c] >= 0;
  return row === s.column[c] >= 0 ? way : row ? "row" : "column";
}

/** The way an arrow key moves along: up and down a column's. */
export const arrowWay = (button: number): Way =>
  button === CURSOR_UP || button === CURSOR_DOWN ? "column" : "row";

/** The cell after `c` along the site through it going `way`, `null` at the
 * site's end or where none runs through it that way. */
function nextAlong(s: Sites, c: number, way: Way): number | null {
  const at = siteThrough(s, c, way);
  if (at < 0) return null;
  const { cells } = s.all[at];
  const k = cells.indexOf(c);
  return k < 0 || k + 1 >= cells.length ? null : cells[k + 1];
}

/** Whether site `site` reads `record` on the values `g`. */
const readsAlong = (
  g: ArrayLike<number>,
  site: Site,
  record: ArrayLike<number>,
): boolean =>
  site.cells.length === record.length && site.cells.every((c, k) => g[c] === record[k]);

/** By record, the first site that reads it on the values of `b`, `-1`
 * where none does. */
export function readSites<C>(
  b: FillBoard<C>,
  s: Sites,
  records: readonly ArrayLike<number>[],
): Int32Array {
  return Int32Array.from(records, (r) =>
    s.all.findIndex((site) => readsAlong(b.values, site, r)),
  );
}

/**
 * Whether record `k` fits site `at` on board `b`: as long as it, agreeing
 * with every value placed there, and read along no other site (`read`, by
 * record, `readSites`'s).
 */
export function fitsAlong<C>(
  b: FillBoard<C>,
  s: Sites,
  records: readonly ArrayLike<number>[],
  read: Int32Array,
  at: number,
  k: number,
): boolean {
  if (read[k] >= 0 && read[k] !== at) return false;
  const { cells } = s.all[at];
  const record = records[k];
  return (
    cells.length === record.length &&
    cells.every((c, i) => b.values[c] === 0 || b.values[c] === record[i])
  );
}

/**
 * The site through cell `c` that record `k` goes in, `-1` where neither
 * takes it. Where both do, the one the board already holds the more values
 * of: a site with none takes every record of its length, so it says nothing
 * of which the player meant; a tie goes `way`.
 */
function siteFor<C>(
  b: FillBoard<C>,
  s: Sites,
  records: readonly ArrayLike<number>[],
  read: Int32Array,
  c: number,
  k: number,
  way: Way,
): number {
  const near = siteThrough(s, c, way);
  const far = siteThrough(s, c, way === "row" ? "column" : "row");
  const takes = (at: number) => at >= 0 && fitsAlong(b, s, records, read, at, k);
  if (!takes(near)) return takes(far) ? far : -1;
  if (!takes(far)) return near;
  const placed = (at: number) =>
    s.all[at].cells.filter((x) => b.values[x] !== 0).length;
  return placed(far) > placed(near) ? far : near;
}

/** The edit writing `record` along site `site` of board `b`, `null` where
 * the site holds it already. */
function writeAlong<C>(
  b: FillBoard<C>,
  site: Site,
  record: ArrayLike<number>,
): Edit | null {
  const set: number[] = [];
  site.cells.forEach((c, i) => {
    if (b.values[c] !== record[i]) set.push(c, record[i]);
  });
  return set.length === 0 ? null : { set };
}

/** Typing along a board's sites: what the board of numbers' input asks of
 * them, on boards of `module` with the list `kind`. */
export interface AlongInput<C> {
  /** A left press on open cell `c`: a held record dropped into a site
   * through it that takes it, the cell left selected; or, on the cell
   * already selected for typing where two sites cross, the way turned.
   * `null` where the press is the note-taking cell's, a held record put
   * down first. */
  press(
    b: FillBoard<C>,
    ui: FillUi,
    c: number,
    repeat: boolean,
  ): Edit | UiUpdate | null;
  /** The way snapped to the site through cell `c` the selection moved to,
   * going `way`. */
  snap(b: FillBoard<C>, ui: FillUi, c: number, way?: Way): void;
  /** Where a value typed into cell `c` moves the selection, `null` where it
   * stays. */
  next(b: FillBoard<C>, ui: FillUi, c: number): number | null;
  /** Record `k` pressed on the list: written into a site through the cell
   * selected for typing that takes it, or else picked up, or put down where
   * it was held. */
  take(b: FillBoard<C>, ui: FillUi, k: number): Edit | UiUpdate;
}

export function alongInput<C>(module: FillModule<C>, kind: string): AlongInput<C> {
  const recordsOf = (b: FillBoard<C>) => listRecords(b, kind);
  /** The edit dropping record `k` into the site through cell `c` that takes
   * it, `null` where none does or the site holds it already. */
  const drop = (b: FillBoard<C>, ui: FillUi, c: number, k: number): Edit | null => {
    const s = sitesOf(module, b);
    const records = recordsOf(b);
    const at = siteFor(b, s, records, readSites(b, s, records), c, k, ui.way ?? "row");
    return at < 0 ? null : writeAlong(b, s.all[at], records[k]);
  };
  return {
    press(b, ui, c, repeat) {
      const held = ui.held ?? NONE_HELD;
      if (held !== NONE_HELD) {
        ui.held = NONE_HELD;
        const edit = drop(b, ui, c, held);
        if (edit !== null) {
          // Typing carries on from where the record landed.
          ui.cursor.x = c % b.w;
          ui.cursor.y = Math.floor(c / b.w);
          ui.cursor.visible = true;
          ui.cursorFromKeyboard = false;
          return edit;
        }
      }
      if (repeat && ui.pencilMode !== true && crossesAt(sitesOf(module, b), c)) {
        ui.way = ui.way === "column" ? "row" : "column";
        ui.cursorFromKeyboard = false;
        return UI_UPDATE;
      }
      return null;
    },
    snap(b, ui, c, way = ui.way ?? "row") {
      ui.way = snapWay(sitesOf(module, b), c, way);
    },
    next(b, ui, c) {
      if (ui.advance === false || ui.pencilMode === true) return null;
      return nextAlong(sitesOf(module, b), c, ui.way ?? "row");
    },
    take(b, ui, k) {
      const { cursor } = ui;
      if (cursor.visible && ui.pencilMode !== true) {
        const edit = drop(b, ui, cursor.y * b.w + cursor.x, k);
        if (edit !== null) {
          ui.held = NONE_HELD;
          return edit;
        }
      }
      ui.held = ui.held === k ? NONE_HELD : k;
      return UI_UPDATE;
    },
  };
}

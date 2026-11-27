/**
 * The candidate notes of a board of numbers (`play.notes`): a set of values
 * an open cell, bit `v` for value `v`, written by the shared canonical
 * {@link CandidateMove}s (`engine/hint/candidate-hint.ts`), so Mark-all,
 * auto-pencil, the mistake check's note half and the candidate hint's
 * bookkeeping read a born board as they read a hand-written one
 * (`docs/hints-candidates.md` § "Persist, populate, and the moves").
 */

import {
  adaptiveMarkAll,
  anyEmptyLacksNotes,
  type CandidateMove,
  type Mark,
  type NoteEncoding,
  obviousCandidateMarks,
  type Reach,
  applyNoteMove as writeNotes,
} from "../hint/candidate-hint.ts";
import { CellMarks } from "../solve/cell-marks.ts";
import {
  type FillBoard,
  type FillModule,
  type LadderedFillModule,
  ladderOf,
  spaceOf,
} from "./board.ts";
import { applyDone, type DoneMove, isDoneShaped } from "./done.ts";
import { applyEdit, type Edit, editOf } from "./edit.ts";

/** A value typed into several cells of a selection at once (`select.ts`),
 * each of them open: `autoElim` as a typed cell's. */
export interface SetCellsMove {
  readonly type: "setCells";
  readonly cells: readonly number[];
  readonly n: number;
  readonly autoElim?: boolean;
}

/** A fill game's move: an edit, on a board of numbers a typed entry, one
 * typed into a selection, or a note move, or a clue marked done. Solve,
 * Clear and Reveal stay edits. */
export type FillMove = Edit | CandidateMove | SetCellsMove | DoneMove;

/** Whether `move` is one of the note-taking cell's. */
export const isCandidateMove = (move: FillMove): move is CandidateMove =>
  "type" in move && move.type !== "done" && move.type !== "setCells";

/** Whether `move` has a typed selection's shape, as a save holds it. */
function isSetCells(move: unknown): move is SetCellsMove {
  if (typeof move !== "object" || move === null) return false;
  const m = move as Partial<Record<keyof SetCellsMove, unknown>>;
  return (
    m.type === "setCells" &&
    Array.isArray(m.cells) &&
    m.cells.every((c) => Number.isInteger(c)) &&
    Number.isInteger(m.n) &&
    (m.autoElim === undefined || typeof m.autoElim === "boolean")
  );
}

/** Whether `marks` is a list of notes, as a save holds it. */
const areMarks = (marks: unknown): boolean =>
  Array.isArray(marks) &&
  marks.every(
    (k) =>
      typeof k === "object" &&
      k !== null &&
      ["x", "y", "n"].every((f) => Number.isInteger((k as Record<string, unknown>)[f])),
  );

/** Whether `move` has a note-taking cell's move's shape, as a save holds it. */
function isCandidate(move: unknown): move is CandidateMove {
  if (typeof move !== "object" || move === null || !("type" in move)) return false;
  const m = move as {
    readonly type: unknown;
    readonly x?: unknown;
    readonly y?: unknown;
    readonly n?: unknown;
    readonly pencil?: unknown;
    readonly autoElim?: unknown;
    readonly marks?: unknown;
  };
  switch (m.type) {
    case "set":
      return (
        [m.x, m.y, m.n].every((f) => Number.isInteger(f)) &&
        typeof m.pencil === "boolean" &&
        (m.autoElim === undefined || typeof m.autoElim === "boolean")
      );
    case "pencilAll":
      return true;
    case "pencilStrike":
    case "pencilAdd":
      return areMarks(m.marks);
    default:
      return false;
  }
}

/** `move` as a fill game's move, or refused as `context`'s: a move from a
 * save is read back as whatever it was written as. */
export function fillMoveOf(move: unknown, context: string): FillMove {
  if (isDoneShaped(move) || isSetCells(move)) return move;
  return isCandidate(move) ? move : editOf(move, context);
}

/** The board after `move`. */
export const applyMove = <C>(
  module: LadderedFillModule<C>,
  board: FillBoard<C>,
  move: FillMove,
): FillBoard<C> =>
  !("type" in move)
    ? applyEdit(module, board, move)
    : move.type === "done"
      ? applyDone(board, move)
      : move.type === "setCells"
        ? applySetCells(module, board, move)
        : applyNoteMove(module, board, move);

/** The board after a value typed into a selection: each cell takes it as a
 * typed cell does (`applyNoteMove`), what each reaches read on the board
 * before any of them. */
function applySetCells<C>(
  module: LadderedFillModule<C>,
  board: FillBoard<C>,
  { cells, n, autoElim }: SetCellsMove,
): FillBoard<C> {
  const placed = applyEdit(module, board, { set: cells.flatMap((c) => [c, n]) });
  if (placed.pencil === null) return placed;
  const pencil = placed.pencil.slice();
  for (const c of cells) pencil[c] = 0;
  if (autoElim === true && n > 0) {
    const reach = reachOf(module, board);
    for (const c of cells)
      for (const p of Array.from(reach(c, n))) pencil[p] &= ~(1 << n);
  }
  return { ...placed, pencil };
}

/** What a fill-all writes on a board of `module`'s: each open cell's domain,
 * its values' bits. */
function encodingOf<C>(
  module: FillModule<C>,
  board: FillBoard<C>,
): Required<Pick<NoteEncoding, "values" | "all">> {
  const sp = spaceOf(module, board);
  let top = 0;
  for (const c of sp.cells) top |= module.domainOf(sp, board.dealt, c);
  return {
    values: 31 - Math.clz32(top),
    all: (c) => module.domainOf(sp, board.dealt, c),
  };
}

/** The cells a value placed at `c` rules out of their notes: those sharing a
 * unit with it, which no value repeats in, and those the techniques run on
 * placing strike it from where every cell could hold anything (a `zoning`
 * area and its neighbors). A value a unit holds more than once (Salad's
 * empty square) is struck from the rest of a unit only once the unit holds
 * every copy, the copies `values` holds counted: the board's, or the
 * working grid of a walk that places them as it goes. The one reach
 * auto-pencil, Mark-all's clean and the candidate walk (`candidates.ts`)
 * read; asked once a cell and value, but for that value. */
export function reachOf<C>(
  module: LadderedFillModule<C>,
  board: FillBoard<C>,
  values: ArrayLike<number> = board.values,
): Reach {
  const sp = spaceOf(module, board);
  const { placing } = ladderOf(module, board);
  const repeat = module.repeatOf?.(sp, board.dealt) ?? null;
  const reached = new Map<number, readonly number[]>();
  return (c, n) => {
    const repeats = n === repeat?.value;
    const key = c * 32 + n;
    const known = repeats ? undefined : reached.get(key);
    if (known !== undefined) return known;
    const grid = new Uint8Array(values.length);
    if (repeats) for (const p of sp.cells) if (values[p] === n) grid[p] = n;
    grid[c] = n;
    const m = new CellMarks(sp, ~0, grid, repeat);
    m.cands.fill(~0);
    for (const p of sp.cells) if (grid[p] !== 0) m.cands[p] = 1 << n;
    for (const run of placing) run(m, c);
    const out = new Set(repeats ? [] : sp.peers[c]);
    for (const p of sp.cells) if (p !== c && ((m.cands[p] >> n) & 1) === 0) out.add(p);
    // The peers in the space's order, as a hint's marks list them.
    const cells = [...out];
    reached.set(key, cells);
    return cells;
  };
}

/**
 * The board after the note-taking cell's move `move`: a note toggled on an
 * open cell, a value typed (its cell's notes cleared and, with `autoElim`,
 * the value struck from the notes it rules out), or a note move. A move the
 * engine builds never touches a fixed cell or a board without notes, so one
 * that does throws.
 */
function applyNoteMove<C>(
  module: LadderedFillModule<C>,
  board: FillBoard<C>,
  move: CandidateMove,
): FillBoard<C> {
  const notes = board.pencil;
  if (move.type === "set") {
    const c = move.y * board.w + move.x;
    if (!move.pencil || move.n === 0) {
      // A placement is an edit, which clears its cell's notes; an empty
      // value clears them too.
      const placed = applyEdit(module, board, { set: [c, move.n] });
      if (placed.pencil === null) return placed;
      const pencil = placed.pencil.slice();
      pencil[c] = 0;
      if (move.autoElim === true && move.n > 0)
        for (const p of Array.from(reachOf(module, board)(c, move.n)))
          pencil[p] &= ~(1 << move.n);
      return { ...placed, pencil };
    }
    if (notes === null) throw new Error("note: the board keeps no notes");
    if (board.fixed[c] || board.values[c] !== 0)
      throw new Error(`note: cell ${c} is not open`);
    const pencil = notes.slice();
    pencil[c] ^= 1 << move.n;
    return { ...board, pencil };
  }
  if (notes === null) throw new Error("note: the board keeps no notes");
  const pencil = notes.slice();
  writeNotes(move, board.values, pencil, board.w, encodingOf(module, board));
  return { ...board, pencil };
}

/** Mark-all: every open cell's candidates where one has no notes yet, and
 * otherwise each note a placed value rules out (`adaptiveMarkAll`). `null`
 * where there is nothing to do, or the board keeps no notes. */
export function markAll<C>(
  module: LadderedFillModule<C>,
  board: FillBoard<C>,
): CandidateMove | null {
  const notes = board.pencil;
  if (notes === null) return null;
  return adaptiveMarkAll<CandidateMove, Mark>(
    anyEmptyLacksNotes(board.values, notes),
    () =>
      obviousCandidateMarks(
        board.values,
        notes,
        board.w,
        reachOf(module, board),
        encodingOf(module, board),
      ),
  );
}

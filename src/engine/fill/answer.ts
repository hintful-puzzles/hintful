/**
 * What a fill game's board is judged by: the answer the clues alone reach,
 * the rules, and the hooks that compare the player's board with them. Built
 * once here from the board and the compiled module, so no game writes its
 * own (`openspec/changes/a-game-from-its-description-alone`).
 */

import { boxedGridText } from "../board/grid-text.ts";
import type { SolveResult } from "../contract/game.ts";
import { PUZZLE_NOT_REASONABLE } from "../contract/hint-refusal.ts";
import type { RulesOf } from "../contract/rules.ts";
import { NO_SOLUTION } from "../contract/solve-failure.ts";
import type { GameStatus } from "../contract/types.ts";
import { entryMistake } from "../hint/entry-mistakes.ts";
import { type Answer, answerCache, solveFromAnswer } from "../solve/answer-search.ts";
import {
  clueAt,
  type ListClues,
  listAt,
  type Partition,
} from "../solve/describe-runtime.ts";
import { describedRules } from "../solve/described-rules.ts";
import {
  asDealt,
  type Clues,
  type FillBoard,
  type FillModule,
  isAnswerOf,
  listOf,
  solveBoard,
  spaceOf,
  washedValues,
} from "./board.ts";
import { cornerClueAt, signedText } from "./corners.ts";
import type { Edit } from "./edit.ts";
import type { FillMove } from "./notes.ts";
import { answerSearched, type SearchedFillModule, searches } from "./search.ts";
import { slotClueAt } from "./slots.ts";

/** A cell the player's board holds against the answer: its value, the mark
 * on it, or its notes, which leave the answer out. */
export interface FillMistake {
  readonly cell: number;
  readonly kind: "value" | "mark" | "note";
}

/** What the answer is judged with that the compiled module does not say. */
export interface AnswerReading<C> {
  /** The value an open cell is read as for the answer check, where the
   * answer is the other values alone (Tents' grass); `null` where every
   * cell must be filled. */
  readonly blank: number | null;
  /** How each value prints in the text format, three characters. */
  readonly glyphs: Readonly<Record<number, string>>;
  /** The clue kinds that sit at lines, printed past each line's end. */
  readonly lineClues: readonly (keyof C)[];
  /** The list kinds at lines: a column's printed stacked above it, and a
   * row's after it. */
  readonly lineLists?: readonly (keyof C)[];
  /** The clue kinds at slots, printed in a rim round the grid. */
  readonly slotClues?: readonly (keyof C)[];
  /** The clue kinds written as numbers on their cells, printed there in
   * place of the cell's value. */
  readonly numbers?: readonly (keyof C)[];
  /** Where the board has gaps between its cells (`play.gaps`), the clue in
   * the one between cells `a` and `z` as one character, a space for none:
   * printed in place of the wall between them. */
  readonly gap?: (board: FillBoard<C>, a: number, z: number) => string;
  /** The dealt partition, printed as walls between its parts. */
  readonly partition?: keyof C;
  /** The clue kinds at the partition's parts, each printed after the row
   * of its part's first cell as its number and its sign (`play.signs`). */
  readonly partClues?: {
    readonly kinds: readonly (keyof C & string)[];
    readonly signs: Readonly<Record<string, string | readonly string[]>>;
  };
  /** The clue kinds at corners, each printed after the wall line its corner
   * lies on as its text (`signedText`), `.` at a corner without one, with
   * each kind's least and most value. */
  readonly cornerClues?: {
    readonly kinds: readonly (keyof C & string)[];
    readonly signs: Readonly<Record<string, string | readonly string[]>>;
    readonly range: (
      kind: keyof C & string,
      b: FillBoard<C>,
    ) => readonly [number, number];
  };
}

/** The board's one answer: where the game searches, the search's; in any
 * other, the one the clues alone reach at the top tier. `null` where there
 * is none to compare with. */
export function answerOf<C>(
  module: SearchedFillModule<C>,
  board: FillBoard<C>,
): Uint8Array | null {
  if (searches(module)) {
    const found = answerSearched(module, board);
    return found.kind === "one" ? found.solution : null;
  }
  const found = reached(board.dealt as object, (): Answer<Uint8Array> => {
    const got = solveBoard(module, asDealt(board), module.tiers.length - 1);
    return got.verdict === "solved"
      ? { kind: "one", solution: got.values }
      : { kind: "none" };
  });
  return found.kind === "one" ? found.solution : null;
}

/** The answer the ladder reaches, keyed on a board's clues, which every state
 * of one game shares: the mistake check asks after every move. */
const reached = answerCache<object, Uint8Array>();

/** The answer a deal's `aux` holds: a base-36 digit a cell. */
export const encodeAnswer = (values: ArrayLike<number>): string =>
  Array.from(values, (v) => v.toString(36)).join("");

function decodeAnswer(aux: string, n: number): Uint8Array | null {
  if (aux.length !== n || !/^[0-9a-z]*$/.test(aux)) return null;
  return Uint8Array.from(aux, (ch) => Number.parseInt(ch, 36));
}

/** The values the answer check reads: an open cell as `blank`, where the
 * reading has one. */
function checked<C>(reading: AnswerReading<C>, board: FillBoard<C>): Uint8Array {
  const { blank } = reading;
  return blank === null
    ? board.values
    : Uint8Array.from(board.values, (v) => (v === 0 ? blank : v));
}

export function status<C>(
  module: FillModule<C>,
  reading: AnswerReading<C>,
  board: FillBoard<C>,
): GameStatus {
  const g = checked(reading, board);
  if (reading.blank === null && g.includes(0)) return "ongoing";
  return isAnswerOf(module, board, g) ? "solved" : "ongoing";
}

/** The edit that fills every cell with the answer and clears every mark. A
 * cell the answer washes and leaves blank is left open, or as the player
 * marked it: the wash already says it. */
function fillWith<C>(
  module: FillModule<C>,
  board: FillBoard<C>,
  answer: Uint8Array,
): Edit {
  const set: number[] = [];
  const mark: number[] = [];
  const { washed, play } = module;
  const sp = spaceOf(module, board);
  for (let c = 0; c < answer.length; c++) {
    const shown =
      washed !== undefined &&
      answer[c] === play?.blank &&
      washed(answer, sp, board.dealt, c);
    const want = shown && board.values[c] !== answer[c] ? 0 : answer[c];
    if (!board.fixed[c] && board.values[c] !== want) set.push(c, want);
    if (board.mark[c] >= 0) mark.push(c, -1);
  }
  return { set, mark };
}

export function solve<C>(
  module: SearchedFillModule<C>,
  orig: FillBoard<C>,
  curr: FillBoard<C>,
  aux?: string,
): SolveResult<Edit> {
  const given = aux === undefined ? null : decodeAnswer(aux, orig.values.length);
  if (given !== null) return { ok: true, move: fillWith(module, curr, given) };
  if (searches(module))
    return solveFromAnswer(answerSearched(module, orig), (a) =>
      fillWith(module, curr, a),
    );
  const got = solveBoard(module, asDealt(orig), module.tiers.length - 1);
  if (got.verdict !== "solved")
    return {
      ok: false,
      error: got.verdict === "impossible" ? NO_SOLUTION : PUZZLE_NOT_REASONABLE,
    };
  return { ok: true, move: fillWith(module, curr, got.values) };
}

/**
 * The cells whose value is not the answer's, an open one never among them,
 * and, where the module checks marks, each mark that no answer keeps with
 * the marks before it that passed: judged one at a time, two marks that
 * exclude each other would both pass. None on a board the ladder cannot
 * finish, which has no answer to compare with.
 */
export function findMistakes<C>(
  module: SearchedFillModule<C>,
  board: FillBoard<C>,
): readonly FillMistake[] {
  const answer = answerOf(module, board);
  if (answer === null) return [];
  const out: FillMistake[] = [];
  for (let c = 0; c < answer.length; c++)
    if (board.values[c] !== 0 && board.values[c] !== answer[c])
      out.push({ cell: c, kind: "value" });
  const { marksHold } = module;
  if (marksHold === undefined) return [...out, ...noteMistakes(board, answer)];
  const sp = spaceOf(module, board);
  const kept = new Int32Array(board.mark.length).fill(-1);
  for (let c = 0; c < kept.length; c++) {
    if (board.mark[c] < 0) continue;
    kept[c] = board.mark[c];
    if (!marksHold(answer, sp, board.dealt, kept)) {
      kept[c] = -1;
      out.push({ cell: c, kind: "mark" });
    }
  }
  return [...out, ...noteMistakes(board, answer)];
}

/** Each open cell whose notes leave out its answer: a note set the hint would
 * reason from falsely (`entryMistake`). */
function noteMistakes<C>(board: FillBoard<C>, answer: Uint8Array): FillMistake[] {
  const notes = board.pencil;
  if (notes === null) return [];
  const read = { answer, entry: board.values, notes };
  const out: FillMistake[] = [];
  for (let c = 0; c < answer.length; c++)
    if (!board.fixed[c] && entryMistake(read, c) === "note")
      out.push({ cell: c, kind: "note" });
  return out;
}

/** One edit, each mistaken mark cleared and each mistaken cell emptied, then
 * each cell whose notes leave out its answer cleared of them. */
export function clearMistakes<C>(
  board: FillBoard<C>,
  mistakes: readonly FillMistake[],
): readonly FillMove[] {
  const set: number[] = [];
  const mark: number[] = [];
  const notes: FillMove[] = [];
  for (const m of mistakes)
    if (m.kind === "value") set.push(m.cell, 0);
    else if (m.kind === "mark") mark.push(m.cell, -1);
    else
      notes.push({
        type: "set",
        x: m.cell % board.w,
        y: Math.floor(m.cell / board.w),
        n: 0,
        pencil: true,
      });
  return [...(set.length + mark.length > 0 ? [{ set, mark }] : []), ...notes];
}

/** The first cell in reading order whose value is not the solved board's,
 * given the solved board's value. */
export function revealOne<C>(board: FillBoard<C>, solved: FillBoard<C>): Edit | null {
  for (let c = 0; c < board.values.length; c++)
    if (!board.fixed[c] && board.values[c] !== solved.values[c])
      return { set: [c, solved.values[c]] };
  return null;
}

/** The rules, read on the board's values as they stand: an open cell is
 * undecided. */
export function rulesOf<C>(module: FillModule<C>): RulesOf<FillBoard<C>> {
  // The live checks read the values alone: a mark is judged against the
  // answer (`findMistakes`), never live. A washed cell holds the secondary
  // value, which a piece there would break.
  const { units, violations, isAnswer } = module;
  return describedRules(
    { units, violations, isAnswer },
    {
      grid: (b) => washedValues(module, b),
      size: (b) => [b.w, b.h],
      deals: (b) => [b.dealt, b.variations] as const,
    },
  );
}

/**
 * A box-drawn grid of each cell's glyph, `.` where it is open, with each
 * line clue in a box past the line's end: a row's on the right and a
 * column's below, and the box at their corner left open. A clue at a part
 * is printed after the row of the part's first cell, left to right, since a
 * clue such as `720×` is wider than a cell.
 */
export function textFormat<C extends Clues<C>>(
  reading: AnswerReading<C>,
  board: FillBoard<C>,
): string {
  const grid = withSlotClues(
    reading,
    board,
    withCornerClues(
      reading,
      board,
      withPartClues(reading, board, gridFormat(reading, board)),
    ),
  );
  const kinds = reading.lineLists ?? [];
  if (kinds.length === 0) return grid;
  const { w, h, dealt } = board;
  const listOfLine = (k: number): number[] => {
    for (const kind of kinds) {
      const l = listAt(dealt[kind] as ListClues, k);
      if (l !== null) return Array.from(l);
    }
    return [];
  };
  // Each column's numbers bottom-aligned over its cell, a cell's text being
  // three characters after a one-character wall.
  const columns = Array.from({ length: w }, (_, x) => listOfLine(h + x));
  const tall = Math.max(0, ...columns.map((l) => l.length));
  const above = Array.from({ length: tall }, (_, r) =>
    columns
      .map((l) => {
        const i = r - (tall - l.length);
        return i >= 0 ? String(l[i]).padStart(3).padEnd(4) : "    ";
      })
      .join("")
      .trimEnd(),
  );
  // The grid's lines alternate a wall and a row of cells.
  const lines = grid.split("\n").map((line, i) => {
    const row = i % 2 === 1 && (i - 1) / 2 < h ? listOfLine((i - 1) / 2) : [];
    return row.length === 0 ? line : `${line} ${row.join(" ")}`;
  });
  return [...above.map((l) => ` ${l}`), ...lines].join("\n");
}

/** `grid` in a rim of the clues at its slots: each column's above and below
 * the middle of its cell, and each row's before and after it, a clue's
 * place blank where it has none. */
function withSlotClues<C extends Clues<C>>(
  reading: AnswerReading<C>,
  board: FillBoard<C>,
  grid: string,
): string {
  const kinds = reading.slotClues ?? [];
  if (kinds.length === 0) return grid;
  const { w, h } = board;
  const clue = (s: number): string => {
    const at = slotClueAt(kinds, board, s);
    return at === null ? " " : String(at.v);
  };
  // A cell's text is three characters after a one-character wall, so a
  // column's middle is two past its wall, behind the rows' two-character
  // margin.
  const across = (first: number): string =>
    `  ${Array.from({ length: w }, (_, x) => `  ${clue(first + x)} `).join("")}`.trimEnd();
  // The grid's lines alternate a wall and a row of cells.
  const lines = grid
    .trimEnd()
    .split("\n")
    .map((line, i) =>
      i % 2 === 1 && (i - 1) / 2 < h
        ? `${clue(2 * w + (i - 1) / 2)} ${line} ${clue(2 * w + h + (i - 1) / 2)}`.trimEnd()
        : `  ${line}`,
    );
  return `${[across(0), ...lines, across(w)].join("\n")}\n`;
}

/** `grid` with each wall line inside it followed by the clues at the corners
 * on that line, left to right, `.` at one without a clue: a clue such as
 * `12+` is wider than the `+` it stands for. */
function withCornerClues<C extends Clues<C>>(
  reading: AnswerReading<C>,
  board: FillBoard<C>,
  grid: string,
): string {
  const { cornerClues } = reading;
  if (cornerClues === undefined) return grid;
  const { w, h } = board;
  const text = (k: number): string => {
    const at = cornerClueAt(cornerClues.kinds, board, k);
    if (at === null) return ".";
    const [least, most] = cornerClues.range(at.kind, board);
    return signedText(cornerClues.signs[at.kind] ?? null, at.v, least, most);
  };
  // The grid's lines alternate a wall and a row of cells; the corners lie on
  // the walls between two rows.
  return grid
    .split("\n")
    .map((line, i) => {
      const y = i / 2 - 1;
      if (i % 2 === 1 || y < 0 || y >= h - 1) return line;
      const row = Array.from({ length: w - 1 }, (_, x) => text(y * (w - 1) + x));
      return `${line} ${row.join(" ")}`;
    })
    .join("\n");
}

/** `grid` with each row's part clues after it: those whose part's first
 * cell is in the row, in the order of those cells. */
function withPartClues<C extends Clues<C>>(
  reading: AnswerReading<C>,
  board: FillBoard<C>,
  grid: string,
): string {
  const { partClues, partition } = reading;
  if (partClues === undefined || partition === undefined) return grid;
  const { w, dealt } = board;
  // A board a variation's partition is not dealt on (Solo's cages, Killer's
  // alone) has no part clue.
  const dealtParts = dealt[partition] as Partition | undefined;
  if (dealtParts === undefined) return grid;
  const { cells } = dealtParts;
  const byFirst = new Map<number, string>();
  for (const kind of partClues.kinds) {
    const list = listOf(dealt, kind);
    list.at.forEach((r, k) => {
      byFirst.set(
        cells[r][0],
        signedText(partClues.signs[kind] ?? null, list.v[k], 0, Infinity),
      );
    });
  }
  // The grid's lines alternate a wall and a row of cells.
  return grid
    .split("\n")
    .map((line, i) => {
      if (i % 2 === 0) return line;
      const y = (i - 1) / 2;
      const row = [...byFirst]
        .filter(([c]) => Math.floor(c / w) === y)
        .sort(([a], [b]) => a - b)
        .map(([, text]) => text);
      return row.length === 0 ? line : `${line} ${row.join(" ")}`;
    })
    .join("\n");
}

/** {@link textFormat}'s grid: each cell and each line clue. */
function gridFormat<C extends Clues<C>>(
  reading: AnswerReading<C>,
  board: FillBoard<C>,
): string {
  const { w, h, values, dealt } = board;
  const margin = reading.lineClues.length > 0 ? 1 : 0;
  const clue = (line: number): string => {
    for (const kind of reading.lineClues) {
      const v = clueAt(listOf(dealt, kind), line);
      if (v >= 0) return v >= 100 ? `${v}` : v >= 10 ? `${v} ` : ` ${v} `;
    }
    return "   ";
  };
  // A dealt partition's walls alone, where there is one: each cell's part,
  // `-1` off the grid, and a line only between two that differ.
  const parts =
    reading.partition === undefined
      ? null
      : ((dealt[reading.partition] as Partition | undefined)?.of ?? null);
  const part = (x: number, y: number): number =>
    x < 0 || y < 0 || x >= w || y >= h ? -1 : (parts?.[y * w + x] ?? 0);
  // Between two cells of a gapped board, its gap's clue in place of a wall.
  const { gap } = reading;
  const inside = (x: number, y: number): boolean => part(x, y) >= 0;
  const walled = (x: number, y: number, x2: number, y2: number): boolean =>
    gap !== undefined
      ? !inside(x, y) || !inside(x2, y2)
      : parts === null || part(x, y) !== part(x2, y2);
  const between = (x: number, y: number, x2: number, y2: number): string | null =>
    gap !== undefined && inside(x, y) && inside(x2, y2)
      ? gap(board, y * w + x, y2 * w + x2)
      : null;
  return boxedGridText(w + margin, h + margin, {
    corner: (x, y) =>
      margin && x === w + 1 && y === h + 1
        ? ""
        : walled(x - 1, y - 1, x, y - 1) ||
            walled(x - 1, y, x, y) ||
            walled(x - 1, y - 1, x - 1, y) ||
            walled(x, y - 1, x, y)
          ? "+"
          : " ",
    top: (x, y) => {
      if (margin && y === h + 1 && x === w) return "   ";
      const g = between(x, y - 1, x, y);
      if (g !== null) return ` ${g} `;
      return walled(x, y - 1, x, y) ? "---" : "   ";
    },
    left: (x, y) => {
      if (margin && x === w + 1 && y === h) return " ";
      return between(x - 1, y, x, y) ?? (walled(x - 1, y, x, y) ? "|" : " ");
    },
    cell: (x, y) => {
      if (x === w && y === h) return "   ";
      // A row's line is its index; a column's comes after the rows.
      if (x === w) return clue(y);
      if (y === h) return clue(h + x);
      // A number on a cell the player fills sits inside the glyph of what the
      // cell holds, where the glyph leaves its middle blank (Singles' `[3]`).
      for (const kind of reading.numbers ?? []) {
        const n = listOf(dealt, kind).valueAt[y * w + x];
        if (n < 0) continue;
        const g = reading.glyphs[values[y * w + x]];
        return g?.[1] === " " && n < 10 ? `${g[0]}${n}${g[2]}` : ` ${n} `;
      }
      const v = values[y * w + x];
      return v === 0 ? " . " : (reading.glyphs[v] ?? " ? ");
    },
  });
}

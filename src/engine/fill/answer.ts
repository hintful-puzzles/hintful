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
import { type ClueList, clueAt } from "../solve/describe-runtime.ts";
import { describedRules } from "../solve/described-rules.ts";
import {
  type FillBoard,
  type FillModule,
  isAnswerOf,
  type LadderedFillModule,
  solveBoard,
  spaceOf,
} from "./board.ts";
import type { Edit } from "./edit.ts";

/** A board's clues, by kind: a compiled module's `Dealt`. */
type Clues<C> = { readonly [K in keyof C]: ClueList };

/** A cell the player's board holds against the answer: its value, or the
 * mark on it. */
export interface FillMistake {
  readonly cell: number;
  readonly kind: "value" | "mark";
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
}

/** The board as dealt: its fixed cells alone, and no marks. */
export function asDealt<C>(board: FillBoard<C>): FillBoard<C> {
  return {
    ...board,
    values: Uint8Array.from(board.values, (v, c) => (board.fixed[c] ? v : 0)),
    mark: new Int32Array(board.mark.length).fill(-1),
  };
}

/** The answer the clues alone reach at the top tier, or `null` where the
 * ladder does not reach one. */
export function answerOf<C>(
  module: LadderedFillModule<C>,
  board: FillBoard<C>,
): Uint8Array | null {
  const got = solveBoard(module, asDealt(board), module.tiers.length - 1);
  return got.verdict === "solved" ? got.values : null;
}

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

/** The edit that fills every cell with the answer and clears every mark. */
function fillWith<C>(board: FillBoard<C>, answer: Uint8Array): Edit {
  const set: number[] = [];
  const mark: number[] = [];
  for (let c = 0; c < answer.length; c++) {
    if (!board.fixed[c] && board.values[c] !== answer[c]) set.push(c, answer[c]);
    if (board.mark[c] >= 0) mark.push(c, -1);
  }
  return { set, mark };
}

export function solve<C>(
  module: LadderedFillModule<C>,
  orig: FillBoard<C>,
  curr: FillBoard<C>,
  aux?: string,
): SolveResult<Edit> {
  const given = aux === undefined ? null : decodeAnswer(aux, orig.values.length);
  if (given !== null) return { ok: true, move: fillWith(curr, given) };
  const got = solveBoard(module, asDealt(orig), module.tiers.length - 1);
  if (got.verdict !== "solved")
    return {
      ok: false,
      error: got.verdict === "impossible" ? NO_SOLUTION : PUZZLE_NOT_REASONABLE,
    };
  return { ok: true, move: fillWith(curr, got.values) };
}

/**
 * The cells whose value is not the answer's, an open one never among them,
 * and, where the module checks marks, each mark that no answer keeps with
 * the marks before it that passed: judged one at a time, two marks that
 * exclude each other would both pass. None on a board the ladder cannot
 * finish, which has no answer to compare with.
 */
export function findMistakes<C>(
  module: LadderedFillModule<C>,
  board: FillBoard<C>,
): readonly FillMistake[] {
  const answer = answerOf(module, board);
  if (answer === null) return [];
  const out: FillMistake[] = [];
  for (let c = 0; c < answer.length; c++)
    if (board.values[c] !== 0 && board.values[c] !== answer[c])
      out.push({ cell: c, kind: "value" });
  const { marksHold } = module;
  if (marksHold === undefined) return out;
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
  return out;
}

/** One edit: each mistaken mark cleared, and each mistaken cell emptied. */
export function clearMistakes<C>(
  _board: FillBoard<C>,
  mistakes: readonly FillMistake[],
): readonly Edit[] {
  if (mistakes.length === 0) return [];
  const set: number[] = [];
  const mark: number[] = [];
  for (const m of mistakes)
    if (m.kind === "value") set.push(m.cell, 0);
    else mark.push(m.cell, -1);
  return [{ set, mark }];
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
  // answer (`findMistakes`), never live.
  const { units, violations, isAnswer } = module;
  return describedRules(
    { units, violations, isAnswer },
    {
      grid: (b) => b.values,
      size: (b) => [b.w, b.h],
      deals: (b) => [b.dealt, b.variations] as const,
    },
  );
}

/**
 * A box-drawn grid of each cell's glyph, `.` where it is open, with each
 * line clue in a box past the line's end: a row's on the right and a
 * column's below, and the box at their corner left open.
 */
export function textFormat<C extends Clues<C>>(
  reading: AnswerReading<C>,
  board: FillBoard<C>,
): string {
  const { w, h, values, dealt } = board;
  const margin = reading.lineClues.length > 0 ? 1 : 0;
  const clue = (line: number): string => {
    for (const kind of reading.lineClues) {
      const v = clueAt(dealt[kind], line);
      if (v >= 0) return v >= 100 ? `${v}` : v >= 10 ? `${v} ` : ` ${v} `;
    }
    return "   ";
  };
  return boxedGridText(w + margin, h + margin, {
    corner: (x, y) => (margin && x === w + 1 && y === h + 1 ? "" : "+"),
    top: (x, y) => (margin && y === h + 1 && x === w ? "   " : "---"),
    left: (x, y) => (margin && x === w + 1 && y === h ? " " : "|"),
    cell: (x, y) => {
      if (x === w && y === h) return "   ";
      // A row's line is its index; a column's comes after the rows.
      if (x === w) return clue(y);
      if (y === h) return clue(h + x);
      const v = values[y * w + x];
      return v === 0 ? " . " : (reading.glyphs[v] ?? " ? ");
    },
  });
}

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
import {
  EDGE_VALUE_PAINTERS,
  type EdgeValuePainter,
  type EdgeValuePainterName,
} from "../render/pieces/edge-value.ts";
import { type Answer, answerCache, solveFromAnswer } from "../solve/answer-search.ts";
import {
  clueAt,
  type GridSpace,
  type ListClues,
  listAt,
  type Partition,
  perPlace,
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
import type { CountRecord } from "./counts.ts";
import type { Edit } from "./edit.ts";
import { wrongFeatures } from "./features.ts";
import { BALL_GLYPH } from "./glyphs.ts";
import type { FillMove } from "./notes.ts";
import type { FillPlay } from "./play.ts";
import { answerSearched, type SearchedFillModule, searches } from "./search.ts";
import { slotClueAt } from "./slots.ts";
import { type MarginSides, marginClueAt } from "./value-margin.ts";

/** A cell the player's board holds against the answer: its value, the mark
 * on it, or its notes, which leave the answer out. */
export interface FillMistake {
  readonly cell: number;
  readonly kind: "value" | "mark" | "note";
  /** On a board of features, the slots of the cell its value or notes decide
   * against the answer, a bit a feature; absent where none does. */
  readonly slots?: number;
}

/** What the answer is judged with that the compiled module does not say. */
export interface AnswerReading<C> {
  /** The value an open cell is read as for the answer check, where the
   * answer is the other values alone (Tents' grass); `null` where every
   * cell must be filled. */
  readonly blank: number | null;
  /** How each value prints in the text format on a board, three
   * characters. */
  readonly glyphs: (board: FillBoard<C>) => Readonly<Record<number, string>>;
  /** The clue kinds whose number is one of the answer's values, printed as
   * its glyph. */
  readonly glyphClues?: readonly (keyof C)[];
  /** The clue kinds that sit at lines, printed past each line's end. */
  readonly lineClues: readonly (keyof C)[];
  /** The list kinds at lines: a column's printed stacked above it, and a
   * row's after it. */
  readonly lineLists?: readonly (keyof C)[];
  /** The clue kinds at slots, printed in a rim round the grid. */
  readonly slotClues?: readonly (keyof C)[];
  /** The records of the clue at the board drawn as counts (`play.counts`),
   * printed beneath the grid as the board draws them, each its value's
   * glyph and its count. */
  readonly counts?: (board: FillBoard<C>) => readonly CountRecord[];
  /** The records of the clue at the board drawn as a list (`play.list`),
   * printed beneath the grid a line a length, each its members' glyphs. */
  readonly list?: (board: FillBoard<C>) => readonly ArrayLike<number>[];
  /** The clue kinds `board`'s ruleset does not deal, which print no rim
   * (Salad's border on a Numbers board). */
  readonly off?: (board: FillBoard<C>) => ReadonlySet<string>;
  /** The clue kinds at lines one a value, printed before each line's start
   * or after its end a value a column, as a board's margin is laid. */
  readonly valueMargins?: {
    readonly kinds: readonly (keyof C)[];
    readonly sides: (board: FillBoard<C>) => MarginSides;
  };
  /** The clue kinds written as numbers on their cells, printed there in
   * place of the cell's value. */
  readonly numbers?: readonly (keyof C)[];
  /** The clue kind that is the empty square's ball (`play.numbers.empty`),
   * printed on an open cell as the ball's letter. */
  readonly ball?: keyof C;
  /** Where the board has gaps between its cells (`play.gaps`), the clue in
   * the one between cells `a` and `z` as one character, a space for none:
   * printed in place of the wall between them. */
  readonly gap?: (board: FillBoard<C>, a: number, z: number) => string;
  /** Each cell's part of the partition printed as walls between its parts
   * (`walledParts`), as the board draws it. */
  readonly walls?: (board: FillBoard<C>) => ArrayLike<number> | null;
  /** Where the answer's values sit on the edges, each value's text by its
   * painter, printed in place of the wall between the edge's two cells, and
   * the space the board's edges are numbered on. */
  readonly edges?: {
    readonly text: Readonly<Record<number, EdgeValuePainter>>;
    readonly space: (board: FillBoard<C>) => GridSpace;
  };
  /** The dealt partition whose parts hold the part clues. */
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

/** Each value an edge may hold, its text, by the edge painter its `paint`
 * names. */
export function edgeTextOf(play: FillPlay): Readonly<Record<number, EdgeValuePainter>> {
  return Object.fromEntries(
    Object.entries(play.values ?? {}).map(([v, { paint }]) => {
      if (!(paint in EDGE_VALUE_PAINTERS))
        throw new Error(`play: no edge painter ${paint}`);
      return [Number(v), EDGE_VALUE_PAINTERS[paint as EdgeValuePainterName]];
    }),
  );
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
  const cells = (): FillMistake[] =>
    [...out, ...noteMistakes(module, board, answer)].map((m) =>
      slotted(module, board, answer, m),
    );
  const { marksHold } = module;
  if (marksHold === undefined) return cells();
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
  return cells();
}

/** Mistake `m` with, on a board of features, the cell's slots it decides
 * wrong. */
function slotted<C>(
  module: FillModule<C>,
  board: FillBoard<C>,
  answer: Uint8Array,
  m: FillMistake,
): FillMistake {
  const names = module.play?.numbers?.features?.names;
  const of = module.featuresOf;
  if (m.kind === "mark" || names === undefined || of === undefined) return m;
  const slots = wrongFeatures(board, m.cell, answer[m.cell], of, names.length);
  return slots === 0 ? m : { ...m, slots };
}

/** Each open cell whose notes leave out its answer: a note set the hint would
 * reason from falsely (`entryMistake`). */
function noteMistakes<C>(
  module: FillModule<C>,
  board: FillBoard<C>,
  answer: Uint8Array,
): FillMistake[] {
  const notes = board.pencil;
  if (notes === null) return [];
  const read = { answer, entry: board.values, notes };
  // Kept full, the notes lose a value wherever it is placed, by the board's
  // hand and not the player's: the wrong placement is the one mistake, and
  // the answer it took from its own cell is no second.
  const placedElsewhere = (c: number): boolean =>
    module.play?.fullNotes === true &&
    board.values.some((v, d) => d !== c && v === answer[c]);
  const out: FillMistake[] = [];
  for (let c = 0; c < answer.length; c++)
    if (!board.fixed[c] && entryMistake(read, c) === "note" && !placedElsewhere(c))
      out.push({ cell: c, kind: "note" });
  return out;
}

/** One edit, each mistaken mark cleared and each mistaken cell emptied, then
 * each cell whose notes leave out its answer cleared of them; or, where the
 * notes are kept full, given every value its domain has, in the same edit. */
export function clearMistakes<C>(
  module: FillModule<C>,
  board: FillBoard<C>,
  mistakes: readonly FillMistake[],
): readonly FillMove[] {
  const set: number[] = [];
  const mark: number[] = [];
  const whole: number[] = [];
  const notes: FillMove[] = [];
  const full = module.play?.fullNotes === true;
  for (const m of mistakes)
    if (m.kind === "value") set.push(m.cell, 0);
    else if (m.kind === "mark") mark.push(m.cell, -1);
    else if (full)
      whole.push(m.cell, module.domainOf(spaceOf(module, board), board.dealt, m.cell));
    else
      notes.push({
        type: "set",
        x: m.cell % board.w,
        y: Math.floor(m.cell / board.w),
        n: 0,
        pencil: true,
      });
  return [
    ...(set.length + mark.length + whole.length > 0
      ? [{ set, mark, ...(whole.length > 0 ? { notes: whole } : {}) }]
      : []),
    ...notes,
  ];
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
      // The board's own space: the units its variations have, and its
      // blocks, cut or dealt.
      space: (b) => spaceOf(module, b),
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
  const grid = withBeneath(
    reading,
    board,
    withValueMargins(
      reading,
      board,
      withSlotClues(
        reading,
        board,
        withCornerClues(
          reading,
          board,
          withPartClues(reading, board, gridFormat(reading, board)),
        ),
      ),
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

/** `grid` with what it draws beneath it: the row of counts, each record its
 * value's glyph, a colon and its count (upstream undead.c's `G: 4 V: 2
 * Z: 3`), or the list. */
function withBeneath<C extends Clues<C>>(
  reading: AnswerReading<C>,
  board: FillBoard<C>,
  grid: string,
): string {
  const records = reading.counts?.(board) ?? [];
  const glyphs = reading.glyphs(board);
  const glyph = (v: number): string => (glyphs[v] ?? String(v)).trim();
  const listed = (reading.list?.(board) ?? []).map((r) =>
    Array.from(r, glyph).join(""),
  );
  if (records.length === 0 && listed.length === 0) return grid;
  const lines =
    records.length > 0
      ? [records.map((r) => `${glyph(r.value)}: ${r.count}`).join(" ")]
      : listLines(listed);
  return `${grid.replace(/\n$/, "")}\n\n${lines.join("\n")}\n`;
}

/** The list's records, `texts`, a line for each length, upstream
 * crossing.c's `3: 123,456,`: a list is held sorted by length. */
function listLines(texts: readonly string[]): string[] {
  const lines: string[] = [];
  let length = -1;
  for (const t of texts) {
    if (t.length !== length) lines.push(`${t.length}: `);
    length = t.length;
    lines[lines.length - 1] += `${t},`;
  }
  return lines;
}

/** `grid` with the clues one a value at its lines before them, as the board
 * draws them: a column's a line a value above it, each over the middle of
 * its cell, and a row's a column a value before it. Each value heads its
 * row of the columns' clues at the end of the line, and the last line,
 * which the corner shares, heads each column of the rows' clues (upstream
 * abcd.c's `game_text_format`). A hidden clue's place is blank. */
function withValueMargins<C extends Clues<C>>(
  reading: AnswerReading<C>,
  board: FillBoard<C>,
  grid: string,
): string {
  const margins = reading.valueMargins;
  if (margins === undefined) return grid;
  const { w, h } = board;
  const { start, end } = margins.sides(board);
  const n = start.length;
  const clue = (line: number, v: number): string => {
    const at = marginClueAt(margins.kinds, board, perPlace(line, v));
    return at === null ? "" : String(at.v);
  };
  const glyphs = reading.glyphs(board);
  const heading = (v: number): string => (glyphs[v] ?? String(v)).trim();
  // A column of the rows' clues is as wide as its widest text and a space.
  let width = 2;
  for (let line = 0; line < w + h; line++)
    for (const v of [...start, ...end])
      width = Math.max(width, clue(line, v).length + 1, heading(v).length + 1);
  // A cell's text is three characters after a one-character wall.
  const columns = (v: number): string =>
    Array.from({ length: w }, (_, x) => {
      const t = clue(h + x, v);
      return ` ${t.length === 1 ? ` ${t} ` : t.padEnd(3)}`;
    }).join("");
  const above = start.map((v, i) => {
    const heads =
      i === n - 1
        ? start.map((u) => heading(u).padEnd(width)).join("")
        : `${" ".repeat((n - 1) * width)}${heading(v).padEnd(width)}`;
    return `${heads}${columns(v)}`.trimEnd();
  });
  // The values past the end head their rows of the columns' clues after
  // them, the first line, which the corner shares, heading each column of
  // the rows' clues too.
  const below = end.map((v, j) =>
    `${" ".repeat(n * width)}${columns(v)}  ${j === 0 ? end.map(heading).join(" ") : heading(v)}`.trimEnd(),
  );
  // The grid's lines alternate a wall and a row of cells.
  const lines = grid
    .trimEnd()
    .split("\n")
    .map((line, i) => {
      const row = (i - 1) / 2;
      if (i % 2 === 0 || row >= h) return `${" ".repeat(n * width)}${line}`;
      const after = end.map((v) => ` ${clue(row, v)}`).join("");
      return `${start.map((v) => clue(row, v).padEnd(width)).join("")}${line}${after}`.trimEnd();
    });
  return `${[...above, ...lines, ...below].join("\n")}\n`;
}

/** `grid` in a rim of the clues at its slots: each column's above and below
 * the middle of its cell, and each row's before and after it, a clue's
 * place blank where it has none. */
function withSlotClues<C extends Clues<C>>(
  reading: AnswerReading<C>,
  board: FillBoard<C>,
  grid: string,
): string {
  const off = reading.off?.(board) ?? new Set();
  const kinds = (reading.slotClues ?? []).filter((k) => !off.has(String(k)));
  if (kinds.length === 0) return grid;
  const { w, h } = board;
  const glyphs = reading.glyphs(board);
  const clue = (s: number): string => {
    const at = slotClueAt(kinds, board, s);
    if (at === null) return " ";
    return reading.glyphClues?.includes(at.kind) === true
      ? (glyphs[at.v] ?? String(at.v)).trim()
      : String(at.v);
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
  const glyphs = reading.glyphs(board);
  const margin = reading.lineClues.length > 0 ? 1 : 0;
  const clue = (line: number): string => {
    for (const kind of reading.lineClues) {
      const v = clueAt(listOf(dealt, kind), line);
      if (v >= 0) return v >= 100 ? `${v}` : v >= 10 ? `${v} ` : ` ${v} `;
    }
    return "   ";
  };
  // A walled partition's walls alone, where there is one: each cell's part,
  // `-1` off the grid, and a line only between two that differ.
  const parts = reading.walls?.(board) ?? null;
  const part = (x: number, y: number): number =>
    x < 0 || y < 0 || x >= w || y >= h ? -1 : (parts?.[y * w + x] ?? 0);
  // Between two cells of a gapped board, its gap's clue in place of a wall.
  const { gap } = reading;
  const inside = (x: number, y: number): boolean => part(x, y) >= 0;
  const walled = (x: number, y: number, x2: number, y2: number): boolean =>
    gap !== undefined
      ? !inside(x, y) || !inside(x2, y2)
      : parts === null || part(x, y) !== part(x2, y2);
  // Between two cells of a board whose answer is on the edges, the edge's
  // value, blank where it is open.
  const { edges } = reading;
  const sp = edges?.space(board) ?? null;
  const edgeText = (
    x: number,
    y: number,
    x2: number,
    y2: number,
    way: "beside" | "above",
  ): string | null => {
    if (edges === undefined || sp === null || !inside(x, y) || !inside(x2, y2))
      return null;
    const v = values[sp.edgeOf(y * w + x, y2 * w + x2)];
    if (v !== 0) return edges.text[v][way];
    return way === "beside" ? " " : "   ";
  };
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
      const e = edgeText(x, y - 1, x, y, "above");
      if (e !== null) return e;
      return walled(x, y - 1, x, y) ? "---" : "   ";
    },
    left: (x, y) => {
      if (margin && x === w + 1 && y === h) return " ";
      return (
        between(x - 1, y, x, y) ??
        edgeText(x - 1, y, x, y, "beside") ??
        (walled(x - 1, y, x, y) ? "|" : " ")
      );
    },
    cell: (x, y) => {
      if (x === w && y === h) return "   ";
      // A row's line is its index; a column's comes after the rows.
      if (x === w) return clue(y);
      if (y === h) return clue(h + x);
      // A cell of a board whose answer is on the edges holds no value: only
      // its number, where it has one.
      if (edges !== undefined) {
        for (const kind of reading.numbers ?? []) {
          const n = listOf(dealt, kind).valueAt[y * w + x];
          if (n >= 0) return ` ${n} `;
        }
        return "   ";
      }
      // A number on a cell the player fills sits inside the glyph of what the
      // cell holds, where the glyph leaves its middle blank (Singles' `[3]`).
      for (const kind of reading.numbers ?? []) {
        const n = listOf(dealt, kind).valueAt[y * w + x];
        if (n < 0) continue;
        const g = glyphs[values[y * w + x]];
        return g?.[1] === " " && n < 10 ? `${g[0]}${n}${g[2]}` : ` ${n} `;
      }
      const v = values[y * w + x];
      if (v === 0 && reading.ball !== undefined)
        if (listOf(dealt, reading.ball).valueAt[y * w + x] >= 0)
          return ` ${BALL_GLYPH} `;
      return v === 0 ? " . " : (glyphs[v] ?? " ? ");
    },
  });
}

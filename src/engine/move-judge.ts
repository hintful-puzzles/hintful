/**
 * Whether the game's own deductions reach a player's move from the position
 * before it: what Check & save says of the last move (`quick-save`, "Check &
 * save judges the last move").
 *
 * Every board the app deals has one answer, so a correct move is always
 * forced by the board; what tells a player something is whether a deduction
 * the game teaches makes it. The judge is the hint's own walk, from the
 * position before the move, aimed at the move's facts: it takes a firing that
 * makes one the moment one is on offer, and walks on as the hint would until
 * one is or nothing follows. What it quotes is the firing's step, in the
 * hint's words, and the fact graph says whether that firing read only what
 * the board showed.
 *
 * What is here is about the description's marks and nothing else; a hint
 * builder drives the walk and makes the words (`described-firing-hint.ts`).
 */
import { type Facts, MARK, PLACE, STRIKE, STRIKE_EDGE } from "./describe-runtime.ts";
import type { FactGraph } from "./fact-graph.ts";
import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  unshaped,
} from "./hint-words.ts";
import type { CellMarks } from "./ladder-runtime.ts";
import type { Point } from "./types.ts";

/** A fact a move made: a value placed, a candidate struck, an edge's mark
 * struck, a cell marked; `at` is the cell or the edge. */
export interface MovedFact {
  readonly kind: number;
  readonly at: number;
  readonly value: number;
}

/**
 * The facts a move made, from the marks of the position before it, a second
 * copy of them, and the marks after it, in the order a verdict names them:
 * the values placed, then what was struck or marked on its own. A placement
 * strikes what the game's placing techniques strike with it, and those are
 * the placement's, not the player's: they are read off `placed`, which the
 * placements are made on. A value taken back or written over, and a
 * candidate given back, are no fact a deduction makes and are left out.
 */
export function movedFacts(
  before: CellMarks,
  placed: CellMarks,
  after: CellMarks,
): MovedFact[] {
  const out: MovedFact[] = [];
  for (let c = 0; c < before.grid.length; c++) {
    const v = after.grid[c];
    if (before.grid[c] !== 0 || v === 0) continue;
    out.push({ kind: PLACE, at: c, value: v });
    if (placed.grid[c] === 0) placed.place(c, v);
  }
  for (let c = 0; c < placed.cands.length; c++) {
    if (after.grid[c] !== 0) continue;
    for (let gone = placed.cands[c] & ~after.cands[c]; gone !== 0; gone &= gone - 1)
      out.push({ kind: STRIKE, at: c, value: 31 - Math.clz32(gone & -gone) });
  }
  for (let e = 0; e < placed.edgeCands.length; e++)
    for (
      let gone = placed.edgeCands[e] & ~after.edgeCands[e];
      gone !== 0;
      gone &= gone - 1
    )
      out.push({ kind: STRIKE_EDGE, at: e, value: 31 - Math.clz32(gone & -gone) });
  for (let c = 0; c < placed.marked.length; c++)
    if (placed.marked[c] === -1 && after.marked[c] !== -1)
      out.push({ kind: MARK, at: c, value: after.marked[c] });
  return out;
}

/** Whether marks `m` hold the fact: its value placed, its candidate or edge
 * mark gone (a placement of another value takes the candidate), its mark
 * made. */
export function reached(m: CellMarks, f: MovedFact): boolean {
  switch (f.kind) {
    case PLACE:
      return m.grid[f.at] === f.value;
    case STRIKE:
      return !m.has(f.at, f.value);
    case STRIKE_EDGE:
      return ((m.edgeCand(f.at) >> f.value) & 1) === 0;
    case MARK:
      return m.markOf(f.at) === f.value;
    default:
      return false;
  }
}

/** Whether one of a firing's facts (kind, element, value) makes `f`. */
function makes(kind: number, at: number, value: number, f: MovedFact): boolean {
  if (at !== f.at) return false;
  if (f.kind === STRIKE)
    return (
      (kind === STRIKE && value === f.value) || (kind === PLACE && value !== f.value)
    );
  return kind === f.kind && value === f.value;
}

/** Whether a firing's facts make one of `wanted`. */
export function aimsAt(facts: Facts, wanted: readonly MovedFact[]): boolean {
  for (let i = 0; i < facts.length; i += 3)
    for (const f of wanted)
      if (makes(facts[i], facts[i + 1], facts[i + 2], f)) return true;
  return false;
}

/**
 * The walk step to quote for fact `f`, of the steps the walk took (`made`,
 * each the ids of the graph's facts it made), `reachedAt` the step after
 * which the walked marks first held it.
 *
 * The walk is aimed, so a firing that makes the fact from the board as it
 * stood is the first it takes: a fact reached at the first step is direct,
 * and that step is quoted. Otherwise it is `chained`, and the step quoted is
 * the earliest one what it rests on goes back to (`FactGraph.restsOn`), which
 * read only the board; `step` is `null` where the graph cannot say, since
 * another step would be quoted as the chain's start without being in it.
 */
export function quotedStep(
  graph: FactGraph,
  made: readonly (readonly number[])[],
  f: MovedFact,
  reachedAt: number,
): { step: number | null; chained: boolean } {
  if (reachedAt <= 0) return { step: 0, chained: false };
  let id = -1;
  for (const x of made[reachedAt] ?? []) {
    const g = graph.facts[x];
    const sameSpace = (g.about.space === "edges") === (f.kind === STRIKE_EDGE);
    if (id < 0 && sameSpace && makes(g.kind, g.about.at, g.value, f)) id = x;
  }
  const stepOf = (x: number): number => made.findIndex((ids) => ids.includes(x));
  const earliest = (id < 0 ? [] : graph.restsOn(id).facts)
    .map((g) => stepOf(g.id))
    .filter((k) => k >= 0)
    .reduce((a, b) => Math.min(a, b), reachedAt);
  return { step: earliest < reachedAt ? earliest : null, chained: true };
}

/** What a check says of a move the deductions reached: the step's words,
 * behind a lead-in that keeps their marks. */
export function followedWords(words: Narration, chained: boolean): Sentence {
  const lead = chained
    ? "Your last move followed from the board in a few steps, the first of them:"
    : "Your last move followed from the board:";
  return unshaped(phrase`${lead} ${words.uncapitalized()}`, "evident");
}

/** What a check says of a move a chain of deductions reached where what it
 * rests on is not known, its square ringed. */
export function chainedWords(at: Point, noun: string): Sentence {
  return unshaped(
    phrase`Your last move followed from the board: a few steps on from what is marked, ${mark.the("ring", CELL, [at], noun)} is decided.`,
    "evident",
  );
}

/** What a check says of a move no deduction reached, its square ringed. */
export function unforcedWords(at: Point, noun: string): Sentence {
  return unshaped(
    phrase`Your last move was right, but nothing on the board decided ${mark.the("ring", CELL, [at], noun)} yet.`,
    "evident",
  );
}

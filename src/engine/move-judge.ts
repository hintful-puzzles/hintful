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
 * builder drives the walk and makes the words (`described-firing-hint.ts`,
 * `described-edge-hint.ts`).
 */
import { type Facts, MARK, PLACE, STRIKE, STRIKE_EDGE } from "./describe-runtime.ts";
import type { FactGraph } from "./fact-graph.ts";
import type { MoveVerdict } from "./game.ts";
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
 * made. With `struck`, a value left the one candidate counts as placed. */
function reached(m: CellMarks, f: MovedFact, struck = false): boolean {
  switch (f.kind) {
    case PLACE:
      return (
        m.grid[f.at] === f.value ||
        (struck && m.grid[f.at] === 0 && m.cands[f.at] === 1 << f.value)
      );
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

/** Whether one of a firing's facts (kind, element, value) makes `f`, or
 * for a placement, has a part in making it: a strike of another value. */
function makes(kind: number, at: number, value: number, f: MovedFact): boolean {
  if (at !== f.at) return false;
  if (f.kind === STRIKE)
    return (
      (kind === STRIKE && value === f.value) || (kind === PLACE && value !== f.value)
    );
  if (f.kind === PLACE) return value === f.value ? kind === PLACE : kind === STRIKE;
  return kind === f.kind && value === f.value;
}

/** How many of `wanted` a firing's facts make on marks `m`. A placement is
 * made by placing it, or by striking what leaves it the cell's one candidate
 * (`struck`, as {@link reached} reads it); a strike that only narrows the
 * cell is not counted, or it would be taken before the firing that decides
 * the cell. */
function aimsAt(
  facts: Facts,
  wanted: readonly MovedFact[],
  m: CellMarks,
  struck: (f: MovedFact) => boolean,
): number {
  let n = 0;
  for (const f of wanted) {
    let made = false;
    let gone = 0;
    for (let i = 0; i < facts.length && !made; i += 3) {
      if (f.kind !== PLACE) made = makes(facts[i], facts[i + 1], facts[i + 2], f);
      else if (facts[i + 1] === f.at) {
        if (facts[i] === PLACE && facts[i + 2] === f.value) made = true;
        if (facts[i] === STRIKE) gone |= 1 << facts[i + 2];
      }
    }
    if (!made && gone !== 0 && struck(f))
      made = (m.cands[f.at] & ~gone) === 1 << f.value;
    if (made) n++;
  }
  return n;
}

/**
 * The walk step to quote for fact `f`, which a chain reached: of the steps
 * the walk took (`made`, each the ids of the graph's facts it made),
 * `reachedAt` is the one (past the first) that made it. The step quoted is
 * the earliest one what it rests on goes back to (`FactGraph.restsOn`),
 * which read only the board; `null` where the graph cannot say, since
 * another step would be quoted as the chain's start without being in it.
 */
function quotedStep(
  graph: FactGraph,
  made: readonly (readonly number[])[],
  f: MovedFact,
  reachedAt: number,
): number | null {
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
  return earliest < reachedAt ? earliest : null;
}

/**
 * A walk judging a move, as a builder drives it: what it aims at, whether
 * the walked marks hold every fact yet, and what each firing made (the
 * graph's ids) and the index of its first step among the builder's steps.
 */
export interface Judging {
  /** How well a firing, by its facts, aims at the facts not yet reached. */
  aim(f: { readonly facts: Facts }): number;
  done(m: CellMarks): boolean;
  made: number[][];
  firstStep: number[];
  graph: FactGraph | null;
  /**
   * Records a firing the walk took: the graph's facts from `known` on are
   * what it made, and the steps `from` up to `to` are what it showed. A
   * firing that showed none is the hint's bookkeeping: its facts go with the
   * next one's, so it neither opens a chain nor is quoted.
   */
  took(graph: FactGraph, known: number, from: number, to: number): void;
  /** Whether the marks decide a fact they hold no mark for, as the board
   * reads them (`EdgeHintSpec.holds`): a mark no firing makes, where a
   * walk ends on the answer or the description reads it off other marks. */
  holds?: (m: CellMarks, f: MovedFact) => boolean;
}

/** What the walk found of a move: a fact nothing reached (its index in
 * `moved`), or the firing whose step is quoted, and whether a chain led
 * there; `firing` is `null` for a chain whose start the graph cannot say,
 * and, not chained, for a move the board already decided before any firing
 * (the player wrote down what its marks show). */
export type Judged =
  | { kind: "unforced"; fact: number }
  | { kind: "followed"; firing: number | null; chained: boolean };

/**
 * Judge `moved` by a walk: `walk` runs the builder's steps with the
 * {@link Judging} given it, aimed at the facts not yet reached and ending
 * once all are. A fact the marks held before any firing is one the board
 * already decided: judged only where the move made nothing else. `null`
 * where nothing is left to judge.
 */
export function judgeByWalk(
  moved: readonly MovedFact[],
  walk: (judging: Judging) => void,
): Judged | null {
  // How many firings the walk had taken when its marks first held each fact.
  const at = moved.map(() => -1);
  // Per fact, whether striking may place it, read the first time asked.
  let struck: boolean[] | null = null;
  // The walked marks, which `done` is handed before each firing.
  let marks: CellMarks | null = null;
  // The facts of firings that showed no step, since the last that did.
  let carried: number[] = [];
  const judging: Judging = {
    took(graph, known, from, to) {
      for (let id = known; id < graph.facts.length; id++) carried.push(id);
      if (to === from) return;
      this.made.push(carried);
      this.firstStep.push(from);
      carried = [];
    },
    // A firing that makes every fact left before one that makes some: a
    // count would prefer one that makes many of the strikes a placement
    // brings along (Light Up's lit squares) to the one that places it.
    aim: (f) => {
      const wanted = moved.filter((_, i) => at[i] < 0);
      const n =
        marks === null
          ? 0
          : aimsAt(f.facts, wanted, marks, (g) => struck?.[moved.indexOf(g)] === true);
      return n === 0 ? 0 : n === wanted.length ? 2 : 1;
    },
    made: [],
    firstStep: [],
    graph: null,
    done(m) {
      marks = m;
      // A walk that only strikes leaves a value the one candidate, where
      // marks read off a board place it (Bridges' lines); a cell already so
      // when the walk began is the player's notes, which a firing places.
      if (struck === null)
        struck = moved.map(
          (f) => f.kind === PLACE && m.grid[f.at] === 0 && m.candCount(f.at) > 1,
        );
      for (const [i, f] of moved.entries())
        if (at[i] < 0 && (reached(m, f, struck[i]) || this.holds?.(m, f) === true))
          at[i] = this.made.length;
      return at.every((n) => n >= 0);
    },
  };
  walk(judging);
  // A walk may end on the firing that made the last fact, before it asks
  // again: Loopy's stops on a solved board, so the move closing the loop
  // read as reached by nothing.
  if (marks !== null) judging.done(marks);
  // A fact the board decided before any firing is not judged, but where the
  // move is all such.
  const judged = moved.flatMap((_, i) => (at[i] !== 0 ? [i] : []));
  if (judged.length === 0)
    return at.some((n) => n === 0)
      ? { kind: "followed", firing: null, chained: false }
      : null;
  const missed = judged.find((i) => at[i] < 0);
  if (missed !== undefined) return { kind: "unforced", fact: missed };
  const first = Math.min(...judged.map((i) => at[i]));
  const chained = judged.some((i) => at[i] > 1);
  // A move the board decides at once in part opens with that part's firing.
  if (first === 1) return { kind: "followed", firing: 0, chained };
  // A walk that keeps no fact graph cannot say where the chain began.
  const graph = judging.graph;
  if (graph === null) return { kind: "followed", firing: null, chained: true };
  const i = judged.find((k) => at[k] === first) ?? judged[0];
  const firing = quotedStep(graph, judging.made, moved[i], first - 1);
  return { kind: "followed", firing, chained: true };
}

/** Where a verdict that quotes no step rings a fact: the square, the noun
 * the game calls it, and the game's marks for it; `at` is `null` where
 * there is no square to ring. */
export interface Ringed<H> {
  readonly at: Point | null;
  readonly noun?: string;
  readonly highlights?: H;
}

/**
 * What a check says of a move a walk judged, from the steps the walk showed
 * (`steps`, each firing's first at `firstStep`): the quoted firing's step,
 * the first of them `about` the move where one is, behind the lead; or,
 * where no step is quoted, the fact's square `ring`ed. `about` is handed the
 * cells the move's facts are on, an edge's mark not among them. `null` where
 * the quoted step has no words.
 */
function verdictOf<
  H,
  S extends { readonly words?: Narration; readonly highlights?: H },
>(
  judged: Judged,
  moved: readonly MovedFact[],
  steps: readonly S[],
  firstStep: readonly number[],
  ring: (fact: MovedFact) => Ringed<H>,
  about: (step: S, cells: ReadonlySet<number>) => boolean = () => true,
): MoveVerdict<H> | null {
  const ringed = (i: number, followed: boolean, chained = true): MoveVerdict<H> => {
    const { at, noun = "square", highlights } = ring(moved[i]);
    return {
      followed,
      words: followed ? unquotedWords(at, noun, chained) : unforcedWords(at, noun),
      ...(highlights === undefined ? {} : { highlights }),
    };
  };
  if (judged.kind === "unforced") return ringed(judged.fact, false);
  if (judged.firing === null) return ringed(0, true, judged.chained);
  const ofFiring = steps.slice(
    firstStep[judged.firing],
    firstStep[judged.firing + 1] ?? steps.length,
  );
  const cells = new Set(moved.flatMap((f) => (f.kind === STRIKE_EDGE ? [] : [f.at])));
  const quoted = ofFiring.find((s) => about(s, cells)) ?? ofFiring[0];
  if (quoted?.words === undefined) return null;
  return {
    followed: true,
    words: followedWords(quoted.words, judged.chained),
    ...(quoted.highlights === undefined ? {} : { highlights: quoted.highlights }),
  };
}

/**
 * `Game.judgeMove` for a hint whose steps a game builds from its own walk:
 * the move's facts are the difference of the marks the hint reads off the
 * board before and after it (`marks`, `null` where the board breaks the
 * rules), and `walk` runs the hint's walk from the position before, aimed by
 * the judging given it, returning its steps with each firing's first in the
 * judging's `firstStep`. The verdict is {@link verdictOf}'s.
 */
export function judgeWalked<
  State,
  H,
  S extends { readonly words?: Narration; readonly highlights?: H },
>(
  before: State,
  after: State,
  marks: (state: State) => CellMarks | null,
  walk: (judging: Judging) => readonly S[],
  ring: (fact: MovedFact) => Ringed<H>,
  about?: (step: S, cells: ReadonlySet<number>) => boolean,
): MoveVerdict<H> | null {
  const was = marks(before);
  const placed = marks(before);
  const now = marks(after);
  if (was === null || placed === null || now === null) return null;
  const moved = movedFacts(was, placed, now);
  if (moved.length === 0) return null;
  let steps: readonly S[] = [];
  let firstStep: readonly number[] = [];
  const judged = judgeByWalk(moved, (judging) => {
    steps = walk(judging);
    firstStep = judging.firstStep;
  });
  return judged === null
    ? null
    : verdictOf(judged, moved, steps, firstStep, ring, about);
}

/** What a check says of a move the deductions reached: the step's words,
 * behind a lead-in that keeps their marks. */
export function followedWords(words: Narration, chained: boolean): Sentence {
  const lead = chained
    ? "Your last move followed from the board in a few steps, the first of them:"
    : "Your last move followed from the board:";
  return unshaped(phrase`${lead} ${words.uncapitalized()}`, "evident");
}

/** What a check says of a move that followed where no step is quoted, its
 * square ringed where there is one to ring: a chain of deductions whose
 * start is not known, or, not `chained`, the marks already on the board. */
export function unquotedWords(
  at: Point | null,
  noun = "square",
  chained = true,
): Sentence {
  if (!chained)
    return unshaped(
      at === null
        ? phrase`Your last move followed from what the board already shows.`
        : phrase`Your last move followed from the board: what is already marked decides ${mark.the("ring", CELL, [at], noun)}.`,
      "evident",
    );
  return unshaped(
    at === null
      ? phrase`Your last move followed from the board, a few steps on from what it shows.`
      : phrase`Your last move followed from the board: a few steps on from what is marked, ${mark.the("ring", CELL, [at], noun)} is decided.`,
    "evident",
  );
}

/** What a check says of a move no deduction reached, its square ringed where
 * there is one to ring. A game that decides edges has no square: its player
 * has just made the move, which the words then name as "it". */
export function unforcedWords(at: Point | null, noun = "square"): Sentence {
  return unshaped(
    at === null
      ? phrase`Your last move was right, but nothing on the board decided it yet.`
      : phrase`Your last move was right, but nothing on the board decided ${mark.the("ring", CELL, [at], noun)} yet.`,
    "evident",
  );
}

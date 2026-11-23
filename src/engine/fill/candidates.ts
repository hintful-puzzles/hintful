/**
 * The hint of a board of numbers that keeps notes (`play.notes`): the shared
 * candidate walk (`engine/hint/candidate-plan.ts`), built from the compiled
 * module, so a born game writes none of what a hand-written one's
 * `buildSteps` does (`docs/hints-candidates.md` § "What every game does").
 * The walk reads the player's notes where the mistake check vouches for them,
 * its rungs are the ladder's techniques run on those notes, and its steps
 * set and strike notes as the player does.
 *
 * Its regions are the space's rows and columns, each holding every value
 * once, as on every Latin board; the library's strikes are worded by the
 * library (`hint-text.ts`'s Latin words), a firing a leg a cell.
 */

import type { Game, HintStep } from "../contract/game.ts";
import { CELL, type Narration, type Sentence } from "../contract/hint-words.ts";
import type { Point } from "../contract/types.ts";
import {
  type CandidateHighlights,
  type CandidateMoveAdapter,
  type CandidatePlanPrefs,
  type CandidatePrefsUi,
  candidateHint,
  keepCandidateHintTrack,
  type Mark,
  refreshCandidateHintStep,
  valuesOf,
} from "../hint/candidate-hint.ts";
import { candidateJudge, type RungNames } from "../hint/candidate-judge.ts";
import {
  type Firing,
  LATIN_RUNGS,
  type NotesLadder,
  type PlanRung,
  runLatinCandidatePlan,
  strikesOf,
  techniqueRung,
} from "../hint/candidate-plan.ts";
import {
  type LatinVocab,
  latinPremise,
  narrateLatinReason,
} from "../hint/hint-text.ts";
import type { GenericLatinReason } from "../hint/latin-hint.ts";
import { byCell, latinStrikeRungs } from "../hint/latin-notes.ts";
import { type Clauses, statedParts, statedSentence } from "../hint/stated.ts";
import { CellMarks } from "../solve/cell-marks.ts";
import { PLACE } from "../solve/describe-runtime.ts";
import {
  type Firing as LadderFiring,
  type Said,
  TIERS,
} from "../solve/ladder-runtime.ts";
import { type FillBoard, type LadderedFillModule, ladderOf, spaceOf } from "./board.ts";
import { type FillMove, isCandidateMove, reachOf } from "./notes.ts";
import { numeral } from "./numbers.ts";
import { slotPoint } from "./slots.ts";

/** What a step of the candidate walk marks: the shared highlights. */
export type CandidateFillHint = CandidateHighlights;

/** Every rung a step of the walk can be: the Latin family's. */
const CANDIDATE_FILL_RUNGS: readonly string[] = LATIN_RUNGS;

/** A fill board's moves as the walk reads and makes them: its note-taking
 * cell's are the canonical shapes, and an edit (Solve, Clear, Reveal) is
 * none of them. */
const FILL_CANDIDATE_MOVES: CandidateMoveAdapter<FillMove> = {
  read: (m) => (isCandidateMove(m) ? m : null),
  strike: (marks) => ({ type: "pencilStrike", marks }),
};

/** What the walk reads of a compiled module beside its ladder. */
export interface CandidateFillModule<C> extends LadderedFillModule<C> {
  /** What a player calls each rung, which Check & save names a move by. */
  readonly NAMES?: Readonly<Record<string, string>>;
  readonly WORDS?: { readonly cell?: string; readonly value?: string };
  /** Every kind of step the description's own techniques say: an id, or
   * `id.arm` where an arm splits its steps. */
  readonly SAYS_KINDS?: readonly string[];
  /** The words each of the description's own techniques states, by kind. */
  readonly STATED?: Readonly<
    Record<
      string,
      { readonly step?: readonly Clauses[]; readonly fact?: readonly Clauses[] }
    >
  >;
}

/** A firing's strikes a leg a value, from every cell it strikes it in. */
function byValue(marks: readonly Mark[]): Mark[][] {
  const out = new Map<number, Mark[]>();
  for (const m of marks) out.set(m.n, [...(out.get(m.n) ?? []), m]);
  return [...out.values()];
}

/** Why a technique of the description's own struck or placed: its rung, the
 * technique's id or the arm that held, and what it states: a strike's look,
 * or a placement's sentence, a journey's later leg saying its `again`. */
interface OwnReason {
  readonly kind: string;
  readonly premise?: Narration;
  readonly say?: (later: boolean) => Sentence;
}

/** Why a step of the walk is forced: the library's reasons, or the
 * description's own. */
type Reason = GenericLatinReason | OwnReason;

/** What a firing of a technique that states its words says: its terms and
 * marks, which wording held where it has several, and what each fact has of
 * its own where it words each. */
interface StatedSays {
  /** The arm that held, where the technique's steps are split by one. */
  readonly arm?: string;
  readonly terms: Readonly<Record<string, unknown>>;
  readonly marks?: Readonly<Record<string, readonly number[]>>;
  readonly wording?: number;
  readonly facts?: readonly {
    /** Which of the fact's wordings held, where it has several. */
    readonly wording?: number;
    readonly terms: Readonly<Record<string, unknown>>;
  }[];
}

/** The candidate walk's hint hooks, which `fillGame` takes for a board that
 * keeps notes. */
export type CandidateFillHooks<C, Ui> = Pick<
  NonNullable<
    Game<
      unknown,
      FillBoard<C>,
      FillMove,
      Ui,
      unknown,
      unknown,
      CandidateFillHint
    >["hint"]
  >,
  "plan" | "judgeMove" | "keepTrack" | "refreshStep" | "rungs"
>;

/**
 * The candidate walk of `module`'s boards. `tierOf` is a board's tier, past
 * which the hint teaches nothing, as the ladder that graded it ran nothing
 * past it; `uiOf` is the `Ui` a fresh game starts with, whose reading a hint
 * asked for with none is walked under.
 */
export function candidateFill<C, Ui extends CandidatePrefsUi>(
  module: CandidateFillModule<C>,
  tierOf: (board: FillBoard<C>) => number,
  uiOf: (board: FillBoard<C>) => Ui,
): CandidateFillHooks<C, Ui> {
  if (module.units.join() !== "rows,cols")
    throw new Error(
      `a board's notes are walked on rows and columns, not ${module.units.join(", ")}`,
    );
  // The description's own techniques, beside the library's, each worded by
  // what it states (`ownLegs`). A step's rung is the arm that held where
  // arms split it, each named for one of its rungs, else its one rung (Keen's
  // `cageEasy` is a `cage`), else its id: what the names say a step by.
  const own = module.ladder.filter((e) => !e.id.startsWith("latin.")).map((e) => e.id);
  const kindsOf = (id: string): string[] => {
    const arms = (module.SAYS_KINDS ?? [])
      .filter((k) => k.startsWith(`${id}.`))
      .map((k) => k.slice(id.length + 1));
    return arms.length > 0 ? arms : [module.techniques[id]?.rung ?? id];
  };
  const ownKinds = [...new Set(own.flatMap(kindsOf))];
  // Check & save names a move by its rung.
  for (const kind of ownKinds)
    if (module.NAMES !== undefined && !Object.hasOwn(module.NAMES, kind))
      throw new Error(`a step of ${kind}, which the description names nothing`);
  const ownSet = new Set(ownKinds);
  const isOwn = (r: Reason): r is OwnReason => ownSet.has(r.kind);
  const vocab: LatinVocab = {
    noun: module.WORDS?.value ?? "number",
    value: numeral,
    cell: module.WORDS?.cell ?? "square",
  };

  /**
   * A firing of the description's own technique `id` as legs, as the walk
   * makes moves: a placement each, the later legs of the journey saying
   * their `again`; or the strikes a cell each, or a value each where the
   * technique says so (`byValue`, Towers' heights). Each is worded by what
   * the technique states, of the fact its first move is where it words each
   * fact, else of its step: a strike by its look, the walk saying what the
   * leg strikes. A look may name the leg's cells (`{ring}`) and the values it
   * strikes (`{struck}`).
   */
  function ownLegs(
    id: string,
    f: LadderFiring,
    w: number,
    h: number,
  ): Firing<FillMove, CandidateFillHint, Reason> {
    const { says } = f.reasons[0] as Said<unknown, StatedSays>;
    const kind = says.arm ?? module.techniques[id]?.rung ?? id;
    const stated = module.STATED?.[says.arm === undefined ? id : `${id}.${says.arm}`];
    const at = (c: number): Point => ({ x: c % w, y: Math.floor(c / w) });
    const marks = Object.fromEntries(
      Object.entries(says.marks ?? {}).map(([role, els]) => [role, els.map(at)]),
    );
    // A slot lies a step beyond its line's end, off the cells.
    const termAt = Object.fromEntries(
      (module.techniques[id]?.slotTerms ?? []).map((name) => [
        name,
        (s: number) => slotPoint(w, h, s),
      ]),
    );
    /** The clauses fact `k` is worded by, and what they are rendered
     * against with the leg's cells `ring`. */
    const wordsOf = (k: number, ring: readonly Point[]) => {
      const fact = says.facts?.[k];
      const clauses =
        fact === undefined
          ? stated?.step?.[says.wording ?? 0]
          : stated?.fact?.[fact.wording ?? 0];
      if (clauses === undefined) throw new Error(`${kind} states no words`);
      return {
        clauses,
        context: {
          kind: CELL,
          at,
          termAt,
          ring: ring.map(({ x, y }) => ({ x, y })),
          marks,
          terms: { ...says.terms, ...fact?.terms },
          value: numeral,
          noun: vocab.cell,
          valueNoun: vocab.noun,
        },
      };
    };
    const placed = new Set<number>();
    const places: Firing<FillMove, CandidateFillHint, Reason>[number][] = [];
    for (let k = 0; k < f.facts.length; k += 3) {
      if (f.facts[k] !== PLACE) continue;
      // A row's fact and a column's may both place one cell.
      const c = f.facts[k + 1];
      if (placed.has(c)) continue;
      placed.add(c);
      const place = { ...at(c), n: f.facts[k + 2] };
      const { clauses, context } = wordsOf(k / 3, [place]);
      places.push({
        place,
        reason: {
          kind,
          say: (later) => statedSentence(clauses, { ...context, later }),
        },
      });
    }
    if (places.length > 0) {
      for (let k = 0; k < f.facts.length; k += 3)
        if (f.facts[k] !== PLACE) throw new Error(`${kind} both places and strikes`);
      return places;
    }
    const strikes = strikesOf(f, w);
    const legs =
      module.techniques[id]?.byValue === true ? byValue(strikes) : byCell(strikes);
    return legs.map((strike) => {
      const { clauses, context } = wordsOf(strikes.indexOf(strike[0]), strike);
      const { look } = statedParts(clauses, { ...context, struck: valuesOf(strike) });
      if (look === undefined) throw new Error(`${kind} states no look to strike by`);
      return { strike, reason: { kind, premise: look } };
    });
  }

  function buildSteps(
    board: FillBoard<C>,
    { autoClean, reading, judging }: CandidatePlanPrefs,
  ): HintStep<FillMove, CandidateFillHint, string>[] {
    const sp = spaceOf(module, board);
    const w = board.w;
    const grid = Uint8Array.from(board.values);
    // A placed cell's notes are nothing the walk reads.
    const pencil = Int32Array.from(board.pencil ?? grid, (p, c) => (grid[c] ? 0 : p));
    let domain = 0;
    for (const c of sp.cells) domain |= module.domainOf(sp, board.dealt, c);
    const ladder = ladderOf(module, board);
    const on: NotesLadder = {
      ladder,
      caps: { [TIERS]: tierOf(board) },
      marks: () => {
        const m = new CellMarks(sp, domain, grid.slice());
        m.placing = ladder.placing;
        m.striking = ladder.striking;
        return m;
      },
      enc: { values: 31 - Math.clz32(domain) },
    };
    const steps: HintStep<FillMove, CandidateFillHint, PlanRung<Reason>>[] = [];
    runLatinCandidatePlan<FillMove, CandidateFillHint, Reason>({
      w,
      steps,
      grid,
      pencil,
      moves: FILL_CANDIDATE_MOVES,
      reach: reachOf(module, board),
      autoClean,
      reading,
      ...(judging === undefined ? {} : { judging }),
      label: "fill candidate plan",
      placeWords: (m, reason, continues) => {
        if (!isOwn(reason)) return { words: narrateLatinReason(reason, m, w, vocab) };
        if (reason.say === undefined)
          throw new Error(`${reason.kind} strikes, and places nothing`);
        return { words: reason.say(continues) };
      },
      strikeWords: (marks, reason) => {
        if (!isOwn(reason)) return latinPremise(reason, marks, vocab);
        if (reason.premise === undefined)
          throw new Error(`${reason.kind} places, and strikes nothing`);
        return { premise: reason.premise };
      },
      // The description's own techniques first: it states them for its
      // clues, which a player reads before a set or a wing. One that places
      // reading no notes is offered before they are set up.
      rungs: [
        ...own.map((id) =>
          techniqueRung<FillMove, CandidateFillHint, Reason>(
            on,
            id,
            (f) => ownLegs(id, f, w, board.h),
            { leads: module.techniques[id]?.leads === true },
          ),
        ),
        ...latinStrikeRungs<FillMove, CandidateFillHint, Reason, CellMarks>(
          on,
          w,
          byCell,
        ),
      ],
      notes: {
        noun: vocab.noun,
        placedVerb: "standing",
        value: numeral,
        cell: vocab.cell,
      },
    });
    return steps;
  }

  const names = (module.NAMES ?? {}) as RungNames<string>;
  return {
    plan: (board, _aux, ui) => candidateHint(board, ui ?? uiOf(board), buildSteps),
    judgeMove: (before, after, ui) =>
      candidateJudge(before, after, ui ?? uiOf(before), buildSteps, names),
    keepTrack: (m, step, board) =>
      keepCandidateHintTrack(
        m,
        step,
        board.pencil ?? [],
        board.w,
        FILL_CANDIDATE_MOVES,
      ),
    refreshStep: (step, board) =>
      refreshCandidateHintStep(
        step,
        board.values,
        board.pencil ?? [],
        board.w,
        FILL_CANDIDATE_MOVES,
      ),
    rungs: [...CANDIDATE_FILL_RUNGS, ...ownKinds],
  };
}

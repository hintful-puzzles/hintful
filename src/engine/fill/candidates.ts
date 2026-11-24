/**
 * The hint of a board of numbers that keeps notes (`play.notes`): the shared
 * candidate walk (`engine/hint/candidate-plan.ts`), built from the compiled
 * module, so a born game writes none of what a hand-written one's
 * `buildSteps` does (`docs/hints-candidates.md` § "What every game does").
 * The walk reads the player's notes where the mistake check vouches for them,
 * its rungs are the ladder's techniques run on those notes, and its steps
 * set and strike notes as the player does.
 *
 * Its regions are the space's units, its rows and columns, its diagonals and
 * the blocks of the partition among them, and the parts of each dealt
 * partition the rules hold distinct (`distinctParts`), a region holding every
 * value its cells' domains hold where they hold as many as it has cells (a
 * `zoning` area of N squares holds 1 to N). Its singles are the walk's own, so the
 * techniques placed as `one.cell` and `one.place` are none of its rungs. The
 * library's strikes are worded by the library (`hint-text.ts`'s Latin words),
 * a firing one leg over the cells with notes written and a leg each over
 * those without (`byWrittenCell`); where a placed value rules itself out of
 * more than its row and column, the description words how far
 * (`WALK_STEPS`).
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
  CANDIDATE_RUNGS,
  type Firing,
  type NotesLadder,
  type PlanRung,
  runCandidatePlan,
  strikesOf,
  techniqueRung,
} from "../hint/candidate-plan.ts";
import {
  candidateConclusions,
  cleanObviousText,
  cleanStruckText,
  type LatinVocab,
  latinPremise,
  narrateLatinReason,
  noteText,
  placedRulesOut,
  populateText,
} from "../hint/hint-text.ts";
import {
  type CellRegion,
  type GenericLatinReason,
  singleReasonOf,
} from "../hint/latin-hint.ts";
import {
  byCell,
  byWrittenCell,
  LIBRARY_STRIKES,
  latinStrikeRungs,
} from "../hint/latin-notes.ts";
import { type Clauses, statedParts, statedSentence } from "../hint/stated.ts";
import { type StepTable, type StepType, stepVoice } from "../hint/step-voice.ts";
import { CellMarks } from "../solve/cell-marks.ts";
import {
  type GridSpace,
  type Partition,
  PLACE,
  popcount,
} from "../solve/describe-runtime.ts";
import type { Firing as LadderFiring, Said } from "../solve/ladder-runtime.ts";
import {
  capsOf,
  type FillBoard,
  type LadderedFillModule,
  ladderOf,
  spaceOf,
} from "./board.ts";
import { type FillMove, isCandidateMove, reachOf } from "./notes.ts";
import { numeral } from "./numbers.ts";
import { variationFlags } from "./params/settings.ts";
import { slotPoint } from "./slots.ts";
import { WALK_STEPS, type WalkStep } from "./walk-steps.ts";

/** What a step of the candidate walk marks: the shared highlights. */
export type CandidateFillHint = CandidateHighlights;

/** The rungs a step of the walk can be on every board of notes: the walk's
 * own and the singles. The library's strikes are rungs where the ladder
 * places them. */
const CANDIDATE_FILL_RUNGS: readonly string[] = [
  ...CANDIDATE_RUNGS,
  "single",
  "regionsFull",
  "hiddenSingle",
];

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
  readonly WORDS?: {
    readonly cell?: string;
    readonly value?: string;
    /** How a wing's ends share a unit with the cell it strikes. */
    readonly alongside?: string;
  };
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
  /** The description's `steps`, among them the walk's it words. Their terms
   * are each step's own, which no one type over every step admits. */
  readonly STEPS?: StepTable<Readonly<Record<string, UntypedStep>>>;
  /** The dealt partitions whose parts hold no value twice. */
  readonly distinctParts?: readonly string[];
}

/** A step of the description's whose terms and marks are not known here. */
interface UntypedStep extends StepType {
  readonly terms: never;
  readonly marks: never;
}

/** A region the walk reads a value's places in: a row or a column, or a
 * diagonal, a block or a part, named `diagonal` or by its partition's name. */
type FillRegion = CellRegion &
  (
    | { readonly line: "row" | "col"; readonly index: number }
    | { readonly line?: undefined; readonly name: string; readonly cells: number[] }
  );

/** The units that are lines: rows, columns and diagonals. Any other unit is
 * the one partition among a space's units. */
const LINE_UNITS: ReadonlySet<string> = new Set(["rows", "cols", "lines", "diagonals"]);

/** Whether a placed value on a board of `units` rules itself out of its row
 * and column alone, which the walk says in its own words; elsewhere the
 * description words how far (`WALK_STEPS`). */
const rowsAndCols = (units: readonly string[]): boolean =>
  units.length > 0 && units.every((u) => u === "rows" || u === "cols" || u === "lines");

/** The kinds of rule whose firings are the walk's own singles. */
const WALKS: ReadonlySet<string> = new Set(["one.cell", "one.place"]);

/** A firing's strikes a leg a value, from every cell it strikes it in. */
function byValue(marks: readonly Mark[]): Mark[][] {
  const out = new Map<number, Mark[]>();
  for (const m of marks) out.set(m.n, [...(out.get(m.n) ?? []), m]);
  return [...out.values()];
}

/** Why a technique of the description's own struck or placed: its rung, the
 * technique's id or the arm that held, and what it states: a strike's look,
 * or a placement's sentence, a journey's later leg saying its `again`; and
 * the cells whose notes it reasons from that its words do not outline, its
 * `reads` mark (`zoning`'s starved area), which the walk notes first. */
interface OwnReason {
  readonly kind: string;
  readonly premise?: Narration;
  /** Why the strike's sentence runs long, as its wording says (`long:`). */
  readonly long?: string;
  readonly say?: (later: boolean) => Sentence;
  readonly reads?: readonly Point[];
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
/** A stated clause's `{unit}`: the board's unit holding every cell of
 * `cells`, by its noun, a row and a column before a box (`box`, the
 * partition's name) and a diagonal. */
function unitName(sp: GridSpace, box: string, cells: readonly number[]): string {
  const holds = (lines: readonly number[]): boolean =>
    lines.some((L) => cells.every((c) => sp.lineCells[L].includes(c)));
  if (holds(sp.rows)) return "row";
  if (holds(sp.cols)) return "column";
  if (holds(sp.boxes)) return box;
  if (holds(sp.diagonals)) return "diagonal";
  throw new Error("stated clause: {unit} names cells no one unit holds");
}

export function candidateFill<C, Ui extends CandidatePrefsUi>(
  module: CandidateFillModule<C>,
  tierOf: (board: FillBoard<C>) => number,
  uiOf: (board: FillBoard<C>) => Ui,
): CandidateFillHooks<C, Ui> {
  // The description's own techniques, beside the library's, each worded by
  // what it states (`ownLegs`). A step's rung is the arm that held where
  // arms split it, each named for one of its rungs, else its one rung (Keen's
  // `cageEasy` is a `cage`), else its id: what the names say a step by.
  const own = module.ladder
    .filter(
      (e) =>
        !e.id.startsWith("latin.") && !WALKS.has(module.techniques[e.id]?.kind ?? ""),
    )
    .map((e) => e.id);
  const steps = module.STEPS;
  // The steps the description words for the walk, where it words them all.
  const walkSteps =
    steps !== undefined &&
    Object.keys(WALK_STEPS).every((id) => Object.hasOwn(steps, id))
      ? steps
      : null;
  if (
    walkSteps === null &&
    (!rowsAndCols(module.units) || (module.distinctParts?.length ?? 0) > 0)
  )
    throw new Error(
      "a board of notes in more than rows and columns words the walk's steps (`WALK_STEPS`)",
    );
  const kindsOf = (id: string): string[] => {
    const arms = (module.SAYS_KINDS ?? [])
      .filter((k) => k.startsWith(`${id}.`))
      .map((k) => k.slice(id.length + 1));
    return arms.length > 0 ? arms : [module.techniques[id]?.rung ?? id];
  };
  const ownKinds = [...new Set(own.flatMap(kindsOf))];
  // The rungs of the library's strikes the ladder places.
  const libraryKinds = [
    ...new Set(
      module.ladder.flatMap((e) => {
        const kind = LIBRARY_STRIKES[e.id];
        return kind === undefined ? [] : [kind];
      }),
    ),
  ];
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
    ...(module.WORDS?.alongside === undefined
      ? {}
      : { beside: module.WORDS.alongside }),
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
    sp: GridSpace,
  ): Firing<FillMove, CandidateFillHint, Reason> {
    const { w, h } = sp;
    const { says } = f.reasons[0] as Said<unknown, StatedSays>;
    const kind = says.arm ?? module.techniques[id]?.rung ?? id;
    const stated = module.STATED?.[says.arm === undefined ? id : `${id}.${says.arm}`];
    const at = (c: number): Point => ({ x: c % w, y: Math.floor(c / w) });
    const marks = Object.fromEntries(
      Object.entries(says.marks ?? {}).map(([role, els]) => [role, els.map(at)]),
    );
    const reads = marks["reads"];
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
          unit: (els: readonly Point[]) =>
            unitName(
              sp,
              module.boxes?.name ?? "area",
              els.map((p) => p.y * w + p.x),
            ),
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
        ...(reads === undefined ? {} : { reads }),
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
      return {
        strike,
        reason: {
          kind,
          premise: look,
          ...(clauses.long === undefined ? {} : { long: clauses.long }),
          ...(reads === undefined ? {} : { reads }),
        },
      };
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
      caps: capsOf(module, tierOf(board)),
      marks: () => {
        const m = new CellMarks(sp, domain, grid.slice());
        m.placing = ladder.placing;
        m.striking = ladder.striking;
        return m;
      },
      enc: { values: 31 - Math.clz32(domain) },
    };
    const out: HintStep<FillMove, CandidateFillHint, PlanRung<Reason>>[] = [];
    const regions = regionsOf(board, sp);
    const words = walkWords(board);
    runCandidatePlan<FillMove, CandidateFillHint, Reason, FillRegion>({
      w,
      steps: out,
      grid,
      pencil,
      enc: { values: on.enc.values, all: (c) => module.domainOf(sp, board.dealt, c) },
      moves: FILL_CANDIDATE_MOVES,
      reach: reachOf(module, board),
      autoClean,
      reading,
      ...(judging === undefined ? {} : { judging }),
      label: "fill candidate plan",
      regionsOf: (x, y) => regions[y * w + x],
      singleReason: (n, why) =>
        why.kind !== "hidden" || why.region.line !== undefined
          ? singleReasonOf(n, why as Parameters<typeof singleReasonOf>[1])
          : {
              kind: "hiddenSingle",
              n,
              unit: {
                name: why.region.name,
                cells: why.region.cells.map((c) => ({
                  x: c % w,
                  y: Math.floor(c / w),
                })),
              },
            },
      placeWords: (m, reason, continues) => {
        if (!isOwn(reason))
          return {
            words:
              words !== null && reason.kind === "regionsFull"
                ? words.regionsFull(m)
                : narrateLatinReason(reason, m, w, vocab),
          };
        if (reason.say === undefined)
          throw new Error(`${reason.kind} strikes, and places nothing`);
        return { words: reason.say(continues) };
      },
      strikeWords: (marks, reason) => {
        if (!isOwn(reason))
          return words !== null && reason.kind === "dup"
            ? {
                premise: placedRulesOut(reason, numeral, words.cull(reason.n)),
                where: `from the other ${vocab.cell}s`,
              }
            : latinPremise(reason, marks, vocab);
        if (reason.premise === undefined)
          throw new Error(`${reason.kind} places, and strikes nothing`);
        return {
          premise: reason.premise,
          ...(reason.long === undefined ? {} : { long: reason.long }),
          ...(reason.reads === undefined ? {} : { reads: reason.reads }),
        };
      },
      conclude: candidateConclusions({ value: numeral, cell: vocab.cell }),
      notes: {
        populate: populateText(vocab.noun, vocab.cell),
        cleanObvious:
          words?.clean ??
          cleanObviousText(vocab.noun, "standing", "row or column", vocab.cell),
        note: (at, values, every) =>
          words !== null
            ? words.note(at, values, every)
            : noteText(at, values.map(numeral), every, {
                noun: vocab.noun,
                placedVerb: "standing",
                regions: "row or column",
                cell: vocab.cell,
              }),
      },
      // The description's own techniques first: it states them for its
      // clues, which a player reads before a set or a wing. One that places
      // reading no notes is offered before they are set up.
      rungs: [
        // A technique a variation adds is in the ladder of a board with it on.
        ...own
          .filter((id) => on.ladder.entries.some((e) => e.id === id))
          .map((id) =>
            techniqueRung<FillMove, CandidateFillHint, Reason>(
              on,
              id,
              (f) => ownLegs(id, f, sp),
              { leads: module.techniques[id]?.leads === true },
            ),
          ),
        ...latinStrikeRungs<FillMove, CandidateFillHint, Reason, CellMarks>(
          on,
          w,
          (marks, written) => byWrittenCell(marks, written, w),
        ),
      ],
    });
    return out;
  }

  /** Each cell's regions, in the order a hidden single is named by: its
   * units in the description's order, then its part of each partition the
   * rules hold distinct. A region holds every value where its cells' domains
   * hold as many as it has cells. */
  function regionsOf(board: FillBoard<C>, sp: GridSpace): FillRegion[][] {
    const holdsEvery = (cells: readonly number[]): boolean => {
      let held = 0;
      for (const c of cells) held |= module.domainOf(sp, board.dealt, c);
      return popcount(held) === cells.length;
    };
    const box = module.units.find((u) => !LINE_UNITS.has(u)) ?? "";
    const units = sp.units.map((L): FillRegion => {
      const cells = [...sp.lineCells[L]];
      const every = holdsEvery(cells);
      if (L < sp.h) return { line: "row", index: L, cells, holdsEvery: every };
      if (L < sp.h + sp.w)
        return { line: "col", index: L - sp.h, cells, holdsEvery: every };
      const name = sp.diagonals.includes(L) ? "diagonal" : box;
      return { name, cells, holdsEvery: every };
    });
    const unitAt = new Map(sp.units.map((L, k) => [L, units[k]]));
    const parts = (module.distinctParts ?? []).map((name) =>
      (board.dealt[name as keyof C] as Partition).cells.map(
        (cells): FillRegion => ({
          name,
          cells: [...cells],
          holdsEvery: holdsEvery(cells),
        }),
      ),
    );
    return sp.cells.map((c) => [
      ...sp.unitsOf[c].map((L) => unitAt.get(L) as FillRegion),
      ...(module.distinctParts ?? []).map(
        (name, k) => parts[k][(board.dealt[name as keyof C] as Partition).of[c]],
      ),
    ]);
  }

  /** The walk's words the description states for `board`, each told the
   * board's sizes beside its own terms; `null` where it states none, and
   * the walk says a row and a column. */
  function walkWords(board: FillBoard<C>) {
    if (walkSteps === null) return null;
    // Its terms are what `WALK_STEPS` gives each, which the compiler held the
    // description to.
    const voice = stepVoice<Readonly<Record<string, StepType>>, Point>(
      walkSteps as unknown as StepTable<Readonly<Record<string, StepType>>>,
      { kind: CELL, value: numeral, noun: vocab.cell, valueNoun: vocab.noun },
    );
    const dealt = board.dealt as Readonly<Record<string, unknown>>;
    const sizes = Object.fromEntries(
      Object.keys(module.deal?.sizes ?? {}).flatMap((k) =>
        typeof dealt[k] === "number" ? [[k, dealt[k]]] : [],
      ),
    );
    // Each variation the player switches on, a flag by its name.
    const flags = Object.fromEntries(
      (module.deal === undefined ? [] : variationFlags(module.deal)).map((s) => [
        s.id,
        board.variations.includes(s.id),
      ]),
    );
    const said = (ring: readonly Point[], terms: object) => ({
      ring,
      terms: { ...sizes, ...flags, ...terms },
    });
    const sentence = (id: WalkStep, ring: readonly Point[], terms: object): Sentence =>
      voice.sentence(id, said(ring, terms));
    const move = (id: WalkStep, terms: object): string =>
      voice.part(id, "move", said([], terms)).text;
    return {
      clean: cleanStruckText(move("clean", {})),
      note: (at: Point, values: number[], every: boolean): Sentence =>
        sentence("note", [at], { vs: values, unruled: every }),
      cull: (n: number): string => move("cull", { n }),
      regionsFull: (m: Mark): Sentence => sentence("regionsFull", [m], { n: m.n }),
    };
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
    rungs: [...CANDIDATE_FILL_RUNGS, ...libraryKinds, ...ownKinds],
  };
}

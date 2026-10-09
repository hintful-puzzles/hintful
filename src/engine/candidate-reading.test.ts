/**
 * Cross-game guarantee for the "Hints pencil in" preference
 * (`candidate-hint.ts`'s `CandidateReading`): a game that offers it keeps every
 * hint promise under whichever reading the player picks.
 *
 * Every other hint guard walks a game on its **default** reading, because it
 * asks for a hint with no `Ui` and the game fills in its own. That leaves the
 * other reading unwalked, and the two are genuinely different plans: one
 * pencils every candidate in first, the other writes a cell's notes only when a
 * deduction strikes them or rests on them.
 *
 * **The population is derived**: every game whose `newUi` carries a
 * `candidateReading`. Carrying the field is what makes a game offer the choice,
 * so it is also what enrolls it here.
 */
import { describe, expect, it } from "vitest";
import { type CandidateReading, candidateHint } from "./candidate-hint.ts";
import { permitsSearch } from "./difficulty.ts";
import type { Narration } from "./hint-words.ts";
import { dealt } from "./testing/dealt.ts";
import { enrolledIn } from "./testing/enrollment.ts";
import { type AnyGame, HINT_GAMES } from "./testing/hint-games.ts";
import { dealtBoards } from "./testing/presets.ts";
import { itOverWholeSweep } from "./testing/slow.ts";

const READINGS: readonly CandidateReading[] = ["implicit", "populate"];

const OFFERING = enrolledIn((g) => typeof g.ui["candidateReading"] === "string");

const gameOf = (id: string): AnyGame => {
  const entry = HINT_GAMES.find(([g]) => g === id);
  if (!entry) throw new Error(`${id} offers the reading but has no hint`);
  return entry[1];
};

/** Every mode and tier, each on the smallest board offering it. */
const presetsOf = (game: AnyGame) => dealtBoards(game, { scalarEnds: false });

const uiFor = (game: AnyGame, state: unknown, reading: CandidateReading) => ({
  ...(game.newUi(state) as object),
  candidateReading: reading,
});

interface Cell {
  x: number;
  y: number;
}

/**
 * A board as this file reads it: one slot per element with its notes, and
 * whether the element is blank. Every note-taking game keeps its notes in
 * `pencil` (`mark-all.test.ts` reads the same field). A grid game's element is
 * a cell and its entries are `grid`, 0 for blank, with a board that is not
 * square saying its width as `w`; Map's is a region, and its entries are
 * `coloring`, -1 for blank.
 */
interface Board {
  notes: ArrayLike<number>;
  blank(i: number): boolean;
  /** A grid game's cells by index; `null` for Map, whose steps name regions. */
  width: number | null;
}

function boardOf(state: unknown): Board {
  const s = state as {
    grid?: ArrayLike<number>;
    coloring?: ArrayLike<number>;
    pencil: ArrayLike<number>;
    w?: number;
  };
  const { coloring, grid } = s;
  if (coloring) return { notes: s.pencil, blank: (i) => coloring[i] < 0, width: null };
  if (!grid) throw new Error("a board with neither grid nor coloring");
  const w = typeof s.w === "number" ? s.w : Math.sqrt(s.pencil.length);
  if (!Number.isInteger(w)) throw new Error("a board of unknown width");
  return { notes: s.pencil, blank: (i) => grid[i] === 0, width: w };
}

/**
 * What a step does to the notes, read off the board before and after it
 * rather than off the move: `fill` adds notes to several elements and nothing
 * else (the populate), `note` adds them to one (the implicit reading's note
 * leg), `strike` only removes. Map's moves are op lists with no `type` or
 * `kind` to read, and the board asks every game the same question.
 */
type Effect = "fill" | "note" | "strike" | "other";

function effectOf(before: unknown, after: unknown): Effect {
  const a = boardOf(before);
  const b = boardOf(after);
  let added = 0;
  let removed = false;
  for (let i = 0; i < a.notes.length; i++) {
    if (a.blank(i) !== b.blank(i)) return "other";
    if (b.notes[i] & ~a.notes[i]) added++;
    if (a.notes[i] & ~b.notes[i]) removed = true;
  }
  if (removed) return added === 0 ? "strike" : "other";
  return added > 1 ? "fill" : added === 1 ? "note" : "other";
}

/**
 * The elements a step reasons from whose notes must be on the board when it
 * is spoken: what it outlines, what it reads, and what it strikes from. Setup
 * rests on nothing, and a placement's or a note step's own element is what it
 * fills; a note leg outlines nothing, but a strike folded into the notes it
 * leaves (`candidate-plan.ts`'s `fold`) outlines its evidence like any strike.
 *
 * Map's evidence is the pair or chain a narrowing rests on. A step whose own
 * target is one of those regions is writing that premise, not reasoning from
 * it: its sentence reads the target's neighbors' colors, and the outline is
 * context for what follows.
 */
function premiseOf(
  board: Board,
  step: { highlights?: unknown; words?: Narration },
  effect: Effect,
): readonly number[] {
  if (effect === "fill") return [];
  const strikes = effect === "strike";
  if (board.width === null) {
    const h = step.highlights as { targets: number[] };
    // Map's outlined regions are its words' (`map/hint-text.ts`'s REGION).
    const outlined = (step.words?.refs ?? [])
      .filter((r) => r.role === "outline" && r.kind.name === "region")
      .flatMap((r) =>
        (r.elements as readonly { region: number }[]).map((e) => e.region),
      );
    if (h.targets.some((r) => outlined.includes(r))) return strikes ? h.targets : [];
    return [...outlined, ...(strikes ? h.targets : [])];
  }
  const w = board.width;
  const h = step.highlights as
    | { area?: Cell[]; reads?: Cell[]; targets?: Cell[] }
    | undefined;
  if (!h) return [];
  const rows = board.notes.length / w;
  const at = (c: Cell): number => c.y * w + c.x;
  // A step that writes or places its targets is not reasoning from them, even
  // where its evidence covers them (a cage it reads whole).
  const own = strikes ? [] : (h.targets ?? []).map(at);
  return [...(h.area ?? []), ...(h.reads ?? []), ...(strikes ? (h.targets ?? []) : [])]
    .filter((c) => c.x >= 0 && c.y >= 0 && c.x < w && c.y < rows)
    .map(at)
    .filter((i) => !own.includes(i));
}

/** The blank elements of `premise` on `state`, each with whether it carries
 * notes. */
function blanks(state: unknown, step: { highlights?: unknown }, effect: Effect) {
  const board = boardOf(state);
  return premiseOf(board, step, effect)
    .filter((i) => board.blank(i))
    .map((i) => ({ element: i, noted: board.notes[i] !== 0 }));
}

/** Premise cells checked while blank, per reading: the vacuity count for the
 * premise check, which passes over nothing on a plan that never reasons from a
 * blank cell. */
const blankPremises: Record<CandidateReading, number> = { implicit: 0, populate: 0 };

/** Plans that took their own reading's setup, per reading: the vacuity count
 * for the setup check, which reads effects off the board and would agree about
 * a board reader that saw none. */
const seenSetUp: Record<CandidateReading, number> = { implicit: 0, populate: 0 };

/**
 * A hint asked for with no `Ui`, beside the one asked for with the game's own
 * fresh `Ui`. `candidateHint` given no `Ui` reads
 * `DEFAULT_CANDIDATE_READING`, so the two agree only where the game's `hint`
 * supplies its own `newUi` or starts on the convention.
 */
function withAndWithoutUi(
  game: Pick<AnyGame, "hint" | "newUi">,
  state: unknown,
  aux?: string,
) {
  // What the player is shown and what is played, step by step. A plan's steps
  // also carry closures, which no two builds of the same plan share.
  const shown = (res?: ReturnType<NonNullable<AnyGame["hint"]>>) =>
    res?.ok
      ? res.steps.map((s) => JSON.stringify([s.rung, s.explanation, s.move]))
      : null;
  return {
    bare: shown(game.hint?.(state, aux)),
    own: shown(game.hint?.(state, aux, game.newUi(state))),
  };
}

describe("a hint asked for with no Ui", () => {
  it("differs from the game's own where a hint drops the Ui it was not given", () => {
    // The defect the cases below exist for, on a game made to have it.
    const dropsIt: Pick<AnyGame, "hint" | "newUi"> = {
      newUi: () => ({ candidateReading: "implicit" }),
      hint: (
        state: unknown,
        _aux?: string,
        ui?: { candidateReading: CandidateReading },
      ) =>
        candidateHint(state, ui ?? null, (_state, prefs) => [
          { move: null, rung: "only", explanation: prefs.reading },
        ]),
    };
    const { bare, own } = withAndWithoutUi(dropsIt, {});
    expect(bare).not.toEqual(own);
  });

  for (const id of OFFERING.ids) {
    it(`${id}: is the hint its own fresh Ui gets`, () => {
      const game = gameOf(id);
      const [{ params }] = presetsOf(game);
      const { desc, aux } = dealt(game, params);
      const { bare, own } = withAndWithoutUi(game, game.newState(params, desc), aux);
      expect(own?.length, `${id} refuses its first board`).toBeGreaterThan(0);
      expect(bare).toEqual(own);
    });
  }
});

describe("the hint-notes preference", () => {
  it("is offered by a derived population, each member with a hint and the pref", () => {
    // The vacuity guard: the registry the filter read, and the filter's catch.
    expect(OFFERING.population).toBeGreaterThanOrEqual(40);
    expect(OFFERING.ids.length).toBeGreaterThan(0);
    for (const id of OFFERING.ids) {
      const game = gameOf(id);
      // A reading the player cannot choose is a default nobody can change.
      expect(
        game.prefs?.some((p: { kw: string }) => p.kw === "hint-notes"),
        `${id} carries candidateReading but offers no hint-notes preference`,
      ).toBe(true);
    }
  });

  for (const id of OFFERING.ids) {
    const game = gameOf(id);
    describe(`${id}: every preset`, () => {
      for (const { title, params } of presetsOf(game)) {
        for (const reading of READINGS) {
          it(`${title}, ${reading}: every step is live and its premise noted when shown, and the plan finishes`, () => {
            const { desc, aux } = dealt(game, params);
            let state = game.newState(params, desc);
            const res = game.hint?.(state, aux, uiFor(game, state, reading));
            if (!res?.ok) {
              // A tier that allows trial and error may need it from the first
              // move: Group's Unreasonable 6x6 does on most boards.
              expect(
                permitsSearch(game, params),
                `${title}: refused on a fresh board`,
              ).toBe(true);
              return;
            }
            const effects = new Set<Effect>();
            for (const step of res.steps) {
              // Refreshing a step against the board it is about to be shown on
              // changes nothing: no strike of a note the board lacks, no note
              // step for a note already written, no placement in a filled cell.
              expect(game.refreshHintStep?.(step, state), step.explanation).toBe(step);
              const next = game.executeMove(state, step.move);
              const effect = effectOf(state, next);
              effects.add(effect);
              // Every blank element the step reasons from shows its notes: the
              // premise is on the board, not left to be worked out
              // (docs/games/hints.md § "Two readings of an unmarked cell").
              const blank = blanks(state, step, effect);
              blankPremises[reading] += blank.length;
              expect(
                blank.filter((c) => !c.noted),
                step.explanation,
              ).toEqual([]);
              state = next;
            }
            // Each reading's own setup, and never the other's.
            expect(effects.has(reading === "implicit" ? "fill" : "note")).toBe(false);
            seenSetUp[reading] += effects.has(reading === "implicit" ? "note" : "fill")
              ? 1
              : 0;
            if (!permitsSearch(game, params)) expect(game.status(state)).toBe("solved");
          });
        }
        it(`${title}: resumes from every position under the other reading`, () => {
          // The default reading is `hint-resume.test.ts`'s walk; this is its
          // twin for the reading the player may switch to.
          const { desc, aux } = dealt(game, params);
          let state = game.newState(params, desc);
          const other = READINGS.find((r) => r !== game.newUi(state).candidateReading);
          if (!other) throw new Error("two readings");
          for (let moves = 0; moves < 800; moves++) {
            if (game.status(state) === "solved") return;
            const res = game.hint?.(state, aux, uiFor(game, state, other));
            if (!res?.ok) {
              expect(permitsSearch(game, params), `gave up after ${moves} moves`).toBe(
                true,
              );
              return;
            }
            state = game.executeMove(state, res.steps[0].move);
          }
          throw new Error(`${title}: did not converge`);
        });
      }
    });
  }

  itOverWholeSweep("checked a blank premise cell under each reading", () => {
    // Runs after the walks above, in file order. Under the implicit reading
    // these are the cells a note leg wrote; under the populate reading, cells
    // the populate did.
    expect(blankPremises.implicit).toBeGreaterThan(0);
    expect(blankPremises.populate).toBeGreaterThan(0);
    expect(seenSetUp.implicit).toBeGreaterThan(0);
    expect(seenSetUp.populate).toBeGreaterThan(0);
  });
});

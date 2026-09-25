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
import type { CandidateReading } from "./candidate-hint.ts";
import { permitsSearch } from "./difficulty.ts";
import { randomNew } from "./random/index.ts";
import { enrolledIn } from "./testing/enrollment.ts";
import {
  type AnyGame,
  axisSlice,
  HINT_GAMES,
  leafPresets,
} from "./testing/hint-games.ts";

const READINGS: readonly CandidateReading[] = ["implicit", "populate"];

const OFFERING = enrolledIn((g) => typeof g.ui["candidateReading"] === "string");

const gameOf = (id: string): AnyGame => {
  const entry = HINT_GAMES.find(([g]) => g === id);
  if (!entry) throw new Error(`${id} offers the reading but has no hint`);
  return entry[1];
};

/** Every mode and tier, each on the smallest board offering it. */
const presetsOf = (game: AnyGame) =>
  axisSlice(game, leafPresets(game.presets()), { scalarEnds: false });

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
 * and note steps rest on nothing, and a placement's own element is what it
 * fills.
 *
 * Map's evidence is the pair or chain a narrowing rests on. A step whose own
 * target is one of those regions is writing that premise, not reasoning from
 * it: its sentence reads the target's neighbors' colors, and the outline is
 * context for what follows.
 */
function premiseOf(
  board: Board,
  step: { highlights?: unknown },
  effect: Effect,
): readonly number[] {
  if (effect === "fill" || effect === "note") return [];
  const strikes = effect === "strike";
  if (board.width === null) {
    const h = step.highlights as { targets: number[]; evidence: { region: number }[] };
    const outlined = h.evidence.map((e) => e.region);
    if (h.targets.some((r) => outlined.includes(r))) return strikes ? h.targets : [];
    return [...outlined, ...(strikes ? h.targets : [])];
  }
  const w = board.width;
  const h = step.highlights as
    | { area?: Cell[]; reads?: Cell[]; targets?: Cell[] }
    | undefined;
  if (!h) return [];
  const rows = board.notes.length / w;
  return [...(h.area ?? []), ...(h.reads ?? []), ...(strikes ? (h.targets ?? []) : [])]
    .filter((c) => c.x >= 0 && c.y >= 0 && c.x < w && c.y < rows)
    .map((c) => c.y * w + c.x);
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
    describe(id, () => {
      for (const { title, params } of presetsOf(game)) {
        for (const reading of READINGS) {
          it(`${title}, ${reading}: every step is live and its premise noted when shown, and the plan finishes`, () => {
            const { desc, aux } = game.newDesc(params, randomNew(`reading-${title}`));
            let state = game.newState(params, desc);
            const res = game.hint?.(state, aux, uiFor(game, state, reading));
            if (!res?.ok) throw new Error(`${title}: refused on a fresh board`);
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
          const { desc, aux } = game.newDesc(params, randomNew(`resume-${title}`));
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

  it("checked a blank premise cell under each reading", () => {
    // Runs after the walks above, in file order. Under the implicit reading
    // these are the cells a note leg wrote; under the populate reading, cells
    // the populate did.
    expect(blankPremises.implicit).toBeGreaterThan(0);
    expect(blankPremises.populate).toBeGreaterThan(0);
    expect(seenSetUp.implicit).toBeGreaterThan(0);
    expect(seenSetUp.populate).toBeGreaterThan(0);
  });
});

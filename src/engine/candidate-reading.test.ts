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

const moveKind = (m: unknown): string => {
  const o = m as { type?: string; kind?: string };
  return o.type ?? o.kind ?? "";
};

interface Cell {
  x: number;
  y: number;
}

/**
 * The cells a step reasons from whose notes must be on the board when it is
 * spoken: what it outlines, what it reads, and what it strikes from. Setup and
 * note steps rest on nothing, and a placement's own cell is what it fills.
 */
function premiseCells(step: { move: unknown; highlights?: unknown }): readonly Cell[] {
  const kind = moveKind(step.move);
  if (kind === "pencilAll" || kind === "pencilAdd") return [];
  const h = step.highlights as
    | { area?: Cell[]; reads?: Cell[]; targets?: Cell[] }
    | undefined;
  if (!h) return [];
  return [
    ...(h.area ?? []),
    ...(h.reads ?? []),
    ...(kind === "pencilStrike" ? (h.targets ?? []) : []),
  ];
}

/**
 * The blank cells of `cells` on `state`, each with whether it carries notes.
 * Every note-taking game keeps its notes in `pencil` and its entries in `grid`,
 * one slot per cell with 0 for blank (`mark-all.test.ts` reads the same field);
 * a board that is not square says its width as `w`.
 */
function blanks(state: unknown, cells: readonly Cell[]): (Cell & { noted: boolean })[] {
  const s = state as { grid: ArrayLike<number>; pencil: ArrayLike<number>; w?: number };
  const w = typeof s.w === "number" ? s.w : Math.sqrt(s.pencil.length);
  if (!Number.isInteger(w)) throw new Error("a board of unknown width");
  const h = s.pencil.length / w;
  return cells
    .filter((c) => c.x >= 0 && c.y >= 0 && c.x < w && c.y < h)
    .filter((c) => s.grid[c.y * w + c.x] === 0)
    .map((c) => ({ ...c, noted: s.pencil[c.y * w + c.x] !== 0 }));
}

/** Premise cells checked while blank, per reading: the vacuity count for the
 * premise check, which passes over nothing on a plan that never reasons from a
 * blank cell. */
const blankPremises: Record<CandidateReading, number> = { implicit: 0, populate: 0 };

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
            const kinds = res.steps.map((s: { move: unknown }) => moveKind(s.move));
            // Each reading's own setup move, and never the other's.
            expect(
              kinds.includes(reading === "implicit" ? "pencilAll" : "pencilAdd"),
            ).toBe(false);
            for (const step of res.steps) {
              // Refreshing a step against the board it is about to be shown on
              // changes nothing: no strike of a note the board lacks, no note
              // step for a note already written, no placement in a filled cell.
              expect(game.refreshHintStep?.(step, state), step.explanation).toBe(step);
              // Every blank cell the step reasons from shows its notes: the
              // premise is on the board, not left to be worked out
              // (docs/games/hints.md § "Two readings of an unmarked cell").
              const blank = blanks(state, premiseCells(step));
              blankPremises[reading] += blank.length;
              expect(
                blank.filter((c) => !c.noted),
                step.explanation,
              ).toEqual([]);
              state = game.executeMove(state, step.move);
            }
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
  });
});

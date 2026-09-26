/**
 * Cross-game guarantee: **the Mark-all press only ever adds or removes pencil
 * marks — it never resets them.**
 *
 * This exists because the collection shipped the opposite for months and nothing
 * caught it. Every `pencilAll` implementation filled *every* empty cell with the
 * full candidate set, so pressing Mark-all (or asking for a hint, whose opener
 * reuses the same move) on a board with **some** narrowed cells and **some** blank
 * ones threw away the player's own deductions. It went unnoticed because the
 * usual latch — "does any empty cell lack notes?" — hides it whenever every empty
 * cell already has at least one note, which is the common case; you only see it on
 * the mixed board. Owner-reported on Salad, twice (the hint's opener, then the
 * button), and then fixed across all ten games that offer the press.
 *
 * The properties pinned here are deliberately representation-agnostic, and a new
 * game with a Mark-all press joins by **shipping the press** — the roster is
 * derived from `canMarkAll` and the notes are read through the one field name
 * every note-taking game uses. Each game used to write a row here saying where
 * its notes lived, because the collection spelled that field three ways; that
 * ended with `unify-the-note-taking-vocabulary`.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { UI_UPDATE } from "./game.ts";
import { randomNew } from "./random/index.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import { driveMidend } from "./testing/drive-midend.ts";
import { type AnyGame, gatePresets } from "./testing/hint-games.ts";
import { preferredDrawState } from "./testing/preferred-draw-state.ts";

// Registers every ported game; `beforeAll` re-runs it in case a sibling file
// reset the shared registry under `isolate: false`.
beforeAll(registerAllGames);

interface Row {
  name: string;
  game: AnyGame;
}

/**
 * Every game answering `canMarkAll` — **derived, not written down**.
 *
 * This was ten hand-written rows, each naming the game *and* the field its notes
 * lived in, because the collection spelled that field three ways (`pencil`,
 * `marks`, `pencils`). `unify-the-note-taking-vocabulary` made it one word, and
 * the roster went with it: a game shipping the press is guarded here the day it
 * ships, and a row can no longer be forgotten.
 *
 * The enrollment check this replaces compared the roster with the flag. Now that
 * the roster *is* the flag, that comparison is a tautology and asserts nothing;
 * the real question — does the flag match what the game *does* — is the
 * behavioral check below, which is where it belonged all along.
 */
const MARK_ALL_GAMES: Row[] = registeredGameIds()
  .sort()
  .filter((id) => getTsGame(id)?.canMarkAll === true)
  .map((id) => ({ name: id, game: getTsGame(id) as AnyGame }));

/** Every note-taking game keeps its candidates in `pencil`, one bitmask per
 * cell, so the probe reads one field rather than being told where to look, per
 * game. A game storing one flag per candidate instead would fail the narrowing
 * test below, which looks for a cell word holding two candidates. */
// biome-ignore lint/suspicious/noExplicitAny: a deliberately game-agnostic probe.
const notesOf = (state: any): Int32Array | Uint8Array | Uint16Array => state.pencil;

it("drew a populated roster, and every member keeps its notes in `pencil`", () => {
  // Vacuity: an empty registry yields an empty roster, and every `it()` built
  // from it below simply never runs — which `--passWithNoTests` reports green.
  expect(MARK_ALL_GAMES.length).toBeGreaterThan(5);
  // Every enrolled game really does keep its notes under the shared noun — on
  // every board the gate slice offers.
  for (const row of MARK_ALL_GAMES) {
    for (const { title, params } of gatePresets(row.name, row.game)) {
      const { desc } = row.game.newDesc(
        params,
        randomNew(`slots-${row.name}-${title}`),
      );
      const notes = notesOf(row.game.newState(params, desc));
      expect(
        ArrayBuffer.isView(notes),
        `${row.name}/${title} offers Mark-all but has no \`pencil\` notes array`,
      ).toBe(true);
    }
  }
});

it("every game declaring the press answers it, and no other game does", () => {
  /*
   * **The declaration held to the behavior**, which the check above does not do:
   * it compares the roster with the flag, so a flag that lies agrees with a
   * roster that repeats the lie. `canMarkAll` decides whether the toolbar shows
   * a Mark-all button (`components/history.ts`), so a game declaring it without
   * answering `M` ships a dead button, and a game answering `M` without
   * declaring it hides a press it handles.
   *
   * This is `Game.ignoresSecondaryButton`'s pattern — derive the fact, hold the
   * declaration to it (`input-parity.test.ts`) — applied to the last of the
   * contract's three boolean declarations.
   *
   * Probed through `interpretMove` rather than the midend, and that distinction
   * is load-bearing: `Midend.processInput` reports a bare `UI_UPDATE` as
   * consumed, and Ascent returns one for *any* button landing inside its grid,
   * so the midend route names eleven games where ten offer the press.
   *
   * **It is the expensive half of this file and the cost is generation**, not
   * the press: 0.2 s → 19.8 s of the file's 26.2 s when the walk went from one
   * board per registered game to the gate slice's 227 (measured 2026-09-20,
   * load 5.7, the box 18.4 GB into swap — an upper bound). Nearly all of it is
   * one largest board per game, and about half is three games' generators.
   * Paid rather than sliced further, because a press that is dead on a large
   * board is exactly the defect a small one cannot see, and because a
   * per-guard variant of the slice is the thing `gatePresets` exists to stop.
   * The file is not near the gate's critical path.
   */
  const ids = registeredGameIds().sort();
  expect(ids.length, "an empty registry would agree with anything").toBeGreaterThan(50);

  const declared: string[] = [];
  const answers: string[] = [];
  let boards = 0;
  for (const id of ids) {
    const game = getTsGame(id) as AnyGame | undefined;
    if (!game) continue;
    if (game.canMarkAll === true) declared.push(id);
    // **Every board the gate slice offers, not the easiest one.** The flag is
    // per game but the answer need not be: a game whose `interpretMove` reads
    // the press behind a size or mode test would ship a button that works on
    // some presets and is dead on the others, and one board could not tell.
    // Group is the near miss that makes the point — it intercepts *uppercase*
    // 'M' ahead of its value keys precisely because lowercase 'm' is its
    // element 13 once `w >= 13`, which is a preset, not a hypothesis.
    const answeredOn: string[] = [];
    const presets = gatePresets(id, game);
    for (const { title, params } of presets) {
      const { desc } = game.newDesc(params, randomNew(`mark-all-${id}-${title}`));
      const state = game.newState(params, desc);
      boards++;
      const move = game.interpretMove(
        state,
        game.newUi(state),
        preferredDrawState(game, state),
        { x: 0, y: 0 },
        77, // 'M', exactly what the toolbar button injects.
      );
      if (move !== null && move !== UI_UPDATE) answeredOn.push(title);
    }
    // All or none: a game that answers on some presets and not others is the
    // dead-button case above, and it fails here by joining `answers` while
    // (if declared) also being named below.
    expect(
      answeredOn.length === 0 || answeredOn.length === presets.length,
      `${id} answers 'M' on ${answeredOn.length} of its ${presets.length} sliced presets (${answeredOn.join(", ")}) — the toolbar button is dead on the rest`,
    ).toBe(true);
    if (answeredOn.length > 0) answers.push(id);
  }
  expect(
    answers.length,
    "no game answered M — the probe found nothing",
  ).toBeGreaterThan(5);
  // The "how many did I look at?" guard, now that the count is a slice rather
  // than one board per game: a `gatePresets` that flattened to nothing would
  // leave the comparison below agreeing about two empty lists.
  expect(boards, "the slice yielded almost no boards").toBeGreaterThan(150);
  expect(
    answers,
    "canMarkAll disagrees with what the game does with an 'M' press — a " +
      "declared game with no answer ships a dead toolbar button, and an " +
      "undeclared one hides a press it handles",
  ).toEqual(declared);
});

/** Press `M` — ASCII **77**, exactly what the toolbar button injects
 * (`puzzle-history.ts` `handleMarkAll`) — and apply whatever it asks for. Returns
 * the new state, or `null` when the press is a true no-op.
 *
 * Uppercase matters: Group intercepts only `'M'`, because lowercase `'m'` is its
 * element 13 for `w >= 13`. Probing with 109 there enters a value instead. */
function press(
  row: Row,
  // biome-ignore lint/suspicious/noExplicitAny: game-agnostic probe.
  state: any,
  // biome-ignore lint/suspicious/noExplicitAny: game-agnostic probe.
  ui: any,
  // biome-ignore lint/suspicious/noExplicitAny: game-agnostic probe.
): any | null {
  const move = row.game.interpretMove(
    state,
    ui,
    preferredDrawState(row.game, state),
    { x: 0, y: 0 },
    77,
  );
  if (move === null || move === UI_UPDATE) return null;
  return row.game.executeMove(state, move);
}

// biome-ignore lint/suspicious/noExplicitAny: game-agnostic probe.
function board(row: Row, params: any, seed: string): { state: any; ui: any } {
  const { desc } = row.game.newDesc(params, randomNew(seed));
  const state = row.game.newState(params, desc);
  return { state, ui: row.game.newUi(state) };
}

describe("the chrome can tell a bare board from a marked one", () => {
  /**
   * `Midend` reports `hasPencilMarks` on every state change, and the Mark-all
   * control reads it to say `Fill` or `Update`. It is computed **generically**,
   * off the shared `pencil` field, rather than asked of each game — so what has
   * to be true is that the generic read tracks the press in every game that
   * offers it. A game whose notes moved somewhere else would report a
   * permanently bare board and the label would silently freeze on `Fill`.
   */
  for (const row of MARK_ALL_GAMES) {
    it(`${row.name}: reports no marks on a fresh board, and marks after a press`, () => {
      const d = driveMidend(row.game);
      const m = d.midend;
      const marked = () => d.last("game-state-change")?.hasPencilMarks;
      m.newGame();
      expect(marked(), `${row.name}: a fresh board has no pencil marks`).toBe(false);

      // 'M' (77) is the Mark-all press the chrome injects.
      expect(m.processInput(0, 0, 77), `${row.name}: the press did nothing`).toBe(true);
      expect(
        marked(),
        `${row.name}: pencil marks were written but the board still reports none`,
      ).toBe(true);
    });
  }
});

describe("the Mark-all press converges", () => {
  for (const row of MARK_ALL_GAMES) {
    it(`${row.name}: repeated presses reach a true no-op`, () => {
      // Fill, then clean, then nothing — a further press must add no undo entry
      // at all rather than re-applying a move that changes nothing.
      //
      // Every board the gate slice offers: what a fill has to clean is the
      // *obvious* candidates, and which candidates are obvious is a mode
      // question — Solo's Killer cages and X diagonals cull on top of the rows,
      // columns and blocks, and no board this walked before had either.
      for (const { title, params } of gatePresets(row.name, row.game)) {
        const at = `${row.name}/${title}`;
        const { state, ui } = board(row, params, `markall-${at}`);
        let cur = state;
        let presses = 0;
        for (; presses < 6; presses++) {
          const next = press(row, cur, ui);
          if (next === null) break;
          cur = next;
        }
        expect(presses, `${at}: did not converge`).toBeLessThan(6);
        expect(press(row, cur, ui), `${at}: a further press is not a no-op`).toBeNull();
      }
    });
  }
});

describe("the Mark-all press never resets a note the player narrowed", () => {
  for (const row of MARK_ALL_GAMES) {
    it(`${row.name}: a fill leaves every already-noted cell bit-for-bit alone`, () => {
      // Every board the gate slice offers. The regression this pins was a fill
      // that *rewrote* every empty cell, and whether a game's fill rewrites or
      // adds is decided in the same code that decides what a cage, an X
      // diagonal or a jigsaw block culls — Solo has three such modes and this
      // used to walk a 4x4 board of none of them.
      for (const { title, params } of gatePresets(row.name, row.game)) {
        const at = `${row.name}/${title}`;
        const { state, ui } = board(row, params, `narrow-${at}`);

        // Run the press to convergence, so every fillable cell carries notes.
        let cur = state;
        for (let i = 0; i < 6; i++) {
          const next = press(row, cur, ui);
          if (next === null) break;
          cur = next;
        }

        // Reproduce the reported board: one cell **narrowed** by hand, a *different*
        // one blank, so the press has something to fill and something to spare.
        //
        // Poking the arrays directly is deliberate. The point is to build the state
        // shape, not the route to it — the per-cell pencil toggle differs in every
        // game, and `cur` is a fresh clone from `executeMove`, so nothing shared is
        // mutated. Note the *narrowing* is what makes this test bite: with no
        // narrowed cell, a resetting fill writes back exactly what was there and the
        // bug hides (which it did in the first cut of this test — Towers has no
        // givens, so its clean press strikes nothing and every cell keeps its full
        // candidate set).
        const notes = notesOf(cur);
        const narrowed = notes.findIndex((v) => v !== 0 && (v & (v - 1)) !== 0);
        expect(
          narrowed,
          `${at}: no cell had two candidates to narrow between`,
        ).toBeGreaterThanOrEqual(0);
        notes[narrowed] &= notes[narrowed] - 1; // clear its lowest candidate

        const blank = notes.findIndex((v, i) => i !== narrowed && v !== 0);
        expect(blank, `${at}: no second noted cell to blank`).toBeGreaterThanOrEqual(0);
        notes[blank] = 0;
        const before = Array.from(notes);

        const after = press(row, cur, ui);
        expect(after, `${at}: the press did not refill the blank cell`).not.toBeNull();
        const filled = Array.from(notesOf(after));

        // The blank cell is filled again…
        expect(filled[blank], `${at}: the note-less cell was not refilled`).not.toBe(0);
        // …and every other cell is untouched — in particular the narrowed one keeps
        // the candidate it lost. This is the whole regression: a resetting fill
        // widens every narrowed cell back to its full set.
        for (let i = 0; i < before.length; i++) {
          if (i === blank) continue;
          expect(
            filled[i],
            `${at}: the fill changed an already-noted cell at index ${i}`,
          ).toBe(before[i]);
        }
      }
    });
  }
});

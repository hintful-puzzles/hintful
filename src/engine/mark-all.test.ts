/**
 * Cross-game guarantee: **the Mark-all press only ever adds or removes pencil
 * marks — it never resets them.**
 *
 * A `pencilAll` that fills *every* empty cell with the full candidate set makes
 * pressing Mark-all (or asking for a hint, whose opener reuses the same move) on
 * a board with **some** narrowed cells and **some** blank ones throw away the
 * player's own deductions. The usual latch — "does any empty cell lack notes?" —
 * hides that whenever every empty cell already has at least one note, which is
 * the common case; you only see it on the mixed board, so that is the board
 * these properties are pinned on.
 *
 * The properties pinned here are deliberately representation-agnostic, and a new
 * game with a Mark-all press joins by **shipping the press** — the roster is
 * derived from `markAll` and the notes are read through the one field name
 * every note-taking game uses.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { CURSOR_RIGHT, MARK_ALL_BUTTON } from "./pointer.ts";
import { randomNew } from "./random/index.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import { dealt } from "./testing/dealt.ts";
import { driveMidend } from "./testing/drive-midend.ts";
import { type AnyGame, gatePresets } from "./testing/hint-games.ts";
import { itOverWholeSweep } from "./testing/slow.ts";

// Registers every ported game; `beforeAll` re-runs it in case a sibling file
// reset the shared registry under `isolate: false`.
beforeAll(registerAllGames);

interface Row {
  name: string;
  game: AnyGame;
}

/**
 * Every game with a `markAll` — **derived, not written down**, so a game
 * shipping the press is guarded here the day it ships, and no row can be
 * forgotten. Every note-taking game keeps its notes in the one `pencil` field.
 *
 * The roster *is* the flag, so comparing the two would assert nothing; the
 * real question — does the flag match what the game *does* — is the
 * behavioral check below.
 */
const MARK_ALL_GAMES: Row[] = registeredGameIds()
  .sort()
  .filter((id) => getTsGame(id)?.markAll !== undefined)
  .map((id) => ({ name: id, game: getTsGame(id) as AnyGame }));

/** Every note-taking game keeps its candidates in `pencil`, one bitmask per
 * cell (Abcd's letters included), so the probe reads one field rather than
 * being told where to look, per game. The narrowing test below depends on that
 * layout: it looks for a cell word holding two candidates. */
// biome-ignore lint/suspicious/noExplicitAny: a deliberately game-agnostic probe.
const notesOf = (state: any): Int32Array | Uint8Array | Uint16Array => state.pencil;

it("drew a populated roster", () => {
  // Vacuity: an empty registry yields an empty roster, and every `it()` built
  // from it below simply never runs — which `--passWithNoTests` reports green.
  expect(MARK_ALL_GAMES.length).toBeGreaterThan(5);
});

// Every enrolled game really does keep its notes under the shared noun — on
// every board the gate slice offers.
for (const row of MARK_ALL_GAMES) {
  it(`${row.name}: keeps its notes in \`pencil\``, () => {
    for (const { title, params } of gatePresets(row.name, row.game)) {
      const { desc } = dealt(row.game, params);
      const notes = notesOf(row.game.newState(params, desc));
      expect(
        ArrayBuffer.isView(notes),
        `${row.name}/${title} offers Mark-all but has no \`pencil\` notes array`,
      ).toBe(true);
    }
  });
}

describe("the press is the engine's, whatever a game types with M", () => {
  /*
   * **The control is the hook.** `Game.markAll` decides whether the Game
   * controls show Fill marks, and the midend calls it, so a game cannot have
   * the button and not answer it. What is left to hold is the midend's half:
   * that the button makes the hook's move on every board and types nothing,
   * and that the letter does the same exactly where the board's keypad has no
   * such letter.
   *
   * The shapes it catches: a button that types the letter, so it enters a
   * number in the selected square of a Solo grid large enough that M is a
   * number, and a letter matched by case, so Group answers a capital M only on
   * boards with no element m at all.
   *
   * Every board the gate slice offers. The cost is generation, which `dealt`
   * shares with every other sweep.
   *
   * One case per game, so a commit touching one game walks only that game's
   * boards (`GATE_GAME_SCOPE` in `testing/game-scope.ts`).
   */
  let boards = 0;

  /** A midend on the dealt board of `params`, its cursor shown by an arrow so
   * a key that types has somewhere to type. */
  const onBoard = (row: Row, params: unknown) => {
    const m = driveMidend(row.game).midend;
    const id = `${row.game.encodeParams(params, true)}:${dealt(row.game, params).desc}`;
    expect(m.newGameFromId(id), id).toBeNull();
    m.processInput(0, 0, CURSOR_RIGHT);
    return m;
  };
  /** Everything a save holds: the moves made, and the `Ui` they left. */
  const saved = (m: { saveGame(): Uint8Array }) =>
    new TextDecoder().decode(m.saveGame());

  for (const row of MARK_ALL_GAMES) {
    it(`${row.name}: the button fills, and M does exactly where no key is M`, () => {
      for (const { title, params } of gatePresets(row.name, row.game)) {
        const at = `${row.name}/${title}`;
        boards++;
        const fresh = row.game.newState(params, dealt(row.game, params).desc);
        const hooked = onBoard(row, params);
        hooked.playMoves([row.game.markAll?.(fresh)]);

        const button = onBoard(row, params);
        expect(button.processInput(0, 0, MARK_ALL_BUTTON), `${at}: the button`).toBe(
          true,
        );
        expect(saved(button), `${at}: the button made another move`).toBe(
          saved(hooked),
        );

        const keys = row.game.requestKeys?.(params) ?? [];
        const typesM = keys.some((k) => k.button === 77 || k.button === 109);
        for (const letter of [77, 109]) {
          const m = onBoard(row, params);
          m.processInput(0, 0, letter);
          if (typesM) {
            expect(
              saved(m),
              `${at}: key ${letter} filled, where M is a value`,
            ).not.toBe(saved(hooked));
          } else {
            expect(saved(m), `${at}: key ${letter} did not fill`).toBe(saved(hooked));
          }
        }
      }
    });
  }

  // No board of the gate's slice has M on its keypad (Solo needs 22 numbers and
  // Group 13 elements), so the arm above for one is reached only by the slow
  // tier. `midend.test.ts`, "the Mark-all press", holds that arm on a game
  // made for it.
  itOverWholeSweep("walked enough boards to mean something", () => {
    expect(boards, "the slice yielded almost no boards").toBeGreaterThan(40);
  });
});

/** Make the Mark-all press on `state`: the move the game's hook gives, applied.
 * Returns the new state, or `null` when the press is a true no-op. */
// biome-ignore lint/suspicious/noExplicitAny: game-agnostic probe.
function press(row: Row, state: any): any | null {
  const move = row.game.markAll?.(state) ?? null;
  return move === null ? null : row.game.executeMove(state, move);
}

// biome-ignore lint/suspicious/noExplicitAny: game-agnostic probe.
function board(row: Row, params: any, seed: string): { state: any } {
  const { desc } = row.game.newDesc(params, randomNew(seed));
  const state = row.game.newState(params, desc);
  return { state };
}

describe("the chrome can tell a bare board from a marked one", () => {
  /**
   * `Midend` reports `hasPencilMarks` on every state change, and the Mark-all
   * control reads it to say `Fill` or `Update`. It is computed **generically**,
   * off the shared `pencil` field, rather than asked of each game — so what has
   * to be true is that the generic read tracks the press in every game that
   * offers it. A game keeping its notes somewhere else would report a
   * permanently bare board and the label would silently freeze on `Fill`.
   */
  for (const row of MARK_ALL_GAMES) {
    it(`${row.name}: reports no marks on a fresh board, and marks after a press`, () => {
      const d = driveMidend(row.game);
      const m = d.midend;
      const marked = () => d.last("game-state-change")?.hasPencilMarks;
      m.newGame();
      expect(marked(), `${row.name}: a fresh board has no pencil marks`).toBe(false);

      expect(
        m.processInput(0, 0, MARK_ALL_BUTTON),
        `${row.name}: the press did nothing`,
      ).toBe(true);
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
        const { state } = board(row, params, `markall-${at}`);
        let cur = state;
        let presses = 0;
        for (; presses < 6; presses++) {
          const next = press(row, cur);
          if (next === null) break;
          cur = next;
        }
        expect(presses, `${at}: did not converge`).toBeLessThan(6);
        expect(press(row, cur), `${at}: a further press is not a no-op`).toBeNull();
      }
    });
  }
});

describe("the Mark-all press never resets a note the player narrowed", () => {
  for (const row of MARK_ALL_GAMES) {
    it(`${row.name}: a fill leaves every already-noted cell bit-for-bit alone`, () => {
      // Every board the gate slice offers. The regression this pins is a fill
      // that *rewrites* every empty cell, and whether a game's fill rewrites or
      // adds is decided in the same code that decides what a cage, an X
      // diagonal or a jigsaw block culls, so one plain board per game would
      // miss Solo's modes.
      for (const { title, params } of gatePresets(row.name, row.game)) {
        const at = `${row.name}/${title}`;
        // A board whose every blank cell is down to one candidate has nothing
        // to narrow, and the smallest Solo under mirrored clues is often one,
        // so deal until a board has a cell with two.
        const twoCandidates = (v: number) => v !== 0 && (v & (v - 1)) !== 0;
        const filledBoard = (deal: number) => {
          const dealt = board(row, params, `narrow-${at}${deal ? `-${deal}` : ""}`);
          // Run the press to convergence, so every fillable cell carries notes.
          let filled = dealt.state;
          for (let i = 0; i < 6; i++) {
            const next = press(row, filled);
            if (next === null) break;
            filled = next;
          }
          return { cur: filled };
        };
        let { cur } = filledBoard(0);
        for (let deal = 1; deal < 8; deal++) {
          if (Array.from(notesOf(cur)).some(twoCandidates)) break;
          ({ cur } = filledBoard(deal));
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
        const narrowed = notes.findIndex(twoCandidates);
        expect(
          narrowed,
          `${at}: no cell had two candidates to narrow between`,
        ).toBeGreaterThanOrEqual(0);
        notes[narrowed] &= notes[narrowed] - 1; // clear its lowest candidate

        const blank = notes.findIndex((v, i) => i !== narrowed && v !== 0);
        expect(blank, `${at}: no second noted cell to blank`).toBeGreaterThanOrEqual(0);
        notes[blank] = 0;
        const before = Array.from(notes);

        const after = press(row, cur);
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

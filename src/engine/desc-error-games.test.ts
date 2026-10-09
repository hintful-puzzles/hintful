/*
 * A game ID a player pastes is refused or played, never thrown.
 *
 * The Enter Game ID dialog shows what `loadDesc` refuses with, and a player
 * types whatever they type. A throw there is an unhandled rejection in the
 * worker rather than a sentence.
 */
import { describe, expect, it } from "vitest";
import { loadVerdict, validateDesc } from "./desc-error.ts";
import { Midend } from "./midend.ts";
import { dealt } from "./testing/dealt.ts";
import { descAlphabet, descMutants } from "./testing/desc-mutants.ts";
import { REGISTERED_GAME_COUNT, REGISTERED_GAMES } from "./testing/enrollment.ts";
import { dealtBoards } from "./testing/presets.ts";
import { RecordingDrawing } from "./testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "./testing/render-scenario.ts";
import { itOverWholeSweep, SLOW_TESTS_ENABLED } from "./testing/slow.ts";

const MALFORMED = ["", "!", "~,~,~", "_", "9".repeat(4000), "z".repeat(4000)];

/*
 * Every game is fed a few descriptions no generator writes and must answer each
 * one. Every game must refuse at least one of them: a `newState` that never
 * reads through `descValue` refuses nothing, and would pass the no-throw half
 * by checking nothing. This is what holds a game to deriving its verdict.
 */
describe("a malformed game ID", () => {
  it("is refused by every game, never thrown", () => {
    expect(REGISTERED_GAME_COUNT).toBeGreaterThanOrEqual(57);

    const threw: string[] = [];
    const acceptsAll: string[] = [];
    for (const [id, game] of REGISTERED_GAMES) {
      const params = game.defaultParams();
      let refused = 0;
      for (const desc of MALFORMED) {
        try {
          if (validateDesc(game, params, desc) !== null) refused++;
        } catch (e) {
          threw.push(`${id} on ${JSON.stringify(desc.slice(0, 12))}: ${e}`);
        }
      }
      if (refused === 0) acceptsAll.push(id);
    }
    expect(threw).toEqual([]);
    expect(acceptsAll).toEqual([]);
  });
});

/**
 * Mutants tried per board on a per-commit run, taken at an even stride through
 * the full list so every kind of edit and every part of the desc is sampled.
 * The slow tier tries every mutant of every preset.
 */
const MUTANTS_PER_BOARD = 150;

const accepted = new Map<string, number>();

/*
 * Junk is refused early in a parse; a near miss is not. A real desc broken by
 * one small edit (`testing/desc-mutants.ts`) is mostly well formed, so it
 * reaches deep into a parser. Every desc the generator writes must load, and
 * every near miss that loads is opened the way the dialog opens it, and the
 * board must draw.
 *
 * **What this can see.** Only a `newState` or a `redraw` that throws something
 * other than a refusal. Measured when it was written, with every desc
 * accepted: 21 games' boards threw on some mutant, and the other 36 built and
 * drew every one, the empty desc included, because their parsers then skipped
 * what they did not recognize and a typed array swallows an out-of-range write.
 * Agreement between the verdict and the board needs no test: the verdict is
 * the board's own build (`loadDesc`).
 *
 * **The cap.** One board per value of each preset axis, on the smallest board
 * offering it, one per value the dialog offers and no preset holds, and
 * {@link MUTANTS_PER_BOARD} mutants of each. A mode changes the
 * grammar; a size adds nothing a mutant does not already reach, since doubling
 * a digit writes the two-digit clue a large board would, while generating that
 * board cost Slide 30 s on its own. The uncapped run, every preset and every
 * mutant, found no failure.
 */
describe("a near-miss game ID", () => {
  for (const [id, game] of REGISTERED_GAMES) {
    it(`${id}: is refused, or builds a board that draws`, () => {
      const presets = dealtBoards(game, {
        every: SLOW_TESTS_ENABLED,
        scalarEnds: false,
      });
      const boards = presets.map(({ title, params }) => ({
        title,
        params: game.encodeParams(params, true),
        desc: dealt(game, params).desc,
      }));
      const alphabet = descAlphabet(boards.map((b) => b.desc));

      const failures: string[] = [];
      let tried = 0;
      let n = 0;
      for (const board of boards) {
        // A parser made strict must still read what its own generator writes,
        // and the board it deals must have the one answer loading asks for.
        const own = loadVerdict(game, game.decodeParams(board.params), board.desc);
        if (own !== null) failures.push(`${board.params}:${board.desc}: ${own}`);
        const mutants = descMutants(board.desc, alphabet);
        const stride = SLOW_TESTS_ENABLED
          ? 1
          : Math.max(1, Math.ceil(mutants.length / MUTANTS_PER_BOARD));
        for (let i = 0; i < mutants.length; i += stride) {
          const desc = mutants[i] as string;
          const gameId = `${board.params}:${desc}`;
          tried++;
          try {
            const midend = new Midend(game);
            if (midend.newGameFromId(gameId) !== null) continue;
            n++;
            const drawing = new RecordingDrawing(
              midend.getColorPalette(DEFAULT_BACKGROUND),
            );
            midend.redraw(drawing);
            if (drawing.ops.length === 0) failures.push(`${gameId}: drew nothing`);
          } catch (e) {
            failures.push(`${gameId}: ${e}`);
          }
        }
      }
      accepted.set(id, n);
      expect(tried).toBeGreaterThan(0);
      expect(failures).toEqual([]);
    });
  }

  // How many accepted near misses reached `newState`, collection-wide. Several
  // games accept none (an exact validator refuses every one-edit change), so the
  // floor is on the sum: a mutator or a slice that went blind would drop it. It
  // was 4,668 when written and 3,443 once every game read its desc strictly
  // (`read-descs-through-one-cursor`), since a near miss a strict parser refuses
  // never reaches `newState`. It was 2,629 once loading asked a board for its
  // one answer (`play-only-boards-with-one-answer`): one edit to a puzzle with
  // one answer usually leaves it with several or none. It was 1,270 once
  // loading asked whether deduction finishes the board
  // (`retire-the-unchecked-board-options`): a solver that gives up proves
  // neither, and such a board used to load. It was 1,028 once nine untiered
  // games that had not been asking did
  // (`refuse-a-board-an-untiered-solver-cannot-finish`).
  itOverWholeSweep("loaded enough accepted near misses to mean something", () => {
    expect(accepted.size).toBe(REGISTERED_GAME_COUNT);
    const total = [...accepted.values()].reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThanOrEqual(900);
  });
});

/*
 * A game ID a player pastes is refused or played, never thrown.
 *
 * The Enter Game ID dialog shows what `validateDesc` returns, and a player
 * types whatever they type. A throw there is an unhandled rejection in the
 * worker rather than a sentence.
 */
import { describe, expect, it } from "vitest";
import { Midend } from "./midend.ts";
import { randomNew } from "./random/index.ts";
import { descAlphabet, descMutants } from "./testing/desc-mutants.ts";
import { REGISTERED_GAME_COUNT, REGISTERED_GAMES } from "./testing/enrollment.ts";
import { axisSlice, leafPresets } from "./testing/presets.ts";
import { RecordingDrawing } from "./testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "./testing/render-scenario.ts";
import { itOverWholeSweep, SLOW_TESTS_ENABLED } from "./testing/slow.ts";

const MALFORMED = ["", "!", "~,~,~", "_", "9".repeat(4000), "z".repeat(4000)];

/*
 * Every game is fed a few descriptions no generator writes and must answer each
 * one. Every game must refuse at least one of them: a `validateDesc` that
 * accepted all of these would be accepting everything, and would pass the
 * no-throw half by checking nothing.
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
          if (game.validateDesc(params, desc) !== null) refused++;
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
 * Junk is refused before `newState` is reached; a near miss is not. A real desc
 * broken by one small edit (`testing/desc-mutants.ts`) is mostly well formed,
 * so it reaches deep into a parser. Every desc the generator writes must load,
 * and every near miss `validateDesc` accepts is loaded the way the dialog loads
 * it, and the board must build and draw.
 *
 * **What this can see.** Only a `newState` or a `redraw` that throws. Measured
 * when it was written, with `validateDesc` replaced by one accepting
 * everything: 21 games' boards threw on some mutant, and the other 36 built and
 * drew every one, the empty desc included, because their parsers then skipped
 * what they did not recognize and a typed array swallows an out-of-range write.
 * Agreement between the verdict and the board is what reading a desc once
 * guarantees (`docs/games/mechanics.md` § "Read a desc once"), not this test.
 *
 * **The cap.** One board per value of each preset axis, on the smallest board
 * offering it, and {@link MUTANTS_PER_BOARD} mutants of each. A mode changes the
 * grammar; a size adds nothing a mutant does not already reach, since doubling
 * a digit writes the two-digit clue a large board would, while generating that
 * board cost Slide 30 s on its own. The uncapped run, every preset and every
 * mutant, found no failure.
 */
describe("a near-miss game ID", () => {
  for (const [id, game] of REGISTERED_GAMES) {
    it(`${id}: is refused, or builds a board that draws`, () => {
      const all = leafPresets(game);
      const presets = SLOW_TESTS_ENABLED
        ? all
        : axisSlice(game, all, { scalarEnds: false });
      const boards = presets.map(({ title, params }) => ({
        title,
        params: game.encodeParams(params, true),
        desc: game.newDesc(params, randomNew(`near-miss-${id}-${title}`)).desc,
      }));
      const alphabet = descAlphabet(boards.map((b) => b.desc));

      const failures: string[] = [];
      let tried = 0;
      let n = 0;
      for (const board of boards) {
        // A parser made strict must still read what its own generator writes.
        const own = game.validateDesc(game.decodeParams(board.params), board.desc);
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
            if (game.validateDesc(game.decodeParams(board.params), desc) !== null) {
              continue;
            }
            n++;
            const midend = new Midend(game);
            const err = midend.newGameFromId(gameId);
            if (err !== null) {
              failures.push(
                `${gameId}: validateDesc accepted it, the midend said ${err}`,
              );
              continue;
            }
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
  // never reaches `newState`.
  itOverWholeSweep("loaded enough accepted near misses to mean something", () => {
    expect(accepted.size).toBe(REGISTERED_GAME_COUNT);
    const total = [...accepted.values()].reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThanOrEqual(3000);
  });
});

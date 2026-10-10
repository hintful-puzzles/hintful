/*
 * A board nobody can finish does not load, in a game with no mistake check.
 *
 * A game with a mistake check is asked for its one answer whenever a board
 * loads, and a board with none is refused there. One without has many ways to
 * finish or no notion of a wrong move, so it was never asked, and Flip opened
 * a board no presses light. Such a game says what it can prove through
 * `hasNoSolution`, and joins the first half of this by having it. Every other
 * one is in the second half, with a board that has no solution and loads all
 * the same: the list of what is still let through, kept by a test.
 */
import { describe, expect, it } from "vitest";
import { DESC_NO_SOLUTION, loadVerdict, validateDesc } from "./desc-error.ts";
import {
  type AnyGame,
  REGISTERED_GAME_COUNT,
  REGISTERED_GAMES,
} from "./testing/enrollment.ts";

const UNCHECKED = REGISTERED_GAMES.filter(
  ([, game]) => game.findMistakes === undefined,
);
const PROVING = UNCHECKED.filter(([, game]) => game.hasNoSolution !== undefined);

/** A game ID with no solution that each game reads, and that loading refuses. */
const REFUSED: Record<string, string> = {
  // One painted square, for a cube with six faces to paint.
  cube: "c4x4:8000,2",
  // Two tiles of the finished board swapped.
  fifteen: "3x3:2,1,3,4,5,6,7,8,0",
  // No press flips anything, and one light is unlit.
  flip: "3x3c:000000000000000000000,800",
  // Two tiles swapped on a board with both sides odd.
  sixteen: "3x3:2,1,3,4,5,6,7,8,9",
  // Every pair of five points joined, which cannot be drawn without a crossing.
  untangle: "5:0-1,0-2,0-3,0-4,1-2,1-3,1-4,2-3,2-4,3-4",
};

/**
 * A game ID with no solution that loads, because its game has no cheap proof
 * that it has none. An entry leaves for {@link REFUSED} when its game gains
 * `hasNoSolution`, and the first test is what says so.
 */
const LET_THROUGH: Record<string, string> = {
  // Three stripes need two fills, and the limit is one.
  flood: "3x3c3m0:012012012,1",
  // The gem is behind walls the ball never gets round.
  inertia: "3x3:Swgbwwbbb",
  // Four loose ends, which no arrangement joins into one network.
  netslide: "2x2:1111",
  // Two pegs in opposite corners, which never meet.
  pegs: "5x5random:PHHHHHHHHHHHHHHHHHHHHHHHP",
  // A checkerboard: no two tiles of a color touch, so nothing can be removed.
  samegame: "5x5c3s2:1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1",
  // A block moved one square, by an edit to a dealt board.
  slide: "6x7m25:w7md1ad1w2d5d1ad2w2a2d1aw2ad5d1efewa3efew6,4,4,23",
  // A barrel in a corner that is no target.
  sokoban:
    "10x12:w11f2bt3wtw2tbs2b2sbw2s3ts4w2bsbtwsw4ts2bs4w2ts4wsbw3bswts2tw3s2wbsbtw3bs3fsfw3tws2tbuw11",
  // The one block is the whole board, so only four arrangements are reachable.
  twiddle: "3x3n3:2,1,3,4,5,6,7,8,9",
};

/** What loading says of `gameId`, which the game must read as an unfinished
 * board: a refusal for its shape, or for being solved, would prove nothing. */
function loading(game: AnyGame, gameId: string) {
  const sep = gameId.indexOf(":");
  const params = game.decodeParams(gameId.slice(0, sep));
  const desc = gameId.slice(sep + 1);
  expect(validateDesc(game, params, desc), `${game.id} reads ${gameId}`).toBeNull();
  const state = game.newState(params, desc);
  expect(game.status(state), `${game.id}: ${gameId} is unfinished`).toBe("ongoing");
  return loadVerdict(game, params, desc);
}

describe("a board with no solution, in a game with no mistake check", () => {
  it("has one pinned for every such game, refused exactly where the game proves it", () => {
    expect(REGISTERED_GAME_COUNT).toBeGreaterThanOrEqual(57);
    expect(UNCHECKED.length).toBeGreaterThanOrEqual(11);
    expect(Object.keys(REFUSED).sort()).toEqual(PROVING.map(([id]) => id));
    expect([...Object.keys(REFUSED), ...Object.keys(LET_THROUGH)].sort()).toEqual(
      UNCHECKED.map(([id]) => id),
    );
  });

  it("is refused where the game proves it has none", () => {
    for (const [id, game] of PROVING) {
      expect(loading(game, REFUSED[id] as string), id).toBe(DESC_NO_SOLUTION);
    }
  });

  it("loads where the game has no proof", () => {
    const unproving = UNCHECKED.filter(([, game]) => game.hasNoSolution === undefined);
    expect(unproving.map(([id]) => id)).toEqual(Object.keys(LET_THROUGH).sort());
    for (const [id, game] of unproving) {
      expect(loading(game, LET_THROUGH[id] as string), id).toBeNull();
    }
  });
});

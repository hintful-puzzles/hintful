/**
 * **Solve shows the finished board, or says why not** — the guard behind the
 * `ts-engine` requirement "Solve leaves a solved board".
 *
 * `Midend.solve` throws when a game's Solve move leaves a board whose status is
 * not solved, so every Solve played anywhere checks itself. What only a sweep
 * can add is the positions: a fresh board is the one nearly every test solves,
 * and Flood's Solve only finished past its move limit (a loss) once the player
 * had spent moves. So each game is played some way from its deal by its own
 * input, in a fixed pseudo-random order, and asked to Solve from there.
 *
 * Proved to fail by planting Flood's old Solve back (no move-limit check): its
 * case throws from the midend.
 */

import { describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import { LEFT_BUTTON, LEFT_RELEASE, RIGHT_BUTTON, RIGHT_RELEASE } from "./pointer.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import { type AnyGame, probeBoard, probePoints } from "./testing/input-probe.ts";

registerAllGames();

const solvable = registeredGameIds().filter((id) => getTsGame(id)?.solve !== undefined);

/** How many positions each game is solved from, and how far into its play. */
const TRIALS = 12;
const INPUTS_PER_TRIAL = 4;

describe("Solve leaves a solved board, or refuses", () => {
  it("has a population", () => {
    // Vacuity: the population is derived; an empty one asserts nothing.
    expect(solvable.length).toBeGreaterThanOrEqual(40);
  });

  it.each(solvable)("%s: from the deal and from positions played into", (id) => {
    const game = getTsGame(id) as AnyGame;
    const pb = probeBoard(game, id);
    const points = probePoints(pb.size);
    const keys = pb.m.requestKeys().map((k) => k.button);
    let seed = 1;
    const pick = (n: number) => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed % n;
    };
    let solved = 0;
    for (let trial = 0; trial < TRIALS; trial++) {
      pb.reset();
      for (let i = 0; i < trial * INPUTS_PER_TRIAL; i++) {
        const p = points[pick(points.length)];
        const r = pick(2 + keys.length);
        if (r === 0) {
          pb.m.processInput(p.x, p.y, LEFT_BUTTON);
          pb.m.processInput(p.x, p.y, LEFT_RELEASE);
        } else if (r === 1) {
          pb.m.processInput(p.x, p.y, RIGHT_BUTTON);
          pb.m.processInput(p.x, p.y, RIGHT_RELEASE);
        } else {
          pb.m.processInput(p.x, p.y, keys[r - 2]);
        }
      }
      // A refusal is a string and a bad Solve move throws, so only a null
      // here is a Solve played, and the midend has checked its board.
      if (pb.m.solve() === null) {
        expect(game.status(pb.live().state)).toBe("solved");
        solved++;
      }
    }
    // A game that refused every time would have asserted nothing.
    expect(solved).toBeGreaterThan(0);
  });
});

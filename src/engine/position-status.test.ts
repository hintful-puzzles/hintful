/**
 * **A game's status is a function of the position** — the guard behind the
 * `ts-engine` requirement "A game's status is judged from the board alone".
 *
 * The midend derives everything historical (the solver was used, when to
 * flash, when the clock runs) and reports the board's status *now*, so a game
 * that keeps a record of having been solved reintroduces exactly what
 * `derive-completion-from-the-position` removed: a broken solved board that
 * still says COMPLETED!, refuses a hint as "already solved" and stops the clock.
 *
 * ON THE INSTRUMENT, precisely — the two halves are not equally strong:
 *
 *  - **The behavioral half** asks the one thing a latch can never do: from a
 *    solved board, reach a position whose status is not solved. It plays the
 *    game's own input through the midend (a click, each on-screen key, a right
 *    click, at points across the board) and stops at the first such position,
 *    so it is cheap. A game whose input cannot take a solved board off its
 *    solution is a ledger entry with its reason, asserted exact, because a game
 *    the walk cannot break is a game this half cannot see.
 *  - **The structural half** walks real states (fresh, and solved) and refuses
 *    the names the record went by. It keys on names, which is the weaker
 *    instrument (AGENTS.md, "A scan that keys on a name"), and it is here for
 *    the games the behavioral half cannot see.
 *
 * WHY NOT "a board with a mistake is not solved", which was the first cut: it
 * is false. Loopy's and Net's `findMistakes` flag a wrong *note* (a corner, a
 * pair, a side), and a wrong note does not unsolve a board whose lines are
 * right. The walk found both on its first run.
 *
 * Proved to fail by planting a latch in Keen (`derive-completion-from-the-
 * position`, tasks 2.2): Keen lands in the unbroken list.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import {
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  PENCIL_MODE_BUTTON,
  RIGHT_BUTTON,
  RIGHT_RELEASE,
} from "./pointer.ts";
import { getTsGame, registeredGameIds } from "./registry.ts";
import { type AnyGame, probeBoard, probePoints } from "./testing/input-probe.ts";

beforeAll(registerAllGames);

/** The names a completion record went by before the engine owned the history. */
const RECORD_KEYS = [
  "completed",
  "complete",
  "cheated",
  "solved",
  "wasSolved",
  "won",
  "usedSolve",
  "hasCheated",
];

/**
 * Games with Solve whose own input, from the solved board, never reaches a
 * position that is not solved, each with the reason. The walk cannot see a
 * latch in these.
 */
const UNBREAKABLE: Record<string, string> = {
  // A board Solve refuses, so there is no solved position to start from.
  mines: "the probe board has no first click yet, so there is nothing to solve",
  // A solved board whose rules take no move that could break it.
  blackbox: "a revealed arena takes no move",
  flood: "a flooded board accepts no fill",
  guess: "a won game takes no more guesses, and a mark on the answer row is a note",
  inertia: "a collected gem stays collected, and the gems are all that solved counts",
  mosaic: "a solved board accepts only the cursor keys",
  net: "Solve locks every tile, a locked tile does not turn, and unlocking is a notes-mode tap",
  pegs: "a solved board has one peg left, and one peg has nothing to jump over",
};

function games(): [string, AnyGame][] {
  return registeredGameIds().map((id) => {
    const game = getTsGame(id) as AnyGame | undefined;
    if (!game) throw new Error(`${id} is registered but has no game object`);
    return [id, game];
  });
}

describe("a game's status is judged from the board alone", () => {
  it("lets the player's input take a solved board off its solution", () => {
    const population = games().filter(([, g]) => g.solve);
    // Vacuity: the population is derived; an empty one asserts nothing.
    expect(population.length).toBeGreaterThanOrEqual(40);

    const unbroken: string[] = [];
    let walked = 0;
    for (const [id, game] of population) {
      const pb = probeBoard(game, id);
      // A board that refuses Solve (Mines before its first click) has no
      // solved position to start from.
      if (pb.m.solve() !== null || game.status(pb.live().state) !== "solved") {
        unbroken.push(id);
        continue;
      }
      walked++;
      // Not the Marks key: it switches the keys that follow to notes, and a note
      // never takes a board off its solution.
      const keys = pb.m
        .requestKeys()
        .map((k) => k.button)
        .filter((b) => b !== PENCIL_MODE_BUTTON);
      const step = Math.max(4, Math.floor(Math.min(pb.size.w, pb.size.h) / 12));
      const drag = (p: { x: number; y: number }, dx: number, dy: number) => () => {
        pb.m.processInput(p.x, p.y, LEFT_BUTTON);
        pb.m.processInput(p.x + dx, p.y + dy, LEFT_DRAG);
        pb.m.processInput(p.x + dx, p.y + dy, LEFT_RELEASE);
      };
      const inputs = (p: { x: number; y: number }): (() => void)[] => [
        () => {
          pb.m.processInput(p.x, p.y, LEFT_BUTTON);
          pb.m.processInput(p.x, p.y, LEFT_RELEASE);
        },
        ...keys.map((k) => () => pb.m.processInput(p.x, p.y, k)),
        () => {
          pb.m.processInput(p.x, p.y, RIGHT_BUTTON);
          pb.m.processInput(p.x, p.y, RIGHT_RELEASE);
        },
        // The games played by dragging: a line, a link, a color, a point.
        drag(p, step, 0),
        drag(p, 0, step),
      ];
      // A solved board can leave room in one direction only (Slide's key block,
      // home in a corner of the exit), so a board the first pass cannot break
      // is solved again and dragged the other two ways. A pass of its own,
      // because mixing the drags into the first walk changes the positions it
      // reaches, and Bridges then went unbroken; and from the solved board,
      // because the first pass can box Slide's key block in.
      const backward = (p: { x: number; y: number }) => [
        drag(p, -step, 0),
        drag(p, 0, -step),
      ];
      const breaks = (pass: typeof inputs): boolean => {
        for (const p of probePoints(pb.size)) {
          for (const input of pass(p)) {
            const before = pb.moves();
            input();
            if (pb.moves() === before) continue;
            if (game.status(pb.live().state) !== "solved") return true;
          }
        }
        return false;
      };
      if (breaks(inputs)) continue;
      pb.reset();
      if (pb.m.solve() !== null) throw new Error(`${id}: Solve refused a second time`);
      if (!breaks(backward)) unbroken.push(id);
    }
    expect(unbroken.sort()).toEqual(Object.keys(UNBREAKABLE).sort());
    expect(walked).toBeGreaterThanOrEqual(40);
  });

  it("keeps no record of being solved or helped on the state", () => {
    const all = games();
    expect(all.length).toBeGreaterThanOrEqual(50);
    const offenders: string[] = [];
    let solvedStates = 0;
    for (const [id, game] of all) {
      const pb = probeBoard(game, id);
      const states: [string, unknown][] = [["fresh", pb.live().state]];
      if (game.solve && pb.m.solve() === null) {
        states.push(["solved", pb.live().state]);
        solvedStates++;
      }
      for (const [when, state] of states) {
        for (const key of RECORD_KEYS) {
          if (
            typeof state === "object" &&
            state !== null &&
            Object.hasOwn(state, key)
          ) {
            offenders.push(`${id} (${when}): \`${key}\``);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
    // Vacuity from the other side: the solved half looked at something.
    expect(solvedStates).toBeGreaterThanOrEqual(40);
  });
});

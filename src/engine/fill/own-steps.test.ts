/**
 * The walk of notes running a description's own techniques, on the
 * `flanking` fixture: one that places reading no notes, offered before the
 * notes are set up, its later squares continuing the first; and one whose
 * steps strike a number each, its rung the arm that held.
 */

import { describe, expect, it } from "vitest";
import * as flanking from "../../generated/engine/testing/fixtures/flanking/flanking.compiled.ts";
import type { HintStep } from "../contract/game.ts";
import { randomNew } from "../random/index.ts";
import type { FillBoard } from "./board.ts";
import { fillGame } from "./game.ts";

const game = fillGame("flanking", flanking);
type Board = FillBoard<flanking.Dealt>;
type Step = HintStep<unknown, unknown, string>;

const params = (w: number, diff = 0) => ({ w, h: w, diff });
const NORMAL = 1;

/** Sums of the answer 1234/3412/4321/2143 above column 1, column 2 where
 * `aboveColumn2` says, and below column 0, with `given` squares of row 0:
 * the square under each given one holds the rest of the sum above it. */
const desc = (aboveColumn2: string, given: string) =>
  `${[
    ["", "6", aboveColumn2, ""],
    ["6", "", "", ""],
    ["", "", "", ""],
    ["", "", "", ""],
  ]
    .flat()
    .join("/")},${given}`;
/** Row 0's 2 given, and nothing else. */
const ONE_GIVEN = "a2n";
/** Row 0's 2, 3 and 4 given. */
const ROW_GIVEN = "a2_3_4l";

const firstSteps = (b: Board, reading?: "populate" | "implicit"): readonly Step[] => {
  const ui = game.newUi(b);
  const got = game.hint.plan(
    b,
    undefined,
    reading === undefined ? ui : { ...ui, candidateReading: reading },
  );
  if (!got.ok) throw new Error(`no hint: ${got.error}`);
  return got.steps as readonly Step[];
};

describe("an own technique that places reading no notes", () => {
  // Under the populate reading the notes are set up by a step of their own,
  // which a technique reading them waits for.
  it.each([
    "populate",
    "implicit",
  ] as const)("is offered on a board with no notes, before they are set up (%s)", (reading) => {
    const b = game.newState(params(4), desc("", ONE_GIVEN));
    const [step] = firstSteps(b, reading);
    expect(step.rung).toBe("rest");
    expect(step.move).toMatchObject({ type: "set", x: 1, y: 1, n: 4 });
    expect(step.explanation).toBe(
      "Clue 6 already has 2 in the square nearest it, so the next square holds the rest of the sum: this square must be 4.",
    );
  });

  it("goes on to its next square saying how it adds to the first", () => {
    const b = game.newState(params(4), desc("4", ROW_GIVEN));
    const steps = firstSteps(b);
    const legs = steps.filter((s) => s.rung === "rest");
    expect(legs.map((s) => s.move)).toMatchObject([
      { type: "set", x: 1, y: 1, n: 4 },
      { type: "set", x: 2, y: 1, n: 1 },
    ]);
    expect(legs[1].explanation).toBe(
      "…and this square must be 1, for clue 4 less the 3 nearest it.",
    );
  });
});

describe("an own technique whose steps strike a number each", () => {
  it("strikes one number a step, from both squares, its rung the arm that held", () => {
    const seen = new Set<string>();
    for (const seed of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
      const p = params(5, NORMAL);
      let b = game.newState(p, game.newDesc(p, randomNew(seed)).desc);
      for (let made = 0; game.status(b) !== "solved"; made++) {
        expect(made).toBeLessThan(80);
        const [step] = firstSteps(b);
        if (step.rung === "flank" || step.rung === "flankTight") {
          seen.add(step.rung);
          // One number struck: under the implicit reading the move writes
          // the notes left, so the words say which.
          expect(step.explanation).toMatch(
            step.rung === "flankTight"
              ? /^Only one pair of numbers sums to (3|9) for this clue, and it holds no \d, /
              : /^No two numbers that sum to \d+ for this clue put \d in /,
          );
        }
        b = game.executeMove(b, step.move as never);
      }
    }
    expect([...seen].sort()).toEqual(["flank", "flankTight"]);
  });
});

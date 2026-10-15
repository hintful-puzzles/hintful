/**
 * Numgame's hint: a pinned position and its sentence for every rung, and
 * the properties a plan has on any board.
 *
 * `npm run hint-scan -- <this file>` writes the pins
 * (docs/testing.md § "Pinning a hint's positions").
 */
import { describe, expect, it } from "vitest";
import { stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import { SIGN, TILE } from "./hint-text.ts";
import { numgameGame } from "./index.ts";
import { COL_HINT } from "./render.ts";
import { reachOf } from "./solver.ts";
import {
  executeMove,
  type NumgameParams,
  type NumgameState,
  newState,
} from "./state.ts";

const pinned = describeHintPins({
  game: numgameGame,
  params: [{ large: 1, diff: 1 }],
  pins: {
    /** Held on 24 of 36 positions walked. */
    first: "l1dn:25,1,8,5,10,3=153",
    /** Held on 12 of 36 positions walked. */
    next: "l1dn:25,1,8,5,10,3=153",
    /** Held on 24 of 36 positions walked. */
    last: "l1dn:25,1,8,5,10,3=153",
    /** Held on 12 of 36 positions walked. */
    only: {
      id: "l1dn:25,1,8,5,10,3=153",
      moves:
        '[{"kind":"combine","from":0,"into":2,"op":"-"},{"kind":"combine","from":4,"into":1,"op":"-"}]',
    },
  },
});

const BOARDS: NumgameParams[] = [0, 1, 2, 3].flatMap((diff) => [
  { large: 0, diff },
  { large: 2, diff },
  { large: 4, diff },
]);

function deal(p: NumgameParams, seed: string): NumgameState {
  return newState(p, numgameGame.newDesc(p, randomNew(seed)).desc);
}

describe("numgame hint plans", () => {
  it.each(
    BOARDS,
  )("make the target in its fewest operations, $large large at tier $diff", (p) => {
    for (const seed of ["plan a", "plan b"]) {
      let state = deal(p, seed);
      const fewest = reachOf(state.slots).fewestOps(state.target);
      const result = numgameGame.hint?.(state);
      if (!result?.ok) throw new Error(`refused on ${seed}`);
      expect(result.steps).toHaveLength(fewest ?? -1);
      for (const step of result.steps) {
        expect(step.explanation.length, step.explanation).toBeLessThanOrEqual(120);
        state = executeMove(state, step.move);
      }
      expect(numgameGame.status(state)).toBe("solved");
    }
  });

  it("rings exactly the two numbers and the operator each step combines", () => {
    const state = deal({ large: 2, diff: 3 }, "rings");
    const result = numgameGame.hint?.(state);
    if (!result?.ok) throw new Error("refused");
    for (const step of result.steps) {
      if (step.move.kind !== "combine") throw new Error("a step combines");
      const marks = stepMarks(step);
      expect([...marks.of("ring", TILE)].sort()).toEqual(
        [step.move.from, step.move.into].sort(),
      );
      expect(marks.of("ring", SIGN)).toEqual([step.move.op]);
    }
  });

  it("keeps a step its combination makes in either order, and drops it for any other", () => {
    const { state, step } = pinned("first");
    if (step.move.kind !== "combine") throw new Error("a step combines");
    const { from, into, op } = step.move;
    const keep = numgameGame.hintKeepTrack;
    expect(keep?.(step.move, step, state)).toBe("completed");
    expect(keep?.({ kind: "combine", from: into, into: from, op }, step, state)).toBe(
      "completed",
    );
    const other = op === "+" ? "*" : "+";
    expect(keep?.({ kind: "combine", from, into, op: other }, step, state)).toBe("off");
  });
});

describe("numgame hint frame", () => {
  it("rings the step's numbers and its operator", () => {
    const { recording } = renderPinnedHint(numgameGame, pinned("first"));
    expect(recording.ops.some((op) => paintsWith(op, COL_HINT))).toBe(true);
  });
});

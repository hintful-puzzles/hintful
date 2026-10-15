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
import { combine, OPS, reachOf } from "./solver.ts";
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
    /** Held on 14 of 36 positions walked. */
    starts: "l1dn:25,1,8,5,10,3=153",
    /** Held on 10 of 36 positions walked. */
    onlyStart: "l1dn:100,8,10,1,2,4=129",
    /** Held on 12 of 36 positions walked. */
    last: {
      id: "l1dn:25,1,8,5,10,3=153",
      moves:
        '[{"kind":"combine","from":2,"into":0,"op":"-"},{"kind":"combine","from":1,"into":4,"op":"-"}]',
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
  )("give one operation a request, each a shortest line's, $large large at tier $diff", (p) => {
    for (const seed of ["plan a", "plan b"]) {
      let state = deal(p, seed);
      let fewest = reachOf(state.slots).fewestOps(state.target) ?? -1;
      while (numgameGame.status(state) !== "solved") {
        const result = numgameGame.hint?.(state);
        if (!result?.ok) throw new Error(`refused on ${seed}`);
        expect(result.steps).toHaveLength(1);
        const [step] = result.steps;
        expect(step.explanation.length, step.explanation).toBeLessThanOrEqual(120);
        state = executeMove(state, step.move);
        // One operation fewer still needed, so asking again never cycles.
        const left = reachOf(state.slots).fewestOps(state.target);
        expect(left).toBe(fewest - 1);
        fewest = left ?? -1;
      }
    }
  });

  it("works on the biggest number first, and counts the ways to start", () => {
    const state = newState({ large: 4, diff: 3 }, "100,75,50,25,6,3=952");
    const result = numgameGame.hint?.(state);
    if (!result?.ok) throw new Error("refused");
    expect(result.steps[0].explanation).toBe(
      "You can finish in 5 more operations, starting 4 ways. One of them: 100 + 3 = 103.",
    );
    // The count, by a plain recursion that shares only `combine` with the
    // hint: the distinct boards one combination leaves from which 952 is
    // four combinations away.
    const within = (nums: readonly number[], left: number): boolean =>
      nums.includes(952) ||
      (left > 0 &&
        nums.some((x, i) =>
          nums.some((y, j) =>
            j <= i
              ? false
              : OPS.some((op) => {
                  const r = combine(x, op, y);
                  const rest = nums.filter((_, k) => k !== i && k !== j);
                  return r !== null && within([...rest, r], left - 1);
                }),
          ),
        ));
    const starts = new Set<string>();
    const nums = state.dealt;
    nums.forEach((x, i) => {
      nums.forEach((y, j) => {
        if (j <= i) return;
        for (const op of OPS) {
          const r = combine(x, op, y);
          if (r === null) continue;
          const after = [...nums.filter((_, k) => k !== i && k !== j), r];
          if (within(after, 4)) starts.add([...after].sort((a, b) => a - b).join(","));
        }
      });
    });
    expect(starts.size).toBe(4);
  });

  it("rings exactly the two numbers and the operator a step combines", () => {
    for (const seed of ["rings a", "rings b", "rings c"]) {
      const state = deal({ large: 2, diff: 3 }, seed);
      const result = numgameGame.hint?.(state);
      if (!result?.ok) throw new Error("refused");
      const [step] = result.steps;
      if (step.move.kind !== "combine") throw new Error("a step combines");
      const marks = stepMarks(step);
      expect([...marks.of("ring", TILE)].sort()).toEqual(
        [step.move.from, step.move.into].sort(),
      );
      expect(marks.of("ring", SIGN)).toEqual([step.move.op]);
    }
  });

  it("keeps a step its combination makes in either order, and drops it for any other", () => {
    const { state, step } = pinned("starts");
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
    const { recording } = renderPinnedHint(numgameGame, pinned("starts"));
    expect(recording.ops.some((op) => paintsWith(op, COL_HINT))).toBe(true);
  });
});

/**
 * Black Box's hint: every square it settles is what the hidden balls say, it
 * reads only the lasers fired (the same plan whatever the hidden balls are,
 * so long as they send the fired lasers where they went), following it ends
 * in a win, and its sentences and marks say what each step rests on.
 */

import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { leafPresets } from "../../engine/testing/presets.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { deduce } from "./hint.ts";
import { blackboxGame as game } from "./index.ts";
import { COL_HINT, COL_HINT_EVIDENCE } from "./render.ts";
import {
  BALL_CORRECT,
  BALL_GUESS,
  type BlackboxMove,
  type BlackboxParams,
  type BlackboxState,
  gridGet,
  gridIdx,
  LASER_EMPTY,
} from "./state.ts";

const P8: BlackboxParams = { w: 8, h: 8, minballs: 5, maxballs: 5 };

function deal(p: BlackboxParams, seed: string): { desc: string; state: BlackboxState } {
  const { desc } = game.newDesc(p, randomNew(seed));
  return { desc, state: game.newState(p, desc) };
}

/** The hint's first step from `s`, which must not be a refusal. */
function next(s: BlackboxState) {
  const res = game.hint?.(s);
  if (!res?.ok) throw new Error(`refused: ${res?.error}`);
  return res.steps[0];
}

/** Follow the hint's first step until the board is won, or until `until`
 * holds of the step about to be taken. */
function follow(
  s: BlackboxState,
  until: (explanation: string) => boolean = () => false,
): { state: BlackboxState; said: string[] } {
  const said: string[] = [];
  for (let i = 0; i < 500 && game.status(s) !== "solved"; i++) {
    const step = next(s);
    if (until(step.explanation)) break;
    said.push(step.explanation);
    s = game.executeMove(s, step.move);
  }
  return { state: s, said };
}

/** Where `laser` goes on a board with `grid`'s hidden balls and nothing fired. */
function goes(s: BlackboxState, grid: Int32Array, laser: number): number {
  const fresh: BlackboxState = {
    ...s,
    grid: grid.slice(),
    exits: s.exits.map(() => LASER_EMPTY),
  };
  return game.executeMove(fresh, { type: "fire", rangeno: laser }).exits[laser];
}

describe("Black Box's hint", () => {
  it("settles only what the hidden balls say, and wins, on every preset", () => {
    let settled = 0;
    for (const { params } of leafPresets(game))
      for (const seed of ["a", "b", "c", "d"]) {
        let s = deal(params, `bbh-${seed}`).state;
        for (let i = 0; i < 500 && game.status(s) !== "solved"; i++) {
          for (const f of deduce(s).firings) {
            settled++;
            const truth =
              (gridGet(s, f.settled.at.x, f.settled.at.y) & BALL_CORRECT) !== 0;
            expect(f.settled.ball, JSON.stringify(f)).toBe(truth);
          }
          s = game.executeMove(s, next(s).move);
        }
        expect(game.status(s)).toBe("solved");
      }
    expect(settled).toBeGreaterThan(1000);
  });

  it("reads the lasers fired, never the hidden balls", () => {
    // At positions along the hint's own path, move one hidden ball to another
    // square while every fired laser still goes where it went: the plan must
    // not change. Fire steps are counted apart, since which laser to fire is
    // where a peek would most easily hide.
    let compared = 0;
    let atFire = 0;
    for (const seed of ["a", "b", "c"]) {
      let s = deal(P8, `bbh-hidden-${seed}`).state;
      for (let i = 0; i < 500 && game.status(s) !== "solved"; i++) {
        const plan = game.hint?.(s);
        const fired = [...s.exits.keys()].filter((l) => s.exits[l] !== LASER_EMPTY);
        let here = 0;
        for (let from = 0; from < P8.w * P8.h && here < 2; from++) {
          const fx = (from % P8.w) + 1;
          const fy = Math.floor(from / P8.w) + 1;
          if (!(gridGet(s, fx, fy) & BALL_CORRECT)) continue;
          for (let to = 0; to < P8.w * P8.h && here < 2; to++) {
            const tx = (to % P8.w) + 1;
            const ty = Math.floor(to / P8.w) + 1;
            if (gridGet(s, tx, ty) & BALL_CORRECT) continue;
            const grid = s.grid.slice();
            grid[gridIdx(P8.w, fx, fy)] &= ~BALL_CORRECT;
            grid[gridIdx(P8.w, tx, ty)] |= BALL_CORRECT;
            if (!fired.every((l) => goes(s, grid, l) === s.exits[l])) continue;
            here++;
            compared++;
            if (plan?.ok && plan.steps[0].move.type === "fire") atFire++;
            expect(JSON.stringify(game.hint?.({ ...s, grid }))).toBe(
              JSON.stringify(plan),
            );
          }
        }
        s = game.executeMove(s, next(s).move);
      }
    }
    expect(compared).toBeGreaterThan(100);
    expect(atFire).toBeGreaterThan(10);
  });

  it("opens by asking for a laser, and ends by asking for the check", () => {
    const { state: s } = deal(P8, "bbh-ends");
    expect(next(s).explanation).toBe(
      "No laser is fired yet. Fire this laser: nothing settled yet decides where it goes.",
    );
    const { state, said } = follow(s);
    expect(game.status(state)).toBe("solved");
    expect(said.at(-1)).toBe(
      "Check your answer: the balls you have send every laser where it went.",
    );
    // Every ball the board holds is guessed by then.
    for (let y = 1; y <= P8.h; y++)
      for (let x = 1; x <= P8.w; x++)
        if (gridGet(state, x, y) & BALL_CORRECT)
          expect(gridGet(state, x, y) & BALL_GUESS, `${x},${y}`).toBeTruthy();
  });

  it("narrates each kind of deduction by the laser's marks and what the refuted square would do", () => {
    const all = new Set<string>();
    for (const seed of ["a", "b", "c", "d", "e", "f", "g", "h"])
      for (const t of follow(deal(P8, `bbh-words-${seed}`).state).said) all.add(t);
    const shapes = [
      /^The two \d+s are one ray's ends, but with a ball here no ray could run between them, so this square must be empty\.$/,
      /^The two \d+s are one ray's ends, but with this square empty no ray could run between them, so it must hold a ball\.$/,
      /^The ray marked H hit a ball, but with a ball here it would (?:come straight back|leave the box), so this square must be empty\.$/,
      /^The ray marked H hit a ball, but with this square empty it would (?:come straight back|leave the box), so it must hold a ball\.$/,
      /^The ray marked R came straight back, but with a ball here it would (?:stop dead|come out elsewhere), so this square must be empty\.$/,
      /^The lasers fired so far settle no other square\. Fire this laser: nothing settled yet decides where it goes\.$/,
    ];
    for (const shape of shapes)
      expect(
        [...all].some((t) => shape.test(t)),
        String(shape),
      ).toBe(true);
  });

  it("rings the square it settles and outlines the laser's ends", () => {
    const { desc, state } = deal(P8, "bbh-render");
    const moves: BlackboxMove[] = [];
    let s = state;
    for (let step = next(s); step.move.type === "fire"; step = next(s)) {
      moves.push(step.move);
      s = game.executeMove(s, step.move);
    }
    const { hint, recording } = renderScenario({
      game,
      id: `${game.encodeParams(P8, true)}:${desc}`,
      moves,
      showHint: true,
    });
    expect(hint?.explanation).toMatch(/, so (?:this square|it) must /);
    const rects = recording.ops.filter((o) => o.op === "rect");
    expect(rects.some((o) => o.color === COL_HINT)).toBe(true);
    expect(rects.some((o) => o.color === COL_HINT_EVIDENCE)).toBe(true);
    expect(recording.ops).toMatchSnapshot();
  });
});

describe("the end of the box", () => {
  it("puts a ball where no laser can tell, when the board must hold more", () => {
    // Pinned as a board: one of its five balls sits where no laser reaches.
    const s = game.newState(P8, "34ee6895a0d7a3660bc1acb7");
    const { state, said } = follow(s);
    expect(said).toContain(
      "Every laser's way is settled, and 1 more ball hides on squares no laser reaches. One of them: put a ball on this square.",
    );
    expect(game.status(state)).toBe("solved");
  });

  it("takes a ball off an unsettled square when more are marked than the box holds", () => {
    let found = 0;
    for (let seed = 0; seed < 40 && found === 0; seed++) {
      let { state: s } = deal(P8, `bbh-extra-${seed}`);
      s = follow(s, (t) => t.startsWith("Check your answer")).state;
      const open = [...deduce(s).known.squares()].filter(
        ({ at, holds }) => holds === null && !(gridGet(s, at.x, at.y) & BALL_GUESS),
      );
      // A square some laser could still reach takes its ball off as part of a
      // layout instead; the one wanted is a square no laser reaches at all.
      for (const { at } of open) {
        const step = next(
          game.executeMove(s, { type: "toggleBall", x: at.x, y: at.y }),
        );
        if (step.explanation.startsWith("Every laser is fired")) continue;
        found++;
        expect(step.explanation).toBe(
          "The box holds at most 5 balls, and no laser needs those on unsettled squares. One of them: take the ball off this square.",
        );
        expect(step.move).toEqual({ type: "toggleBall", x: at.x, y: at.y });
        break;
      }
    }
    expect(found).toBeGreaterThan(0);
  });
});

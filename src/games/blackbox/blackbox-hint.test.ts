/**
 * Black Box's hint: every square it settles is what the hidden balls say, it
 * reads only the lasers fired (the same plan whatever the hidden balls are,
 * so long as they send the fired lasers where they went), following it ends
 * in a win, and its sentences and marks say what each step rests on.
 */

import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { leafPresets } from "../../engine/testing/presets.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { answerCount } from "./answer.ts";
import { deduce } from "./hint.ts";
import { blackboxGame as game } from "./index.ts";
import { COL_HINT, COL_HINT_EVIDENCE } from "./render.ts";
import {
  BALL_CORRECT,
  BALL_GUESS,
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

/** Follow the hint's first step until the board is won. */
function follow(s: BlackboxState): { state: BlackboxState; said: string[] } {
  const said: string[] = [];
  for (let i = 0; i < 500 && game.status(s) !== "solved"; i++) {
    const step = next(s);
    said.push(step.explanation);
    s = game.executeMove(s, step.move);
  }
  return { state: s, said };
}

/** Each sentence the hint says, and the positions the tests below start from,
 * pinned on a position whose hint opens with it. */
const pinned = describeHintPins({
  game,
  params: [P8],
  kinds: {
    raysEndsEmpty:
      /^The two \d+s are one ray's ends, but with a ball here no ray could run between them, so this square must be empty\.$/,
    raysEndsBall:
      /^The two \d+s are one ray's ends, but with this square empty no ray could run between them, so it must hold a ball\.$/,
    hitEmpty:
      /^The ray marked H hit a ball, but with a ball here it would (?:come straight back|leave the box), so this square must be empty\.$/,
    hitBall:
      /^The ray marked H hit a ball, but with this square empty it would (?:come straight back|leave the box), so it must hold a ball\.$/,
    reflectedEmpty:
      /^The ray marked R came straight back, but with a ball here it would (?:stop dead|come out elsewhere), so this square must be empty\.$/,
    fireAnother:
      /^The lasers fired so far settle no other square\. Fire this laser: nothing settled yet decides where it goes\.$/,
    settles: /, so (?:this square|it) must /,
    check: /^Check your answer/,
  },
  pins: {
    /** Held on 516 of 966 positions walked. */
    raysEndsEmpty: {
      id: "w8h8m5M5:df9dadb86021bc4da15414a4",
      moves: [{ type: "fire", rangeno: 0 }],
    },
    /** Held on 26 of 966 positions walked. */
    raysEndsBall: {
      id: "w8h8m5M5:2d1775dc7ab2e71fa58b5abc",
      moves:
        '[{"type":"fire","rangeno":0},{"type":"fire","rangeno":1},{"type":"toggleLock","x":2,"y":1},{"type":"toggleLock","x":4,"y":1},{"type":"toggleLock","x":3,"y":1},{"type":"toggleLock","x":5,"y":1},{"type":"toggleLock","x":1,"y":1},{"type":"toggleLock","x":4,"y":2},{"type":"toggleLock","x":2,"y":2},{"type":"fire","rangeno":2},{"type":"fire","rangeno":4},{"type":"toggleLock","x":6,"y":1},{"type":"fire","rangeno":5},{"type":"toggleLock","x":7,"y":1},{"type":"fire","rangeno":6},{"type":"toggleLock","x":8,"y":1},{"type":"toggleLock","x":1,"y":2},{"type":"toggleLock","x":3,"y":2},{"type":"toggleLock","x":7,"y":2},{"type":"toggleLock","x":5,"y":2},{"type":"toggleLock","x":2,"y":3},{"type":"toggleLock","x":4,"y":3},{"type":"toggleLock","x":6,"y":2}]',
    },
    /** Held on 87 of 966 positions walked. */
    hitEmpty: {
      id: "w8h8m5M5:bd040b071f206344ffd98bfe",
      moves:
        '[{"type":"fire","rangeno":0},{"type":"fire","rangeno":1},{"type":"toggleLock","x":2,"y":1},{"type":"toggleLock","x":1,"y":2},{"type":"toggleLock","x":3,"y":1},{"type":"toggleLock","x":1,"y":1}]',
    },
    /** Held on 9 of 966 positions walked. */
    hitBall: {
      id: "w8h8m5M5:df9dadb86021bc4da15414a4",
      moves:
        '[{"type":"fire","rangeno":0},{"type":"toggleLock","x":1,"y":1},{"type":"toggleLock","x":1,"y":3},{"type":"toggleLock","x":2,"y":1},{"type":"toggleLock","x":1,"y":2},{"type":"toggleLock","x":2,"y":2},{"type":"toggleLock","x":1,"y":4},{"type":"toggleLock","x":2,"y":3},{"type":"fire","rangeno":1},{"type":"toggleLock","x":3,"y":1},{"type":"toggleLock","x":3,"y":2},{"type":"toggleLock","x":3,"y":3},{"type":"fire","rangeno":2},{"type":"toggleLock","x":4,"y":1},{"type":"toggleLock","x":4,"y":2},{"type":"toggleLock","x":4,"y":3},{"type":"fire","rangeno":3},{"type":"toggleLock","x":5,"y":1},{"type":"toggleLock","x":5,"y":2},{"type":"toggleLock","x":5,"y":3},{"type":"fire","rangeno":4},{"type":"toggleLock","x":8,"y":6},{"type":"toggleLock","x":6,"y":1},{"type":"toggleLock","x":8,"y":7},{"type":"toggleLock","x":6,"y":2},{"type":"toggleLock","x":8,"y":5},{"type":"toggleLock","x":6,"y":3},{"type":"toggleLock","x":7,"y":6},{"type":"toggleLock","x":5,"y":4},{"type":"fire","rangeno":5},{"type":"toggleLock","x":6,"y":8},{"type":"toggleLock","x":7,"y":1},{"type":"toggleLock","x":5,"y":8},{"type":"toggleLock","x":7,"y":2},{"type":"toggleLock","x":7,"y":8},{"type":"toggleLock","x":7,"y":3},{"type":"toggleLock","x":6,"y":7},{"type":"toggleLock","x":6,"y":4},{"type":"fire","rangeno":6},{"type":"fire","rangeno":7},{"type":"fire","rangeno":8},{"type":"fire","rangeno":9},{"type":"toggleLock","x":8,"y":2}]',
    },
    /** Held on 41 of 966 positions walked. */
    reflectedEmpty: {
      id: "w8h8m5M5:e917e8b670559bd382ddf3ba",
      moves: [{ type: "fire", rangeno: 0 }],
    },
    /** Held on 238 of 966 positions walked. */
    fireAnother: {
      id: "w8h8m5M5:a4b5528a1a7e455ed81b288b",
      moves: [{ type: "fire", rangeno: 0 }],
    },
    /** Held on 684 of 966 positions walked. */
    settles: {
      id: "w8h8m5M5:df9dadb86021bc4da15414a4",
      moves: [{ type: "fire", rangeno: 0 }],
    },
    /** Held on 12 of 966 positions walked. */
    check: {
      id: "w8h8m5M5:2d1775dc7ab2e71fa58b5abc",
      moves:
        '[{"type":"fire","rangeno":0},{"type":"fire","rangeno":1},{"type":"toggleLock","x":2,"y":1},{"type":"toggleLock","x":4,"y":1},{"type":"toggleLock","x":3,"y":1},{"type":"toggleLock","x":5,"y":1},{"type":"toggleLock","x":1,"y":1},{"type":"toggleLock","x":4,"y":2},{"type":"toggleLock","x":2,"y":2},{"type":"fire","rangeno":2},{"type":"fire","rangeno":4},{"type":"toggleLock","x":6,"y":1},{"type":"fire","rangeno":5},{"type":"toggleLock","x":7,"y":1},{"type":"fire","rangeno":6},{"type":"toggleLock","x":8,"y":1},{"type":"toggleLock","x":1,"y":2},{"type":"toggleLock","x":3,"y":2},{"type":"toggleLock","x":7,"y":2},{"type":"toggleLock","x":5,"y":2},{"type":"toggleLock","x":2,"y":3},{"type":"toggleLock","x":4,"y":3},{"type":"toggleLock","x":6,"y":2},{"type":"toggleBall","x":8,"y":2},{"type":"fire","rangeno":10},{"type":"toggleLock","x":8,"y":3},{"type":"fire","rangeno":11},{"type":"toggleLock","x":8,"y":4},{"type":"toggleLock","x":6,"y":8},{"type":"toggleLock","x":8,"y":5},{"type":"toggleLock","x":5,"y":8},{"type":"toggleLock","x":7,"y":4},{"type":"toggleLock","x":7,"y":8},{"type":"toggleLock","x":6,"y":7},{"type":"fire","rangeno":12},{"type":"toggleLock","x":1,"y":5},{"type":"toggleLock","x":8,"y":6},{"type":"toggleLock","x":1,"y":4},{"type":"toggleLock","x":7,"y":5},{"type":"toggleLock","x":1,"y":6},{"type":"toggleLock","x":2,"y":5},{"type":"fire","rangeno":13},{"type":"toggleLock","x":8,"y":7},{"type":"toggleLock","x":1,"y":7},{"type":"toggleLock","x":7,"y":6},{"type":"toggleLock","x":2,"y":6},{"type":"toggleLock","x":6,"y":5},{"type":"fire","rangeno":14},{"type":"fire","rangeno":15},{"type":"fire","rangeno":16},{"type":"fire","rangeno":17},{"type":"fire","rangeno":19},{"type":"toggleLock","x":4,"y":8},{"type":"fire","rangeno":20},{"type":"toggleLock","x":3,"y":8},{"type":"fire","rangeno":21},{"type":"fire","rangeno":22},{"type":"fire","rangeno":23},{"type":"toggleLock","x":1,"y":8},{"type":"fire","rangeno":24},{"type":"fire","rangeno":25},{"type":"fire","rangeno":28},{"type":"fire","rangeno":29},{"type":"fire","rangeno":30},{"type":"toggleBall","x":1,"y":3},{"type":"toggleBall","x":5,"y":3},{"type":"toggleBall","x":2,"y":8},{"type":"toggleBall","x":8,"y":8}]',
    },
  },
});

/** A ball on the one square no laser reaches, which the count of five fills. */
const pinnedHidden = describeHintPins({
  game,
  params: [P8],
  seeds: 400,
  kinds: {
    hiddenBall:
      /^Every laser's way is settled, and 1 more ball hides on squares no laser reaches\. One of them: put a ball on this square\.$/,
  },
  pins: {
    /** Held on 0 of 32561 positions walked. The board is one an earlier scan
     * of 400 deals found, pasted by hand with the hint's own moves to here. */
    hiddenBall: {
      id: "w8h8m5M5:4fa6ab5019c09e710317f3c0",
      moves:
        '[{"type":"fire","rangeno":0},{"type":"toggleLock","x":1,"y":1},{"type":"toggleLock","x":1,"y":4},{"type":"toggleLock","x":2,"y":1},{"type":"toggleLock","x":1,"y":3},{"type":"toggleLock","x":1,"y":2},{"type":"toggleLock","x":1,"y":5},{"type":"toggleLock","x":2,"y":2},{"type":"toggleLock","x":2,"y":4},{"type":"toggleLock","x":2,"y":3},{"type":"fire","rangeno":1},{"type":"toggleLock","x":3,"y":1},{"type":"toggleLock","x":3,"y":2},{"type":"fire","rangeno":2},{"type":"toggleLock","x":4,"y":1},{"type":"toggleLock","x":4,"y":2},{"type":"fire","rangeno":3},{"type":"toggleLock","x":8,"y":2},{"type":"toggleLock","x":5,"y":1},{"type":"toggleLock","x":8,"y":3},{"type":"toggleLock","x":5,"y":2},{"type":"toggleLock","x":8,"y":1},{"type":"toggleLock","x":4,"y":3},{"type":"toggleLock","x":7,"y":2},{"type":"fire","rangeno":4},{"type":"toggleLock","x":6,"y":1},{"type":"toggleLock","x":8,"y":4},{"type":"toggleLock","x":6,"y":2},{"type":"toggleLock","x":7,"y":3},{"type":"toggleLock","x":5,"y":3},{"type":"fire","rangeno":5},{"type":"toggleLock","x":7,"y":1},{"type":"toggleLock","x":6,"y":3},{"type":"toggleLock","x":7,"y":4},{"type":"toggleBall","x":3,"y":3},{"type":"toggleLock","x":5,"y":4},{"type":"toggleLock","x":6,"y":4},{"type":"toggleBall","x":4,"y":4},{"type":"fire","rangeno":6},{"type":"toggleLock","x":8,"y":5},{"type":"toggleLock","x":7,"y":5},{"type":"fire","rangeno":7},{"type":"toggleLock","x":8,"y":8},{"type":"toggleLock","x":7,"y":8},{"type":"toggleLock","x":8,"y":6},{"type":"toggleLock","x":8,"y":7},{"type":"toggleLock","x":7,"y":6},{"type":"toggleLock","x":7,"y":7},{"type":"fire","rangeno":12},{"type":"fire","rangeno":13},{"type":"toggleLock","x":6,"y":8},{"type":"toggleLock","x":6,"y":6},{"type":"toggleLock","x":6,"y":7},{"type":"toggleBall","x":6,"y":5},{"type":"fire","rangeno":14},{"type":"toggleLock","x":1,"y":7},{"type":"toggleLock","x":1,"y":6},{"type":"toggleLock","x":5,"y":7},{"type":"toggleLock","x":1,"y":8},{"type":"toggleLock","x":2,"y":7},{"type":"fire","rangeno":15},{"type":"toggleLock","x":5,"y":8},{"type":"toggleLock","x":2,"y":8},{"type":"toggleLock","x":4,"y":8},{"type":"toggleLock","x":3,"y":8},{"type":"toggleLock","x":5,"y":6},{"type":"toggleLock","x":2,"y":6},{"type":"toggleLock","x":4,"y":7},{"type":"toggleLock","x":3,"y":7},{"type":"toggleBall","x":2,"y":5},{"type":"toggleLock","x":4,"y":6},{"type":"toggleLock","x":3,"y":6},{"type":"fire","rangeno":19},{"type":"toggleLock","x":5,"y":5},{"type":"toggleLock","x":3,"y":5},{"type":"toggleLock","x":4,"y":5}]',
    },
  },
});

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

  it("rings the square it settles and outlines the laser's ends", () => {
    const { id, moves, step } = pinned("settles");
    const { hint, recording } = renderScenario({ game, id, moves, showHint: true });
    expect(hint?.explanation).toBe(step.explanation);
    const rects = recording.ops.filter((o) => o.op === "rect");
    expect(rects.some((o) => o.color === COL_HINT)).toBe(true);
    expect(rects.some((o) => o.color === COL_HINT_EVIDENCE)).toBe(true);
    expect(recording.ops).toMatchSnapshot();
  });
});

describe("the end of the box", () => {
  it("puts a ball where no laser can tell, when the board must hold more", () => {
    const { id, state: s } = pinnedHidden("hiddenBall");
    expect(answerCount(game.newState(P8, id.slice(id.indexOf(":") + 1)))).toBe(1);
    expect(game.status(follow(s).state)).toBe("solved");
  });

  // The board has one answer, so the count fills the squares no laser reaches,
  // and a known mark on one of them is a mark no finish could keep: the check
  // finds it, and the midend refuses a hint until it comes off.
  it("finds a known mark on the square the count fills", () => {
    const { state: s } = pinnedHidden("hiddenBall");
    expect(game.findMistakes?.(s)).toEqual([]);
    const hidden = [...deduce(s).known.squares()].filter(
      ({ at, holds }) => holds === null && gridGet(s, at.x, at.y) & BALL_CORRECT,
    );
    expect(hidden.length).toBe(1);
    const { at } = hidden[0];
    const marked = game.executeMove(s, { type: "toggleLock", x: at.x, y: at.y });
    expect(game.findMistakes?.(marked)).toEqual([at]);
  });

  it("finds a ball beyond the real ones, wherever no laser could tell", () => {
    const { state: s } = pinned("check");
    expect(game.findMistakes?.(s)).toEqual([]);
    const empty = [...deduce(s).known.squares()].find(
      ({ at }) => !(gridGet(s, at.x, at.y) & (BALL_CORRECT | BALL_GUESS)),
    );
    if (!empty) throw new Error("no empty square");
    const extra = game.executeMove(s, { type: "toggleBall", ...empty.at });
    expect(game.findMistakes?.(extra)).toEqual([empty.at]);
  });
});

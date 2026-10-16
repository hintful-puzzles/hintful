/**
 * Slide's hint (`add-slide-hint`).
 *
 * Each sentence the hint can say is pinned by a position it fires on, through
 * `testing/hint-positions.ts`. What a sentence claims is checked against
 * something the hint did not compute: "makes room for" by playing the plan on
 * without the slide, and "out in N moves" by searching again from the board
 * the slide leaves.
 */

import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { MARK_ALL, outlineSides } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { markSides } from "../../engine/testing/mark-shape.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import type { Point } from "../../engine/types.ts";
import { newSlideDesc } from "./generator.ts";
import { blockCells, hint, hintKeepTrack } from "./hint.ts";
import { slideGame } from "./index.ts";
import { computeReachable, executeMove } from "./moves.ts";
import { COL_HINT, COL_HINT_EVIDENCE } from "./render.ts";
import { findExit, solveBoard } from "./solver.ts";
import {
  encodeDesc,
  MAINANCHOR,
  newState,
  type SlideMove,
  type SlideState,
  status,
} from "./state.ts";

const G = slideGame;
type Step = HintStep<SlideMove>;

const at = (s: SlideState, p: Point): number => p.y * s.w + p.x;

function slideOf(step: Step): { from: number; to: number } {
  if (step.move.kind !== "move") throw new Error("expected a slide");
  return step.move;
}

/** Whether `m` can be made on `s` by a drag, as the player makes it. */
function canSlide(s: SlideState, m: { from: number; to: number }): boolean {
  const reach = new Uint8Array(s.w * s.h);
  computeReachable(s, m.from, reach);
  return reach[m.to] === 1;
}

/**
 * Play `steps` from `state` with slide `i` left out, and say which later
 * slide then cannot be made, with the anchor the block the hint outlined has
 * by then: it follows the block through its own slides on the way.
 */
function stuckWithout(
  state: SlideState,
  steps: readonly Step[],
  i: number,
  outlined: number,
): { at: number; anchor: number } | null {
  let s = state;
  for (let k = 0; k < i; k++) s = executeMove(s, steps[k].move);
  let anchor = outlined;
  for (let j = i + 1; j < steps.length; j++) {
    const m = slideOf(steps[j]);
    if (!canSlide(s, m)) return { at: j, anchor };
    if (m.from === anchor) anchor = m.to;
    s = executeMove(s, steps[j].move);
  }
  return null;
}

const cellKeys = (cells: readonly Point[]): string =>
  cells
    .map((c) => `${c.x},${c.y}`)
    .sort()
    .join(" ");

const pinned = describeHintPins({
  game: G,
  kinds: {
    /** Room made for a slide further on than the next one: the outlined
     * block is not the next step's ringed one. */
    roomLater: {
      leg: (step: Step, _s: SlideState, steps: readonly Step[]) => {
        const next = steps[steps.indexOf(step) + 1];
        return (
          step.rung === "makesRoom" &&
          next !== undefined &&
          cellKeys(stepMarks(step).of("outline", CELL)) !==
            cellKeys(stepMarks(next).of("ring", CELL))
        );
      },
    },
  },
  params: [G.decodeParams("6x7m25"), G.decodeParams("6x7u")],
  seeds: 12,
  descOf: (s: SlideState) =>
    encodeDesc(s.w * s.h, s.board, s.forcefield, s.tx, s.ty, s.minmoves),
  pins: {
    /** Held on 92 of 881 positions walked. */
    roomLater: "6x7m25:w7md1ad1w2d5d1ad1w2a4w2a2d1efewd6ad1efew6,4,4,23",
    /** Held on 626 of 881 positions walked. */
    makesRoom: "6x7m25:w7md1ad1w2d5d1ad1w2a4w2d6d6aefewad1aefew6,4,4,23",
    /** Held on 757 of 881 positions walked. */
    makesRoomForKey: "6x7u:w7md1a2w2d5d1ad1w2a2d5d1w2d6ead1fewad1aefew6,4,4,64",
    /** Held on 12 of 881 positions walked. */
    movesOn: "6x7u:w7md1a2w2d5d1ad6w2aed6aw2aead1fewd6a2d1few6,4,4,53",
    /** Held on 732 of 881 positions walked. */
    keyBlock: "6x7m25:w7md1ad1w2d5d1ad1w2e2ad1w2a2d5d1fewa4few6,4,4,23",
    /** Held on 149 of 881 positions walked. */
    keyOut: "6x7m25:w7ad1ad1w2a4w2d6d6md1w2a2d5d1fewad1e2few6,4,4,23",
  },
});

describe("slide hint: what each sentence claims", () => {
  it("a slide that makes room for a block is one that block's later slide cannot do without", () => {
    let checked = 0;
    for (const kind of ["makesRoom", "makesRoomForKey", "roomLater"] as const) {
      const { state, steps } = pinned(kind);
      let s = state;
      steps.forEach((step, i) => {
        if (step.rung === "makesRoom" || step.rung === "makesRoomForKey") {
          const marks = stepMarks(step);
          // A block's anchor is its first square in reading order.
          const outlined =
            step.rung === "makesRoom"
              ? Math.min(...marks.of("outline", CELL).map((c) => at(s, c)))
              : s.board.indexOf(MAINANCHOR);
          const stuck = stuckWithout(state, steps, i, outlined);
          expect(stuck, `step ${i}: "${step.explanation}"`).not.toBeNull();
          if (stuck) expect(slideOf(steps[stuck.at]).from).toBe(stuck.anchor);
          checked++;
        }
        s = executeMove(s, step.move);
      });
    }
    expect(checked).toBeGreaterThanOrEqual(2);
  });

  it("the key block's count is the fewest moves from the board it leaves", () => {
    const { state, steps, index } = pinned("keyBlock");
    let s = state;
    for (let k = 0; k <= index; k++) s = executeMove(s, steps[k].move);
    const fewest = solveBoard(s.w, s.h, s.board, s.forcefield, s.tx, s.ty, -1).moves;
    expect(steps[index].explanation).toContain(`out in ${fewest} moves`);
  });

  it("the key block's last slide brings it onto the exit", () => {
    const { state, steps, index } = pinned("keyOut");
    let s = state;
    for (let k = 0; k <= index; k++) s = executeMove(s, steps[k].move);
    expect(status(s)).toBe("solved");
  });

  it("a block that stops part way is the next to move on from where it stops", () => {
    const { state, steps, index } = pinned("movesOn");
    const { to } = slideOf(steps[index]);
    const later = steps.slice(index + 1).map(slideOf);
    expect(later.some((m) => m.from === to)).toBe(true);
    void state;
  });

  it("a request offers one chain, ending at the key block's slide", () => {
    const { state, steps } = pinned("keyBlock");
    const last = steps[steps.length - 1];
    let s = state;
    for (const step of steps.slice(0, -1)) {
      expect(s.board[slideOf(step).from]).not.toBe(MAINANCHOR);
      s = executeMove(s, step.move);
    }
    expect(s.board[slideOf(last).from]).toBe(MAINANCHOR);
  });
});

describe("slide hint: a dealt board, read as a player", () => {
  it("reads one chain out loud", () => {
    const p = G.decodeParams("6x7m25");
    const s = newState(p, newSlideDesc(p, randomNew("s-0")).desc);
    const plan = hint(s);
    if (!plan.ok) throw new Error("no plan");
    // Each step's outlined block is the next step's ringed one, so the chain
    // is one errand run backwards from the key block (design D2).
    expect(plan.steps.map((step) => step.explanation)).toEqual([
      "Slide the ringed block into the striped space: that makes room for the outlined block.",
      "Slide the ringed block into the striped space: that makes room for the outlined block.",
      "Slide the ringed block into the striped space: that makes room for the outlined block.",
      "Slide the ringed block into the striped space: that makes room for the key block.",
      "Slide the ringed key block into the striped space: from there it can be out in 20 moves.",
    ]);
    plan.steps.slice(0, 3).forEach((step, k) => {
      const next = plan.steps[k + 1];
      expect(stepMarks(step).of("outline", CELL)).toEqual(
        stepMarks(next).of("ring", CELL),
      );
    });
  });
});

describe("slide hint: the frame", () => {
  /** How many sides a band round `cells` has: one per square side that faces
   * a square outside them. */
  function sidesRound(cells: readonly Point[]): number {
    const keys = new Set(cells.map((c) => `${c.x},${c.y}`));
    let n = 0;
    for (const c of cells) {
      const sides = outlineSides(c.x, c.y, (x, y) => keys.has(`${x},${y}`));
      for (let b = 1; b <= MARK_ALL; b <<= 1) if (sides & b) n++;
    }
    return n;
  }

  it("rings the block, outlines the one it makes room for, and stripes where it goes", () => {
    const pin = pinned("makesRoom");
    const { recording, step } = renderPinnedHint(G, pin);
    const marks = stepMarks(step);
    const ringed = marks.of("ring", CELL);
    const outlined = marks.of("outline", CELL);
    const into = marks.of("stripes", CELL);
    expect(markSides(recording.ops, COL_HINT)).toHaveLength(sidesRound(ringed));
    expect(markSides(recording.ops, COL_HINT_EVIDENCE)).toHaveLength(
      sidesRound(outlined),
    );
    const hatched = recording.ops.filter((o) => o.op === "hatch");
    expect(hatched).toHaveLength(into.length);
    // The ringed block and its space are the slide's own.
    const s = pin.state;
    let before = s;
    for (let k = 0; k < pin.index; k++) before = executeMove(before, pin.steps[k].move);
    const { from, to } = slideOf(step);
    expect(new Set(ringed.map((c) => at(s, c)))).toEqual(
      new Set(blockCells(before, from)),
    );
    const after = executeMove(before, step.move);
    expect(new Set(into.map((c) => at(s, c)))).toEqual(new Set(blockCells(after, to)));
  });
});

describe("slide hint: keeping track", () => {
  it("completes on the hinted slide and drops the plan on any other", () => {
    const { steps, index } = pinned("makesRoom");
    const step = steps[index];
    const { from, to } = slideOf(step);
    expect(hintKeepTrack({ kind: "move", from, to }, step)).toBe("completed");
    expect(hintKeepTrack({ kind: "move", from, to: from }, step)).toBe("off");
  });
});

describe("slide Solve", () => {
  it("solves from the player's position, and replays from the deal where told to", () => {
    const p = G.decodeParams("6x7m25");
    const dealt = newState(p, newSlideDesc(p, randomNew("s-0")).desc);
    const plan = hint(dealt);
    if (!plan.ok) throw new Error("no plan");
    const moved = executeMove(dealt, plan.steps[0].move);

    const solved = G.solve?.(dealt, moved);
    expect(solved).toMatchObject({ ok: true, move: { restart: false } });
    if (solved?.ok) expect(status(executeMove(moved, solved.move))).toBe("solved");

    const fromDeal = findExit(dealt);
    if (fromDeal.kind !== "found") throw new Error("no line from the deal");
    const replayed = executeMove(moved, {
      kind: "solution",
      moves: fromDeal.line,
      restart: true,
    });
    expect(status(replayed)).toBe("solved");
    expect(replayed.movecount).toBe(fromDeal.line.length);
  });
});

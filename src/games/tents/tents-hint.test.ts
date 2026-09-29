/**
 * Tents' explained hint: the claims its narration makes, and what only this
 * game can check.
 *
 * The cross-game guards cover narration form, plan purity, resuming from any
 * position and the overlay reaching the render cache; Tents joined them by
 * declaring `hint()`. What is left here:
 *
 *  - **Following the hint finishes every board it deals, and every step is
 *    true**: after each one the board has no mistake, links included.
 *  - **Every firing stands on the board the player can see.** Its premise
 *    snapshot is exactly the player's board with the links read off it
 *    (`TentsBoard.readLinks`), so no firing rests on a pairing the solver
 *    tied and the board does not show.
 *  - **A link is drawn only for a step that rests on it**: the firing after a
 *    link step could not have fired before it.
 *  - **Every premise and every line case is reached** (docs/games/hints.md
 *    § "Census the reasons, not only the rungs").
 */

import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { FIX_MISTAKES_FIRST } from "../../engine/hint-refusal.ts";
import { randomNew } from "../../engine/random/index.ts";
import { bindingDefects } from "../../engine/testing/hint-binding.ts";
import { boardOf, type TentsHighlights, tentsKeepTrack, tentsPlan } from "./hint.ts";
import { say } from "./hint-text.ts";
import { tentsGame } from "./index.ts";
import { type TentsBoard, type TentsReason, tentsSolve } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_TRICKY,
  DX,
  DY,
  executeMove,
  FLIP,
  MAXDIR,
  NONTENT,
  newState,
  TENT,
  type TentsMove,
  type TentsParams,
  type TentsState,
  TREE,
} from "./state.ts";

type Step = HintStep<TentsMove, TentsHighlights>;

const SHAPES: TentsParams[] = [
  { w: 8, h: 8, diff: DIFF_EASY },
  { w: 8, h: 8, diff: DIFF_TRICKY },
  { w: 10, h: 10, diff: DIFF_EASY },
  { w: 10, h: 10, diff: DIFF_TRICKY },
  { w: 15, h: 15, diff: DIFF_TRICKY },
];
const SEEDS = ["th-a", "th-b", "th-c", "th-d", "th-e", "th-f"];
const CORPUS = SHAPES.flatMap((p) => SEEDS.map((seed) => ({ p, seed })));

const label = (p: TentsParams, seed: string) =>
  `${p.w}x${p.h} ${p.diff === DIFF_EASY ? "Easy" : "Tricky"} / ${seed}`;

function deal(p: TentsParams, seed: string): TentsState {
  return newState(p, tentsGame.newDesc(p, randomNew(label(p, seed))).desc);
}

/** Follow whole plans from `start` to the end, re-asking when one runs out;
 * `each` sees every firing with the board it was planned on. */
function walk(
  start: TentsState,
  each: (f: ReturnType<typeof tentsPlan>["plan"][number], state: TentsState) => void,
): TentsState {
  let state = start;
  for (let asks = 0; asks < 200 && !state.completed; asks++) {
    const { impossible, plan } = tentsPlan(state);
    expect(impossible).toBe(false);
    expect(plan.length, "the hint ran dry").toBeGreaterThan(0);
    for (const p of plan) {
      each(p, state);
      for (const step of p.steps) state = executeMove(state, step.move);
    }
  }
  return state;
}

describe("following the hint finishes every board, one true step at a time", () => {
  for (const { p, seed } of CORPUS) {
    it(label(p, seed), () => {
      let steps = 0;
      const end = walk(deal(p, seed), ({ steps: legs }, before) => {
        let state = before;
        for (const step of legs) {
          steps++;
          expect(step.explanation.length, step.explanation).toBeLessThanOrEqual(120);
          state = executeMove(state, step.move);
          expect(tentsGame.findMistakes?.(state), step.explanation).toEqual([]);
        }
      });
      expect(end.completed, "following the hint did not finish the board").toBe(true);
      expect(steps).toBeGreaterThan(10);
    });
  }
});

/** The board a firing should have reasoned from: the player's, with the links
 * read off it. */
function seen(state: TentsState): TentsBoard {
  const b = boardOf(state);
  expect(b.readLinks()).toBe(0);
  return b;
}

describe("every firing stands on the board the player can see", () => {
  it("holds each premise snapshot to the player's board, links read afresh", () => {
    let firings = 0;
    let unseenLinks = 0;
    for (const { p, seed } of CORPUS) {
      walk(deal(p, seed), ({ firing }, state) => {
        // Every earlier step of the plan has been applied to `state` by the
        // time `walk` hands over a firing, so this is the player's board.
        const b = seen(state);
        expect(Array.from(firing.before.soln)).toEqual(Array.from(b.soln));
        expect(Array.from(firing.before.links)).toEqual(Array.from(b.links));
        firings++;
        // The links a sentence may lean on include ones the player never drew.
        for (let i = 0; i < b.links.length; i++)
          if (b.links[i] && !state.links[i]) unseenLinks++;
      });
    }
    expect(firings).toBeGreaterThan(500);
    // Vacuity: the reading is doing work, not just echoing the drawn links.
    expect(unseenLinks).toBeGreaterThan(100);
  });
});

/** Run the rung behind a reason on `b`, and report whether it fires. */
function rungFires(b: TentsBoard, kind: TentsReason["kind"]): boolean {
  switch (kind) {
    case "noTree":
    case "treesDone":
      return b.grassAwayFromTrees() > 0;
    case "nextToTent":
      return b.grassNextToTents() > 0;
    case "treeSingle":
      return b.treeSingles() > 0;
    case "treeDiagonal":
      return b.treeDiagonalPairs() > 0;
    case "lineCount":
      return b.lineCounts(false) > 0;
    case "lineNeighbors":
      return b.lineCounts(true) > 0;
    case "tentLink":
    case "treeLink":
      return false;
  }
}

describe("a link is drawn only for a step that rests on it", () => {
  // A tent placed for a tree is joined in the same move, as the gesture does;
  // what this holds to account is a step that draws only a link.
  it("the firing after a link could not have fired without it", () => {
    let checked = 0;
    for (const { p, seed } of CORPUS) {
      let pending: TentsBoard | null = null;
      walk(deal(p, seed), ({ firing }, state) => {
        const linkOnly = (k: string) => k === "tentLink" || k === "treeLink";
        if (pending && !linkOnly(firing.reason.kind)) {
          expect(rungFires(pending, firing.reason.kind), firing.reason.kind).toBe(
            false,
          );
          checked++;
        }
        pending = linkOnly(firing.reason.kind) ? seen(state) : null;
      });
    }
    expect(checked).toBeGreaterThan(5);
  });
});

describe("every premise the corpus reaches is reached", () => {
  const KINDS: Record<TentsReason["kind"], true> = {
    noTree: true,
    treesDone: true,
    nextToTent: true,
    treeSingle: true,
    treeDiagonal: true,
    lineCount: true,
    lineNeighbors: true,
    tentLink: true,
    treeLink: true,
  };
  /** The sentences a line count speaks, told apart by their opening words. */
  const LINE_CASES = {
    countMet: /already has|number is 0/,
    allOpen: /has only \d+ open/,
    noSpareRoom: /have room for only/,
    betweenThem: /^Tents never touch, so/,
  };

  it("reaches every kind of premise and every line case", () => {
    const kinds = new Set<string>();
    const cases = new Set<string>();
    for (const { p, seed } of CORPUS) {
      walk(deal(p, seed), ({ firing, steps }) => {
        kinds.add(firing.reason.kind);
        if (firing.reason.kind !== "lineCount") return;
        for (const s of steps)
          for (const [name, re] of Object.entries(LINE_CASES))
            if (re.test(s.explanation)) cases.add(name);
      });
    }
    expect([...kinds].sort()).toEqual(Object.keys(KINDS).sort());
    expect([...cases].sort()).toEqual(Object.keys(LINE_CASES).sort());
  });

  it("says a line's count from the clue, singular and plural", () => {
    const row = {
      kind: "row" as const,
      line: 5,
      squares: [0, 1, 2].map((x) => ({ x, y: 0 })),
    };
    const column = { kind: "column" as const, line: 0, squares: [{ x: 0, y: 0 }] };
    const one = [{ x: 1, y: 0 }];
    const two = [...one, { x: 2, y: 0 }];
    expect(say.countMet(row, 1, two).text).toBe(
      "This row already has its 1 tent, so its open squares must be grass.",
    );
    expect(say.allOpen(column, 1, one).text).toMatch(
      /1 open square, so this square must be a tent/,
    );
    expect(say.noSpareRoom(row, 2, one).text).toMatch(/this one must be a tent\.$/);
  });
});

describe("the player's links", () => {
  /** A board with its solution, and one of its tents beside two trees. */
  function forkedTent() {
    for (const { p, seed } of CORPUS) {
      const state = deal(p, seed);
      const puzzle = Int8Array.from(state.grid, (v) => (v === TREE ? TREE : 0));
      const { soln, links } = tentsSolve(p.w, p.h, puzzle, state.numbers, DIFF_TRICKY);
      for (let i = 0; i < soln.length; i++) {
        if (soln[i] !== TENT) continue;
        const trees: number[] = [];
        for (let d = 1; d < MAXDIR; d++) {
          const x = (i % p.w) + DX(d);
          const y = Math.floor(i / p.w) + DY(d);
          if (x >= 0 && x < p.w && y >= 0 && y < p.h && soln[y * p.w + x] === TREE)
            trees.push(d);
        }
        if (trees.length < 2) continue;
        const right = trees.find((d) => d === links[i]);
        const wrong = trees.find((d) => d !== links[i]);
        if (right === undefined || wrong === undefined) continue;
        const x = i % p.w;
        const y = Math.floor(i / p.w);
        const placed = executeMove(state, {
          type: "cells",
          cells: [{ x, y, v: TENT }],
        });
        return { placed, x, y, right, wrong, tent: i };
      }
    }
    throw new Error("no tent beside two trees in the corpus");
  }

  it("flags a link no pairing of the solution holds, and the hint waits for it", () => {
    const { placed, x, y, wrong, right } = forkedTent();
    const linked = executeMove(placed, { type: "link", x, y, d: wrong, on: true });
    const mistakes = tentsGame.findMistakes?.(linked) ?? [];
    // Whether this one link is wrong depends on the rest of the pairing: it is
    // wrong exactly when the mistake check says so, and then the hint refuses.
    if (mistakes.some((m) => m.kind === "link")) {
      expect(tentsGame.hint?.(linked)).toEqual({
        ok: false,
        error: FIX_MISTAKES_FIRST,
      });
    }
    const good = executeMove(placed, { type: "link", x, y, d: right, on: true });
    expect(tentsGame.findMistakes?.(good)).toEqual([]);
  });

  it("finds a wrong link somewhere in the corpus", () => {
    // The test above is conditional, so this is its vacuity guard: over every
    // tent beside two trees, some wrong link must be flagged.
    let flagged = 0;
    for (const { p, seed } of CORPUS.slice(0, 12)) {
      const state = deal(p, seed);
      const puzzle = Int8Array.from(state.grid, (v) => (v === TREE ? TREE : 0));
      const { soln, links } = tentsSolve(p.w, p.h, puzzle, state.numbers, DIFF_TRICKY);
      const tents = [...soln.keys()].filter((i) => soln[i] === TENT);
      const all = executeMove(state, {
        type: "cells",
        cells: tents.map((i) => ({ x: i % p.w, y: Math.floor(i / p.w), v: TENT })),
      });
      for (const i of tents)
        for (let d = 1; d < MAXDIR; d++) {
          const j = i + DY(d) * p.w + DX(d);
          const x = (i % p.w) + DX(d);
          const y = Math.floor(i / p.w) + DY(d);
          if (
            d === links[i] ||
            x < 0 ||
            x >= p.w ||
            y < 0 ||
            y >= p.h ||
            soln[j] !== TREE
          )
            continue;
          const s = executeMove(all, {
            type: "link",
            x: i % p.w,
            y: Math.floor(i / p.w),
            d,
            on: true,
          });
          if (tentsGame.findMistakes?.(s).some((m) => m.kind === "link")) flagged++;
        }
    }
    expect(flagged).toBeGreaterThan(0);
  });

  it("takes a drawn link as given and never asks for it again", () => {
    const { placed, x, y, right, tent } = forkedTent();
    const linked = executeMove(placed, { type: "link", x, y, d: right, on: true });
    const { plan } = tentsPlan(linked);
    for (const { firing } of plan) expect(firing.link?.tent).not.toBe(tent);
    expect(Array.from(seen(linked).links)).toContain(right);
  });
});

describe("following a step by hand", () => {
  // A step's words hold functions, so a copy clones only the data keep-track
  // rewrites in place.
  const copy = (s: Step): Step => ({
    ...s,
    move: structuredClone(s.move),
    highlights: structuredClone(s.highlights),
  });

  /** The first step in the corpus deciding at least `n` grass squares. */
  function grassStep(n: number): { state: TentsState; step: Step } {
    for (const { p, seed } of CORPUS) {
      const state = deal(p, seed);
      const res = tentsGame.hint?.(state);
      if (!res?.ok) continue;
      const step = (res.steps as Step[]).find(
        (s) =>
          s.move.type === "cells" &&
          s.move.cells.length >= n &&
          s.move.cells[0].v === NONTENT,
      );
      if (step && step === res.steps[0]) return { state, step: copy(step) };
    }
    throw new Error("no opening grass step");
  }

  it("shrinks a step square by square, and completes on the last", () => {
    const { state, step } = grassStep(2);
    if (step.move.type !== "cells") throw new Error("not a cells step");
    const [first, ...rest] = step.move.cells;
    const one: TentsMove = { type: "cells", cells: [first] };
    const before = step.explanation;
    expect(tentsKeepTrack(one, step, state)).toBe("onTrack");
    expect(step.highlights?.targets).toHaveLength(rest.length);
    // Its words shrink with it, naming just the rings left.
    const legend = tentsGame.hintMarks;
    if (!legend) throw new Error("Tents declares its marks");
    expect(bindingDefects(step, legend)).toEqual([]);
    if (rest.length === 1) expect(step.explanation).not.toBe(before);
    const after = executeMove(state, one);
    expect(tentsKeepTrack({ type: "cells", cells: rest }, step, after)).toBe(
      "completed",
    );
  });

  it("goes off a step for a square it does not ask for, or a tent where it asks grass", () => {
    const { state, step } = grassStep(1);
    if (step.move.type !== "cells") throw new Error("not a cells step");
    const target = step.move.cells[0];
    const tent: TentsMove = { type: "cells", cells: [{ ...target, v: TENT }] };
    expect(tentsKeepTrack(tent, step, state)).toBe("off");
    const other = [...state.grid.keys()].find(
      (i) =>
        state.grid[i] === 0 &&
        !(
          step.move.type === "cells" &&
          step.move.cells.some((c) => c.y * state.w + c.x === i)
        ),
    );
    if (other === undefined) throw new Error("no other open square");
    const stray: TentsMove = {
      type: "cells",
      cells: [{ x: other % state.w, y: Math.floor(other / state.w), v: NONTENT }],
    };
    expect(tentsKeepTrack(stray, step, state)).toBe("off");
  });

  it("takes a tree's tent placed by a click as progress, and the link as the rest", () => {
    for (const { p, seed } of CORPUS) {
      let found: { state: TentsState; step: Step } | null = null;
      walk(deal(p, seed), ({ firing, steps }, state) => {
        if (!found && firing.reason.kind === "treeSingle")
          found = { state, step: steps[0] };
      });
      if (!found) continue;
      const { state, step } = found as { state: TentsState; step: Step };
      if (step.move.type !== "link")
        throw new Error("a tree's tent is placed by a link");
      const { x, y } = step.move;
      expect(state.grid[y * p.w + x]).toBe(0);
      const click: TentsMove = { type: "cells", cells: [{ x, y, v: TENT }] };
      const followed = copy(step);
      expect(tentsKeepTrack(click, followed, state)).toBe("onTrack");
      const placed = executeMove(state, click);
      expect(tentsKeepTrack(followed.move, followed, placed)).toBe("completed");
      // The combined move itself completes it at once.
      expect(tentsKeepTrack(step.move, copy(step), state)).toBe("completed");
      return;
    }
    throw new Error("no opening tree-single step in the corpus");
  });

  it("completes a link step by the link, from either end", () => {
    for (const { p, seed } of CORPUS) {
      let found: { state: TentsState; step: Step } | null = null;
      walk(deal(p, seed), ({ steps }, state) => {
        const s = steps[0];
        if (!found && s.move.type === "link") found = { state, step: s };
      });
      if (!found) continue;
      const { state, step } = found as { state: TentsState; step: Step };
      if (step.move.type !== "link") throw new Error("not a link step");
      const { x, y, d } = step.move;
      // The same link spelled from the tree's end.
      const fromTree: TentsMove = {
        type: "link",
        x: x + DX(d),
        y: y + DY(d),
        d: FLIP(d),
        on: true,
      };
      expect(tentsKeepTrack(fromTree, copy(step), state)).toBe("completed");
      return;
    }
    throw new Error("no link step in the corpus");
  });
});

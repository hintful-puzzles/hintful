/**
 * Tests for the Singles (Hitori) explained deduction hint.
 *
 * Tier 1: `deduceHintPlan` records the right reason per deduction (crafted
 * boards for the rarer once-only rules, generated boards for the cascade /
 * connectivity / offset rules); `hint()` returns a plan that solves the
 * board, groups a two-cell firing into one step, gives every step visible
 * evidence, and refuses on a solved/mistaken board; `hintKeepTrack`
 * completes/onTracks/offs. Tier 2.5: a render-scenario snapshot of a hint
 * frame (the blue target + evidence, numbers still drawn).
 */
import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { bindingDefects } from "../../engine/testing/hint-binding.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing, markSides } from "../../engine/testing/mark-shape.ts";
import { opsOfKind } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import type { Point } from "../../engine/types.ts";
import { type SinglesHint, singlesGame } from "./index.ts";
import {
  COL_HINT,
  COL_HINT_BLACKREF,
  COL_HINT_CELL,
  COL_HINT_WHITEREF,
} from "./render.ts";
import { deduceHintPlan, solveSpecific } from "./solver.ts";
import {
  DIFF_ANY,
  F_BLACK,
  makeState,
  newState,
  type SinglesMove,
  type SinglesParams,
  type SinglesState,
} from "./state.ts";

function craft(w: number, h: number, nums: number[]): SinglesState {
  return makeState(w, h, Int8Array.from(nums));
}

function fromSeed(p: SinglesParams, seed: string): SinglesState {
  const { desc } = singlesGame.newDesc(p, randomNew(seed));
  return newState(p, desc);
}

type Step = HintStep<SinglesMove, SinglesHint>;

const stripes = (step: Step): number => stepMarks(step).of("stripes", CELL).length;

/** The rules a crafted board does not reach, each named for the reason the
 * recorder gives it and found by the sentence only it says. */
const RULE_SENTENCES = {
  adjBlack: /touch(?:es)? a black square/,
  // boxedIn also cites an outlined white square, so this is the phrase only
  // sameLine says.
  sameLine: /shares? (?:a line|this row|this column) with/,
  boxedIn: /last neighbor that isn't black/,
  split: /would cut some of/,
  offset: /black next to each other/,
} as const satisfies Record<string, RegExp>;

const pinned = describeHintPins({
  game: singlesGame,
  params: [{ w: 6, h: 6, diff: "tricky" }],
  kinds: {
    ...RULE_SENTENCES,
    oneCell: (step: Step) => step.move.sets.length === 1,
    // Several rules (offset, corner-4) force two cells in one firing.
    twoCells: (step: Step) => step.move.sets.length === 2,
    touchingPairLine: (step: Step) =>
      /touch, so one of them stays white/.test(step.explanation) && stripes(step) > 0,
    sharedLine: (step: Step) =>
      /shares? (?:this row|this column) with/.test(step.explanation) &&
      stripes(step) > 0,
  },
  pins: {
    /** Held on 92 of 272 positions walked. */
    adjBlack: {
      id: "6x6dk:146214162623436526534361613462465334",
      moves:
        '[{"sets":[{"x":2,"y":1,"value":"circle"}]},{"sets":[{"x":4,"y":1,"value":"black"}]}]',
    },
    /** Held on 99 of 272 positions walked. */
    sameLine: {
      id: "6x6dk:146214162623436526534361613462465334",
      moves: [{ sets: [{ x: 2, y: 1, value: "circle" }] }],
    },
    /** Held on 29 of 272 positions walked. */
    boxedIn: {
      id: "6x6dk:146214162623436526534361613462465334",
      moves:
        '[{"sets":[{"x":2,"y":1,"value":"circle"}]},{"sets":[{"x":4,"y":1,"value":"black"}]},{"sets":[{"x":3,"y":1,"value":"circle"},{"x":5,"y":1,"value":"circle"},{"x":4,"y":0,"value":"circle"},{"x":4,"y":2,"value":"circle"}]},{"sets":[{"x":0,"y":0,"value":"black"}]},{"sets":[{"x":1,"y":0,"value":"circle"},{"x":0,"y":1,"value":"circle"}]},{"sets":[{"x":5,"y":0,"value":"black"}]},{"sets":[{"x":1,"y":1,"value":"black"}]},{"sets":[{"x":1,"y":2,"value":"circle"}]},{"sets":[{"x":1,"y":3,"value":"black"}]},{"sets":[{"x":0,"y":3,"value":"circle"},{"x":2,"y":3,"value":"circle"},{"x":1,"y":4,"value":"circle"}]},{"sets":[{"x":3,"y":4,"value":"circle"}]},{"sets":[{"x":4,"y":5,"value":"circle"}]},{"sets":[{"x":3,"y":5,"value":"black"}]},{"sets":[{"x":2,"y":5,"value":"circle"}]},{"sets":[{"x":5,"y":4,"value":"circle"}]}]',
    },
    /** Held on 8 of 272 positions walked. */
    split: {
      id: "6x6dk:231635324553435412511344463361362544",
      moves:
        '[{"sets":[{"x":0,"y":3,"value":"circle"}]},{"sets":[{"x":1,"y":1,"value":"circle"}]},{"sets":[{"x":4,"y":4,"value":"circle"}]},{"sets":[{"x":1,"y":4,"value":"black"}]},{"sets":[{"x":0,"y":4,"value":"circle"},{"x":2,"y":4,"value":"circle"},{"x":1,"y":3,"value":"circle"},{"x":1,"y":5,"value":"circle"}]},{"sets":[{"x":2,"y":3,"value":"black"}]},{"sets":[{"x":3,"y":3,"value":"circle"},{"x":2,"y":2,"value":"circle"}]},{"sets":[{"x":3,"y":4,"value":"black"}]},{"sets":[{"x":0,"y":2,"value":"black"}]},{"sets":[{"x":1,"y":2,"value":"circle"},{"x":0,"y":1,"value":"circle"}]},{"sets":[{"x":5,"y":1,"value":"black"},{"x":0,"y":5,"value":"black"}]},{"sets":[{"x":4,"y":1,"value":"circle"},{"x":5,"y":0,"value":"circle"},{"x":5,"y":2,"value":"circle"}]},{"sets":[{"x":3,"y":1,"value":"black"}]},{"sets":[{"x":2,"y":1,"value":"circle"},{"x":3,"y":0,"value":"circle"},{"x":3,"y":2,"value":"circle"}]},{"sets":[{"x":1,"y":0,"value":"black"}]},{"sets":[{"x":0,"y":0,"value":"circle"},{"x":2,"y":0,"value":"circle"}]},{"sets":[{"x":3,"y":5,"value":"circle"}]},{"sets":[{"x":5,"y":4,"value":"circle"}]},{"sets":[{"x":4,"y":0,"value":"circle"}]},{"sets":[{"x":2,"y":5,"value":"circle"}]}]',
    },
    /** Held on 4 of 272 positions walked. */
    offset: {
      id: "6x6dk:122513631454336424114662242615325532",
      moves:
        '[{"sets":[{"x":1,"y":4,"value":"circle"}]},{"sets":[{"x":4,"y":1,"value":"circle"}]},{"sets":[{"x":4,"y":2,"value":"circle"}]},{"sets":[{"x":5,"y":4,"value":"circle"}]}]',
    },
    /** Held on 190 of 272 positions walked. */
    oneCell: "6x6dk:146214162623436526534361613462465334",
    /** Held on 49 of 272 positions walked. */
    twoCells: {
      id: "6x6dk:614262562311433246423351441133651123",
      moves: [{ sets: [{ x: 0, y: 3, value: "circle" }] }],
    },
    /** Held on 3 of 272 positions walked. */
    touchingPairLine: {
      id: "6x6dk:445642432165334561225311213556453244",
      moves: [{ sets: [{ x: 3, y: 3, value: "circle" }] }],
    },
    /** Held on 88 of 272 positions walked. */
    sharedLine: {
      id: "6x6dk:146214162623436526534361613462465334",
      moves: [{ sets: [{ x: 2, y: 1, value: "circle" }] }],
    },
  },
});

describe("deduceHintPlan records the deduction reason", () => {
  it("sandwich: two equal numbers one apart force the middle white", () => {
    // Row 0: 1 2 1  → the '2' between the two '1's must stay white.
    const s = craft(3, 2, [1, 2, 1, 3, 1, 2]);
    const plan = deduceHintPlan(s);
    const r = plan.find((m) => m.reason.kind === "sandwich");
    expect(r).toBeDefined();
    expect(r?.op).toBe(1); // OP_CIRCLE (white)
    expect(r).toMatchObject({ x: 1, y: 0 });
    if (r?.reason.kind === "sandwich") {
      expect(r.reason.ends).toEqual([
        { x: 0, y: 0 },
        { x: 2, y: 0 },
      ]);
    }
  });

  it("pair: an adjacent equal pair shades the other copies in the line", () => {
    // Row 0: 1 1 2 1 → the lone '1' at x=3 must be shaded.
    const s = craft(4, 2, [1, 1, 2, 1, 3, 4, 2, 4]);
    const plan = deduceHintPlan(s);
    const r = plan.find((m) => m.reason.kind === "pair");
    expect(r).toBeDefined();
    expect(r?.op).toBe(0); // OP_BLACK
    expect(r).toMatchObject({ x: 3, y: 0 });
  });

  it("corner3: three matching numbers in a 2x2 corner force the apex black", () => {
    const s = craft(2, 2, [1, 1, 1, 2]);
    const plan = deduceHintPlan(s);
    expect(plan.some((m) => m.reason.kind === "corner3")).toBe(true);
  });

  it("corner2: two matching numbers in a 2x2 corner force a neighbor white", () => {
    const s = craft(2, 2, [1, 1, 2, 3]);
    const plan = deduceHintPlan(s);
    expect(plan.some((m) => m.reason.kind === "corner2")).toBe(true);
  });

  it("corner4: all four matching shade the diagonal via the box-in argument", () => {
    // Whole 2x2 board all equal — only the corner+inner diagonal can be
    // shaded without stranding the grid-corner white. Narration names the
    // value and uses the same box-in language as corner3, never the false
    // "only pair that leaves one white per line" premise.
    const s = craft(2, 2, [4, 4, 4, 4]);
    const plan = deduceHintPlan(s);
    expect(plan.some((m) => m.reason.kind === "corner4")).toBe(true);
    const res = singlesGame.hint?.(s);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    const step = res.steps[0];
    expect(step.explanation).toContain("box it in");
    expect(step.explanation).toContain("4");
    expect(step.explanation).not.toContain("one white per line");
    // One firing forces both diagonal cells, shaded.
    const hl = step.highlights as SinglesHint;
    expect(hl.targets).toHaveLength(2);
    expect(hl.targets.every((t) => t.value === "black")).toBe(true);
  });

  it("covers the cascade / connectivity / offset rules on generated boards", () => {
    for (const k of Object.keys(RULE_SENTENCES) as (keyof typeof RULE_SENTENCES)[]) {
      // The step a hint opens with is the recorder's first firing.
      expect(deduceHintPlan(pinned(k).state)[0].reason.kind).toBe(k);
    }
  });
});

describe("hint", () => {
  it("returns a plan whose moves are legal and solve the board", () => {
    const s = fromSeed({ w: 6, h: 6, diff: "tricky" }, "hint-plan");
    const res = singlesGame.hint?.(s);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    expect(res.steps.length).toBeGreaterThan(0);
    expect(res.steps[0].explanation.length).toBeGreaterThan(0);

    let cur = s;
    for (const step of res.steps) cur = singlesGame.executeMove(cur, step.move);
    expect(singlesGame.status(cur)).toBe("solved");
  });

  it("emits a two-cell firing (offset / corner-4) as a single step", () => {
    const { step } = pinned("twoCells");
    // Every cell carries its forced value, in the one step's move.
    expect((step.highlights as SinglesHint).targets).toEqual(step.move.sets);
  });

  it("a hint always makes progress from any partial position (resumable solve)", () => {
    // solveSpecific is written to run from an empty board, and its cascade only
    // propagates from cells it changes this run, so resumed from the player's
    // marks it stalls unless they are primed. Walk each board to completion one
    // hinted move at a time, recomputing the plan after every move so
    // deduceHintPlan runs from many partial positions; it must never give up
    // before solved.
    for (const seed of ["sh-1", "sh-2", "sh-3", "hint-plan"]) {
      let s = fromSeed({ w: 6, h: 6, diff: "tricky" }, seed);
      let guard = 0;
      while (singlesGame.status(s) !== "solved") {
        expect(guard++).toBeLessThan(200);
        const res = singlesGame.hint?.(s);
        expect(res?.ok).toBe(true); // never "no further move" on a solvable board
        if (!res?.ok) break;
        s = singlesGame.executeMove(s, res.steps[0].move);
      }
      expect(singlesGame.status(s)).toBe("solved");
    }
  });

  it("offset: narration names the pair values and walks the contradiction arc", () => {
    const { step } = pinned("offset");
    expect(step.explanation).toMatch(/\d/); // concrete value(s)
    expect(step.explanation).toContain("can't touch");
    expect(step.explanation).not.toContain("across from it");
    // "overlap" was geometrically false — the pairs can span a whole line.
    expect(step.explanation).not.toContain("overlap");
    // Leads with the indication — names the spotted pattern first.
    expect(step.explanation).toMatch(/^There's a pair of \d+s in one (column|row)/);
  });

  it("gives every step visible evidence (an area to shade or a premise to ring)", () => {
    for (const seed of ["hint-plan", "sh-1", "sh-2", "evidence-3"]) {
      const s = fromSeed({ w: 6, h: 6, diff: "tricky" }, seed);
      const res = singlesGame.hint?.(s);
      if (!res?.ok) throw new Error("expected a plan");
      for (const step of res.steps) {
        const hl = step.highlights as SinglesHint;
        const outlined = stepMarks(step).of("outline", CELL);
        expect(outlined.length).toBeGreaterThan(0);
        // The three roles (target / evidence / strand) never overlap: the
        // strand is outlined, and nothing outlined is a target.
        const key = (c: Point) => `${c.x},${c.y}`;
        const targets = new Set(hl.targets.map(key));
        const outlinedKeys = new Set(outlined.map(key));
        expect(outlined.some((e) => targets.has(key(e)))).toBe(false);
        expect(hl.strand.every((c) => outlinedKeys.has(key(c)))).toBe(true);
      }
    }
  });

  it("separates a corner deduction's protected corner from the matching pair", () => {
    // The corner is its own `strand` role, disjoint from the matching
    // `evidence`, so it never reads as one of the matching numbers. Top-left
    // 2×2 = [[4,3],[5,3]] → the two 3s match (evidence), the 4 is the
    // protected corner (strand), the 5 is forced white (target).
    const s = craft(2, 2, [4, 3, 5, 3]);
    const res = singlesGame.hint?.(s);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    const cornerStep = res.steps.find(
      (st) => (st.highlights as SinglesHint).strand.length > 0,
    );
    expect(cornerStep).toBeDefined();
    const hl = cornerStep?.highlights as SinglesHint;
    // The corner (4 at 0,0) is the strand; the matching pair (the two 3s)
    // is the shaded evidence; the corner is not among them.
    expect(hl.strand).toEqual([{ x: 0, y: 0 }]);
    const evidence = stepMarks(cornerStep)
      .of("outline", CELL)
      .filter((e) => !(e.x === 0 && e.y === 0));
    expect(evidence.length).toBeGreaterThanOrEqual(1);
    // Narration opens on the spotted pattern, names the actual numbers, and
    // follows the contradiction arc (the touching pair → shading the target →
    // trapping the corner), never the confusing "two corner squares".
    expect(cornerStep?.explanation).toMatch(
      /^A touching pair of 3s sits at the corner/,
    );
    expect(cornerStep?.explanation).toContain("corner 4");
    expect(cornerStep?.explanation).toContain("boxed in");
    expect(cornerStep?.explanation).not.toContain("two corner squares");
  });

  it("counts the board its plan finishes as solved, so the midend refuses it", () => {
    const s = fromSeed({ w: 6, h: 6, diff: "tricky" }, "hint-solved");
    const res0 = singlesGame.hint?.(s);
    if (!res0?.ok) throw new Error("expected a plan");
    let cur = s;
    for (const step of res0.steps) cur = singlesGame.executeMove(cur, step.move);
    expect(singlesGame.status(cur)).toBe("solved");
  });

  it("flags a solution-black cell circled, so the midend refuses it", () => {
    const p: SinglesParams = { w: 6, h: 6, diff: "tricky" };
    const s = fromSeed(p, "hint-mistake");
    const sol = makeState(p.w, p.h, s.nums);
    expect(solveSpecific(sol, DIFF_ANY, false)).toBe(1);
    // Mark a solution-black cell white → a mistake.
    const blackIdx = sol.flags.findIndex((f) => (f & F_BLACK) !== 0);
    const wrong = singlesGame.executeMove(s, {
      sets: [{ x: blackIdx % p.w, y: (blackIdx / p.w) | 0, value: "circle" }],
    });
    expect(singlesGame.findMistakes?.(wrong).length ?? 0).toBeGreaterThan(0);
  });
});

describe("hintKeepTrack", () => {
  it("completes on the hinted move, offs on a deviation", () => {
    // A single-cell step (the common case).
    const { step, state: s } = pinned("oneCell");
    const t = (step.highlights as SinglesHint).targets[0];

    const right: SinglesMove = { sets: [{ x: t.x, y: t.y, value: t.value }] };
    expect(singlesGame.hintKeepTrack?.(right, step, s)).toBe("completed");

    const wrongValue = t.value === "black" ? "circle" : "black";
    expect(
      singlesGame.hintKeepTrack?.(
        { sets: [{ x: t.x, y: t.y, value: wrongValue }] },
        step,
        s,
      ),
    ).toBe("off");

    expect(
      singlesGame.hintKeepTrack?.(
        { sets: [{ x: (t.x + 1) % s.w, y: t.y, value: t.value }] },
        step,
        s,
      ),
    ).toBe("off");
  });

  it("onTracks a multi-cell step filled one cell at a time, then completes", () => {
    const { step, state } = pinned("twoCells");
    const [a, b] = (step.highlights as SinglesHint).targets;

    // Fill the first cell only → onTrack, step shrinks to the second.
    expect(
      singlesGame.hintKeepTrack?.(
        { sets: [{ x: a.x, y: a.y, value: a.value }] },
        step as never,
        state,
      ),
    ).toBe("onTrack");
    expect(step.move.sets).toEqual([{ x: b.x, y: b.y, value: b.value }]);
    // The shrunk step's words name only the square left, over the board the
    // first fill left.
    const filled = singlesGame.executeMove(state, {
      sets: [{ x: a.x, y: a.y, value: a.value }],
    });
    expect(
      bindingDefects(singlesGame, filled, singlesGame.newUi(filled), step as never),
    ).toEqual([]);

    // Now fill the second → completed.
    expect(
      singlesGame.hintKeepTrack?.(
        { sets: [{ x: b.x, y: b.y, value: b.value }] },
        step as never,
        state,
      ),
    ).toBe("completed");
  });
});

/** The frame a pinned position's hint draws, through a real `Midend`. */
function hintFrame(kind: Parameters<typeof pinned>[0]) {
  const { id, moves, step } = pinned(kind);
  const result = renderScenario({ game: singlesGame, id, moves, showHint: true });
  expect(result.hint?.explanation).toBe(step.explanation);
  return { ...result, step };
}

describe("singles hint: the line a sentence names", () => {
  it.each([
    ["a touching pair", "touchingPairLine"],
    ["a number sharing a line with an outlined white one", "sharedLine"],
  ] as const)("%s hatches the one row or column it names", (_, kind) => {
    const { recording, step } = hintFrame(kind);
    const line = stepMarks(step).of("stripes", CELL);
    // One whole row or column, through every target.
    const row = line.every((c) => c.y === line[0].y);
    expect(line).toHaveLength(6);
    for (const t of (step.highlights as SinglesHint).targets) {
      expect(line.some((c) => c.x === t.x && c.y === t.y)).toBe(true);
    }
    const hatches = opsOfKind(recording.ops, "hatch");
    expect(hatches).toHaveLength(6);
    expect(new Set(hatches.map((h) => (row ? h.y : h.x))).size).toBe(1);
  });
});

describe("singles hint render", () => {
  it("rings the hint target, with evidence and numbers", () => {
    const { recording, step } = hintFrame("oneCell");
    const ops = recording.ops;
    // Every Singles cell carries a number, so the target is **ringed**, never
    // filled — four thin rects and no solid one.
    const forced = (step.highlights as SinglesHint).targets;
    expectRing(ops, COL_HINT, forced.length);
    expect(
      markSides(ops, COL_HINT_CELL).length > 0 ||
        // a decided premise is ringed in its own legend color rather than here
        markSides(ops, COL_HINT_BLACKREF).length > 0 ||
        markSides(ops, COL_HINT_WHITEREF).length > 0,
    ).toBe(true);
    // Numbers are still rendered (clue digits not hidden by the overlay).
    expect(ops.some((o) => o.op === "text")).toBe(true);
    expect(ops).toMatchSnapshot();
  });

  it("rings a cited shaded square in COL_HINT_BLACKREF, distinct from the blue target", () => {
    // An adjBlack frame: a decided black square forces a neighbor white. The
    // black premise must ring in the black-ref legend color, not the same blue
    // as the forced cell.
    const { recording } = hintFrame("adjBlack");
    const ops = recording.ops;
    const color = (c: number) => ops.some((o) => "color" in o && o.color === c);
    expect(color(COL_HINT_BLACKREF)).toBe(true); // cited black premise ring
    expect(color(COL_HINT)).toBe(true); // forced cell, a different color
    expect(COL_HINT_BLACKREF).not.toBe(COL_HINT);
  });

  it("outlines a cited circled square in COL_HINT_WHITEREF", () => {
    // A sameLine frame: a circled white square forces line-mates shaded. The
    // white premise is outlined in the white-ref legend color.
    const { recording } = hintFrame("sameLine");
    const ops = recording.ops;
    expect(ops.some((o) => "color" in o && o.color === COL_HINT_WHITEREF)).toBe(true);
  });
});

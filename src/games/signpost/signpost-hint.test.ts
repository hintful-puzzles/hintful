import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { opsOfKind } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { newSignpostDesc } from "./generator.ts";
import { type SignpostHint, type SignpostRung, signpostKeepTrack } from "./hint.ts";
import { signpostGame } from "./index.ts";
import { COL_HINT } from "./render.ts";
import type { SignpostMove, SignpostParams, SignpostState } from "./state.ts";

type Step = HintStep<SignpostMove, SignpostHint, SignpostRung>;

const SIZES: SignpostParams[] = [
  { w: 4, h: 4, forceCornerStart: true },
  { w: 5, h: 5, forceCornerStart: false },
  { w: 6, h: 6, forceCornerStart: true },
  { w: 7, h: 7, forceCornerStart: false },
];
const SEEDS = ["a", "b", "c", "d"];

/** Which sentence a step speaks: its rung, and the marks that decide the
 * rung's wording. */
function arm(step: Step): string {
  const h = step.highlights;
  if (!h) return "none";
  switch (step.rung) {
    case "follows":
      return "follows";
    case "onlyNext":
      return h.line.length > 0 ? "onlyNext" : "onlyNextAlone";
    case "onlyBefore":
      return h.others.length > 0 ? "onlyBeforeRivals" : "onlyBeforeAlone";
  }
}

function hintOf(state: SignpostState): Step[] {
  const res = signpostGame.hint?.(state);
  if (!res?.ok) throw new Error(`no hint: ${res?.error}`);
  return res.steps;
}

/** Play `steps` on `state`, which the plan was made for. */
function play(state: SignpostState, steps: readonly Step[]): SignpostState {
  let s = state;
  for (const step of steps) s = signpostGame.executeMove(s, step.move);
  return s;
}

describe("signpost hint from the player's own positions", () => {
  const reached = new Map<string, number>();

  for (const p of SIZES)
    for (const seed of SEEDS) {
      it(`${p.w}x${p.h} ${seed}: finishes from fresh and from halfway`, () => {
        const { desc } = newSignpostDesc(p, randomNew(`signpost-hint-${seed}`));
        const fresh = signpostGame.newState(p, desc);
        const plan = hintOf(fresh);
        for (const step of plan)
          reached.set(arm(step), (reached.get(arm(step)) ?? 0) + 1);
        expect(signpostGame.status(play(fresh, plan))).toBe("solved");

        // Halfway through, the plan from there finishes too.
        const half = play(fresh, plan.slice(0, plan.length >> 1));
        expect(signpostGame.status(play(half, hintOf(half)))).toBe("solved");
      });
    }

  it("walked every arm the hint speaks", () => {
    // Registered last, so every board above has been walked.
    for (const a of [
      "follows",
      "onlyNext",
      "onlyNextAlone",
      "onlyBeforeRivals",
      "onlyBeforeAlone",
    ])
      expect(reached.get(a) ?? 0, a).toBeGreaterThan(0);
  });
});

describe("signpost hint keep-track", () => {
  it("completes on the step's own link and goes off on any other", () => {
    const step = {
      move: { type: "link", fromX: 0, fromY: 0, toX: 1, toY: 0 },
      rung: "follows",
      explanation: "",
      highlights: {
        arrow: { x: 0, y: 0 },
        target: { x: 1, y: 0 },
        line: [],
        others: [],
      },
    } as Step;
    expect(signpostKeepTrack(step.move, step)).toBe("completed");
    expect(
      signpostKeepTrack({ type: "link", fromX: 0, fromY: 0, toX: 2, toY: 0 }, step),
    ).toBe("off");
    expect(signpostKeepTrack({ type: "unlinkNext", x: 0, y: 0 }, step)).toBe("off");
  });
});

const pinned = describeHintPins({
  game: signpostGame,
  params: [SIZES[1]],
  // An arrow with several squares along it, which the frame test stripes.
  kinds: { onlyNextOfSeveral: (s) => arm(s) === "onlyNext" },
  pins: {
    /** Held on 134 of 246 positions walked. */
    onlyNextOfSeveral: "5x5:degffe1egegb4eccacbbagca25aah",
    /** Held on 206 of 246 positions walked. */
    follows: "5x5:cgdffd1bhb18gccfdeddab25aabbhg",
    /** Held on 246 of 246 positions walked. */
    onlyNext: "5x5:degffe1egegb4eccacbbagca25aah",
    /** Held on 168 of 246 positions walked. */
    onlyBefore: {
      id: "5x5:e24deeee15hgagcedf18h12cbaa25a1babha",
      moves:
        '[{"type":"link","fromX":1,"fromY":1,"toX":0,"toY":0},{"type":"link","fromX":3,"fromY":1,"toX":3,"toY":0}]',
    },
  },
});

describe("signpost hint frame", () => {
  it("draws the arrow in the hint color, rings its target and stripes the line", () => {
    const { id, moves, step } = pinned("onlyNextOfSeveral");
    const result = renderScenario({ game: signpostGame, id, moves, showHint: true });
    expect(result.hint?.explanation).toBe(step.explanation);
    const h = step.highlights as SignpostHint;
    const ops = result.recording.ops;

    // The arrow the link leaves by is the one polygon in the hint color.
    expect(opsOfKind(ops, "polygon").filter((o) => o.fill === COL_HINT)).toHaveLength(
      1,
    );
    // The square it arrives at is ringed: four thin sides, not a fill.
    expectRing(opsOfKind(ops, "rect"), COL_HINT);
    // Every square the arrow points at is striped, and nothing else.
    expect(opsOfKind(ops, "hatch").filter((o) => o.color === COL_HINT)).toHaveLength(
      h.line.length,
    );
    expect(ops).toMatchSnapshot();
  });
});

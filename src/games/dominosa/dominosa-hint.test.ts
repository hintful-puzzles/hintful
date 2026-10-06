/**
 * Tier-1 + tier-2.5 tests for the dominosa explained hint.
 */
import { describe, expect, it } from "vitest";
import { stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectPieceRing } from "../../engine/testing/mark-shape.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import { newDominosaDesc } from "./generator.ts";
import { SPOT } from "./hint-text.ts";
import { type DominosaHint, dominosaGame } from "./index.ts";
import { border, COL_HINT, PREFERRED_TILE_SIZE } from "./render.ts";
import { solveNumbers } from "./solver.ts";
import {
  DIFF_BASIC,
  DIFF_EXTREME,
  DIFF_HARD,
  DIFF_TRIVIAL,
  DIFFCOUNT,
  type DominosaState,
  newState,
} from "./state.ts";

function freshState(n: number, diff: number, seed: string): DominosaState {
  const { desc } = newDominosaDesc({ n, diff, tall: false }, randomNew(seed));
  return newState({ n, diff, tall: false }, desc);
}

const P = { n: 4, diff: DIFF_TRIVIAL, tall: false };

/** The placements the narration and frame tests below are asserted on. */
const pinned = describeHintPins({
  game: dominosaGame,
  // Every tier, since each adds techniques.
  params: [
    P,
    { n: 6, diff: DIFF_BASIC, tall: false },
    { n: 6, diff: DIFF_HARD, tall: false },
    { n: 6, diff: DIFF_EXTREME, tall: false },
  ],
  kinds: {
    placement: (step) => step.move.type === "domino",
    placementOnEdge: (step, state) => {
      const { w, h } = state;
      const onEdge = (i: number): boolean =>
        i % w === 0 || i % w === w - 1 || i < w || i >= w * (h - 1);
      return (
        (step.highlights as DominosaHint | undefined)?.kind === "place" &&
        stepMarks(step).of("ring", SPOT).flat().some(onEdge)
      );
    },
  },
  pins: {
    /** Held on 1174 of 1651 positions walked. */
    placement: "4dt:401110342210234030414234130223",
    /** Held on 691 of 1651 positions walked. */
    placementOnEdge: "4dt:132224034333014012440411302210",
    /** Held on 1651 of 1651 positions walked. */
    onlySpot: "4dt:401110342210234030414234130223",
    /** Held on 1034 of 1651 positions walked. */
    squareOnly: {
      id: "4dt:132224034333014012440411302210",
      moves: [{ type: "domino", d1: 6, d2: 12 }],
    },
    /** Held on 339 of 1651 positions walked. */
    squareSingleDomino: "6dh:56661412240411522433566235062033553461156010541342003420",
    /** Held on 382 of 1651 positions walked. */
    mustOverlap: "6dh:33253306641260051434514431025160615156602241406353522420",
    /** Held on 199 of 1651 positions walked. */
    localDuplicate: "6de:25534400040545262363554433636216111012222566143146001305",
    /** Held on 133 of 1651 positions walked. */
    localDuplicate2: {
      id: "6de:56314533060004062163042633405124211152250511623425636454",
      moves: [{ type: "edge", d1: 39, d2: 47 }],
    },
    /** Held on 85 of 1651 positions walked. */
    parity: {
      id: "6de:54534465221330331445551316161022001643006641325222006654",
      moves:
        '[{"type":"edge","d1":30,"d2":38},{"type":"edge","d1":41,"d2":49},{"type":"edge","d1":9,"d2":17},{"type":"edge","d1":18,"d2":19},{"type":"edge","d1":16,"d2":17},{"type":"edge","d1":38,"d2":39},{"type":"edge","d1":29,"d2":30},{"type":"edge","d1":49,"d2":50},{"type":"domino","d1":48,"d2":49},{"type":"domino","d1":45,"d2":53},{"type":"domino","d1":23,"d2":31},{"type":"edge","d1":33,"d2":41}]',
    },
    /** Held on 402 of 1651 positions walked. */
    set: "6dh:56624312536066234140503461422601054003313346141012552255",
  },
});

/** The frame a pinned position's hint draws, through a real `Midend`. */
function hintFrame(kind: Parameters<typeof pinned>[0]) {
  const result = renderPinnedHint(dominosaGame, pinned(kind));
  const { step } = result;
  return { recording: result.recording, size: result.size, hint: step };
}

describe("dominosa hint — refusal", () => {
  it("counts a solved board as finished, so the midend refuses it", () => {
    const state = freshState(4, DIFF_TRIVIAL, "hint-solved");
    const { pairs } = solveNumbers(state.params, state.numbers, DIFFCOUNT);
    let s = state;
    for (const [a, b] of pairs)
      s = dominosaGame.executeMove(s, { type: "domino", d1: a, d2: b });
    expect(dominosaGame.status(s)).toBe("solved");
  });

  it("refuses on a board with several solutions", () => {
    // The board upstream dealt at Ambiguous for the seed `dominosa-a6`. It
    // does not load (`dominosa.test.ts`), so it is built directly.
    const state = newState(
      { n: 6, diff: DIFF_TRIVIAL, tall: false },
      "25655326346361502346651410062120443426101135023020554413",
    );
    expect(solveNumbers(state.params, state.numbers, DIFFCOUNT).result).not.toBe(1);
    const res = dominosaGame.hint?.(state);
    expect(res?.ok).toBe(false);
  });

  it("flags a domino the solution lacks, so the midend refuses it", () => {
    const state = freshState(4, DIFF_TRIVIAL, "hint-mistake");
    const { pairs } = solveNumbers(state.params, state.numbers, DIFFCOUNT);
    const solutionSet = new Set(pairs.map(([a, b]) => a * 1000 + b));
    const w = state.w;
    const h = state.h;
    let wrong: [number, number] | null = null;
    for (let y = 0; y < h && !wrong; y++)
      for (let x = 0; x < w && !wrong; x++) {
        const i = y * w + x;
        if (x + 1 < w && !solutionSet.has(i * 1000 + (i + 1))) wrong = [i, i + 1];
      }
    const [a, b] = wrong as [number, number];
    const bad = dominosaGame.executeMove(state, { type: "domino", d1: a, d2: b });
    expect(dominosaGame.findMistakes?.(bad).length ?? 0).toBeGreaterThan(0);
  });
});

describe("dominosa hint — narration + plan", () => {
  it("a placement step names the domino and uses the necessity voice", () => {
    const { step: place } = pinned("placement");
    // Necessity voice: forced move.
    expect(place.explanation).toMatch(/must go here/);
    // Names a domino value (e.g. "3–4").
    expect(place.explanation).toMatch(/\d[–-]\d/);
  });

  it("the plan solves a Tricky board from empty, one recomputed step at a time", () => {
    const state = freshState(6, DIFF_HARD, "hint-hard-plan");
    let s = state;
    let barrierSeen = false;
    for (let i = 0; i < 800; i++) {
      if (dominosaGame.status(s) === "solved") break;
      const res = dominosaGame.hint?.(s);
      expect(res?.ok, `stuck at move ${i}`).toBe(true);
      if (!res?.ok) break;
      if (res.steps[0].move.type === "edge") barrierSeen = true;
      s = dominosaGame.executeMove(s, res.steps[0].move);
    }
    expect(dominosaGame.status(s)).toBe("solved");
    // A Tricky board should require at least one teaching barrier along the way.
    expect(barrierSeen).toBe(true);
  });
});

describe("dominosa hint — render", () => {
  it("rings the forced domino as one shape in COL_HINT", () => {
    const { recording, hint } = hintFrame("placement");
    const hintRects = recording.ops.flatMap((o) =>
      o.op === "rect" && o.color === COL_HINT ? [o] : [],
    );
    // Six sides around the domino, not a box per square with a double bar
    // across its middle.
    expect((hint.highlights as DominosaHint | undefined)?.kind).toBe("place");
    expectPieceRing(recording.ops, COL_HINT);
    // Every mark lies inside one of the step's two target squares.
    const ts = PREFERRED_TILE_SIZE;
    const w = P.n + 2;
    const targets = stepMarks(hint).of("ring", SPOT).flat();
    expect(targets).toHaveLength(2);
    for (const r of hintRects) {
      const inside = targets.some((i) => {
        const x = (i % w) * ts + border(ts);
        const y = Math.floor(i / w) * ts + border(ts);
        return r.x >= x && r.y >= y && r.x + r.w <= x + ts && r.y + r.h <= y + ts;
      });
      expect(inside).toBe(true);
    }
  });

  it("rings a domino on the board's edge whole, on the canvas", () => {
    // The outer squares' gutters bleed off the canvas, so a band laid in them
    // draws sides nobody sees. Every side of the ring must land on the canvas.
    const { recording, size } = hintFrame("placementOnEdge");
    expectPieceRing(recording.ops, COL_HINT);
    for (const r of recording.ops.flatMap((o) =>
      o.op === "rect" && o.color === COL_HINT ? [o] : [],
    ))
      expect(
        r.x >= 0 && r.y >= 0 && r.x + r.w <= size.w && r.y + r.h <= size.h,
        `ring side at ${r.x},${r.y} ${r.w}x${r.h} is off the ${size.w}x${size.h} canvas`,
      ).toBe(true);
  });
});

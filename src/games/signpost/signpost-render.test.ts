/**
 * Tier-2.5 render scenarios for Signpost: drive a real Midend to a frame
 * and capture `redraw`. Targeted op assertions (background + region-ramp
 * rects, arrow polygons, number text, the grid frame, the red mistake
 * overlay) plus one snapshot so a render regression is a reviewable text
 * diff (`vitest -u` re-baselines an intended change; the targeted
 * assertions survive a careless `-u`).
 */
import { describe, expect, it } from "vitest";
import { DIFF_EASY } from "../../engine/answer-search.ts";
import { randomNew } from "../../engine/random/index.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { opsOfKind, RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { expectWinFlashTravels, winFlashRun } from "../../engine/testing/win-flash.ts";
import { type Flash, NO_FLASH } from "../../engine/win-wave.ts";
import { newSignpostDesc } from "./generator.ts";
import { signpostGame } from "./index.ts";
import { BORDER, COL_FLASH, COL_FLASH_LEAD } from "./render.ts";
import { solveState } from "./solver.ts";
import {
  cloneState,
  FLAG_ERROR,
  FLAG_IMMUTABLE,
  type SignpostMove,
  type SignpostParams,
} from "./state.ts";

const COL_GRID = 3;
const COL_ERROR = 5;

function boardId(p: SignpostParams, seed: string): string {
  const { desc } = newSignpostDesc(p, randomNew(seed));
  return `${signpostGame.encodeParams(p, true)}:${desc}`;
}

describe("Signpost render scenarios", () => {
  it("opener frame: backgrounds, arrows, numbers, grid frame", () => {
    const { recording, size } = renderScenario({
      game: signpostGame,
      id: boardId(
        { w: 5, h: 5, forceCornerStart: true, diff: DIFF_EASY },
        "sp-render-open",
      ),
    });

    // Per-tile background rects.
    expect(recording.ops.some((o) => o.op === "rect")).toBe(true);
    // Direction arrows (and the final-cell star) are polygons.
    expect(recording.ops.some((o) => o.op === "polygon")).toBe(true);
    // Immutable numbers are text.
    expect(recording.ops.some((o) => o.op === "text")).toBe(true);
    // The grid frame line.
    expect(recording.ops.some((o) => "color" in o && o.color === COL_GRID)).toBe(true);
    expect(size.w).toBeGreaterThan(0);

    expect(recording.ops).toMatchSnapshot();
  });

  it.each([
    ["a free square", false],
    ["a given", true],
  ])("mistake overlay: a wrong link out of %s recolors its number COL_ERROR", (_, given) => {
    const p: SignpostParams = { w: 5, h: 5, forceCornerStart: true, diff: DIFF_EASY };
    // Find a seed + a legal-but-wrong link that the board's own error check
    // leaves alone, so only the overlay can color the number of the square it
    // leaves.
    let scenarioId = "";
    let wrongMove: SignpostMove | null = null;
    for (let attempt = 0; attempt < 20 && !wrongMove; attempt++) {
      const { desc } = newSignpostDesc(p, randomNew(`sp-render-mistake-${attempt}`));
      const s0 = signpostGame.newState(p, desc);
      const solved = cloneState(s0);
      if (solveState(solved) !== 1) continue;
      for (let from = 0; from < s0.n && !wrongMove; from++) {
        if (!(s0.flags[from] & FLAG_IMMUTABLE) === given) continue;
        // The given a link leaves has to be one with no link already.
        if (s0.next[from] !== -1) continue;
        for (let target = 0; target < s0.n; target++) {
          if (target === solved.next[from]) continue;
          const m: SignpostMove = {
            type: "link",
            fromX: from % s0.w,
            fromY: Math.floor(from / s0.w),
            toX: target % s0.w,
            toY: Math.floor(target / s0.w),
          };
          try {
            const after = signpostGame.executeMove(s0, m);
            if (after.impossible || after.flags[from] & FLAG_ERROR) continue;
            wrongMove = m;
            scenarioId = `${signpostGame.encodeParams(p, true)}:${desc}`;
            break;
          } catch {
            // illegal — keep scanning
          }
        }
      }
    }
    expect(wrongMove).not.toBeNull();
    if (!wrongMove) return;

    const scenario = { game: signpostGame, id: scenarioId, moves: [wrongMove] };
    const shown = renderScenario({ ...scenario, showMistakes: true });
    const hidden = renderScenario(scenario);
    const errorTexts = (ops: typeof shown.recording.ops) =>
      ops.filter((o) => o.op === "text" && o.color === COL_ERROR).length;

    expect(shown.mistakeCount).toBeGreaterThan(0);
    // The offending cell's number is drawn in the error color, and only
    // because of the overlay.
    expect(errorTexts(shown.recording.ops)).toBeGreaterThan(
      errorTexts(hidden.recording.ops),
    );
  });
});

describe("Signpost win flash", () => {
  const p: SignpostParams = { w: 5, h: 5, forceCornerStart: true, diff: DIFF_EASY };
  const { desc } = newSignpostDesc(p, randomNew("sp-render-flash"));
  const state = cloneState(signpostGame.newState(p, desc));
  if (solveState(state) !== 1) throw new Error("the fixture does not solve");

  /** Each square's surface, by cell, in a frame drawn from nothing. */
  function surfaces(flash: Flash): number[] {
    const dr = new RecordingDrawing(signpostGame.colors(DEFAULT_BACKGROUND));
    const ds = preferredDrawState(signpostGame, state);
    signpostGame.redraw(dr, ds, null, state, 1, signpostGame.newUi(state), 0, flash);
    const ts = ds.tileSize;
    const out: number[] = new Array(state.n).fill(-1);
    for (const o of opsOfKind(dr.ops, "rect")) {
      if (o.w !== ts || o.h !== ts) continue;
      const i = ((o.y - BORDER) / ts) * state.w + (o.x - BORDER) / ts;
      if (out[i] < 0) out[i] = o.color;
    }
    return out;
  }
  /** The cells a frame fills in the flash color. */
  const lit = (frame: number[]): number[] =>
    frame.flatMap((color, i) => (litSlot(color) ? [i] : []));

  it("lights the squares in the order of their numbers, givens among them", () => {
    expect(lit(surfaces(NO_FLASH))).toEqual([]);
    expect(state.flags.some((f) => f & FLAG_IMMUTABLE)).toBe(true);
    const run = winFlashRun(surfaces, lit, 60);
    expectWinFlashTravels(run, state.n, (i) => state.nums[i]);
    expect(slotsSeen).toEqual(new Set([COL_FLASH, COL_FLASH_LEAD]));
  });
});

/** The flash's slots the frames read so far were painted with: a lit element
 * is one painted in either, the highlight's body or its leading edge. */
const slotsSeen = new Set<number>();
function litSlot(color: number): boolean {
  if (color !== COL_FLASH && color !== COL_FLASH_LEAD) return false;
  slotsSeen.add(color);
  return true;
}

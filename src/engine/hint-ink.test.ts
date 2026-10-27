/**
 * The cross-game guard on the colors a hint's marks are drawn in: **the
 * engine's, one ink to a role** (`HINT_INK`). The app repaints each
 * reference's marks in a color of its own, finding them by repainting the inks
 * while it measures (`hintReferenceMarks`), and a step is drawn in the inks
 * until then; so a mark in any other color is measured by its contrast with
 * what lies under it, and shows the game's color where the engine's belongs.
 *
 * Each reference of each step is hidden in turn, and every op that goes with
 * it must be drawn in its role's ink, or in a color the board uses without a
 * hint (a struck note keeps the note's color). The games are `HINT_GAMES` and
 * the inks are found in each palette by reference, so nothing here is listed.
 */
import { describe, expect, it } from "vitest";
import { resolvePalette } from "./color/color-mkhighlight.ts";
import { HINT_INK } from "./color/palette.ts";
import type { MarkRole } from "./hint-words.ts";
import { Midend } from "./index.ts";
import { beginDealt } from "./testing/dealt.ts";
import { gatePresets, HINT_GAMES } from "./testing/hint-games.ts";
import { type DrawOp, RecordingDrawing } from "./testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "./testing/render-scenario.ts";
import type { Color } from "./types.ts";

/** The palette indices an op paints with. */
function colorsOf(op: DrawOp): number[] {
  if ("color" in op) return [op.color];
  if ("fill" in op) return [op.fill, op.outline].filter((c) => c >= 0);
  return [];
}

/** The ops of `shown` that `hidden` does not have, counting repeats. */
function removed(shown: readonly DrawOp[], hidden: readonly DrawOp[]): DrawOp[] {
  const left = new Map<string, number>();
  for (const op of hidden) {
    const k = JSON.stringify(op);
    left.set(k, (left.get(k) ?? 0) + 1);
  }
  return shown.filter((op) => {
    const k = JSON.stringify(op);
    const n = left.get(k) ?? 0;
    if (n > 0) left.set(k, n - 1);
    return n === 0;
  });
}

/** What is wrong with the colors of the marks of the steps a game's plans
 * open with, one line each, and how many marked ops were looked at. */
function inkFaults(game: (typeof HINT_GAMES)[number][1]) {
  const palette = resolvePalette(game, DEFAULT_BACKGROUND);
  const role = new Map<number, MarkRole>();
  const inks = new Map<Color, MarkRole>(
    (Object.entries(HINT_INK) as [MarkRole, Color][]).map(([r, c]) => [c, r]),
  );
  // The ring's ink is the engine's slot alone, the one `drawRing` draws in: a
  // game's own slot of the same color (the drag's blue) is no ring's.
  palette.forEach((c, i) => {
    const r = inks.get(c);
    if (r && r !== "ring") role.set(i, r);
  });
  role.set(palette.length - 2, "ring");
  const faults = new Set<string>();
  /** A color a mark is drawn in that is no ink, and a role it drew. */
  const outside = new Map<number, MarkRole>();
  /** The colors the boards are drawn in, besides their marks. */
  const content = new Set<number>();
  let looked = 0;
  const frame = (midend: Midend<unknown, unknown, unknown, unknown, unknown>) => {
    const dr = new RecordingDrawing(palette);
    midend.forceRedraw(dr);
    return dr.ops;
  };
  // One board of each entry of the slice: an ink is chosen by a mark's role
  // and the renderer branch that draws it, which another board of the same
  // params draws again.
  for (const { params } of gatePresets(game)) {
    const midend = new Midend(game);
    if (beginDealt(midend, game, params)) continue;
    midend.size({ w: 700, h: 700 });
    for (const c of frame(midend).flatMap(colorsOf)) content.add(c);
    if (midend.hint()) continue;
    for (let step = 0; step < 4; step++) {
      const refs = midend.activeHintStep()?.words?.refs;
      if (!refs) break;
      const shown = frame(midend);
      const marks = refs.map((_, i) => {
        midend.hideHintReference(i);
        const gone = removed(shown, frame(midend));
        midend.hideHintReference(null);
        return gone;
      });
      // What no reference takes with it is the board's.
      const marked = new Set(marks.flat());
      for (const op of shown)
        if (!marked.has(op)) for (const c of colorsOf(op)) content.add(c);
      refs.forEach((ref, i) => {
        for (const op of marks[i]) {
          looked++;
          for (const c of colorsOf(op)) {
            const ink = role.get(c);
            if (ink !== undefined && ink !== ref.role)
              faults.add(`a ${ref.role} drawn in the ${ink} ink (index ${c})`);
            else if (ink === undefined) outside.set(c, ref.role);
          }
        }
      });
      midend.executeHint();
    }
  }
  for (const [c, r] of outside)
    if (!content.has(c)) faults.add(`a ${r} drawn in index ${c}, used only for a hint`);
  return { faults: [...faults], looked };
}

describe("a hint's marks are drawn in the engine's inks", () => {
  it("sweeps every hinting game", () => {
    expect(HINT_GAMES.length).toBeGreaterThanOrEqual(50);
  });

  for (const [id, game] of HINT_GAMES) {
    it(`${id}: each mark in its role's ink`, () => {
      const { faults, looked } = inkFaults(game);
      expect(looked, `${id} drew no mark to check`).toBeGreaterThan(0);
      expect(faults, id).toEqual([]);
    });
  }
});

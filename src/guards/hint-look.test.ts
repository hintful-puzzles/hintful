/**
 * The cross-game guard on a hint's first beat, **where to look**: the board
 * shows one mark of the step, chosen by the engine from the step's own words
 * (`Narration.whereToLook`), and the status line gives nothing away. No game
 * writes anything for it, so every game with a `hint()` is enrolled
 * (`hint-games.ts`).
 *
 * That the frame draws only what the narrowed words name is the binding
 * guard's (`testing/hint-binding.ts`): a renderer that paints from the words
 * paints one mark when the words name one. What this adds is that the midend
 * hands the renderer those words, that the one mark is on screen, and that
 * explaining puts the whole step back.
 */
import { describe, expect, it } from "vitest";
import type { MarkRef } from "../engine/contract/hint-words.ts";
import { LOOK_HERE } from "../engine/midend.ts";
import { HINT_GAMES } from "../engine/testing/hint-games.ts";
import { type WalkBoard, walkHints } from "../engine/testing/hint-walk.ts";
import { RecordingDrawing } from "../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../engine/testing/render-scenario.ts";
import { itOverWholeSweep } from "../engine/testing/slow.ts";

/** Steps walked on each game's first board: deep enough to pass a journey's
 * first leg into its next, which is where the look beat is skipped. */
const STEPS = 8;

/** The distinct marks `refs` draw, as `role|kind|key` sets per role and kind. */
function marks(refs: readonly MarkRef[]): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const r of refs) {
    const pair = `${r.role}|${r.kind.name}`;
    const keys = out.get(pair) ?? new Set<string>();
    for (const e of r.elements) keys.add(r.kind.key(e));
    out.set(pair, keys);
  }
  return out;
}

/** How many marked elements {@link marks} holds, over every role and kind. */
const count = (m: Map<string, Set<string>>): number =>
  [...m.values()].reduce((n, keys) => n + keys.size, 0);

describe("a hint's first beat shows where to look", () => {
  let walked = 0;
  for (const [id, game] of HINT_GAMES) {
    it(`${id}: one mark, then the whole step`, () => {
      const palette = game.colors(DEFAULT_BACKGROUND);
      const frame = ({ midend }: WalkBoard): string => {
        const d = new RecordingDrawing(palette);
        midend.forceRedraw(d);
        return JSON.stringify(d.ops);
      };
      let bare = "";
      walkHints(
        game,
        { steps: STEPS, first: true, look: true },
        {
          board(b) {
            bare = frame(b);
          },
          shown(step, s, b) {
            const { midend } = b;
            const status = () => b.observed.last("status-bar-change");
            const refs = step.words?.refs ?? [];
            const looks = refs.length > 0 && step.continuesPrevious !== true;
            expect(midend.hintLooking(), `${id} step ${s}: "${step.explanation}"`).toBe(
              looks,
            );
            if (!looks || !step.words) return;
            walked++;
            const one = marks(step.words.whereToLook().refs);
            expect(one.size, `${id}: "${step.explanation}" looks at one mark`).toBe(1);
            expect(midend.hintReferenceRoles()).toEqual([]);
            expect(status()?.activeHintExplanation).toBe(LOOK_HERE);
            expect(status()?.activeHintSpans).toBeUndefined();
            const look = frame(b);
            expect(look, `${id}: "${step.explanation}" draws its mark`).not.toBe(bare);
            midend.explainHint();
            expect(midend.hintLooking()).toBe(false);
            expect(status()?.activeHintExplanation).toBe(step.explanation);
            if (count(marks(refs)) > count(one))
              expect(frame(b), `${id}: "${step.explanation}" explains more`).not.toBe(
                look,
              );
          },
        },
      );
    });
  }

  itOverWholeSweep("looked at a step in most games", () => {
    // The "how many did I look at?" floor: a walk that stopped reaching a
    // look beat would pass every game above vacuously.
    expect(walked).toBeGreaterThanOrEqual(HINT_GAMES.length);
  });
});

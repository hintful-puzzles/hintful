import { NARRATION_LIMIT } from "../engine/hint-words.ts";
import type { HintSpan } from "../engine/types.ts";

/** Words of a hint's usual make: plain words, references, and a number or a
 * color among them, longer together than any hint may be. */
const SAMPLE: readonly HintSpan[] = [
  { text: "Region 1 or, via the chain, region 4 is violet, both beside ", ref: null },
  { text: "the ringed region", ref: 0 },
  { text: ", so it can't be violet; ", ref: null },
  { text: "the outlined pair", ref: 1 },
  { text: " uses both green and yellow, which leaves ", ref: null },
  { text: "this region", ref: 2 },
  {
    text: " only red, and red must go there, since no other color is left.",
    ref: null,
  },
];

/** How much longer than the limit the room's sentence is. Where lines break
 * depends on the words, and a real hint at the limit can waste most of a word
 * at the end of each line where the sample wastes little: a 117-character
 * Magnets hint took a line more than 120 characters of the sample at 412px. */
const WRAP_SLACK = 1.2;

/**
 * A sentence as long as a hint's may be ({@link NARRATION_LIMIT}), with slack
 * for wrapping, cut from {@link SAMPLE}: the room kept for a hint is measured
 * by it, so that room follows the limit and holds any hint in every game at
 * the window's width.
 */
export const LONGEST_HINT: readonly HintSpan[] = (() => {
  const out: HintSpan[] = [];
  let left = Math.round(NARRATION_LIMIT * WRAP_SLACK);
  for (const span of SAMPLE) {
    if (left === 0) break;
    const text = span.text.slice(0, left);
    out.push({ ...span, text });
    left -= text.length;
  }
  return out;
})();

/** The longest journey label a hint shows over its words. */
export const LONGEST_JOURNEY = "Step 9 of 9";

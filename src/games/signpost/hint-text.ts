/**
 * Every sentence Signpost's hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`hint.ts`); this
 * file decides only how it reads. Every word that points at the board is a
 * reference to its mark (`engine/hint-words.ts`, and `hint-marks.ts` for the
 * arrow): "this arrow" is the arrow the link leaves by, recolored; "the ringed
 * square" is where it arrives; the squares an arrow points at are striped; and
 * the other squares pointing at a square are outlined.
 */

import { CELL, mark, type Narration, phrase } from "../../engine/hint-words.ts";
import type { Rival, SignpostFiring, SignpostHint } from "./hint.ts";
import { ARROW } from "./hint-marks.ts";

/** How the rivals of an "only next" link are ruled out, `[one, several]`. */
const NEXT: Record<Rival, readonly [string, string]> = {
  taken: ["follows another", "follow others"],
  chain: ["is in its chain", "are in its chain"],
  // A number that cannot fit the gap, as well as one that is not the next:
  // "wrong" covers both, and the sentence has no room to tell them apart.
  number: ["holds the wrong number", "hold the wrong number"],
};

/** How the rivals of an "only before" link are ruled out. */
const BEFORE: Record<Rival, readonly [string, string]> = {
  taken: ["already leads elsewhere", "already lead elsewhere"],
  chain: ["is in its chain", "are in its chain"],
  number: ["holds the wrong number", "hold the wrong number"],
};

/** "the other has one before it", "the rest have one before them or are in
 * its chain": each reason the rivals have, agreeing with how many they are. */
function ruledOut(
  why: readonly Rival[],
  count: number,
  words: Record<Rival, readonly [string, string]>,
): string {
  const many = count > 1 ? 1 : 0;
  const reasons = why.map((r) => words[r][many]);
  const listed =
    reasons.length <= 1
      ? (reasons[0] ?? "")
      : `${reasons.slice(0, -1).join(", ")} or ${reasons[reasons.length - 1]}`;
  return listed;
}

export const say = {
  /** The link `f` makes, over the marks `h` draws. */
  firing: (f: SignpostFiring, h: SignpostHint): Narration => {
    const arrow = mark.this("ring", ARROW, [h.arrow], "arrow");
    switch (f.kind) {
      case "follows":
        return phrase`${mark.as("ring", CELL, [h.target], `The ${f.k + 1}`)} must come right after the ${f.k}, and ${mark.as("ring", ARROW, [h.arrow], `the ${f.k}'s arrow`)} points at it, so the two must be linked.`;
      case "onlyNext": {
        if (h.line.length === 0)
          return phrase`${arrow.capitalized()} points only at ${mark.as("ring", CELL, [h.target], "the ringed square")}, so it must come next.`;
        const target = mark.as("ring", CELL, [h.target], "the ringed one");
        const rivals = h.line.length - 1;
        return phrase`Of ${mark.the("stripes", CELL, h.line, "square")}, only ${target} can follow ${arrow}: the ${rivals > 1 ? "rest" : "other"} ${ruledOut(f.why, rivals, NEXT)}.`;
      }
      case "onlyBefore": {
        const target = mark.as("ring", CELL, [h.target], "the ringed square");
        if (h.others.length === 0)
          return phrase`Only ${arrow} points at ${target}, so it must lead there.`;
        // The outlined squares are the other arrows pointing at it; the help's
        // list of marks says so, which leaves the sentence the reasons.
        const others = mark.the("outline", CELL, h.others, ["one", "ones"]);
        return phrase`Only ${arrow} can lead into ${target}: ${others} ${ruledOut(f.why, h.others.length, BEFORE)}.`;
      }
    }
  },
};

/**
 * Every sentence Guess's hint speaks.
 *
 * The board carries the references, so the sentences use three words for them
 * and nothing else: the **outlined row** is the scored guess a step reads, an
 * **outlined answer slot** is one whose marks it leans on, and the **ringed
 * colors** are the blocks in the answer row the step acts on. Colors have no
 * names in this game, and positions no numbers, so neither is spoken.
 *
 * A deduction ends on the marks it makes; a probe ends on what was counted.
 */

export type Reason =
  | { kind: "scoredNothing" }
  | { kind: "noBlack" }
  | { kind: "everyPegScored" }
  | { kind: "noRepeats" }
  | { kind: "blacksForced"; black: number }
  | { kind: "blacksAccounted"; black: number }
  | { kind: "totalAccounted"; total: number }
  | { kind: "onlyAnswer" }
  | { kind: "opening"; fitting: number; worst: number }
  | { kind: "probe"; fitting: number; worst: number }
  | { kind: "probeFits" };

const pegs = (n: number): string => (n === 1 ? "1 peg" : `${n} pegs`);

export function say(r: Reason): string {
  switch (r.kind) {
    case "scoredNothing":
      return "The outlined row scored nothing, so none of its colors can be in the answer. Rule them out everywhere.";
    case "noBlack":
      return "The outlined row scored no black pegs, so none of its colors can be where it was guessed. Rule each out there.";
    case "everyPegScored":
      return "Every peg of the outlined row scored, so the answer can only use its colors. Rule the rest out.";
    case "noRepeats":
      return "The outlined slot can only be one color, and no color repeats, so no other slot can hold it.";
    case "blacksForced":
      return r.black === 1
        ? "Only 1 peg of the outlined row can still be in place, and it scored 1 black, so that peg must be right."
        : `Only ${r.black} pegs of the outlined row can still be in place, and it scored ${r.black} black, so all must be right.`;
    case "blacksAccounted":
      return r.black === 1
        ? "The outlined slot already accounts for the outlined row's black peg, so none of its other pegs can be in place."
        : `The outlined slots already account for the outlined row's ${r.black} blacks, so none of its other pegs can be in place.`;
    case "totalAccounted":
      return `The outlined slots account for all ${pegs(r.total)} the outlined row scored, so its colors can't be anywhere else.`;
    case "onlyAnswer":
      return "Only one answer fits every score so far: the ringed colors.";
    case "opening":
      return `Nothing is scored yet. Guess the ringed colors: whatever they score, at most ${r.worst} of the ${r.fitting} answers will be left.`;
    case "probe":
      return `${r.fitting} answers fit every score so far, and the ringed colors are one. Guess them, and at most ${r.worst} will be left.`;
    case "probeFits":
      return "Guess the ringed colors: only a guess that fits every score so far can win, and this one does.";
  }
}

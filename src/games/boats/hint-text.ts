/**
 * The sentences Boats' hint speaks that its description cannot state: the
 * three that refute a trial (`lastWater`, `lastShip`, `centerTrial`). Every
 * other step's words are stated in `boats.description.yaml`.
 *
 * A refutation names the rule the rejected trial broke, which only the
 * validator says (`classifyBreach`, in `solver.ts`), and the squares it
 * flagged: a breach is a term of the step that a formula cannot compute, and
 * its words choose the longest wording that fits a sentence's length.
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the squares a step decides are ringed (drawn as a
 * boat or water mark in the hint color), the squares it reasons from are
 * outlined, and the row or column it counts with is striped.
 */

import type { FiringSpoken } from "../../engine/described-firing-hint.ts";
import {
  CELL,
  mark,
  NARRATION_LIMIT,
  type Narration,
  phrase,
  type Sentence,
  so,
  whole,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { type BoatsBreach, type BoatsSays, SEA, SHIP } from "./solver.ts";

type T = {
  trialShip: boolean;
  breach: BoatsBreach;
  center: { at: Point; vertical: boolean } | null;
  filled: { horizontal: boolean; crossing: boolean } | null;
};

/** What one step marks, as the sentence names it: the squares it decides,
 * split by what goes in them; the water that follows from its boat squares;
 * the squares it reasons from; and the line it counts with. */
interface BoatsMarks {
  ships: readonly Point[];
  waters: readonly Point[];
  follows: readonly Point[];
  evidence: readonly Point[];
  line: readonly Point[];
}

const decided = (m: BoatsMarks): Point[] => [...m.ships, ...m.waters];

/** The squares the step decides, in words that may count them. */
const ringed = (cells: readonly Point[], words: string): Narration =>
  mark.as("ring", CELL, cells, words);

/** The closing clause naming the water a step's boat squares bring with them,
 * which the step shows and places with it. */
const follows = (m: BoatsMarks): Narration | string =>
  m.follows.length ? phrase`, with ${ringed(m.follows, "its water")}` : "";

/** The consequence clause of a refutation — the rule the rejected trial broke,
 * read off the validator's own rejection (docs/hints-marks.md § "Read the
 * reason off the validator"), naming the squares it flagged. */
function breachClause(breach: BoatsBreach, cells: readonly Point[], m: BoatsMarks) {
  const at = (words: string): Narration =>
    cells.length ? mark.paren("outline", CELL, cells, words) : phrase`${words}`;
  switch (breach.kind) {
    case "collision":
      return phrase`two boats would end up touching ${at("corner to corner")}`;
    case "count":
      // "The striped row", not "this row": the sentence is about a square, and
      // the line the trial broke need not be that square's own.
      return phrase`${mark.the("stripes", whole(CELL), m.line, breach.line.horizontal ? "row" : "column")} couldn't reach its ${breach.line.clue}`;
    case "fleet":
      // A boat of a size the fleet has had all of, so "too many" of them.
      return phrase`it would make ${at("one boat")} too many`;
    case "fleetTotal":
      return breach.tooMany
        ? phrase`there would be more ${at("boat squares")} than the whole fleet has`
        : phrase`the rest of the fleet would no longer fit beside ${at("these boats")}`;
    case "clue":
      return phrase`${at("a given segment's own shape")} would be contradicted`;
    case "unfinishable":
      return phrase`the rest of the fleet could no longer be placed legally`;
  }
}

function refuted(t: T, m: BoatsMarks): Sentence {
  if (t.center) {
    const cells = m.evidence.filter(
      (c) => c.x !== t.center?.at.x || c.y !== t.center.at.y,
    );
    const seg = mark.this("outline", CELL, [t.center.at], "middle segment");
    const way = t.center.vertical ? "up and down" : "across";
    const next = ringed(
      m.waters,
      t.center.vertical ? "the square below it" : "the square to its right",
    );
    return so({
      look: phrase`if the boat through ${seg} ran ${way}, ${breachClause(t.breach, cells, m)}`,
      move: phrase`${next} must be water`,
    });
  }
  const square = ringed(decided(m), "this square");
  const why = breachClause(t.breach, m.evidence, m);
  // The trial is the line's last of its kind, so the rest of the line is
  // the other: every refutation leans on that fill, so the sentence says it
  // ("its row's last water") where it fits within a sentence's length.
  // The crossing line, where the trial filled it too, drops first.
  const whose = (lines: number): string => {
    if (lines === 0 || t.filled === null) return "";
    const [a, b] = t.filled.horizontal ? ["row", "column"] : ["column", "row"];
    return lines === 2 ? `its ${a}'s and ${b}'s last ` : `its ${a}'s last `;
  };
  const told = (lines: number): Sentence =>
    t.trialShip
      ? so({
          look: phrase`if ${square} held ${whose(lines) || "a "}boat segment, ${why}`,
          move: phrase`it must be water`,
        })
      : so({
          look: phrase`if ${square} were ${whose(lines)}water, ${why}`,
          move: phrase`it must hold a boat segment${follows(m)}`,
        });
  const most = t.filled?.crossing ? 2 : 1;
  for (let lines = most; lines > 0; lines--) {
    const sentence = told(lines);
    if (sentence.text.length <= NARRATION_LIMIT) return sentence;
  }
  return told(0);
}

/** What every firing's step marks, whatever its technique. */
interface Basics {
  placing(n: number): readonly Point[];
  consequences: readonly Point[];
  outline: readonly Point[];
  stripes: readonly Point[];
}

/** What one step marks, as the sentences above name it. */
const marksOf = (s: Basics): BoatsMarks => {
  const dragged = new Set(s.consequences.map(({ x, y }) => `${x},${y}`));
  return {
    ships: s.placing(SHIP),
    waters: s.placing(SEA),
    follows: s.consequences,
    // What the step outlines is what it reasons from, not the water it drags.
    evidence: s.outline.filter(({ x, y }) => !dragged.has(`${x},${y}`)),
    line: s.stripes,
  };
};

/** The refuting techniques' sentences, read from what the firing says. */
export const sentences: {
  [K in "lastWater" | "lastShip" | "centerTrial"]: (
    spoken: FiringSpoken<BoatsSays[K]>,
  ) => Sentence;
} = {
  lastWater: (s) =>
    refuted(
      {
        trialShip: false,
        breach: s.terms.breach,
        center: null,
        filled: { horizontal: s.terms.horizontal, crossing: s.terms.crossing },
      },
      marksOf(s),
    ),
  lastShip: (s) =>
    refuted(
      {
        trialShip: true,
        breach: s.terms.breach,
        center: null,
        filled: { horizontal: s.terms.horizontal, crossing: s.terms.crossing },
      },
      marksOf(s),
    ),
  centerTrial: (s) =>
    refuted(
      {
        trialShip: true,
        breach: s.terms.breach,
        center: { at: s.at(s.terms.center), vertical: s.terms.vertical },
        filled: null,
      },
      marksOf(s),
    ),
};

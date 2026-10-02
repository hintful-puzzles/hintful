/**
 * Every sentence Boats' hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`); this file decides only how it reads. Each sentence runs
 * indication, reasoning, conclusion in the necessity voice
 * (docs/games/hints.md § "Writing the narration").
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the squares a step decides are ringed (drawn as a
 * boat or water mark in the hint color), the squares it reasons from are
 * outlined, and the row or column it counts with is striped. The never-touch
 * water a placement drags along is shown with the step, so the sentence names
 * it in a closing clause and no more: why it is there is a rule of the game,
 * and rules belong in the help (docs/games/hints.md § "Rules belong in the
 * help").
 */

import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
  whole,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import type { BoatsBreach, BoatsLine, BoatsTechnique } from "./hint-solver.ts";
import { SHIP_BOTTOM, SHIP_LEFT, SHIP_SINGLE, SHIP_TOP } from "./state.ts";

type T<K extends BoatsTechnique["kind"]> = Extract<BoatsTechnique, { kind: K }>;

const plural = (n: number): string => (n === 1 ? "" : "s");

/** What one step marks, as the sentence names it: the squares it decides,
 * split by what goes in them; the water that follows from its boat squares;
 * the squares it reasons from; and the line it counts with. */
export interface BoatsMarks {
  ships: readonly Point[];
  waters: readonly Point[];
  follows: readonly Point[];
  evidence: readonly Point[];
  line: readonly Point[];
}

const decided = (m: BoatsMarks): Point[] => [...m.ships, ...m.waters];

/** The squares the step decides, in words that may count them. */
const ringed = (
  cells: readonly Point[],
  words: string | ((els: readonly Point[]) => string),
): Narration => mark.as("ring", CELL, cells, words);

const outlined = (cells: readonly Point[], words: string): Narration =>
  mark.as("outline", CELL, cells, words);

/** A line as the player reads it: "this row", striped on the board. Never a
 * number, which the board does not draw (docs/games/hints.md § "Hatch the line
 * the sentence names"). */
const lineRef = (line: BoatsLine, m: BoatsMarks): Narration =>
  mark.this("stripes", whole(CELL), m.line, line.horizontal ? "row" : "column");

/**
 * A hidden occupancy number the deduction recovered is not a number the player
 * can see, so a narration citing it says where it came from first
 * (docs/games/hints.md § "Name elements by what the player can see"). Only
 * reachable with "Remove numbers" on.
 */
const lineIntro = (line: BoatsLine, m: BoatsMarks): Narration | string =>
  line.deduced
    ? phrase`${lineRef(line, m).capitalized()}'s hidden number can only be ${line.clue}. `
    : "";

/** The closing clause naming the water a step's boat squares bring with them,
 * which the step shows and places with it. */
const follows = (m: BoatsMarks): Narration | string =>
  m.follows.length ? phrase`, with ${ringed(m.follows, "the water around it")}` : "";

/** The consequence clause of a refutation — the rule the rejected trial broke,
 * read off the validator's own rejection (docs/games/hints.md § "Read the
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
      return phrase`${mark.the("stripes", whole(CELL), m.line, breach.line.horizontal ? "row" : "column")} could no longer reach its ${breach.line.clue}`;
    case "fleet":
      return phrase`it would make ${at("a boat the fleet has no room for")}`;
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

export const say = {
  /** A given segment, deciding the squares around it. */
  givenClue: (t: T<"givenClue">, m: BoatsMarks): Sentence => {
    const side =
      t.shape === SHIP_TOP
        ? { on: "top", into: "below it", behind: "above it" }
        : t.shape === SHIP_BOTTOM
          ? { on: "bottom", into: "above it", behind: "below it" }
          : t.shape === SHIP_LEFT
            ? { on: "left", into: "to its right", behind: "to its left" }
            : { on: "right", into: "to its left", behind: "to its right" };
    const seg = (noun: string): Narration =>
      mark.this("outline", CELL, m.evidence, noun);
    if (t.shape === SHIP_SINGLE)
      return so({
        look: phrase`${seg("given segment")} is a whole one-square boat`,
        move: phrase`${ringed(m.waters, (els) => (els.length > 1 ? "the squares beside it" : "the square beside it"))} must be water`,
      });
    const end = phrase`${seg("segment")} is a boat's ${side.on} end`;
    if (m.ships.length === 0)
      return so({
        look: end,
        follows: phrase`nothing can sit ${side.behind}`,
        move: phrase`${ringed(m.waters, "that square")} must be water`,
      });
    if (m.waters.length === 0)
      return so({
        look: end,
        move: phrase`its boat must continue into ${ringed(m.ships, `the square ${side.into}`)}${follows(m)}`,
      });
    return so({
      look: end,
      move: phrase`${ringed(m.waters, `the square ${side.behind}`)} must be water, and its boat must continue ${ringed(m.ships, side.into)}${follows(m)}`,
    });
  },

  neverTouch: (m: BoatsMarks): Sentence =>
    so({
      look: phrase`boats never touch, not even at a corner`,
      move: phrase`${ringed(m.waters, (els) => `the square${plural(els.length)} diagonally beside`)} ${mark.this("outline", CELL, m.evidence, "segment")} must be water`,
    }),

  // Read at both extremes (docs/games/hints.md § "Sanity-read at the
  // degenerate extremes"): "shows the 0 ships its number allows" is nonsense,
  // and a 0 line is the common case worth its own sentence.
  lineSatisfied: (t: T<"lineSatisfied">, m: BoatsMarks): Sentence => {
    const line = lineRef(t.line, m);
    return t.line.clue === 0
      ? so({
          look: phrase`${line}'s ${t.line.deduced ? "hidden number can only be" : "number is"} 0`,
          move: phrase`${ringed(m.waters, "every square in it")} must be water`,
        })
      : t.line.deduced
        ? so({
            look: phrase`${line}'s hidden number can only be ${t.line.clue}, and it already has that many boat squares`,
            move: phrase`${ringed(m.waters, "the rest")} must be water`,
          })
        : so({
            look: phrase`${line} already has the ${t.line.clue} boat square${plural(t.line.clue)} its number allows`,
            move: phrase`${ringed(m.waters, "every remaining square in it")} must be water`,
          });
  },

  // A recovered number says only how many boat squares the line holds, so the
  // deduced arms say what it leaves to place before the free squares take it.
  lineForced: (t: T<"lineForced">, m: BoatsMarks): Sentence => {
    const line = lineRef(t.line, m);
    const n = m.ships.length;
    const hidden = phrase`${line}'s hidden number can only be ${t.line.clue}`;
    return n === 1
      ? t.line.deduced
        ? so({
            look: hidden,
            follows: phrase`it needs one more`,
            move: phrase`${ringed(m.ships, "its one free square")} must hold a boat segment${follows(m)}`,
          })
        : so({
            look: phrase`${line} still needs one more boat square and has just one free square left`,
            move: phrase`${ringed(m.ships, "that square")} must hold a boat segment${follows(m)}`,
          })
      : t.line.deduced
        ? so({
            look: hidden,
            follows: phrase`it needs ${n} more`,
            move: phrase`${ringed(m.ships, `all ${n} of its free squares`)} must hold boat segments${follows(m)}`,
          })
        : so({
            look: phrase`${line} still needs ${n} more boat squares and has only ${n} free squares left`,
            move: phrase`${ringed(m.ships, "each")} must hold a boat segment${follows(m)}`,
          });
  },

  allWaterPlaced: (m: BoatsMarks): Sentence =>
    so({
      look: phrase`every square of water the puzzle has room for is already marked`,
      move: phrase`${ringed(m.ships, "every square still free")} must hold a boat segment${follows(m)}`,
    }),

  centerForced: (t: T<"centerForced">, m: BoatsMarks): Sentence => {
    const seg = mark.this("outline", CELL, [t.center], "middle segment");
    // Off the board counts as water, and the renderer outlines only squares on
    // it, so the board's edge is named as itself.
    const onBoard = m.evidence.some((c) => c.x === t.water.x && c.y === t.water.y);
    const where = t.vertical ? "beside it" : "above or below";
    const water = onBoard
      ? outlined([t.water], `water ${where}`)
      : phrase`the board's edge ${where}`;
    return so({
      look: phrase`${seg} has ${water}`,
      move: t.vertical
        ? phrase`its boat must run up and down, through ${ringed(m.ships, "the squares above and below")}${follows(m)}`
        : phrase`its boat must lie across, through ${ringed(m.ships, "the squares either side")}${follows(m)}`,
    });
  },

  isolated: (m: BoatsMarks): Sentence =>
    so({
      look: phrase`every 1-boat is already placed, and ${outlined(m.evidence, "water")} or the board's edge surrounds ${ringed(m.waters, "this square")}`,
      move: phrase`it must be water`,
    }),

  mustExtend: (m: BoatsMarks): Sentence =>
    so({
      look: phrase`every 1-boat is placed, and water or the edge closes three sides of ${mark.this("outline", CELL, m.evidence, "segment")}`,
      move: phrase`its boat must use ${ringed(m.ships, "the fourth")}${follows(m)}`,
    }),

  // A boat running along the line through the middle segment needs two more
  // boat squares in it, one each side, and the line has room for one at most.
  // The water follows with no step between: a boat square beside the segment
  // in the line would be such a boat.
  centerCount: (t: T<"centerCount">, m: BoatsMarks): Sentence => {
    const way = t.vertical ? "across" : "up and down";
    const line = lineRef(t.line, m);
    const seg = mark.this("outline", CELL, m.evidence, "middle segment");
    const next = ringed(
      m.waters,
      t.vertical ? "the square to its right" : "the square below",
    );
    return so({
      look: t.line.deduced
        ? phrase`${line}'s hidden number, ${t.line.clue}, leaves no room for a boat running ${way} through ${seg}`
        : phrase`${line} has no room for a boat running ${way} through ${seg}`,
      move: phrase`${next} must be water`,
    });
  },

  growTooLong: (t: T<"growTooLong">, m: BoatsMarks): Sentence => {
    const square = ringed(m.waters, "this square");
    const beside = m.evidence.length
      ? phrase`, beside ${mark.the("outline", CELL, m.evidence, "segment")},`
      : "";
    return t.largest === 0
      ? so({
          look: phrase`every boat in the fleet has been found`,
          move: phrase`${square}${beside} must be water`,
        })
      : so({
          look: phrase`filling ${square} joins ${mark.the("outline", CELL, m.evidence, "segment")} into a boat of ${t.joined}; the largest still missing is ${t.largest}`,
          move: phrase`it must be water`,
        });
  },

  mustGrow: (t: T<"mustGrow">, m: BoatsMarks): Sentence =>
    so({
      look: phrase`every ${t.length}-boat is already placed`,
      follows: phrase`${mark.this("outline", whole(CELL), m.evidence, "unfinished boat")} can't stop at ${t.length}`,
      move: phrase`it must continue into ${ringed(m.ships, "this square")}${follows(m)}`,
    }),

  runTooShort: (t: T<"runTooShort">, m: BoatsMarks): Sentence =>
    so({
      look: phrase`filling ${mark.this("outline", whole(CELL), m.evidence, "run")} would make a boat of ${t.length}, but every ${t.length}-boat is already placed`,
      move: phrase`${ringed(m.waters, (els) => (els.length > 1 ? "the free squares" : "the free square"))} must be water`,
    }),

  onlyRunsLeft: (t: T<"onlyRunsLeft">, m: BoatsMarks): Sentence => {
    const covered = ringed(m.ships, (els) =>
      els.length > 1 ? "these squares are" : "this square is",
    );
    const water = m.waters.length
      ? phrase`, with ${ringed(m.waters, "water either side")}`
      : "";
    return t.runs === 1
      ? so({
          look: phrase`only ${outlined(m.evidence, "one run")} can still hold the ${t.size}-boat`,
          follows: phrase`it must go there`,
          move: phrase`${covered} covered wherever it sits${water}${follows(m)}`,
        })
      : so({
          look: phrase`only ${outlined(m.evidence, `${t.runs} runs`)} can still hold the ${t.runs} remaining ${t.size}-boats`,
          follows: phrase`every one is used`,
          move: phrase`${covered} covered either way${water}${follows(m)}`,
        });
  },

  sharedDiagonal: (t: T<"sharedDiagonal">, m: BoatsMarks): Sentence => {
    const side = t.line.horizontal ? "above and below" : "either side of";
    return so({
      look: phrase`${lineIntro(t.line, m)}${lineRef(t.line, m).capitalized()} can take only ${t.room} more water square${plural(t.room)}`,
      follows: phrase`one of ${outlined(m.evidence, "these")} must be a boat segment`,
      move: phrase`either way, ${ringed(m.waters, `the squares ${side} the middle one`)} must be water`,
    });
  },

  refuted: (t: T<"refuted">, m: BoatsMarks): Sentence => {
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
    return t.trialShip
      ? so({
          look: phrase`if ${square} held a boat segment, ${why}`,
          move: phrase`it must be water`,
        })
      : so({
          look: phrase`if ${square} were water, ${why}`,
          move: phrase`it must hold a boat segment${follows(m)}`,
        });
  },
};

# hold-a-hint-step-to-the-board-the-player-sees

**Status: filed 2026-10-11 by the session that archived
`state-what-a-games-spec-never-did`, whose census found these. What it says
of the code was true that day; re-check before relying on it.**

## Why

Four games' hints say something the board in front of the player does not
show. Each was reproduced through the midend by an agent that had not seen
the first report. The boards, steps, sentences and counts are in
`openspec/changes/archive/2026-10-11-state-what-a-games-spec-never-did/found.md`,
§ "A hint that says what the board does not show":

- **Signpost**: every "consecutive numbers" step asks for a link the board
  already holds: 85 of 85 over forty dealt boards. Following it adds an Undo
  step and changes nothing a player can see.
- **Palisade**: a region rule joins two regions without a step, and later
  sentences count the join: 123 of 1924 steps that state a region's size, on
  28 of 60 dealt boards, give one the board's no-wall marks do not add up to.
- **Undead**: on 31 of 60 dealt boards the first step is a placement whose
  sentence rests on strikes the player has not been shown.
- **Galaxies**: "Any other dot mirrors this cell off the board or onto a dot"
  is false of 2,544 of the 4,049 steps it was said on, over 400 dealt boards;
  the firing also drops a dot for reach and for a finished region.

`engine-hints` already has the rules: "A hint relies only on marks the player
can make" and "A displayed hint step never references already-resolved
state". Three requirements the census wrote state the rule the code breaks
(`signpost`, "A Signpost hint asks for no link the board already holds";
`palisade`, "Palisade regions are all one size, in the hint as on the board";
`undead`'s order requirement states the code and changes with the fix).

## What the engine could do so that no game has this

The same finding in four games is the engine's first. Each census agent
found its bug by walking the hint on dealt boards and comparing a step with
the board as played, which the hint-quality walk already does for other
properties. Two checks would have caught three of the four in every game:

- **A step's move changes what a player sees.** Signpost's changes only a
  chain count, which was enough for the midend not to drop it. The walk can
  compare the board's drawn content, or the save, before and after a step.
- **A step's premise is on the board.** Where a step's marks name evidence,
  the walk can check that the evidence is a mark the board holds at that
  step, and not one the plan's private copy made. Palisade's silent join and
  Undead's unshown strikes are both a plan ahead of the board.

Galaxies' sentence is a wording that is narrower than the firing, which no
walk reads; it is fixed in the game and its help page.

## What Changes

- The walk gains whichever of the two checks can be written to fail on the
  boards recorded, seen failing before any game is fixed.
- The least that mends each game: Signpost's plan makes the automatic links
  too, and the rung goes or is refreshed away; Palisade records the join as
  a firing that marks every undecided edge between the two regions open;
  Undead's planner offers no placement that rests on a strike not yet shown;
  Galaxies' sentence says that no galaxy about another dot reaches the
  square.
- The help page of each, where it describes the step.

A player sees different hint steps and words in four games. That is the
fix of a defect, and the owner did not ask to see it first.

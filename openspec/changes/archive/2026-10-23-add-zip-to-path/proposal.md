# add-zip-to-path

Filed 2026-10-22: the owner asked for LinkedIn's *Zip*, and whether it fits
as a ruleset of Path. The owner (2026-10-23): "I'm leaning towards a Path
ruleset", with no objection raised.

## The puzzle

A grid with numbered squares 1 to K, each number once. Draw one line that
starts at 1, passes the numbers in order and ends at K, through every square.
Some boards also have walls between squares the line may not cross.

## Why a ruleset of Path

Zip is Numberlink with its pairs chained: the line from 1 to 2 and the line
from 2 to 3 meet at 2. On Path's board that is one change of rule: a number
other than the first and last takes two lines, not one, and a piece of line
may join numbers only in order. Everything else is Path's already:

- the board (an edge mark between squares), the desc (numbers in reading
  order), the drag and keyboard input (`engine/line-drawing.ts`), and the
  line drawing;
- the ladder: the Easy rung reads a square's line count, and both lookaheads
  suppose and walk it unchanged; only `live` (which pieces a line may join)
  and the clashes it names differ;
- the generator's shape: lay one path through every square, number points
  along it, mend and strip numbers tier by tier, as Path does with pairs;
- the engine's rulesets (`engine/ruleset.ts`), as Seismic plays Tectonic:
  the Custom dialog's "Game mode", the Type menu's sections, "Zip: 7x7
  Normal" labels and the help page's list of rules all come from one
  declaration.

Walls are crossed edges the desc gives and play cannot clear.

## What a separate game would buy

Its own entry in the game list, findable as "Zip". As a ruleset it is found
in Path's menu, under its own section. Either way the code is the same
modules; the difference is the listing.

## Decisions

- **A ruleset of Path** (owner, 2026-10-23), first dealt as "Zip" and then
  named **Path**, with the pair puzzle renamed **Pairs** and Path first on
  the menu (owner, 2026-10-23; design D10).
- **The owner's playtest** (2026-10-23): a pointer's drag only adds, a stroke
  from a number draws its line ahead again, and a lookahead names its edge
  as a pill (design D7 to D9).
- **Walls in the first version**: LinkedIn's boards use them, and on Path's
  board a wall is an edge the desc closes, so they cost a desc field and a
  drawn line, not a new kind of board. The generator lays a few where they
  make a board need its tier with fewer numbers. (Proposed 2026-10-23 for
  the owner to overrule.)
- **The look**: one line whose color runs along it from 1 to K, as Zip's
  does, rather than Path's color per pair: a piece takes the color of how
  far along the order its numbers sit, and a piece reaching none stays ink.
  (Proposed 2026-10-23 for the owner to overrule.)

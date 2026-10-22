# add-zip-to-path

**A draft, waiting on the owner's word** (filed 2026-10-22): the owner asked
for LinkedIn's *Zip*, and whether it fits as a ruleset of Path.

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

## Open question for the owner

- **A ruleset of Path (recommended), or its own entry in the list** sharing
  Path's modules?
- **Walls in the first version, or later?**
- **The look**: LinkedIn draws the line as one gradient; Path colors by
  pair. A Zip board could color the line by how far along it a piece is.

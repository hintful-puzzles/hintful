# keep-a-numbers-line-on-a-new-stroke

## Why

The owner (2026-11-12), on a phone, Path 6x6 Easy: the 3 had one line, on to
the 4 and through the 5 to the 6. A stroke from the 3 to the left, toward
the 2, took up that whole line: "I expected I could draw a path left from
the 3 node, but for some reason it invalidated its existing path."

A stroke from a number redraws the line ahead of it (owner, 2026-10-23), and
under Path ahead is the side the numbers rise along, so the 3's line to the
4 was ahead and went, however the stroke set off. The redraw is for a number
whose lines are all drawn. A number with room for another line, stroked a
way none of its lines runs, is being given that line.

## What changes

- `lineAhead` (`src/games/path/moves.ts`) returns nothing to replace for a
  number with fewer lines than it takes, when the stroke sets off along
  none of them. Under Pairs a number takes one line, so a stroke from it
  still replaces its line, as in Flow Free.
- A stroke that sets off along the number's line still redraws it, and a
  number whose lines are full is redrawn as before.
- Path's help says so.

What it costs: to redraw a middle number's only line a new way, a player
now takes the old line up first, or starts on the old line. A stroke a new
way from it draws the other line instead.

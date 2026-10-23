# Design: add-zip-to-path

## D1. Zip's rule is local to the meeting ends

Every Zip number is on one square, so a piece of line is out of order exactly
when, at the edge where two pieces meet, the numbers nearest the two ends are
more than one apart. Two that are one apart cannot meet in the wrong order:
the 4's piece cannot also hold the 3. So `Pieces` in `solver.ts` keeps, per
piece, its two end squares and the number nearest each, and both rulesets
read that: Path lets two pieces meet where those numbers are alike or one is
missing, and Zip where they are one apart. `PathBoard.live`, the Easy rung
and both lookaheads are unchanged.

Zip also counts the edge between a piece's own two ends as closed. A Zip
answer touches itself everywhere, so this is common and a player sees it.
Path's ladder does not: Path's generator lays no path that touches itself,
and adding it to Path would change which tier its boards grade at, which this
change does not set out to do.

## D2. The puzzle is the desc's half of the state

`PathPuzzle` holds what play never changes: the mode, the numbers, how many
lines each square takes (`takes`, which is the only place the rulesets differ
in degree), and the walls. `PathState` extends it with the edges, and
`PathBoard`, `isComplete`, `answerOf` and `countAnswers` take it whole.

## D3. Walls

A wall is an edge the desc gives as a cross, after a comma, in the engine's
wall-run list (`engine/wall-runs.ts`), whose edge order is
`square-edges.ts`'s. The ladder reads it as any cross. The engine's line
drawing gains `LineRules.fixed`, which no click, key or drag changes, and
`executeMove` refuses a change to one, so a crafted save cannot clear it.
Both rulesets read walls; only Zip's generator lays them.

## D4. Zip's generator

`zip-generator.ts`: a snake along the rows shaken by backbites gives a path
through every square; numbers start at its two ends and are mended in beside
edges the Easy rung leaves open, then stripped at Easy and at the tier asked
for. A few walls (a square in eight) are laid at random off the path first,
and every wall the stripped board can do without is taken away last.
Measured 2026-10-23: walls laid first took a 7x7 Normal deal a median 60 ms
against 700 ms for trying each wall after the strip, for a median of eight
numbers against seven. Stripping straight at Tricky, skipping Normal, took a
6x6 Tricky deal a median 0.2 s against 3.3 s.

## D5. The menu

Path keeps its eleven lines. Zip offers 6x6 and 7x7 at Easy and Normal and
8x8 at all three tiers, seven lines and eighteen in all, the menu's limit.
Tricky is left off the smaller Zip boards because a deal's worst of eight
took 1.2 s at 6x6 and 1.3 s at 7x7, against 0.8 s at 8x8: small boards seldom
need the long lookahead.

## D6. The look

Zip colors its line along `FREE_RAMP` (`engine/color/colors.ts`), the free
colors in order of hue with gray and the near-duplicate hues left out, so it
runs orange, yellow, mint, teal, violet, magenta, pink from the 1 to the
highest number. Each square takes the color of the number behind it, spread
evenly over the run; a piece with one number takes that number's color until
its direction shows. On a number's own square, the half-line arriving from
the number before keeps that stretch's color: drawn in the number's color,
it showed in the app as a stub of the wrong color beside every disc. A wall is an ink bar on its edge. Proposed for the
owner to overrule, as the proposal says.

## D8. A pointer's drag only adds

The owner's playtest (2026-10-23): drawing a whole Zip line in one stroke, a
finger that brushed an earlier part of the line cut the drag back there and
lost what came after. A pointer's drag back onto a square it passed now does
nothing, and the drag carries on once the pointer is back beside its end;
Undo takes a stroke back. It is the engine's drag, so Pearl's changes too.
The keyboard's drag keeps the cut-back: an arrow cannot brush a square by
accident, and stepping back is its only way to correct a line before Enter.

## D7. The hint's words

The sentences are Path's. The forced step's count is the square's `takes`
rather than whether it holds a number, so a middle Zip number reads "The
outlined 12 has only one edge left for its second line". An out-of-order
break reads "join the outlined 4 to the 9", lower first; "without passing
the 5" was tried and ran past the 120-character line.

A lookahead named its edge as a bare "here" ("A cross here would…"), which
the owner could not place (2026-10-23), and `docs/hints.md` forbids. It now
reads "A cross on [this edge] would …, so it must be a line", in both
rulesets.

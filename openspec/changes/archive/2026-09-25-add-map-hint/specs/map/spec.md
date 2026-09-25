# map

## MODIFIED Requirements

### Requirement: Map reports completion and mistakes

The board SHALL be completed when every region is colored and no two adjacent
regions share a color. Because boards are uniquely solvable, the game SHALL
implement `findMistakes`: re-solve from the immutable clues to the unique
solution and return every region whose player-assigned color differs from it (a
definite mistake), and every blank region whose dots leave out its color in that
solution, because a dot claims the region might be that color; a
non-uniquely-solvable board yields no mistakes, and a blank region with no dots
is never a mistake. Check & Save depends on this hook and SHALL
refuse to save while any mistake is present. The always-on red adjacency error
markers (drawn where two adjacent colored regions clash) SHALL remain,
independent of `findMistakes`.

#### Scenario: A region colored against the unique solution is flagged

- **WHEN** the player colors a region a color the unique solution does not give
  it, and `findMistakes` is invoked
- **THEN** that region is returned as a mistake

#### Scenario: A partially-colored but correct board has no mistakes

- **WHEN** the player has colored only regions in agreement with the unique
  solution
- **THEN** `findMistakes` returns an empty result

#### Scenario: Dots that leave out a region's color are flagged

- **WHEN** the player dots a blank region with colors that do not include the
  one the unique solution gives it, and `findMistakes` is invoked
- **THEN** that region is returned as a mistake, and a hint is refused until it
  is fixed

## ADDED Requirements

### Requirement: Map explains the next deduction

`hint(state)` SHALL refuse through `commonHintRefusal` when the board is solved
or `findMistakes` reports a mistake, SHALL refuse with `DEDUCTION_EXHAUSTED` when
nothing follows, which only an Unreasonable board allows, and otherwise SHALL
return the forced steps from the player's own board as an ordered plan.

A blank region's colors SHALL be read as its dots, or all four colors when it
has none, less every color a neighbor shows. That is sound because
`findMistakes` flags any dots leaving out a region's answer. The plan SHALL
place dots only where a deduction rules out a color no neighbor shows, so an
Easy board's plan places none.

The deductions SHALL be the solver's three rungs, reported by the same functions
the solver runs: a region with one color left must take it; two touching regions
down to the same two colors use both, so a region touching both can be neither;
and a forcing chain, in which region 1 has two colors, each numbered region
forces the next if region 1 is not the struck color, and the last is driven to
it, so a region touching the first and the last cannot be that color. The plan
SHALL offer the lowest rung that fires anywhere on the board and choose within
it by continuing from its latest steps, so an Easy board's plan never shows a
pair and a Normal board's never shows a chain. A narrowing step SHALL color its
region when one color is left, remove the struck dots when the region has dots,
and otherwise dot the colors left, and its sentence SHALL say which. One firing
that narrows several regions SHALL be one journey, a leg per region.

A step SHALL ring the region it acts on with a band inside the region's
boundary, heavier than the band outlining each region its premise rests on, in
the hint colors, and SHALL number a chain's regions at their label points,
hiding the region numbers while it does. The selection band SHALL stay visible
just inside a hint band on the same region.

The generator SHALL NOT call the hint, and splitting the rungs into functions
SHALL change no solver verdict.

#### Scenario: A region whose neighbors show three colors takes the fourth

- **WHEN** a blank region with no dots touches regions of three different colors
  and a hint is requested
- **THEN** the step colors it the fourth, rings it, outlines those neighbors,
  and names the three colors and the fourth

#### Scenario: A chain's conclusion is dotted onto an unmarked region

- **WHEN** the next deduction is a forcing chain striking a color from a region
  with no dots
- **THEN** the step dots that region with the colors it has left, numbers the
  chain's regions 1 to N on the board, and says region 1's two colors, the color
  region N is driven to, and that this region touches both ends

#### Scenario: The hint's dots are the next step's premise

- **WHEN** the player follows a step that dots a region and asks for the next
  hint
- **THEN** a later deduction may read that region's colors from those dots, as
  the player can

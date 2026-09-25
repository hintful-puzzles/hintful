# map

## MODIFIED Requirements

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

A step SHALL ring the region it acts on with a solid band inside the region's
boundary, in the hint's action color, and that band SHALL be the only hint mark
on any region boundary. A region with one color left SHALL outline nothing else,
because its neighbors' fills are its premise. The regions a pair or a chain
rests on SHALL be outlined by a thin dashed line in the hint's evidence color,
set in from their boundary, so that where they meet the target the two marks
stay apart. A chain's regions SHALL be numbered at their label points, with the
region numbers hidden while it shows. The selection band SHALL stay visible just
inside a hint band on the same region.

The generator SHALL NOT call the hint, and splitting the rungs into functions
SHALL change no solver verdict.

#### Scenario: A region whose neighbors show three colors takes the fourth

- **WHEN** a blank region with no dots touches regions of three different colors
  and a hint is requested
- **THEN** the step colors it the fourth, rings it, outlines nothing else, and
  names the three colors and the fourth

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

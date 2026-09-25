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
place dots only where a deduction rules out a color no neighbor shows, or where
a pair's or chain's premise needs them, so an Easy board's plan places none.

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

A pair or chain firing SHALL open its journey with a leg for each region its
premise rests on that does not already show exactly its two colors as dots,
dotting them (or removing the dots a neighbor's color rules out), so that when
the pair or chain step is spoken every one of those regions shows its two
colors and the deduction can be followed on the board rather than worked out.

The chain step SHALL name what the dots show rather than a rule the player must
run. When every numbered region has a dot of the struck color, it SHALL say so
and that the color falls on every other region from region 2 when region 1 does
not take it. Otherwise it SHALL walk the chain by color, naming region 1's other
color and the color each later region then takes, for a chain of up to five
regions, and past that SHALL name the rule and where the chain ends. Either way
it SHALL conclude that region 1 or the last region takes the struck color, and
that this region touches both. The plan SHALL fail rather than speak a walk that
does not end on the struck color.

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

#### Scenario: A pair's undotted region is dotted before the pair is stated

- **WHEN** the next deduction is a pair one of whose regions shows no dots
- **THEN** the journey's first step rings that region, outlines the other,
  dots the two colors its neighbors leave it, and the pair step follows with
  both regions showing their two dots

#### Scenario: A chain's conclusion is dotted onto an unmarked region

- **WHEN** the next deduction is a forcing chain striking a color from a region
  with no dots
- **THEN** the journey first dots each numbered region without them with its two
  colors, then its last step dots that region with the colors it has left,
  numbers the chain's regions 1 to N on the board, and says region 1's two
  colors, the color region N is driven to, and that this region touches both
  ends

#### Scenario: A chain whose regions all carry the struck color is told as a pattern

- **WHEN** every numbered region of a chain has a dot of the struck color when
  the chain step is spoken
- **THEN** the sentence says so, and that the color falls on every other region
  if region 1 does not take it, instead of naming each region's color

#### Scenario: The hint's dots are the next step's premise

- **WHEN** the player follows a step that dots a region and asks for the next
  hint
- **THEN** a later deduction may read that region's colors from those dots, as
  the player can

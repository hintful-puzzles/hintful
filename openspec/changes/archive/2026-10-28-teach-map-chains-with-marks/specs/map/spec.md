## MODIFIED Requirements

### Requirement: Generation: Map's solver is graded by tier

The solver SHALL have its full graded deductive power over the
region-adjacency graph: at Easy, place a region that has exactly one possible
color left; at Normal, additionally exclude a shared color pair from the
common neighbors of an adjacent same-two-possibilities pair; at Tricky,
additionally weigh every color of one region, each read off its neighbors'
dots; at Unreasonable, additionally recurse (guess and verify).

#### Scenario: A board that needs a pair is not solved at Easy

- **WHEN** a board whose solution needs the shared-pair deduction, and nothing
  above it, is solved with the Easy cap
- **THEN** the solver does not report a unique solution
- **AND** with the Normal cap it does

#### Scenario: A board that needs a forcing chain longer than three is Unreasonable

- **WHEN** a board whose ID says Tricky needs a forcing chain the
  weighing does not reach
- **THEN** it opens as Unreasonable, keeps its ID, and its hint refuses where
  the chain was, as on any Unreasonable board

### Requirement: Hint: A blank region's colors are read from its dots

A blank region's colors SHALL be read as its dots, or all four colors when it
has none, less every color a neighbor shows. That is sound because
`findMistakes` flags any dots leaving out a region's answer. The plan SHALL
place dots only where a deduction rules out a color no neighbor shows, or
where a pair's or weighing's premise needs them, so an Easy board's plan
places none.

#### Scenario: The hint's dots are the next step's premise

- **WHEN** the player follows a step that dots a region and asks for the next
  hint
- **THEN** a later deduction may read that region's colors from those dots, as
  the player can

### Requirement: Hint: The hint's deductions are the solver's three rungs

The deductions SHALL be the solver's three rungs, reported by the same
functions the solver runs: a region with one color left must take it; two
touching regions down to the same two colors use both, so a region touching
both can be neither; and a weighing, in which every color a middle region can
take but one, `x`, leaves a neighbor dotted with that color and `x` with `x`
alone, so a region touching every such neighbor, and the middle region where
it could be `x`, cannot be `x`.

#### Scenario: A region whose neighbors show three colors takes the fourth

- **WHEN** a blank region with no dots touches regions of three different colors
  and a hint is requested
- **THEN** the step colors it the fourth, rings it, outlines nothing else, and
  names the three colors and the fourth

#### Scenario: A three-region chain is a weighing

- **WHEN** a region can be yellow or pink, one neighbor is dotted yellow and
  teal, another pink and teal, and a third region touches both neighbors
- **THEN** the weighing rules teal out of the third region

### Requirement: Hint: The plan offers the lowest rung that fires

The plan SHALL offer the lowest rung that fires anywhere on the board and
choose within it by continuing from its latest steps, so an Easy board's plan
never shows a pair and a Normal board's never shows a weighing.

#### Scenario: A single elsewhere comes before a pair nearby

- **WHEN** a pair fires beside the last step's region and a region somewhere
  else has one color left
- **THEN** the next step colors the region with one color left

### Requirement: Hint: A premise's regions are outlined apart from the ring

The outline of the regions a pair or a weighing rests on, which the legend
sets in from their boundary, SHALL stay apart from the ring where one of them
meets the target. The selection band SHALL stay visible just inside a hint
band on the same region.

#### Scenario: An outlined pair beside its target

- **WHEN** a pair step is shown and one of the pair borders the ringed region
- **THEN** the dashed line and the solid band on either side of that border do
  not touch

## REMOVED Requirements

### Requirement: Hint: A pair or chain first dots its premise

**Reason**: The chain is retired; the rule now covers the pair and the
weighing, under a name and scenarios that say so.

**Migration**: "Hint: A pair or weighing first dots its premise".

### Requirement: Hint: The chain step names the chain by its ends

**Reason**: `forcingChain` is retired (`teach-map-chains-with-marks` D4).

**Migration**: "Hint: The weighing step names its middle region and its ends".

### Requirement: Hint: A chain's regions carry no number

**Reason**: The chain is retired, and no hint step draws a number on a
region: a ring keeps the region's own number, which the legend says.

**Migration**: None.

## ADDED Requirements

### Requirement: Hint: A pair or weighing first dots its premise

A pair or weighing firing SHALL open its journey with a leg for each region
its premise rests on that does not already show exactly its colors as dots,
dotting them (or removing the dots a neighbor's color rules out), so that when
the pair or weighing step is spoken every one of those regions shows its
colors and the deduction can be followed on the board without being worked
out. Such a leg SHALL ring the region it dots and outline nothing.

#### Scenario: A pair's undotted region is dotted before the pair is stated

- **WHEN** the next deduction is a pair one of whose regions shows no dots
- **THEN** the journey's first step rings that region, outlines nothing, dots
  the two colors its neighbors leave it, and the pair step follows with both
  regions showing their two dots

#### Scenario: A weighing's conclusion is dotted onto an unmarked region

- **WHEN** the next deduction is a weighing striking a color from a region
  with no dots
- **THEN** the journey first dots the middle region and each end without them
  with their colors, then its last step dots that region with the colors it
  has left and outlines the middle region and the ends

### Requirement: Hint: The weighing step names its middle region and its ends

The weighing step SHALL name the middle region and the ends, each a reference
of its own, and say that whatever the middle region is, it or an end beside
the ringed region is the struck color. The dots its regions show are the
ways, and the sentence SHALL NOT recite them color by color.

#### Scenario: A weighing is named by its parts

- **WHEN** a weighing step is spoken
- **THEN** pressing "the middle region" finds that region alone, and pressing
  "an end" finds the ends

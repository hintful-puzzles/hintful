## MODIFIED Requirements

### Requirement: Hint: The hint's deductions are the solver's three rungs

The deductions SHALL be the solver's three rungs, reported by the same
functions the solver runs: a region with one color left must take it; two
touching regions down to the same two colors use both, so a region touching
both can be neither; and a forcing chain, in which each region has two colors
and forces the next if the first is not the struck color, so the last is
driven to it and a region touching both ends cannot be that color.

#### Scenario: A region whose neighbors show three colors takes the fourth

- **WHEN** a blank region with no dots touches regions of three different colors
  and a hint is requested
- **THEN** the step colors it the fourth, rings it, outlines nothing else, and
  names the three colors and the fourth

### Requirement: Hint: A pair or chain first dots its premise

A pair or chain firing SHALL open its journey with a leg for each region its
premise rests on that does not already show exactly its two colors as dots,
dotting them (or removing the dots a neighbor's color rules out), so that when
the pair or chain step is spoken every one of those regions shows its two
colors and the deduction can be followed on the board without being worked
out. Such a leg SHALL ring the region it dots and outline nothing.

#### Scenario: A pair's undotted region is dotted before the pair is stated

- **WHEN** the next deduction is a pair one of whose regions shows no dots
- **THEN** the journey's first step rings that region, outlines nothing, dots
  the two colors its neighbors leave it, and the pair step follows with both
  regions showing their two dots

#### Scenario: A chain's conclusion is dotted onto an unmarked region

- **WHEN** the next deduction is a forcing chain striking a color from a region
  with no dots
- **THEN** the journey first dots each region of the chain without them with
  its two colors, then its last step dots that region with the colors it has
  left, outlines the chain, and says the struck color falls on one end or the
  other and that this region touches both

## ADDED Requirements

### Requirement: Hint: The chain step names the chain by its ends

The chain step SHALL name the chain as a whole and each of its two ends as a
reference of its own, and conclude that the chain puts the struck color at one
end or the other and that this region touches both. The dots its regions show
are the walk, and the sentence SHALL NOT recite it region by region. The plan
SHALL fail and SHALL NOT speak a walk that does not end on the struck color.

#### Scenario: A chain is named by its ends

- **WHEN** a chain step is spoken
- **THEN** it says the struck color is at one end or the other and that the
  ringed region touches both, and pressing "one end" or "the other end" finds
  that region alone

### Requirement: Hint: A chain's regions carry no number

No number SHALL be drawn on a region of a chain, and the map's own region
numbers SHALL show or hide as the player set them, whatever the hint shows.

#### Scenario: Region numbers stay while a chain shows

- **WHEN** the region numbers are shown and a chain step is displayed
- **THEN** every region shows its own number, and no region of the chain
  carries another

## REMOVED Requirements

### Requirement: Hint: The chain step names what the dots show

**Reason**: The chain step names its ends and the rule, not a pattern or a
walk region by region (owner, 2026-10-18), and no longer numbers the regions
it would have named.

**Migration**: Requirement "Hint: The chain step names the chain by its ends".

### Requirement: Hint: The chain step ends on the struck color

**Reason**: Folded into the requirement that names the chain by its ends,
since there is one telling and not two.

**Migration**: Requirement "Hint: The chain step names the chain by its ends".

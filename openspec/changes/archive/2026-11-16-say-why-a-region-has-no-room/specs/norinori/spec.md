## MODIFIED Requirements

### Requirement: Hint: A trial shade is one square and what it rules out at once

A step that tries a square shaded SHALL rule out only the open squares
beside it and its partner where it would complete a domino, and the rest of
its region where it would complete it, and SHALL conclude only that a region
is left without room for the shaded squares it needs. It SHALL follow no
further consequence of the trial.

#### Scenario: A trial that leaves a region without room

- **WHEN** shading a square would complete a domino whose neighbors take
  the open squares a region needs
- **THEN** the step crosses the tried square out, stripes the region and
  outlines the tried square's partner, not the open squares the trial rules
  out

## ADDED Requirements

### Requirement: Hint: A region without room outlines what closes it

A step that concludes a region has no room for the shaded squares it needs
SHALL say they do not fit "as dominoes" ("in a domino" for one), and SHALL
outline the shaded squares outside the region's open squares and beside
them, which a fill of them must keep clear of, saying "given" them. Its
outline SHALL hold only shaded squares, as every other step's does.

#### Scenario: A shaded square in the next region closes the room

- **WHEN** a region's open squares, less one, cannot hold its two shaded
  squares as dominoes because one of them would touch a shaded square of
  the next region
- **THEN** the step rings the square left out, stripes the region, outlines
  that shaded square, and says the region has no room for 2 shaded squares
  as dominoes, given the outlined square

## ADDED Requirements

### Requirement: The Tents completion flash lifts each square and keeps its pieces

The completion flash SHALL sweep the squares diagonally, a square's position
being its place in the grid. A lit square SHALL take the lifted surface in
place of its grass or its plain surface, and SHALL keep its tree or tent and
its link.

#### Scenario: The flash is on a tree

- **WHEN** the completion flash is on a tree's square
- **THEN** the square is drawn on the lifted surface, with its tree

## REMOVED Requirements

### Requirement: Tents flashes on completion in three phases

**Reason**: The completion flash is a highlight that travels the squares, and
a lit square keeps its tree or tent, so there are no phases and nothing is
blanked.

**Migration**: None. Nothing a player holds refers to the flash.

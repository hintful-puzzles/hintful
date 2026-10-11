## ADDED Requirements

### Requirement: The Signpost completion flash runs the chain from 1 to the last number

The completion flash SHALL run the finished chain: a square's position SHALL
be its number, and the arrows SHALL stay still. A lit square SHALL be filled
with a flash color and SHALL keep its arrow and its number, a given as any
other square.

#### Scenario: The flash follows the numbers, not the grid

- **WHEN** a board is won and frames of its flash are drawn from start to end
- **THEN** the squares first light in the order of their numbers, wherever on
  the grid the chain goes

#### Scenario: A lit given

- **WHEN** the highlight is on a given
- **THEN** the given is filled with a flash color as the squares beside it
  are, and returns to its lifted surface as the highlight leaves it

## REMOVED Requirements

### Requirement: Signpost exposes the victory-flash preference

**Reason**: The win flash is one traveling highlight in every game
(`ts-engine`, "The win flash is one traveling highlight in every game"), so
the arrows do not spin and there is no rotation to choose.

**Migration**: None. A stored `flash-type` preference names a key the game
does not declare, and is not applied.

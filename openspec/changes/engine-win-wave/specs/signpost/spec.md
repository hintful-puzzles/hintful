## ADDED Requirements

### Requirement: The Signpost completion flash runs the chain from 1 to the last number

The completion flash SHALL run the finished chain: a square's position SHALL
be its number, and the arrows SHALL stay still. A lit square SHALL swap
surfaces, a given dropping to the surface of a square the player numbered and
any other square lifting to a given's, so the highlight shows on a given as on
the rest.

#### Scenario: The flash follows the numbers, not the grid

- **WHEN** a board is won and frames of its flash are drawn from start to end
- **THEN** the squares first light in the order of their numbers, wherever on
  the grid the chain goes

#### Scenario: A lit given

- **WHEN** the highlight is on a given
- **THEN** the given is drawn on the surface of a square the player numbered,
  and returns to its lifted surface as the highlight leaves it

## REMOVED Requirements

### Requirement: Signpost exposes the victory-flash preference

**Reason**: The win flash is one traveling highlight in every game
(`ts-engine`, "The win flash is one traveling highlight in every game"), so
the arrows do not spin and there is no rotation to choose.

**Migration**: None. A stored `flash-type` preference names a key the game
does not declare, and is not applied.

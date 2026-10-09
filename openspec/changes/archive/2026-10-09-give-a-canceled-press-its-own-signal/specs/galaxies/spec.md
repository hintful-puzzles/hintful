## MODIFIED Requirements

### Requirement: A press that ends far from where it began commits nothing

A press that did not become a drag and ends far from where it began SHALL
commit nothing at all: it SHALL NOT toggle an edge on the far side of the
board. A canceled press is the engine's (`engine-input`, "A canceled press
leaves the game as it was before the press"), and the game does not read a
drag off the board as one: an arrow dragged off any side of the board is
removed.

#### Scenario: A canceled press toggles no edge

- **WHEN** a left press is followed, with no drag between, by a release far
  from the press point
- **THEN** no edge toggles and no history entry is added

#### Scenario: A canceled press leaves the arrow under it

- **WHEN** a tile that carries an arrow is pressed with either button, or by a
  finger held past the touch hold, and the press is canceled, before the
  pointer moves or after
- **THEN** the arrow and its partner's stay, and no history entry is added

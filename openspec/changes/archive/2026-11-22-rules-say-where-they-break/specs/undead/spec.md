## MODIFIED Requirements

### Requirement: Rules: Undead shows live legality errors

Undead SHALL draw in the error color, as soon as the board makes it certain
and with no mistake check asked for (`Game.rules`), a monster's total that
the board can no longer meet: more of that monster placed than it shows, or
too few squares left open to make it up. It SHALL draw in the error color a
sightline clue that the line can no longer show: more monsters already
visible than it says, or too few even with every blank on it counted. The
squares themselves are not marked.

#### Scenario: A sightline that can no longer reach its clue

- **WHEN** the monsters placed on a line leave fewer visible, even with every
  blank on it counted, than a clue at one end asks for
- **THEN** that clue is drawn in the error color

#### Scenario: A total too many

- **WHEN** one more zombie is placed than the zombie total shows
- **THEN** the zombie total is drawn in the error color, with squares still
  empty

#### Scenario: A total with no room left

- **WHEN** fewer squares are left empty than the ghosts still to place
- **THEN** the ghost total is drawn in the error color

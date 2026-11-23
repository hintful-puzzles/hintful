## MODIFIED Requirements

### Requirement: A born game's build may lay one value on a first one's cells

A built or scattered sample MAY lay a `first` value on a share of the
cells, as symmetric as an option asks. A build SHALL then lay one value
alone, each on a random cell that may still hold it, the ladder deciding the
rest on the first cells' clues, every hidden one hidden; a scatter SHALL
scatter on the cells left. A `ramp` SHALL raise the share by its step every
`every` draws, wrapping past its top.

#### Scenario: Light Up's walls

- **WHEN** a Light Up board is dealt at 20% walls with 2-way rotational
  symmetry
- **THEN** its walls are the same after a half turn, and its answer lights
  every open square with no bulb lighting another

#### Scenario: A hidden number leaves its bare wall

- **WHEN** a board whose walls carry numbers is dealt, and a number is hidden
- **THEN** its game ID writes that wall as a bare wall, and a wall whose
  number is shown as its number, with no word of the description's

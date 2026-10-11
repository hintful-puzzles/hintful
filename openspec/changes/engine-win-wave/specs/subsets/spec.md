## MODIFIED Requirements

### Requirement: The completion flash lifts every slot

The completion flash SHALL sweep the cells diagonally, a cell's position being
its place in the grid. Every slot of a lit cell the player filled SHALL take
the lifted surface, and every slot of a lit cell the puzzle gave, which rests
on the lifted surface, SHALL take the plain one, so that every cell shows the
highlight. A lit slot SHALL keep its letter or cross.

#### Scenario: The flash lifts every slot

- **WHEN** a solved board is drawn while the flash is on a cell the player
  filled
- **THEN** no slot of that cell is the plain cell surface
- **AND** once the flash has left the cell its slots are the plain surface again

#### Scenario: A given cell

- **WHEN** the flash is on a cell whose set the puzzle gave
- **THEN** every slot of that cell is the plain cell surface
- **AND** once the flash has left the cell its slots are lifted again

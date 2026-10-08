## REMOVED Requirements

### Requirement: Subsets tells a slot's state by what it holds

**Reason**: A slot ruled out is a cross in every game (owner, 2026-10-08), and
one of this requirement's scenarios is named for the dot.
**Migration**: Replaced by "Subsets tells a slot's state by a letter, a cross
or nothing" in this change, which keeps every other rule unchanged.

## ADDED Requirements

### Requirement: Subsets tells a slot's state by a letter, a cross or nothing

`redraw` SHALL draw every letter slot of a cell the player fills on the
collection's cell surface, and every slot of a cell whose set the puzzle gave
on the collection's lifted surface of a given, with the collection's surface
grid line between the slots of a cell. A slot's state SHALL be what it holds
and never the surface under it: a letter marked present is drawn, in ink for a
given and in the entry color for the player's; a letter cleared holds the
collection's ruled-out cross; an unknown slot holds nothing. No state SHALL be
told by a step of gray.

On a lit beat of the completion flash every slot SHALL take the lifted surface,
a step that reads in both schemes, and keep its letter or cross. A tally entry
placed once and the idle inspect badge SHALL be drawn in the collection's color
for a clue that is used up.

#### Scenario: A given cell is told by the surface under it

- **WHEN** the opening frame is drawn
- **THEN** every slot of a given cell is the lifted surface and every other
  slot is the plain cell surface

#### Scenario: A cleared letter holds the cross

- **WHEN** the opening frame is drawn
- **THEN** each letter absent from a given set holds the ruled-out cross, and no
  unknown slot holds one

#### Scenario: The flash lifts every slot

- **WHEN** a solved board is drawn on a lit beat of the flash
- **THEN** no slot is the plain cell surface
- **AND** on the next unlit beat the player's slots are the plain surface again

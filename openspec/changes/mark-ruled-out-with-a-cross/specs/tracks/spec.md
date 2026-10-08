## REMOVED Requirements

### Requirement: Tracks draws its squares on the collection's quiet surface

**Reason**: It gave a square that carries track no tone and a brown block,
and a square with no track a dot. The owner (2026-10-08) asked for the cross
back and for the whole square to take a color again, and its scenarios are
named for the marks that are gone.
**Migration**: Replaced by "Tracks tells a square's state by its surface and a
cross" in this change. The surface grid, the given's lifted surface, the ink
rails and the cursor's thickness carry over unchanged.

## ADDED Requirements

### Requirement: Tracks tells a square's state by its surface and a cross

`redraw` SHALL draw a square the player has not decided on the collection's
cell surface, with the surface's grid line between squares one pixel wide at
every tile size and the frame round the grid no heavier. A square the puzzle
laid track in SHALL sit on the lifted surface of a given, and its rails SHALL
be the same ink rails the player's are: a given is told by the cell under it
and not by the color of its rail.

A square that carries track and is not a given SHALL be filled with the track
bed, a purple of the theme's first hue, whether it holds a whole piece of
rail, a rail end, or no rail yet, and SHALL hold no other mark for that
state. The bed SHALL differ in hue from the cell surface and from a given's
surface in both color schemes, so that "track here" is never a step of gray,
and a rail SHALL read on it in both. A square marked as holding no track
SHALL stay the cell surface and hold the collection's ruled-out cross, in the
ruled-out color. An edge marked as carrying no track SHALL hold a smaller
cross on the edge. The keyboard cursor's outline SHALL be at least two pixels
thick.

#### Scenario: Undecided, no track and track are told apart

- **WHEN** a board holds an undecided square, a square marked no-track and a
  square marked as track with no rail yet
- **THEN** the first two are the cell surface and the third is the track bed
- **AND** the first holds nothing, the second holds the ruled-out cross and
  the third holds nothing

#### Scenario: A square a given rail leads into is the bed

- **WHEN** a fresh board is drawn
- **THEN** each square a given rail's open end leads into is the track bed
  and holds no mark

#### Scenario: A given rail is the same rail

- **WHEN** a board holds a rail the puzzle laid and a rail the player laid
- **THEN** both rails are drawn in the same ink
- **AND** the puzzle's square is the lifted surface and the player's is the
  track bed

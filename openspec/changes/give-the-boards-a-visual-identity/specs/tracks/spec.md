## ADDED Requirements

### Requirement: Tracks draws its squares on the collection's quiet surface

`redraw` SHALL draw a square the player has not decided on the collection's
cell surface, with the surface's grid line between squares one pixel wide at
every tile size and the frame round the grid no heavier. A square the puzzle
laid track in SHALL sit on the lifted surface of a given, and its rails SHALL
be the same ink rails the player's are: a given is told by the cell under it
and not by the color of its rail.

A square the player has said carries track SHALL sit on the track bed, a step
above the cell surface, and SHALL hold a dot at its center until it has a rail,
so that "track here" is a mark and never the bed's tone alone. A square marked
as holding no track SHALL stay the cell surface and hold its cross. The
keyboard cursor's outline SHALL be at least two pixels thick.

#### Scenario: Undecided, no track and track are three marks

- **WHEN** a board holds an undecided square, a square marked no-track and a
  square marked as track with no rail yet
- **THEN** the first is plain cell surface, the second holds a cross and the
  third holds a dot on the track bed

#### Scenario: A given rail is the same rail

- **WHEN** a board holds a rail the puzzle laid and a rail the player laid
- **THEN** both rails are drawn in the same ink
- **AND** only the puzzle's square is the lifted surface

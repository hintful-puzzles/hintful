## ADDED Requirements

### Requirement: Tracks draws its squares on the collection's quiet surface

`redraw` SHALL draw a square the player has not decided on the collection's
cell surface, with the surface's grid line between squares one pixel wide at
every tile size and the frame round the grid no heavier. A square the puzzle
laid track in SHALL sit on the lifted surface of a given, and its rails SHALL
be the same ink rails the player's are: a given is told by the cell under it
and not by the color of its rail.

A square that carries track SHALL stay the cell surface, with no tone of its
own, and until it holds a whole piece of rail it SHALL hold a block at its
center, filled in the sleepers' color and edged in the rails', beside any rail
end that already reaches it, so that "track here" is a mark and never a step
of gray. A square marked as holding no track SHALL stay the cell surface and
hold the collection's ruled-out dot, in the ruled-out color, which a dot means
in every game that has one. An edge marked as carrying no track SHALL keep its
cross. The keyboard cursor's outline SHALL be at least two pixels thick.

#### Scenario: Undecided, no track and track are three marks on one surface

- **WHEN** a board holds an undecided square, a square marked no-track and a
  square marked as track with no rail yet
- **THEN** all three are the cell surface
- **AND** the first holds nothing, the second holds the ruled-out dot and the
  third holds the track block

#### Scenario: A square a given rail leads into is marked

- **WHEN** a fresh board is drawn
- **THEN** each square a given rail's open end leads into is the cell surface
  and holds the track block

#### Scenario: A given rail is the same rail

- **WHEN** a board holds a rail the puzzle laid and a rail the player laid
- **THEN** both rails are drawn in the same ink
- **AND** only the puzzle's square is the lifted surface

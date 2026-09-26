## ADDED Requirements

### Requirement: A piece a hint acts on is ringed as one shape

Where a hint step acts on a **piece** spanning several squares — a domino it
places, a domino it decides whole — the target mark SHALL be one ring around the
piece, drawing a side only where the square across it is not in the same piece,
rather than a ring per square with a double bar across the piece's middle.

The shared hint-mark painter SHALL own the drawing, and a game SHALL supply only
which squares belong together: a relation for the targets, and optionally one for
the evidence when the evidence is whole pieces, so that two pieces side by side
stay two shapes rather than one that is not on the board. Without a relation,
targets SHALL be ringed per square and evidence SHALL be outlined as one contour
per connected region, exactly as for a game with no pieces.

Because a join lets a square's sides change while its role does not, a game whose
mark lies inside the content box and that supplies a relation SHALL key each
square's repaint on the sides drawn around it rather than on its role alone.

#### Scenario: A domino placement is one ring

- **WHEN** a Dominosa hint step asks the player to place a domino
- **THEN** the target mark is one ring of six sides around its two squares
- **AND** a barrier step's two squares are still ringed one each, with the wall
  between them marked

#### Scenario: A domino decided whole is one ring

- **WHEN** a Magnets hint step decides a whole domino (neutral, or marked `?`)
- **THEN** the target mark is one ring of six sides around both ends, drawn by
  the shared painter rather than a pass of the game's own

#### Scenario: A game with no pieces is unchanged

- **WHEN** a game supplies no piece relation
- **THEN** each target square is ringed on all four sides and a contiguous
  evidence region is one contour

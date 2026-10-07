## ADDED Requirements

### Requirement: Light Up draws walls, bulbs and light on the collection's quiet surface

`redraw` SHALL draw an open square no bulb lights as the collection's cell
surface, with the collection's surface grid line between squares and a frame
round the grid no heavier than that line. A lit square SHALL keep its yellow
wash. A wall SHALL be a solid block in the collection's wall color, over its
whole tile, so that adjacent walls read as one block, with its clue in a white
that is the same in both schemes. A bulb SHALL be a disc in that same white,
outlined in a black that is the same in both schemes, so it reads on a lit and
an unlit square alike. The mark for a square that cannot hold a bulb SHALL be
the collection's ruled-out dot. The clue a hint reasons from SHALL keep its
white digit and be ringed at its wall's edge in the collection's evidence
color, with a line in the digit's white inside the ring. The game's words (its
help page and its Custom dialog) SHALL call the square a wall, never a black
square.

A clue that is provably wrong and a bulb another bulb lights SHALL be drawn in
the full error color, which stands off a wall in both schemes. The
keyboard cursor SHALL be brackets at the corners of its square, clear of a
bulb. The completion flash SHALL blink the lit squares to the lifted surface.

#### Scenario: An unlit square is surface and a lit one is washed

- **WHEN** a board with one bulb is drawn
- **THEN** the squares the bulb lights are filled with the lit wash
- **AND** every other open square is the cell surface

#### Scenario: A wrong clue reads on its wall in the dark scheme

- **WHEN** a numbered wall has more adjacent bulbs than its clue
- **THEN** its number is drawn in the error color, not that color's wash

## MODIFIED Requirements

### Requirement: Light Up renders with live error feedback

`redraw` SHALL draw: walls (numbered ones showing their clue,
in the error color when the clue is provably wrong — too many adjacent
bulbs, or too few even if all plausible neighbors were filled); open squares
with lit squares filled yellow; bulbs as circles (error-colored when lit by
another bulb); impossible-marks as the collection's ruled-out dot — suppressed
on lit squares when the `show-lit-blobs` preference (default on, via the
`Game.prefs` hook) is off; the keyboard cursor; and the 3-phase completion
flash. The per-tile packed flags SHALL be the render cache key (`Int32Array`),
and every overlay not in the packed value (the `findMistakes` highlight) SHALL
be in a sidecar included in the diff key. The palette SHALL keep its indices
fixed (0 background, 1 grid, 2 wall, 3 light, 4 lit,
5 error, 6 cursor) because the app's dark-mode overrides target indices 2
and 3.

#### Scenario: Overlapping bulbs render as errors

- **WHEN** two bulbs light each other
- **THEN** both are drawn in the error color

#### Scenario: A provably-wrong clue turns red

- **WHEN** a numbered wall has more adjacent bulbs than its clue
- **THEN** its number is drawn in the error color

#### Scenario: Lit blobs honor the preference

- **WHEN** a marked square becomes lit and `show-lit-blobs` is off
- **THEN** the blob is not drawn (and reappears when the preference is
  re-enabled)

# ts-engine — delta

## ADDED Requirements

### Requirement: An on-screen key may name a palette color

A `KeyLabel` MAY carry a `swatch`: an index into the palette of the game that
returned it. The app SHALL paint such a key in that color, resolved against the
**same** palette the canvas is painted from, so a key and the board cannot
disagree under any color scheme. A key without a `swatch` SHALL be rendered
exactly as before.

This exists because a game whose element is a color has no character that names
it. A bare `"1"` asks the player to learn which color one *is*, which is the one
thing the panel exists to spare them. The `label` SHALL still carry the
character the key sends, so the swatch teaches the keyboard binding rather than
replacing it.

The resolved palette SHALL be published from the single point that hands it to
the drawing, rather than recomputed for the panel: a second derivation is a
second thing to keep true, and the failure is silent — a key in last scheme's
color still looks like a key.

The label's ink SHALL be chosen from the fill's own lightness rather than fixed.
A palette is authored per scheme, and a fill light enough to take black text in
one scheme is not in the other.

A keypad of color keys SHALL be built by a shared builder alongside `digitKeys`,
not spelled out in the game. The button codes are the decimal-digit fact, which
the engine states exactly once and no game restates.

#### Scenario: A color key is painted from the board's own palette

- **WHEN** a game returns a `KeyLabel` with a `swatch`
- **THEN** the on-screen key is painted in the color that palette index holds,
  and follows it when the color scheme changes

#### Scenario: An ordinary key is untouched

- **WHEN** a game returns a `KeyLabel` with no `swatch`
- **THEN** the key carries no color of its own

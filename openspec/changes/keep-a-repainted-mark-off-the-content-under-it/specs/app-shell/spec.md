## ADDED Requirements

### Requirement: A repainted mark reads on the content under it

A hint reference's marks, repainted in the reference's color, SHALL read on
every color a game draws under them, in both schemes, by one treatment the
app applies to every game. No game SHALL choose its references' colors.

#### Scenario: An outlined group of Samegame pieces

- **WHEN** a Samegame hint outlines a group of green pieces
- **THEN** the outline is told from the pieces it surrounds, in light and in
  dark

#### Scenario: Stripes under a game's content

- **WHEN** a hint stripes a row whose squares hold glyphs
- **THEN** the stripes' edge lies within their bands, and no glyph is
  painted over

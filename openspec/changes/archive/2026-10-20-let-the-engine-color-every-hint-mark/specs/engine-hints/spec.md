## ADDED Requirements

### Requirement: An evidence area is outlined, never washed

An evidence area SHALL be outlined and never washed, in every game: its cells
carry what the player reads, and even an empty cell's surface is part of its
premise. An outline in the outline ink reads on any content once the engine
edges it, where a wash in that ink would cover the cell.

#### Scenario: Evidence cells that hold nothing

- **WHEN** a step reasons from cells that hold nothing, as Light Up's unlit
  squares
- **THEN** they are outlined, and keep their own surface

## MODIFIED Requirements

### Requirement: A legend color is never the only cue

A reference's color SHALL be paired with a non-color cue (ring against
outline against stripes, the drawn digit or clue, or position) so that what a
mark stands for survives for colorblind players. Color SHALL NOT be the sole
carrier, and a color's name SHALL NOT appear in a sentence or in the help's
list of marks.

#### Scenario: Two kinds of element are highlighted in one step

- **WHEN** a displayed step marks two kinds of element
- **THEN** each is also told apart by a distinguishing non-color cue

### Requirement: The palette carries no fill for the acted-on color

The palette SHALL carry no fill counterpart to the acted-on color. A fill
behind content cannot be rescued by choosing a different color: a wash pale
enough to keep a pencil mark legible is invisible on the dark board, and the
only hues that clear it sit beside `ERROR_WASH`, which would make the cell a
hint points at resemble the cell that is wrong.

#### Scenario: A change proposes a retuned target fill

- **WHEN** a change proposes filling the acted-on cell in a retuned hint color
- **THEN** it is answered with this requirement, and the palette gains no fill
  for that role

### Requirement: A recolored clue is an outline reference

A clue drawn recolored is a glyph for a role, not a role of its own: a clue the
step reasons from SHALL be an outline reference, and SHALL be drawn in the
outline's ink.

#### Scenario: A step reasons from a clue the game recolors

- **WHEN** a game recolors a clue a step reasons from
- **THEN** the step's words refer to that clue as outlined, and the game draws
  it in `HINT_OUTLINE`

## REMOVED Requirements

### Requirement: A hint naming several kinds of element colors them by a stable legend

**Reason**: The engine colors each reference of a step's words, and a game's
marks take its role's ink; a per-game legend of colors is never on the screen
(app-shell requirement "The engine colors every hint mark").

**Migration**: Two kinds of element are two references, told apart by their
nouns and their marks' shapes.

### Requirement: An evidence wash is kept only where nothing is drawn on it

**Reason**: Light Up, the one game that washed its evidence, outlines it; the
outline ink is a mark's color, and a wash in it would cover the cell.

**Migration**: Requirement "An evidence area is outlined, never washed".

### Requirement: An evidence mark on a border takes a bold step

**Reason**: A game no longer chooses its evidence color; the outline ink is
the engine's, held to a mark's bars on every surface in both schemes.

**Migration**: A game draws its outlines in `HINT_OUTLINE`.

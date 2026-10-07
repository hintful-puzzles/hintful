## ADDED Requirements

### Requirement: Pattern draws its picture as shaded pieces on a quiet surface

`redraw` SHALL draw the board as pieces on a quiet surface. A `Full` cell (the
one the other requirements call black, after upstream) SHALL hold the
collection's shaded piece, in the shaded color and shape, inset on its cell. A
cell marked `Empty` SHALL be plain surface holding the ruled-out dot, with no
fill of its own, and an `Unknown` cell SHALL be plain surface holding nothing:
the three states SHALL NOT be told apart by a step of gray. The lines between
cells and the frame round the grid SHALL be the surface's quiet grid color,
the frame no heavier than a line inside it, with a doubled line every fifth
cell. The clue numbers SHALL stay in the ink color.

The game SHALL name no hue of its own: its hint sentences, its control words
and its hint-mark legend SHALL say the engine's word for the shaded piece and
its word for a cell known not to be shaded, and its help page SHALL name the
shaded color by placeholder.

The Check & Save mistake outline SHALL sit at the cell's edge, beside the
piece.

#### Scenario: The three states are a piece, a dot and nothing

- **WHEN** a board holding a `Full` cell, an `Empty` cell and an `Unknown` cell
  is drawn
- **THEN** all three cells are filled with the one surface color
- **AND** the `Full` cell holds the shaded piece, the `Empty` cell a dot, and
  the `Unknown` cell nothing

#### Scenario: A hint names the shaded piece by the engine's word

- **WHEN** a hint step concludes that cells must be `Full`, or must be `Empty`
- **THEN** its sentence says the engine's word for the shaded piece, or its
  word for a cell known not to be shaded

## MODIFIED Requirements

### Requirement: Pattern hint color legend

The displayed hint SHALL render forced cells in `COL_HINT` as a ring only,
never pre-drawing the piece or the dot the move would place (the cell's own
state stays visible and the narration says which it must be). Premise elements
SHALL follow the stable element-type color legend, each color paired with a
non-color cue and never named in the narration text: the reasoned-about line's
clue drawn in `COL_HINT` and its line of sight hatched in it; a cited
already-placed **full** cell outlined `COL_HINT_BLACKREF` and a cited **empty**
cell outlined `COL_HINT_WHITEREF`, each outline at the cell's edge, beside the
piece or the dot, so it never hides what the cell holds. Hint overlay bits
SHALL be folded into the per-cell render cache key so they repaint on the
frame they are shown.

#### Scenario: Forced cells are highlighted, not pre-filled

- **WHEN** a hint step targeting cells the player must shade is displayed
- **THEN** those cells are ringed in `COL_HINT` and their prior (undecided)
  state is still visible — the piece is not pre-rendered

#### Scenario: Premise marks are ringed by their color

- **WHEN** a hint cites an already-placed full cell and an already-placed empty
  cell as evidence
- **THEN** the full cell is outlined in the black-reference color and the empty
  cell in the white-reference color, each leaving the cell's own content
  visible

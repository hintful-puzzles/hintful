## ADDED Requirements

### Requirement: Clusters draws its two colors as the collection's two-state pair

`redraw` SHALL draw the board as pieces on a quiet surface. The two colors a
cell can take (the ones the description and the input requirements call red
and blue, after upstream) SHALL be the two members of the collection's
two-state pair: the color the primary button gives is the first member and the
other is the second, each drawn in that member's color and shape, inset on its
cell. A given SHALL sit on a lifted surface and carry its dot on its piece. The
game SHALL name no hue of its own for either color: its hint sentences and its
control words SHALL say the pair's words, and its help page SHALL name them by
placeholder.

The cell a hint acts on SHALL be ringed in the collection's hint-action color,
which neither piece is drawn in. A what-if cell of a chain SHALL carry a piece
of the color it would be forced to, smaller than any placed piece.

#### Scenario: A hint names the color the piece is drawn in

- **WHEN** a hint step concludes that a cell must take one of the two colors
- **THEN** its sentence says that member's word from the pair
- **AND** applying the step draws that member's piece in the cell

#### Scenario: A what-if piece cannot be taken for a placed one

- **WHEN** a chain hint is displayed
- **THEN** each what-if cell holds a piece less than half as wide as a placed
  piece

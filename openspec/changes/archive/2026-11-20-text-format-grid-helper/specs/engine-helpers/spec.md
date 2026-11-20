## ADDED Requirements

### Requirement: The engine writes a grid's plain-text board

The engine SHALL provide `gridText` and `boxedGridText` in
`src/engine/grid-text.ts`, which write a grid's plain-text board from the
text the game gives for each place: its cells, what goes between two cells
of a row, a line between two rows, and each line's ends, or for a boxed grid
its cells, edges and corners. A game whose `textFormat` is a walk over its
grid's places SHALL write it with them, and one whose text is not SHALL say
why at its `textFormat`.

#### Scenario: A game writes its board as cells in rows

- **WHEN** a game calls `gridText(w, h, cell, { across: " " })`
- **THEN** the text is `h` lines, line `y` holding `cell(x, y)` for each `x`
  with a space between two
- **AND** each line ends in a newline

#### Scenario: A boxed grid has a rim round every cell

- **WHEN** a game calls `boxedGridText(w, h, { corner, top, left, cell })`
- **THEN** the text alternates a line of corners and top edges with a line of
  left edges and cells, from the top rim to the bottom rim
- **AND** the bottom rim is `top(x, h)` and the right rim `left(w, y)`

## ADDED Requirements

### Requirement: ABCD draws its letters on a quiet surface

`redraw` SHALL draw every cell of the letter grid on the collection's cell
surface, with the collection's surface grid line between cells and as the frame
round the grid. The grid holds no given letters, so no cell takes the lifted
surface of a given; the clues stay on the board, outside the surface. The
corner marks that show diagonal touching is disallowed are a rule and SHALL
keep their own color.

The selection's wash and its pencil-mode corner SHALL be drawn over the cell's
surface. The hint's marks SHALL stay on the cell's border.

#### Scenario: The grid recedes

- **WHEN** a board is drawn
- **THEN** every cell of the letter grid is the cell surface
- **AND** every cell's border is the surface grid line

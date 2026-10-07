## ADDED Requirements

### Requirement: Salad draws its squares on a quiet surface, with a given's lifted

`redraw` SHALL draw every square the player fills on the collection's cell
surface, and every square the puzzle filled (a given character, ball or cross)
on the collection's lifted surface of a given, so that a given is told by the
square under it as well as by its ink. The line between squares and the frame
round the grid SHALL be the collection's surface grid line. The border clues
stay on the board, outside the surface.

The selection's wash and its pencil-mode corner SHALL be drawn over whichever
surface the square has, and a ball drawn round a character SHALL show that
surface through it. The hint's marks SHALL stay on the square's border.

#### Scenario: A given is told by the square under it

- **WHEN** a board with given squares is drawn
- **THEN** each given's square is the lifted surface
- **AND** every other square is the cell surface, bordered by the surface grid
  line

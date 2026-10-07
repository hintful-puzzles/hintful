## ADDED Requirements

### Requirement: Net draws its tiles on a quiet surface and lifts a locked one

`redraw` SHALL draw a tile the player may still turn on the collection's cell
surface, with the surface's grid line between tiles and no heavier frame round
the grid; a wall keeps its own color and weight, since it is content. A locked
tile SHALL sit on the collection's lifted surface, the one a given sits on
elsewhere, since a locked tile is one the player has fixed: locked is told by
a surface the collection names and never by a step of gray of the game's own.
The strip outside the grid, where only a wall's outline lands, SHALL stay the
board.

The completion flash SHALL lift each tile in turn as its ripple passes, the
same surface a lock gives. The keyboard cursor, the note pin and a hint's ring
SHALL stay rings inside the tile's edge, over whichever surface the tile has.

#### Scenario: A locked tile is the lifted one

- **WHEN** a board is drawn with one tile locked
- **THEN** that tile's surface is the lifted surface and every other tile's is
  the cell surface

#### Scenario: An untouched board has no lifted tile

- **WHEN** a freshly dealt board is drawn
- **THEN** no tile is drawn on the lifted surface

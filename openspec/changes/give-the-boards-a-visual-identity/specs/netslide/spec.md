## ADDED Requirements

### Requirement: Netslide draws its tiles on a quiet surface

`redraw` SHALL draw each tile's face as the collection's cell surface, with
the surface's grid line as the tile's border, so the grid of tiles stands a
step off the board that holds the slide arrows. A wall keeps its own color and
weight, since it is content. A tile carries no bevel, and a tile in motion
SHALL be drawn with the same face and border as one at rest.

The completion flash SHALL lift a tile to the collection's lifted surface on
its lit beats, the surface Net lifts its tiles to, a step that reads in both
schemes. The slide arrows SHALL stay on the board, outlined in ink.

A wire and an endpoint SHALL be drawn at the weight Net draws them at the same
tile size: the wire's width and the endpoint's outline scale with the tile, and
a powered wire is a core of the powered color inside the ink.

#### Scenario: The network is as heavy as Net's

- **WHEN** a board is drawn at a tile size at which Net's wires are several
  pixels wide
- **THEN** Netslide's wires are that wide, and are not hairlines

#### Scenario: A tile's face is the cell surface

- **WHEN** a board is drawn at rest
- **THEN** every tile's face is the cell surface inside a border in the
  surface's grid color

#### Scenario: The flash lifts the tiles

- **WHEN** a frame of the completion flash is drawn
- **THEN** the tiles on a lit beat are drawn on the lifted surface

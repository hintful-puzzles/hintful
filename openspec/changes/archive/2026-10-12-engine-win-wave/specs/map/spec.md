## MODIFIED Requirements

### Requirement: Map's preferences

The two preferences number-regions and stipple display style SHALL be exposed
through the `prefs` hook under the keywords `show-numbers` and
`stipple-style`. The `l`/`L` key SHALL toggle region numbers in play.

#### Scenario: A key shows and hides the region numbers

- **WHEN** the region numbers are hidden and `l` is pressed during play
- **THEN** the region numbers are shown, and pressing it again hides them

### Requirement: What Map draws

`redraw` SHALL render region fills, the diagonal second-region triangle of a
split cell, pencil-mark stipples, grid lines on region boundaries, the red
adjacency error diamonds, optional region numbers, the flagged-mistake region
outline, the selected region's band, the floating drag blob while a color or
its marks are carried, and the completion flash.

#### Scenario: A split cell shows both of its regions

- **WHEN** a cell divided diagonally between a colored region and another
  region is drawn
- **THEN** each triangle of the cell takes its own region's fill

### Requirement: Map draws an uncolored region on the collection's quiet surface

`redraw` SHALL fill a region that has no color with the collection's cell
surface, so the map reads as a field apart from the board round it and the
four fills are all the color on it. The four fills and the ink region borders
are the game and SHALL stay as they are. The drag blob that carries "no color"
SHALL take the same surface.

#### Scenario: An uncolored region is the cell surface

- **WHEN** a board with an uncolored region is drawn
- **THEN** that region is filled with the cell surface
- **AND** a colored region beside it keeps its fill, with the ink border
  between them

## ADDED Requirements

### Requirement: The Map completion flash sweeps the regions

The completion flash SHALL sweep the map by region: the regions SHALL light in
the order of the points their numbers are drawn at along the diagonal, one
place apart however far apart the points are, and the whole of a lit region
SHALL be filled with a flash color and keep its border and its number.
The selected region's band SHALL be hidden while the flash plays.

#### Scenario: A region that spans the sweep

- **WHEN** a region reaches from one side of the map to the other and the
  highlight is on it
- **THEN** every cell of it is one flash color in that frame, a split cell's
  triangle included, and none of it is in a frame where the highlight is not

## REMOVED Requirements

### Requirement: The flash-type preference chooses how a solved map flashes

**Reason**: The win flash is one traveling highlight in every game
(`ts-engine`, "The win flash is one traveling highlight in every game"), so
there are no styles to choose between.

**Migration**: None. A stored `flash-type` preference names a key the game
does not declare, and is not applied.

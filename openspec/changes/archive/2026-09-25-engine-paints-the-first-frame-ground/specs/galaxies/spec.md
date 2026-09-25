## MODIFIED Requirements

### Requirement: Galaxies rendering, animation, and text format

Galaxies SHALL render the subcell grid, region fills colored by the
completion check (a locally-valid region — symmetric about its single
dot — is filled in its dot's color; associations do not color
tiles), white and black dots, set edges, association arrows from each
associated tile to its dot, and the keyboard cursor through
`GameDrawing`. A dot move on the board SHALL animate the dot along
its shortest path (upstream's `movedot_cb`).
Completion SHALL trigger a flash. The game SHALL provide a statusbar
string reporting move count, completion state, and current-puzzle
difficulty when known, and a plain-text format of the board. Colors
SHALL be derived from the supplied default background; the Galaxies
`redraw` SHALL paint its outer border in the `!ds.started` branch, over
the ground the midend lays.

An in-progress association drag SHALL preview **discretely**: the
pointer's snapped drop-target tile and its 180° partner about the
drag dot — exactly the pair a release would commit — each showing an
arrow toward the dot in a transient color distinct from committed
arrows, with the drop target itself additionally outlined. A target
where a release would not commit SHALL show no preview. Every pixel
any transient overlay paints — the drag preview and the keyboard
cursor alike — SHALL be clipped to a tile and erased by that tile's
own repaint when it moves on: no paint outside the board, no stale
frames, and no full-board update per pointer move.

Both transient affordances SHALL use **authored** colors rather than
colors derived from the board, because a color derived from the
board is by construction not prominent against it, in either scheme.

While a cell→dot drag is in progress, every dot the cell could
legally join SHALL be ringed and the picked one emphasized — subject
to a preference, because it is a solving aid. The **gesture** SHALL
NOT be gated by that preference.

#### Scenario: Galaxies renders and animates through the engine

- **WHEN** Galaxies is played through the app
- **THEN** moves render correctly, dot moves animate along their
  path, completion flashes, the statusbar shows move count /
  completion / difficulty wording, and the palette is derived from
  the host background
- **AND** the board has a correct plain-text representation
- **AND** no pixel is painted outside what Galaxies' `redraw`
  declares

#### Scenario: The drag preview tracks discretely and cleans up after itself

- **WHEN** the player drags from a dot across several tiles and
  releases
- **THEN** at each snapped target the preview shows the target's
  arrow (outlined tile) and its 180° partner's arrow in the transient
  color, tiles the preview vacates repaint clean, and after the
  release no preview paint remains anywhere — including outside the
  board, where nothing repaints

#### Scenario: The keyboard cursor cleans up after itself too

- **WHEN** the player walks the cursor across vertices and edges
- **THEN** each cell it leaves repaints clean, and hiding the cursor
  leaves no mark anywhere on the board

#### Scenario: An uncommittable target previews nothing

- **WHEN** the drag's snapped target is a tile where a release would
  not commit (a dot tile, a tile whose 180° partner is off the board,
  or a tile inside a locally-valid region)
- **THEN** no preview is drawn — the absence is the feedback

#### Scenario: Candidate dots are ringed, and can be switched off

- **WHEN** a cell→dot drag is in progress
- **THEN** exactly the dots a release could legally commit to are
  ringed, the picked one more heavily, and the rings are erased when
  the drag ends
- **AND WHEN** the candidate preference is off
- **THEN** no rings are drawn, and the drag and its commit preview
  are unaffected

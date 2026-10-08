## MODIFIED Requirements

### Requirement: Galaxies solver and play

The Galaxies solver SHALL implement the upstream difficulty-graded
deduction chain — `solver_obvious`, lines-opposite,
spaces-oneposs, expand-from-dot, extend-exclaves — and, for
`Unreasonable`, bounded recursion. It SHALL return one of
the `GalaxiesDiff` verdicts `Normal` (solvable at the Easy tier),
`Unreasonable`, `Ambiguous`, `Impossible`, or `Unfinished`. `executeMove` SHALL be pure (return a new state) for
every move type: edge toggle (`E`), add-association during a drag
(`A`/`a`), remove-association with opposite (`U`), dot-hold toggle
(`M`), and solver application (`s`). Moving the keyboard cursor
SHALL redraw without adding a history entry. The game SHALL report
`solved` when every edge-bounded component matches its dot's
associations under the required symmetry; the status SHALL be
upgraded to `solved-with-help` if the solver was used to get there.

The association drag SHALL be reachable from **either** mouse button
and from the keyboard, and SHALL run in **either direction** — from a
dot out to a cell, or from a cell back to the dot that owns it.
Because the left button carries both meanings, a left press SHALL be
resolved by what follows it: a release close to the press toggles an
edge, and travel beyond a small slop starts a drag from the press
point instead. That drag is the association drag, unless the press
landed on an edge's line with no dot under it: then it SHALL toggle
every edge the pointer passes the middle of that held what the pressed
edge held, the pressed edge first, turning corners freely, as one
step of Undo. A press that ends far from where it began
SHALL commit nothing at all — that is the shape the frontend's
pointer-cancellation synthesizes, and it must not toggle an edge on
the far side of the board.

#### Scenario: Solving and completion

- **WHEN** the player completes the partition matching every dot's
  associated tiles
- **THEN** the game status becomes `solved`
- **AND** if the built-in solver was used to get there it is
  `solved-with-help`

#### Scenario: Unsolvable hand-entered position

- **WHEN** the solver runs on a position with no consistent
  association
- **THEN** it reports `Impossible` rather than returning a move

#### Scenario: Drag-to-associate commits the previewed pair

- **WHEN** the player presses on or near a dot (or on a tile with an
  existing arrow), drags, and releases
- **THEN** the release commits the snapped target the preview showed —
  the target tile and its 180° partner associate to the dot as one
  move, and undo reverses it as one step
- **AND** a release where nothing can commit (the source, off the
  board, or an uncommittable tile) removes the dragged arrow if one
  existed and otherwise adds **no** history entry

#### Scenario: The left button distinguishes a click from a drag

- **WHEN** the player presses the left button and releases it without
  moving
- **THEN** the nearest legal edge toggles, exactly as a left click
  always has
- **AND WHEN** the player presses inside a tile, away from its edges,
  and then moves beyond the slop
- **THEN** an association drag begins from the press point and the
  release commits it, toggling no edge
- **AND WHEN** the player presses on an edge's line and drags along
  the grid past the middles of two more edges with no line
- **THEN** all three edges gain a line, the release toggles nothing
  more, and one Undo removes all three

#### Scenario: Only an association some galaxy could contain is offered

- **WHEN** the player aims a drag at a (cell, dot) pair
- **THEN** it is offered only if the cell is reachable from the dot by a
  connected, 180°-symmetric region that avoids every other dot's own
  tiles — the rules of a galaxy, applied to the offer
- **AND** the check SHALL depend on the dot layout alone, not on the
  player's own walls or arrows, so that it can never refuse an
  association the puzzle's solution contains and one mistake cannot
  silently veto a correct arrow elsewhere
- **AND** it SHALL go no further than those rules: running the deduction
  chain would narrow the offer towards the unique solution, which is not
  an aid but an answer

#### Scenario: A drag from a cell finds its dot

- **WHEN** the player drags from a tile that has no dot and no arrow
- **THEN** the tile stays put and the pointer picks the dot: it snaps
  to the nearest dot within reach that a release could legally
  associate this tile with, and none when there is no such dot in
  reach
- **AND** the release commits that tile and its 180° partner to the
  picked dot as one move, or nothing at all if no dot was picked
- **AND** a press on a tile that already carries an arrow keeps its
  existing meaning — the arrow is picked up and carried elsewhere

#### Scenario: A bare right click on an empty cell does nothing

- **WHEN** the player right-clicks an empty tile without dragging
- **THEN** nothing is committed — the cell→dot gesture is a drag, and
  a click must not silently associate a cell with whichever dot
  happens to be nearest

#### Scenario: The keyboard reaches both drag directions

- **WHEN** the player selects a plain tile with the cursor
- **THEN** a cell→dot drag begins, the cursor keys pick the dot by
  landing on it, and a second select commits the pair

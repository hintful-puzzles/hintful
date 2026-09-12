## MODIFIED Requirements

### Requirement: Galaxies parameters and presets

Galaxies SHALL support a width, a height, and a difficulty of
`Easy` or `Unreasonable`. It SHALL offer the presets 7×7, 10×10,
15×15 in each of Easy and Unreasonable. Parameter decoding SHALL
accept the upstream lenient forms (`"7"` ⇒ 7×7, `"7x7"`, optional
trailing `dn`/`du` for difficulty, the `n` kept from upstream's name for the
Easy tier); encoding SHALL round-trip a
decoded parameter set. Invalid parameters (width or height < 3, or
unreasonably large) SHALL be rejected with a human-readable reason.

#### Scenario: Preset and game-ID parameters select a board

- **WHEN** a Galaxies preset or a `params:desc` / `params#seed` game
  ID is chosen
- **THEN** the engine produces a Galaxies board of the requested
  size and difficulty
- **AND** `"7"`, `"7x7"`, `"7x7dn"`, and `"7x7du"` all decode to the
  expected parameters

### Requirement: Galaxies generates uniquely-solvable boards at the requested difficulty

For every preset, `newDesc` SHALL produce a board whose layout of
dots admits exactly one valid tile-to-dot association under
180°-rotational-symmetry-around-each-dot, and whose minimum solver
difficulty matches the requested `Easy` or `Unreasonable`. The
generator SHALL retry until the solver-verified difficulty matches;
boards that the solver diagnoses as `Ambiguous`, `Impossible`, or
at a different difficulty than requested SHALL NOT be returned.

#### Scenario: Generated boards are uniquely solvable at the right difficulty

- **WHEN** a Galaxies board is generated for any preset
- **THEN** the TS solver run at the requested difficulty completes
  the board
- **AND** the solver diagnosis is exactly the requested difficulty
  (neither lower, nor `Ambiguous`, nor `Impossible`)

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
edge, and travel beyond a small slop starts an association drag from
the press point instead. A press that ends far from where it began
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
- **AND WHEN** the player presses and then moves beyond the slop
- **THEN** an association drag begins from the press point and the
  release commits it, toggling no edge

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

## REMOVED Requirements

### Requirement: Galaxies offers a deduction-based hint in association vocabulary

**Reason**: Its tier-naming sentence and one scenario heading name the Easy tier
by its retired word, Normal, and a scenario heading cannot be renamed inside a
`MODIFIED` block.

**Migration**: Restated whole, with the tier named Easy, as "Galaxies explains its deductions in association vocabulary".

### Requirement: Galaxies is served by the native TS engine

**Reason**: It specified a per-game hybrid that no longer exists — every other
catalog game loading through C/WASM, and the deletion of `puzzles/galaxies.c` —
and there is no C engine, no `puzzles/` directory and no unported game left for
the scenario to describe.

**Migration**: What is still true is restated as "Galaxies is registered in the
engine registry".

## ADDED Requirements

### Requirement: Galaxies is registered in the engine registry

The `galaxies` puzzle SHALL be implemented as a native TS `Game`
registered in the engine registry, so the worker serves `galaxies`
via the TS midend.

#### Scenario: Galaxies loads on the TS engine

- **WHEN** the app opens `galaxies`
- **THEN** it is constructed by the TS-midend-backed puzzle

### Requirement: Galaxies explains its deductions in association vocabulary

Galaxies SHALL implement the engine's `hint()` hook as a recorded
projection of its own solver: the same difficulty-graded deduction chain
that generates and solves boards runs with a recorder, and each recorded
firing becomes one narrated hint journey meeting the collection's hint
quality bar (explain *why* the association is forced — the blocked
symmetric partner, the only dot whose symmetry can reach the tile —
never merely *what* to do).

A step's action SHALL be a move the game already has: the committed
association, or the wall that a settled pair of neighbors forces. A
firing that claims a cell SHALL claim its 180° partner in the **same
step** — the game commits the pair atomically, so a separate leg for the
partner would be a move that changes nothing — and the narration SHALL
state the symmetry as the reason they travel together. Because
associations alone never complete a board (only walls do), the plan
SHALL carry the deduction through to the walls it justifies, and SHALL
reach a solved board from any position it is asked from.

Evidence SHALL be highlighted as an area in the hint color legend, dots
SHALL be named by properties the player can see, rule-outs SHALL be
shown as evidence highlights rather than demanded of the player, and
equivalent moves SHALL share a color. The hint's action color SHALL be
distinct from the association drag's, which marks the same objects — a
dot and a cell — while the player follows a hint.

The hint SHALL couple to mistake checking: a request on a board with any
flagged mistake (tile or wall) refuses with the banner and lights the
mistakes instead. A stored plan SHALL survive the player working ahead:
a step whose tile the player has meanwhile associated is refreshed away
and the plan advances. Every step the hint offers SHALL be a deduction the player could make
from the board in front of them. It SHALL NOT guess: where the remaining
progress can only be found by hypothesizing a cell's dot and propagating
until something breaks, the hint SHALL refuse, and the refusal SHALL say
that deduction has run out and what the player can do instead. An Easy
board SHALL be carried all the way to solved by deduction alone; only an
Unreasonable board may reach that refusal, which is what the tier means.
Galaxies SHALL be enrolled in the cross-game hint guards
(`testing/hint-games.ts`).

#### Scenario: A forced association is taught as one step

- **WHEN** the player requests a hint on a board where a deduction forces
  a tile's dot
- **THEN** one step is shown whose narration states the forcing reason
  and whose single move associates both the tile and its 180° partner
- **AND** the evidence area and the action are drawn in the hint legend's
  two colors, neither of them the drag preview's

#### Scenario: The plan finishes the board, not just the notation

- **WHEN** hints are followed one at a time from a fresh board
- **THEN** the plan draws the walls its associations justify and reaches a
  solved board

#### Scenario: Refusal on a mistaken board

- **WHEN** a hint is requested while any tile or wall contradicts the
  unique solution
- **THEN** the hint refuses with the banner and the mistake overlay
  lights the offenders

#### Scenario: The plan survives the player committing ahead

- **WHEN** a hint journey is displayed and the player directly commits
  the association it was leading to
- **THEN** the resolved step is dropped without being shown as stale and
  the plan advances (recomputing only if it drains)

#### Scenario: Deduction running out is said plainly, not guessed past

- **WHEN** the remaining progress can only be found by trying a cell's dot
  and following it until something breaks
- **THEN** the hint refuses, saying that nothing further follows by
  deduction and that the position can be tried from a saved checkpoint —
  it does not report the survivor of a search as though it were a
  technique

#### Scenario: An Easy board is always finished by deduction

- **WHEN** hints are followed from a fresh board at the Easy tier
- **THEN** every step is a deduction whose premise is visible on the board
  as it stands, and the board reaches solved
